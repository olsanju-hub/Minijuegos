const STYLE_ID = "minijuegos-appearance-refresh";
const OBSERVER_KEY = "__minijuegosAppearanceObserver";
const HOME_STATE = { filter: "all", showAll: false };

const FEATURED_IDS = ["trafico", "tanques", "futbol-turnos", "damas"];
const CATEGORY_ITEMS = [
  { key: "all", name: "Todo", icon: "◌" },
  { key: "arcade", name: "Arcade", icon: "◈" },
  { key: "mesa", name: "Mesa", icon: "▦" },
  { key: "logica", name: "Lógica", icon: "◫" },
  { key: "party", name: "Party", icon: "✦" }
];

const DEFAULT_COVER_TITLE = "CATALOGO FAMILIAR EN LOCAL";
const DEFAULT_COVER_SUBTITLE = "Flia. Olivero Escorcia";

const CSS = String.raw`
:root {
  --mx-bg:#f3f0ea;
  --mx-bg-soft:#faf8f4;
  --mx-surface:rgba(255,255,255,.84);
  --mx-surface-strong:rgba(255,255,255,.94);
  --mx-border:rgba(56,49,43,.09);
  --mx-text:#26221e;
  --mx-text-soft:#6a625a;
  --mx-accent:#7e8f80;
  --mx-accent-strong:#5f705f;
  --mx-chip:#e7ece7;
  --mx-shadow:0 10px 30px rgba(38,34,30,.08);
  --mx-radius-card:24px;
  --mx-radius-btn:16px;
  --mx-radius-pill:999px;
}
html,body{background:linear-gradient(180deg,#f5f2ec 0%,#f0ece5 100%);}
body,body:not(.is-home-screen){
  color:var(--mx-text);
  background:
    radial-gradient(circle at 12% 8%,rgba(255,255,255,.8),rgba(255,255,255,0) 24%),
    radial-gradient(circle at 84% 18%,rgba(126,143,128,.10),rgba(126,143,128,0) 18%),
    linear-gradient(180deg,#f5f2ec 0%,#efebe4 56%,#faf7f2 100%);
}
.bg-layer,body:not(.is-home-screen) .bg-layer{
  background:
    radial-gradient(circle at 10% 10%,rgba(255,255,255,.56),rgba(255,255,255,0) 22%),
    radial-gradient(circle at 82% 20%,rgba(126,143,128,.08),rgba(126,143,128,0) 18%);
}
.app-shell,.app-shell.app-shell-home,.app-shell:not(.app-shell-home){width:min(1280px,calc(100% - 24px));margin:12px auto 20px;}
.card,.block,.modal,.topbar,.config-card,.config-card-modern,.board-wrap,.screen .card,.mx-home-cover,.mx-panel,.mx-game-card{
  border:1px solid var(--mx-border);
  background:linear-gradient(180deg,var(--mx-surface-strong) 0%,var(--mx-surface) 100%);
  box-shadow:var(--mx-shadow);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
}
.home-library-header{display:none !important;}
.btn,.btn-primary,.btn-secondary,.btn-ghost,.btn-icon,.pill,.mx-category-btn,.mx-section-link{font-family:inherit;}
.btn,.btn-primary,.btn-secondary,.btn-ghost{min-height:46px;height:46px;padding:0 16px;border-radius:var(--mx-radius-btn);border:1px solid var(--mx-border);font-size:.92rem;font-weight:650;letter-spacing:-.01em;}
.btn-primary{background:linear-gradient(180deg,var(--mx-accent) 0%,var(--mx-accent-strong) 100%);color:#f8faf7;border-color:rgba(95,112,95,.2);}
.btn-secondary,.pill,.home-note-pill,.home-note-pill.is-soft,.mx-section-link,.home-games-toggle,.home-rack-arrow,.home-mobile-drawer-item{background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(231,236,231,.86) 100%);color:var(--mx-text);border-color:var(--mx-border);}
.btn-icon{width:42px;height:42px;min-width:42px;padding:0;border-radius:14px;border:1px solid var(--mx-border);background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(231,236,231,.86) 100%);color:var(--mx-text);display:inline-flex;align-items:center;justify-content:center;}
.pill.is-active,.mx-category-btn.is-active{background:linear-gradient(180deg,var(--mx-accent) 0%,var(--mx-accent-strong) 100%);color:#f8faf7;border-color:rgba(95,112,95,.2);}
.topbar,.app-shell:not(.app-shell-home) .topbar{padding:14px 16px;border-radius:22px;}
.input,.select{border:1px solid var(--mx-border);border-radius:15px;background:rgba(255,255,255,.78);}
.home-screen.home-library-screen.is-catalog.mx-home-screen{display:grid;gap:18px;}
.mx-home-cover{position:relative;padding:0;overflow:hidden;border-radius:28px;}
.mx-home-cover img{width:100%;height:auto;min-height:220px;max-height:360px;object-fit:cover;display:block;}
.mx-home-cover-copy{position:absolute;left:20px;bottom:18px;display:grid;gap:4px;max-width:min(72%,680px);pointer-events:none;}
.mx-home-cover-title{margin:0;color:#ffffff;font-size:clamp(1.2rem,2.8vw,2rem);font-weight:800;letter-spacing:.14em;line-height:1.02;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,.24);}
.mx-home-cover-subtitle{margin:0;color:rgba(255,255,255,.96);font-size:clamp(1.1rem,2.2vw,1.6rem);font-weight:500;line-height:1.08;text-shadow:0 2px 12px rgba(0,0,0,.22);}
.mx-panel{padding:16px;border-radius:var(--mx-radius-card);display:grid;gap:12px;}
.mx-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px;}
.mx-section-title{margin:0;font-size:1.02rem;font-weight:700;letter-spacing:-.03em;color:var(--mx-text);}
.mx-section-link{min-height:34px;padding:0 12px;border-radius:var(--mx-radius-pill);display:inline-flex;align-items:center;justify-content:center;font-size:.76rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--mx-border);}
.mx-categories{display:flex;gap:10px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;}.mx-categories::-webkit-scrollbar{display:none;}
.mx-category-btn{min-width:92px;padding:12px 10px;border-radius:20px;display:grid;justify-items:center;gap:8px;color:var(--mx-text);background:linear-gradient(180deg,rgba(231,236,231,.92) 0%,rgba(220,227,220,.82) 100%);}
.mx-category-icon{width:36px;height:36px;border-radius:14px;background:rgba(255,255,255,.58);display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;}
.mx-featured-grid,.mx-catalog-grid,.mx-continue-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.mx-game-card{position:relative;padding:12px;border-radius:24px;display:grid;gap:12px;overflow:hidden;}
.mx-card-hit{position:absolute;inset:0;z-index:3;border:0;background:transparent;opacity:0;cursor:pointer;}
.mx-game-thumb{height:116px;border-radius:18px;background:linear-gradient(180deg,rgba(231,236,231,.96) 0%,rgba(220,227,220,.84) 100%);display:grid;place-items:center;overflow:hidden;border:1px solid var(--mx-border);}
.mx-game-thumb .home-game-card-glyph,.mx-game-thumb .mx-game-glyph{width:68px;height:68px;border-radius:20px;background:rgba(255,255,255,.88);box-shadow:0 10px 18px rgba(38,34,30,.08);}
.mx-game-body{display:none;}
.mx-game-meta{display:flex;justify-content:center;}.mx-game-chip{min-height:24px;padding:0 8px;border-radius:var(--mx-radius-pill);background:linear-gradient(180deg,rgba(231,236,231,.96) 0%,rgba(220,227,220,.84) 100%);color:#556456;border:1px solid rgba(95,112,95,.14);display:inline-flex;align-items:center;font-size:.64rem;font-weight:700;}
@media (max-width:760px){
  .app-shell,.app-shell.app-shell-home,.app-shell:not(.app-shell-home){width:min(100%,calc(100% - 14px));margin:8px auto 16px;}
  .home-screen.home-library-screen.is-catalog.mx-home-screen{gap:14px;}
  .mx-home-cover,.mx-panel,.mx-game-card,.config-card,.config-card-modern,.topbar,.modal,.board-wrap{border-radius:20px;}
  .mx-home-cover img{min-height:180px;max-height:280px;}
  .mx-home-cover-copy{left:14px;bottom:12px;max-width:78%;}
  .mx-home-cover-title{font-size:1rem;letter-spacing:.11em;}
  .mx-home-cover-subtitle{font-size:1rem;}
  .mx-featured-grid,.mx-catalog-grid,.mx-continue-grid{gap:8px;}
  .mx-game-card{padding:10px;gap:10px;}
  .mx-game-thumb{height:96px;border-radius:16px;}
  .mx-game-thumb .home-game-card-glyph,.mx-game-thumb .mx-game-glyph{width:54px;height:54px;border-radius:16px;}
  .mx-category-btn{min-width:82px;padding:10px 8px;border-radius:18px;}
  .mx-category-icon{width:32px;height:32px;border-radius:12px;}
  .mx-category-label{font-size:.64rem;}
}
`;

function escapeHtml(value){return String(value).replace(/[&<>\"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
function ensureStyle(){if(typeof document==="undefined") return; let style=document.getElementById(STYLE_ID); if(!style){style=document.createElement("style");style.id=STYLE_ID;document.head.appendChild(style);} style.textContent=CSS;}
function getAppRoot(){return document.getElementById("app");}
function getCategoryForGame(id){if(["trafico","tanques","futbol-turnos"].includes(id)) return "arcade"; if(["parchis","damas","billar","connect4","tictactoe","escaleras-serpientes"].includes(id)) return "mesa"; if(["buscaminas","sokoban"].includes(id)) return "logica"; if(["memory","impostor","preguntas-rapidas","mimica-retos"].includes(id)) return "party"; return "mesa";}
function getTag(id){const tags={trafico:"1 jugador",tanques:"2 jugadores",billar:"2 jugadores",damas:"estrategia",parchis:"local",connect4:"rápido",tictactoe:"rápido",buscaminas:"1 jugador",sokoban:"lógica","futbol-turnos":"2 jugadores",memory:"party",impostor:"grupo","preguntas-rapidas":"party","mimica-retos":"party"}; return tags[id]||"local";}
function collectGames(screen){return Array.from(screen.querySelectorAll(".home-game-card")).map((card)=>{const hit=card.querySelector(".home-game-card-hit"); const id=hit?.dataset.gameId||""; return {id,title:card.querySelector(".home-game-card-title")?.textContent?.trim()||"Juego",subtitle:card.querySelector(".home-game-card-subtitle")?.textContent?.trim()||"Partida local",glyph:card.querySelector(".home-game-card-glyph")?.outerHTML||"<div class=\"mx-game-glyph\"></div>",category:getCategoryForGame(id),tag:getTag(id)};});}
function extractHeaderTexts(screen){const text=(screen.querySelector(".home-library-header")?.textContent||"").replace(/\s+/g," ").trim(); const upper=text.match(/CATALOGO FAMILIAR EN LOCAL/i)?.[0] || DEFAULT_COVER_TITLE; const subtitleMatch=text.match(/Flia\.[^0-9]+/i); return {coverTitle:upper,coverSubtitle:subtitleMatch?.[0]?.trim()||DEFAULT_COVER_SUBTITLE};}
function getHomeData(screen){return {heroImage:screen.querySelector(".home-family-art-image")?.getAttribute("src")||"./assets/home-hero-family.png",games:collectGames(screen),...extractHeaderTexts(screen)};}
function filterGames(games){return games.filter((game)=>HOME_STATE.filter==="all"||game.category===HOME_STATE.filter);}
function findByIds(games,ids){return ids.map((id)=>games.find((game)=>game.id===id)).filter(Boolean);}
function buildCover(heroImage,title,subtitle){return `<section class="mx-home-cover"><img src="${escapeHtml(heroImage)}" alt="Cabecera de Minijuegos" /><div class="mx-home-cover-copy"><p class="mx-home-cover-title">${escapeHtml(title)}</p><p class="mx-home-cover-subtitle">${escapeHtml(subtitle)}</p></div></section>`;}
function buildCategories(){return `<section class="mx-panel" id="categorias"><div class="mx-categories">${CATEGORY_ITEMS.filter((item)=>item.key!=="all").map((item)=>`<button class="mx-category-btn ${HOME_STATE.filter===item.key?"is-active":""}" data-home-filter="${item.key}"><span class="mx-category-icon" aria-hidden="true">${item.icon}</span><span class="mx-category-label">${escapeHtml(item.name)}</span></button>`).join("")}</div></section>`;}
function buildCard(game){return `<article class="mx-game-card"><button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${game.glyph}</div><div class="mx-game-meta"><span class="mx-game-chip">${escapeHtml(game.tag)}</span></div></article>`;}
function buildContinueCard(game){return `<article class="mx-game-card"><button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${game.glyph}</div><div class="mx-game-meta"><span class="mx-game-chip">${escapeHtml(game.tag)}</span></div></article>`;}
function buildFeatured(games){return `<section class="mx-panel"><div class="mx-section-head"><h3 class="mx-section-title">Juegos destacados</h3></div><div class="mx-featured-grid">${games.map(buildCard).join("")}</div></section>`;}
function buildCatalog(games){const visible=HOME_STATE.showAll?games:games.slice(0,6); return `<section class="mx-panel" id="juegos"><div class="mx-section-head"><h3 class="mx-section-title">Todos los juegos</h3><button class="mx-section-link" data-home-toggle-all>${HOME_STATE.showAll?"Ver menos":`Ver los ${games.length}`}</button></div><div class="mx-catalog-grid">${visible.map(buildCard).join("")}</div></section>`;}
function buildContinue(games){if(!games.length) return ""; return `<section class="mx-panel" id="seguir"><div class="mx-section-head"><h3 class="mx-section-title">Seguir</h3></div><div class="mx-continue-grid">${games.map(buildContinueCard).join("")}</div></section>`;}
function renderTransformedHome(screen,data){const visible=filterGames(data.games); const featured=findByIds(visible.length?visible:data.games,FEATURED_IDS); const continueGames=findByIds(data.games,["futbol-turnos","buscaminas"]); const base=visible.length?visible:data.games; screen.classList.add("mx-home-screen"); screen.innerHTML=`${buildCover(data.heroImage,data.coverTitle,data.coverSubtitle)}${buildCategories()}${buildFeatured(featured.length?featured:base.slice(0,4))}${buildContinue(continueGames)}${buildCatalog(base)}<div id="ranking"></div><div id="profile"></div>`;}
function enhanceHomeScreen(screen){if(!screen||screen.dataset.homeBusy==="1") return; if(!screen.querySelector(".home-game-card")) return; screen.dataset.homeBusy="1"; try{const data=getHomeData(screen); screen.__homeData=data; renderTransformedHome(screen,data);} finally{delete screen.dataset.homeBusy;}}
function rerenderHome(){const screen=getAppRoot()?.querySelector(".home-screen.home-library-screen.is-catalog.mx-home-screen"); if(!screen||!screen.__homeData) return; renderTransformedHome(screen,screen.__homeData);}
function bindHomeEvents(){if(document.body.dataset.mxHomeEventsBound==="1") return; document.body.dataset.mxHomeEventsBound="1"; document.addEventListener("click",(event)=>{const target=event.target instanceof Element ? event.target.closest("[data-home-filter],[data-home-toggle-all]") : null; if(!target) return; if(target.hasAttribute("data-home-filter")){const next=target.getAttribute("data-home-filter")||"all"; HOME_STATE.filter=HOME_STATE.filter===next?"all":next; rerenderHome(); return;} if(target.hasAttribute("data-home-toggle-all")){HOME_STATE.showAll=!HOME_STATE.showAll; rerenderHome();}});}
function installObserver(){const root=getAppRoot(); if(!root||window[OBSERVER_KEY]) return; const observer=new MutationObserver(()=>{const home=root.querySelector(".home-screen.home-library-screen.is-catalog"); if(home&&!home.classList.contains("mx-home-screen")) enhanceHomeScreen(home);}); observer.observe(root,{childList:true,subtree:true}); window[OBSERVER_KEY]=observer; const home=root.querySelector(".home-screen.home-library-screen.is-catalog"); if(home) enhanceHomeScreen(home);}
export function applyAppearanceRefresh(){if(typeof document==="undefined") return; ensureStyle(); bindHomeEvents(); installObserver();}
