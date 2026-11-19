---
title: "Mini Sum Grids: Fill the Missing Numbers"
description: "Fill two 3x3 number grids using 1 through 9 once per grid. Match the row and column totals, with optional hints and worked solutions."
date: 2026-11-19T10:12:15+09:00
draft: false
difficulty: "Normal"
puzzleType: "Number puzzle"
kicker: "Daily Challenge"
challenge: true
weight: 127
---

Fill the nine squares in columns **A to C** with the digits **1 to 9**, using each digit once per grid. Keep the printed digits where they are. Dots are blanks. The numbers at the right and bottom are clues: they give the totals for each row and column, and are not squares to fill.

Solve on paper or in your head. Each grid is separate and has one solution.

## Round 1: One blank to start

Which digit completes the top row? After placing it, look down the columns for lines with just one blank.

{{< sum-grid id="one-blank" >}}

{{< puzzle-reveal title="Show the Round 1 hint" >}}
Row 1 needs a total of 13. Add 2 and 7, then subtract that sum from 13. Try the same approach for the first two columns.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 1 solution" >}}
The top row needs **4** in column C, because 13 minus 2 minus 7 is 4. Column A requires **9** in row 2, and column B requires **3** in row 3. Those two rows now have one blank each: row 2 needs 5, and row 3 needs 8.

The finished rows, left to right:

1. **2, 7, 4**
2. **9, 1, 5**
3. **6, 3, 8**

Check column C: 4 + 5 + 8 = 17.
{{< /puzzle-reveal >}}

[Keep Round 2 for next time](#round-2-two-blanks-in-every-line), or try it now.

## Round 2: Two blanks in every line

No row or column has just one blank. Start with the two missing digits in row 1. Can column B tell you which of those digits goes on the left?

{{< sum-grid id="two-blanks" >}}

{{< puzzle-reveal title="Show the Round 2 hint" >}}
Row 1 has a 4 and needs a total of 7. The two blanks must add up to 3. Column B has a 5 and needs a total of 13. Its two blanks must add up to 8. Test the row 1 digits against both clues.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 2 solution" >}}
The two blanks in row 1 must be **1 and 2**. Column B needs 8 more. If the top blank in that column were 2, the bottom one would need another 6, but the grid already has a 6. Use **1** at the top of column B instead, and **7** at the bottom.

Row 1 now ends with 2. Row 3 needs 3 at the left, since 16 minus 7 minus 6 is 3. That leaves 8 at the middle of column A and 9 at the end of row 2.

The finished rows, left to right:

1. **4, 1, 2**
2. **8, 5, 9**
3. **3, 7, 6**
{{< /puzzle-reveal >}}

For another break, try [two number patterns](/daily/challenges/daily-puzzle-warmup/) or [play Make 10](/daily/number-pairs/), where you add pairs instead of entire rows. The [number warmups guide](/blog/number-puzzle-warmups-for-casual-players/) has more short exercises.
