"""Gera as artes vetoriais da marca CONE SUL (pasta identidade/svg).

uso (a partir da raiz do repositorio):
    pip install shapely fonttools brotli
    python3 -I identidade/fonte/gerar.py

Tudo sai de dados que ja estao no repositorio:
- contornos: mapa/territorios.geojson e mapa/referencia.geojson
- letras:    fonts/advercase-*.woff2, convertidas em curvas (o SVG nao
             depende da fonte instalada para abrir igual em qualquer lugar)

Depois rode identidade/fonte/exportar.js para gerar os PDF vetoriais e o manual.
"""
import json, math, os
from shapely.geometry import shape, Point, MultiPolygon, Polygon
from shapely.ops import unary_union, transform
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, 'identidade', 'svg')
os.makedirs(SAIDA, exist_ok=True)

# ---------------------------------------------------------------- cores
COR = {
    'verde-900': '#0b2215', 'verde-800': '#122d1e', 'verde-700': '#1b3a28',
    'verde-600': '#2e5139', 'limao': '#c9d780', 'limao-escuro': '#5f7424',
    'creme': '#fef5e2',
}
CHAPECO = (-52.6152, -27.1004)  # sede; centro dos arcos

# ---------------------------------------------------------------- geografia
def merc(lon, lat):
    return lon, -math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))

def projetar(g):
    """Mercator, com o norte para cima (y cresce para o sul, como no SVG)."""
    def f(x, y, z=None):
        pts = [merc(a, b) for a, b in zip(x, y)]
        return [p[0] for p in pts], [p[1] for p in pts]
    return transform(f, g)  # noqa

terr = json.load(open(os.path.join(RAIZ, 'mapa', 'territorios.geojson')))['features']
ref = json.load(open(os.path.join(RAIZ, 'mapa', 'referencia.geojson')))['features']
geo = {f['properties']['id']: projetar(shape(f['geometry']).buffer(0)) for f in terr}
outros = {f['properties']['nome']: projetar(shape(f['geometry']).buffer(0)) for f in ref}

# Os campos do Cone Sul: Argentina, Chile, Uruguai, Paraguai e o Sul do Brasil
campos = {
    'AR': geo['AR'], 'CL': geo['CL'], 'PY': geo['PY'], 'UY': outros['Uruguay'],
    'BR-SUL': unary_union([geo['PR'], geo['SC'], geo['RS']]).buffer(0.02).buffer(-0.02),
}
continente = unary_union(list(geo.values()) + [g for n, g in outros.items() if n != 'Falkland Islands'])
continente = continente.buffer(0.05).buffer(-0.05)
# fora Galapagos e ilhas oceanicas: esticariam o quadro do simbolo
continente = MultiPolygon([p for p in continente.geoms if p.bounds[0] > merc(-82, 0)[0] and p.area > 0.05])
cone = unary_union(list(campos.values())).buffer(0.03).buffer(-0.03)

DIVISA = 0.11   # espessura da divisa entre os paises (graus projetados)
FOLGA = 0.55    # folga entre os arcos e o Cone Sul
paises = unary_union([g.buffer(-DIVISA / 2) for g in campos.values()])

def so_grandes(g, minimo):
    ps = list(g.geoms) if hasattr(g, 'geoms') else [g]
    ps = [p for p in ps if isinstance(p, Polygon) and p.area >= minimo]
    return MultiPolygon(ps) if len(ps) != 1 else ps[0]

paises = so_grandes(paises.simplify(0.02), 0.01)

cx, cy = merc(*CHAPECO)
PASSO, TRACO = 1.35, 0.62
fundo = continente.difference(cone.buffer(FOLGA))
aneis = []
r = 1.6
while r < 60:
    aneis.append(Point(cx, cy).buffer(r + TRACO / 2, 256).difference(Point(cx, cy).buffer(r - TRACO / 2, 256)))
    r += PASSO
arcos = so_grandes(unary_union(aneis).intersection(fundo).simplify(0.015), 0.02)

# ---------------------------------------------------------------- SVG util
def d_de(g, sx, ox, oy):
    """Polygon/MultiPolygon -> atributo d, escala sx, deslocamento ox/oy."""
    partes = []
    for p in (g.geoms if hasattr(g, 'geoms') else [g]):
        for anel in [p.exterior] + list(p.interiors):
            pts = [f'{(x - ox) * sx:.1f} {(y - oy) * sx:.1f}' for x, y in anel.coords[:-1]]
            partes.append('M' + 'L'.join(pts) + 'Z')
    return ''.join(partes)

# Quadro do simbolo: o que vai de arcos e paises juntos
x0, y0, x1, y1 = unary_union([arcos, paises]).bounds
ESC = 1000 / (y1 - y0)            # simbolo com 1000 de altura
SIMB_L, SIMB_A = (x1 - x0) * ESC, 1000.0
D_PAISES = d_de(paises, ESC, x0, y0)
D_ARCOS = d_de(arcos, ESC, x0, y0)
SEDE = ((cx - x0) * ESC, (cy - y0) * ESC)

def simbolo(cor_paises, cor_arcos, x=0, y=0, alt=1000):
    s = alt / SIMB_A
    return (f'<g transform="translate({x:.1f} {y:.1f}) scale({s:.5f})">'
            f'<path fill="{cor_arcos}" d="{D_ARCOS}"/>'
            f'<path fill="{cor_paises}" fill-rule="evenodd" d="{D_PAISES}"/></g>')

# ---------------------------------------------------------------- letras
FONTES = {p: TTFont(os.path.join(RAIZ, 'fonts', f'advercase-{p}.woff2')) for p in ('regular', 'bold')}

def texto(s, peso, x, y, corpo, cor, entreletra=0.0, ancora='inicio'):
    """Texto em curvas. y = linha de base. corpo = altura do em. entreletra em em."""
    f = FONTES[peso]
    gs, cmap, hmtx, upm = f.getGlyphSet(), f.getBestCmap(), f['hmtx'], f['head'].unitsPerEm
    k = corpo / upm
    nomes = [cmap[ord(c)] for c in s]
    largura = sum(hmtx[n][0] for n in nomes) * k + entreletra * corpo * (len(s) - 1)
    if ancora == 'meio':
        x -= largura / 2
    elif ancora == 'fim':
        x -= largura
    caminhos, cur = [], x
    for n in nomes:
        pen = SVGPathPen(gs, lambda v: f'{v:.1f}')
        gs[n].draw(TransformPen(pen, (k, 0, 0, -k, cur, y)))
        caminhos.append(pen.getCommands())
        cur += hmtx[n][0] * k + entreletra * corpo
    return f'<path fill="{cor}" d="{"".join(caminhos)}"/>', largura

def altura_maiuscula(peso):
    return FONTES[peso]['OS/2'].sCapHeight / FONTES[peso]['head'].unitsPerEm

# ---------------------------------------------------------------- versoes
VERSOES = {
    # nome: (fundo, letras, paises, arcos)
    'positiva':     (COR['creme'],     COR['verde-800'], COR['limao-escuro'], COR['verde-600']),
    'negativa':     (COR['verde-800'], COR['creme'],     COR['limao'],        COR['limao']),
    'mono-verde':   (None,             COR['verde-800'], COR['verde-800'],    COR['verde-800']),
    'mono-creme':   (None,             COR['creme'],     COR['creme'],        COR['creme']),
    'mono-preto':   (None,             '#000000',        '#000000',           '#000000'),
}

def svg(l, a, corpo, fundo=None, titulo='CONE SUL'):
    bg = f'<rect width="{l:.1f}" height="{a:.1f}" fill="{fundo}"/>' if fundo else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {l:.1f} {a:.1f}" '
            f'width="{l:.0f}" height="{a:.0f}"><title>{titulo}</title>{bg}{corpo}</svg>\n')

def salvar(nome, conteudo):
    with open(os.path.join(SAIDA, nome), 'w', encoding='utf-8') as f:
        f.write(conteudo)

def assinatura_vertical(letras, paises, arcos):
    """Principal: CONE / SUL empilhado a esquerda, simbolo a direita."""
    corpo = 300
    ch = altura_maiuscula('regular') * corpo
    entre = ch * 0.30
    alt_texto = 2 * ch + entre
    alt_simb = alt_texto * 1.55
    margem = alt_simb * 0.06
    topo_texto = margem + (alt_simb - alt_texto) * 0.42
    t1, w1 = texto('CONE', 'regular', margem, topo_texto + ch, corpo, letras, 0.02)
    t2, w2 = texto('SUL', 'regular', margem, topo_texto + 2 * ch + entre, corpo, letras, 0.02)
    xs = margem + max(w1, w2) + ch * 0.22
    s = simbolo(paises, arcos, xs, margem, alt_simb)
    l = xs + SIMB_L * alt_simb / SIMB_A + margem
    return l, alt_simb + 2 * margem, t1 + t2 + s

def assinatura_horizontal(letras, paises, arcos, slogan=True):
    """Simbolo a esquerda, CONE SUL numa linha e o slogan embaixo."""
    alt_simb = 1000
    corpo = 300
    ch = altura_maiuscula('regular') * corpo
    margem = 60
    xs = margem + SIMB_L + 70
    s = simbolo(paises, arcos, margem, margem, alt_simb)
    base = margem + alt_simb * (0.48 if slogan else 0.5) + ch / 2
    t, w = texto('CONE SUL', 'regular', xs, base, corpo, letras, 0.03)
    corpo_s = 0
    if slogan:
        corpo_s = 68
        t2, w2 = texto('FRONTEIRAS QUE CONECTAM A CRISTO', 'regular', xs + 6, base + ch * 0.62 + corpo_s * 0.7,
                       corpo_s, letras, 0.08)
        t += t2
        w = max(w, w2 + 6)
    return xs + w + margem, alt_simb + 2 * margem, s + t

def icone(fundo, paises, arcos, raio=True):
    lado = 1024
    alt = lado * 0.80
    l = SIMB_L * alt / SIMB_A
    # centra pelo conjunto, puxando de leve para cima (o sul afina)
    bg = f'<rect width="{lado}" height="{lado}" rx="{lado * 0.22 if raio else 0:.0f}" fill="{fundo}"/>'
    return svg(lado, lado, bg + simbolo(paises, arcos, (lado - l) / 2, (lado - alt) / 2, alt))

for nome, (fundo, letras, paises_c, arcos_c) in VERSOES.items():
    l, a, c = assinatura_vertical(letras, paises_c, arcos_c)
    salvar(f'cone-sul-principal-{nome}.svg', svg(l, a, c, fundo if nome in ('positiva', 'negativa') else None))
    l, a, c = assinatura_horizontal(letras, paises_c, arcos_c)
    salvar(f'cone-sul-horizontal-{nome}.svg', svg(l, a, c, fundo if nome in ('positiva', 'negativa') else None))
    salvar(f'cone-sul-simbolo-{nome}.svg',
           svg(SIMB_L, SIMB_A, simbolo(paises_c, arcos_c), None))
salvar('cone-sul-simbolo-bicolor-verde.svg', svg(SIMB_L, SIMB_A, simbolo(COR['limao-escuro'], COR['verde-600'])))

# versoes sem fundo das coloridas (para aplicar sobre fotos e materiais)
for nome in ('positiva', 'negativa'):
    _, letras, p, a_ = VERSOES[nome]
    l, a, c = assinatura_vertical(letras, p, a_)
    salvar(f'cone-sul-principal-{nome}-sem-fundo.svg', svg(l, a, c))
    l, a, c = assinatura_horizontal(letras, p, a_)
    salvar(f'cone-sul-horizontal-{nome}-sem-fundo.svg', svg(l, a, c))

salvar('cone-sul-icone-app.svg', icone(COR['verde-800'], COR['limao'], COR['limao']))
salvar('cone-sul-icone-quadrado.svg', icone(COR['verde-800'], COR['limao'], COR['limao'], raio=False))

# ---------------------------------------------------------------- elementos de apoio
def rosa_dos_ventos(cor, cor_letras=None):
    """A rosa da estampa (styles.css, .estampa-rosa), com pontas facetadas."""
    cor_letras = cor_letras or cor
    pontas = []
    for ang, comp, op in [(0, 46, 1), (90, 46, 1), (180, 46, 1), (270, 46, 1),
                          (45, 28, .75), (135, 28, .75), (225, 28, .75), (315, 28, .75)]:
        lg = 5 if comp == 46 else 3.5
        pontas.append(f'<g transform="rotate({ang})" opacity="{op}">'
                      f'<path fill="{cor}" d="M0 {-comp} L{lg} 0 L0 0Z"/>'
                      f'<path fill="{cor}" opacity=".55" d="M0 {-comp} L{-lg} 0 L0 0Z"/></g>')
    letras = ''
    for t, x, y in (('N', 0, -52), ('L', 54, 2.6), ('S', 0, 58), ('O', -54, 2.6)):
        letras += texto(t, 'bold', x, y, 8, cor_letras, ancora='meio')[0]
    aros = (f'<g fill="none" stroke="{cor}" stroke-width="1"><circle r="20"/><circle r="24"/></g>')
    return svg(130, 130, f'<g transform="translate(65 65)">{aros}{"".join(pontas)}{letras}</g>')

salvar('apoio-rosa-dos-ventos-limao.svg', rosa_dos_ventos(COR['limao']))
salvar('apoio-rosa-dos-ventos-verde.svg', rosa_dos_ventos(COR['verde-800']))

def padrao_ondas(cor, fundo=None, l=1600, a=900):
    """Arcos concentricos que saem de um canto: o 'alcance' da missao."""
    linhas = ''.join(f'<circle cx="0" cy="{a}" r="{r}"/>' for r in range(120, int(math.hypot(l, a)) + 40, 34))
    bg = f'<rect width="{l}" height="{a}" fill="{fundo}"/>' if fundo else ''
    return svg(l, a, f'{bg}<g fill="none" stroke="{cor}" stroke-width="3" opacity=".9">{linhas}</g>')

salvar('apoio-padrao-ondas-limao.svg', padrao_ondas(COR['limao'], COR['verde-800']))
salvar('apoio-padrao-ondas-verde.svg', padrao_ondas(COR['verde-600'], COR['creme']))
salvar('apoio-padrao-ondas-limao-transparente.svg', padrao_ondas(COR['limao']))

with open(os.path.join(RAIZ, 'identidade', 'fonte', 'medidas.json'), 'w') as f:
    l, a, _ = assinatura_vertical('#000', '#000', '#000')
    json.dump({'simbolo': [round(SIMB_L, 1), SIMB_A], 'sede': [round(SEDE[0], 1), round(SEDE[1], 1)],
               'principal': [round(l, 1), round(a, 1)], 'x': round(altura_maiuscula('regular') * 300, 1)}, f)
print('ok:', len(os.listdir(SAIDA)), 'arquivos em', SAIDA)
