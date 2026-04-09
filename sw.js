const cacheName = 'carcassonne-v3';
const assets = [
    './', './index.html', './style.css', './app.js', './manifest.json',
    './imagens/peca_a.jpeg', './imagens/peca_b.jpeg', './imagens/peca_c.jpeg',
    './imagens/peca_d.jpeg', './imagens/peca_e.jpeg', './imagens/peca_f.jpeg',
    './imagens/peca_g.jpeg', './imagens/peca_h.jpeg', './imagens/peca_i.jpeg',
    './imagens/peca_j.jpeg', './imagens/peca_k.jpeg', './imagens/peca_l.jpeg',
    './imagens/peca_m.jpeg', './imagens/peca_n.jpeg', './imagens/peca_o.jpeg',
    './imagens/peca_p.jpeg', './imagens/peca_q.jpeg', './imagens/peca_r.jpeg',
    './imagens/peca_s.jpeg', './imagens/peca_t.jpeg', './imagens/peca_u.jpeg',
    './imagens/peca_v.jpeg', './imagens/peca_w.jpeg', './imagens/peca_x.jpeg'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(cacheName).then(c => c.addAll(assets)));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => k !== cacheName ? caches.delete(k) : null))));
    return self.clients.claim();
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});