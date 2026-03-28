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
const IMPACT_DURATION_MS = 780;

const DAMAGE_RADIUS = 138;
const SPLASH_DAMAGE = 46;
const DIRECT_HIT_BONUS = 20;
const STARTING_HEALTH = 100;

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
  padding: 12px 14px;
}

.game-screen-tanques .topbar-title {
  font-size: clamp(1.36rem, 2.15vw, 1.92rem);
}

.game-screen-tanques .board-wrap {
  display: block;
  padding: 0;
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
  display: grid;
  gap: 12px;
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
  border-radius: 24px;
  border: 1px solid rgba(208, 194, 168, 0.82);
  background:
    radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, rgba(255, 252, 247, 0.98) 0%, rgba(245, 236, 223, 0.98) 100%);
  box-shadow:
    0 20px 34px rgba(52, 48, 41, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
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
  border-color: rgba(116, 167, 137, 0.8);
  box-shadow:
    0 24px 38px rgba(55, 63, 51, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.84),
    0 0 0 3px rgba(110, 169, 139, 0.12);
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
  color: #667267;
  font-size: 0.79rem;
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
  border: 1px solid rgba(212, 202, 184, 0.86);
  background: rgba(255, 255, 255, 0.62);
  color: #46554a;
  font-size: 0.7rem;
  font-weight: 720;
}

.tanks-stage {
  padding: 12px;
}

.tanks-stage::before {
  background:
    radial-gradient(circle at 14% 12%, rgba(130, 171, 255, 0.08), rgba(130, 171, 255, 0) 22%),
    radial-gradient(circle at 86% 86%, rgba(225, 135, 99, 0.08), rgba(225, 135, 99, 0) 28%);
}

.tanks-orientation-note {
  display: none;
}

.tanks-orientation-card {
  display: grid;
  gap: 8px;
  width: min(100%, 430px);
  margin: 0 auto;
  padding: 20px 18px;
  border-radius: 24px;
  border: 1px solid rgba(210, 197, 171, 0.84);
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, rgba(255, 252, 246, 0.98) 0%, rgba(246, 238, 226, 0.98) 100%);
  box-shadow:
    0 18px 28px rgba(54, 48, 40, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  text-align: center;
}

.tanks-orientation-eyebrow {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 24px;
  margin: 0 auto;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(72, 116, 95, 0.1);
  color: #47695a;
  font-size: 0.64rem;
  font-weight: 820;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tanks-orientation-title {
  margin: 0;
  color: #213029;
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.tanks-orientation-copy {
  margin: 0;
  color: #607065;
  font-size: 0.84rem;
  line-height: 1.4;
}

.tanks-field {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: auto;
  border-radius: 26px;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.tanks-field-frame {
  fill: #f8efde;
  stroke: #d8c39f;
  stroke-width: 2;
}

.tanks-sky {
  fill: url(#tankSkyFill);
  stroke: rgba(223, 210, 183, 0.94);
  stroke-width: 1.3;
}

.tanks-sun {
  fill: rgba(250, 236, 182, 0.88);
}

.tanks-cloud {
  fill: rgba(255, 255, 255, 0.74);
}

.tanks-hill-back {
  fill: #d7e7cf;
}

.tanks-terrain {
  fill: url(#tankGroundFill);
  stroke: #9b8c62;
  stroke-width: 2.6;
}

.tanks-terrain-crest {
  fill: none;
  stroke: rgba(255, 248, 232, 0.32);
  stroke-width: 8;
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
  stroke-width: 7;
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
  fill: rgba(43, 41, 37, 0.12);
}

.tanks-track {
  fill: #665a47;
}

.tanks-track-detail {
  fill: rgba(255, 255, 255, 0.08);
}

.tanks-tank.is-slot-0 .tanks-hull,
.tanks-tank.is-slot-0 .tanks-turret {
  fill: #de7559;
  stroke: #b3543d;
}

.tanks-tank.is-slot-1 .tanks-hull,
.tanks-tank.is-slot-1 .tanks-turret {
  fill: #5a87e8;
  stroke: #375eb8;
}

.tanks-hull,
.tanks-turret {
  stroke-width: 3.4;
  paint-order: stroke;
}

.tanks-hull-sheen,
.tanks-turret-sheen {
  fill: rgba(255, 255, 255, 0.16);
}

.tanks-barrel {
  stroke: #6f6a61;
  stroke-width: 8.8;
  stroke-linecap: round;
}

.tanks-barrel-core {
  stroke: #e7ddd0;
  stroke-width: 3.1;
  stroke-linecap: round;
}

.tanks-muzzle {
  fill: #f9f4ed;
  stroke: #d9c8ae;
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
  stroke: rgba(82, 111, 96, 0.82);
  stroke-width: 4.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 0 0 12 10;
  filter: drop-shadow(0 6px 8px rgba(34, 53, 45, 0.12));
}

.tanks-preview-impact {
  fill: rgba(255, 255, 255, 0.78);
  stroke: rgba(89, 118, 103, 0.84);
  stroke-width: 2.8;
}

.tanks-controls {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 10px;
  margin-top: 12px;
}

.tanks-control {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 20px;
  border: 1px solid rgba(212, 201, 180, 0.82);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(248, 240, 228, 0.88) 100%);
}

.tanks-control-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tanks-control-label,
.tanks-control-value {
  color: #53665c;
  font-size: 0.73rem;
  font-weight: 780;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tanks-range-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.tanks-step {
  min-width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid rgba(212, 200, 177, 0.88);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.76);
  color: #425247;
  font-size: 1rem;
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
  accent-color: #74a68c;
}

.tanks-fire {
  min-width: 180px;
  border-radius: 20px;
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

.tanks-field.is-disabled .tanks-preview-line,
.tanks-field.is-disabled .tanks-preview-impact {
  opacity: 0.24;
}

.tanks-config-grid {
  display: grid;
  gap: 18px;
}

@media (max-width: 980px) {
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
    padding: 10px;
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

@media (max-width: 900px) and (orientation: portrait) {
  .app-shell:not(.app-shell-home) .screen.game-screen-tanques {
    width: min(100%, calc(100vw - 8px));
    min-height: calc(100dvh - 10px);
  }

  .game-screen-tanques .board-wrap {
    padding: 0;
  }

  .game-screen-tanques .actions-bottom {
    display: none;
  }

  .tanks-shell {
    display: none;
  }

  .tanks-orientation-note {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: clamp(280px, 56dvh, 420px);
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
    padding: 8px;
    border-radius: 20px;
  }

  .tanks-controls {
    gap: 8px;
    margin-top: 8px;
  }

  .tanks-control {
    gap: 6px;
    padding: 8px 10px;
    border-radius: 16px;
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

function createTank(slot, terrain) {
  const x = slot === 0 ? 168 : 832;
  const groundY = groundYAtTank(x, terrain);
  const centerY = groundY - 24;
  return {
    slot,
    x,
    centerY,
    groundY,
    angle: slot === 0 ? 54 : 56,
    power: slot === 0 ? 68 : 66,
    health: STARTING_HEALTH
  };
}

function createState(options = {}) {
  const terrain = buildTerrain(options.terrain);
  const tanks = [createTank(0, terrain), createTank(1, terrain)];
  return {
    phase: "ready",
    turnSlot: 0,
    turnNumber: 1,
    terrain,
    tanks,
    projectile: null,
    impact: null,
    lastReport: {
      kind: "opening"
    },
    result: null
  };
}

function cloneTanks(tanks) {
  return tanks.map((tank) => ({ ...tank }));
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

function previewTrajectory(tank, terrain, angle = tank.angle, power = tank.power) {
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
  const damageBySlot = tanks.map((tank) => {
    const hitCenter = hitCenterForTank(tank);
    const distance = Math.hypot(hitCenter.x - impactPoint.x, hitCenter.y - impactPoint.y);
    const closeness = clamp(1 - distance / DAMAGE_RADIUS, 0, 1);
    let damage = closeness > 0 ? Math.round(SPLASH_DAMAGE * closeness ** 1.24) : 0;
    if (tank.slot === directSlot) {
      damage += DIRECT_HIT_BONUS;
    }
    return Math.max(0, damage);
  });

  return damageBySlot;
}

function summarizeImpactReport(previousState, nextTanks, impact, directSlot) {
  const damageBySlot = previousState.tanks.map((tank, slot) => Math.max(0, tank.health - nextTanks[slot].health));
  const totalDamage = damageBySlot[0] + damageBySlot[1];

  return {
    kind: directSlot !== null ? "direct-hit" : totalDamage > 0 ? "splash-hit" : "miss",
    shooterSlot: previousState.turnSlot,
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

function setAim(state, action, actorSlot) {
  if (state.phase !== "ready" || actorSlot !== state.turnSlot) {
    return { ok: false, reason: "turn" };
  }

  const tanks = cloneTanks(state.tanks);
  const active = tanks[state.turnSlot];
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

function fireShot(state, action, actorSlot) {
  if (state.phase !== "ready" || actorSlot !== state.turnSlot) {
    return { ok: false, reason: "turn" };
  }

  const tanks = cloneTanks(state.tanks);
  const active = tanks[state.turnSlot];
  const angle = normalizeAngle(action.angle ?? active.angle);
  const power = normalizePower(action.power ?? active.power);
  active.angle = angle;
  active.power = power;

  const muzzle = muzzlePointForTank(active);
  const vector = vectorForShot(active.slot, angle);
  const speed = speedFromPower(power);

  return {
    ok: true,
    state: {
      ...state,
      phase: "projectile",
      tanks,
      projectile: {
        x: muzzle.x,
        y: muzzle.y,
        vx: vector.x * speed,
        vy: vector.y * speed,
        ownerSlot: active.slot,
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

function tickProjectile(state, action) {
  if (state.phase !== "projectile" || !state.projectile) {
    return { ok: false, reason: "invalid" };
  }

  const deltaMs = clamp(Number(action.deltaMs) || 0, 0, MAX_FRAME_MS);
  if (deltaMs <= 0) {
    return {
      ok: true,
      state
    };
  }

  const steps = Math.max(1, Math.ceil(deltaMs / PROJECTILE_STEP_MS));
  const dtSeconds = deltaMs / steps / 1000;
  const projectile = {
    ...state.projectile,
    trail: Array.isArray(state.projectile.trail) ? [...state.projectile.trail] : []
  };
  let impact = null;
  let directSlot = null;

  for (let step = 0; step < steps; step += 1) {
    const start = { x: projectile.x, y: projectile.y };
    const end = {
      x: projectile.x + projectile.vx * dtSeconds,
      y: projectile.y + projectile.vy * dtSeconds
    };
    projectile.vy += GRAVITY * dtSeconds;

    const tanks = state.tanks;
    for (let slot = 0; slot < tanks.length; slot += 1) {
      const hit = segmentHitsTank(start, end, tanks[slot]);
      if (hit.hit) {
        impact = hit.point;
        directSlot = tanks[slot].slot;
        break;
      }
    }

    if (!impact) {
      if (end.x < 0 || end.x > FIELD_WIDTH || end.y > FIELD_HEIGHT) {
        const edgePoint = {
          x: clamp(end.x, 0, FIELD_WIDTH),
          y: terrainHeightAt(state.terrain, clamp(end.x, 0, FIELD_WIDTH))
        };
        impact = edgePoint;
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
    if (projectile.trail.length > 14) {
      projectile.trail.shift();
    }
  }

  if (!impact) {
    return {
      ok: true,
      state: {
        ...state,
        projectile
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
      phase: result ? "finished" : "impact",
      tanks,
      projectile: null,
      impact: {
        x: impact.x,
        y: impact.y,
        elapsedMs: 0,
        durationMs: IMPACT_DURATION_MS,
        directSlot,
        damageBySlot
      },
      lastReport: report,
      result
    }
  };
}

function tickImpact(state, action) {
  if (state.phase !== "impact" || !state.impact) {
    return { ok: false, reason: "invalid" };
  }

  const deltaMs = Math.max(0, Number(action.deltaMs) || 0);
  const elapsedMs = Math.min(state.impact.durationMs, state.impact.elapsedMs + deltaMs);
  const impact = {
    ...state.impact,
    elapsedMs
  };

  if (elapsedMs < state.impact.durationMs) {
    return {
      ok: true,
      state: {
        ...state,
        impact
      }
    };
  }

  const nextTurn = state.turnSlot === 0 ? 1 : 0;
  return {
    ok: true,
    state: {
      ...state,
      phase: "ready",
      turnSlot: nextTurn,
      turnNumber: state.turnNumber + 1,
      projectile: null,
      impact: null,
      lastReport: state.lastReport
    }
  };
}

function buildStatusCopy(state, players) {
  const currentPlayer = players.find((player) => player.slot === state.turnSlot) || players[0];
  const lastReport = state.lastReport || { kind: "opening" };

  if (state.result?.type === "win") {
    const winner = players.find((player) => player.slot === state.result.winnerSlot);
    return {
      tag: "Victoria",
      title: `${winner ? winner.name : "Un jugador"} gana la bateria`,
      note: "La artilleria rival se ha quedado sin vida.",
      meta: [`Turnos: ${state.turnNumber}`, `Terreno ${terrainMeta(state.terrain.key).label.toLowerCase()}`]
    };
  }

  if (state.result?.type === "draw") {
    return {
      tag: "Empate",
      title: "Ambos tanques caen",
      note: "El impacto final dejo a los dos equipos fuera de combate.",
      meta: [`Turnos: ${state.turnNumber}`, `Terreno ${terrainMeta(state.terrain.key).label.toLowerCase()}`]
    };
  }

  if (state.phase === "projectile") {
    const shooter = players.find((player) => player.slot === state.projectile?.ownerSlot) || currentPlayer;
    return {
      tag: "En vuelo",
      title: `Disparo de ${shooter ? shooter.name : "Jugador"}`,
      note: "Espera a que el proyectil impacte para cerrar el turno.",
      meta: [`Turno ${state.turnNumber}`, `${terrainMeta(state.terrain.key).label}`]
    };
  }

  if (state.phase === "impact") {
    const totalDamage = (state.impact?.damageBySlot || []).reduce((sum, damage) => sum + damage, 0);
    return {
      tag: "Impacto",
      title: totalDamage > 0 ? "Golpe confirmado" : "Impacto sin dano",
      note: totalDamage > 0 ? "La onda expansiva ya se ha aplicado. El siguiente turno entra enseguida." : "El proyectil toco terreno, pero no alcanzo a ningun tanque.",
      meta: [`Turno ${state.turnNumber}`, `${terrainMeta(state.terrain.key).label}`]
    };
  }

  if (lastReport.kind === "direct-hit") {
    const target = players.find((player) => player.slot === lastReport.directSlot);
    const damage = lastReport.damageBySlot?.[lastReport.directSlot] || 0;
    return {
      tag: "Impacto directo",
      title: `${target ? target.name : "El rival"} recibe ${damage} de dano`,
      note: `${currentPlayer ? currentPlayer.name : "Jugador"} ya prepara el siguiente tiro.`,
      meta: [`Turno ${state.turnNumber}`, `${terrainMeta(state.terrain.key).label}`]
    };
  }

  if (lastReport.kind === "splash-hit") {
    const damage = (lastReport.damageBySlot || []).reduce((sum, value) => sum + value, 0);
    return {
      tag: "Onda expansiva",
      title: `El impacto deja ${damage} de dano`,
      note: `Turno de ${currentPlayer ? currentPlayer.name : "Jugador"}. Ajusta angulo y potencia antes de disparar.`,
      meta: [`Turno ${state.turnNumber}`, `${terrainMeta(state.terrain.key).label}`]
    };
  }

  if (lastReport.kind === "miss") {
    return {
      tag: "Turno",
      title: `Turno de ${currentPlayer ? currentPlayer.name : "Jugador"}`,
      note: "El ultimo disparo se fue largo. Busca una curva mejor y prueba otra vez.",
      meta: [`Turno ${state.turnNumber}`, `${terrainMeta(state.terrain.key).label}`]
    };
  }

  if (lastReport.kind === "shot") {
    return {
      tag: "Apunta",
      title: `Turno de ${currentPlayer ? currentPlayer.name : "Jugador"}`,
      note: "Ajusta el canion con el angulo y la potencia. Un impacto directo hace mucho mas dano.",
      meta: [`Turno ${state.turnNumber}`, `${terrainMeta(state.terrain.key).label}`]
    };
  }

  return {
    tag: "Apertura",
    title: `Turno de ${currentPlayer ? currentPlayer.name : "Jugador"}`,
    note: "Elige angulo y potencia para enviar el primer proyectil.",
    meta: [`Turno ${state.turnNumber}`, `${terrainMeta(state.terrain.key).label}`]
  };
}

function renderTankCard(player, tank, isActive) {
  const meta = teamMeta(player.slot);
  const health = clamp((tank.health / STARTING_HEALTH) * 100, 0, 100);
  return `
    <article class="tanks-team-card is-team-${player.slot} ${isActive ? "is-active" : ""}" style="--tank-health:${health}%">
      <div class="tanks-card-head">
        <div class="tanks-team-badge">
          <span class="tanks-team-dot" aria-hidden="true"></span>
          <div>
            <p class="tanks-team-name">${escapeHtml(player.name)}</p>
            <p class="tanks-team-role">${escapeHtml(meta.short)} · ${tank.health} de vida</p>
          </div>
        </div>
        <p class="tanks-health">${tank.health}</p>
      </div>
      <div class="tanks-health-track" aria-hidden="true">
        <div class="tanks-health-fill"></div>
      </div>
    </article>
  `;
}

function renderStatusCard(state, players) {
  const copy = buildStatusCopy(state, players);
  return `
    <article class="tanks-status-card">
      <div class="tanks-status-top">
        <span class="tanks-status-tag">${escapeHtml(copy.tag)}</span>
      </div>
      <div class="tanks-status-copy">
        <h3 class="tanks-status-title">${escapeHtml(copy.title)}</h3>
        <p class="tanks-status-note">${escapeHtml(copy.note)}</p>
      </div>
      <div class="tanks-status-meta">
        ${copy.meta.map((item) => `<span class="tanks-status-pill">${escapeHtml(item)}</span>`).join("")}
      </div>
    </article>
  `;
}

function tankGroupMarkup(tank, isActive) {
  const vector = vectorForShot(tank.slot, tank.angle);
  const turretX = vector.x * (TANK_BARREL_LENGTH - 10);
  const turretY = vector.y * (TANK_BARREL_LENGTH - 10);
  return `
    <g class="tanks-tank is-slot-${tank.slot} ${isActive ? "is-active" : ""}">
      <circle class="tanks-active-ring" cx="${round(tank.x, 2)}" cy="${round(tank.centerY - 6, 2)}" r="42"></circle>
      <ellipse class="tanks-shadow" cx="${round(tank.x, 2)}" cy="${round(tank.groundY + 6, 2)}" rx="54" ry="11"></ellipse>
      <g transform="translate(${round(tank.x, 2)} ${round(tank.centerY, 2)})">
        <rect class="tanks-track" x="${-TANK_TRACK_WIDTH / 2}" y="8" width="${TANK_TRACK_WIDTH}" height="${TANK_TRACK_HEIGHT}" rx="8"></rect>
        <rect class="tanks-track-detail" x="${-TANK_TRACK_WIDTH / 2 + 10}" y="11" width="${TANK_TRACK_WIDTH - 20}" height="4" rx="2"></rect>
        <rect class="tanks-hull" x="${-TANK_BODY_WIDTH / 2}" y="-2" width="${TANK_BODY_WIDTH}" height="${TANK_BODY_HEIGHT}" rx="10"></rect>
        <path class="tanks-hull-sheen" d="M ${-TANK_BODY_WIDTH / 2 + 8} 4 Q 0 -6 ${TANK_BODY_WIDTH / 2 - 8} 4 L ${TANK_BODY_WIDTH / 2 - 12} 9 Q 0 0 ${-TANK_BODY_WIDTH / 2 + 12} 9 Z"></path>
        <line class="tanks-barrel" x1="0" y1="-12" x2="${round(turretX, 2)}" y2="${round(-12 + turretY, 2)}"></line>
        <line class="tanks-barrel-core" x1="0" y1="-12" x2="${round(turretX, 2)}" y2="${round(-12 + turretY, 2)}"></line>
        <circle class="tanks-turret" cx="0" cy="-12" r="${TANK_TURRET_RADIUS}"></circle>
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

  const progress = clamp(impact.elapsedMs / impact.durationMs, 0, 1);
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

function renderPreview(state) {
  if (state.phase !== "ready") {
    return "";
  }
  const tank = state.tanks[state.turnSlot];
  if (!tank) {
    return "";
  }
  const points = previewTrajectory(tank, state.terrain, tank.angle, tank.power);
  const path = trajectoryPath(points);
  const impact = points[points.length - 1];
  if (!path || !impact) {
    return "";
  }
  return `
    <g class="tanks-preview" aria-hidden="true">
      <path class="tanks-preview-line" d="${path}" data-tank-preview-path></path>
    </g>
  `;
}

function renderControls(state, canAct) {
  const tank = state.tanks[state.turnSlot];
  const disabled = !canAct || state.phase !== "ready" || Boolean(state.result);
  return `
    <div class="tanks-controls" data-tanks-controls>
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
      <button class="btn btn-primary tanks-fire" type="button" data-tank-fire ${disabled ? "disabled" : ""}>Disparar</button>
    </div>
  `;
}

function renderField(state) {
  const terrain = state.terrain;
  const terrainPathData = terrainPath(terrain);
  const terrainCrest = terrainCrestPath(terrain);
  return `
    <svg class="tanks-field ${state.phase === "ready" ? "" : "is-disabled"}" viewBox="0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Campo de tanques" data-tanks-svg>
      <defs>
        <linearGradient id="tankSkyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#eaf5ff" />
          <stop offset="62%" stop-color="#dcecf6" />
          <stop offset="100%" stop-color="#eef1eb" />
        </linearGradient>
        <linearGradient id="tankGroundFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d6c089" />
          <stop offset="100%" stop-color="#b18d56" />
        </linearGradient>
      </defs>
      <rect class="tanks-field-frame" x="${FIELD_FRAME_INSET}" y="${FIELD_FRAME_INSET}" width="${FIELD_WIDTH - FIELD_FRAME_INSET * 2}" height="${FIELD_HEIGHT - FIELD_FRAME_INSET * 2}" rx="32"></rect>
      <rect class="tanks-sky" x="${FIELD_FRAME_INSET + 8}" y="${FIELD_FRAME_INSET + 8}" width="${FIELD_WIDTH - (FIELD_FRAME_INSET + 8) * 2}" height="${FIELD_HEIGHT - (FIELD_FRAME_INSET + 8) * 2}" rx="26"></rect>
      <circle class="tanks-sun" cx="188" cy="112" r="44"></circle>
      <ellipse class="tanks-cloud" cx="324" cy="112" rx="48" ry="18"></ellipse>
      <ellipse class="tanks-cloud" cx="356" cy="100" rx="26" ry="12"></ellipse>
      <ellipse class="tanks-cloud" cx="734" cy="134" rx="62" ry="20"></ellipse>
      <ellipse class="tanks-cloud" cx="780" cy="120" rx="32" ry="12"></ellipse>
      <path class="tanks-hill-back" d="M 0 ${FIELD_HEIGHT} L 0 402 C 118 360 210 352 312 384 C 420 418 534 426 650 384 C 756 346 840 352 1000 414 L 1000 ${FIELD_HEIGHT} Z"></path>
      <path class="tanks-terrain" d="${terrainPathData}"></path>
      <path class="tanks-terrain-crest" d="${terrainCrest}"></path>
      ${renderPreview(state)}
      ${state.tanks.map((tank, slot) => tankGroupMarkup(tank, state.phase === "ready" && state.turnSlot === slot)).join("")}
      ${renderProjectile(state.projectile)}
      ${renderImpact(state.impact)}
    </svg>
  `;
}

function renderShell(state, players, canAct) {
  const safePlayers = Array.isArray(players) && players.length >= 2
    ? players
    : [
        { slot: 0, name: "Jugador 1" },
        { slot: 1, name: "Jugador 2" }
      ];
  return `
    <section class="tanks-orientation-note" aria-live="polite">
      <article class="tanks-orientation-card">
        <span class="tanks-orientation-eyebrow">Mejor en horizontal</span>
        <h3 class="tanks-orientation-title">Gira el dispositivo</h3>
        <p class="tanks-orientation-copy">En paisaje el terreno gana mucho mas ancho y el tiro se ajusta mejor.</p>
      </article>
    </section>
    <section class="tanks-shell">
      <div class="tanks-strip">
        ${renderTankCard(safePlayers[0], state.tanks[0], state.turnSlot === 0 && !state.result)}
        ${renderStatusCard(state, safePlayers)}
        ${renderTankCard(safePlayers[1], state.tanks[1], state.turnSlot === 1 && !state.result)}
      </div>
      <section class="tanks-stage">
        ${renderField(state)}
        ${renderControls(state, canAct)}
        <p class="tanks-footer"><strong>Consejo:</strong> los impactos directos hacen mucho mas dano, pero un buen tiro alto puede caer justo detras de la loma rival.</p>
      </section>
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
            <stop offset="0%" stop-color="#eaf6ff" />
            <stop offset="100%" stop-color="#edf1e7" />
          </linearGradient>
          <linearGradient id="tankCardGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#dcc58f" />
            <stop offset="100%" stop-color="#bd9761" />
          </linearGradient>
        </defs>
        <rect x="16" y="10" width="128" height="74" rx="22" fill="#f7f0e2" stroke="#dcc7a4"></rect>
        <rect x="22" y="16" width="116" height="62" rx="18" fill="url(#tankCardSky)" stroke="#dfd4c0"></rect>
        <circle cx="42" cy="30" r="10" fill="rgba(248, 232, 180, 0.84)"></circle>
        <path d="M22 78L22 56C40 52 52 52 66 58C82 65 98 66 112 58C122 52 128 52 138 56V78Z" fill="url(#tankCardGround)" stroke="#a78859" stroke-width="1.2"></path>
        <path d="M74 53Q81 40 92 36" fill="none" stroke="rgba(86, 111, 95, 0.84)" stroke-width="2.3" stroke-dasharray="4 4" stroke-linecap="round"></path>
        <circle cx="92" cy="36" r="2.4" fill="#fffaf0" stroke="#cab38a" stroke-width="1"></circle>
        <g transform="translate(48 58)">
          <ellipse cx="0" cy="8" rx="16" ry="4.6" fill="rgba(45,41,37,0.12)"></ellipse>
          <rect x="-12" y="2" width="24" height="8" rx="3.5" fill="#675a47"></rect>
          <rect x="-9" y="-6" width="18" height="10" rx="4" fill="#de7559" stroke="#b3543d" stroke-width="1.3"></rect>
          <line x1="1" y1="-7" x2="16" y2="-13" stroke="#6e675e" stroke-width="4.2" stroke-linecap="round"></line>
          <circle cx="0" cy="-7" r="5.3" fill="#de7559" stroke="#b3543d" stroke-width="1.3"></circle>
        </g>
        <g transform="translate(112 58)">
          <ellipse cx="0" cy="8" rx="16" ry="4.6" fill="rgba(45,41,37,0.12)"></ellipse>
          <rect x="-12" y="2" width="24" height="8" rx="3.5" fill="#675a47"></rect>
          <rect x="-9" y="-6" width="18" height="10" rx="4" fill="#5a87e8" stroke="#375eb8" stroke-width="1.3"></rect>
          <line x1="-1" y1="-7" x2="-16" y2="-12" stroke="#6e675e" stroke-width="4.2" stroke-linecap="round"></line>
          <circle cx="0" cy="-7" r="5.3" fill="#5a87e8" stroke="#375eb8" stroke-width="1.3"></circle>
        </g>
      </svg>
    </div>
  `;
}

function updatePreview(boardWrap, state, angle, power) {
  const pathNode = boardWrap.querySelector("[data-tank-preview-path]");
  const impactNode = boardWrap.querySelector("[data-tank-preview-impact]");
  const currentTank = state.tanks[state.turnSlot];
  if (!currentTank || !pathNode) {
    return;
  }
  const points = previewTrajectory(currentTank, state.terrain, angle, power);
  const path = trajectoryPath(points);
  const impact = points[points.length - 1];
  pathNode.setAttribute("d", path || "");
  if (impact && impactNode) {
    impactNode.setAttribute("cx", String(round(impact.x, 2)));
    impactNode.setAttribute("cy", String(round(impact.y, 2)));
  }
}

function bindBoardElement(boardWrap, { state, canAct, dispatchGameAction }) {
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

  function syncLocalUi() {
    angleInput.value = String(localAngle);
    powerInput.value = String(localPower);
    angleValueNode.textContent = `${localAngle}°`;
    powerValueNode.textContent = `${localPower}%`;
    updatePreview(boardWrap, state, localAngle, localPower);
  }

  async function pushAimState() {
    if (!canAct || state.phase !== "ready") {
      return;
    }

    await dispatchGameAction({
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
      if (!canAct || state.phase !== "ready") {
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

  fireButton.addEventListener("click", () => {
    if (!canAct || state.phase !== "ready") {
      return;
    }

    dispatchGameAction({
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
  createInitialState({ options }) {
    return createState(options);
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
  applyAction({ state, action, actorSlot }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "set-aim") {
      return setAim(state, action, actorSlot);
    }

    if (action.type === "fire-shot") {
      return fireShot(state, action, actorSlot);
    }

    if (action.type === "tick") {
      if (state.phase === "projectile") {
        return tickProjectile(state, action);
      }
      if (state.phase === "impact") {
        return tickImpact(state, action);
      }
      return { ok: false, reason: "invalid" };
    }

    return { ok: false, reason: "invalid" };
  },
  renderCardIllustration() {
    ensureTankStyles();
    return renderCardIllustration();
  },
  renderBoard({ state, players, canAct }) {
    ensureTankStyles();
    return renderShell(state, players, canAct);
  },
  patchBoardElement(boardWrap, { state, players, canAct }) {
    ensureTankStyles();
    boardWrap.innerHTML = renderShell(state, players, canAct);
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
      iconText: "TK",
      iconClass: "win"
    };
  }
};
