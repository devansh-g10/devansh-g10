#!/usr/bin/env bash
# Called from Actions after generation. Only the explicitly named SVGs are staged.
set -euo pipefail

for asset in "$@"; do
  test -s "$asset"
done
git add -- "$@"
if git diff --cached --quiet; then
  exit 0
fi
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git commit -m "Refresh profile artwork" -- "$@"
# The other daily job or the owner may have published during generation.
git pull --rebase origin "$GITHUB_REF_NAME"
git push origin "HEAD:refs/heads/$GITHUB_REF_NAME"
