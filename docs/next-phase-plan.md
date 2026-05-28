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

## Default Phase Recommendation

Start with Phase 3A if the next work should improve player experience.

Start with Phase 3B if the next work should improve SEO/content coverage.

Start with Phase 3C only when confirmed store links or real game assets are available.

Start with Phase 3D when Puzzlepia has stronger official visual assets ready.
