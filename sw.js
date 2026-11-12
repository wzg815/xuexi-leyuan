// 离线缓存 v2：页面网络优先（便于更新），资源与语音缓存优先
const VERSION = 'xxly-v2';
const SHELL = VERSION + '-shell', AUDIO = 'xxly-audio-v1';
importScripts('js/audio-map.js?v=2');
const ASSETS = ['./', 'index.html', 'css/style.css?v=2', 'js/data.js?v=2', 'js/gen.js?v=2', 'js/store.js?v=2', 'js/audio-map.js?v=2', 'js/sfx.js?v=2', 'js/app.js?v=2', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];
const AUDIO_FILES = [...new Set(Object.values(self.AUDIO_MAP || {}))].map(f => 'audio/' + f);
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
async function precacheAudio() {
  const c = await caches.open(AUDIO);
  for (const u of AUDIO_FILES) { try { if (!(await c.match(u))) { const r = await fetch(u); if (r.ok) await c.put(u, r); } } catch (e) { } }
}
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== AUDIO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
  precacheAudio(); // 后台慢慢缓存全部语音，不阻塞
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const cp = res.clone(); caches.open(SHELL).then(c => c.put('index.html', cp)); return res; }).catch(() => caches.match('index.html')));
    return;
  }
  if (url.pathname.includes('/audio/')) {
    e.respondWith(audioResponse(req, 'audio/' + url.pathname.split('/audio/')[1]));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(SHELL).then(c => c.put(req, cp)); } return res; })));
});

// 语音：缓存优先；支持 Range（iOS Safari 播放媒体需要 206 分段响应）
async function audioResponse(req, key) {
  const c = await caches.open(AUDIO);
  let res = await c.match(key);
  if (!res) {
    try { const net = await fetch(key); if (net.ok && net.status === 200) { await c.put(key, net.clone()); res = net; } else return net; }
    catch (e) { return new Response('', { status: 504 }); }
  }
  const range = req.headers.get('range');
  if (!range) return res;
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  let start = m[1] ? parseInt(m[1], 10) : 0, end = m[2] ? parseInt(m[2], 10) : size - 1;
  if (!m[1] && m[2]) { start = Math.max(0, size - parseInt(m[2], 10)); end = size - 1; }
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, headers: { 'Content-Type': 'audio/mpeg', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}
