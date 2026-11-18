---
title: "Sudoku: Finish the Column Without Guessing"
description: "Use a 4x4 Sudoku column to choose between two candidates, then finish the column. Open a hint or check the full solution when ready."
date: 2026-11-18T22:54:02+09:00
draft: false
difficulty: "Normal"
puzzleType: "Number puzzle"
kicker: "Daily Challenge"
challenge: true
weight: 116
---

Complete **column C** in this 4x4 Sudoku. Use **1, 2, 3 and 4 once in each row, column and 2x2 box**. The printed numbers stay fixed; dots and the question mark are empty cells.

Start at the question mark, **C3**. When you check just that cell, both **1** and **4** are possible. Scan the entire column for places that could take 1. Can you decide what goes in C3 without guessing?

{{< sudoku-practice-board id="finish-column" >}}

{{< puzzle-reveal title="Show a small hint" >}}
Try putting 1 at C2, then C4, in your head. Check the upper-right box for C2 and the bottom row for C4.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show how to finish column C" >}}
**C3 must be 1.** C1 is fixed at 2. C2 cannot take 1 because **D1** is already 1 in the same box. C4 cannot take 1 because **A4** is already 1 in the same row. That leaves C3 as the only place for 1 in column C, even though C3 by itself allows two candidates.

Now look at the upper-right box. It contains 2, 1 and 4, so the remaining digit at **C2 is 3**. Column C is now **2, 3, 1, blank**. The last number, **C4, is 4**.
{{< /puzzle-reveal >}}

## Keep going on paper

Finishing the column completes the short challenge. To finish the whole board, try the top row next. Once you have completed column C, the top row still has just one blank, at B1.

{{< puzzle-reveal title="Show the full solution" >}}
Read each row from columns A through D:

1. **3, 4, 2, 1**
2. **2, 1, 3, 4**
3. **4, 3, 1, 2**
4. **1, 2, 4, 3**
{{< /puzzle-reveal >}}

For another break, try [Find the Only Place for 1](/daily/challenges/only-place-for-one-sudoku/) to use the same idea across a row, or return to [Your First Sudoku Move](/blog/sudoku-first-move-for-beginners/) for the earlier practice rounds.
