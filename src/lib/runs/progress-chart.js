import { scaleBand, scaleLinear, line, curveMonotoneX, bisector } from 'd3';
import { MONTHS } from './atlas.js';

export function progressChart(series, width) {
    const compact = width < 600;
    const left = 46;
    const right = Math.max(left + 10, width - 12);
    const mileageTop = 28;
    const mileageBottom = compact ? 134 : 150;
    const paceTop = compact ? 194 : 222;
    const paceBottom = compact ? 300 : 346;
    const x = scaleBand(series.map(item => item.key), [left, right]).padding(0.25);
    const mileage = scaleLinear([0, Math.max(1, ...series.map(item => item.distance))], [mileageBottom, mileageTop]).nice(3);
    const paces = series.map(item => item.paceSeconds).filter(value => value !== null && Number.isFinite(value));
    const fastest = paces.length ? Math.max(0, Math.floor(Math.min(...paces) / 60) * 60 - 30) : 300;
    const slowest = paces.length ? Math.ceil(Math.max(...paces) / 60) * 60 + 30 : 600;
    const pace = scaleLinear([slowest, fastest], [paceBottom, paceTop]);
    const paceStep = Math.max(1, Math.ceil((slowest - fastest) / 60 / 3));
    const paceTicks = [];
    for (let minute = Math.ceil(fastest / 60 / paceStep) * paceStep; minute <= slowest / 60; minute += paceStep) paceTicks.push(minute * 60);
    const rows = series.map((item, index) => ({
        ...item, index, x: x(item.key), center: x(item.key) + x.bandwidth() / 2,
        width: x.bandwidth(), y: mileage(item.distance), height: mileageBottom - mileage(item.distance),
        paceY: item.paceSeconds === null ? null : pace(item.paceSeconds)
    }));
    const longRange = series.length > 12;
    const maxTicks = width < 460 ? 3 : width < 700 ? 5 : 7;
    let candidates = longRange
        ? rows.filter((row, index) => index === 0 || row.month === 0 || index === rows.length - 1)
        : rows;
    const step = Math.max(1, Math.ceil((candidates.length - 1) / (maxTicks - 1)));
    candidates = candidates.filter((_, index) => index % step === 0 || index === candidates.length - 1);
    // Reserve the final label's space rather than squeezing two adjacent month labels.
    const ticks = candidates.filter((row, index) => index === candidates.length - 1 || candidates.at(-1).center - row.center > 44).map((row, index, values) => ({
        x: values.length === 1 ? row.center : index === 0 ? left : index === values.length - 1 ? right : row.center,
        anchor: values.length === 1 ? 'middle' : index === 0 ? 'start' : index === values.length - 1 ? 'end' : 'middle',
        label: longRange ? row.month === 0 ? String(row.year) : `${MONTHS[row.month]} ${String(row.year).slice(-2)}` : MONTHS[row.month]
    }));
    return {
        rows, left, right, mileageTop, mileageBottom, paceTop, paceBottom,
        height: compact ? 334 : 382, paceTitleY: compact ? 176 : 202, monthTickY: compact ? 326 : 374,
        mileageTicks: mileage.ticks(3).map(value => ({ value, y: mileage(value) })),
        paceTicks: paceTicks.map(value => ({ value, y: pace(value) })), ticks,
        pacePath: line().defined(row => row.paceY !== null).x(row => row.center).y(row => row.paceY).curve(curveMonotoneX)(rows) || '',
        nearest: position => Math.max(0, bisector(row => row.center).center(rows, position))
    };
}
