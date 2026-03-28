const FOOTBALL_STYLE_ID = "minijuegos-football-turns";

const TEAM_SIZE_OPTIONS = [3, 5];
const GOALS_TO_WIN_OPTIONS = [3, 5];

const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 620;
const GOAL_MOUTH_HEIGHT = 188;
const GOAL_DEPTH = 44;

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
.app-shell:not(.app-shell-home) .screen.game-screen-futbol-turnos {
  width: min(1640px, calc(100vw - 14px));
  gap: 8px;
}

.game-screen-futbol-turnos .topbar {
  padding: 9px 11px;
}

.game-screen-futbol-turnos .topbar-title {
  font-size: clamp(1.18rem, 1.8vw, 1.62rem);
}

.game-screen-futbol-turnos .topbar-sub {
  font-size: 0.82rem;
}

.game-screen-futbol-turnos .board-wrap {
  display: block;
  padding: 0;
}

.game-screen-futbol-turnos .actions-bottom {
  justify-content: center;
  gap: 8px;
}

.game-screen-futbol-turnos .actions-bottom .btn {
  min-width: 144px;
}

.football-shell {
  width: 100%;
  margin: 0 auto;
  display: grid;
  gap: 8px;
}

.football-hud {
  display: grid;
  grid-template-columns: minmax(112px, 0.76fr) minmax(0, 1.18fr) minmax(112px, 0.76fr);
  gap: 6px;
  align-items: stretch;
}

.football-team-card,
.football-status-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(209, 196, 171, 0.82);
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, rgba(255, 253, 248, 0.96) 0%, rgba(246, 238, 226, 0.98) 100%);
  box-shadow:
    0 14px 24px rgba(52, 48, 41, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.football-team-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
}

.football-team-card::before,
.football-status-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.football-team-card.is-team-0::before {
  background:
    radial-gradient(circle at 14% 16%, rgba(230, 119, 93, 0.2), rgba(230, 119, 93, 0) 36%),
    linear-gradient(140deg, rgba(255, 240, 236, 0.94) 0%, rgba(255, 255, 255, 0) 46%);
}

.football-team-card.is-team-1::before {
  background:
    radial-gradient(circle at 84% 14%, rgba(79, 132, 234, 0.2), rgba(79, 132, 234, 0) 38%),
    linear-gradient(220deg, rgba(238, 244, 255, 0.92) 0%, rgba(255, 255, 255, 0) 48%);
}

.football-team-card-head,
.football-status-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.football-team-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.football-team-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  flex: 0 0 auto;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.46),
    0 6px 10px rgba(49, 45, 41, 0.12);
}

.football-team-card.is-team-0 .football-team-dot {
  background: linear-gradient(180deg, #f39a81 0%, #df7258 100%);
}

.football-team-card.is-team-1 .football-team-dot {
  background: linear-gradient(180deg, #82abff 0%, #4f84ea 100%);
}

.football-team-name {
  margin: 0;
  color: #233026;
  font-size: 0.82rem;
  font-weight: 780;
  letter-spacing: -0.03em;
}

.football-team-role {
  display: none;
}

.football-score {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #182425;
  font-size: clamp(1.36rem, 2.5vw, 1.82rem);
  font-weight: 860;
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.football-team-card.is-active {
  border-color: rgba(118, 170, 141, 0.74);
  box-shadow:
    0 18px 30px rgba(49, 64, 55, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.84),
    0 0 0 3px rgba(111, 171, 140, 0.12);
}

.football-status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
}

.football-status-card::before {
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, rgba(244, 248, 243, 0.9) 0%, rgba(249, 243, 231, 0.4) 100%);
}

.football-status-eyebrow {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(72, 116, 95, 0.1);
  color: #47695a;
  font-size: 0.6rem;
  font-weight: 820;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.football-status-goal {
  background: rgba(233, 174, 77, 0.18);
  color: #94631d;
}

.football-status-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 2px;
  min-width: 0;
}

.football-status-title {
  margin: 0;
  color: #213029;
  font-size: 0.9rem;
  font-weight: 770;
  letter-spacing: -0.03em;
}

.football-status-note {
  margin: 0;
  color: #657367;
  font-size: 0.7rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.football-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.football-meta-pill {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(212, 202, 184, 0.86);
  background: rgba(255, 255, 255, 0.62);
  color: #46554a;
  font-size: 0.64rem;
  font-weight: 760;
}

.football-stage {
  position: relative;
  overflow: hidden;
  padding: 6px;
  border-radius: 28px;
  border: 1px solid rgba(210, 198, 172, 0.82);
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0) 36%),
    linear-gradient(180deg, rgba(253, 250, 242, 0.98) 0%, rgba(247, 239, 225, 0.98) 100%);
  box-shadow:
    0 24px 36px rgba(54, 48, 40, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.football-stage::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 14% 12%, rgba(130, 171, 255, 0.08), rgba(130, 171, 255, 0) 22%),
    radial-gradient(circle at 86% 84%, rgba(229, 122, 98, 0.08), rgba(229, 122, 98, 0) 26%);
}

.football-field {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: auto;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.football-field-frame {
  fill: #f8efdd;
  stroke: #d7c29c;
  stroke-width: 2;
}

.football-field-pitch {
  fill: url(#footballPitchFill);
  stroke: #d7cfbd;
  stroke-width: 1.8;
}

.football-field-grain {
  opacity: 0.2;
}

.football-goal-net {
  fill: rgba(246, 239, 225, 0.88);
  stroke: #d6c3a5;
  stroke-width: 1.5;
}

.football-goal-grid {
  stroke: rgba(198, 181, 158, 0.72);
  stroke-width: 1.4;
}

.football-pitch-mark {
  fill: none;
  stroke: rgba(248, 247, 242, 0.92);
  stroke-width: 5;
  stroke-linecap: round;
}

.football-piece {
  cursor: pointer;
}

.football-piece.is-team-0 .football-piece-core {
  fill: #e6775d;
  stroke: #bf5a43;
}

.football-piece.is-team-1 .football-piece-core {
  fill: #4f84ea;
  stroke: #355fb9;
}

.football-piece-core {
  stroke-width: 4.2;
  paint-order: stroke;
  filter: drop-shadow(0 8px 10px rgba(39, 43, 48, 0.2));
  transition: filter 140ms ease, stroke-width 140ms ease;
}

.football-piece.is-clickable:hover .football-piece-core {
  filter: drop-shadow(0 10px 14px rgba(39, 43, 48, 0.24));
}

.football-piece-detail {
  fill: rgba(255, 255, 255, 0.9);
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
  stroke-linecap: round;
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

@media (max-width: 980px) {
  .football-hud {
    grid-template-columns: minmax(94px, 0.72fr) minmax(0, 1.04fr) minmax(94px, 0.72fr);
    gap: 5px;
  }
}

@media (max-width: 760px) {
  .app-shell:not(.app-shell-home) .screen.game-screen-futbol-turnos {
    width: min(100%, calc(100vw - 10px));
  }

  .football-shell {
    gap: 5px;
  }

  .football-stage {
    padding: 4px;
    border-radius: 20px;
  }

  .football-team-card,
  .football-status-card {
    padding: 7px 8px;
    border-radius: 16px;
  }

  .football-team-name {
    font-size: 0.72rem;
  }

  .football-score {
    font-size: 1.26rem;
  }

  .football-status-card {
    gap: 6px;
  }

  .football-status-title {
    font-size: 0.74rem;
  }

  .football-status-note {
    display: none;
  }

  .football-meta-pill {
    min-height: 20px;
    padding: 0 7px;
    font-size: 0.58rem;
  }

  .game-screen-futbol-turnos .topbar {
    padding: 8px 10px;
  }

  .game-screen-futbol-turnos .topbar-title {
    font-size: 1.06rem;
  }

  .game-screen-futbol-turnos .topbar-sub {
    font-size: 0.74rem;
  }

  .game-screen-futbol-turnos .actions-bottom {
    gap: 6px;
  }

  .game-screen-futbol-turnos .actions-bottom .btn {
    min-width: 0;
    flex: 1 1 0;
    height: 40px;
    padding: 0 10px;
    font-size: 0.9rem;
  }
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
        <p class="info-line">Una sola ficha por turno. Arrastra hacia atras, suelta y deja que el campo resuelva la jugada.</p>
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
            <stop offset="0%" stop-color="#dff1de" />
            <stop offset="100%" stop-color="#9ec79f" />
          </linearGradient>
          <linearGradient id="footballCardFrame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fff8eb" />
            <stop offset="100%" stop-color="#f0dec0" />
          </linearGradient>
        </defs>
        <rect x="16" y="12" width="128" height="74" rx="22" fill="url(#footballCardFrame)" stroke="#dcc4a0" />
        <rect x="26" y="22" width="108" height="54" rx="18" fill="url(#footballCardPitch)" stroke="#8db28d" />
        <rect x="20" y="38" width="12" height="22" rx="4" fill="#f9f3e6" stroke="#d4c3a3" />
        <rect x="128" y="38" width="12" height="22" rx="4" fill="#f9f3e6" stroke="#d4c3a3" />
        <path d="M52 22V76M80 22V76M108 22V76" stroke="rgba(255,255,255,0.12)" stroke-width="12" />
        <path d="M80 22V76M26 49H134M58 49a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z" fill="none" stroke="rgba(249,251,246,0.92)" stroke-width="2.4" />
        <circle cx="58" cy="36" r="8" fill="#e6775d" stroke="#bf5a43" stroke-width="2" />
        <circle cx="50.8" cy="33.4" r="2.1" fill="rgba(255,255,255,0.86)" />
        <circle cx="102" cy="62" r="8" fill="#4f84ea" stroke="#355fb9" stroke-width="2" />
        <circle cx="94.8" cy="59.4" r="2.1" fill="rgba(255,255,255,0.86)" />
        <circle cx="82" cy="49" r="4.9" fill="#fffaf1" stroke="#d4c29f" stroke-width="1.4" />
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
          <circle class="football-turn-ring" cx="0" cy="0" r="${piece.r + 8}"></circle>
          <circle class="football-piece-core" cx="0" cy="0" r="${piece.r}"></circle>
          <circle class="football-piece-detail" cx="${-piece.r * 0.36}" cy="${-piece.r * 0.4}" r="${piece.r * 0.3}"></circle>
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
          <stop offset="0%" stop-color="#dbf0da" />
          <stop offset="100%" stop-color="#9ac49b" />
        </linearGradient>
      </defs>

      <rect class="football-field-frame" x="${-GOAL_DEPTH}" y="0" width="${FIELD_WIDTH + GOAL_DEPTH * 2}" height="${FIELD_HEIGHT}" rx="42"></rect>
      <rect class="football-field-pitch" x="0" y="18" width="${FIELD_WIDTH}" height="${FIELD_HEIGHT - 36}" rx="34"></rect>
      <g class="football-field-grain">
        <rect x="34" y="30" width="${FIELD_WIDTH - 68}" height="${(FIELD_HEIGHT - 60) / 3}" rx="24" fill="rgba(255,255,255,0.055)"></rect>
        <rect x="34" y="${30 + (FIELD_HEIGHT - 60) / 3}" width="${FIELD_WIDTH - 68}" height="${(FIELD_HEIGHT - 60) / 3}" rx="24" fill="rgba(0,0,0,0.032)"></rect>
        <rect x="34" y="${30 + ((FIELD_HEIGHT - 60) / 3) * 2}" width="${FIELD_WIDTH - 68}" height="${(FIELD_HEIGHT - 60) / 3}" rx="24" fill="rgba(255,255,255,0.055)"></rect>
      </g>

      <g aria-hidden="true">
        <rect class="football-goal-net" x="${-GOAL_DEPTH + 10}" y="${goalTop}" width="${GOAL_DEPTH - 10}" height="${GOAL_MOUTH_HEIGHT}" rx="12"></rect>
        <rect class="football-goal-net" x="${FIELD_WIDTH}" y="${goalTop}" width="${GOAL_DEPTH - 10}" height="${GOAL_MOUTH_HEIGHT}" rx="12"></rect>
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

      <g data-football-aim-layer></g>

      ${pieces}

      <g class="football-ball" transform="translate(${state.ball.x} ${state.ball.y})">
        <ellipse class="football-ball-shadow" cx="1.4" cy="${BALL_RADIUS + 3.8}" rx="${BALL_RADIUS * 0.96}" ry="5.4"></ellipse>
        <circle class="football-ball-shell" cx="0" cy="0" r="${BALL_RADIUS}"></circle>
        <path class="football-ball-seam" d="M-4 -6L4 -6L7 0L4 6H-4L-7 0Z"></path>
        <circle class="football-ball-highlight" cx="${-BALL_RADIUS * 0.3}" cy="${-BALL_RADIUS * 0.38}" r="${BALL_RADIUS * 0.24}"></circle>
      </g>
    </svg>
  `;
}

function renderHud(state) {
  const leftTeam = TEAM_META[0];
  const rightTeam = TEAM_META[1];
  const status = buildStatusCopy(state);
  return `
    <section class="football-hud">
      <article class="football-team-card is-team-0 ${state.turnSlot === 0 && state.phase === "ready" ? "is-active" : ""}">
        <div class="football-team-badge">
          <span class="football-team-dot" aria-hidden="true"></span>
          <div>
            <h3 class="football-team-name">${escapeHtml(leftTeam.short)}</h3>
          </div>
        </div>
        <p class="football-score">${state.score[0]}</p>
      </article>

      <article class="football-status-card">
        <div class="football-status-copy">
          <span class="football-status-eyebrow ${state.phase === "goal" ? "football-status-goal" : ""}" data-football-status-eyebrow>${escapeHtml(status.eyebrow)}</span>
          <h3 class="football-status-title" data-football-status-title>${escapeHtml(status.title)}</h3>
          <p class="football-status-note" data-football-status-note>${escapeHtml(status.note)}</p>
        </div>
        <div class="football-meta-row">
          <span class="football-meta-pill">A ${state.goalsToWin}</span>
        </div>
      </article>

      <article class="football-team-card is-team-1 ${state.turnSlot === 1 && state.phase === "ready" ? "is-active" : ""}">
        <div class="football-team-badge">
          <span class="football-team-dot" aria-hidden="true"></span>
          <div>
            <h3 class="football-team-name">${escapeHtml(rightTeam.short)}</h3>
          </div>
        </div>
        <p class="football-score">${state.score[1]}</p>
      </article>
    </section>
  `;
}

function renderShell(state, canAct) {
  return `
    <section class="football-shell" data-football-root data-football-phase="${escapeHtml(state.phase)}">
      ${renderHud(state)}
      <section class="football-stage">
        ${renderField(state, canAct)}
      </section>
    </section>
  `;
}

function worldPointFromClient(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }

  const worldWidth = FIELD_WIDTH + GOAL_DEPTH * 2;
  const x = ((clientX - rect.left) / rect.width) * worldWidth - GOAL_DEPTH;
  const y = ((clientY - rect.top) / rect.height) * FIELD_HEIGHT;
  return { x, y };
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
  const pullX = anchor.x - handlePoint.x;
  const pullY = anchor.y - handlePoint.y;
  const pullDistance = Math.hypot(pullX, pullY) || 1;
  const dirX = pullX / pullDistance;
  const dirY = pullY / pullDistance;
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
    <line class="football-aim-line is-pull" x1="${handlePoint.x}" y1="${handlePoint.y}" x2="${anchor.x}" y2="${anchor.y}" style="stroke:${softTone};stroke-width:${round(pullWidth + 6, 2)}"></line>
    <line class="football-aim-line is-pull" x1="${handlePoint.x}" y1="${handlePoint.y}" x2="${anchor.x}" y2="${anchor.y}" style="stroke:${tone};stroke-width:${round(pullWidth, 2)};stroke-dasharray:${round(dash, 2)} 10"></line>
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
  const statusEyebrow = root.querySelector("[data-football-status-eyebrow]");
  const statusTitle = root.querySelector("[data-football-status-title]");
  const statusNote = root.querySelector("[data-football-status-note]");

  if (!svg || !aimLayer || !statusEyebrow || !statusTitle || !statusNote) {
    return;
  }

  root.dataset.bound = "true";

  const baseStatus = buildStatusCopy(state);
  let drag = null;

  function resetMeter() {
    statusEyebrow.textContent = baseStatus.eyebrow;
    statusEyebrow.classList.toggle("football-status-goal", state.phase === "goal");
    statusTitle.textContent = baseStatus.title;
    statusNote.textContent = baseStatus.note;
  }

  function clearAimLayer() {
    aimLayer.innerHTML = "";
    drag = null;
    resetMeter();
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
    statusEyebrow.textContent = "Apuntando";
    statusEyebrow.classList.remove("football-status-goal");
    statusTitle.textContent = `Disparo de ${teamMeta(drag.team).short} · ${Math.round(power01 * 100)}%`;
    statusNote.textContent = power01 >= 0.72
      ? "Potencia alta"
      : power01 >= 0.34
        ? "Potencia media"
        : "Potencia corta";
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
    const pullX = currentDrag.anchor.x - handlePoint.x;
    const pullY = currentDrag.anchor.y - handlePoint.y;
    const pullDistance = Math.hypot(pullX, pullY);
    if (pullDistance < MIN_SHOT_DISTANCE) {
      return;
    }

    const power01 = clamp(pullDistance / MAX_DRAG_DISTANCE, 0, 1);
    const easedPower = power01 * power01 * 0.78 + power01 * 0.22;
    const speed = MAX_SHOT_SPEED * easedPower;
    const scale = speed / pullDistance;

    await dispatchGameAction({
      type: "shoot-piece",
      pieceId: currentDrag.pieceId,
      velocityX: pullX * scale,
      velocityY: pullY * scale,
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
      resetMeter();
    }
  });

  resetMeter();
}

export const futbolTurnosGame = {
  id: "futbol-turnos",
  name: "Futbol por turnos",
  subtitle: "2 jugadores",
  tagline: "Dispara, rebota y marca",
  minPlayers: 2,
  maxPlayers: 2,
  hidePlayerNames: true,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Objetivo", text: "Marca mas goles que el rival empujando una sola ficha por turno." },
    { title: "Disparo", text: "Selecciona una ficha de tu equipo, tira de ella hacia atras y sueltala para impulsarla." },
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
  renderBoard({ state, canAct }) {
    ensureFootballStyles();
    return renderShell(state, canAct);
  },
  patchBoardElement(boardWrap, { state, canAct }) {
    ensureFootballStyles();
    boardWrap.innerHTML = renderShell(state, canAct);
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
      iconText: "G",
      iconClass: "win"
    };
  }
};
