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

function renderDie(value) {
  return `
    <div class="sns-die-cube" aria-hidden="true">
      ${renderDieFace(value, "sns-die-face-final")}
      ${renderDieFace(5, "sns-die-face-ghost")}
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
            <div class="sns-die ${state.showRollAnimation ? (state.diceToken % 2 === 0 ? "is-roll-a" : "is-roll-b") : "is-settled"}">
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
