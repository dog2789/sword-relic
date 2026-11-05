/* C 스킬: 들고 있는 무기마다 다른 기술이 나감 (MP 소모). PlayScene에 섞어 씀 (Object.assign)
   종류: wave 검기 / fan 불꽃 세 갈래 / lob 슬라임 폭탄 / erupt 땅에서 솟는 기둥(얼음·용암·빛)
         boomerang 돌아오는 칼날 / dash 돌진 베기 / breath 화염 숨결 / crescent 초승달 */
import Phaser from 'phaser';
import {T,LH} from '../config.js';
import {ITEMS} from '../data/items.js';

export const SKILLS={
  traveler_sword:{name:'검기',desc:'앞으로 날아가는 검기',mp:10,kind:'wave'},
  slime_blade:{name:'슬라임 폭탄',desc:'통통 튀다 터지는 슬라임을 던짐. 주변 적에게 폭발 피해',mp:10,kind:'lob'},
  flame_sword:{name:'불꽃 세 갈래',desc:'불덩이 세 개를 부채꼴로 쏨. 맞은 적은 불탐',mp:12,kind:'fan'},
  blue_sword:{name:'성검 검기',desc:'적을 꿰뚫는 커다란 빛의 검기',mp:10,kind:'wave',big:true},
  frost_blade:{name:'얼음 송곳',desc:'앞쪽 땅에서 얼음 송곳이 차례로 솟아 적을 얼림',mp:12,kind:'erupt',fx:'ice'},
  scimitar:{name:'독 부메랑',desc:'곡도를 던지면 빙글빙글 돌다 돌아옴. 갈 때 올 때 모두 독',mp:12,kind:'boomerang'},
  magma_blade:{name:'용암 분출',desc:'앞쪽 땅에서 용암 기둥이 차례로 솟구침',mp:14,kind:'erupt',fx:'fire'},
  moon_sword:{name:'초승달 베기',desc:'적을 꿰뚫는 초승달을 날림. 벤 피해의 30%를 HP로 흡수',mp:14,kind:'crescent'},
  blood_sword:{name:'핏빛 돌진',desc:'앞으로 순식간에 돌진하며 지나간 적을 모두 벰. 돌진 중엔 무적',mp:12,kind:'dash'},
  dragon_sword:{name:'용의 숨결',desc:'앞으로 불길을 내뿜어 닿는 적을 계속 태움',mp:16,kind:'breath'},
  relic_sword:{name:'성광',desc:'거대한 빛의 검기와 함께 앞쪽에 빛의 기둥이 내리꽂힘',mp:16,kind:'relic'},
  sky_sword:{name:'천둥',desc:'앞쪽 땅에 번개가 다섯 번 차례로 내리꽂힘',mp:16,kind:'erupt',fx:'storm',n:5},
  abyss_sword:{name:'심연 베기',desc:'적을 꿰뚫는 커다란 검은 초승달을 날림. 벤 피해의 20%를 HP로 흡수',mp:16,kind:'crescent',tint:0x9a3aff,drain:0.2,scale:2.6}
};
export const skillOf=w=>SKILLS[w]||SKILLS.traveler_sword;

const R=(x,y,w,h)=>new Phaser.Geom.Rectangle(x,y,w,h);
const hits=(a,b)=>Phaser.Geom.Intersects.RectangleToRectangle(a,b);

export const Skills={
  castSkill(){
    const s=this.stats,p=this.player;if(this.skillCd>0||p.hurtT>0||this.dashT>0)return;
    const w=this.equip.weapon,sk=skillOf(w);
    if(s.mp<sk.mp){this.popText(p.x,p.y-12,'NO MP',0x8ab0ff);this.skillCd=0.4;return}
    s.mp-=sk.mp;this.skillCd=sk.kind==='breath'?0.9:0.5;this.castT=0.18;
    this.skills=this.skills||[];
    const f=this.facing,it=ITEMS[w],k=sk.kind;
    if(k==='wave'||k==='relic')this.skWave(it,f,sk.big||k==='relic');
    if(k==='relic')this.skErupt(f,'holy',3,1.3);
    if(k==='fan')[-0.32,0,0.32].forEach(a=>this.skShot(f,a,'fx_flame',{spd:210,life:0.6,dmg:0.8,spin:true,trail:this.fireEm}));
    if(k==='crescent')this.skWave(it,f,true,{drain:sk.drain||0.3,scale:sk.scale||2,tint:sk.tint||0xc8b8ff,life:0.8});
    if(k==='lob')this.skLob(f);
    if(k==='erupt')this.skErupt(f,sk.fx,sk.n||4,1.1);
    if(k==='boomerang')this.skBoomerang(f,w);
    if(k==='dash')this.skDash(f);
    if(k==='breath'){this.breathT=0.7;this.breathTick=0;this.castT=0.7}
    this.goldEm.explode(4,p.x+f*8,p.y);
  },
  /* 맞히기: 사각형에 닿은 적마다 한 번씩 (set으로 중복 막음) */
  skHit(rect,set,mul,dir,opt={}){
    let n=0;
    this.enemies.getChildren().slice().forEach(e=>{if(!e.active||(set&&set.has(e)))return;const b=e.body;if(!b||!hits(rect,R(b.x,b.y,b.width,b.height)))return;
      if(set)set.add(e);const before=e.hp,d=Math.round(this.atkVal()*mul*(0.9+Math.random()*0.2));
      this.hitEnemy(e,d,false,dir||(Math.sign(e.x-this.player.x)||1),!!opt.heavy);n++;
      if(opt.drain){const dealt=Math.max(0,before-Math.max(0,e.hp)),h=Math.max(1,Math.round(dealt*opt.drain)),s=this.stats;
        if(s.hp<this.mhp()){s.hp=Math.min(this.mhp(),s.hp+h);this.popNum(this.player.x,this.player.y-16,h,0xb8ffa8,false)}}});
    this.hitWalls(rect,opt.tag||Math.random());this.hitSwitches(rect);this.slashShots(rect);
    return n;
  },
  skWave(it,f,big,o={}){
    const p=this.player,w=this.add.image(p.x+f*8,p.y+3,'wave').setFlipX(f<0).setDepth(12).setScale(o.scale||(big?1.7:1));
    if(o.tint)w.setTint(o.tint);else if(it.wave)w.setTint(it.wave);
    this.waves.push({s:w,vx:f*(it.fx==='ice'?200:230),life:o.life||(big?0.7:0.55),hit:new Set(),f,tag:Math.random(),big,pierce:big,drain:o.drain});
  },
  /* 날아가는 탄 (불덩이 등): 각도 a(라디안, 0=정면) */
  skShot(f,a,tex,o){
    const p=this.player,s=this.add.image(p.x+f*8,p.y+2,tex).setDepth(12).setBlendMode(Phaser.BlendModes.ADD);
    this.skills.push({k:'shot',s,vx:f*o.spd*Math.cos(a),vy:o.spd*Math.sin(a),life:o.life,dmg:o.dmg,f,hit:new Set(),o})
  },
  skLob(f){
    const p=this.player,s=this.add.image(p.x+f*6,p.y+1,'slime0').setDepth(12).setScale(0.8);
    this.skills.push({k:'lob',s,vx:f*165,vy:-110,life:1.6,bounce:2,f})
  },
  /* 땅에서 솟는 기둥: 정면으로 n개가 0.1초 간격으로 */
  skErupt(f,fx,n,mul){
    const p=this.player,set=new Set(),tag=Math.random();
    for(let i=0;i<n;i++)this.time.delayedCall(90+i*110,()=>{
      if(!this.player.active)return;
      const x=p.x+f*(26+i*22),gy=this.groundBelow(x,p.y);if(gy==null)return;
      const col={ice:0x9ff0ff,fire:0xff7a2a,holy:0xfff0a0,storm:0xfff07a}[fx]||0xffffff,tall=fx==='holy'||fx==='storm',h=tall?70:40;
      const st=this.add.image(x,gy,'fx_streak').setOrigin(0.5,1).setScale(tall?3:2.4,0.1).setTint(col).setBlendMode(Phaser.BlendModes.ADD).setDepth(12);
      this.tweens.add({targets:st,scaleY:h/8,duration:90,yoyo:true,hold:120,onComplete:()=>st.destroy()});
      if(fx==='ice')for(let j=0;j<3;j++){const sh=this.add.image(x+(j-1)*5,gy,'iceshard').setOrigin(0.5,1).setDepth(12).setScale(1,0.2);
        this.tweens.add({targets:sh,scaleY:1.4+j%2*0.6,duration:90,yoyo:true,hold:260,onComplete:()=>sh.destroy()})}
      const em=fx==='ice'||fx==='storm'?this.fxEmitter(fx):fx==='holy'?this.auraEm:this.fireEm;em.explode(fx==='holy'?14:10,x,gy-6);
      this.dustEm.explode(4,x,gy);this.shake(50,0.004);
      this.skHit(R(x-9,gy-h,18,h),set,mul,f,{tag});
    });
  },
  /* 발밑 쪽 땅의 윗면 y (없으면 null) */
  groundBelow(x,y){
    for(let yy=y;yy<LH;yy+=4){const c=this.tileAt(x,yy);if(c==='#'||c==='-'||c==='='||c==='A'||c==='B')return Math.floor(yy/T)*T}
    return null;
  },
  skBoomerang(f,w){
    const p=this.player,s=this.add.image(p.x+f*8,p.y+2,'sword_'+w).setDepth(12);
    this.skills.push({k:'boom',s,vx:f*260,life:1.6,back:false,f,hit:new Set(),tag:Math.random()})
  },
  skDash(f){
    const p=this.player;this.dashT=0.2;this.dashF=f;this.dashSet=new Set();p.inv=Math.max(p.inv,0.35);this.wallLock=0.22;
    p.setVelocity(f*470,0);this.shake(60,0.005);
  },
  /* 매 프레임 */
  updateSkills(dt){
    const p=this.player;this.skills=this.skills||[];
    // 돌진: 지나간 자리에 잔상, 몸에 닿는 적을 벰
    if(this.dashT>0){this.dashT-=dt;p.setVelocity(this.dashF*470,0);this.wallLock=0.05;
      const gh=this.add.image(p.x,p.y,p.texture.key).setFlipX(p.flipX).setDepth(9).setTint(0xff3a4a).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.6);
      this.tweens.add({targets:gh,alpha:0,duration:220,onComplete:()=>gh.destroy()});
      this.skHit(R(p.x-12,p.y-12,24,24),this.dashSet,1.4,this.dashF);
      if(this.dashT<=0)p.setVelocityX(this.dashF*80)}
    // 화염 숨결: 앞쪽 부채꼴에 불길, 0.12초마다 피해
    if(this.breathT>0){this.breathT-=dt;this.breathTick-=dt;const f=this.facing,x0=p.x+f*10,y0=p.y+2,em=this.fxEmitter('dragon');
      for(let i=0;i<3;i++){const d=8+Math.random()*48;em.emitParticleAt(x0+f*d,y0+(Math.random()-.5)*d*0.5)}
      if(Math.random()<0.6)this.fireEm.explode(2,x0+f*(10+Math.random()*40),y0+(Math.random()-.5)*14);
      if(this.breathTick<=0){this.breathTick=0.12;this.skHit(R(f>0?x0:x0-58,y0-15,58,30),null,0.35,f)}
      this.castT=Math.max(this.castT,0.05)}
    this.skills=this.skills.filter(o=>{
      o.life-=dt;const s=o.s;
      if(o.k==='shot'){s.x+=o.vx*dt;s.y+=o.vy*dt;s.angle+=dt*720;if(o.o.trail&&Math.random()<0.5)o.o.trail.explode(1,s.x,s.y);
        const r=R(s.x-5,s.y-5,10,10);this.skHit(r,o.hit,o.dmg,o.f);
        if(this.tileAt(s.x,s.y)==='#'){o.life=0;this.fireEm.explode(6,s.x,s.y)}}
      if(o.k==='lob'){o.vy+=620*dt;s.x+=o.vx*dt;s.y+=o.vy*dt;s.angle+=o.vx*dt*2;
        const c=this.tileAt(s.x,s.y+4),hitE=this.enemies.getChildren().some(e=>e.active&&e.body&&hits(R(s.x-7,s.y-7,14,14),R(e.body.x,e.body.y,e.body.width,e.body.height)));
        if(this.tileAt(s.x+Math.sign(o.vx)*5,s.y)==='#')o.vx*=-0.6;
        if((c==='#'||c==='-'||c==='='||c==='A'||c==='B')&&o.vy>0){if(o.bounce>0){o.bounce--;o.vy=-o.vy*0.55;s.y-=2;this.slimeEm.explode(4,s.x,s.y+4)}else o.life=0}
        if(hitE)o.life=0;
        if(o.life<=0){this.slimeEm.explode(26,s.x,s.y);this.fxEmitter('slime').explode(14,s.x,s.y);this.shake(90,0.008);
          const ring=this.add.circle(s.x,s.y,6).setStrokeStyle(2,0x7fe07a,1).setDepth(12);this.tweens.add({targets:ring,scale:5,alpha:0,duration:280,onComplete:()=>ring.destroy()});
          this.skHit(R(s.x-28,s.y-24,56,40),null,1.6,o.f,{heavy:true})}}
      if(o.k==='boom'){s.angle+=dt*900*o.f;
        if(!o.back){s.x+=o.vx*dt;o.vx-=o.f*520*dt;if(Math.sign(o.vx)!==o.f){o.back=true;o.hit=new Set()}}
        else{const dx=p.x-s.x,dy=p.y-s.y,d=Math.hypot(dx,dy)||1;s.x+=dx/d*280*dt;s.y+=dy/d*280*dt;if(d<10)o.life=0}
        if(Math.random()<0.5)this.fxEmitter('poison').emitParticleAt(s.x,s.y);
        this.skHit(R(s.x-8,s.y-8,16,16),o.hit,0.9,Math.sign(o.vx)||o.f,{tag:o.tag});
        if(!o.back&&this.tileAt(s.x+o.f*6,s.y)==='#'){o.back=true;o.hit=new Set()}}
      if(o.life<=0){s.destroy();return false}return true});
  }
};
