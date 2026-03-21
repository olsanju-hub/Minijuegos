const LEVELS = [
  {
    id: "almacen-1",
    label: "Nivel 1",
    subtitle: "Entrada suave",
    board: [
      "#######",
      "#     #",
      "# .$@ #",
      "#     #",
      "#######"
    ]
  },
  {
    id: "almacen-2",
    label: "Nivel 2",
    subtitle: "Doble entrega",
    board: [
      "########",
      "#  .   #",
      "#  .   #",
      "# $$@  #",
      "#      #",
      "########"
    ]
  },
  {
    id: "almacen-3",
    label: "Nivel 3",
    subtitle: "Paso estrecho",
    board: [
      "########",
      "#   .  #",
      "#   $  #",
      "# #$@. #",
      "#      #",
      "########"
    ]
  },
  {
    id: "almacen-4",
    label: "Nivel 4",
    subtitle: "Esquina interna",
    board: [
      "#########",
      "#   .   #",
      "#   $   #",
      "# # #$  #",
      "#  .@   #",
      "#       #",
      "#########"
    ]
  },
  {
    id: "almacen-5",
    label: "Nivel 5",
    subtitle: "Cierre en cadena",
    board: [
      "##########",
      "#   .    #",
      "#  $$    #",
      "# # .@$  #",
      "#   .    #",
      "#        #",
      "##########"
    ]
  }
];

const LEVEL_BY_ID = new Map(LEVELS.map((level, index) => [level.id, { ...level, index }]));

const DIRECTIONS = Object.freeze({
  up: { id: "up", row: -1, col: 0, icon: "↑", label: "Arriba" },
  down: { id: "down", row: 1, col: 0, icon: "↓", label: "Abajo" },
  left: { id: "left", row: 0, col: -1, icon: "←", label: "Izquierda" },
  right: { id: "right", row: 0, col: 1, icon: "→", label: "Derecha" }
});

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

function normalizeLevelId(value) {
  const candidate = String(value || "").trim();
  return LEVEL_BY_ID.has(candidate) ? candidate : LEVELS[0].id;
}

function getLevelMeta(levelId) {
  return LEVEL_BY_ID.get(normalizeLevelId(levelId));
}

function cellIndex(row, col, cols) {
  return row * cols + col;
}

function cellCoords(index, cols) {
  return {
    row: Math.floor(index / cols),
    col: index % cols
  };
}

function countRemainingGoals(boxes, targets) {
  return boxes.reduce((remaining, cell) => remaining + (targets[cell] ? 0 : 1), 0);
}

function buildLevelState(levelId) {
  const level = getLevelMeta(levelId);
  const rows = level.board.length;
  const cols = level.board[0].length;
  const totalCells = rows * cols;
  const walls = Array(totalCells).fill(false);
  const targets = Array(totalCells).fill(false);
  const boxes = [];
  let playerCell = -1;

  for (let row = 0; row < rows; row += 1) {
    const line = level.board[row];
    for (let col = 0; col < cols; col += 1) {
      const char = line[col];
      const index = cellIndex(row, col, cols);

      if (char === "#") {
        walls[index] = true;
      }

      if (char === "." || char === "+" || char === "*") {
        targets[index] = true;
      }

      if (char === "@" || char === "+") {
        playerCell = index;
      }

      if (char === "$" || char === "*") {
        boxes.push(index);
      }
    }
  }

  const remainingGoals = countRemainingGoals(boxes, targets);

  return {
    levelId: level.id,
    levelLabel: level.label,
    levelSubtitle: level.subtitle,
    levelNumber: level.index + 1,
    rows,
    cols,
    walls,
    targets,
    playerCell,
    boxes,
    history: [],
    moveCount: 0,
    remainingGoals,
    status: remainingGoals === 0 ? "won" : "playing",
    lastAction: "ready",
    note: "Empuja todas las cajas hasta las dianas."
  };
}

function snapshotState(state) {
  return {
    playerCell: state.playerCell,
    boxes: [...state.boxes],
    moveCount: state.moveCount,
    remainingGoals: state.remainingGoals
  };
}

function buildBlockedState(state, message) {
  return {
    ...state,
    boxes: [...state.boxes],
    history: [...state.history],
    lastAction: "blocked",
    note: message
  };
}

function buildMoveState(state, nextPlayerCell, nextBoxes, message, lastAction) {
  const remainingGoals = countRemainingGoals(nextBoxes, state.targets);
  const nextStatus = remainingGoals === 0 ? "won" : "playing";

  return {
    ...state,
    playerCell: nextPlayerCell,
    boxes: nextBoxes,
    history: [...state.history, snapshotState(state)],
    moveCount: state.moveCount + 1,
    remainingGoals,
    status: nextStatus,
    lastAction,
    note:
      nextStatus === "won"
        ? `Nivel completado en ${state.moveCount + 1} movimientos.`
        : message
  };
}

function applyMove(state, directionId) {
  const direction = DIRECTIONS[directionId];
  if (!direction) {
    return { ok: false, reason: "invalid" };
  }

  const player = cellCoords(state.playerCell, state.cols);
  const nextRow = player.row + direction.row;
  const nextCol = player.col + direction.col;

  if (nextRow < 0 || nextRow >= state.rows || nextCol < 0 || nextCol >= state.cols) {
    return {
      ok: true,
      state: buildBlockedState(state, "Movimiento bloqueado. Ese borde no es transitable.")
    };
  }

  const nextCell = cellIndex(nextRow, nextCol, state.cols);
  if (state.walls[nextCell]) {
    return {
      ok: true,
      state: buildBlockedState(state, "Movimiento bloqueado. Hay una pared delante.")
    };
  }

  const boxSet = new Set(state.boxes);
  if (boxSet.has(nextCell)) {
    const pushRow = nextRow + direction.row;
    const pushCol = nextCol + direction.col;

    if (pushRow < 0 || pushRow >= state.rows || pushCol < 0 || pushCol >= state.cols) {
      return {
        ok: true,
        state: buildBlockedState(state, "No hay espacio para empujar la caja.")
      };
    }

    const pushCell = cellIndex(pushRow, pushCol, state.cols);
    if (state.walls[pushCell] || boxSet.has(pushCell)) {
      return {
        ok: true,
        state: buildBlockedState(state, "No puedes empujar la caja en esa dirección.")
      };
    }

    const nextBoxes = state.boxes.map((boxCell) => (boxCell === nextCell ? pushCell : boxCell));
    return {
      ok: true,
      state: buildMoveState(state, nextCell, nextBoxes, "Caja empujada. Sigue colocándolas.", "push")
    };
  }

  return {
    ok: true,
    state: buildMoveState(state, nextCell, [...state.boxes], "Movimiento correcto.", "move")
  };
}

function applyUndo(state) {
  if (state.history.length === 0) {
    return {
      ok: true,
      state: {
        ...state,
        boxes: [...state.boxes],
        history: [...state.history],
        lastAction: "undo-empty",
        note: "No hay movimientos para deshacer."
      }
    };
  }

  const previous = state.history[state.history.length - 1];

  return {
    ok: true,
    state: {
      ...state,
      playerCell: previous.playerCell,
      boxes: [...previous.boxes],
      history: state.history.slice(0, -1),
      moveCount: previous.moveCount,
      remainingGoals: previous.remainingGoals,
      status: previous.remainingGoals === 0 ? "won" : "playing",
      lastAction: "undo",
      note: "Último movimiento deshecho."
    }
  };
}

function levelSummary(level) {
  const targetCount = level.board.join("").split("").filter((char) => char === "." || char === "+" || char === "*").length;
  return `${level.label} · ${targetCount} ${targetCount === 1 ? "caja" : "cajas"}`;
}

function noteText(state) {
  if (state.status === "won") {
    return "Todas las cajas están sobre objetivo. Tablero congelado.";
  }

  return state.note;
}

function renderStat(label, value, tone = "") {
  const className = tone ? `sokoban-stat ${tone}` : "sokoban-stat";
  return `
    <div class="${className}">
      <span class="sokoban-stat-label">${escapeHtml(label)}</span>
      <strong class="sokoban-stat-value">${escapeHtml(String(value))}</strong>
    </div>
  `;
}

function renderHud(state, canAct) {
  const hudClass = `sokoban-hud card${state.status === "won" ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}`;
  const noteClass = `sokoban-note${state.status === "won" ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}`;

  return `
    <section class="${hudClass}">
      <div class="sokoban-hud-copy">
        <div class="sokoban-mode-row">
          <span class="sokoban-mode-pill">Sokoban</span>
          <span class="sokoban-mode-pill is-soft">${escapeHtml(state.levelLabel)}</span>
        </div>
        <p class="sokoban-level-subtitle">${escapeHtml(state.levelSubtitle)}</p>
        <p class="${noteClass}">${escapeHtml(noteText(state))}</p>
      </div>

      <div class="sokoban-live-grid">
        ${renderStat("Nivel", state.levelNumber)}
        ${renderStat("Movimientos", state.moveCount)}
        ${renderStat("Pendientes", state.remainingGoals, state.remainingGoals === 0 ? "is-clear" : "")}
      </div>
    </section>
  `;
}

function renderBoardCell(index, state, boxSet) {
  const isWall = state.walls[index];
  const isTarget = state.targets[index];
  const hasBox = boxSet.has(index);
  const hasPlayer = state.playerCell === index;
  const boxOnTarget = hasBox && isTarget;
  const playerOnTarget = hasPlayer && isTarget;

  const classes = [
    "sokoban-cell",
    isWall ? "is-wall" : "is-floor"
  ];

  if (isTarget) {
    classes.push("is-target");
  }
  if (boxOnTarget) {
    classes.push("has-box-on-target");
  }
  if (playerOnTarget) {
    classes.push("has-player-on-target");
  }
  if (hasBox) {
    classes.push("has-box");
  }
  if (hasPlayer) {
    classes.push("has-player");
  }

  return `
    <div class="${classes.join(" ")}" aria-hidden="true">
      <span class="sokoban-tile"></span>
      ${!isWall && isTarget ? '<span class="sokoban-goal"></span>' : ""}
      ${hasBox ? '<span class="sokoban-entity sokoban-box"><span class="sokoban-box-rivet"></span><span class="sokoban-box-rivet is-right"></span></span>' : ""}
      ${hasPlayer ? '<span class="sokoban-entity sokoban-player"><span class="sokoban-player-core"></span></span>' : ""}
    </div>
  `;
}

function renderBoardGrid(state) {
  const boxSet = new Set(state.boxes);
  const boardClass = `sokoban-board-frame${state.lastAction === "blocked" ? " is-blocked" : ""}${state.status === "won" ? " is-complete" : ""}`;
  const summary =
    state.status === "won"
      ? `${state.levelLabel}. Nivel completado. Tablero congelado hasta reiniciar.`
      : `${state.levelLabel}. ${state.remainingGoals} ${state.remainingGoals === 1 ? "caja pendiente" : "cajas pendientes"}.`;

  return `
    <div class="${boardClass}" data-game-swipe-zone="sokoban">
      <div
        class="sokoban-board"
        role="img"
        aria-label="${escapeHtml(summary)}"
        style="--sokoban-cols:${state.cols};"
      >
        ${Array.from({ length: state.rows * state.cols }, (_, index) => renderBoardCell(index, state, boxSet)).join("")}
      </div>
    </div>
  `;
}

function renderDirectionButton(direction, canAct) {
  return `
    <button
      class="btn btn-secondary sokoban-control-btn is-${escapeHtml(direction.id)}"
      data-action="game-action"
      data-game-action="move-direction"
      data-direction="${escapeHtml(direction.id)}"
      aria-label="Mover ${escapeHtml(direction.label.toLowerCase())}"
      ${!canAct ? "disabled" : ""}
    >
      ${escapeHtml(direction.icon)}
    </button>
  `;
}

function renderControls(state, canAct) {
  const controlsClass = `sokoban-controls card${state.status === "won" ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}`;
  const title = state.status === "won" ? "Nivel resuelto" : "Mover";
  const note = state.status === "won" ? "Tablero congelado hasta reiniciar" : "Desliza en móvil o usa teclado";
  const hint =
    state.status === "won"
      ? "Usa Reiniciar partida o Jugar otra vez para repetir este nivel."
      : "Desliza sobre el tablero. Deshaz si una caja queda mal colocada.";

  return `
    <section class="${controlsClass}">
      <div class="sokoban-controls-head">
        <div class="sokoban-controls-copy">
          <h4 class="sokoban-controls-title">${escapeHtml(title)}</h4>
          <p class="sokoban-controls-note">${escapeHtml(note)}</p>
        </div>
        <button
          class="btn btn-secondary sokoban-undo-btn ${state.history.length > 0 ? "is-ready" : ""}"
          data-action="game-action"
          data-game-action="undo-move"
          ${!canAct || state.history.length === 0 ? "disabled" : ""}
        >
          Deshacer
        </button>
      </div>

      <div class="sokoban-control-pad">
        <span class="sokoban-control-gap" aria-hidden="true"></span>
        ${renderDirectionButton(DIRECTIONS.up, canAct)}
        <span class="sokoban-control-gap" aria-hidden="true"></span>
        ${renderDirectionButton(DIRECTIONS.left, canAct)}
        ${renderDirectionButton(DIRECTIONS.down, canAct)}
        ${renderDirectionButton(DIRECTIONS.right, canAct)}
      </div>

      <p class="sokoban-controls-hint">
        ${escapeHtml(hint)}
      </p>
    </section>
  `;
}

function renderSokobanShell(state, canAct) {
  const shellClass = `sokoban-shell${state.status === "won" ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}`;
  return `
    <section class="${shellClass}" data-sokoban-root>
      ${renderHud(state, canAct)}
      <div class="sokoban-stage">
        ${renderBoardGrid(state)}
      </div>
      ${renderControls(state, canAct)}
    </section>
  `;
}

export const sokobanGame = {
  id: "sokoban",
  name: "Sokoban",
  subtitle: "1 jugador",
  tagline: "Cajas y objetivos",
  minPlayers: 1,
  maxPlayers: 1,
  hidePlayerNames: true,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Objetivo", text: "Empuja todas las cajas hasta las dianas del almacén." },
    { title: "Movimiento", text: "El jugador se mueve en cuatro direcciones cuando la siguiente celda está libre." },
    { title: "Empuje", text: "Solo puedes empujar una caja si la celda que queda detrás está libre." },
    { title: "Bloqueos", text: "Si hay pared, borde o una segunda caja detrás, el movimiento se bloquea." },
    { title: "Control", text: "Puedes jugar con flechas, WASD, deslizando sobre el tablero en móvil y deshacer el último paso." }
  ],
  getDefaultOptions() {
    return {
      level: LEVELS[0].id
    };
  },
  normalizeOptions(options = {}) {
    return {
      level: normalizeLevelId(options.level)
    };
  },
  renderConfigPanel({ options }) {
    const currentLevel = normalizeLevelId(options?.level);

    return `
      <div class="block">
        <h3 class="block-title">Nivel inicial</h3>
        <p class="block-sub">Una partida equivale a un nivel concreto.</p>
        <div class="player-count-row">
          ${LEVELS.map((level) => {
            return `
              <button
                class="pill ${currentLevel === level.id ? "is-active" : ""}"
                data-action="set-game-option"
                data-option="level"
                data-value="${escapeHtml(level.id)}"
              >
                ${escapeHtml(levelSummary(level))}
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  },
  createInitialState({ options }) {
    return buildLevelState(options?.level);
  },
  getTurnSlot() {
    return 0;
  },
  getResult(state) {
    return state.status === "won" ? { type: "win" } : null;
  },
  getTurnMessage({ state }) {
    return state.status === "won" ? "Nivel completado" : "Empuja las cajas";
  },
  applyAction({ state, action }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (state.status === "won") {
      return { ok: false, reason: "finished" };
    }

    if (action.type === "undo") {
      return applyUndo(state);
    }

    if (action.type === "move") {
      return applyMove(state, String(action.direction || ""));
    }

    return { ok: false, reason: "invalid" };
  },
  getKeyboardAction({ event, canAct, state }) {
    if (!event) {
      return null;
    }

    const key = String(event.key || "").toLowerCase();
    if (!canAct) {
      return null;
    }

    if (event.metaKey || event.ctrlKey) {
      if (key === "z") {
        return { type: "undo" };
      }
      return null;
    }

    if (key === "arrowup" || key === "w") {
      return { type: "move", direction: "up" };
    }
    if (key === "arrowdown" || key === "s") {
      return { type: "move", direction: "down" };
    }
    if (key === "arrowleft" || key === "a") {
      return { type: "move", direction: "left" };
    }
    if (key === "arrowright" || key === "d") {
      return { type: "move", direction: "right" };
    }
    if (key === "z" || key === "u") {
      return { type: "undo" };
    }

    return null;
  },
  getTouchAction({ startX, startY, endX, endY, canAct, state }) {
    if (!canAct || !state || state.status === "won") {
      return null;
    }

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const majorAxis = Math.max(absX, absY);
    const minorAxis = Math.min(absX, absY);

    if (majorAxis < 34 || minorAxis > majorAxis * 0.72) {
      return null;
    }

    if (absX > absY) {
      return { type: "move", direction: deltaX < 0 ? "left" : "right" };
    }

    return { type: "move", direction: deltaY < 0 ? "up" : "down" };
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="sokoBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fff5e8" />
              <stop offset="100%" stop-color="#efdcc3" />
            </linearGradient>
            <linearGradient id="sokoFloor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fffefb" />
              <stop offset="100%" stop-color="#eadfc8" />
            </linearGradient>
            <linearGradient id="sokoWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#d8b389" />
              <stop offset="100%" stop-color="#b78858" />
            </linearGradient>
            <linearGradient id="sokoBox" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#f1ba73" />
              <stop offset="100%" stop-color="#cc8742" />
            </linearGradient>
          </defs>
          <rect x="18" y="10" width="124" height="74" rx="18" fill="url(#sokoBg)" stroke="#d9c2a1" />
          <g transform="translate(32 20)">
            <rect x="0" y="0" width="96" height="54" rx="14" fill="#e3cfb0" stroke="#c8ad84" />
            <g transform="translate(8 7)">
              <rect x="0" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="18" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="36" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="54" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="72" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />

              <rect x="0" y="18" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="18" y="18" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="36" y="18" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="54" y="18" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="72" y="18" width="16" height="16" rx="4" fill="url(#sokoWall)" />

              <rect x="0" y="36" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="18" y="36" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="36" y="36" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="54" y="36" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="72" y="36" width="16" height="16" rx="4" fill="url(#sokoWall)" />

              <rect x="0" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="18" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="36" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="54" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="72" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />

              <circle cx="26" cy="26" r="4.2" fill="none" stroke="#5ba66a" stroke-width="2.6" />
              <rect x="35" y="19" width="18" height="18" rx="4.8" fill="url(#sokoBox)" stroke="#a86d35" />
              <path d="M35 28H53M44 19V37" stroke="rgba(255,255,255,0.34)" stroke-width="1.4" />
              <circle cx="61" cy="43" r="7" fill="#67a0ff" stroke="#3562c9" stroke-width="2" />
              <circle cx="61" cy="40.2" r="2.4" fill="#eff6ff" />
            </g>
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state, canAct }) {
    return renderSokobanShell(state, canAct);
  },
  patchBoardElement(boardWrap, { state, canAct }) {
    const root = boardWrap.querySelector("[data-sokoban-root]");
    if (!root) {
      return false;
    }

    boardWrap.innerHTML = renderSokobanShell(state, canAct);
    return true;
  },
  formatResult({ state }) {
    return {
      title: `${state.levelLabel} completado`,
      subtitle: `${state.levelSubtitle} · ${state.moveCount} movimientos · tablero congelado. Pulsa Jugar otra vez para reiniciarlo.`,
      iconText: "✓",
      iconClass: "win"
    };
  }
};
