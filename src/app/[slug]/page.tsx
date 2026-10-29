import ElevaApp from '@/components/ElevaApp';
import {ALL_LEADS} from '@/lib/leads';
import {notFound,redirect} from 'next/navigation';
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const canonical=(name:string)=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const lead=ALL_LEADS.find(l=>canonical(l.cleanName||l.name)===slug||l.slug===slug||l.aliases?.includes(slug));
 if(!lead)notFound();const name=canonical(lead.cleanName||lead.name);
 if(slug!==name)redirect('/'+name);
 return <ElevaApp initialLead={lead}/>;
}
