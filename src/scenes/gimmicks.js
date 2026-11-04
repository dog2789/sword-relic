/* 지형 장치: 열쇠·색깔 문, 불덩이 포탑, 스위치 블록, 물(헤엄), 얼음(미끄러짐), 고드름
   PlayScene에 섞어 씀 (Object.assign) */
import Phaser from 'phaser';
import {T,LH,ROWS} from '../config.js';
import {KEYS} from '../data/items.js';
import {STATE} from '../state.js';
import {cv,px} from '../gfx/pixel.js';

export const Gimmicks={
  spawnGimmicks(){
    const R=this.R,m=this.map;
    Object.assign(this,{doors:[],turrets:[],shots:[],blocks:[],switches:[],icicles:[],swOn:false,swCd:0,doorMsgT:0});
    // 색깔 문: 같은 색 열쇠가 있으면 닿기만 해도 열림
    (R.doors||[]).forEach(d=>{
      if(STATE.opened[d.id])return;const w=d.w||1,h=d.h||3,o={def:d,imgs:[],zones:[],rect:new Phaser.Geom.Rectangle(d.tx*T,d.ty*T,w*T,h*T)};
      for(let i=0;i<w;i++)for(let j=0;j<h;j++){const x=(d.tx+i)*T+8,y=(d.ty+j)*T+8;o.imgs.push(this.add.image(x,y,'door_'+d.color).setDepth(3));
        const z=this.add.zone(x,y,T,T);this.physics.add.existing(z,true);this.wallGroup.add(z);o.zones.push(z)}
      this.doors.push(o)});
    // 포탑: dir 방향으로 rate초마다 불덩이 발사
    (R.turrets||[]).forEach(d=>{const x=d.tx*T+8,y=d.ty*T+8,dir={l:[-1,0],r:[1,0],u:[0,-1],d:[0,1]}[d.dir||'l'];
      const s=this.add.image(x,y,'turret').setDepth(3).setAngle({l:0,r:180,u:90,d:-90}[d.dir||'l']);
      this.turrets.push({def:d,x,y,dir,s,t:d.offset||0,rate:d.rate||2.2})});
    // 스위치 블록: 맵 글자 A(빨강) / B(파랑). 스위치를 치면 서로 바뀜
    for(let ty=0;ty<ROWS;ty++)for(let tx=0;tx<this.cols;tx++){const c=m[ty][tx];if(c!=='A'&&c!=='B')continue;
      const x=tx*T+8,y=ty*T+8,z=this.add.zone(x,y,T,T);this.physics.add.existing(z,true);this.wallGroup.add(z);
      this.blocks.push({c,z,img:this.add.image(x,y,'blk'+c+'1').setDepth(3)})}
    (R.switches||[]).forEach(d=>{const x=d.tx*T+8,y=(d.ty+1)*T;this.switches.push({x,y,s:this.add.image(x,y,'switch0').setOrigin(0.5,1).setDepth(4)})});
    if(this.blocks.length)this.applySwitch();
    // 고드름: 아래로 지나가면 흔들리다 떨어짐
    (R.icicles||[]).forEach(d=>{const x=d.tx*T+8,y=d.ty*T;this.icicles.push({x,y0:y,s:this.add.image(x,y,'icicle').setOrigin(0.5,0).setDepth(4),st:'hang',t:0,vy:0})});
    // 물: 맵 글자 '~'. 위에 반투명 물을 덮어 그림
    this.hasWater=m.some(r=>r.includes('~'));
    if(this.hasWater){const key='water_'+this.roomId;
      if(!this.textures.exists(key)){const[c,x]=cv(this.cols*T,LH);
        for(let ty=0;ty<ROWS;ty++)for(let tx=0;tx<this.cols;tx++)if(m[ty][tx]==='~'){const X=tx*T,Y=ty*T,top=ty===0||m[ty-1][tx]!=='~';
          px(x,'rgba(40,120,220,0.42)',X,Y,T,T);if(top){px(x,'rgba(200,240,255,0.9)',X,Y,T,1);px(x,'rgba(120,200,255,0.6)',X,Y+1,T,2)}}
        this.textures.addCanvas(key,c)}
      this.waterImg=this.add.image(0,0,key).setOrigin(0).setDepth(14);
      this.bubbleEm=this.add.particles(0,0,'px',{lifespan:900,speedY:{min:-40,max:-20},speedX:{min:-6,max:6},scale:{start:1,end:0.4},tint:0xcff4ff,alpha:{start:0.9,end:0},emitting:false}).setDepth(15)}
    this.inWater=false;this.onIce=R.theme==='ice';
  },
  giveKey(color,x,y){
    STATE.keys[color]=true;const K=KEYS[color];
    const icon=this.add.image(x,y,'icon_key_'+color).setDepth(46);
    this.tweens.add({targets:icon,y:y-24,duration:500,ease:'Back.easeOut'});
    this.time.delayedCall(1100,()=>this.tweens.add({targets:icon,x:this.player.x,y:this.player.y,alpha:0,duration:300,onComplete:()=>icon.destroy()}));
    this.banner('KEY!',0xffd34a);this.toast(K.name+'를 얻었다! 같은 색 문을 열 수 있어요',3200);
  },
  applySwitch(){
    this.blocks.forEach(b=>{const solid=(b.c==='A')!==this.swOn;b.z.body.enable=solid;b.img.setTexture('blk'+b.c+(solid?'1':'0'))});
    this.switches.forEach(s=>s.s.setTexture(this.swOn?'switch1':'switch0'));
  },
  /* 공격 판정이 스위치에 닿으면 전환 */
  hitSwitches(hb){
    if(this.swCd>0)return;
    for(const s of this.switches)if(Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(s.x-6,s.y-12,12,12))){
      this.swOn=!this.swOn;this.swCd=0.35;this.applySwitch();this.sparkEm.explode(8,s.x,s.y-8);this.shake(60,0.004);
      // 블록이 주인공과 겹치면 위로 밀어냄
      const p=this.player;this.blocks.forEach(b=>{if(b.z.body.enable&&Phaser.Geom.Intersects.RectangleToRectangle(new Phaser.Geom.Rectangle(p.body.x,p.body.y,p.body.width,p.body.height),new Phaser.Geom.Rectangle(b.z.x-8,b.z.y-8,16,16)))p.y=b.z.y-8-p.body.height/2-4});
      return}
  },
  /* 불덩이를 칼로 받아치면 사라짐 */
  slashShots(hb){this.shots.forEach(f=>{if(f.life>0&&Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(f.s.x-4,f.s.y-4,8,8))){f.life=0;this.sparkEm.explode(6,f.s.x,f.s.y)}})},
  updateGimmicks(dt){
    const p=this.player,pb=p.body;this.swCd-=dt;this.doorMsgT-=dt;
    // 문
    this.doors=this.doors.filter(o=>{
      const near=pb.right>o.rect.x-3&&pb.left<o.rect.right+3&&pb.bottom>o.rect.y-3&&pb.top<o.rect.bottom+3;if(!near)return true;
      const c=o.def.color;
      if(STATE.keys[c]){STATE.opened[o.def.id]=true;o.zones.forEach(z=>z.destroy());this.shake(80,0.006);
        o.imgs.forEach((im,i)=>this.tweens.add({targets:im,alpha:0,y:im.y-10,delay:i*40,duration:300,onComplete:()=>im.destroy()}));
        this.goldEm.explode(12,o.rect.centerX,o.rect.centerY);this.toast(KEYS[c].name+'로 문을 열었다!',2000);return false}
      if(this.doorMsgT<=0){this.toast(KEYS[c].name+'가 있어야 열 수 있는 문이에요',2000);this.doorMsgT=3}
      return true});
    // 포탑
    this.turrets.forEach(t=>{t.t+=dt;if(t.t>=t.rate){t.t=0;
      const s=this.add.image(t.x+t.dir[0]*9,t.y+t.dir[1]*9,'fireball').setDepth(12);this.shots.push({s,vx:t.dir[0]*95,vy:t.dir[1]*95,life:6})}});
    this.shots=this.shots.filter(f=>{f.life-=dt;f.s.x+=f.vx*dt;f.s.y+=f.vy*dt;f.s.rotation+=dt*8;
      const c=this.tileAt(f.s.x,f.s.y);if(c==='#'||(this.blocks.some(b=>b.z.body.enable&&Math.abs(b.z.x-f.s.x)<9&&Math.abs(b.z.y-f.s.y)<9)))f.life=0;
      if(f.life>0&&!p.dead&&Math.abs(p.x-f.s.x)<7&&Math.abs(p.y-f.s.y)<10){f.life=0;this.hurtBy(10,f.s.x,'enemy')}
      if(f.life<=0){this.sparkEm.explode(4,f.s.x,f.s.y);f.s.destroy();return false}return true});
    // 고드름
    this.icicles.forEach(c=>{
      if(c.st==='hang'){if(!p.dead&&Math.abs(p.x-c.x)<16&&p.y>c.y0&&p.y-c.y0<170){c.st='shake';c.t=0.45}}
      else if(c.st==='shake'){c.t-=dt;c.s.x=c.x+(Math.floor(c.t*40)%2?1:-1);if(c.t<=0){c.st='fall';c.s.x=c.x;c.vy=0}}
      else if(c.st==='fall'){c.vy+=700*dt;c.s.y+=c.vy*dt;
        if(!p.dead&&Math.abs(p.x-c.x)<8&&c.s.y+7>pb.top&&c.s.y<pb.bottom){this.hurtBy(14,c.x,'enemy');this.breakIcicle(c)}
        else if(this.tileAt(c.x,c.s.y+8)==='#'||c.s.y>LH)this.breakIcicle(c)}
      else if(c.st==='gone'){c.t-=dt;if(c.t<=0){c.st='hang';c.s.setPosition(c.x,c.y0).setAlpha(0).setVisible(true);this.tweens.add({targets:c.s,alpha:1,duration:400})}}});
    // 물
    if(this.hasWater){const w=this.tileAt(p.x,p.y)==='~';
      if(w!==this.inWater){this.inWater=w;this.bubbleEm.explode(8,p.x,p.y-4);pb.setGravityY(w?-560:0);if(w)p.setVelocityY(pb.velocity.y*0.35)}
      if(w&&Math.random()<dt*2.5)this.bubbleEm.explode(1,p.x+this.facing*3,p.y-6)}
  },
  breakIcicle(c){c.st='gone';c.t=4;c.s.setVisible(false);this.sparkEm.explode(8,c.x,c.s.y+4)}
};
