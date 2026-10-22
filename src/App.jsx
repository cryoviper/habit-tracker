import { useEffect, useReducer, useRef, useState } from "react";
import { today, lastNDays, fromKey } from "./lib/dates.js";
import { currentStreak, bestStreak, completionRate, toggleDay } from "./lib/stats.js";
import Heatmap from "./Heatmap.jsx";

const KEY = "streak.v1";
export const COLORS = ["#1E6B4F", "#C2512F", "#3D5BA9", "#B5862B", "#8A4FA3", "#2F8C99"];
const uid = () => Math.random().toString(36).slice(2, 10);

function sample() {
  // Plausible history so the first visit shows what the app does.
  const days = lastNDays(150);
  // small seeded random generator so the sample looks natural but stays the same
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (p, seed) => { const r = rng(seed); return days.filter(() => r() < p); };
  return [
    { id: uid(), name: "Code for 1 hour", color: COLORS[0], done: pick(0.78, 1) },
    { id: uid(), name: "Read 20 pages", color: COLORS[2], done: pick(0.6, 2) },
    { id: uid(), name: "Workout", color: COLORS[1], done: pick(0.5, 3) },
    { id: uid(), name: "Solve one DSA problem", color: COLORS[3], done: pick(0.7, 4) },
  ];
}

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(v)) return v;
  } catch { /* ignore */ }
  return sample();
}

function reducer(state, a) {
  switch (a.type) {
    case "toggle": return state.map((h) => (h.id === a.id ? { ...h, done: toggleDay(h.done, a.day) } : h));
    case "add": return [...state, { id: uid(), name: a.name, color: a.color, done: [] }];
    case "edit": return state.map((h) => (h.id === a.id ? { ...h, name: a.name, color: a.color } : h));
    case "delete": return state.filter((h) => h.id !== a.id);
    case "move": {
      const i = state.findIndex((h) => h.id === a.id), j = i + a.by;
      if (i < 0 || j < 0 || j >= state.length) return state;
      const next = [...state];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    }
    default: return state;
  }
}

const dayLetter = (k) => fromKey(k).toLocaleDateString(undefined, { weekday: "narrow" });
const dayLong = (k) => fromKey(k).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });

export default function App() {
  const [habits, dispatch] = useReducer(reducer, null, load);
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | habit
  const t = today();
  const week = lastNDays(7, t);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(habits)); } catch { /* ignore */ }
  }, [habits]);

  const doneToday = habits.filter((h) => h.done.includes(t)).length;
  const pct = habits.length ? doneToday / habits.length : 0;

  return (
    <div className="app">
      <header className="top">
        <div className="brand"><span className="mark" aria-hidden="true" />Streak</div>
        <button className="btn primary" type="button" onClick={() => setEditing("new")}>+ New habit</button>
      </header>

      <section className="hero">
        <div>
          <p className="date">{dayLong(t)}</p>
          <h1>
            {habits.length === 0 ? "Start your first habit" : doneToday === habits.length ? <>All done today. <em>Nice.</em></> : <>{habits.length - doneToday} left <em>today</em></>}
          </h1>
        </div>
        <div className="ring" role="img" aria-label={`${doneToday} of ${habits.length} habits done today`}>
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" className="ring-bg" />
            <circle cx="50" cy="50" r="42" className="ring-fg" strokeDasharray={`${pct * 263.9} 263.9`} />
          </svg>
          <b>{doneToday}<small>/{habits.length}</small></b>
        </div>
      </section>

      {habits.length === 0 ? (
        <div className="empty">
          <p>Small daily actions add up. Add a habit like "Read 20 pages" or "Walk 5,000 steps".</p>
          <button className="btn primary" type="button" onClick={() => setEditing("new")}>Add a habit</button>
        </div>
      ) : (
        <ul className="habits">
          <li className="week-head" aria-hidden="true">
            <span />
            <div className="days">{week.map((d) => <span key={d} className={d === t ? "is-today" : ""}>{dayLetter(d)}</span>)}</div>
          </li>
          {habits.map((h, idx) => {
            const streak = currentStreak(h.done, t);
            const isOpen = open === h.id;
            return (
              <li key={h.id} className={`habit ${isOpen ? "open" : ""}`} style={{ "--c": h.color }}>
                <div className="row">
                  <button className="name" type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : h.id)}>
                    <i className="dot" />
                    <span>
                      <b>{h.name}</b>
                      <small>{streak ? `${streak} day streak` : "No streak yet"}</small>
                    </span>
                  </button>
                  <div className="days">
                    {week.map((d) => {
                      const on = h.done.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          className={`day ${on ? "on" : ""} ${d === t ? "is-today" : ""}`}
                          aria-pressed={on}
                          aria-label={`${h.name}, ${dayLong(d)}: ${on ? "done" : "not done"}`}
                          onClick={() => dispatch({ type: "toggle", id: h.id, day: d })}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {isOpen && (
                  <div className="detail">
                    <div className="stats">
                      <div><span>Current</span><b>{streak}<small> days</small></b></div>
                      <div><span>Best</span><b>{bestStreak(h.done)}<small> days</small></b></div>
                      <div><span>Last 30 days</span><b>{completionRate(h.done, 30, t)}<small>%</small></b></div>
                      <div><span>Total</span><b>{h.done.length}<small> days</small></b></div>
                    </div>
                    <Heatmap done={h.done} color={h.color} />
                    <div className="detail-actions">
                      <button type="button" className="btn" onClick={() => setEditing(h)}>Edit</button>
                      <button type="button" className="btn" disabled={idx === 0} onClick={() => dispatch({ type: "move", id: h.id, by: -1 })} aria-label="Move up">↑</button>
                      <button type="button" className="btn" disabled={idx === habits.length - 1} onClick={() => dispatch({ type: "move", id: h.id, by: 1 })} aria-label="Move down">↓</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <HabitDialog
          habit={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(name, color) => {
            if (editing === "new") dispatch({ type: "add", name, color });
            else dispatch({ type: "edit", id: editing.id, name, color });
            setEditing(null);
          }}
          onDelete={(id) => { dispatch({ type: "delete", id }); setEditing(null); setOpen(null); }}
        />
      )}

      <footer className="foot">Built by <a href="https://github.com/cryoviper" target="_blank" rel="noopener">Praveen Sinwar</a> · Saved on this device</footer>
    </div>
  );
}

function HabitDialog({ habit, onClose, onSave, onDelete }) {
  const ref = useRef(null);
  const [name, setName] = useState(habit?.name || "");
  const [color, setColor] = useState(habit?.color || COLORS[0]);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    const onCancel = (e) => { e.preventDefault(); onClose(); };
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return (
    <dialog ref={ref} aria-labelledby="dlg-h" onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave(name.trim().slice(0, 60), color); }}>
        <h2 id="dlg-h">{habit ? "Edit habit" : "New habit"}</h2>
        <label>Name
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Read 20 pages" required />
        </label>
        <fieldset>
          <legend>Colour</legend>
          <div className="swatches">
            {COLORS.map((c) => (
              <label key={c} className="sw" style={{ "--c": c }}>
                <input type="radio" name="color" value={c} checked={color === c} onChange={() => setColor(c)} />
                <span aria-hidden="true" />
                <span className="sr">{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="dlg-actions">
          {habit && (confirm
            ? <button type="button" className="btn danger" onClick={() => onDelete(habit.id)}>Confirm delete</button>
            : <button type="button" className="btn ghost-danger" onClick={() => setConfirm(true)}>Delete</button>)}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{habit ? "Save" : "Add habit"}</button>
        </div>
      </form>
    </dialog>
  );
}
