import {prisma as appDb} from '@/lib/db';
// The original Lana breaker uses its own durable state here, never Lana's write connection.
export const prisma={appSetting:{
 findUnique:async({where}:{where:{id:string}})=>appDb.lauraSafetyState.findUnique({where}),
 upsert:async(input:any)=>appDb.lauraSafetyState.upsert(input),
}};
