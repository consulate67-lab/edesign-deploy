<?php
// Yönetim panelindeki posta kutusu için köprü. Posta sunucusu dışarıya yalnız şifresiz POP3 (110)
// ve SMTP (587) açıyor, Railway de giden SMTP'yi engelliyor; bu yüzden bağlantılar sağlayıcının
// kendi ağındaki bu dosyadan kurulur. İstekler mail-relay.php ile aynı anahtarla HMAC-SHA256 imzalıdır.
//
// İşlemler (op): check, list, fetch, delete, send. Hesap parolası her istekte Railway'den gelir;
// burada saklanmaz.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
@set_time_limit(60);

function out(int $status, array $data): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function fail(int $status, string $message): never
{
    out($status, ['error' => $message]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail(405, 'method');
$configFile = dirname(__DIR__) . '/edx-mail-config.php';
if (!is_file($configFile)) fail(503, 'not configured');
$cfg = require $configFile;
if (empty($cfg['secret'])) fail(503, 'not configured');

$raw = file_get_contents('php://input', false, null, 0, 8 * 1024 * 1024);
$ts = (string) ($_SERVER['HTTP_X_RELAY_TIMESTAMP'] ?? '');
$sig = strtolower((string) ($_SERVER['HTTP_X_RELAY_SIGNATURE'] ?? ''));
if (!ctype_digit($ts) || abs(time() - (int) $ts) > 300) fail(401, 'timestamp');
if (!hash_equals(hash_hmac('sha256', $ts . '.' . $raw, $cfg['secret']), $sig)) fail(401, 'signature');

$req = json_decode($raw, true);
if (!is_array($req)) fail(400, 'body');
$op = (string) ($req['op'] ?? '');
$user = (string) ($req['user'] ?? '');
$pass = (string) ($req['pass'] ?? '');
if (!filter_var($user, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n<>\s]/', $user)) fail(400, 'user');
if ($pass === '' || preg_match('/[\r\n]/', $pass)) fail(400, 'pass');

$domain = substr(strrchr($user, '@'), 1);
$validHost = fn ($h) => is_string($h) && preg_match('/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i', $h);
$popHost = $validHost($req['popHost'] ?? null) ? $req['popHost'] : "mail.$domain";
$smtpHost = $validHost($req['smtpHost'] ?? null) ? $req['smtpHost'] : "mail.$domain";
$smtpPort = (int) ($req['smtpPort'] ?? 587);
if (!in_array($smtpPort, [25, 465, 587], true)) $smtpPort = 587;

// ------------------------------------------------------------ POP3

function pop_line($s): string
{
    $line = fgets($s, 65536);
    if ($line === false) throw new RuntimeException('pop: bağlantı koptu');
    return $line;
}
function pop_cmd($s, string $cmd, string $step = ''): string
{
    fwrite($s, $cmd . "\r\n");
    $line = pop_line($s);
    if (strncmp($line, '+OK', 3) !== 0) throw new RuntimeException('pop ' . ($step ?: strtok($cmd, ' ')) . ': ' . trim(substr($line, 0, 200)));
    return $line;
}
/** Çok satırlı yanıtın gövdesi (nokta-doldurma çözülmüş). */
function pop_body($s): string
{
    $out = '';
    while (true) {
        $line = pop_line($s);
        if ($line === ".\r\n" || $line === ".\n") break;
        if ($line !== '' && $line[0] === '.') $line = substr($line, 1);
        $out .= $line;
    }
    return $out;
}
function pop_open(string $host, string $user, string $pass)
{
    $s = @stream_socket_client("tcp://$host:110", $no, $err, 15);
    if (!$s) throw new RuntimeException("pop CONNECT: $err");
    stream_set_timeout($s, 25);
    $greet = pop_line($s);
    if (strncmp($greet, '+OK', 3) !== 0) throw new RuntimeException('pop CONNECT: ' . trim($greet));
    pop_cmd($s, 'USER ' . $user, 'AUTH');
    pop_cmd($s, 'PASS ' . $pass, 'AUTH');
    return $s;
}
/** uid => [n, size] */
function pop_index($s): array
{
    pop_cmd($s, 'UIDL');
    $uids = [];
    foreach (explode("\n", pop_body($s)) as $l) {
        if (preg_match('/^(\d+)\s+(\S+)/', trim($l), $m)) $uids[(int) $m[1]] = $m[2];
    }
    pop_cmd($s, 'LIST');
    $sizes = [];
    foreach (explode("\n", pop_body($s)) as $l) {
        if (preg_match('/^(\d+)\s+(\d+)/', trim($l), $m)) $sizes[(int) $m[1]] = (int) $m[2];
    }
    $index = [];
    foreach ($uids as $n => $uid) $index[$uid] = [$n, $sizes[$n] ?? 0];
    return $index;
}
function pop_quit($s): void
{
    @fwrite($s, "QUIT\r\n");
    @fgets($s, 512);
    fclose($s);
}

// ------------------------------------------------------------ SMTP

function smtp_send(string $host, int $port, string $user, string $pass, array $rcpts, string $data): array
{
    $sock = @stream_socket_client(($port === 465 ? 'ssl://' : 'tcp://') . "$host:$port", $errno, $errstr, 15);
    if (!$sock) throw new RuntimeException("smtp CONNECT: $errstr");
    stream_set_timeout($sock, 25);
    $read = function () use ($sock): array {
        $lines = '';
        while (($line = fgets($sock, 1024)) !== false) {
            $lines .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') break;
        }
        return [(int) substr($lines, 0, 3), trim($lines)];
    };
    $step = 'CONNECT';
    $cmd = function (?string $line, array $expect) use ($sock, $read, &$step): string {
        if ($line !== null) fwrite($sock, $line . "\r\n");
        [$code, $reply] = $read();
        if (!in_array($code, $expect, true)) throw new RuntimeException("smtp $step: " . (substr($reply, 0, 200) ?: 'yanıt yok'));
        return $reply;
    };
    $rejected = [];
    try {
        $cmd(null, [220]);
        $step = 'EHLO';
        $ehlo = $cmd('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), [250]);
        if ($port !== 465 && stripos($ehlo, 'STARTTLS') !== false) {
            $step = 'STARTTLS';
            $cmd('STARTTLS', [220]);
            if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('smtp STARTTLS');
            $cmd('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), [250]);
        }
        $step = 'AUTH';
        $cmd('AUTH LOGIN', [334]);
        $cmd(base64_encode($user), [334]);
        $cmd(base64_encode($pass), [235]);
        $step = 'MAIL';
        $cmd("MAIL FROM:<$user>", [250]);
        $step = 'RCPT';
        $accepted = 0;
        foreach ($rcpts as $to) {
            fwrite($sock, "RCPT TO:<$to>\r\n");
            [$code, $reply] = $read();
            if ($code === 250 || $code === 251) $accepted++;
            else $rejected[] = ['to' => $to, 'reply' => substr($reply, 0, 200)];
        }
        if (!$accepted) throw new RuntimeException('smtp RCPT: ' . ($rejected[0]['reply'] ?? 'alıcı reddedildi'));
        $step = 'DATA';
        $cmd('DATA', [354]);
        $data = preg_replace('/\r?\n/', "\r\n", $data);
        if (substr($data, -2) !== "\r\n") $data .= "\r\n";
        $cmd(preg_replace('/^\./m', '..', $data) . '.', [250]);
        $step = 'QUIT';
        @fwrite($sock, "QUIT\r\n");
    } finally {
        fclose($sock);
    }
    return $rejected;
}

// ------------------------------------------------------------ işlemler

try {
    switch ($op) {
        case 'check':
            $s = pop_open($popHost, $user, $pass);
            $stat = pop_cmd($s, 'STAT');
            pop_quit($s);
            out(200, ['ok' => true, 'count' => (int) (explode(' ', trim($stat))[1] ?? 0)]);

        case 'list':
            $s = pop_open($popHost, $user, $pass);
            $index = pop_index($s);
            pop_quit($s);
            $list = [];
            foreach ($index as $uid => [$n, $size]) $list[] = ['uid' => (string) $uid, 'n' => $n, 'size' => $size];
            out(200, ['messages' => $list]);

        case 'fetch':
            $want = array_values(array_filter((array) ($req['uids'] ?? []), 'is_string'));
            $budget = min(max((int) ($req['maxBytes'] ?? 0), 1), 6 * 1024 * 1024);
            $s = pop_open($popHost, $user, $pass);
            $index = pop_index($s);
            $messages = [];
            $missing = [];
            $used = 0;
            $deadline = microtime(true) + 22;
            foreach ($want as $uid) {
                if (!isset($index[$uid])) { $missing[] = $uid; continue; }
                [$n, $size] = $index[$uid];
                if ($messages && ($used + $size > $budget || microtime(true) > $deadline)) break;
                pop_cmd($s, "RETR $n");
                $messages[] = ['uid' => $uid, 'raw' => base64_encode(pop_body($s))];
                $used += $size;
            }
            pop_quit($s);
            out(200, ['messages' => $messages, 'missing' => $missing]);

        case 'delete':
            $want = array_values(array_filter((array) ($req['uids'] ?? []), 'is_string'));
            $s = pop_open($popHost, $user, $pass);
            $index = pop_index($s);
            $deleted = [];
            foreach ($want as $uid) {
                if (!isset($index[$uid])) continue;
                pop_cmd($s, 'DELE ' . $index[$uid][0]);
                $deleted[] = $uid;
            }
            pop_quit($s);
            out(200, ['deleted' => $deleted]);

        case 'send':
            $rcpts = [];
            foreach ((array) ($req['rcpts'] ?? []) as $to) {
                if (!is_string($to) || !filter_var($to, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n<>\s]/', $to)) fail(400, 'recipient');
                $rcpts[] = $to;
            }
            if (!$rcpts || count($rcpts) > 100) fail(400, 'recipient');
            $data = base64_decode((string) ($req['raw'] ?? ''), true);
            if ($data === false || $data === '') fail(400, 'raw');
            $rejected = smtp_send($smtpHost, $smtpPort, $user, $pass, $rcpts, $data);
            out(200, ['sent' => true, 'rejected' => $rejected]);

        default:
            fail(400, 'op');
    }
} catch (Throwable $e) {
    fail(502, substr($e->getMessage(), 0, 300));
}
