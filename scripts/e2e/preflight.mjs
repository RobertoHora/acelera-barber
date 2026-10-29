import fs from 'node:fs';
try{process.loadEnvFile('.runtime/e2e/app.env');}catch{}
const required=[],production=[];
async function check(name,url,expected,target,headers={}){
 try{const r=await fetch(url,{headers,signal:AbortSignal.timeout(8000)});let ok=r.status===expected;
 if(name==='Gateway Lana'){const b=await r.json();ok=ok&&b.connected===true;}
 target.push({name,status:r.status,ok});}catch{target.push({name,ok:false,error:'indisponível'});}
}
await Promise.all([
 check('Gateway Lana','http://127.0.0.1:3333/api/status',200,required),
 check('Lana','http://127.0.0.1:3334/health',200,required),
 check('Homologação API','http://127.0.0.1:3010/api/v1/auth/me',401,required,{cookie:'orc_e2e_access='+process.env.E2E_ACCESS_TOKEN}),
 check('Eleva API produção','https://eleva.oracio.uk/api/v1/auth/me',401,production),
 check('Agenda produção HTTPS','https://agenda.oracio.uk',200,production),
]);
const state=fs.existsSync('.runtime/e2e/active.json')?JSON.parse(fs.readFileSync('.runtime/e2e/active.json','utf8')):null;
required.push({name:'Cópia e banco isolado',ok:!!state?.businessId&&process.env.DATABASE_URL?.includes('/eleva_agenda_e2e?')});
required.push({name:'Reserva exclusiva instalada',ok:state?.gatewayInstalled===true});
for(const [name,file] of [['Smoke HTTP','http-smoke-result.json'],['Navegador móvel','browser-smoke-result.json']]){
 let passed=false;try{passed=JSON.parse(fs.readFileSync('.runtime/e2e/'+file,'utf8')).success===true;}catch{}
 required.push({name,ok:passed});
}
console.log(JSON.stringify({assistedTestReady:required.every(x=>x.ok),checks:required,productionReady:production.every(x=>x.ok),production},null,2));
process.exitCode=required.every(x=>x.ok)?0:1;
