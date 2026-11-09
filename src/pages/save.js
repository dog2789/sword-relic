/* 세이브 옮기기: localStorage의 sr_* 값을 코드(SR1:base64)나 파일로 내보내고 불러옴 */
import {summary,readSave,IN_APP} from './common.js';
const PLAY=IN_APP?'/play/index.html':'/play/';

// 옮기는 값: 진행 상황 + 캐릭터 모습 + 설정 (개발자 보기 sr_dev, 되돌리기용 sr_save2_old는 뺌)
const ALLOW=['sr_save2','sr_look3','sr_opts','sr_keys','sr_vol','sr_mute','sr_bs'];
const MAX=300000;   // 값 하나 최대 길이 (정상 세이브는 수 KB)
const $=id=>document.getElementById(id);
const ls={get:k=>{try{return localStorage.getItem(k)}catch(_){return null}},set:(k,v)=>{try{localStorage.setItem(k,v);return true}catch(_){return false}},del:k=>{try{localStorage.removeItem(k)}catch(_){}}};

const b64e=s=>{const b=new TextEncoder().encode(s);let t='';for(let i=0;i<b.length;i+=0x8000)t+=String.fromCharCode(...b.subarray(i,i+0x8000));return btoa(t)};
const b64d=s=>new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)));

export function exportPack(){const data={};for(const k of ALLOW){const v=ls.get(k);if(v!==null)data[k]=v}return{v:1,game:'sword-relic',at:new Date().toISOString(),data}}
export const toCode=p=>'SR1:'+b64e(JSON.stringify(p));

/* 붙여 넣은 코드나 파일 내용 → 검사한 묶음 (틀리면 이유를 담은 Error) */
export function parsePack(text){
  text=String(text||'').trim();if(!text)throw new Error('코드가 비어 있어요.');
  let p;
  try{p=text.startsWith('{')?JSON.parse(text):JSON.parse(b64d(text.replace(/^SR1:/,'').replace(/\s+/g,'')))}catch(_){throw new Error('소드 레릭 세이브 코드가 아니에요. 처음부터 끝까지 빠짐없이 복사했는지 확인해 주세요.')}
  if(!p||typeof p!=='object'||p.game!=='sword-relic'||!p.data||typeof p.data!=='object')throw new Error('소드 레릭 세이브 코드가 아니에요.');
  const data={};
  for(const [k,v] of Object.entries(p.data)){if(!ALLOW.includes(k))continue;if(typeof v!=='string'||v.length>MAX)throw new Error('세이브 내용이 망가져 있어요.');data[k]=v}
  const s=readSave(data.sr_save2);
  if(!s||!Number.isFinite(s.stats.lv)||typeof s.room!=='string')throw new Error('세이브 내용이 망가져 있어요.');
  return{data,save:s};
}

function applyPack(pk){
  const cur=ls.get('sr_save2');if(cur)ls.set('sr_save2_old',cur);   // 덮어쓰기 전 한 번 되돌릴 수 있게
  for(const [k,v] of Object.entries(pk.data))if(!ls.set(k,v))return false;
  return true;
}

/* ---- 화면 ---- */
if(typeof document!=='undefined'&&$('sum')){
  const msg=(id,t,ok)=>{const m=$(id);m.textContent=t;m.className='msg '+(ok?'ok':'err')};
  let pending=null;
  const draw=()=>{const s=readSave(ls.get('sr_save2'));
    $('sum').innerHTML=s?summary(s):'<p class="muted">이 기기에는 아직 세이브가 없어요. 다른 곳의 세이브를 불러오거나 <a href="${PLAY}">새로 시작</a>해 보세요.</p>';
    $('copy').disabled=$('file').disabled=!s;$('undo').hidden=!readSave(ls.get('sr_save2_old'))};
  draw();
  $('copy').onclick=async()=>{const c=toCode(exportPack());
    try{await navigator.clipboard.writeText(c);msg('msg1','코드를 복사했어요. 옮길 곳에서 붙여 넣어 주세요.',true)}
    catch(_){$('code').value=c;$('code').select();msg('msg1','자동 복사가 막혀 있어요. 아래 칸의 코드를 직접 복사해 주세요.',false)}};
  $('file').onclick=()=>{const p=exportPack(),d=p.at.slice(0,10),a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(p)],{type:'application/json'}));a.download=`sword-relic-save-${d}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    msg('msg1','세이브 파일을 저장했어요.',true)};
  const show=text=>{try{pending=parsePack(text);$('sum2').innerHTML=summary(pending.save);$('preview').hidden=false;$('msg2').textContent='';$('apply').focus()}
    catch(e){pending=null;$('preview').hidden=true;msg('msg2',e.message,false)}};
  $('check').onclick=()=>show($('code').value);
  $('pick').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>2*MAX){msg('msg2','파일이 너무 커요. 세이브 파일이 맞는지 확인해 주세요.',false);return}
    f.text().then(t=>{$('code').value=t.startsWith('{')?'':t;show(t)});e.target.value=''};
  $('cancel').onclick=()=>{pending=null;$('preview').hidden=true};
  $('apply').onclick=()=>{if(!pending)return;
    if(!applyPack(pending)){msg('msg2','저장 공간에 쓰지 못했어요. 브라우저의 사이트 데이터 설정을 확인해 주세요.',false);return}
    pending=null;$('preview').hidden=true;$('code').value='';draw();
    $('msg2').innerHTML=`불러왔어요! <a href="${PLAY}">게임에서 이어 하기 ▶</a>`;$('msg2').className='msg ok'};
  $('undo').onclick=()=>{const old=ls.get('sr_save2_old');if(!old)return;if(!confirm('불러오기 전 세이브로 되돌릴까요? 지금 세이브는 사라져요.'))return;
    ls.set('sr_save2',old);ls.del('sr_save2_old');draw();msg('msg1','불러오기 전 세이브로 되돌렸어요.',true)};
}
