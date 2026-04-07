const STRUCTURAL_REFRESH_STYLE_ID = "minijuegos-appearance-refresh";

const STRUCTURAL_REFRESH_CSS = String.raw`
:root {
  --app-bg-0:#0c1117;
  --app-bg-1:#111821;
  --app-bg-2:#17212c;
  --app-panel-0:rgba(17,24,33,.9);
  --app-panel-1:rgba(23,33,44,.86);
  --app-line-soft:rgba(255,255,255,.08);
  --app-line-strong:rgba(255,255,255,.14);
  --app-text-strong:#f3f7fb;
  --app-text-main:rgba(243,247,251,.92);
  --app-text-soft:rgba(243,247,251,.64);
  --app-text-faint:rgba(243,247,251,.46);
  --app-accent:#7cc4ff;
  --app-danger:#ff8d8d;
  --app-shadow-soft:0 18px 46px rgba(0,0,0,.22);
  --app-shadow-strong:0 24px 72px rgba(0,0,0,.34);
  --app-shell-max:min(1380px,calc(100vw - 28px));
  --app-shell-pad:clamp(14px,1.7vw,24px);
  --app-gap-lg:clamp(14px,1.6vw,22px);
  --app-radius-xl:28px;
  --app-radius-lg:22px;
  --app-radius-md:16px;
}
body {
  background:radial-gradient(circle at top left,rgba(124,196,255,.12),transparent 26%),radial-gradient(circle at top right,rgba(142,240,208,.08),transparent 24%),linear-gradient(180deg,var(--app-bg-0) 0%,var(--app-bg-1) 48%,var(--app-bg-2) 100%);
  color:var(--app-text-main);
}
.bg-layer {
  background:radial-gradient(circle at 12% 8%,rgba(124,196,255,.08),transparent 22%),radial-gradient(circle at 86% 14%,rgba(142,240,208,.06),transparent 20%),linear-gradient(180deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,0) 100%);
  opacity:1;
}
.app-shell {
  width:var(--app-shell-max)!important;
  max-width:var(--app-shell-max)!important;
  margin:0 auto!important;
  padding:var(--app-shell-pad)!important;
  min-height:100dvh;
  display:grid;
  align-content:start;
  gap:var(--app-gap-lg);
}
.screen { gap:var(--app-gap-lg)!important; }
.card {
  border-radius:var(--app-radius-xl);
  border:1px solid var(--app-line-soft);
  background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.025) 100%),linear-gradient(180deg,var(--app-panel-0) 0%,var(--app-panel-1) 100%);
  box-shadow:var(--app-shadow-soft);
  backdrop-filter:blur(18px);
}
.home-library-header,.app-shell-game .topbar,.config-card-modern,.modal {
  border:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,rgba(255,255,255,.045) 0%,rgba(255,255,255,.02) 100%),linear-gradient(180deg,rgba(16,23,31,.94),rgba(19,27,36,.94));
}
.home-catalog-title,.topbar-title,.config-title,.home-games-title,.modal-title,.result-title,.rule-label,.player-name { color:var(--app-text-strong)!important; }
.home-catalog-subtitle,.home-catalog-signature,.topbar-sub,.config-tagline,.home-games-subtitle,.info-line,.field-label,.block-title,.result-sub,.rule-text { color:var(--app-text-soft)!important; }
.home-note-pill,.config-badge,.home-game-card-tag,.pill {
  background:rgba(255,255,255,.06)!important;
  border:1px solid rgba(255,255,255,.1)!important;
  color:var(--app-text-soft)!important;
  box-shadow:none!important;
}
.home-family-hero {
  padding:0!important;
  overflow:hidden;
  min-height:clamp(210px,28vw,320px);
  border-radius:32px;
  border:1px solid rgba(255,255,255,.08);
  box-shadow:var(--app-shadow-strong);
  background:linear-gradient(180deg,rgba(11,17,23,.62),rgba(11,17,23,.44));
}
.home-family-art { position:relative; min-height:inherit; }
.home-family-art::before {
  content:""; position:absolute; inset:0; z-index:1; pointer-events:none;
  background:linear-gradient(120deg,rgba(8,12,16,.24),transparent 42%),linear-gradient(180deg,rgba(8,12,16,.08),rgba(8,12,16,.34));
}
.home-family-art::after {
  content:""; position:absolute; inset:auto 0 0; z-index:1; pointer-events:none; height:44%;
  background:linear-gradient(180deg,rgba(8,12,16,0) 0%,rgba(8,12,16,.4) 100%);
}
.home-family-art-image {
  width:100%; height:100%; display:block; object-fit:cover;
  filter:saturate(.84) contrast(1.04) brightness(.88);
}
.home-games-section,.config-screen { display:grid; gap:16px; }
.home-games-title { margin:0; font-size:clamp(1.34rem,2.4vw,1.9rem); line-height:1.04; }
.home-games-subtitle { margin:0; max-width:54ch; font-size:.92rem; line-height:1.5; }
.home-games-grid {
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:14px!important;
}
.home-game-card {
  position:relative;
  display:grid;
  place-items:center;
  min-height:152px;
  padding:18px!important;
  overflow:hidden;
  border-radius:24px;
  border:1px solid rgba(255,255,255,.08);
  background:radial-gradient(circle at top,rgba(255,255,255,.05),transparent 42%),linear-gradient(180deg,rgba(18,26,35,.94) 0%,rgba(13,19,26,.94) 100%);
  box-shadow:var(--app-shadow-soft);
}
.home-game-card::before {
  content:""; position:absolute; inset:1px; border-radius:inherit; z-index:0; pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,0));
}
.home-game-card::after {
  content:""; position:absolute; inset:auto 18px 0 18px; height:3px; border-radius:999px;
  background:linear-gradient(90deg,var(--home-game-accent,var(--app-accent)),transparent 78%); opacity:.9;
}
.home-game-card > * { position:relative; z-index:1; }
.home-game-card-hit { position:absolute; inset:0; z-index:3; opacity:0; cursor:pointer; }
.home-game-card-top { display:grid; place-items:center; width:100%; }
.home-game-card-glyph {
  width:86px; height:86px; padding:12px; border-radius:22px;
  background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));
  border:1px solid rgba(255,255,255,.08);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 10px 28px rgba(0,0,0,.2);
}
.home-game-card-glyph svg { width:100%; height:100%; display:block; }
.home-game-card-tag,.home-game-card-copy,.home-game-card-title,.home-game-card-subtitle { display:none!important; }
.config-card-modern {
  max-width:1120px!important; width:100%; margin:0 auto; padding:clamp(18px,2vw,28px)!important; border-radius:30px; box-shadow:var(--app-shadow-strong); display:grid; gap:18px;
}
.config-hero {
  display:grid; grid-template-columns:minmax(0,1fr) minmax(280px,.9fr); gap:18px; align-items:stretch;
}
.config-hero-media {
  min-height:clamp(220px,26vw,300px); border-radius:24px; overflow:hidden;
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02)),linear-gradient(180deg,rgba(22,31,41,.94),rgba(16,23,31,.94));
  border:1px solid rgba(255,255,255,.08);
}
.config-hero-media > * { width:100%; height:100%; }
.config-hero-copy { display:grid; align-content:center; gap:10px; padding:6px 2px; }
.config-title { margin:0; font-size:clamp(1.52rem,2.4vw,2.05rem); line-height:1.04; }
.config-stack { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
.config-stack > * { min-width:0; }
.config-stack > .block:only-child,.config-stack > .block:last-child:nth-child(odd) { grid-column:1 / -1; }
.block {
  padding:16px; border-radius:20px;
  background:linear-gradient(180deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,.015) 100%),linear-gradient(180deg,rgba(22,31,41,.9),rgba(17,24,33,.9));
  border:1px solid rgba(255,255,255,.08); box-shadow:none;
}
.block-title { margin:0 0 10px; font-size:.8rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--app-text-faint)!important; }
.fields-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; }
.field { display:grid; gap:8px; }
.field-label { font-size:.82rem; font-weight:600; }
.input {
  min-height:46px; padding:0 14px; border-radius:14px; border:1px solid rgba(255,255,255,.1);
  background:rgba(7,11,16,.34); color:var(--app-text-main); box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
}
.input::placeholder { color:rgba(243,247,251,.34); }
.player-count-row,.action-row { display:flex; flex-wrap:wrap; gap:12px; align-items:center; }
.pill { min-height:40px; padding:0 14px; border-radius:999px; font-weight:600; }
.pill.is-active {
  background:linear-gradient(180deg,rgba(124,196,255,.2) 0%,rgba(124,196,255,.12) 100%)!important;
  color:#eaf5ff!important; border-color:rgba(124,196,255,.34)!important; box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
}
.btn {
  border:1px solid rgba(255,255,255,.1);
  background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));
  color:var(--app-text-main); box-shadow:none;
}
.btn.btn-primary {
  background:linear-gradient(180deg,rgba(124,196,255,.28),rgba(124,196,255,.16));
  border-color:rgba(124,196,255,.34); color:#eff8ff;
}
.btn.btn-secondary {
  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.025));
  color:var(--app-text-soft);
}
.form-error { min-height:1.25rem; margin:-4px 0 0; color:var(--app-danger); font-size:.86rem; }
.app-shell-game { align-content:stretch; }
.app-shell-game .game-layout {
  display:grid; grid-template-rows:auto minmax(0,1fr); gap:14px!important;
  min-height:calc(var(--app-dvh,100dvh) - (var(--app-shell-pad) * 2));
}
.app-shell-game .topbar {
  padding:12px 14px!important; border-radius:22px; box-shadow:var(--app-shadow-soft); gap:12px;
}
.app-shell-game .topbar-title { font-size:clamp(1.04rem,1.55vw,1.38rem); line-height:1.06; }
.app-shell-game .topbar-sub { font-size:.78rem; line-height:1.35; }
.app-shell-game .topbar .btn,.app-shell-game .topbar .btn-icon { min-height:40px; }
.app-shell-game .game-shell-body,.app-shell-game .game-stage-layout,.app-shell-game .game-stage-main { min-height:0; display:grid; }
.app-shell-game .board-wrap {
  min-height:clamp(420px,68dvh,860px); height:100%; padding:clamp(10px,1.2vw,16px)!important; border-radius:26px!important;
  border:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,.015)),linear-gradient(180deg,rgba(17,24,33,.86),rgba(12,18,24,.9));
  box-shadow:var(--app-shadow-soft); overflow:hidden;
}
.overlay { backdrop-filter:blur(16px); background:rgba(4,8,12,.56); }
.modal { border-radius:28px; box-shadow:var(--app-shadow-strong); color:var(--app-text-main); }
.modal-head { padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,.08); }
.result-icon { box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 12px 28px rgba(0,0,0,.24); }
@media (max-width:980px) {
  .config-hero { grid-template-columns:1fr; }
  .config-hero-copy { padding:0; }
  .config-stack { grid-template-columns:1fr; }
}
@media (max-width:760px) {
  .app-shell { width:min(100vw,calc(100vw - 16px))!important; max-width:min(100vw,calc(100vw - 16px))!important; padding:12px!important; }
  .card { border-radius:24px; }
  .home-family-hero { min-height:196px; border-radius:26px; }
  .home-games-grid { grid-template-columns:repeat(3,minmax(0,1fr))!important; gap:10px!important; }
  .home-game-card { min-height:104px; padding:10px!important; border-radius:18px; }
  .home-game-card-glyph { width:58px; height:58px; padding:8px; border-radius:16px; }
  .config-card-modern { padding:16px!important; border-radius:24px; }
  .app-shell-game .topbar { padding:10px 12px!important; }
  .app-shell-game .board-wrap { min-height:clamp(340px,62dvh,640px); padding:10px!important; border-radius:22px!important; }
}
@media (min-width:1200px) {
  .home-games-grid { grid-template-columns:repeat(3,minmax(0,1fr))!important; }
  .app-shell-game .game-layout { min-height:calc(var(--app-dvh,100dvh) - 40px); }
  .app-shell-game .board-wrap { min-height:clamp(520px,70dvh,920px); }
}
`;

export function applyAppearanceRefresh() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STRUCTURAL_REFRESH_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STRUCTURAL_REFRESH_STYLE_ID;
  style.textContent = STRUCTURAL_REFRESH_CSS;
  document.head.appendChild(style);
}
