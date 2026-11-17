"use client";

import { useState } from "react";
import { PlugZap, KeyRound, Eye, EyeOff, Activity, Lock, Info } from "lucide-react";
import { useDb, actions, selectAdmin } from "@/lib/db/store";
import { market } from "@/lib/market";
import { PageHeader } from "@/components/admin/ui";
import { Field, Toggle, Status } from "@/components/ui/bits";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { dateTime } from "@/lib/format";

const KIND = { market: "Market data", otp: "SMS / OTP", storage: "File storage" };
const STATUS = { operational: ["good", "Operational"], simulated: ["info", "Simulated (dev)"], degraded: ["warn", "Degraded"], down: ["bad", "Down"], "not-configured": ["neutral", "Not configured"] };

const mask = (k) => (k ? `${k.slice(0, 7)}${"•".repeat(10)}${k.slice(-4)}` : "Not set");

export default function ProvidersPage() {
  const admin = useDb(selectAdmin);
  const providers = useDb((s) => s.providers);
  const [edit, setEdit] = useState(null);
  const [testing, setTesting] = useState(null);

  // Defence in depth: the nav and shell already gate this page by permission,
  // but credentials are additionally restricted to the Super Admin role.
  if (admin.role !== "super_admin") {
    return (
      <div className="empty">
        <span className="empty__icon">
          <Lock size={22} />
        </span>
        <h3>Super Admin only</h3>
        <p>Market data provider credentials and integrations can only be managed by a Super Admin.</p>
      </div>
    );
  }

  async function test(p) {
    setTesting(p.id);
    const started = performance.now();
    let status = "operational";
    try {
      if (p.kind === "market") await market.quote("RELIANCE");
      if (!p.apiKey || !p.baseUrl) status = "not-configured";
      else if (market.provider.id === "mock" || p.status === "simulated") status = "simulated";
    } catch {
      status = "down";
    }
    const latencyMs = Math.round(performance.now() - started);
    actions.adminSave("providers", { ...p, status, latencyMs, lastCheckedAt: new Date().toISOString() }, `Connection test: ${status}`);
    setTesting(null);
    toast(status === "down" ? `${p.name}: connection failed` : `${p.name}: ${STATUS[status][1]} (${latencyMs} ms)`, status === "down" ? "error" : "success");
  }

  return (
    <>
      <PageHeader title="API provider configuration" description="Credentials and settings for external services. Changes are audit-logged." />

      <div className="banner banner--info">
        <Info size={18} />
        <span>
          Active market data adapter: <strong>{market.provider.label}</strong>. Use only an authorised NSE data vendor in production. Never scrape the
          NSE website. Real-time display requires the vendor&apos;s and exchange&apos;s licence; otherwise data must be labelled as delayed.
        </span>
      </div>

      <div className="prov-grid">
        {providers.map((p) => {
          const [tone, label] = p.enabled ? STATUS[p.status] ?? ["neutral", p.status] : ["neutral", "Disabled"];
          return (
            <section key={p.id} className="panel prov">
              <div className="prov__head">
                <span className="prov__icon">
                  <PlugZap size={18} />
                </span>
                <div>
                  <h2>{p.name}</h2>
                  <span className="muted small">
                    {KIND[p.kind]} · {p.role} · {p.vendor}
                  </span>
                </div>
                <Status tone={tone}>{label}</Status>
              </div>
              <dl className="kv">
                <div>
                  <dt>Base URL</dt>
                  <dd className="small">{p.baseUrl || "—"}</dd>
                </div>
                <div>
                  <dt>API key</dt>
                  <dd className="small">
                    <code className="code">{mask(p.apiKey)}</code>
                  </dd>
                </div>
                {p.kind === "market" && (
                  <>
                    <div>
                      <dt>Data mode</dt>
                      <dd>{p.mode === "realtime" ? "Real-time" : "Delayed"}</dd>
                    </div>
                    <div>
                      <dt>Poll / cache</dt>
                      <dd>
                        {p.pollSeconds}s / {p.cacheSeconds}s
                      </dd>
                    </div>
                  </>
                )}
                <div>
                  <dt>Rate limit</dt>
                  <dd>{p.rateLimit ? `${p.rateLimit} req/min` : "—"}</dd>
                </div>
                <div>
                  <dt>Last check</dt>
                  <dd className="small">{p.lastCheckedAt ? `${dateTime(p.lastCheckedAt)}${p.latencyMs ? ` · ${p.latencyMs} ms` : ""}` : "Never"}</dd>
                </div>
              </dl>
              <div className="row-wrap mt-16">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEdit(p)}>
                  <KeyRound size={15} /> Configure
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => test(p)} disabled={testing === p.id || !p.enabled}>
                  <Activity size={15} /> {testing === p.id ? "Testing…" : "Test connection"}
                </button>
              </div>
            </section>
          );
        })}
      </div>
      {edit && <ProviderForm p={edit} onClose={() => setEdit(null)} />}
    </>
  );
}

function ProviderForm({ p, onClose }) {
  const [d, setD] = useState({ ...p, apiKey: "" });
  const [show, setShow] = useState(false);
  const set = (x) => setD((o) => ({ ...o, ...x }));

  function save() {
    if (d.enabled && !/^(https?|wss?):\/\//.test(d.baseUrl)) return toast("Enter a valid base URL", "error");
    const record = { ...d, apiKey: d.apiKey ? d.apiKey : p.apiKey, status: d.enabled ? (d.apiKey || p.apiKey ? p.status === "not-configured" ? "simulated" : p.status : "not-configured") : p.status };
    actions.adminSave("providers", record, d.apiKey ? `Rotated credentials for ${p.name}` : `Updated ${p.name}`);
    toast("Provider saved. Secrets are stored encrypted on the server in production.");
    onClose();
  }

  return (
    <Modal
      open
      side
      onClose={onClose}
      title={`Configure: ${p.name}`}
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="form-stack">
        <Toggle label="Enabled" checked={d.enabled} onChange={(v) => set({ enabled: v })} />
        <Field label="Vendor">
          <input className="input" value={d.vendor} onChange={(e) => set({ vendor: e.target.value })} />
        </Field>
        <Field label="Base URL">
          <input className="input" value={d.baseUrl} onChange={(e) => set({ baseUrl: e.target.value })} />
        </Field>
        {p.kind === "market" && (
          <Field label="WebSocket URL (optional)">
            <input className="input" value={d.wsUrl} onChange={(e) => set({ wsUrl: e.target.value })} placeholder="wss://" />
          </Field>
        )}
        <Field label="API key / secret" hint={`Current: ${mask(p.apiKey)}. Leave blank to keep it.`}>
          <div className="input-pw">
            <input className="input" type={show ? "text" : "password"} value={d.apiKey} onChange={(e) => set({ apiKey: e.target.value })} autoComplete="off" placeholder="Paste a new key to rotate" />
            <button type="button" className="icon-btn icon-btn--sm" onClick={() => setShow(!show)} aria-label={show ? "Hide" : "Show"}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <div className="form-grid">
          {p.kind === "market" && (
            <>
              <Field label="Role">
                <select className="input" value={d.role} onChange={(e) => set({ role: e.target.value })}>
                  <option value="primary">Primary</option>
                  <option value="fallback">Fallback</option>
                </select>
              </Field>
              <Field label="Data mode" hint="Real-time only if licensed">
                <select className="input" value={d.mode} onChange={(e) => set({ mode: e.target.value })}>
                  <option value="delayed">Delayed</option>
                  <option value="realtime">Real-time</option>
                </select>
              </Field>
              <Field label="Poll interval (s)">
                <input className="input" type="number" min="1" value={d.pollSeconds} onChange={(e) => set({ pollSeconds: Number(e.target.value) })} />
              </Field>
              <Field label="Cache TTL (s)">
                <input className="input" type="number" min="0" value={d.cacheSeconds} onChange={(e) => set({ cacheSeconds: Number(e.target.value) })} />
              </Field>
            </>
          )}
          <Field label="Rate limit (req/min)">
            <input className="input" type="number" min="0" value={d.rateLimit} onChange={(e) => set({ rateLimit: Number(e.target.value) })} />
          </Field>
          <Field label="Timeout (ms)">
            <input className="input" type="number" min="500" value={d.timeoutMs} onChange={(e) => set({ timeoutMs: Number(e.target.value) })} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
