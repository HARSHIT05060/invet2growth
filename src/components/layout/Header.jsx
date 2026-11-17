"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X, Plus, Bell, User, Heart, Building2, LineChart, LogOut, Settings, MessageSquare } from "lucide-react";
import { NAV } from "@/data/site";
import { useDb, useHydrated, selectMe, actions } from "@/lib/db/store";
import { initials } from "@/lib/format";

export default function Header() {
  const [open, setOpen] = useState(null); // desktop dropdown label
  const [drawer, setDrawer] = useState(false);
  const [section, setSection] = useState(null); // mobile accordion label
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const navRef = useRef(null);
  const userRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const me = useDb(selectMe);
  const unread = useDb((s) => (me ? s.notifications.filter((n) => n.userId === me.id && !n.read).length : 0), [me]);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Hide on scroll down, show on scroll up
      if (Math.abs(y - lastY) > 6) {
        const down = y > lastY && y > 240;
        setHidden(down);
        if (down) {
          setOpen(null);
          setUserMenu(false);
        }
        lastY = y;
      }
    };
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(null);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
        setUserMenu(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    if (drawer) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [drawer]);

  // Close menus on navigation
  useEffect(() => {
    setDrawer(false);
    setOpen(null);
    setUserMenu(false);
  }, [pathname]);

  const signedIn = hydrated && me;

  function logout() {
    actions.logout();
    router.push("/");
  }

  return (
    <header className={`header${scrolled ? " is-scrolled" : ""}${hidden && !drawer ? " is-hidden" : ""}`}>
      <div className="container header__bar">
        <Link href="/" className="header__logo" aria-label="invest2growth home">
          <img src="/images/logo.png" alt="invest2growth" width="171" height="32" />
        </Link>

        <nav className="nav" ref={navRef} aria-label="Main">
          {NAV.map((group) => (
            <div
              key={group.label}
              className={`nav__item${open === group.label ? " is-open" : ""}`}
              onMouseEnter={() => setOpen(group.label)}
              onMouseLeave={() => setOpen(null)}
            >
              <button
                type="button"
                className="nav__trigger"
                aria-expanded={open === group.label}
                onClick={() => setOpen(open === group.label ? null : group.label)}
              >
                {group.label}
                <ChevronDown size={15} strokeWidth={2.2} />
              </button>
              <div className="nav__menu" role="menu">
                {group.items.map((item) => (
                  <Link key={item.label} href={item.href} role="menuitem" onClick={() => setOpen(null)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="header__actions">
          {signedIn ? (
            <>
              <Link href="/notifications" className="icon-btn header__bell" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
                <Bell size={19} />
                {unread > 0 && <span className="dot-count">{unread > 9 ? "9+" : unread}</span>}
              </Link>
              <div className="umenu" ref={userRef}>
                <button type="button" className="umenu__trigger" aria-expanded={userMenu} onClick={() => setUserMenu(!userMenu)}>
                  <span className="avatar avatar--sm">{initials(me.name)}</span>
                  <span className="umenu__name">{me.name.split(" ")[0]}</span>
                  <ChevronDown size={15} />
                </button>
                <div className={`umenu__panel${userMenu ? " is-open" : ""}`} role="menu">
                  <div className="umenu__who">
                    <strong>{me.name}</strong>
                    <span>{me.email || me.phone}</span>
                  </div>
                  <Link href="/account" role="menuitem"><User size={16} /> My account</Link>
                  <Link href="/account/properties" role="menuitem"><Building2 size={16} /> My properties</Link>
                  <Link href="/account/leads" role="menuitem"><MessageSquare size={16} /> Inquiries & visits</Link>
                  <Link href="/account/saved" role="menuitem"><Heart size={16} /> Saved items</Link>
                  <Link href="/market/watchlist" role="menuitem"><LineChart size={16} /> Watchlist</Link>
                  <Link href="/account/settings" role="menuitem"><Settings size={16} /> Settings</Link>
                  <button type="button" role="menuitem" onClick={logout}><LogOut size={16} /> Log out</button>
                </div>
              </div>
            </>
          ) : (
            <Link href="/login" className="header__login">
              Log in
            </Link>
          )}
          <Link href="/post-property" className="btn btn--primary btn--sm header__post">
            <Plus size={16} strokeWidth={2.4} />
            Post property
            <span className="tag">Free</span>
          </Link>
          <button
            type="button"
            className="header__burger"
            aria-label={drawer ? "Close menu" : "Open menu"}
            aria-expanded={drawer}
            onClick={() => setDrawer(!drawer)}
          >
            {drawer ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`drawer${drawer ? " is-open" : ""}`} aria-hidden={!drawer} data-lenis-prevent>
        <div className="drawer__inner">
          {NAV.map((group) => (
            <div key={group.label} className={`drawer__group${section === group.label ? " is-open" : ""}`}>
              <button
                type="button"
                className="drawer__trigger"
                aria-expanded={section === group.label}
                onClick={() => setSection(section === group.label ? null : group.label)}
              >
                {group.label}
                <ChevronDown size={18} />
              </button>
              <div className="drawer__links">
                {group.items.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setDrawer(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="drawer__actions">
            <Link href="/post-property" className="btn btn--primary" onClick={() => setDrawer(false)}>
              <Plus size={16} strokeWidth={2.4} /> Post property free
            </Link>
            {signedIn ? (
              <>
                <Link href="/account" className="btn btn--ghost" onClick={() => setDrawer(false)}>
                  My account
                </Link>
                <button type="button" className="btn btn--ghost" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn--ghost" onClick={() => setDrawer(false)}>
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
