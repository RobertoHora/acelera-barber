// Only the isolated assisted test adds its access credential to messages sent to the operator.
// Production links are returned unchanged.
export function withTestAccess(url:string):string{
 if(!process.env.E2E_RUN_ID||!process.env.E2E_ACCESS_TOKEN)return url;
 const target=new URL(url);target.searchParams.set('test_access',process.env.E2E_ACCESS_TOKEN);return target.toString();
}
