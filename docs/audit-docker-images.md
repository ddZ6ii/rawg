# Docker Image Vulnerability Scanning

## Table of Contents

- [📋 Overview](#overview)
- [🚀 Decisions Summary](#decisions-summary)
- [🤔 Context](#context)
- [🔄 Updated Pipeline](#updated-pipeline)
- [🧱 New Step Sequence](#new-step-sequence)
- [⚙️ Trivy Configuration](#trivy-configuration)
  - [Viewing results in GitHub actions](#viewing-results-in-github-actions)
  - [Key options](#key-options)
- [🗒️ Allowlist](#allowlist)
- [🔍 Local Pre-Flight Scan](#local-pre-flight-scan)
- [🧑‍🔧 Fixing vulnerabilities](#fixing-vulnerabilities)
  - [Strategy](#strategy)
  - [Upgrading OS packages](#upgrading-os-packages)
  - [If findings remain after upgrading](#if-findings-remain-after-upgrading)

## <a id="overview"></a>📋 Overview

Docker vulnerability scanning for both staging and production images using Trivy as a free open-source tool

## <a id="decisions-summary"></a>🚀 Decisions Summary

| Decision          | Choice                              | Rationale                                                                                                                                                                                                                                                                                                              |
| ----------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scanner**       | Trivy (`aquasecurity/trivy-action`) | Free, open-source, no external account, broad CVE coverage (OS packages + app deps), widest GitHub Actions adoption                                                                                                                                                                                                    |
| **Target images** | Both staging and production         | Both are deployed to real servers (staging VPS + production VPS) — both are live attack surfaces                                                                                                                                                                                                                       |
| **Severity gate** | HIGH + CRITICAL (CVSS ≥ 7.0)        | Consistent with the existing audit-deps threshold; LOW/MEDIUM excluded to avoid noise. Trivy's severity is vendor/distro-assigned (Alpine SecDB, GHSA advisories) rather than a strict CVSS-base-score cutoff — a reasonable approximation for policy consistency, but not identical in mechanism to `audit-ci`'s gate |
| **Placement**     | After build, before push            | A vulnerable image never reaches Docker Hub                                                                                                                                                                                                                                                                            |
| **Results**       | GitHub Actions job summary          | Zero-setup, visible inline in the workflow run UI                                                                                                                                                                                                                                                                      |

## <a id="context"></a>🤔 Context

The CI/CD workflow builds and pushes **two** Docker images — `frontend` and `api` (backend) — for both **staging** and **production**. rawg is a frontend + Express backend split behind an nginx gateway (see [VPS setup](https://github.com/ddZ6ii/vps-infra/blob/main/docs/vps-setup.md)'s per-app-gateway pattern): the backend holds the RAWG API key server-side and proxies + caches requests, so the frontend bundle never ships the key. Since both environments are deployed to a real server (VPS), both are live attack surfaces and therefore need **first to be built and scanned prior to being pushed**

> ⚠️ A compromised staging environment can still leak data or be used as a pivot point

Both `staging.yml` and `release.yml` call the same composite action ([`.github/actions/build-push-docker/action.yml`](../.github/actions/build-push-docker/action.yml)) directly, once per image. The scan step lives in that single composite action, so it applies to _both_ workflows and _both_ images without touching their callers

Staging and production build [`frontend/Dockerfile`](../frontend/Dockerfile) (multi-stage: `base` → `builder` → `prod`, ending on `nginx:1.28.3-alpine-slim` serving the compiled static assets) and [`backend/Dockerfile`](../backend/Dockerfile) (multi-stage: `base` → `builder` → `prod`, ending on a slim `node:24-alpine3.22` running the compiled Express app) — just with different tags per environment

## <a id="updated-pipeline"></a>🔄 Updated Pipeline

```
code-quality  ─┐
check-licences ├──> test ──> build (local) ──> scan ──> publish
audit-deps     ┘
```

The scan is a **hard gate between build and publish** — a vulnerable image never reaches the registry

The scan step lives in [`.github/actions/build-push-docker/action.yml`](../.github/actions/build-push-docker/action.yml), the composite action both `.github/workflows/staging.yml` and `.github/workflows/release.yml` call directly. Accepted false positives are tracked in [`.trivyignore`](../.trivyignore) at the repo root, analogous to `.audit-ci.json`

## <a id="new-step-sequence"></a>🧱 New Step Sequence

The composite action builds the image locally (`push: false, load: true`) and pushes it in a separate later step — `Build Docker image`, `Login to Docker Hub`, and `Push to Docker Hub` are pre-existing steps. Two steps are inserted between the build and login steps:

```
[existing] Set up QEMU
[existing] Set up Docker Buildx
   ↓
[existing] Build Docker image  →  builds the image locally (push: false, load: true)
                                   image is now in the runner's Docker daemon
Scan Docker image              →  scans the local image by name
                                   outputs a table to trivy-results.txt
                                   fails the pipeline on HIGH/CRITICAL (exit-code: 1)
Upload scan results            →  appends trivy-results.txt to the job summary (if: !cancelled())
   ↓
[existing] Login to Docker Hub →  runs after the scan, right before the push
[existing] Push to Docker Hub  →  re-invokes docker/build-push-action with push: true
```

> **Why not a single build+scan+push?**
>
> `docker/build-push-action` with `push: true` sends the image directly to the registry without it ever landing in the local Docker daemon — Trivy cannot scan it. Loading first (`load: true`) makes it available for scanning. The push step then sends the locally-loaded image to the registry

> **Re-build cost?**
>
> The push step re-invokes `docker/build-push-action`. Because Buildx layer caching is used, the layers are already in cache and the second invocation is near-instant — no meaningful CI time added

## <a id="trivy-configuration"></a>⚙️ Trivy Configuration

```yaml
# Build and load into the runner's local Docker daemon (no push yet) so Trivy can scan it.
- name: Build Docker image
  uses: docker/build-push-action@v7
  with:
    push: false
    load: true
    context: '{{defaultContext}}'
    file: ${{ inputs.dockerfile-path }}
    tags: ${{ inputs.docker-repository }}:${{ inputs.image-tag }}

- name: Scan Docker image for vulnerabilities
  uses: aquasecurity/trivy-action@v0.36.0
  with:
    image-ref: '${{ inputs.docker-repository }}:${{ inputs.image-tag }}' # the locally loaded image
    format: table
    exit-code: '1' # fail the pipeline on HIGH/CRITICAL findings
    ignore-unfixed: true # skip CVEs with no available fix
    severity: 'HIGH,CRITICAL'
    scanners: vuln # vulnerability scanning only — secret scanning finds nothing on these images
    trivyignores: .trivyignore # explicit path, rather than relying on Trivy's implicit cwd-relative default
    output: trivy-results.txt

# Always upload results to the job summary, even when the scan step fails.
- name: Upload scan results to job summary
  if: '!cancelled()' # show results even if scan step fails
  shell: bash
  run: |
    if [ -f trivy-results.txt ]; then
      cat trivy-results.txt >> "$GITHUB_STEP_SUMMARY"
    else
      echo "trivy-results.txt not found — Trivy may have crashed before scanning." >> "$GITHUB_STEP_SUMMARY"
    fi
```

## Viewing results in GitHub actions

Scan results are written to the **job summary**, not the step logs. To view them:

1. Go to _Actions_ → open the workflow run → click _Summary_ in the top-left sidebar

2. To inspect the scan step, click the `>` chevron next to "Build and push Docker image" — the composite action's steps (Build Docker image, Scan Docker image for vulnerabilities, Upload scan results to job summary, Login to Docker Hub, Push to Docker Hub) are nested inside

> ℹ️ The summary renders even when the scan fails (`if: '!cancelled()'`), so you can see exactly which CVEs blocked the pipeline without digging through raw logs

## Key options

| Option           | Value           | Rationale                                                                                                                                                                                                                   |
| ---------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ignore-unfixed` | `true`          | Skip CVEs that have no upstream fix — they cannot be actioned and generate noise                                                                                                                                            |
| `severity`       | `HIGH,CRITICAL` | Matches the `audit-deps` threshold (CVSS ≥ 7.0) for consistent policy across the pipeline, though Trivy's severity is vendor/distro-assigned rather than a strict CVSS cutoff (see [Decisions Summary](#decisions-summary)) |
| `exit-code`      | `1`             | Blocks the pipeline on any HIGH or CRITICAL finding — image never reaches the registry                                                                                                                                      |
| `format`         | `table`         | Human-readable; written to file then appended to `$GITHUB_STEP_SUMMARY`                                                                                                                                                     |
| `scanners`       | `vuln`          | Vulnerability scanning only — disables secret scanning, which finds nothing on these images and costs CI time on every build                                                                                                |
| `trivyignores`   | `.trivyignore`  | Explicit allowlist path, rather than relying on Trivy's implicit cwd-relative default                                                                                                                                       |
| version pin      | `@v0.36.0`      | Prevents surprise breakage from upstream changes, consistent with the project's action pinning convention                                                                                                                   |

## <a id="allowlist"></a>🗒️ Allowlist

When a CVE has no available fix and the risk has been consciously accepted, add its ID to `.trivyignore`:

```
# CVE-2024-XXXXX — <package> — <reason>
# No fix available as of <date>. Only exploitable if <condition> — not applicable here.
# Remove when: <package> releases a patched version.
CVE-2024-XXXXX
```

> ⚠️ Trivy only matches a bare CVE ID per non-comment line — the reason/context goes in `#`-prefixed comment lines above it, and only the bare CVE ID goes on its own uncommented line. Extra text after the ID on the same line silently fails to match, leaving the CVE blocked with no error

> **⚠️ The allowlist entry must be accompanied by a PR comment explaining:**
>
> - Which CVE is being accepted and what it is
> - Why no fix is currently available
> - Whether the vulnerable code path is reachable in production
> - A plan to remove the entry once a fix is released

This keeps the allowlist auditable via version history — same convention as `.audit-ci.json`

Any HIGH or CRITICAL CVE without a `.trivyignore` entry blocks the image from being pushed to Docker Hub (`exit-code: '1'` is enforced, not optional)

## <a id="local-pre-flight-scan"></a>🔍 Local Pre-Flight Scan

You can assess either Dockerfile's vulnerability baseline **locally**, before pushing — no Trivy installation required:

```sh
docker build -t rawg-frontend:scan-test -f frontend/Dockerfile --target prod .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image \
  --db-repository="ghcr.io/aquasecurity/trivy-db:2" \
  --severity HIGH,CRITICAL --scanners vuln rawg-frontend:scan-test

docker build -t rawg-backend:scan-test -f backend/Dockerfile --target prod .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image \
  --db-repository="ghcr.io/aquasecurity/trivy-db:2" \
  --severity HIGH,CRITICAL --scanners vuln rawg-backend:scan-test
```

> ℹ️ These commands use the unpinned `aquasec/trivy` (`latest`) Docker image, unlike CI's pinned `aquasecurity/trivy-action@v0.36.0`. This is intentional, not an oversight: local dev wants the freshest scanner and vulnerability DB, while CI wants supply-chain reproducibility from a pinned version — don't "fix" this into a pin

> ℹ️ Both flags below are **local-only workarounds** — the CI action handles these automatically and does not need them:
>
> - `-v /var/run/docker.sock:/var/run/docker.sock` — mounts the host Docker socket so Trivy (running in its own container) can inspect the locally built image
> - `--db-repository="ghcr.io/aquasecurity/trivy-db:2"` — bypasses the default GCR mirror (`mirror.gcr.io`), which can fail with a network error

This builds the image from the local Dockerfile and scans it without pushing anything anywhere

**Interpret the output as follows:**

- No HIGH/CRITICAL findings → the image is clean

- Some findings exist → for each one, either:
  - Update the base image or dependency to a patched version, then re-scan
  - Add it to `.trivyignore` with an explanation if no fix is available (see [Allowlist section](#allowlist))

## <a id="fixing-vulnerabilities"></a>🧑‍🔧 Fixing Vulnerabilities

`frontend`'s `prod` stage only contains compiled static assets served by nginx — no `node_modules` or lock files. All findings there are therefore OS-level packages (Alpine), fixed by upgrading the base image (see [Upgrading OS packages](#upgrading-os-packages))

`backend`'s `prod` stage is different — it's a running Node process, so its `node_modules` (production dependencies only, via `pnpm install --prod`) is real attack surface Trivy scans too. A finding there is an **npm-level** CVE, not an OS package — fix it the same way `audit-deps`/Dependabot already handle npm CVEs elsewhere in this repo: bump the flagged package (`pnpm update <package>`) or wait for the Dependabot PR, then re-scan. The `apk upgrade`/OS-package flow below only applies to `backend`'s **base** `node:24-alpine3.22` image layer, not its dependencies

### Strategy

For each finding, check the `Status` and `Fixed Version` columns in the Trivy output:

| Status             | Fixed Version | Action                                                               |
| ------------------ | ------------- | -------------------------------------------------------------------- |
| `fixed`            | present       | Upgrade the package — see below                                      |
| `fixed`            | absent        | Trivy DB may be stale; re-scan with an up-to-date DB                 |
| `affected` / blank | absent        | No fix available — add to .trivyignore (see [Allowlist](#allowlist)) |

### Upgrading OS packages

The `prod` stage is pinned to `nginx:1.28.3-alpine-slim` — a base tag that already ships a patched nginx build, rather than relying solely on `apk upgrade` to reach one. `-alpine-slim` also excludes 5 unused dynamic modules (acme/geoip/image-filter/njs/xslt — none referenced in `nginx.conf`) that would otherwise need purging before nginx could be force-upgraded cleanly. On top of that, the stage force-upgrades every Alpine package **including nginx itself**, so future patch-level CVEs (within `1.28.3-rX` Alpine package revisions) are covered without waiting on the next base-image bump:

```Dockerfile
FROM nginx:1.28.3-alpine-slim AS prod

RUN cp /etc/nginx/nginx.conf /tmp/nginx.conf.orig \
    && apk upgrade --no-cache \
    && apk add --no-cache --upgrade nginx \
    && cp /tmp/nginx.conf.orig /etc/nginx/nginx.conf \
    && rm /tmp/nginx.conf.orig
```

> ⚠️ Plain `apk upgrade` does **not** force-upgrade nginx itself — the official image pins an exact `nginx=<version>` in `/etc/apk/world`, so Alpine silently skips it even when a patched version is available in its repos. `apk add --no-cache --upgrade nginx` forces the reinstall
>
> Reinstalling the nginx package overwrites Alpine's stock `/etc/nginx/nginx.conf`, which is what carries the `include /etc/nginx/conf.d/*.conf;` directive rawg's own config (`frontend/nginx.conf`, copied to `/etc/nginx/conf.d/default.conf` later in the `prod` stage) depends on to ever get loaded — back it up and restore it around the fix, as shown above

> ℹ️ **Why pin a patched base tag instead of relying on `apk upgrade` alone?** Alpine's apk repo for a given base image tag only carries packages available at that Alpine release — if the tag itself predates a fix (e.g. `nginx:1.28.2-alpine` before `1.28.3` had a patched Alpine package), `apk upgrade`/`apk add --upgrade` has nothing newer to install and the CVE persists regardless. Bumping the base tag to one that already ships the fix (`1.28.3-alpine-slim`) is the actual remediation; the `apk upgrade` step then covers patch releases _within_ that tag going forward

Rebuild and re-scan to verify the findings are resolved (see [local pre-flight commands](#local-pre-flight-scan))

### If findings remain after upgrading

A CVE may still appear after `apk upgrade` if the patched package version has not yet landed in Alpine's repos. In that case:

1. Confirm the CVE has `ignore-unfixed: true` in the Trivy config — it should be filtered automatically

2. If it still appears (fix exists upstream but not yet in Alpine), add it to `.trivyignore` temporarily with a note to remove it once the package lands
