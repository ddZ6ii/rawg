# Branching Strategy

## Table of Contents

- [🪾 Branch Structure](#branch-structure)
  - [Long-lived branches](#long-lived-branches)
  - [Short-lived branches](#short-lived-branches)
- [📕 Branch Naming Convention](#branch-naming-convention)
- [🔁 Branching Workflow](#branching-workflow)

---

## <a id="branch-structure"></a>🪾 Branch Structure

### Long-lived branches

- **`dev`** — the _staging_ branch. All feature branches are merged here first (only via PR) for integration testing before going to production

- **`main`** — the _production_, always-stable branch. Only receives merges from `dev` (only via local fast-forward merges to ensure commit SHA preservation). Refer to [Linear History Workflow](github-linear-history-workflow.md)

### Short-lived branches

`feat/`, `fix/`, `refactor/`, etc. (see [Branch Naming Convention](#branch-naming-convention) below) — one task each, always created from `dev`

---

## <a id="branch-naming-convention"></a>📕 Branch Naming Convention

The branch naming convention follows the [Conventional Commits](https://www.conventionalcommits.org) specification

| Prefix      | Use case                                | Example                         |
| ----------- | --------------------------------------- | ------------------------------- |
| `feat/`     | New feature                             | `feat/user-authentication`      |
| `fix/`      | Bug fix                                 | `fix/fix-login-redirect`        |
| `ci/`       | CI/CD tasks                             | `ci/setup-semantic-release`     |
| `docs/`     | Documentation only                      | `docs/api-endpoints`            |
| `refactor/` | Code restructuring                      | `refactor/extract-auth-service` |
| `perf/`     | Performance improvement                 | `perf/add-db-indexing`          |
| `test/`     | Add/update tests                        | `test/user-auth-e2e-tests`      |
| `style/`    | Code style (formatting, etc.)           | `style/fix-unformatted-code`    |
| `chore/`    | Maintenance tasks (tooling, deps, etc.) | `chore/update-eslint-config`    |

---

## <a id="branching-workflow"></a>🔁 Branching Workflow

Refer to [Linear History Workflow](github-linear-history-workflow.md)
