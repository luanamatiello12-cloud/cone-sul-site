# Contas de mantenedor e nível por contribuição

O site já está pronto para isto. Enquanto nada for configurado, o portal funciona em
**modo demonstração**: qualquer e-mail entra, e um seletor na tela de login simula o
valor da contribuição para mostrar cada nível.

## Como funciona, quando ligado

1. A pessoa clica em um plano (Semeador, Construtor, Expansor) e paga a contribuição
   mensal na plataforma de pagamento.
2. A plataforma avisa o **webhook** (`supabase/functions/webhook-pagamento`).
3. Se a pessoa ainda não tem conta, o webhook cria a conta com os dados do pagamento
   (nome, e-mail, CPF, telefone) e o Supabase envia o e-mail de convite. O link do e-mail
   abre o portal já logado.
4. O banco calcula o **nível pelo valor** (regra em `supabase/schema.sql` e em `NIVEIS`
   no `app.js`; ao mudar, mude nos dois lugares):

   | Valor mensal (contribuição ativa) | Nível      |
   |-----------------------------------|------------|
   | a partir de R$ 1.000              | Expansor   |
   | de R$ 500 a R$ 999,99             | Construtor |
   | abaixo de R$ 500                  | Semeador   |
   | sem contribuição ativa            | sem nível  |

5. No portal, a pessoa vê o nível e os benefícios dele, confere o cadastro em
   **Meu cadastro**, altera o que quiser e pode definir uma senha.
6. Se o valor mudar, o nível muda junto. Se cancelar ou atrasar, perde o nível.

Quem se cadastra pelo **Faça parte** (sem pagar) tem conta, mas fica sem nível até a
primeira contribuição aprovada com o mesmo e-mail.

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

### 2. Webhook
Com a [CLI do Supabase](https://supabase.com/docs/guides/cli):

```bash
supabase functions deploy webhook-pagamento --no-verify-jwt
supabase secrets set PROVEDOR_PAGAMENTO=asaas \
  WEBHOOK_TOKEN=<uma senha longa inventada> \
  SITE_URL=https://luanamatiello12-cloud.github.io/cone-sul-site
# e a chave da plataforma escolhida:
supabase secrets set ASAAS_API_KEY=...            # Asaas
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=... # ou Mercado Pago
```

As chaves ficam só nos *secrets* do Supabase, **nunca** no código do site.

### 3. Plataforma de pagamento
- Criar a contribuição mensal (assinatura) de cada plano e colar os links em
  `LINKS_PAGAMENTO` no `app.js`.
- Cadastrar o webhook na plataforma apontando para
  `https://<projeto>.supabase.co/functions/v1/webhook-pagamento`, com o `WEBHOOK_TOKEN`
  (Asaas: campo "token de autenticação"; Mercado Pago: `?token=...` no fim da URL).

Os tradutores do Asaas e do Mercado Pago (`provedores/`) foram escritos pela
documentação e **ainda não foram testados com uma conta real**: conferir no primeiro
pagamento de teste. Outra plataforma = um arquivo novo em `provedores/` no mesmo formato.

### 4. Antes de abrir ao público
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
