// Date helpers that work in *local* time with plain "YYYY-MM-DD" keys.
// Avoids the classic bug where toISOString() shifts the day for users east/west of UTC.

export function key(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(k) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(k, n) {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return key(d);
}

export const today = () => key(new Date());

export function lastNDays(n, end = today()) {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}
