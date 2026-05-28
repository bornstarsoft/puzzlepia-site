# Puzzlepia Content Workflow

Puzzlepia is a Hugo static site. Keep updates small, reviewable, and friendly to Cloudflare Pages.

## Add a Blog Post

1. Create a file under `content/blog/`, for example `content/blog/simple-puzzle-habits.md`.
2. Start from `archetypes/blog.md` or run `hugo new blog/simple-puzzle-habits.md`.
3. Add a clear `title`, concise `description`, `date`, and helpful body copy.
4. Link naturally to `/daily/`, `/games/`, or a specific puzzle page when useful.
5. Keep the tone simple, global, and helpful. Avoid fake stats or keyword stuffing.

## Add a Daily Puzzle Page

1. Create a page under `content/daily/`, usually as a page bundle such as `content/daily/new-puzzle/index.md`.
2. Start from `archetypes/daily.md`.
3. Fill in `difficulty`, `relatedGame`, and `puzzleType`.
4. Include a prompt, hint, answer or completion note, and a related game CTA.
5. If the page needs playable HTML5 behavior, keep it plain HTML, CSS, and vanilla JavaScript.

## Add or Update a Game Page

1. Create or edit a page under `content/games/`.
2. Start from `archetypes/game.md` for new pages.
3. Fill in `genre`, `status`, related daily puzzle information, and store status.
4. Use a real store URL only when it is confirmed. Otherwise use clear copy such as "Store link coming soon."
5. Keep game pages useful without overclaiming availability or scale.

## Build Locally

Run:

```sh
hugo
```

Confirm:

```sh
test -f public/index.html
git ls-files public
git check-ignore -v public/index.html
```

`git ls-files public` should return nothing. `public/` should stay ignored because Cloudflare Pages generates it during deployment.

## Publish

1. Review changed files with `git status --short` and `git diff --check`.
2. Commit the source changes only.
3. Push to the production branch when ready.
4. In Cloudflare Pages, confirm the deployment finishes successfully.
5. Visit the changed page on `https://puzzlepia.com/`.

## Search Console Check

After publishing meaningful new pages:

1. Confirm `https://puzzlepia.com/sitemap.xml` loads.
2. In Google Search Console, inspect the sitemap status.
3. For important new pages, use URL Inspection after the deployed page is live.
4. Do not expect instant indexing. Keep publishing clear, useful content steadily.
