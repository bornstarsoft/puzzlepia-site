"use strict";

// Test-only exhaustive checks for the small static teaching boards.
const assert = require("node:assert/strict");
const boards = require("../data/sudoku_practice.json");
const original = JSON.stringify(boards);
const digits = [1, 2, 3, 4];
const solution = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];

function candidates(rows, row, col, includeBox = true) {
  const used = new Set([...rows[row], ...rows.map(r => r[col])]);
  if (includeBox) {
    const top = Math.floor(row / 2) * 2, left = Math.floor(col / 2) * 2;
    for (let r = top; r < top + 2; r++) for (let c = left; c < left + 2; c++) used.add(rows[r][c]);
  }
  return digits.filter(n => !used.has(n));
}

function validClues(rows) {
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    if (!rows[row][col]) continue;
    const copy = rows.map(r => r.slice()), clue = copy[row][col];
    copy[row][col] = 0;
    if (!candidates(copy, row, col).includes(clue)) return false;
  }
  return true;
}

function solutions(rows) {
  if (!validClues(rows)) return [];
  const board = rows.map(row => row.slice()), found = [];
  function visit() {
    if (found.length === 2) return;
    let chosen, choices;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!board[r][c]) {
      const possible = candidates(board, r, c);
      if (!possible.length) return;
      if (!chosen || possible.length < choices.length) { chosen = [r, c]; choices = possible; }
    }
    if (!chosen) { found.push(board.map(row => row.slice())); return; }
    const [r, c] = chosen;
    for (const value of choices) { board[r][c] = value; visit(); }
    board[r][c] = 0;
  }
  visit();
  return found;
}

for (const [id, board] of Object.entries(boards)) {
  assert.equal(board.rows.length, 4);
  board.rows.forEach(row => {
    assert.equal(row.length, 4);
    assert.ok(row.every(n => Number.isInteger(n) && n >= 0 && n <= 4));
  });
  assert.equal(board.target.length, 2);
  assert.ok(board.target.every(n => Number.isInteger(n) && n >= 0 && n < 4));
  const [r, c] = board.target;
  assert.equal(board.rows[r][c], 0, id + " target must be empty");
  assert.ok(validClues(board.rows), id + " starting clues must not conflict");
  assert.deepEqual(solutions(board.rows), [solution], id + " has exactly the published solution");
  assert.deepEqual(candidates(board.rows, r, c), [board.answer], id + " target is immediately certain");
  board.rows.forEach((row, r) => row.forEach((n, c) => {
    if (n) assert.equal(solution[r][c], n, id + " preserves every clue");
  }));
}

const box = boards["box-decides"].rows;
assert.deepEqual(candidates(box, 0, 1, false), [2, 3], "row/column alone leave two choices");
assert.equal(box[1][0], 3, "A2 removes 3 from B1's box");
assert.deepEqual(candidates(box, 0, 1), [2], "box decides B1");
const after = box.map(r => r.slice());
after[0][1] = 2;
assert.deepEqual(candidates(after, 0, 2), [3], "C1 follows without guessing");
const wrong = box.map(r => r.slice());
wrong[0][1] = 3;
assert.equal(validClues(wrong), false, "wrong candidate repeats 3 in its box");
assert.deepEqual(solutions(wrong), [], "conflicting board is rejected");
assert.equal(solutions(Array.from({ length: 4 }, () => [0, 0, 0, 0])).length, 2,
  "ambiguity check stops at two solutions, not one");
assert.equal(JSON.stringify(boards), original, "checks do not mutate the source");
console.log("Sudoku practice passed: three unique solutions, fixed clues and targets, box-only deduction, next move, conflict/ambiguity checks and immutable data.");
