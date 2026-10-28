/* =========================================================
   CAMISETAS — dados da pagina camisetas.html (editaveis)
   Cada item vira um card na loja. Campos:
   - nome, descricao
   - preco: texto livre, ex. 'R$ 79,90' (vazio = "Preço em breve")
   - tamanhos: lista, ex. ['P', 'M', 'G', 'GG']
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
        preco: '',
        tamanhos: ['P', 'M', 'G', 'GG'],
        fotos: [],
        link: ''
    }
];
