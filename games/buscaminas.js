const DIFFICULTY_PRESETS = {
  easy: {
    id: "easy",
    label: "Fácil",
    rows: 8,
    cols: 8,
    mines: 10,
    boardMaxWidth: 420
  },
  moderate: {
    id: "moderate",
    label: "Moderado",
    rows: 12,
    cols: 12,
    mines: 20,
    boardMaxWidth: 560
  },
  hard: {
    id: "hard",
    label: "Difícil",
    rows: 16,
    cols: 16,
    mines: 40,
    boardMaxWidth: 700
  }
};

const DIFFICULTY_ORDER = ["easy", "moderate", "hard"];

const SHAPE_PRESETS = {
  classic: {
    id: "classic",
    label: "Clásico"
  },
  cross: {
    id: "cross",
    label: "Cruz"
  },
  diamond: {
    id: "diamond",
    label: "Rombo"
  }
};

const SHAPE_ORDER = ["classic", "cross", "diamond"];

const NUMBER_LABELS = {
  1: "Una mina cercana",
  2: "Dos minas cercanas",
  3: "Tres minas cercanas",
  4: "Cuatro minas cercanas",
  5: "Cinco minas cercanas",
  6: "Seis minas cercanas",
  7: "Siete minas cercanas",
  8: "Ocho minas cercanas"
};

function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[char];
  });
}

function normalizeDifficulty(difficulty) {
  const key = String(difficulty || "").trim().toLowerCase();
  if (key === "medium") {
    return "moderate";
  }
  return DIFFICULTY_PRESETS[key] ? key : "easy";
}

function normalizeShape(shape) {
  const key = String(shape || "").trim().toLowerCase();
  if (key === "rhombus") {
    return "diamond";
  }
  return SHAPE_PRESETS[key] ? key : "classic";
}

function getDifficultyMeta(difficulty) {
  return DIFFICULTY_PRESETS[normalizeDifficulty(difficulty)];
}

function getShapeMeta(shape) {
  return SHAPE_PRESETS[normalizeShape(shape)];
}

function cellIndex(row, col, cols) {
  return row * cols + col;
}

function isCellIndex(index, length) {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function createCell(index, row, col, isActive) {
  return {
    index,
    row,
    col,
    isActive,
    hasMine: false,
    adjacentMines: 0,
    isOpen: false,
    isFlagged: false
  };
}

function sanitizeNowMs(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.floor(numeric);
  }
  return Date.now();
}

function formatTime(elapsedMs) {
  const totalSeconds = Math.max(0, Math.floor(Number(elapsedMs || 0) / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function normalizedDistance(value, total) {
  const center = total / 2;
  const radius = Math.max(1, total / 2);
  return Math.abs(value + 0.5 - center) / radius;
}

function isActiveShapeCell(shape, row, col, rows, cols) {
  if (shape === "classic") {
    return true;
  }

  const normRow = normalizedDistance(row, rows);
  const normCol = normalizedDistance(col, cols);

  if (shape === "cross") {
    return normRow <= 0.375 || normCol <= 0.375;
  }

  if (shape === "diamond") {
    return normRow + normCol <= 1.02;
  }

  return true;
}

function getAllNeighborIndexes(index, rows, cols) {
  if (!isCellIndex(index, rows * cols)) {
    return [];
  }

  const baseRow = Math.floor(index / cols);
  const baseCol = index % cols;
  const neighbors = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const row = baseRow + rowOffset;
      const col = baseCol + colOffset;
      if (row < 0 || row >= rows || col < 0 || col >= cols) {
        continue;
      }

      neighbors.push(cellIndex(row, col, cols));
    }
  }

  return neighbors;
}

function buildBoardGeometry(rows, cols, shape, baseMineCount) {
  const cells = [];
  const activeCellIndexes = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = cellIndex(row, col, cols);
      const isActive = isActiveShapeCell(shape, row, col, rows, cols);
      cells.push(createCell(index, row, col, isActive));
      if (isActive) {
        activeCellIndexes.push(index);
      }
    }
  }

  const neighborMap = Array.from({ length: cells.length }, () => []);
  for (const index of activeCellIndexes) {
    neighborMap[index] = getAllNeighborIndexes(index, rows, cols).filter((neighborIndex) => cells[neighborIndex].isActive);
  }

  const boardSize = rows * cols;
  const activeCellCount = activeCellIndexes.length;
  const baseDensity = boardSize > 0 ? baseMineCount / boardSize : 0;
  const densityMineCount = Math.max(1, Math.round(activeCellCount * baseDensity));
  const maxSafeZoneSize = activeCellIndexes.reduce((max, index) => {
    return Math.max(max, 1 + neighborMap[index].length);
  }, 1);
  const safeMineCap = Math.max(1, activeCellCount - maxSafeZoneSize);
  const mineCount = Math.max(1, Math.min(densityMineCount, safeMineCap));

  return {
    cells,
    activeCellIndexes,
    activeCellCount,
    neighborMap,
    mineCount
  };
}

function buildFreshState(options = {}) {
  const difficulty = normalizeDifficulty(options.difficulty);
  const shape = normalizeShape(options.shape);
  const difficultyMeta = getDifficultyMeta(difficulty);
  const geometry = buildBoardGeometry(difficultyMeta.rows, difficultyMeta.cols, shape, difficultyMeta.mines);

  return {
    difficulty,
    shape,
    rows: difficultyMeta.rows,
    cols: difficultyMeta.cols,
    boardMaxWidth: difficultyMeta.boardMaxWidth,
    baseMineCount: difficultyMeta.mines,
    mineCount: geometry.mineCount,
    activeCellCount: geometry.activeCellCount,
    cells: geometry.cells,
    activeCellIndexes: geometry.activeCellIndexes,
    neighborMap: geometry.neighborMap,
    initialized: false,
    status: "ready",
    interactionMode: "reveal",
    safeOpenCount: 0,
    flaggedCount: 0,
    minesRemaining: geometry.mineCount,
    elapsedMs: 0,
    timerStartedAtMs: null,
    lastTimerTickAtMs: null,
    detonatedCell: null
  };
}

function cloneState(state) {
  return {
    ...state,
    cells: state.cells.map((cell) => ({ ...cell }))
  };
}

function difficultyText(state) {
  return getDifficultyMeta(state.difficulty).label;
}

function shapeText(state) {
  return getShapeMeta(state.shape).label;
}

function boardSummaryText(state) {
  return `${state.rows}x${state.cols} · ${state.activeCellCount} activas · ${state.mineCount} minas`;
}

function statusText(status) {
  const map = {
    ready: "Listo",
    playing: "Jugando",
    won: "Victoria",
    lost: "Derrota"
  };
  return map[status] || "Listo";
}

function noteText(state) {
  if (state.status === "ready") {
    return state.interactionMode === "flag"
      ? "Modo bandera activo. La primera apertura seguirá siendo segura cuando abras una celda."
      : "Abre una celda para empezar. La primera jugada excluye esa celda y su vecindad activa inmediata.";
  }

  if (state.status === "won") {
    return "Has despejado todas las celdas seguras del tablero.";
  }

  if (state.status === "lost") {
    return "Has tocado una mina. Reinicia para intentarlo otra vez.";
  }

  return state.interactionMode === "flag"
    ? "Modo bandera activo. Marca las celdas que creas peligrosas."
    : "Modo abrir activo. Descubre zonas seguras y usa banderas cuando haga falta.";
}

function buildSafeExclusion(state, safeIndex) {
  if (!state.cells[safeIndex] || !state.cells[safeIndex].isActive) {
    return new Set();
  }

  return new Set([safeIndex, ...(state.neighborMap[safeIndex] || [])]);
}

function shuffleInPlace(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = current;
  }
  return items;
}

function placeMines(state, safeIndex) {
  const exclusion = buildSafeExclusion(state, safeIndex);
  const candidates = state.activeCellIndexes.filter((index) => !exclusion.has(index));

  shuffleInPlace(candidates);
  const selected = candidates.slice(0, state.mineCount);
  for (const mineIndex of selected) {
    state.cells[mineIndex].hasMine = true;
  }

  for (const index of state.activeCellIndexes) {
    const cell = state.cells[index];
    if (cell.hasMine) {
      cell.adjacentMines = 0;
      continue;
    }

    cell.adjacentMines = (state.neighborMap[index] || []).reduce((count, neighborIndex) => {
      return count + (state.cells[neighborIndex].hasMine ? 1 : 0);
    }, 0);
  }

  state.initialized = true;
}

function startTimer(state, nowMs) {
  if (state.timerStartedAtMs !== null) {
    return;
  }

  state.timerStartedAtMs = nowMs;
  state.lastTimerTickAtMs = nowMs;
}

function advanceTimer(state, nowMs) {
  if (state.timerStartedAtMs === null || state.status !== "playing") {
    return;
  }

  const safeNow = sanitizeNowMs(nowMs);
  const lastTick = Number.isFinite(state.lastTimerTickAtMs) ? state.lastTimerTickAtMs : state.timerStartedAtMs;
  if (safeNow <= lastTick) {
    return;
  }

  state.elapsedMs += safeNow - lastTick;
  state.lastTimerTickAtMs = safeNow;
}

function updateFlagCounters(state) {
  state.flaggedCount = state.activeCellIndexes.reduce((count, index) => {
    return count + (state.cells[index].isFlagged ? 1 : 0);
  }, 0);
  state.minesRemaining = state.mineCount - state.flaggedCount;
}

function floodOpen(state, startIndex) {
  const queue = [startIndex];
  const visited = new Set();

  while (queue.length > 0) {
    const index = queue.shift();
    if (!visited.has(index) && isCellIndex(index, state.cells.length)) {
      visited.add(index);
    } else {
      continue;
    }

    const cell = state.cells[index];
    if (!cell || !cell.isActive || cell.isOpen || cell.isFlagged || cell.hasMine) {
      continue;
    }

    cell.isOpen = true;
    state.safeOpenCount += 1;

    if (cell.adjacentMines !== 0) {
      continue;
    }

    for (const neighborIndex of state.neighborMap[index] || []) {
      const neighbor = state.cells[neighborIndex];
      if (neighbor && neighbor.isActive && !neighbor.isOpen && !neighbor.isFlagged && !neighbor.hasMine) {
        queue.push(neighborIndex);
      }
    }
  }
}

function autoFlagRemainingMines(state) {
  for (const index of state.activeCellIndexes) {
    const cell = state.cells[index];
    if (cell.hasMine) {
      cell.isFlagged = true;
    }
  }
  updateFlagCounters(state);
}

function isVictory(state) {
  return state.safeOpenCount >= state.activeCellCount - state.mineCount;
}

function finalizeWin(state, nowMs) {
  advanceTimer(state, nowMs);
  state.status = "won";
  state.interactionMode = "reveal";
  autoFlagRemainingMines(state);
}

function finalizeLoss(state, detonatedCell, nowMs) {
  advanceTimer(state, nowMs);
  state.status = "lost";
  state.interactionMode = "reveal";
  state.detonatedCell = detonatedCell;
  if (state.cells[detonatedCell]) {
    state.cells[detonatedCell].isOpen = true;
  }
}

function ensurePlayingState(state, nowMs) {
  if (state.status === "ready") {
    state.status = "playing";
    startTimer(state, nowMs);
    return;
  }

  advanceTimer(state, nowMs);
}

function applyToggleFlag(state, index, nowMs) {
  const cell = state.cells[index];
  if (!cell || !cell.isActive || cell.isOpen) {
    return { ok: false, reason: "invalid" };
  }

  ensurePlayingState(state, nowMs);
  cell.isFlagged = !cell.isFlagged;
  updateFlagCounters(state);
  return { ok: true, state };
}

function applyOpenCell(state, index, nowMs) {
  const cell = state.cells[index];
  if (!cell || !cell.isActive || cell.isOpen || cell.isFlagged) {
    return { ok: false, reason: "invalid" };
  }

  ensurePlayingState(state, nowMs);

  if (!state.initialized) {
    placeMines(state, index);
  }

  if (cell.hasMine) {
    finalizeLoss(state, index, nowMs);
    return { ok: true, state };
  }

  floodOpen(state, index);
  updateFlagCounters(state);

  if (isVictory(state)) {
    finalizeWin(state, nowMs);
  }

  return { ok: true, state };
}

function renderStat(label, value, key = "") {
  return `
    <div class="mines-stat">
      <span class="mines-stat-label">${escapeHtml(label)}</span>
      <strong class="mines-stat-value" ${key ? `data-mines-stat="${escapeHtml(key)}"` : ""}>${escapeHtml(value)}</strong>
    </div>
  `;
}

function cellContentData(cell, state) {
  const baseClass = ["mines-cell"];
  let content = '<span class="mines-cell-face" aria-hidden="true"></span>';
  let label = `Celda ${cell.row + 1},${cell.col + 1} cerrada`;

  if (cell.isOpen) {
    baseClass.push("is-open");

    if (cell.hasMine) {
      baseClass.push("is-mine");
      if (state.detonatedCell === cell.index) {
        baseClass.push("is-detonated");
        label = `Celda ${cell.row + 1},${cell.col + 1} con mina detonada`;
      } else {
        label = `Celda ${cell.row + 1},${cell.col + 1} con mina`;
      }
      content = '<span class="mines-icon mines-icon-mine" aria-hidden="true">✹</span>';
    } else if (cell.adjacentMines > 0) {
      baseClass.push("is-number", `is-number-${cell.adjacentMines}`);
      label = `Celda ${cell.row + 1},${cell.col + 1} abierta. ${NUMBER_LABELS[cell.adjacentMines] || `${cell.adjacentMines} minas cercanas`}`;
      content = `<span class="mines-number" aria-hidden="true">${cell.adjacentMines}</span>`;
    } else {
      baseClass.push("is-empty");
      label = `Celda ${cell.row + 1},${cell.col + 1} abierta vacía`;
      content = '<span class="mines-icon mines-icon-empty" aria-hidden="true">·</span>';
    }
  } else if (state.status === "lost" && cell.hasMine) {
    baseClass.push("is-revealed-mine");
    label = `Celda ${cell.row + 1},${cell.col + 1} con mina`;
    content = '<span class="mines-icon mines-icon-mine" aria-hidden="true">✹</span>';
  } else if (cell.isFlagged) {
    baseClass.push("is-flagged");
    if (state.status === "lost" && !cell.hasMine) {
      baseClass.push("is-wrong-flag");
      label = `Celda ${cell.row + 1},${cell.col + 1} con bandera incorrecta`;
      content = `
        <span class="mines-icon mines-icon-flag" aria-hidden="true">⚑</span>
        <span class="mines-icon mines-icon-wrong" aria-hidden="true">×</span>
      `;
    } else {
      label = `Celda ${cell.row + 1},${cell.col + 1} marcada con bandera`;
      content = '<span class="mines-icon mines-icon-flag" aria-hidden="true">⚑</span>';
    }
  }

  return {
    className: baseClass.join(" "),
    content,
    label,
    disabled: cell.isOpen || state.status === "won" || state.status === "lost"
  };
}

function renderActiveCell(cell, state) {
  const view = cellContentData(cell, state);
  return `
    <button
      type="button"
      class="${view.className}"
      data-action="game-action"
      data-game-action="press-cell"
      data-cell="${cell.index}"
      data-mines-cell="${cell.index}"
      aria-label="${escapeHtml(view.label)}"
      ${view.disabled ? "disabled" : ""}
    >
      ${view.content}
    </button>
  `;
}

function renderInactiveCell(cell) {
  return `
    <span
      class="mines-cell is-inactive"
      data-mines-gap="${cell.index}"
      aria-hidden="true"
    ></span>
  `;
}

function renderBoardGrid(state) {
  return `
    <div class="mines-board-frame">
      <div
        class="mines-board is-${escapeHtml(state.shape)}"
        data-mines-board
        data-mines-shape="${escapeHtml(state.shape)}"
        style="--mines-cols:${state.cols};--mines-board-max:${state.boardMaxWidth}px;"
      >
        ${state.cells.map((cell) => (cell.isActive ? renderActiveCell(cell, state) : renderInactiveCell(cell))).join("")}
      </div>
    </div>
  `;
}

function renderModeSelector(state) {
  return `
    <div class="mines-mobile-tools" data-mines-mobile-tools>
      <span class="mines-mobile-label">Toque</span>
      <div class="mines-mode-toggle">
        <button
          type="button"
          class="pill mines-mode-btn ${state.interactionMode === "reveal" ? "is-active" : ""}"
          data-action="game-action"
          data-game-action="set-interaction-mode"
          data-mode="reveal"
          data-mines-mode="reveal"
          aria-pressed="${state.interactionMode === "reveal" ? "true" : "false"}"
        >
          Abrir
        </button>
        <button
          type="button"
          class="pill mines-mode-btn ${state.interactionMode === "flag" ? "is-active" : ""}"
          data-action="game-action"
          data-game-action="set-interaction-mode"
          data-mode="flag"
          data-mines-mode="flag"
          aria-pressed="${state.interactionMode === "flag" ? "true" : "false"}"
        >
          Bandera
        </button>
      </div>
    </div>
  `;
}

function renderHud(state) {
  return `
    <section class="mines-hud card">
      <div class="mines-hud-head">
        <div class="mines-hud-copy">
          <div class="mines-mode-row">
            <span class="mines-mode-pill" data-mines-difficulty>${escapeHtml(difficultyText(state))}</span>
            <span class="mines-mode-pill" data-mines-shape>${escapeHtml(shapeText(state))}</span>
            <span class="mines-mode-pill is-soft" data-mines-status>${escapeHtml(statusText(state.status))}</span>
          </div>
          <p class="mines-board-summary" data-mines-summary>${escapeHtml(boardSummaryText(state))}</p>
          <p class="mines-note" data-mines-note>${escapeHtml(noteText(state))}</p>
        </div>
        <button class="btn btn-secondary mines-restart-btn" data-action="restart-game">Reiniciar</button>
      </div>

      <div class="mines-live-grid">
        ${renderStat("Minas restantes", String(state.minesRemaining), "minesRemaining")}
        ${renderStat("Tiempo", formatTime(state.elapsedMs), "time")}
      </div>

      ${renderModeSelector(state)}
    </section>
  `;
}

function syncNodeText(root, selector, value) {
  const node = root.querySelector(selector);
  if (node) {
    node.textContent = value;
  }
}

function syncModeButtons(root, state) {
  for (const button of root.querySelectorAll("[data-mines-mode]")) {
    const mode = button.dataset.minesMode;
    button.classList.toggle("is-active", mode === state.interactionMode);
    button.setAttribute("aria-pressed", mode === state.interactionMode ? "true" : "false");
  }
}

function syncActiveCellNode(node, cell, state) {
  const view = cellContentData(cell, state);
  node.className = view.className;
  node.innerHTML = view.content;
  node.disabled = view.disabled;
  node.setAttribute("aria-label", view.label);
}

function syncBoardCells(root, state) {
  const board = root.querySelector("[data-mines-board]");
  if (!board) {
    return false;
  }

  const nodes = Array.from(board.querySelectorAll("[data-mines-cell]"));
  if (nodes.length !== state.activeCellIndexes.length) {
    return false;
  }

  for (let order = 0; order < state.activeCellIndexes.length; order += 1) {
    const cell = state.cells[state.activeCellIndexes[order]];
    syncActiveCellNode(nodes[order], cell, state);
  }

  return true;
}

export const buscaminasGame = {
  id: "buscaminas",
  name: "Buscaminas",
  subtitle: "1 jugador",
  tagline: "Minas y banderas",
  minPlayers: 1,
  maxPlayers: 1,
  hidePlayerNames: true,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Objetivo", text: "Abre todas las celdas seguras sin tocar ninguna mina." },
    { title: "Números", text: "Cada número indica cuántas minas hay en las celdas activas vecinas." },
    { title: "Formas", text: "Puedes jugar en tablero clásico, cruz o rombo. Solo las celdas activas forman parte de la partida." },
    { title: "Banderas", text: "Marca con bandera las celdas que creas peligrosas. En escritorio puedes usar clic derecho." },
    { title: "Primera jugada", text: "La primera apertura siempre excluye la celda elegida y su vecindad activa inmediata." }
  ],
  getDefaultOptions() {
    return {
      difficulty: "easy",
      shape: "classic"
    };
  },
  normalizeOptions(options = {}) {
    return {
      difficulty: normalizeDifficulty(options.difficulty),
      shape: normalizeShape(options.shape)
    };
  },
  renderConfigPanel({ options }) {
    const difficulty = normalizeDifficulty(options?.difficulty);
    const shape = normalizeShape(options?.shape);

    return `
      <div class="block">
        <h3 class="block-title">Dificultad</h3>
        <div class="player-count-row">
          ${DIFFICULTY_ORDER.map((id) => {
            const meta = getDifficultyMeta(id);
            return `
              <button
                class="pill ${difficulty === id ? "is-active" : ""}"
                data-action="set-game-option"
                data-option="difficulty"
                data-value="${id}"
              >
                ${escapeHtml(`${meta.label} · ${meta.rows}x${meta.cols} · ${meta.mines}`)}
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <div class="block">
        <h3 class="block-title">Forma</h3>
        <div class="player-count-row">
          ${SHAPE_ORDER.map((id) => {
            const meta = getShapeMeta(id);
            return `
              <button
                class="pill ${shape === id ? "is-active" : ""}"
                data-action="set-game-option"
                data-option="shape"
                data-value="${id}"
              >
                ${escapeHtml(meta.label)}
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  },
  createInitialState({ options }) {
    return buildFreshState(options);
  },
  getTurnSlot() {
    return 0;
  },
  getResult(state) {
    if (state.status === "won") {
      return { type: "win" };
    }
    if (state.status === "lost") {
      return { type: "loss" };
    }
    return null;
  },
  getTurnMessage({ state }) {
    return statusText(state.status);
  },
  applyAction({ state, action }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "tick-time") {
      if (state.status !== "playing") {
        return { ok: true, state };
      }

      const next = cloneState(state);
      advanceTimer(next, sanitizeNowMs(action.nowMs));
      return { ok: true, state: next };
    }

    if (state.status === "won" || state.status === "lost") {
      return { ok: false, reason: "finished" };
    }

    const next = cloneState(state);
    const nowMs = sanitizeNowMs(action.nowMs);

    if (action.type === "set-interaction-mode") {
      const mode = String(action.mode || "").trim();
      if (mode !== "reveal" && mode !== "flag") {
        return { ok: false, reason: "invalid" };
      }
      next.interactionMode = mode;
      return { ok: true, state: next };
    }

    const index = Number(action.cell);
    if (!isCellIndex(index, next.cells.length) || !next.cells[index].isActive) {
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "toggle-flag") {
      return applyToggleFlag(next, index, nowMs);
    }

    if (action.type === "press-cell") {
      if (next.interactionMode === "flag") {
        return applyToggleFlag(next, index, nowMs);
      }
      return applyOpenCell(next, index, nowMs);
    }

    return { ok: false, reason: "invalid" };
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="minesBoardBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef9ee" />
              <stop offset="100%" stop-color="#f0e7d1" />
            </linearGradient>
            <linearGradient id="minesClosed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fffefc" />
              <stop offset="100%" stop-color="#e5dcc7" />
            </linearGradient>
            <linearGradient id="minesOpen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f8f3e7" />
              <stop offset="100%" stop-color="#ece2cb" />
            </linearGradient>
          </defs>
          <rect x="16" y="10" width="128" height="74" rx="19" fill="url(#minesBoardBg)" stroke="#dac7a2" />
          <g transform="translate(28 19)">
            <rect x="0" y="0" width="104" height="52" rx="12" fill="#e5d8bc" stroke="#cdbb98" />
            <g transform="translate(8 7)">
              ${Array.from({ length: 5 }, (_, row) =>
                Array.from({ length: 5 }, (_, col) => {
                  const x = col * 18;
                  const y = row * 8.8;
                  const isOpen = (row === 1 && col === 2) || (row === 2 && col === 2) || (row === 2 && col === 3);
                  const fill = isOpen ? "url(#minesOpen)" : "url(#minesClosed)";
                  return `<rect x="${x}" y="${y}" width="16" height="7" rx="2.5" fill="${fill}" stroke="#cdbd9f" />`;
                }).join("")
              ).join("")}
              <text x="44" y="18.5" font-size="6.6" font-weight="800" fill="#3566cc">1</text>
              <text x="62" y="27.3" font-size="6.6" font-weight="800" fill="#2f7c61">2</text>
              <text x="79.5" y="27.3" font-size="6.4" font-weight="800" fill="#c45444">⚑</text>
              <text x="25.5" y="36.1" font-size="6.4" font-weight="800" fill="#6f4f35">✹</text>
            </g>
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state }) {
    return `
      <section class="mines-shell" data-mines-root>
        ${renderHud(state)}
        ${renderBoardGrid(state)}
      </section>
    `;
  },
  patchBoardElement(boardWrap, { state }) {
    const root = boardWrap.querySelector("[data-mines-root]");
    if (!root) {
      return false;
    }

    syncNodeText(root, "[data-mines-difficulty]", difficultyText(state));
    syncNodeText(root, "[data-mines-shape]", shapeText(state));
    syncNodeText(root, "[data-mines-status]", statusText(state.status));
    syncNodeText(root, "[data-mines-summary]", boardSummaryText(state));
    syncNodeText(root, "[data-mines-note]", noteText(state));
    syncNodeText(root, '[data-mines-stat="minesRemaining"]', String(state.minesRemaining));
    syncNodeText(root, '[data-mines-stat="time"]', formatTime(state.elapsedMs));
    syncModeButtons(root, state);

    return syncBoardCells(root, state);
  },
  formatResult({ state }) {
    if (state.status === "won") {
      return {
        title: "Tablero despejado",
        subtitle: `Tiempo final ${formatTime(state.elapsedMs)} · ${shapeText(state)} · ${state.mineCount} minas.`,
        iconText: "✓",
        iconClass: "win"
      };
    }

    if (state.status === "lost") {
      return {
        title: "Has tocado una mina",
        subtitle: `Tiempo final ${formatTime(state.elapsedMs)}. Puedes volver a probar ${shapeText(state).toLowerCase()}.`,
        iconText: "✹",
        iconClass: "draw"
      };
    }

    return null;
  }
};
