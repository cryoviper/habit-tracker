import { describe, it, expect } from "vitest";
import { currentStreak, bestStreak, completionRate, toggleDay } from "./stats.js";
import { addDays, lastNDays } from "./dates.js";

const T = "2026-03-10";

describe("currentStreak", () => {
  it("is 0 with no history", () => {
    expect(currentStreak([], T)).toBe(0);
  });
  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-03-08", "2026-03-09", "2026-03-10"], T)).toBe(3);
  });
  it("keeps yesterday's streak alive if today isn't done yet", () => {
    expect(currentStreak(["2026-03-08", "2026-03-09"], T)).toBe(2);
  });
  it("breaks on a missed day", () => {
    expect(currentStreak(["2026-03-06", "2026-03-07", "2026-03-09", "2026-03-10"], T)).toBe(2);
  });
  it("is 0 if neither today nor yesterday is done", () => {
    expect(currentStreak(["2026-03-07", "2026-03-08"], T)).toBe(0);
  });
  it("works across month boundaries", () => {
    expect(currentStreak(["2026-02-27", "2026-02-28", "2026-03-01"], "2026-03-01")).toBe(3);
  });
});

describe("bestStreak", () => {
  it("finds the longest run anywhere", () => {
    expect(bestStreak(["2026-01-01", "2026-01-02", "2026-01-05", "2026-01-06", "2026-01-07"])).toBe(3);
  });
  it("ignores duplicates and order", () => {
    expect(bestStreak(["2026-01-03", "2026-01-01", "2026-01-02", "2026-01-02"])).toBe(3);
  });
  it("handles leap years", () => {
    expect(bestStreak(["2028-02-28", "2028-02-29", "2028-03-01"])).toBe(3);
  });
});

describe("completionRate", () => {
  it("is 100 when every day is done", () => {
    expect(completionRate(lastNDays(30, T), 30, T)).toBe(100);
  });
  it("rounds to a whole percent", () => {
    expect(completionRate([T, addDays(T, -1)], 3, T)).toBe(67);
  });
});

describe("toggleDay", () => {
  it("adds and removes without mutating", () => {
    const a = ["2026-03-01"];
    const b = toggleDay(a, "2026-03-02");
    expect(b).toEqual(["2026-03-01", "2026-03-02"]);
    expect(a).toEqual(["2026-03-01"]);
    expect(toggleDay(b, "2026-03-01")).toEqual(["2026-03-02"]);
  });
});
