# Indicator Coverage Audit vs Strategy (by Visual Dependency Phase)

**Research date:** 2026-08-03

**Question / goal:** Against `CONTEXT.md`, `docs/daily_execution_playbook.md`, and `docs/adr/`, what does the current Pine indicator (`pine/gxt-correlated-asset-indicator.pine` + `level-engine/` parity) already cover, and what is missing, organized by Visual Dependency Phase (Structural Canvas → Session Context → cross-asset → execution → trade management)? Produce a gap inventory: concept → present / partial / absent, with file/module pointers. Do not invent layers outside existing domain docs. (Issue [#40](https://github.com/omarham1/NewGxT/issues/40); map [#39](https://github.com/omarham1/NewGxT/issues/39).)

**Out of scope:** Implementing indicator features; resolving other wayfinder tickets; inventing strategy concepts not in domain docs; alert/notification design.

---

## Sources consulted

### Local primary (authoritative)

| File | Role |
|---|---|
| `CONTEXT.md` | Glossary + Visual Dependency Phase / Structural Canvas / Session Context definitions |
| `docs/daily_execution_playbook.md` | Day-of workflow: bias → POI → SMT/Stage 2 → plays → LTF entry → trade management |
| `docs/adr/0001-reversal-validation-rules.md` | C1/C2/C3 + Expansion Candle gate + post-entry 50% rule |
| `docs/adr/0002-strength-rotation-and-catchup.md` | Catch-Up / Continuation / Decoupled Sync |
| `docs/adr/0003-daily-bias-and-target-selection.md` | Daily Bias + Session POI + Active DOL gates |
| `docs/adr/0004-timeframe-hierarchy-and-triad-specification.md` | HTF / ITF / LTF + ES/NQ/YM triad |
| `docs/adr/0005-2-stage-smt-and-strength-switch.md` | 2-Stage SMT / 2-Stage PSP |
| `docs/adr/0006-smt-fill-state-machine-and-execution-triggers.md` | SMT Fill + CISD entry + SL/BE |
| `docs/adr/0007-htf-fvg-display-rules.md` | HTF FVG canvas display |
| `docs/adr/0008-reversal-day-tp1-override.md` | Daily Open TP1 on reversal days |
| `docs/adr/0009-continuation-poi.md` | Continuation POI + Expansion Leg |
| `docs/adr/0010-pine-replay-history-cap.md` | Pine history / load constraints |
| `docs/adr/0011-htf-swing-inventory-1m-engine.md` | 1m swing inventory engine |
| `docs/adr/0012-universal-sequence.md` | Universal Sequence (gap continuation model) |
| `pine/gxt-correlated-asset-indicator.pine` | Live TradingView indicator |
| `level-engine/src/*` + `level-engine/README.md` | TypeScript parity engine for levels / POI / DOL / bias flip |

### Secondary

None used as definitional authority.

---

## Method notes

- **Present** = computed and rendered (or explicitly surfaced as a trader input) in Pine and/or level-engine with domain-aligned behavior.
- **Partial** = computed or partially wired, but missing a documented visual, subtype, or cross-asset dimension.
- **Absent** = documented in glossary / playbook / ADR but no implementation surface in Pine or level-engine.
- Phase buckets follow `CONTEXT.md` **Visual Dependency Phase** order. Structural Canvas and Session Context are named there; later phases (cross-asset → execution → trade management) are the implied remaining layers from that same definition plus glossary/playbook/ADRs.
- Status panel vs on-chart geometry is a map preference ([#39](https://github.com/omarham1/NewGxT/issues/39)); this audit only answers **coverage**, not visual layout.

---

## Verdict for the map

**Phases 1–2 (Structural Canvas + Session Context) are largely shipped** as a single-chart level engine: rails, HTF swings/FVGs, Session POI, Continuation POI, bias flip, Active DOL, Daily Open, ADR. The main canvas gap inside those phases is the **PD Equilibrium Range band** (25%–75% is computed, not drawn as the documented faint band).

**Phases 3–5 are almost entirely absent.** Despite the product name “Correlated Asset Indicator,” there is **no triad / `request.security` to ES·NQ·YM peers**, and therefore no SMT Divergence, SMT Fill, PSP / SS PSP, 2-Stage sequences, Strength Switching, Decoupled Sync, Universal Sequence orchestration, ITF gap tracking, C1/C2/C3·CISD·Expansion Candle execution, or playbook trade-management automation.

**Recommend for map [#39](https://github.com/omarham1/NewGxT/issues/39):** Treat this inventory as the PRD spine. Next tickets should (1) lock progressive-disclosure + panel fields for phases 3–5, (2) declutter / finish the 25%–75% Session Context band, and (3) scope triad `request.security` cost once phase-3 concepts are chosen — not invent new strategy layers.

---

## Gap inventory by Visual Dependency Phase

### 1 · Structural Canvas

Always-visible Relevant Levels; Session POI emphasized; HTF FVGs native-TF only (`CONTEXT.md` Structural Canvas).

| Concept | Status | Pointers |
|---|---|---|
| PDH / PDL | **Present** | Pine `f_session_rails` / `f_session_rails_with_end` (~499–629), draw ~1670–1682; `level-engine/src/session-rails.ts`, `session-rail-mitigation.ts` |
| PWH / PWL | **Present** | Same rails path; draw ~1684–1694; `session-rails.ts`, `session-rail-mitigation.ts` |
| HTF Swing Point (4H/1H strict fractal) | **Present** | Pine `HtfSwingLevel`, `f_htf_swing_signals` / lifecycle ~224–451, 1575–1580, `f_draw_swing_levels` ~1484–1559; `level-engine/src/htf-swing.ts`; ADR-0011 |
| Failure Swing suppression | **Present** | Pine `f_stamp_failure_swings` / `failureSwingAdrPct` ~75, 298–329; `htf-swing.ts` `stampFailureSwings` |
| HTF FVG (4H/1H Relevant Level) | **Present** | Pine `f_detect_fvg*` / `f_advance_fvg_lifecycle` / `f_draw_fvg_zones` ~467–482, 1101–1342, 1583–1703; native chart gate `on4hChart`/`on1hChart` ~1477–1479; `level-engine/src/htf-fvg.ts`; ADR-0007 |
| FVG C1/C2/C3 (gap pattern bars) | **Present** | Encoded in three-candle FVG detect (Pine ~467–480; `htf-fvg.ts`) — gap construction only, not reversal C1/C2/C3 |
| Session POI (directional + neutral) | **Present** | Pine `f_select_directional_fvg_poi`, `f_select_defer_swing_poi`, neutral rail promote ~784–835, 1453–1459, 1650–1658; `level-engine/src/session-poi.ts`; ADR-0003 |
| Session POI visual emphasis | **Present** | `POI_COLOR` / width / FVG opacity / label badge via `f_format_level_label` ~840–849, 1313–1330, 1528–1547 |
| Continuation POI + Expansion Leg (POI gate) | **Present** | Pine bias-flip → leg → `f_select_continuation_fvg_poi` ~856–927, 1596–1648, draw via `f_draw_fvg_zones`; `bias-flip.ts`, `continuation-poi.ts`; ADR-0009 |
| Active DOL (TP1 / TP2 badges) | **Present** | Pine `f_resolve_active_dol` ~973–1065, badges ~1663–1694; `level-engine/src/active-dol.ts`; ADR-0003, ADR-0008 |
| Reversal-day Daily Open TP1 override | **Present** | Input `reversalDayTp1` + ADR ≥ 80% gate ~74, 1061–1063; `active-dol.ts`; ADR-0008 |
| Relevant Level mitigation (rails wick; FVG body close; swing wick) | **Present** | Pine sweep/mitigation paths ~406–430, 616–629, 1114–1123; `level-mitigation.ts`, `session-rail-mitigation.ts` |
| Level Snapshot composition | **Present** | `level-engine/src/level-snapshot.ts` (parity API; not a Pine type) |

**Phase 1 summary:** Structural Canvas is the shipped core. No missing *named* Relevant Level class from the glossary; gaps are downstream (ITF gaps, cross-asset) not missing PDH/swing/FVG primitives.

---

### 2 · Session Context

Always-visible session references above the canvas: Daily Open, ADR band (`CONTEXT.md` Session Context). PD 50% Midpoint and PD Equilibrium Range are glossary Session Context / bias-gate geometry used with Daily Bias.

| Concept | Status | Pointers |
|---|---|---|
| 18:00 Daily Open (dashed labeled) | **Present** | Input toggles ~66–68; draw ~1665–1668; rails `dailyOpen` in `session-rails.ts` / `session-context.ts` |
| ADR band (open ± ADR) + consumption label | **Present** | Pine ADR calc ~571–584; draw open±ADR ~1464–1470; `session-context.ts` |
| PD 50% Midpoint | **Present** | Drawn as `PD EQ 50%` ~69–71, 1431–1433, 1472–1474; gates POI + bias flip ~1596–1620; `session-context.ts` `pdMidpoint` |
| PD Equilibrium Range (25%–75% faint band) | **Partial** | Computed `pdEqLow`/`pdEqHigh` ~1429–1430; `session-context.ts` `pdEquilibriumLow`/`pdEquilibriumHigh`. **Not drawn** as a band; no toggle. CONTEXT: “Drawn as a faint band… toggleable.” |
| Daily Bias (Directional / Neutral + direction) | **Present** | Manual inputs `dailyBias`, `biasDirection` ~72–73 (manual by design per CONTEXT / playbook Step 1) |
| Bias flip (4H/1H close through PD 50% against bias) | **Present** | Pine ~1596–1633; `level-engine/src/bias-flip.ts`; hands off Session POI → Continuation POI |
| Automated day-type classifier (Expansion vs Consolidation chart heuristics) | **Absent** | Playbook Phase 1 Step 1 is trader judgment; indicator correctly does not auto-classify — listed so the map does not treat it as a missing “feature” without deciding otherwise |

**Phase 2 summary:** Session Context is effectively complete except the **25%–75% PD Equilibrium Range band** (compute-only).

---

### 3 · Cross-asset signals

Implied next Visual Dependency Phase after Session Context (`CONTEXT.md`); triad + cracks-in-correlation from glossary, playbook Steps 6–8, ADR-0002/0004/0005/0006/0012.

| Concept | Status | Pointers |
|---|---|---|
| Triad feed (ES / NQ / YM peer series) | **Absent** | Pine `request.security` (~649–683) is **same-symbol** HTF aggregation only (rails / 4H / 1H). No peer symbols. ADR-0004 |
| SMT Divergence (Stage 1 extremes) | **Absent** | No matches in `pine/` or `level-engine/src/`. CONTEXT; playbook Step 6; ADR-0005 |
| Strength Switching (relative lead/lag rotation) | **Absent** | CONTEXT; ADR-0002 / 0005 |
| Strength Switch PSP (SS PSP) | **Absent** | CONTEXT; ADR-0005 Stage 2 of 2-Stage PSP |
| Precision Swing Point (PSP) general / continuation-gap crack | **Absent** | CONTEXT; ADR-0012 step 6 fallback |
| 2-Stage SMT | **Absent** | CONTEXT; ADR-0005; playbook Step 7 |
| 2-Stage PSP | **Absent** | CONTEXT; ADR-0005; playbook Step 7 |
| SMT Fill state machine | **Absent** | CONTEXT; ADR-0006; playbook Plays B/C |
| Decoupled Sync gate | **Absent** | CONTEXT; ADR-0002; playbook Step 8 |
| Catch-Up Play (as live cross-asset state) | **Absent** | CONTEXT; ADR-0002 / 0012 — geometry for lagging DOL exists only as single-chart Active DOL, not triad Catch-Up logic |
| Continuation Play (as live cross-asset state) | **Absent** | Same — Continuation **POI** (phase 1) ≠ Continuation **Play** (triad + SMT Fill) |
| Synergy Rule / rail vs FVG engagement matrices | **Absent** | Playbook Step 6 tables — no triad participation counters |

**Phase 3 summary:** **Total gap.** Product name implies correlation; implementation is single-asset structure. This is the largest map unblocker.

---

### 4 · Execution triggers

Playbook Phase 3 + ADR-0001 / 0006 / 0012 after cross-asset confirmation (or Universal Sequence gap legs).

| Concept | Status | Pointers |
|---|---|---|
| Universal Sequence (full step orchestration) | **Absent** | Named in CONTEXT + ADR-0012. Partial *building blocks* exist only as HTF structure / Continuation POI — not the sequence state machine |
| 4H Profiling (timing filter / session windows) | **Absent** | CONTEXT; playbook Step 5b — no 02:00/06:00/10:00 ET window logic or 4H Expansion Candle classifier |
| Expansion Candle (wick gate for entry) | **Absent** | CONTEXT; ADR-0001; playbook Play A |
| Reversal C1 / C2 / C3 sequence | **Absent** | CONTEXT; ADR-0001; playbook Play A — distinct from FVG C1/C2/C3 |
| CISD / CSD (LTF entry close) | **Absent** | CONTEXT; ADR-0006; playbook Plays A–C |
| ITF FVG (30m / 90m) for fill / Universal Sequence | **Absent** | Only 4H + 1H FVG engines. ADR-0004 ITF band; ADR-0006 / 0012 |
| Expansion FVG (as labeled subtype after displacement) | **Absent** | CONTEXT — HTF FVG engine does not tag expansion-vs-other |
| Aggressive Reversal Fallback path | **Absent** | Playbook Phase 3 — depends on ITF FVG SMT Fill + LTF CSD |
| Play-type decision tree (Reversal / Catch-Up / Continuation / Fallback) | **Absent** | Playbook Step 8 — no status/state machine |
| LTF MSS as *entry* signal | **Absent** | CONTEXT defines MSS; playbook uses LTF MSS primarily as **BE trigger** (phase 5), not as Stage 2 |

**Phase 4 summary:** **Absent** as an indicator layer. Single-chart structure cannot arm entries per playbook without phase 3.

---

### 5 · Trade management

Playbook Phase 4 + ADR-0001 §50% rule + ADR-0006 risk rules.

| Concept | Status | Pointers |
|---|---|---|
| SL at sweep-candle absolute extreme | **Absent** | ADR-0006; playbook Step 9 — no position / stop objects |
| Break-even at 2R **or** first counter-trend LTF MSS | **Absent** | ADR-0006; playbook Step 9 |
| TP1 / TP2 *management* (partials / close) | **Absent** | Active DOL **labels** exist (phase 1); no trade lifecycle |
| Post-entry 50% Equilibrium Rule (sweep-anchored expansion leg) | **Absent** | Playbook Step 10; ADR-0001. Distinct from Continuation POI Expansion Leg (CONTEXT: different anchor) — phase-1 Expansion Leg does **not** satisfy this |
| Catch-Up invalidation (lead prints counter-trend LTF CISD) | **Absent** | Playbook Play B warning — needs triad + CISD |
| SMT + Strength Switch override of 50% / FVG invalidation | **Absent** | Playbook Step 10 exception — needs phase 3 |

**Phase 5 summary:** **Absent.** Target highlighting (Active DOL) is not trade management.

---

## Coverage scorecard (by phase)

| Visual Dependency Phase | Present | Partial | Absent | Readiness |
|---|---|---|---|---|
| 1 Structural Canvas | Rails, swings, failure swings, HTF FVG, Session POI, Continuation POI, Active DOL | — | — | **Shipped** |
| 2 Session Context | Daily Open, ADR, PD 50%, Daily Bias inputs, bias flip | PD Equilibrium Range **band** | Auto day-type (intentionally manual) | **Nearly complete** |
| 3 Cross-asset | — | — | Triad, SMT, Fill, PSP, 2-Stage, SS, Decoupled Sync, play states | **Not started** |
| 4 Execution | — | — | Universal Sequence, 4H Profiling, C1–C3, CISD, ITF/Expansion FVG, plays | **Not started** |
| 5 Trade management | — | — | SL/BE/MSS, post-entry 50% rule, invalidations | **Not started** |

---

## Module map (what exists today)

```
pine/gxt-correlated-asset-indicator.pine
  ├── CME session calendar + rails (PDH/PDL/PWH/PWL)
  ├── Session Context draw (Daily Open, ADR, PD 50% line)
  ├── HTF swing inventory + failure swings + Active DOL badges
  ├── HTF FVG lifecycle + Session/Continuation POI emphasis
  └── Bias flip → Expansion Leg → Continuation POI
      ✗ no peer-symbol security()
      ✗ no SMT / PSP / Fill / CISD / C2–C3 / trade mgmt

level-engine/src/
  session-calendar | session-rails | session-rail-mitigation
  session-context | session-poi | active-dol
  htf-fvg | htf-swing | bias-flip | continuation-poi
  level-snapshot | level-mitigation
  ✗ no smt* / psp* / cisd* / triad modules
```

---

## Recommend (map handoff)

1. **Use this inventory as the coverage spine of the PRD** for [Map: Expand indicator to full strategy without visual mess](https://github.com/omarham1/NewGxT/issues/39).
2. **Do not reopen phase 1–2 strategy design** except: draw/toggle the PD Equilibrium Range band; optional declutter of already-shipped canvas (map standing prefs).
3. **Phase 3 is the critical path** — every later playbook step depends on triad participation. Panel-first triad state (map notes) matches the absence of on-chart cross-asset geometry today.
4. **Phase 4–5 concepts are already specified in ADRs/playbook** — the PRD work is progressive disclosure + visual/state packaging, not new domain invention.
5. **Pine/performance for triad `request.security`** remains map “Not yet specified”; this audit confirms it is currently unused for peers, so cost estimation can start from zero peer series.

---

## Open questions (out of research scope; for later map tickets)

- Exact progressive-disclosure triggers per phase once coverage gaps are accepted.
- Whether ITF FVG (30m/90m) is on-chart geometry, panel-only, or both.
- Whether trade-management automation belongs in Pine at all vs trader discipline + Active DOL labels only.
