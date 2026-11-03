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

window.addEventListener('keydown',e=>{if(typing(e))return;const c=codeOf(e);down.add(c);if(GAME.has(c))e.preventDefault()},true);
window.addEventListener('keyup',e=>{const c=codeOf(e);down.delete(c)},true);
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
