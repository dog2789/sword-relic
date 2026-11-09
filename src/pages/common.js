/* 사이트 페이지 공통: 앱(PC Electron app:// · 폰 Capacitor) 안에서는 '/play/' 같은 폴더 주소를 못 찾을 수 있어서 index.html을 붙임 */
import {ROOMS} from '../world/rooms.js';

export const IN_APP=location.protocol==='app:'||!!window.Capacitor;
if(IN_APP)document.querySelectorAll('a[href^="/"]').forEach(a=>{const h=a.getAttribute('href');if(h.endsWith('/'))a.setAttribute('href',h+'index.html')});

export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const playTime=t=>{t=Math.floor(t||0);const h=Math.floor(t/3600),m=Math.floor(t%3600/60);return h?`${h}시간 ${m}분`:`${m}분`};
export const roomName=id=>(ROOMS[id]&&ROOMS[id].name)||'처음 들판';
export const readSave=raw=>{try{const v=JSON.parse(raw||'null');return v&&typeof v==='object'&&v.stats&&typeof v.stats==='object'?v:null}catch(_){return null}};

/* 세이브 한 줄 요약 (세이브 페이지 미리보기) */
export function summary(s){
  const vis=Object.keys(s.visited||{}).filter(k=>ROOMS[k]).length;
  return `<dl class="save-sum">${[
    ['이름',s.name||'모험가'],['레벨','Lv '+(s.stats.lv|0)],['플레이 시간',playTime(s.time)],
    ['저장 위치',roomName((s.save&&s.save.room)||s.room)],['탐험률',Math.round(vis/Object.keys(ROOMS).length*100)+'%'],['골드',(s.gold|0).toLocaleString()]
  ].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}
