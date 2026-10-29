/* Monta os cards da pagina de camisetas a partir de loja/produtos.js.
   Visual de vitrine: foto em fundo claro, nome e preco embaixo. O card
   inteiro leva ao link de pagamento (quando houver). */
// As camisetas do Painel (admin.html), quando houver, substituem as de
// loja/produtos.js; com contas ligadas, espera elas chegarem do banco
(typeof CONFIG_PRONTA !== 'undefined' ? CONFIG_PRONTA : Promise.resolve()).then(function () {
    const grade = document.getElementById('produtos');
    const PRODUTOS_LOJA = (typeof configProdutos === 'function' && configProdutos()) || (typeof PRODUTOS !== 'undefined' ? PRODUTOS : null);
    if (!grade || !PRODUTOS_LOJA) return;
    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    grade.innerHTML = PRODUTOS_LOJA.map(p => {
        const fotos = p.fotos || [];
        const capa = fotos.length
            ? `<img src="${esc(fotos[0])}" alt="${esc(p.nome)}" loading="lazy">`
              + (fotos[1] ? `<img class="produto-foto-2" src="${esc(fotos[1])}" alt="" loading="lazy">` : '')
            : `<span class="produto-sem-foto">Foto em breve</span>`;
        // Tamanhos com a quantidade disponivel, quando informada
        const estoque = p.estoque || null;
        const tamanhos = (p.tamanhos || []).map(t => {
            if (!estoque || estoque[t] === undefined) return `<li>${esc(t)}</li>`;
            const n = Number(estoque[t]) || 0;
            return `<li class="${n ? '' : 'esgotado'}"><strong>${esc(t)}</strong><span>${n ? `${n} unid.` : 'esgotado'}</span></li>`;
        }).join('');
        // Tabela de medidas (abre ao clicar), quando informada
        const m = p.medidas;
        const tabela = m && m.linhas ? `<details class="produto-medidas">
                <summary>Tabela de medidas (cm)</summary>
                <table>
                    <thead><tr><th></th>${m.colunas.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
                    <tbody>${Object.entries(m.linhas).map(([t, v]) => `<tr><th>${esc(t)}</th>${v
                        ? v.map(n => `<td>${esc(n)}</td>`).join('')
                        : `<td colspan="${m.colunas.length}" class="medida-breve">em breve</td>`}</tr>`).join('')}</tbody>
                </table>
            </details>` : '';
        // Botao Comprar sempre visivel; sem link ainda, aparece mas nao reage
        const comprar = p.link
            ? `<a class="produto-comprar" href="${esc(p.link)}" target="_blank" rel="noopener">Comprar <span aria-hidden="true">→</span></a>`
            : `<span class="produto-comprar" aria-disabled="true" title="Link de pagamento em breve">Comprar <span aria-hidden="true">→</span></span>`;
        const abre = p.link
            ? `<a class="produto" href="${esc(p.link)}" target="_blank" rel="noopener">`
            : `<div class="produto produto-indisponivel">`;
        const fecha = p.link ? '</a>' : '</div>';
        return `<div class="produto-item">${abre}
                <div class="produto-foto">
                    ${capa}
                </div>
                <h3 class="produto-nome">${esc(p.nome)}</h3>
                <p class="produto-preco">${p.preco ? esc(p.preco) : 'Preço em breve'}</p>
                ${tamanhos ? `<div class="produto-tamanhos">${estoque ? '<span class="produto-tamanhos-titulo">Disponíveis</span>' : ''}<ul>${tamanhos}</ul></div>` : ''}
            ${fecha}${tabela}${comprar}</div>`;
    }).join('');
});
