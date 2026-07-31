import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { readEnv, requiredEnv } from './spotify-env.mjs';

const env = readEnv();
requiredEnv(env, ['PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

const snapshotPath = path.resolve('src/lib/data/spotifyAlbums.json');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
const supabase = createClient(
    env.PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

const { error } = await supabase
    .from('listens_snapshots')
    .upsert({
        id: 'current',
        snapshot,
        generated_at: snapshot.generatedAt || new Date().toISOString()
    });

if (error) {
    throw new Error(`Could not seed the listens snapshot: ${error.message}`);
}

console.log(`listens_snapshot_seeded=${snapshot.generatedAt || 'current'}`);
