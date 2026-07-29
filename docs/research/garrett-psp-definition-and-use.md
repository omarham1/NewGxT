# Garrett PSP — Definition and Operational Use (Doc Alignment)

**Research date:** 2026-07-29

**Question / goal:** How does Garrett (GxtTrades / GxT / @GxTradez) define **PSP**, and **what does he use it for**? Capture primary definition + pedagogy/use so NewGxT docs can align — without re-litigating the acronym expansion (already settled as **Precision Swing Point**).

**Builds on (do not duplicate):**

- [`psp-dedicated-video.md`](psp-dedicated-video.md) (2026-07-29) — dedicated video located; spoken expansion = Precision Swing Point only
- [`gxttrades-model-alignment.md`](gxttrades-model-alignment.md) (2026-07-14) — PSP in Universal Sequence / SS / 2-Stage context (glossary then still said Polarized Strength Profile; product docs have since renamed)

---

## Sources consulted

### Primary (first-party Garrett audio / auto-transcript)

| Source | URL | Role this pass |
|---|---|---|
| **GxT \| Precision Swing Point \| Pt.1** | https://www.youtube.com/watch?v=iXRQg-OpO6Y | Canonical definition, ingredients, named variants, framework rule, phases-of-price use, SS PSP intro |
| The GxT "Universal Sequence" - Structured Approach | https://www.youtube.com/watch?v=oucPinjDdlk | PSP when both assets fill gap; continuation PSP; SS PSP / PSP+SMT-fill packaging; one-stage at continuation |
| Strength Switching \| Confirming Expansions With Strength Switch | https://www.youtube.com/watch?v=wVS09HYcp_I | SS PSP (SSPS) as freest reversal / catch-up signature; hierarchy (draw → profile → cracks); TF close confirmation |
| GxT \| Trade Recap \| My Best Trading Day Ever! | https://www.youtube.com/watch?v=l8koW20yh9M | Live: no SMT at key level → confirm with swing point / PSP |
| A Complete Trading Framework… \| GXT (TTrades guest) | https://www.youtube.com/watch?v=3eVxTV_7L2U | Same definition + two-stage / continuation PSP pedagogy; points to his PSP video for SS PSP |

Transcripts: YouTube auto-captions via `yt-dlp --write-auto-sub` (2026-07-29). ASR caveat: “crack in” often rendered **“Kraken”**; “PSP” occasionally **“PSB”** / “strength PHP”. Quotes below normalize obvious ASR errors in brackets.

### Local NewGxT claims (comparison set)

| File | Role |
|---|---|
| `CONTEXT.md` | Glossary: PSP, SS PSP, SMT Divergence, Universal Sequence, 2-Stage SMT, Strength Switching |
| `docs/daily_execution_playbook.md` | Stage 2 Path B SS PSP; Reversal Play |
| `docs/adr/0004-timeframe-hierarchy-and-triad-specification.md` | PSP on full ITF closes; Path A vs Path B TF bands |
| `docs/adr/0005-2-stage-smt-and-strength-switch.md` | Stage 2 Path B = SS PSP |
| `docs/adr/0012-universal-sequence.md` | Gap retrace: SMT Fill preferred; PSP if both fill |
| `docs/adr/0002-strength-rotation-and-catchup.md` | Strength switch / catch-up (no PSP-specific text) |
| `docs/adr/0001-reversal-validation-rules.md` | SMT + SS / SS PSP can override 50% / FVG depth rules |
| `docs/adr/0003-daily-bias-and-target-selection.md` | Reversal gate = 2-Stage SMT/SS (incl. SS PSP) |

### Secondary (discovery only — not definitional authority)

| Source | Why secondary |
|---|---|
| Eleven_trades / Hudson Trades / other “PSP with SMT” shorts | Third-party educators; may paraphrase Garrett |
| Docsbot / AI “GxTradez model” pages | Paraphrase |
| ICT / Trader Daye QT PSP materials | Shared QT lineage phrase; not GxT-owned use rules |

---

## What was found

### 1. Canonical definition (what a PSP is)

Garrett’s own wording in the dedicated lecture:

> “…the concept **precision swing points or PSP for shorts**. This is a concept founded by trader day. … Today I will be showing you how I use **precision swing point**.”  
> — [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y)

> “So **what is a precision swing point**? It is a swing point, right? But it is not just a swing point. It is also a [crack in] correlation… The difference in closes is the [crack in] correlation… They're going to **close in opposing directions**. … Asset one closes bullish. Asset two, the correlated market closes bearish. It's as simple as that.”  
> — [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y)

> “…the market also cannot reverse without SMT. So why not require SMT… And that's where the **precision swing point has both of them built into it**. So it is… a swing point and a [crack in] correlation.”  
> — [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y)

Same definition on TTrades (Garrett speaking):

> “Now we are going to be covering the **PSP**. This is a concept taught by trader day… It is where between a correlated markets they **close in opposite directions**.”  
> — [3eVxTV_7L2U](https://www.youtube.com/watch?v=3eVxTV_7L2U)

**One-sentence primary definition:** A PSP is a **swing formation that also embeds a crack-in-correlation via opposite candle closes** on correlated assets (same candle / swing window).

*(Acronym expansion already confirmed in [`psp-dedicated-video.md`](psp-dedicated-video.md); this note does not re-open Polarized Strength Profile.)*

### 2. Necessary ingredients

| Ingredient | Garrett (primary) | Cite |
|---|---|---|
| Correlated assets | Required — opposite closes between correlated markets | [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y); [3eVxTV_7L2U](https://www.youtube.com/watch?v=3eVxTV_7L2U) |
| Opposite closes | Core crack: one bullish close, one bearish close | Same |
| Swing / C2 context | Often framed at C2 (or C2↔C3) swing formation, not a naked random bar | [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y) |
| Relevant level / narrative | Must engage something relevant (IRL↔ERL, order-pairing range, key high/low/gap) | [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y) |
| Timeframes | **Fractal** — he applies on daily, 4H, 90m, 1H, 30m, 15m; “doesn't matter” which TF for the *concept* | [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y); live 15m/90m SS PSP in [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I) |
| Close confirmation | PSP is confirmed on that TF’s **close** (e.g. wait 90m close, or use faster 15m SS PSP early) | [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I) |

### 3. Named variants and what each is for

From Pt.1 + Universal Sequence + TTrades (same taxonomy):

| Variant | What it is | What he uses it for |
|---|---|---|
| **Plain PSP** | Opposite closes at a swing / key-level engagement; one crack | Hint / confirm reversal or phase change when SMT extreme is missing or both assets hit the level/gap |
| **Two-stage PSP** | PSP + SMT between C1–C2 **or** C2–C3 (order can swap: SMT confirms PSP, or PSP confirms SMT) | Highest-probability swing formation / reversal packaging he ranks above bare swing or single PSP |
| **Continuation PSP** | After true reversal + expansion: opposite closes in the continuation structure (often candle-3 that forms the FVG / gap); not a “go the other way” signal | Time retracement / catch-up **with** open DOL — ignore opposing-narrative reading |
| **Strength Switch PSP (SS PSP / SSPS)** | Sweeping / previously strong asset closes **against** its sweep polarity; correlated asset closes the other way → roles flip | Freest reversal signature; catch-up trigger so lagging asset can run to the lead’s highs/lows; Stage-2 style confirmation after Stage-1 SMT |

Primary quotes:

> Probability ranking: swing formation (least) → PSP → **two-stage** versions (highest) — “a PSP is one cracking correlation. This is a **two-stage** cracking correlation.”  
> — [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y)

> “**continuation PSP**… after a true reversal… we expand away… a lot of people… think this is a PSP to go higher… But really, this is just used for **retracement**.”  
> — [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y); same teaching on [3eVxTV_7L2U](https://www.youtube.com/watch?v=3eVxTV_7L2U)

> “**strength switch PSP**… a concept that I came up with… this asset that ran the high is the strongest asset. So, it should be closing bullish, [but it doesn’t]…”  
> — [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y)

> Strength Switching lecture: “I typically refer to this as **SSPS**, which is a strength switch [PSP]. And this is the **freest reversal model**… if you have your framework behind you…”  
> — [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I) *(ASR: SSPSB / PSB)*

**Note on SSPS:** Spoken shorthand in Strength Switching. Prior product decision (issue #33 / Change 6): **do not revive SSPS as a glossary alias** — keep **Strength Switch PSP (SS PSP)**.

### 4. Where PSP sits in the framework

#### Universal Sequence / gap continuation

When both assets fill the gap (no SMT Fill):

> “when both assets hit the gap… If you don't have SMT with the gap, you need **SMT via swing point**. And this is where we have a **PSP**… It's a **difference in closes**, which is the crack in correlation in itself.”  
> — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk)

Favorite packaging: gap candle itself as PSP / **continuation PSP**, or **strength-switch PSP within a gap** / PSP + SMT fill for catch-up. Continuation after a prior reversal SMT is typically **one-stage** at the gap (no need to re-print full 2-stage). — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk)

#### Reversal when classic SMT is missing

> “we don't have [SMT] there, but we do have it via **PSP**. So remember, if you don't have SMT in the key level, what do you confirm it with? A **swing point**…”  
> — [l8koW20yh9M](https://www.youtube.com/watch?v=l8koW20yh9M)

TTrades: key level hit on both assets without SMT → **PSP close** can hint/confirm reversal. — [3eVxTV_7L2U](https://www.youtube.com/watch?v=3eVxTV_7L2U)

#### Strength Switch / 2-stage relationship

- Stage-1 crack (SMT at key level) + Stage-2 via SS PSP / smaller-range crack is his high-probability reversal confirmation.  
- Two-stage PSP (PSP + C1–C2 or C2–C3 SMT) is the candle-formation packaging of that idea.  
- SS PSP also **times catch-up** after lead reaches DOL. — [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I); [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk)

#### Phases of price (Pt.1 pedagogy; thin in NewGxT)

PSP as **trigger** for expansion → retracement → re-expansion / reversal phases (e.g. PSP after consecutive expansion candles → expect retrace to IRL/EQ; PSP at opposing extreme → new phase). — [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y)

### 5. What Garrett says **not** to do

> “where do we apply… precision swing points… **always within narrative**… or… **framework**… We can't just trade any PSP everywhere. It's not that good… You got to have **context**.”  
> — [iXRQg-OpO6Y](https://www.youtube.com/watch?v=iXRQg-OpO6Y)

> Hierarchy: “I see a lot of you guys just **blindly trading two-stage SMTs, PSPs** as long as there's a draw. No… The two-stage crack… and even the strength switch should come at the **very last** of your priorities. The first one should be the **draw**. The second… **profile** and the wick… And the last… crack in correlation…”  
> — [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I)

> Continuation narrative: PSPs **opposing** the open DOL after LOD/HOD is set are **not** used as reversals. — [3eVxTV_7L2U](https://www.youtube.com/watch?v=3eVxTV_7L2U)

---

## NewGxT current claims (summary)

| Concept | What NewGxT says today |
|---|---|
| **PSP** (`CONTEXT.md`) | Opposite-polarity closes on full ITF (`30m` / `1h` / `90m` / `4h`); formerly Polarized Strength Profile; named **Precision Swing Point** |
| **SS PSP** | After SMT: sweeper closes reversal direction, pair closes trend direction; Stage 2 Path B on full ITF incl. `4H` |
| **2-Stage SMT** | Stage 1 HTF/ITF SMT → Stage 2 Path A (second SMT on `30m`/`1H`/`90m`) **or** Path B SS PSP; LTF C2/C3/CISD = entry only |
| **Universal Sequence** (`CONTEXT.md` + ADR-0012) | Gap retrace prefers SMT Fill; **PSP when both assets fill**; one-stage at continuation gap |
| **Playbook** | Step 7 / Play A Stage 2 Path B = SS PSP (same TF rule as ADR-0005) |
| **Crack in correlation** | Not a separate glossary head term; aliased under **SMT Divergence** (“Same crack Garrett calls crack in correlation”) |
| **Named variants** | SS PSP yes; **two-stage PSP** and **continuation PSP** not named as PSP subtypes |
| **Naked-PSP warning / phases-of-price** | Implicit via POI / Relevant Level / DOL gates; not stated as Garrett’s “always within narrative” rule |

---

## Alignment table (NewGxT vs Garrett) + recommendations

| Topic | Status | Gap | Recommendation |
|---|---|---|---|
| Acronym = Precision Swing Point | **Already aligned** | None for naming | **Keep** `CONTEXT.md` PSP title + `_Avoid_: Polarized Strength Profile`. See [`psp-dedicated-video.md`](psp-dedicated-video.md). |
| Core definition = opposite closes | **Mostly aligned** | Glossary emphasizes closes only; Garrett’s dual “swing + crack” is thinner | **Enrich** `CONTEXT.md` **Precision Swing Point** one clause: swing formation **and** opposite closes (crack in correlation). File: `CONTEXT.md` PSP entry. |
| SS PSP as Stage 2 Path B | **Already aligned** | Mechanized TF split (Path A no `4H`) is NewGxT precision, not a Garrett quote conflict | **Keep** ADR-0005 / playbook Path B; optional one-line cite that Garrett treats SS PSP as freest reversal / Stage-2 style confirmation. |
| PSP when both assets fill gap | **Already aligned** | — | **Keep** Universal Sequence / ADR-0012 step 6 wording. |
| Two-stage PSP (PSP+SMT on C1–C2 / C2–C3) | **Gap (pedagogy)** | NewGxT “2-Stage SMT” is the structural gate; does not name **two-stage PSP** as candle packaging | **Enrich** (glossary and/or ADR-0005 note): two-stage PSP = PSP + SMT between adjacent swing candles; maps onto Stage 1/2 cracks without inventing a new play. Prefer `CONTEXT.md` under PSP or 2-Stage SMT; short cross-link in ADR-0005. |
| Continuation PSP | **Gap (pedagogy)** | ADR-0012 / Universal Sequence describe the behavior (gap candle / post-reversal opposite closes) without the name | **Enrich** `CONTEXT.md` PSP or Universal Sequence: name **continuation PSP** = opposite closes in expansion/retrace with open DOL — not a counter-trend reversal. Pointer: ADR-0012 step 6. |
| Timeframe band ITF-only for “general PSP” | **Intentional narrowing** | Garrett is fractal (incl. 15m, daily); NewGxT locks structural PSP to ITF | **Keep** ADR-0004 ITF band for Stage 2 / indicator; **enrich** with explicit “NewGxT mechanization” note that Garrett applies PSP fractally, while product Stage-2 / dashboard PSP uses ITF closes. Optional: playbook tip that LTF (e.g. 15m) SS PSP can be early confirmation before ITF close — mirrors [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I) — only if product wants that discretion. |
| Don’t pattern-trade PSP alone | **Partial** | Hierarchy (draw → profile → crack) not written next to PSP | **Enrich** playbook or `CONTEXT.md` PSP `_Avoid_` / note: require Relevant Level / open DOL / framework; never naked PSP. Cite Garrett hierarchy from Strength Switching. |
| Phases-of-price PSP triggers | **Gap (optional)** | Not in NewGxT | **Defer** unless product wants phase pedagogy; Pt.2 (if published) may expand. Not required for execution alignment. |
| Credit Trader Day / QT lineage | **Optional** | Not in glossary | **Optional enrich** one credit line under PSP; not required for ops. |
| SSPS alias | **Already aligned (avoid)** | Garrett says SSPS verbally | **Keep** avoiding SSPS as glossary alias (`SS PSP` only). |
| Crack in Correlation as head term | **Partial** | Only under SMT Divergence `_Avoid_` | **Keep** or lightly **enrich**: note that PSP is the close-polarity form of the same crack (don’t invent a separate contradictory definition). |

### Concrete doc actions (priority)

1. **Keep (no change):** Precision Swing Point naming; SS PSP Stage 2 Path B; Universal Sequence “PSP when both fill”; ITF band for structural PSP; no SSPS alias.
2. **Change / enrich (recommended):**
   - `CONTEXT.md` — PSP entry: add swing+crack dual definition; add short bullets for **two-stage PSP** and **continuation PSP**; one-line “always in framework / Relevant Level.”
   - `docs/adr/0005-…` or `0012-…` — one cross-link sentence mapping two-stage / continuation PSP names to existing Stage-2 / gap rules (no new mechanical paths unless desired).
   - `docs/daily_execution_playbook.md` — brief Path B / gap note: plain PSP substitutes for missing SMT Fill / missing key-level SMT; SS PSP is the strength-rotation form; don’t take opposing-DOL continuation PSPs as reversals.
3. **Defer:** Phases-of-price section; waiting on unpublished PSP Pt.2.

**Do not edit product docs in this research pass** — recommendations only.

---

## Explicit answer (for doc owners)

1. **Definition:** PSP = Precision Swing Point = swing formation + crack-in-correlation via **opposite closes** on correlated assets.
2. **Primary uses Garrett teaches:** (a) reverse/confirm when SMT extremes are missing; (b) Stage-2 / strength-switch confirmation (SS PSP); (c) Universal Sequence when both assets fill the gap; (d) continuation / catch-up timing (continuation PSP, SS PSP at gaps); (e) phase triggers — always inside narrative/framework, never naked.
3. **Top doc gaps:** Name **two-stage PSP** and **continuation PSP**; strengthen dual swing+crack wording; state framework / hierarchy warning; optionally note fractal-vs-ITF mechanization. Core opposite-close + SS PSP + gap-PSP mechanics are already aligned.
4. **This note:** `docs/research/garrett-psp-definition-and-use.md`

---

## Method notes

- Prefer `@GxTradez` audio and Garrett-on-TTrades over third-party PSP explainers.
- Quotes from YouTube auto-captions (2026-07-29); treat ASR “Kraken” → “crack in”, “PSB” → “PSP”, “strength PHP” → “strength switch PSP”.
- Acronym litigation closed in [`psp-dedicated-video.md`](psp-dedicated-video.md); model-wide context in [`gxttrades-model-alignment.md`](gxttrades-model-alignment.md).
- No published **PSP Pt.2** found as of 2026-07-29 (same as dedicated-video note).
