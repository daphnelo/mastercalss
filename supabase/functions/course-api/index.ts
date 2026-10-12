import {admin} from './storage.ts';
import * as course from './course.ts';
import * as files from './files.ts';
const allowedOrigin=Deno.env.get('ALLOWED_ORIGIN')||'https://daphnelo.github.io';
export async function handler(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==allowedOrigin)return Response.json({error:'不允許此來源'},{status:403});
 const cors={'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
 const respond=(r:Response)=>{const headers=new Headers(r.headers);for(const [k,v]of Object.entries(cors))headers.set(k,v);return new Response(r.body,{status:r.status,headers})};
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 try{
  const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token)return respond(Response.json({error:'請先登入'},{status:401}));
  const {data:{user},error}=await admin.auth.getUser(token);if(error||!user||!user.email_confirmed_at)return respond(Response.json({error:'登入已逾期或 Email 尚未確認'},{status:401}));
  const headers=new Headers(request.headers);headers.set('oai-authenticated-user-id',user.id);headers.set('oai-authenticated-user-email',user.email||'');headers.delete('origin');
  const authenticated=new Request(request,{headers});
  const url=new URL(request.url),path=url.pathname.split('/').pop();
  const routes=path==='course'?course:path==='files'?files:null;
  const fn=routes?.[request.method as keyof typeof routes];
  if(typeof fn!=='function')return respond(Response.json({error:'找不到操作'},{status:404}));
  return respond(await fn(authenticated));
 }catch{return respond(Response.json({error:'服務暫時無法使用，請稍後重試'},{status:503}))}
}
Deno.serve(handler);
