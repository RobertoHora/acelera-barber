import { NextResponse } from 'next/server';
import { validInternalToken } from '@/lib/internal-auth';
import { receiveLauraInbound } from '../../../../../../services/laura-engine/durable-inbox';
export async function POST(request:Request){
 if(!validInternalToken(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 try{const body=await request.json();const item=await receiveLauraInbound(body);return NextResponse.json({accepted:true,id:item.id});}
 catch{return NextResponse.json({error:'Invalid inbound'},{status:400});}
}
