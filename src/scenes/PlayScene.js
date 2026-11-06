import Phaser from 'phaser';
import {W,H,T,HUD,ROWS,LH,SPEED,JUMP,VP,MOBILE,keyText,wideW,setW,landPad,RESPAWN_MS} from '../config.js';
import {buildTextures} from '../gfx/sprites.js';
import {buildFonts} from '../gfx/fonts.js';
import {cv,px} from '../gfx/pixel.js';
import {HERO_W,HERO_H,HERO_FRAMES,LOOK,drawHero,MY} from '../gfx/hero.js';
import {ITEMS,SETS,SLOTS,SLOT_NAMES,equipBonus,setProgress,statLine,wlvAtk,weaponName} from '../data/items.js';
import {ROOMS,buildRoomMap,floorTopY,surfaceY,roomChests} from '../world/rooms.js';
import {drawFar,drawMid,drawLevel,drawCaveFar,drawCaveMid,drawTreetopMid,drawCastleFar,drawCastleMid,drawIceFar,drawIceMid,drawDesertFar,drawDesertMid,drawLavaFar,drawLavaMid,drawSkyFar,drawSkyMid,drawDemonFar,drawDemonMid,THEME_COL} from '../world/meadow.js';
import {spawnMob,updateMob,makeMobAnims,updateQuakes,updateEShots,tierOf} from './monsters.js';
import {PlayUI} from './playUI.js';
import {Economy} from './economy.js';
import {Gimmicks} from './gimmicks.js';
import {MenuMixin} from './menu.js';
import {Fx,buildFxTextures} from './fx.js';
import {Skills} from './skills.js';
import {bossDone,setBossDone,STATE,saveGame} from '../state.js';
import {RS,fitCameras,calcScale} from '../zoom.js';

import {F9,F11} from '../fonts.js';
import {sfx} from '../sfx.js';
import {bgm,bgmStop} from '../bgm.js';
import {isDown,edges} from '../input.js';
const CLIMB_SPEED=70;
/* 받침 있으면 '을', 없으면 '를' */
const josa=(w,a,b)=>{const c=w.charCodeAt(w.length-1)-0xAC00;return w+(c>=0&&c<11172&&c%28?a:b)};

export class PlayScene extends Phaser.Scene{
  constructor(){super('play')}

  create(data={}){
    // 폰을 돌렸으면 방을 새로 만들 때 게임 폭을 화면 비율에 맞춤 (방 안에서는 바꾸지 않음)
    if(W!==wideW()){setW(wideW());const sc=calcScale();RS.S=sc.S;this.scale.resize(W*sc.S,H*sc.S);this.scale.setZoom(sc.css/sc.S)}
    buildTextures(this);buildFonts(this);buildFxTextures(this);this.fxEms={};
    // 이전 방의 참조 정리
    Object.assign(this,{slash:null,sword:null,chests:[],statue:null,crystal:null,tInfo:null,menu:null,pickups:[],walls:[],fallers:[],mushrooms:[],climbing:false,bounceT:0,safe:null,autoUp:false,warpObj:null,npcObjs:[],bubble:null,listm:null,dlg:null,mapv:null,warpm:null,quickUI:[],quakes:[],eshots:[],geysers:[],inSand:false,wallT:0,wallLock:0,wallDir:0});
    const id=data.room&&ROOMS[data.room]?data.room:(ROOMS[STATE.room]?STATE.room:'r1');
    this.entryData={room:id,entry:data.entry||'start',dx:data.dx};
    STATE.room=id;STATE.visited[id]=true;saveGame();   // 자동 저장 (폰은 브라우저가 쉽게 닫혀서)
    this.roomId=id;this.R=ROOMS[id];bgm(this.roomSong());this.map=buildRoomMap(id);this.cols=this.R.cols;this.lw=this.cols*T;
    this.drawWorld();this.makeAnims();makeMobAnims(this);
    this.solids=[];this.oneways=[];this.buildCollision();
    this.stats=STATE.stats;this.equip=STATE.equip;this.bonus=equipBonus(this.equip);this.redrawHero();

    // 입장 위치
    const entry=data.entry||'start',R=this.R,ex=R.exits;
    let sx,sy,climb=false;
    // 옆으로 들어올 때: 바닥이 없으면(나무 위 등) 가장 위의 디딜 곳에 섬
    const edgeY=tx=>{const f=floorTopY(this.map,tx);return(f>=LH?surfaceY(this.map,tx):f)-9};
    if(entry==='left'){sx=8;sy=edgeY(0)}
    else if(entry==='right'){sx=this.lw-8;sy=edgeY(this.cols-1)}
    else if(entry==='top'&&ex.up){sx=ex.up.tx*T+8;sy=8;
      // 위 방에서 사다리가 아닌 곳으로 떨어졌으면 같은 위치로 들어옴 (천장이 막혀 있으면 사다리 자리)
      const fx=this.freeCol(sx+(data.dx||0),[8,24]);if(data.dx&&fx!=null)sx=fx;climb=this.isClimb(sx,8)}
    else if(entry==='bottom'&&ex.down){sx=ex.down.tx*T+8;sy=LH-10;
      const fx=this.freeCol(sx+(data.dx||0),[LH-8,LH-24]);if(data.dx&&fx!=null)sx=fx;climb=this.isClimb(sx,LH-8)}
    else if(entry==='warp'&&R.warp){sx=R.warp.tx*T+8;sy=surfaceY(this.map,R.warp.tx)-9}
    else{const tx=(entry==='save'&&R.save)?R.save.tx:(R.start?R.start.tx:(R.save?R.save.tx:2));sx=tx*T+8;sy=surfaceY(this.map,tx)-9}
    const p=this.player=this.physics.add.sprite(sx,sy,'hero_idle0');
    p.body.setSize(9,14).setOffset(6,6);
    this.sword=this.add.image(0,0,'sword_'+this.equip.weapon).setDepth(11).setVisible(false);p.setDepth(10).setCollideWorldBounds(true);
    Object.assign(p,{inv:entry==='save'?1.5:(entry==='start'?0:0.9),hurtT:0,dropT:0,dead:false});   // 방에 들어오자마자 맞고 밀려 나가지 않게 잠깐 무적
    this.facing=entry==='right'?-1:1;this.coyote=0;this.jumpBuf=0;this.wasOnG=false;this.prevVy=0;this.skillCd=0;this.castT=0;this.airJumps=0;
    this.lastAtkEnd=-1e9;this.lastStep=0;this.move=0;
    this.atk={active:false,step:0,t:0,queued:false,hit:new Set(),dur:0,on:[0,0],f:1};

    this.physics.world.setBounds(0,0,this.lw,LH);
    this.physics.world.setBoundsCollision(!ex.left,!ex.right,!ex.up,!ex.down);
    this.physics.add.collider(p,this.solids);
    this.physics.add.collider(p,this.oneways,null,()=>p.dropT<=0&&!this.climbing);
    this.enemies=this.physics.add.group();
    const solidMob=e=>!e.noclip;this.physics.add.collider(this.enemies,this.solids,null,solidMob);this.physics.add.collider(this.enemies,this.oneways,null,solidMob);
    const ew=[];[[-8],[this.lw+8]].forEach(([x])=>{const z=this.add.zone(x,LH/2,16,LH);this.physics.add.existing(z,true);ew.push(z)});
    this.physics.add.collider(this.enemies,ew);
    this.wallGroup=this.physics.add.staticGroup();
    this.physics.add.collider(p,this.wallGroup);this.physics.add.collider(this.enemies,this.wallGroup);
    this.platGroup=this.physics.add.group({allowGravity:false,immovable:true});
    this.physics.add.collider(p,this.platGroup,(pl,pf)=>{if(pf.isFaller&&pl.body.touching.down)pf.touched=true},()=>p.dropT<=0&&!this.climbing);
    this.physics.add.collider(this.enemies,this.platGroup);
    this.hearts=this.physics.add.group();
    this.physics.add.collider(this.hearts,this.solids);this.physics.add.collider(this.hearts,this.oneways);
    this.physics.add.overlap(p,this.hearts,(pl,h)=>{const s=this.stats;
      if(h.kind==='gold'){this.takeGold(h.val,h.x,h.y);h.destroy();return}
      if(h.kind){STATE.items[h.kind]=(STATE.items[h.kind]||0)+1;this.popText(h.x,h.y-6,(h.kind==='potion'?'POTION':'ETHER')+' +1',h.kind==='potion'?0xff8a95:0x8ab0ff)}
      else{s.hp=Math.min(this.mhp(),s.hp+20);this.popText(h.x,h.y-6,'+20',0x7cff8a)}
      this.goldEm.explode(6,h.x,h.y);h.destroy()});

    const mk=(tint,extra={})=>this.add.particles(0,0,'px',Object.assign({lifespan:{min:250,max:600},speed:{min:40,max:140},angle:{min:0,max:360},gravityY:380,scale:{start:1,end:0},tint,emitting:false},extra)).setDepth(40);
    this.sparkEm=mk([0xffffff,0x9fe8ff,0xffe27a],{speed:{min:60,max:160},lifespan:{min:120,max:300}});
    this.slimeEm=mk([0x5fcf5a,0x2f8a3a,0xe8ffe0]);
    this.kingEm=mk([0x5a8cff,0x2f4fb0,0xf0c040,0xe0ecff],{speed:{min:60,max:200}});
    this.goldEm=mk([0xffd34a,0xfff2a0,0xe8742a],{gravityY:-60,speed:{min:20,max:90}});
    this.dustEm=mk(R.theme==='ice'?[0xffffff,0xcfeaff]:R.theme==='desert'?[0xf0d090,0xd8a868]:R.theme==='lava'?[0x5a4448,0xff8a2a]:R.theme==='sky'?[0xffffff,0xd8e8f8]:R.theme==='demon'?[0x5a4a6a,0x9a3aff]:R.theme==='cave'?[0x8a849e,0x6a6480]:[0xd8c8a0,0xb8a478],{speed:{min:10,max:45},angle:{min:190,max:350},gravityY:-30,lifespan:{min:200,max:380}});
    this.rockEm=mk([0x5a5470,0x7a7494,0x3a3448],{speed:{min:40,max:150},gravityY:500,lifespan:{min:400,max:800},scale:{start:1.5,end:0.5}});
    this.batEm=mk([0x5a3a7a,0x8a6aaa,0xffe27a]);
    this.snailEm=mk([0xc86a3a,0x8a3a1a,0xd8c08a,0xf0e8d8]);
    this.fireEm=mk([0xff7a2a,0xffd060,0xe8402a],{speed:{min:5,max:25},gravityY:-120,lifespan:{min:200,max:420}});
    this.auraEm=mk([0x9ff0ff,0xffd34a,0xffffff],{speed:{min:4,max:18},gravityY:-50,lifespan:{min:300,max:600}});
    this.waves=[];this.skills=[];this.dashT=0;this.breathT=0;
    // 위쪽 방의 바닥 모양 (아래 방에서 위로 뛰어오를 때 그 자리가 막혀 있으면 천장처럼 막음)
    this.upInfo=ex.up&&ROOMS[ex.up.to]?{map:buildRoomMap(ex.up.to),tx:(ROOMS[ex.up.to].exits.down||{tx:ex.up.tx}).tx,cols:ROOMS[ex.up.to].cols}:null;

    this.spawnObjects(entry);this.spawnExtras();this.spawnGimmicks();this.pogo=false;
    (R.slimes||[]).forEach(s=>this.spawnEnemy({x:s.tx*T+8,y:s.ty*T}));
    // 옆 입구 6칸 안의 몬스터는 방 안쪽 빈칸으로 밀어 둠 (들어오자마자 벽에 몰려 맞지 않게)
    (R.mobs||[]).forEach(d=>{let m=d;
      if((entry==='left'||entry==='right')&&Math.abs(d.tx*T+8-sx)<6*T&&Math.abs(d.ty*T+8-sy)<64){const dir=entry==='left'?1:-1;
        for(let tx=Math.round(sx/T)+dir*6;tx>1&&tx<this.cols-2;tx+=dir)if(this.map[d.ty]&&this.map[d.ty][tx]==='.'){m={...d,tx};break}}
      spawnMob(this,m)});
    // 위/아래 방에서 사다리를 타고 넘어오면 계속 매달린 채로 시작 (아래에서 올라오면 자동으로 조금 올라감)
    if(climb){this.startClimb();this.autoUp=entry==='bottom'}
    else if(entry==='bottom')p.setVelocityY(-360);   // 사다리 없는 굴뚝으로 올라오면 위로 튀어 오름

    const cam=this.cameras.main;cam.setBounds(0,0,this.lw,LH+HUD);cam.startFollow(p,true,0.12,0.12);cam.setDeadzone(40,28);cam.roundPixels=true;
    // HUD 전용 카메라: 화면 고정 요소(scrollFactor 0)는 여기서만 그림
    this.uiCam=this.cameras.add(0,0,W*RS.S,H*RS.S).setOrigin(0,0);
    fitCameras(this);
    this.fadeCams(false,220);
    this.ed=edges();
    this.buildHud();
    this.combo=0;this.comboT=0;this.targetT=0;this.hpGhost=this.stats.hp;this.tGhost=0;
    this.prev=this.heldNow();this.pend={};this.frozen=false;this.leaving=false;
    this.routeCams();
    // 카메라 나누기는 그리기 직전에 (update 중에 새로 만든 잔상·이펙트가 한 프레임 HUD 카메라에도 찍히던 것)
    this.events.off('prerender',this.routeCams,this);this.events.on('prerender',this.routeCams,this);
    const tut=()=>this.toast(MOBILE?'스틱 이동   X 점프   Z 공격·대화   위 버튼 장비·지도':'←→ 이동   X 점프   Z 공격   ↑ 대화   I 장비   M 지도',4600);
    // 방 이벤트(컷신): 처음 들어왔을 때 한 번
    const ev=R.event&&!STATE.flags[R.event.id]?R.event:null;
    if(ev)this.time.delayedCall(ev.delay||500,()=>{if(this.leaving||this.overlayOpen())return;STATE.flags[ev.id]=true;this.openDialog('',ev.lines,()=>{if(data.tutorial)tut()})});
    else if(data.tutorial)tut();
    if(data.retry)this.toast('보스 방 입구에서 다시 도전해요',2400);
    else if(!data.tutorial&&!data.quiet)this.toast(R.name,1800);
    if(window.onEquipChange)window.onEquipChange();
  }

  /* ----- world ----- */
  drawWorld(){
    const id=this.roomId,R=this.R,th=R.theme;
    const far={cave:drawCaveFar,castle:drawCastleFar,ice:drawIceFar,desert:drawDesertFar,lava:drawLavaFar,sky:drawSkyFar,demon:drawDemonFar}[th]||drawFar,mid={cave:drawCaveMid,treetop:drawTreetopMid,castle:drawCastleMid,ice:drawIceMid,desert:drawDesertMid,lava:drawLavaMid,sky:drawSkyMid,demon:drawDemonMid}[th]||drawMid;
    if(!this.textures.exists('far_'+id))this.textures.addCanvas('far_'+id,far(this.lw));
    if(!this.textures.exists('mid_'+id))this.textures.addCanvas('mid_'+id,mid(this.lw));
    if(!this.textures.exists('lvl_'+id))this.textures.addCanvas('lvl_'+id,drawLevel(this.map,this.cols,R.seed,R.deco,th));
    /* 원경(패럴랙스): 고해상도 줌 카메라에서는 scrollFactor가 어긋나서, 화면 왼쪽 위 기준으로 직접 위치를 맞춤 */
    const par=(o,sf)=>{o.sf=sf;o.bx=o.x;o.by=o.y;return o};
    this.par=[par(this.add.image(0,0,'far_'+id).setOrigin(0).setDepth(-10),0.1)];
    this.clouds=['cave','castle','ice','lava','demon'].includes(th)?[]:[0,1,2,0,1].map((k,i)=>par(this.add.image(i*90+Math.random()*60,12+Math.random()*50,'cloud'+k).setDepth(-9.5).setAlpha(0.95),0.15));
    this.par.push(...this.clouds,par(this.add.image(0,0,'mid_'+id).setOrigin(0).setDepth(-9),0.35));
    this.add.image(0,0,'lvl_'+id).setOrigin(0).setDepth(0);
    const cam=this.cameras.main,place=()=>{const v=cam.worldView;for(const o of this.par){o.x=o.bx+v.x*(1-o.sf);o.y=o.by+v.y*(1-o.sf)}};
    cam.on('prerender',place);this.events.once('shutdown',()=>cam.off('prerender',place));
  }
  makeAnims(){
    const mk=(key,frames,rate)=>{if(!this.anims.exists(key))this.anims.create({key,frames:frames.map(f=>({key:f})),frameRate:rate,repeat:-1})};
    mk('hero_idle',['hero_idle0','hero_idle1'],2.5);mk('hero_run',['hero_run0','hero_idle0','hero_run1','hero_idle0'],10);
    mk('slime_idle',['slime0','slime1'],3);mk('slime_cave_idle',['slime_cave0','slime_cave1'],3);mk('slime_ice_idle',['slime_ice0','slime_ice1'],3);mk('king_idle',['kslime0','kslime1'],2.5);
  }
  buildCollision(){
    const m=this.map,C=this.cols,rects=[];let prev=[];
    for(let y=0;y<ROWS;y++){const runs=[];let x=0;
      while(x<C){if(m[y][x]==='#'){const s=x;while(x<C&&m[y][x]==='#')x++;runs.push({x:s,w:x-s,y,h:1})}else x++}
      const cur=[];for(const r of runs){const p=prev.find(q=>q.x===r.x&&q.w===r.w);if(p){p.h++;cur.push(p)}else{rects.push(r);cur.push(r)}}prev=cur}
    rects.forEach(r=>{const z=this.add.zone(r.x*T+r.w*T/2,r.y*T+r.h*T/2,r.w*T,r.h*T);this.physics.add.existing(z,true);this.solids.push(z)});
    const ow=c=>c==='-'||c==='=';
    for(let y=0;y<ROWS;y++){let x=0;while(x<C){if(ow(m[y][x])){const s=x;while(x<C&&ow(m[y][x]))x++;
      const z=this.add.zone((s+x)*T/2,y*T+3,(x-s)*T,6);this.physics.add.existing(z,true);
      z.body.checkCollision.down=false;z.body.checkCollision.left=false;z.body.checkCollision.right=false;this.oneways.push(z)}else x++}}
    // 사다리·덩굴 꼭대기: 위에 서 있을 수 있는 발판 (↓ 누르면 타고 내려감)
    const cl=c=>c==='H'||c==='V';
    for(let x=0;x<C;x++)for(let y=1;y<ROWS;y++)if(cl(m[y][x])&&!cl(m[y-1][x])&&m[y-1][x]!=='#'){
      const z=this.add.zone(x*T+8,y*T+3,T,6);this.physics.add.existing(z,true);
      z.body.checkCollision.down=false;z.body.checkCollision.left=false;z.body.checkCollision.right=false;this.oneways.push(z)}
  }
  tileAt(X,Y){const tx=Math.floor(X/T),ty=Math.floor(Y/T);if(tx<0||tx>=this.cols)return'.';if(ty<0)return this.map[0][tx]==='#'?'#':this.map[0][tx];if(ty>=ROWS)return'.';return this.map[ty][tx]}
  isClimb(X,Y){const c=this.tileAt(X,Y);return c==='H'||c==='V'}
  cloudKey(w){const k='cloudp'+w;if(!this.textures.exists(k)){const[c,x]=cv(w*T,6);px(x,'#c8dcf0',0,4,w*T,2);px(x,'#ffffff',1,0,w*T-2,4);for(let i=2;i<w*T-2;i+=5)px(x,'#ffffff',i,-0,3,1);px(x,'#e8f2fc',1,3,w*T-2,1);this.textures.addCanvas(k,c)}return k}
  platKey(w){const k='plat'+w;if(!this.textures.exists(k)){const[c,x]=cv(w*T,6);for(let i=0;i<w;i++){const X=i*T;px(x,'#2a1a12',X,0,16,6);px(x,'#c08a50',X+1,0,14,1);px(x,'#9a6236',X+1,1,14,3);px(x,'#6a3e22',X+1,4,14,1);px(x,'#e8d0a0',X+3,2);px(x,'#e8d0a0',X+12,2)}this.textures.addCanvas(k,c)}return k}

  /* ----- 방 오브젝트 ----- */
  spawnObjects(entry){
    const R=this.R,p=this.player,m=this.map;
    if(R.save){
      const x=R.save.tx*T+8,g=surfaceY(m,R.save.tx);
      const glow=this.add.image(x,g-34,'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0x6fd0ff).setAlpha(0.8).setDepth(1);
      this.add.image(x,g,'statue').setOrigin(0.5,1).setScale(2).setDepth(2);
      const cr=this.add.image(x,g-34,'scrystal').setScale(2).setDepth(3);
      this.tweens.add({targets:[cr,glow],y:'-=3',duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      this.statue={x,y:g-12};this.atStatue=Math.abs(p.x-x)<20;
    }
    this.chests=roomChests(R).map(c=>{
      const x=c.tx*T+8,g=c.ty!=null?(c.ty+1)*T:surfaceY(m,c.tx),open=!!STATE.opened[c.id];
      const hint=this.add.bitmapText(x,g-20,'pix','Z').setOrigin(0.5,1).setDepth(45).setTint(0xffe27a).setVisible(false);
      this.tweens.add({targets:hint,y:'-=3',duration:400,yoyo:true,repeat:-1});
      return{def:c,x,y:g,open,hint,spr:this.add.image(x,g,open?'chest1':'chest0').setOrigin(0.5,1).setDepth(4).setTint(c.gold?0xfff0a0:0xffffff)}});
    if(R.crystal&&!STATE.collected[R.crystal.id]){
      const c=R.crystal,x=c.tx*T+8,y=(c.ty+1)*T-8;
      const glow=this.add.image(x,y,'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff6a9a).setScale(0.7).setDepth(1);
      const spr=this.add.image(x,y,'lcrystal').setDepth(4);
      this.tweens.add({targets:[spr,glow],y:'-=3',duration:700,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      this.crystal={def:c,x,y,spr,glow};
    }
    if(R.boss){
      const bx=R.boss.tx*T+8;
      const B=R.boss,id=B.id||'king';
      if(!bossDone(id)){
        if(id==='king')this.spawnEnemy({x:bx,y:R.boss.ty*T,king:true});else spawnMob(this,{t:id,tx:B.tx,ty:B.ty});
        // 보스를 쓰러뜨리기 전에는 방을 나갈 수 없음
        this.bossLock=true;this.physics.world.setBoundsCollision(true,true,!R.exits.up,!R.exits.down);
        this.time.delayedCall(700,()=>{this.banner(B.title||'KING SLIME',0xff7a7a);this.toast(B.intro||'슬라임 둥지의 주인이 나타났다!',2600)});
      }else if(R.boss.drop&&!STATE.collected['drop_'+this.roomId])this.spawnPickup(R.boss.drop,bx,floorTopY(m,R.boss.tx)-14,'drop_'+this.roomId);
    }
    (R.movers||[]).forEach(d=>{
      const s=this.platGroup.create(d.tx*T+d.w*T/2,d.ty*T+3,this.platKey(d.w));
      s.body.checkCollision.down=s.body.checkCollision.left=s.body.checkCollision.right=false;
      Object.assign(s,{mv:d,x0:s.x,y0:s.y,range:d.range*T,spd:d.speed});s.body.friction.set(0,0);
      if(d.axis==='x')s.setVelocityX(d.speed);else s.setVelocityY(d.speed);s.setDepth(3);
    });
    [...(R.fallers||[]),...(R.clouds||[]).map(d=>({...d,cloud:true}))].forEach(d=>{
      const s=this.platGroup.create(d.tx*T+d.w*T/2,d.ty*T+3,d.cloud?this.cloudKey(d.w):this.platKey(d.w));if(!d.cloud)s.setTint(0xd8c0a0);s.cloud=!!d.cloud;
      s.body.checkCollision.down=s.body.checkCollision.left=s.body.checkCollision.right=false;
      Object.assign(s,{isFaller:true,x0:s.x,y0:s.y,touched:false,t:0,falling:false});s.setDepth(3);this.fallers.push(s);
    });
    (R.mushrooms||[]).forEach(d=>{const x=d.tx*T+8,y=(d.ty+1)*T;this.mushrooms.push({x,y,spr:this.add.image(x,y,'mush0').setOrigin(0.5,1).setDepth(4)})});
    (R.breaks||[]).forEach(d=>{
      if(STATE.broken[d.id])return;
      const w={def:d,hp:3,imgs:[],zones:[],rect:new Phaser.Geom.Rectangle(d.tx*T,d.ty*T,T,d.h*T)};
      for(let i=0;i<d.h;i++){const x=d.tx*T+8,y=(d.ty+i)*T+8;w.imgs.push(this.add.image(x,y,'crackrock').setDepth(3));
        const z=this.add.zone(x,y,T,T);this.physics.add.existing(z,true);this.wallGroup.add(z);w.zones.push(z)}
      this.walls.push(w);
    });
  }
  spawnPickup(itemId,x,y,key){
    const glow=this.add.image(x,y,'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe27a).setScale(0.6).setDepth(1);
    const spr=this.add.image(x,y,'icon_'+itemId).setDepth(5);
    this.tweens.add({targets:[spr,glow],y:'-=3',duration:600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.pickups.push({itemId,key,x,y,spr,glow});
  }
  updateObjects(dt,held,press={}){
    const p=this.player,b=p.body;
    this.updateExtras(dt,held,press);this.updatePortals(press);
    if(this.statue){const near=Math.abs(p.x-this.statue.x)<14&&Math.abs(p.y-this.statue.y)<22;
      if(near&&!this.atStatue&&!p.dead)this.doSave();
      if(!near&&Math.abs(p.x-this.statue.x)>26)this.atStatue=false;}
    this.chests.forEach(c=>c.hint.setVisible(!c.open&&Math.abs(p.x-c.x)<40&&Math.abs(p.y-(c.y-8))<30));
    if(this.crystal&&Math.abs(p.x-this.crystal.x)<11&&Math.abs(p.y-this.crystal.y)<14)this.takeCrystal();
    this.pickups=this.pickups.filter(k=>{if(Math.abs(p.x-k.x)<11&&Math.abs(p.y-k.y)<14){STATE.collected[k.key]=true;k.spr.destroy();k.glow.destroy();this.giveItem(k.itemId,k.x,k.y,true);return false}return true});
    // 움직이는 발판
    this.platGroup.getChildren().forEach(s=>{
      if(s.mv){const d=s.mv;if(d.axis==='x'){if(s.x>=s.x0+s.range)s.setVelocityX(-s.spd);else if(s.x<=s.x0)s.setVelocityX(s.spd)}
        else{if(s.y>=s.y0+s.range)s.setVelocityY(-s.spd);else if(s.y<=s.y0)s.setVelocityY(s.spd)}
        // 발판 위에 서 있으면 발판이 움직인 만큼 같이 이동 (가만히 있어도 따라감)
        const bx=s.body.x,by=s.body.y,dx=s.lbx==null?0:bx-s.lbx,dy=s.lby==null?0:by-s.lby;s.lbx=bx;s.lby=by;
        const pb=p.body;
        if((dx||dy)&&!this.climbing&&p.dropT<=0&&pb.velocity.y>=-1&&Math.abs(pb.bottom-s.body.top)<=3&&pb.right>s.body.left&&pb.left<s.body.right){p.x+=dx;if(dy>0)p.y+=dy}
      }
      if(s.isFaller){
        if(s.touched&&!s.falling){s.t+=dt;s.x=s.x0+(Math.floor(s.t*30)%2?1:-1);
          if(s.t>(s.cloud?0.6:0.45)){s.falling=true;s.x=s.x0;s.body.checkCollision.up=false;if(!s.cloud)s.setVelocityY(170);else this.dustEm.explode(8,s.x,s.y);this.tweens.add({targets:s,alpha:0,duration:s.cloud?300:700});
            this.time.delayedCall(2800,()=>{if(!s.active)return;s.setVelocityY(0);s.setPosition(s.x0,s.y0);s.body.reset(s.x0,s.y0);s.setAlpha(1);s.body.checkCollision.up=true;Object.assign(s,{touched:false,t:0,falling:false})})}}
      }
    });
    // 점프 버섯
    this.mushrooms.forEach(mu=>{
      if(b.velocity.y>0&&Math.abs(p.x-mu.x)<10&&b.bottom>=mu.y-12&&b.bottom<=mu.y+1&&!this.climbing){
        p.setVelocityY(held.jump?-480:-440);this.airJumps=0;this.bounceT=0.6;mu.spr.setTexture('mush1');this.time.delayedCall(140,()=>mu.spr.setTexture('mush0'));
        this.dustEm.explode(5,mu.x,mu.y-8);
      }});
    // 가시
    if(!p.dead&&p.inv<=0){const yb=b.bottom-1;
      // 가시: 제자리에서 위·뒤로 살짝 튕겨 나가며 피해만 입음 (무적 시간 동안 빠져나오면 됨)
      if(this.tileAt(b.left+2,yb)==='^'||this.tileAt(b.right-2,yb)==='^'||this.tileAt(b.center.x,yb)==='^'){
        const back=Math.abs(b.velocity.x)>10?-Math.sign(b.velocity.x):-this.facing;this.hurtBy(this.trap(18),p.x-back*10,'spike');
        if(!p.dead){p.setVelocity(back*90,-280);this.sparkEm.explode(6,p.x,b.bottom)}}}
  }
  doSave(){
    const s=this.stats;this.atStatue=true;
    s.hp=this.mhp();s.mp=s.maxMp;STATE.save={room:this.roomId};STATE.room=this.roomId;saveGame();
    this.popText(this.statue.x,this.statue.y-22,'SAVE',0x8fe3ff);this.auraEm.explode(16,this.statue.x,this.statue.y-12);
    this.toast('기록했어요. HP와 MP가 모두 회복됐어요',2200);
  }
  openChest(c){
    if(c.open)return;c.open=true;STATE.opened[c.def.id]=true;c.hint.setVisible(false);
    c.spr.setTexture('chest1');this.goldEm.explode(24,c.x,c.y-10);sfx('chest');this.shake(80,0.006);
    if(c.def.gold){this.dropGold(c.x,c.y-12,c.def.gold);return}
    if(c.def.item&&c.def.item.startsWith('key_')){this.giveKey(c.def.item.slice(4),c.x,c.y-10);return}
    this.giveItem(c.def.item,c.x,c.y-10,false);
  }
  /* 아이템 획득: 가방에 넣고, 해당 칸이 비어 있으면 바로 장착 */
  giveItem(id,x,y,direct){
    const it=ITEMS[id];if(!it)return;
    const icon=this.add.image(x,y,'icon_'+id).setDepth(46);
    if(!direct)this.tweens.add({targets:icon,y:y-24,duration:500,ease:'Back.easeOut'});
    this.time.delayedCall(direct?200:1100,()=>{
      this.tweens.add({targets:icon,x:this.player.x,y:this.player.y,alpha:0,scale:0.5,duration:300,onComplete:()=>icon.destroy()});
      if(!STATE.bag.includes(id))STATE.bag.push(id);
      const cur=ITEMS[this.equip[it.slot]];const auto=!cur||(it.slot==='weapon'&&(it.atk||0)>(cur.atk||0));
      const before=equipBonus(this.equip).sets;
      if(auto)this.setEquip(it.slot,id,true);
      this.banner('NEW ITEM!',0xffd34a);
      if(id==='relic_sword'&&!STATE.flags.ending)this.time.delayedCall(3800,()=>{STATE.flags.ending=true;this.openDialog('',[
        {n:'나',t:'이게... 할아버지가 평생 찾아 헤매던 전설의 검.'},{n:'할아버지의 목소리',t:'...잘 해냈구나, {name}. 고향을 떠나 여기까지 온 네가 자랑스럽다.'},
        {n:'할아버지의 목소리',t:'그 검은 이제 네 것이다. 네가 지키고 싶은 것을 위해 휘두르거라.'},{n:'나',t:'고마워요, 할아버지. 이제 집으로 돌아가요. 엄마가 기다리고 있을 거예요.'},
        {n:'할아버지의 목소리',t:'...그런데 고성 탑 꼭대기의 봉인이 풀린 것 같구나. 하늘 위, 마왕의 성으로 가는 길이...'},
        {n:'',t:'- 소드 레릭 1부 끝 -   (고성 탑 꼭대기에서 2부가 이어져요)'}])});
      this.toast(josa(it.name,'을','를')+' 얻었다!  '+statLine(it)+(auto?'':'  (I 키로 장착)'),3400);
      const after=equipBonus(this.equip).sets.filter(k=>!before.includes(k));
      after.forEach(k=>this.time.delayedCall(3600,()=>{this.banner('SET BONUS!',0x9ff0ff);this.toast(SETS[k].name+' 완성!  '+SETS[k].desc,3400);this.auraEm.explode(30,this.player.x,this.player.y)}));
    });
  }
  takeCrystal(){
    const c=this.crystal,s=this.stats;this.crystal=null;STATE.collected[c.def.id]=true;
    s.maxHp+=20;s.hp=this.mhp();c.spr.destroy();c.glow.destroy();
    this.goldEm.explode(20,c.x,c.y);this.banner('MAX HP UP!',0xff8ab0);this.toast('생명의 결정! 최대 HP +20',3000);
  }
  grantDoubleJump(){
    STATE.abilities.djump=true;const p=this.player;
    this.auraEm.explode(30,p.x,p.y);this.banner('DOUBLE JUMP!',0x9ff0ff);
    this.toast('2단 점프를 얻었다! 공중에서 점프를 한 번 더 누르세요',4200);
    this.time.delayedCall(4800,()=>this.toast('바람 언덕 높은 곳에서 뭔가 빛나던데...',3200));
  }
  hitWalls(hb,tag){
    this.walls.forEach(w=>{if(w.hp<=0||w.lastHit===tag)return;
      if(Phaser.Geom.Intersects.RectangleToRectangle(hb,w.rect)){w.lastHit=tag;w.hp--;
        this.rockEm.explode(6,w.rect.centerX,w.rect.centerY);this.shake(70,0.006);
        w.imgs.forEach(i=>{i.setTintFill(0xffffff);this.time.delayedCall(60,()=>i.active&&i.clearTint())});
        if(w.hp<=0){STATE.broken[w.def.id]=true;w.imgs.forEach(i=>{this.rockEm.explode(10,i.x,i.y);i.destroy()});w.zones.forEach(z=>z.destroy());
          this.toast('벽이 무너지고 길이 열렸다!',2400)}}});
  }

  /* ----- 방 이동 ----- */
  goRoom(id,entry,dx){
    if(this.leaving)return;this.leaving=true;STATE.visited[id]=true;
    this.fadeCams(true,180,()=>this.scene.restart({room:id,entry,dx:dx||0}));
  }
  /* 그 x 위치가 비어 있으면(막힌 블록이 없으면) 방 안쪽으로 맞춘 x, 아니면 null */
  freeCol(x,ys){
    x=Phaser.Math.Clamp(x,8,this.lw-8);
    return ys.every(y=>{const c=this.tileAt(x,y);return c!=='#'&&c!=='A'&&c!=='B'&&c!=='L'&&c!=='^'})?x:null;
  }
  upBlocked(x){
    const U=this.upInfo;if(!U)return false;const ux=U.tx*T+8+(x-(this.R.exits.up.tx*T+8));
    if(ux<4||ux>U.cols*T-4)return true;const c=Math.floor(ux/T);
    return[ROWS-1,ROWS-2].some(r=>{const ch=U.map[r][c];return ch==='#'||ch==='A'||ch==='B'||ch==='L'||ch==='^'});
  }
  checkExits(){
    const p=this.player,ex=this.R.exits;if(this.leaving||p.dead)return;
    // 위 방 바닥이 막힌 자리로 뛰어오르면 천장에 부딪힌 것처럼 (사다리·덩굴 자리나 뚫린 곳으로만 올라감)
    if(ex.up&&!this.climbing&&p.body.top<6&&p.body.velocity.y<0&&this.upBlocked(p.x)){p.setVelocityY(0);if(p.body.top<0)p.y-=p.body.top;return}
    if(ex.left&&p.x<-2)this.goRoom(ex.left,'right');
    else if(ex.right&&p.x>this.lw+2)this.goRoom(ex.right,'left');
    else if(ex.up&&p.y<-4)this.goRoom(ex.up.to,'bottom',Math.round(p.x-(ex.up.tx*T+8)));
    else if(ex.down&&p.y>LH+6){
      // 위아래로 이어진 방: 어디로 떨어지든 아래 방의 같은 자리로. 용암·가시·모래 구덩이에 빠졌을 때만 다치고 안전한 곳으로
      const c=this.tileAt(p.x,LH-8),dx=Math.round(p.x-(ex.down.tx*T+8));
      if((c==='L'||c==='^'||c==='S')&&Math.abs(dx)>20)this.fallPit();
      else this.goRoom(ex.down.to,'top',dx);
    }
  }
  fallPit(){
    const p=this.player;if(p.dead)return;const sf=this.safe||this.safeSpot();
    p.body.reset(sf.x,sf.y-2);p.inv=0;this.hurtBy(this.trap(18),sf.x,'pit');
    p.setVelocity(0,0);if(!p.dead)p.inv=Math.max(p.inv,1);
  }

  /* 안전한 자리를 아직 모를 때: 왼쪽부터 처음으로 디딜 곳이 있는 칸 */
  safeSpot(){for(let tx=0;tx<this.cols;tx++){const y=surfaceY(this.map,tx);if(y<LH)return{x:tx*T+8,y:y-9}}return{x:this.player.x,y:40}}

  /* ----- 장비 ----- */
  mhp(){return this.stats.maxHp+this.bonus.hp}
  atkVal(){return this.stats.atk+this.bonus.atk+wlvAtk((STATE.wlv||{})[this.equip.weapon]||0)}
  defVal(){return this.bonus.def}
  /* 점프는 최대 2단 (땅 점프 + 공중 1번) */
  maxAirJumps(){return Math.min(1,(STATE.abilities.djump?1:0)+this.bonus.airJumps)}
  updatePogo(dt){
    const p=this.player,b=p.body;if(b.velocity.y<240)p.setVelocityY(Math.min(380,b.velocity.y+900*dt));this.fxPogo(dt);
    const hb=new Phaser.Geom.Rectangle(p.x-6,b.bottom-4,12,16);let bounce=false;
    this.enemies.getChildren().slice().forEach(e=>{if(!e.active||this.pogoHit.has(e))return;const eb=e.body;
      if(Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(eb.x,eb.y,eb.width,eb.height))){this.pogoHit.add(e);bounce=true;
        this.hitEnemy(e,Math.round(this.atkVal()*1.25*(0.9+Math.random()*0.2)),false,this.facing,false)}});
    this.chests.forEach(c=>{if(!c.open&&Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(c.x-7,c.y-11,14,11))){this.openChest(c);bounce=true}});
    const wb=this.walls.some(w=>w.hp>0&&Phaser.Geom.Intersects.RectangleToRectangle(hb,w.rect));this.hitWalls(hb,'pogo'+Math.floor(this.time.now/250));if(wb)bounce=true;
    this.hitSwitches(hb);this.slashShots(hb);
    if(bounce){p.setVelocityY(-310);this.airJumps=0;this.bounceT=0.3;this.pogoHit=new Set();this.fxPogoImpact(p.x,b.bottom+6)}
  }
  updateSword(){
    const p=this.player,a=this.atk;
    if(this.pogo&&!p.dead){this.sword.setVisible(true).setFlipX(false).setAngle(90).setOrigin(0.09,0.5).setPosition(p.x,p.y+2);return}
    this.sword.setAngle(0);
    const on=!p.dead&&p.hurtT<=0&&!this.climbing&&(a.active||this.castT>0);
    this.sword.setVisible(on);if(!on)return;
    const f=a.active?a.f:this.facing;
    this.sword.setPosition(p.x+f*7,p.y+4).setFlipX(f<0).setOrigin(f>0?0.09:0.91,0.5);
  }
  redrawHero(){
    for(const f in HERO_FRAMES){const t=this.textures.get('hero_'+f),c=t.getContext();c.clearRect(0,0,HERO_W,HERO_H);drawHero(c,f,LOOK,this.equip);t.refresh()}
    if(this.sword)this.sword.setTexture('sword_'+this.equip.weapon);
  }
  setEquip(slot,id,fx){
    this.equip[slot]=id;this.bonus=equipBonus(this.equip);this.redrawHero();
    this.stats.hp=Math.min(this.stats.hp,this.mhp());
    if(fx){const p=this.player;p.setTintFill(0xffffff);this.time.delayedCall(90,()=>{if(!p.dead)p.clearTint()});this.goldEm.explode(16,p.x,p.y)}
    if(window.onEquipChange)window.onEquipChange();
  }
  giveAllForTest(){Object.keys(ITEMS).forEach(id=>{if(!ITEMS[id].hidden&&!STATE.bag.includes(id))STATE.bag.push(id)});
    ['helm','armor','boots','acc'].forEach(s=>{const id=Object.keys(ITEMS).find(k=>ITEMS[k].slot===s&&!ITEMS[k].hidden);if(id)this.setEquip(s,id)});
    STATE.items.potion=(STATE.items.potion||0)+5;STATE.items.ether=(STATE.items.ether||0)+5;
    this.setEquip('weapon','slime_blade',true);this.banner('TEST GEAR',0x9ff0ff)}

  /* ----- HUD ----- */
  buildHud(){
    const y0=H-HUD,fix=o=>o.setScrollFactor(0).setDepth(100);
    this.hud=fix(this.add.graphics());
    fix(this.add.bitmapText(5,y0+3,'pix','LV')).setTint(0xe8c04a);
    this.lvTxt=fix(this.add.bitmapText(5,y0+8,'dmg','1')).setLetterSpacing(-2);
    fix(this.add.bitmapText(26,y0+4,'pix','HP')).setTint(0xff8a95);
    fix(this.add.bitmapText(26,y0+12,'pix','MP')).setTint(0x8ab0ff);
    this.hpTxt=fix(this.add.bitmapText(98,y0+4,'pix',''));
    this.mpTxt=fix(this.add.bitmapText(98,y0+12,'pix',''));
    this.buildQuick();
    this.nameTxt=fix(this.add.text(196,y0+2,'',{fontFamily:F9,fontSize:'10px',color:'#ece7f7'})).setVisible(false);
    this.hintTxt=fix(this.add.text(196,y0+5,'',{fontFamily:F9,fontSize:'10px',color:'#8f86ab'}));
    this.tHpTxt=fix(this.add.bitmapText(270,y0+14,'pix','')).setVisible(false);
    // 오른쪽: 골드, 장착 무기 (+강화 단계)
    this.goldIco=fix(this.add.image(0,y0+6,'coin'));this.goldTxt=fix(this.add.bitmapText(W-5,y0+3,'pix','0')).setOrigin(1,0).setTint(0xffd34a);
    this.wIco=fix(this.add.image(W-24,y0+15,'icon_traveler_sword')).setScale(0.75);this.wLvTxt=fix(this.add.bitmapText(W-5,y0+13,'pix','')).setOrigin(1,0).setTint(0x9ff0ff);
    this.comboTxt=this.add.bitmapText(8,8,'dmg','').setScrollFactor(0).setDepth(110).setTint(0xffd34a).setLetterSpacing(-2).setVisible(false);
    this.toastTxt=this.add.text(W/2,6,'',{fontFamily:F9,fontSize:'10px',color:'#fff8e0',backgroundColor:'#1a1230dd',padding:{x:7,y:4},align:'center'})
      .setOrigin(0.5,0).setScrollFactor(0).setDepth(130).setVisible(false);
    this.mmGfx=this.add.graphics().setScrollFactor(0).setDepth(105);
    // 창(대화·장비·지도·상점)은 320폭 기준으로 그려서, 화면이 넓으면 이 상자째 가운데로 옮김
    this.ovl=this.add.container((W-320)/2,0).setScrollFactor(0).setDepth(200);
  }
  setTextRes(){}
  /* 창 요소를 가운데 상자에 넣음. 상자 안은 depth가 아니라 넣은 순서로 그려짐 */
  toOvl(o,d){o.setScrollFactor(0).setDepth(d);if(d>=200&&this.ovl){if(o.type==='Text'){o._rs=RS.S;o.setResolution(RS.S)}this.ovl.add(o)}return o}
  /* 화면 고정 요소는 HUD 카메라에서만, 나머지는 월드 카메라에서만 그림 */
  routeCams(){const m=this.cameras.main.id,u=this.uiCam.id;
    this.children.list.forEach(o=>{const f=o.scrollFactorX===0?m:u;if(o.cameraFilter!==f)o.cameraFilter=f})}
  fadeCams(out,ms,cb){
    [this.cameras.main,this.uiCam].forEach(c=>out?c.fadeOut(ms,0,0,0):c.fadeIn(ms,0,0,0));
    if(cb)this.cameras.main.once('camerafadeoutcomplete',cb);
  }
  toast(msg,ms=2400){
    msg=keyText(msg);
    const t=this.toastTxt;if(!t)return;this.tweens.killTweensOf(t);
    t.setText(msg).setVisible(true).setAlpha(0).setY(landPad()?42:6);
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
    // 현재 방 주변(가로 ±2, 세로 ±1)만 표시
    const cg=ROOMS[this.roomId].grid,G=i=>ROOMS[i].grid,ids=Object.keys(ROOMS).filter(i=>Math.abs(G(i)[0]-cg[0])<=2&&Math.abs(G(i)[1]-cg[1])<=1),cw=12,ch=7,gap=3;
    const minX=Math.min(...ids.map(i=>G(i)[0])),maxX=Math.max(...ids.map(i=>G(i)[0])),minY=Math.min(...ids.map(i=>G(i)[1])),maxY=Math.max(...ids.map(i=>G(i)[1]));
    const mw=(maxX-minX+1)*cw+(maxX-minX)*gap,mh=(maxY-minY+1)*ch+(maxY-minY)*gap,x0=W-mw-8,y0=7;
    g.fillStyle(0x0f0b1e,0.72).fillRect(x0-4,y0-4,mw+8,mh+8);g.lineStyle(1,0xc9a24a,0.9).strokeRect(x0-4.5,y0-4.5,mw+9,mh+9);
    const pos=i=>[x0+(G(i)[0]-minX)*(cw+gap),y0+(G(i)[1]-minY)*(ch+gap)];
    const nb=j=>{const e=ROOMS[j].exits;return[e.left,e.right,e.up&&e.up.to,e.down&&e.down.to].filter(Boolean)};
    const known=i=>STATE.visited[i]||ids.some(j=>STATE.visited[j]&&nb(j).includes(i));
    ids.forEach(i=>{if(!STATE.visited[i])return;const[x,y]=pos(i),e=ROOMS[i].exits;
      if(e.right&&known(e.right))g.fillStyle(0x7a6a9a,1).fillRect(x+cw,y+3,gap,1);
      if(e.left&&known(e.left))g.fillStyle(0x7a6a9a,1).fillRect(x-gap,y+3,gap,1);
      if(e.down&&known(e.down.to)){const[dx]=pos(e.down.to);g.fillStyle(0x7a6a9a,1).fillRect(Math.round((x+dx)/2)+cw/2,y+ch,1,gap)}
      if(e.up&&known(e.up.to)){const[ux]=pos(e.up.to);g.fillStyle(0x7a6a9a,1).fillRect(Math.round((x+ux)/2)+cw/2,y-gap,1,gap)}});
    ids.forEach(i=>{if(!known(i))return;const[x,y]=pos(i),R=ROOMS[i];
      if(!STATE.visited[i]){g.lineStyle(1,0x5a4f7a,1).strokeRect(x+0.5,y+0.5,cw-1,ch-1);return}
      const cur=i===this.roomId,blink=Math.floor(time/350)%2,base=THEME_COL[R.theme]||0x3f7a3a;
      g.fillStyle(cur?(blink?0xffe27a:0xc9a24a):base,1).fillRect(x,y,cw,ch);
      g.fillStyle(cur?0xfff3b0:0xffffff,cur?1:0.18).fillRect(x,y,cw,1);
      if(R.save)g.fillStyle(0x7cff8a,1).fillRect(x+2,y+3,2,2);
      if(R.boss&&!bossDone(R.boss.id||'king'))g.fillStyle(0xff4a5a,1).fillRect(x+cw/2-1,y+2,3,3);
      if(roomChests(R).some(c=>!STATE.opened[c.id]))g.fillStyle(0xffd34a,1).fillRect(x+cw-4,y+3,2,2);
    });
  }
  drawHud(dt,time){
    const g=this.hud,s=this.stats,y0=H-HUD,mh=this.mhp();g.clear();
    g.fillStyle(0x0f0b1e,1).fillRect(0,y0,W,HUD);g.fillStyle(0xc9a24a,1).fillRect(0,y0,W,1);g.fillStyle(0x3a2a5a,1).fillRect(0,y0+1,W,1);
    g.fillStyle(0x2a2046,1).fillRect(191,y0+4,1,15);
    this.hpGhost=this.hpGhost>s.hp?Math.max(s.hp,this.hpGhost-mh*dt*0.6):s.hp;
    this.bar(g,38,y0+4,56,5,s.hp/mh,this.hpGhost/mh,0xe0404f,0xff8a95);
    this.bar(g,38,y0+12,56,5,s.mp/s.maxMp,0,0x3a6ae0,0x8ab0ff);
    this.drawQuick(g);
    g.fillStyle(0x241a3a,1).fillRect(4,y0+21,W-8,2);g.fillStyle(0xe8c04a,1).fillRect(4,y0+21,Math.round((W-8)*s.exp/s.next),2);
    this.lvTxt.setText(String(s.lv));this.hpTxt.setText(Math.ceil(s.hp)+'/'+mh);this.mpTxt.setText(Math.floor(s.mp)+'/'+s.maxMp);
    if(this.tInfo&&this.targetT>0){const e=this.tInfo.e,hp=Math.max(0,e.hp);
      this.tGhost=this.tGhost>hp?Math.max(hp,this.tGhost-e.maxHp*dt*0.8):hp;
      const boss=!!(e.boss||e.king);this.nameTxt.setText((boss?'BOSS  ':'')+e.nm).setColor(boss?'#ff7a7a':'#ece7f7').setVisible(true);this.hintTxt.setVisible(false);
      this.bar(g,196,y0+15,70,4,hp/e.maxHp,this.tGhost/e.maxHp,boss?0xff3a3a:0xe0404f,0xff8a95);
      this.tHpTxt.setText(Math.ceil(hp)+'/'+e.maxHp).setVisible(true);
    }else{this.nameTxt.setVisible(false);this.tHpTxt.setVisible(false);
      this.hintTxt.setText(this.R.name).setVisible(true)}
    this.goldTxt.setText(String(STATE.gold||0));this.goldIco.setX(W-9-this.goldTxt.width);
    const wl=(STATE.wlv||{})[this.equip.weapon]||0;this.wIco.setTexture('icon_'+this.equip.weapon);this.wLvTxt.setText(wl?'+'+wl:'');this.wIco.setX(W-11-(wl?this.wLvTxt.width+1:0));
    this.drawMinimap(time);
  }

  /* ----- input ----- */
  heldNow(){
    const v=VP;
    return{left:isDown('ArrowLeft','KeyA')||v.left,right:isDown('ArrowRight','KeyD')||v.right,up:isDown('ArrowUp','KeyW')||v.up,down:isDown('ArrowDown','KeyS')||v.down,
      jump:isDown('KeyX','Space','KeyK')||v.jump,atk:isDown('KeyZ','KeyJ')||v.attack,skill:isDown('KeyC','KeyL')||v.skill,menu:isDown('KeyI')||v.menu,map:isDown('KeyM')||v.map,
      q0:isDown('Digit1','Numpad1')||v.q0,q1:isDown('Digit2','Numpad2')||v.q1,q2:isDown('Digit3','Numpad3')||v.q2,q3:isDown('Digit4','Numpad4')||v.q3};
  }
  readInput(){
    const held=this.heldNow(),esc=this.ed('esc',isDown('Escape')||VP.back);
    const pr=this.prev,press={};['jump','atk','skill','menu','map','up','q0','q1','q2','q3'].forEach(k=>press[k]=held[k]&&!pr[k]);
    if(esc&&this.menu)press.menu=true;
    // 폰: NPC·워프 받침대·순간이동 문 앞에서는 공격 버튼이 ↑ 역할 (말 걸기·이동)
    // (스틱 ↑는 사다리 오르기에만 쓰고 상호작용은 안 함)
    if(MOBILE){press.up=false;if(press.atk&&this.canTalk&&!this.overlayOpen()){press.atk=false;press.up=true}}
    this.prev=held;
    if(this.frozen){for(const kk in press)if(press[kk])this.pend[kk]=true}
    else{for(const kk in this.pend)press[kk]=press[kk]||this.pend[kk];this.pend={}}
    return{held,press};
  }

  update(time,delta){
    fitCameras(this);
    const dt=Math.min(delta,50)/1000,inp=this.readInput();
    if(this.dlg){this.updateDialog(dt);this.drawHud(0,time);return}
    if(this.listm){this.updateList();this.drawHud(0,time);return}
    if(this.warpm){this.updateWarp(time);this.drawHud(0,time);return}
    if(this.mapv){this.updateMap(time);this.drawHud(0,time);return}
    if(inp.press.menu)this.toggleMenu();
    if(this.menu){this.updateMenu();this.drawHud(0,time);return}
    if(inp.press.map){this.openMap();this.drawHud(0,time);return}
    for(let i=0;i<4;i++)if(inp.press['q'+i])this.useQuick(i);
    this.clouds.forEach((c,i)=>{c.bx+=dt*(3+i*1.5);if(c.bx>W+(this.lw-W)*0.15+60)c.bx=-60});
    if(!this.frozen){
      STATE.time=(STATE.time||0)+dt;
      if(!this.player.dead)this.updatePlayer(dt,inp,time);
      this.updateAttack(dt);this.updateSword();this.updateWaves(dt);this.updateSkills(dt);this.updateEnemies(dt,time);updateQuakes(this,dt);updateEShots(this,dt);
      if(!this.player.dead)this.physics.overlap(this.player,this.enemies,(pl,e)=>this.hurtPlayer(e));
      this.hearts.getChildren().slice().forEach(h=>{h.life-=dt;h.setVelocityX(h.body.velocity.x*0.95);if(h.life<3)h.setAlpha(Math.floor(time/90)%2?.3:1);if(h.life<=0)h.destroy()});
      const s=this.stats;s.mp=Math.min(s.maxMp,s.mp+3*dt);
      if(this.comboT>0){this.comboT-=dt;if(this.comboT<=0){this.combo=0;this.comboTxt.setVisible(false)}}
      if(this.targetT>0)this.targetT-=dt;
      this.updateObjects(dt,inp.held,inp.press);this.updateGimmicks(dt);this.updateHazards(dt);this.checkExits();
    }
    this.drawHud(dt,time);
  }

  startClimb(){const p=this.player;this.climbing=true;p.body.setAllowGravity(false);p.setVelocity(0,0);this.atk.active=false;if(this.slash){this.slash.destroy();this.slash=null}}
  stopClimb(){this.climbing=false;this.autoUp=false;this.player.body.setAllowGravity(true)}
  updateClimb(dt,{held,press},now){
    const p=this.player,b=p.body,move=(held.right?1:0)-(held.left?1:0);
    const cx=Math.floor(p.x/T)*T+8;p.x+=(cx-p.x)*Math.min(1,dt*14);
    if(held.down||held.left||held.right)this.autoUp=false;
    const vy=((held.down?1:0)-((held.up||this.autoUp)?1:0))*CLIMB_SPEED;p.setVelocity(0,vy);
    if(move)this.facing=move;
    // 사다리에서는 뒷모습. 오르내리는 만큼 팔다리를 번갈아 움직임
    p.anims.stop();p.setTexture(Math.floor(p.y/7)%2?'hero_climb1':'hero_climb0');p.setFlipX(false);
    if(press.jump){this.stopClimb();p.setVelocity(move*SPEED,-JUMP*0.75);sfx('jump');p.setFlipX(this.facing<0);return}
    // 방 아래쪽 출구로 이어진 사다리는 화면 끝까지 매달린 채로 내려감
    const dn=this.R.exits.down,toBelow=dn&&b.bottom>=LH-2&&Math.abs(p.x-(dn.tx*T+8))<8;
    const onLad=this.isClimb(p.x,p.y)||this.isClimb(p.x,b.bottom-1)||toBelow;
    if(!onLad){this.stopClimb();if(vy<0){p.setVelocityY(-160);p.setVelocityX(0)}p.setFlipX(this.facing<0);return}
    if(held.down&&(b.blocked.down||b.touching.down)){this.stopClimb();p.setFlipX(this.facing<0)}
  }

  updatePlayer(dt,inp,now){
    const{held,press}=inp,p=this.player,b=p.body,a=this.atk;
    if(p.inv>0){p.inv-=dt;p.setAlpha(Math.floor(now/70)%2?0.35:1)}else p.setAlpha(1);
    p.dropT-=dt;this.skillCd-=dt;this.castT-=dt;
    if(this.climbing){this.updateClimb(dt,inp,now);return}
    const onG=b.blocked.down||b.touching.down;
    if(onG&&!this.wasOnG&&this.prevVy>220)this.dustEm.explode(5,p.x,b.bottom);
    if(onG){this.airJumps=0;
      const under=this.tileAt(b.center.x,b.bottom-1),solid=this.tileAt(b.center.x,b.bottom+2);
      if(under!=='^'&&(solid==='#'||solid==='-'||solid==='='))this.safe={x:p.x,y:p.y}}
    this.wasOnG=onG;this.prevVy=b.velocity.y;
    this.coyote=onG?0.09:this.coyote-dt;
    this.jumpBuf=press.jump?0.12:this.jumpBuf-dt;
    const P='hero_';
    if(p.hurtT>0){p.hurtT-=dt;p.anims.stop();p.setTexture(P+'jump0');p.setFlipX(this.facing<0);return}
    // 사다리/덩굴 잡기: ↑ (사다리 위에서) 또는 ↓ (사다리 꼭대기에 서서)
    if(held.up&&(this.isClimb(p.x,p.y)||this.isClimb(p.x,b.bottom-2))&&!a.active){this.startClimb();return}
    if(held.down&&onG&&this.isClimb(p.x,b.bottom+3)&&!a.active){this.startClimb();p.y+=3;return}
    const move=(held.right?1:0)-(held.left?1:0);this.move=move;
    if(!a.active&&move)this.facing=move;
    const swim=this.inWater,ice=onG&&this.onIce&&!this.bonus.noSlip;
    if(swim){if(b.velocity.y>70)p.setVelocityY(70);this.airJumps=0}
    const slow=a.active?(onG?0.12:0.7):1,target=move*SPEED*(1+this.bonus.speed/100)*slow*(swim?0.7:1)*(this.inSand&&!this.bonus.noSand?0.45:1),k=1-Math.pow(ice?0.965:onG?0.62:0.8,dt*60);
    this.nudgeT=(this.nudgeT||0)-dt;
    this.wallLock-=dt;
    if(this.wallLock<=0&&(this.nudgeT<=0||move))p.setVelocityX(b.velocity.x+(target-b.velocity.x)*k);
    // 벽 붙기 (박쥐 망토): 공중에서 벽 쪽으로 누르면 천천히 미끄러지고, X로 반대쪽으로 벽 점프
    const cling=this.bonus.wallCling&&!onG&&!a.active&&move&&((move<0&&b.blocked.left)||(move>0&&b.blocked.right))&&!this.isClimb(p.x,p.y);
    if(cling){this.wallT=0.12;this.wallDir=move;if(b.velocity.y>40)p.setVelocityY(40);this.airJumps=0;
      if(Math.random()<dt*12)this.dustEm.explode(1,p.x+move*5,p.y+2)}
    else this.wallT-=dt;
    const onOne=onG&&(['-','='].includes(this.tileAt(b.center.x,b.bottom+2))||this.platGroup.getChildren().some(s=>s.isFaller&&Math.abs(s.y-3-b.bottom)<3&&Math.abs(s.x-p.x)<s.width/2));
    if(swim&&this.jumpBuf>0){const surf=this.tileAt(p.x,p.y-9)!=='~';p.setVelocityY(surf?-290:-165);this.jumpBuf=0;sfx('jump');this.bubbleEm.explode(3,p.x,p.y)}
    else if(this.inSand&&!this.bonus.noSand&&this.jumpBuf>0){p.setVelocityY(-230);this.jumpBuf=0;sfx('jump');this.dustEm.explode(4,p.x,b.bottom)}
    else if(this.jumpBuf>0&&held.down&&onOne){p.dropT=0.22;this.jumpBuf=0;p.setVelocityY(40)}
    else if(this.jumpBuf>0&&this.coyote>0){p.setVelocityY(-JUMP);this.jumpBuf=0;this.coyote=0;sfx('jump');this.dustEm.explode(4,p.x,b.bottom)}
    else if(this.jumpBuf>0&&!onG&&this.wallT>0){
      this.jumpBuf=0;this.wallT=0;this.wallLock=0.2;this.facing=-this.wallDir;
      p.setVelocity(-this.wallDir*SPEED*1.35,-JUMP*0.95);sfx('jump',{kind:'wall'});this.dustEm.explode(5,p.x+this.wallDir*5,p.y);
    }
    else if(press.jump&&!onG&&this.coyote<=0&&this.airJumps<this.maxAirJumps()){
      this.airJumps++;this.jumpBuf=0;p.setVelocityY(-JUMP*0.9);sfx('jump',{kind:'double'});
      this.auraEm.explode(8,p.x,b.bottom);this.dustEm.explode(4,p.x,b.bottom);
    }
    this.bounceT-=dt;
    if(!held.jump&&b.velocity.y<-120&&this.bounceT<=0)p.setVelocityY(b.velocity.y*0.6);
    // 하단 찌르기: 공중에서 ↓+Z. 아래로 검을 세우고 떨어지다 적·상자·벽에 닿으면 튀어 오름
    if(press.atk&&!onG&&held.down&&!a.active&&!swim){this.pogo=true;this.pogoHit=new Set();press.atk=false}
    if(this.pogo){if(onG||swim||p.hurtT>0)this.pogo=false;else this.updatePogo(dt)}
    if(press.atk&&!this.pogo){
      if(!a.active){const chain=now-this.lastAtkEnd<230&&this.lastStep<3;this.startAttack(chain?this.lastStep+1:1)}
      else if(a.step<3&&a.t>0.06)a.queued=true}
    if(press.skill)this.castSkill();
    p.setFlipX((a.active?a.f:this.facing)<0);
    if(this.pogo){p.anims.stop();p.setTexture(P+'jump0')}
    else if(a.active||this.castT>0){p.anims.stop();p.setTexture(P+'atk0')}
    else if(!onG){p.anims.stop();p.setTexture(P+'jump0');if(this.wallT>0.08)p.setFlipX(this.wallDir>0)}
    else if(Math.abs(b.velocity.x)>12&&move)p.anims.play(P+'run',true);
    else p.anims.play(P+'idle',true);
  }

  startAttack(step){
    const a=this.atk,p=this.player,w=this.equip.weapon;
    if(this.move)this.facing=this.move;
    Object.assign(a,{active:true,step,t:0,queued:false,hit:new Set(),f:this.facing,dur:step===3?0.34:0.24,on:step===3?[0.05,0.2]:[0.03,0.14],tag:Math.random()});
    if(this.slash)this.slash.destroy();
    const f=a.f,s=this.add.image(p.x+f*4,p.y+3,(step===3?'slashC_':'slashA_')+w).setOrigin(f>0?0:1,0.5).setFlipX(f<0).setFlipY(step===2).setDepth(12).setAlpha(0);
    this.slash=s;this.fxSwing(s,step,f);sfx('slash',{heavy:step===3});
    this.tweens.add({targets:s,alpha:{from:1,to:0},delay:a.on[0]*1000,duration:(a.dur-a.on[0])*1000,ease:'Quad.easeIn'});
    if(p.body.blocked.down)p.setVelocityX(f*(step===3?130:60));
  }
  updateAttack(dt){
    const a=this.atk,p=this.player;if(!a.active)return;
    a.t+=dt;
    if(this.slash){this.slash.x=p.x+a.f*4;this.slash.y=p.y+3;if(this.slashGlow&&this.slashGlow.active)this.slashGlow.setPosition(this.slash.x,this.slash.y)}
    if(a.t>=a.on[0]&&a.t<=a.on[1]){
      const reach=(a.step===3?26:20),hb=new Phaser.Geom.Rectangle(a.f>0?p.x:p.x-reach,p.y-10,reach,22);
      this.enemies.getChildren().slice().forEach(e=>{
        if(!e.active||a.hit.has(e))return;const eb=e.body;
        if(Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(eb.x,eb.y,eb.width,eb.height))){
          a.hit.add(e);const crit=Math.random()<({holy:0.25,blood:0.24,moon:0.16,storm:0.2,dark:0.18}[this.wfx()]||0.12),mult=[1,1,1.15,1.7][a.step];
          this.hitEnemy(e,Math.round(this.atkVal()*mult*(0.85+Math.random()*0.3)*(crit?2:1)),crit,a.f,a.step===3)}});
      this.chests.forEach(c=>{if(!c.open&&Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(c.x-7,c.y-11,14,11)))this.openChest(c)});
      this.hitWalls(hb,a.tag);this.hitSwitches(hb);this.slashShots(hb);
    }
    if(a.t>=a.dur){if(a.queued&&a.step<3)this.startAttack(a.step+1);else{a.active=false;this.lastAtkEnd=this.time.now;this.lastStep=a.step}}
  }
  updateWaves(dt){
    this.waves=this.waves.filter(w=>{
      w.life-=dt;w.s.x+=w.vx*dt;w.s.setAlpha(Math.min(1,w.life*5));
      const hb=w.big?new Phaser.Geom.Rectangle(w.s.x-9,w.s.y-16,18,32):new Phaser.Geom.Rectangle(w.s.x-6,w.s.y-10,12,20);
      this.enemies.getChildren().slice().forEach(e=>{if(!e.active||w.hit.has(e))return;const eb=e.body;
        if(Phaser.Geom.Intersects.RectangleToRectangle(hb,new Phaser.Geom.Rectangle(eb.x,eb.y,eb.width,eb.height))){
          w.hit.add(e);const before=e.hp;this.hitEnemy(e,Math.round(this.atkVal()*(w.big?1.6:1.3)*(0.9+Math.random()*0.2)),false,w.f,false);
          if(w.drain){const st=this.stats,h=Math.max(1,Math.round(Math.max(0,before-Math.max(0,e.hp))*w.drain));if(st.hp<this.mhp()){st.hp=Math.min(this.mhp(),st.hp+h);this.popNum(this.player.x,this.player.y-16,h,0xb8ffa8,false)}}}});
      this.hitWalls(hb,w.tag);this.hitSwitches(hb);this.slashShots(hb);
      if(this.tileAt(w.s.x+w.f*5,w.s.y)==='#'||this.walls.some(x=>x.hp>0&&Phaser.Geom.Intersects.RectangleToRectangle(hb,x.rect))){w.life=0;this.sparkEm.explode(6,w.s.x,w.s.y)}
      if(w.life<=0){w.s.destroy();return false}return true});
  }

  /* 방에 맞는 배경음악: 안 잡은 보스가 있으면 보스 곡, 고향 마을은 마을 곡, 나머지는 지역 테마 곡 */
  roomSong(){const R=this.R;if(R.boss&&!bossDone(R.boss.id||'king'))return 'boss';if(this.roomId==='v1')return 'village';return R.theme||'meadow'}
  /* ----- combat ----- */
  wfx(){const it=ITEMS[this.equip.weapon];return it&&it.fx}
  hitEnemy(e,d,crit,dir,heavy,src){
    if(!e.body||!e.body.enable)return;
    if(!this.tInfo||this.tInfo.e!==e){this.tInfo={e};this.tGhost=e.hp}
    // 무기 효과: 화염(불타서 계속 피해), 서리(느려짐), 슬라임(3단 베기에 주변 폭발)
    const fx=src==='splash'||src==='burn'?null:this.wfx();
    if(fx==='fire'){const bb=ITEMS[this.equip.weapon].burnBoost;e.burn={t:bb?3:1.7,tick:0.4,dmg:Math.max(1,Math.round(d*(bb?0.3:0.22)))}}
    if(fx==='poison'){e.burn={t:3.2,tick:0.5,dmg:Math.max(1,Math.round(d*0.18)),poison:true}}
    if(fx==='ice'){e.slow=2.4}
    if(fx==='blood'){e.burn={t:2.6,tick:0.4,dmg:Math.max(1,Math.round(d*0.2)),bleed:true}}
    if(fx==='dragon'){e.burn={t:3,tick:0.4,dmg:Math.max(1,Math.round(d*0.3))};
      if(heavy){const ex=e.x,ey=e.y;this.fireEm.explode(26,ex,ey);this.fxEmitter('dragon').explode(18,ex,ey);this.shake(110,0.01);
        this.time.delayedCall(30,()=>this.enemies.getChildren().slice().forEach(o=>{if(o!==e&&o.active&&Math.hypot(o.x-ex,o.y-ey)<44)this.hitEnemy(o,Math.round(d*0.6),false,Math.sign(o.x-ex)||1,false,'splash')}))}}
    // 번개: 가장 가까운 다른 적 하나에게 옮겨붙음 / 어둠: 벤 만큼 조금 흡수, 3단 베기에 어둠 폭발
    if(fx==='storm'){const ex=e.x,ey=e.y,o=this.enemies.getChildren().filter(o=>o!==e&&o.active&&o.body&&o.body.enable&&Math.hypot(o.x-ex,o.y-ey)<70).sort((a,b)=>Math.hypot(a.x-ex,a.y-ey)-Math.hypot(b.x-ex,b.y-ey))[0];
      if(o)this.time.delayedCall(60,()=>{if(!o.active)return;const g=this.add.graphics().setDepth(42).setBlendMode(Phaser.BlendModes.ADD);g.lineStyle(2,0xfff07a,1).beginPath().moveTo(ex,ey);
        for(let i=1;i<5;i++)g.lineTo(ex+(o.x-ex)*i/5+(Math.random()-.5)*10,ey+(o.y-ey)*i/5+(Math.random()-.5)*10);g.lineTo(o.x,o.y).strokePath();this.tweens.add({targets:g,alpha:0,duration:200,onComplete:()=>g.destroy()});
        this.hitEnemy(o,Math.round(d*0.5),false,Math.sign(o.x-ex)||1,false,'splash')})}
    if(fx==='dark'&&!this.player.dead){const s=this.stats,h=Math.max(1,Math.round(d*0.05));if(s.hp<this.mhp()){s.hp=Math.min(this.mhp(),s.hp+h);this.popNum(this.player.x,this.player.y-14,h,0xb8ffa8,false)}
      if(heavy){const ex=e.x,ey=e.y;this.fxEmitter('dark').explode(26,ex,ey);this.shake(110,0.01);
        this.time.delayedCall(30,()=>this.enemies.getChildren().slice().forEach(o=>{if(o!==e&&o.active&&Math.hypot(o.x-ex,o.y-ey)<48)this.hitEnemy(o,Math.round(d*0.7),false,Math.sign(o.x-ex)||1,false,'splash')}))}}
    if(fx==='moon'&&!this.player.dead){const s=this.stats,h=Math.max(1,Math.round(d*0.08));if(s.hp<this.mhp()){s.hp=Math.min(this.mhp(),s.hp+h);this.popNum(this.player.x,this.player.y-14,h,0xb8ffa8,false)}}
    if(fx==='slime'&&heavy){const ex=e.x,ey=e.y;this.slimeEm.explode(22,ex,ey);this.shake(90,0.008);
      this.time.delayedCall(30,()=>this.enemies.getChildren().slice().forEach(o=>{if(o!==e&&o.active&&Math.hypot(o.x-ex,o.y-ey)<36)this.hitEnemy(o,Math.round(d*0.55),false,Math.sign(o.x-ex)||1,false,'splash')}))}
    // 적 방어력, 녹슨 수문장은 앞에서 친 약한 공격을 방패로 막음
    d=Math.max(1,Math.round(d*30/(30+(e.arm||0))));
    if(e.guard&&!heavy&&src!=='burn'&&!this.pogo&&Math.sign(this.player.x-e.x)===e.dir&&e.state!=='atk'&&e.state!=='wind'){d=Math.max(1,Math.round(d*0.3));this.popText(e.x,e.body.top-6,'GUARD',0x9fb0c8)}
    e.hp-=d;e.stun=e.king||e.boss?0.1:0.3;
    const kb=e.kb==null?1:e.kb;e.setVelocity(dir*(heavy?1.6:1)*(e.king?40:110)*kb,e.king?-40:(heavy?-170:-110)*kb);
    e.setTintFill(0xffffff);this.time.delayedCall(70,()=>{if(e.active){e.clearTint();if(e.slow>0)e.setTint(0x9fd8ff);else if(e.baseTint)e.setTint(e.baseTint)}});
    this.popNum(e.x+(Math.random()*8-4),e.body.y-2,d,crit?0xffd34a:0xffffff,crit);
    this.fxHit(e.x-dir*4,e.body.center.y,dir,crit,heavy,src==='splash'?({dragon:'dragon',storm:'storm',dark:'dark'}[this.wfx()]||'slime'):null);
    if(src!=='burn')sfx('hit',{crit,heavy});
    this.combo++;this.comboT=1.5;
    if(this.combo>=2){this.comboTxt.setText(this.combo+' HIT').setVisible(true).setAlpha(1);this.tweens.add({targets:this.comboTxt,scale:{from:1.4,to:1},duration:120})}
    this.targetT=3.5;
    this.shake(crit||heavy?110:50,crit||heavy?0.01:0.004);
    this.hitstop(crit||heavy?85:45);
    if(e.hp<=0)this.killEnemy(e);
  }
  /* 화면 흔들림: 고해상도 카메라는 배율(S)만큼 세게 흔들려서 원래 세기로 나눠줌 */
  shake(ms,i){this.cameras.main.shake(ms,i/RS.S)}
  hitstop(ms){if(this.frozen)return;this.frozen=true;this.physics.world.pause();this.time.delayedCall(ms,()=>{this.frozen=false;if(!this.menu)this.physics.world.resume()})}
  killEnemy(e){
    const k=e.king||!!e.boss,d=e.def;
    (e.king?this.kingEm:e.mob==='bat'||e.mob==='batlord'?this.batEm:e.mob==='snail'?this.snailEm:e.mob==='haunt'||e.mob==='rust'?this.rockEm:this.slimeEm).explode(k?34:14,e.x,e.y);
    if(e.boss)this.goldEm.explode(30,e.x,e.y);
    this.popText(e.x,e.y-16,'EXP+'+e.exp,0x9fe8ff);
    if(Math.random()<(k?1:0.25))this.dropHeart(e.x,e.y-4);
    else if(!k){const r=Math.random();if(r<0.1)this.dropThing('potion',e.x,e.y-4);else if(r<0.16)this.dropThing('ether',e.x,e.y-4)}
    const ex=e.x,ey=e.y;e.destroy();this.gainExp(e.exp);
    if(!(d&&d.summon&&Math.random()<0.6))this.dropGold(ex,ey-4,e.exp*(k?2:0.7)*(0.8+Math.random()*0.5));
    if(k){const B=this.R.boss||{},id=e.king?'king':e.boss,ex2=this.R.exits;setBossDone(id);
      this.bossLock=false;this.physics.world.setBoundsCollision(!ex2.left,!ex2.right,!ex2.up,!ex2.down);this.banner((B.title||'KING SLIME')+' DOWN!',0xffd34a);
      if(e.boss)this.enemies.getChildren().filter(o=>o.def&&o.def.summon).forEach(o=>{this.batEm.explode(6,o.x,o.y);o.destroy()});
      const drop=B.drop;if(drop)this.time.delayedCall(600,()=>this.spawnPickup(drop,ex,Math.min(ey,floorTopY(this.map,Math.floor(ex/T))-14),'drop_'+this.roomId));
      if(e.king)this.time.delayedCall(1500,()=>this.grantDoubleJump());
      this.openBossGates(id);sfx('fanfare');bgmStop();this.time.delayedCall(2600,()=>{if(!this.leaving)bgm(this.roomSong())});
      if(B.after)this.time.delayedCall(2800,()=>{if(!this.leaving&&!this.overlayOpen())this.openDialog('',id==='demon'?[...B.after,{n:(STATE.name||'모험가')+'의 기록',t:this.clearRecord()}]:B.after)})}
    else if(!d.summon)this.time.delayedCall(RESPAWN_MS,()=>{if(!this.leaving){if(d.t)spawnMob(this,d);else this.spawnEnemy(d)}});
  }
  spawnEnemy(d){
    const k=!!d.king,e=this.enemies.create(d.x,d.y,k?'kslime0':'slime0');
    e.body.setSize(12,8).setOffset(1,k?5:2);if(k)e.setScale(2);
    e.setCollideWorldBounds(true).setDepth(k?6:5);
    const sv=!k&&{cave:'slime_cave',ice:'slime_ice'}[this.R.theme];   // 지역 슬라임은 따로 그린 그림
    if(sv)e.setTexture(sv+'0');
    const tr=k?1:tierOf(this),shp=k?340:Math.round(34*tr);
    Object.assign(e,{def:d,king:k,hp:shp,maxHp:shp,dmg:k?18:Math.round(8*(0.6+0.4*tr)),exp:k?50:Math.round(6*tr),arm:k?2:Math.round((tr-1)*6),nm:k?'킹슬라임':({cave:'동굴 슬라임',ice:'얼음 슬라임'}[this.R.theme]||'슬라임'),nextHop:this.time.now+800+Math.random()*1200,stun:0,wasOnG:false,lastVy:0});
    e.play(k?'king_idle':sv?sv+'_idle':'slime_idle');
    e.setAlpha(0);this.tweens.add({targets:e,alpha:1,duration:400});
  }
  updateEnemies(dt,now){
    const p=this.player;
    this.enemies.getChildren().slice().forEach(e=>{
      if(e.y>LH+40){e.destroy();return}
      if(e.burn){const b=e.burn;b.t-=dt;b.tick-=dt;if(Math.random()<dt*14)(b.poison?this.fxEmitter('poison'):b.bleed?this.fxEmitter('blood'):this.fireEm).explode(1,e.x+(Math.random()-.5)*8,e.body.top+4);
        if(b.tick<=0){b.tick=0.4;e.hp-=b.dmg;this.popNum(e.x,e.body.y-2,b.dmg,b.poison?0xc080ff:b.bleed?0xff5a6a:0xff9a3a,false);if(e.hp<=0){this.killEnemy(e);return}}
        if(b.t<=0)e.burn=null}
      if(e.slow>0){e.slow-=dt;e.body.velocity.x*=0.55;if(e.body.allowGravity===false)e.body.velocity.y*=0.55;if(e.slow<=0){e.clearTint();if(e.baseTint)e.setTint(e.baseTint)}else if(!e.isTinted)e.setTint(0x9fd8ff)}
      if(e.mob){updateMob(this,e,dt,now);return}
      const onG=e.body.blocked.down||e.body.touching.down;
      if(onG&&!e.wasOnG&&e.king&&e.lastVy>150){this.shake(100,0.008);this.dustEm.explode(8,e.x,e.body.bottom);
        // 킹슬라임 착지: 체력 절반 이하면 충격파, 한 번은 작은 슬라임 둘을 부름
        if(e.hp<e.maxHp/2){[-1,1].forEach(dd=>{const q=this.add.image(e.x+dd*16,e.body.bottom,'quake').setOrigin(0.5,1).setDepth(12).setFlipX(dd<0).setTint(0x8ab0ff);this.quakes.push({s:q,vx:dd*140,life:1,dmg:14,hit:false})});
          if(!e.called){e.called=true;[-1,1].forEach(dd=>this.spawnEnemy({x:e.x+dd*30,y:e.y-20,summon:true}));this.toast('킹슬라임이 부하를 불렀다!',1600)}}}
      e.wasOnG=onG;e.lastVy=e.body.velocity.y;
      if(e.stun>0){e.stun-=dt;return}
      if(onG){
        e.setVelocityX(e.body.velocity.x*0.8);
        if(now>e.nextHop){
          const dx=p.x-e.x,near=!p.dead&&Math.abs(dx)<(e.king?180:110)&&Math.abs(p.y-e.y)<70,dir=near?(Math.sign(dx)||1):(Math.random()<.5?-1:1);
          // 가시나 구멍으로 뛰어들지 않게
          const ahead=this.tileAt(e.x+dir*20,e.body.bottom+4),below=this.tileAt(e.x+dir*20,e.body.bottom-2);
          if(!e.king&&(below==='^'||ahead==='.'&&this.tileAt(e.x+dir*20,e.body.bottom+20)==='.')){e.nextHop=now+600;return}
          e.setVelocity(dir*(near?(e.king?90:65):35),near?(e.king?-280:-200):-140);
          e.nextHop=now+(near?(e.king?(e.hp<e.maxHp/2?600:850):520):1400)+Math.random()*500;
        }
      }
    });
  }
  trap(base){return Math.round(base*(0.6+0.4*tierOf(this)))}
  hurtPlayer(e){if(e.stun>0.15)return;this.hurtBy(e.dmg+Math.floor(Math.random()*3),e.x,'enemy')}
  hurtBy(raw,fromX,kind){
    const p=this.player,s=this.stats;if(p.inv>0||p.dead)return;
    // 방어력은 비율로 피해를 줄임 (방어 40이면 절반) — 방어구를 많이 껴도 아예 안 아프진 않게
    const d=Math.max(1,Math.round(raw*40/(40+this.defVal())));s.hp=Math.max(0,s.hp-d);
    this.popNum(p.x,p.y-12,d,0xff5a5a,false);p.inv=1.1;p.hurtT=0.28;sfx('hurt');
    if(this.climbing)this.stopClimb();
    let kx=(Math.sign(p.x-fromX)||1)*150;if((p.x<28&&kx<0)||(p.x>this.lw-28&&kx>0))kx=0;   // 맞고 밀려서 방 밖으로 나가지 않게
    p.setVelocity(kx,kind==='spike'?-260:-170);
    this.atk.active=false;if(this.slash){this.slash.destroy();this.slash=null}
    this.shake(120,0.01);p.setTintFill(0xff4a5a);this.time.delayedCall(90,()=>p.clearTint());
    if(s.hp<=0)this.die();
  }
  // 마지막 엔딩에 보여 주는 기록: 플레이 시간·레벨·쓰러진 횟수·연 보물 상자
  clearRecord(){
    const t=Math.floor(STATE.time||0),p2=n=>String(n).padStart(2,'0'),all=Object.values(ROOMS).flatMap(roomChests),got=all.filter(c=>STATE.opened[c.id]).length;
    return '플레이 시간 '+(t/3600|0)+':'+p2(t%3600/60|0)+':'+p2(t%60)+'    레벨 '+this.stats.lv+'\n쓰러진 횟수 '+(STATE.deaths||0)+'번    보물 상자 '+got+' / '+all.length;
  }
  die(){
    const p=this.player,s=this.stats;p.dead=true;STATE.deaths=(STATE.deaths||0)+1;
    p.setVelocityX(0).setDragX(4000);p.anims.stop();p.setTexture('hero_jump0');p.setTintFill(0xffffff);   // 넉백으로 쭉 미끄러지지 않게 멈춤
    this.shake(220,0.014);
    // 하얗게 번쩍 → 회색으로 뒤로 쓰러짐
    this.time.delayedCall(140,()=>{p.clearTint().setTint(0x666677);this.tweens.add({targets:p,angle:p.flipX?90:-90,duration:380,ease:'Quad.easeIn',onComplete:()=>this.dustEm.explode(8,p.x,p.body.bottom)})});
    // 비석이 위에서 떨어져 꽂힘
    this.time.delayedCall(700,()=>{
      if(!this.textures.exists('tomb')){const g=this.make.graphics({add:false});
        g.fillStyle(0x2a2a34).fillRect(1,3,12,13).fillRect(3,1,8,2);g.fillStyle(0x9a9aa8).fillRect(2,4,10,11).fillRect(4,2,6,2);
        g.fillStyle(0x5a5a68).fillRect(6,5,2,7).fillRect(4,7,6,2);g.fillStyle(0x4a6a3a).fillRect(0,15,14,1);g.generateTexture('tomb',14,16);g.destroy()}
      const gy=p.body.bottom,t=this.add.image(p.x,gy-70,'tomb').setOrigin(0.5,1).setDepth(11).setAlpha(0);
      this.tweens.add({targets:t,y:gy,alpha:1,duration:320,ease:'Quad.easeIn',onComplete:()=>{this.dustEm.explode(12,t.x,gy);this.shake(100,0.008);sfx('door');this.tweens.add({targets:p,alpha:0.25,duration:300})}});
    });
    this.banner('GAME OVER',0xff5a5a);
    const B=this.R.boss,retry=B&&!bossDone(B.id||'king');
    this.time.delayedCall(1100,()=>this.toast(retry?'쓰러졌다… 보스 방 입구에서 다시 도전합니다':STATE.save?'쓰러졌다… 마지막 석상에서 다시 시작합니다 (골드·장비는 그대로)':'쓰러졌다… 처음 장소에서 다시 시작합니다 (석상에 저장하세요)',2000));
    this.time.delayedCall(3200,()=>{
      s.hp=this.mhp();s.mp=s.maxMp;
      // 보스가 살아 있는 방에서 지면 그 방 입구에서 다시 (석상부터 걸어오지 않게)
      if(retry){this.leaving=true;this.fadeCams(true,200,()=>this.scene.restart({...this.entryData,retry:true}));return}
      const room=STATE.save?STATE.save.room:'r1';
      this.leaving=true;this.fadeCams(true,200,()=>this.scene.restart({room,entry:STATE.save?'save':'start'}));
    });
  }
  dropThing(kind,x,y){const h=this.hearts.create(x,y,'icon_'+kind);h.kind=kind;h.setVelocity((Math.random()-.5)*60,-160).setBounce(0.3).setDepth(7);h.body.setSize(8,8);h.life=12}
  dropHeart(x,y){const h=this.hearts.create(x,y,'heart');h.setVelocity((Math.random()-.5)*60,-160).setBounce(0.3).setDepth(7);h.body.setSize(7,6);h.life=10}
  gainExp(n){
    const s=this.stats,p=this.player;s.exp+=n;
    while(s.exp>=s.next){s.exp-=s.next;s.lv++;s.next=Math.round(s.next*1.5);s.maxHp+=12;s.maxMp+=5;s.atk+=2;s.hp=this.mhp();s.mp=s.maxMp;
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
    const y=landPad()?84:64,t=this.add.bitmapText(W/2,y,'dmg',str).setOrigin(0.5).setScrollFactor(0).setDepth(120).setTint(tint).setLetterSpacing(-2).setScale(3);
    this.tweens.add({targets:t,scale:2,duration:220,ease:'Back.easeOut'});
    this.tweens.add({targets:t,alpha:0,y:y-8,delay:1300,duration:350,onComplete:()=>t.destroy()});
  }
}

Object.assign(PlayScene.prototype,PlayUI,Economy,Gimmicks,MenuMixin,Fx,Skills);
