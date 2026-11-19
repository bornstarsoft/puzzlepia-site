---
title: "Mini Color Codes: Crack the Three-Color Sequence"
description: "Use exact-position and misplaced-color clues to solve two short three-color codes, with optional hints and step-by-step answers."
date: 2026-11-19T10:40:52+09:00
draft: false
difficulty: "Easy"
puzzleType: "Color logic"
kicker: "Daily Challenge"
challenge: true
weight: 131
---

The code has three slots, read from left to right. Choose three different colors from **Pink, Mint, Gold and Purple**. Use each color at most once. Both rounds use the same palette but have different answers.

Each guess gives two exact counts:

- **Right place:** the color is in the code and in the same slot as the guess.
- **Wrong place:** the color is in the code but in a different slot.

Colors that are not in the code are not counted at all. Use the clues on paper or in your head.

## Round 1: Find the missing color

- **Pink, Mint, Purple:** 0 in the right place, 2 in the wrong place.
- **Gold, Pink, Purple:** 2 in the right place, 0 in the wrong place.

Which color is not used? Once you know that, what goes in each slot?

{{< puzzle-reveal title="Show the Round 1 hint" >}}
Purple is in slot 3 in both guesses. The first clue says it cannot sit there. The second clue says that every matching color in that guess is already in the right place. What does that tell you about Purple?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 1 solution" >}}
The code is `Gold, Pink, Mint`.

Purple cannot be in slot 3 because the first guess has zero right-place matches. It cannot be anywhere else either, because the second guess has zero wrong-place matches. So the two right-place matches in the second guess must be Gold in slot 1 and Pink in slot 2. The first guess still needs two wrong-place matches. Those must be Pink and Mint, which puts Mint in the last slot.
{{< /puzzle-reveal >}}

[Keep Round 2 for next time](#round-2-put-the-colors-in-order), or try a code where all the colors are known from the first clue.

## Round 2: Put the colors in order

- **Pink, Mint, Gold:** 0 in the right place, 3 in the wrong place.
- **Gold, Purple, Mint:** 0 in the right place, 2 in the wrong place.

The first clue tells you which three colors are used. How does the second clue narrow down the order?

{{< puzzle-reveal title="Show the Round 2 hint" >}}
All three colors in the first guess must move. There are two ways to do that without repeating a color. Which order would put Gold in slot 1, where the second clue says it cannot be?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 2 solution" >}}
The code is `Mint, Gold, Pink`.

Moving every color in the first guess leaves two possible orders: Mint, Gold, Pink or Gold, Pink, Mint. The second order would put Gold and Mint in the same slots as the second guess, contradicting its zero right-place count. In the remaining order, Gold and Mint are both in the wrong place for that guess, and Purple is not used.
{{< /puzzle-reveal >}}

For another visual break, [try Mini Picture Grids](/daily/challenges/mini-picture-grids/) or [play Daily Color Match](/daily/color-match/). The [color puzzle guide](/blog/color-puzzle-strategy-basics/) has more short exercises.
