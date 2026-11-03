import Phaser from 'phaser';
import {W,H,T,HUD,COLS,ROWS,LW,LH,SPEED,JUMP,VP} from '../config.js';
import {rng,cv,px,archFill} from '../gfx/pixel.js';
import {buildTextures} from '../gfx/sprites.js';
import {buildFonts} from '../gfx/fonts.js';
import {HERO_W,HERO_H,HERO_FRAMES,GEAR,LOOK,drawHero} from '../gfx/hero.js';
import {buildMap,SPAWNS,TORCHES} from '../world/map.js';
import {calcZoom} from '../zoom.js';

export class PlayScene extends Phaser.Scene{
  constructor(){super('play')}
  create(){
    buildTextures(this);buildFonts(this);
    this.map=buildMap();this.drawWorld();this.makeAnims();
    this.solids=[];this.oneways=[];this.buildCollision();
    this.stats={lv:1,hp:60,maxHp:60,mp:30,maxMp:30,exp:0,next:20,atk:8};
    this.gear=0;this.redrawHero();
    const p=this.player=this.physics.add.sprite(3*T,10*T,'hero_idle0');
    p.body.setSize(8,18).setOffset(9,6);
    this.sword=this.add.image(0,0,'sword0').setDepth(11).setVisible(false);p.setDepth(10).setCollideWorldBounds(true);
    Object.assign(p,{inv:0,hurtT:0,dropT:0,dead:false});
    this.facing=1;this.coyote=0;this.jumpBuf=0;this.wasOnG=false;this.prevVy=0;this.skillCd=0;this.castT=0;
    this.lastAtkEnd=-1e9;this.lastStep=0;this.move=0;
    this.atk={active:false,step:0,t:0,queued:false,hit:new Set(),dur:0,on:[0,0],f:1};
    this.physics.world.setBounds(0,0,LW,LH);
    this.physics.add.collider(p,this.solids);
    this.physics.add.collider(p,this.oneways,null,()=>p.dropT<=0);
    this.enemies=this.physics.add.group();
    this.physics.add.collider(this.enemies,this.solids);this.physics.add.collider(this.enemies,this.oneways);
    this.hearts=this.physics.add.group();
    this.physics.add.collider(this.hearts,this.solids);this.physics.add.collider(this.hearts,this.oneways);
    this.physics.add.overlap(p,this.hearts,(pl,h)=>{const s=this.stats;const v=Math.min(20,s.maxHp-s.hp);s.hp+=v;this.popText(h.x,h.y-6,'+'+20,0x7cff8a);this.goldEm.explode(6,h.x,h.y);h.destroy()});
    SPAWNS.forEach(d=>this.spawnEnemy(d));
    this.waves=[];
    const mk=(tint,extra={})=>this.add.particles(0,0,'px',Object.assign({lifespan:{min:250,max:600},speed:{min:40,max:140},angle:{min:0,max:360},gravityY:380,scale:{start:1,end:0},tint,emitting:false},extra)).setDepth(40);
    this.sparkEm=mk([0xffffff,0x9fe8ff,0xffe27a],{speed:{min:60,max:160},lifespan:{min:120,max:300}});
    this.slimeEm=mk([0x5fcf5a,0x2f8a3a,0xe8ffe0]);
    this.kingEm=mk([0x5a8cff,0x2f4fb0,0xf0c040,0xe0ecff],{speed:{min:60,max:200}});
    this.goldEm=mk([0xffd34a,0xfff2a0,0xe8742a],{gravityY:-60,speed:{min:20,max:90}});
    this.dustEm=mk([0x8f86ab,0x5a5078],{speed:{min:10,max:45},angle:{min:190,max:350},gravityY:-30,lifespan:{min:200,max:380}});
    const cam=this.cameras.main;cam.setBounds(0,0,LW,LH+HUD);cam.startFollow(p,true,0.12,0.12);cam.setDeadzone(40,28);cam.roundPixels=true;
    this.auraEm=mk([0x9ff0ff,0xffd34a,0xffffff],{speed:{min:4,max:18},gravityY:-50,lifespan:{min:300,max:600}});
    this.keys=this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,Z,X,C,SPACE,A,D,W,S,J,K,L,ZERO,ONE,TWO,THREE');
    this.keys.ZERO.on('down',()=>this.setGear(0));this.keys.ONE.on('down',()=>this.setGear(1));this.keys.TWO.on('down',()=>this.setGear(2));this.keys.THREE.on('down',()=>this.setGear(3));
    this.buildHud();
    this.combo=0;this.comboT=0;this.tInfo=null;this.targetT=0;this.hpGhost=60;this.tGhost=0;
    this.prev={};this.pend={};this.frozen=false;
  }

  /* ----- world drawing ----- */
  drawWorld(){
    const r=rng(7),m=this.map;
    // far layer
    const FW=Math.ceil(W+(LW-W)*0.15)+4,FH=Math.ceil(H+(LH+HUD-H)*0.15)+4;
    let[c,x]=cv(FW,FH);
    for(let y=0;y<FH;y+=6){const t=y/FH;px(x,`rgb(${13+t*17|0},${10+t*12|0},${26+t*26|0})`,0,y,FW,6)}
    for(let i=0;i<7;i++){const cx=i*78+20;archFill(x,'#1c1534',cx,34,24,FH);archFill(x,'#0a0716',cx,38,20,FH)}
    for(let i=0;i<60;i++)px(x,'#2e2450',r()*FW|0,r()*FH|0);
    this.textures.addCanvas('bg_far',c);
    this.add.image(0,0,'bg_far').setOrigin(0).setScrollFactor(0.15).setDepth(-10);
    // mid layer
    const MW=Math.ceil(W+(LW-W)*0.4)+4,MH=Math.ceil(H+(LH+HUD-H)*0.4)+4;
    [c,x]=cv(MW,MH);
    const glass=['#3a5fb0','#a83a6a','#c99a30','#2f8a6a'];
    for(let i=0;i*120<MW+120;i++){
      const X=i*120,cx=X+69;
      // wall panel + stained glass window
      archFill(x,'#211a37',cx,26,26,MH-24);
      archFill(x,'#3b3162',cx,46,13,124);
      for(let y=48;y<122;y++)for(let gx=-10;gx<10;gx++){
        const dy=y-48;if(dy<11){const hw=Math.sqrt(121-(11-dy)*(11-dy));if(Math.abs(gx+0.5)>hw)continue}
        const lead=((gx+10)%5===0)||(dy%6===0);
        px(x,lead?'#120d20':glass[(((gx+10)/5|0)+(dy/6|0))%4],cx+gx,y)}
      for(let y=124;y<MH-24;y++){x.fillStyle='rgba(255,220,160,0.05)';const sp=(y-124)/3|0;x.fillRect(cx-9-sp,y,18+sp*2,1)}
      // chandelier on alternate bays
      if(i%2===1){px(x,'#8a7030',cx,0,1,14);px(x,'#c9a24a',cx-11,15,23,2);px(x,'#8a7030',cx-8,17,17,1);
        for(const o of[-10,-5,0,5,10]){px(x,'#e8e0d0',cx+o,11,1,4);px(x,'#ffd060',cx+o,9,1,2)}
        x.fillStyle='rgba(255,200,110,0.06)';x.fillRect(cx-20,2,41,24)}
      // pillar
      px(x,'#2b2346',X,0,18,MH);px(x,'#3b3162',X,0,2,MH);px(x,'#1a1430',X+16,0,2,MH);px(x,'#231c3c',X+8,0,1,MH);
      px(x,'#3b3162',X-3,18,24,6);px(x,'#4d4280',X-3,18,24,1);px(x,'#3b3162',X-3,MH-34,24,6);px(x,'#4d4280',X-3,MH-34,24,1);
    }
    this.textures.addCanvas('bg_mid',c);
    this.add.image(0,0,'bg_mid').setOrigin(0).setScrollFactor(0.4).setDepth(-9);
    // level tiles
    [c,x]=cv(LW,LH);
    const at=(tx,ty)=>(ty<0||ty>=ROWS||tx<0||tx>=COLS)?'#':m[ty][tx];
    for(let ty=0;ty<ROWS;ty++)for(let tx=0;tx<COLS;tx++){
      const ch=m[ty][tx],X=tx*T,Y=ty*T;
      if(ch==='#'){
        const e={t:at(tx,ty-1)!=='#',b:at(tx,ty+1)!=='#',l:at(tx-1,ty)!=='#',rt:at(tx+1,ty)!=='#'};
        const deep=!e.t&&!e.b&&!e.l&&!e.rt;
        const base=deep?'#2a2340':'#3b3354',mort=deep?'#1e1930':'#272039',hi=deep?'#332b4c':'#4d4468';
        px(x,base,X,Y,16,16);px(x,hi,X,Y,16,1);px(x,hi,X,Y+8,16,1);px(x,mort,X,Y+7,16,1);px(x,mort,X,Y+15,16,1);
        px(x,mort,X+7,Y,1,7);px(x,mort,X+15,Y,1,7);px(x,mort,X+3,Y+8,1,7);px(x,mort,X+11,Y+8,1,7);
        for(let k=0;k<3;k++)px(x,deep?'#241e38':'#322b49',X+(r()*16|0),Y+(r()*16|0));
        if(e.l)px(x,'#1a1528',X,Y,1,16);if(e.rt)px(x,'#1a1528',X+15,Y,1,16);if(e.b)px(x,'#1a1528',X,Y+15,16,1);
        if(e.t){px(x,'#7cc456',X,Y,16,1);px(x,'#4f9a3a',X,Y+1,16,1);
          for(let k=0;k<16;k++){if(r()<.45)px(x,'#3c7a2e',X+k,Y+2,1,1+(r()*3|0));if(r()<.25)px(x,'#b5ec82',X+k,Y);if(r()<.18)px(x,'#7cc456',X+k,Y-1-(r()*2|0),1,1)}}
      }else if(ch==='-'){
        px(x,'#d89a58',X,Y,16,1);px(x,'#9a6236',X,Y+1,16,3);px(x,'#6a3e22',X,Y+4,16,1);px(x,'#2a1a12',X,Y+5,16,1);
        px(x,'#6a3e22',X+8,Y+1,1,3);px(x,'#e8d0a0',X+2,Y+2);px(x,'#e8d0a0',X+13,Y+2);
        if(at(tx-1,ty)!=='-'){px(x,'#5a3a22',X+1,Y+6,2,5);px(x,'#5a3a22',X+3,Y+6,3,1)}
        if(at(tx+1,ty)!=='-'){px(x,'#5a3a22',X+13,Y+6,2,5);px(x,'#5a3a22',X+10,Y+6,3,1)}
      }
    }
    this.textures.addCanvas('level',c);
    this.add.image(0,0,'level').setOrigin(0).setDepth(0);
    // torches
    TORCHES.forEach(([tx,ty])=>{const X=tx*T+8,Y=ty*T+8;
      const g=this.add.image(X,Y-2,'glow').setBlendMode(Phaser.BlendModes.ADD).setDepth(-5);
      this.tweens.add({targets:g,alpha:{from:.75,to:1},scale:{from:.95,to:1.05},duration:180+Math.random()*120,yoyo:true,repeat:-1});
      this.add.image(X,Y+6,'torch').setDepth(1);
      this.flames=this.flames||[];this.flames.push([X,Y-1]);});
  }
  makeAnims(){
    const mk=(key,frames,rate)=>{if(!this.anims.exists(key))this.anims.create({key,frames:frames.map(f=>({key:f})),frameRate:rate,repeat:-1})};
    mk('hero_idle',['hero_idle0','hero_idle1'],2.5);mk('hero_run',['hero_run0','hero_idle0','hero_run1','hero_idle0'],10);
    mk('slime_idle',['slime0','slime1'],3);mk('king_idle',['kslime0','kslime1'],2.5);mk('flame',['flame0','flame1','flame2'],8);
    (this.flames||[]).forEach(([X,Y])=>this.add.sprite(X,Y,'flame0').setDepth(2).play({key:'flame',startFrame:Math.random()*3|0}));
  }
  buildCollision(){
    const m=this.map,rects=[];let prev=[];
    for(let y=0;y<ROWS;y++){const runs=[];let x=0;
      while(x<COLS){if(m[y][x]==='#'){const s=x;while(x<COLS&&m[y][x]==='#')x++;runs.push({x:s,w:x-s,y,h:1})}else x++}
      const cur=[];for(const r of runs){const p=prev.find(q=>q.x===r.x&&q.w===r.w);if(p){p.h++;cur.push(p)}else{rects.push(r);cur.push(r)}}prev=cur}
    rects.forEach(r=>{const z=this.add.zone(r.x*T+r.w*T/2,r.y*T+r.h*T/2,r.w*T,r.h*T);this.physics.add.existing(z,true);this.solids.push(z)});
    for(let y=0;y<ROWS;y++){let x=0;while(x<COLS){if(m[y][x]==='-'){const s=x;while(x<COLS&&m[y][x]==='-')x++;
      const z=this.add.zone((s+x)*T/2,y*T+3,(x-s)*T,6);this.physics.add.existing(z,true);
      z.body.checkCollision.down=false;z.body.checkCollision.left=false;z.body.checkCollision.right=false;this.oneways.push(z)}else x++}}
  }
  updateSword(){
    const p=this.player,a=this.atk,on=!p.dead&&p.hurtT<=0&&(a.active||this.castT>0);
    this.sword.setVisible(on);if(!on)return;
    const f=a.active?a.f:this.facing;
    this.sword.setPosition(p.x+f*7,p.y+3).setFlipX(f<0).setOrigin(f>0?0.07:0.93,0.5);
  }
  redrawHero(){
    for(const f in HERO_FRAMES){const t=this.textures.get('hero_'+f),c=t.getContext();c.clearRect(0,0,HERO_W,HERO_H);drawHero(c,f,LOOK,this.gear);t.refresh()}
    if(this.sword)this.sword.setTexture('sword'+this.gear);
  }
  atkVal(){return this.stats.atk+GEAR[this.gear].atk}
  setGear(n){
    if(n===this.gear||!GEAR[n])return;
    this.gear=n;this.redrawHero();const p=this.player;
    p.setTintFill(0xffffff);this.time.delayedCall(90,()=>{if(!p.dead)p.clearTint()});
    this.goldEm.explode(20,p.x,p.y);this.auraEm.explode(14,p.x,p.y);
    this.banner('GEAR '+n,n===3?0x9ff0ff:0xffd34a);
    if(window.onGearChange)window.onGearChange(n);
  }
  tileAt(X,Y){const tx=Math.floor(X/T),ty=Math.floor(Y/T);if(ty<0||ty>=ROWS||tx<0||tx>=COLS)return'#';return this.map[ty][tx]}

  /* ----- HUD ----- */
  buildHud(){
    const y0=H-HUD,fix=o=>o.setScrollFactor(0).setDepth(100);
    this.hud=fix(this.add.graphics());
    fix(this.add.bitmapText(5,y0+3,'pix','LV')).setTint(0xe8c04a);
    this.lvTxt=fix(this.add.bitmapText(5,y0+8,'dmg','1')).setLetterSpacing(-2);
    fix(this.add.bitmapText(26,y0+4,'pix','HP')).setTint(0xff8a95);
    fix(this.add.bitmapText(26,y0+12,'pix','MP')).setTint(0x8ab0ff);
    this.hpTxt=fix(this.add.bitmapText(114,y0+4,'pix',''));
    this.mpTxt=fix(this.add.bitmapText(114,y0+12,'pix',''));
    const res=Math.max(1,Math.ceil(calcZoom()));
    this.nameTxt=fix(this.add.text(164,y0+2,'',{fontFamily:'"IBM Plex Sans KR", system-ui, sans-serif',fontSize:'9px',fontStyle:'600',color:'#ece7f7'})).setResolution(res).setVisible(false);
    this.hintTxt=fix(this.add.text(164,y0+6,'적을 때리면 이름과 HP가 떠요',{fontFamily:'"IBM Plex Sans KR", system-ui, sans-serif',fontSize:'8px',color:'#8f86ab'})).setResolution(res);
    this.tHpTxt=fix(this.add.bitmapText(266,y0+14,'pix','')).setVisible(false);
    this.comboTxt=this.add.bitmapText(8,8,'dmg','').setScrollFactor(0).setDepth(110).setTint(0xffd34a).setLetterSpacing(-2).setVisible(false);
  }
  setTextRes(z){const r=Math.max(1,Math.ceil(z));this.nameTxt.setResolution(r);this.hintTxt.setResolution(r)}
  bar(g,x,y,w,h,v,ghost,col,hi){
    g.fillStyle(0x05030b,1).fillRect(x-1,y-1,w+2,h+2);g.fillStyle(0x1d1430,1).fillRect(x,y,w,h);
    if(ghost>v){g.fillStyle(0xfff0f0,1).fillRect(x,y,Math.round(w*ghost),h)}
    const fw=Math.round(w*Math.max(0,v));g.fillStyle(col,1).fillRect(x,y,fw,h);g.fillStyle(hi,1).fillRect(x,y,fw,1);
  }
  drawHud(dt){
    const g=this.hud,s=this.stats,y0=H-HUD;g.clear();
    g.fillStyle(0x0f0b1e,1).fillRect(0,y0,W,HUD);g.fillStyle(0xc9a24a,1).fillRect(0,y0,W,1);g.fillStyle(0x3a2a5a,1).fillRect(0,y0+1,W,1);
    g.fillStyle(0x2a2046,1).fillRect(156,y0+4,1,15);
    this.hpGhost=this.hpGhost>s.hp?Math.max(s.hp,this.hpGhost-s.maxHp*dt*0.6):s.hp;
    this.bar(g,38,y0+4,72,5,s.hp/s.maxHp,this.hpGhost/s.maxHp,0xe0404f,0xff8a95);
    this.bar(g,38,y0+12,72,5,s.mp/s.maxMp,0,0x3a6ae0,0x8ab0ff);
    g.fillStyle(0x241a3a,1).fillRect(4,y0+21,W-8,2);g.fillStyle(0xe8c04a,1).fillRect(4,y0+21,Math.round((W-8)*s.exp/s.next),2);
    this.lvTxt.setText(String(s.lv));this.hpTxt.setText(Math.ceil(s.hp)+'/'+s.maxHp);this.mpTxt.setText(Math.floor(s.mp)+'/'+s.maxMp);
    if(this.tInfo&&this.targetT>0){const e=this.tInfo.e,hp=Math.max(0,e.hp);
      this.tGhost=this.tGhost>hp?Math.max(hp,this.tGhost-e.maxHp*dt*0.8):hp;
      this.nameTxt.setText(e.nm).setVisible(true);this.hintTxt.setVisible(false);
      this.bar(g,164,y0+15,96,4,hp/e.maxHp,this.tGhost/e.maxHp,0xe0404f,0xff8a95);
      this.tHpTxt.setText(Math.ceil(hp)+'/'+e.maxHp).setVisible(true);
    }else{this.nameTxt.setVisible(false);this.tHpTxt.setVisible(false);this.hintTxt.setVisible(true)}
  }

  /* ----- input ----- */
  readInput(){
    const k=this.keys,v=VP;
    const held={left:k.LEFT.isDown||k.A.isDown||v.left,right:k.RIGHT.isDown||k.D.isDown||v.right,down:k.DOWN.isDown||k.S.isDown||v.down,
      jump:k.X.isDown||k.SPACE.isDown||k.UP.isDown||k.W.isDown||k.K.isDown||v.jump,atk:k.Z.isDown||k.J.isDown||v.attack,skill:k.C.isDown||k.L.isDown||v.skill};
    const pr=this.prev,press={jump:held.jump&&!pr.jump,atk:held.atk&&!pr.atk,skill:held.skill&&!pr.skill};
    this.prev=held;
    if(this.frozen){for(const kk in press)if(press[kk])this.pend[kk]=true}
    else{for(const kk in this.pend)press[kk]=press[kk]||this.pend[kk];this.pend={}}
    return{held,press};
  }

  update(time,delta){
    const dt=Math.min(delta,50)/1000,inp=this.readInput();
    if(!this.frozen){
      if(!this.player.dead)this.updatePlayer(dt,inp,time);
      this.updateAttack(dt);this.updateSword();this.updateWaves(dt);this.updateEnemies(dt,time);
      if(!this.player.dead)this.physics.overlap(this.player,this.enemies,(pl,e)=>this.hurtPlayer(e));
      this.hearts.getChildren().slice().forEach(h=>{h.life-=dt;h.setVelocityX(h.body.velocity.x*0.95);if(h.life<3)h.setAlpha(Math.floor(time/90)%2?.3:1);if(h.life<=0)h.destroy()});
      const s=this.stats;s.mp=Math.min(s.maxMp,s.mp+3*dt);
      if(this.comboT>0){this.comboT-=dt;if(this.comboT<=0){this.combo=0;this.comboTxt.setVisible(false)}}
      if(this.targetT>0)this.targetT-=dt;
    }
    this.drawHud(dt);
  }

  updatePlayer(dt,{held,press},now){
    const p=this.player,b=p.body,a=this.atk;
    const onG=b.blocked.down||b.touching.down;
    if(onG&&!this.wasOnG&&this.prevVy>220)this.dustEm.explode(5,p.x,b.bottom);
    this.wasOnG=onG;this.prevVy=b.velocity.y;
    this.coyote=onG?0.09:this.coyote-dt;
    this.jumpBuf=press.jump?0.12:this.jumpBuf-dt;
    if(p.inv>0){p.inv-=dt;p.setAlpha(Math.floor(now/70)%2?0.35:1)}else p.setAlpha(1);
    p.dropT-=dt;this.skillCd-=dt;this.castT-=dt;
    const P='hero_';
    if(p.hurtT>0){p.hurtT-=dt;p.anims.stop();p.setTexture(P+'jump0');p.setFlipX(this.facing<0);return}
    const move=(held.right?1:0)-(held.left?1:0);this.move=move;
    if(!a.active&&move)this.facing=move;
    const slow=a.active?(onG?0.12:0.7):1,target=move*SPEED*slow,k=1-Math.pow(onG?0.62:0.8,dt*60);
    p.setVelocityX(b.velocity.x+(target-b.velocity.x)*k);
    const onOne=onG&&this.tileAt(b.center.x,b.bottom+2)==='-';
    if(this.jumpBuf>0&&held.down&&onOne){p.dropT=0.22;this.jumpBuf=0;p.setVelocityY(40)}
    else if(this.jumpBuf>0&&this.coyote>0){p.setVelocityY(-JUMP);this.jumpBuf=0;this.coyote=0;this.dustEm.explode(4,p.x,b.bottom)}
    if(!held.jump&&b.velocity.y<-120)p.setVelocityY(b.velocity.y*0.6);
    if(press.atk){
      if(!a.active){const chain=now-this.lastAtkEnd<230&&this.lastStep<3;this.startAttack(chain?this.lastStep+1:1)}
      else if(a.step<3&&a.t>0.06)a.queued=true}
    if(press.skill)this.castSkill();
    p.setFlipX((a.active?a.f:this.facing)<0);
    if(a.active||this.castT>0){p.anims.stop();p.setTexture(P+'atk0')}
    else if(!onG){p.anims.stop();p.setTexture(P+'jump0')}
    else if(Math.abs(b.velocity.x)>12&&move)p.anims.play(P+'run',true);
    else p.anims.play(P+'idle',true);
    if(this.gear===3&&Math.random()<(move?0.35:0.12))this.auraEm.explode(1,p.x-(this.facing*5)+(Math.random()*6-3),p.y+Math.random()*16-8);
  }

  startAttack(step){
    const a=this.atk,p=this.player;
    if(this.move)this.facing=this.move;
    Object.assign(a,{active:true,step,t:0,queued:false,hit:new Set(),f:this.facing,dur:step===3?0.34:0.24,on:step===3?[0.05,0.2]:[0.03,0.14]});
    if(this.slash)this.slash.destroy();
    const f=a.f,s=this.add.image(p.x+f*4,p.y+1,(step===3?'slashC':'slashA')+this.gear).setOrigin(f>0?0:1,0.5).setFlipX(f<0).setFlipY(step===2).setDepth(12).setAlpha(0);
    this.slash=s;
    this.tweens.add({targets:s,alpha:{from:1,to:0},delay:a.on[0]*1000,duration:(a.dur-a.on[0])*1000,ease:'Quad.easeIn'});
    if(p.body.blocked.down)p.setVelocityX(f*(step===3?130:60));
  }
  updateAttack(dt){
    const a=this.atk,p=this.player;if(!a.active)return;
    a.t+=dt;
    if(this.slash){this.slash.x=p.x+a.f*4;this.slash.y=p.y+1}
    if(a.t>=a.on[0]&&a.t<=a.on[1]){
      const reach=(a.step===3?26:20)+(this.gear===3?4:0),hb=new Phaser.Geom.Rectangle(a.f>0?p.x:p.x-reach,p.y-14,reach,26);
      this.enemies.getChildren().slice().forEach(e=>{
        if(!e.active||a.hit.has(e))return;const eb=e.body;
        if(Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(eb.x,eb.y,eb.width,eb.height))){
          a.hit.add(e);const crit=Math.random()<0.12,mult=[1,1,1.15,1.7][a.step];
          this.hitEnemy(e,Math.round(this.atkVal()*mult*(0.85+Math.random()*0.3)*(crit?2:1)),crit,a.f,a.step===3)}});
    }
    if(a.t>=a.dur){if(a.queued&&a.step<3)this.startAttack(a.step+1);else{a.active=false;this.lastAtkEnd=this.time.now;this.lastStep=a.step}}
  }
  castSkill(){
    const s=this.stats,p=this.player;if(this.skillCd>0||p.hurtT>0)return;
    if(s.mp<10){this.popText(p.x,p.y-14,'NO MP',0x8ab0ff);this.skillCd=0.4;return}
    s.mp-=10;this.skillCd=0.5;this.castT=0.18;const f=this.facing;
    const w=this.add.image(p.x+f*8,p.y,'wave').setFlipX(f<0).setDepth(12);
    this.waves.push({s:w,vx:f*230,life:0.55,hit:new Set(),f});
    this.goldEm.explode(4,p.x+f*8,p.y);
  }
  updateWaves(dt){
    this.waves=this.waves.filter(w=>{
      w.life-=dt;w.s.x+=w.vx*dt;w.s.setAlpha(Math.min(1,w.life*5));
      const hb=new Phaser.Geom.Rectangle(w.s.x-6,w.s.y-10,12,20);
      this.enemies.getChildren().slice().forEach(e=>{if(!e.active||w.hit.has(e))return;const eb=e.body;
        if(Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(eb.x,eb.y,eb.width,eb.height))){
          w.hit.add(e);this.hitEnemy(e,Math.round(this.atkVal()*1.3*(0.9+Math.random()*0.2)),false,w.f,false)}});
      if(this.tileAt(w.s.x+w.f*5,w.s.y)==='#'){w.life=0;this.sparkEm.explode(6,w.s.x,w.s.y)}
      if(w.life<=0){w.s.destroy();return false}return true});
  }

  /* ----- combat ----- */
  hitEnemy(e,d,crit,dir,heavy){
    if(!this.tInfo||this.tInfo.e!==e){this.tInfo={e};this.tGhost=e.hp}
    e.hp-=d;e.stun=e.king?0.12:0.3;
    e.setVelocity(dir*(heavy?1.6:1)*(e.king?40:110),e.king?-40:(heavy?-170:-110));
    e.setTintFill(0xffffff);this.time.delayedCall(70,()=>{if(e.active)e.clearTint()});
    this.popNum(e.x+(Math.random()*8-4),e.body.y-2,d,crit?0xffd34a:0xffffff,crit);
    this.sparkEm.explode(crit?10:6,e.x-dir*4,e.body.center.y);
    const st=this.add.image(e.x-dir*4,e.body.center.y,'spark').setDepth(41).setAngle(Math.random()*45);
    this.tweens.add({targets:st,scale:{from:.6,to:1.6},alpha:{from:1,to:0},duration:140,onComplete:()=>st.destroy()});
    this.combo++;this.comboT=1.5;
    if(this.combo>=2){this.comboTxt.setText(this.combo+' HIT').setVisible(true).setAlpha(1);this.tweens.add({targets:this.comboTxt,scale:{from:1.4,to:1},duration:120})}
    this.targetT=3.5;
    this.cameras.main.shake(crit||heavy?110:50,crit||heavy?0.01:0.004);
    this.hitstop(crit||heavy?85:45);
    if(e.hp<=0)this.killEnemy(e);
  }
  hitstop(ms){if(this.frozen)return;this.frozen=true;this.physics.world.pause();this.time.delayedCall(ms,()=>{this.frozen=false;this.physics.world.resume()})}
  killEnemy(e){
    const k=e.king,d=e.def;
    (k?this.kingEm:this.slimeEm).explode(k?34:14,e.x,e.y);
    this.popText(e.x,e.y-16,'EXP+'+e.exp,0x9fe8ff);
    if(Math.random()<(k?1:0.3))this.dropHeart(e.x,e.y-4);
    if(k)this.banner('KING SLIME DOWN!',0xffd34a);
    e.destroy();this.gainExp(e.exp);
    this.time.delayedCall(k?15000:6000,()=>this.spawnEnemy(d));
  }
  spawnEnemy(d){
    const k=!!d.king,e=this.enemies.create(d.x,d.y,k?'kslime0':'slime0');
    e.body.setSize(12,8).setOffset(1,k?5:2);if(k)e.setScale(2);
    e.setCollideWorldBounds(true).setDepth(k?6:5);
    Object.assign(e,{def:d,king:k,hp:k?160:30,maxHp:k?160:30,dmg:k?14:6,exp:k?40:6,nm:k?'킹슬라임':'슬라임',nextHop:this.time.now+800+Math.random()*1200,stun:0,wasOnG:false,lastVy:0});
    e.play(k?'king_idle':'slime_idle');
    e.setAlpha(0);this.tweens.add({targets:e,alpha:1,duration:400});
  }
  updateEnemies(dt,now){
    const p=this.player;
    this.enemies.getChildren().forEach(e=>{
      const onG=e.body.blocked.down||e.body.touching.down;
      if(onG&&!e.wasOnG&&e.king&&e.lastVy>150){this.cameras.main.shake(100,0.008);this.dustEm.explode(8,e.x,e.body.bottom)}
      e.wasOnG=onG;e.lastVy=e.body.velocity.y;
      if(e.stun>0){e.stun-=dt;return}
      if(onG){
        e.setVelocityX(e.body.velocity.x*0.8);
        if(now>e.nextHop){
          const dx=p.x-e.x,near=!p.dead&&Math.abs(dx)<(e.king?180:110)&&Math.abs(p.y-e.y)<70,dir=near?(Math.sign(dx)||1):(Math.random()<.5?-1:1);
          e.setVelocity(dir*(near?(e.king?90:65):35),near?(e.king?-280:-200):-140);
          e.nextHop=now+(near?(e.king?900:700):1600)+Math.random()*700;
        }
      }
    });
  }
  hurtPlayer(e){
    const p=this.player,s=this.stats;if(p.inv>0||p.dead||e.stun>0.15)return;
    const d=e.dmg+Math.floor(Math.random()*3);s.hp=Math.max(0,s.hp-d);
    this.popNum(p.x,p.y-14,d,0xff5a5a,false);p.inv=1.1;p.hurtT=0.28;
    p.setVelocity((Math.sign(p.x-e.x)||1)*150,-170);
    this.atk.active=false;if(this.slash){this.slash.destroy();this.slash=null}
    this.cameras.main.shake(120,0.01);p.setTintFill(0xff4a5a);this.time.delayedCall(90,()=>p.clearTint());
    if(s.hp<=0)this.die();
  }
  die(){
    const p=this.player,s=this.stats;p.dead=true;p.setTint(0x666677);p.anims.stop();p.setTexture('hero_jump0');
    this.banner('GAME OVER',0xff5a5a);
    this.time.delayedCall(1700,()=>{p.clearTint();p.dead=false;s.hp=s.maxHp;s.mp=s.maxMp;this.hpGhost=s.hp;p.setPosition(3*T,10*T);p.setVelocity(0,0);p.inv=2;p.hurtT=0});
  }
  dropHeart(x,y){const h=this.hearts.create(x,y,'heart');h.setVelocity((Math.random()-.5)*60,-160).setBounce(0.3).setDepth(7);h.body.setSize(7,6);h.life=10}
  gainExp(n){
    const s=this.stats,p=this.player;s.exp+=n;
    while(s.exp>=s.next){s.exp-=s.next;s.lv++;s.next=Math.round(s.next*1.5);s.maxHp+=12;s.maxMp+=5;s.atk+=2;s.hp=s.maxHp;s.mp=s.maxMp;
      this.banner('LEVEL UP!',0x7cff8a);this.goldEm.explode(26,p.x,p.y)}
  }

  /* ----- text fx ----- */
  popNum(x,y,n,tint,big){
    const t=this.add.bitmapText(x,y,'dmg',String(n)).setOrigin(0.5,1).setDepth(50).setTint(tint).setLetterSpacing(-2);
    if(big)this.tweens.add({targets:t,scale:{from:1.8,to:1},duration:160,ease:'Back.easeOut'});
    this.tweens.add({targets:t,y:y-16,duration:420,ease:'Cubic.easeOut'});
    this.tweens.add({targets:t,alpha:0,delay:520,duration:240,onComplete:()=>t.destroy()});
  }
  popText(x,y,str,tint){
    const t=this.add.bitmapText(x,y,'pix',str).setOrigin(0.5,1).setDepth(50).setTint(tint);
    this.tweens.add({targets:t,y:y-14,alpha:{from:1,to:0},duration:900,ease:'Quad.easeOut',onComplete:()=>t.destroy()});
  }
  banner(str,tint){
    const t=this.add.bitmapText(W/2,56,'dmg',str).setOrigin(0.5).setScrollFactor(0).setDepth(120).setTint(tint).setLetterSpacing(-2).setScale(3);
    this.tweens.add({targets:t,scale:2,duration:220,ease:'Back.easeOut'});
    this.tweens.add({targets:t,alpha:0,y:48,delay:1300,duration:350,onComplete:()=>t.destroy()});
  }
}
