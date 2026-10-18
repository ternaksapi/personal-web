import polyline from '@mapbox/polyline';
import simplify from '@turf/simplify';
import { validEfforts } from '../runs/best-efforts.js';

export function publicRoutes(runs) {
    return new Map(runs.map(run => {
        try {
            const points = polyline.decode(run.route || '');
            if (points.length < 2 || points.some(([lat, lng]) => !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)) return [run.id, []];
            return [run.id, [points]];
        } catch { return [run.id, []]; }
    }));
}

export function preparePublicSnapshot(snapshot) {
    const routes = publicRoutes(snapshot.runs);
    return {
        version: snapshot.version, importedAt: snapshot.importedAt,
        runs: snapshot.runs.map(run => {
            // Reduce redundant GPS samples for display without clipping either endpoint.
            const segments = (routes.get(run.id) || []).map(points => simplify({
                type: 'LineString', coordinates: points.map(([lat, lng]) => [lng, lat])
            }, { tolerance: 0.00002, highQuality: true }).coordinates.map(([lng, lat]) => [lat, lng]));
            return {
                id: run.id, name: run.name, startedAt: run.startedAt,
                distanceMeters: run.distanceMeters, durationSeconds: run.durationSeconds,
                elevationGainMeters: run.elevationGainMeters, timeBasis: run.timeBasis,
                source: run.source, route: segments.length ? polyline.encode(segments[0]) : null, segments,
                bestEfforts: validEfforts(run.bestEfforts)
            };
        })
    };
}
