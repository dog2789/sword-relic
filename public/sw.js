/* 오프라인용: 항상 새 파일을 먼저 받고(새 배포가 바로 보이게), 인터넷이 끊겼을 때만 저장해 둔 걸 씀 */
const CACHE='sr-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||!r.url.startsWith('http'))return;
  e.respondWith(fetch(r).then(res=>{if(res.ok&&(res.type==='basic'||res.type==='cors')){const c=res.clone();caches.open(CACHE).then(k=>k.put(r,c))}return res})
    .catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('/'):Response.error()))));
});
