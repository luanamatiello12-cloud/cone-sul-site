/* =========================================================
   PAINEL (editar.html): formularios para o que nao e texto de pagina
   - Contatos do rodape e links de pagamento dos planos
   - Camisetas (preco, estoque, medidas, fotos, link)
   - Cidades do mapa (fotos com legenda, mostrar/esconder, cidade nova)
   - Noticias (so com contas ligadas: ficam na tabela "noticias")
   Os tres primeiros formam a "configuracao do site" (app.js, aplicarConfig):
   com contas ligadas, Salvar publica no banco (site_edicoes, "_config");
   na demonstracao, fica neste navegador e vai em "Baixar edicoes".
   Depende de app.js (CONFIG_SITE, EDICAO, PORTAL...), loja/produtos.js,
   mapa/locais.js e mapa/territorios.js.
   ========================================================= */
(function () {
    const raiz = document.getElementById('painel-config');
    if (!raiz) return;
    const $ = (sel, el = document) => el.querySelector(sel);
    const el = (tag, props = {}, ...filhos) => {
        const e = Object.assign(document.createElement(tag), props);
        filhos.flat().forEach(f => f != null && e.append(f));
        return e;
    };
    const copia = (v) => JSON.parse(JSON.stringify(v ?? null));
    const campo = (rotulo, entrada, dica) => el('label', { className: 'pc-campo' }, el('span', { textContent: rotulo }), entrada, dica ? el('small', { textContent: dica }) : null);

    // ---------- Estado em edicao ----------
    const cfgAtual = CONFIG_SITE || {};
    const cfg = {
        contato: {
            email: CONTATO.email === 'contato@exemplo.com.br' ? '' : CONTATO.email,
            instagram: CONTATO.instagram === '#' ? '' : CONTATO.instagram,
            whatsapp: CONTATO.whatsapp === '#' ? '' : CONTATO.whatsapp,
            igreja: CONTATO.igreja === '#' ? '' : CONTATO.igreja
        },
        pagamentos: { ...LINKS_PAGAMENTO },
        produtos: configProdutos() || copia(typeof PRODUTOS !== 'undefined' ? PRODUTOS : []),
        locais: {
            fotos: copia(cfgAtual.locais?.fotos) || {},
            ocultos: copia(cfgAtual.locais?.ocultos) || [],
            novos: copia(cfgAtual.locais?.novos) || []
        }
    };
    // Partes que a equipe mexeu (as outras continuam vindo do codigo)
    const mexeu = { produtos: Array.isArray(cfgAtual.produtos), locais: !!cfgAtual.locais };
    let alterado = false;
    const statusSalvar = $('#pc-status');
    function marcar(parte) {
        if (parte) mexeu[parte] = true;
        alterado = true;
        statusSalvar.textContent = 'Há alterações não salvas.';
        $('#pc-salvar').disabled = false;
    }
    window.addEventListener('beforeunload', (e) => { if (alterado) { e.preventDefault(); e.returnValue = ''; } });

    // Foto escolhida: com contas, vai para o armazenamento; na demonstracao,
    // fica embutida (menor) nas edicoes
    async function enviarFoto(arquivo) {
        if (arquivo.size > 15e6) throw new Error('Imagem grande demais (máximo 15 MB).');
        return PORTAL.MODO_DEMO ? EDICAO.embutirImagem(arquivo) : EDICAO.enviarImagem(arquivo);
    }
    function escolherFotos(multiplas, aoEscolher) {
        const entrada = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', multiple: multiplas });
        entrada.addEventListener('change', async () => {
            for (const arquivo of entrada.files) {
                try { aoEscolher(await enviarFoto(arquivo)); } catch (erro) { alert(erro.message); }
            }
        });
        entrada.click();
    }
    // Lista de fotos com miniaturas: mover, tirar, legenda (opcional)
    function editorFotos(lista, { legendas = false, aoMudar }) {
        const caixa = el('div', { className: 'pc-fotos' });
        const desenhar = () => {
            caixa.replaceChildren(...lista.map((f, i) => {
                const src = typeof f === 'string' ? f : f.src;
                const item = el('div', { className: 'pc-foto' },
                    el('img', { src, alt: '', loading: 'lazy' }),
                    el('div', { className: 'pc-foto-acoes' },
                        el('button', { type: 'button', textContent: '←', title: 'Mover para a esquerda', disabled: i === 0, onclick: () => { lista.splice(i - 1, 0, lista.splice(i, 1)[0]); desenhar(); aoMudar(); } }),
                        el('button', { type: 'button', textContent: '→', title: 'Mover para a direita', disabled: i === lista.length - 1, onclick: () => { lista.splice(i + 1, 0, lista.splice(i, 1)[0]); desenhar(); aoMudar(); } }),
                        el('button', { type: 'button', textContent: '✕', title: 'Tirar esta foto', className: 'pc-perigo', onclick: () => { lista.splice(i, 1); desenhar(); aoMudar(); } })));
                if (legendas) {
                    const leg = el('input', { type: 'text', value: f.legenda || '', placeholder: 'Legenda (opcional)', maxLength: 140 });
                    leg.addEventListener('input', () => { f.legenda = leg.value; aoMudar(); });
                    item.append(leg);
                }
                return item;
            }), el('button', {
                type: 'button', className: 'pc-foto-nova', textContent: '+ Adicionar foto',
                onclick: () => escolherFotos(true, (src) => { lista.push(legendas ? { src, legenda: '' } : src); desenhar(); aoMudar(); })
            }));
        };
        desenhar();
        return caixa;
    }

    // ---------- 1. Contatos e links de pagamento ----------
    function montarContatos() {
        const corpo = $('#pc-contatos');
        const entrada = (obj, chave, tipo, placeholder) => {
            const i = el('input', { type: tipo, value: obj[chave] || '', placeholder });
            i.addEventListener('input', () => { obj[chave] = i.value.trim(); marcar(); });
            return i;
        };
        corpo.replaceChildren(
            el('h4', { textContent: 'Contatos do rodapé' }),
            el('div', { className: 'pc-grade' },
                campo('E-mail', entrada(cfg.contato, 'email', 'email', 'contato@…')),
                campo('Instagram', entrada(cfg.contato, 'instagram', 'url', 'https://instagram.com/…')),
                campo('WhatsApp', entrada(cfg.contato, 'whatsapp', 'url', 'https://wa.me/5549…'), 'https://wa.me/ + 55 + DDD + número, só números'),
                campo('Site da igreja', entrada(cfg.contato, 'igreja', 'url', 'https://…'))),
            el('h4', { textContent: 'Link de pagamento' }),
            el('p', { className: 'pc-dica', textContent: 'Um link só, para todos os planos: a pessoa escolhe o valor na página de pagamento, e o nível dela no login sai do valor contribuído. Vazio = o botão leva ao cadastro e avisa que o pagamento ainda não está disponível.' }),
            el('div', { className: 'pc-grade' },
                campo('Link de pagamento (todos os planos)', entrada(cfg.pagamentos, 'unico', 'url', 'https://…'))));
    }

    // ---------- 2. Camisetas ----------
    function montarProdutos() {
        const corpo = $('#pc-produtos');
        const listaTxt = (v) => (v || []).join(', ');
        const lerLista = (t) => t.split(',').map(x => x.trim()).filter(Boolean);
        const cartao = (p, i) => {
            const card = el('div', { className: 'pc-produto' });
            const redesenhar = () => card.replaceWith(cartao(p, i));
            const texto = (chave, rotulo, placeholder, tipo = 'text') => {
                const e = tipo === 'textarea' ? el('textarea', { value: p[chave] || '', rows: 2 }) : el('input', { type: tipo, value: p[chave] || '', placeholder });
                e.addEventListener('input', () => { p[chave] = e.value; marcar('produtos'); });
                return campo(rotulo, e);
            };
            const tamanhos = el('input', { type: 'text', value: listaTxt(p.tamanhos), placeholder: 'P, M, G, GG' });
            tamanhos.addEventListener('change', () => { p.tamanhos = lerLista(tamanhos.value); marcar('produtos'); redesenhar(); });
            const colunas = el('input', { type: 'text', value: listaTxt(p.medidas?.colunas), placeholder: 'Ombro, Largura, Comprimento' });
            colunas.addEventListener('change', () => {
                const c = lerLista(colunas.value);
                p.medidas = c.length ? { colunas: c, linhas: p.medidas?.linhas || {} } : null;
                marcar('produtos'); redesenhar();
            });
            // Tabela: estoque e medidas de cada tamanho
            const tabela = el('table', { className: 'pc-tabela' });
            const cols = p.medidas?.colunas || [];
            tabela.append(el('thead', {}, el('tr', {}, el('th', { textContent: 'Tamanho' }), el('th', { textContent: 'Estoque' }), ...cols.map(c => el('th', { textContent: c + ' (cm)' })))));
            const tbody = el('tbody');
            (p.tamanhos || []).forEach(t => {
                const est = el('input', { type: 'number', min: 0, step: 1, value: p.estoque?.[t] ?? '', placeholder: '—' });
                est.addEventListener('input', () => {
                    p.estoque = p.estoque || {};
                    if (est.value === '') delete p.estoque[t]; else p.estoque[t] = Math.max(0, Math.floor(Number(est.value)));
                    marcar('produtos');
                });
                const medidas = cols.map((_, j) => {
                    const m = el('input', { type: 'text', inputMode: 'decimal', value: p.medidas?.linhas?.[t]?.[j] ?? '', placeholder: '—' });
                    m.addEventListener('input', () => {
                        const linhas = p.medidas.linhas;
                        linhas[t] = Array.isArray(linhas[t]) ? linhas[t] : cols.map(() => '');
                        linhas[t][j] = m.value.trim();
                        marcar('produtos');
                    });
                    return el('td', {}, m);
                });
                tbody.append(el('tr', {}, el('th', { textContent: t }), el('td', {}, est), ...medidas));
            });
            tabela.append(tbody);
            p.fotos = Array.isArray(p.fotos) ? p.fotos : [];
            card.append(
                el('div', { className: 'pc-produto-topo' },
                    el('strong', { textContent: p.nome || 'Camiseta' }),
                    el('button', { type: 'button', className: 'pc-perigo', textContent: 'Tirar da loja', onclick: () => {
                        if (!confirm(`Tirar "${p.nome}" da loja?`)) return;
                        cfg.produtos.splice(i, 1); marcar('produtos'); montarProdutos();
                    } })),
                el('div', { className: 'pc-grade' },
                    texto('nome', 'Nome', 'Camiseta Cone Sul'),
                    texto('preco', 'Preço', 'R$ 79,90'),
                    texto('descricao', 'Descrição', '', 'textarea'),
                    texto('link', 'Link de pagamento', 'https://…', 'url'),
                    campo('Tamanhos', tamanhos, 'Separados por vírgula'),
                    campo('Medidas da tabela', colunas, 'Separadas por vírgula; vazio = sem tabela')),
                (p.tamanhos || []).length ? tabela : el('p', { className: 'pc-dica', textContent: 'Informe os tamanhos para preencher estoque e medidas.' }),
                el('h5', { textContent: 'Fotos (a primeira é a capa)' }),
                editorFotos(p.fotos, { aoMudar: () => marcar('produtos') }));
            return card;
        };
        corpo.replaceChildren(
            el('p', { className: 'pc-dica', textContent: 'Estoque vazio = não mostra quantidade; 0 = esgotado. Sem link de pagamento, o botão Comprar aparece como "em breve".' }),
            ...cfg.produtos.map(cartao),
            el('button', { type: 'button', className: 'btn btn-secondary', textContent: '+ Adicionar camiseta', onclick: () => {
                cfg.produtos.push({ nome: 'Nova camiseta', descricao: '', preco: '', tamanhos: ['P', 'M', 'G', 'GG'], estoque: null, medidas: null, fotos: [], link: '' });
                marcar('produtos'); montarProdutos();
            } }));
    }

    // ---------- 3. Cidades do mapa ----------
    const pastaDaCidade = (nome) => 'img/locais/' + nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '/';
    const existe = (src) => new Promise(ok => { const i = new Image(); i.onload = () => ok(true); i.onerror = () => ok(false); i.src = src; });
    // Fotos que ja estao na pasta da cidade (img/locais/<cidade>/01.jpg...)
    async function fotosDaPasta(nome) {
        const achadas = [];
        for (let n = 1; n <= 30; n++) {
            let src = null;
            for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG']) {
                const t = `${pastaDaCidade(nome)}${String(n).padStart(2, '0')}.${ext}`;
                if (await existe(t)) { src = t; break; }
            }
            if (!src) break;
            achadas.push({ src, legenda: '' });
        }
        return achadas;
    }
    function montarCidades() {
        const corpo = $('#pc-cidades');
        const base = typeof LOCAIS !== 'undefined' ? LOCAIS : [];
        const todas = [...base.map(l => ({ ...l, nova: false })), ...cfg.locais.novos.map(n => ({ ...n, nova: true }))];
        const linhas = todas.map(l => {
            const onde = l.uf || l.pais || '';
            const visivel = el('input', { type: 'checkbox', checked: !cfg.locais.ocultos.includes(l.nome) });
            visivel.addEventListener('change', () => {
                cfg.locais.ocultos = cfg.locais.ocultos.filter(n => n !== l.nome);
                if (!visivel.checked) cfg.locais.ocultos.push(l.nome);
                marcar('locais');
            });
            const detalhes = el('details', { className: 'pc-cidade' });
            const fotosCaixa = el('div', {}, el('p', { className: 'pc-dica', textContent: 'Carregando fotos…' }));
            detalhes.addEventListener('toggle', async () => {
                if (!detalhes.open || detalhes.dataset.carregado) return;
                detalhes.dataset.carregado = '1';
                let lista = cfg.locais.fotos[l.nome];
                if (!Array.isArray(lista)) lista = Array.isArray(l.fotos) && l.fotos.length ? copia(l.fotos) : await fotosDaPasta(l.nome);
                const usar = () => { cfg.locais.fotos[l.nome] = lista; marcar('locais'); };
                fotosCaixa.replaceChildren(editorFotos(lista, { legendas: true, aoMudar: usar }));
            });
            detalhes.append(
                el('summary', {}, el('strong', { textContent: l.nome }), el('span', { textContent: ` · ${onde}${l.nova ? ' · nova' : ''}` })),
                fotosCaixa,
                l.nova ? el('button', { type: 'button', className: 'pc-perigo', textContent: 'Tirar esta cidade', onclick: () => {
                    if (!confirm(`Tirar ${l.nome} do mapa?`)) return;
                    cfg.locais.novos = cfg.locais.novos.filter(n => n.nome !== l.nome);
                    delete cfg.locais.fotos[l.nome];
                    marcar('locais'); montarCidades();
                } }) : null);
            return el('div', { className: 'pc-cidade-linha' }, detalhes,
                el('label', { className: 'pc-mostrar' }, visivel, el('span', { textContent: 'Mostrar no mapa' })));
        });
        // Cidade nova
        const nome = el('input', { type: 'text', placeholder: 'Ex.: Xanxerê', maxLength: 60 });
        const onde = el('input', { type: 'text', placeholder: 'SC, ou o país (Argentina…)', maxLength: 40 });
        const territorio = el('select', {}, ...(typeof TERRITORIOS !== 'undefined' ? TERRITORIOS : []).map(t => el('option', { value: t.id, textContent: t.nome })));
        const coords = el('input', { type: 'text', placeholder: '-26.8766, -52.4036' });
        // Sigla do estado ou nome do pais ja escolhe o territorio
        onde.addEventListener('input', () => {
            const v = onde.value.trim().toLowerCase();
            const t = (typeof TERRITORIOS !== 'undefined' ? TERRITORIOS : []).find(x => x.id.toLowerCase() === v || x.nome.toLowerCase() === v);
            if (t) territorio.value = t.id;
        });
        const novaCidade = el('form', { className: 'pc-nova-cidade' },
            el('h4', { textContent: 'Adicionar cidade' }),
            el('div', { className: 'pc-grade' },
                campo('Nome', nome), campo('Estado (sigla) ou país', onde), campo('Território', territorio),
                campo('Coordenadas', coords, 'No Google Maps: botão direito sobre a cidade e clique nos números que aparecem (copia). Cole aqui.')),
            el('button', { type: 'submit', className: 'btn btn-secondary', textContent: 'Adicionar ao mapa' }));
        novaCidade.addEventListener('submit', (e) => {
            e.preventDefault();
            const [lat, lng] = coords.value.split(',').map(v => Number(v.trim()));
            const n = nome.value.trim();
            if (!n) { alert('Informe o nome da cidade.'); return; }
            if (todas.some(l => l.nome.toLowerCase() === n.toLowerCase())) { alert('Essa cidade já está no mapa.'); return; }
            if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { alert('Coordenadas inválidas. Cole no formato "-26.8766, -52.4036".'); return; }
            const o = onde.value.trim();
            cfg.locais.novos.push({ nome: n, ...(o.length === 2 ? { uf: o.toUpperCase() } : { pais: o }), territorio: territorio.value, lat, lng });
            marcar('locais'); montarCidades();
        });
        corpo.replaceChildren(
            el('p', { className: 'pc-dica', textContent: 'Abra uma cidade para ver, ordenar, legendar, tirar ou adicionar fotos. Desmarque "Mostrar no mapa" para esconder a cidade.' }),
            ...linhas, novaCidade);
    }

    // ---------- 4. Noticias (contas ligadas) ----------
    const CATEGORIAS = { diario: 'Diário de Campo', noticias: 'Notícias da Missão', historias: 'Histórias e Testemunhos', projetos: 'Projetos e Expansão', contas: 'Prestação de Contas' };
    async function montarNoticias() {
        const corpo = $('#pc-noticias');
        if (PORTAL.MODO_DEMO) {
            corpo.replaceChildren(el('p', { className: 'pc-dica', textContent: 'As notícias ficam no banco de dados: este formulário funciona quando as contas estiverem ligadas. Aí dá para publicar, esconder e apagar notícias por aqui.' }));
            return;
        }
        const sb = await PORTAL.cliente();
        const lista = el('div', { className: 'pc-noticias-lista' }, el('p', { className: 'pc-dica', textContent: 'Carregando…' }));
        const carregar = async () => {
            const { data, error } = await sb.from('noticias').select('id, categoria, titulo, resumo, imagem, link, publicada, publicado_em').order('publicado_em', { ascending: false }).limit(100);
            if (error) { lista.replaceChildren(el('p', { className: 'pc-dica', textContent: 'Não foi possível carregar as notícias.' })); return; }
            const noticias = data || [];
            lista.replaceChildren(...(noticias.length ? noticias.map(n => el('div', { className: 'pc-noticia' + (n.publicada ? '' : ' pc-escondida') },
                el('div', {}, el('strong', { textContent: n.titulo }), el('small', { textContent: `${CATEGORIAS[n.categoria] || n.categoria} · ${new Date(n.publicado_em).toLocaleDateString('pt-BR')}${n.publicada ? '' : ' · escondida'}` })),
                el('div', { className: 'pc-noticia-acoes' },
                    el('button', { type: 'button', textContent: n.publicada ? 'Esconder' : 'Mostrar', onclick: async () => {
                        const { error: e } = await sb.from('noticias').update({ publicada: !n.publicada }).eq('id', n.id);
                        if (e) alert('Não foi possível alterar.'); carregar();
                    } }),
                    el('button', { type: 'button', className: 'pc-perigo', textContent: 'Apagar', onclick: async () => {
                        if (!confirm(`Apagar a notícia "${n.titulo}"?`)) return;
                        const { error: e } = await sb.from('noticias').delete().eq('id', n.id);
                        if (e) alert('Não foi possível apagar.'); carregar();
                    } })))) : [el('p', { className: 'pc-dica', textContent: 'Nenhuma notícia ainda.' })]));
        };
        let imagem = '';
        const categoria = el('select', {}, ...Object.entries(CATEGORIAS).map(([v, t]) => el('option', { value: v, textContent: t })));
        const titulo = el('input', { type: 'text', required: true, maxLength: 140 });
        const resumo = el('textarea', { rows: 3, required: true, maxLength: 600 });
        const link = el('input', { type: 'url', placeholder: 'https://… (opcional: texto completo, documento, vídeo)' });
        const previa = el('div', { className: 'pc-noticia-foto' }, el('span', { textContent: 'Sem foto' }));
        const btnFoto = el('button', { type: 'button', className: 'btn btn-secondary', textContent: 'Escolher foto', onclick: () => escolherFotos(false, (src) => {
            imagem = src; previa.replaceChildren(el('img', { src, alt: '' }));
        }) });
        const retorno = el('p', { className: 'pc-dica', role: 'status' });
        const form = el('form', { className: 'pc-noticia-form' },
            el('h4', { textContent: 'Nova notícia' }),
            el('div', { className: 'pc-grade' }, campo('Categoria', categoria), campo('Título', titulo), campo('Resumo', resumo), campo('Link', link)),
            el('div', { className: 'pc-noticia-foto-linha' }, previa, btnFoto),
            el('button', { type: 'submit', className: 'btn btn-primary', textContent: 'Publicar notícia' }), retorno);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!titulo.value.trim() || !resumo.value.trim()) { retorno.textContent = 'Preencha título e resumo.'; return; }
            const href = link.value.trim() ? httpSeguro(link.value) : null;
            if (link.value.trim() && !href) { retorno.textContent = 'O link precisa começar com https://'; return; }
            const { data: { session } } = await sb.auth.getSession();
            const { error } = await sb.from('noticias').insert({
                categoria: categoria.value, titulo: titulo.value.trim(), resumo: resumo.value.trim(),
                imagem: imagem || null, link: href, autor: session?.user.id
            });
            if (error) { retorno.textContent = 'Não foi possível publicar: ' + error.message; return; }
            form.reset(); imagem = ''; previa.replaceChildren(el('span', { textContent: 'Sem foto' }));
            retorno.textContent = 'Notícia publicada.';
            carregar();
        });
        corpo.replaceChildren(form, el('h4', { textContent: 'Publicadas' }), lista);
        carregar();
    }

    // ---------- Salvar e historico da configuracao ----------
    function configParaSalvar() {
        const c = { versao: 1, contato: { ...cfg.contato }, pagamentos: { ...cfg.pagamentos } };
        if (mexeu.produtos) c.produtos = copia(cfg.produtos);
        if (mexeu.locais) c.locais = copia(cfg.locais);
        return c;
    }
    function conferir(c) {
        const ruins = [];
        if (c.contato.email && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(c.contato.email)) ruins.push('e-mail');
        ['instagram', 'whatsapp', 'igreja'].forEach(k => { if (c.contato[k] && !httpSeguro(c.contato[k])) ruins.push(k); });
        Object.entries(c.pagamentos).forEach(([k, v]) => { if (v && !httpSeguro(v)) ruins.push('pagamento ' + k); });
        (c.produtos || []).forEach(p => { if (p.link && !httpSeguro(p.link)) ruins.push('link da ' + (p.nome || 'camiseta')); });
        return ruins;
    }
    $('#pc-salvar').addEventListener('click', async () => {
        const c = configParaSalvar();
        const ruins = conferir(c);
        if (ruins.length) { alert('Confira estes campos (endereço precisa começar com https://): ' + ruins.join(', ')); return; }
        const botao = $('#pc-salvar');
        botao.disabled = true;
        try {
            if (PORTAL.MODO_DEMO) {
                localStorage.setItem(CHAVE_CONFIG, JSON.stringify({ ...c, quando: new Date().toISOString() }));
                statusSalvar.textContent = 'Salvo neste navegador. Para publicar, use “Baixar edições” numa página e envie o arquivo.';
            } else {
                if (!confirm('Publicar estas configurações para todos os visitantes?')) { botao.disabled = false; return; }
                const sb = await PORTAL.cliente();
                const { data: { session } } = await sb.auth.getSession();
                if (!session) throw new Error('Sua sessão expirou. Entre de novo.');
                const { error } = await sb.from('site_edicoes').insert({ pagina: '_config', conteudo: c, autor: session.user.id, autor_email: session.user.email });
                if (error) throw new Error('Não foi possível publicar: ' + error.message);
                try { localStorage.setItem(CHAVE_CONFIG_CACHE, JSON.stringify(c)); } catch { /* sem storage */ }
                statusSalvar.textContent = 'Publicado ✓ Já vale para todos.';
            }
            aplicarConfig(c);
            alterado = false;
        } catch (erro) {
            alert(/quota/i.test(erro?.name + erro?.message) ? 'O navegador ficou sem espaço (fotos demais). Baixe as edições e envie antes de continuar.' : erro.message);
            botao.disabled = false;
        }
    });
    const btnHistorico = $('#pc-historico');
    // Demonstracao: o arquivo com tudo (paginas e Painel) para enviar
    if (PORTAL.MODO_DEMO) {
        const baixar = $('#pc-baixar');
        baixar.hidden = false;
        baixar.addEventListener('click', () => {
            if (alterado && !confirm('Há alterações no Painel que ainda não foram salvas e não vão no arquivo. Baixar mesmo assim?')) return;
            baixarEdicoes();
        });
    }
    if (PORTAL.MODO_DEMO) btnHistorico.hidden = true;
    else btnHistorico.addEventListener('click', async () => {
        const caixa = $('#pc-versoes');
        if (!caixa.hidden) { caixa.hidden = true; return; }
        caixa.hidden = false;
        caixa.replaceChildren(el('p', { textContent: 'Carregando…' }));
        const sb = await PORTAL.cliente();
        const { data, error } = await sb.from('site_edicoes').select('id, criado_em, autor_email, conteudo').eq('pagina', '_config').order('id', { ascending: false }).limit(15);
        if (error) { caixa.replaceChildren(el('p', { textContent: 'Não foi possível carregar o histórico.' })); return; }
        const quando = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        const versoes = data || [];
        caixa.replaceChildren(versoes.length ? el('ol', {}, ...versoes.map((v, i) => el('li', {},
            el('span', { textContent: `${quando(v.criado_em)}${v.autor_email ? ' · ' + v.autor_email : ''}${i === 0 ? ' · no ar' : ''}` }),
            i === 0 ? null : el('button', { type: 'button', textContent: 'Voltar a esta', onclick: async () => {
                if (!confirm(`Voltar as configurações para a versão de ${quando(v.criado_em)}? Ela será publicada para todos.`)) return;
                const { data: { session } } = await sb.auth.getSession();
                const { error: e } = await sb.from('site_edicoes').insert({ pagina: '_config', conteudo: v.conteudo, autor: session?.user.id, autor_email: session?.user.email });
                if (e) { alert('Não foi possível publicar.'); return; }
                try { localStorage.setItem(CHAVE_CONFIG_CACHE, JSON.stringify(v.conteudo)); } catch { /* sem storage */ }
                alterado = false;
                location.reload();
            } })))) : el('p', { textContent: 'Nenhuma versão publicada ainda.' }));
    });

    // Links do painel que abrem um bloco (ex.: "Importar relatório"), e o
    // endereco antigo importar.html, que chega como editar.html#importar
    const abrirBloco = (id) => {
        const bloco = document.getElementById(id);
        if (!bloco || bloco.tagName !== 'DETAILS') return;
        bloco.open = true;
        bloco.scrollIntoView({ behavior: MOVIMENTO_REDUZIDO ? 'auto' : 'smooth', block: 'start' });
    };
    document.querySelectorAll('[data-abrir]').forEach(a => a.addEventListener('click', (e) => {
        e.preventDefault();
        abrirBloco(a.dataset.abrir);
    }));
    if (location.hash === '#importar') setTimeout(() => abrirBloco('importar'), 300);

    montarContatos();
    montarProdutos();
    montarCidades();
    // Noticias so depois de entrar (precisam da sessao)
    let noticiasProntas = false;
    const abrirNoticias = () => { if (!noticiasProntas && !raiz.hidden) { noticiasProntas = true; montarNoticias(); } };
    new MutationObserver(abrirNoticias).observe(raiz, { attributes: true, attributeFilter: ['hidden'] });
    abrirNoticias();
})();
