const fs = require('fs');

const basePath = 'D:/EIslemler/public/ebelge/community/IRPTeam-eWaybill-Irsaliye.xslt';
const newPath = 'D:/EIslemler/public/ebelge/community/IRPTeam-eWaybill-Irsaliye-Aracli.xslt';

// Kopyala
fs.copyFileSync(basePath, newPath);
console.log('Kopyalandi:', fs.statSync(newPath).size, 'bytes');

let content = fs.readFileSync(newPath, 'utf8');

// Araç/Sürücü/Mal Kabul 3-sütunlu section (e-İrsaliye için zorunlu alanlar)
const vehicleSection = `
        <!-- ============================================== -->
        <!-- e-Irsaliye Arac/Surucu/Mal Kabul Section     -->
        <!-- ============================================== -->
        <div class="vehicle-section" style="margin-top: 24px; padding: 20px; background: rgba(14, 165, 233, 0.06); border: 1px solid rgba(14, 165, 233, 0.25); border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                <!-- Sutun 1: Arac Bilgileri -->
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #0ea5e9; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">
                        ARAC BILGILERI
                    </div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Plaka:</td><td><strong>[Plaka]</strong></td></tr>
                        <tr><td style="color: #64748b;">Marka:</td><td>[Marka]</td></tr>
                        <tr><td style="color: #64748b;">Model:</td><td>[Model]</td></tr>
                        <tr><td style="color: #64748b;">Tip:</td><td>[Kamyon / Kamyonet / TIR]</td></tr>
                    </table>
                </div>

                <!-- Sutun 2: Surucu Bilgileri -->
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #0ea5e9; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">
                        SURUCU BILGILERI
                    </div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Ad Soyad:</td><td><strong>[Surucu Adi]</strong></td></tr>
                        <tr><td style="color: #64748b;">TC/VKN:</td><td>[TC/VKN]</td></tr>
                        <tr><td style="color: #64748b;">Telefon:</td><td>[Telefon]</td></tr>
                        <tr><td style="color: #64748b;">Ehliyet:</td><td>[Ehliyet No]</td></tr>
                    </table>
                </div>

                <!-- Sutun 3: Mal Kabul / Sevkiyat -->
                <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 6px;">
                    <div style="font-size: 10px; color: #0ea5e9; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">
                        MAL KABUL / SEVKIYAT
                    </div>
                    <table style="width: 100%; font-size: 11px; color: #475569; line-height: 1.6;">
                        <tr><td style="color: #64748b;">Yu. Adresi:</td><td>[Yukleme Adresi]</td></tr>
                        <tr><td style="color: #64748b;">Bo. Adresi:</td><td>[Bosaltma Adresi]</td></tr>
                        <tr><td style="color: #64748b;">Sevk Tarihi:</td><td>[Tarih]</td></tr>
                        <tr><td style="color: #64748b;">Saat:</td><td>[Saat]</td></tr>
                    </table>
                </div>
            </div>

            <!-- Footer: UBL referans -->
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(14, 165, 233, 0.18); font-size: 10px; color: #64748b; text-align: center;">
                Bu belge UBL-TR 1.2.1 DespatchAdvice semasina uygun olarak hazirlanmistir.
            </div>
        </div>
`;

// '</body>' oncesine ekle
const idx = content.indexOf('</body>');
if (idx < 0) { console.error('</body> bulunamadi'); process.exit(1); }

const newContent = content.slice(0, idx) + vehicleSection + content.slice(idx);
fs.writeFileSync(newPath, newContent, 'utf8');

console.log('Yeni boyut:', fs.statSync(newPath).size, 'bytes');
console.log('Eski boyut:', 364449, 'bytes (varsayilan)');
console.log('Fark:', fs.statSync(newPath).size - fs.statSync(basePath).size, 'bytes');
console.log('Arac section eklendi mi?', newContent.includes('ARAC BILGILERI') ? 'EVET' : 'HAYIR');