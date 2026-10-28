# Contas de mantenedor e nível por contribuição

O site já está pronto para isto. Enquanto nada for configurado, o portal funciona em
**modo demonstração**: qualquer e-mail entra, sem contribuição. Para ver um nível,
abrir o portal com o valor no endereço: `portal.html?demo=1500` (Expansor),
`?demo=700` (Construtor), `?demo=150` (Semeador).

## Como funciona, quando ligado

1. A pessoa escolhe um plano (Semeador, Construtor, Expansor). O botão leva primeiro
   ao **cadastro** (`fazer-parte.html?plano=...`): nome, CPF, nascimento, igreja, e-mail
   e senha. A conta é criada nesse momento, ainda sem nível.
2. Concluído o cadastro, o site leva ao **link de pagamento** do plano
   (`LINKS_PAGAMENTO` no `app.js`). Quem já tem cadastro vai direto ao pagamento.
3. A plataforma avisa o **webhook** (`supabase/functions/webhook-pagamento`), que
   encontra o cadastro **pelo e-mail** do pagamento. Por isso o site pede para usar o
   mesmo e-mail nos dois. (Se o e-mail não tiver cadastro, o webhook cria a conta e
   manda um convite por e-mail, para ninguém que pagou ficar sem acesso.)
4. O banco calcula o **nível pelo valor** (regra em `supabase/schema.sql` e em `NIVEIS`
   no `app.js`; ao mudar, mude nos dois lugares):

   | Valor mensal (contribuição ativa) | Nível      |
   |-----------------------------------|------------|
   | a partir de R$ 1.000              | Expansor   |
   | de R$ 500 a R$ 999,99             | Construtor |
   | abaixo de R$ 500                  | Semeador   |
   | sem contribuição ativa            | sem nível  |

5. No portal, a pessoa vê o nível e os benefícios dele.
6. Se o valor mudar, o nível muda junto. Se cancelar ou atrasar, perde o nível.

Quem se cadastra e ainda não pagou tem conta, mas fica sem nível até a primeira
contribuição aprovada com o mesmo e-mail.

## Relatório do Eklesia (importação)

Enquanto a plataforma de pagamento não avisa sozinha, a equipe importa o relatório do
Eklesia em **`importar.html`** (página de bastidor, fora do menu):

1. Baixar o relatório de contribuições do Eklesia em Excel.
2. Abrir `importar.html` (logado com uma conta da **equipe**, ver abaixo) e escolher o
   arquivo. A página adivinha as colunas pelo título (e-mail, valor, nome, CPF,
   celular, nascimento, cidade, igreja); dá para trocar qualquer uma.
3. Se a mesma pessoa aparece em várias linhas (várias contribuições no período):
   somar, usar o maior valor ou a última linha.
4. Conferir a prévia (nível de cada pessoa) e clicar em **Importar cadastros**: quem é
   novo recebe o convite "seu cadastro está pronto"; quem já existe tem valor e nível
   atualizados. Dados que a pessoa já editou não são sobrescritos.
5. Opcional: "quem não estiver neste relatório perde o nível" (só afeta quem veio do
   Eklesia).

A leitura do Excel acontece no navegador; ao servidor (função `importar-planilha`) só vão
as linhas já organizadas. Só contas da tabela `equipe` conseguem importar.

## Ligar (uma vez)

### 1. Supabase
1. Criar um projeto em supabase.com, em nome da igreja.
2. **SQL Editor**: colar e rodar `supabase/schema.sql`.
3. **Authentication > URL Configuration**: em *Site URL* e *Redirect URLs*, colocar o
   endereço do site (ex.: `https://luanamatiello12-cloud.github.io/cone-sul-site/`).
4. **Authentication > Email Templates > Invite user**: ajustar o texto do e-mail
   ("Seu cadastro no Cone Sul está pronto...").
5. **Project Settings > API**: copiar a *Project URL* e a chave *anon public* para
   `CONTAS` no topo do `app.js`. Isso tira o portal do modo demonstração.

### 2. Funções (webhook e importação)
Com a [CLI do Supabase](https://supabase.com/docs/guides/cli):

```bash
supabase functions deploy importar-planilha
supabase functions deploy webhook-pagamento --no-verify-jwt
supabase secrets set PROVEDOR_PAGAMENTO=asaas \
  WEBHOOK_TOKEN=<uma senha longa inventada> \
  SITE_URL=https://luanamatiello12-cloud.github.io/cone-sul-site
# e a chave da plataforma escolhida:
supabase secrets set ASAAS_API_KEY=...            # Asaas
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=... # ou Mercado Pago
```

As chaves ficam só nos *secrets* do Supabase, **nunca** no código do site.

### 3. Equipe
Quem vai importar o relatório cria a conta pelo site (Faça parte) e é incluído na tabela
`equipe` (comando no fim do `schema.sql`).

### 4. Plataforma de pagamento (quando houver)
- Criar a contribuição mensal (assinatura) de cada plano e colar os links em
  `LINKS_PAGAMENTO` no `app.js`.
- Cadastrar o webhook na plataforma apontando para
  `https://<projeto>.supabase.co/functions/v1/webhook-pagamento`, com o `WEBHOOK_TOKEN`
  (Asaas: campo "token de autenticação"; Mercado Pago: `?token=...` no fim da URL).

Os tradutores do Asaas e do Mercado Pago (`provedores/`) foram escritos pela
documentação e **ainda não foram testados com uma conta real**: conferir no primeiro
pagamento de teste. Outra plataforma = um arquivo novo em `provedores/` no mesmo formato.

### 5. Antes de abrir ao público
- Atualizar a **Política de Privacidade**: o site passa a guardar CPF, telefone e dados
  da contribuição.
- Fazer um pagamento de teste de cada nível e conferir o portal.

## Testar sem plataforma
Com `PROVEDOR_PAGAMENTO=generico`, dá para simular um pagamento aprovado:

```bash
curl -X POST https://<projeto>.supabase.co/functions/v1/webhook-pagamento \
  -H "x-webhook-token: <WEBHOOK_TOKEN>" -H "content-type: application/json" \
  -d '{"id":"teste-1","email":"voce@exemplo.com","nome":"Maria Teste","valorMensal":700,"status":"ativa"}'
```

O e-mail de convite chega, o link abre o portal e o nível aparece como Construtor.
