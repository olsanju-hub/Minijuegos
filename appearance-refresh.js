const STYLE_ID = "minijuegos-appearance-refresh";
const OBSERVER_KEY = "__minijuegosAppearanceObserver";
const HOME_STATE = { search: "", filter: "all", showAll: false };

const HERO_ID = "parchis";
const FEATURED_IDS = ["trafico", "tanques", "futbol-turnos", "damas"];
const CATEGORY_ITEMS = [
  { key: "all", name: "Todo", icon: "◌" },
  { key: "arcade", name: "Arcade", icon: "◈" },
  { key: "mesa", name: "Mesa", icon: "▦" },
  { key: "logica", name: "Lógica", icon: "◫" },
  { key: "party", name: "Party", icon: "✦" }
];

const CSS = String.raw`
:root {
  --mx-bg: #f2eaee;
  --mx-bg-soft: #f7f1f4;
  --mx-surface: rgba(255, 250, 252, 0.88);
  --mx-surface-strong: rgba(255, 252, 253, 0.96);
  --mx-surface-muted: rgba(247, 234, 240, 0.9);
  --mx-border: rgba(82, 53, 66, 0.12);
  --mx-border-strong: rgba(82, 53, 66, 0.2);
  --mx-text: #2b2328;
  --mx-text-soft: #6f5e68;
  --mx-text-faint: rgba(111, 94, 104, 0.72);
  --mx-primary: #d84f87;
  --mx-primary-hover: #c74379;
  --mx-primary-pressed: #b9396b;
  --mx-accent: #a55b7b;
  --mx-chip: #f2d8e4;
  --mx-chip-strong: #e8c5d4;
  --mx-shadow-card: 0 10px 30px rgba(42, 35, 39, 0.1);
  --mx-shadow-nav: 0 12px 28px rgba(42, 35, 39, 0.18);
  --mx-radius-card: 24px;
  --mx-radius-btn: 16px;
  --mx-radius-pill: 999px;
}

html,
body {
  background: linear-gradient(180deg, #f4edf0 0%, #efe6eb 100%);
}

body,
body:not(.is-home-screen) {
  color: var(--mx-text);
  background:
    radial-gradient(circle at 12% 8%, rgba(255,255,255,0.84), rgba(255,255,255,0) 24%),
    radial-gradient(circle at 88% 10%, rgba(232,197,212,0.44), rgba(232,197,212,0) 24%),
    linear-gradient(180deg, #f4edf0 0%, #efe6eb 56%, #f7f1f4 100%);
}

.bg-layer,
body:not(.is-home-screen) .bg-layer {
  background:
    radial-gradient(circle at 10% 10%, rgba(255,255,255,0.6), rgba(255,255,255,0) 22%),
    radial-gradient(circle at 84% 18%, rgba(216,79,135,0.1), rgba(216,79,135,0) 18%),
    radial-gradient(circle at 74% 82%, rgba(165,91,123,0.08), rgba(165,91,123,0) 20%);
}

.app-shell,
.app-shell.app-shell-home,
.app-shell:not(.app-shell-home) {
  width: min(1280px, calc(100% - 24px));
  margin: 12px auto 20px;
}

.card,
.block,
.modal,
.topbar,
.config-card,
.config-card-modern,
.board-wrap,
.screen .card,
.home-library-header,
.mx-panel,
.mx-game-card,
.mx-bottom-nav {
  border: 1px solid var(--mx-border);
  background: linear-gradient(180deg, var(--mx-surface-strong) 0%, var(--mx-surface) 100%);
  box-shadow: var(--mx-shadow-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

button,
.btn,
.btn-primary,
.btn-secondary,
.btn-ghost,
.btn-icon,
.pill,
.mx-btn,
.mx-btn-primary,
.mx-btn-secondary,
.mx-icon-btn,
.mx-category-btn,
.mx-section-link,
.mx-nav-btn,
.home-note-pill,
.home-games-toggle,
.home-rack-arrow,
.home-mobile-drawer-item {
  font-family: inherit;
}

.btn,
.pill,
.mx-btn,
.mx-icon-btn,
.btn-icon,
.home-games-toggle,
.home-rack-arrow,
.home-mobile-drawer-item {
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
}

.btn,
.btn-primary,
.btn-secondary,
.btn-ghost,
.mx-btn,
.mx-btn-primary,
.mx-btn-secondary {
  min-height: 46px;
  height: 46px;
  padding: 0 16px;
  border-radius: var(--mx-radius-btn);
  border: 1px solid var(--mx-border);
  font-size: 0.92rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  box-shadow: 0 8px 18px rgba(42,35,39,0.08), inset 0 1px 0 rgba(255,255,255,0.6);
}

.btn-primary,
.mx-btn-primary {
  background: linear-gradient(180deg, var(--mx-primary) 0%, var(--mx-primary-pressed) 100%);
  color: #fff8fb;
  border-color: rgba(139, 48, 86, 0.18);
  box-shadow: 0 12px 24px rgba(184,57,107,0.24), inset 0 1px 0 rgba(255,255,255,0.18);
}

.btn-secondary,
.mx-btn-secondary,
.pill,
.home-note-pill,
.home-note-pill.is-soft,
.mx-section-link,
.home-games-toggle,
.home-rack-arrow,
.home-mobile-drawer-item {
  background: linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(247,234,240,0.9) 100%);
  color: var(--mx-text);
  border-color: var(--mx-border);
  box-shadow: 0 8px 18px rgba(42,35,39,0.06), inset 0 1px 0 rgba(255,255,255,0.82);
}

.btn-icon,
.mx-icon-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  padding: 0;
  border-radius: 14px;
  border: 1px solid var(--mx-border);
  background: linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(247,234,240,0.88) 100%);
  color: var(--mx-text);
  box-shadow: 0 8px 18px rgba(42,35,39,0.06), inset 0 1px 0 rgba(255,255,255,0.82);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pill.is-active,
.mx-category-btn.is-active {
  background: linear-gradient(180deg, var(--mx-primary) 0%, var(--mx-primary-pressed) 100%);
  color: #fff8fb;
  border-color: rgba(139, 48, 86, 0.18);
  box-shadow: 0 12px 24px rgba(184,57,107,0.22), inset 0 1px 0 rgba(255,255,255,0.18);
}

.topbar,
.app-shell:not(.app-shell-home) .topbar {
  padding: 14px 16px;
  border-radius: 22px;
}

.input,
.select {
  border: 1px solid var(--mx-border);
  border-radius: 15px;
  background: rgba(255,255,255,0.76);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}

.home-screen.home-library-screen.is-catalog.mx-home-screen { display:grid; gap:18px; }
.mx-home-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:2px 2px 0; }
.mx-home-greeting { display:grid; gap:4px; }
.mx-home-kicker { margin:0; font-size:.72rem; font-weight:760; letter-spacing:.16em; text-transform:uppercase; color:var(--mx-text-soft); }
.mx-home-title { margin:0; font-size:1.34rem; line-height:1.05; letter-spacing:-.04em; color:var(--mx-text); }
.mx-home-actions { display:flex; gap:8px; }
.mx-panel { padding:16px; border-radius:var(--mx-radius-card); display:grid; gap:12px; }
.mx-section-head { display:flex; align-items:end; justify-content:space-between; gap:12px; }
.mx-section-title { margin:0; font-size:1.02rem; font-weight:700; letter-spacing:-.03em; }
.mx-section-link { min-height:34px; padding:0 12px; border-radius:var(--mx-radius-pill); display:inline-flex; align-items:center; justify-content:center; font-size:.76rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border:1px solid var(--mx-border); background:linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(247,234,240,0.88) 100%); color:var(--mx-text-soft); }
.mx-categories { display:flex; gap:10px; overflow-x:auto; padding-bottom:2px; scrollbar-width:none; }
.mx-categories::-webkit-scrollbar { display:none; }
.mx-category-btn { min-width:92px; padding:12px 10px; border-radius:20px; display:grid; justify-items:center; gap:8px; color:var(--mx-text); background:linear-gradient(180deg, rgba(242,216,228,0.86) 0%, rgba(232,197,212,0.78) 100%); }
.mx-category-icon { width:36px; height:36px; border-radius:14px; background:rgba(255,255,255,0.56); display:inline-flex; align-items:center; justify-content:center; font-size:.95rem; }
.mx-featured-grid,.mx-catalog-grid,.mx-continue-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.mx-game-card { position:relative; padding:12px; border-radius:24px; display:grid; gap:12px; overflow:hidden; }
.mx-card-hit { position:absolute; inset:0; z-index:3; border:0; background:transparent; opacity:0; cursor:pointer; }
.mx-game-thumb { height:116px; border-radius:18px; background:linear-gradient(180deg, rgba(243,214,226,0.94) 0%, rgba(232,197,212,0.74) 100%); display:grid; place-items:center; overflow:hidden; border:1px solid var(--mx-border); }
.mx-game-thumb .home-game-card-glyph,.mx-game-thumb .mx-game-glyph { width:68px; height:68px; border-radius:20px; background:rgba(255,255,255,0.84); box-shadow:0 10px 18px rgba(42,35,39,0.08); }
.mx-game-body { display:grid; gap:6px; }
.mx-game-title { margin:0; font-size:.98rem; font-weight:700; letter-spacing:-.03em; }
.mx-game-sub { margin:0; font-size:.76rem; line-height:1.35; color:var(--mx-text-soft); }
.mx-game-meta { display:flex; justify-content:flex-start; }
.mx-game-chip { min-height:24px; padding:0 8px; border-radius:var(--mx-radius-pill); background:linear-gradient(180deg, rgba(242,216,228,0.9) 0%, rgba(232,197,212,0.82) 100%); color:#8a4868; border:1px solid rgba(165,91,123,0.14); display:inline-flex; align-items:center; font-size:.64rem; font-weight:700; }
.mx-progress { display:grid; gap:6px; }
.mx-progress-head { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:.68rem; color:var(--mx-text-soft); }
.mx-progress-track { height:9px; border-radius:999px; background:rgba(82,53,66,0.08); overflow:hidden; }
.mx-progress-fill { height:100%; border-radius:inherit; background:linear-gradient(90deg, var(--mx-primary) 0%, var(--mx-primary-hover) 100%); }
.mx-bottom-nav { position:sticky; bottom:0; z-index:9; padding:10px 14px calc(10px + env(safe-area-inset-bottom, 0px)); border-radius:24px; background:linear-gradient(180deg, #6e4659 0%, #4e3240 100%); box-shadow:var(--mx-shadow-nav); border:1px solid rgba(70, 40, 53, 0.26); }
.mx-bottom-nav-row { display:flex; align-items:flex-end; justify-content:space-between; gap:8px; }
.mx-nav-btn { border:0; background:transparent; color:rgba(255,245,249,0.74); display:grid; justify-items:center; gap:4px; font:inherit; font-size:.68rem; font-weight:600; cursor:pointer; }
.mx-nav-bubble { width:40px; height:40px; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; background:transparent; font-size:1rem; }
.mx-nav-btn.is-active { color:#fff8fb; }
.mx-nav-btn.is-active .mx-nav-bubble { background:var(--mx-primary); }

@media (max-width: 760px) {
  .app-shell,.app-shell.app-shell-home,.app-shell:not(.app-shell-home) { width:min(100%, calc(100% - 14px)); margin:8px auto 16px; }
  .home-screen.home-library-screen.is-catalog.mx-home-screen { gap:14px; }
  .mx-home-title { font-size:1.2rem; }
  .mx-panel,.mx-game-card,.mx-bottom-nav,.config-card,.config-card-modern,.topbar,.modal,.board-wrap { border-radius:20px; }
  .mx-featured-grid,.mx-catalog-grid,.mx-continue-grid { gap:8px; }
  .mx-game-card { padding:10px; gap:10px; }
  .mx-game-thumb { height:96px; border-radius:16px; }
  .mx-game-thumb .home-game-card-glyph,.mx-game-thumb .mx-game-glyph { width:54px; height:54px; border-radius:16px; }
  .mx-category-btn { min-width:82px; padding:10px 8px; border-radius:18px; }
  .mx-category-icon { width:32px; height:32px; border-radius:12px; }
  .mx-category-label { font-size:.64rem; }
  .btn,.btn-primary,.btn-secondary,.btn-ghost,.mx-btn,.mx-btn-primary,.mx-btn-secondary { min-height:42px; height:42px; padding:0 14px; font-size:.86rem; border-radius:14px; }
  .btn-icon,.mx-icon-btn { width:38px; height:38px; min-width:38px; border-radius:12px; }
  .pill { min-height:36px; height:36px; padding:0 12px; }
  .mx-bottom-nav { padding-inline:10px; }
  .mx-nav-bubble { width:36px; height:36px; border-radius:12px; }
}
`;

function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, (char) => ({
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
function getAppRoot() { return document.getElementById("app"); }
function getCategoryForGame(id) {
  if (["trafico", "tanques", "futbol-turnos"].includes(id)) return "arcade";
  if (["parchis", "damas", "billar", "connect4", "tictactoe", "escaleras-serpientes"].includes(id)) return "mesa";
  if (["buscaminas", "sokoban"].includes(id)) return "logica";
  if (["memory", "impostor", "preguntas-rapidas", "mimica-retos"].includes(id)) return "party";
  return "mesa";
}
function getTag(id) {
  const tags = {trafico:"1 jugador",tanques:"2 jugadores",billar:"2 jugadores",damas:"estrategia",parchis:"local",connect4:"rápido",tictactoe:"rápido",buscaminas:"1 jugador",sokoban:"lógica","futbol-turnos":"2 jugadores",memory:"party",impostor:"grupo","preguntas-rapidas":"party","mimica-retos":"party"};
  return tags[id] || "local";
}
function collectGames(screen) {
  return Array.from(screen.querySelectorAll(".home-game-card")).map((card) => {
    const hit = card.querySelector(".home-game-card-hit");
    const id = hit?.dataset.gameId || "";
    return {id,title: card.querySelector(".home-game-card-title")?.textContent?.trim() || "Juego",subtitle: card.querySelector(".home-game-card-subtitle")?.textContent?.trim() || "Partida local",glyph: card.querySelector(".home-game-card-glyph")?.outerHTML || "<div class=\"mx-game-glyph\"></div>",category: getCategoryForGame(id),tag: getTag(id)};
  });
}
function getHomeData(screen) { return {games: collectGames(screen)}; }
function filterGames(games) {
  return games.filter((game) => {
    const matchesFilter = HOME_STATE.filter === "all" || game.category === HOME_STATE.filter;
    return matchesFilter;
  });
}
function findByIds(games, ids) { return ids.map((id) => games.find((game) => game.id === id)).filter(Boolean); }
function buildTop() { return `<section class="mx-home-top"><div class="mx-home-greeting"><p class="mx-home-kicker">Hola</p><h1 class="mx-home-title">¿A qué jugamos hoy?</h1></div><div class="mx-home-actions"><button class="mx-icon-btn" data-home-scroll="juegos" aria-label="Juegos">▦</button><button class="mx-icon-btn" data-home-scroll="profile" aria-label="Perfil">◌</button></div></section>`; }
function buildCategories() { return `<section class="mx-panel" id="categorias"><div class="mx-categories">${CATEGORY_ITEMS.filter((item) => item.key !== "all").map((item) => `<button class="mx-category-btn ${HOME_STATE.filter === item.key ? "is-active" : ""}" data-home-filter="${item.key}"><span class="mx-category-icon" aria-hidden="true">${item.icon}</span><span class="mx-category-label">${escapeHtml(item.name)}</span></button>`).join("")}</div></section>`; }
function buildCard(game) { return `<article class="mx-game-card" data-accent="${escapeHtml(game.category)}"><button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${game.glyph}</div><div class="mx-game-body"><h4 class="mx-game-title">${escapeHtml(game.title)}</h4><p class="mx-game-sub">${escapeHtml(game.subtitle)}</p></div><div class="mx-game-meta"><span class="mx-game-chip">${escapeHtml(game.tag)}</span></div></article>`; }
function buildContinueCard(game) {
  const progress = game.id === "futbol-turnos" ? 68 : 43;
  const meta = game.id === "futbol-turnos" ? "Partida abierta" : "Tablero a medias";
  return `<article class="mx-game-card"><button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${game.glyph}</div><div class="mx-game-body"><h4 class="mx-game-title">${escapeHtml(game.title)}</h4><p class="mx-game-sub">${escapeHtml(meta)}</p></div><div class="mx-progress"><div class="mx-progress-head"><span>Progreso</span><span>${progress}%</span></div><div class="mx-progress-track"><div class="mx-progress-fill" style="width:${progress}%"></div></div></div></article>`;
}
function buildFeatured(games) { return `<section class="mx-panel"><div class="mx-section-head"><h3 class="mx-section-title">Juegos destacados</h3></div><div class="mx-featured-grid">${games.map(buildCard).join("")}</div></section>`; }
function buildCatalog(games) {
  const visible = HOME_STATE.showAll ? games : games.slice(0, 6);
  return `<section class="mx-panel" id="juegos"><div class="mx-section-head"><h3 class="mx-section-title">Todos los juegos</h3><button class="mx-section-link" data-home-toggle-all>${HOME_STATE.showAll ? "Ver menos" : `Ver los ${games.length}`}</button></div><div class="mx-catalog-grid">${visible.map(buildCard).join("")}</div></section>`;
}
function buildContinue(games) { if (!games.length) return ""; return `<section class="mx-panel" id="seguir"><div class="mx-section-head"><h3 class="mx-section-title">Seguir</h3></div><div class="mx-continue-grid">${games.map(buildContinueCard).join("")}</div></section>`; }
function buildBottomNav() { return `<nav class="mx-bottom-nav"><div class="mx-bottom-nav-row"><button class="mx-nav-btn is-active" data-home-scroll="top"><span class="mx-nav-bubble">⌂</span><span>Inicio</span></button><button class="mx-nav-btn" data-home-scroll="juegos"><span class="mx-nav-bubble">▦</span><span>Juegos</span></button><button class="mx-nav-btn" data-home-scroll="seguir"><span class="mx-nav-bubble">♥</span><span>Favoritos</span></button><button class="mx-nav-btn" data-home-scroll="ranking"><span class="mx-nav-bubble">★</span><span>Ranking</span></button><button class="mx-nav-btn" data-home-scroll="profile"><span class="mx-nav-bubble">◌</span><span>Perfil</span></button></div></nav>`; }
function renderTransformedHome(screen, data) {
  const visible = filterGames(data.games);
  const featured = findByIds(visible.length ? visible : data.games, FEATURED_IDS);
  const continueGames = findByIds(data.games, ["futbol-turnos", "buscaminas"]);
  const base = visible.length ? visible : data.games;
  screen.classList.add("mx-home-screen");
  screen.innerHTML = `${buildTop()}${buildCategories()}${buildFeatured(featured.length ? featured : base.slice(0, 4))}${buildContinue(continueGames)}${buildCatalog(base)}<div id="ranking"></div><div id="profile"></div>${buildBottomNav()}`;
}
function enhanceHomeScreen(screen) {
  if (!screen || screen.dataset.homeBusy === "1") return;
  if (!screen.querySelector(".home-game-card")) return;
  screen.dataset.homeBusy = "1";
  try { const data = getHomeData(screen); screen.__homeData = data; renderTransformedHome(screen, data); } finally { delete screen.dataset.homeBusy; }
}
function rerenderHome() {
  const screen = getAppRoot()?.querySelector(".home-screen.home-library-screen.is-catalog.mx-home-screen");
  if (!screen || !screen.__homeData) return;
  renderTransformedHome(screen, screen.__homeData);
}
function bindHomeEvents() {
  if (document.body.dataset.mxHomeEventsBound === "1") return;
  document.body.dataset.mxHomeEventsBound = "1";
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-home-filter],[data-home-scroll],[data-home-toggle-all]") : null;
    if (!target) return;
    if (target.hasAttribute("data-home-filter")) {
      const next = target.getAttribute("data-home-filter") || "all";
      HOME_STATE.filter = HOME_STATE.filter === next ? "all" : next;
      rerenderHome();
      return;
    }
    if (target.hasAttribute("data-home-toggle-all")) {
      HOME_STATE.showAll = !HOME_STATE.showAll;
      rerenderHome();
      return;
    }
    const map = {top:".mx-home-top",categorias:"#categorias",seguir:"#seguir",juegos:"#juegos",ranking:"#ranking",profile:"#profile"};
    const selector = map[target.getAttribute("data-home-scroll") || ""];
    if (!selector) return;
    const node = getAppRoot()?.querySelector(selector);
    node?.scrollIntoView({ behavior:"smooth", block:"start" });
  });
}
function installObserver() {
  const root = getAppRoot();
  if (!root || window[OBSERVER_KEY]) return;
  const observer = new MutationObserver(() => {
    const home = root.querySelector(".home-screen.home-library-screen.is-catalog");
    if (home && !home.classList.contains("mx-home-screen")) enhanceHomeScreen(home);
  });
  observer.observe(root, { childList:true, subtree:true });
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
