import {useEffect,useState,type FormEvent} from 'react';
import {createRoot} from 'react-dom/client';
import CourseApp from './ui';
import {supabase,configured} from './api';
import './globals.css';
function App(){
 const [ready,setReady]=useState(false),[signedIn,setSignedIn]=useState(false),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[recovery,setRecovery]=useState(false);
 useEffect(()=>{if(!supabase){setReady(true);return}supabase.auth.getSession().then(({data})=>{setSignedIn(!!data.session);setReady(true)});const {data}=supabase.auth.onAuthStateChange((event,session)=>{setSignedIn(!!session);if(event==='PASSWORD_RECOVERY')setRecovery(true)});return ()=>data.subscription.unsubscribe()},[]);
 async function submit(e:FormEvent){e.preventDefault();if(!supabase)return;setBusy(true);setMessage('');try{const {error}=recovery?await supabase.auth.updateUser({password}):await supabase.auth.signInWithPassword({email,password});if(error)throw error;setRecovery(false)}catch(e){setMessage(e instanceof Error?e.message:'登入失敗')}finally{setBusy(false)}}
 async function reset(){if(!email){setMessage('請先填寫 Email');return}setBusy(true);try{const {error}=await supabase!.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+import.meta.env.BASE_URL});if(error)throw error;setMessage('若帳號存在，您會收到設定密碼的信件。')}catch(e){setMessage(e instanceof Error?e.message:'寄送失敗')}finally{setBusy(false)}}
 if(!configured)return <main><section className="welcome"><span className="eyebrow">COURSE TOGETHER</span><h1>課聚<br/>課程管理空間</h1><p>新版網站已準備好，正在連接課程資料庫與附件空間。設定完成後，即可登入使用。</p><a className="primary" href="https://seminar-course-hub-1012.daneshan.chatgpt.site/">先使用目前課程網站</a></section></main>;
 if(!ready)return <main>正在確認登入…</main>;
 if(!signedIn||recovery)return <main><form className="welcome" onSubmit={submit}><span className="eyebrow">COURSE TOGETHER</span><h1>{recovery?'設定密碼':'登入課程'}</h1><p>請使用老師設定的課程 Email 帳號。</p>{!recovery&&<label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}<label>密碼<input type="password" autoComplete={recovery?'new-password':'current-password'} required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy}>{busy?'處理中…':recovery?'儲存密碼':'登入'}</button>{!recovery&&<button type="button" disabled={busy} onClick={reset}>首次使用 / 忘記密碼</button>}{message&&<p role="status">{message}</p>}</form></main>;
 return <><div className="login-bar"><button onClick={()=>supabase!.auth.signOut()}>登出</button></div><CourseApp/></>;
}
createRoot(document.getElementById('root')!).render(<App/>);
