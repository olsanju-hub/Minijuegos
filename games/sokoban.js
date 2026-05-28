const LEVELS = [
  {
    id: "almacen-1",
    label: "Nivel 1",
    subtitle: "Primer empuje",
    board: [
      "#######",
      "#     #",
      "# .$@ #",
      "#     #",
      "#######"
    ]
  },
  {
    id: "almacen-2",
    label: "Nivel 2",
    subtitle: "Paralelas cortas",
    board: [
      "########",
      "#  . . #",
      "#  $ $ #",
      "#  @   #",
      "#      #",
      "########"
    ]
  },
  {
    id: "almacen-3",
    label: "Nivel 3",
    subtitle: "Dianas abiertas",
    board: [
      "########",
      "# .  . #",
      "# $$   #",
      "#  @   #",
      "#      #",
      "########"
    ]
  },
  {
    id: "almacen-4",
    label: "Nivel 4",
    subtitle: "Muro central",
    board: [
      "########",
      "#  .   #",
      "#  $   #",
      "# ##$ .#",
      "#  @   #",
      "########"
    ]
  },
  {
    id: "almacen-5",
    label: "Nivel 5",
    subtitle: "Esquina de lectura",
    board: [
      "##########",
      "#  . .   #",
      "#  $$#   #",
      "# ## @   #",
      "#        #",
      "##########"
    ]
  },
  {
    id: "almacen-6",
    label: "Nivel 6",
    subtitle: "Triple reparto",
    board: [
      "##########",
      "# . # .  #",
      "# $  $ # #",
      "# . $ @  #",
      "#        #",
      "##########"
    ]
  },
  {
    id: "almacen-7",
    label: "Nivel 7",
    subtitle: "Pasillo partido",
    board: [
      "###########",
      "# . . .   #",
      "# $$# $   #",
      "#   @ #   #",
      "#         #",
      "###########"
    ]
  },
  {
    id: "almacen-8",
    label: "Nivel 8",
    subtitle: "Lectura en abanico",
    board: [
      "##########",
      "# .  . . #",
      "# $$$ #  #",
      "#   @    #",
      "#        #",
      "##########"
    ]
  },
  {
    id: "almacen-9",
    label: "Nivel 9",
    subtitle: "Cruce contenido",
    board: [
      "############",
      "# . . # .  #",
      "# $  $ ##  #",
      "#   @  $   #",
      "#          #",
      "############"
    ]
  },
  {
    id: "almacen-10",
    label: "Nivel 10",
    subtitle: "Cierre final",
    board: [
      "###########",
      "# .  .  . #",
      "# $$$ ##  #",
      "#    @    #",
      "#         #",
      "###########"
    ]
  }
];

const LEVEL_BY_ID = new Map(LEVELS.map((level, index) => [level.id, { ...level, index }]));

const DIRECTIONS = Object.freeze({
  up: { id: "up", row: -1, col: 0, icon: "↑", label: "Arriba" },
  down: { id: "down", row: 1, col: 0, icon: "↓", label: "Abajo" },
  left: { id: "left", row: 0, col: -1, icon: "←", label: "Izquierda" },
  right: { id: "right", row: 0, col: 1, icon: "→", label: "Derecha" }
});

const SOKOBAN_STYLE_ID = "minijuegos-sokoban-phase";

const SOKOBAN_STYLES = String.raw`
.app-shell:not(.app-shell-home) .screen.game-screen-sokoban {
  width: min(1220px, 100%);
  gap: 10px;
}

.game-screen-sokoban .board-wrap {
  display: block;
}

.app-shell:not(.app-shell-home) .game-screen-sokoban .actions-bottom {
  display: none !important;
}

.sokoban-shell {
  width: min(100%, 1120px);
  margin: 0 auto;
  display: grid;
  gap: 10px;
  align-items: start;
  grid-template-areas:
    "hud"
    "stage"
    "controls";
}

/* STEAMPUNK DARK METALLIC HUD & CONTROLS */
.sokoban-hud,
.sokoban-controls,
.sokoban-board-frame {
  border: 2px solid #5a4738;
  border-radius: 26px;
  background:
    radial-gradient(circle at top left, rgba(140, 100, 60, 0.12), transparent 60%),
    linear-gradient(180deg, #231c18 0%, #15110e 100%);
  box-shadow:
    0 18px 30px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -2px 5px rgba(0, 0, 0, 0.8);
}

.sokoban-hud {
  grid-area: hud;
  padding: 14px 16px;
  display: grid;
  gap: 10px;
}

.sokoban-hud.is-blocked,
.sokoban-controls.is-blocked {
  border-color: #ce523c;
  box-shadow:
    0 18px 28px rgba(0, 0, 0, 0.6),
    0 0 0 4px rgba(206, 82, 60, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.sokoban-hud.is-complete,
.sokoban-controls.is-complete,
.sokoban-board-frame.is-complete {
  border-color: #6da747;
  background:
    radial-gradient(circle at top left, rgba(100, 180, 80, 0.1), transparent 60%),
    linear-gradient(180deg, #1b2417 0%, #10160d 100%);
}

.sokoban-hud-copy {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.sokoban-mode-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sokoban-mode-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(224, 142, 69, 0.15);
  color: #e08e45;
  font-size: 0.66rem;
  font-weight: 780;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid rgba(224, 142, 69, 0.2);
}

.sokoban-mode-pill.is-soft {
  background: rgba(143, 184, 255, 0.1);
  color: #8fb8ff;
  border-color: rgba(143, 184, 255, 0.15);
}

.sokoban-level-subtitle {
  margin: 0;
  color: #ebdcc2;
  font-size: 0.88rem;
  font-weight: 720;
}

.sokoban-note {
  margin: 0;
  color: #a49688;
  font-size: 0.88rem;
  line-height: 1.38;
}

.sokoban-note.is-blocked {
  color: #e2634e;
  font-weight: 700;
}

.sokoban-note.is-complete {
  color: #87c570;
  font-weight: 700;
}

.sokoban-progress-track {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 5px;
}

.sokoban-progress-dot {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.3);
}

.sokoban-progress-dot.is-past {
  background: rgba(224, 142, 69, 0.3);
}

.sokoban-progress-dot.is-current {
  background: linear-gradient(180deg, #efb267 0%, #d8863e 100%);
  box-shadow: 0 0 8px #d8863e;
}

.sokoban-progress-dot.is-cleared {
  background: linear-gradient(180deg, #b7d78f 0%, #73ac5e 100%);
  box-shadow: 0 0 8px #73ac5e;
}

.sokoban-live-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

/* BRASS GAUGE TONES FOR STATS */
.sokoban-stat {
  display: grid;
  gap: 4px;
  border-radius: 16px;
  padding: 9px 10px;
  background: linear-gradient(180deg, #1b1613 0%, #29211c 100%);
  border: 1px solid #564436;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
}

.sokoban-stat.is-clear {
  background: linear-gradient(180deg, #151e12 0%, #202c1b 100%);
  border-color: #496a3b;
}

.sokoban-stat-label {
  color: #8c8072;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sokoban-stat-value {
  color: #e08e45;
  font-size: 0.98rem;
  line-height: 1.1;
  font-family: monospace, Courier;
  font-weight: 700;
}

.sokoban-stat.is-clear .sokoban-stat-value {
  color: #87c570;
}

.sokoban-stage {
  grid-area: stage;
  min-width: 0;
  position: relative;
}

/* STEAMPUNK FACTORY BOARD FRAME */
.sokoban-board-frame {
  position: relative;
  display: grid;
  place-items: center;
  padding: clamp(8px, 1.4vw, 16px);
  overflow: hidden;
  border-radius: clamp(22px, 3vw, 30px);
  border: 3px solid #6b4d32;
  background:
    radial-gradient(circle at center, rgba(139, 90, 43, 0.06), transparent 70%),
    repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 10px, transparent 10px, transparent 20px),
    linear-gradient(180deg, #1d1714 0%, #0c0a08 100%);
  box-shadow:
    0 22px 38px rgba(0, 0, 0, 0.7),
    inset 0 4px 8px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition:
    box-shadow var(--ui-speed) var(--ui-ease),
    border-color var(--ui-speed) var(--ui-ease),
    transform var(--ui-speed) var(--ui-ease);
}

/* STEAM PIPES IN THE FACTORY BACKGROUND */
.sokoban-board-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 10% 10%, rgba(220, 140, 60, 0.04), transparent 50%),
    radial-gradient(circle at 90% 90%, rgba(220, 140, 60, 0.04), transparent 50%);
  opacity: 0.75;
}

.sokoban-board-frame.is-blocked {
  border-color: #ce523c;
  box-shadow:
    0 22px 34px rgba(0,0,0,0.7),
    0 0 0 5px rgba(206, 82, 60, 0.25),
    inset 0 4px 8px rgba(0,0,0,0.8);
  animation: sokobanBlocked 220ms var(--ui-ease);
}

@keyframes sokobanBlocked {
  0% { transform: translateX(0); }
  35% { transform: translateX(-5px); }
  70% { transform: translateX(5px); }
  100% { transform: translateX(0); }
}

/* SHAKE ON PUSH CRATES */
@keyframes pushShake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-3px, 1.5px); }
  50% { transform: translate(3px, -1.5px); }
  75% { transform: translate(-1.5px, -3px); }
}

.sokoban-board-frame.is-push-shake {
  animation: pushShake 0.16s cubic-bezier(.36,.07,.19,.97) both;
}

.sokoban-board {
  --sokoban-gap: clamp(3px, 0.55vw, 6px);
  --sokoban-cell-size: clamp(44px, 6.8vw, 84px);
  display: grid;
  grid-template-columns: repeat(var(--sokoban-cols), minmax(0, var(--sokoban-cell-size)));
  grid-template-rows: repeat(var(--sokoban-rows), minmax(0, var(--sokoban-cell-size)));
  gap: var(--sokoban-gap);
  position: relative;
  width: min(100%, calc((var(--sokoban-cols) * var(--sokoban-cell-size)) + ((var(--sokoban-cols) - 1) * var(--sokoban-gap))));
  height: calc((var(--sokoban-rows) * var(--sokoban-cell-size)) + ((var(--sokoban-rows) - 1) * var(--sokoban-gap)));
  margin: 0 auto;
  z-index: 1;
}

.sokoban-grid,
.sokoban-entities {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: repeat(var(--sokoban-cols), minmax(0, var(--sokoban-cell-size)));
  grid-template-rows: repeat(var(--sokoban-rows), minmax(0, var(--sokoban-cell-size)));
  gap: var(--sokoban-gap);
  width: 100%;
  height: 100%;
}

.sokoban-grid {
  position: relative;
  z-index: 1;
}

.sokoban-entities {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.sokoban-cell {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.sokoban-tile {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

/* METAL FLOOR GRATING */
.sokoban-cell.is-floor .sokoban-tile {
  border: 1px solid #362920;
  background:
    repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(0,0,0,0.4) 4px, rgba(0,0,0,0.4) 5px),
    repeating-linear-gradient(0deg, transparent 0px, transparent 4px, rgba(0,0,0,0.4) 4px, rgba(0,0,0,0.4) 5px),
    radial-gradient(circle at center, #271f1a 10%, #15110e 100%);
  box-shadow:
    inset 0 0 10px rgba(224, 142, 69, 0.08),
    inset 0 1px 2px rgba(255,255,255,0.05);
}

/* AGED RUSTIC INDUSTRIAL BRICK WALLS */
.sokoban-cell.is-wall .sokoban-tile {
  border: 2px solid #23120b;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.3) 100%),
    repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 12px),
    #5a3321;
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.12),
    inset 0 -3px 0 rgba(0,0,0,0.4),
    0 4px 6px rgba(0,0,0,0.3);
}

/* BRONZE MECHANICAL GEAR GOALS */
.sokoban-goal {
  position: absolute;
  inset: 15%;
  border-radius: 50%;
  border: 2px dashed #e08e45;
  background: radial-gradient(circle, rgba(224, 142, 69, 0.22) 0%, transparent 70%);
  box-shadow: 
    0 0 8px rgba(224, 142, 69, 0.4), 
    inset 0 0 8px rgba(224, 142, 69, 0.3);
  animation: gearRotate 16s linear infinite;
}

@keyframes gearRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sokoban-cell.has-box-on-target .sokoban-goal {
  border-color: #87c570;
  background: radial-gradient(circle, rgba(135, 197, 112, 0.25) 0%, transparent 70%);
  box-shadow: 
    0 0 12px rgba(135, 197, 112, 0.5),
    inset 0 0 10px rgba(135, 197, 112, 0.3);
}

.sokoban-cell.has-player-on-target .sokoban-goal {
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.4),
    0 0 0 3px rgba(100, 164, 229, 0.1);
}

.sokoban-piece {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: visible;
  border-radius: 0;
  will-change: transform;
  animation: sokobanEntityStep 150ms cubic-bezier(0.24, 0.8, 0.26, 1);
}

.sokoban-piece.is-moving {
  animation: sokobanEntitySlide 150ms cubic-bezier(0.24, 0.8, 0.26, 1);
}

/* PUFF STEAM PARTICLES UNDER MOVING BOXES/PLAYER */
.sokoban-piece.is-moving::before,
.sokoban-piece.is-moving::after {
  content: "";
  position: absolute;
  bottom: -4px;
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, rgba(240, 240, 240, 0.8) 0%, rgba(240, 240, 240, 0) 70%);
  border-radius: 50%;
  opacity: 0;
  animation: puffSteam 0.15s ease-out forwards;
}
.sokoban-piece.is-moving::before {
  left: 6px;
  animation-delay: 0.01s;
}
.sokoban-piece.is-moving::after {
  right: 6px;
  animation-delay: 0.04s;
}

@keyframes puffSteam {
  0% { transform: scale(0.4) translateY(0); opacity: 0; filter: blur(1px); }
  50% { opacity: 0.7; }
  100% { transform: scale(1.6) translateY(-8px); opacity: 0; filter: blur(3px); }
}

@keyframes sokobanEntityStep {
  from {
    opacity: 0.92;
    transform: scale(0.96);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sokobanEntitySlide {
  from {
    transform: translate(
      calc(var(--sokoban-delta-x, 0) * 15%),
      calc(var(--sokoban-delta-y, 0) * 15%)
    );
    opacity: 0.94;
  }

  to {
    transform: translate(0, 0);
    opacity: 1;
  }
}

.sokoban-box-wrap,
.sokoban-player {
  width: 65%;
  height: 65%;
  display: grid;
  place-items: center;
  align-self: center;
  justify-self: center;
}

/* HEAVY WOODEN CRATES WITH CORNER REMACHES */
.sokoban-box {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  border: 3px solid #3c2414;
  background: 
    repeating-linear-gradient(90deg, #7c4c24, #7c4c24 8px, #683e1c 8px, #683e1c 10px);
  box-shadow: 
    0 6px 12px rgba(0,0,0,0.6),
    inset 0 0 10px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.15);
  position: relative;
}

.sokoban-box::before {
  content: "";
  position: absolute;
  inset: -1px;
  border: 5px solid #1c1a18;
  clip-path: polygon(
    0 0, 12px 0, 12px 4px, 4px 4px, 4px 12px, 0 12px,
    0 100%, 0 calc(100% - 12px), 4px calc(100% - 12px), 4px calc(100% - 4px), 12px calc(100% - 4px), 12px 100%,
    100% 100%, calc(100% - 12px) 100%, calc(100% - 12px) calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) calc(100% - 12px), 100% calc(100% - 12px),
    100% 0, 100% 12px, calc(100% - 4px) 12px, calc(100% - 4px) 4px, calc(100% - 12px) 4px, calc(100% - 12px) 0
  );
  background: #151312;
}

.sokoban-box::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg, transparent 40%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.45) 60%, transparent 60%),
    linear-gradient(0deg, transparent 40%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.45) 60%, transparent 60%);
  pointer-events: none;
}

.sokoban-box-rivet {
  position: absolute;
  top: 22%;
  left: 22%;
  width: clamp(4px, 0.66vw, 6px);
  height: clamp(4px, 0.66vw, 6px);
  border-radius: 50%;
  background: #cba876;
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

.sokoban-box-rivet.is-right {
  left: auto;
  right: 22%;
}

/* TARGETED GREEN/GOLD GLOWING BOX */
.sokoban-piece.is-targeted .sokoban-box {
  border-color: #2b401d;
  background: 
    repeating-linear-gradient(90deg, #537537, #537537 8px, #425e2b 8px, #425e2b 10px);
  box-shadow: 
    0 0 16px rgba(135, 197, 112, 0.6),
    inset 0 0 10px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.sokoban-piece.is-targeted .sokoban-box::before {
  border-color: #253319;
  background: #141b10;
}

.sokoban-piece.is-targeted .sokoban-box-rivet {
  background: #b5c7a3;
}

/* BRASS STEAM AUTOMATON PLAYER CHIP */
.sokoban-player-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #3c2f24;
  background: 
    radial-gradient(circle at 35% 35%, #fce2a6 0%, #c48e58 40%, #764b22 100%);
  box-shadow: 
    0 6px 12px rgba(0,0,0,0.5),
    inset 0 2px 4px rgba(255,255,255,0.45),
    inset 0 -4px 6px rgba(0,0,0,0.3);
  position: relative;
}

.sokoban-player-core::before {
  content: "";
  position: absolute;
  top: 26%;
  left: 18%;
  width: 22%;
  height: 22%;
  border-radius: 50%;
  background: #00ffff;
  border: 2px solid #23201e;
  box-shadow: 0 0 8px #00ffff, inset 0 1px 2px white;
}

.sokoban-player-core::after {
  content: "";
  position: absolute;
  top: 26%;
  right: 18%;
  width: 22%;
  height: 22%;
  border-radius: 50%;
  background: #00ffff;
  border: 2px solid #23201e;
  box-shadow: 0 0 8px #00ffff, inset 0 1px 2px white;
}

/* CAMPAIGN COMPLETE DIALOG OVERLAY */
.sokoban-stage-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  padding: 14px;
  background: rgba(12, 9, 8, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.sokoban-stage-card {
  width: min(100%, 320px);
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 22px;
  border: 2px solid #5a4738;
  background:
    radial-gradient(circle at top left, rgba(140, 100, 60, 0.1), transparent 60%),
    linear-gradient(180deg, #231c18 0%, #15110e 100%);
  box-shadow:
    0 22px 34px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.sokoban-stage-kicker {
  margin: 0;
  color: #e08e45;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sokoban-stage-title {
  margin: 0;
  color: #ebdcc2;
  font-size: 1.18rem;
  line-height: 1.08;
}

.sokoban-stage-text {
  margin: 0;
  color: #a49688;
  font-size: 0.84rem;
  line-height: 1.4;
}

.sokoban-stage-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.sokoban-stage-chip {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 14px;
  border: 1px solid #564436;
  background: rgba(0, 0, 0, 0.25);
  display: grid;
  align-content: center;
  gap: 2px;
}

.sokoban-stage-chip-label {
  color: #8c8072;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sokoban-stage-chip-value {
  color: #ebdcc2;
  font-size: 0.86rem;
  font-weight: 800;
}

.sokoban-stage-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sokoban-stage-actions .btn {
  flex: 1 1 140px;
  min-width: 0;
}

.sokoban-controls {
  grid-area: controls;
  padding: 12px 14px;
  display: grid;
  gap: 8px;
}

.sokoban-controls-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.sokoban-controls-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.sokoban-controls-title {
  margin: 0;
  color: #ebdcc2;
  font-size: 0.94rem;
}

.sokoban-controls-note,
.sokoban-controls-hint {
  margin: 0;
  color: #8c8072;
  font-size: 0.79rem;
  line-height: 1.4;
}

.sokoban-controls.is-complete .sokoban-controls-note,
.sokoban-controls.is-complete .sokoban-controls-hint {
  color: #87c570;
}

.sokoban-utility-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: stretch;
}

.sokoban-undo-btn,
.sokoban-reset-btn {
  flex: 1 1 0;
  min-width: 0;
  min-height: 38px;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #564436;
  background: linear-gradient(180deg, #2e2621 0%, #1b1613 100%);
  color: #ebdcc2;
}

.sokoban-control-pad {
  width: min(100%, 186px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.sokoban-control-gap {
  min-height: 42px;
  visibility: hidden;
}

.sokoban-control-btn {
  min-height: 42px;
  padding: 0;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 800;
  border: 1px solid #564436;
  background: linear-gradient(180deg, #2e2621 0%, #1b1613 100%);
  color: #e08e45;
}

.sokoban-control-btn:hover {
  background: linear-gradient(180deg, #3d322c 0%, #29211c 100%);
  border-color: #6a5342;
}

@media (min-width: 761px) and (max-width: 1099px) {
  .sokoban-shell {
    width: min(100%, 900px);
  }

  .sokoban-board {
    --sokoban-gap: clamp(3px, 0.45vw, 5px);
    --sokoban-cell-size: clamp(36px, calc((100vw - 92px) / var(--sokoban-cols)), 80px);
  }
}

@media (min-width: 1100px) {
  .sokoban-shell {
    width: min(100%, 1180px);
    grid-template-columns: minmax(0, 1fr) 258px;
    grid-template-areas:
      "stage hud"
      "stage controls";
    column-gap: 14px;
  }

  .sokoban-stage {
    display: grid;
  }
}

@media (max-width: 760px) {
  .app-shell:not(.app-shell-home) .screen.game-screen-sokoban {
    width: min(100%, calc(100vw - 10px));
    gap: 8px;
  }

  .app-shell:not(.app-shell-home) .game-screen-sokoban .topbar {
    padding: 12px;
  }

  .sokoban-shell {
    width: min(100%, 720px);
    gap: 8px;
  }

  .sokoban-hud {
    padding: 10px 12px;
    gap: 8px;
  }

  .sokoban-mode-row {
    gap: 6px;
  }

  .sokoban-mode-pill {
    min-height: 22px;
    padding: 0 8px;
    font-size: 0.6rem;
  }

  .sokoban-level-subtitle {
    font-size: 0.76rem;
  }

  .sokoban-note {
    font-size: 0.78rem;
    line-height: 1.3;
  }

  .sokoban-progress-track {
    gap: 4px;
  }

  .sokoban-progress-dot {
    height: 7px;
  }

  .sokoban-live-grid {
    gap: 5px;
  }

  .sokoban-stat {
    padding: 7px 8px;
    border-radius: 12px;
  }

  .sokoban-stat-label {
    font-size: 0.58rem;
  }

  .sokoban-stat-value {
    font-size: 0.82rem;
  }

  .sokoban-board-frame {
    padding: 6px;
    border-radius: 18px;
  }

  .sokoban-board-frame[data-game-swipe-zone] {
    touch-action: none;
    overscroll-behavior: contain;
  }

  .sokoban-board {
    --sokoban-gap: clamp(2px, 0.45vw, 4px);
    --sokoban-cell-size: clamp(27px, calc((100vw - 56px) / var(--sokoban-cols)), 56px);
  }

  .sokoban-cell {
    border-radius: 9px;
  }

  .sokoban-stage-overlay {
    padding: 10px;
  }

  .sokoban-stage-card {
    width: min(100%, 296px);
    padding: 14px;
    border-radius: 18px;
    gap: 8px;
  }

  .sokoban-stage-title {
    font-size: 1.05rem;
  }

  .sokoban-stage-text {
    font-size: 0.78rem;
  }

  .sokoban-stage-chip {
    min-height: 36px;
    padding: 0 10px;
    border-radius: 12px;
  }

  .sokoban-stage-chip-label {
    font-size: 0.56rem;
  }

  .sokoban-stage-chip-value {
    font-size: 0.78rem;
  }

  .sokoban-controls {
    padding: 10px 12px;
    gap: 6px;
  }

  .sokoban-controls-head {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }

  .sokoban-controls-title {
    font-size: 0.86rem;
  }

  .sokoban-controls-note,
  .sokoban-controls-hint {
    font-size: 0.72rem;
    line-height: 1.34;
  }

  .sokoban-utility-row {
    justify-content: stretch;
  }

  .sokoban-undo-btn,
  .sokoban-reset-btn {
    flex: 1 1 0;
    min-width: 0;
    min-height: 34px;
    height: 34px;
    padding: 0 10px;
    font-size: 0.78rem;
  }

  .sokoban-control-pad {
    width: min(100%, 168px);
    gap: 5px;
  }

  .sokoban-control-gap {
    display: block;
    min-height: 36px;
  }

  .sokoban-control-btn {
    min-height: 36px;
    height: 36px;
    border-radius: 12px;
    font-size: 0.94rem;
  }
}

/* Phase 1 visual unification: light warehouse materials */
.sokoban-hud,
.sokoban-controls,
.sokoban-board-frame {
  border: 1px solid rgba(215, 198, 166, 0.9);
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.8), transparent 58%),
    linear-gradient(180deg, #fffaf1 0%, #efe2c8 100%);
  box-shadow:
    0 16px 30px rgba(72, 58, 38, 0.12),
    inset 0 1px 0 rgba(255,255,255,0.95);
}

.sokoban-hud.is-blocked,
.sokoban-controls.is-blocked {
  border-color: #e6b5a8;
  box-shadow: 0 14px 26px rgba(156, 72, 50, 0.12), 0 0 0 4px rgba(206, 82, 60, 0.1), inset 0 1px 0 rgba(255,255,255,0.95);
}

.sokoban-hud.is-complete,
.sokoban-controls.is-complete,
.sokoban-board-frame.is-complete {
  border-color: #bdd9c5;
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.78), transparent 58%),
    linear-gradient(180deg, #f7fbf4 0%, #e3efd9 100%);
}

.sokoban-mode-pill {
  background: #f4e8d5;
  color: #8a6235;
  border-color: #ddc49e;
}

.sokoban-mode-pill.is-soft {
  background: #eef3fb;
  color: #4f6f9b;
  border-color: #d4dfef;
}

.sokoban-level-subtitle,
.sokoban-controls-title,
.sokoban-stage-title,
.sokoban-stage-chip-value {
  color: #25313f;
}

.sokoban-note,
.sokoban-controls-note,
.sokoban-controls-hint,
.sokoban-stage-text {
  color: #667085;
}

.sokoban-note.is-blocked {
  color: #b85b4a;
}

.sokoban-note.is-complete,
.sokoban-controls.is-complete .sokoban-controls-note,
.sokoban-controls.is-complete .sokoban-controls-hint {
  color: #2f755b;
}

.sokoban-progress-dot {
  background: rgba(189, 169, 132, 0.2);
  border-color: rgba(189, 169, 132, 0.35);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}

.sokoban-progress-dot.is-past {
  background: #ead6b5;
}

.sokoban-progress-dot.is-current {
  background: linear-gradient(180deg, #f0c783 0%, #d89a4f 100%);
  box-shadow: 0 4px 8px rgba(170, 112, 44, 0.16);
}

.sokoban-progress-dot.is-cleared {
  background: linear-gradient(180deg, #cce6c8 0%, #8fc17f 100%);
  box-shadow: 0 4px 8px rgba(82, 130, 70, 0.14);
}

.sokoban-stat,
.sokoban-stat.is-clear {
  background: rgba(255,255,255,0.66);
  border-color: #e3d7c3;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 14px rgba(92, 72, 43, 0.06);
}

.sokoban-stat-label,
.sokoban-stage-chip-label {
  color: #7b8794;
}

.sokoban-stat-value {
  color: #8a6235;
  font-family: 'Outfit', 'Inter', sans-serif;
}

.sokoban-stat.is-clear .sokoban-stat-value {
  color: #2f755b;
}

.sokoban-board-frame {
  border: 1px solid #d8c49d;
  background:
    linear-gradient(rgba(179, 151, 105, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(179, 151, 105, 0.08) 1px, transparent 1px),
    linear-gradient(180deg, #fff8ec 0%, #ead9bd 100%);
  background-size: 24px 24px, 24px 24px, auto;
}

.sokoban-board-frame::before {
  opacity: 0.32;
  background:
    radial-gradient(circle at 14% 12%, rgba(255,255,255,0.7), transparent 30%),
    radial-gradient(circle at 88% 86%, rgba(128, 98, 52, 0.08), transparent 32%);
}

.sokoban-board-frame.is-blocked {
  border-color: #e4a895;
  box-shadow: 0 16px 28px rgba(156, 72, 50, 0.14), 0 0 0 4px rgba(206, 82, 60, 0.1), inset 0 1px 0 rgba(255,255,255,0.95);
}

.sokoban-cell.is-floor .sokoban-tile {
  border: 1px solid #e0d2bc;
  background:
    linear-gradient(90deg, rgba(184, 160, 121, 0.09) 1px, transparent 1px),
    linear-gradient(180deg, #fffdf8 0%, #f0e7d8 100%);
  background-size: 18px 100%, auto;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
}

.sokoban-cell.is-wall .sokoban-tile {
  border: 1px solid #c7aa7c;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 48%),
    repeating-linear-gradient(0deg, rgba(139, 99, 55, 0.08) 0 11px, rgba(139, 99, 55, 0.18) 11px 12px),
    linear-gradient(180deg, #d6ad7b 0%, #b88451 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.36), inset 0 -2px 0 rgba(112, 72, 35, 0.2), 0 4px 8px rgba(91, 72, 42, 0.12);
}

.sokoban-goal {
  border-color: #cf8d45;
  background: radial-gradient(circle, rgba(239, 177, 91, 0.22) 0%, rgba(239, 177, 91, 0.04) 70%);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.5);
  animation: none;
}

.sokoban-cell.has-box-on-target .sokoban-goal {
  border-color: #74a96b;
  background: radial-gradient(circle, rgba(135, 197, 112, 0.22) 0%, rgba(135, 197, 112, 0.04) 70%);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.55);
}

.sokoban-piece.is-moving::before,
.sokoban-piece.is-moving::after {
  display: none;
}

.sokoban-box {
  border: 1px solid #9d6a35;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0) 42%),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 9px, rgba(99, 62, 27, 0.08) 9px 11px),
    linear-gradient(180deg, #d8a064 0%, #ae7338 100%);
  box-shadow: 0 7px 12px rgba(91, 72, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -2px 0 rgba(99, 62, 27, 0.18);
}

.sokoban-box::before {
  border-color: rgba(104, 68, 30, 0.42);
  background: transparent;
}

.sokoban-box::after {
  background:
    linear-gradient(90deg, transparent 42%, rgba(104, 68, 30, 0.2) 42%, rgba(104, 68, 30, 0.2) 58%, transparent 58%),
    linear-gradient(0deg, transparent 42%, rgba(104, 68, 30, 0.18) 42%, rgba(104, 68, 30, 0.18) 58%, transparent 58%);
}

.sokoban-box-rivet {
  background: #f0cf91;
  box-shadow: 0 1px 2px rgba(91, 72, 42, 0.22);
}

.sokoban-piece.is-targeted .sokoban-box {
  border-color: #6d9a5f;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0) 42%),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 9px, rgba(80, 120, 60, 0.08) 9px 11px),
    linear-gradient(180deg, #b8d88d 0%, #82b667 100%);
  box-shadow: 0 7px 12px rgba(82, 130, 70, 0.18), inset 0 1px 0 rgba(255,255,255,0.42);
}

.sokoban-piece.is-targeted .sokoban-box::before {
  border-color: rgba(80, 120, 60, 0.36);
  background: transparent;
}

.sokoban-player-core {
  border-color: #315f8f;
  background:
    radial-gradient(circle at 35% 28%, rgba(255,255,255,0.92) 0 12%, rgba(255,255,255,0) 28%),
    linear-gradient(180deg, #75b7ff 0%, #4e83d8 100%);
  box-shadow: 0 7px 12px rgba(72, 58, 38, 0.18), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 5px rgba(36, 67, 116, 0.24);
}

.sokoban-player-core::before,
.sokoban-player-core::after {
  background: #eaf6ff;
  border-color: #315f8f;
  box-shadow: inset 0 1px 2px white;
}

.sokoban-stage-overlay {
  background: rgba(251, 247, 239, 0.72);
}

.sokoban-stage-card {
  border-color: #d8c49d;
  background: linear-gradient(180deg, #fffdf8 0%, #f1e6d2 100%);
  box-shadow: 0 20px 34px rgba(72, 58, 38, 0.16), inset 0 1px 0 rgba(255,255,255,0.95);
}

.sokoban-stage-kicker {
  color: #8a6235;
}

.sokoban-stage-chip {
  border-color: #e3d7c3;
  background: rgba(255,255,255,0.62);
}

.sokoban-undo-btn,
.sokoban-reset-btn,
.sokoban-control-btn {
  border-color: #d8c49d;
  background: linear-gradient(180deg, #fffdf8 0%, #f1e6d2 100%);
  color: #315f4f;
}

.sokoban-control-btn:hover {
  background: linear-gradient(180deg, #ffffff 0%, #f6ecd9 100%);
  border-color: #c8b084;
}
`;

function ensureSokobanStyles() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(SOKOBAN_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = SOKOBAN_STYLE_ID;
  style.textContent = SOKOBAN_STYLES;
  document.head.append(style);
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

function normalizeLevelId(value) {
  const candidate = String(value || "").trim();
  return LEVEL_BY_ID.has(candidate) ? candidate : LEVELS[0].id;
}

function getLevelMeta(levelId) {
  return LEVEL_BY_ID.get(normalizeLevelId(levelId));
}

function cellIndex(row, col, cols) {
  return row * cols + col;
}

function cellCoords(index, cols) {
  return {
    row: Math.floor(index / cols),
    col: index % cols
  };
}

function countRemainingGoals(boxes, targets) {
  return boxes.reduce((remaining, cell) => remaining + (targets[cell] ? 0 : 1), 0);
}

function isCompleteStatus(status) {
  return status === "level-complete" || status === "campaign-complete";
}

function completionStatusForLevel(levelIndex) {
  return levelIndex >= LEVELS.length - 1 ? "campaign-complete" : "level-complete";
}

function initialNote(levelNumber, totalLevels, message = "") {
  if (message) {
    return message;
  }
  return `Nivel ${levelNumber}/${totalLevels}. Desliza para mover o usa teclado.`;
}

function completionNote(status, levelNumber, totalLevels, moveCount) {
  if (status === "campaign-complete") {
    return `Has completado los ${totalLevels} niveles en esta secuencia.`;
  }
  return `Nivel ${levelNumber} completado en ${moveCount} movimientos. Pasando al siguiente almacen...`;
}

function buildLevelState(levelId, message = "") {
  const level = getLevelMeta(levelId);
  const rows = level.board.length;
  const cols = level.board[0].length;
  const totalCells = rows * cols;
  const walls = Array(totalCells).fill(false);
  const targets = Array(totalCells).fill(false);
  const boxes = [];
  let playerCell = -1;

  for (let row = 0; row < rows; row += 1) {
    const line = level.board[row];
    for (let col = 0; col < cols; col += 1) {
      const char = line[col];
      const index = cellIndex(row, col, cols);

      if (char === "#") {
        walls[index] = true;
      }

      if (char === "." || char === "+" || char === "*") {
        targets[index] = true;
      }

      if (char === "@" || char === "+") {
        playerCell = index;
      }

      if (char === "$" || char === "*") {
        boxes.push(index);
      }
    }
  }

  const remainingGoals = countRemainingGoals(boxes, targets);
  const status = remainingGoals === 0 ? completionStatusForLevel(level.index) : "playing";

  return {
    levelId: level.id,
    levelIndex: level.index,
    levelNumber: level.index + 1,
    totalLevels: LEVELS.length,
    levelLabel: level.label,
    levelSubtitle: level.subtitle,
    rows,
    cols,
    walls,
    targets,
    playerCell,
    boxes,
    history: [],
    moveCount: 0,
    remainingGoals,
    status,
    lastAction: "ready",
    note: status === "playing"
      ? initialNote(level.index + 1, LEVELS.length, message)
      : completionNote(status, level.index + 1, LEVELS.length, 0),
    motion: null
  };
}

function snapshotState(state) {
  return {
    playerCell: state.playerCell,
    boxes: [...state.boxes],
    moveCount: state.moveCount,
    remainingGoals: state.remainingGoals
  };
}

function findMovedBox(previousBoxes, nextBoxes) {
  const from = previousBoxes.find((cell) => !nextBoxes.includes(cell));
  const to = nextBoxes.find((cell) => !previousBoxes.includes(cell));

  if (from === undefined || to === undefined) {
    return null;
  }

  return { from, to };
}

function buildMotion(playerFrom, playerTo, previousBoxes, nextBoxes, kind) {
  const movedBox = findMovedBox(previousBoxes, nextBoxes);
  return {
    kind,
    playerFrom,
    playerTo,
    boxFrom: movedBox ? movedBox.from : null,
    boxTo: movedBox ? movedBox.to : null
  };
}

function buildBlockedState(state, message) {
  return {
    ...state,
    boxes: [...state.boxes],
    history: [...state.history],
    lastAction: "blocked",
    note: message,
    motion: null
  };
}

function buildMoveState(state, nextPlayerCell, nextBoxes, message, lastAction) {
  const remainingGoals = countRemainingGoals(nextBoxes, state.targets);
  const nextStatus = remainingGoals === 0 ? completionStatusForLevel(state.levelIndex) : "playing";

  return {
    ...state,
    playerCell: nextPlayerCell,
    boxes: nextBoxes,
    history: [...state.history, snapshotState(state)],
    moveCount: state.moveCount + 1,
    remainingGoals,
    status: nextStatus,
    lastAction,
    note:
      nextStatus === "playing"
        ? message
        : completionNote(nextStatus, state.levelNumber, state.totalLevels, state.moveCount + 1),
    motion: buildMotion(state.playerCell, nextPlayerCell, state.boxes, nextBoxes, lastAction)
  };
}

function applyMove(state, directionId) {
  const direction = DIRECTIONS[directionId];
  if (!direction) {
    return { ok: false, reason: "invalid" };
  }

  const player = cellCoords(state.playerCell, state.cols);
  const nextRow = player.row + direction.row;
  const nextCol = player.col + direction.col;

  if (nextRow < 0 || nextRow >= state.rows || nextCol < 0 || nextCol >= state.cols) {
    return {
      ok: true,
      state: buildBlockedState(state, "Movimiento bloqueado. Ese borde no es transitable.")
    };
  }

  const nextCell = cellIndex(nextRow, nextCol, state.cols);
  if (state.walls[nextCell]) {
    return {
      ok: true,
      state: buildBlockedState(state, "Movimiento bloqueado. Hay una pared delante.")
    };
  }

  const boxSet = new Set(state.boxes);
  if (boxSet.has(nextCell)) {
    const pushRow = nextRow + direction.row;
    const pushCol = nextCol + direction.col;

    if (pushRow < 0 || pushRow >= state.rows || pushCol < 0 || pushCol >= state.cols) {
      return {
        ok: true,
        state: buildBlockedState(state, "No hay espacio para empujar la caja.")
      };
    }

    const pushCell = cellIndex(pushRow, pushCol, state.cols);
    if (state.walls[pushCell] || boxSet.has(pushCell)) {
      return {
        ok: true,
        state: buildBlockedState(state, "No puedes empujar la caja en esa direccion.")
      };
    }

    const nextBoxes = state.boxes.map((boxCell) => (boxCell === nextCell ? pushCell : boxCell));
    return {
      ok: true,
      state: buildMoveState(state, nextCell, nextBoxes, "Caja empujada. Sigue ordenando el almacen.", "push")
    };
  }

  return {
    ok: true,
    state: buildMoveState(state, nextCell, [...state.boxes], "Movimiento correcto.", "move")
  };
}

function applyUndo(state) {
  if (state.history.length === 0) {
    return {
      ok: true,
      state: {
        ...state,
        boxes: [...state.boxes],
        history: [...state.history],
        lastAction: "undo-empty",
        note: "No hay movimientos para deshacer.",
        motion: null
      }
    };
  }

  const previous = state.history[state.history.length - 1];

  return {
    ok: true,
    state: {
      ...state,
      playerCell: previous.playerCell,
      boxes: [...previous.boxes],
      history: state.history.slice(0, -1),
      moveCount: previous.moveCount,
      remainingGoals: previous.remainingGoals,
      status: "playing",
      lastAction: "undo",
      note: "Ultimo movimiento deshecho.",
      motion: buildMotion(state.playerCell, previous.playerCell, state.boxes, previous.boxes, "undo")
    }
  };
}

function restartLevelState(state, message) {
  return buildLevelState(state.levelId, message || `${state.levelLabel} reiniciado.`);
}

function nextLevelState(state) {
  const nextLevel = LEVELS[state.levelIndex + 1];
  return buildLevelState(
    nextLevel.id,
    `Nivel ${state.levelIndex + 2}/${LEVELS.length}. Desliza para mover o usa teclado.`
  );
}

function restartCampaignState() {
  return buildLevelState(LEVELS[0].id, "Campana reiniciada. Empieza desde el primer almacen.");
}

function renderStat(label, value, tone = "") {
  const className = tone ? `sokoban-stat ${tone}` : "sokoban-stat";
  return `
    <div class="${className}">
      <span class="sokoban-stat-label">${escapeHtml(label)}</span>
      <strong class="sokoban-stat-value">${escapeHtml(String(value))}</strong>
    </div>
  `;
}

function renderCampaignTrack(state) {
  return `
    <div class="sokoban-progress-track" aria-hidden="true">
      ${LEVELS.map((level, index) => {
        const classes = ["sokoban-progress-dot"];
        if (index < state.levelIndex) {
          classes.push("is-past");
        }
        if (index === state.levelIndex) {
          classes.push("is-current");
        }
        if (index === state.levelIndex && isCompleteStatus(state.status)) {
          classes.push("is-cleared");
        }

        return `<span class="${classes.join(" ")}"></span>`;
      }).join("")}
    </div>
  `;
}

function noteText(state) {
  return state.note;
}

function renderHud(state) {
  const hudClass = `sokoban-hud${isCompleteStatus(state.status) ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}`;
  const noteClass = `sokoban-note${isCompleteStatus(state.status) ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}`;

  return `
    <section class="${hudClass}">
      <div class="sokoban-hud-copy">
        <div class="sokoban-mode-row">
          <span class="sokoban-mode-pill">Sokoban</span>
          <span class="sokoban-mode-pill is-soft">Nivel ${escapeHtml(`${state.levelNumber}/${state.totalLevels}`)}</span>
        </div>
        <p class="sokoban-level-subtitle">${escapeHtml(state.levelSubtitle)}</p>
        <p class="${noteClass}">${escapeHtml(noteText(state))}</p>
      </div>
      ${renderCampaignTrack(state)}
      <div class="sokoban-live-grid">
        ${renderStat("Nivel", state.levelNumber)}
        ${renderStat("Movimientos", state.moveCount)}
        ${renderStat("Pendientes", state.remainingGoals, state.remainingGoals === 0 ? "is-clear" : "")}
      </div>
    </section>
  `;
}

function renderBoardCell(index, state, boxSet) {
  const isWall = state.walls[index];
  const isTarget = state.targets[index];
  const hasBox = boxSet.has(index);
  const hasPlayer = state.playerCell === index;
  const boxMoving = Boolean(state.motion && state.motion.boxTo === index);
  const playerMoving = Boolean(state.motion && state.motion.playerTo === index);

  const classes = ["sokoban-cell", isWall ? "is-wall" : "is-floor"];

  if (isTarget) {
    classes.push("is-target");
  }
  if (hasBox && isTarget) {
    classes.push("has-box-on-target");
  }
  if (hasPlayer && isTarget) {
    classes.push("has-player-on-target");
  }

  return `
    <div class="${classes.join(" ")}" aria-hidden="true">
      <span class="sokoban-tile"></span>
      ${!isWall && isTarget ? '<span class="sokoban-goal"></span>' : ""}
      ${hasBox
        ? `
          <span class="sokoban-piece${boxMoving ? " is-moving" : ""}${isTarget ? " is-targeted" : ""}">
            <span class="sokoban-box-wrap">
              <span class="sokoban-box">
                <span class="sokoban-box-rivet"></span>
                <span class="sokoban-box-rivet is-right"></span>
              </span>
            </span>
          </span>
        `
        : ""}
      ${hasPlayer
        ? `
          <span class="sokoban-piece${playerMoving ? " is-moving" : ""}${isTarget ? " is-targeted" : ""}">
            <span class="sokoban-player"><span class="sokoban-player-core"></span></span>
          </span>
        `
        : ""}
    </div>
  `;
}

function renderStageOverlay(state, canAct) {
  if (state.status !== "campaign-complete") {
    return "";
  }

  const title = "Campana completada";
  const text = `Has cerrado la secuencia de ${state.totalLevels} niveles. Puedes repetir el ultimo o volver al primero.`;
  const primaryAction = "restart-campaign";
  const primaryLabel = "Volver al nivel 1";

  return `
    <div class="sokoban-stage-overlay">
      <div class="sokoban-stage-card">
        <p class="sokoban-stage-kicker">Secuencia cerrada</p>
        <h3 class="sokoban-stage-title">${escapeHtml(title)}</h3>
        <p class="sokoban-stage-text">${escapeHtml(text)}</p>
        <div class="sokoban-stage-meta">
          <div class="sokoban-stage-chip">
            <span class="sokoban-stage-chip-label">Campana</span>
            <span class="sokoban-stage-chip-value">${escapeHtml(`${state.levelNumber}/${state.totalLevels}`)}</span>
          </div>
          <div class="sokoban-stage-chip">
            <span class="sokoban-stage-chip-label">Movimientos</span>
            <span class="sokoban-stage-chip-value">${escapeHtml(String(state.moveCount))}</span>
          </div>
        </div>
        <div class="sokoban-stage-actions">
          <button
            class="btn btn-primary"
            data-action="game-action"
            data-game-action="${escapeHtml(primaryAction)}"
            ${!canAct ? "disabled" : ""}
          >
            ${escapeHtml(primaryLabel)}
          </button>
          <button
            class="btn btn-secondary"
            data-action="game-action"
            data-game-action="restart-level"
            ${!canAct ? "disabled" : ""}
          >
            Repetir nivel
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderBoardGrid(state, canAct) {
  const boxSet = new Set(state.boxes);
  const boardClass = `sokoban-board-frame${state.lastAction === "blocked" ? " is-blocked" : ""}${isCompleteStatus(state.status) ? " is-complete" : ""}`;
  const summary = isCompleteStatus(state.status)
    ? `${state.levelLabel}. Nivel resuelto dentro de la secuencia ${state.levelNumber} de ${state.totalLevels}.`
    : `${state.levelLabel}. ${state.remainingGoals} ${state.remainingGoals === 1 ? "caja pendiente" : "cajas pendientes"}.`;

  return `
    <div class="${boardClass}" data-game-swipe-zone="sokoban">
      <div
        class="sokoban-board"
        role="img"
        aria-label="${escapeHtml(summary)}"
        style="--sokoban-cols:${state.cols};--sokoban-rows:${state.rows};"
      >
        ${Array.from({ length: state.rows * state.cols }, (_, index) => renderBoardCell(index, state, boxSet)).join("")}
        ${renderStageOverlay(state, canAct)}
      </div>
    </div>
  `;
}

function renderDirectionButton(direction, canAct, state) {
  return `
    <button
      class="btn btn-secondary sokoban-control-btn"
      data-action="game-action"
      data-game-action="move-direction"
      data-direction="${escapeHtml(direction.id)}"
      aria-label="Mover ${escapeHtml(direction.label.toLowerCase())}"
      ${!canAct || state.status !== "playing" ? "disabled" : ""}
    >
      ${escapeHtml(direction.icon)}
    </button>
  `;
}

function renderControls(state, canAct) {
  const controlsClass = `sokoban-controls${isCompleteStatus(state.status) ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}`;
  const autoAdvancing = state.status === "level-complete";
  const title = isCompleteStatus(state.status) ? "Estado del nivel" : "Controles";
  const note = isCompleteStatus(state.status)
    ? state.status === "campaign-complete"
      ? "La secuencia ha terminado. Puedes repetir el nivel o volver al principio."
      : "Nivel resuelto. El siguiente tablero se abre automaticamente."
    : "Desliza sobre el tablero o usa el pad. Cada accion ejecuta un solo movimiento.";
  const hint = isCompleteStatus(state.status)
    ? "El tablero queda en vista para que puedas releer la solucion."
    : "En movil puedes alternar entre swipe y pad; fuera de movil tambien funciona con teclado.";

  return `
    <section class="${controlsClass}">
      <div class="sokoban-controls-head">
        <div class="sokoban-controls-copy">
          <h4 class="sokoban-controls-title">${escapeHtml(title)}</h4>
          <p class="sokoban-controls-note">${escapeHtml(note)}</p>
        </div>
        <div class="sokoban-utility-row">
          <button
            class="btn btn-secondary sokoban-undo-btn"
            data-action="game-action"
            data-game-action="undo-move"
            ${!canAct || state.status !== "playing" || state.history.length === 0 || autoAdvancing ? "disabled" : ""}
          >
            Deshacer
          </button>
          <button
            class="btn btn-secondary sokoban-reset-btn"
            data-action="game-action"
            data-game-action="restart-level"
            ${!canAct || autoAdvancing ? "disabled" : ""}
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div class="sokoban-control-pad">
        <span class="sokoban-control-gap" aria-hidden="true"></span>
        ${renderDirectionButton(DIRECTIONS.up, canAct, state)}
        <span class="sokoban-control-gap" aria-hidden="true"></span>
        ${renderDirectionButton(DIRECTIONS.left, canAct, state)}
        ${renderDirectionButton(DIRECTIONS.down, canAct, state)}
        ${renderDirectionButton(DIRECTIONS.right, canAct, state)}
      </div>

      <p class="sokoban-controls-hint">${escapeHtml(hint)}</p>
    </section>
  `;
}

function renderSokobanShell(state, canAct) {
  const shellClass = `sokoban-shell${isCompleteStatus(state.status) ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}${state.lastAction === "push" ? " is-push-shake" : ""}`;
  return `
    <section class="${shellClass}" data-sokoban-root data-sokoban-status="${escapeHtml(state.status)}">
      ${renderHud(state)}
      <div class="sokoban-stage">
        ${renderBoardGrid(state, canAct)}
      </div>
      ${renderControls(state, canAct)}
    </section>
  `;
}

export const sokobanGame = {
  id: "sokoban",
  name: "Sokoban",
  subtitle: "1 jugador",
  tagline: "Campana de almacenes",
  minPlayers: 1,
  maxPlayers: 1,
  hidePlayerNames: true,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Objetivo", text: "Empuja todas las cajas hasta las dianas del almacen y avanza por una secuencia de 10 niveles." },
    { title: "Movimiento", text: "Cada gesto o tecla ejecuta un solo movimiento en una de las cuatro direcciones." },
    { title: "Empuje", text: "Solo puedes empujar una caja si la celda que queda detras esta libre." },
    { title: "Bloqueos", text: "Si delante hay pared, borde o una segunda caja, el movimiento se bloquea y el tablero lo marca." },
    { title: "Continuidad", text: "Al completar un nivel aparece un overlay propio con Siguiente nivel o Repetir nivel; en movil el swipe es el control principal." }
  ],
  getDefaultOptions() {
    return {
      level: LEVELS[0].id
    };
  },
  normalizeOptions(options = {}) {
    return {
      level: normalizeLevelId(options.level)
    };
  },
  renderConfigPanel({ options }) {
    const currentLevel = normalizeLevelId(options?.level);
    const currentMeta = getLevelMeta(currentLevel);

    return `
      <div class="block">
        <h3 class="block-title">Inicio de campana</h3>
        <p class="block-sub">La secuencia continua hasta el nivel 10 desde el punto que elijas.</p>
        <label class="field">
          <span class="field-label">Nivel inicial</span>
          <select
            class="select"
            data-action="set-game-option"
            data-option="level"
            aria-label="Seleccionar nivel inicial de Sokoban"
          >
            ${LEVELS.map((level) => `
              <option value="${escapeHtml(level.id)}" ${currentLevel === level.id ? "selected" : ""}>
                ${escapeHtml(`${level.label} · ${level.subtitle}`)}
              </option>
            `).join("")}
          </select>
        </label>
        <p class="info-line">Empiezas en ${escapeHtml(currentMeta.label)}. ${escapeHtml(currentMeta.subtitle)}.</p>
      </div>
    `;
  },
  createInitialState({ options }) {
    return buildLevelState(options?.level);
  },
  getTurnSlot() {
    return 0;
  },
  getResult() {
    return null;
  },
  getTurnMessage({ state }) {
    return isCompleteStatus(state.status) ? "Nivel completado" : `Nivel ${state.levelNumber}/${state.totalLevels}`;
  },
  applyAction({ state, action }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "restart-level") {
      return {
        ok: true,
        state: restartLevelState(state)
      };
    }

    if (action.type === "restart-campaign") {
      return {
        ok: true,
        state: restartCampaignState()
      };
    }

    if (action.type === "next-level") {
      if (state.status !== "level-complete" || state.levelIndex >= LEVELS.length - 1) {
        return { ok: false, reason: "invalid" };
      }

      return {
        ok: true,
        state: nextLevelState(state)
      };
    }

    if (state.status !== "playing") {
      return { ok: false, reason: "finished" };
    }

    if (action.type === "undo") {
      return applyUndo(state);
    }

    if (action.type === "move") {
      return applyMove(state, String(action.direction || ""));
    }

    return { ok: false, reason: "invalid" };
  },
  getKeyboardAction({ event, canAct, state }) {
    if (!event || !state || !canAct) {
      return null;
    }

    const key = String(event.key || "").toLowerCase();

    if (isCompleteStatus(state.status)) {
      if (key === "enter" || key === " ") {
        return state.status === "campaign-complete"
          ? { type: "restart-campaign" }
          : { type: "next-level" };
      }
      if (key === "r") {
        return { type: "restart-level" };
      }
      return null;
    }

    if (event.metaKey || event.ctrlKey) {
      if (key === "z") {
        return { type: "undo" };
      }
      return null;
    }

    if (key === "arrowup" || key === "w") {
      return { type: "move", direction: "up" };
    }
    if (key === "arrowdown" || key === "s") {
      return { type: "move", direction: "down" };
    }
    if (key === "arrowleft" || key === "a") {
      return { type: "move", direction: "left" };
    }
    if (key === "arrowright" || key === "d") {
      return { type: "move", direction: "right" };
    }
    if (key === "z" || key === "u") {
      return { type: "undo" };
    }
    if (key === "r") {
      return { type: "restart-level" };
    }

    return null;
  },
  getTouchAction({ startX, startY, endX, endY, canAct, state }) {
    if (!canAct || !state || state.status !== "playing") {
      return null;
    }

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const majorAxis = Math.max(absX, absY);
    const minorAxis = Math.min(absX, absY);

    if (majorAxis < 42 || minorAxis > majorAxis * 0.58) {
      return null;
    }

    if (absX > absY) {
      return { type: "move", direction: deltaX < 0 ? "left" : "right" };
    }

    return { type: "move", direction: deltaY < 0 ? "up" : "down" };
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="sokoBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fff5e8" />
              <stop offset="100%" stop-color="#efdcc3" />
            </linearGradient>
            <linearGradient id="sokoFloor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fffefb" />
              <stop offset="100%" stop-color="#eadfc8" />
            </linearGradient>
            <linearGradient id="sokoWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#d8b389" />
              <stop offset="100%" stop-color="#b78858" />
            </linearGradient>
            <linearGradient id="sokoBox" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#f1ba73" />
              <stop offset="100%" stop-color="#cc8742" />
            </linearGradient>
          </defs>
          <rect x="18" y="10" width="124" height="74" rx="18" fill="url(#sokoBg)" stroke="#d9c2a1" />
          <g transform="translate(32 15)">
            <rect x="0" y="0" width="96" height="54" rx="14" fill="#e3cfb0" stroke="#c8ad84" />
            <g transform="translate(8 7)">
              <rect x="0" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="18" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="36" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="54" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="72" y="0" width="16" height="16" rx="4" fill="url(#sokoWall)" />

              <rect x="0" y="18" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="18" y="18" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="36" y="18" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="54" y="18" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="72" y="18" width="16" height="16" rx="4" fill="url(#sokoWall)" />

              <rect x="0" y="36" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="18" y="36" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="36" y="36" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="54" y="36" width="16" height="16" rx="4" fill="url(#sokoFloor)" stroke="#d3c1a2" />
              <rect x="72" y="36" width="16" height="16" rx="4" fill="url(#sokoWall)" />

              <rect x="0" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="18" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="36" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="54" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />
              <rect x="72" y="54" width="16" height="16" rx="4" fill="url(#sokoWall)" />

              <circle cx="26" cy="26" r="4.2" fill="none" stroke="#5ba66a" stroke-width="2.6" />
              <rect x="35" y="19" width="18" height="18" rx="4.8" fill="url(#sokoBox)" stroke="#a86d35" />
              <path d="M35 28H53M44 19V37" stroke="rgba(255,255,255,0.34)" stroke-width="1.4" />
              <circle cx="61" cy="43" r="7" fill="#67a0ff" stroke="#3562c9" stroke-width="2" />
              <circle cx="61" cy="40.2" r="2.4" fill="#eff6ff" />
            </g>
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state, canAct }) {
    ensureSokobanStyles();
    return renderSokobanShell(state, canAct);
  },
  patchBoardElement(boardWrap, { state, canAct }) {
    const root = boardWrap.querySelector("[data-sokoban-root]");
    if (!root) {
      return false;
    }

    ensureSokobanStyles();
    boardWrap.innerHTML = renderSokobanShell(state, canAct);
    return true;
  }
};
