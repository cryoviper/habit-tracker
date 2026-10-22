import { addDays, today as todayKey, lastNDays } from "./dates.js";

/**
 * Current streak: consecutive done days ending today.
 * If today isn't done yet, the streak still counts from yesterday,
 * so you don't "lose" it at midnight before you've had a chance.
 */
export function currentStreak(done, today = todayKey()) {
  const set = done instanceof Set ? done : new Set(done);
  let day = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

/** Longest run of consecutive days anywhere in the history. */
export function bestStreak(done) {
  const days = [...new Set(done)].sort();
  let best = 0, run = 0, prev = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/** Share of the last `n` days that were done, 0–100. */
export function completionRate(done, n = 30, today = todayKey()) {
  const set = new Set(done);
  const days = lastNDays(n, today);
  const hit = days.filter((d) => set.has(d)).length;
  return Math.round((hit / n) * 100);
}

/** Toggle a day in a habit's history without mutating the original array. */
export function toggleDay(done, day) {
  return done.includes(day) ? done.filter((d) => d !== day) : [...done, day].sort();
}
