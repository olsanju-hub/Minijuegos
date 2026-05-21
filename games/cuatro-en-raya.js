const ROWS = 6;
const COLS = 7;

function lineFrom(board, row, col, slot) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    const line = [{ row, col }];

    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === slot) {
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === slot) {
      line.unshift({ row: r, col: c });
      r -= dr;
      c -= dc;
    }

    if (line.length >= 4) {
      return line;
    }
  }

  return null;
}

export const cuatroEnRayaGame = {
  id: "connect4",
  name: "4 en raya",
  subtitle: "2-4 jugadores",
  tagline: "Conecta y gana",
  minPlayers: 2,
  maxPlayers: 4,
  rules: [
    { title: "Objetivo", text: "Consigue una linea de 4 fichas iguales." },
    { title: "Como se juega", text: "Cada jugador elige una columna y su ficha cae hasta la posicion libre mas baja." },
    { title: "Como se gana", text: "Gana quien conecte 4 fichas en horizontal, vertical o diagonal." },
    { title: "Si nadie gana", text: "Si el tablero se llena sin un ganador, la partida termina en empate." }
  ],
  getDefaultOptions() {
    return {};
  },
  normalizeOptions() {
    return {};
  },
  createInitialState({ playerCount }) {
    return {
      board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
      turnSlot: 0,
      result: null,
      lastMove: null,
      playerCount
    };
  },
  getTurnSlot(state) {
    return state.turnSlot;
  },
  getResult(state) {
    return state.result;
  },
  applyAction({ state, action, actorSlot }) {
    if (!action || action.type !== "drop") {
      return { ok: false, reason: "invalid" };
    }

    if (state.result) {
      return { ok: false, reason: "finished" };
    }

    if (actorSlot !== state.turnSlot) {
      return { ok: false, reason: "turn" };
    }

    const column = Number(action.column);
    if (!Number.isInteger(column) || column < 0 || column >= COLS) {
      return { ok: false, reason: "invalid" };
    }

    let row = -1;
    for (let i = ROWS - 1; i >= 0; i -= 1) {
      if (state.board[i][column] === null) {
        row = i;
        break;
      }
    }

    if (row < 0) {
      return { ok: false, reason: "column_full" };
    }

    const nextBoard = state.board.map((line) => [...line]);
    nextBoard[row][column] = actorSlot;

    const next = {
      ...state,
      board: nextBoard,
      result: state.result ? { ...state.result } : null,
      lastMove: { row, col: column }
    };

    const line = lineFrom(nextBoard, row, column, actorSlot);
    if (line) {
      next.result = {
        type: "win",
        slot: actorSlot,
        line
      };
      return { ok: true, state: next };
    }

    const draw = nextBoard.every((lineCells) => lineCells.every((cell) => cell !== null));
    if (draw) {
      next.result = { type: "draw" };
      return { ok: true, state: next };
    }

    next.turnSlot = (state.turnSlot + 1) % state.playerCount;
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
            <linearGradient id="c4Board" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3B8A69" />
              <stop offset="100%" stop-color="#2B6F55" />
            </linearGradient>
            <linearGradient id="c4Lip" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#58A77F" />
              <stop offset="100%" stop-color="#397E62" />
            </linearGradient>
            <radialGradient id="c4Hole" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stop-color="#FBF5EB" />
              <stop offset="100%" stop-color="#DDCDB4" />
            </radialGradient>
            <radialGradient id="c4Red" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#F39A84" />
              <stop offset="100%" stop-color="#D86046" />
            </radialGradient>
            <radialGradient id="c4Yellow" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#F8DE7E" />
              <stop offset="100%" stop-color="#E6B738" />
            </radialGradient>
            <radialGradient id="c4Blue" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#6CB791" />
              <stop offset="100%" stop-color="#2F8662" />
            </radialGradient>
            <radialGradient id="c4Green" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#66D39F" />
              <stop offset="100%" stop-color="#32A56F" />
            </radialGradient>
            <filter id="c4Shadow" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.1" flood-color="#2F5E4A" flood-opacity="0.2" />
            </filter>
          </defs>

          <rect x="7" y="14" width="146" height="68" rx="13" fill="url(#c4Board)" filter="url(#c4Shadow)" />
          <rect x="7" y="9" width="146" height="12" rx="8" fill="url(#c4Lip)" />
          <rect x="9.5" y="15.5" width="141" height="63" rx="10" fill="none" stroke="rgba(255,255,255,0.24)" />
          <path d="M11 78.5H149" stroke="rgba(31,58,47,0.26)" stroke-width="1.8" />

          <g fill="url(#c4Hole)" stroke="rgba(143, 171, 204, 0.6)" stroke-width="0.8">
            <circle cx="28" cy="30" r="7.6" />
            <circle cx="46" cy="30" r="7.6" />
            <circle cx="64" cy="30" r="7.6" />
            <circle cx="82" cy="30" r="7.6" />
            <circle cx="100" cy="30" r="7.6" />
            <circle cx="118" cy="30" r="7.6" />
            <circle cx="136" cy="30" r="7.6" />
            <circle cx="28" cy="48" r="7.6" />
            <circle cx="46" cy="48" r="7.6" />
            <circle cx="64" cy="48" r="7.6" />
            <circle cx="82" cy="48" r="7.6" />
            <circle cx="100" cy="48" r="7.6" />
            <circle cx="118" cy="48" r="7.6" />
            <circle cx="136" cy="48" r="7.6" />
            <circle cx="28" cy="66" r="7.6" />
            <circle cx="46" cy="66" r="7.6" />
            <circle cx="64" cy="66" r="7.6" />
            <circle cx="82" cy="66" r="7.6" />
            <circle cx="100" cy="66" r="7.6" />
            <circle cx="118" cy="66" r="7.6" />
            <circle cx="136" cy="66" r="7.6" />
          </g>

          <g filter="url(#c4Shadow)">
            <circle cx="46" cy="66" r="7" fill="url(#c4Red)" />
            <circle cx="64" cy="66" r="7" fill="url(#c4Yellow)" />
            <circle cx="82" cy="66" r="7" fill="url(#c4Blue)" />
            <circle cx="100" cy="66" r="7" fill="url(#c4Green)" />
            <circle cx="64" cy="48" r="7" fill="url(#c4Red)" />
            <circle cx="82" cy="48" r="7" fill="url(#c4Yellow)" />
            <circle cx="100" cy="48" r="7" fill="url(#c4Blue)" />
            <circle cx="82" cy="30" r="7" fill="url(#c4Red)" />
          </g>
          <g fill="rgba(255,255,255,0.36)">
            <circle cx="44" cy="64" r="1.9" />
            <circle cx="62" cy="64" r="1.9" />
            <circle cx="80" cy="64" r="1.9" />
            <circle cx="98" cy="64" r="1.9" />
            <circle cx="62" cy="46" r="1.9" />
            <circle cx="80" cy="46" r="1.9" />
            <circle cx="98" cy="46" r="1.9" />
            <circle cx="80" cy="28" r="1.9" />
          </g>
          <ellipse cx="80" cy="84.5" rx="58" ry="4.5" fill="rgba(41, 78, 62, 0.16)" />
        </svg>
      </div>
    `;
  },
  renderBoard({ state, players, canAct, uiState }) {
    const drop = uiState && uiState.lastDrop ? uiState.lastDrop : null;
    const activePlayer = players.find(p => p.slot === state.turnSlot);
    const activeColor = activePlayer ? activePlayer.identity.color : "#e02030";

    const columns = Array.from({ length: COLS }, (_, col) => {
      const full = state.board[0][col] !== null;
      const invalidClass = uiState && uiState.invalidColumn === col ? "is-invalid" : "";

      // Encontrar la fila vacía más baja para la ficha fantasma (hover)
      let lowestEmptyRow = -1;
      for (let r = ROWS - 1; r >= 0; r -= 1) {
        if (state.board[r][col] === null) {
          lowestEmptyRow = r;
          break;
        }
      }

      const slots = Array.from({ length: ROWS }, (_, row) => {
        const value = state.board[row][col];
        let disc = "";

        const isWinning = state.result?.type === "win" && 
          state.result.line.some((cell) => cell.row === row && cell.col === col);

        if (value !== null) {
          const player = players.find((item) => item.slot === value);
          const color = player ? player.identity.color : "#233042";

          let dropClass = "";
          let style = `--disc-color:${color};`;
          if (drop && Date.now() - drop.at < 460 && drop.row === row && drop.col === col) {
            dropClass = "drop";
            const distance = (row + 1) * 56 + 20;
            style += `--drop-distance:-${distance}px;`;
          }

          disc = `<span class="disc ${dropClass} ${isWinning ? "is-winning" : ""}" style="${style}"></span>`;
        } else if (row === lowestEmptyRow && !state.result && canAct) {
          disc = `<span class="disc is-ghost" style="--ghost-color:${activeColor};"></span>`;
        }

        return `<span class="connect4-slot">${disc}</span>`;
      }).join("");

      const disabled = state.result || !canAct || full;
      return `
        <button
          class="connect4-column ${full ? "is-full" : ""} ${invalidClass}"
          data-action="game-action"
          data-game-action="drop"
          data-column="${col}"
          ${disabled ? "disabled" : ""}
        >
          ${slots}
        </button>
      `;
    }).join("");

    return `
      <div class="connect4-shell">
        <style>
          /* ENCAPSULATED PREMIUM PLASTIC STYLES FOR CONNECT 4 */
          .screen.game-screen-connect4 .connect4-shell {
            position: relative;
            background: linear-gradient(180deg, #1e6091 0%, #15456b 100%);
            padding: 16px 20px 24px;
            border-radius: 24px;
            border: 5px solid #1a73e8;
            box-shadow: 
              0 24px 48px rgba(0,0,0,0.4),
              inset 0 4px 12px rgba(255,255,255,0.22);
            margin: 0 auto 28px;
            max-width: 520px;
            width: 100%;
          }
          /* Side Support Legs */
          .screen.game-screen-connect4 .connect4-shell::before,
          .screen.game-screen-connect4 .connect4-shell::after {
            content: "";
            position: absolute;
            bottom: -22px;
            width: 28px;
            height: 120px;
            background: linear-gradient(180deg, #15456b 0%, #0d2840 100%);
            border-radius: 8px 8px 16px 16px;
            border: 3px solid #1a73e8;
            box-shadow: 0 12px 20px rgba(0,0,0,0.45);
            z-index: -1;
          }
          .screen.game-screen-connect4 .connect4-shell::before {
            left: -12px;
            transform: skewY(5deg);
          }
          .screen.game-screen-connect4 .connect4-shell::after {
            right: -12px;
            transform: skewY(-5deg);
          }
          .screen.game-screen-connect4 .connect4-board {
            display: flex;
            background: transparent;
            gap: 5px;
            width: 100%;
            border-radius: 12px;
          }
          .screen.game-screen-connect4 .connect4-column {
            background: transparent;
            border: none;
            padding: 3px 1px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            flex: 1;
            transition: background-color 0.2s ease;
            border-radius: 10px;
          }
          .screen.game-screen-connect4 .connect4-column:hover:not([disabled]) {
            background: rgba(255, 255, 255, 0.08);
          }
          .screen.game-screen-connect4 .connect4-column.is-invalid {
            background: rgba(224, 32, 48, 0.15) !important;
            animation: c4Shake 0.4s ease-in-out;
          }
          @keyframes c4Shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          .screen.game-screen-connect4 .connect4-slot {
            aspect-ratio: 1;
            width: 100%;
            border-radius: 50%;
            background: radial-gradient(circle at 50% 50%, #06192e 62%, #0e2742 100%);
            border: 3.5px solid #1a73e8;
            box-shadow: 
              inset 0 6px 12px rgba(0,0,0,0.7),
              0 1.5px 1.5px rgba(255,255,255,0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          .screen.game-screen-connect4 .disc {
            width: 88%;
            height: 88%;
            border-radius: 50%;
            position: relative;
            display: block;
            box-shadow: 
              0 4px 6px rgba(0,0,0,0.4),
              inset 0 -5px 6px rgba(0,0,0,0.4),
              inset 0 5px 6px rgba(255,255,255,0.3);
            background: radial-gradient(circle at 35% 30%, var(--disc-color, #e02030) 10%, rgba(0,0,0,0.35) 75%), var(--disc-color, #e02030);
            z-index: 2;
          }
          .screen.game-screen-connect4 .disc::after {
            content: "";
            position: absolute;
            inset: 22%;
            border-radius: 50%;
            border: 2px dashed rgba(0,0,0,0.18);
            box-shadow: 
              inset 0 2px 3px rgba(0,0,0,0.25),
              0 2.5px 2.5px rgba(255,255,255,0.2);
          }
          .screen.game-screen-connect4 .disc.drop {
            animation: c4DropGravity 0.44s forwards;
          }
          @keyframes c4DropGravity {
            0% {
              transform: translateY(var(--drop-distance, -400px));
              animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
            }
            80% {
              transform: translateY(0);
              animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1);
            }
            90% {
              transform: translateY(-12px);
              animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
            }
            100% {
              transform: translateY(0);
            }
          }
          .screen.game-screen-connect4 .disc.is-ghost {
            background: radial-gradient(circle at 35% 30%, var(--ghost-color, #e02030) 10%, rgba(0,0,0,0.2) 60%), var(--ghost-color, #e02030);
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
            box-shadow: none;
            border: 2px dashed rgba(255, 255, 255, 0.35);
          }
          .screen.game-screen-connect4 .disc.is-ghost::after {
            border: 2px dashed rgba(255, 255, 255, 0.15);
          }
          .screen.game-screen-connect4 .connect4-column:hover:not([disabled]) .disc.is-ghost {
            opacity: 0.35;
            transform: scale(1);
          }
          .screen.game-screen-connect4 .disc.is-winning {
            animation: c4WinPulse 1.2s infinite ease-in-out;
            border: 2.5px solid #ffd54f;
            box-shadow: 0 0 14px #ffd54f;
          }
          @keyframes c4WinPulse {
            0% { transform: scale(1); box-shadow: 0 0 8px #ffd54f, inset 0 -5px 6px rgba(0,0,0,0.4), inset 0 5px 6px rgba(255,255,255,0.3); }
            50% { transform: scale(1.08); box-shadow: 0 0 24px #ffd54f, inset 0 -5px 6px rgba(0,0,0,0.4), inset 0 5px 6px rgba(255,255,255,0.55); }
            100% { transform: scale(1); box-shadow: 0 0 8px #ffd54f, inset 0 -5px 6px rgba(0,0,0,0.4), inset 0 5px 6px rgba(255,255,255,0.3); }
          }
        </style>
        <div class="connect4-board">${columns}</div>
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
      title: `Ha ganado ${winner ? winner.name : "Jugador"}`,
      subtitle: "Buena jugada. Puedes jugar otra vez.",
      iconText: winner ? winner.identity.icon : "★",
      iconClass: "win"
    };
  }
};
