/* =========================================================
   CONE SUL — script compartilhado por todas as paginas.
   Cabecalho, rodape e bandeiras sao montados aqui para que
   o menu seja editado em um lugar so.
   ========================================================= */

// Aberto dentro de outro site (moldura invisivel para enganar cliques)?
// Some e tenta abrir o site como pagina principal.
if (window.top !== window.self) {
    document.documentElement.style.display = 'none';
    try { window.top.location = window.location.href; } catch { /* moldura bloqueada: fica escondido */ }
}

// ---------- Contato (WhatsApp e site da igreja: trocar quando houver) ----------
const CONTATO = {
    email: 'conesul.missoes@gmail.com',
    instagram: 'https://www.instagram.com/missao.conesul/',
    whatsapp: 'https://wa.me/5549991802176',
    igreja: '#'
};

// ---------- Contas de mantenedor (Supabase) ----------
// Vazio = modo demonstracao (qualquer e-mail entra, nada e guardado).
// Para ligar as contas reais, siga servidor/LEIA-ME.md e cole aqui a URL
// do projeto e a chave publica ("anon"). A chave publica pode ficar no
// site: o que protege os dados sao as regras do banco (schema.sql).
const CONTAS = {
    url: 'https://zwswipzsjiopimgmsdpl.supabase.co',
    chavePublica: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c3dpcHpzamlvcGltZ21zZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMDQ4MTYsImV4cCI6MjEwODg4MDgxNn0.bOKphfAqoGJuG4fHai8-e2VshauD8da6ezoPW7N7NLU',
    // Chave do site do Cloudflare Turnstile (CAPTCHA). Vazio = sem CAPTCHA.
    // Ligar junto com "Captcha protection" no Supabase (servidor/LEIA-ME.md):
    // um sem o outro faz o login falhar.
    captcha: ''
};

// ---------- Link de pagamento da campanha (seja-mantenedor.html) ----------
// Um link so para todos os planos: a pessoa escolhe o valor na pagina de
// pagamento, e o nivel no login sai do valor contribuido (relatorio do
// Eklesia ou webhook), nunca do plano clicado no site. Enquanto estiver
// vazio, o cadastro avisa que o pagamento ainda nao esta disponivel.
const LINKS_PAGAMENTO = {
    unico: 'https://renovaremcristo.org/oferta'
};

// ---------- Configuracoes do site (Painel em admin.html) ----------
// Contatos, links de pagamento, camisetas e cidades do mapa podem ser
// mudados pela equipe no painel, sem mexer no codigo. Com contas ligadas
// ficam no banco (site_edicoes, pagina "_config"), lidos por todos; na
// demonstracao, so no navegador de quem mudou (e vao em "Baixar edicoes").
// O que estiver aqui no codigo vale ate o painel mudar.
const CONTAS_LIGADAS = !!(CONTAS.url && CONTAS.chavePublica);
const CHAVE_CONFIG = 'conesul-edicoes::_config';
const CHAVE_CONFIG_CACHE = 'conesul-config-publicada';
const CONTATO_PADRAO = { ...CONTATO };
const PAGAMENTOS_PADRAO = { ...LINKS_PAGAMENTO };
let CONFIG_SITE = {};
const lerJSON = (chave) => { try { return JSON.parse(localStorage.getItem(chave)) || null; } catch { return null; } };
// So enderecos http(s) completos (o que vem do banco e conferido de novo aqui)
const httpSeguro = (u) => { try { const x = new URL(String(u ?? '').trim()); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; } };
// Foto: arquivo do proprio site (img/...), http(s) ou imagem embutida
const fotoSegura = (u) => {
    const v = String(u ?? '').trim();
    if (/^img\/[\w./-]+\.(jpe?g|png|webp)$/i.test(v) && !v.includes('..')) return v;
    if (/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(v)) return v;
    return httpSeguro(v);
};
const textoCurto = (v, max = 300) => String(v ?? '').trim().slice(0, max);

function aplicarConfig(c) {
    CONFIG_SITE = c && typeof c === 'object' ? c : {};
    Object.assign(CONTATO, CONTATO_PADRAO);
    Object.assign(LINKS_PAGAMENTO, PAGAMENTOS_PADRAO);
    const ct = CONFIG_SITE.contato || {};
    if (/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(ct.email || '')) CONTATO.email = ct.email.trim();
    ['instagram', 'whatsapp', 'igreja'].forEach(k => { const u = httpSeguro(ct[k]); if (u) CONTATO[k] = u; });
    const pg = CONFIG_SITE.pagamentos || {};
    Object.keys(LINKS_PAGAMENTO).forEach(k => { if (k in pg) LINKS_PAGAMENTO[k] = httpSeguro(pg[k]); });
}

// Camisetas do painel (null = usar loja/produtos.js)
function configProdutos() {
    const lista = CONFIG_SITE.produtos;
    if (!Array.isArray(lista)) return null;
    return lista.slice(0, 30).map(p => {
        const tamanhos = (Array.isArray(p.tamanhos) ? p.tamanhos : []).map(t => textoCurto(t, 8)).filter(Boolean).slice(0, 12);
        const estoque = {};
        tamanhos.forEach(t => { const n = Number(p.estoque?.[t]); if (Number.isFinite(n) && n >= 0) estoque[t] = Math.floor(n); });
        const colunas = (Array.isArray(p.medidas?.colunas) ? p.medidas.colunas : []).map(c => textoCurto(c, 20)).filter(Boolean).slice(0, 6);
        const linhas = {};
        if (colunas.length) tamanhos.forEach(t => {
            const v = p.medidas?.linhas?.[t];
            linhas[t] = Array.isArray(v) && v.some(n => String(n ?? '').trim()) ? colunas.map((_, i) => textoCurto(v[i], 8)) : null;
        });
        return {
            nome: textoCurto(p.nome, 80) || 'Produto',
            descricao: textoCurto(p.descricao, 300),
            preco: textoCurto(p.preco, 30),
            tamanhos,
            estoque: Object.keys(estoque).length ? estoque : null,
            medidas: colunas.length ? { colunas, linhas } : null,
            fotos: (Array.isArray(p.fotos) ? p.fotos : []).map(fotoSegura).filter(Boolean).slice(0, 8),
            link: httpSeguro(p.link)
        };
    });
}

// Cidades do mapa: fotos escolhidas no painel, cidades escondidas e novas.
// Muda a lista LOCAIS (mapa/locais.js) antes de o mapa ser montado.
function configLocais(locais) {
    const c = CONFIG_SITE.locais;
    if (!c || typeof c !== 'object' || !Array.isArray(locais)) return locais;
    const ocultos = new Set(Array.isArray(c.ocultos) ? c.ocultos : []);
    const novos = (Array.isArray(c.novos) ? c.novos : []).map(n => ({
        nome: textoCurto(n.nome, 60),
        ...(n.pais ? { pais: textoCurto(n.pais, 40) } : { uf: textoCurto(n.uf, 2).toUpperCase() }),
        territorio: textoCurto(n.territorio, 4),
        lat: Number(n.lat), lng: Number(n.lng), fotos: []
    })).filter(n => n.nome && Math.abs(n.lat) <= 90 && Math.abs(n.lng) <= 180 && !locais.some(l => l.nome === n.nome));
    const todos = [...locais, ...novos].filter(l => !ocultos.has(l.nome));
    const fotos = c.fotos && typeof c.fotos === 'object' ? c.fotos : {};
    todos.forEach(l => {
        const lista = Array.isArray(fotos[l.nome]) ? fotos[l.nome] : null;
        if (!lista) return;
        l.fotos = lista.map(f => ({ src: fotoSegura(f?.src), legenda: textoCurto(f?.legenda, 140) })).filter(f => f.src).slice(0, 30);
        l._procurado = true;                     // nao procura mais na pasta da cidade
        if (!l.fotos.length) l._pronto = true;   // lista vazia de proposito: "Fotos em breve"
    });
    locais.splice(0, locais.length, ...todos);
    return locais;
}

// Rodape: os links de contato acompanham a configuracao
function atualizarContatosNaTela() {
    document.querySelectorAll('[data-contato]').forEach(a => {
        const k = a.dataset.contato;
        a.href = k === 'email' ? 'mailto:' + CONTATO.email : CONTATO[k];
        // Redes e sites abrem em outra aba (so quando ja tem endereco)
        if (k !== 'email' && CONTATO[k] !== '#') { a.target = '_blank'; a.rel = 'noopener'; }
        else a.removeAttribute('target');
        // Site da igreja ainda nao existe: o item some do rodape ate ter endereco
        if (k === 'igreja' && a.parentElement.tagName === 'LI') a.parentElement.hidden = CONTATO.igreja === '#';
        // Rodape: o endereco aparece ao lado do nome (@perfil, telefone, e-mail)
        if (a.closest('footer') && ['instagram', 'whatsapp', 'email'].includes(k)) {
            let end = a.querySelector('.contato-endereco');
            if (!end) { end = document.createElement('span'); end.className = 'contato-endereco'; a.append(' ', end); }
            end.textContent = enderecoContato(k);
        }
    });
}
// Como o endereco aparece escrito: @perfil, (49) 99999-9999, e-mail
function enderecoContato(k) {
    if (k === 'email') return CONTATO.email;
    try {
        const u = new URL(CONTATO[k]);
        if (k === 'instagram') { const perfil = u.pathname.split('/').filter(Boolean)[0]; return perfil ? '@' + perfil : ''; }
        let d = u.pathname.replace(/\D/g, '');
        if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
        if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
        return d ? '+' + d : '';
    } catch { return ''; }
}

// Demonstracao: o que foi salvo neste navegador. Contas ligadas: a ultima
// versao conhecida ja vale na hora, e a do banco chega em seguida (a loja
// e o mapa esperam por ela, no maximo 2,5 s).
aplicarConfig(lerJSON(CONTAS_LIGADAS ? CHAVE_CONFIG_CACHE : CHAVE_CONFIG));
const CONFIG_PRONTA = !CONTAS_LIGADAS ? Promise.resolve() : Promise.race([
    fetch(`${CONTAS.url}/rest/v1/site_edicoes?pagina=eq._config&select=conteudo&order=id.desc&limit=1`,
        { headers: { apikey: CONTAS.chavePublica, Authorization: 'Bearer ' + CONTAS.chavePublica } })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
        .then(linhas => {
            const c = linhas[0] ? linhas[0].conteudo : null;
            try { if (c) localStorage.setItem(CHAVE_CONFIG_CACHE, JSON.stringify(c)); else localStorage.removeItem(CHAVE_CONFIG_CACHE); } catch { /* sem storage */ }
            aplicarConfig(c);
            atualizarContatosNaTela();
        })
        .catch(erro => console.warn('Configurações do site indisponíveis:', erro)),
    new Promise(ok => setTimeout(ok, 2500))
]);

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
        <a href="index.html" class="logo" aria-label="Cone Sul, página inicial"><img src="img/logo-cone-sul.webp?v=1" alt="Cone Sul" width="151" height="120"></a>
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
                <li><a href="${CONTATO.instagram}" data-contato="instagram">Instagram</a></li>
                <li><a href="${CONTATO.whatsapp}" data-contato="whatsapp">WhatsApp</a></li>
                <li><a href="mailto:${CONTATO.email}" data-contato="email">E-mail</a></li>
            </ul>
        </div>
        <div class="footer-col">
            <h5>Institucional</h5>
            <ul>
                <li><a href="portal.html">Área do Mantenedor</a></li>
                <li><a href="${CONTATO.igreja}" data-contato="igreja">Igreja Renovar em Cristo</a></li>
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
atualizarContatosNaTela();

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
   Nao ha servidor: o envio abre a conversa no WhatsApp da equipe
   (CONTATO.whatsapp) com a mensagem pronta. Sem WhatsApp configurado,
   abre o programa de e-mail.
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

        // Numero do link do WhatsApp do rodape (https://wa.me/55...)
        const numero = (/wa\.me\/(\d{10,15})/.exec(CONTATO.whatsapp) || [])[1];
        if (numero) {
            const url = `https://wa.me/${numero}?text=` + encodeURIComponent(`*${form.dataset.assunto}*\n\n` + linhas.join('\n'));
            // Aba nova; bloqueada (alguns celulares), abre nesta mesma
            const aba = window.open(url, '_blank');
            if (aba) aba.opener = null; else window.location.href = url;
            retorno.textContent = 'Abrimos o WhatsApp com a mensagem pronta. Confira e toque em enviar para concluir.';
            return;
        }
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
        const grade = document.getElementById('noticias-lista');
        const aplicar = () => {
            document.querySelectorAll('#noticias-lista .noticia-card').forEach(card => {
                card.style.display = (cat === 'todas' || card.dataset.cat === cat) ? '' : 'none';
            });
            // A faixa volta ao comeco e as setas se ajustam ao que sobrou
            if (grade) { grade.scrollLeft = 0; grade.dispatchEvent(new Event('scroll')); }
        };

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
        beneficios: ['Devocionais on-line e mensais', 'Acesso presencial e on-line aos workshops', 'Divulgação da sua empresa', 'Acompanhamento pastoral']
    },
    {
        id: 'construtor', nome: 'Construtor', minimo: 500, faixa: 'De R$ 500 a R$ 1.000 por mês',
        beneficios: ['Devocionais on-line e mensais', 'Links dos workshops']
    },
    {
        id: 'semeador', nome: 'Semeador', minimo: 0.01, faixa: 'De R$ 100 a R$ 500 por mês',
        beneficios: ['Devocionais on-line e mensais']
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
            // Copia local da biblioteca (bibliotecas/supabase, versao 2.45.4):
            // o login nao depende de codigo servido por terceiros
            await carregarScript('bibliotecas/supabase/supabase.js?v=2.45.4');
            // Duas chamadas ao mesmo tempo esperam o mesmo script: so a
            // primeira cria o cliente
            this._cliente ||= window.supabase.createClient(CONTAS.url, CONTAS.chavePublica);
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
    async entrar(email, senha, valorDemo, captchaToken) {
        if (this.MODO_DEMO) {
            const valor = Number(valorDemo) || 0;
            return { email, nome: '', valor };
        }
        const sb = await this.cliente();
        const { data, error } = await sb.auth.signInWithPassword({ email, password: senha, options: { captchaToken } });
        if (error) throw new Error('E-mail ou senha incorretos.');
        return this.perfil(sb, data.user);
    },

    // Cadastro pelo "Faca parte". Em demonstracao NAO e enviado a lugar
    // nenhum: so abre a sessao com nome e e-mail. Com contas reais, os dados
    // vao junto da conta e o banco cria a linha em "mantenedores" (gatilho
    // em schema.sql); o nivel so aparece quando a contribuicao for aprovada.
    async cadastrar(dados, captchaToken) {
        if (this.MODO_DEMO) return { nome: dados.nome, email: dados.email };
        const sb = await this.cliente();
        const { senha, ...perfil } = dados;
        const { data, error } = await sb.auth.signUp({
            email: dados.email, password: senha,
            options: { data: perfil, emailRedirectTo: new URL('portal.html', location.href).href, captchaToken }
        });
        if (error) throw new Error(error.message.includes('registered') ? 'Este e-mail já tem cadastro. Entre na Área do Mantenedor.' : 'Não foi possível concluir o cadastro.');
        // Confirmacao de e-mail ligada: a conta so abre depois do link do
        // e-mail. O cadastro ja esta feito; quem chama segue para o pagamento.
        if (!data.session) return null;
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
            senhaCriada();
        }
        const novo = { ...atual, senhaProvisoria: false };
        this.salvar(novo);
        return novo;
    },

    // Esqueci minha senha: o Supabase manda o link; ao abrir, a pessoa cai
    // no portal ja logada, com o formulario de senha nova em destaque
    async esqueciSenha(email, captchaToken, pagina = 'portal.html') {
        if (this.MODO_DEMO) throw new Error('Em demonstração não há e-mail de troca de senha. Com as contas ligadas, o link chega no e-mail informado.');
        const sb = await this.cliente();
        // Sem #: o Supabase poe o login depois de um # no endereco de volta
        // (com type=recovery), e um segundo # impede o cliente de le-lo
        const destino = new URL(pagina, location.href);
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: destino.href, captchaToken });
        // 429: o Supabase so manda um link por minuto para o mesmo e-mail
        if (error) throw new Error(error.status === 429
            ? 'Já enviamos um link há pouco. Confira a caixa de entrada e o spam, ou espere 1 minuto para pedir outro.'
            : 'Não foi possível enviar agora. Tente de novo em alguns minutos.');
    },

    sessao() {
        try { return JSON.parse(sessionStorage.getItem(this.CHAVE)); } catch { return null; }
    },

    salvar(usuario) {
        try { sessionStorage.setItem(this.CHAVE, JSON.stringify(usuario)); } catch { /* sem storage: sessao so dura a pagina */ }
    },

    // Encerra a sessao no servidor (invalida o login em todos os aparelhos)
    // e espera a resposta: so depois a tela volta ao login
    async sair() {
        try { sessionStorage.removeItem(this.CHAVE); } catch { /* nada a limpar */ }
        try { localStorage.removeItem(CHAVE_EDITOR); } catch { /* nada a limpar */ }
        if (this.MODO_DEMO) return;
        const sb = this._cliente || (this.temLoginGuardado() ? await this.cliente() : null);
        if (!sb) return;
        const { error } = await sb.auth.signOut();
        // Sem resposta do servidor: ao menos apaga o login deste navegador
        if (error) await sb.auth.signOut({ scope: 'local' });
    },

    // Publicacoes da pagina de noticias (so para quem entrou)
    async noticias() {
        const sb = await this.cliente();
        const { data, error } = await sb.from('noticias').select('categoria, titulo, resumo, imagem, link, publicado_em')
            .eq('publicada', true).order('publicado_em', { ascending: false }).limit(60);
        if (error) throw error;
        return data;
    },

    // Ha login do Supabase guardado neste navegador? Ou chegando agora pelo
    // link de um e-mail (troca de senha, convite): vem no endereco e o
    // cliente so o guarda depois de carregado
    temLoginGuardado() {
        if (/access_token=/.test(location.hash)) return true;
        try {
            for (let i = 0; i < localStorage.length; i++) if (/^sb-.*-auth-token$/.test(localStorage.key(i))) return true;
        } catch { /* sem storage */ }
        return false;
    }
};

// Link de "Esqueci minha senha" (ou do convite): o login que ele traz so serve para criar a
// senha nova, na propria pagina do link. Saiu dela (ou recarregou) sem
// salvar a senha? Esse login e apagado deste navegador antes de qualquer
// pagina usa-lo. Salvar a senha tira a marca (senhaCriada).
const CHAVE_SENHA_PENDENTE = 'conesul-senha-pendente';
const senhaCriada = () => { try { localStorage.removeItem(CHAVE_SENHA_PENDENTE); } catch { /* sem storage */ } };
if (!PORTAL.MODO_DEMO) try {
    if (/type=(recovery|invite)/.test(location.hash)) localStorage.setItem(CHAVE_SENHA_PENDENTE, '1');
    else if (localStorage.getItem(CHAVE_SENHA_PENDENTE)) {
        senhaCriada();
        Object.keys(localStorage).filter(k => /^sb-.*-auth-token$/.test(k)).forEach(k => localStorage.removeItem(k));
        try { sessionStorage.removeItem(PORTAL.CHAVE); } catch { /* nada a limpar */ }
    }
} catch { /* sem storage */ }

// Entrou pela pagina de alteracoes (admin.html)? Guarda o e-mail de quem
// edita. Sozinha nao libera nada: com contas ligadas, o banco ainda confere
// se a conta esta na tabela "equipe" antes de mostrar a barra.
const CHAVE_EDITOR = 'conesul-editor';
const editorLocal = () => { try { return localStorage.getItem(CHAVE_EDITOR) || ''; } catch { return ''; } };
// A barra Editar so aparece na pagina aberta pela lista de admin.html
// (?editar no endereco). Navegando pelo site normalmente, quem edita ve o
// mesmo que o visitante.
const ABERTA_PARA_EDITAR = new URLSearchParams(location.search).has('editar');

// Carrega um script do proprio site uma vez so
const scriptsCarregados = {};
function carregarScript(src) {
    if (!scriptsCarregados[src]) scriptsCarregados[src] = new Promise((ok, falha) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = ok;
        s.onerror = () => { delete scriptsCarregados[src]; falha(new Error('Não foi possível carregar a página. Verifique a conexão e tente de novo.')); };
        document.head.appendChild(s);
    });
    return scriptsCarregados[src];
}

// ---------- CAPTCHA (Cloudflare Turnstile) ----------
// So com contas reais e CONTAS.captcha preenchido. Poe a caixa "Confirme
// que voce e humano" antes do botao de enviar de cada formulario de acesso
// e entrega o comprovante (vale uma vez) para o Supabase conferir.
const CAPTCHA = {
    ativo: !!CONTAS.captcha && !PORTAL.MODO_DEMO,
    preparar(form) {
        if (!this.ativo || !form || form.querySelector('.cf-turnstile')) return;
        const caixa = document.createElement('div');
        caixa.className = 'cf-turnstile campo campo-largo';
        caixa.dataset.sitekey = CONTAS.captcha;
        caixa.dataset.language = 'pt-br';
        const botao = form.querySelector('[type="submit"]');
        (botao.closest('.campo') || botao).before(caixa);
        if (!document.querySelector('script[src*="challenges.cloudflare.com"]')) {
            const s = document.createElement('script');
            s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            s.async = true;
            document.head.appendChild(s);
        }
    },
    // Comprovante do formulario; vazio = a pessoa ainda nao confirmou
    token(form) {
        if (!this.ativo) return undefined;
        const t = form.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!t) throw new Error('Confirme que você não é um robô (a caixa acima do botão).');
        return t;
    },
    // Depois de cada tentativa o comprovante vence: pede outro
    reiniciar(form) {
        if (this.ativo && window.turnstile) {
            const caixa = form.querySelector('.cf-turnstile');
            if (caixa) window.turnstile.reset(caixa);
        }
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

// Endereco vindo do banco: so http(s), nunca "javascript:"
const enderecoSeguro = (url) => {
    try { const u = new URL(url, location.href); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; }
};
const novoElemento = (tag, classe, texto) => {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
};

// Publicacoes de noticias: vem do banco, nunca do HTML (que e publico)
// Cartao de uma noticia (pagina de noticias e faixa da Area do Mantenedor)
const CATEGORIAS_NOTICIAS = {
    diario: 'Diário de Campo', noticias: 'Notícias da Missão', historias: 'Histórias e Testemunhos',
    projetos: 'Projetos e Expansão', contas: 'Prestação de Contas'
};
function cartaoNoticia(n) {
    const artigo = novoElemento('article', 'noticia-card');
    artigo.dataset.cat = n.categoria;
    const foto = novoElemento('div', 'noticia-imagem');
    const src = n.imagem && enderecoSeguro(n.imagem);
    if (src) { const img = novoElemento('img'); img.src = src; img.alt = ''; img.loading = 'lazy'; foto.append(img); }
    else foto.textContent = n.categoria === 'contas' ? 'Documento' : 'Foto da publicação';
    const corpo = novoElemento('div', 'noticia-corpo');
    const data = n.publicado_em ? ' · ' + new Date(n.publicado_em).toLocaleDateString('pt-BR') : '';
    corpo.append(novoElemento('span', 'noticia-cat', (CATEGORIAS_NOTICIAS[n.categoria] || '') + data), novoElemento('h3', '', n.titulo), novoElemento('p', '', n.resumo));
    const href = n.link && enderecoSeguro(n.link);
    if (href) {
        const a = novoElemento('a', 'btn btn-secondary', 'Ler notícia');
        a.href = href; a.target = '_blank'; a.rel = 'noopener';
        corpo.append(a);
    }
    artigo.append(foto, corpo);
    return artigo;
}
// Faixa de noticias que desliza para o lado: setas (botoes [data-faixa]
// com -1 ou 1) andam um cartao por vez e se apagam no comeco e no fim
function ativarFaixa(faixa, botoes) {
    const atualizar = () => {
        const fim = faixa.scrollWidth - faixa.clientWidth - 2;
        botoes.forEach(b => { b.disabled = b.dataset.faixa === '-1' ? faixa.scrollLeft <= 0 : faixa.scrollLeft >= fim; });
    };
    botoes.forEach(b => b.addEventListener('click', () => {
        const cartao = [...faixa.children].find(c => c.offsetWidth);
        const passo = (cartao?.offsetWidth || 300) + 24;
        faixa.scrollBy({ left: Number(b.dataset.faixa) * passo, behavior: MOVIMENTO_REDUZIDO ? 'auto' : 'smooth' });
    }));
    faixa.addEventListener('scroll', atualizar, { passive: true });
    // No computador: arrastar com o mouse (sem barra de rolagem a vista).
    // Um arrasto de verdade nao conta como clique no link do cartao
    let inicio = null, arrastou = false;
    faixa.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        inicio = { x: e.clientX, scroll: faixa.scrollLeft };
        arrastou = false;
    });
    window.addEventListener('pointermove', (e) => {
        if (!inicio) return;
        const dx = e.clientX - inicio.x;
        if (!arrastou && Math.abs(dx) < 5) return;
        if (!arrastou) { arrastou = true; faixa.classList.add('arrastando'); }
        faixa.scrollLeft = inicio.scroll - dx;
    });
    window.addEventListener('pointerup', () => {
        if (!inicio) return;
        inicio = null;
        if (!arrastou) return;
        faixa.classList.remove('arrastando');
        // Encaixa no cartao mais proximo ao soltar
        const cartao = [...faixa.children].find(c => c.offsetWidth);
        const passo = (cartao?.offsetWidth || 300) + 24;
        faixa.scrollTo({ left: Math.round(faixa.scrollLeft / passo) * passo, behavior: MOVIMENTO_REDUZIDO ? 'auto' : 'smooth' });
    });
    faixa.addEventListener('click', (e) => { if (arrastou) { e.preventDefault(); e.stopPropagation(); arrastou = false; } }, true);
    faixa.addEventListener('dragstart', (e) => e.preventDefault());
    // Recalcula quando a faixa aparece (pode comecar escondida) ou muda de tamanho
    if ('ResizeObserver' in window) new ResizeObserver(atualizar).observe(faixa);
    else window.addEventListener('resize', atualizar);
    return atualizar;
}

// Demonstracao (sem banco): cards de exemplo, so para ver o layout
const noticiasExemplo = () => Object.keys(CATEGORIAS_NOTICIAS).map(categoria => ({
    categoria, titulo: '[Título da publicação]', resumo: '[Resumo de duas ou três linhas da publicação.]'
}));

if (PAGINA === 'noticias') {
    const lista = document.getElementById('noticias-lista');
    const aviso = document.getElementById('noticias-aviso');
    const atualizarSetasNoticias = ativarFaixa(lista, [...document.querySelectorAll('[data-faixa]')]);
    const card = cartaoNoticia;
    const mostrarAviso = (texto) => { aviso.hidden = !texto; aviso.textContent = texto || ''; };

    if (PORTAL.MODO_DEMO) {
        lista.replaceChildren(...noticiasExemplo().map(card));
        atualizarSetasNoticias();
        mostrarAviso('Modelo de layout. Com as contas ligadas, as publicações vêm do banco de dados e só aparecem para quem entrou na Área do Mantenedor.');
    } else {
        PORTAL.iniciar()
            .then(u => {
                if (!u) { location.replace('portal.html'); return null; }
                return PORTAL.noticias();
            })
            .then(itens => {
                if (!itens) return;
                lista.replaceChildren(...itens.map(card));
                atualizarSetasNoticias();
                mostrarAviso(itens.length ? '' : 'Ainda não há publicações. Volte em breve.');
            })
            .catch(() => mostrarAviso('Não foi possível carregar as publicações agora. Recarregue a página.'));
    }
}

if (PAGINA === 'portal') {
    // Veio pelo link de "Esqueci minha senha" ou do convite? (o Supabase poe
    // type=recovery ou type=invite no endereco; guardar antes de o cliente
    // limpar o endereco)
    const veioTrocarSenha = /type=recovery/.test(location.hash);
    const veioConvite = /type=invite/.test(location.hash);
    // Link vencido ou ja usado (ex.: pediu dois e clicou no primeiro): o
    // Supabase volta com error_code no endereco, sem login
    const linkInvalido = /error_code=otp_expired|error=access_denied/.test(location.hash);
    // Endereco antigo do cadastro (portal.html#cadastro) leva a pagina nova
    const irParaCadastro = () => { if (location.hash === '#cadastro') location.replace('fazer-parte.html'); };
    irParaCadastro();
    window.addEventListener('hashchange', irParaCadastro);

    const telaLogin = document.getElementById('tela-login');
    const telasPortal = ['tela-portal-topo', 'tela-portal-nivel', 'tela-portal-summit', 'tela-portal', 'tela-portal-senha'].map(id => document.getElementById(id));
    // Telas que dependem do nivel: so aparecem para quem tem esse nivel
    const SO_NIVEL = { 'tela-portal-summit': ['expansor'] };

    // Seu nivel, beneficios e resumo da contribuicao
    function mostrarNivel(usuario) {
        const nivel = nivelPorValor(usuario.valor);
        const selo = document.getElementById('usuario-nivel');
        selo.hidden = !nivel;
        if (nivel) selo.textContent = `Mantenedor ${nivel.nome}`;
        document.getElementById('nivel-titulo').textContent = nivel ? `Você é ${nivel.nome}.` : 'Escolha como contribuir.';
        document.getElementById('nivel-resumo').textContent = nivel
            ? 'Veja seus benefícios:'
            : 'Seu cadastro está feito. O nível é definido pelo valor da contribuição mensal: quando o pagamento for confirmado, nossa equipe entra em contato pelo WhatsApp.';
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
            // Aberta pela lista do /admin: a equipe ve (e edita) todas, com
            // a etiqueta de quem ve. O texto delas ja e publico no HTML.
            const equipeEditando = ABERTA_PARA_EDITAR && !!editorLocal();
            if (exige) {
                t.hidden = !equipeEditando && (!nivel || !exige.includes(nivel.id));
                t.classList.toggle('so-nivel-edicao', equipeEditando);
                if (equipeEditando) t.dataset.soNivel = 'Visível só para ' + exige.map(id => NIVEIS.find(n => n.id === id)?.nome + 'es').join(' e ');
            }
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

    // Faixa com as ultimas noticias (desliza para o lado)
    const faixa = document.getElementById('faixa-noticias');
    const avisoFaixa = document.getElementById('faixa-noticias-aviso');
    let faixaCarregada = false;
    async function carregarFaixa() {
        if (faixaCarregada || !faixa) return;
        faixaCarregada = true;
        const avisar = (texto) => { avisoFaixa.hidden = !texto; avisoFaixa.textContent = texto || ''; };
        try {
            const itens = PORTAL.MODO_DEMO ? noticiasExemplo() : (await PORTAL.noticias()).slice(0, 10);
            faixa.replaceChildren(...itens.map(cartaoNoticia));
            avisar(itens.length ? '' : 'Ainda não há notícias. Volte em breve.');
        } catch {
            faixaCarregada = false;
            avisar('Não foi possível carregar as notícias agora. Recarregue a página.');
        }
        atualizarSetas();
    }
    const atualizarSetas = faixa ? ativarFaixa(faixa, [...document.querySelectorAll('[data-faixa]')]) : () => {};

    const mostrar = (usuario, animar = false) => {
        atualizarMenu(!!usuario);
        if (usuario) carregarFaixa();
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

    // Veio pelo link do e-mail (troca de senha ou convite): mostra so o
    // formulario de senha; o resto do portal aparece depois de salvar
    let criandoSenha = false;
    const telaSenha = document.getElementById('tela-portal-senha');
    mostrar(PORTAL.sessao());
    // Contas reais: confere a sessao no servidor (e a do link do e-mail)
    if (!PORTAL.MODO_DEMO) PORTAL.iniciar().then(u => {
        mostrar(u);
        if (u && (veioTrocarSenha || veioConvite)) {
            criandoSenha = true;
            telasPortal.forEach(t => { t.hidden = t !== telaSenha; });
            document.getElementById('senha-titulo').textContent = veioConvite ? 'Crie sua senha.' : 'Crie sua nova senha.';
            document.getElementById('senha-retorno').textContent = 'Digite a senha nova duas vezes e clique em "Salvar nova senha".';
            window.scrollTo(0, 0);
            document.getElementById('s-nova').focus();
        }
    }).catch(() => {});

    const formLogin = document.getElementById('form-login');
    CAPTCHA.preparar(formLogin);
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
                new URLSearchParams(location.search).get('demo'),
                CAPTCHA.token(formLogin)
            );
            PORTAL.salvar(usuario);
            formLogin.reset();
            mostrar(usuario, true);
        } catch (erro) {
            retorno.textContent = erro.message;
        }
        CAPTCHA.reiniciar(formLogin);
    });

    // Esqueci minha senha
    const formEsqueci = document.getElementById('form-esqueci');
    CAPTCHA.preparar(formEsqueci);
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
        // Um pedido por vez: cada link novo cancela o anterior
        const botao = formEsqueci.querySelector('[type="submit"]');
        botao.disabled = true;
        retorno.textContent = 'Enviando…';
        try {
            await PORTAL.esqueciSenha(document.getElementById('e-email').value.trim(), CAPTCHA.token(formEsqueci));
            retorno.textContent = 'Pronto! Se este e-mail tiver cadastro, o link para criar uma senha nova chega em alguns minutos. Use o e-mail mais recente: cada pedido cancela o link anterior.';
        } catch (erro) {
            retorno.textContent = erro.message;
        }
        botao.disabled = false;
        CAPTCHA.reiniciar(formEsqueci);
    });
    if (linkInvalido) {
        trocarForm(true);
        document.getElementById('esqueci-retorno').textContent = 'Este link expirou ou já foi usado (cada pedido novo cancela o anterior). Peça outro abaixo e use o e-mail mais recente.';
    }

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
            retorno.textContent = nova.validity.tooShort || nova.validity.valueMissing ? 'A senha precisa ter pelo menos 8 caracteres.' : 'As duas senhas não conferem.';
            return;
        }
        try {
            await PORTAL.trocarSenha(nova.value);
            formSenha.reset();
            formSenha.classList.remove('validar');
            document.getElementById('aviso-senha').hidden = true;
            document.getElementById('senha-titulo').textContent = 'Trocar senha.';
            if (criandoSenha) {
                // Senha criada pelo link: abre a Area do Mantenedor
                criandoSenha = false;
                retorno.textContent = '';
                mostrar(PORTAL.sessao(), true);
                const aviso = document.getElementById('aviso-senha');
                aviso.textContent = 'Senha salva! Das próximas vezes, entre com o seu e-mail e esta senha.';
                aviso.hidden = false;
                return;
            }
            retorno.textContent = PORTAL.MODO_DEMO ? 'Demonstração: com as contas ligadas, a senha nova passa a valer no próximo login.' : 'Senha alterada. Use a nova senha no próximo login.';
        } catch (erro) {
            retorno.textContent = erro.message;
        }
    });

    document.getElementById('btn-sair').addEventListener('click', async (e) => {
        const botao = e.currentTarget;
        botao.disabled = true;
        try { await PORTAL.sair(); } catch { /* a sessao local ja foi apagada */ }
        botao.disabled = false;
        mostrar(null, true);
    });
}

/* =========================================================
   FACA PARTE (fazer-parte.html): cadastro de mantenedor.
   Ao concluir, segue para o link de pagamento (com ou sem plano).
   ========================================================= */
if (PAGINA === 'fazer-parte') {
    const formCadastro = document.getElementById('form-cadastro');

    // Veio de um plano? Mostra qual. Com ou sem plano, ao concluir segue
    // para o pagamento
    const chavePlano = new URLSearchParams(location.search).get('plano');
    const nivelPlano = NIVEIS.find(n => n.id === PLANOS[chavePlano]);
    if (nivelPlano) {
        document.getElementById('plano-escolhido').hidden = false;
        document.getElementById('plano-nome').textContent = `Plano ${nivelPlano.nome}`;
        document.getElementById('plano-faixa').textContent = `· ${nivelPlano.faixa}`;
    }
    // Quem ja tem cadastro (e entrou) vai direto ao pagamento
    const ja = PORTAL.sessao();
    if (ja) {
        formCadastro.hidden = true;
        document.querySelector('.acesso-alternativo').hidden = true;
        document.getElementById('plano-ja-cadastrado').hidden = false;
        document.getElementById('plano-ja-email').textContent = ja.email;
        const ir = document.getElementById('plano-ir-pagamento');
        if (LINKS_PAGAMENTO.unico) ir.href = LINKS_PAGAMENTO.unico;
        else { ir.setAttribute('aria-disabled', 'true'); document.getElementById('plano-sem-link').hidden = false; }
    }
    const cpf = document.getElementById('c-cpf');
    const telefone = document.getElementById('c-telefone');
    CAPTCHA.preparar(formCadastro);

    // Celular com DDD: (49) 99999-9999 enquanto digita
    telefone.addEventListener('input', () => {
        const d = telefone.value.replace(/\D/g, '').slice(0, 11);
        const resto = d.slice(2);
        telefone.value = d.length <= 2 ? d
            : `(${d.slice(0, 2)}) ` + (resto.length > 4 ? `${resto.slice(0, -4)}-${resto.slice(-4)}` : resto);
        telefone.setCustomValidity('');
    });

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
        telefone.setCustomValidity(telefone.value && !/^\d{10,11}$/.test(telefone.value.replace(/\D/g, '')) ? 'Celular inválido.' : '');
        // Respondeu sobre fe e igreja? Entao precisa da autorizacao propria
        const consentimentoFe = document.getElementById('c-consentimento-fe');
        consentimentoFe.required = !!formCadastro.querySelector('input[name="cristao"]:checked, input[name="congrega"]:checked')
            || !!document.getElementById('c-igreja').value.trim();

        if (!formCadastro.checkValidity()) {
            const invalido = formCadastro.querySelector(':invalid');
            retorno.textContent = invalido === cpf && cpf.value
                ? 'Confira o CPF: os números não formam um CPF válido.'
                : invalido === telefone && telefone.value
                    ? 'Confira o celular: informe o DDD e o número, ex.: (49) 99999-9999.'
                : invalido?.id === 'c-senha' && invalido.value
                    ? 'A senha precisa ter pelo menos 8 caracteres.'
                    : invalido === consentimentoFe
                        ? 'Para enviar as respostas sobre fé e igreja, marque a autorização logo abaixo delas (ou deixe-as em branco).'
                        : 'Preencha todos os campos e marque a autorização.';
            invalido?.focus();
            return;
        }

        const valor = (id) => document.getElementById(id).value.trim();
        // Sem a autorizacao de dado sensivel, fe e igreja nao saem do navegador
        const fe = consentimentoFe.checked;
        const escolha = (nome) => {
            const r = formCadastro.querySelector(`input[name="${nome}"]:checked`);
            return fe && r ? r.value === 'sim' : null;
        };
        try {
            const usuario = await PORTAL.cadastrar({
                nome: valor('c-nome'),
                cpf: cpf.value.replace(/\D/g, ''),
                nascimento: valor('c-nascimento'),
                naturalidade: valor('c-naturalidade'),
                moradia: valor('c-moradia'),
                cristao: escolha('cristao'),
                congrega: escolha('congrega'),
                igreja: fe ? valor('c-igreja') : '',
                telefone: telefone.value.replace(/\D/g, ''),
                email: valor('c-email'),
                senha: document.getElementById('c-senha').value
            }, CAPTCHA.token(formCadastro));
            // Sem sessao = falta confirmar o e-mail (o cadastro ja esta feito)
            if (usuario) PORTAL.salvar(usuario);
            // Lido agora: o Painel pode ter trocado o link depois de a pagina abrir
            if (LINKS_PAGAMENTO.unico) { location.href = LINKS_PAGAMENTO.unico; return; }
            retorno.textContent = 'Cadastro concluído! O link de pagamento ainda não está disponível. Avisaremos em breve.';
        } catch (erro) {
            retorno.textContent = erro.message;
            CAPTCHA.reiniciar(formCadastro);
        }
    });
}

/* =========================================================
   MODO EDICAO
   - Textos: qualquer texto visivel (titulos, paragrafos, botoes, numeros,
     menu e rodape). Negrito e italico (Ctrl+B / Ctrl+I) ficam; o resto da
     formatacao e limpo ao salvar.
   - Links: clicar num link ou botao mostra para onde ele leva, para trocar.
   - Blocos: ocultar, apagar, subir, descer, duplicar e adicionar secoes
     novas de texto, imagem ou video (YouTube) abaixo de uma secao.
   - Imagens: clicar numa imagem troca o arquivo.

   Quem edita: so quem entrou por admin.html (com contas ligadas, e esta
   na tabela "equipe").
   - Demonstracao (sem CONTAS): as mudancas ficam SO NO NAVEGADOR de quem
     editou; "Baixar edicoes" gera o arquivo para publicar.
   - Contas ligadas: rascunho neste navegador ate "Publicar", que grava no
     banco (site_edicoes) e vale para todos; "Historico" volta a uma versao.

   Menu e rodape sao os mesmos em todas as paginas: o que muda neles fica
   num estado proprio ("_geral"), aplicado no site inteiro.
   Estado de uma pagina (versao 2):
     { versao, textos: {chave: html}, links: {chave: href}, clones, novos,
       ordem, ocultos, apagados, imagens }
   ========================================================= */
let editMode = false;

// Areas que scripts preenchem ou trocam sozinhos (mapa, loja, noticias,
// dados do login...): editar ali nao adiantaria
const NAO_EDITAVEL = [
    '#barra-edicao', '#ctrl-bloco', '#ctrl-link', '.painel-historico', 'script', 'style', 'noscript', 'svg',
    'select', 'option', 'textarea', 'input', 'iframe', 'button', '.so-edicao',
    '#produtos', '.leaflet-container', '#mapa-leaflet', '.card-info', '#locais-lista', '#lista-territorios',
    '#noticias-lista', '#noticias-aviso', '#faixa-noticias', '#faixa-noticias-aviso',
    '#nivel-titulo', '#nivel-resumo', '#nivel-beneficios', '#nivel-acoes', '#contribuicao-resumo',
    '#usuario-email', '#usuario-nivel', '#plano-nome', '#plano-faixa', '#plano-ja-email', '#cadastro-lead',
    '#senha-titulo', '#editor-email', '#editor-senha-titulo', '.form-retorno', '[role="status"]', '.importar-aviso',
    '.bandeira-sprite'
].join(', ');
// Formatacao que pode ficar dentro de um texto editado: negrito, italico,
// quebra de linha, o destaque colorido dos titulos e a setinha dos botoes
const TAGS_TEXTO = new Set(['B', 'STRONG', 'I', 'EM', 'BR']);
const spanPermitido = (el) => el.tagName === 'SPAN'
    && [...el.attributes].every(a => (a.name === 'class' && a.value === 'realce') || (a.name === 'aria-hidden' && a.value === 'true'))
    && el.attributes.length > 0;
// Elemento com id e onde um script escreve (ex.: o e-mail de quem entrou):
// o texto em volta dele nao vira editavel, senao o editor salvaria o que o
// script pos ali como se fosse uma edicao
const formatacao = (el) => !el.id && !el.matches(NAO_EDITAVEL) && (TAGS_TEXTO.has(el.tagName) || spanPermitido(el));

// Blocos que o modo edicao deixa mover, ocultar e apagar.
// SECOES: tambem recebem secoes novas abaixo. ITENS: tambem duplicar.
const SECOES = 'section';
const ITENS = [
    '.card-acao', '.beneficio', '.mvp-item', '.etapa', '.barreira', '.campanha-card', '.pilar',
    '.numero-item', '.agenda-item', '.noticia-card', '.territorio', '.texto-bloco p', '.destaque',
    '.campanha-lista li', '.campanha-beneficios li', '.lista-destaques li', '.meses-lista li', '.cta-buttons .btn'
].join(', ');

// O GitHub Pages abre a pagina tambem sem o .html (dominio/seja-mantenedor):
// as edicoes ficam sempre no nome do arquivo
const PAGINA_ARQUIVO = (location.pathname.split('/').pop() || 'index').replace(/(\.html)?$/, '.html');
const GERAL = '_geral';
const chaveArmazenada = (escopo) => 'conesul-edicoes::' + (escopo === 'g' ? GERAL : PAGINA_ARQUIVO);
const CHAVE_EDICOES = chaveArmazenada('p');
const blocos = () => [...document.querySelectorAll(`${SECOES}, ${ITENS}`)].filter(el => !el.closest('header, footer, ' + NAO_EDITAVEL));
const acharBloco = chave => blocos().find(el => el.dataset.bloco === chave);
const escopoDe = (el) => el.closest('header, footer') ? 'g' : 'p';

function lerEdicoes(escopo = 'p') {
    try { return JSON.parse(localStorage.getItem(chaveArmazenada(escopo))) || {}; } catch { return {}; }
}

// ---------- Limpeza do que vem salvo (o banco e publico para leitura) ----------
// Texto: so negrito, italico e quebra de linha; todo o resto vira texto
function limparHtml(html) {
    const modelo = document.createElement('template');
    modelo.innerHTML = String(html ?? '');
    const limpar = (no) => {
        [...no.childNodes].forEach(filho => {
            if (filho.nodeType === Node.TEXT_NODE) return;
            if (filho.nodeType !== Node.ELEMENT_NODE || /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|IFRAME|OBJECT|SVG|MATH)$/i.test(filho.tagName)) { filho.remove(); return; }
            limpar(filho);
            if (spanPermitido(filho)) return;
            if (TAGS_TEXTO.has(filho.tagName)) {
                [...filho.attributes].forEach(a => filho.removeAttribute(a.name));
            } else {
                // Tag nao permitida (div do Enter, span colado...): fica so o conteudo
                if (/^(DIV|P|LI)$/.test(filho.tagName) && filho.previousSibling) filho.before(document.createElement('br'));
                filho.replaceWith(...filho.childNodes);
            }
        });
    };
    limpar(modelo.content);
    return modelo.innerHTML.replace(/(<br>)+$/, '');
}
// Link: endereco do site, http(s), e-mail, telefone ou ancora. Nunca "javascript:"
function linkSeguro(href) {
    const v = String(href ?? '').trim();
    if (!v) return '';
    // Caminho dentro do site (contato.html, docs/x.pdf, #campanha...); "//" levaria para fora
    if (!v.startsWith('//') && /^(#[\w-]*|[\w./-]+(\?[^\s"'<>]*)?(#[\w-]*)?)$/.test(v)) return v;
    try {
        const u = new URL(v);
        return /^(https?|mailto|tel):$/.test(u.protocol) ? u.href : '';
    } catch { return ''; }
}
// Imagem: endereco http(s) ou imagem embutida (demonstracao)
const imagemSegura = (src) => /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(src) ? src : enderecoSeguro(src);
// Video do YouTube: o codigo de 11 caracteres, a partir de qualquer link
function codigoYoutube(url) {
    const v = String(url ?? '').trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    const m = v.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
    return m ? m[1] : '';
}

// ---------- Chaves estaveis ----------
// Cada bloco: o comeco do seu texto mais a ordem entre blocos de texto
// igual. Assim mudar a pagina nao faz uma edicao cair no lugar errado.
const contagem = {};
blocos().forEach(el => {
    const tipo = el.matches(ITENS) ? 'i' : 's';
    const assinatura = tipo + '|' + el.textContent.replace(/\s+/g, ' ').trim().slice(0, 80);
    contagem[assinatura] = (contagem[assinatura] || 0) + 1;
    el.dataset.bloco = assinatura + '|' + contagem[assinatura];
});

// Textos editaveis: elementos com texto proprio, so com formatacao simples
// dentro, e que nao estao dentro de outro texto editavel
function textosEm(raiz) {
    const achados = [];
    const visitar = (el) => {
        if (el.matches(NAO_EDITAVEL)) return;
        const textoProprio = [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (textoProprio && [...el.querySelectorAll('*')].every(formatacao)) { achados.push(el); return; }
        [...el.children].forEach(visitar);
    };
    [...raiz.children].forEach(visitar);
    return achados;
}
const originais = new WeakMap();   // texto (html limpo) original de cada elemento
function marcarTextos(raiz, prefixo) {
    const vistos = {};
    textosEm(raiz).forEach((el, i) => {
        let chave;
        if (prefixo) chave = prefixo + '>' + i;
        else {
            // Menu e rodape contam a parte: sao iguais em todas as paginas
            const assinatura = el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60);
            const conta = escopoDe(el) + assinatura;
            vistos[conta] = (vistos[conta] || 0) + 1;
            chave = 't|' + assinatura + '|' + vistos[conta];
        }
        el.dataset.txt = chave;
        if (!originais.has(el)) originais.set(el, limparHtml(el.innerHTML));
    });
}
// Links: endereco original mais a ordem entre links iguais
function marcarLinks(raiz, prefixo) {
    const vistos = {};
    [...raiz.querySelectorAll('a[href]')].forEach((a, i) => {
        if (a.closest(NAO_EDITAVEL) || a.matches('[data-pagamento], [data-contato]')) return;
        let chave;
        if (prefixo) chave = prefixo + '>L' + i;
        else {
            const href = a.getAttribute('href');
            const conta = escopoDe(a) + href;
            vistos[conta] = (vistos[conta] || 0) + 1;
            chave = 'l|' + href + '|' + vistos[conta];
        }
        a.dataset.link = chave;
        if (!a.dataset.hrefOriginal) a.dataset.hrefOriginal = a.getAttribute('href');
    });
}
// Imagens fixas: arquivo original + ordem entre imagens do mesmo arquivo
const contagemImg = {};
document.querySelectorAll('section img').forEach(img => {
    if (img.closest('header, footer, ' + NAO_EDITAVEL)) return;
    const arquivo = img.getAttribute('src') || '';
    contagemImg[arquivo] = (contagemImg[arquivo] || 0) + 1;
    img.dataset.img = arquivo + '|' + contagemImg[arquivo];
});
marcarTextos(document.body);
marcarLinks(document.body);

const elementosEditaveis = () => [...document.querySelectorAll('[data-txt]')];
const imagensEditaveis = () => [...document.querySelectorAll('img[data-img]')];

let clones = [];       // [{ id, de }]: copias de itens
let novos = [];        // [{ id, depois, tipo, fundo, video }]: secoes novas
let ordem = [];        // [{ bloco, antes | depois }]: blocos movidos, na ordem em que foram movidos
let ocultos = new Set();
let apagados = new Set();
let imagens = {};
let textosSalvos = { p: {}, g: {} };   // edicoes de texto que nao acharam lugar (preservadas)

function duplicarBloco(origem, id) {
    const copia = origem.cloneNode(true);
    [copia, ...copia.querySelectorAll('*')].forEach(el => {
        el.classList.remove('revelar', 'visivel', 'bloco-alvo');
        el.removeAttribute('id');
        el.removeAttribute('contenteditable');
        el.style.removeProperty('--atraso');
        el.style.removeProperty('outline');
        el.style.removeProperty('outline-offset');
        delete el.dataset.txt;
        delete el.dataset.link;
    });
    copia.dataset.bloco = 'c:' + id;
    copia.classList.remove('bloco-oculto');
    origem.after(copia);
    // A copia comeca com o texto original de quem copiou (nao o editado)
    const deOrigem = textosEm(origem);
    textosEm(copia).forEach((el, i) => {
        const orig = deOrigem[i];
        if (orig && originais.has(orig)) el.innerHTML = originais.get(orig);
        originais.set(el, limparHtml(el.innerHTML));
    });
    marcarTextos(copia, 'c:' + id);
    marcarLinks(copia, 'c:' + id);
    return copia;
}

// Secao nova (texto, imagem ou video) logo abaixo de outra secao
const IMAGEM_VAZIA = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="100%" height="100%" fill="#e9e4d4"/>'
    + '<text x="50%" y="50%" font-family="sans-serif" font-size="34" fill="#8a8670" text-anchor="middle">Clique para escolher a imagem</text></svg>');
function criarSecaoNova(n) {
    const ref = acharBloco(n.depois);
    if (!ref) return null;
    const sec = document.createElement('section');
    sec.className = (n.fundo === 'escura' ? 'sec-escura' : 'sec-clara') + ' secao-nova secao-' + n.tipo;
    sec.dataset.bloco = 'n:' + n.id;
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const titulo = Object.assign(document.createElement('h2'), { textContent: 'Novo título' });
    if (n.tipo === 'texto') {
        const texto = Object.assign(document.createElement('div'), { className: 'texto-bloco' });
        texto.append(Object.assign(document.createElement('p'), { textContent: 'Escreva aqui o texto desta seção.' }));
        wrap.append(titulo, texto);
    } else if (n.tipo === 'imagem') {
        const fig = document.createElement('figure');
        fig.className = 'secao-nova-figura';
        const img = Object.assign(document.createElement('img'), { src: IMAGEM_VAZIA, alt: '' });
        img.dataset.img = 'n:' + n.id + '|img';
        fig.append(img, Object.assign(document.createElement('figcaption'), { textContent: 'Legenda da imagem' }));
        wrap.append(titulo, fig);
    } else {
        const caixa = document.createElement('div');
        caixa.className = 'secao-nova-video';
        const codigo = codigoYoutube(n.video);
        if (codigo) {
            const quadro = document.createElement('iframe');
            quadro.src = `https://www.youtube-nocookie.com/embed/${codigo}`;
            quadro.title = 'Vídeo';
            quadro.loading = 'lazy';
            quadro.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
            quadro.referrerPolicy = 'strict-origin-when-cross-origin';
            caixa.append(quadro);
        } else caixa.append(Object.assign(document.createElement('p'), { className: 'secao-nova-sem-video', textContent: 'Vídeo ainda não escolhido.' }));
        const trocar = Object.assign(document.createElement('button'), { type: 'button', className: 'so-edicao', textContent: 'Trocar vídeo' });
        trocar.dataset.trocarVideo = n.id;
        wrap.append(titulo, caixa, trocar);
    }
    sec.append(wrap);
    ref.after(sec);
    marcarTextos(sec, 'n:' + n.id);
    return sec;
}

// Move um bloco para antes ou depois de outro do mesmo grupo
function moverBloco(op) {
    const el = acharBloco(op.bloco);
    const ref = acharBloco(op.antes || op.depois);
    if (!el || !ref || el === ref || el.parentElement !== ref.parentElement) return false;
    if (op.antes) ref.before(el); else ref.after(el);
    return true;
}
const irmaosBloco = (el) => [...el.parentElement.children].filter(f => f.dataset.bloco && blocos().includes(f));

// Aplica um estado salvo: 1) copias e secoes novas; 2) ordem; 3) textos;
// 4) links; 5) ocultos e apagados; 6) imagens
function aplicarEstado(estado, escopo = 'p') {
    estado = estado && typeof estado === 'object' ? estado : {};
    if (escopo === 'p') {
        clones = (Array.isArray(estado.clones) ? estado.clones : []).filter(c => {
            const origem = acharBloco(c.de);
            if (!origem || !/^[\w]+$/.test(c.id)) return false;
            duplicarBloco(origem, c.id);
            return true;
        });
        novos = (Array.isArray(estado.novos) ? estado.novos : []).filter(n =>
            /^[\w]+$/.test(n.id) && ['texto', 'imagem', 'video'].includes(n.tipo) && criarSecaoNova(n));
        ordem = (Array.isArray(estado.ordem) ? estado.ordem : []).filter(moverBloco);
    }
    // Textos. Formato antigo: { indice: { de, para } } com texto puro
    const daqui = elementosEditaveis().filter(el => escopoDe(el) === escopo);
    const textos = estado.textos && typeof estado.textos === 'object' ? estado.textos : {};
    const restantes = {};
    Object.entries(textos).forEach(([chave, valor]) => {
        if (valor && typeof valor === 'object' && 'de' in valor) {
            const el = daqui.find(e => !e.dataset.aplicado && e.innerText === valor.de);
            if (el) { el.innerText = String(valor.para ?? ''); el.dataset.aplicado = '1'; }
            return;
        }
        const el = daqui.find(e => e.dataset.txt === chave);
        if (el) el.innerHTML = limparHtml(valor);
        else restantes[chave] = valor;
    });
    daqui.forEach(el => delete el.dataset.aplicado);
    textosSalvos[escopo] = restantes;
    // Links
    const links = estado.links && typeof estado.links === 'object' ? estado.links : {};
    document.querySelectorAll('a[data-link]').forEach(a => {
        if (escopoDe(a) !== escopo || !(a.dataset.link in links)) return;
        const href = linkSeguro(links[a.dataset.link]);
        if (href) a.setAttribute('href', href);
    });
    if (escopo !== 'p') return;
    ocultos = new Set(Array.isArray(estado.ocultos) ? estado.ocultos : []);
    ocultos.forEach(chave => { const el = acharBloco(chave); if (el) el.classList.add('bloco-oculto'); });
    apagados = new Set(Array.isArray(estado.apagados) ? estado.apagados : []);
    apagados.forEach(chave => { const el = acharBloco(chave); if (el) el.remove(); });
    imagens = {};
    const salvas = estado.imagens && typeof estado.imagens === 'object' ? estado.imagens : {};
    imagensEditaveis().forEach(img => {
        const src = salvas[img.dataset.img] && imagemSegura(salvas[img.dataset.img]);
        if (src) { img.src = src; imagens[img.dataset.img] = src; }
    });
}

// Estado atual (o que mudou em relacao ao original), de um escopo
function estadoAtual(escopo = 'p') {
    const textos = { ...textosSalvos[escopo] };
    elementosEditaveis().forEach(el => {
        if (escopoDe(el) !== escopo) return;
        const atual = limparHtml(el.innerHTML);
        if (atual !== originais.get(el)) textos[el.dataset.txt] = atual;
        else delete textos[el.dataset.txt];
    });
    const links = {};
    document.querySelectorAll('a[data-link]').forEach(a => {
        if (escopoDe(a) === escopo && a.getAttribute('href') !== a.dataset.hrefOriginal) links[a.dataset.link] = a.getAttribute('href');
    });
    if (escopo !== 'p') return { versao: 2, textos, links };
    ocultos = new Set([...ocultos].filter(acharBloco));   // descarta ocultos que ja nao existem
    return { versao: 2, textos, links, clones, novos, ordem, ocultos: [...ocultos], apagados: [...apagados], imagens };
}
const estadoVazio = (e) => !Object.keys(e.textos || {}).length && !Object.keys(e.links || {}).length
    && !(e.clones || []).length && !(e.novos || []).length && !(e.ordem || []).length
    && !(e.ocultos || []).length && !(e.apagados || []).length && !Object.keys(e.imagens || {}).length;

// ---------- Publicacao (contas ligadas) ----------
const EDICAO = {
    editor: false,                    // conta logada esta na tabela "equipe"
    publicadoId: { p: null, g: null }, // versoes publicadas que estao no ar
    rascunho: { p: false, g: false },  // ha mudancas nao publicadas neste navegador
    cabecalhos() { return { apikey: CONTAS.chavePublica, Authorization: 'Bearer ' + CONTAS.chavePublica }; },

    // Versoes publicadas mais recentes desta pagina e do menu/rodape
    // (leitura publica, sem login)
    async publicado() {
        const lista = `(${[PAGINA_ARQUIVO, GERAL].map(p => `"${p}"`).join(',')})`;
        const url = `${CONTAS.url}/rest/v1/site_edicoes?pagina=in.${encodeURIComponent(lista)}&select=id,pagina,conteudo,criado_em&order=id.desc&limit=40`;
        const r = await fetch(url, { headers: this.cabecalhos() });
        if (!r.ok) throw new Error('site_edicoes: HTTP ' + r.status);
        const linhas = await r.json();
        return {
            p: linhas.find(l => l.pagina === PAGINA_ARQUIVO) || null,
            g: linhas.find(l => l.pagina === GERAL) || null
        };
    },

    // Ha alguem logado neste navegador? So entao vale carregar o cliente
    temLogin() { return PORTAL.temLoginGuardado(); },

    // A conta logada esta na tabela "equipe"? (quem responde e o banco)
    async verificarEquipe() {
        if (!this.temLogin()) return null;
        const sb = await PORTAL.cliente();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return null;
        const { data } = await sb.from('equipe').select('id').eq('id', session.user.id).maybeSingle();
        return data ? session.user : null;
    },

    // A barra de edicao so aparece para quem entrou por admin.html e e da
    // equipe (entrar pela Area do Mantenedor nao basta)
    async verificarEditor() {
        if (!editorLocal() || !ABERTA_PARA_EDITAR) return false;
        return !!(await this.verificarEquipe());
    },

    async publicar(estado, escopo = 'p') {
        const sb = await PORTAL.cliente();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) throw new Error('Sua sessão expirou. Entre de novo em Alterações no site (admin.html).');
        const { data, error } = await sb.from('site_edicoes')
            .insert({ pagina: escopo === 'g' ? GERAL : PAGINA_ARQUIVO, conteudo: estado, autor: session.user.id, autor_email: session.user.email })
            .select('id').single();
        if (error) throw new Error('Não foi possível publicar: ' + error.message);
        this.publicadoId[escopo] = data.id;
        return data.id;
    },

    async historico() {
        const sb = await PORTAL.cliente();
        // Quem publicou so a equipe ve (funcao historico_edicoes, schema.sql)
        const { data, error } = await sb.rpc('historico_edicoes', { p_pagina: PAGINA_ARQUIVO, p_limite: 20 });
        if (error) throw new Error('Não foi possível carregar o histórico.');
        return data;
    },

    // Fotos de celular sao grandes: reduz para no maximo `lado` px
    async reduzir(arquivo, lado = 2000) {
        if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) return arquivo;
        const bmp = await createImageBitmap(arquivo);
        const escala = Math.min(1, lado / Math.max(bmp.width, bmp.height));
        if (escala === 1 && arquivo.size < 1.5e6 && lado >= 2000) return arquivo;
        const c = document.createElement('canvas');
        c.width = Math.round(bmp.width * escala); c.height = Math.round(bmp.height * escala);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        return new Promise(ok => c.toBlob(b => ok(b || arquivo), 'image/jpeg', 0.85));
    },

    // So JPG, PNG ou WebP de ate 5 MB (o armazenamento "site" recusa o resto:
    // schema.sql)
    async enviarImagem(arquivo) {
        if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
        const sb = await PORTAL.cliente();
        const blob = await this.reduzir(arquivo);
        if (blob.size > 5 * 1024 * 1024) throw new Error('A imagem ficou maior que 5 MB. Use uma foto menor.');
        const nome = arquivo.name.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'imagem';
        const caminho = `${PAGINA_ARQUIVO.replace('.html', '')}/${Date.now()}-${nome}.jpg`;
        const { error } = await sb.storage.from('site').upload(caminho, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
        if (error) throw new Error('Não foi possível enviar a imagem: ' + error.message);
        return sb.storage.from('site').getPublicUrl(caminho).data.publicUrl;
    },

    // Demonstracao: a imagem vai junto das edicoes, embutida e menor
    async embutirImagem(arquivo) {
        if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
        const blob = await this.reduzir(arquivo, 1400);
        return new Promise((ok, falha) => {
            const leitor = new FileReader();
            leitor.onload = () => ok(leitor.result);
            leitor.onerror = () => falha(new Error('Não foi possível ler a imagem.'));
            leitor.readAsDataURL(blob);
        });
    }
};

// Guarda o que foi editado (no navegador). Com contas ligadas, isso e o
// rascunho de quem edita; o site so muda para todos ao Publicar.
function salvarEdicoes() {
    let houve = false;
    try {
        ['p', 'g'].forEach(escopo => {
            const estado = estadoAtual(escopo);
            const mudou = !estadoVazio(estado);
            houve = houve || mudou;
            const chave = chaveArmazenada(escopo);
            if (PORTAL.MODO_DEMO) {
                if (mudou) localStorage.setItem(chave, JSON.stringify({ ...estado, quando: new Date().toISOString() }));
                else localStorage.removeItem(chave);
                return;
            }
            const antes = lerEdicoes(escopo);
            const publicado = EDICAO.publicadoConteudo?.[escopo];
            // So vira rascunho se mudou algo em relacao ao que esta no ar
            const igualAoNoAr = JSON.stringify(estado) === JSON.stringify(normalizar(publicado, escopo));
            if (igualAoNoAr && !antes.quando) return;
            localStorage.setItem(chave, JSON.stringify({ ...estado, base: EDICAO.publicadoId[escopo], quando: new Date().toISOString() }));
            EDICAO.rascunho[escopo] = !igualAoNoAr;
        });
        if (!PORTAL.MODO_DEMO) atualizarBarra();
    } catch (erro) {
        alert(/quota/i.test(erro?.name + erro?.message)
            ? 'O navegador ficou sem espaço para guardar as edições (provavelmente por causa das imagens). Baixe as edições e envie antes de continuar.'
            : 'Não foi possível salvar neste navegador.');
        return false;
    }
    return houve;
}
// Estado publicado no mesmo formato de estadoAtual, para comparar
function normalizar(estado, escopo) {
    if (!estado) return { versao: 2, textos: {}, links: {}, ...(escopo === 'p' ? { clones: [], novos: [], ordem: [], ocultos: [], apagados: [], imagens: {} } : {}) };
    const base = { versao: 2, textos: estado.textos || {}, links: estado.links || {} };
    if (escopo !== 'p') return base;
    return { ...base, clones: estado.clones || [], novos: estado.novos || [], ordem: estado.ordem || [], ocultos: estado.ocultos || [], apagados: estado.apagados || [], imagens: estado.imagens || {} };
}

function aplicarEdicaoNosTextos() {
    elementosEditaveis().forEach(el => { el.contentEditable = editMode ? 'true' : 'false'; if (!editMode) el.removeAttribute('contenteditable'); });
    imagensEditaveis().forEach(img => { img.title = editMode ? 'Clique para trocar a imagem' : ''; });
}

function toggleEditMode() {
    if (!document.getElementById('btn-editar') || barraEdicao.hidden) return;
    editMode = !editMode;
    document.body.classList.toggle('modo-edicao', editMode);
    aplicarEdicaoNosTextos();
    const btn = document.getElementById('btn-editar');
    document.getElementById('barra-edicao-extra').hidden = !editMode && PORTAL.MODO_DEMO;
    atualizarBarra();
    if (editMode) { btn.textContent = 'Concluir'; return; }
    esconderControle();
    esconderControleLink();
    const houve = salvarEdicoes();
    btn.textContent = houve ? (PORTAL.MODO_DEMO ? 'Salvo ✓' : 'Rascunho salvo ✓') : 'Editar';
    setTimeout(() => { if (!editMode) btn.textContent = 'Editar'; }, 2000);
}

// Durante a edicao: Enter quebra a linha (titulos e botoes nao quebram),
// colar traz so o texto, e nenhum link ou botao da pagina dispara
document.addEventListener('keydown', (e) => {
    if (!editMode || e.key !== 'Enter') return;
    const el = e.target.closest?.('[data-txt]');
    if (!el) return;
    e.preventDefault();
    if (!el.matches('h1, h2, h3, h4, h5, h6, a, .btn, span, small, strong, label')) document.execCommand('insertLineBreak');
});
document.addEventListener('paste', (e) => {
    if (!editMode || !e.target.closest?.('[data-txt]')) return;
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
});
document.addEventListener('submit', (e) => { if (editMode) e.preventDefault(); }, true);

/* Controle de bloco: aparece sobre o bloco em que o mouse (ou o dedo)
   esta, durante a edicao. Ocultar some com o bloco para os visitantes;
   na edicao ele fica apagado, para poder voltar. Apagar tira de vez. */
const controle = document.createElement('div');
controle.id = 'ctrl-bloco';
controle.hidden = true;
controle.innerHTML = `
    <span class="ctrl-tipo"></span>
    <button type="button" data-acao="subir" title="Sobe este bloco uma posição">↑</button>
    <button type="button" data-acao="descer" title="Desce este bloco uma posição">↓</button>
    <button type="button" data-acao="ocultar"></button>
    <button type="button" data-acao="duplicar" title="Cria uma cópia logo abaixo, para editar">Duplicar</button>
    <button type="button" data-acao="apagar" title="Tira este bloco da página">Apagar</button>
    <span class="ctrl-novo">
        <span>Nova seção abaixo:</span>
        <button type="button" data-acao="novo-texto" title="Seção com título e texto">Texto</button>
        <button type="button" data-acao="novo-imagem" title="Seção com título, imagem e legenda">Imagem</button>
        <button type="button" data-acao="novo-video" title="Seção com título e um vídeo do YouTube">Vídeo</button>
    </span>`;
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
    const chave = el.dataset.bloco;
    const extra = chave.startsWith('c:') ? ' (cópia)' : chave.startsWith('n:') ? ' (nova)' : '';
    const oculto = el.classList.contains('bloco-oculto');
    controle.querySelector('.ctrl-tipo').textContent = (item ? 'Item' : 'Seção') + extra + (oculto ? ' · oculto' : '');
    const btnOcultar = controle.querySelector('[data-acao="ocultar"]');
    btnOcultar.textContent = oculto ? 'Mostrar' : 'Ocultar';
    btnOcultar.title = oculto ? 'Volta a mostrar este bloco' : 'Esconde este bloco dos visitantes (dá para mostrar de novo)';
    const irmaos = irmaosBloco(el);
    controle.querySelector('[data-acao="subir"]').disabled = irmaos[0] === el;
    controle.querySelector('[data-acao="descer"]').disabled = irmaos[irmaos.length - 1] === el;
    controle.querySelector('[data-acao="duplicar"]').hidden = !item;
    controle.querySelector('.ctrl-novo').hidden = item;
    controle.hidden = false;
    // Secao: no canto de cima, por dentro. Item (pode ser pequeno, como um
    // botao): logo acima dele, para nao cobrir o que se quer clicar
    const r = el.getBoundingClientRect();
    const largura = controle.offsetWidth;
    const altura = controle.offsetHeight;
    const topo = item && r.top - altura - 6 > 70 ? r.top - altura - 6 : Math.max(r.top, 0) + 4;
    controle.style.top = `${topo + window.scrollY}px`;
    controle.style.left = `${Math.max(8, Math.min(r.right - largura - 4, document.documentElement.clientWidth - largura - 8)) + window.scrollX}px`;
}

document.addEventListener('mouseover', (e) => {
    if (!editMode || controle.contains(e.target) || e.target.closest('#barra-edicao, .painel-historico, #ctrl-link')) return;
    const el = e.target.closest(ITENS) || e.target.closest(SECOES);
    if (el && el.dataset.bloco && !el.closest('header, footer')) mostrarControle(el);
});

const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Tira um bloco de vez (e as copias feitas a partir dele)
function apagarBloco(el) {
    const chave = el.dataset.bloco;
    const removidas = new Set([chave]);
    el.querySelectorAll('[data-bloco^="c:"], [data-bloco^="n:"]').forEach(f => removidas.add(f.dataset.bloco));
    let mudou = true;
    while (mudou) {
        mudou = false;
        clones.forEach(c => { if (removidas.has(c.de) && !removidas.has('c:' + c.id)) { removidas.add('c:' + c.id); mudou = true; } });
        novos.forEach(n => { if (removidas.has(n.depois) && !removidas.has('n:' + n.id)) { removidas.add('n:' + n.id); mudou = true; } });
    }
    removidas.forEach(k => {
        const b = acharBloco(k);
        if (b) b.remove();
        ocultos.delete(k);
        if (!k.startsWith('c:') && !k.startsWith('n:')) apagados.add(k);
    });
    clones = clones.filter(c => !removidas.has('c:' + c.id));
    novos = novos.filter(n => !removidas.has('n:' + n.id));
    ordem = ordem.filter(o => !removidas.has(o.bloco) && !removidas.has(o.antes || o.depois));
}

controle.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !alvoBloco) return;
    const el = alvoBloco;
    const acao = btn.dataset.acao;
    if (acao === 'ocultar') {
        const oculto = el.classList.toggle('bloco-oculto');
        if (oculto) ocultos.add(el.dataset.bloco); else ocultos.delete(el.dataset.bloco);
        mostrarControle(el);
    } else if (acao === 'subir' || acao === 'descer') {
        const irmaos = irmaosBloco(el);
        const i = irmaos.indexOf(el);
        const op = acao === 'subir'
            ? (i > 1 ? { bloco: el.dataset.bloco, depois: irmaos[i - 2].dataset.bloco } : { bloco: el.dataset.bloco, antes: irmaos[i - 1].dataset.bloco })
            : { bloco: el.dataset.bloco, depois: irmaos[i + 1].dataset.bloco };
        if (moverBloco(op)) ordem.push(op);
        mostrarControle(el);
        el.scrollIntoView({ block: 'nearest', behavior: MOVIMENTO_REDUZIDO ? 'auto' : 'smooth' });
    } else if (acao === 'duplicar') {
        const id = novoId();
        clones.push({ id, de: el.dataset.bloco });
        const copia = duplicarBloco(el, id);
        aplicarEdicaoNosTextos();
        mostrarControle(copia);
    } else if (acao === 'apagar') {
        const nova = /^[cn]:/.test(el.dataset.bloco);
        if (!confirm(nova ? 'Apagar este bloco?' : 'Apagar este bloco da página? Para trazer de volta, use Desfazer ou o Histórico.')) return;
        apagarBloco(el);
        esconderControle();
    } else if (acao.startsWith('novo-')) {
        const tipo = acao.slice(5);
        const n = { id: novoId(), depois: el.dataset.bloco, tipo, fundo: el.classList.contains('sec-escura') ? 'clara' : 'escura' };
        if (tipo === 'video') {
            const codigo = codigoYoutube(prompt('Cole o link do vídeo no YouTube:') || '');
            if (!codigo) { alert('Não reconheci um link do YouTube. Copie o endereço do vídeo (ex.: https://www.youtube.com/watch?v=...).'); return; }
            n.video = codigo;
        }
        const sec = criarSecaoNova(n);
        if (!sec) return;
        novos.push(n);
        aplicarEdicaoNosTextos();
        sec.scrollIntoView({ block: 'center', behavior: MOVIMENTO_REDUZIDO ? 'auto' : 'smooth' });
        if (tipo === 'imagem') escolherImagemPara(sec.querySelector('img[data-img]'));
    }
    salvarEdicoes();
});

// Trocar o video de uma secao nova
document.addEventListener('click', (e) => {
    const btn = editMode && e.target.closest('[data-trocar-video]');
    if (!btn) return;
    const n = novos.find(x => x.id === btn.dataset.trocarVideo);
    const codigo = n && codigoYoutube(prompt('Cole o link do vídeo no YouTube:', n.video ? `https://www.youtube.com/watch?v=${n.video}` : '') || '');
    if (!codigo) return;
    n.video = codigo;
    const sec = acharBloco('n:' + n.id);
    const textos = textosEm(sec).map(t => t.innerHTML);
    sec.remove();
    const nova = criarSecaoNova(n);
    textosEm(nova).forEach((t, i) => { if (textos[i] !== undefined) t.innerHTML = textos[i]; });
    aplicarEdicaoNosTextos();
    salvarEdicoes();
});

/* Controle de link: no modo edicao, clicar num link ou botao mostra o
   endereco para onde ele leva, para trocar */
const controleLink = document.createElement('form');
controleLink.id = 'ctrl-link';
controleLink.hidden = true;
controleLink.innerHTML = `
    <label for="ctrl-link-href">Este botão/link leva para:</label>
    <input type="text" id="ctrl-link-href" spellcheck="false" autocomplete="off">
    <small>Página do site (ex.: contato.html), endereço completo (https://…), e-mail (mailto:…) ou WhatsApp (https://wa.me/55…)</small>
    <div>
        <button type="submit">Salvar link</button>
        <button type="button" data-acao="original">Voltar ao original</button>
        <button type="button" data-acao="fechar">Fechar</button>
    </div>`;
document.body.appendChild(controleLink);
let alvoLink = null;
function esconderControleLink() { controleLink.hidden = true; alvoLink = null; }
function mostrarControleLink(a) {
    alvoLink = a;
    controleLink.querySelector('input').value = a.getAttribute('href');
    controleLink.hidden = false;
    const r = a.getBoundingClientRect();
    const largura = controleLink.offsetWidth;
    controleLink.style.top = `${r.bottom + window.scrollY + 8}px`;
    controleLink.style.left = `${Math.max(8, Math.min(r.left, document.documentElement.clientWidth - largura - 8)) + window.scrollX}px`;
}
controleLink.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!alvoLink) return;
    const href = linkSeguro(controleLink.querySelector('input').value);
    if (!href) { alert('Endereço inválido. Use uma página do site, um endereço https://…, mailto: ou tel:.'); return; }
    alvoLink.setAttribute('href', href);
    esconderControleLink();
    salvarEdicoes();
});
controleLink.addEventListener('click', (e) => {
    const acao = e.target.closest('button')?.dataset.acao;
    if (acao === 'fechar') esconderControleLink();
    if (acao === 'original' && alvoLink) {
        alvoLink.setAttribute('href', alvoLink.dataset.hrefOriginal);
        esconderControleLink();
        salvarEdicoes();
    }
});
document.addEventListener('click', (e) => {
    if (!editMode || e.target.closest('#barra-edicao, #ctrl-bloco, #ctrl-link, .painel-historico')) return;
    const a = e.target.closest('a[href]');
    if (a) {
        e.preventDefault();
        if (a.matches('[data-pagamento]')) { alert('Este botão leva ao cadastro e depois ao link de pagamento, que é alterado no Painel (admin.html > Contatos e pagamentos).'); return; }
        if (a.matches('[data-contato]')) { alert('Os contatos do rodapé são alterados no Painel (admin.html > Contatos e pagamentos).'); return; }
        if (a.dataset.link) mostrarControleLink(a);
        return;
    }
    // Botoes da pagina (enviar formulario, abrir dialogo...) nao disparam
    if (e.target.closest('button') && !e.target.closest('[data-trocar-video]')) e.preventDefault();
}, true);

// Trocar imagem: no modo edicao, clicar numa imagem abre a escolha do arquivo
const escolherImagem = document.createElement('input');
escolherImagem.type = 'file';
escolherImagem.accept = 'image/jpeg,image/png,image/webp';
escolherImagem.hidden = true;
document.body.appendChild(escolherImagem);
let imagemAlvo = null;
function escolherImagemPara(img) {
    imagemAlvo = img;
    escolherImagem.value = '';
    escolherImagem.click();
}
document.addEventListener('click', (e) => {
    if (!editMode) return;
    const img = e.target.closest('img[data-img]');
    if (!img || img.closest('#barra-edicao')) return;
    e.preventDefault();
    e.stopPropagation();
    escolherImagemPara(img);
}, true);
escolherImagem.addEventListener('change', async () => {
    const arquivo = escolherImagem.files[0];
    if (!arquivo || !imagemAlvo) return;
    if (arquivo.size > 15e6) { alert('Imagem grande demais (máximo 15 MB).'); return; }
    const alvo = imagemAlvo;
    alvo.style.opacity = '0.4';
    try {
        const url = PORTAL.MODO_DEMO ? await EDICAO.embutirImagem(arquivo) : await EDICAO.enviarImagem(arquivo);
        alvo.src = url;
        imagens[alvo.dataset.img] = url;
        salvarEdicoes();
    } catch (erro) {
        alert(erro.message);
    } finally {
        alvo.style.opacity = '';
    }
});

// Baixa TODAS as edicoes salvas neste navegador (todas as paginas),
// num arquivo para enviar a quem publica o site (so na demonstracao).
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
    const msg = PORTAL.MODO_DEMO
        ? 'Descartar as edições salvas desta página (e do menu e rodapé) e voltar ao que está publicado?'
        : 'Descartar o rascunho desta página (e do menu e rodapé) e voltar à versão publicada?';
    if (!confirm(msg)) return;
    try { localStorage.removeItem(chaveArmazenada('p')); localStorage.removeItem(chaveArmazenada('g')); } catch { /* nada */ }
    location.reload();
}

async function publicarPagina() {
    if (editMode) toggleEditMode();
    if (!confirm('Publicar as mudanças desta página para todos os visitantes?')) return;
    const btn = document.getElementById('btn-publicar');
    btn.disabled = true;
    btn.textContent = 'Publicando…';
    try {
        for (const escopo of ['g', 'p']) {
            if (escopo === 'g' && !EDICAO.rascunho.g) continue;
            const estado = estadoAtual(escopo);
            await EDICAO.publicar(estado, escopo);
            EDICAO.publicadoConteudo[escopo] = estado;
            try { localStorage.removeItem(chaveArmazenada(escopo)); } catch { /* nada */ }
            EDICAO.rascunho[escopo] = false;
        }
        btn.textContent = 'Publicado ✓';
        setTimeout(() => { btn.textContent = 'Publicar'; atualizarBarra(); }, 2500);
    } catch (erro) {
        alert(erro.message);
        btn.textContent = 'Publicar';
    } finally {
        btn.disabled = false;
    }
}

// Historico: lista as versoes publicadas; restaurar publica de novo aquela
async function abrirHistorico() {
    let painel = document.querySelector('.painel-historico');
    if (painel) { painel.remove(); return; }
    painel = document.createElement('div');
    painel.className = 'painel-historico';
    painel.innerHTML = '<p>Carregando…</p>';
    barraEdicao.prepend(painel);
    try {
        const versoes = await EDICAO.historico();
        const data = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        painel.innerHTML = `<strong>Versões publicadas desta página</strong>`
            + (versoes.length ? `<ol>${versoes.map((v, i) => `<li>
                <span>${data(v.criado_em)}${v.autor_email ? ' · ' + v.autor_email.replace(/[<>&"]/g, '') : ''}${i === 0 ? ' · <em>no ar</em>' : ''}</span>
                ${i === 0 ? '' : `<button type="button" data-versao="${v.id}">Voltar a esta</button>`}
            </li>`).join('')}</ol>` : '<p>Nenhuma versão publicada ainda: a página está como foi feita.</p>')
            + '<button type="button" class="fechar-historico">Fechar</button>';
        painel.addEventListener('click', async (e) => {
            if (e.target.closest('.fechar-historico')) { painel.remove(); return; }
            const b = e.target.closest('[data-versao]');
            if (!b) return;
            const v = versoes.find(x => String(x.id) === b.dataset.versao);
            if (!v || !confirm(`Voltar a página para a versão de ${data(v.criado_em)}? Ela será publicada para todos.`)) return;
            try {
                await EDICAO.publicar(v.conteudo);
                try { localStorage.removeItem(CHAVE_EDICOES); } catch { /* nada */ }
                location.reload();
            } catch (erro) { alert(erro.message); }
        });
    } catch (erro) {
        painel.innerHTML = `<p></p><button type="button" class="fechar-historico">Fechar</button>`;
        painel.querySelector('p').textContent = erro.message;
        painel.querySelector('.fechar-historico').onclick = () => painel.remove();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        toggleEditMode();
    }
});

const DICA_EDICAO = 'Clique num texto para mudar, num link ou botão para trocar o destino, numa imagem para trocar; passe o mouse sobre um bloco para mover, ocultar, apagar ou adicionar';
const barraEdicao = document.createElement('div');
barraEdicao.id = 'barra-edicao';
barraEdicao.innerHTML = PORTAL.MODO_DEMO ? `
    <div id="barra-edicao-extra" hidden>
        <span class="dica-edicao">${DICA_EDICAO}</span>
        <button type="button" id="btn-desfazer-edicoes" title="Descarta as edições salvas desta página">Desfazer</button>
    </div>
    <div class="barra-linha">
        <a href="admin.html" class="barra-painel" title="Voltar ao painel de alterações">Painel</a>
        <button type="button" id="btn-baixar-edicoes" class="barra-baixar" title="Gera um arquivo com tudo que você editou (todas as páginas, fotos e Painel), para enviar a quem publica o site">Baixar edições</button>
    </div>
    <button type="button" id="btn-editar" title="Editar a página. Ao concluir, as mudanças ficam salvas neste navegador.">Editar</button>` : `
    <div id="barra-edicao-extra">
        <span class="dica-edicao" id="estado-edicao"></span>
        <button type="button" id="btn-historico" title="Versões publicadas desta página">Histórico</button>
        <button type="button" id="btn-desfazer-edicoes" title="Descarta o rascunho e volta à versão publicada">Descartar rascunho</button>
        <button type="button" id="btn-publicar" title="Publica as mudanças desta página para todos os visitantes">Publicar</button>
    </div>
    <a href="admin.html" class="barra-painel" title="Voltar ao painel de alterações">Painel</a>
    <button type="button" id="btn-editar" title="Editar a página. Só vale para todos depois de Publicar.">Editar</button>`;
document.body.appendChild(barraEdicao);
document.getElementById('btn-editar').onclick = toggleEditMode;
document.getElementById('btn-desfazer-edicoes').onclick = desfazerEdicoes;
if (PORTAL.MODO_DEMO) document.getElementById('btn-baixar-edicoes').onclick = baixarEdicoes;
else {
    document.getElementById('btn-publicar').onclick = publicarPagina;
    document.getElementById('btn-historico').onclick = abrirHistorico;
}

function atualizarBarra() {
    if (PORTAL.MODO_DEMO) return;
    const rascunho = EDICAO.rascunho.p || EDICAO.rascunho.g;
    const aviso = document.getElementById('estado-edicao');
    aviso.textContent = editMode ? 'Editando: ' + DICA_EDICAO.charAt(0).toLowerCase() + DICA_EDICAO.slice(1)
        : rascunho ? 'Há mudanças não publicadas nesta página' : 'Tudo publicado';
    document.getElementById('btn-desfazer-edicoes').hidden = !rascunho;
    document.getElementById('btn-publicar').disabled = !rascunho && !editMode;
}

// ---------- Carregar as edicoes ----------
// A propria pagina de alteracoes nao e editavel
const PAGINA_EDITAVEL = PAGINA !== 'editar';
EDICAO.publicadoConteudo = { p: null, g: null };
if (PORTAL.MODO_DEMO) {
    aplicarEstado(lerEdicoes('g'), 'g');
    aplicarEstado(lerEdicoes('p'), 'p');
    // Demonstracao: a barra so aparece para quem entrou por admin.html
    barraEdicao.hidden = !PAGINA_EDITAVEL || !editorLocal() || !ABERTA_PARA_EDITAR;
} else {
    // Contas ligadas: a barra so aparece para a equipe, e a pagina espera a
    // versao publicada (no maximo 2,5 s) para nao piscar o texto antigo
    barraEdicao.hidden = true;
    document.documentElement.classList.add('esperando-edicoes');
    const liberar = () => document.documentElement.classList.remove('esperando-edicoes');
    const limite = setTimeout(liberar, 2500);
    (async () => {
        let publicado = { p: null, g: null };
        try { publicado = await EDICAO.publicado(); } catch (erro) { console.warn('Edições publicadas indisponíveis:', erro); }
        try { EDICAO.editor = await EDICAO.verificarEditor(); } catch { EDICAO.editor = false; }
        ['g', 'p'].forEach(escopo => {
            const linha = publicado[escopo];
            EDICAO.publicadoId[escopo] = linha ? linha.id : null;
            EDICAO.publicadoConteudo[escopo] = linha ? linha.conteudo : null;
            const rascunho = EDICAO.editor ? lerEdicoes(escopo) : {};
            // Rascunho so vale se foi feito sobre a versao que esta no ar
            const usarRascunho = EDICAO.editor && rascunho.quando && (rascunho.base ?? null) === EDICAO.publicadoId[escopo];
            EDICAO.rascunho[escopo] = !!usarRascunho;
            aplicarEstado(usarRascunho ? rascunho : linha && linha.conteudo, escopo);
        });
        clearTimeout(limite);
        liberar();
        if (EDICAO.editor && PAGINA_EDITAVEL) { barraEdicao.hidden = false; atualizarBarra(); }
    })();
}

/* =========================================================
   ALTERACOES NO SITE (admin.html): acesso da equipe, separado
   da Area do Mantenedor. Depois de entrar, a barra Editar aparece
   nas paginas abertas pela lista daqui (?editar no endereco).
   ========================================================= */
if (PAGINA === 'editar') {
    const $ = (id) => document.getElementById(id);
    const telaLogin = $('editar-login');
    const telasPainel = ['editar-topo', 'editar-paginas', 'painel-config', 'editar-senha'].map($);
    const veioTrocarSenha = /type=recovery/.test(location.hash);

    // Paginas que a equipe pode alterar (as do menu e as demais publicas)
    const PAGINAS = [
        { href: 'index.html', rotulo: 'Início' },
        ...MENU.filter(m => m.href !== 'index.html').map(m => ({ href: m.href, rotulo: m.rotulo })),
        { href: 'fazer-parte.html', rotulo: 'Faça parte (cadastro)' },
        { href: 'portal.html', rotulo: 'Área do Mantenedor' },
        { href: 'contato.html', rotulo: 'Contato' },
        { href: 'politica-de-privacidade.html', rotulo: 'Política de Privacidade' },
        { href: 'termos-de-uso.html', rotulo: 'Termos de Uso' }
    ].filter((p, i, todas) => todas.findIndex(q => q.href === p.href) === i);
    $('editar-lista').replaceChildren(...PAGINAS.map(p => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = p.href + '?editar';
        a.append(Object.assign(document.createElement('strong'), { textContent: p.rotulo }),
            Object.assign(document.createElement('span'), { textContent: p.href }));
        li.append(a);
        return li;
    }));
    if (PORTAL.MODO_DEMO) {
        $('editar-demo').hidden = false;
        $('passo-publicar').innerHTML = 'Na demonstração não há Publicar: clique em <strong>Baixar edições</strong> e envie o arquivo para quem publica o site.';
        telasPainel.splice(telasPainel.indexOf($('editar-senha')), 1);
        $('editar-senha').remove();
    }

    // soSenha: chegou pelo link de "Esqueci minha senha". So aparece o
    // formulario de senha nova; o painel abre depois de salvar a senha.
    const mostrar = (email, soSenha = false) => {
        telaLogin.hidden = !!email;
        telasPainel.forEach(t => { t.hidden = !email || (soSenha && t.id !== 'editar-senha'); });
        // So o campo da senha nova: sem cabecalho, menu e rodape
        document.documentElement.classList.toggle('so-senha', !!email && soSenha);
        if (email) $('editor-email').textContent = email;
        window.scrollTo(0, 0);
    };

    // Ja entrou antes neste navegador? (com contas, o banco confere de novo)
    if (PORTAL.MODO_DEMO) mostrar(editorLocal());
    else {
        mostrar('');
        EDICAO.verificarEquipe().then(user => {
            if (user && veioTrocarSenha) {
                // O link do e-mail so serve para criar a senha nova: o painel
                // (e o acesso guardado neste navegador) vem depois de salvar
                localStorage.removeItem(CHAVE_EDITOR);
                mostrar(user.email, true);
                $('editor-senha-titulo').textContent = 'Crie sua nova senha.';
                $('ed-nova').focus();
            } else if (user && editorLocal()) {
                localStorage.setItem(CHAVE_EDITOR, user.email);
                mostrar(user.email);
            }
        }).catch(() => {});
    }

    const formLogin = $('form-editor');
    CAPTCHA.preparar(formLogin);
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const retorno = $('editor-retorno');
        formLogin.classList.add('validar');
        if (!formLogin.checkValidity()) { retorno.textContent = 'Informe seu e-mail e sua senha.'; return; }
        const email = $('ed-email').value.trim();
        try {
            if (!PORTAL.MODO_DEMO) {
                const perfil = await PORTAL.entrar(email, $('ed-senha').value, null, CAPTCHA.token(formLogin));
                const user = await EDICAO.verificarEquipe();
                if (!user) {
                    await PORTAL.sair();
                    throw new Error('Esta conta não tem acesso às alterações do site. Fale com quem administra o site.');
                }
                PORTAL.salvar(perfil);
            }
            localStorage.setItem(CHAVE_EDITOR, email);
            // Avisa o Painel (importacao) que a equipe entrou, sem recarregar
            document.dispatchEvent(new CustomEvent('conesul:equipe-entrou'));
            formLogin.reset();
            retorno.textContent = '';
            mostrar(email);
        } catch (erro) {
            retorno.textContent = erro.message;
        }
        CAPTCHA.reiniciar(formLogin);
    });

    // Esqueci minha senha: o link volta para esta pagina
    const formEsqueci = $('form-editor-esqueci');
    CAPTCHA.preparar(formEsqueci);
    const trocarForm = (esqueci) => {
        formLogin.hidden = esqueci;
        formEsqueci.hidden = !esqueci;
        if (esqueci) $('ed-esqueci-email').value = $('ed-email').value;
    };
    $('btn-editor-esqueci').addEventListener('click', () => trocarForm(true));
    $('btn-editor-voltar').addEventListener('click', () => trocarForm(false));
    formEsqueci.addEventListener('submit', async (e) => {
        e.preventDefault();
        const retorno = $('editor-esqueci-retorno');
        formEsqueci.classList.add('validar');
        if (!formEsqueci.checkValidity()) { retorno.textContent = 'Informe um e-mail válido.'; return; }
        try {
            await PORTAL.esqueciSenha($('ed-esqueci-email').value.trim(), CAPTCHA.token(formEsqueci), 'admin.html');
            retorno.textContent = 'Pronto! Se este e-mail tiver conta, o link para criar uma senha nova chega em alguns minutos.';
        } catch (erro) {
            retorno.textContent = erro.message;
        }
        CAPTCHA.reiniciar(formEsqueci);
    });

    // Trocar senha (so com contas ligadas)
    const formSenha = $('form-editor-senha');
    if (formSenha) formSenha.addEventListener('submit', async (e) => {
        e.preventDefault();
        const retorno = $('editor-senha-retorno');
        const nova = $('ed-nova');
        const confirma = $('ed-confirma');
        confirma.setCustomValidity(confirma.value && confirma.value !== nova.value ? 'As senhas não conferem.' : '');
        formSenha.classList.add('validar');
        if (!formSenha.checkValidity()) {
            retorno.textContent = nova.validity.tooShort || nova.validity.valueMissing ? 'A senha precisa ter pelo menos 8 caracteres.' : 'As duas senhas não conferem.';
            return;
        }
        try {
            const sb = await PORTAL.cliente();
            const { data: { session } } = await sb.auth.getSession();
            if (!session) throw new Error('Sua sessão expirou. Entre de novo.');
            const { error } = await sb.auth.updateUser({ password: nova.value });
            if (error) throw new Error(error.message.includes('different') ? 'A nova senha precisa ser diferente da atual.' : 'Não foi possível trocar a senha. Tente de novo.');
            await sb.from('mantenedores').update({ senha_provisoria: false }).eq('id', session.user.id);
            senhaCriada();
            formSenha.reset();
            formSenha.classList.remove('validar');
            $('editor-senha-titulo').textContent = 'Trocar senha.';
            if (!editorLocal()) {
                // Veio pelo link do e-mail: com a senha criada, abre o painel
                localStorage.setItem(CHAVE_EDITOR, session.user.email);
                mostrar(session.user.email);
            }
            retorno.textContent = 'Senha alterada. Use a nova senha no próximo login.';
        } catch (erro) {
            retorno.textContent = erro.message;
        }
    });

    $('btn-editor-sair').addEventListener('click', async (e) => {
        const botao = e.currentTarget;
        botao.disabled = true;
        try { await PORTAL.sair(); } catch { /* o acesso local ja foi apagado */ }
        botao.disabled = false;
        mostrar('');
    });
}
