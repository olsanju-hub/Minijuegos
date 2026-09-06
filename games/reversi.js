const BOARD_SIZE = 8;
const PLAYER_ONE = 0;
const PLAYER_TWO = 1;

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function cellKey(row, col) {
  return `${row}:${col}`;
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
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

function getFlipsForMove(board, row, col, playerSlot) {
  if (board[row][col] !== null) {
    return [];
  }
  const opponentSlot = 1 - playerSlot;
  const flips = [];

  for (const [dr, dc] of DIRECTIONS) {
    let r = row + dr;
    let c = col + dc;
    const path = [];

    while (isInsideBoard(r, c) && board[r][c] === opponentSlot) {
      path.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    if (path.length > 0 && isInsideBoard(r, c) && board[r][c] === playerSlot) {
      flips.push(...path);
    }
  }

  return flips;
}

function hasLegalMoves(board, playerSlot) {
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if (getFlipsForMove(board, r, c, playerSlot).length > 0) {
        return true;
      }
    }
  }
  return false;
}

function countPieces(board, slot) {
  let total = 0;
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if (board[r][c] === slot) {
        total += 1;
      }
    }
  }
  return total;
}

export const reversiGame = {
  id: "reversi",
  name: "Reversi",
  subtitle: "2 jugadores",
  tagline: "Gira y domina el tablero",
  minPlayers: 2,
  maxPlayers: 2,
  rules: [
    { title: "Objetivo", text: "Terminar la partida con más fichas del propio color sobre el tablero." },
    { title: "Inicio", text: "El tablero comienza con 2 fichas de cada jugador colocadas en diagonal en el centro." },
    { title: "Movimiento", text: "Debes colocar una ficha en una casilla vacía de modo que 'atrapes' una o más fichas rivales en línea (horizontal, vertical o diagonal) entre la nueva ficha y otra de tu color ya existente." },
    { title: "Captura", text: "Todas las fichas del rival atrapadas cambian de color (se voltean) y pasan a ser tuyas." },
    { title: "Paso de turno", text: "Si un jugador no tiene movimientos válidos en su turno, está obligado a pasar y el rival vuelve a jugar." },
    { title: "Fin de partida", text: "El juego termina cuando ninguno de los dos jugadores puede realizar un movimiento legal, o cuando el tablero esté totalmente lleno." }
  ],
  getDefaultOptions() {
    return {
      showHints: true
    };
  },
  normalizeOptions(options = {}) {
    return {
      showHints: options.showHints !== false
    };
  },
  renderConfigPanel({ options }) {
    const showHints = options.showHints !== false;
    return `
      <div class="block">
        <h3 class="block-title">Ayudas visuales</h3>
        <div class="player-count-row">
          <button
            class="pill ${showHints ? "is-active" : ""}"
            data-action="set-game-option"
            data-option="showHints"
            data-value="true"
            data-value-type="boolean"
          >
            Mostrar sugerencias
          </button>
          <button
            class="pill ${showHints ? "" : "is-active"}"
            data-action="set-game-option"
            data-option="showHints"
            data-value="false"
            data-value-type="boolean"
          >
            Ocultar sugerencias
          </button>
        </div>
      </div>
    `;
  },
  createInitialState() {
    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    
    // Posición inicial estándar de Reversi (centro diagonal)
    board[3][3] = PLAYER_TWO;
    board[3][4] = PLAYER_ONE;
    board[4][3] = PLAYER_ONE;
    board[4][4] = PLAYER_TWO;

    return {
      board,
      turnSlot: PLAYER_ONE, // Empieza el Jugador 1
      result: null,
      lastMove: null, // { row, col, flipped: [{row, col}, ...] }
      skippedTurnMessage: null // Guarda si un jugador tuvo que pasar
    };
  },
  getTurnSlot(state) {
    return state.turnSlot;
  },
  getResult(state) {
    return state.result;
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
    const name = active ? active.name : "Jugador";

    if (state.skippedTurnMessage) {
      return `¡Pasa el rival! ${state.skippedTurnMessage}. Turno de ${name}.`;
    }

    return `Turno de ${name}. Coloca tu pieza.`;
  },
  applyAction({ state, action, actorSlot, players }) {
    if (!action || action.type !== "select-cell") {
      return { ok: false, reason: "invalid" };
    }

    if (state.result) {
      return { ok: false, reason: "finished" };
    }

    if (actorSlot !== state.turnSlot) {
      return { ok: false, reason: "turn" };
    }

    const row = Number(action.row);
    const col = Number(action.col);
    if (!Number.isInteger(row) || !Number.isInteger(col) || !isInsideBoard(row, col)) {
      return { ok: false, reason: "invalid" };
    }

    const flips = getFlipsForMove(state.board, row, col, actorSlot);
    if (flips.length === 0) {
      return { ok: false, reason: "invalid" };
    }

    const board = cloneBoard(state.board);
    board[row][col] = actorSlot;
    
    for (const f of flips) {
      board[f.row][f.col] = actorSlot;
    }

    const nextPlayerSlot = 1 - actorSlot;
    let turnSlot = nextPlayerSlot;
    let skippedTurnMessage = null;

    // Verificar si el oponente tiene movimientos legales
    if (!hasLegalMoves(board, nextPlayerSlot)) {
      // Si el oponente no puede mover, pero el jugador actual sí
      if (hasLegalMoves(board, actorSlot)) {
        turnSlot = actorSlot; // Pasa el turno, retiene el jugador actual
        const skippedPlayer = players.find(p => p.slot === nextPlayerSlot);
        skippedTurnMessage = `${skippedPlayer ? skippedPlayer.name : "El rival"} no tiene movimientos`;
      } else {
        // Ninguno puede mover, finaliza la partida
        const count1 = countPieces(board, PLAYER_ONE);
        const count2 = countPieces(board, PLAYER_TWO);
        
        let result = null;
        if (count1 > count2) {
          result = { type: "win", slot: PLAYER_ONE, score0: count1, score1: count2 };
        } else if (count2 > count1) {
          result = { type: "win", slot: PLAYER_TWO, score0: count1, score1: count2 };
        } else {
          result = { type: "draw", score0: count1, score1: count2 };
        }

        return {
          ok: true,
          state: {
            ...state,
            board,
            result,
            lastMove: { row, col, flipped: flips },
            skippedTurnMessage: null
          }
        };
      }
    }

    return {
      ok: true,
      state: {
        ...state,
        board,
        turnSlot,
        lastMove: { row, col, flipped: flips },
        skippedTurnMessage
      }
    };
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="revBoard" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#144d32" />
              <stop offset="100%" stop-color="#0c2d1d" />
            </linearGradient>
            <radialGradient id="revP1" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ffa085" />
              <stop offset="50%" stop-color="#e76f51" />
              <stop offset="100%" stop-color="#a63e26" />
            </radialGradient>
            <radialGradient id="revP2" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ffe49e" />
              <stop offset="50%" stop-color="#f2c94c" />
              <stop offset="100%" stop-color="#ad881a" />
            </radialGradient>
            <filter id="revShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.4" />
            </filter>
          </defs>
          
          <rect x="22" y="10" width="116" height="74" rx="12" fill="url(#revBoard)" stroke="#113623" stroke-width="2" />
          <g stroke="#1a5c3d" stroke-width="0.8" opacity="0.6">
            <line x1="51" y1="10" x2="51" y2="84" />
            <line x1="80" y1="10" x2="80" y2="84" />
            <line x1="109" y1="10" x2="109" y2="84" />
            <line x1="22" y1="28.5" x2="138" y2="28.5" />
            <line x1="22" y1="47" x2="138" y2="47" />
            <line x1="22" y1="65.5" x2="138" y2="65.5" />
          </g>

          <circle cx="65.5" cy="37.75" r="7.5" fill="url(#revP1)" filter="url(#revShadow)" />
          <circle cx="94.5" cy="37.75" r="7.5" fill="url(#revP2)" filter="url(#revShadow)" />
          <circle cx="65.5" cy="56.25" r="7.5" fill="url(#revP2)" filter="url(#revShadow)" />
          <circle cx="94.5" cy="56.25" r="7.5" fill="url(#revP1)" filter="url(#revShadow)" />

          <circle cx="51.5" cy="47" r="1.5" fill="#f2c94c" opacity="0.8" />
        </svg>
      </div>
    `;
  },
  renderBoard({ state, players, options, canAct }) {
    const showHints = options.showHints !== false;
    const count0 = countPieces(state.board, PLAYER_ONE);
    const count1 = countPieces(state.board, PLAYER_TWO);
    const totalPieces = Math.max(1, count0 + count1);
    
    // Proporciones para la barra de control
    const pct0 = (count0 / totalPieces) * 100;
    const pct1 = (count1 / totalPieces) * 100;

    const p1 = players.find(p => p.slot === PLAYER_ONE) || { name: "Jugador 1", identity: { color: "#e76f51", icon: "○" } };
    const p2 = players.find(p => p.slot === PLAYER_TWO) || { name: "Jugador 2", identity: { color: "#f2c94c", icon: "△" } };

    const legalMovesMap = new Map();
    if (canAct && !state.result) {
      for (let r = 0; r < BOARD_SIZE; r += 1) {
        for (let c = 0; c < BOARD_SIZE; c += 1) {
          const flips = getFlipsForMove(state.board, r, c, state.turnSlot);
          if (flips.length > 0) {
            legalMovesMap.set(cellKey(r, c), flips);
          }
        }
      }
    }

    const flippedCells = new Set();
    if (state.lastMove?.flipped) {
      for (const f of state.lastMove.flipped) {
        flippedCells.add(cellKey(f.row, f.col));
      }
    }

    const lastCellKey = state.lastMove ? cellKey(state.lastMove.row, state.lastMove.col) : null;

    let cellsMarkup = "";
    for (let r = 0; r < BOARD_SIZE; r += 1) {
      for (let c = 0; c < BOARD_SIZE; c += 1) {
        const value = state.board[r][c];
        const isLegal = legalMovesMap.has(cellKey(r, c));
        const isFlipped = flippedCells.has(cellKey(r, c));
        const isNew = lastCellKey === cellKey(r, c);

        let pieceMarkup = "";
        if (value !== null) {
          const activePlayer = value === PLAYER_ONE ? p1 : p2;
          const pieceClasses = [
            "reversi-piece",
            `slot-${value}`,
            isFlipped ? "reversi-piece-flipped" : "",
            isNew ? "reversi-piece-new" : ""
          ].filter(Boolean).join(" ");

          pieceMarkup = `
            <span class="${pieceClasses}" style="--player-accent: ${activePlayer.identity.color}">
              <span class="reversi-piece-shine"></span>
            </span>
          `;
        }

        const cellClasses = [
          "reversi-cell",
          isLegal && showHints ? "is-suggested" : "",
          isNew ? "is-last-move" : ""
        ].filter(Boolean).join(" ");

        const disabled = state.result || !canAct || !isLegal;
        const currentActiveColor = state.turnSlot === PLAYER_ONE ? p1.identity.color : p2.identity.color;
        const flipsForCell = legalMovesMap.get(cellKey(r, c)) || [];
        const hintDot = isLegal && showHints
          ? `<span class="reversi-hint-ring" style="--player-accent: ${currentActiveColor}"><span>${flipsForCell.length}</span></span>`
          : "";
        const cellStateLabel = value === PLAYER_ONE
          ? p1.name
          : value === PLAYER_TWO
            ? p2.name
            : isLegal
              ? `Movimiento disponible, voltea ${flipsForCell.length}`
              : "Vacia";

        cellsMarkup += `
          <button
            class="${cellClasses}"
            data-action="game-action"
            data-game-action="select-cell"
            data-row="${r}"
            data-col="${c}"
            ${disabled ? "disabled" : ""}
            aria-label="${escapeHtml(`Fila ${r + 1}, columna ${c + 1}. ${cellStateLabel}`)}"
          >
            ${hintDot}
            ${pieceMarkup}
          </button>
        `;
      }
    }

    return `
      <div class="reversi-container">
        <!-- CSS encapsulado para diseño de Reversi de alta fidelidad -->
        <style>
          .reversi-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
            gap: 16px;
            user-select: none;
            padding: 8px;
          }

          /* HUD de puntuación compacto y táctil */
          .reversi-hud {
            width: 100%;
            background:
              linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244, 237, 224, 0.9));
            border: 1px solid rgba(102, 127, 103, 0.2);
            border-radius: 16px;
            padding: 12px 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow:
              0 10px 18px rgba(46, 68, 50, 0.1),
              inset 0 1px 0 rgba(255,255,255,0.9);
          }

          .reversi-hud-scores {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .reversi-player-hud {
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
          }

          .reversi-player-hud.active {
            transform: scale(1.04);
            filter: saturate(1.08);
          }

          .reversi-player-hud-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            font-weight: bold;
            color: #fff;
            box-shadow:
              inset 0 -4px 5px rgba(0,0,0,0.18),
              inset 0 2px 3px rgba(255,255,255,0.34),
              0 4px 8px rgba(0,0,0,0.12);
          }

          .reversi-player-hud-info {
            display: flex;
            flex-direction: column;
          }

          .reversi-player-hud-name {
            font-size: 0.85rem;
            color: #5d5345;
            font-weight: 550;
            max-width: 120px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .reversi-player-hud-count {
            font-size: 1.25rem;
            font-weight: 850;
            color: #2f2518;
          }

          /* Barra de control y dominio */
          .reversi-progress-container {
            width: 100%;
            height: 10px;
            background: rgba(32, 55, 39, 0.08);
            border-radius: 999px;
            overflow: hidden;
            display: flex;
            border: 1px solid rgba(255, 255, 255, 0.72);
            box-shadow: inset 0 1px 3px rgba(28, 45, 33, 0.12);
          }

          .reversi-progress-bar {
            height: 100%;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Tablero 2.5D */
          .reversi-board-wrapper {
            background:
              linear-gradient(135deg, rgba(255,255,255,0.16), transparent 35%),
              linear-gradient(180deg, #25563d, #123322);
            padding: 12px;
            border-radius: 20px;
            box-shadow:
              0 22px 32px rgba(27, 50, 33, 0.24),
              0 7px 0 #0b2416,
              inset 0 2px 3px rgba(255, 255, 255, 0.16),
              inset 0 -8px 14px rgba(0, 0, 0, 0.22);
            border: 1px solid rgba(255, 255, 255, 0.12);
            width: 100%;
            aspect-ratio: 1;
            box-sizing: border-box;
          }

          .reversi-board {
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
            background:
              linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0) 28%),
              linear-gradient(135deg, #23784d 0%, #135033 100%);
            border: 1px solid rgba(2, 23, 12, 0.72);
            border-radius: 12px;
            overflow: hidden;
            box-shadow:
              inset 0 8px 18px rgba(0, 0, 0, 0.26),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
            gap: 1px;
            background-color: #0b2c1b;
          }

          .reversi-cell {
            position: relative;
            background: transparent;
            border: 0;
            margin: 0;
            padding: 0;
            aspect-ratio: 1;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            outline: none;
            transition: background-color 0.25s ease, box-shadow 0.25s ease, transform 0.18s ease;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          }

          .reversi-cell:hover:not([disabled]) {
            background-color: rgba(255, 255, 255, 0.1);
            box-shadow: inset 0 0 0 2px rgba(255,255,255,0.12);
          }

          .reversi-cell:active:not([disabled]) {
            background-color: rgba(255, 255, 255, 0.15);
            transform: scale(0.97);
          }

          .reversi-cell.is-last-move {
            background-color: rgba(255, 244, 205, 0.08);
          }

          /* Sugerencias de movimientos */
          .reversi-hint-ring {
            width: 42%;
            height: 42%;
            border-radius: 50%;
            border: 2px solid color-mix(in srgb, var(--player-accent) 78%, white);
            opacity: 0.78;
            animation: reversi-pulse-ring 1.8s infinite ease-in-out;
            pointer-events: none;
            display: grid;
            place-items: center;
            color: #fffef8;
            font-size: clamp(0.58rem, 1.8vw, 0.72rem);
            font-weight: 850;
            text-shadow: 0 1px 2px rgba(0,0,0,0.42);
            background: rgba(255,255,255,0.08);
            box-shadow:
              0 0 0 3px rgba(255,255,255,0.08),
              0 4px 8px rgba(0,0,0,0.16);
          }

          .reversi-hint-ring span {
            transform: translateY(-0.02em);
          }

          @keyframes reversi-pulse-ring {
            0% { transform: scale(0.9); opacity: 0.4; }
            50% { transform: scale(1.15); opacity: 0.85; }
            100% { transform: scale(0.9); opacity: 0.4; }
          }

          /* Ficha de baquelita pulida */
          .reversi-piece {
            position: absolute;
            width: 82%;
            height: 82%;
            border-radius: 50%;
            background:
              radial-gradient(circle at 30% 24%, rgba(255,255,255,0.86) 0 10%, rgba(255,255,255,0) 28%),
              radial-gradient(circle at center, color-mix(in srgb, var(--player-accent) 86%, white) 0%, var(--player-accent) 58%, rgba(0, 0, 0, 0.72) 132%);
            box-shadow:
              0 7px 10px rgba(0, 0, 0, 0.34),
              inset 0 -6px 8px rgba(0, 0, 0, 0.32),
              inset 0 5px 7px rgba(255, 255, 255, 0.38);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2;
          }

          .reversi-piece-shine {
            position: absolute;
            top: 10%;
            left: 15%;
            width: 50%;
            height: 25%;
            border-radius: 50% 50% 45% 45% / 60% 60% 40% 40%;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
            pointer-events: none;
          }

          /* Animación: Ficha recién colocada */
          .reversi-piece-new {
            animation: reversi-new-piece-anim 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.25);
          }

          @keyframes reversi-new-piece-anim {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }

          /* Animación: volteo breve */
          .reversi-piece-flipped {
            animation: reversi-flip-piece-anim 0.42s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }

          @keyframes reversi-flip-piece-anim {
            0% { transform: rotateY(0deg) scale(1); filter: brightness(1); }
            50% { transform: rotateY(90deg) scale(1.08); filter: brightness(1.18); }
            100% { transform: rotateY(180deg) scale(1); filter: brightness(1); }
          }

          /* Indicador de última jugada */
          .is-last-move::after {
            content: "";
            position: absolute;
            width: 90%;
            height: 90%;
            border: 1px solid #ffd700;
            border-radius: 50%;
            opacity: 0.3;
            pointer-events: none;
            z-index: 1;
          }
        </style>

        <!-- Marcador HUD -->
        <header class="reversi-hud">
          <div class="reversi-hud-scores">
            <article class="reversi-player-hud ${state.turnSlot === PLAYER_ONE && !state.result ? "active" : ""}">
              <span class="reversi-player-hud-icon" style="background: ${p1.identity.color}">${escapeHtml(p1.identity.icon)}</span>
              <div class="reversi-player-hud-info">
                <span class="reversi-player-hud-name">${escapeHtml(p1.name)}</span>
                <span class="reversi-player-hud-count">${count0}</span>
              </div>
            </article>

            <article class="reversi-player-hud ${state.turnSlot === PLAYER_TWO && !state.result ? "active" : ""}">
              <div class="reversi-player-hud-info" style="align-items: flex-end;">
                <span class="reversi-player-hud-name">${escapeHtml(p2.name)}</span>
                <span class="reversi-player-hud-count">${count1}</span>
              </div>
              <span class="reversi-player-hud-icon" style="background: ${p2.identity.color}">${escapeHtml(p2.identity.icon)}</span>
            </article>
          </div>

          <!-- Barra de Dominio de Tablero -->
          <div class="reversi-progress-container">
            <div class="reversi-progress-bar" style="width: ${pct0}%; background-color: ${p1.identity.color};"></div>
            <div class="reversi-progress-bar" style="width: ${pct1}%; background-color: ${p2.identity.color};"></div>
          </div>
        </header>

        <!-- Tablero de juego -->
        <main class="reversi-board-wrapper">
          <div class="reversi-board">
            ${cellsMarkup}
          </div>
        </main>
      </div>
    `;
  },
  formatResult({ state, players }) {
    if (!state.result) {
      return null;
    }

    const count0 = state.result.score0;
    const count1 = state.result.score1;
    const p1 = players.find(p => p.slot === PLAYER_ONE) || { name: "Jugador 1", identity: { icon: "○" } };
    const p2 = players.find(p => p.slot === PLAYER_TWO) || { name: "Jugador 2", identity: { icon: "△" } };

    if (state.result.type === "draw") {
      return {
        title: "Empate",
        subtitle: `Ambos jugadores terminaron con ${count0} fichas. ¡Qué reñido!`,
        iconText: "=",
        iconClass: "draw"
      };
    }

    const winner = players.find((player) => player.slot === state.result.slot);
    const winnerScore = state.result.slot === PLAYER_ONE ? count0 : count1;
    const loserScore = state.result.slot === PLAYER_ONE ? count1 : count0;

    return {
      title: `Ha ganado ${winner ? escapeHtml(winner.name) : "Jugador"}`,
      subtitle: `Victoria por dominancia: ${winnerScore} a ${loserScore} fichas.`,
      iconText: winner ? winner.identity.icon : "★",
      iconClass: "win"
    };
  }
};
