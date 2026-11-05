/* 화면, 타일, 조작감 수치 */
export const W=320,H=180,T=16,HUD=24,ROWS=14,LH=ROWS*T;
export const SPEED=92,JUMP=300,GRAV=820;
/* 터치 버튼 상태 (main.js 가 채움) */
export const VP={left:false,right:false,up:false,down:false,jump:false,attack:false,skill:false,menu:false,map:false,q0:false,q1:false,q2:false,q3:false};
/* 폰·태블릿(손가락 터치) 화면인지. 주소 뒤에 ?mobile 을 붙이면 PC에서도 폰 화면으로 볼 수 있음 */
export const MOBILE=typeof matchMedia!=='undefined'&&(matchMedia('(pointer:coarse)').matches||/[?&]mobile/.test(location.search));
