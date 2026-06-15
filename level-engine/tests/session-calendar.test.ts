import { describe, expect, it } from "vitest";
import {
  getDailySessionKey,
  getWeeklySessionKey,
  groupBarsByDailySession,
  groupBarsByWeeklySession,
} from "../src/session-calendar.js";
import { loadFixture } from "./helpers/load-fixture.js";

describe("Session Calendar", () => {
  it("groups bars into CME daily sessions at the 18:00 ET boundary", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const groups = groupBarsByDailySession(bars);

    expect([...groups.keys()].sort()).toEqual([
      "2024-12-29",
      "2025-01-05",
      "2025-01-06",
    ]);
    expect(groups.get("2025-01-05")).toHaveLength(3);
    expect(groups.get("2025-01-06")).toHaveLength(2);
  });

  it("assigns the 18:00 ET bar to the new daily session", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const groups = groupBarsByDailySession(bars);
    const sessionOpenBar = groups.get("2025-01-06")![0]!;

    expect(getDailySessionKey(sessionOpenBar.time)).toBe("2025-01-06");
    expect(sessionOpenBar.open).toBe(5055);
  });

  it("groups bars into CME weekly sessions from Sun 18:00 through Fri 17:00 ET", () => {
    const bars = loadFixture("weekly-boundary");
    const groups = groupBarsByWeeklySession(bars);

    expect([...groups.keys()].sort()).toEqual(["2024-12-29", "2025-01-05"]);
    expect(groups.get("2024-12-29")).toHaveLength(3);
    expect(groups.get("2025-01-05")).toHaveLength(3);
  });

  it("excludes bars outside the Sun 18:00 to Fri 17:00 weekly window", () => {
    expect(getWeeklySessionKey(1735959600000)).toBeNull(); // Fri Jan 3 2025 22:00 ET
  });

  it("keeps the same weekly session key from Sunday 18:00 through Monday midnight", () => {
    const sunOpen = 1736118000000; // Sun Jan 5 2025 18:00 ET
    const monMidnight = 1736139600000; // Mon Jan 6 2025 00:00 ET

    expect(getWeeklySessionKey(sunOpen)).toBe("2025-01-05");
    expect(getWeeklySessionKey(monMidnight)).toBe("2025-01-05");
  });
});
