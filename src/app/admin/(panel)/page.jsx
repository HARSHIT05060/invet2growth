"use client";

import Link from "next/link";
import { Users, Building2, CheckCircle2, ClipboardCheck, MessageSquare, BadgeCheck, Newspaper, Globe, PlugZap, ArrowRight, Check, X } from "lucide-react";
import { useDb, actions, canAdmin } from "@/lib/db/store";
import { MONTHLY_STATS } from "@/mock/admin";
import { BarChart, LineChart, Donut } from "@/components/charts/Charts";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { Status } from "@/components/ui/bits";
import { ago, date, num } from "@/lib/format";
import { categoryLabel, priceText } from "@/lib/property";
import { publishedArticles } from "@/lib/articles";
import { market } from "@/lib/market";
import { toast } from "@/components/ui/Toast";

const month = (m) => date(`${m}-15T00:00:00+05:30`, { month: "short" });

export default function AdminDashboard() {
  const s = useDb();
  const props = s.properties.filter((p) => !p.deletedAt);
  const pending = props.filter((p) => p.status === "pending");
  const primary = s.providers.find((p) => p.kind === "market" && p.role === "primary");
  const canModerate = canAdmin(s, "properties");

  const stats = [
    { icon: Users, label: "Registered users", value: num(s.users.filter((u) => !u.deletedAt).length), sub: `${s.users.filter((u) => u.status === "active").length} active`, href: "/admin/users" },
    { icon: Building2, label: "Total properties", value: num(props.length), sub: `${props.filter((p) => p.listingType === "sale").length} sale · ${props.filter((p) => p.listingType !== "sale").length} rent/lease`, href: "/admin/properties" },
    { icon: CheckCircle2, label: "Active listings", value: num(props.filter((p) => p.status === "active").length), tone: "good", href: "/admin/properties?status=active" },
    { icon: ClipboardCheck, label: "Pending approvals", value: num(pending.length), tone: pending.length ? "warn" : undefined, href: "/admin/approvals" },
    { icon: MessageSquare, label: "Property inquiries", value: num(s.inquiries.length), sub: `${s.inquiries.filter((i) => i.status === "new").length} new · ${s.visits.length} visit requests`, href: "/admin/inquiries" },
    { icon: BadgeCheck, label: "Agents & builders", value: num(s.agents.length), sub: `${s.agents.filter((a) => a.status === "pending").length} awaiting verification`, href: "/admin/agents" },
    { icon: Newspaper, label: "Total articles", value: num(s.articles.filter((a) => !a.deletedAt).length), href: "/admin/articles" },
    { icon: Globe, label: "Published news", value: num(publishedArticles(s.articles).length), tone: "good", href: "/admin/articles?status=published" },
    {
      icon: PlugZap,
      label: "Market data API",
      value: primary?.enabled ? (market.provider.id === "mock" ? "Simulated" : "Connected") : "Disabled",
      sub: `${primary?.mode === "realtime" ? "Real-time" : "Delayed"} · ${primary?.pollSeconds}s refresh`,
      tone: primary?.enabled ? "info" : "bad",
      href: "/admin/providers",
    },
  ];

  const bySegment = ["residential", "commercial", "land"].map((seg) => ({ label: seg[0].toUpperCase() + seg.slice(1), value: props.filter((p) => p.segment === seg).length }));
  const byCity = Object.entries(props.reduce((a, p) => ((a[p.city] = (a[p.city] || 0) + 1), a), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Overview as of ${date(new Date().toISOString(), { day: "numeric", month: "long", year: "numeric" })}`}
        actions={
          <Link href="/admin/reports" className="btn btn--ghost btn--sm">
            Full reports <ArrowRight size={15} />
          </Link>
        }
      />

      <div className="astat-grid">
        {stats.map((x) => (
          <StatCard key={x.label} {...x} />
        ))}
      </div>

      <div className="adm-grid adm-grid--2-1">
        <section className="panel">
          <div className="panel__head">
            <h2>New user registrations</h2>
            <span className="muted small">Last 12 months · sample analytics</span>
          </div>
          <BarChart label="New users per month" data={MONTHLY_STATS.map((m) => ({ label: month(m.month), value: m.users }))} height={240} />
        </section>
        <section className="panel">
          <div className="panel__head">
            <h2>Listings by segment</h2>
          </div>
          <Donut data={bySegment} centerLabel="listings" />
        </section>
      </div>

      <div className="adm-grid adm-grid--2-1">
        <section className="panel">
          <div className="panel__head">
            <h2>Property inquiries</h2>
            <span className="muted small">Monthly · sample analytics</span>
          </div>
          <LineChart
            label="Inquiries per month"
            series={[{ id: "inq", label: "Inquiries", points: MONTHLY_STATS.map((m) => ({ t: Date.parse(`${m.month}-15`), v: m.inquiries })) }]}
            height={240}
            yFormat={(v) => num(v)}
            xFormat={(t) => date(new Date(t).toISOString(), { month: "short" })}
            tipFormat={(t) => date(new Date(t).toISOString(), { month: "long", year: "numeric" })}
          />
        </section>
        <section className="panel">
          <div className="panel__head">
            <h2>Top cities</h2>
          </div>
          <ul className="hbars">
            {byCity.map((c) => (
              <li key={c.label}>
                <span>{c.label}</span>
                <span className="hbars__bar">
                  <i style={{ width: `${(c.value / byCity[0].value) * 100}%` }} />
                </span>
                <strong>{c.value}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="adm-grid">
        <section className="panel">
          <div className="panel__head">
            <h2>Awaiting approval</h2>
            <Link href="/admin/approvals" className="link-inline">
              Open queue <ArrowRight size={14} />
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="muted">The queue is clear.</p>
          ) : (
            <ul className="queue">
              {pending.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <img src={p.images[0]} alt="" />
                  <div>
                    <Link href={`/admin/approvals?id=${p.id}`}>{p.title}</Link>
                    <span className="muted small">
                      {categoryLabel(p.category)} · {priceText(p)} · {p.city} · {ago(p.postedAt)}
                    </span>
                  </div>
                  {canModerate && (
                    <span className="row-actions">
                      <button type="button" className="icon-btn icon-btn--sm" title="Approve" aria-label={`Approve ${p.title}`} onClick={() => { actions.moderateProperty(p.id, "approve"); toast("Listing approved"); }}>
                        <Check size={15} />
                      </button>
                      <Link href={`/admin/approvals?id=${p.id}`} className="icon-btn icon-btn--sm" title="Review" aria-label={`Review ${p.title}`}>
                        <X size={15} />
                      </Link>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Recent admin activity</h2>
            <Link href="/admin/audit-logs" className="link-inline">
              Audit log <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="feed">
            {s.auditLogs.slice(0, 6).map((l) => (
              <li key={l.id}>
                <span>
                  <strong>{l.actor}</strong> · <code className="code">{l.action}</code> {l.detail && `— ${l.detail}`}
                </span>
                <span className="muted small">{ago(l.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Integrations</h2>
            <Link href="/admin/providers" className="link-inline">
              Configure <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="integrations">
            {s.providers.map((p) => (
              <li key={p.id}>
                <span>
                  <strong>{p.name}</strong>
                  <small className="muted">{p.vendor}</small>
                </span>
                <Status tone={!p.enabled ? "neutral" : p.status === "operational" ? "good" : p.status === "simulated" ? "info" : p.status === "down" ? "bad" : "warn"}>
                  {!p.enabled ? "Disabled" : p.status === "simulated" ? "Simulated" : p.status === "not-configured" ? "Not configured" : p.status}
                </Status>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
