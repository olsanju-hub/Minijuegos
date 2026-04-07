const STYLE_ID = "minijuegos-appearance-refresh";
const OBSERVER_KEY = "__minijuegosAppearanceObserver";
const HOME_STATE = {
  search: "",
  filter: "all"
};

const FEATURED_IDS = ["billar", "futbol-turnos", "parchis"];
const CONTINUE_ITEMS = [
  { id: "futbol-turnos", meta: "Partido abierto · turno medio", progress: 68, accent: "mustard" },
  { id: "buscaminas", meta: "Tablero a medias · modo abrir", progress: 43, accent: "slate" }
];
const DAILY_ID = "trafico";
const CATEGORY_ITEMS = [
  { key: "all", name: "Todo", icon: "◌" },
  { key: "rapidos", name: "Rápidos", icon: "◷" },
  { key: "mesa", name: "Mesa", icon: "▦" },
  { key: "punteria", name: "Puntería", icon: "◎" },
  { key: "familia", name: "Familia", icon: "✦" }
];

const CSS = String.raw`
:root {
  --mx-bg-0: #f6f2ea;
  --mx-bg-1: #eceaf6;
  --mx-bg-2: #f8f6f1;
  --mx-surface: rgba(255,255,255,0.72);
  --mx-surface-strong: rgba(255,255,255,0.88);
  --mx-surface-soft: rgba(255,255,255,0.58);
  --mx-border: rgba(17,17,17,0.08);
  --mx-border-strong: rgba(17,17,17,0.14);
  --mx-text: #151515;
  --mx-text-soft: rgba(17,17,17,0.58);
  --mx-text-faint: rgba(17,17,17,0.38);
  --mx-mustard: #c8a24a;
  --mx-mustard-soft: rgba(200,162,74,0.16);
  --mx-slate: #7b3f3f;
  --mx-slate-soft: rgba(123,63,63,0.14);
  --mx-card-shadow: 0 16px 38px rgba(0,0,0,0.06);
  --mx-card-shadow-strong: 0 22px 52px rgba(0,0,0,0.08);
}

body,
body:not(.is-home-screen) {
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.66), rgba(255,255,255,0) 24%),
    radial-gradient(circle at top right, rgba(200,162,74,0.12), rgba(200,162,74,0) 18%),
    linear-gradient(180deg, var(--mx-bg-0) 0%, var(--mx-bg-1) 54%, var(--mx-bg-2) 100%);
  color: var(--mx-text);
}

.bg-layer,
body:not(.is-home-screen) .bg-layer {
  background:
    radial-gradient(circle at 8% 10%, rgba(255,255,255,0.7), rgba(255,255,255,0) 24%),
    radial-gradient(circle at 84% 12%, rgba(123,63,63,0.08), rgba(123,63,63,0) 18%),
    radial-gradient(circle at 76% 78%, rgba(200,162,74,0.08), rgba(200,162,74,0) 22%);
}

.app-shell,
.app-shell.app-shell-home,
.app-shell:not(.app-shell-home) {
  width: min(1320px, calc(100% - 24px));
  margin: 12px auto 22px;
}

.home-screen.home-library-screen.is-catalog.mx-home-screen {
  display: grid;
  gap: 18px;
}

.mx-home-search {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 0 16px;
  border-radius: 22px;
  border: 1px solid var(--mx-border);
  background: var(--mx-surface-strong);
  box-shadow: var(--mx-card-shadow);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.mx-home-search-icon {
  color: var(--mx-text-faint);
  font-size: 1rem;
  line-height: 1;
}

.mx-home-search-input {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--mx-text);
  font: inherit;
  font-size: 0.95rem;
  outline: none;
}

.mx-home-search-input::placeholder {
  color: var(--mx-text-faint);
}

.home-library-header {
  position: sticky;
  top: 0;
  z-index: 8;
  padding: 14px 18px;
  border-radius: 24px;
  border: 1px solid var(--mx-border);
  background: rgba(246,242,234,0.9);
  box-shadow: var(--mx-card-shadow);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.home-catalog-title {
  color: var(--mx-text);
}

.home-catalog-subtitle,
.home-catalog-signature,
.home-note-pill {
  color: var(--mx-text-soft);
}

.mx-home-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(260px, 0.95fr);
  gap: 18px;
  padding: 24px;
  border-radius: 34px;
  border: 1px solid rgba(17,17,17,0.06);
  background: #111111;
  color: #f6f2ea;
  box-shadow: var(--mx-card-shadow-strong);
}

.mx-home-hero::before,
.mx-home-hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.mx-home-hero::before {
  width: 240px;
  height: 240px;
  top: -72px;
  right: -60px;
  background: radial-gradient(circle, rgba(200,162,74,0.24), rgba(200,162,74,0));
}

.mx-home-hero::after {
  width: 180px;
  height: 180px;
  left: -48px;
  bottom: -70px;
  background: radial-gradient(circle, rgba(123,63,63,0.22), rgba(123,63,63,0));
}

.mx-home-hero-copy,
.mx-home-hero-media {
  position: relative;
  z-index: 1;
}

.mx-home-hero-copy {
  display: grid;
  align-content: center;
  gap: 12px;
}

.mx-home-kicker {
  margin: 0;
  color: rgba(246,242,234,0.56);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.mx-home-hero-title {
  margin: 0;
  font-size: clamp(2rem, 3.2vw, 3rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  color: #f6f2ea;
}

.mx-home-hero-text {
  margin: 0;
  max-width: 34ch;
  color: rgba(246,242,234,0.72);
  font-size: 0.95rem;
  line-height: 1.6;
}

.mx-home-hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.mx-btn,
.mx-chip,
.mx-mini-btn,
.mx-nav-btn,
.mx-category-btn,
.mx-feature-open,
.mx-play-fab,
.mx-spotlight-open {
  border: 1px solid transparent;
  font: inherit;
  cursor: pointer;
  transition: transform 180ms ease, opacity 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.mx-btn:hover,
.mx-chip:hover,
.mx-mini-btn:hover,
.mx-nav-btn:hover,
.mx-category-btn:hover,
.mx-feature-open:hover,
.mx-play-fab:hover,
.mx-spotlight-open:hover {
  transform: translateY(-1px);
}

.mx-btn {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.mx-btn-primary {
  background: #f6f2ea;
  color: #111111;
}

.mx-btn-secondary {
  border-color: rgba(246,242,234,0.16);
  background: rgba(255,255,255,0.08);
  color: #f6f2ea;
}

.mx-home-hero-media {
  display: grid;
  align-items: stretch;
}

.mx-home-hero-media-frame {
  min-height: 288px;
  border-radius: 30px;
  overflow: hidden;
  background: rgba(255,255,255,0.08);
}

.mx-home-hero-media-frame img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.mx-home-block {
  display: grid;
  gap: 12px;
}

.mx-home-block-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
}

.mx-home-block-title {
  margin: 0;
  color: var(--mx-text);
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.mx-home-link {
  color: var(--mx-text-faint);
  font-size: 0.84rem;
  font-weight: 600;
}

.mx-categories {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.mx-category-btn {
  padding: 14px 10px;
  border-radius: 22px;
  border: 1px solid var(--mx-border);
  background: rgba(255,255,255,0.62);
  box-shadow: var(--mx-card-shadow);
  display: grid;
  gap: 8px;
  justify-items: center;
  text-align: center;
}

.mx-category-btn.is-active {
  border-color: rgba(123,63,63,0.2);
  background: rgba(255,255,255,0.88);
}

.mx-category-icon {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--mx-mustard-soft);
  color: var(--mx-text);
  font-size: 1rem;
}

.mx-category-label {
  color: rgba(17,17,17,0.78);
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.2;
}

.mx-featured-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.mx-featured-row::-webkit-scrollbar { display: none; }

.mx-feature-card {
  min-width: 270px;
  padding: 16px;
  border-radius: 28px;
  box-shadow: var(--mx-card-shadow);
  display: grid;
  gap: 14px;
}

.mx-feature-card[data-tone="mustard"] {
  background: #c8a24a;
  color: #111111;
}

.mx-feature-card[data-tone="slate"] {
  background: #7b3f3f;
  color: #f6f2ea;
}

.mx-feature-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.mx-feature-tag {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.08);
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 700;
}

.mx-feature-star {
  opacity: 0.82;
  font-size: 0.92rem;
}

.mx-feature-media {
  height: 112px;
  border-radius: 20px;
  background: rgba(0,0,0,0.08);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.mx-feature-media .home-game-card-glyph,
.mx-feature-media .mx-grid-thumb-glyph,
.mx-spotlight-media .mx-grid-thumb-glyph {
  width: 74px;
  height: 74px;
  border-radius: 22px;
  background: rgba(255,255,255,0.82);
  border: 0;
}

.mx-feature-title,
.mx-continue-title,
.mx-grid-title,
.mx-spotlight-title {
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.mx-feature-title {
  font-size: 1.14rem;
}

.mx-feature-subtitle,
.mx-continue-meta,
.mx-grid-caption,
.mx-spotlight-text {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.45;
}

.mx-feature-subtitle,
.mx-spotlight-text { opacity: 0.8; }

.mx-feature-open {
  width: fit-content;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 0;
  background: rgba(0,0,0,0.1);
  color: inherit;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
}

.mx-continue-list {
  display: grid;
  gap: 10px;
}

.mx-continue-card,
.mx-grid-card,
.mx-spotlight-card {
  border: 1px solid var(--mx-border);
  border-radius: 26px;
  background: rgba(255,255,255,0.64);
  box-shadow: var(--mx-card-shadow);
}

.mx-continue-card {
  padding: 14px;
}

.mx-continue-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.mx-continue-icon {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #f6f2ea;
  font-size: 1rem;
}

.mx-continue-icon[data-tone="mustard"] { background: #c8a24a; color: #111111; }
.mx-continue-icon[data-tone="slate"] { background: #7b3f3f; }

.mx-continue-body {
  min-width: 0;
  flex: 1 1 auto;
  display: grid;
  gap: 10px;
}

.mx-continue-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mx-mini-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--mx-border);
  background: rgba(255,255,255,0.72);
  color: var(--mx-text-soft);
}

.mx-progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--mx-text-faint);
  font-size: 0.68rem;
}

.mx-progress-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.08);
  overflow: hidden;
}

.mx-progress-fill {
  height: 100%;
  border-radius: inherit;
}

.mx-progress-fill[data-tone="mustard"] { background: #c8a24a; }
.mx-progress-fill[data-tone="slate"] { background: #7b3f3f; }

.mx-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mx-grid-card {
  padding: 12px;
  display: grid;
  gap: 12px;
  position: relative;
}

.mx-grid-thumb {
  height: 132px;
  border-radius: 20px;
  background: rgba(0,0,0,0.06);
  display: grid;
  place-items: center;
}

.mx-grid-thumb[data-tone="mustard"] { background: rgba(200,162,74,0.92); }
.mx-grid-thumb[data-tone="slate"] { background: rgba(123,63,63,0.92); }

.mx-grid-thumb .mx-grid-thumb-glyph {
  width: 76px;
  height: 76px;
  border-radius: 24px;
  background: rgba(255,255,255,0.82);
  box-shadow: var(--mx-card-shadow);
}

.mx-grid-foot {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.mx-grid-chip {
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.62rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.mx-grid-chip[data-tone="mustard"] {
  background: rgba(200,162,74,0.14);
  border-color: rgba(200,162,74,0.26);
  color: #6e5719;
}

.mx-grid-chip[data-tone="slate"] {
  background: rgba(123,63,63,0.1);
  border-color: rgba(123,63,63,0.18);
  color: #7b3f3f;
}

.mx-spotlight-card {
  padding: 16px;
  display: grid;
  gap: 14px;
}

.mx-spotlight-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mx-spotlight-kicker {
  margin: 0;
  color: var(--mx-text-faint);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.mx-spotlight-badge {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #7b3f3f;
  color: #f6f2ea;
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 700;
}

.mx-spotlight-inner {
  padding: 14px;
  border-radius: 24px;
  background: #111111;
  color: #f6f2ea;
  display: grid;
  gap: 14px;
}

.mx-spotlight-media {
  height: 148px;
  border-radius: 18px;
  background: rgba(200,162,74,0.18);
  display: grid;
  place-items: center;
}

.mx-spotlight-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.mx-spotlight-open {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 0;
  background: #f6f2ea;
  color: #111111;
  font-size: 0.84rem;
  font-weight: 600;
}

.mx-bottom-nav {
  position: sticky;
  bottom: 0;
  z-index: 9;
  border-top: 1px solid rgba(17,17,17,0.06);
  background: rgba(246,242,234,0.96);
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.mx-bottom-nav-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}

.mx-nav-btn {
  border: 0;
  background: transparent;
  color: var(--mx-text-faint);
  display: grid;
  justify-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
}

.mx-nav-bubble {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  font-size: 1rem;
}

.mx-nav-btn.is-active { color: var(--mx-text); }
.mx-nav-btn.is-active .mx-nav-bubble { background: #c8a24a; }

.mx-play-fab-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-18px);
}

.mx-play-fab {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  border: 0;
  background: #7b3f3f;
  color: #f6f2ea;
  box-shadow: 0 14px 24px rgba(123,63,63,0.22);
  font-size: 1.08rem;
}

.mx-hidden {
  display: none !important;
}

@media (max-width: 980px) {
  .mx-home-hero {
    grid-template-columns: 1fr;
  }

  .mx-home-hero-media-frame {
    min-height: 220px;
  }
}

@media (max-width: 760px) {
  .app-shell,
  .app-shell.app-shell-home,
  .app-shell:not(.app-shell-home) {
    width: min(100%, calc(100% - 14px));
    margin: 8px auto 16px;
  }

  .home-screen.home-library-screen.is-catalog.mx-home-screen {
    gap: 12px;
  }

  .home-library-header {
    padding: 12px 14px;
    border-radius: 20px;
  }

  .mx-home-search {
    min-height: 50px;
    padding: 0 14px;
    border-radius: 18px;
  }

  .mx-home-hero {
    padding: 16px;
    gap: 14px;
    border-radius: 26px;
  }

  .mx-home-hero-title {
    font-size: clamp(1.56rem, 8vw, 2.2rem);
  }

  .mx-home-hero-text {
    max-width: none;
    font-size: 0.88rem;
    line-height: 1.45;
  }

  .mx-home-hero-media-frame {
    min-height: 180px;
    border-radius: 22px;
  }

  .mx-categories {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .mx-category-btn {
    padding: 10px 6px;
    border-radius: 18px;
  }

  .mx-category-icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    font-size: 0.84rem;
  }

  .mx-category-label {
    font-size: 0.62rem;
  }

  .mx-feature-card {
    min-width: 220px;
    border-radius: 24px;
  }

  .mx-grid {
    gap: 8px;
  }

  .mx-grid-card,
  .mx-continue-card,
  .mx-spotlight-card {
    border-radius: 20px;
  }

  .mx-grid-thumb {
    height: 108px;
    border-radius: 16px;
  }

  .mx-grid-thumb .mx-grid-thumb-glyph,
  .mx-feature-media .home-game-card-glyph,
  .mx-feature-media .mx-grid-thumb-glyph,
  .mx-spotlight-media .mx-grid-thumb-glyph {
    width: 58px;
    height: 58px;
    border-radius: 18px;
  }

  .mx-feature-title,
  .mx-continue-title,
  .mx-grid-title,
  .mx-spotlight-title {
    font-size: 0.98rem;
  }

  .mx-feature-subtitle,
  .mx-continue-meta,
  .mx-grid-caption,
  .mx-spotlight-text {
    font-size: 0.74rem;
  }

  .mx-bottom-nav {
    padding-inline: 10px;
  }

  .mx-nav-bubble {
    width: 38px;
    height: 38px;
    border-radius: 14px;
  }

  .mx-play-fab-wrap {
    transform: translateY(-14px);
  }

  .mx-play-fab {
    width: 48px;
    height: 48px;
  }
}
`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function ensureStyle() {
  if (typeof document === "undefined") return;
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = CSS;
}

function getAppRoot() {
  return document.getElementById("app");
}

function getTone(gameId) {
  return ["billar", "buscaminas", "parchis", "tictactoe", "damas"].includes(gameId) ? "slate" : "mustard";
}

function getTag(gameId) {
  const tags = {
    trafico: "Rápido",
    billar: "Precisión",
    tanques: "Duelo",
    buscaminas: "Clásico",
    sokoban: "Lógica",
    parchis: "Casa",
    damas: "Tablero",
    tictactoe: "Express",
    connect4: "Mesa",
    "futbol-turnos": "Turnos",
    "escaleras-serpientes": "Familia",
    memory: "Parejas"
  };
  return tags[gameId] || "Local";
}

function getCategoryForGame(gameId) {
  if (["trafico", "tictactoe", "connect4", "memory"].includes(gameId)) return "rapidos";
  if (["parchis", "damas", "billar", "escaleras-serpientes", "sokoban", "buscaminas"].includes(gameId)) return "mesa";
  if (["billar", "tanques", "futbol-turnos"].includes(gameId)) return "punteria";
  if (["parchis", "escaleras-serpientes", "futbol-turnos", "connect4", "memory"].includes(gameId)) return "familia";
  return "all";
}

function collectGames(screen) {
  const cards = Array.from(screen.querySelectorAll(".home-game-card"));
  return cards.map((card) => {
    const hit = card.querySelector(".home-game-card-hit");
    const title = card.querySelector(".home-game-card-title")?.textContent?.trim() || "Juego";
    const subtitle = card.querySelector(".home-game-card-subtitle")?.textContent?.trim() || "Partida local";
    const glyph = card.querySelector(".home-game-card-glyph")?.outerHTML || "";
    const gameId = hit?.dataset.gameId || "";
    const players = card.querySelector(".home-game-card-tag")?.textContent?.trim() || "Local";
    return {
      id: gameId,
      title,
      subtitle,
      glyph,
      players,
      tone: getTone(gameId),
      tag: getTag(gameId),
      category: getCategoryForGame(gameId)
    };
  });
}

function getHomeData(screen) {
  const header = screen.querySelector(".home-library-header");
  const heroImage = screen.querySelector(".home-family-art-image")?.getAttribute("src") || "./assets/home-hero-family.png";
  const games = collectGames(screen);
  return {
    headerHtml: header ? header.outerHTML : "",
    heroImage,
    games
  };
}

function filterGames(games) {
  const term = HOME_STATE.search.trim().toLowerCase();
  return games.filter((game) => {
    const matchesSearch = !term || `${game.title} ${game.subtitle} ${game.tag}`.toLowerCase().includes(term);
    const matchesFilter = HOME_STATE.filter === "all" || game.category === HOME_STATE.filter;
    return matchesSearch && matchesFilter;
  });
}

function getFeaturedGames(games) {
  const featured = FEATURED_IDS.map((id) => games.find((game) => game.id === id)).filter(Boolean);
  return featured.length ? featured : games.slice(0, 3);
}

function getContinueGames(games) {
  return CONTINUE_ITEMS.map((item) => {
    const game = games.find((entry) => entry.id === item.id);
    return game ? { ...game, ...item } : null;
  }).filter(Boolean);
}

function getDailyGame(games) {
  return games.find((game) => game.id === DAILY_ID) || games[0] || null;
}

function buildSearch() {
  return `
    <section class="mx-home-search" aria-label="Buscar juegos">
      <span class="mx-home-search-icon" aria-hidden="true">⌕</span>
      <input class="mx-home-search-input" type="search" value="${escapeHtml(HOME_STATE.search)}" placeholder="Buscar parchís, billar, tráfico o damas" data-home-search />
    </section>
  `;
}

function buildHero(game, heroImage) {
  const openId = game?.id || "";
  return `
    <section class="mx-home-hero">
      <div class="mx-home-hero-copy">
        <p class="mx-home-kicker">Minijuegos en casa</p>
        <h2 class="mx-home-hero-title">Partidas rápidas, locales y sin complicarse</h2>
        <p class="mx-home-hero-text">Una colección pensada para jugar en familia o por turnos, con reglas claras y acceso directo desde la home.</p>
        <div class="mx-home-hero-actions">
          <button class="mx-btn mx-btn-primary" data-action="open-game" data-game-id="${escapeHtml(openId)}">Jugar ahora</button>
          <button class="mx-btn mx-btn-secondary" data-home-scroll="explorar">Ver catálogo</button>
        </div>
      </div>
      <div class="mx-home-hero-media">
        <div class="mx-home-hero-media-frame">
          <img src="${escapeHtml(heroImage)}" alt="Minijuegos para jugar en casa" />
        </div>
      </div>
    </section>
  `;
}

function buildCategories() {
  return `
    <section class="mx-home-block">
      <div class="mx-home-block-head">
        <h3 class="mx-home-block-title">Cómo os apetece jugar</h3>
        <span class="mx-home-link">Filtrar</span>
      </div>
      <div class="mx-categories">
        ${CATEGORY_ITEMS.filter((item) => item.key !== "all").map((item) => `
          <button class="mx-category-btn ${HOME_STATE.filter === item.key ? "is-active" : ""}" data-home-filter="${item.key}">
            <span class="mx-category-icon" aria-hidden="true">${item.icon}</span>
            <span class="mx-category-label">${escapeHtml(item.name)}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function buildFeatured(games) {
  return `
    <section class="mx-home-block">
      <div class="mx-home-block-head">
        <h3 class="mx-home-block-title">Para empezar</h3>
        <span class="mx-home-link">Selección rápida</span>
      </div>
      <div class="mx-featured-row">
        ${games.map((game) => `
          <article class="mx-feature-card" data-tone="${game.tone}">
            <div class="mx-feature-top">
              <span class="mx-feature-tag">${escapeHtml(game.tag)}</span>
              <span class="mx-feature-star" aria-hidden="true">●</span>
            </div>
            <div class="mx-feature-media">${game.glyph || `<div class="mx-grid-thumb-glyph"></div>`}</div>
            <div>
              <h4 class="mx-feature-title">${escapeHtml(game.title)}</h4>
              <p class="mx-feature-subtitle">${escapeHtml(game.subtitle)}</p>
            </div>
            <button class="mx-feature-open" data-action="open-game" data-game-id="${escapeHtml(game.id)}">Abrir juego</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function buildContinue(games) {
  if (!games.length) return "";
  return `
    <section class="mx-home-block">
      <div class="mx-home-block-head">
        <h3 class="mx-home-block-title">Seguir jugando</h3>
        <span class="mx-home-link">Retomar</span>
      </div>
      <div class="mx-continue-list">
        ${games.map((game) => `
          <article class="mx-continue-card">
            <div class="mx-continue-row">
              <div class="mx-continue-icon" data-tone="${game.accent}">↺</div>
              <div class="mx-continue-body">
                <div class="mx-continue-head">
                  <div>
                    <h4 class="mx-continue-title">${escapeHtml(game.title)}</h4>
                    <p class="mx-continue-meta">${escapeHtml(game.meta)}</p>
                  </div>
                  <button class="mx-mini-btn" data-action="open-game" data-game-id="${escapeHtml(game.id)}">›</button>
                </div>
                <div>
                  <div class="mx-progress-head"><span>Partida</span><span>${game.progress}%</span></div>
                  <div class="mx-progress-track"><div class="mx-progress-fill" data-tone="${game.accent}" style="width:${game.progress}%"></div></div>
                </div>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function buildExplore(games) {
  return `
    <section class="mx-home-block" id="explorar">
      <div class="mx-home-block-head">
        <h3 class="mx-home-block-title">Todos los juegos</h3>
        <span class="mx-home-link">Catálogo</span>
      </div>
      <div class="mx-grid">
        ${games.map((game) => `
          <article class="mx-grid-card">
            <button class="home-game-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button>
            <div class="mx-grid-thumb" data-tone="${game.tone}">${game.glyph || `<div class="mx-grid-thumb-glyph"></div>`}</div>
            <div class="mx-grid-foot">
              <div>
                <h4 class="mx-grid-title">${escapeHtml(game.title)}</h4>
                <p class="mx-grid-caption">${escapeHtml(game.subtitle)}</p>
              </div>
              <span class="mx-grid-chip" data-tone="${game.tone}">${escapeHtml(game.tag)}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function buildSpotlight(game) {
  if (!game) return "";
  return `
    <section class="mx-spotlight-card">
      <div class="mx-spotlight-head">
        <div>
          <p class="mx-spotlight-kicker">Sugerencia del día</p>
          <h3 class="mx-home-block-title">Una partida para empezar</h3>
        </div>
        <span class="mx-spotlight-badge">Hoy</span>
      </div>
      <div class="mx-spotlight-inner">
        <div class="mx-spotlight-media">${game.glyph || `<div class="mx-grid-thumb-glyph"></div>`}</div>
        <div class="mx-spotlight-foot">
          <div>
            <h4 class="mx-spotlight-title">${escapeHtml(game.title)}</h4>
            <p class="mx-spotlight-text">${escapeHtml(game.subtitle || "Una ronda rápida para entrar a jugar sin pensar demasiado.")}</p>
          </div>
          <button class="mx-spotlight-open" data-action="open-game" data-game-id="${escapeHtml(game.id)}">Entrar</button>
        </div>
      </div>
    </section>
  `;
}

function buildBottomNav(playId) {
  return `
    <nav class="mx-bottom-nav">
      <div class="mx-bottom-nav-row">
        <button class="mx-nav-btn is-active" data-home-scroll="top">
          <span class="mx-nav-bubble">⌂</span>
          <span>Inicio</span>
        </button>
        <button class="mx-nav-btn" data-home-scroll="categorias">
          <span class="mx-nav-bubble">◫</span>
          <span>Tipos</span>
        </button>
        <div class="mx-play-fab-wrap">
          <button class="mx-play-fab" data-action="open-game" data-game-id="${escapeHtml(playId)}">▶</button>
        </div>
        <button class="mx-nav-btn" data-home-scroll="destacados">
          <span class="mx-nav-bubble">◆</span>
          <span>Top</span>
        </button>
        <button class="mx-nav-btn" data-home-scroll="spotlight">
          <span class="mx-nav-bubble">◎</span>
          <span>Hoy</span>
        </button>
      </div>
    </nav>
  `;
}

function renderTransformedHome(screen, data) {
  const filtered = filterGames(data.games);
  const baseGames = filtered.length ? filtered : data.games;
  const featured = getFeaturedGames(baseGames);
  const continueGames = getContinueGames(data.games);
  const daily = getDailyGame(baseGames);
  const explore = baseGames.slice(0, 8);
  const heroGame = featured[0] || data.games[0];

  screen.classList.add("mx-home-screen");
  screen.innerHTML = `
    ${data.headerHtml}
    ${buildSearch()}
    ${buildHero(heroGame, data.heroImage)}
    <div id="categorias">${buildCategories()}</div>
    <div id="destacados">${buildFeatured(featured)}</div>
    ${buildContinue(continueGames)}
    ${buildExplore(explore)}
    <div id="spotlight">${buildSpotlight(daily)}</div>
    ${buildBottomNav(heroGame?.id || "")}
  `;
  screen.dataset.homeTranslated = "1";
}

function enhanceHomeScreen(screen) {
  if (!screen || screen.dataset.homeBusy === "1") return;
  const hasCards = screen.querySelector(".home-game-card");
  if (!hasCards) return;
  screen.dataset.homeBusy = "1";
  try {
    const data = getHomeData(screen);
    screen.__homeData = data;
    renderTransformedHome(screen, data);
  } finally {
    delete screen.dataset.homeBusy;
  }
}

function rerenderHome() {
  const root = getAppRoot();
  const screen = root?.querySelector(".home-screen.home-library-screen.is-catalog.mx-home-screen");
  if (!screen || !screen.__homeData) return;
  renderTransformedHome(screen, screen.__homeData);
}

function bindHomeEvents() {
  if (document.body.dataset.mxHomeEventsBound === "1") return;
  document.body.dataset.mxHomeEventsBound = "1";

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches("[data-home-search]")) return;
    HOME_STATE.search = target.value || "";
    rerenderHome();
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-home-filter],[data-home-scroll]") : null;
    if (!target) return;

    if (target.hasAttribute("data-home-filter")) {
      const next = target.getAttribute("data-home-filter") || "all";
      HOME_STATE.filter = HOME_STATE.filter === next ? "all" : next;
      rerenderHome();
      return;
    }

    const scrollKey = target.getAttribute("data-home-scroll");
    const map = {
      top: ".home-library-header",
      categorias: "#categorias",
      destacados: "#destacados",
      explorar: "#explorar",
      spotlight: "#spotlight"
    };
    const selector = map[scrollKey || ""];
    if (!selector) return;
    const root = getAppRoot();
    const node = root?.querySelector(selector);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function installObserver() {
  const root = getAppRoot();
  if (!root || window[OBSERVER_KEY]) return;
  const observer = new MutationObserver(() => {
    const home = root.querySelector(".home-screen.home-library-screen.is-catalog");
    if (home && !home.classList.contains("mx-home-screen")) {
      enhanceHomeScreen(home);
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  window[OBSERVER_KEY] = observer;
  const home = root.querySelector(".home-screen.home-library-screen.is-catalog");
  if (home) enhanceHomeScreen(home);
}

export function applyAppearanceRefresh() {
  if (typeof document === "undefined") return;
  ensureStyle();
  bindHomeEvents();
  installObserver();
}
