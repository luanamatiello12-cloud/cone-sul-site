# Mapa interativo

Usado nas páginas **Início** e **Onde Estamos** (`<div id="mapa-leaflet">`).

| Arquivo | O que é |
|---|---|
| `territorios.js` | Dados editáveis dos seis territórios: nome, nome oficial, tipo, sigla, cor, rótulo e descrição. **Para mudar textos, mexa só aqui.** |
| `mapa.js` | Lógica do mapa (Leaflet): camadas, clique, destaque, zoom, lista lateral e painel. |
| `territorios.geojson` | Limites dos seis territórios em destaque (ligados pelo campo `id`). |
| `referencia.geojson` | Demais países da América do Sul e demais estados do Brasil, em tom neutro. |
| `fontes/gerar-geo.py` | Script que gera os dois GeoJSON a partir das fontes abaixo. |

## Fontes geográficas

- **Paraná, Santa Catarina e Rio Grande do Sul:** malha municipal do **IBGE**,
  redistribuída em domínio público (CC0) por
  [tbrugz/geodata-br](https://github.com/tbrugz/geodata-br) (`geojs-41/42/43-mun.json`).
  Cada estado é a união dos seus municípios, então as divisas entre PR, SC e RS
  são as oficiais e coincidem exatamente. A Lagoa dos Patos e a Lagoa Mirim
  aparecem como água, como na malha do IBGE.
- **Argentina, Chile e Paraguai:** [Natural Earth](https://www.naturalearthdata.com/)
  1:10m (`ne_10m_admin_0_countries`), domínio público.
- **Referência neutra:** Natural Earth 1:10m — países (`admin_0`) e estados do
  Brasil (`admin_1`).
- **Mapa de base:** © OpenStreetMap, com atribuição no canto do mapa.

Simplificação: estados a ~100 m, países a ~200 m, referência a ~1 km.
Ilhas do Pacífico (Páscoa, Juan Fernández) e ilhotas minúsculas ficam de fora.
Conferência de áreas (projeção Albers de área igual): PR, SC e Argentina batem
com as áreas oficiais em ±0,1%; RS dá −4,6% porque as lagoas são água;
Paraguai e Chile ficam 2–3% abaixo por ilhotas e corpos d'água.

## Como adicionar uma nova região

1. Gere a feição no GeoJSON (ajuste `fontes/gerar-geo.py` ou acrescente à mão
   uma `Feature` em `territorios.geojson`) com `properties.id` novo, ex. `"UY"`.
2. Acrescente em `territorios.js` um item com o mesmo `id`.
3. Se quiser na lista lateral, acrescente um `.info-item` com
   `data-territorio="UY"` no HTML da página.

Para regenerar:

```bash
python3 -I mapa/fontes/gerar-geo.py <pasta-com-mun-41/42/43.json> <pasta-natural-earth-10m> mapa
```
