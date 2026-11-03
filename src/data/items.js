/* 장비 아이템 데이터
   slot: weapon | helm | armor | boots | acc(장신구)
   능력치: atk, def, hp
   effects: 특수 능력 (지금 동작: airJumps(공중 점프, 단 점프는 최대 2단), speed(이동 속도 %) / 예약: noSlip(빙판 안 미끄러짐), wallCling(벽 붙기))
   look: 캐릭터에 덧입혀지는 모양 (helm: 'cap'|'full', armor: true, cape, shield, 색 슬롯 pal)
   set: 세트 이름 (SETS 참고) */

export const SLOTS=['weapon','helm','armor','boots','acc'];
export const SLOT_NAMES={weapon:'무기',helm:'투구',armor:'갑옷',boots:'신발',acc:'장신구'};

export const ITEMS={
  traveler_sword:{slot:'weapon',name:'여행자의 검',desc:'고향에서 들고 나온 낡은 검',atk:0,
    sword:{l:'#c0c6d0',L:'#ffffff',m:'#6a4a32',j:'#4a3020'},slashA:['#ffffff','#e0e4ec','#9aa2b2'],slashC:['#ffffff','#e8e4d8','#a8a090'],big:18},
  slime_blade:{slot:'weapon',name:'슬라임 블레이드',desc:'킹슬라임의 핵으로 벼린 탄력 있는 검',atk:6,
    sword:{l:'#7fe07a',L:'#e8ffe0',m:'#2f8a3a',j:'#3a2a1a'},slashA:['#ffffff','#b8ffb0','#3fbf4a'],slashC:['#ffffff','#9fff8a','#2f9a3a'],big:21},
  iron_helm:{slot:'helm',name:'철 투구',desc:'단단한 철 투구',def:2,set:'iron',
    look:{helm:'cap',pal:{a:'#b8c4dc',A:'#76829e',i:'#eef2fa',m:'#d8dfee'}}},
  iron_armor:{slot:'armor',name:'철 갑옷',desc:'기사단 견습생의 철 갑옷',def:3,hp:10,set:'iron',
    look:{armor:true,pal:{a:'#b8c4dc',M:'#8a96b0',g:'#d23a4a'}}},
  iron_boots:{slot:'boots',name:'철 장화',desc:'무겁지만 든든한 장화',def:1,set:'iron',
    look:{pal:{f:'#8a96b0'}}},
  red_ring:{slot:'acc',name:'레드 링',desc:'붉은 보석이 박힌 반지. 몸에 힘이 솟는다',atk:3,hp:10,gem:['#ff4a5a','#a01a2a']},
  wind_ring:{slot:'acc',name:'바람의 반지',desc:'바람을 두른 반지. 발걸음이 가벼워진다',effects:{speed:15},gem:['#9ff0ff','#3a9ad8']},
  // NPC 전용 (획득 불가)
  ghost_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'full',pal:{a:'#d8e4f0',A:'#8a9ab8',i:'#ffffff',m:'#ffd34a'}}},
  ghost_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:true,cape:true,pal:{a:'#d8e4f0',M:'#8a9ab8',g:'#6ff0ff',c:'#3a4a8a',C:'#22305a'}}}
};

/* 소모품 (퀵슬롯 1~4) */
export const CONSUMABLES={
  potion:{name:'회복 물약',desc:'HP 40 회복',hp:40,col:['#ff5a6a','#a02a3a']},
  ether:{name:'마나 물약',desc:'MP 20 회복',mp:20,col:['#5a9aff','#2a4aa0']}
};

export const SETS={
  iron:{name:'철 기사 세트',need:3,bonus:{atk:3,def:2,hp:20},desc:'공격 +3, 방어 +2, 최대 HP +20'}
};

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
