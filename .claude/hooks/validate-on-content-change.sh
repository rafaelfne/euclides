#!/usr/bin/env bash
# Roda o validador pedagógico assim que conteúdo é tocado.
#
# O ponto é o timing: descobrir no build que uma misconception ficou órfã custa
# um ciclo inteiro de atenção. Descobrir no instante da edição custa nada — e o
# autor ainda está com o raciocínio carregado.
#
# Decide por PATH TOCADO, não por ferramenta. Edição por shell (sed, heredoc,
# script) não traz `file_path` no payload e escapava do gate inteiro; nesses
# casos o path vem do git.
set -uo pipefail

INTERESTING='src/content/|src/lib/socratic|src/lib/reference/|scripts/validate-content'

payload=$(cat)
path=$(printf '%s' "$payload" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')

if [ -z "$path" ]; then
  # Coletado numa variável antes de filtrar: sob `pipefail`, o SIGPIPE que o
  # git leva quando `grep -q` sai cedo derrubava a checagem inteira em silêncio.
  path=$(
    git diff --name-only 2>/dev/null
    git diff --cached --name-only 2>/dev/null
    git ls-files -o --exclude-standard 2>/dev/null
  )
fi

printf '%s\n' "$path" | grep -qE "$INTERESTING" || exit 0

if ! out=$(npm run --silent validate 2>&1); then
  printf 'O validador pedagógico reprovou depois desta edição:\n\n%s\n' "$out" >&2
  exit 2   # devolve a saída ao Claude para correção antes de seguir
fi
exit 0
