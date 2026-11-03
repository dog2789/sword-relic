/* 도트 그리기 헬퍼 */
export function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}
export function px(x,col,X,Y,w=1,h=1){x.fillStyle=col;x.fillRect(X,Y,w,h)}
export function fromRows(rows,pal){const w=Math.max(...rows.map(r=>r.length)),h=rows.length;const[c,x]=cv(w,h);
  rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const col=pal[r[i]];if(col)px(x,col,i,y)}});return c}
export function archFill(x,col,cx,top,r,bottom){for(let dy=0;dy<=r;dy++){const hw=Math.floor(Math.sqrt(r*r-(r-dy)*(r-dy)));px(x,col,cx-hw,top+dy,hw*2,1)}px(x,col,cx-r,top+r,r*2,bottom-top-r)}
export function arcTex(r,th,a0,a1,cols){const w=r+3,h=2*r+3;const[c,x]=cv(w,h);const cx=1,cy=r+1;
  for(let y=0;y<h;y++)for(let X=0;X<w;X++){const dx=X-cx,dy=y-cy,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)*180/Math.PI;
    if(d<=r&&a>=a0&&a<=a1){const edge=Math.min(a-a0,a1-a)/((a1-a0)/2);const allow=th*Math.min(1,edge*1.6);
      if(r-d<allow){const t=(r-d)/th;px(x,t<.3?cols[0]:t<.65?cols[1]:cols[2],X,y)}}}
  return c}
