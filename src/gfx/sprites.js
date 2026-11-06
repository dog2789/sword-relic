import {cv,px,fromRows,arcTex} from './pixel.js';
import {SWORD,HERO_FRAMES,HERO_W,HERO_H,hexMix,drawHero} from './hero.js';
import {ITEMS,CONSUMABLES,KEYS} from '../data/items.js';
export const SL0=["....kkkkkk....","..kkggggggkk..",".kgwwgggggggk.",".kgwggggggggk.","kgggggkggkgggk","kgggggkggkgggk","kggggggggggggk","kGggggggggggGk",".kGGGGGGGGGGk.","..kkkkkkkkkk.."];
export const SL1=["..............","...kkkkkkkk...",".kkggggggggkk.","kgwwgggggggggk","kggggkggkggggk","kggggkggkggggk","kggggggggggggk","kGggggggggggGk","kGGGGGGGGGGGGk",".kkkkkkkkkkkk."];
export const CROWN=[".....y.y.y....",".....yyyyy....",".....yyryy...."];
export const SPAL={k:'#122015',g:'#5fcf5a',G:'#2f8a3a',w:'#e8ffe0'};
export const KPAL={k:'#10142e',g:'#5a8cff',G:'#2f4fb0',w:'#e0ecff',y:'#f0c040',r:'#ff4a6a'};

const ICONS={
  weapon:["..........kk",".........kLk","........kLlk",".......kLlk.","......kLlk..",".....kLlk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  helm:["............","...kkkkkk...","..kaiiaaak..",".kaiaaaaaak.",".kaaaaaaaak.",".kaaaaaaaak.",".kmmmmmmmmk.",".kk......kk.","............"],
  armor:["............",".kkk....kkk.","kMMMkkkkMMMk","kMMaaaaaaMMk",".kkaagaaakk.","..kaaaaaak..","..kaaaaaak..","..kAaaaaAk..","...kAAAAk...","....kkkk...."],
  boots:["............","..kkk...kkk.","..kfk...kfk.","..kfk...kfk.","..kffk..kffk",".kfffk.kfffk",".kkkkk.kkkkk"],
  acc:["....kkkk....","...kgwGGk...","...kGGGGk...","....kkkk....","...kyyyyk...","..kyk..kyk..","..kyk..kyk..","..kYk..kYk..","...kYYYYk...","....kkkk...."]
};
/* 모양별 아이콘 (투구: full/great/crown/horned, 갑옷: plate/heavy/spike) */
const HELM_ICON={
  full:["....kkkk....","..kkaaiikk..",".kaaaaaaiik.",".kaaaaaaaik.","kmmmmmmmmmmk","kvvvvavvvvAk","kaaaaaaaaaAk","kavavavavaAk",".kaaaaaaaAk.","..kkkkkkkk.."],
  great:["......oo....","....kkkkoo..","..kkaaiikk..",".kaaaamaaik.",".kaaaamaaak.",".kvvvvvvvvk.",".kaaaavaaak.",".kaaaavaaak.",".kMaaavaaMk.","..kkkkkkkk.."],
  crown:["..y..y..y...","..ykkykkyk..",".kyryyyyryk.","..kaaiiaak..",".kaaaaaaaik.",".kvvvvvvvvk.",".kaaaaaaaak.",".kavavavaak.","..kaaaaaak..","...kkkkkk..."],
  moon:["..k......k..","..kYk..kYk..","...kYYYYk...","..kkkkkkkk..",".kiaaamaaak.",".kvvvvvvvvk.",".kiaaavaaak.",".kiaaavaaak.",".kMaaavaaMk.","..kkkkkkkk.."],
  bloodmoon:["k..k....k..k","kOkYk..kYkOk",".kOkYYYYkOk.","..kkkkkkkk..",".kiaaamaaak.",".kvvvvvvvvk.",".kiaaavaaak.",".kiaaavaaak.",".kMaaavaaMk.","..kkkkkkkk.."],
  dragon:["k....kk....k","kWk..kk..kWk","kWwkkkkkkwWk",".kWaaaiiaWk.",".kaaaamaaak.",".kvvvvvvvvk.",".kaaaavaaak.",".kaaaavaaak.",".kMaaavaaMk.","..kkkkkkkk.."],
  winged:["k..........k","kWk......kWk","kWwkkkkkkwWk",".kWaaaiiaWk.",".kaaaamaaak.",".kvvvvvvvvk.",".kaaaavaaak.",".kaaaavaaak.",".kMaaavaaMk.","..kkkkkkkk.."],
  demon:["k.Y..Y..Y..k","kOkYYYYYYkOk","kOOkkkkkkOOk",".kOkaaiikOk.",".kaaaamaaak.",".kvvvvvvvvk.",".kaaaavaaak.",".kaaaavaaak.",".kMaaavaaMk.","..kkkkkkkk.."],
  horned:["k..........k","kOk......kOk","kOOkkkkkkOOk",".kOkaaiikOk.","..kaaaaaaik.","..kvvvvvvvk.","..kaaavaaak.","..kaaavaaak.","...kaaaaak..","....kkkkk..."]};
const ARMOR_ICON={
  heavy:[".kkkk..kkkk.","kiaaAkkiaaAk","kaAAAaaaAAAk",".kkkannnakk.","...kannnak..","...kannnak..","...kAnnnAk..","....kkkkk..."],
  moon:[".kkkk..kkkk.","kiaaAkkiaaAk","kYYYyaayYYYk",".kkkannnakk.","...kannnak..","...kannnak..","...kAnnnAk..","....kkkkk..."],
  dragon:["kOk......kOk",".kOk....kOk.","kaiaAkkaiaAk","kWaWannaWaWk",".kkkannnakk.","...kanWnak..","...kannnak..","...kAnnnAk..","....kkkkk..."],
  spike:["k..........k","kk........kk","kak......kak","kaakkkkkkaak","kaAAannaAAak",".kkaannaakk.","..kaannaak..","..kAannaAk..","...kkkkkk..."]};
const BOOT_ICON=["............","..kkk...kkk.","..kck...kck.","..kfk...kfk.","..kffk..kffk",".kfffk.kfffk",".kkkkk.kkkkk"];
/* 무기마다 다른 검 모양: 손에 든 모습(가로) / 아이콘(대각선) */
const SWORDS={
  slime_blade:["..k...kk.....","..mkkkLLkkk..","jjmLLLLLLLLk.","..mkkLLkkkLLk","..k..kk...kk."],
  flame_sword:["..k...k...k..","..mkkkLkkkLk.","jjmLLLLLLLLLk","..mkkLkkkLkk.","..k..k...k..."],
  frost_blade:["..k.....kk....","..mkkkkkLLkk..","jjmLLLLLLLLLLk","..mkkkkkLLkk..","..k.....kk...."],
  blue_sword:[".mm............","..mkkkkkkkkkk..","jjmLLLLLLLLLLLk","..mkkkkkkkkkk..",".mm............"]};
SWORDS.scimitar=["..k.........k.","..mkkkkkkkkLk.","jjmLLLLLLLLLk.","..mkkkkkkLLk..","..k.....kk...."];
SWORDS.magma_blade=["..k..k.k.k.k..","..mkkLkLkLkLk.","jjmLLLLLLLLLLk","..mkkkkkkkkkk.","..k..........."];
SWORDS.moon_sword=[".m.............","m.mkkkkkkkkkk..","jjmLLLLLLLLLLLk","m.mkkkkkkkkkk..",".m............."];
SWORDS.blood_sword=["..k.k.k.k.k....","..mkLkLkLkLkk..","jjmLLLLLLLLLLLk","..mkkkkkkkkkk..","..k............"];
SWORDS.dragon_sword=[".O..............","mmmkkkkkkkkkkk..","jjmLLLLLLLLLLLLk","jjmLLLLLLLLLLLLk","mmmkkkkkkkkkkk..",".O.............."];
SWORDS.relic_sword=["mm..............",".mmkkkkkkkkkkk..","jjmLLLLLLLLLLLLk",".mmkkkkkkkkkkk..","mm.............."];
SWORDS.sky_sword=["m.m.............","mmmkkkkkkkkkkkk.","jjmLLLLLLLLLLLLLk","mmmkkkkkkkkkkkk.","m.m............."];
SWORDS.abyss_sword=["..k.k...k.......","..mkLkkkLkkkkkk..","jjmLLLLLLLLLLLLLk","..mkLkkkLkkkkkk..","..k.k...k......."];
const SWORD_ICONS={
  moon_sword:["..........kk",".........kLk","........kLlk",".......kLlk.","......kLlk..",".....kLlk...","m...kLlk....",".m.mkLk.....","..mmmk......","..kjmm......",".kjk.m......","kkk........."],
  blood_sword:["........k.kk",".......kLkLk","......k.kLlk",".....kLkLlk.","....k.kLlk..",".....kLlk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  dragon_sword:["........kkkk",".......kLLLk","......kLLllk",".....kLLllk.","....kLLllk..","...kLLllk...","O.kLLllk....","OmmLLlk.....",".mmmkk......","..kjmmm.....",".kjk..mO....","kkk.....O..."],
  scimitar:["......kkkk..",".....kLLLk..","....kLllk...","....kLlk....","....kLlk....","....kLlk....","..k.kLk.....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  magma_blade:["......k.k.kk",".......kLkLk","....k.kLLLlk",".....kLLllk.","...k.kLlLk..",".....kLlk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  relic_sword:["..........kk",".........kLk","........kLlk",".......kLlk.","......kLlk..",".....kLlk...","..mmkLlk....",".mmmmLk.....","..mmmk......","..kjmmm.....",".kjk.mmm....","kkk........."],
  slime_blade:[".........kkk","........kLLk",".......kLLlk","......kLlLk.",".....kLlLk..","....kLLlk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  flame_sword:["........k.kk",".......kLkLk","........kLlk",".....k.kLlk.","....kLkLlk..",".....kLlk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  frost_blade:["........kkkk",".......kLLLk","......kLLllk",".....kLLllk.","....kLLllk..","....kLllk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  blue_sword:["..........kk",".........kLk","........kLlk",".......kLlk.","......kLlk..",".....kLlk...","...kkLlk....","..kmmLk.....","..mmmk......","..kjmmk.....",".kjk.mm.....","kkk........."]};
SWORD_ICONS.sky_sword=SWORD_ICONS.relic_sword;SWORD_ICONS.abyss_sword=SWORD_ICONS.dragon_sword;
const CAPE_ICON=["...kkkkkk...","..kyccccyk..","..kccccccK..",".kccccccccK.",".kcccCcccCK.","kccCccccCcCK","kcCcccCccCCK","kCcCcCcCcCCK","kkkkkkkkkkkk"];
const POTION=["..kkk...","..kck...",".kwwwk..","krrrrrk.","krwrrrk.","krrrrRk.",".kRRRk..","..kkk..."];
function iconPal(it){
  const p=Object.assign({k:'#141020'},it.sword||{},(it.look&&it.look.pal)||{});
  if(p.a&&!p.A)p.A=hexMix(p.a,'#000000',0.35);if(p.a&&!p.i)p.i='#ffffff';if(p.a&&!p.m)p.m=hexMix(p.a,'#ffffff',0.3);if(p.a&&!p.M)p.M=hexMix(p.a,'#000000',0.2);
  if(it.gem){p.g=it.gem[0];p.G=it.gem[1];p.y='#ffd34a';p.Y='#c08a1c';p.w='#ffffff'}
  if(it.look&&it.look.capePal){p.c=it.look.capePal.c;p.C=it.look.capePal.C;p.K=hexMix(p.C,'#000000',0.4);p.y='#ffd34a'}
  const lk=it.look||{};if(lk.base&&lk.base.f)p.f=lk.base.f;p.c=lk.cuff||p.c||hexMix(p.f||'#8a96b0','#ffffff',0.3);
  if(lk.crest)p.o=lk.crest;if(!p.O)p.O='#efe4c8';if(!p.o)p.o='#a8946a';if(!p.y)p.y='#f0c040';if(!p.r)p.r='#e83a4a';if(!p.v)p.v='#141020';if(!p.n)p.n='#b8323e';
  if(!p.g)p.g='#d23a4a';if(!p.f)p.f='#8a96b0';return p;
}
function paintPix(x,rows,pal,ox,oy){rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const c=pal[r[i]];if(c){x.fillStyle=c;x.fillRect(ox+i,oy+y,1,1)}}})}
export function buildTextures(sc){
  const add=(k,c)=>{if(!sc.textures.exists(k))sc.textures.addCanvas(k,c)};
  for(const id in CONSUMABLES){const c=CONSUMABLES[id];add('icon_'+id,fromRows(POTION,{k:'#1a1020',c:'#c8a070',w:'#ffffff',r:c.col[0],R:c.col[1]}))}
  for(const id in ITEMS){
    const it=ITEMS[id];if(it.hidden)continue;
    if(it.slot==='weapon'){
      add('sword_'+id,fromRows(SWORDS[id]||SWORD,{k:'#1a1222',...it.sword}));
      add('slashA_'+id,arcTex(16,6,-85,85,it.slashA));
      add('slashC_'+id,arcTex(it.big,it.big>22?10:8,-90,90,it.slashC));
      // 휘두를 때 겹치는 빛 (조금 크고 두꺼운 호)
      add('glowA_'+id,arcTex(19,9,-88,88,[it.slashA[1],it.slashA[2],it.slashA[2]]));add('glowC_'+id,arcTex(it.big+4,it.big>22?14:12,-92,92,[it.slashC[1],it.slashC[2],it.slashC[2]]));
    }
    const lk=it.look||{},rows=it.slot==='weapon'&&SWORD_ICONS[id]?SWORD_ICONS[id]:it.slot==='acc'&&lk.cape?CAPE_ICON:it.slot==='helm'&&HELM_ICON[lk.helm]?HELM_ICON[lk.helm]:it.slot==='armor'&&ARMOR_ICON[lk.armor]?ARMOR_ICON[lk.armor]:it.slot==='boots'?BOOT_ICON:ICONS[it.slot];
    add('icon_'+id,fromRows(rows,iconPal(it)));
  }
  for(const f in HERO_FRAMES)if(!sc.textures.exists('hero_'+f))sc.textures.createCanvas('hero_'+f,HERO_W,HERO_H);
  add('slime0',fromRows(SL0,SPAL));add('slime1',fromRows(SL1,SPAL));
  // 지역 슬라임은 색을 곱해 칠하면 초록빛이 남아서 따로 그림: 동굴은 어둡게, 얼음은 하늘색
  const SPAL_CAVE={k:'#05080a',g:'#36503f',G:'#1b2b22',w:'#8fb0a0'},SPAL_ICE={k:'#0e2a48',g:'#8fd8ff',G:'#3f8fd0',w:'#ffffff'};
  add('slime_cave0',fromRows(SL0,SPAL_CAVE));add('slime_cave1',fromRows(SL1,SPAL_CAVE));add('slime_ice0',fromRows(SL0,SPAL_ICE));add('slime_ice1',fromRows(SL1,SPAL_ICE));
  add('kslime0',fromRows([...CROWN,...SL0],KPAL));add('kslime1',fromRows([...CROWN,...SL1],KPAL));
  add('wave',arcTex(10,4,-70,70,['#ffffff','#ffe27a','#ff9a3a']));
  add('spark',fromRows(["...w...","...w...","..www..","wwwwwww","..www..","...w...","...w..."],{w:'#ffffff'}));
  add('heart',fromRows([".kk.kk.","krwkrrk","krrrrrk",".krrrk.","..krk..","...k..."],{k:'#3a0a18',r:'#ff4a6a',w:'#ffd0d8'}));
  // 세이브 석상 + 떠 있는 수정
  add('statue',fromRows(["....kkkkkk....","...kggggggk...","...kgGGGGgk...","....kggggk....","....kgGGgk....","....kgGGgk....",
    "....kgGGgk....","....kgGGgk....","...kggggggk...","..kggggggggk..","..kGGGGGGGGk..",".kkkkkkkkkkkk."],{k:'#2a2a3a',g:'#c4c8d4',G:'#8a8ea0'}));
  add('scrystal',fromRows(["..kk..",".kcCk.","kcwCCk","kcCCCk",".kCCk.","..kk.."],{k:'#10305a',c:'#8fe3ff',C:'#2f8ad8',w:'#ffffff'}));
  // 보물상자 (닫힘/열림, 높이 같게)
  const CH={k:'#2a1608',b:'#b0703a',B:'#7a4a22',y:'#f0c040',d:'#1a0e06'};
  add('chest0',fromRows(["..............","..kkkkkkkkkk..",".kbbbbbbbbbbk.","kbBBBBBBBBBBbk","kyyyyyyyyyyyyk","kbbbbbyybbbbbk",
    "kbbbbkyykbbbbk","kBBBBByyBBBBBk","kbbbbbbbbbbbbk","kyyyyyyyyyyyyk","kBBBBBBBBBBBBk","kkkkkkkkkkkkkk"],CH));
  add('chest1',fromRows(["..kkkkkkkkkk..",".kbbbbbbbbbbk.","kbBBBBBBBBBBbk","kyyyyyyyyyyyyk","kkkkkkkkkkkkkk","kddddddddddddk",
    "kddddddddddddk","kBBBBByyBBBBBk","kbbbbbbbbbbbbk","kyyyyyyyyyyyyk","kBBBBBBBBBBBBk","kkkkkkkkkkkkkk"],CH));
  // 아이템 아이콘: 철 투구 + 갑옷
  add('icon_iron',fromRows(["...kkkkkk...","..kaiiaaak..",".kaiaaaaaak.",".kaaaaaaaak.",".kmmmmmmmmk.","..kkkkkkkk..",
    "..kMaaaaMk..",".kMMaagaMMk.",".kMaaaaaaMk.","..kaaaaaak..","...kAAAAk...","....kkkk...."],
    {k:'#1a1a2a',a:'#b8c4dc',A:'#76829e',i:'#eef2fa',m:'#d8dfee',M:'#8a96b0',g:'#d23a4a'}));
  // 생명의 결정
  add('lcrystal',fromRows(["....k....","...kwk...","..kwrrk..",".kwrrrrk.","kwrrrrrRk","krrrrrRRk",".krrrRRk.","..krRRk..","...kRk...","....k...."],
    {k:'#3a0a1a',r:'#ff5a8a',R:'#c02a5a',w:'#ffd0e0'}));
  // 지형 기믹
  add('mush0',fromRows(["....kkkkkk....","..kkrrwrrrkk..",".krrwwrrrwrrk.","krrrrrrrrwwrrk","krwwrrrrrrrrrk","kkkkkkkkkkkkkk","....kssssk....","....kssssk....","...kssssssk...","...kkkkkkkk..."],{k:'#3a1018',r:'#e0404f',w:'#ffe8e8',s:'#f0e0c0'}));
  add('mush1',fromRows(["..............","..............","....kkkkkk....",".kkrrwrrrwrkk.","krrwwrrrrrwwrk","kkkkkkkkkkkkkk","....kssssk....","...kssssssk...","...kkkkkkkk..."],{k:'#3a1018',r:'#e0404f',w:'#ffe8e8',s:'#f0e0c0'}));
  {const[c,x]=cv(16,16);px(x,'#3a3448',0,0,16,16);px(x,'#5a5470',1,1,14,14);px(x,'#6c6684',1,1,14,1);
    [[3,2,5,7],[8,5,12,9],[4,10,9,14],[11,11,13,14]].forEach(([x0,y0,x1,y1])=>{for(let t=0;t<=1;t+=0.12){px(x,'#2a2436',Math.round(x0+(x1-x0)*t),Math.round(y0+(y1-y0)*t))}});
    px(x,'#7a7494',2,3,2,1);px(x,'#7a7494',10,2,2,1);add('crackrock',c)}
  {const[c,x]=cv(16,6);px(x,'#2a1a12',0,0,16,6);px(x,'#c08a50',1,0,14,1);px(x,'#9a6236',1,1,14,3);px(x,'#6a3e22',1,4,14,1);
    px(x,'#e8d0a0',3,2);px(x,'#e8d0a0',12,2);px(x,'#6a3e22',8,1,1,3);add('fallblock',c)}
  // 워프 받침대
  add('warp',fromRows(["...kkkkkkkkkk...","..kccccccccccK..",".kcCCCCCCCCCCcK.","kmmmmmmmmmmmmmmk","kMMMMMMMMMMMMMMk",".kkkkkkkkkkkkkk."],{k:'#1a1a2a',K:'#1a1a2a',c:'#8fe3ff',C:'#3a8ad8',m:'#a8aebb',M:'#6a6e7a'}));
  add('warp_off',fromRows(["...kkkkkkkkkk...","..kccccccccccK..",".kcCCCCCCCCCCcK.","kmmmmmmmmmmmmmmk","kMMMMMMMMMMMMMMk",".kkkkkkkkkkkkkk."],{k:'#1a1a2a',K:'#1a1a2a',c:'#6a6e7a',C:'#4a4e5a',m:'#a8aebb',M:'#6a6e7a'}));
  // 박쥐
  const BP={k:'#1a0a20',p:'#5a3a7a',w:'#ffe27a'};
  add('bat0',fromRows(["k............k","kk..........kk","kpk.k....k.kpk","kppkpkkkkpkppk",".kppppppppppk.","..kppwppwppk..","...kppppppk...","....kk..kk...."],BP));
  add('bat1',fromRows(["..............","....k....k....","...kpkkkkpk...","..kppppppppk..",".kpppwppwpppk.","kpkppppppppkpk","kk.kppppppk.kk","k...kk..kk...k"],BP));
  // 가시 달팽이 (오른쪽을 봄)
  const SN={k:'#2a1208',s:'#c86a3a',S:'#8a3a1a',x:'#f0e8d8',b:'#d8c08a',B:'#a88a5a',e:'#1a1010'};
  const snail=last=>[".....k.k.k......","....kxkxkxk.....","...kssssssk..k..","..ksSSSSSssk.kek","..ksSsssSssk.kbk","..ksSsSSsssk.kbk","..ksSssssSskkbbk","..kssSSSSsskbbbk",last,"kkkkkkkkkkkkkkk."];
  add('snail0',fromRows(snail(".kbbbbbbbbbbbbBk"),SN));add('snail1',fromRows(snail("kbbbbbbbbbbbbbBk"),SN));
  // NPC (주인공과 같은 방식으로 그림)
  const npc=(key,look,equip)=>{if(sc.textures.exists(key))return;const[c,x]=cv(HERO_W,HERO_H);drawHero(x,'idle0',look,equip);sc.textures.addCanvas(key,c);
    const[c2,x2]=cv(HERO_W,HERO_H);drawHero(x2,'idle1',look,equip);sc.textures.addCanvas(key+'_1',c2)};
  npc('npc_elder',{style:2,hair:3,skin:1,top:4,bottom:3,shoes:1},{});
  npc('npc_merchant',{style:1,hair:1,skin:2,top:3,bottom:1,shoes:1},{armor:null});
  npc('npc_mother',{style:3,hair:0,skin:0,top:2,bottom:4,shoes:1},{});
  npc('npc_smith',{style:1,hair:1,skin:2,top:6,bottom:1,shoes:0},{});
  npc('npc_shop',{style:4,hair:2,skin:0,top:5,bottom:2,shoes:1},{});
  npc('npc_kid',{style:1,hair:4,skin:1,top:1,bottom:1,shoes:2},{});
  npc('npc_knight',{style:0,hair:3,skin:0,top:5,bottom:3,shoes:3},{helm:'ghost_helm',armor:'ghost_armor'});
  // 갑옷 몬스터 (망령 갑옷, 녹슨 수문장): 주인공과 같은 그림 + 검. 34x20, 오른쪽을 봄
  const SW_UP=SWORD[0].split('').map((_,c)=>SWORD.map(r=>r[r.length-1-c]).join('')); // 날이 위로 선 검 (5x11)
  const knight=(id,look,equip,swPal)=>{
    const fr={idle0:'idle0',idle1:'idle1',run0:'run0',run1:'run1',wind:'idle0',atk:'atk0'};
    for(const k in fr){const key='kn_'+id+'_'+k;if(sc.textures.exists(key))continue;const[c,x]=cv(34,23);
      if(k==='wind'&&swPal)paintPix(x,SW_UP,swPal,6,4);
      drawHero(x,fr[k],look,equip,6,2);
      if(!swPal){}else if(k==='atk')paintPix(x,SWORD,swPal,23,15);
      else if(k!=='wind')paintPix(x,SW_UP,swPal,19,10+(k==='idle1'||k==='run1'?1:0));
      sc.textures.addCanvas(key,c)}};
  knight('haunt',{style:0,hair:1,skin:4,top:6,bottom:3,shoes:0},{helm:'haunt_helm',armor:'haunt_armor'},{k:'#141020',l:'#8a88a0',L:'#c8b0ff',m:'#5a2a7a',j:'#2a1a3a'});
  knight('mummy',{style:0,hair:3,skin:0,top:5,bottom:4,shoes:3},{helm:'mummy_helm',armor:'mummy_look'},null);
  knight('rust',{style:0,hair:1,skin:3,top:6,bottom:3,shoes:0},{helm:'rust_helm',armor:'rust_armor',boots:'rust_boots'},{k:'#1a0a08',l:'#b08a68',L:'#ffd0a0',m:'#8a2a2a',j:'#3a1a10'});
  // 박쥐 군주 (박쥐 + 왕관, 붉은 눈)
  const BLP={k:'#14040e',p:'#7a2a5a',w:'#ff4a3a',y:'#f0c040',r:'#ff4a6a'};
  const crown=["....y.y.y.....","....yyyyy.....","....yyryy....."].map(r=>'.'+r.slice(0,13));
  add('batlord0',fromRows([...crown,"k............k","kk..........kk","kpk.k....k.kpk","kppkpkkkkpkppk",".kppppppppppk.","..kppwppwppk..","...kppppppk...","....kk..kk...."],BLP));
  add('batlord1',fromRows(["",...crown.slice(1),"....k....k....","...kpkkkkpk...","..kppppppppk..",".kpppwppwpppk.","kpkppppppppkpk","kk.kppppppk.kk","k...kk..kk...k"],BLP));
  // 충격파 (녹슨 수문장 내려찍기)
  add('quake',fromRows(["....kk....","...krrk...","..krRRrk..",".krRyyRrk.","krRyyyyRrk","kkkkkkkkkk"],{k:'#3a1408',r:'#ff7a2a',R:'#ffb04a',y:'#fff0a0'}));
  // 골드 동전
  add('coin',fromRows([".kkkk.","kyyYYk","kyWyYk","kyyyYk","kYYYYk",".kkkk."],{k:'#5a3a08',y:'#ffd34a',Y:'#d89a1a',W:'#fff8c0'}));
  add('coinbig',fromRows(["..kkkk..",".kyyyYk.","kyWyyyYk","kyWyyyYk","kyyyyyYk","kYyyyYYk",".kYYYYk.","..kkkk.."],{k:'#5a3a08',y:'#ffd34a',Y:'#d89a1a',W:'#fff8c0'}));
  // 대화 말풍선 (…)
  add('bubble',fromRows(["..kkkkkkkk..",".kwwwwwwwwk.","kwwwwwwwwwwk","kwkwwkwwkwwk","kwwwwwwwwwwk",".kwwwwwwwwk.","..kkkwkkkk..","....kk......"],{k:'#1a1230',w:'#ffffff'}));
  // 열쇠 아이콘, 색깔 문
  for(const c in KEYS){const[a1,a2]=KEYS[c].col;
    add('icon_key_'+c,fromRows(["....kkkk....","...kaaaak...","...kak.kak..","...kaaaak...","....kakk....","....kak.....","....kaaak...","....kak.....","....kaak....","....kkkk...."],{k:'#1a1020',a:a1}));
    add('door_'+c,fromRows(["kkkkkkkkkkkkkkkk","kAaaaaaaaaaaaaAk","kAkkkkAkkAkkkkAk","kAkddkAkkAkddkAk","kAkddkAkkAkddkAk","kAkddkAkkAkddkAk","kAkddkAkkAkddkAk","kAkkkkAyyAkkkkAk","kAaaaaAyYAaaaaAk","kAkkkkAkkAkkkkAk","kAkddkAkkAkddkAk","kAkddkAkkAkddkAk","kAkddkAkkAkddkAk","kAkkkkAkkAkkkkAk","kAaaaaaaaaaaaaAk","kkkkkkkkkkkkkkkk"],{k:'#14101c',a:a1,A:a2,d:'#2a2236',y:'#ffd34a',Y:'#b08a1a'}))}
  // 포탑(불덩이 발사대)과 불덩이
  add('turret',fromRows(["..kkkkkkkkkk..",".kMMMMMMMMMMk.","kMmmmmmmmmmmMk","kMmkkkkkkkkmMk","kMmkrrRRrrkmMk","kMmkrRyyRrkmMk","kMmkrRyyRrkmMk","kMmkrrRRrrkmMk","kMmkkkkkkkkmMk","kMmmmmmmmmmmMk",".kMMMMMMMMMMk.","..kkkkkkkkkk.."],{k:'#14101c',M:'#5a5468',m:'#8a8498',r:'#a01a1a',R:'#ff4a2a',y:'#ffd060'}));
  add('fireball',fromRows(["..kkk..",".kRyRk.","kRyWyRk","kyWWWyk","kRyWyRk",".kRyRk.","..kkk.."],{k:'#6a1a08',R:'#ff6a2a',y:'#ffd060',W:'#ffffff'}));
  add('iceshard',fromRows(["...k...","..kWk..",".kWbBk.","kWbbbBk",".kbbBk.","..kBk..","...k..."],{k:'#1a3a6a',W:'#ffffff',b:'#9ff0ff',B:'#4aa8f0'}));
  // 스위치와 색깔 블록 (스위치를 치면 실선 ↔ 점선이 바뀜)
  add('switch0',fromRows(["....kkkk....","...kRRRRk...","...kRrrRk...","....kRRk....",".....kk.....","....kmmk....","..kkmmmmkk..",".kMMMMMMMMk.","kkkkkkkkkkkk"],{k:'#14101c',R:'#ff5a5a',r:'#ffb0b0',m:'#8a8498',M:'#5a5468'}));
  add('switch1',fromRows(["............","............","....kkkk....","...kBBBBk...","...kBbbBk...","....kmmk....","..kkmmmmkk..",".kMMMMMMMMk.","kkkkkkkkkkkk"],{k:'#14101c',B:'#5a9aff',b:'#b0d0ff',m:'#8a8498',M:'#5a5468'}));
  const blk=(a1,a2,on)=>{const[c,x]=cv(16,16);if(on){px(x,'#14101c',0,0,16,16);px(x,a1,1,1,14,14);px(x,a2,1,12,14,3);px(x,'#ffffff',2,2,12,1);px(x,'#14101c',5,5,6,6);px(x,a2,6,6,4,4)}
    else for(let i=0;i<16;i+=2){px(x,a1,i,0,1,1);px(x,a1,i,15,1,1);px(x,a1,0,i,1,1);px(x,a1,15,i,1,1)}return c};
  add('blkA1',blk('#ff5a5a','#a01a2a',true));add('blkA0',blk('#ff5a5a','#a01a2a',false));
  add('blkB1',blk('#5a9aff','#2a4aa0',true));add('blkB0',blk('#5a9aff','#2a4aa0',false));
  // 물고기 (물속 몬스터, 오른쪽을 봄)
  const FP={k:'#1a1a3a',b:'#ff8a5a',B:'#c04a2a',w:'#ffffff',f:'#ffc04a'};
  add('fish0',fromRows(["....kkkk......","..kkbbbbkk..kk",".kbbwkbbbBk.kfk","kbbbkkbbbbBkffk","kbbbbbbbbbBkfk.",".kBbbbbbBBk.kk.","..kkBBBBkk.....","....kkkk......"].map(r=>r.slice(0,15)),FP));
  add('fish1',fromRows(["....kkkk......","..kkbbbbkk....",".kbbwkbbbBkkk.","kbbbkkbbbbBkfk","kbbbbbbbbbBkfk",".kBbbbbbBBkkk.","..kkBBBBkk....","....kkkk......"],FP));
  // 서리 거북 (보스): 등껍질 + 머리. 오른쪽을 봄
  const TP={k:'#10203a',s:'#9fd8ff',S:'#5aa0e0',i:'#ffffff',g:'#7fc8a0',G:'#3a8a6a',e:'#ff4a5a',c:'#3a6aa0'};
  const shell=[".....kkkkkkkkk.......",
   "...kksSisSisSskk.....","..ksSiSScSSiSSSsk....",".ksSSccSSScSScSSSk...",".ksScSSiSSSSiSSScSk..","kssSSSSccSSSSSSSSSk..","kccccccccccccccccck..",
   ".kgGgkgGgk.kgGgkgGk.."];
  const head=["","","","","...............kkkk.","..............kgggGk",".............kgegggk",".............kgggGGk","..............kkkk.."];
  const turtle=fr=>{const[c,x]=cv(22,10);paintPix(x,shell.slice(0,7),TP,0,0);paintPix(x,head,TP,0,-1);paintPix(x,[fr?".kGgk..kGgk..kGgk....":"..kGgk..kGgk..kGgk..."],TP,0,8);px(x,'#10203a',0,9,0,0);return c};
  add('turtle0',turtle(0));add('turtle1',turtle(1));
  const[sc0,sx0]=cv(18,10);paintPix(sx0,shell.slice(0,7).map(r=>r.slice(0,19)),TP,0,2);add('turtle_spin',sc0);
  add('sonic',fromRows(["..kkkk..",".k....k.","k..pp..k","k.p..p.k","k.p..p.k","k..pp..k",".k....k.","..kkkk.."],{k:'#c070ff',p:'#ffffff'}));
  // 사막·용암 몬스터
  const SCP={k:'#2a1608',b:'#c87a3a',B:'#8a4a1a',y:'#ffd060',r:'#ff3a2a'};
  const scorp=fr=>["..........kkk..",".........kbbbk.","........kbk.kk.","........kbk....","..kk...kbbk....",".kbbkkkbbbbkkk.","kbbbbbbbbbbbbrk","kBbBbBbBbBbbbk.",fr?".k.k.k.k.k.kk..":"k.k.k.k.k.k.k.."];
  add('scorp0',fromRows(scorp(0),SCP));add('scorp1',fromRows(scorp(1),SCP));
  add('scorpk0',fromRows(scorp(0),{...SCP,b:'#e8b040',B:'#a0701a',r:'#ff2a2a'}));add('scorpk1',fromRows(scorp(1),{...SCP,b:'#e8b040',B:'#a0701a',r:'#ff2a2a'}));
  const SAL={k:'#2a0a08',r:'#e8502a',R:'#a02a1a',y:'#ffd060',w:'#ffffff'};
  const sal=fr=>["..........kkk...","........kkrrrk..",".kkkkkkkrrwkrk..","krrrrrrrrrrrrrk.","kRyRyRrrrrrRRk..",fr?".k.k....k.k....":"k.k......k.k...."];
  add('sala0',fromRows(sal(0),SAL));add('sala1',fromRows(sal(1),SAL));
  // 화염 골렘 (보스): 바위 몸 + 용암 틈
  const GP={k:'#14080a',a:'#4a3a3e',A:'#2e2226',i:'#6a5a5e',l:'#ff6a1a',y:'#ffd060',e:'#ffe080'};
  const gol=fr=>["....kkkkkk....","...kiaaaaak...","..kiaeaaeaAk..","..kaaaaaaaAk..","kkkaalllaaAkkk","kiakaaylaaAkak","kaaakaaaaAkaak","kaaakallaaAkak",".kk.kaaaaaAk.k","....kaAkkaAk..",fr?"...kaAk..kaAk.":"...kaAk..kaAk.",fr?"..kkkk....kkk.":"...kkk...kkkk."];
  add('golem0',fromRows(gol(0),GP));add('golem1',fromRows(gol(1),GP));
  add('sandball',fromRows([".kkk.","kyyYk","kyYYk",".kkk."],{k:'#7a4a1a',y:'#f0d090',Y:'#c89a60'}));
  add('magma',fromRows([".kkkk.","kryyrk","kyWyyk","kryyrk",".kkkk."],{k:'#3a1408',r:'#c0301a',y:'#ff8a2a',W:'#ffe080'}));
  {const[c,x]=cv(10,48);for(let y=0;y<48;y++){const t=y/48,w=Math.round(2+t*3);px(x,t<0.3?'#ffe080':t<0.6?'#ffb040':'#ff6a1a',5-w,y,w*2,1);if(y%5===0)px(x,'#ffffff',4,y,2,1)}add('geyser',c)}
  // 하늘 성채 몬스터: 하피, 번개 정령, 폭풍 그리폰(보스)
  const HP={k:'#2a0a24',f:'#c06aa0',F:'#e8a0d0',h:'#ffd34a',s:'#f0c8a0',e:'#a01a2a',t:'#8a3a7a',y:'#ffd060'};
  add('harpy0',fromRows(["kk....hh....kk","kFk..hssh..kFk","kffkkhsehkkffk",".kfffkttkfffk.","..kffkttkffk..","...kkkttkkk...","....kyk.kyk...","....k.k.k.k..."],HP));
  add('harpy1',fromRows(["......hh......",".....hssh.....","..kkkhsehkkk..",".kfffkttkfffk.","kffkkkttkkkffk","kFk..kttk..kFk","kk..kyk.kyk.kk","....k.k.k.k..."],HP));
  const WP={k:'#5a4a10',Y:'#ffe060',W:'#ffffff',e:'#3a2a6a',y:'#fff4a0'};
  add('wisp0',fromRows(["....y....","..kkkkk..",".kYYWYYk.","ykYWWWYky",".kYeWeYk.",".kYWWWYk.","..kYYYk..","...kkk...","....y...."],WP));
  add('wisp1',fromRows(["y.......y","..kkkkk..",".kYYWYYk.",".kYWWWYk.",".kYeWeYk.",".kYWWWYk.","..kYYYk..","...kkk...","y.......y"],WP));
  const GRP={k:'#1a1428',b:'#d8a050',B:'#a0702a',w:'#eef4ff',W:'#a8c0e0',h:'#ffffff',H:'#c8d0e0',y:'#ffd34a',e:'#c0101a'};
  add('griffin0',fromRows(["...kkk..............","..kwwWk.............","..kwwwWk......kkkk..","...kwwwWk....khhhhk.","....kwwwWk..khhehhyk","kk...kwwWWkkhhhhkyyk","kBk.kbbbbbbbbHhhk.k.",".kBkbbbbbbbbbbHk....","..kbbbbbbbbbbbbk....","...kBbbbBkkBbbBk....","...kyk..kyk.kyk.kyk.","...kk...kk..kk..kk.."],GRP));
  add('griffin1',fromRows(["....................","....................","..............kkkk..",".............khhhhk.","............khhehhyk","kk.........khhhhkyyk","kBk.kbbbbbbbbHhhk.k.",".kBkbwwwwwwbbbHk....","..kbkwwwwwwWkbbk....","...kBkwwwwWkkBBk....","....kkwwWk.kyk.kyk..",".......kk...kk..kk.."],GRP));
  add('bolt',fromRows(["..kk.",".kWk.","kWyk.",".kWWk","..kyk",".kWk.","kWk..",".k..."],{k:'#5a4a10',W:'#ffffff',y:'#ffe060'}));
  add('feather',fromRows(["...kk",".kwWk","kwwk.","kWk..","k...."],{k:'#3a4a6a',w:'#ffffff',W:'#a8c0e0'}));
  // 마왕성 몬스터: 눈알 박쥐, 그림자 기사, 해골 마법사, 마왕(보스)
  const EP={k:'#14040e',p:'#3a1a4a',w:'#f0e8f0',r:'#c0101a'};
  add('eyebat0',fromRows(["k............k","kk..........kk","kpk.kkkkkk.kpk","kppkwwwwwwkppk",".kppwwrrwwppk.","..kpwwrrwwpk..","...kpwwwwpk...","....kkkkkk...."],EP));
  add('eyebat1',fromRows(["..............","....kkkkkk....","...kwwwwwwk...","..kpwwrrwwpk..",".kppwwrrwwppk.","kpkpwwwwwwpkpk","kk.kppppppk.kk","k...kk..kk...k"],EP));
  // 새 일반 몬스터: 동굴 거미, 유령, 눈사람, 폭탄 바위
  const SPP={k:'#0e0814',p:'#6a4a8a',P:'#a888c8',r:'#ff3a4a'};
  add('spider0',fromRows(["..k......k..","...k.kk.k...","k...kppk...k",".k.kpPPpk.k.","..kpPrrPpk..",".k.kpPPpk.k.","k...kppk...k","...k....k...","..k......k.."],SPP));
  add('spider1',fromRows([".k........k.","..k..kk..k..",".k..kppk..k.","k..kpPPpk..k","..kpPrrPpk..","k..kpPPpk..k",".k..kppk..k.","..k......k..",".k........k."],SPP));
  const GHP={k:'#3a3a5a',w:'#eef0ff',W:'#b8c0e0',e:'#1a1a2a'};
  const ghost=fr=>["...kkkkkk...","..kwwwwwwk..",".kwwwwwwwwk.",".kweewweewk.",".kweewweewk.",".kwwwwwwwwk.",".kwwwkkwwwk.",".kwwwwwwwWk.",".kWwwwwwwWk.",".kWWwwwwWWk.",fr?".kWkWWkWWkk.":".kkWkkWkkWk.",fr?"..k..k..k...":".k..k..k..k."];
  add('ghost0',fromRows(ghost(0),GHP));add('ghost1',fromRows(ghost(1),GHP));
  const SNP={k:'#2a3a5a',w:'#ffffff',W:'#c8e0f0',e:'#1a1a2a',o:'#ff8a2a',R:'#e0303a',b:'#7a4a20'};
  const snow=fr=>["....kkkk....","...kwwwwk...","..kwewwewk..","..kwwwoook..","...kwwwwk...",fr?"b.kRRRRRRk..":"..kRRRRRRk.b",fr?".bkwwwwwwk..":".kwwwwwwwkb.","kwwwwkwwwwwk","kwwwwwwwwwwk","kwwwwkwwwwwk","kWwwwwwwwwWk",".kWWwwwwWWk.","..kkkkkkkk.."];
  add('snowman0',fromRows(snow(0),SNP));add('snowman1',fromRows(snow(1),SNP));
  add('snowball',fromRows([".kkk.","kwwWk","kwWWk",".kkk."],{k:'#4a6a9a',w:'#ffffff',W:'#c8e0f0'}));
  const BMP={k:'#14080a',a:'#4a3a3e',i:'#6a5a5e',l:'#ff6a1a',y:'#ffd060',Y:'#ff8a2a',e:'#ffe080'};
  const bomb=fr=>[fr?"......y.....":".......y....",fr?"......ky....":"......kY....",".....k......","...kkkkkk...","..kaaaaaak..",".kaiaaaaaak.",".kaaekaekak.",".kaaaaaaaak.",".kaalllllak.","..kaaaaaak..",fr?"..kk....kk..":"...kk..kk..."];
  add('bomber0',fromRows(bomb(0),BMP));add('bomber1',fromRows(bomb(1),BMP));
  // 초원 뿔 토끼, 고목 꿀벌, 사막 모래 지렁이
  const HRP={k:'#2a1a14',w:'#fff8f0',W:'#d8c8b8',p:'#ff9ab0',e:'#1a1010',h:'#ffd34a'};
  const hare=fr=>[".....kk.kk..",".....kpkkpk.",".....kpkkpk.","....kwwwwwkh","...kwwwwewkh","kk.kwwwwwwpk","kwkwwwwwwwk.",".kwwwwwwwk..",".kWwwwwWWk..",fr?".kk....kkk..":"..kk.kk.kk.."];
  add('hare0',fromRows(hare(0),HRP));add('hare1',fromRows(hare(1),HRP));
  const BEP={k:'#1a1408',y:'#ffd030',d:'#3a2a10',w:'#ffffff',W:'#c8e0ff',e:'#000000',s:'#5a4a30'};
  const bee=fr=>[fr?"..........":"...ww.ww..",fr?"..WwwWww..":"..wWwwWw..","..kkkkkkk.",".kydydyyek","skydydyyyk",".kydydyyk.","..kkkkkkk."];
  add('bee0',fromRows(bee(0),BEP));add('bee1',fromRows(bee(1),BEP));
  const WMP={k:'#2a1a0a',s:'#d8a868',S:'#a8783a',m:'#a0202a',t:'#fff0d8',e:'#1a0a0a'};
  const worm=fr=>["....kkkk....","...kssssk...","..kseSSesk..",fr?"..kssssssk..":"..kmtmmtmk..",fr?"..kSSSSSSk..":"..kmmmmmmk..","..ksSssSsk..","...kssssk...","...kSssSk...","...kssssk...","..kkSssSkk.."];
  add('worm0',fromRows(worm(0),WMP));add('worm1',fromRows(worm(1),WMP));
  knight('shade',{style:0,hair:1,skin:4,top:6,bottom:3,shoes:0},{helm:'shade_helm',armor:'shade_armor'},{k:'#0a0610',l:'#3a2a4a',L:'#c070ff',m:'#5a1a7a',j:'#1a0a20'});
  knight('skull',{style:0,hair:3,skin:0,top:4,bottom:3,shoes:0},{helm:'skull_helm',armor:'skull_robe'},null);
  knight('demon',{style:0,hair:1,skin:4,top:6,bottom:3,shoes:0},{helm:'demon_helm',armor:'demon_armor',boots:'demon_boots'},{k:'#14040a',l:'#3a0a14',L:'#ff4a4a',m:'#ffd34a',j:'#2a0a10'});
  // 중간보스: 바람 기사(천공 기사 갑옷 + 하늘빛 검), 근위대장(그림자 기사 갑옷 + 붉은 대검)
  knight('windk',{style:0,hair:1,skin:0,top:5,bottom:3,shoes:0},{helm:'sky_helm',armor:'sky_armor',boots:'sky_boots'},{k:'#10203a',l:'#c8e8ff',L:'#ffffff',m:'#f0c040',j:'#2a3a5a'});
  knight('gcapt',{style:0,hair:1,skin:4,top:6,bottom:3,shoes:0},{helm:'shade_helm',armor:'shade_armor',boots:'demon_boots'},{k:'#14040a',l:'#5a0a14',L:'#ff3a3a',m:'#c0c0c0',j:'#2a0a10'});
  add('darkorb',fromRows([".kkkk.","kpPPpk","kPWWPk","kPWWPk","kpPPpk",".kkkk."],{k:'#14041c',p:'#5a1a9a',P:'#9a3aff',W:'#f0d0ff'}));
  /* 지역마다 하나씩 더 (2차): 초원 버섯, 고목 사마귀, 동굴 두더지, 고성 가고일, 얼음 정령, 사막 독수리, 용암 슬라임, 하늘 천둥 구름, 마왕성 미믹 */
  const SHP={k:'#3a1010',r:'#d83a3a',w:'#fff0e0',s:'#f0dcb8',S:'#c8a880',e:'#2a1a10'};
  const shroom=fr=>[...(fr?["............"]:[]),"...kkkkkk...",".kkrrwrrrkk.","krrwwrrrrwrk","krrrrrrwwrrk","kkkkkkkkkkkk","...kseesk...","...kssssk...",...(fr?[]:["..kssssssk.."]),"..kSSSSSSk..","..kkkkkkkk.."];
  add('shroom0',fromRows(shroom(0),SHP));add('shroom1',fromRows(shroom(1),SHP));
  add('spore',fromRows([".y.","yYy",".y."],{y:'#e8f0a0',Y:'#ffffff'}));
  // 사마귀: 갑옷 몬스터처럼 kn_mantis_* (idle·run·wind·atk), 16x14, 오른쪽을 봄
  const MTP={k:'#0e2008',g:'#6ac83a',G:'#3a8a22',e:'#ff3a3a',y:'#d8f080'};
  const mBody=["......kkggGGk...","....kkggGGGk....","..kkgggGGGk.....",".kggggGGGk......","kGGGGkkkk.......","..k..k.k..k.....",".k..k...k..k...."];
  const mHead=claw=>["...........kkk..","..........kgggk.","..........kgegk.","...........kgk..",...claw,...mBody];
  const mt={idle:["..........kgGk..",".........kgGk.k.","........kgGkkgk."],
    run:["..........kgGk..",".........kgGkk..","........kgGkkgk."],
    wind:["..........kgGkk.",".........kgGkkyk","........kgGk.kgk"],
    atk:["..........kgGk..",".........kgGkkkk","........kgGkyyyy"]};
  const MT={idle0:mHead(mt.idle),idle1:mHead(mt.run),run0:mHead(mt.run),run1:mHead(mt.idle),wind:mHead(mt.wind),atk:mHead(mt.atk)};
  for(const k in MT)add('kn_mantis_'+k,fromRows(MT[k],MTP));
  const MLP={k:'#1a0e08',b:'#7a5a3a',B:'#5a3e24',e:'#000000',p:'#ff9ab0',w:'#e8d8c0'};
  const mole=fr=>["...kkkkkk...","..kbbbbbbk..",".kbbebbebbk.",".kbbbppbbbk.","kbbbbppbbbbk",fr?"kwkbbbbbbkwk":"kbbbbbbbbbbk",fr?"kwkbbbbbbkwk":"kwkbbbbbbkwk",".kkbBBBBbkk.","..kBBBBBBk..","..kkkkkkkk.."];
  add('mole0',fromRows(mole(0),MLP));add('mole1',fromRows(mole(1),MLP));
  add('rock',fromRows([".kkk.","kaAak","kAaak",".kkk."],{k:'#1a1410',a:'#8a7a68',A:'#5a4a3a'}));
  const GAP={k:'#14121a',a:'#8a8898',A:'#5a5868',r:'#ff4a4a'};
  const garg=fr=>[fr?"k............k":"..............",fr?"kak..kkkk..kak":"k...kkkkkk...k",fr?"kaak.kaaak.aak":"kak.kaaaak.kak",".kaakarrakaak.","..kAkaaaakAk..",fr?"...kkaAAakk...":"..kakaAAakak..","....kaAAak....","...kaAkkAak...","...kk....kk..."];
  add('garg0',fromRows(garg(0),GAP));add('garg1',fromRows(garg(1),GAP));
  const IWP={k:'#1a3a6a',W:'#ffffff',b:'#9ff0ff',B:'#4aa8f0',e:'#1a2a4a'};
  const iwisp=fr=>["....kk....","...kWbk...",fr?"..kWbbBk..":".kkWbbBkk.",".kWbebeBk.","kWbbbbbbBk",".kbbbbbBk.",fr?".kkbbBBkk.":"..kbbBBk..","...kbBk...","....kk...."];
  add('iwisp0',fromRows(iwisp(0),IWP));add('iwisp1',fromRows(iwisp(1),IWP));
  const VUP={k:'#1a0e08',b:'#6a4a2a',B:'#4a3018',w:'#e8dcc8',p:'#e89a8a',y:'#f0c040'};
  const vult=fr=>fr?["......kkk.......",".....kwwwk......","kk..kwbbbwkpk...","kbkkbbbbbbbpyk..","kbbbbBBBbbbkk...",".kBBBBkkBBBk....","..kkkk..kkk.....","................"]
    :["kk..........kk..","kbk..kkk...kbk..",".kbkkwwwk.kbk...","..kbbbbbbbbkpk..","...kbBBBbbbbpyk.","....kBBkkBBkk...",".....kk..kk.....","................"];
  add('vult0',fromRows(vult(0),VUP));add('vult1',fromRows(vult(1),VUP));
  const MSP={k:'#2a0804',g:'#ff6a1a',G:'#b02a0a',w:'#ffe080'};
  add('mslime0',fromRows(SL0,MSP));add('mslime1',fromRows(SL1,MSP));
  add('flame',fromRows(["..y...",".yYy..",".yYYy.","yYWYy.","yYWWYy",".yYYy."],{y:'#ff6a1a',Y:'#ffb040',W:'#fff0a0'}));
  const TCP={k:'#2a2a3a',c:'#8a8aa0',C:'#5a5a72',w:'#c8c8d8',e:'#ffe060'};
  const cloud=fr=>["....kkkk........","...kwwwwkkkk....","..kwccccwwwwk...",".kkccccccccccknk".replace('n',fr?'k':'.'),"kccceccccecccck.","kcccccccccccccck","kCCCCCCCCCCCCCk.",fr?".kkkkkkkkkkkkk..":"..kkkkkkkkkkk..."];
  add('tcloud0',fromRows(cloud(0),TCP));add('tcloud1',fromRows(cloud(1),TCP));
  add('zap',fromRows(["..kk.",".kWk.","kWyk.",".kWWk","..kyk",".kWk.","kWyk.",".kWWk","..kyk",".kWk.","kWk..","k...."],{k:'#5a4a10',W:'#ffffff',y:'#ffe060'}));
  // 미믹: 잘 땐 보물 상자(chest0) 그대로, 깨면 이빨·혀
  add('mimic1',fromRows(["..kkkkkkkkkk..",".kbbbbbbbbbbk.","kbBBBBBBBBBBbk","kwkwkwkwkwkwkk","k.r........r.k","k..rrr..rrr..k","kwkwkwkwkwkwkk","kyyyyyyyyyyyyk","kbbbbbyybbbbbk","kbbbbbbbbbbbbk","kkkkkkkkkkkkkk"],{k:'#1a1008',b:'#8a5a2a',B:'#b07a3a',y:'#f0c040',w:'#ffffff',r:'#e0303a'}));
  // 저주 가시 (튀어나왔다 들어감)
  {const[c,x]=cv(16,10);for(let i=0;i<4;i++){const cx=i*4;for(let h=0;h<8;h++){const hw=Math.floor(h/3);px(x,'#c070ff',cx+2-hw,h,hw+1,1);px(x,'#5a1a7a',cx+2,h,hw,1)}}px(x,'#2a1036',0,8,16,2);add('pspike',c)}
  // 순간이동 문: 보라빛 소용돌이
  {const[c,x]=cv(16,24);for(let y=0;y<24;y++)for(let X=0;X<16;X++){const d=Math.hypot((X-7.5)/7.5,(y-11.5)/11.5);if(d<1){const band=Math.floor(d*5+y*0.15)%2;px(x,d>0.82?'#2a1036':band?'#9a3aff':'#5ae0ff',X,y)}}px(x,'#ffffff',6,9,4,6);add('portal',c)}
  // 어둠 속 빛 (가운데가 진하고 가장자리로 갈수록 투명)
  {const[c,x]=cv(128,128);const g=x.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.55,'rgba(255,255,255,0.8)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);add('lightmask',c)}
  // 고드름 (천장에서 떨어짐)
  add('icicle',fromRows(["kkkkkkk","kWbbbBk",".kbbBk.",".kWbBk.","..kbk..","..kbk..","...k..."],{k:'#1a3a6a',W:'#ffffff',b:'#bfeeff',B:'#6fc8ff'}));
  // 퍼즐: 나무 상자, 누름판, 철문, 횃불
  add('crate',fromRows(["kkkkkkkkkkkkkkkk","kLLLLLLLLLLLLLLk","kLbbbbbbbbbbbbDk","kLbLbbbbbbbbDbDk","kLbbLbbbbbbDbbDk","kLbbbLbbbbDbbbDk","kLbbbbLbbDbbbbDk","kLbbbbbLDbbbbbDk","kLbbbbbDLbbbbbDk","kLbbbbDbbLbbbbDk","kLbbbDbbbbLbbbDk","kLbbDbbbbbbLbbDk","kLbDbbbbbbbbLbDk","kLbbbbbbbbbbbbDk","kDDDDDDDDDDDDDDk","kkkkkkkkkkkkkkkk"],{k:'#2a1608',L:'#e8b070',b:'#b07a40',D:'#7a4a20'}));
  add('plate0',fromRows(["..kkkkkkkkkkkk..",".kYyyyyyyyyyyYk.","kkkkkkkkkkkkkkkk"],{k:'#2a2230',y:'#c8a040',Y:'#8a6a20'}));
  add('plate1',fromRows(["................",".kkkkkkkkkkkkkk.","kkYYYYYYYYYYYYkk"],{k:'#2a2230',Y:'#ffe27a'}));
  add('gate',fromRows(["kkkkkkkkkkkkkkkk","kMMMMMMMMMMMMMMk","k.ka..ka..ka..kk","k.ka..ka..ka..kk","k.ka..ka..ka..kk","k.ka..ka..ka..kk","kMMMMMMMMMMMMMMk","k.ka..ka..ka..kk","k.ka..ka..ka..kk","k.ka..ka..ka..kk","k.ka..ka..ka..kk","kMMMMMMMMMMMMMMk","k.ka..ka..ka..kk","k.ka..ka..ka..kk","k.kA..kA..kA..kk","kkkkkkkkkkkkkkkk"],{k:'#14101c',M:'#6a6478',a:'#a8a4b8',A:'#c8c4d8'}));
  add('torch0',fromRows(["......","......","......","......","......",".kkkk.","kMmmMk",".kMMk.","..kk..","..kk..","..kk..",".kkkk."],{k:'#14101c',M:'#5a5468',m:'#3a3448'}));
  add('torch1',fromRows(["..y...","..yy..",".yRy..",".yRRy.",".RWRy.",".kkkk.","kMmmMk",".kMMk.","..kk..","..kk..","..kk..",".kkkk."],{k:'#14101c',M:'#5a5468',m:'#3a3448',y:'#ffd060',R:'#ff6a2a',W:'#ffffff'}));
  // 구름 (흘러가는 장식)
  for(let i=0;i<3;i++){const w=[44,30,58][i],h=[14,10,16][i];const[c,x]=cv(w,h);
    const blobs=[[w*0.25,h*0.62,h*0.38],[w*0.5,h*0.45,h*0.5],[w*0.75,h*0.6,h*0.36],[w*0.4,h*0.7,h*0.3],[w*0.62,h*0.72,h*0.3]];
    for(let y=0;y<h;y++)for(let X=0;X<w;X++){let inside=false,top=false;
      for(const[bx,by,r]of blobs){const d=Math.hypot(X-bx,y-by);if(d<r)inside=true;if(d<r&&y<by-r*0.4)top=true}
      if(inside){x.fillStyle=y>h*0.7?'#d6ecf8':top?'#ffffff':'#f4fbff';x.fillRect(X,y,1,1)}}
    add('cloud'+i,c)}
  {const[c,x]=cv(2,2);px(x,'#fff',0,0,2,2);add('px',c)}
  {const[c,x]=cv(48,48);for(let y=0;y<48;y++)for(let X=0;X<48;X++){const d=Math.hypot(X-23.5,y-23.5);if(d<24){const a=Math.floor((1-d/24)*5)/5*0.4;if(a>0){x.fillStyle=`rgba(255,170,80,${a})`;x.fillRect(X,y,1,1)}}}add('glow',c)}
}
