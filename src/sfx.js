/* 레트로 효과음: 파일 없이 Web Audio로 그 자리에서 합성
   - 브라우저(특히 모바일)는 사용자가 처음 누르거나 터치한 뒤에야 소리를 낼 수 있어서, 첫 입력 때 AudioContext를 깨움
   - 같은 소리가 한 프레임에 여러 번 겹치면 시끄러워서 소리마다 최소 간격(gap)을 둠 */
let ctx=null,master=null,noiseBuf=null,musicBus=null;
const last={};
let muted=false;
try{muted=localStorage.getItem('sr_mute')==='1'}catch(_){}
// 음량 (0~1): m 배경음악, f 효과음
const vol={m:1,f:1};
try{const v=JSON.parse(localStorage.getItem('sr_vol')||'{}');for(const k in vol)if(typeof v[k]==='number')vol[k]=Math.min(1,Math.max(0,v[k]))}catch(_){}
const applyVol=()=>{if(master)master.gain.value=muted?0:0.35*vol.f;if(musicBus)musicBus.gain.value=muted?0:vol.m};

function init(){
  if(ctx)return ctx;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  // 'interactive'(기본값)는 버퍼가 아주 작아서 컴퓨터가 잠깐만 바빠도 소리가 비고 지지직거림 → 조금 넉넉한 'balanced'
  try{ctx=new AC({latencyHint:'balanced'})}catch(_){ctx=new AC()}
  master=ctx.createGain();// 마지막에 리미터: 효과음과 음악이 한꺼번에 겹쳐도 소리가 찢어지지(뿌직) 않게 눌러 줌
  const lim=ctx.createDynamicsCompressor();lim.threshold.value=-8;lim.knee.value=4;lim.ratio.value=16;lim.attack.value=0.002;lim.release.value=0.12;lim.connect(ctx.destination);
  master.connect(lim);
  musicBus=ctx.createGain();musicBus.connect(lim);applyVol();
  // 하얀 잡음 1초짜리를 한 번 만들어 두고 계속 재사용
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  return ctx;
}
let unlocked=false;
function unlock(){const c=init();unlocked=true;if(c&&c.state!=='running'&&c.state!=='closed')c.resume().catch(()=>{})}
/* 감시: 소리 장치가 바뀌거나 창을 오가는 등으로 오디오가 멈춰 있으면 1초마다 다시 켬 (다른 탭에 있을 땐 그대로 둠) */
setInterval(()=>{if(ctx&&unlocked&&!document.hidden&&ctx.state!=='running'&&ctx.state!=='closed')ctx.resume().catch(()=>{})},1000);
/* 배경음악(bgm.js)이 같은 AudioContext를 쓰도록 꺼내 줌 */
export function audio(){return init()?{ctx,musicBus,noiseBuf}:null}
/* 다른 탭으로 가면 소리를 멈추고, 돌아오면 다시 켬 */
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend().catch(()=>{});else if(unlocked)ctx.resume().catch(()=>{})});
['pointerdown','touchstart','keydown','mousedown'].forEach(t=>window.addEventListener(t,unlock,{capture:true,passive:true}));

/* 기본 재료: 사각·삼각·톱니파 한 음 (주파수가 f0 → f1로 미끄러짐) */
function tone({type='square',f0,f1=f0,t=0,dur=0.1,vol=0.3,att=0.004,slide='exp'}){
  const now=ctx.currentTime+t,o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(f0,now);
  if(f1!==f0){if(slide==='exp')o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),now+dur);else o.frequency.linearRampToValueAtTime(f1,now+dur)}
  g.gain.setValueAtTime(0.0001,now);g.gain.exponentialRampToValueAtTime(vol,now+att);g.gain.exponentialRampToValueAtTime(0.0001,now+dur);
  o.connect(g).connect(master);o.start(now);o.stop(now+dur+0.02);live++;o.onended=()=>live--;
}
/* 잡음 한 번 (필터로 높낮이 조절, 필터 주파수도 미끄러지게 할 수 있음) */
function noise({t=0,dur=0.1,vol=0.3,ftype='bandpass',f0=2000,f1=f0,q=1,att=0.003}){
  const now=ctx.currentTime+t,s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=noiseBuf;fl.type=ftype;fl.Q.value=q;fl.frequency.setValueAtTime(f0,now);
  if(f1!==f0)fl.frequency.exponentialRampToValueAtTime(Math.max(20,f1),now+dur);
  g.gain.setValueAtTime(0.0001,now);g.gain.exponentialRampToValueAtTime(vol,now+att);g.gain.exponentialRampToValueAtTime(0.0001,now+dur);
  s.connect(fl).connect(g).connect(master);s.start(now,Math.random()*0.5);s.stop(now+dur+0.02);live++;s.onended=()=>live--;
}

const SOUNDS={
  // 베기: 바람 가르는 잡음이 높은 데서 낮은 데로. 3단 베기(heavy)는 더 길고 묵직하게
  slash:o=>{const h=o&&o.heavy,r=1+(Math.random()*0.12-0.06);
    noise({dur:h?0.2:0.12,vol:h?0.32:0.24,f0:(h?3200:4200)*r,f1:h?500:900,q:1.4});
    if(h)tone({type:'triangle',f0:220,f1:90,dur:0.16,vol:0.12})},
  // 타격: 짧은 펑 + 낮게 떨어지는 사각파. 치명타는 위에 쨍한 음 하나 더
  hit:o=>{const c=o&&o.crit,h=o&&o.heavy;
    noise({dur:0.07,vol:0.3,ftype:'lowpass',f0:3000,f1:400});
    tone({f0:h?260:330,f1:h?60:90,dur:h?0.14:0.09,vol:0.2});
    if(c){tone({f0:1400,f1:1800,t:0.01,dur:0.09,vol:0.12});tone({f0:2100,t:0.05,dur:0.08,vol:0.08})}},
  // 점프: 위로 올라가는 짧은 음. 2단 점프는 더 높게, 벽 점프는 살짝 거칠게
  jump:o=>{const k=o&&o.kind;
    if(k==='double'){tone({f0:420,f1:900,dur:0.11,vol:0.16});tone({f0:630,f1:1350,t:0.05,dur:0.09,vol:0.08})}
    else if(k==='wall'){tone({f0:260,f1:620,dur:0.1,vol:0.16});noise({dur:0.05,vol:0.1,f0:1500})}
    else tone({f0:240,f1:560,dur:0.1,vol:0.16})},
  // 코인: 두 음 "띠링". 여러 개를 연달아 먹으면 조금씩 음이 올라감
  coin:o=>{const s=Math.min(6,(o&&o.step)||0),m=Math.pow(2,s/12);
    tone({f0:988*m,dur:0.06,vol:0.13});tone({f0:1319*m,t:0.055,dur:0.16,vol:0.13})},
  // 피격: 아래로 떨어지는 거친 톱니파 + 잡음
  hurt:()=>{tone({type:'sawtooth',f0:520,f1:110,dur:0.22,vol:0.2});noise({dur:0.12,vol:0.22,ftype:'lowpass',f0:2500,f1:300})},
  // 상자: 덜컥(뚜껑) 다음에 반짝이는 아르페지오
  chest:()=>{noise({dur:0.06,vol:0.25,ftype:'lowpass',f0:1200,f1:300});tone({type:'triangle',f0:140,f1:90,dur:0.08,vol:0.2});
    [523,659,784,1047].forEach((f,i)=>tone({f0:f,t:0.08+i*0.065,dur:0.12,vol:0.11}))},
  // 열쇠 문: 철컥 + 끼이익 열리는 소리
  door:()=>{noise({dur:0.04,vol:0.3,f0:3500,q:3});tone({f0:900,f1:700,dur:0.04,vol:0.12});
    tone({type:'sawtooth',f0:110,f1:180,t:0.07,dur:0.35,vol:0.09,slide:'lin'});noise({t:0.07,dur:0.35,vol:0.08,ftype:'lowpass',f0:600,f1:900})},
  // 보스 쓰러뜨림: 짧은 승리 팡파르
  fanfare:()=>{[[523,0],[659,0.1],[784,0.2],[1047,0.3]].forEach(([f,t])=>tone({f0:f,t,dur:0.1,vol:0.12}));
    tone({f0:1047,t:0.42,dur:0.5,vol:0.13});tone({f0:784,t:0.42,dur:0.5,vol:0.08});tone({type:'triangle',f0:131,t:0.42,dur:0.5,vol:0.2})},
  // 철문(누름판·횃불·보스 문): 무거운 쇠가 드르륵 올라감
  gate:()=>{tone({type:'square',f0:70,f1:95,dur:0.3,vol:0.12,slide:'lin'});noise({dur:0.3,vol:0.14,ftype:'lowpass',f0:400,f1:900});
    noise({t:0.28,dur:0.06,vol:0.2,f0:2000,q:2})},
  // C 스킬 쓸 때: 무기 기술(k)마다 다른 소리
  skill:o=>{const k=o.k,big=o.big;
    if(k==='wave'||k==='relic'){noise({dur:big?0.3:0.2,vol:0.26,f0:big?2600:4200,f1:big?400:800,q:1.2});
      tone({f0:big?330:520,f1:big?990:1300,dur:big?0.22:0.14,vol:0.1});if(big)tone({type:'triangle',f0:165,f1:330,dur:0.25,vol:0.12})}
    if(k==='relic')[784,988,1175,1568].forEach((f,i)=>tone({type:'triangle',f0:f,t:0.05+i*0.05,dur:0.4,vol:0.08}));
    if(k==='fan')[0,0.05,0.1].forEach(t=>noise({t,dur:0.18,vol:0.2,ftype:'lowpass',f0:2400,f1:300}));
    if(k==='crescent'){const d=o.dark?0.6:1;noise({dur:0.32,vol:0.2,f0:3000*d,f1:600*d,q:2});
      tone({type:'triangle',f0:880*d,f1:1760*d,dur:0.28,vol:0.1});tone({type:'sine',f0:1320*d,f1:660*d,t:0.08,dur:0.3,vol:0.07})}
    if(k==='lob')tone({type:'triangle',f0:300,f1:700,dur:0.12,vol:0.16});
    if(k==='boomerang')[0,0.13,0.26,0.39].forEach((t,i)=>noise({t,dur:0.1,vol:0.16-i*0.03,f0:2600,f1:1200,q:2}));
    if(k==='dash'){noise({dur:0.22,vol:0.28,ftype:'highpass',f0:800,f1:5000});tone({type:'sawtooth',f0:180,f1:900,dur:0.18,vol:0.1})}
    if(k==='breath'){noise({dur:0.75,vol:0.28,ftype:'lowpass',f0:600,f1:1800,att:0.06});noise({dur:0.75,vol:0.12,f0:300,q:0.6,att:0.04})}
    if(k==='erupt')tone({type:'triangle',f0:200,f1:120,dur:0.1,vol:0.12})},
  // 땅에서 솟는 기둥 하나 (얼음·용암·빛·번개)
  pillar:o=>{const fx=o.fx;
    if(fx==='ice'){noise({dur:0.1,vol:0.18,ftype:'highpass',f0:3000});tone({type:'triangle',f0:1760+Math.random()*400,dur:0.18,vol:0.08})}
    else if(fx==='fire'){noise({dur:0.25,vol:0.26,ftype:'lowpass',f0:900,f1:200});tone({f0:90,f1:50,dur:0.2,vol:0.14})}
    else if(fx==='storm'){noise({dur:0.06,vol:0.34,ftype:'highpass',f0:2000});noise({t:0.04,dur:0.35,vol:0.22,ftype:'lowpass',f0:500,f1:80})}
    else tone({type:'triangle',f0:1047,f1:1568,dur:0.2,vol:0.1})},
  // 슬라임 폭탄 터짐: 철퍽 + 펑
  splat:()=>{noise({dur:0.25,vol:0.32,ftype:'lowpass',f0:1500,f1:150});tone({f0:160,f1:50,dur:0.22,vol:0.16})},
};
const GAP={slash:40,hit:30,jump:40,coin:45,hurt:80,chest:100,door:150,gate:150,skill:80,pillar:60,splat:60};

let coinStep=0,coinT=0,live=0;
const MAX_LIVE=28;
export function sfx(name,opt){
  if(muted)return;
  const c=init();if(!c||c.state!=='running')return;
  if(live>MAX_LIVE&&name!=='hurt')return;
  const now=performance.now();if(now-(last[name]||0)<(GAP[name]||30))return;last[name]=now;
  if(name==='coin'){coinStep=now-coinT<400?coinStep+1:0;coinT=now;opt={step:coinStep}}
  try{SOUNDS[name]&&SOUNDS[name](opt)}catch(_){}
}
/* 소리 켜고 끄기 (나중에 설정 메뉴에서 쓰기용) */
export function setMuted(v){muted=!!v;try{localStorage.setItem('sr_mute',muted?'1':'0')}catch(_){};applyVol()}
export function setVolume(k,v){vol[k]=Math.min(1,Math.max(0,v));try{localStorage.setItem('sr_vol',JSON.stringify(vol))}catch(_){};applyVol()}
export const getVolume=k=>vol[k];
export function isMuted(){return muted}
