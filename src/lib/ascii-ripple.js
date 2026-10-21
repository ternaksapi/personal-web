export function idleWaveDelay(random = Math.random) {
    return 4000 + Math.floor(random() * 5000);
}

export function hasWaveHit(rippleEnergy, threshold = 0.16) {
    return rippleEnergy >= threshold;
}

export function nextGlyphIndex(currentIndex, glyphCount, random = Math.random) {
    if (glyphCount <= 1) return 0;
    const candidate = Math.floor(random() * (glyphCount - 1));
    return candidate >= currentIndex ? candidate + 1 : candidate;
}

const clamp = value => Math.max(0, Math.min(1, value));
const smoothstep = (from, to, value) => {
    const t = clamp((value - from) / (to - from));
    return t * t * (3 - 2 * t);
};

export function canvasGrid(width, height, devicePixelRatio = 1) {
    const ratio = Math.max(1, Math.min(4, devicePixelRatio || 1));
    const tileWidth = Math.round(7 * ratio);
    const tileHeight = Math.round(12 * ratio);
    const columnWidth = tileWidth / ratio;
    const rowHeight = tileHeight / ratio;
    return {
        ratio, tileWidth, tileHeight, columnWidth, rowHeight,
        pixelWidth: Math.ceil(width * ratio), pixelHeight: Math.ceil(height * ratio),
        columns: Math.ceil(width / columnWidth), rows: Math.ceil(height / rowHeight)
    };
}

export function createRipple(x, y, width, height, started, strength = 1.4, kind = 'impact') {
    const maxRadius = Math.max(...[[0, 0], [width, 0], [0, height], [width, height]].map(([cx, cy]) => Math.hypot(cx - x, cy - y)));
    return { x, y, started, strength, kind, maxRadius, speed: kind === 'impact' ? 240 : 150, band: kind === 'idle' ? 58 : 36 };
}

export function rippleFrame(ripple, elapsed) {
    const radius = Math.max(0, (elapsed - ripple.started) / 1000) * ripple.speed;
    return {
        ...ripple, radius,
        // Keep the crest alive until it has passed the farthest visible corner.
        amplitude: ripple.strength * (1 - smoothstep(ripple.maxRadius + ripple.band, ripple.maxRadius + ripple.band * 4, radius)),
        active: radius < ripple.maxRadius + ripple.band * 4
    };
}

export function oceanSample(x, y, seconds, width) {
    const wavelength = Math.max(260, Math.min(760, width * 0.6));
    const tau = Math.PI * 2;
    const cross = (-x * 0.38 + y * 0.92) / wavelength;
    const primary = (x * 0.92 + y * 0.38 - seconds * 62) / wavelength * tau
        + Math.sin(cross * tau * 0.8 + seconds * 0.12) * 0.6;
    const secondary = (x * 0.22 - y * 0.98 - seconds * 34) / (wavelength * 0.74) * tau + 1.4;
    const detail = (x * 0.64 + y * 0.77 - seconds * 42) / (wavelength * 0.34) * tau;
    const height = Math.sin(primary) * 0.58 + Math.sin(secondary) * 0.27 + Math.sin(detail) * 0.15;
    return { energy: smoothstep(-0.65, 0.8, height), crest: smoothstep(0.22, 0.86, height) };
}
