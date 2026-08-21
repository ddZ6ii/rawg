# Linear History Workflow

## Table of Contents

- [📋 Overview](#overview)
- [🎯 Goals](#goals)
- [🧩 Challenges](#challenges)
  - [GitHub PRs cannot do fast-forward merges natively](#github-prs-cannot-do-fast-forward-merges-natively)
  - [The release CI workflow introduces branch divergence](#the-release-ci-workflow-introduces-branch-divergence)
- [Solutions](#solutions)
  - [GitHub PRs cannot do fast-forward merges natively](#github-prs-cannot-do-fast-forward-merges-natively-1)
  - [The release CI workflow introduces branch divergence](#the-release-ci-workflow-introduces-branch-divergence-1)
    - [Option A — Manually rebase `dev` onto `main`](#option-a--manually-rebase-dev-onto-main)
    - [Option B — Automated rebase `dev` onto `main`](#option-b--automated-rebase-dev-onto-main)
- [🛡️ Protection Rules](#protection-rules)
  - [Git configuration](#git-configuration)
  - [GitHub configuration](#github-configuration)
    - [General settings](#general-settings)
    - [Branch protection rules](#branch-protection-rules)
      - [`dev` ruleset](#dev-ruleset)
      - [`main` ruleset](#main-ruleset)
- [🔁 Recommended Workflow](#recommended-workflow)
  - [1. `feature` → `dev` (rebase + fast-forward)](#1-feature--dev-rebase--fast-forward)
  - [2. `dev` → `main` (local fast-forward only)](#2-dev--main-local-fast-forward-only)
  - [3. After semantic release: forward-port the release commit to `dev`](#3-after-semantic-release-forward-port-the-release-commit-to-dev)
    - [Option A — Manually rebase `dev` onto `main`](#option-a--manually-rebase-dev-onto-main-1)
    - [Option B — Automate it with a GitHub Action](#option-b--automate-it-with-a-github-action)
- [🫡 Key Discipline](#key-discipline)
- [🚀 Quick Reference Sheet](#quick-reference-sheet)

---

## <a id="overview"></a>📋 Overview

Recommended Git/GitHub **workflow compatible with semantic release** to achieve a clean, **linear commit history with no merge commits**. This workflow relies on the [Branching Strategy](github-branching-strategy.md)

## <a id="goals"></a>🎯 Goals

This workflow enables:

- ✅ Strictly **linear history**
- ✅ **No merge commits**
- ✅ **No duplicate** rewritten commits _(⚠️ only via CI automation or discipline)_
- ✅ **No branch divergence** _(⚠️ only via CI automation or discipline)_

## <a id="challenges"></a>🧩 Challenges

### GitHub PRs cannot do fast-forward merges natively

> ⚠️ GitHub's "Rebase and merge" **always creates new SHAs**, even when the branch has not diverged and a true fast-forward would technically be possible!

This is a known GitHub behaviour — it rewrites each commit with new metadata, producing new SHAs regardless of the situation

As a consequence, using "Rebase and merge" for the `dev` → `main` promotion would cause the two branches to permanently diverge (same code, different SHAs), which Git sees as unrelated commits

The same applies for the `feature` → `dev` promotion but with little or no consequence since the feature branch is typically not shared and short-lived

> ℹ️ GitLab natively handles fast-forward merges

### The release CI workflow introduces branch divergence

After a push on `main`, the CI release workflow is triggered. As a result, semantic release pushes a new commit onto `main` (version bump, changelog, etc.). Now `main` has a commit `dev` doesn't. The moment that happens, these branches **diverge**

👉 We need to get that commit onto `dev` **without merge commits** and **without rewriting history**

## <a id="solutions"></a>✅ Solutions

### GitHub PRs cannot do fast-forward merges natively

To avoid this, the `dev` → `main` promotion can be done locally via `git merge --ff-only` and pushed directly to the remote

### The release CI workflow introduces branch divergence

Here there are two options to sync back `dev` with `main` after a release commit is made:

#### Option A — Manually rebase `dev` onto `main`

Replay any commits on `dev` that aren't on `main` on top of the release commit. If you just fast-forwarded `dev` into `main`, there are no extra commits on `dev`, so this is just a fast-forward and `dev` catches up cleanly. **This is the ideal case** — if you always fully merge `dev` into `main` before the release, the rebase is trivial

```bash
git fetch origin
git checkout dev
git rebase origin/main
git push --force-with-lease origin dev
```

#### Option B — Automated rebase `dev` onto `main`

Automate the syncing after the release commit via a dedicated CI job — see the `sync-dev` job in `release.yml` ([Semantic Release Installation Guide § Release workflow](./semantic-release-install-guide.md#release-workflow))

## <a id="protection-rules"></a>🛡️ Protection Rules

This workflow must be **enforced** by both local git config rules and GitHub repository rules

### Git configuration

Add these rules to your `~/.gitconfig` (global) or `.git/config` (per-repo) to ensure that when you pull or merge locally, only fast-forward operations are allowed, and pulls rebase instead of creating merge commits

```ini
# ~/.gitconfig
[branch]
    # Warn if a pull would create a merge commit
    autosetuprebase = always

[pull]
    # Only allow fast-forward pulls; fail loudly otherwise
    ff = only

[merge]
    # Refuse to create merge commits
    ff = only

[rebase]
    # Automatically stash dirty working tree before rebase, restore after
    autoStash = true
    # Update dependent branches when rebasing a chain
    updateRefs = true

[push]
    # Push the current branch to a remote branch of the same name when running `git push`
    default = current
    # Require explicit --force; disables bare `--force`
    useForceIfIncludes = true

[core]
    autocrlf = input    # Linux/macOS; use 'true' on Windows
```

### GitHub configuration

> ⚠️ This setup gives you fully linear history on both branches with no divergence, but it requires the **discipline** of not landing work on `dev` while a release is in flight

#### General settings

_Settings -> General_

- **Default branch:** `dev` — the "base" branch against which all pull requests and code commits are automatically made
- **Pull requests:**
  - Ensure a single commit per feature branch and clean linear history (no merge commits):
    - ❌ Allow merge commits
    - ✅ Allow squash merging
    - ❌ Allow rebase merging
  - Enhance workflow:
    - ✅ Always suggest updating pull request branches
    - ✅ Automatically delete head branches

#### Branch protection rules

_Settings → Rules → New ruleset_

##### `dev` ruleset

Ensure only squash rebase merges via PR but also allows direct pushes from the sync automation:

| Setting                | Value                                                          |
| ---------------------- | -------------------------------------------------------------- |
| **Ruleset Name**       | `dev`                                                          |
| **Enforcement status** | Active                                                         |
| **Bypass list**        | `Write` (role) — allows repo maintainer and CI tools to bypass |
| **Target branch**      | `dev`                                                          |

**Branch rules**

- ✅ Restrict deletions
- ✅ Require linear history
- ✅ Require a pull request before merging
  - ✅ Required approvals: `0` (solo project) / min. `1` (team project)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require approval of the most recent reviewable push
  - ✅ Require conversation resolution before merging
  - ✅ Allowed merge methods: **squash**
- ✅ Require status checks to pass
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks that are required: select your CI jobs like: `code-quality`, `check-licences`, `audit-deps`, `test`, etc.
- ✅ Block force pushes
- ✅ Require code scanning results (CodeQL, Security alerts: High or higher, Alerts: Errors)
- ✅ Require code quality results (Severity: Errors)

##### `main` ruleset

Ensure only rebase merges via PR but more importantly allows direct pushes from both the repo maintainer and the sync automation (to ensure only local fast-forward merges):

| Setting                | Value                                                          |
| ---------------------- | -------------------------------------------------------------- |
| **Ruleset Name**       | `main`                                                         |
| **Enforcement status** | Active                                                         |
| **Bypass list**        | `Write` (role) — allows repo maintainer and CI tools to bypass |
| **Target branch**      | `main`                                                         |

**Branch rules:**

- ✅ Restrict deletions
- ✅ Require linear history
- ✅ Require a pull request before merging
- ✅ Required approvals: `0` (solo project) / min. `1` (team project)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require approval of the most recent reviewable push
- ✅ Require conversation resolution before merging
- ✅ Allowed merge methods: **rebase**
- ✅ Require status checks to pass
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks that are required: select your CI jobs like: `code-quality`, `check-licences`, `audit-deps`, `test`, etc.
- ✅ Block force pushes
- ✅ Require code scanning results (CodeQL, Security alerts: High or higher, Alerts: Errors)
- ✅ Require code quality results (Severity: Errors)

## <a id="recommended-workflow"></a>🔄 Recommended Workflow

### 1. `feature` → `dev` (rebase + fast-forward)

```bash
# On your feature branch
git fetch origin
git rebase origin/dev
git push --force-with-lease origin feature-branch
```

Then merge the PR into `dev` using **"Squash and merge"** (ensures a single commit per feature) on GitHub — never a merge commit. Configure this in your repo settings by disabling the "Allow merge commits" option for PRs targeting `dev`

### 2. `dev` → `main` (local fast-forward only)

When `dev` is ready for production, you want a fast-forward merge into `main`

> 🖐️ **Problem:** GitHub PRs **cannot do fast-forward merges natively!**

You need to handle this locally:

```bash
git fetch origin
git checkout main
git merge --ff-only origin/dev
git push origin main
```

### 3. After semantic release: forward-port the release commit to `dev`

This is the crux of the problem. Semantic release pushes a commit (version bump, changelog, etc.) onto `main`. Now `main` has a commit `dev` doesn't

You have two options:

#### Option A — Manually rebase `dev` onto `main`

```bash
git fetch origin
git checkout dev
git rebase origin/main
git push --force-with-lease origin dev
```

#### Option B — Automate it with a GitHub Action

> ⚠️ You need to **create a GitHub Personal Access Token (PAT)** with the proper `scopes` and then add it to your GitHub repository secrets. See [Creating Github PAT `GH_TOKEN`](./semantic-release-install-guide.md#creating-the-gh_token-pat)

See the `sync-dev` job in `release.yml` (this repo keeps semantic-release, `build-and-push`, and `sync-dev` together in one file rather than splitting into a separate `semantic-release.yml` — see [`docs/semantic-release-install-guide.md`](./semantic-release-install-guide.md) for why)

## <a id="key-discipline"></a>🫡 Key Discipline

> ⚠️ This setup gives you fully linear history on both branches with no divergence, but it requires the discipline of **not landing work on `dev` while a release is in flight**. If you don't **freeze** `dev` and let feature branches land on `dev` between steps 3 and 4, you'll get a rebase that rewrites those commits — which is the "duplicate/rewritten commits" problem you want to avoid

The workflow **only** stays linear and non-divergent if you follow this order **strictly**:

1. Merge all feature branches into `dev` via rebase-and-merge (or squash rebase)
2. Fast-forward `main` to `dev` (they are now identical)
3. Semantic release adds its commit to `main` (now `main` is one ahead)
4. Immediately rebase/fast-forward `dev` onto `main` (now identical again)
5. **Only then** start merging new feature branches into `dev`

## <a id="quick-reference-sheet"></a>🚀 Quick Reference Sheet

```bash
# 1. Create a new feature branch from dev
git checkout dev
git fetch origin
git merge --ff-only origin/dev
git checkout -b feature
# … develop …
git add . && git commit -m "feat: your feature"
git rebase origin/dev
git push --force-with-lease origin feature

# 2. GitHub PR + squash merge to dev

# 3. Promote dev → main (local fast-forward)
git fetch origin
git checkout main
git merge --ff-only origin/dev
git push origin main

# 4. Rebase dev onto main (forward-port semantic release commit)
git fetch origin
git checkout dev
git rebase origin/main
git push --force-with-lease origin dev

# 5. Repeat the process
```
