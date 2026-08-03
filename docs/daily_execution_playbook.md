# GxT Daily Execution Playbook

A step-by-step guide for approaching each trading day — from pre-session bias formation through live execution and trade management.

---

## Phase 1 · Pre-Session Homework (Before 18:00 ET CME Open)

### Step 1 — Classify Yesterday's Day Type

Pull up the **Daily chart** and classify the previous session:

| Day Type | What It Looks Like | Bias It Produces |
|---|---|---|
| **Expansion / Reversal** | Large-range candle, strong directional close, one side's liquidity clearly swept | **Directional** — trade in the direction of the expansion/reversal |
| **Consolidation** | Tight range, wicks on both sides, body closes near middle of range | **Neutral** — wait for PDH/PDL sweep + Strength Switch before taking a side |

> [!IMPORTANT]
> This classification is the foundation of everything else. Get this wrong and every downstream decision is compromised.

### Step 2 — Mark Relevant Levels

On the **Daily → 4H → 1H → 30m** charts, mark:

- [ ] **PDH / PDL** (Previous Day High / Low)
- [ ] **PWH / PWL** (Previous Week High / Low)
- [ ] **18:00 Daily Open** price (this becomes your TP1 default)
- [ ] Any **unmitigated HTF FVGs** (4H, 1H) sitting within the previous day's range
- [ ] **ADR** (Average Daily Range) — note how much range was consumed yesterday vs. average

### Step 3 — Identify the POI (Point of Interest)

**If Directional Bias (Expansion/Reversal Day):**

```
Check for a 4H FVG within the 50% equilibrium range of the Previous Day
  └─ Found? → This is your POI (where you expect the daily wick to form)
  └─ Not found? → Check for a 1H FVG in the same zone
      └─ Found? → This is your POI
      └─ Not found? → Maintain directional bias, but wait for price
                       to create and manipulate a new Relevant Level
```

**If Neutral Bias (Consolidation Day):**
- No pre-set POI. You are waiting for price to sweep PDH or PDL first.
- The sweep + 2-Stage SMT or 2-Stage PSP will create your POI in real time.

### Step 4 — Set Targets

| Target | Level | When to Use |
|---|---|---|
| **Primary TP** | Next **eligible level** (HTF swing, PDH/PDL, or PWH/PWL) | Default — the nearest high-probability structural magnet in the direction of your bias; HTF FVGs are not TP candidates |
| **Daily Open TP** | 18:00 Daily Open | Only on **reversal days with a large wick** — when ADR is nearly consumed and the reversal fires late, price is expected to pull back to cap the daily wick |

> [!NOTE]
> The target is NOT always the 18:00 Daily Open. Your default target is the next Relevant Level. The Daily Open is a special-case target reserved for large-wick reversal days where the daily range is already stretched.

---

## Phase 2 · Session Open & Monitoring (18:00 ET onward)

### Step 5 — Watch for Price to Reach the POI

Monitor the **ITF charts (4H / 90m / 1H / 30m)** for price to trade into your pre-marked POI or Relevant Level.

**What you're watching for:**
- Price trading into or through the FVG / Relevant Level
- Which triad asset (ES, NQ, YM) reaches the level first vs. which lags

> [!TIP]
> Don't force a trade before price reaches a POI. Patience here is the edge. Your only job during this phase is observation.

### Step 5b — 4H Profiling (timing filter)

**4H Profiling** times *when* to lean on expansion — it does not replace 2-Stage SMT or 2-Stage PSP or Universal Sequence.

**Ideal shape:**
1. SMT forms the high or low of day (protected wick / sweep at the POI)
2. Expansion builds the body away from that extreme
3. Prefer subsequent **4H Expansion Candles** in bias direction (closes with the move; no large opposing wick)
4. Large opposing wick on a candidate candle → **not** expansion — wait for the next candle / C3 before entering

**Session if-then windows (futures / ET):** Prefer watching 4H manipulation and expansion around **02:00 / 06:00 / 10:00 ET**. If an earlier window manipulates at the POI and does not reverse cleanly, roll expectation to the next window. Common ideal: **06:00 manip → 10:00 continuation**. (CME session clock — not FX 1/5/9.)

### Step 6 — POI Engagement & Stage 1 SMT

**Hit** means a triad asset trades into the Session POI by **crossing that price level** (FVG boundary or rail).

Stage 1 of any reversal is always **classic SMT Divergence** (asymmetric extremes). Plain PSP is **never** Stage 1.

#### FVG Session POI

| Engagement | What is possible |
|---|---|
| **1–2 assets in** the gap; lead not reversing | **Catch-Up** for laggards into that FVG **and** Stage 1→2-Stage hunt are both live — take whichever arms first; size by play |
| **All 3 in** the gap | **SMT Fill is dead** (ADR-0006). Keep hunting Stage 1 classic SMT (asymmetric extremes at/in the gap) → Stage 2. Do not abandon the FVG solely because everyone entered |

#### Rail Session POI (PDH/PDL, PWH/PWL, HTF swing)

| Engagement | What is possible |
|---|---|
| **1–2 assets crossed**; lead **holds at or past** the rail | Reversal at that rail is **lower probability**. Primary play = **Catch-Up** for laggards into the same POI. If the lead **reverses away** without Stage 2, Catch-Up is off |
| **All 3 crossed**, no Stage 1 | **Stand down** on reversal at that rail. No Catch-Up left (no laggard). Continuation only after a real bias / Session POI handoff (Step 8 / Play C) — not merely because price left the rail |

```
Asset A sweeps / makes a new extreme at the POI
Asset B fails to sweep / stalls / makes a higher low (bullish) or lower high (bearish)
─────────────────────────────────────────────────────
✅ SMT Divergence present → Move to Stage 2
❌ No asymmetric extremes → No Stage 1 (rail: stand down once all three have crossed; FVG: stay patient inside the gap)
```

**Synergy Rule:** Only 2 of 3 triad assets need to show divergence. If the 3rd asset is actively expanding in the opposite direction, the setup is **not invalid but lower probability** — size accordingly and tighten your conviction requirements.

### Step 7 — After Stage 1 SMT, Watch for Stage 2 Confirmation

Once Stage 1 SMT divergence is identified at the POI, you are now watching for **Stage 2** — either sequence completes Stage 2 (ADR-0005):

1. **2-Stage SMT — Second SMT**: A second SMT on **`30m` / `1H` / `90m` only** (not `4H`) where the stronger and weaker assets **switch strength** — the previously lagging asset now leads, creating a second divergence that confirms the reversal.
2. **2-Stage PSP — Strength Switch PSP**: A **Strength Switch PSP** on full-ITF candle closes (`4H` / `90m` / `1H` / `30m`) where the asset that swept closes in the reversal direction while its correlated pair closes in the trend direction — confirming the strength rotation. A `4H` SS PSP can complete Stage 2.

> [!IMPORTANT]
> The key signal in both sequences is the **strength switch** — the stronger asset must switch roles with the weaker asset. This is what confirms institutional rotation, not just a one-off divergence. LTF (`15m` / `5m` / `3m` / `1m`) is for entry after Stage 2, not for Stage 2 itself.
>
> Require a Relevant Level / open DOL / framework — never trade a naked PSP. **Plain PSP is never Stage 1.** PSP appears as **SS PSP (Stage 2)** or as the crack when **both fill a continuation / Universal Sequence gap** (SMT Fill dead). Do not read opposite-close PSPs that oppose the open DOL as reversals after LOD/HOD is set.

---

## Phase 3 · Execution Decision Tree

### Step 8 — Determine Which Play Type Applies

```mermaid
flowchart TD
    A["Price at POI / Relevant Level?"] -->|Yes| B["SMT Divergence present?"]
    A -->|No| W["Wait — no setup"]
    
    B -->|"Yes — full 2-Stage SMT or 2-Stage PSP"| C["🟢 REVERSAL PLAY"]
    B -->|"No divergence but aggressive reversal with ITF FVGs"| D["🟡 AGGRESSIVE REVERSAL FALLBACK"]
    B -->|"No"| W
    
    C --> E["Execute on stronger asset"]
    D --> F["Wait for ITF FVG SMT Fill + LTF CSD"]
    
    G["Stronger asset reached PDH/PDL but lagging hasn't?"] -->|Yes| H["🔵 CATCH-UP PLAY"]
    G -->|"Stronger asset expanding past key level toward next HTF DOL"| I["🟠 CONTINUATION PLAY"]
    
    H --> J["ITF FVG SMT Fill on lagging asset + LTF CSD"]
    I --> K["ITF FVG SMT Fill on ANY triad asset + LTF CSD"]
```

> Decoupled triad → wait for **Decoupled Sync** (one asset at a Relevant Level) before Catch-Up / high-quality SS (ADR-0002).

**Daily Bias gate:** Prefer trades **with** live Daily Bias. Catch-Up, Continuation, and Aggressive Fallback must **align with bias** (or stand down). Full **2-Stage SMT / 2-Stage PSP** may fade bias only at **reduced size**.

---

### Play A · Reversal Play (Primary Setup)

> The highest-conviction trade. Requires full 2-Stage SMT or 2-Stage PSP confirmation.

**Stage 1 — HTF SMT Divergence** *(already confirmed in Step 6)*

**Stage 2 — ITF Strength Switch (2-Stage SMT or 2-Stage PSP):**

1. After Stage 1, monitor ITF for Stage 2 — either sequence completes it
2. **2-Stage SMT:** On **`30m` / `1H` / `90m` only** — watch for the **strength switch** — the previously stronger asset stalls or reverses while the previously weaker asset drives through, creating a **second SMT** where roles reverse
3. **2-Stage PSP:** Alternatively, look for a **Strength Switch PSP** on full ITF (`4H` / `90m` / `1H` / `30m`) — opposite-polarity candle closes confirming the rotation (a `4H` SS PSP counts)
4. Once Stage 2 is confirmed, drop to **LTF (`15m` / `5m` / `3m` / `1m`)** for the entry trigger
5. Look for the **C1 → C2 (→ C3)** candle sequence:
   - **C1 (Protraction Candle)**: First candle that sweeps or trades into the Relevant Level
   - **C2 (Reversal Candle)**: Sweeps C1's extreme, then **body-closes back inside C1's range**
     - ✅ Valid C2 body close → structural C2 printed
     - ⚠️ Entry still requires an **Expansion Candle** — large opposing wick → **do not enter on C2**; wait for the next candle or C3 (ADR-0001 / 4H Profiling)
   - **C3 (Confirmation Candle)**: Needed if C2 body-closes **outside** C1's range, **or** if C2 failed the Expansion Candle wick gate. C3 must body-close past C2's body in the reversal direction
6. Identify the **CISD (Change in State of Delivery)** on any triad asset — prioritize the one closest to its open DOL
7. **Entry is armed** when any triad asset prints the LTF CISD (after Stage 2) on an Expansion Candle

**Entry:** The candle **immediately following** the confirmed CSD closure.

**Execute on:** The **stronger asset** (cleanest V-shape displacement from the sweep).

**Stop-Loss:** At the **absolute swing extreme** (wick) of the sweep candle at the POI.

**Target:** The next **Relevant Level** (PDH/PDL, PWH/PWL, or unmitigated HTF structure). If it's a large-wick reversal day with ADR nearly consumed, target the **18:00 Daily Open** instead.

---

### Play B · Catch-Up Play

> When the stronger asset has continued past the draw on liquidity or is consolidating at it, but the lagging asset hasn't reached its equivalent level.
>
> This is the **Universal Sequence** gap + SMT Fill leg on the lagging asset (ADR-0012) — not a separate model.

**Conditions:**
- Stronger asset has either **continued past its DOL** (PDH/PDL / rail Session POI) OR is **consolidating at it** — including partial FVG engagement where the lead is in the gap and holding
- Lagging asset has NOT reached its equivalent level / has not yet crossed that POI
- The stronger asset must be doing one of the two above — if it has reversed away from the DOL/POI without Stage 2, this play does NOT apply
- Must **align with Daily Bias** (bias gate above)
- If the triad is **decoupled** (assets pulling apart), wait for **Decoupled Sync** — one asset interacts with a Relevant Level — before treating Catch-Up as high quality (ADR-0002)

**Trigger:**
1. Monitor the **lagging asset** for an **ITF FVG (30m / 1H / 90m)** to form
2. Wait for **SMT Fill** — 1 or 2 (but NOT all 3) triad assets enter their respective ITF FVGs
3. Watch for a **LTF CSD (3m / 5m)** on the lagging asset with **displacement** (must leave a new LTF FVG or show an exceptionally strong body close)

**Entry:** Next candle after CSD confirmation on the lagging asset.

**Target:** The lagging asset's own equivalent PDH/PDL level.

> [!WARNING]
> **Immediate invalidation** if the stronger asset prints a counter-trend LTF CSD. This kills the catch-up thesis — the stronger asset is reversing, and you cannot expect the lagging one to continue.

---

### Play C · Continuation Play

> When price has broken past the key level and is expanding toward the next HTF Draw on Liquidity.
>
> This is the **Universal Sequence** gap + SMT Fill leg after expansion past the key level (ADR-0012) — not a separate model.

**Conditions:**
- Price (stronger asset) has expanded past PDH/PDL toward the next HTF DOL
- After a **rail stand-down** (all three crossed, no Stage 1), Continuation is allowed only after a real **bias / Session POI handoff** (e.g. 4H/1H close through PD 50% Midpoint, Continuation POI promotion) — not merely because price left the rail
- Must **align with Daily Bias** (bias gate above)
- You're looking to add to the move or enter fresh

**Trigger:**
1. Wait for an **ITF FVG (30m / 1H / 90m)** to form during the expansion
2. Watch for **SMT Fill** on **ANY** triad asset (not just the one you're trading). If all three fill that continuation gap, SMT Fill is dead — require **PSP** (close-polarity crack) at the gap instead (ADR-0012); that PSP is **not** Stage 1 of a Session POI reversal
3. Wait for a **LTF CSD (3m / 5m)** with displacement

**Asset Selection:**
- Trade the **stronger asset** if it has open HTF DOLs within ADR reach
- Otherwise trade the **lagging asset** toward its own PDH/PDL

---

### Aggressive Reversal Fallback (No 2-Stage SMT or 2-Stage PSP)

> When price reverses aggressively from a POI leaving new ITF FVGs, but without a clean 2-Stage SMT or 2-Stage PSP.

**Conditions:**
- Price reversed hard from a POI
- New ITF FVGs (30m / 1H / 90m) were created during the reversal move
- No clean 2-Stage SMT or 2-Stage PSP completed
- Trade direction must **align with Daily Bias** — this fallback may not fade bias

**Trigger:**
1. Transition to **continuation bias** in the reversal direction
2. Wait for the **ITF FVG SMT Fill** + **LTF CSD (3m / 5m)** with displacement

> [!CAUTION]
> This is lower conviction than a full reversal play. Size accordingly. It does not replace 2-Stage and does not reopen Stage 1 via plain PSP.

---

## Phase 4 · Trade Management

### Step 9 — Manage the Position

| Milestone | Action |
|---|---|
| **Entry** | SL at absolute swing extreme (wick) of sweep candle |
| **2R reached** OR price breaks first counter-trend LTF swing point (LTF MSS) | Move SL to **break-even** |
| **TP1 hit** (18:00 Daily Open) | Take partials or full close |
| **TP2 hit** (Opposite PDH/PDL) | Close remaining position |

### Step 10 — Validate the Expansion Leg

After entry, monitor the **50% Equilibrium Rule**:

- Measure the **expansion leg**: Start = absolute extreme (wick) of sweep candle → End = highest high / lowest low before a 3-candle fractal confirms
- Price must **NOT close past the 50% retracement** of this expansion leg on your execution timeframe
- Lower ITF FVGs (30m) may be inversed during retracement as long as the higher ITF FVG (1H) and 50% equilibrium hold

> [!NOTE]
> **Exception:** Both the 50% rule and FVG boundaries can be bypassed if confirmed via SMT Divergence + Strength Switch. The cross-asset signal overrides single-chart structure.

---

## Phase 5 · Post-Session Review

### Step 11 — Journal the Day

- What day type was it? Did your pre-session classification hold?
- Did price reach your POI? How did it react?
- Which play type triggered (if any)?
- Did the SMT divergence / strength switch sequence fire cleanly?
- Were there setups you missed? Why?
- Did risk management rules hold? Any break-even triggers?

---

## Quick Reference — The "Am I Ready to Click?" Checklist

Before every execution, confirm:

- [ ] **Bias is set** — day type classified, directional or neutral determined; play aligns with bias gate (weak plays with bias; counter-bias only full 2-Stage at reduced size)
- [ ] **POI identified** — price is at or has swept a Relevant Level; FVG vs rail engagement rules checked (Step 6)
- [ ] **SMT Divergence confirmed** — Stage 1 classic extremes (Reversal); plain PSP is not Stage 1
- [ ] **Correct play type selected** — Reversal / Catch-Up / Continuation / Fallback
- [ ] **LTF trigger fired** — C2/C3 closure (Reversal) OR CSD with displacement (Catch-Up / Continuation)
- [ ] **Strength Switch locked** — CISD on at least one triad asset
- [ ] **Right asset selected** — stronger asset for reversals, lagging for catch-ups
- [ ] **SL placed** — at absolute wick extreme of sweep candle
- [ ] **Target set** — next Relevant Level (PDH/PDL, PWH/PWL) or 18:00 Daily Open on large-wick reversal days

> [!IMPORTANT]
> **What you are NOT allowed to do:**
> - Reverse a lagging asset while the stronger asset consolidates at highs/lows without a full 2-Stage SMT or 2-Stage PSP
> - Use a simple LTF CSD alone as a reversal confirmation (that's only valid for continuation/catch-up plays)
> - Enter before the CSD/C2 closure is confirmed — no anticipation trades
> - Use plain PSP as Stage 1 at Session POI
> - Fade Daily Bias with Catch-Up, Continuation, or Aggressive Fallback
> - Force reversal on a rail after all three crossed with no Stage 1 (stand down)
> - Run Continuation after rail stand-down without a real bias / Session POI handoff
