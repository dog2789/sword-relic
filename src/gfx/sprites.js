import {cv,px,fromRows,arcTex} from './pixel.js';
import {SWORD,HERO_FRAMES,HERO_W,HERO_H,hexMix} from './hero.js';
import {ITEMS} from '../data/items.js';
export const SL0=["....kkkkkk....","..kkggggggkk..",".kgwwgggggggk.",".kgwggggggggk.","kgggggkggkgggk","kgggggkggkgggk","kggggggggggggk","kGggggggggggGk",".kGGGGGGGGGGk.","..kkkkkkkkkk.."];
export const SL1=["..............","...kkkkkkkk...",".kkggggggggkk.","kgwwgggggggggk","kggggkggkggggk","kggggkggkggggk","kggggggggggggk","kGggggggggggGk","kGGGGGGGGGGGGk",".kkkkkkkkkkkk."];
export const CROWN=[".....y.y.y....",".....yyyyy....",".....yyryy...."];
export const SPAL={k:'#122015',g:'#5fcf5a',G:'#2f8a3a',w:'#e8ffe0'};
export const KPAL={k:'#10142e',g:'#5a8cff',G:'#2f4fb0',w:'#e0ecff',y:'#f0c040',r:'#ff4a6a'};

const ICONS={
  weapon:["..........kk",".........kLk","........kLlk",".......kLlk.","......kLlk..",".....kLlk...","..k.kLlk....","..kmkLk.....","...kmk......","..kjkmk.....",".kjk.kk.....","kkk........."],
  helm:["............","...kkkkkk...","..kaiiaaak..",".kaiaaaaaak.",".kaaaaaaaak.",".kaaaaaaaak.",".kmmmmmmmmk.",".kk......kk.","............"],
  armor:["............",".kkk....kkk.","kMMMkkkkMMMk","kMMaaaaaaMMk",".kkaagaaakk.","..kaaaaaak..","..kaaaaaak..","..kAaaaaAk..","...kAAAAk...","....kkkk...."],
  boots:["............","..kkk...kkk.","..kfk...kfk.","..kfk...kfk.","..kffk..kffk",".kfffk.kfffk",".kkkkk.kkkkk"]
};
function iconPal(it){
  const p=Object.assign({k:'#141020'},it.sword||{},(it.look&&it.look.pal)||{});
  if(p.a&&!p.A)p.A=hexMix(p.a,'#000000',0.35);if(p.a&&!p.i)p.i='#ffffff';if(p.a&&!p.m)p.m=hexMix(p.a,'#ffffff',0.3);if(p.a&&!p.M)p.M=hexMix(p.a,'#000000',0.2);
  if(!p.g)p.g='#d23a4a';if(!p.f)p.f='#8a96b0';return p;
}
export function buildTextures(sc){
  const add=(k,c)=>{if(!sc.textures.exists(k))sc.textures.addCanvas(k,c)};
  for(const id in ITEMS){
    const it=ITEMS[id];
    if(it.slot==='weapon'){
      add('sword_'+id,fromRows(SWORD,{k:'#1a1222',...it.sword}));
      add('slashA_'+id,arcTex(14,5,-80,80,it.slashA));
      add('slashC_'+id,arcTex(it.big,it.big>22?10:8,-90,90,it.slashC));
    }
    add('icon_'+id,fromRows(ICONS[it.slot],iconPal(it)));
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
