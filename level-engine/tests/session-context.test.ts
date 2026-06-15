import { describe, expect, it } from "vitest";
import { computeSessionContext } from "../src/session-context.js";
import { loadFixture } from "./helpers/load-fixture.js";

describe("Session Context", () => {
  it("computes PD Equilibrium Range boundaries at 25% and 75% of the previous day's wick-to-wick range", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const context = computeSessionContext(bars);

    expect(context.pdEquilibriumLow).toBe(5025);
    expect(context.pdEquilibriumHigh).toBe(5075);
  });

  it("computes ADR as the average of the last 14 completed CME daily session ranges", () => {
    const bars = loadFixture("adr-rolling-average");
    const context = computeSessionContext(bars);

    expect(context.adr).toBe(100);
    expect(context.openPlusAdr).toBe(5155);
    expect(context.openMinusAdr).toBe(4955);
  });

  it("reports ADR consumption as the current session range as a percentage of ADR", () => {
    const bars = loadFixture("adr-rolling-average");
    const context = computeSessionContext(bars);

    expect(context.adrConsumptionPct).toBe(40);
  });
});
