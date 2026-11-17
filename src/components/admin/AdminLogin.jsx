"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, Info, ArrowLeft } from "lucide-react";
import { actions, useDb } from "@/lib/db/store";
import { DEMO_ADMIN_PASSWORD } from "@/mock/people";
import { Field } from "@/components/ui/bits";
import { ROLE_LABEL } from "./nav";

export default function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const admins = useDb((s) => s.admins);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  function submit(e) {
    e.preventDefault();
    const r = actions.adminLogin(email, password);
    if (!r.ok) return setErr(r.error);
    const next = params.get("next");
    router.replace(next?.startsWith("/admin") ? next : "/admin");
  }

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <img src="/images/logo.png" alt="invest2growth" width="160" height="30" />
        <h1>
          <ShieldCheck size={22} /> Admin sign in
        </h1>
        <p className="muted">Restricted area. All actions are logged.</p>
        <form className="form-stack mt-24" onSubmit={submit} noValidate>
          <Field label="Work email">
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus />
          </Field>
          <Field label="Password">
            <div className="input-pw">
              <input className="input" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" className="icon-btn icon-btn--sm" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          {err && <p className="f__error">{err}</p>}
          <button type="submit" className="btn btn--primary btn--block">
            Sign in
          </button>
        </form>

        <div className="demo-note">
          <Info size={14} />
          <div>
            <strong>Demo accounts</strong> (password <code>{DEMO_ADMIN_PASSWORD}</code>). Pick one to fill the form:
            <div className="adm-login__demo">
              {admins.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="chip chip--sm"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(DEMO_ADMIN_PASSWORD);
                  }}
                >
                  {ROLE_LABEL[a.role]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Link href="/" className="link-inline mt-16">
          <ArrowLeft size={14} /> Back to website
        </Link>
      </div>
    </div>
  );
}
