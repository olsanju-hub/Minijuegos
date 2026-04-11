const STYLE_ID = "minijuegos-compact-mobile";

const CSS = String.raw`
@media (max-width:760px){
  html,body{min-height:var(--app-dvh,100dvh);}
  body.is-game-screen{overflow:hidden;height:var(--app-dvh,100dvh);}
  .app-shell,.app-shell.app-shell-home,.app-shell:not(.app-shell-home){width:min(100%,calc(100% - 14px));margin:6px auto 10px;}
  .screen.config-screen,.screen.game-layout{gap:8px !important;}
  .screen.config-screen{min-height:calc(var(--app-dvh,100dvh) - 12px);align-content:start;overflow:hidden;}
  .screen.game-layout{min-height:calc(var(--app-dvh,100dvh) - 12px);overflow:hidden;grid-template-rows:auto minmax(0,1fr);}

  .topbar,.app-shell:not(.app-shell-home) .topbar{padding:8px 10px !important;border-radius:16px !important;gap:6px;align-items:center;}
  .topbar-main,.app-shell:not(.app-shell-home) .topbar-main{gap:8px !important;align-items:center;min-width:0;}
  .topbar-copy{gap:1px;min-width:0;}
  .topbar-title,.app-shell:not(.app-shell-home) .topbar-title{font-size:.96rem !important;line-height:1;}
  .topbar-sub,.app-shell:not(.app-shell-home) .topbar-sub{font-size:.7rem !important;line-height:1.15;max-width:18ch;white-space:normal;overflow:visible;}
  .topbar-actions{gap:4px;}
  .btn,.btn-primary,.btn-secondary,.btn-ghost{height:36px !important;min-height:36px !important;padding:0 11px !important;font-size:.8rem !important;border-radius:12px !important;}
  .btn-icon{width:34px !important;height:34px !important;min-width:34px !important;border-radius:11px !important;font-size:.76rem !important;}
  .btn-icon-text{min-width:52px !important;padding:0 7px !important;font-size:.58rem !important;line-height:1 !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

  .config-card,.config-card-modern,.app-shell:not(.app-shell-home) .config-card{width:min(100%,760px);padding:12px !important;gap:10px !important;max-height:calc(var(--app-dvh,100dvh) - 62px);overflow:hidden;}
  .config-hero{display:grid;grid-template-columns:116px minmax(0,1fr) !important;gap:10px !important;align-items:center;}
  .config-hero-media{width:116px;max-width:116px;border-radius:14px;overflow:hidden;}
  .config-hero-media .game-illustration{min-height:92px !important;height:92px !important;}
  .config-hero-copy{gap:4px;}
  .config-badge{min-height:22px;padding:0 8px;font-size:.58rem;}
  .config-title{font-size:1.08rem !important;line-height:1.02;}
  .config-tagline{font-size:.76rem !important;line-height:1.2;max-width:none;}
  .config-stack{gap:8px !important;overflow:auto;min-height:0;padding-right:2px;}
  .block,.config-card-modern .block{padding:10px !important;gap:6px !important;border-radius:14px;}
  .block-title{font-size:.84rem !important;}
  .block-sub,.info-line,.field-label{font-size:.74rem !important;line-height:1.2;}
  .fields-grid{grid-template-columns:1fr !important;gap:8px !important;}
  .field{gap:4px;}
  .input,.select{height:38px !important;border-radius:11px !important;padding:0 10px !important;font-size:.86rem !important;}
  .pill{height:32px !important;padding:0 10px !important;font-size:.74rem !important;}
  .player-count-row,.mode-row{gap:6px !important;}
  .form-error{min-height:.8em;font-size:.74rem;}
  .action-row,.app-shell:not(.app-shell-home) .action-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px !important;}

  .game-shell-body{display:flex;min-height:0;overflow:hidden;gap:0 !important;}
  .game-stage-layout,.game-stage-layout.is-immersive{grid-template-columns:minmax(0,1fr) !important;gap:0 !important;min-height:0;}
  .game-stage-main,.game-stage-layout:not(.is-immersive) .game-stage-main{min-height:0;padding:8px !important;border-radius:18px !important;}
  .board-wrap,.app-shell:not(.app-shell-home) .board-wrap{width:100%;height:100%;min-height:0;padding:0 !important;overflow:auto;display:grid;justify-items:center;align-items:start;}
  .game-floating-actions{display:none !important;}

  .turn-message,.app-shell:not(.app-shell-home) .turn-message{min-height:38px;padding:0 10px;font-size:.86rem !important;border-radius:14px;width:100%;justify-content:center;text-align:center;}
  .player-chip-list,.player-chip-list-compact{gap:6px;}
  .player-chip,.player-chip-list-compact .player-chip{min-height:34px;padding:6px 10px;border-radius:12px;flex:1 1 calc(50% - 6px);font-size:.72rem;}
  .player-token,.player-chip-list-compact .player-token{width:18px;height:18px;font-size:.62rem;}
  .player-name,.player-chip-list-compact .player-name{max-width:none;font-size:.72rem;}

  .actions-bottom,.app-shell:not(.app-shell-home) .actions-bottom{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px !important;}
  .actions-bottom .btn,.app-shell:not(.app-shell-home) .actions-bottom .btn{width:100%;min-width:0;height:34px !important;min-height:34px !important;padding:0 8px !important;font-size:.7rem !important;border-radius:11px !important;}
}
`;

function ensureCompactStyle(){
  if(typeof document === "undefined") return;
  let style = document.getElementById(STYLE_ID);
  if(!style){
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = CSS;
}

export function applyCompactMobileRefresh(){
  ensureCompactStyle();
}
