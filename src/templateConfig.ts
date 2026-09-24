/**
 * Modül-bazlı template konfigürasyonu.
 *
 * Her e-belge modülü için:
 * - layout: Designer'daki varsayılan layout tipi
 * - hasSignature: GİB zorunlu imza bloğu var mı (e-Arşiv için)
 * - hasVehicle: Araç/sürücü/mal kabul yeri (e-İrsaliye için)
 * - hasCurrency: Döviz kuru bilgisi (e-Döviz, e-İhracat)
 * - hasCommodity: Kıymetli maden bilgisi (e-Kıymetli Maden)
 * - hasCommission: Komisyon oranı (e-Sigorta)
 * - hasVatExemption: KDV istisna bilgisi (e-İstisna, e-Tevkifat)
 * - hasStoppage: Stopaj bilgisi (e-Müstahsil)
 * - specialFields: Modüle özgü ek alanlar
 * - defaultTemplate: Designer'da açılacak XSLT
 * - recommendedSample: Test için önerilen örnek XML
 */
export type ModuleLayout = 'standard' | 'compact' | 'multi-section' | 'service' | 'currency-grid' | 'commodity-grid';

export interface TemplateConfig {
    layout: ModuleLayout;
    hasSignature: boolean;
    hasVehicle: boolean;
    hasCurrency: boolean;
    hasCommodity: boolean;
    hasCommission: boolean;
    hasVatExemption: boolean;
    hasStoppage: boolean;
    hasPassenger: boolean;
    hasService: boolean;
    specialFields: string[];
    defaultTemplate: string;
    recommendedSample: string;
    description: string;
}

export const MODULE_CONFIGS: Record<string, TemplateConfig> = {
    fatura: {
        layout: 'standard',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: false,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['logo', 'stamp', 'bank', 'product_table', 'totals', 'notes'],
        defaultTemplate: 'community/IRPTeam-eFatura.xslt',
        recommendedSample: 'samples/e-Fatura-TICARI.xml',
        description: 'Standart e-Fatura — logo, kaşe, banka, ürün tablosu.',
    },
    arsiv: {
        layout: 'standard',
        hasSignature: true,
        hasVehicle: false,
        hasCurrency: false,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['logo', 'stamp', 'bank', 'product_table', 'totals', 'notes', 'signature'],
        defaultTemplate: 'community/IRPTeam-eFatura-eArsiv.xslt',
        recommendedSample: 'samples/e-Arsiv-TEMEL.xml',
        description: 'e-Arşiv — e-Fatura + zorunlu imza alanı (GİB gereği).',
    },
    irsaliye: {
        layout: 'multi-section',
        hasSignature: false,
        hasVehicle: true,
        hasCurrency: false,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['vehicle', 'driver', 'loading_point', 'unloading_point', 'product_table', 'despatch_info'],
        defaultTemplate: 'community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt',
        recommendedSample: 'samples/e-Irsaliye-TEMEL.xml',
        description: 'e-İrsaliye — araç/sürücü/mal kabul yeri 3-sütunlu layout.',
    },
    ihracat: {
        layout: 'standard',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: true,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['logo', 'stamp', 'bank', 'product_table', 'totals', 'customs_info', 'origin_country', 'gtip_no'],
        defaultTemplate: 'community/IRPTeam-eFatura.xslt',
        recommendedSample: 'samples/e-Ihracat-TEMEL.xml',
        description: 'e-İhracat — gümrük bilgileri, menşe ülke, GTIP no, döviz.',
    },
    mikro_ihracat: {
        layout: 'compact',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: true,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['product_table', 'totals', 'customs_info', 'origin_country'],
        defaultTemplate: 'community/IRPTeam-eFatura.xslt',
        recommendedSample: 'samples/e-Ihracat-TEMEL.xml',
        description: 'e-Mikro İhracat — basitleştirilmiş ihracat layout.',
    },
    smm: {
        layout: 'service',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: false,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: true,
        hasStoppage: true,
        hasPassenger: false,
        hasService: true,
        specialFields: ['logo', 'stamp', 'bank', 'service_table', 'gross_net', 'vat_exemption', 'stoppage', 'identity_no'],
        defaultTemplate: 'community/hzkucuk-eFatura.xslt',
        recommendedSample: 'samples/e-Makbuz-TEMEL.xml',
        description: 'e-SMM — hizmet bilgileri, BRÜT/Net ayrımı, KDV istisna, stopaj.',
    },
    mustahsil: {
        layout: 'standard',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: false,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: true,
        hasPassenger: false,
        hasService: false,
        specialFields: ['buyer_info', 'product_table', 'totals', 'stoppage'],
        defaultTemplate: 'community/hzkucuk-eFatura.xslt',
        recommendedSample: 'samples/e-Makbuz-TEMEL.xml',
        description: 'e-Müstahsil — alıcı bilgileri, müstahsil stopajı.',
    },
    bilet: {
        layout: 'multi-section',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: false,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: true,
        hasService: false,
        specialFields: ['passenger_info', 'voyage_info', 'seat_no', 'price', 'product_table'],
        defaultTemplate: 'community/hzkucuk-eFatura.xslt',
        recommendedSample: 'samples/e-Makbuz-TEMEL.xml',
        description: 'e-Bilet — yolcu bilgileri, sefer, koltuk no.',
    },
    makbuz: {
        layout: 'compact',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: false,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['payment_info', 'totals', 'signature'],
        defaultTemplate: 'community/hzkucuk-eFatura.xslt',
        recommendedSample: 'samples/e-Makbuz-TEMEL.xml',
        description: 'e-Makbuz — basit tek satır ödeme makbuzu.',
    },
    sigorta: {
        layout: 'standard',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: true,
        hasCommodity: false,
        hasCommission: true,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['insurance_branch', 'policy_no', 'commission_rate', 'commission_amount', 'product_table'],
        defaultTemplate: 'gib/e-SigortaKomisyonGider_gorsellestirme.xslt',
        recommendedSample: 'samples/e-SigortaKomisyon-ornek.xml',
        description: 'e-Sigorta Komisyon — branş (Kara/Su/Yangın), komisyon oranı.',
    },
    doviz: {
        layout: 'currency-grid',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: true,
        hasCommodity: false,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['currency_type', 'buy_rate', 'sell_rate', 'amount', 'total', 'profile_id'],
        defaultTemplate: 'gib/eDoviz_KMaden_gorsellestirme.xslt',
        recommendedSample: 'samples/e-Doviz-Alim-ornek.xml',
        description: 'e-Döviz — döviz türü (USD/EUR/GBP), alış/satış kuru.',
    },
    kmaden: {
        layout: 'commodity-grid',
        hasSignature: false,
        hasVehicle: false,
        hasCurrency: true,
        hasCommodity: true,
        hasCommission: false,
        hasVatExemption: false,
        hasStoppage: false,
        hasPassenger: false,
        hasService: false,
        specialFields: ['commodity_type', 'purity', 'weight', 'unit_price', 'total', 'profile_id'],
        defaultTemplate: 'gib/eDoviz_KMaden_gorsellestirme.xslt',
        recommendedSample: 'samples/e-KMaden-Alim-ornek.xml',
        description: 'e-Kıymetli Maden — altın/gümüş/platin, gram/ons, alış/satış.',
    },
};

/**
 * Bir modülün config'ini döndürür. Bulamazsa fallback olarak fatura config'ini kullanır.
 */
export function getModuleConfig(moduleId: string): TemplateConfig {
    return MODULE_CONFIGS[moduleId] || MODULE_CONFIGS.fatura;
}

/**
 * Modülün ihtiyaç duyduğu özel alanlar için bilgi döndürür.
 * Designer'da sidebar'da gösterilir.
 */
export function getModuleHints(moduleId: string): string[] {
    const cfg = getModuleConfig(moduleId);
    const hints: string[] = [];

    if (cfg.hasSignature) hints.push('🔏 İmza alanı zorunlu (GİB)');
    if (cfg.hasVehicle) hints.push('🚚 Araç/sürücü/mal kabul yeri gerekli');
    if (cfg.hasCurrency) hints.push('💱 Döviz kuru bilgisi gerekli');
    if (cfg.hasCommodity) hints.push('🥇 Kıymetli maden bilgisi gerekli');
    if (cfg.hasCommission) hints.push('💰 Komisyon oranı alanı');
    if (cfg.hasVatExemption) hints.push('📋 KDV istisna bilgisi');
    if (cfg.hasStoppage) hints.push('🧾 Stopaj bilgisi');
    if (cfg.hasPassenger) hints.push('👤 Yolcu/sefer/koltuk bilgisi');
    if (cfg.hasService) hints.push('🛠️ Hizmet bilgileri');

    return hints;
}