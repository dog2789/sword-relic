/* PlayScene 확장: 워프, NPC 대화, 전체 지도, 퀵슬롯
   Object.assign(PlayScene.prototype, PlayUI) 로 붙여서 씀 */
import Phaser from 'phaser';
import {W,H,T,HUD,VP} from '../config.js';
import {ROOMS,surfaceY} from '../world/rooms.js';
import {STATE,bossDone} from '../state.js';
import {CONSUMABLES} from '../data/items.js';
import {F9,F11} from '../fonts.js';
import {isDown} from '../input.js';

/* NPC 대사: 진행 상황에 따라 다른 대사 */
const NPC_TALK={
  elder(){
    if(!STATE.abilities.djump)return{lines:[
      '소년아, 정말 떠나는구나. 할아버지를 꼭 닮았어.',
      '길을 가다 지치면 석상에 손을 얹거라. 기운이 돌아올 게다.',
      '들판 바닥의 사다리 구멍은 땅속 동굴로 이어진단다. 그 위에서 ↓ 키를 눌러 보거라.',
      '동쪽 끝 슬라임 둥지 너머엔 옛 고성이 있다고 하더구나.']};
    return{lines:[
      '오오, 하늘을 두 번 딛는 힘을 얻었구나!',
      '슬라임 둥지 오른쪽의 높은 벽, 이제는 넘을 수 있을 게다.',
      '그 너머 고성에 전설의 검에 대한 단서가 있을지도 모르지.']};
  },
  merchant(){
    if(!STATE.flags.merchant_gift)return{lines:[
      '허허, 이런 곳에서 손님을 다 만나네.',
      '고목 꼭대기에서 반짝이는 걸 봤다네. 나무 덩굴을 타고 ↑ 로 올라가 보게.',
      '옛다, 회복 물약 두 병일세. 숫자 1 키로 마실 수 있다네.'],
      end:s=>{STATE.flags.merchant_gift=true;STATE.items.potion=(STATE.items.potion||0)+2;s.popText(s.player.x,s.player.y-14,'POTION +2',0xff8a95);s.goldEm.explode(10,s.player.x,s.player.y)}};
    return{lines:[
      '물약은 아껴 쓰게. 몬스터가 가끔 떨어뜨리기도 하지.',
      '워프 받침대는 한 번 밟아두면 그 위에서 ↑ 키로 오갈 수 있다네.']};
  },
  knight(){
    return{lines:[
      '...여기까지 왔는가, 젊은 검사여.',
      '나는 이 성을 지키던 청기사단의 기사였다. 마왕의 군세에 성은 무너지고 말았지.',
      '폭포 회랑 너머 무기고와 어둠의 회랑에 우리 청기사단의 갑옷이 남아 있다.',
      '왕좌의 방은 녹슨 수문장이 지키고 있다. 내려찍기의 충격파는 뛰어서 피하거라.',
      '높은 탑의 좁은 굴뚝은 벽을 딛고 오르는 자만 지날 수 있다. 땅속 깊은 곳 박쥐 군주의 망토라면 혹시...']};
  }
};

const fix=(o,d=200)=>o.setScrollFactor(0).setDepth(d);

export const PlayUI={
  /* ---------- 방 오브젝트: 워프, NPC ---------- */
  spawnExtras(){
    const R=this.R,m=this.map;
    if(R.warp){
      const w=R.warp,x=w.tx*T+8,g=surfaceY(m,w.tx),on=!!STATE.warps[w.id];
      const glow=this.add.image(x,g-14,'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0x6fe0ff).setScale(0.55).setAlpha(on?0.9:0.15).setDepth(1);
      const base=this.add.image(x,g,on?'warp':'warp_off').setOrigin(0.5,1).setDepth(2);
      const lab=this.add.bitmapText(x,g-16,'pix','WP').setOrigin(0.5,1).setDepth(3).setTint(on?0x8fe3ff:0x6a6e7a);
      this.tweens.add({targets:[lab],y:'-=2',duration:700,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      this.warpObj={def:w,x,y:g,on,glow,base,lab};
    }
    if(R.npc){
      const n=R.npc,x=n.tx*T+8,g=surfaceY(m,n.tx);
      const spr=this.add.sprite(x,g,n.tex).setOrigin(0.5,1).setDepth(6);
      if(n.ghost){spr.setAlpha(0.7).setTint(0xcfe8ff);this.tweens.add({targets:spr,y:g-3,duration:1100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})}
      const hint=this.add.bitmapText(x,g-20,'dmg','!').setOrigin(0.5,1).setDepth(45).setTint(0xffe27a).setVisible(false);
      this.tweens.add({targets:hint,y:'-=3',duration:350,yoyo:true,repeat:-1});
      this.npcObj={def:n,x,y:g,spr,hint,t:0};
    }
  },
  updateExtras(dt,held,press){
    const p=this.player;
    if(this.warpObj){const w=this.warpObj,near=Math.abs(p.x-w.x)<12&&Math.abs(p.y-(w.y-9))<14&&!p.dead;
      if(near&&!w.on){w.on=true;STATE.warps[w.def.id]=this.roomId;w.base.setTexture('warp');w.lab.setTint(0x8fe3ff);w.glow.setAlpha(0.9);
        this.auraEm.explode(18,w.x,w.y-8);this.toast('워프 포인트 등록! 받침대 위에서 ↑ 키를 누르면 이동할 수 있어요',3400)}
      if(near&&w.on&&press.up&&!this.climbing)this.openWarp();}
    if(this.npcObj){const n=this.npcObj,near=Math.abs(p.x-n.x)<20&&Math.abs(p.y-(n.y-9))<16&&!p.dead;
      n.hint.setVisible(near);n.spr.setFlipX(p.x<n.x);
      n.t+=dt;n.spr.setTexture(n.def.tex+(Math.floor(n.t/0.45)%2?'_1':''));
      if(near&&press.up&&!this.climbing){const talk=NPC_TALK[n.def.id]();this.openDialog(n.def.name,talk.lines,talk.end)}}
  },

  /* ---------- 공용: 오버레이 열고 닫기 ---------- */
  pauseWorld(){this.physics.world.pause();this.anims.pauseAll()},
  resumeWorld(){this.physics.world.resume();this.anims.resumeAll()},
  overlayOpen(){return !!(this.menu||this.dlg||this.mapv||this.warpm)},
  /* 오버레이 조작: 열린 순간 이미 눌려 있던 키는 무시하고, 새로 누른 키만 반응 */
  navHeld(){const v=VP;return{up:isDown('ArrowUp','KeyW')||v.up,down:isDown('ArrowDown','KeyS')||v.down,left:isDown('ArrowLeft','KeyA')||v.left,right:isDown('ArrowRight','KeyD')||v.right,
    ok:isDown('KeyZ','KeyX','Enter','Space','KeyJ','KeyK')||v.attack||v.jump,back:isDown('Escape','KeyM','KeyI')||v.menu||v.map}},
  navPress(){const h=this.navHeld(),p=this.prevNav||h,r={};for(const k in h)r[k]=h[k]&&!p[k];this.prevNav=h;return r},
  navReset(){this.prevNav=this.navHeld()},
  /* ---------- 대화 ---------- */
  openDialog(name,lines,onEnd){
    if(this.overlayOpen())return;this.pauseWorld();
    const D=this.dlg={lines,i:0,shown:0,onEnd,objs:[]};
    const g=fix(this.add.graphics());D.objs.push(g);
    g.fillStyle(0x0f0b1e,0.94).fillRect(8,100,304,52);g.lineStyle(1,0xc9a24a,1).strokeRect(8.5,100.5,303,51);
    g.fillStyle(0x2c2346,1).fillRect(14,94,Math.max(48,name.length*10+12),14);g.lineStyle(1,0xc9a24a,1).strokeRect(14.5,94.5,Math.max(48,name.length*10+12)-1,13);
    D.objs.push(fix(this.add.text(20,96,name,{fontFamily:F9,fontSize:'10px',color:'#ffe27a'})));
    D.body=fix(this.add.text(18,112,'',{fontFamily:F9,fontSize:'10px',color:'#ece7f7',wordWrap:{width:286},lineSpacing:3}));D.objs.push(D.body);
    D.arrow=fix(this.add.text(302,140,'▼',{fontFamily:F9,fontSize:'10px',color:'#ffe27a'}).setOrigin(1,0));D.objs.push(D.arrow);
    this.tweens.add({targets:D.arrow,alpha:0.2,duration:400,yoyo:true,repeat:-1});
    const zone=fix(this.add.zone(0,0,W,H).setOrigin(0).setInteractive());zone.on('pointerdown',()=>this.advanceDialog());D.objs.push(zone);
    this.navReset();
  },
  advanceDialog(){
    const D=this.dlg;if(!D)return;const full=D.lines[D.i];
    if(D.shown<full.length){D.shown=full.length;return}
    D.i++;D.shown=0;
    if(D.i>=D.lines.length){D.objs.forEach(o=>o.destroy());this.dlg=null;this.resumeWorld();this.prev=this.heldNow();if(D.onEnd)D.onEnd(this)}
  },
  updateDialog(dt){
    const D=this.dlg,n=this.navPress();
    if(n.ok||n.up)this.advanceDialog();if(!this.dlg)return;
    const full=D.lines[D.i];D.shown=Math.min(full.length,D.shown+dt*38);
    D.body.setText(full.slice(0,Math.floor(D.shown)));D.arrow.setVisible(D.shown>=full.length);
  },

  /* ---------- 워프 ---------- */
  openWarp(){
    if(this.overlayOpen())return;
    const list=Object.keys(ROOMS).filter(r=>ROOMS[r].warp&&STATE.warps[ROOMS[r].warp.id]);
    if(list.length<2){this.toast('다른 워프 포인트를 찾아 등록하면 순간이동할 수 있어요',2600);return}
    this.pauseWorld();
    const M=this.warpm={list,sel:Math.max(0,list.indexOf(this.roomId)),objs:[],rows:[]};
    const h=34+list.length*16,y0=Math.round((H-HUD-h)/2);
    const g=fix(this.add.graphics());M.objs.push(g);M.g=g;M.y0=y0;M.h=h;
    M.objs.push(fix(this.add.text(W/2,y0+6,'워프할 곳을 고르세요',{fontFamily:F9,fontSize:'10px',color:'#8fe3ff'}).setOrigin(0.5,0)));
    list.forEach((r,i)=>{const t=fix(this.add.text(W/2,y0+24+i*16,ROOMS[r].name+(r===this.roomId?'  (여기)':''),{fontFamily:F9,fontSize:'10px',color:'#ece7f7'}).setOrigin(0.5,0).setInteractive());
      t.on('pointerdown',()=>{M.sel=i;this.doWarp()});M.rows.push(t);M.objs.push(t)});
    this.navReset();this.drawWarp();
  },
  drawWarp(){const M=this.warpm,g=M.g;g.clear();
    g.fillStyle(0x05030b,0.6).fillRect(0,0,W,H);g.fillStyle(0x0f0b1e,0.96).fillRect(80,M.y0,160,M.h);g.lineStyle(1,0x8fe3ff,1).strokeRect(80.5,M.y0+0.5,159,M.h-1);
    g.fillStyle(0x2c2346,1).fillRect(88,M.y0+22+M.sel*16,144,14);
    M.rows.forEach((t,i)=>t.setColor(i===M.sel?'#ffe27a':'#ece7f7'))},
  updateWarp(){const M=this.warpm,n=this.navPress();
    if(n.up){M.sel=(M.sel+M.list.length-1)%M.list.length;this.drawWarp()}
    if(n.down){M.sel=(M.sel+1)%M.list.length;this.drawWarp()}
    if(n.ok)this.doWarp();else if(n.back)this.closeWarp()},
  closeWarp(){const M=this.warpm;if(!M)return;M.objs.forEach(o=>o.destroy());this.warpm=null;this.resumeWorld();this.prev=this.heldNow()},
  doWarp(){const M=this.warpm,r=M.list[M.sel];this.closeWarp();if(r===this.roomId)return;
    this.auraEm.explode(24,this.player.x,this.player.y);this.goRoom(r,'warp')},

  /* ---------- 전체 지도 ---------- */
  treasures(){const t=[];for(const id in ROOMS){const R=ROOMS[id];
      if(R.chest)t.push(!!STATE.opened[R.chest.id]);if(R.crystal)t.push(!!STATE.collected[R.crystal.id]);if(R.boss&&R.boss.drop)t.push(!!STATE.collected['drop_'+id])}
    return{got:t.filter(Boolean).length,all:t.length}},
  explorePct(){const ids=Object.keys(ROOMS),v=ids.filter(i=>STATE.visited[i]).length,t=this.treasures();
    return Math.round((v+t.got)/(ids.length+t.all)*100)},
  toggleMap(){if(this.mapv)this.closeMap();else this.openMap()},
  openMap(){
    if(this.overlayOpen()||this.player.dead||this.leaving)return;this.pauseWorld();
    const M=this.mapv={objs:[]};
    M.g=fix(this.add.graphics());M.objs.push(M.g);
    const t=(x,y,s,o={})=>{const o2=fix(this.add.text(x,y,s,Object.assign({fontFamily:F9,fontSize:'10px',color:'#ece7f7'},o)));M.objs.push(o2);return o2};
    const ids=Object.keys(ROOMS),tr=this.treasures(),wp=ids.filter(i=>ROOMS[i].warp),wpOn=wp.filter(i=>STATE.warps[ROOMS[i].warp.id]);
    t(18,12,'지도',{fontFamily:F11,fontSize:'12px',color:'#ffe27a'});
    t(302,13,'탐험률 '+this.explorePct()+'%',{color:'#8fe3ff'}).setOrigin(1,0);
    t(18,30,'방 '+ids.filter(i=>STATE.visited[i]).length+'/'+ids.length+'    보물 '+tr.got+'/'+tr.all+'    워프 '+wpOn.length+'/'+wp.length,{color:'#cfc8e4'});
    t(18,134,'현재 위치: '+this.R.name,{color:'#ffe27a'});
    t(302,134,'M 닫기',{color:'#8f86ab'}).setOrigin(1,0);
    const lg=[[0xffe27a,'현재'],[0x8fe3ff,'세이브'],[0x6fe0ff,'워프'],[0xffd34a,'보물'],[0xff4a5a,'보스']];
    M.legend=lg;lg.forEach(([c,s],i)=>t(30+i*56,148,s,{color:'#8f86ab'}));
    const zone=fix(this.add.zone(0,0,W,H).setOrigin(0).setInteractive());zone.on('pointerdown',()=>this.closeMap());M.objs.push(zone);
    this.navReset();
  },
  drawMap(time){
    const M=this.mapv,g=M.g;g.clear();
    g.fillStyle(0x05030b,0.8).fillRect(0,0,W,H);g.fillStyle(0x0f0b1e,0.97).fillRect(8,6,304,160);g.lineStyle(1,0xc9a24a,1).strokeRect(8.5,6.5,303,159);
    const ids=Object.keys(ROOMS),G=i=>ROOMS[i].grid;
    const minX=Math.min(...ids.map(i=>G(i)[0])),maxX=Math.max(...ids.map(i=>G(i)[0])),minY=Math.min(...ids.map(i=>G(i)[1])),maxY=Math.max(...ids.map(i=>G(i)[1]));
    // 방이 늘어나도 지도 창 안에 들어가도록 칸 크기를 맞춤
    const nx=maxX-minX+1,ny=maxY-minY+1,gap=nx>7?6:8,cw=Math.min(30,Math.floor((292-gap*(nx-1))/nx)),ch=Math.min(17,Math.floor((92-gap*(ny-1))/ny));
    const mw=(maxX-minX+1)*cw+(maxX-minX)*gap,mh=(maxY-minY+1)*ch+(maxY-minY)*gap,x0=Math.round((W-mw)/2),y0=Math.round(46+(84-mh)/2);
    const pos=i=>[x0+(G(i)[0]-minX)*(cw+gap),y0+(G(i)[1]-minY)*(ch+gap)];
    const nb=j=>{const e=ROOMS[j].exits;return[e.left,e.right,e.up&&e.up.to,e.down&&e.down.to].filter(Boolean)};
    const known=i=>STATE.visited[i]||ids.some(j=>STATE.visited[j]&&nb(j).includes(i));
    ids.forEach(i=>{if(!STATE.visited[i])return;const[x,y]=pos(i),e=ROOMS[i].exits;g.fillStyle(0x7a6a9a,1);
      if(e.right&&known(e.right))g.fillRect(x+cw,y+8,gap,2);
      if(e.down&&known(e.down.to)){const[dx]=pos(e.down.to);g.fillRect(Math.round((x+dx)/2)+cw/2-1,y+ch,2,gap)}});
    ids.forEach(i=>{if(!known(i))return;const[x,y]=pos(i),R=ROOMS[i];
      if(!STATE.visited[i]){g.lineStyle(1,0x5a4f7a,1).strokeRect(x+0.5,y+0.5,cw-1,ch-1);return}
      const cur=i===this.roomId,blink=Math.floor(time/350)%2;
      const base={cave:0x4a4468,treetop:0x5a7a32,castle:0x3a5aa0}[R.theme]||0x3f7a3a;
      g.fillStyle(cur?(blink?0xffe27a:0xc9a24a):base,1).fillRect(x,y,cw,ch);g.fillStyle(0xffffff,cur?0.6:0.2).fillRect(x,y,cw,1);
      if(R.save)g.fillStyle(0x8fe3ff,1).fillRect(x+3,y+3,4,4);
      if(R.warp&&STATE.warps[R.warp.id]){g.fillStyle(0x6fe0ff,1).fillTriangle(x+cw-8,y+6,x+cw-5,y+3,x+cw-2,y+6).fillTriangle(x+cw-8,y+6,x+cw-5,y+9,x+cw-2,y+6)}
      if(R.chest&&!STATE.opened[R.chest.id])g.fillStyle(0xffd34a,1).fillRect(x+3,y+ch-7,4,4);
      if(R.boss&&!bossDone(R.boss.id||'king'))g.fillStyle(0xff4a5a,1).fillRect(x+cw/2-2,y+ch/2-2,5,5);
    });
    M.legend.forEach(([c],i)=>{g.fillStyle(c,1).fillRect(22+i*56,151,5,5)});
  },
  updateMap(time){const n=this.navPress();if(n.back||n.ok){this.closeMap();return}this.drawMap(time)},
  closeMap(){const M=this.mapv;if(!M)return;M.objs.forEach(o=>o.destroy());this.mapv=null;this.resumeWorld();this.prev=this.heldNow()},

  /* ---------- 퀵슬롯 ---------- */
  buildQuick(){
    const y0=H-HUD;this.quickUI=[];
    for(let i=0;i<4;i++){const x=133+i*14;
      const icon=fix(this.add.image(x+6,y0+10,'icon_potion'),101).setVisible(false);
      const num=fix(this.add.bitmapText(x+12,y0+17,'pix',''),102).setOrigin(1,1);
      const key=fix(this.add.bitmapText(x+1,y0+3,'pix',String(i+1)),102).setTint(0x6f6890);
      const z=fix(this.add.zone(x-1,y0+2,14,18).setOrigin(0).setInteractive(),102);z.on('pointerdown',()=>this.useQuick(i));
      this.quickUI.push({x,icon,num,key})}
  },
  drawQuick(g){
    const y0=H-HUD;
    this.quickUI.forEach((q,i)=>{const id=STATE.quick[i],n=id?(STATE.items[id]||0):0;
      g.fillStyle(0x05030b,1).fillRect(q.x-1,y0+3,14,15);g.fillStyle(0x1d1430,1).fillRect(q.x,y0+4,12,13);
      if(id){q.icon.setTexture('icon_'+id).setVisible(true).setAlpha(n>0?1:0.3);q.num.setText(String(n)).setTint(n>0?0xffffff:0x6f6890)}
      else{q.icon.setVisible(false);q.num.setText('')}})
  },
  useQuick(i){
    const id=STATE.quick[i],c=CONSUMABLES[id],p=this.player,s=this.stats;if(!c||p.dead||this.overlayOpen())return;
    if(!(STATE.items[id]>0)){this.popText(p.x,p.y-14,'NONE',0x8f86ab);return}
    if(c.hp&&s.hp>=this.mhp()&&!c.mp){this.popText(p.x,p.y-14,'FULL',0x8f86ab);return}
    if(c.mp&&s.mp>=s.maxMp&&!c.hp){this.popText(p.x,p.y-14,'FULL',0x8f86ab);return}
    STATE.items[id]--;
    if(c.hp){s.hp=Math.min(this.mhp(),s.hp+c.hp);this.popNum(p.x,p.y-12,c.hp,0x7cff8a,false)}
    if(c.mp){s.mp=Math.min(s.maxMp,s.mp+c.mp);this.popNum(p.x,p.y-12,c.mp,0x8ab0ff,false)}
    this.goldEm.explode(10,p.x,p.y);
  }
};
