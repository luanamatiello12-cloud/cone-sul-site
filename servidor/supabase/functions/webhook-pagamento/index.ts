// =========================================================
// WEBHOOK DE PAGAMENTO (Supabase Edge Function)
// A plataforma de pagamento chama esta funcao a cada mudanca numa
// contribuicao. Ela:
//   1. confere que o aviso veio mesmo da plataforma;
//   2. traduz o aviso (provedores/<plataforma>.ts);
//   3. se a pessoa ainda nao tem conta, cria e manda o e-mail de convite
//      ("seu cadastro esta pronto"), com os dados que vieram do pagamento;
//   4. grava valor e status: o nivel e calculado pelo banco (schema.sql).
// Dados que a pessoa ja preencheu nunca sao sobrescritos.
//
// Qual plataforma: variavel PROVEDOR_PAGAMENTO (asaas, mercadopago ou
// generico). Trocar de plataforma = mudar essa variavel.
// =========================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import type { Provedor } from './tipos.ts';
import { generico } from './provedores/generico.ts';
import { asaasProvedor } from './provedores/asaas.ts';
import { mercadopago } from './provedores/mercadopago.ts';
import { gravarContribuicao } from '../_shared/mantenedores.ts';

const PROVEDORES: Record<string, Provedor> = { generico, asaas: asaasProvedor, mercadopago };

const responder = (status: number, texto: string) => new Response(texto, { status });

Deno.serve(async (req) => {
    if (req.method !== 'POST') return responder(405, 'use POST');

    const provedor = PROVEDORES[Deno.env.get('PROVEDOR_PAGAMENTO') ?? ''];
    if (!provedor) return responder(500, 'PROVEDOR_PAGAMENTO nao configurado');
    if (!(await provedor.autenticar(req))) return responder(401, 'nao autorizado');

    let corpo: unknown;
    try { corpo = await req.json(); } catch { return responder(400, 'corpo invalido'); }

    const evento = await provedor.interpretar(corpo, req);
    if (!evento) return responder(200, 'ignorado');

    // Cliente com a chave de servico: ignora as regras de seguranca do banco
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Mesmo aviso reenviado: ja processado
    const { error: repetido } = await db.from('eventos_pagamento').insert({ id: evento.id, conteudo: corpo });
    if (repetido) {
        if (repetido.code === '23505') return responder(200, 'ja processado');
        return responder(500, 'falha ao registrar o evento');
    }

    try {
        const r = await gravarContribuicao(db, evento, provedor.nome);
        return responder(200, r === 'criado' ? 'conta criada' : 'atualizado');
    } catch (e) {
        await db.from('eventos_pagamento').delete().eq('id', evento.id);   // deixa reprocessar
        return responder(500, (e as Error).message);
    }
});
