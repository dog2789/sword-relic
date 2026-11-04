/* 공격 이펙트: 무기마다 다른 베기 빛, 휘두를 때 입자, 맞았을 때 터지는 효과, 하단 찌르기 잔상·충격파
   PlayScene에 섞어 씀 (Object.assign) */
import Phaser from 'phaser';
import {ITEMS} from '../data/items.js';

/* 무기 효과별 색과 입자 성질 */
const FX={
  basic:{main:0xffffff,cols:[0xffffff,0xdfe6f2,0xffe27a],grav:0,speed:[30,90],life:[160,320],hit:'star'},
  slime:{main:0x7fe07a,cols:[0x9fff8a,0x3fbf4a,0xe8ffe0],grav:520,speed:[50,140],life:[300,600],hit:'drop'},
  fire:{main:0xff8a2a,cols:[0xffd060,0xff7a2a,0xe8402a,0xffffff],grav:-160,speed:[20,80],life:[300,650],hit:'flame'},
  ice:{main:0x9ff0ff,cols:[0xffffff,0xbfeeff,0x6fc8ff],grav:60,speed:[30,110],life:[350,700],hit:'shard'},
  poison:{main:0xb06aff,cols:[0xd8a0ff,0x7a2ac0,0x9fff8a],grav:-60,speed:[20,90],life:[300,650],hit:'drop'},
  holy:{main:0x9fc0ff,cols:[0xffffff,0xbcd4ff,0xffe27a],grav:-40,speed:[20,100],life:[300,600],hit:'cross'}
};

export function buildFxTextures(sc){
  const add=(k,rows,pal)=>{if(sc.textures.exists(k))return;const w=Math.max(...rows.map(r=>r.length)),h=rows.length,c=sc.textures.createCanvas(k,w,h),x=c.getContext();
    rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const col=pal[r[i]];if(col){x.fillStyle=col;x.fillRect(i,y,1,1)}}});c.refresh()};
  add('fx_star',["....w....","....w....","...www...","..wwWww..","wwwWWWwww","..wwWww..","...www...","....w....","....w...."],{w:'#ffffff',W:'#ffffff'});
  add('fx_cross',["...ww...","...ww...","...ww...","wwwwwwww","wwwwwwww","...ww...","...ww...","...ww...","...ww...","...ww..."],{w:'#ffffff'});
  add('fx_flame',["...w....","..ww..w.",".wyw.ww.",".wyyww..","wyyyyw.w","wyYYyyww","wyYYYyw.",".wyYyw..","..www..."],{w:'#ff7a2a',y:'#ffd060',Y:'#ffffff'});
  add('fx_drop',[".ww.","wwww","wWww",".ww."],{w:'#ffffff',W:'#ffffff'});
  add('fx_streak',["w","w","W","W","W","W","w","w"],{w:'#ffffff',W:'#ffffff'});
}

export const Fx={
  fxKind(){const it=ITEMS[this.equip.weapon];return(it&&it.fx)||'basic'},
  fxCfg(){return FX[this.fxKind()]},
  /* 무기별 입자 발생기: 방마다 한 번 만들어 둠 */
  fxEmitter(kind){
    this.fxEms=this.fxEms||{};if(this.fxEms[kind]&&this.fxEms[kind].active)return this.fxEms[kind];
    const C=FX[kind],tex=kind==='slime'?'fx_drop':'px';
    return this.fxEms[kind]=this.add.particles(0,0,tex,{lifespan:{min:C.life[0],max:C.life[1]},speed:{min:C.speed[0],max:C.speed[1]},angle:{min:0,max:360},
      gravityY:C.grav,scale:kind==='slime'?{start:0.9,end:0.2}:{start:1.4,end:0},alpha:{start:1,end:0},tint:C.cols,emitting:false,blendMode:kind==='slime'?'NORMAL':'ADD'}).setDepth(41);
  },
  /* 휘두르기: 베기 위에 빛나는 잔광을 겹치고, 궤적을 따라 입자 */
  fxSwing(s,step,f){
    const C=this.fxCfg(),kind=this.fxKind(),p=this.player,big=step===3,w=this.equip.weapon,d=this.atk.on[0]*1000;
    // 빛나는 호 2장: 앞의 것은 휘두르는 방향으로 쓸고 지나가고, 뒤의 것은 잔상
    const sweep=(step===2?1:-1)*f;
    [[0.8,0,1],[0.45,sweep*28,0.92]].forEach(([al,ang,sc],i)=>{
      const g=this.add.image(s.x,s.y,(big?'glowC_':'glowA_')+w).setOrigin(s.originX,0.5).setFlipX(s.flipX).setFlipY(s.flipY).setDepth(11.5-i*0.1)
        .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setAngle(ang).setScale(sc);
      this.tweens.add({targets:g,alpha:{from:al,to:0},angle:ang-sweep*(big?40:30),delay:d+i*30,duration:big?280:200,ease:'Quad.easeOut',onComplete:()=>g.destroy()});
      if(i===0)this.slashGlow=g});
    const em=this.fxEmitter(kind),r=big?24:18,n=big?16:9;
    this.time.delayedCall(this.atk.on[0]*1000,()=>{for(let i=0;i<n;i++){const a=(-70+140*i/(n-1))*Math.PI/180*(step===2?-1:1);
      em.emitParticleAt(p.x+f*(4+Math.cos(a)*r),p.y+3+Math.sin(a)*r)}});
    if(big){const st=this.add.image(p.x+f*20,p.y+2,'fx_streak').setScale(14,0.6).setAngle(90).setBlendMode(Phaser.BlendModes.ADD).setTint(C.main).setDepth(11);
      this.tweens.add({targets:st,alpha:{from:0.9,to:0},scaleY:0.1,duration:220,onComplete:()=>st.destroy()})}
  },
  /* 맞았을 때: 무기마다 다른 모양이 터지고, 색 고리가 퍼짐 */
  fxHit(x,y,dir,crit,heavy,kind){
    kind=kind||this.fxKind();const C=FX[kind],em=this.fxEmitter(kind),big=crit||heavy;
    em.explode(big?18:10,x,y);
    const ring=this.add.circle(x,y,4).setStrokeStyle(big?2:1,C.main,1).setDepth(42).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({targets:ring,scale:big?5:3.5,alpha:{from:1,to:0},duration:big?300:220,ease:'Quad.easeOut',onComplete:()=>ring.destroy()});
    const k={star:'fx_star',drop:'fx_star',flame:'fx_flame',shard:'iceshard',cross:'fx_cross'}[C.hit];
    if(C.hit==='shard'){for(let i=0;i<4;i++){const a=(i*90+45+Math.random()*30)*Math.PI/180,s=this.add.image(x,y,'iceshard').setDepth(42).setRotation(a+Math.PI/2);
        this.tweens.add({targets:s,x:x+Math.cos(a)*16,y:y+Math.sin(a)*16,alpha:0,duration:320,ease:'Quad.easeOut',onComplete:()=>s.destroy()})}}
    const b=this.add.image(x,y,k).setDepth(42).setBlendMode(C.hit==='flame'?Phaser.BlendModes.NORMAL:Phaser.BlendModes.ADD).setAngle(C.hit==='cross'?0:Math.random()*45);
    if(C.hit==='star'||C.hit==='drop')b.setTint(C.main);
    this.tweens.add({targets:b,scale:{from:big?1.2:0.8,to:big?2.6:1.8},alpha:{from:1,to:0},y:C.hit==='flame'?y-8:y,duration:big?260:180,onComplete:()=>b.destroy()});
  },
  /* 하단 찌르기: 내려가는 동안 잔상 + 검 아래 빛줄기 */
  fxPogo(dt){
    const p=this.player,C=this.fxCfg();this.pogoT=(this.pogoT||0)-dt;
    if(this.pogoT<=0){this.pogoT=0.045;
      const gh=this.add.image(p.x,p.y,p.texture.key).setFlipX(p.flipX).setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(C.main).setAlpha(0.55);
      this.tweens.add({targets:gh,alpha:0,y:p.y-6,duration:220,onComplete:()=>gh.destroy()});
      const st=this.add.image(p.x,p.y+18,'fx_streak').setScale(2,1.6).setBlendMode(Phaser.BlendModes.ADD).setTint(C.main).setDepth(11).setAlpha(0.8);
      this.tweens.add({targets:st,alpha:0,scaleY:0.4,y:p.y+24,duration:160,onComplete:()=>st.destroy()});
      if(Math.random()<0.6)this.fxEmitter(this.fxKind()).emitParticleAt(p.x+(Math.random()-.5)*6,p.y+16)}
  },
  /* 하단 찌르기로 튀어 오를 때: 납작한 충격파 + 별 + 옆으로 퍼지는 입자 */
  fxPogoImpact(x,y){
    const C=this.fxCfg();
    const ring=this.add.ellipse(x,y,10,4).setStrokeStyle(2,C.main,1).setDepth(42).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({targets:ring,scaleX:5,scaleY:2.4,alpha:{from:1,to:0},duration:280,ease:'Quad.easeOut',onComplete:()=>ring.destroy()});
    const ring2=this.add.ellipse(x,y,6,3).setFillStyle(C.main,0.6).setDepth(42).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({targets:ring2,scaleX:4,scaleY:2,alpha:0,duration:180,onComplete:()=>ring2.destroy()});
    const st=this.add.image(x,y-2,'fx_star').setDepth(43).setBlendMode(Phaser.BlendModes.ADD).setTint(C.main);
    this.tweens.add({targets:st,scale:{from:1,to:2.8},alpha:{from:1,to:0},angle:45,duration:240,onComplete:()=>st.destroy()});
    const em=this.fxEmitter(this.fxKind());for(let i=0;i<12;i++)em.emitParticleAt(x+(Math.random()-.5)*20,y);
    this.dustEm.explode(6,x,y);this.shake(70,0.006);this.hitstop(35);
  }
};
