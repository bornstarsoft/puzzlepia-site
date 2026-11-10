---
title: "Sudoku: Find the Only Place for 1"
description: "Find where 1 must go in the top row of a 4x4 Sudoku, even when that cell has two candidates. Check the hint or reveal the full solution."
date: 2026-11-10T21:00:00+09:00
draft: false
difficulty: "Normal"
puzzleType: "Number puzzle"
kicker: "Daily Challenge"
challenge: true
weight: 110
---

**Sudoku practice: 3 of 3.** Try this on its own, or start with [One Certain Sudoku Number](/daily/challenges/one-certain-sudoku-number/).

## Where can 1 go?

Use **1, 2, 3 and 4 once in each row, column and 2x2 box**. The printed numbers stay fixed. The dots and question mark are empty cells.

In the top row, **A1** can hold either 1 or 3 when you check that cell alone. Instead of choosing between them, ask where **1** can go across the entire row. Check A1, B1 and C1.

{{< sudoku-practice-board id="only-place-in-row" >}}

{{< puzzle-reveal title="Show a small hint" >}}
Look down columns B and C. Does either column already contain a 1?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the first move" >}}
**A1 is 1.** B1 cannot be 1 because B3 is already 1. C1 cannot be 1 because C2 is already 1. D1 is fixed at 4. A1 is therefore the only place for 1 in the top row, and it does not repeat a 1 in column A or the upper-left box.

This is called a **hidden single**: the cell allows more than one digit when checked on its own, but one of those digits has nowhere else to go in its row.
{{< /puzzle-reveal >}}

## Continue on paper

Finding A1 finishes the short question. To solve the whole fixed board, keep going on paper. After placing 1 at A1, check column A for the one number still missing.

{{< puzzle-reveal title="Show the full solution" >}}
Read each row from columns A through D:

1. **1, 2, 3, 4**
2. **3, 4, 1, 2**
3. **2, 1, 4, 3**
4. **4, 3, 2, 1**

After A1, column A needs 3 at A2. That leaves 2 at D2, the only empty cell in row 2. The completed board keeps all six starting clues and has one solution.
{{< /puzzle-reveal >}}

For a later break, compare [Let the Sudoku Box Decide](/daily/challenges/let-the-sudoku-box-decide/), where a box rules out a candidate, or return to [Your First Sudoku Move](/blog/sudoku-first-move-for-beginners/) for all three rounds.
