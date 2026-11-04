/* 슬라임 외 몬스터
   bat 박쥐(공중 급습), snail 가시 달팽이(지상 순찰), haunt 망령 갑옷(검 휘두르기)
   보스: batlord 박쥐 군주(급습 + 박쥐 소환), rust 녹슨 수문장(돌진 베기 + 점프 내려찍기) */
import {T,LH} from '../config.js';

export const MOBS={
  bat:{hp:22,dmg:7,exp:8,nm:'박쥐',kb:0.8,size:[10,6],off:[2,1],fly:true},
  snail:{hp:40,dmg:8,exp:10,nm:'가시 달팽이',kb:0.25,size:[14,9],off:[1,2]},
  haunt:{hp:70,dmg:11,exp:22,nm:'망령 갑옷',kb:0.35,size:[9,14],off:[12,3],tex:'kn_haunt_idle0'},
  batlord:{hp:360,dmg:14,exp:120,nm:'박쥐 군주',kb:0.05,size:[10,8],off:[2,4],fly:true,scale:2.4,boss:true,tex:'batlord0'},
  rust:{hp:520,dmg:16,exp:200,nm:'녹슨 수문장',kb:0.05,size:[9,14],off:[12,3],scale:2,boss:true,tex:'kn_rust_idle0'}
};

export function makeMobAnims(scene){
  const mk=(key,frames,rate)=>{if(!scene.anims.exists(key))scene.anims.create({key,frames:frames.map(f=>({key:f})),frameRate:rate,repeat:-1})};
  mk('bat_anim',['bat0','bat1'],8);mk('snail_anim',['snail0','snail1'],3);mk('batlord_anim',['batlord0','batlord1'],6);
  for(const k of ['haunt','rust']){mk(k+'_idle',['kn_'+k+'_idle0','kn_'+k+'_idle1'],2.5);mk(k+'_run',['kn_'+k+'_run0','kn_'+k+'_run1'],k==='rust'?5:7)}
}

export function spawnMob(scene,d){
  const M=MOBS[d.t];if(!M)return null;
  const x=d.tx*T+8,y=d.ty*T+8,e=scene.enemies.create(x,y,M.tex||d.t+'0');
  if(M.scale)e.setScale(M.scale);
  e.body.setSize(...M.size).setOffset(...M.off);
  if(M.fly)e.body.setAllowGravity(false);
  e.setCollideWorldBounds(true).setDepth(M.boss?6:5);
  Object.assign(e,{def:d,mob:d.t,hp:M.hp,maxHp:M.hp,dmg:M.dmg,exp:M.exp,nm:(scene.R.theme==='cave'&&d.t==='bat')?'동굴 박쥐':M.nm,kb:M.kb,boss:M.boss?d.t:null,
    stun:0,home:{x,y},state:M.boss?'intro':'hover',t0:Math.random()*6,cool:1+Math.random(),dir:Math.random()<.5?-1:1,st:0,n:0});
  if(d.t==='bat'||d.t==='snail'||d.t==='batlord')e.play(d.t+'_anim');else e.play(d.t+'_idle');
  if(M.boss)e.st=1.2;
  e.setAlpha(0);scene.tweens.add({targets:e,alpha:1,duration:M.boss?900:400});
  return e;
}

/* 앞쪽 공격 범위가 주인공과 겹치면 피해 */
function swing(scene,e,w,h,dmg){
  const p=scene.player;if(p.dead)return;
  const f=e.dir,x0=f>0?e.body.right-4:e.body.left+4-w,y0=e.body.top+e.body.height/2-h/2;
  const b=p.body;if(b.right>x0&&b.left<x0+w&&b.bottom>y0&&b.top<y0+h)scene.hurtBy(dmg,e.x,'enemy');
}
const onGround=e=>e.body.blocked.down||e.body.touching.down;

export function updateMob(scene,e,dt){
  const p=scene.player;
  if(e.mob==='bat'){
    e.t0+=dt;
    if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.9,e.body.velocity.y*0.9);if(e.stun<=0)e.state='back';return}
    const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
    if(e.state==='hover'){
      const tx=e.home.x+Math.sin(e.t0*1.3)*18,ty=e.home.y+Math.sin(e.t0*2.1)*6;
      e.setVelocity((tx-e.x)*2.5,(ty-e.y)*2.5);e.cool-=dt;
      if(d<100&&e.cool<=0&&!p.dead){e.state='dive';e.diveT=0.9;e.setVelocity(dx/d*90,dy/d*90)}
    }else if(e.state==='dive'){
      e.diveT-=dt;const b=e.body.blocked;
      if(e.diveT<=0||b.down||b.up||b.left||b.right)e.state='back';
    }else{
      const hx=e.home.x-e.x,hy=e.home.y-e.y,hd=Math.hypot(hx,hy);
      if(hd<6){e.state='hover';e.cool=1.4+Math.random()}else e.setVelocity(hx/hd*55,hy/hd*55);
    }
    e.setFlipX(e.body.velocity.x<0);
    return;
  }
  if(e.mob==='snail'){
    if(e.stun>0){e.stun-=dt;return}
    if(!onGround(e))return;
    const ahead=scene.tileAt(e.x+e.dir*10,e.body.bottom+4),floor=ahead==='#'||ahead==='-'||ahead==='='||ahead==='H'||ahead==='V';
    const hitWall=(e.dir<0&&e.body.blocked.left)||(e.dir>0&&e.body.blocked.right);
    if(hitWall||!floor||scene.tileAt(e.x+e.dir*10,e.body.bottom-2)==='^')e.dir*=-1;
    e.setVelocityX(e.dir*22);e.setFlipX(e.dir<0);
    return;
  }
  if(e.mob==='haunt')return updateKnight(scene,e,dt,{spd:30,chase:46,reach:30,wind:0.5,lunge:150,atkT:0.22,rest:0.7,w:22,h:16,bonus:4,see:110});
  if(e.mob==='rust')return updateRust(scene,e,dt);
  if(e.mob==='batlord')return updateBatLord(scene,e,dt);
}

/* 망령 갑옷: 순찰 → 다가옴 → 검을 치켜듦(예고) → 돌진 베기 → 숨 고르기 */
function updateKnight(scene,e,dt,o){
  const p=scene.player,k='kn_'+e.mob+'_';
  if(e.stun>0){e.stun-=dt;return}
  e.st-=dt;const dx=p.x-e.x,near=!p.dead&&Math.abs(dx)<o.see&&Math.abs(p.y-e.y)<40;
  const edge=()=>{const a=scene.tileAt(e.x+e.dir*10,e.body.bottom+4);return!(a==='#'||a==='-'||a==='='||a==='H'||a==='V')||scene.tileAt(e.x+e.dir*10,e.body.bottom-2)==='^'};
  if(e.state==='wind'){e.setVelocityX(0);if(e.st<=0){e.state='atk';e.st=o.atkT;e.setTexture(k+'atk');e.setVelocityX(e.dir*o.lunge)}return}
  if(e.state==='atk'){swing(scene,e,o.w,o.h,e.dmg+o.bonus);if(edge())e.setVelocityX(0);if(e.st<=0){e.state='rest';e.st=o.rest;e.setVelocityX(0);e.play(e.mob+'_idle')}return}
  if(e.state==='rest'){e.setVelocityX(e.body.velocity.x*0.85);if(e.st<=0)e.state='hover';return}
  if(!onGround(e))return;
  if(near){e.dir=Math.sign(dx)||1;
    if(Math.abs(dx)<o.reach){e.state='wind';e.st=o.wind;e.anims.stop();e.setTexture(k+'wind');e.setVelocityX(0);e.setFlipX(e.dir<0);return}
    if(edge())e.setVelocityX(0);else e.setVelocityX(e.dir*o.chase)}
  else{const hitWall=(e.dir<0&&e.body.blocked.left)||(e.dir>0&&e.body.blocked.right);if(hitWall||edge())e.dir*=-1;e.setVelocityX(e.dir*o.spd)}
  if(e.anims.currentAnim?.key!==e.mob+'_run')e.play(e.mob+'_run');
  e.setFlipX(e.dir<0);
}

/* 녹슨 수문장: 걷기 → 베기(예고 후 돌진) / 3번째마다 점프 내려찍기(충격파). 체력 절반 이하면 빨라짐 */
function updateRust(scene,e,dt){
  const p=scene.player,k='kn_rust_',rage=e.hp<e.maxHp/2;
  if(e.state==='intro'){e.st-=dt;e.setVelocityX(0);if(e.st<=0){e.state='walk';e.st=0.6}return}
  if(e.stun>0){e.stun-=dt;return}
  e.st-=dt;const dx=p.x-e.x;
  if(e.state==='wind'){e.setVelocityX(0);if(e.st<=0){e.state='atk';e.st=0.3;e.setTexture(k+'atk');e.setVelocityX(e.dir*(rage?240:200));scene.shake(80,0.006)}return}
  if(e.state==='atk'){swing(scene,e,44,34,e.dmg+6);if(e.st<=0){e.state='rest';e.st=rage?0.45:0.8;e.setVelocityX(0);e.play('rust_idle')}return}
  if(e.state==='jump'){
    if(e.st<-2){e.state='rest';e.st=0.5;return}
    if(onGround(e)&&e.st<0.6){e.state='rest';e.st=rage?0.5:0.9;e.setVelocityX(0);e.play('rust_idle');
      scene.shake(160,0.012);scene.dustEm.explode(14,e.x,e.body.bottom);
      [-1,1].forEach(d=>quake(scene,e.x+d*14,e.body.bottom,d,e.dmg));if(rage)scene.time.delayedCall(260,()=>{if(e.active)[-1,1].forEach(d=>quake(scene,e.x+d*14,e.body.bottom,d,e.dmg))})}
    return}
  if(e.state==='rest'){e.setVelocityX(e.body.velocity.x*0.85);if(e.st<=0)e.state='walk';return}
  if(!onGround(e)||p.dead){e.setVelocityX(0);return}
  e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(e.st<=0&&(Math.abs(dx)<60||e.n%3===2)){
    e.n++;
    if(e.n%3===0){e.state='jump';e.st=1.2;e.anims.stop();e.setTexture(k+'wind');e.setVelocity(Math.max(-150,Math.min(150,dx*1.3)),-380);return}
    e.state='wind';e.st=rage?0.4:0.6;e.anims.stop();e.setTexture(k+'wind');e.setVelocityX(0);return}
  if(e.st<=0&&Math.abs(dx)>=60&&Math.random()<dt*0.6){e.n=2;e.st=0}
  e.setVelocityX(e.dir*(rage?62:44));
  if(e.anims.currentAnim?.key!=='rust_run')e.play('rust_run');
}
function quake(scene,x,y,d,dmg){
  const s=scene.add.image(x,y,'quake').setOrigin(0.5,1).setDepth(12).setFlipX(d<0);
  scene.quakes.push({s,vx:d*150,life:1.1,dmg,hit:false});
}
export function updateQuakes(scene,dt){
  const p=scene.player;
  scene.quakes=scene.quakes.filter(q=>{
    q.life-=dt;q.s.x+=q.vx*dt;q.s.setScale(1,0.8+Math.sin(q.life*30)*0.2);
    const ahead=scene.tileAt(q.s.x+Math.sign(q.vx)*6,q.s.y-4),floor=scene.tileAt(q.s.x,q.s.y+2);
    if(ahead==='#'||floor==='.'||floor==='^')q.life=0;
    if(!q.hit&&!p.dead&&Math.abs(p.x-q.s.x)<9&&p.body.bottom>q.s.y-12&&p.body.bottom<=q.s.y+2){q.hit=true;scene.hurtBy(q.dmg,q.s.x,'enemy')}
    if(q.life<=0){q.s.destroy();return false}return true});
}

/* 박쥐 군주: 천장 근처를 맴돌다 급습, 가끔 박쥐를 부름. 체력 절반 이하면 급습이 연속으로 */
const hoverY=scene=>Math.max(2.8*T,scene.cameras.main.worldView.y+38);
function updateBatLord(scene,e,dt){
  const p=scene.player,rage=e.hp<e.maxHp/2;e.t0+=dt;
  if(e.state==='intro'){e.st-=dt;e.setVelocity(0,-10);if(e.st<=0){e.state='hover';e.cool=1.5;e.st=4}return}
  if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.8,e.body.velocity.y*0.8);return}
  const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
  if(e.state==='hover'){
    // 화면 위쪽(카메라 기준)을 맴돔 — 방이 화면보다 높아서 천장 기준이면 안 보임
    const cx=scene.lw/2+Math.sin(e.t0*0.7)*(scene.lw/2-60),cy=hoverY(scene)+Math.sin(e.t0*1.9)*10;
    e.setVelocity((cx-e.x)*1.6,(cy-e.y)*2);e.cool-=dt;e.st-=dt;
    if(e.st<=0){e.st=rage?5:7.5;
      const kids=scene.enemies.getChildren().filter(o=>o.def&&o.def.summon).length;
      if(kids<3)for(const s of [-1,1]){const b=spawnMob(scene,{t:'bat',tx:(e.x+s*24)/T-0.5,ty:e.y/T-0.5,summon:true});if(b){b.cool=0.6;scene.batEm.explode(6,b.x,b.y)}}}
    else if(e.cool<=0&&!p.dead){e.state='dive';e.diveT=1.1;e.chain=rage?2:1;e.setVelocity(dx/d*(rage?190:160),dy/d*(rage?190:160))}
  }else if(e.state==='dive'){
    e.diveT-=dt;const b=e.body.blocked;
    if(e.diveT<=0||b.down||b.left||b.right){e.chain--;
      if(e.chain>0&&!p.dead){e.diveT=0.9;e.setVelocity(dx/d*190,dy/d*190);if(b.down)scene.shake(60,0.005)}
      else{e.state='rise';if(b.down)scene.shake(80,0.006)}}
  }else{
    e.setVelocity((e.x<scene.lw/2?20:-20),-120);
    if(e.y<hoverY(scene)+8){e.state='hover';e.cool=rage?1.1:1.8}
  }
  e.setFlipX(e.body.velocity.x<0);
}
