"use client";

// Browser-side demo database for the UI prototype.
//
// The whole app (website + admin) reads and writes through this module, so the
// marketplace, account area and admin panel stay in sync: a listing posted on
// the site shows up in the admin approval queue, an approval makes it public, etc.
//
// State is seeded from src/mock and persisted to localStorage. When the backend
// exists, replace `actions` with calls to /api/v1/* and keep the same signatures.

import { useMemo, useSyncExternalStore } from "react";
import { PROPERTIES } from "@/mock/properties";
import { PROPERTY_CATEGORIES, AMENITIES, LOCATIONS } from "@/mock/catalog";
import { USERS, AGENTS, ADMINS, DEMO_ADMIN_PASSWORD, DEMO_OTP } from "@/mock/people";
import { ARTICLES, ARTICLE_CATEGORIES, ARTICLE_TAGS } from "@/mock/articles";
import {
  INQUIRIES, VISITS, REPORTS, NOTIFICATIONS, AUDIT_LOGS, ADS, PUSH_CAMPAIGNS, SEO_PAGES,
  API_PROVIDERS, MARKET_CONFIG, SETTINGS, ROLE_PERMISSIONS,
} from "@/mock/admin";

const KEY = "i2g-demo-db-v1";

export const SEED = Object.freeze({
  properties: PROPERTIES,
  propertyCategories: PROPERTY_CATEGORIES,
  amenities: AMENITIES,
  locations: LOCATIONS,
  users: USERS,
  agents: AGENTS,
  admins: ADMINS,
  articles: ARTICLES,
  articleCategories: ARTICLE_CATEGORIES,
  articleTags: ARTICLE_TAGS,
  inquiries: INQUIRIES,
  visits: VISITS,
  reports: REPORTS,
  notifications: NOTIFICATIONS,
  auditLogs: AUDIT_LOGS,
  ads: ADS,
  pushCampaigns: PUSH_CAMPAIGNS,
  seoPages: SEO_PAGES,
  providers: API_PROVIDERS,
  marketConfig: MARKET_CONFIG,
  settings: SETTINGS,
  rolePermissions: ROLE_PERMISSIONS,
  // Per-visitor state
  session: null, // { userId }
  adminSession: null, // { adminId }
  me: {
    wishlist: [],
    compare: [],
    recent: [],
    watchlist: ["RELIANCE", "HDFCBANK", "TCS", "DLF"],
    alerts: [{ id: "al1", symbol: "RELIANCE", condition: "above", price: 1420, active: true, createdAt: "2026-11-10T10:00:00+05:30" }],
    bookmarks: [],
    likes: [],
    prefs: { email: true, sms: true, push: true, whatsapp: false, leads: true, alerts: true, news: true, marketing: false },
  },
});

let state = SEED;
let loaded = false;
const listeners = new Set();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...SEED, ...JSON.parse(raw) };
  } catch {
    state = SEED;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

function getSnapshot() {
  load();
  return state;
}

const getServerSnapshot = () => SEED;

function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (e) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function getState() {
  load();
  return state;
}

export function setState(update) {
  load();
  const next = typeof update === "function" ? update(state) : update;
  state = { ...state, ...next };
  persist();
  listeners.forEach((l) => l());
}

export function resetDemoData() {
  state = SEED;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}

/** Subscribe to the store. `select` runs on every change; keep it cheap. */
export function useDb(select = (s) => s, deps = []) {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => select(s), [s, ...deps]);
}

/** True after the first client render — use to avoid hydration mismatches for per-visitor state. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/* ───────── Helpers ───────── */

const now = () => new Date().toISOString();
const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const upsert = (list, item) => (list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? { ...x, ...item } : x)) : [item, ...list]);
const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function audit(action, target, detail) {
  const s = getState();
  const admin = s.admins.find((a) => a.id === s.adminSession?.adminId);
  return {
    auditLogs: [
      { id: uid("lg"), actor: admin?.name ?? "System", actorRole: admin?.role ?? "system", action, target, detail, ip: "demo", createdAt: now() },
      ...s.auditLogs,
    ],
  };
}

function notify(userId, n) {
  if (!userId) return {};
  const s = getState();
  return { notifications: [{ id: uid("nt"), userId, read: false, createdAt: now(), ...n }, ...s.notifications] };
}

export function nextPropertyId(properties) {
  const max = properties.reduce((m, p) => Math.max(m, Number(p.id.split("-").pop()) || 0), 10000);
  return `I2G-PR-${max + 1}`;
}

/* ───────── Actions ───────── */

export const actions = {
  /* Visitor */
  toggleWishlist(id) {
    setState((s) => ({ me: { ...s.me, wishlist: toggle(s.me.wishlist, id) } }));
    return getState().me.wishlist.includes(id);
  },
  toggleCompare(id) {
    const s = getState();
    if (!s.me.compare.includes(id) && s.me.compare.length >= 4) return { ok: false, error: "You can compare up to 4 properties." };
    setState({ me: { ...s.me, compare: toggle(s.me.compare, id) } });
    return { ok: true, added: getState().me.compare.includes(id) };
  },
  clearCompare() {
    setState((s) => ({ me: { ...s.me, compare: [] } }));
  },
  viewProperty(id) {
    setState((s) => ({
      me: { ...s.me, recent: [id, ...s.me.recent.filter((x) => x !== id)].slice(0, 12) },
      properties: s.properties.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p)),
    }));
  },
  toggleWatch(symbol) {
    setState((s) => ({ me: { ...s.me, watchlist: toggle(s.me.watchlist, symbol) } }));
    return getState().me.watchlist.includes(symbol);
  },
  addAlert({ symbol, condition, price }) {
    setState((s) => ({
      me: { ...s.me, alerts: [{ id: uid("al"), symbol, condition, price: Number(price), active: true, createdAt: now() }, ...s.me.alerts] },
    }));
  },
  updateAlert(id, patch) {
    setState((s) => ({ me: { ...s.me, alerts: s.me.alerts.map((a) => (a.id === id ? { ...a, ...patch } : a)) } }));
  },
  removeAlert(id) {
    setState((s) => ({ me: { ...s.me, alerts: s.me.alerts.filter((a) => a.id !== id) } }));
  },
  toggleBookmark(id) {
    setState((s) => ({ me: { ...s.me, bookmarks: toggle(s.me.bookmarks, id) } }));
    return getState().me.bookmarks.includes(id);
  },
  toggleLike(id) {
    const s = getState();
    const liked = s.me.likes.includes(id);
    setState({
      me: { ...s.me, likes: toggle(s.me.likes, id) },
      articles: s.articles.map((a) => (a.id === id ? { ...a, likes: Math.max(0, a.likes + (liked ? -1 : 1)) } : a)),
    });
    return !liked;
  },
  setPrefs(prefs) {
    setState((s) => ({ me: { ...s.me, prefs: { ...s.me.prefs, ...prefs } } }));
  },

  /* Auth (demo: OTP is always DEMO_OTP) */
  requestOtp(phone) {
    if (!/^(\+?91)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) return { ok: false, error: "Enter a valid 10-digit mobile number." };
    return { ok: true, demoOtp: DEMO_OTP };
  },
  verifyOtp(phone, otp) {
    if (otp !== DEMO_OTP) return { ok: false, error: "That code is incorrect." };
    const digits = phone.replace(/\D/g, "").slice(-10);
    const s = getState();
    let user = s.users.find((u) => u.phone.endsWith(digits));
    if (!user) {
      user = { id: uid("u"), name: "New user", email: "", phone: `+91${digits}`, role: "buyer", city: "", status: "active", emailVerified: false, phoneVerified: true, joinedAt: now(), lastActiveAt: now(), avatar: null };
      setState({ users: [user, ...s.users] });
    }
    setState({ session: { userId: user.id } });
    return { ok: true, user, isNew: user.name === "New user" };
  },
  loginEmail(email, password) {
    const s = getState();
    const user = s.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || password.length < 6) return { ok: false, error: "Email or password is incorrect." };
    if (user.status === "suspended") return { ok: false, error: "This account is suspended. Contact support." };
    setState({ session: { userId: user.id } });
    return { ok: true, user };
  },
  loginDemo(userId = "u1") {
    setState({ session: { userId } });
  },
  signup({ name, email, phone, role, city }) {
    const s = getState();
    if (s.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: "An account with this email already exists." };
    const user = { id: uid("u"), name, email, phone: `+91${phone.replace(/\D/g, "").slice(-10)}`, role, city, status: ["agent", "builder", "agency"].includes(role) ? "pending" : "active", emailVerified: false, phoneVerified: true, joinedAt: now(), lastActiveAt: now(), avatar: null };
    const extra = ["agent", "builder", "agency"].includes(role)
      ? { agents: [{ id: uid("a"), userId: user.id, name, company: name, type: role, city, rera: "", phone: user.phone, email, verified: false, status: "pending", rating: null, deals: 0, joinedAt: now(), kyc: "submitted" }, ...s.agents] }
      : {};
    setState({ users: [user, ...s.users], session: { userId: user.id }, ...extra });
    return { ok: true, user };
  },
  updateProfile(patch) {
    const s = getState();
    const id = s.session?.userId;
    if (!id) return;
    setState({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
  },
  logout() {
    setState({ session: null });
  },

  /* Listings */
  saveProperty(data, { submit }) {
    const s = getState();
    const ownerId = s.session?.userId;
    const owner = s.users.find((u) => u.id === ownerId);
    const existing = data.id && s.properties.find((p) => p.id === data.id);
    const status = submit ? (s.settings.requireListingApproval ? "pending" : "active") : "draft";
    const property = {
      ...(existing || {
        ownerId,
        postedBy: { name: owner?.name ?? "Owner", role: owner?.role ?? "owner", phone: owner?.phone ?? "", verified: false },
        postedAt: now(),
        views: 0,
        verified: false,
        featured: false,
        deletedAt: null,
      }),
      ...data,
      id: existing?.id ?? nextPropertyId(s.properties),
      status: existing && !submit ? existing.status : status,
      updatedAt: now(),
    };
    setState({ properties: upsert(s.properties, property) });
    return property;
  },
  setPropertyStatus(id, status) {
    setState((s) => ({ properties: s.properties.map((p) => (p.id === id ? { ...p, status, updatedAt: now() } : p)) }));
  },
  deleteProperty(id) {
    setState((s) => ({ properties: s.properties.map((p) => (p.id === id ? { ...p, deletedAt: now() } : p)) }));
  },
  sendInquiry({ propertyId, name, phone, email, message }) {
    const s = getState();
    const p = s.properties.find((x) => x.id === propertyId);
    setState({
      inquiries: [{ id: uid("iq"), propertyId, ownerId: p?.ownerId, name, phone, email, message, type: "inquiry", status: "new", createdAt: now() }, ...s.inquiries],
      ...notify(p?.ownerId, { title: `New inquiry on ${p?.title}`, body: `${name}: ${message.slice(0, 80)}`, link: "/account/leads", kind: "lead" }),
    });
  },
  requestVisit({ propertyId, name, phone, date, slot }) {
    const s = getState();
    const p = s.properties.find((x) => x.id === propertyId);
    setState({
      visits: [{ id: uid("sv"), propertyId, ownerId: p?.ownerId, name, phone, date, slot, status: "requested", createdAt: now() }, ...s.visits],
      ...notify(p?.ownerId, { title: "Site visit request", body: `${name} wants to visit on ${date}, ${slot}.`, link: "/account/leads", kind: "visit" }),
    });
  },
  setInquiryStatus(id, status) {
    setState((s) => ({ inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, status } : i)) }));
  },
  setVisitStatus(id, status) {
    setState((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, status } : v)) }));
  },
  reportListing({ propertyId, reason, details }) {
    const s = getState();
    const reporter = s.users.find((u) => u.id === s.session?.userId)?.name ?? "Guest";
    setState({ reports: [{ id: uid("rp"), propertyId, reason, details, reporter, status: "open", createdAt: now() }, ...s.reports] });
  },

  /* Notifications */
  markRead(id) {
    setState((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  },
  markAllRead(userId) {
    setState((s) => ({ notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)) }));
  },

  /* Admin */
  adminLogin(email, password) {
    const s = getState();
    const admin = s.admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!admin || password !== DEMO_ADMIN_PASSWORD) return { ok: false, error: "Invalid email or password." };
    if (admin.status !== "active") return { ok: false, error: "This admin account is disabled." };
    setState({ adminSession: { adminId: admin.id }, admins: s.admins.map((a) => (a.id === admin.id ? { ...a, lastLoginAt: now() } : a)) });
    setState(audit("admin.login", admin.id, "Signed in"));
    return { ok: true, admin };
  },
  adminLogout() {
    setState(audit("admin.logout", getState().adminSession?.adminId, "Signed out"));
    setState({ adminSession: null });
  },
  /** Write an audit-log entry for a change made with setState directly. */
  log(action, target, detail) {
    setState(audit(action, target, detail));
  },
  /** Generic create/update for any admin-managed collection. */
  adminSave(collection, item, label) {
    const s = getState();
    const isNew = !item.id;
    const record = isNew ? { ...item, id: uid(collection.slice(0, 2)), createdAt: now() } : { ...item, updatedAt: now() };
    setState({ [collection]: upsert(s[collection], record) });
    setState(audit(`${collection}.${isNew ? "create" : "update"}`, record.id, label ?? (isNew ? "Created" : "Updated")));
    return record;
  },
  adminRemove(collection, id, { soft = false, label } = {}) {
    const s = getState();
    setState({
      [collection]: soft ? s[collection].map((x) => (x.id === id ? { ...x, deletedAt: now() } : x)) : s[collection].filter((x) => x.id !== id),
    });
    setState(audit(`${collection}.delete`, id, label ?? (soft ? "Moved to trash" : "Deleted")));
  },
  adminRestore(collection, id) {
    setState((s) => ({ [collection]: s[collection].map((x) => (x.id === id ? { ...x, deletedAt: null } : x)) }));
    setState(audit(`${collection}.restore`, id, "Restored"));
  },
  moderateProperty(id, decision, reason = "") {
    const s = getState();
    const p = s.properties.find((x) => x.id === id);
    if (!p) return;
    const patch = decision === "approve" ? { status: "active", rejectionReason: null } : { status: "rejected", rejectionReason: reason };
    setState({
      properties: s.properties.map((x) => (x.id === id ? { ...x, ...patch, moderatedAt: now() } : x)),
      ...notify(p.ownerId, {
        title: decision === "approve" ? "Listing approved" : "Listing needs changes",
        body: decision === "approve" ? `${p.title} is now live.` : `${p.title}: ${reason}`,
        link: "/account/properties",
        kind: "listing",
      }),
    });
    setState(audit(`property.${decision}`, id, decision === "approve" ? "Approved listing" : `Rejected: ${reason}`));
  },
  updateConfig(key, patch, label) {
    setState((s) => ({ [key]: { ...s[key], ...patch } }));
    setState(audit(`${key}.update`, key, label ?? "Updated settings"));
  },
  setRolePermissions(role, perms) {
    setState((s) => ({ rolePermissions: { ...s.rolePermissions, [role]: perms } }));
    setState(audit("roles.update", role, `Permissions: ${perms.join(", ") || "none"}`));
  },
  sendPush(campaign) {
    const s = getState();
    const scheduled = Boolean(campaign.scheduledAt);
    const record = {
      ...campaign,
      id: uid("pc"),
      status: scheduled ? "scheduled" : "sent",
      sentAt: scheduled ? null : now(),
      delivered: scheduled ? 0 : Math.round(s.users.length * 2900 * (campaign.platforms.length / 3)),
      opened: 0,
    };
    setState({ pushCampaigns: [record, ...s.pushCampaigns] });
    setState(audit("push.send", record.id, scheduled ? `Scheduled: ${campaign.title}` : `Sent: ${campaign.title}`));
    return record;
  },
};

/* ───────── Selectors ───────── */

export const selectMe = (s) => (s.session ? s.users.find((u) => u.id === s.session.userId) ?? null : null);
export const selectAdmin = (s) => (s.adminSession ? s.admins.find((a) => a.id === s.adminSession.adminId) ?? null : null);
export const isPublic = (p) => p.status === "active" && !p.deletedAt;
export const canAdmin = (s, perm) => {
  const admin = selectAdmin(s);
  return Boolean(admin && (s.rolePermissions[admin.role] ?? []).includes(perm));
};
