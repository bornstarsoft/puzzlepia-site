# Word Search Rotation And Optional Resume

Work ID: `PUZZLEPIA-WORD-ROTATION`

## Approved Scope

Phase 7A was the first local implementation of the retention plan approved on 2026-10-14.
Improve one existing game before adding more games or infrastructure. This
phase adds no tracking, storage, accounts, scores, rankings, or backend.
The owner approved the repository-specific GitHub exception and release on
2026-10-14. Phase 7B adds optional local progress as described below; it does not
add tracking, accounts, or a backend.

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
- The native selector offers all sets. Changing sets starts fresh and replaces
  the latest save if the player has explicitly enabled optional progress saving.
  With saving off, returning to the page starts a fresh board.
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
node tools/test_word_progress.cjs
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

## Phase 7B: Optional Browser Resume (2026-10-15)

- Saving is off by default. The native checkbox below the board enables it.
- One `puzzlepiaWordProgressV1` localStorage record holds the last set ID,
  content signature, found words, board's UTC date, daily/practice mode, and save
  timestamp. No identifier, account, score, network request, or new analytics.
- A return on the same UTC day restores the saved set and its found highlights,
  word buttons, progress, and completion actions. Answer-button reveals count
  the same as grid finds, as they already did before saving existed.
- On a later UTC day, today's pick opens fresh; a secondary button can resume
  the previous set with its original date clearly labeled. Finding a word,
  resetting, or changing sets replaces that older save. Merely loading the new
  day does not overwrite it. Switching sets is not a multi-board archive.
- Reset writes an empty current board when saving is on. It cannot resurrect
  old highlights after reload. Turning saving off deletes the record but leaves
  the current board playable; clearing the recent-page shortcut is separate.
- Saves expire after 30 days without another save and are removed on the next
  read. Invalid, oversized, future-dated, changed-board, or unknown-word records
  are not restored. Storage failures show a short message and never block play.
- Clearing saved progress in another tab switches saving off here too. Other
  concurrent edits are last-write-wins; this is not cross-tab or device sync.
- If the optional progress script fails, the existing game still initializes
  and its save controls stay hidden. The core static fallback is unchanged.
- Home layout and navigation are unchanged. The existing recent-puzzle panel
  no longer universally promises that every puzzle starts fresh. Privacy copy
  distinguishes the existing shortcut from opt-in game progress.

Manual QA: start with saving off; find a word and reload (fresh). Enable saving,
find two words and reload (restored). Complete and reload (completion restored).
Reset and reload (empty). Cross a UTC date boundary (today fresh, old set offered).
Turn saving off and reload (no save). Repeat with blocked/quota-limited storage,
an invalid record, and two tabs. Test widths 390, 430, 768, and 1280px.

Local QA on 2026-10-15: all 14 sets completed and restored at all four widths
(56 set-completion restores), plus partial progress, reset/reload, opt-out,
UTC rollover, and previous-day resume. Chromium touch endpoints were used on
mobile. Blocked storage, quota failures, corrupt and expired records, missing
optional script, deletion failure feedback, and cross-tab opt-out passed.
Twenty core-page layout checks and 24 other-game initialization/reset checks
passed without horizontal overflow. Unit tests and Hugo checks passed; 2,318
internal file references and 71 sitemap entries were valid. Native Safari and
retention improvements are not verified. Production evidence belongs in
[CURRENT_STATE](CURRENT_STATE.md).

## Phase 7D: Links to Practice Sets (2026-10-23)

- A compact, initially closed disclosure below the board provides a link and
  copy button for the current set, for example `/daily/word-search/?set=fruit`.
  IDs come only from the curated catalog, not user-supplied destinations.
- The link opens that fixed set fresh on any date. An explicit valid set wins
  over automatic resume, including a save of the same set. The saved board can
  still be resumed manually and is not overwritten merely by opening/copying
  the link. Playing, resetting or switching sets follows existing save rules.
- Unknown, malformed, duplicate or removed set IDs use the normal daily/resume
  flow. No address-bar rewriting or custom back-button behavior is introduced.
  Reloading a set URL opens that linked set again; use the base URL for the
  normal daily/resume entry point.
- Copy writes only the curated set URL after a click. It never reads the
  clipboard. Denied/unavailable clipboard access selects a visible read-only
  field for manual copy. Async copy feedback cannot leak onto a newly selected
  set. Links contain no found words, answers, account IDs or analytics tags.
- Existing canonical/OG URLs and sitemap stay at the base page. No public
  routes, dependencies, storage keys, backend or tracking were added. Keep
  existing IDs stable when editing future catalogs; do not repurpose an ID.
- QA: complete/reset linked sets, reopen on another UTC date, preserve an
  existing same/different-set save, resume it manually, and check opt-out and
  denied clipboard. Test all fourteen IDs, next-set wrap, keyboard/touch and
  390/430/768/1280px widths. Production evidence belongs in CURRENT_STATE.md.

Local QA on 2026-10-23 passed 112 completions across all fourteen links and
four widths, reset/next updates, cross-date reopening, saved-board precedence
and opt-out. Copy success (including a native write), denied/missing clipboard,
async set-switch race, keyboard, no-JavaScript and blocked-storage cases passed.
Desktop drag and mobile endpoint taps passed. Core-page/footer and other-game
regressions passed without console/page errors or horizontal overflow. Unit
tests, build, generated internal references, canonical and sitemap checks passed.
The first local test used a production canonical expectation, and another
asserted before navigation finished; corrected checks passed without source fixes.

## Release Boundary

This is a curated collection rotation, not evidence of increased retention.
No completion or return-visit analytics were added. Weekly records and further
business experiments remain a later phase. Push only within current owner
authorization, then verify production; never change Cloudflare settings or
apply this repository's GitHub exception to other repositories.
