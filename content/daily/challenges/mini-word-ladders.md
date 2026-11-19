---
title: "Mini Word Ladders: Change One Letter at a Time"
description: "Try two short word ladders. Turn RAIN into HAIL, then find the shortest routes from COOL to HEAT using a fixed word bank."
date: 2026-11-19T10:26:52+09:00
draft: false
difficulty: "Easy"
puzzleType: "Word ladder"
kicker: "Daily Challenge"
challenge: true
weight: 129
---

Turn a start word into a finish word. Each move changes **exactly one letter in its current position**. Do not add, remove or rearrange letters. Every intermediate word must come from that round's word bank.

You can solve these on paper or in your head. Count each change as one move, including the move into the finish word.

## Round 1: From rain to hail

Go from `RAIN` to `HAIL` in **two moves**. Which one word goes between them?

**Word bank:** `HALL`, `HILL`, `MAIL`, `MAIN`, `RAIL`, `TAIL`.

{{< puzzle-reveal title="Show the Round 1 hint" >}}
Compare the first and last letters. The two middle letters are already the same. The intermediate word has to be one change away from both ends.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show the Round 1 solution" >}}
`RAIN` &rarr; `RAIL` &rarr; `HAIL`

Change the last letter from N to L, then change the first letter from R to H. RAIL is the only bank word that works in two moves: MAIN is one change away from RAIN, but it is two away from HAIL.
{{< /puzzle-reveal >}}

[Keep Round 2 for next time](#round-2-from-cool-to-heat), or try a longer ladder now.

## Round 2: From cool to heat

Go from `COOL` to `HEAT` in as few moves as possible. **Can you find both shortest routes?** You do not need to use every bank word.

**Word bank:** `BEAT`, `BOAT`, `COAL`, `COAT`, `COOK`, `MEAT`, `MOAT`, `POOL`.

{{< puzzle-reveal title="Show the Round 2 hint" >}}
Start at the finish. Which two bank words differ from HEAT in just their first letter? See whether you can reach either of them from COOL.
{{< /puzzle-reveal >}}

{{< puzzle-reveal title="Show both shortest routes" >}}
The shortest routes both take **five moves**:

1. `COOL` &rarr; `COAL` &rarr; `COAT` &rarr; `BOAT` &rarr; `BEAT` &rarr; `HEAT`
2. `COOL` &rarr; `COAL` &rarr; `COAT` &rarr; `MOAT` &rarr; `MEAT` &rarr; `HEAT`

Work backward to check the count: only BEAT or MEAT can lead straight to HEAT. To reach either of those, you first need BOAT or MOAT, and the only way into that pair is through COAT. From COOL, reaching COAT takes two moves through COAL. That makes five moves in all. POOL and COOK are legal first moves, but neither gives a way forward without returning to COOL.
{{< /puzzle-reveal >}}

For another break, [solve two weather clues](/daily/challenges/weather-word-search-clues/) or [play Daily Word Search](/daily/word-search/). The [beginner word games guide](/blog/daily-word-games-for-beginners/) has more short ways to practise.
