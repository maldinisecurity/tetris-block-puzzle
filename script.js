const boardCanvas = document.getElementById("g");
const boardCtx = boardCanvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");
const bodyEl = document.body;
const boardPanelEl = document.querySelector(".board-panel");

const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const bestEl = document.getElementById("best");
const mobileScoreEl = document.getElementById("mobile-score");
const mobileLinesEl = document.getElementById("mobile-lines");
const mobileLevelEl = document.getElementById("mobile-level");
const mobileBestEl = document.getElementById("mobile-best");
const msgEl = document.getElementById("msg");
const speedLabelEl = document.getElementById("speed-label");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayCopyEl = document.getElementById("overlay-copy");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const mobilePauseBtn = document.getElementById("mobile-pause-btn");
const mobileExitBtn = document.getElementById("mobile-exit-btn");

const isEntryMenuOpen = () => document.body.classList.contains("entry-menu-open");

function injectEntryMenuStyles() {
  if (document.getElementById("entryMenuStyles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "entryMenuStyles";
  style.textContent = `
    body.entry-menu-open {
      overflow: hidden;
    }

    .entry-shell {
      position: fixed;
      inset: 0;
      z-index: 120;
      display: grid;
      place-items: center;
      padding: 16px;
      padding-top: max(16px, env(safe-area-inset-top));
      padding-right: max(16px, env(safe-area-inset-right));
      padding-bottom: max(16px, env(safe-area-inset-bottom));
      padding-left: max(16px, env(safe-area-inset-left));
      background: rgba(2, 8, 23, 0.54);
      backdrop-filter: blur(16px);
      opacity: 1;
      visibility: visible;
      transition: opacity 220ms ease, visibility 220ms ease;
    }

    .entry-shell.is-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .entry-shell::before,
    .entry-shell::after {
      content: "";
      position: absolute;
      width: clamp(180px, 28vw, 320px);
      aspect-ratio: 1;
      border-radius: 50%;
      filter: blur(10px);
      opacity: 0.22;
      animation: entryFloat 7s ease-in-out infinite;
    }

    .entry-shell::before {
      top: 8%;
      left: 6%;
      background: radial-gradient(circle, var(--accent, #43f0d0), transparent 62%);
    }

    .entry-shell::after {
      right: 8%;
      bottom: 6%;
      animation-delay: -3s;
      background: radial-gradient(circle, rgba(251, 106, 160, 0.9), transparent 62%);
    }

    .entry-panel {
      position: relative;
      width: min(540px, 100%);
      padding: clamp(20px, 4vw, 30px);
      border-radius: 30px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: linear-gradient(180deg, rgba(8, 21, 39, 0.96), rgba(4, 11, 22, 0.96));
      box-shadow: 0 30px 80px rgba(2, 8, 23, 0.46);
      overflow: hidden;
      animation: entryRise 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .entry-panel::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 120px;
      background: radial-gradient(circle at top, rgba(255, 255, 255, 0.12), transparent 70%);
      pointer-events: none;
    }

    .entry-screen {
      position: relative;
      z-index: 1;
      display: none;
      gap: 14px;
    }

    .entry-screen.is-active {
      display: grid;
      animation: entryCopy 0.24s ease;
    }

    .entry-kicker {
      margin: 0;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent, #43f0d0);
    }

    .entry-panel h2 {
      margin: 0;
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      line-height: 1;
      color: var(--text, #eff7ff);
    }

    .entry-copy {
      margin: 0;
      color: var(--muted, #8ca4c4);
      font-weight: 700;
      line-height: 1.6;
    }

    .entry-guide {
      display: grid;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .entry-guide p {
      margin: 0;
      color: var(--muted, #8ca4c4);
      font-weight: 600;
      line-height: 1.55;
    }

    .entry-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }

    .entry-actions button {
      flex: 1 1 180px;
    }

    .entry-secondary {
      background: transparent !important;
      color: var(--text, #eff7ff) !important;
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: none !important;
    }

    @media (max-width: 480px) {
      .entry-panel {
        border-radius: 24px;
        padding: 18px;
      }

      .entry-actions button {
        flex-basis: 100%;
      }
    }

    @keyframes entryFloat {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-14px) scale(1.06); }
    }

    @keyframes entryRise {
      from { transform: translateY(24px) scale(0.98); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    @keyframes entryCopy {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.append(style);
}

function createEntryMenu({ title, kicker, description, tutorial, onStart }) {
  injectEntryMenuStyles();

  const shell = document.createElement("section");
  shell.className = "entry-shell is-hidden";
  shell.hidden = true;
  shell.innerHTML = `
    <article class="entry-panel" aria-label="${title} start screen">
      <section class="entry-screen is-active" data-entry-screen="home">
        <p class="entry-kicker">${kicker}</p>
        <h2>${title}</h2>
        <p class="entry-copy">${description}</p>
        <div class="entry-actions">
          <button type="button" data-entry-start>Start New Game</button>
          <button type="button" class="entry-secondary" data-entry-tutorial>Tutorial / Help</button>
        </div>
      </section>
      <section class="entry-screen" data-entry-screen="tutorial" hidden>
        <p class="entry-kicker">Tutorial</p>
        <h2>How To Play</h2>
        <div class="entry-guide">${tutorial.map((item) => `<p>${item}</p>`).join("")}</div>
        <div class="entry-actions">
          <button type="button" class="entry-secondary" data-entry-back>Back</button>
          <button type="button" data-entry-start>Start Game</button>
        </div>
      </section>
    </article>
  `;
  document.body.append(shell);

  const screens = [...shell.querySelectorAll(".entry-screen")];

  const showScreen = (name) => {
    screens.forEach((screen) => {
      const active = screen.dataset.entryScreen === name;
      screen.hidden = !active;
      screen.classList.toggle("is-active", active);
    });
  };

  const close = () => {
    shell.classList.add("is-hidden");
    document.body.classList.remove("entry-menu-open");
    window.setTimeout(() => {
      shell.hidden = true;
    }, 220);
  };

  const open = (screen = "home") => {
    showScreen(screen);
    shell.hidden = false;
    document.body.classList.add("entry-menu-open");
    requestAnimationFrame(() => {
      shell.classList.remove("is-hidden");
    });
  };

  shell.querySelectorAll("[data-entry-start]").forEach((button) => {
    button.addEventListener("click", () => {
      onStart();
      close();
    });
  });
  shell.querySelector("[data-entry-tutorial]").addEventListener("click", () => {
    showScreen("tutorial");
  });
  shell.querySelector("[data-entry-back]").addEventListener("click", () => {
    showScreen("home");
  });

  open();
}

const COLS = 10;
const ROWS = 20;
const BASE_DROP_MS = 700;
const MIN_DROP_MS = 110;
const COLORS = {
  I: "#54e8ff",
  O: "#ffd75f",
  T: "#c58bff",
  S: "#5df2a1",
  Z: "#ff719a",
  J: "#7eb4ff",
  L: "#ffb068",
  ghost: "rgba(255,255,255,0.18)",
  grid: "rgba(173, 216, 255, 0.09)",
};

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const board = createBoard();
let queue = [];
let active = null;
let score = 0;
let lines = 0;
let level = 1;
let best = Number(localStorage.getItem("tetris-best-score") || 0);
let running = false;
let gameOver = false;
let paused = false;
let lastTime = 0;
let dropElapsed = 0;
let flashLines = [];
let flashTimer = 0;
let hudSnapshot = { score, lines, level, best };
let activeGesture = null;
let lineCombo = -1;
let backToBackTetris = false;

bestEl.textContent = String(best);
mobileBestEl.textContent = String(best);

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function resetBoard() {
  for (let row = 0; row < ROWS; row += 1) {
    board[row].fill(null);
  }
}

function cloneShape(matrix) {
  return matrix.map((row) => [...row]);
}

function getBag() {
  const types = Object.keys(SHAPES);
  for (let i = types.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  return types;
}

function getNextType() {
  if (queue.length === 0) {
    queue = getBag();
  }
  return queue.shift();
}

function spawnPiece() {
  const type = getNextType();
  const matrix = cloneShape(SHAPES[type]);
  const piece = {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: -getTopPadding(matrix),
  };
  if (collides(piece.x, piece.y, piece.matrix)) {
    endGame();
  }
  return piece;
}

function getTopPadding(matrix) {
  let emptyRows = 0;
  for (const row of matrix) {
    if (row.some(Boolean)) {
      break;
    }
    emptyRows += 1;
  }
  return emptyRows;
}

function collides(x, y, matrix) {
  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (!matrix[row][col]) {
        continue;
      }
      const boardX = x + col;
      const boardY = y + row;
      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
        return true;
      }
      if (boardY >= 0 && board[boardY][boardX]) {
        return true;
      }
    }
  }
  return false;
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
}

function tryRotate() {
  if (!running || paused || gameOver) {
    return;
  }
  const rotated = rotateMatrix(active.matrix);
  const kicks = [0, -1, 1, -2, 2];
  for (const offset of kicks) {
    if (!collides(active.x + offset, active.y, rotated)) {
      active.x += offset;
      active.matrix = rotated;
      return;
    }
  }
}

function mergePiece() {
  for (let row = 0; row < active.matrix.length; row += 1) {
    for (let col = 0; col < active.matrix[row].length; col += 1) {
      if (!active.matrix[row][col]) {
        continue;
      }
      const boardY = active.y + row;
      if (boardY >= 0) {
        board[boardY][active.x + col] = active.type;
      }
    }
  }
}

function clearLines() {
  const completed = [];
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row].every(Boolean)) {
      completed.push(row);
    }
  }

  if (completed.length === 0) {
    return 0;
  }

  flashLines = completed;
  flashTimer = 120;

  for (const rowIndex of [...completed].sort((a, b) => a - b)) {
    board.splice(rowIndex, 1);
    board.unshift(Array(COLS).fill(null));
  }

  return completed.length;
}

function awardScore(cleared) {
  const lineScores = [0, 100, 300, 500, 800];
  const comboBonus = lineCombo > 0 ? lineCombo * 55 * level : 0;
  const backToBackBonus = cleared === 4 && backToBackTetris ? 420 * level : 0;
  score += lineScores[cleared] * level + comboBonus + backToBackBonus;
  lines += cleared;
  level = Math.max(1, Math.floor(lines / 10) + 1);
  best = Math.max(best, score);
  localStorage.setItem("tetris-best-score", String(best));
  syncHud();
}

function getDropInterval() {
  return Math.max(MIN_DROP_MS, BASE_DROP_MS - (level - 1) * 55);
}

function syncHud() {
  updateHudValue(scoreEl, score, hudSnapshot.score);
  updateHudValue(linesEl, lines, hudSnapshot.lines);
  updateHudValue(levelEl, level, hudSnapshot.level);
  updateHudValue(bestEl, best, hudSnapshot.best);
  updateHudValue(mobileScoreEl, score, hudSnapshot.score);
  updateHudValue(mobileLinesEl, lines, hudSnapshot.lines);
  updateHudValue(mobileLevelEl, level, hudSnapshot.level);
  updateHudValue(mobileBestEl, best, hudSnapshot.best);
  hudSnapshot = { score, lines, level, best };
  speedLabelEl.textContent = `${(BASE_DROP_MS / getDropInterval()).toFixed(2)}x`;
}

function updateHudValue(element, value, previousValue) {
  element.textContent = String(value);
  if (value === previousValue) {
    return;
  }
  element.classList.remove("stat-pop");
  void element.offsetWidth;
  element.classList.add("stat-pop");
  window.setTimeout(() => element.classList.remove("stat-pop"), 180);
}

function addScore(points) {
  if (points <= 0) {
    return;
  }
  score += points;
  best = Math.max(best, score);
  localStorage.setItem("tetris-best-score", String(best));
  syncHud();
}

function setMessage(text) {
  msgEl.textContent = text;
}

function showOverlay(title, copy) {
  overlayTitleEl.textContent = title;
  overlayCopyEl.textContent = copy;
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

function isMobileViewport() {
  return (
    window.matchMedia("(max-width: 820px)").matches ||
    window.matchMedia("(max-width: 900px) and (pointer: coarse)").matches
  );
}

async function requestMobileFullscreen() {
  if (!isMobileViewport()) {
    return;
  }

  const target = boardPanelEl;
  if (!target) {
    return;
  }

  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return;
    }

    if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen();
    }
  } catch {
    // Keep the CSS fullscreen fallback active when the browser rejects the request.
  }
}

async function exitMobileFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
      return;
    }

    if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } catch {
    // Ignore exit failures and still restore the inline layout.
  }
}

function enterMobilePlayMode() {
  if (!isMobileViewport()) {
    return;
  }
  bodyEl.classList.add("mobile-play-active");
  requestMobileFullscreen();
}

function exitMobilePlayMode() {
  bodyEl.classList.remove("mobile-play-active");
  exitMobileFullscreen();
}

function movePiece(direction) {
  if (!running || paused || gameOver) {
    return;
  }
  const nextX = active.x + direction;
  if (!collides(nextX, active.y, active.matrix)) {
    active.x = nextX;
  }
}

function softDrop() {
  if (!running || paused || gameOver) {
    return;
  }
  if (!collides(active.x, active.y + 1, active.matrix)) {
    active.y += 1;
    addScore(1);
    return;
  }
  lockPiece();
}

function hardDrop() {
  if (!running || paused || gameOver) {
    return;
  }
  let distance = 0;
  while (!collides(active.x, active.y + 1, active.matrix)) {
    active.y += 1;
    distance += 1;
  }
  addScore(distance * 2);
  lockPiece();
}

function lockPiece() {
  mergePiece();
  addScore(Math.max(8, level * 4));
  const cleared = clearLines();
  if (cleared > 0) {
    lineCombo += 1;
    awardScore(cleared);
    const comboCopy = lineCombo > 0 ? ` Combo x${lineCombo + 1}.` : "";
    const b2bCopy = cleared === 4 && backToBackTetris ? " Back-to-back bonus." : "";
    setMessage(cleared === 4 ? `Tetris! Clean four-line stack.${b2bCopy}${comboCopy}` : `${cleared} line${cleared > 1 ? "s" : ""} cleared.${comboCopy}`);
    backToBackTetris = cleared === 4;
  } else {
    lineCombo = -1;
    setMessage("Stack clean. Keep the well open.");
  }
  active = spawnPiece();
  dropElapsed = 0;
}

function getGhostY() {
  let ghostY = active.y;
  while (!collides(active.x, ghostY + 1, active.matrix)) {
    ghostY += 1;
  }
  return ghostY;
}

function drawCell(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);
  ctx.restore();
}

function resizeCanvasForDisplay(canvas, ctx, logicalWidth, logicalHeight) {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const displayHeight = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
  ctx.setTransform(displayWidth / logicalWidth, 0, 0, displayHeight / logicalHeight, 0, 0);
}

function drawBoard() {
  const logicalWidth = COLS * 32;
  const logicalHeight = ROWS * 32;
  resizeCanvasForDisplay(boardCanvas, boardCtx, logicalWidth, logicalHeight);
  boardCtx.clearRect(0, 0, logicalWidth, logicalHeight);

  boardCtx.fillStyle = "#071220";
  boardCtx.fillRect(0, 0, logicalWidth, logicalHeight);

  boardCtx.strokeStyle = COLORS.grid;
  boardCtx.lineWidth = 1;
  for (let col = 1; col < COLS; col += 1) {
    boardCtx.beginPath();
    boardCtx.moveTo(col * 32, 0);
    boardCtx.lineTo(col * 32, logicalHeight);
    boardCtx.stroke();
  }
  for (let row = 1; row < ROWS; row += 1) {
    boardCtx.beginPath();
    boardCtx.moveTo(0, row * 32);
    boardCtx.lineTo(logicalWidth, row * 32);
    boardCtx.stroke();
  }

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = board[row][col];
      if (!cell) {
        continue;
      }
      const isFlashing = flashTimer > 0 && flashLines.includes(row);
      drawCell(boardCtx, col * 32, row * 32, 32, COLORS[cell], isFlashing ? 0.4 : 1);
    }
  }

  if (!active) {
    return;
  }

  const ghostY = getGhostY();
  for (let row = 0; row < active.matrix.length; row += 1) {
    for (let col = 0; col < active.matrix[row].length; col += 1) {
      if (!active.matrix[row][col]) {
        continue;
      }
      const drawX = (active.x + col) * 32;
      const drawGhostY = (ghostY + row) * 32;
      const drawY = (active.y + row) * 32;
      if (ghostY + row >= 0) {
        drawCell(boardCtx, drawX, drawGhostY, 32, COLORS.ghost, 1);
      }
      if (active.y + row >= 0) {
        drawCell(boardCtx, drawX, drawY, 32, COLORS[active.type], 1);
      }
    }
  }
}

function drawNext() {
  resizeCanvasForDisplay(nextCanvas, nextCtx, 160, 160);
  nextCtx.clearRect(0, 0, 160, 160);
  nextCtx.fillStyle = "#071220";
  nextCtx.fillRect(0, 0, 160, 160);

  const nextType = queue[0] || getNextType();
  if (!queue[0]) {
    queue.unshift(nextType);
  }
  const matrix = SHAPES[nextType];
  const size = 28;
  const width = matrix[0].length * size;
  const height = matrix.length * size;
  const offsetX = (160 - width) / 2;
  const offsetY = (160 - height) / 2;

  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (!matrix[row][col]) {
        continue;
      }
      drawCell(nextCtx, offsetX + col * size, offsetY + row * size, size, COLORS[nextType], 1);
    }
  }
}

function endGame() {
  running = false;
  paused = false;
  gameOver = true;
  setMessage("Top out. Hit Restart for another run.");
  showOverlay("Game Over", "The stack reached the ceiling. Restart and keep the center flatter.");
}

function startGame() {
  enterMobilePlayMode();
  if (gameOver) {
    resetGame();
  }
  if (!running) {
    running = true;
    paused = false;
    hideOverlay();
    setMessage("Game live. Keep the stack low.");
    if (!active) {
      active = spawnPiece();
    }
    return;
  }
  if (paused) {
    paused = false;
    hideOverlay();
    setMessage("Back in play.");
  }
}

function togglePause() {
  if (!running || gameOver) {
    return;
  }
  paused = !paused;
  if (paused) {
    showOverlay("Paused", "Take the shot when you are ready.");
    setMessage("Paused.");
  } else {
    hideOverlay();
    setMessage("Back in play.");
  }
}

function resetGame() {
  resetBoard();
  queue = getBag();
  active = spawnPiece();
  score = 0;
  lines = 0;
  level = 1;
  lineCombo = -1;
  backToBackTetris = false;
  dropElapsed = 0;
  flashLines = [];
  flashTimer = 0;
  paused = false;
  running = false;
  gameOver = false;
  syncHud();
  setMessage("Fresh board. Press Start.");
  showOverlay("Ready?", isMobileViewport() ? "Press Start to open full-screen play." : "Press Start to drop the first piece.");
}

function handleAction(action) {
  switch (action) {
    case "left":
      movePiece(-1);
      break;
    case "right":
      movePiece(1);
      break;
    case "down":
      softDrop();
      break;
    case "rotate":
      tryRotate();
      break;
    case "drop":
      hardDrop();
      break;
    default:
      break;
  }
}

window.addEventListener("keydown", (event) => {
  if (isEntryMenuOpen()) {
    return;
  }
  if (event.repeat && !["ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    return;
  }
  if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "Spacebar"].includes(event.key)) {
    event.preventDefault();
  }
  if (event.key === "Enter") {
    startGame();
    return;
  }
  if (event.key === "p" || event.key === "P") {
    togglePause();
    return;
  }
  if (event.key === "ArrowLeft") handleAction("left");
  if (event.key === "ArrowRight") handleAction("right");
  if (event.key === "ArrowDown") handleAction("down");
  if (event.key === "ArrowUp" || event.key === "x" || event.key === "X") handleAction("rotate");
  if (event.key === " " || event.key === "Spacebar") handleAction("drop");
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", resetGame);
mobilePauseBtn.addEventListener("click", togglePause);
mobileExitBtn.addEventListener("click", () => {
  if (running && !paused && !gameOver) {
    togglePause();
  }
  exitMobilePlayMode();
});

boardCanvas.addEventListener("pointerdown", (event) => {
  if (!bodyEl.classList.contains("mobile-play-active")) {
    return;
  }
  activeGesture = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    lastY: event.clientY,
    moved: false,
  };
  boardCanvas.setPointerCapture(event.pointerId);
});

boardCanvas.addEventListener("pointermove", (event) => {
  if (!activeGesture || activeGesture.id !== event.pointerId || !running || paused || gameOver) {
    return;
  }

  const dx = event.clientX - activeGesture.lastX;
  const totalDx = event.clientX - activeGesture.startX;
  const totalDy = event.clientY - activeGesture.startY;
  const threshold = 24;

  if (Math.abs(totalDx) > 8 || Math.abs(totalDy) > 8) {
    activeGesture.moved = true;
  }

  if (dx >= threshold) {
    handleAction("right");
    activeGesture.lastX = event.clientX;
  } else if (dx <= -threshold) {
    handleAction("left");
    activeGesture.lastX = event.clientX;
  }

  const dy = event.clientY - activeGesture.lastY;
  if (dy >= threshold) {
    handleAction("down");
    activeGesture.lastY = event.clientY;
  }
});

function finishGesture(event) {
  if (!activeGesture || activeGesture.id !== event.pointerId) {
    return;
  }
  if (!activeGesture.moved && running && !paused && !gameOver) {
    handleAction("rotate");
  }
  activeGesture = null;
}

boardCanvas.addEventListener("pointerup", finishGesture);
boardCanvas.addEventListener("pointercancel", finishGesture);

window.addEventListener("resize", () => {
  if (!isMobileViewport()) {
    exitMobilePlayMode();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && bodyEl.classList.contains("mobile-play-active") && !isMobileViewport()) {
    exitMobilePlayMode();
  }
});

function tick(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (running && !paused && !gameOver) {
    dropElapsed += delta;
    if (dropElapsed >= getDropInterval()) {
      if (!collides(active.x, active.y + 1, active.matrix)) {
        active.y += 1;
      } else {
        lockPiece();
      }
      dropElapsed = 0;
    }
  }

  if (flashTimer > 0) {
    flashTimer = Math.max(0, flashTimer - delta);
    if (flashTimer === 0) {
      flashLines = [];
    }
  }

  drawBoard();
  drawNext();
  requestAnimationFrame(tick);
}

syncHud();
resetGame();
createEntryMenu({
  title: "Tetris Block Puzzle",
  kicker: "Arcade Refresh",
  description: "Drop into a fresh stack, control space carefully, and chase cleaner line clears before the pace rises.",
  tutorial: [
    "Use Left and Right to move, Up to rotate, Down to soft-drop, and Space to hard-drop.",
    "On phones, swipe the board left, right, or down, then tap to rotate the active piece.",
    "Clear lines to score, level up, and speed the game up. The ghost piece shows where the piece will land.",
    "If the stack reaches the ceiling, the run ends immediately.",
  ],
  onStart: () => {
    resetGame();
    startGame();
  },
});
requestAnimationFrame(tick);
