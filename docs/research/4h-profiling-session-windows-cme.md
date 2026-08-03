# 4H Profiling Session Windows — CME Mapping (Primary Recheck)

**Research date:** 2026-08-02

**Question / goal:** Re-extract Garrett’s 4H Profiling **session / kill-zone if-then timing windows** from first-party sources, diff against NewGxT’s current docs (playbook Step 5b / CONTEXT 4H Profiling / alignment open Q #7), and recommend playbook or CONTEXT follow-up — or none (issue **#38**).

**Out of scope:** Editing `CONTEXT.md`, ADRs, or the playbook; changing CME session open (18:00 ET) or PDH/PDL calendar; indicator kill-zone alerts. Product edits stay deferred until this recommend is approved.

**Builds on (do not duplicate wholesale):**

- [`gxttrades-model-alignment.md`](gxttrades-model-alignment.md) — Open question #7; § 4H Profiling session / kill-zone notes (~lines 110–113, 334)
- Playbook Change 4 (already shipped): Step 5b futures **02:00 / 06:00 / 10:00 ET**, roll-to-next, ideal **06:00 manip → 10:00 continuation**, not FX 1/5/9
- Local comparison set below (read-only this pass)

---

## Sources consulted

### Primary (first-party Garrett / GxT)

| Source | URL | Channel | Role this pass |
|---|---|---|---|
| **GxT \| 4H Profiling** (full transcript) | https://sozai.app/transcript/gxt-4h-profiling/ | Garrett (GxT) | **Required primary** — FX vs futures clocks, if-then maps, focus hours inside 4H candles, 8:30/9:30 drivers inside 06:00, window priority, Asia/London/NY roll |
| **The GxT "Universal Sequence" - Structured Approach** | https://www.youtube.com/watch?v=oucPinjDdlk | Garrett (`@GxTradez`) | Corroboration: London C2 → expect **6:00 a.m.** New York continuation (C3) |
| **Strength Switching \| Confirming Expansions With Strength Switch** | https://www.youtube.com/watch?v=wVS09HYcp_I | Garrett | Corroboration on indices: **2:00 a.m. 4H** often large wick (don’t trade); wait **6:00 a.m.**; **9:30** as indices driver / decoupling |
| **A Complete Trading Framework… \| GXT** (TTrades guest) | https://www.youtube.com/watch?v=3eVxTV_7L2U | TTrades host; **Garrett speaking** | Corroboration: **9:00 a.m.** window owns equities open; driver pairing → seek **10 a.m.** continuation |

**Transcript method:** sozai full transcript fetched 2026-08-02 for 4H Profiling. Other corpus: YouTube auto-captions via `yt-dlp --write-auto-sub` already under `docs/research/_tmp_transcripts/` (gitignored). ASR caveat: sozai’s early “profiling the 4-hour chart” clock intro (~09:59–12:56) is **interleaved** with unrelated segments (timestamps jump mid-sentence); later continuous blocks (~15:38–21:11 and worked examples ~28:00–40:00) are clearer. **4H Profiling YouTube ID not recovered** (same as prior research); sozai remains the available full primary transcript.

### Other first-party corpus (searched; only cite if they speak timing windows)

| Source | URL | Session / kill-zone / 2–6–10 / drivers? |
|---|---|---|
| GxT \| Precision Swing Point \| Pt.1 | https://www.youtube.com/watch?v=iXRQg-OpO6Y | **No** definitional 4H window map |
| GxT \| Trade Recap \| My Best Trading Day Ever! | https://www.youtube.com/watch?v=l8koW20yh9M | Operational times only; no 4H if-then map |
| GxT \| Asset Synchronization Series: Part 1/3 | https://www.youtube.com/watch?v=G-M-ElP1MOE | **9:30 / 8:30** drivers, Asia/London/NY narrative; not the 2/6/10 if-then definition |
| A Deeper Dive Into SMT Divergence… | https://www.youtube.com/watch?v=eADu2pFnyAU | **No** 4H session if-then map |
| ALWAYS demand an expansion… (erik recap) | https://www.youtube.com/watch?v=1SkMpmGwbBI | Mentions trading near **2:00 a.m. close**; not definitional |
| erik / related flats (`ZTIRoNI8HGs`) | local cache | Heavy **9:30** indices language; not the 4H Profiling clock lecture |

### Local NewGxT claims (comparison set — **not edited**)

| File | Current timing wording |
|---|---|
| `docs/daily_execution_playbook.md` Step 5b | Prefer **02:00 / 06:00 / 10:00 ET**; roll to next window if earlier manip doesn’t reverse cleanly; ideal **06:00 manip → 10:00 continuation**; CME clock — **not FX 1/5/9** |
| `CONTEXT.md` **4H Profiling** | Conceptual timing filter (SMT LOD/HOD wick → Expansion Candles); **no session hours** |
| `docs/research/gxttrades-model-alignment.md` | Notes 2/6/10 + FX 1/5/9; ideal NY **6:00** paired with **8:30 / 9:30**; open Q #7 CME remap |

### Secondary

None used as definitional authority (no ICT kill-zone blogs).

---

## What was found

### 1. Two clocks in the same lecture (Garrett, not NewGxT)

Garrett explicitly splits asset-class clocks when introducing 4H profiling:

**FX (Forex traders):** focus **1:00 / 5:00 / 9:00 a.m.**

> “So, now we're going to get into profiling the 4-hour chart. So, with Forex traders, you're essentially going to be focused on the **1:00 a.m.**, the **5:00**…”  
> — [GxT 4H Profiling (sozai)](https://sozai.app/transcript/gxt-4h-profiling/) ~00:09:59–00:10:12 *(ASR: trailing “5:00” cut by interleaved segment)*

> “…**5:00 a.m.** represents the New York session. So, New York continuation / reversal. We're focused on the hours of **7:00 a.m.**… …the **9:00 a.m.** New York continuation / reversal. You're going to be focused on **9:00 a.m.**…”  
> — same ~00:10:22–00:10:45 *(interleaved; reconstruct as FX NY focus hours)*

**FX if-then:**

> “If **1:00 a.m.** manipulates, then **5:00 a.m.** should continue. If **5:00 a.m.** manipulates, then **9:00 a.m.** should continue. If **9:00 a.m.** manipulates, then **p.m.** should continue, right?”  
> — same ~00:11:00–00:11:12

**Futures / indices-style a.m. stack (2 / 6 / 10):** London-ish **2:00–5:00**, NY **6:00**, then **10:00** candle:

> “…candle, right? **2:00 to 5:00 a.m.** Um New York **6:00 a.m.** New York session. So, basically the a.m. session … the **6:00 a.m.** New York continuation / reversal will be uh **8:00 a.m. to 10:00**…”  
> — same ~00:11:53–00:12:10 *(leading clause cut by interleave; later continuous examples treat these as futures 4H candles)*

> “Um and the **10:00 a.m.** candle um continuation verse reversal, we're going to be focusing on the hours of **10:00 a.m. to 12:00 p.m.**, right? I don't really care about um **12:00 p.m. 13 hundred**. I don't care about that, right?”  
> — same ~00:12:15–00:12:30

**Futures if-then:**

> “So, the if-then statements, right? If **2:00 a.m.** manipulates, then **6:00 a.m.** should continue. If **6:00 a.m.** manipulates, then uh **10:00 a.m.** should continue.”  
> — same ~00:12:42–00:12:56

**NewGxT interpretation (not Garrett’s words):** On a CME 18:00 ET–aligned 4H grid, typical opens are **18:00 / 22:00 / 02:00 / 06:00 / 10:00 / 14:00 ET**. Garrett’s spoken **2 / 6 / 10 a.m.** match three of those opens (London overnight → NY morning → late-morning). He does **not** present 18:00 / 22:00 / 14:00 as the primary daily watch stack in this lecture; **p.m. / 1400** appears as occasional fade / late continuation, not as a peer of 2/6/10.

---

### 2. Which 4H candle owns which window (completeness)

| Window (spoken a.m.) | Owns / is | Focus sub-hours (spoken) | Role in if-then |
|---|---|---|---|
| **2:00 a.m.** | The **2:00 a.m. 4H candle** (London / overnight stack) | Described with London range **2:00–5:00 a.m.** | If manipulates → expect **6:00** continue |
| **6:00 a.m.** | The **6:00 a.m. 4H candle** (“ideal New York reversal”) | Cont/rev focus **~8:00–10:00** inside that candle | If manipulates → expect **10:00** continue |
| **10:00 a.m.** | The **10:00 a.m. 4H candle** | Focus **10:00–12:00**; dismiss **12:00 / 13:00** | Continuation after 2 or 6 LOD; reversal “not my favorite” |
| FX **1 / 5 / 9** | Parallel FX 4H stack | 5 a.m. NY focus mentions **7:00 a.m.**; 9 a.m. focus on **9:00** | Same roll pattern → p.m. |

**Session-name roll (Asia → London → NY), not only the numeric if-then:**

> “Previous sessions hit a key level, right? Where Asia you know, London hits this key level, but doesn't reverse. So, we got to **roll that over to the next session**. If London is not going to reverse, then we got to have um ideally, you know, uh New York to reverse.”  
> — same ~00:17:59–00:18:11

**10:00 continuation ownership (either prior LOD):**

> “So, now this is **10:00 a.m.** continuation. So, **10:00 a.m.** continuation is when either **2:00 a.m.** sets a low of day or **6:00 a.m.** sets a low of day, doesn't matter.”  
> — same ~00:16:16–00:16:29

**DOL already taken → skip 10:00 continuation:**

> “But, let's say we expand prior … to **10:00 a.m.**, you don't really want to look for a **10:00 a.m.** continuation, especially if the draw on liquidity is already taken.”  
> — same ~00:16:40–00:16:52

---

### 3. Ideal priority: 06:00 manip → 10:00 continuation (+ drivers)

> “So, the **6:00 a.m. 4-hour reversal**. This is the **ideal New York reversal**, right? So, within the **6:00 a.m.** candle, you want to be trading the and pairing your framework with **drivers**. So, the **8:30 driver** and the **9:30 driver**. This is why it is **preferred** to have a **6:00 a.m.** reversal to form the high and low of the day in a New York reversal because you're essentially pairing that with the driver because **the drivers reside within that 6:00 a.m. 4-hour time window**.”  
> — same ~00:17:00–00:17:31

> “So, it is very ideal that is it a **6:00 a.m.** reversal. So, the your **best trades** are probably going to be **6:00 a.m. manipulation, 10:00 a.m. continuation**. If you just waited for that, if you just traded the **10:00 a.m.** candle, uh you will do great. You'll do fine, okay?”  
> — same ~00:17:31–00:17:39

Worked example (indices language — NQ SMT + 9:30 driver):

> “But **9:30**, as you see. So, if this is going to be a high of day … what do we want the **driver** to do? We want it to reverse. So, here's the **9:30** the driver. As you see, it creates SMT with **NQ** here and puts in a reversal. So, if **9:30** reversed, what should **10:00 a.m.** do? … **10:00 a.m.** should just continue lower.”  
> — same ~00:31:06–00:31:30

Another pairing: **6:00** forms HOD, **9:30** reverses inside it, **10:00** opens in range:

> “So, this is an example of **6:00 a.m.** forming the high of day … we're pairing a manipulation with the driver. So, **9:30** reverses price. That's pretty significant. So, **10:00 a.m.** opens up within that reversal, within the previous candle's range.”  
> — same ~00:35:23–00:35:41

---

### 4. How hard is **02:00** vs **06:00 / 10:00**?

Garrett does **not** say “never trade 2:00” or “2:00 is invalid for ES/NQ/YM.” He does repeatedly treat overnight **2:00** as a common **LOD/HOD setter** that often **fails the Expansion Candle wick filter**, so you wait for the next 4H:

> “Because it does not support expansion. So, you're going to wait for the **6:00 a.m.** to continue away from that **2:00 a.m.** low.”  
> — same ~00:16:09–00:16:16

> “…this **2:00 a.m.** candle here forms the low of the day, right? You're **not going to trade this candle**. Why? Because it does not support expansion. Pretty large wick. So, you're just going to simply wait to align yourself with expansion.”  
> — same ~00:20:52–00:21:06

> “What forms the low of day? It is **2:00 a.m.** You have an SMT here… I guess it's on **ES**, right?”  
> — same ~00:38:04–00:38:29 *(2:00 can print SMT LOD on indices)*

**10:00 reversal** is explicitly demoted vs continuation:

> “So, here is the **10:00 a.m. reversal**, which is **not my favorite**.”  
> — same ~00:18:53–00:19:04

**Summary (Garrett’s emphasis, not a NewGxT severity score):**  
- **Best:** 6:00 manip (+ drivers) → 10:00 continuation.  
- **2:00:** valid for forming the day’s extreme / SMT; frequently **not** the expansion entry candle.  
- **10:00 reversal:** allowed with nuances (large overnight expansion already capped); less preferred than 10:00 continuation.

Supporting corpus (indices, not the definitional map): Strength Switching shows a **2:00 a.m. four-hour** with a large wick — “you can never trade an asset with a large wick” — then waiting for **6:00 a.m.** ([wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I)). Universal Sequence: London C2 → expect **6:00 a.m.** New York continuation ([oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk)).

---

### 5. FX clock transferability

Garrett presents **1/5/9** as the **Forex** focus stack and **2/6/10** as the parallel a.m. stack used throughout the indices/futures examples (ES/NQ, 8:30/9:30 drivers). For NewGxT’s indices-first triad (ADR-0004), FX 1/5/9 is **not** needed as operational law. Playbook’s “(CME session clock — not FX 1/5/9)” matches Garrett’s split. Defer FX remap until an FX triad is in scope.

---

## Diff vs current NewGxT docs

| Claim | Playbook Step 5b | CONTEXT 4H Profiling | Alignment notes | Primary (this pass) |
|---|---|---|---|---|
| Futures watch **02 / 06 / 10 ET** | ✅ Locked | ❌ Hours absent (conceptual OK) | ✅ | ✅ Spoken 2/6/10 a.m. 4H candles |
| If earlier manip → roll to next | ✅ | ❌ | ✅ | ✅ Numeric if-then + Asia/London→NY roll |
| Ideal **06 manip → 10 cont** | ✅ | ❌ | ✅ | ✅ “best trades” / “ideal NY reversal” |
| Explicit **not FX 1/5/9** | ✅ | N/A | Notes both clocks | ✅ FX vs futures split confirmed |
| **8:30 / 9:30** drivers inside **06:00** | ❌ Omitted | ❌ | ✅ Noted | ✅ Strong primary: drivers **reside within** 6:00 4H |
| Focus sub-hours (8–10 inside 6; 10–12 inside 10) | ❌ | ❌ | Partial | ✅ Spoken |
| **02:00** often LOD but frequently not expansion entry | Soft only via “prefer” 02/06/10 | Expansion Candle concept only | Soft | ✅ Multiple examples |
| **10:00 reversal** less preferred | ❌ | ❌ | ❌ | ✅ “not my favorite” |
| CME 18:00 grid ownership of 2/6/10 | Implied (“CME session clock”) | N/A | Open Q #7 | **Interpretation:** matches 18:00-aligned 4H opens; Garrett says “a.m.” / “4-hour,” not “CME 18:00” |

**Change 4 already closed the core CME remap.** Remaining gap vs primary is mainly **driver pairing** and optional **priority / wick nuance** — not a wrong clock.

---

## Answers to known remaining fuzz (issue #38)

1. **Completeness of if-then / which candle owns which window**  
   Map is complete enough for indices: **2 → 6 → 10** numeric roll; Asia/London → NY session roll; each spoken hour **is** the opening of that **4H candle**. Sub-focus: ~**8:00–10:00** inside 6:00; ~**10:00–12:00** inside 10:00. **10:00 continuation** can lean on **either** 2:00 or 6:00 LOD if DOL still open.

2. **Document 8:30 / 9:30 alongside 06 → 10?**  
   **Yes, lightly** — Garrett’s reason 6:00 is the ideal NY reversal is that **8:30 and 9:30 drivers live inside that 4H window**. Alignment notes already had this; Step 5b does not. Not a separate kill zone — driver **pairing** inside 06:00.

3. **How hard is 02:00 vs 06 / 10 for ES/NQ/YM?**  
   Do **not** delete 02:00 from the watch list (can form SMT LOD on ES). Do treat it as **lower priority for expansion entry** when the candle prints a large opposing wick — wait 06:00 / 10:00. Soften, don’t erase.

4. **FX clock?**  
   **Out of scope** for indices-first. Keep the existing “not FX 1/5/9” guardrail; no CONTEXT FX hours.

---

## Recommend

**Verdict label:** **playbook wording tighten + short driver note** — **no CONTEXT hours**, **do not de-emphasize 02:00 out of the watch list**, **no indicator kill-zone work**.

### Playbook Step 5b — proposed wording (recommend only; not applied)

Replace the current single paragraph:

> Prefer watching 4H manipulation and expansion around **02:00 / 06:00 / 10:00 ET**. If an earlier window manipulates at the POI and does not reverse cleanly, roll expectation to the next window. Common ideal: **06:00 manip → 10:00 continuation**. (CME session clock — not FX 1/5/9.)

with something like:

> Prefer watching 4H manipulation and expansion on the CME-aligned candles that open **02:00 / 06:00 / 10:00 ET** (not FX **1:00 / 5:00 / 9:00**). If an earlier window manipulates at the POI and does not reverse cleanly, roll expectation to the next window (same idea as Asia/London → New York).  
> **Priority:** ideal New York shape is **06:00 manip → 10:00 continuation**. Pair the **06:00** 4H with **8:30 / 9:30** drivers when present — those drivers sit inside the 06:00 candle. Focus the active part of **06:00** roughly **08:00–10:00**, and of **10:00** roughly **10:00–12:00**.  
> **02:00** can still form the day’s SMT extreme; if that candle fails the Expansion Candle wick filter, do not force entry — wait for **06:00** / **10:00** continuation. Prefer **10:00 continuation** over **10:00 reversal** unless overnight/a.m. range is already largely consumed and DOL supports a fade.

### CONTEXT.md **4H Profiling**

**No change.** Keep conceptual (SMT wick → Expansion Candles). Session hours belong in the playbook, not the glossary — unless a later pass wants a one-line “see playbook Step 5b” pointer (optional, not required for #38).

### Alignment open Q #7

Treat as **resolved for indices-first ops**: Change 4 + this note. Residual is pedagogical nuance (drivers / 02:00 wick), not an unresolved CME vs FX clock bug.

---

## Residual risks / ASR caveats

| Gap | Impact |
|---|---|
| sozai interleave ~09:59–12:56 (FX/futures clock intro mixed with other segments) | Medium for exact lead-in wording (“with futures traders…” may be missing); **if-then sentences and later continuous examples are clear** |
| 4H Profiling YouTube ID still unrecovered | Low — sozai is established full primary in this corpus |
| Garrett never says “CME 18:00” for the 2/6/10 grid | Low — mapping is NewGxT interpretation; spoken “2/6/10 a.m. 4-hour” aligns with that grid |
| No first-party slide OCR of the clock diagram | Low — spoken if-then + “drivers reside within 6:00” are enough for playbook |
| Driver video referenced (“watch my driver video”) not re-transcripted this pass | Low for Step 5b — 4H Profiling already names 8:30/9:30 |

**Confidence:** **High** that Step 5b’s **02/06/10 + roll + 06→10 + not FX 1/5/9** is primary-correct. **High** that adding a **short 8:30/9:30-inside-06:00** note would close the main remaining doc gap. **Medium** on exact FX focus-hour fragments (7:00 / 9:00) due to interleave — irrelevant if FX stays out of scope.
