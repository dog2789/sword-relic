/* PlayScene 확장: 워프, NPC 대화, 전체 지도, 퀵슬롯
   Object.assign(PlayScene.prototype, PlayUI) 로 붙여서 씀 */
import Phaser from 'phaser';
import {W,H,T,HUD,VP,MOBILE,keyText} from '../config.js';
import {ROOMS,surfaceY,roomChests} from '../world/rooms.js';
import {THEME_COL} from '../world/meadow.js';
import {STATE,bossDone} from '../state.js';
import {CONSUMABLES} from '../data/items.js';
import {HERO_H,MY} from '../gfx/hero.js';
import {F9,F11} from '../fonts.js';
import {isDown} from '../input.js';

/* NPC 대사: 진행 상황에 따라 다른 대사 */
const NPC_TALK={
  elder(){
    if(!STATE.abilities.djump)return{lines:[
      '{name}, 정말 떠나는구나. 할아버지를 꼭 닮았어.',
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
  mother(){
    return{lines:STATE.abilities.djump?['돌아왔구나! 얼굴 보니 다행이다.','무리하지 말고, 힘들면 언제든 집에 들르렴.']:
      ['{name}, 정말 떠나는 거구나... 할아버지가 쓰시던 그 검, 잘 챙겼지?','전설의 검은 동쪽 고성 어딘가에 잠들어 있다고들 하더라.','몸조심하렴. 대장간 아저씨한테 검도 손봐 달라고 하고.']};
  },
  smith(){
    return{lines:['어서 오게! 골드만 있으면 자네 검을 더 단단하게 두드려 주지.'],end:s=>s.openSmith()};
  },
  shop(){
    return{lines:['어서 오세요~ 먼 길 떠나려면 물약은 넉넉히 챙겨야죠.'],end:s=>s.openShop()};
  },
  kid(){
    return{lines:STATE.bosses&&STATE.bosses.rust?['{name} 형! 고성의 녹슨 수문장을 쓰러뜨렸다며? 진짜 멋있다!']:
      ['형, 몬스터를 쓰러뜨리면 반짝이는 골드가 나온대!','골드를 모으면 대장간에서 검을 강화할 수 있어. 나도 크면 기사가 될 거야!']};
  },
  grandpa(){
    return{lines:STATE.flags.ending?['고향에 돌아가면 어머니께 안부 전해 다오.','그리고... 남은 보물도 찾아보거라. 세상은 아직 넓단다.']:
      ['...드디어 왔구나, 내 손주 {name}.','제단 위의 검을 집어 보거라. 그것이 네가 찾던 전설의 검이란다.']};
  },
  knight(){
    return{lines:[
      '...여기까지 왔는가, 젊은 검사 {name}.',
      '나는 이 성을 지키던 청기사단의 기사였다. 마왕의 군세에 성은 무너지고 말았지.',
      '폭포 회랑 너머 무기고와 어둠의 회랑에 우리 청기사단의 갑옷이 남아 있다.',
      '왕좌의 방은 녹슨 수문장이 지키고 있다. 내려찍기의 충격파는 뛰어서 피하거라.',
      '높은 탑의 좁은 굴뚝은 벽을 딛고 오르는 자만 지날 수 있다. 땅속 깊은 곳 박쥐 군주의 망토라면 혹시...']};
  }
};

const fix=(o,d=200)=>o.scene.toOvl(o,d);

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
    // NPC: 한 방에 여러 명 (npcs 배열, 예전 npc 하나도 지원)
    this.npcObjs=[...(R.npcs||[]),...(R.npc?[R.npc]:[])].filter(n=>!n.flag||STATE.flags[n.flag]).map(n=>{
      const x=n.tx*T+8,g=surfaceY(m,n.tx),spr=this.add.sprite(x,g,n.tex).setOrigin(0.5,(HERO_H-MY)/HERO_H).setDepth(6);
      if(n.ghost){spr.setAlpha(0.7).setTint(0xcfe8ff);this.tweens.add({targets:spr,y:g-3,duration:1100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})}
      if(n.face)spr.setFlipX(n.face<0);
      return{def:n,x,y:g,spr,t:Math.random()}});
    // 대화할 수 있을 때 주인공 머리 위에 뜨는 말풍선
    this.bubble=this.add.image(0,0,'bubble').setOrigin(0.5,1).setDepth(45).setVisible(false);
  },
  updateExtras(dt,held,press){
    const p=this.player;
    if(this.warpObj){const w=this.warpObj,near=Math.abs(p.x-w.x)<12&&Math.abs(p.y-(w.y-9))<14&&!p.dead;
      if(near&&!w.on){w.on=true;STATE.warps[w.def.id]=this.roomId;w.base.setTexture('warp');w.lab.setTint(0x8fe3ff);w.glow.setAlpha(0.9);
        this.auraEm.explode(18,w.x,w.y-8);this.toast('워프 포인트 등록! 받침대 위에서 ↑ 키를 누르면 이동할 수 있어요',3400)}
      if(near&&w.on&&press.up&&!this.climbing)this.openWarp();}
    let talk=null;this.canTalk=!!(this.warpObj&&this.warpObj.on&&Math.abs(p.x-this.warpObj.x)<12&&Math.abs(p.y-(this.warpObj.y-9))<14);
    (this.npcObjs||[]).forEach(n=>{const near=Math.abs(p.x-n.x)<20&&Math.abs(p.y-(n.y-9))<16&&!p.dead;
      if(near&&!talk)talk=n;if(Math.abs(p.x-n.x)<48&&!n.def.still)n.spr.setFlipX(p.x<n.x);
      n.t+=dt;if(this.textures.exists(n.def.tex+'_1'))n.spr.setTexture(n.def.tex+(Math.floor(n.t/0.45)%2?'_1':''))});
    if(this.bubble){this.bubble.setVisible(!!talk&&!this.climbing).setPosition(p.x+this.facing*6,p.y-10+Math.sin(this.time.now/180)*1.5)}
    if(talk)this.canTalk=true;
    if(talk&&press.up&&!this.climbing){const t=NPC_TALK[talk.def.id](this);this.openDialog(talk.def.name,t.lines,t.end)}
  },

  /* ---------- 공용: 오버레이 열고 닫기 ---------- */
  pauseWorld(){this.physics.world.pause();this.anims.pauseAll()},
  resumeWorld(){this.physics.world.resume();this.anims.resumeAll()},
  overlayOpen(){return !!(this.menu||this.dlg||this.mapv||this.warpm||this.listm)},
  /* 오버레이 조작: 열린 순간 이미 눌려 있던 키는 무시하고, 새로 누른 키만 반응 */
  navHeld(){const v=VP;return{up:isDown('ArrowUp','KeyW')||v.up,down:isDown('ArrowDown','KeyS')||v.down,left:isDown('ArrowLeft','KeyA')||v.left,right:isDown('ArrowRight','KeyD')||v.right,
    ok:isDown('KeyZ','KeyX','Enter','Space','KeyJ','KeyK')||v.attack||v.jump,back:isDown('Escape','KeyM','KeyI')||v.menu||v.map||v.back,x:isDown('KeyX')||v.jump}},
  navPress(){const h=this.navHeld(),p=this.prevNav||h,r={};for(const k in h)r[k]=h[k]&&!p[k];this.prevNav=h;return r},
  navReset(){this.prevNav=this.navHeld()},
  /* 폰: 창 오른쪽 위에 누를 수 있는 닫기 버튼 (키보드 ESC·I·M 대신) */
  addCloseBtn(x,y,arr,fn){const b=fix(this.add.text(x,y,'✕ 닫기',{fontFamily:F9,fontSize:'10px',color:'#ffd8de',backgroundColor:'#5a1a2a'}).setOrigin(1,0).setPadding(5,2,5,2),240);
    b.setInteractive({useHandCursor:true}).on('pointerdown',(p,lx,ly,ev)=>{ev&&ev.stopPropagation();fn()});arr.push(b);return b},
  /* ---------- 대화 ---------- */
  openDialog(name,lines,onEnd){
    if(this.overlayOpen())return;this.pauseWorld();
    // lines: 문자열이면 name이 말하고, {n:'이름',t:'대사'} 면 줄마다 말하는 사람이 바뀜 (컷신)
    const D=this.dlg={lines,i:0,shown:0,onEnd,objs:[],def:name,cut:lines.some(l=>typeof l!=='string')};
    const g=fix(this.add.graphics());D.objs.push(g);D.g=g;
    D.name=fix(this.add.text(20,96,'',{fontFamily:F9,fontSize:'10px',color:'#ffe27a'}));D.objs.push(D.name);
    this.dlgFrame();
    D.body=fix(this.add.text(18,112,'',{fontFamily:F9,fontSize:'10px',color:'#ece7f7',wordWrap:{width:286},lineSpacing:3}));D.objs.push(D.body);
    D.arrow=fix(this.add.text(302,140,'▼',{fontFamily:F9,fontSize:'10px',color:'#ffe27a'}).setOrigin(1,0));D.objs.push(D.arrow);
    this.tweens.add({targets:D.arrow,alpha:0.2,duration:400,yoyo:true,repeat:-1});
    const zone=fix(this.add.zone(-this.ovl.x,0,W,H).setOrigin(0).setInteractive());zone.on('pointerdown',()=>this.advanceDialog());D.objs.push(zone);
    if(D.cut){const sk=fix(this.add.text(306,84,MOBILE?'건너뛰기 ▶▶':'ESC 건너뛰기',{fontFamily:F9,fontSize:'10px',color:'#ffffff',stroke:'#0f0b1e',strokeThickness:3}).setOrigin(1,0).setPadding(6,4,2,4),201);
      sk.setInteractive({useHandCursor:true}).on('pointerdown',(p,x,y,ev)=>{ev&&ev.stopPropagation();this.closeDialog()});D.objs.push(sk)}
    this.navReset();
  },
  dlgLine(D){const L=D.lines[D.i],me=STATE.name||'모험가',nm=s=>s==='나'?me:s,tx=s=>keyText(s).replace(/{name}/g,me);return typeof L==='string'?{n:D.def,t:tx(L)}:{n:nm(L.n||D.def),t:tx(L.t)}},
  dlgFrame(){const D=this.dlg,g=D.g,nm=this.dlgLine(D).n,w=Math.max(48,nm.length*10+12);g.clear();
    g.fillStyle(0x0f0b1e,0.94).fillRect(8,100,304,52);g.lineStyle(1,0xc9a24a,1).strokeRect(8.5,100.5,303,51);
    g.fillStyle(0x2c2346,1).fillRect(14,94,w,14);g.lineStyle(1,0xc9a24a,1).strokeRect(14.5,94.5,w-1,13);D.name.setText(nm)},
  closeDialog(){const D=this.dlg;D.objs.forEach(o=>o.destroy());this.dlg=null;this.resumeWorld();this.prev=this.heldNow();if(D.onEnd)D.onEnd(this)},
  advanceDialog(){
    const D=this.dlg;if(!D)return;const full=this.dlgLine(D).t;
    if(D.shown<full.length){D.shown=full.length;return}
    D.i++;D.shown=0;
    if(D.i>=D.lines.length)this.closeDialog();else this.dlgFrame();
  },
  updateDialog(dt){
    const D=this.dlg,n=this.navPress();
    if(this.ed('dlgesc',isDown('Escape')||VP.back)){this.closeDialog();return}
    if(n.ok||n.up)this.advanceDialog();if(!this.dlg)return;
    const full=this.dlgLine(D).t;D.shown=Math.min(full.length,D.shown+dt*38);
    D.body.setText(full.slice(0,Math.floor(D.shown)));D.arrow.setVisible(D.shown>=full.length);
  },

  /* ---------- 워프: 지도에서 고르기 ---------- */
  openWarp(){
    if(this.overlayOpen())return;
    const list=Object.keys(ROOMS).filter(r=>ROOMS[r].warp&&STATE.warps[ROOMS[r].warp.id]);
    if(list.length<2){this.toast('다른 워프 포인트를 찾아 등록하면 순간이동할 수 있어요',2600);return}
    this.pauseWorld();
    const M=this.warpm={list,sel:Math.max(0,list.indexOf(this.roomId)),objs:[]};
    M.g=fix(this.add.graphics());M.objs.push(M.g);
    const t=(x,y,s,o={})=>{const o2=fix(this.add.text(x,y,s,Object.assign({fontFamily:F9,fontSize:'10px',color:'#ece7f7'},o)));M.objs.push(o2);return o2};
    t(18,12,'워프',{fontFamily:F11,fontSize:'12px',color:'#8fe3ff'});
    if(MOBILE)this.addCloseBtn(304,11,M.objs,()=>this.closeWarp());else t(302,13,keyText('방향키 고르기   Z 이동   M 닫기'),{color:'#8f86ab'}).setOrigin(1,0);
    t(18,30,'등록한 워프 '+list.length+'곳',{color:'#cfc8e4'});
    M.name=t(160,136,'',{fontFamily:F11,fontSize:'12px',color:'#ffe27a'}).setOrigin(0.5,0);
    M.hint=t(160,152,'',{color:'#8f86ab'}).setOrigin(0.5,0);
    // 터치: 워프 방을 누르면 고르고, 한 번 더 누르면 이동
    const L=this.mapLayout();
    list.forEach((r,i)=>{const[x,y]=L.pos(r),z=fix(this.add.zone(x-2,y-2,L.cw+4,L.ch+4).setOrigin(0).setInteractive());
      z.on('pointerdown',()=>{if(M.sel===i)this.doWarp();else{M.sel=i}});M.objs.push(z)});
    this.navReset();this.drawWarp(0);
  },
  drawWarp(time){const M=this.warpm,g=M.g,r=M.list[M.sel];g.clear();
    this.paintMap(g,time,{warps:M.list,sel:r});
    M.name.setText('▶ '+ROOMS[r].name+(r===this.roomId?'  (여기)':''));
    M.hint.setText(r===this.roomId?'지금 있는 곳이에요':MOBILE?'한 번 더 누르면 이곳으로 순간이동해요':'Z를 누르면 이곳으로 순간이동해요')},
  /* 누른 방향에 있는 가장 가까운 워프로 커서 이동 */
  warpStep(dx,dy){const M=this.warpm,G=i=>ROOMS[i].grid,c=G(M.list[M.sel]);let best=-1,bd=1e9;
    M.list.forEach((r,i)=>{if(i===M.sel)return;const ex=G(r)[0]-c[0],ey=G(r)[1]-c[1];
      if(dx&&Math.sign(ex)!==dx)return;if(dy&&Math.sign(ey)!==dy)return;
      const d=dx?Math.abs(ex)+Math.abs(ey)*2:Math.abs(ey)+Math.abs(ex)*2;if(d<bd){bd=d;best=i}});
    if(best<0){const n=M.list.length;best=(M.sel+(dx||dy)+n)%n}M.sel=best},
  updateWarp(time){const M=this.warpm,n=this.navPress();
    if(n.left)this.warpStep(-1,0);if(n.right)this.warpStep(1,0);if(n.up)this.warpStep(0,-1);if(n.down)this.warpStep(0,1);
    if(n.ok){this.doWarp();return}if(n.back){this.closeWarp();return}this.drawWarp(time)},
  closeWarp(){const M=this.warpm;if(!M)return;M.objs.forEach(o=>o.destroy());this.warpm=null;this.resumeWorld();this.prev=this.heldNow()},
  doWarp(){const M=this.warpm,r=M.list[M.sel];this.closeWarp();if(r===this.roomId)return;
    this.auraEm.explode(24,this.player.x,this.player.y);this.goRoom(r,'warp')},

  /* ---------- 전체 지도 ---------- */
  treasures(){const t=[];for(const id in ROOMS){const R=ROOMS[id];
      roomChests(R).forEach(c=>t.push(!!STATE.opened[c.id]));if(R.crystal)t.push(!!STATE.collected[R.crystal.id]);if(R.boss&&R.boss.drop)t.push(!!STATE.collected['drop_'+id])}
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
    t(302,MOBILE?30:13,'탐험률 '+this.explorePct()+'%',{color:'#8fe3ff'}).setOrigin(1,0);
    t(18,30,'방 '+ids.filter(i=>STATE.visited[i]).length+'/'+ids.length+'    보물 '+tr.got+'/'+tr.all+'    워프 '+wpOn.length+'/'+wp.length,{color:'#cfc8e4'});
    t(18,134,'현재 위치: '+this.R.name,{color:'#ffe27a'});
    // 폰: 닫기는 오른쪽 위 (아래쪽은 공격·점프 버튼에 가려짐)
    if(MOBILE)this.addCloseBtn(304,11,M.objs,()=>this.closeMap());else t(302,134,'M 닫기',{color:'#8f86ab'}).setOrigin(1,0);
    const lg=[['cur','현재'],['save','세이브'],['warp','워프'],['chest','보물'],['boss','보스']];
    M.legend=lg;lg.forEach(([c,s],i)=>t(30+i*56,148,s,{color:'#8f86ab'}));
    const zone=fix(this.add.zone(-this.ovl.x,0,W,H).setOrigin(0).setInteractive());zone.on('pointerdown',()=>this.closeMap());M.objs.push(zone);
    this.navReset();
  },
  /* 지도 칸 배치: 방이 늘어나도 창 안에 들어가도록 칸 크기를 맞춤 */
  mapLayout(){
    const ids=Object.keys(ROOMS),G=i=>ROOMS[i].grid;
    const minX=Math.min(...ids.map(i=>G(i)[0])),maxX=Math.max(...ids.map(i=>G(i)[0])),minY=Math.min(...ids.map(i=>G(i)[1])),maxY=Math.max(...ids.map(i=>G(i)[1]));
    const nx=maxX-minX+1,ny=maxY-minY+1,gap=nx>14?3:nx>7?6:8,cw=Math.min(30,Math.floor((292-gap*(nx-1))/nx)),ch=Math.min(17,Math.floor((92-gap*(ny-1))/ny));
    const mw=nx*cw+(nx-1)*gap,mh=ny*ch+(ny-1)*gap,x0=Math.round((320-mw)/2),y0=Math.round(44+(88-mh)/2);
    return{ids,cw,ch,gap,pos:i=>[x0+(G(i)[0]-minX)*(cw+gap),y0+(G(i)[1]-minY)*(ch+gap)]};
  },
  paintMap(g,time,warp){
    g.fillStyle(0x05030b,0.8).fillRect(-this.ovl.x,0,W,H);g.fillStyle(0x0f0b1e,0.97).fillRect(8,6,304,160);g.lineStyle(1,warp?0x8fe3ff:0xc9a24a,1).strokeRect(8.5,6.5,303,159);
    const{ids,cw,ch,gap,pos}=this.mapLayout(),blink=Math.floor(time/300)%2;
    const nb=j=>{const e=ROOMS[j].exits;return[e.left,e.right,e.up&&e.up.to,e.down&&e.down.to].filter(Boolean)};
    const known=i=>STATE.visited[i]||ids.some(j=>STATE.visited[j]&&nb(j).includes(i));
    ids.forEach(i=>{if(!STATE.visited[i])return;const[x,y]=pos(i),e=ROOMS[i].exits;g.fillStyle(0x7a6a9a,1);
      if(e.right&&known(e.right))g.fillRect(x+cw,y+Math.floor(ch/2)-1,gap,2);
      if(e.down&&known(e.down.to)){const[dx]=pos(e.down.to);g.fillRect(Math.round((x+dx)/2)+cw/2-1,y+ch,2,gap)}});
    ids.forEach(i=>{if(!known(i))return;const[x,y]=pos(i),R=ROOMS[i];
      if(!STATE.visited[i]){g.lineStyle(1,0x5a4f7a,1).strokeRect(x+0.5,y+0.5,cw-1,ch-1);return}
      const cur=i===this.roomId,isW=warp&&warp.warps.includes(i);
      const base=THEME_COL[R.theme]||0x3f7a3a;
      g.fillStyle(warp?(isW?base:0x2a2440):(cur?(blink?0xffe27a:0xc9a24a):base),1).fillRect(x,y,cw,ch);g.fillStyle(0xffffff,cur&&!warp?0.6:0.2).fillRect(x,y,cw,1);
      if(warp){
        if(isW){g.fillStyle(0x6fe0ff,1).fillTriangle(x+cw/2-3,y+ch/2,x+cw/2,y+ch/2-3,x+cw/2+3,y+ch/2).fillTriangle(x+cw/2-3,y+ch/2,x+cw/2,y+ch/2+3,x+cw/2+3,y+ch/2)}
        if(cur){g.fillStyle(0xffe27a,1).fillRect(x+1,y+ch-3,cw-2,2)}
        if(i===warp.sel){g.lineStyle(2,blink?0xffe27a:0xffffff,1).strokeRect(x-2,y-2,cw+4,ch+4)}
        return}
      // 표시는 칸이 작아서(11×7) 겹치지 않게 가로로 한 줄 (많으면 앞의 3개: 보스·세이브·워프·보물 순)
      const mk=[];if(R.boss&&!bossDone(R.boss.id||'king'))mk.push('boss');if(R.save)mk.push('save');
      if(R.warp&&STATE.warps[R.warp.id])mk.push('warp');if(roomChests(R).some(c=>!STATE.opened[c.id]))mk.push('chest');
      const n=Math.min(3,mk.length),mx=x+Math.floor((cw-(4*n-1))/2),my=y+Math.floor((ch-3)/2);
      mk.slice(0,3).forEach((k,j)=>this.mapMark(g,k,mx+j*4,my));
    });
  },
  /* 지도 표시 하나 (3×3): 세이브 초록 네모, 워프 하늘색 +, 보물 금색 네모, 보스 빨간 네모 */
  mapMark(g,k,x,y){if(k==='warp'){g.fillStyle(0x6fe0ff,1).fillRect(x,y+1,3,1).fillRect(x+1,y,1,3);return}
    g.fillStyle({save:0x7cff8a,chest:0xffd34a,boss:0xff4a5a}[k],1).fillRect(x,y,3,3)},
  drawMap(time){
    const M=this.mapv,g=M.g;g.clear();this.paintMap(g,time,null);
    M.legend.forEach(([k],i)=>{if(k==='cur')g.fillStyle(0xffe27a,1).fillRect(22+i*56,151,5,5);else this.mapMark(g,k,23+i*56,152)});
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
