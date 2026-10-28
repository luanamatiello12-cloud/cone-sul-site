// Grava uma contribuicao no cadastro do mantenedor. Usado pelo webhook
// (plataforma de pagamento) e pela importacao do relatorio (Eklesia).
// - Sem cadastro com este e-mail: cria a conta e manda o convite por e-mail
//   ("seu cadastro esta pronto"), com os dados que vieram.
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

export type Resultado = 'criado' | 'atualizado';

// deno-lint-ignore no-explicit-any
export async function gravarContribuicao(db: any, d: DadosContribuicao, provedor: string): Promise<Resultado> {
    const email = d.email.trim().toLowerCase();
    let { data: m } = await db.from('mantenedores').select('*').eq('email', email).maybeSingle();
    let criado = false;

    if (!m) {
        const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${Deno.env.get('SITE_URL')}/portal.html`,
            data: { nome: d.nome ?? '', cpf: d.cpf ?? '' }
        });
        if (error || !data?.user) throw new Error(`convite para ${email}: ${error?.message ?? 'sem usuario'}`);
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
        ...(criado ? { cadastro_automatico: true } : {})
    }).eq('id', m.id);
    if (error) throw new Error(`atualizar ${email}: ${error.message}`);
    return criado ? 'criado' : 'atualizado';
}
