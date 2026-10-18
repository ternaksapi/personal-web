export const EFFORT_DISTANCES = [
    { meters: 1000, label: '1K' },
    { meters: 5000, label: '5K' },
    { meters: 10000, label: '10K' },
    { meters: 15000, label: '15K' }
];

export function validEfforts(efforts) {
    return EFFORT_DISTANCES.flatMap(({ meters }) => {
        const effort = Array.isArray(efforts) && efforts.find(effort => effort?.meters === meters && Number.isFinite(effort.seconds) && effort.seconds > 0);
        return effort ? [{ meters, seconds: effort.seconds }] : [];
    });
}

export function bestEfforts(runs) {
    return EFFORT_DISTANCES.map(distance => {
        let best = null;
        for (const run of runs) {
            const effort = validEfforts(run.bestEfforts).find(effort => effort.meters === distance.meters);
            if (effort && (!best || effort.seconds < best.seconds || (effort.seconds === best.seconds && run.id < best.run.id))) best = { ...effort, run };
        }
        return { ...distance, seconds: best?.seconds ?? null, run: best?.run ?? null };
    });
}

export function effortTime(seconds) {
    if (seconds === null) return '--';
    const total = Math.round(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const secs = String(total % 60).padStart(2, '0');
    return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}` : `${minutes}:${secs}`;
}
