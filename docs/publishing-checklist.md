# Puzzlepia Publishing Checklist

Use this checklist before publishing Blog, Daily Challenge, or Games updates.

## Before Writing a New Blog Post

- Confirm the topic fits Puzzlepia: daily puzzles, puzzle tips, casual puzzle play, or BornstarSoft game discovery.
- Choose one clear search intent and one useful reader takeaway.
- Check existing posts so the angle is not duplicated.
- Plan natural internal links to `/daily/`, `/games/`, or a specific related page.
- Avoid fake statistics, keyword stuffing, and overclaiming.

## Before Publishing a New Blog Post

- Confirm front matter has `title`, `description`, `date`, `draft: false`, `tags`, and `categories`.
- Keep the title clear and the description concise.
- Use short paragraphs and helpful headings.
- Confirm all internal links resolve.
- Run `hugo`.
- Confirm the new URL appears in `public/sitemap.xml`.

## Before Adding a Daily Challenge Page

- Confirm the page is static content, not a new JavaScript game.
- Include `title`, `description`, `date`, `difficulty`, `puzzleType`, and `relatedGame`.
- Include a puzzle prompt, hint, answer section, playable Daily Puzzle CTA, and related game CTA.
- Keep the challenge short and easy to understand globally.
- Run `hugo` and confirm the page generates under `public/daily/challenges/`.

## Before Updating a Game Page

- Confirm game status is accurate: Available, Coming soon, In development, or Open beta.
- Use a store URL only when confirmed.
- Keep descriptions useful and modest.
- Keep related Daily Puzzle links current.
- Confirm no page implies accounts, rankings, payments, or a backend on Puzzlepia.

## Before Pushing to GitHub

- Run `bash tools/check_site.sh`.
- Run `hugo`.
- Run `git diff --check`.
- Run `git ls-files public` and confirm it returns nothing.
- Confirm `public/index.html` exists locally after the build.
- Confirm `public/` remains ignored.
- Check that no generated files or temporary Cloudflare API files are staged.
- Check internal links for new and edited pages.
- Browser-check key pages for no console errors and no mobile horizontal overflow.

## After Cloudflare Pages Deployment

- Confirm the deployment finished successfully.
- Confirm Cloudflare Pages deployed the pushed commit.
- Visit the changed URL on `https://puzzlepia.com/`.
- Confirm footer links still work.
- Confirm `https://puzzlepia.com/sitemap.xml` loads.
- Confirm the deployed page title, description, and canonical URL look correct.

## After Search Console Indexing Check

- Check Search Console sitemap status after deployment.
- Confirm Search Console sitemap status after major content batches.
- Use URL Inspection for important new pages after they are live.
- Confirm Google can access the page.
- Record any indexing issue before changing content again.
- Keep expectations realistic; indexing may take time.
