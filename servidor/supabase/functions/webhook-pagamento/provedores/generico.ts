// Provedor "generico": recebe o aviso ja no formato EventoPagamento.
// Serve para testar o fluxo inteiro antes de escolher a plataforma
// (ver "Testar sem plataforma" no LEIA-ME) e para plataformas que
// permitam montar o corpo do webhook.
import type { EventoPagamento, Provedor } from '../tipos.ts';

export const generico: Provedor = {
    nome: 'generico',
    autenticar: (req) => {
        const token = Deno.env.get('WEBHOOK_TOKEN');
        return !!token && req.headers.get('x-webhook-token') === token;
    },
    interpretar: async (corpo) => {
        const e = corpo as EventoPagamento;
        if (!e?.id || !e?.email || typeof e.valorMensal !== 'number' || !e.status) return null;
        return e;
    }
};
