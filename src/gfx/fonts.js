import Phaser from 'phaser';
import {cv,px} from './pixel.js';
/* ---------- pixel fonts (3x5 glyphs) ---------- */
export const CHARS=" 0123456789/+-!.:ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const GL={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111',
'/':'001001010100100','+':'000010111010000','-':'000000111000000','!':'010010010000010','.':'000000000000010',':':'000010000010000',
A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111'};
export function buildFonts(sc){
  if(sc.cache.bitmapFont.exists('pix'))return;
  const n=CHARS.length;
  let[c,x]=cv(n*4,6);
  for(const pass of['#140c22','#ffffff'])[...CHARS].forEach((ch,i)=>{const g=GL[ch];if(!g)return;for(let j=0;j<15;j++)if(g[j]==='1'){const o=pass==='#ffffff'?0:1;px(x,pass,i*4+j%3+o,(j/3|0)+o)}});
  sc.textures.addCanvas('font_pix',c);
  sc.cache.bitmapFont.add('pix',Phaser.GameObjects.RetroFont.Parse(sc,{image:'font_pix',width:4,height:6,chars:CHARS,charsPerRow:n,spacing:{x:0,y:0},offset:{x:0,y:0},lineSpacing:0}));
  [c,x]=cv(n*8,12);
  for(const pass of['#1a0f24','#ffffff'])[...CHARS].forEach((ch,i)=>{const g=GL[ch];if(!g)return;for(let j=0;j<15;j++)if(g[j]==='1'){const gx=i*8+1+(j%3)*2,gy=1+(j/3|0)*2;if(pass==='#ffffff')px(x,pass,gx,gy,2,2);else px(x,pass,gx-1,gy-1,4,4)}});
  sc.textures.addCanvas('font_dmg',c);
  sc.cache.bitmapFont.add('dmg',Phaser.GameObjects.RetroFont.Parse(sc,{image:'font_dmg',width:8,height:12,chars:CHARS,charsPerRow:n,spacing:{x:0,y:0},offset:{x:0,y:0},lineSpacing:0}));
}
