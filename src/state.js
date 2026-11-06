/* 진행 상황 (방을 옮겨도 유지되는 값)
   세이브 석상에 닿으면 localStorage에 저장, 이어하기는 마지막 저장 지점에서 시작 */
import {START_EQUIP,START_BAG,bindState} from './data/items.js';
const KEY='sr_save2';

function fresh(){
  return{
    name:'',        // 모험가 이름 (비면 '모험가')
    room:'r1',
    stats:{lv:1,hp:60,maxHp:60,mp:30,maxMp:30,exp:0,next:20,atk:8},
    equip:{...START_EQUIP},
    bag:[...START_BAG],   // 가진 장비 id 목록
    abilities:{djump:false},
    opened:{},      // 연 상자
    collected:{},   // 주운 결정·아이템
    broken:{},      // 부순 벽
    warps:{},       // 등록한 워프 {워프id: 방id}
    items:{potion:2,ether:1},   // 소모품 개수
    quick:['potion','ether',null,null], // 퀵슬롯 1~4
    flags:{},       // 대화 등 이벤트 기록
    gold:0,         // 골드
    wlv:{},         // 무기 강화 단계 {무기id: 1~8}
    keys:{},        // 가진 열쇠 {red:true}
    time:0,         // 플레이 시간(초)
    bossDown:false, // 킹슬라임
    bosses:{},      // 그 외 보스 {id:true}
    visited:{v1:true},
    save:null       // {room}
  };
}

export const STATE=fresh();
bindState(STATE);

export const bossDone=id=>id==='king'?!!STATE.bossDown:!!(STATE.bosses&&STATE.bosses[id]);
export function setBossDone(id){if(id==='king')STATE.bossDown=true;else(STATE.bosses||(STATE.bosses={}))[id]=true}

export function hasSave(){
  try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return !!(v&&v.save)}catch(_){return false}
}
export function loadGame(){
  try{
    const v=JSON.parse(localStorage.getItem(KEY)||'null');
    if(v&&v.stats&&v.save){const f=fresh();for(const k in STATE)delete STATE[k];Object.assign(STATE,f,v);if(!STATE.bosses)STATE.bosses={};for(const k of ['wlv','keys'])if(!STATE[k])STATE[k]={};if(STATE.gold==null)STATE.gold=0;if(STATE.time==null)STATE.time=0;return true}
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
