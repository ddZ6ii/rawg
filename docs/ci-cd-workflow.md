# CI/CD Workflow

## Table of Contents

- [🚨 Highlights](#highlights)
- [🪾 Branching Strategy](#branching-strategy)
- [📋 Overview](#overview)
  - [Workflow](#workflow)
  - [Pipeline](#pipeline)
- [✋ Prerequisites](#prerequisites)
- [🗂️ GitHub Actions Folder Structure](#github-actions-folder-structure)
- [🏷️ Conventional Commits](#conventional-commits)
  - [Commit format](#commit-format)
  - [Allowed types](#allowed-types)
  - [Breaking changes](#breaking-changes)
- [🧰 Local Tooling](#local-tooling)
  - [Writing commits](#writing-commits)
  - [Commit validation hooks](#commit-validation-hooks)
- [🔎 Detailed Workflows](#detailed-workflows)
  - [Workflow 1 — CI checks](#workflow-1--ci-checks)
  - [Workflow 2 — Staging deploy](#workflow-2--staging-deploy)
  - [Workflow 3 — Release](#workflow-3--release)
- [⚙️ GitHub Configuration](#github-configuration)
- [📦 Semantic Release](#semantic-release)
  - [Plugins](#plugins)
  - [Dry run](#dry-run)
  - [Starting version](#starting-version)

---

## <a id="highlights"></a>🚨 Highlights

The CI/CD workflows relies on both **Docker**, **husky**, **commitLint**, **GitHub Actions** Semantic Release, and **Webhook** to build, ship and deploy the application to a VPS **staging** and **production** environments

Versioning is **fully automated** via semantic-release based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). No manual version tagging

## <a id="branching-strategy"></a>🪾 Branching Strategy

This workflow relies on [Branching Strategy](github-branching-strategy.md)

## <a id="overview"></a>📋 Overview

### Workflow

```
feature/* branch

        ↓ push (any branch except dev) / PR to dev

  ci.yml
    → code-quality + check-licences + audit-deps + audit-actions → test
    → code-quality → build (shared build → backend build → frontend build)

        ↓ merge / PR to dev

  staging.yml
    → get-short-sha
    → ci.yml (same checks as above)
    → build-and-deploy
      - Docker build → scan → publish frontend-dev-<short-sha> + api-dev-<short-sha>
      - HMAC-signed webhook → staging deploy

        ↓ promote dev → main (local fast-forward)

  release.yml
    → ci.yml (same checks as above)
    → release
      - analyzes commits since last tag
      - bumps version in package.json
      - updates CHANGELOG.md
      - commits both to main  [skip ci]
      - pushes new version tag  e.g. v0.2.0
      - detects whether a release was actually published (tag-at-HEAD check)
    → build-and-push (only runs if a release was published)
      - Docker build → scan → publish frontend-v0.2.0 + frontend-latest + api-v0.2.0 + api-latest
    → sync-dev (only runs if a release was published)
      - rebases dev onto main (back sync)
```

### Pipeline

| Trigger Event                                  | Workflow      | Jobs                                                                                                                                                | Docker tag                                                              | Deploy               |
| ---------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------- |
| Push to any branch (excl. `dev`) / PR to `dev` | `ci.yml`      | code-quality + check-licences + audit-deps + audit-actions → test; code-quality → build                                                             | —                                                                       | —                    |
| Push to `dev` (via PR)                         | `staging.yml` | get-short-sha + code-quality (`ci.yml`) → build-and-deploy (build+scan+publish ×2 images → webhook)                                                 | `frontend-dev-<short-sha>` + `api-dev-<short-sha>`                      | Auto (staging, HMAC) |
| Push to `main` (local ff merge)                | `release.yml` | code-quality (`ci.yml`) → release (semantic-release + tag-at-HEAD detection) → build-and-push _(conditional, ×2 images)_ + sync-dev _(conditional)_ | `frontend-v<version>`/`frontend-latest` + `api-v<version>`/`api-latest` | Manual (production)  |

## <a id="prerequisites"></a>✋ Prerequisites

- **Node.js** 24+ (CI pins `node-version: 24` in `.github/actions/setup-environment/action.yml`)

- **pnpm** — version pinned via packageManager in package.json

- **Git & GitHub** — configured for [linear history](./github-linear-history-workflow.md) (fast-forward only, no merge commits)

- **Docker Hub** — an account, a repository, and a PAT (_Account → Settings → Personal access tokens → New Access Token_) to host and publish the frontend and backend Docker images

- **Docker** — only needed to build/scan the production images in CI; local development uses `pnpm dev` directly, no Docker required

- **Webhooks** — HMAC-signed hooks for both staging (automated, triggered from `staging.yml`) and production (manual, triggered via `scripts/deploy-prod.sh`) app deployments to the VPS

- **VPS** — a fully configured, up and running server to deploy apps to

---

## <a id="github-actions-folder-structure"></a>🗂️ GitHub Actions Folder Structure

See [Semantic Release Installation Guide | Folder Structure](./semantic-release-install-guide.md#folder-structure)

To avoid code duplication, [custom composite actions](./semantic-release-install-guide.md#custom-composite-actions) and [reusable workflows](./semantic-release-install-guide.md#reusable-workflows) are used

## <a id="conventional-commits"></a>🏷️ Conventional Commits

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This is enforced by git hooks locally and validated in CI

### Commit format

```
<type>(<optional scope>): <description>

[optional body]

[optional footer: BREAKING CHANGE: <description>]
```

### Allowed types

| Type       | Description                   | Release triggered |
| ---------- | ----------------------------- | ----------------- |
| `feat`     | New feature                   | minor             |
| `fix`      | Bug fix                       | patch             |
| `ci`       | CI/CD changes                 | patch             |
| `docs`     | Documentation                 | patch             |
| `style`    | Code style (formatting, etc.) | patch             |
| `refactor` | Code refactor                 | patch             |
| `perf`     | Performance improvement       | patch             |
| `test`     | Tests                         | patch             |
| `build`    | Build system changes          | patch             |
| `revert`   | Revert a commit               | patch             |
| `chore`    | Maintenance tasks             | no release        |

### Breaking changes

Add `!` after the type, or a `BREAKING CHANGE:` footer, to trigger a **major** version bump:

```
feat!: redesign authentication flow

# or

feat: new login system

BREAKING CHANGE: the /auth endpoint now requires a Bearer token
```

## <a id="local-tooling"></a>🧰 Local Tooling

### Writing commits

Use the interactive wizard for a guided commit:

```sh
pnpm commit     # launches commitizen prompt
```

Or write commit messages manually — `commitlint` validates them automatically

### Commit validation hooks

Two git hooks enforce conventional commits:

- **`commit-msg`** — validates each message at commit time
- **`pre-push`** — validates all commits being pushed (catches `--no-verify` bypasses)

For new branches, only commits since the divergence point from `main` or `dev` are validated — pre-existing non-conventional commits from before enforcement was set up are skipped

## <a id="detailed-workflows"></a>🔎 Detailed Workflows

### Workflow 1 — CI checks

#### Description

- Acts as a **quality gate**: must pass for a PR to be mergeable into `dev` (enforced by GitHub branch protection rules), and is also called by `staging.yml`/`release.yml` so the same gate blocks staging deploys and release builds
- Triggers on every push to any branch except `dev`, and on PRs targeting `dev` — also declares `workflow_call` so it can be invoked as a reusable workflow

#### Configuration file

- `.github/workflows/ci.yml`

#### Trigger events

- push to any branch except `dev` (this includes `main` — an intentional safety net so CI still runs on an accidental direct push to `main`, independent of `release.yml`'s own call)
- opening/updating a pull request targeting `dev`
- `workflow_call` (invoked from `staging.yml` and `release.yml`)

#### Workflow jobs

- `code-quality`— checks code formatting and linting

- `check-licences`— checks that all packages use allowed licences

  > 🚦 Runs in **parallel** with `code-quality`
  >
  > 🛡️ See [`docs/check-licences.md`](./check-licences.md) for the full allowlist policy and exceptions

- `audit-deps` — scans [production dependencies for known vulnerabilities with audit-ci](./audit-deps.md#ci-audit-job)

  > 🚦 Runs in **parallel** with `code-quality` and `check-licences`
  >
  > 🛡️ Blocks on high/critical CVEs, CVSS ≥ 7.0

- `audit-actions` — runs [zizmor static analysis of GitHub Actions](./audit-github-actions.md#zizmor--static-analysis) on all workflow files to detect security misconfigurations (script injection, credential leaks, excessive permissions)

  > 🚦 Runs in **parallel** with `code-quality`, `check-licences`, and `audit-deps`

- `test` — runs the test suite

  > 🚦 Requires `code-quality`, `check-licences`, `audit-deps`, and `audit-actions` to succeed before it can run

- `build` — builds `@rawg/shared` (`tsc -b`), then `backend` (`tsc -b`), then `frontend` (`pnpm run build:docker`, i.e. `tsc -b && vite build`) — in that order, since both `backend` and `frontend` depend on `@rawg/shared` via `workspace:*` — to catch build breakage early

  > 🚦 Requires only `code-quality` to succeed — not gated on `test`, so a build failure surfaces independently and as fast as possible

### Workflow 2 — Staging deploy

#### Description

- Ships the application to Docker Hub, then triggers an HMAC-signed webhook that deploys it to the VPS staging environment
- Triggers on push to `dev` (i.e. when a PR is merged)
- Tags both Docker images with `frontend-dev-<short-sha>`/`api-dev-<short-sha>` for full traceability

#### Configuration file

- `.github/workflows/staging.yml`

#### Trigger event

- push to `dev` (e.g. merging a PR)

#### Workflow jobs

- `get-short-sha` — retrieves the git commit short SHA (7 characters long)

- `code-quality` — calls `ci.yml` ([see previous section](#workflow-1--ci-checks))

  > 🚦 Runs in parallel with `get-short-sha`

- `build-and-deploy`

  > 🚦 Requires `get-short-sha` and `code-quality` to succeed before it can run
  - Builds the `frontend` and `backend` Docker images locally (one `build-push-docker` invocation each), uses [Trivy to scan each for HIGH/CRITICAL CVEs](./audit-docker-images.md), then pushes both to Docker Hub
    > 🛡️ The scan is a **hard gate** — a vulnerable image is never pushed to the registry
  - Sends an HMAC-signed `curl` request to the `deploy-rawg-staging` webhook

#### Docker tags

- `frontend-dev-<short-sha>` + `api-dev-<short-sha>` (e.g. `frontend-dev-a3f5c2b` + `api-dev-a3f5c2b`) — full traceability, always know which commit is on staging

#### Staging deployment

`build-and-deploy` signs a `{"tag":"dev-<short-sha>"}` payload with the `WEBHOOK_SECRET_RAWG_STAGING` shared secret and POSTs it to the `deploy-rawg-staging` hook on the VPS, which pulls the new image and restarts the staging container. No manual intervention is required

### Workflow 3 — Release

See [Semantic Release Installation Guide | Release Workflow](./semantic-release-install-guide.md#release-workflow) for the full job-by-job breakdown

#### Description

Automated semantic versioning **and**, when a release is actually published, the production release build — all in one workflow file (`release.yml`), triggered on push to `main`

#### Configuration file

- `.github/workflows/release.yml`

#### Trigger event

- push to `main` (via **local fast-forward merge**, `git merge --ff-only origin/dev` — there is no PR-to-`main` flow in this repo)

#### Workflow jobs

- `code-quality` — calls `ci.yml` ([see Workflow 1](#workflow-1--ci-checks))

- `release` — runs semantic-release (version bump, changelog, tag, GitHub Release), then detects whether a release was actually published by comparing the commit `HEAD` pointed at before/after the run against any `v*.*.*` tag now at `HEAD`

  > 🚦 Requires `code-quality` to succeed before it can run

- `build-and-push` — builds the `frontend` and `backend` Docker images locally (one `build-push-docker` invocation each), uses [Trivy to scan each for HIGH/CRITICAL CVEs](./audit-docker-images.md), then pushes both to Docker Hub

  > 🚦 Requires `release` to succeed, and only runs if a release was actually published
  >
  > 🛡️ The scan is a **hard gate** — a vulnerable image is never pushed to the registry

- `sync-dev` — rebases `dev` onto `main` so both branches stay non-divergent

  > 🚦 Requires `release` to succeed, and only runs if a release was actually published

#### Docker tags

Human-readable history on Docker Hub with `frontend-latest`/`api-latest` always pointing to the most recent production release

- `frontend-v<version>` + `frontend-latest` (e.g. `frontend-v0.2.0`)
- `api-v<version>` + `api-latest` (e.g. `api-v0.2.0`)

#### Production deployment

Intentionally **manual**. Once the image is published, run `scripts/deploy-prod.sh rawg vX.Y.Z` to trigger the HMAC-signed webhook that deploys to the production VPS. This provides a **final human gate** before anything reaches production

## <a id="github-configuration"></a>⚙️ GitHub Configuration

Refer to [Semantic Release Installation Guide | GitHub Configuration](./semantic-release-install-guide.md#github-configuration)

For Dependabot and security-related GitHub settings (Advanced Security, branch rulesets, CodeQL), see [Dependency Security Auditing | GitHub Configuration](./audit-deps.md#github-configuration)

## <a id="semantic-release"></a>📦 Semantic Release

### Plugins

| Plugin                                      | Role                                                       |
| ------------------------------------------- | ---------------------------------------------------------- |
| `@semantic-release/commit-analyzer`         | Determines next version from commit types                  |
| `@semantic-release/release-notes-generator` | Generates release notes                                    |
| `@semantic-release/changelog`               | Writes/updates `CHANGELOG.md`                              |
| `@semantic-release/npm`                     | Updates `version` in `package.json` (npm publish disabled) |
| `@semantic-release/git`                     | Commits `package.json` + `CHANGELOG.md` to `main`          |
| `@semantic-release/github`                  | Creates a GitHub Release                                   |

### Starting version

In case of already existing tag(s) manually pushed to `main` before implementing the fully automated CI/CD workflow, the latest tag will automatically be used by semantic-release as the baseline. The next version will be determined by commits since that tag:

- A `feat:` commit since `v0.1.0` → next release is `v0.2.0`
- Only `fix:` or other patch-level commits → next release is `v0.1.1`

### Dry run

Preview what the next release would be without pushing anything:

```sh
GH_TOKEN=your_pat pnpm exec semantic-release --dry-run
```
