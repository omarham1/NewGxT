import { describe, expect, it } from "vitest";
import { detectBiasFlip } from "../src/bias-flip.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const MON_JAN_6_SESSION_OPEN = 1736204400000;
const MON_JAN_6_EVAL = 1736208000000;
const PD_MIDPOINT = 5050;

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

describe("Bias flip on HTF close through PD 50% Midpoint", () => {
  it("does not flip bearish bias when a 1H bar wicks above PD 50% but closes below", () => {
    const result = detectBiasFlip({
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      asOf: MON_JAN_6_EVAL,
      initialBiasDirection: "bearish",
      pdMidpoint: PD_MIDPOINT,
      bars4h: [],
      bars1h: [bar(MON_JAN_6_EVAL, 5040, 5060, 5035, 5045)],
    });

    expect(result.effectiveBiasDirection).toBe("bearish");
    expect(result.flippedAt).toBeUndefined();
  });

  it("flips bearish bias to bullish when a 1H bar closes above PD 50% Midpoint", () => {
    const flipTime = MON_JAN_6_EVAL;

    const result = detectBiasFlip({
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      asOf: flipTime,
      initialBiasDirection: "bearish",
      pdMidpoint: PD_MIDPOINT,
      bars4h: [],
      bars1h: [bar(flipTime, 5040, 5065, 5035, 5055)],
    });

    expect(result.effectiveBiasDirection).toBe("bullish");
    expect(result.flippedAt).toBe(flipTime);
  });

  it("does not re-flip when subsequent HTF closes align with the new bias", () => {
    const firstFlip = MON_JAN_6_EVAL;
    const laterBar = MON_JAN_6_EVAL + HOUR_MS;

    const result = detectBiasFlip({
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      asOf: laterBar,
      initialBiasDirection: "bearish",
      pdMidpoint: PD_MIDPOINT,
      bars4h: [],
      bars1h: [
        bar(firstFlip, 5040, 5065, 5035, 5055),
        bar(laterBar, 5055, 5070, 5050, 5065),
      ],
    });

    expect(result.effectiveBiasDirection).toBe("bullish");
    expect(result.flippedAt).toBe(firstFlip);
  });
});
