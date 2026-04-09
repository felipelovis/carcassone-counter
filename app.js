const baseDeDados = [
    { id: 'A', qtd: 2, img: 'imagens/peca_a.jpeg' },
    { id: 'B', qtd: 4, img: 'imagens/peca_b.jpeg' },
    { id: 'C', qtd: 1, img: 'imagens/peca_c.jpeg' },
    { id: 'D', qtd: 4, img: 'imagens/peca_d.jpeg' },
    { id: 'E', qtd: 5, img: 'imagens/peca_e.jpeg' },
    { id: 'F', qtd: 2, img: 'imagens/peca_f.jpeg' },
    { id: 'G', qtd: 1, img: 'imagens/peca_g.jpeg' },
    { id: 'H', qtd: 3, img: 'imagens/peca_h.jpeg' },
    { id: 'I', qtd: 2, img: 'imagens/peca_i.jpeg' },
    { id: 'J', qtd: 3, img: 'imagens/peca_j.jpeg' },
    { id: 'K', qtd: 3, img: 'imagens/peca_k.jpeg' },
    { id: 'L', qtd: 3, img: 'imagens/peca_l.jpeg' },
    { id: 'M', qtd: 2, img: 'imagens/peca_m.jpeg' },
    { id: 'N', qtd: 3, img: 'imagens/peca_n.jpeg' },
    { id: 'O', qtd: 2, img: 'imagens/peca_o.jpeg' },
    { id: 'P', qtd: 3, img: 'imagens/peca_p.jpeg' },
    { id: 'Q', qtd: 1, img: 'imagens/peca_q.jpeg' },
    { id: 'R', qtd: 3, img: 'imagens/peca_r.jpeg' },
    { id: 'S', qtd: 2, img: 'imagens/peca_s.jpeg' },
    { id: 'T', qtd: 1, img: 'imagens/peca_t.jpeg' },
    { id: 'U', qtd: 8, img: 'imagens/peca_u.jpeg' },
    { id: 'V', qtd: 9, img: 'imagens/peca_v.jpeg' },
    { id: 'W', qtd: 4, img: 'imagens/peca_w.jpeg' },
    { id: 'X', qtd: 1, img: 'imagens/peca_x.jpeg' }
];

let estado = [];

function render() {
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';
    estado.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `tile-card ${item.atual === 0 ? 'esgotado' : ''}`;
        card.innerHTML = `
            <img src="${item.img}" class="tile-img">
            <div class="tile-count">${item.atual}</div>
        `;
        card.onclick = () => {
            if(item.atual > 0) {
                item.atual--;
                localStorage.setItem('progresso_carcassonne', JSON.stringify(estado));                
                render();
            }
        };
        grid.appendChild(card);
    });
}

document.getElementById('btn-reset').onclick = () => {
    estado = baseDeDados.map(p => ({...p, atual: p.qtd}));
    localStorage.removeItem('progresso_carcassonne');
    render();
};

// Iniciar
const salvo = localStorage.getItem('progresso_carcassonne');
if (salvo) {
    estado = JSON.parse(salvo);
    render();
} else {
    document.getElementById('btn-reset').click();
}