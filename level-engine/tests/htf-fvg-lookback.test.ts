import { describe, expect, it } from "vitest";
import { isWithinHtfFvgLookback } from "../src/session-calendar.js";

// CME daily session fixtures (America/New_York)
const FRI_JAN_3_CLOSE = 1735927200000; // Fri Jan 3 2025 13:00 ET — session 2025-01-02
const FRI_JAN_3_AFTER_CLOSE = 1735959600000; // Fri Jan 3 2025 22:00 ET — session 2025-01-03
const SUN_JAN_5_OPEN = 1736118000000; // Sun Jan 5 2025 18:00 ET — session 2025-01-05
const MON_JAN_6_EVAL = 1736208000000; // Mon Jan 6 2025 19:00 ET — session 2025-01-06
const WED_JAN_8_EVENING = 1736380800000; // Wed Jan 8 2025 19:00 ET — session 2025-01-08
const SUN_JAN_12_OPEN = 1736722800000; // Sun Jan 12 2025 18:00 ET — session 2025-01-12
const SUN_DEC_22_OPEN = 1734908400000; // Sun Dec 22 2024 18:00 ET
const FRI_JAN_17_CLOSE = 1737136800000; // Fri Jan 17 2025 13:00 ET — session 2025-01-16
const TUE_JAN_21_EVENING = 1737504000000; // Tue Jan 21 2025 19:00 ET — MLK Monday holiday week-open

describe("isWithinHtfFvgLookback", () => {
  it("returns true when formation time is in the current daily session", () => {
    expect(isWithinHtfFvgLookback(MON_JAN_6_EVAL, MON_JAN_6_EVAL)).toBe(true);
  });

  it("returns true when formation time is in the immediately previous daily session", () => {
    expect(isWithinHtfFvgLookback(SUN_JAN_5_OPEN, MON_JAN_6_EVAL)).toBe(true);
  });

  it("excludes gaps formed two or more daily sessions before asOf", () => {
    expect(isWithinHtfFvgLookback(SUN_DEC_22_OPEN, MON_JAN_6_EVAL)).toBe(false);
    expect(isWithinHtfFvgLookback(FRI_JAN_3_CLOSE, WED_JAN_8_EVENING)).toBe(
      false,
    );
  });

  it("includes the prior Friday daily session on Monday 18:00 ET week-open", () => {
    expect(isWithinHtfFvgLookback(FRI_JAN_3_CLOSE, MON_JAN_6_EVAL)).toBe(true);
  });

  it("includes the prior Friday daily session on Tuesday 18:00 ET after a holiday Monday", () => {
    expect(isWithinHtfFvgLookback(FRI_JAN_17_CLOSE, TUE_JAN_21_EVENING)).toBe(
      true,
    );
  });

  it("drops the Friday bridge gap by Wednesday 18:00 ET", () => {
    expect(isWithinHtfFvgLookback(FRI_JAN_3_CLOSE, WED_JAN_8_EVENING)).toBe(
      false,
    );
  });

  it("expires older gaps at each 18:00 ET daily session roll", () => {
    expect(isWithinHtfFvgLookback(SUN_JAN_5_OPEN, SUN_JAN_12_OPEN)).toBe(false);
    expect(isWithinHtfFvgLookback(FRI_JAN_3_CLOSE, SUN_JAN_12_OPEN)).toBe(false);
  });

  it("keeps a gap in the immediately previous session at Friday evening", () => {
    expect(isWithinHtfFvgLookback(FRI_JAN_3_CLOSE, FRI_JAN_3_AFTER_CLOSE)).toBe(
      true,
    );
  });
});
