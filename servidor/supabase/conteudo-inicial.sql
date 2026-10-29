-- =========================================================
-- CONTEUDO INICIAL do que e exclusivo (rodar depois do schema.sql)
-- Lista dos beneficios dos Expansores, que saiu do portal.html: o banco
-- so a entrega a quem tem o nivel Expansor (e a equipe).
-- Para mudar depois: Table Editor > conteudo_restrito > beneficios-expansores.
-- =========================================================
insert into public.conteudo_restrito (chave, niveis, conteudo)
values ('beneficios-expansores', array['expansor'], $json$[
    {
        "titulo": "Workshop Empresarial",
        "paragrafos": [
            "De forma trimestral, um encontro presencial com transmissão ao vivo, para empresários e suas equipes, com temas como inteligência artificial, tráfego pago, marketing, liderança, empreendedorismo, vendas e gestão.",
            "Proposta: encontros no templo ou espaço da Renovar, conduzidos por profissionais convidados e membros qualificados da igreja."
        ]
    },
    {
        "titulo": "Devocional do Empreendedor",
        "paragrafos": [
            "Todas as segundas-feiras, às 6h, uma chamada on-line com leitura bíblica, reflexão e oração, para começar a semana com direção e propósito.",
            "Participação voluntária, aberta aos mantenedores que desejarem."
        ]
    },
    {
        "titulo": "Devocional Mensal",
        "paragrafos": [
            "Um material enviado mensalmente ao empresário, com mensagem bíblica, reflexão prática, perguntas para discussão e oração.",
            "Pode ser utilizado voluntariamente em encontros com a equipe, respeitando as crenças individuais dos colaboradores."
        ]
    },
    {
        "titulo": "Encontros de Família e Relacionamentos",
        "paragrafos": [
            "De forma trimestral.",
            "Palestras e workshops sobre casamento, educação dos filhos, equilíbrio entre trabalho e família, saúde emocional e relacionamentos."
        ]
    },
    {
        "titulo": "Comunidade e Networking",
        "paragrafos": [
            "Um ambiente para conhecer outros empresários, trocar experiências, desenvolver relacionamentos e construir conexões profissionais."
        ]
    },
    {
        "titulo": "Summit Anual",
        "paragrafos": [
            "Um grande evento de summit para todos os expansores."
        ]
    },
    {
        "titulo": "Acompanhamento da Missão",
        "paragrafos": [
            "Acesso ao portal de mantenedores do CONE SUL, com notícias do campo, fotografias, vídeos, necessidades, projetos e prestação de contas.",
            "O empresário acompanha como a parceria contribui para a continuidade do trabalho missionário."
        ]
    }
]$json$::jsonb)
on conflict (chave) do update set conteudo = excluded.conteudo, niveis = excluded.niveis, atualizado_em = now();
