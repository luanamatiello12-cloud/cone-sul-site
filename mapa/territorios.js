/* =========================================================
   TERRITORIOS DO MAPA — dados editaveis
   Cada item corresponde a uma feicao de mapa/territorios.geojson
   (ligacao pelo campo "id"). Para atualizar textos, mexa so aqui.
   Para incluir uma nova regiao: acrescente a feicao no GeoJSON com
   um "id" novo e um item aqui com o mesmo id.

   Campos:
   - nome, nomeOficial, tipo, pais (quando estado), sigla
   - bandeira: simbolo do sprite de bandeiras (app.js)
   - cor: cor de destaque no mapa
   - rotulo: frase curta da lista e da dica ao passar o mouse
   - texto: frase do quadro (pode ficar vazio)
   - populacao, naoCristaos (pessoas que ainda nao conhecem a Cristo,
     numeros da arte da equipe; so paises), religiao: [nome, %, rotulo?]
     (as barras do quadro; "rotulo" troca o % mostrado, ex. uma faixa)
   - descricao: texto antigo, usado so se nao houver religiao

   Estados do Sul: populacao e religiao do Censo 2022 (IBGE; religiao
   sobre a populacao de 10 anos ou mais). Paises: populacao e religiao
   do estudo do projeto (docs/DADOS-E-FONTES.md no repositorio
   cone-sul). O % de internet dos paises e o da versao anterior, de
   origem nao documentada.
   ========================================================= */
const TERRITORIOS = [
    {
        id: 'PR',
        nome: 'Paraná',
        nomeOficial: 'Estado do Paraná',
        tipo: 'Estado',
        pais: 'Brasil',
        sigla: 'PR',
        bandeira: '#flag-br',
        cor: '#e6c766',
        rotulo: 'Foz do Iguaçu — o ponto de partida',
        texto: 'Foz do Iguaçu representa o início da estruturação da nossa jornada missionária. Uma região estratégica de conexão entre países, culturas e pessoas.',
        populacao: '11,4 milhões',
        religiao: [['Católicos', 62.9], ['Evangélicos', 26.1], ['Sem religião', 6], ['Outras', 5]],
        descricao: 'FOZ DO IGUAÇU\nO ponto de partida\n\nFoz do Iguaçu representa o início da estruturação da nossa jornada missionária. Uma região estratégica de conexão entre países, culturas e pessoas.\n\n11,4 milhões de habitantes\n26,1% evangélicos · 62,9% católicos · 6% sem religião'
    },
    {
        id: 'SC',
        nome: 'Santa Catarina',
        nomeOficial: 'Estado de Santa Catarina',
        tipo: 'Estado',
        pais: 'Brasil',
        sigla: 'SC',
        bandeira: '#flag-br',
        cor: '#f0d98e',
        rotulo: 'Sul do Brasil',
        texto: '',
        populacao: '7,6 milhões',
        religiao: [['Católicos', 64.3], ['Evangélicos', 23.4], ['Sem religião', 6.3], ['Outras', 6]],
        descricao: 'SUL DO BRASIL\n\n[A preencher: papel de Santa Catarina no projeto.]\n\n7,6 milhões de habitantes\n23,4% evangélicos · 64,3% católicos · 6,3% sem religião'
    },
    {
        id: 'RS',
        nome: 'Rio Grande do Sul',
        nomeOficial: 'Estado do Rio Grande do Sul',
        tipo: 'Estado',
        pais: 'Brasil',
        sigla: 'RS',
        bandeira: '#flag-br',
        cor: '#f6e7b5',
        rotulo: 'Sul do Brasil',
        texto: '',
        populacao: '10,9 milhões',
        religiao: [['Católicos', 60.6], ['Evangélicos', 21.4], ['Sem religião', 8.8], ['Outras', 9.2]],
        descricao: 'SUL DO BRASIL\n\n[A preencher: papel do Rio Grande do Sul no projeto.]\n\n10,9 milhões de habitantes\n21,4% evangélicos · 60,6% católicos · 8,8% sem religião'
    },
    {
        id: 'PY',
        nome: 'Paraguai',
        nomeOficial: 'República do Paraguai',
        tipo: 'País',
        sigla: 'PY',
        bandeira: '#flag-py',
        cor: '#9fbe6a',
        rotulo: 'Santa Rita — o próximo passo',
        texto: 'Santa Rita está entre as localidades contempladas para a próxima etapa do desenvolvimento missionário.',
        populacao: '6,1 milhões',
        naoCristaos: '5,7 mi',
        religiao: [['Católicos', 88], ['Evangélicos', 7.8, '6% a 9,6%'], ['Outras e sem religião', 4.2, 'cerca de 4%']],
        descricao: 'O PRÓXIMO PASSO\nSanta Rita está entre as localidades contempladas para a próxima etapa do desenvolvimento missionário.\n\n6,1 milhões de habitantes\n93,3% com acesso à internet\n6% a 9,6% evangélicos · 88% católicos'
    },
    {
        id: 'AR',
        nome: 'Argentina',
        nomeOficial: 'República Argentina',
        tipo: 'País',
        sigla: 'AR',
        bandeira: '#flag-ar',
        cor: '#c3d68f',
        rotulo: 'Uma visão de expansão',
        texto: 'O avanço para a Argentina integra a visão de longo prazo do CONE SUL.',
        populacao: '45,9 milhões',
        naoCristaos: '42,2 mi',
        religiao: [['Católicos', 57.7], ['Sem religião', 22.4], ['Evangélicos', 17.4], ['Outras', 2.5]],
        descricao: 'UMA VISÃO DE EXPANSÃO\nO avanço para a Argentina integra a visão de longo prazo do CONE SUL.\n\n45,9 milhões de habitantes\n91% com acesso à internet\n17,4% evangélicos · 57,7% católicos · 22,4% sem religião'
    },
    {
        id: 'CL',
        nome: 'Chile',
        nomeOficial: 'República do Chile',
        tipo: 'País',
        sigla: 'CL',
        bandeira: '#flag-cl',
        cor: '#7d9f52',
        rotulo: 'Fronteiras que ainda queremos atravessar',
        texto: 'O Chile também faz parte da visão de expansão missionária.',
        populacao: '18,5 milhões',
        naoCristaos: '17,8 mi',
        religiao: [['Católicos', 54], ['Sem religião', 25.8], ['Evangélicos', 16.3], ['Outras', 3.9]],
        notaReligiao: 'Religião: população de 15 anos ou mais.',
        descricao: 'FRONTEIRAS QUE AINDA QUEREMOS ATRAVESSAR\nO Chile também faz parte da visão de expansão missionária.\n\n18,5 milhões de habitantes\n88% com acesso à internet\n16,3% evangélicos · 54% católicos · 25,8% sem religião (15 anos ou mais)'
    }
];
