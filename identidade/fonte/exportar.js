// Gera os PDF vetoriais (identidade/pdf) e o manual (identidade/manual-identidade-cone-sul.pdf).
// uso, a partir da raiz do repositorio, depois do gerar.py:
//     node identidade/fonte/exportar.js
// Precisa do Playwright com Chromium. O Chromium imprime SVG embutido como
// vetor, entao os PDF abrem editaveis no Illustrator, CorelDRAW e Inkscape.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ID = path.resolve(__dirname, '..');
const SVG = path.join(ID, 'svg');
const PDF = path.join(ID, 'pdf');
fs.mkdirSync(PDF, { recursive: true });
const medidas = JSON.parse(fs.readFileSync(path.join(__dirname, 'medidas.json'), 'utf8'));

// SVG pronto para entrar no meio do HTML: sem width/height fixos nem <title>
const embutir = nome => fs.readFileSync(path.join(SVG, nome + '.svg'), 'utf8')
  .replace(/ width="[\d.]+" height="[\d.]+"/, '').replace(/<title>.*?<\/title>/, '').trim();

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();

  // 1. cada arte em PDF, do tamanho exato do desenho (1 unidade = 1 px = 0,2646 mm)
  for (const arq of fs.readdirSync(SVG).filter(a => a.endsWith('.svg')).sort()) {
    const txt = fs.readFileSync(path.join(SVG, arq), 'utf8');
    const [, l, a] = txt.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    await pagina.setContent(`<!DOCTYPE html><style>@page{size:${l}px ${a}px;margin:0}html,body{margin:0}
      svg{display:block;width:${l}px;height:${a}px}</style>${embutir(arq.slice(0, -4))}`);
    await pagina.pdf({ path: path.join(PDF, arq.replace(/\.svg$/, '.pdf')), width: `${l}px`, height: `${a}px`,
      printBackground: true, pageRanges: '1' });
  }

  // 2. o manual
  const larg = 110;  // largura (mm) da assinatura na pagina de construcao
  let html = fs.readFileSync(path.join(__dirname, 'manual.html'), 'utf8')
    .replace(/\{\{svg:([\w-]+)\}\}/g, (_, n) => embutir(n))
    .replace(/\{\{sede-x\}\}/g, (medidas.sede[0] / medidas.simbolo[0] * 100).toFixed(2))
    .replace(/\{\{sede-y\}\}/g, (medidas.sede[1] / medidas.simbolo[1] * 100).toFixed(2))
    .replace(/\{\{larg-construcao\}\}/g, larg)
    .replace(/\{\{x-mm\}\}/g, (medidas.x / medidas.principal[0] * larg).toFixed(2));
  const montado = path.join(__dirname, '.manual-montado.html');  // ao lado, para achar ../../fonts
  fs.writeFileSync(montado, html);
  await pagina.goto('file://' + montado);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.pdf({ path: path.join(ID, 'manual-identidade-cone-sul.pdf'), preferCSSPageSize: true, printBackground: true });
  fs.unlinkSync(montado);
  await navegador.close();
  console.log('ok: pdf/ e manual-identidade-cone-sul.pdf');
})();
