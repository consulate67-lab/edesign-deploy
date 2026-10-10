import type { DocTextPack } from './types';

const es: DocTextPack = {
    titles: {
        invoice: 'Factura',
        credit: 'Factura rectificativa',
        corrected: 'Factura rectificativa por sustitución',
        prepayment: 'Factura de anticipo',
        partial: 'Factura parcial',
        selfbilled: 'Autofactura',
        despatch: 'Albarán',
    },
    sample: {
        note: 'Gracias por su confianza.',
        paymentTerms: 'Pago a 30 días, sin descuento.',
        creditNote: 'Abono por un artículo devuelto (dañado en el transporte).',
        correctedNote: 'Esta factura rectifica el precio unitario de la factura original.',
        prepaymentNote: 'Anticipo del pedido {{order}}; se descontará de la factura final.',
        partialNote: 'Factura parcial de la primera fase del proyecto.',
        prepaymentItem: 'Anticipo ({{pct}} %)',
        discount: 'Descuento por fidelidad',
        product: 'Silla de oficina ergonómica',
        productDesc: 'Respaldo de malla negro, reposabrazos regulables',
        service: 'Instalación y puesta en marcha',
        accessory: 'Alfombrilla protectora de suelo',
        despatchNote: 'Entregar en el muelle de mercancías.',
        backorderReason: 'Sin existencias temporalmente; se envía la próxima semana.',
    },
};

export default es;
