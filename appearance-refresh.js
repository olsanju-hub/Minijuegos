const STRUCTURAL_REFRESH_STYLE_ID = "minijuegos-appearance-refresh";

const STRUCTURAL_REFRESH_CSS = String.raw`
  :root {
    --app-surface-strong: rgba(255, 252, 246, 0.92);
    --app-surface-soft: rgba(255, 250, 240, 0.78);
    --app-surface-muted: rgba(246, 238, 224, 0.7);
    --app-border-soft: rgba(138, 112, 78, 0.16);
    --app-border-strong: rgba(112, 85, 56, 0.22);
    --app-shadow-soft: 0 18px 38px rgba(60, 41, 17, 0.08);
    --app-shadow-strong: 0 24px 56px rgba(60, 41, 17, 0.12);
    --app-shell-max: min(1420px, calc(100vw - 24px));
    --app-shell-pad: clamp(14px, 1.8vw, 24px);
    --app-gap-lg: clamp(16px, 1.8vw, 24px);
    --app-gap-md: clamp(12px, 1.2vw, 18px);
    --app-gap-sm: clamp(8px, 0.9vw, 12px);
    --app-radius-xl: 30px;
    --app-radius-lg: 24px;
    --app-radius-md: 18px;
  }

  body {
    background:
      radial-gradient(circle at top, rgba(255, 244, 220, 0.75), transparent 42%),
      linear-gradient(180deg, #faf3e5 0%, #f5ecde 50%, #f1e8da 100%);
    color: #271c12;
  }

  .bg-layer {
    background:
      radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.34), transparent 28%),
      radial-gradient(circle at 82% 18%, rgba(236, 206, 160, 0.22), transparent 32%),
      linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%);
    opacity: 1;
  }

  .app-shell {
    width: var(--app-shell-max) !important;
    max-width: var(--app-shell-max) !important;
    margin: 0 auto !important;
    padding: var(--app-shell-pad) !important;
    min-height: 100dvh;
    display: grid;
    align-content: start;
    gap: var(--app-gap-lg);
  }

  .screen {
    gap: var(--app-gap-lg) !important;
  }

  .card {
    border-radius: var(--app-radius-xl);
    border: 1px solid var(--app-border-soft);
    background: linear-gradient(180deg, rgba(255, 253, 248, 0.94) 0%, rgba(248, 241, 230, 0.88) 100%);
    box-shadow: var(--app-shadow-soft);
    backdrop-filter: blur(10px);
  }

  .btn,
  .pill,
  .input,
  .modal,
  .player-chip,
  .block,
  .home-game-card {
    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      border-color 160ms ease,
      background-color 160ms ease;
  }

  .btn:hover,
  .pill:hover,
  .home-game-card:hover {
    transform: translateY(-1px);
  }

  .home-screen.home-library-screen.is-catalog {
    display: grid;
    gap: clamp(16px, 2vw, 24px);
  }

  .home-screen.home-library-screen.is-catalog > *:not(.home-library-header) {
    margin: 0;
  }

  .home-hero-stage {
    display: grid;
  }

  .home-family-hero {
    padding: 0 !important;
    overflow: hidden;
    min-height: clamp(230px, 34vw, 380px);
    border-radius: calc(var(--app-radius-xl) + 4px);
    border: 1px solid rgba(130, 104, 70, 0.16);
    box-shadow: var(--app-shadow-strong);
  }

  .home-family-art {
    position: relative;
    min-height: inherit;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0)),
      linear-gradient(180deg, rgba(86, 64, 42, 0.08), rgba(86, 64, 42, 0.02));
  }

  .home-family-art::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    height: 36%;
    background: linear-gradient(180deg, rgba(32, 19, 7, 0) 0%, rgba(32, 19, 7, 0.22) 100%);
    pointer-events: none;
  }

  .home-family-art-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .home-games-section {
    display: grid;
    gap: clamp(14px, 1.6vw, 22px);
  }

  .home-games-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 16px 24px;
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
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(90, 64, 34, 0.62);
  }

  .home-games-title {
    margin: 0;
    font-size: clamp(1.5rem, 3vw, 2.35rem);
    line-height: 1.02;
    color: #24180f;
  }

  .home-games-subtitle {
    margin: 0;
    max-width: 58ch;
    font-size: 0.95rem;
    line-height: 1.55;
    color: rgba(56, 39, 21, 0.74);
  }

  .home-games-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
    gap: clamp(12px, 1.3vw, 18px) !important;
  }

  .home-game-card {
    position: relative;
    display: grid;
    align-content: space-between;
    min-height: 182px;
    padding: 18px 18px 16px !important;
    overflow: hidden;
    border-radius: 26px;
    border: 1px solid rgba(122, 96, 66, 0.18);
    background:
      radial-gradient(circle at top right, rgba(255,255,255,0.36), transparent 38%),
      linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(246,238,224,0.9) 100%);
    box-shadow: 0 16px 36px rgba(62, 42, 21, 0.08);
  }

  .home-game-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(140deg, var(--home-game-glow, rgba(86, 188, 255, 0.16)), transparent 54%);
    pointer-events: none;
    z-index: 0;
  }

  .home-game-card::after {
    content: "";
    position: absolute;
    inset: auto 16px 0 16px;
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--home-game-accent, #56bcff), color-mix(in srgb, var(--home-game-accent, #56bcff) 38%, white));
    opacity: 0.94;
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
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .home-game-card-glyph {
    width: 60px;
    height: 60px;
    padding: 8px;
    border-radius: 18px;
    background: rgba(255,255,255,0.62);
    border: 1px solid rgba(122, 96, 66, 0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
  }

  .home-game-card-glyph svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .home-game-card-tag {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.76);
    border: 1px solid rgba(122, 96, 66, 0.12);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(72, 50, 26, 0.72);
  }

  .home-game-card-copy {
    display: grid;
    gap: 8px;
    align-content: end;
  }

  .home-game-card-title {
    margin: 0;
    font-size: 1.14rem;
    line-height: 1.08;
    color: #21160f;
  }

  .home-game-card-subtitle {
    margin: 0;
    color: rgba(57, 40, 22, 0.72);
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .config-screen {
    display: grid;
    gap: clamp(14px, 1.5vw, 22px);
  }

  .config-card-modern {
    max-width: 1040px !important;
    width: 100%;
    margin: 0 auto;
    padding: clamp(18px, 2vw, 28px) !important;
    border-radius: calc(var(--app-radius-xl) + 2px);
    background:
      radial-gradient(circle at top right, rgba(255,255,255,0.28), transparent 34%),
      linear-gradient(180deg, rgba(255, 252, 247, 0.96) 0%, rgba(246, 238, 226, 0.92) 100%);
    border: 1px solid rgba(132, 104, 73, 0.18);
    box-shadow: var(--app-shadow-strong);
    display: grid;
    gap: clamp(16px, 1.8vw, 24px);
  }

  .config-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr);
    gap: clamp(14px, 1.8vw, 22px);
    align-items: stretch;
  }

  .config-hero-media {
    min-height: clamp(220px, 28vw, 320px);
    border-radius: 24px;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0)),
      linear-gradient(180deg, rgba(242, 231, 212, 0.86), rgba(233, 218, 194, 0.92));
    border: 1px solid rgba(133, 103, 69, 0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.84);
  }

  .config-hero-media > * {
    width: 100%;
    height: 100%;
  }

  .config-hero-copy {
    display: grid;
    align-content: center;
    gap: 10px;
    padding: clamp(8px, 1vw, 14px) clamp(6px, 0.8vw, 10px);
  }

  .config-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(132, 104, 73, 0.14);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 800;
    color: rgba(83, 59, 32, 0.72);
  }

  .config-title {
    margin: 0;
    font-size: clamp(1.56rem, 2.8vw, 2.3rem);
    line-height: 1.02;
    color: #22170f;
  }

  .config-tagline {
    margin: 0;
    max-width: 44ch;
    color: rgba(55, 38, 20, 0.7);
    line-height: 1.6;
    font-size: 0.95rem;
  }

  .config-stack {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(12px, 1.4vw, 18px);
  }

  .config-stack > * {
    min-width: 0;
  }

  .config-stack > .block:only-child,
  .config-stack > .block:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }

  .block {
    padding: clamp(14px, 1.4vw, 18px);
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(249,243,233,0.88) 100%);
    border: 1px solid rgba(128, 100, 70, 0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
  }

  .block-title {
    margin: 0 0 10px;
    font-size: 0.86rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(86, 62, 34, 0.68);
  }

  .info-line {
    margin: 0;
    color: rgba(48, 34, 20, 0.76);
    line-height: 1.5;
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
    font-weight: 700;
    color: rgba(70, 49, 25, 0.74);
  }

  .input {
    min-height: 46px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid rgba(123, 96, 67, 0.16);
    background: rgba(255,255,255,0.88);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.94);
  }

  .player-count-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .pill {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(124, 96, 66, 0.14);
    background: rgba(255,255,255,0.78);
    color: #382519;
    font-weight: 700;
  }

  .pill.is-active {
    background: linear-gradient(180deg, #382519 0%, #4f3523 100%);
    color: #fff7ec;
    border-color: rgba(79, 53, 35, 0.86);
    box-shadow: 0 10px 24px rgba(41, 24, 10, 0.18);
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .form-error {
    min-height: 1.25rem;
    margin: -4px 0 0;
    color: #a24b3b;
    font-size: 0.86rem;
  }

  .app-shell-game {
    align-content: stretch;
  }

  .app-shell-game .game-layout {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: clamp(12px, 1.4vw, 18px) !important;
    min-height: calc(var(--app-dvh, 100dvh) - (var(--app-shell-pad) * 2));
  }

  .app-shell-game .topbar {
    padding: 12px 14px !important;
    border-radius: 24px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(247,239,227,0.9) 100%);
    border: 1px solid rgba(126, 97, 64, 0.16);
    box-shadow: 0 14px 30px rgba(54, 35, 16, 0.08);
    gap: 12px;
  }

  .app-shell-game .topbar-main,
  .app-shell-game .topbar-copy {
    min-width: 0;
  }

  .app-shell-game .topbar-title {
    font-size: clamp(1.06rem, 1.7vw, 1.5rem);
    line-height: 1.05;
    color: #22170f;
  }

  .app-shell-game .topbar-sub {
    color: rgba(66, 47, 26, 0.66);
    font-size: 0.8rem;
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
    border-radius: 28px !important;
    border: 1px solid rgba(126, 97, 64, 0.14);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.48), rgba(255,255,255,0)),
      linear-gradient(180deg, rgba(250,245,237,0.84), rgba(242,233,219,0.84));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.84),
      0 22px 42px rgba(54, 35, 16, 0.08);
    overflow: hidden;
  }

  .overlay {
    backdrop-filter: blur(12px);
    background: rgba(33, 21, 10, 0.32);
  }

  .modal {
    border-radius: 28px;
    border: 1px solid rgba(128, 101, 70, 0.16);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,239,227,0.92) 100%);
    box-shadow: 0 28px 62px rgba(40, 25, 10, 0.2);
  }

  .modal-head {
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(128, 101, 70, 0.1);
  }

  .result-icon {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.82), 0 12px 24px rgba(57, 37, 17, 0.12);
  }

  @media (max-width: 920px) {
    .config-hero {
      grid-template-columns: 1fr;
    }

    .config-hero-copy {
      padding: 0;
    }

    .config-stack {
      grid-template-columns: 1fr;
    }

    .home-games-heading {
      align-items: start;
    }
  }

  @media (max-width: 760px) {
    .app-shell {
      width: min(100vw, calc(100vw - 16px)) !important;
      max-width: min(100vw, calc(100vw - 16px)) !important;
      padding: 12px !important;
    }

    .card {
      border-radius: 24px;
    }

    .home-family-hero {
      min-height: 220px;
      border-radius: 28px;
    }

    .home-games-grid {
      grid-template-columns: 1fr !important;
    }

    .home-game-card {
      min-height: 154px;
      padding: 16px !important;
    }

    .config-card-modern {
      padding: 16px !important;
      border-radius: 26px;
    }

    .app-shell-game .topbar {
      padding: 10px 12px !important;
    }

    .app-shell-game .board-wrap {
      min-height: clamp(340px, 62dvh, 640px);
      padding: 10px !important;
      border-radius: 24px !important;
    }
  }

  @media (min-width: 1180px) {
    .home-games-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
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
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(STRUCTURAL_REFRESH_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STRUCTURAL_REFRESH_STYLE_ID;
  style.textContent = STRUCTURAL_REFRESH_CSS;
  document.head.appendChild(style);
}
