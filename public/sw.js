/* 오프라인용: 항상 새 파일을 먼저 받고(새 배포가 바로 보이게), 인터넷이 끊겼을 때만 저장해 둔 걸 씀 */
const CACHE='sr-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
// 페이지를 새로 받으면 그 페이지가 안 쓰는 예전 배포 파일(assets/)을 지움 (배포마다 쌓이지 않게)
// 글꼴은 js 안에서 이름만으로 불러서, html이 부르는 js·css 안의 파일 이름까지 모아서 남김
const names=t=>[...t.matchAll(/[\w.-]+\.(?:js|css|woff2|png|svg|webp|mp3|ogg)\b/g)].map(m=>m[0]);
async function prune(html){
  const keep=new Set(names(html));
  for(const n of [...keep])if(/\.(js|css)$/.test(n)){
    const r=await fetch('/assets/'+n).catch(()=>null);
    if(!r||!r.ok)return; // 하나라도 못 받으면 지우지 않음 (오프라인 저장본 보호)
    names(await r.text()).forEach(x=>keep.add(x));
  }
  const k=await caches.open(CACHE);
  for(const q of await k.keys()){const p=new URL(q.url).pathname;if(p.startsWith('/assets/')&&!keep.has(p.slice(8)))await k.delete(q)}
}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||!r.url.startsWith('http')||r.url.includes('/_vercel/'))return; // 통계 스크립트는 저장 안 함
  e.respondWith(fetch(r).then(res=>{if(res.ok&&(res.type==='basic'||res.type==='cors')){const c=res.clone();caches.open(CACHE).then(k=>k.put(r,c))
      if(r.mode==='navigate')e.waitUntil(res.clone().text().then(prune).catch(()=>{}))}return res})
    .catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('/'):Response.error()))));
});
