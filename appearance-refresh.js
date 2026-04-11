const STYLE_ID = "minijuegos-appearance-refresh";
const OBSERVER_KEY = "__minijuegosAppearanceObserver";

const DEFAULT_COVER_TITLE = "MINIJUEGOS";

const CSS = String.raw`
:root {
  --mx-bg:#f3f0ea;
  --mx-surface:rgba(255,255,255,.84);
  --mx-surface-strong:rgba(255,255,255,.94);
  --mx-border:rgba(56,49,43,.09);
  --mx-text:#26221e;
  --mx-accent:#7e8f80;
  --mx-accent-strong:#5f705f;
  --mx-shadow:0 10px 30px rgba(38,34,30,.08);
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
.card,.block,.modal,.topbar,.config-card,.config-card-modern,.board-wrap,.screen .card,.mx-home-cover,.mx-game-card{
  border:1px solid var(--mx-border);
  background:linear-gradient(180deg,var(--mx-surface-strong) 0%,var(--mx-surface) 100%);
  box-shadow:var(--mx-shadow);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
}
.home-library-header{display:none !important;}
.home-screen.home-library-screen.is-catalog.mx-home-screen{display:grid;gap:18px;}
.mx-home-cover{position:relative;padding:0;overflow:hidden;border-radius:28px;}
.mx-home-cover img{width:100%;height:auto;min-height:220px;max-height:360px;object-fit:cover;display:block;}
.mx-home-cover-copy{position:absolute;left:20px;bottom:18px;display:grid;gap:0;max-width:min(72%,680px);pointer-events:none;}
.mx-home-cover-title{margin:0;color:#ffffff;font-size:clamp(1.2rem,2.8vw,2rem);font-weight:800;letter-spacing:.14em;line-height:1.02;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,.24);}
.mx-games-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;}
.mx-game-card{position:relative;padding:12px;border-radius:24px;display:grid;place-items:center;overflow:hidden;min-height:140px;}
.mx-card-hit{position:absolute;inset:0;z-index:3;border:0;background:transparent;opacity:0;cursor:pointer;}
.mx-game-thumb{width:100%;height:100%;min-height:116px;border-radius:18px;background:linear-gradient(180deg,rgba(231,236,231,.96) 0%,rgba(220,227,220,.84) 100%);display:grid;place-items:center;overflow:hidden;border:1px solid var(--mx-border);}
.mx-game-icon{width:76px;height:76px;display:block;filter:drop-shadow(0 8px 12px rgba(38,34,30,.08));}
@media (max-width:980px){.mx-games-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}
@media (max-width:760px){
  .app-shell,.app-shell.app-shell-home,.app-shell:not(.app-shell-home){width:min(100%,calc(100% - 14px));margin:8px auto 16px;}
  .home-screen.home-library-screen.is-catalog.mx-home-screen{gap:14px;}
  .mx-home-cover,.mx-game-card,.config-card,.config-card-modern,.topbar,.modal,.board-wrap{border-radius:20px;}
  .mx-home-cover img{min-height:180px;max-height:280px;}
  .mx-home-cover-copy{left:14px;bottom:12px;max-width:78%;}
  .mx-home-cover-title{font-size:1rem;letter-spacing:.11em;}
  .mx-games-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
  .mx-game-card{padding:10px;min-height:116px;}
  .mx-game-thumb{min-height:96px;border-radius:16px;}
  .mx-game-icon{width:60px;height:60px;}
}
`;

function escapeHtml(value){return String(value).replace(/[&<>\"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
function ensureStyle(){if(typeof document==="undefined") return; let style=document.getElementById(STYLE_ID); if(!style){style=document.createElement("style");style.id=STYLE_ID;document.head.appendChild(style);} style.textContent=CSS;}
function getAppRoot(){return document.getElementById("app");}
function collectGames(screen){return Array.from(screen.querySelectorAll(".home-game-card")).map((card)=>{const hit=card.querySelector(".home-game-card-hit"); const id=hit?.dataset.gameId||""; return {id,title:card.querySelector(".home-game-card-title")?.textContent?.trim()||"Juego"};});}
function getHomeData(screen){return {heroImage:screen.querySelector(".home-family-art-image")?.getAttribute("src")||"./assets/home-hero-family.png",games:collectGames(screen),coverTitle:DEFAULT_COVER_TITLE};}
function buildCover(heroImage,title){return `<section class="mx-home-cover"><img src="${escapeHtml(heroImage)}" alt="Cabecera de Minijuegos" /><div class="mx-home-cover-copy"><p class="mx-home-cover-title">${escapeHtml(title)}</p></div></section>`;}
function renderGameIcon(gameId){
  const icons={
    tictactoe:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="tt-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffaf2"/><stop offset="100%" stop-color="#efe7d8"/></linearGradient></defs><rect x="8" y="8" width="64" height="64" rx="18" fill="url(#tt-bg)" stroke="#d8cbb5"/><path d="M28 20V60M52 20V60M20 28H60M20 52H60" stroke="#bfae97" stroke-width="3.2" stroke-linecap="round"/><path d="M23 23L33 33M33 23L23 33" stroke="#d66c55" stroke-width="3.4" stroke-linecap="round"/><circle cx="40" cy="40" r="7" fill="none" stroke="#5f8f70" stroke-width="3.4"/><path d="M47 47L57 57M57 47L47 57" stroke="#d6ad43" stroke-width="3.4" stroke-linecap="round"/></svg>`,
    connect4:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="14" y="12" width="52" height="56" rx="16" fill="#537962" stroke="#3d5d49"/><g fill="#f9f6ee"><circle cx="28" cy="28" r="5.4"/><circle cx="40" cy="28" r="5.4"/><circle cx="52" cy="28" r="5.4"/><circle cx="28" cy="40" r="5.4"/><circle cx="40" cy="40" r="5.4"/><circle cx="52" cy="40" r="5.4"/><circle cx="28" cy="52" r="5.4"/><circle cx="40" cy="52" r="5.4"/><circle cx="52" cy="52" r="5.4"/></g><circle cx="28" cy="52" r="4.7" fill="#d56b55"/><circle cx="40" cy="40" r="4.7" fill="#e0b24b"/><circle cx="52" cy="28" r="4.7" fill="#7fa594"/></svg>`,
    damas:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="18" fill="#f8efdf" stroke="#d9c9ac"/><g><rect x="20" y="20" width="10" height="10" fill="#946a49"/><rect x="40" y="20" width="10" height="10" fill="#946a49"/><rect x="30" y="30" width="10" height="10" fill="#946a49"/><rect x="50" y="30" width="10" height="10" fill="#946a49"/><rect x="20" y="40" width="10" height="10" fill="#946a49"/><rect x="40" y="40" width="10" height="10" fill="#946a49"/><rect x="30" y="50" width="10" height="10" fill="#946a49"/><rect x="50" y="50" width="10" height="10" fill="#946a49"/></g><circle cx="34" cy="34" r="7.2" fill="#d56b55" stroke="#b55540"/><circle cx="46" cy="46" r="7.2" fill="#658d75" stroke="#4e725f"/></svg>`,
    parchis:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="18" fill="#fbf6eb" stroke="#d9ccb5"/><rect x="16" y="16" width="20" height="20" rx="6" fill="#eed0c8" stroke="#d8a69d"/><rect x="44" y="16" width="20" height="20" rx="6" fill="#dbe8f8" stroke="#aac2e6"/><rect x="16" y="44" width="20" height="20" rx="6" fill="#dcecdc" stroke="#a9c8ab"/><rect x="44" y="44" width="20" height="20" rx="6" fill="#f2e5b6" stroke="#d8c586"/><path d="M40 24L48 32H32Z" fill="#d56b55"/><path d="M48 32L40 40V24Z" fill="#6d95e8"/><path d="M40 40L32 32H48Z" fill="#e0b24b"/><path d="M32 32L40 24V40Z" fill="#6e8e76"/></svg>`,
    "escaleras-serpientes":`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="18" fill="#fff6e7" stroke="#e0d0b2"/><g opacity=".9"><rect x="18" y="18" width="11" height="11" fill="#f3d6c9"/><rect x="29" y="18" width="11" height="11" fill="#ffffff"/><rect x="40" y="18" width="11" height="11" fill="#dceaf7"/><rect x="51" y="18" width="11" height="11" fill="#ffffff"/><rect x="18" y="29" width="11" height="11" fill="#ffffff"/><rect x="29" y="29" width="11" height="11" fill="#f5e9be"/><rect x="40" y="29" width="11" height="11" fill="#ffffff"/><rect x="51" y="29" width="11" height="11" fill="#dceaf7"/></g><g stroke="#9b7a5a" stroke-width="3" stroke-linecap="round"><line x1="24" y1="58" x2="36" y2="34"/><line x1="30" y1="58" x2="42" y2="34"/><line x1="26" y1="52" x2="33" y2="53"/><line x1="30" y1="44" x2="37" y2="45"/></g><path d="M52 22Q43 28 46 36T34 57" fill="none" stroke="#8ab9d1" stroke-width="8" stroke-linecap="round"/><circle cx="52" cy="22" r="4.2" fill="#8ab9d1"/><circle cx="53.4" cy="20.8" r="1.1" fill="#fff"/><circle cx="53.5" cy="20.9" r=".35" fill="#111"/></svg>`,
    trafico:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="8" width="56" height="64" rx="18" fill="#3f474d"/><rect x="18" y="8" width="4" height="64" rx="2" fill="#d8c39d"/><rect x="58" y="8" width="4" height="64" rx="2" fill="#d8c39d"/><path d="M40 12V68" stroke="#f5edde" stroke-width="3.2" stroke-dasharray="6 6"/><rect x="26" y="16" width="10" height="18" rx="4" fill="#d56b55"/><rect x="44" y="38" width="12" height="20" rx="4" fill="#6d95e8"/><circle cx="28" cy="56" r="6" fill="#e0b24b" stroke="#c79629"/></svg>`,
    buscaminas:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="18" fill="#f8f0df" stroke="#d6c4a3"/><rect x="18" y="18" width="44" height="44" rx="10" fill="#ebe1ce" stroke="#ccb78f"/><g><rect x="22" y="22" width="10" height="10" rx="2" fill="#fffdf8" stroke="#cfc2a8"/><rect x="34" y="22" width="10" height="10" rx="2" fill="#fffdf8" stroke="#cfc2a8"/><rect x="46" y="22" width="10" height="10" rx="2" fill="#f1e7d6" stroke="#cfc2a8"/><rect x="22" y="34" width="10" height="10" rx="2" fill="#fffdf8" stroke="#cfc2a8"/><rect x="34" y="34" width="10" height="10" rx="2" fill="#f1e7d6" stroke="#cfc2a8"/></g><circle cx="38" cy="38" r="3.6" fill="#6c8fe0"/><path d="M52 36V52" stroke="#8b6145" stroke-width="2.1" stroke-linecap="round"/><path d="M52 37L60 40L52 43Z" fill="#d56b55"/><circle cx="28" cy="52" r="4" fill="#67503b"/><g stroke="#67503b" stroke-width="1.3" stroke-linecap="round"><line x1="28" y1="44" x2="28" y2="47"/><line x1="28" y1="57" x2="28" y2="60"/><line x1="20" y1="52" x2="23" y2="52"/><line x1="33" y1="52" x2="36" y2="52"/></g></svg>`,
    memory:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="14" width="22" height="32" rx="6" fill="#7ea0de" stroke="#5c7ebd" transform="rotate(-8 23 30)"/><rect x="30" y="12" width="22" height="32" rx="6" fill="#fffdf8" stroke="#d8cec1"/><rect x="42" y="18" width="22" height="32" rx="6" fill="#fffdf8" stroke="#d8cec1" transform="rotate(8 53 34)"/><circle cx="41" cy="28" r="5.2" fill="#e0b24b"/><path d="M53 26L56 32L62 33L57.4 37.2L58.4 43L53 40.2L47.6 43L48.6 37.2L44 33L50 32Z" fill="#6d95e8"/></svg>`,
    billar:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="12" width="60" height="56" rx="16" fill="#9c7348" stroke="#755332"/><rect x="17" y="18" width="46" height="44" rx="11" fill="#587f68" stroke="#dbe6db"/><g fill="#2c241d"><circle cx="17" cy="18" r="4"/><circle cx="40" cy="18" r="3.2"/><circle cx="63" cy="18" r="4"/><circle cx="17" cy="62" r="4"/><circle cx="40" cy="62" r="3.2"/><circle cx="63" cy="62" r="4"/></g><circle cx="28" cy="40" r="6" fill="#fffaf1" stroke="#d2c2a2"/><circle cx="45" cy="40" r="6" fill="#d56b55" stroke="#b45440"/><circle cx="53" cy="30" r="6" fill="#6d95e8" stroke="#4a72bd"/></svg>`,
    sokoban:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="18" fill="#f9f1df" stroke="#dcc7a3"/><rect x="18" y="18" width="44" height="44" rx="10" fill="#ecd7b5" stroke="#c9a87a"/><g fill="#c08b57"><rect x="22" y="22" width="9" height="9" rx="2"/><rect x="31" y="22" width="9" height="9" rx="2"/><rect x="40" y="22" width="9" height="9" rx="2"/><rect x="22" y="31" width="9" height="9" rx="2"/><rect x="40" y="31" width="9" height="9" rx="2"/><rect x="22" y="40" width="9" height="9" rx="2"/><rect x="31" y="40" width="9" height="9" rx="2"/><rect x="40" y="40" width="9" height="9" rx="2"/></g><rect x="31" y="31" width="9" height="9" rx="2" fill="#dfad63" stroke="#a86f36"/><circle cx="50" cy="36" r="4.5" fill="#6d95e8" stroke="#4b72bd"/><circle cx="28" cy="49" r="4.2" fill="none" stroke="#6a9b71" stroke-width="2"/></svg>`,
    "futbol-turnos":`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="12" width="60" height="56" rx="16" fill="#cfe4cd" stroke="#94b092"/><path d="M40 12V68M10 40H70M29 40a11 11 0 1 0 22 0a11 11 0 1 0 -22 0Z" fill="none" stroke="#f7fbf5" stroke-width="2"/><rect x="7" y="28" width="5" height="24" rx="2.5" fill="#f4eee3" stroke="#d2c1a2"/><rect x="68" y="28" width="5" height="24" rx="2.5" fill="#f4eee3" stroke="#d2c1a2"/><circle cx="29" cy="28" r="6" fill="#d56b55" stroke="#b45440"/><circle cx="51" cy="52" r="6" fill="#6d95e8" stroke="#4b72bd"/><circle cx="40" cy="40" r="4" fill="#fffaf1" stroke="#d0c09f"/></svg>`,
    tanques:`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="18" fill="#f6efe1" stroke="#d9c8a7"/><circle cx="24" cy="24" r="7" fill="#f4df9b"/><path d="M10 62V45C18 40 25 40 32 44.4C40 49.3 47 49.4 55 44C59 41.3 64 39.7 70 39V62Z" fill="#c8a16a" stroke="#a78251"/><path d="M35 39Q42 23 54 18" fill="none" stroke="#6d846d" stroke-width="2.2" stroke-dasharray="4 5" stroke-linecap="round"/><circle cx="54" cy="18" r="3.2" fill="#fffaf1" stroke="#d0c09f"/><g transform="translate(28 47)"><rect x="-10" y="5" width="20" height="6" rx="3" fill="#6c6258"/><rect x="-8" y="-2" width="16" height="8" rx="3" fill="#d56b55" stroke="#b45440"/><circle cx="0" cy="-2" r="5" fill="#d56b55" stroke="#b45440"/><line x1="2" y1="-2" x2="14" y2="-7" stroke="#6c6258" stroke-width="3" stroke-linecap="round"/></g><g transform="translate(54 49)"><rect x="-10" y="5" width="20" height="6" rx="3" fill="#6c6258"/><rect x="-8" y="-2" width="16" height="8" rx="3" fill="#6d95e8" stroke="#4b72bd"/><circle cx="0" cy="-2" r="5" fill="#6d95e8" stroke="#4b72bd"/><line x1="-2" y1="-2" x2="-14" y2="-7" stroke="#6c6258" stroke-width="3" stroke-linecap="round"/></g></svg>`
  };
  return icons[gameId]||`<svg class="mx-game-icon" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="18" fill="#fffdf8" stroke="#d8cec1"/><circle cx="40" cy="40" r="14" fill="#e7ece7" stroke="#b9c5b9"/></svg>`;
}
function buildCard(game){return `<article class="mx-game-card" data-game-id="${escapeHtml(game.id)}"><button class="mx-card-hit" data-action="open-game" data-game-id="${escapeHtml(game.id)}" aria-label="Abrir ${escapeHtml(game.title)}"></button><div class="mx-game-thumb">${renderGameIcon(game.id)}</div></article>`;}
function renderTransformedHome(screen,data){screen.classList.add("mx-home-screen"); screen.innerHTML=`${buildCover(data.heroImage,data.coverTitle)}<section class="mx-games-grid">${data.games.map(buildCard).join("")}</section>`;}
function enhanceHomeScreen(screen){if(!screen||screen.dataset.homeBusy==="1") return; if(!screen.querySelector(".home-game-card")) return; screen.dataset.homeBusy="1"; try{const data=getHomeData(screen); screen.__homeData=data; renderTransformedHome(screen,data);} finally{delete screen.dataset.homeBusy;}}
function installObserver(){const root=getAppRoot(); if(!root||window[OBSERVER_KEY]) return; const observer=new MutationObserver(()=>{const home=root.querySelector(".home-screen.home-library-screen.is-catalog"); if(home&&!home.classList.contains("mx-home-screen")) enhanceHomeScreen(home);}); observer.observe(root,{childList:true,subtree:true}); window[OBSERVER_KEY]=observer; const home=root.querySelector(".home-screen.home-library-screen.is-catalog"); if(home) enhanceHomeScreen(home);}
export function applyAppearanceRefresh(){if(typeof document==="undefined") return; ensureStyle(); installObserver();}
