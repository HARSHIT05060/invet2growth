"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, ImagePlus, X, LocateFixed, Star, Upload, LogIn } from "lucide-react";
import { useDb, useHydrated, actions, selectMe } from "@/lib/db/store";
import { SEGMENTS, LISTING_TYPES, FURNISHING, FACING, OWNERSHIP, AVAILABILITY } from "@/mock/catalog";
import { inrShort } from "@/lib/format";
import { categoryLabel } from "@/lib/property";
import { Field, Empty } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";

const STEPS = ["Basics", "Location", "Details", "Amenities", "Photos & files", "Price & description", "Review"];

const EMPTY = {
  listingType: "sale", segment: "residential", category: "flat", title: "",
  city: "", locality: "", state: "", pincode: "", lat: null, lng: null,
  carpetArea: "", builtUpArea: "", plotArea: "", bedrooms: "", bathrooms: "", balconies: "",
  furnishing: "Unfurnished", floor: "", totalFloors: "", parking: "None", ageYears: "", facing: "East",
  availability: "ready", ownership: "Freehold", rera: "",
  amenities: [], images: [], video: "", floorPlan: null, brochure: null,
  price: "", description: "",
};

const NUMERIC = ["carpetArea", "builtUpArea", "plotArea", "bedrooms", "bathrooms", "balconies", "floor", "totalFloors", "ageYears", "price"];

/** Downscale an image file to a compact JPEG data URL (keeps the demo store small). */
function compress(file, max = 1100) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.68));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function PostPropertyWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const hydrated = useHydrated();
  const me = useDb(selectMe);
  const existing = useDb((s) => (editId ? s.properties.find((p) => p.id === editId) : null), [editId]);
  const categories = useDb((s) => s.propertyCategories.filter((c) => c.active));
  const amenities = useDb((s) => s.amenities.filter((a) => a.active));
  const locations = useDb((s) => s.locations.filter((l) => l.active));
  const settings = useDb((s) => s.settings);

  const [step, setStep] = useState(0);
  const [d, setD] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (existing) {
      setD({ ...EMPTY, ...Object.fromEntries(Object.entries(existing).map(([k, v]) => [k, v ?? EMPTY[k] ?? ""])) });
    }
  }, [existing]);

  const set = (patch) => setD((x) => ({ ...x, ...patch }));
  const cityObj = locations.find((l) => l.city === d.city);
  const isLand = d.segment === "land";
  const isPlot = isLand || d.category === "res-plot";
  const isCommercial = d.segment === "commercial";
  const segCats = useMemo(() => categories.filter((c) => c.segment === d.segment), [categories, d.segment]);

  if (!hydrated) return <div className="container page-pad muted">Loading…</div>;

  if (!me) {
    return (
      <div className="container page-pad">
        <Empty
          icon={LogIn}
          title="Log in to post a property"
          text="Listing is free for owners, agents and builders. Log in or create an account to continue."
          action={{ label: "Log in or sign up", href: `/login?next=${encodeURIComponent("/post-property")}` }}
        />
      </div>
    );
  }

  if (editId && existing && existing.ownerId !== me.id) {
    return (
      <div className="container page-pad">
        <Empty title="You can't edit this listing" text="Only the person who posted it can make changes." action={{ label: "My properties", href: "/account/properties" }} />
      </div>
    );
  }

  function validate(i) {
    const e = {};
    if (i === 0) {
      if (!d.category) e.category = "Pick a property type";
      if (d.title.trim().length < 10) e.title = "Write a title of at least 10 characters";
    }
    if (i === 1) {
      if (!d.city) e.city = "Pick a city";
      if (!d.locality) e.locality = "Pick or type a locality";
      if (!/^\d{6}$/.test(d.pincode)) e.pincode = "Enter a 6-digit pincode";
    }
    if (i === 2) {
      if (isPlot && !d.plotArea) e.plotArea = "Enter the plot area";
      if (!isPlot && !d.carpetArea && !d.builtUpArea) e.carpetArea = "Enter carpet or built-up area";
      if (d.segment === "residential" && !isPlot && d.category !== "pg" && !d.bedrooms) e.bedrooms = "Enter number of bedrooms";
      if (d.floor !== "" && d.totalFloors !== "" && Number(d.floor) > Number(d.totalFloors)) e.floor = "Floor can't be above total floors";
      if (d.availability === "under-construction" && d.segment === "residential" && !d.rera) e.rera = "RERA number is required for under-construction projects";
    }
    if (i === 4) {
      if (!d.images.length) e.images = "Add at least one photo";
    }
    if (i === 5) {
      if (!d.price || Number(d.price) <= 0) e.price = "Enter the price";
      if (d.description.trim().length < 30) e.description = "Write at least 30 characters";
    }
    setErrors(e);
    return !Object.keys(e).length;
  }

  function next() {
    if (validate(step)) setStep(Math.min(step + 1, STEPS.length - 1));
  }

  async function addImages(files) {
    const room = settings.maxImagesPerListing - d.images.length;
    const list = [...files].filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, room));
    const tooBig = [...files].filter((f) => f.size > settings.maxUploadMb * 1024 * 1024);
    if (tooBig.length) toast(`Files over ${settings.maxUploadMb} MB were skipped`, "error");
    if (!list.length) return;
    setBusy(true);
    try {
      const urls = await Promise.all(list.filter((f) => f.size <= settings.maxUploadMb * 1024 * 1024).map((f) => compress(f)));
      set({ images: [...d.images, ...urls] });
    } catch {
      toast("One of the images couldn't be read", "error");
    } finally {
      setBusy(false);
    }
  }

  function locate() {
    if (!navigator.geolocation) return toast("Location isn't available in this browser", "error");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({ lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) });
        toast("Map pin set to your current location");
      },
      () => toast("Couldn't get your location", "error")
    );
  }

  function save(submit) {
    for (let i = 0; i < 6; i++) {
      if (submit && !validate(i)) {
        setStep(i);
        return;
      }
    }
    const city = locations.find((l) => l.city === d.city);
    const data = {
      ...d,
      ...Object.fromEntries(NUMERIC.map((k) => [k, d[k] === "" ? null : Number(d[k])])),
      title: d.title.trim(),
      state: d.state || city?.state || "",
      lat: d.lat ?? (city ? +(city.lat + (Math.random() - 0.5) * 0.06).toFixed(5) : null),
      lng: d.lng ?? (city ? +(city.lng + (Math.random() - 0.5) * 0.06).toFixed(5) : null),
      rera: d.rera || null,
      video: d.video || null,
    };
    if (existing) data.id = existing.id;
    const saved = actions.saveProperty(data, { submit });
    if (submit) setDone(saved);
    else {
      toast("Draft saved");
      router.push("/account/properties");
    }
  }

  if (done) {
    return (
      <div className="container page-pad">
        <div className="done-card">
          <span className="done-card__icon">
            <Check size={28} />
          </span>
          <h1>{done.status === "pending" ? "Submitted for review" : "Your listing is live"}</h1>
          <p className="muted">
            {done.status === "pending"
              ? `Our team checks every listing before it goes live, usually within a few hours. Property ID: ${done.id}.`
              : `Property ID: ${done.id}. Buyers can now find it in search.`}
          </p>
          <div className="page__actions">
            <Link href="/account/properties" className="btn btn--primary">
              Go to my properties
            </Link>
            <Link href={`/properties/${done.id}`} className="btn btn--ghost">
              Preview listing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const num = (k, label, props = {}) => (
    <Field label={label} error={errors[k]}>
      <input className="input" type="number" min="0" inputMode="numeric" value={d[k] ?? ""} onChange={(e) => set({ [k]: e.target.value })} {...props} />
    </Field>
  );

  return (
    <div className="container page-pad wizard">
      <div className="wizard__head">
        <p className="eyebrow">{existing ? `Editing ${existing.id}` : "Post property · Free"}</p>
        <h1 className="h-page">{existing ? "Edit your listing" : "List your property"}</h1>
      </div>

      <ol className="steps" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? "is-current" : i < step ? "is-done" : ""}>
            <button type="button" onClick={() => (i < step || validate(step)) && setStep(i)} disabled={i > step + 1}>
              <span className="steps__n">{i < step ? <Check size={14} /> : i + 1}</span>
              <span className="steps__l">{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="wizard__card">
        {step === 0 && (
          <div className="form-grid">
            <div className="f span-2">
              <span className="f__label">I want to</span>
              <div className="seg seg--light">
                {LISTING_TYPES.map((t) => (
                  <button key={t.id} type="button" className={d.listingType === t.id ? "is-active" : ""} onClick={() => set({ listingType: t.id })}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="f span-2">
              <span className="f__label">Property segment</span>
              <div className="seg seg--light">
                {SEGMENTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={d.segment === s.id ? "is-active" : ""}
                    onClick={() => set({ segment: s.id, category: categories.find((c) => c.segment === s.id)?.id ?? "" })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="f span-2">
              <span className="f__label">Property type</span>
              <div className="tiles">
                {segCats.map((c) => (
                  <button key={c.id} type="button" className={`tile${d.category === c.id ? " is-active" : ""}`} onClick={() => set({ category: c.id })}>
                    {c.label}
                  </button>
                ))}
              </div>
              {errors.category && <span className="f__error">{errors.category}</span>}
            </div>
            <Field label="Listing title" hint="e.g. 2 BHK Apartment in Vaishali Nagar" error={errors.title} className="span-2">
              <input className="input" value={d.title} maxLength={90} onChange={(e) => set({ title: e.target.value })} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="form-grid">
            <Field label="City" error={errors.city}>
              <select className="input" value={d.city} onChange={(e) => set({ city: e.target.value, locality: "", state: locations.find((l) => l.city === e.target.value)?.state ?? "" })}>
                <option value="">Select city</option>
                {locations.map((l) => (
                  <option key={l.id}>{l.city}</option>
                ))}
              </select>
            </Field>
            <Field label="Locality / area" error={errors.locality}>
              <input className="input" list="wiz-localities" value={d.locality} onChange={(e) => set({ locality: e.target.value })} disabled={!d.city} placeholder={d.city ? "Start typing" : "Pick a city first"} />
              <datalist id="wiz-localities">
                {cityObj?.localities.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </Field>
            <Field label="State">
              <input className="input" value={d.state} onChange={(e) => set({ state: e.target.value })} />
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              <input className="input" inputMode="numeric" maxLength={6} value={d.pincode} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <div className="f span-2">
              <span className="f__label">Map location</span>
              <div className="locate">
                <button type="button" className="btn btn--ghost btn--sm" onClick={locate}>
                  <LocateFixed size={16} /> Use my current location
                </button>
                <span className="muted small">
                  {d.lat && d.lng ? `Pin: ${d.lat}, ${d.lng}` : "If you skip this, we'll place the pin at the centre of the locality."}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid form-grid--3">
            {!isPlot && num("carpetArea", "Carpet area (sq.ft)")}
            {!isPlot && num("builtUpArea", "Built-up area (sq.ft)")}
            {(isPlot || ["house", "villa", "farmhouse", "warehouse", "industrial", "com-building"].includes(d.category)) && num("plotArea", "Plot area (sq.ft)")}
            {d.segment === "residential" && !isPlot && num("bedrooms", d.category === "pg" ? "Beds per room" : "Bedrooms")}
            {!isLand && !isPlot && num("bathrooms", "Bathrooms")}
            {d.segment === "residential" && !isPlot && num("balconies", "Balconies")}
            {!isPlot && num("floor", "Floor number", { placeholder: "0 for ground" })}
            {!isPlot && num("totalFloors", "Total floors")}
            {!isPlot && num("ageYears", "Property age (years)")}
            {!isPlot && (
              <Field label="Furnishing">
                <select className="input" value={d.furnishing ?? ""} onChange={(e) => set({ furnishing: e.target.value })}>
                  {FURNISHING.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
            )}
            {!isLand && (
              <Field label="Parking">
                <select className="input" value={d.parking} onChange={(e) => set({ parking: e.target.value })}>
                  {["None", "1 open", "1 covered", "2 open", "2 covered", "Visitor parking", "Truck parking"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Facing">
              <select className="input" value={d.facing} onChange={(e) => set({ facing: e.target.value })}>
                {FACING.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Possession status">
              <select className="input" value={d.availability} onChange={(e) => set({ availability: e.target.value })}>
                {AVAILABILITY.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ownership">
              <select className="input" value={d.ownership} onChange={(e) => set({ ownership: e.target.value })}>
                {OWNERSHIP.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="RERA number" hint="Required for registered projects" error={errors.rera}>
              <input className="input" value={d.rera ?? ""} onChange={(e) => set({ rera: e.target.value })} />
            </Field>
            {(errors.carpetArea || errors.plotArea || errors.bedrooms || errors.floor) && (
              <p className="f__error span-3">{errors.carpetArea || errors.plotArea || errors.bedrooms || errors.floor}</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="muted mb-16">Select everything that applies. Accurate amenities get more serious inquiries.</p>
            <div className="tiles">
              {amenities.map((a) => {
                const on = d.amenities.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`tile${on ? " is-active" : ""}`}
                    aria-pressed={on}
                    onClick={() => set({ amenities: on ? d.amenities.filter((x) => x !== a.id) : [...d.amenities, a.id] })}
                  >
                    {on && <Check size={14} />} {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-stack">
            <label
              className={`dropzone${busy ? " is-busy" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addImages(e.dataTransfer.files);
              }}
            >
              <ImagePlus size={28} />
              <strong>{busy ? "Processing photos…" : "Drag photos here or click to upload"}</strong>
              <span className="muted small">
                JPG, PNG or WebP · up to {settings.maxUploadMb} MB each · max {settings.maxImagesPerListing} photos
              </span>
              <input type="file" accept="image/*" multiple hidden onChange={(e) => addImages(e.target.files)} />
            </label>
            {errors.images && <span className="f__error">{errors.images}</span>}
            {d.images.length > 0 && (
              <div className="thumbs">
                {d.images.map((src, i) => (
                  <div key={i} className="thumbs__item">
                    <img src={src} alt={`Photo ${i + 1}`} />
                    {i === 0 ? (
                      <span className="thumbs__cover">Cover</span>
                    ) : (
                      <button type="button" className="thumbs__btn thumbs__btn--l" title="Make cover photo" aria-label="Make cover photo" onClick={() => set({ images: [src, ...d.images.filter((_, j) => j !== i)] })}>
                        <Star size={14} />
                      </button>
                    )}
                    <button type="button" className="thumbs__btn" aria-label="Remove photo" onClick={() => set({ images: d.images.filter((_, j) => j !== i) })}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="form-grid">
              <Field label="Video tour link (optional)" hint="YouTube or Vimeo URL">
                <input className="input" type="url" value={d.video ?? ""} onChange={(e) => set({ video: e.target.value })} placeholder="https://" />
              </Field>
              <div />
              <FileField label="Floor plan (PDF or image)" value={d.floorPlan} onChange={(v) => set({ floorPlan: v })} accept="application/pdf,image/*" />
              <FileField label="Brochure (PDF)" value={d.brochure} onChange={(v) => set({ brochure: v })} accept="application/pdf" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="form-grid">
            <Field
              label={d.listingType === "sale" ? "Expected price (₹)" : "Monthly rent (₹)"}
              hint={d.price ? `${inrShort(Number(d.price))}${d.listingType === "sale" ? "" : " per month"}` : ""}
              error={errors.price}
            >
              <input className="input" type="number" min="0" inputMode="numeric" value={d.price ?? ""} onChange={(e) => set({ price: e.target.value })} />
            </Field>
            <div className="f">
              <span className="f__label">Price per sq.ft</span>
              <div className="input input--readonly">
                {d.listingType === "sale" && d.price && (d.builtUpArea || d.carpetArea || d.plotArea)
                  ? `₹${Math.round(Number(d.price) / Number(d.builtUpArea || d.carpetArea || d.plotArea)).toLocaleString("en-IN")}`
                  : "Calculated automatically for sale listings"}
              </div>
            </div>
            <Field label="Description" hint={`${d.description.length} / 2000`} error={errors.description} className="span-2">
              <textarea
                className="input"
                rows={7}
                maxLength={2000}
                value={d.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="Describe the layout, condition, nearby schools, transport and anything a buyer should know."
              />
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="review">
            {d.images[0] && <img src={d.images[0]} alt="" className="review__img" />}
            <div>
              <h2>{d.title || "Untitled listing"}</h2>
              <p className="muted">
                {categoryLabel(d.category)} · {LISTING_TYPES.find((t) => t.id === d.listingType)?.label} · {d.locality}, {d.city} {d.pincode}
              </p>
              <p className="review__price">
                {d.price ? inrShort(Number(d.price)) : "—"}
                {d.listingType !== "sale" && " / month"}
              </p>
              <dl className="facts facts--compact">
                {[
                  ["Carpet", d.carpetArea && `${d.carpetArea} sq.ft`],
                  ["Built-up", d.builtUpArea && `${d.builtUpArea} sq.ft`],
                  ["Plot", d.plotArea && `${d.plotArea} sq.ft`],
                  ["Bedrooms", d.bedrooms],
                  ["Bathrooms", d.bathrooms],
                  ["Furnishing", !isPlot && d.furnishing],
                  ["Possession", AVAILABILITY.find((a) => a.id === d.availability)?.label],
                  ["Photos", d.images.length],
                  ["Amenities", d.amenities.length],
                  ["RERA", d.rera],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
              </dl>
              <p className="muted small mt-16">
                {settings.requireListingApproval
                  ? "After you submit, our moderation team reviews the listing before it goes live."
                  : "Your listing goes live as soon as you submit."}{" "}
                By submitting you confirm that you have the right to list this property and the details are accurate.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="wizard__nav">
        <button type="button" className="btn btn--ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ChevronLeft size={18} /> Back
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => save(false)}>
          Save draft
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn--primary" onClick={next}>
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={() => save(true)}>
            <Check size={18} /> {existing ? "Save & resubmit" : "Submit listing"}
          </button>
        )}
      </div>
    </div>
  );
}

function FileField({ label, value, onChange, accept }) {
  return (
    <div className="f">
      <span className="f__label">{label}</span>
      {value ? (
        <div className="filechip">
          <span>{typeof value === "string" ? value.split("/").pop() : value}</span>
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => onChange(null)} aria-label="Remove file">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="btn btn--ghost btn--sm filepick">
          <Upload size={15} /> Choose file
          <input
            type="file"
            accept={accept}
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              // Demo: we keep the file name only. The backend upload API stores the file in S3.
              if (f) onChange(f.name);
            }}
          />
        </label>
      )}
    </div>
  );
}
