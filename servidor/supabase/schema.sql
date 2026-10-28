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
    criado_em            timestamptz not null default now(),
    atualizado_em        timestamptz not null default now()
);

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

create or replace function public.marcar_atualizacao()
returns trigger language plpgsql as $$
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
grant update (nome, telefone, nascimento, naturalidade, moradia, cristao, congrega, igreja, conferido)
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
