/* =========================================================
   CAMISETAS — dados da pagina camisetas.html (editaveis)
   Cada item vira um card na loja. Campos:
   - nome, descricao
   - preco: texto livre, ex. 'R$ 79,90' (vazio = "Preço em breve")
   - tamanhos: lista, ex. ['P', 'M', 'G', 'GG']
   - estoque (opcional): quantidade de cada tamanho, ex. { P: 10, M: 5 }.
     Mostrado no card ("10 unid."); tamanho com 0 aparece como esgotado.
     Atualizar a mao conforme as vendas.
   - medidas (opcional): tabela em centimetros. colunas = nomes das medidas;
     linhas = medidas de cada tamanho (null = ainda sem medida).
   - fotos: arquivos em img/loja/, ex. ['img/loja/cone-sul-verde-01.jpg']
     (a primeira e a capa; vazio = espaco reservado)
   - link: link de pagamento (Mercado Pago, PagSeguro...). Vazio = o
     botao aparece como "Em breve" e nao leva a lugar nenhum.
   O site nao processa pagamento: o botao abre a pagina do servico.
   ========================================================= */
const PRODUTOS = [
    {
        nome: 'Camiseta Cone Sul',
        descricao: 'Fronteiras que conectam a Cristo.',
        preco: 'R$ 180,00',
        tamanhos: ['P', 'M', 'G', 'GG'],
        estoque: { P: 10, M: 10, G: 5, GG: 2 },
        medidas: {
            colunas: ['Ombro', 'Largura', 'Comprimento'],
            linhas: { P: [40, 48, 68], M: [42, 51, 70], G: [44, 54, 72], GG: [46, 57, 74] }
        },
        fotos: ['img/loja/camiseta-cone-sul.webp'],
        link: 'https://gestaoweb.eklesiaonline.com.br/divulgacao/n/bb71fabe6c8b9ba2e74c'
    }
];
