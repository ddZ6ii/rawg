#!/bin/bash
# Audits dependency licenses via license-checker-rseidelsohn.
# Blocks strong-copyleft licenses (GPL/AGPL/LGPL/SSPL) from landing as dependencies.
# Run locally to preview findings before pushing: ./scripts/check-licences.sh

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

# Base allowlist — always-safe permissive licenses.
ALLOWED_LICENSES='MIT;ISC;BSD-2-Clause;BSD-3-Clause;Apache-2.0'

# Packages under legitimately permissive/public-domain licenses outside the
# base allowlist, each with a one-line justification. Entries are bare
# package names (no version) so routine dependency bumps don't break CI —
# a NEW package under a non-base license still fails CI until reviewed and
# added here; this is a documented per-package allowlist, not a broadened
# license-type allowlist.
EXCLUDED_PACKAGES=(
  '@fontsource-variable/fredoka'              # OFL-1.1 — SIL Open Font License, commercial use allowed, no share-alike on the app
  '@fontsource-variable/geist'                # OFL-1.1 — same as above
  '@fontsource-variable/nunito'               # OFL-1.1 — same as above
  'isexe'                                     # BlueOak-1.0.0 — OSI-recognized permissive, equivalent to MIT/BSD
  'lru-cache'                                 # BlueOak-1.0.0 — same as above
  'minimatch'                                 # BlueOak-1.0.0 — same as above
  '@csstools/color-helpers'                   # MIT-0 — MIT without attribution requirement
  '@csstools/css-syntax-patches-for-csstree'  # MIT-0 — same as above
  'language-subtag-registry'                  # CC0-1.0 — public domain dedication
  'mdn-data'                                  # CC0-1.0 — public domain dedication
  'type-fest'                                 # (MIT OR CC0-1.0) — dual-licensed, either permissive
  'tslib'                                     # 0BSD — zero-clause BSD, more permissive than BSD-2-Clause
  'isbot'                                     # Unlicense — public domain dedication
  'argparse'                                  # Python-2.0 — permissive, OSI-approved
  'caniuse-lite'                              # CC-BY-4.0 — attribution-only, browser compat data not code
  'axe-core'                                  # MPL-2.0 — weak/file-level copyleft; we don't modify its source, no obligation triggered
  'lightningcss'                              # MPL-2.0 — same reasoning as above
  'chownr'                                    # BlueOak-1.0.0 — transitive via @semantic-release/npm > npm; same reasoning as isexe/lru-cache/minimatch above
  'common-ancestor-path'                      # BlueOak-1.0.0 — same, transitive via @semantic-release/npm > npm
  'glob'                                      # BlueOak-1.0.0 — same, transitive via @semantic-release/npm > npm
  'minipass-flush'                            # BlueOak-1.0.0 — same, transitive via @semantic-release/npm > npm
  'minipass'                                  # BlueOak-1.0.0 — same, transitive via @semantic-release/npm > npm
  'npm'                                       # Artistic-2.0 — OSI-approved permissive, no share-alike; bundled CLI used only as a devDependency transitive of @semantic-release/npm
  'path-scurry'                               # BlueOak-1.0.0 — same, transitive via @semantic-release/npm > npm
  'qrcode-terminal'                           # Apache 2.0 — permissive, transitive via @semantic-release/npm > npm
  'spdx-exceptions'                           # CC-BY-3.0 — attribution-only, transitive via @semantic-release/npm > npm
  'spdx-license-ids'                          # CC0-1.0 — public domain dedication, transitive via @semantic-release/npm > npm
  'tar'                                       # BlueOak-1.0.0 — same, transitive via @semantic-release/npm > npm
  'yallist'                                   # BlueOak-1.0.0 — same, transitive via @semantic-release/npm > npm
)

# Join array elements into a semicolon-separated string for --excludePackages.
# Verified empirically: bash strips each element's trailing `# comment` at
# parse time (since `#` starts a comment from that point to end-of-line
# within the array literal), so the array itself already holds only the
# package name values — no comment text ends up in the joined string.
EXCLUDED_PACKAGES_LIST=$(IFS=';'; echo "${EXCLUDED_PACKAGES[*]}")

pnpm dlx license-checker-rseidelsohn@5.0.1 \
  --onlyAllow "$ALLOWED_LICENSES" \
  --excludePackages "$EXCLUDED_PACKAGES_LIST" \
  --excludePrivatePackages \
  --summary
