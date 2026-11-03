/* 진행 상황 (방을 옮겨도 유지되는 값)
   세이브 석상에 닿으면 localStorage에 저장, 새로고침하면 마지막 저장 지점에서 시작 */
const KEY='sr_save1';

function fresh(){
  return{
    room:'r1',
    stats:{lv:1,hp:60,maxHp:60,mp:30,maxMp:30,exp:0,next:20,atk:8},
    gear:0,
    abilities:{djump:false},
    opened:{},      // 연 상자
    collected:{},   // 주운 결정
    bossDown:false,
    visited:{r1:true},
    save:null       // {room, tx}
  };
}

export const STATE=fresh();

export function loadGame(){
  try{
    const v=JSON.parse(localStorage.getItem(KEY)||'null');
    if(v&&v.stats&&v.save){Object.assign(STATE,fresh(),v);return true}
  }catch(_){}
  return false;
}
export function saveGame(){
  try{localStorage.setItem(KEY,JSON.stringify(STATE))}catch(_){}
}
export function newGame(){
  try{localStorage.removeItem(KEY)}catch(_){}
  const f=fresh();for(const k in STATE)delete STATE[k];Object.assign(STATE,f);
}
