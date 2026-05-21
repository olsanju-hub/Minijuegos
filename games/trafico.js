const MOBILE_MAX_WIDTH = 760;
const TABLET_MAX_WIDTH = 1180;
const WIDE_DESKTOP_MIN_WIDTH = 1480;
const WIDE_DESKTOP_MIN_HEIGHT = 760;
const MOBILE_LANE_COUNT = 3;
const TABLET_LANE_COUNT = 4;
const DESKTOP_LANE_COUNT = 4;
const WIDE_DESKTOP_LANE_COUNT = 5;
const VISIBLE_STEPS = 8;
const STEP_DISTANCE = 1 / VISIBLE_STEPS;
const PLAYER_Y = 0.8;
const PLAYER_HEIGHT = 0.18;
const RIVAL_HEIGHT = 0.18;
const TRUCK_HEIGHT = 0.26;
const PICKUP_HEIGHT = 0.11;
const PLAYER_CENTER_Y = PLAYER_Y + PLAYER_HEIGHT / 2;
const SPAWN_Y = -0.22;
const EXIT_Y = 1.14;
const COLLISION_BAND = 0.11;
const PICKUP_BAND = 0.1;
const MAX_FRAME_DELTA_MS = 64;
const ROAD_SCROLL_PX_PER_STEP = 96;
const TRAJECTORY_SLICE_DISTANCE = STEP_DISTANCE / 4;
const TRAJECTORY_LOOKAHEAD_DISTANCE = PLAYER_CENTER_Y - SPAWN_Y + TRUCK_HEIGHT + STEP_DISTANCE;
const TRAJECTORY_BUFFER_Y = 0.028;
const SAFE_SPAWN_LOOKAHEAD_STEPS = 3;
const MIN_LANE_CHANGE_SLICES = 2;
const TRUCK_SPAWN_CHANCE = 0.16;
const TRUCK_MIN_DIFFICULTY = 2;

const OBJECTIVE_TARGETS = Object.freeze({
  distance: 36,
  overtakes: 10,
  pickups: 5
});

const STORAGE_KEY_BEST_TIME = "minijuegos:trafico:best-time-ms";
const BASE_TICK_MS = 720;
const MIN_TICK_MS = 460;

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

function loadBestTime() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BEST_TIME);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch (error) {
    return 0;
  }
}

function saveBestTime(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY_BEST_TIME, String(Math.max(0, Math.floor(value))));
  } catch (error) {
    // Ignora errores de almacenamiento.
  }
}

function normalizeMode(value) {
  return value === "objectives" ? "objectives" : "infinite";
}

function normalizeObjectiveType(value) {
  return ["distance", "overtakes", "pickups"].includes(value) ? value : "distance";
}

function normalizeVehicleType(value) {
  return value === "bike" ? "bike" : "car";
}

function objectiveLabel(type) {
  const map = {
    distance: "Distancia",
    overtakes: "Adelantamientos",
    pickups: "Recogidas"
  };
  return map[type] || "Objetivo";
}

function statusLabel(status) {
  const map = {
    ready: "Listo",
    playing: "Jugando",
    paused: "Pausa",
    "objective-complete": "Objetivo cumplido",
    "game-over": "Game over"
  };
  return map[status] || "Estado";
}

function getObjectiveTarget(type) {
  return OBJECTIVE_TARGETS[normalizeObjectiveType(type)];
}

function currentObjectiveValue(state) {
  if (state.objectiveType === "overtakes") {
    return state.overtakes;
  }
  if (state.objectiveType === "pickups") {
    return state.pickups;
  }
  return state.distance;
}

function formatTime(ms) {
  const tenths = Math.floor(Math.max(0, Number(ms) || 0) / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  const decimal = tenths % 10;
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${decimal}`;
  }
  return `${seconds}.${decimal}s`;
}

function cloneState(state) {
  return {
    ...state,
    entities: state.entities.map((entity) => ({ ...entity }))
  };
}

function nextRandom(state) {
  state.rngSeed = (Math.imul(state.rngSeed, 1664525) + 1013904223) >>> 0;
  return state.rngSeed / 4294967296;
}

function shuffleWithState(state, values) {
  const items = [...values];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom(state) * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function createEntity(state, type, lane, y = SPAWN_Y, variant = "") {
  const nextId = state.nextEntityId + 1;
  state.nextEntityId = nextId;
  const entity = {
    id: `traffic-${nextId}`,
    type,
    lane,
    y
  };
  if (variant) {
    entity.variant = variant;
  }
  return entity;
}

function createPreviewEntity(type, lane, y = SPAWN_Y, variant = "") {
  const entity = { type, lane, y };
  if (variant) {
    entity.variant = variant;
  }
  return entity;
}

function entityHeight(entity) {
  if (!entity) {
    return RIVAL_HEIGHT;
  }
  if (entity.type === "pickup") {
    return PICKUP_HEIGHT;
  }
  if (entity.type === "rival" && entity.variant === "truck") {
    return TRUCK_HEIGHT;
  }
  return RIVAL_HEIGHT;
}

function entityCenterY(entity) {
  return entity.y + entityHeight(entity) / 2;
}

function playerCenterY() {
  return PLAYER_CENTER_Y;
}

function currentTravelSteps(state) {
  return state.distance + state.stepProgress;
}

function laneIndices(laneCount) {
  return Array.from({ length: laneCount }, (_, lane) => lane);
}

function buildWeightedRows(weightedRows, row, copies = 1) {
  for (let copy = 0; copy < copies; copy += 1) {
    weightedRows.push(Object.freeze([...row]));
  }
}

function combinations(values, size, startIndex = 0, prefix = [], result = []) {
  if (prefix.length === size) {
    result.push(prefix);
    return result;
  }

  for (let index = startIndex; index <= values.length - (size - prefix.length); index += 1) {
    combinations(values, size, index + 1, [...prefix, values[index]], result);
  }

  return result;
}

function buildPatternPool(laneCount, difficultyLevel) {
  const lanes = laneIndices(laneCount);
  const weightedRows = [];
  const maxPatternSize = laneCount >= 5 && difficultyLevel >= 4 ? 3 : 2;

  buildWeightedRows(weightedRows, [], Math.max(1, 3 - Math.min(difficultyLevel, 2)));

  for (const lane of lanes) {
    buildWeightedRows(weightedRows, [lane], difficultyLevel >= 2 ? 2 : 3);
  }

  if (difficultyLevel >= 1) {
    for (const pair of combinations(lanes, 2)) {
      const spread = pair[1] - pair[0];
      if (spread > 1) {
        buildWeightedRows(weightedRows, pair, 2);
      } else if (difficultyLevel >= 2) {
        buildWeightedRows(weightedRows, pair, 1);
      }
    }
  }

  if (maxPatternSize >= 3) {
    for (const triplet of combinations(lanes, 3)) {
      const hasDoubleGap = triplet[1] - triplet[0] > 1 || triplet[2] - triplet[1] > 1;
      if (hasDoubleGap) {
        buildWeightedRows(weightedRows, triplet, 1);
      }
    }
  }

  return weightedRows;
}

function resolveTrafficProfile() {
  if (typeof window === "undefined") {
    return {
      id: "desktop",
      laneCount: DESKTOP_LANE_COUNT,
      roadMaxWidth: 520
    };
  }

  const viewportWidth = Math.max(0, window.innerWidth || 0);
  const viewportHeight = Math.max(0, window.innerHeight || 0);

  if (viewportWidth <= MOBILE_MAX_WIDTH) {
    return {
      id: "mobile",
      laneCount: MOBILE_LANE_COUNT,
      roadMaxWidth: 352
    };
  }

  if (viewportWidth <= TABLET_MAX_WIDTH) {
    return {
      id: "tablet",
      laneCount: TABLET_LANE_COUNT,
      roadMaxWidth: 484
    };
  }

  if (viewportWidth >= WIDE_DESKTOP_MIN_WIDTH && viewportHeight >= WIDE_DESKTOP_MIN_HEIGHT) {
    return {
      id: "desktop-wide",
      laneCount: WIDE_DESKTOP_LANE_COUNT,
      roadMaxWidth: 620
    };
  }

  return {
    id: "desktop",
    laneCount: DESKTOP_LANE_COUNT,
    roadMaxWidth: 520
  };
}

function initialPlayerLane(laneCount) {
  return Math.max(0, Math.floor(laneCount / 2));
}

function computeTickMs(distance, laneCount) {
  const stage = Math.min(5, Math.floor(distance / 8));
  const lanePressure = Math.max(0, laneCount - MOBILE_LANE_COUNT);
  return {
    difficultyLevel: stage,
    tickMs: Math.max(MIN_TICK_MS, BASE_TICK_MS - stage * 36 - lanePressure * 14)
  };
}

function isValidLane(lane, laneCount) {
  return lane >= 0 && lane < laneCount;
}

function threatBand(entity) {
  const extraSize = Math.max(0, entityHeight(entity) - RIVAL_HEIGHT);
  return COLLISION_BAND + TRAJECTORY_BUFFER_Y + extraSize * 0.4;
}

function projectedThreat(entity, distanceOffset) {
  if (entity.type !== "rival") {
    return false;
  }
  const spawnDistance = (entity.spawnStep || 0) * STEP_DISTANCE;
  if (distanceOffset + 1e-9 < spawnDistance) {
    return false;
  }
  const futureCenter = entityCenterY(entity) + (distanceOffset - spawnDistance);
  return Math.abs(futureCenter - playerCenterY()) <= threatBand(entity);
}

function blockedLanesAtOffset(entities, distanceOffset) {
  return new Set(
    entities
      .filter((entity) => projectedThreat(entity, distanceOffset))
      .map((entity) => entity.lane)
  );
}

function addReachableState(states, lane, cooldown) {
  const key = String(lane);
  const current = states.get(key);
  if (current === undefined || cooldown < current) {
    states.set(key, cooldown);
  }
}

function buildReachableLanes(entities, startLane, laneCount, extraLookaheadSteps = 0) {
  const initialBlocked = blockedLanesAtOffset(entities, 0);
  const reachable = new Map();

  if (!initialBlocked.has(startLane)) {
    addReachableState(reachable, startLane, 0);
  }

  for (const lane of [startLane - 1, startLane + 1]) {
    if (isValidLane(lane, laneCount) && !initialBlocked.has(lane)) {
      addReachableState(reachable, lane, MIN_LANE_CHANGE_SLICES);
    }
  }

  if (reachable.size === 0) {
    return null;
  }

  const totalLookaheadDistance = TRAJECTORY_LOOKAHEAD_DISTANCE + Math.max(0, extraLookaheadSteps) * STEP_DISTANCE;
  const totalSlices = Math.ceil(totalLookaheadDistance / TRAJECTORY_SLICE_DISTANCE);
  for (let slice = 1; slice <= totalSlices; slice += 1) {
    const blocked = blockedLanesAtOffset(entities, slice * TRAJECTORY_SLICE_DISTANCE);

    if (blocked.size >= laneCount) {
      return null;
    }

    const next = new Map();
    for (const [laneKey, cooldown] of reachable) {
      const lane = Number(laneKey);
      const relaxedCooldown = Math.max(0, cooldown - 1);

      if (!blocked.has(lane)) {
        addReachableState(next, lane, relaxedCooldown);
      }

      if (cooldown > 0) {
        continue;
      }

      for (const candidate of [lane - 1, lane + 1]) {
        if (!isValidLane(candidate, laneCount) || blocked.has(candidate)) {
          continue;
        }
        addReachableState(next, candidate, MIN_LANE_CHANGE_SLICES);
      }
    }

    if (next.size === 0) {
      return null;
    }
    reachable.clear();
    for (const [laneKey, cooldown] of next) {
      reachable.set(laneKey, cooldown);
    }
  }

  return reachable;
}

function buildScenarioEntities(baseEntities, plannedRows) {
  const current = baseEntities.map((entity) => ({ ...entity, spawnStep: 0 }));

  plannedRows.forEach((row, stepIndex) => {
    for (const entity of row) {
      current.push({
        ...entity,
        spawnStep: stepIndex
      });
    }
  });

  return current;
}

function isPlayableScenario(baseEntities, playerLane, plannedRows, laneCount) {
  const scenarioEntities = buildScenarioEntities(baseEntities, plannedRows);
  return Boolean(buildReachableLanes(scenarioEntities, playerLane, laneCount, plannedRows.length - 1));
}

function buildRivalCandidates(state, pattern, difficultyLevel, currentPreviewEntities) {
  const baseCars = pattern.map((lane) => createPreviewEntity("rival", lane, SPAWN_Y, "car"));

  if (
    pattern.length !== 1 ||
    difficultyLevel < TRUCK_MIN_DIFFICULTY ||
    currentPreviewEntities.some((entity) => entity.type === "rival" && entity.variant === "truck") ||
    nextRandom(state) >= TRUCK_SPAWN_CHANCE
  ) {
    return [baseCars];
  }

  return [
    [createPreviewEntity("rival", pattern[0], SPAWN_Y, "truck")],
    baseCars
  ];
}

function choosePlayableVehicleRow(state, baseEntities, playerLane, laneCount, difficultyLevel, mustRest) {
  const patternPool = mustRest ? [[], [], []] : buildPatternPool(laneCount, difficultyLevel);
  const orderedPatterns = shuffleWithState(state, patternPool);

  const supportsFutureWindow = (plannedRows, remainingDepth) => {
    if (remainingDepth <= 0) {
      return true;
    }

    const futurePatterns = shuffleWithState(state, buildPatternPool(laneCount, difficultyLevel));
    for (const pattern of futurePatterns) {
      const futureCandidates = buildRivalCandidates(state, pattern, difficultyLevel, [
        ...baseEntities,
        ...plannedRows.flat()
      ]);

      for (const vehicles of futureCandidates) {
        const nextRows = [...plannedRows, vehicles];
        if (!isPlayableScenario(baseEntities, playerLane, nextRows, laneCount)) {
          continue;
        }
        if (supportsFutureWindow(nextRows, remainingDepth - 1)) {
          return true;
        }
      }
    }

    return false;
  };

  for (const pattern of orderedPatterns) {
    const rivalCandidates = buildRivalCandidates(state, pattern, difficultyLevel, baseEntities);
    for (const vehicles of rivalCandidates) {
      const plannedRows = [vehicles];
      if (!isPlayableScenario(baseEntities, playerLane, plannedRows, laneCount)) {
        continue;
      }
      if (supportsFutureWindow(plannedRows, SAFE_SPAWN_LOOKAHEAD_STEPS - 1)) {
        return vehicles;
      }
    }
  }

  return [];
}

function maybeSpawnPickup(state, baseEntities, spawnVehicles, playerLane, laneCount) {
  const hasActivePickup = baseEntities.some((entity) => entity.type === "pickup");
  if (hasActivePickup || state.pickupCooldown > 0) {
    return null;
  }

  const pickupChance = state.mode === "objectives" && state.objectiveType === "pickups" ? 0.55 : 0.3;
  if (nextRandom(state) > pickupChance) {
    return null;
  }

  const freeLanes = shuffleWithState(
    state,
    laneIndices(laneCount).filter(
      (lane) => !spawnVehicles.some((entity) => entity.lane === lane)
    )
  );

  for (const lane of freeLanes) {
    const candidate = { type: "pickup", lane, y: SPAWN_Y };
    const nextEntities = [
      ...baseEntities,
      ...spawnVehicles,
      candidate
    ];
    if (isPlayableScenario(nextEntities, playerLane, [], laneCount)) {
      return candidate;
    }
  }

  return null;
}

function chooseSpawn(state, baseEntities, playerLane, laneCount) {
  const mustRest = state.respiteTicks > 0 || state.spawnStreak >= 3;
  const selectedVehicles = choosePlayableVehicleRow(state, baseEntities, playerLane, laneCount, state.difficultyLevel, mustRest);
  const pickup = maybeSpawnPickup(state, baseEntities, selectedVehicles, playerLane, laneCount);
  return {
    cars: selectedVehicles.map((entity) => createEntity(state, "rival", entity.lane, SPAWN_Y, entity.variant || "car")),
    pickup: pickup ? createEntity(state, "pickup", pickup.lane, pickup.y) : null
  };
}

function buildFreshState(options) {
  const normalizedMode = normalizeMode(options?.mode);
  const normalizedObjective = normalizeObjectiveType(options?.objectiveType);
  const vehicleType = normalizeVehicleType(options?.vehicleType);
  const profile = resolveTrafficProfile();
  const difficulty = computeTickMs(0, profile.laneCount);
  const randomSeed = ((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 4294967295)) >>> 0;

  return {
    mode: normalizedMode,
    objectiveType: normalizedObjective,
    vehicleType,
    viewportProfile: profile.id,
    laneCount: profile.laneCount,
    roadMaxWidth: profile.roadMaxWidth,
    objectiveTarget: getObjectiveTarget(normalizedObjective),
    status: "ready",
    playerLane: initialPlayerLane(profile.laneCount),
    entities: [],
    distance: 0,
    overtakes: 0,
    pickups: 0,
    score: 0,
    elapsedMs: 0,
    tickCount: 0,
    stepProgress: 0,
    difficultyLevel: difficulty.difficultyLevel,
    tickMs: difficulty.tickMs,
    spawnStreak: 0,
    respiteTicks: 0,
    pickupCooldown: 2,
    nextEntityId: 0,
    rngSeed: randomSeed || 123456789,
    bestInfiniteMs: loadBestTime(),
    isNewBest: false,
    lastCollision: null,
    lastPickupTick: null,
    lastEvent: "Pulsa Empezar para salir a la carretera."
  };
}

function setRunningState(state, message) {
  state.status = "playing";
  if (message) {
    state.lastEvent = message;
  }
}

function setPauseState(state) {
  state.status = "paused";
  state.lastEvent = "Partida en pausa.";
}

function updateDerivedStats(state) {
  const difficulty = computeTickMs(state.distance, state.laneCount);
  state.difficultyLevel = difficulty.difficultyLevel;
  state.tickMs = difficulty.tickMs;
}

function updateScore(state, overtakeDelta, pickupDelta) {
  state.score = state.distance + state.overtakes * 6 + state.pickups * 14 + pickupDelta * 4 + overtakeDelta * 2;
}

function persistBestIfNeeded(state) {
  if (state.mode !== "infinite") {
    return;
  }
  if (state.elapsedMs > state.bestInfiniteMs) {
    state.bestInfiniteMs = state.elapsedMs;
    state.isNewBest = true;
    saveBestTime(state.bestInfiniteMs);
  }
}

function completeRun(state, status, message) {
  state.status = status;
  state.lastEvent = message;
  persistBestIfNeeded(state);
}

function moveEntities(state, deltaY) {
  for (const entity of state.entities) {
    entity.y += deltaY;
  }
}

function removeExitedEntities(state) {
  let overtakes = 0;
  state.entities = state.entities.filter((entity) => {
    if (entity.y <= EXIT_Y) {
      return true;
    }
    if (entity.type === "rival") {
      overtakes += 1;
    }
    return false;
  });
  if (overtakes > 0) {
    state.overtakes += overtakes;
  }
  return overtakes;
}

function collectPickups(state) {
  const collectedIds = new Set();
  let pickupDelta = 0;

  for (const entity of state.entities) {
    if (
      entity.type === "pickup" &&
      entity.lane === state.playerLane &&
      Math.abs(entityCenterY(entity) - playerCenterY()) <= PICKUP_BAND
    ) {
      collectedIds.add(entity.id);
      pickupDelta += 1;
    }
  }

  if (pickupDelta > 0) {
    state.entities = state.entities.filter((entity) => !collectedIds.has(entity.id));
    state.pickups += pickupDelta;
    state.lastPickupTick = state.tickCount;
  }

  return pickupDelta;
}

function findCollision(state) {
  return state.entities.find(
    (entity) =>
      entity.type === "rival" &&
      entity.lane === state.playerLane &&
      Math.abs(entityCenterY(entity) - playerCenterY()) <= COLLISION_BAND
  ) || null;
}

function applySpawnStep(state) {
  const spawn = chooseSpawn(state, state.entities, state.playerLane, state.laneCount);
  state.entities.push(...spawn.cars);

  if (spawn.pickup) {
    state.entities.push(spawn.pickup);
    state.pickupCooldown = state.mode === "objectives" && state.objectiveType === "pickups" ? 4 : 6;
  } else {
    state.pickupCooldown = Math.max(0, state.pickupCooldown - 1);
  }

  if (spawn.cars.length === 0) {
    state.spawnStreak = 0;
    state.respiteTicks = Math.max(0, state.respiteTicks - 1);
  } else {
    state.spawnStreak += 1;
    if (spawn.cars.length === 2) {
      state.respiteTicks = 1;
    } else if (state.respiteTicks > 0) {
      state.respiteTicks -= 1;
    }
  }

  state.tickCount += 1;
  state.distance += 1;
  updateDerivedStats(state);
}

function runFrame(state, deltaMs) {
  if (state.status !== "playing") {
    return { ok: false, reason: "invalid" };
  }

  const safeDeltaMs = clamp(Number(deltaMs) || 0, 0, MAX_FRAME_DELTA_MS);
  if (safeDeltaMs <= 0) {
    return { ok: true, state };
  }

  let remainingMs = safeDeltaMs;
  let overtakeDelta = 0;
  let pickupDelta = 0;

  while (remainingMs > 0.0001 && state.status === "playing") {
    const tickMs = Math.max(MIN_TICK_MS, Number(state.tickMs) || BASE_TICK_MS);
    const stepSliceMs = tickMs * (1 - state.stepProgress);
    const sliceMs = Math.min(remainingMs, stepSliceMs);
    const sliceProgress = sliceMs / tickMs;
    const deltaY = sliceProgress * STEP_DISTANCE;

    moveEntities(state, deltaY);
    state.stepProgress = clamp(state.stepProgress + sliceProgress, 0, 1);
    state.elapsedMs += sliceMs;

    overtakeDelta += removeExitedEntities(state);
    pickupDelta += collectPickups(state);

    const collision = findCollision(state);
    if (collision) {
      state.lastCollision = {
        lane: state.playerLane,
        rivalId: collision.id
      };
      updateScore(state, overtakeDelta, pickupDelta);
      completeRun(state, "game-over", "Colision. Fin de la partida.");
      return { ok: true, state };
    }

    remainingMs -= sliceMs;

    if (state.stepProgress >= 0.999999) {
      state.stepProgress = 0;
      applySpawnStep(state);

      if (state.mode === "objectives" && currentObjectiveValue(state) >= state.objectiveTarget) {
        updateScore(state, overtakeDelta, pickupDelta);
        completeRun(state, "objective-complete", "Objetivo cumplido.");
        return { ok: true, state };
      }
    }
  }

  updateScore(state, overtakeDelta, pickupDelta);

  if (pickupDelta > 0) {
    state.lastEvent = "Moneda recogida.";
  } else if (overtakeDelta > 0) {
    state.lastEvent = overtakeDelta > 1 ? "Buen tramo: has adelantado varios coches." : "Adelantamiento limpio.";
  }

  return { ok: true, state };
}

function overlayCopy(state) {
  if (state.status === "playing") {
    return null;
  }

  if (state.status === "paused") {
    return { title: "Pausa", text: "Pulsa Reanudar para seguir." };
  }
  if (state.status === "objective-complete") {
    return { title: "Objetivo cumplido", text: "La partida ha terminado." };
  }
  if (state.status === "game-over") {
    return { title: "Game over", text: "Has chocado con otro coche." };
  }
  return { title: "Listo", text: "Pulsa Empezar para arrancar." };
}

function renderStatusOverlay(state) {
  const copy = overlayCopy(state);
  return `
    <div class="traffic-road-overlay" data-traffic-overlay ${copy ? "" : "hidden"}>
      <p class="traffic-road-overlay-title" data-traffic-overlay-title>${escapeHtml(copy ? copy.title : "")}</p>
      <p class="traffic-road-overlay-text" data-traffic-overlay-text>${escapeHtml(copy ? copy.text : "")}</p>
    </div>
  `;
}

function buildRenderableEntities(state) {
  return [
    {
      id: "player",
      kind: state.vehicleType === "bike" ? "player-bike" : "player-car",
      lane: state.playerLane,
      y: PLAYER_Y,
      isCollision: Boolean(state.lastCollision)
    },
    ...state.entities.map((entity) => ({
      id: entity.id,
      kind: entity.type === "pickup" ? "pickup" : entity.variant === "truck" ? "truck" : "rival",
      lane: entity.lane,
      y: entity.y,
      isCollision: entity.type === "rival" && state.lastCollision?.rivalId === entity.id
    }))
  ];
}

function entityVisualClass(kind) {
  if (kind === "player-car") {
    return "traffic-player-car";
  }
  if (kind === "player-bike") {
    return "traffic-player-bike";
  }
  if (kind === "pickup") {
    return "traffic-pickup-coin";
  }
  if (kind === "truck") {
    return "traffic-rival-truck";
  }
  return "traffic-rival-car";
}

function vehicleAccentClass(kind) {
  if (kind === "player-car") {
    return "is-player-car";
  }
  if (kind === "player-bike") {
    return "is-player-bike";
  }
  if (kind === "truck") {
    return "is-truck";
  }
  if (kind === "rival") {
    return "is-rival-car";
  }
  return "";
}

function renderTrafficVehicleParts(kind) {
  if (kind === "pickup") {
    return `
      <span class="traffic-pickup-face"></span>
      <span class="traffic-pickup-mark"></span>
    `;
  }

  if (kind === "player-bike") {
    return `
      <span class="traffic-bike-shadow"></span>
      <span class="traffic-bike-wheel is-front"></span>
      <span class="traffic-bike-wheel is-rear"></span>
      <span class="traffic-bike-frame"></span>
      <span class="traffic-bike-seat"></span>
      <span class="traffic-bike-rider"></span>
      <span class="traffic-bike-light"></span>
    `;
  }

  if (kind === "truck") {
    return `
      <span class="traffic-vehicle-shadow"></span>
      <span class="traffic-truck-cab">
        <span class="traffic-truck-windshield"></span>
        <span class="traffic-vehicle-light is-head-left"></span>
        <span class="traffic-vehicle-light is-head-right"></span>
      </span>
      <span class="traffic-truck-cargo">
        <span class="traffic-truck-rib is-rib-1"></span>
        <span class="traffic-truck-rib is-rib-2"></span>
        <span class="traffic-truck-rib is-rib-3"></span>
      </span>
      <span class="traffic-vehicle-wheel is-front-left"></span>
      <span class="traffic-vehicle-wheel is-front-right"></span>
      <span class="traffic-vehicle-wheel is-rear-left"></span>
      <span class="traffic-vehicle-wheel is-rear-right"></span>
      <span class="traffic-vehicle-light is-tail-left"></span>
      <span class="traffic-vehicle-light is-tail-right"></span>
    `;
  }

  return `
    <span class="traffic-vehicle-shadow"></span>
    <span class="traffic-car-hood"></span>
    <span class="traffic-car-cabin">
      <span class="traffic-car-glass is-front"></span>
      <span class="traffic-car-glass is-rear"></span>
    </span>
    <span class="traffic-car-trunk"></span>
    <span class="traffic-car-beltline"></span>
    <span class="traffic-vehicle-wheel is-front-left"></span>
    <span class="traffic-vehicle-wheel is-front-right"></span>
    <span class="traffic-vehicle-wheel is-rear-left"></span>
    <span class="traffic-vehicle-wheel is-rear-right"></span>
    <span class="traffic-vehicle-light is-head-left"></span>
    <span class="traffic-vehicle-light is-head-right"></span>
    <span class="traffic-vehicle-light is-tail-left"></span>
    <span class="traffic-vehicle-light is-tail-right"></span>
  `;
}

function renderTrafficVehicleVisual(kind) {
  const visualClass = entityVisualClass(kind);
  const accentClass = vehicleAccentClass(kind);
  return `
    <span class="${visualClass} traffic-object-visual ${accentClass}" data-traffic-visual-kind="${escapeHtml(kind)}" aria-hidden="true">
      ${renderTrafficVehicleParts(kind)}
    </span>
  `;
}

function roadScrollPx(state) {
  const loop = ROAD_SCROLL_PX_PER_STEP;
  return ((currentTravelSteps(state) * loop) % loop).toFixed(2);
}

function roadStyleVars(state) {
  const laneChangeMs = state.vehicleType === "bike" ? 176 : 210;
  return `--traffic-scroll-px:${roadScrollPx(state)}px;--traffic-lane-count:${state.laneCount};--traffic-road-max:${state.roadMaxWidth}px;--traffic-lane-change-ms:${laneChangeMs}ms;`;
}

function renderLaneDividers(state) {
  return laneIndices(state.laneCount)
    .slice(1)
    .map(
      (lane) =>
        `<span class="traffic-lane-divider" style="left:${((lane / state.laneCount) * 100).toFixed(4)}%;" aria-hidden="true"></span>`
    )
    .join("");
}

function renderTrafficEntity(entity) {
  return `
    <span
      class="traffic-entity ${entity.isCollision ? "is-collision" : ""}"
      data-traffic-entity-id="${escapeHtml(entity.id)}"
      data-traffic-kind="${escapeHtml(entity.kind)}"
      style="--traffic-lane:${entity.lane};--traffic-y:${entity.y.toFixed(4)};"
      aria-hidden="true"
    >
      ${renderTrafficVehicleVisual(entity.kind)}
    </span>
  `;
}

function renderRoad(state) {
  const entities = buildRenderableEntities(state).map(renderTrafficEntity).join("");

  return `
    <div class="traffic-road-frame">
      <div class="traffic-road" data-traffic-road style="${roadStyleVars(state)}">
        <div class="traffic-road-surface">
          <div class="traffic-road-flow" aria-hidden="true"></div>
          ${renderLaneDividers(state)}
          <div class="traffic-entities" data-traffic-entities>${entities}</div>
        </div>
        ${renderStatusOverlay(state)}
      </div>
    </div>
  `;
}

function renderStat(label, value, tone = "", key = "") {
  return `
    <div class="traffic-stat ${tone ? `is-${tone}` : ""}">
      <span class="traffic-stat-label">${escapeHtml(label)}</span>
      <strong class="traffic-stat-value" ${key ? `data-traffic-stat="${escapeHtml(key)}"` : ""}>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderFallbackControls(state, canAct) {
  const isPlaying = state.status === "playing";

  return `
    <div class="traffic-fallback-block">
      <p class="traffic-control-hint">Desliza sobre la carretera. Estos botones quedan como respaldo.</p>
      <div class="traffic-control-row">
        <button
          class="btn btn-secondary traffic-control-btn"
          data-action="game-action"
          data-game-action="steer-left"
          data-traffic-role="steer-left"
          aria-label="Mover a la izquierda"
          ${canAct && isPlaying ? "" : "disabled"}
        >
          ←
        </button>
        <button
          class="btn btn-secondary traffic-control-btn"
          data-action="game-action"
          data-game-action="steer-right"
          data-traffic-role="steer-right"
          aria-label="Mover a la derecha"
          ${canAct && isPlaying ? "" : "disabled"}
        >
          →
        </button>
      </div>
    </div>
  `;
}

function renderPrimaryStatRow(state) {
  return `
    <div class="traffic-live-grid">
      ${renderStat("Tiempo", formatTime(state.elapsedMs), "time", "time")}
      ${renderStat("Puntuacion", String(state.score), "", "score")}
    </div>
  `;
}

function renderSecondaryStats(state) {
  const isInfinite = state.mode === "infinite";

  return `
    <div class="traffic-secondary-grid">
      ${renderStat("Distancia", String(state.distance), "", "distance")}
      ${renderStat("Adelantamientos", String(state.overtakes), "", "overtakes")}
      ${renderStat("Recogidas", String(state.pickups), "", "pickups")}
      ${renderStat("Mejor", isInfinite ? formatTime(state.bestInfiniteMs) : "-", "record", "record")}
    </div>
  `;
}

function renderSidePanel(state, players, canAct) {
  const activePlayer = players[0];
  const primaryButtonAction = state.status === "ready" ? "start-run" : "toggle-pause";
  const primaryButtonLabel =
    state.status === "ready" ? "Empezar" : state.status === "paused" ? "Reanudar" : "Pausa";
  const vehicleLabel = state.vehicleType === "bike" ? "Moto" : "Coche";

  return `
    <aside class="traffic-side">
      <article class="traffic-side-card traffic-status-card">
        <div class="traffic-hud-main">
          <div class="traffic-hud-copy">
            <div class="traffic-mode-row">
              <span class="traffic-mode-pill" data-traffic-mode-label>${escapeHtml(modeLabel(state.mode))}</span>
              <span class="traffic-mode-pill is-soft" data-traffic-status-label>${escapeHtml(statusLabel(state.status))}</span>
              <span class="traffic-mode-pill is-soft">${escapeHtml(vehicleLabel)}</span>
            </div>
            <h4 data-traffic-player-name>${escapeHtml(activePlayer ? activePlayer.name : "Jugador")}</h4>
            <p class="traffic-side-note traffic-objective-note" data-traffic-note="objective">${escapeHtml(objectiveProgressText(state))}</p>
            <p class="traffic-side-note traffic-event-note" data-traffic-note="event">${escapeHtml(state.lastEvent || "")}</p>
          </div>
          ${renderPrimaryStatRow(state)}
        </div>
        <div class="traffic-hud-actions">
          <button
            class="btn ${state.status === "playing" ? "btn-secondary" : "btn-primary"} traffic-primary-btn"
            data-action="game-action"
            data-game-action="${primaryButtonAction}"
            data-traffic-role="primary-action"
            ${canAct && ["ready", "paused", "playing"].includes(state.status) ? "" : "disabled"}
          >
            ${primaryButtonLabel}
          </button>
          ${renderFallbackControls(state, canAct)}
        </div>
        <div class="traffic-secondary-card">
          <div class="traffic-secondary-head">
            <h4>Telemetria</h4>
            <p class="traffic-side-note">Metricas de carrera</p>
          </div>
          ${renderSecondaryStats(state)}
        </div>
      </article>
    </aside>
  `;
}

function objectiveProgressText(state) {
  if (state.mode !== "objectives") {
    return "Aguanta lo maximo posible.";
  }
  return `${objectiveLabel(state.objectiveType)}: ${currentObjectiveValue(state)} / ${state.objectiveTarget}`;
}

function modeLabel(mode) {
  return mode === "objectives" ? "Objetivos" : "Infinito";
}

function setNodeText(root, selector, value) {
  const node = root.querySelector(selector);
  if (node) {
    node.textContent = value;
  }
}

function setEntityPosition(node, lane, y) {
  node.style.setProperty("--traffic-lane", String(lane));
  node.style.setProperty("--traffic-y", Number(y).toFixed(4));
}

function createTrafficEntityNode(entity) {
  const node = document.createElement("span");
  node.className = "traffic-entity";
  node.dataset.trafficEntityId = entity.id;
  node.dataset.trafficKind = entity.kind;
  node.setAttribute("aria-hidden", "true");
  node.innerHTML = renderTrafficVehicleVisual(entity.kind);
  return node;
}

function syncTrafficEntityVisual(node, kind) {
  const visual = node.firstElementChild;
  if (!(visual instanceof HTMLElement) || visual.dataset.trafficVisualKind !== kind) {
    node.innerHTML = renderTrafficVehicleVisual(kind);
    return;
  }
  visual.className = `${entityVisualClass(kind)} traffic-object-visual ${vehicleAccentClass(kind)}`.trim();
}

function syncTrafficEntities(root, state) {
  const layer = root.querySelector("[data-traffic-entities]");
  if (!layer) {
    return;
  }

  const nextEntities = buildRenderableEntities(state);
  const currentNodes = new Map();
  for (const node of layer.querySelectorAll("[data-traffic-entity-id]")) {
    currentNodes.set(node.dataset.trafficEntityId || "", node);
  }

  const activeIds = new Set();
  for (const entity of nextEntities) {
    activeIds.add(entity.id);

    let node = currentNodes.get(entity.id);
    if (!node) {
      node = createTrafficEntityNode(entity);
      layer.append(node);
    }

    node.dataset.trafficKind = entity.kind;
    syncTrafficEntityVisual(node, entity.kind);
    node.classList.toggle("is-collision", entity.isCollision);
    setEntityPosition(node, entity.lane, entity.y);
  }

  for (const [entityId, node] of currentNodes) {
    if (!activeIds.has(entityId) && node.isConnected) {
      node.remove();
    }
  }
}

function syncTrafficOverlay(root, state) {
  const overlay = root.querySelector("[data-traffic-overlay]");
  if (!overlay) {
    return;
  }

  const copy = overlayCopy(state);
  overlay.hidden = !copy;
  setNodeText(root, "[data-traffic-overlay-title]", copy ? copy.title : "");
  setNodeText(root, "[data-traffic-overlay-text]", copy ? copy.text : "");
}

function syncTrafficControls(root, state, canAct) {
  const isReady = state.status === "ready";
  const isPaused = state.status === "paused";
  const isPlaying = state.status === "playing";
  const primaryAction = isReady ? "start-run" : "toggle-pause";
  const primaryLabel = isReady ? "Empezar" : isPaused ? "Reanudar" : "Pausa";
  const primaryEnabled = canAct && (isReady || isPaused || isPlaying);

  for (const button of root.querySelectorAll('[data-traffic-role="primary-action"]')) {
    button.dataset.gameAction = primaryAction;
    button.textContent = primaryLabel;
    button.disabled = !primaryEnabled;
    button.classList.toggle("btn-primary", !isPlaying);
    button.classList.toggle("btn-secondary", isPlaying);
  }

  for (const button of root.querySelectorAll('[data-traffic-role="steer-left"], [data-traffic-role="steer-right"]')) {
    button.disabled = !(canAct && isPlaying);
  }
}

function syncTrafficHud(root, state, players, canAct) {
  const road = root.querySelector("[data-traffic-road]");
  if (road) {
    road.style.setProperty("--traffic-scroll-px", `${roadScrollPx(state)}px`);
  }

  setNodeText(root, "[data-traffic-mode-label]", modeLabel(state.mode));
  setNodeText(root, "[data-traffic-status-label]", statusLabel(state.status));
  setNodeText(root, "[data-traffic-player-name]", players[0] ? players[0].name : "Jugador");
  setNodeText(root, '[data-traffic-note="objective"]', objectiveProgressText(state));
  setNodeText(root, '[data-traffic-note="event"]', state.lastEvent || "");

  const statValues = {
    mode: modeLabel(state.mode),
    objective: state.mode === "objectives" ? `${objectiveLabel(state.objectiveType)} ${currentObjectiveValue(state)}/${state.objectiveTarget}` : "Mejor tiempo",
    distance: String(state.distance),
    score: String(state.score),
    time: formatTime(state.elapsedMs),
    overtakes: String(state.overtakes),
    pickups: String(state.pickups),
    record: state.mode === "infinite" ? formatTime(state.bestInfiniteMs) : "-"
  };

  for (const [key, value] of Object.entries(statValues)) {
    setNodeText(root, `[data-traffic-stat="${key}"]`, value);
  }

  syncTrafficControls(root, state, canAct);
}

const TRAFICO_STYLE_ID = "trafico-game-styles";
const TRAFICO_STYLES = String.raw`
  /* Contenedor y Diorama Premium */
  .screen.game-screen-trafico .traffic-shell {
    perspective: 800px;
  }

  .screen.game-screen-trafico .traffic-road-frame {
    background: 
      radial-gradient(circle at top, rgba(255, 255, 255, 0.15), transparent 60%),
      linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    padding: 10px !important;
    border-radius: 28px !important;
  }

  /* Asfalto Mojado e Iluminación Nocturna */
  .screen.game-screen-trafico .traffic-road {
    background: radial-gradient(circle at 50% 30%, #1e2530 0%, #0b0d13 100%) !important;
    border: 1.5px solid rgba(0, 0, 0, 0.6) !important;
    box-shadow: 
      inset 0 0 40px rgba(0, 0, 0, 0.85),
      0 12px 24px rgba(0, 0, 0, 0.5) !important;
    border-radius: 22px !important;
  }

  .screen.game-screen-trafico .traffic-road-surface {
    background: 
      /* Reflejos de luces de la autopista y lluvia en el suelo */
      radial-gradient(ellipse at 50% 10%, rgba(56, 189, 248, 0.08), transparent 70%),
      radial-gradient(circle at 20% 60%, rgba(236, 72, 153, 0.04), transparent 50%),
      /* Aceras / Bordillo de Hormigón Rústico 3D */
      linear-gradient(90deg, 
        #334155 0px, #475569 2px, #1e293b 3px, #0f172a 5px, #1e293b 10px, 
        transparent 10px calc(100% - 10px), 
        #1e293b calc(100% - 10px), #0f172a calc(100% - 5px), #1e293b calc(100% - 3px), #475569 calc(100% - 2px), #334155 100%
      ),
      /* Textura granulada de asfalto */
      repeating-linear-gradient(0deg, rgba(255,255,255,0.006) 0 1px, transparent 1px 3px),
      linear-gradient(180deg, #181d26 0%, #0a0c10 100%) !important;
  }

  /* Reflejos fluidos de lluvia y velocidad */
  .screen.game-screen-trafico .traffic-road-flow {
    background:
      /* Estelas de reflejos mojados */
      repeating-linear-gradient(180deg, 
        rgba(255, 255, 255, 0) 0px, 
        rgba(255, 255, 255, 0) 60px, 
        rgba(255, 255, 255, 0.02) 65px, 
        rgba(253, 224, 71, 0.04) 70px, 
        rgba(255, 255, 255, 0.02) 75px, 
        rgba(255, 255, 255, 0) 80px, 
        rgba(255, 255, 255, 0) 160px
      ),
      /* Gotas de lluvia sutiles */
      repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px);
    opacity: 0.65 !important;
    transform: translateY(calc(var(--traffic-scroll-px) * 0.75)) !important;
    filter: blur(0.5px);
  }

  /* Bordes iluminados nocturnos */
  .screen.game-screen-trafico .traffic-road-surface::before {
    background: 
      linear-gradient(90deg, 
        rgba(244, 63, 94, 0.08) 0 10px, 
        transparent 10px calc(100% - 10px), 
        rgba(14, 165, 233, 0.08) calc(100% - 10px) 100%
      ) !important;
    opacity: 1 !important;
  }

  /* Calzada y líneas divisoras */
  .screen.game-screen-trafico .traffic-lane-divider {
    background: repeating-linear-gradient(
      180deg,
      #fef08a 0px,
      #eab308 24px, 
      transparent 24px 60px
    ) !important;
    width: 4px !important;
    box-shadow: 
      0 0 5px rgba(234, 179, 8, 0.45),
      0 0 1px rgba(0, 0, 0, 0.6) !important;
    opacity: 0.88 !important;
  }

  /* Físicas de vehículos y brillo Die-Cast */
  .screen.game-screen-trafico .traffic-player-car {
    background: 
      linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.08) 25%, transparent 50%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.25) 0%, transparent 12%, transparent 88%, rgba(0, 0, 0, 0.25) 100%),
      linear-gradient(180deg, #38bdf8 0%, #0284c7 42%, #0369a1 72%, #0c4a6e 100%) !important;
    border: 1.5px solid #0284c7 !important;
    box-shadow: 
      0 12px 24px rgba(0, 0, 0, 0.55),
      inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
    border-radius: 12px 12px 8px 8px !important;
  }

  .screen.game-screen-trafico .traffic-player-bike .traffic-bike-frame {
    background: 
      linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, transparent 35%),
      linear-gradient(180deg, #4ade80 0%, #16a34a 55%, #14532d 100%) !important;
    border: 1.2px solid #15803d !important;
    box-shadow: 
      0 10px 20px rgba(0, 0, 0, 0.45),
      inset 0 1px 1px rgba(255, 255, 255, 0.5) !important;
  }

  .screen.game-screen-trafico .traffic-rival-car {
    background: 
      linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 20%, transparent 50%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.25) 0%, transparent 12%, transparent 88%, rgba(0, 0, 0, 0.25) 100%),
      /* Metalizado Rojo Cereza Profundo */
      linear-gradient(180deg, #fb7185 0%, #f43f5e 40%, #be123c 70%, #4c0519 100%) !important;
    border: 1.5px solid #be123c !important;
    box-shadow: 
      0 12px 20px rgba(0, 0, 0, 0.45),
      inset 0 1px 2px rgba(255, 255, 255, 0.55) !important;
    border-radius: 12px 12px 8px 8px !important;
  }

  .screen.game-screen-trafico .traffic-rival-truck .traffic-truck-cab {
    background: 
      linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
      linear-gradient(180deg, #f59e0b 0%, #d97706 60%, #78350f 100%) !important;
    border: 1.2px solid #b45309 !important;
  }

  .screen.game-screen-trafico .traffic-rival-truck .traffic-truck-cargo {
    background: 
      linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, transparent 15%),
      linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, transparent 10%, transparent 90%, rgba(0, 0, 0, 0.28) 100%),
      linear-gradient(180deg, #94a3b8 0%, #64748b 50%, #475569 100%) !important;
    box-shadow: 
      inset 0 0 10px rgba(0, 0, 0, 0.45),
      0 8px 16px rgba(0, 0, 0, 0.4) !important;
    border: 1px solid #475569 !important;
  }

  .screen.game-screen-trafico .traffic-truck-rib {
    background: linear-gradient(180deg, #f1f5f9 0%, #94a3b8 100%) !important;
    height: 3px !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.4) !important;
  }

  /* Ruedas Cromadas Ultra-Realistas */
  .screen.game-screen-trafico .traffic-vehicle-wheel,
  .screen.game-screen-trafico .traffic-bike-wheel {
    background: 
      radial-gradient(circle at 50% 50%, #ffffff 0 22%, #64748b 28% 45%, #0f172a 50% 65%, #334155 70% 100%) !important;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
  }

  /* Cristal Reflectante de Cabinas */
  .screen.game-screen-trafico .traffic-car-glass,
  .screen.game-screen-trafico .traffic-truck-windshield,
  .screen.game-screen-trafico .traffic-bike-rider,
  .screen.game-screen-trafico .traffic-bike-frame::after {
    background: 
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.95) 0 8%, transparent 10%),
      linear-gradient(135deg, #e0f2fe 0%, #38bdf8 50%, #0284c7 100%) !important;
    box-shadow: 
      inset 0 0 4px rgba(255, 255, 255, 0.6),
      0 1px 2px rgba(0, 0, 0, 0.3) !important;
    opacity: 0.9 !important;
  }

  /* Faros y Proyección de Haces de Luz SVG */
  .screen.game-screen-trafico .traffic-vehicle-light.is-head-left,
  .screen.game-screen-trafico .traffic-vehicle-light.is-head-right,
  .screen.game-screen-trafico .traffic-bike-light {
    background: #ffffff !important;
    box-shadow: 
      0 0 10px 2px #fffbeb,
      0 0 4px 1px #ffffff !important;
    z-index: 6;
  }

  /* Haz Direccional del Jugador (Cool Xenon Blue) */
  .screen.game-screen-trafico .traffic-player-car .traffic-vehicle-light.is-head-left::after,
  .screen.game-screen-trafico .traffic-player-car .traffic-vehicle-light.is-head-right::after,
  .screen.game-screen-trafico .traffic-player-bike .traffic-bike-light::after {
    content: "" !important;
    position: absolute !important;
    bottom: 50% !important;
    left: 50% !important;
    width: 60px !important;
    height: 160px !important;
    transform: translateX(-50%) !important;
    transform-origin: bottom center !important;
    background: linear-gradient(to top, rgba(224, 242, 254, 0.45) 0%, rgba(14, 165, 233, 0.15) 35%, rgba(14, 165, 233, 0) 100%) !important;
    clip-path: polygon(42% 100%, 58% 100%, 100% 0%, 0% 0%) !important;
    filter: blur(2px) !important;
    pointer-events: none !important;
    z-index: 5 !important;
    animation: headlight-flicker 4s infinite alternate !important;
  }

  /* Haz Direccional de Rivales (Warm Halogen Yellow) */
  .screen.game-screen-trafico .traffic-rival-car .traffic-vehicle-light.is-head-left::after,
  .screen.game-screen-trafico .traffic-rival-car .traffic-vehicle-light.is-head-right::after,
  .screen.game-screen-trafico .traffic-rival-truck .traffic-vehicle-light.is-head-left::after,
  .screen.game-screen-trafico .traffic-rival-truck .traffic-vehicle-light.is-head-right::after {
    content: "" !important;
    position: absolute !important;
    bottom: 50% !important;
    left: 50% !important;
    width: 50px !important;
    height: 130px !important;
    transform: translateX(-50%) !important;
    transform-origin: bottom center !important;
    background: linear-gradient(to top, rgba(254, 240, 138, 0.35) 0%, rgba(234, 179, 8, 0.12) 35%, rgba(234, 179, 8, 0) 100%) !important;
    clip-path: polygon(43% 100%, 57% 100%, 100% 0%, 0% 0%) !important;
    filter: blur(2px) !important;
    pointer-events: none !important;
    z-index: 5 !important;
  }

  /* Luces Traseras y Freno */
  .screen.game-screen-trafico .traffic-vehicle-light.is-tail-left,
  .screen.game-screen-trafico .traffic-vehicle-light.is-tail-right {
    background: #f43f5e !important;
    box-shadow: 0 0 6px rgba(244, 63, 94, 0.6) !important;
  }

  /* Luces de freno intensas al detenerse o chocar */
  .traffic-shell.is-stopped .traffic-player-car .traffic-vehicle-light.is-tail-left,
  .traffic-shell.is-stopped .traffic-player-car .traffic-vehicle-light.is-tail-right,
  .traffic-shell.is-stopped .traffic-rival-car .traffic-vehicle-light.is-tail-left,
  .traffic-shell.is-stopped .traffic-rival-car .traffic-vehicle-light.is-tail-right,
  .traffic-shell.is-stopped .traffic-rival-truck .traffic-vehicle-light.is-tail-left,
  .traffic-shell.is-stopped .traffic-rival-truck .traffic-vehicle-light.is-tail-right {
    background: #ff2222 !important;
    box-shadow: 
      0 0 16px 5px #ef4444,
      0 0 8px 2px #ffffff !important;
    transition: box-shadow 0.2s ease-in-out !important;
  }

  /* Humo del escape continuo al jugar */
  .screen.game-screen-trafico .traffic-vehicle-light.is-tail-left::before {
    content: "" !important;
    position: absolute !important;
    bottom: -12px !important;
    left: 50% !important;
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    background: radial-gradient(circle, rgba(100, 100, 100, 0.4) 0%, rgba(50, 50, 50, 0.1) 60%, transparent 100%) !important;
    animation: exhaust-smoke 0.8s infinite linear !important;
    pointer-events: none !important;
    z-index: 1 !important;
  }

  /* Ocultar humo al detenerse */
  .traffic-shell.is-stopped .traffic-vehicle-light.is-tail-left::before {
    animation: none !important;
    opacity: 0 !important;
  }

  /* Monedas Flotantes de Oro Puro */
  .screen.game-screen-trafico .traffic-pickup-coin {
    background: 
      radial-gradient(circle at 35% 35%, #fffbeb 0 20%, #fef08a 25% 45%, #ca8a04 60% 80%, #854d0e 100%) !important;
    box-shadow: 
      0 0 12px 3px rgba(250, 204, 21, 0.55),
      0 4px 10px rgba(0, 0, 0, 0.35),
      inset 0 1px 1px #ffffff !important;
    border: 1px solid #eab308 !important;
    animation: coin-spin 1.2s infinite linear, coin-float 1.5s ease-in-out infinite alternate !important;
  }

  /* Sacudida Screenshake por colisión */
  .traffic-shell.is-crashed .traffic-road-frame {
    animation: traffic-crashed-shake 0.42s cubic-bezier(.36,.07,.19,.97) both !important;
  }

  /* Chispas y Destellos en Colisiones */
  .screen.game-screen-trafico .traffic-entity.is-collision::before {
    content: "" !important;
    position: absolute !important;
    inset: -25px !important;
    background: 
      radial-gradient(circle, #facc15 0%, #ef4444 40%, transparent 70%),
      repeating-conic-gradient(from 0deg, #fef08a 0deg 15deg, transparent 15deg 30deg) !important;
    animation: crash-spark-burst 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite !important;
    z-index: 10 !important;
    pointer-events: none !important;
  }

  .screen.game-screen-trafico .traffic-entity.is-collision::after {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    width: 100px !important;
    height: 100px !important;
    transform: translate(-50%, -50%) !important;
    background: radial-gradient(circle, #ffffff 0%, rgba(239, 68, 68, 0.8) 30%, transparent 60%) !important;
    animation: crash-flash 0.08s ease-out infinite alternate !important;
    z-index: 9 !important;
    pointer-events: none !important;
  }

  /* Humo negro denso de colisión en el motor (frente) */
  .screen.game-screen-trafico .traffic-entity.is-collision .traffic-vehicle-light.is-head-left::before,
  .screen.game-screen-trafico .traffic-entity.is-collision .traffic-vehicle-light.is-head-right::before {
    content: "" !important;
    position: absolute !important;
    top: -20px !important;
    left: 50% !important;
    width: 24px !important;
    height: 24px !important;
    border-radius: 50% !important;
    background: radial-gradient(circle, rgba(30, 30, 30, 0.8) 0%, rgba(10, 10, 10, 0) 70%) !important;
    animation: crash-black-smoke 1.4s infinite linear !important;
    pointer-events: none !important;
    z-index: 12 !important;
  }

  /* Animaciones y Keyframes */
  @keyframes headlight-flicker {
    0%, 100% { opacity: 1; }
    45% { opacity: 0.95; }
    50% { opacity: 1; }
    53% { opacity: 0.92; }
    60% { opacity: 1; }
  }

  @keyframes exhaust-smoke {
    0% { transform: translate(-50%, 100%) scale(0.6); opacity: 0.6; filter: blur(0.5px); }
    50% { transform: translate(-65%, 160%) scale(1.1); opacity: 0.3; filter: blur(1.5px); }
    100% { transform: translate(-45%, 230%) scale(1.6); opacity: 0; filter: blur(3px); }
  }

  @keyframes coin-spin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }

  @keyframes coin-float {
    0% { transform: translateY(0); }
    100% { transform: translateY(-5px); }
  }

  @keyframes traffic-crashed-shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }

  @keyframes crash-spark-burst {
    0% { transform: scale(0.5) rotate(0deg); opacity: 0.9; }
    100% { transform: scale(1.5) rotate(90deg); opacity: 0; filter: blur(1px); }
  }

  @keyframes crash-flash {
    0% { opacity: 0.35; }
    100% { opacity: 0.95; }
  }

  @keyframes crash-black-smoke {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; filter: blur(1px); }
    50% { transform: translate(-35%, -90%) scale(1.2) rotate(45deg); opacity: 0.5; filter: blur(3px); }
    100% { transform: translate(-65%, -150%) scale(1.9) rotate(-45deg); opacity: 0; filter: blur(6px); }
  }
`;

function ensureTraficoStyles() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(TRAFICO_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = TRAFICO_STYLE_ID;
  style.textContent = TRAFICO_STYLES;
  document.head.append(style);
}

export const traficoGame = {
  id: "trafico",
  name: "Tráfico",
  subtitle: "1 jugador",
  tagline: "Carriles y reflejos",
  minPlayers: 1,
  maxPlayers: 1,
  hidePlayerNames: true,
  useCustomTurnMessage: true,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Objetivo", text: "Cambia de carril y evita el trafico. En Infinito gana quien mas tiempo aguanta; en Objetivos debes completar una meta corta." },
    { title: "Flujo", text: "La carretera avanza de forma continua. El numero de carriles se adapta al espacio util del dispositivo y se mantiene durante la carrera." },
    { title: "Colision", text: "Si un coche rival coincide con tu carril y tu zona de impacto, la partida termina al instante." },
    { title: "Monedas", text: "Solo aparece una moneda activa a la vez. Suma puntuacion y cuenta para el objetivo de Recogidas." },
    { title: "Vehiculo", text: "Puedes jugar con coche o moto. Ambos usan las mismas reglas base de colision y carriles." }
  ],
  getDefaultOptions() {
    return {
      mode: "infinite",
      objectiveType: "distance",
      vehicleType: "car"
    };
  },
  normalizeOptions(options = {}) {
    const mode = normalizeMode(options.mode);
    return {
      mode,
      objectiveType: normalizeObjectiveType(options.objectiveType),
      vehicleType: normalizeVehicleType(options.vehicleType)
    };
  },
  renderConfigPanel({ options }) {
    const mode = normalizeMode(options?.mode);
    const objectiveType = normalizeObjectiveType(options?.objectiveType);
    const vehicleType = normalizeVehicleType(options?.vehicleType);

    return `
      <div class="block">
        <h3 class="block-title">Modo</h3>
        <div class="player-count-row">
          <button class="pill ${mode === "infinite" ? "is-active" : ""}" data-action="set-game-option" data-option="mode" data-value="infinite">Infinito</button>
          <button class="pill ${mode === "objectives" ? "is-active" : ""}" data-action="set-game-option" data-option="mode" data-value="objectives">Objetivos</button>
        </div>
      </div>

      ${
        mode === "objectives"
          ? `
            <div class="block">
              <h3 class="block-title">Objetivo</h3>
              <div class="player-count-row">
                <button class="pill ${objectiveType === "distance" ? "is-active" : ""}" data-action="set-game-option" data-option="objectiveType" data-value="distance">Distancia</button>
                <button class="pill ${objectiveType === "overtakes" ? "is-active" : ""}" data-action="set-game-option" data-option="objectiveType" data-value="overtakes">Adelantamientos</button>
                <button class="pill ${objectiveType === "pickups" ? "is-active" : ""}" data-action="set-game-option" data-option="objectiveType" data-value="pickups">Recogidas</button>
              </div>
            </div>
          `
          : ""
      }

      <div class="block">
        <h3 class="block-title">Vehiculo</h3>
        <p class="block-sub">Cambia la silueta del jugador sin alterar las reglas base.</p>
        <div class="player-count-row">
          <button class="pill ${vehicleType === "car" ? "is-active" : ""}" data-action="set-game-option" data-option="vehicleType" data-value="car">Coche</button>
          <button class="pill ${vehicleType === "bike" ? "is-active" : ""}" data-action="set-game-option" data-option="vehicleType" data-value="bike">Moto</button>
        </div>
      </div>
    `;
  },
  createInitialState({ options }) {
    return buildFreshState(options);
  },
  getTurnSlot() {
    return 0;
  },
  getResult(state) {
    if (state.status === "objective-complete") {
      return { type: "win" };
    }
    if (state.status === "game-over") {
      return { type: "loss" };
    }
    return null;
  },
  getTurnMessage({ state }) {
    if (state.status === "playing") {
      return "Partida en curso";
    }
    if (state.status === "paused") {
      return "Partida en pausa";
    }
    if (state.status === "objective-complete") {
      return "Objetivo cumplido";
    }
    if (state.status === "game-over") {
      return "Game over";
    }
    return "Listo para jugar";
  },
  applyAction({ state, action }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    const next = cloneState(state);

    if (action.type === "start-run") {
      if (next.status !== "ready") {
        return { ok: false, reason: "invalid" };
      }
      setRunningState(next, "Arranca la partida.");
      return { ok: true, state: next };
    }

    if (action.type === "toggle-pause") {
      if (next.status === "playing") {
        setPauseState(next);
        return { ok: true, state: next };
      }
      if (next.status === "paused") {
        setRunningState(next, "Vuelves a la carretera.");
        return { ok: true, state: next };
      }
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "steer-left") {
      if (next.status !== "playing") {
        return { ok: false, reason: "invalid" };
      }
      next.playerLane = clamp(next.playerLane - 1, 0, next.laneCount - 1);
      return { ok: true, state: next };
    }

    if (action.type === "steer-right") {
      if (next.status !== "playing") {
        return { ok: false, reason: "invalid" };
      }
      next.playerLane = clamp(next.playerLane + 1, 0, next.laneCount - 1);
      return { ok: true, state: next };
    }

    if (action.type === "tick") {
      return runFrame(next, action.deltaMs);
    }

    return { ok: false, reason: "invalid" };
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="trafficRoad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#27323a" />
              <stop offset="100%" stop-color="#111827" />
            </linearGradient>
            <linearGradient id="trafficFrame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#e2e8f0" />
            </linearGradient>
          </defs>
          <rect x="14" y="10" width="132" height="74" rx="18" fill="url(#trafficFrame)" stroke="rgba(15,23,42,0.14)" />
          <rect x="24" y="14" width="112" height="66" rx="18" fill="url(#trafficRoad)" />
          <rect x="24" y="14" width="8" height="66" rx="6" fill="#d4bd91" />
          <rect x="128" y="14" width="8" height="66" rx="6" fill="#d4bd91" />
          <path d="M52 18V76M80 18V76M108 18V76" stroke="#fff3d2" stroke-width="2.8" stroke-dasharray="7 7" opacity="0.82" />
          <g transform="translate(36 22)">
            <ellipse cx="8" cy="29" rx="10" ry="2.4" fill="rgba(0,0,0,0.2)" />
            <path d="M2.2 8Q2.8 2.2 8 1Q13.2 2.2 13.8 8V24Q12.8 29 8 30Q3.2 29 2.2 24Z" fill="#f97316" stroke="#a8432d" stroke-width="1.2" />
            <path d="M4.2 8.5h7.6M4.2 17h7.6" stroke="#fff2df" stroke-width="1.4" stroke-linecap="round" />
            <path d="M4.5 9.5Q8 7.2 11.5 9.5v5Q8 16 4.5 14.5Z" fill="#dff3ff" opacity="0.9" />
            <circle cx="2.2" cy="23" r="1.7" fill="#1d2730" /><circle cx="13.8" cy="23" r="1.7" fill="#1d2730" />
          </g>
          <g transform="translate(70 45)">
            <ellipse cx="10" cy="31" rx="12" ry="2.6" fill="rgba(0,0,0,0.22)" />
            <path d="M2.2 8.5Q3.4 2.2 10 1Q16.6 2.2 17.8 8.5V25.5Q16 31 10 32Q4 31 2.2 25.5Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.35" />
            <path d="M5 9h10M5 18h10" stroke="#eef7ff" stroke-width="1.45" stroke-linecap="round" />
            <path d="M5 10.2Q10 7.3 15 10.2v5Q10 17 5 15.2Z" fill="#dff3ff" opacity="0.94" />
            <circle cx="2.5" cy="24" r="1.8" fill="#17202a" /><circle cx="17.5" cy="24" r="1.8" fill="#17202a" />
          </g>
          <g transform="translate(106 25)">
            <ellipse cx="9" cy="35" rx="11" ry="2.5" fill="rgba(0,0,0,0.2)" />
            <path d="M2 7Q3 2 9 1Q15 2 16 7V31Q14 35 9 36Q4 35 2 31Z" fill="#f59e0b" stroke="#a65f13" stroke-width="1.2" />
            <path d="M4.2 8h9.6" stroke="#fff1ce" stroke-width="1.4" stroke-linecap="round" />
            <rect x="4.2" y="9.5" width="9.6" height="5.8" rx="2.4" fill="#dff3ff" opacity="0.9" />
            <path d="M4 19h10M4 25h10" stroke="rgba(255,255,255,0.42)" stroke-width="1.25" />
            <circle cx="2.4" cy="29" r="1.6" fill="#1d2730" /><circle cx="15.6" cy="29" r="1.6" fill="#1d2730" />
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state, players, canAct }) {
    ensureTraficoStyles();
    const isStopped = state.status !== "playing";
    const isCrashed = state.status === "game-over";
    const statusClass = `${isStopped ? " is-stopped" : ""}${isCrashed ? " is-crashed" : ""}`;
    return `
      <section
        class="traffic-shell${statusClass}"
        data-traffic-root
        data-traffic-status="${escapeHtml(state.status)}"
        data-traffic-profile="${escapeHtml(state.viewportProfile)}"
        data-traffic-lanes="${escapeHtml(String(state.laneCount))}"
        style="--traffic-road-max:${state.roadMaxWidth}px;--traffic-lane-count:${state.laneCount};"
      >
        ${renderRoad(state)}
        ${renderSidePanel(state, players, canAct)}
      </section>
    `;
  },
  patchBoardElement(boardWrap, { state, players, canAct }) {
    ensureTraficoStyles();
    const root = boardWrap.querySelector("[data-traffic-root]");
    if (!root) {
      return false;
    }

    root.dataset.trafficStatus = state.status;
    root.classList.toggle("is-stopped", state.status !== "playing");
    root.classList.toggle("is-crashed", state.status === "game-over");

    syncTrafficEntities(root, state);
    syncTrafficOverlay(root, state);
    syncTrafficHud(root, state, players, canAct);
    return true;
  },
  formatResult({ state }) {
    if (state.status === "objective-complete") {
      return {
        title: `Objetivo cumplido: ${objectiveLabel(state.objectiveType)}`,
        subtitle: `Distancia ${state.distance} · Adelantamientos ${state.overtakes} · Recogidas ${state.pickups}.`,
        iconText: "🏁",
        iconClass: "win"
      };
    }

    if (state.status === "game-over") {
      const subtitle = state.mode === "infinite"
        ? `${state.isNewBest ? "Nuevo mejor tiempo. " : ""}Tiempo ${formatTime(state.elapsedMs)} · Puntuacion ${state.score}.`
        : `Te faltaron ${Math.max(0, state.objectiveTarget - currentObjectiveValue(state))} para completar ${objectiveLabel(state.objectiveType).toLowerCase()}.`;
      return {
        title: state.mode === "infinite" ? "Fin de la carrera" : "Objetivo fallido",
        subtitle,
        iconText: "×",
        iconClass: "draw"
      };
    }

    return null;
  }
};
