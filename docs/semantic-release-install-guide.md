# Semantic Release — Installation Guide

Reference for how `semantic-release`, conventional commits tooling, and the release CI/CD pipeline are set up and configured in this repo. `semantic-release`, `commitlint`, `commitizen`, and `husky` are already installed (`.commitlintrc.json`, `.husky/commit-msg`, `.husky/pre-push`, and `package.json`'s `commit`/`prepare` scripts all exist); `.releaserc.json`, `zizmor.yml`'s audit config, and `.github/workflows/release.yml` complete the pipeline. The install commands below are kept as a record of how these packages were added, and double as the steps to re-run if a package ever needs reinstalling.

## Table of Contents

- [📋 Overview](#overview)
- [✋ Prerequisites](#prerequisites)
- [📦 Package Installation](#package-installation)
- [🛠️ Configuration Files](#configuration-files)
  - [`.commitlintrc.json`](#commitlintrcjson)
  - [`.releaserc.json`](#releasercjson)
  - [`package.json` additions](#packagejson-additions)
  - [`.gitignore` check](#gitignore-check)
  - [`.prettierignore` check](#prettierignore-check)
- [🪝 Husky Hooks](#husky-hooks)
  - [.husky/commit-msg](#huskycommit-msg)
  - [.husky/pre-push](#huskypre-push)
- [🎬 GitHub Actions](#github-actions)
  - [Folder structure](#folder-structure)
  - [Shared](#shared)
    - [Custom composite actions](#custom-composite-actions)
    - [Reusable workflows](#reusable-workflows)
  - [Release workflow](#release-workflow)
    - [Description](#description)
    - [Details](#details)
    - [Configuration file](#configuration-file)
    - [Trigger event](#trigger-event)
    - [Workflow jobs](#workflow-jobs)
    - [Key configuration](#key-configuration)
- [⚙️ GitHub Configuration](#github-configuration)
  - [General settings and branch rulesets](#general-settings-and-branch-rulesets)
  - [Secrets and variables](#secrets-and-variables)
  - [Creating the `GH_TOKEN` PAT](#creating-the-gh_token-pat)
  - [Manual GitHub-configuration checklist](#manual-github-configuration-checklist)
- [🧪 Testing](#testing)
- [✅ Validation](#pre-validation)

## <a id="overview"></a>📋 Overview

[`Semantic Release`](https://semantic-release.gitbook.io/) fully **automates the version management and release process** by reading Git commit history. It eliminates manual version bumping, tagging, and changelog writing

[Conventional Commits](https://www.conventionalcommits.org/) are enforced locally via `commitlint` (validation) and `commitizen` (interactive prompt), with `husky` running both as git hooks

## <a id="prerequisites"></a>🖐️ Prerequisites

- **Node.js** 24+ (CI pins `node-version: 24` in `.github/actions/setup-environment/action.yml`)
- **pnpm** — version pinned via `packageManager` in `package.json`
- **Git & GitHub** — configured for linear history (fast-forward only, no merge commits). See [Linear History Workflow](github-linear-history-workflow.md)
- **Docker Hub** — an account, a repository, and a PAT (`Account → Settings → Personal access tokens → New Access Token`) to host and publish Docker images
- **Docker** — app containerized for all environments (dev, staging, prod)

## <a id="package-installation"></a>📦 Package Installation

> ℹ️ According to semantic-release [official documentation](https://semantic-release.gitbook.io/semantic-release/usage/installation), the package is meant to be invoked via `npx` in CI — making it a pure CI tool with no relevance to the app itself, and therefore unnecessary as a project dependency
>
> However, this breaks local `--dry-run` support since `npx` does **not** auto-install plugins. A local dry-run will fail if plugins like `@semantic-release/changelog` aren't installed. Since dry-runs are genuinely useful and these are dev dependencies only (no impact on the built app), installing them locally is the more practical **trade-off**

1. Install Semantic Release and related plugins packages as dev dependencies:

   ```sh
   pnpm add -D \
     semantic-release \
     @semantic-release/commit-analyzer \
     @semantic-release/release-notes-generator \
     @semantic-release/changelog \
     @semantic-release/npm \
     @semantic-release/git \
     @semantic-release/github \
     conventional-changelog-conventionalcommits
   ```

> ℹ️ `@semantic-release/npm` is what actually writes the new version into `package.json`. Even with `npmPublish: false` set into `.releaserc.json` (no publish to the npm registry), it still performs the version bump. Without it, the version field in `package.json` will stay at `0.0.0` forever

2. Install `husky`, `commitlint` and `commitizen` packages to enforce conventionnal commits:

   ```sh
   pnpm add -D \
     @commitlint/cli \
     @commitlint/config-conventional \
     commitizen \
     cz-conventional-changelog \
     husky
   ```

> ℹ️ [Commitizen](https://commitizen-tools.github.io/commitizen/) and [Commitlint](https://commitlint.js.org/) are complementary tools used to enforce Conventional Commits. Together, they ensure consistent Git history. Commitizen acts as an **interactive prompt** to create well-structured messages, while Commitlint acts as a **validator** that rejects non-compliant messages

---

## <a id="configuration-files"></a>🛠️ Configuration Files

### `.commitlintrc.json`

Validates commit messages against the Conventional Commits spec

> ⚠️ The `type-enum` rule must stay in sync with the `releaseRules` in `.releaserc.json`

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "ci",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "revert"
      ]
    ]
  }
}
```

### `.releaserc.json`

Controls which commit types trigger a release and what version bump they produce

```json
{
  "branches": ["main"],
  "tagFormat": "v${version}",
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "conventionalcommits",
        "releaseRules": [
          { "breaking": true, "release": "major" },
          { "type": "fix", "release": "patch" },
          { "type": "feat", "release": "minor" },
          { "type": "chore", "release": false },
          { "type": "ci", "release": "patch" },
          { "type": "docs", "release": "patch" },
          { "type": "style", "release": "patch" },
          { "type": "refactor", "release": "patch" },
          { "type": "perf", "release": "patch" },
          { "type": "test", "release": "patch" },
          { "type": "build", "release": "patch" },
          { "type": "revert", "release": "patch" }
        ]
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      { "preset": "conventionalcommits" }
    ],
    ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md" }],
    ["@semantic-release/npm", { "npmPublish": false }],
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}
```

**Release rules summary:**

| Type         | Release    |
| ------------ | ---------- |
| `feat`       | minor      |
| `fix`        | patch      |
| `ci`         | patch      |
| `docs`       | patch      |
| `style`      | patch      |
| `refactor`   | patch      |
| `perf`       | patch      |
| `test`       | patch      |
| `build`      | patch      |
| `revert`     | patch      |
| `chore`      | no release |
| Breaking `!` | major      |

### `package.json` additions

Add or merge the following into your `package.json`:

```json
{
  "scripts": {
    "prepare": "husky",
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

- `prepare` — runs `husky` on `pnpm install` to register git hooks automatically
- `commit` — launches the interactive commitizen wizard (`pnpm commit`)

### `.gitignore` check

`CHANGELOG.md` must not be gitignored, or `@semantic-release/git` can't commit it. This repo's `.gitignore` only ignores `TODO.md` and `docs/superpowers/**/*.md` — there is no blanket `*.md` ignore, so `CHANGELOG.md` is already tracked with no changes needed

### `.prettierignore` check

Make sure `CHANGELOG.md` is excluded from the list of formatted files:

```
CHANGELOG.md
```

> ℹ️ `CHANGELOG.md` is auto-generated — formatting it would either get overwritten on the next release or require running prettier as part of the semantic-release pipeline, which adds fragile complexity for no real benefit

---

## <a id="husky-hooks"></a>🪝 Husky Hooks

> ℹ️ **Already installed in this repo.** `.husky/commit-msg` and `.husky/pre-push` below are the real, already-present files (not steps to run) — `pnpm install` already registers them via `package.json`'s `prepare: "husky"` script. The steps below are kept as a reference for how they were originally set up.

Initialize husky (creates `.husky/` directory):

```sh
pnpm exec husky init
```

Then create the two following hook files and make them executable (`chmod +x`):

### `.husky/commit-msg`

Validates each commit message at commit time

```sh
#!/usr/bin/env sh
pnpm exec commitlint --edit "$1"
```

### `.husky/pre-push`

Validates all commits being pushed. Catches commits made with `--no-verify`. For new branches, only validates commits since diverging from `main` or `dev` — pre-existing non-conventional commits are skipped

```sh
#!/usr/bin/env sh

while IFS=' ' read -r local_ref local_sha remote_ref remote_sha; do
  # Skip branch deletions
  [ "$local_sha" = "0000000000000000000000000000000000000000" ] && continue

  # Skip non-branch refs (tags, notes, etc.)
  case "$local_ref" in refs/heads/*) ;; *) continue ;; esac

  if [ "$remote_sha" = "0000000000000000000000000000000000000000" ]; then
    # New branch: validate only commits since diverging from main or dev.
    # Pick the nearer of the two merge-bases (dev is preferred when it is
    # itself ahead of main, i.e. base_main is an ancestor of base_dev).
    base_main=$(git merge-base "$local_sha" origin/main 2>/dev/null)
    base_dev=$(git merge-base "$local_sha" origin/dev 2>/dev/null)
    from="$base_main"
    if [ -n "$base_dev" ] && { [ -z "$from" ] || git merge-base --is-ancestor "$from" "$base_dev"; }; then
      from="$base_dev"
    fi
    [ -z "$from" ] && continue
  else
    from="$remote_sha"
  fi

  pnpm exec commitlint --from "$from" --to "$local_sha" || exit 1
done
```

> ⚠️ **Anchor the merge-base on `$local_sha`, not `HEAD`.** An earlier version of this snippet anchored both `git merge-base` calls to `HEAD` and used a `||` fallback between `main` and `dev`. Both are bugs: `HEAD` diverges from `$local_sha` whenever you push a branch you're not currently on (`git push origin other-branch`, `git push --all`), and commitlint silently exits `0` on an empty/invalid range — so the hook's entire purpose (catching `--no-verify` bypasses) fails open with no warning. The `||` fallback is also dead code once `origin/main` and the pushed branch share a root commit (always true here), so it never actually falls back to `dev` even when that's the correct divergence point. The version above fixes both: it anchors to `$local_sha` and picks whichever of `main`/`dev` is the nearer merge-base.

---

## <a id="github-actions"></a>🎬 GitHub Actions

### Folder structure

This repo keeps things to three workflow files, plus composite actions for shared steps:

- `ci.yml` — `code-quality` + `check-licences` + `audit-deps` + `audit-actions` → `test`, called via `workflow_call` from both `staging.yml` and `release.yml`
- `staging.yml` — merge to `dev` triggers a staging build + deploy
- `release.yml` — push to `main` triggers automated versioning (semantic-release) and, when a release is published, building/pushing the release Docker images and syncing `dev` back onto `main` — all in one file, since `build-and-push` depends directly on the `release` job's output (`needs.release.outputs.released`) within the same workflow run (see the "Details" note under [Release workflow](#release-workflow))
- Building/pushing a Docker image is done via the `build-push-docker` **composite action**, used as a step in `staging.yml` and `release.yml` rather than a separate reusable workflow

The structure:

```
.github/
├── actions/
│   ├── setup-environment/
│   │   └── action.yml          # installs pnpm and node_modules
│   ├── build-push-docker/
│   │   └── action.yml          # builds and pushes a Docker image to Docker Hub
│   └── get-release-tag/
│       └── action.yml          # detects whether semantic-release published a new release
└── workflows/
    ├── ci.yml                  # code-quality + check-licences + audit-deps + audit-actions → test (called via workflow_call)
    ├── staging.yml             # push to dev → staging build/scan/push + webhook
    └── release.yml             # push to main → release (semantic-release) → build-and-push (conditional) → sync-dev (conditional)
```

### Shared

To avoid code duplication, **custom composite actions** and **reusable workflows** are used besides the available GitHub Actions

#### Custom composite actions

> ⚠️ GitHub requires that a composite action is defined in an action.yml (or action.yaml) file inside its own directory
>
> - ❌ Does not work: `.github/actions/build-push-docker.yml`
> - ✅ Works: `.github/actions/build-push-docker/action.yml`

The setup-environment action reads the packageManager field from package.json to auto-detect the pnpm version — no hardcoding needed

See:

- `.github/actions/setup-environment/action.yml`
- `.github/actions/build-push-docker/action.yml`
- `.github/actions/get-release-tag/action.yml`

#### Reusable workflows

A reusable workflow must declare `on: workflow_call:` in its YAML, and be defined directly at the root of `.github/workflows/` (not a subdirectory), to be callable from other workflows

> ⚠️ Secrets are **not** automatically inherited by reusable workflows and must be **explicitly** passed

This repo has one reusable workflow, `ci.yml`, called via `workflow_call` from `staging.yml` and `release.yml`. Building/pushing Docker images is a **composite action** (`build-push-docker`), used as a regular step rather than a `workflow_call` — see [Custom composite actions](#custom-composite-actions) above

See:

- `./github/workflows/ci.yml`

### Release workflow

#### Description

Automated semantic versioning **and** production release build, in a single workflow file (`release.yml`), triggered on push to `main`

`release.yml` runs semantic-release itself in a `release` job, then chains straight into a `build-and-push` job in the **same workflow run**, gated on that job's own output (`needs.release.outputs.released == 'true'`). Since a `[skip ci]` release commit doesn't fire `push`-event workflows on its own, keeping the build step in the same run avoids needing a second `push`- or `workflow_run`-triggered workflow to pick it up

#### Details

What happens on each push to `main`:

1. `code-quality` job calls `ci.yml` (same checks as every other workflow: `code-quality`, `check-licences`, `audit-deps`, `audit-actions` → `test`)

2. `release` job (needs `code-quality`) checks out full history and runs `pnpm exec semantic-release`, which:
   - Analyzes all commits since the last version tag
   - Determines the next version (patch / minor / major) based on commit types (`feat` → minor, `fix` → patch, `!`/breaking → major)
   - If a release is warranted: updates `version` in `package.json`, writes/updates `CHANGELOG.md`, commits both to `main` with `[skip ci]`, pushes a version tag (e.g. `v0.2.0`), and creates a GitHub Release with generated release notes
   - If no release-worthy commits → exits silently, nothing is pushed

3. The `get-release-tag` composite action (`.github/actions/get-release-tag/action.yml`) then detects whether a release actually happened this run. It compares the commit `HEAD` pointed at _before_ the `pnpm exec semantic-release` step ran (captured explicitly as a `before-sha` input) against whether a `v*.*.*` tag now points at `HEAD` _after_ — this distinguishes "a release was just published" from "HEAD already happened to sit on a pre-existing tag" (e.g. a push to `main` with no release-worthy commits since the last tag). semantic-release doesn't natively emit `GITHUB_OUTPUT`, so this is how `release`'s `released`/`version`/`sha` outputs are produced

4. `build-and-push` job (needs `release`; only runs `if: needs.release.outputs.released == 'true'`) checks out the release commit (`ref: needs.release.outputs.sha`) and builds + pushes the Docker image to Docker Hub, tagged `v<version>` and `latest`

5. `sync-dev` job (needs `release`; also only runs `if: needs.release.outputs.released == 'true'`) rebases `dev` onto `main` and force-pushes (`--force-with-lease`) — ensures `dev` picks up the version bump commit, per the [Linear History Workflow](github-linear-history-workflow.md)

   > ℹ️ On the normal path, `dev`'s new `HEAD` after this push is the `chore(release): ... [skip ci]` commit — GitHub's `[skip ci]` convention means `staging.yml` is **not** triggered by this push, which is expected: the rebased content is identical to what `main` already has, so redundantly rebuilding/redeploying staging would add nothing
   >
   > ⚠️ **If the rebase step fails (conflict):** nothing is pushed — the job fails safely, but `dev` stays behind `main` until someone resolves it manually. Fetch, check out `dev`, `git rebase origin/main`, resolve conflicts, then `git push --force-with-lease origin dev` — see [Linear History Workflow § Manually rebase `dev` onto `main`](github-linear-history-workflow.md#option-a--manually-rebase-dev-onto-main) for the exact steps rather than duplicating them here

#### Configuration file

- `.github/workflows/release.yml` (the workflow itself) plus `.releaserc.json` (semantic-release's own config, see [above](#releasercjson))

#### Trigger event

- push to `main` (via **local fast-forward merge**, `git merge --ff-only origin/dev` — see [Linear History Workflow](github-linear-history-workflow.md#2-dev--main-local-fast-forward-only) — there is no PR-to-`main` flow in this repo)

#### Workflow jobs

- `code-quality` — calls `ci.yml` (see [Reusable workflows](#reusable-workflows) above)

- `release` — runs semantic-release (version bump, changelog, tag, GitHub Release); declares `permissions: contents: write` at the job level

  > 🚦 Requires `code-quality` to succeed before it can run

- `build-and-push` — builds and pushes the Docker image; only runs when `release` actually published a version

  > 🚦 Requires `release` to succeed, and only runs `if: needs.release.outputs.released == 'true'`

- `sync-dev` — rebases `dev` onto `main` after release, so both branches stay non-divergent; declares `permissions: contents: write` at the job level

  > 🚦 Requires `release` to succeed, and only runs `if: needs.release.outputs.released == 'true'`

#### Key configuration

- `fetch-depth: 0` on the `release` job's checkout — full git history required; semantic-release reads all tags

- `persist-credentials: false` on the `release` and `build-and-push` jobs' checkouts — the standard hardening (see [`persist-credentials: false`](audit-github-actions.md#persist-credentials-false)). semantic-release's own git push (via `@semantic-release/git`) doesn't rely on the persisted checkout credential — it authenticates using the `GH_TOKEN` environment variable passed directly to the `pnpm exec semantic-release` step

- `sync-dev`'s checkout **intentionally omits** `persist-credentials: false` and instead passes `token: ${{ secrets.GH_TOKEN }}` directly, because this job needs a plain `git push` to work after the rebase — this is a documented, accepted `artipacked` exception (see [`docs/audit-github-actions.md`](audit-github-actions.md#zizmor--static-analysis))

- `HUSKY: "0"` — disables local git hooks in CI (set on the `release` and `sync-dev` steps that run git commands)

---

## <a id="github-configuration"></a>⚙️ GitHub Configuration

### General settings and branch rulesets

Refer to [Linear History Workflow | GitHub Configuration](./github-linear-history-workflow.md#github-configuration)

### Secrets and variables

_Repo → Settings → Secrets and variables → Actions_

| Secret                        | Description                                                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GH_TOKEN`                    | Classic PAT with `repo` + `workflow` scopes — used by semantic-release to push the release commit/tag to `main`, and by `sync-dev` to push the rebased `dev` branch. **Already configured** as a repository secret — see [below](#creating-the-gh_token-pat) |
| `DOCKERHUB_TOKEN`             | Docker Hub PAT — used to push images to Docker Hub repository                                                                                                                                                                                                |
| `WEBHOOK_SECRET_RAWG_STAGING` | HMAC shared secret — used by `staging.yml`'s `build-and-deploy` job to sign the `deploy-rawg-staging` webhook request. **Outstanding manual step** — see the manual GitHub-configuration checklist below                                                     |

> ℹ️ Secrets are **encrypted** and are used for sensitive data. Variables are shown as plain text and are used for **non-sensitive** data

| Variable             | Description                                                                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username — the Docker Hub repository itself is composed inline as `${{ vars.DOCKERHUB_USERNAME }}/rawg` in `staging.yml`/`release.yml`, no separate repository variable |
| `VPS_HOOKS_BASE_URL` | Base URL of the VPS webhook receiver (e.g. `https://hooks.example.com`) — used by `staging.yml` to build the `deploy-rawg-staging` hook URL. **Outstanding manual step**                |

### Creating the `GH_TOKEN` PAT

> ℹ️ **Already configured in this repo.** `GH_TOKEN` exists as a repository secret (confirmed via `gh secret list`). The steps below are kept as a reference for how it was created/how to rotate it, not something that needs to be done from scratch — see the [manual GitHub-configuration checklist](#manual-github-configuration-checklist) below for what should actually be verified.

_GitHub → Settings → Developer settings → Personal access tokens →_ **_Tokens (classic)_**

1. Click _Generate new token (classic, for general use)_

2. Give it a meaningful description (e.g. "_PAT used by semantic-release for the automated release workflow_")

3. Set an expiration date: `1 year` (⚠️ 90 days recommended in case of sensitive project)

4. Select scopes:
   - `repo` — for read/write access to the repo
   - `workflow` — needed since this PAT is documented (see the secrets table above) as requiring `repo` + `workflow` scopes; confirm both are actually granted (see checklist below)

5. Copy the token and add/update it as a repository secret named `GH_TOKEN`

### <a id="manual-github-configuration-checklist"></a>Manual GitHub-configuration checklist

The following cannot be automated by any script or plan — a human must confirm each of these directly in the GitHub UI:

- [ ] **`GH_TOKEN` scopes** (_Settings → Secrets and variables → Actions_): confirm the underlying PAT has both `repo` and `workflow` scopes
- [ ] **`main`'s branch ruleset bypass** (_Settings → Rules → Rulesets_): confirm the ruleset on `main` includes a bypass entry allowing `GH_TOKEN`'s associated identity to push directly — needed for `@semantic-release/git` to push the release commit + tag, and for `sync-dev` to push the rebased `dev` branch. Cross-reference the [`main` ruleset](github-linear-history-workflow.md#main-ruleset) recommendations already documented in the Linear History Workflow doc rather than duplicating them here
- [ ] **`dev`'s branch ruleset bypass** (_Settings → Rules → Rulesets_): confirm the ruleset on `dev` (which blocks force pushes and requires a PR, per the [`dev` ruleset](github-linear-history-workflow.md#dev-ruleset) documented in the Linear History Workflow doc) also includes a bypass entry for the same `GH_TOKEN` identity — `sync-dev` runs `git push --force-with-lease origin dev` directly, without a PR, and that push will fail on every release without this bypass
- [ ] **Actions permission to create GitHub Releases** (_Settings → Actions → General → Workflow permissions_): `@semantic-release/github` needs at least read/write repository permissions. This workflow authenticates primarily via `GH_TOKEN`, but it is **not confirmed** whether `@semantic-release/github`'s release-creation call ever falls back to the ambient `GITHUB_TOKEN` permissions in some configurations. Treat this as a **"verify it works on the first real run"** item rather than a confirmed mechanism
- [ ] **`WEBHOOK_SECRET_RAWG_STAGING` repository secret** (_Settings → Secrets and variables → Actions_): create this secret with the HMAC shared secret used by the `deploy-rawg-staging` hook — `staging.yml`'s `build-and-deploy` job needs it to sign the staging deploy request
- [ ] **`VPS_HOOKS_BASE_URL` repository variable** (_Settings → Secrets and variables → Actions_): create this variable with the VPS webhook receiver's base URL
- [ ] **`deploy-rawg-staging` hook in `vps-infra`**: confirm the hook exists with HMAC validation, matching `WEBHOOK_SECRET_RAWG_STAGING` above, analogous to the existing `deploy-rawg-prod` hook

## <a id="testing"></a>🧪 Testing

Ensure the whole CI/CD workflow is functional:

1. **Local commit validation:** Stage a file and try `git commit -m "bad message"` → should be rejected by commitlint. Try `git commit -m "feat: add something"` → should pass

2. **Commitizen:** Run `pnpm commit` → interactive prompt should guide through conventional commit format

3. **Pre-push validation:** Create a branch with a non-conventional commit (bypassing commit-msg with `-no-verify`), then push → pre-push hook should reject it

4. **Semantic release dry-run:** Run `GH_TOKEN=YOUR_PAT pnpm exec semantic-release --dry-run` locally (with `GH_TOKEN` set) to confirm it picks up `v0.1.0` as the baseline and correctly determines the next version from commits since that tag

5. **CI flow:** Push to `main` (via `git merge --ff-only origin/dev` locally, per [Linear History Workflow](github-linear-history-workflow.md#2-dev--main-local-fast-forward-only) — there is no PR-to-`main` flow in this repo's linear-history setup) with `feat:`/`fix:`/etc. commits since the last tag → `release.yml`'s `release` job should run and publish a new tag (e.g. `v0.2.0`) → its `build-and-push` job should run automatically in the same workflow run → `sync-dev` should rebase `dev` onto `main`

---

## <a id="pre-validation"></a>✅ Pre-validation

Preview what the next release would be without pushing anything:

```sh
GH_TOKEN=your_pat pnpm exec semantic-release --dry-run
```

This prints the next version, the changelog entries, and what would be committed/tagged — without writing anything to the repository
