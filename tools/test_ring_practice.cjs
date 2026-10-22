"use strict";

// Test the static teaching examples, not the live game's placement engine.
const assert = require("node:assert/strict");
const boards = require("../data/ring_practice.json");
const original = JSON.stringify(boards);
const sizes = ["small", "medium", "large"];
const colors = ["pink", "mint", "gold", "purple"];

function place(cells, piece, id) {
  const target = cells.find(cell => cell.id === id);
  if (!target || !sizes.includes(piece.size) || target[piece.size]) return null;
  return cells.map(cell => cell.id === id ? { ...cell, [piece.size]: piece.color } : { ...cell });
}

function solve(cells, pieces) {
  if (!pieces.length) return [{}];
  const [piece, ...rest] = pieces;
  return cells.flatMap(cell => {
    const next = place(cells, piece, cell.id);
    return next ? solve(next, rest).map(answer => ({ [piece.id]: cell.id, ...answer })) : [];
  });
}

function orders(items) {
  if (!items.length) return [[]];
  return items.flatMap((item, index) => orders(items.filter((_, i) => i !== index)).map(rest => [item, ...rest]));
}

function normalize(answers) {
  return answers.map(answer => Object.keys(answer).sort().map(k => k + ":" + answer[k]).join(",")).sort();
}

for (const [id, board] of Object.entries(boards)) {
  assert.ok(board.cells.length > 0 && board.cells.length <= 3);
  assert.equal(new Set(board.cells.map(cell => cell.id)).size, board.cells.length);
  board.cells.forEach(cell => sizes.forEach(size => assert.ok(cell[size] === "" || colors.includes(cell[size]))));
  assert.equal(new Set(board.tray.map(piece => piece.id)).size, board.tray.length);
  board.tray.forEach(piece => { assert.ok(sizes.includes(piece.size)); assert.ok(colors.includes(piece.color)); });
  const expected = id === "one-cell" ? [{ "medium-gold": "A" }] : id === "three-spaces" ?
    [{ "small-gold": "C", "medium-pink": "A", "large-mint": "B" }] :
    [{ "small-pink": "A", "medium-mint": "A" }, { "small-pink": "A", "medium-mint": "B" }];
  for (const tray of orders(board.tray)) {
    assert.deepEqual(normalize(solve(board.cells, tray)), normalize(expected), id + " assignments in every tray order");
    for (const answer of expected) {
      let cells = board.cells;
      tray.forEach(piece => { cells = place(cells, piece, answer[piece.id]); assert.ok(cells); });
      for (const before of board.cells) for (const size of sizes) if (before[size]) {
        assert.equal(cells.find(cell => cell.id === before.id)[size], before[size], "starting rings stay fixed");
      }
    }
  }
  assert.equal(place(board.cells, board.tray[0], "missing"), null);
}

const single = boards["one-cell"];
for (const color of colors) {
  assert.equal(place(single.cells, { size: "small", color }, "A"), null, "a different color cannot reuse small");
}
const filled = place(single.cells, single.tray[0], "A");
for (const size of sizes) assert.equal(place(filled, { size, color: "purple" }, "A"), null, "full cell accepts no size");
const shared = boards["shared-cell"];
const mediumFirst = place(shared.cells, shared.tray[1], "A");
assert.ok(place(mediumFirst, shared.tray[0], "A"), "medium does not block small in A");
assert.equal(place(shared.cells, shared.tray[1], "C"), null, "C already has medium");
assert.equal(place(shared.cells, shared.tray[0], "B"), null, "B already has small");
const recolored = shared.tray.map(piece => ({ ...piece, color: "gold" }));
assert.deepEqual(normalize(solve(shared.cells, recolored)), normalize(solve(shared.cells, shared.tray)), "color does not change placement");
assert.equal(JSON.stringify(boards), original, "checks do not mutate the source");
console.log("Ring practice passed: three boards, all nine tray orders, unique and two-answer assignments, fixed rings, duplicate-size rejection, color independence and immutable data.");
