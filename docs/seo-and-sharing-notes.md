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
- Twitter card metadata uses `summary_large_image` by default.
- Default share image: `/images/og/puzzlepia-og.svg`.
- The default image is 1200x630 and is emitted as `og:image` and `twitter:image`.
- Pages may set `image` or `ogImage` in front matter to use a page-specific share image later.
- Page-specific images should be real static assets or confirmed absolute URLs.

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

## Future Open Graph Images

The default image is now available at:

- Source path: `/static/images/og/puzzlepia-og.svg`
- Public path: `/images/og/puzzlepia-og.svg`

Future page-specific share images can use:

- Recommended size: 1200x630
- Suggested content: Puzzlepia logo, page topic, and "Your Daily Puzzle World"
- Suggested future raster path pattern: `/static/images/og/page-name-og.png`

Do not add fake screenshots, misleading store badges, fake ratings, or app-store claims to share images.
