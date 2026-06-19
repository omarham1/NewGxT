import { describe, expect, it } from "vitest";
import { computeSessionRailMitigation } from "../src/session-rail-mitigation.js";
import { loadFixture } from "./helpers/load-fixture.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const MON_JAN_6_SESSION_OPEN = 1736204400000;
const MON_JAN_6_EVAL = 1736208000000;

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

describe("Session Rail Mitigation", () => {
  it("marks PDH mitigated when a 1m bar crosses after the current session open", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const mitigatedAt = MON_JAN_6_EVAL + HOUR_MS;

    const mitigation = computeSessionRailMitigation({
      rails: {
        pdh: 5100,
        pdl: 5000,
        pwh: 4920,
        pwl: 4750,
        dailyOpen: 5055,
      },
      bars,
      mitigationBars: [bar(mitigatedAt, 5095, 5101, 5090, 5098)],
      asOf: mitigatedAt,
    });

    expect(mitigation.pdhMitigatedAt).toBe(mitigatedAt);
    expect(mitigation.pdlMitigatedAt).toBeUndefined();
  });

  it("marks PDL mitigated when a 1m bar crosses after the current session open", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const mitigatedAt = MON_JAN_6_EVAL + HOUR_MS;

    const mitigation = computeSessionRailMitigation({
      rails: {
        pdh: 5100,
        pdl: 5000,
        pwh: 4920,
        pwl: 4750,
        dailyOpen: 5055,
      },
      bars,
      mitigationBars: [bar(mitigatedAt, 5005, 5010, 4995, 5000)],
      asOf: mitigatedAt,
    });

    expect(mitigation.pdlMitigatedAt).toBe(mitigatedAt);
    expect(mitigation.pdhMitigatedAt).toBeUndefined();
  });

  it("marks PWH mitigated when a 1m bar crosses after the current week open", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const mitigatedAt = MON_JAN_6_EVAL + HOUR_MS;

    const mitigation = computeSessionRailMitigation({
      rails: {
        pdh: 5100,
        pdl: 5000,
        pwh: 4920,
        pwl: 4750,
        dailyOpen: 5055,
      },
      bars,
      mitigationBars: [bar(mitigatedAt, 4915, 4925, 4910, 4920)],
      asOf: mitigatedAt,
    });

    expect(mitigation.pwhMitigatedAt).toBe(mitigatedAt);
  });

  it("marks PWL mitigated when a 1m bar crosses after the current week open", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const mitigatedAt = MON_JAN_6_EVAL + HOUR_MS;

    const mitigation = computeSessionRailMitigation({
      rails: {
        pdh: 5100,
        pdl: 5000,
        pwh: 4920,
        pwl: 4750,
        dailyOpen: 5055,
      },
      bars,
      mitigationBars: [bar(mitigatedAt, 4755, 4760, 4745, 4750)],
      asOf: mitigatedAt,
    });

    expect(mitigation.pwlMitigatedAt).toBe(mitigatedAt);
  });

  it("excludes PDH mitigation from a prior CME session", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const priorSessionCross = 1736182800000;

    const mitigation = computeSessionRailMitigation({
      rails: {
        pdh: 5100,
        pdl: 5000,
        pwh: 4920,
        pwl: 4750,
        dailyOpen: 5055,
      },
      bars,
      mitigationBars: [bar(priorSessionCross, 5095, 5101, 5090, 5098)],
      asOf: MON_JAN_6_EVAL + HOUR_MS,
    });

    expect(mitigation.pdhMitigatedAt).toBeUndefined();
  });
});
