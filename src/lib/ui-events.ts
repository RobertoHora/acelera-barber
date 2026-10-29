export function trackUiEvent(businessId:string,event:string,sku?:string){
 try{
  let visit=sessionStorage.getItem('orc_visit');if(!visit){visit=crypto.randomUUID();sessionStorage.setItem('orc_visit',visit);}
  void fetch('/api/v1/events',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,body:JSON.stringify({businessId,event,eventId:`${visit}:${sku||'default'}`,sku})}).catch(()=>{});
 }catch{/* Event logging must not block a useful client action. */}
}
