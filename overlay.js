(function () {
    const ID = '_crc_overlay';

    const prev = document.getElementById(ID);
    if (prev) { prev.style.display = prev.style.display === 'none' ? 'flex' : 'none'; return; }

    const TILES = [
        { id: 'B', qtd: 4, f: ['m', 'e'] }, { id: 'A', qtd: 2, f: ['m'] },
        { id: 'V', qtd: 9, f: ['e'] },       { id: 'U', qtd: 8, f: ['e'] },
        { id: 'W', qtd: 4, f: ['e'] },       { id: 'X', qtd: 1, f: ['e'] },
        { id: 'C', qtd: 1, f: ['c', 's'] },  { id: 'I', qtd: 2, f: ['c'] },
        { id: 'G', qtd: 1, f: ['c'] },       { id: 'F', qtd: 2, f: ['c', 's'] },
        { id: 'E', qtd: 5, f: ['c'] },       { id: 'H', qtd: 3, f: ['c'] },
        { id: 'D', qtd: 4, f: ['c', 'e'] },  { id: 'J', qtd: 3, f: ['c', 'e'] },
        { id: 'K', qtd: 3, f: ['c', 'e'] },  { id: 'L', qtd: 3, f: ['c', 'e'] },
        { id: 'N', qtd: 3, f: ['c'] },       { id: 'M', qtd: 2, f: ['c', 's'] },
        { id: 'P', qtd: 3, f: ['c', 'e'] },  { id: 'O', qtd: 2, f: ['c', 'e', 's'] },
        { id: 'R', qtd: 3, f: ['c'] },       { id: 'Q', qtd: 1, f: ['c', 's'] },
        { id: 'T', qtd: 1, f: ['c', 'e'] },  { id: 'S', qtd: 2, f: ['c', 'e', 's'] },
    ];

    const ICONS = { c: '🏰', e: '🛤️', m: '⛪', s: '🛡️' };
    const NAMES = { c: 'Cidade', e: 'Estrada', m: 'Mosteiro', s: 'Escudo' };

    let state = JSON.parse(sessionStorage.getItem('_crc') || 'null') || TILES.map(t => ({ ...t, atual: t.qtd }));
    let hist  = JSON.parse(sessionStorage.getItem('_crcH') || '[]');
    let filtros = new Set();

    function save() {
        sessionStorage.setItem('_crc', JSON.stringify(state));
        sessionStorage.setItem('_crcH', JSON.stringify(hist));
    }
    function registrar(i) {
        if (state[i].atual <= 0) return;
        state[i].atual--; hist.unshift(i);
        if (hist.length > 10) hist.pop();
        save(); render();
    }
    function desfazer() {
        if (!hist.length) return;
        state[hist.shift()].atual++; save(); render();
    }

    window._crcReg    = registrar;
    window._crcUndo   = desfazer;
    window._crcFiltro = f => { filtros.has(f) ? filtros.delete(f) : filtros.add(f); render(); };
    window._crcReset  = () => {
        if (!confirm('Reiniciar contagem?')) return;
        state = TILES.map(t => ({ ...t, atual: t.qtd }));
        hist = []; filtros.clear(); save(); render();
    };

    function render() {
        const total = state.reduce((s, t) => s + t.atual, 0);

        // Probabilidade
        let probHtml = '';
        if (filtros.size > 0) {
            const n   = state.filter(t => t.f.some(f => filtros.has(f))).reduce((s, t) => s + t.atual, 0);
            const pct = total > 0 ? ((n / total) * 100).toFixed(1) : 0;
            const cor = pct >= 50 ? '#2ecc71' : pct >= 25 ? '#f39c12' : '#e74c3c';
            const nomes = [...filtros].map(f => ICONS[f] + ' ' + NAMES[f]).join(' ou ');
            probHtml = `
                <div style="background:#0d1b27;padding:6px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #2c3e50;flex-shrink:0">
                    <span style="color:#aaa;font-size:13px">${nomes}:</span>
                    <span style="color:${cor};font-size:1.8em;font-weight:900;line-height:1">${pct}%</span>
                    <span style="color:#666;font-size:13px">${n} de ${total} peças</span>
                </div>`;
        }

        // Botões de filtro
        const filtBtns = ['c', 'e', 'm', 's'].map(f =>
            `<button onclick="window._crcFiltro('${f}')" style="background:${filtros.has(f) ? '#3498db' : '#34495e'};color:white;border:none;border-radius:14px;padding:5px 12px;font-size:13px;cursor:pointer;white-space:nowrap">${ICONS[f]} ${NAMES[f]}</button>`
        ).join('');

        // Peças grandes em linha horizontal
        const tileBtns = state.map((t, i) => {
            const match = filtros.size === 0 || t.f.some(f => filtros.has(f));
            const esgotado = t.atual === 0;
            const op   = esgotado ? '0.2' : (filtros.size > 0 && !match ? '0.15' : '1');
            const bord = !esgotado && filtros.size > 0 && match ? '3px solid #3498db' : '2px solid #34495e';
            const cor  = esgotado ? '#e74c3c' : '#2ecc71';
            const ficons = t.f.map(f => ICONS[f]).join('');
            return `<button onclick="window._crcReg(${i})" style="flex-shrink:0;opacity:${op};background:#1e2d3a;color:white;border:${bord};border-radius:10px;width:72px;height:90px;cursor:${esgotado ? 'default' : 'pointer'};text-align:center;padding:6px 4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:border-color .15s">
                <span style="font-size:13px;line-height:1">${ficons}</span>
                <strong style="font-size:22px;line-height:1.1">${t.id}</strong>
                <span style="font-size:14px;color:${cor};font-weight:700;line-height:1">${t.atual}x</span>
            </button>`;
        }).join('');

        panel.innerHTML = `
            <div id="_crc_drag" style="background:#0d1b27;padding:10px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #2c3e50;cursor:move;flex-shrink:0;flex-wrap:wrap">
                <strong style="font-size:15px;margin-right:4px;white-space:nowrap">🏰 Carcassonne</strong>
                <div style="display:flex;gap:6px;flex-wrap:wrap;flex:1">${filtBtns}</div>
                <span style="color:#555;font-size:13px;white-space:nowrap">${total} peças</span>
                <button onclick="window._crcReset()" style="background:none;border:none;color:#e74c3c;font-size:16px;cursor:pointer;padding:0" title="Reiniciar">↺</button>
                <button onclick="document.getElementById('${ID}').style.display='none'" style="background:none;border:none;color:#95a5a6;font-size:22px;cursor:pointer;padding:0;line-height:1">−</button>
                <button onclick="document.getElementById('${ID}').remove()" style="background:none;border:none;color:#e74c3c;font-size:22px;cursor:pointer;padding:0;line-height:1">✕</button>
            </div>
            ${probHtml}
            <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;overflow-x:auto;flex:1;-webkit-overflow-scrolling:touch">
                ${tileBtns}
            </div>
            <div style="padding:8px 14px;border-top:1px solid #2c3e50;display:flex;align-items:center;gap:12px;flex-shrink:0;background:#0d1b27">
                <button onclick="window._crcUndo()" ${hist.length === 0 ? 'disabled' : ''} style="background:#f39c12;color:white;border:none;border-radius:7px;padding:8px 20px;font-size:14px;font-weight:bold;cursor:pointer;opacity:${hist.length === 0 ? .4 : 1}">↩ Desfazer</button>
                <span style="font-size:13px;color:#555">${hist.length} no histórico</span>
            </div>
        `;

        makeDraggable();
    }

    // Painel horizontal
    const panel = document.createElement('div');
    panel.id = ID;
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: min(820px, 96vw);
        background: #1a2b3c;
        border: 2px solid #3498db;
        border-radius: 12px;
        box-shadow: 0 8px 40px rgba(0,0,0,.8);
        z-index: 2147483647;
        color: white;
        font-family: -apple-system, system-ui, sans-serif;
        user-select: none;
        display: flex;
        flex-direction: column;
    `;
    document.body.appendChild(panel);

    function makeDraggable() {
        const handle = document.getElementById('_crc_drag');
        if (!handle) return;
        let x0, y0, l0, t0, dragging = false;
        handle.onmousedown = e => {
            if (e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            dragging = true;
            x0 = e.clientX; y0 = e.clientY;
            const r = panel.getBoundingClientRect();
            l0 = r.left; t0 = r.top;
            panel.style.left = l0 + 'px';
            panel.style.bottom = 'auto';
            panel.style.top = t0 + 'px';
            panel.style.transform = 'none';
            document.onmousemove = e => {
                if (!dragging) return;
                panel.style.left = (l0 + e.clientX - x0) + 'px';
                panel.style.top  = (t0 + e.clientY - y0) + 'px';
            };
            document.onmouseup = () => { dragging = false; document.onmousemove = null; };
        };
    }

    render();
})();
