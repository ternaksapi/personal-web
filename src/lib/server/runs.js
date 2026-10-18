import polyline from '@mapbox/polyline';
import { publicRoutes } from './run-snapshot.js';

const TIME_ZONE = 'Asia/Jakarta';
const atlasCache = new WeakMap();

function publicAtlas(snapshot) {
    if (atlasCache.has(snapshot)) return atlasCache.get(snapshot);
    const routes = publicRoutes(snapshot.runs);
    const atlas = [...snapshot.runs].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map(run => {
        const parts = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TIME_ZONE }).formatToParts(new Date(run.startedAt));
        const { month, day: date, year } = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
        return {
            id: run.id, name: run.name, year, month: month - 1,
            day: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
            date: dateLabel(run.startedAt, { year: 'numeric', month: 'long', day: 'numeric' }),
            shortDate: dateLabel(run.startedAt, { year: 'numeric', month: 'short', day: 'numeric' }),
            distanceMeters: run.distanceMeters, durationSeconds: run.durationSeconds,
            distance: (run.distanceMeters / 1000).toFixed(1), time: formatTime(run.durationSeconds),
            timeBasis: run.timeBasis, pace: formatPace(run.durationSeconds, run.distanceMeters),
            elevation: Math.round(run.elevationGainMeters), segments: routes.get(run.id) || []
        };
    });
    atlasCache.set(snapshot, atlas);
    return atlas;
}

export function runYear(date = new Date()) {
    return Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: TIME_ZONE }).format(date));
}

export function formatTime(seconds) {
    const total = Math.max(0, Math.round(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const secs = String(total % 60).padStart(2, '0');
    return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}` : `${minutes}:${secs}`;
}

export function formatPace(seconds, meters) {
    if (meters <= 0) return '0:00';
    const pace = Math.floor(seconds / (meters / 1000));
    return `${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, '0')}`;
}

function dateLabel(startedAt, options) {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone: TIME_ZONE }).format(new Date(startedAt));
}

export function buildRunsPage(snapshot, now = new Date()) {
    const year = runYear(now);
    const atlas = publicAtlas(snapshot);
    const publicById = new Map(atlas.map(run => [run.id, run]));
    const runs = snapshot.runs
        .filter(run => runYear(new Date(run.startedAt)) === year)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt) || a.id.localeCompare(b.id));
    const totalDistance = runs.reduce((sum, run) => sum + run.distanceMeters, 0);
    const longestRun = runs.reduce((longest, run) => Math.max(longest, run.distanceMeters), 0);
    const bestEfforts = [1000, 5000, 10000, 15000].map(meters => {
        const eligible = runs.filter(run => run.distanceMeters >= meters * 0.995 && run.durationSeconds > 0);
        const best = eligible.sort((a, b) => a.durationSeconds / a.distanceMeters - b.durationSeconds / b.distanceMeters)[0];
        const seconds = best ? Math.round(best.durationSeconds * meters / best.distanceMeters) : null;
        return {
            label: `${meters / 1000}K`, meters, seconds,
            time: best ? formatTime(seconds) : '-',
            pace: best ? formatPace(seconds, meters) : '',
            activityName: best?.name || '',
            activityDate: best ? dateLabel(best.startedAt, { month: 'short', day: 'numeric' }) : ''
        };
    });

    return {
        importedAt: snapshot.importedAt,
        imported: snapshot.importedAt !== null,
        atlas,
        years: [...new Set(atlas.map(run => run.year))].sort((a, b) => a - b),
        activities: runs.map(run => ({
            id: run.id,
            name: run.name,
            date: dateLabel(run.startedAt, { year: 'numeric', month: 'long', day: 'numeric' }),
            distance: (run.distanceMeters / 1000).toFixed(1),
            time: formatTime(run.durationSeconds),
            timeBasis: run.timeBasis,
            pace: formatPace(run.durationSeconds, run.distanceMeters),
            elevation: Math.round(run.elevationGainMeters),
            map: publicById.get(run.id)?.segments.length ? polyline.encode(publicById.get(run.id).segments.reduce((longest, segment) => segment.length > longest.length ? segment : longest, [])) : null,
            startLat: null,
            startLng: null
        })),
        stats: {
            totalRuns: runs.length,
            totalDistance: (totalDistance / 1000).toFixed(1),
            longestRun: (longestRun / 1000).toFixed(1),
            year,
            bestEfforts: runs.length ? bestEfforts : []
        }
    };
}
