import {createClient} from '@supabase/supabase-js';
export const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
class Statement{
 values:unknown[]=[];
 constructor(private sql:string){}
 bind(...values:unknown[]){this.values=values;return this}
 async first<T>():Promise<T|null>{const {data,error}=await admin.from('course_state').select('revision,data').eq('id',1).maybeSingle();if(error)throw error;return data as T|null}
 async run(){
  if(this.sql.startsWith('INSERT')){const {error}=await admin.from('course_state').insert({id:1,revision:1,data:this.values[0]});if(error&&error.code!=='23505')throw error;return {meta:{changes:error?0:1}}}
  if(!this.sql.startsWith('UPDATE'))throw new Error('Unsupported query');
  const revision=Number(this.values[1]);const {data,error}=await admin.from('course_state').update({data:this.values[0],revision:revision+1}).eq('id',1).eq('revision',revision).select('id');if(error)throw error;return {meta:{changes:data.length}};
 }
}
export const env={DB:{prepare:(sql:string)=>new Statement(sql)},BUCKET:{
 async put(key:string,stream:ReadableStream,options:unknown){const bytes=await new Response(stream).arrayBuffer();const {error}=await admin.storage.from('reports').upload(key,bytes,{contentType:'application/octet-stream',upsert:false});if(error)throw error},
 async get(key:string){const {data,error}=await admin.storage.from('reports').download(key);if(error)return null;return {body:data.stream(),size:data.size}},
 async delete(key:string){const {error}=await admin.storage.from('reports').remove([key]);if(error)throw error}
}};
