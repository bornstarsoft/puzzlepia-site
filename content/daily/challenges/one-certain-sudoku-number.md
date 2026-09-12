---
title: "One Certain Sudoku Number"
description: "Use a row and a column to find one certain number on a 4x4 Sudoku board, with a hint and complete checked solution."
date: 2026-09-12T08:54:35+09:00
draft: false
difficulty: "Easy"
puzzleType: "Number puzzle"
relatedGame: "DaySudoku"
kicker: "Daily Challenge"
challenge: true
weight: 103
---

## Puzzle prompt

Find the number at **D3: column D, row 3**, highlighted with a question mark. This is a small 4x4 Sudoku: every row, column, and thick-bordered 2x2 box must contain **1, 2, 3, and 4 exactly once**. Keep the printed clues fixed.

{{< figure src="/images/guides/sudoku-missing-number.svg" width="480" height="480" alt="Four-by-four Sudoku with zero meaning blank. Rows: 1 0 3 0; 0 4 0 2; 0 1 4 0; 4 0 0 1. Find D3, the last cell in row 3." caption="Find just D3 first. You can finish the other cells afterward." >}}

{{< puzzle-reveal title="Hint" >}}

Row 3 already contains 1 and 4, leaving 2 or 3 for D3. Check column D: can both candidates still fit?

{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Answer and explanation" >}}

**D3 is 3.** Row 3 is missing 2 and 3, but column D already contains a 2 at D2. That rules out 2. The lower-right box contains 4 and 1, so 3 is allowed there too.

The complete board has one solution. Rows from top to bottom are:

1. **1, 2, 3, 4**
2. **3, 4, 1, 2**
3. **2, 1, 4, 3**
4. **4, 3, 2, 1**

Check each column and 2x2 box as well as the rows. Every group contains each digit once, and every starting clue is unchanged.

{{< /puzzle-reveal >}}

## Play next

See another worked board in [Your First Sudoku Move](/blog/sudoku-first-move-for-beginners/). For a quick number-order warmup, try [Daily Number Puzzle](/daily/number-puzzle/). For a full-size daily Sudoku with a Key9 twist, [play DaySudoku](https://daysudoku.com/), a related external puzzle site. Explore other styles in [Puzzlepia Games](/games/).
