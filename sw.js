const cacheName = 'carcassonne-v2'; // Mude o v2 para v3 se mudar algo no futuro
const assets = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './imagens/peca_a.jpeg', './imagens/peca_b.jpeg', './imagens/peca_c.jpeg',
    './imagens/peca_d.jpeg', './imagens/peca_e.jpeg', './imagens/peca_f.jpeg',
    './imagens/peca_g.jpeg', './imagens/peca_h.jpeg', './imagens/peca_i.jpeg',
    './imagens/peca_j.jpeg', './imagens/peca_k.jpeg', './imagens/peca_l.jpeg',
    './imagens/peca_m.jpeg', './imagens/peca_n.jpeg', './imagens/peca_o.jpeg',
    './imagens/peca_p.jpeg', './imagens/peca_q.jpeg', './imagens/peca_r.jpeg',
    './imagens/peca_s.jpeg', './imagens/peca_t.jpeg', './imagens/peca_u.jpeg',
    './imagens/peca_v.jpeg', './imagens/peca_w.jpeg', './imagens/peca_x.jpeg'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(assets))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== cacheName)
                .map(key => caches.delete(key))
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(res => res || fetch(event.request))
    );
});