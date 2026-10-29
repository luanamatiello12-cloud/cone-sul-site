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
2. Entrar em `editar.html` com uma conta da **equipe** (ver abaixo), abrir **Importar
   relatório do Eklesia** (`importar.html`) e escolher o
   arquivo. A página adivinha as colunas pelo título (e-mail, valor, nome, CPF,
   celular, nascimento, cidade, igreja); dá para trocar qualquer uma.
3. Se a mesma pessoa aparece em várias linhas (várias contribuições no período):
   somar, usar o maior valor ou a última linha.
4. Conferir a prévia (nível de cada pessoa) e clicar em **Importar cadastros**:
   - quem é **novo** ganha um login pronto: o e-mail e uma **senha provisória**
     (`Cone-` e oito letras e números, ex.: `Cone-7KQ4-M9TX`);
   - quem **já existe** tem valor e nível atualizados (dados que a pessoa já editou não
     são sobrescritos; a senha não muda).
5. Aparece a lista **Enviar os acessos**: para cada pessoa nova, a senha e o botão
   **Enviar no WhatsApp**, que abre a conversa com o celular do relatório e a mensagem
   pronta (site, login e senha). Também dá para copiar a mensagem.
   **As senhas aparecem só nessa hora** (não ficam guardadas em lugar nenhum): enviar
   antes de fechar a página. Perdeu? Em **Nova senha provisória**, gerar outra pelo e-mail.
6. A pessoa entra no portal com e-mail e senha. Enquanto usa a senha provisória, o portal
   sugere trocar (opcional). **Esqueci minha senha** manda um link por e-mail.
7. Opcional: "quem não estiver neste relatório perde o nível" (só afeta quem veio do
   Eklesia).

A leitura do Excel acontece no navegador; ao servidor (função `importar-planilha`) só vão
as linhas já organizadas. Só contas da tabela `equipe` conseguem importar.

## Ligar (uma vez)

### 1. Supabase
1. Criar um projeto em supabase.com, em nome da igreja.
2. **SQL Editor**: colar e rodar `supabase/schema.sql`.
3. **Authentication > URL Configuration**: em *Site URL* e *Redirect URLs*, colocar o
   endereço do site (ex.: `https://luanamatiello12-cloud.github.io/cone-sul-site/`).
4. **Authentication > Email Templates**: traduzir para o português o e-mail de
   **Reset password** ("Esqueci minha senha") e o de **Invite user** (usado só pelo
   webhook de pagamento, se um dia for ligado).
5. **Authentication > Providers > Email**: deixar ligado, com **"Confirm email" ligado**
   (sem ele, alguém poderia criar conta com o e-mail de outra pessoa; os logins criados
   pela importação já nascem confirmados). **Minimum password length: 8**.
   - **Authentication > Attack Protection**: ligar **Captcha protection** com o
     Cloudflare Turnstile (conta gratuita em cloudflare.com > Turnstile > Add site).
     A *Secret key* vai no Supabase; a *Site key* vai em `CONTAS.captcha` no `app.js`.
     Ligar os dois juntos: um sem o outro faz o login falhar.
   - **Authentication > Sessions** (se o plano permitir): *JWT expiry* de 900 segundos.
     Depois de "Sair", um acesso copiado deixa de valer em até 15 minutos.
6. **Project Settings > API**: copiar a *Project URL* e a chave *anon public* para
   `CONTAS` no topo do `app.js`. Isso tira o portal do modo demonstração.

### 2. Funções (webhook e importação)
Com a [CLI do Supabase](https://supabase.com/docs/guides/cli):

```bash
supabase functions deploy importar-planilha
supabase functions deploy webhook-pagamento --no-verify-jwt
supabase secrets set PROVEDOR_PAGAMENTO=asaas \
  WEBHOOK_TOKEN=<uma senha longa inventada> \
  SITE_URL=https://luanamatiello12-cloud.github.io/cone-sul-site
# Endereços de onde a importação pode ser chamada (padrão: o do SITE_URL).
# Com domínio próprio, listar os dois enquanto durar a troca:
supabase secrets set ORIGENS_PERMITIDAS=https://conesul.org.br,https://luanamatiello12-cloud.github.io
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

### Conteúdo só para mantenedores
O HTML do site é público (qualquer um vê o código-fonte), então o que é exclusivo
fica no banco:
- **Notícias** (`noticias.html`): tabela `noticias`. Só quem entrou com uma conta lê.
  A equipe publica pelo **Table Editor > noticias > Insert row** (categoria: `diario`,
  `noticias`, `historias`, `projetos` ou `contas`; título; resumo; foto e link opcionais).
- **Conteúdo por nível** (ex.: links dos workshops): tabela `conteudo_restrito`, uma linha
  por bloco, com os níveis que podem ler (`niveis`). Ainda não há nenhum: quando houver,
  a página que mostra o conteúdo é ajustada junto.

### Painel (editar.html)
Além de editar textos nas páginas, a equipe muda pelo painel, sem código:
- **Contatos do rodapé e links de pagamento** dos planos;
- **Camisetas**: nome, preço, descrição, tamanhos, estoque, medidas, fotos e link;
- **Cidades do mapa**: fotos (ordem e legenda), mostrar/esconder, cidade nova;
- **Notícias**: publicar, esconder e apagar (tabela `noticias`).

Os três primeiros são a "configuração do site": cada **Salvar** grava uma versão em
`site_edicoes` com `pagina = '_config'` (o **Histórico** do painel volta a uma anterior).
O que está no código (`app.js`, `loja/produtos.js`, `mapa/locais.js`) vale até o
painel mudar aquela parte.

### Registro de atividades
Cada importação e cada senha provisória nova ficam em **Table Editor >
registro_atividades** (quem fez, quando e, na senha nova, para qual e-mail).
A senha nova não pode ser gerada para contas da equipe: elas usam "Esqueci minha senha".

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
