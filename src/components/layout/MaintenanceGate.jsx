"use client";

import { Wrench } from "lucide-react";
import { useDb, useHydrated } from "@/lib/db/store";

/** Replaces the public site with a notice while Admin → Settings → Maintenance mode is on. */
export default function MaintenanceGate({ children }) {
  const hydrated = useHydrated();
  const on = useDb((s) => s.settings.maintenanceMode);
  const contact = useDb((s) => s.settings.supportEmail);
  if (!hydrated || !on) return children;
  return (
    <div className="container page-pad">
      <div className="empty">
        <span className="empty__icon">
          <Wrench size={22} />
        </span>
        <h3>We&apos;ll be right back</h3>
        <p>
          invest2growth is undergoing scheduled maintenance. Please check back shortly. For urgent help, email <a href={`mailto:${contact}`}>{contact}</a>.
        </p>
      </div>
    </div>
  );
}
