import { useEffect, useRef } from "react";
import { today, addDays, fromKey } from "./lib/dates.js";

// GitHub-style grid: 26 weeks, columns are weeks, rows are Mon→Sun.
export default function Heatmap({ done, color, weeks = 26 }) {
  const set = new Set(done);
  const t = today();
  const dow = (fromKey(t).getDay() + 6) % 7; // 0 = Monday
  const start = addDays(t, -(weeks - 1) * 7 - dow);
  const cols = [];
  const months = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const k = addDays(start, w * 7 + d);
      col.push(k > t ? null : k);
    }
    const first = col.find(Boolean);
    if (first && (w === 0 || fromKey(first).getDate() <= 7)) {
      months.push({ w, label: fromKey(first).toLocaleDateString(undefined, { month: "short" }) });
    }
    cols.push(col);
  }
  const count = done.filter((d) => d >= start).length;
  const scroller = useRef(null);
  // On narrow screens, start scrolled to the most recent weeks.
  useEffect(() => { const el = scroller.current; if (el) el.scrollLeft = el.scrollWidth; }, []);

  return (
    <figure className="heat">
      <div className="heat-scroll" ref={scroller}>
        <div className="heat-months" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }} aria-hidden="true">
          {months.map((m) => <span key={m.w} style={{ gridColumn: m.w + 1 }}>{m.label}</span>)}
        </div>
        <div className="heat-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)`, "--c": color }} role="img" aria-label={`${count} days done in the last ${weeks} weeks`}>
          {cols.map((col, w) =>
            col.map((k, d) => (
              <i key={`${w}-${d}`} className={k ? (set.has(k) ? "on" : "") : "future"} title={k ? `${fromKey(k).toDateString()}${set.has(k) ? " · done" : ""}` : undefined} />
            ))
          )}
        </div>
      </div>
      <figcaption>{count} days done in the last {weeks} weeks</figcaption>
    </figure>
  );
}
