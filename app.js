const baseDeDados = [
    { id: 'B', qtd: 4, img: 'imagens/peca_b.jpeg' },
    { id: 'A', qtd: 2, img: 'imagens/peca_a.jpeg' },
    { id: 'V', qtd: 9, img: 'imagens/peca_v.jpeg' },
    { id: 'U', qtd: 8, img: 'imagens/peca_u.jpeg' },
    { id: 'W', qtd: 4, img: 'imagens/peca_w.jpeg' },
    { id: 'X', qtd: 1, img: 'imagens/peca_x.jpeg' },
    { id: 'C', qtd: 1, img: 'imagens/peca_c.jpeg' },
    { id: 'I', qtd: 2, img: 'imagens/peca_i.jpeg' },
    { id: 'G', qtd: 1, img: 'imagens/peca_g.jpeg' },
    { id: 'F', qtd: 2, img: 'imagens/peca_f.jpeg' },
    { id: 'E', qtd: 5, img: 'imagens/peca_e.jpeg' },
    { id: 'H', qtd: 3, img: 'imagens/peca_h.jpeg' },
    { id: 'D', qtd: 4, img: 'imagens/peca_d.jpeg' },
    { id: 'J', qtd: 3, img: 'imagens/peca_j.jpeg' },
    { id: 'K', qtd: 3, img: 'imagens/peca_k.jpeg' },
    { id: 'L', qtd: 3, img: 'imagens/peca_l.jpeg' },
    { id: 'N', qtd: 3, img: 'imagens/peca_n.jpeg' },
    { id: 'M', qtd: 2, img: 'imagens/peca_m.jpeg' },
    { id: 'P', qtd: 3, img: 'imagens/peca_p.jpeg' },
    { id: 'O', qtd: 2, img: 'imagens/peca_o.jpeg' },
    { id: 'R', qtd: 3, img: 'imagens/peca_r.jpeg' },
    { id: 'Q', qtd: 1, img: 'imagens/peca_q.jpeg' },
    { id: 'T', qtd: 1, img: 'imagens/peca_t.jpeg' },
    { id: 'S', qtd: 2, img: 'imagens/peca_s.jpeg' }
];

// Features de cada tipo de peça (padrão Carcassonne base)
const tileFeatures = {
    'A': ['mosteiro'],
    'B': ['mosteiro', 'estrada'],
    'C': ['cidade', 'escudo'],
    'D': ['cidade', 'estrada'],
    'E': ['cidade'],
    'F': ['cidade', 'escudo'],
    'G': ['cidade'],
    'H': ['cidade'],
    'I': ['cidade'],
    'J': ['cidade', 'estrada'],
    'K': ['cidade', 'estrada'],
    'L': ['cidade', 'estrada'],
    'M': ['cidade', 'escudo'],
    'N': ['cidade'],
    'O': ['cidade', 'estrada', 'escudo'],
    'P': ['cidade', 'estrada'],
    'Q': ['cidade', 'escudo'],
    'R': ['cidade'],
    'S': ['cidade', 'estrada', 'escudo'],
    'T': ['cidade', 'estrada'],
    'U': ['estrada'],
    'V': ['estrada'],
    'W': ['estrada'],
    'X': ['estrada'],
};

const featureIcons = { cidade: '🏰', estrada: '🛤️', mosteiro: '⛪', escudo: '🛡️' };

// ===== ESTADO =====
let estado = [];
let historico = [];
const MAP_SIZE = 21;
let mapaGrid = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(null));
let tileSelecionadoMapa = null;
let rotacaoAtual = 0;
let modoRemover = false;
let filtrosAtivos = new Set();
let abaAtiva = 'pecas';
let mapaJaCentralizou = false;

// ===== PEÇAS =====

function render() {
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';

    const totalRestante = estado.reduce((acc, item) => acc + item.atual, 0);

    // Calcular e exibir probabilidade do filtro
    const probEl = document.getElementById('prob-filtro');
    if (filtrosAtivos.size > 0) {
        const matching = estado.filter(item =>
            (tileFeatures[item.id] || []).some(f => filtrosAtivos.has(f))
        );
        const totalMatch = matching.reduce((acc, item) => acc + item.atual, 0);
        const pct = totalRestante > 0 ? ((totalMatch / totalRestante) * 100).toFixed(1) : 0;
        const nomes = Array.from(filtrosAtivos).map(f => featureIcons[f] + ' ' + f.charAt(0).toUpperCase() + f.slice(1));
        const nivel = parseFloat(pct) >= 50 ? 'alta' : parseFloat(pct) >= 25 ? 'media' : 'baixa';

        probEl.hidden = false;
        probEl.innerHTML = `
            <div class="prob-resultado">
                <span class="prob-label">Chance de tirar [${nomes.join(' ou ')}]:</span>
                <span class="prob-value ${nivel}">${pct}%</span>
                <span class="prob-detalhe">${totalMatch} de ${totalRestante} peças restantes</span>
            </div>
        `;
    } else {
        probEl.hidden = true;
    }

    // Renderizar cards de peças
    estado.forEach((item, index) => {
        const matchesFiltro = filtrosAtivos.size === 0 ||
            (tileFeatures[item.id] || []).some(f => filtrosAtivos.has(f));

        const prob = totalRestante > 0 ? ((item.atual / totalRestante) * 100).toFixed(1) : 0;
        const icons = (tileFeatures[item.id] || []).map(f => featureIcons[f]).join(' ');

        const card = document.createElement('div');
        card.className = [
            'tile-card',
            item.atual === 0 ? 'esgotado' : '',
            filtrosAtivos.size > 0 && matchesFiltro && item.atual > 0 ? 'destacado' : '',
            filtrosAtivos.size > 0 && !matchesFiltro ? 'desfocado' : '',
        ].filter(Boolean).join(' ');

        card.innerHTML = `
            <img src="${item.img}" class="tile-img">
            <div class="tile-info">
                <div class="tile-features">${icons}</div>
                <div class="tile-count">${item.qtd - item.atual} / ${item.qtd}</div>
                <div class="tile-prob">${prob}%</div>
            </div>
        `;

        card.onclick = () => { if (item.atual > 0) registrarJogada(index); };
        grid.appendChild(card);
    });

    renderHistorico();
}

function toggleFiltro(feature) {
    if (filtrosAtivos.has(feature)) {
        filtrosAtivos.delete(feature);
    } else {
        filtrosAtivos.add(feature);
    }
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.classList.toggle('ativo', filtrosAtivos.has(btn.dataset.feature));
    });
    render();
}

// ===== MAPA =====

function renderMapa() {
    // Preview da peça selecionada
    const preview = document.getElementById('tile-selecionado-preview');
    if (modoRemover) {
        preview.innerHTML = `<div class="preview-badge remover">✕ Remover</div>`;
    } else if (tileSelecionadoMapa) {
        preview.innerHTML = `<img src="${tileSelecionadoMapa.img}" class="preview-img" style="transform:rotate(${rotacaoAtual}deg)">`;
    } else {
        preview.innerHTML = `<div class="preview-badge">Selecione →</div>`;
    }

    // Tile picker (seletor horizontal)
    const picker = document.getElementById('tile-picker');
    picker.innerHTML = '';
    baseDeDados.forEach(base => {
        const item = estado.find(e => e.id === base.id);
        const div = document.createElement('div');
        div.className = [
            'picker-item',
            item.atual === 0 ? 'esgotado-picker' : '',
            tileSelecionadoMapa?.id === base.id && !modoRemover ? 'picker-ativo' : '',
        ].filter(Boolean).join(' ');
        div.innerHTML = `<img src="${base.img}"><span>${item.atual}x</span>`;
        div.onclick = () => {
            modoRemover = false;
            tileSelecionadoMapa = { id: base.id, img: base.img };
            document.getElementById('btn-remover-modo').classList.remove('ativo');
            renderMapa();
        };
        picker.appendChild(div);
    });

    // Grid do mapa
    const grid = document.getElementById('mapa-grid');
    grid.innerHTML = '';

    for (let row = 0; row < MAP_SIZE; row++) {
        for (let col = 0; col < MAP_SIZE; col++) {
            const cell = document.createElement('div');
            const tile = mapaGrid[row][col];
            cell.className = 'mapa-cell';

            if (tile) {
                cell.classList.add('ocupada');
                cell.innerHTML = `<img src="${tile.img}" style="transform:rotate(${tile.rotacao}deg)">`;
                if (modoRemover) {
                    cell.classList.add('removivel');
                    cell.onclick = () => removerDoMapa(row, col);
                }
            } else {
                cell.classList.add('vazia');
                if (tileSelecionadoMapa && !modoRemover) {
                    cell.classList.add('colocavel');
                    cell.onclick = () => colocarNaMapa(row, col);
                }
            }

            grid.appendChild(cell);
        }
    }

    // Centralizar no primeiro render
    if (!mapaJaCentralizou) {
        setTimeout(() => {
            const scroll = document.getElementById('mapa-scroll');
            scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) / 2;
            scroll.scrollTop = (scroll.scrollHeight - scroll.clientHeight) / 2;
            mapaJaCentralizou = true;
        }, 60);
    }
}

function colocarNaMapa(row, col) {
    if (!tileSelecionadoMapa || mapaGrid[row][col]) return;
    mapaGrid[row][col] = { ...tileSelecionadoMapa, rotacao: rotacaoAtual };
    salvarMapa();
    renderMapa();
}

function removerDoMapa(row, col) {
    if (!mapaGrid[row][col]) return;
    mapaGrid[row][col] = null;
    salvarMapa();
    renderMapa();
}

// ===== TABS =====

function mudarAba(aba) {
    abaAtiva = aba;
    document.getElementById('tab-pecas').hidden = aba !== 'pecas';
    document.getElementById('tab-mapa').hidden = aba !== 'mapa';
    document.getElementById('historico-container').hidden = aba !== 'pecas';
    document.body.classList.toggle('aba-mapa', aba === 'mapa');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.tab === aba);
    });
    if (aba === 'mapa') renderMapa();
}

// ===== HISTÓRICO =====

function registrarJogada(index) {
    estado[index].atual--;
    historico.unshift({ index, id: estado[index].id, img: estado[index].img });
    if (historico.length > 10) historico.pop();
    salvar();
}

function desfazer() {
    if (historico.length === 0) return;
    const ultima = historico.shift();
    estado[ultima.index].atual++;
    salvar();
}

function renderHistorico() {
    const container = document.getElementById('historico-container');
    container.innerHTML = `
        <div class="historico-header">
            <span>Últimas jogadas:</span>
            <button id="btn-undo" onclick="desfazer()" ${historico.length === 0 ? 'disabled' : ''}>↩ Desfazer</button>
        </div>
        <div class="historico-lista">
            ${historico.map(h => `<img src="${h.img}" class="img-mini" title="Peça ${h.id}">`).join('')}
        </div>
    `;
}

// ===== PERSISTÊNCIA =====

function salvar() {
    localStorage.setItem('progresso_carcassonne', JSON.stringify(estado));
    localStorage.setItem('historico_carcassonne', JSON.stringify(historico));
    render();
}

function salvarMapa() {
    localStorage.setItem('mapa_carcassonne', JSON.stringify(mapaGrid));
}

// ===== BOTÕES =====

document.getElementById('btn-reset').onclick = () => {
    if (confirm('Reiniciar jogo? Isso apaga o progresso e o mapa.')) {
        estado = baseDeDados.map(p => ({ ...p, atual: p.qtd }));
        historico = [];
        mapaGrid = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(null));
        mapaJaCentralizou = false;
        tileSelecionadoMapa = null;
        rotacaoAtual = 0;
        modoRemover = false;
        filtrosAtivos.clear();
        document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
        document.getElementById('btn-remover-modo').classList.remove('ativo');
        localStorage.clear();
        render();
        if (abaAtiva === 'mapa') renderMapa();
    }
};

document.getElementById('btn-rotacionar').onclick = () => {
    rotacaoAtual = (rotacaoAtual + 90) % 360;
    const img = document.querySelector('#tile-selecionado-preview .preview-img');
    if (img) img.style.transform = `rotate(${rotacaoAtual}deg)`;
};

document.getElementById('btn-remover-modo').onclick = () => {
    modoRemover = !modoRemover;
    if (modoRemover) tileSelecionadoMapa = null;
    document.getElementById('btn-remover-modo').classList.toggle('ativo', modoRemover);
    renderMapa();
};

// ===== INICIALIZAÇÃO =====

const salvo = localStorage.getItem('progresso_carcassonne');
const histSalvo = localStorage.getItem('historico_carcassonne');
const mapaSalvo = localStorage.getItem('mapa_carcassonne');

estado = salvo ? JSON.parse(salvo) : baseDeDados.map(p => ({ ...p, atual: p.qtd }));
if (histSalvo) historico = JSON.parse(histSalvo);
if (mapaSalvo) mapaGrid = JSON.parse(mapaSalvo);

render();
