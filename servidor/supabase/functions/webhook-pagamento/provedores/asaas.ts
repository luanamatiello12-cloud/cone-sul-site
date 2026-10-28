// Asaas (asaas.com) — assinaturas mensais com Pix, boleto ou cartao.
// No painel do Asaas: Integracoes > Webhooks > URL desta funcao, com um
// "token de autenticacao" (o mesmo de WEBHOOK_TOKEN) e os eventos de
// cobranca e de assinatura. A chave de API vai em ASAAS_API_KEY.
//
// RASCUNHO: escrito a partir da documentacao do Asaas, ainda nao testado
// com uma conta real. Conferir os nomes dos eventos ao ativar.
import type { EventoPagamento, Provedor, StatusContribuicao } from '../tipos.ts';

const API = Deno.env.get('ASAAS_API_URL') ?? 'https://api.asaas.com/v3';

async function asaas(caminho: string) {
    const r = await fetch(`${API}${caminho}`, { headers: { access_token: Deno.env.get('ASAAS_API_KEY') ?? '' } });
    if (!r.ok) throw new Error(`Asaas ${caminho}: HTTP ${r.status}`);
    return r.json();
}

const STATUS: Record<string, StatusContribuicao> = {
    PAYMENT_CONFIRMED: 'ativa',
    PAYMENT_RECEIVED: 'ativa',
    PAYMENT_OVERDUE: 'pendente',
    SUBSCRIPTION_INACTIVATED: 'cancelada',
    SUBSCRIPTION_DELETED: 'cancelada'
};

export const asaasProvedor: Provedor = {
    nome: 'asaas',
    autenticar: (req) => {
        const token = Deno.env.get('WEBHOOK_TOKEN');
        return !!token && req.headers.get('asaas-access-token') === token;
    },
    interpretar: async (corpo) => {
        const c = corpo as { id?: string; event?: string; payment?: any; subscription?: any };
        const status = c.event ? STATUS[c.event] : undefined;
        if (!status) return null;

        // Interessa so o que for contribuicao mensal (assinatura)
        const assinaturaId: string | undefined = c.payment?.subscription ?? c.subscription?.id;
        if (!assinaturaId) return null;

        const assinatura = c.subscription ?? await asaas(`/subscriptions/${assinaturaId}`);
        const cliente = await asaas(`/customers/${assinatura.customer}`);
        if (!cliente.email) return null;

        const evento: EventoPagamento = {
            id: `asaas:${c.id ?? `${c.event}:${c.payment?.id ?? assinaturaId}`}`,
            email: String(cliente.email).toLowerCase(),
            nome: cliente.name,
            cpf: cliente.cpfCnpj,
            telefone: cliente.mobilePhone ?? cliente.phone,
            valorMensal: Number(assinatura.value),
            status,
            clienteId: assinatura.customer,
            assinaturaId
        };
        return evento;
    }
};
