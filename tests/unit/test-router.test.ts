import { describe,it,expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createTestRouter,canonicalPhone,matchesReservation} from '../../services/laura-engine/gateway/test-router.mjs';
describe('exclusive assisted-test routing',()=>{
 const phone='5511988881234';
 it('uses exact normalized identities, never suffixes',()=>{
  const s={phone,status:'PAUSED',lids:['123456@lid']};
  expect(matchesReservation(s,{phone:'(11) 98888-1234'})).toBe(true);
  expect(matchesReservation(s,{phone:'1234'})).toBe(false);
  expect(matchesReservation(s,{phone:'55119888812345'})).toBe(false);
  expect(matchesReservation(s,{remoteJid:'123456@lid'})).toBe(true);
  expect(matchesReservation(s,{remoteJid:'99123456@lid'})).toBe(false);
  expect(canonicalPhone('123456@lid')).toBe(null);
 });
 it('durably holds paused inbound and isolates all event types',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'laura-router-'));const stateFile=path.join(dir,'active.json');
  try{
   fs.writeFileSync(stateFile,JSON.stringify({runId:'run1',phone,status:'PAUSED',transport:'SIMULATED'}));
   const router=createTestRouter({stateFile,spoolDir:path.join(dir,'spool'),token:'test'});
   for(const kind of ['inbound','presence','receipt'])expect(await router.route(kind,{phone,messageId:'m1'})).toBe(true);
   expect(fs.readdirSync(path.join(dir,'spool'))).toHaveLength(3);
   expect(await router.route('inbound',{phone:'5511977770000',messageId:'m2'})).toBe(false);
   expect(()=>router.assertOutbound(phone)).toThrow('CONTACT_RESERVED');
   expect(()=>router.assertOutbound('5511977770000')).not.toThrow();
   fs.writeFileSync(stateFile,'invalid');
   expect(await router.route('inbound',{phone,messageId:'m3'})).toBe(true);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
 });
});
it('only lets the authenticated Laura context send to the reserved exact target',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'laura-egress-'));const stateFile=path.join(dir,'active.json');const phone='5511988881234';
 try{
  fs.writeFileSync(stateFile,JSON.stringify({runId:'r',phone,status:'RUNNING',transport:'REAL'}));
  const router=createTestRouter({stateFile,spoolDir:path.join(dir,'spool'),token:'secret'});
  let status=0,called=false;const response={status:(s:number)=>{status=s;return response;},json:()=>response};
  router.middleware({headers:{'x-orc-engine':'laura','x-laura-token':'wrong','x-test-run-id':'r'},body:{to:phone}},response,()=>called=true);
  expect(status).toBe(403);expect(called).toBe(false);
  router.middleware({headers:{'x-orc-engine':'laura','x-laura-token':'secret','x-test-run-id':'r'},body:{to:phone}},response,()=>{
   called=true;expect(()=>router.assertOutbound(phone)).not.toThrow();expect(()=>router.assertOutbound('5511988880000')).toThrow('EGRESS_BLOCKED');
  });expect(called).toBe(true);
  expect(()=>router.assertOutbound(phone)).toThrow('CONTACT_RESERVED');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
