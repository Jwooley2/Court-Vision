"use client";

import { useState } from "react";

export type ComparisonPlayer = {
  id: number;
  name: string;
  position: string | null;
  cutoff: string;
  career: Record<string, number | null>;
  playoffs: Record<string, number | null>;
  honors: Record<string, number | null>;
  playoffGames: number | null;
};

type GroupName = "Regular Season" | "Playoffs" | "Accomplishments";

const STAT_ROWS: Record<GroupName, { key: string; label: string; pct?: boolean }[]> = {
  "Regular Season": [
    { key: "games", label: "Games" },
    { key: "ppg", label: "Points per game" },
    { key: "rpg", label: "Rebounds per game" },
    { key: "apg", label: "Assists per game" },
    { key: "spg", label: "Steals per game" },
    { key: "bpg", label: "Blocks per game" },
    { key: "fg", label: "Field goal %", pct: true },
    { key: "three", label: "3-point %", pct: true },
    { key: "ft", label: "Free throw %", pct: true },
    { key: "ts", label: "True shooting %", pct: true },
  ],
  "Playoffs": [
    { key: "games", label: "Playoff games" },
    { key: "appearances", label: "Postseasons" },
    { key: "ppg", label: "Points per game" },
    { key: "rpg", label: "Rebounds per game" },
    { key: "apg", label: "Assists per game" },
    { key: "spg", label: "Steals per game" },
    { key: "bpg", label: "Blocks per game" },
    { key: "fg", label: "Field goal %", pct: true },
  ],
  "Accomplishments": [
    { key: "championships", label: "NBA championships" },
    { key: "mvps", label: "League MVPs" },
    { key: "finalsMvps", label: "Finals MVPs" },
    { key: "dpoy", label: "Defensive Player of the Year" },
    { key: "allNba", label: "All-NBA selections" },
    { key: "allDefense", label: "All-Defensive selections" },
    { key: "allStars", label: "All-Star selections" },
    { key: "scoring", label: "Scoring titles" },
    { key: "steals", label: "Steals titles" },
    { key: "assists", label: "Assists titles" },
    { key: "olympicGold", label: "Olympic gold medals" },
  ],
};

function fmt(value: number | null | undefined, pct?: boolean) {
  if (value == null || !Number.isFinite(value)) return "—";
  return pct ? (value * 100).toFixed(1) + "%" : Number.isInteger(value) ? value.toLocaleString("en-US") : value.toFixed(1);
}

/** Transparent, no universal 'GOAT score': each fan chooses what matters. */
export default function ComparisonBoard({ left, right }: { left: ComparisonPlayer; right: ComparisonPlayer }) {
  const [enabled, setEnabled] = useState<Record<GroupName, boolean>>({
    "Regular Season": true, Playoffs: true, Accomplishments: true,
  });
  const [selected, setSelected] = useState<string[]>(Object.entries(STAT_ROWS).flatMap(([group, rows]) =>
    rows.map(row => group + ":" + row.key)));
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const hasAny = Object.values(enabled).some(Boolean) && selected.length > 0;
  return (
    <section aria-label="Custom player comparison">
      <div style={{ background: "#171717", border: "1px solid #444", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>What matters to you?</h2>
        <p style={{ color: "#aaa" }}>Choose the categories and metrics you value. Court Vision does not declare a winner or hide an algorithm behind a score.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
          {(Object.keys(STAT_ROWS) as GroupName[]).map(group => (
            <label key={group} style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={enabled[group]}
                onChange={event => setEnabled(old => ({ ...old, [group]: event.target.checked }))} /> {group}
            </label>
          ))}
          <label style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={showDifferencesOnly}
              onChange={event => setShowDifferencesOnly(event.target.checked)} /> Show differences only
          </label>
        </div>
        <details style={{ marginTop: "1rem" }}>
          <summary style={{ cursor: "pointer" }}>Customize individual statistics</summary>
          <div style={{ marginTop: "0.75rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
            {(Object.keys(STAT_ROWS) as GroupName[]).flatMap(group => STAT_ROWS[group].map(row => {
              const key = group + ":" + row.key;
              return (
                <label key={key} style={{ fontSize: "0.9rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={selected.includes(key)}
                    onChange={event => setSelected(old => event.target.checked
                      ? [...old, key] : old.filter(item => item !== key))} /> {row.label} <small style={{ color: "#999" }}>({group})</small>
                </label>
              );
            }))}
          </div>
        </details>
        <button type="button" style={{ marginTop: "1rem", background: "#292929", color: "#fff", border: "1px solid #666", borderRadius: 6, padding: "0.45rem 0.7rem", cursor: "pointer" }}
          onClick={() => { setEnabled({ "Regular Season": true, Playoffs: true, Accomplishments: true }); setSelected(Object.entries(STAT_ROWS).flatMap(([group, rows]) => rows.map(row => group + ":" + row.key))); setShowDifferencesOnly(false); }}>
          Reset comparison
        </button>
      </div>
      {!hasAny && <p role="status">Select at least one category and statistic to compare.</p>}
      {(Object.keys(STAT_ROWS) as GroupName[]).filter(group => enabled[group]).map(group => {
        const l = group === "Regular Season" ? left.career : group === "Playoffs" ? left.playoffs : left.honors;
        const r = group === "Regular Season" ? right.career : group === "Playoffs" ? right.playoffs : right.honors;
        const rows = STAT_ROWS[group].filter(row => selected.includes(group + ":" + row.key) &&
          (!showDifferencesOnly || fmt(l[row.key], row.pct) !== fmt(r[row.key], row.pct)));
        if (rows.length === 0) return null;
        return (
          <section key={group} style={{ marginBottom: "2rem" }}>
            <h2>{group}</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
                <thead><tr style={{ borderBottom: "1px solid #777" }}>
                  <th scope="col" style={{ padding: "0.85rem", textAlign: "left" }}>Metric</th>
                  <th scope="col" style={{ padding: "0.85rem", textAlign: "right" }}>{left.name}</th>
                  <th scope="col" style={{ padding: "0.85rem", textAlign: "right" }}>{right.name}</th>
                </tr></thead>
                <tbody>{rows.map(row => (
                  <tr key={row.key} style={{ borderBottom: "1px solid #333" }}>
                    <th scope="row" style={{ padding: "0.8rem", textAlign: "left", fontWeight: 400 }}>{row.label}</th>
                    <td style={{ padding: "0.8rem", textAlign: "right", fontWeight: 600 }}>{fmt(l[row.key], row.pct)}</td>
                    <td style={{ padding: "0.8rem", textAlign: "right", fontWeight: 600 }}>{fmt(r[row.key], row.pct)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        );
      })}
      <p style={{ color: "#aaa", fontSize: "0.875rem" }}>
        Statistics reflect available career records, not era-adjusted equivalents.
        A dash means unavailable, not zero. {left.name}: {left.cutoff}. {right.name}: {right.cutoff}.
        Championship titles are separate from individual awards.
      </p>
    </section>
  );
}
