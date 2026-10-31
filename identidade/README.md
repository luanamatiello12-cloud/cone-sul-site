# Identidade visual — CONE SUL

| Arquivo | O que é |
|---|---|
| `manual-identidade-cone-sul.pdf` | Manual de identidade (13 páginas, A4 paisagem) |
| `svg/` | Todas as artes em SVG — site, Figma, Canva |
| `pdf/` | As mesmas artes em PDF vetorial — gráfica, Illustrator, CorelDRAW, Inkscape |
| `fonte/` | Scripts e modelo que geram tudo acima |

Os nomes são iguais nas duas pastas: `cone-sul-<assinatura>-<versão>`.

- **assinatura**: `principal` (CONE / SUL ao lado do símbolo), `horizontal` (com o slogan), `simbolo`, `icone-app`, `icone-quadrado`
- **versão**: `positiva` (verde sobre creme), `negativa` (creme e limão sobre verde), `-sem-fundo`, `mono-verde`, `mono-creme`, `mono-preto`
- **apoio**: `apoio-padrao-ondas-*`, `apoio-rosa-dos-ventos-*`

As letras estão convertidas em curvas: as artes abrem iguais sem a fonte instalada.

## Como o símbolo é feito

Não foi redesenhado à mão. O `fonte/gerar.py` monta o mapa a partir dos mesmos
contornos do mapa do site (`mapa/territorios.geojson` e `mapa/referencia.geojson`):

- **em cheio**: Argentina, Chile, Uruguai, Paraguai e o Sul do Brasil (PR, SC e RS unidos)
- **em ondas**: o resto da América do Sul, com arcos concêntricos centrados em **Chapecó**

Para mudar espessura ou espaçamento das ondas, mexa em `PASSO, TRACO` e `FOLGA`
no topo do script; para as cores, no dicionário `COR` (são as mesmas do `styles.css`).

## Gerar de novo

```bash
pip install shapely fonttools brotli
python3 -I identidade/fonte/gerar.py
node identidade/fonte/exportar.js
```

O primeiro gera os SVG; o segundo (Playwright + Chromium) gera os PDF vetoriais e o
manual a partir de `fonte/manual.html`. Ao mexer no manual, edite o modelo e rode o
`exportar.js` — não edite o PDF.

## Pendências

- **Licença da Advercase**: o arquivo da fonte não traz informação de direitos.
  Confirme a licença antes de enviar a fonte para gráficas ou designers de fora.
- **CMYK**: os valores do manual são referência. Peça prova de cor antes de
  tiragens grandes; os verdes escuros variam muito de papel para papel.
- **Uruguai no símbolo**: a arte antiga (`img/icone-512.png`) não deixa claro se o
  Uruguai estava em cheio. Aqui ele entra, porque o site define o Cone Sul como
  "Argentina, Chile, Uruguai, Paraguai e a região Sul do Brasil". Para tirar, remova
  `'UY'` de `campos` no `gerar.py`.
- A pasta `identidade/` está fora da publicação (`_config.yml`). Para usá-la como
  kit de imprensa no site, apague a linha `- identidade` de lá.
