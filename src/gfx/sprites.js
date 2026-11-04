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
  horned:["k..........k","kOk......kOk","kOOkkkkkkOOk",".kOkaaiikOk.","..kaaaaaaik.","..kvvvvvvvk.","..kaaavaaak.","..kaaavaaak.","...kaaaaak..","....kkkkk..."]};
const ARMOR_ICON={
  heavy:[".kkkk..kkkk.","kiaaAkkiaaAk","kaAAAaaaAAAk",".kkkannnakk.","...kannnak..","...kannnak..","...kAnnnAk..","....kkkkk..."],
  spike:["k..........k","kk........kk","kak......kak","kaakkkkkkaak","kaAAannaAAak",".kkaannaakk.","..kaannaak..","..kAannaAk..","...kkkkkk..."]};
const BOOT_ICON=["............","..kkk...kkk.","..kck...kck.","..kfk...kfk.","..kffk..kffk",".kfffk.kfffk",".kkkkk.kkkkk"];
/* 무기마다 다른 검 모양: 손에 든 모습(가로) / 아이콘(대각선) */
const SWORDS={
  slime_blade:["..k...kk.....","..mkkkLLkkk..","jjmLLLLLLLLk.","..mkkLLkkkLLk","..k..kk...kk."],
  flame_sword:["..k...k...k..","..mkkkLkkkLk.","jjmLLLLLLLLLk","..mkkLkkkLkk.","..k..k...k..."],
  frost_blade:["..k.....kk....","..mkkkkkLLkk..","jjmLLLLLLLLLLk","..mkkkkkLLkk..","..k.....kk...."],
  blue_sword:[".mm............","..mkkkkkkkkkk..","jjmLLLLLLLLLLLk","..mkkkkkkkkkk..",".mm............"]};
const SWORD_ICONS={
  slime_blade:[".........kkk","........kLLk",".......kLLlk","......kLlLk.",".....kLlLk..","....kLLlk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  flame_sword:["........k.kk",".......kLkLk","........kLlk",".....k.kLlk.","....kLkLlk..",".....kLlk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  frost_blade:["........kkkk",".......kLLLk","......kLLllk",".....kLLllk.","....kLLllk..","....kLllk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  blue_sword:["..........kk",".........kLk","........kLlk",".......kLlk.","......kLlk..",".....kLlk...","...kkLlk....","..kmmLk.....","..mmmk......","..kjmmk.....",".kjk.mm.....","kkk........."]};
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
      if(k==='wind')paintPix(x,SW_UP,swPal,6,4);
      drawHero(x,fr[k],look,equip,6,2);
      if(k==='atk')paintPix(x,SWORD,swPal,23,15);
      else if(k!=='wind')paintPix(x,SW_UP,swPal,19,10+(k==='idle1'||k==='run1'?1:0));
      sc.textures.addCanvas(key,c)}};
  knight('haunt',{style:0,hair:1,skin:4,top:6,bottom:3,shoes:0},{helm:'haunt_helm',armor:'haunt_armor'},{k:'#141020',l:'#8a88a0',L:'#c8b0ff',m:'#5a2a7a',j:'#2a1a3a'});
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
