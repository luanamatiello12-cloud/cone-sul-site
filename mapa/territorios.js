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
   - descricao: texto livre do painel (pode ficar vazio)

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
        cor: '#c9d780',
        rotulo: 'Foz do Iguaçu — o ponto de partida',
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
        cor: '#9fbf5a',
        rotulo: 'Sul do Brasil',
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
        cor: '#e2cf7d',
        rotulo: 'Sul do Brasil',
        descricao: 'SUL DO BRASIL\n\n[A preencher: papel do Rio Grande do Sul no projeto.]\n\n10,9 milhões de habitantes\n21,4% evangélicos · 60,6% católicos · 8,8% sem religião'
    },
    {
        id: 'PY',
        nome: 'Paraguai',
        nomeOficial: 'República do Paraguai',
        tipo: 'País',
        sigla: 'PY',
        bandeira: '#flag-py',
        cor: '#6fae8f',
        rotulo: 'Santa Rita — o próximo passo',
        descricao: 'O PRÓXIMO PASSO\nSanta Rita está entre as localidades contempladas para a próxima etapa do desenvolvimento missionário.\n\n6,1 milhões de habitantes\n93,3% com acesso à internet\n6% a 9,6% evangélicos · 88% católicos'
    },
    {
        id: 'AR',
        nome: 'Argentina',
        nomeOficial: 'República Argentina',
        tipo: 'País',
        sigla: 'AR',
        bandeira: '#flag-ar',
        cor: '#8db8d6',
        rotulo: 'Uma visão de expansão',
        descricao: 'UMA VISÃO DE EXPANSÃO\nO avanço para a Argentina integra a visão de longo prazo do CONE SUL.\n\n45,9 milhões de habitantes\n91% com acesso à internet\n17,4% evangélicos · 57,7% católicos · 22,4% sem religião'
    },
    {
        id: 'CL',
        nome: 'Chile',
        nomeOficial: 'República do Chile',
        tipo: 'País',
        sigla: 'CL',
        bandeira: '#flag-cl',
        cor: '#d9967a',
        rotulo: 'Fronteiras que ainda queremos atravessar',
        descricao: 'FRONTEIRAS QUE AINDA QUEREMOS ATRAVESSAR\nO Chile também faz parte da visão de expansão missionária.\n\n18,5 milhões de habitantes\n88% com acesso à internet\n16,3% evangélicos · 54% católicos · 25,8% sem religião (15 anos ou mais)'
    }
];
