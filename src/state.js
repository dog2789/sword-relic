/* 진행 상황 (방을 옮겨도 유지되는 값)
   세이브 석상에 닿으면 localStorage에 저장, 이어하기는 마지막 저장 지점에서 시작 */
import {START_EQUIP,START_BAG} from './data/items.js';
const KEY='sr_save2';

function fresh(){
  return{
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
    bossDown:false, // 킹슬라임
    bosses:{},      // 그 외 보스 {id:true}
    visited:{r1:true},
    save:null       // {room}
  };
}

export const STATE=fresh();

export const bossDone=id=>id==='king'?!!STATE.bossDown:!!(STATE.bosses&&STATE.bosses[id]);
export function setBossDone(id){if(id==='king')STATE.bossDown=true;else(STATE.bosses||(STATE.bosses={}))[id]=true}

export function hasSave(){
  try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return !!(v&&v.save)}catch(_){return false}
}
export function loadGame(){
  try{
    const v=JSON.parse(localStorage.getItem(KEY)||'null');
    if(v&&v.stats&&v.save){const f=fresh();for(const k in STATE)delete STATE[k];Object.assign(STATE,f,v);if(!STATE.bosses)STATE.bosses={};return true}
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
