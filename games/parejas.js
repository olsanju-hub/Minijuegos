const MEMORY_STYLE_ID = "minijuegos-memory-game";

const DIFFICULTIES = Object.freeze({
  8: { id: 8, label: "Normal", pairCount: 8, cols: 4 },
  12: { id: 12, label: "Desafio", pairCount: 12, cols: 6 }
});

const SYMBOLS = ["🐶", "🐱", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🐮", "🐷"];
const RESOLVE_DELAY_MS = 820;

const MEMORY_STYLES = String.raw`
.app-shell:not(.app-shell-home) .screen.game-screen-memory {
  width: min(1120px, 100%);
}

.game-screen-memory .board-wrap {
  /* Removed display: block to prevent scroll and enforce centering */
}

.memory-shell {
  width: min(100%, 940px);
  max-height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.memory-hud {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 24px;
  border: 1px solid rgba(203, 214, 223, 0.84);
  background:
    radial-gradient(circle at 12% 0%, rgba(158, 196, 255, 0.2), rgba(158, 196, 255, 0) 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(243, 247, 251, 0.98) 100%);
  box-shadow:
    0 18px 34px rgba(61, 74, 120, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.memory-hud-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.memory-hud-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.memory-mode-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.memory-mode-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(87, 137, 222, 0.12);
  color: #4b7abd;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.memory-mode-pill.is-soft {
  background: rgba(96, 177, 150, 0.12);
  color: #447d68;
}

.memory-title {
  margin: 0;
  color: #243249;
  font-size: 1rem;
}

.memory-note {
  margin: 0;
  color: #627181;
  font-size: 0.88rem;
  line-height: 1.42;
}

.memory-note.is-match {
  color: #46785f;
  font-weight: 700;
}

.memory-note.is-miss {
  color: #a75e52;
  font-weight: 700;
}

.memory-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.memory-stat {
  display: grid;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(209, 216, 223, 0.88);
  background: rgba(255, 255, 255, 0.74);
}

.memory-stat-label {
  color: #748294;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.memory-stat-value {
  color: #243249;
  font-size: 1rem;
  line-height: 1.08;
}

.memory-board-frame {
  position: relative;
  overflow: hidden;
  padding: 14px;
  border-radius: 30px;
  border: 1px solid rgba(205, 214, 221, 0.88);
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0) 52%),
    linear-gradient(180deg, rgba(246, 249, 251, 0.98) 0%, rgba(234, 240, 237, 0.98) 100%);
  box-shadow:
    0 24px 42px rgba(65, 71, 118, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.memory-board-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 14%, rgba(162, 184, 255, 0.13), rgba(162, 184, 255, 0) 24%),
    radial-gradient(circle at 82% 82%, rgba(177, 214, 196, 0.12), rgba(177, 214, 196, 0) 24%);
}

.memory-board {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(var(--memory-cols), minmax(0, 1fr));
  gap: 10px;
  width: min(100%, calc((100dvh - 280px) * (var(--memory-cols) / (var(--memory-rows) * 1.08))));
}

.memory-card {
  position: relative;
  aspect-ratio: 1 / 1.08;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  perspective: 1200px;
  isolation: isolate;
}

.memory-card[disabled] {
  cursor: default;
}

.memory-card-inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 240ms cubic-bezier(0.22, 0.74, 0.34, 1);
}

.memory-card:not([disabled]):hover .memory-card-inner {
  transform: translateY(-2px) scale(1.01);
}

.memory-card.is-open .memory-card-inner {
  transform: rotateY(180deg);
}

.memory-card-face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  border-radius: 22px;
  backface-visibility: hidden;
  overflow: hidden;
}

.memory-card-front {
  border: 1px solid rgba(154, 187, 156, 0.94);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(255, 255, 255, 0) 28%),
    linear-gradient(180deg, #d9ead2 0%, #88ab8a 100%);
  box-shadow:
    0 12px 18px rgba(71, 105, 82, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.memory-card-front::before,
.memory-card-front::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: rgba(250, 246, 236, 0.26);
}

.memory-card-front::before {
  width: 58%;
  height: 12%;
  top: 18%;
}

.memory-card-front::after {
  width: 12%;
  height: 58%;
}

.memory-card-back {
  transform: rotateY(180deg);
  border: 1px solid rgba(214, 205, 191, 0.92);
  background:
    radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0) 30%),
    linear-gradient(180deg, #fffdf8 0%, #f1ebdf 100%);
  box-shadow:
    0 12px 18px rgba(63, 58, 75, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.memory-card-back::before {
  content: "";
  position: absolute;
  inset: 16%;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0));
}

.memory-card.is-match .memory-card-back {
  border-color: rgba(127, 184, 145, 0.92);
  background:
    radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0) 30%),
    linear-gradient(180deg, #f7fff5 0%, #e4f2dd 100%);
  box-shadow:
    0 12px 18px rgba(78, 121, 88, 0.14),
    0 0 0 4px rgba(127, 184, 145, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.74);
}

.memory-symbol {
  position: relative;
  z-index: 1;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1;
  transform: translateY(-2px);
}

.memory-card-badge {
  position: relative;
  z-index: 1;
  color: rgba(255, 250, 240, 0.9);
  font-size: 1.22rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.memory-card:focus-visible {
  outline: none;
}

.memory-card:focus-visible .memory-card-front,
.memory-card:focus-visible .memory-card-back {
  box-shadow:
    0 0 0 3px rgba(117, 164, 122, 0.26),
    0 12px 18px rgba(71, 105, 82, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

@media (max-width: 900px) {
  .memory-shell {
    width: min(100%, 760px);
  }

  .memory-board {
    gap: 8px;
  }
}

@media (max-width: 760px) {
  .app-shell:not(.app-shell-home) .screen.game-screen-memory {
    width: min(100%, calc(100vw - 10px));
  }

  .memory-shell {
    gap: 10px;
  }

  .memory-hud {
    padding: 12px 14px;
    gap: 8px;
  }

  .memory-title {
    font-size: 0.92rem;
  }

  .memory-note {
    font-size: 0.8rem;
  }

  .memory-stats {
    gap: 6px;
  }

  .memory-stat {
    padding: 8px 9px;
    border-radius: 13px;
  }

  .memory-stat-label {
    font-size: 0.58rem;
  }

  .memory-stat-value {
    font-size: 0.84rem;
  }

  .memory-board-frame {
    padding: 8px;
    border-radius: 22px;
  }

  .memory-board {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 7px;
  }

  .memory-card-face {
    border-radius: 17px;
  }

  .memory-symbol {
    font-size: clamp(1.5rem, 8vw, 2.1rem);
  }

  .memory-card-badge {
    font-size: 0.94rem;
  }
}
`;

function ensureMemoryStyles() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(MEMORY_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = MEMORY_STYLE_ID;
  style.textContent = MEMORY_STYLES;
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

function normalizePairs(value) {
  return Number(value) === 12 ? 12 : 8;
}

function difficultyMeta(value) {
  return DIFFICULTIES[normalizePairs(value)];
}

function shuffle(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function buildDeck(pairCount) {
  const symbols = SYMBOLS.slice(0, pairCount);
  const deck = symbols.flatMap((symbol, pairId) => ([
    { id: `pair-${pairId}-a`, pairId, symbol },
    { id: `pair-${pairId}-b`, pairId, symbol }
  ]));
  return shuffle(deck);
}

function matchedCount(state) {
  return state.matchedPairIds.length;
}

function totalPairs(state) {
  return normalizePairs(state.pairCount);
}

function buildNote(state) {
  if (state.status === "won") {
    return "Todas las parejas encontradas.";
  }

  if (state.status === "resolving") {
    return "Esas dos cartas no coinciden.";
  }

  if (state.lastAction === "match") {
    return "Pareja encontrada. Sigue asi.";
  }

  if (state.openIndexes.length === 1) {
    return "Busca la segunda carta.";
  }

  return "Destapa dos cartas y recuerda sus posiciones.";
}

function createState(pairCount) {
  return {
    pairCount,
    cards: buildDeck(pairCount),
    openIndexes: [],
    matchedPairIds: [],
    moveCount: 0,
    status: "playing",
    lastAction: "ready",
    resolveAtMs: null
  };
}

function buildStat(label, value) {
  return `
    <div class="memory-stat">
      <span class="memory-stat-label">${escapeHtml(label)}</span>
      <strong class="memory-stat-value">${escapeHtml(String(value))}</strong>
    </div>
  `;
}

function isMatched(state, index) {
  const card = state.cards[index];
  return state.matchedPairIds.includes(card.pairId);
}

function isOpen(state, index) {
  return state.openIndexes.includes(index) || isMatched(state, index);
}

function renderHud(state) {
  const meta = difficultyMeta(state.pairCount);
  const noteClass = `memory-note${state.lastAction === "match" ? " is-match" : ""}${state.status === "resolving" ? " is-miss" : ""}`;
  return `
    <section class="memory-hud">
      <div class="memory-hud-top">
        <div class="memory-hud-copy">
          <div class="memory-mode-row">
            <span class="memory-mode-pill">Parejas</span>
            <span class="memory-mode-pill is-soft">${escapeHtml(meta.label)}</span>
          </div>
          <h3 class="memory-title">Memoria visual en un solo tablero</h3>
          <p class="${noteClass}">${escapeHtml(buildNote(state))}</p>
        </div>
      </div>
      <div class="memory-stats">
        ${buildStat("Movimientos", state.moveCount)}
        ${buildStat("Parejas", `${matchedCount(state)}/${totalPairs(state)}`)}
        ${buildStat("Cartas", state.cards.length)}
      </div>
    </section>
  `;
}

function renderCard(state, card, index) {
  const open = isOpen(state, index);
  const matched = isMatched(state, index);
  const disabled = state.status === "won" || state.status === "resolving" || open;
  const className = `memory-card${open ? " is-open" : ""}${matched ? " is-match" : ""}`;

  return `
    <button
      class="${className}"
      type="button"
      data-action="game-action"
      data-game-action="flip-card"
      data-card="${index}"
      aria-label="${open ? `Carta ${card.symbol}` : "Carta oculta"}"
      ${disabled ? "disabled" : ""}
    >
      <div class="memory-card-inner">
        <div class="memory-card-face memory-card-front">
          <span class="memory-card-badge">MG</span>
        </div>
        <div class="memory-card-face memory-card-back">
          <span class="memory-symbol">${escapeHtml(card.symbol)}</span>
        </div>
      </div>
    </button>
  `;
}

function renderBoardGrid(state) {
  const cols = difficultyMeta(state.pairCount).cols;
  return `
    <section class="memory-board-frame">
      <div
        class="memory-board"
        style="--memory-cols:${cols};--memory-rows:${state.cards.length / cols};"
        role="img"
        aria-label="${escapeHtml(`Tablero de ${totalPairs(state)} parejas. ${matchedCount(state)} resueltas.`)}"
      >
        ${state.cards.map((card, index) => renderCard(state, card, index)).join("")}
      </div>
    </section>
  `;
}

function flipCard(state, index, nowMs) {
  if (state.status === "resolving" || state.status === "won") {
    return { ok: true, state };
  }

  if (!Number.isInteger(index) || index < 0 || index >= state.cards.length) {
    return { ok: false, reason: "invalid" };
  }

  if (isMatched(state, index) || state.openIndexes.includes(index)) {
    return { ok: true, state };
  }

  const nextOpen = [...state.openIndexes, index];
  if (nextOpen.length === 1) {
    return {
      ok: true,
      state: {
        ...state,
        openIndexes: nextOpen,
        lastAction: "peek"
      }
    };
  }

  const [firstIndex, secondIndex] = nextOpen;
  const firstCard = state.cards[firstIndex];
  const secondCard = state.cards[secondIndex];
  const nextMoveCount = state.moveCount + 1;

  if (firstCard.pairId === secondCard.pairId) {
    const nextMatched = [...state.matchedPairIds, firstCard.pairId];
    const complete = nextMatched.length === totalPairs(state);
    return {
      ok: true,
      state: {
        ...state,
        openIndexes: [],
        matchedPairIds: nextMatched,
        moveCount: nextMoveCount,
        status: complete ? "won" : "playing",
        lastAction: "match",
        resolveAtMs: null
      }
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      openIndexes: nextOpen,
      moveCount: nextMoveCount,
      status: "resolving",
      lastAction: "miss",
      resolveAtMs: Number(nowMs) + RESOLVE_DELAY_MS
    }
  };
}

function resolveMismatch(state, nowMs) {
  if (state.status !== "resolving") {
    return { ok: true, state };
  }

  if (!Number.isFinite(state.resolveAtMs) || Number(nowMs) < state.resolveAtMs) {
    return { ok: true, state };
  }

  return {
    ok: true,
    state: {
      ...state,
      openIndexes: [],
      status: "playing",
      lastAction: "reset-open",
      resolveAtMs: null
    }
  };
}

export const parejasGame = {
  id: "memory",
  name: "Parejas",
  subtitle: "1 jugador",
  tagline: "Memoria visual",
  minPlayers: 1,
  maxPlayers: 1,
  hidePlayerNames: true,
  hideGlobalTurnMessage: true,
  hideDefaultPlayerChips: true,
  rules: [
    { title: "Objetivo", text: "Descubre todas las parejas del tablero con el menor numero de movimientos posible." },
    { title: "Turno", text: "En cada intento destapas dos cartas. Si coinciden, se quedan visibles." },
    { title: "Si fallas", text: "Cuando dos cartas no coinciden se vuelven a cerrar tras una pausa breve." },
    { title: "Dificultad", text: "Puedes jugar con 8 parejas en tablero compacto o 12 parejas en formato amplio." }
  ],
  getDefaultOptions() {
    return {
      pairs: 8
    };
  },
  normalizeOptions(options = {}) {
    return {
      pairs: normalizePairs(options.pairs)
    };
  },
  renderConfigPanel({ options }) {
    const current = normalizePairs(options?.pairs);
    return `
      <div class="block">
        <h3 class="block-title">Dificultad</h3>
        <div class="player-count-row">
          ${Object.values(DIFFICULTIES).map((meta) => `
            <button
              class="pill ${current === meta.id ? "is-active" : ""}"
              data-action="set-game-option"
              data-option="pairs"
              data-value="${meta.id}"
              data-value-type="number"
            >
              ${escapeHtml(`${meta.pairCount} parejas · ${meta.label}`)}
            </button>
          `).join("")}
        </div>
      </div>
    `;
  },
  createInitialState({ options }) {
    return createState(normalizePairs(options?.pairs));
  },
  getTurnSlot() {
    return 0;
  },
  getResult(state) {
    return state.status === "won" ? { type: "win" } : null;
  },
  getTurnMessage({ state }) {
    return buildNote(state);
  },
  applyAction({ state, action }) {
    if (!action || typeof action.type !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (action.type === "resolve-mismatch") {
      return resolveMismatch(state, action.nowMs);
    }

    if (action.type === "flip-card") {
      return flipCard(state, Number(action.card), action.nowMs);
    }

    return { ok: false, reason: "invalid" };
  },
  renderCardIllustration() {
    return `
      <div class="game-illustration" aria-hidden="true">
        <svg class="game-illustration-svg" viewBox="0 0 160 94" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="memoryCardFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#9fc2ff" />
              <stop offset="100%" stop-color="#6f9be4" />
            </linearGradient>
            <linearGradient id="memoryCardBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fffdf9" />
              <stop offset="100%" stop-color="#efe8dc" />
            </linearGradient>
          </defs>
          <rect x="18" y="12" width="124" height="70" rx="22" fill="#eef4fb" stroke="#d0dbe6" />
          <g transform="translate(34 20)">
            <g transform="rotate(-9 22 27)">
              <rect x="0" y="0" width="44" height="54" rx="13" fill="url(#memoryCardFront)" stroke="#7499d9" />
              <path d="M12 16H32M22 8V46" stroke="rgba(255,255,255,0.34)" stroke-width="5" stroke-linecap="round" />
            </g>
            <g transform="translate(24 2)">
              <rect x="0" y="0" width="44" height="54" rx="13" fill="url(#memoryCardBack)" stroke="#d9cfc2" />
              <text x="22" y="34" text-anchor="middle" font-size="20">🦊</text>
            </g>
            <g transform="translate(50 6) rotate(8 22 27)">
              <rect x="0" y="0" width="44" height="54" rx="13" fill="url(#memoryCardBack)" stroke="#d9cfc2" />
              <text x="22" y="34" text-anchor="middle" font-size="20">🐻</text>
            </g>
          </g>
        </svg>
      </div>
    `;
  },
  renderBoard({ state }) {
    ensureMemoryStyles();
    return `
      <section class="memory-shell">
        ${renderHud(state)}
        ${renderBoardGrid(state)}
      </section>
    `;
  },
  formatResult({ state }) {
    return {
      title: "Parejas completadas",
      subtitle: `${state.moveCount} movimientos para resolver ${totalPairs(state)} parejas.`,
      iconText: "◎",
      iconClass: "win"
    };
  }
};
