/* =========================================================
   IMPORTAR RELATORIO (importar.html) — bastidor da equipe
   Le o Excel do Eklesia no proprio navegador (SheetJS), deixa escolher
   as colunas, agrupa por e-mail, mostra o nivel de cada um e envia ao
   servidor (funcao importar-planilha). Em modo demonstracao so mostra
   a previa: nada e gravado.
   ========================================================= */
(function () {
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    // Dados que o cadastro aceita; "padrao" adivinha a coluna pelo titulo
    const CAMPOS = [
        { id: 'email', rotulo: 'E-mail', obrigatorio: true, padrao: /e-?mail/i },
        { id: 'valor', rotulo: 'Valor da contribuição', obrigatorio: true, padrao: /valor|contribui|d[ií]zimo|oferta|mensal|total/i },
        { id: 'igreja', rotulo: 'Igreja', padrao: /igreja|congrega/i },
        { id: 'nome', rotulo: 'Nome', padrao: /nome|membro/i },
        { id: 'cpf', rotulo: 'CPF', padrao: /cpf/i },
        { id: 'telefone', rotulo: 'Telefone', padrao: /telefone|celular|whats|fone/i },
        { id: 'nascimento', rotulo: 'Nascimento', padrao: /nasc/i },
        { id: 'moradia', rotulo: 'Cidade', padrao: /cidade|munic[ií]pio|endere/i }
    ];

    let colunas = [];   // titulos do relatorio
    let linhas = [];    // linhas de dados (arrays)
    let registros = []; // resultado agrupado por e-mail

    if (typeof XLSX === 'undefined') {
        aviso('Não foi possível carregar o leitor de Excel (sem conexão?). Recarregue a página.');
        return;
    }
    if (PORTAL.MODO_DEMO) {
        aviso('Modo demonstração: dá para conferir a prévia, mas nada é gravado até as contas serem ligadas (servidor/LEIA-ME.md).');
    } else {
        PORTAL.iniciar().then(u => { if (!u) aviso('Entre com a conta da equipe na <a href="portal.html">Área do Mantenedor</a> antes de importar.', true); });
    }

    function aviso(html, bloquear) {
        const el = $('importar-aviso');
        el.innerHTML = html;
        el.hidden = false;
        if (bloquear) $('btn-importar').disabled = true;
    }

    // ---------- 1. Ler o arquivo ----------
    $('arquivo').addEventListener('change', async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;
        $('arquivo-nome').textContent = arquivo.name;
        $('importar-retorno').textContent = '';
        try {
            const livro = XLSX.read(await arquivo.arrayBuffer(), { cellDates: true });
            const folha = livro.Sheets[livro.SheetNames[0]];
            const tudo = XLSX.utils.sheet_to_json(folha, { header: 1, raw: true, defval: '' });
            // Titulo = primeira linha com pelo menos dois textos (relatorios
            // costumam ter um cabecalho com o nome da igreja antes)
            const iTitulo = tudo.findIndex(l => l.filter(c => typeof c === 'string' && c.trim()).length >= 2);
            if (iTitulo < 0) throw new Error('sem titulos');
            colunas = tudo[iTitulo].map((c, i) => String(c).trim() || `Coluna ${i + 1}`);
            linhas = tudo.slice(iTitulo + 1).filter(l => l.some(c => String(c).trim()));
            montarMapeamento();
            atualizar();
        } catch {
            $('passo-colunas').hidden = $('passo-previa').hidden = true;
            $('arquivo-nome').textContent = 'Não consegui ler este arquivo. Confira se é o Excel exportado do Eklesia.';
        }
    });

    // ---------- 2. Colunas ----------
    function montarMapeamento() {
        const usadas = new Set();
        $('mapeamento').innerHTML = CAMPOS.map(c => {
            let palpite = colunas.findIndex((t, i) => !usadas.has(i) && c.padrao.test(t));
            if (palpite >= 0) usadas.add(palpite);
            return `<label class="importar-campo">
                <span>${c.rotulo}${c.obrigatorio ? ' *' : ''}</span>
                <select data-campo="${c.id}">
                    <option value="-1">${c.obrigatorio ? 'Escolha a coluna' : '(não usar)'}</option>
                    ${colunas.map((t, i) => `<option value="${i}"${i === palpite ? ' selected' : ''}>${esc(t)}</option>`).join('')}
                </select>
            </label>`;
        }).join('');
        $('passo-colunas').hidden = false;
    }
    document.addEventListener('change', (e) => {
        if (e.target.matches('#mapeamento select, #repetidos')) atualizar();
    });

    // ---------- Conversoes ----------
    function paraValor(v) {
        if (typeof v === 'number') return v;
        let t = String(v).replace(/[^\d.,-]/g, '');
        if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
        const n = parseFloat(t);
        return Number.isFinite(n) ? n : NaN;
    }
    function paraData(v) {
        if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
        const m = String(v).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : '';
    }

    // ---------- 3. Previa ----------
    function atualizar() {
        const mapa = {};
        document.querySelectorAll('#mapeamento select').forEach(s => { mapa[s.dataset.campo] = +s.value; });
        const faltando = CAMPOS.filter(c => c.obrigatorio && mapa[c.id] < 0).map(c => c.rotulo);
        $('passo-previa').hidden = false;
        if (faltando.length) {
            $('resumo').textContent = `Escolha a coluna de: ${faltando.join(' e ')}.`;
            $('previa').innerHTML = '';
            $('btn-importar').disabled = true;
            registros = [];
            return;
        }

        const modo = $('repetidos').value;
        const porEmail = new Map();
        let semEmail = 0, semValor = 0;
        linhas.forEach(l => {
            const pega = (campo) => mapa[campo] >= 0 ? l[mapa[campo]] : '';
            const email = String(pega('email')).trim().toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { semEmail++; return; }
            const valor = paraValor(pega('valor'));
            if (Number.isNaN(valor)) { semValor++; return; }
            const novo = {
                email, valor,
                nome: String(pega('nome')).trim(),
                cpf: String(pega('cpf')).replace(/\D/g, ''),
                telefone: String(pega('telefone')).trim(),
                nascimento: paraData(pega('nascimento')),
                moradia: String(pega('moradia')).trim(),
                igreja: String(pega('igreja')).trim()
            };
            const atual = porEmail.get(email);
            if (!atual) { porEmail.set(email, novo); return; }
            // Mesma pessoa de novo: completa os dados e combina o valor
            for (const k of Object.keys(novo)) if (!atual[k] && novo[k]) atual[k] = novo[k];
            atual.valor = modo === 'somar' ? atual.valor + valor : modo === 'maior' ? Math.max(atual.valor, valor) : valor;
        });
        registros = [...porEmail.values()];

        const conta = { expansor: 0, construtor: 0, semeador: 0, nenhum: 0 };
        registros.forEach(r => { conta[(nivelPorValor(r.valor) || { id: 'nenhum' }).id]++; });
        const ignoradas = semEmail + semValor;
        $('resumo').innerHTML = `<strong>${registros.length}</strong> pessoas: ${conta.expansor} Expansores, ${conta.construtor} Construtores, ${conta.semeador} Semeadores${conta.nenhum ? `, ${conta.nenhum} sem contribuição` : ''}.`
            + (ignoradas ? ` <span class="importar-ignoradas">${ignoradas} linha(s) ignorada(s): ${semEmail ? `${semEmail} sem e-mail válido` : ''}${semEmail && semValor ? ', ' : ''}${semValor ? `${semValor} sem valor` : ''}.</span>` : '');

        $('previa').innerHTML = `<thead><tr><th>Nome</th><th>E-mail</th><th>Valor mensal</th><th>Nível</th></tr></thead><tbody>`
            + registros.map(r => {
                const n = nivelPorValor(r.valor);
                return `<tr><td>${esc(r.nome) || '—'}</td><td>${esc(r.email)}</td><td>${reais(r.valor)}</td><td><span class="nivel-tag ${n ? n.id : ''}">${n ? n.nome : 'Sem nível'}</span></td></tr>`;
            }).join('') + '</tbody>';
        $('btn-importar').disabled = !registros.length || (!PORTAL.MODO_DEMO && !PORTAL.sessao());
    }

    // ---------- 4. Importar ----------
    $('btn-importar').addEventListener('click', async () => {
        const retorno = $('importar-retorno');
        if (!registros.length) return;
        if (PORTAL.MODO_DEMO) {
            retorno.textContent = `Modo demonstração: nada foi gravado. Com as contas ligadas, ${registros.length} cadastro(s) seriam criados ou atualizados.`;
            return;
        }
        $('btn-importar').disabled = true;
        retorno.textContent = 'Importando…';
        try {
            const sb = await PORTAL.cliente();
            const { data, error } = await sb.functions.invoke('importar-planilha', {
                body: { registros, desativarAusentes: $('desativar-ausentes').checked }
            });
            if (error) throw error;
            retorno.textContent = `Pronto: ${data.criados} cadastro(s) criado(s) com convite por e-mail, ${data.atualizados} atualizado(s)`
                + (data.desativados ? `, ${data.desativados} sem contribuição neste relatório` : '')
                + (data.erros?.length ? `. ${data.erros.length} com erro: ${data.erros.slice(0, 3).join('; ')}` : '.');
        } catch (erro) {
            retorno.textContent = 'Não foi possível importar. Confira se você entrou com a conta da equipe. (' + (erro.message || erro) + ')';
        } finally {
            $('btn-importar').disabled = false;
        }
    });
})();
