# Puzzlepia Next Phase Plan

The next phases should keep Puzzlepia lightweight, static, and clear. Do not introduce backend systems, accounts, rankings, ads, analytics snippets, or complex frontend tooling.

## Phase 3A: Improve Daily Word Search HTML5 Game

Goal: make the most approachable playable puzzle feel better on desktop and mobile.

Recommended scope:

- Improve grid selection UX.
- Add clearer found-word highlighting.
- Improve mobile touch feedback.
- Keep the direct word-list fallback.
- Keep completion and reset behavior reliable.
- Keep the implementation plain HTML, CSS, and vanilla JavaScript.

Do not add:

- Backend state
- Rankings or leaderboards
- Login or accounts
- Procedural daily generation
- External game engines

Validation focus:

- Complete all words by grid interaction.
- Complete all words by fallback buttons.
- Reset before and after completion.
- Confirm no console errors and no mobile overflow.

## Phase 3B: Improve Blog and Daily Publishing Cadence

Goal: continue building organic discovery value with repeatable content batches.

Recommended scope:

- Add 5 Blog posts per batch.
- Add 7 Daily Challenge pages per batch.
- Keep internal links to `/daily/`, `/games/`, related Daily Puzzle pages, and related game pages.
- Keep titles and descriptions unique.
- Use `tools/check_site.sh` before committing.
- Update `docs/url-inventory.md` when new URLs are added.

Content rules:

- Keep language simple and global.
- Avoid fake statistics.
- Avoid keyword stuffing.
- Avoid saying Puzzlepia is a large game portal.
- Avoid implying dynamic daily generation unless it exists.

## Phase 3C: Improve Games Hub Conversion

Goal: make game pages more useful without inventing claims or assets.

Recommended scope:

- Add real store links when known.
- Add screenshots only when real assets are available.
- Improve CTAs without overclaiming.
- Keep status labels accurate.
- Connect each game page to a related Daily Puzzle or Daily Challenge.
- Add brief update notes only when useful.

Do not add:

- Fake store links
- Fake screenshots
- Fake badges
- Unconfirmed release dates
- Ratings, reviews, download counts, or prices

## Phase 3D: Add Better Social and Brand Assets

Goal: improve brand polish while keeping assets real and lightweight.

Recommended scope:

- Create additional OG image variants for major sections.
- Polish favicon if a stronger official mark is available.
- Add optional app/game icons only when real assets exist.
- Keep the current PNG OG default as the fallback.
- Keep SVG source files where practical for future edits.

Do not add:

- Copyrighted characters
- Unofficial app screenshots
- Misleading store badges
- Large image files without a clear purpose

## Phase 4A: Phaser Lab Preparation

Goal: prepare for future Phaser experiments without changing the current Daily Puzzle games.

Recommended scope:

- Document the Phaser lab plan and safety constraints.
- Add placeholder pages for `/labs/` and `/labs/phaser-word-search/`.
- Keep the Phaser Word Search page honest: planned lab only, not a live game.
- Keep the existing Vanilla JS Daily Word Search unchanged.
- Do not add Phaser, npm files, build output, or iframe embeds yet.

## Phase 4B: Phaser Word Search Prototype

Goal: build a first Phaser Word Search experiment outside the Hugo repository.

Recommended scope:

- Create a separate local `puzzlepia-phaser-lab/` folder.
- Build a deterministic Word Search prototype with Phaser.
- Keep the game static and mobile-first.
- Confirm completion, reset, touch selection, and desktop pointer selection.
- Run the lab build separately before considering Hugo integration.

## Phase 4C: Integrate Built Phaser Output

Goal: copy a proven Phaser build into the Hugo static tree safely.

Recommended scope:

- Copy built lab files into `static/games/phaser-word-search/`.
- Embed the game with an iframe first.
- Run `bash tools/check_site.sh`.
- Browser QA `/labs/phaser-word-search/` on mobile and desktop.
- Keep the current Vanilla JS Daily Word Search available.

## Phase 4D: Decide Phaser Standard

Goal: decide whether Phaser should become the default for future richer HTML5 puzzle games.

Recommended scope:

- Compare bundle size, QA effort, touch reliability, and maintainability.
- Keep Vanilla JS for very small static puzzles if it remains simpler.
- Use Phaser only where it clearly improves player feel or implementation quality.
- Do not migrate existing stable Daily Puzzles without a clear benefit and separate plan.

Phase 4D outcome:

- Keep `/daily/word-search/` on the current Vanilla JS implementation.
- Keep `/labs/phaser-word-search/` as a separate Phaser lab experiment.
- Reconsider replacement only after real-device mobile testing, accessibility fallback work, and bundle-size review.

## Default Phase Recommendation

Start with Phase 3A if the next work should improve player experience.

Start with Phase 3B if the next work should improve SEO/content coverage.

Start with Phase 3C only when confirmed store links or real game assets are available.

Start with Phase 3D when Puzzlepia has stronger official visual assets ready.

Start with Phase 4B only after Phase 4A is published and the Phaser experiment is kept outside the Hugo repo.
