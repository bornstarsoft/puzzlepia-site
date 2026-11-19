---
title: "Block Puzzle: Check the Whole Piece"
description: "An empty starting cell can still lead to an overlap. Compare two Corner placements on the real Daily Block Puzzle board, then replay with one piece moved."
date: 2026-11-19T09:59:22+09:00
draft: false
difficulty: "Easy"
puzzleType: "Block puzzle"
kicker: "Daily Challenge"
challenge: true
weight: 126
---

The **Corner** has one block on top and two below it, extending to the right. When you choose a start, all three cells must be empty and inside the board. The piece cannot rotate. In these diagrams, X means occupied and a dot means empty.

## Round 1: Two empty starting cells

Line 3 starts at **row 3, column 1**. Square starts at **row 1, column 1**. Compare starting the Corner at **row 2, column 3** and **row 2, column 4**. Both starting cells are empty. Which place fits the whole piece?

{{< block-starter-example caption="Round 1: Line 3 occupies row 3." occupied="1,1 1,2 2,1 2,2 3,1 3,2 3,3" >}}

{{< puzzle-reveal title="Show the Round 1 hint" >}}
For each start, check the two squares the Corner would use in row 3. Is either of those squares already taken?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 1 answer" >}}
**Start at row 2, column 4.** The two lower blocks land at row 3, columns 4 and 5. Starting at row 2, column 3 would also use **row 3, column 3**, where Line 3 already sits.

Try the blocked start in the game, then tap the valid start. The failed move leaves the Corner selected and the other pieces in place. You do not need to reset or reselect the piece.
{{< /puzzle-reveal >}}

[Keep Round 2 for next time](#round-2-move-the-line-down), or change just one placement for a second round.

## Round 2: Move the line down

Start fresh. Leave Square in the same place and put Line 3 at **row 4, column 1** instead. Can the Corner now start at **row 2, column 3**, the spot blocked in Round 1?

{{< block-starter-example caption="Round 2: Line 3 occupies row 4." occupied="1,1 1,2 2,1 2,2 4,1 4,2 4,3" >}}

{{< puzzle-reveal title="Show the Round 2 hint" >}}
The Corner starting in row 2 reaches only as far down as row 3. Check which squares in that row are empty now.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 2 answer" >}}
**Row 2, column 3 now fits.** The Corner covers that cell and **row 3, columns 3 and 4**. Line 3 is in row 4, leaving both lower squares clear. The other start from Round 1 still fits too.
{{< /puzzle-reveal >}}

## Try both rounds in the game

[Play Daily Block Puzzle](/daily/block-puzzle/). It starts empty, so place Line 3 and Square from the chosen diagram first. Check both starts, then complete the three-piece tray. Reset before trying the other arrangement.

For another break, try [Three Pieces in Two Rows](/daily/challenges/block-puzzle-two-rows/) or revisit [Block Puzzle Space Management Tips](/blog/block-puzzle-space-management/).
