const STRUCTURAL_REFRESH_STYLE_ID = "minijuegos-appearance-refresh";

const STRUCTURAL_REFRESH_CSS = String.raw`
:root {
  --mx-bg: #0b1016;
  --mx-bg-2: #101722;
  --mx-panel: rgba(17, 24, 34, 0.88);
  --mx-panel-2: rgba(22, 31, 43, 0.92);
  --mx-panel-soft: rgba(255, 255, 255, 0.04);
  --mx-line: rgba(255, 255, 255, 0.08);
  --mx-line-strong: rgba(255, 255, 255, 0.14);
  --mx-text: rgba(243, 247, 252, 0.94);
  --mx-text-soft: rgba(243, 247, 252, 0.64);
  --mx-text-faint: rgba(243, 247, 252, 0.42);
  --mx-accent: #79b8ff;
  --mx-accent-soft: rgba(121, 184, 255, 0.18);
  --mx-danger: #ff8e8e;
  --mx-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
  --mx-shadow-strong: 0 28px 72px rgba(0, 0, 0, 0.38);
  --mx-shell-max: min(1380px, calc(100vw - 28px));
  --mx-shell-pad: clamp(14px, 1.7vw, 24px);
  --mx-gap-lg: clamp(14px, 1.5vw, 22px);
  --mx-gap-md: clamp(10px, 1vw, 16px);
  --mx-gap-sm: 8px;
  --mx-radius-xl: 28px;
  --mx-radius-lg: 22px;
  --mx-radius-md: 16px;
}

body {
  background:
    radial-gradient(circle at top left, rgba(121, 184, 255, 0.14), transparent 24%),
    radial-gradient(circle at top right, rgba(121, 184, 255, 0.06), transparent 20%),
    linear-gradient(180deg, var(--mx-bg) 0%, var(--mx-bg-2) 100%);
  color: var(--mx-text);
}

.bg-layer {
  background:
    radial-gradient(circle at 12% 8%, rgba(121, 184, 255, 0.08), transparent 22%),
    linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
  opacity: 1;
}

.app-shell {
  width: var(--mx-shell-max) !important;
  max-width: var(--mx-shell-max) !important;
  margin: 0 auto !important;
  padding: var(--mx-shell-pad) !important;
  min-height: 100dvh;
  display: grid;
  align-content: start;
  gap: var(--mx-gap-lg);
}

.screen {
  gap: var(--mx-gap-lg) !important;
}

.card,
.block,
.modal,
.app-shell-game .topbar,
.app-shell-game .board-wrap,
.config-card-modern,
.home-family-hero,
.home-library-header {
  border: 1px solid var(--mx-line);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02)),
    linear-gradient(180deg, var(--mx-panel) 0%, var(--mx-panel-2) 100%);
  box-shadow: var(--mx-shadow);
  backdrop-filter: blur(18px);
}

.card {
  border-radius: var(--mx-radius-xl);
}

.home-catalog-title,
.home-games-title,
.config-title,
.topbar-title,
.modal-title,
.result-title,
.rule-label,
.player-name {
  color: var(--mx-text) !important;
}

.home-catalog-subtitle,
.home-catalog-signature,
.home-games-subtitle,
.config-tagline,
.topbar-sub,
.info-line,
.field-label,
.block-title,
.result-sub,
.rule-text {
  color: var(--mx-text-soft) !important;
}

.home-note-pill,
.config-badge,
.pill,
.home-game-card-tag {
  background: rgba(255,255,255,0.05) !important;
  border: 1px solid var(--mx-line) !important;
  color: var(--mx-text-soft) !important;
  box-shadow: none !important;
}

.btn,
.input {
  border: 1px solid var(--mx-line) !important;
  box-shadow: none !important;
}

.btn {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)) !important;
  color: var(--mx-text) !important;
}

.btn.btn-primary {
  background:
    linear-gradient(180deg, rgba(121,184,255,0.24), rgba(121,184,255,0.14)) !important;
  border-color: rgba(121,184,255,0.28) !important;
}

.btn.btn-secondary {
  color: var(--mx-text-soft) !important;
}

.input {
  min-height: 46px;
  border-radius: 14px;
  background: rgba(7, 10, 15, 0.34) !important;
  color: var(--mx-text) !important;
}

.input::placeholder {
  color: rgba(243,247,252,0.32);
}

.home-screen.home-library-screen.is-catalog {
  display: grid;
  gap: 18px;
}

.home-family-hero {
  padding: 0 !important;
  overflow: hidden;
  min-height: clamp(210px, 28vw, 320px);
  border-radius: 30px;
}

.home-family-art {
  position: relative;
  min-height: inherit;
}

.home-family-art::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(125deg, rgba(4,8,12,0.32), transparent 42%),
    linear-gradient(180deg, rgba(4,8,12,0.08), rgba(4,8,12,0.38));
  z-index: 1;
  pointer-events: none;
}

.home-family-art::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(4,8,12,0) 0%, rgba(4,8,12,0.44) 100%);
  z-index: 1;
  pointer-events: none;
}

.home-family-art-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: saturate(0.82) contrast(1.03) brightness(0.86);
}

.home-games-section {
  display: grid;
  gap: 14px;
}

.home-games-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px 22px;
  flex-wrap: wrap;
  padding-inline: 2px;
}

.home-games-heading-copy {
  display: grid;
  gap: 6px;
}

.home-games-kicker {
  margin: 0;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--mx-text-faint);
}

.home-games-title {
  margin: 0;
  font-size: clamp(1.3rem, 2.4vw, 1.9rem);
  line-height: 1.04;
}

.home-games-subtitle {
  margin: 0;
  max-width: 54ch;
  font-size: 0.92rem;
  line-height: 1.5;
}

.home-games-grid {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 14px !important;
}

.home-game-card {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 148px;
  padding: 16px !important;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--mx-line);
  background:
    radial-gradient(circle at top, rgba(255,255,255,0.05), transparent 42%),
    linear-gradient(180deg, rgba(16,22,31,0.98) 0%, rgba(12,17,24,0.98) 100%);
  box-shadow: var(--mx-shadow);
}

.home-game-card::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0));
  z-index: 0;
  pointer-events: none;
}

.home-game-card::after {
  content: "";
  position: absolute;
  inset: auto 16px 0 16px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--home-game-accent, var(--mx-accent)), transparent 78%);
  opacity: 0.92;
}

.home-game-card > * {
  position: relative;
  z-index: 1;
}

.home-game-card-hit {
  position: absolute;
  inset: 0;
  z-index: 3;
  opacity: 0;
  cursor: pointer;
}

.home-game-card-top {
  display: grid;
  place-items: center;
  width: 100%;
}

.home-game-card-glyph {
  width: 84px;
  height: 84px;
  padding: 12px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  border: 1px solid var(--mx-line);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 26px rgba(0,0,0,0.2);
}

.home-game-card-glyph svg {
  width: 100%;
  height: 100%;
  display: block;
}

.home-game-card-tag,
.home-game-card-copy,
.home-game-card-title,
.home-game-card-subtitle {
  display: none !important;
}

.config-screen {
  display: grid;
  gap: 18px;
}

.config-card-modern {
  max-width: 1120px !important;
  width: 100%;
  margin: 0 auto;
  padding: clamp(18px, 2vw, 28px) !important;
  border-radius: 30px;
  display: grid;
  gap: 18px;
  box-shadow: var(--mx-shadow-strong);
}

.config-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.92fr);
  gap: 18px;
  align-items: stretch;
}

.config-hero-media {
  min-height: clamp(220px, 26vw, 300px);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--mx-line);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)),
    linear-gradient(180deg, rgba(20,28,38,0.94), rgba(14,20,28,0.94));
}

.config-hero-media > * {
  width: 100%;
  height: 100%;
}

.config-hero-copy {
  display: grid;
  align-content: center;
  gap: 10px;
  padding: 4px 2px;
}

.config-title {
  margin: 0;
  font-size: clamp(1.48rem, 2.4vw, 2.04rem);
  line-height: 1.04;
}

.config-stack {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.config-stack > * {
  min-width: 0;
}

.config-stack > .block:only-child,
.config-stack > .block:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

.block {
  padding: 16px;
  border-radius: 20px;
}

.block-title {
  margin: 0 0 10px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mx-text-faint) !important;
}

.info-line {
  margin: 0;
  line-height: 1.55;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
}

.player-count-row,
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.form-error {
  min-height: 1.25rem;
  margin: -4px 0 0;
  color: var(--mx-danger);
  font-size: 0.86rem;
}

.pill.is-active {
  background: linear-gradient(180deg, rgba(121,184,255,0.22) 0%, rgba(121,184,255,0.12) 100%) !important;
  border-color: rgba(121,184,255,0.3) !important;
  color: #ebf5ff !important;
}

.app-shell-game {
  align-content: stretch;
}

.app-shell-game .game-layout {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px !important;
  min-height: calc(var(--app-dvh, 100dvh) - (var(--mx-shell-pad) * 2));
}

.app-shell-game .topbar {
  padding: 12px 14px !important;
  border-radius: 22px;
  gap: 12px;
}

.app-shell-game .topbar-main,
.app-shell-game .topbar-copy {
  min-width: 0;
}

.app-shell-game .topbar-title {
  font-size: clamp(1.04rem, 1.55vw, 1.38rem);
  line-height: 1.06;
}

.app-shell-game .topbar-sub {
  font-size: 0.78rem;
  line-height: 1.35;
}

.app-shell-game .topbar .btn,
.app-shell-game .topbar .btn-icon {
  min-height: 40px;
}

.app-shell-game .game-shell-body,
.app-shell-game .game-stage-layout,
.app-shell-game .game-stage-main {
  min-height: 0;
  display: grid;
}

.app-shell-game .board-wrap {
  min-height: clamp(420px, 68dvh, 860px);
  height: 100%;
  padding: clamp(10px, 1.2vw, 16px) !important;
  border-radius: 26px !important;
  overflow: hidden;
}

.overlay {
  backdrop-filter: blur(16px);
  background: rgba(4, 8, 12, 0.58);
}

.modal {
  border-radius: 28px;
  color: var(--mx-text);
  box-shadow: var(--mx-shadow-strong);
}

.modal-head {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--mx-line);
}

.result-icon {
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 28px rgba(0,0,0,0.24);
}

@media (max-width: 980px) {
  .config-hero {
    grid-template-columns: 1fr;
  }

  .config-hero-copy {
    padding: 0;
  }

  .config-stack {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .app-shell {
    width: min(100vw, calc(100vw - 16px)) !important;
    max-width: min(100vw, calc(100vw - 16px)) !important;
    padding: 12px !important;
  }

  .card,
  .home-family-hero,
  .config-card-modern,
  .app-shell-game .board-wrap {
    border-radius: 24px !important;
  }

  .home-family-hero {
    min-height: 196px;
  }

  .home-games-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }

  .home-game-card {
    min-height: 104px;
    padding: 10px !important;
    border-radius: 18px;
  }

  .home-game-card-glyph {
    width: 58px;
    height: 58px;
    padding: 8px;
    border-radius: 16px;
  }

  .config-card-modern {
    padding: 16px !important;
  }

  .app-shell-game .topbar {
    padding: 10px 12px !important;
  }

  .app-shell-game .board-wrap {
    min-height: clamp(340px, 62dvh, 640px);
    padding: 10px !important;
  }
}

@media (min-width: 1200px) {
  .home-games-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }

  .app-shell-game .game-layout {
    min-height: calc(var(--app-dvh, 100dvh) - 40px);
  }

  .app-shell-game .board-wrap {
    min-height: clamp(520px, 70dvh, 920px);
  }
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
