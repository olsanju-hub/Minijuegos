const BILLIARDS_STYLE_ID = "minijuegos-billar";

const TABLE_WIDTH = 1360;
const TABLE_HEIGHT = 780;

const FELT_X = 86;
const FELT_Y = 86;
const FELT_WIDTH = TABLE_WIDTH - FELT_X * 2;
const FELT_HEIGHT = TABLE_HEIGHT - FELT_Y * 2;

const POCKET_RADIUS = 30;
const BALL_RADIUS = 18;
const SIDE_POCKET_MOUTH = 122;
const CORNER_POCKET_MOUTH = 104;

const MAX_DRAG_DISTANCE = 154;
const MIN_SHOT_DISTANCE = 14;
const MAX_SHOT_SPEED = 1280;

const BALL_DECEL = 760;
const WALL_BOUNCE = 0.88;
const BALL_RESTITUTION = 0.97;
const STOP_SPEED = 14;
const SETTLE_TIME_MS = 170;
const MAX_SIM_STEP_MS = 8;

const WIN_SCORE = 3;
const TARGET_BALL_COUNT = 5;

const TEAM_META = Object.freeze([
  {
    short: "Coral",
    fill: "#e6775d",
    stroke: "#bf5a43",
    glow: "rgba(230, 119, 93, 0.18)",
    soft: "#fff2ec"
  },
  {
    short: "Azul",
    fill: "#4f84ea",
    stroke: "#355fb9",
    glow: "rgba(79, 132, 234, 0.18)",
    soft: "#edf4ff"
  }
]);

const TARGET_BALL_META = Object.freeze([
  { fill: "#f0c568", stroke: "#c29435", shine: "#fff5d7" },
  { fill: "#e68166", stroke: "#bc5d43", shine: "#fff2ec" },
  { fill: "#78b38a", stroke: "#4b8761", shine: "#eef8f1" },
  { fill: "#78a6ec", stroke: "#4e79bf", shine: "#eef4ff" },
  { fill: "#d0a16b", stroke: "#9d7246", shine: "#fff3e2" }
]);

const BILLIARDS_STYLES = String.raw`
html:has(.screen.game-screen-billar),
body:has(.screen.game-screen-billar) {
  height: 100%;
  overflow: hidden;
}

.app-shell:not(.app-shell-home):has(.screen.game-screen-billar) {
  margin: 8px auto 10px;
}

.app-shell:not(.app-shell-home) .screen.game-screen-billar {
  width: min(1760px, calc(100vw - 10px));
  gap: 8px;
}

.app-shell:not(.app-shell-home) .game-screen-billar .topbar {
  padding: 8px 12px;
}

.app-shell:not(.app-shell-home) .game-screen-billar .topbar-title {
  font-size: clamp(1.18rem, 1.84vw, 1.66rem);
}

.app-shell:not(.app-shell-home) .game-screen-billar .topbar-sub {
  font-size: 0.78rem;
}

.app-shell:not(.app-shell-home) .game-screen-billar .board-wrap {
  display: flex;
  padding: 0;
  min-height: 0;
}

.app-shell:not(.app-shell-home) .game-screen-billar .actions-bottom {
  justify-content: center;
  gap: 8px;
}

.app-shell:not(.app-shell-home) .game-screen-billar .actions-bottom .btn {
  min-width: 140px;
  height: 42px;
  padding: 0 14px;
}

.billar-shell {
  width: 100%;
  margin: 0 auto;
  display: flex;
  min-height: 0;
  height: 100%;
}

.billar-hud {
  display: grid;
  grid-template-columns: minmax(0, 0.94fr) minmax(260px, 0.78fr) minmax(0, 0.94fr);
  gap: 8px;
  align-items: stretch;
}

.billar-player-card,
.billar-status-card,
.billar-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
  height: 100%;
  border-radius: 22px;
  border: 1px solid rgba(201, 191, 174, 0.78);
  background:
    linear-gradient(180deg, rgba(255, 253, 249, 0.88) 0%, rgba(246, 241, 234, 0.74) 100%);
  box-shadow:
    0 16px 30px rgba(39, 34, 29, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px) saturate(1.02);
  -webkit-backdrop-filter: blur(16px) saturate(1.02);
}

.billar-player-card,
.billar-status-card {
  padding: 10px 12px;
}

.billar-player-card::before,
.billar-status-card::before,
.billar-stage::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.billar-player-card.is-slot-0::before {
  background:
    radial-gradient(circle at 12% 18%, rgba(230, 119, 93, 0.18), rgba(230, 119, 93, 0) 36%),
    linear-gradient(140deg, rgba(255, 241, 236, 0.94) 0%, rgba(255, 255, 255, 0) 48%);
}

.billar-player-card.is-slot-1::before {
  background:
    radial-gradient(circle at 88% 14%, rgba(79, 132, 234, 0.18), rgba(79, 132, 234, 0) 36%),
    linear-gradient(220deg, rgba(239, 244, 255, 0.94) 0%, rgba(255, 255, 255, 0) 48%);
}

.billar-player-card.is-active {
  border-color: rgba(106, 154, 129, 0.6);
  box-shadow:
    0 16px 28px rgba(43, 53, 47, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.74),
    0 0 0 2px rgba(109, 160, 136, 0.08);
}

.billar-player-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.billar-player-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.billar-player-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  flex: 0 0 auto;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.46),
    0 5px 8px rgba(49, 45, 41, 0.12);
}

.billar-player-card.is-slot-0 .billar-player-dot {
  background: linear-gradient(180deg, #f49c82 0%, #df7258 100%);
}

.billar-player-card.is-slot-1 .billar-player-dot {
  background: linear-gradient(180deg, #82abff 0%, #4f84ea 100%);
}

.billar-player-name {
  margin: 0;
  color: #213027;
  font-size: 0.88rem;
  font-weight: 780;
  letter-spacing: -0.03em;
}

.billar-player-role {
  margin: 2px 0 0;
  color: #6b756a;
  font-size: 0.7rem;
}

.billar-score {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #182425;
  font-size: clamp(1.48rem, 2.42vw, 1.92rem);
  font-weight: 860;
  line-height: 0.92;
  letter-spacing: -0.06em;
}

.billar-score small {
  font-size: 0.54em;
  font-weight: 760;
  color: #617066;
}

.billar-status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.billar-status-card::before {
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, rgba(241, 246, 240, 0.9) 0%, rgba(250, 243, 232, 0.44) 100%);
}

.billar-status-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
  display: grid;
  gap: 3px;
}

.billar-status-eyebrow {
  color: #6a7a70;
  font-size: 0.62rem;
  font-weight: 820;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.billar-status-title {
  margin: 0;
  color: #213027;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.billar-status-note {
  margin: 0;
  color: #68756b;
  font-size: 0.7rem;
  line-height: 1.28;
}

.billar-status-pill {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(96, 129, 112, 0.08);
  color: #566c61;
  font-size: 0.64rem;
  font-weight: 820;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.billar-stage {
  padding: 8px;
}

.billar-stage::before {
  background:
    radial-gradient(circle at 14% 14%, rgba(118, 171, 139, 0.08), rgba(118, 171, 139, 0) 28%),
    radial-gradient(circle at 86% 84%, rgba(72, 116, 95, 0.1), rgba(72, 116, 95, 0) 26%);
}

.billar-table {
  position: relative;
  z-index: 1;
  display: block;
  width: min(100%, calc((var(--app-dvh, 100dvh) - 168px) * 1.744));
  height: auto;
  max-height: calc(var(--app-dvh, 100dvh) - 168px);
  margin: 0 auto;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.billar-orientation-note {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(220px, 42dvh, 320px);
}

.billar-orientation-card {
  display: grid;
  gap: 6px;
  width: min(100%, 400px);
  margin: 0 auto;
  padding: 16px 15px;
  border-radius: 20px;
  border: 1px solid rgba(210, 197, 171, 0.84);
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, rgba(255, 252, 246, 0.98) 0%, rgba(246, 238, 226, 0.98) 100%);
  box-shadow:
    0 18px 28px rgba(54, 48, 40, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  text-align: center;
}

.billar-orientation-eyebrow {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 22px;
  margin: 0 auto;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(72, 116, 95, 0.1);
  color: #47695a;
  font-size: 0.6rem;
  font-weight: 820;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.billar-orientation-title {
  margin: 0;
  color: #213029;
  font-size: 0.96rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.billar-orientation-copy {
  margin: 0;
  color: #607065;
  font-size: 0.8rem;
  line-height: 1.34;
}

.billar-table-frame {
  fill: #f4eee1;
  stroke: #cfbf9f;
  stroke-width: 2.2;
}

.billar-rail {
  fill: #7f5c38;
  stroke: #5f4326;
  stroke-width: 2.6;
}

.billar-rail-inset {
  fill: #9b7448;
  opacity: 0.18;
}

.billar-felt {
  fill: url(#billarFeltFill);
  stroke: rgba(222, 232, 225, 0.8);
  stroke-width: 1.5;
}

.billar-felt-grid {
  fill: url(#billarFeltPattern);
  opacity: 0.14;
}

.billar-felt-glow {
  opacity: 0.14;
}

.billar-pocket {
  fill: #2a211a;
}

.billar-pocket-mouth {
  fill: rgba(18, 23, 30, 0.42);
}

.billar-pocket-inner {
  fill: rgba(0, 0, 0, 0.22);
}

.billar-diamond {
  fill: rgba(250, 246, 236, 0.78);
}

.billar-head-string {
  fill: none;
  stroke: rgba(235, 244, 239, 0.34);
  stroke-width: 2.4;
  stroke-linecap: round;
}

.billar-table-spot {
  fill: rgba(244, 249, 246, 0.82);
  stroke: rgba(50, 73, 60, 0.3);
  stroke-width: 1.8;
}

.billar-ball {
  filter: drop-shadow(0 10px 12px rgba(35, 31, 26, 0.18));
}

.billar-ball-shadow {
  fill: rgba(33, 28, 22, 0.13);
}

.billar-ball-shell {
  stroke-width: 2.2;
}

.billar-ball-highlight {
  fill: rgba(255, 255, 255, 0.88);
}

.billar-cue-hit {
  fill: transparent;
  cursor: pointer;
}

.billar-table.is-disabled .billar-cue-hit {
  cursor: default;
}

.billar-aim-line {
  stroke-linecap: round;
  filter: drop-shadow(0 6px 10px rgba(34, 53, 45, 0.12));
}

.billar-aim-line.is-pull {
  stroke: rgba(72, 105, 90, 0.24);
}

.billar-aim-line.is-vector {
  stroke: rgba(83, 113, 97, 0.94);
}

.billar-aim-anchor {
  fill: rgba(255, 255, 255, 0.92);
  stroke: rgba(84, 119, 101, 0.94);
  stroke-width: 4;
}

.billar-aim-tip {
  stroke-width: 3;
}

@keyframes billarTurnPulse {
  0%,
  100% {
    opacity: 0.34;
    stroke-width: 6;
  }

  50% {
    opacity: 0.76;
    stroke-width: 8;
  }
}

.billar-cue-ring {
  fill: none;
  stroke: rgba(250, 250, 246, 0.84);
  stroke-width: 5.4;
  opacity: 0;
}

.billar-cue-ball.is-active .billar-cue-ring {
  opacity: 1;
  animation: billarTurnPulse 2100ms ease-in-out infinite;
}

.billar-config-grid {
  display: grid;
  gap: 16px;
}

@media (max-width: 760px) {
  .billar-hud {
    grid-template-columns: 1fr;
  }

  .billar-player-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
  }
}

@media (max-width: 760px) {
  .app-shell:not(.app-shell-home) .screen.game-screen-billar {
    gap: 6px;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar {
    padding: 8px 10px;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar-title {
    font-size: 1rem;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar-sub {
    display: none;
  }

  .billar-player-card,
  .billar-status-card {
    padding: 8px 10px;
    border-radius: 18px;
  }

  .billar-player-name {
    font-size: 0.78rem;
  }

  .billar-status-title {
    font-size: 0.82rem;
  }

  .billar-status-note {
    font-size: 0.68rem;
  }

  .billar-stage {
    padding: 8px;
    border-radius: 20px;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .actions-bottom {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .actions-bottom .btn {
    min-width: 0;
    height: 46px;
    padding: 0 8px;
    font-size: 0.8rem;
    line-height: 1.12;
    white-space: normal;
    text-align: center;
  }
}

@media (max-width: 1180px) and (max-height: 1366px) and (orientation: portrait) {
  .app-shell:not(.app-shell-home) .screen.game-screen-billar {
    width: min(100%, calc(100vw - 8px));
    min-height: calc(100dvh - 10px);
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .board-wrap {
    padding: 0;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .actions-bottom {
    display: none;
  }

  .billar-shell {
    display: none;
  }

  .billar-orientation-note {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: clamp(280px, 56dvh, 420px);
  }
}

@media (max-width: 1024px) and (orientation: landscape) and (max-height: 760px) {
  .app-shell:not(.app-shell-home):has(.screen.game-screen-billar) {
    width: min(100%, calc(100vw - 8px));
    margin: 0 auto 4px;
  }

  .app-shell:not(.app-shell-home) .screen.game-screen-billar {
    width: min(100%, calc(100vw - 8px));
    min-height: calc(100dvh - 8px);
    --screen-pad: 4px;
    padding: 4px;
    border-radius: 18px;
    gap: 4px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar {
    margin: -4px -4px 8px;
    padding: 1px 8px;
    border-radius: 16px 16px 12px 12px;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar-sub {
    display: none;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar-main {
    gap: 8px;
    align-items: center;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar-title {
    font-size: 0.88rem;
    line-height: 1.02;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar .btn {
    min-height: 28px;
    height: 28px;
    padding: 0 9px;
    font-size: 0.7rem;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .topbar .btn-icon {
    width: 28px;
    height: 28px;
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .board-wrap {
    padding: 0;
  }

  .billar-shell {
    gap: 6px;
  }

  .billar-hud {
    grid-template-columns: minmax(0, 0.92fr) minmax(180px, 0.72fr) minmax(0, 0.92fr);
    gap: 4px;
  }

  .billar-player-card,
  .billar-status-card {
    padding: 7px 8px;
    border-radius: 18px;
  }

  .billar-player-name {
    font-size: 0.78rem;
  }

  .billar-player-role,
  .billar-status-note {
    display: none;
  }

  .billar-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 20px;
  }

  .billar-table {
    width: auto;
    max-width: 100%;
    height: calc(100dvh - 170px);
  }

  .app-shell:not(.app-shell-home) .game-screen-billar .actions-bottom {
    display: none;
  }
}

body.game-landscape-mobile-active .game-screen-billar .board-wrap {
  padding: 0;
}

body.game-landscape-mobile-active .billar-shell {
  position: relative;
  height: 100%;
  min-height: 0;
  gap: 0;
}

body.game-landscape-mobile-active .billar-hud {
  position: absolute;
  inset: 0 0 auto;
  z-index: 16;
  width: min(100%, 760px);
  margin: 0 auto;
  grid-template-columns: minmax(0, 0.86fr) minmax(160px, 0.72fr) minmax(0, 0.86fr);
  gap: 4px;
}

body.game-landscape-mobile-active .billar-player-card,
body.game-landscape-mobile-active .billar-status-card {
  padding: 6px 8px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 253, 249, 0.84) 0%, rgba(246, 241, 234, 0.74) 100%);
  box-shadow:
    0 8px 16px rgba(39, 34, 29, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.68);
}

body.game-landscape-mobile-active .billar-player-name {
  font-size: 0.72rem;
}

body.game-landscape-mobile-active .billar-player-role,
body.game-landscape-mobile-active .billar-status-note {
  display: none;
}

body.game-landscape-mobile-active .billar-score {
  font-size: 1.2rem;
}

body.game-landscape-mobile-active .billar-status-eyebrow {
  font-size: 0.54rem;
}

body.game-landscape-mobile-active .billar-status-title {
  font-size: 0.72rem;
}

body.game-landscape-mobile-active .billar-status-pill {
  min-height: 20px;
  padding: 0 8px;
  font-size: 0.54rem;
}

body.game-landscape-mobile-active .billar-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 24px;
}

body.game-landscape-mobile-active .billar-table {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}
`;

function ensureBilliardsStyles() {
  if (document.getElementById(BILLIARDS_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = BILLIARDS_STYLE_ID;
  style.textContent = BILLIARDS_STYLES;
  document.head.appendChild(style);
}

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

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function playerName(players, slot) {
  const found = Array.isArray(players) ? players.find((player) => player.slot === slot) : null;
  return found?.name || `Jugador ${slot + 1}`;
}

function teamMeta(slot) {
  return TEAM_META[Math.abs(Number(slot) || 0) % TEAM_META.length];
}

function targetMeta(index) {
  return TARGET_BALL_META[Math.abs(Number(index) || 0) % TARGET_BALL_META.length];
}

function normalizeVariant() {
  return "mesa-corta";
}

function cueSpawnXForSlot(slot) {
  return slot === 0 ? FELT_X + FELT_WIDTH * 0.22 : FELT_X + FELT_WIDTH * 0.78;
}

function cueSpawnCandidates(slot) {
  const x = cueSpawnXForSlot(slot);
  const centerY = TABLE_HEIGHT / 2;
  const offsets = [0, -58, 58, -118, 118, -176, 176];
  return offsets.map((offset) => ({ x, y: centerY + offset }));
}

function createCueBall(slot = 0) {
  return {
    id: "cue",
    kind: "cue",
    x: cueSpawnXForSlot(slot),
    y: TABLE_HEIGHT / 2,
    vx: 0,
    vy: 0,
    r: BALL_RADIUS,
    pocketed: false
  };
}

function createTargetBalls() {
  const gap = BALL_RADIUS * 2 + 4;
  const originX = FELT_X + FELT_WIDTH * 0.64;
  const originY = TABLE_HEIGHT / 2;
  const positions = [
    [0, 0],
    [gap, -gap / 2],
    [gap, gap / 2],
    [gap * 2, -gap],
    [gap * 2, gap]
  ];

  return positions.slice(0, TARGET_BALL_COUNT).map(([offsetX, offsetY], index) => ({
    id: `target-${index + 1}`,
    kind: "target",
    x: originX + offsetX,
    y: originY + offsetY,
    vx: 0,
    vy: 0,
    r: BALL_RADIUS,
    pocketed: false,
    paletteIndex: index
  }));
}

function createInitialBalls() {
  return [createCueBall(0), ...createTargetBalls()];
}

function cloneBall(ball) {
  return { ...ball };
}

function cloneState(state) {
  return {
    ...state,
    points: [...state.points],
    balls: state.balls.map(cloneBall),
    shot: state.shot
      ? {
          ...state.shot,
          pocketedTargetIds: [...state.shot.pocketedTargetIds]
        }
      : null,
    result: state.result ? { ...state.result } : null,
    lastEvent: state.lastEvent ? { ...state.lastEvent } : null
  };
}

function activeBalls(state) {
  return state.balls.filter((ball) => !ball.pocketed);
}

function cueBallFromState(state) {
  return state.balls.find((ball) => ball.kind === "cue") || null;
}

function speedOf(ball) {
  return Math.hypot(ball.vx, ball.vy);
}

function stopBall(ball) {
  ball.vx = 0;
  ball.vy = 0;
}

function stopAllBalls(state) {
  state.balls.forEach(stopBall);
}

function applyDeceleration(ball, deltaSeconds) {
  const speed = speedOf(ball);
  if (speed <= 0) {
    stopBall(ball);
    return;
  }

  const nextSpeed = Math.max(0, speed - BALL_DECEL * deltaSeconds);
  if (nextSpeed <= 0.01) {
    stopBall(ball);
    return;
  }

  const ratio = nextSpeed / speed;
  ball.vx *= ratio;
  ball.vy *= ratio;
}

function withinTopPocketMouth(x) {
  const center = TABLE_WIDTH / 2;
  return Math.abs(x - center) <= SIDE_POCKET_MOUTH / 2;
}

function withinBottomPocketMouth(x) {
  return withinTopPocketMouth(x);
}

function withinLeftCornerPocket(y) {
  return y <= FELT_Y + CORNER_POCKET_MOUTH || y >= FELT_Y + FELT_HEIGHT - CORNER_POCKET_MOUTH;
}

function withinRightCornerPocket(y) {
  return withinLeftCornerPocket(y);
}

function pocketCenters() {
  return [
    { x: FELT_X, y: FELT_Y },
    { x: FELT_X + FELT_WIDTH / 2, y: FELT_Y },
    { x: FELT_X + FELT_WIDTH, y: FELT_Y },
    { x: FELT_X, y: FELT_Y + FELT_HEIGHT },
    { x: FELT_X + FELT_WIDTH / 2, y: FELT_Y + FELT_HEIGHT },
    { x: FELT_X + FELT_WIDTH, y: FELT_Y + FELT_HEIGHT }
  ];
}

function detectPocket(ball) {
  const threshold = POCKET_RADIUS - 2;
  return pocketCenters().some((pocket) => Math.hypot(ball.x - pocket.x, ball.y - pocket.y) <= threshold);
}

function markBallPocketed(state, ball) {
  if (!ball || ball.pocketed) {
    return;
  }

  ball.pocketed = true;
  stopBall(ball);

  if (!state.shot) {
    return;
  }

  if (ball.kind === "cue") {
    state.shot.scratch = true;
    return;
  }

  if (ball.kind === "target" && !state.shot.pocketedTargetIds.includes(ball.id)) {
    state.shot.pocketedTargetIds.push(ball.id);
    state.points[state.shot.actorSlot] += 1;

    if (state.points[state.shot.actorSlot] >= WIN_SCORE) {
      state.phase = "finished";
      state.winnerSlot = state.shot.actorSlot;
      state.result = {
        type: "win",
        winnerSlot: state.shot.actorSlot
      };
      state.lastEvent = {
        eyebrow: "Mesa cerrada",
        title: `${teamMeta(state.shot.actorSlot).short} llega a ${WIN_SCORE}`,
        note: "La partida termina en cuanto entra la tercera bola."
      };
      state.shot = null;
      state.settleSinceMs = null;
      stopAllBalls(state);
    }
  }
}

function bounceBallAgainstRails(ball) {
  if (ball.pocketed) {
    return;
  }

  const minX = FELT_X + ball.r;
  const maxX = FELT_X + FELT_WIDTH - ball.r;
  const minY = FELT_Y + ball.r;
  const maxY = FELT_Y + FELT_HEIGHT - ball.r;

  if (ball.x < minX) {
    if (!withinLeftCornerPocket(ball.y)) {
      ball.x = minX;
      ball.vx = Math.abs(ball.vx) * WALL_BOUNCE;
    }
  } else if (ball.x > maxX) {
    if (!withinRightCornerPocket(ball.y)) {
      ball.x = maxX;
      ball.vx = -Math.abs(ball.vx) * WALL_BOUNCE;
    }
  }

  if (ball.y < minY) {
    if (!withinTopPocketMouth(ball.x) && ball.x > FELT_X + CORNER_POCKET_MOUTH && ball.x < FELT_X + FELT_WIDTH - CORNER_POCKET_MOUTH) {
      ball.y = minY;
      ball.vy = Math.abs(ball.vy) * WALL_BOUNCE;
    }
  } else if (ball.y > maxY) {
    if (!withinBottomPocketMouth(ball.x) && ball.x > FELT_X + CORNER_POCKET_MOUTH && ball.x < FELT_X + FELT_WIDTH - CORNER_POCKET_MOUTH) {
      ball.y = maxY;
      ball.vy = -Math.abs(ball.vy) * WALL_BOUNCE;
    }
  }
}

function resolveBallCollision(ballA, ballB) {
  if (ballA.pocketed || ballB.pocketed) {
    return;
  }

  let dx = ballB.x - ballA.x;
  let dy = ballB.y - ballA.y;
  let distance = Math.hypot(dx, dy);
  const minDistance = ballA.r + ballB.r;

  if (distance === 0) {
    dx = minDistance;
    dy = 0;
    distance = minDistance;
  }

  if (distance >= minDistance) {
    return;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = minDistance - distance;

  ballA.x -= nx * overlap * 0.5;
  ballA.y -= ny * overlap * 0.5;
  ballB.x += nx * overlap * 0.5;
  ballB.y += ny * overlap * 0.5;

  const relativeVx = ballB.vx - ballA.vx;
  const relativeVy = ballB.vy - ballA.vy;
  const alongNormal = relativeVx * nx + relativeVy * ny;

  if (alongNormal >= 0) {
    return;
  }

  const impulse = (-(1 + BALL_RESTITUTION) * alongNormal) / 2;

  ballA.vx -= impulse * nx;
  ballA.vy -= impulse * ny;
  ballB.vx += impulse * nx;
  ballB.vy += impulse * ny;
}

function resolveAllCollisions(state) {
  for (let index = 0; index < state.balls.length; index += 1) {
    for (let inner = index + 1; inner < state.balls.length; inner += 1) {
      resolveBallCollision(state.balls[index], state.balls[inner]);
    }
  }
}

function ballsAreSettled(state) {
  return activeBalls(state).every((ball) => speedOf(ball) <= STOP_SPEED);
}

function findCueRespot(state, slot) {
  const cue = cueBallFromState(state);
  const radius = cue?.r || BALL_RADIUS;
  const blockers = state.balls.filter((ball) => !ball.pocketed && ball.kind !== "cue");

  for (const candidate of cueSpawnCandidates(slot)) {
    const clampedY = clamp(candidate.y, FELT_Y + radius + 12, FELT_Y + FELT_HEIGHT - radius - 12);
    const point = { x: candidate.x, y: clampedY };
    const overlaps = blockers.some((ball) => Math.hypot(ball.x - point.x, ball.y - point.y) < ball.r + radius + 8);
    if (!overlaps) {
      return point;
    }
  }

  return {
    x: cueSpawnXForSlot(slot),
    y: TABLE_HEIGHT / 2
  };
}

function respotCueBall(state, slot) {
  const cue = cueBallFromState(state);
  if (!cue) {
    return;
  }

  const next = findCueRespot(state, slot);
  cue.pocketed = false;
  cue.x = next.x;
  cue.y = next.y;
  stopBall(cue);
}

function settleShot(state) {
  if (!state.shot) {
    return state;
  }

  const actorSlot = state.shot.actorSlot;
  const otherSlot = actorSlot === 0 ? 1 : 0;
  const scored = state.shot.pocketedTargetIds.length;
  const scratched = state.shot.scratch;

  if (state.result?.type === "win") {
    return state;
  }

  let nextTurn = actorSlot;
  let lastEvent = null;

  if (scratched) {
    nextTurn = otherSlot;
    respotCueBall(state, nextTurn);
    lastEvent = scored > 0
      ? {
          eyebrow: "Punto y blanca",
          title: `${teamMeta(nextTurn).short} entra al tiro`,
          note: "La bola valida cuenta, pero la blanca termina el turno."
        }
      : {
          eyebrow: "Falta",
          title: `${teamMeta(nextTurn).short} toma la mesa`,
          note: "La blanca vuelve a la zona de salida del rival."
        };
  } else if (scored > 0) {
    nextTurn = actorSlot;
    lastEvent = {
      eyebrow: scored > 1 ? "Tiro fino" : "Sigue el turno",
      title: `${teamMeta(actorSlot).short} suma ${scored}`,
      note: `Lleva ${state.points[actorSlot]} de ${WIN_SCORE} y vuelve a tirar.`
    };
  } else {
    nextTurn = otherSlot;
    lastEvent = {
      eyebrow: "Cambio de turno",
      title: `${teamMeta(nextTurn).short} al tiro`,
      note: "No entró ninguna bola en esta jugada."
    };
  }

  state.turnSlot = nextTurn;
  state.turnNumber += 1;
  state.phase = "ready";
  state.shot = null;
  state.settleSinceMs = null;
  state.lastEvent = lastEvent;
  stopAllBalls(state);
  return state;
}

function advanceSimulation(state, deltaMs, nowMs) {
  if (state.phase !== "rolling" || !state.shot) {
    return state;
  }

  const deltaSeconds = deltaMs / 1000;

  state.balls.forEach((ball) => {
    if (ball.pocketed) {
      return;
    }
    ball.x += ball.vx * deltaSeconds;
    ball.y += ball.vy * deltaSeconds;
  });

  state.balls.forEach((ball) => {
    if (ball.pocketed) {
      return;
    }
    if (detectPocket(ball)) {
      markBallPocketed(state, ball);
    }
  });

  if (state.phase === "finished") {
    return state;
  }

  state.balls.forEach((ball) => {
    bounceBallAgainstRails(ball);
  });

  resolveAllCollisions(state);

  state.balls.forEach((ball) => {
    if (ball.pocketed) {
      return;
    }
    if (detectPocket(ball)) {
      markBallPocketed(state, ball);
    }
  });

  if (state.phase === "finished") {
    return state;
  }

  state.balls.forEach((ball) => {
    if (ball.pocketed) {
      return;
    }
    applyDeceleration(ball, deltaSeconds);
    if (speedOf(ball) < 1.2) {
      stopBall(ball);
    }
  });

  if (ballsAreSettled(state)) {
    if (!state.settleSinceMs) {
      state.settleSinceMs = nowMs;
    } else if (nowMs - state.settleSinceMs >= SETTLE_TIME_MS) {
      settleShot(state);
    }
  } else {
    state.settleSinceMs = null;
  }

  return state;
}

function buildStatusCopy(state, players = []) {
  if (state.result?.type === "win" && Number.isInteger(state.winnerSlot)) {
    return {
      eyebrow: "Mesa cerrada",
      title: `${playerName(players, state.winnerSlot)} gana`,
      note: `Embocó ${state.points[state.winnerSlot]} bolas antes que el rival.`
    };
  }

  if (state.phase === "rolling") {
    return {
      eyebrow: "Mesa en juego",
      title: "Resolviendo la jugada",
      note: "Espera a que todas las bolas se detengan."
    };
  }

  if (state.lastEvent) {
    return state.lastEvent;
  }

  const activeSlot = Number(state.turnSlot) || 0;
  return {
    eyebrow: "Turno",
    title: `${playerName(players, activeSlot)} al tiro`,
    note: "Apunta una linea corta y suelta para golpear la blanca."
  };
}

function normalizeVelocity(vx, vy) {
  const speed = Math.hypot(vx, vy);
  if (speed <= 0) {
    return { x: 0, y: 0 };
  }

  if (speed <= MAX_SHOT_SPEED) {
    return { x: vx, y: vy };
  }

  const scale = MAX_SHOT_SPEED / speed;
  return { x: vx * scale, y: vy * scale };
}

function createState() {
  return {
    phase: "ready",
    variant: normalizeVariant(),
    turnSlot: 0,
    turnNumber: 1,
    points: [0, 0],
    balls: createInitialBalls(),
    shot: null,
    settleSinceMs: null,
    winnerSlot: null,
    result: null,
    lastEvent: {
      eyebrow: "Mesa corta",
      title: "Coral abre la partida",
      note: "Primero a 3 bolas embocadas."
    }
  };
}

function shootCue(state, action, actorSlot) {
  if (state.result) {
    return { ok: false, reason: "finished" };
  }

  if (state.phase !== "ready") {
    return { ok: false, reason: "invalid" };
  }

  if (actorSlot !== state.turnSlot) {
    return { ok: false, reason: "turn" };
  }

  const cue = cueBallFromState(state);
  if (!cue || cue.pocketed) {
    return { ok: false, reason: "invalid" };
  }

  const velocityX = Number(action.velocityX);
  const velocityY = Number(action.velocityY);
  if (!Number.isFinite(velocityX) || !Number.isFinite(velocityY)) {
    return { ok: false, reason: "invalid" };
  }

  const speed = Math.hypot(velocityX, velocityY);
  if (speed < MIN_SHOT_DISTANCE * 4.6) {
    return { ok: false, reason: "invalid" };
  }

  const next = cloneState(state);
  const nextCue = cueBallFromState(next);
  const normalized = normalizeVelocity(velocityX, velocityY);

  next.phase = "rolling";
  next.lastEvent = null;
  next.settleSinceMs = null;
  next.shot = {
    actorSlot,
    pocketedTargetIds: [],
    scratch: false,
    power01: clamp(Number(action.power01) || 0, 0, 1)
  };

  nextCue.vx = normalized.x;
  nextCue.vy = normalized.y;

  return { ok: true, state: next };
}

function tickState(state, action) {
  if (state.phase !== "rolling") {
    return { ok: false, reason: "invalid" };
  }

  const deltaMs = clamp(Number(action.deltaMs) || 0, 0, 96);
  const nowMs = Number(action.nowMs) || Date.now();
  if (deltaMs <= 0) {
    return { ok: true, state };
  }

  const next = cloneState(state);
  let remaining = deltaMs;

  while (remaining > 0 && next.phase === "rolling") {
    const step = Math.min(MAX_SIM_STEP_MS, remaining);
    advanceSimulation(next, step, nowMs);
    remaining -= step;
  }

  return { ok: true, state: next };
}

function renderConfigPanel() {
  return `
    <div class="billar-config-grid">
      <div class="block">
        <h3 class="block-title">Formato</h3>
        <div class="player-count-row">
          <span class="pill is-active">Mesa corta</span>
          <span class="pill">A ${WIN_SCORE} puntos</span>
        </div>
        <p class="info-line">Cinco bolas objetivo, blanca unica y turnos encadenados si embocas.</p>
      </div>
    </div>
  `;
}

function renderCardIllustration() {
  return `
    <div class="game-illustration" aria-hidden="true">
      <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
        <defs>
          <linearGradient id="billarCardFrame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f7f5f0" />
            <stop offset="100%" stop-color="#ded7ca" />
          </linearGradient>
          <linearGradient id="billarCardFelt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f5d4d" />
            <stop offset="100%" stop-color="#08382e" />
          </linearGradient>
          <pattern id="billarCardPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.9" fill="rgba(255,255,255,0.2)" />
          </pattern>
        </defs>
        <rect x="12" y="10" width="136" height="74" rx="24" fill="url(#billarCardFrame)" stroke="rgba(15,23,42,0.18)"></rect>
        <rect x="20" y="18" width="120" height="58" rx="18" fill="#1f2937" stroke="#0f172a"></rect>
        <rect x="28" y="24" width="104" height="46" rx="16" fill="url(#billarCardFelt)" stroke="rgba(226,232,240,0.56)" stroke-width="1.1"></rect>
        <rect x="28" y="24" width="104" height="46" rx="16" fill="url(#billarCardPattern)" opacity="0.38"></rect>
        <g fill="#020617">
          <circle cx="28" cy="24" r="5.4"></circle>
          <circle cx="80" cy="24" r="4.8"></circle>
          <circle cx="132" cy="24" r="5.4"></circle>
          <circle cx="28" cy="70" r="5.4"></circle>
          <circle cx="80" cy="70" r="4.8"></circle>
          <circle cx="132" cy="70" r="5.4"></circle>
        </g>
        <path d="M44 47L66 47" stroke="rgba(255,255,255,0.7)" stroke-width="2.8" stroke-linecap="round"></path>
        <circle cx="42" cy="47" r="5.8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.4"></circle>
        <g transform="translate(102 47)">
          <circle cx="0" cy="0" r="5.6" fill="#f97316" stroke="#c2410c" stroke-width="1.2"></circle>
          <circle cx="8" cy="-5.6" r="5.6" fill="#facc15" stroke="#ca8a04" stroke-width="1.2"></circle>
          <circle cx="8" cy="5.6" r="5.6" fill="#60a5fa" stroke="#2563eb" stroke-width="1.2"></circle>
          <circle cx="16" cy="0" r="5.6" fill="#fb7185" stroke="#e11d48" stroke-width="1.2"></circle>
        </g>
      </svg>
    </div>
  `;
}

function renderTargetBall(ball) {
  const meta = targetMeta(ball.paletteIndex);
  return `
    <g class="billar-ball" transform="translate(${round(ball.x, 2)} ${round(ball.y, 2)})">
      <ellipse class="billar-ball-shadow" cx="1.6" cy="${BALL_RADIUS + 4}" rx="${BALL_RADIUS * 0.94}" ry="5.2"></ellipse>
      <circle class="billar-ball-shell" cx="0" cy="0" r="${BALL_RADIUS}" fill="${meta.fill}" stroke="${meta.stroke}"></circle>
      <circle cx="0" cy="0" r="${BALL_RADIUS * 0.48}" fill="${meta.shine}" opacity="0.94"></circle>
      <circle class="billar-ball-highlight" cx="${-BALL_RADIUS * 0.28}" cy="${-BALL_RADIUS * 0.34}" r="${BALL_RADIUS * 0.22}"></circle>
    </g>
  `;
}

function renderCueBall(ball, isActive) {
  return `
    <g class="billar-ball billar-cue-ball ${isActive ? "is-active" : ""}" transform="translate(${round(ball.x, 2)} ${round(ball.y, 2)})">
      <ellipse class="billar-ball-shadow" cx="1.6" cy="${BALL_RADIUS + 4}" rx="${BALL_RADIUS * 0.94}" ry="5.2"></ellipse>
      <circle class="billar-cue-ring" cx="0" cy="0" r="${BALL_RADIUS + 9}"></circle>
      <circle class="billar-ball-shell" cx="0" cy="0" r="${BALL_RADIUS}" fill="#fffaf1" stroke="#d8c6a2"></circle>
      <circle class="billar-ball-highlight" cx="${-BALL_RADIUS * 0.26}" cy="${-BALL_RADIUS * 0.32}" r="${BALL_RADIUS * 0.22}"></circle>
      <circle class="billar-cue-hit" data-billar-cue-hit cx="0" cy="0" r="${BALL_RADIUS + 18}"></circle>
    </g>
  `;
}

function renderTable(state, canAct) {
  const cue = cueBallFromState(state);
  const isCueActive = Boolean(canAct && state.phase === "ready" && cue && !cue.pocketed);
  const ballsMarkup = state.balls
    .filter((ball) => !ball.pocketed)
    .map((ball) => {
      if (ball.kind === "cue") {
        return renderCueBall(ball, isCueActive);
      }
      return renderTargetBall(ball);
    })
    .join("");

  const diamonds = [
    [FELT_X + FELT_WIDTH * 0.2, FELT_Y - 22],
    [FELT_X + FELT_WIDTH * 0.4, FELT_Y - 22],
    [FELT_X + FELT_WIDTH * 0.6, FELT_Y - 22],
    [FELT_X + FELT_WIDTH * 0.8, FELT_Y - 22],
    [FELT_X + FELT_WIDTH * 0.2, FELT_Y + FELT_HEIGHT + 22],
    [FELT_X + FELT_WIDTH * 0.4, FELT_Y + FELT_HEIGHT + 22],
    [FELT_X + FELT_WIDTH * 0.6, FELT_Y + FELT_HEIGHT + 22],
    [FELT_X + FELT_WIDTH * 0.8, FELT_Y + FELT_HEIGHT + 22]
  ]
    .map(([x, y]) => `<rect class="billar-diamond" x="${round(x - 4, 2)}" y="${round(y - 3, 2)}" width="8" height="6" rx="1.4"></rect>`)
    .join("");

  return `
    <svg class="billar-table ${!isCueActive ? "is-disabled" : ""}" data-billar-table viewBox="0 0 ${TABLE_WIDTH} ${TABLE_HEIGHT}" preserveAspectRatio="xMidYMid meet" role="presentation" aria-label="Mesa de billar">
      <defs>
        <linearGradient id="billarFeltFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#11624f" />
          <stop offset="100%" stop-color="#0a3b31" />
        </linearGradient>
        <pattern id="billarFeltPattern" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.15" fill="rgba(255,255,255,0.18)"></circle>
        </pattern>
      </defs>

      <rect class="billar-table-frame" x="22" y="22" width="${TABLE_WIDTH - 44}" height="${TABLE_HEIGHT - 44}" rx="48"></rect>
      <rect class="billar-rail" x="44" y="44" width="${TABLE_WIDTH - 88}" height="${TABLE_HEIGHT - 88}" rx="40"></rect>
      <rect class="billar-rail-inset" x="54" y="54" width="${TABLE_WIDTH - 108}" height="${TABLE_HEIGHT - 108}" rx="34"></rect>
      <rect class="billar-felt" x="${FELT_X}" y="${FELT_Y}" width="${FELT_WIDTH}" height="${FELT_HEIGHT}" rx="24"></rect>
      <rect class="billar-felt-grid" x="${FELT_X}" y="${FELT_Y}" width="${FELT_WIDTH}" height="${FELT_HEIGHT}" rx="24"></rect>
      <ellipse class="billar-felt-glow" cx="${TABLE_WIDTH / 2}" cy="${TABLE_HEIGHT / 2}" rx="${FELT_WIDTH * 0.42}" ry="${FELT_HEIGHT * 0.36}" fill="rgba(255,255,255,0.16)"></ellipse>
      <path class="billar-head-string" d="M ${round(FELT_X + FELT_WIDTH * 0.24, 2)} ${FELT_Y + 26} V ${FELT_Y + FELT_HEIGHT - 26}"></path>
      <circle class="billar-table-spot" cx="${round(FELT_X + FELT_WIDTH * 0.24, 2)}" cy="${TABLE_HEIGHT / 2}" r="4.6"></circle>
      <circle class="billar-table-spot" cx="${round(FELT_X + FELT_WIDTH * 0.74, 2)}" cy="${TABLE_HEIGHT / 2}" r="4.6"></circle>

      <g aria-hidden="true">
        ${diamonds}
      </g>

      <g aria-hidden="true">
        <ellipse class="billar-pocket-mouth" cx="${FELT_X}" cy="${FELT_Y}" rx="${POCKET_RADIUS + 20}" ry="${POCKET_RADIUS + 13}"></ellipse>
        <ellipse class="billar-pocket-mouth" cx="${FELT_X + FELT_WIDTH / 2}" cy="${FELT_Y}" rx="${POCKET_RADIUS + 18}" ry="${POCKET_RADIUS + 10}"></ellipse>
        <ellipse class="billar-pocket-mouth" cx="${FELT_X + FELT_WIDTH}" cy="${FELT_Y}" rx="${POCKET_RADIUS + 20}" ry="${POCKET_RADIUS + 13}"></ellipse>
        <ellipse class="billar-pocket-mouth" cx="${FELT_X}" cy="${FELT_Y + FELT_HEIGHT}" rx="${POCKET_RADIUS + 20}" ry="${POCKET_RADIUS + 13}"></ellipse>
        <ellipse class="billar-pocket-mouth" cx="${FELT_X + FELT_WIDTH / 2}" cy="${FELT_Y + FELT_HEIGHT}" rx="${POCKET_RADIUS + 18}" ry="${POCKET_RADIUS + 10}"></ellipse>
        <ellipse class="billar-pocket-mouth" cx="${FELT_X + FELT_WIDTH}" cy="${FELT_Y + FELT_HEIGHT}" rx="${POCKET_RADIUS + 20}" ry="${POCKET_RADIUS + 13}"></ellipse>
        <circle class="billar-pocket" cx="${FELT_X}" cy="${FELT_Y}" r="${POCKET_RADIUS + 8}"></circle>
        <circle class="billar-pocket" cx="${FELT_X + FELT_WIDTH / 2}" cy="${FELT_Y}" r="${POCKET_RADIUS + 5}"></circle>
        <circle class="billar-pocket" cx="${FELT_X + FELT_WIDTH}" cy="${FELT_Y}" r="${POCKET_RADIUS + 8}"></circle>
        <circle class="billar-pocket" cx="${FELT_X}" cy="${FELT_Y + FELT_HEIGHT}" r="${POCKET_RADIUS + 8}"></circle>
        <circle class="billar-pocket" cx="${FELT_X + FELT_WIDTH / 2}" cy="${FELT_Y + FELT_HEIGHT}" r="${POCKET_RADIUS + 5}"></circle>
        <circle class="billar-pocket" cx="${FELT_X + FELT_WIDTH}" cy="${FELT_Y + FELT_HEIGHT}" r="${POCKET_RADIUS + 8}"></circle>
      </g>

      <g data-billar-aim-layer></g>
      ${ballsMarkup}
    </svg>
  `;
}

function renderShell(state, canAct, uiState) {
  if (uiState?.viewport?.isPortraitHandheld) {
    return `
      <section class="billar-orientation-note" aria-live="polite">
        <article class="billar-orientation-card">
          <span class="billar-orientation-eyebrow">Mejor en horizontal</span>
          <h3 class="billar-orientation-title">Gira el dispositivo</h3>
          <p class="billar-orientation-copy">La mesa necesita anchura real para apuntar bien y leer el tiro con claridad.</p>
        </article>
      </section>
    `;
  }

  return `
    <section class="billar-shell" data-billar-root data-billar-phase="${escapeHtml(state.phase)}">
      <section class="billar-stage">
        ${renderTable(state, canAct)}
      </section>
    </section>
  `;
}

function worldPointFromClient(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }

  return {
    x: ((clientX - rect.left) / rect.width) * TABLE_WIDTH,
    y: ((clientY - rect.top) / rect.height) * TABLE_HEIGHT
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
  const pullX = anchor.x - handlePoint.x;
  const pullY = anchor.y - handlePoint.y;
  const pullDistance = Math.hypot(pullX, pullY) || 1;
  const dirX = pullX / pullDistance;
  const dirY = pullY / pullDistance;
  const guideLength = 22 + power01 * 68;
  const tipX = anchor.x + dirX * guideLength;
  const tipY = anchor.y + dirY * guideLength;
  const tone = power01 >= 0.72 ? "#de765b" : power01 >= 0.38 ? "#d2a049" : "#6da888";
  const softTone = power01 >= 0.72 ? "rgba(222,118,91,0.22)" : power01 >= 0.38 ? "rgba(210,160,73,0.2)" : "rgba(109,168,136,0.2)";
  const pullWidth = 5 + power01 * 6;
  const vectorWidth = 4.2 + power01 * 4.8;
  const haloRadius = BALL_RADIUS + 8 + power01 * 6;

  return `
    <line class="billar-aim-line is-pull" x1="${round(handlePoint.x, 2)}" y1="${round(handlePoint.y, 2)}" x2="${anchor.x}" y2="${anchor.y}" style="stroke:${softTone};stroke-width:${round(pullWidth + 4, 2)}"></line>
    <line class="billar-aim-line is-vector" x1="${anchor.x}" y1="${anchor.y}" x2="${round(tipX, 2)}" y2="${round(tipY, 2)}" style="stroke:${tone};stroke-width:${round(vectorWidth, 2)}"></line>
    <circle class="billar-aim-anchor" cx="${anchor.x}" cy="${anchor.y}" r="${round(haloRadius, 2)}" style="stroke:${tone}"></circle>
    <circle class="billar-aim-tip" cx="${round(tipX, 2)}" cy="${round(tipY, 2)}" r="${round(5 + power01 * 5, 2)}" style="fill:${softTone};stroke:${tone}"></circle>
  `;
}

function bindBoardElement(boardWrap, { state, players, canAct, dispatchGameAction }) {
  const root = boardWrap.querySelector("[data-billar-root]");
  if (!root || root.dataset.bound === "true") {
    return;
  }

  const svg = root.querySelector("[data-billar-table]");
  const cueHit = root.querySelector("[data-billar-cue-hit]");
  const aimLayer = root.querySelector("[data-billar-aim-layer]");

  if (!svg || !cueHit || !aimLayer) {
    return;
  }

  root.dataset.bound = "true";
  let drag = null;

  function clearAim() {
    aimLayer.innerHTML = "";
    drag = null;
  }

  function updateAim() {
    if (!drag) {
      clearAim();
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
        // Ignora problemas de captura al cerrar el gesto.
      }
    }

    const currentDrag = drag;
    clearAim();

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
    const easedPower = power01 * power01 * 0.74 + power01 * 0.26;
    const speed = MAX_SHOT_SPEED * easedPower;
    const scale = speed / pullDistance;

    await dispatchGameAction({
      type: "shoot",
      velocityX: pullX * scale,
      velocityY: pullY * scale,
      power01,
      nowMs: Date.now()
    });
  }

  cueHit.addEventListener("pointerdown", (event) => {
    if (!canAct || state.phase !== "ready") {
      return;
    }

    const cue = cueBallFromState(state);
    if (!cue || cue.pocketed) {
      return;
    }

    const pointer = worldPointFromClient(svg, event.clientX, event.clientY);
    if (!pointer) {
      return;
    }

    drag = {
      pointerId: event.pointerId,
      anchor: { x: cue.x, y: cue.y },
      pointer,
      handlePoint: pointer
    };

    svg.setPointerCapture(event.pointerId);
    updateAim();
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
    updateAim();
  });

  svg.addEventListener("pointerup", (event) => {
    releaseShot(event).catch(() => {
      clearAim();
    });
  });

  svg.addEventListener("pointercancel", (event) => {
    releaseShot(event, true).catch(() => {
      clearAim();
    });
  });
}

export const billarGame = {
  id: "billar",
  name: "Billar",
  subtitle: "2 jugadores",
  tagline: "Apunta, rebota y emboca",
  minPlayers: 2,
  maxPlayers: 2,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  useLandscapeMobileShell: true,
  allowFullscreen: true,
  rules: [
    { title: "Objetivo", text: "Gana quien emboca 3 bolas objetivo antes que el rival." },
    { title: "Turno", text: "Si metes una bola valida, sumas y vuelves a tirar. Si no entra ninguna, cambia el turno." },
    { title: "Blanca", text: "Si embocas la blanca, el turno termina y se recoloca en la zona fija del rival." },
    { title: "Ayuda visual", text: "Solo veras direccion inicial y potencia. No hay prediccion de rebotes ni de colisiones." }
  ],
  getDefaultOptions() {
    return {
      variant: normalizeVariant()
    };
  },
  normalizeOptions() {
    return {
      variant: normalizeVariant()
    };
  },
  renderConfigPanel() {
    ensureBilliardsStyles();
    return renderConfigPanel();
  },
  createInitialState() {
    return createState();
  },
  getTurnSlot(state) {
    return Number(state?.turnSlot) || 0;
  },
  getResult(state) {
    return state?.result || null;
  },
  getTurnMessage({ state, players }) {
    return buildStatusCopy(state, players).title;
  },
  getShellSubtitle({ state, players }) {
    const status = buildStatusCopy(state, players);
    return `Marcador ${state.points[0]} - ${state.points[1]} · ${status.title}`;
  },
  applyAction({ state, action, actorSlot }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "shoot") {
      return shootCue(state, action, actorSlot);
    }

    if (action.type === "tick") {
      return tickState(state, action);
    }

    return { ok: false, reason: "invalid" };
  },
  renderCardIllustration() {
    ensureBilliardsStyles();
    return renderCardIllustration();
  },
  renderBoard({ state, canAct, uiState }) {
    ensureBilliardsStyles();
    return renderShell(state, canAct, uiState);
  },
  patchBoardElement(boardWrap, { state, canAct, uiState }) {
    ensureBilliardsStyles();
    boardWrap.innerHTML = renderShell(state, canAct, uiState);
    return true;
  },
  bindBoardElement(boardWrap, ctx) {
    ensureBilliardsStyles();
    bindBoardElement(boardWrap, ctx);
  },
  formatResult({ state, players }) {
    const winnerSlot = Number.isInteger(state?.winnerSlot) ? state.winnerSlot : 0;
    return {
      title: `${playerName(players, winnerSlot)} gana`,
      subtitle: `Marcador final ${state.points[0]} - ${state.points[1]}. Mesa corta a ${WIN_SCORE} puntos.`,
      iconText: "◉",
      iconClass: "win"
    };
  }
};
