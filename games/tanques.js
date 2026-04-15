const TANKS_STYLE_ID = "minijuegos-tanques";

const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 620;
const FIELD_FRAME_INSET = 18;

const TANK_TRACK_WIDTH = 74;
const TANK_TRACK_HEIGHT = 18;
const TANK_BODY_WIDTH = 58;
const TANK_BODY_HEIGHT = 24;
const TANK_TURRET_RADIUS = 17;
const TANK_BARREL_LENGTH = 44;
const TANK_HIT_RADIUS = 33;
const PROJECTILE_RADIUS = 7;

const MIN_ANGLE = 18;
const MAX_ANGLE = 82;
const MIN_POWER = 28;
const MAX_POWER = 100;

const MIN_PROJECTILE_SPEED = 290;
const MAX_PROJECTILE_SPEED = 900;
const GRAVITY = 620;
const PROJECTILE_STEP_MS = 8;
const MAX_FRAME_MS = 120;
const PREVIEW_TIME_SECONDS = 0.42;
const TURN_START_SETTLE_MS = 340;
const DAMAGE_EVALUATION_DURATION_MS = 1720;
const EXPLOSION_ANIMATION_MS = 780;
const TOUCH_AIM_ACTIVATION_PX = 14;
const TOUCH_FIRE_MIN_PULL_PX = 26;
const TOUCH_MOVE_TAP_MAX_PX = 10;
const TOUCH_MOVE_TAP_MAX_MS = 240;
const TOUCH_POWER_DISTANCE = 280;

const DAMAGE_RADIUS = 138;
const SPLASH_DAMAGE = 46;
const DIRECT_HIT_BONUS = 20;
const STARTING_HEALTH = 100;
const TURN_FUEL = 120;
const MOVE_STEP = 18;
const MOVE_MIN_X = 86;
const MOVE_MAX_X = FIELD_WIDTH - 86;
const WEAPON_MAX_AMMO = 1;
const STANDARD_CAMERA_ZOOM = 1;
const SIMULATION_CAMERA_ZOOM = 0.82;
const DAMAGE_CAMERA_ZOOM = 0.92;
const CAMERA_Y_OFFSET = 124;
const WIND_MIN = -34;
const WIND_MAX = 34;
const WIND_ACCEL_FACTOR = 7.4;

const TERRAIN_SAMPLE_COUNT = 161;
const TERRAIN_KEYS = ["clasico", "ondulado"];

const TEAM_META = Object.freeze([
  {
    name: "Equipo coral",
    short: "Coral",
    fill: "#de7559",
    stroke: "#b3543d",
    soft: "#fff1ea",
    glow: "rgba(222, 117, 89, 0.22)"
  },
  {
    name: "Equipo azul",
    short: "Azul",
    fill: "#5a87e8",
    stroke: "#375eb8",
    soft: "#edf4ff",
    glow: "rgba(90, 135, 232, 0.22)"
  }
]);

const TERRAIN_META = Object.freeze({
  clasico: {
    id: "clasico",
    label: "Clasico",
    note: "Lomas suaves y tiro limpio"
  },
  ondulado: {
    id: "ondulado",
    label: "Ondulado",
    note: "Valle central con rebotes mas picados"
  }
});

const TANKS_STYLES = String.raw`
.app-shell:not(.app-shell-home) .screen.game-screen-tanques {
  width: min(1480px, 100%);
  gap: 14px;
}

.game-screen-tanques .topbar {
  padding: 7px 10px;
  gap: 10px;
}

.game-screen-tanques .topbar-title {
  font-size: clamp(1.06rem, 1.74vw, 1.46rem);
}

.game-screen-tanques .topbar-sub {
  font-size: 0.72rem;
}

.game-screen-tanques .topbar .btn {
  min-height: 38px;
  height: 38px;
  padding: 0 12px;
  font-size: 0.76rem;
}

.game-screen-tanques .topbar .btn-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 12px;
}

.game-screen-tanques .topbar .btn-icon-text {
  min-width: 56px;
  padding: 0 10px;
}

.game-screen-tanques .board-wrap {
  display: flex;
  padding: 0;
  min-height: 0;
  overscroll-behavior: contain;
}

.game-screen-tanques .actions-bottom {
  justify-content: center;
  gap: 10px;
}

.game-screen-tanques .actions-bottom .btn {
  min-width: 164px;
}

.tanks-shell {
  width: 100%;
  margin: 0 auto;
  display: block;
  min-height: 0;
  height: 100%;
}

.tanks-strip {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(240px, 0.82fr) minmax(0, 0.95fr);
  gap: 10px;
  align-items: stretch;
}

.tanks-team-card,
.tanks-status-card,
.tanks-stage {
  position: relative;
  overflow: hidden;
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

.tanks-team-card,
.tanks-status-card {
  padding: 12px 14px;
}

.tanks-team-card::before,
.tanks-status-card::before,
.tanks-stage::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tanks-team-card.is-team-0::before {
  background:
    radial-gradient(circle at 12% 16%, rgba(222, 117, 89, 0.2), rgba(222, 117, 89, 0) 34%),
    linear-gradient(140deg, rgba(255, 240, 235, 0.94) 0%, rgba(255, 255, 255, 0) 48%);
}

.tanks-team-card.is-team-1::before {
  background:
    radial-gradient(circle at 88% 14%, rgba(90, 135, 232, 0.2), rgba(90, 135, 232, 0) 34%),
    linear-gradient(220deg, rgba(238, 244, 255, 0.94) 0%, rgba(255, 255, 255, 0) 48%);
}

.tanks-team-card.is-active {
  border-color: rgba(106, 154, 129, 0.62);
  box-shadow:
    0 18px 30px rgba(43, 53, 47, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.74),
    0 0 0 2px rgba(109, 160, 136, 0.08);
}

.tanks-card-head,
.tanks-status-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tanks-team-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.tanks-team-dot {
  width: 15px;
  height: 15px;
  border-radius: 999px;
  flex: 0 0 auto;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.46),
    0 5px 8px rgba(49, 45, 41, 0.12);
}

.tanks-team-card.is-team-0 .tanks-team-dot {
  background: linear-gradient(180deg, #ef8d73 0%, #de7559 100%);
}

.tanks-team-card.is-team-1 .tanks-team-dot {
  background: linear-gradient(180deg, #83aaff 0%, #5a87e8 100%);
}

.tanks-team-name {
  margin: 0;
  color: #233026;
  font-size: 0.95rem;
  font-weight: 760;
  letter-spacing: -0.03em;
}

.tanks-team-role {
  margin: 2px 0 0;
  color: #6d766d;
  font-size: 0.74rem;
}

.tanks-health {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #182425;
  font-size: clamp(1.72rem, 2.9vw, 2.08rem);
  font-weight: 850;
  line-height: 0.94;
  letter-spacing: -0.06em;
}

.tanks-health-track {
  position: relative;
  z-index: 1;
  overflow: hidden;
  height: 10px;
  margin-top: 12px;
  border-radius: 999px;
  background: rgba(169, 176, 166, 0.22);
  box-shadow: inset 0 1px 2px rgba(18, 33, 29, 0.08);
}

.tanks-health-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--tank-health, 100%);
  border-radius: inherit;
  transition: width 180ms ease;
}

.tanks-team-card.is-team-0 .tanks-health-fill {
  background: linear-gradient(90deg, #ef8d73 0%, #d86b4b 100%);
}

.tanks-team-card.is-team-1 .tanks-health-fill {
  background: linear-gradient(90deg, #7fa8ff 0%, #5a87e8 100%);
}

.tanks-status-card::before {
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, rgba(241, 247, 242, 0.88) 0%, rgba(249, 243, 231, 0.38) 100%);
}

.tanks-status-tag {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(72, 116, 95, 0.1);
  color: #47695a;
  font-size: 0.68rem;
  font-weight: 820;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tanks-status-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 5px;
  margin-top: 10px;
}

.tanks-status-title {
  margin: 0;
  color: #223128;
  font-size: 1rem;
  font-weight: 770;
}

.tanks-status-note {
  margin: 0;
  color: #68746c;
  font-size: 0.76rem;
  line-height: 1.34;
}

.tanks-status-meta {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tanks-status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(205, 197, 182, 0.72);
  background: rgba(255, 255, 255, 0.54);
  color: #516159;
  font-size: 0.7rem;
  font-weight: 720;
}

.tanks-stage {
  --tanks-dock-width: 220px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--tanks-dock-width);
  grid-template-rows: minmax(0, 1fr);
  gap: 8px;
  align-items: stretch;
  min-height: 0;
  height: 100%;
  padding: 6px;
  border-radius: 22px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  box-shadow:
    0 14px 30px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.tanks-stage::before {
  background:
    radial-gradient(circle at 14% 12%, rgba(130, 171, 255, 0.06), rgba(130, 171, 255, 0) 20%),
    radial-gradient(circle at 86% 86%, rgba(225, 135, 99, 0.05), rgba(225, 135, 99, 0) 24%);
}

.tanks-battlefield {
  position: relative;
  min-height: 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tanks-stage-hud {
  position: absolute;
  inset: 10px 12px auto;
  z-index: 6;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.86fr) minmax(0, 1fr);
  gap: 8px;
  width: calc(100% - 24px);
  pointer-events: none;
}

.tanks-stage-status {
  min-width: 0;
}

.tanks-team-card.is-pending {
  border-color: rgba(112, 133, 162, 0.5);
}

.tanks-controls-dock {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  min-height: 0;
  min-width: 0;
  padding-top: 0;
}

.tanks-touch-context {
  position: absolute;
  inset: auto 10px 10px;
  z-index: 7;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  pointer-events: none;
}

.tanks-touch-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid rgba(197, 189, 175, 0.84);
  background: rgba(255, 253, 249, 0.78);
  color: #4d5d55;
  font-size: 0.64rem;
  font-weight: 760;
  box-shadow: 0 6px 14px rgba(28, 33, 35, 0.08);
}

.tanks-shell.is-touch {
  display: block;
  height: 100%;
  min-height: 0;
}

.tanks-shell.is-touch .tanks-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  padding: 0;
  border-radius: 24px;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.tanks-shell.is-touch .tanks-battlefield {
  height: 100%;
  min-height: 0;
}

.tanks-shell.is-touch .tanks-stage-hud {
  inset: 8px 8px auto;
  gap: 6px;
  width: calc(100% - 16px);
  grid-template-columns: minmax(0, 1fr) minmax(160px, 0.72fr) minmax(0, 1fr);
}

.tanks-shell.is-touch .tanks-team-card,
.tanks-shell.is-touch .tanks-status-card {
  padding: 8px 10px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 253, 249, 0.84) 0%, rgba(246, 241, 234, 0.74) 100%);
}

.tanks-shell.is-touch .tanks-team-name {
  font-size: 0.76rem;
}

.tanks-shell.is-touch .tanks-team-role,
.tanks-shell.is-touch .tanks-status-note,
.tanks-shell.is-touch .tanks-status-meta {
  display: none;
}

.tanks-shell.is-touch .tanks-health {
  font-size: 1.2rem;
}

.tanks-shell.is-touch .tanks-health-track {
  margin-top: 6px;
  height: 7px;
}

.tanks-shell.is-touch .tanks-resource-row {
  gap: 4px;
  margin-top: 6px;
}

.tanks-shell.is-touch .tanks-resource-pill,
.tanks-shell.is-touch .tanks-status-tag,
.tanks-shell.is-touch .tanks-status-pill {
  min-height: 20px;
  padding: 0 7px;
  font-size: 0.56rem;
}

.tanks-shell.is-touch .tanks-status-copy {
  margin-top: 6px;
  gap: 2px;
}

.tanks-shell.is-touch .tanks-status-title {
  font-size: 0.74rem;
}

.tanks-shell.is-touch .tanks-field {
  width: auto;
  height: 100%;
  max-width: 100%;
  max-height: none;
  touch-action: none;
}

.tanks-shell.is-mobile-portrait {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.tanks-portrait-frame {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tanks-portrait-embed {
  position: relative;
  width: min(100%, var(--tanks-embed-frame-width, 380px));
  height: min(100%, var(--tanks-embed-frame-height, 620px));
}

.tanks-portrait-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--tanks-embed-landscape-width, 620px);
  height: var(--tanks-embed-landscape-height, 380px);
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center center;
}

.tanks-field {
  position: relative;
  z-index: 1;
  display: block;
  width: auto;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 26px;
  margin: 0 auto;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.tanks-field-frame {
  fill: #f8fafc;
  stroke: rgba(15, 23, 42, 0.22);
  stroke-width: 2;
}

.tanks-sky {
  fill: url(#tankSkyFill);
  stroke: rgba(203, 213, 225, 0.92);
  stroke-width: 1.3;
}

.tanks-sky-glow {
  fill: url(#tankSkyGlow);
  opacity: 0.86;
}

.tanks-grid {
  fill: url(#tankGridPattern);
  opacity: 0.18;
}

.tanks-horizon {
  fill: rgba(174, 190, 214, 0.34);
}

.tanks-hill-back {
  fill: rgba(126, 145, 171, 0.18);
}

.tanks-front-ridge {
  fill: rgba(108, 125, 148, 0.26);
}

.tanks-terrain {
  fill: url(#tankGroundFill);
  stroke: rgba(64, 78, 99, 0.96);
  stroke-width: 2.2;
}

.tanks-terrain-crest {
  fill: none;
  stroke: rgba(248, 250, 252, 0.36);
  stroke-width: 6;
  stroke-linecap: round;
}

.tanks-tank {
  filter: drop-shadow(0 12px 18px rgba(36, 34, 31, 0.16));
}

.tanks-tank.is-active .tanks-hull {
  filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
}

.tanks-active-ring {
  fill: none;
  stroke-width: 5.5;
  opacity: 0;
}

@keyframes tanksTurnPulse {
  0%,
  100% {
    opacity: 0.38;
    stroke-width: 7;
  }

  50% {
    opacity: 0.82;
    stroke-width: 9;
  }
}

.tanks-tank.is-active .tanks-active-ring {
  opacity: 1;
  animation: tanksTurnPulse 2100ms ease-in-out infinite;
}

.tanks-tank.is-slot-0 .tanks-active-ring {
  stroke: rgba(222, 117, 89, 0.28);
}

.tanks-tank.is-slot-1 .tanks-active-ring {
  stroke: rgba(90, 135, 232, 0.28);
}

.tanks-shadow {
  fill: rgba(32, 30, 27, 0.2);
}

.tanks-track {
  fill: #5d5140;
}

.tanks-track-detail {
  fill: rgba(255, 255, 255, 0.12);
}

.tanks-tank.is-slot-0 .tanks-hull,
.tanks-tank.is-slot-0 .tanks-turret {
  fill: #e57b5e;
  stroke: #a84e39;
}

.tanks-tank.is-slot-1 .tanks-hull,
.tanks-tank.is-slot-1 .tanks-turret {
  fill: #5d8ff2;
  stroke: #2f57a9;
}

.tanks-hull,
.tanks-turret {
  stroke-width: 3.4;
  paint-order: stroke;
}

.tanks-hull-panel,
.tanks-cupola {
  fill: rgba(255, 255, 255, 0.16);
}

.tanks-hull-sheen,
.tanks-turret-sheen {
  fill: rgba(255, 255, 255, 0.16);
}

.tanks-barrel-shadow {
  stroke: rgba(30, 41, 59, 0.28);
  stroke-width: 10;
  stroke-linecap: round;
}

.tanks-barrel {
  stroke: #475569;
  stroke-width: 8;
  stroke-linecap: round;
}

.tanks-barrel-core {
  stroke: #e2e8f0;
  stroke-width: 2.8;
  stroke-linecap: round;
}

.tanks-muzzle {
  fill: #f8fafc;
  stroke: #cbd5e1;
  stroke-width: 2;
}

.tanks-projectile-trail {
  fill: none;
  stroke: rgba(255, 244, 232, 0.68);
  stroke-width: 5.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tanks-projectile-shell {
  fill: #f7f2e6;
  stroke: #c6b18a;
  stroke-width: 2;
}

.tanks-preview-line {
  fill: none;
  stroke: rgba(51, 65, 85, 0.68);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 0 0 10 8;
  filter: drop-shadow(0 4px 8px rgba(15, 23, 42, 0.08));
}

.tanks-preview-impact {
  fill: rgba(255, 255, 255, 0.72);
  stroke: rgba(51, 65, 85, 0.74);
  stroke-width: 2.8;
}

.tanks-preview-reticle {
  filter: drop-shadow(0 5px 8px rgba(15, 23, 42, 0.14));
}

.tanks-preview-cross {
  stroke: rgba(51, 65, 85, 0.7);
  stroke-width: 2.2;
  stroke-linecap: round;
}

.tanks-controls {
  position: relative;
  z-index: 1;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr;
  grid-auto-rows: min-content;
  align-content: start;
  gap: 8px;
  margin: 0;
}

.tanks-control {
  display: grid;
  gap: 6px;
  align-content: start;
  padding: 8px 10px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.tanks-control-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tanks-control-label,
.tanks-control-value {
  color: #475569;
  font-size: 0.68rem;
  font-weight: 780;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tanks-range-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 32px;
  gap: 6px;
  align-items: center;
}

.tanks-move-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.tanks-step {
  min-width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
  font-size: 0.94rem;
  font-weight: 820;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.tanks-step:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(46, 42, 36, 0.08);
}

.tanks-step:disabled {
  cursor: default;
  opacity: 0.42;
  transform: none;
  box-shadow: none;
}

.tanks-range {
  width: 100%;
  accent-color: #334155;
}

.tanks-weapon-button {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(106, 154, 129, 0.24);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(244, 249, 246, 0.92) 0%, rgba(232, 241, 236, 0.9) 100%);
  color: #2e4739;
  text-align: left;
}

.tanks-weapon-button strong {
  font-size: 0.86rem;
}

.tanks-weapon-button span {
  color: #5d7168;
  font-size: 0.7rem;
  line-height: 1.3;
}

.tanks-context-panel {
  display: grid;
  gap: 8px;
  align-content: start;
  width: 100%;
  padding: 14px 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.tanks-context-tag {
  display: inline-flex;
  width: fit-content;
  min-height: 24px;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(72, 116, 95, 0.1);
  color: #47695a;
  font-size: 0.62rem;
  font-weight: 820;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tanks-context-title {
  margin: 0;
  color: #223128;
  font-size: 0.96rem;
  font-weight: 780;
}

.tanks-context-note {
  margin: 0;
  color: #68746c;
  font-size: 0.78rem;
  line-height: 1.38;
}

.tanks-fire {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  border-radius: 16px;
  align-self: end;
}

.tanks-fire:disabled {
  opacity: 0.58;
  cursor: default;
}

.tanks-footer {
  margin: 10px 4px 0;
  text-align: center;
  color: #627163;
  font-size: 0.8rem;
  line-height: 1.42;
}

.tanks-footer strong {
  color: #284337;
}

.tanks-impact-ring {
  fill: none;
  stroke: rgba(255, 215, 173, 0.78);
  stroke-width: 8;
}

.tanks-impact-core {
  fill: rgba(255, 239, 192, 0.92);
}

.tanks-impact-spark {
  stroke: rgba(255, 247, 224, 0.92);
  stroke-width: 4.2;
  stroke-linecap: round;
}

.tanks-resource-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tanks-resource-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  border: 1px solid rgba(207, 199, 184, 0.74);
  color: #516159;
  font-size: 0.66rem;
  font-weight: 720;
}

.tanks-handover-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  background: rgba(17, 24, 39, 0.74);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.tanks-handover-card {
  display: grid;
  gap: 8px;
  width: min(100%, 360px);
  padding: 20px 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(236, 242, 248, 0.94) 100%);
  color: #1f2937;
  text-align: center;
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.28);
}

.tanks-handover-kicker {
  color: #52685e;
  font-size: 0.64rem;
  font-weight: 820;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tanks-handover-title {
  font-size: 1.1rem;
  line-height: 1.2;
}

.tanks-handover-copy {
  color: #607065;
  font-size: 0.8rem;
  line-height: 1.42;
}

.tanks-field.is-disabled .tanks-preview-line,
.tanks-field.is-disabled .tanks-preview-impact {
  opacity: 0.24;
}

.tanks-config-grid {
  display: grid;
  gap: 18px;
}

@media (max-width: 980px) {
  .tanks-stage-hud {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tanks-stage-status {
    grid-column: 1 / -1;
  }

  .tanks-strip {
    grid-template-columns: 1fr;
  }

  .tanks-team-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
  }

  .tanks-health-track {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .tanks-stage-hud {
    inset: 8px 8px auto;
    gap: 6px;
  }

  .app-shell:not(.app-shell-home) .screen.game-screen-tanques {
    gap: 12px;
  }

  .game-screen-tanques .topbar {
    padding: 10px 12px;
  }

  .tanks-team-card,
  .tanks-status-card {
    padding: 11px 12px;
  }

  .tanks-stage {
    gap: 8px;
    padding: 8px;
    border-radius: 22px;
  }

  .tanks-controls {
    grid-template-columns: 1fr;
  }

  .tanks-fire {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 1180px) and (max-height: 1366px) and (orientation: portrait) {
  .app-shell:not(.app-shell-home) .screen.game-screen-tanques {
    width: min(100%, calc(100vw - 8px));
    min-height: calc(100dvh - 10px);
    gap: 6px;
  }

  .game-screen-tanques .topbar {
    padding: 6px 10px;
  }

  .game-screen-tanques .topbar-main {
    gap: 2px;
  }

  .game-screen-tanques .board-wrap {
    padding: 0;
    overflow: hidden;
  }

  .game-screen-tanques .actions-bottom {
    display: none;
  }

  .game-screen-tanques .game-shell-body,
  .game-screen-tanques .game-stage-layout,
  .game-screen-tanques .game-stage-main,
  .game-screen-tanques .board-wrap,
  .tanks-shell.is-mobile-portrait {
    min-height: 0;
    height: 100%;
    overflow: hidden;
  }

  .tanks-shell.is-mobile-portrait .tanks-stage-hud {
    inset: 6px 6px auto;
    gap: 4px;
    width: calc(100% - 12px);
    grid-template-columns: minmax(0, 1fr) 140px minmax(0, 1fr);
  }

  .tanks-shell.is-mobile-portrait .tanks-touch-context {
    inset: auto 8px 8px;
    gap: 4px;
  }

  .tanks-shell.is-mobile-portrait .tanks-touch-pill {
    min-height: 20px;
    padding: 0 8px;
    font-size: 0.54rem;
  }
}

@media (max-width: 1024px) and (orientation: landscape) and (max-height: 760px) {
  .app-shell:not(.app-shell-home) .screen.game-screen-tanques {
    width: min(100%, calc(100vw - 8px));
    min-height: calc(100dvh - 8px);
    gap: 6px;
    padding: 4px 0 8px;
  }

  .game-screen-tanques .topbar {
    padding: 6px 10px;
  }

  .game-screen-tanques .topbar-sub {
    display: none;
  }

  .game-screen-tanques .board-wrap {
    padding: 0;
  }

  .game-screen-tanques .actions-bottom {
    gap: 6px;
  }

  .game-screen-tanques .actions-bottom .btn {
    min-width: 0;
    height: 38px;
    padding: 0 10px;
    font-size: 0.76rem;
  }

  .tanks-shell {
    gap: 6px;
  }

  .tanks-strip {
    grid-template-columns: minmax(0, 0.88fr) minmax(188px, 0.72fr) minmax(0, 0.88fr);
    gap: 6px;
  }

  .tanks-team-card,
  .tanks-status-card {
    padding: 8px 10px;
    border-radius: 18px;
  }

  .tanks-team-name {
    font-size: 0.8rem;
  }

  .tanks-team-role {
    font-size: 0.64rem;
  }

  .tanks-health {
    font-size: 1.4rem;
  }

  .tanks-health-track {
    margin-top: 8px;
    height: 8px;
  }

  .tanks-status-pill {
    min-height: 22px;
    padding: 0 8px;
    font-size: 0.62rem;
  }

  .tanks-stage {
    gap: 6px;
    padding: 6px;
    border-radius: 20px;
  }

  .tanks-controls {
    gap: 6px;
    margin-top: 0;
  }

  .tanks-control {
    gap: 6px;
    padding: 8px 10px;
    border-radius: 16px;
  }

  .tanks-context-panel {
    padding: 12px;
  }

  .tanks-control-label,
  .tanks-control-value {
    font-size: 0.64rem;
  }

  .tanks-step {
    min-width: 32px;
    height: 32px;
  }

  .tanks-fire {
    min-width: 128px;
    border-radius: 16px;
  }

  .tanks-footer {
    display: none;
  }
}

body.game-landscape-mobile-active .game-screen-tanques .board-wrap {
  padding: 0;
  overflow: hidden;
}

body.game-landscape-mobile-active .tanks-shell {
  position: relative;
  height: 100%;
  min-height: 0;
  gap: 0;
}

body.game-landscape-mobile-active .tanks-stage-hud {
  inset: 6px 6px auto;
  gap: 4px;
  width: calc(100% - 12px);
  grid-template-columns: minmax(0, 1fr) 150px minmax(0, 1fr);
}

body.game-landscape-mobile-active .tanks-team-card,
body.game-landscape-mobile-active .tanks-status-card {
  padding: 6px 8px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 253, 249, 0.84) 0%, rgba(246, 241, 234, 0.74) 100%);
  box-shadow:
    0 8px 16px rgba(39, 34, 29, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.68);
}

body.game-landscape-mobile-active .tanks-team-name {
  font-size: 0.72rem;
}

body.game-landscape-mobile-active .tanks-resource-row {
  gap: 4px;
  margin-top: 6px;
}

body.game-landscape-mobile-active .tanks-resource-pill {
  min-height: 20px;
  padding: 0 7px;
  font-size: 0.56rem;
}

body.game-landscape-mobile-active .tanks-team-role,
body.game-landscape-mobile-active .tanks-status-note,
body.game-landscape-mobile-active .tanks-status-meta {
  display: none;
}

body.game-landscape-mobile-active .tanks-health {
  font-size: 1.18rem;
}

body.game-landscape-mobile-active .tanks-health-track {
  margin-top: 6px;
  height: 7px;
}

body.game-landscape-mobile-active .tanks-status-tag {
  min-height: 20px;
  padding: 0 8px;
  font-size: 0.56rem;
}

body.game-landscape-mobile-active .tanks-status-copy {
  gap: 2px;
  margin-top: 6px;
}

body.game-landscape-mobile-active .tanks-status-title {
  font-size: 0.7rem;
}

body.game-landscape-mobile-active .tanks-stage {
  height: 100%;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  padding: 0;
  border-radius: 24px;
  border: 0;
  background: transparent;
  box-shadow: none;
}

body.game-landscape-mobile-active .tanks-battlefield {
  position: relative;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

body.game-landscape-mobile-active .tanks-field {
  width: auto;
  height: 100%;
  max-width: 100%;
  max-height: none;
}

body.game-landscape-mobile-active .tanks-touch-context {
  inset: auto 8px 8px;
  gap: 4px;
}

body.game-landscape-mobile-active .tanks-touch-pill {
  min-height: 20px;
  padding: 0 8px;
  font-size: 0.54rem;
}

body.game-landscape-mobile-active .tanks-footer {
  display: none;
}

body.game-landscape-mobile-active .tanks-handover-card {
  width: min(100%, 300px);
  padding: 16px 14px;
  border-radius: 18px;
}
`;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function ensureTankStyles() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(TANKS_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = TANKS_STYLE_ID;
  style.textContent = TANKS_STYLES;
  document.head.append(style);
}

function teamMeta(slot) {
  return TEAM_META[slot] || TEAM_META[0];
}

function terrainMeta(key) {
  return TERRAIN_META[key] || TERRAIN_META.clasico;
}

function normalizeTerrainKey(value) {
  const key = String(value || "").trim().toLowerCase();
  return TERRAIN_KEYS.includes(key) ? key : "clasico";
}

function normalizeAngle(value) {
  return Math.round(clamp(Number.isFinite(Number(value)) ? Number(value) : 52, MIN_ANGLE, MAX_ANGLE));
}

function normalizePower(value) {
  return Math.round(clamp(Number.isFinite(Number(value)) ? Number(value) : 64, MIN_POWER, MAX_POWER));
}

function buildTerrain(key) {
  const terrainKey = normalizeTerrainKey(key);
  const samples = [];
  const sampleStep = FIELD_WIDTH / (TERRAIN_SAMPLE_COUNT - 1);

  for (let index = 0; index < TERRAIN_SAMPLE_COUNT; index += 1) {
    const x = index * sampleStep;
    const ratio = x / FIELD_WIDTH;

    let y =
      terrainKey === "ondulado"
        ? 422
          + Math.sin(ratio * Math.PI * 1.9 + 0.22) * 52
          + Math.sin(ratio * Math.PI * 4.2 + 0.54) * 20
          + Math.cos(ratio * Math.PI * 6.4 + 0.9) * 10
        : 428
          + Math.sin(ratio * Math.PI * 1.75 + 0.18) * 42
          + Math.sin(ratio * Math.PI * 3.65 + 0.6) * 16
          + Math.cos(ratio * Math.PI * 5.4 + 0.84) * 8;

    y = clamp(y, 346, 502);
    samples.push(y);
  }

  smoothTerrainSamples(samples, 2);
  flattenSpawnPlateau(samples, 168, 82);
  flattenSpawnPlateau(samples, 832, 82);
  smoothTerrainSamples(samples, 1);

  return {
    key: terrainKey,
    sampleStep,
    samples
  };
}

function smoothTerrainSamples(samples, passes) {
  for (let pass = 0; pass < passes; pass += 1) {
    const clone = [...samples];
    for (let index = 1; index < clone.length - 1; index += 1) {
      samples[index] = clone[index - 1] * 0.24 + clone[index] * 0.52 + clone[index + 1] * 0.24;
    }
  }
}

function flattenSpawnPlateau(samples, centerX, radius) {
  const sampleStep = FIELD_WIDTH / (samples.length - 1);
  const centerIndex = Math.round(centerX / sampleStep);
  const radiusSamples = Math.max(1, Math.round(radius / sampleStep));
  const start = Math.max(0, centerIndex - radiusSamples);
  const end = Math.min(samples.length - 1, centerIndex + radiusSamples);
  const target = samples[centerIndex];

  for (let index = start; index <= end; index += 1) {
    const delta = Math.abs(index - centerIndex);
    const blend = clamp(delta / radiusSamples, 0, 1);
    const eased = 1 - blend * blend;
    samples[index] = lerp(samples[index], target, eased * 0.72);
  }
}

function terrainHeightAt(terrain, x) {
  const clampedX = clamp(x, 0, FIELD_WIDTH);
  const index = clampedX / terrain.sampleStep;
  const start = Math.floor(index);
  const end = Math.min(terrain.samples.length - 1, start + 1);
  const amount = index - start;
  return lerp(terrain.samples[start], terrain.samples[end], amount);
}

function terrainPath(terrain) {
  const points = terrain.samples.map((y, index) => `${round(index * terrain.sampleStep, 2)} ${round(y, 2)}`);
  return `M 0 ${FIELD_HEIGHT} L ${points.join(" L ")} L ${FIELD_WIDTH} ${FIELD_HEIGHT} Z`;
}

function terrainCrestPath(terrain) {
  const points = terrain.samples.map((y, index) => `${round(index * terrain.sampleStep, 2)} ${round(y - 8, 2)}`);
  return `M ${points.join(" L ")}`;
}

function groundYAtTank(x, terrain) {
  return terrainHeightAt(terrain, x);
}

function createCameraState() {
  return {
    centerX: FIELD_WIDTH / 2,
    centerY: FIELD_HEIGHT / 2 - 14,
    zoom: 0.92
  };
}

function createTank(slot, terrain, player = null) {
  const x = slot === 0 ? 168 : 832;
  const groundY = groundYAtTank(x, terrain);
  const centerY = groundY - 24;
  return {
    slot,
    playerId: player?.id || `tank-player-${slot}`,
    x,
    centerY,
    groundY,
    angle: slot === 0 ? 54 : 56,
    power: slot === 0 ? 68 : 66,
    health: STARTING_HEALTH,
    fuel: TURN_FUEL,
    ammo: {
      basic: WEAPON_MAX_AMMO,
      max: WEAPON_MAX_AMMO
    },
    selectedWeaponId: "basic",
    statusEffects: {
      burningTurns: 0,
      burningDamage: 0
    }
  };
}

function cloneTank(tank) {
  return {
    ...tank,
    ammo: {
      ...(tank.ammo || {})
    },
    statusEffects: {
      ...(tank.statusEffects || {})
    }
  };
}

function cloneTanks(tanks) {
  return tanks.map(cloneTank);
}

function playerBySlot(players, slot) {
  return players.find((player) => player.slot === slot) || null;
}

function normalizeCamera(camera) {
  const zoom = clamp(Number(camera?.zoom) || STANDARD_CAMERA_ZOOM, 0.72, 1.12);
  const visibleWidth = FIELD_WIDTH / zoom;
  const visibleHeight = FIELD_HEIGHT / zoom;
  const halfWidth = visibleWidth / 2;
  const halfHeight = visibleHeight / 2;
  return {
    centerX:
      halfWidth >= FIELD_WIDTH / 2
        ? FIELD_WIDTH / 2
        : clamp(Number(camera?.centerX) || FIELD_WIDTH / 2, halfWidth, FIELD_WIDTH - halfWidth),
    centerY:
      halfHeight >= FIELD_HEIGHT / 2
        ? FIELD_HEIGHT / 2
        : clamp(Number(camera?.centerY) || FIELD_HEIGHT / 2, halfHeight, FIELD_HEIGHT - halfHeight),
    zoom
  };
}

function cameraBlend(deltaMs, strength = 0.18) {
  const frames = Math.max(1, deltaMs / 16);
  return 1 - (1 - strength) ** frames;
}

function interpolateCamera(camera, target, deltaMs) {
  const current = normalizeCamera(camera || createCameraState());
  const desired = normalizeCamera(target || current);
  const blend = cameraBlend(deltaMs);
  return normalizeCamera({
    centerX: lerp(current.centerX, desired.centerX, blend),
    centerY: lerp(current.centerY, desired.centerY, blend),
    zoom: lerp(current.zoom, desired.zoom, blend)
  });
}

function cameraTransform(camera) {
  const current = normalizeCamera(camera || createCameraState());
  return `translate(${round(FIELD_WIDTH / 2, 2)} ${round(FIELD_HEIGHT / 2, 2)}) scale(${round(current.zoom, 4)}) translate(${round(-current.centerX, 2)} ${round(-current.centerY, 2)})`;
}

function cameraSettled(camera, target) {
  const current = normalizeCamera(camera);
  const desired = normalizeCamera(target);
  return (
    Math.abs(current.centerX - desired.centerX) < 6 &&
    Math.abs(current.centerY - desired.centerY) < 6 &&
    Math.abs(current.zoom - desired.zoom) < 0.012
  );
}

function tankCameraFocus(tank, zoom = STANDARD_CAMERA_ZOOM) {
  return normalizeCamera({
    centerX: tank.x,
    centerY: clamp(tank.centerY - CAMERA_Y_OFFSET, 130, FIELD_HEIGHT - 120),
    zoom
  });
}

function projectileCameraFocus(projectile) {
  return normalizeCamera({
    centerX: projectile.x,
    centerY: clamp(projectile.y + 34, 150, FIELD_HEIGHT - 116),
    zoom: SIMULATION_CAMERA_ZOOM
  });
}

function impactCameraFocus(impact) {
  return normalizeCamera({
    centerX: impact.x,
    centerY: clamp(impact.y - 24, 130, FIELD_HEIGHT - 116),
    zoom: DAMAGE_CAMERA_ZOOM
  });
}

function buildWind(turnNumber, terrainKey) {
  const terrainSeed = String(terrainKey || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const raw = Math.sin(turnNumber * 12.9898 + terrainSeed * 0.37) * 43758.5453;
  const normalized = raw - Math.floor(raw);
  let strength = Math.round(lerp(WIND_MIN, WIND_MAX, normalized));
  if (Math.abs(strength) < 4) {
    strength = 0;
  }
  return {
    strength,
    accel: strength * WIND_ACCEL_FACTOR,
    direction: strength === 0 ? "calm" : strength > 0 ? "east" : "west",
    label: strength === 0 ? "Calma" : `${Math.abs(strength)} km/h ${strength > 0 ? "→" : "←"}`
  };
}

function activeTank(state) {
  if (state.activePlayerId) {
    return state.tanks.find((tank) => tank.playerId === state.activePlayerId) || null;
  }
  if (Number.isInteger(state.activePlayerSlot)) {
    return state.tanks[state.activePlayerSlot] || null;
  }
  return null;
}

function resolveLayoutMode(uiState) {
  const viewport = uiState?.viewport || {};
  if (viewport.isCompactTouch && viewport.isPortraitHandheld) {
    return "mobile-portrait";
  }
  if (viewport.isCompactLandscape) {
    return "mobile-landscape";
  }
  return "desktop";
}

function isTouchLayoutMode(layoutMode) {
  return layoutMode === "mobile-portrait" || layoutMode === "mobile-landscape";
}

function computePortraitEmbedMetrics(uiState) {
  const viewportWidth = Math.max(320, Number(uiState?.viewport?.width) || 390);
  const viewportHeight = Math.max(520, Number(uiState?.viewport?.height) || 844);
  const outerWidth = Math.max(280, viewportWidth - 12);
  const outerHeight = Math.max(360, viewportHeight - 108);
  const ratio = FIELD_WIDTH / FIELD_HEIGHT;
  const landscapeWidth = Math.min(outerHeight, outerWidth * ratio);
  const landscapeHeight = landscapeWidth / ratio;
  return {
    frameWidth: landscapeHeight,
    frameHeight: landscapeWidth,
    landscapeWidth,
    landscapeHeight
  };
}

function updateTankPosition(tank, terrain, nextX) {
  const x = clamp(nextX, MOVE_MIN_X, MOVE_MAX_X);
  const groundY = groundYAtTank(x, terrain);
  return {
    ...tank,
    x,
    groundY,
    centerY: groundY - 24
  };
}

function refillTurnResources(tanks, slot) {
  const nextTanks = cloneTanks(tanks);
  const tank = nextTanks[slot];
  if (!tank) {
    return nextTanks;
  }
  tank.fuel = TURN_FUEL;
  tank.ammo.basic = tank.ammo.max || WEAPON_MAX_AMMO;
  return nextTanks;
}

function beginTurnState(state, slot, { preserveReport = false } = {}) {
  const tanks = refillTurnResources(state.tanks, slot);
  return {
    ...state,
    phase: "TURN_START",
    phaseElapsedMs: 0,
    activePlayerSlot: slot,
    activePlayerId: tanks[slot]?.playerId || null,
    pendingPlayerSlot: null,
    pendingPlayerId: null,
    tanks,
    projectile: null,
    impact: null,
    wind: buildWind(state.turnNumber, state.terrain.key),
    lastReport: preserveReport
      ? state.lastReport
      : {
          kind: "turn-start",
          playerSlot: slot
        }
  };
}

function createState(options = {}, players = []) {
  const terrain = buildTerrain(options.terrain);
  const tanks = [createTank(0, terrain, players[0]), createTank(1, terrain, players[1])];
  return beginTurnState(
    {
      phase: "TURN_START",
      phaseElapsedMs: 0,
      turnNumber: 1,
      activePlayerSlot: null,
      activePlayerId: null,
      pendingPlayerSlot: null,
      pendingPlayerId: null,
      terrain,
      tanks,
      projectile: null,
      impact: null,
      wind: buildWind(1, terrain.key),
      camera: createCameraState(),
      lastReport: {
        kind: "opening"
      },
      result: null
    },
    0,
    { preserveReport: true }
  );
}

function vectorForShot(slot, angle) {
  const radians = (angle * Math.PI) / 180;
  const directionX = slot === 0 ? Math.cos(radians) : -Math.cos(radians);
  const directionY = -Math.sin(radians);
  return { x: directionX, y: directionY };
}

function muzzlePointForTank(tank) {
  const vector = vectorForShot(tank.slot, tank.angle);
  const originX = tank.x + vector.x * TANK_BARREL_LENGTH;
  const originY = tank.centerY - 12 + vector.y * TANK_BARREL_LENGTH;
  return { x: originX, y: originY };
}

function hitCenterForTank(tank) {
  return {
    x: tank.x,
    y: tank.centerY - 4
  };
}

function speedFromPower(power) {
  const power01 = (normalizePower(power) - MIN_POWER) / (MAX_POWER - MIN_POWER);
  return lerp(MIN_PROJECTILE_SPEED, MAX_PROJECTILE_SPEED, power01);
}

function previewTrajectory(tank, terrain, wind, angle = tank.angle, power = tank.power) {
  const shotVector = vectorForShot(tank.slot, normalizeAngle(angle));
  const speed = speedFromPower(power);
  const points = [];
  const muzzle = muzzlePointForTank({ ...tank, angle: normalizeAngle(angle) });
  let x = muzzle.x;
  let y = muzzle.y;
  let vx = shotVector.x * speed;
  let vy = shotVector.y * speed;

  points.push({ x, y });

  for (let step = 0; step < 120; step += 1) {
    const dt = 0.06;
    const nextX = x + vx * dt;
    const nextY = y + vy * dt;
    vx += (wind?.accel || 0) * dt;
    vy += GRAVITY * dt;

    if (step * dt >= PREVIEW_TIME_SECONDS) {
      points.push({ x: nextX, y: nextY });
      break;
    }

    if (nextX < 0 || nextX > FIELD_WIDTH || nextY > FIELD_HEIGHT) {
      points.push({
        x: clamp(nextX, 0, FIELD_WIDTH),
        y: clamp(nextY, 0, FIELD_HEIGHT)
      });
      break;
    }

    const terrainY = terrainHeightAt(terrain, nextX);
    if (nextY >= terrainY) {
      points.push({ x: nextX, y: terrainY });
      break;
    }

    points.push({ x: nextX, y: nextY });
    x = nextX;
    y = nextY;
  }

  return points;
}

function trajectoryPath(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return "";
  }
  const [first, ...rest] = points;
  return `M ${round(first.x, 2)} ${round(first.y, 2)} ${rest.map((point) => `L ${round(point.x, 2)} ${round(point.y, 2)}`).join(" ")}`;
}

function closestPointOnSegment(ax, ay, bx, by, px, py) {
  const abx = bx - ax;
  const aby = by - ay;
  const abLengthSquared = abx * abx + aby * aby;
  if (abLengthSquared === 0) {
    return { x: ax, y: ay, t: 0 };
  }
  const t = clamp(((px - ax) * abx + (py - ay) * aby) / abLengthSquared, 0, 1);
  return {
    x: ax + abx * t,
    y: ay + aby * t,
    t
  };
}

function segmentHitsTank(start, end, tank) {
  const hitCenter = hitCenterForTank(tank);
  const closest = closestPointOnSegment(start.x, start.y, end.x, end.y, hitCenter.x, hitCenter.y);
  const dx = closest.x - hitCenter.x;
  const dy = closest.y - hitCenter.y;
  return {
    hit: Math.hypot(dx, dy) <= TANK_HIT_RADIUS + PROJECTILE_RADIUS,
    point: closest
  };
}

function terrainImpactPoint(start, end, terrain) {
  let low = 0;
  let high = 1;

  for (let step = 0; step < 8; step += 1) {
    const mid = (low + high) / 2;
    const x = lerp(start.x, end.x, mid);
    const y = lerp(start.y, end.y, mid);
    if (y >= terrainHeightAt(terrain, x)) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const amount = high;
  const x = lerp(start.x, end.x, amount);
  return {
    x,
    y: terrainHeightAt(terrain, x)
  };
}

function computeDamage(impactPoint, tanks, directSlot = null) {
  return tanks.map((tank) => {
    const hitCenter = hitCenterForTank(tank);
    const distance = Math.hypot(hitCenter.x - impactPoint.x, hitCenter.y - impactPoint.y);
    const closeness = clamp(1 - distance / DAMAGE_RADIUS, 0, 1);
    let damage = closeness > 0 ? Math.round(SPLASH_DAMAGE * closeness ** 1.24) : 0;
    if (tank.slot === directSlot) {
      damage += DIRECT_HIT_BONUS;
    }
    return Math.max(0, damage);
  });
}

function summarizeImpactReport(previousState, nextTanks, impact, directSlot) {
  const damageBySlot = previousState.tanks.map((tank, slot) => Math.max(0, tank.health - nextTanks[slot].health));
  const totalDamage = damageBySlot[0] + damageBySlot[1];

  return {
    kind: directSlot !== null ? "direct-hit" : totalDamage > 0 ? "splash-hit" : "miss",
    shooterSlot: previousState.activePlayerSlot,
    directSlot,
    damageBySlot,
    impactX: impact.x,
    impactY: impact.y
  };
}

function resolveWinner(nextTanks) {
  const aliveSlots = nextTanks.filter((tank) => tank.health > 0).map((tank) => tank.slot);
  if (aliveSlots.length === 2) {
    return null;
  }
  if (aliveSlots.length === 1) {
    return { type: "win", winnerSlot: aliveSlots[0] };
  }
  return { type: "draw" };
}

function canRouteActiveInput(state, playerId) {
  return (
    state.phase === "AIMING_PHASE" &&
    Boolean(state.activePlayerId) &&
    playerId === state.activePlayerId &&
    !state.result
  );
}

function setAim(state, action) {
  if (!canRouteActiveInput(state, action.playerId)) {
    return { ok: false, reason: "turn" };
  }

  const tanks = cloneTanks(state.tanks);
  const active = tanks[state.activePlayerSlot];
  active.angle = normalizeAngle(action.angle ?? active.angle);
  active.power = normalizePower(action.power ?? active.power);

  return {
    ok: true,
    state: {
      ...state,
      tanks
    }
  };
}

function moveTank(state, action) {
  if (!canRouteActiveInput(state, action.playerId)) {
    return { ok: false, reason: "turn" };
  }

  const direction = Number(action.direction);
  if (direction !== -1 && direction !== 1) {
    return { ok: false, reason: "invalid" };
  }

  const tanks = cloneTanks(state.tanks);
  const active = tanks[state.activePlayerSlot];
  if (active.fuel <= 0) {
    return { ok: false, reason: "invalid" };
  }

  const nextTank = updateTankPosition(active, state.terrain, active.x + direction * Math.min(MOVE_STEP, active.fuel));
  const movedDistance = Math.round(Math.abs(nextTank.x - active.x));
  if (movedDistance <= 0) {
    return { ok: false, reason: "invalid" };
  }

  nextTank.fuel = Math.max(0, active.fuel - movedDistance);
  tanks[state.activePlayerSlot] = nextTank;

  return {
    ok: true,
    state: {
      ...state,
      tanks,
      lastReport: {
        kind: "movement",
        playerSlot: nextTank.slot
      }
    }
  };
}

function selectWeapon(state, action) {
  if (!canRouteActiveInput(state, action.playerId)) {
    return { ok: false, reason: "turn" };
  }

  if (action.weaponId !== "basic") {
    return { ok: false, reason: "invalid" };
  }

  const tanks = cloneTanks(state.tanks);
  tanks[state.activePlayerSlot].selectedWeaponId = "basic";

  return {
    ok: true,
    state: {
      ...state,
      tanks
    }
  };
}

function fireShot(state, action) {
  if (!canRouteActiveInput(state, action.playerId)) {
    return { ok: false, reason: "turn" };
  }

  const tanks = cloneTanks(state.tanks);
  const active = tanks[state.activePlayerSlot];
  if ((active.ammo?.basic || 0) <= 0) {
    return { ok: false, reason: "invalid" };
  }

  const angle = normalizeAngle(action.angle ?? active.angle);
  const power = normalizePower(action.power ?? active.power);
  active.angle = angle;
  active.power = power;
  active.ammo.basic = Math.max(0, (active.ammo?.basic || 0) - 1);

  const muzzle = muzzlePointForTank(active);
  const vector = vectorForShot(active.slot, angle);
  const speed = speedFromPower(power);

  return {
    ok: true,
    state: {
      ...state,
      phase: "SIMULATION",
      phaseElapsedMs: 0,
      tanks,
      projectile: {
        x: muzzle.x,
        y: muzzle.y,
        vx: vector.x * speed,
        vy: vector.y * speed,
        ownerSlot: active.slot,
        ownerPlayerId: active.playerId,
        trail: [{ x: muzzle.x, y: muzzle.y }]
      },
      impact: null,
      lastReport: {
        kind: "shot",
        shooterSlot: active.slot,
        angle,
        power
      }
    }
  };
}

function tickTurnStart(state, action) {
  if (state.phase !== "TURN_START") {
    return { ok: false, reason: "invalid" };
  }

  const deltaMs = clamp(Number(action.deltaMs) || 0, 0, MAX_FRAME_MS);
  if (deltaMs <= 0) {
    return { ok: true, state };
  }

  const tank = activeTank(state);
  if (!tank) {
    return { ok: false, reason: "invalid" };
  }

  const target = tankCameraFocus(tank);
  const camera = interpolateCamera(state.camera, target, deltaMs);
  const phaseElapsedMs = state.phaseElapsedMs + deltaMs;

  if (phaseElapsedMs < TURN_START_SETTLE_MS || !cameraSettled(camera, target)) {
    return {
      ok: true,
      state: {
        ...state,
        phaseElapsedMs,
        camera
      }
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      phase: "AIMING_PHASE",
      phaseElapsedMs: 0,
      camera
    }
  };
}

function tickSimulation(state, action) {
  if (state.phase !== "SIMULATION" || !state.projectile) {
    return { ok: false, reason: "invalid" };
  }

  const deltaMs = clamp(Number(action.deltaMs) || 0, 0, MAX_FRAME_MS);
  if (deltaMs <= 0) {
    return { ok: true, state };
  }

  const steps = Math.max(1, Math.ceil(deltaMs / PROJECTILE_STEP_MS));
  const dtSeconds = deltaMs / steps / 1000;
  const projectile = {
    ...state.projectile,
    trail: Array.isArray(state.projectile.trail) ? [...state.projectile.trail] : []
  };
  let impact = null;
  let directSlot = null;
  let camera = state.camera;

  for (let step = 0; step < steps; step += 1) {
    const start = { x: projectile.x, y: projectile.y };
    const end = {
      x: projectile.x + projectile.vx * dtSeconds,
      y: projectile.y + projectile.vy * dtSeconds
    };
    projectile.vx += (state.wind?.accel || 0) * dtSeconds;
    projectile.vy += GRAVITY * dtSeconds;

    for (let slot = 0; slot < state.tanks.length; slot += 1) {
      const hit = segmentHitsTank(start, end, state.tanks[slot]);
      if (hit.hit) {
        impact = hit.point;
        directSlot = state.tanks[slot].slot;
        break;
      }
    }

    if (!impact) {
      if (end.x < 0 || end.x > FIELD_WIDTH || end.y > FIELD_HEIGHT) {
        impact = {
          x: clamp(end.x, 0, FIELD_WIDTH),
          y: terrainHeightAt(state.terrain, clamp(end.x, 0, FIELD_WIDTH))
        };
      } else if (end.y >= terrainHeightAt(state.terrain, end.x)) {
        impact = terrainImpactPoint(start, end, state.terrain);
      }
    }

    if (impact) {
      break;
    }

    projectile.x = end.x;
    projectile.y = end.y;
    projectile.trail.push({ x: projectile.x, y: projectile.y });
    camera = interpolateCamera(camera, projectileCameraFocus(projectile), deltaMs / steps);
    if (projectile.trail.length > 14) {
      projectile.trail.shift();
    }
  }

  if (!impact) {
    return {
      ok: true,
      state: {
        ...state,
        projectile,
        phaseElapsedMs: state.phaseElapsedMs + deltaMs,
        camera
      }
    };
  }

  const tanks = cloneTanks(state.tanks);
  const damageBySlot = computeDamage(impact, tanks, directSlot);
  for (let slot = 0; slot < tanks.length; slot += 1) {
    tanks[slot].health = Math.max(0, tanks[slot].health - damageBySlot[slot]);
  }

  const report = summarizeImpactReport(state, tanks, impact, directSlot);
  const result = resolveWinner(tanks);

  return {
    ok: true,
    state: {
      ...state,
      phase: result ? "FINISHED" : "DAMAGE_EVALUATION",
      phaseElapsedMs: 0,
      tanks,
      projectile: null,
      impact: {
        x: impact.x,
        y: impact.y,
        elapsedMs: 0,
        durationMs: DAMAGE_EVALUATION_DURATION_MS,
        animationDurationMs: EXPLOSION_ANIMATION_MS,
        directSlot,
        damageBySlot
      },
      lastReport: report,
      result,
      camera: interpolateCamera(camera, impactCameraFocus(impact), deltaMs)
    }
  };
}

function tickDamageEvaluation(state, action) {
  if (state.phase !== "DAMAGE_EVALUATION" || !state.impact) {
    return { ok: false, reason: "invalid" };
  }

  const deltaMs = Math.max(0, Number(action.deltaMs) || 0);
  const elapsedMs = Math.min(state.impact.durationMs, state.impact.elapsedMs + deltaMs);
  const impact = {
    ...state.impact,
    elapsedMs
  };
  const camera = interpolateCamera(state.camera, impactCameraFocus(impact), deltaMs);

  if (elapsedMs < state.impact.durationMs) {
    return {
      ok: true,
      state: {
        ...state,
        impact,
        phaseElapsedMs: state.phaseElapsedMs + deltaMs,
        camera
      }
    };
  }

  if (state.result) {
    return {
      ok: true,
      state: {
        ...state,
        phase: "FINISHED",
        phaseElapsedMs: 0,
        impact,
        camera
      }
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      phase: "END_TURN",
      phaseElapsedMs: 0,
      impact,
      camera
    }
  };
}

function resolveEndTurnEffects(state) {
  const tanks = cloneTanks(state.tanks);
  const events = [];

  for (let slot = 0; slot < tanks.length; slot += 1) {
    const tank = tanks[slot];
    const burningTurns = Number(tank.statusEffects?.burningTurns) || 0;
    if (burningTurns > 0 && tank.health > 0) {
      const damage = Math.max(1, Number(tank.statusEffects?.burningDamage) || 4);
      tank.health = Math.max(0, tank.health - damage);
      tank.statusEffects.burningTurns = Math.max(0, burningTurns - 1);
      events.push({ type: "burn", slot: tank.slot, damage });
    }

    if ((tank.x < MOVE_MIN_X - 32 || tank.x > MOVE_MAX_X + 32 || tank.centerY > FIELD_HEIGHT + 10) && tank.health > 0) {
      tank.health = 0;
      events.push({ type: "fall", slot: tank.slot });
    }
  }

  return {
    tanks,
    events
  };
}

function tickEndTurn(state) {
  if (state.phase !== "END_TURN") {
    return { ok: false, reason: "invalid" };
  }

  const { tanks, events } = resolveEndTurnEffects(state);
  const result = resolveWinner(tanks);

  if (result) {
    return {
      ok: true,
      state: {
        ...state,
        phase: "FINISHED",
        phaseElapsedMs: 0,
        activePlayerSlot: null,
        activePlayerId: null,
        pendingPlayerSlot: null,
        pendingPlayerId: null,
        tanks,
        result,
        lastReport: {
          kind: "end-turn",
          events
        }
      }
    };
  }

  const nextTurn = state.activePlayerSlot === 0 ? 1 : 0;
  return {
    ok: true,
    state: {
      ...state,
      phase: "DEVICE_HANDOVER",
      phaseElapsedMs: 0,
      activePlayerSlot: null,
      activePlayerId: null,
      pendingPlayerSlot: nextTurn,
      pendingPlayerId: tanks[nextTurn]?.playerId || null,
      turnNumber: state.turnNumber + 1,
      tanks,
      projectile: null,
      impact: null,
      lastReport: {
        kind: "handover",
        nextTurnSlot: nextTurn,
        events
      }
    }
  };
}

function continueHandover(state, action) {
  if (state.phase !== "DEVICE_HANDOVER" || !Number.isInteger(state.pendingPlayerSlot)) {
    return { ok: false, reason: "invalid" };
  }

  if (action.playerId && state.pendingPlayerId && action.playerId !== state.pendingPlayerId) {
    return { ok: false, reason: "turn" };
  }

  return {
    ok: true,
    state: beginTurnState(state, state.pendingPlayerSlot)
  };
}

function buildStatusCopy(state, players) {
  const currentPlayer = Number.isInteger(state.activePlayerSlot) ? playerBySlot(players, state.activePlayerSlot) : null;
  const pendingPlayer = Number.isInteger(state.pendingPlayerSlot) ? playerBySlot(players, state.pendingPlayerSlot) : null;
  const terrainLabel = terrainMeta(state.terrain.key).label;
  const windLabel = state.wind?.label || "Calma";
  const totalDamage = (state.impact?.damageBySlot || []).reduce((sum, damage) => sum + damage, 0);

  if (state.result?.type === "win") {
    const winner = players.find((player) => player.slot === state.result.winnerSlot);
    return {
      tag: "Victoria",
      title: `${winner ? winner.name : "Un jugador"} gana la bateria`,
      note: "La artilleria rival se ha quedado sin vida.",
      meta: [`Turnos: ${state.turnNumber}`, `Terreno ${terrainLabel.toLowerCase()}`]
    };
  }

  if (state.result?.type === "draw") {
    return {
      tag: "Empate",
      title: "Ambos tanques caen",
      note: "El impacto final dejo a los dos equipos fuera de combate.",
      meta: [`Turnos: ${state.turnNumber}`, `Terreno ${terrainLabel.toLowerCase()}`]
    };
  }

  if (state.phase === "TURN_START") {
    return {
      tag: "TURN_START",
      title: `Encuadre para ${currentPlayer ? currentPlayer.name : "Jugador"}`,
      note: `La camara centra al jugador activo con viento ${windLabel}.`,
      meta: [`Turno ${state.turnNumber}`, terrainLabel]
    };
  }

  if (state.phase === "AIMING_PHASE") {
    return {
      tag: "AIMING_PHASE",
      title: `Turno de ${currentPlayer ? currentPlayer.name : "Jugador"}`,
      note: "Ajusta el tiro del tanque activo y dispara una sola vez.",
      meta: [`Viento ${windLabel}`, `Turno ${state.turnNumber}`]
    };
  }

  if (state.phase === "SIMULATION") {
    return {
      tag: "SIMULATION",
      title: `Disparo de ${currentPlayer ? currentPlayer.name : "Jugador"}`,
      note: "La camara sigue el proyectil hasta el impacto.",
      meta: [`Viento ${windLabel}`, `Turno ${state.turnNumber}`]
    };
  }

  if (state.phase === "DAMAGE_EVALUATION") {
    return {
      tag: "DAMAGE_EVALUATION",
      title: totalDamage > 0 ? "Golpe confirmado" : "Impacto sin dano",
      note:
        totalDamage > 0
          ? "La camara se queda sobre el impacto antes del relevo del dispositivo."
          : "No hubo dano, pero el relevo del turno sigue el mismo protocolo.",
      meta: [`Turno ${state.turnNumber}`, terrainLabel]
    };
  }

  if (state.phase === "END_TURN") {
    return {
      tag: "END_TURN",
      title: "Resolviendo fin de turno",
      note: "Se aplican los efectos pendientes antes de ceder el dispositivo.",
      meta: [`Turno ${state.turnNumber}`, terrainLabel]
    };
  }

  if (state.phase === "DEVICE_HANDOVER") {
    return {
      tag: "DEVICE_HANDOVER",
      title: `Turno del Jugador ${pendingPlayer ? pendingPlayer.name : "siguiente"}`,
      note: "La simulacion esta bloqueada hasta que el nuevo jugador toque la pantalla.",
      meta: [`Viento ${windLabel}`, `Turno ${state.turnNumber}`]
    };
  }

  return {
    tag: "Apertura",
    title: `Turno de ${currentPlayer ? currentPlayer.name : "Jugador"}`,
    note: "Elige angulo y potencia para enviar el primer proyectil.",
    meta: [`Turno ${state.turnNumber}`, terrainLabel]
  };
}

function tankGroupMarkup(tank, isActive) {
  const vector = vectorForShot(tank.slot, tank.angle);
  const turretX = vector.x * (TANK_BARREL_LENGTH - 10);
  const turretY = vector.y * (TANK_BARREL_LENGTH - 10);
  return `
    <g
      class="tanks-tank is-slot-${tank.slot} ${isActive ? "is-active" : ""}"
      data-tank-slot="${tank.slot}"
      data-tank-player-id="${escapeHtml(tank.playerId)}"
      data-tank-x="${round(tank.x, 2)}"
      data-tank-center-y="${round(tank.centerY, 2)}"
    >
      <circle class="tanks-active-ring" cx="${round(tank.x, 2)}" cy="${round(tank.centerY - 6, 2)}" r="42"></circle>
      <ellipse class="tanks-shadow" cx="${round(tank.x, 2)}" cy="${round(tank.groundY + 6, 2)}" rx="54" ry="11"></ellipse>
      <g transform="translate(${round(tank.x, 2)} ${round(tank.centerY, 2)})">
        <rect class="tanks-track" x="${-TANK_TRACK_WIDTH / 2}" y="8" width="${TANK_TRACK_WIDTH}" height="${TANK_TRACK_HEIGHT}" rx="8"></rect>
        <rect class="tanks-track-detail" x="${-TANK_TRACK_WIDTH / 2 + 10}" y="11" width="${TANK_TRACK_WIDTH - 20}" height="4" rx="2"></rect>
        <rect class="tanks-hull" x="${-TANK_BODY_WIDTH / 2}" y="-2" width="${TANK_BODY_WIDTH}" height="${TANK_BODY_HEIGHT}" rx="10"></rect>
        <rect class="tanks-hull-panel" x="${-TANK_BODY_WIDTH / 2 + 11}" y="3" width="${TANK_BODY_WIDTH - 22}" height="8" rx="4"></rect>
        <path class="tanks-hull-sheen" d="M ${-TANK_BODY_WIDTH / 2 + 8} 4 Q 0 -6 ${TANK_BODY_WIDTH / 2 - 8} 4 L ${TANK_BODY_WIDTH / 2 - 12} 9 Q 0 0 ${-TANK_BODY_WIDTH / 2 + 12} 9 Z"></path>
        <line class="tanks-barrel-shadow" x1="0" y1="-10" x2="${round(turretX, 2)}" y2="${round(-10 + turretY, 2)}"></line>
        <line class="tanks-barrel" x1="0" y1="-12" x2="${round(turretX, 2)}" y2="${round(-12 + turretY, 2)}"></line>
        <line class="tanks-barrel-core" x1="0" y1="-12" x2="${round(turretX, 2)}" y2="${round(-12 + turretY, 2)}"></line>
        <circle class="tanks-turret" cx="0" cy="-12" r="${TANK_TURRET_RADIUS}"></circle>
        <circle class="tanks-cupola" cx="0" cy="-12" r="${Math.max(5, TANK_TURRET_RADIUS - 9)}"></circle>
        <path class="tanks-turret-sheen" d="M -7 -20 Q 0 -25 8 -19 Q 1 -16 -7 -14 Z"></path>
        <circle class="tanks-muzzle" cx="${round(vector.x * TANK_BARREL_LENGTH, 2)}" cy="${round(-12 + vector.y * TANK_BARREL_LENGTH, 2)}" r="4.6"></circle>
      </g>
    </g>
  `;
}

function renderProjectile(projectile) {
  if (!projectile) {
    return "";
  }

  const trailPath = trajectoryPath(projectile.trail || []);
  return `
    <g aria-hidden="true">
      ${trailPath ? `<path class="tanks-projectile-trail" d="${trailPath}"></path>` : ""}
      <circle class="tanks-projectile-shell" cx="${round(projectile.x, 2)}" cy="${round(projectile.y, 2)}" r="${PROJECTILE_RADIUS}"></circle>
    </g>
  `;
}

function renderImpact(impact) {
  if (!impact) {
    return "";
  }

  const animationMs = impact.animationDurationMs || impact.durationMs;
  const progress = clamp(impact.elapsedMs / animationMs, 0, 1);
  const radius = 16 + progress * 74;
  const coreRadius = Math.max(6, 18 - progress * 11);
  const sparkRadius = 20 + progress * 54;
  const opacity = clamp(1 - progress * 0.9, 0.08, 1);
  const spokes = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 6;
    const innerX = impact.x + Math.cos(angle) * (sparkRadius - 12);
    const innerY = impact.y + Math.sin(angle) * (sparkRadius - 12);
    const outerX = impact.x + Math.cos(angle) * sparkRadius;
    const outerY = impact.y + Math.sin(angle) * sparkRadius;
    return `<line class="tanks-impact-spark" x1="${round(innerX, 2)}" y1="${round(innerY, 2)}" x2="${round(outerX, 2)}" y2="${round(outerY, 2)}" style="opacity:${opacity}"></line>`;
  }).join("");

  return `
    <g aria-hidden="true">
      <circle class="tanks-impact-ring" cx="${round(impact.x, 2)}" cy="${round(impact.y, 2)}" r="${round(radius, 2)}" style="opacity:${opacity}"></circle>
      <circle class="tanks-impact-core" cx="${round(impact.x, 2)}" cy="${round(impact.y, 2)}" r="${round(coreRadius, 2)}" style="opacity:${Math.min(1, opacity + 0.14)}"></circle>
      ${spokes}
    </g>
  `;
}

function renderAimAssist(state) {
  if (state.phase !== "AIMING_PHASE") {
    return "";
  }

  const tank = activeTank(state);
  if (!tank) {
    return "";
  }

  const points = previewTrajectory(tank, state.terrain, state.wind, tank.angle, tank.power);
  const path = trajectoryPath(points);
  const impact = points[points.length - 1];
  if (!path || !impact) {
    return "";
  }

  return `
    <g class="tanks-preview" aria-hidden="true">
      <path class="tanks-preview-line" d="${path}" data-tank-preview-path></path>
      <g class="tanks-preview-reticle" transform="translate(${round(impact.x, 2)} ${round(impact.y, 2)})" data-tank-preview-reticle>
        <circle class="tanks-preview-impact" cx="0" cy="0" r="8"></circle>
        <line class="tanks-preview-cross" x1="-15" y1="0" x2="-6" y2="0"></line>
        <line class="tanks-preview-cross" x1="6" y1="0" x2="15" y2="0"></line>
        <line class="tanks-preview-cross" x1="0" y1="-15" x2="0" y2="-6"></line>
        <line class="tanks-preview-cross" x1="0" y1="6" x2="0" y2="15"></line>
      </g>
    </g>
  `;
}

function renderHudCard(tank, player, state) {
  const isActive = Boolean(state.activePlayerId) && tank.playerId === state.activePlayerId;
  const isPending = Boolean(state.pendingPlayerId) && tank.playerId === state.pendingPlayerId;
  const healthPercent = clamp((tank.health / STARTING_HEALTH) * 100, 0, 100);
  return `
    <article class="tanks-team-card is-team-${tank.slot} ${isActive ? "is-active" : ""} ${isPending ? "is-pending" : ""}">
      <div class="tanks-card-head">
        <div class="tanks-team-badge">
          <span class="tanks-team-dot"></span>
          <div>
            <h3 class="tanks-team-name">${escapeHtml(player?.name || `Jugador ${tank.slot + 1}`)}</h3>
            <p class="tanks-team-role">${isActive ? "Activo" : isPending ? "En espera" : "Suspendido"}</p>
          </div>
        </div>
        <p class="tanks-health">${tank.health}</p>
      </div>
      <div class="tanks-health-track">
        <div class="tanks-health-fill" style="width:${round(healthPercent, 2)}%"></div>
      </div>
      <div class="tanks-resource-row">
        <span class="tanks-resource-pill">Combustible ${tank.fuel}</span>
        <span class="tanks-resource-pill">Armamento ${tank.ammo?.basic || 0}/${tank.ammo?.max || WEAPON_MAX_AMMO}</span>
      </div>
    </article>
  `;
}

function renderStageStatus(state, players) {
  const status = buildStatusCopy(state, players);
  return `
    <article class="tanks-status-card tanks-stage-status">
      <div class="tanks-status-top">
        <span class="tanks-status-tag">${escapeHtml(status.tag)}</span>
        <span class="tanks-status-pill">${escapeHtml(state.wind?.label || "Calma")}</span>
      </div>
      <div class="tanks-status-copy">
        <p class="tanks-status-title">${escapeHtml(status.title)}</p>
        <p class="tanks-status-note">${escapeHtml(status.note)}</p>
      </div>
      <div class="tanks-status-meta">
        ${(status.meta || []).map((item) => `<span class="tanks-status-pill">${escapeHtml(item)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderControls(state, canAct, players) {
  const tank = activeTank(state);
  const status = buildStatusCopy(state, players);

  if (!tank || state.phase !== "AIMING_PHASE") {
    return `
      <div class="tanks-context-panel">
        <span class="tanks-context-tag">${escapeHtml(status.tag)}</span>
        <h3 class="tanks-context-title">${escapeHtml(status.title)}</h3>
        <p class="tanks-context-note">${escapeHtml(status.note)}</p>
      </div>
    `;
  }

  const disabled = !canAct || Boolean(state.result);
  return `
    <div class="tanks-controls" data-tanks-controls>
      <div class="tanks-control">
        <div class="tanks-control-head">
          <span class="tanks-control-label">Movimiento</span>
          <span class="tanks-control-value">${tank.fuel}</span>
        </div>
        <div class="tanks-move-row">
          <button class="tanks-step" type="button" data-tank-move="-1" ${disabled ? "disabled" : ""}>←</button>
          <button class="tanks-step" type="button" data-tank-move="1" ${disabled ? "disabled" : ""}>→</button>
        </div>
      </div>
      <div class="tanks-control">
        <div class="tanks-control-head">
          <span class="tanks-control-label">Angulo</span>
          <span class="tanks-control-value" data-tank-angle-value>${tank.angle}°</span>
        </div>
        <div class="tanks-range-row">
          <button class="tanks-step" type="button" data-tank-step="angle:-2" ${disabled ? "disabled" : ""}>−</button>
          <input class="tanks-range" type="range" min="${MIN_ANGLE}" max="${MAX_ANGLE}" step="1" value="${tank.angle}" data-tank-input="angle" ${disabled ? "disabled" : ""} />
          <button class="tanks-step" type="button" data-tank-step="angle:2" ${disabled ? "disabled" : ""}>+</button>
        </div>
      </div>
      <div class="tanks-control">
        <div class="tanks-control-head">
          <span class="tanks-control-label">Potencia</span>
          <span class="tanks-control-value" data-tank-power-value>${tank.power}%</span>
        </div>
        <div class="tanks-range-row">
          <button class="tanks-step" type="button" data-tank-step="power:-4" ${disabled ? "disabled" : ""}>−</button>
          <input class="tanks-range" type="range" min="${MIN_POWER}" max="${MAX_POWER}" step="1" value="${tank.power}" data-tank-input="power" ${disabled ? "disabled" : ""} />
          <button class="tanks-step" type="button" data-tank-step="power:4" ${disabled ? "disabled" : ""}>+</button>
        </div>
      </div>
      <div class="tanks-control tanks-weapon-panel">
        <div class="tanks-control-head">
          <span class="tanks-control-label">Armamento</span>
          <span class="tanks-control-value">${tank.ammo?.basic || 0}/${tank.ammo?.max || WEAPON_MAX_AMMO}</span>
        </div>
        <button class="tanks-weapon-button is-selected" type="button" data-tank-weapon="basic" ${disabled ? "disabled" : ""}>
          <strong>Canon base</strong>
          <span>Visible solo en AIMING_PHASE</span>
        </button>
      </div>
      <button class="btn btn-primary tanks-fire" type="button" data-tank-fire ${disabled ? "disabled" : ""}>Disparar</button>
    </div>
  `;
}

function renderTouchContextBar(state, canAct, players) {
  const tank = activeTank(state);
  if (!tank || state.phase !== "AIMING_PHASE" || !canAct || state.result) {
    return "";
  }

  const currentPlayer = Number.isInteger(state.activePlayerSlot) ? playerBySlot(players, state.activePlayerSlot) : null;
  return `
    <div class="tanks-touch-context" aria-hidden="true">
      <span class="tanks-touch-pill">${escapeHtml(currentPlayer?.name || "Jugador activo")}</span>
      <span class="tanks-touch-pill">Canon base ${tank.ammo?.basic || 0}/${tank.ammo?.max || WEAPON_MAX_AMMO}</span>
      <span class="tanks-touch-pill">Arrastra desde tu tanque y suelta para disparar</span>
      <span class="tanks-touch-pill">Toque corto a un lado del tanque para mover</span>
    </div>
  `;
}

function renderField(state) {
  const terrain = state.terrain;
  const terrainPathData = terrainPath(terrain);
  const terrainCrest = terrainCrestPath(terrain);
  const sceneTransform = cameraTransform(state.camera);
  return `
    <svg class="tanks-field ${state.phase === "AIMING_PHASE" ? "" : "is-disabled"}" viewBox="0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Campo de tanques" data-tanks-svg>
      <defs>
        <linearGradient id="tankSkyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f8fbff" />
          <stop offset="52%" stop-color="#dbe7f4" />
          <stop offset="100%" stop-color="#aec0d8" />
        </linearGradient>
        <radialGradient id="tankSkyGlow" cx="50%" cy="18%" r="58%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.78)" />
          <stop offset="46%" stop-color="rgba(255,255,255,0.16)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="tankGroundFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b9c5d6" />
          <stop offset="58%" stop-color="#8a98ac" />
          <stop offset="100%" stop-color="#5e6d82" />
        </linearGradient>
        <pattern id="tankGridPattern" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 H 0 V 34" fill="none" stroke="rgba(15,23,42,0.08)" stroke-width="1"></path>
        </pattern>
      </defs>
      <g transform="${sceneTransform}">
        <rect class="tanks-field-frame" x="${FIELD_FRAME_INSET}" y="${FIELD_FRAME_INSET}" width="${FIELD_WIDTH - FIELD_FRAME_INSET * 2}" height="${FIELD_HEIGHT - FIELD_FRAME_INSET * 2}" rx="32"></rect>
        <rect class="tanks-sky" x="${FIELD_FRAME_INSET + 8}" y="${FIELD_FRAME_INSET + 8}" width="${FIELD_WIDTH - (FIELD_FRAME_INSET + 8) * 2}" height="${FIELD_HEIGHT - (FIELD_FRAME_INSET + 8) * 2}" rx="26"></rect>
        <ellipse class="tanks-sky-glow" cx="${FIELD_WIDTH / 2}" cy="124" rx="308" ry="184"></ellipse>
        <rect class="tanks-grid" x="${FIELD_FRAME_INSET + 8}" y="${FIELD_FRAME_INSET + 8}" width="${FIELD_WIDTH - (FIELD_FRAME_INSET + 8) * 2}" height="${FIELD_HEIGHT - (FIELD_FRAME_INSET + 8) * 2}" rx="26"></rect>
        <rect class="tanks-horizon" x="${FIELD_FRAME_INSET + 8}" y="250" width="${FIELD_WIDTH - (FIELD_FRAME_INSET + 8) * 2}" height="108"></rect>
        <path class="tanks-hill-back" d="M 0 ${FIELD_HEIGHT} L 0 398 C 126 362 250 356 360 386 C 464 414 584 420 706 378 C 810 342 888 346 1000 392 L 1000 ${FIELD_HEIGHT} Z"></path>
        <path class="tanks-front-ridge" d="M 0 ${FIELD_HEIGHT} L 0 466 C 122 486 246 476 360 438 C 492 394 620 394 748 430 C 846 458 922 462 1000 448 L 1000 ${FIELD_HEIGHT} Z"></path>
        <path class="tanks-terrain" d="${terrainPathData}"></path>
        <path class="tanks-terrain-crest" d="${terrainCrest}"></path>
        ${renderAimAssist(state)}
        ${state.tanks.map((tank) => tankGroupMarkup(tank, Boolean(state.activePlayerId) && tank.playerId === state.activePlayerId)).join("")}
        ${renderProjectile(state.projectile)}
        ${renderImpact(state.impact)}
      </g>
    </svg>
  `;
}

function renderHandoverOverlay(state, players) {
  if (state.phase !== "DEVICE_HANDOVER") {
    return "";
  }

  const pendingPlayer = Number.isInteger(state.pendingPlayerSlot) ? playerBySlot(players, state.pendingPlayerSlot) : null;
  return `
    <div class="tanks-handover-overlay" data-tank-handover>
      <button class="tanks-handover-card" type="button" data-tank-continue>
        <span class="tanks-handover-kicker">Hot Seat</span>
        <strong class="tanks-handover-title">Turno del Jugador ${escapeHtml(pendingPlayer?.name || "siguiente")}</strong>
        <span class="tanks-handover-copy">Toca o haz clic para tomar el control. El disparo queda bloqueado hasta esta confirmacion.</span>
      </button>
    </div>
  `;
}

function renderStageMarkup(state, players, canAct, layoutMode) {
  const touchLayout = isTouchLayoutMode(layoutMode);
  return `
    <section class="tanks-stage">
      <div class="tanks-battlefield">
        <div class="tanks-stage-hud">
          ${renderHudCard(state.tanks[0], players[0], state)}
          ${renderStageStatus(state, players)}
          ${renderHudCard(state.tanks[1], players[1], state)}
        </div>
        ${renderField(state)}
        ${touchLayout ? renderTouchContextBar(state, canAct, players) : ""}
        ${renderHandoverOverlay(state, players)}
      </div>
      ${touchLayout ? "" : `<div class="tanks-controls-dock">${renderControls(state, canAct, players)}</div>`}
    </section>
  `;
}

function renderShell(state, players, canAct, uiState) {
  const layoutMode = resolveLayoutMode(uiState);
  const touchLayout = isTouchLayoutMode(layoutMode);
  const portraitEmbed = layoutMode === "mobile-portrait";
  const embed = portraitEmbed ? computePortraitEmbedMetrics(uiState) : null;
  const shellStyle = portraitEmbed
    ? ` style="--tanks-embed-frame-width:${round(embed.frameWidth, 2)}px; --tanks-embed-frame-height:${round(
        embed.frameHeight,
        2
      )}px; --tanks-embed-landscape-width:${round(embed.landscapeWidth, 2)}px; --tanks-embed-landscape-height:${round(
        embed.landscapeHeight,
        2
      )}px;"`
    : "";

  if (portraitEmbed) {
    return `
      <section class="tanks-shell is-touch is-mobile-portrait" data-tanks-layout="${layoutMode}"${shellStyle}>
        <div class="tanks-portrait-frame">
          <div class="tanks-portrait-embed">
            <div class="tanks-portrait-canvas">
              ${renderStageMarkup(state, players, canAct, layoutMode)}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="tanks-shell ${touchLayout ? "is-touch is-mobile-landscape" : "is-desktop"}" data-tanks-layout="${layoutMode}">
      ${renderStageMarkup(state, players, canAct, layoutMode)}
    </section>
  `;
}

function renderConfigPanel(options = {}) {
  const currentTerrain = normalizeTerrainKey(options.terrain);
  return `
    <div class="tanks-config-grid">
      <div class="block">
        <h3 class="block-title">Terreno</h3>
        <div class="player-count-row">
          ${TERRAIN_KEYS.map((key) => {
            const meta = terrainMeta(key);
            return `
              <button
                class="pill ${currentTerrain === key ? "is-active" : ""}"
                data-action="set-game-option"
                data-option="terrain"
                data-value="${key}"
                data-value-type="string"
              >
                ${escapeHtml(meta.label)}
              </button>
            `;
          }).join("")}
        </div>
        <p class="info-line">${escapeHtml(terrainMeta(currentTerrain).note)}</p>
      </div>
    </div>
  `;
}

function renderCardIllustration() {
  return `
    <div class="game-illustration" aria-hidden="true">
      <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
        <defs>
          <linearGradient id="tankCardSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#dbe4ef" />
          </linearGradient>
          <linearGradient id="tankCardGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#cbd5e1" />
            <stop offset="100%" stop-color="#94a3b8" />
          </linearGradient>
          <pattern id="tankCardGrid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0V12" fill="none" stroke="rgba(15,23,42,0.08)" stroke-width="0.9"></path>
          </pattern>
        </defs>
        <rect x="16" y="10" width="128" height="74" rx="22" fill="#f8fafc" stroke="rgba(15,23,42,0.16)"></rect>
        <rect x="22" y="16" width="116" height="62" rx="18" fill="url(#tankCardSky)" stroke="#dbe4ef"></rect>
        <rect x="22" y="16" width="116" height="62" rx="18" fill="url(#tankCardGrid)" opacity="0.62"></rect>
        <path d="M22 78L22 58C38 52 52 52 66 57C84 64 98 65 112 58C122 53 130 53 138 56V78Z" fill="url(#tankCardGround)" stroke="#64748b" stroke-width="1.1"></path>
        <path d="M74 53Q81 40 92 36" fill="none" stroke="rgba(51,65,85,0.7)" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round"></path>
        <circle cx="92" cy="36" r="2.4" fill="#fffaf0" stroke="#cbd5e1" stroke-width="1"></circle>
        <g transform="translate(48 58)">
          <ellipse cx="0" cy="8" rx="16" ry="4.6" fill="rgba(45,41,37,0.12)"></ellipse>
          <rect x="-12" y="2" width="24" height="8" rx="3.5" fill="#475569"></rect>
          <rect x="-9" y="-6" width="18" height="10" rx="4" fill="#de7559" stroke="#b3543d" stroke-width="1.3"></rect>
          <line x1="1" y1="-7" x2="16" y2="-13" stroke="#475569" stroke-width="4.2" stroke-linecap="round"></line>
          <circle cx="0" cy="-7" r="5.3" fill="#de7559" stroke="#b3543d" stroke-width="1.3"></circle>
        </g>
        <g transform="translate(112 58)">
          <ellipse cx="0" cy="8" rx="16" ry="4.6" fill="rgba(45,41,37,0.12)"></ellipse>
          <rect x="-12" y="2" width="24" height="8" rx="3.5" fill="#475569"></rect>
          <rect x="-9" y="-6" width="18" height="10" rx="4" fill="#5a87e8" stroke="#375eb8" stroke-width="1.3"></rect>
          <line x1="-1" y1="-7" x2="-16" y2="-12" stroke="#475569" stroke-width="4.2" stroke-linecap="round"></line>
          <circle cx="0" cy="-7" r="5.3" fill="#5a87e8" stroke="#375eb8" stroke-width="1.3"></circle>
        </g>
      </svg>
    </div>
  `;
}

function updatePreview(boardWrap, state, angle, power) {
  const pathNode = boardWrap.querySelector("[data-tank-preview-path]");
  const reticleNode = boardWrap.querySelector("[data-tank-preview-reticle]");
  const currentTank = activeTank(state);
  if (!currentTank || !pathNode) {
    return;
  }

  const points = previewTrajectory(currentTank, state.terrain, state.wind, angle, power);
  const path = trajectoryPath(points);
  const impact = points[points.length - 1];
  pathNode.setAttribute("d", path || "");
  if (impact && reticleNode) {
    reticleNode.setAttribute("transform", `translate(${round(impact.x, 2)} ${round(impact.y, 2)})`);
  }
}

function screenPointToViewBox(svg, clientX, clientY, layoutMode) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  if (!rect.width || !rect.height || !viewBox.width || !viewBox.height) {
    return null;
  }

  if (layoutMode === "mobile-portrait") {
    const rotatedX = clamp(clientX - rect.left, 0, rect.width);
    const rotatedY = clamp(clientY - rect.top, 0, rect.height);
    const unrotatedWidth = rect.height;
    const unrotatedHeight = rect.width;
    const localX = rotatedY;
    const localY = unrotatedHeight - rotatedX;
    return {
      x: (localX / unrotatedWidth) * viewBox.width,
      y: (localY / unrotatedHeight) * viewBox.height
    };
  }

  return {
    x: ((clientX - rect.left) / rect.width) * viewBox.width,
    y: ((clientY - rect.top) / rect.height) * viewBox.height
  };
}

function viewBoxPointToWorld(point, camera) {
  const current = normalizeCamera(camera || createCameraState());
  return {
    x: (point.x - FIELD_WIDTH / 2) / current.zoom + current.centerX,
    y: (point.y - FIELD_HEIGHT / 2) / current.zoom + current.centerY
  };
}

function screenPointToWorld(svg, clientX, clientY, layoutMode, camera) {
  const point = screenPointToViewBox(svg, clientX, clientY, layoutMode);
  if (!point) {
    return null;
  }
  return viewBoxPointToWorld(point, camera);
}

function deriveTouchAim(tank, worldPoint) {
  const originX = tank.x;
  const originY = tank.centerY - 12;
  const horizontal = tank.slot === 0 ? worldPoint.x - originX : originX - worldPoint.x;
  const vertical = originY - worldPoint.y;
  const angle = normalizeAngle((Math.atan2(vertical, horizontal) * 180) / Math.PI);
  const distance = Math.hypot(horizontal, vertical);
  const power = normalizePower(lerp(MIN_POWER, MAX_POWER, clamp(distance / TOUCH_POWER_DISTANCE, 0, 1)));
  return { angle, power };
}

function bindTouchAim(boardWrap, { state, canAct, uiState, dispatchGameAction }) {
  const layoutMode = resolveLayoutMode(uiState);
  if (!isTouchLayoutMode(layoutMode)) {
    return false;
  }

  const svg = boardWrap.querySelector("[data-tanks-svg]");
  if (!(svg instanceof SVGSVGElement)) {
    return false;
  }

  function dispatchActiveAction(action) {
    if (!canAct || state.phase !== "AIMING_PHASE" || !state.activePlayerId || state.result) {
      return Promise.resolve();
    }

    return dispatchGameAction({
      ...action,
      playerId: state.activePlayerId
    });
  }

  function restorePreview() {
    const currentTank = activeTank(state);
    if (!currentTank) {
      return;
    }
    updatePreview(boardWrap, state, currentTank.angle, currentTank.power);
  }

  let gesture = null;

  function clearGesture() {
    gesture = null;
    restorePreview();
  }

  svg.addEventListener("pointerdown", (event) => {
    if (!canAct || state.phase !== "AIMING_PHASE" || !state.activePlayerId || state.result) {
      return;
    }

    const target = event.target instanceof Element ? event.target.closest("[data-tank-player-id]") : null;
    const currentTank = activeTank(state);
    if (!(target instanceof Element) || !currentTank) {
      return;
    }

    if (String(target.getAttribute("data-tank-player-id") || "") !== currentTank.playerId) {
      return;
    }

    const startWorld = screenPointToWorld(svg, event.clientX, event.clientY, layoutMode, state.camera);
    if (!startWorld) {
      return;
    }

    gesture = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startWorld,
      lastWorld: startWorld,
      startedAtMs: Date.now(),
      screenDistance: 0,
      aiming: false,
      angle: currentTank.angle,
      power: currentTank.power
    };

    if (typeof svg.setPointerCapture === "function") {
      svg.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
  });

  svg.addEventListener("pointermove", (event) => {
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    const worldPoint = screenPointToWorld(svg, event.clientX, event.clientY, layoutMode, state.camera);
    if (!worldPoint) {
      return;
    }

    const currentTank = activeTank(state);
    if (!currentTank) {
      clearGesture();
      return;
    }

    const dx = event.clientX - gesture.startClientX;
    const dy = event.clientY - gesture.startClientY;
    const distance = Math.hypot(dx, dy);
    gesture.lastWorld = worldPoint;
    gesture.screenDistance = distance;

    if (!gesture.aiming && distance >= TOUCH_AIM_ACTIVATION_PX) {
      gesture.aiming = true;
    }

    if (!gesture.aiming) {
      return;
    }

    const aim = deriveTouchAim(currentTank, worldPoint);
    gesture.angle = aim.angle;
    gesture.power = aim.power;
    updatePreview(boardWrap, state, aim.angle, aim.power);
    event.preventDefault();
  });

  function finishGesture(event, cancelled = false) {
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    const currentTank = activeTank(state);
    const duration = Date.now() - gesture.startedAtMs;

    if (typeof svg.releasePointerCapture === "function" && svg.hasPointerCapture?.(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }

    if (cancelled || !currentTank) {
      clearGesture();
      return;
    }

    if (gesture.aiming && gesture.screenDistance >= TOUCH_FIRE_MIN_PULL_PX) {
      dispatchActiveAction({
        type: "fire-shot",
        angle: gesture.angle,
        power: gesture.power,
        nowMs: Date.now()
      }).catch(() => {});
      gesture = null;
      return;
    }

    if (!gesture.aiming && gesture.screenDistance <= TOUCH_MOVE_TAP_MAX_PX && duration <= TOUCH_MOVE_TAP_MAX_MS) {
      const deltaX = (gesture.lastWorld?.x ?? currentTank.x) - currentTank.x;
      if (Math.abs(deltaX) >= 10) {
        dispatchActiveAction({
          type: "move-tank",
          direction: deltaX < 0 ? -1 : 1
        }).catch(() => {});
        gesture = null;
        return;
      }
    }

    clearGesture();
  }

  svg.addEventListener("pointerup", (event) => {
    finishGesture(event);
  });

  svg.addEventListener("pointercancel", (event) => {
    finishGesture(event, true);
  });

  return true;
}

function bindBoardElement(boardWrap, { state, canAct, uiState, dispatchGameAction }) {
  const continueButton = boardWrap.querySelector("[data-tank-continue]");
  if (continueButton) {
    continueButton.addEventListener("click", () => {
      dispatchGameAction({
        type: "continue-handover",
        playerId: state.pendingPlayerId,
        nowMs: Date.now()
      }).catch(() => {});
    });
  }

  if (bindTouchAim(boardWrap, { state, canAct, uiState, dispatchGameAction })) {
    return;
  }

  const controls = boardWrap.querySelector("[data-tanks-controls]");
  if (!controls) {
    return;
  }

  const angleInput = controls.querySelector("[data-tank-input='angle']");
  const powerInput = controls.querySelector("[data-tank-input='power']");
  const angleValueNode = controls.querySelector("[data-tank-angle-value]");
  const powerValueNode = controls.querySelector("[data-tank-power-value]");
  const fireButton = controls.querySelector("[data-tank-fire]");

  if (!(angleInput instanceof HTMLInputElement) || !(powerInput instanceof HTMLInputElement) || !angleValueNode || !powerValueNode || !fireButton) {
    return;
  }

  let localAngle = normalizeAngle(angleInput.value);
  let localPower = normalizePower(powerInput.value);

  function dispatchActiveAction(action) {
    if (!canAct || state.phase !== "AIMING_PHASE" || !state.activePlayerId) {
      return Promise.resolve();
    }

    return dispatchGameAction({
      ...action,
      playerId: state.activePlayerId
    });
  }

  function syncLocalUi() {
    angleInput.value = String(localAngle);
    powerInput.value = String(localPower);
    angleValueNode.textContent = `${localAngle}°`;
    powerValueNode.textContent = `${localPower}%`;
    updatePreview(boardWrap, state, localAngle, localPower);
  }

  async function pushAimState() {
    await dispatchActiveAction({
      type: "set-aim",
      angle: localAngle,
      power: localPower
    });
  }

  angleInput.addEventListener("input", () => {
    localAngle = normalizeAngle(angleInput.value);
    syncLocalUi();
  });

  powerInput.addEventListener("input", () => {
    localPower = normalizePower(powerInput.value);
    syncLocalUi();
  });

  angleInput.addEventListener("change", () => {
    pushAimState().catch(() => {});
  });

  powerInput.addEventListener("change", () => {
    pushAimState().catch(() => {});
  });

  controls.querySelectorAll("[data-tank-step]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!canAct || state.phase !== "AIMING_PHASE") {
        return;
      }
      const raw = String(event.currentTarget.dataset.tankStep || "");
      const [kind, amountRaw] = raw.split(":");
      const amount = Number(amountRaw);
      if (!Number.isFinite(amount)) {
        return;
      }

      if (kind === "angle") {
        localAngle = normalizeAngle(localAngle + amount);
      } else if (kind === "power") {
        localPower = normalizePower(localPower + amount);
      }

      syncLocalUi();
      pushAimState().catch(() => {});
    });
  });

  controls.querySelectorAll("[data-tank-move]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!canAct || state.phase !== "AIMING_PHASE") {
        return;
      }

      const direction = Number(event.currentTarget.dataset.tankMove);
      if (direction !== -1 && direction !== 1) {
        return;
      }

      dispatchActiveAction({
        type: "move-tank",
        direction
      }).catch(() => {});
    });
  });

  controls.querySelectorAll("[data-tank-weapon]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!canAct || state.phase !== "AIMING_PHASE") {
        return;
      }

      dispatchActiveAction({
        type: "select-weapon",
        weaponId: String(event.currentTarget.dataset.tankWeapon || "basic")
      }).catch(() => {});
    });
  });

  fireButton.addEventListener("click", () => {
    if (!canAct || state.phase !== "AIMING_PHASE") {
      return;
    }

    dispatchActiveAction({
      type: "fire-shot",
      angle: localAngle,
      power: localPower,
      nowMs: Date.now()
    }).catch(() => {});
  });

  syncLocalUi();
}

export const tanquesGame = {
  id: "tanques",
  name: "Tanques",
  subtitle: "2 jugadores",
  tagline: "Apunta, dispara y resiste",
  minPlayers: 2,
  maxPlayers: 2,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  useLandscapeMobileShell: true,
  compactPortraitSubtitle: "",
  allowFullscreen: true,
  rules: [
    { title: "Objetivo", text: "Gana quien deja la vida rival en cero antes de caer." },
    { title: "Turno", text: "En cada turno ajustas angulo y potencia, y luego disparas una sola vez." },
    { title: "Impacto", text: "El proyectil puede golpear el terreno o al tanque rival. Los impactos directos hacen mucho mas dano." },
    { title: "Victoria", text: "La partida termina al destruir al rival o si ambos tanques caen en el mismo impacto." }
  ],
  getDefaultOptions() {
    return {
      terrain: "clasico"
    };
  },
  normalizeOptions(options = {}) {
    return {
      terrain: normalizeTerrainKey(options.terrain)
    };
  },
  renderConfigPanel({ options }) {
    ensureTankStyles();
    return renderConfigPanel(options);
  },
  createInitialState({ options, players }) {
    return createState(options, players);
  },
  getTurnSlot(state) {
    if (Number.isInteger(state?.activePlayerSlot)) {
      return state.activePlayerSlot;
    }
    if (Number.isInteger(state?.pendingPlayerSlot)) {
      return state.pendingPlayerSlot;
    }
    return 0;
  },
  getResult(state) {
    return state?.result || null;
  },
  getTurnMessage({ state, players }) {
    return buildStatusCopy(state, players).title;
  },
  getShellSubtitle({ state, players }) {
    const status = buildStatusCopy(state, players);
    return `Vida ${state.tanks[0].health} - ${state.tanks[1].health} · ${status.title}`;
  },
  applyAction({ state, action }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "set-aim") {
      return setAim(state, action);
    }

    if (action.type === "move-tank") {
      return moveTank(state, action);
    }

    if (action.type === "select-weapon") {
      return selectWeapon(state, action);
    }

    if (action.type === "fire-shot") {
      return fireShot(state, action);
    }

    if (action.type === "continue-handover") {
      return continueHandover(state, action);
    }

    if (action.type === "tick") {
      if (state.phase === "TURN_START") {
        return tickTurnStart(state, action);
      }
      if (state.phase === "SIMULATION") {
        return tickSimulation(state, action);
      }
      if (state.phase === "DAMAGE_EVALUATION") {
        return tickDamageEvaluation(state, action);
      }
      if (state.phase === "END_TURN") {
        return tickEndTurn(state);
      }
      return { ok: false, reason: "invalid" };
    }

    return { ok: false, reason: "invalid" };
  },
  renderCardIllustration() {
    ensureTankStyles();
    return renderCardIllustration();
  },
  renderBoard({ state, players, canAct, uiState }) {
    ensureTankStyles();
    return renderShell(state, players, canAct, uiState);
  },
  patchBoardElement(boardWrap, { state, players, canAct, uiState }) {
    ensureTankStyles();
    boardWrap.innerHTML = renderShell(state, players, canAct, uiState);
    return true;
  },
  bindBoardElement(boardWrap, ctx) {
    ensureTankStyles();
    bindBoardElement(boardWrap, ctx);
  },
  formatResult({ state, players }) {
    if (state.result?.type === "draw") {
      return {
        title: "Empate total",
        subtitle: `Ambos tanques quedaron fuera de combate en ${state.turnNumber} turnos.`,
        iconText: "=",
        iconClass: "draw"
      };
    }

    const winner = players.find((player) => player.slot === state.result?.winnerSlot);
    const loser = players.find((player) => player.slot !== state.result?.winnerSlot);
    const winnerTank = state.tanks.find((tank) => tank.slot === state.result?.winnerSlot);
    const loserTank = state.tanks.find((tank) => tank.slot !== state.result?.winnerSlot);

    return {
      title: `${winner ? winner.name : "Jugador"} gana`,
      subtitle: `${winnerTank ? winnerTank.health : 0} de vida restante frente a ${loserTank ? loserTank.health : 0}. Terreno ${terrainMeta(state.terrain.key).label.toLowerCase()}.`,
      iconText: "✦",
      iconClass: "win"
    };
  }
};
