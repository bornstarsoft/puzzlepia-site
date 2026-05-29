# Phaser Word Search Adoption Decision

Phase 4D reviews the current Phaser Word Search lab after Phase 4C integrated the built static output into the Hugo site at `/games/phaser-word-search/` and embedded it from `/labs/phaser-word-search/`.

## Current Recommendation

Keep the stable Vanilla JavaScript `/daily/word-search/` as the main Daily Word Search for now.

Keep the Phaser version as a separate lab experiment at `/labs/phaser-word-search/`.

Do not replace `/daily/word-search/` until the Phaser version is clearly better for players and the bundle-size tradeoff is acceptable.

## What Was Compared

Compared surfaces:

- Stable Vanilla JS Daily Word Search: `/daily/word-search/`
- Phaser lab page with iframe: `/labs/phaser-word-search/`
- Direct static Phaser build: `/games/phaser-word-search/`

Core behavior checked:

- Game initializes.
- Words can be selected.
- Found words highlight.
- Progress updates.
- Completion appears.
- Reset works before and after completion.
- The puzzle can be completed again after reset.
- Mobile layout avoids horizontal overflow.
- Console stays free of page errors.

## Bundle Size Notes

Current Phaser lab build files:

- `static/games/phaser-word-search/index.html`: about 2 KB raw, about 1 KB gzipped.
- `static/games/phaser-word-search/assets/index-Bl0FMDas.css`: about 3 KB raw, about 1 KB gzipped.
- `static/games/phaser-word-search/assets/index-BlT0qHIh.js`: about 1.2 MB raw, about 333 KB gzipped.

Current stable Daily Word Search implementation for comparison:

- `static/js/daily-word-search.js`: about 9 KB raw.
- `layouts/partials/daily-game/word-search.html`: about 1 KB raw.
- Shared `static/css/games.css`: about 6 KB raw, used by all Daily Puzzle starters.

The Phaser build is much larger than the current Vanilla JS Word Search. That size may be reasonable for richer future canvas games, but it is not justified yet for replacing a small static Daily Puzzle that already works.

## Load And Iframe Behavior

Observed behavior:

- The direct static Phaser build loads as a self-contained static page.
- The lab iframe loads the same build without interfering with the Hugo page, header, footer, metadata, or stable Daily Puzzle scripts.
- The iframe layout avoids horizontal overflow at common mobile widths.
- The iframe approach is safer than direct script integration because Phaser code and CSS stay isolated from the Hugo page.

Phase 4D local browser QA notes:

- Checked `/labs/phaser-word-search/`, `/games/phaser-word-search/`, and `/daily/word-search/` at 390px, 430px, 768px, and desktop width.
- No horizontal overflow was observed.
- No page console errors were observed.
- The lab iframe loaded the Phaser canvas at all checked widths.
- At 390px width, the iframe rendered about 336px wide and 820px tall.
- Local load timings were fast on the development machine, but this does not remove the bundle-size concern for real visitors.
- The direct Phaser build decoded about 1.2 MB of lab assets during the check, while the stable Daily Word Search loaded the much smaller Vanilla JS script.

Current iframe tradeoffs:

- The iframe creates a taller embedded page on mobile.
- The game feels visually separate from the Hugo page.
- The embedded page has its own internal layout, so future polish should happen in the external Phaser lab first.

## UX Comparison

Vanilla JS strengths:

- Very lightweight.
- Already integrated into the Daily Puzzle page.
- Clear fallback word-list buttons.
- Stable completion and reset.
- Easy to maintain inside Hugo.

Phaser lab strengths:

- Better foundation for canvas-based puzzle animation and richer visual effects.
- Cleaner path for future game-scene structure.
- Easier to expand if Word Search becomes more animated or game-like.

Current Phaser lab limitations:

- Much larger bundle.
- No clear player-facing advantage yet over the stable Vanilla JS version.
- Iframe adds isolation safety but also adds page height and embed complexity.
- No accessibility fallback equivalent to the Vanilla JS word-list buttons yet.

## Decision Checklist

Use this checklist before changing the production Daily Word Search direction.

### Keep Vanilla JS

Choose this when:

- The puzzle remains a small deterministic Daily Puzzle.
- The Vanilla JS version is complete, resettable, and mobile-friendly.
- Phaser does not provide a clearly better player experience.
- Bundle size matters more than animation or scene complexity.
- The page should remain tightly integrated with Hugo content.

Current Phase 4D decision: keep Vanilla JS for `/daily/word-search/`.

### Replace With Phaser

Choose this only if all are true:

- Phaser selection feels meaningfully smoother on real mobile devices.
- Phaser adds visible polish that players will notice.
- Completion, reset, and repeat play are at least as reliable as Vanilla JS.
- Accessibility and fallback controls are not worse than the current page.
- Bundle size is accepted as a deliberate product tradeoff.
- Browser QA passes for `/labs/phaser-word-search/`, `/games/phaser-word-search/`, and `/daily/word-search/`.
- The replacement has a rollback plan.

Current Phase 4D decision: do not replace yet.

### Keep Phaser As Separate Lab Only

Choose this when:

- Phaser is promising but not clearly superior yet.
- The lab is useful for future animation, canvas, or input experiments.
- The stable Daily Puzzle should remain lightweight.
- More mobile-device testing is needed.
- Future Phaser work should continue outside the Hugo repo first.

Current Phase 4D decision: keep Phaser as a separate lab only.

## Next Recommended Phaser Work

Keep all Phaser source work in:

- `/Users/seongjinkim/BornStarSoft_Publishing/phaser_labs/puzzlepia-phaser-lab`

Then copy only validated `dist/` output into:

- `static/games/phaser-word-search/`

Recommended next improvements before reconsidering adoption:

- Add a reliable non-canvas fallback or accessible word-list controls.
- Improve mobile iframe height and first-viewport framing.
- Add subtle found-word animation if it improves feel without distraction.
- Compare on real mobile devices, not only browser emulation.
- Consider code-splitting or Phaser build-size optimization.

## Bottom Line

Phaser remains a good candidate for richer future Puzzlepia HTML5 games, but the current Word Search lab does not yet justify replacing the lightweight Vanilla JS Daily Word Search.
