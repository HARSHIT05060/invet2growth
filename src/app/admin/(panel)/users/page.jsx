"use client";

import { useState } from "react";
import { Pencil, Ban, CheckCircle2, Trash2, UserPlus, BadgeCheck, RotateCcw } from "lucide-react";
import { useDb, actions, getState } from "@/lib/db/store";
import { USER_ROLES } from "@/mock/people";
import { PageHeader, DataTable, FilterSelect, RowActions } from "@/components/admin/ui";
import { Status, Field } from "@/components/ui/bits";
import Modal, { Confirm } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { date, initials, ago, num } from "@/lib/format";
import { CITIES } from "@/data/catalog";

const STATUS_TONE = { active: "good", suspended: "bad", pending: "warn", deleted: "neutral" };
const roleLabel = (r) => USER_ROLES.find((x) => x.id === r)?.label ?? r;

export default function UsersPage() {
  const users = useDb((s) => s.users);
  const listingCount = useDb((s) => s.properties.reduce((a, p) => ((a[p.ownerId] = (a[p.ownerId] || 0) + (p.deletedAt ? 0 : 1)), a), {}));
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);

  const rows = users.filter((u) => (status === "deleted" ? u.deletedAt : !u.deletedAt) && (!role || u.role === role) && (!status || status === "deleted" || u.status === status));

  const setStatusFor = (ids, st) => {
    ids.forEach((id) => {
      const u = getState().users.find((x) => x.id === id);
      actions.adminSave("users", { ...u, status: st }, st === "suspended" ? "Suspended user" : "Activated user");
    });
    toast(`${ids.length} user${ids.length > 1 ? "s" : ""} ${st === "suspended" ? "suspended" : "activated"}`);
  };

  return (
    <>
      <PageHeader
        title="User management"
        description={`${num(users.filter((u) => !u.deletedAt).length)} registered users`}
        actions={
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setEdit({})}>
            <UserPlus size={16} /> Add user
          </button>
        }
      />
      <div className="chips mb-16">
        {[["", "All"], ...USER_ROLES.map((r) => [r.id, r.label])].map(([id, l]) => (
          <button key={id || "all"} type="button" className={`chip chip--sm${role === id ? " is-active" : ""}`} onClick={() => setRole(id)}>
            {l} <span className="muted">· {users.filter((u) => !u.deletedAt && (!id || u.role === id)).length}</span>
          </button>
        ))}
      </div>
      <section className="panel">
        <DataTable
          rows={rows}
          searchKeys={["name", "email", "phone", "city"]}
          searchPlaceholder="Search name, email, phone or city"
          exportName="users.csv"
          exportRow={(u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, city: u.city, status: u.status, joinedAt: u.joinedAt })}
          filters={<FilterSelect label="Status" value={status} onChange={setStatus} options={[["", "All statuses"], ["active", "Active"], ["pending", "Pending verification"], ["suspended", "Suspended"], ["deleted", "Deleted"]]} />}
          bulk={
            status === "deleted"
              ? [{ label: "Restore", onClick: (ids) => ids.forEach((id) => actions.adminRestore("users", id)) }]
              : [
                  { label: "Activate", onClick: (ids) => setStatusFor(ids, "active") },
                  { label: "Suspend", danger: true, onClick: (ids) => setStatusFor(ids, "suspended") },
                ]
          }
          columns={[
            {
              key: "name",
              label: "User",
              render: (u) => (
                <div className="cell-user">
                  {u.avatar ? <img src={u.avatar} alt="" className="avatar avatar--sm" /> : <span className="avatar avatar--sm">{initials(u.name)}</span>}
                  <span>
                    <strong>{u.name}</strong>
                    <small>{u.email || "—"}</small>
                  </span>
                </div>
              ),
            },
            { key: "phone", label: "Mobile", render: (u) => <span className="num small">{u.phone}</span> },
            { key: "role", label: "Role", render: (u) => roleLabel(u.role) },
            { key: "city", label: "City", render: (u) => u.city || "—" },
            {
              key: "verified",
              label: "Verified",
              sort: (u) => Number(u.phoneVerified) + Number(u.emailVerified),
              render: (u) => (
                <span className="small">
                  <span className={u.phoneVerified ? "ok" : "muted"}>{u.phoneVerified ? "✓" : "✗"} Phone</span> · <span className={u.emailVerified ? "ok" : "muted"}>{u.emailVerified ? "✓" : "✗"} Email</span>
                </span>
              ),
            },
            { key: "listings", label: "Listings", className: "r", sort: (u) => listingCount[u.id] ?? 0, render: (u) => listingCount[u.id] ?? 0 },
            { key: "status", label: "Status", render: (u) => <Status tone={u.deletedAt ? "neutral" : STATUS_TONE[u.status]}>{u.deletedAt ? "Deleted" : u.status}</Status> },
            { key: "joinedAt", label: "Joined", sort: (u) => Date.parse(u.joinedAt), render: (u) => <span className="small nowrap">{date(u.joinedAt)}</span> },
            { key: "lastActiveAt", label: "Last active", sort: (u) => Date.parse(u.lastActiveAt), render: (u) => <span className="small nowrap muted">{ago(u.lastActiveAt)}</span> },
            {
              key: "actions",
              label: "",
              sort: false,
              render: (u) => (
                <RowActions>
                  {u.deletedAt ? (
                    <button type="button" className="icon-btn icon-btn--sm" title="Restore" aria-label="Restore" onClick={() => actions.adminRestore("users", u.id)}>
                      <RotateCcw size={15} />
                    </button>
                  ) : (
                    <>
                      <button type="button" className="icon-btn icon-btn--sm" title="Edit" aria-label="Edit" onClick={() => setEdit(u)}>
                        <Pencil size={15} />
                      </button>
                      {u.status === "suspended" ? (
                        <button type="button" className="icon-btn icon-btn--sm" title="Activate" aria-label="Activate" onClick={() => setStatusFor([u.id], "active")}>
                          <CheckCircle2 size={15} />
                        </button>
                      ) : (
                        <button type="button" className="icon-btn icon-btn--sm" title="Suspend" aria-label="Suspend" onClick={() => setStatusFor([u.id], "suspended")}>
                          <Ban size={15} />
                        </button>
                      )}
                      <button type="button" className="icon-btn icon-btn--sm" title="Delete" aria-label="Delete" onClick={() => setDel(u)}>
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </RowActions>
              ),
            },
          ]}
          empty="No users found"
        />
      </section>

      {edit && <UserForm u={edit} onClose={() => setEdit(null)} />}
      <Confirm
        open={!!del}
        onClose={() => setDel(null)}
        danger
        title={`Delete ${del?.name}?`}
        message="The account is deactivated and personal data is scheduled for erasure. Their listings are hidden. You can restore it within 30 days."
        confirmLabel="Delete user"
        onConfirm={() => {
          actions.adminRemove("users", del.id, { soft: true });
          getState().properties.filter((p) => p.ownerId === del.id).forEach((p) => actions.deleteProperty(p.id));
          toast("User deleted");
        }}
      />
    </>
  );
}

function UserForm({ u, onClose }) {
  const isNew = !u.id;
  const [errors, setErrors] = useState({});
  function submit(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const er = {};
    if (d.name.trim().length < 2) er.name = "Required";
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) er.email = "Invalid email";
    if (d.phone.replace(/\D/g, "").length < 10) er.phone = "10-digit number";
    if (isNew && getState().users.some((x) => x.email && x.email === d.email)) er.email = "Email already registered";
    setErrors(er);
    if (Object.keys(er).length) return;
    const phone = `+91${d.phone.replace(/\D/g, "").slice(-10)}`;
    actions.adminSave(
      "users",
      isNew
        ? { ...d, phone, emailVerified: false, phoneVerified: false, joinedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), avatar: null }
        : { ...u, ...d, phone, emailVerified: d.emailVerified === "on", phoneVerified: d.phoneVerified === "on" },
      isNew ? `Created user ${d.name}` : `Edited user ${d.name}`
    );
    toast(isNew ? "User created" : "User saved");
    onClose();
  }
  return (
    <Modal open side onClose={onClose} title={isNew ? "Add user" : `Edit ${u.name}`}>
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field label="Full name / company" error={errors.name}>
          <input className="input" name="name" defaultValue={u.name} />
        </Field>
        <div className="form-grid">
          <Field label="Email" error={errors.email}>
            <input className="input" name="email" type="email" defaultValue={u.email} />
          </Field>
          <Field label="Mobile" error={errors.phone}>
            <input className="input" name="phone" defaultValue={u.phone?.replace(/^\+91/, "")} />
          </Field>
          <Field label="Role">
            <select className="input" name="role" defaultValue={u.role ?? "buyer"}>
              {USER_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className="input" name="status" defaultValue={u.status ?? "active"}>
              <option value="active">Active</option>
              <option value="pending">Pending verification</option>
              <option value="suspended">Suspended</option>
            </select>
          </Field>
          <Field label="City">
            <select className="input" name="city" defaultValue={u.city ?? ""}>
              <option value="">—</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        {!isNew && (
          <div className="row-wrap">
            <label className="check">
              <input type="checkbox" name="phoneVerified" defaultChecked={u.phoneVerified} /> <span><BadgeCheck size={14} /> Phone verified</span>
            </label>
            <label className="check">
              <input type="checkbox" name="emailVerified" defaultChecked={u.emailVerified} /> <span><BadgeCheck size={14} /> Email verified</span>
            </label>
          </div>
        )}
        <div className="row-wrap">
          <button type="submit" className="btn btn--primary btn--sm">
            {isNew ? "Create user" : "Save changes"}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
