/* 방 데이터
   맵 글자: '#' 땅/바위  '-' 나무 발판  '=' 잎 발판 (둘 다 아래에서 뚫고 올라감)
            'H' 사다리  'V' 덩굴 (↑↓로 타기)  '^' 가시  '.' 빈칸
   좌표는 타일 단위 (T=16), 모든 방 높이 14줄.
   exits: left/right = 옆 방 id, up/down = {to: 방 id, tx: 이 방에서 출구가 있는 열}
   grid: 미니맵 위치, theme: meadow | cave | treetop | castle
   오브젝트: save(석상), warp(워프), npc(대화), chest(상자: item), crystal(생명의 결정), boss(+drop),
            slimes(슬라임), mobs(다른 몬스터 {t:'bat'|'snail', tx, ty}),
            movers(움직이는 발판), fallers(떨어지는 발판), mushrooms(점프 버섯), breaks(부서지는 벽) */
import {T,ROWS} from '../config.js';

function makeGrid(cols){const m=[];for(let y=0;y<ROWS;y++)m.push(Array(cols).fill('.'));return m}
function painter(m){
  const cols=m[0].length;
  const fill=(x0,y0,x1,y1,ch)=>{for(let y=Math.max(0,y0);y<=Math.min(ROWS-1,y1);y++)for(let x=Math.max(0,x0);x<=Math.min(cols-1,x1);x++)m[y][x]=ch};
  return{
    ground:(x0,x1,top)=>fill(x0,top,x1,ROWS-1,'#'),
    block:(x0,y0,x1,y1)=>fill(x0,y0,x1,y1,'#'),
    plat:(x0,x1,y)=>fill(x0,y,x1,y,'-'),
    leaf:(x0,x1,y)=>fill(x0,y,x1,y,'='),
    ladder:(x,y0,y1)=>fill(x,y0,x,y1,'H'),
    vine:(x,y0,y1)=>fill(x,y0,x,y1,'V'),
    spikes:(x0,x1,y)=>fill(x0,y,x1,y,'^'),
    clear:(x0,y0,x1,y1)=>fill(x0,y0,x1,y1,'.')
  };
}

export const ROOMS={
  r1:{name:'시작의 들판',theme:'meadow',cols:36,grid:[0,0],exits:{right:'r2'},seed:11,
    build(p){p.ground(0,35,12);p.block(0,0,1,11);p.ground(14,19,11);p.plat(8,11,9);p.plat(22,25,8)},
    start:{tx:5},save:{tx:4},warp:{id:'w_r1',tx:2},
    npc:{id:'elder',tx:13,tex:'npc_elder',name:'촌장 할아버지'},
    slimes:[{tx:17,ty:9},{tx:28,ty:10}],
    deco:{sign:[7],fence:[[24,27]],trees:[31]}},

  r2:{name:'바람 언덕',theme:'meadow',cols:56,grid:[1,0],exits:{left:'r1',right:'r3',down:{to:'c1',tx:47}},seed:23,
    build(p){p.ground(0,55,12);p.ground(10,14,11);p.ground(15,20,10);p.ground(21,24,11);
      p.plat(26,29,9);p.plat(31,34,7);p.ground(36,42,10);p.block(36,3,39,3);
      p.clear(47,12,47,13);p.ladder(47,12,13)},
    crystal:{id:'c_r2',tx:37.5,ty:2},
    slimes:[{tx:12,ty:9},{tx:39,ty:8},{tx:52,ty:10}],
    mobs:[{t:'snail',tx:22,ty:9}],
    deco:{trees:[6],fence:[[52,54]]}},

  r3:{name:'작은 숲길',theme:'meadow',cols:48,grid:[2,0],exits:{left:'r2',right:'r4',down:{to:'c2',tx:40}},seed:37,
    build(p){p.ground(0,47,12);p.ground(16,22,10);p.plat(24,28,8);p.block(30,9,34,11);
      p.clear(40,12,40,13);p.ladder(40,12,13)},
    chest:{id:'ch_r3',tx:32,item:'iron_armor'},
    slimes:[{tx:19,ty:8},{tx:26,ty:6},{tx:45,ty:10}],
    mobs:[{t:'snail',tx:9,ty:10}],
    deco:{trees:[4,13,37]}},

  r4:{name:'고목 쉼터',theme:'meadow',cols:30,grid:[3,0],exits:{left:'r3',right:'r5',up:{to:'t1',tx:14}},seed:41,
    build(p){p.ground(0,29,12);p.plat(5,8,9);p.plat(21,24,9);p.vine(14,0,11)},
    save:{tx:18},warp:{id:'w_r4',tx:10},
    npc:{id:'merchant',tx:26,tex:'npc_merchant',name:'떠돌이 상인'},
    slimes:[],
    deco:{bigtree:[14],fence:[[2,4],[25,27]]}},

  t1:{name:'고목 꼭대기',theme:'treetop',cols:30,grid:[3,-1],exits:{down:{to:'r4',tx:14}},seed:61,
    build(p){p.block(8,6,13,6);p.block(15,6,21,6);p.vine(14,6,13);
      p.leaf(22,26,3);p.leaf(2,6,3);p.leaf(1,5,9);p.leaf(23,28,9);p.leaf(9,12,2)},
    chest:{id:'ch_t1',tx:24,item:'iron_helm'},
    mushrooms:[{tx:10,ty:5}],
    slimes:[{tx:18,ty:4},{tx:3,ty:7}],
    deco:{}},

  c1:{name:'이끼 동굴',theme:'cave',cols:40,grid:[1,1],exits:{right:'c2',up:{to:'r2',tx:5}},seed:71,
    build(p){p.block(0,0,39,1);p.block(0,0,1,13);p.ground(0,39,12);p.clear(5,0,5,1);p.ladder(5,0,11);
      p.clear(13,12,23,12);p.spikes(13,23,12);p.block(28,5,33,5);p.block(35,2,39,8)},
    fallers:[{tx:15,ty:10,w:2},{tx:19,ty:9,w:2}],
    mushrooms:[{tx:26,ty:11}],
    breaks:[{id:'w_c1',tx:36,ty:9,h:3}],
    chest:{id:'ch_c1',tx:31,item:'iron_boots'},
    slimes:[{tx:9,ty:10},{tx:30,ty:3}],
    mobs:[{t:'bat',tx:20,ty:6}],
    deco:{}},

  c2:{name:'땅속 개울',theme:'cave',cols:44,grid:[2,1],exits:{left:'c1',up:{to:'r3',tx:40}},seed:83,
    build(p){p.block(0,0,43,1);p.block(42,0,43,13);p.ground(0,43,12);p.clear(40,0,40,1);p.ladder(40,0,11);
      p.clear(10,12,26,12);p.spikes(10,26,12)},
    movers:[{tx:11,ty:9,w:3,axis:'x',range:12,speed:42}],
    slimes:[{tx:35,ty:10}],
    mobs:[{t:'bat',tx:18,ty:5},{t:'snail',tx:30,ty:10}],
    deco:{}},

  r5:{name:'슬라임 둥지',theme:'meadow',cols:30,grid:[4,0],exits:{left:'r4',right:'k1'},seed:53,
    build(p){p.ground(0,29,12);p.block(27,4,29,11);p.plat(5,8,8);p.plat(21,24,8)},
    boss:{tx:20,ty:9,drop:'slime_blade'},
    slimes:[],
    deco:{trees:[3],rocks:[11,24]}},

  /* ----- 고성 (2단 점프로 슬라임 둥지 오른쪽 벽을 넘어서 진입) ----- */
  k1:{name:'고성 입구',theme:'castle',cols:36,grid:[5,0],exits:{left:'r5',right:'k2'},seed:91,
    build(p){p.block(0,0,35,0);p.ground(0,35,12);p.block(8,9,12,9);p.block(16,6,20,6);p.block(26,9,30,9)},
    save:{tx:6},warp:{id:'w_k1',tx:3},
    npc:{id:'knight',tx:14,tex:'npc_knight',name:'유령 기사',ghost:true},
    slimes:[],
    mobs:[{t:'snail',tx:24,ty:10},{t:'bat',tx:28,ty:4}],
    deco:{}},
  k2:{name:'폭포 회랑',theme:'castle',cols:44,grid:[6,0],exits:{left:'k1',up:{to:'k3',tx:24}},seed:97,
    build(p){p.block(0,0,43,0);p.ground(0,43,12);p.block(42,0,43,11);
      p.block(0,8,13,8);p.block(16,8,29,8);p.block(33,8,41,8);p.ladder(14,8,11);p.ladder(31,4,11);
      p.block(4,4,12,4);p.block(18,4,23,4);p.block(25,4,29,4);p.block(34,4,40,4);
      p.clear(24,0,24,0);p.ladder(24,0,4)},
    chest:{id:'ch_k2',tx:37,item:'red_ring'},
    slimes:[{tx:8,ty:7}],
    mobs:[{t:'bat',tx:10,ty:6},{t:'bat',tx:36,ty:2},{t:'snail',tx:22,ty:11},{t:'snail',tx:20,ty:7}],
    deco:{}},
  k3:{name:'높은 탑',theme:'castle',cols:26,grid:[6,-1],exits:{down:{to:'k2',tx:12}},seed:101,
    build(p){p.block(0,0,0,12);p.block(25,0,25,12);p.ground(0,25,13);p.clear(12,13,12,13);p.ladder(12,10,13);
      p.block(2,10,6,10);p.block(18,10,23,10);p.block(8,7,10,7);p.block(15,7,17,7);p.block(2,4,6,4);p.block(19,4,23,4);p.block(9,2,15,2)},
    chest:{id:'ch_k3',tx:12,item:'wind_ring'},
    fallers:[{tx:11,ty:5,w:2}],
    slimes:[],
    mobs:[{t:'bat',tx:5,ty:7},{t:'bat',tx:20,ty:2}],
    deco:{}}
};

export function buildRoomMap(id){
  const R=ROOMS[id],m=makeGrid(R.cols);R.build(painter(m));return m;
}
/* 해당 열 바닥(맨 아래에서부터 이어진 땅)의 윗면 y(px) */
export function floorTopY(m,tx){
  tx=Math.max(0,Math.min(m[0].length-1,Math.floor(tx)));
  for(let y=ROWS-1;y>=0;y--){if(m[y][tx]!=='#')return (y+1)*T}
  return 0;
}
/* 해당 열에서 위에서부터 처음 만나는 '서 있을 수 있는 면'의 윗면 y(px) — 석상·상자 놓을 때 */
export function surfaceY(m,tx){
  tx=Math.max(0,Math.min(m[0].length-1,Math.floor(tx)));
  let y=0;while(y<ROWS&&m[y][tx]==='#')y++;   // 천장(위쪽 바위)은 건너뜀
  for(;y<ROWS;y++){const c=m[y][tx];if(c==='#'||c==='-'||c==='=')return y*T}
  return ROWS*T;
}
