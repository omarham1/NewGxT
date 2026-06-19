import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { computeSessionRailMitigation } from "../src/session-rail-mitigation.js";
import type { Bar } from "../src/types.js";
import { simulateOneMinRailMitigationStateMachine } from "./helpers/pine-rail-mitigation.js";
import { loadFixture } from "./helpers/load-fixture.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pinePath = join(repoRoot, "pine/gxt-correlated-asset-indicator.pine");
const HOUR_MS = 60 * 60 * 1000;
const MON_JAN_6_EVAL = 1736208000000;

function readPineSource(): string {
  return readFileSync(pinePath, "utf-8");
}

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

const rails = {
  pdh: 5100,
  pdl: 5000,
  pwh: 4920,
  pwl: 4750,
  dailyOpen: 5055,
};

describe("session rail mitigation pine parity (#25)", () => {
  it("1m state machine matches level-engine mitigation semantics", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const mitigatedAt = MON_JAN_6_EVAL + HOUR_MS;
    const mitigationBars = [
      bar(mitigatedAt, 5095, 5101, 5090, 5098),
      bar(mitigatedAt + HOUR_MS, 5005, 5010, 4745, 5000),
    ];
    const asOf = mitigatedAt + HOUR_MS;

    const engine = computeSessionRailMitigation({
      rails,
      bars,
      mitigationBars,
      asOf,
    });
    const pine = simulateOneMinRailMitigationStateMachine({
      rails,
      mitigationBars,
      asOf,
    });

    expect(pine).toEqual(engine);
  });

  it("computes PDH/PDL/PWH/PWL mitigation inside the 1m request.security state machine", () => {
    const source = readPineSource();

    expect(source).toMatch(/out_pdh_mitigated/);
    expect(source).toMatch(/out_pwl_mitigated_time/);
    expect(source).not.toMatch(/for mi = 0 to oneMinBarCount - 1/);
    expect(source).not.toMatch(
      /pdhMitigated := true[\s\S]*checkHigh >= pdh/,
    );
  });
});
