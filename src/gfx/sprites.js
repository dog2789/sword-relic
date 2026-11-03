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
  add('slashA',arcTex(16,6,-80,80,['#ffffff','#9fe8ff','#3a8fd8']));
  add('slashC',arcTex(22,8,-90,90,['#fffbe0','#ffd34a','#e0782a']));
  add('wave',arcTex(10,4,-70,70,['#ffffff','#ffe27a','#ff9a3a']));
  add('spark',fromRows(["...w...","...w...","..www..","wwwwwww","..www..","...w...","...w..."],{w:'#ffffff'}));
  add('heart',fromRows([".kk.kk.","krwkrrk","krrrrrk",".krrrk.","..krk..","...k..."],{k:'#3a0a18',r:'#ff4a6a',w:'#ffd0d8'}));
  const FP={y:'#fff2a0',o:'#ffb03a',r:'#e0462a'};
  add('flame0',fromRows(["..y..",".yy..",".yoy.","yooy.","yorry",".orr.",".rrr.","..r.."],FP));
  add('flame1',fromRows(["..y..","..yy.",".yoy.",".yooy","yrroy",".rro.",".rrr.","..r.."],FP));
  add('flame2',fromRows([".....","..y..",".yoy.",".yoy.","yorry","yorro",".rrr.","..r.."],FP));
  add('torch',fromRows(["kgggk",".kgk.",".kbk.",".kbk.",".kbk.","..k.."],{k:'#1a1220',g:'#c9a24a',b:'#6b4a2a'}));
  {const[c,x]=cv(2,2);px(x,'#fff',0,0,2,2);add('px',c)}
  {const[c,x]=cv(48,48);for(let y=0;y<48;y++)for(let X=0;X<48;X++){const d=Math.hypot(X-23.5,y-23.5);if(d<24){const a=Math.floor((1-d/24)*5)/5*0.4;if(a>0){x.fillStyle=`rgba(255,170,80,${a})`;x.fillRect(X,y,1,1)}}}add('glow',c)}
}
