import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import polyline from '@mapbox/polyline';
import { parseActivitiesCsv, parseTrack, mergeRuns } from './lib/runs-import.mjs';
import { buildRunsPage } from '../src/lib/server/runs.js';
import { publicRoutes, preparePublicSnapshot } from '../src/lib/server/run-snapshot.js';
import { routeArtwork } from '../src/lib/runs/geometry.js';
import { filterRuns, summarize, timeline, movingPace, paceLabel, progressSeries } from '../src/lib/runs/atlas.js';
import { progressChart } from '../src/lib/runs/progress-chart.js';

const csv = 'Activity ID,Activity Date,Activity Name,Activity Type,Activity Description,Elapsed Time,Distance,Moving Time,Distance,Elevation Gain,Filename\r\n'
    + '123,"Jan 1, 2026, 12:00:00 AM","Morning, Run",Run,"Private\nnotes",2000,5.00,1800,5001.25,25,activities/123.gpx.gz\r\n'
    + '456,"Jan 2, 2026, 12:00:00 AM",Ride,Ride,,1000,20,900,20000,0,\r\n';
const gpx = '<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1"><metadata><time>2099-01-01T00:00:00Z</time>'
    + '<link href="https://www.strava.com/activities/123"/></metadata><trk><name>Morning &amp; Run</name><type>9</type><trkseg>'
    + '<trkpt lat="-6.2" lon="106.8"><ele>10</ele><time>2026-01-01T00:00:00Z</time></trkpt>'
    + '<trkpt lat="-6.21" lon="106.8"><ele>35</ele><time>2026-01-01T00:30:00Z</time></trkpt>'
    + '</trkseg></trk></gpx>';
const cli = fileURLToPath(new URL('./import-runs.mjs', import.meta.url));

test('CSV uses detailed metres and moving seconds, ignores other sports and private metadata', () => {
    const { entries, skipped } = parseActivitiesCsv(csv);
    assert.equal(skipped, 1);
    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0].run, {
        id: 'strava:123', name: 'Morning, Run', startedAt: '2026-01-01T00:00:00.000Z',
        distanceMeters: 5001.25, durationSeconds: 1800, elevationGainMeters: 25,
        timeBasis: 'moving', source: 'csv', route: null
    });
    assert(!JSON.stringify(entries[0].run).includes('Private'));
});

test('CSV summary units can be selected and missing distances fail instead of becoming zero', () => {
    const header = 'Activity ID,Activity Date,Activity Type,Distance,Elapsed Time\n';
    const result = parseActivitiesCsv(header + '1,2026-01-01T00:00:00Z,Run,3,1800', { distanceUnit: 'mi' });
    assert.equal(result.entries[0].run.distanceMeters, 3 * 1609.344);
    assert.equal(result.entries[0].run.timeBasis, 'elapsed');
    assert.throws(() => parseActivitiesCsv(header + '1,2026-01-01T00:00:00Z,Run,,1800'), /Invalid distanceMeters/);
    assert.throws(() => parseActivitiesCsv('Title,Date\nRun,2026-01-01'), /Missing Strava CSV column/);
});

test('GPX derives stats, decodes entities, and uses the recording timestamp', () => {
    const run = parseTrack(gpx);
    assert.equal(run.id, 'strava:123');
    assert.equal(run.name, 'Morning & Run');
    assert.equal(run.startedAt, '2026-01-01T00:00:00.000Z');
    assert.equal(run.durationSeconds, 1800);
    assert(run.distanceMeters > 1100 && run.distanceMeters < 1120);
    assert.equal(run.elevationGainMeters, 25);
    assert.deepEqual(polyline.decode(run.route), [[-6.2, 106.8], [-6.21, 106.8]]);
    assert.equal(parseTrack(gpx.replace('<type>9</type>', '<type>1</type>')), null);
});

test('GPS segment gaps do not create artificial distance or connecting map lines', () => {
    const second = '<trkseg><trkpt lat="10" lon="10"><time>2026-01-01T00:40:00Z</time></trkpt>'
        + '<trkpt lat="10.001" lon="10"><time>2026-01-01T00:41:00Z</time></trkpt></trkseg>';
    const run = parseTrack(gpx.replace('</trk>', second + '</trk>'));
    assert(run.distanceMeters > 1200 && run.distanceMeters < 1240);
    assert.equal(polyline.decode(run.route).length, 2);
});

test('TCX supports prefixed namespaces, lap totals and indoor runs without GPS', () => {
    const tcx = '<t:TrainingCenterDatabase xmlns:t="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">'
        + '<t:Activities><t:Activity Sport="Running"><t:Id>2026-02-01T00:00:00Z</t:Id>'
        + '<t:Lap><t:TotalTimeSeconds>1500</t:TotalTimeSeconds><t:DistanceMeters>5000</t:DistanceMeters></t:Lap>'
        + '</t:Activity></t:Activities></t:TrainingCenterDatabase>';
    const run = parseTrack(tcx, 'Indoor_Run.tcx');
    assert.equal(run.distanceMeters, 5000);
    assert.equal(run.durationSeconds, 1500);
    assert.equal(run.route, null);
    assert.equal(run.name, 'Indoor Run');
});

test('invalid XML and invalid coordinates do not enter the snapshot', () => {
    assert.throws(() => parseTrack('<gpx><trk></gpx>'), /Invalid XML/);
    assert.throws(() => parseTrack('<!DOCTYPE gpx><gpx/>'), /unsupported/);
    assert.throws(() => parseTrack(gpx.replace('lat="-6.2"', 'lat="100"')), /invalid GPS/);
});

test('reimporting updates metadata while preserving routes and deduplicating standalone exports', () => {
    const track = parseTrack(gpx.replace('<link href="https://www.strava.com/activities/123"/>', ''));
    const fromCsv = parseActivitiesCsv(csv).entries[0].run;
    const first = mergeRuns([track], [fromCsv]);
    assert.equal(first.length, 1);
    assert.equal(first[0].id, 'strava:123');
    assert.equal(first[0].distanceMeters, 5001.25);
    assert.equal(first[0].route, track.route);
    const again = mergeRuns(first, [track, { ...fromCsv, name: 'Renamed Run' }]);
    assert.equal(again.length, 1);
    assert.equal(again[0].name, 'Renamed Run');
    assert.equal(again[0].route, track.route);
    assert.equal(mergeRuns(first, [{ ...fromCsv, id: 'strava:999' }]).length, 2);
});

test('year totals and dates use Jakarta boundaries and keep exact distances for best equivalents', () => {
    const run = parseActivitiesCsv(csv).entries[0].run;
    const runs = [
        { ...run, id: 'a', startedAt: '2025-12-31T18:00:00.000Z' },
        { ...run, id: 'b', startedAt: '2025-12-31T16:00:00.000Z' }
    ];
    const page = buildRunsPage({ importedAt: '2026-01-02T00:00:00Z', runs }, new Date('2025-12-31T18:30:00Z'));
    assert.equal(page.stats.year, 2026);
    assert.equal(page.stats.totalRuns, 1);
    assert.equal(page.stats.totalDistance, '5.0');
    assert.equal(page.activities[0].date, 'January 1, 2026');
    assert.equal(page.stats.bestEfforts[1].time, '30:00');
});

test('CLI previews without writing, imports compressed routes, merges safely, and fails atomically', async t => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'runs-import-test-'));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    await fs.mkdir(path.join(directory, 'activities'));
    await fs.writeFile(path.join(directory, 'activities.csv'), csv);
    await fs.writeFile(path.join(directory, 'activities', '123.gpx.gz'), gzipSync(gpx));
    const output = path.join(directory, 'runs.json');
    const execute = (...args) => spawnSync(process.execPath, [cli, directory, '--output', output, ...args], {
        encoding: 'utf8', env: { ...process.env, TZ: 'America/Los_Angeles' }
    });
    const preview = execute();
    assert.equal(preview.status, 0, preview.stderr);
    await assert.rejects(fs.access(output), { code: 'ENOENT' });
    const applied = execute('--apply');
    assert.equal(applied.status, 0, applied.stderr);
    const initial = JSON.parse(await fs.readFile(output, 'utf8'));
    assert.equal(initial.runs.length, 1);
    assert.equal(initial.runs[0].startedAt, '2026-01-01T00:00:00.000Z');
    assert(initial.runs[0].route);
    assert.equal(initial.runs[0].distanceMeters, 5001.25);
    assert.equal(execute('--apply').status, 0);
    assert.equal(JSON.parse(await fs.readFile(output, 'utf8')).runs.length, 1);
    const beforeFailure = await fs.readFile(output, 'utf8');
    await fs.writeFile(path.join(directory, 'activities.csv'), 'not,a,strava,export');
    assert.notEqual(execute('--apply').status, 0);
    assert.equal(await fs.readFile(output, 'utf8'), beforeFailure);
});

test('public routes retain complete paths and endpoints even beside another run endpoint', () => {
    const loop = [[0, 0], [0, 0.01], [0, 0.02], [0.01, 0.02], [0.01, -0.01], [0, -0.01], [0, 0.01], [0, 0.02]];
    const other = [[0.01, 0.02], [0.02, 0.02], [0.02, 0.03]];
    const runs = [{ id: 'loop', route: polyline.encode(loop) }, { id: 'other', route: polyline.encode(other) }];
    const routes = publicRoutes(runs);
    assert.deepEqual(routes.get('loop'), [loop]);
    assert.deepEqual(routes.get('other'), [other]);
    const short = [[0, 0], [0, 0.001]];
    assert.deepEqual(publicRoutes([{ id: 'short', route: polyline.encode(short) }]).get('short'), [short]);
});

test('server data exposes full routes while retaining original distance and moving-time metrics', () => {
    const base = parseActivitiesCsv(csv).entries[0].run;
    const original = [[0, 0], [0, 0.01], [0.01, 0.01], [0.02, 0.01], [0.02, 0.02]];
    const run = { ...base, route: polyline.encode(original) };
    const page = buildRunsPage({ importedAt: '2026-01-02T00:00:00Z', runs: [run] }, new Date('2026-06-01'));
    assert.equal(page.atlas[0].year, 2026);
    assert.equal(page.atlas[0].month, 0);
    assert.equal(page.atlas[0].day, '2026-01-01');
    assert.equal(page.atlas[0].distanceMeters, base.distanceMeters);
    assert.equal(page.atlas[0].durationSeconds, base.durationSeconds);
    assert(!('route' in page.atlas[0]));
    assert.equal(page.activities[0].map, run.route);
    assert.deepEqual(page.atlas[0].segments, [original]);
});

test('atlas filters, timeline bins and summaries stay consistent including empty months', () => {
    const runs = [{ year: 2025, month: 11, distanceMeters: 5000, durationSeconds: 1500 }, { year: 2026, month: 0, distanceMeters: 10000, durationSeconds: 3600 }];
    assert.equal(filterRuns(runs, 'all').length, 2);
    assert.deepEqual(summarize(filterRuns(runs, 2026)), { count: 1, distance: 10, longest: 10, seconds: 3600 });
    assert.equal(filterRuns(runs, 2026, 1).length, 0);
    assert.equal(timeline(runs, 2026, [2025, 2026]).length, 12);
    assert.equal(timeline(runs, 2026, [2025, 2026])[1].count, 0);
    assert.deepEqual(timeline(runs, 'all', [2025, 2026]).map(bin => bin.distance), [5, 10]);
});

test('route artwork preserves gaps and tolerates empty routes', () => {
    const segments = [[[0, 0], [0, 0.01]], [[1, 1], [1, 1.01]]];
    assert.equal(routeArtwork(segments).split('M').length, 3);
    assert(!routeArtwork(segments).includes('NaN'));
    assert.equal(routeArtwork([]), '');
});

test('moving pace is distance-weighted and does not mix elapsed-only records into the pace trend', () => {
    const runs = [
        { year: 2026, month: 0, distanceMeters: 1000, durationSeconds: 600, timeBasis: 'moving' },
        { year: 2026, month: 0, distanceMeters: 9000, durationSeconds: 2700, timeBasis: 'moving' },
        { year: 2026, month: 2, distanceMeters: 3000, durationSeconds: 1500, timeBasis: 'elapsed' },
        { year: 2026, month: 2, distanceMeters: 0, durationSeconds: 500, timeBasis: 'moving' }
    ];
    assert.equal(movingPace(runs), 330);
    assert.equal(paceLabel(movingPace(runs)), '5:30');
    assert.equal(paceLabel(419.9), '7:00');
    const series = progressSeries(runs, 2026);
    assert.equal(series.length, 3);
    assert.equal(series[0].paceSeconds, 330);
    assert.equal(series[1].count, 0);
    assert.equal(series[1].distance, 0);
    assert.equal(series[1].paceSeconds, null);
    assert.equal(series[2].distance, 3);
    assert.equal(series[2].paceSeconds, null);
    assert.equal(series.at(-1).key, '2026-03');
    assert.deepEqual(progressSeries(runs, 2025), []);
});

test('progress charts retain empty months, break pace lines at missing values, and fit narrow widths', () => {
    const runs = [0, 2].map(month => ({ year: 2026, month, distanceMeters: 5000, durationSeconds: month ? 1500 : 2100, timeBasis: 'moving' }));
    const chart = progressChart(progressSeries(runs), 256);
    assert.equal(chart.rows.length, 3);
    assert.equal(chart.pacePath.split('M').length, 3);
    assert(!chart.pacePath.includes('NaN'));
    assert(chart.rows.every(row => row.x >= chart.left && row.x + row.width <= chart.right));
    assert(chart.ticks.length <= 3);
    assert.equal(chart.nearest(-100), 0);
    assert.equal(chart.nearest(9999), 2);
    assert.equal(chart.rows[1].height, 0);
    assert(chart.rows[0].paceY > chart.rows[2].paceY);
    assert(chart.paceTicks.every(tick => tick.y >= chart.paceTop && tick.y <= chart.paceBottom));
    assert.equal(progressChart([], 256).pacePath, '');
    const singleton = progressChart(progressSeries([runs[0]]), 256);
    assert(Number.isFinite(singleton.rows[0].paceY));
    assert(singleton.paceTicks.every(tick => Number.isFinite(tick.y)));
});

test('publishable snapshot retains full geometry, excludes private fields, and stays stable on server reads', () => {
    const base = parseActivitiesCsv(csv).entries[0].run;
    const original = [[0, 0], [0, 0.01], [0.01, 0.01], [0.02, 0.01], [0.02, 0.02]];
    const raw = { version: 1, importedAt: '2026-01-02T00:00:00Z', runs: [{ ...base, route: polyline.encode(original), privateNote: 'Never publish' }] };
    const prepared = preparePublicSnapshot(raw);
    assert(!('privateNote' in prepared.runs[0]));
    assert.equal(prepared.runs[0].segments.length, 1);
    assert.deepEqual(prepared.runs[0].segments[0][0], original[0]);
    assert.deepEqual(prepared.runs[0].segments[0].at(-1), original.at(-1));
    assert(prepared.runs[0].segments[0].length < original.length);
    assert.deepEqual(polyline.decode(prepared.runs[0].route), prepared.runs[0].segments[0]);
    const page = buildRunsPage(prepared, new Date('2026-06-01'));
    assert.deepEqual(page.atlas[0].segments, prepared.runs[0].segments);
    assert.deepEqual(buildRunsPage(prepared, new Date('2026-06-02')).atlas[0].segments, prepared.runs[0].segments);
    assert.equal(raw.runs[0].route, polyline.encode(original));
});

test('display simplification retains short routes and closed-loop endpoints', () => {
    const short = [[0, 0], [0, 0.00001]];
    const loop = [[0, 0], [0, 0.001], [0.001, 0.001], [0.001, 0], [0, 0]];
    const prepared = preparePublicSnapshot({ version: 1, importedAt: null, runs: [
        { id: 'short', route: polyline.encode(short) },
        { id: 'loop', route: polyline.encode(loop) }
    ] });
    assert.deepEqual(prepared.runs[0].segments, [short]);
    assert.deepEqual(prepared.runs[1].segments, [loop]);
});

test('missing, singleton, and invalid GPS geometry cannot enter public routes', () => {
    const runs = [
        { id: 'missing', route: null },
        { id: 'single', route: polyline.encode([[0, 0]]) },
        { id: 'invalid', route: polyline.encode([[100, 0], [100, 1]]) }
    ];
    assert([...publicRoutes(runs).values()].every(segments => segments.length === 0));
    const prepared = preparePublicSnapshot({ version: 1, importedAt: null, runs });
    assert(prepared.runs.every(run => run.route === null && run.segments.length === 0));
});
