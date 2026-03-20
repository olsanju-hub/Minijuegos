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
const OUTER_TRACK_BLUEPRINT = Object.freeze(
  TRACK_BLUEPRINT.filter((cell) => !CENTER_RING_TRACK_CELLS.has(cell.visibleCell))
);

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
  const exitFromHome = Boolean(options.exitFromHome);

  if (piece.progress < 0) {
    if (forBonus || !exitFromHome) {
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
  resetTurnDiceState(state);
  state.phase = "await-roll";
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
    const isDouble = firstValue === secondValue;

    if (isDouble && hasHomePieces(state, playerSlot)) {
      const exitMoves = getExitMoves(state, playerSlot);
      options.push(
        ...exitMoves.map((move) =>
          createMoveOption(state, move, {
            kind: "exit-double",
            consumeDice: [firstDieIndex, secondDieIndex],
            badge: "Salir",
            label: "Salir con doble"
          })
        )
      );
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

    const splitStarts = isDouble ? [firstDieIndex] : available;
    for (const dieIndex of splitStarts) {
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
  state.homeRollAttempts = allHome ? Number(state.homeRollAttempts || 0) : 0;
  state.splitUsedPieceIds = [];
  state.bonusQueue = [];
  state.bonusPending = null;
  state.pendingMove = null;
  state.movablePieceIds = [];
  state.selectedPieceId = null;
  state.effectiveSteps = null;

  if (allHome && !isDouble) {
    state.homeRollAttempts += 1;
    if (state.homeRollAttempts >= 3) {
      state.lastEvent = `No salio doble en 3 intentos (${leftDie} y ${rightDie}). Pierdes el turno.`;
      advanceToNextPlayer(state);
      return { ok: true };
    }

    state.lastEvent = `No salio doble (${leftDie} y ${rightDie}). Intento ${state.homeRollAttempts} de 3 para salir.`;
    return { ok: true };
  }

  const message = isDouble
    ? `Doble ${leftDie}-${rightDie}. Toca un destino para salir o mover.`
    : `Tirada de ${leftDie} y ${rightDie}. Toca un destino para mover.`;

  if (startTurnDestinationSelection(state, message)) {
    return { ok: true };
  }

  state.lastEvent = `No hay jugada legal con ${leftDie} y ${rightDie}.`;
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
  const selectedOption = currentOptions.find((option) => option.id === selectionId);
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
    <span class="parchis-die-cube" aria-hidden="true">
      <span class="parchis-die-cube-top"></span>
      ${renderDieFace(value, "parchis-die-face-final")}
      ${renderDieFace(5, "parchis-die-face-ghost")}
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
  const movable = false;
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
    if (allPiecesInHome(state, state.currentPlayerIndex) && state.homeRollAttempts > 0) {
      return `Busca doble para salir. Vas por el intento ${Math.min(state.homeRollAttempts + 1, 3)} de 3.`;
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
    { title: "Dados", text: "En cada turno tiras 2 dados: puedes mover una ficha con la suma o 2 fichas distintas, una con cada dado." },
    { title: "Salida", text: "Se puede sacar ficha con cualquier doble. Si usas el doble para salir, se consume completo y no haces otro movimiento." },
    { title: "Dobles", text: "Si ya tienes fichas fuera, el doble se juega como una tirada normal: puedes usar suma o dos fichas distintas, pero no da tiro extra por si mismo." },
    { title: "3 intentos", text: "Si no tienes ninguna ficha fuera, dispones de 3 intentos para sacar un doble. Si no sale, pierdes el turno." },
    { title: "Captura", text: "En casilla no segura capturas al rival y obtienes un bonus obligatorio de 20 casillas. Si no hay jugada legal, se pierde." },
    { title: "Puentes", text: "Dos fichas del mismo color forman puente, bloquean el paso y tampoco puedes terminar con una tercera ficha encima." },
    { title: "Meta", text: "Para entrar en meta necesitas numero exacto. Meter ficha no da 10: solo concede un tiro extra completo al terminar el turno." },
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
      if (allPiecesInHome(state, state.currentPlayerIndex) && state.homeRollAttempts > 0) {
        return `Turno de ${name}. Busca doble para salir.`;
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
      if (isBridge(occupants)) {
        bridgeCells.add(index);
      }
    }

    const trackCells = OUTER_TRACK_BLUEPRINT.map((cell) => {
      const index = cell.visibleCell - 1;
      const startOwner = START_INDICES.findIndex((value) => value === index);
      const isEntry = FINAL_ENTRY_INDICES.includes(index);
      const isSafe = SAFE_INDICES.has(index);
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

    const centerRingCells = CENTER_RING_TRACK_BLUEPRINT.map((ringCell) => {
        const index = ringCell.visibleCell - 1;
        const cell = TRACK_BLUEPRINT[index];
        const startOwner = START_INDICES.findIndex((value) => value === index);
        const isEntry = FINAL_ENTRY_INDICES.includes(index);
        const isSafe = SAFE_INDICES.has(index);
        const isBridgeCell = bridgeCells.has(index);
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
            ${renderMoveTarget(state, moveTarget, `Mover a la casilla ${cell.visibleCell}`)}
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

    const centerRing = `
      <div class="parchis-center-ring" style="${renderGridPlacement(CENTER_RING_BLUEPRINT)}">
        ${centerTransitions}
        ${centerRingCells}
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
        const statusLabel = hasValue ? (consumed ? "Usado" : "Disponible") : "Pendiente";
        return `
          <div class="${dieClasses.join(" ")}">
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
      allPiecesInHome(state, state.currentPlayerIndex) && state.homeRollAttempts > 0 && state.phase === "await-roll"
        ? `<p class="parchis-side-badge">Intentos de salida: ${state.homeRollAttempts} de 3</p>`
        : "";

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
              ${diceValues.every((value) => Number.isInteger(value)) ? `Resultado: ${diceValues[0]} y ${diceValues[1]}` : "Lanza para descubrir los 2 dados."}
            </p>
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
            ${exitAttemptsMarkup}
            ${helperChips}
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
      subtitle: "Victoria en Parchis de 2 dados.",
      iconText: winner ? winner.identity.icon : "*",
      iconClass: "win"
    };
  }
};
