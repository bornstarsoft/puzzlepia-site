---
title: "A Domino Before the Square"
description: "Compare two legal domino placements on a small board. Find which one leaves room for the square, with an optional hint and checked explanation."
date: 2026-10-23T01:47:00+09:00
draft: false
difficulty: "Normal"
puzzleType: "Block puzzle"
relatedGame: "Blockzzle"
kicker: "Daily Challenge"
challenge: true
weight: 108
---

**Block practice: 2 of 3.** Start with [Find the Only Square Space](/daily/challenges/find-the-square-space/) for a one-piece warmup, or try this round on its own.

## Two legal moves, different results

Place a **two-cell domino first**, then a **2x2 square**. Compare these two choices:

- **Across:** the domino covers **A1 and B1**.
- **Down:** the domino covers **D1 and D2**.

Both domino placements fit at the start. Which one leaves room for the square?

Columns are A to D; rows are 1 to 4. **X** means occupied, and a **dot** means empty. Pieces cannot overlap or extend outside the board. Nothing moves or clears. For this fixed exercise, you may choose the domino's horizontal or vertical orientation; do not assume other games allow rotation.

{{< block-practice-board id="domino" >}}

{{< puzzle-reveal title="Show a small hint" >}}
Find the square's four cells before deciding where to put the domino. Does either domino choice use a cell that the square needs?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Answer: keep the square space intact" >}}
Choose **Down: D1 and D2**. The square can then occupy **A1, B1, A2, and B2**, with its top-left corner at **A1**.

The Across choice uses A1 and B1, so it breaks that square space. No other 2x2 opening exists. In rows 2 and 3, A3 blocks the left square and C2 blocks the other starts. Rows 3 and 4 have no complete 2x2 opening either.

The useful question is not just "Does this piece fit?" It is also "Where will the next piece fit?" A legal first move can still leave no place for the second piece.
{{< /puzzle-reveal >}}

## Your next small round

[Try round 3: Open Board Block Challenge](/daily/challenges/open-board-block-challenge/), where three pieces share one board. You can stop here and bookmark that next round for another break; these are fixed exercises, with no streak or progress tracking.

For hands-on placement, [play Daily Block Puzzle](/daily/block-puzzle/). Its starter board and pieces are separate from this example. Read the [space management guide](/blog/block-puzzle-space-management/) for more context, or visit [Blockzzle](/games/blockzzle/) for the separate browser game.
