"use client";

import Link from "next/link";
import { Building2, Eye, MessageSquare, CalendarDays, Heart, LineChart, Bookmark, ArrowRight } from "lucide-react";
import { useDb, selectMe } from "@/lib/db/store";
import { ago } from "@/lib/format";
import { statusLabel, STATUS_TONES } from "@/lib/property";
import { Status } from "@/components/ui/bits";

export default function AccountOverview() {
  const me = useDb(selectMe);
  const mine = useDb((s) => s.properties.filter((p) => p.ownerId === me?.id && !p.deletedAt), [me?.id]);
  const leads = useDb((s) => s.inquiries.filter((i) => i.ownerId === me?.id), [me?.id]);
  const visits = useDb((s) => s.visits.filter((v) => v.ownerId === me?.id), [me?.id]);
  const myself = useDb((s) => s.me);
  const notes = useDb((s) => s.notifications.filter((n) => n.userId === me?.id).slice(0, 5), [me?.id]);

  const stats = [
    { icon: Building2, label: "Live listings", value: mine.filter((p) => p.status === "active").length, href: "/account/properties" },
    { icon: Eye, label: "Total views", value: mine.reduce((s, p) => s + (p.views || 0), 0).toLocaleString("en-IN"), href: "/account/properties" },
    { icon: MessageSquare, label: "New inquiries", value: leads.filter((l) => l.status === "new").length, href: "/account/leads" },
    { icon: CalendarDays, label: "Visit requests", value: visits.filter((v) => v.status === "requested").length, href: "/account/leads?tab=visits" },
  ];

  return (
    <>
      <div className="acct__head">
        <h1>Namaste, {me.name.split(" ")[0]}</h1>
        <p className="muted">Here&apos;s what&apos;s happening with your listings and saved items.</p>
      </div>

      <div className="stat-grid">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="stat">
            <span className="stat__icon">
              <Icon size={18} />
            </span>
            <span className="stat__label">{label}</span>
            <span className="stat__value">{value}</span>
          </Link>
        ))}
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel__head">
            <h2>My properties</h2>
            <Link href="/account/properties" className="link-inline">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          {mine.length === 0 ? (
            <p className="muted">
              You haven&apos;t posted anything yet. <Link href="/post-property">Post a property</Link>
            </p>
          ) : (
            <ul className="list">
              {mine.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <img src={p.images[0]} alt="" />
                  <div>
                    <Link href={`/properties/${p.id}`}>{p.title}</Link>
                    <span className="muted small">
                      {p.id} · {(p.views || 0).toLocaleString("en-IN")} views
                    </span>
                  </div>
                  <Status tone={STATUS_TONES[p.status]}>{statusLabel(p.status)}</Status>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Recent activity</h2>
            <Link href="/notifications" className="link-inline">
              All <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="feed">
            {notes.map((n) => (
              <li key={n.id} className={n.read ? "" : "is-unread"}>
                <Link href={n.link}>{n.title}</Link>
                <span className="muted small">{ago(n.createdAt)}</span>
              </li>
            ))}
            {!notes.length && <li className="muted">No activity yet.</li>}
          </ul>
        </section>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2>Saved</h2>
        </div>
        <div className="quick">
          <Link href="/account/saved" className="quick__item">
            <Heart size={18} /> <strong>{myself.wishlist.length}</strong> saved properties
          </Link>
          <Link href="/market/watchlist" className="quick__item">
            <LineChart size={18} /> <strong>{myself.watchlist.length}</strong> stocks in watchlist
          </Link>
          <Link href="/account/saved?tab=articles" className="quick__item">
            <Bookmark size={18} /> <strong>{myself.bookmarks.length}</strong> saved articles
          </Link>
        </div>
      </section>
    </>
  );
}
