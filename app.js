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

let estado = [];
let historico = [];

function render() {
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';

    const totalRestanteGlobal = estado.reduce((acc, item) => acc + item.atual, 0);

    estado.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `tile-card ${item.atual === 0 ? 'esgotado' : ''}`;
        
        const prob = totalRestanteGlobal > 0 ? ((item.atual / totalRestanteGlobal) * 100).toFixed(1) : 0;

        card.innerHTML = `
            <img src="${item.img}" class="tile-img">
            <div class="tile-info">
                <div class="tile-count">${item.qtd - item.atual} / ${item.qtd}</div>
                <div class="tile-prob">${prob}%</div>
            </div>
        `;

        card.onclick = () => { if (item.atual > 0) registrarJogada(index); };
        grid.appendChild(card);
    });

    renderHistorico();
}

function registrarJogada(index) {
    estado[index].atual--;
    historico.unshift({ index: index, id: estado[index].id, img: estado[index].img });
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
    let container = document.getElementById('historico-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'historico-container';
        document.body.appendChild(container);
    }

    container.innerHTML = `
        <div class="historico-header">
            <span>Últimas jogadas (Histórico):</span>
            <button id="btn-undo" onclick="desfazer()" ${historico.length === 0 ? 'disabled' : ''}>↩ Desfazer</button>
        </div>
        <div class="historico-lista">
            ${historico.map(h => `<img src="${h.img}" class="img-mini">`).join('')}
        </div>
    `;
}

function salvar() {
    localStorage.setItem('progresso_carcassonne', JSON.stringify(estado));
    localStorage.setItem('historico_carcassonne', JSON.stringify(historico));
    render();
}

document.getElementById('btn-reset').onclick = () => {
    if(confirm("Reiniciar jogo?")) {
        estado = baseDeDados.map(p => ({ ...p, atual: p.qtd }));
        historico = [];
        localStorage.clear();
        render();
    }
};

// Início
const salvo = localStorage.getItem('progresso_carcassonne');
const histSalvo = localStorage.getItem('historico_carcassonne');

if (salvo) {
    estado = JSON.parse(salvo);
    if (histSalvo) historico = JSON.parse(histSalvo);
    render();
} else {
    estado = baseDeDados.map(p => ({ ...p, atual: p.qtd }));
    render();
}