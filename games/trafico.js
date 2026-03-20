const LANE_COUNT = 3;
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
const TRAJECTORY_LOOKAHEAD_STEPS = 11;
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

const PATTERN_POOLS = Object.freeze([
  Object.freeze([[], [], [0], [1], [2], [0, 2], [0], [1], [2]]),
  Object.freeze([[], [0], [1], [2], [0, 2], [0], [2], [0, 2], [1]]),
  Object.freeze([[], [0], [1], [2], [0, 2], [0], [2], [0, 2], [1], [0, 2]]),
  Object.freeze([[0], [1], [2], [0, 2], [0], [2], [0, 2], [1], [0, 2], []]),
  Object.freeze([[0], [1], [2], [0, 2], [0], [2], [0, 2], [1], [0, 2], [0], [2]]),
  Object.freeze([[0], [1], [2], [0, 2], [0], [2], [0, 2], [1], [0, 2], [0], [2], []])
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

function computeTickMs(distance) {
  const stage = Math.min(PATTERN_POOLS.length - 1, Math.floor(distance / 8));
  return {
    difficultyLevel: stage,
    tickMs: Math.max(MIN_TICK_MS, BASE_TICK_MS - stage * 36)
  };
}

function projectedThreat(entity, futureStep) {
  if (entity.type !== "rival") {
    return false;
  }
  const futureCenter = entityCenterY(entity) + futureStep * STEP_DISTANCE;
  return Math.abs(futureCenter - playerCenterY()) <= COLLISION_BAND;
}

function buildReachableLanes(entities, startLane) {
  let reachable = new Set([startLane]);

  // Valida una pequeña trayectoria real: desde la posicion actual o una alcanzable
  // inmediatamente hasta que el nuevo rival entra en la zona de riesgo del jugador.
  for (let futureStep = 1; futureStep <= TRAJECTORY_LOOKAHEAD_STEPS; futureStep += 1) {
    const blocked = new Set(
      entities
        .filter((entity) => projectedThreat(entity, futureStep))
        .map((entity) => entity.lane)
    );

    const next = new Set();
    for (const lane of reachable) {
      for (const candidate of [lane - 1, lane, lane + 1]) {
        if (candidate < 0 || candidate >= LANE_COUNT) {
          continue;
        }
        if (!blocked.has(candidate)) {
          next.add(candidate);
        }
      }
    }

    if (next.size === 0) {
      return null;
    }
    reachable = next;
  }

  return reachable;
}

function isSafeSpawn(entities, playerLane) {
  return Boolean(buildReachableLanes(entities, playerLane));
}

function buildRivalCandidates(state, pattern, difficultyLevel, baseEntities) {
  const baseCars = pattern.map((lane) => createPreviewEntity("rival", lane, SPAWN_Y, "car"));

  if (
    pattern.length !== 1 ||
    difficultyLevel < TRUCK_MIN_DIFFICULTY ||
    baseEntities.some((entity) => entity.type === "rival" && entity.variant === "truck") ||
    nextRandom(state) >= TRUCK_SPAWN_CHANCE
  ) {
    return [baseCars];
  }

  return [
    [createPreviewEntity("rival", pattern[0], SPAWN_Y, "truck")],
    baseCars
  ];
}

function maybeSpawnPickup(state, baseEntities, spawnVehicles, playerLane) {
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
    Array.from({ length: LANE_COUNT }, (_, lane) => lane).filter(
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
    if (isSafeSpawn(nextEntities, playerLane)) {
      return candidate;
    }
  }

  return null;
}

function chooseSpawn(state, baseEntities, playerLane) {
  const mustRest = state.respiteTicks > 0 || state.spawnStreak >= 3;
  const stage = clamp(state.difficultyLevel, 0, PATTERN_POOLS.length - 1);
  const patternPool = mustRest ? [[], [], [], []] : PATTERN_POOLS[stage];
  const orderedPatterns = shuffleWithState(state, patternPool);

  let selectedVehicles = [];

  outerLoop:
  for (const pattern of orderedPatterns) {
    const rivalCandidates = buildRivalCandidates(state, pattern, stage, baseEntities);
    for (const vehicles of rivalCandidates) {
      const nextEntities = [...baseEntities, ...vehicles];
      if (isSafeSpawn(nextEntities, playerLane)) {
        selectedVehicles = vehicles;
        break outerLoop;
      }
    }
  }

  const pickup = maybeSpawnPickup(state, baseEntities, selectedVehicles, playerLane);
  return {
    cars: selectedVehicles.map((entity) => createEntity(state, "rival", entity.lane, SPAWN_Y, entity.variant || "car")),
    pickup: pickup ? createEntity(state, "pickup", pickup.lane, pickup.y) : null
  };
}

function buildFreshState(options) {
  const normalizedMode = normalizeMode(options?.mode);
  const normalizedObjective = normalizeObjectiveType(options?.objectiveType);
  const difficulty = computeTickMs(0);
  const randomSeed = ((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 4294967295)) >>> 0;

  return {
    mode: normalizedMode,
    objectiveType: normalizedObjective,
    objectiveTarget: getObjectiveTarget(normalizedObjective),
    status: "ready",
    playerLane: 1,
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
  const difficulty = computeTickMs(state.distance);
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
  const spawn = chooseSpawn(state, state.entities, state.playerLane);
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
      kind: "player",
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
  if (kind === "player") {
    return "traffic-player-car";
  }
  if (kind === "pickup") {
    return "traffic-pickup-coin";
  }
  if (kind === "truck") {
    return "traffic-rival-truck";
  }
  return "traffic-rival-car";
}

function roadScrollPx(state) {
  const loop = ROAD_SCROLL_PX_PER_STEP;
  return ((currentTravelSteps(state) * loop) % loop).toFixed(2);
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
      <span class="${entityVisualClass(entity.kind)}" aria-hidden="true"></span>
    </span>
  `;
}

function renderRoad(state) {
  const entities = buildRenderableEntities(state).map(renderTrafficEntity).join("");

  return `
    <div class="traffic-road-frame">
      <div class="traffic-road" data-traffic-road style="--traffic-scroll-px:${roadScrollPx(state)}px;">
        <div class="traffic-road-surface">
          <div class="traffic-road-flow" aria-hidden="true"></div>
          <span class="traffic-lane-divider is-left" aria-hidden="true"></span>
          <span class="traffic-lane-divider is-right" aria-hidden="true"></span>
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

  return `
    <aside class="traffic-side">
      <article class="traffic-side-card traffic-status-card">
        <div class="traffic-hud-main">
          <div class="traffic-hud-copy">
            <div class="traffic-mode-row">
              <span class="traffic-mode-pill" data-traffic-mode-label>${escapeHtml(modeLabel(state.mode))}</span>
              <span class="traffic-mode-pill is-soft" data-traffic-status-label>${escapeHtml(statusLabel(state.status))}</span>
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
      </article>

      <article class="traffic-side-card traffic-secondary-card">
        <div class="traffic-secondary-head">
          <h4>Detalle</h4>
          <p class="traffic-side-note">Metricas secundarias</p>
        </div>
        ${renderSecondaryStats(state)}
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

  const visual = document.createElement("span");
  visual.className = entityVisualClass(entity.kind);
  visual.setAttribute("aria-hidden", "true");
  node.append(visual);
  return node;
}

function syncTrafficEntityVisual(node, kind) {
  const visual = node.firstElementChild;
  if (visual instanceof HTMLElement) {
    visual.className = entityVisualClass(kind);
  }
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
    { title: "Flujo", text: "La carretera avanza de forma continua. El coche del jugador sigue limitado a tres carriles logicos." },
    { title: "Colision", text: "Si un coche rival coincide con tu carril y tu zona de impacto, la partida termina al instante." },
    { title: "Monedas", text: "Solo aparece una moneda activa a la vez. Suma puntuacion y cuenta para el objetivo de Recogidas." },
    { title: "Adelantamientos", text: "Un adelantamiento cuenta cuando un coche rival sale por abajo de la carretera sin chocar contigo." }
  ],
  getDefaultOptions() {
    return {
      mode: "infinite",
      objectiveType: "distance"
    };
  },
  normalizeOptions(options = {}) {
    const mode = normalizeMode(options.mode);
    return {
      mode,
      objectiveType: normalizeObjectiveType(options.objectiveType)
    };
  },
  renderConfigPanel({ options }) {
    const mode = normalizeMode(options?.mode);
    const objectiveType = normalizeObjectiveType(options?.objectiveType);

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
      next.playerLane = clamp(next.playerLane - 1, 0, LANE_COUNT - 1);
      return { ok: true, state: next };
    }

    if (action.type === "steer-right") {
      if (next.status !== "playing") {
        return { ok: false, reason: "invalid" };
      }
      next.playerLane = clamp(next.playerLane + 1, 0, LANE_COUNT - 1);
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
              <stop offset="0%" stop-color="#41505a" />
              <stop offset="100%" stop-color="#2f3940" />
            </linearGradient>
            <linearGradient id="trafficShoulder" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#e9d8b5" />
              <stop offset="100%" stop-color="#d8bf8f" />
            </linearGradient>
          </defs>
          <rect x="14" y="10" width="132" height="74" rx="18" fill="#f5ecdb" stroke="#dbc7a4" />
          <rect x="28" y="14" width="104" height="66" rx="18" fill="url(#trafficRoad)" />
          <rect x="22" y="14" width="8" height="66" rx="6" fill="url(#trafficShoulder)" />
          <rect x="130" y="14" width="8" height="66" rx="6" fill="url(#trafficShoulder)" />
          <path d="M62 18V76" stroke="#f7f0e0" stroke-width="2.8" stroke-dasharray="6 6" opacity="0.84" />
          <path d="M98 18V76" stroke="#f7f0e0" stroke-width="2.8" stroke-dasharray="6 6" opacity="0.84" />
          <rect x="37" y="22" width="18" height="26" rx="7" fill="#ff8051" />
          <rect x="41.5" y="26" width="9" height="7" rx="2.5" fill="#dff3ff" opacity="0.82" />
          <rect x="105" y="30" width="18" height="26" rx="7" fill="#5db06d" />
          <rect x="109.5" y="34" width="9" height="7" rx="2.5" fill="#dff3ff" opacity="0.82" />
          <rect x="69" y="52" width="22" height="29" rx="8" fill="#3f84ff" />
          <rect x="74" y="57" width="12" height="8" rx="2.8" fill="#dff3ff" opacity="0.9" />
          <circle cx="113" cy="67" r="8" fill="#f5c94f" stroke="#d39a1d" stroke-width="2" />
          <circle cx="113" cy="67" r="3.1" fill="#fff6d3" />
        </svg>
      </div>
    `;
  },
  renderBoard({ state, players, canAct }) {
    return `
      <section class="traffic-shell" data-traffic-root>
        ${renderRoad(state)}
        ${renderSidePanel(state, players, canAct)}
      </section>
    `;
  },
  patchBoardElement(boardWrap, { state, players, canAct }) {
    const root = boardWrap.querySelector("[data-traffic-root]");
    if (!root) {
      return false;
    }

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
        iconText: "✓",
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
        iconText: "!",
        iconClass: "draw"
      };
    }

    return null;
  }
};
