import re
import sys

with open('/home/ubuntu/acelera-barber/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Regra contra o seletor de demonstração
forbidden_terms = [
    'Modo Demonstração',
    'modo demonstração',
    'barber-select',
    'selector-container',
    'Escolha uma barbearia da lista'
]

errors = []
for term in forbidden_terms:
    if term in content:
        errors.append(f"Termo proibido encontrado: '{term}'")

# 2. Regras clássicas de limpeza (zero clutter)
clutter_terms = [
    'Link oficial: https',
    'Link pronto',
    '15 Segundos',
    '3 toques',
    '1 TOQUE'
]

for term in clutter_terms:
    if term in content:
        errors.append(f"Clutter proibido encontrado: '{term}'")

# 3. Trava do botão Atualizar na Etapa 3
if 'triggerInstagramRefresh' in content or 'data-lucide="refresh-cw"' in content:
    errors.append("Botão manual de atualizar não deve existir na Etapa 3!")

if errors:
    print("❌ FALHAS DETECTADAS NAS TRAVAS:")
    for err in errors:
        print(f" - {err}")
    sys.exit(1)
else:
    print("✅ TODAS AS TRAVAS E GUARDRAILS ESTÃO 100% VALIDADOS!")
