/* 화면 크기 계산
   게임 좌표는 항상 320x180 이지만, 실제 캔버스는 화면 해상도에 맞춰 S배 크기로 그림.
   - S(렌더 배율): 정수. 도트는 S배로 또렷하게, 한글은 S배 해상도로 선명하게 그려짐
   - css: 화면에 보이는 배율 (소수 가능) */
import {W,H,MOBILE} from './config.js';

export const RS={S:1};

export function calcScale(){
  const st=document.getElementById('stage');
  let w=Math.max(160,st.clientWidth-32),maxH=window.innerHeight*0.72;
  // 폰: 가로면 화면 전체, 세로면 위쪽을 가로폭 가득 (아래는 조작 버튼)
  if(MOBILE){const vw=window.innerWidth,vh=window.innerHeight;w=vw;maxH=vw>vh?vh:vh*0.56}
  const css=Math.max(0.5,Math.min(w/W,maxH/H));
  // 폰은 그래픽 메모리가 적어서 렌더 해상도를 2배 밀도까지만 (도트라 티가 거의 안 남)
  const dpr=Math.min(window.devicePixelRatio||1,MOBILE?2:4);
  const S=Math.max(1,Math.min(8,Math.ceil(css*dpr-0.05)));
  return{css,S,dpr};
}
/* 예전 코드 호환: 화면 배율 */
export function calcZoom(){return calcScale().css}

/* 장면 카메라를 현재 배율에 맞춤. ui 카메라가 있으면 함께 */
export function fitCameras(scene){
  const S=RS.S,main=scene.cameras.main;
  if(main.zoom!==S)main.setZoom(S);
  if(scene.uiCam){if(scene.uiCam.zoom!==S)scene.uiCam.setZoom(S);if(scene.uiCam.width!==W*S)scene.uiCam.setSize(W*S,H*S)}
  // 한글 텍스트는 S배 해상도로 그려서 확대해도 선명하게
  scene.children.list.forEach(o=>{if(o.type==='Text'&&o._rs!==S){o._rs=S;o.setResolution(S)}});
}
