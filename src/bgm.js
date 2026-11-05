/* 배경음악: 파일 없이 칩튠으로 만들어 연주
   - 곡 = 빠르기(bpm) + 마디마다 코드 + 멜로디(8분음표 단위) + 베이스·아르페지오·드럼 패턴
   - 베이스와 아르페지오는 코드에서 자동으로 만들어서, 곡마다 멜로디와 코드만 적으면 됨
   - 곡 한 바퀴를 미리 소리 데이터로 만들어 반복 재생 → 게임이 버벅여도 끊기지 않음
   - 방이 바뀌어도(scene.restart) 같은 지역이면 곡이 끊기지 않고 이어짐. 다른 곡이면 서서히 바꿈 */
import {audio} from './sfx.js';
import {MOBILE} from './config.js';

const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const midi=n=>{const m=/^([A-G])([#b]?)(-?\d)$/.exec(n);return 12*(+m[3]+1)+NOTE[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)};
const hz=m=>440*Math.pow(2,(m-69)/12);
/* 코드 이름 → 근음(midi, 3옥타브)과 구성음 간격. 예: Am, F#m, Bb, E7 */
function chord(name){
  const m=/^([A-G][#b]?)(m?)(7?)$/.exec(name),root=midi(m[1]+'3');
  const iv=m[2]?[0,3,7]:[0,4,7];if(m[3])iv.push(m[2]?10:10);return{root,iv};
}

/* 곡 목록. mel: 공백으로 나눈 8분음표 (음이름 / - 앞 음 늘이기 / . 쉼)
   bass·arp·drum 패턴은 한 마디 16칸(16분음표). bass: r 근음, f 5도, o 한 옥타브 위 / drum: k 킥, s 스네어, h 하이햇 */
const SONGS={
  title:{bpm:112,lead:0.25,chords:'G D Em C G D C D',
    mel:`D5 - G5 - - - A5 B5  A5 - - - F#5 - D5 -  E5 - G5 - B5 - A5 G5  E5 - - - C5 - - -
         D5 - G5 - - - A5 B5  C6 - - - B5 - A5 -  G5 - E5 - C5 - E5 G5  F#5 - - - D5 - . .`,
    bass:'r...r...f...r...',arp:'0.1.2.1.0.1.2.1.',drum:'k...s...k.k.s...'},
  village:{bpm:96,lead:0.125,leadWave:'triangle',chords:'C Am F G C Am Dm G',
    mel:`G5 - E5 - C5 - E5 G5  A5 - - - E5 - - -  F5 - A5 - C6 - A5 -  G5 - - - D5 - - -
         G5 - E5 - C5 - E5 G5  A5 - C6 - B5 A5 G5 -  F5 - E5 - D5 - F5 -  E5 - D5 - C5 - . .`,
    bass:'r.......f.......',arp:'0..1..2.0..1..2.',drum:'k.......h.......'},
  meadow:{bpm:126,lead:0.25,chords:'C G Am F C G F G',
    mel:`E5 - G5 - C6 - G5 -  D5 - G5 - B5 - A5 G5  A5 - E5 - C5 - E5 A5  G5 - F5 E5 F5 - . .
         E5 - G5 - C6 - D6 E6  D6 - B5 - G5 - A5 B5  C6 - A5 F5 G5 - E5 C5  D5 - - - G4 . . .`,
    bass:'r...o...r...o...',arp:'0.1.2.1.0.1.2.1.',drum:'k...s...k.k.s..h'},
  treetop:{bpm:108,lead:0.125,chords:'F Dm Bb C F Am Bb C',
    mel:`C5 - F5 - A5 - G5 F5  D5 - F5 - A5 - - .  D5 - F5 Bb5 - A5 G5 F5  E5 - G5 - C6 - - .
         A5 - C6 - A5 G5 F5 -  E5 - A5 - C6 - A5 G5  F5 - D5 - Bb4 - D5 F5  E5 - - - C5 . . .`,
    bass:'r..f..o.r..f..o.',arp:'0.2.1.2.0.2.1.2.',drum:'k..h..s.k..h..s.'},
  cave:{bpm:84,lead:0.25,echo:0.38,chords:'Am Am F E Am Am Dm E',
    mel:`A4 - - - C5 - - -  B4 - - - E4 - - -  F4 - A4 - C5 - - -  B4 - - - G#4 - - -
         A4 - - - E5 - - -  D5 - C5 - B4 - A4 -  F4 - - - A4 - D5 -  G#4 - - - - - . .`,
    bass:'r.......r.......',arp:'0...1...2...1...',drum:'k.......k...h...'},
  castle:{bpm:112,lead:0.5,chords:'Dm Bb C Dm Dm Gm A A',
    mel:`D5 - - A4 D5 - F5 -  F5 - - D5 Bb4 - D5 -  E5 - - C5 G4 - C5 E5  D5 - - - A4 - - -
         D5 - - A4 D5 - F5 -  G5 - - F5 D5 - Bb4 -  A4 - C#5 - E5 - A5 -  G5 - F5 - E5 - C#5 -`,
    bass:'r.r.f...r.r.f...',arp:'0...1...2...1...',drum:'k...s.s.k...s.ss'},
  ice:{bpm:80,lead:0.5,leadWave:'triangle',echo:0.42,chords:'Em C G D Em C Am B',
    mel:`B5 - - - G5 - - -  E5 - - - G5 - A5 -  B5 - - - D6 - - -  A5 - - - F#5 - - -
         G5 - - - E5 - B4 -  C5 - - - E5 - G5 -  A5 - - - C6 - B5 A5  F#5 - - - D#5 - - -`,
    bass:'r.......f.......',arp:'0.1.2.o.2.1.0.1.',drum:'....h.......h...'},
  desert:{bpm:100,lead:0.25,chords:'E F E Dm E F Dm E',
    mel:`E5 - F5 G#5 - F5 E5 -  F5 - A5 - G#5 F5 E5 -  B4 - D5 - C5 B4 G#4 -  A4 - - - D5 - F5 -
         E5 - F5 G#5 - A5 B5 -  C6 - B5 A5 G#5 - F5 -  F5 - E5 D5 - C5 B4 -  E4 - - - - - . .`,
    bass:'r..r..f.r..r..f.',arp:'0..1..2.0..1..2.',drum:'k..k..s.k.hk..s.'},
  lava:{bpm:144,lead:0.5,chords:'Cm Cm Ab Bb Cm Cm Ab G',
    mel:`C5 C5 . C5 Eb5 - C5 .  G5 - F5 - Eb5 - D5 -  Ab4 Ab4 . Ab4 C5 - Eb5 .  D5 - Bb4 - F5 - D5 -
         C5 C5 . C5 Eb5 - G5 .  C6 - Bb5 - G5 - Eb5 -  Ab5 - G5 - F5 - Eb5 -  D5 - B4 - G4 - - -`,
    bass:'rrorrrorrrorrror',arp:'0.1.2.1.0.1.2.1.',drum:'k.h.s.h.k.k.s.hh'},
  sky:{bpm:120,lead:0.25,chords:'D A Bm G D A G A',
    mel:`A5 - F#5 - D5 - F#5 A5  E5 - - - C#5 - E5 -  F#5 - B5 - A5 - F#5 -  G5 - - - D5 - . .
         A5 - D6 - C#6 - B5 A5  E5 - A5 - C#6 - E6 -  D6 - B5 - G5 - B5 D6  C#6 - - - A5 - . .`,
    bass:'r...f...r...o...',arp:'0.1.2.1.0.1.2.1.',drum:'k...s...k...s.s.'},
  demon:{bpm:132,lead:0.5,echo:0.3,chords:'Em C D B Em C Am B',
    mel:`E5 - - B4 E5 - G5 -  G5 - F#5 - E5 - C5 -  D5 - - A4 D5 - F#5 -  D#5 - - - B4 - . .
         E5 - G5 - B5 - A5 G5  C6 - B5 - G5 - E5 -  A5 - G5 - F#5 - E5 -  D#5 - F#5 - B4 - - -`,
    bass:'r.r.f...r.r.o...',arp:'0...1...2...1...',drum:'k...s...k.k.s...'},
  boss:{bpm:156,lead:0.25,chords:'Am F G E Am F Dm E',
    mel:`A5 - E5 A5 C6 - B5 A5  F5 - A5 - C6 - A5 F5  G5 - D5 G5 B5 - A5 G5  E5 - G#5 - B5 - G#5 -
         A5 - C6 - E6 - D6 C6  F5 - A5 C6 F6 - E6 D6  D6 - A5 F5 D5 - F5 A5  G#5 - E5 - B4 - G#4 -`,
    bass:'rorororororororo',arp:'0120120120120120',drum:'k.hks.h.k.hks.hs'},
};
/* 곡 데이터를 연주하기 좋은 형태로 미리 풀어 둠 */
for(const s of Object.values(SONGS)){
  s.ch=s.chords.split(/\s+/).map(chord);
  s.notes=s.mel.trim().split(/\s+/);
}

/* 펄스파(사각파의 폭을 바꾼 소리). 폭이 좁을수록 가늘고 지글거려서, 음악엔 25%·50%만 씀 */
function pulse(c,duty){
  const n=32,re=new Float32Array(n),im=new Float32Array(n);
  for(let k=1;k<n;k++){re[k]=2/(k*Math.PI)*Math.sin(2*Math.PI*k*duty);im[k]=2/(k*Math.PI)*(1-Math.cos(2*Math.PI*k*duty))}
  return c.createPeriodicWave(re,im);
}

/* ---------- 곡 한 바퀴를 미리 녹음 (OfflineAudioContext) ----------
   실시간으로 음을 하나씩 예약하면 게임이 버벅일 때 음이 밀리거나 끊김.
   그래서 곡 한 바퀴(8마디)를 통째로 소리 데이터로 만들어 두고, 그걸 반복 재생함.
   재생은 브라우저 오디오가 알아서 하므로 게임이 멈춰도 음악은 계속 나옴 */
const SR=32000,TAIL=2;
function voice(c,out,waves,t,f,dur,{wave='square',duty=0.25,vol=0.3,dec=0.5}){
  const o=c.createOscillator(),g=c.createGain();
  if(wave==='square')o.setPeriodicWave(waves[duty]||waves[0.25]);else o.type=wave;
  o.frequency.setValueAtTime(f,t);
  const a=0.008,d=Math.max(a+0.005,Math.min(0.09,dur*0.4)),r=Math.max(d+0.005,dur*0.8);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+a);
  g.gain.exponentialRampToValueAtTime(vol*dec,t+d);g.gain.setValueAtTime(vol*dec,t+r);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g).connect(out);o.start(t);o.stop(t+dur+0.02);
}
/* 드럼: 잡음 없이 사인·삼각파로만. k 쿵(킥), s 톡(작은 북 대신) / h는 쓰지 않음 */
function drum(c,out,t,k){
  if(k!=='k'&&k!=='s')return;
  const o=c.createOscillator(),g=c.createGain(),kick=k==='k';
  o.type=kick?'sine':'triangle';o.frequency.setValueAtTime(kick?150:330,t);o.frequency.exponentialRampToValueAtTime(kick?42:160,t+(kick?0.12:0.07));
  const v=kick?0.5:0.22,d=kick?0.15:0.09;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.004);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(g).connect(out);o.start(t);o.stop(t+d+0.02);
}
function schedule(c,out,waves,S,i,t){
  const sx=60/S.bpm/4,bar=Math.floor(i/16)%S.ch.length,pos=i%16,C=S.ch[bar];
  if(pos%2===0){const n=S.notes.length,j=(i/2)%n,tok=S.notes[j];
    if(tok!=='-'&&tok!=='.'){let len=1;while(S.notes[(j+len)%n]==='-'&&len<16)len++;
      const tri=S.leadWave==='triangle';voice(c,out,waves,t,hz(midi(tok)),len*sx*2*0.95,{wave:tri?'triangle':'square',duty:Math.max(0.25,S.lead||0.25),vol:tri?0.42:0.2,dec:0.6})}}
  // 베이스·아르페지오는 다음 음이 나올 때까지 이어서 울려서, 곡 중간에 소리가 뚝 비는 곳이 없게
  const gap=p=>{let k=1;while(k<16&&p[(pos+k)%16]==='.')k++;return k};
  const b=S.bass[pos];
  if(b!=='.'){const m=C.root-12+(b==='f'?7:b==='o'?12:0);voice(c,out,waves,t,hz(m),gap(S.bass)*sx*0.95,{wave:'triangle',vol:0.5,dec:0.75})}
  const a=S.arp[pos];
  if(a!=='.'){const m=a==='o'?C.root+24:C.root+12+C.iv[(+a)%C.iv.length];voice(c,out,waves,t,hz(m),Math.min(4,gap(S.arp))*sx*0.92,{wave:'triangle',vol:0.13,dec:0.5})}
  const d=S.drum[pos];if(d!=='.')drum(c,out,t,d);
}
function render(name){
  const S=SONGS[name],steps=S.ch.length*16,loop=steps*60/S.bpm/4,loopN=Math.round(loop*SR),len=loopN+TAIL*SR;
  const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!OAC)return Promise.reject(new Error('no offline'));
  const c=new OAC(1,len,SR),out=c.createGain();out.gain.value=1;out.connect(c.destination);
  if(S.echo){const dl=c.createDelay(1),fb=c.createGain(),wet=c.createGain();dl.delayTime.value=0.27;fb.gain.value=0.3;wet.gain.value=S.echo;
    out.connect(dl);dl.connect(fb).connect(dl);dl.connect(wet).connect(c.destination)}
  const waves={0.25:pulse(c,0.25),0.5:pulse(c,0.5)};
  // 끝에서 다음 바퀴 첫 음으로 이어지는 소리까지 넣으려고, 한 바퀴 + 다음 바퀴 첫 마디 앞부분까지 예약
  const sx=60/S.bpm/4;for(let i=0;i*sx<loop;i++)schedule(c,out,waves,S,i,i*sx);
  const done=c.startRendering();
  const p=done&&done.then?done:new Promise(r=>{c.oncomplete=e=>r(e.renderedBuffer)});
  return p.then(buf=>{
    // 한 바퀴 뒤로 흘러넘친 꼬리(울림·메아리)를 앞쪽에 겹쳐서 반복 이음새를 매끄럽게
    const src=buf.getChannelData(0),out=new Float32Array(loopN);out.set(src.subarray(0,loopN));
    for(let k=0;k<len-loopN;k++)out[k%loopN]+=src[loopN+k];
    return out});
}

let A=null,cur=null,want=null,playing=null;
const cache={},pending={};
const VOL=0.11;
function get(name){
  if(cache[name])return Promise.resolve(cache[name]);
  // 만들다 실패하면 기록을 지워서 다음에 다시 시도할 수 있게
  if(!pending[name])pending[name]=render(name).then(d=>{cache[name]=d;delete pending[name];return d},e=>{delete pending[name];throw e});
  return pending[name];
}
function start(name,data){
  const c=A.ctx,t=c.currentTime;
  if(!data.buf){const b=c.createBuffer(1,data.length,SR);b.getChannelData(0).set(data);data={buf:b};cache[name]=data}const buf=data.buf;
  if(MOBILE)for(const k in cache)if(k!==name)delete cache[k];   // 폰: 지금 곡만 남김
  const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.loop=true;
  // 반복 재생이 어떤 이유로 끝나 버리면(멈추라고 한 게 아니면) 바로 다시 틈
  s.onended=()=>{if(playing&&playing.s===s){playing=null;cur=null;if(want)bgm(want)}};
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(VOL,t+0.6);
  s.connect(g).connect(A.musicBus);s.start(t);
  fadeOut();playing={s,g,name};cur=name;
}
function fadeOut(){
  if(!playing)return;const {s,g}=playing,t=A.ctx.currentTime;playing=null;
  g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(Math.max(0.0001,g.gain.value),t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.5);
  try{s.stop(t+0.55)}catch(_){}
}
/* 나머지 곡도 틈틈이 미리 만들어 둬서, 처음 가는 지역도 바로 나오게 */
let warmed=false;
function warmAll(){if(warmed||MOBILE)return;warmed=true;const list=Object.keys(SONGS);let i=0;
  const next=()=>{while(i<list.length&&cache[list[i]])i++;if(i>=list.length)return;get(list[i++]).then(()=>setTimeout(next,1200),()=>setTimeout(next,1200))};
  setTimeout(next,1500)}
/* 감시: 틀어야 할 곡이 있는데 안 나오고 있으면(만들기 실패 등) 2초마다 다시 시도 */
setInterval(()=>{if(want&&!playing&&A&&!pending[want])bgm(want)},2000);

/* 곡 틀기: 같은 곡이 이미 나오고 있으면 그대로 둠 */
export function bgm(name){
  if(!SONGS[name])return;want=name;if(cur===name&&playing)return;
  if(!A){A=audio();if(!A)return}
  get(name).then(d=>{if(want===name&&!(cur===name&&playing))start(name,d);warmAll()},()=>{});
}
/* 음악 끄기 (보스를 잡은 직후처럼 잠깐 멈출 때) */
export function bgmStop(){want=null;cur=null;if(A)fadeOut()}
export const BGM_LIST=Object.keys(SONGS);
