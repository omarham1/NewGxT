# NewGxT Model Map

Three complementary layers. They stack; they do not replace each other.

| Layer | Job | When | Canonical docs |
|---|---|---|---|
| **2-Stage SMT/SS** | Reversal confirmation | Price at a Relevant Level / POI; need a tradable reversal | ADR-0005, ADR-0003, CONTEXT **2-Stage SMT** |
| **Universal Sequence** | Gap continuation | After reversal/expansion: gap forms → retrace → SMT Fill (or PSP) → continue to DOL | ADR-0012, ADR-0006, CONTEXT **Universal Sequence** |
| **4H Profiling** | Timing / Expansion Candle filter | Prefer expansion candles (no large opposing wick); session windows inform *when* | CONTEXT **4H Profiling**, **Expansion Candle**; playbook Step 5b / Play A |

## How they stack

1. **2-Stage SMT/SS** confirms the reversal (or you use the aggressive fallback without full 2-Stage).
2. **Universal Sequence** owns the post-reversal / post-break gap legs — Catch-Up and Continuation Plays are those legs, not separate models.
3. **4H Profiling / Expansion Candle** gates entry timing on the candle you take — it does not replace Stage 2 or SMT Fill.

## What each does not do

- **Universal Sequence** does not redefine Stage 2 or replace ADR-0005.
- **4H Profiling** does not replace 2-Stage SMT/SS or Universal Sequence.
- **2-Stage SMT/SS** does not own Catch-Up / Continuation — those are Universal Sequence (ADR-0012) via ADR-0002.

## Day-of pointers

- Playbook: bias → POI → Stage 1/2 → play selection (Reversal / Catch-Up / Continuation)
- Strength rotation / Decoupled Sync: ADR-0002
