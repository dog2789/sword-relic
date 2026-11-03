/* 초원 지역 방 데이터
   맵 글자: '#' 땅/바위, '-' 나무 발판(아래에서 뚫고 올라감), '.' 빈칸
   좌표는 타일 단위 (T=16). 높이는 모든 방 14줄 고정.
   grid: 미니맵에서의 위치 */
import {T,ROWS} from '../config.js';

function makeGrid(cols){const m=[];for(let y=0;y<ROWS;y++)m.push(Array(cols).fill('.'));return m}
function painter(m){
  const cols=m[0].length;
  const fill=(x0,y0,x1,y1,ch)=>{for(let y=Math.max(0,y0);y<=Math.min(ROWS-1,y1);y++)for(let x=Math.max(0,x0);x<=Math.min(cols-1,x1);x++)m[y][x]=ch};
  return{
    ground:(x0,x1,top)=>fill(x0,top,x1,ROWS-1,'#'),
    block:(x0,y0,x1,y1)=>fill(x0,y0,x1,y1,'#'),
    plat:(x0,x1,y)=>fill(x0,y,x1,y,'-'),
    clear:(x0,y0,x1,y1)=>fill(x0,y0,x1,y1,'.')
  };
}

export const ROOMS={
  r1:{name:'시작의 들판',cols:36,grid:[0,0],exits:{right:'r2'},seed:11,
    build(p){p.ground(0,35,12);p.block(0,0,1,11);p.ground(14,19,11);p.plat(8,11,9);p.plat(22,25,8)},
    start:{tx:5},save:{tx:4},
    slimes:[{tx:17,ty:9},{tx:28,ty:10}],
    deco:{sign:[7],fence:[[24,27]],trees:[31]}},
  r2:{name:'바람 언덕',cols:56,grid:[1,0],exits:{left:'r1',right:'r3'},seed:23,
    build(p){p.ground(0,55,12);p.ground(10,14,11);p.ground(15,20,10);p.ground(21,24,11);
      p.plat(26,29,9);p.plat(31,34,7);p.ground(36,42,10);p.block(36,3,39,3)},
    crystal:{id:'c_r2',tx:37.5,ty:2},
    slimes:[{tx:12,ty:9},{tx:22,ty:9},{tx:39,ty:8},{tx:50,ty:10}],
    deco:{trees:[6,46],fence:[[52,54]]}},
  r3:{name:'작은 숲길',cols:48,grid:[2,0],exits:{left:'r2',right:'r4'},seed:37,
    build(p){p.ground(0,47,12);p.ground(16,22,10);p.plat(24,28,8);p.block(30,9,34,11)},
    chest:{id:'ch_r3',tx:32,item:'iron'},
    slimes:[{tx:10,ty:10},{tx:19,ty:8},{tx:26,ty:6},{tx:41,ty:10}],
    deco:{trees:[4,13,38,45]}},
  r4:{name:'고목 쉼터',cols:30,grid:[3,0],exits:{left:'r3',right:'r5'},seed:41,
    build(p){p.ground(0,29,12);p.plat(5,8,9);p.plat(21,24,9)},
    save:{tx:16},
    slimes:[],
    deco:{bigtree:[14],fence:[[2,4],[25,27]]}},
  r5:{name:'슬라임 둥지',cols:30,grid:[4,0],exits:{left:'r4'},seed:53,
    build(p){p.ground(0,29,12);p.block(28,0,29,11);p.plat(5,8,8);p.plat(18,21,8)},
    boss:{tx:20,ty:9},
    slimes:[],
    deco:{trees:[3],rocks:[11,24]}}
};

export function buildRoomMap(id){
  const R=ROOMS[id],m=makeGrid(R.cols);R.build(painter(m));return m;
}
/* 해당 열에서 가장 위에 있는 땅/발판의 윗면 y(px) */
export function groundTopY(m,tx){
  tx=Math.max(0,Math.min(m[0].length-1,Math.floor(tx)));
  for(let y=0;y<ROWS;y++)if(m[y][tx]==='#'||m[y][tx]==='-'){
    // 위쪽에 막힌 칸이 없는 첫 땅 (공중 섬 위가 아니라 실제 바닥을 찾기 위해 아래쪽 땅 우선)
    return y*T;
  }
  return (ROWS-1)*T;
}
export function floorTopY(m,tx){
  tx=Math.max(0,Math.min(m[0].length-1,Math.floor(tx)));
  for(let y=ROWS-1;y>=0;y--){if(m[y][tx]!=='#')return (y+1)*T}
  return 0;
}
