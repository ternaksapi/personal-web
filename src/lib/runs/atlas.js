export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function filterRuns(runs, year, month = null) {
    return runs.filter(run => (year === 'all' || run.year === year) && (month === null || run.month === month));
}

export function summarize(runs) {
    return {
        count: runs.length,
        distance: runs.reduce((sum, run) => sum + run.distanceMeters, 0) / 1000,
        longest: runs.reduce((max, run) => Math.max(max, run.distanceMeters / 1000), 0),
        seconds: runs.reduce((sum, run) => sum + run.durationSeconds, 0)
    };
}

export function timeline(runs, year, years) {
    return (year === 'all' ? years : MONTHS.map((_, index) => index)).map(value => {
        const subset = runs.filter(run => year === 'all' ? run.year === value : run.year === year && run.month === value);
        return { value, label: year === 'all' ? String(value) : MONTHS[value], ...summarize(subset) };
    });
}

export function movingPace(runs) {
    const timed = runs.filter(run => run.timeBasis === 'moving' && run.distanceMeters > 0 && run.durationSeconds > 0);
    const meters = timed.reduce((sum, run) => sum + run.distanceMeters, 0);
    return meters ? timed.reduce((sum, run) => sum + run.durationSeconds, 0) / meters * 1000 : null;
}

export function paceLabel(seconds) {
    if (seconds === null || !Number.isFinite(seconds)) return '--';
    const rounded = Math.round(seconds);
    return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`;
}

export function progressSeries(runs, year = 'all') {
    const selected = filterRuns(runs, year);
    if (!selected.length) return [];
    const groups = new Map();
    for (const run of selected) {
        const key = run.year * 12 + run.month;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(run);
    }
    const first = Math.min(...groups.keys());
    const last = Math.max(...groups.keys());
    // Retain unrecorded months, but do not manufacture future zero-mileage months.
    return Array.from({ length: last - first + 1 }, (_, index) => {
        const serial = first + index;
        const year = Math.floor(serial / 12);
        const month = serial % 12;
        const entries = groups.get(serial) || [];
        return {
            key: `${year}-${String(month + 1).padStart(2, '0')}`, year, month,
            label: `${MONTHS[month]} ${year}`,
            ...summarize(entries), paceSeconds: movingPace(entries)
        };
    });
}
