// Grava uma contribuicao no cadastro do mantenedor. Usado pelo webhook
// (plataforma de pagamento) e pela importacao do relatorio (Eklesia).
// - Sem cadastro com este e-mail: cria a conta, de um destes jeitos:
//     'convite' (webhook e importacao): o Supabase manda o e-mail "seu
//     cadastro esta pronto", com o link para criar a senha;
//     'senha': login pronto com SENHA PROVISORIA, devolvida aqui uma unica
//     vez para quem chamou (nao fica guardada).
// - Com cadastro: so preenche os campos vazios (nao apaga o que a pessoa
//   editou) e atualiza valor e status. O nivel e calculado pelo banco.

export interface DadosContribuicao {
    email: string;
    nome?: string;
    cpf?: string;
    telefone?: string;
    nascimento?: string;   // AAAA-MM-DD
    moradia?: string;
    igreja?: string;
    valorMensal: number;
    status: 'ativa' | 'pendente' | 'cancelada';
    clienteId?: string;
    assinaturaId?: string;
}

export interface Resultado { resultado: 'criado' | 'atualizado'; senha?: string }

// Senha provisoria: Cone- e dois grupos de 4 caracteres sem os que se
// confundem (0/O, 1/I/L), ex.: Cone-7KQ4-M9TX. 31^8 = ~850 bilhoes de
// combinacoes: nao da para adivinhar, mesmo sem o limite de tentativas.
const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export function senhaProvisoria(): string {
    const letras: string[] = [];
    while (letras.length < 8) {
        // Descarta o fim da faixa para todas as letras terem a mesma chance
        const n = crypto.getRandomValues(new Uint8Array(1))[0];
        if (n < 248) letras.push(ALFABETO[n % ALFABETO.length]);
    }
    return `Cone-${letras.slice(0, 4).join('')}-${letras.slice(4).join('')}`;
}

// deno-lint-ignore no-explicit-any
export async function gravarContribuicao(db: any, d: DadosContribuicao, provedor: string, modo: 'convite' | 'senha' = 'convite'): Promise<Resultado> {
    const email = d.email.trim().toLowerCase();
    let { data: m } = await db.from('mantenedores').select('*').eq('email', email).maybeSingle();
    let criado = false;
    let senha: string | undefined;

    if (!m) {
        const dados = { nome: d.nome ?? '', cpf: d.cpf ?? '' };
        let resposta;
        if (modo === 'senha') {
            senha = senhaProvisoria();
            resposta = await db.auth.admin.createUser({ email, password: senha, email_confirm: true, user_metadata: dados });
        } else {
            resposta = await db.auth.admin.inviteUserByEmail(email, { redirectTo: `${Deno.env.get('SITE_URL')}/portal.html`, data: dados });
        }
        const { data, error } = resposta;
        if (error || !data?.user) throw new Error(`criar conta de ${email}: ${error?.message ?? 'sem usuario'}`);
        criado = true;
        ({ data: m } = await db.from('mantenedores').select('*').eq('id', data.user.id).maybeSingle());
        if (!m) throw new Error(`cadastro de ${email} nao foi criado`);
    }

    const completar = (campo: string, valor?: string) => (!m[campo] && valor ? { [campo]: valor } : {});
    const { error } = await db.from('mantenedores').update({
        ...completar('nome', d.nome),
        ...completar('cpf', d.cpf?.replace(/\D/g, '')),
        ...completar('telefone', d.telefone),
        ...completar('nascimento', d.nascimento),
        ...completar('moradia', d.moradia),
        ...completar('igreja', d.igreja),
        valor_mensal: d.valorMensal,
        status_contribuicao: d.status,
        provedor,
        cliente_id: d.clienteId ?? m.cliente_id,
        assinatura_id: d.assinaturaId ?? m.assinatura_id,
        ...(criado ? { cadastro_automatico: true, senha_provisoria: modo === 'senha' } : {})
    }).eq('id', m.id);
    if (error) throw new Error(`atualizar ${email}: ${error.message}`);
    return { resultado: criado ? 'criado' : 'atualizado', senha };
}
