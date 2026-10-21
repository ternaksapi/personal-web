<script>
    import { onMount, tick } from 'svelte';
    import { canvasGrid, createRipple, hasWaveHit, idleWaveDelay, nextGlyphIndex, oceanSample, rippleFrame } from './ascii-ripple.js';

    export let contentElement;

    let canvas;
    let motionControl;
    let isAnimating = false;
    let updateAnimation = () => {};

    onMount(() => {
        const context = canvas.getContext('2d');
        if (!context) return;
        const atlas = document.createElement('canvas');
        const atlasContext = atlas.getContext('2d');
        const glyphLayer = document.createElement('canvas');
        const glyphContext = glyphLayer.getContext('2d');
        const crestLayer = document.createElement('canvas');
        const crestContext = crestLayer.getContext('2d');
        const baseMask = document.createElement('canvas');
        const baseMaskContext = baseMask.getContext('2d');
        const crestMask = document.createElement('canvas');
        const crestMaskContext = crestMask.getContext('2d');
        if (!atlasContext || !glyphContext || !crestContext || !baseMaskContext || !crestMaskContext) return;
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const glyphs = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const fieldStep = 24;
        const interval = 1000 / 30;
        let width = 0, height = 0, grid;
        let cells = [];
        let fieldColumns = 0, fieldRows = 0;
        let energyField, crestField, hitField;
        let baseOpacity, crestOpacity;
        let ripples = [];
        let frame, previousTimestamp, lastDraw = 0;
        let elapsed = 0, lastTrail = -Infinity, lastGlyphScramble = -Infinity;
        let lastPointerActivity = -Infinity, nextIdleWaveAt = idleWaveDelay();
        let pointer = { x: -1000, y: -1000 };
        let dark = document.documentElement.dataset.theme !== 'light';
        let destroyed = false;

        function prepareAtlas() {
            atlas.width = grid.tileWidth * glyphs.length;
            atlas.height = grid.tileHeight;
            atlasContext.font = `${9.5 * grid.ratio}px ui-monospace, SFMono-Regular, Consolas, monospace`;
            atlasContext.textAlign = 'center';
            atlasContext.textBaseline = 'middle';
            atlasContext.fillStyle = '#fff';
            for (let glyph = 0; glyph < glyphs.length; glyph++) {
                atlasContext.fillText(glyphs[glyph], (glyph + 0.5) * grid.tileWidth, grid.tileHeight * 0.5);
            }
        }

        function paintGlyph(cell) {
            glyphContext.clearRect(cell.left, cell.top, grid.columnWidth, grid.rowHeight);
            glyphContext.drawImage(atlas, cell.glyph * grid.tileWidth, 0, grid.tileWidth, grid.tileHeight,
                cell.left, cell.top, grid.columnWidth, grid.rowHeight);
        }

        function measureContent() {
            if (!grid) return;
            const bounds = [];
            if (contentElement) {
                const walker = document.createTreeWalker(contentElement, NodeFilter.SHOW_TEXT);
                const range = document.createRange();
                let node;
                while ((node = walker.nextNode())) {
                    if (!node.textContent.trim()) continue;
                    range.selectNodeContents(node);
                    bounds.push(...range.getClientRects());
                }
                for (const element of contentElement.querySelectorAll('.polaroid-wrapper, img, button')) bounds.push(element.getBoundingClientRect());
            }
            if (motionControl) bounds.push(motionControl.getBoundingClientRect());
            const fade = width < 640 ? 16 : 24;
            for (const cell of cells) cell.visibility = 1;
            for (const rect of bounds) {
                const firstColumn = Math.max(0, Math.floor((rect.left - 8 - fade) / grid.columnWidth));
                const lastColumn = Math.min(grid.columns - 1, Math.ceil((rect.right + 8 + fade) / grid.columnWidth));
                const firstRow = Math.max(0, Math.floor((rect.top - 8 - fade) / grid.rowHeight));
                const lastRow = Math.min(grid.rows - 1, Math.ceil((rect.bottom + 8 + fade) / grid.rowHeight));
                for (let row = firstRow; row <= lastRow; row++) {
                    for (let column = firstColumn; column <= lastColumn; column++) {
                        const cell = cells[row * grid.columns + column];
                        const dx = Math.max(rect.left - 8 - cell.x, 0, cell.x - rect.right - 8);
                        const dy = Math.max(rect.top - 8 - cell.y, 0, cell.y - rect.bottom - 8);
                        cell.visibility = Math.min(cell.visibility, (dx * dx + dy * dy) / (fade * fade));
                    }
                }
            }
            if (!isAnimating) draw();
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            grid = canvasGrid(width, height, window.devicePixelRatio);
            canvas.width = grid.pixelWidth;
            canvas.height = grid.pixelHeight;
            context.setTransform(grid.ratio, 0, 0, grid.ratio, 0, 0);
            for (const [layer, ctx] of [[glyphLayer, glyphContext], [crestLayer, crestContext]]) {
                layer.width = grid.pixelWidth;
                layer.height = grid.pixelHeight;
                ctx.setTransform(grid.ratio, 0, 0, grid.ratio, 0, 0);
                ctx.imageSmoothingEnabled = false;
            }
            for (const mask of [baseMask, crestMask]) { mask.width = grid.columns; mask.height = grid.rows; }
            baseOpacity = baseMaskContext.createImageData(grid.columns, grid.rows);
            crestOpacity = crestMaskContext.createImageData(grid.columns, grid.rows);
            fieldColumns = Math.ceil((width + grid.columnWidth) / fieldStep) + 1;
            fieldRows = Math.ceil((height + grid.rowHeight) / fieldStep) + 1;
            energyField = new Float32Array(fieldColumns * fieldRows);
            crestField = new Float32Array(fieldColumns * fieldRows);
            hitField = new Float32Array(fieldColumns * fieldRows);
            cells = [];
            for (let row = 0; row < grid.rows; row++) {
                for (let column = 0; column < grid.columns; column++) {
                    const x = (column + 0.5) * grid.columnWidth;
                    const y = (row + 0.5) * grid.rowHeight;
                    const glyph = Math.floor(Math.random() * glyphs.length);
                    cells.push({ x, y, left: column * grid.columnWidth, top: row * grid.rowHeight,
                        fieldIndex: Math.floor(y / fieldStep) * fieldColumns + Math.floor(x / fieldStep),
                        mixX: x / fieldStep % 1, mixY: y / fieldStep % 1,
                        baseGlyph: glyph, glyph, scrambleUntil: 0, visibility: 1 });
                }
            }
            ripples = ripples.map(wave => createRipple(wave.x, wave.y, width, height, wave.started, wave.strength, wave.kind));
            prepareAtlas();
            for (const cell of cells) paintGlyph(cell);
            measureContent();
            draw();
        }

        function readTheme() {
            dark = document.documentElement.dataset.theme !== 'light';
            draw();
        }

        function interpolate(field, cell) {
            const index = cell.fieldIndex;
            const bottom = index + fieldColumns;
            const topValue = field[index] + (field[index + 1] - field[index]) * cell.mixX;
            const bottomValue = field[bottom] + (field[bottom + 1] - field[bottom]) * cell.mixX;
            return topValue + (bottomValue - topValue) * cell.mixY;
        }

        function draw() {
            if (!grid) return;
            const surfaceWidth = grid.pixelWidth / grid.ratio;
            const surfaceHeight = grid.pixelHeight / grid.ratio;
            context.clearRect(0, 0, surfaceWidth, surfaceHeight);
            const waves = ripples.map(wave => rippleFrame(wave, elapsed));
            const pointerFade = isAnimating ? Math.max(0, 1 - (elapsed - lastPointerActivity) / 2400) : 0;
            for (let row = 0; row < fieldRows; row++) {
                for (let column = 0; column < fieldColumns; column++) {
                    const x = column * fieldStep, y = row * fieldStep;
                    const sea = oceanSample(x, y, elapsed / 1000, width);
                    let hit = 0;
                    for (const wave of waves) {
                        const offset = Math.hypot(x - wave.x, y - wave.y) - wave.radius;
                        const front = Math.exp(-Math.pow(offset / wave.band, 2));
                        const wake = Math.exp(-Math.pow((offset + 80) / (wave.band * 0.8), 2)) * 0.28;
                        hit += (front + wake) * wave.amplitude;
                    }
                    const pointerEnergy = Math.pow(Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / 130), 2) * pointerFade;
                    const index = row * fieldColumns + column;
                    energyField[index] = Math.min(1, sea.energy + hit * 0.35);
                    crestField[index] = Math.min(1, sea.crest + hit * 0.75 + pointerEnergy * 0.7);
                    hitField[index] = Math.max(sea.crest * 0.48, hit, pointerEnergy);
                }
            }

            const scramble = isAnimating && elapsed - lastGlyphScramble > 180;
            if (scramble) lastGlyphScramble = elapsed;
            for (let index = 0; index < cells.length; index++) {
                const cell = cells[index];
                const previousGlyph = cell.glyph;
                if (cell.scrambleUntil <= elapsed) cell.glyph = cell.baseGlyph;
                if (cell.visibility < 0.01) {
                    baseOpacity.data[index * 4 + 3] = 0;
                    crestOpacity.data[index * 4 + 3] = 0;
                    if (cell.glyph !== previousGlyph) paintGlyph(cell);
                    continue;
                }
                const energy = interpolate(energyField, cell);
                const crest = interpolate(crestField, cell);
                if (scramble && cell.scrambleUntil <= elapsed && hasWaveHit(interpolate(hitField, cell))) {
                    cell.glyph = nextGlyphIndex(cell.baseGlyph, glyphs.length);
                    cell.scrambleUntil = elapsed + 500 + crest * 300;
                }
                if (cell.glyph !== previousGlyph) paintGlyph(cell);
                baseOpacity.data[index * 4 + 3] = Math.round((0.018 + energy * 0.12) * cell.visibility * 255);
                crestOpacity.data[index * 4 + 3] = Math.round(crest * (dark ? 0.5 : 0.46) * cell.visibility * 255);
            }
            baseMaskContext.putImageData(baseOpacity, 0, 0);
            crestMaskContext.putImageData(crestOpacity, 0, 0);
            // Only opacity is interpolated; glyph shapes stay at their native pixel resolution.
            composite(context, baseMask, dark ? '#849194' : '#778082');
            crestContext.clearRect(0, 0, surfaceWidth, surfaceHeight);
            composite(crestContext, crestMask, dark ? '#9aaaca' : '#737fae');
            context.drawImage(crestLayer, 0, 0, surfaceWidth, surfaceHeight);
        }

        function composite(ctx, mask, color) {
            const surfaceWidth = grid.pixelWidth / grid.ratio;
            const surfaceHeight = grid.pixelHeight / grid.ratio;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(glyphLayer, 0, 0, surfaceWidth, surfaceHeight);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, surfaceWidth, surfaceHeight);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(mask, 0, 0, grid.columns * grid.columnWidth, grid.rows * grid.rowHeight);
            ctx.globalCompositeOperation = 'source-over';
        }

        function addRipple(x, y, strength = 1.4, kind = 'impact') {
            if (!isAnimating) return;
            const limit = kind === 'impact' ? 4 : 2;
            if (ripples.filter(wave => wave.kind === kind).length >= limit) return;
            ripples.push(createRipple(x, y, width, height, elapsed, strength, kind));
        }

        function animate(timestamp) {
            if (!isAnimating || document.hidden) { frame = undefined; return; }
            if (previousTimestamp !== undefined) elapsed += timestamp - previousTimestamp;
            previousTimestamp = timestamp;
            if (timestamp - lastDraw >= interval) {
                lastDraw = timestamp - (timestamp - lastDraw) % interval;
                ripples = ripples.filter(wave => rippleFrame(wave, elapsed).active);
                if (elapsed - lastPointerActivity > 1200 && elapsed >= nextIdleWaveAt) {
                    const fromLeft = Math.random() < 0.5;
                    addRipple(fromLeft ? -70 : width + 70, Math.random() * height, 0.75, 'idle');
                    nextIdleWaveAt = elapsed + idleWaveDelay();
                }
                draw();
            }
            frame = requestAnimationFrame(animate);
        }

        function start() {
            if (frame === undefined && isAnimating && !document.hidden) {
                previousTimestamp = undefined;
                lastDraw = 0;
                frame = requestAnimationFrame(animate);
            }
        }

        updateAnimation = enabled => {
            isAnimating = enabled;
            if (frame !== undefined) cancelAnimationFrame(frame);
            frame = undefined;
            pointer = { x: -1000, y: -1000 };
            ripples = [];
            nextIdleWaveAt = elapsed + idleWaveDelay();
            for (const cell of cells) {
                if (cell.glyph !== cell.baseGlyph) { cell.glyph = cell.baseGlyph; paintGlyph(cell); }
                cell.scrambleUntil = 0;
            }
            draw();
            start();
        };

        function movePointer(event) {
            if (!isAnimating || event.pointerType === 'touch') return;
            const distance = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
            pointer = { x: event.clientX, y: event.clientY };
            lastPointerActivity = elapsed;
            if (elapsed - lastTrail > 850 && distance > 14) {
                addRipple(pointer.x, pointer.y, 0.45, 'trail');
                lastTrail = elapsed;
            }
        }

        function pressPointer(event) {
            if (!isAnimating) return;
            lastPointerActivity = elapsed;
            if (event.button !== 0 || (event.target instanceof Element && event.target.closest('a, button, input, label, select, textarea'))) return;
            addRipple(event.clientX, event.clientY);
        }

        function clearPointer() { pointer = { x: -1000, y: -1000 }; }
        function visibilityChanged() {
            if (document.hidden) {
                if (frame !== undefined) cancelAnimationFrame(frame);
                frame = undefined;
            } else start();
        }
        function preferenceChanged() { updateAnimation(!motionPreference.matches); }

        const themeObserver = new MutationObserver(readTheme);
        const contentObserver = new ResizeObserver(measureContent);
        const textObserver = new MutationObserver(measureContent);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        tick().then(() => {
            if (destroyed) return;
            if (contentElement) {
                contentObserver.observe(contentElement);
                textObserver.observe(contentElement, { childList: true, characterData: true, subtree: true });
            }
            if (motionControl) contentObserver.observe(motionControl);
            measureContent();
            document.fonts.ready.then(() => { if (!destroyed) measureContent(); });
        });

        resize();
        updateAnimation(!motionPreference.matches);
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', measureContent, { passive: true });
        window.addEventListener('pointermove', movePointer, { passive: true });
        window.addEventListener('pointerdown', pressPointer, { passive: true });
        document.documentElement.addEventListener('pointerleave', clearPointer);
        window.addEventListener('blur', clearPointer);
        document.addEventListener('visibilitychange', visibilityChanged);
        motionPreference.addEventListener('change', preferenceChanged);

        return () => {
            destroyed = true;
            if (frame !== undefined) cancelAnimationFrame(frame);
            themeObserver.disconnect();
            contentObserver.disconnect();
            textObserver.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', measureContent);
            window.removeEventListener('pointermove', movePointer);
            window.removeEventListener('pointerdown', pressPointer);
            document.documentElement.removeEventListener('pointerleave', clearPointer);
            window.removeEventListener('blur', clearPointer);
            document.removeEventListener('visibilitychange', visibilityChanged);
            motionPreference.removeEventListener('change', preferenceChanged);
        };
    });
</script>

<canvas bind:this={canvas} class="ascii-background" aria-hidden="true"></canvas>

<label bind:this={motionControl} class="motion-control" title="Animate the background">
    <span>Motion</span>
    <input type="checkbox" role="switch" aria-label="Animate background" checked={isAnimating} on:change={event => updateAnimation(event.currentTarget.checked)}/>
</label>

<style>
    .ascii-background { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
    .motion-control { position: fixed; right: 1rem; bottom: 1rem; z-index: 2; display: flex; align-items: center; gap: 0.55rem; min-height: 44px; padding: 0 0.5rem; color: #8c969d; font-size: 12px; cursor: pointer; }
    .motion-control input { appearance: none; width: 26px; height: 15px; margin: 0; border: 1px solid currentColor; border-radius: 8px; background: transparent !important; color: inherit; cursor: pointer; }
    .motion-control input::before { content: ''; display: block; width: 9px; height: 9px; margin: 2px; border-radius: 50%; background: currentColor; transition: transform 0.2s ease; }
    .motion-control input:checked::before { transform: translateX(11px); }
    .motion-control input:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
    :global([data-theme='light']) .motion-control { color: #68747b; }
    @media (max-width: 640px) { .motion-control { position: relative; right: auto; bottom: auto; align-self: flex-end; margin-top: 1rem; } }
    @media (prefers-reduced-motion: reduce) { .motion-control input::before { transition: none; } }
</style>
