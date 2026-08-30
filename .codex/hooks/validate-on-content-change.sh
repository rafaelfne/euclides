#!/usr/bin/env bash
set -uo pipefail

INTERESTING='src/content/|src/lib/socratic|src/lib/reference/|scripts/validate-content'

payload=$(cat)
path=$(printf '%s' "$payload" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')

if [ -z "$path" ]; then
  path=$(
    git diff --name-only 2>/dev/null
    git diff --cached --name-only 2>/dev/null
    git ls-files -o --exclude-standard 2>/dev/null
  )
fi

printf '%s\n' "$path" | grep -qE "$INTERESTING" || exit 0

if ! out=$(npm run --silent validate 2>&1); then
  printf 'O validador pedagógico reprovou depois desta edição:\n\n%s\n' "$out" >&2
  exit 2
fi
exit 0
