"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Plus } from "lucide-react";
import { NAV } from "@/data/site";

export default function Header() {
  const [open, setOpen] = useState(null); // desktop dropdown label
  const [drawer, setDrawer] = useState(false);
  const [section, setSection] = useState(null); // mobile accordion label
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Hide on scroll down, show on scroll up
      if (Math.abs(y - lastY) > 6) {
        const down = y > lastY && y > 240;
        setHidden(down);
        if (down) setOpen(null);
        lastY = y;
      }
    };
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
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
          <Link href="/login" className="header__login">
            Log in
          </Link>
          <Link href="/#post" className="btn btn--primary btn--sm">
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
            <Link href="/#post" className="btn btn--primary" onClick={() => setDrawer(false)}>
              <Plus size={16} strokeWidth={2.4} /> Post property free
            </Link>
            <Link href="/login" className="btn btn--ghost" onClick={() => setDrawer(false)}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
