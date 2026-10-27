/* =========================================================
   LOCAIS — pins do mapa da pagina Onde Estamos (dados editaveis)
   Cada item vira um pin. "territorio" liga o pin ao territorio de
   mapa/territorios.js (clicar no pin tambem seleciona o territorio).

   Coordenadas da sede de cada municipio:
   - Brasil: cadastro de municipios do IBGE (codigo IBGE ao lado), via
     github.com/kelvins/municipios-brasileiros
   - Ciudad del Este: GeoNames (geonames.org, id 3439101)

   Para incluir uma cidade: acrescente um item com nome, uf (ou pais),
   territorio, lat e lng. A ordem aqui e a ordem da lista ao lado do mapa.

   FOTOS: cada cidade tem "fotos", uma lista que aparece no quadro ao lado
   do mapa quando a cidade e clicada. Coloque os arquivos em
   img/locais/<cidade>/ e liste assim:
       fotos: [
           { src: 'img/locais/chapeco/01.jpg', legenda: 'Culto em Chapecó' },
           { src: 'img/locais/chapeco/02.jpg', legenda: '' }
       ]
   Com a lista vazia, o quadro mostra "Fotos em breve".
   ========================================================= */
const LOCAIS = [
    { nome: 'Itajaí',           uf: 'SC', territorio: 'SC', lat: -26.9101, lng: -48.6705, fotos: [] },   // 4208203
    { nome: 'Barra Velha',      uf: 'SC', territorio: 'SC', lat: -26.6370, lng: -48.6933, fotos: [] },   // 4202107
    { nome: 'Chapecó',          uf: 'SC', territorio: 'SC', lat: -27.1004, lng: -52.6152, fotos: [] },   // 4204202
    { nome: 'Cordilheira Alta', uf: 'SC', territorio: 'SC', lat: -26.9844, lng: -52.6056, fotos: [] },   // 4204350
    { nome: 'Palmitos',         uf: 'SC', territorio: 'SC', lat: -27.0702, lng: -53.1586, fotos: [] },   // 4212106
    { nome: 'Guatambú',         uf: 'SC', territorio: 'SC', lat: -27.1341, lng: -52.7887, fotos: [] },   // 4206652
    { nome: 'Caxambu do Sul',   uf: 'SC', territorio: 'SC', lat: -27.1624, lng: -52.8807, fotos: [] },   // 4204103
    { nome: 'Pinhalzinho',      uf: 'SC', territorio: 'SC', lat: -26.8495, lng: -52.9913, fotos: [] },   // 4212908
    { nome: 'Blumenau',         uf: 'SC', territorio: 'SC', lat: -26.9155, lng: -49.0709, fotos: [] },   // 4202404
    { nome: 'Rio dos Índios',   uf: 'RS', territorio: 'RS', lat: -27.2973, lng: -52.8417, fotos: [] },   // 4315552
    { nome: 'Tapera',           uf: 'RS', territorio: 'RS', lat: -28.6277, lng: -52.8613, fotos: [] },   // 4321006
    { nome: 'Carazinho',        uf: 'RS', territorio: 'RS', lat: -28.2958, lng: -52.7933, fotos: [] },   // 4304705
    { nome: 'Porto Xavier',     uf: 'RS', territorio: 'RS', lat: -27.9082, lng: -55.1379, fotos: [] },   // 4315107
    { nome: 'Foz do Iguaçu',    uf: 'PR', territorio: 'PR', lat: -25.5427, lng: -54.5827, fotos: [] },   // 4108304
    { nome: 'Ciudad del Este',  pais: 'Paraguai', territorio: 'PY', lat: -25.5097, lng: -54.6111, fotos: [] }
];
