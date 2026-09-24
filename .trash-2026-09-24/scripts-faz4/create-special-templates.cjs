const fs = require('fs');

const basePath = 'D:/EIslemler/public/ebelge/community/hzkucuk-eFatura.xslt';
const baseSize = fs.statSync(basePath).size;
console.log('Base boyut:', baseSize, 'bytes');

// Her modul icin section icerigi
const specialSections = {
    smm: `
        <!-- ============================================== -->
        <!-- e-SMM Hizmet Bilgileri / BRUT-Net / KDV Istisna -->
        <!-- ============================================== -->
        <div class="smm-section" style="margin-top: 24px; padding: 20px; background: rgba(20, 184, 166, 0.06); border: 1px solid rgba(20, 184, 166, 0.25); border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #14b8a6; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">HIZMET BILGILERI</div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Hizmet Turu:</td><td><strong>[Hizmet]</strong></td></tr>
                        <tr><td style="color: #64748b;">Donem:</td><td>[Donem]</td></tr>
                        <tr><td style="color: #64748b;">TC/VKN:</td><td>[Kimlik No]</td></tr>
                        <tr><td style="color: #64748b;">SGK/Vergi Dairesi:</td><td>[Bilgi]</td></tr>
                    </table>
                </div>
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #14b8a6; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">BRUT / NET / KDV</div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Brut Ucret:</td><td><strong>[Brut]</strong></td></tr>
                        <tr><td style="color: #64748b;">KDV Istisna:</td><td>EVET / HAYIR</td></tr>
                        <tr><td style="color: #64748b;">Stopaj (%):</td><td>[Oran]</td></tr>
                        <tr><td style="color: #64748b;">Net Odeme:</td><td><strong>[Net]</strong></td></tr>
                    </table>
                </div>
            </div>
        </div>
`,
    mustahsil: `
        <!-- ============================================== -->
        <!-- e-Mustahsil Alici Bilgileri + Stopaj -->
        <!-- ============================================== -->
        <div class="mustahsil-section" style="margin-top: 24px; padding: 20px; background: rgba(132, 204, 22, 0.06); border: 1px solid rgba(132, 204, 22, 0.25); border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #84cc16; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">MUSTAHSIL BILGILERI</div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Ad Soyad:</td><td><strong>[Musteki Adi]</strong></td></tr>
                        <tr><td style="color: #64748b;">TC/VKN:</td><td>[Kimlik No]</td></tr>
                        <tr><td style="color: #64748b;">Adres:</td><td>[Adres]</td></tr>
                        <tr><td style="color: #64748b;">Mahsup:</td><td>[Urun/Cins]</td></tr>
                    </table>
                </div>
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #84cc16; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">ODEME / STOPAJ</div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Brut Tutar:</td><td><strong>[Brut]</strong></td></tr>
                        <tr><td style="color: #64748b;">Stopaj:</td><td>[Tutar]</td></tr>
                        <tr><td style="color: #64748b;">Net Odeme:</td><td><strong>[Net]</strong></td></tr>
                        <tr><td style="color: #64748b;">Banka:</td><td>[Hesap]</td></tr>
                    </table>
                </div>
            </div>
        </div>
`,
    bilet: `
        <!-- ============================================== -->
        <!-- e-Bilet Yolcu / Sefer / Koltuk -->
        <!-- ============================================== -->
        <div class="bilet-section" style="margin-top: 24px; padding: 20px; background: rgba(249, 115, 22, 0.06); border: 1px solid rgba(249, 115, 22, 0.25); border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #f97316; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">YOLCU BILGILERI</div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Ad Soyad:</td><td><strong>[Yolcu Adi]</strong></td></tr>
                        <tr><td style="color: #64748b;">TC/VKN:</td><td>[Kimlik No]</td></tr>
                        <tr><td style="color: #64748b;">E-posta:</td><td>[E-posta]</td></tr>
                        <tr><td style="color: #64748b;">Telefon:</td><td>[Telefon]</td></tr>
                    </table>
                </div>
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #f97316; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">SEFER / KOLTUK</div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Firma:</td><td>[Firma Adi]</td></tr>
                        <tr><td style="color: #64748b;">Sefer No:</td><td>[Sefer]</td></tr>
                        <tr><td style="color: #64748b;">Kalkis/Varis:</td><td>[Nereden]->[Nereye]</td></tr>
                        <tr><td style="color: #64748b;">Koltuk No:</td><td><strong>[Koltuk]</strong></td></tr>
                    </table>
                </div>
            </div>
        </div>
`,
    makbuz: `
        <!-- ============================================== -->
        <!-- e-Makbuz Basit Odeme Bilgisi -->
        <!-- ============================================== -->
        <div class="makbuz-section" style="margin-top: 24px; padding: 16px; background: rgba(6, 182, 212, 0.06); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #06b6d4; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 6px;">ODEME</div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Sekli:</td><td><strong>[Nakit/Kart/Havale]</strong></td></tr>
                        <tr><td style="color: #64748b;">Tutar:</td><td><strong>[Tutar] TL</strong></td></tr>
                    </table>
                </div>
                <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #06b6d4; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 6px;">MAKBUZ</div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">No:</td><td>[Makbuz No]</td></tr>
                        <tr><td style="color: #64748b;">Tarih:</td><td>[Tarih]</td></tr>
                    </table>
                </div>
                <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #06b6d4; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 6px;">IMZA</div>
                    <div style="font-size: 10px; color: #64748b; text-align: center; padding: 12px 0;">
                        <em>(Teslim Alan Imzasi)</em>
                    </div>
                </div>
            </div>
        </div>
`,
};

// Her modul icin yeni XSLT olustur
const templates = [
    { name: 'smm', suffix: 'smm', sectionKey: 'smm' },
    { name: 'mustahsil', suffix: 'mustahsil', sectionKey: 'mustahsil' },
    { name: 'bilet', suffix: 'bilet', sectionKey: 'bilet' },
    { name: 'makbuz', suffix: 'makbuz', sectionKey: 'makbuz' },
];

for (const t of templates) {
    const dstPath = `D:/EIslemler/public/ebelge/community/hzkucuk-eFatura-${t.suffix}.xslt`;
    let content = fs.readFileSync(basePath, 'utf8');

    const idx = content.indexOf('</body>');
    if (idx < 0) {
        console.error(`${t.name}: </body> bulunamadi`);
        continue;
    }

    const newContent = content.slice(0, idx) + specialSections[t.sectionKey] + content.slice(idx);
    fs.writeFileSync(dstPath, newContent, 'utf8');

    console.log(`${t.name}: ${(fs.statSync(dstPath).size / 1024).toFixed(1)} KB (+${fs.statSync(dstPath).size - baseSize} bytes)`);
}