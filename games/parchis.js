const TRACK_LENGTH = 68;
const FINAL_LENGTH = 8;
const GOAL_PROGRESS = TRACK_LENGTH + FINAL_LENGTH;
const PIECES_PER_PLAYER = 4;

// Visible board cells follow the classic parchis numbering from the reference board.
// Internal track operations remain zero-based 0..67 to keep the existing engine stable.
const START_CELLS = Object.freeze([39, 22, 5, 56]);
const FINAL_ENTRY_CELLS = Object.freeze([38, 21, 4, 55]);
const SAFE_CELLS = new Set([5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68]);

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
  Object.freeze({ slot: 1, row: 1, col: 13, rowSpan: 6, colSpan: 6 }),
  Object.freeze({ slot: 2, row: 13, col: 13, rowSpan: 6, colSpan: 6 }),
  Object.freeze({ slot: 3, row: 13, col: 1, rowSpan: 6, colSpan: 6 })
]);

const GOAL_BLUEPRINT = Object.freeze({
  row: 8,
  col: 8,
  rowSpan: 4,
  colSpan: 4
});

const CENTER_CROSS_BLUEPRINT = Object.freeze({
  row: 7,
  col: 7,
  rowSpan: 6,
  colSpan: 6
});

const CENTER_RING_BLUEPRINT = Object.freeze({
  row: 6,
  col: 6,
  rowSpan: 8,
  colSpan: 8
});

const CENTER_RING_TRACK_BLUEPRINT = Object.freeze([
  Object.freeze({ visibleCell: 41, row: 1, col: 3, axis: "horizontal" }),
  Object.freeze({ visibleCell: 42, row: 2, col: 3, axis: "horizontal" }),
  Object.freeze({ visibleCell: 43, row: 3, col: 2, axis: "vertical" }),
  Object.freeze({ visibleCell: 44, row: 3, col: 1, axis: "vertical" }),
  Object.freeze({ visibleCell: 27, row: 1, col: 6, axis: "horizontal" }),
  Object.freeze({ visibleCell: 26, row: 2, col: 6, axis: "horizontal" }),
  Object.freeze({ visibleCell: 25, row: 3, col: 7, axis: "vertical" }),
  Object.freeze({ visibleCell: 24, row: 3, col: 8, axis: "vertical" }),
  Object.freeze({ visibleCell: 58, row: 6, col: 1, axis: "vertical" }),
  Object.freeze({ visibleCell: 59, row: 6, col: 2, axis: "vertical" }),
  Object.freeze({ visibleCell: 60, row: 7, col: 3, axis: "horizontal" }),
  Object.freeze({ visibleCell: 61, row: 8, col: 3, axis: "horizontal" }),
  Object.freeze({ visibleCell: 9, row: 6, col: 7, axis: "vertical" }),
  Object.freeze({ visibleCell: 10, row: 6, col: 8, axis: "vertical" }),
  Object.freeze({ visibleCell: 8, row: 7, col: 6, axis: "horizontal" }),
  Object.freeze({ visibleCell: 7, row: 8, col: 6, axis: "horizontal" })
]);

const CENTER_RING_TRACK_CELLS = new Set(CENTER_RING_TRACK_BLUEPRINT.map((cell) => cell.visibleCell));

const CENTER_TRANSITION_BLUEPRINT = Object.freeze([
  Object.freeze({ key: "tl", row: 2, col: 2, diagonal: "down" }),
  Object.freeze({ key: "tr", row: 2, col: 7, diagonal: "up" }),
  Object.freeze({ key: "bl", row: 7, col: 2, diagonal: "up" }),
  Object.freeze({ key: "br", row: 7, col: 7, diagonal: "down" })
]);

const RAW_TRACK_BLUEPRINT = Object.freeze([
  Object.freeze({ visibleCell: 1, row: 1, col: 7, axis: "h" }),
  Object.freeze({ visibleCell: 2, row: 1, col: 8, axis: "h" }),
  Object.freeze({ visibleCell: 3, row: 1, col: 9, axis: "h" }),
  Object.freeze({ visibleCell: 4, row: 1, col: 10, axis: "h" }),
  Object.freeze({ visibleCell: 5, row: 1, col: 11, axis: "h" }),
  Object.freeze({ visibleCell: 6, row: 1, col: 12, axis: "h" }),
  Object.freeze({ visibleCell: 7, row: 2, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 8, row: 3, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 9, row: 4, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 10, row: 5, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 11, row: 6, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 12, row: 7, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 13, row: 8, col: 12, axis: "h" }),
  Object.freeze({ visibleCell: 14, row: 8, col: 13, axis: "h" }),
  Object.freeze({ visibleCell: 15, row: 8, col: 14, axis: "h" }),
  Object.freeze({ visibleCell: 16, row: 8, col: 15, axis: "h" }),
  Object.freeze({ visibleCell: 17, row: 8, col: 16, axis: "h" }),
  Object.freeze({ visibleCell: 18, row: 8, col: 17, axis: "h" }),
  Object.freeze({ visibleCell: 19, row: 8, col: 18, axis: "v" }),
  Object.freeze({ visibleCell: 20, row: 9, col: 18, axis: "v" }),
  Object.freeze({ visibleCell: 21, row: 10, col: 18, axis: "v" }),
  Object.freeze({ visibleCell: 22, row: 11, col: 18, axis: "v" }),
  Object.freeze({ visibleCell: 23, row: 12, col: 18, axis: "v" }),
  Object.freeze({ visibleCell: 24, row: 11, col: 17, axis: "h" }),
  Object.freeze({ visibleCell: 25, row: 11, col: 16, axis: "h" }),
  Object.freeze({ visibleCell: 26, row: 11, col: 15, axis: "h" }),
  Object.freeze({ visibleCell: 27, row: 11, col: 14, axis: "h" }),
  Object.freeze({ visibleCell: 28, row: 11, col: 13, axis: "h" }),
  Object.freeze({ visibleCell: 29, row: 11, col: 12, axis: "h" }),
  Object.freeze({ visibleCell: 30, row: 12, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 31, row: 13, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 32, row: 14, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 33, row: 15, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 34, row: 16, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 35, row: 17, col: 11, axis: "v" }),
  Object.freeze({ visibleCell: 36, row: 18, col: 11, axis: "h" }),
  Object.freeze({ visibleCell: 37, row: 18, col: 10, axis: "h" }),
  Object.freeze({ visibleCell: 38, row: 18, col: 9, axis: "h" }),
  Object.freeze({ visibleCell: 39, row: 18, col: 8, axis: "h" }),
  Object.freeze({ visibleCell: 40, row: 18, col: 7, axis: "h" }),
  Object.freeze({ visibleCell: 41, row: 17, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 42, row: 16, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 43, row: 15, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 44, row: 14, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 45, row: 13, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 46, row: 12, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 47, row: 11, col: 7, axis: "h" }),
  Object.freeze({ visibleCell: 48, row: 11, col: 6, axis: "h" }),
  Object.freeze({ visibleCell: 49, row: 11, col: 5, axis: "h" }),
  Object.freeze({ visibleCell: 50, row: 11, col: 4, axis: "h" }),
  Object.freeze({ visibleCell: 51, row: 11, col: 3, axis: "h" }),
  Object.freeze({ visibleCell: 52, row: 11, col: 2, axis: "h" }),
  Object.freeze({ visibleCell: 53, row: 11, col: 1, axis: "v" }),
  Object.freeze({ visibleCell: 54, row: 10, col: 1, axis: "v" }),
  Object.freeze({ visibleCell: 55, row: 9, col: 1, axis: "v" }),
  Object.freeze({ visibleCell: 56, row: 8, col: 1, axis: "v" }),
  Object.freeze({ visibleCell: 57, row: 7, col: 1, axis: "v" }),
  Object.freeze({ visibleCell: 58, row: 8, col: 2, axis: "h" }),
  Object.freeze({ visibleCell: 59, row: 8, col: 3, axis: "h" }),
  Object.freeze({ visibleCell: 60, row: 8, col: 4, axis: "h" }),
  Object.freeze({ visibleCell: 61, row: 8, col: 5, axis: "h" }),
  Object.freeze({ visibleCell: 62, row: 8, col: 6, axis: "h" }),
  Object.freeze({ visibleCell: 63, row: 8, col: 7, axis: "h" }),
  Object.freeze({ visibleCell: 64, row: 7, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 65, row: 6, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 66, row: 5, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 67, row: 4, col: 8, axis: "v" }),
  Object.freeze({ visibleCell: 68, row: 3, col: 8, axis: "v" })
]);

function buildTrackBlueprint(rawBlueprint) {
  // The reference board runs the circuit in the opposite direction and starts from
  // the lower-right shoulder of the yellow arm. Reorder the same row/col cells to
  // preserve engine coordinates while aligning visible numbering, starts and safes.
  const reversed = rawBlueprint.slice().reverse();
  const firstCellIndex = reversed.findIndex((cell) => cell.visibleCell === 36);
  const ordered = firstCellIndex >= 0
    ? [...reversed.slice(firstCellIndex), ...reversed.slice(0, firstCellIndex)]
    : reversed;

  return Object.freeze(
    ordered.map((cell, index) => {
      const visibleCell = index + 1;
      return Object.freeze({
        row: cell.row,
        col: cell.col,
        axis: cell.axis,
        visibleCell,
        isFinalEntry: FINAL_ENTRY_CELLS.includes(visibleCell),
        isStart: START_CELLS.includes(visibleCell),
        isSafe: SAFE_CELLS.has(visibleCell)
      });
    })
  );
}

const TRACK_BLUEPRINT = buildTrackBlueprint(RAW_TRACK_BLUEPRINT);

const FINAL_LANE_BLUEPRINT = Object.freeze([
  Object.freeze([
    Object.freeze({ step: 1, row: 2, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "entry" }),
    Object.freeze({ step: 2, row: 3, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "mid" }),
    Object.freeze({ step: 3, row: 4, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "mid" }),
    Object.freeze({ step: 4, row: 5, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "mid" }),
    Object.freeze({ step: 5, row: 6, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "mid" }),
    Object.freeze({ step: 6, row: 7, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "goal" }),
    Object.freeze({ step: 7, row: 8, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "goal" }),
    Object.freeze({ step: 8, row: 9, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "goal" })
  ]),
  Object.freeze([
    Object.freeze({ step: 1, row: 9, col: 17, rowSpan: 2, colSpan: 1, axis: "h", segment: "entry" }),
    Object.freeze({ step: 2, row: 9, col: 16, rowSpan: 2, colSpan: 1, axis: "h", segment: "mid" }),
    Object.freeze({ step: 3, row: 9, col: 15, rowSpan: 2, colSpan: 1, axis: "h", segment: "mid" }),
    Object.freeze({ step: 4, row: 9, col: 14, rowSpan: 2, colSpan: 1, axis: "h", segment: "mid" }),
    Object.freeze({ step: 5, row: 9, col: 13, rowSpan: 2, colSpan: 1, axis: "h", segment: "mid" }),
    Object.freeze({ step: 6, row: 9, col: 12, rowSpan: 2, colSpan: 1, axis: "h", segment: "goal" }),
    Object.freeze({ step: 7, row: 9, col: 11, rowSpan: 2, colSpan: 1, axis: "h", segment: "goal" }),
    Object.freeze({ step: 8, row: 9, col: 10, rowSpan: 2, colSpan: 1, axis: "h", segment: "goal" })
  ]),
  Object.freeze([
    Object.freeze({ step: 1, row: 17, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "entry" }),
    Object.freeze({ step: 2, row: 16, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "mid" }),
    Object.freeze({ step: 3, row: 15, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "mid" }),
    Object.freeze({ step: 4, row: 14, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "mid" }),
    Object.freeze({ step: 5, row: 13, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "mid" }),
    Object.freeze({ step: 6, row: 12, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "goal" }),
    Object.freeze({ step: 7, row: 11, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "goal" }),
    Object.freeze({ step: 8, row: 10, col: 9, rowSpan: 1, colSpan: 2, axis: "v", segment: "goal" })
  ]),
  Object.freeze([
    Object.freeze({ step: 1, row: 9, col: 2, rowSpan: 2, colSpan: 1, axis: "h", segment: "entry" }),
    Object.freeze({ step: 2, row: 9, col: 3, rowSpan: 2, colSpan: 1, axis: "h", segment: "mid" }),
    Object.freeze({ step: 3, row: 9, col: 4, rowSpan: 2, colSpan: 1, axis: "h", segment: "mid" }),
    Object.freeze({ step: 4, row: 9, col: 5, rowSpan: 2, colSpan: 1, axis: "h", segment: "mid" }),
    Object.freeze({ step: 5, row: 9, col: 6, rowSpan: 2, colSpan: 1, axis: "h", segment: "mid" }),
    Object.freeze({ step: 6, row: 9, col: 7, rowSpan: 2, colSpan: 1, axis: "h", segment: "goal" }),
    Object.freeze({ step: 7, row: 9, col: 8, rowSpan: 2, colSpan: 1, axis: "h", segment: "goal" }),
    Object.freeze({ step: 8, row: 9, col: 9, rowSpan: 2, colSpan: 1, axis: "h", segment: "goal" })
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

function evaluateTrackLanding(piece, targetIndex, trackMap) {
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

  if (SAFE_INDICES.has(targetIndex)) {
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

  if (piece.progress < 0) {
    if (forBonus || steps !== 5) {
      return null;
    }

    const exitIndex = START_INDICES[piece.playerSlot];
    const landing = evaluateTrackLanding(piece, exitIndex, trackMap);
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
    if (isBridge(bridgeOccupants)) {
      return null;
    }
  }

  if (target <= trackLimit) {
    const targetIndex = indexForProgress(piece.playerSlot, target);
    const landing = evaluateTrackLanding(piece, targetIndex, trackMap);
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
    lastPath: [...(state.lastPath || [])]
  };
}

function resetSelectionState(state) {
  state.phase = "await-roll";
  state.pendingMove = null;
  state.movablePieceIds = [];
  state.selectedPieceId = null;
  state.bonusPending = null;
  state.effectiveSteps = null;
}

function advanceToNextPlayer(state) {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
  state.consecutiveSixes = 0;
  state.turnLastMovedPieceId = null;
  state.repeatTurnPending = false;
  state.diceValue = null;
  state.lastPath = [];
  state.bonusQueue = [];
  state.bonusPending = null;
  state.pendingMove = null;
  state.movablePieceIds = [];
  state.selectedPieceId = null;
  state.effectiveSteps = null;
  state.phase = "await-roll";
}

function applyTripleSixPenalty(state) {
  const candidateId = state.turnLastMovedPieceId;
  if (!candidateId) {
    state.lastEvent = "Tres seises seguidos: no habia ficha previa para penalizar.";
    return;
  }

  const piece = state.pieces.find((item) => item.id === candidateId && item.playerSlot === state.currentPlayerIndex);
  if (!piece) {
    state.lastEvent = "Tres seises seguidos: no se encontro la ficha para penalizar.";
    return;
  }

  if (piece.progress >= TRACK_LENGTH) {
    state.lastEvent = "Tres seises seguidos: la ultima ficha estaba en pasillo/meta, sin penalizacion.";
    return;
  }

  if (piece.progress < 0) {
    state.lastEvent = "Tres seises seguidos: la ultima ficha ya estaba en casa.";
    return;
  }

  piece.progress = -1;
  state.lastEvent = "Tres seises seguidos: la ultima ficha movida vuelve a casa.";
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
      state.bonusQueue.push({ type: 20, reason: "capture", sourcePieceId: piece.id });
      state.lastEvent = "Captura realizada. Bonus de 20 casillas.";
    }
  }

  if (piece.progress === GOAL_PROGRESS) {
    state.bonusQueue.push({ type: 10, reason: "goal", sourcePieceId: piece.id });
    if (move.capturePieceId) {
      state.lastEvent = "Captura y entrada en meta. Bonus de 20 y 10 casillas.";
    } else {
      state.lastEvent = "Ficha en meta. Bonus de 10 casillas.";
    }
  }

  if (!move.capturePieceId && piece.progress !== GOAL_PROGRESS) {
    state.lastEvent = "Movimiento aplicado.";
  }

  if (checkWinner(state, piece.playerSlot)) {
    state.winnerSlot = piece.playerSlot;
    state.phase = "finished";
    state.repeatTurnPending = false;
    state.bonusQueue = [];
    state.bonusPending = null;
    state.pendingMove = null;
    state.movablePieceIds = [];
    state.lastEvent = "Partida terminada.";
  }
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

    if (legal.length === 1) {
      state.bonusQueue.shift();
      applyMoveCore(state, legal[0]);
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
    state.lastEvent = `Bonus de ${bonus.type}: elige ficha.`;
    return "await-input";
  }

  state.bonusPending = null;
  state.pendingMove = null;
  state.movablePieceIds = [];
  state.selectedPieceId = null;
  state.effectiveSteps = null;
  return "done";
}

function finalizeTurnAfterResolution(state) {
  if (state.winnerSlot !== null) {
    return;
  }

  if (state.repeatTurnPending) {
    state.phase = "await-roll";
    state.pendingMove = null;
    state.movablePieceIds = [];
    state.selectedPieceId = null;
    state.bonusPending = null;
    state.effectiveSteps = null;
    if (!state.lastEvent || state.lastEvent === "Movimiento aplicado.") {
      state.lastEvent = "Has sacado 6. Vuelves a tirar.";
    }
    return;
  }

  advanceToNextPlayer(state);
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function runRollAction(state) {
  if (state.phase !== "await-roll") {
    return { ok: false, reason: "invalid" };
  }

  const playerSlot = state.currentPlayerIndex;
  const rolled = rollDie();
  state.diceValue = rolled;
  state.diceToken = (state.diceToken + 1) % 1000000;
  state.lastPath = [];

  if (rolled === 6) {
    state.consecutiveSixes += 1;
  } else {
    state.consecutiveSixes = 0;
  }

  if (rolled === 6 && state.consecutiveSixes === 3) {
    applyTripleSixPenalty(state);
    state.consecutiveSixes = 0;
    state.repeatTurnPending = false;
    advanceToNextPlayer(state);
    return { ok: true };
  }

  const effectiveSteps = rolled === 6 && allPiecesOutsideHome(state, playerSlot) ? 7 : rolled;
  state.effectiveSteps = effectiveSteps;
  state.repeatTurnPending = rolled === 6;

  let legalMoves = [];
  let mustExitHome = false;
  let bridgeRestrictionActive = false;
  let bridgePieceIds = [];

  if (rolled === 6) {
    bridgePieceIds = getBridgePieceIds(state, playerSlot);
    if (bridgePieceIds.length > 0) {
      const restricted = getLegalMoves(state, playerSlot, effectiveSteps, {
        restrictPieceIds: new Set(bridgePieceIds)
      });
      if (restricted.length > 0) {
        legalMoves = restricted;
        bridgeRestrictionActive = true;
      }
    }
  }

  if (!bridgeRestrictionActive) {
    if (rolled === 5 && hasHomePieces(state, playerSlot)) {
      const exitMoves = getLegalMoves(state, playerSlot, effectiveSteps, { mustExitHome: true });
      if (exitMoves.length > 0) {
        legalMoves = exitMoves;
        mustExitHome = true;
      }
    }

    if (legalMoves.length === 0) {
      legalMoves = getLegalMoves(state, playerSlot, effectiveSteps, {});
    }
  }

  state.pendingMove = {
    source: "die",
    rolledValue: rolled,
    steps: effectiveSteps,
    mustExitHome,
    bridgeRestrictionActive,
    bridgePieceIds
  };

  if (legalMoves.length === 0) {
    resetSelectionState(state);

    if (rolled === 6) {
      state.lastEvent = "Sin jugada legal con 6. Repite turno.";
      return { ok: true };
    }

    state.lastEvent = "Sin jugada legal. Pasa turno.";
    advanceToNextPlayer(state);
    return { ok: true };
  }

  if (legalMoves.length === 1) {
    applyMoveCore(state, legalMoves[0]);

    if (state.winnerSlot !== null) {
      return { ok: true };
    }

    const bonusStatus = resolveBonusQueue(state);
    if (bonusStatus === "await-input") {
      return { ok: true };
    }

    finalizeTurnAfterResolution(state);
    return { ok: true };
  }

  state.phase = "await-piece";
  state.movablePieceIds = legalMoves.map((move) => move.pieceId);
  state.selectedPieceId = null;
  state.lastEvent = `Tirada de ${rolled}. Elige ficha para mover ${effectiveSteps}.`;
  return { ok: true };
}

function runPieceSelection(state, pieceId, expectBonusAction) {
  if (!pieceId) {
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

  const playerSlot = state.currentPlayerIndex;
  let options = {};
  let steps = pending.steps;

  if (pending.source === "die") {
    if (expectBonusAction) {
      return { ok: false, reason: "invalid" };
    }

    if (pending.mustExitHome) {
      options.mustExitHome = true;
    }

    if (pending.bridgeRestrictionActive && Array.isArray(pending.bridgePieceIds) && pending.bridgePieceIds.length > 0) {
      options.restrictPieceIds = new Set(pending.bridgePieceIds);
    }
  }

  if (pending.source === "bonus") {
    if (!expectBonusAction) {
      return { ok: false, reason: "invalid" };
    }
    options.forBonus = true;
    const activeBonus = state.bonusQueue[0];
    if (!activeBonus) {
      return { ok: false, reason: "invalid" };
    }
    steps = activeBonus.type;
  }

  const legal = getLegalMoves(state, playerSlot, steps, options);
  const selectedMove = legal.find((move) => move.pieceId === pieceId);
  if (!selectedMove) {
    return { ok: false, reason: "invalid" };
  }

  if (pending.source === "bonus") {
    state.bonusQueue.shift();
  }

  applyMoveCore(state, selectedMove);

  if (state.winnerSlot !== null) {
    return { ok: true };
  }

  const bonusStatus = resolveBonusQueue(state);
  if (bonusStatus === "await-input") {
    return { ok: true };
  }

  finalizeTurnAfterResolution(state);
  return { ok: true };
}

function renderDie(value) {
  const pips = new Set(DIE_PIPS[value] || []);
  return `
    <span class="parchis-die-cube" aria-hidden="true">
      <span class="parchis-die-cube-top"></span>
      <span class="parchis-die-face">
        ${Array.from({ length: 9 }, (_, index) => `<span class="parchis-die-pip ${pips.has(index) ? "is-on" : ""}"></span>`).join("")}
      </span>
    </span>
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
  const visibleCell = cell.visibleCell;

  if (visibleCell === 34) {
    return { row: 1, col: 9, rowSpan: 1, colSpan: 2 };
  }
  if (visibleCell === 35) {
    return { row: 1, col: 7, rowSpan: 1, colSpan: 2 };
  }
  if (visibleCell === 33) {
    return { row: 1, col: 11, rowSpan: 1, colSpan: 2 };
  }

  if (visibleCell >= 36 && visibleCell <= 42) {
    return {
      row: visibleCell - 34,
      col: 7,
      rowSpan: 1,
      colSpan: 2
    };
  }

  if (visibleCell >= 26 && visibleCell <= 32) {
    return {
      row: 34 - visibleCell,
      col: 11,
      rowSpan: 1,
      colSpan: 2
    };
  }

  if (visibleCell >= 18 && visibleCell <= 25) {
    return {
      row: 7,
      col: 36 - visibleCell,
      rowSpan: 2,
      colSpan: 1
    };
  }

  if (visibleCell === 17) {
    return { row: 9, col: 18, rowSpan: 2, colSpan: 1 };
  }

  if (visibleCell === 16) {
    return { row: 11, col: 18, rowSpan: 2, colSpan: 1 };
  }

  if (visibleCell >= 9 && visibleCell <= 15) {
    return {
      row: 11,
      col: visibleCell + 2,
      rowSpan: 2,
      colSpan: 1
    };
  }

  if (visibleCell >= 43 && visibleCell <= 50) {
    return {
      row: 7,
      col: 51 - visibleCell,
      rowSpan: 2,
      colSpan: 1
    };
  }

  if (visibleCell === 51) {
    return { row: 9, col: 1, rowSpan: 2, colSpan: 1 };
  }

  if (visibleCell === 52) {
    return { row: 11, col: 1, rowSpan: 2, colSpan: 1 };
  }

  if (visibleCell >= 53 && visibleCell <= 59) {
    return {
      row: 11,
      col: visibleCell - 51,
      rowSpan: 2,
      colSpan: 1
    };
  }

  if (visibleCell >= 60 && visibleCell <= 67) {
    return {
      row: visibleCell - 49,
      col: 7,
      rowSpan: 1,
      colSpan: 2
    };
  }

  if (visibleCell === 68) {
    return { row: 18, col: 9, rowSpan: 1, colSpan: 2 };
  }

  if (visibleCell >= 1 && visibleCell <= 8) {
    return {
      row: 19 - visibleCell,
      col: 11,
      rowSpan: 1,
      colSpan: 2
    };
  }

  return {
    row: cell.row,
    col: cell.col,
    rowSpan: 1,
    colSpan: 1
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
  if (placement.rowSpan > placement.colSpan) {
    return placement.col <= 9 ? "left" : "right";
  }
  return placement.row <= 9 ? "top" : "bottom";
}

function getTrackCellClasses({
  cell,
  startOwner,
  isEntry,
  isSafe,
  isBridgeCell,
  recentPath,
  occupants,
  placement,
  centerRingProxy = false
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
  if (CENTER_RING_TRACK_CELLS.has(cell.visibleCell)) {
    classes.push(centerRingProxy ? "is-center-ring-proxy" : "is-center-ring-source");
    classes.push("number-center");
  } else {
    classes.push(`number-${getTrackNumberRegion(placement)}`);
  }

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
  const movable = movableSet.has(piece.id) && canAct && phaseAction;
  const selected = state.selectedPieceId === piece.id;
  const isGoalPiece = piece.progress >= GOAL_PROGRESS;

  const classes = ["parchis-piece", `slot-${piece.playerSlot}`];
  if (movable) {
    classes.push("is-movable");
  }
  if (selected) {
    classes.push("is-selected");
  }
  if (isGoalPiece) {
    classes.push("is-goal");
  }
  if (piece.id === state.lastMovedPieceId) {
    classes.push("is-last");
  }
  if (bridge) {
    classes.push("is-bridge");
  }

  const actionAttrs = movable
    ? `data-action="game-action" data-game-action="${phaseAction}" data-piece-id="${piece.id}"`
    : "disabled";

  return `
    <button
      class="${classes.join(" ")}"
      style="--piece:${theme.piece};--piece-dark:${theme.pieceDark}"
      ${actionAttrs}
    >
      <span>${piece.pieceIndex + 1}</span>
    </button>
  `;
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
    return "Pulsa Tirar dado para continuar.";
  }
  if (state.phase === "await-piece") {
    return `Selecciona una ficha para mover ${state.effectiveSteps || 0}.`;
  }
  if (state.phase === "await-bonus") {
    return `Bonus de ${state.bonusPending ? state.bonusPending.type : 0}. Elige ficha.`;
  }
  return "Resolviendo movimiento.";
}

export const parchisGame = {
  id: "parchis",
  name: "Parchis",
  subtitle: "2-4 jugadores",
  tagline: "Tablero clasico",
  minPlayers: 2,
  maxPlayers: 4,
  useCustomTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Salida", text: "Para sacar ficha de casa necesitas 5. Si hay casa y salida libre, sacar es obligatorio." },
    { title: "Movimiento", text: "Cada ficha avanza el valor del dado. Con 6 juegas otra vez; si todas tus fichas estan fuera, el 6 mueve 7." },
    { title: "Triple 6", text: "Al tercer 6 seguido, la ultima ficha movida vuelve a casa salvo que este en pasillo final o meta." },
    { title: "Captura", text: "En casilla no segura capturas al rival y ganas bonus de 20 casillas." },
    { title: "Puentes", text: "Dos fichas del mismo color forman puente, no se puede saltar y con 6 debes abrirlo si hay jugada legal." },
    { title: "Meta", text: "Para entrar en meta necesitas numero exacto. Cada ficha que entra en meta otorga bonus de 10 casillas." },
    { title: "Victoria", text: "Gana quien mete sus 4 fichas en meta." }
  ],
  getDefaultOptions() {
    return {};
  },
  normalizeOptions() {
    return {};
  },
  createInitialState({ playerCount }) {
    const totalPlayers = clamp(Number(playerCount) || 2, 2, 4);
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
      currentPlayerIndex: 0,
      winnerSlot: null,
      phase: "await-roll",
      diceValue: null,
      diceToken: 0,
      effectiveSteps: null,
      consecutiveSixes: 0,
      turnLastMovedPieceId: null,
      lastMovedPieceId: null,
      repeatTurnPending: false,
      pendingMove: null,
      bonusQueue: [],
      bonusPending: null,
      movablePieceIds: [],
      selectedPieceId: null,
      lastEvent: "Pulsa Tirar dado para empezar.",
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
      return `Turno de ${name}. Tira el dado.`;
    }

    if (state.phase === "await-piece") {
      return `Turno de ${name}. Mueve ${state.effectiveSteps || 0} casillas.`;
    }

    if (state.phase === "await-bonus") {
      const steps = state.bonusPending ? state.bonusPending.type : 0;
      return `Turno de ${name}. Bonus ${steps}: elige ficha.`;
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
      const result = runPieceSelection(next, String(action.pieceId || ""), false);
      if (!result.ok) {
        return result;
      }
      return { ok: true, state: next };
    }

    if (action.type === "apply-bonus") {
      const result = runPieceSelection(next, String(action.pieceId || ""), true);
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
    const activePlayer = players.find((player) => player.slot === state.currentPlayerIndex) || null;
    const activeSlots = new Set(players.map((player) => player.slot));

    const trackMap = buildTrackMap(state.pieces);
    const finalMap = buildFinalMap(state.pieces);
    const homeMap = buildSlotPieceMap(state.pieces, (piece) => piece.progress < 0);
    const goalMap = buildSlotPieceMap(state.pieces, (piece) => piece.progress >= GOAL_PROGRESS);
    const bridgeCells = new Set();
    for (const [index, occupants] of trackMap.entries()) {
      if (isBridge(occupants)) {
        bridgeCells.add(index);
      }
    }

    const trackCells = TRACK_BLUEPRINT.map((cell, index) => {
      const startOwner = START_INDICES.findIndex((value) => value === index);
      const isEntry = FINAL_ENTRY_INDICES.includes(index);
      const isSafe = SAFE_INDICES.has(index);
      const isBridgeCell = bridgeCells.has(index);
      const placement = getTrackPlacement(cell);
      const occupants = (trackMap.get(index) || []).slice().sort((a, b) => a.playerSlot - b.playerSlot || a.pieceIndex - b.pieceIndex);
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
      const trackCellAttr = CENTER_RING_TRACK_CELLS.has(cell.visibleCell)
        ? `data-track-source="${cell.visibleCell}"`
        : `data-track-cell="${cell.visibleCell}"`;

      return `
        <div
          class="${classes.join(" ")}"
          style="${renderGridPlacement(placement)}"
          ${trackCellAttr}
        >
          <span class="parchis-track-core" aria-hidden="true"></span>
          ${startOwner >= 0 ? '<span class="parchis-start-marker" aria-hidden="true"></span>' : ""}
          <span class="parchis-cell-contents">
            ${renderPieceStack(occupants, { state, canAct, phaseAction, movableSet, bridge: isBridgeCell })}
          </span>
        </div>
      `;
    }).join("");

    const centerRingCells = CENTER_RING_TRACK_BLUEPRINT.map((ringCell) => {
        const index = ringCell.visibleCell - 1;
        const cell = TRACK_BLUEPRINT[index];
        const startOwner = START_INDICES.findIndex((value) => value === index);
        const isEntry = FINAL_ENTRY_INDICES.includes(index);
        const isSafe = SAFE_INDICES.has(index);
        const isBridgeCell = bridgeCells.has(index);
        const occupants = (trackMap.get(index) || []).slice().sort((a, b) => a.playerSlot - b.playerSlot || a.pieceIndex - b.pieceIndex);
        const classes = getTrackCellClasses({
          cell,
          startOwner,
          isEntry,
          isSafe,
          isBridgeCell,
          recentPath: recentPath.has(index),
          occupants,
          placement: ringCell,
          centerRingProxy: true
        });

        return `
          <div
            class="${classes.join(" ")} is-center-ring-cell"
            style="${renderLocalGridPlacement(ringCell)}"
            data-track-cell="${cell.visibleCell}"
          >
            <span class="parchis-track-core" aria-hidden="true"></span>
            ${startOwner >= 0 ? '<span class="parchis-start-marker" aria-hidden="true"></span>' : ""}
            <span class="parchis-cell-contents">
              ${renderPieceStack(occupants, { state, canAct, phaseAction, movableSet, bridge: isBridgeCell })}
            </span>
          </div>
        `;
      })
      .join("");

    const centerTransitions = CENTER_TRANSITION_BLUEPRINT.map((transition) => {
      const line = transition.diagonal === "down"
        ? 'x1="0" y1="0" x2="100" y2="100"'
        : 'x1="100" y1="0" x2="0" y2="100"';

      return `
        <span
          class="parchis-center-transition corner-${transition.key} is-${transition.diagonal}"
          style="${renderLocalGridPlacement(transition)}"
          aria-hidden="true"
        >
          <svg
            class="parchis-center-transition-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            focusable="false"
            aria-hidden="true"
          >
            <rect class="parchis-center-transition-fill" x="0" y="0" width="100" height="100"></rect>
            <line class="parchis-center-transition-diagonal" ${line}></line>
          </svg>
        </span>
      `;
    }).join("");

    const finalCells = Array.from({ length: 4 }, (_, slot) => {
      const lane = FINAL_LANE_BLUEPRINT[slot];
      const laneLayout = FINAL_LANE_LAYOUT[slot] || FINAL_LANE_LAYOUT[0];
      return lane
        .map((cell) => {
          const finalIndex = cell.step - 1;
          const occupants = (finalMap.get(`${slot}:${finalIndex}`) || []).slice().sort((a, b) => a.pieceIndex - b.pieceIndex);
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
            </span>
          `).join("")}
        </span>
      </div>
    `;

    const centerRing = `
      <div class="parchis-center-ring" style="${renderGridPlacement(CENTER_RING_BLUEPRINT)}">
        ${centerTransitions}
        ${centerRingCells}
      </div>
    `;

    const canRoll = canAct && state.phase === "await-roll" && state.winnerSlot === null;
    const dieValue = Number.isInteger(state.diceValue) ? state.diceValue : 1;
    const diceClass = state.diceToken % 2 === 0 ? "is-roll-a" : "is-roll-b";

    return `
      <section class="parchis-shell">
        <div class="parchis-board-frame">
          <div class="parchis-board">
            ${homeAreas}
            ${centerRing}
            ${goalArea}
            ${trackCells}
            ${finalCells}
          </div>
        </div>

        <aside class="parchis-side">
          <article class="parchis-side-card parchis-die-card">
            <div class="parchis-die ${diceClass}">
              ${renderDie(dieValue)}
            </div>
            <button
              class="btn btn-primary parchis-roll-btn"
              data-action="game-action"
              data-game-action="roll-die"
              ${canRoll ? "" : "disabled"}
            >
              Tirar dado
            </button>
            <p class="parchis-side-note">Resultado: ${Number.isInteger(state.diceValue) ? state.diceValue : "-"}</p>
          </article>

          <article class="parchis-side-card parchis-turn-card">
            <h4>Turno</h4>
            <p class="parchis-turn-player">
              ${escapeHtml(activePlayer ? activePlayer.name : "Jugador")}
            </p>
            <p class="parchis-side-note">${escapeHtml(buildPhaseHelp(state))}</p>
            ${
              state.bonusPending
                ? `<p class="parchis-side-badge">Bonus activo: ${state.bonusPending.type}</p>`
                : ""
            }
          </article>

          <article class="parchis-side-card parchis-players-card">
            <h4>Jugadores</h4>
            <div class="parchis-player-list">${renderPlayerStatus(state, players)}</div>
          </article>

          <article class="parchis-side-card parchis-event-card">
            <h4>Ultimo evento</h4>
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
      subtitle: "Victoria en Parchis clasico.",
      iconText: winner ? winner.identity.icon : "*",
      iconClass: "win"
    };
  }
};
