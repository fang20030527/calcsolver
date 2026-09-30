export type Direction = 'left' | 'right' | 'up' | 'down';

/** Slide and merge a board without adding a random tile or changing the input. */
export function moveBoard(board: number[][], direction: Direction): {
  board: number[][];
  score: number;
  changed: boolean;
} {
  const next = board.map((row) => [...row]);
  const height = board.length;
  const width = board[0]?.length ?? 0;
  const vertical = direction === 'up' || direction === 'down';
  const backwards = direction === 'right' || direction === 'down';
  const lineCount = vertical ? width : height;
  const lineLength = vertical ? height : width;
  let score = 0;

  const position = (line: number, offset: number): [number, number] => {
    const index = backwards ? lineLength - offset - 1 : offset;
    return vertical ? [index, line] : [line, index];
  };

  for (let line = 0; line < lineCount; line++) {
    const values: number[] = [];
    for (let offset = 0; offset < lineLength; offset++) {
      const [row, column] = position(line, offset);
      if (board[row][column] !== 0) values.push(board[row][column]);
    }

    const merged: number[] = [];
    for (let index = 0; index < values.length; index++) {
      if (values[index] === values[index + 1]) {
        const value = values[index] * 2;
        merged.push(value);
        score += value;
        index++;
      } else {
        merged.push(values[index]);
      }
    }
    while (merged.length < lineLength) merged.push(0);

    for (let offset = 0; offset < lineLength; offset++) {
      const [row, column] = position(line, offset);
      next[row][column] = merged[offset];
    }
  }

  const changed = board.some((row, rowIndex) =>
    row.some((value, column) => next[rowIndex][column] !== value),
  );
  return { board: next, score, changed };
}

/** A full board is playable only while a neighboring pair can still merge. */
export function hasMoves(board: number[][]): boolean {
  for (let row = 0; row < board.length; row++) {
    for (let column = 0; column < board[row].length; column++) {
      const value = board[row][column];
      if (value === 0) return true;
      if (column + 1 < board[row].length && value === board[row][column + 1]) return true;
      if (row + 1 < board.length && value === board[row + 1][column]) return true;
    }
  }
  return false;
}
