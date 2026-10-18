export function routeArtwork(segments, width = 240, height = 120) {
    const points = segments.flat();
    if (points.length < 2) return '';
    const bounds = points.reduce((b, [lat, lng]) => [Math.min(b[0], lat), Math.max(b[1], lat), Math.min(b[2], lng), Math.max(b[3], lng)], [90, -90, 180, -180]);
    const correction = Math.cos((bounds[0] + bounds[1]) / 2 * Math.PI / 180);
    const dx = Math.max((bounds[3] - bounds[2]) * correction, 0.00001);
    const dy = Math.max(bounds[1] - bounds[0], 0.00001);
    const scale = Math.min((width - 24) / dx, (height - 24) / dy);
    const x = lng => (width - dx * scale) / 2 + (lng - bounds[2]) * correction * scale;
    const y = lat => (height - dy * scale) / 2 + (bounds[1] - lat) * scale;
    return segments.map(segment => segment.map(([lat, lng], index) => `${index ? 'L' : 'M'}${x(lng).toFixed(2)},${y(lat).toFixed(2)}`).join(' ')).join(' ');
}
