# Triad `request.security` Load Cost for Phase-3 Peer Feeds

**Research date:** 2026-08-08

**Question / goal:** What is the Pine `request.security` / load cost of the minimum triad peer feeds needed for SMT / SMT Fill / PSP / 2-Stage on TradingView — and what technical constraints apply (timeframes, history depth, which peers)? Builds on `docs/research/indicator-strategy-coverage-audit.md`.

**Out of scope:** Implementing Pine triad feeds; inventing new strategy concepts.

---

## Sources consulted

### Primary — TradingView official Pine docs

| Source | Role |
|---|---|
| [Concepts / Other timeframes and data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/) | `request.security` / `request.security_lower_tf` behavior; unique-request ceiling; gaps / lookahead; dynamic requests; tuples / UDTs as expressions; LTF guidance |
| [Writing / Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/) | Hard caps: 40 / 64 unique `request.*()` calls; 127 tuple elements across all `request.*()`; intrabar depth by plan; `calc_bars_count` on requests; execution-time / `max_bars_back` ceilings |
| [Support: too many unique `request.*()` calls](https://www.tradingview.com/support/solutions/43000745852-i-see-the-the-script-executes-too-many-unique-request-function-calls-error/) | Confirms uniqueness is context + expression + scope; each unique call fetches another dataset |

### Primary — local repo (product constraints)

| File / issue | Role |
|---|---|
| `pine/gxt-correlated-asset-indicator.pine` | Live security surface: count, symbols, TFs, returned fields |
| `level-engine/tests/pine-security-merge.test.ts` | Asserts **3** top-level same-symbol `request.security` calls (#24 merge) |
| `docs/adr/0010-pine-replay-history-cap.md` | 14-session / `calc_bars_count = 20160` replay cap; 1m rails path as load hotspot |
| `docs/adr/0004-timeframe-hierarchy-and-triad-specification.md` | ES/NQ/YM triad; HTF / ITF / LTF bands; Stage-2 TF splits |
| `docs/adr/0005-2-stage-smt-and-strength-switch.md` | Stage 1 HTF/ITF SMT; Stage 2 SMT on `30m`/`1H`/`90m`; Stage 2 PSP / SS PSP on full ITF incl. `4H` |
| `docs/adr/0006-smt-fill-state-machine-and-execution-triggers.md` | Fill needs triad FVG **entry participation** (1–2 in → Active; all 3 → invalid) |
| `docs/adr/0011-htf-swing-inventory-1m-engine.md` | Merge rule: extend existing TF bundle; reject second same-TF `request.security("1")` |
| `docs/research/indicator-strategy-coverage-audit.md` | Zero peer series today; phases 3–5 absent |

### Secondary

None used as definitional authority. Playbook / ADR-0002 / ADR-0012 cited only where they restate Fill TF bands already in ADR-0004/0005/0006.

---

## Method notes

1. Inventory today’s Pine `request.security` surface (same-symbol only).
2. From ADRs, derive the **minimum peer data** phase 3 actually needs — not every TF × every OHLC field × full Structural Canvas engines.
3. Map that minimum onto TradingView hard limits and local merge / history rules; estimate additional unique calls and soft load cliffs.

---

## Verdict

**Phase-3 peer feeds are affordable under TradingView’s 40-call ceiling if they stay light and merged.** Today the indicator uses **3** same-symbol `request.security` calls (`"240"`, `"60"`, `"1"`) and **zero** peer symbols. The minimum for SMT / SMT Fill / PSP / 2-Stage is **2 peer symbols × 4 ITF contexts (`30` / `60` / `90` / `240`) = 8 unique peer calls**, optionally **+2** lightweight peer daily/rails-lite calls for PDH/PDL Stage-1 sweep comparison → **~8–10 additional** unique requests (**11–13 total**), well under 40.

**Do not** clone the native HTF swing + FVG drawing engines or the 1m session-rails state machine onto peers. Peers need OHLC / extremes / closes plus lightweight FVG form+enter flags — not full canvas parity. Reuse ADR-0010’s **14-session / `calc_bars_count = 20160`** indicator cap; avoid `request.security_lower_tf` for peers; prefer UDT payloads so the **127 tuple-element** budget (already **59** used) does not become the binding constraint.

---

## Detailed findings

### 1. Current Pine security surface (baseline)

`pine/gxt-correlated-asset-indicator.pine` declares `dynamic_requests = false` and `calc_bars_count = 20160`, and issues **exactly three** top-level same-symbol calls — matching `level-engine/tests/pine-security-merge.test.ts`:

| # | Symbol | TF | Expression | Tuple size | Purpose |
|---|---|---|---|---:|---|
| 1 | `syminfo.tickerid` | `"240"` | `f_htf_swing_and_fvg_signals()` | 17 | 4H swing confirms + FVG + OHLC |
| 2 | `syminfo.tickerid` | `"60"` | `f_htf_swing_and_fvg_signals()` | 17 | 1H swing confirms + FVG + OHLC |
| 3 | `syminfo.tickerid` | `"1"` | `f_session_rails_with_end()` | 25 | Session rails / ADR / mitigation state machine |

All three use `gaps = barmerge.gaps_off` and `lookahead = barmerge.lookahead_off`. There is **no** `request.security_lower_tf` in the live script (ADR-0011). Coverage audit: **no peer series**.

**Tuple budget today:** 17 + 17 + 25 = **59** of the script-wide **127** tuple-element limit ([Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/)). Remaining headroom ≈ **68** elements if peers keep returning flat tuples — tight once fields multiply; UDTs are the documented escape hatch.

### 2. What phase 3 actually needs from peers (minimum data, not every engine)

Against ADR data requirements:

| Concept | Peer data needed | Full peer HTF swing/FVG **drawing** engine? |
|---|---|---|
| **SMT Divergence (Stage 1)** | Peer extremes vs peer’s corresponding level (e.g. did peer sweep its PDH/swing while chart did / did not) — ADR-0005 §1 | **No** |
| **2-Stage SMT (Stage 2)** | Peer swing high/low behavior on `30m` / `1H` / `90m` (alternating roles) — ADR-0004 / 0005 | **No** — need confirmable extremes, not canvas inventory |
| **PSP / SS PSP (Stage 2)** | Peer **closes** (polarity) on full ITF incl. `4H` — ADR-0005 §3 | **No** — close series suffice |
| **SMT Fill** | Whether each peer **entered its respective** HTF/ITF FVG — ADR-0006 §1 | **No drawings**; need zone existence + enter/not-enter flags (lightweight detect inside peer TF context) |
| **Strength Switching / lead-lag** | Relative expansion from the same OHLC/extreme feeds | **No** |

**Chart-TF peer OHLC alone is not enough:** Stage 2 and Fill are band-specific (`30m` / `1H` / `90m` / `4H` for PSP). Peers need **multi-TF** feeds, not only `timeframe.period`.

**Native vs peer engines:** Traded-symbol Structural Canvas (rails, 4H/1H swings/FVGs) stays as today. Peers should **not** re-run `f_session_rails_with_end` or the full swing lifecycle publish path — ADR-0010 already flags the 1m rails path as the replay hotspot; ADR-0011 rejects a second same-TF `"1"` call even on the native symbol.

### 3. Minimum peer feed shape (recommended)

**Peers:** exactly **two** `input.symbol` peers completing the ADR-0004 triad with the chart symbol (ES / NQ / YM). Chart remains `syminfo.tickerid`. Keep `dynamic_requests = false` → peer ticker IDs must be simple/`input.symbol` strings ([Other timeframes and data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/)).

**Mandatory peer timeframes (phase 3):**

| TF | Why mandatory |
|---|---|
| `"240"` (4H) | Stage 1 HTF/ITF SMT context; SS PSP / 2-Stage PSP Stage 2 closes (ADR-0005) |
| `"60"` (1H) | Stage 1 + Stage 2 SMT/PSP + Fill ITF band |
| `"90"` (90m) | Stage 2 SMT band + Fill / Catch-Up / Continuation ITF FVG (ADR-0002/0005/0006) |
| `"30"` (30m) | Stage 2 SMT band + Fill ITF FVG |

**Deferrable for phase-3 peer feeds:**

| Feed | Why defer |
|---|---|
| Peer `"1"` full rails / ADR / mitigation machine | Expensive (ADR-0010); not required for peer correlation feeds |
| Peer Monthly / Weekly / Daily as separate structural engines | Bias formation stays trader/manual + native Session Context |
| Peer LTF (`15`/`5`/`3`/`1`) CISD / C2/C3 series | Entry is phase 4 after Stage 2 (ADR-0005 §4); out of minimum phase-3 arming feed |
| `request.security_lower_tf` for peers | Docs prefer it only for true intrabar arrays; ADR-0011 removed it for load; phase 3 does not need peer intrabar fanout |

**Optional (+2 calls) for Stage 1 level-sweep honesty:** one lightweight rails-lite or daily extremes call per peer returning at least **PDH/PDL** (and optionally PWH/PWL). Prefer a **lean** expression — not a copy of `f_session_rails_with_end` — so Stage 1 “swept PDH / failed PDH” is measurable without replaying the native 1m hotspot on two extra symbols.

**Per `(peer, TF)` merged expression (one call per context — #24 / ADR-0011):** return a **UDT** (or very small tuple) with approximately:

- `open`, `high`, `low`, `close`, `time` (PSP closes + SMT extremes)
- Lightweight fractal / swing-extreme confirms needed for Stage 2 SMT role flip (booleans + prices — not a full failure-swing inventory)
- Lightweight FVG: `formed`, `zoneLow`, `zoneHigh`, `bullish`, `entered` (price traded into zone) for Fill participation

That is enough for triad Fill participation state (e.g. per-asset enter flags on a tagged TF) without drawing peer zones.

### 4. Load cost / constraints against TradingView + local ADRs

#### Unique `request.*()` count

TradingView: scripts may use up to **40** unique `request.*()` calls, or **64** on Ultimate; uniqueness depends on context (symbol, timeframe, modifiers), expression, and scope; redundant identical calls reuse data ([Other timeframes and data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/); [Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/); [Support article](https://www.tradingview.com/support/solutions/43000745852-i-see-the-the-script-executes-too-many-unique-request-function-calls-error/)).

| Scenario | Unique calls | Notes |
|---|---:|---|
| Today | 3 | Same-symbol `240` / `60` / `1` |
| Minimum phase-3 peers | 3 + 8 = **11** | 2 peers × `{30,60,90,240}` |
| + peer PDH/PDL lite | 3 + 10 = **13** | Still ≪ 40 |
| Anti-pattern: clone native 3 calls × 2 peers | 3 + 6 = 9 | Fewer calls but **heavier** 1m expressions — reject on ADR-0010 cost, not on call count |
| Anti-pattern: every OHLC field as its own call | blows toward 40 | Violates #24 merge rule |

**Call-count is not the binding risk; expression weight and tuple/UDT design are.**

#### Tuple element ceiling

All `request.*()` tuple elements across the script ≤ **127**; excess → use UDTs ([Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/)). With 59 elements already used, eight peer contexts × ~8 flat fields ≈ 64 → **~123 total** — near the cliff. **Peer payloads should use UDTs** (or one UDT per peer TF) so Fill/SMT fields can grow without hitting 127.

#### History depth

- Indicator already caps replay at **14 CME sessions** via `calc_bars_count = 20160` (1m binding) — ADR-0010; Pine requires const int (`CE10123`).
- `request.*()` may also take `calc_bars_count` to limit retrieved bars; without it, request depth follows available chart bars ([Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/)).
- Intrabar LTF retrieval caps: 100K (non-pro) / 125K Expert / 200K Ultimate ([Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/)). Phase-3 peer ITF calls are **not** lower-TF intrabar fanouts when chart ≤ those ITFs; still avoid peer `"1"` engines so this ceiling stays irrelevant.

**Recommendation:** Keep the **ADR-0010 14-session indicator cap** for triad phase 3. Do not widen history for peers. Optionally pass tighter `calc_bars_count` on peer HTF requests once implemented if profiling shows benefit — not required to adopt a second product history policy.

#### Lookahead / gaps / lower-TF guidance

- Match native: `lookahead_off`, `gaps_off` (no lookahead bias; last confirmed / developing fill behavior per docs).
- Docs: prefer `request.security_lower_tf` when you need **all** intrabars inside a chart bar; `request.security` on LTF returns **one** intrabar per chart bar ([Other timeframes and data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/)). Phase-3 peers should request **equal/higher ITF contexts**, not LTF fanout.

#### Soft performance cliffs (local)

- ADR-0010: unbounded / heavy **1m** `request.security` session-rails path dominated load — do not put peers on that path.
- ADR-0011: `security_lower_tf` + chart-side re-sweep was the next hotspot — do not reintroduce for peers.
- TradingView: each unique request fetches another dataset into memory ([Support](https://www.tradingview.com/support/solutions/43000745852-i-see-the-the-script-executes-too-many-unique-request-function-calls-error/)); script execution budgets are 20s (basic) / 40s (others) ([Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/)). Eight light ITF peer contexts are far safer than six heavy rails clones.

#### Adjacent same-symbol cost (not peer)

ITF FVG detection on **native** 30m / 1H / 90m charts may need **same-symbol** `"30"` / `"90"` (and possibly richer `"60"`) security when the trader sits on an LTF chart — **+1–2 same-symbol calls**, separate from the peer 8.

### 5. Cost summary table

| Item | Estimate |
|---|---|
| Current unique `request.security` | **3** (same-symbol) |
| Minimum additional peer unique calls | **8** (2 × `{30,60,90,240}`) |
| Optional peer PDH/PDL lite | **+2** |
| Likely phase-3 total | **11–13** unique requests |
| Hard ceiling | **40** (64 Ultimate) |
| Current tuple elements | **59** / 127 |
| Peer payload strategy | **UDT per peer TF** (avoid flat-tuple cliff) |
| History | **Reuse ADR-0010** 14-session / `20160` |
| Peer engine weight | **Light** OHLC + swing extremes + FVG enter — **not** native canvas clone |

---

## Recommended technical constraints

1. **Triad peers:** Two `input.symbol` peers completing ES/NQ/YM with the chart; chart series stay on `syminfo.tickerid`. No dynamic/runtime symbol switching (`dynamic_requests = false`).
2. **Mandatory peer TFs:** `"30"`, `"60"`, `"90"`, `"240"` only for phase-3 SMT / Fill / PSP / 2-Stage. Do not require peer Monthly/Weekly/Daily structural engines or peer LTF CISD feeds in the phase-3 feed slice.
3. **Merge rule:** Exactly **one** `request.security` per `(symbol, timeframe)` context; pack fields into one expression (tuple or preferably **UDT**) — extend #24 / ADR-0011; never split OHLC across calls.
4. **Peer expression weight:** Lightweight OHLC + Stage-2 extremes + FVG form/zone/enter flags. **Forbidden** in phase 3: cloning `f_session_rails_with_end` or full HTF swing inventory / Failure Swing engines onto peers.
5. **Optional Stage-1 level feed:** At most one additional lean PDH/PDL (rails-lite or daily extremes) call **per peer** — not a third full 1m rails machine.
6. **History:** Keep indicator `calc_bars_count = 20160` / 14-session ADR-0010 cap; do not adopt a wider triad-only history window.
7. **Request modifiers:** `lookahead = barmerge.lookahead_off`, `gaps = barmerge.gaps_off` (match current Pine).
8. **Hard limits to design under:** ≤ 40 unique `request.*()` (document Ultimate 64 as non-target); prefer UDTs so script-wide tuple elements stay ≪ 127; do not use `request.security_lower_tf` for triad peers.
9. **Budget target:** Plan for **≤ 13** total unique security calls after phase-3 peers (3 native + 8 peer ITF + ≤2 peer rails-lite), leaving headroom for same-symbol ITF Fill contexts and later phase-4 work.

---

## Open questions

- Exact UDT field list / Pine type names for the peer payload (implementation).
- Whether Stage-1 PDH/PDL peer comparison uses a daily bar feed vs a lean 1m extremes subset (profiling choice).
- Same-symbol `"30"` / `"90"` security for Fill state while the trader sits on LTF charts (adjacent cost).
- Phase-4 peer LTF CISD / “any triad asset” entry feeds (ADR-0005 §4 / ADR-0006 §2) — not required to arm phase 3.
- Empirical TradingView runtime profiling of the 8 light peer calls on 1m vs ITF charts (proof-of-concept).
