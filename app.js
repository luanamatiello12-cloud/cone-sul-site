/* =========================================================
   CONE SUL — script compartilhado por todas as paginas.
   Cabecalho, rodape e bandeiras sao montados aqui para que
   o menu seja editado em um lugar so.
   ========================================================= */

// ---------- Contato (trocar quando houver dados reais) ----------
const CONTATO = {
    email: 'contato@exemplo.com.br',
    instagram: '#',
    whatsapp: '#',
    igreja: '#'
};

// ---------- Contas de mantenedor (Supabase) ----------
// Vazio = modo demonstracao (qualquer e-mail entra, nada e guardado).
// Para ligar as contas reais, siga servidor/LEIA-ME.md e cole aqui a URL
// do projeto e a chave publica ("anon"). A chave publica pode ficar no
// site: o que protege os dados sao as regras do banco (schema.sql).
const CONTAS = {
    url: '',
    chavePublica: ''
};

// ---------- Links de pagamento da campanha (seja-mantenedor.html) ----------
// Cole aqui o link do portal de pagamento de cada faixa. Enquanto estiver
// vazio, o botao aparece mas nao leva a lugar nenhum. Com as contas ligadas
// (servidor/LEIA-ME.md), o pagamento aprovado cria o cadastro e define o
// nivel pelo valor pago.
const LINKS_PAGAMENTO = {
    semeadores: '',
    construtores: '',
    expansores: ''
};

// ---------- Menu principal (ordem da copy oficial) ----------
const MENU = [
    { id: 'inicio',      rotulo: 'Início',                    href: 'index.html' },
    { id: 'missao',      rotulo: 'Nossa Missão',              href: 'nossa-missao.html' },
    { id: 'onde',        rotulo: 'Onde Estamos',              href: 'onde-atuamos.html' },
    { id: 'como',        rotulo: 'Como Funciona',             href: 'como-funciona.html' },
    { id: 'mantenedor',  rotulo: 'Seja Mantenedor',           href: 'seja-mantenedor.html' },
    { id: 'empresarios', rotulo: 'Expansores com Propósito', href: 'empresarios.html' },
    { id: 'camisetas',   rotulo: 'Camisetas',                 href: 'camisetas.html' },
    { id: 'noticias',    rotulo: 'Notícias',                  href: 'noticias.html', soLogado: true }
];

const PAGINA = document.body.dataset.pagina || '';

// Ha sessao de mantenedor aberta? (mesma chave usada por PORTAL, definida adiante)
function sessaoAtiva() {
    try { return !!sessionStorage.getItem('conesul-sessao'); } catch { return false; }
}

// Noticias sao exclusivas dos mantenedores: sem login, a pagina redireciona
// para o acesso e o item nem aparece no menu.
if (PAGINA === 'noticias' && !sessaoAtiva()) location.replace('portal.html');

// ---------- Bandeiras em SVG ----------
// Emoji de bandeira nao renderiza no Windows (vira "BR", "AR"...).
const SPRITE_BANDEIRAS = `
<svg class="bandeira-sprite" xmlns="http://www.w3.org/2000/svg">
    <symbol id="flag-br" viewBox="0 0 30 21">
        <rect width="30" height="21" fill="#009b3a"/>
        <path d="M15 2.2 27.2 10.5 15 18.8 2.8 10.5Z" fill="#fedf00"/>
        <circle cx="15" cy="10.5" r="4.6" fill="#002776"/>
    </symbol>
    <symbol id="flag-ar" viewBox="0 0 30 20">
        <rect width="30" height="20" fill="#74acdf"/>
        <rect y="6.67" width="30" height="6.66" fill="#fff"/>
        <circle cx="15" cy="10" r="2.1" fill="#f6b40e"/>
    </symbol>
    <symbol id="flag-py" viewBox="0 0 30 20">
        <rect width="30" height="6.67" fill="#d52b1e"/>
        <rect y="6.67" width="30" height="6.66" fill="#fff"/>
        <rect y="13.33" width="30" height="6.67" fill="#0038a8"/>
        <circle cx="15" cy="10" r="2.2" fill="#fff" stroke="#0038a8" stroke-width="0.35"/>
        <circle cx="15" cy="10" r="1.1" fill="#009b3a"/>
    </symbol>
    <symbol id="flag-cl" viewBox="0 0 30 20">
        <rect width="30" height="10" fill="#fff"/>
        <rect y="10" width="30" height="10" fill="#d52b1e"/>
        <rect width="10" height="10" fill="#0039a6"/>
        <polygon fill="#fff" points="5,2 5.71,4.03 7.85,4.07 6.14,5.37 6.76,7.43 5,6.2 3.24,7.43 3.86,5.37 2.15,4.07 4.29,4.03"/>
    </symbol>
</svg>`;

function montarCabecalho() {
    const itens = MENU.filter(m => !m.soLogado || sessaoAtiva()).map(m =>
        `<li><a href="${m.href}"${m.id === PAGINA ? ' class="ativo" aria-current="page"' : ''}>${m.rotulo}</a></li>`
    ).join('');

    return `
<header>
    <nav>
        <a href="index.html" class="logo">Cone Sul</a>
        <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false">Menu</button>
        <ul class="menu">
            ${itens}
            <li><a href="portal.html" class="nav-acesso${PAGINA === 'portal' ? ' ativo' : ''}">Área do Mantenedor</a></li>
            <li><a href="fazer-parte.html" class="nav-cta${PAGINA === 'fazer-parte' ? ' ativo' : ''}">Eu quero fazer parte</a></li>
        </ul>
    </nav>
</header>`;
}

function montarRodape() {
    return `
<footer>
    <div class="wrap">
        <div class="footer-marca">
            <strong>CONE SUL</strong>
            <span class="footer-assinatura">Fronteiras que conectam a Cristo.</span>
            <p>Uma iniciativa missionária da Igreja Renovar em Cristo, dedicada ao anúncio do Evangelho, à formação de discípulos e ao desenvolvimento de comunidades de fé.</p>
        </div>
        <div class="footer-col">
            <h5>Navegação</h5>
            <ul>
                ${MENU.filter(m => !m.soLogado || sessaoAtiva()).map(m => `<li><a href="${m.href}">${m.rotulo}</a></li>`).join('')}
                <li><a href="contato.html">Contato</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h5>Conecte-se</h5>
            <ul>
                <li><a href="${CONTATO.instagram}">Instagram</a></li>
                <li><a href="${CONTATO.whatsapp}">WhatsApp</a></li>
                <li><a href="mailto:${CONTATO.email}">E-mail</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h5>Institucional</h5>
            <ul>
                <li><a href="portal.html">Área do Mantenedor</a></li>
                <li><a href="${CONTATO.igreja}">Igreja Renovar em Cristo</a></li>
                <li><a href="politica-de-privacidade.html">Política de Privacidade</a></li>
                <li><a href="termos-de-uso.html">Termos de Uso</a></li>
            </ul>
        </div>
    </div>
    <div class="wrap">
        <div class="footer-base">
            <span>“...e até aos confins da terra.” — Atos 1:8</span>
            <span>© CONE SUL — Todos os direitos reservados.</span>
        </div>
    </div>
</footer>`;
}

document.body.insertAdjacentHTML('afterbegin', SPRITE_BANDEIRAS + montarCabecalho());
document.body.insertAdjacentHTML('beforeend', montarRodape());

// Menu recolhido no celular
const nav = document.querySelector('nav');
const toggle = document.querySelector('.menu-toggle');

function fecharMenu() {
    nav.classList.remove('aberto');
    toggle.setAttribute('aria-expanded', 'false');
}

toggle?.addEventListener('click', () => {
    const aberto = nav.classList.toggle('aberto');
    toggle.setAttribute('aria-expanded', aberto);
});

// Fecha com Esc e ao tocar fora do cabecalho
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('aberto')) {
        fecharMenu();
        toggle.focus();
    }
});
document.addEventListener('click', (e) => {
    if (nav.classList.contains('aberto') && !e.target.closest('header')) fecharMenu();
});

// Cabecalho ganha sombra quando a pagina sai do topo
const header = document.querySelector('header');
const marcarRolagem = () => header.classList.toggle('rolou', window.scrollY > 8);
marcarRolagem();
window.addEventListener('scroll', marcarRolagem, { passive: true });

// Pre-carrega a pagina interna quando o mouse passa ou o dedo toca no link,
// para a troca de pagina ser quase instantanea.
const preCarregadas = new Set([location.pathname]);
function preCarregar(e) {
    const link = e.target.closest?.('a[href]');
    if (!link || link.origin !== location.origin || preCarregadas.has(link.pathname)) return;
    preCarregadas.add(link.pathname);
    const pre = document.createElement('link');
    pre.rel = 'prefetch';
    pre.href = link.pathname;
    document.head.appendChild(pre);
}
document.addEventListener('pointerover', preCarregar, { passive: true });
document.addEventListener('touchstart', preCarregar, { passive: true });

const MOVIMENTO_REDUZIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Scroll reveal ----------
// Os elementos so ficam escondidos depois que o JS roda: sem JS, tudo aparece.
// Quem entra junto na tela aparece em cascata. Ao terminar, as classes saem
// para nao atrapalhar o hover proprio de cada card.
const REVELAVEIS = [
    '.sec-kicker', 'section h2', '.sec-intro', '.texto-bloco', '.destaque', '.sub-titulo', '.sub-intro',
    '.lista-destaques', '.valor-destaque', '.etapa', '.categorias',
    '.barreira', '.numero-item', '.card-acao', '.campanha-card', '.pilar', '.campanha-assinatura', '.mvp-item', '.territorio', '.beneficio', '.noticia-card',
    '.formulario', '.contato-buttons', '.acoes-secao'
].join(', ');

function terminarRevelacao(el) {
    el.classList.remove('revelar', 'visivel');
    el.style.removeProperty('--atraso');
}

const observer = new IntersectionObserver((entries) => {
    entries.filter(e => e.isIntersecting).forEach((entry, i) => {
        const el = entry.target;
        el.style.setProperty('--atraso', `${Math.min(i * 0.08, 0.4)}s`);
        el.classList.add('visivel');
        el.addEventListener('transitionend', () => terminarRevelacao(el), { once: true });
        setTimeout(() => terminarRevelacao(el), 1500); // garantia se o transitionend nao vier
        observer.unobserve(el);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

if (!MOVIMENTO_REDUZIDO) {
    const alvos = [...document.querySelectorAll(REVELAVEIS)]
        .filter(el => !el.closest('.hero'))
        .filter((el, _, todos) => !todos.some(outro => outro !== el && outro.contains(el)));
    alvos.forEach(el => {
        el.classList.add('revelar');
        observer.observe(el);
    });
}

/* =========================================================
   MAPA — fica em mapa/mapa.js (dados em mapa/territorios.js)
   ========================================================= */

/* =========================================================
   FORMULARIOS (contato e atualizacoes)
   Nao ha servidor: o envio abre o programa de e-mail com os
   dados preenchidos. Quando houver backend, trocar por fetch/POST.
   ========================================================= */
document.querySelectorAll('form[data-assunto]').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const retorno = form.querySelector('.form-retorno');
        form.classList.add('validar');

        if (!form.checkValidity()) {
            retorno.textContent = 'Preencha os campos obrigatórios e marque a autorização.';
            form.querySelector(':invalid')?.focus();
            return;
        }

        const linhas = [...form.querySelectorAll('[name]')]
            .filter(c => c.type !== 'checkbox')
            .map(c => `${c.dataset.rotulo || c.name}: ${c.value.trim() || '-'}`);

        window.location.href = 'mailto:' + CONTATO.email
            + '?subject=' + encodeURIComponent(form.dataset.assunto)
            + '&body=' + encodeURIComponent(linhas.join('\n'));

        retorno.textContent = 'Abrimos seu programa de e-mail com a mensagem pronta. Confira e envie para concluir.';
    });
});

// Links como contato.html?interesse=mantenedor ja chegam com o interesse escolhido.
const interesseUrl = new URLSearchParams(location.search).get('interesse');
if (interesseUrl) {
    const opcao = document.querySelector(`#f-interesse option[data-chave="${interesseUrl}"]`);
    if (opcao) opcao.selected = true;
}

// "Compartilhar a missao": usa o compartilhamento nativo do celular;
// no computador, copia o link.
document.getElementById('btn-compartilhar')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const dados = {
        title: 'CONE SUL | Fronteiras que conectam a Cristo',
        text: 'Conheça o CONE SUL, uma missão que leva o Evangelho além das fronteiras.',
        url: location.href.split('#')[0]
    };
    try {
        if (navigator.share) {
            await navigator.share(dados);
        } else {
            await navigator.clipboard.writeText(dados.url);
            btn.textContent = 'Link copiado';
            setTimeout(() => { btn.textContent = 'Compartilhar a missão'; }, 2500);
        }
    } catch {
        // usuario cancelou o compartilhamento: nada a fazer
    }
});

// Botoes da campanha: so ganham destino quando o link de pagamento existir
// Escolher um plano leva primeiro ao cadastro (fazer-parte.html); depois
// de cadastrada, a pessoa segue para o link de pagamento do plano.
document.querySelectorAll('[data-pagamento]').forEach(botao => {
    botao.href = 'fazer-parte.html?plano=' + encodeURIComponent(botao.dataset.pagamento);
});
const PLANOS = { expansores: 'expansor', construtores: 'construtor', semeadores: 'semeador' };

// Filtro de categorias da pagina de noticias
document.querySelectorAll('.filtro-categorias button').forEach(botao => {
    botao.addEventListener('click', () => {
        document.querySelectorAll('.filtro-categorias button').forEach(b => b.classList.remove('ativo'));
        botao.classList.add('ativo');
        const cat = botao.dataset.cat;
        const grade = document.querySelector('.noticias-grid');
        const aplicar = () => document.querySelectorAll('.noticia-card').forEach(card => {
            card.style.display = (cat === 'todas' || card.dataset.cat === cat) ? '' : 'none';
        });

        if (MOVIMENTO_REDUZIDO || !grade) return aplicar();
        // Some, troca os cards e volta, em vez de pular de uma vez
        grade.classList.add('filtrando');
        setTimeout(() => {
            aplicar();
            grade.classList.remove('filtrando');
        }, 200);
    });
});

/* =========================================================
   AREA DO MANTENEDOR (portal.html)

   O site nao tem servidor nem banco de contas, entao a senha NAO e
   conferida: com MODO_DEMO ligado, qualquer e-mail e senha entram.
   Isso nao protege nada e serve so para mostrar o fluxo.

   Para contas reais, ligar um servico de login (Supabase, Firebase...)
   e trocar o corpo de PORTAL.entrar() pela chamada desse servico,
   depois desligar MODO_DEMO.
   ========================================================= */
/* NIVEIS DE MANTENEDOR — o nivel vem do valor mensal da contribuicao,
   informado pela plataforma de pagamento (nunca escolhido no site).
   Mesma regra do servidor (servidor/supabase/schema.sql): mudar nos dois.
   Abaixo de R$ 500 conta como Semeador. */
const NIVEIS = [
    {
        id: 'expansor', nome: 'Expansor', minimo: 1000, faixa: 'A partir de R$ 1.000 por mês',
        beneficios: ['Devocional on-line e devocional mensal', 'Links dos workshops on-line', 'Workshops presenciais', 'Acompanhamento pastoral', 'Divulgação da sua empresa']
    },
    {
        id: 'construtor', nome: 'Construtor', minimo: 500, faixa: 'De R$ 500 a R$ 1.000 por mês',
        beneficios: ['Devocional on-line e devocional mensal', 'Links dos workshops on-line (transmissão, sem participação presencial)']
    },
    {
        id: 'semeador', nome: 'Semeador', minimo: 0.01, faixa: 'De R$ 100 a R$ 500 por mês',
        beneficios: ['Devocional on-line e devocional mensal']
    }
];
// Sem contribuicao ativa (cadastro feito pelo "Faca parte", por exemplo): sem nivel
function nivelPorValor(valor) {
    return NIVEIS.find(n => Number(valor) >= n.minimo) || null;
}
const reais = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PORTAL = {
    MODO_DEMO: !(CONTAS.url && CONTAS.chavePublica),
    CHAVE: 'conesul-sessao',

    // ----- Contas reais (Supabase), carregado so quando configurado -----
    async cliente() {
        if (!this._cliente) {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
            this._cliente = createClient(CONTAS.url, CONTAS.chavePublica);
        }
        return this._cliente;
    },

    // Linha da tabela "mantenedores" -> objeto usado nas telas
    async perfil(sb, user) {
        const { data: m, error } = await sb.from('mantenedores').select('*').eq('id', user.id).maybeSingle();
        if (error) throw new Error('Não foi possível carregar seu cadastro. Tente de novo.');
        const r = m || {};
        return {
            id: user.id,
            email: r.email || user.email,
            nome: r.nome || '', cpf: r.cpf || '', telefone: r.telefone || '',
            nascimento: r.nascimento || '', naturalidade: r.naturalidade || '', moradia: r.moradia || '', igreja: r.igreja || '',
            ...(r.cristao === null || r.cristao === undefined ? {} : { cristao: r.cristao }),
            ...(r.congrega === null || r.congrega === undefined ? {} : { congrega: r.congrega }),
            valor: r.status_contribuicao === 'ativa' ? Number(r.valor_mensal) : 0,
            senhaProvisoria: !!r.senha_provisoria
        };
    },

    // Ao abrir o portal: confere se ha sessao (inclusive a que chega pelo
    // link do e-mail "seu cadastro esta pronto") e atualiza o cadastro
    async iniciar() {
        if (this.MODO_DEMO) return this.sessao();
        const sb = await this.cliente();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) { this.sair(); return null; }
        const usuario = await this.perfil(sb, session.user);
        this.salvar(usuario);
        return usuario;
    },

    // Com contas reais, o login devolve o cadastro guardado no servidor; o
    // nivel vem da contribuicao aprovada (ver servidor/LEIA-ME.md). Na demonstracao, entra sem contribuicao; para ver
    // um nivel, abrir portal.html?demo=<valor> (ex.: ?demo=1500 = Expansor).
    async entrar(email, senha, valorDemo) {
        if (this.MODO_DEMO) {
            const valor = Number(valorDemo) || 0;
            return { email, nome: '', valor };
        }
        const sb = await this.cliente();
        const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
        if (error) throw new Error('E-mail ou senha incorretos.');
        return this.perfil(sb, data.user);
    },

    // Cadastro pelo "Faca parte". Em demonstracao NAO e enviado a lugar
    // nenhum: so abre a sessao com nome e e-mail. Com contas reais, os dados
    // vao junto da conta e o banco cria a linha em "mantenedores" (gatilho
    // em schema.sql); o nivel so aparece quando a contribuicao for aprovada.
    async cadastrar(dados) {
        if (this.MODO_DEMO) return { nome: dados.nome, email: dados.email };
        const sb = await this.cliente();
        const { senha, ...perfil } = dados;
        const { data, error } = await sb.auth.signUp({
            email: dados.email, password: senha,
            options: { data: perfil, emailRedirectTo: new URL('portal.html', location.href).href }
        });
        if (error) throw new Error(error.message.includes('registered') ? 'Este e-mail já tem cadastro. Entre na Área do Mantenedor.' : 'Não foi possível concluir o cadastro.');
        if (!data.session) throw new Error('Quase lá: enviamos um e-mail para confirmar seu cadastro. Abra o link para entrar.');
        return this.perfil(sb, data.user);
    },

    // Troca de senha (opcional). Tira o aviso de senha provisoria.
    async trocarSenha(nova) {
        const atual = this.sessao() || {};
        if (!this.MODO_DEMO) {
            const sb = await this.cliente();
            const { error } = await sb.auth.updateUser({ password: nova });
            if (error) throw new Error(error.message.includes('different') ? 'A nova senha precisa ser diferente da atual.' : 'Não foi possível trocar a senha. Tente de novo.');
            await sb.from('mantenedores').update({ senha_provisoria: false }).eq('id', atual.id);
        }
        const novo = { ...atual, senhaProvisoria: false };
        this.salvar(novo);
        return novo;
    },

    // Esqueci minha senha: o Supabase manda o link; ao abrir, a pessoa cai
    // no portal ja logada, com o formulario de senha nova em destaque
    async esqueciSenha(email) {
        if (this.MODO_DEMO) throw new Error('Em demonstração não há e-mail de troca de senha. Com as contas ligadas, o link chega no e-mail informado.');
        const sb = await this.cliente();
        const destino = new URL('portal.html', location.href);
        destino.hash = 'nova-senha';
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: destino.href });
        if (error) throw new Error('Não foi possível enviar agora. Tente de novo em alguns minutos.');
    },

    sessao() {
        try { return JSON.parse(sessionStorage.getItem(this.CHAVE)); } catch { return null; }
    },

    salvar(usuario) {
        try { sessionStorage.setItem(this.CHAVE, JSON.stringify(usuario)); } catch { /* sem storage: sessao so dura a pagina */ }
    },

    sair() {
        try { sessionStorage.removeItem(this.CHAVE); } catch { /* nada a limpar */ }
        if (!this.MODO_DEMO && this._cliente) this._cliente.auth.signOut();
    }
};

// CPF: 11 digitos, nao todos iguais, e os dois digitos verificadores corretos
function cpfValido(cpf) {
    const d = cpf.replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const verificador = (n) => {
        let soma = 0;
        for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
        return (soma * 10) % 11 % 10;
    };
    return verificador(9) === Number(d[9]) && verificador(10) === Number(d[10]);
}

if (PAGINA === 'portal') {
    // Veio pelo link de "Esqueci minha senha"? (o Supabase poe type=recovery
    // no endereco; guardar antes de o cliente limpar o endereco)
    const veioTrocarSenha = /type=recovery|#nova-senha/.test(location.hash);
    // Endereco antigo do cadastro (portal.html#cadastro) leva a pagina nova
    const irParaCadastro = () => { if (location.hash === '#cadastro') location.replace('fazer-parte.html'); };
    irParaCadastro();
    window.addEventListener('hashchange', irParaCadastro);

    const telaLogin = document.getElementById('tela-login');
    const telasPortal = ['tela-portal-topo', 'tela-portal-nivel', 'tela-portal-expansores', 'tela-portal-summit', 'tela-portal-calendario', 'tela-portal', 'tela-portal-senha'].map(id => document.getElementById(id));
    // Telas que dependem do nivel: so aparecem para quem tem esse nivel
    const SO_NIVEL = { 'tela-portal-expansores': ['expansor'] };

    // Seu nivel, beneficios e resumo da contribuicao
    function mostrarNivel(usuario) {
        const nivel = nivelPorValor(usuario.valor);
        const selo = document.getElementById('usuario-nivel');
        selo.hidden = !nivel;
        if (nivel) selo.textContent = `Mantenedor ${nivel.nome}`;
        document.getElementById('nivel-titulo').textContent = nivel ? `Você é ${nivel.nome}.` : 'Escolha como contribuir.';
        document.getElementById('nivel-resumo').textContent = nivel
            ? `Sua contribuição de ${reais(usuario.valor)} por mês garante os benefícios abaixo. Se o valor mudar, seu nível acompanha.`
            : 'Seu cadastro está feito. Os benefícios chegam com a contribuição mensal: o nível depende do valor.';
        document.getElementById('nivel-beneficios').innerHTML = nivel
            ? nivel.beneficios.map(b => `<li>${b.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])}</li>`).join('')
            : '';
        document.getElementById('nivel-acoes').innerHTML = nivel && nivel.id === 'expansor'
            ? ''
            : `<a href="seja-mantenedor.html#campanha" class="btn btn-primary">${nivel ? 'Conhecer os outros níveis' : 'Ver os níveis de contribuição'}</a>`;
        document.getElementById('contribuicao-resumo').textContent = nivel
            ? `${reais(usuario.valor)} por mês · nível ${nivel.nome}.`
            : 'Nenhuma contribuição ativa ainda.';
        telasPortal.forEach(t => {
            const exige = SO_NIVEL[t.id];
            if (exige) t.hidden = !nivel || !exige.includes(nivel.id);
        });
    }

    // Poe ou tira "Noticias" do menu conforme o login, sem recarregar
    const atualizarMenu = (logado) => {
        const menuUl = document.querySelector('nav ul.menu');
        const existente = menuUl.querySelector('a[href="noticias.html"]');
        if (logado && !existente) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="noticias.html">Notícias</a>';
            menuUl.insertBefore(li, menuUl.querySelector('.nav-acesso').parentElement);
        }
        if (!logado && existente) existente.parentElement.remove();
        // mesmo ajuste no rodape
        const noRodape = document.querySelector('footer a[href="noticias.html"]');
        if (logado && !noRodape) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="noticias.html">Notícias</a>';
            document.querySelector('footer .footer-col ul').appendChild(li);
        }
        if (!logado && noRodape) noRodape.parentElement.remove();
    };

    const mostrar = (usuario, animar = false) => {
        atualizarMenu(!!usuario);
        telaLogin.hidden = !!usuario;
        telasPortal.forEach(t => { t.hidden = !usuario; });
        if (usuario) {
            document.getElementById('usuario-email').textContent = usuario.nome || usuario.email;
            mostrarNivel(usuario);
            document.getElementById('aviso-senha').hidden = !usuario.senhaProvisoria;
        }
        window.scrollTo(0, 0);

        // Troca de tela com fade, sem salto seco
        if (animar && !MOVIMENTO_REDUZIDO) {
            [telaLogin, ...telasPortal].filter(t => !t.hidden).forEach(t => {
                t.classList.remove('tela-entrando');
                void t.offsetWidth; // reinicia a animacao
                t.classList.add('tela-entrando');
            });
        }
    };

    mostrar(PORTAL.sessao());
    // Contas reais: confere a sessao no servidor (e a do link do e-mail)
    if (!PORTAL.MODO_DEMO) PORTAL.iniciar().then(u => {
        mostrar(u);
        // Chegou pelo link de troca de senha: leva direto ao formulario
        if (u && veioTrocarSenha) {
            document.getElementById('senha-titulo').textContent = 'Crie sua nova senha.';
            document.getElementById('tela-portal-senha').scrollIntoView({ block: 'start' });
            document.getElementById('s-nova').focus();
        }
    }).catch(() => {});

    const formLogin = document.getElementById('form-login');
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const retorno = document.getElementById('login-retorno');
        formLogin.classList.add('validar');

        if (!formLogin.checkValidity()) {
            retorno.textContent = 'Informe seu e-mail e sua senha.';
            formLogin.querySelector(':invalid')?.focus();
            return;
        }

        try {
            const usuario = await PORTAL.entrar(
                document.getElementById('p-email').value.trim(),
                document.getElementById('p-senha').value,
                // Bastidor: portal.html?demo=1500 simula o valor mensal na demonstracao
                new URLSearchParams(location.search).get('demo')
            );
            PORTAL.salvar(usuario);
            formLogin.reset();
            mostrar(usuario, true);
        } catch (erro) {
            retorno.textContent = erro.message;
        }
    });

    // Esqueci minha senha
    const formEsqueci = document.getElementById('form-esqueci');
    const trocarForm = (esqueci) => {
        formLogin.hidden = esqueci;
        formEsqueci.hidden = !esqueci;
        if (esqueci) document.getElementById('e-email').value = document.getElementById('p-email').value;
    };
    document.getElementById('btn-esqueci').addEventListener('click', () => trocarForm(true));
    document.getElementById('btn-voltar-login').addEventListener('click', () => trocarForm(false));
    formEsqueci.addEventListener('submit', async (e) => {
        e.preventDefault();
        const retorno = document.getElementById('esqueci-retorno');
        formEsqueci.classList.add('validar');
        if (!formEsqueci.checkValidity()) { retorno.textContent = 'Informe um e-mail válido.'; return; }
        try {
            await PORTAL.esqueciSenha(document.getElementById('e-email').value.trim());
            retorno.textContent = 'Pronto! Se este e-mail tiver cadastro, o link para criar uma senha nova chega em alguns minutos.';
        } catch (erro) {
            retorno.textContent = erro.message;
        }
    });

    // Trocar senha (opcional)
    const formSenha = document.getElementById('form-senha');
    formSenha.addEventListener('submit', async (e) => {
        e.preventDefault();
        const retorno = document.getElementById('senha-retorno');
        const nova = document.getElementById('s-nova');
        const confirma = document.getElementById('s-confirma');
        confirma.setCustomValidity(confirma.value && confirma.value !== nova.value ? 'As senhas não conferem.' : '');
        formSenha.classList.add('validar');
        if (!formSenha.checkValidity()) {
            retorno.textContent = nova.validity.tooShort || nova.validity.valueMissing ? 'A senha precisa ter pelo menos 6 caracteres.' : 'As duas senhas não conferem.';
            return;
        }
        try {
            await PORTAL.trocarSenha(nova.value);
            formSenha.reset();
            formSenha.classList.remove('validar');
            document.getElementById('aviso-senha').hidden = true;
            document.getElementById('senha-titulo').textContent = 'Trocar senha.';
            retorno.textContent = PORTAL.MODO_DEMO ? 'Demonstração: com as contas ligadas, a senha nova passa a valer no próximo login.' : 'Senha alterada. Use a nova senha no próximo login.';
        } catch (erro) {
            retorno.textContent = erro.message;
        }
    });

    document.getElementById('btn-sair').addEventListener('click', () => {
        PORTAL.sair();
        mostrar(null, true);
    });
}

/* =========================================================
   FACA PARTE (fazer-parte.html): cadastro de mantenedor.
   Ao concluir, abre a sessao e leva a Area do Mantenedor.
   ========================================================= */
if (PAGINA === 'fazer-parte') {
    const formCadastro = document.getElementById('form-cadastro');

    // Veio de um plano? Mostra qual e, ao concluir, segue para o pagamento
    const chavePlano = new URLSearchParams(location.search).get('plano');
    const nivelPlano = NIVEIS.find(n => n.id === PLANOS[chavePlano]);
    const linkPlano = nivelPlano ? LINKS_PAGAMENTO[chavePlano] : '';
    if (nivelPlano) {
        document.getElementById('plano-escolhido').hidden = false;
        document.getElementById('plano-nome').textContent = `Plano ${nivelPlano.nome}`;
        document.getElementById('plano-faixa').textContent = `· ${nivelPlano.faixa}`;
        document.getElementById('cadastro-lead').textContent = 'Primeiro, seu cadastro. Em seguida você vai para a página de pagamento da contribuição.';
        const ja = PORTAL.sessao();
        if (ja) {
            formCadastro.hidden = true;
            document.querySelector('.acesso-alternativo').hidden = true;
            document.getElementById('plano-ja-cadastrado').hidden = false;
            document.getElementById('plano-ja-email').textContent = ja.email;
            const ir = document.getElementById('plano-ir-pagamento');
            if (linkPlano) ir.href = linkPlano;
            else { ir.setAttribute('aria-disabled', 'true'); document.getElementById('plano-sem-link').hidden = false; }
        }
    }
    const cpf = document.getElementById('c-cpf');

    // Mascara 000.000.000-00 enquanto digita
    cpf.addEventListener('input', () => {
        const d = cpf.value.replace(/\D/g, '').slice(0, 11);
        cpf.value = d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        cpf.setCustomValidity('');
    });

    document.getElementById('c-nascimento').max = new Date().toISOString().slice(0, 10);

    // Nome da igreja fica sempre visivel; passa a ser obrigatorio para quem congrega
    formCadastro.querySelectorAll('input[name="congrega"]').forEach(r => r.addEventListener('change', () => {
        document.getElementById('c-igreja').required =
            formCadastro.querySelector('input[name="congrega"]:checked')?.value === 'sim';
    }));

    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const retorno = document.getElementById('cadastro-retorno');
        formCadastro.classList.add('validar');
        cpf.setCustomValidity(cpf.value && !cpfValido(cpf.value) ? 'CPF inválido.' : '');

        if (!formCadastro.checkValidity()) {
            const invalido = formCadastro.querySelector(':invalid');
            retorno.textContent = invalido === cpf && cpf.value
                ? 'Confira o CPF: os números não formam um CPF válido.'
                : 'Preencha todos os campos e marque a autorização.';
            invalido?.focus();
            return;
        }

        const valor = (id) => document.getElementById(id).value.trim();
        const escolha = (nome) => formCadastro.querySelector(`input[name="${nome}"]:checked`).value;
        try {
            const usuario = await PORTAL.cadastrar({
                nome: valor('c-nome'),
                cpf: cpf.value.replace(/\D/g, ''),
                nascimento: valor('c-nascimento'),
                naturalidade: valor('c-naturalidade'),
                moradia: valor('c-moradia'),
                cristao: escolha('cristao') === 'sim',
                congrega: escolha('congrega') === 'sim',
                igreja: valor('c-igreja'),
                email: valor('c-email'),
                senha: document.getElementById('c-senha').value
            });
            PORTAL.salvar(usuario);
            if (nivelPlano && linkPlano) { location.href = linkPlano; return; }
            if (nivelPlano) {
                retorno.textContent = 'Cadastro concluído! O link de pagamento deste plano ainda não está disponível. Avisaremos em breve.';
                setTimeout(() => { location.href = 'portal.html'; }, 3500);
                return;
            }
            location.href = 'portal.html';
        } catch (erro) {
            retorno.textContent = erro.message;
        }
    });
}

/* =========================================================
   MODO EDICAO
   Ferramenta temporaria desta fase de ajustes: o botao aparece em
   todas as paginas, para qualquer visitante. Ctrl+E tambem liga.
   Ao Concluir, as mudancas sao SALVAS NO NAVEGADOR de quem editou
   (localStorage) e reaplicadas nas proximas visitas daquele mesmo
   navegador. O site publicado nao muda: para isso, "Baixar edicoes"
   gera um arquivo com as alteracoes, a ser enviado para publicacao.
   Retirar tudo quando os textos estiverem fechados.
   ========================================================= */
let editMode = false;

const EDITAVEIS = [
    '.hero h1', '.hero-lead', '.hero-complemento', 'section h2', '.sec-intro', '.sub-titulo', '.sub-intro',
    '.texto-bloco p', '.destaque', '.mvp-item h4', '.mvp-item p', '.territorio p',
    '.etapa h3', '.etapa p', '.barreira h3', '.barreira > p',
    '.card-acao h3', '.card-acao p', '.beneficio h4', '.beneficio p',
    '.campanha-card h3', '.campanha-lema', '.campanha-desc', '.campanha-lista li', '.campanha-beneficios li',
    '.agenda-info h4', '.agenda-info p', '.meses-lista li', '.lista-destaques li', '.logo'
].join(', ');

// Blocos que o modo edicao deixa ocultar, mostrar e duplicar.
// SECOES: so ocultar/mostrar. ITENS: tambem duplicar (e remover a copia).
const SECOES = 'section';
const ITENS = [
    '.card-acao', '.beneficio', '.mvp-item', '.etapa', '.barreira', '.campanha-card', '.pilar',
    '.numero-item', '.agenda-item', '.noticia-card', '.territorio', '.texto-bloco p', '.destaque',
    '.campanha-lista li', '.campanha-beneficios li', '.lista-destaques li', '.meses-lista li', '.cta-buttons .btn'
].join(', ');

const CHAVE_EDICOES = 'conesul-edicoes::' + (location.pathname.split('/').pop() || 'index.html');
const elementosEditaveis = () => [...document.querySelectorAll(EDITAVEIS)];
const blocos = () => [...document.querySelectorAll(`${SECOES}, ${ITENS}`)].filter(el => !el.closest('header, footer'));

function lerEdicoes() {
    try { return JSON.parse(localStorage.getItem(CHAVE_EDICOES)) || {}; } catch { return {}; }
}
const salvo = lerEdicoes();

// Cada bloco publicado ganha uma chave estavel: o comeco do seu texto
// mais a ordem entre blocos de texto igual. Assim acrescentar ou
// reordenar blocos na pagina nao faz uma edicao cair no lugar errado.
const contagem = {};
blocos().forEach(el => {
    const tipo = el.matches(ITENS) ? 'i' : 's';
    const assinatura = tipo + '|' + el.textContent.replace(/\s+/g, ' ').trim().slice(0, 80);
    contagem[assinatura] = (contagem[assinatura] || 0) + 1;
    el.dataset.bloco = assinatura + '|' + contagem[assinatura];
});
const acharBloco = chave => blocos().find(el => el.dataset.bloco === chave);

// Texto original de cada elemento editavel, para salvar so o que mudou
const originais = new WeakMap();
elementosEditaveis().forEach(el => originais.set(el, el.innerText));

let clones = Array.isArray(salvo.clones) ? salvo.clones : [];
let ocultos = new Set(Array.isArray(salvo.ocultos) ? salvo.ocultos : []);

function duplicarBloco(origem, id) {
    const copia = origem.cloneNode(true);
    [copia, ...copia.querySelectorAll('*')].forEach(el => {
        el.classList.remove('revelar', 'visivel', 'bloco-alvo');
        el.removeAttribute('id');
        el.style.removeProperty('--atraso');
    });
    copia.dataset.bloco = 'c:' + id;
    copia.classList.remove('bloco-oculto');
    origem.after(copia);
    // A copia herda o texto original de quem copiou (nao o editado)
    const deOrigem = [...origem.querySelectorAll(EDITAVEIS)];
    [...copia.querySelectorAll(EDITAVEIS)].forEach((el, i) => {
        const orig = deOrigem[i];
        if (orig && originais.has(orig)) originais.set(el, originais.get(orig));
        else originais.set(el, el.innerText);
        if (orig) el.innerText = originais.get(orig) ?? el.innerText;
    });
    return copia;
}

// 1) copias; 2) textos (so onde o original ainda confere); 3) ocultos
clones = clones.filter(c => {
    const origem = acharBloco(c.de);
    if (!origem) return false;
    duplicarBloco(origem, c.id);
    return true;
});
if (salvo.textos) {
    const lista = elementosEditaveis();
    const total = lista.length;
    lista.forEach((el, i) => {
        const ed = salvo.textos[i];
        if (ed === undefined) return;
        if (typeof ed === 'object' && ed.de === originais.get(el)) el.innerText = ed.para;
        else if (typeof ed === 'string' && salvo.total === total) el.innerText = ed;
    });
}
ocultos.forEach(chave => { const el = acharBloco(chave); if (el) el.classList.add('bloco-oculto'); });

function salvarEdicoes() {
    const textos = {};
    let houveTexto = false;
    const lista = elementosEditaveis();
    lista.forEach((el, i) => {
        const de = originais.get(el);
        if (de !== undefined && el.innerText !== de) { textos[i] = { de, para: el.innerText }; houveTexto = true; }
    });
    // Descarta ocultos que ja nao existem (ex.: copia removida)
    ocultos = new Set([...ocultos].filter(acharBloco));
    const houve = houveTexto || clones.length || ocultos.size;
    try {
        if (houve) localStorage.setItem(CHAVE_EDICOES, JSON.stringify({
            total: lista.length, textos, clones, ocultos: [...ocultos], quando: new Date().toISOString()
        }));
        else localStorage.removeItem(CHAVE_EDICOES);
    } catch { alert('Não foi possível salvar neste navegador.'); return false; }
    return houve;
}

function aplicarEdicaoNosTextos() {
    elementosEditaveis().forEach(el => {
        el.contentEditable = editMode;
        el.style.outline = editMode ? '1px dashed rgba(201, 215, 128, 0.9)' : '';
        el.style.outlineOffset = editMode ? '6px' : '';
    });
}

function toggleEditMode() {
    editMode = !editMode;
    document.body.classList.toggle('modo-edicao', editMode);
    aplicarEdicaoNosTextos();
    const btn = document.getElementById('btn-editar');
    document.getElementById('barra-edicao-extra').hidden = !editMode;
    if (editMode) { btn.textContent = 'Concluir'; return; }
    esconderControle();
    const houve = salvarEdicoes();
    btn.textContent = houve ? 'Salvo ✓' : 'Editar';
    if (houve) setTimeout(() => { if (!editMode) btn.textContent = 'Editar'; }, 2000);
}

/* Controle de bloco: aparece sobre o bloco em que o mouse (ou o dedo)
   esta, durante a edicao. Ocultar some com o bloco para os visitantes
   deste navegador; na edicao ele fica apagado, para poder voltar. */
const controle = document.createElement('div');
controle.id = 'ctrl-bloco';
controle.hidden = true;
controle.innerHTML = `
    <span class="ctrl-tipo"></span>
    <button type="button" data-acao="ocultar"></button>
    <button type="button" data-acao="duplicar" title="Cria uma cópia logo abaixo, para editar">Duplicar</button>
    <button type="button" data-acao="remover" title="Apaga esta cópia">Remover</button>`;
document.body.appendChild(controle);
let alvoBloco = null;

function esconderControle() {
    controle.hidden = true;
    if (alvoBloco) alvoBloco.classList.remove('bloco-alvo');
    alvoBloco = null;
}

function mostrarControle(el) {
    if (alvoBloco !== el) {
        if (alvoBloco) alvoBloco.classList.remove('bloco-alvo');
        alvoBloco = el;
        el.classList.add('bloco-alvo');
    }
    const item = el.matches(ITENS);
    const copia = el.dataset.bloco.startsWith('c:');
    const oculto = el.classList.contains('bloco-oculto');
    controle.querySelector('.ctrl-tipo').textContent = (item ? 'Item' : 'Seção') + (copia ? ' (cópia)' : '') + (oculto ? ' · oculto' : '');
    const btnOcultar = controle.querySelector('[data-acao="ocultar"]');
    btnOcultar.textContent = oculto ? 'Mostrar' : 'Ocultar';
    btnOcultar.title = oculto ? 'Volta a mostrar este bloco' : 'Esconde este bloco da página';
    controle.querySelector('[data-acao="duplicar"]').hidden = !item;
    controle.querySelector('[data-acao="remover"]').hidden = !copia;
    controle.hidden = false;
    const r = el.getBoundingClientRect();
    const largura = controle.offsetWidth;
    controle.style.top = `${Math.max(r.top, 0) + window.scrollY + 4}px`;
    controle.style.left = `${Math.max(8, Math.min(r.right - largura - 4, document.documentElement.clientWidth - largura - 8)) + window.scrollX}px`;
}

document.addEventListener('mouseover', (e) => {
    if (!editMode || controle.contains(e.target) || e.target.closest('#barra-edicao')) return;
    const el = e.target.closest(ITENS) || e.target.closest(SECOES);
    if (el && el.dataset.bloco && !el.closest('header, footer')) mostrarControle(el);
});

controle.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !alvoBloco) return;
    const el = alvoBloco;
    const acao = btn.dataset.acao;
    if (acao === 'ocultar') {
        const oculto = el.classList.toggle('bloco-oculto');
        if (oculto) ocultos.add(el.dataset.bloco); else ocultos.delete(el.dataset.bloco);
        mostrarControle(el);
    } else if (acao === 'duplicar') {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        clones.push({ id, de: el.dataset.bloco });
        const copia = duplicarBloco(el, id);
        aplicarEdicaoNosTextos();
        mostrarControle(copia);
    } else if (acao === 'remover') {
        if (!confirm('Remover esta cópia?')) return;
        // Remove tambem as copias feitas a partir desta
        const removidas = new Set([el.dataset.bloco]);
        el.querySelectorAll('[data-bloco^="c:"]').forEach(f => removidas.add(f.dataset.bloco));
        let mudou = true;
        while (mudou) {
            mudou = false;
            clones.forEach(c => { if (removidas.has(c.de) && !removidas.has('c:' + c.id)) { removidas.add('c:' + c.id); mudou = true; } });
        }
        removidas.forEach(k => { const b = acharBloco(k); if (b) b.remove(); ocultos.delete(k); });
        clones = clones.filter(c => !removidas.has('c:' + c.id));
        esconderControle();
    }
    salvarEdicoes();
});

// Baixa TODAS as edicoes salvas neste navegador (todas as paginas),
// num arquivo para enviar a quem publica o site.
function baixarEdicoes() {
    if (editMode) salvarEdicoes();
    const tudo = {};
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith('conesul-edicoes::')) tudo[k.replace('conesul-edicoes::', '')] = JSON.parse(localStorage.getItem(k));
    }
    if (!Object.keys(tudo).length) { alert('Nenhuma edição salva ainda. Edite um texto e clique em Concluir.'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(tudo, null, 2)], { type: 'application/json' }));
    a.download = 'edicoes-cone-sul.json';
    a.click();
    URL.revokeObjectURL(a.href);
}

function desfazerEdicoes() {
    if (!confirm('Descartar as edições salvas desta página (textos, blocos ocultos e cópias) e voltar ao que está publicado?')) return;
    try { localStorage.removeItem(CHAVE_EDICOES); } catch { /* nada */ }
    location.reload();
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        toggleEditMode();
    }
});

const barraEdicao = document.createElement('div');
barraEdicao.id = 'barra-edicao';
barraEdicao.innerHTML = `
    <div id="barra-edicao-extra" hidden>
        <span class="dica-edicao">Passe o mouse sobre um bloco para ocultar ou duplicar</span>
        <button type="button" id="btn-baixar-edicoes" title="Gera um arquivo com tudo que você editou, para enviar a quem publica o site">Baixar edições</button>
        <button type="button" id="btn-desfazer-edicoes" title="Descarta as edições salvas desta página">Desfazer</button>
    </div>
    <button type="button" id="btn-editar" title="Editar os textos e os blocos. Ao concluir, as mudanças ficam salvas neste navegador.">Editar</button>`;
document.body.appendChild(barraEdicao);
document.getElementById('btn-editar').onclick = toggleEditMode;
document.getElementById('btn-baixar-edicoes').onclick = baixarEdicoes;
document.getElementById('btn-desfazer-edicoes').onclick = desfazerEdicoes;
