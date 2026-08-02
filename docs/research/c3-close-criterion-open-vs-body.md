# C3 Close Criterion — Open vs Body (Primary Recheck)

**Research date:** 2026-08-02

**Question / goal:** Re-check first-party Garrett / GxT sources for the exact **C3 confirmation close** rule — close past C2’s **opening price**, past C2’s **body**, and/or past C2’s **high/low**. Diff against NewGxT’s current body-close rule. Recommend a single rule (or scoped dual rule) with citations (issue **#37**).

**Out of scope:** Editing `CONTEXT.md`, ADR-0001, or the playbook; indicator implementation changes. Product decision stays deferred until this recommend is approved.

**Builds on (do not duplicate wholesale):**

- [`gxttrades-model-alignment.md`](gxttrades-model-alignment.md) — Open question #6; 4H Profiling note “close above C2 body/high”
- [`universal-sequence-step-list-recheck.md`](universal-sequence-step-list-recheck.md) — Universal Sequence swing formations; did not resolve open vs body
- Local comparison set below (read-only this pass)

---

## Sources consulted

### Primary (first-party Garrett / GxT)

| Source | URL | Channel | Role this pass |
|---|---|---|---|
| **The GxT "Universal Sequence" - Structured Approach** | https://www.youtube.com/watch?v=oucPinjDdlk | Garrett (`@GxTradez`) | Named **C3 closure** mechanical process (“closes over candle two’s **opening price**”); adjacent “**body** closure above that C2 **high**” continuation language |
| **GxT \| 4H Profiling** (full transcript) | https://sozai.app/transcript/gxt-4h-profiling/ | Garrett (GxT) | Explicit C3 closure = close above candle two’s “**body or high**”; example close above C2 **high** |
| **A Complete Trading Framework… \| GXT** (TTrades guest) | https://www.youtube.com/watch?v=3eVxTV_7L2U | TTrades host; **Garrett speaking** | Strongest “**mechanically defined**” line: C3 closure = closing over the **body of candle 2** |

**Transcript method:** YouTube auto-captions via `yt-dlp --write-auto-sub` (already under `docs/research/_tmp_transcripts/`, gitignored); sozai full transcript fetched 2026-08-02 for 4H Profiling. ASR caveat: rolling cues; nearby C2 definition in Universal Sequence is garbled (“fails to close within candle one’s range” vs later clear “close back within candle one’s range”) — C3 “opening price” / “body” / “high” phrases below are clear in the VTT wording itself. **4H Profiling YouTube ID not recovered this pass** (channel list blocked); sozai remains the available full primary transcript.

### Other first-party corpus (searched; only if they speak C3 open/body/high/low)

| Source | URL | C3 open/body/high definition? |
|---|---|---|
| GxT \| Precision Swing Point \| Pt.1 | https://www.youtube.com/watch?v=iXRQg-OpO6Y | **No** — candle-three as expansion / gap / PSP context; no C3 close criterion |
| GxT \| Trade Recap \| My Best Trading Day Ever! | https://www.youtube.com/watch?v=l8koW20yh9M | **No** — uses C3 operationally; no open-vs-body definition |
| GxT \| Asset Synchronization Series: Part 1/3 | https://www.youtube.com/watch?v=G-M-ElP1MOE | **No** — C3 as FVG third candle / PSP base |
| A Deeper Dive Into SMT Divergence… | https://www.youtube.com/watch?v=eADu2pFnyAU | **No** — “opening price” only for wick / target sizing, not C3 confirm |
| Strength Switching \| Confirming Expansions With Strength Switch | https://www.youtube.com/watch?v=wVS09HYcp_I | **No** — “close above” for CSD / fill, not C3 vs C2 body/open |

### Local NewGxT claims (comparison set — **not edited**)

| File | Current C3 wording |
|---|---|
| `CONTEXT.md` Candle 3 | Alternative Reversal: body-closing **above/below the body of C2** |
| `docs/adr/0001-reversal-validation-rules.md` | Same: body-closing **above/below the body of C2** |
| `docs/daily_execution_playbook.md` Play A | C3 must **body-close past C2’s body** |

### Secondary

None used as definitional authority.

---

## What was found

### 1. Three primary wordings for the **same job** (C3 when there is no C2 closure)

All three sources describe waiting for a three-candle swing when C2 does **not** print a C2 closure (no close back inside C1), then trading the next candle after C3 confirms. The **close criterion** wording differs:

| Source | Exact criterion spoken | Approx. time |
|---|---|---|
| Universal Sequence | closes over candle two’s **opening price** | ~00:06:36–00:06:44 |
| 4H Profiling | close above candle two’s **body or high** | ~00:04:47–00:05:01 |
| TTrades guest (Garrett) | **mechanically defined as** closing over the **body of candle 2** | ~00:04:54–00:04:59 |

#### Universal Sequence — named C3 closure = **open**

After distinguishing C2-related continuation language (see §2), Garrett defines C3 closure explicitly:

> “So, what is a **C3 closure**? It’s where you don’t have a C2 closure, right? Maybe you hit a key level, but we don’t have a C2 closure, so you don’t know if price is going to reverse until you get a C3 closure. So, you’re going to wait for price to actually form that three candle swing formation, and the **mechanical process is for validating this candle three is when it closes over candle two’s opening price**, okay?”  
> — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk) ~00:06:23–00:06:44

Later same lecture (no new open/body/high formula): if C2 does not close back within C1, “what do you have to wait for? A **candle three closure**… Once you have a valid candle three closure, now we can trade candle four.” (~00:09:51–00:10:24)

#### 4H Profiling — C3 closure = **body or high**

> “Um, so once you have a candle three closure, a candle three closure is essentially when you **close above candle two’s uh, body or high**, right? Then you can trade candle four.”  
> — [GxT 4H Profiling (sozai)](https://sozai.app/transcript/gxt-4h-profiling/) ~00:04:47–00:05:01

Worked example uses the stricter extreme:

> “Well, now you have a valid candle three closure because it **closes above candle two’s high**. So, now you can trade candle four…”  
> — same source ~00:11:45–00:11:53

Roles match NewGxT pedagogy: “candle two is manipulation. Candle three is distribution.” (~00:01:28 area)

#### TTrades guest — C3 closure **mechanically defined** as **body**

Garrett (on TTrades) gives the clearest “this is the mechanical definition” sentence in the corpus:

> “So here we are with a candle three closure. This is simply when candle one hits a key level or candle 2 hits a key level, but we do not get a candle 2 closure… Once we have a strong **candle 3 closure, mechanically defined as closing over the body of candle 2**. This is where we can mark out equilibrium of candle 3’s range seeking expansion or continuation in candle 4…”  
> — [3eVxTV_7L2U](https://www.youtube.com/watch?v=3eVxTV_7L2U) ~00:04:20–00:05:04

---

### 2. Context split inside Universal Sequence (do not merge into one criterion)

Immediately **before** the named C3-closure definition, Universal Sequence describes a **different** beat — expansion **away from an already-printed C2 low**, then a strong close for continuation into candle 4:

> “…once price expands away from C2 low, if we get a **strong close above C2 candle’s high**, right? **Body closure above that C2 high**, then we can anticipate a continuation in candle four.”  
> — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk) ~00:06:05–00:06:18

Then: “So, what is a C3 closure? …” → **opening price** (~00:06:23).

**Reading:**

| Beat | When | Close bar spoken |
|---|---|---|
| Continuation strength after C2-side expansion | Already expanding away from C2 extreme | **Body** close above C2 **high** |
| Named **C3 closure** (no C2 closure) | Waiting for three-candle swing | Close over C2 **open** |

4H Profiling’s “**body or high**” sits between these: body as the base confirm, high as an OR / example of a clean valid C3. That is **not** the same as requiring high for every C3.

Large-wick / wait-for-next-candle language (Universal Sequence ~ candle logic; 4H Profiling expansion filter) is about **when** to wait for C3, not which C2 price C3 must clear.

---

### 3. Operational note: open ≈ far body extreme on a directional C2

For the usual failed-C2 shape (continuation candle that does **not** reclaim C1):

- Bearish C2 (red): C2 **open** ≈ top of body → bullish C3 “over open” ≈ over body top  
- Bullish C2 (green): C2 **open** ≈ bottom of body → bearish C3 “under open” ≈ under body bottom  

So Universal Sequence’s **open** and NewGxT / TTrades **body** are often **the same level** on a clean directional C2. They diverge mainly on dojis / inside bodies / which extreme of “body” is meant if open ≠ the far body edge. Closing past C2 **high/low** is always stricter than open or body.

---

### 4. Rest of corpus

PSP Pt.1, Trade Recap, Asset Sync Pt.1, SMT dive, Strength Switching: **no** competing first-party definition that picks open vs body vs high for C3 confirmation. They use “candle three” for FVG thirds, expansion legs, or trading after a swing — not as a close-criterion vote.

---

## Diff vs NewGxT

| Claim | NewGxT today | Primary sources |
|---|---|---|
| C3 when no C2 closure | Body-close past C2 **body** (`CONTEXT` / ADR-0001 / playbook) | **Supports keep:** TTrades “mechanically defined… **body**”; 4H Profiling “**body** or high” |
| C3 vs C2 **open** | Not used | Universal Sequence named C3 formula only; often ≈ body on directional C2 |
| C3 vs C2 **high/low** | Not required | 4H Profiling OR / example; Universal Sequence **continuation** “body closure above C2 **high**” (different beat) |
| Dual-context rules | Single body rule for Alternative Reversal | Pedagogy distinguishes **no-C2 C3** vs **post-C2 expansion strength**; NewGxT need not adopt a second entry rule unless product wants the stricter high bar for continuation packaging |

**Bottom line vs open question #6:** the conflict is real in *wording*, but NewGxT’s **body** rule is the best single match to Garrett’s only “mechanically defined” sentence and to 4H Profiling’s primary disjunct. Universal Sequence “opening price” is the outlier formula for the same no-C2 job — not a second lecture that rejects body.

---

## Recommend

**Keep body** — retain NewGxT’s Alternative Reversal C3 rule: body-close above/below the **body of C2**. Do **not** switch the canonical rule to open-only. Do **not** require C2 high/low for every C3.

**Optional doc nuance (only after approval — not done this pass):**

1. Cite TTrades + 4H Profiling as the body authority; note Universal Sequence “opening price” as equivalent-on-directional-C2 / residual ASR-or-shorthand conflict.  
2. Do **not** fold Universal Sequence’s “body closure above C2 high” into the no-C2 C3 definition — keep it as continuation-strength / example language if mentioned at all.  
3. A **scoped dual rule** is **not** recommended for product law: same swing job, three phrasings; dual open-vs-body gates would overfit transcript noise. If a second bar is ever wanted, prefer documenting **optional stricter** “close past C2 high/low” as confluence (4H Profiling OR), not as a separate play type.

**Verdict label:** **keep body** (with open treated as near-synonym on directional C2; high as optional stricter confluence, not required).

---

## Residual gaps / confidence

| Gap | Impact |
|---|---|
| Universal Sequence still says **opening price** for named C3 closure | Medium — only clear open-formula hit; may be intentional synonym or loose pedagogy; slides not OCR’d |
| 4H Profiling YouTube original ID not found this pass | Low — sozai transcript is the established primary for this lecture in the research corpus |
| “Body” not micro-specified (far extreme of O/C vs close of C2) | Low — NewGxT “above/below the body” already means past the body range; matches TTrades wording |
| No first-party slide OCR / screenshot of a single formula | Low — spoken “mechanically defined” on TTrades is the strongest verbal pin |

**Confidence:** **High** that NewGxT should **keep body** as the single Alternative Reversal C3 rule. **Medium** that Universal Sequence “open” is intentionally identical to body rather than a distinct softer gate.
