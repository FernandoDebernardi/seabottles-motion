#!/usr/bin/env bash
# Instala en este proyecto lo que Claude Code necesita para trabajar con Remotion.
# Ejecutar una sola vez desde la carpeta del proyecto: ./instalar-claude-code.sh
set -e

echo "1/4 Dependencias del proyecto"
npm install

echo "2/4 Skills oficiales de Remotion para agentes (quedan en .agents/skills y .claude/skills)"
npx -y remotion skills add || npx -y skills add remotion-dev/skills

echo "3/4 Skill de arte generativo de Anthropic (fondos con partículas, opcional)"
npx -y skills add https://github.com/anthropics/skills --skill algorithmic-art || true

echo "4/4 Plugin de Remotion para Claude Code"
if command -v claude >/dev/null 2>&1; then
  claude plugin marketplace add remotion-dev/claude-code-plugin || true
  claude plugin install remotion@remotion || true
  echo "Reiniciá Claude Code para que cargue el plugin."
else
  echo "No encontré el comando 'claude'. Cuando lo tengas, corré:"
  echo "  claude plugin marketplace add remotion-dev/claude-code-plugin"
  echo "  claude plugin install remotion@remotion"
fi

echo
echo "Listo. Probá con: npm run dev"
