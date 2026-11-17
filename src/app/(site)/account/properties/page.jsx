"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, CheckCircle2, RotateCcw, Plus, MessageSquare, Building2 } from "lucide-react";
import { useDb, selectMe, actions } from "@/lib/db/store";
import { priceText, priceSuffix, statusLabel, STATUS_TONES } from "@/lib/property";
import { date } from "@/lib/format";
import { Status, Empty } from "@/components/ui/bits";
import { Confirm } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";

const TABS = [
  ["all", "All"],
  ["active", "Live"],
  ["pending", "Pending"],
  ["draft", "Drafts"],
  ["closed", "Sold / rented"],
  ["rejected", "Rejected"],
];

export default function MyProperties() {
  const me = useDb(selectMe);
  const mine = useDb((s) => s.properties.filter((p) => p.ownerId === me?.id && !p.deletedAt), [me?.id]);
  const leadCount = useDb((s) => Object.fromEntries(mine.map((p) => [p.id, s.inquiries.filter((i) => i.propertyId === p.id).length])), [mine]);
  const [tab, setTab] = useState("all");
  const [del, setDel] = useState(null);

  const list = mine.filter((p) => (tab === "all" ? true : tab === "closed" ? ["sold", "rented"].includes(p.status) : p.status === tab));

  return (
    <>
      <div className="acct__head row-between">
        <div>
          <h1>My properties</h1>
          <p className="muted">{mine.length} listings</p>
        </div>
        <Link href="/post-property" className="btn btn--primary btn--sm">
          <Plus size={16} /> New listing
        </Link>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
            {label}
            <span>{id === "all" ? mine.length : mine.filter((p) => (id === "closed" ? ["sold", "rented"].includes(p.status) : p.status === id)).length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty icon={Building2} title="Nothing here" text="Listings in this state will appear here." action={{ label: "Post a property", href: "/post-property" }} />
      ) : (
        <div className="mylist">
          {list.map((p) => (
            <article key={p.id} className="mylist__item">
              <img src={p.images[0]} alt="" />
              <div className="mylist__body">
                <div className="row-between">
                  <Status tone={STATUS_TONES[p.status]}>{statusLabel(p.status)}</Status>
                  <span className="muted small">
                    {p.id} · posted {date(p.postedAt)}
                  </span>
                </div>
                <h3>
                  <Link href={`/properties/${p.id}`}>{p.title}</Link>
                </h3>
                <p className="muted small">
                  {priceText(p)} {priceSuffix(p)} · {p.locality}, {p.city}
                </p>
                {p.status === "rejected" && p.rejectionReason && <p className="f__error">Reason: {p.rejectionReason}</p>}
                <div className="mylist__stats">
                  <span>
                    <Eye size={14} /> {(p.views || 0).toLocaleString("en-IN")} views
                  </span>
                  <Link href={`/account/leads?property=${p.id}`}>
                    <MessageSquare size={14} /> {leadCount[p.id] ?? 0} inquiries
                  </Link>
                </div>
                <div className="mylist__actions">
                  <Link href={`/properties/${p.id}`} className="btn btn--ghost btn--sm">
                    <Eye size={15} /> View
                  </Link>
                  <Link href={`/post-property?edit=${p.id}`} className="btn btn--ghost btn--sm">
                    <Pencil size={15} /> Edit
                  </Link>
                  {p.status === "active" && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => {
                        const s = p.listingType === "sale" ? "sold" : "rented";
                        actions.setPropertyStatus(p.id, s);
                        toast(`Marked as ${s}`);
                      }}
                    >
                      <CheckCircle2 size={15} /> Mark as {p.listingType === "sale" ? "sold" : "rented"}
                    </button>
                  )}
                  {["sold", "rented"].includes(p.status) && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => { actions.setPropertyStatus(p.id, "active"); toast("Listing reactivated"); }}>
                      <RotateCcw size={15} /> Reactivate
                    </button>
                  )}
                  <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => setDel(p)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Confirm
        open={!!del}
        onClose={() => setDel(null)}
        danger
        title="Delete this listing?"
        message={`"${del?.title}" will be removed from search. Inquiries you already received stay in your inbox.`}
        confirmLabel="Delete listing"
        onConfirm={() => {
          actions.deleteProperty(del.id);
          toast("Listing deleted");
        }}
      />
    </>
  );
}
