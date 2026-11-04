/* 지역 테마 그리기: meadow(초원) / cave(동굴) / treetop(나무 위)
   먼 배경(far), 중간 배경(mid), 레벨 타일과 장식(level) */
import {W,H,T,HUD,ROWS,LH} from '../config.js';
import {rng,cv,px} from '../gfx/pixel.js';
import {floorTopY} from './rooms.js';

function disc(x,col,cx,cy,r){for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let X=Math.floor(cx-r);X<=cx+r;X++)if((X-cx)**2+(y-cy)**2<=r*r)px(x,col,X,y)}

export function drawFar(lw){
  const FW=Math.ceil(W+(lw-W)*0.1)+4,FH=Math.ceil(H+(LH+HUD-H)*0.1)+4,r=rng(5);
  const[c,x]=cv(FW,FH);
  const top=[108,192,238],bot=[212,240,250];
  for(let y=0;y<FH;y+=6){const t=Math.min(1,y/(FH*0.85));px(x,`rgb(${top.map((v,i)=>Math.round(v+(bot[i]-v)*t)).join(',')})`,0,y,FW,6)}
  disc(x,'#fffbe0',Math.round(FW*0.72),30,13);disc(x,'#fff3b0',Math.round(FW*0.72),30,10);
  const range=(col,base,peaks,snow)=>{for(let X=0;X<FW;X++){let h=0;for(const[pxk,ph,pw]of peaks)h=Math.max(h,ph-Math.abs(X-pxk)*ph/pw);
    const y0=Math.round(base-h);px(x,col,X,y0,1,FH-y0);if(snow&&h>snow)px(x,'#eef6fb',X,y0,1,Math.round((h-snow)*0.6))}};
  const pk=[];for(let i=0;i<FW/70+1;i++)pk.push([i*70+20+r()*30,30+r()*26,46+r()*20]);
  range('#a8cde2',128,pk,44);
  const pk2=[];for(let i=0;i<FW/50+1;i++)pk2.push([i*50+r()*30,18+r()*16,40+r()*14]);
  range('#8fbcd6',140,pk2,0);
  return c;
}

export function drawMid(lw){
  const MW=Math.ceil(W+(lw-W)*0.35)+4,MH=Math.ceil(H+(LH+HUD-H)*0.35)+4,r=rng(9);
  const[c,x]=cv(MW,MH);
  const hill=(col,base,amp,f,ph)=>{const ys=[];for(let X=0;X<MW;X++){const y0=Math.round(base+amp*Math.sin(X/f+ph)+amp*0.5*Math.sin(X/(f*0.43)+ph*2));ys.push(y0);px(x,col,X,y0,1,MH-y0)}return ys};
  const back=hill('#9ad27c',112,9,38,0.3);
  for(let X=8;X<MW;X+=14+(r()*18|0)){const y0=back[X];px(x,'#6a4a32',X,y0-6,2,6);disc(x,'#5ea548',X+1,y0-11,6+r()*3|0);disc(x,'#78bd5a',X-1,y0-13,3)}
  const front=hill('#74bd56',136,7,27,1.2);
  for(let X=0;X<MW;X+=3)if(r()<0.25)px(x,'#8fd06a',X,front[X]-1);
  return c;
}

export function drawCaveFar(lw){
  const FW=Math.ceil(W+(lw-W)*0.1)+4,FH=Math.ceil(H+(LH+HUD-H)*0.1)+4,r=rng(3);
  const[c,x]=cv(FW,FH);
  for(let y=0;y<FH;y+=6){const t=y/FH;px(x,`rgb(${18+t*10|0},${14+t*8|0},${32+t*14|0})`,0,y,FW,6)}
  for(let X=0;X<FW;X+=10+(r()*16|0)){const h=10+(r()*30|0),w=6+(r()*8|0);for(let yy=0;yy<h;yy++){const hw=Math.max(0,Math.round(w*(1-yy/h)/2));px(x,'#0e0b18',X-hw,yy,hw*2+1,1)}}
  for(let i=0;i<40;i++)px(x,r()<.5?'#3a6a8a':'#5a3a7a',r()*FW|0,30+r()*(FH-40)|0);
  return c;
}
export function drawCaveMid(lw){
  const MW=Math.ceil(W+(lw-W)*0.35)+4,MH=Math.ceil(H+(LH+HUD-H)*0.35)+4,r=rng(4);
  const[c,x]=cv(MW,MH);
  for(let X=10;X<MW;X+=60+(r()*40|0)){const w=16+(r()*14|0);px(x,'#231d33',X,0,w,MH);px(x,'#2c2540',X,0,3,MH);
    for(let y=20;y<MH;y+=14+(r()*10|0))px(x,'#1b1628',X+3+(r()*(w-6)|0),y,3,2)}
  for(let X=0;X<MW;X+=8+(r()*14|0)){const h=8+(r()*18|0);for(let yy=0;yy<h;yy++){const hw=Math.round(4*(yy/h));px(x,'#1f1a2e',X-hw,MH-h+yy,hw*2+1,1)}}
  for(let i=0;i<14;i++){const gx=r()*MW|0,gy=MH-20-(r()*60|0),col=r()<.5?'#5fe0ff':'#c07aff';px(x,col,gx,gy,2,2);x.fillStyle='rgba(120,220,255,0.08)';x.fillRect(gx-3,gy-3,8,8)}
  return c;
}
export function drawTreetopMid(lw){
  const MW=Math.ceil(W+(lw-W)*0.35)+4,MH=Math.ceil(H+(LH+HUD-H)*0.35)+4,r=rng(6);
  const[c,x]=cv(MW,MH);
  for(let X=-10;X<MW+20;X+=18+(r()*16|0)){const cy=MH-30+(r()*20|0),rr=16+(r()*12|0);disc(x,'#4f9a3f',X,cy,rr);disc(x,'#6ab84e',X-4,cy-6,rr*0.5)}
  for(let X=-10;X<MW+20;X+=14+(r()*12|0)){const cy=MH-8+(r()*10|0);disc(x,'#3a7a32',X,cy,14+(r()*8|0))}
  return c;
}

export function drawIceFar(lw){
  const FW=Math.ceil(W+(lw-W)*0.1)+4,FH=Math.ceil(H+(LH+HUD-H)*0.1)+4,r=rng(21);
  const[c,x]=cv(FW,FH);
  for(let y=0;y<FH;y+=4){const t=y/FH;px(x,`rgb(${90+t*60|0},${140+t*60|0},${200+t*40|0})`,0,y,FW,4)}
  for(let X=0;X<FW;X+=6+(r()*20|0)){const h=20+(r()*60|0);for(let yy=0;yy<h;yy++){const hw=Math.round(6*(1-yy/h));px(x,'#b8dcf4',X-hw,FH-yy,hw*2+1,1)}}
  for(let i=0;i<60;i++)px(x,'#ffffff',r()*FW|0,r()*FH|0,1,1);
  return c;
}
export function drawIceMid(lw){
  const MW=Math.ceil(W+(lw-W)*0.35)+4,MH=Math.ceil(H+(LH+HUD-H)*0.35)+4,r=rng(22);
  const[c,x]=cv(MW,MH);
  for(let X=8;X<MW;X+=50+(r()*40|0)){const w=14+(r()*12|0);px(x,'#7aaad8',X,0,w,MH);px(x,'#a8d4f4',X+2,0,3,MH);px(x,'#5a8ab8',X+w-3,0,3,MH);
    for(let k=0;k<5;k++){const ix=X+(r()*w|0),ih=6+(r()*14|0);for(let d=0;d<ih;d++)px(x,'#cfeaff',ix,(r()*MH|0)+d,1,1)}}
  for(let i=0;i<30;i++){const sx=r()*MW|0,sy=r()*MH|0;px(x,'#ffffff',sx,sy,2,2)}
  return c;
}
/* 성 안: 뒤쪽은 어두운 돌벽과 아치 창문(달빛 밤하늘), 앞쪽은 기둥·붉은 깃발·횃불 */
export function drawDesertFar(lw){
  const FW=Math.ceil(W+(lw-W)*0.1)+4,FH=Math.ceil(H+(LH+HUD-H)*0.1)+4,r=rng(31);
  const[c,x]=cv(FW,FH);
  for(let y=0;y<FH;y+=4){const t=y/FH;px(x,`rgb(${240-t*20|0},${190-t*30|0},${120-t*40|0})`,0,y,FW,4)}
  disc(x,'#fff6c8',Math.round(FW*0.7),34,14);disc(x,'#ffe890',Math.round(FW*0.7),34,10);
  for(let X=30;X<FW;X+=120+(r()*60|0)){const b=150,h=38+(r()*20|0);for(let yy=0;yy<h;yy++){px(x,'#c89a60',X-yy,b-h+yy,yy*2+1,1);px(x,'#a87a48',X,b-h+yy,yy+1,1)}}
  for(let X=0;X<FW;X++){const y0=Math.round(150+Math.sin(X/40)*6+Math.sin(X/17)*3);px(x,'#d8aa70',X,y0,1,FH-y0)}
  return c;
}
export function drawDesertMid(lw){
  const MW=Math.ceil(W+(lw-W)*0.35)+4,MH=Math.ceil(H+(LH+HUD-H)*0.35)+4,r=rng(32);
  const[c,x]=cv(MW,MH);
  for(let X=0;X<MW;X++){const y0=Math.round(150+Math.sin(X/55+1)*10+Math.sin(X/23)*4);px(x,'#e0b478',X,y0,1,MH-y0);px(x,'#f0c890',X,y0,1,1)}
  for(let X=30;X<MW;X+=70+(r()*60|0)){const G=Math.round(150+Math.sin(X/55+1)*10+Math.sin(X/23)*4);
    if(r()<.5){px(x,'#3f7a3a',X-1,G-20,3,20);px(x,'#3f7a3a',X-6,G-14,5,2);px(x,'#3f7a3a',X-6,G-18,2,5);px(x,'#3f7a3a',X+2,G-12,5,2);px(x,'#3f7a3a',X+5,G-16,2,5)}
    else{px(x,'#8a5a30',X,G-30,2,30);for(let k=0;k<5;k++){const a=k*1.2;for(let d=0;d<10;d++)px(x,'#4a8a3a',X+Math.round(Math.cos(a)*d),G-30+Math.round(Math.sin(a)*d*0.5+d*0.2),2,1)}}}
  return c;
}
export function drawLavaFar(lw){
  const FW=Math.ceil(W+(lw-W)*0.1)+4,FH=Math.ceil(H+(LH+HUD-H)*0.1)+4,r=rng(41);
  const[c,x]=cv(FW,FH);
  for(let y=0;y<FH;y+=4){const t=y/FH;px(x,`rgb(${40+t*60|0},${12+t*14|0},${16+t*6|0})`,0,y,FW,4)}
  const vx=Math.round(FW*0.45);for(let yy=0;yy<90;yy++){const hw=8+yy;px(x,'#2a1418',vx-hw,70+yy,hw*2,1)}
  px(x,'#ff6a1a',vx-6,66,12,4);for(let k=0;k<20;k++)px(x,'#ff8a2a',vx-3+(r()*6|0),70+(r()*40|0),1,3);
  for(let i=0;i<50;i++)px(x,r()<.5?'#ff8a2a':'#ffd060',r()*FW|0,r()*FH|0,1,1);
  return c;
}
export function drawLavaMid(lw){
  const MW=Math.ceil(W+(lw-W)*0.35)+4,MH=Math.ceil(H+(LH+HUD-H)*0.35)+4,r=rng(42);
  const[c,x]=cv(MW,MH);
  for(let X=0;X<MW;X+=10+(r()*16|0)){const h=30+(r()*60|0),w=10+(r()*10|0);for(let yy=0;yy<h;yy++){const hw=Math.round(w*(yy/h)/2)+1;px(x,'#1c1014',X-hw,MH-h+yy,hw*2,1)}}
  for(let X=40;X<MW;X+=90+(r()*60|0)){px(x,'#c0301a',X,0,6,MH);px(x,'#ff6a1a',X+1,0,3,MH);for(let y=0;y<MH;y+=7)px(x,'#ffd060',X+2,y+(r()*5|0),1,2)}
  return c;
}
export function drawCastleFar(lw){
  const FW=Math.ceil(W+(lw-W)*0.1)+4,FH=Math.ceil(H+(LH+HUD-H)*0.1)+4,r=rng(8);
  const[c,x]=cv(FW,FH);
  px(x,'#1c1a2c',0,0,FW,FH);
  for(let y=0;y<FH;y+=8)for(let X=(y/8%2)*8;X<FW;X+=16){px(x,'#24223a',X,y,15,7);px(x,'#2c2a44',X,y,15,1);if(r()<.1)px(x,'#1f1d30',X+3,y+3,4,2)}
  for(let X=18;X<FW-20;X+=58){const w=22,top=26,bot=110;
    px(x,'#12101e',X-3,top-3,w+6,bot-top+6);
    for(let y=top;y<bot;y++){const t=(y-top)/(bot-top);const half=y<top+11?Math.round(Math.sqrt(Math.max(0,121-(top+11-y)**2))):11;
      px(x,`rgb(${20+t*12|0},${30+t*20|0},${70+t*30|0})`,X+11-half,y,half*2,1)}
    for(let i=0;i<6;i++)px(x,'#ffffff',X+2+(r()*18|0),top+4+(r()*60|0),1,1);
    px(x,'#12101e',X+10,top,2,bot-top);px(x,'#12101e',X,top+40,w,2);
    px(x,'#5a5470',X-3,bot+2,w+6,3);px(x,'#7a7494',X-3,bot+2,w+6,1)}
  const mx=Math.round(FW*0.62);for(let yy=-9;yy<=9;yy++)for(let xx=-9;xx<=9;xx++){const d=xx*xx+yy*yy;if(d<=81){x.fillStyle=d<50?'rgba(255,250,220,0.10)':'rgba(255,250,220,0.05)';x.fillRect(mx+xx,40+yy,1,1)}}
  return c;
}
export function drawCastleMid(lw){
  const MW=Math.ceil(W+(lw-W)*0.35)+4,MH=Math.ceil(H+(LH+HUD-H)*0.35)+4,r=rng(12);
  const[c,x]=cv(MW,MH);
  for(let X=10;X<MW;X+=72+(r()*16|0)){const w=16;
    px(x,'#16141f',X-1,0,w+2,MH);px(x,'#3a3650',X,0,w,MH);px(x,'#4c4866',X+2,0,3,MH);px(x,'#2a2740',X+w-3,0,3,MH);
    for(let y=0;y<MH;y+=12)px(x,'#2e2b44',X,y,w,1);
    px(x,'#5a5674',X-3,MH-14,w+6,4);px(x,'#5a5674',X-3,6,w+6,4);px(x,'#6a6684',X-3,6,w+6,1);
    // 깃발
    const bx=X+w+12,bw=14,bh=40;px(x,'#8a6a2a',bx-2,14,bw+4,2);
    for(let y=0;y<bh;y++){const cut=y>bh-7?Math.abs(y-(bh-7))*2:0;px(x,y%9<1?'#a01a2a':'#c0303a',bx+Math.min(cut,bw/2),16+y,Math.max(0,bw-cut*2),1)}
    px(x,'#f0c040',bx+5,26,4,4);px(x,'#ffe27a',bx+6,27,2,2);
    // 횃불
    const tx=X-12;px(x,'#3a3448',tx,60,4,8);px(x,'#ff8a2a',tx,55,4,5);px(x,'#ffd060',tx+1,56,2,3);
    x.fillStyle='rgba(255,160,60,0.10)';x.fillRect(tx-8,46,20,24)}
  return c;
}

/* 레벨 타일과 장식. deco = 방 데이터의 deco */
const hexDark=h=>'#'+[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*0.72).toString(16).padStart(2,'0')).join('');
export function drawLevel(m,cols,seed,deco={},theme='meadow'){
  const lw=cols*T,r=rng(seed),[c,x]=cv(lw,LH);
  const at=(tx,ty)=>(ty<0||ty>=ROWS||tx<0||tx>=cols)?'#':m[ty][tx];
  const gy=tx=>floorTopY(m,tx);
  // 나무는 땅보다 먼저 (뒤에)
  (deco.trees||[]).forEach(tx=>{const X=tx*T+8,G=gy(tx);px(x,'#7a5232',X-2,G-26,4,26);px(x,'#5a3a22',X+1,G-26,1,26);
    disc(x,'#2f6f2e',X,G-30,13);disc(x,'#3f8f3a',X-1,G-33,12);disc(x,'#5fb24a',X-5,G-38,5);disc(x,'#3f8f3a',X+8,G-28,7)});
  (deco.bigtree||[]).forEach(tx=>{const X=tx*T+8,G=gy(tx);px(x,'#6e4a2c',X-6,G-58,12,58);px(x,'#4e321c',X+3,G-58,3,58);px(x,'#8a6038',X-5,G-58,2,58);
    px(x,'#6e4a2c',X-12,G-6,6,6);px(x,'#6e4a2c',X+6,G-5,6,5);
    [[0,-70,30],[-24,-60,20],[24,-62,20],[-10,-88,18],[14,-84,18]].forEach(([dx,dy,rr])=>disc(x,'#2f6f2e',X+dx,G+dy,rr));
    [[-2,-74,26],[-22,-64,16],[22,-66,16],[-10,-90,14],[14,-86,14]].forEach(([dx,dy,rr])=>disc(x,'#3f8f3a',X+dx,G+dy,rr));
    [[-12,-84,8],[-26,-68,6],[8,-92,6]].forEach(([dx,dy,rr])=>disc(x,'#5fb24a',X+dx,G+dy,rr))});
  for(let ty=0;ty<ROWS;ty++)for(let tx=0;tx<cols;tx++){
    const ch=m[ty][tx],X=tx*T,Y=ty*T;
    if(ch==='#'){
      const e={t:at(tx,ty-1)!=='#',b:at(tx,ty+1)!=='#',l:at(tx-1,ty)!=='#',rt:at(tx+1,ty)!=='#'};
      if(theme==='desert'){
        const deep=!e.t&&!e.b&&!e.l&&!e.rt;
        px(x,deep?'#b88a50':'#d8a868',X,Y,16,16);px(x,deep?'#a07840':'#c09050',X,Y+7,16,1);px(x,deep?'#a07840':'#c09050',X,Y+15,16,1);
        px(x,deep?'#a07840':'#c09050',X+((ty%2)?4:11),Y,1,7);px(x,deep?'#a07840':'#c09050',X+((ty%2)?11:4),Y+8,1,7);
        for(let k=0;k<3;k++)px(x,'#e8c088',X+(r()*15|0),Y+(r()*15|0),1,1);
        if(e.l)px(x,'#7a5a30',X,Y,1,16);if(e.rt)px(x,'#7a5a30',X+15,Y,1,16);if(e.b)px(x,'#7a5a30',X,Y+15,16,1);
        if(e.t){px(x,'#f0d090',X,Y,16,2);px(x,'#e0b878',X,Y+2,16,1);for(let k=0;k<16;k+=3)if(r()<.5)px(x,'#f8e0a8',X+k,Y-1,2,1)}
      }else if(theme==='lava'){
        const deep=!e.t&&!e.b&&!e.l&&!e.rt;
        px(x,deep?'#24181c':'#3a2a2e',X,Y,16,16);
        for(let k=0;k<5;k++)px(x,r()<.5?'#2c2024':'#4a3438',X+(r()*15|0),Y+(r()*15|0),r()<.3?2:1,1);
        if(r()<.35){let cx=X+(r()*12|0)+2,cy=Y+(r()*10|0)+3;for(let k=0;k<5;k++){px(x,k<2?'#ff8a2a':'#c0401a',cx,cy,1,1);cx+=r()<.5?1:0;cy+=1}}
        if(e.l)px(x,'#160e10',X,Y,1,16);if(e.rt)px(x,'#160e10',X+15,Y,1,16);if(e.b)px(x,'#160e10',X,Y+15,16,1);
        if(e.t){px(x,'#5a4448',X,Y,16,1);px(x,'#6a5054',X,Y+1,16,1)}
      }else if(theme==='ice'){
        const deep=!e.t&&!e.b&&!e.l&&!e.rt;
        px(x,deep?'#5a86b8':'#7fb0dc',X,Y,16,16);px(x,deep?'#6a96c8':'#a8d4f4',X+1,Y+1,6,1);px(x,'#4a76a8',X+9,Y+9,6,1);
        for(let k=0;k<3;k++)px(x,'#cfeaff',X+(r()*14|0)+1,Y+(r()*14|0)+1,2,1);
        if(e.l)px(x,'#3a5a88',X,Y,1,16);if(e.rt)px(x,'#3a5a88',X+15,Y,1,16);if(e.b)px(x,'#3a5a88',X,Y+15,16,1);
        if(e.t){px(x,'#ffffff',X,Y,16,3);px(x,'#e0f2ff',X,Y+3,16,1);for(let k=0;k<16;k+=2)if(r()<.4)px(x,'#ffffff',X+k,Y+3,2,1+(r()*2|0))}
        if(e.b&&r()<.5){const ix=X+3+(r()*9|0),ih=4+(r()*6|0);for(let d=0;d<ih;d++)px(x,d<2?'#e0f2ff':'#a8d4f4',ix+Math.floor(d/3),Y+16+d,Math.max(1,3-Math.floor(d/2)),1)}
      }else if(theme==='castle'){
        const deep=!e.t&&!e.b&&!e.l&&!e.rt;
        px(x,deep?'#7a7f8e':'#9a9fae',X,Y,16,16);
        px(x,deep?'#8a8f9e':'#c4c8d2',X,Y,16,1);px(x,deep?'#8a8f9e':'#b4b8c4',X,Y+8,16,1);
        px(x,'#5e6272',X,Y+7,16,1);px(x,'#5e6272',X,Y+15,16,1);
        px(x,'#5e6272',X+7,Y,1,7);px(x,'#5e6272',X+15,Y,1,7);px(x,'#5e6272',X+3,Y+8,1,7);px(x,'#5e6272',X+11,Y+8,1,7);
        for(let k=0;k<3;k++)px(x,'#868a98',X+(r()*16|0),Y+(r()*16|0));
        if(e.t)px(x,'#e0e4ec',X,Y,16,1);
        if(e.l)px(x,'#4a4e5a',X,Y,1,16);if(e.rt)px(x,'#4a4e5a',X+15,Y,1,16);if(e.b)px(x,'#4a4e5a',X,Y+15,16,1);
      }else if(theme==='cave'){
        const deep=!e.t&&!e.b&&!e.l&&!e.rt;
        px(x,deep?'#332d42':'#4a4458',X,Y,16,16);
        for(let k=0;k<6;k++)px(x,r()<.5?'#3a3448':'#5a5470',X+(r()*16|0),Y+(r()*16|0),r()<.3?2:1,1);
        if(e.l)px(x,'#241e32',X,Y,1,16);if(e.rt)px(x,'#241e32',X+15,Y,1,16);
        if(e.t){px(x,'#6a6488',X,Y,16,1);for(let k=0;k<16;k++){if(r()<.55)px(x,'#4f8a42',X+k,Y,1,1+(r()*2|0));if(r()<.12)px(x,'#7fc45a',X+k,Y-1)}}
        if(e.b){px(x,'#241e32',X,Y+15,16,1);for(let k=0;k<16;k+=3+(r()*4|0)){const h=1+(r()*4|0);for(let d=0;d<h;d++)px(x,'#3a3448',X+k,Y+16+d,Math.max(1,2-(d>>1)),1)}}
        if(e.t&&at(tx,ty-1)==='.'&&r()<.12){const fx=X+3+(r()*10|0),col=r()<.5?'#5fe0ff':'#c07aff';px(x,'#d8d0c0',fx,Y-3,1,3);px(x,col,fx-1,Y-4,3,1)}
      }else if(theme==='treetop'){
        px(x,'#7a5232',X,Y,16,16);px(x,'#9a6a42',X,Y,16,2);for(let k=0;k<4;k++)px(x,'#5a3a22',X+(r()*14|0),Y+3+(r()*11|0),3,1);
        if(e.b)px(x,'#4a2e18',X,Y+15,16,1);if(e.l)px(x,'#4a2e18',X,Y,1,16);if(e.rt)px(x,'#4a2e18',X+15,Y,1,16);
        for(let k=0;k<16;k++)if(r()<.3)px(x,'#5fa84a',X+k,Y-1);
      }else{
      const deep=!e.t&&at(tx,ty-2)==='#';
      px(x,deep?'#875a32':'#9a6a3c',X,Y,16,16);
      for(let k=0;k<5;k++)px(x,r()<.5?'#7a4e2a':'#b07a48',X+(r()*16|0),Y+(r()*16|0));
      if(r()<.25){const sx=X+(r()*13|0),sy=Y+4+(r()*10|0);px(x,'#c8b08a',sx,sy,3,2);px(x,'#9a8460',sx,sy+1,3,1)}
      if(e.l)px(x,'#5a3a20',X,Y,1,16);if(e.rt)px(x,'#5a3a20',X+15,Y,1,16);
      if(e.b){px(x,'#5a3a20',X,Y+15,16,1);for(let k=0;k<16;k++)if(r()<.15)px(x,'#6a4a2a',X+k,Y+16,1,1+(r()*3|0))}
      if(e.t){
        px(x,'#86d652',X,Y,16,1);px(x,'#62bc40',X,Y+1,16,2);px(x,'#4a9a34',X,Y+3,16,1);
        for(let k=0;k<16;k++){if(r()<.5)px(x,'#4a9a34',X+k,Y+4,1,1+(r()*2|0));if(r()<.3)px(x,'#86d652',X+k,Y-1);if(r()<.1)px(x,'#86d652',X+k,Y-2)}
        if(e.l){px(x,'#62bc40',X-1,Y+1,1,2)}if(e.rt){px(x,'#62bc40',X+16,Y+1,1,2)}
        if(at(tx,ty-1)==='.'){
          if(r()<.22){const fx=X+2+(r()*12|0),col=['#ff6a8a','#ffd84a','#ffffff','#b48aff'][r()*4|0];
            px(x,'#3f8a2a',fx,Y-3,1,3);px(x,col,fx-1,Y-4,3,1);px(x,col,fx,Y-5,1,1);px(x,'#ffe27a',fx,Y-4)}
          if(r()<.07&&tx>1&&tx<cols-2){const bx=X+8,by=Y-3;for(let yy=-5;yy<=2;yy++)for(let xx=-8;xx<=8;xx++){if((xx*xx)/64+(yy*yy)/25<=1)px(x,yy<-2?'#6fbf4a':'#4e9a36',bx+xx,by+yy)}}
        }
      }
      }
    }else if(ch==='-'){
      px(x,'#d89a58',X,Y,16,1);px(x,'#9a6236',X,Y+1,16,3);px(x,'#6a3e22',X,Y+4,16,1);px(x,'#2a1a12',X,Y+5,16,1);
      px(x,'#6a3e22',X+8,Y+1,1,3);px(x,'#e8d0a0',X+2,Y+2);px(x,'#e8d0a0',X+13,Y+2);
      if(at(tx-1,ty)!=='-'){px(x,'#5a3a22',X+1,Y+6,2,5);px(x,'#5a3a22',X+3,Y+6,3,1)}
      if(at(tx+1,ty)!=='-'){px(x,'#5a3a22',X+13,Y+6,2,5);px(x,'#5a3a22',X+10,Y+6,3,1)}
    }else if(ch==='='){
      px(x,'#2f6a20',X,Y+5,16,1);px(x,'#4e9a36',X,Y+1,16,4);px(x,'#7fd04f',X,Y,16,1);
      for(let k=0;k<16;k+=2){if(r()<.5)px(x,'#4e9a36',X+k,Y-1,2,1);if(r()<.4)px(x,'#2f6a20',X+k,Y+6,1,1+(r()*2|0));if(r()<.25)px(x,'#9fe06a',X+k,Y+2)}
    }else if(ch==='H'){
      px(x,'#4a2a14',X+2,Y,1,16);px(x,'#4a2a14',X+13,Y,1,16);px(x,'#8a5a32',X+3,Y,2,16);px(x,'#8a5a32',X+11,Y,2,16);
      for(let k=1;k<16;k+=5){px(x,'#c08a50',X+5,Y+k,6,2);px(x,'#6a3e22',X+5,Y+k+2,6,1)}
    }else if(ch==='V'){
      for(let k=0;k<16;k++){const yy=Y+k;px(x,'#2f6a20',X+6+Math.round(Math.sin(yy/3)*1.5),yy);px(x,'#3f8a2a',X+9+Math.round(Math.cos(yy/3)*1.5),yy)}
      for(let k=1;k<16;k+=5){px(x,'#6fbf4a',X+3,Y+k,3,2);px(x,'#6fbf4a',X+11,Y+k+2,3,2)}
    }else if(ch==='S'){
      // 유사(모래 늪): 빠지면 천천히 가라앉음
      const top=at(tx,ty-1)!=='S';px(x,'#c89858',X,Y,16,16);for(let k=0;k<6;k++)px(x,'#b08040',X+(r()*15|0),Y+(r()*15|0),2,1);
      if(top){px(x,'#e0b070',X,Y,16,2);for(let k=0;k<16;k+=4)px(x,'#a07038',X+k+((ty*3)%4),Y+4,3,1)}
    }else if(ch==='L'){
      // 용암
      const top=at(tx,ty-1)!=='L';px(x,'#c0301a',X,Y,16,16);for(let k=0;k<5;k++)px(x,'#ff6a1a',X+(r()*14|0),Y+(r()*14|0)+(top?3:0),3,2);
      if(top){px(x,'#ffd060',X,Y,16,2);px(x,'#ff8a2a',X,Y+2,16,2);for(let k=0;k<16;k+=5)px(x,'#ffe8a0',X+k+(r()*3|0),Y,2,1)}
    }else if(ch==='^'&&theme==='desert'){
      // 사막의 가시는 선인장
      const cx=X+8;px(x,'#1f4a20',cx-2,Y+3,5,13);px(x,'#3f8a3a',cx-1,Y+3,3,13);px(x,'#1f4a20',cx-6,Y+7,4,3);px(x,'#3f8a3a',cx-5,Y+6,2,3);px(x,'#1f4a20',cx+3,Y+5,4,3);px(x,'#3f8a3a',cx+4,Y+4,2,3);
      for(let k=0;k<5;k++)px(x,'#e8f0c0',cx-2+(r()*5|0),Y+3+(r()*12|0),1,1);
    }else if(ch==='^'){
      px(x,'#4a4a56',X,Y+14,16,2);
      for(let i=0;i<4;i++){const cx=X+i*4;for(let h=0;h<6;h++){const hw=Math.floor(h/2);px(x,'#d8dce8',cx+2-hw,Y+8+h,hw+1,1);px(x,'#8a8e9a',cx+2,Y+8+h,hw,1)}}
    }
  }
  // 집: [시작 칸, 폭(칸), 지붕색]
  (deco.houses||[]).forEach(([tx,w,roof])=>{const X=tx*T,G=gy(tx),Wd=w*T,bh=44;
    px(x,'#3a2410',X+2,G-bh,Wd-4,bh);px(x,'#e8d8b0',X+3,G-bh+1,Wd-6,bh-1);
    for(let k=X+3;k<X+Wd-3;k+=12)px(x,'#8a6038',k,G-bh+1,2,bh-1);px(x,'#8a6038',X+3,G-bh+14,Wd-6,2);
    const dX=X+Math.floor(Wd/2)-6;px(x,'#3a2410',dX-1,G-24,14,24);px(x,'#7a4a24',dX,G-23,12,23);px(x,'#5a3418',dX+5,G-23,1,23);px(x,'#ffd34a',dX+8,G-12,2,2);
    [X+8,X+Wd-22].forEach(wx=>{px(x,'#3a2410',wx-1,G-38,14,12);px(x,'#9fd8ff',wx,G-37,12,10);px(x,'#ffffff',wx+1,G-36,4,2);px(x,'#3a2410',wx+5,G-37,1,10);px(x,'#3a2410',wx,G-33,12,1)});
    const rh=30,dark=hexDark(roof);
    for(let yy=0;yy<rh;yy++){const hw=Math.round((Wd/2+8)*(yy+4)/(rh+4));px(x,'#2a1810',X+Wd/2-hw-1,G-bh-rh+yy,hw*2+2,1);px(x,yy%6<3?roof:dark,X+Wd/2-hw,G-bh-rh+yy,hw*2,1)}
    px(x,'#5a4a40',X+Wd-18,G-bh-rh+2,7,16);px(x,'#7a6a5a',X+Wd-18,G-bh-rh+2,7,2)});
  // 모루 (대장간)
  (deco.anvil||[]).forEach(tx=>{const X=tx*T+8,G=gy(tx);px(x,'#2a2836',X-8,G-9,16,3);px(x,'#5a5870',X-7,G-8,14,1);px(x,'#2a2836',X-4,G-6,8,4);px(x,'#2a2836',X-6,G-2,12,2)});
  // 우물
  (deco.well||[]).forEach(tx=>{const X=tx*T+8,G=gy(tx);px(x,'#3a3448',X-11,G-12,22,12);px(x,'#8a8e9a',X-10,G-11,20,11);for(let k=X-10;k<X+10;k+=5)px(x,'#6a6e7a',k,G-11,1,11);
    px(x,'#5a3a20',X-10,G-30,2,18);px(x,'#5a3a20',X+8,G-30,2,18);px(x,'#c0503a',X-13,G-34,26,4);px(x,'#8a3020',X-13,G-31,26,1);px(x,'#3a2410',X-1,G-28,1,12);px(x,'#7a5232',X-3,G-17,5,4)});
  (deco.fence||[]).forEach(([a,b])=>{const G=gy(a);for(let X=a*T;X<=(b+1)*T;X+=8){px(x,'#5a3a20',X,G-11,3,11);px(x,'#c08a50',X,G-11,2,10)}
    px(x,'#c08a50',a*T,G-9,(b-a+1)*T+3,2);px(x,'#c08a50',a*T,G-5,(b-a+1)*T+3,2);px(x,'#8a5a30',a*T,G-8,(b-a+1)*T+3,1)});
  (deco.sign||[]).forEach(tx=>{const X=tx*T+8,G=gy(tx);px(x,'#7a5232',X-1,G-16,3,16);px(x,'#3a2410',X-9,G-20,18,10);px(x,'#c08a50',X-8,G-19,16,8);
    px(x,'#3a2410',X-5,G-15,8,2);px(x,'#3a2410',X+2,G-17,1,6);px(x,'#3a2410',X+3,G-16,1,4);px(x,'#3a2410',X+4,G-15,1,2)});
  (deco.rocks||[]).forEach(tx=>{const X=tx*T+8,G=gy(tx);for(let yy=-7;yy<=0;yy++)for(let xx=-9;xx<=9;xx++)if((xx*xx)/81+(yy*yy)/49<=1)px(x,yy<-4?'#c8ccd4':xx>3?'#8a8e9a':'#aab0bc',X+xx,G+yy-1)});
  return c;
}
