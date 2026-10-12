import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL||'',key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'';
export const configured=!!url&&!!key&&!url.includes('YOUR_PROJECT');
export const supabase=configured?createClient(url,key):null;
export async function apiFetch(path:string,init:RequestInit={}){
 if(!supabase)throw new Error('後端尚未設定');
 const {data:{session}}=await supabase.auth.getSession();
 if(!session)return Response.json({error:'登入已逾期，請重新登入',signin:true},{status:401});
 const headers=new Headers(init.headers);headers.set('apikey',key);headers.set('Authorization',`Bearer ${session.access_token}`);
 return fetch(`${url}/functions/v1/course-api/${path.replace(/^\/api\//,'')}`,{...init,headers});
}
export async function downloadFile(id:string,name:string){
 const r=await apiFetch(`/api/files?id=${encodeURIComponent(id)}`);
 if(!r.ok){const e=await r.json();throw new Error(e.error||'下載失敗')}
 const url=URL.createObjectURL(await r.blob()),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
