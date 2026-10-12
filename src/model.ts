export type Attachment={id:string,studentId:string,name:string,size:number,uploadedAt:string};
export type Student={id:string,name:string,email:string};
export type Session={id:string,label:string,note:string,kind:string,assigned:string[],volunteers:string[],attendance:Record<string,'present'|'absent'>};
export type Report={studentId:string,sessionId:string,topic:string,updatedAt:string};
export type Scoring={attendance:number,absence:number};
export type State={attachments?:Attachment[],scoring?:Scoring,teacher:string,year:number|null,students:Student[],sessions:Session[],reports:Report[],log:{time:string,text:string}[]};
export function minimum(s:Session){return s.kind==='regular'?4:s.kind==='all'?18:0}
export function score(state:State,id:string){let present=0,absent=0;for(const s of state.sessions){if(s.attendance[id]==='present')present++;if(s.attendance[id]==='absent'&&s.assigned.includes(id))absent++;}return {present,absent,total:Math.round((present*getScoring(state).attendance-absent*getScoring(state).absence)*100)/100}}
export function sessionDate(s:Session,year:number|null){if(!year)return '';const m=s.label.match(/(\d+)月(\d+)日/);return m?`${year+(+m[1]<9?1:0)}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`:''}
export function fillSchedule(state:State){const counts=Object.fromEntries(state.students.map(s=>[s.id,state.sessions.filter(x=>x.kind==='regular'&&x.assigned.includes(s.id)).length]));for(const s of state.sessions){if(s.kind!=='regular'||Object.keys(s.attendance).length)continue;while(s.assigned.length<4){const next=state.students.filter(p=>!s.assigned.includes(p.id)).sort((a,b)=>counts[a.id]-counts[b.id]||a.id.localeCompare(b.id))[0];if(!next)break;s.assigned.push(next.id);s.volunteers=s.volunteers.filter(id=>id!==next.id);counts[next.id]++;}}}

export function getScoring(state:Pick<State,"scoring">):Scoring{return state.scoring??{attendance:10,absence:5}}
export function attendancePoints(state:Pick<State,"scoring">,session:Session,id:string){const rules=getScoring(state);return session.attendance[id]==='present'?rules.attendance:session.attendance[id]==='absent'&&session.assigned.includes(id)?-rules.absence:0}

