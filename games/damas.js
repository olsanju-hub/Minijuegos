const BOARD_SIZE = 8;
const PLAYER_ONE = 0;
const PLAYER_TWO = 1;
const ALL_DIAGONAL_DIRECTIONS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1]
];

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

function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function isDarkCell(row, col) {
  return (row + col) % 2 === 1;
}

function cellKey(row, col) {
  return `${row}:${col}`;
}

function getPieceOwner(piece) {
  if (!piece) {
    return null;
  }
  return Number(piece.slice(1));
}

function isKingPiece(piece) {
  return Boolean(piece) && piece.startsWith("k");
}

function promotePiece(piece) {
  return `k${getPieceOwner(piece)}`;
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function getPromotionRow(slot) {
  return slot === PLAYER_ONE ? 0 : BOARD_SIZE - 1;
}

function getMoveDirections(piece) {
  if (isKingPiece(piece)) {
    return ALL_DIAGONAL_DIRECTIONS;
  }

  const owner = getPieceOwner(piece);
  const step = owner === PLAYER_ONE ? -1 : 1;
  return [
    [step, -1],
    [step, 1]
  ];
}

function getDiagonalTrail(fromRow, fromCol, toRow, toCol) {
  const rowStep = Math.sign(toRow - fromRow);
  const colStep = Math.sign(toCol - fromCol);
  const trail = [];

  for (let row = fromRow + rowStep, col = fromCol + colStep; row !== toRow || col !== toCol; row += rowStep, col += colStep) {
    trail.push({ row, col });
  }

  return trail;
}

function createInitialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (isDarkCell(row, col)) {
        board[row][col] = "p1";
      }
    }
  }

  for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (isDarkCell(row, col)) {
        board[row][col] = "p0";
      }
    }
  }

  return board;
}

function countPieces(board, slot) {
  let total = 0;
  for (const row of board) {
    for (const cell of row) {
      if (getPieceOwner(cell) === slot) {
        total += 1;
      }
    }
  }
  return total;
}

function buildMove(type, fromRow, fromCol, toRow, toCol, captured = null) {
  return {
    type,
    fromRow,
    fromCol,
    toRow,
    toCol,
    captured,
    trail: []
  };
}

function getSimpleMovesForPiece(board, row, col) {
  const piece = board[row][col];
  if (!piece) {
    return [];
  }

  if (isKingPiece(piece)) {
    const moves = [];
    for (const [dr, dc] of getMoveDirections(piece)) {
      let toRow = row + dr;
      let toCol = col + dc;

      while (isInsideBoard(toRow, toCol) && board[toRow][toCol] === null) {
        moves.push({
          ...buildMove("move", row, col, toRow, toCol),
          trail: getDiagonalTrail(row, col, toRow, toCol)
        });
        toRow += dr;
        toCol += dc;
      }
    }
    return moves;
  }

  const moves = [];
  for (const [dr, dc] of getMoveDirections(piece)) {
    const toRow = row + dr;
    const toCol = col + dc;
    if (!isInsideBoard(toRow, toCol)) {
      continue;
    }
    if (board[toRow][toCol] !== null) {
      continue;
    }
    moves.push(buildMove("move", row, col, toRow, toCol));
  }
  return moves;
}

function getCaptureMovesForPiece(board, row, col) {
  const piece = board[row][col];
  if (!piece) {
    return [];
  }

  const owner = getPieceOwner(piece);
  const moves = [];

  if (isKingPiece(piece)) {
    for (const [dr, dc] of getMoveDirections(piece)) {
      let scanRow = row + dr;
      let scanCol = col + dc;
      let captured = null;

      while (isInsideBoard(scanRow, scanCol)) {
        const current = board[scanRow][scanCol];

        if (!captured) {
          if (current === null) {
            scanRow += dr;
            scanCol += dc;
            continue;
          }

          if (getPieceOwner(current) === owner) {
            break;
          }

          captured = { row: scanRow, col: scanCol };
          scanRow += dr;
          scanCol += dc;
          continue;
        }

        if (current !== null) {
          break;
        }

        moves.push({
          ...buildMove("capture", row, col, scanRow, scanCol, captured),
          trail: getDiagonalTrail(row, col, scanRow, scanCol).filter(
            (cell) => cell.row !== captured.row || cell.col !== captured.col
          )
        });

        scanRow += dr;
        scanCol += dc;
      }
    }

    return moves;
  }

  for (const [dr, dc] of getMoveDirections(piece)) {
    const middleRow = row + dr;
    const middleCol = col + dc;
    const toRow = row + dr * 2;
    const toCol = col + dc * 2;

    if (!isInsideBoard(middleRow, middleCol) || !isInsideBoard(toRow, toCol)) {
      continue;
    }

    const middlePiece = board[middleRow][middleCol];
    if (!middlePiece || getPieceOwner(middlePiece) === owner) {
      continue;
    }

    if (board[toRow][toCol] !== null) {
      continue;
    }

    moves.push(buildMove("capture", row, col, toRow, toCol, { row: middleRow, col: middleCol }));
  }

  return moves;
}

function getMandatoryCaptureMoves(board, slot, forcedChainCell = null) {
  if (forcedChainCell) {
    return getCaptureMovesForPiece(board, forcedChainCell.row, forcedChainCell.col).filter(
      (move) => getPieceOwner(board[move.fromRow][move.fromCol]) === slot
    );
  }

  const moves = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (getPieceOwner(board[row][col]) !== slot) {
        continue;
      }
      moves.push(...getCaptureMovesForPiece(board, row, col));
    }
  }
  return moves;
}

function getLegalMovesForPiece(board, row, col, slot, forcedChainCell = null) {
  const piece = board[row][col];
  if (!piece || getPieceOwner(piece) !== slot) {
    return [];
  }

  if (forcedChainCell && (forcedChainCell.row !== row || forcedChainCell.col !== col)) {
    return [];
  }

  const captureMoves = getCaptureMovesForPiece(board, row, col);
  if (forcedChainCell) {
    return captureMoves;
  }

  if (getMandatoryCaptureMoves(board, slot).length > 0) {
    return captureMoves;
  }

  return getSimpleMovesForPiece(board, row, col);
}

function getAllLegalMovesForSlot(board, slot, forcedChainCell = null) {
  const captureMoves = getMandatoryCaptureMoves(board, slot, forcedChainCell);
  if (captureMoves.length > 0) {
    return captureMoves;
  }

  const moves = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (getPieceOwner(board[row][col]) !== slot) {
        continue;
      }
      moves.push(...getSimpleMovesForPiece(board, row, col));
    }
  }
  return moves;
}

function hasAnyLegalMove(board, slot) {
  return getAllLegalMovesForSlot(board, slot).length > 0;
}

function findMoveTo(moves, row, col) {
  return moves.find((move) => move.toRow === row && move.toCol === col) || null;
}

function getWinnerState(board, activeSlot) {
  const opponentSlot = activeSlot === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;

  if (countPieces(board, opponentSlot) === 0) {
    return { type: "win", slot: activeSlot, reason: "capture-all" };
  }

  if (!hasAnyLegalMove(board, opponentSlot)) {
    return { type: "win", slot: activeSlot, reason: "no-moves" };
  }

  return null;
}

function buildSelectionState(state, row, col) {
  return {
    ...state,
    selectedCell: { row, col }
  };
}

function buildMoveState(state, move) {
  const board = cloneBoard(state.board);
  const piece = board[move.fromRow][move.fromCol];
  const movingSlot = getPieceOwner(piece);

  board[move.fromRow][move.fromCol] = null;
  if (move.type === "capture" && move.captured) {
    board[move.captured.row][move.captured.col] = null;
  }

  let nextPiece = piece;
  let crowned = false;
  if (!isKingPiece(piece) && move.toRow === getPromotionRow(movingSlot)) {
    nextPiece = promotePiece(piece);
    crowned = true;
  }

  board[move.toRow][move.toCol] = nextPiece;

  const lastMove = {
    fromRow: move.fromRow,
    fromCol: move.fromCol,
    toRow: move.toRow,
    toCol: move.toCol,
    captured: move.captured ? [{ row: move.captured.row, col: move.captured.col }] : [],
    crowned
  };

  const immediateWinner = getWinnerState(board, movingSlot);
  if (immediateWinner) {
    return {
      ...state,
      board,
      result: immediateWinner,
      selectedCell: null,
      forcedChainCell: null,
      lastMove
    };
  }

  if (move.type === "capture" && !crowned) {
    const moreCaptures = getCaptureMovesForPiece(board, move.toRow, move.toCol);
    if (moreCaptures.length > 0) {
      return {
        ...state,
        board,
        selectedCell: { row: move.toRow, col: move.toCol },
        forcedChainCell: { row: move.toRow, col: move.toCol },
        lastMove
      };
    }
  }

  return {
    ...state,
    board,
    turnSlot: state.turnSlot === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE,
    selectedCell: null,
    forcedChainCell: null,
    lastMove
  };
}

function resolveCellSelection(state, row, col) {
  const slot = state.turnSlot;
  const piece = state.board[row][col];
  const owner = getPieceOwner(piece);
  const forcedCell = state.forcedChainCell;

  if (forcedCell) {
    if (row === forcedCell.row && col === forcedCell.col) {
      return {
        ok: true,
        state: buildSelectionState(state, row, col)
      };
    }

    const forcedMoves = getLegalMovesForPiece(state.board, forcedCell.row, forcedCell.col, slot, forcedCell);
    const forcedMove = findMoveTo(forcedMoves, row, col);
    if (!forcedMove) {
      return { ok: false, reason: "invalid" };
    }

    return {
      ok: true,
      state: buildMoveState(state, forcedMove)
    };
  }

  if (owner === slot) {
    const sameSelection = state.selectedCell && state.selectedCell.row === row && state.selectedCell.col === col;
    if (sameSelection) {
      return {
        ok: true,
        state: {
          ...state,
          selectedCell: null
        }
      };
    }

    const legalMoves = getLegalMovesForPiece(state.board, row, col, slot);
    if (legalMoves.length === 0) {
      return { ok: false, reason: "invalid" };
    }

    return {
      ok: true,
      state: buildSelectionState(state, row, col)
    };
  }

  if (!state.selectedCell) {
    return { ok: false, reason: "invalid" };
  }

  const selectedMoves = getLegalMovesForPiece(state.board, state.selectedCell.row, state.selectedCell.col, slot);
  const move = findMoveTo(selectedMoves, row, col);
  if (!move) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    state: buildMoveState(state, move)
  };
}

function pieceLabel(piece) {
  if (!piece) {
    return "Casilla vacia";
  }
  const owner = getPieceOwner(piece);
  const side = owner === PLAYER_ONE ? "Jugador 1" : "Jugador 2";
  return isKingPiece(piece) ? `Dama de ${side}` : `Ficha de ${side}`;
}

export const damasGame = {
  id: "damas",
  name: "Damas",
  subtitle: "2 jugadores",
  tagline: "Captura y corona",
  minPlayers: 2,
  maxPlayers: 2,
  useCustomTurnMessage: true,
  rules: [
    { title: "Objetivo", text: "Gana quien captura todas las fichas rivales o deja al rival sin movimientos legales." },
    { title: "Movimiento", text: "Las fichas normales avanzan una casilla en diagonal hacia adelante, siempre por casillas oscuras." },
    { title: "Captura", text: "La captura es obligatoria. Las fichas normales saltan una rival adyacente y la dama captura en diagonal a distancia." },
    { title: "Cadena", text: "Si despues de capturar la misma ficha puede volver a capturar, debe continuar en el mismo turno." },
    { title: "Coronacion", text: "Al llegar a la ultima fila, la ficha se corona. Si corona durante una captura, el turno termina y no sigue capturando como dama." },
    { title: "Dama", text: "La dama mueve en diagonal cualquier numero de casillas libres y captura a distancia sobre una unica ficha rival, aterrizando en una casilla libre posterior." }
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
            Si
          </button>
          <button
            class="pill ${showHints ? "" : "is-active"}"
            data-action="set-game-option"
            data-option="showHints"
            data-value="false"
            data-value-type="boolean"
          >
            No
          </button>
        </div>
      </div>
    `;
  },
  createInitialState() {
    return {
      board: createInitialBoard(),
      turnSlot: PLAYER_ONE,
      result: null,
      selectedCell: null,
      forcedChainCell: null,
      lastMove: null
    };
  },
  getTurnSlot(state) {
    return state.turnSlot;
  },
  getResult(state) {
    return state.result;
  },
  getTurnMessage({ state, players }) {
    if (state.result?.type === "win") {
      const winner = players.find((player) => player.slot === state.result.slot);
      return `Ha ganado ${winner ? winner.name : "Jugador"}`;
    }

    const active = players.find((player) => player.slot === state.turnSlot);
    const name = active ? active.name : "Jugador";

    if (state.forcedChainCell) {
      return `Turno de ${name}. Debes seguir capturando con la misma ficha.`;
    }

    if (getMandatoryCaptureMoves(state.board, state.turnSlot).length > 0) {
      return state.selectedCell
        ? `Turno de ${name}. Captura obligatoria: elige destino.`
        : `Turno de ${name}. Captura obligatoria.`;
    }

    if (state.selectedCell) {
      return `Turno de ${name}. Elige destino.`;
    }

    return `Turno de ${name}. Selecciona una ficha.`;
  },
  applyAction({ state, action, actorSlot }) {
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
    if (!Number.isInteger(row) || !Number.isInteger(col) || !isInsideBoard(row, col) || !isDarkCell(row, col)) {
      return { ok: false, reason: "invalid" };
    }

    return resolveCellSelection(state, row, col);
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="chkBoard" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fff8ed" />
              <stop offset="100%" stop-color="#efe2cf" />
            </linearGradient>
            <radialGradient id="chkDark" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stop-color="#d88d68" />
              <stop offset="100%" stop-color="#b05e3c" />
            </radialGradient>
            <radialGradient id="chkLight" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stop-color="#fff4d8" />
              <stop offset="100%" stop-color="#dbc38b" />
            </radialGradient>
          </defs>
          <rect x="21" y="10" width="118" height="74" rx="14" fill="url(#chkBoard)" stroke="#d6c2a4" />
          <g transform="translate(32 17)">
            <rect x="0" y="0" width="96" height="60" rx="8" fill="#e5cfb1" stroke="#c8b08e" />
            <g fill="#85573b">
              <rect x="12" y="0" width="12" height="12" />
              <rect x="36" y="0" width="12" height="12" />
              <rect x="60" y="0" width="12" height="12" />
              <rect x="84" y="0" width="12" height="12" />
              <rect x="0" y="12" width="12" height="12" />
              <rect x="24" y="12" width="12" height="12" />
              <rect x="48" y="12" width="12" height="12" />
              <rect x="72" y="12" width="12" height="12" />
              <rect x="12" y="24" width="12" height="12" />
              <rect x="36" y="24" width="12" height="12" />
              <rect x="60" y="24" width="12" height="12" />
              <rect x="84" y="24" width="12" height="12" />
              <rect x="0" y="36" width="12" height="12" />
              <rect x="24" y="36" width="12" height="12" />
              <rect x="48" y="36" width="12" height="12" />
              <rect x="72" y="36" width="12" height="12" />
              <rect x="12" y="48" width="12" height="12" />
              <rect x="36" y="48" width="12" height="12" />
              <rect x="60" y="48" width="12" height="12" />
              <rect x="84" y="48" width="12" height="12" />
            </g>
            <g>
              <circle cx="18" cy="18" r="7" fill="url(#chkDark)" />
              <circle cx="42" cy="18" r="7" fill="url(#chkDark)" />
              <circle cx="66" cy="18" r="7" fill="url(#chkDark)" />
              <circle cx="78" cy="30" r="7" fill="url(#chkLight)" />
              <circle cx="54" cy="42" r="7" fill="url(#chkLight)" />
              <circle cx="30" cy="54" r="7" fill="url(#chkDark)" />
            </g>
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state, players, options, canAct }) {
    const selectedCell = state.selectedCell || state.forcedChainCell;
    const selectedMoves = selectedCell
      ? getLegalMovesForPiece(state.board, selectedCell.row, selectedCell.col, state.turnSlot, state.forcedChainCell)
      : [];
    const targetCells = new Set(selectedMoves.map((move) => cellKey(move.toRow, move.toCol)));
    const captureTargetCells = new Set(selectedMoves.filter((move) => move.type === "capture").map((move) => cellKey(move.toRow, move.toCol)));
    const pathCells = new Set(
      selectedMoves.flatMap((move) => move.trail.map((cell) => cellKey(cell.row, cell.col)))
    );
    const forcedOrigins = new Set(
      getMandatoryCaptureMoves(state.board, state.turnSlot, state.forcedChainCell).map((move) => cellKey(move.fromRow, move.fromCol))
    );
    const showHints = options.showHints !== false;

    const boardMarkup = state.board
      .map((rowCells, row) =>
        rowCells
          .map((cell, col) => {
            const playable = isDarkCell(row, col);
            const owner = getPieceOwner(cell);
            const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
            const isTarget = targetCells.has(cellKey(row, col));
            const isCaptureTarget = captureTargetCells.has(cellKey(row, col));
            const isPath = pathCells.has(cellKey(row, col));
            const isForced = forcedOrigins.has(cellKey(row, col));
            const isLastFrom = state.lastMove && state.lastMove.fromRow === row && state.lastMove.fromCol === col;
            const isLastTo = state.lastMove && state.lastMove.toRow === row && state.lastMove.toCol === col;

            const classes = [
              "checkers-cell",
              playable ? "is-dark" : "is-light"
            ];

            if (isSelected) {
              classes.push("is-selected");
            }
            if (showHints && isTarget) {
              classes.push("is-target");
            }
            if (showHints && isCaptureTarget) {
              classes.push("is-capture-target");
            }
            if (showHints && isPath) {
              classes.push("is-path");
            }
            if (showHints && isForced) {
              classes.push("is-forced");
            }
            if (isLastFrom) {
              classes.push("is-last-from");
            }
            if (isLastTo) {
              classes.push("is-last-to");
            }

            const disabled = !playable || !canAct;
            const player = owner === null ? null : players.find((item) => item.slot === owner);
            const pieceMarkup = cell
              ? `
                <span class="checkers-piece slot-${owner} ${isKingPiece(cell) ? "is-king" : ""}" style="${player ? `--player-accent:${player.identity.color};` : ""}">
                  <span class="checkers-piece-core"></span>
                  ${isKingPiece(cell) ? '<span class="checkers-piece-crown">D</span>' : ""}
                </span>
              `
              : "";

            const hintMarkup = showHints && isTarget ? '<span class="checkers-target-dot" aria-hidden="true"></span>' : "";
            const label = playable
              ? `${pieceLabel(cell)} en fila ${row + 1}, columna ${col + 1}`
              : `Casilla clara fila ${row + 1}, columna ${col + 1}`;

            return `
              <button
                class="${classes.join(" ")}"
                data-action="game-action"
                data-game-action="select-cell"
                data-row="${row}"
                data-col="${col}"
                aria-label="${escapeHtml(label)}"
                ${disabled ? "disabled" : ""}
              >
                ${hintMarkup}
                ${pieceMarkup}
              </button>
            `;
          })
          .join("")
      )
      .join("");

    return `
      <div class="checkers-shell">
        <div class="checkers-board">
          ${boardMarkup}
        </div>
      </div>
    `;
  },
  formatResult({ state, players }) {
    if (!state.result || state.result.type !== "win") {
      return null;
    }

    const winner = players.find((player) => player.slot === state.result.slot);
    const subtitle =
      state.result.reason === "no-moves"
        ? "El rival se ha quedado sin movimientos legales."
        : "Has capturado todas las fichas rivales.";

    return {
      title: `Ha ganado ${winner ? winner.name : "Jugador"}`,
      subtitle,
      iconText: winner ? winner.identity.icon : "D",
      iconClass: "win"
    };
  }
};
