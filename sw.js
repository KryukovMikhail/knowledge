/* Сервис-воркер «Путешествия в страну знаний»: работа без интернета и обновления.
   Страница — «сначала сеть, потом кэш», иконки и шрифты — «сначала кэш».
   Новая версия скачивается заранее и ждёт: игра покажет плашку «Обновить»,
   и только по нажатию новая версия включится. Меняйте VERSION при каждом релизе вместе с BUILD. */
const VERSION='K001.025';
const CACHE='pvsz-'+VERSION;
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('message',e=>{
  if(e.data==='skipWaiting')self.skipWaiting();
  else if(e.data&&e.data.type==='version'&&e.ports&&e.ports[0])e.ports[0].postMessage(CACHE);
});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('pvsz-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')){
    e.respondWith(fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})));
  }
});
