---
title: "Let the Sudoku Box Decide"
description: "Two candidates fit a Sudoku cell's row and column. Use its 2x2 box to find the certain number, with an optional hint and complete checked solution."
date: 2026-10-23T02:06:00+09:00
draft: false
difficulty: "Easy"
puzzleType: "Number puzzle"
relatedGame: "DaySudoku"
kicker: "Daily Challenge"
challenge: true
weight: 109
---

**Sudoku practice: 2 of 2.** Try this round on its own, or warm up with [One Certain Sudoku Number](/daily/challenges/one-certain-sudoku-number/).

## Two choices are not a reason to guess

Find **B1: column B, row 1**, marked with a question mark. This small Sudoku uses **1, 2, 3, and 4 once in every row, column, and thick-bordered 2x2 box**. Keep the printed clues fixed. Dots are empty cells; the question mark is also empty.

The first row needs 2 and 3. Column B does not yet contain either number. What does the upper-left box tell you?

{{< sudoku-practice-board id="box-decides" >}}

This is a fixed, read-and-solve exercise, not an interactive game. Find just B1 first, or work out the remaining cells on paper.

{{< puzzle-reveal title="Show a small hint" >}}
The upper-left box contains A1, B1, A2, and B2. Look at A2. Would one of your two candidates repeat that clue inside the box?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Answer: check the third group" >}}
**B1 is 2.** Row 1 already has 1 and 4, leaving 2 or 3. Column B contains 1 but no 2 or 3, so it does not settle the choice.

The upper-left box contains **3 at A2**. Placing 3 at B1 would repeat it in that box. That removes 3 and leaves 2. The same box has no 2, and neither the row nor the column has a 2, so the placement is allowed by all three groups.

Now row 1 is `1, 2, blank, 4`. That makes **C1 equal to 3**. Check column C and the upper-right box before placing it: neither contains a 3. One certain answer opens the next step.

This is different from choosing whichever candidate looks likely. The box rules out one choice with a visible clue.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the complete solution" >}}
Rows from top to bottom, columns A to D:

1. **1, 2, 3, 4**
2. **3, 4, 1, 2**
3. **2, 1, 4, 3**
4. **4, 3, 2, 1**

Every starting clue stays unchanged. All rows, columns, and 2x2 boxes contain 1 to 4 exactly once. This board has one solution.
{{< /puzzle-reveal >}}

## Choose your next break

Read [Your First Sudoku Move](/blog/sudoku-first-move-for-beginners/) to revisit the three checks, or try [Daily Number Puzzle](/daily/number-puzzle/) for a number-order warmup. That playable starter asks you to tap numbers in order; it is not Sudoku.

For a full-size puzzle, [play DaySudoku](https://daysudoku.com/), a related external daily Sudoku site with a Key9 twist. Find the Key9 first, then continue the full Sudoku. This teaching board is separate from its live puzzle. Browse [Daily Puzzles](/daily/) for a different kind of short break.
