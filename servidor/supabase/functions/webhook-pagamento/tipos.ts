// Formato unico que o webhook entende, venha o aviso de qual plataforma vier.
// Cada arquivo em provedores/ traduz o aviso da sua plataforma para isto.

export type StatusContribuicao = 'ativa' | 'pendente' | 'cancelada';

export interface EventoPagamento {
    id: string;                 // id unico do aviso (para nao processar duas vezes)
    email: string;
    nome?: string;
    cpf?: string;
    telefone?: string;
    valorMensal: number;        // em reais
    status: StatusContribuicao;
    clienteId?: string;
    assinaturaId?: string;
}

export interface Provedor {
    nome: string;
    // O aviso veio mesmo da plataforma? (token/assinatura configurados nela)
    autenticar(req: Request): boolean | Promise<boolean>;
    // Traduz o aviso. null = aviso que nao interessa (ignorado com 200)
    interpretar(corpo: unknown, req: Request): Promise<EventoPagamento | null>;
}
