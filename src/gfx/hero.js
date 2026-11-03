/* ---------- hero composer (layered) ----------
   그리는 순서: 뒷머리 → 망토 → 몸/옷 → 갑옷 → 머리 → 눈 → 앞머리 → 투구 → 방패
   글자 = 색 슬롯. 커스텀과 장비는 슬롯 색만 바꾸거나 레이어를 덧입힘 */
export const HERO_W=26,HERO_H=24,HEAD_X=6,BODY_Y=13;
export const HEAD_BASE=["","",
"..kkkkkkkkkk..",".kssssssssssk.",".kssssssssssk.",".kssssssssssk.",".kssssssssssk.",".kssssssssssk.",
".kssssssssssk.",".kssssssssssk.",".kssssssssssk.",".kSssssssssSk.","..kkkkkkkkkk.."];
export const EYES=[[8,8],[8,9],[11,8],[11,9]];
export const SHORT_BASE=["khhhhhhhhhhhhk","khhhhhhhhhhhhk","khhhhhkhhhkhHk","khhhk.......Hk","khhk.......kk.","kHk...........",".k............"];
export const HAIR_STYLES=[
 {name:'짧은머리',front:["","...kkkkkkkk...","..khhhhhhhhkk.",".khhLLhhhhhhhk","khhLhhhhhhhhhk",...SHORT_BASE]},
 {name:'삐죽머리',front:["....k..k..k...","...khkkhkkhk..","..khhhhhhhhhk.",".khhLLhhhhhhhk","khhLhhhhhhhhhk",...SHORT_BASE]},
 {name:'단발',front:["","...kkkkkkkk...","..khhhhhhhhkk.",".khhLLhhhhhhhk","khhLhhhhhhhhhk","khhhhhhhhhhhhk","khhhhhhhhhhhhk",
  "khhhhkkkkkkkhk","khhhk.......hk","khhhk.......hk","khhhk.......hk","kHhhk.......Hk","kHHk........k."]},
 {name:'긴머리',front:["","...kkkkkkkk...","..khhhhhhhhkk.",".khhLLhhhhhhhk","khhLhhhhhhhhhk","khhhhhhhhhhhhk","khhhhhhhhhhhhk",
  "khhhhkhhkkhkhk","khhhk.k.....hk","khhhk.......hk","khhhk.......hk","khhhk.......Hk","kHhk........k."],
  back:["","","","","","","",
  "....khhhhk","....khhhhk","....khhhhk","....khhhhk","....khhhhk","....khhhhk","....khhhhk","....khhhhk",
  "....khhhhk","....khhhHk","....khhHHk","....kHhHk",".....kHk","......k"]},
 {name:'포니테일',front:["","...kkkkkkkk...","..khhhhhhhhkk.",".khhLLhhhhhhhk","khhLhhhhhhhhhk",...SHORT_BASE],
  back:["","","","",
  "...kk","..khhk",".khhrrk","khhhrrk","khhhk","khhhk","khhk","khHk",".kHk","..k"]}
];
export const TORSO=[".......kTttttttBtTk",".......kTtttttBttTk",".......kTtttBBtttTk",".......kuTBBttttTuk",
  "........kBByBBBBBk","........kTttttttTk","........kppppppppk"];
export const TORSO_ATK=[".......kTttttttBtTk",".......kTtttttBttTkkk",".......kTtttBBtttttuuk",".......kuTBBttttTkkkk",
  "........kBByBBBBBk","........kTttttttTk","........kppppppppk"];
export const LEGS={
 idle:["........kpppkkpppk","........kPppkkPppk","........kfffkkfffk","........kkkkkkkkkk"],
 run:[".......kpppk..kpppk","......kpppk....kpppk","......kfffk....kfffk","......kkkkk....kkkkk"],
 jump:["........kpppkkpppk","........kfffkkfffk","........kkkkkkkkkk",""]};
export const ARMOR=[".......kMMaaaaaaMMk",".......kMkaaaaaakMk",".........kaagaaak",".........kAaaaaAk"];
export const CAPE=["......kc",".....kcc","....kccC","....kcCC","...kccCC","...kcCCC","..kccCCC","..kcCCCk",".kccCCk",".kkkkk"];
export const HELM_CAP=["","..kkkkkkkkkk..",".kaiiaaaaaaak.","kaiaaaaaaaaaAk","kaaaaaaaaaaaAk","kmmmmmmmmmmmmk",".kkkkkkkkkkkk."];
export const HELM_FULL=["......kkk.....","..kkkkmmkkkk..",".kaiiammaaaak.","kaiaaammaaaaAk","kaaaaammaaaaAk","kaaaakkkkkkkAk",
  "kaaaak......Ak","kaaaak......Ak","kaaaak......Ak","kaaaak......Ak","kAaaaakkkkkkAk","kAAaaaAAAAAAAk",".kkkkkkkkkkkk."];
export const SHIELD=["kkkkkkk","kmmmmmk","kmqxqmk","kmxxxmk","kmqxqmk","kmqxqmk",".kmQmk.","..kmk..","...k..."];
export const SWORD=["..k...........","..mkkkkkkkkkk.","jjmLLLLLLLLLLk","jjmllllllllllk","..mkkkkkkkkkk.","..k..........."];
export const HERO_FRAMES={idle0:['idle',0,TORSO],idle1:['idle',1,TORSO],run0:['run',0,TORSO],run1:['idle',1,TORSO],jump0:['jump',0,TORSO],atk0:['idle',0,TORSO_ATK]};

export const LOOK_OPTS={
 hair:[['갈색','#7a4a2e'],['검정','#2e2a3a'],['금발','#f2c55c'],['은발','#d8dde8'],['빨강','#d2463a'],['파랑','#3f7ad8'],['분홍','#f08ab0']],
 skin:[['밝은','#ffe0c4'],['보통','#f5c9a0'],['구릿빛','#e0a878'],['갈색','#b97a52'],['짙은','#7e4e34']],
 top:[['초록','#4f8a3a'],['파랑','#3b6fd4'],['빨강','#c23a44'],['황토','#c08a3a'],['보라','#6a4ab0'],['흰색','#e6e0d0'],['검정','#3a3448']],
 bottom:[['갈색','#6a4a32'],['남색','#2f3f6a'],['보라','#3a2c4a'],['회색','#5a5a66'],['베이지','#c8b898']],
 shoes:[['갈색','#5a3a26'],['검정','#2a2430'],['빨강','#9a3030'],['흰색','#e8e4dc'],['파랑','#3a5a8a']]};
export const LOOK_DEFAULT={style:0,hair:0,skin:1,top:0,bottom:0,shoes:0};
export const GEAR=[
 {name:'모험가',atk:0,pal:{},sword:{l:'#a8aeb8',L:'#d8dce4',m:'#6a4a32',j:'#4a3020'},slashA:['#ffffff','#e0e4ec','#9aa2b2'],slashC:['#ffffff','#e8e4d8','#a8a090'],big:20},
 {name:'견습 기사',atk:3,armor:true,pal:{a:'#9a6a42',A:'#6a4428',M:'#7a5232',g:'#d8b060',u:'#6a4428'},sword:{l:'#c8ccd6',L:'#ffffff',m:'#8a8e9a',j:'#5a3a26'},slashA:['#ffffff','#c8d0e0','#7a86a0'],slashC:['#ffffff','#d8dee8','#8a93a8'],big:22},
 {name:'왕국 기사',atk:8,armor:true,helm:HELM_CAP,shield:true,pal:{a:'#b8c4dc',A:'#76829e',M:'#8a96b0',g:'#d23a4a',u:'#9aa6c0',i:'#eef2fa',m:'#d8dfee',f:'#8a96b0',q:'#2f55c8',Q:'#1d3584',x:'#ffffff'},sword:{l:'#e0e8f5',L:'#ffffff',m:'#f0c040',j:'#3a2a5a'},slashA:['#ffffff','#9fe8ff','#3a8fd8'],slashC:['#fffbe0','#ffd34a','#e0782a'],big:22},
 {name:'성기사',atk:15,armor:true,helm:HELM_FULL,shield:true,cape:true,pal:{a:'#e8ecf6',A:'#9aa4c4',M:'#ffd34a',g:'#6ff0ff',u:'#d8deec',i:'#ffffff',m:'#ffd34a',f:'#c8cee0',q:'#e8ecf6',Q:'#9aa4c4',x:'#ffd34a',c:'#3048b8',C:'#1c2c78'},sword:{l:'#9ff0ff',L:'#ffffff',m:'#ffd34a',j:'#ffd34a'},slashA:['#ffffff','#9ff0ff','#ffd34a'],slashC:['#ffffff','#ffd34a','#5a6ae0'],big:27}];

export const LOOK={...LOOK_DEFAULT};
try{const v=JSON.parse(localStorage.getItem('sr_look2')||'null');if(v)for(const k in LOOK_DEFAULT)if(Number.isInteger(v[k]))LOOK[k]=v[k]}catch(_){}
export function hexMix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
export function heroPal(look,gear){
 const o=LOOK_OPTS,H=o.hair[look.hair][1],S=o.skin[look.skin][1],T=o.top[look.top][1],P=o.bottom[look.bottom][1],F=o.shoes[look.shoes][1];
 return Object.assign({k:'#1a1222',e:'#1a1222',B:'#5a3a26',y:'#e0b040',r:'#c23a44',
  h:H,H:hexMix(H,'#1a1222',0.3),L:hexMix(H,'#ffffff',0.4),s:S,S:hexMix(S,'#7a3a3a',0.18),u:S,
  t:T,T:hexMix(T,'#1a1222',0.28),p:P,P:hexMix(P,'#1a1222',0.25),f:F},GEAR[gear].pal);
}
export function paintRows(ctx,rows,pal,ox,oy){rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const c=pal[r[i]];if(c){ctx.fillStyle=c;ctx.fillRect(ox+i,oy+y,1,1)}}})}
export function drawHero(ctx,frame,look,gear,ox=0,oy=0){
 const[legKey,hy,torso]=HERO_FRAMES[frame],pal=heroPal(look,gear),st=HAIR_STYLES[look.style],G=GEAR[gear];
 if(st.back)paintRows(ctx,st.back,pal,ox,oy+hy);
 if(G.cape)paintRows(ctx,CAPE,pal,ox,oy+BODY_Y);
 paintRows(ctx,torso,pal,ox,oy+BODY_Y);paintRows(ctx,LEGS[legKey],pal,ox,oy+BODY_Y+7);
 if(G.armor)paintRows(ctx,ARMOR,pal,ox,oy+BODY_Y);
 paintRows(ctx,HEAD_BASE,pal,ox+HEAD_X,oy+hy);
 EYES.forEach(([x,y])=>{ctx.fillStyle=pal.e;ctx.fillRect(ox+HEAD_X+x,oy+hy+y,1,1)});
 paintRows(ctx,st.front,pal,ox+HEAD_X,oy+hy);
 if(G.helm)paintRows(ctx,G.helm,pal,ox+HEAD_X,oy+hy);
 if(G.shield)paintRows(ctx,SHIELD,pal,ox+2,oy+BODY_Y+1);
}
