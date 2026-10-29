-- =========================================================
-- CONTAS DE MANTENEDOR (Supabase)
-- Rodar uma vez no SQL Editor do projeto Supabase.
--
-- Uma linha por mantenedor, ligada a conta de login (auth.users).
-- O NIVEL e calculado aqui a partir do valor mensal da contribuicao
-- (mesma regra de NIVEIS em app.js: mudar nos dois lugares):
--   contribuicao ativa e valor >= 1000  -> expansor
--   contribuicao ativa e valor >=  500  -> construtor
--   contribuicao ativa e valor  >    0  -> semeador
--   sem contribuicao ativa              -> sem nivel
-- Quem muda valor e status e so o webhook da plataforma de pagamento.
-- O proprio mantenedor so consegue alterar os dados pessoais.
-- =========================================================

create table if not exists public.mantenedores (
    id                   uuid primary key references auth.users (id) on delete cascade,
    email                text not null unique,
    nome                 text,
    cpf                  text,
    telefone             text,
    nascimento           date,
    naturalidade         text,
    moradia              text,
    cristao              boolean,
    congrega             boolean,
    igreja               text,

    valor_mensal         numeric(10, 2) not null default 0,
    status_contribuicao  text not null default 'sem_contribuicao'
                         check (status_contribuicao in ('ativa', 'pendente', 'cancelada', 'sem_contribuicao')),
    nivel                text generated always as (
                             case
                                 when status_contribuicao <> 'ativa' or valor_mensal <= 0 then null
                                 when valor_mensal >= 1000 then 'expansor'
                                 when valor_mensal >= 500  then 'construtor'
                                 else 'semeador'
                             end
                         ) stored,

    provedor             text,     -- 'asaas', 'mercadopago'...
    cliente_id           text,     -- id do cliente na plataforma de pagamento
    assinatura_id        text,     -- id da assinatura (contribuicao mensal)
    cadastro_automatico  boolean not null default false,  -- criado pelo pagamento
    conferido            boolean not null default false,  -- a pessoa ja revisou os dados
    senha_provisoria     boolean not null default false,  -- entrou com a senha mandada pelo WhatsApp
    criado_em            timestamptz not null default now(),
    atualizado_em        timestamptz not null default now()
);

-- Projeto criado com uma versao anterior deste arquivo: colunas novas
alter table public.mantenedores add column if not exists senha_provisoria boolean not null default false;

-- Eventos ja processados: a plataforma pode reenviar o mesmo aviso
create table if not exists public.eventos_pagamento (
    id           text primary key,      -- provedor:id do evento
    recebido_em  timestamptz not null default now(),
    conteudo     jsonb
);

-- Toda conta nova (cadastro pelo site ou convite do webhook) ganha a sua
-- linha, com os dados que vieram junto (raw_user_meta_data)
create or replace function public.criar_mantenedor()
returns trigger language plpgsql security definer set search_path = public as $$
declare d jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
    insert into public.mantenedores (id, email, nome, cpf, nascimento, naturalidade, moradia, cristao, congrega, igreja)
    values (
        new.id, new.email,
        d->>'nome', nullif(regexp_replace(coalesce(d->>'cpf', ''), '\D', '', 'g'), ''),
        nullif(d->>'nascimento', '')::date, d->>'naturalidade', d->>'moradia',
        (d->>'cristao')::boolean, (d->>'congrega')::boolean, d->>'igreja'
    )
    on conflict (id) do nothing;
    return new;
end $$;

drop trigger if exists ao_criar_conta on auth.users;
create trigger ao_criar_conta after insert on auth.users
    for each row execute function public.criar_mantenedor();
-- Funcao de gatilho: ninguem a chama pela API
revoke execute on function public.criar_mantenedor() from public, anon, authenticated;

create or replace function public.marcar_atualizacao()
returns trigger language plpgsql set search_path = public as $$
begin new.atualizado_em := now(); return new; end $$;

drop trigger if exists mantenedores_atualizado on public.mantenedores;
create trigger mantenedores_atualizado before update on public.mantenedores
    for each row execute function public.marcar_atualizacao();

-- ---------- Seguranca ----------
alter table public.mantenedores enable row level security;
alter table public.eventos_pagamento enable row level security;   -- so o servidor acessa

drop policy if exists "ve o proprio cadastro" on public.mantenedores;
create policy "ve o proprio cadastro" on public.mantenedores
    for select to authenticated using (auth.uid() = id);

drop policy if exists "edita o proprio cadastro" on public.mantenedores;
create policy "edita o proprio cadastro" on public.mantenedores
    for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Pelo site, so os dados pessoais podem mudar (nunca valor, status ou nivel)
revoke insert, update, delete on public.mantenedores from anon, authenticated;
grant select on public.mantenedores to authenticated;
grant update (nome, telefone, nascimento, naturalidade, moradia, cristao, congrega, igreja, conferido, senha_provisoria)
    on public.mantenedores to authenticated;

-- ---------- Equipe (pagina importar.html) ----------
-- Contas que podem importar o relatorio do Eklesia. Para incluir alguem:
-- a pessoa cria a conta pelo site e, no SQL Editor:
--   insert into public.equipe (id, nome)
--   select id, 'Nome da pessoa' from auth.users where email = 'pessoa@exemplo.com';
create table if not exists public.equipe (
    id    uuid primary key references auth.users (id) on delete cascade,
    nome  text
);
alter table public.equipe enable row level security;   -- so o servidor le

-- ---------- Edicao do site (botao Editar > Publicar) ----------
-- Cada "Publicar" grava uma versao nova da pagina; a mais recente e a que
-- esta no ar. "Historico" volta a uma versao antiga publicando-a de novo.
-- Quem pode publicar: as contas da tabela "equipe".
create table if not exists public.site_edicoes (
    id           bigint generated always as identity primary key,
    pagina       text not null,               -- ex.: index.html
    conteudo     jsonb not null,              -- { textos, clones, ocultos, imagens }
    autor        uuid references auth.users (id) on delete set null,
    autor_email  text,
    criado_em    timestamptz not null default now()
);
create index if not exists site_edicoes_pagina on public.site_edicoes (pagina, id desc);
alter table public.site_edicoes enable row level security;

drop policy if exists "todos leem o site" on public.site_edicoes;
create policy "todos leem o site" on public.site_edicoes
    for select to anon, authenticated using (true);

drop policy if exists "equipe publica" on public.site_edicoes;
create policy "equipe publica" on public.site_edicoes
    for insert to authenticated
    with check (autor = auth.uid() and exists (select 1 from public.equipe e where e.id = auth.uid()));

grant select on public.site_edicoes to anon, authenticated;
grant insert on public.site_edicoes to authenticated;

-- Cada pessoa da equipe consegue ver a propria linha (o site usa isso
-- para mostrar o botao Editar so para a equipe)
drop policy if exists "ve a si mesmo" on public.equipe;
create policy "ve a si mesmo" on public.equipe
    for select to authenticated using (id = auth.uid());
grant select on public.equipe to authenticated;

-- Imagens trocadas pelo editor: armazenamento publico "site"
-- So imagens JPG, PNG ou WebP de ate 5 MB (o editor reduz as fotos antes)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
    set file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "equipe envia imagens" on storage.objects;
create policy "equipe envia imagens" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'site' and exists (select 1 from public.equipe e where e.id = auth.uid()));

-- ---------- Conteudo so para mantenedores ----------
-- O HTML do site e publico (e o repositorio tambem): o que for exclusivo
-- fica aqui, e o banco so entrega a quem tem direito.

-- Blocos exclusivos de um ou mais niveis. Ex.: chave 'links-workshops',
-- niveis {construtor, expansor}. Ainda sem nenhum bloco.
create table if not exists public.conteudo_restrito (
    chave          text primary key,
    niveis         text[] not null check (cardinality(niveis) > 0),
    conteudo       jsonb not null,
    atualizado_em  timestamptz not null default now()
);
alter table public.conteudo_restrito enable row level security;

drop policy if exists "le quem tem o nivel" on public.conteudo_restrito;
create policy "le quem tem o nivel" on public.conteudo_restrito
    for select to authenticated using (
        exists (select 1 from public.mantenedores m where m.id = auth.uid() and m.nivel = any (niveis))
        or exists (select 1 from public.equipe e where e.id = auth.uid())
    );
drop policy if exists "equipe altera" on public.conteudo_restrito;
create policy "equipe altera" on public.conteudo_restrito
    for all to authenticated
    using (exists (select 1 from public.equipe e where e.id = auth.uid()))
    with check (exists (select 1 from public.equipe e where e.id = auth.uid()));
revoke all on public.conteudo_restrito from anon;
grant select, insert, update, delete on public.conteudo_restrito to authenticated;

-- Publicacoes da pagina de noticias: so para quem entrou com uma conta.
-- Por enquanto a equipe publica pelo painel do Supabase (Table Editor).
create table if not exists public.noticias (
    id            bigint generated always as identity primary key,
    categoria     text not null check (categoria in ('diario', 'noticias', 'historias', 'projetos', 'contas')),
    titulo        text not null,
    resumo        text not null,
    imagem        text,      -- endereco da foto (opcional)
    link          text,      -- texto completo ou documento (opcional)
    publicada     boolean not null default true,
    publicado_em  timestamptz not null default now(),
    autor         uuid references auth.users (id) on delete set null
);
create index if not exists noticias_data on public.noticias (publicado_em desc);
alter table public.noticias enable row level security;

drop policy if exists "contas leem" on public.noticias;
create policy "contas leem" on public.noticias
    for select to authenticated using (
        publicada or exists (select 1 from public.equipe e where e.id = auth.uid())
    );
drop policy if exists "equipe publica noticias" on public.noticias;
create policy "equipe publica noticias" on public.noticias
    for all to authenticated
    using (exists (select 1 from public.equipe e where e.id = auth.uid()))
    with check (exists (select 1 from public.equipe e where e.id = auth.uid()));
revoke all on public.noticias from anon;
grant select, insert, update, delete on public.noticias to authenticated;

-- ---------- Registro de atividades da equipe ----------
-- Quem importou relatorio e quem gerou senha provisoria para quem.
-- Sem politicas: so as funcoes do servidor gravam; ler pelo painel
-- (Table Editor > registro_atividades).
create table if not exists public.registro_atividades (
    id           bigint generated always as identity primary key,
    quando       timestamptz not null default now(),
    autor        uuid references auth.users (id) on delete set null,
    autor_email  text,
    acao         text not null,     -- 'importacao', 'nova-senha'
    alvo         text,              -- e-mail afetado (nova-senha)
    detalhes     jsonb
);
alter table public.registro_atividades enable row level security;
revoke all on public.registro_atividades from anon, authenticated;
