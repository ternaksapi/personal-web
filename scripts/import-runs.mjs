import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { gunzipSync } from 'node:zlib';
import { parseActivitiesCsv, parseTrack, mergeRuns } from './lib/runs-import.mjs';
import { preparePublicSnapshot } from '../src/lib/server/run-snapshot.js';

const DEFAULT_OUTPUT = fileURLToPath(new URL('../src/lib/data/runs.json', import.meta.url));
const PUBLIC_OUTPUT = fileURLToPath(new URL('../src/lib/data/runs-public.json', import.meta.url));
const MAX_FILE_BYTES = 64 * 1024 * 1024;
const isTrack = filename => /\.(gpx|tcx)(\.gz)?$/i.test(filename);

async function readFile(filename) {
    if ((await fs.stat(filename)).size > MAX_FILE_BYTES) throw new Error(`File exceeds 64 MB: ${filename}`);
    const data = await fs.readFile(filename);
    return filename.toLowerCase().endsWith('.gz') ? gunzipSync(data, { maxOutputLength: MAX_FILE_BYTES }).toString('utf8') : data.toString('utf8');
}

async function trackFiles(directory) {
    const files = [];
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await trackFiles(filename));
        else if (entry.isFile() && isTrack(entry.name)) files.push(filename);
    }
    return files.sort();
}

async function importCsv(filename, options, warnings) {
    const parsed = parseActivitiesCsv(await readFile(filename), options);
    const root = await fs.realpath(path.dirname(filename));
    const runs = [];
    if (parsed.summaryDistances) warnings.push(`${parsed.summaryDistances} run(s) use rounded summary distances in ${options.distanceUnit}.`);
    for (const { run, filename: routeFile } of parsed.entries) {
        if (routeFile && isTrack(routeFile)) {
            try {
                const resolved = await fs.realpath(path.resolve(root, routeFile));
                const relative = path.relative(root, resolved);
                if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Route path leaves the export directory.');
                const track = parseTrack(await readFile(resolved), routeFile);
                if (track) run.route = track.route;
            } catch (error) {
                warnings.push(`Route for ${run.id} was not imported: ${error.message}`);
            }
        }
        runs.push(run);
    }
    return runs;
}

async function main() {
    const { values, positionals } = parseArgs({
        options: {
            apply: { type: 'boolean', default: false },
            replace: { type: 'boolean', default: false },
            output: { type: 'string', default: DEFAULT_OUTPUT },
            'distance-unit': { type: 'string', default: 'km' },
            help: { type: 'boolean', default: false }
        },
        allowPositionals: true
    });
    if (values.help || !positionals.length) {
        console.log('Usage: node scripts/import-runs.mjs "PATH_TO_EXPORT_FOLDER_OR_CSV_OR_GPX_OR_TCX" [--apply] [--replace] [--distance-unit km|mi|m]');
        console.log('Preview is the default. --apply saves the merged snapshot. --replace replaces the entire imported history.');
        if (!values.help) process.exitCode = 1;
        return;
    }
    const warnings = [];
    const incoming = [];
    for (const input of positionals) {
        const filename = path.resolve(input);
        const stat = await fs.stat(filename);
        if (stat.isDirectory()) {
            const csv = path.join(filename, 'activities.csv');
            const hasCsv = await fs.stat(csv).then(stat => stat.isFile(), error => {
                if (error.code !== 'ENOENT') throw error;
                return false;
            });
            if (hasCsv) incoming.push(...await importCsv(csv, { distanceUnit: values['distance-unit'] }, warnings));
            else {
                for (const file of await trackFiles(filename)) {
                    const run = parseTrack(await readFile(file), path.basename(file));
                    if (run) incoming.push(run);
                }
            }
        } else if (/\.csv$/i.test(filename)) {
            incoming.push(...await importCsv(filename, { distanceUnit: values['distance-unit'] }, warnings));
        } else if (isTrack(filename)) {
            const run = parseTrack(await readFile(filename), path.basename(filename));
            if (run) incoming.push(run);
        } else throw new Error('Extract ZIP archives first. Supported inputs: export folder, activities.csv, GPX, TCX, GPX.gz, TCX.gz.');
    }
    if (!incoming.length) throw new Error('No running activities found. The existing snapshot has not been changed.');
    const output = path.resolve(values.output);
    const existing = await fs.readFile(output, 'utf8').then(JSON.parse, error => {
        if (error.code !== 'ENOENT') throw error;
        return { version: 1, importedAt: null, runs: [] };
    });
    if (output === DEFAULT_OUTPUT && existing.importedAt === null && !values.replace) {
        const published = await fs.readFile(PUBLIC_OUTPUT, 'utf8').then(JSON.parse, error => {
            if (error.code !== 'ENOENT') throw error;
            return { runs: [] };
        });
        const ids = new Set(incoming.map(run => run.id));
        if (published.runs.some(run => !ids.has(run.id))) throw new Error('Raw runs cache is missing. Reimport the complete bulk export before adding individual runs, or use --replace to explicitly replace the history.');
    }
    if (existing.version !== 1 || !Array.isArray(existing.runs)) throw new Error('Unsupported runs snapshot format.');
    const runs = mergeRuns(values.replace ? [] : existing.runs, incoming);
    const snapshot = { version: 1, importedAt: new Date().toISOString(), runs };
    const publicSnapshot = output === DEFAULT_OUTPUT && values.apply ? preparePublicSnapshot(snapshot) : null;
    console.log(`${values.apply ? 'Import' : 'Preview'}: ${incoming.length} input run(s); ${runs.length} stored run(s); ${runs.filter(run => run.route).length} with routes.`);
    const years = [...new Set(runs.map(run => new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(run.startedAt))))].sort();
    for (const year of years) {
        const subset = runs.filter(run => new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(run.startedAt)) === year);
        console.log(`${year}: ${subset.length} runs, ${(subset.reduce((sum, run) => sum + run.distanceMeters, 0) / 1000).toFixed(1)} km`);
    }
    for (const warning of warnings) console.warn(warning);
    if (!values.apply) {
        console.log('No files changed. Add --apply to save. Imported names, dates, metrics and route coordinates will be public after website deployment.');
        return;
    }
    const temporary = `${output}.${process.pid}.tmp`;
    try {
        await fs.writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { flag: 'wx' });
        await fs.rename(temporary, output);
    } finally {
        await fs.rm(temporary, { force: true });
    }
    if (publicSnapshot) {
        const temporaryPublic = `${PUBLIC_OUTPUT}.${process.pid}.tmp`;
        try {
            await fs.writeFile(temporaryPublic, `${JSON.stringify(publicSnapshot)}\n`, { flag: 'wx' });
            await fs.rename(temporaryPublic, PUBLIC_OUTPUT);
        } finally { await fs.rm(temporaryPublic, { force: true }); }
        console.log('Prepared public snapshot with full imported routes, including endpoints. The raw cache stays Git-ignored.');
    }
    console.log(`Saved ${output}. Redeploy the website to update the live Runs page.`);
}

main().catch(error => {
    console.error(`Runs import failed: ${error.message}`);
    process.exitCode = 1;
});
