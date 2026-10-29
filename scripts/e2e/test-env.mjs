import crypto from 'node:crypto';
const db = process.env.TEST_DATABASE_URL;
if (!db || !/\/eleva_agenda_test(?:[?]|$)/.test(db)) throw new Error('Set TEST_DATABASE_URL to an isolated database. No production fallback.');
process.env.DATABASE_URL = db;
process.env.AUTH_SECRET ||= crypto.randomBytes(32).toString('hex');
process.env.WHATSAPP_TRANSPORT_MODE='SIMULATED';

process.env.ADMIN_METRICS_SECRET='orc_admin_secret_gv'; // test fixture, not an operational secret

process.env.NEXT_PUBLIC_AGENDA_URL='https://agenda.oracio.uk';
process.env.NEXT_PUBLIC_ELEVA_URL='https://eleva.oracio.uk';

delete process.env.E2E_ACCESS_TOKEN;
