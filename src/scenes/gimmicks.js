/* 지형 장치: 열쇠·색깔 문, 불덩이 포탑, 스위치 블록, 물(헤엄), 얼음(미끄러짐), 고드름
   PlayScene에 섞어 씀 (Object.assign) */
import Phaser from 'phaser';
import {T,LH,ROWS} from '../config.js';
import {KEYS} from '../data/items.js';
import {STATE,bossDone} from '../state.js';
import {sfx} from '../sfx.js';
import {cv,px} from '../gfx/pixel.js';

export const Gimmicks={
  spawnGimmicks(){
    const R=this.R,m=this.map;
    Object.assign(this,{doors:[],turrets:[],shots:[],blocks:[],switches:[],icicles:[],swOn:false,swCd:0,swT:0,doorMsgT:0,gates:[],plates:[],torches:[]});
    // 철문: 누름판(plate) 또는 횃불(torches)로 열림. 횃불로 연 문은 계속 열려 있음
    (R.gates||[]).forEach(d=>{const o={def:d,imgs:[],zones:[],open:false,perm:!!STATE.opened[d.id]};
      for(let j=0;j<(d.h||3);j++){const x=d.tx*T+8,y=(d.ty+j)*T+8;o.imgs.push(this.add.image(x,y,'gate').setDepth(3));
        const z=this.add.zone(x,y,T,T);this.physics.add.existing(z,true);this.wallGroup.add(z);o.zones.push(z)}
      if(d.boss&&bossDone(d.boss)){o.perm=true}
      this.gates.push(o);if(o.perm)this.setGate(o,true,true)});
    (R.plates||[]).forEach(d=>{const x=d.tx*T+8,y=(d.ty+1)*T;this.plates.push({def:d,x,y,on:false,s:this.add.image(x,y,'plate0').setOrigin(0.5,1).setDepth(3)})});
    (R.torches||[]).forEach((d,i)=>{const key='torch_'+this.roomId+'_'+i,lit=!!STATE.opened[key],x=d.tx*T+8,y=(d.ty+1)*T;
      const s=this.add.image(x,y,lit?'torch1':'torch0').setOrigin(0.5,1).setDepth(3);
      const glow=this.add.image(x,y-9,'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff9a3a).setScale(0.5).setAlpha(lit?0.8:0).setDepth(2);
      this.torches.push({key,x,y,s,glow,lit,gate:d.gate})});
    // 나무 상자: 밀어서 누름판 위에 올려 둠
    this.crates=this.physics.add.group();
    (R.crates||[]).forEach(d=>{const c=this.crates.create(d.tx*T+8,(d.ty+1)*T-8,'crate');c.body.setSize(14,16).setOffset(1,0);
      // 얼음 방에서는 상자가 벽에 닿을 때까지 미끄러짐
      c.setDragX(R.theme==='ice'?20:900).setMaxVelocity(R.theme==='ice'?120:60,500).setDepth(4);c.body.mass=2;c.home={x:c.x,y:c.y}});
    this.physics.add.collider(this.crates,this.solids);this.physics.add.collider(this.crates,this.wallGroup);this.physics.add.collider(this.crates,this.crates);
    this.physics.add.collider(this.crates,this.oneways);this.physics.add.collider(this.crates,this.platGroup);
    this.physics.add.collider(this.player,this.crates,(pl,c)=>{
      // 얼음 방: 옆에서 밀면 상자가 쭉 미끄러짐
      if(R.theme==='ice'&&(c.body.touching.left||c.body.touching.right)&&Math.abs(c.body.velocity.x)<60)c.setVelocityX(Math.sign(c.x-pl.x)*115)},()=>!this.climbing);
    // 색깔 문: 같은 색 열쇠가 있으면 닿기만 해도 열림
    (R.doors||[]).forEach(d=>{
      if(STATE.opened[d.id])return;const w=d.w||1,h=d.h||3,o={def:d,imgs:[],zones:[],rect:new Phaser.Geom.Rectangle(d.tx*T,d.ty*T,w*T,h*T)};
      for(let i=0;i<w;i++)for(let j=0;j<h;j++){const x=(d.tx+i)*T+8,y=(d.ty+j)*T+8;o.imgs.push(this.add.image(x,y,'door_'+d.color).setDepth(3));
        const z=this.add.zone(x,y,T,T);this.physics.add.existing(z,true);this.wallGroup.add(z);o.zones.push(z)}
      this.doors.push(o)});
    // 포탑: dir 방향으로 rate초마다 불덩이 발사
    (R.turrets||[]).forEach(d=>{const x=d.tx*T+8,y=d.ty*T+8,dir={l:[-1,0],r:[1,0],u:[0,-1],d:[0,1]}[d.dir||'l'];
      const s=this.add.image(x,y,'turret').setDepth(3).setAngle({l:0,r:180,u:90,d:-90}[d.dir||'l']);
      this.turrets.push({def:d,x,y,dir,s,t:d.offset||0,rate:(d.rate||2.2)*0.8})});
    // 스위치 블록: 맵 글자 A(빨강) / B(파랑). 스위치를 치면 서로 바뀜
    for(let ty=0;ty<ROWS;ty++)for(let tx=0;tx<this.cols;tx++){const c=m[ty][tx];if(c!=='A'&&c!=='B')continue;
      const x=tx*T+8,y=ty*T+8,z=this.add.zone(x,y,T,T);this.physics.add.existing(z,true);this.wallGroup.add(z);
      this.blocks.push({c,z,img:this.add.image(x,y,'blk'+c+'1').setDepth(3)})}
    (R.switches||[]).forEach(d=>{const x=d.tx*T+8,y=(d.ty+1)*T;this.switches.push({def:d,x,y,s:this.add.image(x,y,'switch0').setOrigin(0.5,1).setDepth(4)})});
    this.swTxt=this.add.bitmapText(0,0,'dmg','').setOrigin(0.5,1).setDepth(46).setTint(0xffe27a).setVisible(false);
    if(this.blocks.length)this.applySwitch();
    // 고드름: 아래로 지나가면 흔들리다 떨어짐
    (R.icicles||[]).forEach(d=>{const x=d.tx*T+8,y=d.ty*T;this.icicles.push({x,y0:y,s:this.add.image(x,y,'icicle').setOrigin(0.5,0).setDepth(4),st:'hang',t:0,vy:0})});
    // 화염 분출구: period초마다 잠깐 경고 후 불기둥
    this.geysers=(R.geysers||[]).map(d=>{const x=d.tx*T+8,y=d.ty*T;
      const fl=this.add.image(x,y,'geyser').setOrigin(0.5,1).setDepth(13).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
      return{x,y,fl,t:d.offset||0,period:d.period||3}});
    // 용암: 위에 일렁이는 빛을 덮음
    if(m.some(r=>r.includes('L'))){const key='lavaglow_'+this.roomId;
      if(!this.textures.exists(key)){const[c,x]=cv(this.cols*T,LH);for(let ty=0;ty<ROWS;ty++)for(let tx=0;tx<this.cols;tx++)if(m[ty][tx]==='L'){
        px(x,'rgba(255,120,40,0.35)',tx*T,ty*T,T,T);if(ty>0&&m[ty-1][tx]!=='L'&&m[ty-1][tx]!=='#'){px(x,'rgba(255,140,60,0.22)',tx*T,ty*T-10,T,10);px(x,'rgba(255,140,60,0.12)',tx*T,ty*T-20,T,10)}}
        this.textures.addCanvas(key,c)}
      const gl=this.add.image(0,0,key).setOrigin(0).setDepth(13).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:gl,alpha:{from:0.6,to:1},duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})}
    this.inSand=false;this.sandT=0;
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
    // 숨 게이지: 머리까지 물에 잠기면 줄고, 물 밖에 나오면 금방 다시 참
    this.breath=1;this.drownT=0;this.breathG=this.add.graphics().setDepth(47);
  },
  giveKey(color,x,y){
    STATE.keys[color]=true;const K=KEYS[color];
    const icon=this.add.image(x,y,'icon_key_'+color).setDepth(46);
    this.tweens.add({targets:icon,y:y-24,duration:500,ease:'Back.easeOut'});
    this.time.delayedCall(1100,()=>this.tweens.add({targets:icon,x:this.player.x,y:this.player.y,alpha:0,duration:300,onComplete:()=>icon.destroy()}));
    this.banner('KEY!',0xffd34a);this.toast(K.name+'를 얻었다! 같은 색 문을 열 수 있어요',3200);
  },
  setGate(o,open,instant){if(o.open===open)return;o.open=open;if(!instant)sfx('gate');o.zones.forEach(z=>z.body.enable=!open);
    o.imgs.forEach((im,j)=>{const y0=(o.def.ty+j)*T+8;this.tweens.killTweensOf(im);
      if(instant){im.y=open?y0-12:y0;im.setAlpha(open?0:1);return}
      this.tweens.add({targets:im,y:open?y0-12:y0,alpha:open?0:1,duration:220})});
    if(!instant){this.shake(50,0.003);this.dustEm.explode(4,o.def.tx*T+8,(o.def.ty+(o.def.h||3))*T)}},
  applySwitch(){
    this.blocks.forEach(b=>{const solid=(b.c==='A')!==this.swOn;b.z.body.enable=solid;b.img.setTexture('blk'+b.c+(solid?'1':'0'))});
    this.switches.forEach(s=>s.s.setTexture(this.swOn?'switch1':'switch0'));
  },
  /* 공격 판정이 스위치에 닿으면 전환 */
  hitSwitches(hb){
    // 상자를 3번 치면 부서지고 처음 자리에 다시 나타남 (잘못 밀었을 때 되돌리기)
    const now=this.time.now;
    this.crates.getChildren().forEach(c=>{if(now-(c.lastHit||0)<200)return;const b=c.body;
      if(!Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(b.x,b.y,b.width,b.height)))return;
      c.lastHit=now;c.hp=(c.hp==null?3:c.hp)-1;c.setTintFill(0xffffff);this.time.delayedCall(60,()=>c.active&&c.clearTint());this.rockEm.explode(4,c.x,c.y);
      if(c.hp<=0){c.hp=3;this.rockEm.explode(12,c.x,c.y);c.setPosition(c.home.x,c.home.y);c.setVelocity(0,0);c.setAlpha(0);this.tweens.add({targets:c,alpha:1,duration:400});this.toast('상자가 처음 자리로 돌아갔어요',1500)}});
    if(this.swCd>0)return;
    // 횃불: 치면 켜짐, 같은 문의 횃불이 다 켜지면 문이 열림
    this.torches.forEach(t=>{if(t.lit||!Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(t.x-5,t.y-14,10,14)))return;
      t.lit=true;STATE.opened[t.key]=true;t.s.setTexture('torch1');t.glow.setAlpha(0.8);this.fireEm.explode(10,t.x,t.y-10);
      const same=this.torches.filter(o=>o.gate===t.gate),left=same.filter(o=>!o.lit).length;
      if(left)this.toast('남은 횃불 '+left+'개',1400);
      else{const g=this.gates.find(o=>o.def.id===t.gate);if(g){STATE.opened[g.def.id]=true;g.perm=true;this.setGate(g,true);this.toast('횃불이 모두 켜지자 철문이 열렸다!',2200)}}});
    for(const s of this.switches)if(Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(s.x-6,s.y-12,12,12))){
      this.swOn=!this.swOn;this.swCd=0.35;this.applySwitch();
      // 시간 스위치: 정해진 초가 지나면 원래대로
      const tm=this.switches.find(o=>o.def&&o.def.timer);if(tm&&this.swOn){this.swT=tm.def.timer;this.toast(tm.def.timer+'초 안에 지나가세요!',1600)}else this.swT=0;this.sparkEm.explode(8,s.x,s.y-8);this.shake(60,0.004);
      // 블록이 주인공과 겹치면 위로 밀어냄
      const p=this.player;this.blocks.forEach(b=>{if(b.z.body.enable&&Phaser.Geom.Intersects.RectangleToRectangle(new Phaser.Geom.Rectangle(p.body.x,p.body.y,p.body.width,p.body.height),new Phaser.Geom.Rectangle(b.z.x-8,b.z.y-8,16,16)))p.y=b.z.y-8-p.body.height/2-4});
      return}
  },
  /* 불덩이를 칼로 받아치면 사라짐 */
  slashShots(hb){this.shots.forEach(f=>{if(f.life>0&&Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(f.s.x-4,f.s.y-4,8,8))){f.life=0;this.sparkEm.explode(6,f.s.x,f.s.y)}})},
  updateGimmicks(dt){
    const p=this.player,pb=p.body;this.swCd-=dt;this.doorMsgT-=dt;
    // 시간 스위치 카운트다운
    if(this.swT>0){this.swT-=dt;const tm=this.switches.find(o=>o.def&&o.def.timer);
      this.swTxt.setVisible(true).setText(String(Math.ceil(this.swT))).setPosition(tm.x,tm.y-16);
      if(this.swT<=0){this.swOn=false;this.applySwitch();this.swTxt.setVisible(false);const pr=new Phaser.Geom.Rectangle(pb.x,pb.y,pb.width,pb.height);
        this.blocks.forEach(b=>{if(b.z.body.enable&&Phaser.Geom.Intersects.RectangleToRectangle(pr,new Phaser.Geom.Rectangle(b.z.x-8,b.z.y-8,16,16)))p.y=b.z.y-8-pb.height/2-4})}}
    // 누름판: 주인공이나 상자가 올라가 있으면 눌림 → 연결된 철문이 열림
    this.plates.forEach(pl=>{const on=[p,...this.crates.getChildren()].some(o=>{const b=o.body;return b.right>pl.x-7&&b.left<pl.x+7&&Math.abs(b.bottom-(pl.y-2))<5});
      if(on!==pl.on){pl.on=on;pl.s.setTexture(on?'plate1':'plate0')}});
    this.gates.forEach(g=>{if(g.perm)return;const ps=this.plates.filter(pl=>pl.def.gate===g.def.id);if(!ps.length)return;
      const open=ps.every(pl=>pl.on);
      // 한 번 열리면 계속 열려 있음 (방을 나갔다 오면 상자가 제자리로 돌아가서 갇히지 않게)
      if(open&&!ps.some(pl=>pl.def.latch===false)){g.perm=true;STATE.opened[g.def.id]=true}
      this.setGate(g,open)});
    // 철문 안쪽(누름판·횃불 반대편)에서 다가가면 빗장을 풀고 열 수 있음
    this.gates.forEach(g=>{if(g.perm||g.def.boss)return;
      const xs=[...this.plates.filter(pl=>pl.def.gate===g.def.id).map(pl=>pl.x),...this.torches.filter(t=>t.gate===g.def.id).map(t=>t.x)];if(!xs.length)return;
      const gx=g.def.tx*T+8,side=Math.sign(xs.reduce((a,b)=>a+b,0)/xs.length-gx),ps=Math.sign(p.x-gx);
      const top=g.def.ty*T,bot=(g.def.ty+(g.def.h||3))*T;
      if(ps!==side&&Math.abs(p.x-gx)<17&&pb.bottom>top+2&&pb.top<bot-2){g.perm=true;STATE.opened[g.def.id]=true;this.setGate(g,true);this.toast('안쪽에서 빗장을 풀었다',1600)}});
    // 상자가 가시·구덩이에 빠지면 제자리로
    this.crates.getChildren().forEach(c=>{if(c.y>LH+20||c.x<-12||c.x>this.lw+12||this.tileAt(c.x,c.y)==='L'||this.tileAt(c.x,c.body.bottom-2)==='^'){c.setPosition(c.home.x,c.home.y);c.setVelocity(0,0);this.dustEm.explode(6,c.x,c.y)}});
    // 문
    this.doors=this.doors.filter(o=>{
      const near=pb.right>o.rect.x-3&&pb.left<o.rect.right+3&&pb.bottom>o.rect.y-3&&pb.top<o.rect.bottom+3;if(!near)return true;
      const c=o.def.color;
      if(STATE.keys[c]){STATE.opened[o.def.id]=true;o.zones.forEach(z=>z.destroy());this.shake(80,0.006);sfx('door');
        o.imgs.forEach((im,i)=>this.tweens.add({targets:im,alpha:0,y:im.y-10,delay:i*40,duration:300,onComplete:()=>im.destroy()}));
        this.goldEm.explode(12,o.rect.centerX,o.rect.centerY);this.toast(KEYS[c].name+'로 문을 열었다!',2000);return false}
      if(this.doorMsgT<=0){this.toast(KEYS[c].name+'가 있어야 열 수 있는 문이에요',2000);this.doorMsgT=3}
      return true});
    // 포탑
    this.turrets.forEach(t=>{t.t+=dt;if(t.t>=t.rate){t.t=0;
      const s=this.add.image(t.x+t.dir[0]*9,t.y+t.dir[1]*9,'fireball').setDepth(12);this.shots.push({s,vx:t.dir[0]*120,vy:t.dir[1]*120,life:6})}});
    this.shots=this.shots.filter(f=>{f.life-=dt;f.s.x+=f.vx*dt;f.s.y+=f.vy*dt;f.s.rotation+=dt*8;
      const c=this.tileAt(f.s.x,f.s.y);if(c==='#'||(this.blocks.some(b=>b.z.body.enable&&Math.abs(b.z.x-f.s.x)<9&&Math.abs(b.z.y-f.s.y)<9)))f.life=0;
      if(f.life>0&&!p.dead&&Math.abs(p.x-f.s.x)<7&&Math.abs(p.y-f.s.y)<10){f.life=0;this.hurtBy(this.trap(14),f.s.x,'enemy')}
      if(f.life<=0){this.sparkEm.explode(4,f.s.x,f.s.y);f.s.destroy();return false}return true});
    // 고드름
    this.icicles.forEach(c=>{
      if(c.st==='hang'){if(!p.dead&&Math.abs(p.x-c.x)<16&&p.y>c.y0&&p.y-c.y0<170){c.st='shake';c.t=0.45}}
      else if(c.st==='shake'){c.t-=dt;c.s.x=c.x+(Math.floor(c.t*40)%2?1:-1);if(c.t<=0){c.st='fall';c.s.x=c.x;c.vy=0}}
      else if(c.st==='fall'){c.vy+=700*dt;c.s.y+=c.vy*dt;
        if(!p.dead&&Math.abs(p.x-c.x)<8&&c.s.y+7>pb.top&&c.s.y<pb.bottom){this.hurtBy(this.trap(16),c.x,'enemy');this.breakIcicle(c)}
        else if(this.tileAt(c.x,c.s.y+8)==='#'||c.s.y>LH)this.breakIcicle(c)}
      else if(c.st==='gone'){c.t-=dt;if(c.t<=0){c.st='hang';c.s.setPosition(c.x,c.y0).setAlpha(0).setVisible(true);this.tweens.add({targets:c.s,alpha:1,duration:400})}}});
    // 물
    if(this.hasWater){const w=this.tileAt(p.x,p.y)==='~';
      if(w!==this.inWater){this.inWater=w;this.bubbleEm.explode(8,p.x,p.y-4);pb.setGravityY(w?-560:0);if(w)p.setVelocityY(pb.velocity.y*0.35)}
      if(w&&Math.random()<dt*2.5)this.bubbleEm.explode(1,p.x+this.facing*3,p.y-6);
      const under=this.tileAt(p.x,p.y-6)==='~';
      if(under&&!p.dead){this.breath=Math.max(0,this.breath-dt/8);
        if(this.breath<=0){this.drownT-=dt;if(this.drownT<=0){this.drownT=1;const s=this.stats,d=this.trap(8);s.hp=Math.max(0,s.hp-d);
          this.popNum(p.x,p.y-12,d,0x8ab0ff,false);p.setTintFill(0x6a9aff);this.time.delayedCall(90,()=>{if(!p.dead)p.clearTint()});if(s.hp<=0)this.die();else if(this.breathMsg!==1){this.breathMsg=1;this.toast('숨이 막혀요! 물 밖으로 나가세요',1800)}}}}
      else{this.breath=Math.min(1,this.breath+dt*1.2);this.drownT=0;this.breathMsg=0}}
    // 숨 방울: 숨이 줄었을 때만 머리 위에 표시 (5칸)
    if(this.breathG){const g=this.breathG;g.clear();
      if(this.hasWater&&this.breath<1&&!p.dead){const n=Math.ceil(this.breath*5),x0=p.x-12,y0=p.y-22,low=this.breath<0.3&&Math.floor(this.time.now/150)%2;
        for(let i=0;i<5;i++){const on=i<n;g.fillStyle(0x0f0b1e,0.7).fillCircle(x0+i*6,y0,3);g.fillStyle(on?(low?0xff8a95:0xcff4ff):0x3a4a6a,1).fillCircle(x0+i*6,y0,2);if(on)g.fillStyle(0xffffff,1).fillRect(x0+i*6-1,y0-1,1,1)}}}
  },
  openBossGates(id){this.gates.forEach(g=>{if(g.def.boss===id){g.perm=true;STATE.opened[g.def.id]=true;this.setGate(g,true)}})},
  /* 용암·유사·분출구 (매 프레임) */
  updateHazards(dt){
    const p=this.player,pb=p.body;if(p.dead)return;
    // 용암: 닿으면 크게 데이며 위로 튕겨 오름
    if(p.inv<=0&&(this.tileAt(p.x,pb.bottom-2)==='L'||this.tileAt(p.x,p.y)==='L')){
      const d=Math.round(this.trap(26)*(this.bonus.fireRes?0.5:1));this.hurtBy(d,p.x-this.facing*10,'lava');
      if(!p.dead){p.setVelocity(-this.facing*60,-420);this.fireEm.explode(14,p.x,pb.bottom)}}
    // 유사: 천천히 가라앉고 움직임이 느려짐, 머리까지 잠기면 숨 막힘. 모래 장화가 있으면 위를 걸음
    const inS=this.tileAt(p.x,pb.bottom-3)==='S'&&!this.climbing;
    if(inS!==this.inSand){this.inSand=inS;pb.setGravityY(inS&&!this.bonus.noSand?-740:0);if(inS)this.dustEm.explode(5,p.x,pb.bottom)}
    if(inS){
      if(this.bonus.noSand){const tx=Math.floor(p.x/T);let ty=Math.floor((pb.bottom-3)/T);while(ty>0&&this.map[ty-1][tx]==='S')ty--;const top=ty*T;
        if(pb.bottom>top){p.y-=pb.bottom-top;if(pb.velocity.y>0)p.setVelocityY(0);this.coyote=0.09;this.airJumps=0}}
      else{if(pb.velocity.y>20)p.setVelocityY(20);if(Math.random()<dt*6)this.dustEm.explode(1,p.x,pb.bottom-4);
        if(this.tileAt(p.x,p.y-6)==='S'){this.sandT-=dt;if(this.sandT<=0){this.sandT=0.8;const s=this.stats,d=this.trap(6);s.hp=Math.max(0,s.hp-d);this.popNum(p.x,p.y-12,d,0xe0b070,false);if(s.hp<=0)this.die()}}}}
    // 분출구
    this.geysers.forEach(g=>{g.t+=dt;const ph=g.t%g.period,warn=ph>g.period-1.4&&ph<=g.period-0.9,fire=ph>g.period-0.9;
      if(warn&&Math.random()<dt*20)this.fireEm.explode(1,g.x+(Math.random()-.5)*8,g.y-2);
      g.fl.setVisible(fire);if(fire){g.fl.setScale(0.8+Math.random()*0.4,Math.min(1,(ph-(g.period-0.9))*8));
        if(p.inv<=0&&Math.abs(p.x-g.x)<7&&pb.bottom>g.y-46&&pb.top<g.y)this.hurtBy(this.trap(20),g.x,'enemy')}});
  },
  breakIcicle(c){c.st='gone';c.t=4;c.s.setVisible(false);this.sparkEm.explode(8,c.x,c.s.y+4)}
};
