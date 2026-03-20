const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function winnerLine(board, slot) {
  for (const line of LINES) {
    if (line.every((index) => board[index] === slot)) {
      return line;
    }
  }
  return null;
}

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

function randomStarterSlot(playerCount = 2) {
  return Math.floor(Math.random() * Math.max(1, playerCount));
}

export const tresEnRayaGame = {
  id: "tictactoe",
  name: "3 en raya",
  subtitle: "2 jugadores",
  tagline: "Clasico rapido",
  minPlayers: 2,
  maxPlayers: 2,
  rules: [
    { title: "Objetivo", text: "Consigue una linea de 3 marcas iguales." },
    { title: "Como se juega", text: "Cada jugador marca una casilla vacia en su turno." },
    { title: "Inicio", text: "La persona que empieza se elige al azar en cada partida." },
    { title: "Como se gana", text: "Gana quien haga 3 en raya en horizontal, vertical o diagonal." },
    { title: "Si nadie gana", text: "Si se llenan las casillas sin linea ganadora, es empate." }
  ],
  getDefaultOptions() {
    return {};
  },
  normalizeOptions() {
    return {};
  },
  createInitialState({ playerCount = 2 } = {}) {
    return {
      board: Array(9).fill(null),
      turnSlot: randomStarterSlot(playerCount),
      result: null,
      lastMove: null
    };
  },
  getTurnSlot(state) {
    return state.turnSlot;
  },
  getResult(state) {
    return state.result;
  },
  applyAction({ state, action, actorSlot }) {
    if (!action || action.type !== "mark") {
      return { ok: false, reason: "invalid" };
    }

    if (state.result) {
      return { ok: false, reason: "finished" };
    }

    if (actorSlot !== state.turnSlot) {
      return { ok: false, reason: "turn" };
    }

    const cell = Number(action.cell);
    if (!Number.isInteger(cell) || cell < 0 || cell > 8) {
      return { ok: false, reason: "invalid" };
    }

    if (state.board[cell] !== null) {
      return { ok: false, reason: "occupied" };
    }

    const next = {
      ...state,
      board: [...state.board],
      result: state.result ? { ...state.result } : null
    };

    next.board[cell] = actorSlot;
    next.lastMove = { cell, row: Math.floor(cell / 3), col: cell % 3 };

    const line = winnerLine(next.board, actorSlot);
    if (line) {
      next.result = {
        type: "win",
        slot: actorSlot,
        line
      };
      return { ok: true, state: next };
    }

    if (next.board.every((item) => item !== null)) {
      next.result = { type: "draw" };
      return { ok: true, state: next };
    }

    next.turnSlot = (state.turnSlot + 1) % 2;
    return { ok: true, state: next };
  },
  getTurnMessage({ state, players }) {
    if (state.result) {
      if (state.result.type === "draw") {
        return "Empate";
      }
      const winner = players.find((player) => player.slot === state.result.slot);
      return `Ha ganado ${winner ? winner.name : "Jugador"}`;
    }

    const active = players.find((player) => player.slot === state.turnSlot);
    return `Turno de ${active ? active.name : "Jugador"}`;
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="tttBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FEFBF4" />
              <stop offset="100%" stop-color="#F0ECDD" />
            </linearGradient>
            <linearGradient id="tttPlate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#F5EFE3" />
            </linearGradient>
            <linearGradient id="tttX" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#F18A73" />
              <stop offset="100%" stop-color="#D85D42" />
            </linearGradient>
            <linearGradient id="tttO" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#F8D86A" />
              <stop offset="100%" stop-color="#E9B838" />
            </linearGradient>
            <linearGradient id="tttXBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#67B38E" />
              <stop offset="100%" stop-color="#2E8460" />
            </linearGradient>
            <filter id="tttSoftShadow" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#3B5A4E" flood-opacity="0.16" />
            </filter>
            <filter id="tttPieceShadow" x="-30%" y="-30%" width="180%" height="180%">
              <feDropShadow dx="0.8" dy="1.3" stdDeviation="1.35" flood-color="#3D5A4E" flood-opacity="0.2" />
            </filter>
          </defs>

          <ellipse cx="80" cy="82.5" rx="52" ry="4.6" fill="rgba(37,58,49,0.14)" />
          <g transform="translate(-7 -4) scale(1.1)">
            <rect x="20" y="13" width="120" height="68" rx="15" fill="url(#tttPlate)" stroke="#D8CCB8" filter="url(#tttSoftShadow)" />
            <rect x="24" y="17" width="112" height="8" rx="4" fill="rgba(255,255,255,0.62)" />
            <rect x="22.5" y="15.5" width="115" height="63" rx="13" fill="none" stroke="rgba(255,255,255,0.38)" />
            <path d="M60 20V74M100 20V74M27 35H133M27 59H133" stroke="#CCBCA3" stroke-width="4.5" stroke-linecap="round" />

            <g stroke="url(#tttX)" stroke-width="7.2" stroke-linecap="round" filter="url(#tttPieceShadow)">
              <path d="M35 39L52 56" />
              <path d="M52 39L35 56" />
            </g>
            <g stroke="rgba(255,255,255,0.4)" stroke-width="1.8" stroke-linecap="round">
              <path d="M36 40L45 49" />
              <path d="M50 41L41 50" />
            </g>

            <circle cx="80" cy="47" r="10.8" fill="none" stroke="url(#tttO)" stroke-width="7.2" filter="url(#tttPieceShadow)" />
            <circle cx="80" cy="47" r="8.1" fill="none" stroke="rgba(255,255,255,0.32)" stroke-width="1.4" />

            <g stroke="url(#tttXBlue)" stroke-width="7.2" stroke-linecap="round" filter="url(#tttPieceShadow)">
              <path d="M108 36L125 53" />
              <path d="M125 36L108 53" />
            </g>
            <g stroke="rgba(255,255,255,0.34)" stroke-width="1.7" stroke-linecap="round">
              <path d="M109 37L117 45" />
              <path d="M123 37L114 46" />
            </g>

            <path d="M29 77C42 68 55 68 67 77" stroke="#DCCFB9" stroke-width="2" stroke-linecap="round" />
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state, players, canAct }) {
    const lastCell = Number.isInteger(state.lastMove?.cell) ? state.lastMove.cell : -1;
    const winningCells = state.result?.type === "win" ? new Set(state.result.line || []) : null;

    const cells = state.board
      .map((value, index) => {
        const occupied = value !== null;
        let content = "";
        const isLast = index === lastCell;
        const isWinning = winningCells ? winningCells.has(index) : false;

        if (value !== null) {
          const player = players.find((item) => item.slot === value);
          const color = player ? player.identity.color : "#233042";
          if (value === 0) {
            content = `
              <span class="mark mark-x" style="color:${color}">
                <span></span>
                <span></span>
              </span>
            `;
          } else {
            content = `<span class="mark mark-o" style="color:${color}"></span>`;
          }
        }

        const disabled = state.result || !canAct || occupied;
        const cellClass = `ttt-cell${isLast ? " is-last" : ""}${isWinning ? " is-winning" : ""}`;
        return `
          <button
            class="${cellClass}"
            data-action="game-action"
            data-game-action="mark"
            data-cell="${index}"
            ${disabled ? "disabled" : ""}
          >
            ${content}
          </button>
        `;
      })
      .join("");

    return `<div class="ttt-board">${cells}</div>`;
  },
  formatResult({ state, players }) {
    if (!state.result) {
      return null;
    }

    if (state.result.type === "draw") {
      return {
        title: "Empate",
        subtitle: "No hubo ganador esta vez.",
        iconText: "=",
        iconClass: "draw"
      };
    }

    const winner = players.find((player) => player.slot === state.result.slot);
    return {
      title: `Ha ganado ${winner ? escapeHtml(winner.name) : "Jugador"}`,
      subtitle: "Buena jugada. Puedes jugar otra vez.",
      iconText: winner ? winner.identity.icon : "★",
      iconClass: "win"
    };
  }
};
