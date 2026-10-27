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

// ---------- Links de pagamento da campanha (seja-mantenedor.html) ----------
// Cole aqui o link do portal de pagamento de cada faixa. Enquanto estiver
// vazio, o botao aparece mas nao leva a lugar nenhum.
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
            <li><a href="fazer-parte.html" class="nav-cta${PAGINA === 'fazer-parte' ? ' ativo' : ''}">Faça Parte</a></li>
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
document.querySelectorAll('[data-pagamento]').forEach(botao => {
    const link = LINKS_PAGAMENTO[botao.dataset.pagamento];
    if (link) {
        botao.href = link;
        botao.target = '_blank';
        botao.rel = 'noopener';
    } else {
        botao.setAttribute('aria-disabled', 'true');
    }
});

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
const PORTAL = {
    MODO_DEMO: true,
    CHAVE: 'conesul-sessao',

    async entrar(email, senha) {
        if (this.MODO_DEMO) return { email };
        throw new Error('Sistema de contas ainda não configurado.');
    },

    // Em modo demonstracao o cadastro NAO e enviado a lugar nenhum: so abre
    // a sessao com nome e e-mail. CPF, nascimento, endereco e respostas sobre
    // a fe nao sao guardados. Com um servico de contas, enviar `dados` aqui.
    async cadastrar(dados) {
        if (this.MODO_DEMO) return { nome: dados.nome, email: dados.email };
        throw new Error('Sistema de contas ainda não configurado.');
    },

    sessao() {
        try { return JSON.parse(sessionStorage.getItem(this.CHAVE)); } catch { return null; }
    },

    salvar(usuario) {
        try { sessionStorage.setItem(this.CHAVE, JSON.stringify(usuario)); } catch { /* sem storage: sessao so dura a pagina */ }
    },

    sair() {
        try { sessionStorage.removeItem(this.CHAVE); } catch { /* nada a limpar */ }
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
    // Endereco antigo do cadastro (portal.html#cadastro) leva a pagina nova
    const irParaCadastro = () => { if (location.hash === '#cadastro') location.replace('fazer-parte.html'); };
    irParaCadastro();
    window.addEventListener('hashchange', irParaCadastro);

    const telaLogin = document.getElementById('tela-login');
    const telasPortal = ['tela-portal-topo', 'tela-portal-expansores', 'tela-portal-summit', 'tela-portal-calendario', 'tela-portal'].map(id => document.getElementById(id));

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
        if (usuario) document.getElementById('usuario-email').textContent = usuario.nome || usuario.email;
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
                document.getElementById('p-senha').value
            );
            PORTAL.salvar(usuario);
            formLogin.reset();
            mostrar(usuario, true);
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

const CHAVE_EDICOES = 'conesul-edicoes::' + (location.pathname.split('/').pop() || 'index.html');
const elementosEditaveis = () => [...document.querySelectorAll(EDITAVEIS)];
// Texto original de cada elemento, para salvar so o que mudou
const textosOriginais = elementosEditaveis().map(el => el.innerText);

function lerEdicoes() {
    try { return JSON.parse(localStorage.getItem(CHAVE_EDICOES)); } catch { return null; }
}

// Reaplica edicoes salvas. Cada edicao guarda o texto original ("de"):
// so e aplicada se aquele lugar ainda tiver o mesmo texto, entao
// reordenar ou acrescentar blocos na pagina nao joga uma edicao no
// lugar errado. (Formato antigo, sem "de": vale se a pagina tiver a
// mesma quantidade de textos.)
const salvo = lerEdicoes();
if (salvo && salvo.textos) {
    elementosEditaveis().forEach((el, i) => {
        const ed = salvo.textos[i];
        if (ed === undefined) return;
        if (typeof ed === 'object' && ed.de === textosOriginais[i]) el.innerText = ed.para;
        else if (typeof ed === 'string' && salvo.total === textosOriginais.length) el.innerText = ed;
    });
}

function salvarEdicoes() {
    const textos = {};
    let houve = false;
    elementosEditaveis().forEach((el, i) => {
        if (el.innerText !== textosOriginais[i]) { textos[i] = { de: textosOriginais[i], para: el.innerText }; houve = true; }
    });
    try {
        if (houve) localStorage.setItem(CHAVE_EDICOES, JSON.stringify({ total: textosOriginais.length, textos, quando: new Date().toISOString() }));
        else localStorage.removeItem(CHAVE_EDICOES);
    } catch { alert('Não foi possível salvar neste navegador.'); return; }
    const btn = document.getElementById('btn-editar');
    btn.textContent = houve ? 'Salvo ✓' : 'Editar';
    if (houve) setTimeout(() => { if (!editMode) btn.textContent = 'Editar'; }, 2000);
}

function toggleEditMode() {
    editMode = !editMode;
    elementosEditaveis().forEach(el => {
        el.contentEditable = editMode;
        el.style.outline = editMode ? '1px dashed rgba(201, 215, 128, 0.9)' : '';
        el.style.outlineOffset = editMode ? '6px' : '';
    });
    document.getElementById('btn-editar').textContent = editMode ? 'Concluir' : 'Editar';
    document.getElementById('barra-edicao-extra').hidden = !editMode;
    if (!editMode) salvarEdicoes();
}

// Baixa TODAS as edicoes salvas neste navegador (todas as paginas),
// num arquivo para enviar a quem publica o site.
function baixarEdicoes() {
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
    if (!confirm('Descartar as edições salvas desta página e voltar ao texto publicado?')) return;
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
        <button type="button" id="btn-baixar-edicoes" title="Gera um arquivo com tudo que você editou, para enviar a quem publica o site">Baixar edições</button>
        <button type="button" id="btn-desfazer-edicoes" title="Descarta as edições salvas desta página">Desfazer</button>
    </div>
    <button type="button" id="btn-editar" title="Editar os textos. Ao concluir, as mudanças ficam salvas neste navegador.">Editar</button>`;
document.body.appendChild(barraEdicao);
document.getElementById('btn-editar').onclick = toggleEditMode;
document.getElementById('btn-baixar-edicoes').onclick = baixarEdicoes;
document.getElementById('btn-desfazer-edicoes').onclick = desfazerEdicoes;
