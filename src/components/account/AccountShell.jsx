"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, MessageSquare, Heart, UserRound, Settings, Bell, LogIn, Plus } from "lucide-react";
import { useDb, useHydrated, selectMe } from "@/lib/db/store";
import { initials } from "@/lib/format";
import { USER_ROLES } from "@/mock/people";
import { Empty, Status } from "@/components/ui/bits";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/properties", label: "My properties", icon: Building2 },
  { href: "/account/leads", label: "Inquiries & visits", icon: MessageSquare },
  { href: "/account/saved", label: "Saved items", icon: Heart },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/settings", label: "Settings & privacy", icon: Settings },
];

export default function AccountShell({ children }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const me = useDb(selectMe);

  if (!hydrated) return <div className="container page-pad muted">Loading your account…</div>;

  if (!me) {
    return (
      <div className="container page-pad">
        <Empty icon={LogIn} title="Log in to see your account" text="Manage your listings, inquiries, saved homes, watchlist and preferences." action={{ label: "Log in", href: `/login?next=${encodeURIComponent(pathname)}` }} />
      </div>
    );
  }

  return (
    <div className="container page-pad acct">
      <aside className="acct__side">
        <div className="acct__me">
          {me.avatar ? <img src={me.avatar} alt="" className="avatar avatar--lg" /> : <span className="avatar avatar--lg">{initials(me.name)}</span>}
          <div>
            <strong>{me.name}</strong>
            <span>{USER_ROLES.find((r) => r.id === me.role)?.label}</span>
            {me.status === "pending" && <Status tone="warn">Verification pending</Status>}
          </div>
        </div>
        <nav className="acct__nav" aria-label="Account">
          {LINKS.map(({ href, label, icon: Icon, exact }) => {
            const on = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={on ? "is-active" : ""} aria-current={on ? "page" : undefined}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <Link href="/post-property" className="btn btn--primary btn--sm btn--block">
          <Plus size={16} /> Post property
        </Link>
      </aside>
      <div className="acct__main">{children}</div>
    </div>
  );
}
