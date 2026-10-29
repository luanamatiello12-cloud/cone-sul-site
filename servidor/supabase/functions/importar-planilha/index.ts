// =========================================================
// IMPORTAR RELATORIO (Supabase Edge Function)
// Chamada pela pagina importar.html, com o login de alguem da equipe.
// Recebe as linhas ja lidas do Excel do Eklesia (agrupadas por e-mail)
// e grava cada uma como contribuicao: para quem e novo, cria o login com
// SENHA PROVISORIA e devolve a senha (uma vez so) para a equipe mandar
// pelo WhatsApp; de quem ja existe, atualiza valor e nivel.
// Opcional: quem veio do Eklesia e nao esta no relatorio perde o nivel.
// Tambem: { acao: 'nova-senha', email } gera outra senha provisoria.
// So contas listadas na tabela "equipe" podem usar (schema.sql), e so a
// partir do endereco do site (SITE_URL, ou a lista ORIGENS_PERMITIDAS).
// Cada importacao e cada senha nova ficam em "registro_atividades".
// =========================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { gravarContribuicao, senhaProvisoria } from '../_shared/mantenedores.ts';

// Enderecos (origens) que podem chamar esta funcao pelo navegador
const ORIGENS = (Deno.env.get('ORIGENS_PERMITIDAS') ?? Deno.env.get('SITE_URL') ?? '')
    .split(',').map(o => { try { return new URL(o.trim()).origin; } catch { return ''; } }).filter(Boolean);

function cors(req: Request): Record<string, string> {
    const origem = req.headers.get('origin') ?? '';
    return {
        ...(ORIGENS.includes(origem) ? { 'Access-Control-Allow-Origin': origem } : {}),
        'Vary': 'Origin',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
}

interface Linha { email: string; valor: number; nome?: string; cpf?: string; telefone?: string; nascimento?: string; moradia?: string; igreja?: string }

Deno.serve(async (req) => {
    const json = (status: number, corpo: unknown) =>
        new Response(JSON.stringify(corpo), { status, headers: { ...cors(req), 'content-type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    if (req.method !== 'POST') return json(405, { erro: 'use POST' });
    // Chamada de outro site pelo navegador: recusa
    const origem = req.headers.get('origin');
    if (origem && !ORIGENS.includes(origem)) return json(403, { erro: 'origem nao permitida' });

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Quem esta chamando e da equipe?
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: quem } = await db.auth.getUser(token);
    if (!quem?.user) return json(401, { erro: 'entre com a conta da equipe' });
    const { data: membro } = await db.from('equipe').select('id').eq('id', quem.user.id).maybeSingle();
    if (!membro) return json(403, { erro: 'esta conta nao e da equipe' });

    const registrar = (acao: string, alvo: string | null, detalhes: unknown) =>
        db.from('registro_atividades').insert({ autor: quem.user.id, autor_email: quem.user.email, acao, alvo, detalhes });

    let corpo: { registros?: Linha[]; desativarAusentes?: boolean; acao?: string; email?: string };
    try { corpo = await req.json(); } catch { return json(400, { erro: 'corpo invalido' }); }

    // Nova senha provisoria para quem perdeu a primeira (ou nunca recebeu)
    if (corpo.acao === 'nova-senha') {
        const email = String(corpo.email ?? '').trim().toLowerCase();
        const { data: m } = await db.from('mantenedores').select('id, nome, telefone').eq('email', email).maybeSingle();
        if (!m) return json(404, { erro: 'nenhum cadastro com este e-mail' });
        // Contas da equipe nao: trocar a senha de um colega seria tomar a conta
        // dele. Quem e da equipe usa "Esqueci minha senha".
        const { data: colega } = await db.from('equipe').select('id').eq('id', m.id).maybeSingle();
        if (colega) return json(403, { erro: 'esta conta e da equipe: use "Esqueci minha senha" na Área do Mantenedor' });
        const senha = senhaProvisoria();
        const { error } = await db.auth.admin.updateUserById(m.id, { password: senha });
        if (error) return json(500, { erro: 'nao foi possivel gerar a senha agora' });
        await db.from('mantenedores').update({ senha_provisoria: true }).eq('id', m.id);
        await registrar('nova-senha', email, null);
        return json(200, { email, nome: m.nome, telefone: m.telefone, senha });
    }

    const registros = (corpo.registros ?? []).filter(r => r && typeof r.email === 'string' && Number.isFinite(r.valor));
    if (!registros.length) return json(400, { erro: 'nenhuma linha valida' });
    if (registros.length > 2000) return json(400, { erro: 'relatorio grande demais: envie em partes' });

    let criados = 0, atualizados = 0;
    const erros: string[] = [];
    const novos: { email: string; nome?: string; telefone?: string; senha: string }[] = [];
    for (const r of registros) {
        try {
            const { resultado, senha } = await gravarContribuicao(db, {
                email: r.email, nome: r.nome, cpf: r.cpf, telefone: r.telefone,
                nascimento: r.nascimento || undefined, moradia: r.moradia, igreja: r.igreja,
                valorMensal: r.valor,
                status: r.valor > 0 ? 'ativa' : 'cancelada'
            }, 'eklesia', 'senha');
            if (resultado === 'criado') {
                criados++;
                if (senha) novos.push({ email: r.email.trim().toLowerCase(), nome: r.nome, telefone: r.telefone, senha });
            } else atualizados++;
        } catch (e) {
            erros.push((e as Error).message);
        }
    }

    let desativados = 0;
    if (corpo.desativarAusentes) {
        const presentes = registros.map(r => r.email.trim().toLowerCase());
        const { data } = await db.from('mantenedores')
            .update({ status_contribuicao: 'cancelada' })
            .eq('provedor', 'eklesia').eq('status_contribuicao', 'ativa')
            .not('email', 'in', `(${presentes.map(e => `"${e.replace(/"/g, '')}"`).join(',')})`)
            .select('id');
        desativados = data?.length ?? 0;
    }

    await registrar('importacao', null, { linhas: registros.length, criados, atualizados, desativados, erros: erros.length });
    return json(200, { criados, atualizados, desativados, erros, novos });
});
