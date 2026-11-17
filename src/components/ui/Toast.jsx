"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

const listeners = new Set();
let n = 0;

/** toast("Saved") · toast("Couldn't save", "error") · toast("Heads up", "info") */
export function toast(message, tone = "success") {
  const t = { id: ++n, message, tone };
  listeners.forEach((l) => l(t));
}

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

export default function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const add = (t) => {
      setItems((s) => [...s.slice(-3), t]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== t.id)), 3600);
    };
    listeners.add(add);
    return () => listeners.delete(add);
  }, []);

  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => {
        const Icon = ICONS[t.tone] ?? Info;
        return (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            <Icon size={18} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
