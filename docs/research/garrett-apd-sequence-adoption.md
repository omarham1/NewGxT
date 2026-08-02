# Garrett APD Sequence — Definition, Mapping, Adoption Decision

**Research date:** 2026-08-02

**Question / goal:** Extract Garrett’s first-party definition / step list for **APD** (named in Strength Switching). Map APD ↔ Universal Sequence, 2-Stage SMT / 2-Stage PSP, and strength-switch forms. Recommend whether NewGxT should **adopt** into CONTEXT/ADRs, add **glossary `_Avoid_` only**, or **remain out of scope** (issue **#36**).

**Out of scope:** Implementing indicator logic for APD; editing `CONTEXT.md`, ADRs, or the playbook until this adoption decision is approved.

**Builds on (do not duplicate wholesale):**

- [`gxttrades-model-alignment.md`](gxttrades-model-alignment.md) — Open question #4; Strength switching §; APD named but not mapped
- [`garrett-smt-spoken-expansion.md`](garrett-smt-spoken-expansion.md) — format / method template
- [`garrett-psp-definition-and-use.md`](garrett-psp-definition-and-use.md) — SS PSP / hierarchy
- [`universal-sequence-step-list-recheck.md`](universal-sequence-step-list-recheck.md) — Universal Sequence legs
- `CONTEXT.md` — APD absent today; Strength Switching, Decoupled Sync, Universal Sequence, 2-Stage SMT / 2-Stage PSP present
- ADRs **0002**, **0005**, **0012** — strength rotation / 2-Stage / Universal Sequence

---

## Sources consulted

### Primary (must / first-party Garrett pedagogy)

| Source | URL | Channel | Role this pass |
|---|---|---|---|
| **Strength Switching \| Confirming Expansions With Strength Switch** | https://www.youtube.com/watch?v=wVS09HYcp_I | **erik** (`@eriktrades9`) — Garrett Strength Switching pedagogy (prior alignment) | **Primary APD attestation** — repeated “APD sequence”; spaced-out SMT rationale; case-two open example; chapter list in description (no APD chapter title) |
| Understanding Asset Synchronization in Decoupled Markets | https://www.youtube.com/watch?v=ZTIRoNI8HGs | erik | Live “APD sequence” between YM/NQ; “advanced premium discount SMT” nearby |
| ALWAYS demand an expansion following a crack in correlation \| NQ trade recap +3r | https://www.youtube.com/watch?v=1SkMpmGwbBI | erik | **Strongest expansion collocation:** speaks “advanced premium discount sequence” then immediately “when you have an **APD**” |
| The GxT "Universal Sequence" - Structured Approach | https://www.youtube.com/watch?v=oucPinjDdlk | Garrett (`@GxTradez`) | Speaks “advanced premium discount sequence, **which I'll make a video on**”; **no** letters APD |
| GxT \| Asset Synchronization Series: Part 1/3 | https://www.youtube.com/watch?v=G-M-ElP1MOE | Garrett | Heavy **advanced premium discount** pedagogy (proximity / failure-swing filter); **no** letters APD |
| GxT \| Trade Recap \| My Best Trading Day Ever! | https://www.youtube.com/watch?v=l8koW20yh9M | Garrett | Discusses when something is / is not advanced premium discount; **no** APD |
| A Deeper Dive Into SMT Divergence… | https://www.youtube.com/watch?v=eADu2pFnyAU | Garrett | SMT / failure-swing SMT; **no** APD |
| GxT \| Precision Swing Point \| Pt.1 | https://www.youtube.com/watch?v=iXRQg-OpO6Y | Garrett | PSP / SS PSP; **no** APD |
| A Complete Trading Framework… \| GXT (TTrades guest) | https://www.youtube.com/watch?v=3eVxTV_7L2U | TTrades host; Garrett speaking | **no** APD |
| GxT \| 4H Profiling (sozai full transcript) | https://sozai.app/transcript/gxt-4h-profiling/ | Garrett (GxT) | **no** APD |

**Transcript method:** YouTube auto-captions via `python3 -m yt_dlp --write-auto-sub` (2026-08-02), flattened under `docs/research/_tmp_transcripts/` (gitignored). ASR caveat: acronyms and “premium/discount” may garble; “APD” itself transcribed cleanly in Strength Switching and the two erik recaps above.

**Channel inventory (`@GxTradez` flat playlist):** **No** video title contains “APD”. Titles with Sequence / Sync / SMT / Strength / PSP searched; Universal Sequence and Asset Sync Pt.1 are the long-form “advanced premium discount” hits without the acronym.

**Channel inventory (`@eriktrades9`):** Strength Switching + related strength-switch / sync recaps. Spoken Q&A Garrett references (“explained this yesterday in my Q&A video”) **not located** in public titles this pass — residual gap only for deeper “why APD works” audio, not for the operational definition already in Strength Switching.

### Local NewGxT claims (comparison set)

| File | Role |
|---|---|
| `CONTEXT.md` | No APD; Strength Switching, Decoupled Sync, Universal Sequence, 2-Stage SMT / PSP |
| `docs/adr/0002-strength-rotation-and-catchup.md` | Strength rotation, Decoupled Sync gate |
| `docs/adr/0005-2-stage-smt-and-strength-switch.md` | 2-Stage SMT / 2-Stage PSP |
| `docs/adr/0012-universal-sequence.md` | Named continuation sequence |

### Secondary

None used as definitional authority. Web / ICT “APD” expansions (if any) were not consulted.

---

## What was found

### 1. Where APD is spoken

| Field | Value |
|---|---|
| **Strongest source** | Strength Switching — https://www.youtube.com/watch?v=wVS09HYcp_I |
| **Published** | 2026-03-15 (metadata) |
| **Length** | ~3h05m |
| **First-party?** | **Supporting primary** — Garrett pedagogy hosted on erik, same corpus as prior alignment Strength Switching work |
| **Title / description “APD”?** | **No** — description chapters cover types of strength switching, asset sync reversals, lagging continuations, examples; **APD is not a chapter label** |
| **Other letter hits** | erik: `ZTIRoNI8HGs`, `1SkMpmGwbBI`. `@GxTradez` auto-transcripts in this pass: **zero** `\bAPD\b` |

### 2. Acronym expansion — **Advanced Premium Discount** (strongly collocated; not a formal “stands for” line)

Garrett does **not** say “APD stands for …” in consulted audio. He **does** bind the letters to the long form by immediate shorthand:

> “… an **advanced premium discount sequence** where YM is trading like way here for NQ's range and NQ's just way inside of this range, right? So, what options do you have here going forward when you have an **APD**?”  
> — [1SkMpmGwbBI](https://www.youtube.com/watch?v=1SkMpmGwbBI)

Elsewhere he teaches the same long form without letters:

- Universal Sequence: “That's an **advanced premium discount sequence**, which I'll make a video on.” — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk)
- Asset Sync Pt.1: “this is where we use **advanced premium discount** … to basically validate continuation” via **proximity** of failure swings in the range from reversal low → DOL high. — [G-M-ElP1MOE](https://www.youtube.com/watch?v=G-M-ElP1MOE)
- Strength Switching also says “**advanced premium discount sequence**” for NQ at EQ vs YM below EQ of a shared range (asset sync example). — [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I)

**Candidate expansions vs primary attestation**

| Candidate | In Garrett first-party sources this pass? |
|---|---|
| **Advanced Premium Discount** (sequence / tool) | **Yes** — strong collocation + long-form teaching |
| Accumulation / distribution (AMD-style) | **No** as APD — AMD appears separately as accumulation → manipulation → distribution |
| Other deliberate A-P-D long forms | **No** |

### 3. Operational definition (what he teaches under “APD sequence”)

APD is **not** a numbered multi-leg protocol like Universal Sequence or 2-Stage SMT. It is a **cross-asset premium/discount / spacing quality filter** on SMT and strength-switch setups.

#### From Strength Switching (letter form)

1. **Spaced-out SMT vs tight SMT.** A plain SMT with both assets near the same extreme is **not** an APD / spaced SMT — the lagging side can still take the high/low with “one more candle.” A **spaced-out** SMT (failure-swing asset far from the swept extreme) raises expansion probability after the crack / switch.  
   > “It just means that there's a **higher probability of expansion with an APD sequence** because when you are this close to this high, it could take out this high easily… But if you have a **spaced out SMT**… You see how much price has to move higher in order to catch up…”  
   — [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I)

2. **Asset-selection implication.** He dislikes trading the **lagging** asset into a large catch-up when APD spacing is present; prefer the failure-swing / nearer-extreme side when it sits in **premium** for longs (near the high). If the failure-swing side is already **below EQ**, catch-up is “going to take so much.”  
   — [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I)

3. **“Case two with the APD sequence” (live packaging).** 9:30 opens where one asset is **above a high** and the other is in an **SMT / gap** — same spaced geometry; strength switch via **gap fill**; expect joint expansion after LTF CISD-style follow-through. Often stacked with two-stage / PSP / gap-fill SS.  
   — [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I)

#### From Asset Sync Pt.1 (long form without letters)

Mechanical sketch he *does* give for **advanced premium discount** as a filter:

- Mark range from **reversal low → DOL high** when the lead takes the high.
- If failure swings print in **premium** (esp. OTE) of that range → **close proximity** → low-probability bearish SMT (likely **breaks** → continuation).
- If failure swings sit in **discount / EQ** → SMT more likely **holds** (continuation invalidation flavor).
- He explicitly says he is **not scratching the surface** and defer deeper cases to a **future episode**.  
  — [G-M-ElP1MOE](https://www.youtube.com/watch?v=G-M-ElP1MOE)

#### Step list?

**No authoritative numbered APD checklist** in titles, descriptions, or narration comparable to Universal Sequence / ADR-0012. “Sequence” here means **premium-discount positioning + spaced SMT packaging**, not Stage 1 → Stage 2.

Dedicated APD video: **promised** in Universal Sequence (“which I'll make a video on”); **not found** in `@GxTradez` title inventory this pass.

---

## Mapping table

| NewGxT / Garrett construct | Relationship to APD | Evidence |
|---|---|---|
| **Universal Sequence** (ADR-0012) | **Adjacent, not a required US step.** APD / advanced premium discount appears as optional framing inside sync / metals examples; US owns gap → SMT fill → DOL. Garrett promises a separate APD video. | [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk); [universal-sequence-step-list-recheck.md](universal-sequence-step-list-recheck.md) |
| **2-Stage SMT** (ADR-0005) | **Orthogonal quality filter.** Large-range → small-range / alternating SMT can *co-occur* with APD spacing; APD does not replace Stage 1 or Stage 2. | [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I) (2-stage + APD case packaging) |
| **2-Stage PSP / SS PSP** (ADR-0005) | **Can stack.** Case-two style examples add gap + PSP / gap-fill SS on top of APD spacing; SS PSP remains Stage 2 Path B, not “APD.” | [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I) |
| **Strength Switching** (CONTEXT / ADR-0002) | **Parent pedagogy.** APD is taught *inside* Strength Switching as why spaced cracks expand and how to pick lead vs lag; SS forms remain SS PSP, SMT fill, temporary LTF switches. | [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I); alignment Strength switching § |
| **Decoupled Sync** (CONTEXT / ADR-0002) | **Overlapping concern, different rule.** Decoupled Sync = wait for Relevant Level before high-quality SS/catch-up. APD = premium/discount / spacing of failure swings vs swept extreme. Related tug-of-war / sync family; **not synonymous.** | ADR-0002; [ZTIRoNI8HGs](https://www.youtube.com/watch?v=ZTIRoNI8HGs); [G-M-ElP1MOE](https://www.youtube.com/watch?v=G-M-ElP1MOE) |
| **SMT Fill / Catch-Up / Continuation** | APD informs **whether** catch-up distance is “too much” and whether an SMT is likely to hold vs break; it does not redefine Fill state machine (ADR-0006 out of scope). | [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I); [G-M-ElP1MOE](https://www.youtube.com/watch?v=G-M-ElP1MOE) |

---

## Explicit recommendation

| Verdict | **Glossary `_Avoid_` only** — do **not** adopt APD as a named NewGxT sequence / ADR |
|---|---|
| **Why Avoid (not silent out-of-scope)** | Garrett names **APD sequence** repeatedly in Strength Switching and related erik audio; agents reading Garrett corpus will treat it as a missing P0 model (same failure mode Universal Sequence had). An `_Avoid_` on existing Strength Switching / Decoupled Sync entries stops inventing a parallel stage list without elevating the label to canonical vocabulary. |
| **Why not adopt into CONTEXT/ADRs** | No locked numbered step list; expansion is collocated not formally “stands for”; Garrett defers depth (“future episode” / “I'll make a video”); mechanics are a **premium-discount proximity filter** already partially covered by Strength Switching + Decoupled Sync + asset-selection notes — not a third confirmation sequence beside 2-Stage / Universal Sequence. |
| **Why not pure remain-out-of-scope** | Leaving zero doc footprint invites re-open of alignment Open question #4 as “unknown missing model.” Avoid + this research note closes the question without product expansion. |
| **Suggested follow-up doc edit (separate change; not this pass)** | Add `APD`, `APD sequence`, and optionally `Advanced Premium Discount sequence` to `_Avoid_` under **Strength Switching** and/or **Decoupled Sync**, with a one-line research cite: *Garrett packaging for spaced SMT / cross-asset premium-discount proximity — not a NewGxT stage.* Do **not** add a dedicated APD glossary entry or ADR. |
| **Do not** | Implement APD indicator logic; invent Stage-style APD steps; assert AMD / other expansions; fold APD into Universal Sequence step list. |

---

## Suggested follow-up

1. **Approve Avoid-only edit** on issue **#36** (or a small follow-up issue) — then touch `CONTEXT.md` only; no ADR.
2. **Mark alignment Open question #4 resolved** — point at this note.
3. Re-open adoption only if Garrett ships the promised dedicated advanced-premium-discount video with a mechanical checklist NewGxT wants to encode.

---

## Method notes

- Prefer Garrett audio (and Garrett pedagogy on erik used in prior NewGxT research) over secondary blogs.
- Quotes from YouTube auto-transcripts (2026-08-02). Treat ASR HTML entities (`Q&amp;A`, `&gt;&gt;`) as noise; “APD” / “advanced premium discount” were stable strings.
- Temporary transcripts: `docs/research/_tmp_transcripts/` (gitignored). Deliverable is this Markdown note only.
- Residual: spoken Q&A referenced from Strength Switching not found in public `@eriktrades9` titles; `@GxTradez` dedicated APD video still promised, not found.
