import { describe, expect, it } from "vitest";
import { computeSessionRails } from "../src/session-rails.js";
import { loadFixture } from "./helpers/load-fixture.js";

describe("Session Rails", () => {
  it("computes PDH and PDL from the previous completed CME daily session", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const rails = computeSessionRails(bars);

    expect(rails.pdh).toBe(5100);
    expect(rails.pdl).toBe(5000);
  });

  it("exposes the 18:00 Daily Open price for the current session", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const rails = computeSessionRails(bars);

    expect(rails.dailyOpen).toBe(5055);
  });

  it("computes PWH and PWL from the previous completed CME weekly session", () => {
    const bars = loadFixture("weekly-boundary");
    const rails = computeSessionRails(bars);

    expect(rails.pwh).toBe(4920);
    expect(rails.pwl).toBe(4750);
  });

  it("resolves all session rails across a weekly boundary scenario", () => {
    const bars = loadFixture("weekly-boundary");
    const rails = computeSessionRails(bars);

    expect(rails).toEqual({
      pdh: 5100,
      pdl: 5000,
      pwh: 4920,
      pwl: 4750,
      dailyOpen: 5055,
    });
  });
});
