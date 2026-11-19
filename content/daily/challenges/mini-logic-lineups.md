---
title: "Mini Logic Lineups: Put the Puzzle Cards in Order"
description: "Arrange four puzzle cards, then five, using clues about which cards come before others and which must be a fixed distance apart."
date: 2026-11-19T10:48:00+09:00
draft: false
difficulty: "Easy"
puzzleType: "Order logic"
kicker: "Daily Challenge"
challenge: true
weight: 132
---

Arrange the cards from left to right, using every card once. **Before** means anywhere earlier in the lineup. **Immediately before** means directly to the left, with no card between. These are two separate reading puzzles you can solve on paper or in your head.

## Round 1: Keep two cards together

**Cards:** `Block`, `Numbers`, `Rings`, `Words`.

- Words is immediately before Numbers.
- Block is before Words.
- Rings is last.

What is the order from first to last?

{{< puzzle-reveal title="Show the Round 1 hint" >}}
Keep Words and Numbers together. Could that pair take the first two places if Block must be earlier?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 1 solution" >}}
The order is `Block, Words, Numbers, Rings`.

Rings is fourth, so Words and Numbers must take either places 1 and 2 or places 2 and 3. The pair cannot start in place 1 because there would be no place for Block to go before Words.
{{< /puzzle-reveal >}}

[Keep Round 2 for next time](#round-2-leave-one-card-between), or try a slightly longer lineup now.

## Round 2: Leave one card between

**Cards:** `Block`, `Memory`, `Numbers`, `Rings`, `Words`.

- Words is immediately before Numbers.
- Rings is exactly two places after Memory.
- Block is after Numbers.

There is always one card between Memory and Rings. Which order satisfies all three clues?

{{< puzzle-reveal title="Show the Round 2 hint" >}}
Try Memory in the second place, with Rings in the fourth. Is there anywhere left to put the Words and Numbers pair together?
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 2 solution" >}}
The order is `Words, Numbers, Memory, Block, Rings`.

- If Memory is first, Rings is third. Words and Numbers have to go fourth and fifth, putting Block second. But Block must come after Numbers.
- If Memory is second, Rings is fourth. The open places are first, third and fifth, so the pair cannot sit together.
- Memory must be third. Put Rings fifth, Words and Numbers first and second, and Block fourth.
{{< /puzzle-reveal >}}

For a different kind of deduction, [try Mini Color Codes](/daily/challenges/mini-color-codes/). For a playable break, choose one of the games in [Daily Puzzles](/daily/). The [daily puzzle habit guide](/blog/how-to-build-a-daily-puzzle-habit/) has more ways to keep a short break simple.
