"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin, BadgeCheck, Heart, GitCompareArrows, Flag, Phone, MessageCircle, CalendarDays, Send, ChevronLeft, ChevronRight,
  Images, FileText, Download, ExternalLink, ShieldCheck, Eye, Building2, Info, Check,
} from "lucide-react";
import { useDb, useHydrated, actions, selectMe } from "@/lib/db/store";
import {
  priceText, priceSuffix, listingLabel, categoryLabel, availabilityLabel, pricePerSqft, bhk, areaText, similarProperties, statusLabel,
} from "@/lib/property";
import { inr, date, initials } from "@/lib/format";
import Modal from "@/components/ui/Modal";
import { ShareButton, Empty, Field } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";
import PropertyCard from "./PropertyCard";
import AdSlot from "@/components/ui/AdSlot";

const PropertyMap = dynamic(() => import("./PropertyMap"), { ssr: false, loading: () => <div className="pmap pmap--loading">Loading map…</div> });

const SLOTS = ["10:00 – 11:00", "11:00 – 12:00", "12:00 – 13:00", "15:00 – 16:00", "16:00 – 17:00", "17:00 – 18:00"];
const REPORT_REASONS = ["Incorrect price", "Wrong location", "Already rented / sold", "Fake or misleading photos", "Owner not reachable", "Fraud / scam", "Other"];

export default function PropertyDetail({ id }) {
  const hydrated = useHydrated();
  const p = useDb((s) => s.properties.find((x) => x.id === id && !x.deletedAt), [id]);
  const me = useDb(selectMe);
  const amenities = useDb((s) => s.amenities);
  const allPublic = useDb((s) => s.properties.filter((x) => ["active"].includes(x.status) && !x.deletedAt));
  const recentIds = useDb((s) => s.me.recent);
  const saved = useDb((s) => s.me.wishlist.includes(id), [id]) && hydrated;
  const comparing = useDb((s) => s.me.compare.includes(id), [id]) && hydrated;

  const [shot, setShot] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [modal, setModal] = useState(null); // "visit" | "report" | "phone"

  useEffect(() => {
    if (p && hydrated) actions.viewProperty(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hydrated, Boolean(p)]);

  const similar = useMemo(() => (p ? similarProperties(allPublic, p, 3) : []), [allPublic, p]);
  const recent = useMemo(
    () => (hydrated ? recentIds.filter((r) => r !== id).map((r) => allPublic.find((x) => x.id === r)).filter(Boolean).slice(0, 3) : []),
    [recentIds, allPublic, id, hydrated]
  );

  if (!p) {
    if (!hydrated) return <div className="container page-pad muted">Loading property…</div>;
    return (
      <div className="container page-pad">
        <Empty icon={Building2} title="Property not found" text="This listing may have been removed or the link is incorrect." action={{ label: "Browse properties", href: "/properties" }} />
      </div>
    );
  }

  const isOwner = me && me.id === p.ownerId;
  const hiddenStatus = !["active", "sold", "rented"].includes(p.status);
  if (hiddenStatus && !isOwner && hydrated) {
    return (
      <div className="container page-pad">
        <Empty icon={Building2} title="This listing isn't public" text="It may be awaiting review or has been taken down." action={{ label: "Browse properties", href: "/properties" }} />
      </div>
    );
  }

  const ppsf = pricePerSqft(p);
  const waText = encodeURIComponent(`Hi, I'm interested in "${p.title}" (${p.id}) listed on invest2growth.`);
  const phoneDigits = p.postedBy?.phone?.replace(/\D/g, "") ?? "";

  const facts = [
    ["Property ID", p.id],
    ["Category", categoryLabel(p.category)],
    ["Listing type", listingLabel(p.listingType)],
    ["Carpet area", p.carpetArea && `${p.carpetArea.toLocaleString("en-IN")} sq.ft`],
    ["Built-up area", p.builtUpArea && `${p.builtUpArea.toLocaleString("en-IN")} sq.ft`],
    ["Plot area", p.plotArea && `${p.plotArea.toLocaleString("en-IN")} sq.ft`],
    ["Bedrooms", p.bedrooms],
    ["Bathrooms", p.bathrooms],
    ["Balconies", p.balconies],
    ["Furnishing", p.furnishing],
    ["Floor", p.floor != null && p.totalFloors ? `${p.floor === 0 ? "Ground" : p.floor} of ${p.totalFloors}` : null],
    ["Parking", p.parking !== "None" ? p.parking : null],
    ["Property age", p.availability === "under-construction" ? "New construction" : p.ageYears != null ? `${p.ageYears} ${p.ageYears === 1 ? "year" : "years"}` : null],
    ["Facing", p.facing],
    ["Possession", availabilityLabel(p.availability)],
    ["Ownership", p.ownership],
    ["RERA number", p.rera],
    ["Posted on", date(p.postedAt)],
  ].filter(([, v]) => v != null && v !== "");

  return (
    <div className="container page-pad pd">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/properties?city=${encodeURIComponent(p.city)}`}>{p.city}</Link>
        <span>/</span>
        <Link href={`/properties?city=${encodeURIComponent(p.city)}&category=${p.category}`}>{categoryLabel(p.category)}</Link>
      </nav>

      {(hiddenStatus || p.status === "sold" || p.status === "rented") && (
        <div className={`banner banner--${p.status === "rejected" ? "bad" : "warn"}`}>
          <Info size={18} />
          <span>
            {p.status === "sold" || p.status === "rented"
              ? `This property has been marked as ${statusLabel(p.status).toLowerCase()}.`
              : `Status: ${statusLabel(p.status)}. Only you can see this page until it is approved.`}
            {p.rejectionReason && ` Reason: ${p.rejectionReason}`}
          </span>
          {isOwner && (
            <Link href={`/post-property?edit=${p.id}`} className="btn btn--ghost btn--sm">
              Edit listing
            </Link>
          )}
        </div>
      )}

      {/* Gallery */}
      <div className="gallery">
        <button type="button" className="gallery__main" onClick={() => setLightbox(true)} aria-label="Open photo gallery">
          <img src={p.images[shot]} alt={`${p.title}, photo ${shot + 1}`} />
          <span className={`badge badge--${p.listingType}`}>{listingLabel(p.listingType)}</span>
          <span className="gallery__count">
            <Images size={15} /> {shot + 1} / {p.images.length}
          </span>
        </button>
        <div className="gallery__thumbs">
          {p.images.slice(0, 4).map((src, i) => (
            <button key={src + i} type="button" className={shot === i ? "is-active" : ""} onClick={() => setShot(i)} aria-label={`Show photo ${i + 1}`}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <div className="pd__layout">
        <div className="pd__main">
          <header className="pd__head">
            <div className="pd__tags">
              {p.verified && (
                <span className="vtag">
                  <BadgeCheck size={14} /> Verified
                </span>
              )}
              <span className="ptag">{categoryLabel(p.category)}</span>
              <span className="ptag">{availabilityLabel(p.availability)}</span>
              {p.rera && <span className="ptag">RERA: {p.rera}</span>}
            </div>
            <h1>{p.title}</h1>
            <p className="pd__place">
              <MapPin size={16} /> {p.locality}, {p.city}, {p.state} {p.pincode}
            </p>
            <div className="pd__price">
              <strong>{priceText(p)}</strong>
              {priceSuffix(p) && <span>{priceSuffix(p)}</span>}
              {ppsf && <em>{inr(ppsf)} / sq.ft</em>}
            </div>
            <div className="pd__summary">
              {[bhk(p), areaText(p), p.furnishing].filter(Boolean).map((x) => (
                <span key={x}>{x}</span>
              ))}
              <span className="muted">
                <Eye size={14} /> {p.views.toLocaleString("en-IN")} views
              </span>
            </div>
            <div className="pd__actions">
              <button
                type="button"
                className={`btn btn--ghost btn--sm${saved ? " is-saved" : ""}`}
                aria-pressed={saved}
                onClick={() => toast(actions.toggleWishlist(p.id) ? "Saved to your wishlist" : "Removed from wishlist")}
              >
                <Heart size={16} /> {saved ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                className={`btn btn--ghost btn--sm${comparing ? " is-on" : ""}`}
                aria-pressed={comparing}
                onClick={() => {
                  const r = actions.toggleCompare(p.id);
                  toast(r.ok ? (r.added ? "Added to compare" : "Removed from compare") : r.error, r.ok ? "success" : "error");
                }}
              >
                <GitCompareArrows size={16} /> {comparing ? "In compare" : "Compare"}
              </button>
              <ShareButton title={p.title} url={`/properties/${p.id}`} />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setModal("report")}>
                <Flag size={16} /> Report
              </button>
            </div>
          </header>

          <section className="pd__block">
            <h2>Overview</h2>
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="pd__block">
            <h2>About this property</h2>
            <p className="pd__desc">{p.description}</p>
          </section>

          {p.amenities.length > 0 && (
            <section className="pd__block">
              <h2>Amenities</h2>
              <ul className="amenities">
                {p.amenities.map((a) => (
                  <li key={a}>
                    <Check size={16} /> {amenities.find((x) => x.id === a)?.label ?? a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="pd__block">
            <div className="pd__block-head">
              <h2>Location</h2>
              <a className="link-inline" href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer">
                Open in Google Maps <ExternalLink size={14} />
              </a>
            </div>
            <p className="muted mb-16">
              {p.locality}, {p.city}, {p.state} – {p.pincode}
            </p>
            <PropertyMap items={[p]} height={320} zoom={14} />
          </section>

          {(p.floorPlan || p.brochure || p.video) && (
            <section className="pd__block">
              <h2>Documents & media</h2>
              <div className="docs">
                {p.floorPlan && <DocLink file={p.floorPlan} label="Floor plan" />}
                {p.brochure && <DocLink file={p.brochure} label="Brochure (PDF)" />}
                {p.video && (
                  <a href={p.video} className="doc" target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={20} /> <span>Video tour</span>
                  </a>
                )}
              </div>
            </section>
          )}

          <p className="disclaimer">
            <ShieldCheck size={16} />
            Details are provided by the lister. Verify the title, approvals and RERA registration (where applicable) before
            paying any token amount. invest2growth does not collect payments for properties.
          </p>
        </div>

        <aside className="pd__side">
          <div className="contact-box">
            <div className="contact-box__who">
              <span className="avatar">{initials(p.postedBy?.name)}</span>
              <div>
                <strong>{p.postedBy?.name}</strong>
                <span>
                  {{ owner: "Owner", agent: "Agent", builder: "Builder", agency: "Agency" }[p.postedBy?.role] ?? "Lister"}
                  {p.postedBy?.verified && (
                    <>
                      {" · "}
                      <BadgeCheck size={13} /> Verified
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="contact-box__btns">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setModal("phone")}>
                <Phone size={16} /> Call
              </button>
              <a className="btn btn--whatsapp btn--sm" href={`https://wa.me/${phoneDigits}?text=${waText}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
            <button type="button" className="btn btn--ghost btn--sm btn--block" onClick={() => setModal("visit")}>
              <CalendarDays size={16} /> Request a site visit
            </button>
            <InquiryForm p={p} me={me} />
          </div>
          <AdSlot placement="property-sidebar" />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="pd__more">
          <h2 className="h-sec">Similar properties</h2>
          <div className="listings">
            {similar.map((x, i) => (
              <PropertyCard key={x.id} p={x} i={i} reveal={false} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="pd__more">
          <h2 className="h-sec">Recently viewed</h2>
          <div className="listings">
            {recent.map((x, i) => (
              <PropertyCard key={x.id} p={x} i={i} reveal={false} compact />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      <Modal open={lightbox} onClose={() => setLightbox(false)} title={`${p.title} — photo ${shot + 1} of ${p.images.length}`} size="xl">
        <div className="lightbox">
          <img src={p.images[shot]} alt={`${p.title}, photo ${shot + 1}`} />
          {p.images.length > 1 && (
            <>
              <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => setShot((shot - 1 + p.images.length) % p.images.length)} aria-label="Previous photo">
                <ChevronLeft size={22} />
              </button>
              <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => setShot((shot + 1) % p.images.length)} aria-label="Next photo">
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </Modal>

      <Modal open={modal === "phone"} onClose={() => setModal(null)} title="Contact details" size="sm">
        <div className="phone-reveal">
          <span className="avatar">{initials(p.postedBy?.name)}</span>
          <strong>{p.postedBy?.name}</strong>
          <a href={`tel:${p.postedBy?.phone}`} className="phone-reveal__num">
            {p.postedBy?.phone?.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
          </a>
          <a href={`tel:${p.postedBy?.phone}`} className="btn btn--primary btn--block">
            <Phone size={16} /> Call now
          </a>
          <p className="muted small">Mention invest2growth and the property ID {p.id} when you call.</p>
        </div>
      </Modal>

      <VisitModal open={modal === "visit"} onClose={() => setModal(null)} p={p} me={me} />
      <ReportModal open={modal === "report"} onClose={() => setModal(null)} p={p} />
    </div>
  );
}

/** Uploaded files are URLs; in the frontend-only demo a new upload is just a file name. */
function DocLink({ file, label }) {
  const isUrl = /^(\/|https?:\/\/)/.test(file);
  return isUrl ? (
    <a href={file} className="doc" target="_blank" rel="noopener">
      <FileText size={20} /> <span>{label}</span> <Download size={16} />
    </a>
  ) : (
    <div className="doc doc--pending" title="Stored once the upload API is connected">
      <FileText size={20} /> <span>{label}: {file}</span> <small>Uploaded</small>
    </div>
  );
}

function InquiryForm({ p, me }) {
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState({});

  function submit(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const errors = {};
    if (!d.name.trim()) errors.name = "Enter your name";
    if (d.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a 10-digit mobile number";
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) errors.email = "Enter a valid email";
    if (!d.message.trim()) errors.message = "Write a short message";
    setErr(errors);
    if (Object.keys(errors).length) return;
    actions.sendInquiry({ propertyId: p.id, ...d });
    setSent(true);
    toast("Inquiry sent to the lister");
  }

  if (sent)
    return (
      <div className="sent">
        <Check size={20} />
        <strong>Inquiry sent</strong>
        <p>The lister will contact you shortly. You can also call or WhatsApp them directly.</p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setSent(false)}>
          Send another
        </button>
      </div>
    );

  return (
    <form className="form-stack" onSubmit={submit} noValidate>
      <h3>Send an inquiry</h3>
      <Field label="Name" error={err.name}>
        <input className="input" name="name" defaultValue={me?.name === "New user" ? "" : me?.name} autoComplete="name" />
      </Field>
      <Field label="Mobile number" error={err.phone}>
        <input className="input" name="phone" inputMode="tel" defaultValue={me?.phone?.replace(/^\+91/, "")} autoComplete="tel" />
      </Field>
      <Field label="Email (optional)" error={err.email}>
        <input className="input" name="email" type="email" defaultValue={me?.email} autoComplete="email" />
      </Field>
      <Field label="Message" error={err.message}>
        <textarea className="input" name="message" rows={3} defaultValue={`I'm interested in ${p.title}. Please share more details.`} />
      </Field>
      <button type="submit" className="btn btn--primary btn--block">
        <Send size={16} /> Send inquiry
      </button>
      <p className="muted tiny">By sending, you agree to be contacted by the lister about this property.</p>
    </form>
  );
}

function VisitModal({ open, onClose, p, me }) {
  const [err, setErr] = useState("");
  const today = new Date();
  const min = new Date(today.getTime() + 864e5).toISOString().slice(0, 10);
  function submit(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    if (!d.name.trim() || d.phone.replace(/\D/g, "").length < 10 || !d.date || !d.slot) {
      setErr("Please fill in your name, a 10-digit mobile number, a date and a time slot.");
      return;
    }
    actions.requestVisit({ propertyId: p.id, ...d });
    toast("Site visit requested. The lister will confirm.");
    setErr("");
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title="Request a site visit" size="sm">
      <form className="form-stack" onSubmit={submit} noValidate>
        <p className="muted">{p.title}</p>
        <Field label="Name">
          <input className="input" name="name" defaultValue={me?.name === "New user" ? "" : me?.name} />
        </Field>
        <Field label="Mobile number">
          <input className="input" name="phone" inputMode="tel" defaultValue={me?.phone?.replace(/^\+91/, "")} />
        </Field>
        <Field label="Preferred date">
          <input className="input" type="date" name="date" min={min} defaultValue={min} />
        </Field>
        <div className="f">
          <span className="f__label">Time slot</span>
          <div className="slots">
            {SLOTS.map((s, i) => (
              <label key={s} className="slot">
                <input type="radio" name="slot" value={s} defaultChecked={i === 1} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
        {err && <p className="f__error">{err}</p>}
        <button type="submit" className="btn btn--primary btn--block">
          <CalendarDays size={16} /> Request visit
        </button>
      </form>
    </Modal>
  );
}

function ReportModal({ open, onClose, p }) {
  const [reason, setReason] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!reason) return;
    actions.reportListing({ propertyId: p.id, reason, details: new FormData(e.currentTarget).get("details") });
    toast("Thanks. Our moderation team will review this listing.");
    setReason("");
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title="Report this listing" size="sm">
      <form className="form-stack" onSubmit={submit}>
        <div className="radios">
          {REPORT_REASONS.map((r) => (
            <label key={r} className="radio">
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
              <span>{r}</span>
            </label>
          ))}
        </div>
        <Field label="Details (optional)">
          <textarea className="input" name="details" rows={3} placeholder="Tell us what's wrong" />
        </Field>
        <button type="submit" className="btn btn--danger btn--block" disabled={!reason}>
          <Flag size={16} /> Submit report
        </button>
      </form>
    </Modal>
  );
}
