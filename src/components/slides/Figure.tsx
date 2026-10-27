import type { FigureId } from '../../data/types';

// Charts drawn from the same formulas the lecture uses, so the numbers always match.

const TEAL = 'rgb(var(--teal))';
const INK = 'rgb(var(--ink))';
const MUTED = 'rgb(var(--ink-muted))';
const LINE = 'rgb(var(--line-strong))';
const AMBER = 'rgb(var(--amber))';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

interface Frame {
  w: number;
  h: number;
  pad: { l: number; r: number; t: number; b: number };
  x: [number, number];
  y: [number, number];
}

function scales(f: Frame) {
  const sx = (v: number) => f.pad.l + ((v - f.x[0]) / (f.x[1] - f.x[0])) * (f.w - f.pad.l - f.pad.r);
  const sy = (v: number) => f.h - f.pad.b - ((v - f.y[0]) / (f.y[1] - f.y[0])) * (f.h - f.pad.t - f.pad.b);
  return { sx, sy };
}

const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function Axes({ f, xTicks, yTicks, xFmt, yFmt }: { f: Frame; xTicks: number[]; yTicks: number[]; xFmt: (v: number) => string; yFmt: (v: number) => string }) {
  const { sx, sy } = scales(f);
  return (
    <g fontSize="15" fill={MUTED}>
      {yTicks.map((v) => (
        <g key={`y${v}`}>
          <line x1={f.pad.l} x2={f.w - f.pad.r} y1={sy(v)} y2={sy(v)} stroke={LINE} strokeOpacity={0.5} />
          <text x={f.pad.l - 8} y={sy(v) + 5} textAnchor="end">{yFmt(v)}</text>
        </g>
      ))}
      {xTicks.map((v) => (
        <text key={`x${v}`} x={sx(v)} y={f.h - f.pad.b + 22} textAnchor="middle">{xFmt(v)}</text>
      ))}
    </g>
  );
}

function InterestStack() {
  const years = [0, 1, 2, 3];
  const f: Frame = { w: 420, h: 330, pad: { l: 64, r: 12, t: 34, b: 64 }, x: [0, 4], y: [900, 1350] };
  const { sy } = scales(f);
  const bw = 56;
  const cx = (i: number) => f.pad.l + 22 + i * 84;
  return (
    <svg viewBox={`0 0 ${f.w} ${f.h}`} width="100%" role="img" aria-label="Balance after 0 to 3 years: $1,000, $1,100, $1,210, $1,331">
      <Axes f={f} xTicks={[]} yTicks={[900, 1100, 1300]} xFmt={String} yFmt={money} />
      {years.map((yr, i) => {
        const simple = 1000 + 100 * yr;
        const total = 1000 * 1.1 ** yr;
        return (
          <g key={yr}>
            <rect x={cx(i)} y={sy(1000)} width={bw} height={sy(900) - sy(1000)} fill={INK} fillOpacity={0.18} />
            {yr > 0 && <rect x={cx(i)} y={sy(simple)} width={bw} height={sy(1000) - sy(simple)} fill={TEAL} />}
            {total - simple > 0.5 && <rect x={cx(i)} y={sy(total)} width={bw} height={sy(simple) - sy(total)} fill={AMBER} />}
            <text x={cx(i) + bw / 2} y={sy(total) - 8} textAnchor="middle" fontSize="16" fontWeight="600" fill={INK}>{money(total)}</text>
            <text x={cx(i) + bw / 2} y={f.h - f.pad.b + 22} textAnchor="middle" fontSize="15" fill={MUTED}>{yr === 0 ? 'Start' : `Yr ${yr}`}</text>
          </g>
        );
      })}
      <g fontSize="14" fill={INK} transform={`translate(${f.pad.l}, ${f.h - 16})`}>
        <rect width="12" height="12" y="-10" fill={TEAL} /><text x="18">simple interest</text>
        <rect x="150" width="12" height="12" y="-10" fill={AMBER} /><text x="168">interest on interest</text>
      </g>
      <text x={f.w - f.pad.r} y={16} textAnchor="end" fontSize="13" fill={MUTED}>axis starts at $900</text>
    </svg>
  );
}

function GrowthCurves() {
  const f: Frame = { w: 820, h: 270, pad: { l: 76, r: 140, t: 16, b: 34 }, x: [0, 30], y: [0, 18000] };
  const { sx, sy } = scales(f);
  const yrs = range(0, 30);
  const simple = yrs.map((y) => [sx(y), sy(1000 + 100 * y)] as [number, number]);
  const compound = yrs.map((y) => [sx(y), sy(1000 * 1.1 ** y)] as [number, number]);
  return (
    <svg viewBox={`0 0 ${f.w} ${f.h}`} width="100%" role="img" aria-label="Over 30 years, simple interest grows to $4,000 and compound to $17,449">
      <Axes f={f} xTicks={[0, 10, 20, 30]} yTicks={[0, 6000, 12000, 18000]} xFmt={(v) => `${v} yrs`} yFmt={money} />
      <path d={path(simple)} fill="none" stroke={MUTED} strokeWidth={4} strokeDasharray="8 6" />
      <path d={path(compound)} fill="none" stroke={TEAL} strokeWidth={5} />
      <text x={sx(30) + 10} y={sy(4000) + 5} fontSize="17" fill={MUTED}>Simple {money(4000)}</text>
      <text x={sx(30) + 10} y={sy(1000 * 1.1 ** 30) + 6} fontSize="17" fontWeight="700" fill={TEAL}>{money(1000 * 1.1 ** 30)}</text>
    </svg>
  );
}

function saverSeries(startAge: number, stopAge: number) {
  let bal = 0;
  const pts: [number, number][] = [[25, 0]];
  for (let age = 25; age < 65; age++) {
    if (age >= startAge && age < stopAge) bal += 2000;
    bal *= 1.07;
    pts.push([age + 1, bal]);
  }
  return pts;
}

function TwoSavers() {
  const f: Frame = { w: 400, h: 300, pad: { l: 66, r: 70, t: 16, b: 34 }, x: [25, 65], y: [0, 240000] };
  const { sx, sy } = scales(f);
  const ava = saverSeries(25, 35);
  const ben = saverSeries(35, 65);
  const toPx = (pts: [number, number][]) => pts.map(([a, v]) => [sx(a), sy(v)] as [number, number]);
  return (
    <svg viewBox={`0 0 ${f.w} ${f.h}`} width="100%" role="img" aria-label="At 65, Ava has $225,073 and Ben has $202,146">
      <Axes f={f} xTicks={[25, 35, 45, 55, 65]} yTicks={[0, 100000, 200000]} xFmt={(v) => `${v}`} yFmt={(v) => (v ? `$${v / 1000}k` : '$0')} />
      <path d={path(toPx(ben))} fill="none" stroke={MUTED} strokeWidth={4} />
      <path d={path(toPx(ava))} fill="none" stroke={TEAL} strokeWidth={5} />
      <text x={sx(65) + 6} y={sy(225073) + 2} fontSize="16" fontWeight="700" fill={TEAL}>Ava</text>
      <text x={sx(65) + 6} y={sy(202146) + 14} fontSize="16" fontWeight="600" fill={MUTED}>Ben</text>
      <text x={sx(25)} y={f.h - 2} fontSize="13" fill={MUTED}>age</text>
    </svg>
  );
}

function DebtGrowth() {
  const f: Frame = { w: 420, h: 300, pad: { l: 66, r: 10, t: 30, b: 34 }, x: [0, 7], y: [0, 2200] };
  const { sx, sy } = scales(f);
  const months = range(0, 36, 6);
  return (
    <svg viewBox={`0 0 ${f.w} ${f.h}`} width="100%" role="img" aria-label="A $1,000 balance at 2% a month grows to $2,040 in 36 months">
      <Axes f={f} xTicks={[]} yTicks={[0, 1000, 2000]} xFmt={String} yFmt={money} />
      {months.map((m, i) => {
        const v = 1000 * 1.02 ** m;
        return (
          <g key={m}>
            <rect x={sx(i) + 4} y={sy(v)} width={36} height={sy(0) - sy(v)} fill={AMBER} fillOpacity={0.35 + i * 0.1} />
            <text x={sx(i) + 22} y={f.h - f.pad.b + 22} textAnchor="middle" fontSize="14" fill={MUTED}>{m}</text>
          </g>
        );
      })}
      <text x={sx(6) + 22} y={sy(1000 * 1.02 ** 36) - 8} textAnchor="middle" fontSize="16" fontWeight="700" fill={AMBER}>{money(1000 * 1.02 ** 36)}</text>
    </svg>
  );
}

function BuyingPower() {
  const f: Frame = { w: 400, h: 300, pad: { l: 66, r: 64, t: 20, b: 34 }, x: [0, 10], y: [600, 1050] };
  const { sx, sy } = scales(f);
  const pts = range(0, 10).map((y) => [sx(y), sy(1000 / 1.03 ** y)] as [number, number]);
  return (
    <svg viewBox={`0 0 ${f.w} ${f.h}`} width="100%" role="img" aria-label="$1,000 in cash buys about $744 of today's goods after 10 years of 3% inflation">
      <Axes f={f} xTicks={[0, 5, 10]} yTicks={[600, 800, 1000]} xFmt={(v) => `${v} yrs`} yFmt={money} />
      <path d={path(pts)} fill="none" stroke={AMBER} strokeWidth={5} />
      <text x={sx(10) + 8} y={sy(1000 / 1.03 ** 10) + 6} fontSize="17" fontWeight="700" fill={AMBER}>{money(1000 / 1.03 ** 10)}</text>
    </svg>
  );
}

const figures: Record<FigureId, () => JSX.Element> = {
  'interest-stack': InterestStack,
  'growth-curves': GrowthCurves,
  'two-savers': TwoSavers,
  'debt-growth': DebtGrowth,
  'buying-power': BuyingPower,
};

export function Figure({ id }: { id: FigureId }) {
  const Fig = figures[id];
  return <Fig />;
}
