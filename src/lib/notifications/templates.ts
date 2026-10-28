export interface NotificationTemplateParams {
  businessName: string;
  serviceName: string;
  professionalName: string;
  formattedDateTime: string;
  address?: string;
  managementUrl?: string;
  voucherCode?: string | null;
  customerName?: string;
  customerPhone?: string;
  reason?: string;
}

export const NOTIFICATION_TEMPLATES = {
  // 1. Criação do Agendamento (Cliente)
  bookingCreatedCustomer: (p: NotificationTemplateParams) =>
    `✂️ *Agendamento Confirmado!* na *${p.businessName}*\n\n` +
    `💈 *Serviço:* ${p.serviceName}\n` +
    `👤 *Barbeiro:* ${p.professionalName}\n` +
    `📅 *Horário:* ${p.formattedDateTime}\n` +
    (p.address ? `📍 *Endereço:* ${p.address}\n\n` : '\n') +
    `Para reagendar ou cancelar se precisar, use seu link exclusivo:\n${p.managementUrl}`,

  // 2. Criação do Agendamento (Barbearia)
  bookingCreatedBusiness: (p: NotificationTemplateParams) =>
    `🔔 *Novo Agendamento Marcado!*\n\n` +
    `👤 *Cliente:* ${p.customerName} (${p.customerPhone})\n` +
    `💈 *Serviço:* ${p.serviceName}\n` +
    `✂️ *Barbeiro:* ${p.professionalName}\n` +
    `📅 *Horário:* ${p.formattedDateTime}`,

  // 3. Reagendamento (Cliente)
  bookingRescheduledCustomer: (p: NotificationTemplateParams) =>
    `🔄 *Horário Alterado com Sucesso!*\n\n` +
    `Seu agendamento na *${p.businessName}* agora está marcado para:\n` +
    `📅 *Novo Horário:* ${p.formattedDateTime}\n` +
    `💈 *Serviço:* ${p.serviceName} com ${p.professionalName}\n\n` +
    `Link de gerenciamento:\n${p.managementUrl}`,

  // 4. Cancelamento pelo Cliente
  bookingCancelledByCustomer: (p: NotificationTemplateParams) => {
    let msg = `❌ Seu agendamento para *${p.serviceName}* no dia *${p.formattedDateTime}* foi cancelado.`;
    if (p.voucherCode) {
      msg += `\n\nComo o cancelamento foi feito com menos de 1h de antecedência, liberamos para você um cupom de *50% de desconto* no seu próximo agendamento: *${p.voucherCode}* (válido por 30 dias).`;
    }
    return msg;
  },

  // 5. Cancelamento pela Barbearia (Cliente)
  bookingCancelledByBusiness: (p: NotificationTemplateParams) =>
    `⚠️ Olá ${p.customerName}, infelizmente precisamos cancelar o seu agendamento de *${p.serviceName}* no dia *${p.formattedDateTime}* na *${p.businessName}*.\n` +
    (p.reason ? `Motivo: ${p.reason}\n\n` : '\n') +
    `Pedimos desculpas pelo imprevisto. Clique aqui para escolher um novo horário conveniente:\n${p.managementUrl}`,

  // 6. Lembrete 24 Horas Antes
  bookingReminder24h: (p: NotificationTemplateParams) =>
    `⏰ *Lembrete:* Seu corte na *${p.businessName}* é amanhã!\n\n` +
    `💈 *Serviço:* ${p.serviceName} com ${p.professionalName}\n` +
    `📅 *Horário:* ${p.formattedDateTime}\n` +
    (p.address ? `📍 *Endereço:* ${p.address}\n\n` : '\n') +
    `Caso precise reagendar ou cancelar, faça pelo seu link com pelo menos 1h de antecedência:\n${p.managementUrl}`,

  // 7. Lembrete 2 Horas Antes
  bookingReminder2h: (p: NotificationTemplateParams) =>
    `✂️ *Faltam 2 horas* para o seu horário na *${p.businessName}*!\n\n` +
    `⏰ Estamos te esperando às *${p.formattedDateTime.split(' ')[1] || p.formattedDateTime}* com o barbeiro ${p.professionalName}.\n` +
    (p.address ? `📍 ${p.address}\n\n` : '\n') +
    `Até logo!`,

  // 8. Fim de Teste da Agenda - Aviso D-3
  trialEndingNoticeD3: (p: { businessName: string; daysRemaining: number; renewalUrl: string }) =>
    `⏳ Olá! O período de teste gratuito da Agenda ORC na *${p.businessName}* encerra em *${p.daysRemaining} dias*.\n\n` +
    `Sua agenda online já está funcionando e evitando conflitos. Para continuar sem interrupção após o teste, ative sua assinatura mensal:\n${p.renewalUrl}`,
};
