"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Smartphone, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, Info } from "lucide-react";
import { actions } from "@/lib/db/store";
import { USER_ROLES, DEMO_OTP } from "@/mock/people";
import { CITIES } from "@/data/catalog";
import { Field } from "@/components/ui/bits";
import { toast } from "@/components/ui/Toast";

const GOOGLE = (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [method, setMethod] = useState("phone");

  function done(msg) {
    toast(msg);
    router.push(next.startsWith("/") ? next : "/account");
  }

  return (
    <section className="auth">
      <div className="auth__art" aria-hidden="true">
        <img src="/images/hero.webp" alt="" />
        <div className="auth__art-copy">
          <p className="eyebrow eyebrow--light">invest2growth</p>
          <p className="auth__quote">
            Homes, markets and money, <em>in one place.</em>
          </p>
          <ul>
            <li><ShieldCheck size={16} /> Verified listings, moderated before they go live</li>
            <li><ShieldCheck size={16} /> Watchlists and price alerts for NSE stocks</li>
            <li><ShieldCheck size={16} /> Save properties, stocks and articles across devices</li>
          </ul>
        </div>
      </div>

      <div className="auth__panel">
        {mode === "login" && (
          <>
            <h1>Welcome back</h1>
            <p className="muted">Log in to manage listings, inquiries and your watchlist.</p>
            <div className="seg seg--light seg--full mt-24" role="tablist">
              <button type="button" role="tab" aria-selected={method === "phone"} className={method === "phone" ? "is-active" : ""} onClick={() => setMethod("phone")}>
                <Smartphone size={16} /> Mobile OTP
              </button>
              <button type="button" role="tab" aria-selected={method === "email"} className={method === "email" ? "is-active" : ""} onClick={() => setMethod("email")}>
                <Mail size={16} /> Email
              </button>
            </div>
            {method === "phone" ? <OtpLogin onDone={done} /> : <EmailLogin onDone={done} />}
            <div className="auth__or">
              <span>or</span>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => {
                actions.loginDemo("u1");
                done("Signed in with Google (demo)");
              }}
            >
              {GOOGLE} Continue with Google
            </button>
            <p className="auth__switch">
              New to invest2growth? <Link href={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link>
            </p>
          </>
        )}

        {mode === "signup" && <Signup onDone={done} />}
        {mode === "forgot" && <Forgot />}

        <p className="demo-note">
          <Info size={14} /> Demo mode: no real OTP or email is sent. Use OTP <strong>{DEMO_OTP}</strong>, or email{" "}
          <strong>aarav.sharma@example.com</strong> with any 6+ character password.
        </p>
      </div>
    </section>
  );
}

function OtpBoxes({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");
  return (
    <div className="otp" onPaste={(e) => {
      const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (v) {
        e.preventDefault();
        onChange(v);
        refs.current[Math.min(v.length, 5)]?.focus();
      }
    }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={d.trim()}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            const arr = value.split("");
            if (ch) arr[Math.min(i, arr.length)] = ch;
            else arr.splice(i, 1);
            onChange(arr.join("").slice(0, 6));
            if (ch && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d.trim() && i > 0) refs.current[i - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

function OtpLogin({ onDone }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!timer) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  function send(e) {
    e?.preventDefault();
    const r = actions.requestOtp(phone);
    if (!r.ok) return setErr(r.error);
    setErr("");
    setSent(true);
    setTimer(30);
    toast(`OTP sent to +91 ${phone} (demo code: ${r.demoOtp})`, "info");
  }

  function verify(e) {
    e.preventDefault();
    const r = actions.verifyOtp(phone, otp);
    if (!r.ok) return setErr(r.error);
    onDone(r.isNew ? "Account created. Complete your profile." : `Welcome back, ${r.user.name.split(" ")[0]}`);
  }

  return !sent ? (
    <form className="form-stack mt-24" onSubmit={send} noValidate>
      <Field label="Mobile number" error={err}>
        <div className="input-group">
          <span>+91</span>
          <input className="input" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" autoComplete="tel-national" autoFocus />
        </div>
      </Field>
      <button type="submit" className="btn btn--primary btn--block">
        Get OTP <ArrowRight size={16} />
      </button>
    </form>
  ) : (
    <form className="form-stack mt-24" onSubmit={verify} noValidate>
      <p className="muted small">
        Enter the 6-digit code sent to <strong>+91 {phone}</strong>.{" "}
        <button type="button" className="link-inline" onClick={() => { setSent(false); setOtp(""); }}>
          Change
        </button>
      </p>
      <OtpBoxes value={otp} onChange={setOtp} />
      {err && <span className="f__error">{err}</span>}
      <button type="submit" className="btn btn--primary btn--block" disabled={otp.length !== 6}>
        Verify & continue
      </button>
      <button type="button" className="link-inline center" disabled={timer > 0} onClick={send}>
        {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
      </button>
    </form>
  );
}

function EmailLogin({ onDone }) {
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  function submit(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const r = actions.loginEmail(d.email, d.password);
    if (!r.ok) return setErr(r.error);
    onDone(`Welcome back, ${r.user.name.split(" ")[0]}`);
  }
  return (
    <form className="form-stack mt-24" onSubmit={submit} noValidate>
      <Field label="Email">
        <input className="input" name="email" type="email" autoComplete="email" required autoFocus />
      </Field>
      <Field label="Password">
        <div className="input-pw">
          <input className="input" name="password" type={show ? "text" : "password"} autoComplete="current-password" required />
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>
      <div className="row-between">
        <label className="check">
          <input type="checkbox" defaultChecked /> <span>Keep me logged in</span>
        </label>
        <Link href="/forgot-password" className="link-inline">
          Forgot password?
        </Link>
      </div>
      {err && <span className="f__error">{err}</span>}
      <button type="submit" className="btn btn--primary btn--block">
        Log in
      </button>
    </form>
  );
}

function Signup({ onDone }) {
  const [role, setRole] = useState("buyer");
  const [errors, setErrors] = useState({});
  function submit(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const er = {};
    if (d.name.trim().length < 2) er.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(d.email)) er.email = "Enter a valid email";
    if (d.phone.replace(/\D/g, "").length !== 10) er.phone = "Enter a 10-digit mobile number";
    if (d.password.length < 8 || !/\d/.test(d.password) || !/[A-Za-z]/.test(d.password)) er.password = "At least 8 characters with letters and numbers";
    if (!d.terms) er.terms = "Please accept the terms";
    setErrors(er);
    if (Object.keys(er).length) return;
    const r = actions.signup({ ...d, role });
    if (!r.ok) return setErrors({ email: r.error });
    onDone(["agent", "builder", "agency"].includes(role) ? "Account created. Your professional profile is pending verification." : "Welcome to invest2growth!");
  }
  return (
    <>
      <h1>Create your account</h1>
      <p className="muted">Free for buyers, owners and professionals.</p>
      <form className="form-stack mt-24" onSubmit={submit} noValidate>
        <div className="f">
          <span className="f__label">I am a</span>
          <div className="tiles tiles--sm">
            {USER_ROLES.map((r) => (
              <button key={r.id} type="button" className={`tile${role === r.id ? " is-active" : ""}`} onClick={() => setRole(r.id)} aria-pressed={role === r.id}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <Field label={["builder", "agency"].includes(role) ? "Company name" : "Full name"} error={errors.name}>
          <input className="input" name="name" autoComplete="name" />
        </Field>
        <div className="form-grid">
          <Field label="Email" error={errors.email}>
            <input className="input" name="email" type="email" autoComplete="email" />
          </Field>
          <Field label="Mobile number" error={errors.phone}>
            <input className="input" name="phone" inputMode="numeric" maxLength={10} autoComplete="tel-national" />
          </Field>
        </div>
        <div className="form-grid">
          <Field label="City">
            <select className="input" name="city" defaultValue="">
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Password" error={errors.password}>
            <input className="input" name="password" type="password" autoComplete="new-password" />
          </Field>
        </div>
        {["agent", "builder", "agency"].includes(role) && (
          <p className="banner banner--info small">
            <Info size={16} /> Professional accounts are verified by our team (RERA and KYC) before your listings get the verified badge.
          </p>
        )}
        <label className="check">
          <input type="checkbox" name="terms" />
          <span>
            I agree to the <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>, and consent to processing of my data as described.
          </span>
        </label>
        {errors.terms && <span className="f__error">{errors.terms}</span>}
        <button type="submit" className="btn btn--primary btn--block">
          Create account
        </button>
      </form>
      <p className="auth__switch">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}

function Forgot() {
  const [sent, setSent] = useState("");
  return (
    <>
      <Link href="/login" className="link-inline">
        <ArrowLeft size={14} /> Back to log in
      </Link>
      <h1 className="mt-16">Reset your password</h1>
      {sent ? (
        <div className="banner banner--good mt-24">
          <ShieldCheck size={18} />
          <span>
            If an account exists for <strong>{sent}</strong>, we&apos;ve sent a reset link. It expires in 30 minutes.
          </span>
        </div>
      ) : (
        <form
          className="form-stack mt-24"
          onSubmit={(e) => {
            e.preventDefault();
            const email = new FormData(e.currentTarget).get("email");
            if (/^\S+@\S+\.\S+$/.test(email)) setSent(email);
          }}
        >
          <p className="muted">Enter your account email and we&apos;ll send you a link to set a new password.</p>
          <Field label="Email">
            <input className="input" name="email" type="email" required autoFocus />
          </Field>
          <button type="submit" className="btn btn--primary btn--block">
            Send reset link
          </button>
          <p className="muted small">Signed up with a mobile number? Just log in with OTP instead.</p>
        </form>
      )}
    </>
  );
}
