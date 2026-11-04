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
    clear:(x0,y0,x1,y1)=>fill(x0,y0,x1,y1,'.'),
    water:(x0,y0,x1,y1)=>fill(x0,y0,x1,y1,'~'),
    blockA:(x0,y0,x1,y1)=>fill(x0,y0,x1,y1,'A'),
    blockB:(x0,y0,x1,y1)=>fill(x0,y0,x1,y1,'B')
  };
}

export const ROOMS={
  /* ----- 고향 마을 (시작 지점) ----- */
  v1:{name:'고향 마을',theme:'meadow',cols:46,grid:[-1,0],exits:{right:'r1'},seed:7,
    build(p){p.ground(0,45,12);p.plat(17,20,6);p.plat(31,35,6);p.plat(24,26,9)},
    start:{tx:8},save:{tx:13},warp:{id:'w_v1',tx:41},
    npcs:[{id:'mother',tx:6,tex:'npc_mother',name:'엄마'},{id:'smith',tx:22,tex:'npc_smith',name:'대장장이'},
      {id:'kid',tx:28,tex:'npc_kid',name:'꼬마'},{id:'shop',tx:36,tex:'npc_shop',name:'잡화점 누나'}],
    chests:[{id:'ch_v1',tx:33,gold:40}],
    slimes:[],
    event:{id:'ev_home',delay:500,lines:[{n:'엄마',t:'드디어 떠나는구나... 할아버지 검은 잘 챙겼니?'},{n:'나',t:'응. 할아버지가 말한 전설의 검, 꼭 찾아서 돌아올게.'},{n:'엄마',t:'대장간 아저씨한테 들러 보렴. 골드만 있으면 검을 더 강하게 두드려 주신대.'},{n:'엄마',t:'그리고... 꼭 무사히 돌아와야 해.'}]},
    deco:{houses:[[2,6,'#c0503a'],[16,6,'#5a6a8a'],[30,7,'#3a8a5a']],anvil:[21],well:[26],trees:[11,44],fence:[[38,40]],sign:[43]}},

  r1:{name:'시작의 들판',theme:'meadow',cols:36,grid:[0,0],exits:{left:'v1',right:'r2'},seed:11,
    build(p){p.ground(0,35,12);p.ground(14,19,11);p.plat(8,11,9);p.plat(22,25,8);p.plat(28,31,5);p.ground(33,34,11)},
    chests:[{id:'ch_r1',tx:29,ty:4,gold:30}],
    start:{tx:5},save:{tx:4},warp:{id:'w_r1',tx:2},
    npc:{id:'elder',tx:13,tex:'npc_elder',name:'촌장 할아버지'},
    slimes:[{tx:17,ty:9},{tx:28,ty:10}],
    deco:{sign:[7],fence:[[24,27]],trees:[31]}},

  r2:{name:'바람 언덕',theme:'meadow',cols:56,grid:[1,0],exits:{left:'r1',right:'r3',down:{to:'c1',tx:47}},seed:23,
    build(p){p.ground(0,55,12);p.ground(10,14,11);p.ground(15,20,10);p.ground(21,24,11);
      p.plat(26,29,9);p.plat(31,34,7);p.ground(36,42,10);p.block(36,3,39,3);
      p.clear(47,12,47,13);p.ladder(47,12,13);p.plat(43,45,8);p.plat(49,52,5)},
    crystal:{id:'c_r2',tx:37.5,ty:2},
    chests:[{id:'ch_r2',tx:50,ty:4,gold:35}],
    mushrooms:[{tx:30,ty:11}],
    slimes:[{tx:12,ty:9},{tx:39,ty:8},{tx:52,ty:10}],
    mobs:[{t:'snail',tx:22,ty:9},{t:'bat',tx:45,ty:4}],
    deco:{trees:[6,54],rocks:[33],fence:[[52,54]]}},

  r3:{name:'작은 숲길',theme:'meadow',cols:48,grid:[2,0],exits:{left:'r2',right:'r4',down:{to:'c2',tx:40}},seed:37,
    build(p){p.ground(0,47,12);p.ground(16,22,10);p.plat(24,28,8);p.block(30,9,34,11);
      p.clear(40,12,40,13);p.ladder(40,12,13);p.plat(6,9,9);p.plat(10,13,6);p.clear(35,12,37,12);p.spikes(35,37,12);p.plat(35,37,9)},
    chest:{id:'ch_r3',tx:32,item:'iron_armor'},
    chests:[{id:'ch_r3b',tx:11,ty:5,gold:40}],
    slimes:[{tx:19,ty:8},{tx:26,ty:6},{tx:45,ty:10}],
    mobs:[{t:'snail',tx:26,ty:10},{t:'bat',tx:12,ty:3}],
    deco:{trees:[4,13,44],rocks:[23]}},

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
    chests:[{id:'ch_t1b',tx:10,ty:1,gold:50}],
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
    chests:[{id:'ch_c1b',tx:38,ty:11,gold:80}],
    slimes:[{tx:9,ty:10},{tx:30,ty:3}],
    mobs:[{t:'bat',tx:20,ty:6}],
    deco:{}},

  c2:{name:'땅속 개울',theme:'cave',cols:44,grid:[2,1],exits:{left:'c1',right:'c3',up:{to:'r3',tx:40}},seed:83,
    build(p){p.block(0,0,43,1);p.block(43,0,43,8);p.ground(0,43,12);p.clear(40,0,40,1);p.ladder(40,0,11);
      p.clear(10,12,26,12);p.spikes(10,26,12);p.plat(30,33,8);p.plat(35,37,5)},
    chests:[{id:'ch_c2',tx:36,ty:4,gold:45}],
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
    chests:[{id:'ch_k1',tx:18,ty:5,gold:60}],
    event:{id:'ev_castle',delay:500,lines:[{n:'유령 기사',t:'...거기 누구냐. 살아 있는 자가 이 성에 발을 들이다니.'},{n:'나',t:'전설의 검을 찾고 있어요. 할아버지가 남긴 이야기를 따라왔어요.'},{n:'유령 기사',t:'...그렇다면 내 이야기를 들어라. 가까이 와서 ↑ 키로 말을 걸거라.'}]},
    slimes:[],
    mobs:[{t:'snail',tx:24,ty:10},{t:'bat',tx:28,ty:4}],
    deco:{}},
  k2:{name:'폭포 회랑',theme:'castle',cols:44,grid:[6,0],exits:{left:'k1',right:'k4',up:{to:'k3',tx:24}},seed:97,
    build(p){p.block(0,0,43,0);p.ground(0,43,12);p.block(43,0,43,8);
      p.block(0,8,13,8);p.block(16,8,29,8);p.block(33,8,41,8);p.ladder(14,8,11);p.ladder(31,4,11);
      p.block(4,4,12,4);p.block(18,4,23,4);p.block(25,4,29,4);p.block(34,4,40,4);
      p.clear(24,0,24,0);p.ladder(24,0,4)},
    chest:{id:'ch_k2',tx:37,item:'red_ring'},
    chests:[{id:'ch_k2b',tx:6,ty:3,gold:70}],
    turrets:[{tx:42,ty:2,dir:'l',rate:3}],
    slimes:[{tx:8,ty:7}],
    mobs:[{t:'bat',tx:10,ty:6},{t:'bat',tx:36,ty:2},{t:'snail',tx:22,ty:11},{t:'snail',tx:20,ty:7}],
    deco:{}},
  k3:{name:'높은 탑',theme:'castle',cols:26,grid:[6,-1],exits:{down:{to:'k2',tx:12},up:{to:'k7',tx:23}},seed:101,
    build(p){p.block(0,0,25,0);p.block(0,0,0,12);p.block(25,0,25,12);p.ground(0,25,13);p.clear(12,13,12,13);p.ladder(12,10,13);
      p.block(2,10,6,10);p.block(8,7,10,7);p.block(15,7,17,7);p.block(2,4,6,4);p.block(9,2,15,2);
      // 오른쪽 좁은 굴뚝: 벽 붙기로만 오를 수 있음 (위로 탑 꼭대기)
      p.block(22,1,22,8);p.clear(23,0,24,0);p.block(18,10,24,10);p.block(18,4,20,4)},
    chest:{id:'ch_k3',tx:12,item:'wind_ring'},
    fallers:[{tx:11,ty:5,w:2}],
    slimes:[],
    mobs:[{t:'bat',tx:5,ty:7},{t:'bat',tx:16,ty:2}],
    deco:{}},
  k7:{name:'탑 꼭대기',theme:'castle',cols:26,grid:[6,-2],exits:{down:{to:'k3',tx:23}},seed:107,
    build(p){p.block(0,0,0,12);p.block(25,0,25,12);p.ground(0,25,13);p.clear(23,13,24,13);p.block(22,9,22,12);
      p.block(9,9,14,9);p.block(3,6,6,6);p.block(16,5,19,5)},
    crystal:{id:'c_k7',tx:11.5,ty:7},
    chest:{id:'ch_k7',tx:4,item:'blue_boots'},
    chests:[{id:'ch_k7b',tx:17,ty:4,item:'key_blue'}],
    slimes:[],
    mobs:[{t:'bat',tx:8,ty:3},{t:'bat',tx:19,ty:2}],
    deco:{}},

  /* ----- 땅속 깊은 곳 (땅속 개울 오른쪽) ----- */
  c3:{name:'수정 동굴',theme:'cave',cols:46,grid:[3,1],exits:{left:'c2',right:'c4',down:{to:'c5',tx:11}},seed:113,
    build(p){p.block(0,0,45,1);p.ground(0,45,12);p.block(0,2,0,8);p.block(45,2,45,8);
      p.clear(14,12,19,12);p.spikes(14,19,12);p.plat(15,18,9);
      p.ground(22,27,10);p.plat(28,31,7);p.plat(33,36,4);
      p.clear(37,12,41,12);p.spikes(37,41,12);p.clear(11,12,11,13);p.ladder(11,13,13)},
    save:{tx:4},warp:{id:'w_c3',tx:8},
    chests:[{id:'ch_c3',tx:29,ty:6,item:'key_red'}],
    doors:[{id:'d_c3',tx:11,ty:12,w:1,h:1,color:'blue'}],
    crystal:{id:'c_c3',tx:34.5,ty:2},
    fallers:[{tx:38,ty:10,w:2}],
    slimes:[{tx:31,ty:10}],
    mobs:[{t:'bat',tx:20,ty:5},{t:'snail',tx:24,ty:8},{t:'bat',tx:40,ty:5}],
    deco:{}},
  c4:{name:'박쥐 군주의 둥지',theme:'cave',cols:30,grid:[4,1],exits:{left:'c3'},seed:127,
    build(p){p.block(0,0,29,1);p.ground(0,29,12);p.block(0,2,0,8);p.block(29,2,29,11);
      p.plat(4,7,8);p.plat(22,25,8);p.plat(12,17,5)},
    boss:{id:'batlord',tx:15,ty:3,drop:'bat_cape',title:'BAT LORD',intro:'땅속 깊은 곳의 박쥐 군주가 날개를 펼쳤다!'},
    slimes:[],
    deco:{}},

  /* ----- 고성 깊은 곳 (폭포 회랑 오른쪽) ----- */
  k4:{name:'기사단 무기고',theme:'castle',cols:40,grid:[7,0],exits:{left:'k2',right:'k5'},seed:131,
    build(p){p.block(0,0,39,0);p.ground(0,39,12);p.block(0,1,0,8);p.block(39,1,39,8);
      p.block(8,9,13,9);p.block(26,9,31,9);p.block(14,5,26,5);p.ladder(19,5,11);
      // 무기고 금고: 빨간 블록이 막고 있음. 위층 스위치를 치면 열리고, 대신 파란 블록이 사다리 위를 막음
      p.block(26,1,26,4);p.blockA(21,1,21,4);p.blockB(18,4,20,4)},
    save:{tx:4},warp:{id:'w_k4',tx:2},
    chest:{id:'ch_k4',tx:15,item:'blue_helm'},
    chests:[{id:'ch_k4b',tx:24,ty:4,item:'flame_sword'}],
    switches:[{tx:17,ty:4}],
    slimes:[],
    mobs:[{t:'haunt',tx:29,ty:10},{t:'haunt',tx:16,ty:3},{t:'bat',tx:34,ty:4}],
    deco:{}},
  k5:{name:'어둠의 회랑',theme:'castle',cols:50,grid:[8,0],exits:{left:'k4',right:'k6'},seed:137,
    build(p){p.block(0,0,49,0);p.ground(0,49,12);p.block(0,1,0,8);p.block(49,1,49,8);
      p.clear(10,12,16,12);p.spikes(10,16,12);p.block(20,9,24,9);
      p.clear(28,12,36,12);p.spikes(28,36,12);p.block(37,9,39,9);p.block(40,6,46,6)},
    movers:[{tx:10,ty:9,w:2,axis:'x',range:4,speed:40}],
    fallers:[{tx:29,ty:9,w:2},{tx:33,ty:8,w:2}],
    chest:{id:'ch_k5',tx:44,item:'blue_armor'},
    doors:[{id:'d_k5',tx:48,ty:9,h:3,color:'red'}],
    turrets:[{tx:47,ty:2,dir:'l',rate:2.6}],
    slimes:[],
    mobs:[{t:'haunt',tx:19,ty:10},{t:'haunt',tx:22,ty:7},{t:'haunt',tx:42,ty:4},{t:'bat',tx:32,ty:4}],
    deco:{}},
  k6:{name:'왕좌의 방',theme:'castle',cols:30,grid:[9,0],exits:{left:'k5'},seed:139,
    build(p){p.block(0,0,29,0);p.ground(0,29,12);p.block(0,1,0,8);p.block(29,1,29,11);
      p.block(4,8,7,8);p.block(22,8,25,8)},
    boss:{id:'rust',tx:20,ty:9,drop:'blue_sword',title:'RUST WARDEN',intro:'왕좌를 지키던 녹슨 수문장이 깨어났다!',
      after:[{n:'유령 기사',t:'...해냈구나. 수문장의 저주가 풀리고 성에 빛이 돌아왔다.'},{n:'유령 기사',t:'전설의 검은 이 성보다 더 깊은 곳, 얼어붙은 땅 아래에 봉인되어 있다고 전해진다.'},{n:'나',t:'얼어붙은 땅... 수정 동굴의 푸른 문 너머일지도 몰라.'}]},
    slimes:[],
    deco:{}},

  /* ----- 지하 호수와 얼음 땅 (수정 동굴의 푸른 문 아래) ----- */
  c5:{name:'지하 호수',theme:'cave',cols:40,grid:[3,2],exits:{up:{to:'c3',tx:11},right:'i1'},seed:149,
    build(p){p.block(0,0,39,1);p.clear(11,0,11,1);p.ladder(11,0,4);p.block(6,5,15,5);
      p.water(0,6,39,12);p.ground(0,39,13);p.block(0,2,0,12);
      p.block(19,6,20,10);p.block(26,10,29,12);p.block(33,5,39,5);p.block(30,9,31,9)},
    chests:[{id:'ch_c5',tx:23,ty:12,gold:120},{id:'ch_c5b',tx:3,ty:12,gold:90}],
    crystal:{id:'c_c5',tx:27.5,ty:8},
    slimes:[],
    mobs:[{t:'fish',tx:9,ty:9},{t:'fish',tx:24,ty:7},{t:'fish',tx:34,ty:10}],
    deco:{}},
  i1:{name:'얼음 동굴',theme:'ice',cols:46,grid:[4,2],exits:{left:'c5',right:'i2'},seed:151,
    build(p){p.block(0,0,45,1);p.ground(0,45,12);
      p.clear(12,12,18,12);p.spikes(12,18,12);p.block(13,9,14,9);p.block(17,7,18,7);
      p.ground(21,24,10);p.block(28,8,30,8);p.block(32,10,33,11);p.block(36,7,41,7);p.block(42,4,45,4)},
    save:{tx:3},warp:{id:'w_i1',tx:6},
    chest:{id:'ch_i1',tx:38,item:'frost_boots'},
    chests:[{id:'ch_i1b',tx:44,ty:3,gold:110}],
    icicles:[{tx:9,ty:2},{tx:16,ty:2},{tx:26,ty:2},{tx:34,ty:2}],
    slimes:[{tx:22,ty:8},{tx:30,ty:6}],
    mobs:[{t:'bat',tx:20,ty:4},{t:'bat',tx:40,ty:4}],
    deco:{},
    event:{id:'ev_ice',delay:600,lines:[{n:'나',t:'바닥이 꽁꽁 얼어 있어... 발이 미끄러져서 멈추기가 힘들어.'},{n:'나',t:'빙판에서도 버틸 수 있는 장화가 있으면 좋을 텐데.'}]}},
  i2:{name:'서리 신전',theme:'ice',cols:42,grid:[5,2],exits:{left:'i1',right:'i3'},seed:157,
    build(p){p.block(0,0,41,1);p.ground(0,41,12);
      p.block(20,2,20,8);p.blockA(20,9,20,11);
      p.block(4,9,7,9);p.block(10,6,13,6);p.blockB(24,9,25,9);p.blockB(27,7,28,7);p.blockB(30,5,31,5);p.block(33,4,38,4);
      p.clear(26,12,31,12);p.spikes(26,31,12)},
    switches:[{tx:12,ty:5},{tx:34,ty:3}],
    chests:[{id:'ch_i2',tx:36,ty:3,gold:160},{id:'ch_i2b',tx:5,ty:8,gold:60}],
    turrets:[{tx:41,ty:10,dir:'l',rate:2.4}],
    icicles:[{tx:16,ty:2},{tx:23,ty:2}],
    slimes:[{tx:8,ty:10}],
    mobs:[{t:'snail',tx:34,ty:10},{t:'bat',tx:30,ty:3}],
    deco:{}},
  i3:{name:'얼어붙은 왕좌',theme:'ice',cols:30,grid:[6,2],exits:{left:'i2'},seed:163,
    build(p){p.block(0,0,29,1);p.ground(0,29,12);p.block(0,2,0,8);p.block(29,2,29,11);p.block(5,8,8,8);p.block(21,8,24,8)},
    boss:{id:'turtle',tx:18,ty:9,drop:'frost_blade',title:'FROST TURTLE',intro:'얼음 속에 잠들어 있던 서리 거북이 깨어났다!',
      after:[{n:'나',t:'이 냉기... 아직 더 깊은 곳이 있는 것 같아.'},{n:'나',t:'전설의 검이 가까워지고 있어. 조금만 더 가 보자.'}]},
    slimes:[],
    deco:{}}
};

/* 방의 상자 목록 (chest 하나 또는 chests 여러 개) */
export const roomChests=R=>[...(R.chests||[]),...(R.chest?[R.chest]:[])];

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
