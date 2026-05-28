#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'check_site.sh: %s\n' "$1" >&2
  exit 1
}

if [[ ! -f "hugo.toml" || ! -d ".git" || ! -d "content" || ! -d "layouts" ]]; then
  fail "run this script from the Puzzlepia repository root."
fi

printf '==> Building Hugo site\n'
hugo

printf '==> Checking generated output\n'
[[ -f "public/index.html" ]] || fail "public/index.html was not generated."
[[ -f "public/sitemap.xml" ]] || fail "public/sitemap.xml was not generated."
[[ -f "public/robots.txt" ]] || fail "public/robots.txt was not generated."

if ! grep -Fq "Sitemap: https://puzzlepia.com/sitemap.xml" "public/robots.txt"; then
  fail "public/robots.txt is missing the Puzzlepia sitemap URL."
fi

required_pages=(
  "public/index.html"
  "public/daily/index.html"
  "public/games/index.html"
  "public/blog/index.html"
  "public/about/index.html"
  "public/contact/index.html"
  "public/privacy/index.html"
  "public/terms/index.html"
)

for page in "${required_pages[@]}"; do
  [[ -f "$page" ]] || fail "required generated page is missing: $page"
done

printf '==> Checking that public/ is untracked\n'
if [[ -n "$(git ls-files public)" ]]; then
  git ls-files public >&2
  fail "public/ contains tracked files. Remove generated output from Git tracking."
fi

printf '==> Checking whitespace\n'
git diff --check

printf '==> Puzzlepia local site checks passed\n'
