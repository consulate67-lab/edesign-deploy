import type tr from './tr';

const tutorials: typeof tr = {
    nav: 'Como funciona',
    eyebrow: 'Vídeos tutoriais',
    title: 'Como funciona?',
    subtitle: 'Acompanhe cada etapa, do cadastro até o layout aprovado, em vídeos curtos e narrados.',
    help: 'Como funciona',
    helpHint: 'Vídeos tutoriais curtos que abordam todos os recursos do editor',
    playerTitle: 'Vídeos tutoriais',
    videoLangNote: '',
    watch: 'Assistir',
    close: 'Fechar (Esc)',
    groupStart: 'Primeiros passos',
    groupEditor: 'Editor',
    items: {
        signup: { title: 'Cadastro e login', desc: 'Crie sua conta em poucos passos e faça login novamente.' },
        template: { title: 'Adaptar um modelo pronto', desc: 'Escolha um layout pronto e depois altere os textos, as cores e o logotipo.' },
        scratch: { title: 'Criar do zero e tour pelo editor', desc: 'Escolha o tipo de documento, o modelo inicial e os seus dados.' },
        textImage: { title: 'Adicionar textos, imagens e caixas', desc: 'Adicione texto, logotipo, carimbo, assinatura e caixas ao seu documento.' },
        tableFormula: { title: 'Adicionar tabelas e fórmulas', desc: 'Monte sua própria tabela e faça cálculos com os valores.' },
        qrChart: { title: 'QR code, gráfico e barra de participação', desc: 'Adicione um QR code, um gráfico e um indicador de participação por linha ao seu documento.' },
        columnBackground: { title: 'Adicionar colunas e plano de fundo', desc: 'Adicione ou oculte colunas da tabela de itens; coloque um plano de fundo na página.' },
        documentFields: { title: 'Adicionar campos do documento', desc: 'Adicione ao layout qualquer dado da fatura, como uma referência de contrato ou de projeto.' },
        editFields: { title: 'Editar campos existentes', desc: 'Fonte, cor, borda, posição; ocultar e desfazer.' },
        saveApprove: { title: 'Salvar, baixar para teste e aprovar', desc: 'Salve seu layout, teste gratuitamente e depois aprove e baixe.' },
    },
};

export default tutorials;
