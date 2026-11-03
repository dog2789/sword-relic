/* 슬라임 외 몬스터: 박쥐(공중 급습), 가시 달팽이(지상 순찰) */
import {T} from '../config.js';

export const MOBS={
  bat:{hp:22,dmg:7,exp:8,nm:'박쥐',kb:0.8,size:[10,6],off:[2,1],fly:true},
  snail:{hp:40,dmg:8,exp:10,nm:'가시 달팽이',kb:0.25,size:[14,9],off:[1,2]}
};

export function makeMobAnims(scene){
  const mk=(key,frames,rate)=>{if(!scene.anims.exists(key))scene.anims.create({key,frames:frames.map(f=>({key:f})),frameRate:rate,repeat:-1})};
  mk('bat_anim',['bat0','bat1'],8);mk('snail_anim',['snail0','snail1'],3);
}

export function spawnMob(scene,d){
  const M=MOBS[d.t];if(!M)return null;
  const x=d.tx*T+8,y=d.ty*T+8,e=scene.enemies.create(x,y,d.t+'0');
  e.body.setSize(...M.size).setOffset(...M.off);
  if(M.fly)e.body.setAllowGravity(false);
  e.setCollideWorldBounds(true).setDepth(5);
  Object.assign(e,{def:d,mob:d.t,hp:M.hp,maxHp:M.hp,dmg:M.dmg,exp:M.exp,nm:(scene.R.theme==='cave'&&d.t==='bat')?'동굴 박쥐':M.nm,kb:M.kb,
    stun:0,home:{x,y},state:'hover',t0:Math.random()*6,cool:1+Math.random(),dir:Math.random()<.5?-1:1});
  e.play(d.t+'_anim');
  e.setAlpha(0);scene.tweens.add({targets:e,alpha:1,duration:400});
  return e;
}

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
    if(!(e.body.blocked.down||e.body.touching.down))return;
    const ahead=scene.tileAt(e.x+e.dir*10,e.body.bottom+4),floor=ahead==='#'||ahead==='-'||ahead==='='||ahead==='H'||ahead==='V';
    const hitWall=(e.dir<0&&e.body.blocked.left)||(e.dir>0&&e.body.blocked.right);
    if(hitWall||!floor||scene.tileAt(e.x+e.dir*10,e.body.bottom-2)==='^')e.dir*=-1;
    e.setVelocityX(e.dir*22);e.setFlipX(e.dir<0);
  }
}
