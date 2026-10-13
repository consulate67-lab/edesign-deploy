<?php
// Railway giden SMTP bağlantılarını engellediği için API e-postaları bu dosya
// üzerinden alan adının kendi SMTP sunucusuyla gönderilir. İstek gövdesi,
// sunucudaki MAIL_RELAY_SECRET ile HMAC-SHA256 imzalı olmalıdır.
// Ayarlar web kökünün dışındaki edx-mail-config.php dosyasındadır:
//   return ['secret' => '...', 'smtp_host' => 'smtp.edxdocu.com', 'smtp_port' => 587,
//           'smtp_user' => 'noreply@edxdocu.com', 'smtp_pass' => '...', 'from_name' => 'edXdocu'];
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function fail(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail(405, 'method');
$configFile = dirname(__DIR__) . '/edx-mail-config.php';
if (!is_file($configFile)) fail(503, 'not configured');
$cfg = require $configFile;
if (empty($cfg['secret']) || empty($cfg['smtp_user']) || empty($cfg['smtp_pass'])) fail(503, 'not configured');

$raw = file_get_contents('php://input', false, null, 0, 262144);
$ts = (string) ($_SERVER['HTTP_X_RELAY_TIMESTAMP'] ?? '');
$sig = strtolower((string) ($_SERVER['HTTP_X_RELAY_SIGNATURE'] ?? ''));
if (!ctype_digit($ts) || abs(time() - (int) $ts) > 300) fail(401, 'timestamp');
if (!hash_equals(hash_hmac('sha256', $ts . '.' . $raw, $cfg['secret']), $sig)) fail(401, 'signature');

$msg = json_decode($raw, true);
$to = is_array($msg) ? (string) ($msg['to'] ?? '') : '';
if (!filter_var($to, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n<>]/', $to)) fail(400, 'recipient');
$subject = preg_replace('/[\r\n]+/', ' ', (string) ($msg['subject'] ?? ''));
$text = (string) ($msg['text'] ?? '');
$html = (string) ($msg['html'] ?? '');
if ($subject === '' || ($text === '' && $html === '')) fail(400, 'content');

// Toplu gönderimde Gmail/Outlook'un "abonelikten çık" düğmesi için; başka başlık kabul edilmez.
$extraHeaders = [];
$allowedHeaders = ['List-Unsubscribe', 'List-Unsubscribe-Post'];
if (is_array($msg['headers'] ?? null)) {
    foreach ($allowedHeaders as $name) {
        $value = $msg['headers'][$name] ?? null;
        if (is_string($value) && $value !== '' && strlen($value) <= 600 && !preg_match('/[\r\n]/', $value)) {
            $extraHeaders[] = "$name: $value";
        }
    }
}

$from = $cfg['smtp_user'];
$fromName = (string) ($cfg['from_name'] ?? 'edXdocu');
$encode = fn (string $s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
$boundary = 'edx_' . bin2hex(random_bytes(12));
$domain = substr(strrchr($from, '@'), 1);
$headers = [
    'Date: ' . date('r'),
    'From: ' . $encode($fromName) . " <$from>",
    "To: <$to>",
    'Subject: ' . $encode($subject),
    'Message-ID: <' . bin2hex(random_bytes(16)) . "@$domain>",
    'MIME-Version: 1.0',
    "Content-Type: multipart/alternative; boundary=\"$boundary\"",
];
$headers = array_merge($headers, $extraHeaders);
$part = fn (string $type, string $body) => "--$boundary\r\nContent-Type: $type; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($body), 76, "\r\n");
$data = implode("\r\n", $headers) . "\r\n\r\n"
    . ($text !== '' ? $part('text/plain', $text) : '')
    . ($html !== '' ? $part('text/html', $html) : '')
    . "--$boundary--\r\n";

$host = (string) ($cfg['smtp_host'] ?? 'smtp.edxdocu.com');
$port = (int) ($cfg['smtp_port'] ?? 587);
$sock = @stream_socket_client(($port === 465 ? 'ssl://' : 'tcp://') . "$host:$port", $errno, $errstr, 15);
if (!$sock) fail(502, "smtp CONNECT: $errstr");
stream_set_timeout($sock, 20);
$step = 'CONNECT';

$read = function () use ($sock): array {
    $lines = '';
    while (($line = fgets($sock, 1024)) !== false) {
        $lines .= $line;
        if (strlen($line) < 4 || $line[3] === ' ') break;
    }
    return [(int) substr($lines, 0, 3), $lines];
};
$cmd = function (?string $line, array $expect) use ($sock, $read): string {
    if ($line !== null) fwrite($sock, $line . "\r\n");
    [$code, $reply] = $read();
    if (!in_array($code, $expect, true)) throw new RuntimeException(trim($reply) ?: 'no reply');
    return $reply;
};

// Hata metnindeki adım adı (RCPT, AUTH...) API'nin alıcı hatasını sunucu hatasından ayırması için gerekli.
try {
    $cmd(null, [220]);
    $step = 'EHLO';
    $ehlo = $cmd('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'edxdocu.com'), [250]);
    if ($port !== 465 && stripos($ehlo, 'STARTTLS') !== false) {
        $step = 'STARTTLS';
        $cmd('STARTTLS', [220]);
        if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('starttls');
        $cmd('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'edxdocu.com'), [250]);
    }
    $step = 'AUTH';
    $cmd('AUTH LOGIN', [334]);
    $cmd(base64_encode($cfg['smtp_user']), [334]);
    $cmd(base64_encode($cfg['smtp_pass']), [235]);
    $step = 'MAIL';
    $cmd("MAIL FROM:<$from>", [250]);
    $step = 'RCPT';
    $cmd("RCPT TO:<$to>", [250, 251]);
    $step = 'DATA';
    $cmd('DATA', [354]);
    $cmd(preg_replace('/^\./m', '..', $data) . '.', [250]);
    $step = 'QUIT';
    $cmd('QUIT', [221]);
} catch (Throwable $e) {
    fclose($sock);
    fail(502, "smtp $step: " . substr($e->getMessage(), 0, 200));
}
fclose($sock);
echo json_encode(['sent' => true]);
