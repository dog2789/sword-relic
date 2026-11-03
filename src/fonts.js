/* 한글 픽셀 폰트: 갈무리 (Galmuri, SIL OFL 1.1, https://github.com/quiple/galmuri)
   Galmuri9 는 10px, Galmuri11 은 12px 에서 픽셀이 정확히 맞음 */
import g9 from 'galmuri/dist/Galmuri9.woff2';
import g11 from 'galmuri/dist/Galmuri11.woff2';

export const F9='Galmuri9, sans-serif';
export const F11='Galmuri11, sans-serif';

export function loadFonts(){
  if(typeof FontFace==='undefined')return Promise.resolve();
  const list=[['Galmuri9',g9],['Galmuri11',g11]].map(([n,u])=>new FontFace(n,`url(${u})`).load().then(f=>{document.fonts.add(f)}).catch(()=>{}));
  return Promise.all(list);
}
