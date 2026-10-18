<script>
    import { onMount, tick } from 'svelte';

    export let contentElement;

    let canvas;
    let motionControl;
    let isAnimating = false;
    let updateAnimation = () => {};

    onMount(() => {
        const context = canvas.getContext('2d');
        if (!context) return;

        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const glyphs = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const columnWidth = 6;
        const rowHeight = 10;
        const fieldStepX = columnWidth * 4;
        const fieldStepY = rowHeight * 2;
        const glyphLayer = document.createElement('canvas');
        const glyphContext = glyphLayer.getContext('2d');
        const opacityLayer = document.createElement('canvas');
        const opacityContext = opacityLayer.getContext('2d');
        if (!glyphContext || !opacityContext) return;
        const frameInterval = 1000 / 30;
        let ratio = 1;
        let width = 0;
        let height = 0;
        let cells = [];
        let opacityMap;
        let fieldColumns = 0;
        let fieldRows = 0;
        let energyField;
        let ripples = [];
        let frame;
        let lastFrame = 0;
        let elapsed = 0;
        let lastTrail = 0;
        let pointer = { x: -1000, y: -1000 };
        let dark = true;
        let destroyed = false;

        function prepareGlyphs() {
            // Cache the character layer so animation only updates a small opacity map.
            glyphLayer.width = canvas.width;
            glyphLayer.height = canvas.height;
            glyphContext.setTransform(ratio, 0, 0, ratio, 0, 0);
            glyphContext.font = '8px ui-monospace, SFMono-Regular, Consolas, monospace';
            glyphContext.textAlign = 'center';
            glyphContext.textBaseline = 'middle';
            glyphContext.fillStyle = dark ? '#9aaaca' : '#6976aa';
            for (const cell of cells) {
                glyphContext.fillText(glyphs[cell.glyph], cell.x, cell.y);
            }
        }

        function measureContent() {
            const protectedBounds = [];
            if (contentElement) {
                // Text line bounds preserve the empty space around shorter lines and photos.
                const walker = document.createTreeWalker(contentElement, NodeFilter.SHOW_TEXT);
                const range = document.createRange();
                let node;
                while ((node = walker.nextNode())) {
                    if (!node.textContent.trim()) continue;
                    range.selectNodeContents(node);
                    protectedBounds.push(...range.getClientRects());
                }
                for (const element of contentElement.querySelectorAll('.polaroid-wrapper, img, button')) {
                    protectedBounds.push(element.getBoundingClientRect());
                }
            }
            if (motionControl) protectedBounds.push(motionControl.getBoundingClientRect());

            const fade = width < 640 ? 16 : 24;
            for (const cell of cells) cell.visibility = 1;
            for (const bounds of protectedBounds) {
                const firstColumn = Math.max(0, Math.floor((bounds.left - 8 - fade) / columnWidth));
                const lastColumn = Math.min(opacityLayer.width - 1, Math.ceil((bounds.right + 8 + fade) / columnWidth));
                const firstRow = Math.max(0, Math.floor((bounds.top - 8 - fade) / rowHeight));
                const lastRow = Math.min(opacityLayer.height - 1, Math.ceil((bounds.bottom + 8 + fade) / rowHeight));
                for (let row = firstRow; row <= lastRow; row++) {
                    for (let column = firstColumn; column <= lastColumn; column++) {
                        const cell = cells[row * opacityLayer.width + column];
                        const dx = Math.max(bounds.left - 8 - cell.x, 0, cell.x - bounds.right - 8);
                        const dy = Math.max(bounds.top - 8 - cell.y, 0, cell.y - bounds.bottom - 8);
                        cell.visibility = Math.min(cell.visibility, (dx * dx + dy * dy) / (fade * fade));
                    }
                }
            }
            if (!isAnimating) draw();
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            ratio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            opacityLayer.width = Math.ceil(width / columnWidth);
            opacityLayer.height = Math.ceil(height / rowHeight);
            opacityMap = opacityContext.createImageData(opacityLayer.width, opacityLayer.height);
            fieldColumns = Math.ceil(width / fieldStepX) + 1;
            fieldRows = Math.ceil(height / fieldStepY) + 1;
            energyField = new Float32Array(fieldColumns * fieldRows);
            cells = [];

            for (let row = 0; row < opacityLayer.height; row++) {
                for (let column = 0; column < opacityLayer.width; column++) {
                    const x = column * columnWidth + columnWidth / 2;
                    const y = row * rowHeight + rowHeight / 2;
                    const fieldX = x / fieldStepX;
                    const fieldY = y / fieldStepY;
                    cells.push({
                        x,
                        y,
                        fieldIndex: Math.floor(fieldY) * fieldColumns + Math.floor(fieldX),
                        mixX: fieldX % 1,
                        mixY: fieldY % 1,
                        edgeFade: Math.max(0, Math.min(1, y / 30, (height - y) / 30)),
                        glyph: Math.floor(Math.random() * glyphs.length),
                        visibility: 1
                    });
                }
            }

            prepareGlyphs();
            measureContent();
            draw();
        }

        function readTheme() {
            dark = document.documentElement.dataset.theme !== 'light';
            prepareGlyphs();
            if (!isAnimating) draw();
        }

        function sampleEnergy(x, y, time, waves) {
            let sampleX = x;
            let sampleY = y;
            let rippleEnergy = 0;
            for (const wave of waves) {
                const dx = x - wave.x;
                const dy = y - wave.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const offset = distance - wave.radius;
                const band = offset / wave.band;
                const pulse = Math.exp(-band * band) * wave.amplitude;
                const displacement = Math.sin(offset * 0.07) * pulse * 24 / Math.max(distance, 1);
                sampleX += dx * displacement;
                sampleY += dy * displacement;
                rippleEnergy += pulse * 0.7;
            }

            const pointerX = x - pointer.x;
            const pointerY = y - pointer.y;
            const pointerDistance = Math.sqrt(pointerX * pointerX + pointerY * pointerY);
            const pointerInfluence = isAnimating ? Math.pow(Math.max(0, 1 - pointerDistance / 150), 2) : 0;
            sampleX += pointerX * pointerInfluence * 0.18;
            sampleY += pointerY * pointerInfluence * 0.18;

            // Warp broad waves into a continuous, slowly drifting character field.
            const u = sampleX * 0.0045;
            const v = sampleY * 0.0045;
            const warpedX = u + Math.sin(v * 1.6 + u * 0.4 + time * 0.09) * 0.65
                + Math.cos(u * 2.1 - v * 0.65 - time * 0.08) * 0.25;
            const warpedY = v + Math.sin(u * 1.4 - v * 0.35 - time * 0.08) * 0.6
                + Math.cos(v * 1.9 + u * 0.7 + time * 0.1) * 0.28;
            const field = Math.sin(warpedX * 2.4 + warpedY * 1.2 - time * 0.12) * 0.5
                + Math.cos(warpedY * 2.8 - warpedX * 0.9 + time * 0.09) * 0.3
                + Math.sin(warpedX * 1.6 - warpedY * 2.1 + time * 0.06) * 0.2;
            const density = Math.max(0, Math.min(1, (field + 0.25) / 0.95));
            return Math.min(1, density * density * (3 - 2 * density) + rippleEnergy + pointerInfluence * 0.2);
        }

        function draw() {
            if (!opacityMap) return;
            context.clearRect(0, 0, width, height);
            const time = elapsed / 1000;
            const waves = ripples.map(ripple => {
                const age = (elapsed - ripple.started) / 1000;
                return {
                    ...ripple,
                    radius: age * ripple.speed,
                    band: 28 + age * 6,
                    amplitude: Math.pow(1 - age / ripple.duration, 2) * ripple.strength
                };
            });

            for (let row = 0; row < fieldRows; row++) {
                for (let column = 0; column < fieldColumns; column++) {
                    energyField[row * fieldColumns + column] = sampleEnergy(column * fieldStepX, row * fieldStepY, time, waves);
                }
            }

            for (let index = 0; index < cells.length; index++) {
                const cell = cells[index];
                const pixel = index * 4 + 3;
                if (cell.visibility < 0.01) {
                    opacityMap.data[pixel] = 0;
                    continue;
                }

                const fieldIndex = cell.fieldIndex;
                const top = energyField[fieldIndex] + (energyField[fieldIndex + 1] - energyField[fieldIndex]) * cell.mixX;
                const bottomIndex = fieldIndex + fieldColumns;
                const bottom = energyField[bottomIndex] + (energyField[bottomIndex + 1] - energyField[bottomIndex]) * cell.mixX;
                const energy = top + (bottom - top) * cell.mixY;
                const alpha = (0.018 + energy * (dark ? 0.38 : 0.32)) * cell.visibility * cell.edgeFade;
                opacityMap.data[pixel] = alpha < 0.012 ? 0 : Math.round(alpha * 255);
            }
            opacityContext.putImageData(opacityMap, 0, 0);
            context.drawImage(glyphLayer, 0, 0, width, height);
            context.globalCompositeOperation = 'destination-in';
            context.imageSmoothingEnabled = false;
            context.drawImage(opacityLayer, 0, 0, opacityLayer.width * columnWidth, opacityLayer.height * rowHeight);
            context.globalCompositeOperation = 'source-over';
        }

        function animate(timestamp) {
            if (!isAnimating || document.hidden) {
                frame = undefined;
                return;
            }
            const interval = ripples.length ? frameInterval : frameInterval * 2;
            if (timestamp - lastFrame >= interval) {
                elapsed += lastFrame ? Math.min(timestamp - lastFrame, 100) : interval;
                lastFrame = timestamp;
                ripples = ripples.filter(ripple => elapsed - ripple.started < ripple.duration * 1000);
                draw();
            }
            frame = requestAnimationFrame(animate);
        }

        function start() {
            if (frame === undefined && isAnimating && !document.hidden) {
                lastFrame = 0;
                frame = requestAnimationFrame(animate);
            }
        }

        updateAnimation = enabled => {
            isAnimating = enabled;
            if (frame !== undefined) cancelAnimationFrame(frame);
            frame = undefined;
            pointer = { x: -1000, y: -1000 };
            ripples = [];
            draw();
            start();
        };

        function addRipple(x, y, strength = 1.5) {
            if (!isAnimating) return;
            ripples.push({ x, y, started: elapsed, strength, speed: strength > 1 ? 190 : 105, duration: strength > 1 ? 3.6 : 1.8 });
            if (ripples.length > 8) ripples.shift();
        }

        function movePointer(event) {
            if (!isAnimating || event.pointerType === 'touch') return;
            const distance = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
            pointer = { x: event.clientX, y: event.clientY };
            if (elapsed - lastTrail > 160 && distance > 8) {
                addRipple(pointer.x, pointer.y, 0.5);
                lastTrail = elapsed;
            }
        }

        function pressPointer(event) {
            if (event.button !== 0 || event.target.closest('a, button, input, label, select, textarea')) return;
            addRipple(event.clientX, event.clientY);
        }

        function clearPointer() {
            pointer = { x: -1000, y: -1000 };
        }

        function visibilityChanged() {
            if (document.hidden) {
                if (frame !== undefined) cancelAnimationFrame(frame);
                frame = undefined;
            } else start();
        }

        function preferenceChanged() {
            updateAnimation(!motionPreference.matches);
        }

        const themeObserver = new MutationObserver(readTheme);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        const contentObserver = new ResizeObserver(measureContent);
        const textObserver = new MutationObserver(measureContent);

        // The parent's bind:this is populated after the child has mounted.
        tick().then(() => {
            if (destroyed) return;
            if (contentElement) {
                contentObserver.observe(contentElement);
                textObserver.observe(contentElement, { childList: true, characterData: true, subtree: true });
            }
            if (motionControl) contentObserver.observe(motionControl);
            measureContent();
            draw();
            document.fonts.ready.then(() => {
                if (!destroyed) measureContent();
            });
        });

        readTheme();
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
    <input
        type="checkbox"
        role="switch"
        aria-label="Animate background"
        checked={isAnimating}
        on:change={event => updateAnimation(event.currentTarget.checked)}
    />
</label>

<style>
    .ascii-background {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
    }

    .motion-control {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 0.55rem;
        min-height: 44px;
        padding: 0 0.5rem;
        color: #8c969d;
        font-size: 12px;
        cursor: pointer;
    }

    .motion-control input {
        appearance: none;
        width: 26px;
        height: 15px;
        margin: 0;
        border: 1px solid currentColor;
        border-radius: 8px;
        background: transparent !important;
        color: inherit;
        cursor: pointer;
    }

    .motion-control input::before {
        content: '';
        display: block;
        width: 9px;
        height: 9px;
        margin: 2px;
        border-radius: 50%;
        background: currentColor;
        transition: transform 0.2s ease;
    }

    .motion-control input:checked::before {
        transform: translateX(11px);
    }

    .motion-control input:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 4px;
    }

    :global([data-theme='light']) .motion-control {
        color: #68747b;
    }

    @media (max-width: 640px) {
        .motion-control {
            position: relative;
            right: auto;
            bottom: auto;
            align-self: flex-end;
            margin-top: 1rem;
        }
    }
</style>
