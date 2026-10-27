"""Gera os GeoJSON do mapa a partir das fontes publicas (ver mapa/README.md).
uso: python3 -I gerar-geo.py <dir-ibge> <dir-natural-earth-10m> <saida>"""
import json, sys
from shapely.geometry import shape, mapping, MultiPolygon, Polygon
from shapely.ops import unary_union
ibge, ne, out = sys.argv[1:4]

def limpar(g, area_min):
    polys = list(g.geoms) if isinstance(g, MultiPolygon) else [g]
    polys = [Polygon(p.exterior) for p in polys if p.area > area_min and p.bounds[0] > -76.5]  # sem Pascoa/Juan Fernandez
    return MultiPolygon(polys) if len(polys) > 1 else polys[0]

def arredondar(geom, casas):
    def r(c): return [round(c[0], casas), round(c[1], casas)]
    m = mapping(geom)
    if m['type'] == 'Polygon':
        m['coordinates'] = [[r(c) for c in ring] for ring in m['coordinates']]
    else:
        m['coordinates'] = [[[r(c) for c in ring] for ring in poly] for poly in m['coordinates']]
    return m

feats = []
# Estados: uniao dos municipios do IBGE (divisas identicas entre si)
for cod, sigla in ((41, 'PR'), (42, 'SC'), (43, 'RS')):
    d = json.load(open(f'{ibge}/mun-{cod}.json'))
    g = unary_union([shape(f['geometry']).buffer(0) for f in d['features']]).buffer(0.0003).buffer(-0.0003)
    g = limpar(g, 0.00002).simplify(0.001, preserve_topology=True)
    feats.append({'type': 'Feature', 'properties': {'id': sigla, 'fonte': 'IBGE (malha municipal), via tbrugz/geodata-br'}, 'geometry': arredondar(g, 4)})
# Paises: Natural Earth 1:10m
p = json.load(open(f'{ne}/paises.geojson'))
for adm, sigla in (('Paraguay', 'PY'), ('Argentina', 'AR'), ('Chile', 'CL')):
    f = next(x for x in p['features'] if x['properties']['ADMIN'] == adm)
    g = limpar(shape(f['geometry']).buffer(0), 0.0005).simplify(0.002, preserve_topology=True)
    feats.append({'type': 'Feature', 'properties': {'id': sigla, 'fonte': 'Natural Earth 1:10m'}, 'geometry': arredondar(g, 4)})
json.dump({'type': 'FeatureCollection', 'features': feats}, open(f'{out}/territorios.geojson', 'w'), separators=(',', ':'), ensure_ascii=False)

# Referencia (neutra): demais paises da America do Sul + demais estados do Brasil
ref = []
for f in p['features']:
    pr = f['properties']
    if pr.get('CONTINENT') == 'South America' and pr['ADMIN'] not in ('Paraguay', 'Argentina', 'Chile', 'Brazil'):
        g = shape(f['geometry']).buffer(0).simplify(0.01, preserve_topology=True)
        ref.append({'type': 'Feature', 'properties': {'nome': pr['ADMIN'], 'tipo': 'pais'}, 'geometry': arredondar(g, 3)})
e = json.load(open(f'{ne}/estados.geojson'))
for f in e['features']:
    pr = f['properties']
    if pr.get('admin') == 'Brazil' and pr.get('name') not in ('Paraná', 'Santa Catarina', 'Rio Grande do Sul'):
        g = shape(f['geometry']).buffer(0).simplify(0.01, preserve_topology=True)
        ref.append({'type': 'Feature', 'properties': {'nome': pr['name'], 'tipo': 'estado-br'}, 'geometry': arredondar(g, 3)})
json.dump({'type': 'FeatureCollection', 'features': ref}, open(f'{out}/referencia.geojson', 'w'), separators=(',', ':'), ensure_ascii=False)
print('territorios:', [x['properties']['id'] for x in feats], '| referencia:', len(ref), 'feicoes', file=sys.stderr)
