import Phaser from 'phaser';
import './style.css';
import {W,H,GRAV,VP,MOBILE} from './config.js';
import {calcScale,RS} from './zoom.js';
import {PlayScene} from './scenes/PlayScene.js';
import {TitleScene} from './scenes/TitleScene.js';
import {IntroScene} from './scenes/IntroScene.js';
import {CustomizeScene} from './scenes/CustomizeScene.js';
import {STATE,newGame} from './state.js';
import {ITEMS} from './data/items.js';
import {loadFonts} from './fonts.js';
import {setMuted,isMuted} from './sfx.js';

let game;
/* 폰 화면 */
if(MOBILE){document.body.classList.add('mobile');document.querySelector('#start span').innerHTML='▶ 터치해서 시작'}
/* 오류가 나면 화면에 보여 줌 (폰에서는 콘솔을 볼 수 없어서) */
let errShown=false;
const showErr=msg=>{if(errShown)return;errShown=true;const d=document.createElement('div');d.className='errbox';
  d.textContent='오류가 났어요: '+msg+'  (화면을 누르면 다시 불러옴)';d.addEventListener('click',()=>location.reload());document.getElementById('stage').appendChild(d)};
window.addEventListener('error',e=>showErr((e.message||'')+' @'+(e.filename||'').split('/').pop()+':'+(e.lineno||'')));
window.addEventListener('unhandledrejection',e=>showErr(String(e.reason&&e.reason.message||e.reason)));
function boot(){
  const sc=calcScale();RS.S=sc.S;
  game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*sc.S,height:H*sc.S,zoom:sc.css/sc.S,pixelArt:true,roundPixels:true,backgroundColor:'#0d0a1a',
    physics:{default:'arcade',arcade:{gravity:{y:GRAV},debug:false}},input:{activePointers:4},audio:{noAudio:true},scene:[TitleScene,CustomizeScene,IntroScene,PlayScene]});
  // 아이폰은 메모리가 모자라면 그래픽(WebGL)을 끊어 버려서 화면이 까매짐 → 4초 안에 안 돌아오면 알리고 다시 불러오기
  let lostT=0;game.canvas.addEventListener('webglcontextlost',()=>{clearTimeout(lostT);lostT=setTimeout(()=>showErr('그래픽 메모리가 부족해서 화면이 끊겼어요'),4000)});
  game.canvas.addEventListener('webglcontextrestored',()=>clearTimeout(lostT));   // Phaser가 스스로 되살리면 그냥 넘어감
}
/* 창 크기가 바뀌면 렌더 배율(S)과 표시 배율을 다시 계산 */
let rzT=0;
const refit=()=>{if(!game)return;const sc=calcScale();if(sc.S!==RS.S){RS.S=sc.S;game.scale.resize(W*sc.S,H*sc.S)}game.scale.setZoom(sc.css/sc.S)};
const onResize=()=>{clearTimeout(rzT);rzT=setTimeout(refit,120);setTimeout(refit,600)};   // 폰을 돌린 직후엔 크기가 늦게 바뀌어서 한 번 더
window.addEventListener('resize',onResize);window.addEventListener('orientationchange',onResize);
Promise.race([Promise.all([loadFonts(),document.fonts?document.fonts.ready:null]),new Promise(r=>setTimeout(r,4000))]).then(boot);

/* 시작 버튼: 누른 클릭이 아래 타이틀 메뉴까지 눌러버리지 않게 막음 */
const startBtn=document.getElementById('start');
const hideStart=e=>{e.preventDefault();e.stopPropagation();startBtn.hidden=true;window.focus();
  // 안드로이드: 전체 화면 + 가로 고정 (아이폰 사파리는 지원 안 함 → 홈 화면에 추가하면 전체 화면)
  if(MOBILE&&document.documentElement.requestFullscreen&&!document.fullscreenElement)
    document.documentElement.requestFullscreen({navigationUI:'hide'}).then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape')).catch(()=>{}).finally(onResize)};
['pointerdown','mousedown','touchstart'].forEach(t=>startBtn.addEventListener(t,hideStart,{passive:false}));
const playScene=()=>{const sc=game&&game.scene.keys.play;return sc&&sc.sys.isActive()&&sc.player?sc:null};
document.getElementById('testgear').addEventListener('click',e=>{const sc=playScene();if(sc)sc.giveAllForTest();e.currentTarget.blur();window.focus()});
document.querySelectorAll('.pbtn[data-k]').forEach(b=>{
  const k=b.dataset.k,on=v=>{VP[k]=v;b.classList.toggle('on',v)};
  b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){};on(true);const s=document.getElementById('start');if(!s.hidden)s.hidden=true});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>on(false)));
  b.addEventListener('contextmenu',e=>e.preventDefault());
});

/* 방향 패드: 가운데에서 손가락이 어느 쪽에 있는지로 방향을 정함 (대각선 = 두 방향) */
const dp=document.getElementById('dpad'),arms={};dp.querySelectorAll('span').forEach(s=>arms[s.dataset.d]=s);
const setD=(k,v)=>{if(VP[k]!==v){VP[k]=v;arms[k].classList.toggle('on',v)}};
const dpAt=e=>{const r=dp.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),dead=r.width*0.12;
  const far=Math.hypot(dx,dy)>dead,ang=Math.atan2(Math.abs(dy),Math.abs(dx))*180/Math.PI;   // 0 = 수평, 90 = 수직
  const h=far&&ang<62,v=far&&ang>32;   // 32~62도는 대각선
  setD('left',h&&dx<0);setD('right',h&&dx>0);setD('up',v&&dy<0);setD('down',v&&dy>0)};
let dpId=null;
dp.addEventListener('pointerdown',e=>{e.preventDefault();dpId=e.pointerId;try{dp.setPointerCapture(e.pointerId)}catch(_){};dpAt(e);if(!startBtn.hidden)startBtn.hidden=true});
dp.addEventListener('pointermove',e=>{if(e.pointerId===dpId)dpAt(e)});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>dp.addEventListener(ev,e=>{if(e.pointerId!==dpId)return;dpId=null;['left','right','up','down'].forEach(k=>setD(k,false))}));
/* 폰에서 길게 누르기·두 번 눌러 확대 막기 */
if(MOBILE){['contextmenu','selectstart','dblclick'].forEach(t=>document.addEventListener(t,e=>e.preventDefault()));
  document.addEventListener('touchmove',e=>{if(e.touches.length>1||e.target.closest('#stage,.pad'))e.preventDefault()},{passive:false})}

/* 소리 켜기/끄기 (효과음 + 배경음악, 브라우저에 기억됨) */
const muteBtn=document.getElementById('mute');
const muteLabel=()=>{muteBtn.textContent=isMuted()?'소리 켜기':'소리 끄기'};muteLabel();
muteBtn.addEventListener('click',e=>{setMuted(!isMuted());muteLabel();padMuteLabel();e.currentTarget.blur();window.focus()});
const padMute=document.getElementById('padmute'),padMuteLabel=()=>{padMute.textContent=isMuted()?'♪ 끔':'♪';padMute.classList.toggle('off',isMuted())};padMuteLabel();
padMute.addEventListener('pointerdown',e=>{e.preventDefault();setMuted(!isMuted());muteLabel();padMuteLabel()});

/* 처음부터: 두 번 눌러야 실행 (실수 방지) */
const ng=document.getElementById('newgame');let ngArm=0;
ng.addEventListener('click',()=>{
  if(!ngArm){ngArm=1;ng.textContent='한 번 더 누르면 초기화';setTimeout(()=>{ngArm=0;ng.textContent='처음부터'},2500);return}
  ngArm=0;ng.textContent='처음부터';newGame();
  if(game){game.scene.getScenes(true).forEach(s=>game.scene.stop(s.scene.key));game.scene.start('title')}ng.blur();window.focus();
});

/* 디버그용: 브라우저 콘솔에서 SR.scene 으로 현재 장면 접근 */
window.SR={get game(){return game},get scene(){return game&&game.scene.keys.play},get state(){return STATE},items:ITEMS};
