// 설정 창의 게임 옵션 (브라우저에 기억): 난이도 = 받는 피해 배율, 화면 흔들림 = 흔들림 세기 배율
export const OPTS={dmg:1,shake:1};
try{const v=JSON.parse(localStorage.getItem('sr_opts')||'{}');if([0.5,1,1.5].includes(v.dmg))OPTS.dmg=v.dmg;if([0,0.5,1].includes(v.shake))OPTS.shake=v.shake}catch(_){}
export function setOpt(k,v){OPTS[k]=v;try{localStorage.setItem('sr_opts',JSON.stringify(OPTS))}catch(_){}}
// 난이도를 반영한 받는 피해 (최소 1)
export const dmgTaken=d=>Math.max(1,Math.round(d*OPTS.dmg));
// 몬스터 체력: 쉬움 70%, 어려움 130% / 경험치(골드도 여기서 나옴): 어려움만 125%
export const hpMul=()=>OPTS.dmg<1?0.7:OPTS.dmg>1?1.3:1;
export const expMul=()=>OPTS.dmg>1?1.25:1;
