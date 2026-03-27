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

.sokoban-hud,
.sokoban-controls,
.sokoban-board-frame {
  border: 1px solid rgba(209, 190, 158, 0.72);
  border-radius: 26px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.82), transparent 58%),
    linear-gradient(180deg, rgba(255, 250, 241, 0.98) 0%, rgba(244, 236, 221, 0.98) 100%);
  box-shadow:
    0 18px 30px rgba(162, 145, 110, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.sokoban-hud {
  grid-area: hud;
  padding: 14px 16px;
  display: grid;
  gap: 10px;
}

.sokoban-hud.is-blocked,
.sokoban-controls.is-blocked {
  border-color: rgba(206, 113, 84, 0.62);
  box-shadow:
    0 18px 28px rgba(162, 145, 110, 0.1),
    0 0 0 4px rgba(219, 119, 84, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.sokoban-hud.is-complete,
.sokoban-controls.is-complete,
.sokoban-board-frame.is-complete {
  border-color: rgba(111, 165, 109, 0.62);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.88), transparent 58%),
    linear-gradient(180deg, rgba(247, 252, 244, 0.98) 0%, rgba(236, 245, 229, 0.98) 100%);
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
  background: rgba(214, 131, 48, 0.14);
  color: #b76b27;
  font-size: 0.66rem;
  font-weight: 780;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sokoban-mode-pill.is-soft {
  background: rgba(93, 112, 132, 0.12);
  color: #5d6f84;
}

.sokoban-level-subtitle {
  margin: 0;
  color: #6f5c47;
  font-size: 0.84rem;
  font-weight: 720;
}

.sokoban-note {
  margin: 0;
  color: #61727f;
  font-size: 0.88rem;
  line-height: 1.38;
}

.sokoban-note.is-blocked {
  color: #a4573f;
  font-weight: 700;
}

.sokoban-note.is-complete {
  color: #496a50;
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
  background: rgba(120, 128, 136, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
}

.sokoban-progress-dot.is-past {
  background: rgba(214, 131, 48, 0.28);
}

.sokoban-progress-dot.is-current {
  background: linear-gradient(180deg, #efb267 0%, #d8863e 100%);
}

.sokoban-progress-dot.is-cleared {
  background: linear-gradient(180deg, #b7d78f 0%, #73ac5e 100%);
}

.sokoban-live-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.sokoban-stat {
  display: grid;
  gap: 4px;
  border-radius: 16px;
  padding: 9px 10px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(214, 199, 173, 0.72);
}

.sokoban-stat.is-clear {
  background: rgba(240, 249, 235, 0.92);
  border-color: rgba(135, 177, 122, 0.52);
}

.sokoban-stat-label {
  color: #71818e;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sokoban-stat-value {
  color: #233042;
  font-size: 0.98rem;
  line-height: 1.1;
}

.sokoban-stage {
  grid-area: stage;
  min-width: 0;
  position: relative;
}

.sokoban-board-frame {
  position: relative;
  display: grid;
  place-items: center;
  padding: clamp(8px, 1.4vw, 16px);
  overflow: hidden;
  border-radius: clamp(22px, 3vw, 30px);
  border: 1px solid rgba(205, 192, 169, 0.92);
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0) 56%),
    linear-gradient(180deg, rgba(250, 247, 240, 0.98) 0%, rgba(237, 228, 211, 0.98) 100%);
  box-shadow:
    0 22px 38px rgba(35, 56, 48, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  transition:
    box-shadow var(--ui-speed) var(--ui-ease),
    border-color var(--ui-speed) var(--ui-ease),
    transform var(--ui-speed) var(--ui-ease);
}

.sokoban-board-frame[data-game-swipe-zone] {
  touch-action: manipulation;
}

.sokoban-board-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0) 62%),
    radial-gradient(circle at 50% 108%, rgba(205, 187, 154, 0.18), rgba(205, 187, 154, 0) 56%);
}

.sokoban-board-frame.is-blocked {
  border-color: rgba(204, 111, 82, 0.84);
  box-shadow:
    0 22px 34px rgba(162, 145, 110, 0.14),
    0 0 0 5px rgba(219, 119, 84, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
  animation: sokobanBlocked 220ms var(--ui-ease);
}

@keyframes sokobanBlocked {
  0% { transform: translateX(0); }
  35% { transform: translateX(-5px); }
  70% { transform: translateX(5px); }
  100% { transform: translateX(0); }
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
  border-radius: 13px;
  overflow: hidden;
}

.sokoban-tile {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.sokoban-cell.is-floor .sokoban-tile {
  border: 1px solid #d8ccb8;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 30%),
    linear-gradient(180deg, #fffdfa 0%, #efe6d8 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    inset 0 -2px 0 rgba(203, 191, 169, 0.34);
}

.sokoban-cell.is-wall .sokoban-tile {
  border: 1px solid #b98758;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 24%),
    linear-gradient(180deg, #ddb188 0%, #c18a58 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    inset 0 -2px 0 rgba(138, 95, 58, 0.32);
}

.sokoban-goal {
  position: absolute;
  inset: 21%;
  border-radius: 50%;
  border: 2px solid rgba(97, 164, 109, 0.92);
  background:
    radial-gradient(circle, rgba(166, 225, 171, 0.34) 0 42%, rgba(166, 225, 171, 0) 43% 100%);
  box-shadow:
    inset 0 0 0 3px rgba(255, 255, 255, 0.44),
    0 0 0 1px rgba(86, 148, 93, 0.08);
}

.sokoban-goal::before {
  content: "";
  position: absolute;
  inset: 37%;
  border-radius: 50%;
  background: rgba(96, 168, 110, 0.18);
}

.sokoban-cell.has-box-on-target .sokoban-goal {
  border-style: solid;
  border-color: rgba(108, 176, 99, 0.92);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.42),
    0 0 0 3px rgba(127, 184, 109, 0.12);
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
  width: 60%;
  height: 60%;
  display: grid;
  place-items: center;
  align-self: center;
  justify-self: center;
}

.sokoban-box {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(160, 103, 48, 0.94);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 22%),
    linear-gradient(180deg, #efbd74 0%, #d48a45 100%);
  box-shadow:
    0 8px 12px rgba(92, 62, 30, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  position: relative;
}

.sokoban-box::before {
  content: "";
  position: absolute;
  inset: 17%;
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(183, 113, 48, 0.12), rgba(183, 113, 48, 0) 36%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(125, 77, 31, 0.06));
}

.sokoban-box::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg, transparent calc(50% - 0.8px), rgba(255, 245, 228, 0.42) calc(50% - 0.8px) calc(50% + 0.8px), transparent calc(50% + 0.8px)),
    linear-gradient(0deg, transparent calc(50% - 0.8px), rgba(255, 245, 228, 0.42) calc(50% - 0.8px) calc(50% + 0.8px), transparent calc(50% + 0.8px));
}

.sokoban-box-rivet {
  position: absolute;
  top: 23%;
  left: 24%;
  width: clamp(4px, 0.66vw, 6px);
  height: clamp(4px, 0.66vw, 6px);
  border-radius: 50%;
  background: rgba(130, 82, 38, 0.46);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.sokoban-box-rivet.is-right {
  left: auto;
  right: 24%;
}

.sokoban-piece.is-targeted .sokoban-box {
  border-color: rgba(96, 145, 78, 0.96);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 18%),
    linear-gradient(180deg, #dce28f 0%, #8fb45d 100%);
  box-shadow:
    0 8px 14px rgba(90, 129, 70, 0.14),
    0 0 0 3px rgba(130, 184, 103, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}

.sokoban-player-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(46, 90, 190, 0.96);
  background:
    radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.86) 0 14%, rgba(255, 255, 255, 0) 15%),
    linear-gradient(180deg, #8fb8ff 0%, #5985e9 100%);
  box-shadow:
    0 8px 12px rgba(49, 92, 192, 0.17),
    inset 0 1px 0 rgba(255, 255, 255, 0.52);
}

.sokoban-piece.is-targeted .sokoban-player-core {
  box-shadow:
    0 8px 12px rgba(49, 92, 192, 0.17),
    0 0 0 4px rgba(103, 170, 115, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.56);
}

.sokoban-stage-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  padding: 14px;
  background: linear-gradient(180deg, rgba(28, 36, 44, 0.1) 0%, rgba(28, 36, 44, 0.44) 100%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.sokoban-stage-card {
  width: min(100%, 320px);
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(203, 190, 161, 0.82);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.88), transparent 54%),
    linear-gradient(180deg, rgba(255, 251, 244, 0.98) 0%, rgba(244, 237, 224, 0.98) 100%);
  box-shadow:
    0 22px 34px rgba(31, 28, 24, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.sokoban-stage-kicker {
  margin: 0;
  color: #7a6a51;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sokoban-stage-title {
  margin: 0;
  color: #233042;
  font-size: 1.18rem;
  line-height: 1.08;
}

.sokoban-stage-text {
  margin: 0;
  color: #61727f;
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
  border: 1px solid rgba(214, 199, 173, 0.72);
  background: rgba(255, 255, 255, 0.74);
  display: grid;
  align-content: center;
  gap: 2px;
}

.sokoban-stage-chip-label {
  color: #71818e;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sokoban-stage-chip-value {
  color: #233042;
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
  color: #233042;
  font-size: 0.94rem;
}

.sokoban-controls-note,
.sokoban-controls-hint {
  margin: 0;
  color: #64737f;
  font-size: 0.79rem;
  line-height: 1.4;
}

.sokoban-controls.is-complete .sokoban-controls-note,
.sokoban-controls.is-complete .sokoban-controls-hint {
  color: #58745e;
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
    border-radius: 11px;
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
  const shellClass = `sokoban-shell${isCompleteStatus(state.status) ? " is-complete" : ""}${state.lastAction === "blocked" ? " is-blocked" : ""}`;
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
