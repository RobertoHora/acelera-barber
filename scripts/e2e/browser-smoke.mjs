for(let attempt=0;attempt<50;attempt++){
 try{await fetch('http://127.0.0.1:3010/api/v1/auth/me',{signal:AbortSignal.timeout(1000)});break;}catch{if(attempt===49)throw Error('Local homologation did not start.');await new Promise(r=>setTimeout(r,100));}
}
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
if(process.env.E2E_ACCESS_TOKEN)await page.context().addCookies([{name:'orc_e2e_access',value:process.env.E2E_ACCESS_TOKEN,url:'http://127.0.0.1:3010'}]);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:3010/?barber=barao-e2e',{waitUntil:'networkidle'});
 console.log('visible actions',await page.getByRole('button').allTextContents());
 await page.screenshot({path:'.runtime/e2e/mobile-landing.png',fullPage:true});
 const analyze=page.getByRole('button',{name:/Ver Diagnóstico Gratuito/i}).first();
 await analyze.click();
 await page.getByRole('button',{name:/melhor|corrigir|otimizar|começar/i}).first().waitFor({timeout:15000});
 await page.screenshot({path:'.runtime/e2e/mobile-diagnosis.png',fullPage:true});
 await page.getByRole('button',{name:'Iniciar Melhorias Gratuitas da Minha Barbearia'}).click();
 await page.getByRole('heading',{name:'Seu espaço Eleva + Agenda ORC'}).waitFor();
 await page.screenshot({path:'.runtime/e2e/mobile-workspace.png',fullPage:true});
 await page.getByRole('button',{name:'5',exact:true}).click();
 await page.getByRole('button',{name:/Baixar Plaquinha 2 em 1/}).click();
 await page.getByRole('dialog',{name:'Ativar plano'}).waitFor();
 await page.getByRole('button',{name:'Fechar',exact:true}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Baixar Versão Apenas Google (Sem Wi-Fi)'}).click();
 const asset=await download;await asset.saveAs('.runtime/e2e/free-google-qr.png');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(overflow)throw Error('Mobile horizontal overflow');
 console.log('Mobile LP, diagnosis, wizard, paid gate and free QR download verified.');
 if(errors.length)throw Error(errors.join('\n'));
 fs.writeFileSync('.runtime/e2e/browser-smoke-result.json',JSON.stringify({success:true,at:new Date().toISOString(),viewport:'390x844',pageErrors:errors}),{mode:0o600});
}finally{await browser.close();}
