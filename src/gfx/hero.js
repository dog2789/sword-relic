import {ITEMS,SLOTS} from '../data/items.js';
/* ---------- 주인공 (레이어 방식) ----------
   17x19 프레임, 스프라이트는 x+1 위치에 15칸 폭으로 그림
   그리는 순서: 뒷머리 → 망토 → 머리(피부)·눈 → 몸·옷 → 다리 → 갑옷 → 앞머리 → 투구 → 방패
   글자 = 색 슬롯. 커스텀과 장비는 슬롯 색을 바꾸거나 레이어를 덧입힘 */
/* 그림 칸 21x23: 몸은 가운데 15x17에 그리고, 둘레 여백(좌우 2, 위아래 3)에 뿔·왕관·어깨 장식이 삐져나옴 */
export const HERO_W=21,HERO_H=23,OX=1,MX=2,MY=3;
const HEAD=["","","","",
".....kkkkkkk...","...kssssssssk..","..kssssssssssk.","..kssssssssssk.","..kssssssssssk.",
"..ksssssssssSk.","...kssssssssSk.","...kssssssssk..","....kssssssk..."];
const EYES=[[5,9],[5,10],[9,9],[9,10]];
const BODY=["","","","","","","","","","","","","",
"...kttttttttk..","..kuuttttttuuk.","..kuuBByBBBuuk.","...kkttttttkk.."];
const BODY_ATK=["","","","","","","","","","","","","",
"...kttttttttk..","..kuutttttttuuuk","..kuuBBByBBk....","...kkttttttkk.."];
const LEGS={
 idle:["....kpkkkkpk...","....fff..fff..."],
 runA:["...kpk....kpk..","..fff......fff."],
 runB:[".....kpkkpk....",".....ffffff...."],
 jump:["....kpkkkkpk...",".....ff..ff...."]};
export const HAIR_STYLES=[
 {name:'기본',front:["","","...k...........","..khk..........","..khhkkkkkkk...","...khhhhhhhhk..","..khhhhhhhhhhk.",
  "..khhh.hhhhhhk.",".khhh......hhhk","...h..........."]},
 {name:'삐죽머리',front:["","","....k..k..k....","...khkkhkkhk...","..khhhhhhhhhk..","..khhhhhhhhhhk.","..khhhhhhhhhhk.",
  "..khhhhhhhhhhk.",".khhh.h....hhhk","...h..........."]},
 {name:'단발',front:["","","","....kkkkkk.....","...khhhhhhhhk..","..khhhhhhhhhhk.","..khhhhhhhhhhk.",
  "..khhhhhhhhhhk.",".khhhhhhhhhhhhk","..kh........hk","..kh........hk","..kh........hk","...kk......kk.."]},
 {name:'긴머리',front:["","","","....kkkkkk.....","...khhhhhhhhk..","..khhhhhhhhhhk.","..khhhhhhhhhhk.",
  "..khhhh.hhhhhk.",".khhhh.....hhhk","..kh........hk","..kh........hk","..kh........hk"],
  back:["","","","","","","","","",".khh........hhk",".khh........hhk",".khh........hhk",".khh........hhk",
  ".khh........hhk",".kHh........hHk",".kH..........Hk","..k..........k."]},
 {name:'포니테일',front:["","","...k...........","..khk..........","..khhkkkkkkk...","...khhhhhhhhk..","..khhhhhhhhhhk.",
  "..khhh.hhhhhhk.",".khhh......hhhk","...h..........."],
  back:["","","","",".kk","khhk","khrr","khhk","khk.","khk.","kHk.",".k.."]}
];
/* ----- 장비 레이어 (원본 방향 = 왼쪽을 봄) -----
   a 강철  A 어두운 강철  i 하이라이트  m 테두리  M 어두운 테두리  v 투구 틈(어둠)
   n 휘장(천)  N 휘장 어두운  G 건틀릿  b 벨트  y 버클  o 투구 깃털 */
export const ARMOR=["","","","","","","","","","","","","",
 "kiaAkMnnnMkiaAk",
 "kAAkainnnaakAAk",
 ".kGkbbbybbbkGk.",
 "..kMAnnnnnAMk.."]
/* 공격 프레임: 오른쪽을 본 최종 방향, 앞팔을 뻗음 */
export const ARMOR_ATK=["","","","","","","","","","","","","",
 "kAaikMnnnMkAaik",
 "kAAkaannniaGGGGk",
 ".kGkbbbybbbk....",
 "..kMAnnnnnAMk.."]
export const CAPE=["","","","","","","","","","","","","",".kcc........cck",".kcc........cck",".kcC........Cck",".kCC........CCk","..kCk......kCk.","...k........k.."];
/* 기사 투구: 얼굴을 완전히 덮음 (눈 위치에 가로 틈) */
export const HELM_FULL=["","","",
 "....kkkkkkk....",
 "...kiiaamaAAk..",
 "..kiiaaamaaAAk.",
 "..kiaaaamaaaAk.",
 ".kiaaaaamaaaAAk",
 ".kmmmmmmmmmmMMk",
 ".kvvvvvvavvvvAk",
 ".kiaaaaaaaaaAAk",
 ".kaavavavavaAAk",
 "..kaaaaaaaaAAk."]
/* 대투구: 평평한 윗면 + 십자 눈구멍 */
export const HELM_GREAT=["","","",
 "...kkkkkkkkk...",
 "..kiiaaamaaAk..",
 "..kiaaaamaaAk..",
 ".kiaaaaamaaaAk.",
 ".kiaaaaamaaaAk.",
 ".kivvvvvvvvvAk.",
 ".kiaaaavaaaaAk.",
 ".kiaaaavaaaaAk.",
 ".kMaaaavaaaMAk.",
 "..kMMMMMMMMMk.."];
/* 20칸 폭 장식 (몸보다 2칸 왼쪽부터 그림). 왼쪽 절반만 적고 좌우 대칭으로 펼침 */
const mir=h=>h+[...h].reverse().join('');
export const HORNS=["",...["kk........","kOk.......","kOok......",".kOok.....","..kOok....","...kOk...."].map(mir)];
export const CROWN=["......k..k..k.......",".....kYkkYkkYk......",".....kYYYYYYYk......",".....kyryyyryk......"];
export const PAULDRON={
 moon:[...Array(11).fill(''),...["..kkkk....",".kiaaAk...","kiaaaAAk..","kYYYYYyk..",".kkkkkk..."].map(mir)],
 dragon:[...Array(9).fill(''),...["..k.......",".kOk......",".kOkkk....","kaiaaAk...","kaiaAAAk..","kWaWaWk...",".kkkkk...."].map(mir)],
 heavy:[...Array(12).fill(''),...["..kkkk....",".kiaaAk...",".kaaAAk...","..kkkk...."].map(mir)],
 spike:[...Array(10).fill(''),...["...k......","..kak.....",".kaiak....",".kaaAk....","..kAk....."].map(mir)]};
/* 초승달 장식 (흑월·적월), 용 날개 장식 (용기사): 20칸 폭, 투구보다 먼저 그려서 투구가 아랫부분을 덮음 */
export const MOON_CREST=["",".....kk...",".....kYk..",".....kYYkk","......kYYY"].map(mir);   // 투구 위에 덧그림
export const DRAGON_WINGS=["kk.......k","kWk.....kO","kWwk....kO",".kWwk.....",".kWwk.....","..kWk.....","...k......"].map(mir);
export const SKY_WINGS=["k.........","kWk.......","kWWk......",".kWwk.....",".kWWwk....","..kWwk....","...kk....."].map(mir);   // 천공 투구의 흰 날개
export const HELM_CREST=["","ooo",".oooo","..ooo"];   // 투구 위 깃털 (원본 방향)
export const HELM_CAP=["","","....kkkkkk.....","...kaiiaaaak...","..kaiaaaaaaak..",".kaaaaaaaaaaaak",".kmmmmmmmmmmmmk"];
export const SHIELD=["kkkkkkk","kqqxqQk","kxxxxxk","kqqxqQk","kqqxqQk",".kqxQk.","..kQk..","...k..."];
export const SWORD=["..k........","..mkkkkkkk.","jjmLLLLLLLk","..mkkkkkkk.","..k........"];

/* ----- 뒷모습 (사다리 탈 때). 좌우 대칭이라 뒤집지 않고 그림 ----- */
const sym=s=>s+[...s].reverse().join('');           // 왼쪽 8칸 → 16칸 대칭
const symRows=(n,rows)=>[...Array(n).fill(''),...rows.map(sym)];
const HEAD_BACK=symRows(4,[".....kkk","...kkhhh","..khhhhh","..khhhhh","..khhhhh","..khhhhh","..kHhhhh","...kHHhh","....kSss"]);
const BACK_STYLE=[
 {top:["","",".......k","......kh"].map(r=>r.padEnd(16,'.'))},
 {top:symRows(2,["....k..k","...khkkh"])},
 {over:symRows(12,["..khhhhh","...kkkkk"])},
 {over:symRows(12,["..khhhhh","..khhhhh","..khhhhh","..kHhhhh","...kHkkk"])},
 {over:["","","","","","","","","",".......rr.......","......khhk......","......khhk......","......khhk......","......kHHk......",".......kk......."]}];
const BODY_BACK=symRows(13,["...ktttt","..kttttt","..kBBBBB","...ktttt"]);
const ARMS_UP=["","","..kk",".kuuk",".kuuk","..ktk","..ktk","","","","","","............ktk.",".............kuk",".............kuk","..............k."].map(r=>r.padEnd(16,'.'));
const flip=rows=>rows.map(r=>[...r.padEnd(16,'.')].reverse().join(''));
const LEGS_BACK={A:["....kpk..kfk....","....kfk........."],B:["....kfk..kpk....",".........kfk...."]};
const HELM_BACK=symRows(3,[".....kkk","...kkiam","..kiaaam","..kiaaam",".kiaaaam",".kmmmmmm",".kaaaaaa",".kAaaaaa",".kAaaaaa","..kAAAAA"]);
const ARMOR_BACK=symRows(13,["kiaAkaia","kAAkaAaa",".kGkbbbb","..kMAnnn"]);
const CAPE_BACK=symRows(13,["..kccccc","..kccccc","..kcCccc","..kcCccc",".kcCCccc",".kkkkkkk"]);

export const HERO_FRAMES={idle0:{legs:'idle',bob:0},idle1:{legs:'idle',bob:1},run0:{legs:'runA',bob:0},run1:{legs:'runB',bob:1},jump0:{legs:'jump',bob:0},atk0:{legs:'idle',bob:0,atk:true},
  climb0:{back:'A',bob:0},climb1:{back:'B',bob:0}};

export const LOOK_OPTS={
 hair:[['갈색','#8e4132'],['검정','#2e2a3a'],['금발','#f2c55c'],['은발','#d8dde8'],['빨강','#d2463a'],['파랑','#3f7ad8'],['분홍','#f08ab0']],
 skin:[['밝은','#ffe2b5'],['보통','#f5c9a0'],['구릿빛','#e0a878'],['갈색','#b97a52'],['짙은','#7e4e34']],
 top:[['초록','#377418'],['파랑','#3b6fd4'],['빨강','#c23a44'],['황토','#c08a3a'],['보라','#6a4ab0'],['흰색','#e6e0d0'],['검정','#3a3448']],
 bottom:[['초록','#377418'],['갈색','#6a4a32'],['남색','#2f3f6a'],['회색','#5a5a66'],['베이지','#c8b898']],
 shoes:[['검정','#1a1418'],['갈색','#5a3a26'],['빨강','#9a3030'],['흰색','#e8e4dc'],['파랑','#3a5a8a']]};
export const LOOK_DEFAULT={style:0,hair:0,skin:0,top:0,bottom:0,shoes:0};
/* 장비 모양은 src/data/items.js의 look 에서 가져옴 */

export const LOOK={...LOOK_DEFAULT};
try{const v=JSON.parse(localStorage.getItem('sr_look3')||'null');if(v)for(const k in LOOK_DEFAULT)if(Number.isInteger(v[k])&&v[k]>=0)LOOK[k]=v[k]}catch(_){}
export function saveLook(){try{localStorage.setItem('sr_look3',JSON.stringify(LOOK))}catch(_){}}

export function hexMix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
/* 장착 장비의 모양 정보. 투구·갑옷·망토는 각자 자기 색(pal)을 씀 (서로 색이 섞이지 않게) */
export function equipLook(equip){
 const L={base:{},helm:null,armor:null,cape:null,shield:null};
 for(const sl of SLOTS){const it=ITEMS[equip&&equip[sl]];if(!it||!it.look)continue;const lk=it.look,pal=lk.pal||{};
  if(lk.helm)L.helm={shape:lk.helm,pal,crest:lk.crest};
  if(lk.armor)L.armor={pal,shape:lk.armor===true?'plate':lk.armor};
  if(lk.cuff)L.cuff=lk.cuff;
  if(lk.cape)L.cape={pal:lk.capePal||pal};
  if(lk.shield)L.shield={pal:lk.shieldPal||pal};
  if(lk.base)Object.assign(L.base,lk.base)}   // 신발·바지 색처럼 몸에 바로 칠하는 색
 return L;
}
export function heroPal(look,EL){
 const o=LOOK_OPTS,pick=(k)=>(o[k][look[k]]||o[k][0])[1];
 const H=pick('hair'),S=pick('skin'),T=pick('top'),P=pick('bottom'),F=pick('shoes');
 return Object.assign({k:'#120a10',e:'#58102e',y:'#fac802',r:'#c23a44',
  h:H,H:hexMix(H,'#120a10',0.3),s:S,S:hexMix(S,'#f07a20',0.42),u:S,
  t:T,B:hexMix(T,'#000000',0.65),p:P,f:F},EL.base,EL.armor&&EL.armor.pal.p?{p:EL.armor.pal.p}:{},EL.cuff?{p:EL.cuff}:{});
}
const STEEL={O:'#efe4c8',o:'#a8946a',Y:'#ffe27a',y:'#f0c040',r:'#e83a4a',a:'#b8c4dc',A:'#76829e',i:'#eef2fa',m:'#d8dfee',M:'#8a96b0',v:'#141020',G:'#8a96b0',n:'#b8323e',N:'#7a1a26',b:'#5a3a26',y:'#f0c040',o:'#d23a4a'};
export function paintRows(ctx,rows,pal,ox,oy){rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const c=pal[r[i]];if(c){ctx.fillStyle=c;ctx.fillRect(ox+i,oy+y,1,1)}}})}
/* 원본 도트는 왼쪽을 보고 있어서 좌우를 뒤집어 그림 (게임 기준 오른쪽을 보는 모습)
   공격 팔·방패·뒷모습은 이미 최종 방향으로 그려둔 데이터라 뒤집지 않음 */
export function drawHero(ctx,frame,look,equip,ox=0,oy=0){
 const F=HERO_FRAMES[frame],EL=equipLook(equip),pal=heroPal(look,EL),st=HAIR_STYLES[look.style]||HAIR_STYLES[0],X=ox+OX+MX,Y=oy-2+MY+F.bob,LY=oy-2+MY+17;
 const hp=EL.helm&&{...pal,...STEEL,...EL.helm.pal},ap=EL.armor&&{...pal,...STEEL,...EL.armor.pal},shape=EL.helm&&EL.helm.shape,full=!!shape&&shape!=='cap';
 const cp=EL.cape&&{...pal,c:'#3a4a8a',C:'#22305a',...EL.cape.pal},pd=ap&&PAULDRON[EL.armor.shape];
 if(F.back){
  const bs=BACK_STYLE[look.style]||BACK_STYLE[0],X2=ox+MX,arms=F.back==='A'?ARMS_UP:flip(ARMS_UP);
  paintRows(ctx,BODY_BACK,pal,X2,Y);
  paintRows(ctx,LEGS_BACK[F.back],pal,X2,LY);
  if(ap)paintRows(ctx,ARMOR_BACK,ap,X2,Y);
  paintRows(ctx,arms,ap?{...pal,u:ap.G,t:ap.a}:pal,X2,Y);
  if(cp)paintRows(ctx,CAPE_BACK,cp,X2,Y);
  if(pd)paintRows(ctx,pd,ap,X2-2,Y);
  if(full){if(shape==='horned'||shape==='bloodmoon'||shape==='demon')paintRows(ctx,HORNS,hp,X2-2,Y);if(shape==='dragon')paintRows(ctx,DRAGON_WINGS,hp,X2-2,Y);if(shape==='winged')paintRows(ctx,SKY_WINGS,hp,X2-2,Y);
   paintRows(ctx,HELM_BACK,hp,X2,Y);if(shape==='moon'||shape==='bloodmoon')paintRows(ctx,MOON_CREST,hp,X2-2,Y);if(shape==='crown'||shape==='demon')paintRows(ctx,CROWN,hp,X2-2,Y);
   if(EL.helm.crest)paintRows(ctx,["","","......oooo"],{...hp,o:EL.helm.crest},X2,Y);return}
  paintRows(ctx,HEAD_BACK,pal,X2,Y);
  if(bs.top)paintRows(ctx,bs.top,pal,X2,Y);
  if(bs.over)paintRows(ctx,bs.over,pal,X2,Y);
  if(EL.helm)paintRows(ctx,symRows(2,["","....kkkk","...kaiaa","..kaaaaa","..kaaaaa",".kmmmmmm"]),hp,X2,Y);
  return;
 }
 const m={set fillStyle(v){ctx.fillStyle=v},fillRect(x,y,w,h){ctx.fillRect(2*ox+HERO_W-x-w,y,w,h)}};
 if(!full&&st.back)paintRows(m,st.back,pal,X,Y);
 if(cp)paintRows(m,CAPE,cp,X,Y);
 if(!full){paintRows(m,HEAD,pal,X,Y);EYES.forEach(([x,y])=>{m.fillStyle=pal.e;m.fillRect(X+x,Y+y,1,1)})}
 if(F.atk)paintRows(ctx,BODY_ATK,pal,X,Y);else paintRows(m,BODY,pal,X,Y);
 paintRows(m,LEGS[F.legs],pal,X,LY);
 if(ap){if(F.atk)paintRows(ctx,ARMOR_ATK,ap,X,Y);else paintRows(m,ARMOR,ap,X,Y);if(pd)paintRows(m,pd,ap,X-2,Y)}
 if(!full)paintRows(m,st.front,pal,X,Y);
 if(full){
  if(shape==='horned'||shape==='bloodmoon'||shape==='demon')paintRows(m,HORNS,hp,X-2,Y);
  if(shape==='dragon')paintRows(m,DRAGON_WINGS,hp,X-2,Y);
  if(shape==='winged')paintRows(m,SKY_WINGS,hp,X-2,Y);
  paintRows(m,['great','moon','bloodmoon','dragon','winged','demon'].includes(shape)?HELM_GREAT:HELM_FULL,hp,X,Y);
  if(shape==='moon'||shape==='bloodmoon')paintRows(m,MOON_CREST,hp,X-2,Y);
  if(shape==='crown'||shape==='demon')paintRows(m,CROWN,hp,X-2,Y);
  if(EL.helm.crest)paintRows(m,HELM_CREST,{o:EL.helm.crest},X+8,Y)}
 else if(EL.helm)paintRows(m,HELM_CAP,hp,X,Y);
 if(EL.shield)paintRows(ctx,SHIELD,{...pal,k:'#141020',q:'#3a6ad8',Q:'#22408a',x:'#e8eef8',...EL.shield.pal},X-1,Y+12);
}
