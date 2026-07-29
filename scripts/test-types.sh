#!/usr/bin/env bash
# Consumer contract test: builds all packages, packs them, then installs the
# tarballs into two standalone fixtures (Vue 2.7 / Vue 3) and typechecks a
# consumer-style program against the PUBLISHED declarations with
# `skipLibCheck: false` on both versions.
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm -r --filter './packages/*' build

rm -f fixtures/*.tgz
for p in shared core vue; do
  (cd "packages/$p" && pnpm pack --pack-destination ../../fixtures/ >/dev/null)
done

# Point fixture manifests at the exact tarballs just packed (name/version-proof).
for t in fixtures/*.tgz; do
  base=$(basename "$t")
  slug=$(printf '%s' "$base" | sed -E 's/-[0-9]+\.[0-9]+\.[0-9]+.*\.tgz$//')
  for f in typecheck-vue2 typecheck-vue3; do
    perl -pi -e "s{file:\.\./\Q$slug\E-[^\"']+?\.tgz}{file:../$base}g" "fixtures/$f/package.json" "fixtures/$f/pnpm-workspace.yaml"
  done
done

for f in typecheck-vue2 typecheck-vue3; do
  echo "== fixtures/$f =="
  (cd "fixtures/$f" && rm -rf node_modules pnpm-lock.yaml && pnpm install >/dev/null && pnpm typecheck)
done

echo "ALL CONSUMER TYPECHECKS PASSED"
