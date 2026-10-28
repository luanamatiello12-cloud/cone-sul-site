// =========================================================
// IMPORTAR RELATORIO (Supabase Edge Function)
// Chamada pela pagina importar.html, com o login de alguem da equipe.
// Recebe as linhas ja lidas do Excel do Eklesia (agrupadas por e-mail)
// e grava cada uma como contribuicao: cria o cadastro com convite por
// e-mail para quem e novo, atualiza valor e nivel de quem ja existe.
// Opcional: quem veio do Eklesia e nao esta no relatorio perde o nivel.
// So contas listadas na tabela "equipe" podem usar (schema.sql).
// =========================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { gravarContribuicao } from '../_shared/mantenedores.ts';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (status: number, corpo: unknown) =>
    new Response(JSON.stringify(corpo), { status, headers: { ...CORS, 'content-type': 'application/json' } });

interface Linha { email: string; valor: number; nome?: string; cpf?: string; telefone?: string; nascimento?: string; moradia?: string; igreja?: string }

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (req.method !== 'POST') return json(405, { erro: 'use POST' });

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Quem esta chamando e da equipe?
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: quem } = await db.auth.getUser(token);
    if (!quem?.user) return json(401, { erro: 'entre com a conta da equipe' });
    const { data: membro } = await db.from('equipe').select('id').eq('id', quem.user.id).maybeSingle();
    if (!membro) return json(403, { erro: 'esta conta nao e da equipe' });

    let corpo: { registros?: Linha[]; desativarAusentes?: boolean };
    try { corpo = await req.json(); } catch { return json(400, { erro: 'corpo invalido' }); }
    const registros = (corpo.registros ?? []).filter(r => r && typeof r.email === 'string' && Number.isFinite(r.valor));
    if (!registros.length) return json(400, { erro: 'nenhuma linha valida' });
    if (registros.length > 2000) return json(400, { erro: 'relatorio grande demais: envie em partes' });

    let criados = 0, atualizados = 0;
    const erros: string[] = [];
    for (const r of registros) {
        try {
            const resultado = await gravarContribuicao(db, {
                email: r.email, nome: r.nome, cpf: r.cpf, telefone: r.telefone,
                nascimento: r.nascimento || undefined, moradia: r.moradia, igreja: r.igreja,
                valorMensal: r.valor,
                status: r.valor > 0 ? 'ativa' : 'cancelada'
            }, 'eklesia');
            if (resultado === 'criado') criados++; else atualizados++;
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

    return json(200, { criados, atualizados, desativados, erros });
});
