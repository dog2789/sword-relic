/* 모험 수첩: 이 기기의 세이브(sr_save2)를 읽어 기록·지도·장비·보스를 보여 줌. 안 본 건 보여 주지 않음 (전체 개수도 숨김) */
import {esc,playTime,roomName,readSave,IN_APP} from './common.js';
import {ROOMS} from '../world/rooms.js';
import {THEME_COL} from '../world/meadow.js';
import {ITEMS,SLOTS,SLOT_NAMES,statLine} from '../data/items.js';
import {buildTextures} from '../gfx/sprites.js';

const BOSSES=[['king','킹슬라임','kslime0'],['batlord','박쥐 군주','batlord0'],['rust','녹슨 수문장','kn_rust_idle0'],['turtle','서리 거북','turtle0'],
  ['scorpking','전갈왕','scorpk0'],['golem','화염 골렘','golem0'],['windk','바람 기사','kn_windk_idle0'],['griffin','폭풍 그리폰','griffin0'],['gcapt','근위대장','kn_gcapt_idle0'],['demon','마왕','kn_demon_idle0']];
const PLAY=IN_APP?'/play/index.html':'/play/';
const hex=n=>'#'+n.toString(16).padStart(6,'0');
const themeCol=t=>hex(THEME_COL[t]??0x4a8a3a);   // 초원은 따로 색이 없어서 풀색

// 게임 텍스처 그리는 코드를 그대로 써서 아이콘·보스 그림을 얻음 (Phaser 없이 캔버스만)
const TEX={};
try{buildTextures({textures:{exists:k=>k in TEX,addCanvas:(k,c)=>{TEX[k]=c},
  createCanvas:(k,w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;TEX[k]=c;return{canvas:c,context:c.getContext('2d'),getContext:()=>c.getContext('2d'),refresh(){}}}}})}catch(e){console.warn('아이콘 일부를 못 그림',e)}
function pic(key,h){const src=TEX[key],c=document.createElement('canvas');if(!src)return c;
  const s=Math.max(1,Math.floor(h/src.height));c.width=src.width*s;c.height=src.height*s;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,c.width,c.height);return c}

/* 지도: 방 하나 = 격자 한 칸. 가 본 방만 지역 색으로, 이어진 길은 선으로 (크기도 가 본 곳에 맞춤: 세계 전체 크기를 안 알려 줌) */
function drawMap(s,cell=14){
  const ids=Object.keys(ROOMS).filter(i=>(s.visited||{})[i]),gx=ids.map(i=>ROOMS[i].grid[0]),gy=ids.map(i=>ROOMS[i].grid[1]);
  const x0=Math.min(...gx),y0=Math.min(...gy),cols=Math.max(...gx)-x0+1,rows=Math.max(...gy)-y0+1,gap=4,cw=cell,ch=Math.round(cell*0.7),pad=8;
  const c=document.createElement('canvas');c.width=cols*(cw+gap)+pad*2;c.height=rows*(ch+gap)+pad*2;const x=c.getContext('2d');
  const pos=i=>[pad+(ROOMS[i].grid[0]-x0)*(cw+gap),pad+(ROOMS[i].grid[1]-y0)*(ch+gap)],V=s.visited||{},here=(s.save&&s.save.room)||s.room;
  x.fillStyle='#4a4068';
  for(const i of ids){if(!V[i])continue;const[px,py]=pos(i),e=ROOMS[i].exits;
    for(const n of [e.right,e.left,e.up&&e.up.to,e.down&&e.down.to])if(n&&V[n]&&ROOMS[n]){const[qx,qy]=pos(n);
      if(qy===py)x.fillRect(Math.min(px,qx)+cw,py+ch/2-1,Math.abs(qx-px)-cw,2);else if(qx===px)x.fillRect(px+cw/2-1,Math.min(py,qy)+ch,2,Math.abs(qy-py)-ch)}}
  for(const i of ids){if(!V[i])continue;const[px,py]=pos(i);x.fillStyle=themeCol(ROOMS[i].theme);x.fillRect(px,py,cw,ch);
    if(i===here){x.strokeStyle='#e8c04a';x.lineWidth=2;x.strokeRect(px-1,py-1,cw+2,ch+2)}}
  return c;
}

function share(s,st){
  const c=document.createElement('canvas');c.width=1200;c.height=630;const x=c.getContext('2d');
  x.fillStyle='#0e0b18';x.fillRect(0,0,1200,630);x.strokeStyle='#2c2346';x.lineWidth=8;x.strokeRect(4,4,1192,622);
  x.fillStyle='#e8c04a';x.font='28px "Press Start 2P"';x.fillText('SWORD RELIC',60,90);
  x.fillStyle='#8fe3ff';x.font='700 26px Galmuri11';x.fillText('모험 수첩',60,140);
  x.fillStyle='#ece7f7';x.font='700 54px Galmuri11';x.fillText(s.name||'모험가',60,230);
  st.forEach(([k,v],i)=>{const yy=300+i*56;x.fillStyle='#9a91b8';x.font='600 24px "Pretendard Variable",Pretendard,sans-serif';x.fillText(k,60,yy);
    x.fillStyle='#e8c04a';x.font='700 30px Galmuri11';x.fillText(v,250,yy)});
  const m=drawMap(s,12),sc=Math.min(560/m.width,440/m.height);x.imageSmoothingEnabled=false;
  x.fillStyle='#05030b';x.fillRect(590,100,570,460);x.drawImage(m,875-m.width*sc/2,330-m.height*sc/2,m.width*sc,m.height*sc);
  x.fillStyle='#9a91b8';x.font='600 20px "Pretendard Variable",Pretendard,sans-serif';x.fillText('swordrelic.com',590,600);
  const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=`sword-relic-${(s.name||'journal').replace(/[\\/:*?"<>|]/g,'')}.png`;a.click();
}

const root=document.getElementById('j'),s=readSave((()=>{try{return localStorage.getItem('sr_save2')}catch(_){return null}})());
if(!s){
  root.innerHTML=`<section class="panel empty"><h2>아직 모험 기록이 없어요</h2><p class="muted">게임을 시작하면 여기에 지금까지의 모험이 적혀요. 다른 기기에서 하던 세이브는 <a href="${IN_APP?'/save/index.html':'/save/'}">세이브 옮기기</a>로 가져올 수 있어요.</p><a class="play" href="${PLAY}">▶ 모험 시작하기</a></section>`;
}else{
  const total=Object.keys(ROOMS).length,vis=Object.keys(s.visited||{}).filter(k=>ROOMS[k]).length,pct=Math.round(vis/total*100);
  const bag=(s.bag||[]).filter(id=>ITEMS[id]&&!ITEMS[id].hidden),beat=BOSSES.filter(([id])=>id==='king'?s.bossDown:s.bosses&&s.bosses[id]);
  const st=[['레벨','Lv '+(s.stats.lv|0)],['플레이 시간',playTime(s.time)],['탐험률',pct+'%'],['모은 장비',bag.length+'개'],['쓰러뜨린 보스',beat.length+'마리'],['쓰러진 횟수',(s.deaths|0)+'번']];
  const wpn=(s.equip&&s.equip.weapon)||'traveler_sword';
  root.innerHTML=`
  <section class="panel">
    <div class="jhead"><div id="wpn"></div><div class="who"><h2>${esc(s.name||'모험가')}</h2><p>지금 ${esc(roomName((s.save&&s.save.room)||s.room))} 근처 · 들고 있는 검 ${esc(ITEMS[wpn]?ITEMS[wpn].name:'')}</p></div></div>
    <dl class="stats">${st.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd>${k==='탐험률'?`<div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>`:''}</div>`).join('')}</dl>
    <div class="btns"><a class="btn gold" href="${PLAY}">▶ 이어서 모험하기</a><button class="btn" id="shot" type="button">기록 이미지 저장</button></div>
  </section>
  <section class="panel"><h2>탐험한 지도</h2><p class="muted" style="margin-bottom:12px">가 본 곳만 보여요. 노란 테두리가 마지막으로 저장한 곳이에요.</p><div class="mapbox" id="map"></div></section>
  <section class="panel"><h2>쓰러뜨린 보스</h2>${beat.length?'<div class="bosses" id="bosses"></div>':'<p class="muted">아직 쓰러뜨린 보스가 없어요.</p>'}</section>
  <section class="panel"><h2>모은 장비</h2><div id="gear"></div><p class="muted" style="margin-top:14px">어딘가에 아직 찾지 못한 장비가 숨어 있을지도…</p></section>`;
  document.getElementById('wpn').append(Object.assign(pic('icon_'+wpn,96),{role:'img',ariaLabel:'들고 있는 검'}));
  const map=drawMap(s);map.style.width=map.width*2+'px';map.setAttribute('role','img');map.setAttribute('aria-label',`탐험한 지도, ${vis}곳`);
  document.getElementById('map').append(map);
  const bb=document.getElementById('bosses');
  if(bb)for(const [,nm,tex] of beat){const d=document.createElement('div');d.className='boss';d.append(pic(tex,64));d.append(nm);bb.append(d)}
  const gear=document.getElementById('gear');
  for(const sl of SLOTS){const own=bag.filter(id=>ITEMS[id].slot===sl);if(!own.length)continue;
    const h=document.createElement('p');h.className='slothead';h.textContent=SLOT_NAMES[sl];
    const g=document.createElement('div');g.className='items';
    for(const id of own){const d=document.createElement('div');d.className='item';d.append(pic('icon_'+id,32));
      const t=document.createElement('div');t.innerHTML=`${esc(ITEMS[id].name)}<small>${esc(statLine(ITEMS[id])||'')}</small>`;d.append(t);g.append(d)}
    gear.append(h,g)}
  document.getElementById('shot').onclick=()=>document.fonts.ready.then(()=>share(s,st));
}
