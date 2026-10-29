import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
try{process.loadEnvFile('.runtime/e2e/app.env');}catch{}
function sourceHash(){
 const files=spawnSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).stdout.split('\0').filter(f=>/\.(tsx?|mts|mjs|prisma|sql)$/.test(f)||['package.json','package-lock.json'].includes(f)).sort();
 const hash=crypto.createHash('sha256');for(const f of files){hash.update(f);hash.update(fs.readFileSync(f));}return hash.digest('hex');
}
async function run(args,file){const fd=fs.openSync('.runtime/e2e/'+file,'w',0o600);try{await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{env:process.env,stdio:['ignore',fd,fd]});child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error(`Validation failed: ${file}`)));});}finally{fs.closeSync(fd);}}
const before=sourceHash();
await run(['node_modules/vitest/vitest.mjs','run'],'tests.log');console.log('Unit and integration tests passed.');
await run(['node_modules/next/dist/bin/next','build'],'build.log');console.log('Production build passed.');
const restart=spawnSync('systemctl',['--user','restart','eleva-e2e-app'],{encoding:'utf8'});if(restart.status)throw Error('Local app restart failed.');
await run(['scripts/e2e/http-smoke.mjs'],'http-smoke.log');console.log('Isolated HTTP journey passed.');
await run(['scripts/e2e/browser-smoke.mjs'],'browser-smoke.log');console.log('Mobile browser journey passed.');
if(sourceHash()!==before)throw Error('Source changed during validation; certificate not issued.');
fs.writeFileSync('.runtime/e2e/certificate.json',JSON.stringify({sourceHash:before,at:new Date().toISOString(),tests:true,build:true,http:true,browser:true},null,2)+'\n',{mode:0o600});
console.log('Certificate recorded for the exact validated source.');
