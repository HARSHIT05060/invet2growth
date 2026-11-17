"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { downloadCsv } from "@/lib/format";
import { Empty } from "@/components/ui/bits";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="adm-head">
      <div>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {actions && <div className="adm-head__actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tone, href }) {
  const Tag = href ? "a" : "div";
  return (
    <Tag className={`astat${tone ? ` astat--${tone}` : ""}`} href={href}>
      <span className="astat__icon">
        <Icon size={18} />
      </span>
      <span className="astat__label">{label}</span>
      <span className="astat__value">{value}</span>
      {sub && <span className="astat__sub">{sub}</span>}
    </Tag>
  );
}

/**
 * Generic admin table: search, column sort, pagination, row selection + bulk actions, CSV export.
 * columns: [{ key, label, render?(row), sort?: (row) => value, className?, width? }]
 */
export function DataTable({
  rows,
  columns,
  searchKeys = [],
  searchPlaceholder = "Search",
  filters,
  bulk,
  pageSize = 10,
  exportName,
  exportRow,
  empty = "Nothing to show",
  rowKey = (r) => r.id,
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(null); // { key, dir }
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState([]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = s ? rows.filter((r) => searchKeys.some((k) => String(typeof k === "function" ? k(r) : r[k] ?? "").toLowerCase().includes(s))) : rows;
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      const get = col?.sort ?? ((r) => r[sort.key]);
      out = [...out].sort((a, b) => {
        const x = get(a);
        const y = get(b);
        return (x > y ? 1 : x < y ? -1 : 0) * sort.dir;
      });
    }
    return out;
  }, [rows, q, sort, columns, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const selected = sel.filter((id) => rows.some((r) => rowKey(r) === id));
  const allOnPage = shown.length > 0 && shown.every((r) => selected.includes(rowKey(r)));

  return (
    <div className="dt">
      <div className="dt__bar">
        {searchKeys.length > 0 && (
          <label className="dt__search">
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </label>
        )}
        {filters}
        <div className="dt__bar-right">
          {bulk && selected.length > 0 && (
            <div className="dt__bulk">
              <span>{selected.length} selected</span>
              {bulk.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  className={`btn btn--sm ${b.danger ? "btn--ghost btn--danger-text" : "btn--ghost"}`}
                  onClick={() => {
                    b.onClick(selected);
                    setSel([]);
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
          {exportName && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => downloadCsv(exportName, filtered.map(exportRow ?? ((r) => r)))} disabled={!filtered.length}>
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty title={empty} text={q ? "Try a different search." : undefined} />
      ) : (
        <div className="dt__wrap">
          <table className="dtable adm-table">
            <thead>
              <tr>
                {bulk && (
                  <th className="dt__check">
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={allOnPage}
                      onChange={(e) => setSel(e.target.checked ? [...new Set([...selected, ...shown.map(rowKey)])] : selected.filter((id) => !shown.some((r) => rowKey(r) === id)))}
                    />
                  </th>
                )}
                {columns.map((c) => (
                  <th key={c.key} className={c.className} style={c.width ? { width: c.width } : undefined}>
                    {c.sort !== false && c.label ? (
                      <button
                        type="button"
                        className="dt__sort"
                        onClick={() => setSort(sort?.key === c.key ? (sort.dir === 1 ? { key: c.key, dir: -1 } : null) : { key: c.key, dir: 1 })}
                      >
                        {c.label}
                        {sort?.key === c.key ? sort.dir === 1 ? <ArrowUp size={13} /> : <ArrowDown size={13} /> : <ArrowUpDown size={13} className="dt__sort-idle" />}
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const id = rowKey(r);
                return (
                  <tr key={id} className={selected.includes(id) ? "is-selected" : ""}>
                    {bulk && (
                      <td className="dt__check">
                        <input type="checkbox" aria-label="Select row" checked={selected.includes(id)} onChange={(e) => setSel(e.target.checked ? [...selected, id] : selected.filter((x) => x !== id))} />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={c.className}>
                        {c.render ? c.render(r) : r[c.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > pageSize && (
        <div className="dt__pager">
          <span className="muted small">
            {(cur - 1) * pageSize + 1}–{Math.min(cur * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div>
            <button type="button" className="icon-btn icon-btn--sm" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Previous page">
              <ChevronLeft size={16} />
            </button>
            <span className="small">
              Page {cur} of {pages}
            </span>
            <button type="button" className="icon-btn icon-btn--sm" disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Next page">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Small <select> used in table filter bars. */
export function FilterSelect({ value, onChange, options, label }) {
  return (
    <select className="input input--sm" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

export function RowActions({ children }) {
  return <div className="row-actions">{children}</div>;
}
