// 사용: npx vite build && npx vite preview --port 4220 후  node tools/site-shots.mjs [이름,이름]  (playwright-core·Edge 필요)
// 소개·가이드용 스크린샷 다시 찍기: 주인공을 안전한 땅 위(가시·물·용암·사다리·지형 겹침 없이)에 세우고, 적월/흑월 세트를 입힘
import {chromium} from 'playwright-core';
const OUT='C:/wooj/sword-relic/sword-relic/public/shots/',only=process.argv[2];
const SETS={blood:['blood_sword','blood_helm','blood_armor','blood_boots'],moon:['moon_sword','moon_helm','moon_armor','moon_boots']};
const LIST=[['meadow','r3','left',0.35,'blood'],['village','v1','start',0.34,'moon'],['treetop','t2','left',0.45,'blood'],['cave','c7','left',0.3,'moon'],
  ['castle','k6','left',0.3,'blood'],['ice','i3','left',0.3,'moon'],['desert','d4','start',0.25,'blood'],['lava','l5','right',0.3,'moon',11],['sky','s3','left',0.15,'blood']];
const b=await chromium.launch({channel:'msedge'});const pg=await (await b.newContext({serviceWorkers:'block',viewport:{width:1400,height:1000},deviceScaleFactor:2})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:4220/play/');await pg.waitForTimeout(3500);
for(const [name,room,en,frac,set,minTy=3] of LIST){if(only&&!only.split(',').includes(name))continue;
  await pg.evaluate(([room,en])=>{localStorage.removeItem('sr_save2');document.getElementById('start').hidden=true;SR.game.scene.getScenes(false).forEach(s=>SR.game.scene.stop(s.scene.key));SR.game.scene.start('play',{room,entry:en})},[room,en]);
  await pg.waitForTimeout(3000);
  const spot=await pg.evaluate(([frac,ids,minTy])=>{const s=SR.scene,p=s.player;s.dlg=null;(s.dlgObjs||[]).forEach(o=>o.destroy&&o.destroy());s.physics.world.resume();
    s.giveAllForTest();['weapon','helm','armor','boots'].forEach((sl,i)=>s.setEquip(sl,ids[i]));s.setEquip('acc','red_ring');s.stats.hp=s.mhp();p.inv=1e9;
    // 설 수 있는 땅: 단단한 칸 위로 3칸이 비어 있고, 양옆 칸도 똑같음 (가시·물·용암·모래·사다리·덩굴 제외)
    const M=s.map,C=M[0].length,solid=c=>'#-='.includes(c),empty=c=>c==='.';
    const ok=(tx,ty)=>tx>0&&tx<C-1&&[-1,0,1].every(d=>solid(M[ty][tx+d])&&[1,2,3].every(k=>ty-k>=0&&empty(M[ty-k][tx+d])));
    const want=Math.round(C*frac);
    for(let r=0;r<C;r++)for(const tx of [want+r,want-r]){if(tx<2||tx>C-3)continue;for(let ty=13;ty>=minTy;ty--)if(ok(tx,ty)){p.body.reset(tx*16+8,ty*16-14);return{tx,ty}}}
    return null},[frac,SETS[set],minTy]);
  await pg.waitForTimeout(name==='castle'?700:1500);
  const chk=await pg.evaluate(()=>{const s=SR.scene,p=s.player,b=p.body;
    // 주인공 몸과 겹치는 몬스터는 치움 (화면에서 서로 겹쳐 보이지 않게)
    const near=e=>Math.abs(e.x-p.x)<96&&Math.abs(e.y-p.y)<64;s.enemies.getChildren().forEach(e=>{if(!e.boss&&near(e))e.destroy()});s.children.list.forEach(o=>{if(o.texture&&/^kn_mantis/.test(o.texture.key)&&near(o))o.setVisible(false)});
    const under=s.tileAt(p.x,b.bottom+2),inT=[s.tileAt(b.left+1,b.top+1),s.tileAt(b.right-1,b.top+1),s.tileAt(b.left+1,b.bottom-1),s.tileAt(b.right-1,b.bottom-1)];
    if(s.uiCam)s.uiCam.setVisible(false);s.scene.pause();p.setAlpha(1);p.clearTint();
    return{ground:b.blocked.down,under,inside:inT.join(''),x:Math.round(p.x),boss:s.enemies.getChildren().filter(e=>e.boss).map(e=>Math.round(e.x)).join(',')}});
  await pg.waitForTimeout(60);
  const bb=await pg.locator('#game canvas').boundingBox();
  await pg.screenshot({path:OUT+name+'.png',clip:{x:bb.x,y:bb.y,width:bb.width,height:Math.floor(bb.height*156/180)}});
  console.log(name,room,set,JSON.stringify(spot),JSON.stringify(chk));
}
console.log('errors',errs.slice(0,3));await b.close();
