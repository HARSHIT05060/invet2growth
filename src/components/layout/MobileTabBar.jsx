"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, LineChart, Newspaper, User } from "lucide-react";

// Same five destinations as the planned mobile app's bottom navigation.
const TABS = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { href: "/properties", label: "Properties", icon: Building2, match: (p) => p.startsWith("/properties") || p.startsWith("/compare") || p.startsWith("/post-property") },
  { href: "/market", label: "Market", icon: LineChart, match: (p) => p.startsWith("/market") },
  { href: "/news", label: "News", icon: Newspaper, match: (p) => p.startsWith("/news") },
  { href: "/account", label: "Profile", icon: User, match: (p) => p.startsWith("/account") || p.startsWith("/login") || p.startsWith("/notifications") },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar" aria-label="Quick navigation">
      {TABS.map(({ href, label, icon: Icon, match }) => (
        <Link key={href} href={href} className={match(pathname) ? "is-active" : ""} aria-current={match(pathname) ? "page" : undefined}>
          <Icon size={21} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
