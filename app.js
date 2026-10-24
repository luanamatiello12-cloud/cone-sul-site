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
    { id: 'onde',        rotulo: 'Onde Atuamos',              href: 'onde-atuamos.html' },
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
                <li><a href="#">Política de Privacidade</a></li>
                <li><a href="#">Termos de Uso</a></li>
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
   MAPA — so roda na pagina que tem #mapa-leaflet
   ========================================================= */
// Estados do Sul: populacao e religiao do Censo 2022 (IBGE; religiao sobre
// a populacao de 10 anos ou mais). Sem linha de internet: a PNAD TIC por
// estado nao foi encontrada numa fonte conferivel.
// Paises: populacao e religiao do estudo do projeto (docs/DADOS-E-FONTES.md
// no repositorio cone-sul). O % de internet e o da versao anterior, de
// origem nao documentada; a contagem em milhoes saiu porque usava a
// populacao antiga.
const dadosPaises = {
    'Paraná': {
        titulo: 'Paraná',
        flag: '#flag-br',
        info: 'FOZ DO IGUAÇU\nO ponto de partida\n\nFoz do Iguaçu representa o início da estruturação da nossa jornada missionária. Uma região estratégica de conexão entre países, culturas e pessoas.\n\n11,4 milhões de habitantes\n26,1% evangélicos · 62,9% católicos · 6% sem religião'
    },
    'Santa Catarina': {
        titulo: 'Santa Catarina',
        flag: '#flag-br',
        info: 'SUL DO BRASIL\n\n[A preencher: papel de Santa Catarina no projeto.]\n\n7,6 milhões de habitantes\n23,4% evangélicos · 64,3% católicos · 6,3% sem religião'
    },
    'Rio Grande do Sul': {
        titulo: 'Rio Grande do Sul',
        flag: '#flag-br',
        info: 'SUL DO BRASIL\n\n[A preencher: papel do Rio Grande do Sul no projeto.]\n\n10,9 milhões de habitantes\n21,4% evangélicos · 60,6% católicos · 8,8% sem religião'
    },
    'Paraguai': {
        titulo: 'Paraguai',
        flag: '#flag-py',
        info: 'O PRÓXIMO PASSO\nSanta Rita está entre as localidades contempladas para a próxima etapa do desenvolvimento missionário.\n\n6,1 milhões de habitantes\n93,3% com acesso à internet\n6% a 9,6% evangélicos · 88% católicos'
    },
    'Argentina': {
        titulo: 'Argentina',
        flag: '#flag-ar',
        info: 'UMA VISÃO DE EXPANSÃO\nO avanço para a Argentina integra a visão de longo prazo do CONE SUL.\n\n45,9 milhões de habitantes\n91% com acesso à internet\n17,4% evangélicos · 57,7% católicos · 22,4% sem religião'
    },
    'Chile': {
        titulo: 'Chile',
        flag: '#flag-cl',
        info: 'FRONTEIRAS QUE AINDA QUEREMOS ATRAVESSAR\nO Chile também faz parte da visão de expansão missionária.\n\n18,5 milhões de habitantes\n88% com acesso à internet\n16,3% evangélicos · 54% católicos · 25,8% sem religião (15 anos ou mais)'
    }
};

// Tres estados do sul do Brasil (base) e tres paises (campo).
const paises = [
    { nome: 'Paraná',            lat: -24.6, lng: -51.6, cor: '#c9d780', base: true },
    { nome: 'Santa Catarina',    lat: -27.3, lng: -50.5, cor: '#c9d780', base: true },
    { nome: 'Rio Grande do Sul', lat: -29.8, lng: -53.3, cor: '#c9d780', base: true },
    { nome: 'Paraguai',          lat: -23.4, lng: -58.4, cor: '#122d1e' },
    { nome: 'Argentina',         lat: -35.5, lng: -65.0, cor: '#122d1e' },
    { nome: 'Chile',             lat: -35.0, lng: -71.0, cor: '#122d1e' }
];

let map = null;
const marcadores = [];
let destacarMarcador = () => {};

function abrirPasta(paisName) {
    const dados = dadosPaises[paisName];
    if (!dados) return;

    const corpo = document.querySelector('.card-body');
    corpo.style.transition = 'opacity 0.15s ease';
    corpo.style.opacity = '0';

    setTimeout(() => {
        document.getElementById('pasta-titulo').textContent = dados.titulo;
        document.getElementById('pasta-info').textContent = dados.info;
        const bandeira = document.getElementById('card-bandeira');
        bandeira.querySelector('use').setAttribute('href', dados.flag);
        bandeira.style.visibility = 'visible';
        corpo.style.opacity = '1';
    }, 150);
}

// Ponto unico de selecao: usado pela lista e pelos marcadores.
function selecionarPais(paisName) {
    document.querySelectorAll('.info-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.info-item[data-info="${paisName}"]`)?.classList.add('active');

    // O mapa e travado: selecionar so destaca o marcador, sem mover a visao.
    destacarMarcador(paisName);
    abrirPasta(paisName);
}

if (document.getElementById('mapa-leaflet')) {
    // Lista registrada fora do mapa: funciona mesmo se o Leaflet falhar.
    document.querySelectorAll('.info-item').forEach(item => {
        item.addEventListener('click', () => selecionarPais(item.dataset.info));
    });

    window.addEventListener('load', () => {
        if (typeof L === 'undefined') {
            document.getElementById('mapa-leaflet').innerHTML =
                '<div class="mapa-offline">Mapa indisponível (sem conexão).<br>Use a lista ao lado para ver os dados.</div>';
            return;
        }

        // Mapa travado numa visao geral: sem zoom e sem arrastar, para que
        // Sao Paulo e Mato Grosso do Sul aparecam so como um canto do mapa.
        map = L.map('mapa-leaflet', {
            zoomControl: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            boxZoom: false,
            keyboard: false,
            dragging: false,
            zoomSnap: 0.25
        });

        // Enquadra a regiao inteira (ou, sem o contorno, os seis marcadores).
        // Como o mapa e travado, precisa caber em qualquer largura de tela;
        // reenquadra quando a janela muda de tamanho.
        const temContorno = typeof REGIAO_CONTORNO !== 'undefined';
        const enquadrar = () => map.fitBounds(
            L.latLngBounds(temContorno ? REGIAO_CONTORNO.flat() : paises.map(p => [p.lat, p.lng])),
            { padding: [24, 24], animate: false }
        );
        enquadrar();
        window.addEventListener('resize', enquadrar);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Recorte suave: o que nao e a regiao do projeto fica sob um veu da
        // cor da secao, apagado mas ainda legivel (nada sai cortado), e a
        // regiao ganha um contorno em areia. Vem antes dos marcadores para
        // ficar por baixo deles.
        if (temContorno) {
            const fundo = getComputedStyle(document.getElementById('mapa-leaflet').closest('section')).backgroundColor;
            const mundo = [[-85, -180], [-85, 180], [85, 180], [85, -180]];
            L.polygon([mundo, ...REGIAO_CONTORNO], {
                stroke: false, fillColor: fundo, fillOpacity: 0.6, interactive: false
            }).addTo(map);
            L.polygon(REGIAO_CONTORNO, {
                color: '#c9d780', weight: 2, opacity: 1, fill: false, interactive: false
            }).addTo(map);
        }

        const estiloBase = (pais) => ({
            radius: pais.base ? 9 : 12,
            weight: 2,
            fillOpacity: pais.base ? 0.9 : 0.5
        });

        const ROTULO = {
            'Paraná': 'Foz do Iguaçu — o ponto de partida',
            'Santa Catarina': 'sul do Brasil',
            'Rio Grande do Sul': 'sul do Brasil',
            'Paraguai': 'Santa Rita — o próximo passo',
            'Argentina': 'uma visão de expansão',
            'Chile': 'fronteiras que ainda queremos atravessar'
        };

        paises.forEach(pais => {
            const circle = L.circleMarker([pais.lat, pais.lng], {
                fillColor: pais.cor,
                color: pais.base ? '#5f7424' : '#fef5e2',
                opacity: 0.85,
                dashArray: pais.base ? null : '3 3',
                ...estiloBase(pais)
            }).addTo(map);

            marcadores.push({ pais, circle });

            circle.bindPopup(`<strong>${pais.nome}</strong><br><em>${ROTULO[pais.nome]}</em>`,
                { closeButton: false, offset: [0, -8] });

            circle.on('click', () => selecionarPais(pais.nome));
            circle.on('mouseover', () => {
                circle.setStyle({ radius: 14, weight: 3, fillOpacity: 1 });
                circle.openPopup();
            });
            circle.on('mouseout', () => {
                if (!document.querySelector(`.info-item[data-info="${pais.nome}"].active`)) {
                    circle.setStyle(estiloBase(pais));
                    circle.closePopup();
                }
            });
        });

        destacarMarcador = (paisName) => {
            marcadores.forEach(({ pais, circle }) => {
                circle.setStyle(estiloBase(pais));
                circle.closePopup();
            });
            const alvo = marcadores.find(m => m.pais.nome === paisName);
            if (alvo) {
                alvo.circle.setStyle({ radius: 16, weight: 4, fillOpacity: 1 });
                alvo.circle.openPopup();
            }
        };

    });
}

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
    const telasPortal = ['tela-portal-topo', 'tela-portal', 'tela-portal-expansores'].map(id => document.getElementById(id));

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
