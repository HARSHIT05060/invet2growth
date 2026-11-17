"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDb, actions } from "@/lib/db/store";
import { PageHeader } from "@/components/admin/ui";
import { Empty, Status, Field } from "@/components/ui/bits";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { categoryLabel, priceText, priceSuffix, listingLabel, areaText, bhk, pricePerSqft, availabilityLabel } from "@/lib/property";
import { ago, dateTime, inr } from "@/lib/format";

const REASONS = [
  "Photos are unclear, watermarked or not of this property",
  "Price looks incorrect or misleading",
  "RERA number missing or invalid",
  "Duplicate of an existing listing",
  "Incomplete or inaccurate details",
  "Prohibited content or contact details in description",
];

function Approvals() {
  const router = useRouter();
  const params = useSearchParams();
  const pending = useDb((s) => s.properties.filter((p) => p.status === "pending" && !p.deletedAt).sort((a, b) => Date.parse(a.postedAt) - Date.parse(b.postedAt)));
  const all = useDb((s) => s.properties);
  const users = useDb((s) => s.users);
  const amenities = useDb((s) => s.amenities);
  const [reject, setReject] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");

  const id = params.get("id");
  const p = pending.find((x) => x.id === id) ?? pending[0];

  function go(next) {
    router.replace(next ? `/admin/approvals?id=${next.id}` : "/admin/approvals", { scroll: false });
  }
  function nextAfter(cur) {
    const i = pending.findIndex((x) => x.id === cur.id);
    return pending[i + 1] ?? pending[i - 1] ?? null;
  }

  if (!pending.length) {
    return (
      <>
        <PageHeader title="Property approvals" description="Listings submitted by users wait here for moderation." />
        <Empty icon={CheckCircle2} title="All caught up" text="There are no listings awaiting review." action={{ label: "View all properties", href: "/admin/properties" }} />
      </>
    );
  }

  const owner = users.find((u) => u.id === p.ownerId);
  const ppsf = pricePerSqft(p);
  const dupes = all.filter((x) => x.id !== p.id && !x.deletedAt && x.locality === p.locality && x.category === p.category && Math.abs(x.price - p.price) / p.price < 0.1);
  const checks = [
    { ok: p.images.length >= 3, label: `${p.images.length} photo${p.images.length === 1 ? "" : "s"} (3+ recommended)` },
    { ok: p.description.length >= 80, label: `Description length ${p.description.length} chars` },
    (() => {
      const required = p.availability === "under-construction" && p.segment === "residential";
      return { ok: !required || Boolean(p.rera), label: p.rera ? `RERA: ${p.rera}` : required ? "RERA number missing (required)" : "RERA not required for this listing" };
    })(),
    { ok: !dupes.length, label: dupes.length ? `${dupes.length} possible duplicate(s) in ${p.locality}` : "No duplicates found" },
    { ok: owner?.phoneVerified ?? false, label: owner?.phoneVerified ? "Owner phone verified" : "Owner phone not verified" },
    { ok: !/\b\d{10}\b|@\w+\./.test(p.description), label: "No contact details in description" },
  ];

  return (
    <>
      <PageHeader title="Property approvals" description={`${pending.length} listing${pending.length === 1 ? "" : "s"} waiting, oldest first`} />
      <div className="mod">
        <ul className="mod__queue" aria-label="Approval queue">
          {pending.map((x) => (
            <li key={x.id}>
              <button type="button" className={x.id === p.id ? "is-active" : ""} onClick={() => go(x)}>
                <img src={x.images[0]} alt="" />
                <span>
                  <strong>{x.title}</strong>
                  <small>
                    {x.city} · {priceText(x)} · {ago(x.postedAt)}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <section className="panel mod__review">
          <div className="mod__head">
            <div>
              <span className="muted small">
                {p.id} · submitted {dateTime(p.postedAt)}
              </span>
              <h2>{p.title}</h2>
              <p className="muted">
                {categoryLabel(p.category)} · {listingLabel(p.listingType)} · {p.locality}, {p.city}, {p.state} {p.pincode}
              </p>
            </div>
            <Link href={`/properties/${p.id}`} target="_blank" className="btn btn--ghost btn--sm">
              <ExternalLink size={15} /> Preview
            </Link>
          </div>

          <div className="mod__photos">
            {p.images.map((src, i) => (
              <img key={i} src={src} alt={`Photo ${i + 1}`} />
            ))}
          </div>

          <div className="adm-grid adm-grid--2">
            <div>
              <h3 className="panel__sub">Listing</h3>
              <dl className="kv">
                {[
                  ["Price", `${priceText(p)} ${priceSuffix(p)}`],
                  ["Per sq.ft", ppsf ? inr(ppsf) : "—"],
                  ["Area", areaText(p) ?? "—"],
                  ["Configuration", bhk(p) ?? "—"],
                  ["Furnishing", p.furnishing ?? "—"],
                  ["Possession", availabilityLabel(p.availability)],
                  ["Ownership", p.ownership],
                  ["Facing", p.facing],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="panel__sub">Description</h3>
              <p>{p.description}</p>
              {p.amenities.length > 0 && (
                <>
                  <h3 className="panel__sub">Amenities</h3>
                  <p className="muted">{p.amenities.map((a) => amenities.find((x) => x.id === a)?.label ?? a).join(", ")}</p>
                </>
              )}
            </div>
            <div>
              <h3 className="panel__sub">Moderation checklist</h3>
              <ul className="checklist">
                {checks.map((c) => (
                  <li key={c.label} className={c.ok ? "ok" : "warn"}>
                    {c.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {c.label}
                  </li>
                ))}
              </ul>
              <h3 className="panel__sub">Posted by</h3>
              <div className="owner-card">
                <strong>{p.postedBy?.name}</strong>
                <span className="muted small">
                  {owner?.email} · {p.postedBy?.phone}
                </span>
                <span>
                  <Status tone={owner?.status === "active" ? "good" : "warn"}>{owner?.status ?? "unknown"}</Status>{" "}
                  <span className="muted small">Member since {owner ? dateTime(owner.joinedAt).split(",")[0] : "—"}</span>
                </span>
              </div>
              {dupes.length > 0 && (
                <>
                  <h3 className="panel__sub">Possible duplicates</h3>
                  <ul className="small">
                    {dupes.map((d) => (
                      <li key={d.id}>
                        <Link className="link-inline" href={`/properties/${d.id}`} target="_blank">
                          {d.id} — {d.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="mod__actions">
            <button type="button" className="btn btn--ghost btn--danger-text" onClick={() => setReject(true)}>
              <X size={16} /> Reject
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                const n = nextAfter(p);
                actions.moderateProperty(p.id, "approve");
                toast(`Approved ${p.id}. The owner has been notified.`);
                go(n);
              }}
            >
              <Check size={16} /> Approve & publish
            </button>
          </div>
        </section>
      </div>

      <Modal
        open={reject}
        onClose={() => setReject(false)}
        title="Reject listing"
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setReject(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => {
                const n = nextAfter(p);
                actions.moderateProperty(p.id, "reject", note ? `${reason}. ${note}` : reason);
                toast("Listing rejected. The owner has been told why.");
                setReject(false);
                setNote("");
                go(n);
              }}
            >
              Reject listing
            </button>
          </>
        }
      >
        <div className="form-stack">
          <div className="radios">
            {REASONS.map((r) => (
              <label key={r} className="radio">
                <input type="radio" checked={reason === r} onChange={() => setReason(r)} />
                <span>{r}</span>
              </label>
            ))}
          </div>
          <Field label="Note to the owner (optional)">
            <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={null}>
      <Approvals />
    </Suspense>
  );
}
