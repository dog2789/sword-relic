import Phaser from 'phaser';
import './style.css';
import {W,H,GRAV,VP} from './config.js';
import {calcZoom} from './zoom.js';
import {HERO_W,HERO_H,HAIR_STYLES,LOOK_OPTS,LOOK,drawHero,saveLook} from './gfx/hero.js';
import {PlayScene} from './scenes/PlayScene.js';
import {TitleScene,paintHeroFrames} from './scenes/TitleScene.js';
import {IntroScene} from './scenes/IntroScene.js';
import {STATE,newGame} from './state.js';

let game;
function boot(){
  game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,zoom:calcZoom(),pixelArt:true,roundPixels:true,backgroundColor:'#0d0a1a',
    physics:{default:'arcade',arcade:{gravity:{y:GRAV},debug:false}},input:{activePointers:4},scene:[TitleScene,IntroScene,PlayScene]});
}
window.addEventListener('resize',()=>{if(!game)return;const z=calcZoom();game.scale.setZoom(z);const sc=game.scene.keys.play;if(sc&&sc.nameTxt&&sc.sys.isActive())sc.setTextRes(z)});
(document.fonts?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]):Promise.resolve()).then(boot);

document.getElementById('start').addEventListener('click',e=>{e.currentTarget.hidden=true;window.focus();});
/* character maker */
const pv=document.getElementById('pv'),pvx=pv.getContext('2d');let pvFrame=0;
const activeScene=()=>game&&game.scene.getScenes(true)[0];
const playScene=()=>{const sc=game&&game.scene.keys.play;return sc&&sc.sys.isActive()&&sc.player?sc:null};
function drawPreview(){pvx.clearRect(0,0,HERO_W,HERO_H);drawHero(pvx,pvFrame?'idle1':'idle0',LOOK,STATE.equip)}
setInterval(()=>{pvFrame^=1;drawPreview()},420);
function applyLook(){saveLook();
  drawPreview();const sc=playScene();if(sc)sc.redrawHero();else{const a=activeScene();if(a&&a.scene.key==='title')paintHeroFrames(a)}
  document.querySelectorAll('.maker [data-opt]').forEach(b=>b.classList.toggle('on',LOOK[b.dataset.opt]===+b.dataset.i))}
function buildMaker(){
  const mk=(id,opt,items,isSw)=>{const box=document.getElementById(id);items.forEach((it,i)=>{const b=document.createElement('button');b.type='button';
    b.dataset.opt=opt;b.dataset.i=i;if(isSw){b.className='sw';b.style.background=it[1];b.setAttribute('aria-label',it[0])}else{b.className='chip';b.textContent=it}
    b.addEventListener('click',()=>{LOOK[opt]=i;applyLook()});box.appendChild(b)})};
  mk('o-style','style',HAIR_STYLES.map(h=>h.name));
  ['hair','skin','top','bottom','shoes'].forEach(o=>mk('o-'+o,o,LOOK_OPTS[o],true));
  document.getElementById('rand').addEventListener('click',()=>{LOOK.style=Math.random()*HAIR_STYLES.length|0;for(const o in LOOK_OPTS)LOOK[o]=Math.random()*LOOK_OPTS[o].length|0;applyLook()});
  applyLook();
}
buildMaker();
window.onEquipChange=()=>drawPreview();
document.getElementById('testgear').addEventListener('click',e=>{const sc=playScene();if(sc)sc.giveAllForTest();e.currentTarget.blur();window.focus()});
document.querySelectorAll('.pbtn').forEach(b=>{
  const k=b.dataset.k,on=v=>{VP[k]=v;b.classList.toggle('on',v)};
  b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){};on(true);const s=document.getElementById('start');if(!s.hidden)s.hidden=true});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>on(false)));
  b.addEventListener('contextmenu',e=>e.preventDefault());
});

/* 처음부터: 두 번 눌러야 실행 (실수 방지) */
const ng=document.getElementById('newgame');let ngArm=0;
ng.addEventListener('click',()=>{
  if(!ngArm){ngArm=1;ng.textContent='한 번 더 누르면 초기화';setTimeout(()=>{ngArm=0;ng.textContent='처음부터'},2500);return}
  ngArm=0;ng.textContent='처음부터';newGame();
  if(game){game.scene.getScenes(true).forEach(s=>game.scene.stop(s.scene.key));game.scene.start('title')}drawPreview();ng.blur();window.focus();
});

/* 디버그용: 브라우저 콘솔에서 SR.scene 으로 현재 장면 접근 */
window.SR={get game(){return game},get scene(){return game&&game.scene.keys.play},get state(){return STATE}};
