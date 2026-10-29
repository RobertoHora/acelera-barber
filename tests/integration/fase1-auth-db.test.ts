import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db';
import { normalizePhoneE164, hashOtpCode, computePhoneHmac } from '@/lib/auth';

describe('Fase 1 - Persistência PostgreSQL, Seed e Autenticação OTP', () => {
  it('contém as 123 barbearias de Governador Valadares seeded no banco', async () => {
    const total = await prisma.business.count();
    expect(total).toBeGreaterThanOrEqual(123);

    // Verifica se os serviços padrão foram gerados
    const sample = await prisma.business.findFirst({
      include: { services: true, professionals: true },
    });
    expect(sample).not.toBeNull();
    expect(sample?.services.length).toBeGreaterThanOrEqual(3);
    expect(sample?.professionals.length).toBeGreaterThanOrEqual(1);
  });

  it('normaliza telefones para formato E.164 e gera HMAC determinístico', () => {
    const raw = '(33) 99948-2287';
    const e164 = normalizePhoneE164(raw);
    expect(e164).toBe('+5533999482287');

    const hmac1 = computePhoneHmac(raw);
    const hmac2 = computePhoneHmac('+5533999482287');
    expect(hmac1).toBe(hmac2);
    expect(hmac1.length).toBe(64); // SHA-256 hex
  });

  it('executa ciclo completo de autenticação OTP passwordless com sucesso', async () => {
    const testPhone = `+5533999${Math.floor(100000 + Math.random() * 900000)}`;
    const testCode = '748291';
    const codeHash = hashOtpCode(testCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 1. Cria OTP pendente
    const otp = await prisma.otpVerification.create({
      data: {
        phone: testPhone,
        codeHash,
        expiresAt,
      },
    });
    expect(otp.id).toBeDefined();

    // 2. Valida tentativa incorreta
    const wrongHash = hashOtpCode('000000');
    expect(wrongHash).not.toBe(codeHash);

    // 3. Valida código correto e cria sessão
    const valid = hashOtpCode(testCode) === otp.codeHash;
    expect(valid).toBe(true);

    const user = await prisma.user.create({
      data: {
        phone: testPhone,
        name: 'Dono de Teste',
      },
    });

    const session = await prisma.ownerSession.create({
      data: {
        sessionToken: `token_test_${Date.now()}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 86400 * 1000),
      },
    });

    expect(session.userId).toBe(user.id);

    // Limpa dados de teste
    await prisma.ownerSession.delete({ where: { id: session.id } });
    await prisma.otpVerification.delete({ where: { id: otp.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('confirma a existência da constraint de exclusão de horários concorrentes no PostgreSQL', async () => {
    const result: Array<{ conname: string }> = await prisma.$queryRaw`
      SELECT conname FROM pg_constraint WHERE conname = 'Booking_no_overlapping_active_slots';
    `;
    expect(result.length).toBe(1);
    expect(result[0].conname).toBe('Booking_no_overlapping_active_slots');
  });
});
