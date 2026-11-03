import Phaser from 'phaser';
import {W,H,VP} from '../config.js';
import {buildTextures} from '../gfx/sprites.js';
import {buildFonts} from '../gfx/fonts.js';
import {cv,px} from '../gfx/pixel.js';
import {LOOK,drawHero,HERO_W,HERO_H,HERO_FRAMES} from '../gfx/hero.js';
import {drawFar,drawMid} from '../world/meadow.js';
import {STATE,hasSave,loadGame,newGame} from '../state.js';
import {fitCameras} from '../zoom.js';
import {isDown,edges} from '../input.js';

import {F9,F11} from '../fonts.js';

export function paintHeroFrames(scene){
  for(const f in HERO_FRAMES){const t=scene.textures.get('hero_'+f),c=t.getContext();c.clearRect(0,0,HERO_W,HERO_H);drawHero(c,f,LOOK,STATE.equip);t.refresh()}
  if(!scene.anims.exists('hero_idle'))scene.anims.create({key:'hero_idle',frames:[{key:'hero_idle0'},{key:'hero_idle1'}],frameRate:2.5,repeat:-1});
}

export class TitleScene extends Phaser.Scene{
  constructor(){super('title')}
  create(){
    buildTextures(this);buildFonts(this);
    if(!this.textures.exists('title_far'))this.textures.addCanvas('title_far',drawFar(W));
    if(!this.textures.exists('title_mid'))this.textures.addCanvas('title_mid',drawMid(W));
    if(!this.textures.exists('title_ground')){const[c,x]=cv(W,40);px(x,'#9a6a3c',0,6,W,34);px(x,'#86d652',0,0,W,2);px(x,'#62bc40',0,2,W,3);px(x,'#4a9a34',0,5,W,2);
      for(let i=0;i<W;i+=2){if(Math.random()<.4)px(x,'#86d652',i,-1+0,1,1);if(Math.random()<.2)px(x,'#7a4e2a',i,10+Math.random()*28|0)}this.textures.addCanvas('title_ground',c)}
    this.add.image(0,0,'title_far').setOrigin(0);
    this.clouds=[0,1,2].map(i=>this.add.image(40+i*110,18+i*16,'cloud'+i));
    this.add.image(0,22,'title_mid').setOrigin(0);
    this.add.image(0,H-34,'title_ground').setOrigin(0);
    paintHeroFrames(this);
    this.add.sprite(W/2,H-42,'hero_idle0').play('hero_idle');
    // 로고
    this.add.bitmapText(W/2+2,36,'dmg','SWORD RELIC').setOrigin(0.5).setScale(2).setTint(0x3a1a08).setLetterSpacing(-2);
    this.add.bitmapText(W/2,34,'dmg','SWORD RELIC').setOrigin(0.5).setScale(2).setTint(0xffd34a).setLetterSpacing(-2);
    this.add.text(W/2,58,'전설의 검을 찾아서',{fontFamily:F11,fontSize:'12px',color:'#ffffff',stroke:'#2a3a6a',strokeThickness:3}).setOrigin(0.5);
    this.opts=hasSave()?['이어하기','새로 시작']:['새로 시작'];this.sel=0;
    this.items=this.opts.map((o,i)=>{const t=this.add.text(W/2,84+i*15,o,{fontFamily:F11,fontSize:'12px',color:'#ffffff',stroke:'#1a1230',strokeThickness:3})
      .setOrigin(0.5).setInteractive({useHandCursor:true});
      t.on('pointerdown',()=>{this.sel=i;this.choose()});return t});
    this.cursor=this.add.text(0,0,'▶',{fontFamily:F9,fontSize:'10px',color:'#ffe27a',stroke:'#1a1230',strokeThickness:2}).setOrigin(0.5);
    this.hint=this.add.text(W/2,H-12,'Z 또는 화면을 눌러 선택',{fontFamily:F9,fontSize:'10px',color:'#ffffff',stroke:'#1a1230',strokeThickness:2}).setOrigin(0.5);
    this.tweens.add({targets:this.hint,alpha:0.3,duration:700,yoyo:true,repeat:-1});
    this.ed=edges();
    this.prevVP={};this.busy=false;
    this.cameras.main.setOrigin(0,0);fitCameras(this);
    this.cameras.main.fadeIn(300,0,0,0);
  }
  choose(){
    if(this.busy)return;this.busy=true;
    const o=this.opts[this.sel];
    this.cameras.main.fadeOut(300,0,0,0);
    this.cameras.main.once('camerafadeoutcomplete',()=>{
      if(o==='이어하기'&&loadGame())this.scene.start('play',{room:STATE.save.room,entry:'save'});
      else{newGame();this.scene.start('custom')}
    });
  }
  update(t,d){
    fitCameras(this);
    const v=VP,e=this.ed;
    this.clouds.forEach((c,i)=>{c.x+=d/1000*(4+i*2);if(c.x>W+40)c.x=-40});
    const up=e('up',isDown('ArrowUp','KeyW')||v.up),dn=e('dn',isDown('ArrowDown','KeyS')||v.down),
      ok=e('ok',isDown('KeyZ','KeyX','Space','Enter')||v.attack||v.jump);
    if(up)this.sel=(this.sel+this.opts.length-1)%this.opts.length;
    if(dn)this.sel=(this.sel+1)%this.opts.length;
    if(ok)this.choose();
    this.items.forEach((it,i)=>it.setColor(i===this.sel?'#ffe27a':'#ffffff'));
    const cur=this.items[this.sel];this.cursor.setPosition(cur.x-cur.width/2-10+Math.sin(t/150)*1.5,cur.y);
  }
}
