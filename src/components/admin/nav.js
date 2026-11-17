import {
  LayoutDashboard, ClipboardCheck, Building2, MessageSquare, Users, BadgeCheck, Tags, MapPin, Newspaper, Lightbulb,
  LineChart, PlugZap, Megaphone, BellRing, Search, BarChart3, ScrollText, Settings,
} from "lucide-react";

// Admin navigation. `perm` must be in the signed-in admin's role permissions (see Settings → Roles).
export const ADMIN_NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    group: "Real estate",
    items: [
      { href: "/admin/approvals", label: "Property approvals", icon: ClipboardCheck, perm: "properties", badge: "pending" },
      { href: "/admin/properties", label: "Properties", icon: Building2, perm: "properties" },
      { href: "/admin/inquiries", label: "Inquiries & reports", icon: MessageSquare, perm: "properties", badge: "reports" },
      { href: "/admin/agents", label: "Agents & builders", icon: BadgeCheck, perm: "agents", badge: "agents" },
      { href: "/admin/categories", label: "Categories", icon: Tags, perm: "catalog" },
      { href: "/admin/locations", label: "Locations", icon: MapPin, perm: "catalog" },
    ],
  },
  {
    group: "Users",
    items: [{ href: "/admin/users", label: "User management", icon: Users, perm: "users" }],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/articles", label: "News & articles", icon: Newspaper, perm: "content" },
      { href: "/admin/tips", label: "Investment tips", icon: Lightbulb, perm: "content", badge: "compliance" },
    ],
  },
  {
    group: "Stock market",
    items: [
      { href: "/admin/market", label: "Market configuration", icon: LineChart, perm: "market" },
      { href: "/admin/providers", label: "API providers", icon: PlugZap, perm: "providers" },
    ],
  },
  {
    group: "Growth",
    items: [
      { href: "/admin/ads", label: "Advertisements", icon: Megaphone, perm: "ads" },
      { href: "/admin/push", label: "Push notifications", icon: BellRing, perm: "push" },
      { href: "/admin/seo", label: "SEO", icon: Search, perm: "seo" },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/reports", label: "Reports & analytics", icon: BarChart3, perm: "reports" },
      { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText, perm: "settings" },
      { href: "/admin/settings", label: "System settings", icon: Settings, perm: "settings" },
    ],
  },
];

export const ROLE_LABEL = { super_admin: "Super Admin", moderator: "Moderator", content_editor: "Content Editor", support: "Support" };
