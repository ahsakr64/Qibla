// Qibla offline support. Bump CACHE when you change the file list.
const CACHE='qibla-v1';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET')return;
 // fonts: serve from cache, refresh in background
 if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
  e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>{
   const net=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>hit);
   return hit||net})));return}
 // the app's own files: try the network first so updates show up, fall back to the saved copy when offline
 if(u.origin===location.origin){
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})
   .catch(()=>caches.match(r,{ignoreSearch:true}).then(hit=>hit||caches.match('index.html'))))}
 // anything else (e.g. the city-name lookup) goes straight to the network
});
