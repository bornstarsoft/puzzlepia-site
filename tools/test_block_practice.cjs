"use strict";

// Validate the fixed teaching diagrams, not the live game's placement engine.
const assert = require("node:assert/strict");
const boards = require("../data/block_practice.json");
const original = JSON.stringify(boards);

for (const board of Object.values(boards)) {
  assert.equal(board.rows.length, 4);
  board.rows.forEach(row => {
    assert.equal(row.length, 4);
    assert.ok(row.every(cell => cell === 0 || cell === 1));
  });
  for (const piece of Object.values(board.pieces)) {
    assert.ok(piece.length > 0);
    assert.equal(new Set(piece.map(cell => cell.join(","))).size, piece.length);
    piece.forEach(cell => assert.ok(cell.length === 2 && cell.every(n => Number.isInteger(n) && n >= 0)));
  }
}

function place(rows, shape, row, col) {
  const cells = shape.map(([r, c]) => [row + r, col + c]);
  if (cells.some(([r, c]) => r < 0 || r >= 4 || c < 0 || c >= 4 || rows[r][c] !== 0)) return null;
  const next = rows.map(r => r.slice());
  cells.forEach(([r, c]) => { next[r][c] = 1; });
  return next;
}

function starts(rows, shape) {
  const result = [];
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    if (place(rows, shape, row, col)) result.push([row, col]);
  }
  return result;
}

function solve(rows, names, pieces) {
  if (!names.length) return [{}];
  const [name, ...rest] = names;
  return starts(rows, pieces[name]).flatMap(([row, col]) =>
    solve(place(rows, pieces[name], row, col), rest, pieces)
      .map(solution => ({ [name]: [row, col], ...solution })));
}

const domino = boards.domino;
assert.deepEqual(starts(domino.rows, domino.pieces.square), [[0, 0]], "only A1 holds a square");
const across = place(domino.rows, domino.pieces.horizontal, 0, 0);
const down = place(domino.rows, domino.pieces.vertical, 0, 3);
assert.ok(across && down, "both compared domino placements are initially legal");
assert.deepEqual(starts(across, domino.pieces.square), [], "A1/B1 blocks the square");
assert.deepEqual(starts(down, domino.pieces.square), [[0, 0]], "D1/D2 preserves A1/B1/A2/B2");
assert.equal(place(domino.rows, domino.pieces.square, -1, 0), null);
assert.equal(place(domino.rows, domino.pieces.horizontal, 0, 3), null);
assert.equal(place(domino.rows, domino.pieces.vertical, 1, 3), null);

const tray = boards.tray;
assert.deepEqual(starts(tray.rows, tray.pieces.line), [[0, 0]]);
assert.deepEqual(starts(tray.rows, tray.pieces.square), [[2, 1]]);
const expected = { line: [0, 0], square: [2, 1], single: [1, 3] };
const orders = [
  ["line", "square", "single"], ["line", "single", "square"],
  ["square", "line", "single"], ["square", "single", "line"],
  ["single", "line", "square"], ["single", "square", "line"]
];
for (const order of orders) {
  assert.deepEqual(solve(tray.rows, order, tray.pieces), [expected], "one packing for each placement order");
  let rows = tray.rows;
  order.forEach(name => { rows = place(rows, tray.pieces[name], ...expected[name]); });
  assert.ok(rows.flat().every(cell => cell === 1), "all eight empty cells are covered");
}
let successfulFirstSingles = 0;
for (const [row, col] of starts(tray.rows, tray.pieces.single)) {
  const solutions = solve(place(tray.rows, tray.pieces.single, row, col), ["line", "square"], tray.pieces);
  if (solutions.length) {
    successfulFirstSingles++;
    assert.deepEqual([row, col], [1, 3], "only D2 works when the single goes first");
  }
}
assert.equal(successfulFirstSingles, 1);
assert.equal(solve(place(tray.rows, tray.pieces.single, 0, 0), ["line", "square"], tray.pieces).length, 0);
assert.equal(JSON.stringify(boards), original, "validation must not mutate source data");
console.log("Block practice passed: two checked boards, both domino choices, unique tray packing in all six orders, all eight single-first choices, bounds/overlap and immutable data.");
