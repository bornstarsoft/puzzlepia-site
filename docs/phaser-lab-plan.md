# Puzzlepia Phaser Lab Plan

Puzzlepia should stay Hugo-first and static, but future HTML5 games may benefit from a dedicated game framework once a prototype needs richer input, animation, scene management, or reusable game-state patterns.

## Why Phaser

Phaser is a practical long-term candidate for Puzzlepia web games because it is focused on 2D HTML5 games, has mature input handling, and can support mobile-friendly puzzle interfaces without requiring a backend. It is better suited than hand-written DOM logic when a puzzle needs canvas rendering, transitions, tile animation, drag feedback, or multiple scenes.

Phaser should be introduced carefully. The current Vanilla JS Daily Puzzles are stable starter games and should remain in place while the lab work proves whether Phaser improves the player experience without making the Hugo site heavier or harder to publish.

## First Recommended Experiment

Recommended public lab URL:

- `/labs/phaser-word-search/`

Recommended local experiment folder outside this Hugo repository:

- `puzzlepia-phaser-lab/`

Recommended built-output copy target inside the Hugo repository, only after the lab build is ready:

- `static/games/phaser-word-search/`

The first experiment should be a Phaser-powered Word Search prototype because Word Search already has a working Vanilla JS baseline. That makes comparison easier: the Phaser version should only move forward if touch selection, highlighting, responsiveness, and maintenance are clearly better.

## Integration Approach

Use an iframe first.

The safest initial production path is to build the Phaser game as a self-contained static bundle and embed it from `/games/phaser-word-search/` or another static path with an iframe on the lab page. This keeps the Hugo layout, metadata, navigation, and existing Daily Puzzle pages insulated from Phaser runtime changes.

Direct script integration should be considered later only if:

- The iframe version is stable on desktop and mobile.
- The bundle size is acceptable.
- The game does not interfere with site CSS or global JavaScript.
- The integration remains easy to build on Cloudflare Pages.

## Constraints

Keep the Phaser lab aligned with Puzzlepia's current MVP rules:

- Static build only.
- No backend.
- No login or user accounts.
- No rankings or leaderboards.
- No ads yet.
- No analytics scripts added manually.
- No sound yet.
- No large assets.
- No fake store badges, ratings, reviews, prices, or release claims.
- No replacement of the existing Vanilla JS Daily Puzzles until a later decision is made.

## Recommended Build Flow

1. Build the Phaser experiment outside the Hugo repository in `puzzlepia-phaser-lab/`.
2. Run the lab build command there, such as `npm run build`.
3. Copy the built static output into `static/games/phaser-word-search/` only after the prototype is ready for Hugo integration.
4. Add or update the Hugo lab page to iframe the copied static output.
5. Run `bash tools/check_site.sh`.
6. Run mobile browser QA at common widths such as 390px, 430px, 768px, and desktop.
7. Confirm `public/` remains ignored and untracked.
8. Deploy through the normal Cloudflare Pages Hugo build.
9. Check the Cloudflare deployment and Search Console sitemap after publishing.

## Validation Focus

Before any Phaser output is committed into the Hugo repository, confirm:

- The game loads from static files only.
- The game can be completed and reset.
- Mobile touch input is reliable.
- Desktop pointer input is reliable.
- There is no horizontal overflow.
- There are no console errors.
- The iframe does not break navigation, footer links, sitemap, robots.txt, or existing Daily Puzzle pages.

## Decision Gate

After the first Phaser Word Search lab, decide whether Phaser should become the standard for future richer HTML5 Puzzlepia games. Keep Vanilla JS for small static puzzle pages unless Phaser clearly improves reliability, accessibility, player feel, or maintainability.
