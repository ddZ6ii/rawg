# Dependency Security Auditing

## Table of Contents

- [📋 Overview](#overview)
- [🔒 CI Audit Job](#ci-audit-job)
  - [Tool](#tool)
  - [Scope](#scope)
  - [Severity gate](#severity-gate)
  - [Job placement](#job-placement)
  - [Allowlist — handling known false positives](#allowlist--handling-known-false-positives)
  - [Local audit](#local-audit)
  - [Fixing a vulnerability](#fixing-a-vulnerability)
- [🤖 Dependabot](#dependabot)
  - [Purpose](#purpose)
  - [Local configuration](#local-configuration)
  - [GitHub configuration](#github-configuration)
  - [Conventional commits integration](#conventional-commits-integration)
  - [Linear history](#linear-history)
  - [Known limitation](#known-limitation)

## <a id="overview"></a>📋 Overview

Dependency security scanning operates at two levels:

| Layer             | Tool       | Role                                                                        |
| ----------------- | ---------- | --------------------------------------------------------------------------- |
| **CI pipeline**   | `audit-ci` | Blocks shipping when a vulnerable dependency is detected                    |
| **Proactive PRs** | Dependabot | Automatically opens bump PRs to fix vulnerabilities before they're detected |

The two are complementary: Dependabot helps you fix issues proactively; the CI job ensures nothing vulnerable ships if Dependabot PRs are delayed or ignored

## <a id="ci-audit-job"></a>🔒 CI Audit Job

### <a id="tool"></a>Tool

[`audit-ci`](https://github.com/IBM/audit-ci) — a CI-focused wrapper around `pnpm audit` (npm advisory database)

Run via `pnpm dlx` with no extra installation (consistent with the existing `check-licences` job pattern):

```sh
pnpm dlx audit-ci@7.1.0 --config .audit-ci.json
```

Chosen over raw `pnpm audit` for one reason:

- **Allowlist support** — individual CVEs can be explicitly accepted when no fix is available

- **Better CI output** — structured summary instead of raw audit output

### <a id="scope"></a>Scope

DevDependencies are excluded: they never ship to users, so a vulnerability in a test runner or build tool poses no direct user risk and would generate noise without reducing real exposure

> ℹ️ **Scoping mechanism:** `audit-ci` has no `production` config key — it never existed, for any package manager. The real mechanism is `"skip-dev": true` in `.audit-ci.json`, which (combined with `"package-manager": "pnpm"`) makes audit-ci internally append `--prod` to the underlying `pnpm audit` call

### <a id="severity-gate"></a>Severity gate

Blocks on **high and critical** vulnerabilities (CVSS ≥ 7.0)

| Threshold           | CVSS range | Rationale                                                                                 |
| ------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| `critical` only     | ≥ 9.0      | Too permissive — real exploitable vulns in the 7–8.9 range silently pass                  |
| **`high`** (chosen) | **≥ 7.0**  | **Good signal-to-noise ratio — catches exploitable vulns without false-positive fatigue** |
| `moderate`          | ≥ 4.0      | Too noisy — many low-priority advisories have no available fix                            |

### <a id="job-placement"></a>Job placement

`audit-deps` runs in parallel with `code-quality`, `check-licences`, and `audit-actions`. The `test` job is gated on all four:

```
code-quality   ─┐
check-licences  │
audit-deps      ├──> test
audit-actions   ┘
```

There is no dependency between linting and auditing deps — running them in parallel gives the fastest possible feedback. Docker image builds are gated on `code-quality` passing (not specifically on `test`) — see [`docs/audit-github-actions.md`](audit-github-actions.md) and [`docs/semantic-release-install-guide.md`](semantic-release-install-guide.md) for the actual job graphs

### <a id="allowlist--handling-known-false-positives"></a>Allowlist — handling known false positives

When a vulnerability has no available fix and the risk has been consciously accepted, add its advisory ID to `.audit-ci.json`:

```json
{
  "high": true,
  "package-manager": "pnpm",
  "skip-dev": true,
  "allowlist": ["GHSA-xxxx-xxxx-xxxx"]
}
```

**The allowlist entry must be accompanied by a PR comment explaining:**

- Which advisory is being allowed and what it is (e.g. ReDoS in minimatch)
- Whether it appears in production deps (`pnpm audit --prod` — if absent, no production impact)
- Why no fix is currently available (e.g. upstream package hasn't released a patched version)
- What mitigations are in place (if any)
- A plan to remove the allowlist entry once a fix is released (e.g. Dependabot will open a PR when upstream releases a fix)

This keeps the allowlist auditable via version history

**Example**

| Advisory              | Affected paths                                                                | Reason                                                                                                                                                                                                               | Remove when                                                                                |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `GHSA-3ppc-4f35-3m26` | `commitizen > glob > minimatch` / `eslint-plugin-react-dom > ... > minimatch` | devDep only (confirmed: absent from `pnpm audit --prod`). No upstream fix available as of Feb 2026. ReDoS only exploitable when user-controlled input is passed as a glob pattern — not applicable to build tooling. | `commitizen` / `eslint-plugin-react-dom` release versions with minimatch ≥ 3.1.3 / ≥ 9.0.6 |

### <a id="local-audit"></a>Local audit

You can audit locally your dependencies (instead of waiting to see the CI output) by running the command:

```sh
pnpm dlx audit-ci@7.1.0 --config .audit-ci.json
```

If audit-ci is properly configured, the output should be the **same** as running:

```sh
pnpm audit --audit-level high --prod
```

### <a id="fixing-a-vulnerability"></a>Fixing a vulnerability

If security issues are found, try to update your dependencies via `pnpm update <your-package-name>`

If a simple update does not fix all the issues, use **overrides** to force versions that are not vulnerable. For instance, if `lodash@<2.1.0` is vulnerable, use this overrides to force `lodash@^2.1.0` by running `pnpm audit --fix`. This will automatically create the `pnpm-workspace.yaml file`:

```yaml
overrides:
  'lodash@<2.1.0': '^2.1.0'
```

## <a id="dependabot"></a>🤖 Dependabot

### <a id="purpose"></a>Purpose

Dependabot scans `package.json` and `pnpm-lock.yaml` weekly and **automatically** opens PRs to bump vulnerable dependencies. Each PR triggers the full CI pipeline, including the `audit-deps` job

> ⚠️ **Correction:** there is no `security-updates-only` key in Dependabot's schema — it does not exist, for any ecosystem. "PRs only for security fixes, not routine bumps" is achieved via `open-pull-requests-limit: 0` (caps routine version-update PRs at zero; security-update PRs use a separate quota and are unaffected) combined with `groups.applies-to: security-updates` for consolidation. Dependabot _security updates_ (the feature that actually detects CVEs and opens fix PRs) is a separate, repo-settings-level toggle (Settings → Code security → Dependabot security updates) — independent of `dependabot.yml` entirely. See the [`npm`/`docker` entries in `.github/dependabot.yml`](../.github/dependabot.yml) for the real config

> ℹ️ Dependabot does not natively support `pnpm` but reads pnpm projects correctly via the `npm` ecosystem setting

### <a id="local-configuration"></a>Local configuration

#### Configuration file

- `.github/dependabot.yml`

#### Key options

| Option                               | Value              | Effect                                                                                                                                 |
| ------------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `open-pull-requests-limit`           | `0`                | Caps routine version-update PRs at zero (`npm`/`docker` only). Security-update PRs use a separate quota and are **not** capped by this |
| `groups.security-updates.applies-to` | `security-updates` | Consolidates all security-update fixes within an ecosystem into a single PR instead of one per package                                 |
| `rebase-strategy: auto`              | rebase             | Keeps PR branch rebased — no merge commits in PR history                                                                               |

### <a id="github-configuration"></a>GitHub configuration

> ⚠️ **Target state, not current state:** this is the recommended configuration for repo-level Dependabot settings. As of now, **Dependabot alerts** and **Dependabot security updates** have **not** been enabled — this is the outstanding manual step called out in [the README's Dependabot summary](../README.md#cicd). Until a human enables them in the settings page below, `npm`/`docker` get zero Dependabot PRs at all (routine version updates are capped at `0` by `dependabot.yml`, and security updates aren't switched on yet to fill the gap)

#### General

_Settings → General → Security → Advanced Security_

The following options should be enabled:

- ✅ Dependency graph
- ⬜ Dependabot alerts — **not yet enabled**
- ✅ Dismiss low-impact alerts for development-scoped dependencies
- ⬜ Dependabot security update — **not yet enabled**
- ✅ Grouped security updates
- ✅ Protection rules threshold
  - Security alert security level: **High or higher**
  - Standard alert security level: **Only errors**

#### Branch rulesets

_Settings → General → Rules → Rulesets_

The following options should be enabled for each protected branch:

- ✅ Require code scanning results
  - Tool: **CodeQL**
  - Security alerts: **High or higher**
  - Alerts: **Errors**

### <a id="conventional-commits-integration"></a>Conventional commits integration

Dependabot commits are configured to follow the project's [Conventional Commits](../README.md#contributing) convention:

| Dependency type | Commit message example                             |
| --------------- | -------------------------------------------------- |
| Production dep  | `chore(deps): bump lodash from 4.17.20 to 4.17.21` |
| Dev dep         | `chore(deps-dev): bump vitest from 1.0.0 to 1.1.0` |

The `include: "scope"` setting adds `(deps)` or `(deps-dev)` automatically. The `prefix-development: "chore"` setting maps dev dependencies to the `chore` type

### <a id="linear-history"></a>Linear history

`rebase-strategy: "auto"` instructs Dependabot to rebase its PR branch onto the base branch whenever the base branch is updated, rather than creating a merge commit in the PR branch

Combined with the repo's squash-only merge strategy, Dependabot PRs land as a single squash commit — no merge commits pollute the history

### <a id="known-limitation"></a>Known limitation

Dependabot's `commit-message` config has no `prefix-security` option. It cannot natively emit `fix(deps):` for security-motivated updates. All Dependabot commits use the `chore` prefix regardless of whether the bump fixes a vulnerability or is a routine update

This is a known Dependabot limitation with no current workaround via config
