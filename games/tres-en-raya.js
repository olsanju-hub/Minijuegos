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
    const winningLine = state.result?.type === "win" ? state.result.line : null;

    const cells = state.board
      .map((value, index) => {
        const occupied = value !== null;
        let content = "";
        let ghostContent = "";
        const isLast = index === lastCell;
        const isWinning = winningCells ? winningCells.has(index) : false;

        if (value !== null) {
          const player = players.find((item) => item.slot === value);
          const color = player ? player.identity.color : "#233042";
          if (value === 0) {
            content = `
              <span class="mark mark-x" style="--player-color: ${color}">
                <svg class="ttt-piece-svg" viewBox="0 0 100 100">
                  <path d="M20 15 L35 15 L50 40 L65 15 L80 15 L58 50 L80 85 L65 85 L50 60 L35 85 L20 85 L42 50 Z" 
                        fill="var(--player-color)" stroke="rgba(80, 62, 38, 0.28)" stroke-width="1.5" />
                  <path d="M22 18 L33 18 L50 42 L67 18 L78 18 L56 50 L78 82 L67 82 L50 58 L33 82 L22 82 L44 50 Z" 
                        fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
                </svg>
              </span>
            `;
          } else {
            content = `
              <span class="mark mark-o" style="--player-color: ${color}">
                <svg class="ttt-piece-svg" viewBox="0 0 100 100">
                  <!-- Extrusion shadow -->
                  <circle cx="50" cy="52" r="32" fill="none" stroke="rgba(80, 62, 38, 0.18)" stroke-width="16" />
                  <!-- Main Copper Ring -->
                  <circle cx="50" cy="50" r="32" fill="none" stroke="var(--player-color)" stroke-width="16" />
                  <!-- Bevel ring (outer highlight) -->
                  <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
                  <!-- Bevel ring (inner highlight) -->
                  <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
                  <!-- Specular shine -->
                  <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4" stroke-dasharray="30 170" transform="rotate(-40 50 50)" />
                </svg>
              </span>
            `;
          }
        } else if (!state.result && canAct) {
          if (state.turnSlot === 0) {
            ghostContent = `
              <span class="mark mark-x is-ghost">
                <svg class="ttt-piece-svg" viewBox="0 0 100 100">
                  <path d="M20 15 L35 15 L50 40 L65 15 L80 15 L58 50 L80 85 L65 85 L50 60 L35 85 L20 85 L42 50 Z" 
                        fill="#8a9a8f" stroke="rgba(80, 62, 38, 0.22)" stroke-width="1.5" />
                </svg>
              </span>
            `;
          } else {
            ghostContent = `
              <span class="mark mark-o is-ghost">
                <svg class="ttt-piece-svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="32" fill="none" stroke="#8a9a8f" stroke-width="16" />
                </svg>
              </span>
            `;
          }
        }

        const disabled = state.result || !canAct || occupied;
        const cellClass = `ttt-cell${isLast ? " is-last" : ""}${isWinning ? " is-winning" : ""}`;
        const cellLabel = occupied
          ? `Casilla ${index + 1}, ocupada por ${players.find((item) => item.slot === value)?.name || "jugador"}`
          : `Casilla ${index + 1}, marcar`;
        return `
          <button
            class="${cellClass}"
            data-action="game-action"
            data-game-action="mark"
            data-cell="${index}"
            data-row="${Math.floor(index / 3)}"
            data-col="${index % 3}"
            aria-label="${escapeHtml(cellLabel)}"
            ${disabled ? "disabled" : ""}
          >
            ${occupied ? content : ghostContent}
          </button>
        `;
      })
      .join("");

    let winningLineSvg = "";
    if (winningLine) {
      const lineStr = [...winningLine].sort((a, b) => a - b).join(",");
      let coords = null;
      if (lineStr === "0,1,2") coords = { x1: 20, y1: 50, x2: 280, y2: 50 };
      else if (lineStr === "3,4,5") coords = { x1: 20, y1: 150, x2: 280, y2: 150 };
      else if (lineStr === "6,7,8") coords = { x1: 20, y1: 250, x2: 280, y2: 250 };
      else if (lineStr === "0,3,6") coords = { x1: 50, y1: 20, x2: 50, y2: 280 };
      else if (lineStr === "1,4,7") coords = { x1: 150, y1: 20, x2: 150, y2: 280 };
      else if (lineStr === "2,5,8") coords = { x1: 250, y1: 20, x2: 250, y2: 280 };
      else if (lineStr === "0,4,8") coords = { x1: 30, y1: 30, x2: 270, y2: 270 };
      else if (lineStr === "2,4,6") coords = { x1: 270, y1: 30, x2: 30, y2: 270 };

      if (coords) {
        winningLineSvg = `
          <svg class="ttt-winning-line-svg" viewBox="0 0 300 300" preserveAspectRatio="none">
            <filter id="tttGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <!-- Glowing background trace -->
            <line x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}" 
                  stroke="rgba(255, 215, 0, 0.85)" stroke-width="12" stroke-linecap="round" filter="url(#tttGlow)" />
            <!-- Bright hot-white core line -->
            <line class="ttt-victory-line-core" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}" 
                  stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
          </svg>
        `;
      }
    }

    return `
      <div class="ttt-board-container${state.result?.type === "win" ? " has-winner" : ""}${state.result?.type === "draw" ? " is-draw" : ""}">
        <!-- Hidden SVG Definitions for Metal and Copper Materials -->
        <svg class="ttt-defs-svg" style="display: none;">
          <defs>
            <!-- Brushed steel linear gradient for X -->
            <linearGradient id="brushedSteel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#eaeaea" />
              <stop offset="15%" stop-color="#cccccc" />
              <stop offset="30%" stop-color="#999999" />
              <stop offset="45%" stop-color="#e0e0e0" />
              <stop offset="55%" stop-color="#ffffff" />
              <stop offset="70%" stop-color="#888888" />
              <stop offset="85%" stop-color="#555555" />
              <stop offset="100%" stop-color="#b0b0b0" />
            </linearGradient>
            <!-- Polished copper linear gradient for O -->
            <linearGradient id="polishedCopper" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffd5b8" />
              <stop offset="20%" stop-color="#f2996b" />
              <stop offset="40%" stop-color="#c15a30" />
              <stop offset="60%" stop-color="#d97443" />
              <stop offset="80%" stop-color="#8c3310" />
              <stop offset="100%" stop-color="#e08e62" />
            </linearGradient>
            <!-- Hand-drawn chalk displacements -->
            <filter id="chalkRoughness">
              <feTurbulence type="fractalNoise" baseFrequency="0.04 0.9" numOctaves="2" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>
        </svg>

        <!-- Brass Corners for the Walnut wood frame -->
        <div class="ttt-brass-corner top-left"></div>
        <div class="ttt-brass-corner top-right"></div>
        <div class="ttt-brass-corner bottom-left"></div>
        <div class="ttt-brass-corner bottom-right"></div>

        <style>
          /* Encapsulated tactile board styles for 3 en raya. */
          .screen.game-screen-tictactoe .ttt-board-container {
            --ttt-board-wood: #e5c58f;
            --ttt-board-edge: #9b6a35;
            --ttt-board-ink: #294258;
            --ttt-board-paper: #fff9ec;
            background:
              linear-gradient(135deg, rgba(255,255,255,0.58), rgba(255,255,255,0) 38%),
              linear-gradient(180deg, #f2d9aa 0%, var(--ttt-board-wood) 52%, #bb8745 100%);
            padding: clamp(18px, 4vw, 26px);
            border-radius: 24px;
            border: 1px solid rgba(113, 74, 32, 0.42);
            box-shadow:
              0 24px 34px rgba(73, 55, 30, 0.2),
              0 8px 0 #8b5929,
              inset 0 2px 0 rgba(255,255,255,0.72),
              inset 0 -7px 14px rgba(95, 58, 23, 0.24);
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 18px;
            max-width: 440px;
            width: 100%;
            position: relative;
            box-sizing: border-box;
            isolation: isolate;
          }

          .screen.game-screen-tictactoe .ttt-board-container::before {
            content: "";
            position: absolute;
            left: 9%;
            right: 9%;
            bottom: -15px;
            height: 22px;
            border-radius: 999px;
            background: radial-gradient(ellipse at center, rgba(60, 43, 23, 0.3), rgba(60, 43, 23, 0));
            filter: blur(3px);
            pointer-events: none;
            z-index: -1;
          }
          
          .screen.game-screen-tictactoe .ttt-brass-corner {
            position: absolute;
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #f9e8a2 0%, #d4af37 40%, #aa7c11 75%, #ffd700 100%);
            border: 1px solid rgba(0,0,0,0.4);
            box-shadow: 1px 1px 3px rgba(0,0,0,0.4), inset 0 0.5px 0.5px rgba(255,255,255,0.4);
            z-index: 4;
          }
          .screen.game-screen-tictactoe .ttt-brass-corner.top-left {
            top: 4px; left: 4px; border-radius: 3px 0 10px 0;
            border-top: 1px solid rgba(255,255,255,0.5); border-left: 1px solid rgba(255,255,255,0.5);
          }
          .screen.game-screen-tictactoe .ttt-brass-corner.top-right {
            top: 4px; right: 4px; border-radius: 0 3px 0 10px;
            border-top: 1px solid rgba(255,255,255,0.5); border-right: 1px solid rgba(255,255,255,0.5);
          }
          .screen.game-screen-tictactoe .ttt-brass-corner.bottom-left {
            bottom: 4px; left: 4px; border-radius: 0 10px 0 3px;
            border-bottom: 1px solid rgba(255,255,255,0.3); border-left: 1px solid rgba(255,255,255,0.5);
          }
          .screen.game-screen-tictactoe .ttt-brass-corner.bottom-right {
            bottom: 4px; right: 4px; border-radius: 10px 0 3px 0;
            border-bottom: 1px solid rgba(255,255,255,0.3); border-right: 1px solid rgba(255,255,255,0.3);
          }
          .screen.game-screen-tictactoe .ttt-brass-corner::after {
            content: "";
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: radial-gradient(circle, #888 20%, #333 80%);
            border: 0.5px solid rgba(0,0,0,0.5);
            top: 4px; left: 4px;
          }
          .screen.game-screen-tictactoe .ttt-brass-corner.top-right::after { left: auto; right: 4px; }
          .screen.game-screen-tictactoe .ttt-brass-corner.bottom-left::after { top: auto; bottom: 4px; }
          .screen.game-screen-tictactoe .ttt-brass-corner.bottom-right::after { top: auto; bottom: 4px; left: auto; right: 4px; }

          .screen.game-screen-tictactoe .ttt-board {
            background:
              linear-gradient(rgba(76, 105, 121, 0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(76, 105, 121, 0.07) 1px, transparent 1px),
              radial-gradient(circle at 50% 14%, #ffffff 0%, var(--ttt-board-paper) 56%, #e8d2aa 100%);
            background-size: 28px 28px, 28px 28px, auto;
            border: 1px solid rgba(129, 91, 45, 0.34);
            border-radius: 18px;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.94),
              inset 0 -5px 10px rgba(120, 84, 42, 0.14),
              0 12px 18px rgba(85, 62, 35, 0.16);
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: clamp(9px, 2.6vw, 13px);
            padding: clamp(10px, 2.8vw, 14px);
            aspect-ratio: 1;
            width: 100%;
            position: relative;
            box-sizing: border-box;
          }
          
          /* Background chalk lines */
          .screen.game-screen-tictactoe .ttt-chalk-grid {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            z-index: 1;
          }

          .screen.game-screen-tictactoe .ttt-chalk-grid g[stroke] {
            stroke: rgba(65, 96, 130, 0.46);
            stroke-width: 4;
            filter: none;
          }

          .screen.game-screen-tictactoe .ttt-chalk-grid g[fill] {
            display: none;
          }

          .screen.game-screen-tictactoe .ttt-cell {
            position: relative;
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(122, 91, 50, 0.16);
            border-radius: clamp(12px, 3vw, 16px);
            background:
              linear-gradient(180deg, rgba(255,255,255,0.84), rgba(255,255,255,0.18)),
              #fffaf0;
            cursor: pointer;
            padding: 0;
            z-index: 2;
            transition: all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
            overflow: visible;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.9),
              inset 0 -2px 4px rgba(116, 83, 42, 0.08);
          }
          .screen.game-screen-tictactoe .ttt-cell:hover:not([disabled]) {
            background:
              linear-gradient(180deg, #ffffff, #fff3dc);
            box-shadow:
              inset 0 0 0 1px rgba(44, 126, 210, 0.24),
              0 8px 14px rgba(70, 96, 120, 0.12);
            transform: translateY(-2px);
          }
          .screen.game-screen-tictactoe .ttt-cell.is-last {
            background:
              radial-gradient(circle at 50% 50%, rgba(46, 132, 232, 0.14), transparent 68%),
              #fffaf0;
            box-shadow: inset 0 0 0 2px rgba(46, 132, 232, 0.18);
          }
          .screen.game-screen-tictactoe .ttt-cell.is-winning {
            background:
              radial-gradient(circle, rgba(255, 213, 78, 0.38) 0%, rgba(255, 213, 78, 0.08) 72%),
              #fff9e9;
            animation: tttWinCellPulse 950ms ease-in-out infinite;
          }
          @keyframes tttWinCellPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.04); }
          }
          
          /* Piece container styles */
          .screen.game-screen-tictactoe .mark {
            width: 76%;
            height: 76%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            filter: drop-shadow(0 7px 9px rgba(59, 47, 32, 0.24));
          }
          .screen.game-screen-tictactoe .ttt-piece-svg {
            width: 100%;
            height: 100%;
            display: block;
          }
          
          /* Active player mark hover scale-up */
          .screen.game-screen-tictactoe .ttt-cell:not([disabled]) .mark:not(.is-ghost) {
            animation: tttPieceSpawn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          @keyframes tttPieceSpawn {
            0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          
          /* Ghost preview style */
          .screen.game-screen-tictactoe .mark.is-ghost {
            opacity: 0;
            transform: scale(0.85);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4)) opacity(0.3) saturate(0.5);
            pointer-events: none;
          }
          .screen.game-screen-tictactoe .ttt-cell:hover:not([disabled]) .mark.is-ghost {
            opacity: 0.5;
            transform: scale(0.98);
          }
          
          /* Winning line laser style */
          .screen.game-screen-tictactoe .ttt-winning-line-svg {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            z-index: 3;
          }
          .screen.game-screen-tictactoe .ttt-victory-line-core {
            stroke-dasharray: 400;
            stroke-dashoffset: 400;
            animation: tttDrawLine 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          @keyframes tttDrawLine {
            to { stroke-dashoffset: 0; }
          }

          .screen.game-screen-tictactoe .mark.is-ghost {
            filter: opacity(0.36) saturate(0.7);
          }

          .screen.game-screen-tictactoe .ttt-piece-svg [stroke="#111"],
          .screen.game-screen-tictactoe .ttt-piece-svg [stroke="#5a220a"] {
            stroke: var(--player-color, #315f4f);
          }
        </style>
        <div class="ttt-board">
          <!-- Chalk Grid SVG Background -->
          <svg class="ttt-chalk-grid" viewBox="0 0 300 300" preserveAspectRatio="none">
            <g stroke="rgba(255, 255, 255, 0.35)" stroke-width="4.5" stroke-linecap="round" filter="url(#chalkRoughness)">
              <!-- Vertical lines (imperfect and hand-drawn style) -->
              <path d="M 98 12 L 102 288" stroke-dasharray="15 3 25 2 10 5" />
              <path d="M 202 15 L 198 285" stroke-dasharray="30 2 10 4 20 2" />
              <!-- Horizontal lines -->
              <path d="M 12 98 L 288 102" stroke-dasharray="20 4 15 2 30 3" />
              <path d="M 15 198 L 285 202" stroke-dasharray="10 5 40 2 15 4" />
            </g>
            <!-- Chalk dust smears -->
            <g fill="rgba(255, 255, 255, 0.02)">
              <circle cx="50" cy="50" r="35" filter="url(#chalkRoughness)" />
              <circle cx="250" cy="120" r="28" filter="url(#chalkRoughness)" />
              <circle cx="120" cy="260" r="40" filter="url(#chalkRoughness)" />
            </g>
          </svg>
          
          ${cells}
          ${winningLineSvg}
        </div>
      </div>
    `;
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
