import type tr from './tr';

const tutorials: typeof tr = {
    nav: 'Cómo funciona',
    eyebrow: 'Vídeos tutoriales',
    title: '¿Cómo funciona?',
    subtitle: 'Cada paso, desde el registro hasta el diseño aprobado, en vídeos cortos narrados.',
    help: 'Cómo funciona',
    helpHint: 'Vídeos cortos que explican cada función del editor',
    playerTitle: 'Vídeos tutoriales',
    turkishOnly: 'Los vídeos están narrados y subtitulados en turco.',
    watch: 'Ver',
    close: 'Cerrar (Esc)',
    groupStart: 'Primeros pasos',
    groupEditor: 'Editor',
    items: {
        signup: { title: 'Registro e inicio de sesión', desc: 'Cree su cuenta en pocos pasos y vuelva a iniciar sesión.' },
        template: { title: 'Adaptar una plantilla lista', desc: 'Elija una plantilla de su sector y cambie el logotipo y los textos.' },
        scratch: { title: 'Diseño desde cero y recorrido del editor', desc: 'Elija el tipo de documento, la plantilla inicial y sus datos.' },
        textImage: { title: 'Añadir texto, imagen y cuadro', desc: 'Añada texto, logotipo, sello, firma y cuadros a su documento.' },
        tableFormula: { title: 'Añadir tabla y fórmula', desc: 'Cree su propia tabla y calcule con los importes.' },
        qrChart: { title: 'Código QR, gráfico y barra de proporción', desc: 'Añada un código QR, un gráfico y un indicador de proporción por línea.' },
        columnBackground: { title: 'Columnas y fondo', desc: 'Añada u oculte columnas de la tabla de líneas; ponga un fondo a la página.' },
        documentFields: { title: 'Añadir campos del documento', desc: 'Añada cualquier dato de la factura, como el IBAN o el n.º de pedido.' },
        editFields: { title: 'Editar campos existentes', desc: 'Fuente, color, borde, posición; ocultar y deshacer.' },
        saveApprove: { title: 'Guardar, descargar prueba y aprobar', desc: 'Guarde su diseño, pruébelo gratis, apruébelo y descárguelo.' },
    },
};

export default tutorials;
