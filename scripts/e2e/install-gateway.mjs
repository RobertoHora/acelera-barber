import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const dir='.runtime/e2e/gateway-backup',target='/home/ubuntu/orc-prospecting-whatsapp/server.js';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(dir+'/manifest.json','utf8'));
const current=fs.readFileSync(target);
if(hash(current)===manifest.patchedSha256){console.log('Gateway source already installed; no restart performed.');process.exit(0);}
if(hash(current)!==manifest.originalSha256)throw Error('Gateway changed since snapshot. Re-audit before applying.');
for(const file of ['http-smoke-result.json','browser-smoke-result.json'])if(!JSON.parse(fs.readFileSync('.runtime/e2e/'+file,'utf8')).success)throw Error('Application validation is missing.');
if(!/Tests\s+(\d+) passed \(\1\)/.test(fs.readFileSync('.runtime/e2e/tests.log','utf8')))throw Error('Safety suite must pass before gateway installation.');
const patched=fs.readFileSync(dir+'/server.patched.js');if(hash(patched)!==manifest.patchedSha256)throw Error('Staged patch hash mismatch.');
const check=spawnSync(process.execPath,['--check',dir+'/server.patched.js'],{encoding:'utf8'});if(check.status)throw Error(check.stderr);
const list=JSON.parse(spawnSync('pm2',['jlist'],{encoding:'utf8'}).stdout);const app=list.find(x=>x.name==='orc-whatsapp-gateway'&&x.pm2_env?.pm_exec_path===target);
if(!app||app.pm2_env.status!=='online')throw Error('Existing gateway supervisor not healthy.');
fs.writeFileSync(dir+'/supervisor.json',JSON.stringify({name:app.name,id:app.pm_id,pid:app.pid,source:target}),{mode:0o600});
// Preserve the session directory and all Lana state. Only the gateway process is reloaded.
fs.writeFileSync(target,patched);
const restart=spawnSync('pm2',['restart',String(app.pm_id)],{encoding:'utf8'});
if(restart.status){fs.writeFileSync(target,current);throw Error('Restart failed; original source restored.');}
let connected=false;
for(let i=0;i<25;i++){
 try{const b=await(await fetch('http://127.0.0.1:3333/api/status',{signal:AbortSignal.timeout(1500)})).json();if(b.connected===true){connected=true;break;}}catch{}
 await new Promise(r=>setTimeout(r,1000));
}
if(!connected){fs.writeFileSync(target,current);spawnSync('pm2',['restart',String(app.pm_id)],{encoding:'utf8'});throw Error('Gateway did not reconnect; original source restored and restarted.');}
manifest.installed=true;manifest.installedAt=new Date().toISOString();fs.writeFileSync(dir+'/manifest.json',JSON.stringify(manifest,null,2),{mode:0o600});
const stateFile='.runtime/e2e/active.json';const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));state.gatewayInstalled=true;state.nextAction='Certificar gates da execução e liberar somente o contato pessoal.';fs.writeFileSync(stateFile,JSON.stringify(state,null,2)+'\n',{mode:0o600});
console.log('Exclusive routing installed; existing WhatsApp session reconnected. Lana inbox/dispatcher unchanged. Test remains paused.');
