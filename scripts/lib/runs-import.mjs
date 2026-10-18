import { parse } from 'csv-parse/sync';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import polyline from '@mapbox/polyline';
import length from '@turf/length';
import { calculateBestEfforts } from './run-efforts.mjs';

const array = value => value == null ? [] : Array.isArray(value) ? value : [value];
const RUN_TYPES = new Set(['run', 'running', 'trailrun', 'virtualrun', '9', '53']);

function number(value) {
    if (value == null || String(value).trim() === '') return null;
    const result = Number(String(value).replaceAll(',', ''));
    return Number.isFinite(result) ? result : null;
}

function seconds(value) {
    if (String(value).includes(':')) {
        const parts = String(value).split(':').map(Number);
        if (parts.length < 2 || parts.length > 3 || parts.some(part => !Number.isInteger(part) || part < 0)
            || parts.slice(1).some(part => part >= 60)) return null;
        return parts.reduce((total, part) => total * 60 + part, 0);
    }
    return number(value);
}

export function activityDate(value) {
    const raw = String(value || '').trim();
    if (!raw) throw new Error('Activity date is missing.');
    const zoned = /(?:Z|[+-]\d{2}:?\d{2}|UTC|GMT)$/i.test(raw);
    const date = new Date(zoned ? raw : `${raw}${raw.includes('T') ? 'Z' : ' UTC'}`);
    if (!Number.isFinite(date.getTime())) throw new Error(`Invalid activity date: ${raw}`);
    date.setUTCMilliseconds(0);
    return date.toISOString();
}

export function validateRun(run) {
    if (!run || typeof run.id !== 'string' || !run.id || typeof run.name !== 'string') {
        throw new Error('Invalid run identity.');
    }
    activityDate(run.startedAt);
    for (const key of ['distanceMeters', 'durationSeconds', 'elevationGainMeters']) {
        if (!Number.isFinite(run[key]) || run[key] < 0) throw new Error(`Invalid ${key} for ${run.name}.`);
    }
    if (run.durationSeconds <= 0) throw new Error(`Missing duration for ${run.name}.`);
    if (!['moving', 'elapsed'].includes(run.timeBasis) || !['csv', 'track'].includes(run.source)) {
        throw new Error(`Invalid timing/source for ${run.name}.`);
    }
    if (run.route !== null && typeof run.route !== 'string') throw new Error(`Invalid route for ${run.name}.`);
    return run;
}

export function parseActivitiesCsv(content, { distanceUnit = 'km' } = {}) {
    if (!['km', 'mi', 'm'].includes(distanceUnit)) throw new Error('Distance unit must be km, mi, or m.');
    const [headers, ...rows] = parse(content, {
        bom: true, skip_empty_lines: true, relax_column_count: true, max_record_size: 1024 * 1024
    });
    const indices = name => (headers || []).flatMap((header, index) => header.trim() === name ? [index] : []);
    for (const header of ['Activity ID', 'Activity Date', 'Activity Type', 'Distance']) {
        if (!indices(header).length) throw new Error(`Missing Strava CSV column: ${header}`);
    }
    const entries = [];
    let skipped = 0;
    let summaryDistances = 0;
    for (const [rowIndex, row] of rows.entries()) {
        const get = (name, last = false) => row[last ? indices(name).at(-1) : indices(name)[0]];
        if (!RUN_TYPES.has(String(get('Activity Type')).toLowerCase().replaceAll(' ', ''))) {
            skipped++;
            continue;
        }
        try {
            const id = String(get('Activity ID') || '').trim();
            if (!/^\d+$/.test(id)) throw new Error('Activity ID must be numeric.');
            // The detailed Distance column is metres; the first is a rounded display value.
            const detailedDistance = indices('Distance').length > 1 ? number(get('Distance', true)) : null;
            const summaryDistance = number(get('Distance'));
            const distanceMeters = detailedDistance ?? (summaryDistance === null ? null : summaryDistance * { km: 1000, mi: 1609.344, m: 1 }[distanceUnit]);
            if (detailedDistance === null) summaryDistances++;
            const moving = seconds(get('Moving Time'));
            const elapsed = seconds(get('Elapsed Time', true));
            const run = validateRun({
                id: `strava:${id}`,
                name: String(get('Activity Name') || 'Unnamed Run').trim(),
                startedAt: activityDate(get('Activity Date')),
                distanceMeters,
                durationSeconds: moving > 0 ? moving : elapsed,
                elevationGainMeters: number(get('Elevation Gain')) ?? 0,
                timeBasis: moving > 0 ? 'moving' : 'elapsed',
                source: 'csv',
                route: null
            });
            entries.push({ run, filename: String(get('Filename') || '').trim() });
        } catch (error) {
            throw new Error(`CSV record ${rowIndex + 2}: ${error.message}`);
        }
    }
    return { entries, skipped, summaryDistances };
}

function coordinate(lat, lon, time, elevation) {
    const latitude = number(lat);
    const longitude = number(lon);
    if (latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        throw new Error('Track contains an invalid GPS coordinate.');
    }
    return { lat: latitude, lon: longitude, time: time ? activityDate(time) : null, elevation: number(elevation) };
}

function segmentDistance(points) {
    return points.length < 2 ? 0 : length({
        type: 'LineString', coordinates: points.map(point => [point.lon, point.lat])
    }, { units: 'kilometers' }) * 1000;
}

export function parseTrack(content, filename = 'run.gpx') {
    if (/<!DOCTYPE|<!ENTITY/i.test(content)) throw new Error('XML document types and custom entities are unsupported.');
    const valid = XMLValidator.validate(content);
    if (valid !== true) throw new Error(`Invalid XML: ${valid.err.msg}`);
    const document = new XMLParser({
        ignoreAttributes: false, attributeNamePrefix: '@_', removeNSPrefix: true,
        parseTagValue: false, parseAttributeValue: false
    }).parse(content);
    let name;
    let startedAt;
    let durationSeconds;
    let distanceMeters;
    let segments;
    let links = [];

    if (document.gpx) {
        const tracks = array(document.gpx.trk);
        const type = String(tracks[0]?.type || '').toLowerCase().replaceAll(' ', '');
        if (type && !RUN_TYPES.has(type)) return null;
        name = tracks[0]?.name || document.gpx.metadata?.name;
        startedAt = document.gpx.metadata?.time;
        links = [...array(document.gpx.metadata?.link), ...tracks.flatMap(track => array(track.link))];
        segments = tracks.flatMap(track => array(track.trkseg).map(segment => array(segment.trkpt).map(point =>
            coordinate(point['@_lat'], point['@_lon'], point.time, point.ele)
        )));
    } else if (document.TrainingCenterDatabase) {
        const activities = array(document.TrainingCenterDatabase.Activities?.Activity);
        if (activities.length !== 1) throw new Error('TCX file must contain one activity.');
        const activity = activities[0];
        const sport = String(activity['@_Sport'] || '').toLowerCase();
        if (sport && !RUN_TYPES.has(sport)) return null;
        const laps = array(activity.Lap);
        startedAt = activity.Id || laps[0]?.['@_StartTime'];
        name = activity.Notes;
        durationSeconds = laps.reduce((sum, lap) => sum + (number(lap.TotalTimeSeconds) || 0), 0);
        distanceMeters = laps.reduce((sum, lap) => sum + (number(lap.DistanceMeters) || 0), 0);
        segments = laps.flatMap(lap => array(lap.Track).map(track => array(track.Trackpoint)
            .filter(point => point.Position)
            .map(point => coordinate(point.Position.LatitudeDegrees, point.Position.LongitudeDegrees, point.Time, point.AltitudeMeters))));
    } else {
        throw new Error('Expected a GPX or TCX activity.');
    }

    const points = segments.flat();
    const timed = points.filter(point => point.time);
    // GPS timestamps determine the recording start, not the file's creation time.
    startedAt = activityDate(timed[0]?.time || startedAt);
    if (!durationSeconds) {
        durationSeconds = timed.length > 1 ? (Date.parse(timed.at(-1).time) - Date.parse(timed[0].time)) / 1000 : 0;
    }
    const distances = segments.map(segmentDistance);
    distanceMeters ||= distances.reduce((sum, distance) => sum + distance, 0);
    let elevationGainMeters = 0;
    for (const segment of segments) {
        for (let index = 1; index < segment.length; index++) {
            const previous = segment[index - 1].elevation;
            const current = segment[index].elevation;
            if (previous !== null && current !== null) elevationGainMeters += Math.max(0, current - previous);
        }
    }
    // A single polyline cannot represent GPS gaps; show the longest continuous segment.
    const longestIndex = distances.reduce((best, distance, index) => distance > distances[best] ? index : best, 0);
    const routePoints = segments[longestIndex] || [];
    const step = Math.max(1, Math.ceil(routePoints.length / 1500));
    const route = routePoints.filter((_, index) => index % step === 0 || index === routePoints.length - 1);
    let stravaId;
    for (const link of links) {
        try {
            const url = new URL(link['@_href']);
            if (['www.strava.com', 'strava.com'].includes(url.hostname)) stravaId = url.pathname.match(/^\/activities\/(\d+)\/?$/)?.[1];
        } catch { /* A GPX link need not be a Strava activity URL. */ }
    }
    return validateRun({
        id: stravaId ? `strava:${stravaId}` : `file:${startedAt}`,
        name: String(name || filename.replace(/\.(gpx|tcx)(\.gz)?$/i, '').replaceAll('_', ' ')).trim(),
        startedAt,
        distanceMeters,
        durationSeconds,
        elevationGainMeters,
        timeBasis: 'elapsed',
        source: 'track',
        route: route.length > 1 ? polyline.encode(route.map(point => [point.lat, point.lon])) : null,
        bestEfforts: calculateBestEfforts(segments)
    });
}

export function mergeRuns(existing, incoming) {
    const merged = new Map(existing.map(run => [validateRun(run).id, run]));
    for (const run of incoming) {
        validateRun(run);
        let previous = merged.get(run.id);
        if (!previous) {
            previous = [...merged.values()].find(other => other.startedAt === run.startedAt
                && (other.id.startsWith('file:') || run.id.startsWith('file:')));
        }
        if (!previous) {
            merged.set(run.id, run);
            continue;
        }
        merged.delete(previous.id);
        const preferred = previous.source === 'csv' && run.source === 'track' ? previous : run;
        const id = run.id.startsWith('strava:') ? run.id : previous.id;
        merged.set(id, {
            ...preferred, id, route: run.route || previous.route,
            bestEfforts: run.bestEfforts?.length ? run.bestEfforts : previous.bestEfforts || []
        });
    }
    return [...merged.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt) || a.id.localeCompare(b.id));
}
