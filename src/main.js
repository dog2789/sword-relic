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
import {setMuted,isMuted,setVolume,getVolume} from './sfx.js';

let game;
/* 폰 화면 */
if(MOBILE){document.body.classList.add('mobile');document.querySelector('#start .go').textContent='▶ 터치해서 시작';document.querySelector('#start .keys').remove()}
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
  const k=b.dataset.k,on=v=>{VP[k]=v;b.classList.toggle('on',v)};let downAt=0,offT=0;
  b.addEventListener('pointerdown',e=>{e.preventDefault();clearTimeout(offT);downAt=performance.now();try{b.setPointerCapture(e.pointerId)}catch(_){};on(true);const s=document.getElementById('start');if(!s.hidden)s.hidden=true});
  // 아주 짧게 톡 쳐도 게임이 한 번은 보도록 최소 80ms는 눌린 채로
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>{clearTimeout(offT);offT=setTimeout(()=>on(false),Math.max(0,80-(performance.now()-downAt)))}));
  b.addEventListener('contextmenu',e=>e.preventDefault());
});

/* 아날로그 스틱: 가운데에서 손가락까지의 방향·거리로 ←→↑↓를 정함 (대각선은 두 방향 함께) */
const zone=document.getElementById('stickzone'),stick=document.getElementById('stick'),knob=stick.querySelector('.knob');
const setD=(k,v)=>{VP[k]=v};
const stickAt=e=>{const r=stick.getBoundingClientRect(),R=r.width/2,lim=R*0.55;
  let dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R);const d=Math.hypot(dx,dy);if(d>lim){dx*=lim/d;dy*=lim/d}
  knob.style.transform='translate('+dx+'px,'+dy+'px)';
  const nx=dx/lim,ny=dy/lim;   // -1 ~ 1
  const h=Math.abs(nx)>0.35&&Math.abs(nx)>Math.abs(ny)*0.4,v=Math.abs(ny)>0.5;   // 45° 근처는 둘 다 → 대각선
  setD('left',h&&nx<0);setD('right',h&&nx>0);setD('up',v&&ny<0);setD('down',v&&ny>0)};
let stId=null;
// 엄지를 댄 자리로 스틱을 옮김 (영역 밖으로 삐져나가지 않게)
const placeStick=e=>{const z=zone.getBoundingClientRect(),w=stick.offsetWidth,h=w/2;
  const x=Math.max(h,Math.min(z.width-h,e.clientX-z.left)),y=Math.max(h,Math.min(z.height-h,e.clientY-z.top));
  stick.style.left=(x-h)+'px';stick.style.top=(y-h)+'px';stick.style.bottom='auto';stick.style.right='auto'};
zone.addEventListener('pointerdown',e=>{e.preventDefault();if(stId!==null)return;stId=e.pointerId;try{zone.setPointerCapture(e.pointerId)}catch(_){};
  if(e.target===zone)placeStick(e);stick.classList.add('on');stickAt(e);if(!startBtn.hidden)startBtn.hidden=true});
zone.addEventListener('pointermove',e=>{if(e.pointerId===stId)stickAt(e)});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>zone.addEventListener(ev,e=>{if(e.pointerId!==stId)return;stId=null;stick.classList.remove('on');knob.style.transform='';
  stick.style.left=stick.style.top=stick.style.bottom=stick.style.right='';['left','right','up','down'].forEach(k=>setD(k,false))}));

/* 위쪽 버튼 줄: 게임 HUD처럼 실제 아이템 아이콘과 개수를 보여 줌 */
const pixSvg=(rows,pal)=>{let r='';rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(pal[c])r+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+pal[c]+'"/>'}));
  return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+Math.max(...rows.map(r=>r.length))+' '+rows.length+'" shape-rendering="crispEdges">'+r+'</svg>')};
const MAP_IC=pixSvg(['..kkkkkkkk..','.kppppppppk.','kpprrpppbppk','kpprpppppppk','kppprrppgppk','kppppprpggpk','kpbpppprpppk','kppppppprrpk','kppgppppppxk','.kppppppppk.','..kkkkkkkk..'],{k:'#2a1a12',p:'#e8d0a0',r:'#c0503a',b:'#5a8acd',g:'#4a9a5a',x:'#e0404f'});
const SND_ON=pixSvg(['......kk...','.....kyk...','....kyyk..w','.kkkyyyk.w.','.kyyyyyk.ww','.kyyyyyk...','.kkkyyyk.ww','....kyyk.w.','.....kyk..w','......kk...'],{k:'#2a1a12',y:'#e8c04a',w:'#8fe3ff'});
const SND_OFF=pixSvg(['......kk...','.....kyk...','....kyyk...','.kkkyyyk.r.r','.kyyyyyk..r.','.kyyyyyk..r.','.kkkyyyk.r.r','....kyyk...','.....kyk...','......kk...'],{k:'#2a1a12',y:'#8a7a5a',r:'#e0404f'});
document.getElementById('ic-map').src=MAP_IC;
document.getElementById('ic-jump').src=pixSvg(['....kk....','...kwwk...','..kwwwwk..','.kwwkkwwk.','kwwk..kwwk','kkk.kk.kkk','...kwwk...','..kwwwwk..','.kwwkkwwk.','kwwk..kwwk','kkk....kkk'],{k:'#0b1a2a',w:'#8fe3ff'});
document.getElementById('ic-skill').src=pixSvg(['....kk....','....ky....','...kyyk...','kkkyyyykkk','kyyyyyyyyk','.kyyyyyyk.','..kyyyyk..','.kyyk.kyk.','.kyk...kyk','kk.......k'],{k:'#2a1a12',y:'#ffe27a'});
/* 가로 화면: 장비창·지도·대화 같은 창이 열리면 위쪽 버튼 줄이 창(탭)을 가리지 않게 숨김 */
setInterval(()=>{if(!MOBILE||!game)return;const sc=game.scene.keys.play,on=!!(sc&&sc.sys.isActive()&&sc.overlayOpen&&sc.overlayOpen());
  document.body.classList.toggle('ovl',on||!(sc&&sc.sys.isActive()))},150);   // 타이틀·인트로에서도 화면 누르기를 막지 않게
const icons={},iconOf=id=>{if(!game||!id)return'';const k='icon_'+id;if(icons[k])return icons[k];if(!game.textures.exists(k))return'';return icons[k]=game.textures.getBase64(k)};
const slotEls=[...document.querySelectorAll('.slots .slot')],eqImg=document.getElementById('ic-equip'),atkImg=document.getElementById('ic-atk');
let lastHud='';
setInterval(()=>{if(!MOBILE||!game)return;
  const key=JSON.stringify([STATE.quick,STATE.items,STATE.equip&&STATE.equip.weapon]);if(key===lastHud)return;lastHud=key;
  slotEls.forEach((b,i)=>{const id=STATE.quick&&STATE.quick[i],n=id?(STATE.items[id]||0):0,img=b.querySelector('img'),src=iconOf(id);
    img.hidden=!src;if(src&&img.src!==src)img.src=src;b.querySelector('b').textContent=id?n:'';b.classList.toggle('empty',!id||n<=0)});
  const w=iconOf(STATE.equip&&STATE.equip.weapon)||iconOf('traveler_sword');if(w&&eqImg.src!==w){eqImg.src=w;atkImg.src=w}},400);
/* 폰에서 길게 누르기·두 번 눌러 확대 막기 */
if(MOBILE){['contextmenu','selectstart','dblclick'].forEach(t=>document.addEventListener(t,e=>e.preventDefault()));
  document.addEventListener('touchmove',e=>{if(e.touches.length>1||e.target.closest('#stage,.pad'))e.preventDefault()},{passive:false});
  // 조작판을 누른 손가락이 Phaser까지 가지 않게 (Phaser는 캔버스 밖 터치도 받아서, 가로 화면에서 버튼 아래 메뉴 줄이 같이 눌림)
  document.querySelector('.pad').addEventListener('touchstart',e=>{if(e.target!==e.currentTarget)e.preventDefault()},{passive:false})}

/* 설정 창: 소리 끄기·배경음악·효과음 음량, 폰은 버튼 크기 (모두 브라우저에 기억됨). 여는 동안 게임은 멈춤 */
const dlg=document.getElementById('setdlg'),$=id=>document.getElementById(id);
const padMute=$('padmute'),padMuteLabel=()=>{$('ic-snd').src=isMuted()?SND_OFF:SND_ON;padMute.classList.toggle('off',isMuted())};padMuteLabel();
const setBS=v=>{document.body.style.setProperty('--bs',v);$('set-bs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.v===String(v))))};
try{const v=parseFloat(localStorage.getItem('sr_bs'));setBS([0.85,1,1.15].includes(v)?v:1)}catch(_){setBS(1)}
const showVol=()=>{for(const k of ['m','f']){const n=Math.round(getVolume(k)*100);$('set-'+k).value=n;$('set-'+k+'-v').textContent=n}$('set-mute').checked=isMuted()};
const openSet=()=>{if(dlg.open)return;showVol();dlg.showModal();if(game)game.pause()};
const closeSet=()=>{if(dlg.open)dlg.close()};
dlg.addEventListener('close',()=>{if(game)game.resume();window.focus()});
dlg.addEventListener('click',e=>{if(e.target===dlg)closeSet()});   // 바깥(어두운 곳) 누르면 닫힘
dlg.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeSet()}});
$('set-close').addEventListener('click',closeSet);
$('set-mute').addEventListener('change',e=>{setMuted(e.target.checked);padMuteLabel()});
for(const k of ['m','f'])$('set-'+k).addEventListener('input',e=>{setVolume(k,e.target.value/100);$('set-'+k+'-v').textContent=e.target.value});
$('set-bs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;setBS(parseFloat(b.dataset.v));try{localStorage.setItem('sr_bs',b.dataset.v)}catch(_){}});
$('mute').addEventListener('click',e=>{e.currentTarget.blur();openSet()});
padMute.addEventListener('pointerdown',e=>{e.preventDefault();openSet()});

/* 처음부터: 두 번 눌러야 실행 (실수 방지) */
const ng=document.getElementById('newgame');let ngArm=0;
ng.addEventListener('click',()=>{
  if(!ngArm){ngArm=1;ng.textContent='한 번 더 누르면 초기화';setTimeout(()=>{ngArm=0;ng.textContent='처음부터'},2500);return}
  ngArm=0;ng.textContent='처음부터';newGame();
  if(game){game.scene.getScenes(true).forEach(s=>game.scene.stop(s.scene.key));game.scene.start('title')}ng.blur();window.focus();
});

/* 디버그용: 브라우저 콘솔에서 SR.scene 으로 현재 장면 접근 */
window.SR={get game(){return game},get scene(){return game&&game.scene.keys.play},get state(){return STATE},items:ITEMS};

/* 홈 화면에 추가(PWA): 배포판에서만 서비스 워커를 켬 (개발 중엔 캐시가 헷갈리게 함) */
if(import.meta.env.PROD&&'serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
