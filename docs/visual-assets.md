# Visual Discovery Assets

## Purpose

Help readers recognize a puzzle before opening it, then move between play,
worked guides, and short challenges. Existing gameplay, public URLs, external
game links, analytics, and deployment settings are unchanged.

## Asset Inventory

All paths below are relative to the repository root.

| Path | Purpose | Source |
| --- | --- | --- |
| `static/images/covers/word.jpg` | Word and K-pop word guides | Original editorial illustration |
| `static/images/covers/block.jpg` | Block puzzle guides | Original editorial illustration |
| `static/images/covers/color.jpg` | Color and ring guides | Original editorial illustration |
| `static/images/covers/number.jpg` | Number and Sudoku guides | Original editorial illustration |
| `static/images/covers/memory.jpg` | Memory matching guides | Original editorial illustration |
| `static/images/covers/daily.jpg` | General puzzle break guides | Original editorial illustration |
| `static/images/previews/word-search.png` | Word Search card | Actual board with STAR found |
| `static/images/previews/block-puzzle.png` | Block Puzzle card | Actual board with Line 3 and Square placed |
| `static/images/previews/ring-puzzle.png` | Ring Puzzle card | Actual board with the five tray rings placed |
| `static/images/previews/number-puzzle.png` | Number Puzzle card | Actual initial board |
| `static/images/previews/color-match.png` | Color Match card | Actual initial board |
| `static/images/previews/memory-pairs.png` | Memory Pairs card | Actual board with the star pair matched and one diamond revealed |
| `static/images/previews/number-pairs.png` | Make 10 card | Actual initial board |

The six covers were generated with the built-in image-generation tool, one
image per prompt. They are editorial illustrations, not screenshots of a
playable game or official app assets. The source PNGs were 1536x1024; macOS
`sips` resized them to 720x480 JPEG at quality 75. The seven board previews were
captured from the local site with Playwright element screenshots, preserving
the actual UI and dimensions. No external game assets were copied.

The entire thirteen-image collection is under 400 KiB. Images have explicit
dimensions, descriptive preview alt text, lazy loading, and asynchronous
decoding. Editorial covers have empty alt text because the adjacent linked
heading supplies their meaning. Text links remain available without images.

## Maintenance

- `data/puzzle_catalog.yaml` maps the seven playable routes to a preview,
  short goal, relevant published guide, and published challenge.
- Home quick picks and Daily game cards use `puzzle-preview.html`.
- `blog-topic.html` selects one of six editorial topics. Blog filters include
  Memory; the same topic determines related practice links and cover art.
- `guide-cover.html` and `guide-card.html` keep Blog, Home, and related guide
  listings consistent. Existing instructional SVG diagrams remain intact.
- The shared head uses Hugo minification and content fingerprints for CSS.
  Updated styles therefore get a new URL instead of depending on a visitor's
  cached `/css/main.css`. Source styles remain in `static/css/`; generated
  output is never committed.

To replace a cover, use the matching prompt below, inspect the original,
and optimize with the macOS tool already available on this machine:

```bash
sips -Z 720 -s format jpeg -s formatOptions 75 /path/to/source.png \
  --out static/images/covers/word.jpg
```

For a board preview, run the local build, play to the intended visible state,
and capture only the board element. Preserve the whole board without cropping
tiles. Update the catalog's dimensions and alt text if the state changes.
Do not generate fake game UI, official logos, screenshots, ratings, badges,
or popularity signals. External Blockzzle, Ringzzle, and DaySudoku entries
keep their existing identity and destinations.

Before committing, run `bash tools/check_site.sh`,
`node tools/test_pair_puzzles.cjs`, `hugo --gc --minify`, and
`git diff --check`. Confirm `git ls-files public resources/_gen` is empty.
Check 390, 430, 768, and 1280px widths, filters, image loading, navigation,
and game completion/reset. Test without JavaScript and with images blocked.

## Local QA: 2026-09-12

- Hugo checks, minified build with garbage collection, whitespace checks,
  and dependency-free pair puzzle state tests passed.
- Chromium: 28 page/viewport combinations passed at 390, 430, 768, and 1280px;
  all referenced images loaded, with no console errors or horizontal overflow.
- All seven games completed twice per width, with reset before and after
  completion (56 browser completions). Used emulated touch at 390/430px and
  mouse input at 768/1280px. Word Search used its word-list fallback.
- Memory filters, show-all controls, three memory search results, fourteen
  puzzle follow-up links, and keyboard skip navigation passed.
- Home, Daily, and Blog remained navigable at 390px with JavaScript disabled
  and separately with image requests blocked. No-JavaScript lists exposed all
  23 guides and 26 challenges.
- Parsed 73 local HTML files: 2,317 internal references/anchors and 71 sitemap
  destinations resolved. Existing external game link lines were unchanged.
- `public/` and `resources/_gen/` remained ignored and untracked. No Cloudflare
  API temporary JSON files were tracked.
- This is local Chromium QA, not native Safari/device testing, live traffic
  measurement, or a production deployment. GitHub publishing remains pending
  confirmation of this repository's exception to the Gitea-only policy.

## Generation Prompts

Mode: built-in image generation. No CLI or external image service was used.
These are the final prompts sent for the six covers.

### Word

Use case: stylized-concept. Create one landscape editorial cover image for Puzzlepia's WORD PUZZLE GUIDES, 1536x1024. Art direction: crisp premium casual tabletop puzzle still life, tactile matte ceramic letter tiles, almost top-down with a gentle three-quarter perspective, bright neutral white background, short soft shadows, lots of separation between objects. Show six or seven chunky ivory-white square letter tiles with simple single embossed capital letters, a few mint tiles, one rose-pink tile, a small gold star token. No words need to be spelled. Compact centered composition, subjects entirely within middle 75% so a 16:9 crop is safe; not a screenshot, not an interface. Palette balanced mint green, rose pink, deep grape purple, and small soft-gold accents. Make letters and tile edges very sharp, clean, playful but sophisticated. No people, no hands, no phones, no text captions, no logo, no watermarks, no fake badges, no gradients or bokeh blobs, no complex game board.

### Block

Use case: stylized-concept. One landscape editorial cover for Puzzlepia BLOCK PUZZLE GUIDES, 1536x1024. A bright tactile tabletop still life of exactly three distinct chunky tetromino/polyomino pieces: a mint-green L of four square cubes, a rose-pink 2x2 square block, and a grape-purple straight bar of three square cubes, with one small soft-gold square token beside them. Clean white background and gentle short contact shadows, premium matte ceramic finish with lightly beveled crisp edges, almost top-down three-quarter camera. All pieces fully visible and separate, balanced centered composition within middle 70% for safe 16:9 cropping. The actual subjects should be large and readable at thumbnail size. Editorial puzzle illustration, NOT an app screenshot, NOT a fake game board, NOT a UI. No lettering, no numbers, no logos, no watermarks, no humans, no plants, no sound icons, no decorative blobs or gradients.

### Color

Use case: stylized-concept. One landscape editorial cover for Puzzlepia COLOR AND RING PUZZLE GUIDES, 1536x1024. Bright premium casual tabletop still life of six substantial matte ceramic circular rings with clearly hollow centers, three sizes, mint green, rose pink, grape purple and soft-gold. Arrange three concentric flat rings on the left and three separate rings on the right so nested sizes are immediately understandable. Almost top-down gentle three-quarter camera, clean white background, crisp outlines, soft short contact shadows. All objects fully inside the central 70 percent for a 16:9 safe crop. Tactile smooth finish. No text, no digits, no screenshot, no app UI, no logos, no badges, no watermarks, no plants, no hands, no devices. This is a decorative editorial cover, not a solvable board or an actual Ringzzle game screenshot. No bokeh blobs or gradients.

### Number

Use case: stylized-concept. One landscape editorial cover for Puzzlepia NUMBER PUZZLE GUIDES, 1536x1024. A playful premium tabletop still life of four distinct thick matte ceramic square number tiles engraved with single digits 1, 2, 5, 9. Large readable engraved digits in deep grape, tiles in white, mint, and pink. One small gold ring beside the tiles. Arrange neatly with open white space between tiles, mostly top-down slight three-quarter perspective. Clean white background, short realistic contact shadows, tactile satin ceramic texture. Entire composition within middle 70% so a 16:9 crop preserves objects. This is an editorial number-puzzle illustration, not a Sudoku grid, equation, actual game screenshot or UI. No additional text, logos, fake rankings, watermarks, plants, people, devices, bokeh, or gradients. Four tiles only, no invented arithmetic signs.

### Memory

Use case: stylized-concept. One landscape editorial cover for Puzzlepia MEMORY MATCHING GUIDES, 1536x1024. Bright matte ceramic tabletop still life, clean white background, soft short shadows, premium casual puzzle feel. Six separate square chunky tiles laid neatly in two loose rows of three. Top row: gold star on pale pink tile, mint circle on white tile, purple diamond on pale mint tile. Bottom row: matching purple diamond on pale mint tile, matching gold star on pale pink tile, matching mint circle on white tile. Symbols are simple crisp embossed shapes, no numbers or letters. Gentle mostly overhead three-quarter perspective, all subjects centrally framed with wide margins for a safe 16:9 crop. Balanced purple, pink, mint and soft gold; no dark background. No labels, no logos, no UI, no fake game screenshots, no plants, no humans, no bokeh or gradients. Clearly an editorial matching-symbol illustration, not a screenshot of the actual playable game.

### Daily

Use case: stylized-concept. One landscape editorial cover for Puzzlepia guides about SHORT PUZZLE BREAKS, 1536x1024. Bright premium casual tabletop still life on pure soft white: one mint-green L-shaped puzzle piece, one pair of pink and purple nested circular rings, two white square tiles showing one gold star each, and a tiny gold square token. Arrange these three subject groups with generous white separation in a compact balanced central composition. Tactile matte ceramic finish, gently beveled edges, crisp detail, almost top-down mild three-quarter perspective, short soft shadows. All pieces fit in the center 70 percent for a safe 16:9 crop. It should feel inviting and quiet, not childish or busy. No lettering, numbers, UI, game screenshot, logos, humans, plants, food, clock, phone, badges, watermarks, bokeh blobs or gradients. This illustrates a choice of puzzle types, not a playable board.
