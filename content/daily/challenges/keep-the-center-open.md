---
title: "Block Placement: Keep the Center Open"
description: "Compare an edge move and an inside move on two 4x4 block boards. Count how many places remain for a 2x2 square, then check the answer."
date: 2026-07-25
lastmod: 2026-11-18T21:26:00+09:00
draft: false
difficulty: "Normal"
puzzleType: "Block puzzle"
relatedGame: "Blockzzle"
kicker: "Daily challenge"
challenge: true
weight: 320
---

Both boards have the same number of empty cells. Do they leave the same number of places for the next piece?

## Count the square placements

A horizontal **Line 3** has already been placed. Work out how many ways **one 2x2 square** can fit on each board. Count distinct starting positions, not squares placed at the same time.

A start is the square's top-left cell. It needs that cell, the cell to its right, and both cells below them to be empty. Columns run from A to D; rows run from 1 to 4. An **X** marks an occupied cell and a dot marks an empty one. Nothing clears in these examples.

{{< block-practice-board id="edge-line" >}}

{{< block-practice-board id="inner-line" >}}

{{< puzzle-reveal title="Show a small hint" >}}
Start with A3, B3 and C3. Does each of those starts work on both boards? Then check which starts on rows 1 and 2 use cells occupied by the line.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the counts and starting cells" >}}
**Board A has 6 starts:** A2, B2, C2, A3, B3 and C3. The line blocks every start on row 1, but rows 2 through 4 are clear.

**Board B has 3 starts:** A3, B3 and C3. A square starting in row 1 or 2 would use part of the occupied second row. The empty cell at D2 is not wide enough to help.

Both boards have 13 empty cells. What matters here is how many 2x2 shapes fit, not just how many cells are empty. The edge gives more options on this board for this next piece; it is not a rule for every board.
{{< /puzzle-reveal >}}

## Play next

[Try Daily Block Puzzle](/daily/block-puzzle/) on its larger 6x6 board. Place Line 3 at row 1, column 1, then Square at row 3, column 1 and Corner at row 5, column 5. Reset and move only the Line 3 start to row 2, column 1. Both runs can finish; the 4x4 counts above apply to the reading boards only.

Keep [A Domino Before the Square](/daily/challenges/domino-before-the-square/) for another break. This time one first move leaves no room at all for the next piece. The [space management guide](/blog/block-puzzle-space-management/) connects more examples.

Explore [Blockzzle](/games/blockzzle/) or [play Blockzzle online](https://blockzzle.com/play/) for the separate browser game.
