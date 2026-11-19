---
title: "Mini Tile Flips: Turn Every Tile Off"
description: "Solve two short tile-flip puzzles. Each move toggles one tile and its neighbors. Keep the middle dark, then find the fewest flips."
date: 2026-11-19T11:09:59+09:00
draft: false
difficulty: "Normal"
puzzleType: "Toggle logic"
kicker: "Daily Challenge"
challenge: true
weight: 134
---

Turn every tile off. A flip changes the tile you choose **and its immediate neighbors**: ON becomes OFF, and OFF becomes ON. An end tile has only one neighbor. Number the tiles from left to right, starting at 1.

This is a paper or mental puzzle, not a tap board. Each round starts fresh. Choose each tile at most once per round; choosing it twice would undo its effect.

## Round 1: Keep the middle off

Starting row: `ON | ON | OFF | ON | ON`

Which tiles should you choose to turn the whole row off without ever turning tile 3 on?

{{< puzzle-reveal title="Show the Round 1 hint" >}}
Which choices would change tile 3? Rule those out before you try any flips.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 1 solution" >}}
Choose tiles **1 and 5**. Tile 1 turns off the left pair, and tile 5 turns off the right pair. Choosing 2, 3, or 4 would change the middle tile, so only the end choices are allowed. You can choose the two ends in either order.
{{< /puzzle-reveal >}}

[Keep Round 2 for next time](#round-2-find-the-fewest-flips), or try the longer row now.

## Round 2: Find the fewest flips

Starting row: `ON | OFF | OFF | OFF | ON | ON`

What's the fewest flips that turn every tile off, and which tiles do you choose? This time, any tile may turn on in the middle of your solution.

{{< puzzle-reveal title="Show the Round 2 hint" >}}
Compare tiles 5 and 6. Both start on, so both need an odd number of changes. Choosing 5 or 6 changes both, but choosing 4 changes only tile 5. What does that tell you about choosing 4?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 2 solution" >}}
Choose tiles **2, 3, and 5**, for three flips.

Tiles 5 and 6 both need to change. Since choosing 4 affects only tile 5 of that pair, leave 4 unchosen. Tiles 1 and 2 start differently. Since choosing 3 affects only tile 2 of that pair, choose 3. Tile 3 started off, so after changing it once by choosing 3, choose 2 to change it back. Tile 4 started off too: choosing 5 reverses the change to it from choosing 3.

Those three choices are all necessary. Together, their effects leave every tile off, so three is the minimum.
{{< /puzzle-reveal >}}

[Browse more mini puzzles](/daily/mini-puzzles/#numbers-and-logic), or [play Color Match](/daily/color-match/) for a different kind of pattern puzzle.
