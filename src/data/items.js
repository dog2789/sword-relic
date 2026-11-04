/* 장비 아이템 데이터
   slot: weapon | helm | armor | boots | acc(장신구)
   능력치: atk, def, hp
   effects: 특수 능력 (airJumps 공중 점프(점프는 최대 2단), speed 이동 속도 %, wallCling 벽 붙기·벽 점프 / 예약: noSlip 빙판 안 미끄러짐)
   look: 캐릭터에 덧입혀지는 모양 (helm:'full'|'cap', crest 깃털색, armor, cape(+capePal), shield(+shieldPal), pal 그 부위 색, base 몸에 칠할 색(신발 f 등))
   set: 세트 이름 (SETS 참고) */

export const SLOTS=['weapon','helm','armor','boots','acc'];
export const SLOT_NAMES={weapon:'무기',helm:'투구',armor:'갑옷',boots:'신발',acc:'장신구'};

export const ITEMS={
  traveler_sword:{slot:'weapon',name:'여행자의 검',desc:'고향에서 들고 나온 낡은 검',atk:0,
    sword:{l:'#c0c6d0',L:'#ffffff',m:'#6a4a32',j:'#4a3020'},slashA:['#ffffff','#e0e4ec','#9aa2b2'],slashC:['#ffffff','#e8e4d8','#a8a090'],big:18},
  slime_blade:{slot:'weapon',name:'슬라임 블레이드',desc:'킹슬라임의 핵으로 벼린 탄력 있는 검',atk:6,
    sword:{l:'#7fe07a',L:'#e8ffe0',m:'#2f8a3a',j:'#3a2a1a'},slashA:['#ffffff','#b8ffb0','#3fbf4a'],slashC:['#ffffff','#9fff8a','#2f9a3a'],big:21},
  iron_helm:{slot:'helm',name:'철 투구',desc:'얼굴을 다 덮는 단단한 철 투구',def:2,set:'iron',
    look:{helm:'full',pal:{a:'#b8c4dc',A:'#76829e',i:'#eef2fa',m:'#d8dfee',M:'#8a96b0'}}},
  iron_armor:{slot:'armor',name:'철 갑옷',desc:'붉은 휘장을 두른 견습 기사의 철 갑옷',def:3,hp:10,set:'iron',
    look:{armor:true,pal:{a:'#b8c4dc',A:'#76829e',i:'#eef2fa',M:'#8a96b0',G:'#8a96b0',n:'#b8323e',N:'#7a1a26',p:'#76829e'}}},
  iron_boots:{slot:'boots',name:'철 장화',desc:'무겁지만 든든한 장화',def:1,set:'iron',
    look:{base:{f:'#8a96b0'}}},
  /* 청기사 세트: 고성 깊은 곳 (투구·갑옷·장화는 상자, 검은 녹슨 수문장) */
  blue_sword:{slot:'weapon',name:'청기사의 검',desc:'푸른 기사단장이 쓰던 장검',atk:12,set:'blue',
    sword:{l:'#d8e4f4',L:'#ffffff',m:'#3a6ad8',j:'#22305a'},slashA:['#ffffff','#cfe0ff','#5a8aff'],slashC:['#ffffff','#bcd4ff','#3a6ad8'],big:24},
  blue_helm:{slot:'helm',name:'청기사 투구',desc:'푸른 깃털이 달린 기사단 투구',def:3,set:'blue',
    look:{helm:'full',crest:'#3a6ad8',pal:{a:'#d4dcea',A:'#8490ac',i:'#ffffff',m:'#eef2fa',M:'#9aa6c0',v:'#10162e'}}},
  blue_armor:{slot:'armor',name:'청기사 갑옷',desc:'푸른 휘장과 십자 방패가 딸린 판금 갑옷',def:5,hp:20,set:'blue',
    look:{armor:true,shield:true,pal:{a:'#d4dcea',A:'#8490ac',i:'#ffffff',M:'#9aa6c0',G:'#9aa6c0',n:'#3a6ad8',N:'#22408a',p:'#8490ac'}}},
  blue_boots:{slot:'boots',name:'청기사 장화',desc:'푸른 테를 두른 강철 장화',def:2,set:'blue',effects:{speed:5},
    look:{base:{f:'#9aa6c0'}}},
  red_ring:{slot:'acc',name:'레드 링',desc:'붉은 보석이 박힌 반지. 몸에 힘이 솟는다',atk:3,hp:10,gem:['#ff4a5a','#a01a2a']},
  wind_ring:{slot:'acc',name:'바람의 반지',desc:'바람을 두른 반지. 발걸음이 가벼워진다',effects:{speed:15},gem:['#9ff0ff','#3a9ad8']},
  bat_cape:{slot:'acc',name:'박쥐 망토',desc:'박쥐 군주의 날개로 만든 망토. 벽에 붙어 미끄러지다 X로 벽 점프',def:1,effects:{wallCling:true},
    look:{cape:true,capePal:{c:'#4a2a6a',C:'#2a1640'}}},
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
