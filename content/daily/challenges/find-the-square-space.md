---
title: "Find the Only Square Space"
description: "Find the single place where a 2x2 block fits on a small illustrated board, then check the exact four cells."
date: 2026-09-12T08:54:35+09:00
draft: false
difficulty: "Easy"
puzzleType: "Block puzzle"
relatedGame: "Blockzzle"
kicker: "Daily Challenge"
challenge: true
weight: 101
---

## Puzzle prompt

Place one **2x2 square** on this 4x4 board. It must cover four empty cells without overlap or extending outside the board. Purple cells are occupied; white cells are empty. Nothing moves or clears in this exercise.

Columns are A to D and rows are 1 to 4. What is the **top-left cell** of the only valid placement?

{{< figure src="/images/guides/block-square-challenge.svg" width="480" height="480" alt="Four-by-four block board. Occupied cells: B1, C1, D1, A2, D2, A3, B4, D4. All other cells are empty." caption="Look for two adjacent rows with two adjacent empty columns in common." >}}

{{< puzzle-reveal title="Hint" >}}

Start with rows 2 and 3. They both have empty cells in columns B and C. A square needs a complete 2x2 area, not four empty cells scattered across the board.

{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Answer and explanation" >}}

The top-left cell is **B2**. The square covers **B2, C2, B3, and C3**.

Rows 1 and 2 cannot hold it because row 1 has no adjacent empty pair. In rows 2 and 3, starting at A overlaps A2 and A3, while starting at C overlaps D2. Rows 3 and 4 cannot hold it because row 4 has no adjacent empty pair. B2 is the only valid start.

{{< /puzzle-reveal >}}

## Play next

Try [Daily Block Puzzle](/daily/block-puzzle/) to place a full tray. The [space management guide](/blog/block-puzzle-space-management/) compares two moves that leave different options. For the separate browser game, visit [Blockzzle](/games/blockzzle/) or [play Blockzzle online](https://blockzzle.com/play/).
