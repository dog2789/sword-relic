import {ITEMS,SLOTS} from '../data/items.js';
/* ---------- 주인공 (레이어 방식) ----------
   17x19 프레임, 스프라이트는 x+1 위치에 15칸 폭으로 그림
   그리는 순서: 뒷머리 → 망토 → 머리(피부)·눈 → 몸·옷 → 다리 → 갑옷 → 앞머리 → 투구 → 방패
   글자 = 색 슬롯. 커스텀과 장비는 슬롯 색을 바꾸거나 레이어를 덧입힘 */
export const HERO_W=17,HERO_H=17,OX=1;
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
export const ARMOR=["","","","","","","","","","","","","","....MaaaaaaM...",".....aagaaa...."];
export const CAPE=["","","","","","","","","","","","","",".kcc........cck",".kcc........cck",".kcC........Cck",".kCC........CCk","..kCk......kCk.","...k........k.."];
export const HELM_CAP=["","","","....kkkkkk.....","...kaiiaaaak...","..kaiaaaaaaak..",".kaaaaaaaaaaaak",".kmmmmmmmmmmmmk"];
export const HELM_FULL=["","","......kk.......","....kkmmkkk....","...kaiammaak...","..kaiaammaaak..",".kaaaaammaaaaak",".kaaaaaaaaaaaak",
  ".kak........kAk",".kak........kAk",".kak........kAk","..kaAAAAAAAAAk.","...kkkkkkkkkk.."];
export const SHIELD=["kkkkk","kmqmk","kqxqk","kmxmk",".kmk.","..k.."];
export const SWORD=["..k........","..mkkkkkkk.","jjmLLLLLLLk","..mkkkkkkk.","..k........"];
export const HERO_FRAMES={idle0:{legs:'idle',bob:0},idle1:{legs:'idle',bob:1},run0:{legs:'runA',bob:0},run1:{legs:'runB',bob:1},jump0:{legs:'jump',bob:0},atk0:{legs:'idle',bob:0,atk:true}};

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
export function equipLook(equip){
 const L={pal:{},helm:null,armor:false,cape:false,shield:false};
 for(const sl of SLOTS){const it=ITEMS[equip&&equip[sl]];if(!it||!it.look)continue;const lk=it.look;
  Object.assign(L.pal,lk.pal||{});if(lk.helm)L.helm=lk.helm;if(lk.armor)L.armor=true;if(lk.cape)L.cape=true;if(lk.shield)L.shield=true}
 return L;
}
export function heroPal(look,EL){
 const o=LOOK_OPTS,pick=(k)=>(o[k][look[k]]||o[k][0])[1];
 const H=pick('hair'),S=pick('skin'),T=pick('top'),P=pick('bottom'),F=pick('shoes');
 return Object.assign({k:'#120a10',e:'#58102e',y:'#fac802',r:'#c23a44',
  h:H,H:hexMix(H,'#120a10',0.3),s:S,S:hexMix(S,'#f07a20',0.42),u:S,
  t:T,B:hexMix(T,'#000000',0.65),p:P,f:F},EL.pal);
}
export function paintRows(ctx,rows,pal,ox,oy){rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const c=pal[r[i]];if(c){ctx.fillStyle=c;ctx.fillRect(ox+i,oy+y,1,1)}}})}
/* 원본 도트는 왼쪽을 보고 있어서 좌우를 뒤집어 그림 (게임 기준 오른쪽을 보는 모습)
   공격 팔과 방패는 이미 최종 방향으로 그려둔 데이터라 뒤집지 않음 */
export function drawHero(ctx,frame,look,equip,ox=0,oy=0){
 const F=HERO_FRAMES[frame],EL=equipLook(equip),pal=heroPal(look,EL),st=HAIR_STYLES[look.style]||HAIR_STYLES[0],X=ox+OX,Y=oy-2+F.bob;
 const m={set fillStyle(v){ctx.fillStyle=v},fillRect(x,y,w,h){ctx.fillRect(2*ox+HERO_W-x-w,y,w,h)}};
 if(st.back)paintRows(m,st.back,pal,X,Y);
 if(EL.cape)paintRows(m,CAPE,pal,X,Y);
 paintRows(m,HEAD,pal,X,Y);
 EYES.forEach(([x,y])=>{m.fillStyle=pal.e;m.fillRect(X+x,Y+y,1,1)});
 if(F.atk)paintRows(ctx,BODY_ATK,pal,X,Y);else paintRows(m,BODY,pal,X,Y);
 paintRows(m,LEGS[F.legs],pal,X,oy-2+17);
 if(EL.armor)paintRows(m,ARMOR,pal,X,Y);
 paintRows(m,st.front,pal,X,Y);
 if(EL.helm)paintRows(m,EL.helm==='full'?HELM_FULL:HELM_CAP,pal,X,Y);
 if(EL.shield)paintRows(ctx,SHIELD,pal,X-1,Y+13);
}
