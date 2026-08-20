# License Auditing

## Table of Contents

- [📋 Overview](#overview)
- [🔒 CI Audit Job](#ci-audit-job)
  - [Tool](#tool)
  - [Policy](#policy)
  - [Job placement](#job-placement)
- [📜 `scripts/check-licences.sh`](#scriptscheck-licencessh)
  - [Why a script, not a config file](#why-a-script-not-a-config-file)
  - [Local audit](#local-audit)
- [➕ Adding a new exception](#adding-a-new-exception)
- [🗒️ Current exceptions](#current-exceptions)

## <a id="overview"></a>📋 Overview

License auditing blocks dependencies under strong-copyleft licenses (GPL, AGPL, LGPL, SSPL) from landing in this repo. Unlike vulnerability scanning (`audit-deps`, a separate concern), license risk isn't about what ships to users — it's about what legal obligations a dependency's license places on this repo if used, which applies to the full dependency tree, not just production dependencies

## <a id="ci-audit-job"></a>🔒 CI Audit Job

### <a id="tool"></a>Tool

[`license-checker-rseidelsohn`](https://github.com/RSeidelsohn/license-checker-rseidelsohn) — a maintained fork of the original (now-unmaintained) `license-checker`. Run via `pnpm dlx` with no extra installation, consistent with the `audit-actions`/zizmor pattern. Pinned to `@5.0.1` (rather than floating to `latest`) for reproducibility — the exceptions list below is baselined against this version's behaviour, and the tool has been observed to bump major versions within an hour

### <a id="policy"></a>Policy

| Tier                      | Licenses                                                                                                                                                                                                                   | Behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Base allowlist**        | `MIT`, `ISC`, `BSD-2-Clause`, `BSD-3-Clause`, `Apache-2.0`                                                                                                                                                                 | Always passes — the standard "always-safe" permissive set most companies use as their unconditionally-approved tier                                                                                                                                                                                                                                                                                                                        |
| **Documented exceptions** | Currently 29 packages under other permissive/public-domain licenses (`OFL-1.1`, `BlueOak-1.0.0`, `MIT-0`, `CC0-1.0`, `0BSD`, `Unlicense`, `Python-2.0`, `CC-BY-4.0`, `MPL-2.0`, `Artistic-2.0`, `Apache 2.0`, `CC-BY-3.0`) | Passes — but only the specific package names listed in `scripts/check-licences.sh`, each with a justification. See [Current exceptions](#current-exceptions). Entries are **bare package names, not `package@version`** — `--excludePackages` matches by name only, so a routine dependency bump doesn't break CI on an already-reviewed package. A genuinely new package under a non-base license still fails CI until reviewed and added |
| **Hard block**            | Anything else, including `GPL-*`, `AGPL-*`, `LGPL-*`, `SSPL-*`                                                                                                                                                             | Fails the job                                                                                                                                                                                                                                                                                                                                                                                                                              |

> ℹ️ **Why per-package exceptions instead of a broader allowlist?** A real dependency tree always contains a long tail of differently-named-but-equally-permissive licenses (license variants, public-domain dedications, font licenses) that a short hand-picked allowlist will never fully anticipate. Widening `--onlyAllow` to cover every license type seen once would let a _future_ dependency under any of those types pass silently, with no review trigger. Naming exact package exceptions means a new package under `OFL-1.1` (for example) still fails CI until a human reviews and explicitly adds it — same principle as this repo's `.audit-ci.json`/`.trivyignore` allowlists for `audit-deps`/Docker scanning (see [`docs/audit-deps.md`](audit-deps.md) and [`docs/audit-docker-images.md`](audit-docker-images.md))

### <a id="job-placement"></a>Job placement

`check-licences` runs in parallel with `code-quality`, `audit-actions`, and `audit-deps`. `test` is gated on all four:

```
code-quality   ─┐
audit-actions   ├──> test
check-licences  │
audit-deps     ─┘
```

There's no dependency between these four jobs — running them in parallel gives the fastest possible feedback

## <a id="scriptscheck-licencessh"></a>📜 `scripts/check-licences.sh`

### <a id="why-a-script-not-a-config-file"></a>Why a script, not a config file

`license-checker-rseidelsohn` has no config-file support (verified against its current docs/`--help` output — only `--customPath` for output formatting and `--clarificationsFile` for per-package license-text clarifications exist, neither is a general flag replacement). The full invocation — a base allowlist plus 29 named exceptions — is too long and unreadable as a single inline CI `run:` command or a one-line `package.json` script, and neither of those formats allows a comment explaining _why_ each exception exists

`scripts/check-licences.sh` solves this the same way this repo's other operational scripts do (`scripts/deploy-prod.sh`, `scripts/monitor-webhook.sh`): a checked-in, commented shell script that both CI and local developers invoke identically — one source of truth, readable diffs, and a one-line justification comment next to every exception

### <a id="local-audit"></a>Local audit

```sh
./scripts/check-licences.sh
```

If the script reports a violation, the output names the exact package, its version, and its license

## <a id="adding-a-new-exception"></a>➕ Adding a new exception

When a new dependency lands under a license outside the base allowlist:

1. Confirm the license is genuinely permissive or public-domain — not `GPL`/`AGPL`/`LGPL`/`SSPL` or another share-alike license that would impose obligations on this repo. If it IS copyleft, do not add an exception — replace the dependency or get explicit sign-off first
2. Add the bare package name to the `EXCLUDED_PACKAGES` array in `scripts/check-licences.sh`, with a trailing `# LICENSE — one-line justification` comment matching the existing entries' style
3. Run `./scripts/check-licences.sh` locally to confirm it now passes
4. **The PR must explain the addition** — which package, which license, why it's being trusted (same convention as this repo's `.audit-ci.json`/`.trivyignore` exceptions): what the license requires, whether it's reachable in a way that matters for this app, and why no base-allowlist alternative exists

## <a id="current-exceptions"></a>🗒️ Current exceptions

| Package                                    | License            | Justification                                                                                                                                                                                                                                          |
| ------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@fontsource-variable/fredoka`             | `OFL-1.1`          | SIL Open Font License — standard permissive font license, commercial use allowed, no share-alike on the app itself                                                                                                                                     |
| `@fontsource-variable/geist`               | `OFL-1.1`          | same as above                                                                                                                                                                                                                                          |
| `@fontsource-variable/nunito`              | `OFL-1.1`          | same as above                                                                                                                                                                                                                                          |
| `isexe`                                    | `BlueOak-1.0.0`    | OSI-recognized permissive license, functionally equivalent to MIT/BSD                                                                                                                                                                                  |
| `lru-cache`                                | `BlueOak-1.0.0`    | same as above                                                                                                                                                                                                                                          |
| `minimatch`                                | `BlueOak-1.0.0`    | same as above                                                                                                                                                                                                                                          |
| `@csstools/color-helpers`                  | `MIT-0`            | MIT with no attribution requirement — strictly more permissive than plain MIT                                                                                                                                                                          |
| `@csstools/css-syntax-patches-for-csstree` | `MIT-0`            | same as above                                                                                                                                                                                                                                          |
| `language-subtag-registry`                 | `CC0-1.0`          | public domain dedication                                                                                                                                                                                                                               |
| `mdn-data`                                 | `CC0-1.0`          | public domain dedication                                                                                                                                                                                                                               |
| `type-fest`                                | `(MIT OR CC0-1.0)` | dual-licensed, either option is permissive                                                                                                                                                                                                             |
| `tslib`                                    | `0BSD`             | zero-clause BSD — strictly more permissive than BSD-2-Clause                                                                                                                                                                                           |
| `isbot`                                    | `Unlicense`        | public domain dedication                                                                                                                                                                                                                               |
| `argparse`                                 | `Python-2.0`       | permissive, OSI-approved                                                                                                                                                                                                                               |
| `caniuse-lite`                             | `CC-BY-4.0`        | attribution-only license on browser compatibility data, not application code                                                                                                                                                                           |
| `axe-core`                                 | `MPL-2.0`          | weak/file-level copyleft — share-alike applies only to modifications of MPL-licensed files themselves; this repo doesn't modify axe-core's source, so no obligation is triggered on the app. Widely accepted commercially (Mozilla, Adobe use MPL-2.0) |
| `lightningcss`                             | `MPL-2.0`          | same reasoning as above                                                                                                                                                                                                                                |
| `chownr`                                   | `BlueOak-1.0.0`    | transitive via `@semantic-release/npm` > `npm` — same reasoning as `isexe`/`lru-cache`/`minimatch` above                                                                                                                                               |
| `common-ancestor-path`                     | `BlueOak-1.0.0`    | same, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                                   |
| `glob`                                     | `BlueOak-1.0.0`    | same, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                                   |
| `minipass-flush`                           | `BlueOak-1.0.0`    | same, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                                   |
| `minipass`                                 | `BlueOak-1.0.0`    | same, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                                   |
| `npm`                                      | `Artistic-2.0`     | OSI-approved permissive, no share-alike; bundled CLI used only as a devDependency transitive of `@semantic-release/npm`                                                                                                                                |
| `path-scurry`                              | `BlueOak-1.0.0`    | same, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                                   |
| `qrcode-terminal`                          | `Apache 2.0`       | permissive, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                             |
| `spdx-exceptions`                          | `CC-BY-3.0`        | attribution-only, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                       |
| `spdx-license-ids`                         | `CC0-1.0`          | public domain dedication, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                               |
| `tar`                                      | `BlueOak-1.0.0`    | same, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                                   |
| `yallist`                                  | `BlueOak-1.0.0`    | same, transitive via `@semantic-release/npm` > `npm`                                                                                                                                                                                                   |

> ⚠️ **Why this list can grow without a code change here:** most of these entries (12 of 29) are transitive dependencies of `npm`, itself a transitive dependency of `@semantic-release/npm` — not something this repo depends on directly. `npm`'s own dependency tree can shift between `pnpm install` runs as its own semver range resolves to a newer version, which can introduce or drop packages under non-base licenses without any change to this repo's own `package.json`. Re-run `./scripts/check-licences.sh` after any lockfile update to catch this early

The repo's own root package (`rawg@0.1.9`, `"private": true`, no `license` field) is excluded via `--excludePrivatePackages` — not a third-party dependency, no justification needed

This table must stay in sync with `scripts/check-licences.sh` — treat the script as the source of truth if they ever diverge
