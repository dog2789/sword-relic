/* 키보드 상태를 장면과 상관없이 직접 기록
   (Phaser 키 상태는 방 이동으로 장면이 다시 시작될 때 초기화돼서, 누르고 있던 키가 끊기는 문제가 있음) */
const down=new Set();
window.addEventListener('keydown',e=>down.add(e.code));
window.addEventListener('keyup',e=>down.delete(e.code));
window.addEventListener('blur',()=>down.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)down.clear()});

export const isDown=(...codes)=>codes.some(c=>down.has(c));
