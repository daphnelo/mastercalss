'use client';
import {useEffect,useState} from 'react';
import {Check} from 'lucide-react';
import {getScoring,type State} from './model';
export default function ScoringForm({state,busy,save}:{state:State,busy:boolean,save:(b:Record<string,unknown>)=>Promise<boolean>}){
const rules=getScoring(state);const [attendance,setAttendance]=useState(String(rules.attendance)),[absence,setAbsence]=useState(String(rules.absence));
useEffect(()=>{setAttendance(String(rules.attendance));setAbsence(String(rules.absence))},[rules.attendance,rules.absence]);
return <form className="panel settings-panel scoring-panel" onSubmit={async e=>{e.preventDefault();if(attendance.trim()&&absence.trim())await save({action:'scoring',attendancePoints:Number(attendance),absencePoints:Number(absence)})}}><span className="eyebrow">SCORING RULES</span><h3>加扣分設定</h3><p>由您決定每次到課的獎勵，以及排班未到的扣分。填入 0 代表不加分或不扣分。</p><div className="form-row"><label>每次到課加分<input type="number" required min="0" max="1000" step="0.01" value={attendance} onChange={e=>setAttendance(e.target.value)}/><small>有排班與自願到課都適用</small></label><label>每次排班未到扣分<input type="number" required min="0" max="1000" step="0.01" value={absence} onChange={e=>setAbsence(e.target.value)}/><small>填正數即可，例如 5 代表扣 5 分</small></label></div><div className="notice">儲存後會套用全學期，包含已確認的點名紀錄；當堂分數、累計積分及匯出檔會重新計算。無排班且未到維持 0 分。</div><div className="form-bottom"><p>目前規則：到課 +{rules.attendance} 分；排班未到 −{rules.absence} 分。</p><button className="primary" disabled={busy}>儲存加扣分設定 <Check size={16}/></button></div></form>}
