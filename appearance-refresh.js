const STYLE_ID = "minijuegos-appearance-refresh";
const OBSERVER_KEY = "__minijuegosAppearanceObserver";
const HOME_STATE = { search: "", filter: "all" };

const HERO_ID = "parchis";
const CONTINUE_IDS = ["futbol-turnos", "buscaminas"];
const CATEGORY_ITEMS = [
  { key: "all", name: "Todo", icon: "◌" },
  { key: "rapidos", name: "Rápidos", icon: "◷" },
  { key: "mesa", name: "Mesa", icon: "▦" },
  { key: "punteria", name: "Puntería", icon: "◎" },
  { key: "familia", name: "Familia", icon: "✦" }
];

const CSS = String.raw`
:root {
  --mx-bg-0:#f6f2ea;
  --mx-bg-1:#ebe9f5;
  --mx-bg-2:#fbf8f2;
  --mx-surface:#ffffffcc;
  --mx-surface-strong:#ffffffe6;
  --mx-border:rgba(17,17,17,.08);
  --mx-border-strong:rgba(17,17,17,.14);
  --mx-text:#171717;
  --mx-text-soft:rgba(23,23,23,.6);
  --mx-text-faint:rgba(23,23,23,.38);
  --mx-accent:#c8a24a;
  --mx-accent-soft:rgba(200,162,74,.16);
  --mx-shadow:0 14px 32px rgba(0,0,0,.06);
  --mx-shadow-strong:0 18px 40px rgba(0,0,0,.08);
}
body,
body:not(.is-home-screen){
  background:
    radial-gradient(circle at top left,rgba(255,255,255,.72),rgba(255,255,255,0) 24%),
    radial-gradient(circle at top right,rgba(200,162,74,.08),rgba(200,162,74,0) 18%),
    linear-gradient(180deg,var(--mx-bg-0) 0%,var(--mx-bg-1) 56%,var(--mx-bg-2) 100%);
  color:var(--mx-text);
}
.bg-layer,
body:not(.is-home-screen) .bg-layer{
  background:
    radial-gradient(circle at 10% 10%,rgba(255,255,255,.68),rgba(255,255,255,0) 22%),
    radial-gradient(circle at 86% 16%,rgba(200,162,74,.06),rgba(200,162,74,0) 18%),
    radial-gradient(circle at 76% 76%,rgba(123,63,63,.05),rgba(123,63,63,0) 20%);
}
.app-shell,
.app-shell.app-shell-home,
.app-shell:not(.app-shell-home){width:min(1280px,calc(100% - 24px));margin:12px auto 20px;}
.home-screen.home-library-screen.is-catalog.mx-home-screen{display:grid;gap:16px;}
.home-library-header,
.mx-home-search,
.mx-home-hero,
.mx-panel,
.mx-bottom-nav,
.config-card-modern,
.app-shell-game .topbar,
.app-shell-game .board-wrap,
.modal,
.block{
  border:1px solid var(--mx-border);
  background:linear-gradient(180deg,var(--mx-surface-strong),var(--mx-surface));
  box-shadow:var(--mx-shadow);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
}
.home-library-header{position:sticky;top:0;z-index:8;padding:14px 18px;border-radius:24px;background:rgba(246,242,234,.92);}
.home-catalog-title,.mx-home-hero-title,.mx-section-title,.mx-game-title,.mx-panel-title{color:var(--mx-text)!important;}
.home-catalog-subtitle,.home-catalog-signature,.home-note-pill,.mx-home-hero-text,.mx-section-sub,.mx-game-sub,.mx-panel-sub{color:var(--mx-text-soft)!important;}
.mx-home-search{display:flex;align-items:center;gap:12px;min-height:54px;padding:0 16px;border-radius:20px;}
.mx-home-search-icon{color:var(--mx-text-faint);font-size:1rem;line-height:1;}
.mx-home-search-input{width:100%;border:0;background:transparent;color:var(--mx-text);font:inherit;font-size:.95rem;outline:none;}
.mx-home-search-input::placeholder{color:var(--mx-text-faint);}
.mx-home-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(240px,.9fr);gap:18px;padding:22px;border-radius:30px;overflow:hidden;}
.mx-home-hero-copy{display:grid;align-content:center;gap:10px;}
.mx-home-kicker{margin:0;color:var(--mx-text-faint);font-size:.72rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;}
.mx-home-hero-title{margin:0;font-size:clamp(1.8rem,3vw,2.6rem);line-height:1;letter-spacing:-.05em;}
.mx-home-hero-text{margin:0;max-width:34ch;font-size:.95rem;line-height:1.55;}
.mx-home-hero-actions{display:flex;gap:10px;flex-wrap:wrap;}
.mx-btn,.mx-nav-btn,.mx-category-btn,.mx-card-hit,.mx-mini-btn{font:inherit;cursor:pointer;transition:transform .16s ease,opacity .16s ease,border-color .16s ease,background-color .16s ease;}
.mx-btn:hover,.mx-nav-btn:hover,.mx-category-btn:hover,.mx-mini-btn:hover{transform:translateY(-1px);}
.mx-btn{min-height:42px;padding:0 16px;border-radius:999px;border:1px solid transparent;display:inline-flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:600;}
.mx-btn-primary{background:#171717;color:#fffdf8;}
.mx-btn-secondary{background:rgba(255,255,255,.72);color:var(--mx-text);border-color:var(--mx-border);}
.mx-home-hero-media-frame{min-height:250px;border-radius:24px;overflow:hidden;background:rgba(255,255,255,.54);}
.mx-home-hero-media-frame img{width:100%;height:100%;display:block;object-fit:cover;}
.mx-panel{padding:16px;border-radius:24px;display:grid;gap:12px;}
.mx-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;}
.mx-section-title{margin:0;font-size:1.02rem;font-weight:700;letter-spacing:-.03em;}
.mx-section-sub{margin:0;font-size:.8rem;}
.mx-categories{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;}
.mx-category-btn{padding:12px 8px;border-radius:20px;border:1px solid var(--mx-border);background:rgba(255,255,255,.64);box-shadow:var(--mx-shadow);display:grid;gap:8px;justify-items:center;text-align:center;}
.mx-category-btn.is-active{background:#fffefb;border-color:rgba(200,162,74,.24);}
.mx-category-icon{width:40px;height:40px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;background:var(--mx-accent-soft);color:var(--mx-text);font-size:1rem;}
.mx-category-label{font-size:.72rem;font-weight:600;line-height:1.2;color:rgba(23,23,23,.78);}
.mx-game-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.mx-game-card{position:relative;padding:12px;border-radius:24px;border:1px solid var(--mx-border);background:linear-gradient(180deg,var(--mx-surface-strong),var(--mx-surface));box-shadow:var(--mx-shadow);display:grid;gap:12px;overflow:hidden;}
.mx-card-hit{position:absolute;inset:0;z-index:3;border:0;background:transparent;opacity:0;}
.mx-game-thumb{height:128px;border-radius:18px;background:linear-gradient(180deg,rgba(200,162,74,.16),rgba(200,162,74,.08));display:grid;place-items:center;}
.mx-game-thumb .home-game-card-glyph,
.mx-game-thumb .mx-game-glyph{width:72px;height:72px;border-radius:22px;background:rgba(255,255,255,.82);box-shadow:var(--mx-shadow);}
.mx-game-foot{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.mx-game-title{margin:0;font-size:1rem;font-weight:700;letter-spacing:-.03em;}
.mx-game-sub{margin:4px 0 0;font-size:.78rem;line-height:1.35;}
.mx-game-chip{min-height:24px;padding:0 8px;border-radius:999px;border:1px solid rgba(200,162,74,.24);background:rgba(200,162,74,.12);display:inline-flex;align-items:center;font-size:.64rem;font-weight:700;color:#6e5719;}
.mx-row{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;}
.mx-row::-webkit-scrollbar{display:none;}
.mx-row .mx-game-card{min-width:250px;max-width:250px;flex:0 0 auto;}
.mx-mini-btn{width:34px;height:34px;border-radius:999px;border:1px solid var(--mx-border);background:rgba(255,255,255,.74);color:var(--mx-text-soft);display:inline-flex;align-items:center;justify-content:center;}
.mx-progress{display:grid;gap:6px;}
.mx-progress-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:.68rem;color:var(--mx-text-faint);}
.mx-progress-track{height:9px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden;}
.mx-progress-fill{height:100%;border-radius:inherit;background:var(--mx-accent);}
.mx-bottom-nav{position:sticky;bottom:0;z-index:9;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));border-radius:24px;}
.mx-bottom-nav-row{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;}
.mx-nav-btn{border:0;background:transparent;color:var(--mx-text-faint);display:grid;justify-items:center;gap:4px;font-size:.68rem;font-weight:600;}
.mx-nav-bubble{width:40px;height:40px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;background:transparent;font-size:1rem;}
.mx-nav-btn.is-active{color:var(--mx-text);}
.mx-nav-btn.is-active .mx-nav-bubble{background:var(--mx-accent-soft);}
.mx-play-wrap{transform:translateY(-16px);}
.mx-play-fab{width:52px;height:52px;border:0;border-radius:999px;background:#171717;color:#fffdf8;box-shadow:var(--mx-shadow-strong);font-size:1.05rem;cursor:pointer;}
@media (max-width:980px){.mx-home-hero{grid-template-columns:1fr;}.mx-home-hero-media-frame{min-height:210px;}}
@media (max-width:760px){
  .app-shell,.app-shell.app-shell-home,.app-shell:not(.app-shell-home){width:min(100%,calc(100% - 14px));margin:8px auto 16px;}
  .home-screen.home-library-screen.is-catalog.mx-home-screen{gap:12px;}
  .home-library-header{padding:12px 14px;border-radius:20px;}
  .mx-home-search{min-height:50px;padding:0 14px;border-radius:18px;}
  .mx-home-hero{padding:16px;gap:14px;border-radius:24px;}
  .mx-home-hero-title{font-size:clamp(1.54rem,8vw,2.08rem);}
  .mx-home-hero-text{font-size:.86rem;line-height:1.45;max-width:none;}
  .mx-home-hero-media-frame{min-height:170px;border-radius:20px;}
  .mx-panel,.mx-bottom-nav,.mx-game-card{border-radius:20px;}
  .mx-categories{gap:8px;}
  .mx-category-btn{padding:10px 6px;border-radius:18px;}
  .mx-category-icon{width:34px;height:34px;border-radius:12px;font-size:.84rem;}
  .mx-category-label{font-size:.62rem;}
  .mx-game-grid{gap:8px;}
  .mx-game-card{padding:10px;gap:10px;}
  .mx-game-thumb{height:102px;border-radius:16px;}
  .mx-game-thumb .home-game-card-glyph,.mx-game-thumb .mx-game-glyph{width:56px;height:56px;border-radius:18px;}
  .mx-row .mx-game-card{min-width:220px;max-width:220px;}
  .mx-bottom-nav{padding-inline:10px;}
  .mx-nav-bubble{width:36px;height:36px;border-radius:12px;}
  .mx-play-wrap{transform:translateY(-12px);}
  .mx-play-fab{width:46px;height:46px;}
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
  if(["trafico","tictactoe","connect4","memory"].includes(id)) return "rapidos";
  if(["parchis","damas","billar","escaleras-serpientes","sokoban","buscaminas"].includes(id)) return "mesa";
  if(["billar","tanques","futbol-turnos"].includes(id)) return "punteria";
  if(["parchis","escaleras-serpientes","futbol-turnos","connect4","memory"].includes(id)) return "familia";
  return "all";
}
function getTag(id){
  const tags={trafico:"Rápido",billar:"Precisión",tanques:"Duelo",buscaminas:"Clásico",sokoban:"Lógica",parchis:"Casa",damas:"Tablero",tictactoe:"Express",connect4:"Mesa","futbol-turnos":"Turnos","escaleras-serpientes":"Familia",memory:"Parejas"};
  return tags[id]||"Local";
}
function collectGames(screen){
  return Array.from(screen.querySelectorAll(".home-game-card")).map((card)=>{
    const hit=card.querySelector(".home-game-card-hit");
    return {
      id: hit?.dataset.gameId || "",
      title: card.querySelector(".home-game-card-title")?.textContent?.trim() || "Juego",
      subtitle: card.querySelector(".home-game-card-subtitle")?.textContent?.trim() || "Partida local",
      glyph: card.querySelector(".home-game-card-glyph")?.outerHTML || "<div class=\"mx-game-glyph\"></div>",
      category: getCategoryForGame(hit?.dataset.gameId || ""),
      tag: getTag(hit?.dataset.gameId || "")
    };
  });
}
function getHomeData(screen){
  const header=screen.querySelector(".home-library-header");
  return {
    headerHtml: header ? header.outerHTML : "",
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
function buildSearch(){
  return `<section class="mx-home-search" aria-label="Buscar juegos"><span class="mx-home-search-icon" aria-hidden="true">⌕</span><input class="mx-home-search-input" type="search" value="${escapeHtml(HOME_STATE.search)}" placeholder="Buscar parchís, billar, tráfico o damas" data-home-search /></section>`;
}
function buildHero(game, heroImage){
  const openId=game?.id || "";
  return `<section class="mx-home-hero"><div class="mx-home-hero-copy"><p class="mx-home-kicker">Minijuegos</p><h2 class="mx-home-hero-title">Partidas locales para jugar en casa</h2><p class="mx-home-hero-text">Entrad rápido, elegid un juego y empezad sin complicaros.</p><div class="mx-home-hero-actions"><button class="mx-btn mx-btn-primary" data-action="open-game" data-game-id="${escapeHtml(openId)}">Jugar ahora</button><button class="mx-btn mx-btn-secondary" data-home-scroll="juegos">Ver juegos</button></div></div><div class="mx-home-hero-media-frame"><img src="${escapeHtml(heroImage)}" alt="Minijuegos para jugar en casa" /></div></section>`;
}
function buildCategories(){
  return `<section class="mx-panel" id="categorias"><div class="mx-section-head"><h3 class="mx-section-title">Tipos</h3></div><div class="mx-categories">${CATEGORY_ITEMS.map((item)=>`<button class="mx-category-btn ${HOME_STATE.filter===item.key?"is-active":""}" data-home-filter="${item.key}"><span class="mx-category-icon" aria-hidden="true">${item.icon}</span><span class="mx-category-label">${escapeHtml(item.name)}</span></button>`).join("")}</div></section>`;
}
function buildGameCard(game, extra=""){
  return `<article class="mx-game-card">${extra}<button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${game.glyph}</div><div class="mx-game-foot"><div><h4 class="mx-game-title">${escapeHtml(game.title)}</h4><p class="mx-game-sub">${escapeHtml(game.subtitle)}</p></div><span class="mx-game-chip">${escapeHtml(game.tag)}</span></div></article>`;
}
function buildContinueCard(game, progress){
  return `<article class="mx-game-card"><button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${game.glyph}</div><div><h4 class="mx-game-title">${escapeHtml(game.title)}</h4><p class="mx-game-sub">${escapeHtml(progress.meta)}</p></div><div class="mx-progress"><div class="mx-progress-head"><span>Partida</span><span>${progress.progress}%</span></div><div class="mx-progress-track"><div class="mx-progress-fill" style="width:${progress.progress}%"></div></div></div></article>`;
}
function buildRow(title, id, games){
  if(!games.length) return "";
  return `<section class="mx-panel" id="${id}"><div class="mx-section-head"><h3 class="mx-section-title">${title}</h3></div><div class="mx-row">${games.map((game)=>buildGameCard(game)).join("")}</div></section>`;
}
function buildContinue(games){
  if(!games.length) return "";
  return `<section class="mx-panel"><div class="mx-section-head"><h3 class="mx-section-title">Seguir</h3></div><div class="mx-row">${games.map(({game,meta,progress})=>buildContinueCard(game,{meta,progress})).join("")}</div></section>`;
}
function buildGrid(games){
  return `<section class="mx-panel" id="juegos"><div class="mx-section-head"><h3 class="mx-section-title">Juegos</h3></div><div class="mx-game-grid">${games.map((game)=>buildGameCard(game)).join("")}</div></section>`;
}
function buildBottomNav(playId){
  return `<nav class="mx-bottom-nav"><div class="mx-bottom-nav-row"><button class="mx-nav-btn is-active" data-home-scroll="top"><span class="mx-nav-bubble">⌂</span><span>Inicio</span></button><button class="mx-nav-btn" data-home-scroll="categorias"><span class="mx-nav-bubble">◫</span><span>Tipos</span></button><div class="mx-play-wrap"><button class="mx-play-fab" data-action="open-game" data-game-id="${escapeHtml(playId)}">▶</button></div><button class="mx-nav-btn" data-home-scroll="seguir"><span class="mx-nav-bubble">↺</span><span>Seguir</span></button><button class="mx-nav-btn" data-home-scroll="juegos"><span class="mx-nav-bubble">◎</span><span>Juegos</span></button></div></nav>`;
}
function renderTransformedHome(screen,data){
  const filtered=filterGames(data.games);
  const visible=filtered.length?filtered:data.games;
  const heroGame=data.games.find((g)=>g.id===HERO_ID) || visible[0] || data.games[0];
  const highlighted=findByIds(visible, FEATURED_IDS);
  const continueGames=CONTINUE_ITEMS.map((item)=>{ const game=data.games.find((g)=>g.id===item.id); return game?{game,...item}:null; }).filter(Boolean);
  screen.classList.add("mx-home-screen");
  screen.innerHTML=`${data.headerHtml}${buildSearch()}${buildHero(heroGame,data.heroImage)}${buildCategories()}${buildRow("Para empezar","top",highlighted)}${buildContinue(continueGames)}${buildGrid(visible)}${buildBottomNav(heroGame?.id || "")}`;
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
    const target=event.target instanceof Element ? event.target.closest("[data-home-filter],[data-home-scroll]") : null;
    if(!target) return;
    if(target.hasAttribute("data-home-filter")){
      const next=target.getAttribute("data-home-filter") || "all";
      HOME_STATE.filter=HOME_STATE.filter===next ? "all" : next;
      rerenderHome();
      return;
    }
    const map={top:".home-library-header",categorias:"#categorias",seguir:".mx-panel:nth-of-type(5)",juegos:"#juegos"};
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
