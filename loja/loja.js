/* Monta os cards da pagina de camisetas a partir de loja/produtos.js */
(function () {
    const grade = document.getElementById('produtos');
    if (!grade || typeof PRODUTOS === 'undefined') return;
    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    grade.innerHTML = PRODUTOS.map(p => {
        const capa = p.fotos && p.fotos.length
            ? `<img src="${esc(p.fotos[0])}" alt="${esc(p.nome)}" loading="lazy">`
            : `<div class="produto-sem-foto"><span>Cone Sul</span><small>Foto em breve</small></div>`;
        const tamanhos = (p.tamanhos || []).map(t => `<li>${esc(t)}</li>`).join('');
        const botao = p.link
            ? `<a class="btn btn-primary produto-btn" href="${esc(p.link)}" target="_blank" rel="noopener">Comprar <span aria-hidden="true">→</span></a>`
            : `<span class="btn produto-btn produto-btn-breve" aria-disabled="true">Em breve</span>`;
        return `
            <article class="produto">
                <div class="produto-foto">${capa}</div>
                <div class="produto-corpo">
                    <h3>${esc(p.nome)}</h3>
                    ${p.descricao ? `<p class="produto-desc">${esc(p.descricao)}</p>` : ''}
                    <p class="produto-preco">${p.preco ? esc(p.preco) : 'Preço em breve'}</p>
                    ${tamanhos ? `<div class="produto-tamanhos"><span>Tamanhos</span><ul>${tamanhos}</ul></div>` : ''}
                    ${botao}
                </div>
            </article>`;
    }).join('');
})();
