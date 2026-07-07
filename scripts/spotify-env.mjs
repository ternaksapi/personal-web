import fs from 'node:fs';
import path from 'node:path';

export const envPath = path.resolve('.env');

export function readEnv() {
    if (!fs.existsSync(envPath)) {
        return {};
    }

    const env = {};
    const raw = fs.readFileSync(envPath, 'utf8');

    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) continue;

        const index = trimmed.indexOf('=');
        if (index === -1) continue;

        const key = trimmed.slice(0, index);
        let value = trimmed.slice(index + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        env[key] = value;
    }

    return env;
}

export function upsertEnvValue(key, value) {
    const raw = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const lines = raw.split(/\r?\n/);
    let found = false;

    const next = lines.map((line) => {
        if (line.startsWith(`${key}=`)) {
            found = true;
            return `${key}=${value}`;
        }

        return line;
    });

    if (!found) {
        if (next.length > 0 && next[next.length - 1] !== '') {
            next.push('');
        }

        next.push(`${key}=${value}`);
    }

    fs.writeFileSync(envPath, next.join('\n'));
}

export function requiredEnv(env, keys) {
    const missing = keys.filter((key) => !env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required env values: ${missing.join(', ')}`);
    }
}
