import {T,COLS,ROWS} from '../config.js';
/* ---------- map ---------- */
export function buildMap(){
  const m=[];for(let y=0;y<ROWS;y++)m.push(Array(COLS).fill('.'));
  const f=(x0,y0,x1,y1,ch)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)m[y][x]=ch};
  f(0,0,COLS-1,0,'#');f(0,0,0,ROWS-1,'#');f(COLS-1,0,COLS-1,ROWS-1,'#');f(0,12,COLS-1,13,'#');
  f(20,10,24,11,'#');f(40,9,45,11,'#');
  f(7,9,11,9,'-');f(13,7,17,7,'-');f(27,7,32,7,'-');f(33,5,37,5,'-');f(47,6,51,6,'-');f(53,9,57,9,'-');
  return m;
}
export const SPAWNS=[{x:12*T,y:11*T},{x:15*T,y:6*T},{x:22*T,y:9*T},{x:30*T,y:6*T},{x:35*T,y:4*T},{x:43*T,y:8*T},{x:49*T,y:5*T},{x:58*T,y:10*T,king:true}];
export const TORCHES=[[6,6],[19,6],[38,7],[52,7],[61,5]];
