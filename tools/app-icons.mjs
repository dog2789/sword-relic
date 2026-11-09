// 사용: node tools/app-icons.mjs <미리보기 저장 폴더>  (Edge 필요, playwright-core)
// public/icon-512.png(16×16 도트, 칸 32px)에서 검만 뽑아 안드로이드 아이콘을 만듦
import {chromium} from 'playwright-core';import fs from 'fs';
const R='C:/wooj/sword-relic/sword-relic/android/app/src/main/res/';
const src='data:image/png;base64,'+fs.readFileSync('C:/wooj/sword-relic/sword-relic/public/icon-512.png').toString('base64');
const b=await chromium.launch({channel:'msedge'});const pg=await b.newPage();
const SPL=Object.fromEntries(fs.readdirSync(R).filter(d=>d.startsWith("drawable")&&fs.existsSync(R+d+"/splash.png")).map(d=>{const b=fs.readFileSync(R+d+"/splash.png");return[d+"/splash.png",[b.readUInt32BE(16),b.readUInt32BE(20)]]}));
const out=await pg.evaluate(async ([src,SPL])=>{
  const im=new Image();im.src=src;await im.decode();
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.drawImage(im,0,0);
  const px=(i,j)=>Array.from(x.getImageData(i*32+16,j*32+16,1,1).data);
  const bg=px(8,12),fr=px(0,8),hex=v=>v.toString(16).padStart(2,'0'),same=(a,b)=>a.every((v,k)=>Math.abs(v-b[k])<8);
  const grid=[];for(let j=1;j<15;j++)for(let i=1;i<15;i++){const p=px(i,j);if(!same(p,bg)&&!same(p,fr))grid.push([i-1,j-1,`rgb(${p[0]},${p[1]},${p[2]})`])}
  const draw=(size,cell,{round,fill,full,h}={})=>{const k=document.createElement('canvas');k.width=size;k.height=h||size;const g=k.getContext('2d');g.imageSmoothingEnabled=false;
    if(full){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,0,size,size);return k.toDataURL()}
    if(fill){g.fillStyle=`rgb(${bg[0]},${bg[1]},${bg[2]})`;if(round){g.beginPath();g.arc(size/2,size/2,size/2,0,7);g.fill()}else g.fillRect(0,0,size,h||size)}
    const ox=Math.round((size-cell*14)/2),oy=Math.round(((h||size)-cell*14)/2);for(const [i,j,col] of grid){g.fillStyle=col;g.fillRect(ox+i*cell,oy+j*cell,cell,cell)}return k.toDataURL()};
  const r={bg:'#'+hex(bg[0])+hex(bg[1])+hex(bg[2]),files:{}};
  for(const [d,s] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]){
    const f=s*108/48;   // 적응형 아이콘 전경은 108dp
    r.files[`mipmap-${d}/ic_launcher.png`]=draw(s,0,{full:true});
    r.files[`mipmap-${d}/ic_launcher_round.png`]=draw(s,Math.floor(s*0.6/14),{round:true,fill:true});
    r.files[`mipmap-${d}/ic_launcher_foreground.png`]=draw(f,Math.floor(f*0.6/14));
  }
  for(const [p,[w,h]] of Object.entries(SPL))r.files[p]=draw(w,Math.max(2,Math.floor(Math.min(w,h)*0.22/14)),{fill:true,h});
  r.preview=draw(432,Math.floor(432*0.6/14),{fill:true});return r},[src,SPL]);
for(const [p,u] of Object.entries(out.files))fs.writeFileSync(R+p,Buffer.from(u.split(',')[1],'base64'));
fs.writeFileSync(process.argv[2]+'/fg_preview.png',Buffer.from(out.preview.split(',')[1],'base64'));
fs.writeFileSync(R+'values/ic_launcher_background.xml',`<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${out.bg.toUpperCase()}</color>\n</resources>\n`);
console.log('배경',out.bg,Object.keys(out.files).length,'개');await b.close();
