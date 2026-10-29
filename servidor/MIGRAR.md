# Migração: ligar o banco de dados, o domínio e o editor

Tudo já está pronto no código. Este é o roteiro do dia da migração: o que vocês
fazem, o que vocês me passam e o que eu faço.

## 1. O que vocês fazem (antes de me chamar)

### Banco de dados (Supabase)
1. Criar uma conta em **supabase.com** com o e-mail da igreja.
2. **New project**: nome `cone-sul`, região **South America (São Paulo)**, criar uma
   senha forte do banco e **guardar com vocês** (não precisa me mandar).
3. Criar um **token de acesso** para eu configurar: menu do perfil > **Account
   preferences > Access Tokens > Generate new token** (nome: `migracao-claude`).
   Ao terminar a migração, vocês podem apagar esse token.

### Domínio (se for usar um endereço próprio, ex.: conesul.org.br)
4. Comprar o domínio (Registro.br para `.com.br`/`.org.br`).
5. Me dizer **qual é o domínio** e se vai ser com ou sem `www`.
6. Ter em mãos o acesso ao painel onde o domínio foi comprado, para criar os
   registros que eu indicar (passo 3 abaixo).

### CAPTCHA (contra cadastros e tentativas de login em massa)
Criar uma conta gratuita em **cloudflare.com** e, em **Turnstile > Add site**,
cadastrar o endereço do site. Ficam duas chaves: a *Site key* (pública: podem me
passar no chat) e a *Secret key* (**não mandem pelo chat**: criem o segredo
`TURNSTILE_SECRET_KEY` no ambiente, como no passo 8 abaixo).

### Liberar o meu acesso nesta sessão (configuração do ambiente)
O ambiente onde eu trabalho só acessa endereços liberados. No menu do ambiente
(barra de título da sessão > ambiente > **Edit**):
7. **Network access**: acrescentar em *Allowed domains*: `supabase.com`,
   `api.supabase.com` e `*.supabase.co` (deixando marcado *Allow package managers*).
8. **Secrets / variáveis de ambiente**: criar `SUPABASE_ACCESS_TOKEN` com o token do
   passo 3. **Não mandem o token pelo chat.**
9. Abrir uma **sessão nova** (as configurações valem a partir dela).

## 2. O que vocês me passam no chat
- O **nome do projeto** Supabase (ou a *Project URL*, que aparece em Project
  Settings > API). A chave pública ("anon") eu pego com o token.
- O **domínio**, se houver.
- Os **e-mails da equipe** que vão editar o site e importar o relatório.
- Os **links de pagamento** dos planos e das camisetas, se já existirem.

## 3. O que eu faço
1. Rodo o `supabase/schema.sql` (cadastros, níveis, equipe, edição do site,
   armazenamento de imagens, notícias, conteúdo exclusivo, registro de atividades)
   e o `supabase/conteudo-inicial.sql` (benefícios dos Expansores).
2. Publico as funções `importar-planilha` e `webhook-pagamento` e configuro os
   segredos delas (endereço do site, token do webhook).
3. Configuro o login: endereço do site e de retorno, e-mails em português
   (troca de senha), confirmação de e-mail, senha mínima de 8 caracteres,
   CAPTCHA e validade curta da sessão (LEIA-ME, passo 5).
4. Coloco a URL e a chave pública em `CONTAS` no `app.js`: o site sai do modo
   demonstração.
5. Domínio: crio o arquivo `CNAME` no site e passo a vocês os registros para o
   painel do domínio:
   - domínio sem `www`: quatro registros **A** para `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153` e `185.199.111.153`;
   - `www`: um registro **CNAME** para `luanamatiello12-cloud.github.io`.
   Depois ligo o HTTPS no GitHub Pages (pode levar algumas horas para valer).
6. Passo as edições que estão só no navegador de vocês (botão "Baixar edições")
   para o banco, como primeira versão publicada.
7. Coloco a equipe na tabela `equipe` (cada pessoa precisa ter criado a conta pelo
   site antes, em "Faça parte").
8. Teste de ponta a ponta: login, níveis, importação com um relatório de teste,
   envio de acesso pelo WhatsApp, troca de senha, edição e publicação, histórico.

## 4. Depois da migração
- O botão **Editar** some para os visitantes e aparece só para a equipe logada.
- **Publicar** muda a página para todos; **Histórico** volta a uma versão anterior.
- Atualizar a Política de Privacidade e os Termos de Uso (o site passa a guardar
  dados de mantenedores).
