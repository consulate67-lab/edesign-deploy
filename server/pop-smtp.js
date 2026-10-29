/**
 * Hosting POP3 (110) + SMTP (587/STARTTLS) istemcisi.
 * www Railway'e taşındıktan sonra PHP köprüsü çalışmadığı için
 * yönetim paneli posta kutusu bu modül üzerinden doğrudan bağlanır.
 */
import { connect as tlsConnect } from 'node:tls';
import { createConnection } from 'node:net';

const DOMAIN = (email) => email.slice(email.lastIndexOf('@') + 1);
const validHost = (h) => typeof h === 'string' && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(h);

class LineSocket {
    constructor(socket) {
        this.socket = socket;
        this.buf = Buffer.alloc(0);
        this.closed = false;
        this.err = null;
        this._kick = null;
        socket.on('data', (c) => {
            this.buf = Buffer.concat([this.buf, c]);
            this._kick?.();
        });
        socket.on('error', (e) => { this.err = e; this._kick?.(); });
        socket.on('end', () => { this.closed = true; this._kick?.(); });
        socket.on('close', () => { this.closed = true; this._kick?.(); });
    }

    _wait() {
        return new Promise((resolve, reject) => {
            if (this.err) return reject(this.err);
            if (this.closed && this.buf.length === 0) return reject(new Error('bağlantı koptu'));
            const t = setTimeout(() => reject(new Error('bağlantı zaman aşımı')), 25_000);
            this._kick = () => {
                clearTimeout(t);
                this._kick = null;
                if (this.err) reject(this.err);
                else resolve();
            };
        });
    }

    async readLine() {
        while (true) {
            const i = this.buf.indexOf(0x0a);
            if (i >= 0) {
                const line = this.buf.subarray(0, i + 1).toString('utf8');
                this.buf = this.buf.subarray(i + 1);
                return line.endsWith('\r\n') ? line : line.replace(/\n$/, '\r\n');
            }
            if (this.closed) throw new Error('bağlantı koptu');
            await this._wait();
        }
    }

    write(s) {
        this.socket.write(s);
    }

    destroy() {
        try { this.socket.destroy(); } catch { /* ignore */ }
    }
}

const connectTcp = (host, port) => new Promise((resolve, reject) => {
    const s = createConnection({ host, port }, () => resolve(s));
    s.setTimeout(15_000);
    s.on('timeout', () => { s.destroy(); reject(new Error(`CONNECT: zaman aşımı`)); });
    s.on('error', (e) => reject(new Error(`CONNECT: ${e.message}`)));
});

const popOpen = async (host, user, pass) => {
    let raw;
    try {
        raw = await connectTcp(host, 110);
    } catch (e) {
        throw new Error(`pop ${e.message}`);
    }
    const sock = new LineSocket(raw);
    try {
        const greet = await sock.readLine();
        if (!greet.startsWith('+OK')) throw new Error(`pop CONNECT: ${greet.trim()}`);
        sock.write(`USER ${user}\r\n`);
        const u = await sock.readLine();
        if (!u.startsWith('+OK')) throw new Error(`pop AUTH: ${u.trim()}`);
        sock.write(`PASS ${pass}\r\n`);
        const p = await sock.readLine();
        if (!p.startsWith('+OK')) throw new Error(`pop AUTH: ${p.trim()}`);
        return sock;
    } catch (e) {
        sock.destroy();
        throw e;
    }
};

const popCmd = async (sock, cmd, step = '') => {
    sock.write(`${cmd}\r\n`);
    const line = await sock.readLine();
    if (!line.startsWith('+OK')) throw new Error(`pop ${step || cmd.split(' ')[0]}: ${line.trim().slice(0, 200)}`);
    return line;
};

const popBody = async (sock) => {
    let out = '';
    while (true) {
        const line = await sock.readLine();
        if (line === '.\r\n' || line === '.\n') break;
        out += line.startsWith('.') ? line.slice(1) : line;
    }
    return out;
};

const popQuit = async (sock) => {
    try {
        sock.write('QUIT\r\n');
        await sock.readLine().catch(() => {});
    } finally {
        sock.destroy();
    }
};

const popIndex = async (sock) => {
    await popCmd(sock, 'UIDL');
    const uids = {};
    for (const l of (await popBody(sock)).split('\n')) {
        const m = /^(\d+)\s+(\S+)/.exec(l.trim());
        if (m) uids[Number(m[1])] = m[2];
    }
    await popCmd(sock, 'LIST');
    const sizes = {};
    for (const l of (await popBody(sock)).split('\n')) {
        const m = /^(\d+)\s+(\d+)/.exec(l.trim());
        if (m) sizes[Number(m[1])] = Number(m[2]);
    }
    const index = {};
    for (const [n, uid] of Object.entries(uids)) index[uid] = [Number(n), sizes[Number(n)] ?? 0];
    return index;
};

const smtpRead = async (sock) => {
    let lines = '';
    while (true) {
        const line = await sock.readLine();
        lines += line;
        if (line.length < 4 || line[3] === ' ') break;
    }
    return [Number(lines.slice(0, 3)), lines.trim()];
};

const smtpSend = async (host, port, user, pass, rcpts, data) => {
    let raw;
    try {
        if (port === 465) {
            raw = await new Promise((resolve, reject) => {
                const s = tlsConnect({ host, port, servername: host, rejectUnauthorized: false }, () => resolve(s));
                s.setTimeout(15_000);
                s.on('timeout', () => { s.destroy(); reject(new Error('CONNECT: zaman aşımı')); });
                s.on('error', (e) => reject(new Error(`CONNECT: ${e.message}`)));
            });
        } else {
            raw = await connectTcp(host, port);
        }
    } catch (e) {
        throw new Error(`smtp ${e.message}`);
    }
    let sock = new LineSocket(raw);
    const rejected = [];
    let step = 'CONNECT';
    const cmd = async (line, expect) => {
        if (line !== null) sock.write(`${line}\r\n`);
        const [code, reply] = await smtpRead(sock);
        if (!expect.includes(code)) throw new Error(`smtp ${step}: ${(reply || 'yanıt yok').slice(0, 200)}`);
        return reply;
    };
    try {
        await cmd(null, [220]);
        step = 'EHLO';
        let ehlo = await cmd('EHLO localhost', [250]);
        if (port !== 465 && /STARTTLS/i.test(ehlo)) {
            step = 'STARTTLS';
            await cmd('STARTTLS', [220]);
            raw = await new Promise((resolve, reject) => {
                const s = tlsConnect({ socket: sock.socket, servername: host, rejectUnauthorized: false }, () => resolve(s));
                s.on('error', (e) => reject(new Error(`smtp STARTTLS: ${e.message}`)));
            });
            sock = new LineSocket(raw);
            ehlo = await cmd('EHLO localhost', [250]);
        }
        step = 'AUTH';
        await cmd('AUTH LOGIN', [334]);
        await cmd(Buffer.from(user).toString('base64'), [334]);
        await cmd(Buffer.from(pass).toString('base64'), [235]);
        step = 'MAIL';
        await cmd(`MAIL FROM:<${user}>`, [250]);
        step = 'RCPT';
        let accepted = 0;
        for (const to of rcpts) {
            sock.write(`RCPT TO:<${to}>\r\n`);
            const [code, reply] = await smtpRead(sock);
            if (code === 250 || code === 251) accepted++;
            else rejected.push({ to, reply: reply.slice(0, 200) });
        }
        if (!accepted) throw new Error(`smtp RCPT: ${rejected[0]?.reply || 'alıcı reddedildi'}`);
        step = 'DATA';
        await cmd('DATA', [354]);
        let payload = String(data).replace(/\r?\n/g, '\r\n');
        if (!payload.endsWith('\r\n')) payload += '\r\n';
        payload = payload.replace(/^\./gm, '..');
        await cmd(`${payload}.`, [250]);
        try { sock.write('QUIT\r\n'); } catch { /* ignore */ }
    } finally {
        sock.destroy();
    }
    return rejected;
};

/** PHP webmail-gateway.php ile aynı işlem sözleşmesi. */
export const runMailOp = async (op, acc, extra = {}) => {
    const user = acc.email;
    const pass = acc.password;
    const domain = DOMAIN(user);
    const popHost = validHost(acc.pop_host) ? acc.pop_host : `mail.${domain}`;
    const smtpHost = validHost(acc.smtp_host) ? acc.smtp_host : `mail.${domain}`;
    const smtpPort = [25, 465, 587].includes(Number(acc.smtp_port)) ? Number(acc.smtp_port) : 587;

    if (op === 'check') {
        const s = await popOpen(popHost, user, pass);
        try {
            const stat = await popCmd(s, 'STAT');
            return { ok: true, count: Number(stat.trim().split(/\s+/)[1] || 0) };
        } finally {
            await popQuit(s);
        }
    }

    if (op === 'list') {
        const s = await popOpen(popHost, user, pass);
        try {
            const index = await popIndex(s);
            return {
                messages: Object.entries(index).map(([uid, [n, size]]) => ({ uid: String(uid), n, size })),
            };
        } finally {
            await popQuit(s);
        }
    }

    if (op === 'fetch') {
        const want = (extra.uids || []).filter((u) => typeof u === 'string');
        const budget = Math.min(Math.max(Number(extra.maxBytes) || 0, 1), 6 * 1024 * 1024);
        const s = await popOpen(popHost, user, pass);
        try {
            const index = await popIndex(s);
            const messages = [];
            const missing = [];
            let used = 0;
            const deadline = Date.now() + 22_000;
            for (const uid of want) {
                if (!index[uid]) { missing.push(uid); continue; }
                const [n, size] = index[uid];
                if (messages.length && (used + size > budget || Date.now() > deadline)) break;
                await popCmd(s, `RETR ${n}`);
                messages.push({ uid, raw: Buffer.from(await popBody(s), 'utf8').toString('base64') });
                used += size;
            }
            return { messages, missing };
        } finally {
            await popQuit(s);
        }
    }

    if (op === 'delete') {
        const want = (extra.uids || []).filter((u) => typeof u === 'string');
        const s = await popOpen(popHost, user, pass);
        try {
            const index = await popIndex(s);
            const deleted = [];
            for (const uid of want) {
                if (!index[uid]) continue;
                await popCmd(s, `DELE ${index[uid][0]}`);
                deleted.push(uid);
            }
            return { deleted };
        } finally {
            await popQuit(s);
        }
    }

    if (op === 'send') {
        const rcpts = (extra.rcpts || []).filter((t) => typeof t === 'string');
        if (!rcpts.length || rcpts.length > 100) throw new Error('recipient');
        const rawBuf = Buffer.from(String(extra.raw || ''), 'base64');
        if (!rawBuf.length) throw new Error('raw');
        const rejected = await smtpSend(smtpHost, smtpPort, user, pass, rcpts, rawBuf.toString('utf8'));
        return { sent: true, rejected };
    }

    throw new Error('op');
};
