import length from '@turf/length';
import { EFFORT_DISTANCES } from '../../src/lib/runs/best-efforts.js';

function interpolate(a, b, distance) {
    return a.time + (b.time - a.time) * (distance - a.distance) / (b.distance - a.distance);
}

export function fastestWindow(samples, meters) {
    if (samples.length < 2 || meters <= 0 || samples.at(-1).distance < meters) return null;
    let best = Infinity;
    let end = 1;
    // A minimum can occur when either boundary touches a GPS sample, not only the start.
    for (const sample of samples) {
        const target = sample.distance + meters;
        if (target > samples.at(-1).distance) break;
        while (samples[end].distance < target) end++;
        best = Math.min(best, interpolate(samples[end - 1], samples[end], target) - sample.time);
    }
    let start = 0;
    for (const sample of samples) {
        const target = sample.distance - meters;
        if (target < 0) continue;
        while (samples[start + 1].distance <= target) start++;
        best = Math.min(best, sample.time - interpolate(samples[start], samples[start + 1], target));
    }
    return Number.isFinite(best) && best > 0 ? best : null;
}

export function calculateBestEfforts(segments) {
    const best = new Map();
    for (const segment of segments) {
        let samples = [];
        let previous = null;
        const flush = () => {
            for (const { meters } of EFFORT_DISTANCES) {
                const seconds = fastestWindow(samples, meters);
                if (seconds !== null && (!best.has(meters) || seconds < best.get(meters))) best.set(meters, seconds);
            }
            samples = [];
            previous = null;
        };
        for (const point of segment) {
            const time = point.time ? Date.parse(point.time) / 1000 : NaN;
            if (!Number.isFinite(time)) { flush(); continue; }
            if (previous && time <= previous.time) flush();
            const distance = previous ? samples.at(-1).distance + length({
                type: 'LineString', coordinates: [[previous.point.lon, previous.point.lat], [point.lon, point.lat]]
            }, { units: 'meters' }) : 0;
            samples.push({ distance, time });
            previous = { point, time };
        }
        flush();
    }
    return EFFORT_DISTANCES.flatMap(({ meters }) => best.has(meters) ? [{ meters, seconds: Math.max(1, Math.round(best.get(meters))) }] : []);
}
