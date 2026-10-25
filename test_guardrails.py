import re
import sys

with open('/home/ubuntu/acelera-barber/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

errors = []

# 1. Regra contra o seletor de demonstração
forbidden_demo_terms = [
    'Modo Demonstração',
    'modo demonstração',
    'barber-select',
    'selector-container',
    'Escolha uma barbearia da lista'
]
for term in forbidden_demo_terms:
    if term in content:
        errors.append(f"Termo de modo demonstração proibido: '{term}'")

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

# 4. Proibição de indução de nota e review gating (anti-5 estrelas)
forbidden_rating_induction = [
    '5 estrelas',
    '5 Estrelas',
    '5 ESTRELAS',
    '★ ★ ★ ★ ★',
    '★  ★  ★  ★  ★',
    'DEIXE 5 ESTRELAS',
    'AVALIE COM 5 ESTRELAS',
    'nota 5 estrelas'
]
for term in forbidden_rating_induction:
    if term in content:
        errors.append(f"Indução de nota/avaliação proibida encontrada: '{term}'")

# 5. Proibição de promessas irrealistas e alegações de sincronização automática
forbidden_promises = [
    'primeiro lugar',
    'topo das buscas',
    'crescimento garantido',
    'carrossel automático',
    'Reels no Maps',
    'sincronização automática',
    'perfil blindado',
    '5x mais'
]
for term in forbidden_promises:
    if term.lower() in content.lower():
        errors.append(f"Promessa irrealista ou termo de sincronização proibido: '{term}'")

# 6. Proibição de termos de parceria/oficialidade Google
forbidden_endorsements = [
    'oficial Google',
    'Kit Oficial Google',
    'parceria oficial',
    'selo oficial',
    'kit do Google'
]
for term in forbidden_endorsements:
    if term.lower() in content.lower():
        errors.append(f"Linguagem de parceria/oficialidade Google proibida: '{term}'")

# 7. Proibição de segredos, APIs de terceiros no browser e senha Wi-Fi padrão
forbidden_secrets = [
    'apify_api',
    'atob(\'YXBpZnl',
    'api.apify.com',
    'cortes2026',
    'infinitepay_token'
]
for term in forbidden_secrets:
    if term in content:
        errors.append(f"Segredo, API indevida ou senha padrão proibida encontrada: '{term}'")

# 8. Requisito obrigatório de texto neutro no QR de avaliação
required_neutral_qr = 'Conte como foi sua experiência no Google'
if required_neutral_qr not in content:
    errors.append(f"Texto neutro obrigatório de QR de avaliação ausente: '{required_neutral_qr}'")

# 9. Verificação de estados: client-side só pode marcar MANUAL_ASSISTED/CLIENT_CONFIRMED, nunca SYNCED
if "actions[actionKey] = 'SYNCED'" in content or 'actions.instagram_link = "SYNCED"' in content:
    errors.append("Ações client-side nunca podem ser marcadas diretamente como SYNCED!")

if errors:
    print("❌ FALHAS DETECTADAS NAS TRAVAS:")
    for err in errors:
        print(f" - {err}")
    sys.exit(1)
else:
    print("✅ TODAS AS TRAVAS E GUARDRAILS ESTÃO 100% VALIDADOS!")
