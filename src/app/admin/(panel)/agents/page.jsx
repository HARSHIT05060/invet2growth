"use client";

import { useState } from "react";
import { Pencil, ShieldCheck, ShieldX, Ban, CheckCircle2, Plus, Star } from "lucide-react";
import { useDb, actions, getState } from "@/lib/db/store";
import { PageHeader, DataTable, FilterSelect, RowActions } from "@/components/admin/ui";
import { Status, Field } from "@/components/ui/bits";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { date } from "@/lib/format";
import { CITIES } from "@/data/catalog";

const TYPES = [
  ["", "All"],
  ["agent", "Agents"],
  ["builder", "Builders / developers"],
  ["agency", "Agencies"],
];
const KYC_TONE = { approved: "good", submitted: "warn", rejected: "bad" };
const STATUS_TONE = { active: "good", pending: "warn", suspended: "bad" };

export default function AgentsPage() {
  const agents = useDb((s) => s.agents);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [edit, setEdit] = useState(null);

  const rows = agents.filter((a) => (!type || a.type === type) && (!status || a.status === status));

  function setKyc(a, decision) {
    const approved = decision === "approved";
    actions.adminSave("agents", { ...a, kyc: decision, verified: approved, status: approved ? "active" : "pending" }, approved ? "KYC approved" : "KYC rejected");
    if (a.userId) {
      const u = getState().users.find((x) => x.id === a.userId);
      if (u) actions.adminSave("users", { ...u, status: approved ? "active" : "pending" }, approved ? "Professional verified" : "Professional verification rejected");
    }
    toast(approved ? `${a.name} verified` : `${a.name}'s KYC rejected`);
  }

  return (
    <>
      <PageHeader
        title="Agents & builders"
        description="Verify RERA registrations and KYC for professional accounts."
        actions={
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setEdit({})}>
            <Plus size={16} /> Add professional
          </button>
        }
      />
      <div className="tabs mb-16">
        {TYPES.map(([id, l]) => (
          <button key={id || "all"} type="button" className={type === id ? "is-active" : ""} onClick={() => setType(id)}>
            {l} <span>{agents.filter((a) => !id || a.type === id).length}</span>
          </button>
        ))}
      </div>
      <section className="panel">
        <DataTable
          rows={rows}
          searchKeys={["name", "company", "city", "rera", "email"]}
          searchPlaceholder="Search name, company, RERA or city"
          exportName="agents.csv"
          filters={<FilterSelect label="Status" value={status} onChange={setStatus} options={[["", "All statuses"], ["active", "Active"], ["pending", "Pending"], ["suspended", "Suspended"]]} />}
          columns={[
            {
              key: "name",
              label: "Name",
              render: (a) => (
                <span className="cell-stack">
                  <strong>{a.name}</strong>
                  <small>{a.company}</small>
                </span>
              ),
            },
            { key: "type", label: "Type", render: (a) => ({ agent: "Agent", builder: "Builder", agency: "Agency" })[a.type] },
            { key: "city", label: "City" },
            { key: "rera", label: "RERA no.", render: (a) => (a.rera ? <code className="code">{a.rera}</code> : <span className="muted">Not provided</span>) },
            { key: "kyc", label: "KYC", render: (a) => <Status tone={KYC_TONE[a.kyc]}>{a.kyc}</Status> },
            { key: "rating", label: "Rating", className: "r", sort: (a) => a.rating ?? 0, render: (a) => (a.rating ? <span className="nowrap"><Star size={13} className="star-ico" /> {a.rating}</span> : "—") },
            { key: "deals", label: "Deals", className: "r" },
            { key: "status", label: "Status", render: (a) => <Status tone={STATUS_TONE[a.status]}>{a.status}</Status> },
            { key: "joinedAt", label: "Joined", sort: (a) => Date.parse(a.joinedAt), render: (a) => <span className="small nowrap">{date(a.joinedAt)}</span> },
            {
              key: "actions",
              label: "",
              sort: false,
              render: (a) => (
                <RowActions>
                  {a.kyc !== "approved" && (
                    <>
                      <button type="button" className="icon-btn icon-btn--sm" title="Approve KYC" aria-label="Approve KYC" onClick={() => setKyc(a, "approved")}>
                        <ShieldCheck size={15} />
                      </button>
                      {a.kyc !== "rejected" && (
                        <button type="button" className="icon-btn icon-btn--sm" title="Reject KYC" aria-label="Reject KYC" onClick={() => setKyc(a, "rejected")}>
                          <ShieldX size={15} />
                        </button>
                      )}
                    </>
                  )}
                  {a.status === "suspended" ? (
                    <button type="button" className="icon-btn icon-btn--sm" title="Reactivate" aria-label="Reactivate" onClick={() => { actions.adminSave("agents", { ...a, status: "active" }, "Reactivated"); toast("Reactivated"); }}>
                      <CheckCircle2 size={15} />
                    </button>
                  ) : (
                    a.status === "active" && (
                      <button type="button" className="icon-btn icon-btn--sm" title="Suspend" aria-label="Suspend" onClick={() => { actions.adminSave("agents", { ...a, status: "suspended" }, "Suspended"); toast("Suspended"); }}>
                        <Ban size={15} />
                      </button>
                    )
                  )}
                  <button type="button" className="icon-btn icon-btn--sm" title="Edit" aria-label="Edit" onClick={() => setEdit(a)}>
                    <Pencil size={15} />
                  </button>
                </RowActions>
              ),
            },
          ]}
          empty="No professionals found"
        />
      </section>
      {edit && <AgentForm a={edit} onClose={() => setEdit(null)} />}
    </>
  );
}

function AgentForm({ a, onClose }) {
  const isNew = !a.id;
  const [err, setErr] = useState("");
  function submit(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    if (!d.name.trim() || !d.city) return setErr("Name and city are required.");
    actions.adminSave(
      "agents",
      isNew ? { ...d, userId: null, verified: false, status: "pending", rating: null, deals: 0, joinedAt: new Date().toISOString(), kyc: "submitted" } : { ...a, ...d },
      isNew ? `Added ${d.name}` : `Edited ${d.name}`
    );
    toast("Saved");
    onClose();
  }
  return (
    <Modal open side onClose={onClose} title={isNew ? "Add professional" : `Edit ${a.name}`}>
      <form className="form-stack" onSubmit={submit}>
        <div className="form-grid">
          <Field label="Name">
            <input className="input" name="name" defaultValue={a.name} />
          </Field>
          <Field label="Company">
            <input className="input" name="company" defaultValue={a.company} />
          </Field>
          <Field label="Type">
            <select className="input" name="type" defaultValue={a.type ?? "agent"}>
              <option value="agent">Agent</option>
              <option value="builder">Builder / developer</option>
              <option value="agency">Agency</option>
            </select>
          </Field>
          <Field label="City">
            <select className="input" name="city" defaultValue={a.city ?? ""}>
              <option value="">Select</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="RERA registration no.">
            <input className="input" name="rera" defaultValue={a.rera} />
          </Field>
          <Field label="Phone">
            <input className="input" name="phone" defaultValue={a.phone} />
          </Field>
          <Field label="Email" className="span-2">
            <input className="input" name="email" type="email" defaultValue={a.email} />
          </Field>
        </div>
        {err && <p className="f__error">{err}</p>}
        <div className="row-wrap">
          <button type="submit" className="btn btn--primary btn--sm">
            Save
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
