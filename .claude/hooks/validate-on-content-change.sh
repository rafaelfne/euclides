#!/usr/bin/env bash
# Roda o validador pedagógico assim que conteúdo é tocado.
#
# O ponto é o timing: descobrir no build que uma misconception ficou órfã custa
# um ciclo inteiro de atenção. Descobrir no instante da edição custa nada — e o
# autor ainda está com o raciocínio carregado.
set -uo pipefail

payload=$(cat)
path=$(printf '%s' "$payload" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')

case "$path" in
  *src/content/*|*src/lib/socratic*|*src/lib/reference/*|*scripts/validate-content*) ;;
  *) exit 0 ;;
esac

if ! out=$(npm run --silent validate 2>&1); then
  printf 'O validador pedagógico reprovou depois desta edição:\n\n%s\n' "$out" >&2
  exit 2   # devolve a saída ao Claude para correção antes de seguir
fi
exit 0
