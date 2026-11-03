import Phaser from 'phaser';
import {W,H,VP} from '../config.js';
import {rng,cv,px} from '../gfx/pixel.js';
import {LOOK,drawHero} from '../gfx/hero.js';
import {STATE} from '../state.js';
import {fitCameras} from '../zoom.js';
import {isDown,edges} from '../input.js';

import {F9,F11} from '../fonts.js';
const PW=220,PH=100;

const STORY=[
  '아주 먼 옛날, 세상을 지키던 한 자루의 검이 있었다.\n사람들은 그 검을 \'소드 레릭\'이라 불렀다.',
  '어느 날 검은 빛을 잃고 사라졌다.\n그 뒤로 들판과 숲에는 마물이 들끓기 시작했다.',
  '작은 마을 아르덴.\n소년은 할아버지가 남긴 낡은 지도 한 장을 펼쳤다.',
  '지도 끝에 그려진 검의 표식.\n이제, 전설의 검을 찾아 떠날 시간이다.'
];

function disc(x,col,cx,cy,r){for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let X=Math.floor(cx-r);X<=cx+r;X++)if((X-cx)**2+(y-cy)**2<=r*r)px(x,col,X,y)}
function sky(x,top,bot){for(let y=0;y<PH;y+=4){const t=y/PH;px(x,`rgb(${top.map((v,i)=>Math.round(v+(bot[i]-v)*t)).join(',')})`,0,y,PW,4)}}
function hills(x,col,base,amp,f,ph){for(let X=0;X<PW;X++){const y=Math.round(base+amp*Math.sin(X/f+ph));px(x,col,X,y,1,PH-y)}}
function hero(x,frame,ox,oy){drawHero(x,frame,LOOK,STATE.equip,ox,oy)}

const PANELS=[
  // 0: 밤, 언덕 위 바위에 꽂힌 빛나는 검
  x=>{const r=rng(1);sky(x,[14,18,48],[40,48,96]);for(let i=0;i<50;i++)px(x,r()<.3?'#fff6c8':'#c8d4ff',r()*PW|0,r()*60|0);
    disc(x,'#fff6c8',178,20,9);disc(x,'#28305e',182,17,8);
    hills(x,'#1c2448',74,6,30,0);hills(x,'#141a36',84,4,18,2);
    for(let y=0;y<62;y++){x.fillStyle=`rgba(255,240,170,${0.18*(1-y/62)})`;x.fillRect(104-(y>>3),y,12+(y>>2),1)}
    disc(x,'#5a5a72',110,72,10);px(x,'#141a36',96,72,30,12);disc(x,'#7a7a92',108,69,5);
    px(x,'#e8f0ff',109,44,2,24);px(x,'#9ab0d8',111,44,1,24);px(x,'#ffd34a',105,64,10,2);px(x,'#8a5a32',109,66,2,5);
    for(let i=0;i<14;i++)px(x,'#fff3b0',100+r()*22|0,40+r()*30|0)},
  // 1: 붉은 하늘, 빈 바위, 마물들
  x=>{const r=rng(2);sky(x,[60,16,28],[150,60,40]);
    hills(x,'#2a1420',70,7,26,1);hills(x,'#1a0c14',82,4,16,3);
    disc(x,'#3a2a32',110,72,10);px(x,'#1a0c14',96,72,30,12);px(x,'#1a0c14',108,62,4,4);
    for(let i=0;i<5;i++){const sx=20+i*42+(r()*10|0),sy=78+(r()*6|0);for(let yy=-6;yy<=0;yy++)for(let xx=-7;xx<=7;xx++)if(xx*xx/49+yy*yy/36<=1)px(x,'#0e060a',sx+xx,sy+yy);px(x,'#ff4a4a',sx-3,sy-3);px(x,'#ff4a4a',sx+2,sy-3)}
    for(let i=0;i<30;i++)px(x,'#6a3a3a',r()*PW|0,r()*50|0)},
  // 2: 낮의 마을, 지도를 든 소년
  x=>{const r=rng(3);sky(x,[110,190,238],[200,236,250]);disc(x,'#ffffff',40,18,7);disc(x,'#ffffff',50,16,9);disc(x,'#ffffff',60,19,6);
    hills(x,'#8fcf6a',62,4,24,0);
    const house=(hx,w,h,roof)=>{px(x,'#e8d8b8',hx,80-h,w,h);px(x,'#b89870',hx,80-h,1,h);for(let i=0;i<=w/2+2;i++)px(x,roof,hx-2+i,80-h-i,w+4-2*i,1);px(x,'#6a4428',hx+w/2-3,80-12,6,12);px(x,'#7ab8e8',hx+4,80-h+5,5,5)};
    house(18,34,26,'#c84a3a');house(150,30,22,'#3a6ac8');house(70,26,20,'#c8883a');
    px(x,'#8a8a8a',176,34,4,8);for(let i=0;i<5;i++)disc(x,'#e8e8f0',178+i*2,30-i*5,2+i*0.4);
    px(x,'#86d652',0,80,PW,2);px(x,'#62bc40',0,82,PW,18);
    hero(x,'idle0',112,64);px(x,'#3a2410',128,72,11,9);px(x,'#f0e0b0',129,73,9,7);px(x,'#c84a3a',134,75,2,2);px(x,'#8a6a40',130,76,3,1)},
  // 3: 새벽 들판 길, 떠나는 소년
  x=>{const r=rng(4);sky(x,[255,180,140],[255,232,200]);disc(x,'#fff3c0',170,62,14);disc(x,'#ffe08a',170,62,10);
    hills(x,'#d89a8a',58,6,40,1);hills(x,'#9ad27c',68,5,22,0);
    px(x,'#86d652',0,80,PW,2);px(x,'#62bc40',0,82,PW,18);
    for(let X=0;X<PW;X++){const w=Math.round(2+X*0.08);px(x,'#d8b880',X,86-(X>>5),w,1)}
    px(x,'#7a5232',150,64,2,16);px(x,'#c08a50',142,62,18,8);px(x,'#3a2410',146,65,8,2);px(x,'#3a2410',152,64,1,4);
    hero(x,'run0',60,64);for(let i=0;i<8;i++)px(x,'#ffffff',r()*PW|0,r()*40|0)}
];

export class IntroScene extends Phaser.Scene{
  constructor(){super('intro')}
  create(){
    PANELS.forEach((fn,i)=>{const k='story'+i;if(this.textures.exists(k))this.textures.remove(k);const[c,x]=cv(PW,PH);fn(x);this.textures.addCanvas(k,c)});
    this.cameras.main.setBackgroundColor('#0a0812');
    this.frame=this.add.graphics();
    this.frame.fillStyle(0xc9a24a,1).fillRect((W-PW)/2-3,9,PW+6,PH+6);this.frame.fillStyle(0x0a0812,1).fillRect((W-PW)/2-1,11,PW+2,PH+2);
    this.pic=this.add.image(W/2,12,'story0').setOrigin(0.5,0);
    this.cap=this.add.text(W/2,122,'',{fontFamily:F11,fontSize:'12px',color:'#ece7f7',align:'center',lineSpacing:4}).setOrigin(0.5,0);
    this.next=this.add.text(W-14,H-10,'Z ▶',{fontFamily:F9,fontSize:'10px',color:'#ffe27a'}).setOrigin(1,1).setVisible(false);
    this.tweens.add({targets:this.next,alpha:0.3,duration:500,yoyo:true,repeat:-1});
    const skip=this.add.text(W-6,4,'건너뛰기 ▶▶',{fontFamily:F9,fontSize:'10px',color:'#8f86ab'}).setOrigin(1,0).setInteractive({useHandCursor:true});
    skip.on('pointerdown',()=>this.finish());
    this.input.on('pointerdown',(p,objs)=>{if(!objs.includes(skip))this.advance()});
    this.ed=edges();
    this.idx=-1;this.prevVP={};this.done=false;
    this.cameras.main.setOrigin(0,0);fitCameras(this);
    this.cameras.main.fadeIn(400,0,0,0);
    this.show(0);
  }
  show(i){
    this.idx=i;this.full=STORY[i];this.shown=0;this.typing=true;this.next.setVisible(false);
    this.pic.setTexture('story'+i).setAlpha(0);this.tweens.add({targets:this.pic,alpha:1,duration:400});
  }
  advance(){
    if(this.done)return;
    if(this.typing){this.shown=this.full.length;return}
    if(this.idx<STORY.length-1)this.show(this.idx+1);else this.finish();
  }
  finish(){
    if(this.done)return;this.done=true;
    this.cameras.main.fadeOut(500,0,0,0);
    this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.start('play',{room:'r1',entry:'start',tutorial:true}));
  }
  update(t,d){
    fitCameras(this);
    const v=VP,e=this.ed;
    const ok=e('ok',isDown('KeyZ','KeyX','Space','Enter')||v.attack||v.jump),esc=e('esc',isDown('Escape'));
    if(ok)this.advance();
    if(esc)this.finish();
    if(this.typing){this.shown=Math.min(this.full.length,this.shown+d/1000*28);
      this.cap.setText(this.full.slice(0,Math.floor(this.shown)));
      if(this.shown>=this.full.length){this.typing=false;this.next.setVisible(true)}}
  }
}
