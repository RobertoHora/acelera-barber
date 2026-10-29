import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = path.join(root, '.runtime/e2e');
const stateFile = path.join(dir, 'active.json');
fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
const [command = 'status', ...args] = process.argv.slice(2);
let state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : null;
function save(note) {
  state.updatedAt = new Date().toISOString();
  const temp = stateFile + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(state, null, 2) + '\n', {mode:0o600});
  fs.renameSync(temp, stateFile);
  fs.appendFileSync(path.join(dir, 'journal.jsonl'), JSON.stringify({at:state.updatedAt,runId:state.runId,command,step:state.step,note})+'\n',{mode:0o600});
}
if(command === 'init') {
  if(state && state.status !== 'FINISHED') throw new Error('Execução existente: use status/resume.');
  const phone = process.env.E2E_OPERATOR_PHONE;
  if(!phone || !/^55\d{10,11}$/.test(phone.replace(/\D/g,''))) throw new Error('Defina E2E_OPERATOR_PHONE com o número pessoal já confirmado.');
  state = {version:1,runId:crypto.randomUUID(),status:'PAUSED',transport:'SIMULATED',step:'preflight',sourceSlug:'barao',testSlug:'barao-e2e',phone:phone.replace(/\D/g,''),lids:[],businessId:null,paymentMode:'SIMULATED',gatewayInstalled:false,reconciled:false,nextAction:'Preparar banco isolado, validar roteamento e conectar interface.'};
  save('Execução criada sem envio.');
} else if(command === 'status') {
  if(!state) { console.log('Nenhum teste iniciado.'); process.exit(0); }
  const {phone,lids,token,...safe} = state; console.log(JSON.stringify({...safe,recipient:'operador final '+phone.slice(-4)},null,2));
} else {
  if(!state || state.status === 'FINISHED') throw new Error('Nenhuma execução retomável.');
  if(command === 'checkpoint') { if(args.length < 2) throw new Error('checkpoint <etapa> <nota>'); state.step=args[0]; state.nextAction=args.slice(1).join(' '); }
  else if(command === 'role') { if(!['owner','customer'].includes(args[0]))throw Error('role owner|customer');state.role=args[0]==='customer'?'END_CUSTOMER':'OWNER'; }
  else if(command === 'pause') state.status='PAUSED';
  else if(command === 'resume') { if(!state.gatesPassed) throw new Error('Gates de isolamento e aplicação ainda pendentes.'); state.status='RUNNING'; }
  else if(command === 'reconcile') {
    try{process.loadEnvFile(path.join(dir,'app.env'));}catch{}
    if(!process.env.DATABASE_URL?.includes('/eleva_agenda_e2e?'))throw Error('Reconciliation requires the isolated database.');
    const {default:pg}=await import('pg');const client=new pg.Client({connectionString:process.env.DATABASE_URL,options:'-c default_transaction_read_only=on'});await client.connect();
    try{
      const messages=await client.query(`SELECT COUNT(*)::int AS pending FROM "OutboxMessage" WHERE ("businessId"=$1 OR "destinationPhone"=$2) AND status IN ('QUEUED','CLAIMED','DISPATCHING','UNCERTAIN','UNKNOWN')`,[state.businessId,'+'+state.phone]);
      const orders=await client.query(`SELECT COUNT(*)::int AS pending FROM "Order" WHERE "businessId"=$1 AND status='PENDING'`,[state.businessId]);
      if(messages.rows[0].pending||orders.rows[0].pending)throw Error('Existem mensagens ou pagamentos pendentes. Reconcilie cada um antes de finalizar.');
      state.reconciled=true;state.reconciledAt=new Date().toISOString();
    }finally{await client.end();}
  }
  else if(command === 'finish') { if(!state.reconciled) throw new Error('Reconcilie pagamentos, filas e restauração antes de finalizar.'); state.status='FINISHED'; }
  else throw new Error('Comando desconhecido.');
  save(args.join(' '));
}
