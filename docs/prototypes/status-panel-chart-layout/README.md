# PROTOTYPE — status panel + decluttered chart layout

Throwaway visual mock for [Prototype status panel and decluttered chart layout](https://github.com/omarham1/NewGxT/issues/44).

**Not production Pine.** Answers: do decluttered chart + compact status panel + progressive disclosure feel easy to follow and not messy enough to lock into the PRD?

## Run

```bash
npm run prototype:panel
```

Open http://localhost:4177/?variant=A

## Variants (`?variant=`)

| Key | Structure |
|---|---|
| A | Bottom stack — full-width chart; session strip + expanding setup under chart |
| B | Right rail — chart + fixed vertical status column |
| C | Floating BR — strip/setup as floating panel, bottom-right on the chart |

Arrow keys / bottom switcher cycle variants. Scenario buttons scrub quiet → setup SMT → entry armed → CISD → hard clear.
