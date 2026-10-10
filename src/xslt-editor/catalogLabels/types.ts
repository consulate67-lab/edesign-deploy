/** GİB alan kataloğu çeviri sözlüğü; anahtarlar `fieldCatalog.ts`'teki Türkçe metinlerdir. */
export interface GibDict {
    /** `{{party}}`/`{{field}}`, `{{label}}`, `{{name}}` yer tutucuları. */
    tpl: { party: string; line: string; amount: string; base: string; rate: string };
    /** Taraf önekleri (Satıcı, Alıcı, Gönderen …). */
    parties: Record<string, string>;
    /** Taraf öneki sonrası alan adları (Unvanı, VKN, İl …). */
    partyFields: Record<string, string>;
    /** Vergi / kesinti adları (KDV, Damga Vergisi …). */
    taxes: Record<string, string>;
    /** Kalan tam etiketler ve kategori adları. */
    labels: Record<string, string>;
}
