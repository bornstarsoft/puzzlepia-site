---
title: "Sudoku: Find the Only Place in a Box"
description: "Use crossing clues to find the only place for 1 in a 4x4 Sudoku box. Then finish the top row, with optional hints and a checked solution."
date: 2026-11-19T09:18:44+09:00
draft: false
difficulty: "Normal"
puzzleType: "Number puzzle"
kicker: "Daily Challenge"
challenge: true
weight: 123
---

Play on paper or in your head. In this 4x4 Sudoku, use **1, 2, 3 and 4 once in each row, column and thick-bordered 2x2 box**. Keep the printed clues where they are. Dots mark empty cells, and a label like B1 means column B, row 1.

## Round 1: Find the only place for 1

The upper-left box still needs a **1**. Of its three empty cells, which one can hold it? Look for existing 1s outside the box that rule out positions inside it.

{{< sudoku-practice-board id="only-place-in-box" hide-target="true" >}}

{{< puzzle-reveal title="Show the Round 1 hint" >}}
The 1 at B3 reaches up column B. The 1 at C2 reaches left along row 2. Which empty cells in the upper-left box do those clues rule out?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 1 answer" >}}
**A1 is 1.** B1 cannot be 1 because B3 is already 1 in its column. A2 cannot be 1 because C2 is already 1 in its row. B2 is a fixed 4. That leaves A1 as the only place for 1 in the upper-left box.

Looking at A1 alone, both 1 and 3 are allowed by the starting clues. Checking where 1 can go in the whole box is what decides the move.
{{< /puzzle-reveal >}}

That's enough for one break. [Keep Round 2 for next time](#round-2-finish-the-top-row) or continue now.

## Round 2: Finish the top row

Start with your first move on the [same board](#round-1-find-the-only-place-for-1). Find the only number that works at A2. Then fill the last empty cell in the upper-left box. Can you finish the top row from there?

{{< puzzle-reveal title="Show the Round 2 hint" >}}
Row 2 already has 1 and 4. Column A already has a 2 at A3. That leaves just one digit for A2.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 2 answer" >}}
**A2 is 3.** The upper-left box now has 1, 3 and 4, leaving **B1 as 2**. The top row now reads 1, 2, blank, 4, so **C1 is 3**. Column C and the upper-right box do not contain another 3.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the full solution" >}}
Read each row from columns A through D:

1. **1, 2, 3, 4**
2. **3, 4, 1, 2**
3. **2, 1, 4, 3**
4. **4, 3, 2, 1**
{{< /puzzle-reveal >}}

Try the same search down a column with [Finish the Column Without Guessing](/daily/challenges/sudoku-finish-the-column/), or revisit [Your First Sudoku Move](/blog/sudoku-first-move-for-beginners/) to choose another practice board.
