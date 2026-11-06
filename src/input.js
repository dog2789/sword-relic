/* 키보드 상태를 장면과 상관없이 직접 기록
   (Phaser 키 상태는 방 이동으로 장면이 다시 시작될 때 초기화돼서, 누르고 있던 키가 끊기는 문제가 있음)
   한글 입력 상태·Caps Lock 에서도 동작하도록 물리 키(e.code) 기준으로 기록하고,
   e.code 가 비어 있는 브라우저는 한글 자모 / 영문 글자 / keyCode 로 키 위치를 찾음 */
const down=new Set();

const JAMO={'ㅂ':'KeyQ','ㅃ':'KeyQ','ㅈ':'KeyW','ㅉ':'KeyW','ㄷ':'KeyE','ㄸ':'KeyE','ㄱ':'KeyR','ㄲ':'KeyR','ㅅ':'KeyT','ㅆ':'KeyT',
  'ㅛ':'KeyY','ㅕ':'KeyU','ㅑ':'KeyI','ㅐ':'KeyO','ㅒ':'KeyO','ㅔ':'KeyP','ㅖ':'KeyP',
  'ㅁ':'KeyA','ㄴ':'KeyS','ㅇ':'KeyD','ㄹ':'KeyF','ㅎ':'KeyG','ㅗ':'KeyH','ㅓ':'KeyJ','ㅏ':'KeyK','ㅣ':'KeyL',
  'ㅋ':'KeyZ','ㅌ':'KeyX','ㅊ':'KeyC','ㅍ':'KeyV','ㅠ':'KeyB','ㅜ':'KeyN','ㅡ':'KeyM'};
const KC={13:'Enter',27:'Escape',32:'Space',37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown'};

function codeOf(e){
  if(e.code&&e.code!=='Unidentified')return e.code;
  const k=e.key||'';
  if(JAMO[k])return JAMO[k];
  if(/^[a-z]$/i.test(k))return 'Key'+k.toUpperCase();
  if(/^[0-9]$/.test(k))return 'Digit'+k;
  const c=e.keyCode;
  if(c>=65&&c<=90)return 'Key'+String.fromCharCode(c);
  if(c>=48&&c<=57)return 'Digit'+(c-48);
  return KC[c]||k;
}

/* 게임에서 쓰는 키는 브라우저 기본 동작(스크롤, 버튼 눌림)을 막음 */
const GAME=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyZ','KeyX','KeyC','KeyI','KeyM','Enter','Escape']);
const typing=e=>{const t=e.target;return t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))};

/* 키 설정: 사용자가 고른 키를 원래 키(게임 코드가 보는 이름)로 바꿔서 기록 → 게임 코드는 그대로 둠
   localStorage sr_keys = {동작: 고른 키 code}. 고른 키가 다른 동작의 기본 키였으면 그 기본 동작은 안 함 */
export const ACTIONS=[['left','왼쪽','ArrowLeft'],['right','오른쪽','ArrowRight'],['up','위','ArrowUp'],['down','아래','ArrowDown'],
  ['atk','공격','KeyZ'],['jump','점프','KeyX'],['skill','스킬','KeyC'],['menu','장비','KeyI'],['map','지도','KeyM']];
let remap={};
export const keyName=c=>({ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'Space',Enter:'Enter',ShiftLeft:'Shift',ShiftRight:'Shift',ControlLeft:'Ctrl',ControlRight:'Ctrl',AltLeft:'Alt'}[c]||c.replace(/^(Key|Digit|Numpad)/,''));
export const getBinds=()=>{try{return JSON.parse(localStorage.getItem('sr_keys')||'{}')||{}}catch(_){return{}}};
export function setBinds(b){try{localStorage.setItem('sr_keys',JSON.stringify(b))}catch(_){}
  remap={};for(const [k,,def] of ACTIONS)if(b[k]&&b[k]!==def)remap[b[k]]=def;down.clear()}
setBinds(getBinds());
let capture=null;   // 키 설정 창에서 다음 키 하나를 받아 갈 함수
export const captureKey=f=>{capture=f};

window.addEventListener('keydown',e=>{
  if(capture){e.preventDefault();e.stopPropagation();const f=capture;capture=null;f(codeOf(e));return}
  if(typing(e))return;const c=remap[codeOf(e)]||codeOf(e);down.add(c);if(GAME.has(c))e.preventDefault()},true);
window.addEventListener('keyup',e=>{const c=codeOf(e);down.delete(remap[c]||c)},true);
window.addEventListener('blur',()=>down.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)down.clear()});

export const isDown=(...codes)=>codes.some(c=>down.has(c));

/* 눌린 순간만 true (장면마다 하나씩 만들어 update에서 사용)
   const ed=edges(); ... if(ed('ok',isDown('KeyZ')))  */
export function edges(){
  const prev={};
  // 처음 호출될 때 이미 눌려 있던 키(이전 화면에서 누른 키)는 무시
  return (name,now)=>{now=!!now;if(!(name in prev)){prev[name]=now;return false}const p=prev[name];prev[name]=now;return now&&!p};
}
