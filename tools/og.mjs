// 공유 미리보기 그림 public/og.png (1200×630) 만들기: 초원에서 적월 세트로 슬라임을 베는 장면 + 제목
// 사용: npx vite build && npx vite preview --port 4220 후  node tools/og.mjs  (playwright-core·Edge 필요)
import {chromium} from 'playwright-core';import fs from 'node:fs';
const b=await chromium.launch({channel:'msedge'});
const pg=await (await b.newContext({serviceWorkers:'block',viewport:{width:1400,height:1000},deviceScaleFactor:2})).newPage();
await pg.goto('http://localhost:4220/play/');await pg.waitForTimeout(3500);
await pg.evaluate(()=>{localStorage.removeItem('sr_save2');document.getElementById('start').hidden=true;SR.game.scene.getScenes(false).forEach(s=>SR.game.scene.stop(s.scene.key));SR.game.scene.start('play',{room:'r2',entry:'left'})});
await pg.waitForTimeout(3000);
const ok=await pg.evaluate(()=>{const s=SR.scene,p=s.player;s.dlg=null;s.physics.world.resume();s.giveAllForTest();
  [['weapon','blood_sword'],['helm','blood_helm'],['armor','blood_armor'],['boots','blood_boots']].forEach(([a,i])=>s.setEquip(a,i));s.stats.hp=s.mhp();p.inv=1e9;
  const M=s.map,C=M[0].length,flat=(tx,ty)=>[-2,-1,0,1,2,3].every(d=>M[ty][tx+d]==='#'&&[1,2,3,4].every(k=>M[ty-k][tx+d]==='.'));
  for(let tx=Math.round(C*0.4);tx<C-12;tx++)for(let ty=13;ty>=5;ty--)if(flat(tx,ty)){p.body.reset(tx*16+8,ty*16-14);s.facing=1;p.setFlipX(false);
    const es=s.enemies.getChildren();es.forEach((e,i)=>{if(i===0&&!e.mob){e.body.reset(p.x+30,ty*16-8);e.setVelocity(0,0);e.nextHop=s.time.now+9e5}else e.destroy()});
    if(s.uiCam)s.uiCam.setVisible(false);return{tx,ty,slime:es.length}}
  return null});
console.log(JSON.stringify(ok));await pg.waitForTimeout(700);
await pg.keyboard.down('KeyZ');await pg.waitForTimeout(130);
const bb=await pg.locator('#game canvas').boundingBox();
const shot=await pg.screenshot({clip:{x:bb.x,y:bb.y,width:bb.width,height:Math.floor(bb.height*156/180)}});await pg.keyboard.up('KeyZ');
// 제목을 얹어 1200×630으로
const font=fs.readFileSync('public/fonts/Galmuri11-Bold.woff2').toString('base64');
const og=await (await b.newContext({viewport:{width:1200,height:630}})).newPage();
await og.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block">
<style>@font-face{font-family:G;src:url(data:font/woff2;base64,${font})}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0e0b18;position:relative}
img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:60% 50%;image-rendering:pixelated}
.sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,11,24,.96) 0%,rgba(14,11,24,.9) 28%,rgba(14,11,24,0) 50%)}
.t{position:absolute;left:72px;top:150px}
h1{margin:0;font:400 84px/1.22 "Press Start 2P";color:#e8c04a;text-shadow:6px 6px 0 #000}
.k{margin:34px 0 0;font:700 40px G;color:#ece7f7;letter-spacing:.28em}
.s{margin:14px 0 0;font:700 30px G;color:#cfc7e6}
.b{position:absolute;left:0;right:0;bottom:0;height:8px;background:#e8c04a}</style>
<img src="data:image/png;base64,${shot.toString('base64')}"><div class="sh"></div>
<div class="t"><h1>SWORD<br>RELIC</h1><p class="k">소드 레릭</p><p class="s">전설의 검을 찾아 떠나는 모험</p></div><div class="b"></div>`);
await og.evaluate(()=>document.fonts.ready);await og.waitForTimeout(800);
await og.screenshot({path:'public/og.png'});await b.close();console.log('public/og.png');
