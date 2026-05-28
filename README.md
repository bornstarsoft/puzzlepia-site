# puzzlepia-site
Official Puzzlepia website — Your Daily Puzzle World.

Puzzlepia is the official BornstarSoft hub for Daily Puzzle starters, game discovery, and puzzle tips. The site is intentionally simple: Hugo static pages, plain CSS, and vanilla JavaScript for the lightweight HTML5 Daily Puzzle starter pack.

## Run Locally

```sh
hugo server
```

## Validate Before Publishing

```sh
bash tools/check_site.sh
hugo
git diff --check
git ls-files public
```

`git ls-files public` should return nothing. Cloudflare Pages builds `public/` from source during deployment.
