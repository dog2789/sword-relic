/* 장비 아이템 데이터
   slot: weapon | helm | armor | boots | acc(장신구)
   능력치: atk, def, hp
   effects: 특수 능력 (airJumps 공중 점프(점프는 최대 2단), speed 이동 속도 %, wallCling 벽 붙기·벽 점프 / 예약: noSlip 빙판 안 미끄러짐)
   look: 캐릭터에 덧입혀지는 모양 (helm:'full'|'cap', crest 깃털색, armor, cape(+capePal), shield(+shieldPal), pal 그 부위 색, base 몸에 칠할 색(신발 f 등))
   set: 세트 이름 (SETS 참고) */

export const SLOTS=['weapon','helm','armor','boots','acc'];
export const SLOT_NAMES={weapon:'무기',helm:'투구',armor:'갑옷',boots:'신발',acc:'장신구'};

export const ITEMS={
  traveler_sword:{slot:'weapon',name:'여행자의 검',desc:'고향에서 들고 나온 낡은 검. 특별한 힘은 없지만 손에 익었다',atk:0,
    sword:{l:'#c0c6d0',L:'#ffffff',m:'#6a4a32',j:'#4a3020'},slashA:['#ffffff','#e0e4ec','#9aa2b2'],slashC:['#ffffff','#e8e4d8','#a8a090'],big:18},
  slime_blade:{slot:'weapon',name:'슬라임 블레이드',desc:'킹슬라임의 핵으로 벼린 검. 3단 베기에 슬라임 폭발이 터진다',atk:6,fx:'slime',wave:0x6fe05a,
    sword:{l:'#7fe07a',L:'#e8ffe0',m:'#2f8a3a',j:'#3a2a1a'},slashA:['#ffffff','#b8ffb0','#3fbf4a'],slashC:['#ffffff','#9fff8a','#2f9a3a'],big:21},
  iron_helm:{slot:'helm',name:'철 투구',desc:'얼굴을 다 덮는 단단한 철 투구',def:2,set:'iron',
    look:{helm:'full',pal:{a:'#b8c4dc',A:'#76829e',i:'#eef2fa',m:'#d8dfee',M:'#8a96b0'}}},
  iron_armor:{slot:'armor',name:'철 갑옷',desc:'붉은 휘장을 두른 견습 기사의 철 갑옷',def:3,hp:10,set:'iron',
    look:{armor:true,pal:{a:'#b8c4dc',A:'#76829e',i:'#eef2fa',M:'#8a96b0',G:'#8a96b0',n:'#b8323e',N:'#7a1a26',p:'#76829e'}}},
  iron_boots:{slot:'boots',name:'철 장화',desc:'무겁지만 든든한 장화',def:1,set:'iron',
    look:{base:{f:'#8a96b0'}}},
  /* 청기사 세트: 고성 깊은 곳 (투구·갑옷·장화는 상자, 검은 녹슨 수문장) */
  blue_sword:{slot:'weapon',name:'청기사의 검',desc:'푸른 기사단장의 장검. 치명타가 잘 나고, 검기가 커져 적을 꿰뚫는다',atk:12,set:'blue',fx:'holy',wave:0x8ab8ff,
    sword:{l:'#d8e4f4',L:'#ffffff',m:'#3a6ad8',j:'#22305a'},slashA:['#ffffff','#cfe0ff','#5a8aff'],slashC:['#ffffff','#bcd4ff','#3a6ad8'],big:24},
  blue_helm:{slot:'helm',name:'청기사 투구',desc:'푸른 깃털이 달린 기사단 투구',def:3,set:'blue',
    look:{helm:'full',crest:'#3a6ad8',pal:{a:'#d4dcea',A:'#8490ac',i:'#ffffff',m:'#eef2fa',M:'#9aa6c0',v:'#10162e'}}},
  blue_armor:{slot:'armor',name:'청기사 갑옷',desc:'푸른 휘장과 십자 방패가 딸린 판금 갑옷',def:5,hp:20,set:'blue',
    look:{armor:true,shield:true,pal:{a:'#d4dcea',A:'#8490ac',i:'#ffffff',M:'#9aa6c0',G:'#9aa6c0',n:'#3a6ad8',N:'#22408a',p:'#8490ac'}}},
  blue_boots:{slot:'boots',name:'청기사 장화',desc:'푸른 테를 두른 강철 장화',def:2,set:'blue',effects:{speed:5},
    look:{base:{f:'#9aa6c0'}}},
  flame_sword:{slot:'weapon',name:'화염검',desc:'붉게 달아오른 검. 베인 적이 불타며 계속 피해를 입는다',atk:9,fx:'fire',wave:0xff7a2a,
    sword:{l:'#ffb04a',L:'#fff0a0',m:'#c0302a',j:'#4a1a10'},slashA:['#fff0a0','#ffb04a','#e8502a'],slashC:['#ffffff','#ffd060','#e0402a'],big:21},
  frost_blade:{slot:'weapon',name:'서리검',desc:'얼음 거북의 등껍질로 만든 검. 베인 적이 얼어붙어 느려진다',atk:15,fx:'ice',wave:0x9ff0ff,
    sword:{l:'#bfe8ff',L:'#ffffff',m:'#3a8ad8',j:'#1a3a6a'},slashA:['#ffffff','#cff4ff','#6fc8ff'],slashC:['#ffffff','#bfeeff','#4aa8f0'],big:23},
  frost_boots:{slot:'boots',name:'서리 장화',desc:'바닥에 징이 박힌 장화. 빙판에서 미끄러지지 않는다',def:2,effects:{noSlip:true},
    look:{base:{f:'#6fb0e0'}}},
  red_ring:{slot:'acc',name:'레드 링',desc:'붉은 보석이 박힌 반지. 몸에 힘이 솟는다',atk:3,hp:10,gem:['#ff4a5a','#a01a2a']},
  wind_ring:{slot:'acc',name:'바람의 반지',desc:'바람을 두른 반지. 발걸음이 가벼워진다',effects:{speed:15},gem:['#9ff0ff','#3a9ad8']},
  bat_cape:{slot:'acc',name:'박쥐 망토',desc:'박쥐 군주의 날개로 만든 망토. 벽에 붙어 미끄러지다 X로 벽 점프',def:1,effects:{wallCling:true},
    look:{cape:true,capePal:{c:'#4a2a6a',C:'#2a1640'}}},
  acorn_charm:{slot:'acc',name:'도토리 부적',desc:'들꽃 언덕 꼭대기에서 찾은 부적. 마음이 든든해진다',hp:15,def:1,gem:['#c08a3a','#6a4a20']},
  feather:{slot:'acc',name:'새털 장식',desc:'큰 새의 둥지에서 찾은 깃털. 몸이 가벼워진다',def:1,effects:{speed:10},gem:['#ffffff','#9ab0c8']},
  glow_ring:{slot:'acc',name:'반딧불 반지',desc:'버섯 동굴의 빛을 담은 반지',hp:25,gem:['#c0ff6a','#5a9a2a']},
  knight_ring:{slot:'acc',name:'기사의 인장',desc:'종탑 꼭대기에 잠들어 있던 기사단의 인장 반지',atk:5,gem:['#ffd34a','#a07a1a']},
  snow_ring:{slot:'acc',name:'눈꽃 반지',desc:'눈꽃 신전 제단에 바쳐져 있던 반지',def:3,hp:15,gem:['#ffffff','#6fb0e0']},
  royal_helm:{slot:'helm',name:'왕관 투구',desc:'보물고 깊숙이 있던 금빛 투구. 왕실 근위대장의 것',def:4,hp:20,
    look:{helm:'full',crest:'#e83a4a',pal:{a:'#f0c850',A:'#a07a20',i:'#fff4c0',m:'#ffe890',M:'#c09a3a',v:'#2a1808'}}},
  // NPC·몬스터 전용 (획득 불가)
  ghost_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'full',crest:'#ffd34a',pal:{a:'#d8e4f0',A:'#8a9ab8',i:'#ffffff',m:'#eef4fa',M:'#a8b8d0',v:'#3a8aff'}}},
  ghost_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:true,cape:true,capePal:{c:'#3a4a8a',C:'#22305a'},pal:{a:'#d8e4f0',A:'#8a9ab8',i:'#ffffff',M:'#a8b8d0',G:'#a8b8d0',n:'#6ff0ff',N:'#3a9ab0',p:'#8a9ab8'}}},
  haunt_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'full',pal:{a:'#6a6880',A:'#44425a',i:'#8a88a0',m:'#7a7890',M:'#54526a',v:'#c070ff'}}},
  haunt_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:true,pal:{a:'#6a6880',A:'#44425a',i:'#8a88a0',M:'#54526a',G:'#54526a',n:'#5a2a7a',N:'#3a1a50',p:'#44425a'}}},
  rust_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'full',crest:'#c0302a',pal:{a:'#a0785a',A:'#6a4a36',i:'#d0a880',m:'#b08a68',M:'#7a5a42',v:'#ff5a2a'}}},
  rust_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:true,cape:true,capePal:{c:'#8a2a2a',C:'#5a1616'},pal:{a:'#a0785a',A:'#6a4a36',i:'#d0a880',M:'#7a5a42',G:'#7a5a42',n:'#8a2a2a',N:'#5a1616',p:'#6a4a36'}}},
  rust_boots:{slot:'boots',hidden:true,name:'',desc:'',look:{base:{f:'#6a4a36'}}}
};

/* 소모품 (퀵슬롯 1~4) */
export const CONSUMABLES={
  potion:{name:'회복 물약',desc:'HP 40 회복',hp:40,col:['#ff5a6a','#a02a3a']},
  ether:{name:'마나 물약',desc:'MP 20 회복',mp:20,col:['#5a9aff','#2a4aa0']}
};

export const SETS={
  iron:{name:'철 기사 세트',need:3,bonus:{atk:3,def:2,hp:20},desc:'공격 +3, 방어 +2, 최대 HP +20'},
  blue:{name:'청기사 세트',need:4,bonus:{atk:6,def:4,hp:40},desc:'공격 +6, 방어 +4, 최대 HP +40'}
};

/* 무기 강화 (대장간): +1 ~ +8, 한 단계마다 공격 +3 */
export const WLV_MAX=8;
const WLV_COST=[60,120,200,320,480,700,950,1300];
export const wlvCost=lv=>WLV_COST[Math.min(lv,WLV_COST.length-1)];
export const wlvAtk=lv=>lv*3;
let _st=null;export const bindState=s=>{_st=s};   // state.js가 연결 (서로 import 하면 순환이 생겨서)
export const weaponName=id=>{const lv=((_st&&_st.wlv)||{})[id]||0;return ITEMS[id].name+(lv?' +'+lv:'')};

/* 열쇠 (상자에서 'key_red' 처럼 나옴, 같은 색 문을 모두 엶) */
export const KEYS={red:{name:'붉은 열쇠',col:['#ff5a5a','#a01a2a']},blue:{name:'푸른 열쇠',col:['#6fb0ff','#2a4aa0']}};

export const START_EQUIP={weapon:'traveler_sword',helm:null,armor:null,boots:null,acc:null};
export const START_BAG=['traveler_sword'];

/* 장착 장비의 능력치 합계 + 세트 효과 */
export function equipBonus(equip){
  const b={atk:0,def:0,hp:0,airJumps:0,speed:0,noSlip:false,wallCling:false,sets:[]},count={};
  for(const s of SLOTS){const it=ITEMS[equip[s]];if(!it)continue;
    b.atk+=it.atk||0;b.def+=it.def||0;b.hp+=it.hp||0;
    const e=it.effects||{};b.airJumps+=e.airJumps||0;b.speed+=e.speed||0;if(e.noSlip)b.noSlip=true;if(e.wallCling)b.wallCling=true;
    if(it.set)count[it.set]=(count[it.set]||0)+1}
  for(const k in count){const S=SETS[k];if(S&&count[k]>=S.need){b.sets.push(k);b.atk+=S.bonus.atk||0;b.def+=S.bonus.def||0;b.hp+=S.bonus.hp||0}}
  return b;
}
export function setProgress(equip,setId){return SLOTS.filter(s=>ITEMS[equip[s]]&&ITEMS[equip[s]].set===setId).length}
export function statLine(it){
  const p=[];if(it.atk)p.push('공격 +'+it.atk);if(it.def)p.push('방어 +'+it.def);if(it.hp)p.push('HP +'+it.hp);
  if(it.effects&&it.effects.airJumps)p.push('공중 점프 +'+it.effects.airJumps);
  if(it.effects&&it.effects.speed)p.push('이동 속도 +'+it.effects.speed+'%');
  if(it.effects&&it.effects.noSlip)p.push('빙판 미끄럼 방지');if(it.effects&&it.effects.wallCling)p.push('벽 붙기');
  return p.join('  ')||'능력치 없음';
}
