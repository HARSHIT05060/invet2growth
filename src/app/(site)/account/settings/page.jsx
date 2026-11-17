"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, KeyRound, LogOut } from "lucide-react";
import { useDb, selectMe, actions, getState } from "@/lib/db/store";
import { Toggle, Field } from "@/components/ui/bits";
import { Confirm } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";

const CHANNELS = [
  ["push", "Push notifications", "On the mobile app and this browser"],
  ["email", "Email", "Summaries and important account messages"],
  ["sms", "SMS", "OTPs are always sent, regardless of this setting"],
  ["whatsapp", "WhatsApp", "Lead alerts on WhatsApp"],
];
const TOPICS = [
  ["leads", "New inquiries and site visits", "When someone contacts you about a listing"],
  ["alerts", "Stock price alerts", "When a stock crosses a price you set"],
  ["news", "News digest", "Top market and property stories"],
  ["marketing", "Offers and promotions", "Occasional partner offers"],
];

export default function SettingsPage() {
  const router = useRouter();
  const me = useDb(selectMe);
  const prefs = useDb((s) => s.me.prefs);
  const [confirm, setConfirm] = useState(false);
  const [pwErr, setPwErr] = useState("");

  function exportData() {
    const s = getState();
    const data = {
      exportedAt: new Date().toISOString(),
      profile: me,
      listings: s.properties.filter((p) => p.ownerId === me.id),
      inquiriesReceived: s.inquiries.filter((i) => i.ownerId === me.id),
      saved: s.me,
      notifications: s.notifications.filter((n) => n.userId === me.id),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: "invest2growth-my-data.json" }).click();
    URL.revokeObjectURL(url);
    toast("Your data export has downloaded");
  }

  function changePw(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    if (d.next.length < 8 || !/\d/.test(d.next) || !/[A-Za-z]/.test(d.next)) return setPwErr("Use at least 8 characters with letters and numbers.");
    if (d.next !== d.confirm) return setPwErr("Passwords don't match.");
    setPwErr("");
    e.currentTarget.reset();
    toast("Password updated");
  }

  return (
    <>
      <div className="acct__head">
        <h1>Settings & privacy</h1>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2>Notification channels</h2>
        </div>
        {CHANNELS.map(([k, l, d]) => (
          <Toggle key={k} label={l} description={d} checked={prefs[k]} onChange={(v) => actions.setPrefs({ [k]: v })} />
        ))}
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2>What to notify me about</h2>
        </div>
        {TOPICS.map(([k, l, d]) => (
          <Toggle key={k} label={l} description={d} checked={prefs[k]} onChange={(v) => actions.setPrefs({ [k]: v })} />
        ))}
      </section>

      <form className="panel form-stack" onSubmit={changePw}>
        <div className="panel__head">
          <h2>
            <KeyRound size={18} /> Password
          </h2>
        </div>
        <div className="form-grid form-grid--3">
          <Field label="Current password">
            <input className="input" type="password" name="current" autoComplete="current-password" />
          </Field>
          <Field label="New password">
            <input className="input" type="password" name="next" autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <input className="input" type="password" name="confirm" autoComplete="new-password" />
          </Field>
        </div>
        {pwErr && <p className="f__error">{pwErr}</p>}
        <div>
          <button type="submit" className="btn btn--primary btn--sm">
            Update password
          </button>
        </div>
      </form>

      <section className="panel">
        <div className="panel__head">
          <h2>Your data</h2>
        </div>
        <p className="muted mb-16">
          Under India&apos;s Digital Personal Data Protection Act you can access a copy of your data or ask us to erase it.
        </p>
        <div className="row-wrap">
          <button type="button" className="btn btn--ghost btn--sm" onClick={exportData}>
            <Download size={15} /> Download my data
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { actions.logout(); router.push("/"); }}>
            <LogOut size={15} /> Log out
          </button>
          <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => setConfirm(true)}>
            <Trash2 size={15} /> Delete account
          </button>
        </div>
      </section>

      <Confirm
        open={confirm}
        onClose={() => setConfirm(false)}
        danger
        title="Delete your account?"
        message="Your listings will be taken down and your personal data erased within 30 days, except records we must keep by law."
        confirmLabel="Delete account"
        onConfirm={() => {
          const s = getState();
          actions.adminSave("users", { ...me, status: "deleted", deletedAt: new Date().toISOString() }, "User requested account deletion");
          s.properties.filter((p) => p.ownerId === me.id).forEach((p) => actions.deleteProperty(p.id));
          actions.logout();
          toast("Account deletion requested");
          router.push("/");
        }}
      />
    </>
  );
}
