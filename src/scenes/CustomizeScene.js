/* 캐릭터 만들기: 새로 시작할 때 인트로 전에 나오는 화면
   ↑↓ 항목 고르기, ←→ 바꾸기, Z 결정 / 터치는 ◀ ▶ 와 버튼을 직접 누름 */
import Phaser from 'phaser';
import {W,H,VP} from '../config.js';
import {HERO_W,HERO_H,HAIR_STYLES,LOOK_OPTS,LOOK,drawHero,saveLook} from '../gfx/hero.js';
import {STATE} from '../state.js';
import {fitCameras} from '../zoom.js';
import {isDown,edges} from '../input.js';
import {F9,F11} from '../fonts.js';

const ROWS=[
  {k:'style',name:'머리 모양'},{k:'hair',name:'머리색'},{k:'skin',name:'피부'},
  {k:'top',name:'상의'},{k:'bottom',name:'하의'},{k:'shoes',name:'신발'},
  {btn:'rand',name:'무작위'},{btn:'go',name:'모험 시작'}];
const PX=128,RY=34,RH=14,BX=PX+12;
const count=k=>k==='style'?HAIR_STYLES.length:LOOK_OPTS[k].length;
const label=k=>k==='style'?(HAIR_STYLES[LOOK.style]||HAIR_STYLES[0]).name:LOOK_OPTS[k][LOOK[k]][0];

export class CustomizeScene extends Phaser.Scene{
  constructor(){super('custom')}
  create(){
    bgm('title');
    this.add.image(0,0,'title_far').setOrigin(0);
    this.add.image(0,22,'title_mid').setOrigin(0);
    this.add.image(0,H-34,'title_ground').setOrigin(0);
    // 미리보기 캐릭터 (4배)
    if(!this.textures.exists('cust_hero'))this.textures.createCanvas('cust_hero',HERO_W,HERO_H);
    this.heroTex=this.textures.get('cust_hero');this.frame=0;
    this.add.ellipse(64,H-34,46,6,0x000000,0.25);
    this.hero=this.add.image(64,H-34,'cust_hero').setOrigin(0.5,(HERO_H-3)/HERO_H).setScale(4);
    this.time.addEvent({delay:420,loop:true,callback:()=>{this.frame^=1;this.paint()}});
    this.add.text(64,22,'모험가의 모습',{fontFamily:F11,fontSize:'12px',color:'#ffffff',stroke:'#1a1230',strokeThickness:3}).setOrigin(0.5);

    // 오른쪽 패널
    const g=this.add.graphics();
    g.fillStyle(0x000000,0.35).fillRect(PX+3,13,W-PX-8,H-20);
    g.fillStyle(0x1a1230,0.97).fillRect(PX,10,W-PX-8,H-20);
    g.lineStyle(1,0xe8c04a,1).strokeRect(PX+0.5,10.5,W-PX-9,H-21);
    this.add.text(PX+10,15,'캐릭터 만들기',{fontFamily:F11,fontSize:'12px',color:'#ffe27a'});
    this.sel=0;this.hl=this.add.graphics();this.sw=this.add.graphics();
    const T=(x,y,s,c='#ffffff')=>this.add.text(x,y,s,{fontFamily:F9,fontSize:'10px',color:c});
    this.rows=ROWS.map((r,i)=>{
      const y=r.btn?RY+6*RH+4+(i-6)*16:RY+i*RH,o={y};
      if(r.btn){
        o.txt=T(PX+(W-PX-8)/2,y+2,r.name,r.btn==='go'?'#9fff8a':'#ffffff').setOrigin(0.5,0);
        o.hit=this.add.zone(PX+8,y,W-PX-24,14).setOrigin(0).setInteractive({useHandCursor:true});
        o.hit.on('pointerdown',()=>{this.sel=i;this.act(r)});
      }else{
        o.nm=T(BX,y+2,r.name,'#8f86ab');
        o.l=T(PX+72,y+2,'◀','#ffe27a').setOrigin(0.5,0);
        o.r=T(W-22,y+2,'▶','#ffe27a').setOrigin(0.5,0);
        o.v=T((PX+80+W-30)/2+(r.k==='style'?0:5),y+2,'').setOrigin(0.5,0);
        const zl=this.add.zone(PX+62,y,20,14).setOrigin(0).setInteractive({useHandCursor:true}),
              zr=this.add.zone(W-32,y,20,14).setOrigin(0).setInteractive({useHandCursor:true});
        zl.on('pointerdown',()=>{this.sel=i;this.change(r.k,-1)});zr.on('pointerdown',()=>{this.sel=i;this.change(r.k,1)});
      }
      return o});
    this.add.text(W/2,H-6,'↑↓ 고르기 · ←→ 바꾸기 · Z 결정',{fontFamily:F9,fontSize:'10px',color:'#ffffff',stroke:'#1a1230',strokeThickness:2}).setOrigin(0.5,1);
    this.ed=edges();this.busy=false;
    this.cameras.main.setOrigin(0,0);fitCameras(this);
    this.cameras.main.fadeIn(300,0,0,0);
    this.refresh();
  }
  paint(){
    const c=this.heroTex.getContext();c.clearRect(0,0,HERO_W,HERO_H);
    drawHero(c,this.frame?'idle1':'idle0',LOOK,STATE.equip);this.heroTex.refresh();
  }
  change(k,d){const n=count(k);LOOK[k]=((LOOK[k]||0)+d+n)%n;this.refresh()}
  act(r){
    if(r.btn==='rand'){LOOK.style=Math.random()*HAIR_STYLES.length|0;for(const o in LOOK_OPTS)LOOK[o]=Math.random()*LOOK_OPTS[o].length|0;this.refresh();return}
    if(r.btn==='go'&&!this.busy){this.busy=true;saveLook();
      this.cameras.main.fadeOut(300,0,0,0);
      this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.start('intro'))}
  }
  refresh(){
    this.paint();
    this.hl.clear().fillStyle(0xffe27a,0.16);
    const s=this.rows[this.sel];this.hl.fillRect(PX+6,s.y,W-PX-20,14);
    this.sw.clear();
    ROWS.forEach((r,i)=>{const o=this.rows[i],on=i===this.sel;
      if(r.btn){o.txt.setText((on?'▶ ':'')+r.name);return}
      o.nm.setColor(on?'#ffffff':'#8f86ab');o.v.setText(label(r.k));
      if(r.k!=='style'){const col=Phaser.Display.Color.HexStringToColor(LOOK_OPTS[r.k][LOOK[r.k]][1]).color,x=o.v.x-o.v.width/2-11;
        this.sw.fillStyle(0x000000,1).fillRect(x-1,o.y+2,10,10).fillStyle(col,1).fillRect(x,o.y+3,8,8)}
    });
  }
  update(){
    fitCameras(this);
    const v=VP,e=this.ed,n=ROWS.length,r=ROWS[this.sel];
    const up=e('u',isDown('ArrowUp','KeyW')||v.up),dn=e('d',isDown('ArrowDown','KeyS')||v.down),
      lf=e('l',isDown('ArrowLeft','KeyA')||v.left),rt=e('r',isDown('ArrowRight','KeyD')||v.right),
      ok=e('ok',isDown('KeyZ','KeyX','Space','Enter')||v.attack||v.jump);
    if(up){this.sel=(this.sel+n-1)%n;this.refresh()}
    if(dn){this.sel=(this.sel+1)%n;this.refresh()}
    if(!r.btn){if(lf)this.change(r.k,-1);if(rt)this.change(r.k,1);if(ok){this.sel=n-1;this.refresh()}}
    else if(ok)this.act(r);
  }
}
