# Garrett SMT — Spoken Long-Form Expansion (Primary Search)

**Research date:** 2026-07-31

**Question / goal:** Does Garrett (GxtTrades / GxT / @GxTradez) ever speak (or put on-slide / in title / description) a long-form expansion of **SMT** — e.g. Smart Money Technique, Smart Money Tool, Smart Money Theory, or any other S-M-T expansion — in first-party sources? Pin evidence for NewGxT glossary / docs follow-up (issue **#34**).

**Out of scope:** Changing SMT Fill mechanics (ADR-0006); inventing an expansion from ICT secondary sources.

**Builds on (do not duplicate):**

- [`gxttrades-model-alignment.md`](gxttrades-model-alignment.md) (2026-07-14) — Open question #2; operational SMT = crack in correlation; expansion “weakly attested”
- [`psp-dedicated-video.md`](psp-dedicated-video.md) / [`garrett-psp-definition-and-use.md`](garrett-psp-definition-and-use.md) — parallel method for PSP acronym (contrast: PSP *was* expanded on-camera)

---

## Sources consulted

### Primary (first-party Garrett / GxT audio + titles / descriptions)

| Source | URL | Channel | Role this pass |
|---|---|---|---|
| **A Deeper Dive Into SMT Divergence - The Key To Price Anticipation** | https://www.youtube.com/watch?v=eADu2pFnyAU | Garrett (`@GxTradez`) — oEmbed confirmed | **Dedicated SMT lecture**; title + full auto-transcript; explicit “what is an SMT?” |
| The GxT "Universal Sequence" - Structured Approach | https://www.youtube.com/watch?v=oucPinjDdlk | Garrett | Heavy SMT / SMT fill / 2-stage use; no expansion |
| GxT \| Precision Swing Point \| Pt.1 | https://www.youtube.com/watch?v=iXRQg-OpO6Y | Garrett | SMT paired with PSP; no SMT expansion (PSP *is* expanded — contrast) |
| GxT \| Trade Recap \| My Best Trading Day Ever! | https://www.youtube.com/watch?v=l8koW20yh9M | Garrett | Live SMT / 2-stage / fill language; no expansion |
| GxT \| 4H Profiling (sozai full transcript) | https://sozai.app/transcript/gxt-4h-profiling/ | Garrett (GxT) | Ideal SMT LOD, gap SMT, two-stage SMT; points viewers at “my SMT video”; no expansion |
| GxT \| Asset Synchronization Series: Part 1/3 | https://www.youtube.com/watch?v=G-M-ElP1MOE | Garrett | Adjacent sync / SMT pedagogy (~167 “SMT” hits in auto-transcript); no expansion |
| A Complete Trading Framework… \| GXT (TTrades guest) | https://www.youtube.com/watch?v=3eVxTV_7L2U | TTrades host; **Garrett speaking** | Title uses “SMT”; description lists SMT/PSP/two-stage; no spoken expansion |

**Transcript method:** YouTube auto-captions via `yt-dlp --write-auto-sub` (2026-07-31), flattened locally under `docs/research/_tmp_transcripts/`. ASR caveat: “SMT” sometimes garbled as “S&P” / “S&T” / “SMG”; “crack in” sometimes “Kraken”; does **not** create false “Smart Money …” hits.

**Channel inventory:** Flat playlist of `@GxTradez` videos searched for titles containing SMT. Only dedicated hit: `eADu2pFnyAU` (*A Deeper Dive Into SMT Divergence…*). No title uses “Smart Money Technique/Tool/Theory”.

### Supporting primary (Garrett pedagogy hosted elsewhere)

| Source | URL | Note |
|---|---|---|
| Strength Switching \| Confirming Expansions With Strength Switch | https://www.youtube.com/watch?v=wVS09HYcp_I | Hosted on channel **erik** (not `@GxTradez`); used in prior alignment as Strength Switching pedagogy. Full auto-transcript searched; **no** SMT long-form expansion. |

### Local NewGxT claims (comparison set)

| File | Role |
|---|---|
| `CONTEXT.md` | Glossary: **SMT Divergence** (operational crack / institutional divergence wording); **SMT Fill**; no Technique/Tool/Theory expansion asserted |
| `docs/adr/0006-smt-fill-state-machine-and-execution-triggers.md` | Mechanics only — out of scope for this note |

### Secondary (discovery only — **not** definitional authority for NewGxT)

| Source | Why secondary |
|---|---|
| ICT / blog “SMT = Smart Money Technique” or “Smart Money Tool” guides (ictkillzone, quantum-algo, LiteFinance, MetroTrade, etc.) | ICT-lineage paraphrase; Technique vs Tool already conflicts across secondaries |
| Sozai ICT Episode 29 review transcript | Speaker expands “SMT, Smart Money Technique or Smart Money Tool” — **ICT**, not Garrett |
| Hudson Trades / EzTrades / other “SMT Divergence” shorts | Third-party educators; not Garrett audio |
| Web search snippets that parenthetically expand SMT while summarizing GxTradez | Search-engine / secondary gloss, not first-party speech |

---

## What was found

### 1. Dedicated first-party SMT video located

| Field | Value |
|---|---|
| **Title** | A Deeper Dive Into SMT Divergence - The Key To Price Anticipation |
| **URL** | https://www.youtube.com/watch?v=eADu2pFnyAU |
| **Channel** | Garrett (`@GxTradez`) |
| **Published** | 2025-05-20 (metadata) |
| **Length** | ~45:55 |
| **First-party?** | **Yes** |
| **Title / description expansion?** | **No** — title uses **SMT Divergence**; description is linktree / prop code / disclaimer only |

This is the lecture Garrett points to when he says (4H Profiling) to see his SMT video.

### 2. Spoken acronym expansion — **none found**

**Negative finding (success for #34):** After searching titles, descriptions, and auto-transcripts of the dedicated SMT dive plus the prior alignment set, Asset Synchronization Pt.1, TTrades guest lecture, sozai 4H Profiling, and Strength Switching — **Garrett does not speak any long-form expansion of the letters S-M-T.**

String search across flattened auto-transcripts found **zero** hits for:

- `Smart Money`
- `stands for`
- `SMT means`
- `Technique` / `Smart Money Tool` / `Smart Money Theory` (as expansion)
- `acronym`

He treats **SMT** as established jargon and defines it **operationally**.

### 3. Canonical operational definition (what he *does* say)

In the dedicated dive, he asks the definitional question and answers with correlated-market divergence — **not** an expansion of the letters:

> “So, **what is an SMT**? So, there's many forms of SMT. So, here's one of them, the most commonly um referred to is an **SMT between two correlated markets** and one asset takes out the high. So they're you know correlated markets are going to create the same highs and lows and one asset is going to take out that high where if we compare uh you know the chart to the other asset it doesn't take that high. So that's the **correct correlation** which is hinting a reversal.”  
> — [eADu2pFnyAU](https://www.youtube.com/watch?v=eADu2pFnyAU)

Elsewhere he packages the same idea as **crack in / cracking correlation** / two-stage SMT / SMT fill / failure-swing SMT, etc., still without expanding S-M-T (prior alignment + PSP notes).

**Contrast with PSP:** In the same channel’s PSP Pt.1 he *does* bind the short form (“**precision swing points or PSP for shorts**”). That pattern is **absent** for SMT.

### 4. Candidate expansions vs primary attestation

| Candidate expansion | In Garrett first-party sources this pass? |
|---|---|
| **Smart Money Technique** | **No** |
| **Smart Money Tool** | **No** |
| **Smart Money Theory** | **No** |
| Other deliberate long forms of S-M-T | **No** |
| Operational “crack in correlation” / correlated-market divergence | **Yes** — strong primary attestation |

---

## Explicit answer

**Does Garrett speak a long-form expansion of SMT?**

**No** — not in the dedicated SMT Divergence lecture, not in the other first-party Garrett / GxT sources re-checked and expanded for this pass, and not in titles or descriptions of those videos. ICT / blog expansions (Technique vs Tool) are secondary and already conflict with each other; they must not be imported as NewGxT glossary truth from this research alone.

---

## Doc recommendation

| Verdict | **Leave unspecified** — do **not** add Technique / Tool / Theory to `CONTEXT.md` |
|---|---|
| Why | Primary evidence is a clear **negative** on acronym expansion. Asserting Smart Money Technique or Tool would elevate ICT-secondary gloss over Garrett’s own usage. |
| Keep | Operational glossary: SMT / SMT Divergence as cross-asset crack (already aligned with “crack in correlation”); SMT Fill mechanics unchanged (ADR-0006 out of scope). |
| Optional later (not required to close #34) | If product wants a one-line pedagogy note: “Garrett uses SMT as jargon for crack-in-correlation; he does not expand the letters in consulted first-party video.” Prefer a docs comment / research cite over inventing a glossary expansion. |
| Do **not** | Edit CONTEXT.md / ADRs to assert Technique vs Tool from secondary sources. |

---

## Suggested follow-up

1. **Close GitHub issue #34** — acceptance met: primary search complete; negative finding documented; glossary recommend is leave unspecified.
2. **Mark alignment Open question #2 resolved** — point at this note (done in `gxttrades-model-alignment.md`).
3. Re-open only if a new first-party Garrett source (bootcamp PDF, on-slide text capture, future video) *says* the expansion out loud or on-screen.

---

## Method notes

- Prefer Garrett audio/title on `@GxTradez` (and Garrett speaking on TTrades) over third-party “SMT means …” articles.
- Dedicated SMT dive confirmed via YouTube oEmbed (`author_name`: Garrett, `author_url`: `@GxTradez`).
- Quotes from published YouTube auto-transcript / sozai 4H Profiling transcript; ASR noise noted above.
- This note resolves Open question #2 in `gxttrades-model-alignment.md`; it does not change SMT Fill state-machine behavior.
