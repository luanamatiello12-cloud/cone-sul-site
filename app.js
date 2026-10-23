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

// ---------- Menu principal (ordem da copy oficial) ----------
const MENU = [
    { id: 'inicio',      rotulo: 'Início',                    href: 'index.html' },
    { id: 'missao',      rotulo: 'Nossa Missão',              href: 'nossa-missao.html' },
    { id: 'onde',        rotulo: 'Onde Atuamos',              href: 'onde-atuamos.html' },
    { id: 'como',        rotulo: 'Como Funciona',             href: 'como-funciona.html' },
    { id: 'mantenedor',  rotulo: 'Seja Mantenedor',           href: 'seja-mantenedor.html' },
    { id: 'empresarios', rotulo: 'Expansores com Propósito', href: 'empresarios.html' },
    { id: 'noticias',    rotulo: 'Notícias',                  href: 'noticias.html' }
];

const PAGINA = document.body.dataset.pagina || '';

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
    const itens = MENU.map(m =>
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
            <li><a href="contato.html" class="nav-cta${PAGINA === 'contato' ? ' ativo' : ''}">Faça Parte</a></li>
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
                ${MENU.map(m => `<li><a href="${m.href}">${m.rotulo}</a></li>`).join('')}
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
    '.barreira', '.numero-item', '.card-acao', '.mvp-item', '.territorio', '.beneficio', '.noticia-card',
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
const dadosPaises = {
    'Paraná': {
        titulo: 'Paraná',
        flag: '#flag-br',
        info: 'FOZ DO IGUAÇU\nO ponto de partida\n\nFoz do Iguaçu representa o início da estruturação da nossa jornada missionária. Uma região estratégica de conexão entre países, culturas e pessoas.'
    },
    'Santa Catarina': {
        titulo: 'Santa Catarina',
        flag: '#flag-br',
        info: 'SUL DO BRASIL\n\n[A preencher: papel de Santa Catarina no projeto.]'
    },
    'Rio Grande do Sul': {
        titulo: 'Rio Grande do Sul',
        flag: '#flag-br',
        info: 'SUL DO BRASIL\n\n[A preencher: papel do Rio Grande do Sul no projeto.]'
    },
    'Paraguai': {
        titulo: 'Paraguai',
        flag: '#flag-py',
        info: 'O PRÓXIMO PASSO\nSanta Rita está entre as localidades contempladas para a próxima etapa do desenvolvimento missionário.\n\n7,7 milhões de habitantes\n93,3% (7,2 mi) com acesso à internet\n6,7% evangélicos · 80% católicos · 13,3% sem religião'
    },
    'Argentina': {
        titulo: 'Argentina',
        flag: '#flag-ar',
        info: 'UMA VISÃO DE EXPANSÃO\nO avanço para a Argentina integra a visão de longo prazo do CONE SUL.\n\n46,4 milhões de habitantes\n91% (42,2 mi) com acesso à internet\n9% evangélicos · 57% católicos · 34% sem religião'
    },
    'Chile': {
        titulo: 'Chile',
        flag: '#flag-cl',
        info: 'FRONTEIRAS QUE AINDA QUEREMOS ATRAVESSAR\nO Chile também faz parte da visão de expansão missionária.\n\n20,2 milhões de habitantes\n88% (17,8 mi) com acesso à internet\n12% evangélicos · 54% católicos · 34% sem religião'
    }
};

// Tres estados do sul do Brasil (base) e tres paises (campo).
const paises = [
    { nome: 'Paraná',            lat: -24.6, lng: -51.6, cor: '#c9ad6a', base: true },
    { nome: 'Santa Catarina',    lat: -27.3, lng: -50.5, cor: '#c9ad6a', base: true },
    { nome: 'Rio Grande do Sul', lat: -29.8, lng: -53.3, cor: '#c9ad6a', base: true },
    { nome: 'Paraguai',          lat: -23.4, lng: -58.4, cor: '#3d5a3d' },
    { nome: 'Argentina',         lat: -35.5, lng: -65.0, cor: '#3d5a3d' },
    { nome: 'Chile',             lat: -35.0, lng: -71.0, cor: '#3d5a3d' }
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

        // Fundo SEM nomes: os nomes do mapa padrao ficavam cortados na borda
        // do recorte. Os nomes das cidades sao escritos por cima (CIDADES).
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Recorte: tudo que nao e a regiao do projeto fica coberto pela cor
        // da secao, e a regiao ganha um contorno em areia. Vem antes dos
        // marcadores para ficar por baixo deles.
        if (temContorno) {
            const fundo = getComputedStyle(document.getElementById('mapa-leaflet').closest('section')).backgroundColor;
            const mundo = [[-85, -180], [-85, 180], [85, 180], [85, -180]];
            L.polygon([mundo, ...REGIAO_CONTORNO], {
                stroke: false, fillColor: fundo, fillOpacity: 1, interactive: false
            }).addTo(map);
            L.polygon(REGIAO_CONTORNO, {
                color: '#c9ad6a', weight: 1.5, opacity: 0.9, fill: false, interactive: false
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
                color: pais.base ? '#8a7640' : '#2d4a2d',
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

        // Nomes das cidades, por cima do recorte para nunca sairem cortados
        // lado: onde o nome fica em relacao ao ponto. secundaria: some no
        // celular, onde o mapa e pequeno e os nomes se sobrepoem.
        const CIDADES = [
            { nome: 'Foz do Iguaçu', lat: -25.547, lng: -54.588, lado: 'abaixo' },
            { nome: 'Assunção',      lat: -25.264, lng: -57.576, lado: 'esquerda' },
            { nome: 'Curitiba',      lat: -25.429, lng: -49.271, secundaria: true },
            { nome: 'Florianópolis', lat: -27.595, lng: -48.548, secundaria: true },
            { nome: 'Porto Alegre',  lat: -30.035, lng: -51.218 },
            { nome: 'Buenos Aires',  lat: -34.604, lng: -58.382 },
            { nome: 'Santiago',      lat: -33.449, lng: -70.669 }
        ];
        CIDADES.forEach(c => {
            L.marker([c.lat, c.lng], {
                interactive: false,
                keyboard: false,
                icon: L.divIcon({
                    className: ['rotulo-cidade', c.lado, c.secundaria && 'secundaria'].filter(Boolean).join(' '),
                    html: `<span>${c.nome}</span>`,
                    iconSize: [0, 0]
                })
            }).addTo(map);
        });

        document.querySelector('.leaflet-container').style.filter = 'saturate(1.1) brightness(0.95)';
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

if (PAGINA === 'portal') {
    const telaLogin = document.getElementById('tela-login');
    const telasPortal = [document.getElementById('tela-portal-topo'), document.getElementById('tela-portal')];

    document.getElementById('aviso-demo').hidden = !PORTAL.MODO_DEMO;

    const mostrar = (usuario, animar = false) => {
        telaLogin.hidden = !!usuario;
        telasPortal.forEach(t => { t.hidden = !usuario; });
        if (usuario) document.getElementById('usuario-email').textContent = usuario.email;
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
   MODO EDICAO (as alteracoes NAO sao salvas no arquivo)
   ========================================================= */
let editMode = false;

const EDITAVEIS = [
    '.hero h1', '.hero-lead', '.hero-complemento', 'section h2', '.sec-intro', '.sub-titulo', '.sub-intro',
    '.texto-bloco p', '.destaque', '.mvp-item h4', '.mvp-item p', '.territorio p',
    '.etapa h3', '.etapa p', '.barreira h3', '.barreira > p',
    '.card-acao h3', '.card-acao p', '.beneficio h4', '.beneficio p', '.logo'
].join(', ');

function toggleEditMode() {
    editMode = !editMode;
    document.querySelectorAll(EDITAVEIS).forEach(el => {
        el.contentEditable = editMode;
        el.style.outline = editMode ? '1px dashed rgba(201, 173, 106, 0.9)' : '';
        el.style.outlineOffset = editMode ? '6px' : '';
    });
    document.getElementById('btn-editar').textContent = editMode ? 'Concluir' : 'Editar';
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        toggleEditMode();
    }
});

const editBtn = document.createElement('button');
editBtn.id = 'btn-editar';
editBtn.textContent = 'Editar';
editBtn.title = 'Edição temporária: some ao recarregar a página';
editBtn.onclick = toggleEditMode;
document.body.appendChild(editBtn);
