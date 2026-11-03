import {cv,px,fromRows,arcTex} from './pixel.js';
import {GEAR,SWORD,HERO_FRAMES,HERO_W,HERO_H} from './hero.js';
export const SL0=["....kkkkkk....","..kkggggggkk..",".kgwwgggggggk.",".kgwggggggggk.","kgggggkggkgggk","kgggggkggkgggk","kggggggggggggk","kGggggggggggGk",".kGGGGGGGGGGk.","..kkkkkkkkkk.."];
export const SL1=["..............","...kkkkkkkk...",".kkggggggggkk.","kgwwgggggggggk","kggggkggkggggk","kggggkggkggggk","kggggggggggggk","kGggggggggggGk","kGGGGGGGGGGGGk",".kkkkkkkkkkkk."];
export const CROWN=[".....y.y.y....",".....yyyyy....",".....yyryy...."];
export const SPAL={k:'#122015',g:'#5fcf5a',G:'#2f8a3a',w:'#e8ffe0'};
export const KPAL={k:'#10142e',g:'#5a8cff',G:'#2f4fb0',w:'#e0ecff',y:'#f0c040',r:'#ff4a6a'};

export function buildTextures(sc){
  const add=(k,c)=>{if(!sc.textures.exists(k))sc.textures.addCanvas(k,c)};
  for(let t=0;t<GEAR.length;t++){
    const G=GEAR[t];
    add('sword'+t,fromRows(SWORD,{k:'#1a1222',...G.sword}));
    add('slashA'+t,arcTex(14,5,-80,80,G.slashA));
    add('slashC'+t,arcTex(G.big,G.big>22?10:8,-90,90,G.slashC));
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
