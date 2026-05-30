# Puzzlepia Phase 5 Next Priorities

This document turns the Phase 5B operations review into practical decision paths. Use it after checking Cloudflare Web Analytics, Google Search Console, and the live site.

## Path A: Content Growth

Choose this path when:

- Search Console impressions begin to appear for Blog or Daily Challenge pages.
- New content is being indexed without sitemap issues.
- There is no urgent gameplay bug or broken conversion path.

Recommended batch shape:

- Add 5 Blog posts.
- Add 7 Daily Challenge pages.
- Keep internal links to `/daily/`, `/games/`, related Daily Puzzle pages, and relevant game pages.
- Keep titles and descriptions unique.
- Update content docs and release log.
- Run `bash tools/check_site.sh` before committing.

Why this path fits now:

- Puzzlepia is still early and needs a broader base of simple, useful, search-friendly pages.
- Content growth is low-risk and does not disturb stable Daily Puzzle games.

## Path B: Daily Game Polish

Choose this path when:

- Cloudflare Web Analytics shows meaningful engagement on Daily Puzzle pages.
- Manual QA finds a specific Daily Puzzle friction point.
- A single puzzle can be improved without changing the whole starter pack.

Recommended next game:

- Daily Block Puzzle

Recommended scope:

- Improve one game at a time.
- Keep completion and reset stable.
- Prefer tap/click mechanics over fragile drag behavior.
- Keep the game deterministic.
- Avoid rankings, accounts, backend state, sound, and procedural daily generation.

Success criteria:

- The game starts clearly.
- The puzzle can be completed.
- Reset works before and after completion.
- Mobile width has no horizontal overflow.
- No console errors appear in browser QA.

## Path C: Games Hub Conversion

Choose this path when:

- Real store links become available.
- Real screenshots or app icons become available.
- Game detail pages need clearer next actions.

Recommended scope:

- Add real store links only when known.
- Add screenshots only if the assets are real and approved.
- Improve CTAs without overclaiming.
- Keep placeholder copy safe for unreleased or unknown games.
- Continue connecting game pages to related Daily Puzzle pages.

Avoid:

- Fake store badges
- Fake screenshots
- Fake ratings or review claims
- Unconfirmed release dates
- Download counts, prices, or availability claims that are not verified

## Path D: Phaser Experiments

Choose this path when:

- The Phaser lab has been tested on real mobile devices.
- The iframe experience feels meaningfully better than the Vanilla JS version.
- Bundle size and load behavior remain acceptable.
- There is a clear reason to use Phaser for a richer puzzle.

Recommended scope:

- Keep Phaser work in the external lab first.
- Copy only built `dist/` output into Hugo when a lab build is validated.
- Keep `/labs/phaser-word-search/` as the public experiment surface.
- Do not replace stable Daily games until Phaser clearly improves UX and maintainability.

Current decision:

- Keep `/daily/word-search/` as the stable Vanilla JS version.
- Keep `/labs/phaser-word-search/` as a separate lab-only experiment.
- Use the lab-only approach for future Phaser prototypes.

## Current Recommendation

Pick Path A next unless Cloudflare Web Analytics shows Daily Puzzle pages outperforming content pages in a way that justifies gameplay polish.

If Daily Puzzle engagement is strong, pick Path B and improve Daily Block Puzzle next.
