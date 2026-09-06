const TRACK_LENGTH = 52;
const FINAL_LENGTH = 6;
const GOAL_PROGRESS = TRACK_LENGTH + FINAL_LENGTH;
const PIECES_PER_PLAYER = 4;
const GAME_MODES = Object.freeze(["normal", "chaos"]);
const DEFAULT_MODE = "normal";

// Ludo-style path: 52 outer cells + 6 final lane cells per player.
// Visible numbering is rebuilt to match the new 15x15 board geometry.
const START_CELLS = Object.freeze([6, 45, 32, 19]);
const FINAL_ENTRY_CELLS = Object.freeze([5, 44, 31, 18]);
const SAFE_CELLS = new Set([6, 13, 19, 26, 32, 39, 45, 52]);

function visibleCellToIndex(cell) {
  return cell - 1;
}

const START_INDICES = START_CELLS.map(visibleCellToIndex);
const FINAL_ENTRY_INDICES = FINAL_ENTRY_CELLS.map(visibleCellToIndex);
const SAFE_INDICES = new Set([...SAFE_CELLS].map(visibleCellToIndex));
const ENTRY_PROGRESS_BY_SLOT = FINAL_ENTRY_INDICES.map((entry, slot) => (entry - START_INDICES[slot] + TRACK_LENGTH) % TRACK_LENGTH);

const SLOT_THEMES = [
  {
    name: "Rojo",
    piece: "#ff2a2f",
    pieceDark: "#a10f16",
    home: "#ff2a2f",
    lane: "#ff7c7f",
    laneStrong: "#ff2a2f"
  },
  {
    name: "Azul",
    piece: "#3192dc",
    pieceDark: "#184f85",
    home: "#3192dc",
    lane: "#7cb9eb",
    laneStrong: "#3192dc"
  },
  {
    name: "Amarillo",
    piece: "#f4df19",
    pieceDark: "#917700",
    home: "#f4df19",
    lane: "#f9ef78",
    laneStrong: "#f4df19"
  },
  {
    name: "Verde",
    piece: "#70bc35",
    pieceDark: "#2f6817",
    home: "#70bc35",
    lane: "#9dd866",
    laneStrong: "#70bc35"
  }
];

const DIE_PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

const HOME_BLUEPRINT = Object.freeze([
  Object.freeze({ slot: 0, row: 1, col: 1, rowSpan: 6, colSpan: 6 }),
  Object.freeze({ slot: 1, row: 1, col: 10, rowSpan: 6, colSpan: 6 }),
  Object.freeze({ slot: 2, row: 10, col: 10, rowSpan: 6, colSpan: 6 }),
  Object.freeze({ slot: 3, row: 10, col: 1, rowSpan: 6, colSpan: 6 })
]);

const GOAL_BLUEPRINT = Object.freeze({
  row: 7,
  col: 7,
  rowSpan: 3,
  colSpan: 3
});

const TOP_TRACK_PATH = Object.freeze([
  Object.freeze({ row: 6, col: 9, axis: "vertical" }),
  Object.freeze({ row: 5, col: 9, axis: "vertical" }),
  Object.freeze({ row: 4, col: 9, axis: "vertical" }),
  Object.freeze({ row: 3, col: 9, axis: "vertical" }),
  Object.freeze({ row: 2, col: 9, axis: "vertical" }),
  Object.freeze({ row: 1, col: 9, axis: "horizontal" }),
  Object.freeze({ row: 1, col: 8, axis: "horizontal" }),
  Object.freeze({ row: 1, col: 7, axis: "horizontal" }),
  Object.freeze({ row: 2, col: 7, axis: "vertical" }),
  Object.freeze({ row: 3, col: 7, axis: "vertical" }),
  Object.freeze({ row: 4, col: 7, axis: "vertical" }),
  Object.freeze({ row: 5, col: 7, axis: "vertical" }),
  Object.freeze({ row: 6, col: 7, axis: "vertical" })
]);

const WEST_TRACK_PATH = Object.freeze([
  Object.freeze({ row: 7, col: 6, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 5, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 4, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 3, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 2, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 1, axis: "vertical" }),
  Object.freeze({ row: 8, col: 1, axis: "vertical" }),
  Object.freeze({ row: 9, col: 1, axis: "vertical" }),
  Object.freeze({ row: 9, col: 2, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 3, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 4, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 5, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 6, axis: "horizontal" })
]);

const SOUTH_TRACK_PATH = Object.freeze([
  Object.freeze({ row: 10, col: 7, axis: "vertical" }),
  Object.freeze({ row: 11, col: 7, axis: "vertical" }),
  Object.freeze({ row: 12, col: 7, axis: "vertical" }),
  Object.freeze({ row: 13, col: 7, axis: "vertical" }),
  Object.freeze({ row: 14, col: 7, axis: "vertical" }),
  Object.freeze({ row: 15, col: 7, axis: "horizontal" }),
  Object.freeze({ row: 15, col: 8, axis: "horizontal" }),
  Object.freeze({ row: 15, col: 9, axis: "horizontal" }),
  Object.freeze({ row: 14, col: 9, axis: "vertical" }),
  Object.freeze({ row: 13, col: 9, axis: "vertical" }),
  Object.freeze({ row: 12, col: 9, axis: "vertical" }),
  Object.freeze({ row: 11, col: 9, axis: "vertical" }),
  Object.freeze({ row: 10, col: 9, axis: "vertical" })
]);

const EAST_TRACK_PATH = Object.freeze([
  Object.freeze({ row: 9, col: 10, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 11, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 12, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 13, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 14, axis: "horizontal" }),
  Object.freeze({ row: 9, col: 15, axis: "vertical" }),
  Object.freeze({ row: 8, col: 15, axis: "vertical" }),
  Object.freeze({ row: 7, col: 15, axis: "vertical" }),
  Object.freeze({ row: 7, col: 14, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 13, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 12, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 11, axis: "horizontal" }),
  Object.freeze({ row: 7, col: 10, axis: "horizontal" })
]);

const TRACK_SEQUENCE = Object.freeze([
  ...TOP_TRACK_PATH,
  ...WEST_TRACK_PATH,
  ...SOUTH_TRACK_PATH,
  ...EAST_TRACK_PATH
]);

const TRACK_BLUEPRINT = Object.freeze(
  TRACK_SEQUENCE.map((cell, index) =>
    Object.freeze({
      ...cell,
      visibleCell: index + 1,
      isFinalEntry: FINAL_ENTRY_CELLS.includes(index + 1),
      isStart: START_CELLS.includes(index + 1),
      isSafe: SAFE_CELLS.has(index + 1)
    })
  )
);

const FINAL_LANE_BLUEPRINT = Object.freeze([
  Object.freeze([
    Object.freeze({ step: 1, row: 2, col: 8, axis: "v", segment: "entry" }),
    Object.freeze({ step: 2, row: 3, col: 8, axis: "v", segment: "mid" }),
    Object.freeze({ step: 3, row: 4, col: 8, axis: "v", segment: "mid" }),
    Object.freeze({ step: 4, row: 5, col: 8, axis: "v", segment: "mid" }),
    Object.freeze({ step: 5, row: 6, col: 8, axis: "v", segment: "goal" }),
    Object.freeze({ step: 6, row: 7, col: 8, axis: "v", segment: "goal" })
  ]),
  Object.freeze([
    Object.freeze({ step: 1, row: 8, col: 14, axis: "h", segment: "entry" }),
    Object.freeze({ step: 2, row: 8, col: 13, axis: "h", segment: "mid" }),
    Object.freeze({ step: 3, row: 8, col: 12, axis: "h", segment: "mid" }),
    Object.freeze({ step: 4, row: 8, col: 11, axis: "h", segment: "mid" }),
    Object.freeze({ step: 5, row: 8, col: 10, axis: "h", segment: "goal" }),
    Object.freeze({ step: 6, row: 8, col: 9, axis: "h", segment: "goal" })
  ]),
  Object.freeze([
    Object.freeze({ step: 1, row: 14, col: 8, axis: "v", segment: "entry" }),
    Object.freeze({ step: 2, row: 13, col: 8, axis: "v", segment: "mid" }),
    Object.freeze({ step: 3, row: 12, col: 8, axis: "v", segment: "mid" }),
    Object.freeze({ step: 4, row: 11, col: 8, axis: "v", segment: "mid" }),
    Object.freeze({ step: 5, row: 10, col: 8, axis: "v", segment: "goal" }),
    Object.freeze({ step: 6, row: 9, col: 8, axis: "v", segment: "goal" })
  ]),
  Object.freeze([
    Object.freeze({ step: 1, row: 8, col: 2, axis: "h", segment: "entry" }),
    Object.freeze({ step: 2, row: 8, col: 3, axis: "h", segment: "mid" }),
    Object.freeze({ step: 3, row: 8, col: 4, axis: "h", segment: "mid" }),
    Object.freeze({ step: 4, row: 8, col: 5, axis: "h", segment: "mid" }),
    Object.freeze({ step: 5, row: 8, col: 6, axis: "h", segment: "goal" }),
    Object.freeze({ step: 6, row: 8, col: 7, axis: "h", segment: "goal" })
  ])
]);

const FINAL_LANE_LAYOUT = Object.freeze([
  Object.freeze({ axis: "vertical", entryEdge: "top", goalEdge: "bottom", goalStartStep: 6 }),
  Object.freeze({ axis: "horizontal", entryEdge: "right", goalEdge: "left", goalStartStep: 6 }),
  Object.freeze({ axis: "vertical", entryEdge: "bottom", goalEdge: "top", goalStartStep: 6 }),
  Object.freeze({ axis: "horizontal", entryEdge: "left", goalEdge: "right", goalStartStep: 6 })
]);

const HOME_SLOT_ORDER = Object.freeze([0, 1, 2, 3]);

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

function normalizeMode(mode) {
  return GAME_MODES.includes(mode) ? mode : DEFAULT_MODE;
}

function isChaosMode(state) {
  return normalizeMode(state.mode) === "chaos";
}

function isNormalMode(state) {
  return !isChaosMode(state);
}

function getTheme(slot) {
  return SLOT_THEMES[slot] || SLOT_THEMES[slot % SLOT_THEMES.length] || SLOT_THEMES[0];
}

function indexForProgress(playerSlot, progress) {
  const start = START_INDICES[playerSlot];
  return (start + progress) % TRACK_LENGTH;
}

function playerPieces(state, playerSlot) {
  return state.pieces.filter((piece) => piece.playerSlot === playerSlot);
}

function isBridge(occupants) {
  if (!occupants || occupants.length < 2) {
    return false;
  }
  return occupants.every((piece) => piece.playerSlot === occupants[0].playerSlot);
}

function isBlockingBridge(state, trackIndex, occupants) {
  return isNormalMode(state) && SAFE_INDICES.has(trackIndex) && isBridge(occupants);
}

function buildTrackMap(pieces) {
  const map = new Map();
  for (const piece of pieces) {
    if (piece.progress < 0 || piece.progress > TRACK_LENGTH - 1) {
      continue;
    }
    const index = indexForProgress(piece.playerSlot, piece.progress);
    if (!map.has(index)) {
      map.set(index, []);
    }
    map.get(index).push(piece);
  }
  return map;
}

function getTrackOccupants(trackMap, index, excludePieceId = "") {
  const raw = trackMap.get(index) || [];
  if (!excludePieceId) {
    return raw;
  }
  return raw.filter((piece) => piece.id !== excludePieceId);
}

function getFinalOccupants(state, playerSlot, finalProgress, excludePieceId = "") {
  return state.pieces.filter((piece) => {
    if (piece.id === excludePieceId) {
      return false;
    }
    if (piece.playerSlot !== playerSlot) {
      return false;
    }
    return piece.progress === finalProgress;
  });
}

function hasHomePieces(state, playerSlot) {
  return playerPieces(state, playerSlot).some((piece) => piece.progress < 0);
}

function allPiecesInHome(state, playerSlot) {
  return playerPieces(state, playerSlot).every((piece) => piece.progress < 0);
}

function allPiecesOutsideHome(state, playerSlot) {
  return playerPieces(state, playerSlot).every((piece) => piece.progress >= 0);
}

function getBridgePieceIds(state, playerSlot) {
  const trackMap = buildTrackMap(state.pieces);
  const ids = [];
  for (const occupants of trackMap.values()) {
    if (occupants.length < 2) {
      continue;
    }
    if (!occupants.every((piece) => piece.playerSlot === playerSlot)) {
      continue;
    }
    ids.push(...occupants.map((piece) => piece.id));
  }
  return ids;
}

function evaluateTrackLanding(state, piece, targetIndex, trackMap) {
  const occupants = getTrackOccupants(trackMap, targetIndex, piece.id);

  if (occupants.length === 0) {
    return { ok: true, capturePieceId: null };
  }

  const allSameColor = occupants.every((item) => item.playerSlot === piece.playerSlot);
  if (allSameColor) {
    if (occupants.length >= 2) {
      return { ok: false, capturePieceId: null };
    }
    return { ok: true, capturePieceId: null };
  }

  if (isNormalMode(state) && SAFE_INDICES.has(targetIndex)) {
    if (occupants.length >= 2) {
      return { ok: false, capturePieceId: null };
    }
    return { ok: true, capturePieceId: null };
  }

  if (occupants.length === 1) {
    return { ok: true, capturePieceId: occupants[0].id };
  }

  return { ok: false, capturePieceId: null };
}

function computeMoveForPiece(state, piece, steps, options = {}, trackMap) {
  const forBonus = Boolean(options.forBonus);
  const exitFromHome = Boolean(options.exitFromHome);

  if (piece.progress < 0) {
    if (forBonus || !exitFromHome) {
      return null;
    }

    const exitIndex = START_INDICES[piece.playerSlot];
    const landing = evaluateTrackLanding(state, piece, exitIndex, trackMap);
    if (!landing.ok) {
      return null;
    }

    return {
      pieceId: piece.id,
      fromProgress: piece.progress,
      toProgress: 0,
      capturePieceId: landing.capturePieceId,
      trackPath: [exitIndex]
    };
  }

  if (piece.progress >= GOAL_PROGRESS) {
    return null;
  }

  const target = piece.progress + steps;
  if (target > GOAL_PROGRESS) {
    return null;
  }

  const trackLimit = ENTRY_PROGRESS_BY_SLOT[piece.playerSlot];
  const trackPath = [];

  for (let step = 1; step <= steps; step += 1) {
    const progressAtStep = piece.progress + step;
    if (progressAtStep > trackLimit) {
      break;
    }

    const trackIndex = indexForProgress(piece.playerSlot, progressAtStep);
    trackPath.push(trackIndex);

    const bridgeOccupants = getTrackOccupants(trackMap, trackIndex, piece.id);
    if (isBlockingBridge(state, trackIndex, bridgeOccupants)) {
      return null;
    }
  }

  if (target <= trackLimit) {
    const targetIndex = indexForProgress(piece.playerSlot, target);
    const landing = evaluateTrackLanding(state, piece, targetIndex, trackMap);
    if (!landing.ok) {
      return null;
    }

    return {
      pieceId: piece.id,
      fromProgress: piece.progress,
      toProgress: target,
      capturePieceId: landing.capturePieceId,
      trackPath
    };
  }

  if (target === GOAL_PROGRESS) {
    return {
      pieceId: piece.id,
      fromProgress: piece.progress,
      toProgress: target,
      capturePieceId: null,
      trackPath
    };
  }

  const finalOccupants = getFinalOccupants(state, piece.playerSlot, target, piece.id);
  if (finalOccupants.length >= 2) {
    return null;
  }

  return {
    pieceId: piece.id,
    fromProgress: piece.progress,
    toProgress: target,
    capturePieceId: null,
    trackPath
  };
}

function getLegalMoves(state, playerSlot, steps, options = {}) {
  const pieces = playerPieces(state, playerSlot);
  let candidates = pieces;

  if (options.mustExitHome) {
    candidates = candidates.filter((piece) => piece.progress < 0);
  }

  if (options.restrictPieceIds && options.restrictPieceIds.size > 0) {
    candidates = candidates.filter((piece) => options.restrictPieceIds.has(piece.id));
  }

  const trackMap = buildTrackMap(state.pieces);
  const moves = [];

  for (const piece of candidates) {
    const move = computeMoveForPiece(state, piece, steps, options, trackMap);
    if (move) {
      moves.push(move);
    }
  }

  return moves;
}

function checkWinner(state, playerSlot) {
  const pieces = playerPieces(state, playerSlot);
  return pieces.every((piece) => piece.progress >= GOAL_PROGRESS);
}

function cloneState(state) {
  return {
    ...state,
    pieces: state.pieces.map((piece) => ({ ...piece })),
    movablePieceIds: [...(state.movablePieceIds || [])],
    bonusQueue: [...(state.bonusQueue || [])],
    bonusPending: state.bonusPending ? { ...state.bonusPending } : null,
    pendingMove: state.pendingMove ? { ...state.pendingMove } : null,
    lastPath: [...(state.lastPath || [])],
    diceValues: [...(state.diceValues || [null, null])],
    diceConsumed: [...(state.diceConsumed || [false, false])],
    splitUsedPieceIds: [...(state.splitUsedPieceIds || [])],
    extraTurnsPending: Number(state.extraTurnsPending || 0),
    homeRollAttempts: Number(state.homeRollAttempts || 0),
    showDiceAnimation: Boolean(state.showDiceAnimation)
  };
}

function resetTurnDiceState(state) {
  state.diceValues = [null, null];
  state.diceConsumed = [false, false];
  state.showDiceAnimation = false;
  state.pendingMove = null;
  state.movablePieceIds = [];
  state.selectedPieceId = null;
  state.bonusPending = null;
  state.effectiveSteps = null;
  state.splitUsedPieceIds = [];
}

function resetSelectionState(state) {
  state.phase = "await-roll";
  resetTurnDiceState(state);
}

function advanceToNextPlayer(state) {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
  state.turnLastMovedPieceId = null;
  state.lastPath = [];
  state.bonusQueue = [];
  state.extraTurnsPending = 0;
  state.homeRollAttempts = 0;
  state.doubleStreak = 0;
  resetTurnDiceState(state);
  state.phase = "await-roll";
}

function applyThirdDoublePenalty(state, playerSlot) {
  const candidate = state.pieces.find((piece) =>
    piece.id === state.lastMovedPieceId &&
    piece.playerSlot === playerSlot &&
    piece.progress >= 0 &&
    piece.progress < GOAL_PROGRESS
  );

  if (candidate) {
    candidate.progress = -1;
    state.lastMovedPieceId = candidate.id;
    state.selectedPieceId = candidate.id;
    state.lastPath = [];
    state.lastEvent = "Tercer doble: la ultima ficha movida vuelve a casa y el turno pasa.";
    return;
  }

  state.lastEvent = "Tercer doble: pierdes el turno.";
}

function applyMoveCore(state, move) {
  const piece = state.pieces.find((item) => item.id === move.pieceId);
  if (!piece) {
    return;
  }

  piece.progress = move.toProgress;
  state.turnLastMovedPieceId = piece.id;
  state.lastMovedPieceId = piece.id;
  state.selectedPieceId = piece.id;
  state.lastPath = [...(move.trackPath || [])];

  if (move.capturePieceId) {
    const captured = state.pieces.find((item) => item.id === move.capturePieceId);
    if (captured) {
      captured.progress = -1;
      if (isNormalMode(state)) {
        state.bonusQueue.push({ type: 21, reason: "capture", sourcePieceId: piece.id });
        state.lastEvent = "Captura realizada. Bonus de 21 casillas.";
      } else {
        state.lastEvent = "Captura realizada. En modo Caos no hay bonus de captura.";
      }
    }
  }

  if (piece.progress === GOAL_PROGRESS) {
    state.extraTurnsPending = (state.extraTurnsPending || 0) + 1;
    if (move.capturePieceId) {
      state.lastEvent = "Captura y entrada en meta. Ganas tiro extra.";
    } else {
      state.lastEvent = "Ficha en meta. Ganas tiro extra.";
    }
  }

  if (!move.capturePieceId && piece.progress !== GOAL_PROGRESS) {
    state.lastEvent = "Movimiento aplicado.";
  }

  if (checkWinner(state, piece.playerSlot)) {
    state.winnerSlot = piece.playerSlot;
    state.phase = "finished";
    state.bonusQueue = [];
    state.bonusPending = null;
    state.pendingMove = null;
    state.movablePieceIds = [];
    state.extraTurnsPending = 0;
    state.lastEvent = "Partida terminada.";
  }
}

function availableDiceIndices(state) {
  return (state.diceValues || [])
    .map((value, index) => ({ value, index }))
    .filter((item) => Number.isInteger(item.value) && !(state.diceConsumed || [])[item.index])
    .map((item) => item.index);
}

function getExitMoves(state, playerSlot) {
  return getLegalMoves(state, playerSlot, 0, { exitFromHome: true });
}

function createExitOptions(state, consumeDice, badge, label) {
  return getExitMoves(state, state.currentPlayerIndex).map((move) =>
    createMoveOption(state, move, {
      kind: "exit-five",
      consumeDice,
      badge,
      label
    })
  );
}

function describeMoveTargetForPlayer(playerSlot, move) {
  if (move.toProgress < TRACK_LENGTH) {
    const trackIndex = indexForProgress(playerSlot, move.toProgress);
    const visibleCell = TRACK_BLUEPRINT[trackIndex].visibleCell;
    return {
      key: `track:${visibleCell}`,
      type: "track",
      visibleCell
    };
  }

  if (move.toProgress < GOAL_PROGRESS) {
    return {
      key: `final:${playerSlot}:${move.toProgress - TRACK_LENGTH + 1}`,
      type: "final",
      slot: playerSlot,
      step: move.toProgress - TRACK_LENGTH + 1
    };
  }

  return {
    key: `goal:${playerSlot}`,
    type: "goal",
    slot: playerSlot
  };
}

function createMoveOption(state, move, meta) {
  const target = describeMoveTargetForPlayer(state.currentPlayerIndex, move);
  const consumeDice = [...(meta.consumeDice || [])];
  return {
    id: `${meta.kind}:${consumeDice.join("")}:${move.pieceId}:${move.toProgress}:${move.capturePieceId || "-"}`,
    kind: meta.kind,
    consumeDice,
    badge: meta.badge,
    label: meta.label,
    remainingDieIndex: meta.remainingDieIndex ?? null,
    pieceId: move.pieceId,
    move,
    target
  };
}

function buildSingleDieOptions(state, dieIndex, excludedPieceIds = []) {
  const value = state.diceValues?.[dieIndex];
  if (!Number.isInteger(value) || state.diceConsumed?.[dieIndex]) {
    return [];
  }

  const options = excludedPieceIds.length > 0 ? { restrictPieceIds: new Set(excludedPieceIds) } : {};
  const legalMoves = getLegalMoves(state, state.currentPlayerIndex, value, options);
  return legalMoves.map((move) =>
    createMoveOption(state, move, {
      kind: "single",
      consumeDice: [dieIndex],
      badge: `D${dieIndex + 1}`,
      label: `Mover con el dado ${dieIndex + 1}`,
      remainingDieIndex: availableDiceIndices(state).find((index) => index !== dieIndex) ?? null
    })
  );
}

function canContinueSplitAfterMove(state, move, dieIndex) {
  const remainingDieIndex = availableDiceIndices(state).find((index) => index !== dieIndex);
  if (remainingDieIndex === undefined || remainingDieIndex === null) {
    return false;
  }

  const clone = cloneState(state);
  clone.diceConsumed[dieIndex] = true;
  clone.splitUsedPieceIds = [...(clone.splitUsedPieceIds || []), move.pieceId];
  applyMoveCore(clone, move);

  if (clone.winnerSlot !== null) {
    return true;
  }

  if ((clone.bonusQueue || []).length > 0) {
    return true;
  }

  return buildSingleDieOptions(clone, remainingDieIndex, clone.splitUsedPieceIds).length > 0;
}

function buildTurnOptions(state) {
  const available = availableDiceIndices(state);
  if (available.length === 0) {
    return [];
  }

  const playerSlot = state.currentPlayerIndex;
  const options = [];
  const splitUsedPieceIds = [...(state.splitUsedPieceIds || [])];

  if (available.length === 2 && splitUsedPieceIds.length === 0) {
    const [firstDieIndex, secondDieIndex] = available;
    const firstValue = state.diceValues[firstDieIndex];
    const secondValue = state.diceValues[secondDieIndex];

    if (hasHomePieces(state, playerSlot)) {
      const exitOptions = [];
      if (firstValue + secondValue === 5) {
        exitOptions.push(...createExitOptions(state, [firstDieIndex, secondDieIndex], "Salir 5", "Salir con la suma 5"));
      }
      for (const dieIndex of available) {
        if (state.diceValues[dieIndex] === 5) {
          exitOptions.push(...createExitOptions(state, [dieIndex], `D${dieIndex + 1}=5`, `Salir con el dado ${dieIndex + 1}`));
        }
      }
      if (exitOptions.length > 0) {
        return exitOptions;
      }
    }

    const sumMoves = getLegalMoves(state, playerSlot, firstValue + secondValue, {});
    options.push(
      ...sumMoves.map((move) =>
        createMoveOption(state, move, {
          kind: "sum",
          consumeDice: [firstDieIndex, secondDieIndex],
          badge: "Suma",
          label: `Mover con la suma ${firstValue + secondValue}`
        })
      )
    );

    for (const dieIndex of available) {
      const singleMoves = buildSingleDieOptions(state, dieIndex, []);
      for (const option of singleMoves) {
        if (canContinueSplitAfterMove(state, option.move, dieIndex)) {
          options.push({
            ...option,
            kind: "split",
            badge: option.badge,
            label: option.label
          });
        }
      }
    }

    return options;
  }

  const remainingDieIndex = available[0];
  if (hasHomePieces(state, playerSlot) && state.diceValues?.[remainingDieIndex] === 5) {
    const exitOptions = createExitOptions(state, [remainingDieIndex], `D${remainingDieIndex + 1}=5`, `Salir con el dado ${remainingDieIndex + 1}`);
    if (exitOptions.length > 0) {
      return exitOptions;
    }
  }
  return buildSingleDieOptions(state, remainingDieIndex, splitUsedPieceIds);
}

function buildBonusOptions(state) {
  const bonus = state.bonusQueue[0];
  if (!bonus) {
    return [];
  }

  const legalMoves = getLegalMoves(state, state.currentPlayerIndex, bonus.type, { forBonus: true });
  return legalMoves.map((move) =>
    createMoveOption(state, move, {
      kind: "bonus",
      consumeDice: [],
      badge: `+${bonus.type}`,
      label: `Bonus de ${bonus.type}`
    })
  );
}

function buildCurrentOptions(state) {
  if (state.phase === "await-bonus") {
    return buildBonusOptions(state);
  }
  if (state.phase === "await-piece") {
    return buildTurnOptions(state);
  }
  return [];
}

function buildPendingTargetMap(state) {
  const targets = new Map();
  const options = buildCurrentOptions(state);

  for (const option of options) {
    const bucket = targets.get(option.target.key) || { ...option.target, options: [] };
    bucket.options.push(option);
    targets.set(option.target.key, bucket);
  }

  return targets;
}

function startTurnDestinationSelection(state, message = "") {
  const options = buildTurnOptions(state);
  if (options.length === 0) {
    return false;
  }

  state.phase = "await-piece";
  state.pendingMove = { source: "turn" };
  state.movablePieceIds = options.map((option) => option.move.pieceId);
  state.selectedPieceId = null;
  state.effectiveSteps = null;
  if (message) {
    state.lastEvent = message;
  }
  return true;
}

function resolveBonusQueue(state) {
  while (state.bonusQueue.length > 0 && state.winnerSlot === null) {
    const bonus = state.bonusQueue[0];
    const legal = getLegalMoves(state, state.currentPlayerIndex, bonus.type, { forBonus: true });

    if (legal.length === 0) {
      state.bonusQueue.shift();
      state.lastEvent = `Bonus de ${bonus.type} sin jugada legal.`;
      continue;
    }

    state.phase = "await-bonus";
    state.bonusPending = { ...bonus };
    state.pendingMove = {
      source: "bonus",
      steps: bonus.type
    };
    state.movablePieceIds = legal.map((move) => move.pieceId);
    state.selectedPieceId = null;
    state.effectiveSteps = bonus.type;
    state.lastEvent = `Bonus de ${bonus.type}: toca el destino.`;
    return "await-input";
  }

  state.bonusPending = null;
  state.movablePieceIds = [];
  state.selectedPieceId = null;
  state.effectiveSteps = null;
  return "done";
}

function resetForExtraTurn(state) {
  resetTurnDiceState(state);
  state.phase = "await-roll";
  state.homeRollAttempts = 0;
}

function finalizeTurnAfterResolution(state) {
  if (state.winnerSlot !== null) {
    return;
  }

  if ((state.extraTurnsPending || 0) > 0) {
    state.extraTurnsPending -= 1;
    resetForExtraTurn(state);
    if (!state.lastEvent || state.lastEvent === "Movimiento aplicado.") {
      state.lastEvent = "Tiro extra concedido.";
    }
    return;
  }

  advanceToNextPlayer(state);
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollDicePair() {
  return [rollDie(), rollDie()];
}

function runRollAction(state) {
  if (state.phase !== "await-roll") {
    return { ok: false, reason: "invalid" };
  }

  const playerSlot = state.currentPlayerIndex;
  const [leftDie, rightDie] = rollDicePair();
  const isDouble = leftDie === rightDie;
  const allHome = allPiecesInHome(state, playerSlot);

  state.diceValues = [leftDie, rightDie];
  state.diceConsumed = [false, false];
  state.showDiceAnimation = true;
  state.diceToken = (state.diceToken + 1) % 1000000;
  state.lastPath = [];
  state.homeRollAttempts = 0;
  state.splitUsedPieceIds = [];
  state.bonusQueue = [];
  state.bonusPending = null;
  state.pendingMove = null;
  state.movablePieceIds = [];
  state.selectedPieceId = null;
  state.effectiveSteps = null;
  state.doubleStreak = isDouble ? Number(state.doubleStreak || 0) + 1 : 0;

  if (isDouble && state.doubleStreak >= 3) {
    applyThirdDoublePenalty(state, playerSlot);
    state.doubleStreak = 0;
    advanceToNextPlayer(state);
    return { ok: true };
  }

  if (isDouble) {
    state.extraTurnsPending = (state.extraTurnsPending || 0) + 1;
  }

  const message = isDouble
    ? `Doble ${leftDie}-${rightDie}. Juega la tirada y repites turno.`
    : `Tirada de ${leftDie} y ${rightDie}. Toca un destino para mover.`;

  if (startTurnDestinationSelection(state, message)) {
    return { ok: true };
  }

  state.lastEvent = allHome
    ? `No salio 5 para abrir (${leftDie} y ${rightDie}).`
    : `No hay jugada legal con ${leftDie} y ${rightDie}.`;
  finalizeTurnAfterResolution(state);
  return { ok: true };
}

function runDestinationSelection(state, selectionId, expectBonusAction) {
  if (!selectionId) {
    return { ok: false, reason: "invalid" };
  }

  if (expectBonusAction && state.phase !== "await-bonus") {
    return { ok: false, reason: "invalid" };
  }

  if (!expectBonusAction && state.phase !== "await-piece") {
    return { ok: false, reason: "invalid" };
  }

  const pending = state.pendingMove;
  if (!pending) {
    return { ok: false, reason: "invalid" };
  }

  if (pending.source === "turn" && expectBonusAction) {
    return { ok: false, reason: "invalid" };
  }

  if (pending.source === "bonus" && !expectBonusAction) {
    return { ok: false, reason: "invalid" };
  }

  const currentOptions = buildCurrentOptions(state);
  const selectedOption = currentOptions.find((option) => option.id === selectionId)
    || currentOptions.find((option) => option.move.pieceId === selectionId);
  if (!selectedOption) {
    return { ok: false, reason: "invalid" };
  }

  state.showDiceAnimation = false;

  if (pending.source === "bonus") {
    state.bonusQueue.shift();
  } else {
    for (const dieIndex of selectedOption.consumeDice) {
      state.diceConsumed[dieIndex] = true;
    }
    if (selectedOption.consumeDice.length === 1) {
      state.splitUsedPieceIds = [...(state.splitUsedPieceIds || []), selectedOption.move.pieceId];
    }
  }

  applyMoveCore(state, selectedOption.move);

  if (state.winnerSlot !== null) {
    return { ok: true };
  }

  const bonusStatus = resolveBonusQueue(state);
  if (bonusStatus === "await-input") {
    return { ok: true };
  }

  if (availableDiceIndices(state).length > 0 && startTurnDestinationSelection(state, "Queda un dado por jugar. Toca el siguiente destino.")) {
    return { ok: true };
  }

  if (availableDiceIndices(state).length > 0) {
    state.lastEvent = "No queda jugada legal con el dado restante.";
  }

  finalizeTurnAfterResolution(state);
  return { ok: true };
}

function renderMoveTarget(state, target, labelPrefix = "Mover") {
  if (!target) {
    return "";
  }

  const delayedClass = state.showDiceAnimation ? " is-delayed" : "";

  if (target.options.length === 1) {
    const option = target.options[0];
    return `
      <button
        class="parchis-move-target is-single${delayedClass}"
        data-action="game-action"
        data-game-action="select-destination"
        data-piece-id="${option.id}"
        aria-label="${escapeHtml(`${labelPrefix}. ${option.label}.`)}"
      >
        <span class="parchis-move-target-badge">${escapeHtml(option.badge || "Mover")}</span>
      </button>
    `;
  }

  const groupBadge = target.options.every((option) => option.badge === target.options[0].badge) ? target.options[0].badge : "Mover";

  return `
    <span class="parchis-move-target is-multi${delayedClass}" role="group" aria-label="${escapeHtml(`${labelPrefix}. Elige ficha.`)}">
      <span class="parchis-move-target-badge is-group">${escapeHtml(groupBadge)}</span>
      <span class="parchis-move-target-choice-row">
        ${target.options
          .map((option) => {
            const piece = state.pieces.find((item) => item.id === option.move.pieceId);
            const label = piece ? piece.pieceIndex + 1 : "?";
            return `
              <button
                class="parchis-move-target-choice"
                data-action="game-action"
                data-game-action="select-destination"
                data-piece-id="${option.id}"
                aria-label="${escapeHtml(`${labelPrefix}. Ficha ${label}. ${option.label}.`)}"
              >
                ${label}
              </button>
            `;
          })
          .join("")}
      </span>
    </span>
  `;
}

function renderDieFace(value, extraClass = "") {
  const pips = Number.isInteger(value) ? new Set(DIE_PIPS[value] || []) : new Set();
  const classes = ["parchis-die-face"];
  if (extraClass) {
    classes.push(extraClass);
  }
  return `
    <span class="${classes.join(" ")}">
      ${Array.from({ length: 9 }, (_, index) => `<span class="parchis-die-pip ${pips.has(index) ? "is-on" : ""}"></span>`).join("")}
    </span>
  `;
}

function renderDie(value) {
  return `
    <div class="parchis-die-cube-3d" aria-hidden="true">
      <div class="parchis-die-face-3d face-1">${renderDieFace(1)}</div>
      <div class="parchis-die-face-3d face-6">${renderDieFace(6)}</div>
      <div class="parchis-die-face-3d face-3">${renderDieFace(3)}</div>
      <div class="parchis-die-face-3d face-4">${renderDieFace(4)}</div>
      <div class="parchis-die-face-3d face-5">${renderDieFace(5)}</div>
      <div class="parchis-die-face-3d face-2">${renderDieFace(2)}</div>
    </div>
  `;
}

function buildFinalMap(pieces) {
  const map = new Map();
  for (const piece of pieces) {
    if (piece.progress < TRACK_LENGTH || piece.progress > GOAL_PROGRESS - 1) {
      continue;
    }
    const finalIndex = piece.progress - TRACK_LENGTH;
    const key = `${piece.playerSlot}:${finalIndex}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(piece);
  }
  return map;
}

function buildSlotPieceMap(pieces, predicate) {
  const map = new Map();
  for (const piece of pieces) {
    if (!predicate(piece)) {
      continue;
    }
    map.set(`${piece.playerSlot}:${piece.pieceIndex}`, piece);
  }
  return map;
}

function renderGridPlacement({ row, col, rowSpan = 1, colSpan = 1 }) {
  return `--row:${row};--col:${col};--row-span:${rowSpan};--col-span:${colSpan};`;
}

function renderLocalGridPlacement({ row, col, rowSpan = 1, colSpan = 1 }) {
  return `--local-row:${row};--local-col:${col};--local-row-span:${rowSpan};--local-col-span:${colSpan};`;
}

function getTrackPlacement(cell) {
  return {
    row: cell.row,
    col: cell.col,
    rowSpan: 1,
    colSpan: 1,
    axis: cell.axis
  };
}

function getFinalLanePlacement(slot, cell) {
  const layout = FINAL_LANE_LAYOUT[slot] || FINAL_LANE_LAYOUT[0];
  return {
    row: cell.row,
    col: cell.col,
    rowSpan: cell.rowSpan || 1,
    colSpan: cell.colSpan || 1,
    axis: layout.axis
  };
}

function getTrackNumberRegion(placement) {
  if (placement.row <= 6) {
    return "top";
  }
  if (placement.row >= 10) {
    return "bottom";
  }
  if (placement.col <= 6) {
    return "left";
  }
  if (placement.col >= 10) {
    return "right";
  }
  return "center";
}

function getTrackCellClasses({
  cell,
  startOwner,
  isEntry,
  isSafe,
  isBridgeCell,
  recentPath,
  occupants,
  placement
}) {
  const visualAxis = placement.axis || (placement.rowSpan > placement.colSpan ? "vertical" : "horizontal");
  const classes = ["parchis-track-cell", `is-${visualAxis}`];

  if (occupants.length > 0) {
    classes.push("has-occupants");
  }
  if (startOwner >= 0) {
    classes.push("is-start", `slot-${startOwner}`);
  }
  if (isEntry) {
    classes.push("is-entry");
  }
  if (isSafe) {
    classes.push("is-safe");
  }
  if (isBridgeCell) {
    classes.push("is-bridge");
  }
  if (recentPath) {
    classes.push("is-recent-path");
  }
  if (placement.rowSpan > 1 || placement.colSpan > 1) {
    classes.push("is-wide-track");
  }
  classes.push(`number-${getTrackNumberRegion(placement)}`);

  return classes;
}

function getFinalLaneCellClasses(slot, cell, laneLayout) {
  const classes = ["parchis-final-cell", `slot-${slot}`, `is-${laneLayout.axis}`, `segment-${cell.segment}`];

  if (cell.segment === "entry") {
    classes.push("is-entry-segment", "is-track-link");
  }
  if (cell.segment === "mid") {
    classes.push("is-mid-segment");
  }
  if (cell.segment === "goal") {
    classes.push("is-goal-segment", `goal-edge-${laneLayout.goalEdge}`);
  }
  if (cell.step > laneLayout.goalStartStep) {
    classes.push("is-under-goal");
  }
  if (cell.step === FINAL_LENGTH) {
    classes.push("is-goal-link");
  }

  return classes;
}

function renderPieceButton(piece, { state, canAct, phaseAction, movableSet, bridge = false } = {}) {
  const theme = getTheme(piece.playerSlot);
  const movable = canAct && movableSet && movableSet.has(piece.id);
  const selected = state.selectedPieceId === piece.id;
  const isGoalPiece = piece.progress >= GOAL_PROGRESS;

  const classes = ["parchis-piece", `slot-${piece.playerSlot}`];
  if (movable)   classes.push("is-movable");
  if (selected)  classes.push("is-selected");
  if (isGoalPiece) classes.push("is-goal");
  if (piece.id === state.lastMovedPieceId) classes.push("is-last");
  if (bridge)    classes.push("is-bridge");

  const actionAttrs = movable
    ? `data-action="game-action" data-game-action="${phaseAction}" data-piece-id="${piece.id}"`
    : "disabled";

  return `<button class="${classes.join(" ")}" style="--piece:${theme.piece};--piece-dark:${theme.pieceDark}" ${actionAttrs}><span>${piece.pieceIndex + 1}</span></button>`;
}

function renderPieceStack(pieces, options = {}) {
  const count = pieces.length;
  if (!count) {
    return "";
  }

  return `
    <span class="parchis-piece-stack count-${Math.min(count, 4)}">
      ${pieces.map((piece) => `<span class="parchis-piece-dock">${renderPieceButton(piece, options)}</span>`).join("")}
    </span>
  `;
}

function renderPlayerStatus(state, players) {
  return players
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((player) => {
      const pieces = playerPieces(state, player.slot);
      const inHome = pieces.filter((piece) => piece.progress < 0).length;
      const inGoal = pieces.filter((piece) => piece.progress >= GOAL_PROGRESS).length;
      const theme = getTheme(player.slot);
      const isActive = state.currentPlayerIndex === player.slot && state.winnerSlot === null;
      return `
        <article class="parchis-player-row ${isActive ? "is-active" : ""}">
          <span class="parchis-player-token" style="--token:${theme.piece}">${escapeHtml(player.identity.icon)}</span>
          <div class="parchis-player-meta">
            <p class="parchis-player-name">${escapeHtml(player.name)}</p>
            <p class="parchis-player-stats">Casa ${inHome} - Meta ${inGoal}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function buildPhaseHelp(state) {
  if (state.winnerSlot !== null) {
    return "Partida finalizada.";
  }
  if (state.phase === "await-roll") {
    if (allPiecesInHome(state, state.currentPlayerIndex)) {
      return "Necesitas un 5, en dado o suma, para abrir.";
    }
    return "Pulsa Tirar dados para continuar.";
  }
  if (state.phase === "await-piece") {
    const available = availableDiceIndices(state);
    if (available.length === 2) {
      return "Toca un destino para salir, mover con la suma o empezar un movimiento con un dado.";
    }
    if (available.length === 1) {
      return `Queda ${state.diceValues?.[available[0]] || "-"} por jugar. Toca el siguiente destino.`;
    }
    return "Toca un destino para completar el movimiento.";
  }
  if (state.phase === "await-bonus") {
    return `Bonus de ${state.bonusPending ? state.bonusPending.type : 0}. Toca el destino.`;
  }
  return "Resolviendo movimiento.";
}

function getEventTone(state) {
  if (state.winnerSlot !== null) {
    return "is-win";
  }

  const event = String(state.lastEvent || "").toLowerCase();
  if (!event) {
    return "is-neutral";
  }
  if (event.includes("tercer doble") || event.includes("penaliza") || event.includes("pierdes")) {
    return "is-warning";
  }
  if (event.includes("captura")) {
    return "is-capture";
  }
  if (event.includes("bonus")) {
    return "is-bonus";
  }
  if (event.includes("meta")) {
    return "is-goal";
  }
  if (event.includes("doble") || event.includes("tiro extra")) {
    return "is-extra";
  }
  if (event.includes("no queda") || event.includes("necesitas")) {
    return "is-muted";
  }
  return "is-neutral";
}

function renderConfigPanel({ options } = {}) {
  const mode = normalizeMode(options?.mode);
  return `
    <div class="block">
      <h3 class="block-title">Modo</h3>
      <p class="block-sub">Normal conserva seguros y bonus de captura. Caos elimina seguros y bonus.</p>
      <div class="player-count-row">
        <button class="pill ${mode === "normal" ? "is-active" : ""}" data-action="set-game-option" data-option="mode" data-value="normal">Normal</button>
        <button class="pill ${mode === "chaos" ? "is-active" : ""}" data-action="set-game-option" data-option="mode" data-value="chaos">Caos</button>
      </div>
    </div>
  `;
}

export const parchisGame = {
  id: "parchis",
  name: "Parchis",
  subtitle: "2-4 jugadores · Normal/Caos",
  tagline: "Tablero clasico",
  minPlayers: 2,
  maxPlayers: 4,
  useCustomTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Dados", text: "En cada turno tiras 2 dados: puedes mover una ficha con la suma o 2 fichas distintas, una con cada dado." },
    { title: "Salida", text: "Para sacar ficha de casa necesitas un 5, ya sea en un dado individual o con la suma de los dos dados." },
    { title: "Dobles", text: "Si sacas dobles, juegas la tirada y repites turno. El tercer doble seguido penaliza y pasa el turno." },
    { title: "Captura", text: "En modo Normal, capturar en casilla no segura da un bonus obligatorio de 21 casillas. En modo Caos no hay bonus de captura." },
    { title: "Seguros", text: "En modo Normal hay seguros y los puentes solo bloquean en seguros. En modo Caos no hay seguros." },
    { title: "Meta", text: "Para entrar en meta necesitas numero exacto. Meter ficha no da 10: solo concede un tiro extra completo al terminar el turno." },
    { title: "Victoria", text: "Gana quien mete sus 4 fichas en meta." }
  ],
  getDefaultOptions() {
    return { mode: DEFAULT_MODE };
  },
  normalizeOptions(options = {}) {
    return { mode: normalizeMode(options.mode) };
  },
  renderConfigPanel({ options }) {
    return renderConfigPanel({ options });
  },
  createInitialState({ playerCount, options = {} }) {
    const totalPlayers = clamp(Number(playerCount) || 2, 2, 4);
    const normalizedOptions = this.normalizeOptions(options);
    const pieces = [];

    for (let slot = 0; slot < totalPlayers; slot += 1) {
      for (let pieceIndex = 0; pieceIndex < PIECES_PER_PLAYER; pieceIndex += 1) {
        pieces.push({
          id: `p${slot}-${pieceIndex}`,
          playerSlot: slot,
          pieceIndex,
          progress: -1
        });
      }
    }

    return {
      playerCount: totalPlayers,
      mode: normalizedOptions.mode,
      currentPlayerIndex: 0,
      winnerSlot: null,
      phase: "await-roll",
      diceValues: [null, null],
      diceConsumed: [false, false],
      diceToken: 0,
      effectiveSteps: null,
      turnLastMovedPieceId: null,
      lastMovedPieceId: null,
      pendingMove: null,
      bonusQueue: [],
      bonusPending: null,
      movablePieceIds: [],
      splitUsedPieceIds: [],
      extraTurnsPending: 0,
      homeRollAttempts: 0,
      doubleStreak: 0,
      showDiceAnimation: false,
      selectedPieceId: null,
      lastEvent: "Pulsa Tirar dados para empezar.",
      lastPath: [],
      pieces
    };
  },
  getTurnSlot(state) {
    return state.currentPlayerIndex;
  },
  getResult(state) {
    if (state.winnerSlot === null || state.winnerSlot === undefined) {
      return null;
    }
    return {
      type: "win",
      slot: state.winnerSlot
    };
  },
  getTurnMessage({ state, players }) {
    if (state.winnerSlot !== null) {
      const winner = players.find((player) => player.slot === state.winnerSlot);
      return `Ha ganado ${winner ? winner.name : "Jugador"}`;
    }

    const active = players.find((player) => player.slot === state.currentPlayerIndex);
    const name = active ? active.name : "Jugador";

    if (state.phase === "await-roll") {
      if (allPiecesInHome(state, state.currentPlayerIndex)) {
        return `Turno de ${name}. Necesitas un 5 para abrir.`;
      }
      return `Turno de ${name}. Tira los dados.`;
    }

    if (state.phase === "await-piece") {
      const available = availableDiceIndices(state);
      if (available.length === 2) {
        return `Turno de ${name}. Toca un destino para salir o mover.`;
      }
      if (available.length === 1) {
        return `Turno de ${name}. Queda un dado por jugar: toca el siguiente destino.`;
      }
      return `Turno de ${name}. Toca el destino para mover.`;
    }

    if (state.phase === "await-bonus") {
      const steps = state.bonusPending ? state.bonusPending.type : 0;
      return `Turno de ${name}. Bonus ${steps}: toca el destino.`;
    }

    return `Turno de ${name}.`;
  },
  applyAction({ state, action, actorSlot }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (state.winnerSlot !== null) {
      return { ok: false, reason: "finished" };
    }

    if (actorSlot !== state.currentPlayerIndex) {
      return { ok: false, reason: "turn" };
    }

    const next = cloneState(state);

    if (action.type === "roll-die") {
      const result = runRollAction(next);
      if (!result.ok) {
        return result;
      }
      return { ok: true, state: next };
    }

    if (action.type === "select-piece") {
      const result = runDestinationSelection(next, String(action.pieceId || ""), false);
      if (!result.ok) {
        return result;
      }
      return { ok: true, state: next };
    }

    if (action.type === "apply-bonus") {
      const result = runDestinationSelection(next, String(action.pieceId || ""), true);
      if (!result.ok) {
        return result;
      }
      return { ok: true, state: next };
    }

    if (action.type === "select-destination") {
      const result = runDestinationSelection(next, String(action.pieceId || ""), state.phase === "await-bonus");
      if (!result.ok) {
        return result;
      }
      return { ok: true, state: next };
    }

    return { ok: false, reason: "invalid" };
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="pchBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fff8ed" />
              <stop offset="100%" stop-color="#efe4cf" />
            </linearGradient>
          </defs>
          <rect x="12" y="8" width="136" height="78" rx="14" fill="url(#pchBg)" stroke="#d9c8af" />
          <rect x="18" y="14" width="44" height="24" rx="6" fill="#f2d2cd" stroke="#d8a8a2" />
          <rect x="98" y="14" width="44" height="24" rx="6" fill="#d8e6fb" stroke="#a9c0e6" />
          <rect x="98" y="56" width="44" height="24" rx="6" fill="#f3e8bf" stroke="#d9c88f" />
          <rect x="18" y="56" width="44" height="24" rx="6" fill="#d7efde" stroke="#9fc9ae" />

          <path d="M80 24L96 40H64L80 24Z" fill="#ffb3b8" stroke="#d9666f" />
          <path d="M96 40L80 56V24L96 40Z" fill="#cde2f9" stroke="#9ebfe7" />
          <path d="M80 56L64 40H96L80 56Z" fill="#f3e48f" stroke="#d2bc55" />
          <path d="M64 40L80 24V56L64 40Z" fill="#cfead8" stroke="#99c4aa" />

          <g>
            <circle cx="40" cy="28" r="5.5" fill="#ff1f2d" />
            <circle cx="120" cy="28" r="5.5" fill="#4aa0e6" />
            <circle cx="120" cy="66" r="5.5" fill="#ffec1f" />
            <circle cx="40" cy="66" r="5.5" fill="#7dcb3f" />
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state, players, canAct }) {
    const movableSet = new Set(state.movablePieceIds || []);
    const recentPath = new Set(state.lastPath || []);
    const phaseAction = state.phase === "await-piece" ? "select-piece" : state.phase === "await-bonus" ? "apply-bonus" : "";
    const targetMap = buildPendingTargetMap(state);
    const activePlayer = players.find((player) => player.slot === state.currentPlayerIndex) || null;
    const activeSlots = new Set(players.map((player) => player.slot));

    const trackMap = buildTrackMap(state.pieces);
    const finalMap = buildFinalMap(state.pieces);
    const homeMap = buildSlotPieceMap(state.pieces, (piece) => piece.progress < 0);
    const goalMap = buildSlotPieceMap(state.pieces, (piece) => piece.progress >= GOAL_PROGRESS);
    const bridgeCells = new Set();
    for (const [index, occupants] of trackMap.entries()) {
      if (isBlockingBridge(state, index, occupants)) {
        bridgeCells.add(index);
      }
    }

    const trackCells = TRACK_BLUEPRINT.map((cell) => {
      const index = cell.visibleCell - 1;
      const startOwner = START_INDICES.findIndex((value) => value === index);
      const isEntry = FINAL_ENTRY_INDICES.includes(index);
      const isSafe = isNormalMode(state) && SAFE_INDICES.has(index);
      const isBridgeCell = bridgeCells.has(index);
      const placement = getTrackPlacement(cell);
      const occupants = (trackMap.get(index) || []).slice().sort((a, b) => a.playerSlot - b.playerSlot || a.pieceIndex - b.pieceIndex);
      const moveTarget = targetMap.get(`track:${cell.visibleCell}`) || null;
      const classes = getTrackCellClasses({
        cell,
        startOwner,
        isEntry,
        isSafe,
        isBridgeCell,
        recentPath: recentPath.has(index),
        occupants,
        placement
      });

      return `
        <div
          class="${classes.join(" ")}"
          style="${renderGridPlacement(placement)}"
          data-track-cell="${cell.visibleCell}"
        >
          <span class="parchis-track-core" aria-hidden="true"></span>
          ${startOwner >= 0 ? '<span class="parchis-start-marker" aria-hidden="true"></span>' : ""}
          <span class="parchis-cell-contents">
            ${renderPieceStack(occupants, { state, canAct, phaseAction, movableSet, bridge: isBridgeCell })}
          </span>
          ${renderMoveTarget(state, moveTarget, `Mover a la casilla ${cell.visibleCell}`)}
        </div>
      `;
    }).join("");

    const finalCells = Array.from({ length: 4 }, (_, slot) => {
      const lane = FINAL_LANE_BLUEPRINT[slot];
      const laneLayout = FINAL_LANE_LAYOUT[slot] || FINAL_LANE_LAYOUT[0];
      return lane
        .map((cell) => {
          const finalIndex = cell.step - 1;
          const occupants = (finalMap.get(`${slot}:${finalIndex}`) || []).slice().sort((a, b) => a.pieceIndex - b.pieceIndex);
          const moveTarget = targetMap.get(`final:${slot}:${cell.step}`) || null;
          const classes = getFinalLaneCellClasses(slot, cell, laneLayout);
          return `
            <div
              class="${classes.join(" ")}"
              style="${renderGridPlacement(getFinalLanePlacement(slot, cell))}"
              data-final="${slot}:${cell.step}"
              data-final-segment="${cell.segment}"
            >
              <span class="parchis-final-core" aria-hidden="true"></span>
              <span class="parchis-cell-contents">
                ${renderPieceStack(occupants, { state, canAct, phaseAction, movableSet })}
              </span>
              ${renderMoveTarget(state, moveTarget, `Mover al pasillo final ${cell.step}`)}
            </div>
          `;
        })
        .join("");
    }).join("");

    const homeAreas = HOME_BLUEPRINT.map((home) => {
      const theme = getTheme(home.slot);
      const inactive = !activeSlots.has(home.slot);
      return `
        <div class="parchis-home slot-${home.slot} ${inactive ? "is-inactive" : ""}" style="${renderGridPlacement(home)}--home:${theme.home};--lane:${theme.laneStrong};--piece:${theme.piece};--piece-dark:${theme.pieceDark}">
          <div class="parchis-home-stage" aria-hidden="true">
            <span class="parchis-home-disc"></span>
            <span class="parchis-home-ring is-orbit"></span>
            <span class="parchis-home-rosette"></span>
          </div>
          <div class="parchis-home-piece-bay">
            ${HOME_SLOT_ORDER.map((pieceIndex) => {
              const piece = homeMap.get(`${home.slot}:${pieceIndex}`);
              return `
                <span class="parchis-home-slot pos-${pieceIndex} ${piece ? "" : "is-empty"}">
                  ${piece ? renderPieceButton(piece, { state, canAct, phaseAction, movableSet }) : ""}
                </span>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");

    const goalArea = `
      <div class="parchis-goal" style="${renderGridPlacement(GOAL_BLUEPRINT)}">
        <span class="parchis-goal-tri slot-0" aria-hidden="true"></span>
        <span class="parchis-goal-tri slot-1" aria-hidden="true"></span>
        <span class="parchis-goal-tri slot-2" aria-hidden="true"></span>
        <span class="parchis-goal-tri slot-3" aria-hidden="true"></span>
        <span class="parchis-goal-piece-bay">
          ${Array.from({ length: 4 }, (_, slot) => `
            <span class="parchis-goal-player slot-${slot}">
              ${HOME_SLOT_ORDER.map((pieceIndex) => {
                const piece = goalMap.get(`${slot}:${pieceIndex}`);
                return `
                  <span class="parchis-goal-slot">
                    ${piece ? renderPieceButton(piece, { state, canAct, phaseAction, movableSet }) : ""}
                  </span>
                `;
              }).join("")}
              ${renderMoveTarget(state, targetMap.get(`goal:${slot}`) || null, "Mover a meta")}
            </span>
          `).join("")}
        </span>
      </div>
    `;

    const canRoll = canAct && state.phase === "await-roll" && state.winnerSlot === null;
    const diceValues = Array.isArray(state.diceValues) ? state.diceValues : [null, null];
    const diceConsumed = Array.isArray(state.diceConsumed) ? state.diceConsumed : [false, false];
    const rollVariant = state.diceToken % 2 === 0 ? "a" : "b";
    const shouldAnimateDice = Boolean(state.showDiceAnimation);
    const currentOptions = buildCurrentOptions(state);
    const optionBadges = Array.from(
      new Map(
        currentOptions.map((option) => [
          `${option.kind}:${option.badge}`,
          {
            badge: option.badge,
            label: option.label
          }
        ])
      ).values()
    );
    const diceMarkup = diceValues
      .map((value, index) => {
        const hasValue = Number.isInteger(value);
        const consumed = Boolean(diceConsumed[index]);
        const dieClasses = [
          "parchis-die",
          `die-${index + 1}`,
          hasValue && shouldAnimateDice ? `is-roll-${rollVariant}` : hasValue ? "is-settled" : "is-idle",
          consumed ? "is-consumed" : "is-available"
        ];
        if (canRoll) {
          dieClasses.push("is-clickable");
        }
        const statusLabel = hasValue ? (consumed ? "Usado" : "Disponible") : "Pendiente";
        const clickableAttrs = canRoll ? 'data-action="game-action" data-game-action="roll-die"' : '';
        return `
          <div class="${dieClasses.join(" ")}" style="--die-value: ${hasValue ? value : 1}" ${clickableAttrs}>
            <span class="parchis-die-label">D${index + 1}</span>
            ${renderDie(hasValue ? value : null)}
            <span class="parchis-die-status">${statusLabel}</span>
          </div>
        `;
      })
      .join("");
    const helperChips = optionBadges.length
      ? `
        <div class="parchis-option-chip-row">
          ${optionBadges
            .map(
              (item) => `
                <span class="parchis-option-chip" title="${escapeHtml(item.label)}">${escapeHtml(item.badge || item.label)}</span>
              `
            )
            .join("")}
        </div>
      `
      : "";
    const exitAttemptsMarkup =
      allPiecesInHome(state, state.currentPlayerIndex) && state.phase === "await-roll"
        ? `<p class="parchis-side-badge">Apertura: necesitas 5</p>`
        : "";
    const modeLabel = isChaosMode(state) ? "Caos" : "Normal";
    const modeHelp = isChaosMode(state)
      ? "Sin seguros ni bonus de captura."
      : "Seguros activos y captura con bonus 21.";
    const shellClasses = [
      "parchis-shell",
      isChaosMode(state) ? "is-chaos-mode" : "is-normal-mode",
      `is-phase-${state.phase || "idle"}`,
      state.winnerSlot !== null ? "is-finished" : ""
    ].filter(Boolean);
    const activeTheme = activePlayer ? getTheme(activePlayer.slot) : getTheme(0);
    const eventTone = getEventTone(state);
    const eventLabel = eventTone === "is-capture"
      ? "Captura"
      : eventTone === "is-bonus"
        ? "Bonus"
        : eventTone === "is-goal"
          ? "Meta"
          : eventTone === "is-warning"
            ? "Aviso"
            : eventTone === "is-win"
              ? "Victoria"
              : eventTone === "is-extra"
                ? "Turno extra"
                : "Estado";
    const diceResultLabel = diceValues.every((value) => Number.isInteger(value))
      ? `D1 ${diceValues[0]} · D2 ${diceValues[1]} · suma ${diceValues[0] + diceValues[1]}`
      : "Lanza para descubrir los 2 dados.";

    return `
      <style>
      /* EVOLUCIÓN PREMIUM: PARCHÍS DE MARQUETERÍA FINA Y CUERO CREMA */

      .game-screen-parchis .topbar-actions [data-action="restart-game"] {
        display: grid !important;
      }

      .parchis-shell {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 20px;
        width: min(100%, 1120px);
        max-width: 1120px;
        margin: 0 auto;
        padding: 16px;
        background: radial-gradient(circle at 50% 50%, #fcfbf8 0%, #f3ebe0 100%);
        border-radius: 20px;
        box-shadow: 0 20px 50px rgba(74, 56, 41, 0.12);
        font-family: 'Outfit', sans-serif;
        color: #2c1e13;
        box-sizing: border-box !important;
      }
      .parchis-shell * {
        box-sizing: border-box !important;
      }
      .parchis-shell.is-chaos-mode {
        background: radial-gradient(circle at 50% 50%, #fcfbf8 0%, #f0e6dc 100%);
      }

      /* MARCO DE ARCE DORADO PREMIUM */
      .parchis-board-frame {
        flex: 0 0 auto;
        width: fit-content !important;
        max-width: 100%;
        padding: 12px;
        background:
          radial-gradient(circle at 50% 50%, #eddabf 0%, #d89f64 100%),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 4px);
        border-radius: 16px;
        box-shadow:
          inset 0 4px 10px rgba(255,255,255,0.5),
          inset 0 -4px 10px rgba(110,75,45,0.3),
          0 15px 35px rgba(74, 56, 41, 0.2);
        border: 4px solid #d4af37; /* Filete de oro pulido */
      }

      /* TABLERO DE ABEDUL PULIDO CLARO */
      .parchis-board {
        display: grid;
        grid-template-rows: repeat(15, 1fr);
        grid-template-columns: repeat(15, 1fr);
        width: min(500px, 48vw, calc(var(--app-dvh, 100dvh) - 300px));
        height: min(500px, 48vw, calc(var(--app-dvh, 100dvh) - 300px));
        min-width: 320px;
        min-height: 320px;
        aspect-ratio: 1 / 1;
        background:
          radial-gradient(circle at 50% 50%, #FAF8F5 0%, #ebdcc8 100%),
          repeating-radial-gradient(circle at 10% 10%, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 5px, rgba(0,0,0,0.02) 6px, rgba(0,0,0,0.02) 10px);
        border: 8px solid #c0946a; /* Roble claro satinado */
        border-radius: 8px;
        gap: 1.5px;
        padding: 2px;
        box-shadow: inset 0 0 30px rgba(110,75,45,0.15);
        position: relative;
      }

      /* CASAS DE CUERO PREMIUM SATINADO */
      .parchis-home {
        border-radius: 12px;
        box-shadow:
          inset 0 4px 10px rgba(0,0,0,0.15),
          inset 0 -2px 6px rgba(255,255,255,0.2),
          0 2px 4px rgba(74,56,41,0.08);
        border: 3px solid #d4af37 !important; /* Bordes dorados */
        padding: 12px;
        position: relative;
        overflow: hidden;
      }
      .parchis-home.slot-0 { background: radial-gradient(circle at 30% 30%, #ff5c60 0%, #c4181c 100%) !important; } /* Esmalte Rojo */
      .parchis-home.slot-1 { background: radial-gradient(circle at 30% 30%, #4da5ff 0%, #165ec9 100%) !important; } /* Esmalte Azul */
      .parchis-home.slot-2 { background: radial-gradient(circle at 30% 30%, #ffe960 0%, #cca000 100%) !important; } /* Esmalte Amarillo */
      .parchis-home.slot-3 { background: radial-gradient(circle at 30% 30%, #76e33c 0%, #35940e 100%) !important; } /* Esmalte Verde */

      /* HOB ORBITS EN CASAS */
      .parchis-home-disc {
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
        border: 1px dashed rgba(212, 175, 55, 0.4);
      }
      .parchis-home-slot {
        background: rgba(255,255,255,0.25) !important;
        border: 2px solid rgba(212, 175, 55, 0.4) !important;
        box-shadow: inset 0 3px 6px rgba(0,0,0,0.1) !important;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .parchis-home.is-inactive {
        filter: grayscale(0.35);
        opacity: 0.5;
      }
      .parchis-home-slot.is-empty {
        background: rgba(255,255,255,0.12) !important;
        border-style: dashed !important;
      }

      /* CASILLAS DEL PASILLO (Hueso pulido claro) */
      .parchis-track-cell, .parchis-final-cell {
        background: #fdfcf9;
        border: 1px solid #ebdccb;
        box-shadow:
          inset 0 1px 2px rgba(255,255,255,0.8),
          inset 0 -1px 2px rgba(110,75,45,0.03);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .parchis-track-core,
      .parchis-final-core {
        position: absolute;
        inset: 10%;
        border-radius: 5px;
        border: 1px solid rgba(110, 75, 45, 0.1);
        pointer-events: none;
      }
      .parchis-cell-contents {
        position: absolute;
        inset: 0;
        z-index: 4;
        display: grid;
        place-items: center;
        pointer-events: none;
      }
      .parchis-cell-contents .parchis-piece,
      .parchis-cell-contents .parchis-move-target {
        pointer-events: auto;
      }

      .parchis-track-cell.is-safe {
        background: radial-gradient(circle at 50% 50%, #fffbe3 0%, #ead3a4 100%) !important;
        box-shadow:
          inset 0 0 6px rgba(212, 175, 55, 0.25),
          0 0 8px rgba(212, 175, 55, 0.1) !important;
        border: 1.5px solid #d4af37 !important;
      }
      .parchis-track-cell.is-safe::before {
        content: '';
        position: absolute;
        top: 2px; left: 2px; right: 2px; bottom: 2px;
        border: 1px solid rgba(212, 175, 55, 0.15);
        border-radius: 3px;
        pointer-events: none;
      }
      .parchis-track-cell.is-safe .parchis-track-core::after {
        content: '';
        position: absolute;
        inset: 30%;
        border-radius: 50%;
        background: rgba(212, 175, 55, 0.55);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.55);
      }
      .parchis-track-cell.is-start .parchis-track-core {
        border-color: rgba(44, 30, 19, 0.22);
        box-shadow: inset 0 0 0 2px rgba(255,255,255,0.42);
      }
      .parchis-start-marker {
        position: absolute;
        inset: 22%;
        border-radius: 999px;
        border: 2px solid rgba(44, 30, 19, 0.25);
        z-index: 2;
        pointer-events: none;
      }
      .parchis-track-cell.is-bridge {
        box-shadow:
          inset 0 0 0 2px rgba(101, 65, 35, 0.45),
          0 0 0 2px rgba(101, 65, 35, 0.12) !important;
      }

      /* PINTADO DE PASILLOS POR JUGADOR (Esmaltados luminosos claros) */
      .parchis-final-cell.slot-0, .parchis-track-cell.slot-0 { background: radial-gradient(circle, #ffcbd0 0%, #ff8c91 100%) !important; border-color: #ffccd0; }
      .parchis-final-cell.slot-1, .parchis-track-cell.slot-1 { background: radial-gradient(circle, #cde3ff 0%, #8ebdff 100%) !important; border-color: #cce3ff; }
      .parchis-final-cell.slot-2, .parchis-track-cell.slot-2 { background: radial-gradient(circle, #fff7cd 0%, #ffe38e 100%) !important; border-color: #fff6cd; }
      .parchis-final-cell.slot-3, .parchis-track-cell.slot-3 { background: radial-gradient(circle, #dbffcd 0%, #a4ff8e 100%) !important; border-color: #daffcc; }

      /* AROS DE RECORRIDO RECIENTE */
      .parchis-track-cell.is-recent-path {
        box-shadow: inset 0 0 8px #d4af37, 0 0 10px rgba(212, 175, 55, 0.3) !important;
      }

      /* META: DIANA TRINAGULAR RELIEVE CLARA */
      .parchis-goal {
        background: #fdfcf9 !important;
        border: 4px solid #d4af37 !important;
        box-shadow:
          inset 0 0 20px rgba(110,75,45,0.1),
          0 4px 15px rgba(74,56,41,0.1) !important;
        border-radius: 6px !important;
        overflow: hidden;
        position: relative;
      }
      .parchis-goal-tri.slot-0 { border-bottom-color: #ff5c60 !important; }
      .parchis-goal-tri.slot-1 { border-left-color: #4da5ff !important; }
      .parchis-goal-tri.slot-2 { border-top-color: #ffe960 !important; }
      .parchis-goal-tri.slot-3 { border-right-color: #76e33c !important; }

      /* FICHAS: CUENTAS DE VIDRIO / GEMAS PRECIOSAS */
      .parchis-piece {
        width: min(30px, 82%);
        height: min(30px, 82%);
        border-radius: 50% !important;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        border: 1px solid rgba(255,255,255,0.4) !important;
        color: #fff !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        box-shadow:
          inset 0 3px 6px rgba(255,255,255,0.7),
          inset 0 -3px 6px rgba(0,0,0,0.4),
          0 4px 8px rgba(74,56,41,0.3);
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        min-width: 20px;
        min-height: 20px;
        touch-action: manipulation;
      }
      .parchis-piece.slot-0 { background: radial-gradient(circle at 35% 35%, #ff5256 0%, #b31418 80%, #6e0004 100%) !important; }
      .parchis-piece.slot-1 { background: radial-gradient(circle at 35% 35%, #52abff 0%, #1462b3 80%, #00366e 100%) !important; }
      .parchis-piece.slot-2 { background: radial-gradient(circle at 35% 35%, #fff152 0%, #b38b14 80%, #6e5200 100%) !important; }
      .parchis-piece.slot-3 { background: radial-gradient(circle at 35% 35%, #6bff52 0%, #20b314 80%, #006e07 100%) !important; }

      /* ESTADOS DE JUGABILIDAD */
      .parchis-piece.is-movable {
        animation: parchisPieceReady 1.5s infinite ease-in-out !important;
        cursor: pointer;
        z-index: 10;
        outline: 3px solid rgba(255,255,255,0.92);
        outline-offset: 2px;
      }
      @keyframes parchisPieceReady {
        0%, 100% {
          transform: translateY(0) scale(1);
          box-shadow:
            0 0 0 3px rgba(212, 175, 55, 0.18),
            inset 0 3px 6px rgba(255,255,255,0.7),
            inset 0 -3px 6px rgba(0,0,0,0.3),
            0 4px 8px rgba(74,56,41,0.3);
        }
        50% {
          transform: translateY(-4px) scale(1.06);
          box-shadow:
            0 0 0 5px rgba(212, 175, 55, 0.28),
            inset 0 3px 6px rgba(255,255,255,0.8),
            inset 0 -3px 6px rgba(0,0,0,0.2),
            0 8px 14px rgba(74,56,41,0.34);
        }
      }

      .parchis-piece.is-selected {
        transform: translateY(-7px) scale(1.12) !important;
        outline: 3px solid #ffffff;
        outline-offset: 3px;
        box-shadow: 0 0 0 5px var(--piece), 0 10px 18px rgba(74,56,41,0.42) !important;
        z-index: 12;
      }

      .parchis-piece.is-goal {
        box-shadow:
          inset 0 3px 6px rgba(255,255,255,0.7),
          inset 0 -3px 6px rgba(0,0,0,0.3),
          0 0 0 3px rgba(212, 175, 55, 0.35),
          0 4px 8px rgba(74,56,41,0.22);
      }
      .parchis-piece.is-bridge {
        box-shadow:
          inset 0 3px 6px rgba(255,255,255,0.7),
          inset 0 -3px 6px rgba(0,0,0,0.35),
          0 0 0 3px rgba(101, 65, 35, 0.38),
          0 4px 8px rgba(74,56,41,0.3);
      }

      /* FEEDBACK BREVE DE LLEGADA */
      .parchis-piece.is-last {
        animation: parchisPieceSettle 0.34s ease-out forwards !important;
      }
      @keyframes parchisPieceSettle {
        0% { transform: translateY(-10px) scale(1.12); opacity: 0.75; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }

      .parchis-piece-stack {
        position: relative;
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
      }
      .parchis-piece-dock {
        grid-area: 1 / 1;
        display: grid;
        place-items: center;
      }
      .parchis-piece-stack.count-2 .parchis-piece-dock:nth-child(1) { transform: translate(-5px, -4px); }
      .parchis-piece-stack.count-2 .parchis-piece-dock:nth-child(2) { transform: translate(5px, 4px); }
      .parchis-piece-stack.count-3 .parchis-piece-dock:nth-child(1) { transform: translate(-6px, -5px); }
      .parchis-piece-stack.count-3 .parchis-piece-dock:nth-child(2) { transform: translate(6px, -4px); }
      .parchis-piece-stack.count-3 .parchis-piece-dock:nth-child(3) { transform: translate(0, 6px); }
      .parchis-piece-stack.count-4 .parchis-piece-dock:nth-child(1) { transform: translate(-6px, -6px); }
      .parchis-piece-stack.count-4 .parchis-piece-dock:nth-child(2) { transform: translate(6px, -6px); }
      .parchis-piece-stack.count-4 .parchis-piece-dock:nth-child(3) { transform: translate(-6px, 6px); }
      .parchis-piece-stack.count-4 .parchis-piece-dock:nth-child(4) { transform: translate(6px, 6px); }

      /* CUBILETE LANDING PAD DE CUERO ARENA PULIDO Y DORADOS */
      .parchis-die-card {
        background:
          radial-gradient(circle at 50% 50%, #fdfcf9 0%, #f6eee2 100%),
          repeating-linear-gradient(45deg, rgba(142, 105, 69, 0.03) 0px, rgba(142, 105, 69, 0.03) 2px, transparent 2px, transparent 4px) !important;
        border: 2px solid #e1d2be !important;
        border-radius: 16px !important;
        padding: 16px !important;
        box-shadow:
          inset 0 0 15px rgba(110,75,45,0.1),
          0 10px 25px rgba(74,56,41,0.08) !important;
        position: relative;
        overflow: hidden;
      }

      /* ARO DE CUERO MARFIL SEGÚN JUGADOR */
      .parchis-die-card::after {
        content: '';
        position: absolute;
        top: 6px; left: 6px; right: 6px; bottom: 6px;
        border-radius: 12px;
        border: 1px solid rgba(142, 105, 69, 0.15);
        box-shadow: inset 0 0 15px rgba(142, 105, 69, 0.05);
        pointer-events: none;
      }
      .parchis-die-card.is-ready {
        border-color: rgba(212, 175, 55, 0.48) !important;
        box-shadow:
          inset 0 0 15px rgba(110,75,45,0.1),
          0 0 0 3px rgba(212, 175, 55, 0.1),
          0 10px 25px rgba(74,56,41,0.08) !important;
      }

      /* DADOS 3D HOLOGRÁFICOS TRANSLÚCIDOS SATINADOS CLAROS */
      .parchis-dice-grid {
        display: flex;
        gap: 20px;
        justify-content: center;
        perspective: 800px;
        padding: 8px 0 12px;
      }
       .parchis-die {
        width: 60px;
        height: 60px;
        position: relative;
        perspective: 800px;
        transform-style: preserve-3d;
        z-index: 5;
      }
      .parchis-die.is-clickable {
        cursor: pointer;
        pointer-events: auto;
      }
      .parchis-die-label,
      .parchis-die-status {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        z-index: 8;
        white-space: nowrap;
        font-weight: 800;
        line-height: 1;
        pointer-events: none;
      }
      .parchis-die-label {
        top: -8px;
        color: #8e623a;
        font-size: 10px;
        letter-spacing: 0;
      }
      .parchis-die-status {
        bottom: -12px;
        font-size: 9px;
        color: #6a5747;
      }
      .parchis-die.is-available.is-settled .parchis-die-status {
        color: #126b49;
      }
      .parchis-die.is-consumed {
        opacity: 0.52;
        filter: grayscale(0.35);
      }
      .parchis-die.is-clickable::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 16px;
        border: 2px solid rgba(212, 175, 55, 0.28);
        animation: parchisDieReady 1.3s infinite ease-in-out;
        pointer-events: none;
      }
      @keyframes parchisDieReady {
        0%, 100% { opacity: 0.45; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.04); }
      }

      /* CARAS DEL CUBO 3D */
      .parchis-die-cube-3d {
        width: 50px;
        height: 50px;
        position: absolute;
        top: 5px;
        left: 5px;
        transform-style: preserve-3d;
        transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.2);
        pointer-events: none; /* Evita interferencias 3D al hacer click */
      }

      .parchis-die.die-1 {
        --die-neon: #008fa0;
        --die-neon-rgb: 0, 143, 160;
      }
      .parchis-die.die-2 {
        --die-neon: #d90062;
        --die-neon-rgb: 217, 0, 98;
      }

      .parchis-die-face-3d {
        position: absolute;
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.85); /* Cristal claro translúcido */
        backdrop-filter: blur(2px);
        border: 2px solid var(--die-neon);
        box-shadow:
          inset 0 0 12px rgba(var(--die-neon-rgb), 0.12),
          0 0 8px rgba(var(--die-neon-rgb), 0.15);
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        backface-visibility: visible; /* Deja ver las caras traseras */
      }

      /* COORDENADAS 3D REALES DE CARAS */
      .parchis-die-face-3d.face-1 { transform: rotateY(0deg) translateZ(25px); }
      .parchis-die-face-3d.face-6 { transform: rotateY(180deg) translateZ(25px); }
      .parchis-die-face-3d.face-3 { transform: rotateY(-90deg) translateZ(25px); }
      .parchis-die-face-3d.face-4 { transform: rotateY(90deg) translateZ(25px); }
      .parchis-die-face-3d.face-5 { transform: rotateX(90deg) translateZ(25px); }
      .parchis-die-face-3d.face-2 { transform: rotateX(-90deg) translateZ(25px); }

      /* PIPS GLOWING NEÓN */
      .parchis-die-pip {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: transparent;
      }
      .parchis-die-pip.is-on {
        background: var(--die-neon);
        box-shadow: 0 0 8px var(--die-neon), 0 0 3px #ffffff;
      }

      /* ROTACIÓN FINAL SEGÚN VALOR OBTENIDO */
      .parchis-die[style*="--die-value: 1"] .parchis-die-cube-3d { transform: rotateX(720deg) rotateY(720deg); }
      .parchis-die[style*="--die-value: 2"] .parchis-die-cube-3d { transform: rotateX(810deg) rotateY(720deg); }
      .parchis-die[style*="--die-value: 3"] .parchis-die-cube-3d { transform: rotateX(720deg) rotateY(810deg); }
      .parchis-die[style*="--die-value: 4"] .parchis-die-cube-3d { transform: rotateX(720deg) rotateY(630deg); }
      .parchis-die[style*="--die-value: 5"] .parchis-die-cube-3d { transform: rotateX(630deg) rotateY(720deg); }
      .parchis-die[style*="--die-value: 6"] .parchis-die-cube-3d { transform: rotateX(900deg) rotateY(720deg); }

      /* ANIMACIONES GIMNÁSTICAS DE GIRO AL LANZAR */
      .parchis-die.is-roll-a .parchis-die-cube-3d {
        animation: parchisRollDiceA 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      }
      .parchis-die.is-roll-b .parchis-die-cube-3d {
        animation: parchisRollDiceB 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      }

      @keyframes parchisRollDiceA {
        0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-30px); }
        40% { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg) translateY(-40px); }
        70% { transform: rotateX(720deg) rotateY(540deg) rotateZ(270deg) translateY(-10px); }
        100% { transform: rotateX(1080deg) rotateY(1080deg) rotateZ(360deg) translateY(0); }
      }
      @keyframes parchisRollDiceB {
        0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-30px); }
        40% { transform: rotateX(180deg) rotateY(360deg) rotateZ(-90deg) translateY(-50px); }
        70% { transform: rotateX(540deg) rotateY(720deg) rotateZ(-270deg) translateY(-15px); }
        100% { transform: rotateX(1080deg) rotateY(1080deg) rotateZ(-360deg) translateY(0); }
      }

      /* SIDEBAR Y TARJETAS */
      .parchis-side {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1 1 300px;
        min-width: 260px;
      }
      .parchis-side-card {
        background: rgba(254, 252, 249, 0.75) !important;
        backdrop-filter: blur(12px);
        border: 1px solid rgba(142, 105, 69, 0.15) !important;
        border-radius: 12px !important;
        padding: 12px !important;
        box-shadow: 0 8px 32px rgba(74, 56, 41, 0.05) !important;
      }
      .parchis-turn-card {
        border-left: 4px solid var(--active-player) !important;
      }
      .parchis-side-card h4 {
        color: #8e623a !important;
        margin-bottom: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .parchis-roll-btn {
        background: linear-gradient(135deg, #d4af37 0%, #b89320 100%) !important;
        border: 1px solid #ffe89e !important;
        color: #fff !important;
        font-weight: 800 !important;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25) !important;
        transition: all 0.2s !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        width: 100%;
        cursor: pointer;
      }
      .parchis-roll-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4) !important;
      }
      .parchis-roll-btn:disabled {
        background: #e2dacf !important;
        border-color: #d1c7b8 !important;
        color: #a4998b !important;
        box-shadow: none !important;
        cursor: not-allowed;
      }

      .parchis-move-target {
        position: absolute;
        inset: 2px;
        z-index: 14;
        display: grid;
        place-items: center;
        border: 2px solid rgba(212, 175, 55, 0.9);
        border-radius: 7px;
        background: rgba(255, 248, 227, 0.64);
        box-shadow: 0 0 0 2px rgba(255,255,255,0.72), 0 6px 12px rgba(74,56,41,0.16);
        color: #6c470e;
        cursor: pointer;
        text-decoration: none;
      }
      .parchis-move-target.is-delayed {
        opacity: 0.5;
        pointer-events: none;
      }
      .parchis-move-target-badge {
        min-width: 28px;
        min-height: 22px;
        display: inline-grid;
        place-items: center;
        padding: 2px 6px;
        border-radius: 999px;
        background: #fff8e3;
        border: 1px solid rgba(176, 129, 26, 0.32);
        font-size: 10px;
        font-weight: 900;
        line-height: 1;
      }
      .parchis-move-target-choice-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 3px;
      }
      .parchis-move-target-choice {
        min-width: 24px;
        min-height: 24px;
        border-radius: 999px;
        border: 1px solid rgba(176, 129, 26, 0.45);
        background: #ffffff;
        color: #6c470e;
        font-weight: 900;
        cursor: pointer;
      }

      .parchis-option-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .parchis-option-chip {
        background: #fbf9f5;
        border: 1px solid #ebdccb;
        color: #8e623a;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      .parchis-turn-player {
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 6px 0;
        color: #2c1e13;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .parchis-turn-player::before {
        content: '';
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: var(--active-player);
        box-shadow: 0 0 0 3px rgba(255,255,255,0.75), 0 0 0 4px var(--active-player-dark);
      }
      .parchis-side-badge {
        display: inline-block;
        background: #fff8e3;
        border: 1px solid #ead3a4;
        color: #b0811a;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        margin: 6px 0 0 0;
      }
      .parchis-side-note {
        font-size: 12px;
        color: #6a5747;
        margin: 6px 0 0 0;
      }
      .parchis-mode-badge.is-chaos {
        background: #f8ece5;
        border-color: #e8c3ae;
        color: #974d28;
      }
      .parchis-event-card {
        border-left: 4px solid #d1c2ad !important;
      }
      .parchis-event-card p {
        margin: 6px 0 0 0;
        color: #3b2a1b;
        font-size: 13px;
        line-height: 1.3;
      }
      .parchis-event-label {
        display: inline-block;
        padding: 3px 7px;
        border-radius: 999px;
        background: #f5efe6;
        color: #73543a;
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0;
      }
      .parchis-event-card.is-capture { border-left-color: #b83131 !important; }
      .parchis-event-card.is-capture .parchis-event-label { background: #ffe7e7; color: #9e2424; }
      .parchis-event-card.is-bonus,
      .parchis-event-card.is-extra { border-left-color: #b0811a !important; }
      .parchis-event-card.is-bonus .parchis-event-label,
      .parchis-event-card.is-extra .parchis-event-label { background: #fff8e3; color: #946a0f; }
      .parchis-event-card.is-goal,
      .parchis-event-card.is-win { border-left-color: #24885f !important; }
      .parchis-event-card.is-goal .parchis-event-label,
      .parchis-event-card.is-win .parchis-event-label { background: #e6f7ef; color: #176945; }
      .parchis-event-card.is-warning { border-left-color: #a94725 !important; }
      .parchis-event-card.is-warning .parchis-event-label { background: #faece5; color: #973b1a; }

      /* RESPONSIVE FLUIDO APANIZADO */
      @media (max-width: 900px) {
        .parchis-shell {
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 12px;
        }
        .parchis-board-frame {
          margin: 0 auto;
          width: min(100%, 456px, calc(100vw - 48px)) !important;
          padding: 8px;
          box-sizing: border-box !important;
        }
        .parchis-board {
          width: 100% !important;
          height: auto;
          min-width: 0;
          min-height: 0;
          max-width: 432px;
          max-height: none;
        }
        .parchis-side {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .parchis-side-card {
          margin: 0 !important;
        }
        .parchis-side-card:nth-child(3) {
          grid-column: span 2;
        }
        .parchis-side-card:nth-child(4) {
          grid-column: span 2;
        }
      }

      @media (max-width: 600px) {
        .parchis-side {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 10px;
        }
        .parchis-side-card {
          padding: 10px !important;
        }
        .parchis-home {
          padding: 8px;
        }
        .parchis-home-slot {
          width: 32px;
          height: 32px;
        }
        .parchis-piece {
          font-size: 12px;
        }
        .parchis-players-card {
          display: none;
        }
        .parchis-event-card {
          display: block;
        }
        .parchis-event-card p,
        .parchis-side-note {
          font-size: 11px;
        }
        .parchis-dice-grid {
          padding-bottom: 16px;
        }
      }

      /* OPTIMIZACIÓN LANDSCAPE EN MÓVILES (ALTURA LIMITADA) */
      @media (max-height: 520px) and (orientation: landscape) {
        .parchis-shell {
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
        .parchis-board-frame {
          padding: 6px !important;
          border-radius: 10px !important;
          margin: 0 !important;
        }
        .parchis-board {
          width: 76vh !important;
          height: 76vh !important;
          border-width: 4px !important;
        }
        .parchis-side {
          flex-direction: row !important;
          flex-wrap: wrap !important;
          gap: 6px !important;
          height: 76vh !important;
          overflow-y: auto !important;
          align-content: start !important;
          padding-right: 4px !important;
        }
        .parchis-side-card {
          padding: 8px !important;
          border-radius: 8px !important;
          width: 100% !important;
          min-width: 160px !important;
          margin: 0 !important;
        }
        .parchis-dice-grid {
          padding: 4px 0 !important;
          gap: 12px !important;
        }
        .parchis-die {
          width: 42px !important;
          height: 42px !important;
        }
        .parchis-die-cube-3d {
          width: 34px !important;
          height: 34px !important;
          top: 4px !important;
          left: 4px !important;
        }
        .parchis-die-face-3d {
          width: 34px !important;
          height: 34px !important;
          border-radius: 6px !important;
          border-width: 1.5px !important;
        }
        .parchis-die-face-3d.face-1 { transform: rotateY(0deg) translateZ(17px) !important; }
        .parchis-die-face-3d.face-6 { transform: rotateY(180deg) translateZ(17px) !important; }
        .parchis-die-face-3d.face-3 { transform: rotateY(-90deg) translateZ(17px) !important; }
        .parchis-die-face-3d.face-4 { transform: rotateY(90deg) translateZ(17px) !important; }
        .parchis-die-face-3d.face-5 { transform: rotateX(90deg) translateZ(17px) !important; }
        .parchis-die-face-3d.face-2 { transform: rotateX(-90deg) translateZ(17px) !important; }
        
        .parchis-die-pip {
          width: 5px !important;
          height: 5px !important;
        }
        .parchis-roll-btn {
          padding: 8px 12px !important;
          font-size: 12px !important;
        }
        .parchis-piece {
          width: 20px !important;
          height: 20px !important;
          font-size: 10px !important;
          border-width: 0.5px !important;
        }
        .parchis-home-slot {
          width: 30px !important;
          height: 30px !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .parchis-piece,
        .parchis-piece.is-movable,
        .parchis-piece.is-last,
        .parchis-die.is-clickable::after,
        .parchis-die-cube-3d {
          animation: none !important;
          transition: none !important;
        }
      }
      </style>

      <section class="${shellClasses.join(" ")}" style="--active-player:${activeTheme.piece};--active-player-dark:${activeTheme.pieceDark}">
        <div class="parchis-board-frame">
          <div class="parchis-board">
            ${homeAreas}
            ${goalArea}
            ${trackCells}
            ${finalCells}
          </div>
        </div>

        <aside class="parchis-side">
          <article class="parchis-side-card parchis-die-card ${canRoll ? "is-ready" : "is-locked"}">
            <div class="parchis-dice-grid">
              ${diceMarkup}
            </div>
            <button
              class="btn btn-primary parchis-roll-btn"
              data-action="game-action"
              data-game-action="roll-die"
              ${canRoll ? "" : "disabled"}
            >
              Tirar dados
            </button>
            <p class="parchis-side-note">
              ${escapeHtml(diceResultLabel)}
            </p>
          </article>

          <article class="parchis-side-card parchis-turn-card">
            <h4>Turno</h4>
            <p class="parchis-turn-player">
              ${escapeHtml(activePlayer ? activePlayer.name : "Jugador")}
            </p>
            <p class="parchis-side-badge parchis-mode-badge ${isChaosMode(state) ? "is-chaos" : "is-normal"}">${escapeHtml(`Modo ${modeLabel}`)}</p>
            <p class="parchis-side-note">${escapeHtml(buildPhaseHelp(state))}</p>
            <p class="parchis-side-note">${escapeHtml(modeHelp)}</p>
            ${
              state.bonusPending
                ? `<p class="parchis-side-badge">Bonus activo: ${state.bonusPending.type}</p>`
                : ""
            }
            ${exitAttemptsMarkup}
            ${helperChips}
          </article>

          <article class="parchis-side-card parchis-players-card">
            <h4>Jugadores</h4>
            <div class="parchis-player-list">${renderPlayerStatus(state, players)}</div>
          </article>

          <article class="parchis-side-card parchis-event-card ${eventTone}" aria-live="polite">
            <h4>Ultimo evento</h4>
            <span class="parchis-event-label">${escapeHtml(eventLabel)}</span>
            <p>${escapeHtml(state.lastEvent || "")}</p>
          </article>
        </aside>
      </section>
    `;
  },
  formatResult({ state, players }) {
    if (state.winnerSlot === null || state.winnerSlot === undefined) {
      return null;
    }

    const winner = players.find((player) => player.slot === state.winnerSlot);
    const name = winner ? winner.name : "Jugador";

    return {
      title: `Ha ganado ${name}`,
      subtitle: "Victoria en Parchis de 2 dados.",
      iconText: winner ? winner.identity.icon : "*",
      iconClass: "win"
    };
  }
};
