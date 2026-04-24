const FOOTBALL_STYLE_ID = "minijuegos-football-turns";

const TEAM_SIZE_OPTIONS = [3, 5];
const GOALS_TO_WIN_OPTIONS = [3, 5];

const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 620;
const GOAL_MOUTH_HEIGHT = 188;
const GOAL_DEPTH = 44;
const FOOTBALL_VIEWBOX_WIDTH = FIELD_WIDTH + GOAL_DEPTH * 2;
const FOOTBALL_VIEWBOX_HEIGHT = FIELD_HEIGHT;
const FOOTBALL_VIEWBOX_ASPECT = FOOTBALL_VIEWBOX_WIDTH / FOOTBALL_VIEWBOX_HEIGHT;

const PLAYER_RADIUS = 27;
const BALL_RADIUS = 14;

const MAX_DRAG_DISTANCE = 132;
const MIN_SHOT_DISTANCE = 16;
const MAX_SHOT_SPEED = 1460;

const PLAYER_DECEL = 1360;
const BALL_DECEL = 1080;
const WALL_BOUNCE = 0.82;
const PLAYER_PLAYER_RESTITUTION = 0.84;
const PLAYER_BALL_RESTITUTION = 0.91;
const PLAYER_MASS = 1.18;
const BALL_MASS = 0.78;

const STOP_SPEED = 18;
const SETTLE_TIME_MS = 160;
const GOAL_PAUSE_MS = 920;
const MAX_SIM_STEP_MS = 16;

const TEAM_META = Object.freeze([
  {
    name: "Equipo coral",
    short: "Coral",
    fill: "#e6775d",
    stroke: "#bf5a43",
    glow: "rgba(230, 119, 93, 0.22)",
    soft: "#fff1eb"
  },
  {
    name: "Equipo azul",
    short: "Azul",
    fill: "#4f84ea",
    stroke: "#355fb9",
    glow: "rgba(79, 132, 234, 0.22)",
    soft: "#eef4ff"
  }
]);

const FOOTBALL_STYLES = String.raw`
/* GLOBAL OVERRIDES PARA MAXIMIZAR ESPACIO MOVIL */
@media (max-width: 1024px) {
  .app-shell:not(.app-shell-home) .screen.game-screen-futbol-turnos {
    position: relative;
    display: block !important;
    padding: 0 !important;
    gap: 0 !important;
    width: 100%;
    height: var(--app-dvh, 100dvh);
    max-height: var(--app-dvh, 100dvh);
    border-radius: 0;
    overflow: hidden;
  }

  .game-screen-futbol-turnos .topbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: transparent !important;
    border: none !important;
    pointer-events: none;
    padding: 12px !important;
  }

  .game-screen-futbol-turnos .topbar * {
    pointer-events: auto;
  }

  .game-screen-futbol-turnos .topbar-title,
  .game-screen-futbol-turnos .topbar-sub,
  .game-screen-futbol-turnos .topbar .btn-icon-text {
    display: none !important;
  }

  .game-screen-futbol-turnos .actions-bottom {
    display: none !important;
  }

  .game-screen-futbol-turnos .game-shell-body {
    position: absolute;
    inset: 0;
    display: block !important;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .game-screen-futbol-turnos .game-stage-layout,
  .game-screen-futbol-turnos .game-stage-main,
  .game-screen-futbol-turnos .board-wrap {
    display: block !important;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    overflow: hidden;
  }
}

.football-shell {
  --football-field-width: min(1200px, 100%);
  --football-field-height: min(740px, 100%);
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
  align-items: stretch;
  justify-content: stretch;
  padding: 8px;
  background: radial-gradient(circle at center, rgba(24, 97, 76, 0.05), transparent), #f8f6f0;
  border-radius: 20px;
  overflow: hidden;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .football-shell {
    gap: 4px;
    padding: 0;
    border-radius: 0;
  }
}

.football-stage {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.football-field {
  position: relative;
  z-index: 1;
  display: block;
  width: var(--football-field-width);
  height: var(--football-field-height);
  max-width: none;
  max-height: none;
  padding: 0;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  box-sizing: border-box;
}

@media (max-width: 1024px) and (orientation: portrait) {
  .football-field {
    padding: 0;
    transform: rotate(90deg);
    transform-origin: center center;
  }
}

@media (max-width: 1024px) and (orientation: landscape) {
  .football-shell {
    grid-template-columns: 78px minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    gap: 4px;
    padding: 6px 6px 6px max(8px, env(safe-area-inset-left));
  }

  .football-field {
    padding: 0;
  }
}

.football-mobile-hud {
  position: relative;
  justify-self: center;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 20px;
  width: fit-content;
  max-width: calc(100% - 32px);
  margin-top: max(8px, env(safe-area-inset-top));
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 7px 22px;
  border-radius: 99px;
  box-shadow: 0 8px 24px rgba(30, 40, 35, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1);
  border: 1px solid rgba(210, 205, 190, 0.6);
  pointer-events: none;
}

.hud-team {
  font-weight: 860;
  font-size: 1.5rem;
  line-height: 1;
  opacity: 0.35;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: grayscale(0.5);
}

.hud-team.is-active {
  opacity: 1;
  filter: grayscale(0);
  transform: scale(1.1);
}

.hud-team-0 {
  color: #bf5a43;
}

.hud-team-1 {
  color: #355fb9;
}

.hud-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 110px;
}

.hud-center .turn-text {
  font-size: 0.75rem;
  font-weight: 800;
  color: #213029;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

@media (max-width: 1024px) and (orientation: landscape) {
  .football-mobile-hud {
    width: 100%;
    max-width: none;
    align-self: center;
    justify-self: stretch;
    flex-direction: column;
    gap: 9px;
    padding: 10px 4px;
    border-radius: 24px;
  }

  .hud-center {
    min-width: 0;
  }

  .hud-center .turn-text {
    max-width: 64px;
    white-space: normal;
    text-align: center;
    line-height: 1.05;
    font-size: 0.58rem;
  }
}

.football-field-frame {
  fill: #f6f1e7;
  stroke: #d3c3a7;
  stroke-width: 2;
}

.football-field-pitch {
  fill: url(#footballPitchFill);
  stroke: #d7cfbd;
  stroke-width: 1.8;
}

.football-field-ambient {
  fill: url(#footballPitchAmbient);
  opacity: 0.82;
}

.football-pitch-grid {
  fill: url(#footballPitchPattern);
  opacity: 0.16;
}

.football-pitch-stripe {
  fill: rgba(255, 255, 255, 0.06);
}

.football-field-grain {
  opacity: 0.1;
}

.football-goal-net {
  fill: rgba(240, 247, 244, 0.42);
  stroke: rgba(214, 223, 219, 0.78);
  stroke-width: 1.5;
}

.football-goal-net.team-0-net {
  fill: rgba(230, 119, 93, 0.25);
  stroke: rgba(191, 90, 67, 0.6);
}

.football-goal-net.team-1-net {
  fill: rgba(79, 132, 234, 0.25);
  stroke: rgba(53, 95, 185, 0.6);
}

.football-goal-grid {
  stroke: rgba(226, 235, 231, 0.42);
  stroke-width: 1.2;
}

.football-goal-frame {
  fill: none;
  stroke: rgba(242, 248, 245, 0.94);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.football-goal-frame.team-0-frame {
  stroke: rgba(230, 119, 93, 0.8);
}

.football-goal-frame.team-1-frame {
  stroke: rgba(79, 132, 234, 0.8);
}

.football-pitch-mark {
  fill: none;
  stroke: rgba(248, 247, 242, 0.72);
  stroke-width: 4;
  stroke-linecap: round;
}

.football-piece {
  cursor: pointer;
  --football-piece-fill: #e6775d;
  --football-piece-stroke: #bf5a43;
  --football-piece-shadow: rgba(47, 39, 34, 0.22);
  --football-piece-ring: rgba(255, 255, 255, 0.22);
}

.football-piece.is-team-0 {
  --football-piece-fill: #e6775d;
  --football-piece-stroke: #bf5a43;
}

.football-piece.is-team-1 {
  --football-piece-fill: #4f84ea;
  --football-piece-stroke: #355fb9;
}

.football-piece-shadow {
  fill: var(--football-piece-shadow);
}

.football-piece-core {
  fill: var(--football-piece-fill);
  stroke: var(--football-piece-stroke);
  stroke-width: 4.2;
  paint-order: stroke;
  filter: drop-shadow(0 6px 12px rgba(10, 20, 15, 0.4)) drop-shadow(0 2px 4px rgba(10, 20, 15, 0.3));
  transition: filter 140ms ease, stroke-width 140ms ease;
}

.football-piece-rim {
  fill: none;
  stroke: var(--football-piece-ring);
  stroke-width: 2.2;
}

.football-piece-panel {
  fill: rgba(255, 255, 255, 0.14);
}

.football-piece.is-clickable:hover .football-piece-core {
  filter: drop-shadow(0 8px 10px rgba(39, 43, 48, 0.2));
}

.football-piece-detail {
  fill: rgba(255, 255, 255, 0.9);
}

.football-piece-gloss {
  fill: rgba(255, 255, 255, 0.26);
}

.football-piece.is-turn-team .football-piece-core {
  filter:
    drop-shadow(0 10px 14px rgba(39, 43, 48, 0.18))
    drop-shadow(0 0 0 rgba(0, 0, 0, 0));
}

@keyframes footballTurnPulse {
  0%,
  100% {
    opacity: 0.46;
    stroke-width: 6;
  }

  50% {
    opacity: 0.9;
    stroke-width: 8;
  }
}

.football-turn-ring {
  fill: none;
  stroke-width: 6;
  opacity: 0;
}

.football-piece.is-turn-team .football-turn-ring {
  opacity: 1;
  animation: footballTurnPulse 2200ms ease-in-out infinite;
}

.football-piece.is-team-0 .football-turn-ring {
  stroke: rgba(230, 119, 93, 0.28);
}

.football-piece.is-team-1 .football-turn-ring {
  stroke: rgba(79, 132, 234, 0.28);
}

.football-ball-shadow {
  fill: rgba(46, 43, 38, 0.14);
}

.football-ball-shell {
  fill: #fffaf1;
  stroke: #d6c4a2;
  stroke-width: 2.2;
}

.football-ball-ring {
  fill: none;
  stroke: rgba(255, 255, 255, 0.48);
  stroke-width: 1.8;
}

.football-ball-seam {
  fill: #d8c39a;
}

.football-ball-highlight {
  fill: rgba(255, 255, 255, 0.86);
}

.football-aim-line {
  stroke-linecap: round;
  filter: drop-shadow(0 6px 10px rgba(34, 53, 45, 0.12));
}

.football-aim-line.is-pull {
  stroke: rgba(72, 105, 90, 0.26);
}

.football-aim-line.is-vector {
  stroke: rgba(83, 113, 97, 0.92);
}

.football-aim-anchor {
  fill: rgba(255, 255, 255, 0.92);
  stroke: rgba(84, 119, 101, 0.92);
  stroke-width: 4;
}

.football-aim-tip {
  fill: rgba(84, 119, 101, 0.22);
  stroke: rgba(84, 119, 101, 0.92);
  stroke-width: 3.2;
}

.football-config-grid {
  display: grid;
  gap: 18px;
}
`;

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

function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function ensureFootballStyles() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(FOOTBALL_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = FOOTBALL_STYLE_ID;
  style.textContent = FOOTBALL_STYLES;
  document.head.appendChild(style);
}

function normalizeTeamSize(value) {
  const numeric = Number(value);
  return TEAM_SIZE_OPTIONS.includes(numeric) ? numeric : 3;
}

function normalizeGoalsToWin(value) {
  const numeric = Number(value);
  return GOALS_TO_WIN_OPTIONS.includes(numeric) ? numeric : 3;
}

function teamMeta(slot) {
  return TEAM_META[slot] || TEAM_META[0];
}

function buildFormation(teamSize) {
  if (teamSize === 5) {
    return [
      { x: 186, y: FIELD_HEIGHT * 0.5 },
      { x: 306, y: FIELD_HEIGHT * 0.28 },
      { x: 306, y: FIELD_HEIGHT * 0.72 },
      { x: 420, y: FIELD_HEIGHT * 0.38 },
      { x: 420, y: FIELD_HEIGHT * 0.62 }
    ];
  }

  return [
    { x: 226, y: FIELD_HEIGHT * 0.5 },
    { x: 362, y: FIELD_HEIGHT * 0.32 },
    { x: 362, y: FIELD_HEIGHT * 0.68 }
  ];
}

function formationForTeam(teamSize, team) {
  const left = buildFormation(teamSize);
  if (team === 0) {
    return left;
  }

  return left.map((point) => ({
    x: FIELD_WIDTH - point.x,
    y: point.y
  }));
}

function createPiece(team, index, x, y) {
  return {
    id: `team-${team}-piece-${index}`,
    team,
    x,
    y,
    vx: 0,
    vy: 0,
    r: PLAYER_RADIUS,
    mass: PLAYER_MASS
  };
}

function createBall() {
  return {
    id: "ball",
    x: FIELD_WIDTH / 2,
    y: FIELD_HEIGHT / 2,
    vx: 0,
    vy: 0,
    r: BALL_RADIUS,
    mass: BALL_MASS
  };
}

function createPieces(teamSize) {
  const left = formationForTeam(teamSize, 0);
  const right = formationForTeam(teamSize, 1);

  return [
    ...left.map((point, index) => createPiece(0, index, point.x, point.y)),
    ...right.map((point, index) => createPiece(1, index, point.x, point.y))
  ];
}

function createMetricsState() {
  return {
    completedTurns: 0,
    totalResolveMs: 0,
    longestResolveMs: 0,
    chaoticTurns: 0,
    goals: 0,
    lastTurns: []
  };
}

function createState(teamSize, goalsToWin) {
  const normalizedTeamSize = normalizeTeamSize(teamSize);
  const normalizedGoalsToWin = normalizeGoalsToWin(goalsToWin);

  return {
    phase: "ready",
    teamSize: normalizedTeamSize,
    goalsToWin: normalizedGoalsToWin,
    turnSlot: 0,
    turnNumber: 1,
    score: [0, 0],
    pieces: createPieces(normalizedTeamSize),
    ball: createBall(),
    goalEvent: null,
    winnerSlot: null,
    lastTouchTeam: null,
    settleSinceMs: null,
    currentTurn: null,
    metrics: createMetricsState()
  };
}

function cloneState(state) {
  return {
    ...state,
    score: [...state.score],
    pieces: state.pieces.map((piece) => ({ ...piece })),
    ball: { ...state.ball },
    goalEvent: state.goalEvent ? { ...state.goalEvent } : null,
    currentTurn: state.currentTurn ? { ...state.currentTurn } : null,
    metrics: state.metrics
      ? {
          ...state.metrics,
          lastTurns: Array.isArray(state.metrics.lastTurns) ? [...state.metrics.lastTurns] : []
        }
      : createMetricsState()
  };
}

function formatModeLabel(state) {
  return `${state.teamSize} fichas por equipo · primero a ${state.goalsToWin}`;
}

function buildStatusCopy(state) {
  if (state.phase === "finished" && Number.isInteger(state.winnerSlot)) {
    return {
      eyebrow: "Partido cerrado",
      title: `Gana ${teamMeta(state.winnerSlot).short}`,
      note: `Final ${state.score[0]} - ${state.score[1]}`
    };
  }

  if (state.phase === "goal" && state.goalEvent) {
    return {
      eyebrow: "Gol",
      title: `Gol de ${teamMeta(state.goalEvent.scorerSlot).short}`,
      note: "Saque rival en curso"
    };
  }

  if (state.phase === "resolving") {
    return {
      eyebrow: "Jugada en curso",
      title: "Esperando el reposo",
      note: "Rebotes y choques activos"
    };
  }

  return {
    eyebrow: `Turno ${state.turnNumber}`,
    title: `Juega ${teamMeta(state.turnSlot).short}`,
    note: `Primero a ${state.goalsToWin}`
  };
}

function resolveFootballLayoutMode(uiState) {
  const viewport = uiState?.viewport || {};
  const width = Number(viewport.width) || 0;
  const height = Number(viewport.height) || 0;
  const isMobile = width > 0 && height > 0 ? width <= 1024 : false;
  if (!isMobile) {
    return "desktop";
  }
  return height >= width ? "mobile-portrait" : "mobile-landscape";
}

function computeFootballFieldMetrics(uiState, layoutMode) {
  if (layoutMode === "desktop") {
    return null;
  }

  const viewport = uiState?.viewport || {};
  const viewportWidth = Math.max(320, Number(viewport.width) || 390);
  const viewportHeight = Math.max(320, Number(viewport.height) || 844);
  const horizontalReserve = layoutMode === "mobile-landscape" ? 92 : 16;
  const verticalReserve = layoutMode === "mobile-landscape" ? 12 : 58;
  const availableWidth = Math.max(260, viewportWidth - horizontalReserve);
  const availableHeight = Math.max(220, viewportHeight - verticalReserve);

  if (layoutMode === "mobile-portrait") {
    const fieldWidth = Math.min(availableHeight, availableWidth * FOOTBALL_VIEWBOX_ASPECT);
    return {
      width: fieldWidth,
      height: fieldWidth / FOOTBALL_VIEWBOX_ASPECT
    };
  }

  const fieldWidth = Math.min(availableWidth, availableHeight * FOOTBALL_VIEWBOX_ASPECT);
  return {
    width: fieldWidth,
    height: fieldWidth / FOOTBALL_VIEWBOX_ASPECT
  };
}

function normalizeVelocity(vx, vy, maxMagnitude) {
  const magnitude = Math.hypot(vx, vy);
  if (!Number.isFinite(magnitude) || magnitude <= 0) {
    return { vx: 0, vy: 0 };
  }
  const capped = Math.min(magnitude, maxMagnitude);
  const scale = capped / magnitude;
  return {
    vx: vx * scale,
    vy: vy * scale
  };
}

function entitySpeed(entity) {
  return Math.hypot(entity.vx, entity.vy);
}

function allObjectsAtRest(state) {
  if (entitySpeed(state.ball) > STOP_SPEED) {
    return false;
  }

  return state.pieces.every((piece) => entitySpeed(piece) <= STOP_SPEED);
}

function applyLinearDeceleration(entity, decel, dt) {
  const speed = entitySpeed(entity);
  if (speed <= 0) {
    entity.vx = 0;
    entity.vy = 0;
    return;
  }

  const nextSpeed = Math.max(0, speed - decel * dt);
  if (nextSpeed <= 0) {
    entity.vx = 0;
    entity.vy = 0;
    return;
  }

  const scale = nextSpeed / speed;
  entity.vx *= scale;
  entity.vy *= scale;
}

function resolvePieceWalls(piece) {
  if (piece.x - piece.r < 0) {
    piece.x = piece.r;
    piece.vx = Math.abs(piece.vx) * WALL_BOUNCE;
  } else if (piece.x + piece.r > FIELD_WIDTH) {
    piece.x = FIELD_WIDTH - piece.r;
    piece.vx = -Math.abs(piece.vx) * WALL_BOUNCE;
  }

  if (piece.y - piece.r < 0) {
    piece.y = piece.r;
    piece.vy = Math.abs(piece.vy) * WALL_BOUNCE;
  } else if (piece.y + piece.r > FIELD_HEIGHT) {
    piece.y = FIELD_HEIGHT - piece.r;
    piece.vy = -Math.abs(piece.vy) * WALL_BOUNCE;
  }
}

function goalBandForBall(ball) {
  const top = FIELD_HEIGHT / 2 - GOAL_MOUTH_HEIGHT / 2 + ball.r * 0.2;
  const bottom = FIELD_HEIGHT / 2 + GOAL_MOUTH_HEIGHT / 2 - ball.r * 0.2;
  return { top, bottom };
}

function resolveBallWalls(ball) {
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.vy = Math.abs(ball.vy) * WALL_BOUNCE;
  } else if (ball.y + ball.r > FIELD_HEIGHT) {
    ball.y = FIELD_HEIGHT - ball.r;
    ball.vy = -Math.abs(ball.vy) * WALL_BOUNCE;
  }

  const goalBand = goalBandForBall(ball);
  const insideGoalBand = ball.y >= goalBand.top && ball.y <= goalBand.bottom;

  if (insideGoalBand) {
    if (ball.x < -ball.r) {
      return 1;
    }
    if (ball.x > FIELD_WIDTH + ball.r) {
      return 0;
    }
    return null;
  }

  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx = Math.abs(ball.vx) * WALL_BOUNCE;
  } else if (ball.x + ball.r > FIELD_WIDTH) {
    ball.x = FIELD_WIDTH - ball.r;
    ball.vx = -Math.abs(ball.vx) * WALL_BOUNCE;
  }

  return null;
}

function resolveCircleCollision(a, b, restitution) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let distance = Math.hypot(dx, dy);
  const minDistance = a.r + b.r;

  if (distance === 0) {
    distance = 0.0001;
  }

  if (distance >= minDistance) {
    return false;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = minDistance - distance;
  const totalMass = a.mass + b.mass;

  a.x -= nx * overlap * (b.mass / totalMass);
  a.y -= ny * overlap * (b.mass / totalMass);
  b.x += nx * overlap * (a.mass / totalMass);
  b.y += ny * overlap * (a.mass / totalMass);

  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const velocityAlongNormal = rvx * nx + rvy * ny;

  if (velocityAlongNormal > 0) {
    return true;
  }

  const impulse =
    (-(1 + restitution) * velocityAlongNormal) /
    ((1 / a.mass) + (1 / b.mass));
  const impulseX = impulse * nx;
  const impulseY = impulse * ny;

  a.vx -= impulseX / a.mass;
  a.vy -= impulseY / a.mass;
  b.vx += impulseX / b.mass;
  b.vy += impulseY / b.mass;
  return true;
}

function finalizeTurnMetrics(state, completedAtMs, goalScored) {
  if (!state.currentTurn) {
    return state;
  }

  const resolveMs = Math.max(0, Number(completedAtMs) - Number(state.currentTurn.startedAtMs || completedAtMs));
  const entry = {
    team: state.currentTurn.team,
    power01: Number(state.currentTurn.power01 || 0),
    touchedBall: Boolean(state.currentTurn.touchedBall),
    collisionCount: Number(state.currentTurn.collisionCount || 0),
    resolveMs,
    goal: Boolean(goalScored)
  };

  const metrics = state.metrics || createMetricsState();
  const history = [...(metrics.lastTurns || []), entry].slice(-10);

  return {
    ...state,
    currentTurn: null,
    metrics: {
      ...metrics,
      completedTurns: Number(metrics.completedTurns || 0) + 1,
      totalResolveMs: Number(metrics.totalResolveMs || 0) + resolveMs,
      longestResolveMs: Math.max(Number(metrics.longestResolveMs || 0), resolveMs),
      chaoticTurns: Number(metrics.chaoticTurns || 0) + (entry.collisionCount >= 7 || resolveMs >= 6000 ? 1 : 0),
      goals: Number(metrics.goals || 0) + (goalScored ? 1 : 0),
      lastTurns: history
    }
  };
}

function resetPositions(state, turnSlot) {
  return {
    ...state,
    phase: "ready",
    turnSlot,
    turnNumber: state.turnNumber + 1,
    pieces: createPieces(state.teamSize),
    ball: createBall(),
    goalEvent: null,
    settleSinceMs: null,
    lastTouchTeam: null,
    currentTurn: null
  };
}

function registerGoal(state, scorerSlot, nowMs) {
  const next = cloneState(state);
  next.score[scorerSlot] += 1;
  next.settleSinceMs = null;
  next.lastTouchTeam = scorerSlot;

  const finalized = finalizeTurnMetrics(next, nowMs, true);
  if (finalized.score[scorerSlot] >= finalized.goalsToWin) {
    return {
      ...finalized,
      phase: "finished",
      winnerSlot: scorerSlot,
      goalEvent: null
    };
  }

  return {
    ...finalized,
    phase: "goal",
    goalEvent: {
      scorerSlot,
      concedingSlot: scorerSlot === 0 ? 1 : 0,
      resumeAtMs: nowMs + GOAL_PAUSE_MS
    }
  };
}

function simulatePhysics(state, deltaMs, nowMs) {
  const next = cloneState(state);
  const boundedDeltaMs = clamp(Number(deltaMs) || 0, 0, 64);

  if (boundedDeltaMs <= 0) {
    return next;
  }

  let remainingMs = boundedDeltaMs;
  let scorerSlot = null;

  while (remainingMs > 0 && scorerSlot === null) {
    const stepMs = Math.min(MAX_SIM_STEP_MS, remainingMs);
    const dt = stepMs / 1000;

    for (const piece of next.pieces) {
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      resolvePieceWalls(piece);
    }

    next.ball.x += next.ball.vx * dt;
    next.ball.y += next.ball.vy * dt;

    scorerSlot = resolveBallWalls(next.ball);
    if (scorerSlot !== null) {
      break;
    }

    for (let index = 0; index < next.pieces.length; index += 1) {
      for (let compareIndex = index + 1; compareIndex < next.pieces.length; compareIndex += 1) {
        if (resolveCircleCollision(next.pieces[index], next.pieces[compareIndex], PLAYER_PLAYER_RESTITUTION) && next.currentTurn) {
          next.currentTurn.collisionCount += 1;
        }
      }
    }

    for (const piece of next.pieces) {
      if (resolveCircleCollision(piece, next.ball, PLAYER_BALL_RESTITUTION)) {
        next.lastTouchTeam = piece.team;
        if (next.currentTurn) {
          next.currentTurn.collisionCount += 1;
          next.currentTurn.touchedBall = true;
        }
      }
    }

    applyLinearDeceleration(next.ball, BALL_DECEL, dt);
    for (const piece of next.pieces) {
      applyLinearDeceleration(piece, PLAYER_DECEL, dt);
    }

    remainingMs -= stepMs;
  }

  if (scorerSlot !== null) {
    return registerGoal(next, scorerSlot, nowMs);
  }

  if (!allObjectsAtRest(next)) {
    next.settleSinceMs = null;
    return next;
  }

  if (!Number.isFinite(next.settleSinceMs)) {
    next.settleSinceMs = nowMs;
    return next;
  }

  if (nowMs - next.settleSinceMs < SETTLE_TIME_MS) {
    return next;
  }

  const finalized = finalizeTurnMetrics(next, nowMs, false);
  return {
    ...finalized,
    phase: "ready",
    turnSlot: finalized.turnSlot === 0 ? 1 : 0,
    turnNumber: finalized.turnNumber + 1,
    settleSinceMs: null,
    lastTouchTeam: null
  };
}

function shootPiece(state, action, actorSlot) {
  if (state.phase !== "ready") {
    return { ok: false, reason: "invalid" };
  }

  const pieceId = String(action.pieceId || "");
  const pieceIndex = state.pieces.findIndex((piece) => piece.id === pieceId);
  if (pieceIndex < 0) {
    return { ok: false, reason: "invalid" };
  }

  const piece = state.pieces[pieceIndex];
  if (piece.team !== actorSlot) {
    return { ok: false, reason: "turn" };
  }

  const velocity = normalizeVelocity(Number(action.velocityX), Number(action.velocityY), MAX_SHOT_SPEED);
  const velocitySize = Math.hypot(velocity.vx, velocity.vy);
  if (velocitySize < 60) {
    return { ok: false, reason: "invalid" };
  }

  const next = cloneState(state);
  const targetPiece = next.pieces[pieceIndex];
  targetPiece.vx = velocity.vx;
  targetPiece.vy = velocity.vy;

  next.phase = "resolving";
  next.settleSinceMs = null;
  next.currentTurn = {
    team: actorSlot,
    pieceId,
    startedAtMs: Number(action.nowMs) || Date.now(),
    power01: clamp(Number(action.power01) || velocitySize / MAX_SHOT_SPEED, 0, 1),
    collisionCount: 0,
    touchedBall: false
  };

  return {
    ok: true,
    state: next
  };
}

function tickState(state, action) {
  const nowMs = Number(action.nowMs) || Date.now();

  if (state.phase === "goal" && state.goalEvent) {
    if (nowMs < state.goalEvent.resumeAtMs) {
      return {
        ok: true,
        state
      };
    }

    return {
      ok: true,
      state: resetPositions(state, state.goalEvent.concedingSlot)
    };
  }

  if (state.phase !== "resolving") {
    return {
      ok: true,
      state
    };
  }

  return {
    ok: true,
    state: simulatePhysics(state, Number(action.deltaMs), nowMs)
  };
}

function renderConfigPanel(options = {}) {
  const teamSize = normalizeTeamSize(options.teamSize);
  const goalsToWin = normalizeGoalsToWin(options.goalsToWin);

  return `
    <section class="football-config-grid">
      <div class="block">
        <h3 class="block-title">Fichas por equipo</h3>
        <p class="block-sub">Mas fichas abren jugadas, pero la lectura sigue clara en 3 y 5.</p>
        <div class="player-count-row">
          ${TEAM_SIZE_OPTIONS.map((value) => `
            <button
              class="pill ${teamSize === value ? "is-active" : ""}"
              data-action="set-game-option"
              data-option="teamSize"
              data-value="${value}"
              data-value-type="number"
            >
              ${escapeHtml(`${value} por equipo`)}
            </button>
          `).join("")}
        </div>
      </div>

      <div class="block">
        <h3 class="block-title">Goles para ganar</h3>
        <div class="player-count-row">
          ${GOALS_TO_WIN_OPTIONS.map((value) => `
            <button
              class="pill ${goalsToWin === value ? "is-active" : ""}"
              data-action="set-game-option"
              data-option="goalsToWin"
              data-value="${value}"
              data-value-type="number"
            >
              ${escapeHtml(`Primero a ${value}`)}
            </button>
          `).join("")}
        </div>
        <p class="info-line">Una sola ficha por turno. Arrastra hacia donde quieres tirar, suelta y deja que el campo resuelva la jugada.</p>
      </div>
    </section>
  `;
}

function renderCardIllustration() {
  return `
    <div class="game-illustration" aria-hidden="true">
      <svg class="game-illustration-svg" viewBox="0 0 160 98" preserveAspectRatio="xMidYMid meet" role="presentation">
        <defs>
          <linearGradient id="footballCardPitch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1b7a5f" />
            <stop offset="100%" stop-color="#0f4f3f" />
          </linearGradient>
          <linearGradient id="footballCardFrame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f8f5ef" />
            <stop offset="100%" stop-color="#e2ddd2" />
          </linearGradient>
          <pattern id="footballCardPattern" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="transparent"></rect>
            <path d="M 6 0 V 12 M 0 6 H 12" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"></path>
          </pattern>
        </defs>
        <rect x="16" y="12" width="128" height="74" rx="22" fill="url(#footballCardFrame)" stroke="rgba(15,23,42,0.18)" />
        <rect x="24" y="20" width="112" height="58" rx="18" fill="#0f172a" stroke="#111827" />
        <rect x="28" y="24" width="104" height="50" rx="16" fill="url(#footballCardPitch)" stroke="rgba(226,232,240,0.56)" />
        <rect x="28" y="24" width="104" height="50" rx="16" fill="url(#footballCardPattern)" opacity="0.5" />
        <path d="M80 24V74M28 49H132M58 49a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z" fill="none" stroke="rgba(248,250,252,0.72)" stroke-width="2.2" />
        <path d="M28 35H40V63H28M132 35H120V63H132" fill="none" stroke="rgba(248,250,252,0.72)" stroke-width="2.2" />
        <path d="M24 40H28V58H24M136 40H132V58H136" fill="none" stroke="rgba(248,250,252,0.82)" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="56" cy="37" r="7.8" fill="#e6775d" stroke="#bf5a43" stroke-width="1.8" />
        <circle cx="104" cy="61" r="7.8" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.8" />
        <circle cx="80" cy="49" r="4.8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" />
      </svg>
    </div>
  `;
}

function renderField(state, canAct) {
  const goalTop = FIELD_HEIGHT / 2 - GOAL_MOUTH_HEIGHT / 2;
  const goalBottom = FIELD_HEIGHT / 2 + GOAL_MOUTH_HEIGHT / 2;
  const goalTopInset = goalTop + 26;
  const goalBottomInset = goalBottom - 26;

  const pieces = state.pieces
    .map((piece) => {
      const clickable = canAct && state.phase === "ready" && piece.team === state.turnSlot;
      return `
        <g
          class="football-piece is-team-${piece.team} ${piece.team === state.turnSlot ? "is-turn-team" : ""} ${clickable ? "is-clickable" : ""}"
          data-football-piece
          data-piece-id="${escapeHtml(piece.id)}"
          data-team="${piece.team}"
          transform="translate(${piece.x} ${piece.y})"
        >
          <ellipse class="football-piece-shadow" cx="0" cy="${piece.r * 0.76}" rx="${piece.r * 0.92}" ry="${piece.r * 0.44}"></ellipse>
          <circle class="football-turn-ring" cx="0" cy="0" r="${piece.r + 8}"></circle>
          <circle class="football-piece-core" cx="0" cy="0" r="${piece.r}"></circle>
          <circle class="football-piece-rim" cx="0" cy="0" r="${piece.r - 1.6}"></circle>
          <path class="football-piece-panel" d="M ${-piece.r * 0.58} ${piece.r * 0.12} Q 0 ${piece.r * 0.58} ${piece.r * 0.58} ${piece.r * 0.12} Q 0 ${piece.r * 0.04} ${-piece.r * 0.58} ${piece.r * 0.12}"></path>
          <circle class="football-piece-detail" cx="${-piece.r * 0.36}" cy="${-piece.r * 0.4}" r="${piece.r * 0.3}"></circle>
          <ellipse class="football-piece-gloss" cx="${-piece.r * 0.18}" cy="${-piece.r * 0.34}" rx="${piece.r * 0.48}" ry="${piece.r * 0.28}"></ellipse>
        </g>
      `;
    })
    .join("");

  return `
    <svg
      class="football-field"
      data-football-field
      viewBox="${-GOAL_DEPTH} 0 ${FIELD_WIDTH + GOAL_DEPTH * 2} ${FIELD_HEIGHT}"
      role="img"
      aria-label="Campo de futbol por turnos"
    >
      <defs>
        <linearGradient id="footballPitchFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1B5E3C" />
          <stop offset="50%" stop-color="#144C30" />
          <stop offset="100%" stop-color="#0E3822" />
        </linearGradient>
        <radialGradient id="footballPitchAmbient" cx="50%" cy="42%" r="72%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
          <stop offset="62%" stop-color="rgba(255,255,255,0)" />
          <stop offset="100%" stop-color="rgba(5,38,29,0.18)" />
        </linearGradient>
        <pattern id="footballPitchPattern" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M16 0V32M0 16H32" stroke="rgba(255,255,255,0.1)" stroke-width="1"></path>
        </pattern>
      </defs>

      <rect class="football-field-frame" x="${-GOAL_DEPTH}" y="0" width="${FIELD_WIDTH + GOAL_DEPTH * 2}" height="${FIELD_HEIGHT}" rx="42"></rect>
      <rect class="football-field-pitch" x="0" y="18" width="${FIELD_WIDTH}" height="${FIELD_HEIGHT - 36}" rx="34"></rect>
      <rect class="football-field-ambient" x="0" y="18" width="${FIELD_WIDTH}" height="${FIELD_HEIGHT - 36}" rx="34"></rect>
      <rect class="football-pitch-grid" x="0" y="18" width="${FIELD_WIDTH}" height="${FIELD_HEIGHT - 36}" rx="34"></rect>
      ${Array.from({ length: 5 }, (_, index) => {
        const stripeHeight = (FIELD_HEIGHT - 92) / 5;
        return `<rect class="football-pitch-stripe" x="26" y="${46 + stripeHeight * index}" width="${FIELD_WIDTH - 52}" height="${stripeHeight}" rx="18"></rect>`;
      }).join("")}
      <g class="football-field-grain">
        <rect x="34" y="30" width="${FIELD_WIDTH - 68}" height="${(FIELD_HEIGHT - 60) / 3}" rx="24" fill="rgba(255,255,255,0.055)"></rect>
        <rect x="34" y="${30 + (FIELD_HEIGHT - 60) / 3}" width="${FIELD_WIDTH - 68}" height="${(FIELD_HEIGHT - 60) / 3}" rx="24" fill="rgba(0,0,0,0.032)"></rect>
        <rect x="34" y="${30 + ((FIELD_HEIGHT - 60) / 3) * 2}" width="${FIELD_WIDTH - 68}" height="${(FIELD_HEIGHT - 60) / 3}" rx="24" fill="rgba(255,255,255,0.055)"></rect>
      </g>

      <g aria-hidden="true">
        <rect class="football-goal-net team-0-net" x="${-GOAL_DEPTH + 10}" y="${goalTop}" width="${GOAL_DEPTH - 10}" height="${GOAL_MOUTH_HEIGHT}" rx="12"></rect>
        <rect class="football-goal-net team-1-net" x="${FIELD_WIDTH}" y="${goalTop}" width="${GOAL_DEPTH - 10}" height="${GOAL_MOUTH_HEIGHT}" rx="12"></rect>
        <path class="football-goal-frame team-0-frame" d="M0 ${goalTop}H${-GOAL_DEPTH + 12}V${goalBottom}H0"></path>
        <path class="football-goal-frame team-1-frame" d="M${FIELD_WIDTH} ${goalTop}H${FIELD_WIDTH + GOAL_DEPTH - 12}V${goalBottom}H${FIELD_WIDTH}"></path>
        ${Array.from({ length: 5 }, (_, index) => {
          const y = goalTop + index * (GOAL_MOUTH_HEIGHT / 4);
          return `<line class="football-goal-grid" x1="${-GOAL_DEPTH + 12}" y1="${y}" x2="0" y2="${y}"></line>`;
        }).join("")}
        ${Array.from({ length: 5 }, (_, index) => {
          const y = goalTop + index * (GOAL_MOUTH_HEIGHT / 4);
          return `<line class="football-goal-grid" x1="${FIELD_WIDTH}" y1="${y}" x2="${FIELD_WIDTH + GOAL_DEPTH - 12}" y2="${y}"></line>`;
        }).join("")}
      </g>

      <path class="football-pitch-mark" d="M500 18V${FIELD_HEIGHT - 18}"></path>
      <circle class="football-pitch-mark" cx="500" cy="${FIELD_HEIGHT / 2}" r="74"></circle>
      <circle class="football-pitch-mark" cx="500" cy="${FIELD_HEIGHT / 2}" r="4"></circle>
      <path class="football-pitch-mark" d="M0 ${goalTopInset}H118V${goalBottomInset}H0"></path>
      <path class="football-pitch-mark" d="M${FIELD_WIDTH} ${goalTopInset}H${FIELD_WIDTH - 118}V${goalBottomInset}H${FIELD_WIDTH}"></path>
      <path class="football-pitch-mark" d="M0 ${FIELD_HEIGHT / 2 - 82}H64V${FIELD_HEIGHT / 2 + 82}H0"></path>
      <path class="football-pitch-mark" d="M${FIELD_WIDTH} ${FIELD_HEIGHT / 2 - 82}H${FIELD_WIDTH - 64}V${FIELD_HEIGHT / 2 + 82}H${FIELD_WIDTH}"></path>
      <circle class="football-pitch-mark" cx="148" cy="${FIELD_HEIGHT / 2}" r="4"></circle>
      <circle class="football-pitch-mark" cx="${FIELD_WIDTH - 148}" cy="${FIELD_HEIGHT / 2}" r="4"></circle>
      <path class="football-pitch-mark" d="M118 ${FIELD_HEIGHT / 2 - 64}A76 76 0 0 1 118 ${FIELD_HEIGHT / 2 + 64}"></path>
      <path class="football-pitch-mark" d="M${FIELD_WIDTH - 118} ${FIELD_HEIGHT / 2 - 64}A76 76 0 0 0 ${FIELD_WIDTH - 118} ${FIELD_HEIGHT / 2 + 64}"></path>

      <g data-football-aim-layer></g>

      ${pieces}

      <g class="football-ball" transform="translate(${state.ball.x} ${state.ball.y})">
        <ellipse class="football-ball-shadow" cx="1.4" cy="${BALL_RADIUS + 3.8}" rx="${BALL_RADIUS * 0.96}" ry="5.4"></ellipse>
        <circle class="football-ball-shell" cx="0" cy="0" r="${BALL_RADIUS}"></circle>
        <circle class="football-ball-ring" cx="0" cy="0" r="${BALL_RADIUS - 1.8}"></circle>
        <path class="football-ball-seam" d="M-4 -6L4 -6L7 0L4 6H-4L-7 0Z"></path>
        <circle class="football-ball-highlight" cx="${-BALL_RADIUS * 0.3}" cy="${-BALL_RADIUS * 0.38}" r="${BALL_RADIUS * 0.24}"></circle>
      </g>
    </svg>
  `;
}

function renderShell(state, canAct, uiState) {
  const status = buildStatusCopy(state);
  const layoutMode = resolveFootballLayoutMode(uiState);
  const metrics = computeFootballFieldMetrics(uiState, layoutMode);
  const shellStyle = metrics
    ? ` style="--football-field-width:${round(metrics.width, 2)}px; --football-field-height:${round(metrics.height, 2)}px;"`
    : "";
  return `
    <section class="football-shell" data-football-root data-football-layout="${layoutMode}" data-football-phase="${escapeHtml(state.phase)}"${shellStyle}>
      <div class="football-mobile-hud">
        <div class="hud-team hud-team-0 ${state.turnSlot === 0 ? "is-active" : ""}">
          <span class="score">${state.score[0]}</span>
        </div>
        <div class="hud-center">
          <span class="turn-text">${escapeHtml(status.title)}</span>
        </div>
        <div class="hud-team hud-team-1 ${state.turnSlot === 1 ? "is-active" : ""}">
          <span class="score">${state.score[1]}</span>
        </div>
      </div>
      <section class="football-stage">
        ${renderField(state, canAct)}
      </section>
    </section>
  `;
}

function worldPointFromClient(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  if (!rect.width || !rect.height || !viewBox.width || !viewBox.height) {
    return null;
  }

  const root = svg.closest("[data-football-root]");
  const layoutMode = root?.dataset?.footballLayout || "desktop";
  let localX = clientX - rect.left;
  let localY = clientY - rect.top;
  let cssWidth = rect.width;
  let cssHeight = rect.height;

  if (layoutMode === "mobile-portrait") {
    const rotatedX = clamp(clientX - rect.left, 0, rect.width);
    const rotatedY = clamp(clientY - rect.top, 0, rect.height);
    cssWidth = rect.height;
    cssHeight = rect.width;
    localX = rotatedY;
    localY = cssHeight - rotatedX;
  }

  localX = clamp(localX, 0, cssWidth);
  localY = clamp(localY, 0, cssHeight);

  const scale = Math.min(cssWidth / viewBox.width, cssHeight / viewBox.height);
  if (!Number.isFinite(scale) || scale <= 0) {
    return null;
  }

  const offsetX = (cssWidth - viewBox.width * scale) / 2;
  const offsetY = (cssHeight - viewBox.height * scale) / 2;
  return {
    x: viewBox.x + (localX - offsetX) / scale,
    y: viewBox.y + (localY - offsetY) / scale
  };
}

function clampPullPoint(anchor, point) {
  const dx = point.x - anchor.x;
  const dy = point.y - anchor.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= MAX_DRAG_DISTANCE) {
    return point;
  }

  const scale = MAX_DRAG_DISTANCE / distance;
  return {
    x: anchor.x + dx * scale,
    y: anchor.y + dy * scale
  };
}

function renderAimGuide(anchor, handlePoint, power01) {
  const aimX = anchor.x - handlePoint.x;
  const aimY = anchor.y - handlePoint.y;
  const aimDistance = Math.hypot(aimX, aimY) || 1;
  const dirX = aimX / aimDistance;
  const dirY = aimY / aimDistance;
  const guideLength = 24 + power01 * 48;
  const tipX = anchor.x + dirX * guideLength;
  const tipY = anchor.y + dirY * guideLength;
  const haloRadius = 15 + power01 * 18;
  const tone = power01 >= 0.72 ? "#de765b" : power01 >= 0.38 ? "#d2a049" : "#6da888";
  const softTone = power01 >= 0.72 ? "rgba(222,118,91,0.24)" : power01 >= 0.38 ? "rgba(210,160,73,0.22)" : "rgba(109,168,136,0.22)";
  const pullWidth = 5 + power01 * 7;
  const vectorWidth = 4.4 + power01 * 5.8;
  const dash = Math.max(7, 16 - power01 * 7);

  return `
    <line class="football-aim-line is-pull" x1="${anchor.x}" y1="${anchor.y}" x2="${handlePoint.x}" y2="${handlePoint.y}" style="stroke:${softTone};stroke-width:${round(pullWidth + 6, 2)}"></line>
    <line class="football-aim-line is-pull" x1="${anchor.x}" y1="${anchor.y}" x2="${handlePoint.x}" y2="${handlePoint.y}" style="stroke:${tone};stroke-width:${round(pullWidth, 2)};stroke-dasharray:${round(dash, 2)} 10"></line>
    <line class="football-aim-line is-vector" x1="${anchor.x}" y1="${anchor.y}" x2="${round(tipX, 2)}" y2="${round(tipY, 2)}" style="stroke:${tone};stroke-width:${round(vectorWidth, 2)}"></line>
    <circle class="football-aim-anchor" cx="${anchor.x}" cy="${anchor.y}" r="${round(haloRadius * 0.42, 2)}" style="stroke:${tone}"></circle>
    <circle class="football-aim-tip" cx="${round(tipX, 2)}" cy="${round(tipY, 2)}" r="${round(8 + power01 * 7, 2)}" style="fill:${softTone};stroke:${tone}"></circle>
  `;
}

function bindBoardElement(boardWrap, { state, canAct, dispatchGameAction }) {
  const root = boardWrap.querySelector("[data-football-root]");
  if (!root || root.dataset.bound === "true") {
    return;
  }

  const svg = root.querySelector("[data-football-field]");
  const aimLayer = root.querySelector("[data-football-aim-layer]");

  if (!svg || !aimLayer) {
    return;
  }

  root.dataset.bound = "true";
  let drag = null;

  function clearAimLayer() {
    aimLayer.innerHTML = "";
    drag = null;
  }

  function updateAimLayer() {
    if (!drag) {
      clearAimLayer();
      return;
    }

    const handlePoint = clampPullPoint(drag.anchor, drag.pointer);
    drag.handlePoint = handlePoint;
    const pullDistance = Math.hypot(drag.anchor.x - handlePoint.x, drag.anchor.y - handlePoint.y);
    const power01 = clamp(pullDistance / MAX_DRAG_DISTANCE, 0, 1);

    aimLayer.innerHTML = renderAimGuide(drag.anchor, handlePoint, power01);
  }

  async function releaseShot(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    if (svg.hasPointerCapture(event.pointerId)) {
      try {
        svg.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Ignora fallos de captura al salir del gesto.
      }
    }

    const currentDrag = drag;
    clearAimLayer();

    if (cancelled || !canAct || state.phase !== "ready") {
      return;
    }

    const handlePoint = currentDrag.handlePoint || currentDrag.pointer;
    const aimX = currentDrag.anchor.x - handlePoint.x;
    const aimY = currentDrag.anchor.y - handlePoint.y;
    const aimDistance = Math.hypot(aimX, aimY);
    if (aimDistance < MIN_SHOT_DISTANCE) {
      return;
    }

    const power01 = clamp(aimDistance / MAX_DRAG_DISTANCE, 0, 1);
    const easedPower = power01 * power01 * 0.78 + power01 * 0.22;
    const speed = MAX_SHOT_SPEED * easedPower;
    const scale = speed / aimDistance;

    await dispatchGameAction({
      type: "shoot-piece",
      pieceId: currentDrag.pieceId,
      velocityX: aimX * scale,
      velocityY: aimY * scale,
      power01,
      nowMs: Date.now()
    });
  }

  svg.addEventListener("pointerdown", (event) => {
    if (!canAct || state.phase !== "ready") {
      return;
    }

    const pieceNode = event.target instanceof Element ? event.target.closest("[data-football-piece]") : null;
    if (!pieceNode) {
      return;
    }

    const team = Number(pieceNode.dataset.team);
    if (team !== state.turnSlot) {
      return;
    }

    const pieceId = String(pieceNode.dataset.pieceId || "");
    const piece = state.pieces.find((candidate) => candidate.id === pieceId);
    if (!piece) {
      return;
    }

    const pointer = worldPointFromClient(svg, event.clientX, event.clientY);
    if (!pointer) {
      return;
    }

    drag = {
      pointerId: event.pointerId,
      pieceId,
      team,
      anchor: { x: piece.x, y: piece.y },
      pointer,
      handlePoint: pointer
    };

    svg.setPointerCapture(event.pointerId);
    updateAimLayer();
    event.preventDefault();
  });

  svg.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const pointer = worldPointFromClient(svg, event.clientX, event.clientY);
    if (!pointer) {
      return;
    }

    drag.pointer = pointer;
    updateAimLayer();
  });

  svg.addEventListener("pointerup", (event) => {
    releaseShot(event).catch(() => {
      clearAimLayer();
    });
  });

  svg.addEventListener("pointercancel", (event) => {
    releaseShot(event, true).catch(() => {
      clearAimLayer();
    });
  });

  svg.addEventListener("pointerleave", () => {
    if (!drag) {
      aimLayer.innerHTML = "";
    }
  });
}

export const futbolTurnosGame = {
  id: "futbol-turnos",
  name: "Futbol",
  subtitle: "2 jugadores",
  tagline: "Dispara, rebota y marca",
  minPlayers: 2,
  maxPlayers: 2,
  hidePlayerNames: true,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  useLandscapeMobileShell: false,
  allowFullscreen: true,
  rules: [
    { title: "Objetivo", text: "Marca mas goles que el rival empujando una sola ficha por turno." },
    { title: "Disparo", text: "Selecciona una ficha de tu equipo, arrastra hacia donde quieres tirar y sueltala para impulsarla." },
    { title: "Resolucion", text: "La jugada termina cuando pelota y fichas se detienen por completo." },
    { title: "Gol", text: "La pelota debe cruzar la porteria rival por la abertura central para sumar." }
  ],
  getDefaultOptions() {
    return {
      teamSize: 3,
      goalsToWin: 3
    };
  },
  normalizeOptions(options = {}) {
    return {
      teamSize: normalizeTeamSize(options.teamSize),
      goalsToWin: normalizeGoalsToWin(options.goalsToWin)
    };
  },
  renderConfigPanel({ options }) {
    ensureFootballStyles();
    return renderConfigPanel(options);
  },
  createInitialState({ options }) {
    return createState(options?.teamSize, options?.goalsToWin);
  },
  getTurnSlot(state) {
    return Number(state?.turnSlot) || 0;
  },
  getResult(state) {
    if (state?.phase === "finished" && Number.isInteger(state.winnerSlot)) {
      return {
        type: "win",
        winnerSlot: state.winnerSlot
      };
    }
    return null;
  },
  getTurnMessage({ state }) {
    const status = buildStatusCopy(state);
    return status.title;
  },
  getShellSubtitle({ state }) {
    const status = buildStatusCopy(state);
    return `Marcador ${state.score[0]} - ${state.score[1]} · ${status.title}`;
  },
  applyAction({ state, action, actorSlot }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "shoot-piece") {
      return shootPiece(state, action, actorSlot);
    }

    if (action.type === "tick") {
      return tickState(state, action);
    }

    return { ok: false, reason: "invalid" };
  },
  renderCardIllustration() {
    return renderCardIllustration();
  },
  renderBoard({ state, canAct, uiState }) {
    ensureFootballStyles();
    return renderShell(state, canAct, uiState);
  },
  patchBoardElement(boardWrap, { state, canAct, uiState }) {
    ensureFootballStyles();
    boardWrap.innerHTML = renderShell(state, canAct, uiState);
    return true;
  },
  bindBoardElement(boardWrap, ctx) {
    ensureFootballStyles();
    bindBoardElement(boardWrap, ctx);
  },
  formatResult({ state }) {
    const winnerSlot = Number.isInteger(state.winnerSlot) ? state.winnerSlot : 0;
    const winner = teamMeta(winnerSlot).name;
    return {
      title: `${winner} gana`,
      subtitle: `Marcador final ${state.score[0]} - ${state.score[1]}. ${formatModeLabel(state)}.`,
      iconText: "⚽",
      iconClass: "win"
    };
  }
};
