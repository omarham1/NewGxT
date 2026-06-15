import type { Bar, SessionContext } from "./types.js";
import { computeSessionContext } from "./session-context.js";
import { computeHtfFvgs, type HtfFvg } from "./htf-fvg.js";

export type LevelSnapshot = SessionContext & {
  htfFvgs: HtfFvg[];
};

export type ComputeLevelSnapshotInput = {
  bars: Bar[];
  bars4h: Bar[];
  bars1h: Bar[];
  mitigationBars: Bar[];
};

export function computeLevelSnapshot(
  input: ComputeLevelSnapshotInput,
): LevelSnapshot {
  const context = computeSessionContext(input.bars);
  const htfFvgs = computeHtfFvgs({
    bars4h: input.bars4h,
    bars1h: input.bars1h,
    pdh: context.pdh,
    pdl: context.pdl,
    mitigationBars: input.mitigationBars,
  });

  return {
    ...context,
    htfFvgs,
  };
}
