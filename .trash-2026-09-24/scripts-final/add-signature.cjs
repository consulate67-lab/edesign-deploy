const fs = require('fs');
const path = 'D:/EIslemler/public/ebelge/community/IRPTeam-eFatura-eArsiv.xslt';
let content = fs.readFileSync(path, 'utf8');

const signatureBlock = `
        <!-- ============================================== -->
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
        </div>
`;

const idx = content.indexOf('</body>');
if (idx < 0) { console.error('</body> bulunamadi'); process.exit(1); }

const newContent = content.slice(0, idx) + signatureBlock + content.slice(idx);
fs.writeFileSync(path, newContent, 'utf8');

console.log('Yeni boyut:', fs.statSync(path).size, 'bytes');
console.log('Eski boyut: 390449 bytes');
console.log('Fark:', fs.statSync(path).size - 390449, 'bytes (imza blogu)');
console.log('Imza blogu eklendi mi?', newContent.includes('e-Arsiv Imza Alani') ? 'EVET' : 'HAYIR');