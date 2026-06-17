import { describe, expect, it } from "vitest";
import { isWithinHtfSwingComparisonLookback, isWithinHtfSwingLookback } from "../src/session-calendar.js";

// CME week fixtures (America/New_York), aligned with weekly-boundary.json
const SUN_DEC_22_OPEN = 1734908400000; // Sun Dec 22 2024 18:00 ET — week 2024-12-22
const SUN_DEC_29_OPEN = 1735513200000; // Sun Dec 29 2024 18:00 ET — week 2024-12-29
const FRI_JAN_3_CLOSE = 1735927200000; // Fri Jan 3 2025 13:00 ET — prior week close region
const SUN_JAN_5_OPEN = 1736118000000; // Sun Jan 5 2025 18:00 ET — week 2025-01-05
const MON_JAN_6_EVAL = 1736208000000; // Mon Jan 6 2025 19:00 ET
const SUN_JAN_12_OPEN = 1736722800000; // Sun Jan 12 2025 18:00 ET — week 2025-01-12
const SUN_JAN_19_OPEN = 1737327600000; // Sun Jan 19 2025 18:00 ET — week 2025-01-19
const FRI_JAN_3_AFTER_CLOSE = 1735959600000; // Fri Jan 3 2025 22:00 ET — outside weekly window

describe("isWithinHtfSwingLookback", () => {
  it("returns true when formation time is in the current CME week", () => {
    expect(isWithinHtfSwingLookback(SUN_JAN_5_OPEN, MON_JAN_6_EVAL)).toBe(true);
  });

  it("returns true when formation time is in the immediately previous CME week", () => {
    expect(isWithinHtfSwingLookback(FRI_JAN_3_CLOSE, MON_JAN_6_EVAL)).toBe(true);
  });

  it("returns false when formation time is two or more CME weeks before asOf", () => {
    expect(isWithinHtfSwingLookback(SUN_DEC_29_OPEN, SUN_JAN_12_OPEN)).toBe(
      false,
    );
  });

  it("drops swings from the third week back at the Sunday 18:00 ET week roll", () => {
    expect(isWithinHtfSwingLookback(FRI_JAN_3_CLOSE, SUN_JAN_12_OPEN)).toBe(
      false,
    );
    expect(isWithinHtfSwingLookback(SUN_JAN_5_OPEN, SUN_JAN_12_OPEN)).toBe(
      true,
    );
  });

  it("keeps a prior-week Friday close swing visible through the following week", () => {
    expect(isWithinHtfSwingLookback(FRI_JAN_3_CLOSE, MON_JAN_6_EVAL)).toBe(true);
  });

  it("resolves lookback when asOf falls outside the Sun–Fri weekly window", () => {
    expect(isWithinHtfSwingLookback(FRI_JAN_3_CLOSE, FRI_JAN_3_AFTER_CLOSE)).toBe(
      true,
    );
  });
});

describe("isWithinHtfSwingComparisonLookback", () => {
  it("returns true for swings formed within four CME weeks", () => {
    expect(isWithinHtfSwingComparisonLookback(SUN_JAN_5_OPEN, MON_JAN_6_EVAL)).toBe(
      true,
    );
    expect(isWithinHtfSwingComparisonLookback(SUN_DEC_29_OPEN, MON_JAN_6_EVAL)).toBe(
      true,
    );
  });

  it("returns false for swings formed five or more CME weeks before asOf", () => {
    expect(
      isWithinHtfSwingComparisonLookback(SUN_DEC_22_OPEN, SUN_JAN_19_OPEN),
    ).toBe(false);
  });
});
