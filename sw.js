// Офлайн-кэш «Локального кодера». Веса нейросети кэширует сама библиотека WebLLM.
const C='lk-v1';
const CDN=/^https:\/\/cdn\.jsdelivr\.net\//;
const limit=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
const store=(req,res)=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}return res};
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    if(u.pathname.endsWith('/lk-py-worker.js')){e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r)));return}
    e.respondWith(limit(fetch(r),5000).then(res=>store(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./'))));
    return}
  if(CDN.test(r.url))e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>store(r,res))));
});
