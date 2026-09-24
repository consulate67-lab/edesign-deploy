const fs = require('fs');
const path = 'D:/EIslemler/public/ebelge/community/IRPTeam-eFatura-eArsiv.xslt';

let content = fs.readFileSync(path, 'utf8');

// Eski imza bloku (sade)
const oldBlock = `        <!-- ============================================== -->
        <!-- e-Arsiv Imza Alani (GIB zorunlu)             -->
        <!-- ============================================== -->
        <div class="signature-area" style="margin-top: 30px; padding: 20px; border: 2px dashed #6366f1; border-radius: 8px; background: rgba(99, 102, 241, 0.04);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="font-size: 11px; color: #6366f1; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 6px;">
                        E-IMZA / E-ARSIV
                    </div>
                    <div style="font-size: 10px; color: #64748b;">
                        Bu belge 5070 sayili Elektronik Imza Kanunu ve GIB e-Arsiv
                        Yonetmeligi geregi elektronik olarak imzalanmistir.
                    </div>
                </div>
                <div style="flex: 0 0 200px; text-align: center; padding: 10px; background: white; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                    <div style="font-size: 10px; color: #1e3a8a; font-weight: 700;">
                        e-IMZA DOGRULAMA
                    </div>
                    <div style="font-size: 9px; color: #475569; margin-top: 4px; font-family: monospace;">
                        (QR / Imza Alani)
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(99, 102, 241, 0.2); font-size: 10px; color: #94a3b8;">
                <span>Imza Tarihi: (otomatik)</span>
                <span>Belge Turu: e-Arsiv Fatura</span>
            </div>
        </div>`;

// Yeni buyuk ve prominent imza bloku (QR kod ile gercekci, baslik buyuk, footer bilgi)
const newBlock = `        <!-- ============================================== -->
        <!-- e-Arsiv Imza Alani (GIB ZORUNLU - PROMINENT)  -->
        <!-- ============================================== -->
        <div class="signature-area" style="margin-top: 50px; padding: 40px 32px; border: 4px dashed #4338ca; border-radius: 16px; background: linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(67,56,202,0.18) 100%); position: relative; box-shadow: 0 12px 40px rgba(99, 102, 241, 0.20);">
            <!-- Buyuk baslik -->
            <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid rgba(99, 102, 241, 0.25);">
                <div style="display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #4338ca, #6366f1); color: #fff; font-size: 16px; font-weight: 800; letter-spacing: 3px; border-radius: 8px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);">
                    E-ARŞİV FATURASI
                </div>
                <div style="margin-top: 10px; font-size: 11px; color: #4338ca; letter-spacing: 2px; font-weight: 600;">
                    ELEKTRONİK İMZA / E-ARŞİV
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;">
                <!-- Sol: Aciklama -->
                <div style="flex: 1;">
                    <div style="font-size: 12px; color: #1e1b4b; line-height: 1.6; margin-bottom: 16px;">
                        <strong style="color: #4338ca;">Bu belge</strong> 5070 sayılı Elektronik İmza Kanunu ve GİB e-Arşiv Yönetmeliği gereği
                        elektronik olarak imzalanmıştır. Belge içeriği değiştirilemez; tahrifat halinde geçersizdir.
                    </div>
                    <div style="font-size: 11px; color: #475569; padding: 12px 14px; background: rgba(255,255,255,0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.18);">
                        <div style="margin-bottom: 4px;"><strong style="color: #4338ca;">Belge No:</strong> [otomatik üretilir]</div>
                        <div style="margin-bottom: 4px;"><strong style="color: #4338ca;">İmza Tarihi:</strong> [otomatik üretilir]</div>
                        <div><strong style="color: #4338ca;">Mali Değer:</strong> ₺ [toplam tutar]</div>
                    </div>
                </div>

                <!-- Sag: QR Imza Alani -->
                <div style="flex: 0 0 240px; text-align: center; padding: 20px 16px; background: linear-gradient(135deg, #ffffff, #f1f5f9); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); border: 2px solid rgba(99, 102, 241, 0.25);">
                    <div style="font-size: 11px; color: #1e3a8a; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 12px;">
                        e-İMZA DOĞRULAMA
                    </div>
                    <!-- QR Placeholder -->
                    <div style="width: 140px; height: 140px; margin: 0 auto; background:
                        conic-gradient(from 0deg at 50% 50%,
                            #1e293b 0deg 45deg, transparent 45deg 90deg,
                            #1e293b 90deg 135deg, transparent 135deg 180deg,
                            #1e293b 180deg 225deg, transparent 225deg 270deg,
                            #1e293b 270deg 315deg, transparent 315deg 360deg),
                        #fff;
                        border: 4px solid #1e293b;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    ">
                        <div style="font-size: 9px; color: #1e293b; font-weight: 700; letter-spacing: 1px;">QR KOD</div>
                    </div>
                    <div style="font-size: 10px; color: #475569; margin-top: 10px; font-family: monospace; line-height: 1.4;">
                        [QR / İmza Alanı]<br/>
                        <span style="font-size: 9px; color: #94a3b8;">Gib imza kodu burada görünür</span>
                    </div>
                </div>
            </div>

            <!-- Alt: Bilgi -->
            <div style="display: flex; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 2px solid rgba(99, 102, 241, 0.25); font-size: 10px; color: #4338ca; font-weight: 600;">
                <span>📄 Belge Türü: E-ARŞİV FATURASI</span>
                <span>🕐 Oluşturma: [otomatik]</span>
            </div>
        </div>`;

if (!content.includes(oldBlock)) {
    console.error('ESKI BLOK BULUNAMADI!');
    console.log('Benzer arama yapiliyor...');
    const idx = content.indexOf('e-Arsiv Imza Alani');
    if (idx > 0) {
        console.log('"e-Arsiv Imza Alani" bulundu, index:', idx);
        console.log('Content ornek:', content.substr(idx, 200));
    }
    process.exit(1);
}

const newContent = content.replace(oldBlock, newBlock);
fs.writeFileSync(path, newContent, 'utf8');

console.log('Yeni boyut:', fs.statSync(path).size, 'bytes');
console.log('Eski boyut:', 392277, 'bytes');
console.log('Fark:', fs.statSync(path).size - 392277, 'bytes');
console.log('Yeni blok eklendi mi?', newContent.includes('E-ARŞİV FATURASI') ? 'EVET' : 'HAYIR');