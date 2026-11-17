"use client";

// Lightweight SVG charts (no external charting dependency).
// LineChart: crosshair + tooltip on hover. BarChart/Donut: per-mark tooltip.
// Series colours come from CSS custom properties (--series-1…4), see globals.css.

import { useEffect, useMemo, useRef, useState } from "react";

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const gid = (id) => String(id).replace(/[^A-Za-z0-9_-]/g, "_");

function niceTicks(min, max, count = 4) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) ?? step0;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10));
  return out;
}

function nearest(points, t) {
  let lo = 0;
  let hi = points.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid].t < t) lo = mid;
    else hi = mid;
  }
  return Math.abs(points[lo].t - t) <= Math.abs(points[hi].t - t) ? points[lo] : points[hi];
}

/**
 * series: [{ id, label, points: [{ t, v }], color? }]
 * yFormat / xFormat: value → string
 * baseline: optional reference value drawn as a dashed line (e.g. previous close)
 * area: fill under a single series
 */
export function LineChart({ series, height = 300, yFormat = (v) => v.toFixed(0), xFormat = (t) => t, tipFormat, baseline, area = true, label }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { t: 16, r: 16, b: 28, l: 60 };

  const geom = useMemo(() => {
    const all = series.flatMap((s) => s.points);
    if (!all.length || !width) return null;
    let min = Math.min(...all.map((p) => p.v));
    let max = Math.max(...all.map((p) => p.v));
    if (baseline != null) {
      min = Math.min(min, baseline);
      max = Math.max(max, baseline);
    }
    const ticks = niceTicks(min, max);
    const y0 = ticks[0];
    const y1 = ticks[ticks.length - 1];
    const tMin = Math.min(...all.map((p) => p.t));
    const tMax = Math.max(...all.map((p) => p.t));
    const iw = width - pad.l - pad.r;
    const ih = height - pad.t - pad.b;
    const x = (t) => pad.l + (tMax === tMin ? iw / 2 : ((t - tMin) / (tMax - tMin)) * iw);
    const y = (v) => pad.t + ih - ((v - y0) / (y1 - y0 || 1)) * ih;
    const nx = Math.min(5, Math.max(2, Math.floor(iw / 120)));
    const xt = Array.from({ length: nx }, (_, i) => tMin + ((tMax - tMin) * i) / (nx - 1));
    return { ticks, x, y, xt, tMin, tMax, iw, ih };
  }, [series, width, height, baseline]);

  function onMove(e) {
    if (!geom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.min(Math.max(e.clientX - rect.left, pad.l), width - pad.r);
    const t = geom.tMin + ((px - pad.l) / geom.iw) * (geom.tMax - geom.tMin);
    const pts = series.map((s) => ({ s, p: s.points.length ? nearest(s.points, t) : null })).filter((r) => r.p);
    setHover({ x: geom.x(pts[0].p.t), pts });
  }

  const single = series.length === 1;

  return (
    <div className="chart" ref={ref} style={{ height }}>
      {geom && (
        <svg width={width} height={height} role="img" aria-label={label} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.id} id={`g-${gid(s.id)}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" style={{ stopColor: s.color ?? `var(--series-${i + 1})`, stopOpacity: 0.18 }} />
                <stop offset="100%" style={{ stopColor: s.color ?? `var(--series-${i + 1})`, stopOpacity: 0 }} />
              </linearGradient>
            ))}
          </defs>
          {geom.ticks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={width - pad.r} y1={geom.y(v)} y2={geom.y(v)} className="chart__grid" />
              <text x={pad.l - 10} y={geom.y(v)} className="chart__tick" textAnchor="end" dominantBaseline="middle">
                {yFormat(v)}
              </text>
            </g>
          ))}
          {geom.xt.map((t, i) => (
            <text key={i} x={geom.x(t)} y={height - 8} className="chart__tick" textAnchor={i === 0 ? "start" : i === geom.xt.length - 1 ? "end" : "middle"}>
              {xFormat(t)}
            </text>
          ))}
          {baseline != null && <line x1={pad.l} x2={width - pad.r} y1={geom.y(baseline)} y2={geom.y(baseline)} className="chart__base" />}
          {series.map((s, i) => {
            if (!s.points.length) return null;
            const d = s.points.map((p, j) => `${j ? "L" : "M"}${geom.x(p.t).toFixed(1)},${geom.y(p.v).toFixed(1)}`).join("");
            const color = s.color ?? `var(--series-${i + 1})`;
            return (
              <g key={s.id}>
                {area && single && (
                  <path d={`${d}L${geom.x(s.points.at(-1).t)},${pad.t + geom.ih}L${geom.x(s.points[0].t)},${pad.t + geom.ih}Z`} fill={`url(#g-${gid(s.id)})`} />
                )}
                <path d={d} fill="none" style={{ stroke: color }} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              </g>
            );
          })}
          {hover && (
            <g>
              <line x1={hover.x} x2={hover.x} y1={pad.t} y2={pad.t + geom.ih} className="chart__cross" />
              {hover.pts.map(({ s, p }, i) => (
                <circle key={s.id} cx={geom.x(p.t)} cy={geom.y(p.v)} r="4.5" style={{ fill: s.color ?? `var(--series-${series.indexOf(s) + 1})`, stroke: "var(--surface)" }} strokeWidth="2" />
              ))}
            </g>
          )}
        </svg>
      )}
      {hover && geom && (
        <div className="chart__tip" style={{ left: Math.min(hover.x + 12, width - 180), top: 8 }}>
          <div className="chart__tip-date">{(tipFormat ?? xFormat)(hover.pts[0].p.t)}</div>
          {hover.pts.map(({ s, p }) => (
            <div key={s.id} className="chart__tip-row">
              {!single && <i style={{ background: s.color ?? `var(--series-${series.indexOf(s) + 1})` }} />}
              {!single && <span>{s.label}</span>}
              <strong>{yFormat(p.v, true)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Vertical bars for one measure. data: [{ label, value }] */
export function BarChart({ data, height = 240, format = (v) => v.toLocaleString("en-IN"), label }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { t: 12, r: 8, b: 28, l: 48 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const ticks = niceTicks(0, max);
  const top = ticks.at(-1);
  const iw = Math.max(0, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const slot = iw / data.length;
  const bw = Math.max(4, Math.min(40, slot - 6));
  const y = (v) => pad.t + ih - (v / top) * ih;

  return (
    <div className="chart" ref={ref} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={label}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} className="chart__grid" />
              <text x={pad.l - 8} y={y(v)} className="chart__tick" textAnchor="end" dominantBaseline="middle">
                {format(v, false)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = pad.l + slot * i + (slot - bw) / 2;
            const h = Math.max(0, pad.t + ih - y(d.value));
            const r = Math.min(4, h / 2, bw / 2);
            const yy = y(d.value);
            const path = `M${x},${pad.t + ih}V${yy + r}Q${x},${yy} ${x + r},${yy}H${x + bw - r}Q${x + bw},${yy} ${x + bw},${yy + r}V${pad.t + ih}Z`;
            return (
              <g key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <rect x={pad.l + slot * i} y={pad.t} width={slot} height={ih} fill="transparent" />
                <path d={path} style={{ fill: "var(--series-1)" }} opacity={hover == null || hover === i ? 1 : 0.45} />
                {(data.length <= 12 || i % Math.ceil(data.length / 8) === 0) && (
                  <text x={x + bw / 2} y={height - 8} className="chart__tick" textAnchor="middle">
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover != null && (
        <div className="chart__tip" style={{ left: Math.min(pad.l + slot * hover + slot / 2, width - 160), top: 4 }}>
          <div className="chart__tip-date">{data[hover].label}</div>
          <div className="chart__tip-row">
            <strong>{format(data[hover].value, true)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

/** Part-to-whole for ≤ 4 categories (more fold into "Other"). data: [{ label, value }] */
export function Donut({ data, size = 180, format = (v) => v.toLocaleString("en-IN"), centerLabel }) {
  const [hover, setHover] = useState(null);
  const folded = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    if (sorted.length <= 4) return sorted;
    return [...sorted.slice(0, 3), { label: "Other", value: sorted.slice(3).reduce((s, d) => s + d.value, 0) }];
  }, [data]);
  const total = folded.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let acc = 0;
  const gap = 2;

  return (
    <div className="donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerLabel}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {folded.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                strokeWidth={hover === i ? 22 : 18}
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-acc}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                style={{ transition: "stroke-width .2s", stroke: `var(--series-${i + 1})` }}
              />
            );
            acc += len;
            return el;
          })}
        </g>
        <text x="50%" y="47%" textAnchor="middle" className="donut__value">
          {hover != null ? format(folded[hover].value) : format(total)}
        </text>
        <text x="50%" y="60%" textAnchor="middle" className="donut__label">
          {hover != null ? folded[hover].label : centerLabel}
        </text>
      </svg>
      <ul className="legend">
        {folded.map((d, i) => (
          <li key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
            <i style={{ background: `var(--series-${i + 1})` }} />
            <span>{d.label}</span>
            <strong>{Math.round((d.value / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ points, width = 96, height = 32, up }) {
  if (!points?.length) return <svg width={width} height={height} />;
  const vs = points.map((p) => p.v);
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  const d = points
    .map((p, i) => `${i ? "L" : "M"}${((i / (points.length - 1 || 1)) * (width - 2) + 1).toFixed(1)},${(height - 2 - ((p.v - min) / (max - min || 1)) * (height - 4)).toFixed(1)}`)
    .join("");
  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={d} fill="none" style={{ stroke: up ? "var(--up)" : "var(--down)" }} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
