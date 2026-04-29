(function () {
    const ID = '_crc_overlay';

    // Se já existe, alterna visibilidade
    const prev = document.getElementById(ID);
    if (prev) { prev.style.display = prev.style.display === 'none' ? 'block' : 'none'; return; }

    const TILES = [
        { id: 'B', qtd: 4, f: ['m', 'e'] },
        { id: 'A', qtd: 2, f: ['m'] },
        { id: 'V', qtd: 9, f: ['e'] },
        { id: 'U', qtd: 8, f: ['e'] },
        { id: 'W', qtd: 4, f: ['e'] },
        { id: 'X', qtd: 1, f: ['e'] },
        { id: 'C', qtd: 1, f: ['c', 's'] },
        { id: 'I', qtd: 2, f: ['c'] },
        { id: 'G', qtd: 1, f: ['c'] },
        { id: 'F', qtd: 2, f: ['c', 's'] },
        { id: 'E', qtd: 5, f: ['c'] },
        { id: 'H', qtd: 3, f: ['c'] },
        { id: 'D', qtd: 4, f: ['c', 'e'] },
        { id: 'J', qtd: 3, f: ['c', 'e'] },
        { id: 'K', qtd: 3, f: ['c', 'e'] },
        { id: 'L', qtd: 3, f: ['c', 'e'] },
        { id: 'N', qtd: 3, f: ['c'] },
        { id: 'M', qtd: 2, f: ['c', 's'] },
        { id: 'P', qtd: 3, f: ['c', 'e'] },
        { id: 'O', qtd: 2, f: ['c', 'e', 's'] },
        { id: 'R', qtd: 3, f: ['c'] },
        { id: 'Q', qtd: 1, f: ['c', 's'] },
        { id: 'T', qtd: 1, f: ['c', 'e'] },
        { id: 'S', qtd: 2, f: ['c', 'e', 's'] },
    ];

    const ICONS = { c: '🏰', e: '🛤️', m: '⛪', s: '🛡️' };
    const NAMES = { c: 'Cidade', e: 'Estrada', m: 'Mosteiro', s: 'Escudo' };

    // Estado persiste enquanto a aba estiver aberta
    let state = JSON.parse(sessionStorage.getItem('_crc') || 'null') || TILES.map(t => ({ ...t, atual: t.qtd }));
    let hist = JSON.parse(sessionStorage.getItem('_crcH') || '[]');
    let filtros = new Set();

    function save() {
        sessionStorage.setItem('_crc', JSON.stringify(state));
        sessionStorage.setItem('_crcH', JSON.stringify(hist));
    }

    function registrar(i) {
        if (state[i].atual <= 0) return;
        state[i].atual--;
        hist.unshift(i);
        if (hist.length > 10) hist.pop();
        save(); render();
    }

    function desfazer() {
        if (!hist.length) return;
        state[hist.shift()].atual++;
        save(); render();
    }

    window._crcReg = registrar;
    window._crcUndo = desfazer;
    window._crcFiltro = function (f) {
        filtros.has(f) ? filtros.delete(f) : filtros.add(f);
        render();
    };
    window._crcReset = function () {
        if (!confirm('Reiniciar contagem?')) return;
        state = TILES.map(t => ({ ...t, atual: t.qtd }));
        hist = [];
        filtros.clear();
        save(); render();
    };

    function render() {
        const total = state.reduce((s, t) => s + t.atual, 0);

        // Barra de probabilidade
        let probHtml = '';
        if (filtros.size > 0) {
            const n = state.filter(t => t.f.some(f => filtros.has(f))).reduce((s, t) => s + t.atual, 0);
            const pct = total > 0 ? ((n / total) * 100).toFixed(1) : 0;
            const cor = pct >= 50 ? '#27ae60' : pct >= 25 ? '#f39c12' : '#e74c3c';
            const nomes = [...filtros].map(f => ICONS[f] + ' ' + NAMES[f]).join(' ou ');
            probHtml = `<div style="background:#0f1923;border-radius:6px;padding:6px 8px;margin:6px 0 8px">
                <div style="color:#aaa;font-size:11px;margin-bottom:2px">${nomes}:</div>
                <span style="color:${cor};font-size:1.5em;font-weight:900">${pct}%</span>
                <span style="color:#666;font-size:11px;margin-left:6px">${n} de ${total} peças</span>
            </div>`;
        }

        // Botões de filtro
        const filtBtns = ['c', 'e', 'm', 's'].map(f =>
            `<button onclick="window._crcFiltro('${f}')" style="background:${filtros.has(f) ? '#3498db' : '#34495e'};color:white;border:none;border-radius:12px;padding:4px 9px;font-size:11px;cursor:pointer;margin:2px">${ICONS[f]} ${NAMES[f]}</button>`
        ).join('');

        // Grid de peças
        const tileBtns = state.map((t, i) => {
            const match = filtros.size === 0 || t.f.some(f => filtros.has(f));
            const op = t.atual === 0 ? '0.25' : (filtros.size > 0 && !match ? '0.2' : '1');
            const bord = filtros.size > 0 && match && t.atual > 0 ? '2px solid #3498db' : '1px solid #34495e';
            const cor = t.atual === 0 ? '#e74c3c' : '#27ae60';
            const ficons = t.f.map(f => ICONS[f]).join('');
            return `<button onclick="window._crcReg(${i})" style="opacity:${op};background:#243342;color:white;border:${bord};border-radius:6px;padding:5px 4px;font-size:11px;cursor:pointer;min-width:38px;text-align:center;line-height:1.3">
                <div style="font-size:9px;margin-bottom:1px">${ficons}</div>
                <strong style="font-size:13px">${t.id}</strong>
                <div style="color:${cor};font-size:10px">${t.atual}x</div>
            </button>`;
        }).join('');

        panel.innerHTML = `
            <div id="_crc_drag" style="background:#1a252f;padding:8px 12px;border-bottom:1px solid #34495e;display:flex;justify-content:space-between;align-items:center;cursor:move;border-radius:10px 10px 0 0">
                <strong style="font-size:13px;letter-spacing:.5px">🏰 Carcassonne</strong>
                <div style="display:flex;align-items:center;gap:8px">
                    <span style="color:#666;font-size:11px">${total} peças</span>
                    <button onclick="window._crcReset()" style="background:none;border:none;color:#e74c3c;font-size:12px;cursor:pointer;padding:0" title="Reiniciar">↺</button>
                    <button onclick="document.getElementById('${ID}').style.display='none'" style="background:none;border:none;color:#95a5a6;font-size:16px;cursor:pointer;padding:0" title="Minimizar">−</button>
                    <button onclick="document.getElementById('${ID}').remove()" style="background:none;border:none;color:#e74c3c;font-size:16px;cursor:pointer;padding:0" title="Fechar">✕</button>
                </div>
            </div>
            <div style="padding:10px 12px">
                <div style="margin-bottom:2px">${filtBtns}</div>
                ${probHtml}
                <div style="display:flex;flex-wrap:wrap;gap:5px;max-height:200px;overflow-y:auto;padding:2px 0">${tileBtns}</div>
                <div style="margin-top:8px;border-top:1px solid #34495e;padding-top:8px;display:flex;align-items:center;gap:8px">
                    <button onclick="window._crcUndo()" ${hist.length === 0 ? 'disabled' : ''} style="background:#f39c12;color:white;border:none;border-radius:5px;padding:5px 12px;font-size:11px;cursor:pointer;opacity:${hist.length === 0 ? .4 : 1}">↩ Desfazer</button>
                    <span style="font-size:10px;color:#666">${hist.length} no histórico</span>
                </div>
            </div>
        `;

        makeDraggable();
    }

    // Painel flutuante
    const panel = document.createElement('div');
    panel.id = ID;
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 330px;
        background: #2c3e50;
        border: 2px solid #3498db;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0,0,0,.7);
        z-index: 2147483647;
        color: white;
        font-family: -apple-system, system-ui, sans-serif;
        user-select: none;
    `;
    document.body.appendChild(panel);

    // Drag
    function makeDraggable() {
        const handle = document.getElementById('_crc_drag');
        if (!handle) return;
        let x0, y0, l0, t0;
        handle.onmousedown = e => {
            e.preventDefault();
            x0 = e.clientX; y0 = e.clientY;
            const r = panel.getBoundingClientRect();
            l0 = r.left; t0 = r.top;
            panel.style.right = 'auto';
            document.onmousemove = e => {
                panel.style.left = (l0 + e.clientX - x0) + 'px';
                panel.style.top = (t0 + e.clientY - y0) + 'px';
            };
            document.onmouseup = () => { document.onmousemove = null; };
        };
    }

    render();
})();
