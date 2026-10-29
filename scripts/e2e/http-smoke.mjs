for(let attempt=0;attempt<50;attempt++){
 try{await fetch('http://127.0.0.1:3010/api/v1/auth/me',{signal:AbortSignal.timeout(1000)});break;}catch{if(attempt===49)throw Error('Local homologation did not start.');await new Promise(r=>setTimeout(r,100));}
}
import pg from 'pg';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
const base=process.env.E2E_APP_URL||'http://127.0.0.1:3010';
if(!process.env.DATABASE_URL?.includes('/eleva_agenda_e2e?')||process.env.WHATSAPP_TRANSPORT_MODE!=='SIMULATED')throw Error('Smoke requires isolated E2E database and simulated transport.');
const c=new pg.Client({connectionString:process.env.DATABASE_URL});await c.connect();
const id='http_smoke_'+crypto.randomUUID(),slug=id.replaceAll('_','-'),phone='+5511988880456',owner='smoke_owner_'+crypto.randomUUID();
const checks=[];let session='';
async function request(route,method='GET',body,expected=200,auth=true){
 const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(process.env.E2E_ACCESS_TOKEN?{cookie:'orc_e2e_access='+process.env.E2E_ACCESS_TOKEN}:{}),...(auth&&session?{authorization:'Bearer '+session}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await r.json();assert.equal(r.status,expected,`${method} ${route}: ${JSON.stringify(data)}`);checks.push({route,method,status:r.status});return data;
}
try{
 await c.query('INSERT INTO "User" (id,phone,"updatedAt") VALUES ($1,$2,NOW()) ON CONFLICT (phone) DO UPDATE SET "updatedAt"=NOW() RETURNING id',[owner,phone]);
 const user=(await c.query('SELECT id FROM "User" WHERE phone=$1',[phone])).rows[0];
 await c.query('INSERT INTO "Business" (id,slug,name,"cleanName",phone,whatsapp,"userId","placeId","updatedAt") VALUES ($1,$2,$3,$3,$4,$4,$5,$6,NOW())',[id,slug,'Barbearia Smoke HTTP',phone,user.id,'ChIJ-smoke-not-for-publication']);
 const pro='smoke_prof_'+crypto.randomUUID(),service='smoke_svc_'+crypto.randomUUID();
 await c.query('INSERT INTO "Professional" (id,"businessId",name,"workingHours","updatedAt") VALUES ($1,$2,$3,$4,NOW())',[pro,id,'Profissional Smoke',JSON.stringify(Array.from({length:7},(_,day)=>({day,open:'08:00',close:'20:00'})))]);
 await c.query('INSERT INTO "Service" (id,"businessId",name,"priceCents","durationMinutes","updatedAt") VALUES ($1,$2,$3,3500,30,NOW())',[service,id,'Corte Smoke']);
 await request(`/api/v1/businesses/${id}`,'PATCH',{infiniteTag:'$forged'},403,false);
 await request(`/api/v1/businesses/${id}/diagnose`);
 await request('/api/v1/auth/request-otp','POST',{phone});
 const otp=(await c.query('SELECT content FROM "OutboxMessage" WHERE "destinationPhone"=$1 AND purpose=$2 ORDER BY "createdAt" DESC LIMIT 1',[phone,'AUTH_OTP'])).rows[0].content.match(/\*(\d{6})\*/)[1];
 const login=await request('/api/v1/auth/verify-otp','POST',{phone,code:otp});session=login.sessionToken;
 const order=await request('/api/v1/orders','POST',{businessId:id,planCode:'eleva_google_pro',idempotencyKey:id+':pro'},201);assert.equal(order.simulated,true);assert.equal(order.order.amountCents,3700);
 await request(`/api/v1/orders/${order.order.id}/simulate`,'POST',{});
 let ws=await request(`/api/v1/businesses/${id}/workspace`);assert.equal(ws.pro,true);assert.equal(ws.trial.grantedDays,14);assert.equal(ws.trial.status,'GRANTED');assert.equal(ws.trial.activatedAt,null);
 const active=await request(`/api/v1/businesses/${id}/trial/activate`,'POST',{selectedModality:'agenda_ai_monthly'});const started=active.trialBenefit.activatedAt;
 const upgrade=await request('/api/v1/orders','POST',{businessId:id,planCode:'eleva_complete_upgrade',idempotencyKey:id+':upgrade'},201);assert.equal(upgrade.order.amountCents,2000);
 await request(`/api/v1/orders/${upgrade.order.id}/simulate`,'POST',{});
 await request(`/api/v1/orders/${upgrade.order.id}/simulate`,'POST',{}); // Replay must not create duplicate benefits.
 ws=await request(`/api/v1/businesses/${id}/workspace`);assert.equal(ws.complete,true);assert.equal(ws.trial.grantedDays,30);assert.equal(ws.trial.activatedAt,started);
 await request(`/api/v1/businesses/${id}`,'PATCH',{infiniteTag:'$barbeariasmoke'});
 await request(`/api/v1/businesses/${id}`,'PATCH',{onlinePaymentsEnabled:true},400);
 await request(`/api/v1/businesses/${id}`,'PATCH',{onlinePaymentsEnabled:true,confirmedTagOwnership:true});
 const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
 const available=await request(`/api/v1/public/agenda/${slug}/slots?date=${tomorrow}&serviceId=${service}`);assert(available.slots.length);
 const params={businessId:id,serviceId:service,professionalId:pro,startsAt:available.slots[0].startsAt,customerName:'Cliente Smoke',customerPhone:phone,idempotencyKey:id+':booking',isPrepaid:true,prepaidAmountCents:3500};
 const booking=await request('/api/v1/public/bookings','POST',params,201);assert.equal(booking.booking.isPrepaid,false);assert(booking.bookingToken);
 const notices=(await c.query('SELECT purpose FROM "OutboxMessage" WHERE "businessId"=$1 AND purpose IN ($2,$3)',[id,'BOOKING_CUSTOMER_NOTICE','BOOKING_BUSINESS_NOTICE'])).rows;assert.equal(notices.length,2);
 const payment=await request(`/api/v1/public/bookings/${booking.bookingToken}/payment`,'POST',{});assert.equal(payment.simulated,true);
 await request(`/api/v1/public/bookings/${booking.bookingToken}/payment`,'POST',{simulate:true});
 const paidBooking=await request(`/api/v1/public/bookings/${booking.bookingToken}`);assert.equal(paidBooking.booking.isPrepaid,true);
 await request('/api/v1/public/bookings','POST',{...params,idempotencyKey:id+':conflict'},409);
 await request(`/api/v1/public/bookings/${booking.bookingToken}`,'DELETE',{reason:'Smoke validation'});
 const material=await fetch(base+`/api/v1/businesses/${id}/assets?kind=logo`,{headers:{authorization:'Bearer '+session,...(process.env.E2E_ACCESS_TOKEN?{cookie:'orc_e2e_access='+process.env.E2E_ACCESS_TOKEN}:{})}});assert.equal(material.status,200);assert((await material.text()).includes('<svg'));
 checks.push({route:'assets/logo',status:200});
 console.log(JSON.stringify({success:true,checks:checks.length,scope:'isolated HTTP smoke',realMessages:0,realCharges:0}));
 fs.writeFileSync('.runtime/e2e/http-smoke-result.json',JSON.stringify({at:new Date().toISOString(),success:true,checks},null,2),{mode:0o600});
}finally{
 // Explicit exact fixture scope only; preserve the active personal test and all other databases.
 for(const table of ['GrowthEvent','OutboxMessage','Booking','CustomerVoucher','Customer','Service','Professional','TrialBenefit','Subscription','Entitlement','Order','NeedObservation','DiagnosticReport']){
  if(table==='Order')await c.query('DELETE FROM "PaymentTransaction" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "businessId"=$1)',[id]);
  await c.query(`DELETE FROM "${table}" WHERE "businessId"=$1`,[id]);
 }
 await c.query('DELETE FROM "Business" WHERE id=$1',[id]);
 await c.query('DELETE FROM "OutboxMessage" WHERE "destinationPhone"=$1 AND purpose=$2',[phone,'AUTH_OTP']);
 await c.query('DELETE FROM "OtpVerification" WHERE phone=$1',[phone]);
 await c.query('DELETE FROM "User" WHERE phone=$1',[phone]);await c.end();
}
