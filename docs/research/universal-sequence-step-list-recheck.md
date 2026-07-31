# Universal Sequence Step List — Primary Recheck vs ADR-0012

**Research date:** 2026-07-31

**Question / goal:** Re-check Garrett’s first-party Universal Sequence lecture for a slide title list or explicit numbered checklist; diff against ADR-0012 steps 1–7; recommend no change / wording tweaks / reorder / add missing step (issue **#35**).

**Out of scope:** Redesigning Catch-Up / Continuation plays unless the primary checklist forces it; inventing steps not present in first-party sources.

**Builds on (do not duplicate):**

- [`gxttrades-model-alignment.md`](gxttrades-model-alignment.md) (2026-07-14) — Open question #3; original 7-step synthesis
- [`docs/adr/0012-universal-sequence.md`](../adr/0012-universal-sequence.md) — current canonical 7-step mapping to NewGxT vocabulary

---

## Sources consulted

### Primary (first-party Garrett / GxT)

| Source | URL | Role this pass |
|---|---|---|
| **The GxT "Universal Sequence" - Structured Approach** | https://www.youtube.com/watch?v=oucPinjDdlk | Dedicated lecture; full English auto-transcript; spoken step language + packaging |
| GxT \| Trade Recap \| My Best Trading Day Ever! | https://www.youtube.com/watch?v=l8koW20yh9M | Corroboration only for “SMT in the gap” packaging (prior alignment; not re-transcripted this pass) |

| Field | Value |
|---|---|
| **Channel** | Garrett (`@GxTradez`) — `https://www.youtube.com/channel/UCXW7KHt9Esfq1X6ePTHSDjw` |
| **Published** | 2025-11-21 (yt-dlp `upload_date`) |
| **Length** | ~1:27:39 |
| **Title / description checklist?** | **No** — description is disclaimer / linktree / prop code only |

**Transcript method:** YouTube auto-captions via `yt-dlp --write-auto-sub` (2026-07-31), flattened locally under `docs/research/_tmp_transcripts/`. ASR caveat: overlapping rolling cues; “crack in” sometimes “Kraken”; does **not** invent numbered slide titles. **Slide text was not OCR’d** — only spoken narration and title/description metadata.

### Local NewGxT claims (comparison set)

| File | Role |
|---|---|
| `docs/adr/0012-universal-sequence.md` | Accepted 7-step Universal Sequence mapped to NewGxT terms |
| `docs/research/gxttrades-model-alignment.md` § Universal Sequence | Prior synthesis that ADR-0012 adopted |

### Secondary / not definitional authority

| Source | Why secondary |
|---|---|
| Third-party “GxT model” AI prompts / summary pages | Paraphrase; no first-party audio |
| ICT / QT gap-continuation write-ups | Different lineage |

---

## What was found

### 1. No authoritative slide-title / numbered 1–7 checklist

**Negative finding (success for #35):** Garrett says the lecture has “a lot of slides” and that viewers should “follow each step,” but the auto-transcript contains:

- **No** spoken reading of a seven-item slide checklist
- **No** “step two / step three / … / step seven” enumeration
- **No** title or description numbered list

The only explicit “step …” numbering in the lecture is:

> “Okay? So, **step one is a universal model**, right? Once price trades into that key level, then we confirm it with a swing formation. **The next step is to then set an invalidation** to that trade idea, right? So, what that would be **equilibrium of a the previous candle**, basically.”  
> — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk) ~00:07:47

Later example narration again asks “what’s the **first step** when we engage with a key level, which is a universal model?” and answers: confirm with the swing point (~00:35:59). That is pedagogical repetition, not a new numbered list.

**Implication:** ADR-0012’s steps 1–7 remain a **research synthesis of spoken order**, not a verbatim slide dump. The 2026-07-14 alignment caveat still holds after this recheck.

### 2. Spoken process order (primary paraphrase)

Reconstructed from continuous narration (intro mechanics → key-level refinement → gap selection → SMT-at-gap), not invented:

1. **Universal model / framework** — key level → opposing draw on liquidity (IRL↔ERL / manipulation-range opposite). (“Step one is a universal model.”)
2. **Confirm with a swing formation** — one of three (C2 closure, C3 closure, C2 reversal-to-expansion / small wick). Market “cannot reverse without swing point.”
3. **Set invalidation** — mark **equilibrium (EQ)** of the previous candle’s relevant range (wick for large-wick reversal candle; full range for expansion candle); demand **shallow retrace / small wick** (expansion signature). Hitting EQ / printing a large wick invalidates the clean expansion idea.
4. **Key level refinement / gap selection** — within that protected half / close to HTF open, pick an **aligned lower-TF gap** (weekly→daily, daily→4H, 4H→1H/30m, fractal). Explicitly: gaps for continuation should sit in the previous candle’s range; prefer close-proximity gaps in expansion.
5. **Expansion evidence** — after the swing, price expands away; gaps printed away from the level are the reversal / continuation signature (“what is a reversal signature? It’s when price expands away from the reversal”).
6. **On engagement with the selected gap, require an SMT sequence** — preferably **SMT fill** (one asset into gap, correlated not); if both hit the gap, **PSP** (difference in closes / swing-point SMT); strength-switch SMT fill / SS PSP for catch-up / asset sync. Highest-probability packaging: **two-stage SMT at the reversal → gap → SMT in the gap**. Continuation SMT fill is **one-stage** once reversal SMT/expansion already printed.
7. **Execute continuation** toward open DOL — candle / swing-point logic: **small wick → trade now; large wick → wait C2 closure and trade C3**; prefer the **weaker** asset when SMT fill is present.

Highest-probability packaging (same lecture):

> “…when you have **two stage SMT at the reversal**, and then price creates a gap, … and then we create **SMT in the gap**, it’s extremely high probable. … if you have open draws on liquidity, and then you have this gap being hit with an SMT sequence, it is the highest probable sequence you can have.”  
> — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk) ~00:25:49–00:26:26

> “…this is the first sequence. It’s simply an **SMT fill**. And no, you do **not** need two stage SMT in continuation like this. You don’t need it. … we already had two stage SMT, or we already had an SMT, … and we already expanded…”  
> — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk) ~00:26:39–00:26:56

### 3. Diff vs ADR-0012 steps 1–7

| ADR-0012 step | Garrett spoken counterpart | Diff |
|---|---|---|
| 1. Establish the framework — Relevant Level / POI; opposing DOL | “Step one is a **universal model**” (key level → DOL) | **Match** — NewGxT vocab mapping; Garrett’s own label is *universal model* |
| 2. Confirm a swing formation — C2 / C3 / C2 R→E; 2-stage SMT/PSP as typical full-reversal gate | Confirm with one of three swing formations; prefers 2-stage SMT at reversal for high-probability packaging | **Match** — ADR correctly keeps 2-stage ownership on ADR-0005 |
| 3. Set invalidation / demand expansion | Explicit **next step = set invalidation** via **EQ of previous candle**; demand small wick / shallow retrace | **Match** — ADR slightly compresses “mark EQ” into “set invalidation / demand expansion” |
| 4. Refine to an aligned gap (tradeable half; ITF FVG) | “**Key level refinement**” / gap selection within prior candle range / close to HTF open; fractal TF ladder | **Match** |
| 5. Require expansion evidence (gaps away from level) | Gaps / expand-away = reversal signature before treating gap engagement as high quality | **Match** |
| 6. On retrace into gap, SMT sequence (prefer SMT Fill; else PSP; SS variants) | Engage gap with SMT sequence; SMT fill first; both-hit → PSP; one-stage at continuation | **Match** — including one-stage note already in ADR-0012 |
| 7. Execute continuation — LTF CISD / CSD; prefer weaker on SMT Fill | Candle logic (small wick now / else wait C2→C3); prefer weaker on fill | **Match with mapping** — CISD/CSD is NewGxT mechanization of his candle/swing entry language, not a Garrett acronym in this lecture |

**Order:** Spoken pedagogy follows ADR order (framework → swing → invalidation/EQ → refine gap → expansion → SMT at gap → execute). No evidence for reorder.

**Missing step?** No first-party step that ADR-0012 omits as a required Universal Sequence leg. Asset synchronization / catch-up is taught as a **variant packaging** of the same gap + SMT-fill / strength-switch legs (already covered in ADR-0012 relationship bullets), not an 8th mandatory step.

**Extra ADR specificity that is NewGxT, not slide text:** triad “all three invalidates,” CISD naming, Catch-Up vs Continuation play split — appropriate product mapping, not claimed as Garrett slide titles.

---

## Explicit answer

**Is there a first-party numbered Universal Sequence checklist (slide titles or spoken 1–7) that ADR-0012 should copy verbatim?**

**No.** Recheck of the dedicated lecture’s title, description, and full auto-transcript finds only “step one = universal model” + “next step = invalidation (EQ),” then continuous narration covering refinement, expansion, SMT-at-gap, and execution. The seven-step ADR list remains a faithful **synthesis**, not a captured slide dump.

**Does the synthesis drift from his teaching in wording or order?**

**No material drift.** Order and content align. Optional clarity tweaks only (below).

---

## Doc recommendation

| Verdict | **Optional wording tweaks only — no reorder, no added step, no Catch-Up / Continuation redesign** |
|---|---|
| ADR-0012 | **Keep** the 7-step structure and NewGxT mappings. Optionally: (a) footnote that steps remain a research synthesis (no first-party 1–7 slide list found 2026-07-31); (b) in step 1, mention Garrett’s label **universal model**; (c) in step 3, make **mark EQ of the previous candle** explicit as the invalidation construction. |
| CONTEXT / playbook | **No required follow-up** for this issue. Only chase ADR wording if maintainers want the EQ / “universal model” phrasing mirrored in glossary/playbook. |
| Not needed | New 8th step; reordering; inventing slide titles; changing SMT Fill / CISD mechanics. |

---

## Method notes

- Prefer quoted / lightly cleaned auto-transcript over secondary summaries.
- “Slide titles” would require OCR or on-screen capture; absence in spoken captions + metadata is treated as **no authoritative checklist captured**, not proof slides lack bullets.
- This note resolves Open question #3 in `gxttrades-model-alignment.md`.
