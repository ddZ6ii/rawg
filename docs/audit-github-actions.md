# GitHub Actions Security Auditing

## Table of Contents

- [📋 Overview](#overview)
- [🧠 Supply Chain Scanning Strategy](#supply-chain-scanning-strategy)
- [🤖 Dependabot](#dependabot)
  - [Docker Ecosystem](#docker-ecosystem)
  - [GitHub Actions Ecosystem](#github-actions-ecosystem)
- [🔎 zizmor — Static Analysis](#zizmor--static-analysis)
  - [Setup](#setup)
  - [Key Options](#key-options)
  - [Suppressed rules](#suppressed-rules)
- [🪖 Workflow Hardening](#workflow-hardening)
  - [persist-credentials: false](#persist-credentials-false)
  - [Explicit permissions](#explicit-permissions)

## <a id="overview"></a>📋 Overview

GitHub Actions security covers three distinct threat vectors, each addressed by a different tool:

| Threat                            | Tool                          | How                           |
| --------------------------------- | ----------------------------- | ----------------------------- |
| Vulnerable action versions (CVEs) | Dependabot                    | Auto-PRs for security updates |
| Docker base image CVEs            | Dependabot + Trivy            | Auto-PRs + CI scan on build   |
| Workflow misconfigurations        | zizmor                        | Static analysis in CI         |
| Leaked credentials via checkout   | `persist-credentials: false`  | Workflow hardening            |
| Overly broad token permissions    | `permissions: contents: read` | Workflow hardening            |

---

## <a id="supply-chain-scanning-strategy"></a>🧠 Supply Chain Scanning Strategy

The overall approach favours **automated detection with manual review** over fully automated remediation:

- Dependabot detects vulnerabilities and opens PRs — a human merges them
- Trivy scans the final Docker image and blocks the pipeline on HIGH/CRITICAL findings
- zizmor audits workflow files on every PR and blocks merge on findings

## <a id="dependabot"></a>🤖 Dependabot

Configured in `.github/dependabot.yml`. All three ecosystems share the same base policy:

- **No `security-updates-only` key** — it doesn't exist in Dependabot's schema, for any ecosystem. "PRs only for known CVEs, not routine version bumps" is achieved via `open-pull-requests-limit: 0` (caps routine version-update PRs at zero; security-update PRs use a separate, uncapped quota) combined with `groups.security-updates.applies-to: security-updates` for consolidation. This is applied to the `npm` and `docker` entries; `github-actions` intentionally keeps its default limit (routine weekly Actions bumps stay on)
- **Weekly schedule** — consistent cadence across all ecosystems
- **Grouped PRs** — all security fixes within an ecosystem land in a single PR, not one per dependency
- **`rebase-strategy: auto`** — keeps PR branches rebased onto the base branch, no merge commits
- **Dependabot _security updates_ (the CVE-detection feature itself) is a separate repo-settings toggle** (Settings → Code security → Dependabot security updates), independent of this file entirely. This has not yet been enabled — see the [README's Dependabot summary](../README.md#cicd) for the outstanding manual step

### Docker ecosystem

Tracks the two base images declared in the root `Dockerfile`: `node:24-alpine3.22` (`base` stage) and `nginx:1.28.2-alpine` (`prod` stage). rawg is a single-frontend static app — no separate backend/gateway image, and `docker-compose.yml` only declares a `dev` service (bind-mounted local dev container, same `Dockerfile`) with no additional pinned images to track

Trivy detects CVEs in the built image; Dependabot provides the automated fix PR to bump the base image tag

### GitHub actions ecosystem

Tracks all `uses:` references across `.github/workflows/` and `.github/actions/`

Dependabot security updates are supported for the `github-actions` ecosystem — GitHub added this in November 2022, and it works the same repo-settings toggle as every other ecosystem, unrelated to this file. Unlike `npm`/`docker`, this entry is **not** scoped to security-only: it keeps the default `open-pull-requests-limit` (5), so routine weekly Actions version bumps stay enabled alongside any security-update PRs

## <a id="zizmor--static-analysis"></a>🔎 zizmor — Static Analysis

[zizmor](https://docs.zizmor.sh) is a **static analysis tool for GitHub Actions**. It audits workflow files for security misconfigurations: script injection, dangerous triggers, credential leaks, and excessive permissions

### Setup

Runs as the `audit-actions` job in `ci.yml`, in parallel with `code-quality`. The `test` job depends on it (`needs: [code-quality, audit-actions]`), so a zizmor failure blocks merge — and since `staging.yml`/`release.yml` both call `ci.yml` via `workflow_call`, it also blocks staging deploys and release builds, not just PR merges

```yaml
audit-actions:
  runs-on: ubuntu-latest
  steps:
    - name: Check out code
      uses: actions/checkout@v7
      with:
        persist-credentials: false

    - name: Audit GitHub Actions security
      uses: zizmorcore/zizmor-action@v0.6.2
      with:
        version: 1.29.0 # pin the analyzer explicitly — the action's `version` input defaults to `latest`, which would let an upstream zizmor release silently turn a green branch red
        config: zizmor.yml
        advanced-security: false # output to CI logs only
        annotations: true # surface findings as PR annotations, not just raw job-log text
```

Preview findings locally before pushing (no persistent install required):

```bash
GH_TOKEN=$(gh auth token) uvx zizmor --config zizmor.yml .
```

`uvx` (from the `uv` Python tool) is the closest equivalent to `pnpm dlx`/`npx` for this Python-packaged Rust binary — there is no npm distribution. The `GH_TOKEN` enables the same "online audit" checks CI runs with; without it, those checks are silently skipped and a local pass could still fail in CI.

### Key options

- **`advanced-security: false`** — SARIF upload to GitHub Code Scanning is disabled. Uploading SARIF requires `security-events: write`, which would contradict the - `permissions: contents: read` hardening applied to all workflows. CI log output is sufficient

### Suppressed rules

Configured in `zizmor.yml` at the repo root

#### `unpinned-uses` — disabled

zizmor requires actions pinned to a commit SHA:

```yaml
# zizmor requires:
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7

# we use:
uses: actions/checkout@v7
```

Suppressed repo-wide in `zizmor.yml` via `rules.unpinned-uses.disable: true` — the `disable` key (not the per-finding `ignore` key, which only supports `filename.yml[:line[:column]]` patterns) was added in zizmor v1.13.0 and is the correct mechanism for a blanket, deliberate suppression:

```yaml
rules:
  unpinned-uses:
    disable: true
```

> ℹ️ **Justification for disabling**
>
> SHA pinning defends against a maintainer pushing malicious code to an existing tag. This risk is acceptable here because:
>
> 1. All actions used are from high-trust maintainers (GitHub, Docker, pnpm, zizmorcore)
> 2. Dependabot tracks action versions and opens CVE fix PRs automatically — this is the industry-standard mitigation for tag-based pinning
>
> ⚠️ SHA pinning is recommended for high-security environments (fintech, healthcare, government) or when using obscure third-party actions. The maintenance overhead (manually updating SHAs on every Dependabot PR) outweighs the marginal benefit for this project
>
> ⚠️ **Partially mitigated in this repo:** `.github/dependabot.yml` now exists (see the [Dependabot section](#dependabot) above), so version tracking is in place. However, Dependabot _security updates_ — the repo-settings toggle that actually raises CVE-fix PRs — has **not** been enabled yet ([README's Dependabot summary](../README.md#cicd) has the outstanding step), so this mitigation is not fully active today

#### `dependabot-cooldown` — disabled

zizmor recommends a cooldown period before Dependabot opens PRs after a new version is published. This defends against supply-chain attacks where an attacker quickly publishes a malicious "fix"

Suppressed the same way as `unpinned-uses`, via `rules.dependabot-cooldown.disable: true` in `zizmor.yml`.

> ℹ️ **Justification for disabling**
>
> `open-pull-requests-limit: 0` + `groups.security-updates.applies-to: security-updates` (the real mechanism — see the [Dependabot section](#dependabot) above; there is no `security-updates-only` key) already limits routine `npm`/`docker` Dependabot PRs to known CVEs, not every new release. This eliminates the "newly published malicious version" attack vector that cooldown is designed for. Cooldown on top of this is redundant for those ecosystems. `github-actions` keeps its default limit (routine bumps included), so the cooldown protection is weaker there, but the same "high-trust maintainers" reasoning from `unpinned-uses` above applies
>
> ⚠️ **Note:** `.github/dependabot.yml` now exists (see the [Dependabot section](#dependabot) above), so this suppression is an active, justified trade-off rather than a no-op — unlike when this note was originally written

#### `artipacked` — accepted for `release.yml`'s `sync-dev` job

`release.yml`'s `sync-dev` job checks out with `token: ${{ secrets.GH_TOKEN }}` and intentionally does NOT set `persist-credentials: false` — it needs to `git push` after rebasing `dev` onto `main`. This is a known, accepted `artipacked` exception. Every other checkout step across all workflows (`ci.yml`, `staging.yml`, and the other jobs in `release.yml`) does set `persist-credentials: false`

**Enforced with an inline `# zizmor: ignore[artipacked]` comment** directly on the offending step in `.github/workflows/release.yml` — not just documented in prose, and not via a config-file entry:

```yaml
- name: Check out code
  uses: actions/checkout@v7 # zizmor: ignore[artipacked]
  with:
    fetch-depth: 0
    token: ${{ secrets.GH_TOKEN }}
```

The inline comment is preferred over a per-finding `rules.artipacked.ignore: [release.yml:line:col]` entry in `zizmor.yml`: a config-file `line:col` coordinate silently goes stale if `release.yml` is edited above that step (lines shift, the coordinate stops pointing at the checkout step, and the exception stops applying — which would break the release pipeline the next time `sync-dev` ran). The inline comment stays attached to the step's YAML node regardless of where it moves in the file. `zizmor.yml` still holds a comment-only note explaining the exception, but no active `ignore` entry for it — `unpinned-uses`/`dependabot-cooldown` remain repo-wide `disable: true` suppressions there, since those apply broadly rather than to one step.

## <a id="workflow-hardening"></a> 🪖 Workflow Hardening

### `persist-credentials: false`

All `actions/checkout` steps that do not require subsequent `git push` / `git fetch` set `persist-credentials: false`. This prevents the GitHub token from being stored in `.git/config` after checkout, so no subsequent step (including third-party actions) can access it

**Accepted exception:** the `sync-dev` job in `release.yml` omits this, since that job runs `git push` after rebasing `dev` onto `main` (see the `artipacked` exception above)

### Explicit permissions

All caller workflows (`ci.yml`, `staging.yml`, `release.yml`) declare `permissions: contents: read` at the workflow level. This overrides GitHub's default token permissions (which vary per repository settings and can be overly broad) and enforces the principle of least privilege

> ℹ️ **Accepted exception:** `release.yml`'s `release` job declares `permissions: contents: write` at the job level, and its `sync-dev` job likewise declares `permissions: contents: write` at the job level. In practice this is decorative rather than load-bearing: both jobs authenticate their actual `git push`/release-creation calls via the `GH_TOKEN` PAT (a repository secret), not the ambient `GITHUB_TOKEN` these `permissions:` blocks govern. The blocks are kept for intent/documentation clarity — so a reader can see at a glance that these jobs write to the repo — not because the write actually depends on them
