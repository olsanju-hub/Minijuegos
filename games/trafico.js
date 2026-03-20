const LANE_COUNT = 3;
const VISIBLE_ROWS = 8;
const PLAYER_ROW = VISIBLE_ROWS - 2;
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
  Object.freeze([[], [0], [1], [2], [0, 2], [0, 1], [1, 2], [0], [2]]),
  Object.freeze([[], [0], [1], [2], [0, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2]]),
  Object.freeze([[0], [1], [2], [0, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2], []]),
  Object.freeze([[0], [1], [2], [0, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2], [0], [2]]),
  Object.freeze([[0], [1], [2], [0, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2], [0, 2], []])
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

function cloneEntity(entity) {
  return { ...entity };
}

function cloneState(state) {
  return {
    ...state,
    entities: state.entities.map(cloneEntity)
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

function createEntity(state, type, lane, row) {
  const nextId = state.nextEntityId + 1;
  state.nextEntityId = nextId;
  return {
    id: `traffic-${nextId}`,
    type,
    lane,
    row
  };
}

function computeTickMs(distance) {
  const stage = Math.min(PATTERN_POOLS.length - 1, Math.floor(distance / 8));
  return {
    difficultyLevel: stage,
    tickMs: Math.max(MIN_TICK_MS, BASE_TICK_MS - stage * 36)
  };
}

function buildReachableLanes(entities, startLane) {
  let reachable = new Set([startLane]);
  for (let futureTick = 1; futureTick <= 3; futureTick += 1) {
    const blocked = new Set(
      entities
        .filter((entity) => entity.type === "rival" && entity.row + futureTick === PLAYER_ROW)
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

function maybeSpawnPickup(state, baseEntities, carPattern, playerLane) {
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
    Array.from({ length: LANE_COUNT }, (_, lane) => lane).filter((lane) => !carPattern.includes(lane))
  );

  for (const lane of freeLanes) {
    const candidate = { type: "pickup", lane, row: 0 };
    if (isSafeSpawn([...baseEntities, ...carPattern.map((item) => ({ type: "rival", lane: item, row: 0 })), candidate], playerLane)) {
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

  let selectedPattern = [];
  for (const pattern of orderedPatterns) {
    const nextEntities = [...baseEntities, ...pattern.map((lane) => ({ type: "rival", lane, row: 0 }))];
    if (isSafeSpawn(nextEntities, playerLane)) {
      selectedPattern = pattern;
      break;
    }
  }

  const pickup = maybeSpawnPickup(state, baseEntities, selectedPattern, playerLane);
  return {
    cars: selectedPattern.map((lane) => createEntity(state, "rival", lane, 0)),
    pickup: pickup ? createEntity(state, "pickup", pickup.lane, 0) : null,
    rested: mustRest
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
    pendingInput: null,
    entities: [],
    distance: 0,
    overtakes: 0,
    pickups: 0,
    score: 0,
    elapsedMs: 0,
    tickCount: 0,
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
  state.pendingInput = null;
  if (message) {
    state.lastEvent = message;
  }
}

function setPauseState(state) {
  state.status = "paused";
  state.pendingInput = null;
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
  state.pendingInput = null;
  state.lastEvent = message;
  persistBestIfNeeded(state);
}

function runTick(state) {
  if (state.status !== "playing") {
    return { ok: false, reason: "invalid" };
  }

  const laneDelta = state.pendingInput === "left" ? -1 : state.pendingInput === "right" ? 1 : 0;
  state.playerLane = clamp(state.playerLane + laneDelta, 0, LANE_COUNT - 1);
  state.pendingInput = null;

  let entities = state.entities.map((entity) => ({
    ...entity,
    row: entity.row + 1
  }));

  const exitingCars = entities.filter((entity) => entity.type === "rival" && entity.row >= VISIBLE_ROWS).length;
  entities = entities.filter((entity) => entity.row < VISIBLE_ROWS);

  const spawn = chooseSpawn(state, entities, state.playerLane);
  entities.push(...spawn.cars);
  if (spawn.pickup) {
    entities.push(spawn.pickup);
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

  const collision = entities.find(
    (entity) => entity.type === "rival" && entity.row === PLAYER_ROW && entity.lane === state.playerLane
  );
  const collected = entities.filter(
    (entity) => entity.type === "pickup" && entity.row === PLAYER_ROW && entity.lane === state.playerLane
  );

  if (collected.length > 0) {
    const collectedIds = new Set(collected.map((item) => item.id));
    entities = entities.filter((entity) => !collectedIds.has(entity.id));
    state.pickups += collected.length;
    state.lastPickupTick = state.tickCount + 1;
  }

  state.entities = entities;
  state.distance += 1;
  state.overtakes += exitingCars;
  state.elapsedMs += state.tickMs;
  state.tickCount += 1;
  updateDerivedStats(state);
  updateScore(state, exitingCars, collected.length);

  if (collision) {
    state.lastCollision = { lane: state.playerLane, row: PLAYER_ROW };
    completeRun(state, "game-over", "Colision. Fin de la partida.");
    return { ok: true, state };
  }

  if (state.mode === "objectives" && currentObjectiveValue(state) >= state.objectiveTarget) {
    completeRun(state, "objective-complete", "Objetivo cumplido.");
    return { ok: true, state };
  }

  if (collected.length > 0) {
    state.lastEvent = "Moneda recogida.";
  } else if (exitingCars > 0) {
    state.lastEvent = exitingCars > 1 ? "Buen tramo: has adelantado varios coches." : "Adelantamiento limpio.";
  }

  return { ok: true, state };
}

function entityByPosition(entities) {
  const map = new Map();
  for (const entity of entities) {
    map.set(`${entity.row}:${entity.lane}`, entity);
  }
  return map;
}

function renderStatusOverlay(state) {
  if (state.status === "playing") {
    return "";
  }

  const copy =
    state.status === "paused"
      ? { title: "Pausa", text: "Pulsa Reanudar para seguir." }
      : state.status === "objective-complete"
        ? { title: "Objetivo cumplido", text: "La partida ha terminado." }
        : state.status === "game-over"
          ? { title: "Game over", text: "Has chocado con otro coche." }
          : { title: "Listo", text: "Pulsa Empezar para arrancar." };

  return `
    <div class="traffic-road-overlay">
      <p class="traffic-road-overlay-title">${escapeHtml(copy.title)}</p>
      <p class="traffic-road-overlay-text">${escapeHtml(copy.text)}</p>
    </div>
  `;
}

function renderCell(row, lane, state, entityMap) {
  const entity = entityMap.get(`${row}:${lane}`) || null;
  const isPlayer = row === PLAYER_ROW && lane === state.playerLane;
  const hasCollision = Boolean(state.lastCollision) && state.lastCollision.row === row && state.lastCollision.lane === lane;
  const classes = ["traffic-cell", `lane-${lane}`];

  if (isPlayer) {
    classes.push("has-player");
  }
  if (entity) {
    classes.push(`has-${entity.type}`);
  }
  if (hasCollision) {
    classes.push("is-collision");
  }

  return `
    <div class="${classes.join(" ")}">
      <span class="traffic-cell-surface" aria-hidden="true"></span>
      ${entity && entity.type === "rival" ? '<span class="traffic-rival-car" aria-hidden="true"></span>' : ""}
      ${entity && entity.type === "pickup" ? '<span class="traffic-pickup-coin" aria-hidden="true"></span>' : ""}
      ${isPlayer ? '<span class="traffic-player-car" aria-hidden="true"></span>' : ""}
    </div>
  `;
}

function renderRoad(state) {
  const entityMap = entityByPosition(state.entities);
  const rows = Array.from({ length: VISIBLE_ROWS }, (_, row) =>
    Array.from({ length: LANE_COUNT }, (_, lane) => renderCell(row, lane, state, entityMap)).join("")
  ).join("");

  return `
    <div class="traffic-road-frame">
      <div class="traffic-road">
        <div class="traffic-road-surface">
          <div class="traffic-grid">${rows}</div>
        </div>
        ${renderStatusOverlay(state)}
      </div>
    </div>
  `;
}

function renderStat(label, value, tone = "") {
  return `
    <div class="traffic-stat ${tone ? `is-${tone}` : ""}">
      <span class="traffic-stat-label">${escapeHtml(label)}</span>
      <strong class="traffic-stat-value">${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderBoardControls(state, canAct) {
  const isReady = state.status === "ready";
  const isPaused = state.status === "paused";
  const isPlaying = state.status === "playing";
  const primaryAction = isReady ? "start-run" : isPaused ? "toggle-pause" : "toggle-pause";
  const primaryLabel = isReady ? "Empezar" : isPaused ? "Reanudar" : "Pausa";

  return `
    <div class="traffic-control-row">
      <button
        class="btn btn-secondary traffic-control-btn"
        data-action="game-action"
        data-game-action="steer-left"
        ${canAct && isPlaying ? "" : "disabled"}
      >
        Izquierda
      </button>
      <button
        class="btn ${isPlaying ? "btn-secondary" : "btn-primary"} traffic-control-btn is-primary"
        data-action="game-action"
        data-game-action="${primaryAction}"
        ${canAct && (isReady || isPaused || isPlaying) ? "" : "disabled"}
      >
        ${primaryLabel}
      </button>
      <button
        class="btn btn-secondary traffic-control-btn"
        data-action="game-action"
        data-game-action="steer-right"
        ${canAct && isPlaying ? "" : "disabled"}
      >
        Derecha
      </button>
    </div>
  `;
}

function objectiveProgressText(state) {
  if (state.mode !== "objectives") {
    return "Aguanta lo máximo posible.";
  }
  return `${objectiveLabel(state.objectiveType)}: ${currentObjectiveValue(state)} / ${state.objectiveTarget}`;
}

function modeLabel(mode) {
  return mode === "objectives" ? "Objetivos" : "Infinito";
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
    { title: "Tick", text: "Cada tick mueve el trafico una fila, resuelve spawns seguros, recoge monedas, cuenta adelantamientos y aumenta la dificultad." },
    { title: "Colision", text: "Si un coche rival alcanza tu misma fila y carril, la partida termina al instante." },
    { title: "Monedas", text: "Las monedas suman puntuacion y cuentan para el objetivo de Recogidas." },
    { title: "Adelantamientos", text: "Un adelantamiento cuenta cuando un coche rival sale por abajo de la rejilla sin chocar contigo." }
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

    if (action.type === "steer-left" || action.type === "steer-right") {
      if (next.status !== "playing") {
        return { ok: false, reason: "invalid" };
      }
      next.pendingInput = action.type === "steer-left" ? "left" : "right";
      return { ok: true, state: next };
    }

    if (action.type === "tick") {
      return runTick(next);
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
    const activePlayer = players[0];
    const isInfinite = state.mode === "infinite";
    const primaryButtonAction = state.status === "ready" ? "start-run" : "toggle-pause";
    const primaryButtonLabel =
      state.status === "ready" ? "Empezar" : state.status === "paused" ? "Reanudar" : "Pausa";

    return `
      <section class="traffic-shell">
        ${renderRoad(state)}

        <aside class="traffic-side">
          <article class="traffic-side-card traffic-status-card">
            <div class="traffic-mode-row">
              <span class="traffic-mode-pill">${escapeHtml(modeLabel(state.mode))}</span>
              <span class="traffic-mode-pill is-soft">${escapeHtml(statusLabel(state.status))}</span>
            </div>
            <h4>${escapeHtml(activePlayer ? activePlayer.name : "Jugador")}</h4>
            <p class="traffic-side-note">${escapeHtml(objectiveProgressText(state))}</p>
            <p class="traffic-side-note">${escapeHtml(state.lastEvent || "")}</p>
            <button
              class="btn ${state.status === "playing" ? "btn-secondary" : "btn-primary"} traffic-primary-btn"
              data-action="game-action"
              data-game-action="${primaryButtonAction}"
              ${canAct && ["ready", "paused", "playing"].includes(state.status) ? "" : "disabled"}
            >
              ${primaryButtonLabel}
            </button>
          </article>

          <article class="traffic-side-card traffic-stats-card">
            <div class="traffic-stat-grid">
              ${renderStat("Modo", modeLabel(state.mode))}
              ${renderStat("Objetivo", state.mode === "objectives" ? `${objectiveLabel(state.objectiveType)} ${currentObjectiveValue(state)}/${state.objectiveTarget}` : "Mejor tiempo")}
              ${renderStat("Distancia", String(state.distance))}
              ${renderStat("Puntuacion", String(state.score))}
              ${renderStat("Tiempo", formatTime(state.elapsedMs), "time")}
              ${renderStat("Adelantamientos", String(state.overtakes))}
              ${renderStat("Recogidas", String(state.pickups))}
              ${renderStat("Mejor", isInfinite ? formatTime(state.bestInfiniteMs) : "-", "record")}
            </div>
          </article>

          <article class="traffic-side-card traffic-controls-card">
            <h4>Controles</h4>
            <p class="traffic-side-note">Cambia de carril con izquierda y derecha. Pausa cuando lo necesites.</p>
            ${renderBoardControls(state, canAct)}
          </article>
        </aside>
      </section>
    `;
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
