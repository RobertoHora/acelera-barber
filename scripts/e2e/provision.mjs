import pg from 'pg';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const stateFile='.runtime/e2e/active.json';
if(!fs.existsSync(stateFile)) throw new Error('Initialize the assisted run first.');
const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));
const base={host:'/home/ubuntu/orc-db',port:5433,user:'ubuntu'};
const admin=new pg.Client({...base,database:'postgres'});await admin.connect();
if(!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',['eleva_agenda_e2e'])).rowCount) await admin.query('CREATE DATABASE eleva_agenda_e2e');
await admin.end();
const url='postgresql://ubuntu@localhost:5433/eleva_agenda_e2e?host=/home/ubuntu/orc-db';
const result=spawnSync('./node_modules/.bin/prisma',['migrate','deploy'],{env:{...process.env,DATABASE_URL:url},encoding:'utf8'});
if(result.status!==0)throw new Error(result.stderr || result.stdout);
const src=new pg.Client({...base,database:'eleva_agenda_production',options:'-c default_transaction_read_only=on'});
const dst=new pg.Client({...base,database:'eleva_agenda_e2e'});await src.connect();await dst.connect();
try{
 const source=(await src.query('SELECT * FROM "Business" WHERE slug=$1',[state.sourceSlug])).rows[0];
 if(!source)throw new Error('Reference shop not found.');
 const existing=(await dst.query('SELECT id FROM "Business" WHERE slug=$1',[state.testSlug])).rows[0];
 if(existing) state.businessId=existing.id;
 else {
 const id='e2e_'+crypto.randomUUID();
 await dst.query('INSERT INTO "Business" (id,slug,name,"cleanName",phone,whatsapp,address,neighborhood,city,state,"placeId","reviewUrl","googleMapsUrl",timezone,"updatedAt") VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())',[id,state.testSlug,source.name+' (TESTE)',source.cleanName,'+'+state.phone,source.address,source.neighborhood,source.city,source.state,source.placeId,source.reviewUrl,source.googleMapsUrl,source.timezone]);
 await dst.query('INSERT INTO "Professional" (id,"businessId",name,"workingHours","updatedAt") VALUES ($1,$2,$3,$4,NOW())',['e2e_prof_'+crypto.randomUUID(),id,'Profissional de teste',JSON.stringify(Array.from({length:7},(_,day)=>({day,open:'08:00',close:'20:00'})))]);
 await dst.query('INSERT INTO "Service" (id,"businessId",name,"priceCents","durationMinutes","updatedAt") VALUES ($1,$2,$3,3500,30,NOW())',['e2e_svc_'+crypto.randomUUID(),id,'Corte (valor de teste)']);
 state.businessId=id;
 }
 const uid='e2e_owner_'+crypto.randomUUID();
 const u=(await dst.query('INSERT INTO "User" (id,phone,name,"updatedAt") VALUES ($1,$2,$3,NOW()) ON CONFLICT (phone) DO UPDATE SET name=EXCLUDED.name RETURNING id',[uid,'+'+state.phone,'Operador E2E'])).rows[0];
 await dst.query('UPDATE "Business" SET "userId"=$1 WHERE id=$2',[u.id,state.businessId]);
 state.nextAction='Validar runtime, roteamento e fluxo web em homologação; não enviar ainda.';
 const tmp=stateFile+'.tmp';fs.writeFileSync(tmp,JSON.stringify(state,null,2)+'\n',{mode:0o600});fs.renameSync(tmp,stateFile);
 const envFile='.runtime/e2e/app.env';
 if(!fs.existsSync(envFile))fs.writeFileSync(envFile,`DATABASE_URL=${url}\nTEST_DATABASE_URL=${url.replace('eleva_agenda_e2e','eleva_agenda_test')}\nAUTH_SECRET=${crypto.randomBytes(32).toString('hex')}\nWHATSAPP_TRANSPORT_MODE=SIMULATED\nLAURA_INTERNAL_TOKEN=${crypto.randomBytes(32).toString('hex')}\nE2E_RUN_ID=${state.runId}\nE2E_OPERATOR_PHONE=${state.phone}\nNEXT_PUBLIC_ELEVA_URL=http://localhost:3010\nNEXT_PUBLIC_AGENDA_URL=http://localhost:3010\n`,{mode:0o600});
 console.log('Isolated database provisioned; reference source unchanged; private app.env written.');
}finally{await src.end();await dst.end();}
