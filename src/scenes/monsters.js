/* 슬라임 외 몬스터
   bat 박쥐(공중 급습), snail 가시 달팽이(지상 순찰), haunt 망령 갑옷(검 휘두르기)
   보스: batlord 박쥐 군주(급습 + 박쥐 소환), rust 녹슨 수문장(돌진 베기 + 점프 내려찍기) */
import Phaser from 'phaser';
import {T,LH,RESPAWN_MS} from '../config.js';

/* 지역이 깊어질수록 일반 몬스터·함정이 강해짐 (체력·공격·방어·경험치) */
export const TIER={meadow:1,treetop:1,cave:1.4,castle:1.9,ice:2.4,desert:2.9,lava:3.4,sky:3.9,demon:4.4};
export const tierOf=scene=>TIER[scene.R.theme]||1;

export const MOBS={
  bat:{hp:24,dmg:9,exp:8,nm:'박쥐',kb:0.8,size:[10,6],off:[2,1],fly:true},
  snail:{hp:44,dmg:10,exp:10,nm:'가시 달팽이',kb:0.25,size:[14,9],off:[1,2]},
  haunt:{hp:80,dmg:14,exp:22,nm:'망령 갑옷',kb:0.35,size:[9,14],off:[12,6],tex:'kn_haunt_idle0'},
  batlord:{hp:620,dmg:18,exp:140,def:6,nm:'박쥐 군주',kb:0.05,size:[10,8],off:[2,4],fly:true,scale:2.4,boss:true,tex:'batlord0'},
  fish:{hp:30,dmg:10,exp:9,nm:'가시 물고기',kb:0.6,size:[12,6],off:[1,1],fly:true},
  turtle:{hp:1150,dmg:24,exp:300,def:16,nm:'서리 거북',kb:0.03,size:[20,8],off:[0,1],scale:2.4,boss:true,tex:'turtle0'},
  scorp:{hp:48,dmg:12,exp:14,nm:'사막 전갈',kb:0.4,size:[13,7],off:[1,2],tex:'scorp0'},
  mummy:{hp:95,dmg:13,exp:20,nm:'미라',kb:0.3,size:[9,14],off:[12,6],tex:'kn_mummy_idle0'},
  sala:{hp:56,dmg:12,exp:18,nm:'불도롱뇽',kb:0.4,size:[14,5],off:[1,1],tex:'sala0'},
  scorpking:{hp:1400,dmg:28,exp:380,nm:'전갈왕',kb:0.03,size:[13,7],off:[1,2],scale:2.8,boss:true,def:20,tex:'scorpk0'},
  golem:{hp:1800,dmg:32,exp:500,nm:'화염 골렘',kb:0.02,size:[10,11],off:[2,1],scale:2.6,boss:true,def:26,tex:'golem0'},
  rust:{hp:950,dmg:24,exp:240,def:12,guard:true,nm:'녹슨 수문장',kb:0.05,size:[9,14],off:[12,6],scale:2,boss:true,tex:'kn_rust_idle0'},
  /* 하늘 성채 */
  harpy:{hp:36,dmg:11,exp:10,nm:'하피',kb:0.6,size:[12,8],off:[1,0],fly:true,tex:'harpy0'},
  wisp:{hp:40,dmg:12,exp:12,nm:'번개 정령',kb:0.5,size:[7,7],off:[1,1],fly:true,tex:'wisp0'},
  griffin:{hp:2600,dmg:36,exp:700,def:30,nm:'폭풍 그리폰',kb:0.02,size:[16,9],off:[2,3],fly:true,scale:2.4,boss:true,tex:'griffin0'},
  /* 지역마다 하나씩 더: 동굴 거미(천장에서 내려옴), 유령(벽 통과·사라졌다 등 뒤에), 눈사람(눈덩이 던짐), 폭탄 바위(다가와서 터짐) */
  spider:{hp:34,dmg:11,exp:11,nm:'동굴 거미',kb:0.5,size:[10,7],off:[1,1],fly:true,tex:'spider0'},
  ghost:{hp:44,dmg:12,exp:14,nm:'떠도는 유령',kb:0.6,size:[10,10],off:[1,1],fly:true,tex:'ghost0'},
  snowman:{hp:60,dmg:11,exp:15,nm:'눈사람',kb:0.2,size:[10,13],off:[1,0],tex:'snowman0'},
  bomber:{hp:40,dmg:12,exp:14,nm:'폭탄 바위',kb:0.5,size:[10,8],off:[1,3],tex:'bomber0'},
  /* 초원 뿔 토끼(깡충 뛰어 덤빔), 고목 꿀벌(멈칫한 뒤 일직선 침 돌격), 사막 모래 지렁이(땅속으로 따라와 발밑에서 솟음) */
  hare:{hp:28,dmg:8,exp:7,nm:'뿔 토끼',kb:0.7,size:[10,8],off:[1,2],tex:'hare0'},
  bee:{hp:20,dmg:9,exp:7,nm:'꿀벌',kb:0.8,size:[8,6],off:[1,1],fly:true,tex:'bee0'},
  worm:{hp:50,dmg:13,exp:15,nm:'모래 지렁이',kb:0.1,size:[8,10],off:[2,0],fly:true,tex:'worm0'},
  /* 마왕성 */
  eyebat:{hp:36,dmg:11,exp:10,nm:'눈알 박쥐',kb:0.7,size:[10,6],off:[2,1],fly:true,tex:'eyebat0'},
  shade:{hp:70,dmg:13,exp:17,nm:'그림자 기사',kb:0.3,size:[9,14],off:[12,6],tex:'kn_shade_idle0'},
  skull:{hp:52,dmg:12,exp:15,nm:'해골 마법사',kb:0.35,size:[9,14],off:[12,6],tex:'kn_skull_idle0'},
  /* 2차 지역 몬스터: 초원 버섯(튀어 오르며 포자), 고목 사마귀(멈칫 후 앞발 베기), 동굴 두더지(땅에서 솟아 돌 던짐), 고성 가고일(석상인 척하다 급습),
     얼음 정령(냉기 조각: 맞으면 느려짐), 사막 독수리(머리 위에서 내리꽂기), 용암 슬라임(지나간 자리에 불길), 천둥 구름(아래로 번개), 미믹(보물 상자인 척) */
  shroom:{hp:30,dmg:8,exp:8,nm:'버섯 도깨비',kb:0.6,size:[10,8],off:[1,3],tex:'shroom0'},
  mantis:{hp:46,dmg:10,exp:11,nm:'사마귀',kb:0.4,size:[8,12],off:[6,2],tex:'kn_mantis_idle0'},
  mole:{hp:38,dmg:10,exp:11,nm:'두더지',kb:0.3,size:[10,9],off:[1,1],tex:'mole0'},
  garg:{hp:55,dmg:12,exp:14,nm:'가고일',kb:0.4,size:[10,8],off:[2,1],fly:true,tex:'garg0'},
  iwisp:{hp:40,dmg:11,exp:13,nm:'얼음 정령',kb:0.6,size:[8,8],off:[1,1],fly:true,tex:'iwisp0'},
  vult:{hp:44,dmg:12,exp:13,nm:'독수리',kb:0.5,size:[12,6],off:[2,1],fly:true,tex:'vult0'},
  mslime:{hp:50,dmg:12,exp:14,nm:'용암 슬라임',kb:0.4,size:[12,8],off:[1,2],tex:'mslime0'},
  tcloud:{hp:48,dmg:12,exp:14,nm:'천둥 구름',kb:0.4,size:[14,7],off:[1,1],fly:true,tex:'tcloud0'},
  mimic:{hp:90,dmg:14,exp:25,nm:'미믹',kb:0.2,size:[12,10],off:[1,1],tex:'chest0'},
  /* 중간보스: 하늘 성채 바람 기사(돌풍으로 밀고 깃털 칼날), 마왕성 근위대장(방패로 막다가 반격, 내려찍기) */
  windk:{hp:1500,dmg:30,exp:450,def:24,nm:'바람 기사',kb:0.04,size:[9,14],off:[12,6],scale:2,boss:true,tex:'kn_windk_idle0'},
  gcapt:{hp:2400,dmg:36,exp:750,def:30,guard:true,nm:'근위대장',kb:0.03,size:[9,14],off:[12,6],scale:2,boss:true,tex:'kn_gcapt_idle0'},
  demon:{hp:3400,dmg:40,exp:1000,def:34,nm:'마왕',kb:0.02,size:[9,14],off:[12,6],scale:2.2,boss:true,tex:'kn_demon_idle0'}
};
/* 보스 순서 (뒤로 갈수록 어려움): 패턴 타이머를 1 + 0.04×단계 배 빠르게 */
const BOSS_LV={batlord:1,rust:2,turtle:3,scorpking:4,golem:5,windk:5.5,griffin:6,gcapt:6.5,demon:7};
/* 박쥐처럼 맴도는 몬스터 (공격은 다름: 박쥐 급습, 하피 활강, 눈알 박쥐 광선 구슬) */
const BATLIKE=['bat','harpy','eyebat','garg'];
const NEW=['spider','ghost','snowman','bomber','hare','bee','worm','shroom','mole','garg','iwisp','vult','mslime','tcloud'];

export function makeMobAnims(scene){
  const mk=(key,frames,rate)=>{if(!scene.anims.exists(key))scene.anims.create({key,frames:frames.map(f=>({key:f})),frameRate:rate,repeat:-1})};
  mk('bat_anim',['bat0','bat1'],8);mk('snail_anim',['snail0','snail1'],3);mk('batlord_anim',['batlord0','batlord1'],6);mk('fish_anim',['fish0','fish1'],5);mk('turtle_anim',['turtle0','turtle1'],3);mk('scorp_anim',['scorp0','scorp1'],6);mk('scorpking_anim',['scorpk0','scorpk1'],5);mk('sala_anim',['sala0','sala1'],5);mk('golem_anim',['golem0','golem1'],3);
  mk('harpy_anim',['harpy0','harpy1'],7);mk('wisp_anim',['wisp0','wisp1'],6);mk('eyebat_anim',['eyebat0','eyebat1'],8);mk('griffin_anim',['griffin0','griffin1'],5);
  for(const k of NEW)mk(k+'_anim',[k+'0',k+'1'],k==='ghost'?3:k==='snowman'||k==='worm'?2:k==='bee'?12:6);
  for(const k of ['haunt','rust','mummy','shade','skull','demon','mantis','windk','gcapt']){mk(k+'_idle',['kn_'+k+'_idle0','kn_'+k+'_idle1'],2.5);mk(k+'_run',['kn_'+k+'_run0','kn_'+k+'_run1'],k==='rust'?5:7)}
}

export function spawnMob(scene,d){
  const M=MOBS[d.t];if(!M)return null;
  const x=d.tx*T+8,y=d.ty*T+8,e=scene.enemies.create(x,y,M.tex||d.t+'0');
  if(M.scale)e.setScale(M.scale);
  e.body.setSize(...M.size).setOffset(...M.off);
  if(M.fly)e.body.setAllowGravity(false);
  e.setCollideWorldBounds(true).setDepth(M.boss?6:5);
  const tr=M.boss?1:tierOf(scene),hp=Math.round(M.hp*tr);
  Object.assign(e,{def:d,mob:d.t,hp,maxHp:hp,dmg:Math.round(M.dmg*(0.6+0.4*tr)),exp:Math.round(M.exp*tr),arm:M.def!=null?M.def:Math.round((tr-1)*6),guard:!!M.guard,nm:d.t==='bat'?({cave:'동굴 박쥐',desert:'모래 박쥐',lava:'불 박쥐',ice:'얼음 박쥐'}[scene.R.theme]||M.nm):M.nm,kb:M.kb,boss:M.boss?d.t:null,
    stun:0,home:{x,y},state:M.boss?'intro':'hover',t0:Math.random()*6,cool:1+Math.random(),dir:Math.random()<.5?-1:1,st:0,n:0});
  if(['bat','snail','batlord','fish','turtle','scorp','sala','golem','harpy','wisp','eyebat','griffin',...NEW].includes(d.t))e.play(d.t+'_anim');else if(d.t==='scorpking')e.play('scorpking_anim');
  if(d.t==='bat'&&scene.R.theme==='lava'){e.baseTint=0xff9a5a;e.setTint(e.baseTint)}else if(scene.anims.exists(d.t+'_idle'))e.play(d.t+'_idle');
  if(M.boss)e.st=1.2;
  if(d.t==='spider'){   // 바로 위 천장에 거미줄을 걸고 매달림
    let ty=d.ty;while(ty>0&&scene.tileAt(x,(ty-1)*T+8)!=='#')ty--;e.top=ty*T;e.home.y=Math.max(e.top+10,y-24);e.body.reset(x,e.home.y);e.state='wait';
    e.thread=scene.add.rectangle(x,e.top,1,1,0xd8d0e8,0.7).setOrigin(0.5,0).setDepth(4);e.on('destroy',()=>e.thread.destroy())}
  if(d.t==='ghost'){e.noclip=true;e.state='float';e.cool=2+Math.random()*2}
  if(d.t==='snowman'||d.t==='bomber'||d.t==='mslime')e.state='walk';
  if(d.t==='gcapt'){e.baseTint=0xffb8b8;e.setTint(e.baseTint)}   // 그림자 기사 갑옷을 붉게
  if(d.t==='garg'){e.state='stone';e.anims.stop();e.setTexture('garg0')}
  if(d.t==='mimic'){e.state='sleep';e.cool=0}
  if(d.t==='mole'){   // 아래 바닥까지 내려가 구멍 속에 숨음 (지렁이처럼 숨어 있을 땐 맞지 않음)
    let ty=d.ty;while(ty<12&&scene.tileAt(x,(ty+1)*T+8)==='.')ty++;e.home.y=(ty+1)*T-6;e.body.reset(x,e.home.y);
    e.state='under';e.body.enable=false;e.cool=0.8;e.alpha=0;e.anims.stop();return e}
  if(d.t==='worm'){   // 아래 바닥까지 내려가 땅속에 숨음
    let ty=d.ty;while(ty<12&&scene.tileAt(x,(ty+1)*T+8)==='.')ty++;e.home.y=(ty+1)*T-5;e.body.reset(x,e.home.y);
    e.state='under';e.body.enable=false;e.cool=1;e.anims.stop();e.setTexture('worm1');e.alpha=0;return e}
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
  const p=scene.player;if(e.boss&&BOSS_LV[e.mob])dt*=1+0.04*BOSS_LV[e.mob];
  if(e.mob==='spider')return updateSpider(scene,e,dt);
  if(e.mob==='ghost')return updateGhost(scene,e,dt);
  if(e.mob==='snowman')return updateSnowman(scene,e,dt);
  if(e.mob==='bomber')return updateBomber(scene,e,dt);
  if(e.mob==='hare')return updateHare(scene,e,dt);
  if(e.mob==='bee')return updateBee(scene,e,dt);
  if(e.mob==='worm')return updateWorm(scene,e,dt);
  if(e.mob==='shroom')return updateShroom(scene,e,dt);
  if(e.mob==='mole')return updateMole(scene,e,dt);
  if(e.mob==='iwisp')return updateIceWisp(scene,e,dt);
  if(e.mob==='vult')return updateVulture(scene,e,dt);
  if(e.mob==='mslime')return updateMagmaSlime(scene,e,dt);
  if(e.mob==='tcloud')return updateCloud(scene,e,dt);
  if(e.mob==='mimic')return updateMimic(scene,e,dt);
  if(e.mob==='mantis')return updateKnight(scene,e,dt,{spd:26,chase:52,reach:26,wind:0.42,lunge:150,atkT:0.2,rest:0.55,w:18,h:12,bonus:3,see:120});
  if(e.mob==='garg'&&e.state==='stone'){   // 석상: 가만히 있다가 가까이 오거나 맞으면 깨어남
    e.setVelocity(0,0);const p2=scene.player;if(e.stun>0||(!p2.dead&&Math.hypot(p2.x-e.x,p2.y-e.y)<80)){e.state='hover';e.home.x=e.x;e.home.y=e.y;e.cool=0.3;e.play('garg_anim');scene.dustEm.explode(6,e.x,e.y)}return}
  if(e.mob==='harpy'&&e.state==='swoop')return updateSwoop(scene,e,dt);
  if(BATLIKE.includes(e.mob)){
    e.t0+=dt;
    if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.9,e.body.velocity.y*0.9);if(e.stun<=0)e.state='back';return}
    const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
    if(e.state==='hover'){
      const tx=e.home.x+Math.sin(e.t0*1.3)*18,ty=e.home.y+Math.sin(e.t0*2.1)*6;
      e.setVelocity((tx-e.x)*2.5,(ty-e.y)*2.5);e.cool-=dt;
      if(d<(e.mob==='harpy'?160:110)&&e.cool<=0&&!p.dead){
        // 하피: 주인공 높이까지 U자로 활강해 반대편으로 / 눈알 박쥐: 눈이 빨개졌다가 광선 구슬 / 박쥐: 곧장 급습
        if(e.mob==='harpy'){e.state='swoop';e.sw={x0:e.x,y0:e.y,x1:Phaser.Math.Clamp(p.x+(p.x-e.x),16,scene.lw-16),py:p.y,t:0}}
        else if(e.mob==='eyebat'){e.state='stare';e.st=0.55;e.setTint(0xff5a6a)}
        else{e.state='dive';e.diveT=0.9;e.setVelocity(dx/d*120,dy/d*120)}}
    }else if(e.state==='stare'){
      e.setVelocity(e.body.velocity.x*0.8,e.body.velocity.y*0.8);e.st-=dt;
      if(e.st<=0){e.clearTint();if(!p.dead){const s=scene.add.image(e.x,e.y,'darkorb').setDepth(12).setTint(0xff6a7a);scene.eshots.push({s,vx:dx/d*170,vy:dy/d*170,g:0,life:2,dmg:e.dmg,spin:true})}
        e.state='hover';e.cool=1.8+Math.random()*0.8}
    }else if(e.state==='dive'){
      e.diveT-=dt;const b=e.body.blocked;
      if(e.diveT<=0||b.down||b.up||b.left||b.right)e.state='back';
    }else{
      const hx=e.home.x-e.x,hy=e.home.y-e.y,hd=Math.hypot(hx,hy);
      if(hd<6){e.state='hover';e.cool=0.8+Math.random()*0.6}else e.setVelocity(hx/hd*55,hy/hd*55);
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
    e.setVelocityX(e.dir*32);e.setFlipX(e.dir<0);
    return;
  }
  if(e.mob==='fish')return updateFish(scene,e,dt);
  if(e.mob==='turtle')return updateTurtle(scene,e,dt);
  if(e.mob==='scorp')return updateScorp(scene,e,dt);
  if(e.mob==='mummy')return updateKnight(scene,e,dt,{spd:22,chase:34,reach:20,wind:0.45,lunge:120,atkT:0.2,rest:0.6,w:16,h:14,bonus:3,see:110});
  if(e.mob==='sala')return updateSala(scene,e,dt);
  if(e.mob==='scorpking')return updateScorpKing(scene,e,dt);
  if(e.mob==='golem')return updateGolem(scene,e,dt);
  if(e.mob==='haunt')return updateKnight(scene,e,dt,{spd:34,chase:58,reach:32,wind:0.38,lunge:185,atkT:0.24,rest:0.5,w:24,h:16,bonus:5,see:130});
  if(e.mob==='rust')return updateRust(scene,e,dt);
  if(e.mob==='batlord')return updateBatLord(scene,e,dt);
  if(e.mob==='wisp')return updateWisp(scene,e,dt);
  if(e.mob==='shade')return updateKnight(scene,e,dt,{spd:38,chase:66,reach:30,wind:0.32,lunge:210,atkT:0.24,rest:0.45,w:26,h:16,bonus:6,see:140});
  if(e.mob==='skull')return updateSkull(scene,e,dt);
  if(e.mob==='griffin')return updateGriffin(scene,e,dt);
  if(e.mob==='demon')return updateDemon(scene,e,dt);
  if(e.mob==='windk')return updateWindKnight(scene,e,dt);
  if(e.mob==='gcapt')return updateCaptain(scene,e,dt);
}

/* 하피 활강: 시작점 → 주인공 높이 → 반대편 같은 높이 (U자) */
function updateSwoop(scene,e,dt){
  const s=e.sw;if(e.stun>0){e.stun-=dt;e.state='back';return}
  s.t+=dt/1.1;const t=Math.min(1,s.t),tx=s.x0+(s.x1-s.x0)*t,ty=s.y0+(s.py-s.y0)*Math.sin(Math.PI*t),k=1/Math.max(dt,0.008);
  e.setVelocity((tx-e.x)*k,(ty-e.y)*k);e.setFlipX(s.x1<s.x0);
  if(Math.random()<0.25)scene.fxEmitter('storm').emitParticleAt(e.x,e.y);
  if(t>=1){e.home.x=s.x1;e.home.y=s.y0;e.setVelocity(0,0);e.state='hover';e.cool=1.4+Math.random()*0.8}
}
/* 동굴 거미: 천장에 매달려 있다가 주인공이 밑을 지나가면 줄을 타고 뚝 떨어짐 → 잠깐 대롱대롱 → 다시 올라감 */
function updateSpider(scene,e,dt){
  const p=scene.player;e.thread.setPosition(e.x,e.top).setSize(1,Math.max(1,e.y-4-e.top));
  if(e.stun>0){e.stun-=dt;e.setVelocity(0,e.body.velocity.y*0.8);if(e.stun<=0)e.state='up';return}
  e.st-=dt;e.setVelocityX((e.home.x-e.x)*3);
  if(e.state==='wait'){e.setVelocityY((e.home.y+Math.sin(scene.time.now/400)*2-e.y)*3);
    if(!p.dead&&Math.abs(p.x-e.x)<26&&p.y>e.y&&p.y-e.y<150){e.state='drop';e.st=0.9;e.setVelocityY(230)}}
  else if(e.state==='drop'){if(e.body.blocked.down||e.y>p.y+6||e.st<=0){e.state='hang';e.st=0.8;e.setVelocityY(0)}else e.setVelocityY(230)}
  else if(e.state==='hang'){e.setVelocityY(Math.sin(scene.time.now/90)*20);if(e.st<=0)e.state='up'}
  else{e.setVelocityY(-60);if(e.y<=e.home.y)e.state='wait'}
}
/* 떠도는 유령: 벽을 뚫고 천천히 다가옴. 가끔 스르르 사라졌다가 주인공 등 뒤에 나타남 (사라진 동안은 못 때림) */
function updateGhost(scene,e,dt){
  const p=scene.player,dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;e.t0+=dt;
  if(e.state==='gone'){e.st-=dt;if(e.st<=0&&!p.dead){const side=scene.facing||1,nx=Phaser.Math.Clamp(p.x-side*34,12,scene.lw-12);
      e.body.enable=true;e.body.reset(nx,p.y-6);e.state='float';e.cool=3+Math.random()*2;scene.tweens.add({targets:e,alpha:0.85,duration:300})}return}
  if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.9,e.body.velocity.y*0.9);return}
  if(e.state==='fade'){e.st-=dt;e.setVelocity(0,0);e.setAlpha(Math.max(0.05,e.st/0.6*0.85));if(e.st<=0){e.body.enable=false;e.state='gone';e.st=1.1}return}
  const near=d<150&&!p.dead;
  if(near)e.setVelocity(dx/d*28,dy/d*28+Math.sin(e.t0*2)*8);else e.setVelocity((e.home.x-e.x)*0.8,(e.home.y-e.y)*0.8+Math.sin(e.t0*2)*8);
  e.setFlipX(dx<0);if(e.alpha>0.86)e.setAlpha(0.85);
  if(near){e.cool-=dt;if(e.cool<=0){e.state='fade';e.st=0.6}}
}
/* 눈사람: 제자리에서 주인공 쪽을 보며 눈덩이를 포물선으로 던짐 (가까우면 두 개) */
function updateSnowman(scene,e,dt){
  const p=scene.player;if(e.stun>0){e.stun-=dt;return}if(!onGround(e))return;
  e.setVelocityX(0);const dx=p.x-e.x;e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);e.cool-=dt;
  if(e.cool<=0&&!p.dead&&Math.abs(dx)<180&&Math.abs(p.y-e.y)<90){e.cool=2.4+Math.random()*0.6;
    const n=Math.abs(dx)<70?2:1;for(let i=0;i<n;i++){const tt=0.75+i*0.2,vx=Phaser.Math.Clamp(dx/tt,-180,180),vy=(p.y-e.y+8-0.5*360*tt*tt)/tt;
      const s=scene.add.image(e.x,e.y-8,'snowball').setDepth(12);scene.eshots.push({s,vx,vy,g:360,life:2.5,dmg:e.dmg,spin:true})}}
  else if(e.cool<=0)e.cool=0.5;
}
/* 폭탄 바위: 주인공을 보면 뒤뚱뒤뚱 쫓아오고, 가까워지면 깜빡이다 펑 (자기도 부서짐). 멀리서 때려 부수면 안전 */
function updateBomber(scene,e,dt){
  const p=scene.player;
  if(e.state==='fuse'){e.st-=dt;e.setVelocityX(0);e.setTintFill(Math.floor(e.st*12)%2?0xffffff:0xff5a1a);
    if(e.st<=0){const x=e.x,y=e.y,d=e.def;scene.fireEm.explode(30,x,y);scene.dustEm.explode(10,x,y+4);scene.shake(140,0.012);
      const ring=scene.add.circle(x,y,6).setStrokeStyle(2,0xffa040,1).setDepth(12);scene.tweens.add({targets:ring,scale:6,alpha:0,duration:260,onComplete:()=>ring.destroy()});
      if(!p.dead&&Math.hypot(p.x-x,p.y-y)<36)scene.hurtBy(Math.round(e.dmg*1.8),x,'enemy');
      e.destroy();scene.time.delayedCall(RESPAWN_MS,()=>{if(!scene.leaving)spawnMob(scene,d)})}return}
  if(e.stun>0){e.stun-=dt;return}if(!onGround(e))return;
  const dx=p.x-e.x,see=!p.dead&&Math.abs(dx)<130&&Math.abs(p.y-e.y)<40;
  if(see&&Math.abs(dx)<24){e.state='fuse';e.st=0.8;e.anims.stop();return}
  if(see)e.dir=Math.sign(dx)||1;
  const a=scene.tileAt(e.x+e.dir*10,e.body.bottom+4),floor='#-=HV'.includes(a)&&a!=='.';
  if((e.dir<0&&e.body.blocked.left)||(e.dir>0&&e.body.blocked.right)||!floor||'^LS'.includes(scene.tileAt(e.x+e.dir*10,e.body.bottom-2))){if(see){e.setVelocityX(0);return}e.dir*=-1}
  e.setVelocityX(e.dir*(see?48:18));e.setFlipX(e.dir<0);
}
const FLOOR=c=>c==='#'||c==='-'||c==='=';
/* 뿔 토끼: 주인공을 보면 깡충깡충 뛰어서 덤빔 (착지할 곳이 없거나 함정이면 돌아섬) */
function updateHare(scene,e,dt){
  const p=scene.player;if(e.anims.isPlaying)e.anims.stop();
  const g=onGround(e);e.setTexture(g?'hare0':'hare1');
  if(e.stun>0){e.stun-=dt;return}if(!g)return;
  e.setVelocityX(0);e.cool-=dt;
  const dx=p.x-e.x,see=!p.dead&&Math.abs(dx)<140&&Math.abs(p.y-e.y)<60;
  if(see)e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(e.cool>0)return;
  const lx=e.x+e.dir*(see?40:24),land=scene.tileAt(lx,e.body.bottom+4);
  if(!FLOOR(land)||'^LS'.includes(scene.tileAt(lx,e.body.bottom-2))||(e.dir<0?e.body.blocked.left:e.body.blocked.right)){e.dir*=-1;e.cool=0.5;return}
  e.setVelocity(e.dir*(see?100:55),see?-230:-150);e.cool=see?0.8+Math.random()*0.4:1.3+Math.random();
}
/* 꿀벌: 붕붕 맴돌다 주인공을 보면 부르르 떨며 겨눈 뒤 그 방향으로 빠르게 일직선 돌격 */
function updateBee(scene,e,dt){
  const p=scene.player;e.t0+=dt;
  if(e.stun>0){e.stun-=dt;e.clearTint();e.setVelocity(e.body.velocity.x*0.9,e.body.velocity.y*0.9);if(e.stun<=0)e.state='back';return}
  const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
  if(e.state==='aim'){e.st-=dt;e.setVelocity(Math.sin(e.t0*70)*50,0);if(e.st<=0){e.clearTint();e.state='sting';e.st=0.55;e.setVelocity(e.aim.x*240,e.aim.y*240)}return}
  if(e.state==='sting'){e.st-=dt;const b=e.body.blocked;if(e.st<=0||b.left||b.right||b.up||b.down){e.state='back';e.cool=1.4+Math.random()}return}
  if(e.state==='back'){const hx=e.home.x-e.x,hy=e.home.y-e.y,hd=Math.hypot(hx,hy);if(hd<6)e.state='hover';else e.setVelocity(hx/hd*70,hy/hd*70);e.setFlipX(hx<0);return}
  e.setVelocity((e.home.x+Math.sin(e.t0*2.2)*16-e.x)*3,(e.home.y+Math.sin(e.t0*4.4)*6-e.y)*3);e.setFlipX(dx<0);e.cool-=dt;
  if(d<120&&e.cool<=0&&!p.dead){e.state='aim';e.st=0.45;e.aim={x:dx/d,y:dy/d};e.setFlipX(dx<0);e.setTint(0xff8a3a)}
}
/* 모래 지렁이: 땅속에서 모래 먼지만 보이며 주인공 발밑까지 따라옴 → 땅이 흔들린 뒤 솟아오름 → 잠깐 나와 있다가(이때만 때릴 수 있음) 다시 숨음 */
function updateWorm(scene,e,dt){
  const p=scene.player,dx=p.x-e.x,gy=e.home.y+5;e.st-=dt;
  if(e.state==='under'){e.cool-=dt;
    if(p.dead||Math.abs(dx)>170||Math.abs(p.y-e.y)>60)return;
    const nx=e.x+Math.sign(dx)*Math.min(Math.abs(dx),50*dt);
    if(FLOOR(scene.tileAt(nx,gy+4))&&scene.tileAt(nx,e.y)==='.'&&Math.abs(nx-e.home.x)<140)e.x=nx;
    if(Math.random()<dt*14)scene.dustEm.explode(2,e.x,gy);
    if(e.cool<=0&&Math.abs(p.x-e.x)<10){e.state='rumble';e.st=0.5}return}
  if(e.state==='rumble'){if(Math.random()<dt*40)scene.dustEm.explode(3,e.x+Phaser.Math.Between(-6,6),gy);
    if(e.st<=0){e.state='out';e.st=1.4;e.body.enable=true;e.body.reset(e.x,e.y);e.setAlpha(1);e.play('worm_anim');scene.dustEm.explode(14,e.x,gy);scene.shake(80,0.006);
      const b=p.body;if(!p.dead&&b.right>e.x-10&&b.left<e.x+10&&b.bottom>gy-26&&b.top<gy)scene.hurtBy(Math.round(e.dmg*1.3),e.x,'enemy')}return}
  e.setVelocity(0,0);if(e.stun>0)e.stun-=dt;e.setFlipX(dx<0);
  if(e.state==='out'&&e.st<=0){e.state='dig';e.st=0.35;scene.tweens.add({targets:e,alpha:0,duration:330})}
  if(e.state==='dig'&&e.st<=0){e.state='under';e.body.enable=false;e.anims.stop();e.setTexture('worm1');e.cool=1.6+Math.random();scene.dustEm.explode(8,e.x,gy)}
}
/* 번개 정령: 제자리 근처를 떠다니다 주인공을 향해 번개 구슬을 쏨 */
function updateWisp(scene,e,dt){
  const p=scene.player;e.t0+=dt;
  if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.85,e.body.velocity.y*0.85);return}
  const tx=e.home.x+Math.sin(e.t0*0.9)*22,ty=e.home.y+Math.sin(e.t0*1.7)*10;e.setVelocity((tx-e.x)*2,(ty-e.y)*2);
  e.cool-=dt;const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
  if(e.cool<=0.5&&e.cool+dt>0.5)e.setTint(0xffffff);   // 쏘기 전 번쩍
  if(e.cool<=0&&d<170&&!p.dead){e.cool=2.4+Math.random()*0.8;e.clearTint();
    const s=scene.add.image(e.x,e.y,'bolt').setDepth(12);scene.eshots.push({s,vx:dx/d*125,vy:dy/d*125,g:0,life:2.4,dmg:e.dmg,spin:true})}
  else if(e.cool<=0)e.cool=0.6;
}
/* 해골 마법사: 천천히 걷다가 멈춰서 주인공을 따라가는 어둠 구슬을 쏨 */
function updateSkull(scene,e,dt){
  const p=scene.player;if(e.stun>0){e.stun-=dt;return}if(!onGround(e))return;
  e.cool-=dt;e.st-=dt;const dx=p.x-e.x;
  if(e.state==='cast'){e.setVelocityX(0);if(e.st<=0){e.state='walk';e.clearTint();e.play('skull_idle');
      for(let i=0;i<2;i++){const s=scene.add.image(e.x+e.dir*8,e.y-8-i*8,'darkorb').setDepth(12);scene.eshots.push({s,vx:e.dir*(50+i*20),vy:-30-i*20,g:0,life:3.2,dmg:e.dmg,spin:true,home:180})}}return}
  if(!p.dead&&e.cool<=0&&Math.abs(dx)<160&&Math.abs(p.y-e.y)<60){e.cool=2.8;e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);e.state='cast';e.st=0.5;e.anims.stop();e.setTexture('kn_skull_wind');e.setTint(0xd8a0ff);return}
  const a=scene.tileAt(e.x+e.dir*10,e.body.bottom+4),floor='#-=HV'.includes(a)&&a!=='.';
  if((e.dir<0&&e.body.blocked.left)||(e.dir>0&&e.body.blocked.right)||!floor||'^LS'.includes(scene.tileAt(e.x+e.dir*10,e.body.bottom-2)))e.dir*=-1;
  e.setVelocityX(e.dir*20);e.setFlipX(e.dir<0);if(e.anims.currentAnim?.key!=='skull_run')e.play('skull_run');
}
/* 폭풍 그리폰: 위쪽을 빙빙 돌다 급강하 / 깃털 날리기 / 날갯짓 돌풍(주인공을 옆으로 밈)
   분노하면 급강하가 연속이 되고, 하늘에서 번개가 내리꽂힘 */
function updateGriffin(scene,e,dt){
  const p=scene.player,rage=e.hp<e.maxHp/2;e.t0+=dt;
  if(e.state==='intro'){e.st-=dt;e.setVelocity(0,-10);if(e.st<=0){e.state='hover';e.cool=1.6;e.n=0}return}
  if(e.stun>0&&e.state==='hover'){e.stun-=dt;return}
  const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
  if(e.state==='hover'){
    const cx=scene.lw/2+Math.sin(e.t0*0.8)*(scene.lw/2-50),cy=hoverY(scene)+6+Math.sin(e.t0*2.2)*8;
    e.setVelocity((cx-e.x)*1.8,(cy-e.y)*2);e.cool-=dt;
    if(e.cool<=0&&!p.dead){e.n++;const k=e.n%3;
      if(k===1){e.state='dive';e.diveT=1.1;e.chain=rage?3:1;e.setTint(0xfff07a);e.setVelocity(dx/d*(rage?210:180),dy/d*(rage?210:180))}
      else if(k===2){e.state='feather';e.st=0.5;e.setVelocity(0,0);e.setTint(0xcfe8ff)}
      else{e.state='gust';e.st=0.6;e.setVelocity(0,0)}}
  }else if(e.state==='dive'){
    e.diveT-=dt;const b=e.body.blocked;
    if(e.diveT<=0||b.down||b.left||b.right){e.chain--;if(b.down){scene.shake(90,0.008);scene.dustEm.explode(10,e.x,e.body.bottom)}
      if(e.chain>0&&!p.dead){e.diveT=0.9;e.setVelocity(dx/d*210,dy/d*210)}else{e.state='rise';e.clearTint()}}
  }else if(e.state==='feather'){e.st-=dt;
    if(e.st<=0){e.clearTint();const n=rage?7:5,a0=Math.atan2(dy,dx);
      for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.22,s=scene.add.image(e.x,e.y,'feather').setDepth(12);scene.eshots.push({s,vx:Math.cos(a)*150,vy:Math.sin(a)*150,g:0,life:2.6,dmg:16})}
      if(rage)for(let i=0;i<n-1;i++){const a=a0+(i-(n-2)/2)*0.22,s=scene.add.image(e.x,e.y,'feather').setDepth(12);scene.eshots.push({s,vx:Math.cos(a)*150,vy:Math.sin(a)*150,g:0,life:2.6,dmg:16,delay:0.35})}
      e.state='hover';e.cool=rage?1.1:1.7}
  }else if(e.state==='gust'){e.st-=dt;
    if(e.st<=0){const dir=Math.sign(p.x-e.x)||1;scene.gust(dir,rage?140:110,1.4);scene.toast('그리폰의 날갯짓에 몸이 밀린다!',1200);
      // 분노: 주인공 주변에 번개 4줄기 (내려오기 전 잠깐 깜빡임)
      if(rage){const cam=scene.cameras.main.worldView;for(let i=0;i<4;i++){const x=Phaser.Math.Clamp(p.x+(i-1.5)*36,20,scene.lw-20),s=scene.add.image(x,cam.y+4,'bolt').setDepth(12).setScale(2);
        scene.eshots.push({s,vx:0,vy:0,g:900,life:3,dmg:20,delay:0.4+i*0.12})}scene.shake(120,0.008)}
      e.state='hover';e.cool=rage?1:1.6}
  }else{
    e.setVelocity((e.x<scene.lw/2?24:-24),-130);
    if(e.y<hoverY(scene)+12){e.state='hover';e.cool=rage?1:1.6}
  }
  e.setFlipX(p.x<e.x);
}
/* 마왕: 걷기 → 큰 베기(예고 후 돌진) / 어둠 구슬 부채꼴 / 순간이동해서 등 뒤에 나타남
   2페이즈(체력 절반 이하): 붉게 변하며 빨라지고, 그림자 기사를 부르고, 하늘에서 어둠 구슬이 쏟아짐 */
function updateDemon(scene,e,dt){
  const p=scene.player,rage=e.hp<e.maxHp/2,k='kn_demon_';
  if(e.state==='intro'){e.st-=dt;e.setVelocityX(0);if(e.st<=0){e.state='walk';e.st=1}return}
  if(rage&&!e.phase2){e.phase2=true;e.baseTint=0xff8a8a;e.setTint(e.baseTint);scene.banner('PHASE 2',0xff4a5a);scene.toast('마왕이 진짜 힘을 드러냈다!',2000);scene.shake(300,0.016);
    for(const s of [-1,1]){const m=spawnMob(scene,{t:'shade',tx:Phaser.Math.Clamp(e.x/T+s*5,2,scene.cols-3),ty:9,summon:true});if(m)scene.batEm.explode(8,m.x,m.y)}}
  const last=e.hp<e.maxHp/4;
  if(last&&!e.phase3){e.phase3=true;e.baseTint=0xff5a7a;e.setTint(e.baseTint);scene.banner('PHASE 3',0xff2a4a);scene.toast('마왕이 마지막 힘을 쥐어짠다!',2000);scene.shake(300,0.018)}
  if(e.stun>0&&e.state!=='warp'){e.stun-=dt;return}
  if(last)dt*=1.15;
  e.st-=dt;const dx=p.x-e.x;
  if(e.state==='wind'){e.setVelocityX(0);if(e.st<=0){e.state='atk';e.st=0.3;e.setTexture(k+'atk');e.setVelocityX(e.dir*(rage?280:230));scene.shake(90,0.007)}return}
  if(e.state==='atk'){swing(scene,e,46,36,e.dmg+8);if(e.st<=0){
      if(rage&&!e.combo){e.combo=true;e.dir=Math.sign(p.x-e.x)||1;e.setFlipX(e.dir<0);e.state='wind';e.st=0.2;e.setTexture(k+'wind');return}
      e.combo=false;e.state='rest';e.st=rage?0.4:0.7;e.setVelocityX(0);e.play('demon_idle')}return}
  if(e.state==='orbs'){e.setVelocityX(0);if(e.st<=0){const n=rage?7:5,a0=Math.atan2(p.y-e.y,dx);
      for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.3,s=scene.add.image(e.x,e.y-10,'darkorb').setDepth(12).setScale(1.4);scene.eshots.push({s,vx:Math.cos(a)*120,vy:Math.sin(a)*120,g:0,life:3,dmg:20,spin:true})}
      if(rage){const cam=scene.cameras.main.worldView;for(let i=0;i<5;i++){const x=Phaser.Math.Clamp(p.x+(i-2)*32,20,scene.lw-20),s=scene.add.image(x,cam.y+4,'darkorb').setDepth(12);
        scene.eshots.push({s,vx:0,vy:0,g:520,life:3,dmg:18,delay:0.5+i*0.12})}}
      if(last)for(let i=0;i<12;i++){const a=i/12*Math.PI*2,s=scene.add.image(e.x,e.y-10,'darkorb').setDepth(12);scene.eshots.push({s,vx:Math.cos(a)*85,vy:Math.sin(a)*85,g:0,life:3.4,dmg:16,spin:true,delay:0.4})}
      e.clearTint();if(e.baseTint)e.setTint(e.baseTint);e.state='rest';e.st=0.8}return}
  if(e.state==='warp'){e.setVelocityX(0);e.setAlpha(Math.max(0.05,e.st/0.5));
    if(e.st<=0){const side=scene.facing||1,nx=Phaser.Math.Clamp(p.x-side*40,24,scene.lw-24);
      e.body.reset(nx,e.y);e.setAlpha(1);e.body.enable=true;scene.batEm.explode(16,e.x,e.y);e.dir=Math.sign(p.x-e.x)||1;e.setFlipX(e.dir<0);
      e.state='wind';e.st=rage?0.3:0.45;e.anims.stop();e.setTexture(k+'wind')}return}
  if(e.state==='rest'){e.setVelocityX(e.body.velocity.x*0.85);if(e.st<=0)e.state='walk';return}
  if(!onGround(e)||p.dead){e.setVelocityX(0);return}
  e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(e.st<=0){e.n++;const c=e.n%3;
    if(c===1&&Math.abs(dx)<70){e.state='wind';e.st=rage?0.4:0.6;e.anims.stop();e.setTexture(k+'wind');e.setVelocityX(0);return}
    if(c===2){e.state='orbs';e.st=0.55;e.setTint(0xd8a0ff);e.anims.stop();e.setTexture(k+'wind');return}
    e.state='warp';e.st=0.5;e.body.enable=false;scene.batEm.explode(16,e.x,e.y);return}
  e.setVelocityX(e.dir*(rage?62:44));
  if(e.anims.currentAnim?.key!=='demon_run')e.play('demon_run');
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
  if(e.state==='atk'){swing(scene,e,44,34,e.dmg+6);if(e.st<=0){
      // 분노: 한 번 더 이어서 벰
      if(rage&&!e.combo){e.combo=true;e.dir=Math.sign(p.x-e.x)||1;e.setFlipX(e.dir<0);e.state='wind';e.st=0.22;e.setTexture(k+'wind');return}
      e.combo=false;e.state='rest';e.st=rage?0.4:0.7;e.setVelocityX(0);e.play('rust_idle')}return}
  if(e.state==='jump'){
    if(e.st<-2){e.state='rest';e.st=0.5;return}
    if(onGround(e)&&e.st<0.6){e.state='rest';e.st=rage?0.5:0.9;e.setVelocityX(0);e.play('rust_idle');
      scene.shake(160,0.012);scene.dustEm.explode(14,e.x,e.body.bottom);
      [-1,1].forEach(d=>quake(scene,e.x+d*14,e.body.bottom,d,e.dmg));if(rage)scene.time.delayedCall(260,()=>{if(e.active)[-1,1].forEach(d=>quake(scene,e.x+d*14,e.body.bottom,d,e.dmg))})}
    return}
  if(e.state==='cwind'){e.setVelocityX(0);e.setTint(Math.floor(e.st*14)%2?0xffffff:0xff5a3a);if(e.st<=0){e.clearTint();e.state='charge';e.st=1.4;e.setTexture(k+'atk');scene.toast('수문장이 돌진한다!',900)}return}
  if(e.state==='charge'){e.setVelocityX(e.dir*300);swing(scene,e,30,30,e.dmg+4);
    if(Math.random()<0.5){const gh=scene.add.image(e.x,e.y,e.texture.key).setFlipX(e.flipX).setScale(e.scaleX).setDepth(5).setTint(0xff8a5a).setAlpha(0.5);scene.tweens.add({targets:gh,alpha:0,duration:200,onComplete:()=>gh.destroy()})}
    if(e.body.blocked.left||e.body.blocked.right||e.st<=0){if(e.body.blocked.left||e.body.blocked.right){scene.shake(200,0.014);[-1,1].forEach(d=>quake(scene,e.x+d*14,e.body.bottom,d,e.dmg))}
      e.state='rest';e.st=1;e.setVelocityX(0);e.play('rust_idle')}return}
  if(e.state==='rest'){e.setVelocityX(e.body.velocity.x*0.85);if(e.st<=0)e.state='walk';return}
  if(!onGround(e)||p.dead){e.setVelocityX(0);return}
  e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(rage&&e.st<=0&&e.n%4===3&&Math.abs(dx)>50){e.n++;e.state='cwind';e.st=0.6;e.anims.stop();e.setTexture(k+'wind');e.setVelocityX(0);return}
  if(e.st<=0&&(Math.abs(dx)<60||e.n%3===2)){
    e.n++;
    if(e.n%3===0){e.state='jump';e.st=1.2;e.anims.stop();e.setTexture(k+'wind');e.setVelocity(Math.max(-150,Math.min(150,dx*1.3)),-380);return}
    e.state='wind';e.st=rage?0.4:0.6;e.anims.stop();e.setTexture(k+'wind');e.setVelocityX(0);return}
  if(e.st<=0&&Math.abs(dx)>=60&&Math.random()<dt*0.6){e.n=2;e.st=0}
  e.setVelocityX(e.dir*(rage?72:52));
  if(e.anims.currentAnim?.key!=='rust_run')e.play('rust_run');
}
/* 중간보스 공통: 등장 대기 → (예고 후) 앞으로 베기. 패턴은 o.pick이 고름 */
function midSlash(scene,e,dt,k,o){
  const p=scene.player,rage=e.hp<e.maxHp/2;
  if(e.state==='intro'){e.st-=dt;e.setVelocityX(0);if(e.st<=0){e.state='walk';e.st=0.6}return true}
  if(e.stun>0){e.stun-=dt;return true}
  e.st-=dt;
  if(e.state==='wind'){e.setVelocityX(0);if(e.st<=0){e.state='atk';e.st=0.28;e.setTexture(k+'atk');e.setVelocityX(e.dir*(rage?250:210));scene.shake(80,0.006)}return true}
  if(e.state==='atk'){swing(scene,e,42,32,e.dmg+6);if(e.st<=0){e.state='rest';e.st=rage?0.45:0.75;e.setVelocityX(0);e.play(e.mob+'_idle')}return true}
  if(e.state==='rest'){e.setVelocityX(e.body.velocity.x*0.85);if(e.st<=0)e.state='walk';return true}
  if(e.state==='jump'){
    if(e.st<-2){e.state='rest';e.st=0.5;return true}
    if(onGround(e)&&e.st<0.6){e.state='rest';e.st=rage?0.5:0.9;e.setVelocityX(0);e.play(e.mob+'_idle');scene.shake(160,0.012);scene.dustEm.explode(14,e.x,e.body.bottom);
      [-1,1].forEach(d=>quake(scene,e.x+d*14,e.body.bottom,d,e.dmg));if(o.onLand)o.onLand(rage)}
    return true}
  return false;
}
const wstart=(e,k,st)=>{e.st=st;e.anims.stop();e.setTexture(k+'wind');e.setVelocityX(0)};
/* 바람 기사: 걸어와 베기 / 3번째마다 돌풍(밀어내며 깃털 칼날 부채꼴) / 분노하면 높이 뛰어 깃털 비 */
function updateWindKnight(scene,e,dt){
  const p=scene.player,k='kn_windk_',rage=e.hp<e.maxHp/2,dx=p.x-e.x;
  if(midSlash(scene,e,dt,k,{onLand:r=>{for(let i=0;i<(r?7:5);i++){const s=shot(scene,'feather',e.x+(i-(r?3:2))*34,-8,{vx:0,vy:0,g:520,life:3,dmg:e.dmg-6,delay:0.3+i*0.1})}}}))return;
  if(e.state==='gwind'){e.setVelocityX(0);e.setTint(Math.floor(e.st*14)%2?0xffffff:0x8fe3ff);if(e.st<=0){e.clearTint();
      scene.gust(e.dir,rage?170:130,0.9);scene.toast('바람 기사가 돌풍을 일으켰다!',900);
      const n=rage?7:5,a0=Math.atan2(p.y-e.y,dx);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.2;shot(scene,'feather',e.x,e.y-6,{vx:Math.cos(a)*170,vy:Math.sin(a)*170,life:2.4,dmg:e.dmg-8})}
      e.state='rest';e.st=0.9;e.play('windk_idle')}return}
  if(!onGround(e)||p.dead){e.setVelocityX(0);return}
  e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(e.st<=0&&(Math.abs(dx)<60||e.n%3===2)){e.n++;
    if(e.n%3===0){if(rage){e.state='jump';wstart(e,k,1.2);e.setVelocity(Phaser.Math.Clamp(dx*1.3,-150,150),-420)}else{e.state='gwind';wstart(e,k,0.7)}return}
    e.state='wind';wstart(e,k,rage?0.38:0.55);return}
  if(e.st<=0&&Math.abs(dx)>=60&&Math.random()<dt*0.7){e.n=2;e.st=0}
  e.setVelocityX(e.dir*(rage?70:50));if(e.anims.currentAnim?.key!=='windk_run')e.play('windk_run');
}
/* 근위대장: 방패를 앞세우고 다가옴(앞에서 맞으면 GUARD). 막은 직후 곧바로 반격 베기 / 3번째마다 뛰어 내려찍기 / 분노하면 어둠 구슬 */
function updateCaptain(scene,e,dt){
  const p=scene.player,k='kn_gcapt_',rage=e.hp<e.maxHp/2,dx=p.x-e.x;
  if(e.lastHp==null)e.lastHp=e.hp;const hit=e.hp<e.lastHp;e.lastHp=e.hp;
  if(midSlash(scene,e,dt,k,{onLand:r=>{if(r)for(let i=0;i<3;i++)shot(scene,'darkorb',e.x,e.y-10,{vx:(i-1)*90,vy:-140,g:200,life:3,dmg:e.dmg-8,spin:true})}}))return;
  if(!onGround(e)||p.dead){e.setVelocityX(0);return}
  e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  // 막았으면(정면에서 맞음) 짧은 예고 뒤 반격
  if(hit&&e.state==='walk'&&Math.abs(dx)<70){e.state='wind';wstart(e,k,rage?0.16:0.24);e.setTint(0xffffff);scene.time.delayedCall(80,()=>{if(e.active){e.clearTint();e.setTint(e.baseTint)}});return}
  if(e.st<=0&&(Math.abs(dx)<56||e.n%3===2)){e.n++;
    if(e.n%3===0){e.state='jump';wstart(e,k,1.2);e.setVelocity(Phaser.Math.Clamp(dx*1.3,-160,160),-400);return}
    e.state='wind';wstart(e,k,rage?0.4:0.6);return}
  if(e.st<=0&&Math.abs(dx)>=56&&Math.random()<dt*0.5){e.n=2;e.st=0}
  e.setVelocityX(e.dir*(rage?56:38));if(e.anims.currentAnim?.key!=='gcapt_run')e.play('gcapt_run');
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
    e.setVelocity((cx-e.x)*1.6,(cy-e.y)*2);e.cool-=dt;e.st-=dt;e.son=(e.son==null?2:e.son)-dt;
    // 초음파: 주인공 쪽으로 퍼지는 고리 3~5발
    if(e.son<=0&&!p.dead){e.son=rage?2.2:3.2;const a0=Math.atan2(p.y-e.y,p.x-e.x),n=rage?5:3;
      for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.28,s=scene.add.image(e.x,e.y+6,'sonic').setDepth(12);scene.eshots.push({s,vx:Math.cos(a)*120,vy:Math.sin(a)*120,g:0,life:3,dmg:12,spin:true})}}
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

/* 가시 물고기: 물속에서만 좌우로 헤엄치다, 주인공이 물에 들어오면 돌진 */
function updateFish(scene,e,dt){
  const p=scene.player;e.t0+=dt;
  if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.9,e.body.velocity.y*0.9);return}
  const inW=(x,y)=>scene.tileAt(x,y)==='~';
  if(e.state==='dive'){e.diveT-=dt;if(e.diveT<=0||!inW(e.x+Math.sign(e.body.velocity.x)*8,e.y)||!inW(e.x,e.y+Math.sign(e.body.velocity.y)*6)){e.state='hover';e.cool=1.2}}
  else{
    if(!inW(e.x+e.dir*10,e.y))e.dir*=-1;
    e.setVelocity(e.dir*28,(e.home.y+Math.sin(e.t0*2)*6-e.y)*2);e.cool-=dt;
    const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
    if(scene.inWater&&d<110&&e.cool<=0&&!p.dead){e.state='dive';e.diveT=0.8;e.setVelocity(dx/d*110,dy/d*110);e.dir=Math.sign(dx)||1}
  }
  if(!inW(e.x,e.y-4)&&e.body.velocity.y<0)e.setVelocityY(30);
  e.setFlipX(e.body.velocity.x<0);
}

/* 서리 거북: 걷기 → 등껍질 회전 돌진(벽에 두 번 튕김) / 얼음 조각 3발 / (분노) 천장에서 고드름 */
function updateTurtle(scene,e,dt){
  const p=scene.player,rage=e.hp<e.maxHp/2;
  if(e.state==='intro'){e.st-=dt;e.setVelocityX(0);if(e.st<=0){e.state='walk';e.st=1}return}
  if(e.stun>0&&e.state!=='spin'){e.stun-=dt;return}
  e.st-=dt;const dx=p.x-e.x;
  if(e.state==='wind'){e.setVelocityX(0);e.setTint(Math.floor(e.st*12)%2?0xffffff:0x9fd8ff);
    if(e.st<=0){e.clearTint();e.state='spin';e.bounces=rage?4:3;e.setTexture('turtle_spin');e.anims.stop();e.setVelocityX(e.dir*(rage?270:230));e.st=6}return}
  if(e.state==='spin'){e.angle+=e.body.velocity.x*dt*4;
    const b=e.body.blocked;if((b.left&&e.body.velocity.x<=0)||(b.right&&e.body.velocity.x>=0)||(b.left||b.right)){e.bounces--;e.dir*=-1;e.setVelocityX(e.dir*(rage?240:205));scene.shake(90,0.008);scene.sparkEm.explode(8,e.x+(b.left?-20:20),e.y);
      {const cam=scene.cameras.main.worldView,n=rage?3:2;for(let i=0;i<n;i++){const x=Phaser.Math.Clamp(p.x+(i-(n-1)/2)*30,20,scene.lw-20),ic=scene.add.image(x,cam.y+4,'icicle').setDepth(12);scene.eshots.push({s:ic,vx:0,vy:0,g:460,life:3,dmg:14,delay:0.3+i*0.1})}}}
    else if(Math.abs(e.body.velocity.x)<50)e.setVelocityX(e.dir*(rage?240:205));
    if(e.bounces<0||e.st<=0){e.state='rest';e.st=rage?0.7:1.1;e.angle=0;e.setVelocityX(0);e.play('turtle_anim')}return}
  if(e.state==='spit'){e.setVelocityX(0);if(e.st<=0){
      const n=rage?7:5;for(let i=0;i<n;i++){const s=scene.add.image(e.x+e.dir*20,e.y-8,'iceshard').setDepth(12);
        scene.eshots.push({s,vx:e.dir*(60+i*45)+(dx*0.2),vy:-260-i*15,g:620,life:3,dmg:12})}
      scene.sparkEm.explode(8,e.x+e.dir*20,e.y-8);e.state='rest';e.st=0.9}return}
  if(e.state==='rest'){e.setVelocityX(e.body.velocity.x*0.85);if(e.st<=0){e.state='walk';e.st=0.8}return}
  if(!onGround(e)||p.dead){e.setVelocityX(0);return}
  e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(e.st<=0){e.n++;
    if(e.n%3===1){e.state='wind';e.st=0.7;return}
    if(e.n%3===2){e.state='spit';e.st=0.45;e.setTint(0xcff4ff);scene.time.delayedCall(450,()=>e.active&&e.clearTint());return}
    if(rage){const cam=scene.cameras.main.worldView;for(let i=0;i<4;i++){const x=Phaser.Math.Clamp(p.x+(i-1.5)*34,24,scene.lw-24),s=scene.add.image(x,cam.y+4,'icicle').setDepth(12);
        scene.eshots.push({s,vx:0,vy:0,g:420+i*40,life:3,dmg:14,delay:0.35+i*0.15})}scene.shake(120,0.008)}
    e.st=1.2}
  e.setVelocityX(e.dir*26);
}
/* ── 2차 지역 몬스터 ── */
const shot=(scene,key,x,y,o)=>{const s=scene.add.image(x,y,key).setDepth(12);scene.eshots.push(Object.assign({s,g:0,life:2.4},o));return s};
/* 버섯 도깨비: 가만히 있다가 가까이 오면 주인공 쪽으로 튀어 오르며 포자를 흩뿌림 */
function updateShroom(scene,e,dt){
  const p=scene.player,g=onGround(e);e.setTexture(g?'shroom0':'shroom1');if(e.anims.isPlaying)e.anims.stop();
  if(e.stun>0){e.stun-=dt;return}if(!g)return;
  e.setVelocityX(0);e.cool-=dt;const dx=p.x-e.x;
  if(e.cool<=0&&!p.dead&&Math.abs(dx)<70&&Math.abs(p.y-e.y)<40){e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);e.cool=2.2+Math.random()*0.6;
    const lx=e.x+e.dir*30;if(FLOOR(scene.tileAt(lx,e.body.bottom+4))&&!'^LS'.includes(scene.tileAt(lx,e.body.bottom-2)))e.setVelocity(e.dir*70,-200);else e.setVelocity(0,-180);
    for(let i=0;i<4;i++)shot(scene,'spore',e.x,e.y-6,{vx:(i-1.5)*28+e.dir*10,vy:-70-Math.random()*50,g:70,life:2,dmg:Math.round(e.dmg*0.8),spin:true})}
}
/* 두더지: 땅속에 숨어 있다가 주인공이 가까우면 솟아올라 돌을 던지고 다시 숨음 (나와 있을 때만 맞음) */
function updateMole(scene,e,dt){
  const p=scene.player,dx=p.x-e.x;e.st-=dt;
  if(e.state==='under'){e.cool-=dt;if(Math.random()<dt*3)scene.dustEm.explode(1,e.x,e.home.y+6);
    if(e.cool<=0&&!p.dead&&Math.abs(dx)<150&&Math.abs(p.y-e.y)<80){e.state='up';e.st=1.5;e.thrown=false;e.body.enable=true;e.body.reset(e.x,e.home.y);e.setVelocity(0,0);e.alpha=1;e.setTexture('mole0');scene.dustEm.explode(8,e.x,e.home.y+6)}return}
  e.setVelocity(0,0);e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(e.stun>0){e.stun-=dt;return}
  if(!e.thrown&&e.st<1.1){e.thrown=true;e.setTexture('mole1');
    if(!p.dead){const tt=0.7,vx=Phaser.Math.Clamp(dx/tt,-170,170),vy=(p.y-e.y+6-0.5*360*tt*tt)/tt;shot(scene,'rock',e.x,e.y-6,{vx,vy,g:360,dmg:e.dmg,spin:true})}}
  if(e.st<=0){e.state='under';e.body.enable=false;e.alpha=0;e.cool=1.6+Math.random();scene.dustEm.explode(6,e.x,e.home.y+6)}
}
/* 얼음 정령: 둥실 떠다니다 냉기 조각을 쏨. 맞으면 잠깐 느려짐 */
function updateIceWisp(scene,e,dt){
  const p=scene.player;e.t0+=dt;
  if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.9,e.body.velocity.y*0.9);return}
  e.setVelocity((e.home.x+Math.sin(e.t0*1.1)*20-e.x)*2,(e.home.y+Math.sin(e.t0*2.3)*8-e.y)*2);
  const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;e.cool-=dt;e.setFlipX(dx<0);
  if(e.cool<=0&&!p.dead&&d<160){e.cool=2+Math.random()*0.8;e.setTintFill(0xffffff);scene.time.delayedCall(90,()=>e.active&&e.clearTint());
    shot(scene,'iceshard',e.x,e.y,{vx:dx/d*135,vy:dy/d*135,dmg:e.dmg,chill:true})}
}
/* 독수리: 높이 맴돌며 주인공 위로 따라오다가, 바로 위에 오면 수직으로 내리꽂고 다시 올라감 */
function updateVulture(scene,e,dt){
  const p=scene.player;if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.9,e.body.velocity.y*0.9);if(e.stun<=0)e.state='rise';return}
  const dx=p.x-e.x;e.cool-=dt;
  if(e.state==='dive'){e.st-=dt;e.setVelocity(0,280);if(e.body.blocked.down||e.y>p.y+12||e.st<=0){e.state='rise';e.cool=1.6}return}
  if(e.state==='rise'){e.setVelocity(0,-90);if(e.y<=e.home.y)e.state='hover';return}
  const near=!p.dead&&Math.abs(dx)<170&&p.y>e.y;
  const tx=near?Phaser.Math.Clamp(p.x,e.home.x-170,e.home.x+170):e.home.x+Math.sin(e.t0+=dt)*30;
  e.setVelocity(Phaser.Math.Clamp((tx-e.x)*2,-70,70),(e.home.y-e.y)*3);e.setFlipX(e.body.velocity.x<0);
  if(near&&Math.abs(dx)<12&&e.cool<=0){e.state='dive';e.st=1.2;e.setTint(0xffd0a0);scene.time.delayedCall(150,()=>e.active&&e.clearTint())}
}
/* 용암 슬라임: 순찰하다 주인공을 보면 쫓아옴. 지나간 자리에 잠깐 불길이 남음 */
function updateMagmaSlime(scene,e,dt){
  const p=scene.player;e.cool-=dt;
  if(e.cool<=0&&onGround(e)&&Math.abs(e.body.velocity.x)>5){e.cool=0.4;shot(scene,'flame',e.x-e.dir*6,e.body.bottom-7,{vx:0,vy:0,life:1.6,dmg:Math.round(e.dmg*0.7),still:true})}
  if(e.stun>0){e.stun-=dt;return}if(!onGround(e))return;
  const dx=p.x-e.x,see=!p.dead&&Math.abs(dx)<120&&Math.abs(p.y-e.y)<40;if(see)e.dir=Math.sign(dx)||1;
  const a=scene.tileAt(e.x+e.dir*10,e.body.bottom+4);
  if((e.dir<0&&e.body.blocked.left)||(e.dir>0&&e.body.blocked.right)||!FLOOR(a)||'^LS'.includes(scene.tileAt(e.x+e.dir*10,e.body.bottom-2))){if(see){e.setVelocityX(0);return}e.dir*=-1}
  e.setVelocityX(e.dir*(see?42:22));e.setFlipX(e.dir<0);
}
/* 천둥 구름: 제 높이에서 주인공 머리 위로 천천히 따라와 번쩍인 뒤 아래로 번개 */
function updateCloud(scene,e,dt){
  const p=scene.player;if(e.stun>0){e.stun-=dt;e.setVelocity(e.body.velocity.x*0.9,0);return}
  const dx=p.x-e.x,near=!p.dead&&Math.abs(dx)<200&&p.y>e.y;e.cool-=dt;
  if(e.state==='charge'){e.st-=dt;e.setVelocity(0,0);e.setTintFill(Math.floor(e.st*14)%2?0xffffff:0xffe060);
    if(e.st<=0){e.clearTint();e.state='hover';e.cool=2.2+Math.random()*0.6;shot(scene,'zap',e.x,e.y+10,{vx:0,vy:360,life:1.2,dmg:e.dmg+2});scene.shake(60,0.004)}return}
  const tx=near?Phaser.Math.Clamp(p.x,e.home.x-200,e.home.x+200):e.home.x;
  e.setVelocity(Phaser.Math.Clamp((tx-e.x)*1.5,-45,45),(e.home.y-e.y)*3);
  if(near&&Math.abs(dx)<14&&e.cool<=0){e.state='charge';e.st=0.6}
}
/* 미믹: 보물 상자인 척 자고 있다가 가까이 오거나 맞으면 깨서 깡충깡충 물러 옴 */
function updateMimic(scene,e,dt){
  const p=scene.player,g=onGround(e),dx=p.x-e.x;
  if(e.state==='sleep'){e.setVelocityX(0);if(e.stun>0||(!p.dead&&Math.abs(dx)<36&&Math.abs(p.y-e.y)<30)){e.state='awake';e.cool=0.35;e.setTexture('mimic1');scene.shake(80,0.006);e.y-=2}return}
  if(e.stun>0){e.stun-=dt;return}if(!g){e.setTexture('mimic1');return}
  e.setVelocityX(0);e.setTexture(Math.floor(scene.time.now/200)%2?'mimic1':'chest0');e.cool-=dt;
  if(e.cool>0||p.dead)return;e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  const lx=e.x+e.dir*36;
  if(!FLOOR(scene.tileAt(lx,e.body.bottom+4))||'^LS'.includes(scene.tileAt(lx,e.body.bottom-2))){e.cool=0.6;return}
  e.setVelocity(e.dir*110,-190);e.cool=0.7+Math.random()*0.3;
}

/* 보스 투사체 (얼음 조각, 떨어지는 고드름): 중력 영향, 벽·바닥에 닿으면 부서짐 */
export function updateEShots(scene,dt){
  const p=scene.player;
  scene.eshots=scene.eshots.filter(f=>{
    if(f.delay>0){f.delay-=dt;f.s.x+=Math.sin(f.delay*60);return true}
    f.life-=dt;if(f.home&&!p.dead){const dx=p.x-f.s.x,dy=p.y-f.s.y,d=Math.hypot(dx,dy)||1,k=Math.min(1,dt*1.6);f.vx+=(dx/d*f.home-f.vx)*k;f.vy+=(dy/d*f.home-f.vy)*k}
    f.vy+=f.g*dt;f.s.x+=f.vx*dt;f.s.y+=f.vy*dt;if(f.spin)f.s.rotation+=dt*6;else if(!f.still)f.s.rotation=Math.atan2(f.vy,f.vx)-Math.PI/2;
    if(f.still&&f.life<0.4)f.s.setAlpha(f.life/0.4);
    if(scene.tileAt(f.s.x,f.s.y+4)==='#')f.life=0;
    if(f.life>0&&!p.dead&&Math.abs(p.x-f.s.x)<7&&Math.abs(p.y-f.s.y)<11){f.life=0;scene.hurtBy(f.dmg,f.s.x,'enemy');if(f.chill)scene.chillT=1.6}
    if(f.life<=0){scene.sparkEm.explode(5,f.s.x,f.s.y);f.s.destroy();return false}return true});
}

/* 사막 전갈: 순찰하다 가까우면 꼬리 찌르기 */
function updateScorp(scene,e,dt){
  const p=scene.player;if(e.stun>0){e.stun-=dt;return}if(!onGround(e))return;e.st-=dt;
  if(e.state==='wind'){e.setVelocityX(0);e.setTint(Math.floor(e.st*20)%2?0xffffff:0xffb080);if(e.st<=0){e.clearTint();e.state='atk';e.st=0.18;e.setVelocityX(e.dir*120)}return}
  if(e.state==='atk'){swing(scene,e,16,10,e.dmg+3);if(e.st<=0){e.state='rest';e.st=0.6;e.setVelocityX(0)}return}
  if(e.state==='rest'){if(e.st<=0)e.state='walk';return}
  const dx=p.x-e.x;
  if(!p.dead&&Math.abs(dx)<40&&Math.abs(p.y-e.y)<16){e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);e.state='wind';e.st=0.32;return}
  const a=scene.tileAt(e.x+e.dir*10,e.body.bottom+4),floor='#-=HV'.includes(a)&&a!=='.';
  if((e.dir<0&&e.body.blocked.left)||(e.dir>0&&e.body.blocked.right)||!floor||'^LS'.includes(scene.tileAt(e.x+e.dir*10,e.body.bottom-2)))e.dir*=-1;
  e.setVelocityX(e.dir*42);e.setFlipX(e.dir<0);
}
/* 불도롱뇽: 기어 다니다 주인공이 같은 높이에 있으면 불덩이를 뱉음 */
function updateSala(scene,e,dt){
  const p=scene.player;if(e.stun>0){e.stun-=dt;return}if(!onGround(e))return;e.cool-=dt;
  const dx=p.x-e.x;
  if(!p.dead&&e.cool<=0&&Math.abs(dx)<150&&Math.abs(p.y-e.y)<20){e.cool=2.2;e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);e.setVelocityX(0);
    const s=scene.add.image(e.x+e.dir*10,e.y-1,'fireball').setDepth(12);scene.eshots.push({s,vx:e.dir*130,vy:0,g:0,life:2.5,dmg:e.dmg,spin:true});return}
  const a=scene.tileAt(e.x+e.dir*10,e.body.bottom+4),floor='#-=HV'.includes(a)&&a!=='.';
  if((e.dir<0&&e.body.blocked.left)||(e.dir>0&&e.body.blocked.right)||!floor||'^LS'.includes(scene.tileAt(e.x+e.dir*10,e.body.bottom-2)))e.dir*=-1;
  e.setVelocityX(e.dir*30);e.setFlipX(e.dir<0);
}
/* 전갈왕: 꼬리 찍기 / 모래 속으로 숨었다가 발밑에서 튀어나옴 / 모래덩이 뱉기. 분노하면 더 빠르고 연속 공격 */
function updateScorpKing(scene,e,dt){
  const p=scene.player,rage=e.hp<e.maxHp/2;
  if(rage&&!e.phase2){e.phase2=true;scene.toast('전갈왕이 부하를 불렀다!',1600);for(const sd of [-1,1]){const m=spawnMob(scene,{t:'scorp',tx:Phaser.Math.Clamp(e.x/T+sd*6,2,scene.cols-3),ty:9,summon:true});if(m)scene.dustEm.explode(10,m.x,m.y)}}
  if(e.state==='intro'){e.st-=dt;e.setVelocityX(0);if(e.st<=0){e.state='walk';e.st=1}return}
  if(e.stun>0&&e.state!=='burrow'){e.stun-=dt;return}
  e.st-=dt;const dx=p.x-e.x;
  if(e.state==='wind'){e.setVelocityX(0);e.setTint(Math.floor(e.st*16)%2?0xffffff:0xffd060);if(e.st<=0){e.clearTint();e.state='atk';e.st=0.25;e.setVelocityX(e.dir*(rage?260:220));scene.shake(70,0.005)}return}
  if(e.state==='atk'){swing(scene,e,48,26,e.dmg+6);if(e.st<=0){if(rage&&!e.combo){e.combo=true;e.dir=Math.sign(p.x-e.x)||1;e.setFlipX(e.dir<0);e.state='wind';e.st=0.25;return}e.combo=false;e.state='rest';e.st=rage?0.4:0.7;e.setVelocityX(0)}return}
  if(e.state==='burrow'){e.body.enable=false;e.setAlpha(0.15);e.x+=(p.x-e.x)*Math.min(1,dt*3);if(Math.random()<dt*25)scene.dustEm.explode(2,e.x,e.y+10);
    if(e.st<=0){e.body.enable=true;e.setAlpha(1);e.state='rest';e.st=0.6;e.setVelocity(0,-420);scene.shake(140,0.012);scene.dustEm.explode(16,e.x,e.y+10);
      if(Math.abs(p.x-e.x)<30&&Math.abs(p.y-e.y)<40)scene.hurtBy(e.dmg,e.x,'enemy');
      if(rage&&!e.again){e.again=true;e.state='burrow';e.st=0.9;e.body.enable=false;e.setAlpha(0.15)}else e.again=false;
      for(let i=0;i<(rage?6:4);i++){const s=scene.add.image(e.x,e.y-6,'sandball').setDepth(12);scene.eshots.push({s,vx:(i-((rage?6:4)-1)/2)*70,vy:-300,g:620,life:3,dmg:14})}}return}
  if(e.state==='spit'){e.setVelocityX(0);if(e.st<=0){for(let i=0;i<(rage?5:3);i++){const s=scene.add.image(e.x+e.dir*20,e.y-10,'sandball').setDepth(12);scene.eshots.push({s,vx:e.dir*(80+i*55),vy:-240-i*20,g:620,life:3,dmg:14})}e.state='rest';e.st=0.7}return}
  if(e.state==='rest'){e.setVelocityX(e.body.velocity.x*0.85);if(e.st<=0){e.state='walk';e.st=0.6}return}
  if(!onGround(e)||p.dead){e.setVelocityX(0);return}
  e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(e.st<=0){e.n++;const k=e.n%3;
    if(k===1&&Math.abs(dx)<90){e.state='wind';e.st=rage?0.35:0.5;return}
    if(k===2){e.state='burrow';e.st=rage?1.0:1.4;scene.dustEm.explode(14,e.x,e.y+10);return}
    e.state='spit';e.st=0.4;return}
  e.setVelocityX(e.dir*(rage?70:50));
}
/* 화염 골렘: 내려찍기(양쪽 충격파) / 마그마 던지기 / 분노하면 천장에서 불비 */
function updateGolem(scene,e,dt){
  const p=scene.player,rage=e.hp<e.maxHp/2;
  if(e.state==='intro'){e.st-=dt;e.setVelocityX(0);if(e.st<=0){e.state='walk';e.st=1}return}
  if(e.stun>0){e.stun-=dt;return}
  e.st-=dt;const dx=p.x-e.x;
  if(e.state==='wind'){e.setVelocityX(0);e.setTint(Math.floor(e.st*14)%2?0xffffff:0xff8a2a);if(e.st<=0){e.clearTint();e.state='rest';e.st=rage?0.6:0.9;
      scene.shake(180,0.014);scene.dustEm.explode(18,e.x,e.body.bottom);const n=rage?2:1;
      for(let k=0;k<n;k++)scene.time.delayedCall(k*280,()=>{if(e.active)[-1,1].forEach(d=>{const q=scene.add.image(e.x+d*20,e.body.bottom,'quake').setOrigin(0.5,1).setDepth(12).setFlipX(d<0).setTint(0xff8a2a);scene.quakes.push({s:q,vx:d*170,life:1.3,dmg:e.dmg-6,hit:false})})})}return}
  if(e.state==='throw'){e.setVelocityX(0);if(e.st<=0){const n=rage?5:3;for(let i=0;i<n;i++){const s=scene.add.image(e.x,e.y-20,'magma').setDepth(12);scene.eshots.push({s,vx:dx*0.9/(1+i*0.25)+(i-1)*30,vy:-330-i*25,g:620,life:3,dmg:18})}e.state='rest';e.st=0.8}return}
  if(e.state==='rain'){e.setVelocityX(0);if(e.st<=0){const cam=scene.cameras.main.worldView;for(let i=0;i<6;i++){const x=Phaser.Math.Clamp(p.x+(i-2.5)*30+(Math.random()-.5)*14,20,scene.lw-20),s=scene.add.image(x,cam.y+4,'magma').setDepth(12);
      scene.eshots.push({s,vx:0,vy:0,g:500,life:3,dmg:18,delay:0.3+i*0.12})}scene.toast('불비가 쏟아진다!',1200);e.state='rest';e.st=1}return}
  if(e.state==='pillar'){e.setVelocityX(0);if(e.st<=0){const n=rage?5:3,gy=e.body.bottom;
      for(let i=0;i<n;i++){const x=Phaser.Math.Clamp(p.x+(i-(n-1)/2)*40,20,scene.lw-20),mk=scene.add.rectangle(x,gy-1,14,3,0xff6a1a).setDepth(12);
        scene.tweens.add({targets:mk,alpha:0.2,duration:90,yoyo:true,repeat:3});
        scene.time.delayedCall(650+i*90,()=>{mk.destroy();if(scene.leaving||!scene.player)return;
          const st=scene.add.image(x,gy,'fx_streak').setOrigin(0.5,1).setScale(2.6,0.1).setTint(0xff7a2a).setBlendMode(Phaser.BlendModes.ADD).setDepth(12);
          scene.tweens.add({targets:st,scaleY:9,duration:90,yoyo:true,hold:200,onComplete:()=>st.destroy()});scene.fireEm.explode(10,x,gy-8);scene.shake(60,0.005);
          const pl=scene.player;if(!pl.dead&&Math.abs(pl.x-x)<11&&pl.body.bottom>gy-76&&pl.body.top<gy)scene.hurtBy(e.dmg,x,'enemy')})}
      e.state='rest';e.st=1.1}return}
  if(e.state==='rest'){if(e.st<=0){e.state='walk';e.st=0.5}return}
  if(!onGround(e)||p.dead){e.setVelocityX(0);return}
  e.dir=Math.sign(dx)||1;e.setFlipX(e.dir<0);
  if(e.st<=0){e.n++;const k=e.n%(rage?4:3);
    if(k===1){e.state='wind';e.st=rage?0.5:0.7;return}
    if(k===2){e.state='pillar';e.st=0.4;e.setTint(0xffb060);scene.time.delayedCall(400,()=>e.active&&e.clearTint());return}
    if(k===3){e.state='rain';e.st=0.5;return}
    e.state='throw';e.st=0.5;return}
  e.setVelocityX(e.dir*(rage?40:28));
}
