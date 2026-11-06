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
    look:{base:{f:'#8a96b0'},cuff:'#d8dfee'}},
  /* 청기사 세트: 고성 깊은 곳 (투구·갑옷·장화는 상자, 검은 녹슨 수문장) */
  blue_sword:{slot:'weapon',name:'청기사의 검',desc:'푸른 기사단장의 장검. 치명타가 잘 나고, 검기가 커져 적을 꿰뚫는다',atk:12,set:'blue',fx:'holy',wave:0x8ab8ff,
    sword:{l:'#d8e4f4',L:'#ffffff',m:'#3a6ad8',j:'#22305a'},slashA:['#ffffff','#cfe0ff','#5a8aff'],slashC:['#ffffff','#bcd4ff','#3a6ad8'],big:24},
  blue_helm:{slot:'helm',name:'청기사 투구',desc:'푸른 깃털이 달린 기사단 투구',def:3,set:'blue',
    look:{helm:'great',crest:'#3a6ad8',pal:{a:'#d4dcea',A:'#8490ac',i:'#ffffff',m:'#eef2fa',M:'#9aa6c0',v:'#10162e'}}},
  blue_armor:{slot:'armor',name:'청기사 갑옷',desc:'푸른 휘장과 십자 방패가 딸린 판금 갑옷',def:5,hp:20,set:'blue',
    look:{armor:'heavy',shield:true,pal:{a:'#d4dcea',A:'#8490ac',i:'#ffffff',M:'#9aa6c0',G:'#9aa6c0',n:'#3a6ad8',N:'#22408a',p:'#8490ac'}}},
  blue_boots:{slot:'boots',name:'청기사 장화',desc:'푸른 테를 두른 강철 장화',def:2,set:'blue',effects:{speed:5},
    look:{base:{f:'#9aa6c0'},cuff:'#3a6ad8'}},
  flame_sword:{slot:'weapon',name:'화염검',desc:'붉게 달아오른 검. 베인 적이 불타며 계속 피해를 입는다',atk:9,fx:'fire',wave:0xff7a2a,
    sword:{l:'#ffb04a',L:'#fff0a0',m:'#c0302a',j:'#4a1a10'},slashA:['#fff0a0','#ffb04a','#e8502a'],slashC:['#ffffff','#ffd060','#e0402a'],big:21},
  frost_blade:{slot:'weapon',name:'서리검',desc:'얼음 거북의 등껍질로 만든 검. 베인 적이 얼어붙어 느려진다',atk:15,fx:'ice',wave:0x9ff0ff,
    sword:{l:'#bfe8ff',L:'#ffffff',m:'#3a8ad8',j:'#1a3a6a'},slashA:['#ffffff','#cff4ff','#6fc8ff'],slashC:['#ffffff','#bfeeff','#4aa8f0'],big:23},
  frost_boots:{slot:'boots',name:'서리 장화',desc:'바닥에 징이 박힌 장화. 빙판에서 미끄러지지 않는다',def:2,effects:{noSlip:true},
    look:{base:{f:'#6fb0e0'},cuff:'#ffffff'}},
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
    look:{helm:'crown',pal:{a:'#f0c850',A:'#a07a20',i:'#fff4c0',m:'#ffe890',M:'#c09a3a',v:'#2a1808'}}},
  horn_helm:{slot:'helm',name:'뿔 투구',desc:'기사 훈련장 교관의 투구. 두 뿔이 위압감을 준다',atk:2,def:3,set:'dark',
    look:{helm:'horned',pal:{a:'#5a5a6e',A:'#34344a',i:'#8a8aa0',m:'#6a6a80',M:'#44445a',v:'#ff4a3a',O:'#efe4c8',o:'#a8946a'}}},
  dark_armor:{slot:'armor',name:'흑철 갑옷',desc:'가시 어깨받이가 달린 검은 갑옷과 붉은 망토',def:5,hp:15,set:'dark',
    look:{armor:'spike',cape:true,capePal:{c:'#8a2a2a',C:'#5a1616'},pal:{a:'#5a5a6e',A:'#34344a',i:'#8a8aa0',M:'#44445a',G:'#44445a',n:'#8a2a2a',N:'#5a1616',p:'#34344a'}}},
  /* 사막·용암 */
  scimitar:{slot:'weapon',name:'사막의 곡도',desc:'전갈왕의 독침으로 담금질한 곡도. 베인 적이 독에 걸린다',atk:20,fx:'poison',wave:0xb06aff,
    sword:{l:'#e8d8a0',L:'#fffbe0',m:'#7a3aa0',j:'#3a1a10'},slashA:['#ffffff','#e0b0ff','#9a4ad8'],slashC:['#ffffff','#d8a0ff','#7a2ac0'],big:23},
  magma_blade:{slot:'weapon',name:'용암검',desc:'화염 골렘의 심장으로 만든 검. 화상이 훨씬 오래간다',atk:26,fx:'fire',wave:0xff4a1a,burnBoost:true,
    sword:{l:'#ff6a1a',L:'#ffd060',m:'#2a1418',j:'#1a0a08'},slashA:['#fff0a0','#ff8a2a','#c0301a'],slashC:['#ffffff','#ffb040','#c0201a'],big:24},
  sand_boots:{slot:'boots',name:'모래 장화',desc:'바닥이 넓은 장화. 모래 늪에 빠지지 않고 위를 걸을 수 있다',def:3,effects:{noSand:true},
    look:{base:{f:'#c89a60'},cuff:'#f0d090'}},
  mirage_ring:{slot:'acc',name:'신기루 반지',desc:'피라미드 꼭대기에 잠들어 있던 반지',atk:4,effects:{speed:10},gem:['#ffb04a','#c06a1a']},
  ember_armor:{slot:'armor',name:'불꽃 갑옷',desc:'용암에서 건진 흑요석 갑옷. 용암에 데어도 피해가 절반',def:7,hp:30,effects:{fireRes:true},
    look:{armor:'spike',pal:{a:'#3a2a2e',A:'#24181c',i:'#ff8a2a',M:'#2a1c20',G:'#2a1c20',n:'#ff6a1a',N:'#c0301a',p:'#24181c'}}},
  clover_charm:{slot:'acc',name:'네잎클로버 부적',desc:'풍차 언덕에서 찾은 행운의 부적',atk:2,hp:15,gem:['#6fe05a','#2f8a3a']},
  echo_ring:{slot:'acc',name:'메아리 반지',desc:'종유석 굴 깊은 곳에서 울리던 반지',atk:3,def:2,gem:['#c0a0ff','#6a4ab0']},
  scarab_ring:{slot:'acc',name:'풍뎅이 반지',desc:'사막의 감옥에 갇혀 있던 왕의 반지',atk:5,def:3,gem:['#4ad8c0','#1a7a6a']},
  phoenix_ring:{slot:'acc',name:'불사조 반지',desc:'불의 시련을 이겨낸 자의 반지',hp:40,def:2,gem:['#ff8a2a','#c0301a']},
  /* 흑월 세트 (고성 끝 ~ 얼음): 은빛 초승달, 검은 판금, 보라 망토. 흑월검은 벤 만큼 HP를 흡수 */
  moon_sword:{slot:'weapon',name:'흑월검',desc:'달 없는 밤에 벼린 검은 검. 벤 피해의 일부를 HP로 빨아들인다',atk:18,set:'moon',fx:'moon',wave:0xb8a8ff,
    sword:{l:'#3a3450',L:'#d8d0ff',m:'#8a7ad8',j:'#1a1428'},slashA:['#ffffff','#d8d0ff','#7a5ad8'],slashC:['#ffffff','#c8b8ff','#5a3ab0'],big:24},
  moon_helm:{slot:'helm',name:'흑월 투구',desc:'이마에 은빛 초승달이 솟은 검은 대투구',def:4,hp:10,set:'moon',
    look:{helm:'moon',pal:{a:'#4a4660',A:'#2a2638',i:'#8a84a8',m:'#5a5674',M:'#34304a',v:'#b8a8ff',Y:'#e8e4ff',y:'#a89ad8'}}},
  moon_armor:{slot:'armor',name:'흑월 갑옷',desc:'초승달 어깨받이와 밤하늘빛 망토가 달린 검은 판금 갑옷',def:7,hp:25,set:'moon',
    look:{armor:'moon',cape:true,capePal:{c:'#3a2a6a',C:'#22164a'},pal:{a:'#4a4660',A:'#2a2638',i:'#8a84a8',M:'#34304a',G:'#34304a',n:'#7a5ad8',N:'#4a3290',p:'#2a2638',Y:'#e8e4ff',y:'#a89ad8'}}},
  moon_boots:{slot:'boots',name:'흑월 장화',desc:'소리 없이 걷는 검은 강철 장화',def:3,set:'moon',effects:{speed:5},
    look:{base:{f:'#3a3650'},cuff:'#a89ad8'}},
  /* 적월 세트 (사막): 붉은 달, 진홍 판금, 금 테두리. 적월검은 출혈과 높은 치명타 */
  blood_sword:{slot:'weapon',name:'적월검',desc:'붉은 달빛을 머금은 검. 치명타가 잘 나고 베인 적이 피를 흘린다',atk:24,set:'blood',fx:'blood',wave:0xff3a4a,
    sword:{l:'#c0202a',L:'#ffb0b0',m:'#f0c040',j:'#2a0a10'},slashA:['#ffffff','#ffb0b0','#e0202a'],slashC:['#ffffff','#ff8a8a','#b0101a'],big:25},
  blood_helm:{slot:'helm',name:'적월 투구',desc:'붉은 초승달과 금 테가 둘린 진홍 대투구',def:5,hp:15,set:'blood',
    look:{helm:'bloodmoon',pal:{a:'#a02030',A:'#601018',i:'#ff8a8a',m:'#c03040',M:'#701820',v:'#ffd34a',Y:'#ffd34a',y:'#c08a1c',O:'#4a1a22',o:'#2a0a10'}}},
  blood_armor:{slot:'armor',name:'적월 갑옷',desc:'금 테를 두른 진홍 판금과 검붉은 망토',def:9,hp:35,set:'blood',
    look:{armor:'moon',cape:true,capePal:{c:'#5a0a14',C:'#30040a'},pal:{a:'#a02030',A:'#601018',i:'#ff8a8a',M:'#701820',G:'#701820',n:'#f0c040',N:'#a07a1a',p:'#601018',Y:'#ffd34a',y:'#c08a1c'}}},
  blood_boots:{slot:'boots',name:'적월 장화',desc:'금 징이 박힌 진홍 장화',def:4,set:'blood',effects:{speed:5},
    look:{base:{f:'#801828'},cuff:'#f0c040'}},
  /* 용기사 세트 (용암): 용 날개 투구, 비늘 갑옷, 용의 발톱 장화. 용기사의 검은 화상 + 3단 베기에 화염 폭발 */
  dragon_sword:{slot:'weapon',name:'용기사의 검',desc:'용의 송곳니로 만든 대검. 불태우고, 3단 베기에 화염이 터진다',atk:30,set:'dragon',fx:'dragon',wave:0xffa02a,
    sword:{l:'#f0e0b0',L:'#ffffff',m:'#c0301a',j:'#3a1408',O:'#fff4d8'},slashA:['#ffffff','#ffe090','#ff6a1a'],slashC:['#ffffff','#ffd060','#e0401a'],big:27},
  dragon_helm:{slot:'helm',name:'용기사 투구',desc:'양옆으로 용의 날개가 펼쳐진 금빛 투구',def:7,hp:25,set:'dragon',
    look:{helm:'dragon',pal:{a:'#d8a83a',A:'#8a5a1a',i:'#fff0a0',m:'#f0c860',M:'#a0701a',v:'#ff4a1a',W:'#c0301a',w:'#ff7a3a',O:'#fff4d8'}}},
  dragon_armor:{slot:'armor',name:'용기사 갑옷',desc:'붉은 용 비늘을 엮은 금빛 갑옷과 날개 같은 망토',def:12,hp:50,set:'dragon',effects:{fireRes:true},
    look:{armor:'dragon',cape:true,capePal:{c:'#c0301a',C:'#7a1408'},pal:{a:'#d8a83a',A:'#8a5a1a',i:'#fff0a0',M:'#a0701a',G:'#a0701a',n:'#c0301a',N:'#7a1408',p:'#8a5a1a',O:'#fff4d8',W:'#c0301a'}}},
  dragon_boots:{slot:'boots',name:'용기사 장화',desc:'용의 발톱이 달린 금빛 장화',def:5,set:'dragon',effects:{speed:10},
    look:{base:{f:'#a0701a'},cuff:'#c0301a'}},
  /* 천공 기사 세트 (하늘 성채): 흰 판금, 금 테, 날개 투구. 천공검은 맞힌 적 근처로 번개가 옮겨붙음 */
  sky_sword:{slot:'weapon',name:'천공검',desc:'폭풍 그리폰의 깃털로 벼린 검. 베면 번개가 옆의 적에게 옮겨붙는다',atk:38,set:'sky',fx:'storm',wave:0xfff07a,
    sword:{l:'#f4f8ff',L:'#ffffff',m:'#f0c040',j:'#3a5a9a'},slashA:['#ffffff','#fff4b0','#f0c040'],slashC:['#ffffff','#fff07a','#5ab0ff'],big:27},
  sky_helm:{slot:'helm',name:'천공 기사 투구',desc:'양옆에 흰 날개가 돋은 금빛 테의 투구',def:8,hp:30,set:'sky',
    look:{helm:'winged',pal:{a:'#eef2fa',A:'#9aa6c0',i:'#ffffff',m:'#f0c850',M:'#a07a20',v:'#1a2a5a',W:'#ffffff',w:'#c8d8f0'}}},
  sky_armor:{slot:'armor',name:'천공 기사 갑옷',desc:'구름빛 판금에 금 테를 두르고 하늘색 망토를 걸친 갑옷',def:14,hp:60,set:'sky',
    look:{armor:'heavy',cape:true,capePal:{c:'#6ab0f0',C:'#3a7ac0'},pal:{a:'#eef2fa',A:'#9aa6c0',i:'#ffffff',M:'#c09a3a',G:'#c09a3a',n:'#f0c040',N:'#a07a1a',p:'#9aa6c0'}}},
  sky_boots:{slot:'boots',name:'천공 기사 장화',desc:'깃털처럼 가벼운 흰 장화',def:6,set:'sky',effects:{speed:10},
    look:{base:{f:'#dfe6f2'},cuff:'#f0c040'}},
  storm_ring:{slot:'acc',name:'폭풍의 반지',desc:'구름 정원에 떨어져 있던 반지. 바람이 몸을 밀어 준다',atk:6,effects:{speed:10},gem:['#fff07a','#5ab0ff']},
  /* 마검사 세트 (마왕성): 검보라 판금, 뿔 왕관, 보라 망토. 마검은 벤 피해를 빨아들이고 3단 베기에 어둠이 터짐 */
  abyss_sword:{slot:'weapon',name:'마검 아비스',desc:'마왕성 무덤에 잠든 검은 검. 벤 피해를 빨아들이고, 3단 베기에 어둠이 터진다',atk:44,set:'abyss',fx:'dark',wave:0x9a3aff,
    sword:{l:'#2a1a3a',L:'#c070ff',m:'#c0202a',j:'#14081c'},slashA:['#ffffff','#d8a0ff','#7a2ac0'],slashC:['#ffffff','#c070ff','#4a0a8a'],big:28},
  abyss_helm:{slot:'helm',name:'마검사 투구',desc:'뿔과 검은 왕관이 솟은 대투구',def:9,hp:35,set:'abyss',
    look:{helm:'demon',pal:{a:'#3a2a4a',A:'#1e1428',i:'#7a5a9a',m:'#4a3a5a',M:'#2a1e36',v:'#ff3a5a',O:'#e8dcc8',o:'#8a7a6a',Y:'#c070ff',y:'#6a2a9a',r:'#ff3a5a'}}},
  abyss_armor:{slot:'armor',name:'마검사 갑옷',desc:'가시 어깨받이의 검보라 판금과 핏빛 안감 망토',def:16,hp:70,set:'abyss',
    look:{armor:'spike',cape:true,capePal:{c:'#5a1a7a',C:'#30083a'},pal:{a:'#3a2a4a',A:'#1e1428',i:'#7a5a9a',M:'#2a1e36',G:'#2a1e36',n:'#9a3aff',N:'#5a1a9a',p:'#1e1428'}}},
  abyss_boots:{slot:'boots',name:'마검사 장화',desc:'보라 불꽃이 새겨진 검은 강철 장화',def:7,set:'abyss',effects:{speed:10},
    look:{base:{f:'#2a1e36'},cuff:'#9a3aff'}},
  abyss_ring:{slot:'acc',name:'심연의 반지',desc:'저주받은 예배당 제단의 반지. 검은 힘이 솟는다',atk:8,hp:30,gem:['#c070ff','#4a0a8a']},
  /* 중간보스 장신구: 숫자보다 고유 효과 */
  gale_plume:{slot:'acc',name:'바람 기사의 깃털',desc:'바람 기사의 투구에 꽂혀 있던 깃털. 바람과 돌풍에 밀리지 않는다',atk:4,effects:{windRes:true},gem:['#ffffff','#8fe3ff']},
  guard_crest:{slot:'acc',name:'근위대장의 문장',desc:'마왕 근위대장의 방패 문장. 바라보는 쪽에서 오는 적의 공격을 막아 준다',def:4,effects:{guard:true},gem:['#ff4a4a','#5a0a14']},
  relic_sword:{slot:'weapon',name:'전설의 검',desc:'할아버지가 찾아 헤매던 전설의 검. 빛의 검기가 모든 것을 꿰뚫는다',atk:34,fx:'holy',wave:0xfff0a0,
    sword:{l:'#fff4c0',L:'#ffffff',m:'#f0c040',j:'#6a3a8a'},slashA:['#ffffff','#fff0a0','#f0c040'],slashC:['#ffffff','#fff4c0','#ffd060'],big:26},
  // NPC·몬스터 전용 (획득 불가)
  mummy_look:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:'plate',pal:{a:'#e8dcc0',A:'#b8a888',i:'#ffffff',M:'#a89878',G:'#c8b898',n:'#c8b898',N:'#a89878',p:'#b8a888'}}},
  mummy_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'full',pal:{a:'#e8dcc0',A:'#b8a888',i:'#ffffff',m:'#d8c8a8',M:'#a89878',v:'#ff4a3a'}}},
  ghost_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'full',crest:'#ffd34a',pal:{a:'#d8e4f0',A:'#8a9ab8',i:'#ffffff',m:'#eef4fa',M:'#a8b8d0',v:'#3a8aff'}}},
  ghost_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:'heavy',cape:true,capePal:{c:'#3a4a8a',C:'#22305a'},pal:{a:'#d8e4f0',A:'#8a9ab8',i:'#ffffff',M:'#a8b8d0',G:'#a8b8d0',n:'#6ff0ff',N:'#3a9ab0',p:'#8a9ab8'}}},
  haunt_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'horned',pal:{a:'#6a6880',A:'#44425a',i:'#8a88a0',m:'#7a7890',M:'#54526a',v:'#c070ff'}}},
  haunt_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:'spike',pal:{a:'#6a6880',A:'#44425a',i:'#8a88a0',M:'#54526a',G:'#54526a',n:'#5a2a7a',N:'#3a1a50',p:'#44425a'}}},
  rust_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'great',crest:'#c0302a',pal:{a:'#a0785a',A:'#6a4a36',i:'#d0a880',m:'#b08a68',M:'#7a5a42',v:'#ff5a2a'}}},
  rust_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:'spike',cape:true,capePal:{c:'#8a2a2a',C:'#5a1616'},pal:{a:'#a0785a',A:'#6a4a36',i:'#d0a880',M:'#7a5a42',G:'#7a5a42',n:'#8a2a2a',N:'#5a1616',p:'#6a4a36'}}},
  rust_boots:{slot:'boots',hidden:true,name:'',desc:'',look:{base:{f:'#6a4a36'}}},
  shade_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'great',crest:'#5a1a7a',pal:{a:'#2a2236',A:'#16101e',i:'#4a3a5a',m:'#3a2e48',M:'#1e1628',v:'#ff3a5a'}}},
  shade_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:'spike',cape:true,capePal:{c:'#2a1036',C:'#16061e'},pal:{a:'#2a2236',A:'#16101e',i:'#4a3a5a',M:'#1e1628',G:'#1e1628',n:'#5a1a7a',N:'#30083a',p:'#16101e'}}},
  skull_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'full',pal:{a:'#e8e0cc',A:'#a89a80',i:'#ffffff',m:'#d8ccb4',M:'#8a7c64',v:'#c070ff'}}},
  skull_robe:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:'plate',cape:true,capePal:{c:'#4a2a6a',C:'#2a1640'},pal:{a:'#5a3a7a',A:'#3a2250',i:'#8a6aaa',M:'#3a2250',G:'#e8e0cc',n:'#c070ff',N:'#7a3ab0',p:'#3a2250'}}},
  demon_helm:{slot:'helm',hidden:true,name:'',desc:'',look:{helm:'demon',pal:{a:'#4a1a2a',A:'#2a0a16',i:'#8a3a4a',m:'#5a2a3a',M:'#300e1a',v:'#ffd34a',O:'#2a2236',o:'#14101c',Y:'#ffd34a',y:'#a07a1a',r:'#ff3a3a'}}},
  demon_armor:{slot:'armor',hidden:true,name:'',desc:'',look:{armor:'spike',cape:true,capePal:{c:'#8a0a1a',C:'#4a0410'},pal:{a:'#4a1a2a',A:'#2a0a16',i:'#8a3a4a',M:'#300e1a',G:'#300e1a',n:'#ffd34a',N:'#a07a1a',p:'#2a0a16'}}},
  demon_boots:{slot:'boots',hidden:true,name:'',desc:'',look:{base:{f:'#2a0a16'}}}
};

/* 소모품 (퀵슬롯 1~4) */
export const CONSUMABLES={
  potion:{name:'회복 물약',desc:'HP 40 회복',hp:40,col:['#ff5a6a','#a02a3a']},
  ether:{name:'마나 물약',desc:'MP 20 회복',mp:20,col:['#5a9aff','#2a4aa0']}
};

export const SETS={
  iron:{name:'철 기사 세트',need:3,bonus:{atk:3,def:2,hp:20},desc:'공격 +3, 방어 +2, 최대 HP +20'},
  dark:{name:'흑철 세트',need:2,bonus:{atk:5,def:2,hp:10},desc:'공격 +5, 방어 +2, 최대 HP +10'},
  blue:{name:'청기사 세트',need:4,bonus:{atk:6,def:4,hp:40},desc:'공격 +6, 방어 +4, 최대 HP +40'},
  moon:{name:'흑월 세트',need:4,bonus:{atk:9,def:5,hp:60},desc:'공격 +9, 방어 +5, 최대 HP +60'},
  blood:{name:'적월 세트',need:4,bonus:{atk:12,def:7,hp:80},desc:'공격 +12, 방어 +7, 최대 HP +80'},
  dragon:{name:'용기사 세트',need:4,bonus:{atk:16,def:10,hp:120},desc:'공격 +16, 방어 +10, 최대 HP +120'},
  sky:{name:'천공 기사 세트',need:4,bonus:{atk:20,def:12,hp:150},desc:'공격 +20, 방어 +12, 최대 HP +150'},
  abyss:{name:'마검사 세트',need:4,bonus:{atk:25,def:14,hp:180},desc:'공격 +25, 방어 +14, 최대 HP +180'}
};

/* 무기 강화 (대장간): +1 ~ +8, 한 단계마다 공격 +3 */
export const WLV_MAX=8;
const WLV_COST=[60,120,200,320,480,700,950,1300];
export const wlvCost=lv=>WLV_COST[Math.min(lv,WLV_COST.length-1)];
export const wlvAtk=lv=>lv*3;
let _st=null;export const bindState=s=>{_st=s};   // state.js가 연결 (서로 import 하면 순환이 생겨서)
export const weaponName=id=>{const lv=((_st&&_st.wlv)||{})[id]||0;return ITEMS[id].name+(lv?' +'+lv:'')};

/* 열쇠 (상자에서 'key_red' 처럼 나옴, 같은 색 문을 모두 엶) */
export const KEYS={red:{name:'붉은 열쇠',col:['#ff5a5a','#a01a2a']},blue:{name:'푸른 열쇠',col:['#6fb0ff','#2a4aa0']},yellow:{name:'노란 열쇠',col:['#ffd34a','#a07a1a']}};

export const START_EQUIP={weapon:'traveler_sword',helm:null,armor:null,boots:null,acc:null};
export const START_BAG=['traveler_sword'];

/* 장착 장비의 능력치 합계 + 세트 효과 */
export function equipBonus(equip){
  const b={atk:0,def:0,hp:0,airJumps:0,speed:0,noSand:false,fireRes:false,noSlip:false,wallCling:false,sets:[]},count={};
  for(const s of SLOTS){const it=ITEMS[equip[s]];if(!it)continue;
    b.atk+=it.atk||0;b.def+=it.def||0;b.hp+=it.hp||0;
    const e=it.effects||{};b.airJumps+=e.airJumps||0;b.speed+=e.speed||0;if(e.noSlip)b.noSlip=true;if(e.noSand)b.noSand=true;if(e.fireRes)b.fireRes=true;if(e.wallCling)b.wallCling=true;if(e.windRes)b.windRes=true;if(e.guard)b.guard=true;
    if(it.set)count[it.set]=(count[it.set]||0)+1}
  for(const k in count){const S=SETS[k];if(S&&count[k]>=S.need){b.sets.push(k);b.atk+=S.bonus.atk||0;b.def+=S.bonus.def||0;b.hp+=S.bonus.hp||0}}
  return b;
}
export function setProgress(equip,setId){return SLOTS.filter(s=>ITEMS[equip[s]]&&ITEMS[equip[s]].set===setId).length}
export function statLine(it){
  const p=[];if(it.atk)p.push('공격 +'+it.atk);if(it.def)p.push('방어 +'+it.def);if(it.hp)p.push('HP +'+it.hp);
  if(it.effects&&it.effects.airJumps)p.push('공중 점프 +'+it.effects.airJumps);
  if(it.effects&&it.effects.speed)p.push('이동 속도 +'+it.effects.speed+'%');
  if(it.effects&&it.effects.noSlip)p.push('빙판 미끄럼 방지');if(it.effects&&it.effects.noSand)p.push('모래 늪 위를 걸음');if(it.effects&&it.effects.fireRes)p.push('용암 피해 절반');if(it.effects&&it.effects.wallCling)p.push('벽 붙기');if(it.effects&&it.effects.windRes)p.push('바람에 안 밀림');if(it.effects&&it.effects.guard)p.push('앞쪽 피해 -30%');
  return p.join('  ')||'능력치 없음';
}
