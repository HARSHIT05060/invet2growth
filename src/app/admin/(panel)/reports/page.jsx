"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useDb } from "@/lib/db/store";
import { MONTHLY_STATS } from "@/mock/admin";
import { PageHeader } from "@/components/admin/ui";
import { BarChart, LineChart, Donut } from "@/components/charts/Charts";
import { date, num, downloadCsv } from "@/lib/format";
import { categoryLabel } from "@/lib/property";
import { articleCategory, publishedArticles } from "@/lib/articles";

const RANGES = [
  [3, "Last 3 months"],
  [6, "Last 6 months"],
  [12, "Last 12 months"],
];
const month = (m, opts = { month: "short" }) => date(`${m}-15T00:00:00+05:30`, opts);

export default function ReportsPage() {
  const [range, setRange] = useState(6);
  const s = useDb();
  const series = MONTHLY_STATS.slice(-range);
  const sum = (k) => series.reduce((a, m) => a + m[k], 0);
  const props = s.properties.filter((p) => !p.deletedAt);
  const cats = Object.entries(props.reduce((a, p) => ((a[p.category] = (a[p.category] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
  const topProps = [...props].sort((a, b) => b.views - a.views).slice(0, 6);
  const topArticles = publishedArticles(s.articles).sort((a, b) => b.views - a.views).slice(0, 6);
  const leadsPerProp = Object.entries(s.inquiries.reduce((a, i) => ((a[i.propertyId] = (a[i.propertyId] || 0) + 1), a), {}));

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        description="Monthly trends are sample analytics; breakdowns are computed live from platform data."
        actions={
          <>
            <select className="input input--sm" value={range} onChange={(e) => setRange(Number(e.target.value))} aria-label="Date range">
              {RANGES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => downloadCsv(`platform-report-${range}m.csv`, series)}>
              <Download size={15} /> Export CSV
            </button>
          </>
        }
      />

      <div className="astat-grid astat-grid--4">
        {[
          ["New users", sum("users")],
          ["New listings", sum("listings")],
          ["Inquiries", sum("inquiries")],
          ["Articles published", sum("articles")],
        ].map(([l, v]) => (
          <div key={l} className="astat">
            <span className="astat__label">{l}</span>
            <span className="astat__value">{num(v)}</span>
            <span className="astat__sub">{RANGES.find((r) => r[0] === range)[1].toLowerCase()}</span>
          </div>
        ))}
      </div>

      <div className="adm-grid adm-grid--2">
        <section className="panel">
          <div className="panel__head">
            <h2>New users</h2>
          </div>
          <BarChart label="New users per month" data={series.map((m) => ({ label: month(m.month), value: m.users }))} />
        </section>
        <section className="panel">
          <div className="panel__head">
            <h2>New listings</h2>
          </div>
          <BarChart label="New listings per month" data={series.map((m) => ({ label: month(m.month), value: m.listings }))} />
        </section>
        <section className="panel">
          <div className="panel__head">
            <h2>Inquiries per listing</h2>
            <span className="muted small">Lead quality indicator</span>
          </div>
          <LineChart
            label="Inquiries per new listing"
            series={[{ id: "ipl", label: "Inquiries per listing", points: series.map((m) => ({ t: Date.parse(`${m.month}-15`), v: m.inquiries / m.listings })) }]}
            height={240}
            yFormat={(v) => v.toFixed(1)}
            xFormat={(t) => date(new Date(t).toISOString(), { month: "short" })}
            tipFormat={(t) => date(new Date(t).toISOString(), { month: "long", year: "numeric" })}
          />
        </section>
        <section className="panel">
          <div className="panel__head">
            <h2>Listings by type</h2>
          </div>
          <Donut
            data={[
              { label: "For sale", value: props.filter((p) => p.listingType === "sale").length },
              { label: "For rent", value: props.filter((p) => p.listingType === "rent").length },
              { label: "For lease", value: props.filter((p) => p.listingType === "lease").length },
            ]}
            centerLabel="listings"
          />
        </section>
      </div>

      <div className="adm-grid adm-grid--3">
        <section className="panel">
          <div className="panel__head">
            <h2>Listings by category</h2>
          </div>
          <ul className="hbars">
            {cats.map(([c, n]) => (
              <li key={c}>
                <span>{categoryLabel(c, s.propertyCategories)}</span>
                <span className="hbars__bar">
                  <i style={{ width: `${(n / cats[0][1]) * 100}%` }} />
                </span>
                <strong>{n}</strong>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <div className="panel__head">
            <h2>Most viewed properties</h2>
            <button type="button" className="link-inline" onClick={() => downloadCsv("top-properties.csv", topProps.map((p) => ({ id: p.id, title: p.title, city: p.city, views: p.views, inquiries: leadsPerProp.find(([id]) => id === p.id)?.[1] ?? 0 })))}>
              CSV
            </button>
          </div>
          <ol className="rank">
            {topProps.map((p) => (
              <li key={p.id}>
                <span className="cell-stack">
                  <strong>{p.title}</strong>
                  <small>{p.city}</small>
                </span>
                <span className="num">{num(p.views)}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="panel">
          <div className="panel__head">
            <h2>Most read articles</h2>
            <button type="button" className="link-inline" onClick={() => downloadCsv("top-articles.csv", topArticles.map((a) => ({ id: a.id, title: a.title, category: a.category, views: a.views, likes: a.likes })))}>
              CSV
            </button>
          </div>
          <ol className="rank">
            {topArticles.map((a) => (
              <li key={a.id}>
                <span className="cell-stack">
                  <strong>{a.title}</strong>
                  <small>{articleCategory(a.category, s.articleCategories).label}</small>
                </span>
                <span className="num">{num(a.views)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2>Monthly summary</h2>
        </div>
        <div className="table-wrap">
          <table className="dtable">
            <thead>
              <tr>
                <th>Month</th>
                <th className="r">New users</th>
                <th className="r">New listings</th>
                <th className="r">Inquiries</th>
                <th className="r">Articles</th>
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map((m) => (
                <tr key={m.month}>
                  <td>{month(m.month, { month: "long", year: "numeric" })}</td>
                  <td className="r num">{num(m.users)}</td>
                  <td className="r num">{num(m.listings)}</td>
                  <td className="r num">{num(m.inquiries)}</td>
                  <td className="r num">{num(m.articles)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
