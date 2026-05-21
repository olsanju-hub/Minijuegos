const BOARD_SIZE = 10;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const GOAL_CELL = 100;
const MAX_DIE = 6;
const VIEWBOX_SIZE = 1000;
const CELL_SIZE = VIEWBOX_SIZE / BOARD_SIZE;

const DIE_PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

const LADDERS = Object.freeze([
  Object.freeze({ id: "ladder-snail", start: 3, end: 39, width: 24, rungs: 5, color: "#9f7c64" }),
  Object.freeze({ id: "ladder-frog", start: 13, end: 47, width: 24, rungs: 5, color: "#9f7c64" }),
  Object.freeze({ id: "ladder-right", start: 31, end: 51, width: 22, rungs: 4, color: "#9f7c64" }),
  Object.freeze({ id: "ladder-tower", start: 37, end: 94, width: 28, rungs: 7, color: "#9f7c64" }),
  Object.freeze({ id: "ladder-left", start: 44, end: 83, width: 24, rungs: 5, color: "#9f7c64" }),
  Object.freeze({ id: "ladder-top", start: 70, end: 89, width: 20, rungs: 3, color: "#9f7c64" })
]);

const SNAKES = Object.freeze([
  Object.freeze({
    id: "snake-green",
    start: 98,
    end: 58,
    width: 34,
    body: "#b7d8c5",
    stripe: "#edf7f0",
    cheek: "#ef9d8d",
    tongue: "#f08d88",
    points: Object.freeze([
      Object.freeze({ cell: 98, dx: 0.56, dy: 0.42 }),
      Object.freeze({ cell: 83, dx: 0.48, dy: 0.56 }),
      Object.freeze({ cell: 80, dx: 0.22, dy: 0.5 }),
      Object.freeze({ cell: 79, dx: 0.64, dy: 0.54 }),
      Object.freeze({ cell: 62, dx: 0.46, dy: 0.42 }),
      Object.freeze({ cell: 59, dx: 0.28, dy: 0.48 }),
      Object.freeze({ cell: 58, dx: 0.78, dy: 0.7 })
    ])
  }),
  Object.freeze({
    id: "snake-purple",
    start: 74,
    end: 46,
    width: 34,
    body: "#ba9ac0",
    stripe: "#ead9ec",
    cheek: "#ef9d8d",
    tongue: "#f08d88",
    points: Object.freeze([
      Object.freeze({ cell: 74, dx: 0.8, dy: 0.48 }),
      Object.freeze({ cell: 76, dx: 0.2, dy: 0.52 }),
      Object.freeze({ cell: 75, dx: 0.52, dy: 0.56 }),
      Object.freeze({ cell: 66, dx: 0.4, dy: 0.54 }),
      Object.freeze({ cell: 54, dx: 0.48, dy: 0.44 }),
      Object.freeze({ cell: 46, dx: 0.42, dy: 0.74 })
    ])
  }),
  Object.freeze({
    id: "snake-cream",
    start: 88,
    end: 69,
    width: 34,
    body: "#f2e4a7",
    stripe: "#fff7d7",
    cheek: "#ef9d8d",
    tongue: "#f08d88",
    points: Object.freeze([
      Object.freeze({ cell: 88, dx: 0.68, dy: 0.44 }),
      Object.freeze({ cell: 92, dx: 0.62, dy: 0.36 }),
      Object.freeze({ cell: 89, dx: 0.56, dy: 0.46 }),
      Object.freeze({ cell: 72, dx: 0.34, dy: 0.52 }),
      Object.freeze({ cell: 69, dx: 0.74, dy: 0.6 })
    ])
  }),
  Object.freeze({
    id: "snake-blue",
    start: 53,
    end: 8,
    width: 36,
    body: "#8fc6e0",
    stripe: "#dbeef6",
    cheek: "#ef9d8d",
    tongue: "#f08d88",
    points: Object.freeze([
      Object.freeze({ cell: 53, dx: 0.5, dy: 0.42 }),
      Object.freeze({ cell: 48, dx: 0.56, dy: 0.56 }),
      Object.freeze({ cell: 33, dx: 0.52, dy: 0.52 }),
      Object.freeze({ cell: 29, dx: 0.64, dy: 0.56 }),
      Object.freeze({ cell: 14, dx: 0.46, dy: 0.52 }),
      Object.freeze({ cell: 8, dx: 0.56, dy: 0.76 })
    ])
  }),
  Object.freeze({
    id: "snake-yellow",
    start: 36,
    end: 4,
    width: 34,
    body: "#f6df81",
    stripe: "#fff4be",
    cheek: "#ef9d8d",
    tongue: "#f08d88",
    points: Object.freeze([
      Object.freeze({ cell: 36, dx: 0.46, dy: 0.48 }),
      Object.freeze({ cell: 35, dx: 0.62, dy: 0.56 }),
      Object.freeze({ cell: 25, dx: 0.44, dy: 0.54 }),
      Object.freeze({ cell: 16, dx: 0.54, dy: 0.5 }),
      Object.freeze({ cell: 4, dx: 0.48, dy: 0.78 })
    ])
  })
]);

const JUMPS_BY_START = new Map([
  ...LADDERS.map((item) => [item.start, { type: "ladder", to: item.end }]),
  ...SNAKES.map((item) => [item.start, { type: "snake", to: item.end }])
]);

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(value) {
  return Number(value).toFixed(1).replace(/\.0$/, "");
}

function point(cell, dx = 0.5, dy = 0.5) {
  const { row, col } = cellToGridPosition(cell);
  return {
    x: (col - 1 + dx) * CELL_SIZE,
    y: (row - 1 + dy) * CELL_SIZE
  };
}

function cellToGridPosition(cell) {
  const safeCell = clamp(Number(cell) || 1, 1, CELL_COUNT);
  const rowFromBottom = Math.floor((safeCell - 1) / BOARD_SIZE);
  const indexInRow = (safeCell - 1) % BOARD_SIZE;
  const visualRow = BOARD_SIZE - rowFromBottom;
  const visualCol = rowFromBottom % 2 === 0 ? indexInRow + 1 : BOARD_SIZE - indexInRow;

  return {
    row: visualRow,
    col: visualCol,
    rowFromBottom
  };
}

function renderGridPlacement(cell) {
  const { row, col } = cellToGridPosition(cell);
  return `--row:${row};--col:${col};`;
}

function rollDie() {
  return Math.floor(Math.random() * MAX_DIE) + 1;
}

function getJumpAt(cell) {
  return JUMPS_BY_START.get(cell) || null;
}

function buildSmoothPath(points) {
  if (points.length < 2) {
    return "";
  }

  let path = `M ${formatNumber(points[0].x)} ${formatNumber(points[0].y)}`;

  if (points.length === 2) {
    return `${path} L ${formatNumber(points[1].x)} ${formatNumber(points[1].y)}`;
  }

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    path += ` Q ${formatNumber(current.x)} ${formatNumber(current.y)} ${formatNumber(midX)} ${formatNumber(midY)}`;
  }

  const penultimate = points[points.length - 2];
  const last = points[points.length - 1];
  path += ` Q ${formatNumber(penultimate.x)} ${formatNumber(penultimate.y)} ${formatNumber(last.x)} ${formatNumber(last.y)}`;
  return path;
}

function angleBetween(fromPoint, toPoint) {
  return (Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x) * 180) / Math.PI;
}

function renderSnake(item) {
  const points = item.points.map((anchor) => point(anchor.cell, anchor.dx, anchor.dy));
  const path = buildSmoothPath(points);
  const head = points[0];
  const neck = points[1] || points[0];
  const tailAnchor = points[points.length - 1];
  const tailBase = points[points.length - 2] || tailAnchor;
  const headAngle = angleBetween(neck, head);
  const tailAngle = angleBetween(tailBase, tailAnchor);
  const stripeWidth = Math.max(8, item.width * 0.34);

  return `
    <g class="sns-snake sns-${item.id}">
      <path
        class="sns-snake-shadow"
        d="${path}"
        fill="none"
        stroke="rgba(59, 51, 40, 0.12)"
        stroke-width="${formatNumber(item.width + 8)}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="sns-snake-body"
        d="${path}"
        fill="none"
        stroke="${item.body}"
        stroke-width="${formatNumber(item.width)}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="sns-snake-stripe"
        d="${path}"
        fill="none"
        stroke="${item.stripe}"
        stroke-width="${formatNumber(stripeWidth)}"
        stroke-dasharray="${formatNumber(item.width * 0.72)} ${formatNumber(item.width * 0.58)}"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.9"
      />
      <g class="sns-snake-tail" transform="translate(${formatNumber(tailAnchor.x)} ${formatNumber(tailAnchor.y)}) rotate(${formatNumber(tailAngle)})">
        <ellipse cx="0" cy="0" rx="${formatNumber(item.width * 0.25)}" ry="${formatNumber(item.width * 0.12)}" fill="${item.body}" />
      </g>
      <g class="sns-snake-head" transform="translate(${formatNumber(head.x)} ${formatNumber(head.y)}) rotate(${formatNumber(headAngle)})">
        <ellipse cx="0" cy="0" rx="${formatNumber(item.width * 0.6)}" ry="${formatNumber(item.width * 0.44)}" fill="${item.body}" />
        <circle cx="${formatNumber(item.width * 0.18)}" cy="${formatNumber(item.width * -0.16)}" r="${formatNumber(item.width * 0.12)}" fill="#ffffff" />
        <circle cx="${formatNumber(item.width * 0.18)}" cy="${formatNumber(item.width * 0.16)}" r="${formatNumber(item.width * 0.12)}" fill="#ffffff" />
        <circle cx="${formatNumber(item.width * 0.21)}" cy="${formatNumber(item.width * -0.16)}" r="${formatNumber(item.width * 0.05)}" fill="#111111" />
        <circle cx="${formatNumber(item.width * 0.21)}" cy="${formatNumber(item.width * 0.16)}" r="${formatNumber(item.width * 0.05)}" fill="#111111" />
        <circle cx="${formatNumber(item.width * -0.08)}" cy="${formatNumber(item.width * 0.28)}" r="${formatNumber(item.width * 0.09)}" fill="${item.cheek}" />
        <circle cx="${formatNumber(item.width * -0.08)}" cy="${formatNumber(item.width * -0.28)}" r="${formatNumber(item.width * 0.09)}" fill="${item.cheek}" />
        <path
          d="M ${formatNumber(item.width * 0.48)} 0 L ${formatNumber(item.width * 0.84)} ${formatNumber(item.width * -0.12)} M ${formatNumber(item.width * 0.48)} 0 L ${formatNumber(item.width * 0.84)} ${formatNumber(item.width * 0.12)}"
          stroke="${item.tongue}"
          stroke-width="${formatNumber(Math.max(3, item.width * 0.08))}"
          stroke-linecap="round"
          fill="none"
        />
      </g>
    </g>
  `;
}

function renderLadder(item) {
  const from = point(item.start);
  const to = point(item.end);
  const trim = 18;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;
  const perpX = -unitY;
  const perpY = unitX;
  const startX = from.x + unitX * trim;
  const startY = from.y + unitY * trim;
  const endX = to.x - unitX * trim;
  const endY = to.y - unitY * trim;
  const railOffset = item.width / 2;

  const railAStart = { x: startX + perpX * railOffset, y: startY + perpY * railOffset };
  const railAEnd = { x: endX + perpX * railOffset, y: endY + perpY * railOffset };
  const railBStart = { x: startX - perpX * railOffset, y: startY - perpY * railOffset };
  const railBEnd = { x: endX - perpX * railOffset, y: endY - perpY * railOffset };

  const rungs = Array.from({ length: item.rungs }, (_, index) => {
    const ratio = (index + 1) / (item.rungs + 1);
    const rungA = {
      x: railAStart.x + (railAEnd.x - railAStart.x) * ratio,
      y: railAStart.y + (railAEnd.y - railAStart.y) * ratio
    };
    const rungB = {
      x: railBStart.x + (railBEnd.x - railBStart.x) * ratio,
      y: railBStart.y + (railBEnd.y - railBStart.y) * ratio
    };
    return `
      <line
        x1="${formatNumber(rungA.x)}"
        y1="${formatNumber(rungA.y)}"
        x2="${formatNumber(rungB.x)}"
        y2="${formatNumber(rungB.y)}"
      ></line>
    `;
  }).join("");

  return `
    <g class="sns-ladder sns-${item.id}" stroke="${item.color}">
      <line
        class="sns-ladder-rail"
        x1="${formatNumber(railAStart.x)}"
        y1="${formatNumber(railAStart.y)}"
        x2="${formatNumber(railAEnd.x)}"
        y2="${formatNumber(railAEnd.y)}"
      ></line>
      <line
        class="sns-ladder-rail"
        x1="${formatNumber(railBStart.x)}"
        y1="${formatNumber(railBStart.y)}"
        x2="${formatNumber(railBEnd.x)}"
        y2="${formatNumber(railBEnd.y)}"
      ></line>
      <g class="sns-ladder-rungs">${rungs}</g>
    </g>
  `;
}

function getCellZone(cell) {
  const { row, col } = cellToGridPosition(cell);
  const isTop = row <= BOARD_SIZE / 2;
  const isLeft = col <= BOARD_SIZE / 2;

  if (isTop && isLeft) {
    return "yellow";
  }
  if (isTop && !isLeft) {
    return "blue";
  }
  if (!isTop && isLeft) {
    return "coral";
  }
  return "green";
}

function cloneState(state) {
  return {
    ...state,
    pieces: state.pieces.map((piece) => ({ ...piece })),
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    pendingMove: state.pendingMove ? { ...state.pendingMove } : null,
    showRollAnimation: Boolean(state.showRollAnimation)
  };
}

function playerPiece(state, slot) {
  return state.pieces.find((piece) => piece.playerSlot === slot) || null;
}

function describePosition(position) {
  return position <= 0 ? "Fuera del tablero" : `Casilla ${position}`;
}

function buildEventText(player, move, roll) {
  const parts = [`${player.name} saca ${roll}.`];

  if (move.from === 0) {
    parts.push(`Entra al tablero y cae en la casilla ${move.rolledTo}.`);
  } else if (move.bounced) {
    parts.push(`Se pasa de la casilla 100 y rebota hasta la casilla ${move.rolledTo}.`);
  } else {
    parts.push(`Avanza hasta la casilla ${move.rolledTo}.`);
  }

  if (move.jumpType === "ladder") {
    parts.push(`Sube por la escalera hasta la casilla ${move.final}.`);
  } else if (move.jumpType === "snake") {
    parts.push(`Baja por la serpiente hasta la casilla ${move.final}.`);
  }

  if (move.final === GOAL_CELL) {
    parts.push("Llega exacto a la casilla 100 y gana.");
  } else if (move.extraTurn) {
    parts.push("Saca 6 y repite turno.");
  }

  return parts.join(" ");
}

function buildPendingEventText(player, move, roll) {
  const parts = [`${player.name} saca ${roll}.`];

  if (move.from === 0) {
    parts.push(`Toca la casilla ${move.rolledTo} para entrar al tablero.`);
  } else if (move.bounced) {
    parts.push(`Se pasa de la casilla 100 y debe rebotar hasta la casilla ${move.rolledTo}. Toca la casilla marcada.`);
  } else {
    parts.push(`Toca la casilla ${move.rolledTo} para mover la ficha.`);
  }

  if (move.jumpType === "ladder") {
    parts.push(`Desde ahi subira por la escalera hasta la casilla ${move.final}.`);
  } else if (move.jumpType === "snake") {
    parts.push(`Desde ahi bajara por la serpiente hasta la casilla ${move.final}.`);
  } else if (move.final === GOAL_CELL) {
    parts.push("Si la tocas, gana.");
  }

  return parts.join(" ");
}

function resolveMove(from, roll) {
  let rolledTo = from === 0 ? roll : from + roll;
  let bounced = false;

  if (rolledTo > GOAL_CELL) {
    bounced = true;
    rolledTo = GOAL_CELL - (rolledTo - GOAL_CELL);
  }

  let final = rolledTo;
  let jumpType = null;
  let jumpFrom = null;
  let jumpTo = null;

  const jump = getJumpAt(final);
  if (jump) {
    jumpType = jump.type;
    jumpFrom = final;
    jumpTo = jump.to;
    final = jump.to;
  }

  return {
    from,
    rolledTo,
    final,
    jumpType,
    jumpFrom,
    jumpTo,
    bounced,
    extraTurn: roll === 6 && final !== GOAL_CELL
  };
}

function buildPiecesByCell(state) {
  const map = new Map();
  for (const piece of state.pieces) {
    if (piece.position <= 0) {
      continue;
    }
    const bucket = map.get(piece.position) || [];
    bucket.push(piece);
    map.set(piece.position, bucket);
  }
  return map;
}

function renderDieFace(value, extraClass = "") {
  const pips = Number.isInteger(value) ? DIE_PIPS[value] || DIE_PIPS[1] : [];
  const classes = ["sns-die-face"];
  if (extraClass) {
    classes.push(extraClass);
  }
  return `
    <span class="${classes.join(" ")}">
      ${Array.from({ length: 9 }, (_, index) => `<span class="sns-die-pip ${pips.includes(index) ? "is-on" : ""}"></span>`).join("")}
    </span>
  `;
}

function getGhostDieValue(finalValue, tokenSeed) {
  const fallback = ((Number(tokenSeed) || 0) % 6) + 1;
  return fallback === finalValue ? (fallback % 6) + 1 : fallback;
}

function renderDie(value) {
  return `
    <div class="sns-die-cube-3d" aria-hidden="true">
      <div class="sns-die-face-3d face-1">${renderDieFace(1)}</div>
      <div class="sns-die-face-3d face-6">${renderDieFace(6)}</div>
      <div class="sns-die-face-3d face-3">${renderDieFace(3)}</div>
      <div class="sns-die-face-3d face-4">${renderDieFace(4)}</div>
      <div class="sns-die-face-3d face-5">${renderDieFace(5)}</div>
      <div class="sns-die-face-3d face-2">${renderDieFace(2)}</div>
    </div>
  `;
}

function renderPiece(piece, players, activeSlot) {
  const player = players.find((item) => item.slot === piece.playerSlot);
  const isActive = piece.playerSlot === activeSlot;
  const color = player ? player.identity.color : "#4a90e2";
  const icon = player ? player.identity.icon : "•";

  return `
    <span class="sns-piece ${isActive ? "is-active" : ""}" style="--sns-piece:${color}">
      <span class="sns-piece-core">${escapeHtml(icon)}</span>
    </span>
  `;
}

function renderPlayerRows(state, players) {
  return players
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((player) => {
      const piece = playerPiece(state, player.slot);
      const position = piece ? piece.position : 0;
      const isActive = player.slot === state.turnSlot && state.winnerSlot === null;
      return `
        <article class="sns-player-row ${isActive ? "is-active" : ""}">
          <span class="sns-player-token" style="--sns-player:${player.identity.color}">${escapeHtml(player.identity.icon)}</span>
          <div class="sns-player-meta">
            <p class="sns-player-name">${escapeHtml(player.name)}</p>
            <p class="sns-player-pos">${escapeHtml(describePosition(position))}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function buildBoardCells(state, players, canAct) {
  const piecesByCell = buildPiecesByCell(state);
  const lastMove = state.lastMove || null;
  const pendingMove = state.pendingMove || null;
  const activeSlot = state.turnSlot;

  return Array.from({ length: CELL_COUNT }, (_, index) => {
    const cell = index + 1;
    const { row, col } = cellToGridPosition(cell);
    const pieces = (piecesByCell.get(cell) || []).slice().sort((a, b) => a.playerSlot - b.playerSlot);
    const zone = getCellZone(cell);
    const classes = ["sns-cell", `zone-${zone}`];

    if ((row + col) % 2 === 0) {
      classes.push("is-tinted");
    }
    if (lastMove && cell === lastMove.final) {
      classes.push("is-final-stop");
    }
    if (lastMove?.jumpType === "ladder" && cell === lastMove.jumpFrom) {
      classes.push("is-jump-trigger", "is-ladder-trigger");
    }
    if (lastMove?.jumpType === "snake" && cell === lastMove.jumpFrom) {
      classes.push("is-jump-trigger", "is-snake-trigger");
    }
    if (lastMove?.jumpType && cell === lastMove.jumpTo) {
      classes.push("is-jump-target");
    }
    if (pendingMove && cell === pendingMove.rolledTo) {
      classes.push("is-pending-target");
    }
    if (pendingMove?.jumpType && pendingMove.final !== pendingMove.rolledTo && cell === pendingMove.final) {
      classes.push("is-pending-result");
    }

    const pieceMarkup = pieces.length
      ? `
        <span class="sns-piece-stack count-${Math.min(pieces.length, 4)}">
          ${pieces.map((piece) => renderPiece(piece, players, activeSlot)).join("")}
        </span>
      `
      : "";

    const targetMarkup =
      pendingMove && canAct && cell === pendingMove.rolledTo
        ? `
          <button
            class="sns-cell-target ${state.showRollAnimation ? "is-delayed" : ""}"
            data-action="game-action"
            data-game-action="confirm-move"
            data-cell="${cell}"
            aria-label="Mover a la casilla ${cell}"
          >
            <span class="sns-cell-target-badge">Mover</span>
          </button>
        `
        : "";

    const labelPieces = pieces
      .map((piece) => {
        const player = players.find((item) => item.slot === piece.playerSlot);
        return player ? player.name : `Jugador ${piece.playerSlot + 1}`;
      })
      .join(", ");

    const aria = labelPieces ? `Casilla ${cell}. Fichas de ${labelPieces}.` : `Casilla ${cell}.`;

    return `
      <div class="${classes.join(" ")}" style="${renderGridPlacement(cell)}" aria-label="${escapeHtml(aria)}">
        <span class="sns-cell-number">${cell}</span>
        <span class="sns-cell-piece-layer">${pieceMarkup}</span>
        ${targetMarkup}
      </div>
    `;
  }).join("");
}

export const escalerasSerpientesGame = {
  id: "escaleras-serpientes",
  name: "Escaleras y serpientes",
  subtitle: "2-4 jugadores",
  tagline: "Sube, resbala y rebota",
  minPlayers: 2,
  maxPlayers: 4,
  useCustomTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Tablero", text: "La partida se juega en una cuadrícula de 100 casillas en zigzag." },
    { title: "Tirada", text: "En tu turno tiras un dado de 6 caras y avanzas ese numero." },
    { title: "Entrada", text: "Las fichas empiezan fuera del tablero y entran avanzando la tirada obtenida." },
    { title: "Escaleras", text: "Si terminas en la base de una escalera, subes inmediatamente." },
    { title: "Serpientes", text: "Si terminas en la cabeza de una serpiente, bajas inmediatamente." },
    { title: "Turno extra", text: "Sacar 6 concede una tirada extra salvo que la partida termine." },
    { title: "Victoria", text: "Para ganar hay que llegar exacto a la casilla 100. Si te pasas, rebotas hacia atras." }
  ],
  getDefaultOptions() {
    return {};
  },
  normalizeOptions() {
    return {};
  },
  createInitialState({ playerCount }) {
    const totalPlayers = clamp(Number(playerCount) || 2, 2, 4);
    return {
      playerCount: totalPlayers,
      turnSlot: 0,
      diceValue: null,
      diceToken: 0,
      showRollAnimation: false,
      winnerSlot: null,
      lastEvent: "Pulsa Tirar dado para empezar.",
      lastMove: null,
      pendingMove: null,
      pieces: Array.from({ length: totalPlayers }, (_, slot) => ({
        id: `sns-piece-${slot}`,
        playerSlot: slot,
        position: 0
      }))
    };
  },
  getTurnSlot(state) {
    return state.turnSlot;
  },
  getResult(state) {
    return state.winnerSlot === null
      ? null
      : {
          type: "win",
          slot: state.winnerSlot
        };
  },
  getTurnMessage({ state, players }) {
    if (state.winnerSlot !== null) {
      const winner = players.find((player) => player.slot === state.winnerSlot);
      return `Ha ganado ${winner ? winner.name : "Jugador"}`;
    }

    const active = players.find((player) => player.slot === state.turnSlot);
    if (state.pendingMove) {
      return `Turno de ${active ? active.name : "Jugador"}. Toca la casilla ${state.pendingMove.rolledTo}.`;
    }
    return `Turno de ${active ? active.name : "Jugador"}. Tira el dado.`;
  },
  applyAction({ state, action, actorSlot, players }) {
    if (!action || (action.type !== "roll-die" && action.type !== "confirm-move")) {
      return { ok: false, reason: "invalid" };
    }

    if (state.winnerSlot !== null) {
      return { ok: false, reason: "finished" };
    }

    if (actorSlot !== state.turnSlot) {
      return { ok: false, reason: "turn" };
    }

    const next = cloneState(state);
    const piece = playerPiece(next, actorSlot);
    if (!piece) {
      return { ok: false, reason: "invalid" };
    }

    const player = players.find((item) => item.slot === actorSlot) || { name: `Jugador ${actorSlot + 1}` };
    if (action.type === "roll-die") {
      if (state.pendingMove) {
        return { ok: false, reason: "invalid" };
      }

      const roll = rollDie();
      const move = resolveMove(piece.position, roll);
      next.diceValue = roll;
      next.diceToken = (next.diceToken || 0) + 1;
      next.showRollAnimation = true;
      next.pendingMove = {
        playerSlot: actorSlot,
        roll,
        ...move
      };
      next.lastEvent = buildPendingEventText(player, next.pendingMove, roll);
      return { ok: true, state: next };
    }

    const pendingMove = next.pendingMove;
    if (!pendingMove || pendingMove.playerSlot !== actorSlot || Number(action.cell) !== pendingMove.rolledTo) {
      return { ok: false, reason: "invalid" };
    }

    piece.position = pendingMove.final;
    next.showRollAnimation = false;
    next.lastMove = {
      ...pendingMove
    };
    next.pendingMove = null;
    next.lastEvent = buildEventText(player, next.lastMove, pendingMove.roll);

    if (pendingMove.final === GOAL_CELL) {
      next.winnerSlot = actorSlot;
      return { ok: true, state: next };
    }

    if (!pendingMove.extraTurn) {
      next.turnSlot = (actorSlot + 1) % next.playerCount;
    }

    return { ok: true, state: next };
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <rect x="18" y="10" width="124" height="74" rx="16" fill="#fff5de" stroke="#e6cf9d" />
          <g transform="translate(29 16)">
            <rect x="0" y="0" width="102" height="62" rx="10" fill="#fffdf8" stroke="#d7caaa" />
            <g>
              ${Array.from({ length: 25 }, (_, index) => {
                const row = Math.floor(index / 5);
                const col = index % 5;
                const tinted = (row + col) % 2 === 0;
                const fill = tinted
                  ? row < 2
                    ? col < 3
                      ? "#f6e7ae"
                      : "#d8e9f7"
                    : col < 3
                      ? "#f8d3c6"
                      : "#dfeec7"
                  : "#ffffff";
                return `<rect x="${col * 20.4 + 0.8}" y="${row * 12.4 + 0.8}" width="20.4" height="12.4" fill="${fill}" stroke="#d9cdb7" />`;
              }).join("")}
            </g>
            <g stroke="#9f7c64" stroke-width="3" stroke-linecap="round">
              <line x1="18" y1="52" x2="35" y2="26" />
              <line x1="28" y1="54" x2="45" y2="28" />
              <line x1="21" y1="47" x2="31" y2="49" />
              <line x1="25" y1="40" x2="35" y2="42" />
              <line x1="29" y1="34" x2="39" y2="36" />
            </g>
            <path d="M80 12Q64 18 73 31T91 49T78 64" fill="none" stroke="#8fc6e0" stroke-width="12" stroke-linecap="round" />
            <path d="M80 12Q64 18 73 31T91 49T78 64" fill="none" stroke="#dceff6" stroke-width="4.5" stroke-dasharray="8 8" stroke-linecap="round" />
            <g transform="translate(80 12) rotate(165)">
              <ellipse cx="0" cy="0" rx="10" ry="7" fill="#8fc6e0" />
              <circle cx="2" cy="-2" r="1.8" fill="#fff" />
              <circle cx="2.5" cy="-2" r="0.8" fill="#111" />
            </g>
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state, players, canAct }) {
    const active = players.find((player) => player.slot === state.turnSlot) || null;
    const diceValue = Number.isInteger(state.diceValue) ? state.diceValue : null;
    const boardCells = buildBoardCells(state, players, canAct);
    const laddersSvg = LADDERS.map((item) => renderLadder(item)).join("");
    const snakesSvg = SNAKES.map((item) => renderSnake(item)).join("");
    const pendingMove = state.pendingMove || null;
    const rollDisabled = !canAct || Boolean(pendingMove);
    const helperText = pendingMove
      ? `Toca la casilla ${pendingMove.rolledTo}${pendingMove.jumpType ? ` y se ${pendingMove.jumpType === "ladder" ? "subira" : "bajara"} hasta la ${pendingMove.final}` : ""}.`
      : `Resultado: ${Number.isInteger(state.diceValue) ? state.diceValue : "-"}`;

    return `
      <style>
      /* EVOLUCIÓN PREMIUM: ESCALERAS Y SERPIENTES RÚNICAS EN PERGAMINO MEDIEVAL */

      .sns-shell, .sns-shell * {
        box-sizing: border-box !important;
      }

      .sns-shell {
        display: flex;
        flex-direction: row;
        gap: 32px;
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
        background: radial-gradient(circle at 50% 50%, #1a0f0a 0%, #0a0604 100%);
        border-radius: 20px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.85);
        font-family: 'Outfit', sans-serif;
        color: #ebd2b4;
      }

      /* MARCO DE ROBLE OSCURO RÚSTICO */
      .sns-board-frame {
        padding: 20px;
        background:
          radial-gradient(circle at 50% 50%, #3e271a 0%, #1e110a 100%),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 4px, transparent 4px, transparent 8px);
        border-radius: 18px;
        box-shadow:
          inset 0 4px 12px rgba(255,255,255,0.08),
          inset 0 -8px 20px rgba(0,0,0,0.8),
          0 15px 35px rgba(0,0,0,0.9);
        border: 5px solid #5a3c28;
      }

      /* TABLERO DE PERGAMINO ANTIGUO */
      .sns-board {
        width: min(520px, 80vw, 70vh);
        height: min(520px, 80vw, 70vh);
        aspect-ratio: 1 / 1;
        background:
          radial-gradient(circle at 50% 50%, #f4e3c1 0%, #d8be91 100%) !important;
        border: 6px solid #2b170c;
        border-radius: 12px;
        box-shadow:
          inset 0 0 40px rgba(74, 46, 26, 0.6),
          0 4px 8px rgba(0,0,0,0.5);
        position: relative;
        overflow: hidden;
      }

      /* CUADRÍCULA RÚNICA */
      .sns-grid {
        display: grid;
        grid-template-rows: repeat(10, 1fr);
        grid-template-columns: repeat(10, 1fr);
        width: 100%;
        height: 100%;
        gap: 1px;
        background: rgba(74, 46, 26, 0.15);
      }

      .sns-cell {
        background: transparent !important;
        border: 1px dashed rgba(74, 46, 26, 0.12);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 4px;
        position: relative;
      }
      .sns-cell.is-tinted {
        background: rgba(74, 46, 26, 0.04) !important;
      }

      /* NÚMEROS RÚNICOS GRABADOS */
      .sns-cell-number {
        font-family: 'Cinzel', serif, sans-serif;
        font-weight: 800;
        font-size: 13px;
        color: #4a2e1a !important;
        opacity: 0.85;
      }

      /* ESTADOS DE CAMINOS Y TRIGGER */
      .sns-cell.is-final-stop {
        box-shadow: inset 0 0 12px rgba(224, 122, 63, 0.45) !important;
        background: rgba(224, 122, 63, 0.08) !important;
      }
      .sns-cell.is-pending-target {
        box-shadow: inset 0 0 14px #d4af37 !important;
        background: rgba(212, 175, 55, 0.08) !important;
        animation: snsCellPendingPulse 1.5s infinite alternate;
      }
      @keyframes snsCellPendingPulse {
        0% { box-shadow: inset 0 0 8px #d4af37, 0 0 5px rgba(212, 175, 55, 0.3); }
        100% { box-shadow: inset 0 0 18px #d4af37, 0 0 15px rgba(212, 175, 55, 0.6); }
      }

      /* PEONES DE METAL ANTIGUO */
      .sns-piece {
        width: 26px;
        height: 26px;
        border-radius: 50% !important;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(255, 255, 255, 0.25) !important;
        box-shadow:
          inset 0 2px 4px rgba(255,255,255,0.4),
          inset 0 -3px 6px rgba(0,0,0,0.5),
          0 4px 6px rgba(0,0,0,0.5);
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.2);
      }
      .sns-piece.is-active {
        animation: snsPieceFloat 1.4s infinite ease-in-out !important;
      }
      @keyframes snsPieceFloat {
        0%, 100% { transform: translateY(0); box-shadow: 0 4px 6px rgba(0,0,0,0.5); }
        50% { transform: translateY(-6px); box-shadow: 0 10px 14px rgba(0,0,0,0.7); }
      }

      /* PEÓN DE BRONCE, PLATA, COBRE, ORO */
      .sns-piece[style*="--sns-piece:#ff2a2f"] { background: radial-gradient(circle at 35% 35%, #e65c5c 0%, #991a1a 80%, #4d0d0d 100%) !important; }
      .sns-piece[style*="--sns-piece:#3192dc"] { background: radial-gradient(circle at 35% 35%, #5cadff 0%, #1a6699 80%, #0d334d 100%) !important; }
      .sns-piece[style*="--sns-piece:#f4df19"] { background: radial-gradient(circle at 35% 35%, #ffe65c 0%, #99831a 80%, #4d410d 100%) !important; }
      .sns-piece[style*="--sns-piece:#70bc35"] { background: radial-gradient(circle at 35% 35%, #99e65c 0%, #3d991a 80%, #1f4d0d 100%) !important; }

      /* ANIMACIÓN FISICA DE REBOTE AL CAER EN CASILLA */
      .sns-piece {
        animation: snsPieceBounce 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
      }
      @keyframes snsPieceBounce {
        0% { transform: translateY(-50px) scale(1.35); opacity: 0; }
        60% { transform: translateY(4px) scale(0.9); }
        80% { transform: translateY(-6px) scale(1.04); }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }

      /* OVERLAYS REALISTAS: ESCALERAS DE CUERDA */
      .sns-ladder-rail {
        stroke-width: 7px !important;
        stroke: #4d2f1d !important;
        filter: drop-shadow(0px 8px 6px rgba(0,0,0,0.3)) !important;
      }
      .sns-ladder-rungs line {
        stroke-width: 5px !important;
        stroke: #664632 !important;
      }

      /* SERPIENTES REALISTAS CON RELIEVE Y OJOS BRILLANTES */
      .sns-snake-shadow {
        filter: blur(4px) !important;
        opacity: 0.45 !important;
      }
      .sns-snake-body {
        stroke-width: 22px !important;
        stroke-linecap: round !important;
        filter: drop-shadow(0px 10px 8px rgba(0,0,0,0.25)) !important;
      }
      .sns-snake-stripe {
        stroke-width: 8px !important;
        stroke-linecap: round !important;
      }
      .sns-snake-head ellipse {
        rx: 16px !important;
        ry: 12px !important;
        filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.2)) !important;
      }

      /* DADOS RÚNICOS 3D EN EL LANDING PAD */
      .sns-die-card {
        background:
          radial-gradient(circle at 50% 50%, #1e1510 0%, #0c0806 100%),
          repeating-linear-gradient(135deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 2px, transparent 2px, transparent 4px) !important;
        border: 2px solid #5a3c28 !important;
        border-radius: 16px !important;
        padding: 16px !important;
        box-shadow:
          inset 0 0 20px rgba(0,0,0,0.8),
          0 10px 25px rgba(0,0,0,0.5) !important;
        position: relative;
        overflow: hidden;
        text-align: center;
      }

      .sns-die-card::before {
        content: '';
        position: absolute;
        top: 6px; left: 6px; right: 6px; bottom: 6px;
        border-radius: 12px;
        border: 1px solid rgba(224, 122, 63, 0.15);
        box-shadow: inset 0 0 15px rgba(224, 122, 63, 0.08);
        pointer-events: none;
      }

      .sns-die {
        width: 60px;
        height: 60px;
        position: relative;
        perspective: 800px;
        transform-style: preserve-3d;
        margin: 16px auto;
      }
      .sns-die.is-clickable {
        cursor: pointer;
        pointer-events: auto;
      }

      .sns-die-cube-3d {
        width: 50px;
        height: 50px;
        position: absolute;
        top: 5px;
        left: 5px;
        transform-style: preserve-3d;
        transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.2);
        pointer-events: none; /* Evita interferencias en clics móviles */
        --die-neon: #e07a3f;
        --die-neon-rgb: 224, 122, 63;
      }

      .sns-die-face-3d {
        position: absolute;
        width: 50px;
        height: 50px;
        background: rgba(30, 20, 15, 0.45); /* Cristal translúcido cálido */
        backdrop-filter: blur(4px);
        border: 2px solid var(--die-neon);
        box-shadow:
          inset 0 0 12px rgba(var(--die-neon-rgb), 0.25),
          0 0 8px rgba(var(--die-neon-rgb), 0.3);
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        backface-visibility: visible;
      }

      /* CARAS DEL DADO 3D EN EL ESPACIO */
      .sns-die-face-3d.face-1 { transform: rotateY(0deg) translateZ(25px); }
      .sns-die-face-3d.face-6 { transform: rotateY(180deg) translateZ(25px); }
      .sns-die-face-3d.face-3 { transform: rotateY(-90deg) translateZ(25px); }
      .sns-die-face-3d.face-4 { transform: rotateY(90deg) translateZ(25px); }
      .sns-die-face-3d.face-5 { transform: rotateX(90deg) translateZ(25px); }
      .sns-die-face-3d.face-2 { transform: rotateX(-90deg) translateZ(25px); }

      /* PIPS GLOWING NEÓN RÚNICOS */
      .sns-die-pip {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: transparent;
      }
      .sns-die-pip.is-on {
        background: var(--die-neon);
        box-shadow: 0 0 10px var(--die-neon), 0 0 4px #ffffff;
      }

      /* ROTACIÓN FINAL SEGÚN DADO */
      .sns-die[style*="--die-value: 1"] .sns-die-cube-3d { transform: rotateX(720deg) rotateY(720deg); }
      .sns-die[style*="--die-value: 2"] .sns-die-cube-3d { transform: rotateX(810deg) rotateY(720deg); }
      .sns-die[style*="--die-value: 3"] .sns-die-cube-3d { transform: rotateX(720deg) rotateY(810deg); }
      .sns-die[style*="--die-value: 4"] .sns-die-cube-3d { transform: rotateX(720deg) rotateY(630deg); }
      .sns-die[style*="--die-value: 5"] .sns-die-cube-3d { transform: rotateX(630deg) rotateY(720deg); }
      .sns-die[style*="--die-value: 6"] .sns-die-cube-3d { transform: rotateX(900deg) rotateY(720deg); }

      /* ANIMACIONES GIMNÁSTICAS DE GIRO AL LANZAR */
      .sns-die.is-roll-a .sns-die-cube-3d {
        animation: snsRollDiceA 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      }
      .sns-die.is-roll-b .sns-die-cube-3d {
        animation: snsRollDiceB 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      }

      @keyframes snsRollDiceA {
        0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-30px); }
        40% { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg) translateY(-40px); }
        70% { transform: rotateX(720deg) rotateY(540deg) rotateZ(270deg) translateY(-10px); }
        100% { transform: rotateX(1080deg) rotateY(1080deg) rotateZ(360deg) translateY(0); }
      }
      @keyframes snsRollDiceB {
        0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-30px); }
        40% { transform: rotateX(180deg) rotateY(360deg) rotateZ(-90deg) translateY(-50px); }
        70% { transform: rotateX(540deg) rotateY(720deg) rotateZ(-270deg) translateY(-15px); }
        100% { transform: rotateX(1080deg) rotateY(1080deg) rotateZ(-360deg) translateY(0); }
      }

      /* SIDEBAR Y CONTENEDORES */
      .sns-side {
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
      }
      .sns-side-card {
        background: rgba(30, 20, 15, 0.5) !important;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(212, 175, 55, 0.15) !important;
        border-radius: 12px !important;
        padding: 16px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
      }
      .sns-side-card h4 {
        color: #ebd2b4 !important;
        margin-bottom: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .sns-roll-btn {
        background: linear-gradient(135deg, #a8623b 0%, #61341c 100%) !important;
        border: 1px solid #ebd2b4 !important;
        color: #fff !important;
        font-weight: 800 !important;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(168, 98, 59, 0.4) !important;
        transition: all 0.2s !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        width: 100%;
      }
      .sns-roll-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(168, 98, 59, 0.6) !important;
      }

      /* RESPONSIVE FLUIDO APANIZADO */
      @media (max-width: 900px) {
        .sns-shell {
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 12px;
        }
        .sns-board-frame {
          margin: 0 auto;
          padding: 8px;
        }
        .sns-side {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .sns-side-card {
          margin: 0 !important;
        }
        .sns-players-card {
          grid-column: span 2;
        }
      }

      @media (max-width: 600px) {
        .sns-side {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
      }

      /* OPTIMIZACIÓN LANDSCAPE EN MÓVILES (ALTURA LIMITADA) */
      @media (max-height: 520px) and (orientation: landscape) {
        .sns-shell {
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          padding: 6px !important;
          width: 100% !important;
          height: auto !important;
          max-height: 100vh !important;
          overflow: hidden !important;
        }
        .sns-board-frame {
          padding: 6px !important;
          border-radius: 10px !important;
          margin: 0 !important;
          border-width: 3px !important;
        }
        .sns-board {
          width: 76vh !important;
          height: 76vh !important;
          border-width: 4px !important;
        }
        .sns-side {
          flex-direction: row !important;
          flex-wrap: wrap !important;
          gap: 6px !important;
          height: 76vh !important;
          overflow-y: auto !important;
          align-content: start !important;
          padding-right: 4px !important;
        }
        .sns-side-card {
          padding: 8px !important;
          border-radius: 8px !important;
          width: 100% !important;
          min-width: 160px !important;
          margin: 0 !important;
        }
        .sns-die {
          width: 42px !important;
          height: 42px !important;
          margin: 4px auto !important;
        }
        .sns-die-cube-3d {
          width: 34px !important;
          height: 34px !important;
          top: 4px !important;
          left: 4px !important;
        }
        .sns-die-face-3d {
          width: 34px !important;
          height: 34px !important;
          border-radius: 6px !important;
          border-width: 1.5px !important;
        }
        .sns-die-face-3d.face-1 { transform: rotateY(0deg) translateZ(17px) !important; }
        .sns-die-face-3d.face-6 { transform: rotateY(180deg) translateZ(17px) !important; }
        .sns-die-face-3d.face-3 { transform: rotateY(-90deg) translateZ(17px) !important; }
        .sns-die-face-3d.face-4 { transform: rotateY(90deg) translateZ(17px) !important; }
        .sns-die-face-3d.face-5 { transform: rotateX(90deg) translateZ(17px) !important; }
        .sns-die-face-3d.face-2 { transform: rotateX(-90deg) translateZ(17px) !important; }

        .sns-die-pip {
          width: 5px !important;
          height: 5px !important;
        }
        .sns-roll-btn {
          padding: 8px 12px !important;
          font-size: 12px !important;
        }
        .sns-piece {
          width: 20px !important;
          height: 20px !important;
          border-width: 1.5px !important;
        }
        .sns-cell-number {
          font-size: 11px !important;
        }
      }
      </style>

      <section class="sns-shell">
        <div class="sns-board-frame">
          <div class="sns-board">
            <div class="sns-grid">
              ${boardCells}
            </div>
            <svg class="sns-overlay" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}" preserveAspectRatio="none" aria-hidden="true">
              <g class="sns-overlay-ladders">
                ${laddersSvg}
              </g>
              <g class="sns-overlay-snakes">
                ${snakesSvg}
              </g>
            </svg>
          </div>
        </div>

        <aside class="sns-side">
          <article class="sns-side-card sns-die-card">
            <div
              class="sns-die ${state.showRollAnimation ? (state.diceToken % 2 === 0 ? "is-roll-a" : "is-roll-b") : "is-settled"} ${!rollDisabled ? "is-clickable" : ""}"
              style="--die-value: ${diceValue || 1}"
              ${!rollDisabled ? 'data-action="game-action" data-game-action="roll-die"' : ''}
            >
              ${renderDie(diceValue)}
            </div>
            <button
              class="btn btn-primary sns-roll-btn"
              data-action="game-action"
              data-game-action="roll-die"
              ${rollDisabled ? "disabled" : ""}
            >
              Tirar dado
            </button>
            <p class="sns-side-note">${escapeHtml(helperText)}</p>
          </article>

          <article class="sns-side-card sns-turn-card">
            <h4>Turno</h4>
            <p class="sns-turn-player">${escapeHtml(active ? active.name : "Jugador")}</p>
            <p class="sns-side-note">${escapeHtml(state.lastEvent || "")}</p>
          </article>

          <article class="sns-side-card sns-players-card">
            <h4>Jugadores</h4>
            <div class="sns-player-list">
              ${renderPlayerRows(state, players)}
            </div>
          </article>
        </aside>
      </section>
    `;
  },
  formatResult({ state, players }) {
    if (state.winnerSlot === null) {
      return null;
    }

    const winner = players.find((player) => player.slot === state.winnerSlot);
    return {
      title: `Ha ganado ${winner ? escapeHtml(winner.name) : "Jugador"}`,
      subtitle: "Ha llegado exacto a la casilla 100.",
      iconText: winner ? winner.identity.icon : "★",
      iconClass: "win"
    };
  }
};
