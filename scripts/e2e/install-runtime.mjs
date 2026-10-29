import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),units=path.join(os.homedir(),'.config/systemd/user');
if(!root.endsWith('/acelera-barber')||!fs.existsSync('.runtime/e2e/app.env'))throw Error('Expected repository and isolated runtime env.');
fs.mkdirSync(units,{recursive:true});
for(const [name,exec] of [
 ['eleva-e2e-app',`/usr/bin/node ${root}/node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3010`],
 ['eleva-e2e-laura',`/usr/bin/node ${root}/scripts/e2e/pump.mjs`],
]){
 fs.writeFileSync(path.join(units,name+'.service'),`[Unit]\nDescription=${name} isolated assisted test\nAfter=network.target\n[Service]\nWorkingDirectory=${root}\nEnvironmentFile=${root}/.runtime/e2e/app.env\nExecStart=${exec}\nRestart=on-failure\nRestartSec=5\nNoNewPrivileges=true\nUMask=0077\n[Install]\nWantedBy=default.target\n`);
}
for(const args of [['--user','daemon-reload'],['--user','enable','--now','eleva-e2e-app','eleva-e2e-laura']]){const r=spawnSync('systemctl',args,{encoding:'utf8'});if(r.status)throw Error(r.stderr);}
console.log('Isolated app and Laura pump installed; shared gateway/Lana not restarted.');
