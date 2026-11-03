import {W,H} from './config.js';
export function calcZoom(){
  const st=document.getElementById('stage');const w=st.clientWidth-32;const maxH=window.innerHeight*0.72;
  let z=Math.min(w/W,maxH/H);if(z>=2)z=Math.floor(z);return Math.max(0.5,z);
}
