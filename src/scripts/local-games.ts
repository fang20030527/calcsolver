import { hasMoves, moveBoard, type Direction } from '../lib/game2048';

const directionKeys: Record<string, Direction> = {
  arrowleft: 'left', a: 'left',
  arrowright: 'right', d: 'right',
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
};

function isEditable(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(
    target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'),
  );
}

function readBest(key: string): number {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function saveBest(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Gameplay remains available when a browser disables storage.
  }
}

function bindDirections(root: HTMLElement, move: (direction: Direction) => void): void {
  root.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach((button) => {
    button.addEventListener('click', () => move(button.dataset.direction as Direction));
  });
}

function bindSwipes(board: HTMLElement, move: (direction: Direction) => void): void {
  let start: { x: number; y: number; id: number } | null = null;
  board.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    try {
      board.setPointerCapture(event.pointerId);
    } catch {
      // A canceled pointer can disappear before capture is established.
      start = null;
    }
  });
  board.addEventListener('pointerup', (event) => {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    event.preventDefault();
    event.stopPropagation();
  });
  board.addEventListener('pointercancel', () => { start = null; });
  board.addEventListener('lostpointercapture', () => { start = null; });
}

function init2048(root: HTMLElement): void {
  const grid = root.querySelector<HTMLElement>('#board-2048')!;
  const scoreLabel = root.querySelector<HTMLElement>('#score-2048')!;
  const bestLabel = root.querySelector<HTMLElement>('#best-2048')!;
  const status = root.querySelector<HTMLElement>('#status-2048')!;
  const message = root.querySelector<HTMLElement>('#message-2048')!;
  const messageTitle = root.querySelector<HTMLElement>('#message-title-2048')!;
  const messageDetail = root.querySelector<HTMLElement>('#message-detail-2048')!;
  const continueButton = root.querySelector<HTMLButtonElement>('#continue-2048')!;
  const storageKey = 'calcsolver.info.2048.best';
  let board: number[][] = [];
  let score = 0;
  let best = readBest(storageKey);
  let over = false;
  let won = false;
  let showingWin = false;

  function addTile(): void {
    const empty: [number, number][] = [];
    board.forEach((row, rowIndex) => row.forEach((value, column) => {
      if (value === 0) empty.push([rowIndex, column]);
    }));
    if (!empty.length) return;
    const [row, column] = empty[Math.floor(Math.random() * empty.length)];
    board[row][column] = Math.random() < 0.9 ? 2 : 4;
  }

  function render(): void {
    const rows = board.map((values, rowIndex) => {
      const row = document.createElement('div');
      row.className = 'tile-row';
      row.setAttribute('role', 'row');
      row.setAttribute('aria-rowindex', String(rowIndex + 1));
      values.forEach((value, column) => {
        const tile = document.createElement('div');
        tile.className = `tile ${value > 2048 ? 'tile-super' : `tile-${value}`}`;
        tile.setAttribute('role', 'gridcell');
        tile.setAttribute('aria-colindex', String(column + 1));
        tile.setAttribute('aria-label', `Row ${rowIndex + 1}, column ${column + 1}: ${value || 'empty'}`);
        if (value) tile.textContent = String(value);
        row.append(tile);
      });
      return row;
    });
    grid.replaceChildren(...rows);
    scoreLabel.textContent = String(score);
    bestLabel.textContent = String(best);
  }

  function showMessage(title: string, detail: string, canContinue: boolean): void {
    messageTitle.textContent = title;
    messageDetail.textContent = detail;
    continueButton.hidden = !canContinue;
    message.hidden = false;
    status.textContent = `${title} ${detail}`;
  }

  function restart(): void {
    board = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
    score = 0;
    over = false;
    won = false;
    showingWin = false;
    message.hidden = true;
    addTile();
    addTile();
    render();
    status.textContent = 'Join matching tiles to reach 2048.';
  }

  function move(direction: Direction): void {
    if (over || showingWin || document.hidden) return;
    const result = moveBoard(board, direction);
    if (!result.changed) return;
    board = result.board;
    score += result.score;
    if (score > best) {
      best = score;
      saveBest(storageKey, best);
    }
    addTile();
    render();
    if (!won && board.some((row) => row.some((value) => value >= 2048))) {
      won = true;
      showingWin = true;
      showMessage('You reached 2048!', 'Keep playing for a higher score or start a new board.', true);
    } else if (!hasMoves(board)) {
      over = true;
      showMessage('No more moves', `Final score: ${score}. Try a fresh board.`, false);
    } else if (result.score) {
      status.textContent = `+${result.score} points. Score: ${score}.`;
    }
  }

  root.querySelectorAll<HTMLButtonElement>('[data-restart-2048]').forEach((button) => {
    button.addEventListener('click', () => {
      restart();
      grid.focus({ preventScroll: true });
    });
  });
  continueButton.addEventListener('click', () => {
    showingWin = false;
    message.hidden = true;
    if (!hasMoves(board)) {
      over = true;
      showMessage('No more moves', `Final score: ${score}. Try a fresh board.`, false);
    } else {
      status.textContent = 'Keep going — the next tile is waiting.';
      grid.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || isEditable(event.target)) return;
    const direction = directionKeys[event.key.toLowerCase()];
    if (!direction) return;
    event.preventDefault();
    event.stopPropagation();
    move(direction);
  });
  bindDirections(root, move);
  bindSwipes(grid, move);
  restart();
}

type Cell = { x: number; y: number };
type SnakePhase = 'ready' | 'running' | 'paused' | 'over' | 'won';
const vectors: Record<Direction, Cell> = {
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
};
const opposites: Record<Direction, Direction> = { left: 'right', right: 'left', up: 'down', down: 'up' };

function initSnake(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('#board-snake')!;
  const context = canvas.getContext('2d');
  const scoreLabel = root.querySelector<HTMLElement>('#score-snake')!;
  const bestLabel = root.querySelector<HTMLElement>('#best-snake')!;
  const status = root.querySelector<HTMLElement>('#status-snake')!;
  const toggleButton = root.querySelector<HTMLButtonElement>('#toggle-snake')!;
  const message = root.querySelector<HTMLElement>('#message-snake')!;
  const messageTitle = root.querySelector<HTMLElement>('#message-title-snake')!;
  const messageDetail = root.querySelector<HTMLElement>('#message-detail-snake')!;
  const messageButton = root.querySelector<HTMLButtonElement>('#action-snake')!;
  if (!context) {
    status.textContent = 'Your browser could not create the game canvas. Please try another browser.';
    toggleButton.disabled = true;
    messageButton.disabled = true;
    return;
  }
  const ctx = context;
  const size = 20;
  const unit = canvas.width / size;
  const storageKey = 'calcsolver.info.snake.best';
  let snake: Cell[] = [];
  let food: Cell | null = null;
  let direction: Direction = 'right';
  let queuedDirection: Direction = 'right';
  let turnQueued = false;
  let score = 0;
  let best = readBest(storageKey);
  let phase: SnakePhase = 'ready';
  let timer: number | undefined;

  function stopTimer(): void {
    if (timer !== undefined) window.clearInterval(timer);
    timer = undefined;
  }

  function placeFood(): Cell | null {
    const empty: Cell[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!snake.some((cell) => cell.x === x && cell.y === y)) empty.push({ x, y });
      }
    }
    return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
  }

  function draw(): void {
    ctx.fillStyle = '#0e1b19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#182c27';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let index = 1; index < size; index++) {
      ctx.moveTo(index * unit, 0);
      ctx.lineTo(index * unit, canvas.height);
      ctx.moveTo(0, index * unit);
      ctx.lineTo(canvas.width, index * unit);
    }
    ctx.stroke();
    if (food) {
      const x = (food.x + 0.5) * unit;
      const y = (food.y + 0.5) * unit;
      ctx.fillStyle = '#ff806e';
      ctx.beginPath();
      ctx.arc(x, y + 1, unit * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a3d788';
      ctx.beginPath();
      ctx.ellipse(x + 3, y - unit * 0.31, 4, 2, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    snake.forEach((cell, index) => {
      ctx.fillStyle = index === 0 ? '#c1ef88' : '#74b963';
      ctx.beginPath();
      ctx.roundRect(cell.x * unit + 2, cell.y * unit + 2, unit - 4, unit - 4, index === 0 ? 6 : 4);
      ctx.fill();
      if (index === 0) {
        const centerX = (cell.x + 0.5) * unit;
        const centerY = (cell.y + 0.5) * unit;
        const vector = vectors[direction];
        const side = { x: -vector.y, y: vector.x };
        ctx.fillStyle = '#173025';
        for (const offset of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(centerX + vector.x * 5 + side.x * offset * 4, centerY + vector.y * 5 + side.y * offset * 4, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    scoreLabel.textContent = String(score);
    bestLabel.textContent = String(best);
  }

  function showMessage(title: string, detail: string, action: string): void {
    messageTitle.textContent = title;
    messageDetail.textContent = detail;
    messageButton.textContent = action;
    message.hidden = false;
    status.textContent = `${title} ${detail}`;
  }

  function restart(): void {
    stopTimer();
    snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
    direction = 'right';
    queuedDirection = 'right';
    turnQueued = false;
    score = 0;
    phase = 'ready';
    food = placeFood();
    toggleButton.textContent = 'Start game';
    showMessage('Ready to play?', 'Collect apples. Avoid the walls and your own tail.', 'Start game');
    draw();
  }

  function finish(won = false): void {
    stopTimer();
    phase = won ? 'won' : 'over';
    toggleButton.textContent = 'New game';
    showMessage(won ? 'You filled the board!' : 'Game over', `Final score: ${score}. Your best is ${best}.`, 'Play again');
  }

  function tick(): void {
    if (phase !== 'running') return;
    direction = queuedDirection;
    turnQueued = false;
    const vector = vectors[direction];
    const head = { x: snake[0].x + vector.x, y: snake[0].y + vector.y };
    const eating = food !== null && head.x === food.x && head.y === food.y;
    // Moving into the current tail is safe when that tail moves away this tick.
    const collisionBody = eating ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.y < 0 || head.x >= size || head.y >= size ||
      collisionBody.some((cell) => cell.x === head.x && cell.y === head.y)) {
      finish();
      return;
    }
    snake.unshift(head);
    if (eating) {
      score += 10;
      if (score > best) {
        best = score;
        saveBest(storageKey, best);
      }
      food = placeFood();
      status.textContent = `Apple collected. Score: ${score}.`;
    } else {
      snake.pop();
    }
    draw();
    if (!food) finish(true);
  }

  function start(): void {
    if (document.hidden || phase === 'running') return;
    if (phase === 'over' || phase === 'won') restart();
    phase = 'running';
    message.hidden = true;
    toggleButton.textContent = 'Pause';
    status.textContent = 'Game running. Use arrow keys or WASD. Space pauses the game.';
    stopTimer();
    timer = window.setInterval(tick, 140);
    canvas.focus({ preventScroll: true });
  }

  function pause(): void {
    if (phase !== 'running') return;
    stopTimer();
    phase = 'paused';
    toggleButton.textContent = 'Resume';
    showMessage('Paused', 'Take your time. Resume when you are ready.', 'Resume');
  }

  function move(next: Direction): void {
    if (phase === 'paused' || phase === 'over' || phase === 'won') return;
    if (next === opposites[direction] || turnQueued) return;
    queuedDirection = next;
    turnQueued = next !== direction;
    if (phase === 'ready') start();
  }

  toggleButton.addEventListener('click', () => phase === 'running' ? pause() : start());
  messageButton.addEventListener('click', start);
  root.querySelector<HTMLButtonElement>('[data-restart-snake]')!.addEventListener('click', () => {
    restart();
    canvas.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || isEditable(event.target)) return;
    const key = event.key.toLowerCase();
    const next = directionKeys[key];
    if (next) {
      event.preventDefault();
      event.stopPropagation();
      move(next);
    } else if (key === ' ' || key === 'p') {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) phase === 'running' ? pause() : start();
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);
  window.addEventListener('pagehide', () => {
    pause();
    stopTimer();
  });
  bindDirections(root, move);
  bindSwipes(canvas, move);
  restart();
}

const gameRoot = document.querySelector<HTMLElement>('[data-game]');
if (gameRoot?.dataset.game === '2048') init2048(gameRoot);
if (gameRoot?.dataset.game === 'snake') initSnake(gameRoot);
