<?php
// Lisans mührünün ikinci adresi: XSLT'nin açıldığı ağ Railway alan adını
// engelliyorsa istek bu siteden API'ye iletilir. API'ye ulaşılamazsa saydam
// resim döner; karar XSLT'deki çevrimdışı kilide kalır.
$transparent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
header('Content-Type: image/png');
header('Cache-Control: no-store, max-age=0');
header('Access-Control-Allow-Origin: *');
header('Cross-Origin-Resource-Policy: cross-origin');

$token = preg_replace('/[^0-9a-f]/', '', strtolower((string) ($_GET['t'] ?? '')));
$taxId = substr(preg_replace('/\D/', '', (string) ($_GET['v'] ?? '')), 0, 11);
$clean = fn ($v) => substr(preg_replace('/[\r\n]/', ' ', (string) $v), 0, 300);

$body = false;
if (function_exists('curl_init')) {
    $ch = curl_init('https://edesign-deploy-production.up.railway.app/api/designs/seal/' . $token . '/t' . $taxId . '.png');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => [
            'X-Seal-Client: ' . $clean($_SERVER['REMOTE_ADDR'] ?? ''),
            'X-Seal-Agent: ' . $clean($_SERVER['HTTP_USER_AGENT'] ?? ''),
            'X-Seal-Referer: ' . $clean($_SERVER['HTTP_REFERER'] ?? ''),
        ],
    ]);
    $body = curl_exec($ch);
    $ok = $body !== false
        && curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200
        && strpos((string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE), 'image/png') === 0;
    curl_close($ch);
    if (!$ok) $body = false;
}
echo $body !== false ? $body : base64_decode($transparent);
