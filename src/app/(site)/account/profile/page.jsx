"use client";

import { useState } from "react";
import { Camera, Trash2, BadgeCheck } from "lucide-react";
import { useDb, selectMe, actions } from "@/lib/db/store";
import { USER_ROLES } from "@/mock/people";
import { CITIES } from "@/data/catalog";
import { initials, date } from "@/lib/format";
import { Field, Status } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";

function readAvatar(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const s = Math.min(img.width, img.height);
      c.width = c.height = 240;
      c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 240, 240);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ProfilePage() {
  const me = useDb(selectMe);
  const [errors, setErrors] = useState({});

  async function onAvatar(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Choose an image file", "error");
    actions.updateProfile({ avatar: await readAvatar(f) });
    toast("Profile photo updated");
  }

  function submit(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const er = {};
    if (d.name.trim().length < 2) er.name = "Enter your name";
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) er.email = "Enter a valid email";
    setErrors(er);
    if (Object.keys(er).length) return;
    actions.updateProfile({ ...d, emailVerified: d.email === me.email ? me.emailVerified : false });
    toast("Profile saved");
  }

  return (
    <>
      <div className="acct__head">
        <h1>Profile</h1>
        <p className="muted">Member since {date(me.joinedAt, { month: "long", year: "numeric" })}</p>
      </div>

      <section className="panel">
        <div className="avatar-edit">
          {me.avatar ? <img src={me.avatar} alt="" className="avatar avatar--xl" /> : <span className="avatar avatar--xl">{initials(me.name)}</span>}
          <div>
            <label className="btn btn--ghost btn--sm">
              <Camera size={15} /> Change photo
              <input type="file" accept="image/*" hidden onChange={onAvatar} />
            </label>
            {me.avatar && (
              <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => actions.updateProfile({ avatar: null })}>
                <Trash2 size={15} /> Remove
              </button>
            )}
            <p className="muted small">Square image, at least 240 × 240 px.</p>
          </div>
        </div>
      </section>

      <form className="panel form-stack" onSubmit={submit} noValidate key={me.id}>
        <div className="panel__head">
          <h2>Personal details</h2>
        </div>
        <div className="form-grid">
          <Field label="Full name" error={errors.name}>
            <input className="input" name="name" defaultValue={me.name === "New user" ? "" : me.name} />
          </Field>
          <Field label="Account type">
            <select className="input" name="role" defaultValue={me.role}>
              {USER_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Email" error={errors.email}>
            <input className="input" name="email" type="email" defaultValue={me.email} />
          </Field>
          <div className="f">
            <span className="f__label">Mobile number</span>
            <div className="input input--readonly row-between">
              {me.phone}
              {me.phoneVerified ? (
                <Status tone="good">
                  <BadgeCheck size={13} /> Verified
                </Status>
              ) : (
                <Status tone="warn">Unverified</Status>
              )}
            </div>
          </div>
          <Field label="City">
            <select className="input" name="city" defaultValue={me.city}>
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Email status">
            <div className="input input--readonly">{me.email ? (me.emailVerified ? "Verified" : "Verification link pending") : "No email added"}</div>
          </Field>
        </div>
        <div>
          <button type="submit" className="btn btn--primary btn--sm">
            Save changes
          </button>
        </div>
      </form>
    </>
  );
}
