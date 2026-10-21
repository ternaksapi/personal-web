import test from 'node:test';
import assert from 'node:assert/strict';
import { canvasGrid, createRipple, hasWaveHit, idleWaveDelay, nextGlyphIndex, oceanSample, rippleFrame } from './ascii-ripple.js';

test('idle waves use varied delays between four and nine seconds', () => {
    assert.equal(idleWaveDelay(() => 0), 4000);
    assert.equal(idleWaveDelay(() => 0.5), 6500);
    assert.equal(idleWaveDelay(() => 0.9999), 8999);
});

test('wave hits are detected only when ripple energy crosses its threshold', () => {
    assert.equal(hasWaveHit(0.2), true);
    assert.equal(hasWaveHit(0.15), false);
    assert.equal(hasWaveHit(0.3, 0.35), false);
    assert.equal(hasWaveHit(0.05, 0.05), true);
});

test('scrambling chooses a different valid glyph index', () => {
    assert.equal(nextGlyphIndex(0, 5, () => 0), 1);
    assert.equal(nextGlyphIndex(2, 5, () => 0), 0);
    assert.equal(nextGlyphIndex(4, 5, () => 0.9999), 3);
    assert.equal(nextGlyphIndex(2, 1, () => 0.5), 0);
});

test('the character grid uses native high-DPI pixels and covers partial edge tiles', () => {
    for (const ratio of [1, 1.25, 2, 3]) {
        const grid = canvasGrid(393, 853, ratio);
        assert.equal(grid.ratio, ratio);
        assert.equal(grid.pixelWidth, Math.ceil(393 * ratio));
        assert.equal(grid.pixelHeight, Math.ceil(853 * ratio));
        assert(grid.columns * grid.columnWidth >= 393);
        assert(grid.rows * grid.rowHeight >= 853);
        assert.equal(grid.columnWidth * ratio, grid.tileWidth);
        assert.equal(grid.rowHeight * ratio, grid.tileHeight);
    }
});

test('ripples retain strength at every viewport corner instead of expiring after a fixed duration', () => {
    for (const [width, height] of [[390, 844], [1440, 1080], [3840, 2160]]) {
        for (const kind of ['impact', 'trail', 'idle']) {
            const wave = createRipple(25, height / 2, width, height, 500, 1, kind);
            for (const [x, y] of [[0, 0], [width, 0], [0, height], [width, height]]) {
                const arrival = 500 + Math.hypot(x - wave.x, y - wave.y) / wave.speed * 1000;
                const frame = rippleFrame(wave, arrival);
                assert(frame.active);
                assert.equal(frame.amplitude, 1);
            }
            const afterExit = 500 + (wave.maxRadius + wave.band * 5) / wave.speed * 1000;
            assert.equal(rippleFrame(wave, afterExit).active, false);
            assert.equal(rippleFrame(wave, afterExit).amplitude, 0);
        }
    }
});

test('ocean swells move without pointer input and remain finite at all screen edges', () => {
    let changed = 0, raised = 0, quiet = 0;
    for (let y = 0; y <= 1080; y += 60) {
        for (let x = 0; x <= 1440; x += 60) {
            const a = oceanSample(x, y, 0, 1440);
            const b = oceanSample(x, y, 1, 1440);
            assert(Number.isFinite(a.energy) && Number.isFinite(a.crest));
            assert(a.energy >= 0 && a.energy <= 1 && a.crest >= 0 && a.crest <= 1);
            if (Math.abs(a.energy - b.energy) > 0.03) changed++;
            if (a.crest > 0.6) raised++;
            if (a.crest < 0.1) quiet++;
        }
    }
    assert(changed > 100);
    assert(raised > 10);
    assert(quiet > raised);
});
