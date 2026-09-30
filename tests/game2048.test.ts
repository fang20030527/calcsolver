import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hasMoves, moveBoard } from '../src/lib/game2048.ts';

const empty = () => [0, 0, 0, 0];

describe('2048 board movement', () => {
  it('merges each tile once and totals both merged values', () => {
    const result = moveBoard([[2, 2, 2, 2], empty(), empty(), empty()], 'left');
    assert.deepEqual(result.board[0], [4, 4, 0, 0]);
    assert.equal(result.score, 8);
    assert.equal(result.changed, true);
  });

  it('does not merge a newly created tile again in the same move', () => {
    const result = moveBoard([[2, 2, 4, 0], empty(), empty(), empty()], 'left');
    assert.deepEqual(result.board[0], [4, 4, 0, 0]);
    assert.equal(result.score, 4);
  });

  it('compacts gaps before merging adjacent values', () => {
    const result = moveBoard([[2, 0, 2, 2], empty(), empty(), empty()], 'left');
    assert.deepEqual(result.board[0], [4, 2, 0, 0]);
    assert.equal(result.score, 4);
  });

  it('moves and merges toward the right edge', () => {
    const result = moveBoard([[2, 2, 2, 2], empty(), empty(), empty()], 'right');
    assert.deepEqual(result.board[0], [0, 0, 4, 4]);
    assert.equal(result.score, 8);
  });

  it('moves and merges columns upward', () => {
    const result = moveBoard([[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [4, 0, 0, 0]], 'up');
    assert.deepEqual(result.board.map((row) => row[0]), [4, 8, 0, 0]);
    assert.equal(result.score, 12);
  });

  it('moves and merges columns downward', () => {
    const result = moveBoard([[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [4, 0, 0, 0]], 'down');
    assert.deepEqual(result.board.map((row) => row[0]), [0, 0, 4, 8]);
    assert.equal(result.score, 12);
  });

  it('reports an unchanged board without awarding points', () => {
    const board = [[2, 4, 8, 16], empty(), empty(), empty()];
    const result = moveBoard(board, 'left');
    assert.deepEqual(result.board, board);
    assert.equal(result.score, 0);
    assert.equal(result.changed, false);
  });

  it('returns independent rows without mutating the input', () => {
    const board = [[0, 2, 0, 2], empty(), empty(), empty()];
    const original = structuredClone(board);
    const result = moveBoard(board, 'left');
    assert.deepEqual(board, original);
    result.board[0][0] = 1024;
    assert.deepEqual(board, original);
  });
});

describe('2048 available moves', () => {
  const fullBoard = () => [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];

  it('detects game over on a full board without matching neighbors', () => {
    assert.equal(hasMoves(fullBoard()), false);
  });

  it('recognizes an empty cell as an available move', () => {
    const board = fullBoard();
    board[3][3] = 0;
    assert.equal(hasMoves(board), true);
  });

  it('recognizes horizontal and vertical merges on a full board', () => {
    const horizontal = fullBoard();
    horizontal[0][1] = 2;
    assert.equal(hasMoves(horizontal), true);
    const vertical = fullBoard();
    vertical[1][0] = 2;
    assert.equal(hasMoves(vertical), true);
  });
});
