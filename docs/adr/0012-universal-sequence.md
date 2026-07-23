# ADR-0012: Universal Sequence

## Status
Accepted

## Context
Garrett’s GxT model names **Universal Sequence** as the headline continuation framework: reversal at a key level → expansion prints a gap → SMT (typically SMT Fill) on the retrace into that gap → continuation toward the Draw on Liquidity (DOL).

NewGxT already implements the gap + SMT Fill legs as [Catch-Up Play](../../CONTEXT.md) and [Continuation Play](../../CONTEXT.md) (ADR-0002, ADR-0006), but never named or sequenced the full model. Without that framing, agents and traders treat SMT Fill as a standalone trigger rather than the last legs of a fractal sequence.

## Decision
We adopt **Universal Sequence** as the named continuation model and map its steps onto existing NewGxT vocabulary:

1. **Establish the framework** — Price interacts with a [Relevant Level](../../CONTEXT.md) / [POI](../../CONTEXT.md); the open target is the opposing [DOL](../../CONTEXT.md) (Session POI / bias framing per ADR-0003).
2. **Confirm a swing formation** — Validate with [C2](../../CONTEXT.md) closure, [C3](../../CONTEXT.md) closure, or C2 reversal-to-expansion per ADR-0001. On a full reversal day this is typically the [2-Stage SMT](../../CONTEXT.md) / strength-switch path (ADR-0005); Universal Sequence itself does not redefine that gate.
3. **Set invalidation / demand expansion** — Prefer shallow retracement after the swing (expansion signature). Deep failure through the protected swing invalidates the continuation thesis for that leg.
4. **Refine to an aligned gap** — Within the expansion, select an [Expansion FVG](../../CONTEXT.md) or ITF FVG (`30m` / `1H` / `90m`) that sits in the tradeable half of the prior swing’s range — fractal alignment of HTF framework to ITF gap (same idea as Continuation POI candidacy in ADR-0009).
5. **Require expansion evidence** — Gaps printed away from the Relevant Level after the swing confirm the reversal/continuation signature before treating a retrace as high quality.
6. **On retrace into the selected gap, require an SMT sequence** — Prefer [SMT Fill](../../CONTEXT.md) (ADR-0006: one or two triad assets enter; all three invalidates). If all relevant assets fill the gap (no SMT Fill), require [PSP](../../CONTEXT.md) / close-polarity divergence at the gap. Strength-switch SMT Fill / SS PSP variants apply on Catch-Up when the lead has already reached its DOL.
7. **Execute continuation** — LTF [CISD](../../CONTEXT.md) (or CSD body close per ADR-0006) in the trade direction on the selected asset; entry on the next candle. Prefer the weaker / lagging asset when SMT Fill is present (Catch-Up); otherwise prefer the stronger asset with open HTF DOLs within ADR (Continuation) per ADR-0002.

**One-stage at the continuation gap:** Once the reversal (or prior expansion) already printed SMT / 2-Stage confirmation, the continuation gap requires only one-stage SMT Fill (or PSP) — a second 2-Stage SMT is not required at that gap.

**Relationship to existing plays:**
- [Catch-Up Play](../../CONTEXT.md) = Universal Sequence steps 4–7 when the lead has failed to manipulate or is consolidating at its DOL and the lagging asset still has open equivalent DOL.
- [Continuation Play](../../CONTEXT.md) = Universal Sequence steps 4–7 when price has expanded past the key level toward the next HTF DOL.
- ADR-0006 is the mechanical state machine for step 6 (SMT Fill) and the CISD entry of step 7.

## Consequences
- Glossary and playbook can name Universal Sequence without inventing parallel triggers.
- Indicator phases that already track Expansion FVG + SMT Fill + CISD are understood as US legs, not ad-hoc continuation hacks.
- Reversal confirmation remains owned by ADR-0005 / ADR-0003; Universal Sequence owns post-reversal / post-break gap continuation.
