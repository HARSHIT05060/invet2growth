"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Phone, MessageCircle, Mail, MessageSquare, CalendarDays } from "lucide-react";
import { useDb, selectMe, actions } from "@/lib/db/store";
import { dateTime, date } from "@/lib/format";
import { Status, Empty } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";

const LEAD_TONE = { new: "warn", contacted: "info", closed: "neutral" };
const VISIT_TONE = { requested: "warn", confirmed: "good", completed: "neutral", cancelled: "bad" };

function Leads() {
  const params = useSearchParams();
  const me = useDb(selectMe);
  const [tab, setTab] = useState(params.get("tab") === "visits" ? "visits" : "inquiries");
  const [filter, setFilter] = useState(params.get("property") ?? "");
  const props = useDb((s) => s.properties.filter((p) => p.ownerId === me?.id), [me?.id]);
  const inquiries = useDb((s) => s.inquiries.filter((i) => i.ownerId === me?.id && (!filter || i.propertyId === filter)), [me?.id, filter]);
  const visits = useDb((s) => s.visits.filter((v) => v.ownerId === me?.id && (!filter || v.propertyId === filter)), [me?.id, filter]);
  const title = (id) => props.find((p) => p.id === id)?.title ?? id;
  const wa = (phone, t) => `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, this is about your inquiry for "${t}" on invest2growth.`)}`;

  return (
    <>
      <div className="acct__head row-between">
        <div>
          <h1>Inquiries & site visits</h1>
          <p className="muted">Leads from buyers and tenants on your listings.</p>
        </div>
        <select className="input input--sm" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by property">
          <option value="">All properties</option>
          {props.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "inquiries"} className={tab === "inquiries" ? "is-active" : ""} onClick={() => setTab("inquiries")}>
          Inquiries <span>{inquiries.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "visits"} className={tab === "visits" ? "is-active" : ""} onClick={() => setTab("visits")}>
          Site visits <span>{visits.length}</span>
        </button>
      </div>

      {tab === "inquiries" &&
        (inquiries.length === 0 ? (
          <Empty icon={MessageSquare} title="No inquiries yet" text="When someone contacts you about a listing, it shows up here." />
        ) : (
          <div className="leads">
            {inquiries.map((i) => (
              <article key={i.id} className="lead">
                <div className="row-between">
                  <div>
                    <strong>{i.name}</strong>
                    <span className="muted small"> · {dateTime(i.createdAt)}</span>
                  </div>
                  <Status tone={LEAD_TONE[i.status]}>{i.status[0].toUpperCase() + i.status.slice(1)}</Status>
                </div>
                <Link href={`/properties/${i.propertyId}`} className="small link-inline">
                  {title(i.propertyId)}
                </Link>
                <p>{i.message}</p>
                <div className="lead__actions">
                  <a href={`tel:${i.phone}`} className="btn btn--ghost btn--sm" onClick={() => i.status === "new" && actions.setInquiryStatus(i.id, "contacted")}>
                    <Phone size={15} /> Call
                  </a>
                  <a href={wa(i.phone, title(i.propertyId))} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm" onClick={() => i.status === "new" && actions.setInquiryStatus(i.id, "contacted")}>
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                  {i.email && (
                    <a href={`mailto:${i.email}?subject=${encodeURIComponent(`Re: ${title(i.propertyId)}`)}`} className="btn btn--ghost btn--sm">
                      <Mail size={15} /> Email
                    </a>
                  )}
                  <select
                    className="input input--sm"
                    value={i.status}
                    aria-label="Lead status"
                    onChange={(e) => {
                      actions.setInquiryStatus(i.id, e.target.value);
                      toast("Lead updated");
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        ))}

      {tab === "visits" &&
        (visits.length === 0 ? (
          <Empty icon={CalendarDays} title="No visit requests" text="Site visit requests from buyers appear here." />
        ) : (
          <div className="leads">
            {visits.map((v) => (
              <article key={v.id} className="lead">
                <div className="row-between">
                  <div>
                    <strong>{v.name}</strong>
                    <span className="muted small"> · {v.phone}</span>
                  </div>
                  <Status tone={VISIT_TONE[v.status]}>{v.status[0].toUpperCase() + v.status.slice(1)}</Status>
                </div>
                <Link href={`/properties/${v.propertyId}`} className="small link-inline">
                  {title(v.propertyId)}
                </Link>
                <p>
                  <CalendarDays size={15} /> {date(`${v.date}T12:00:00+05:30`, { weekday: "short", day: "numeric", month: "short" })}, {v.slot}
                </p>
                <div className="lead__actions">
                  {v.status === "requested" && (
                    <>
                      <button type="button" className="btn btn--primary btn--sm" onClick={() => { actions.setVisitStatus(v.id, "confirmed"); toast("Visit confirmed"); }}>
                        Confirm
                      </button>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => { actions.setVisitStatus(v.id, "cancelled"); toast("Visit declined"); }}>
                        Decline
                      </button>
                    </>
                  )}
                  {v.status === "confirmed" && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => { actions.setVisitStatus(v.id, "completed"); toast("Marked as completed"); }}>
                      Mark completed
                    </button>
                  )}
                  <a href={`tel:${v.phone}`} className="btn btn--ghost btn--sm">
                    <Phone size={15} /> Call
                  </a>
                </div>
              </article>
            ))}
          </div>
        ))}
    </>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <Leads />
    </Suspense>
  );
}
