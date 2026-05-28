# Puzzlepia SEO and Sharing Notes

Puzzlepia uses lightweight Hugo metadata in the shared head partial. Keep this factual and static-site friendly.

## Titles and Descriptions

- Home uses `params.defaultTitle` from `hugo.toml`.
- Other pages use `Page Title | Puzzlepia`.
- Meta descriptions use the page `description` when present.
- If a page has no description, the site falls back to `params.defaultDescription`.
- Every public content page should keep a unique, concise description.

## Canonical URLs

- Canonical URLs come from Hugo `.Permalink`.
- Production canonicals use `baseURL = "https://puzzlepia.com/"`.
- Do not hard-code localhost or Cloudflare preview URLs into content.

## Sharing Metadata

- Open Graph title, description, URL, site name, type, and locale are generated in `layouts/partials/head.html`.
- Twitter card metadata uses `summary` by default.
- No `og:image` is currently emitted because there is no final share image yet.

## JSON-LD Included

- Home page: `WebSite` and `Organization`.
- Blog posts: `BlogPosting`.
- Game pages: conservative `CreativeWork`.
- Daily Puzzle and Daily Challenge pages: `CreativeWork`.
- Non-home pages also include simple `BreadcrumbList` data.

## What Not To Add

- Do not add fake ratings, reviews, download counts, prices, offers, addresses, or social profiles.
- Do not claim store availability unless the URL is confirmed.
- Do not say Puzzlepia is a large game portal.
- Do not imply dynamic daily puzzle generation unless it exists.
- Do not add analytics snippets manually.

## Future Open Graph Image

A future task can add a real share image:

- Path: `/static/images/og/puzzlepia-og.png`
- Recommended size: 1200x630
- Suggested content: Puzzlepia logo with "Your Daily Puzzle World"

Do not emit an `og:image` URL until the actual image exists.
