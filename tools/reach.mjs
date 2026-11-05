// 방마다 실제 점프 물리(속도 92, 점프 300, 2단 270, 중력 820)로 갈 수 있는 곳을 탐색해서
// 들어온 곳에서 못 가는 출구 / 못 닿는 상자·수정·스위치·횃불 등을 찾음
// 사용: node reach.mjs <root> [방id,...] [--nodj]
import {pathToFileURL} from 'url';
const root=process.argv[2],only=(process.argv[3]&&!process.argv[3].startsWith('--'))?process.argv[3].split(','):null;
const DJ=!process.argv.includes('--nodj');
const {ROOMS,buildRoomMap,roomChests}=await import(pathToFileURL(root+'/src/world/rooms.js'));
const T=16,ROWS=14,LH=ROWS*T,G=820,SPD=92,JMP=300,DT=1/60,BW=9,BH=14;

function analyze(id){
  const R=ROOMS[id],m=buildRoomMap(id),cols=R.cols,LW=cols*T,ex=R.exits||{};
  const at=(tx,ty)=>(tx<0||tx>=cols)?'.':(ty<0)?'.':(ty>=ROWS)?'.':m[ty][tx];
  // 동적으로 막히는 칸: 철문, 문, 부서지는 벽
  const gates=(R.gates||[]).map(g=>({...g,cells:Array.from({length:g.h||3},(_,j)=>[g.tx,g.ty+j]),open:!!g.boss}));
  const doors=(R.doors||[]).map(d=>({...d}));   // 열쇠 문은 열쇠를 얻었다고 보고 열린 것으로
  const breaks=(R.breaks||[]).map(b=>({...b,cells:Array.from({length:b.h||3},(_,j)=>[b.tx,b.ty+j]),open:false}));
  const plats=[];   // 한쪽 발판 [x0,x1,y]
  (R.movers||[]).forEach(d=>{const x0=d.tx*T,y0=d.ty*T,r=d.range*T;
    if(d.axis==='x')for(let s=0;s<=r;s+=8)plats.push([x0+s,x0+s+d.w*T,y0]);else for(let s=0;s<=r;s+=4)plats.push([x0,x0+d.w*T,y0+s])});
  [...(R.fallers||[]),...(R.clouds||[])].forEach(d=>plats.push([d.tx*T,d.tx*T+d.w*T,d.ty*T]));
  (R.crates||[]).forEach(c=>plats.push([c.tx*T,c.tx*T+T,c.ty*T]));
  const mush=(R.mushrooms||[]).map(d=>({x:d.tx*T+8,y:(d.ty+1)*T}));
  const ups=(R.updrafts||[]).map(d=>({x0:d.tx*T,x1:(d.tx+d.w)*T,y0:d.ty0*T,y1:(d.ty1+1)*T}));
  const blockCell=new Map();
  const rebuild=()=>{blockCell.clear();for(const g of gates)if(!g.open)g.cells.forEach(([x,y])=>blockCell.set(x+','+y,1));for(const b of breaks)if(!b.open)b.cells.forEach(([x,y])=>blockCell.set(x+','+y,1))};
  const solidT=(tx,ty,sw)=>{if(tx<0||tx>=cols)return false;if(ty<0||ty>=ROWS)return false;const c=m[ty][tx];
    if(c==='#')return true;if(c==='A')return !sw;if(c==='B')return sw;return blockCell.has(tx+','+ty)};
  const hazard=(c)=>c==='^'||c==='L'||c==='S';
  const solidBox=(x,y,sw)=>{const tx0=Math.floor(x/T),tx1=Math.floor((x+BW-0.01)/T),ty0=Math.floor(y/T),ty1=Math.floor((y+BH-0.01)/T);
    for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++)if(solidT(tx,ty,sw))return true;return false};
  const onewayTop=(x,yPrevBot,yBot,sw)=>{   // 아래로 내려가다 한쪽 발판 윗면을 지나면 그 y
    const ty=Math.floor((yBot-0.01)/T);if(ty<0||ty>=ROWS)return null;const top=ty*T;
    if(yPrevBot<=top+0.01&&yBot>=top){const tx0=Math.floor(x/T),tx1=Math.floor((x+BW-0.01)/T);
      for(let tx=tx0;tx<=tx1;tx++){const c=at(tx,ty);if(c==='-'||c==='='||(c==='H'&&at(tx,ty-1)!=='H'&&ty>0))return top}}
    for(const [a,b,py] of plats)if(x+BW>a&&x<b&&yPrevBot<=py+0.01&&yBot>=py)return py;
    return null};
  // 노드: s(서 있음) / l(사다리) / w(물) — 키: kind,tx,row,sw
  const visited=new Set(),cells=new Set(),exitsHit=new Set();let queue=[];
  const markCell=(cx,cy)=>cells.add(Math.floor(cx/T)+','+Math.floor(cy/T));
  const push=(k,tx,ty,sw)=>{const key=k+','+tx+','+ty+','+(sw?1:0);if(visited.has(key))return;visited.add(key);queue.push([k,tx,ty,sw]);markCell(tx*T+8,ty*T+8)};
  // 서 있을 자리: (tx, ty) = 몸이 있는 줄, 발밑(ty+1)이 디딤
  const standAt=(cx,feetY,sw)=>{const tx=Math.floor(cx/T),ty=Math.round(feetY/T)-1;return[tx,ty]};
  // 궤적: 시작 몸 왼쪽 위 (x,y), 속도, 입력 함수
  function fly(x,y,vx0,vy,sw,plan){
    let t=0,air=plan.dj?1:0,usedDJ=false,prevDir=0;plan._out=0;plan._r=0;
    for(let i=0;i<260;i++){t+=DT;const dir=plan.dir(t);let vx=dir*SPD;
      const cx=x+BW/2,cy=y+BH/2;const inW=at(Math.floor(cx/T),Math.floor(cy/T))==='~';
      if(inW&&plan._out){push('w',Math.floor(cx/T),Math.floor(cy/T),sw);return}if(!inW)plan._out=1;
      let g=G;for(const u of ups)if(cx>=u.x0&&cx<u.x1&&cy>=u.y0&&cy<u.y1){vy=Math.max(-175,vy-2000*DT);g=0;if(plan.dj)air=1}
      if(plan.dj&&air>0&&!usedDJ&&t>=plan.djT){vy=-JMP*0.9;air=0;usedDJ=true}
      // 점프 키를 계속 누르고 있다고 봄 (최대 높이)
      if(plan.rel&&t>=plan.rel&&!plan._r&&vy<-120){vy*=0.6;plan._r=1}
      vy+=g*DT;if(vy>600)vy=600;
      // x 이동
      let nx=x+vx*DT;
      if(nx<-BW){exitsHit.add('left');return}if(nx>LW){exitsHit.add('right');return}
      if(solidBox(nx,y,sw)){nx=vx>0?Math.floor((nx+BW)/T)*T-BW-0.01:Math.ceil(nx/T)*T+0.01;if(solidBox(nx,y,sw))nx=x}
      x=nx;
      // y 이동
      let ny=y+vy*DT;
      if(ny<-BH){if(ex.up){exitsHit.add('up');return}ny=-BH}
      if(ny>LH){if(ex.down)exitsHit.add('down');return}
      if(vy<0&&solidBox(x,ny,sw)){ny=Math.ceil(ny/T)*T+0.01;vy=0;if(solidBox(x,ny,sw))ny=y}
      else if(vy>0){
        if(solidBox(x,ny,sw)){const top=Math.floor((ny+BH)/T)*T;ny=top-BH;   // 착지
          const ctx=Math.floor((x+BW/2)/T),fty=Math.floor(top/T);
          if(hazard(at(ctx,fty-1))||hazard(at(ctx,fty)))return;
          const[sx,sy]=standAt(x+BW/2,top,sw);push('s',sx,sy,sw);return}
        const ow=onewayTop(x,y+BH,ny+BH,sw);
        if(ow!=null){// 버섯이면 튕김
          const mu=mush.find(o=>Math.abs(x+BW/2-o.x)<10&&Math.abs(ow-o.y)<14);
          const[sx,sy]=standAt(x+BW/2,ow,sw);push('s',sx,sy,sw);if(!mu)return}
        const mu=mush.find(o=>Math.abs(x+BW/2-o.x)<10&&ny+BH>=o.y-12&&ny+BH<=o.y+1);
        if(mu){vy=-480;if(plan.dj&&usedDJ){air=0}}
      }
      y=ny;const ccx=x+BW/2,ccy=y+BH/2;markCell(ccx,ccy);
      const c=at(Math.floor(ccx/T),Math.floor((y+BH-2)/T));if(c==='^'||c==='L'||at(Math.floor(ccx/T),Math.floor(ccy/T))==='L')return;
      if(c==='S'){push('sand',Math.floor(ccx/T),Math.floor((y+BH-2)/T),sw);return}
      // 사다리 잡기: 사다리 칸에 들어가면 ↑로 잡을 수 있음
      const lc=at(Math.floor(ccx/T),Math.floor(ccy/T));if(lc==='H'||lc==='V')push('l',Math.floor(ccx/T),Math.floor(ccy/T),sw);
    }
  }
  const plans=[];
  for(const d of [-1,0,1]){plans.push({dir:()=>d,dj:false});if(DJ)for(const tt of [0.15,0.3,0.45,0.6])plans.push({dir:()=>d,dj:true,djT:tt})}
  for(const d of [-1,0,1])for(const rel of [0.06,0.12]){plans.push({dir:()=>d,dj:false,rel});if(DJ)plans.push({dir:()=>d,dj:true,djT:0.3,rel})}
  for(const d of [-1,1])for(const tw of [0.2,0.35]){plans.push({dir:t=>t<tw?0:d,dj:false});if(DJ)plans.push({dir:t=>t<tw?0:d,dj:true,djT:0.45})}
  // 이웃 노드
  function expand([k,tx,ty,sw]){
    const cx=tx*T+8;
    if(k==='s'){const feet=(ty+1)*T,y=feet-BH;
      for(const off of [-4,0,4]){const x=cx-BW/2+off;if(solidBox(x,y,sw))continue;
        for(const p of plans){p._r=0;fly(x,y,0,-JMP,sw,p)}   // 점프
      }
      for(const d of [-1,1]){// 걷기
        const ntx=tx+d;if(ntx<0){exitsHit.add('left');continue}if(ntx>=cols){exitsHit.add('right');continue}
        const x=ntx*T+8-BW/2;if(solidBox(x,y,sw))continue;
        if(solidT(ntx,ty+1,sw)||'-='.includes(at(ntx,ty+1))||(at(ntx,ty+1)==='H'&&at(ntx,ty)!=='H')||plats.some(([a,b,py])=>Math.abs(py-feet)<2&&x+BW>a&&x<b)){if(!hazard(at(ntx,ty+1))&&!hazard(at(ntx,ty)))push('s',ntx,ty,sw)}
        else{const ex0=d>0?tx*T+T-BW/2+1:tx*T-BW/2-1;   // 끝에서 떨어짐
          fly(ex0,y,0,0,sw,{dir:()=>d,dj:false});if(DJ)for(const tt of [0.1,0.3,0.5])fly(ex0,y,0,0,sw,{dir:()=>d,dj:true,djT:tt});fly(ex0,y,0,0,sw,{dir:()=>0,dj:false})}}
      // 발밑 사다리로 내려가기 / 발판 아래로 내려가기(↓+점프)
      if('HV'.includes(at(tx,ty+1)))push('l',tx,ty+1,sw);
      if('HV'.includes(at(tx,ty)))push('l',tx,ty,sw);
      for(const [i,po] of (R.portals||[]).entries())if(po.tx===tx){const t2=(R.portals||[])[po.to];if(t2){let yy=t2.ty!=null?t2.ty:(()=>{let y=0;while(y<ROWS&&m[y][t2.tx]==='#')y++;for(;y<ROWS;y++)if('#-='.includes(m[y][t2.tx]))return y-1;return ROWS-1})();push('s',t2.tx,yy,sw)}}
      if('-='.includes(at(tx,ty+1)))fly(cx-BW/2,feet-BH+3,0,0,sw,{dir:()=>0,dj:false});
    }
    if(k==='l'){
      for(const d of [-1,1]){const ny=ty+d;if(ny<0){if(ex.up)exitsHit.add('up');continue}if(ny>=ROWS){if(ex.down)exitsHit.add('down');continue}
        if('HV'.includes(at(tx,ny)))push('l',tx,ny,sw);
        else if(d<0&&!solidT(tx,ny,sw))push('s',tx,ny,sw)}   // 사다리 꼭대기 위로 올라섬
      const y=ty*T+8-BH/2;
      for(const d of [-1,0,1]){fly(cx-BW/2,y,0,-JMP*0.75,sw,{dir:()=>d,dj:false});if(DJ)fly(cx-BW/2,y,0,-JMP*0.75,sw,{dir:()=>d,dj:true,djT:0.3});fly(cx-BW/2,y,0,0,sw,{dir:()=>d,dj:false})}
      if(solidT(tx,ty+1,sw))push('s',tx,ty,sw);
    }
    if(k==='w'){
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=tx+dx,ny=ty+dy;if(ny<0){if(ex.up)exitsHit.add('up');continue}if(ny>=ROWS){if(ex.down)exitsHit.add('down');continue}if(nx<0){exitsHit.add('left');continue}if(nx>=cols){exitsHit.add('right');continue}
        if(at(nx,ny)==='~')push('w',nx,ny,sw);else if(!solidT(nx,ny,sw)&&dy===0)fly(nx*T+8-BW/2,ny*T+2,0,-100,sw,{dir:()=>dx,dj:false})}
      const surf=at(tx,ty-1)!=='~';
      for(const d of [-1,0,1]){fly(cx-BW/2,ty*T+1,0,surf?-290:-165,sw,{dir:()=>d,dj:false});if(DJ&&surf)for(const tt of [0.15,0.3])fly(cx-BW/2,ty*T+1,0,-290,sw,{dir:()=>d,dj:true,djT:tt})}
    }
    if(k==='sand'){/* 모래 늪: 빠져나오려면 2단 점프 정도. 단순히 위로 2단 점프 */
      if(DJ)for(const d of [-1,0,1])fly(cx-BW/2,ty*T+2,0,-JMP*0.9,sw,{dir:()=>d,dj:false})}
  }
  // 상호작용: 스위치(전환), 횃불, 부서지는 벽, 철문 안쪽
  const near=(tx,ty,r=1)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(cells.has((tx+dx)+','+(ty+dy)))return true;return false};
  const sws=R.switches||[];
  const torches=(R.torches||[]).map(t=>({...t,lit:false}));
  function entryNodes(e){
    const sw=false,out=[];
    const edge=tx=>{// floorTopY: 아래에서부터 이어진 땅의 윗면, 없으면 위에서부터 첫 디딤
      let y=ROWS-1;while(y>=0&&m[y][tx]==='#')y--;let top=(y+1);
      if(top>=ROWS){let yy=0;while(yy<ROWS&&m[yy][tx]==='#')yy++;for(;yy<ROWS;yy++)if('#-='.includes(m[yy][tx]))break;top=yy}
      return top-1};
    if(e==='left')out.push(['s',0,edge(0),sw]);
    if(e==='right')out.push(['s',cols-1,edge(cols-1),sw]);
    if(e==='top'){const tx=ex.up.tx;if('HV'.includes(at(tx,0)))out.push(['l',tx,0,sw]);else out.push(['fall',tx,0,sw])}
    if(e==='bottom'){const tx=ex.down.tx;if('HV'.includes(at(tx,ROWS-1)))out.push(['l',tx,ROWS-1,sw]);else out.push(['jumpin',tx,ROWS-1,sw])}
    return out}
  function run(entries){
    rebuild();visited.clear();queue=[];
    for(const [k,tx,ty,sw] of entries){
      if(k==='fall'){for(const d of [-1,0,1])for(const tw of [0,0.5,1,1.5,2.5])fly(tx*T+8-BW/2,0,0,0,sw,{dir:t=>t<tw?0:d,dj:false})}
      else if(k==='jumpin'){for(const d of [-1,0,1])for(const tw of [0,0.5,1,1.5,2.5])fly(tx*T+8-BW/2,LH-BH,0,-JMP,sw,{dir:t=>t<tw?0:d,dj:DJ,djT:0.3})}
      else push(k,tx,ty,sw)}
    // 스위치가 닿으면 반대 상태로도 갈 수 있음 → 같은 자리에서 sw 반전
    while(queue.length){const n=queue.shift();expand(n);
      const [k,tx,ty,sw]=n;for(const s of sws)if(Math.abs(s.tx-tx)<=1&&Math.abs(s.ty-ty)<=1)push(k,tx,ty,!sw)}
  }
  const results={};
  const ents=[];if(ex.left)ents.push('left');if(ex.right)ents.push('right');if(ex.up)ents.push('top');if(ex.down)ents.push('bottom');
  for(const e of ents){
    for(const g of gates)g.open=!!g.boss;for(const b of breaks)b.open=false;torches.forEach(t=>t.lit=false);
    cells.clear();exitsHit.clear();
    for(let it=0;it<6;it++){run(entryNodes(e));let ch=false;
      for(const b of breaks)if(!b.open&&b.cells.some(([x,y])=>near(x,y))){b.open=true;ch=true}
      for(const t of torches)if(!t.lit&&near(t.tx,t.ty)){t.lit=true}
      for(const g of gates)if(!g.open){
        const ts=torches.filter(t=>t.gate===g.id),ps=(R.plates||[]).filter(p=>p.gate===g.id);
        if(ts.length&&ts.every(t=>t.lit)){g.open=true;ch=true}
        else if(ps.length&&ps.every(p=>near(p.tx,p.ty,0))){g.open=true;ch=true}   // 누름판에 서 볼 수 있으면 (상자 퍼즐은 따로 봐야 함)
        else if(!g.lock){const xs=[...ts.map(t=>t.tx),...ps.map(p=>p.tx)];if(xs.length){const side=Math.sign(xs.reduce((a,b)=>a+b,0)/xs.length-g.tx);
          if(g.cells.some(([x,y])=>cells.has((x-side)+','+y))){g.open=true;ch=true}}}}
      if(!ch)break}
    const exits=new Set(exitsHit);
    const miss=[];
    for(const c of roomChests(R)){const ty=c.ty!=null?c.ty:(()=>{let y=0;while(y<ROWS&&m[y][c.tx]==='#')y++;for(;y<ROWS;y++)if('#-='.includes(m[y][c.tx]))return y-1;return ROWS-1})();if(!near(c.tx,ty))miss.push('상자 '+c.id+'@'+c.tx+','+ty)}
    if(R.crystal&&!near(Math.floor(R.crystal.tx),R.crystal.ty))miss.push('수정 '+R.crystal.id);
    for(const s of sws)if(!near(s.tx,s.ty))miss.push('스위치@'+s.tx+','+s.ty);
    for(const t of torches)if(!t.lit)miss.push('횃불@'+t.tx+','+t.ty);
    for(const g of gates)if(!g.open)miss.push('철문 '+g.id);
    for(const p of (R.plates||[]))if(!near(p.tx,p.ty))miss.push('누름판@'+p.tx);
    for(const c of (R.crates||[]))if(!near(c.tx,c.ty))miss.push('나무상자@'+c.tx);
    results[e]={exits:[...exits],miss};
  }
  return{ents,results};
}
const want={left:'left',right:'right',top:'up',bottom:'down'};
for(const id of Object.keys(ROOMS)){if(only&&!only.includes(id))continue;
  let r;try{r=analyze(id)}catch(e){console.log(id,'ERR',e.message);continue}
  const R=ROOMS[id],lines=[];
  const allExits=r.ents.map(e=>want[e]);
  for(const e of r.ents){const res=r.results[e];const noEx=allExits.filter(x=>x!==want[e]&&!res.exits.includes(x));
    if(noEx.length||res.miss.length)lines.push(`  ${e}에서 들어옴 → 못 가는 출구: ${noEx.join(',')||'-'} / 못 닿음: ${res.miss.join(', ')||'-'}`)}
  // 모든 입구에서 다 못 닿는 것만 진짜 문제 (어느 한쪽에서라도 닿으면 OK)
  const allMiss=r.ents.length?r.results[r.ents[0]].miss.filter(x=>r.ents.every(e=>r.results[e].miss.includes(x))):[];
  if(lines.length)console.log(`== ${id} ${R.name}${allMiss.length?'  ★어디서도 못 닿음: '+allMiss.join(', '):''}\n`+lines.join('\n'));
}
