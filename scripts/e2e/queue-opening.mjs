import fs from 'node:fs';
import pg from 'pg';
const state=JSON.parse(fs.readFileSync('.runtime/e2e/active.json','utf8'));
if(state.status!=='RUNNING'||!state.gatesPassed||!state.businessId)throw Error('Run is not ready. Preflight and activate the exclusive reservation first.');
if(!process.env.DATABASE_URL?.includes('/eleva_agenda_e2e?'))throw Error('Dedicated E2E database required.');
const c=new pg.Client({connectionString:process.env.DATABASE_URL});await c.connect();
try{
 const b=(await c.query('SELECT id,"cleanName",name,whatsapp FROM "Business" WHERE id=$1',[state.businessId])).rows[0];
 if(!b||b.whatsapp!=='+'+state.phone)throw Error('Test destination mismatch.');
 const key=`e2e_opening:${state.runId}`;
 await c.query('BEGIN');
 await c.query('INSERT INTO "OutboxMessage" (id,"businessId","destinationPhone",content,purpose,"dedupeKey") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT ("dedupeKey") DO NOTHING',['opening_'+state.runId,b.id,b.whatsapp,`oi, tudo bem? é da ${b.cleanName||b.name}?`,'INITIAL_OUTREACH',key]);
 await c.query('INSERT INTO "LauraConversation" (id,phone,scope,state,"updatedAt") VALUES ($1,$2,$3,$4,NOW()) ON CONFLICT (phone,scope) DO NOTHING',['sales_'+state.runId,b.whatsapp,b.id,JSON.stringify({salesStep:'OPENING_SENT'})]);
 await c.query('COMMIT');
 console.log('Opening queued idempotently; no link or offer in the first contact. Transport gates and inherited pacing still apply.');
}catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}
