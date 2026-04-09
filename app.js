const baseDeDados = [
    // --- MOSTEIROS ---
    { id: 'B', qtd: 4, img: 'imagens/peca_b.jpeg' }, // Mosteiro isolado
    { id: 'A', qtd: 2, img: 'imagens/peca_a.jpeg' }, // Mosteiro com estrada

    // --- ESTRADAS E CRUZAMENTOS ---
    { id: 'V', qtd: 9, img: 'imagens/peca_v.jpeg' }, // Curva
    { id: 'U', qtd: 8, img: 'imagens/peca_u.jpeg' }, // Reta
    { id: 'W', qtd: 4, img: 'imagens/peca_w.jpeg' }, // T (3 caminhos)
    { id: 'X', qtd: 1, img: 'imagens/peca_x.jpeg' }, // X (4 caminhos)

    // --- CIDADES SIMPLES / QUINAS ---
    { id: 'C', qtd: 1, img: 'imagens/peca_c.jpeg' }, // Cidade pequena completa (escudo)
    { id: 'I', qtd: 2, img: 'imagens/peca_i.jpeg' }, // Apenas uma lateral de cidade
    { id: 'G', qtd: 1, img: 'imagens/peca_g.jpeg' }, // Quina de cidade
    { id: 'F', qtd: 2, img: 'imagens/peca_f.jpeg' }, // Quina de cidade (escudo)
    { id: 'E', qtd: 5, img: 'imagens/peca_e.jpeg' }, // Lateral reta de cidade
    { id: 'H', qtd: 3, img: 'imagens/peca_h.jpeg' }, // Duas laterais separadas

    // --- CIDADES COM ESTRADAS ---
    { id: 'D', qtd: 4, img: 'imagens/peca_d.jpeg' }, // Estrada curva + Quina cidade
    { id: 'J', qtd: 3, img: 'imagens/peca_j.jpeg' }, // Estrada curva + Lateral cidade
    { id: 'K', qtd: 3, img: 'imagens/peca_k.jpeg' }, // Estrada reta + Lateral cidade
    { id: 'L', qtd: 3, img: 'imagens/peca_l.jpeg' }, // Cruzamento T + Lateral cidade

    // --- CIDADES GRANDES (2 OU 3 LADOS) ---
    { id: 'N', qtd: 3, img: 'imagens/peca_n.jpeg' }, // 2 lados (continua) + estrada
    { id: 'M', qtd: 2, img: 'imagens/peca_m.jpeg' }, // 2 lados (continua) + estrada (escudo)
    { id: 'P', qtd: 3, img: 'imagens/peca_p.jpeg' }, // 2 lados (quina) + estrada
    { id: 'O', qtd: 2, img: 'imagens/peca_o.jpeg' }, // 2 lados (quina) + estrada (escudo)
    { id: 'R', qtd: 3, img: 'imagens/peca_r.jpeg' }, // 3 lados cidade
    { id: 'Q', qtd: 1, img: 'imagens/peca_q.jpeg' }, // 3 lados cidade (escudo)
    { id: 'T', qtd: 1, img: 'imagens/peca_t.jpeg' }, // 3 lados cidade + estrada
    { id: 'S', qtd: 2, img: 'imagens/peca_s.jpeg' }  // 3 lados cidade + estrada (escudo)
];

let estado = [];

function render() {
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';

    // Calcula o total de peças que ainda não saíram
    const totalRestanteGlobal = estado.reduce((acc, item) => acc + item.atual, 0);

    estado.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `tile-card ${item.atual === 0 ? 'esgotado' : ''}`;
        
        // Probabilidade de tirar esta peça específica
        const prob = totalRestanteGlobal > 0 
            ? ((item.atual / totalRestanteGlobal) * 100).toFixed(1) 
            : 0;

        card.innerHTML = `
            <img src="${item.img}" class="tile-img">
            <div class="tile-info">
                <div class="tile-count">${item.qtd - item.atual} / ${item.qtd}</div>
                <div class="tile-prob">${prob}%</div>
            </div>
        `;

        card.onclick = () => {
            if (item.atual > 0) {
                item.atual--;
                salvarEAtualizar();
            }
        };

        grid.appendChild(card);
    });
}

function salvarEAtualizar() {
    localStorage.setItem('progresso_carcassonne', JSON.stringify(estado));
    render();
}

document.getElementById('btn-reset').onclick = () => {
    if(confirm("Deseja reiniciar a contagem?")) {
        estado = baseDeDados.map(p => ({ ...p, atual: p.qtd }));
        localStorage.removeItem('progresso_carcassonne');
        render();
    }
};

// Inicialização
const salvo = localStorage.getItem('progresso_carcassonne');
if (salvo) {
    estado = JSON.parse(salvo);
    render();
} else {
    estado = baseDeDados.map(p => ({ ...p, atual: p.qtd }));
    render();
}