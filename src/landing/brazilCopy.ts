import type { BrazilVariant } from './brazilMarket';

/** Brezilya inişinde dönen belge türleri (yerel adlarla). */
export const BR_LANDING_DOCS = [
    { label: 'NF-e (DANFE)', code: '55', id: 'invoice', a: '#2563eb' },
    { label: 'NFC-e', code: '65', id: 'consumer', a: '#7c3aed' },
    { label: 'NFS-e (DANFSe)', code: 'SE', id: 'service', a: '#0284c7' },
    { label: 'CT-e (DACTE)', code: '57', id: 'despatch', a: '#059669' },
] as const;

export const brazilSeo = {
    title: 'DANFE com a sua marca | Layout NF-e, NFS-e e CT-e · edXdocu',
    description:
        'Personalize DANFE, DANFSe e DACTE com a marca da sua empresa. Layout NT 2026.010 (IBS/CBS), 2 por página, A5/A6. Seu XML fica no navegador — não sai do seu computador. Pilotos grátis para contadores.',
};

type VariantCopy = {
    heroLine: string;
    heroAccent: string;
    heroSubLead: string;
    heroSubStrong: string;
    heroSubRest: string;
};

const variants: Record<BrazilVariant, VariantCopy> = {
    a: {
        heroLine: 'com a sua marca ficou',
        heroAccent: 'muito fácil',
        heroSubLead: 'Desenhe o',
        heroSubStrong: 'DANFE, DANFSe e DACTE com a marca da sua empresa',
        heroSubRest:
            '— layout NT 2026.010 (Total do IBS/CBS/IS), 2 por página, A5/A6, retrato ou paisagem. Campos obrigatórios do MOC preservados. Sem emitir nota, sem certificado, sem SEFAZ: só o design do documento impresso.',
    },
    b: {
        heroLine: 'do seu ERP ficou',
        heroAccent: 'com a sua cara',
        heroSubLead: 'Preencha',
        heroSubStrong: 'documentos da sua empresa com os dados do seu ERP',
        heroSubRest:
            '— Omie, Bling, Tiny ou qualquer XML de NF-e/NFS-e/CT-e. Arraste o logo, escolha o layout e baixe o PDF marcado. Independente do ERP; o XML não sai do seu computador.',
    },
};

export const brazilCopy = {
    newsTitle: 'Novo layout DANFE · NT 2026.010',
    news: 'IBS/CBS a partir de 01/12/2026 — personalize agora',
    badgeNew: 'NOVO',
    variants,
    heroSubPrivacy: 'Seu XML é processado no navegador. Não enviamos o arquivo para a Turquia.',
    ctaOpen: 'Criar conta grátis',
    ctaConcierge: 'Quero 5 designs grátis',
    ctaPricing: 'Ver preços piloto',
    alreadyMember: 'Já tenho uma conta',
    stats: [
        { v: 'NT 2026.010', l: 'Novo layout DANFE' },
        { v: '4', l: 'Tipos de DF-e' },
        { v: 'Offline', l: 'XML no navegador' },
        { v: 'ERP-agnostic', l: 'Omie · Bling · Tiny…' },
    ],
    product: {
        eyebrow: 'Produto',
        title: 'Design de documento fiscal — não conversor XML→PDF',
        subtitle:
            'O render gratuito já existe. O que falta é o layout com a sua marca, alinhado ao MOC e ao novo DANFE.',
    },
    showcase: {
        title: 'DANFE com a sua marca',
        text: 'Logo, cores, 2 por página, A5/A6, campos extras à direita da tabela — tudo no editor visual. O XML de exemplo (ou o seu) preenche os dados na hora.',
        cta: 'Experimentar o editor',
    },
    mock: {
        title: 'DANFE · NF-e',
        company: 'Papelaria Exemplo Ltda.',
        taxId: 'CNPJ: 12.345.678/0001-90',
        line1: 'Papel A4 · 2 cx · R$ 90,00',
        line2: 'Toner · 1 un. · R$ 129,00',
        total: 'Total: R$ 219,00',
    },
    features: [
        { title: 'Arrastar e soltar', text: 'Logo, carimbo e blocos sem aprender XSLT' },
        { title: 'XML no navegador', text: 'LGPD: o arquivo não sai do seu computador' },
        { title: 'MOC Anexo II', text: 'Campos obrigatórios preservados · NT 2026.010' },
        { title: 'Independente do ERP', text: 'Funciona com o XML de qualquer emissor' },
    ],
    docs: {
        eyebrow: 'Documentos',
        title: 'Quais documentos você personaliza?',
    },
    pricing: {
        eyebrow: 'Preços piloto',
        title: 'Quanto faria sentido pagar?',
        subtitle:
            'Estamos validando preços em BRL com contadores e empresas. Escolha a faixa e peça 5 designs grátis — sem CNPJ nosso, sem cobrança automática.',
        plans: [
            {
                id: 'solo',
                name: 'Individual',
                price: 'R$ 49',
                period: '/mês',
                hint: '1–2 CNPJs · créditos de design',
                features: ['Créditos de design mensais', 'Galeria DANFE / DANFSe', 'PDF com a sua marca', 'Suporte por e-mail'],
            },
            {
                id: 'contador',
                name: 'Escritório contábil',
                price: 'R$ 149–249',
                period: '/mês',
                hint: 'Até dezenas de clientes · revenda',
                highlight: true,
                features: [
                    'Créditos para vários CNPJs',
                    'Layouts por cliente',
                    'Comissão / white-label sob consulta',
                    'WhatsApp em horário BR',
                ],
            },
            {
                id: 'parceiro',
                name: 'Parceiro / provedor',
                price: 'R$ 499+',
                period: '/mês',
                hint: 'ERP · consultoria · volume',
                features: ['API / embed (roadmap)', 'Onboarding conjunto', 'Prioridade de layouts NT', 'Acordo de seller of record'],
            },
        ],
        askLabel: 'Esta faixa faz sentido para mim',
        note: 'Pagamento em Pix/boleto via parceiro brasileiro (seller of record). Sem NFS-e nossa neste piloto.',
    },
    faq: {
        eyebrow: 'Perguntas',
        title: 'Perguntas frequentes (Brasil)',
        subtitle: 'Respostas curtas para contadores, empresas e consultores de ERP.',
        items: [
            {
                q: 'Vocês emitem NF-e / NFS-e?',
                a: 'Não. O edXdocu não se conecta à SEFAZ nem gerencia certificado ICP-Brasil. Você (ou seu ERP) emite o XML; nós ajudamos a desenhar o documento impresso (DANFE/DANFSe/DACTE) com a sua marca.',
            },
            {
                q: 'O XML vai para a Turquia?',
                a: 'Não no fluxo recomendado. O arquivo é lido no seu navegador (ou, no futuro, em região Brasil). Assim evitamos transferência internacional de dados fiscais (LGPD).',
            },
            {
                q: 'Posso mudar o layout do DANFE?',
                a: 'Sim, desde que os campos obrigatórios do MOC Anexo II sejam mantidos. A NT 2026.010 exige a caixa de totais IBS/CBS/IS a partir de 01/12/2026 — nossos layouts piloto já preveem esse bloco.',
            },
            {
                q: 'Isso substitui Omie / Bling / MeuDANFE?',
                a: 'Não. Omie/Bling emitem; MeuDANFE e similares renderizam XML→PDF de graça. Nós entramos na camada de design visual + marca + layouts especiais (2-up, A5/A6, identidade do cliente).',
            },
            {
                q: 'Como pago sem CNPJ de vocês?',
                a: 'No piloto usamos lista de espera e designs concierge. A cobrança recorrente em Pix/boleto será feita por um parceiro brasileiro (seller of record) ou marketplace. Enquanto isso, os 5 designs grátis não exigem pagamento.',
            },
            {
                q: 'Sou contador — como revendo?',
                a: 'Desenhe o layout uma vez e reutilize para os CNPJs dos clientes. No plano Escritório, a ideia é você embutir o design no serviço e, se quiser, operar como nosso canal com comissão.',
            },
        ],
    },
    concierge: {
        eyebrow: 'Concierge',
        title: '5 designs grátis para validar o layout',
        subtitle:
            'Envie um XML real (ou diga o ERP). Montamos até 5 provas de DANFE/DANFSe com a sua marca e perguntamos quanto faria sentido pagar.',
        name: 'Nome',
        email: 'E-mail',
        whatsapp: 'WhatsApp (com DDD)',
        role: 'Você é…',
        roles: [
            { id: 'contador', label: 'Contador / escritório' },
            { id: 'empresa', label: 'Empresa emitente' },
            { id: 'erp', label: 'Consultor / provedor ERP' },
            { id: 'outro', label: 'Outro' },
        ],
        price: 'Faixa de preço que faria sentido',
        prices: [
            { id: 'solo', label: 'R$ 49 / mês' },
            { id: 'contador', label: 'R$ 149–249 / mês' },
            { id: 'parceiro', label: 'R$ 499+ / mês' },
            { id: 'nao-sei', label: 'Ainda não sei' },
        ],
        note: 'Observação (ERP, volume de notas, prazo)',
        notePh: 'Ex.: 40 clientes no Omie, preciso de DANFE 2 por página até dezembro…',
        submit: 'Pedir 5 designs no WhatsApp',
        privacy: 'Usamos seus dados só para este piloto. Não enviamos XML para servidores fora do combinado.',
    },
    finalCta: {
        badge: 'MOC · NT 2026.010 · XML no navegador',
        title: 'Deixe o DANFE com a cara da sua empresa',
        text: 'Abra uma conta ou peça os 5 designs concierge. Piloto sem CNPJ nosso.',
    },
};

export const variantCopy = (v: BrazilVariant): VariantCopy => brazilCopy.variants[v];
