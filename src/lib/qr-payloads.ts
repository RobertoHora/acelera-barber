export function wifiQrPayload(ssid:string,password:string){
 const escape=(v:string)=>v.replace(/([\\;,:"'])/g,'\\$1');
 return `WIFI:T:${password?'WPA':'nopass'};S:${escape(ssid)};P:${escape(password)};;`;
}
export function reviewQrUrl(reviewUrl?:string,placeId?:string){
 if(reviewUrl){try{const url=new URL(reviewUrl);if(url.protocol==='https:'&&(url.hostname==='search.google.com'||url.hostname==='g.page'||url.hostname==='maps.google.com'||url.hostname==='www.google.com'))return url.toString();}catch{}}
 return placeId?`https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`:null;
}
