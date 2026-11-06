/* 방 지형 촘촘하게: 손으로 그린 방(build) 위에, 빈 공간에 층계 발판·작은 바위 턱·바닥 높낮이·천장 돌출을 규칙대로 더함
   - 보스 방, noDense 방은 그대로
   - 출입구 6칸, 위·아래 출구 열, 물건이 있는 열(상자·석상·NPC·몬스터·장치)은 비워 둠 → 물건 위치·자동 배치가 안 바뀜
   - 맨 위 3줄은 비워 둠 (위 방에서 떨어져 들어오는 자리)
   - 새 구조물 위아래 2칸은 비어 있어야 놓음 (머리 공간)
   tools/reach.mjs로 모든 방을 검사해서, 길이 막히는 방은 DENSE_SEED로 다른 배치를 쓰거나 DENSE_OFF로 끔 */
const ROWS=14;
export const DENSE_OFF=new Set(['s5','v1','l8']);   // s5: 위 출구는 일부러 막은 곳 / v1 고향 마을·l8 전설의 제단: 이야기 장면이라 손대지 않음
export const DENSE_SEED={i9:1};   // i9: 기본 배치는 횃불·철문 길을 막음
// 테마별 재료: 발판('-' 나무, '=' 잎)과 바위 턱('#') 비율
const MAT={meadow:['-',0.25],treetop:['=',0.15],cave:['-',0.6],castle:['-',0.55],ice:['-',0.6],desert:['-',0.55],lava:['-',0.6],sky:['-',0.35],demon:['-',0.6]};

function rngOf(seed){let s=(seed*9301+49297)%233280||1;return()=>{s=(s*9301+49297)%233280;return s/233280}}
const SKIP=new Set(['build','exits','deco','name','theme','cols','grid','seed','dark','event','wind','intro','title','after','lines']);

export function densify(m,R,id){
  if(R.boss||R.noDense||DENSE_OFF.has(id))return m;
  const cols=m[0].length,rnd=rngOf((R.seed||1)+(DENSE_SEED[id]||0)*7919),ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
  const [plat,solidP]=MAT[R.theme]||MAT.meadow;
  // 못 건드리는 열
  const ban=Array(cols).fill(false),banX=(a,b)=>{for(let x=Math.max(0,a);x<=Math.min(cols-1,b);x++)ban[x]=true};
  banX(0,5);banX(cols-6,cols-1);
  const ex=R.exits||{};for(const k of ['up','down'])if(ex[k])banX(ex[k].tx-3,ex[k].tx+3);
  // 칸 단위로 막는 곳 (좌표가 정해진 몬스터·장치 둘레)
  const banC=new Set(),banBox=(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)banC.add(x+','+y)};
  // 바닥에 맞춰 놓이는 것(석상·워프·NPC·좌표 없는 상자)과 위아래로 움직이는 것(상승 기류·점프 버섯·고드름)은 열 전체
  const COL=new Set(['save','warp','npc','npcs','crystal','start','updrafts','mushrooms','icicles']);
  const mark=(o,col)=>{if(!o||typeof o!=='object')return;
    if(Array.isArray(o)){o.forEach(v=>mark(v,col));return}
    if(typeof o.tx0==='number'){banBox(o.tx0-1,o.tx1+1,(o.ty||0)-2,(o.ty||ROWS)+1);return}
    if(typeof o.tx!=='number')return;
    const w=o.w||1,rx=o.axis==='x'?(o.range||0):0,ry=o.axis==='y'?(o.range||0):0;
    if(col||typeof o.ty!=='number'){banX(o.tx-1,o.tx+w);return}
    if(o.small){banBox(o.tx-1,o.tx+1,o.ty-1,o.ty+1);return}
    banBox(o.tx-2,o.tx+w+rx+1,o.ty-3,o.ty+(o.h||1)+ry+1)};
  for(const k in R)if(!SKIP.has(k)){
    // 몬스터·슬라임은 나오는 칸 둘레만 (떨어지거나 날아다님)
    if(k==='mobs'||k==='slimes')(R[k]||[]).forEach(o=>mark({...o,small:true}));else mark(R[k],COL.has(k))}
  // 사다리·덩굴·물·용암·모래 근처 열도 비움 (오르내리는 길, 함정)
  for(let x=0;x<cols;x++)for(let y=0;y<ROWS;y++)if('HV~LS'.includes(m[y][x]))banX(x-1,x+1);
  const empty=(x,y)=>x>=0&&x<cols&&y>=0&&y<ROWS&&m[y][x]==='.';
  const boxFree=(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(x<0||x>=cols||ban[x]||banC.has(x+','+y)||!empty(x,y))return false}return true};
  const stand=c=>c==='#'||c==='-'||c==='='||c==='A'||c==='B';
  // 그 열에서 가장 아래쪽 서 있을 수 있는 면 (그 위가 빈칸)
  const floorRow=x=>{for(let y=ROWS-1;y>0;y--)if(stand(m[y][x])&&m[y-1][x]==='.')return y;return ROWS};
  const put=(x0,x1,y,ch)=>{for(let x=x0;x<=x1;x++)m[y][x]=ch};

  // 서 있을 수 있는 면들 (그 위가 빈칸): 열마다 [줄...]
  const surfs=x=>{const r=[];for(let y=4;y<ROWS;y++)if(stand(m[y][x])&&m[y-1][x]==='.')r.push(y);return r};
  // 1) 바닥 턱: 모든 층의 평평한 바닥 위에 1칸(가끔 2칸) 턱. 위로 3줄은 비어 있어야 함
  if(!R.crates)for(let y=5;y<ROWS;y++){   // 상자를 미는 방은 바닥을 그대로 (밀 길이 막힘)
    let x=6;
    while(x<cols-6){
      if(m[y][x]!=='#'||ban[x]||!boxFree(x,x,y-3,y-1)){x++;continue}
      let e=x;while(e+1<cols-6&&m[y][e+1]==='#'&&!ban[e+1]&&boxFree(e+1,e+1,y-3,y-1))e++;
      // 길이 6 이상인 평평한 곳에서, 양끝 1칸은 남기고 턱 하나
      // 길이 6 이상인 평평한 곳을 6~9칸씩 나눠서, 칸마다 양끝 1칸은 남기고 턱 하나
      for(let a=x;e-a+1>=6;){const b=Math.min(e,a+ri(6,9)-1);if(b-a+1<6)break;
        if(rnd()<0.75){const w=ri(2,Math.min(4,b-a-1)),x0=ri(a+1,b-w);put(x0,x0+w-1,y-1,'#');
          if(w>=3&&rnd()<0.35&&boxFree(x0,x0+w-2,y-4,y-2))put(x0,x0+w-2,y-2,'#')}
        a=b+2}
      x=e+1;
    }
  }
  // 2) 층계 발판: 어느 층에서든 2~3칸씩 지그재그로 위로 (점프 높이 3칸 안). 한쪽 발판은 위 1줄만, 바위 턱은 위아래 1줄씩 비어 있으면 됨
  let placed=0;const maxN=Math.round(cols/3);
  const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const fits=(x0,w,ty,ch)=>ty>=4&&(ch==='#'?boxFree(x0-1,x0+w,ty-1,ty+1):boxFree(x0-1,x0+w,ty-1,ty));
  for(let x=7;x<cols-8&&placed<maxN;x++){
    if(ban[x])continue;
    const ss=surfs(x);if(!ss.length)continue;
    let cur=ss[Math.floor(rnd()*ss.length)],cx=x,dir=rnd()<0.5?-1:1,n=0;
    for(let lv=0;lv<4&&placed<maxN;lv++){
      let done=false;const ch=rnd()<solidP?'#':plat;
      for(const dy of shuf([2,3]))for(const w of [ri(3,4),2])for(const dx of lv?[dir*ri(2,3),-dir*2]:[0,1]){
        if(done)break;const ty=cur-dy,x0=cx+dx;
        if(!fits(x0,w,ty,ch))continue;
        put(x0,x0+w-1,ty,ch);placed++;n++;cur=ty;cx=x0;dir=-dir;done=true}
      if(!done)break;
    }
    if(n)x+=ri(3,5);
  }
  // 4) 큰 빈 공간: 사방 2칸이 비어 있는 곳에 작은 바위 덩어리나 발판 (3칸 격자로 훑음)
  for(let pass=0;pass<2;pass++)for(let y=4;y<ROWS-3;y+=ri(2,3))for(let x=7;x<cols-9;x+=ri(3,4)){
    const w=ri(2,3),h=rnd()<0.3?2:1,ch=rnd()<Math.max(solidP,0.5)?'#':plat;
    if(boxFree(x-1,x+w,y-2,y+h+1)&&rnd()<0.7)for(let i=0;i<h;i++)put(x,x+w-1,y+i,ch==='#'||i===0?ch:'#')}
  // 3) 천장 돌출: 천장(맨 윗줄이 막힘)이 있고 위 출구가 없는 방
  if(!ex.up)for(let x=7;x<cols-8;x+=ri(4,7)){
    if(m[0][x]!=='#'||rnd()<0.4)continue;
    let y=0;while(y<ROWS&&m[y][x]==='#')y++;
    const w=ri(1,3),h=ri(1,2);
    if(y+h+3<ROWS&&boxFree(x,x+w-1,y,y+h+2))for(let i=0;i<h;i++)put(x,x+w-1,y+i,'#');
  }
  return m;
}
