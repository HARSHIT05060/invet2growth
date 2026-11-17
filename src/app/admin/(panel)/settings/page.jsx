"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, RotateCcw, Ban, CheckCircle2 } from "lucide-react";
import { useDb, actions, selectAdmin, resetDemoData } from "@/lib/db/store";
import { ADMIN_ROLES, PERMISSIONS } from "@/mock/admin";
import { PageHeader, DataTable, RowActions } from "@/components/admin/ui";
import { Field, Toggle, Status } from "@/components/ui/bits";
import Modal, { Confirm } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { dateTime } from "@/lib/format";
import { ROLE_LABEL } from "@/components/admin/nav";

const TABS = [
  ["general", "General"],
  ["listings", "Listings & moderation"],
  ["security", "Security & auth"],
  ["roles", "Roles & permissions"],
  ["admins", "Admin users"],
  ["data", "Data & privacy"],
];

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const settings = useDb((s) => s.settings);
  const [d, setD] = useState(settings);
  useEffect(() => setD(settings), [settings]);
  const set = (x) => setD((o) => ({ ...o, ...x }));
  const dirty = JSON.stringify(d) !== JSON.stringify(settings);

  function save() {
    if (!/^\S+@\S+\.\S+$/.test(d.supportEmail)) return toast("Enter a valid support email", "error");
    actions.updateConfig("settings", d, `Updated ${TABS.find((t) => t[0] === tab)[1]} settings`);
    toast("Settings saved");
  }

  return (
    <>
      <PageHeader title="System settings" description="Platform-wide configuration. Changes take effect immediately and are audit-logged." />
      <div className="tabs mb-16">
        {TABS.map(([id, l]) => (
          <button key={id} type="button" className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
            {l}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <section className="panel form-stack">
          <div className="form-grid">
            <Field label="Site name">
              <input className="input" value={d.siteName} onChange={(e) => set({ siteName: e.target.value })} />
            </Field>
            <Field label="Support email">
              <input className="input" type="email" value={d.supportEmail} onChange={(e) => set({ supportEmail: e.target.value })} />
            </Field>
            <Field label="Support phone">
              <input className="input" value={d.supportPhone} onChange={(e) => set({ supportPhone: e.target.value })} />
            </Field>
          </div>
          <Field label="Market data disclaimer" hint="Shown on every market screen">
            <textarea className="input" rows={2} value={d.marketDisclaimer} onChange={(e) => set({ marketDisclaimer: e.target.value })} />
          </Field>
          <Field label="Content disclaimer" hint="Shown on advice-like articles (SEBI)">
            <textarea className="input" rows={2} value={d.contentDisclaimer} onChange={(e) => set({ contentDisclaimer: e.target.value })} />
          </Field>
          <Toggle label="Maintenance mode" description="Shows a maintenance page to visitors. Admin stays available." checked={d.maintenanceMode} onChange={(v) => set({ maintenanceMode: v })} />
        </section>
      )}

      {tab === "listings" && (
        <section className="panel form-stack">
          <Toggle label="Require approval for new listings" description="Listings go to the approval queue before they're public" checked={d.requireListingApproval} onChange={(v) => set({ requireListingApproval: v })} />
          <Toggle label="Auto-verify listings from verified builders" description="Skip moderation for builders with approved KYC" checked={d.autoVerifyBuilders} onChange={(v) => set({ autoVerifyBuilders: v })} />
          <div className="form-grid">
            <Field label="Max photos per listing">
              <input className="input" type="number" min="1" max="50" value={d.maxImagesPerListing} onChange={(e) => set({ maxImagesPerListing: Number(e.target.value) })} />
            </Field>
            <Field label="Max upload size (MB)" hint="Images are virus-scanned and re-encoded on upload">
              <input className="input" type="number" min="1" max="50" value={d.maxUploadMb} onChange={(e) => set({ maxUploadMb: Number(e.target.value) })} />
            </Field>
          </div>
        </section>
      )}

      {tab === "security" && (
        <section className="panel form-stack">
          <div className="form-grid form-grid--3">
            <Field label="OTP length">
              <select className="input" value={d.otpLength} onChange={(e) => set({ otpLength: Number(e.target.value) })}>
                <option value={4}>4 digits</option>
                <option value={6}>6 digits</option>
              </select>
            </Field>
            <Field label="OTP expiry (minutes)">
              <input className="input" type="number" min="1" max="15" value={d.otpExpiryMinutes} onChange={(e) => set({ otpExpiryMinutes: Number(e.target.value) })} />
            </Field>
            <Field label="Refresh token lifetime (hours)" hint="Access tokens expire after 15 minutes">
              <input className="input" type="number" min="1" value={d.sessionHours} onChange={(e) => set({ sessionHours: Number(e.target.value) })} />
            </Field>
          </div>
          <Toggle label="Require 2FA for admin accounts" checked={d.admin2fa ?? true} onChange={(v) => set({ admin2fa: v })} />
          <Toggle label="Allow Google sign-in" checked={d.googleLogin ?? true} onChange={(v) => set({ googleLogin: v })} />
          <Toggle label="Rate-limit OTP requests" description="Max 5 requests per number per hour" checked={d.otpRateLimit ?? true} onChange={(v) => set({ otpRateLimit: v })} />
        </section>
      )}

      {["general", "listings", "security"].includes(tab) && (
        <div className="row-wrap mt-16">
          <button type="button" className="btn btn--primary btn--sm" onClick={save} disabled={!dirty}>
            Save settings
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setD(settings)} disabled={!dirty}>
            Discard
          </button>
        </div>
      )}

      {tab === "roles" && <Roles />}
      {tab === "admins" && <Admins />}
      {tab === "data" && <DataTab />}
    </>
  );
}

function Roles() {
  const rp = useDb((s) => s.rolePermissions);
  const me = useDb(selectAdmin);
  const isSuper = me.role === "super_admin";
  return (
    <section className="panel">
      <p className="muted mb-16">
        {isSuper ? "Tick a box to grant a permission. Super Admin always has every permission." : "Only a Super Admin can change permissions."}
      </p>
      <div className="table-wrap">
        <table className="dtable perm-table">
          <thead>
            <tr>
              <th>Permission</th>
              {ADMIN_ROLES.map((r) => (
                <th key={r.id} className="center">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((p) => (
              <tr key={p.id}>
                <th scope="row">{p.label}</th>
                {ADMIN_ROLES.map((r) => {
                  const on = (rp[r.id] ?? []).includes(p.id);
                  const locked = r.id === "super_admin" || !isSuper || (p.id === "providers" && r.id !== "super_admin");
                  return (
                    <td key={r.id} className="center">
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={locked}
                        aria-label={`${r.label}: ${p.label}`}
                        title={p.id === "providers" && r.id !== "super_admin" ? "Provider credentials are Super Admin only" : undefined}
                        onChange={(e) => {
                          const cur = rp[r.id] ?? [];
                          actions.setRolePermissions(r.id, e.target.checked ? [...cur, p.id] : cur.filter((x) => x !== p.id));
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Admins() {
  const admins = useDb((s) => s.admins);
  const me = useDb(selectAdmin);
  const [add, setAdd] = useState(false);
  const isSuper = me.role === "super_admin";
  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Admin users</h2>
        {isSuper && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setAdd(true)}>
            <UserPlus size={15} /> Invite admin
          </button>
        )}
      </div>
      <DataTable
        rows={admins}
        searchKeys={["name", "email"]}
        columns={[
          { key: "name", label: "Name", render: (a) => <span className="cell-stack"><strong>{a.name}{a.id === me.id && " (you)"}</strong><small>{a.email}</small></span> },
          { key: "role", label: "Role", render: (a) => ROLE_LABEL[a.role] ?? a.role },
          { key: "status", label: "Status", render: (a) => <Status tone={a.status === "active" ? "good" : a.status === "invited" ? "info" : "neutral"}>{a.status}</Status> },
          { key: "lastLoginAt", label: "Last sign-in", sort: (a) => Date.parse(a.lastLoginAt ?? 0), render: (a) => <span className="small">{a.lastLoginAt ? dateTime(a.lastLoginAt) : "Never"}</span> },
          {
            key: "actions",
            label: "",
            sort: false,
            render: (a) =>
              isSuper &&
              a.id !== me.id && (
                <RowActions>
                  <select
                    className="input input--sm"
                    value={a.role}
                    aria-label={`Role for ${a.name}`}
                    onChange={(e) => {
                      actions.adminSave("admins", { ...a, role: e.target.value }, `Role changed to ${e.target.value}`);
                      toast("Role updated");
                    }}
                  >
                    {ADMIN_ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  {a.status === "disabled" ? (
                    <button type="button" className="icon-btn icon-btn--sm" title="Enable" aria-label="Enable" onClick={() => actions.adminSave("admins", { ...a, status: "active" }, "Enabled admin")}>
                      <CheckCircle2 size={15} />
                    </button>
                  ) : (
                    <button type="button" className="icon-btn icon-btn--sm" title="Disable" aria-label="Disable" onClick={() => actions.adminSave("admins", { ...a, status: "disabled" }, "Disabled admin")}>
                      <Ban size={15} />
                    </button>
                  )}
                </RowActions>
              ),
          },
        ]}
      />
      {add && (
        <Modal open size="sm" title="Invite admin" onClose={() => setAdd(false)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const d = Object.fromEntries(new FormData(e.currentTarget));
              if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) return toast("Name and a valid email are required", "error");
              if (admins.some((a) => a.email === d.email)) return toast("That email is already an admin", "error");
              actions.adminSave("admins", { ...d, status: "invited", lastLoginAt: null }, `Invited ${d.email}`);
              toast(`Invitation sent to ${d.email}`);
              setAdd(false);
            }}
          >
            <Field label="Name">
              <input className="input" name="name" autoFocus />
            </Field>
            <Field label="Work email">
              <input className="input" name="email" type="email" />
            </Field>
            <Field label="Role">
              <select className="input" name="role" defaultValue="moderator">
                {ADMIN_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
            <button type="submit" className="btn btn--primary btn--sm">
              Send invitation
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}

function DataTab() {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="adm-grid adm-grid--2">
      <section className="panel form-stack">
        <h2 className="panel__title">Retention & privacy (DPDP Act)</h2>
        <ul className="policy-list">
          <li>Deleted accounts are soft-deleted and permanently erased after 30 days.</li>
          <li>Inquiry contact details are shared only with the relevant lister.</li>
          <li>Audit logs are retained for 1 year; database backups daily with 30-day retention.</li>
          <li>Users can export their data from Account → Settings & privacy.</li>
        </ul>
      </section>
      <section className="panel form-stack">
        <h2 className="panel__title">Demo data</h2>
        <p className="muted">This prototype stores data in your browser. Reset it to restore the original sample data. This also signs you out.</p>
        <div>
          <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => setConfirm(true)}>
            <RotateCcw size={15} /> Reset demo data
          </button>
        </div>
      </section>
      <Confirm
        open={confirm}
        onClose={() => setConfirm(false)}
        danger
        title="Reset all demo data?"
        message="Every change made in this browser (listings, users, articles, settings) will be discarded."
        confirmLabel="Reset"
        onConfirm={() => {
          resetDemoData();
          router.replace("/admin/login");
        }}
      />
    </div>
  );
}
