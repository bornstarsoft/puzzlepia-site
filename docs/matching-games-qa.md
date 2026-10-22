# Matching Games QA

The two practice games share `static/js/puzzlepia-pairs.js`. The fallback Memory
board lives in `layouts/partials/daily-game/pair-puzzle.html`.
Make 10 uses seven balanced layouts in `data/number_pairs.json`, with its first
layout rendered as the playable fallback if optional rotation is unavailable.
Seven Memory layouts live in `data/memory_pairs.json`; the optional
`puzzlepia-memory-layouts.js` model validates them and selects the UTC daily pick.
No package installation is needed.

## Local Checks

```sh
node tools/test_pair_puzzles.cjs
bash tools/check_site.sh
hugo --gc --minify
git diff --check
git ls-files public resources/_gen
```

The Node test is a dependency-free DOM adapter for selection, feedback, independent instances, missing markup, and reset states. It does not replace real browser QA. It completes the two boards 28 times with different pair removal orders. If board data changes, update the fixtures and manual sequences together.

## Browser Checks

Use the small corner numbers as positions. Check at 390, 430, 768, and desktop widths; also use touch emulation and keyboard Enter/Space. Native device Safari remains a separate device check.

- Memory Pairs: `/daily/memory-pairs/`. Select **Layout 1**, then complete positions **1-9, 2-7, 3-12, 4-11, 5-8, 6-10**. Expect six pairs, visible symbols/check marks, and completion. Reset and repeat.
- Make 10: `/daily/number-pairs/`. Select **Layout 1**, then complete positions **1-7, 2-8, 3-9, 4-6, 5-11, 10-15, 12-13, 14-16**. Expect eight pairs and completion. Reset and repeat.
- Before completing each game, select 1 twice: only one tile is selected. Select 2 next: the pair is incorrect. Select 3: the old attempt clears and a new one starts.
- Test Clear selection, then reset after an unfinished pair and after a successful pair. Every face, disabled state, progress counter, message, and completion link must return to its initial state.
- No timer resolves a mismatch. It stays visible until the player chooses another card or clears the selection.
- With JavaScript disabled or the game script unavailable, verify the explanation and guide links remain available, with inert board buttons and no active controls.
- With browser storage unavailable, verify both games still work. They add no progress or score storage; the existing optional recent-puzzle shortcut remains independent.
- Check Home, Daily, Games, Blog, and Search discovery, canonical URLs, sitemap entries, footer links, and both guide diagrams.

## Initial Validation

- State tests passed; browser tests completed each game twice per desktop/mobile viewport plus 390px touch emulation (20 completions total).
- Checked 40 supporting page/viewport states, 70 internal URLs over local HTTP, and 1,687 internal link/image targets across 72 generated HTML pages excluding Phaser build output.
- No console errors, missing images, duplicate IDs, or horizontal overflow in tested pages. JavaScript-disabled content and storage-blocked game play passed.
- Final regression pass completed and reset all five existing games at 390px and 1280px. Word Search used its word-list fallback. Both new games were completed and reset again after the final status/CTA contrast polish.
- Home, Daily, and Games links, both search queries, and guide-to-game CTAs were checked in the generated site. Production deployment is a separate confirmation step.
- Results describe local Chromium checks, not a claim of deployment or physical-device testing.

## Phase 7C Memory Layout Rotation

- Seven fixed layouts repeat weekly, anchored to 2026-10-15 at 00:00 UTC.
  Earlier/invalid clocks use Layout 1. No random generation or saved progress.
- Reset preserves the current layout, even across midnight. Today's layout
  explicitly reads the clock again. Changing the selector or using the
  completion-only next action starts a fresh board; Layout 7 wraps to Layout 1.
- Complete/reset/replay all seven layouts at 390, 430, 768 and desktop widths.
  Test touch, keyboard, mismatches and clear selection. Keep the open board
  stable across UTC midnight, then use Today's layout to switch.
- Block the optional model or corrupt its embedded JSON: the starter board
  must still play, with layout controls hidden. Block the main script: the
  explanatory no-JavaScript fallback and guide links must remain available.
- Regression-check Make 10 completion/reset and Word Search optional resume.
  Both pair-game scripts are fingerprinted to prevent stale state/UI code.
- No homepage layout, external links, storage, analytics or Cloudflare settings
  change. Native Safari and measured retention are separate follow-up checks.

## Phase 7F Make 10 Layout Rotation

- Seven fixed 4x4 layouts repeat weekly, anchored to 2026-10-22 at 00:00 UTC
  (the release's UTC date; the local release date is 2026-10-23 KST).
  Earlier/invalid clocks use Layout 1. Numbers stay visible; pairs can be
  anywhere. Eight pairs complete a board. No scoring, timer or saved progress.
- `puzzlepia-number-layouts.js` validates integer values 1-9, sixteen tiles,
  seven unique boards and balanced partner counts (including an even count
  of 5s). State tests explore every reachable remainder to catch dead ends.
- Layout selection, today's pick, next-layout wrap, reset and fallback reuse
  the existing pair-game flow. Memory retains its own model and date anchor.
- Test all seven layouts at 390/430/768/1280px, with touch and keyboard.
  Check a wrong pair, repeated tile, clear selection, reset before/after a
  match and completion, then complete again. Change layouts mid-selection;
  no old markers or disabled tiles may remain. The next action is completion-only.
- Advance the browser clock across UTC midnight: the open board and Reset
  must stay unchanged; Today's layout must select the new pick. Test weekly wrap.
- Block the optional number model or corrupt JSON: Layout 1 must remain
  playable and layout controls hidden. Block storage: play must still work.
  Disable JavaScript: visible board, guide links and challenge answers remain
  readable, with inert game buttons. Regression-test all Memory layouts,
  Word Search hints/save/reset, and the other starter games.
- The new challenge renders Layout 2 from the same data via
  `number-pairs-example`; both explained solution routes are asserted in tests.
  Keep these paths in sync if that layout changes. Preserve published dates
  when refreshing guides; use lastmod for the update.
- Actual local and production results are recorded in CURRENT_STATE.md.

Local validation on 2026-10-15 passed: 56 Memory completions across all seven
layouts and four widths, four fallback/keyboard completions, plus 16 regression
completions across Make 10, Block Puzzle and Word Search. Reset, rollover, touch,
no-JavaScript fallback and blocked storage passed. The browser reported no
console/page errors or overflow. All dependency-free tests and Hugo checks
passed; 2,100 internal file references across 72 HTML pages resolved. See
[current release state](CURRENT_STATE.md) for production evidence.
