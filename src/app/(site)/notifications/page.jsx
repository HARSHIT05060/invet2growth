"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, CalendarDays, LineChart, Building2, Newspaper, CheckCheck } from "lucide-react";
import { useDb, useHydrated, selectMe, actions } from "@/lib/db/store";
import { ago } from "@/lib/format";
import { Empty } from "@/components/ui/bits";

const ICONS = { lead: MessageSquare, visit: CalendarDays, alert: LineChart, listing: Building2, news: Newspaper };

export default function NotificationsPage() {
  const hydrated = useHydrated();
  const me = useDb(selectMe);
  const [filter, setFilter] = useState("all");
  const all = useDb((s) => s.notifications.filter((n) => n.userId === me?.id || (n.userId == null && n.kind === "alert")), [me?.id]);
  const list = filter === "unread" ? all.filter((n) => !n.read) : all;

  if (!hydrated) return <div className="container page-pad muted">Loading…</div>;
  if (!me)
    return (
      <div className="container page-pad">
        <Empty icon={Bell} title="Log in to see notifications" action={{ label: "Log in", href: "/login?next=/notifications" }} />
      </div>
    );

  return (
    <div className="container page-pad narrow">
      <div className="acct__head row-between">
        <div>
          <h1 className="h-page">Notifications</h1>
          <p className="muted">{all.filter((n) => !n.read).length} unread</p>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => actions.markAllRead(me.id)}>
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>
      <div className="tabs">
        {["all", "unread"].map((f) => (
          <button key={f} type="button" className={filter === f ? "is-active" : ""} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty icon={Bell} title="You're all caught up" />
      ) : (
        <ul className="notes">
          {list.map((n) => {
            const Icon = ICONS[n.kind] ?? Bell;
            return (
              <li key={n.id} className={n.read ? "" : "is-unread"}>
                <span className="notes__icon">
                  <Icon size={18} />
                </span>
                <Link href={n.link ?? "#"} onClick={() => actions.markRead(n.id)}>
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                </Link>
                <span className="muted small">{ago(n.createdAt)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
