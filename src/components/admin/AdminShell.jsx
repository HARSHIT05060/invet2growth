"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ExternalLink, LogOut, ChevronDown, ShieldAlert } from "lucide-react";
import { useDb, useHydrated, selectAdmin, actions } from "@/lib/db/store";
import { initials } from "@/lib/format";
import { ADMIN_NAV, ROLE_LABEL } from "./nav";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const admin = useDb(selectAdmin);
  const perms = useDb((s) => (admin ? s.rolePermissions[admin.role] ?? [] : []), [admin?.role]);
  const counts = useDb((s) => ({
    pending: s.properties.filter((p) => p.status === "pending" && !p.deletedAt).length,
    reports: s.reports.filter((r) => r.status === "open").length,
    agents: s.agents.filter((a) => a.status === "pending").length,
    compliance: s.articles.filter((a) => a.compliance === "pending" && !a.deletedAt).length,
  }));
  const maintenance = useDb((s) => s.settings.maintenanceMode);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const signingOut = useRef(false);

  useEffect(() => {
    if (hydrated && !admin) router.replace(signingOut.current ? "/admin/login" : `/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, admin, pathname, router]);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  if (!hydrated || !admin) return <div className="adm-loading">Loading admin…</div>;

  const current = ADMIN_NAV.flatMap((g) => g.items).find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)));
  const allowed = !current?.perm || perms.includes(current.perm);

  return (
    <div className={`adm${open ? " is-nav-open" : ""}`}>
      <aside className="adm__side" aria-label="Admin navigation">
        <div className="adm__brand">
          <Link href="/admin">
            <img src="/images/logo.png" alt="invest2growth" width="140" height="26" />
          </Link>
          <span className="adm__badge">Admin</span>
          <button type="button" className="icon-btn icon-btn--sm adm__close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        <nav className="adm__nav">
          {ADMIN_NAV.map((g) => {
            const items = g.items.filter((i) => !i.perm || perms.includes(i.perm));
            if (!items.length) return null;
            return (
              <div key={g.group} className="adm__group">
                <span className="adm__group-label">{g.group}</span>
                {items.map(({ href, label, icon: Icon, exact, badge }) => {
                  const on = exact ? pathname === href : pathname.startsWith(href);
                  const n = badge ? counts[badge] : 0;
                  return (
                    <Link key={href} href={href} className={on ? "is-active" : ""} aria-current={on ? "page" : undefined}>
                      <Icon size={17} />
                      <span>{label}</span>
                      {n > 0 && <b>{n}</b>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="adm__side-foot">
          <Link href="/" target="_blank" className="adm__site">
            <ExternalLink size={15} /> View website
          </Link>
        </div>
      </aside>
      <div className="adm__scrim" onClick={() => setOpen(false)} />

      <div className="adm__main">
        <header className="adm__top">
          <button type="button" className="icon-btn adm__burger" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>
          <div className="adm__crumb">{current?.label ?? "Admin"}</div>
          {maintenance && <span className="status status--warn">Maintenance mode on</span>}
          <span className="status status--info adm__demo">Demo data</span>
          <div className="adm__me" ref={menuRef}>
            <button type="button" className="adm__me-btn" onClick={() => setMenu(!menu)} aria-expanded={menu}>
              <span className="avatar avatar--sm">{initials(admin.name)}</span>
              <span className="adm__me-name">
                <strong>{admin.name}</strong>
                <small>{ROLE_LABEL[admin.role]}</small>
              </span>
              <ChevronDown size={15} />
            </button>
            <div className={`umenu__panel${menu ? " is-open" : ""}`}>
              <div className="umenu__who">
                <strong>{admin.name}</strong>
                <span>{admin.email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  signingOut.current = true;
                  actions.adminLogout();
                }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </header>
        <main className="adm__content">
          {allowed ? (
            children
          ) : (
            <div className="empty">
              <span className="empty__icon">
                <ShieldAlert size={22} />
              </span>
              <h3>You don&apos;t have access to this section</h3>
              <p>Your role ({ROLE_LABEL[admin.role]}) doesn&apos;t include the “{current.label}” permission. Ask a Super Admin to grant it.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
