# Word Search Rotation: Phase 7A

Work ID: `PUZZLEPIA-WORD-ROTATION`

## Approved Scope

First local implementation of the retention plan approved on 2026-10-14.
Improve one existing game before adding more games or infrastructure. This
phase adds no tracking, storage, accounts, scores, rankings, or backend.
Deployment is separate and requires resolution of the GitHub/Gitea policy.

## Behavior

- `/daily/word-search/` keeps its URL and vanilla JavaScript engine.
- Four target words per fixed 6x6 board; fourteen manually curated boards.
- `data/word_search.json` is the single content source. Hugo embeds it in the
  page; no network request, random generator, or daily build is required.
- The collection starts on **2026-10-14 at 00:00 UTC**. Day zero selects set 1;
  day 13 selects set 14. Day 14 selects set 1 again with a **Replay pick** label.
  The picker explicitly states that the collection repeats every 14 days.
- The date is read from the device clock. A wrong device clock can select a
  different set; there is no authoritative server clock or competition.
- Before the collection start date, or with an invalid date, set 1 is practice.
- An open page never silently switches boards at midnight. Reset restores the
  same chosen board. **Today's pick** or a new page load uses the current UTC day.
- The native selector offers all sets. Changing sets discards current progress.
  Nothing is stored, and returning to the page starts a fresh board.
- Both word directions work. Tap endpoints, desktop/touch drag, keyboard
  activation, and word-list reveal buttons share the same completion state.
- Completion reveals **Try another word set** plus a useful guide link. The
  next-set action wraps from set 14 to set 1 without claiming new content.
- The game appears before the longer article instructions on Word Search only.
  Other Daily game layouts and their mechanics are unchanged.

## Content And Safety

The first board preserves STAR, MOON, MINT, and PLAY. Remaining themes are fruit,
gardens, coast, night sky, music, home, trails, colors, kindness, movement,
weather, baking, and play. Boards include reversed directions and one diagonal
STAR path. Difficulty remains an untimed, beginner-oriented starter.

The model validates grid shape, uppercase letters, four distinct target words,
unique set IDs, the start date, and exactly one physical path per word before
activating controls. Invalid data or a missing model leaves the static starter
board visible, interactive controls disabled, and a guide link available.

Reset and set changes clear selection, permanent highlights, invalid markers,
completion actions, and pending feedback timers. Pointer capture allows release
outside a tile; pointer cancellation must not count as a found word. Hidden-tab
and window-blur transitions clear transient input without awarding completion.

No-JavaScript visitors see the starter grid and word list for visual practice.
Interactive completion is unavailable in that mode. This is explicit, not a
fake playable state. Word Search scripts use content-fingerprinted URLs so old
cached scripts cannot silently ignore the new collection markup.

## Content Updates

1. Edit the fixed rows and word lists in `data/word_search.json`.
2. Keep stable IDs and the start date. Reordering or resizing the live collection
   changes date-to-board mapping; treat that as an intentional versioned release.
3. Review target words for clear, friendly global English, and inspect all boards.
4. Run the checks below. The current tests intentionally require fourteen boards.
5. Verify grid selection and reverse selection in a browser, not just the reveal
   buttons. Confirm a board change and reset remove every old marker.
6. If changing the number of sets, update metadata, catalog goal, documentation,
   and test expectations. Do not call repeated boards newly generated puzzles.

```bash
node tools/test_word_search.cjs
node tools/test_pair_puzzles.cjs
bash tools/check_site.sh
hugo --gc --minify
git diff --check
git ls-files public resources/_gen
```

## Reproducible Browser Checks

- Select **1. First steps**. Select STAR from row 1 column 1 to row 1 column 4;
  MOON from row 1 column 6 to row 4 column 6; MINT from row 6 column 1 to row 6
  column 4; PLAY from row 5 column 1 to row 5 column 4. Reverse endpoints also work.
- After one word, reset. After all four, confirm completion, reset, and complete
  again using word-list buttons. Use the next-set action and confirm Fruit bowl.
- Select **5. Night sky** and trace STAR diagonally from row 1 column 1 to row 4
  column 4. All other solution paths are returned by the tested fixed-board model.
- Try a non-straight selection, a wrong short selection, and an already-found
  word. Try cancelling touch input and releasing outside the board.
- With a test clock, cross 2026-10-14 23:59:59 UTC: the open board and reset keep
  set 1, while Today's pick selects set 2. At 2026-10-28 UTC, expect Replay pick.
- Disable JavaScript, block the model script, and separately provide invalid
  catalog data. Confirm the static starter and explanation remain available.
- Check 390, 430, 768, and 1280px widths, focus, overflow, and browser errors.

## Validation Record: 2026-10-14

- PASS: Word Search model tests (56 unique paths, 14 boards, UTC boundaries,
  400 rotation days, invalid data, missing markup) and existing pair-puzzle tests.
- PASS: Chromium at 390, 430, 768, and 1280px. Each set completed through grid
  selection, reset, and completed again through reveal buttons: 112 completions.
  Reset before completion, next-set wrapping, permanent highlights, and progress
  were also checked. Mobile endpoint taps and desktop pointer drags were used.
- PASS: touch-drag and cancellation through Chromium touch emulation; keyboard
  endpoints, wrong selections, duplicate words, timer cleanup, UTC midnight,
  reset retaining the current set, and the first replay date.
- PASS: JavaScript-disabled, blocked-model, and invalid-data fallback checks.
  The intentionally blocked resource produces an expected network failure;
  normal page checks produced no console or JavaScript errors.
- PASS: six other Daily games initialized, completed, and reset at all four
  widths (24 completions). Core-page checks found no horizontal overflow or
  duplicate IDs. Mobile screenshots were visually reviewed.
- PASS: `bash tools/check_site.sh`, `hugo --gc --minify`, `git diff --check`,
  2,317 generated internal file references, 71 sitemap URLs, and robots output.
  `public/index.html` exists; `public/` and `resources/_gen/` are ignored and
  untracked. No tracked Cloudflare temporary JSON was found.
- NOT_RUN: native iOS/Safari device testing, production deployment, production
  cache checks, and retention measurement. Browser automation is not evidence
  of native-device compatibility or business results.

## Release Boundary

This is a curated collection rotation, not evidence of increased retention.
No completion or return-visit analytics were added. Weekly records and further
business experiments remain a later phase. The next single task after local QA
is owner approval of the publishing remote, then release verification; never
change Cloudflare settings or push to a conflicting remote automatically.
