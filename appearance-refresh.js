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
  --mx-bg:#F5F1E8;
  --mx-card:#EFE6D6;
  --mx-card-soft:rgba(239,230,214,.76);
  --mx-mustard:#B88A3B;
  --mx-mustard-dark:#9A742F;
  --mx-terracotta:#B5523B;
  --mx-terracotta-dark:#8F3F2D;
  --mx-text:#1E1B18;
  --mx-text-soft:#5C534B;
  --mx-border:rgba(30,27,24,.08);
  --mx-shadow:0 10px 30px rgba(30,27,24,.10);
  --mx-shadow-hero:0 18px 40px rgba(30,27,24,.14);
  --mx-shadow-nav:0 12px 28px rgba(30,27,24,.18);
}
body,
body:not(.is-home-screen){
  background:
    radial-gradient(circle at top left, rgba(255,255,255,.6), rgba(255,255,255,0) 24%),
    linear-gradient(180deg, #F5F1E8 0%, #F2ECE1 52%, #F8F4EC 100%);
  color:var(--mx-text);
}
.bg-layer,
body:not(.is-home-screen) .bg-layer{
  background:
    radial-gradient(circle at 12% 8%, rgba(255,255,255,.45), rgba(255,255,255,0) 22%),
    radial-gradient(circle at 84% 16%, rgba(184,138,59,.06), rgba(184,138,59,0) 18%);
}
.app-shell,
.app-shell.app-shell-home,
.app-shell:not(.app-shell-home){width:min(1220px,calc(100% - 24px));margin:12px auto 20px;}
.home-screen.home-library-screen.is-catalog.mx-home-screen{display:grid;gap:18px;}
.mx-home-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:2px 2px 0;}
.mx-home-greeting{display:grid;gap:4px;}
.mx-home-kicker{margin:0;font-size:.74rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--mx-text-soft);}
.mx-home-title{margin:0;font-size:1.34rem;line-height:1.05;letter-spacing:-.04em;color:var(--mx-text);}
.mx-home-actions{display:flex;gap:8px;}
.mx-icon-btn{width:40px;height:40px;border:0;border-radius:999px;background:rgba(255,255,255,.65);box-shadow:var(--mx-shadow);color:var(--mx-text);font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
.mx-home-hero,.mx-panel,.mx-game-card,.mx-bottom-nav,.config-card-modern,.app-shell-game .topbar,.app-shell-game .board-wrap,.modal,.block{
  border:1px solid var(--mx-border);
  background:linear-gradient(180deg, rgba(255,255,255,.5), var(--mx-card-soft));
  box-shadow:var(--mx-shadow);
}
.mx-home-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(210px,.85fr);gap:18px;padding:22px;border-radius:28px;box-shadow:var(--mx-shadow-hero);overflow:hidden;}
.mx-home-hero-copy{display:grid;align-content:center;gap:10px;}
.mx-home-hero-title{margin:0;font-size:clamp(1.9rem,3vw,2.6rem);line-height:.98;letter-spacing:-.05em;color:var(--mx-text);}
.mx-home-hero-text{margin:0;max-width:34ch;font-size:.94rem;line-height:1.55;color:var(--mx-text-soft);}
.mx-home-hero-media{min-height:220px;border-radius:22px;background:rgba(184,138,59,.12);display:grid;place-items:center;overflow:hidden;}
.mx-home-hero-media img{width:100%;height:100%;object-fit:cover;display:block;}
.mx-btn{min-height:42px;padding:0 16px;border:0;border-radius:999px;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
.mx-btn-primary{background:var(--mx-terracotta);color:#fff7f3;}
.mx-btn-secondary{background:rgba(255,255,255,.72);color:var(--mx-text);border:1px solid var(--mx-border);}
.mx-home-hero-actions{display:flex;gap:10px;flex-wrap:wrap;}
.mx-panel{padding:16px;border-radius:24px;display:grid;gap:12px;}
.mx-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px;}
.mx-section-title{margin:0;font-size:1.02rem;font-weight:700;letter-spacing:-.03em;color:var(--mx-text);}
.mx-section-link{font-size:.82rem;font-weight:600;color:var(--mx-text-soft);}
.mx-categories{display:flex;gap:10px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;}
.mx-categories::-webkit-scrollbar{display:none;}
.mx-category-btn{min-width:88px;padding:12px 10px;border:1px solid transparent;border-radius:20px;background:rgba(184,138,59,.14);box-shadow:var(--mx-shadow);display:grid;justify-items:center;gap:8px;font:inherit;cursor:pointer;color:var(--mx-text);}
.mx-category-btn.is-active{background:var(--mx-terracotta);color:#fff7f3;}
.mx-category-icon{width:36px;height:36px;border-radius:14px;background:rgba(255,255,255,.45);display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;}
.mx-category-btn.is-active .mx-category-icon{background:rgba(255,255,255,.16);}
.mx-category-label{font-size:.72rem;font-weight:600;line-height:1.15;}
.mx-featured-grid,.mx-catalog-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.mx-game-card{position:relative;padding:12px;border-radius:24px;display:grid;gap:12px;overflow:hidden;}
.mx-card-hit{position:absolute;inset:0;z-index:3;border:0;background:transparent;opacity:0;cursor:pointer;}
.mx-game-thumb{height:116px;border-radius:18px;background:linear-gradient(180deg, rgba(184,138,59,.18), rgba(184,138,59,.08));display:grid;place-items:center;overflow:hidden;}
.mx-game-thumb .home-game-card-glyph,.mx-game-thumb .mx-game-glyph{width:68px;height:68px;border-radius:20px;background:rgba(255,255,255,.82);box-shadow:var(--mx-shadow);}
.mx-game-body{display:grid;gap:6px;}
.mx-game-title{margin:0;font-size:.98rem;font-weight:700;letter-spacing:-.03em;color:var(--mx-text);}
.mx-game-sub{margin:0;font-size:.76rem;line-height:1.35;color:var(--mx-text-soft);}
.mx-game-meta{display:flex;justify-content:flex-start;}
.mx-game-chip{min-height:24px;padding:0 8px;border-radius:999px;background:rgba(184,138,59,.14);color:var(--mx-mustard-dark);border:1px solid rgba(184,138,59,.2);display:inline-flex;align-items:center;font-size:.64rem;font-weight:700;}
.mx-game-card[data-accent="arcade"] .mx-game-thumb{background:linear-gradient(180deg, rgba(181,82,59,.16), rgba(181,82,59,.08));}
.mx-game-card[data-accent="mesa"] .mx-game-thumb{background:linear-gradient(180deg, rgba(184,138,59,.18), rgba(184,138,59,.08));}
.mx-game-card[data-accent="logica"] .mx-game-thumb{background:linear-gradient(180deg, rgba(207,193,166,.32), rgba(207,193,166,.14));}
.mx-game-card[data-accent="party"] .mx-game-thumb{background:linear-gradient(180deg, rgba(184,138,59,.16), rgba(181,82,59,.1));}
.mx-continue-grid{display:grid;grid-template-columns:1fr;gap:12px;}
.mx-progress{display:grid;gap:6px;}
.mx-progress-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:.68rem;color:var(--mx-text-soft);}
.mx-progress-track{height:9px;border-radius:999px;background:rgba(30,27,24,.08);overflow:hidden;}
.mx-progress-fill{height:100%;border-radius:inherit;background:var(--mx-terracotta);}
.mx-more-row{display:flex;justify-content:center;}
.mx-bottom-nav{position:sticky;bottom:0;z-index:9;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));border-radius:24px;background:linear-gradient(180deg,#3a2d22,#241c15);box-shadow:var(--mx-shadow-nav);}
.mx-bottom-nav-row{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;}
.mx-nav-btn{border:0;background:transparent;color:rgba(255,247,243,.72);display:grid;justify-items:center;gap:4px;font:inherit;font-size:.68rem;font-weight:600;cursor:pointer;}
.mx-nav-bubble{width:40px;height:40px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;background:transparent;font-size:1rem;}
.mx-nav-btn.is-active{color:#fff7f3;}
.mx-nav-btn.is-active .mx-nav-bubble{background:var(--mx-terracotta);}
@media (max-width:980px){.mx-home-hero{grid-template-columns:1fr;}.mx-home-hero-media{min-height:170px;}}
@media (max-width:760px){
  .app-shell,.app-shell.app-shell-home,.app-shell:not(.app-shell-home){width:min(100%,calc(100% - 14px));margin:8px auto 16px;}
  .home-screen.home-library-screen.is-catalog.mx-home-screen{gap:14px;}
  .mx-home-top{padding-inline:2px;}
  .mx-home-title{font-size:1.2rem;}
  .mx-home-hero{padding:16px;gap:14px;border-radius:24px;}
  .mx-home-hero-title{font-size:clamp(1.56rem,8vw,2.1rem);}
  .mx-home-hero-text{font-size:.86rem;line-height:1.45;max-width:none;}
  .mx-home-hero-media{min-height:150px;border-radius:18px;}
  .mx-panel,.mx-game-card,.mx-bottom-nav{border-radius:20px;}
  .mx-featured-grid,.mx-catalog-grid{gap:8px;}
  .mx-game-card{padding:10px;gap:10px;}
  .mx-game-thumb{height:96px;border-radius:16px;}
  .mx-game-thumb .home-game-card-glyph,.mx-game-thumb .mx-game-glyph{width:54px;height:54px;border-radius:16px;}
  .mx-category-btn{min-width:82px;padding:10px 8px;border-radius:18px;}
  .mx-category-icon{width:32px;height:32px;border-radius:12px;}
  .mx-category-label{font-size:.64rem;}
  .mx-bottom-nav{padding-inline:10px;}
  .mx-nav-bubble{width:36px;height:36px;border-radius:12px;}
}
`;

function escapeHtml(value){
  return String(value).replace(/[&<>\"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
}
function ensureStyle(){
  if(typeof document==="undefined") return;
  let style=document.getElementById(STYLE_ID);
  if(!style){style=document.createElement("style");style.id=STYLE_ID;document.head.appendChild(style);} 
  style.textContent=CSS;
}
function getAppRoot(){ return document.getElementById("app"); }
function getCategoryForGame(id){
  if(["trafico","tanques","futbol-turnos"].includes(id)) return "arcade";
  if(["parchis","damas","billar","connect4","tictactoe","escaleras-serpientes"].includes(id)) return "mesa";
  if(["buscaminas","sokoban"].includes(id)) return "logica";
  if(["memory","impostor","preguntas-rapidas","mimica-retos"].includes(id)) return "party";
  return "mesa";
}
function getTag(id){
  const tags={trafico:"1 jugador",tanques:"2 jugadores",billar:"2 jugadores",damas:"estrategia",parchis:"local",connect4:"rápido",tictactoe:"rápido",buscaminas:"1 jugador",sokoban:"lógica","futbol-turnos":"2 jugadores",memory:"party",impostor:"grupo","preguntas-rapidas":"party","mimica-retos":"party"};
  return tags[id]||"local";
}
function collectGames(screen){
  return Array.from(screen.querySelectorAll(".home-game-card")).map((card)=>{
    const hit=card.querySelector(".home-game-card-hit");
    const id=hit?.dataset.gameId || "";
    return {
      id,
      title: card.querySelector(".home-game-card-title")?.textContent?.trim() || "Juego",
      subtitle: card.querySelector(".home-game-card-subtitle")?.textContent?.trim() || "Partida local",
      glyph: card.querySelector(".home-game-card-glyph")?.outerHTML || "<div class=\"mx-game-glyph\"></div>",
      category: getCategoryForGame(id),
      tag: getTag(id)
    };
  });
}
function getHomeData(screen){
  return {
    heroImage: screen.querySelector(".home-family-art-image")?.getAttribute("src") || "./assets/home-hero-family.png",
    games: collectGames(screen)
  };
}
function filterGames(games){
  const term=HOME_STATE.search.trim().toLowerCase();
  return games.filter((game)=>{
    const matchesSearch=!term || `${game.title} ${game.subtitle} ${game.tag}`.toLowerCase().includes(term);
    const matchesFilter=HOME_STATE.filter==="all" || game.category===HOME_STATE.filter;
    return matchesSearch && matchesFilter;
  });
}
function findByIds(games, ids){ return ids.map((id)=>games.find((game)=>game.id===id)).filter(Boolean); }
function buildTop(){
  return `<section class="mx-home-top"><div class="mx-home-greeting"><p class="mx-home-kicker">Hola</p><h1 class="mx-home-title">¿A qué jugamos hoy?</h1></div><div class="mx-home-actions"><button class="mx-icon-btn" data-home-scroll="search" aria-label="Buscar">⌕</button><button class="mx-icon-btn" data-home-scroll="profile" aria-label="Perfil">◌</button></div></section>`;
}
function buildSearch(){
  return `<section class="mx-home-search" id="search" aria-label="Buscar juegos"><span class="mx-home-search-icon" aria-hidden="true">⌕</span><input class="mx-home-search-input" type="search" value="${escapeHtml(HOME_STATE.search)}" placeholder="Buscar juegos" data-home-search /></section>`;
}
function buildHero(game, heroImage){
  const openId=game?.id || "";
  return `<section class="mx-home-hero"><div class="mx-home-hero-copy"><p class="mx-home-kicker">Juego del día</p><h2 class="mx-home-hero-title">${escapeHtml(game?.title || "Minijuegos")}</h2><p class="mx-home-hero-text">${escapeHtml(game?.subtitle || "Una partida rápida para empezar sin pensar demasiado.")}</p><div class="mx-home-hero-actions"><button class="mx-btn mx-btn-primary" data-action="open-game" data-game-id="${escapeHtml(openId)}">Jugar</button></div></div><div class="mx-home-hero-media">${heroImage ? `<img src="${escapeHtml(heroImage)}" alt="Juego destacado" />` : game?.glyph || ""}</div></section>`;
}
function buildCategories(){
  return `<section class="mx-panel" id="categorias"><div class="mx-categories">${CATEGORY_ITEMS.filter((item)=>item.key!=="all").map((item)=>`<button class="mx-category-btn ${HOME_STATE.filter===item.key?"is-active":""}" data-home-filter="${item.key}"><span class="mx-category-icon" aria-hidden="true">${item.icon}</span><span class="mx-category-label">${escapeHtml(item.name)}</span></button>`).join("")}</div></section>`;
}
function buildCard(game){
  return `<article class="mx-game-card" data-accent="${escapeHtml(game.category)}"><button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${game.glyph}</div><div class="mx-game-body"><h4 class="mx-game-title">${escapeHtml(game.title)}</h4><p class="mx-game-sub">${escapeHtml(game.subtitle)}</p></div><div class="mx-game-meta"><span class="mx-game-chip">${escapeHtml(game.tag)}</span></div></article>`;
}
function buildContinueCard(game){
  const progress = game.id === "futbol-turnos" ? 68 : 43;
  const meta = game.id === "futbol-turnos" ? "Partida abierta" : "Tablero a medias";
  return `<article class="mx-game-card" data-accent="${escapeHtml(game.category)}"><button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${game.glyph}</div><div class="mx-game-body"><h4 class="mx-game-title">${escapeHtml(game.title)}</h4><p class="mx-game-sub">${escapeHtml(meta)}</p></div><div class="mx-progress"><div class="mx-progress-head"><span>Progreso</span><span>${progress}%</span></div><div class="mx-progress-track"><div class="mx-progress-fill" style="width:${progress}%"></div></div></div></article>`;
}
function buildFeatured(games){
  return `<section class="mx-panel"><div class="mx-section-head"><h3 class="mx-section-title">Juegos destacados</h3></div><div class="mx-featured-grid">${games.map(buildCard).join("")}</div></section>`;
}
function buildCatalog(games){
  const visible = HOME_STATE.showAll ? games : games.slice(0,6);
  return `<section class="mx-panel" id="juegos"><div class="mx-section-head"><h3 class="mx-section-title">Todos los juegos</h3><button class="mx-section-link" data-home-toggle-all>${HOME_STATE.showAll ? "Ver menos" : `Ver los ${games.length}`}</button></div><div class="mx-catalog-grid">${visible.map(buildCard).join("")}</div></section>`;
}
function buildContinue(games){
  if(!games.length) return "";
  return `<section class="mx-panel" id="seguir"><div class="mx-section-head"><h3 class="mx-section-title">Seguir</h3></div><div class="mx-continue-grid">${games.map(buildContinueCard).join("")}</div></section>`;
}
function buildBottomNav(){
  return `<nav class="mx-bottom-nav"><div class="mx-bottom-nav-row"><button class="mx-nav-btn is-active" data-home-scroll="top"><span class="mx-nav-bubble">⌂</span><span>Inicio</span></button><button class="mx-nav-btn" data-home-scroll="juegos"><span class="mx-nav-bubble">▦</span><span>Juegos</span></button><button class="mx-nav-btn" data-home-scroll="seguir"><span class="mx-nav-bubble">♥</span><span>Favoritos</span></button><button class="mx-nav-btn" data-home-scroll="ranking"><span class="mx-nav-bubble">★</span><span>Ranking</span></button><button class="mx-nav-btn" data-home-scroll="profile"><span class="mx-nav-bubble">◌</span><span>Perfil</span></button></div></nav>`;
}
function renderTransformedHome(screen,data){
  const filtered=filterGames(data.games);
  const visible=filtered.length?filtered:data.games;
  const heroGame=data.games.find((g)=>g.id===HERO_ID) || visible[0] || data.games[0];
  const featured=findByIds(visible, FEATURED_IDS);
  const continueGames=findByIds(data.games, ["futbol-turnos","buscaminas"]);
  screen.classList.add("mx-home-screen");
  screen.innerHTML=`${buildTop()}${buildSearch()}${buildHero(heroGame,data.heroImage)}${buildCategories()}${buildFeatured(featured.length ? featured : visible.slice(0,4))}${buildContinue(continueGames)}${buildCatalog(visible)}<div id="ranking"></div><div id="profile"></div>${buildBottomNav()}`;
}
function enhanceHomeScreen(screen){
  if(!screen || screen.dataset.homeBusy==="1") return;
  if(!screen.querySelector(".home-game-card")) return;
  screen.dataset.homeBusy="1";
  try{ const data=getHomeData(screen); screen.__homeData=data; renderTransformedHome(screen,data); } finally { delete screen.dataset.homeBusy; }
}
function rerenderHome(){
  const screen=getAppRoot()?.querySelector(".home-screen.home-library-screen.is-catalog.mx-home-screen");
  if(!screen || !screen.__homeData) return;
  renderTransformedHome(screen,screen.__homeData);
}
function bindHomeEvents(){
  if(document.body.dataset.mxHomeEventsBound==="1") return;
  document.body.dataset.mxHomeEventsBound="1";
  document.addEventListener("input",(event)=>{
    const target=event.target;
    if(!(target instanceof HTMLInputElement) || !target.matches("[data-home-search]")) return;
    HOME_STATE.search=target.value || "";
    rerenderHome();
  });
  document.addEventListener("click",(event)=>{
    const target=event.target instanceof Element ? event.target.closest("[data-home-filter],[data-home-scroll],[data-home-toggle-all]") : null;
    if(!target) return;
    if(target.hasAttribute("data-home-filter")){
      const next=target.getAttribute("data-home-filter") || "all";
      HOME_STATE.filter=HOME_STATE.filter===next ? "all" : next;
      rerenderHome();
      return;
    }
    if(target.hasAttribute("data-home-toggle-all")){
      HOME_STATE.showAll=!HOME_STATE.showAll;
      rerenderHome();
      return;
    }
    const map={top:".mx-home-top",search:"#search",categorias:"#categorias",seguir:"#seguir",juegos:"#juegos",ranking:"#ranking",profile:"#profile"};
    const selector=map[target.getAttribute("data-home-scroll") || ""];
    if(!selector) return;
    const node=getAppRoot()?.querySelector(selector);
    node?.scrollIntoView({behavior:"smooth",block:"start"});
  });
}
function installObserver(){
  const root=getAppRoot();
  if(!root || window[OBSERVER_KEY]) return;
  const observer=new MutationObserver(()=>{
    const home=root.querySelector(".home-screen.home-library-screen.is-catalog");
    if(home && !home.classList.contains("mx-home-screen")) enhanceHomeScreen(home);
  });
  observer.observe(root,{childList:true,subtree:true});
  window[OBSERVER_KEY]=observer;
  const home=root.querySelector(".home-screen.home-library-screen.is-catalog");
  if(home) enhanceHomeScreen(home);
}
export function applyAppearanceRefresh(){
  if(typeof document==="undefined") return;
  ensureStyle();
  bindHomeEvents();
  installObserver();
}
