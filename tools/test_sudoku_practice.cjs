"use strict";

// Test-only exhaustive checks for the small static teaching boards.
const assert = require("node:assert/strict");
const boards = require("../data/sudoku_practice.json");
const original = JSON.stringify(boards);
const digits = [1, 2, 3, 4];
const solution = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
const columnSolution = [[3, 4, 2, 1], [2, 1, 3, 4], [4, 3, 1, 2], [1, 2, 4, 3]];

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
  const expected = id === "finish-column" ? columnSolution : solution;
  assert.deepEqual(solutions(board.rows), [expected], id + " has exactly the published solution");
  if (!["only-place-in-row", "finish-column", "only-place-in-box"].includes(id)) {
    assert.deepEqual(candidates(board.rows, r, c), [board.answer], id + " target is immediately certain");
  }
  board.rows.forEach((row, r) => row.forEach((n, c) => {
    if (n) assert.equal(expected[r][c], n, id + " preserves every clue");
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
const rowBoard = boards["only-place-in-row"].rows;
assert.deepEqual(candidates(rowBoard, 0, 0), [1, 3], "A1 alone allows two digits");
assert.deepEqual(rowBoard[0].flatMap((value, col) => !value && candidates(rowBoard, 0, col).includes(1) ? [col] : []), [0],
  "1 has only one position in the row");
assert.equal(rowBoard[2][1], 1, "B3 rules out 1 at B1");
assert.equal(rowBoard[1][2], 1, "C2 rules out 1 at C1");
const placed = rowBoard.map(r => r.slice());
placed[0][0] = 1;
assert.deepEqual(candidates(placed, 1, 0), [3], "A2 is certain next");
placed[1][0] = 3;
assert.deepEqual(candidates(placed, 1, 3), [2], "D2 finishes row 2");
const column = boards["finish-column"];
assert.deepEqual(column.target, [2, 2]);
assert.deepEqual(candidates(column.rows, 2, 2), [1, 4], "C3 alone allows two digits");
assert.deepEqual(column.rows.flatMap((row, r) => !row[2] && candidates(column.rows, r, 2).includes(1) ? [r] : []),
  [2], "only C3 can take 1 in column C");
assert.equal(column.rows[0][3], 1, "D1 eliminates C2 in the box");
assert.equal(column.rows[3][0], 1, "A4 eliminates C4 in its row");
const continued = column.rows.map(row => row.slice());
continued[2][2] = column.answer;
assert.deepEqual(candidates(continued, 1, 2), [3], "the box fixes C2");
continued[1][2] = 3;
assert.deepEqual(candidates(continued, 3, 2), [4], "C4 finishes the column");
continued[3][2] = 4;
assert.deepEqual(candidates(continued, 0, 1), [4], "the top row now needs 4 at B1");

const boxScan = boards["only-place-in-box"];
const upperLeft = [[0, 0], [0, 1], [1, 0], [1, 1]];
assert.deepEqual(candidates(boxScan.rows, 0, 0), [1, 3], "A1 alone allows two digits");
assert.equal(boxScan.rows[2][1], 1, "B3 eliminates B1");
assert.equal(boxScan.rows[1][2], 1, "C2 eliminates A2");
assert.deepEqual(upperLeft.filter(([r, c]) =>
  !boxScan.rows[r][c] && candidates(boxScan.rows, r, c).includes(1)),
[[0, 0]], "only A1 can take 1 in the box");
const boxReplay = boxScan.rows.map(row => row.slice());
boxReplay[0][0] = boxScan.answer;
for (const [r, c, digit] of [[1, 0, 3], [0, 1, 2], [0, 2, 3]]) {
  assert.deepEqual(candidates(boxReplay, r, c), [digit], "each follow-up move is forced");
  boxReplay[r][c] = digit;
}
assert.deepEqual(boxReplay[0], solution[0], "round two completes the top row");

assert.equal(solutions(Array.from({ length: 4 }, () => [0, 0, 0, 0])).length, 2,
  "ambiguity check stops at two solutions, not one");
assert.equal(JSON.stringify(boards), original, "checks do not mutate the source");
console.log("Sudoku practice passed: six unique solutions, fixed clues, row, column and box deductions, and follow-up moves.");
