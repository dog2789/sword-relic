/* 주소 하나로 모으기 (소개·게임 페이지 둘 다 맨 위에서 부름): vercel.app 저장 공간은 swordrelic.com과 따로라서 들고 넘어감. 받는 쪽은 플레이 시간이 긴 세이브를 남기고 설정은 없을 때만 씀 */
try{var H='swordrelic.com';
if(location.hostname==='sword-relic.vercel.app'){var d={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k.indexOf('sr_')===0)d[k]=localStorage.getItem(k)}
  var u='https://'+H+location.pathname+location.search+'#move='+encodeURIComponent(JSON.stringify(d));
  // 홈 화면 앱은 처음 주소에 묶여 있어서 넘기면 앱 밖으로 나감 → 그 자리에서 하게 두고, 새 주소에서 다시 추가하라고 안내
  if(matchMedia('(display-mode: standalone)').matches||navigator.standalone)addEventListener('DOMContentLoaded',function(){var b=document.createElement('div');
    b.style.cssText='position:fixed;left:0;right:0;top:0;z-index:9999;padding:8px 36px 8px 10px;background:#2a2046;color:#fff;font:13px sans-serif;border-bottom:2px solid #9fff8a';
    b.innerHTML='주소가 바뀌었어요. <a href="'+u+'" target="_blank" style="color:#9fff8a">swordrelic.com 열기</a>(진행 상황도 같이 옮겨져요) → 거기서 홈 화면에 다시 추가해 주세요.<button style="position:absolute;right:6px;top:6px;background:none;border:0;color:#fff;font-size:16px">✕</button>';
    b.lastChild.onclick=function(){b.remove()};document.body.appendChild(b)});
  else location.replace(u)}
else if(location.hash.indexOf('#move=')===0){var m=JSON.parse(decodeURIComponent(location.hash.slice(6)));
  var t=function(s){try{return (JSON.parse(s||'null')||{}).time||0}catch(e){return 0}};
  for(var k in m){if(k.indexOf('sr_')!==0)continue;
    if(k==='sr_save2'?t(m[k])>t(localStorage.getItem(k)):localStorage.getItem(k)===null){
      if(k==='sr_save2'&&localStorage.getItem(k))localStorage.setItem('sr_save2_old',localStorage.getItem(k));   // 덮어쓰기 전 예전 세이브 백업
      localStorage.setItem(k,m[k])}}
  history.replaceState(null,'',location.pathname+location.search)}}catch(e){}
