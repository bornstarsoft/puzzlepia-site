# Daily Challenge Collection Links

Phase 7K adds bookmarkable topic lists to the existing `/daily/` page. The
homepage and playable games stay unchanged. No storage, tracking or accounts
are involved; this is list navigation, not saved puzzle progress.

## URLs

- `/daily/?topic=ring#daily-challenge-title` opens ring challenges.
- Supported topics: `word`, `block`, `ring`, `number`, `color`, `memory`, `mixed`.
- Omit `topic` (or use `all`) for all types. `view=all` expands the list beyond
  its initial nine cards; choosing another topic collapses it again.
- The ordinary "Link to these challenges" anchor includes the current topic,
  expanded state and section anchor. It can be bookmarked or copied using the
  browser. Unrelated query parameters are not copied into collection links.
- Unknown or duplicate topic values fall back to All. Unknown or duplicate
  `view` values use the collapsed list. Values are not rendered as HTML.
- Filter changes add history entries only when the URL changes. Back/forward,
  reload and page restoration read the list state from the URL.

## Boundaries

- Challenge pages now include two ordinary links after their content: the
  matching topic collection and All Daily Challenges. The list and return link
  use `daily-challenge-topic.html`, preserving the existing classification.
  Only non-playable challenge pages show this navigation; Home and games do not.
- These are collection links, not browser Back. They select a topic with the
  default collapsed list, rather than restoring a previous scroll or expansion.
  With no JavaScript, the native section anchor and complete list still work.

- Only the Daily group opts into URL behavior with `data-discovery-url`.
  Blog search and filtering retain their existing behavior.
- Without JavaScript all challenge cards and their normal links remain visible.
  Without URLSearchParams, ordinary filtering still works; the collection link
  is hidden. If history writes fail, filtering and the native link still work.
- Canonical and sitemap URLs remain `/daily/`; query variants are not new
  content pages. The shared discovery script is fingerprinted for cache-safe
  deployment. Existing external game links are unchanged.

## Verification

Run `node tools/test_discovery.cjs`, `bash tools/check_site.sh` and
`hugo --gc --minify`. Browser-check at 390, 430, 768 and 1280px:

- Open each topic, refresh, then open a challenge and go Back/Forward.
- Choose All, expand, open a later challenge, then go Back and refresh.
- Open the collection link in a fresh page; confirm the same list and section.
- Follow collection links in Ring Puzzle Basics, Block Puzzle Space Management
  and Your First Sudoku Move. Keep all seven playable games above the list.
- Follow the return links from every topic; check the matching active filter,
  section anchor, reload/back behavior, All link and keyboard/no-JavaScript use.
  Run `python3 tools/check_challenge_return.py` after building to verify every
  published challenge and fixture cases for topic/draft/type boundaries.
- Check malformed/duplicate URLs, keyboard operation, no-JavaScript content,
  blocked history, missing URL API, Blog search and core/footer destinations.
- Check game completion/reset, console errors and horizontal overflow.

Production evidence belongs in [CURRENT_STATE](CURRENT_STATE.md). No increase
in repeat visits is established by these functional checks.
