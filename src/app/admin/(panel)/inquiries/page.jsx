"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, EyeOff, XCircle } from "lucide-react";
import { useDb, actions } from "@/lib/db/store";
import { PageHeader, DataTable, FilterSelect, RowActions } from "@/components/admin/ui";
import { Status } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";
import { dateTime, date } from "@/lib/format";

const LEAD_TONE = { new: "warn", contacted: "info", closed: "neutral" };
const VISIT_TONE = { requested: "warn", confirmed: "good", completed: "neutral", cancelled: "bad" };
const REPORT_TONE = { open: "warn", resolved: "good", dismissed: "neutral" };

export default function InquiriesPage() {
  const [tab, setTab] = useState("inquiries");
  const [status, setStatus] = useState("");
  const s = useDb();
  const prop = (id) => s.properties.find((p) => p.id === id);
  const propCell = (id) => (
    <Link href={`/properties/${id}`} target="_blank" className="cell-stack">
      <strong>{prop(id)?.title ?? id}</strong>
      <small>{id}</small>
    </Link>
  );

  const TABS = [
    ["inquiries", "Inquiries", s.inquiries.length],
    ["visits", "Site visits", s.visits.length],
    ["reports", "Reported listings", s.reports.filter((r) => r.status === "open").length],
  ];

  return (
    <>
      <PageHeader title="Inquiries & reports" description="Leads between buyers and listers, site visit requests and listing reports." />
      <div className="tabs mb-16">
        {TABS.map(([id, l, n]) => (
          <button key={id} type="button" className={tab === id ? "is-active" : ""} onClick={() => { setTab(id); setStatus(""); }}>
            {l} <span>{n}</span>
          </button>
        ))}
      </div>

      <section className="panel">
        {tab === "inquiries" && (
          <DataTable
            rows={s.inquiries.filter((i) => !status || i.status === status)}
            searchKeys={["name", "phone", "email", "message", "propertyId"]}
            searchPlaceholder="Search inquiries"
            exportName="inquiries.csv"
            filters={<FilterSelect label="Status" value={status} onChange={setStatus} options={[["", "All"], ["new", "New"], ["contacted", "Contacted"], ["closed", "Closed"]]} />}
            columns={[
              { key: "propertyId", label: "Property", render: (i) => propCell(i.propertyId) },
              { key: "name", label: "From", render: (i) => <span className="cell-stack"><strong>{i.name}</strong><small>{i.phone}</small></span> },
              { key: "message", label: "Message", sort: false, render: (i) => <span className="clamp-2 small">{i.message}</span> },
              { key: "owner", label: "Lister", sort: false, render: (i) => <span className="small">{prop(i.propertyId)?.postedBy?.name ?? "—"}</span> },
              { key: "status", label: "Status", render: (i) => <Status tone={LEAD_TONE[i.status]}>{i.status}</Status> },
              { key: "createdAt", label: "Received", sort: (i) => Date.parse(i.createdAt), render: (i) => <span className="small nowrap">{dateTime(i.createdAt)}</span> },
            ]}
            empty="No inquiries"
          />
        )}

        {tab === "visits" && (
          <DataTable
            rows={s.visits.filter((v) => !status || v.status === status)}
            searchKeys={["name", "phone", "propertyId"]}
            searchPlaceholder="Search visits"
            exportName="site-visits.csv"
            filters={<FilterSelect label="Status" value={status} onChange={setStatus} options={[["", "All"], ["requested", "Requested"], ["confirmed", "Confirmed"], ["completed", "Completed"], ["cancelled", "Cancelled"]]} />}
            columns={[
              { key: "propertyId", label: "Property", render: (v) => propCell(v.propertyId) },
              { key: "name", label: "Visitor", render: (v) => <span className="cell-stack"><strong>{v.name}</strong><small>{v.phone}</small></span> },
              { key: "date", label: "Date & slot", sort: (v) => v.date, render: (v) => <span className="small nowrap">{date(`${v.date}T12:00:00+05:30`)} · {v.slot}</span> },
              { key: "status", label: "Status", render: (v) => <Status tone={VISIT_TONE[v.status]}>{v.status}</Status> },
              { key: "createdAt", label: "Requested", sort: (v) => Date.parse(v.createdAt), render: (v) => <span className="small nowrap">{dateTime(v.createdAt)}</span> },
            ]}
            empty="No site visits"
          />
        )}

        {tab === "reports" && (
          <DataTable
            rows={s.reports.filter((r) => !status || r.status === status)}
            searchKeys={["reason", "details", "reporter", "propertyId"]}
            searchPlaceholder="Search reports"
            exportName="listing-reports.csv"
            filters={<FilterSelect label="Status" value={status} onChange={setStatus} options={[["", "All"], ["open", "Open"], ["resolved", "Resolved"], ["dismissed", "Dismissed"]]} />}
            columns={[
              { key: "propertyId", label: "Listing", render: (r) => propCell(r.propertyId) },
              { key: "reason", label: "Reason", render: (r) => <span className="cell-stack"><strong>{r.reason}</strong><small>{r.details || "No details"}</small></span> },
              { key: "reporter", label: "Reported by" },
              { key: "status", label: "Status", render: (r) => <Status tone={REPORT_TONE[r.status]}>{r.status}</Status> },
              { key: "createdAt", label: "Reported", sort: (r) => Date.parse(r.createdAt), render: (r) => <span className="small nowrap">{dateTime(r.createdAt)}</span> },
              {
                key: "actions",
                label: "",
                sort: false,
                render: (r) =>
                  r.status === "open" && (
                    <RowActions>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        title="Unpublish the listing and resolve"
                        onClick={() => {
                          actions.moderateProperty(r.propertyId, "reject", `Taken down after a report: ${r.reason}`);
                          actions.adminSave("reports", { ...r, status: "resolved" }, "Listing taken down");
                          toast("Listing taken down and report resolved");
                        }}
                      >
                        <EyeOff size={14} /> Take down
                      </button>
                      <button type="button" className="icon-btn icon-btn--sm" title="Mark resolved" aria-label="Mark resolved" onClick={() => { actions.adminSave("reports", { ...r, status: "resolved" }, "Report resolved"); toast("Report resolved"); }}>
                        <CheckCircle2 size={15} />
                      </button>
                      <button type="button" className="icon-btn icon-btn--sm" title="Dismiss" aria-label="Dismiss" onClick={() => { actions.adminSave("reports", { ...r, status: "dismissed" }, "Report dismissed"); toast("Report dismissed"); }}>
                        <XCircle size={15} />
                      </button>
                    </RowActions>
                  ),
              },
            ]}
            empty="No reports"
          />
        )}
      </section>
    </>
  );
}
