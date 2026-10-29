/* =========================================================
   MAPA INTERATIVO — roda nas paginas que tem #mapa-leaflet
   Depende de: Leaflet (CDN), mapa/territorios.js (dados) e dos
   GeoJSON em mapa/ (carregados por fetch).

   - territorios.geojson: os seis territorios em destaque
       PR, SC, RS: uniao dos municipios da malha do IBGE
       PY, AR, CL: Natural Earth 1:10m
   - referencia.geojson: demais paises da America do Sul e demais
     estados do Brasil (Natural Earth 1:10m), em tom neutro

   Pins (opcional): se a pagina carregar mapa/locais.js, cada cidade
   vira um pin; pins proximos se agrupam (Leaflet.markercluster, em
   mapa/vendor/) e se abrem com o zoom. Com um #locais-lista na pagina,
   a lista de cidades e montada ali.

   Selecao unica: selecionarTerritorio(id) atualiza mapa, lista e
   painel, venha o clique do mapa ou da lista.
   ========================================================= */
// Espera as configuracoes do Painel (fotos e cidades mudadas pela equipe)
(typeof CONFIG_PRONTA !== 'undefined' ? CONFIG_PRONTA : Promise.resolve()).then(function () {
    const elMapa = document.getElementById('mapa-leaflet');
    if (!elMapa || typeof TERRITORIOS === 'undefined') return;
    if (typeof configLocais === 'function' && typeof LOCAIS !== 'undefined') configLocais(LOCAIS);

    const POR_ID = Object.fromEntries(TERRITORIOS.map(t => [t.id, t]));
    const camadas = {};          // id -> camada Leaflet do territorio
    let map = null;
    let selecionado = null;

    // ---------- Painel de informacoes ----------
    const escapar = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    function mostrarPainel(titulo, bandeira, html) {
        document.querySelector('.card-info')?.classList.remove('recolhido');
        const corpo = document.querySelector('.card-body');
        corpo.style.transition = 'opacity 0.15s ease';
        corpo.style.opacity = '0';
        setTimeout(() => {
            document.getElementById('pasta-titulo').textContent = titulo;
            const elBandeira = document.getElementById('card-bandeira');
            elBandeira.querySelector('use').setAttribute('href', bandeira);
            elBandeira.style.display = '';
            document.getElementById('pasta-info').innerHTML = html;
            corpo.style.opacity = '1';
        }, 150);
    }

    let localAberto = null; // cidade aberta no quadro (para as fotos que chegam depois)
    let voando = false;     // o mapa esta indo ate uma cidade
    let esperaVoo = null;   // quem espera esse voo terminar
    function preencherPainel(t) {
        localAberto = null;
        if (map) map.closePopup();
        if (!t.religiao) {
            mostrarPainel(t.nome, t.bandeira, `<div class="ficha-descricao">${t.descricao ? escapar(t.descricao) : '<em>Descrição em preparação.</em>'}</div>`);
            return;
        }
        const pct = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
        const maior = Math.max(...t.religiao.map(r => r[1]));
        mostrarPainel(t.nome, t.bandeira, `
            <p class="ficha-rotulo">${escapar(t.rotulo)}</p>
            ${t.naoCristaos ? `<div class="ficha-destaque"><strong>${escapar(t.naoCristaos)}</strong><span>de pessoas que ainda não conhecem a Cristo</span></div>` : ''}
            ${t.texto ? `<p class="ficha-texto">${escapar(t.texto)}</p>` : ''}
            <div class="ficha-pop"><span>População</span><strong>${escapar(t.populacao)}</strong></div>
            <div class="religioes">
                <span class="religioes-titulo">Religião</span>
                ${t.religiao.map(([nome, n, rotulo]) => `
                    <div class="religiao">
                        <span class="religiao-nome">${escapar(nome)}</span>
                        <span class="religiao-barra"><i style="width:${(n / maior * 100).toFixed(1)}%"></i></span>
                        <span class="religiao-pct">${escapar(rotulo || pct(n))}</span>
                    </div>`).join('')}
                ${t.notaReligiao ? `<small>${escapar(t.notaReligiao)}</small>` : ''}
            </div>`);
    }

    // Quadro branco: some com suavidade quando a cidade tem fotos (elas
    // ficam no cartao sobre o pin) e volta ao escolher um territorio
    const cardInfo = document.querySelector('.card-info');
    const recolherPainel = () => cardInfo && cardInfo.classList.add('recolhido');

    // Fotos de cada cidade: basta colocar os arquivos na pasta da cidade,
    // img/locais/<cidade>/, com os nomes 01.jpg, 02.jpg, 03.jpg... (aceita
    // .jpg, .jpeg, .png e .webp). O site procura em ordem e para no primeiro
    // numero que nao existir. Fotos listadas a mao em mapa/locais.js (campo
    // "fotos") tem prioridade.
    const pastaDoLocal = local => 'img/locais/' + local.nome.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '/';
    const EXTENSOES = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];
    const MAX_FOTOS = 30;
    const existe = src => new Promise(ok => {
        const img = new Image();
        img.onload = () => ok(true);
        img.onerror = () => ok(false);
        img.src = src;
    });
    async function procurarFotos(local) {
        const achadas = [];
        for (let n = 1; n <= MAX_FOTOS; n++) {
            const nome = String(n).padStart(2, '0');
            let src = null;
            for (const ext of EXTENSOES) {
                const tentativa = `${pastaDoLocal(local)}${nome}.${ext}`;
                if (await existe(tentativa)) { src = tentativa; break; }
            }
            if (!src) break;
            achadas.push({ src, legenda: '' });
        }
        return achadas;
    }

    // Cidade escolhida: procura as fotos (uma vez) e recolhe o quadro
    function preencherLocal(local, i) {
        if (!(local.fotos && local.fotos.length) && !local._procurado) {
            local._procurado = true;
            recolherPainel();
            procurarFotos(local).then(achadas => {
                local.fotos = achadas;
                local._pronto = true;
                // So redesenha se a pessoa ainda estiver nesta cidade
                // Se o mapa ainda esta voando ate la, o cartao abre na chegada
                if (localAberto === i) { preencherLocal(local, i); if (!voando) abrirPopupFotos(i); }
            });
            localAberto = i;
            return;
        }
        localAberto = i;
        // Cidade: o quadro branco sai de cena (ele e so dos territorios);
        // fotos ou "Fotos em breve" ficam no cartao sobre o pin
        recolherPainel();
    }
    const fotosProntas = local => (local.fotos && local.fotos.length) || local._pronto;

    // ---------- Estilos das camadas ----------
    // Contorno claro e fino, que engrossa ao passar o mouse e ao escolher;
    // cantos arredondados para a linha ficar suave
    // Todos os territorios no mesmo tom (sem uma cor para cada): creme
    // discreto; ao passar o mouse clareia; o escolhido fica no verde-claro
    // de destaque do site
    const estilo = (t, modo) => ({
        color: modo === 'selecionado' ? '#c9d780' : '#fef5e2',
        weight: modo === 'selecionado' ? 2 : modo === 'hover' ? 1.4 : 0.9,
        opacity: modo === 'selecionado' ? 1 : modo === 'hover' ? 0.75 : 0.45,
        lineJoin: 'round',
        lineCap: 'round',
        fillColor: modo === 'selecionado' ? '#c9d780' : '#fef5e2',
        fillOpacity: modo === 'selecionado' ? 0.28 : modo === 'hover' ? 0.16 : 0.09
    });

    function aplicarEstilo(id) {
        const t = POR_ID[id];
        const camada = camadas[id];
        if (!camada) return;
        camada.setStyle(estilo(t, id === selecionado ? 'selecionado' : 'normal'));
    }

    // ---------- Selecao (mapa e lista) ----------
    function selecionarTerritorio(id, { enquadrar = false, painel = true } = {}) {
        const t = POR_ID[id];
        if (!t) return;
        const anterior = selecionado;
        selecionado = id;

        document.querySelectorAll('.info-item').forEach(el => {
            const ativo = el.dataset.territorio === id;
            el.classList.toggle('active', ativo);
            el.setAttribute('aria-pressed', ativo);
        });

        if (anterior) aplicarEstilo(anterior);
        aplicarEstilo(id);
        camadas[id]?.bringToFront();
        if (enquadrar && camadas[id]) map.flyToBounds(camadas[id].getBounds(), { padding: [30, 30], maxZoom: 6, duration: MOVIMENTO_REDUZIDO_MAPA ? 0 : 0.9, easeLinearity: 0.2 });

        if (painel) { marcarLocal(-1); preencherPainel(t); }
    }

    // Lista ao lado: funciona mesmo se o mapa falhar; acessivel por teclado
    document.querySelectorAll('.info-item[data-territorio]').forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-pressed', 'false');
        const ir = () => selecionarTerritorio(item.dataset.territorio, { enquadrar: !!map });
        item.addEventListener('click', ir);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); }
        });
    });

    function avisoMapa(texto) {
        elMapa.innerHTML = `<div class="mapa-offline">${texto}<br>Use a lista ao lado para ver os dados.</div>`;
    }

    if (typeof L === 'undefined') {
        avisoMapa('Mapa indisponível (sem conexão).');
        return;
    }

    // ---------- Mapa ----------
    // Zoom e arraste liberados. A roda do mouse so da zoom depois de um
    // clique no mapa, para nao "prender" a rolagem da pagina.
    // Fluidez: os contornos (36 mil pontos) sao desenhados em canvas, que
    // move e aproxima bem mais leve que SVG; zoom em passos de meio nivel;
    // arrastar com inercia
    map = L.map(elMapa, {
        preferCanvas: true,
        zoomControl: true,
        scrollWheelZoom: false,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 90,
        wheelDebounceTime: 20,
        inertia: true,
        inertiaDeceleration: 2500,
        zoomAnimationThreshold: 8,
        minZoom: 2.5,
        maxZoom: 12,
        maxBounds: [[-62, -100], [5, -20]],
        maxBoundsViscosity: 0.8,
        attributionControl: true
    });
    map.on('click', () => map.scrollWheelZoom.enable());
    elMapa.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

    // Enquadramento inicial: Sul do Brasil, Paraguai, Argentina e Chile
    const REGIAO = L.latLngBounds([[-55.9, -75.8], [-19.2, -47.9]]);
    map.fitBounds(REGIAO, { padding: [16, 16], animate: false });

    // Sem mapa de ruas por baixo: o mar e o fundo verde do proprio mapa
    // (CSS) e as terras vem dos GeoJSON, nas cores da identidade.
    map.attributionControl.addAttribution('Limites: IBGE, Natural Earth');

    // Rotulos fixos (paises vizinhos, oceanos e os territorios)
    const ROTULOS = [
        { txt: 'Argentina', em: [-37.6, -65.6], cls: 'pais' },
        { txt: 'Paraguai', em: [-22.9, -59.4], cls: 'pais' },
        { txt: 'Chile', em: [-31.5, -76.6], cls: 'pais lado' },
        { txt: 'Uruguai', em: [-33.2, -55.6], cls: 'vizinho' },
        { txt: 'Brasil', em: [-20.8, -52.5], cls: 'vizinho' },
        { txt: 'Bolívia', em: [-20.4, -63.6], cls: 'vizinho' },
        { txt: 'Oceano<br>Pacífico', em: [-49.5, -76.4], cls: 'oceano lado' },
        { txt: 'Oceano Atlântico', em: [-41, -51], cls: 'oceano' }
    ];

    ROTULOS.forEach(r => L.marker(r.em, {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({ className: 'rotulo-mapa ' + r.cls, html: `<span>${r.txt}</span>`, iconSize: null })
    }).addTo(map));

    // Reajusta o tamanho quando o container muda (responsivo)
    if ('ResizeObserver' in window) new ResizeObserver(() => map.invalidateSize()).observe(elMapa);

    // ---------- Pins das cidades (mapa/locais.js) ----------
    const pins = [];
    // Pin maior, com sombra; o da cidade escolhida fica dourado e pulsa
    const pinSvg = '<svg viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39s13-14 13-24A13 13 0 0 0 2 15c0 10 13 24 13 24Z"/><circle cx="15" cy="15" r="5"/></svg>';
    const iconePin = (ativo) => L.divIcon({
        className: 'pin-local' + (ativo ? ' pin-ativo' : ''),
        html: (ativo ? '<span class="pin-pulso"></span>' : '') + pinSvg,
        iconSize: [30, 40],
        iconAnchor: [15, 39],
        tooltipAnchor: [0, -34],
        popupAnchor: [0, -36]
    });
    const ICONE_PIN = iconePin(false);
    const ICONE_PIN_ATIVO = iconePin(true);

    function adicionarLocais() {
        if (typeof LOCAIS === 'undefined' || !LOCAIS.length) return;
        const grupo = L.markerClusterGroup
            ? L.markerClusterGroup({
                showCoverageOnHover: false,
                spiderfyOnMaxZoom: true,
                maxClusterRadius: 38,
                // A partir do zoom 8 todos os pins aparecem soltos: ao abrir uma
                // cidade o mapa nao precisa chegar perto demais (fica so cor lisa)
                disableClusteringAtZoom: 8,
                iconCreateFunction: c => L.divIcon({
                    className: 'pin-grupo',
                    html: `<span>${c.getChildCount()}</span>`,
                    iconSize: [34, 34]
                })
            })
            : L.layerGroup();   // sem o plugin, os pins aparecem soltos

        LOCAIS.forEach((local, i) => {
            const onde = local.uf || local.pais;
            const marcador = L.marker([local.lat, local.lng], { icon: ICONE_PIN, title: `${local.nome} — ${onde}`, keyboard: true });
            // Nome da cidade escrito ao lado do pin (some junto com o pin quando
            // ele entra num grupo; nomes que se encostariam ficam escondidos)
            marcador.bindTooltip(escapar(local.nome), { permanent: true, direction: 'right', offset: [14, 10], className: 'rotulo-cidade', interactive: false });
            marcador.on('click', () => selecionarLocal(i));
            grupo.addLayer(marcador);
            pins.push({ local, marcador });
        });
        grupo.addTo(map);
        grupoPins = grupo;
        map.on('zoomend moveend', arrumarRotulos);
        grupo.on('animationend spiderfied unspiderfied', arrumarRotulos);
        setTimeout(arrumarRotulos, 0);

        const lista = document.getElementById('locais-lista');
        if (lista) montarLista(lista, grupo);
    }

    // Nomes das cidades: esconde os que encostariam num nome ja mostrado
    // (a cidade escolhida tem prioridade); aproximar o mapa revela os outros
    function arrumarRotulos() {
        const rotulos = pins.map(({ marcador }) => {
            const el = marcador.getTooltip()?.getElement();
            if (el) el.classList.toggle('rotulo-ativo', marcador === pinAtivo);
            return el;
        }).filter(el => el && el.isConnected);
        rotulos.sort((a, b) => b.classList.contains('rotulo-ativo') - a.classList.contains('rotulo-ativo'));
        const ocupados = [];
        rotulos.forEach(el => {
            el.style.visibility = '';
            const r = el.getBoundingClientRect();
            const bate = ocupados.some(o => r.left < o.right + 4 && r.right + 4 > o.left && r.top < o.bottom + 2 && r.bottom + 2 > o.top);
            if (bate) el.style.visibility = 'hidden'; else ocupados.push(r);
        });
    }

    let pinAtivo = null;
    function marcarLocal(i) {
        document.querySelectorAll('.local-btn').forEach(b => b.classList.toggle('ativo', +b.dataset.i === i));
        if (pinAtivo) { pinAtivo.setIcon(ICONE_PIN); pinAtivo.setZIndexOffset(0); }
        pinAtivo = pins[i] ? pins[i].marcador : null;
        if (pinAtivo) { pinAtivo.setIcon(ICONE_PIN_ATIVO); pinAtivo.setZIndexOffset(1000); }
        arrumarRotulos();
    }

    // Lista de cidades agrupada por estado/pais; clicar leva ate o pin
    function montarLista(lista, grupo) {
        const grupos = [];
        LOCAIS.forEach((local, i) => {
            const chave = local.uf || local.pais;
            let g = grupos.find(x => x.chave === chave);
            if (!g) grupos.push(g = { chave, nome: POR_ID[local.territorio]?.nome || chave, itens: [] });
            g.itens.push({ local, i });
        });
        lista.innerHTML = grupos.map(g => `
            <div class="locais-grupo">
                <h4>${escapar(g.nome)} <small>${g.itens.length} ${g.itens.length === 1 ? 'cidade' : 'cidades'}</small></h4>
                <ul>${g.itens.map(({ local, i }) => `<li><button type="button" class="local-btn" data-i="${i}"><span class="local-mini" aria-hidden="true"></span>${escapar(local.nome)}</button></li>`).join('')}</ul>
            </div>`).join('');

        // Fotinho de cada cidade: a miniatura da pasta (mini.jpg, leve) ou,
        // sem ela, a primeira foto escolhida no Painel
        lista.querySelectorAll('.local-btn').forEach(btn => {
            const local = LOCAIS[+btn.dataset.i];
            const mini = btn.querySelector('.local-mini');
            const usar = (src) => { mini.style.backgroundImage = `url("${src.replace(/["\\]/g, '')}")`; btn.classList.add('com-foto'); };
            if (local.fotos && local.fotos.length) { usar(local.fotos[0].src); return; }
            const src = pastaDoLocal(local) + 'mini.jpg';
            existe(src).then(ok => { if (ok) usar(src); });
        });

        lista.addEventListener('click', (e) => {
            const btn = e.target.closest('.local-btn');
            if (btn) selecionarLocal(+btn.dataset.i, { irAoPin: true });
        });
    }

    let grupoPins = null;
    function selecionarLocal(i, { irAoPin = false } = {}) {
        const { local, marcador } = pins[i];
        if (POR_ID[local.territorio]) selecionarTerritorio(local.territorio, { painel: false });
        marcarLocal(i);
        preencherLocal(local, i);
        if (!irAoPin) { if (fotosProntas(local)) abrirPopupFotos(i); return; }
        // No celular a lista fica abaixo do mapa: sobe ate ele (pin e fotos)
        if (window.matchMedia('(max-width: 900px)').matches) {
            elMapa.scrollIntoView({ behavior: MOVIMENTO_REDUZIDO_MAPA ? 'auto' : 'smooth', block: 'start' });
        }
        const abrir = () => fotosProntas(local) ? abrirPopupFotos(i) : marcador.openTooltip();
        // Voo suave ate a cidade; no zoom 8 os pins ja estao soltos (sem
        // grupo), entao o cartao abre direto sobre o pin
        const destino = L.latLng(local.lat, local.lng);
        const zoom = Math.max(map.getZoom(), 8);
        if (map.getCenter().distanceTo(destino) < 2000 && map.getZoom() >= 8) { abrir(); return; }
        // Abre o cartao so quando o voo chegar (um movimento anterior que
        // ainda esteja terminando nao conta)
        if (esperaVoo) map.off('moveend', esperaVoo);   // descarta a espera de um voo anterior
        const aoChegar = () => {
            if (map.getZoom() >= zoom - 0.1 && map.getCenter().distanceTo(destino) < 5000) {
                map.off('moveend', aoChegar); esperaVoo = null; voando = false; abrir();
            }
        };
        esperaVoo = aoChegar;
        map.stop();
        voando = true;
        map.on('moveend', aoChegar);
        map.flyTo(destino, zoom, { duration: MOVIMENTO_REDUZIDO_MAPA ? 0 : 1, easeLinearity: 0.2 });
    }

    // Abas Cidades / Territorios (pagina Onde Estamos)
    const abas = [...document.querySelectorAll('.abas-mapa [role="tab"]')];
    abas.forEach(aba => aba.addEventListener('click', () => {
        abas.forEach(a => {
            const ativa = a === aba;
            a.setAttribute('aria-selected', ativa);
            document.getElementById(a.getAttribute('aria-controls')).hidden = !ativa;
        });
    }));

    // Foto ampliada: clique na miniatura; setas trocam, Esc fecha
    // ---------- Pop-up de fotos sobre o pin ----------
    // Ao abrir uma cidade com fotos, um cartao com a foto aparece em cima
    // do pin, com setas para passar. Clicar na foto amplia (visor).
    const popupFotos = L.popup({ className: 'popup-fotos-wrap', maxWidth: 320, minWidth: 260, autoPanPadding: [24, 24], closeButton: true });
    function abrirPopupFotos(i, n = 0) {
        const { local, marcador } = pins[i];
        const fotos = local.fotos || [];
        if (!fotos.length) {
            // Sem fotos ainda: cartao pequeno, so com o nome e o aviso
            popupFotos.setLatLng(marcador.getLatLng()).setContent(`
                <div class="popup-fotos popup-sem-fotos">
                    <div class="pf-rodape">
                        <strong>${escapar(local.nome)}</strong>
                        <span class="pf-onde">${escapar(local.uf || local.pais || '')}</span>
                    </div>
                    <p class="pf-aviso">Fotos em breve</p>
                </div>`);
            if (!map.hasLayer(popupFotos)) popupFotos.openOn(map);
            return;
        }
        n = (n + fotos.length) % fotos.length;
        const f = fotos[n];
        popupFotos.setLatLng(marcador.getLatLng()).setContent(`
            <div class="popup-fotos" data-local="${i}" data-n="${n}">
                <button type="button" class="pf-foto" aria-label="Ampliar foto">
                    <img src="${escapar(f.src)}" alt="${escapar(f.legenda || local.nome)}">
                </button>
                ${f.legenda ? `<p class="pf-legenda">${escapar(f.legenda)}</p>` : ''}
                <div class="pf-rodape">
                    <strong>${escapar(local.nome)}</strong>
                    ${fotos.length > 1 ? `<span class="pf-setas">
                        <button type="button" class="pf-ant" aria-label="Foto anterior">‹</button>
                        <span>${n + 1} / ${fotos.length}</span>
                        <button type="button" class="pf-prox" aria-label="Próxima foto">›</button>
                    </span>` : ''}
                </div>
            </div>`);
        if (!map.hasLayer(popupFotos)) popupFotos.openOn(map);
        // O Leaflet nao deixa o clique sair do pop-up: escuta nele mesmo
        const el = popupFotos.getElement();
        if (el && !el.dataset.ouvindo) { el.dataset.ouvindo = '1'; el.addEventListener('click', cliquePopup); }
    }
    function cliquePopup(e) {
        const caixa = e.target.closest('.popup-fotos');
        if (!caixa) return;
        const i = +caixa.dataset.local, n = +caixa.dataset.n;
        // Troca o conteudo depois que o clique termina: se o botao clicado
        // sumir antes, o Leaflet acha que o clique foi no mapa e fecha o pop-up
        if (e.target.closest('.pf-ant')) setTimeout(() => abrirPopupFotos(i, n - 1));
        else if (e.target.closest('.pf-prox')) setTimeout(() => abrirPopupFotos(i, n + 1));
        else if (e.target.closest('.pf-foto')) abrirFoto(i, n);
    }

    const visor = document.createElement('div');
    visor.className = 'visor-foto';
    visor.hidden = true;
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.innerHTML = `
        <button type="button" class="visor-fechar" aria-label="Fechar">×</button>
        <button type="button" class="visor-ant" aria-label="Foto anterior">‹</button>
        <figure><img alt=""><figcaption></figcaption></figure>
        <button type="button" class="visor-prox" aria-label="Próxima foto">›</button>`;
    document.body.appendChild(visor);
    let visorLocal = null, visorN = 0;
    function abrirFoto(iLocal, n) {
        const fotos = LOCAIS[iLocal].fotos;
        visorLocal = iLocal; visorN = (n + fotos.length) % fotos.length;
        const f = fotos[visorN];
        visor.querySelector('img').src = f.src;
        visor.querySelector('img').alt = f.legenda || LOCAIS[iLocal].nome;
        visor.querySelector('figcaption').textContent = f.legenda || '';
        visor.querySelector('.visor-ant').hidden = visor.querySelector('.visor-prox').hidden = fotos.length < 2;
        visor.hidden = false;
        visor.querySelector('.visor-fechar').focus();
    }
    const fecharFoto = () => { visor.hidden = true; };
    document.addEventListener('click', (e) => {
        const mini = e.target.closest('.galeria-foto');
        if (mini) abrirFoto(+mini.dataset.local, +mini.dataset.foto);
    });
    visor.addEventListener('click', (e) => {
        if (e.target === visor || e.target.closest('.visor-fechar')) fecharFoto();
        else if (e.target.closest('.visor-ant')) abrirFoto(visorLocal, visorN - 1);
        else if (e.target.closest('.visor-prox')) abrirFoto(visorLocal, visorN + 1);
    });
    document.addEventListener('keydown', (e) => {
        if (visor.hidden) return;
        if (e.key === 'Escape') fecharFoto();
        if (e.key === 'ArrowLeft') abrirFoto(visorLocal, visorN - 1);
        if (e.key === 'ArrowRight') abrirFoto(visorLocal, visorN + 1);
    });
    const MOVIMENTO_REDUZIDO_MAPA = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Ponto de acesso para integracoes futuras (e testes)
    window.mapaConeSul = { map, camadas, pins, selecionarTerritorio, selecionarLocal, territorios: POR_ID };

    const carregar = (arquivo) => fetch(arquivo).then(r => {
        if (!r.ok) throw new Error(arquivo + ': HTTP ' + r.status);
        return r.json();
    });

    Promise.all([carregar('mapa/referencia.geojson'), carregar('mapa/territorios.geojson')])
        .then(([referencia, territorios]) => {
            // Referencia neutra, por baixo e sem interacao
            L.geoJSON(referencia, {
                interactive: false,
                smoothFactor: 1.5,
                style: { color: '#fef5e2', weight: 0.6, opacity: 0.14, lineJoin: 'round', fill: false }
            }).addTo(map);

            // Os seis territorios
            L.geoJSON(territorios, {
                smoothFactor: 1.2,
                filter: f => !!POR_ID[f.properties.id],
                style: f => estilo(POR_ID[f.properties.id], 'normal'),
                onEachFeature: (f, camada) => {
                    const t = POR_ID[f.properties.id];
                    camadas[t.id] = camada;
                    camada.on({
                        click: () => selecionarTerritorio(t.id),
                        mouseover: () => { if (t.id !== selecionado) camada.setStyle(estilo(t, 'hover')); },
                        mouseout: () => aplicarEstilo(t.id)
                    });
                }
            }).addTo(map);

            if (selecionado) aplicarEstilo(selecionado);
            adicionarLocais();
        })
        .catch(erro => {
            console.error('Mapa: falha ao carregar os limites geográficos.', erro);
            avisoMapa('Não foi possível carregar os limites do mapa.');
        });
});
