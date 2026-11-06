/* 화면, 타일, 조작감 수치 */
export let W=320;export const H=180,T=16,HUD=24,ROWS=14,LH=ROWS*T;
export const SPEED=92,JUMP=300,GRAV=820;
/* 터치 버튼 상태 (main.js 가 채움) */
export const VP={left:false,right:false,up:false,down:false,jump:false,attack:false,skill:false,menu:false,map:false,q0:false,q1:false,q2:false,q3:false,back:false};   // back = ESC (닫기·건너뛰기)
/* 폰·태블릿(손가락 터치) 화면인지. 주소 뒤에 ?mobile 을 붙이면 PC에서도 폰 화면으로 볼 수 있음 */
/* 폰에서는 ↑ 대신 공격(Z) 버튼으로 말 걸기·워프·순간이동 → 안내 문구도 바꿔 보여 줌 */
export const keyText=s=>MOBILE?s.replace(/↑ 키/g,'공격(Z) 버튼').replace(/↓ 키/g,'스틱 ↓').replace(/숫자 (\d) 키/g,'$1번 칸').replace(/I 키/g,'장비 버튼'):s;
export const MOBILE=typeof matchMedia!=='undefined'&&(matchMedia('(pointer:coarse)').matches||/[?&]mobile/.test(location.search));
/* 폰 가로 화면: 게임 폭을 화면 비율에 맞춰 넓힘 (320~400, 가장 좁은 방이 416px라 그 안). 세로·PC는 320 */
export const wideW=()=>MOBILE&&innerWidth>innerHeight?Math.min(400,Math.max(320,Math.round(H*innerWidth/innerHeight/2)*2)):320;
export const setW=v=>{W=v};
setW(wideW());
/* 폰 가로 화면에선 위쪽에 퀵슬롯 줄(왼쪽)과 미니맵(오른쪽)이 있어서 알림 글자를 그 아래로 */
export const landPad=()=>MOBILE&&innerWidth>innerHeight;
