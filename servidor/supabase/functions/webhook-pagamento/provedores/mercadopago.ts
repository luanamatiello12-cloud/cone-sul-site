// Mercado Pago — assinaturas ("preapproval").
// No painel: Suas integracoes > Webhooks > URL desta funcao com
// ?token=<WEBHOOK_TOKEN> no fim, evento "Planos e assinaturas".
// O token de acesso vai em MERCADOPAGO_ACCESS_TOKEN.
//
// RASCUNHO: escrito a partir da documentacao do Mercado Pago, ainda nao
// testado com uma conta real. O Mercado Pago nao manda o CPF do pagador
// na assinatura: ele fica em branco e a pessoa completa em "Meu cadastro".
import type { EventoPagamento, Provedor, StatusContribuicao } from '../tipos.ts';

const STATUS: Record<string, StatusContribuicao> = {
    authorized: 'ativa',
    pending: 'pendente',
    paused: 'pendente',
    cancelled: 'cancelada'
};

export const mercadopago: Provedor = {
    nome: 'mercadopago',
    autenticar: (req) => {
        const token = Deno.env.get('WEBHOOK_TOKEN');
        return !!token && new URL(req.url).searchParams.get('token') === token;
    },
    interpretar: async (corpo) => {
        const c = corpo as { id?: string | number; type?: string; data?: { id?: string } };
        if (c.type !== 'subscription_preapproval' || !c.data?.id) return null;

        const r = await fetch(`https://api.mercadopago.com/preapproval/${c.data.id}`, {
            headers: { Authorization: `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''}` }
        });
        if (!r.ok) throw new Error(`Mercado Pago preapproval: HTTP ${r.status}`);
        const a = await r.json();
        const status = STATUS[a.status];
        if (!status || !a.payer_email) return null;

        return {
            id: `mercadopago:${c.id ?? a.id}:${a.status}`,
            email: String(a.payer_email).toLowerCase(),
            valorMensal: Number(a.auto_recurring?.transaction_amount ?? 0),
            status,
            clienteId: a.payer_id ? String(a.payer_id) : undefined,
            assinaturaId: a.id
        };
    }
};
