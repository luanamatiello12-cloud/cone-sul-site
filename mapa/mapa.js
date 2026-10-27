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
(function () {
    const elMapa = document.getElementById('mapa-leaflet');
    if (!elMapa || typeof TERRITORIOS === 'undefined') return;

    const POR_ID = Object.fromEntries(TERRITORIOS.map(t => [t.id, t]));
    const camadas = {};          // id -> camada Leaflet do territorio
    let map = null;
    let selecionado = null;

    // ---------- Painel de informacoes ----------
    const escapar = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    function mostrarPainel(titulo, bandeira, html) {
        const corpo = document.querySelector('.card-body');
        corpo.style.transition = 'opacity 0.15s ease';
        corpo.style.opacity = '0';
        setTimeout(() => {
            document.getElementById('pasta-titulo').textContent = titulo;
            const elBandeira = document.getElementById('card-bandeira');
            elBandeira.querySelector('use').setAttribute('href', bandeira);
            elBandeira.style.visibility = 'visible';
            document.getElementById('pasta-info').innerHTML = html;
            corpo.style.opacity = '1';
        }, 150);
    }

    function preencherPainel(t) {
        const tipo = t.pais ? `${t.tipo} (${t.pais})` : t.tipo;
        mostrarPainel(t.nome, t.bandeira, `
            <dl class="ficha-territorio">
                <div><dt>Nome oficial</dt><dd>${escapar(t.nomeOficial)}</dd></div>
                <div><dt>Tipo</dt><dd>${escapar(tipo)}</dd></div>
                ${t.sigla ? `<div><dt>Sigla</dt><dd>${escapar(t.sigla)}</dd></div>` : ''}
            </dl>
            <div class="ficha-descricao">${t.descricao ? escapar(t.descricao) : '<em>Descrição em preparação.</em>'}</div>`);
    }

    // Ficha da cidade: onde fica e as fotos (mapa/locais.js -> fotos)
    function preencherLocal(local, i) {
        const t = POR_ID[local.territorio];
        const onde = local.uf ? `${t ? t.nome : local.uf} (${local.uf})` : local.pais;
        const fotos = local.fotos || [];
        const galeria = fotos.length
            ? `<div class="galeria-local">${fotos.map((f, n) => `
                <button type="button" class="galeria-foto" data-local="${i}" data-foto="${n}" aria-label="Ampliar foto ${n + 1}${f.legenda ? ': ' + escapar(f.legenda) : ''}">
                    <img src="${escapar(f.src)}" alt="${escapar(f.legenda || local.nome)}" loading="lazy">
                </button>`).join('')}</div>`
            : '<div class="galeria-vazia">Fotos em breve.</div>';
        mostrarPainel(local.nome, t ? t.bandeira : '#flag-br', `
            <dl class="ficha-territorio">
                <div><dt>${local.uf ? 'Estado' : 'País'}</dt><dd>${escapar(onde)}</dd></div>
            </dl>
            ${galeria}`);
    }

    // ---------- Estilos das camadas ----------
    const estilo = (t, modo) => ({
        color: t.pais ? '#3d5a24' : '#1b3a28',
        weight: modo === 'selecionado' ? 3.5 : modo === 'hover' ? 2.5 : 1.4,
        opacity: 1,
        fillColor: t.cor,
        fillOpacity: modo === 'selecionado' ? 0.85 : modo === 'hover' ? 0.72 : 0.5
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
        if (enquadrar && camadas[id]) map.flyToBounds(camadas[id].getBounds(), { padding: [30, 30], maxZoom: 6, duration: 0.6 });

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
    map = L.map(elMapa, {
        zoomControl: true,
        scrollWheelZoom: false,
        zoomSnap: 0.25,
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · limites: IBGE, Natural Earth',
        maxZoom: 19
    }).addTo(map);

    // Reajusta o tamanho quando o container muda (responsivo)
    if ('ResizeObserver' in window) new ResizeObserver(() => map.invalidateSize()).observe(elMapa);

    // ---------- Pins das cidades (mapa/locais.js) ----------
    const pins = [];
    const ICONE_PIN = L.divIcon({
        className: 'pin-local',
        html: '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31s10-11.2 10-19A10 10 0 0 0 2 12c0 7.8 10 19 10 19Z"/><circle cx="12" cy="12" r="4"/></svg>',
        iconSize: [24, 32],
        iconAnchor: [12, 31],
        tooltipAnchor: [0, -28],
        popupAnchor: [0, -28]
    });

    function adicionarLocais() {
        if (typeof LOCAIS === 'undefined' || !LOCAIS.length) return;
        const grupo = L.markerClusterGroup
            ? L.markerClusterGroup({
                showCoverageOnHover: false,
                spiderfyOnMaxZoom: true,
                maxClusterRadius: 38,
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
            marcador.bindTooltip(`<strong>${escapar(local.nome)}</strong> · ${escapar(onde)}`, { direction: 'top', className: 'mapa-dica' });
            marcador.on('click', () => selecionarLocal(i));
            grupo.addLayer(marcador);
            pins.push({ local, marcador });
        });
        grupo.addTo(map);
        grupoPins = grupo;

        const lista = document.getElementById('locais-lista');
        if (lista) montarLista(lista, grupo);
    }

    function marcarLocal(i) {
        document.querySelectorAll('.local-btn').forEach(b => b.classList.toggle('ativo', +b.dataset.i === i));
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
                <ul>${g.itens.map(({ local, i }) => `<li><button type="button" class="local-btn" data-i="${i}">${escapar(local.nome)}</button></li>`).join('')}</ul>
            </div>`).join('');

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
        if (!irAoPin) return;
        // No celular a lista fica abaixo do quadro: sobe ate as fotos
        if (window.matchMedia('(max-width: 900px)').matches) {
            document.querySelector('.card-info').scrollIntoView({ behavior: MOVIMENTO_REDUZIDO_MAPA ? 'auto' : 'smooth', block: 'start' });
        }
        const abrir = () => marcador.openTooltip();
        if (grupoPins && grupoPins.zoomToShowLayer) grupoPins.zoomToShowLayer(marcador, abrir);
        else { map.setView([local.lat, local.lng], 9); abrir(); }
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
                style: { color: '#8f9488', weight: 0.7, opacity: 0.9, fillColor: '#e9e6dc', fillOpacity: 0.35 }
            }).addTo(map);

            // Os seis territorios
            L.geoJSON(territorios, {
                filter: f => !!POR_ID[f.properties.id],
                style: f => estilo(POR_ID[f.properties.id], 'normal'),
                onEachFeature: (f, camada) => {
                    const t = POR_ID[f.properties.id];
                    camadas[t.id] = camada;
                    camada.bindTooltip(`<strong>${escapar(t.nome)}</strong><br>${escapar(t.rotulo)}`, { sticky: true, direction: 'top', className: 'mapa-dica' });
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
})();
