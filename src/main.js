import Phaser from 'phaser';
import './style.css';
import {W,H,GRAV,VP} from './config.js';
import {calcScale,RS} from './zoom.js';
import {PlayScene} from './scenes/PlayScene.js';
import {TitleScene} from './scenes/TitleScene.js';
import {IntroScene} from './scenes/IntroScene.js';
import {CustomizeScene} from './scenes/CustomizeScene.js';
import {STATE,newGame} from './state.js';
import {ITEMS} from './data/items.js';
import {loadFonts} from './fonts.js';

let game;
function boot(){
  const sc=calcScale();RS.S=sc.S;
  game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*sc.S,height:H*sc.S,zoom:sc.css/sc.S,pixelArt:true,roundPixels:true,backgroundColor:'#0d0a1a',
    physics:{default:'arcade',arcade:{gravity:{y:GRAV},debug:false}},input:{activePointers:4},scene:[TitleScene,CustomizeScene,IntroScene,PlayScene]});
}
/* 창 크기가 바뀌면 렌더 배율(S)과 표시 배율을 다시 계산 */
let rzT=0;
window.addEventListener('resize',()=>{if(!game)return;clearTimeout(rzT);rzT=setTimeout(()=>{
  const sc=calcScale();if(sc.S!==RS.S){RS.S=sc.S;game.scale.resize(W*sc.S,H*sc.S)}game.scale.setZoom(sc.css/sc.S)},120)});
Promise.race([Promise.all([loadFonts(),document.fonts?document.fonts.ready:null]),new Promise(r=>setTimeout(r,4000))]).then(boot);

/* 시작 버튼: 누른 클릭이 아래 타이틀 메뉴까지 눌러버리지 않게 막음 */
const startBtn=document.getElementById('start');
const hideStart=e=>{e.preventDefault();e.stopPropagation();startBtn.hidden=true;window.focus()};
['pointerdown','mousedown','touchstart'].forEach(t=>startBtn.addEventListener(t,hideStart,{passive:false}));
const playScene=()=>{const sc=game&&game.scene.keys.play;return sc&&sc.sys.isActive()&&sc.player?sc:null};
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
  if(game){game.scene.getScenes(true).forEach(s=>game.scene.stop(s.scene.key));game.scene.start('title')}ng.blur();window.focus();
});

/* 디버그용: 브라우저 콘솔에서 SR.scene 으로 현재 장면 접근 */
window.SR={get game(){return game},get scene(){return game&&game.scene.keys.play},get state(){return STATE},items:ITEMS};
