"use client";

import { useState } from "react";
import { useDb } from "@/lib/db/store";
import { PageHeader, DataTable, FilterSelect } from "@/components/admin/ui";
import { dateTime } from "@/lib/format";
import { ROLE_LABEL } from "@/components/admin/nav";

export default function AuditLogsPage() {
  const logs = useDb((s) => s.auditLogs);
  const [actor, setActor] = useState("");
  const [area, setArea] = useState("");
  const actors = [...new Set(logs.map((l) => l.actor))];
  const areas = [...new Set(logs.map((l) => l.action.split(".")[0]))].sort();

  return (
    <>
      <PageHeader title="Audit logs" description="Every admin action, newest first. Logs are append-only and retained for 1 year." />
      <section className="panel">
        <DataTable
          rows={logs.filter((l) => (!actor || l.actor === actor) && (!area || l.action.startsWith(`${area}.`)))}
          searchKeys={["actor", "action", "target", "detail"]}
          searchPlaceholder="Search actions, targets or details"
          pageSize={15}
          exportName="audit-log.csv"
          filters={
            <>
              <FilterSelect label="Admin" value={actor} onChange={setActor} options={[["", "All admins"], ...actors.map((a) => [a, a])]} />
              <FilterSelect label="Area" value={area} onChange={setArea} options={[["", "All areas"], ...areas.map((a) => [a, a])]} />
            </>
          }
          columns={[
            { key: "createdAt", label: "Time", sort: (l) => Date.parse(l.createdAt), render: (l) => <span className="small nowrap">{dateTime(l.createdAt)}</span> },
            { key: "actor", label: "Admin", render: (l) => <span className="cell-stack"><strong>{l.actor}</strong><small>{ROLE_LABEL[l.actorRole] ?? l.actorRole}</small></span> },
            { key: "action", label: "Action", render: (l) => <code className="code">{l.action}</code> },
            { key: "target", label: "Target", render: (l) => <code className="code">{l.target}</code> },
            { key: "detail", label: "Detail", sort: false, render: (l) => <span className="small">{l.detail}</span> },
            { key: "ip", label: "IP", render: (l) => <span className="small muted num">{l.ip}</span> },
          ]}
          empty="No log entries"
        />
      </section>
    </>
  );
}
