/* 초원 테마 그리기: 하늘/산(먼 배경), 언덕/숲(중간 배경), 흙·풀 타일과 장식(레벨) */
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

/* 레벨 타일과 장식. deco = 방 데이터의 deco */
export function drawLevel(m,cols,seed,deco={}){
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
    }else if(ch==='-'){
      px(x,'#d89a58',X,Y,16,1);px(x,'#9a6236',X,Y+1,16,3);px(x,'#6a3e22',X,Y+4,16,1);px(x,'#2a1a12',X,Y+5,16,1);
      px(x,'#6a3e22',X+8,Y+1,1,3);px(x,'#e8d0a0',X+2,Y+2);px(x,'#e8d0a0',X+13,Y+2);
      if(at(tx-1,ty)!=='-'){px(x,'#5a3a22',X+1,Y+6,2,5);px(x,'#5a3a22',X+3,Y+6,3,1)}
      if(at(tx+1,ty)!=='-'){px(x,'#5a3a22',X+13,Y+6,2,5);px(x,'#5a3a22',X+10,Y+6,3,1)}
    }
  }
  (deco.fence||[]).forEach(([a,b])=>{const G=gy(a);for(let X=a*T;X<=(b+1)*T;X+=8){px(x,'#5a3a20',X,G-11,3,11);px(x,'#c08a50',X,G-11,2,10)}
    px(x,'#c08a50',a*T,G-9,(b-a+1)*T+3,2);px(x,'#c08a50',a*T,G-5,(b-a+1)*T+3,2);px(x,'#8a5a30',a*T,G-8,(b-a+1)*T+3,1)});
  (deco.sign||[]).forEach(tx=>{const X=tx*T+8,G=gy(tx);px(x,'#7a5232',X-1,G-16,3,16);px(x,'#3a2410',X-9,G-20,18,10);px(x,'#c08a50',X-8,G-19,16,8);
    px(x,'#3a2410',X-5,G-15,8,2);px(x,'#3a2410',X+2,G-17,1,6);px(x,'#3a2410',X+3,G-16,1,4);px(x,'#3a2410',X+4,G-15,1,2)});
  (deco.rocks||[]).forEach(tx=>{const X=tx*T+8,G=gy(tx);for(let yy=-7;yy<=0;yy++)for(let xx=-9;xx<=9;xx++)if((xx*xx)/81+(yy*yy)/49<=1)px(x,yy<-4?'#c8ccd4':xx>3?'#8a8e9a':'#aab0bc',X+xx,G+yy-1)});
  return c;
}
