#!/usr/bin/env bash
# Consumer contract test: builds all packages, packs them, then installs the
# tarballs into two standalone fixtures (Vue 2.7 / Vue 3) and typechecks a
# consumer-style program against the PUBLISHED declarations with
# `skipLibCheck: false` on both versions.
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm -r --filter './packages/*' build

for p in shared core vue; do
  (cd "packages/$p" && pnpm pack --pack-destination ../../fixtures/ >/dev/null)
done

for f in typecheck-vue2 typecheck-vue3; do
  echo "== fixtures/$f =="
  (cd "fixtures/$f" && rm -rf node_modules pnpm-lock.yaml && pnpm install >/dev/null && pnpm typecheck)
done

echo "ALL CONSUMER TYPECHECKS PASSED"
