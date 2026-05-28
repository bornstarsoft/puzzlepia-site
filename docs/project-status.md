# Puzzlepia Project Status

This document captures the current live MVP state so future work can continue without re-discovering the project shape.

## Live Site

- Main URL: `https://puzzlepia.com/`
- Brand: Puzzlepia
- Positioning: "Your Daily Puzzle World"
- Role: Official puzzle hub for BornstarSoft

## Technical Stack

- Hugo static site
- Plain HTML, CSS, and vanilla JavaScript
- Cloudflare Pages hosting
- Cloudflare Pages build command: `hugo`
- Cloudflare Pages output directory: `public`
- Production branch: `main`
- No Node, npm, React, Tailwind, backend, database, login, rankings, ads, or GA4 in the site source
- `public/` is generated locally and must remain ignored and untracked

## Completed Infrastructure

- Cloudflare Pages deployment
- `puzzlepia.com` custom domain
- `www` and `puzzpia` redirect handling
- Email Routing
- SSL/TLS
- Google Search Console
- `sitemap.xml` and `robots.txt`
- Cloudflare Web Analytics enabled with EU visitor data excluded
- PNG Open Graph sharing image

## Completed Site Phases

- Phase 1A: MVP Hugo site with core pages, layouts, CSS, SEO basics, robots, and sitemap
- Phase 1C/1D: HTML5 Daily Puzzle starter pack
- Phase 1E: Games hub and game detail page improvements
- Phase 1G: Starter blog content
- Phase 2A: Content operations foundation
- Phase 2B: First structured content expansion batch
- Phase 2C: Publishing workflow docs
- Phase 2D: Local publishing checks
- Phase 2E: SEO, JSON-LD, and sharing metadata
- Phase 2F: SVG Open Graph source image
- Phase 2G: PNG Open Graph fallback image

## Page Inventory

Core pages:

- `/`
- `/daily/`
- `/games/`
- `/blog/`
- `/about/`
- `/contact/`
- `/privacy/`
- `/terms/`

Playable Daily Puzzle pages:

- `/daily/word-search/`
- `/daily/block-puzzle/`
- `/daily/ring-puzzle/`
- `/daily/number-puzzle/`
- `/daily/color-match/`

Game pages:

- `/games/blockzzle/`
- `/games/kpop-word-search/`
- `/games/ringzzle/`
- `/games/mapdoku/`
- `/games/color-rings-mania/`

Utility pages:

- `/sitemap.xml`
- `/robots.txt`

See `docs/url-inventory.md` for the full URL list, including Blog posts and Daily Challenge pages.

## Analytics and Search Setup

- Google Search Console is configured.
- Hugo sitemap generation is active.
- `static/robots.txt` allows crawling and points to `https://puzzlepia.com/sitemap.xml`.
- Cloudflare Web Analytics is enabled through Cloudflare, not manually in the repo.
- EU visitor data is excluded in Cloudflare Web Analytics.
- Privacy Policy mentions Cloudflare Web Analytics and the current lack of accounts, login, payments, and rankings.

## Content Inventory

- 10 Blog posts under `content/blog/`
- 7 Daily Challenge pages under `content/daily/challenges/`
- 5 playable HTML5 Daily Puzzle pages under `content/daily/`
- 5 game detail pages under `content/games/`
- Internal content operations docs under `docs/`
- Local publishing helper at `tools/check_site.sh`

## HTML5 Daily Puzzle Status

The current HTML5 Daily Puzzle starter pack is intentionally simple and static:

- Daily Word Search: playable, completable, resettable
- Daily Block Puzzle: tap piece, tap board placement, completable by placing all pieces
- Daily Ring Puzzle: tap ring, tap compatible cell, completable by placing all tray rings
- Daily Number Puzzle: tap numbers in ascending order, completable from 1 to 16
- Daily Color Match: clear pink target tiles, completable and resettable

These are starter puzzles, not full commercial game engines. Keep changes small and manually test completion and reset after any gameplay edit.

## Known Limitations

- Daily puzzles are static starter experiences, not procedurally generated daily puzzles.
- No backend, player accounts, login, rankings, payments, ads, or server sync.
- No score sharing or social sharing flow beyond standard page metadata.
- Game store links are incomplete except where confirmed, such as KPOP Word Search on Google Play.
- Most game pages do not yet include real screenshots or store badges.
- Blog and Daily Challenge content is still early and should grow steadily.

## Do Not Change Casually

- Cloudflare Pages settings
- Cloudflare Web Analytics setup
- DNS, redirects, Email Routing, or SSL/TLS configuration
- `public/` ignore behavior
- Canonical base URL: `https://puzzlepia.com/`
- Privacy wording around analytics, accounts, login, payments, and rankings
- Store URLs unless confirmed
- The no-backend, static-first scope

## Recommended Next Priorities

1. Phase 3A: Improve Daily Word Search UX while keeping it static and vanilla JS.
2. Phase 3B: Continue Blog and Daily Challenge content batches using `tools/check_site.sh`.
3. Phase 3C: Improve Games hub conversion with confirmed store links and real assets only.
4. Phase 3D: Improve social and brand assets with real image/icon sources.
5. Keep publishing docs and URL inventory updated after each meaningful content or metadata phase.
