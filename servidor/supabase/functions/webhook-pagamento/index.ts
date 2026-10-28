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

    let { data: m } = await db.from('mantenedores').select('*').eq('email', evento.email).maybeSingle();
    let novo = false;

    if (!m) {
        // Conta nova: o convite cria o login (o gatilho cria a linha em
        // "mantenedores") e manda o e-mail com o link para o portal
        const { data, error } = await db.auth.admin.inviteUserByEmail(evento.email, {
            redirectTo: `${Deno.env.get('SITE_URL')}/portal.html`,
            data: { nome: evento.nome ?? '', cpf: evento.cpf ?? '' }
        });
        if (error || !data.user) {
            await db.from('eventos_pagamento').delete().eq('id', evento.id);   // deixa reprocessar
            return responder(500, 'falha ao criar a conta: ' + (error?.message ?? ''));
        }
        novo = true;
        ({ data: m } = await db.from('mantenedores').select('*').eq('id', data.user.id).maybeSingle());
    }
    if (!m) return responder(500, 'cadastro nao encontrado');

    // So preenche o que esta vazio: nao apaga o que a pessoa editou
    const completar = (campo: string, valor?: string) => (!m[campo] && valor ? { [campo]: valor } : {});
    const { error } = await db.from('mantenedores').update({
        ...completar('nome', evento.nome),
        ...completar('cpf', evento.cpf?.replace(/\D/g, '')),
        ...completar('telefone', evento.telefone),
        valor_mensal: evento.valorMensal,
        status_contribuicao: evento.status,
        provedor: provedor.nome,
        cliente_id: evento.clienteId ?? m.cliente_id,
        assinatura_id: evento.assinaturaId ?? m.assinatura_id,
        ...(novo ? { cadastro_automatico: true } : {})
    }).eq('id', m.id);
    if (error) return responder(500, 'falha ao atualizar: ' + error.message);

    return responder(200, novo ? 'conta criada' : 'atualizado');
});
