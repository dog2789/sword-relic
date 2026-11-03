import Phaser from 'phaser';
import {W,H,T,HUD,ROWS,LH,SPEED,JUMP,VP} from '../config.js';
import {buildTextures} from '../gfx/sprites.js';
import {buildFonts} from '../gfx/fonts.js';
import {HERO_W,HERO_H,HERO_FRAMES,GEAR,LOOK,drawHero} from '../gfx/hero.js';
import {ROOMS,buildRoomMap,floorTopY} from '../world/rooms.js';
import {drawFar,drawMid,drawLevel} from '../world/meadow.js';
import {STATE,saveGame} from '../state.js';
import {calcZoom} from '../zoom.js';

const KR='"IBM Plex Sans KR", system-ui, sans-serif';
const IRON_GEAR=2;

export class PlayScene extends Phaser.Scene{
  constructor(){super('play')}

  create(data={}){
    buildTextures(this);buildFonts(this);
    this.slash=null;this.sword=null;this.chest=null;this.chestHint=null;this.statue=null;this.crystal=null;this.tInfo=null;
    const id=data.room&&ROOMS[data.room]?data.room:(ROOMS[STATE.room]?STATE.room:'r1');
    STATE.room=id;STATE.visited[id]=true;
    this.roomId=id;this.R=ROOMS[id];this.map=buildRoomMap(id);this.cols=this.R.cols;this.lw=this.cols*T;
    this.drawWorld();this.makeAnims();
    this.solids=[];this.oneways=[];this.buildCollision();
    this.stats=STATE.stats;this.gear=STATE.gear;this.redrawHero();

    // 입장 위치
    const entry=data.entry||'start',R=this.R;
    let tx=R.start?R.start.tx:(R.save?R.save.tx:2);
    if(entry==='left')tx=0.4;else if(entry==='right')tx=this.cols-0.4;else if(entry==='save'&&R.save)tx=R.save.tx;
    const sx=entry==='left'?8:entry==='right'?this.lw-8:tx*T+8;
    const sy=floorTopY(this.map,Math.floor(Math.min(this.cols-1,Math.max(0,tx))))-9;
    const p=this.player=this.physics.add.sprite(sx,sy,'hero_idle0');
    p.body.setSize(9,14).setOffset(4,3);
    this.sword=this.add.image(0,0,'sword'+this.gear).setDepth(11).setVisible(false);p.setDepth(10).setCollideWorldBounds(true);
    Object.assign(p,{inv:entry==='save'?1.5:0,hurtT:0,dropT:0,dead:false});
    this.facing=entry==='right'?-1:1;this.coyote=0;this.jumpBuf=0;this.wasOnG=false;this.prevVy=0;this.skillCd=0;this.castT=0;this.djUsed=false;
    this.lastAtkEnd=-1e9;this.lastStep=0;this.move=0;
    this.atk={active:false,step:0,t:0,queued:false,hit:new Set(),dur:0,on:[0,0],f:1};

    this.physics.world.setBounds(0,0,this.lw,LH);
    this.physics.world.setBoundsCollision(!R.exits.left,!R.exits.right,true,true);
    this.physics.add.collider(p,this.solids);
    this.physics.add.collider(p,this.oneways,null,()=>p.dropT<=0);
    this.enemies=this.physics.add.group();
    this.physics.add.collider(this.enemies,this.solids);this.physics.add.collider(this.enemies,this.oneways);
    // 출구 쪽 보이지 않는 벽: 적만 막음
    const ew=[];[[-8],[this.lw+8]].forEach(([x])=>{const z=this.add.zone(x,LH/2,16,LH);this.physics.add.existing(z,true);ew.push(z)});
    this.physics.add.collider(this.enemies,ew);
    this.hearts=this.physics.add.group();
    this.physics.add.collider(this.hearts,this.solids);this.physics.add.collider(this.hearts,this.oneways);
    this.physics.add.overlap(p,this.hearts,(pl,h)=>{const s=this.stats;s.hp=Math.min(s.maxHp,s.hp+20);this.popText(h.x,h.y-6,'+20',0x7cff8a);this.goldEm.explode(6,h.x,h.y);h.destroy()});

    const mk=(tint,extra={})=>this.add.particles(0,0,'px',Object.assign({lifespan:{min:250,max:600},speed:{min:40,max:140},angle:{min:0,max:360},gravityY:380,scale:{start:1,end:0},tint,emitting:false},extra)).setDepth(40);
    this.sparkEm=mk([0xffffff,0x9fe8ff,0xffe27a],{speed:{min:60,max:160},lifespan:{min:120,max:300}});
    this.slimeEm=mk([0x5fcf5a,0x2f8a3a,0xe8ffe0]);
    this.kingEm=mk([0x5a8cff,0x2f4fb0,0xf0c040,0xe0ecff],{speed:{min:60,max:200}});
    this.goldEm=mk([0xffd34a,0xfff2a0,0xe8742a],{gravityY:-60,speed:{min:20,max:90}});
    this.dustEm=mk([0xd8c8a0,0xb8a478],{speed:{min:10,max:45},angle:{min:190,max:350},gravityY:-30,lifespan:{min:200,max:380}});
    this.auraEm=mk([0x9ff0ff,0xffd34a,0xffffff],{speed:{min:4,max:18},gravityY:-50,lifespan:{min:300,max:600}});
    this.waves=[];

    this.spawnObjects(entry);
    (R.slimes||[]).forEach(s=>this.spawnEnemy({x:s.tx*T+8,y:s.ty*T}));

    const cam=this.cameras.main;cam.setBounds(0,0,this.lw,LH+HUD);cam.startFollow(p,true,0.12,0.12);cam.setDeadzone(40,28);cam.roundPixels=true;
    cam.fadeIn(220,0,0,0);
    this.keys=this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,Z,X,C,SPACE,A,D,W,S,J,K,L,ZERO,ONE,TWO,THREE,FOUR');
    this.buildHud();
    this.combo=0;this.comboT=0;this.tInfo=null;this.targetT=0;this.hpGhost=this.stats.hp;this.tGhost=0;
    this.prev={};this.pend={};this.frozen=false;this.leaving=false;
    if(!data.quiet)this.toast(R.name,1800);
    if(window.onGearChange)window.onGearChange(this.gear);
  }

  /* ----- world ----- */
  drawWorld(){
    const id=this.roomId,R=this.R;
    if(!this.textures.exists('far_'+id))this.textures.addCanvas('far_'+id,drawFar(this.lw));
    if(!this.textures.exists('mid_'+id))this.textures.addCanvas('mid_'+id,drawMid(this.lw));
    if(!this.textures.exists('lvl_'+id))this.textures.addCanvas('lvl_'+id,drawLevel(this.map,this.cols,R.seed,R.deco));
    this.add.image(0,0,'far_'+id).setOrigin(0).setScrollFactor(0.1).setDepth(-10);
    this.clouds=[0,1,2,0,1].map((k,i)=>this.add.image(i*90+Math.random()*60,12+Math.random()*50,'cloud'+k).setScrollFactor(0.15).setDepth(-9.5).setAlpha(0.95));
    this.add.image(0,0,'mid_'+id).setOrigin(0).setScrollFactor(0.35).setDepth(-9);
    this.add.image(0,0,'lvl_'+id).setOrigin(0).setDepth(0);
  }
  makeAnims(){
    const mk=(key,frames,rate)=>{if(!this.anims.exists(key))this.anims.create({key,frames:frames.map(f=>({key:f})),frameRate:rate,repeat:-1})};
    mk('hero_idle',['hero_idle0','hero_idle1'],2.5);mk('hero_run',['hero_run0','hero_idle0','hero_run1','hero_idle0'],10);
    mk('slime_idle',['slime0','slime1'],3);mk('king_idle',['kslime0','kslime1'],2.5);
  }
  buildCollision(){
    const m=this.map,C=this.cols,rects=[];let prev=[];
    for(let y=0;y<ROWS;y++){const runs=[];let x=0;
      while(x<C){if(m[y][x]==='#'){const s=x;while(x<C&&m[y][x]==='#')x++;runs.push({x:s,w:x-s,y,h:1})}else x++}
      const cur=[];for(const r of runs){const p=prev.find(q=>q.x===r.x&&q.w===r.w);if(p){p.h++;cur.push(p)}else{rects.push(r);cur.push(r)}}prev=cur}
    rects.forEach(r=>{const z=this.add.zone(r.x*T+r.w*T/2,r.y*T+r.h*T/2,r.w*T,r.h*T);this.physics.add.existing(z,true);this.solids.push(z)});
    for(let y=0;y<ROWS;y++){let x=0;while(x<C){if(m[y][x]==='-'){const s=x;while(x<C&&m[y][x]==='-')x++;
      const z=this.add.zone((s+x)*T/2,y*T+3,(x-s)*T,6);this.physics.add.existing(z,true);
      z.body.checkCollision.down=false;z.body.checkCollision.left=false;z.body.checkCollision.right=false;this.oneways.push(z)}else x++}}
  }
  tileAt(X,Y){const tx=Math.floor(X/T),ty=Math.floor(Y/T);if(ty<0||ty>=ROWS)return'#';if(tx<0||tx>=this.cols)return'.';return this.map[ty][tx]}

  /* ----- 방 오브젝트: 석상, 상자, 결정, 보스 ----- */
  spawnObjects(entry){
    const R=this.R,p=this.player;
    if(R.save){
      const x=R.save.tx*T+8,g=floorTopY(this.map,R.save.tx);
      const glow=this.add.image(x,g-34,'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0x6fd0ff).setAlpha(0.8).setDepth(1);
      this.add.image(x,g,'statue').setOrigin(0.5,1).setScale(2).setDepth(2);
      const cr=this.add.image(x,g-34,'scrystal').setScale(2).setDepth(3);
      this.tweens.add({targets:[cr,glow],y:'-=3',duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      this.statue={x,y:g-12};this.atStatue=Math.abs(p.x-x)<20;
    }
    if(R.chest){
      const c=R.chest,x=c.tx*T+8,g=floorTopY(this.map,c.tx),open=!!STATE.opened[c.id];
      this.chest={def:c,x,y:g,open,spr:this.add.image(x,g,open?'chest1':'chest0').setOrigin(0.5,1).setDepth(4)};
      this.chestHint=this.add.bitmapText(x,g-20,'pix','Z').setOrigin(0.5,1).setDepth(45).setTint(0xffe27a).setVisible(false);
      this.tweens.add({targets:this.chestHint,y:'-=3',duration:400,yoyo:true,repeat:-1});
    }
    if(R.crystal&&!STATE.collected[R.crystal.id]){
      const c=R.crystal,x=c.tx*T+8,y=(c.ty+1)*T-8;
      const glow=this.add.image(x,y,'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff6a9a).setScale(0.7).setDepth(1);
      const spr=this.add.image(x,y,'lcrystal').setDepth(4);
      this.tweens.add({targets:[spr,glow],y:'-=3',duration:700,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      this.crystal={def:c,x,y,spr,glow};
    }
    if(R.boss&&!STATE.bossDown){
      this.spawnEnemy({x:R.boss.tx*T+8,y:R.boss.ty*T,king:true});
      this.time.delayedCall(700,()=>{this.banner('KING SLIME',0xff7a7a);this.toast('슬라임 둥지의 주인이 나타났다!',2600)});
    }
  }
  updateObjects(){
    const p=this.player;
    if(this.statue){const near=Math.abs(p.x-this.statue.x)<14&&Math.abs(p.y-this.statue.y)<22;
      if(near&&!this.atStatue&&!p.dead)this.doSave();
      if(!near&&Math.abs(p.x-this.statue.x)>26)this.atStatue=false;}
    if(this.chest&&!this.chest.open){const d=Math.abs(p.x-this.chest.x);this.chestHint.setVisible(d<40&&Math.abs(p.y-(this.chest.y-8))<30)}
    else if(this.chestHint)this.chestHint.setVisible(false);
    if(this.crystal&&Math.abs(p.x-this.crystal.x)<11&&Math.abs(p.y-this.crystal.y)<14)this.takeCrystal();
  }
  doSave(){
    const s=this.stats;this.atStatue=true;
    s.hp=s.maxHp;s.mp=s.maxMp;STATE.save={room:this.roomId};STATE.room=this.roomId;saveGame();
    this.popText(this.statue.x,this.statue.y-22,'SAVE',0x8fe3ff);this.auraEm.explode(16,this.statue.x,this.statue.y-12);
    this.toast('기록했어요. HP와 MP가 모두 회복됐어요',2200);
  }
  openChest(){
    const c=this.chest;if(c.open)return;c.open=true;STATE.opened[c.def.id]=true;
    c.spr.setTexture('chest1');this.goldEm.explode(24,c.x,c.y-10);this.cameras.main.shake(80,0.006);
    const icon=this.add.image(c.x,c.y-10,'icon_iron').setDepth(46);
    this.tweens.add({targets:icon,y:c.y-34,duration:500,ease:'Back.easeOut'});
    this.time.delayedCall(1100,()=>{
      this.tweens.add({targets:icon,x:this.player.x,y:this.player.y,alpha:0,scale:0.5,duration:300,onComplete:()=>icon.destroy()});
      if(this.gear<IRON_GEAR)this.equip(IRON_GEAR);
      this.banner('NEW GEAR!',0xffd34a);
      this.toast('철 갑옷과 철 투구를 얻었다! 공격력 +5',3200);
    });
  }
  takeCrystal(){
    const c=this.crystal,s=this.stats;this.crystal=null;STATE.collected[c.def.id]=true;
    s.maxHp+=20;s.hp=s.maxHp;c.spr.destroy();c.glow.destroy();
    this.goldEm.explode(20,c.x,c.y);this.banner('MAX HP UP!',0xff8ab0);this.toast('생명의 결정! 최대 HP +20',3000);
  }
  grantDoubleJump(){
    STATE.abilities.djump=true;const p=this.player;
    this.auraEm.explode(30,p.x,p.y);this.banner('DOUBLE JUMP!',0x9ff0ff);
    this.toast('2단 점프를 얻었다! 공중에서 점프를 한 번 더 누르세요',4200);
    this.time.delayedCall(4800,()=>this.toast('바람 언덕 높은 곳에서 뭔가 빛나던데...',3200));
  }

  /* ----- 방 이동 ----- */
  goRoom(id,entry){
    if(this.leaving)return;this.leaving=true;
    STATE.visited[id]=true;
    this.cameras.main.fadeOut(180,0,0,0);
    this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.restart({room:id,entry}));
  }
  checkExits(){
    const p=this.player,ex=this.R.exits;if(this.leaving||p.dead)return;
    if(ex.left&&p.x<-2)this.goRoom(ex.left,'right');
    else if(ex.right&&p.x>this.lw+2)this.goRoom(ex.right,'left');
  }

  /* ----- 주인공 그림/장비 ----- */
  updateSword(){
    const p=this.player,a=this.atk,on=!p.dead&&p.hurtT<=0&&(a.active||this.castT>0);
    this.sword.setVisible(on);if(!on)return;
    const f=a.active?a.f:this.facing;
    this.sword.setPosition(p.x+f*7,p.y+4).setFlipX(f<0).setOrigin(f>0?0.09:0.91,0.5);
  }
  redrawHero(){
    for(const f in HERO_FRAMES){const t=this.textures.get('hero_'+f),c=t.getContext();c.clearRect(0,0,HERO_W,HERO_H);drawHero(c,f,LOOK,this.gear);t.refresh()}
    if(this.sword)this.sword.setTexture('sword'+this.gear);
  }
  atkVal(){return this.stats.atk+GEAR[this.gear].atk}
  equip(n){
    this.gear=n;STATE.gear=n;this.redrawHero();const p=this.player;
    p.setTintFill(0xffffff);this.time.delayedCall(90,()=>{if(!p.dead)p.clearTint()});
    this.goldEm.explode(20,p.x,p.y);this.auraEm.explode(14,p.x,p.y);
    if(window.onGearChange)window.onGearChange(n);
  }
  setGear(n){if(n===this.gear||!GEAR[n])return;this.equip(n);this.banner('GEAR '+n,n===GEAR.length-1?0x9ff0ff:0xffd34a)}

  /* ----- HUD ----- */
  buildHud(){
    const y0=H-HUD,fix=o=>o.setScrollFactor(0).setDepth(100),res=Math.max(1,Math.ceil(calcZoom()));
    this.hud=fix(this.add.graphics());
    fix(this.add.bitmapText(5,y0+3,'pix','LV')).setTint(0xe8c04a);
    this.lvTxt=fix(this.add.bitmapText(5,y0+8,'dmg','1')).setLetterSpacing(-2);
    fix(this.add.bitmapText(26,y0+4,'pix','HP')).setTint(0xff8a95);
    fix(this.add.bitmapText(26,y0+12,'pix','MP')).setTint(0x8ab0ff);
    this.hpTxt=fix(this.add.bitmapText(114,y0+4,'pix',''));
    this.mpTxt=fix(this.add.bitmapText(114,y0+12,'pix',''));
    this.nameTxt=fix(this.add.text(164,y0+2,'',{fontFamily:KR,fontSize:'9px',fontStyle:'600',color:'#ece7f7'})).setResolution(res).setVisible(false);
    this.hintTxt=fix(this.add.text(164,y0+6,'',{fontFamily:KR,fontSize:'8px',color:'#8f86ab'})).setResolution(res);
    this.tHpTxt=fix(this.add.bitmapText(266,y0+14,'pix','')).setVisible(false);
    this.comboTxt=this.add.bitmapText(8,8,'dmg','').setScrollFactor(0).setDepth(110).setTint(0xffd34a).setLetterSpacing(-2).setVisible(false);
    this.toastTxt=this.add.text(W/2,6,'',{fontFamily:KR,fontSize:'9px',fontStyle:'600',color:'#fff8e0',backgroundColor:'#1a1230dd',padding:{x:7,y:4},align:'center'})
      .setOrigin(0.5,0).setScrollFactor(0).setDepth(130).setResolution(res).setVisible(false);
    this.mmGfx=this.add.graphics().setScrollFactor(0).setDepth(105);
  }
  setTextRes(z){const r=Math.max(1,Math.ceil(z));[this.nameTxt,this.hintTxt,this.toastTxt].forEach(t=>t&&t.setResolution(r))}
  toast(msg,ms=2400){
    const t=this.toastTxt;if(!t)return;this.tweens.killTweensOf(t);
    t.setText(msg).setVisible(true).setAlpha(0);
    this.tweens.add({targets:t,alpha:1,duration:160});
    this.tweens.add({targets:t,alpha:0,delay:ms,duration:300,onComplete:()=>t.setVisible(false)});
  }
  bar(g,x,y,w,h,v,ghost,col,hi){
    g.fillStyle(0x05030b,1).fillRect(x-1,y-1,w+2,h+2);g.fillStyle(0x1d1430,1).fillRect(x,y,w,h);
    if(ghost>v){g.fillStyle(0xfff0f0,1).fillRect(x,y,Math.round(w*ghost),h)}
    const fw=Math.round(w*Math.max(0,v));g.fillStyle(col,1).fillRect(x,y,fw,h);g.fillStyle(hi,1).fillRect(x,y,fw,1);
  }
  drawMinimap(time){
    const g=this.mmGfx;g.clear();
    const ids=Object.keys(ROOMS),cw=12,ch=7,gap=3;
    const maxX=Math.max(...ids.map(i=>ROOMS[i].grid[0])),maxY=Math.max(...ids.map(i=>ROOMS[i].grid[1]));
    const mw=(maxX+1)*cw+maxX*gap,mh=(maxY+1)*ch+maxY*gap,x0=W-mw-8,y0=7;
    g.fillStyle(0x0f0b1e,0.72).fillRect(x0-4,y0-4,mw+8,mh+8);g.lineStyle(1,0xc9a24a,0.9).strokeRect(x0-4.5,y0-4.5,mw+9,mh+9);
    const pos=i=>[x0+ROOMS[i].grid[0]*(cw+gap),y0+ROOMS[i].grid[1]*(ch+gap)];
    const known=i=>STATE.visited[i]||ids.some(j=>STATE.visited[j]&&Object.values(ROOMS[j].exits).includes(i));
    ids.forEach(i=>{if(!STATE.visited[i])return;const[x,y]=pos(i);const ex=ROOMS[i].exits;
      if(ex.right&&known(ex.right)){g.fillStyle(0x7a6a9a,1).fillRect(x+cw,y+3,gap,1)}});
    ids.forEach(i=>{if(!known(i))return;const[x,y]=pos(i),R=ROOMS[i];
      if(!STATE.visited[i]){g.lineStyle(1,0x5a4f7a,1).strokeRect(x+0.5,y+0.5,cw-1,ch-1);return}
      const cur=i===this.roomId,blink=Math.floor(time/350)%2;
      g.fillStyle(cur?(blink?0xffe27a:0xc9a24a):0x3f7a3a,1).fillRect(x,y,cw,ch);
      g.fillStyle(cur?0xfff3b0:0x5fa84a,1).fillRect(x,y,cw,1);
      if(R.save){g.fillStyle(0x8fe3ff,1).fillRect(x+2,y+3,2,2)}
      if(R.boss&&!STATE.bossDown){g.fillStyle(0xff4a5a,1).fillRect(x+cw/2-1,y+2,3,3)}
      if(R.chest&&!STATE.opened[R.chest.id]){g.fillStyle(0xffd34a,1).fillRect(x+cw-4,y+3,2,2)}
    });
  }
  drawHud(dt,time){
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
    }else{this.nameTxt.setVisible(false);this.tHpTxt.setVisible(false);
      this.hintTxt.setText(this.R.name+(STATE.abilities.djump?'  ·  2단 점프':'')).setVisible(true)}
    this.drawMinimap(time);
  }

  /* ----- input ----- */
  readInput(){
    const k=this.keys,v=VP,JD=Phaser.Input.Keyboard.JustDown;
    const held={left:k.LEFT.isDown||k.A.isDown||v.left,right:k.RIGHT.isDown||k.D.isDown||v.right,down:k.DOWN.isDown||k.S.isDown||v.down,
      jump:k.X.isDown||k.SPACE.isDown||k.UP.isDown||k.W.isDown||k.K.isDown||v.jump,atk:k.Z.isDown||k.J.isDown||v.attack,skill:k.C.isDown||k.L.isDown||v.skill};
    const pr=this.prev,press={jump:held.jump&&!pr.jump,atk:held.atk&&!pr.atk,skill:held.skill&&!pr.skill};
    this.prev=held;
    ['ZERO','ONE','TWO','THREE','FOUR'].forEach((n,i)=>{if(JD(k[n]))this.setGear(i)});
    if(this.frozen){for(const kk in press)if(press[kk])this.pend[kk]=true}
    else{for(const kk in this.pend)press[kk]=press[kk]||this.pend[kk];this.pend={}}
    return{held,press};
  }

  update(time,delta){
    const dt=Math.min(delta,50)/1000,inp=this.readInput();
    this.clouds.forEach((c,i)=>{c.x+=dt*(3+i*1.5);if(c.x>W+(this.lw-W)*0.15+60)c.x=-60});
    if(!this.frozen){
      if(!this.player.dead)this.updatePlayer(dt,inp,time);
      this.updateAttack(dt);this.updateSword();this.updateWaves(dt);this.updateEnemies(dt,time);
      if(!this.player.dead)this.physics.overlap(this.player,this.enemies,(pl,e)=>this.hurtPlayer(e));
      this.hearts.getChildren().slice().forEach(h=>{h.life-=dt;h.setVelocityX(h.body.velocity.x*0.95);if(h.life<3)h.setAlpha(Math.floor(time/90)%2?.3:1);if(h.life<=0)h.destroy()});
      const s=this.stats;s.mp=Math.min(s.maxMp,s.mp+3*dt);
      if(this.comboT>0){this.comboT-=dt;if(this.comboT<=0){this.combo=0;this.comboTxt.setVisible(false)}}
      if(this.targetT>0)this.targetT-=dt;
      this.updateObjects();this.checkExits();
    }
    this.drawHud(dt,time);
  }

  updatePlayer(dt,{held,press},now){
    const p=this.player,b=p.body,a=this.atk;
    const onG=b.blocked.down||b.touching.down;
    if(onG&&!this.wasOnG&&this.prevVy>220)this.dustEm.explode(5,p.x,b.bottom);
    if(onG)this.djUsed=false;
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
    else if(press.jump&&!onG&&this.coyote<=0&&STATE.abilities.djump&&!this.djUsed){
      this.djUsed=true;this.jumpBuf=0;p.setVelocityY(-JUMP*0.9);
      this.auraEm.explode(8,p.x,b.bottom);this.dustEm.explode(4,p.x,b.bottom);
    }
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
    if(this.gear===GEAR.length-1&&Math.random()<(move?0.35:0.12))this.auraEm.explode(1,p.x-(this.facing*5)+(Math.random()*6-3),p.y+Math.random()*16-8);
  }

  startAttack(step){
    const a=this.atk,p=this.player;
    if(this.move)this.facing=this.move;
    Object.assign(a,{active:true,step,t:0,queued:false,hit:new Set(),f:this.facing,dur:step===3?0.34:0.24,on:step===3?[0.05,0.2]:[0.03,0.14]});
    if(this.slash)this.slash.destroy();
    const f=a.f,s=this.add.image(p.x+f*4,p.y+3,(step===3?'slashC':'slashA')+this.gear).setOrigin(f>0?0:1,0.5).setFlipX(f<0).setFlipY(step===2).setDepth(12).setAlpha(0);
    this.slash=s;
    this.tweens.add({targets:s,alpha:{from:1,to:0},delay:a.on[0]*1000,duration:(a.dur-a.on[0])*1000,ease:'Quad.easeIn'});
    if(p.body.blocked.down)p.setVelocityX(f*(step===3?130:60));
  }
  updateAttack(dt){
    const a=this.atk,p=this.player;if(!a.active)return;
    a.t+=dt;
    if(this.slash){this.slash.x=p.x+a.f*4;this.slash.y=p.y+3}
    if(a.t>=a.on[0]&&a.t<=a.on[1]){
      const reach=(a.step===3?26:20)+(this.gear===GEAR.length-1?4:0),hb=new Phaser.Geom.Rectangle(a.f>0?p.x:p.x-reach,p.y-10,reach,22);
      this.enemies.getChildren().slice().forEach(e=>{
        if(!e.active||a.hit.has(e))return;const eb=e.body;
        if(Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(eb.x,eb.y,eb.width,eb.height))){
          a.hit.add(e);const crit=Math.random()<0.12,mult=[1,1,1.15,1.7][a.step];
          this.hitEnemy(e,Math.round(this.atkVal()*mult*(0.85+Math.random()*0.3)*(crit?2:1)),crit,a.f,a.step===3)}});
      const c=this.chest;
      if(c&&!c.open&&Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(c.x-7,c.y-11,14,11)))this.openChest();
    }
    if(a.t>=a.dur){if(a.queued&&a.step<3)this.startAttack(a.step+1);else{a.active=false;this.lastAtkEnd=this.time.now;this.lastStep=a.step}}
  }
  castSkill(){
    const s=this.stats,p=this.player;if(this.skillCd>0||p.hurtT>0)return;
    if(s.mp<10){this.popText(p.x,p.y-12,'NO MP',0x8ab0ff);this.skillCd=0.4;return}
    s.mp-=10;this.skillCd=0.5;this.castT=0.18;const f=this.facing;
    const w=this.add.image(p.x+f*8,p.y+3,'wave').setFlipX(f<0).setDepth(12);
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
    e.destroy();this.gainExp(e.exp);
    if(k){STATE.bossDown=true;this.banner('KING SLIME DOWN!',0xffd34a);this.time.delayedCall(1500,()=>this.grantDoubleJump())}
    else this.time.delayedCall(6000,()=>{if(!this.leaving)this.spawnEnemy(d)});
  }
  spawnEnemy(d){
    const k=!!d.king,e=this.enemies.create(d.x,d.y,k?'kslime0':'slime0');
    e.body.setSize(12,8).setOffset(1,k?5:2);if(k)e.setScale(2);
    e.setCollideWorldBounds(true).setDepth(k?6:5);
    Object.assign(e,{def:d,king:k,hp:k?200:30,maxHp:k?200:30,dmg:k?14:6,exp:k?40:6,nm:k?'킹슬라임':'슬라임',nextHop:this.time.now+800+Math.random()*1200,stun:0,wasOnG:false,lastVy:0});
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
    this.popNum(p.x,p.y-12,d,0xff5a5a,false);p.inv=1.1;p.hurtT=0.28;
    p.setVelocity((Math.sign(p.x-e.x)||1)*150,-170);
    this.atk.active=false;if(this.slash){this.slash.destroy();this.slash=null}
    this.cameras.main.shake(120,0.01);p.setTintFill(0xff4a5a);this.time.delayedCall(90,()=>p.clearTint());
    if(s.hp<=0)this.die();
  }
  die(){
    const p=this.player,s=this.stats;p.dead=true;p.setTint(0x666677);p.anims.stop();p.setTexture('hero_jump0');
    this.banner('GAME OVER',0xff5a5a);
    this.time.delayedCall(1700,()=>{
      s.hp=s.maxHp;s.mp=s.maxMp;
      const room=STATE.save?STATE.save.room:'r1';
      this.leaving=true;this.cameras.main.fadeOut(200,0,0,0);
      this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.restart({room,entry:STATE.save?'save':'start'}));
    });
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
    const t=this.add.bitmapText(W/2,64,'dmg',str).setOrigin(0.5).setScrollFactor(0).setDepth(120).setTint(tint).setLetterSpacing(-2).setScale(3);
    this.tweens.add({targets:t,scale:2,duration:220,ease:'Back.easeOut'});
    this.tweens.add({targets:t,alpha:0,y:56,delay:1300,duration:350,onComplete:()=>t.destroy()});
  }
}
