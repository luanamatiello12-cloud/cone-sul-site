/* Monta os cards da pagina de camisetas a partir de loja/produtos.js.
   Visual de vitrine: foto em fundo claro, nome e preco embaixo. O card
   inteiro leva ao link de pagamento (quando houver). */
(function () {
    const grade = document.getElementById('produtos');
    if (!grade || typeof PRODUTOS === 'undefined') return;
    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    grade.innerHTML = PRODUTOS.map(p => {
        const fotos = p.fotos || [];
        const capa = fotos.length
            ? `<img src="${esc(fotos[0])}" alt="${esc(p.nome)}" loading="lazy">`
              + (fotos[1] ? `<img class="produto-foto-2" src="${esc(fotos[1])}" alt="" loading="lazy">` : '')
            : `<span class="produto-sem-foto">Foto em breve</span>`;
        const tamanhos = (p.tamanhos || []).join(' · ');
        const abre = p.link
            ? `<a class="produto" href="${esc(p.link)}" target="_blank" rel="noopener">`
            : `<div class="produto produto-indisponivel">`;
        const fecha = p.link ? '</a>' : '</div>';
        return `${abre}
                <div class="produto-foto">
                    ${capa}
                    ${p.link ? '' : '<span class="produto-selo">Em breve</span>'}
                </div>
                <h3 class="produto-nome">${esc(p.nome)}</h3>
                <p class="produto-preco">${p.preco ? esc(p.preco) : 'Preço em breve'}</p>
                ${tamanhos ? `<p class="produto-tamanhos">${esc(tamanhos)}</p>` : ''}
            ${fecha}`;
    }).join('');
})();
