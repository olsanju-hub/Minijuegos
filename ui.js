function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[char];
  });
}

function normalizeActionPayload(target) {
  const actionType = target.dataset.gameAction;
  if (!actionType) {
    return null;
  }

  if (actionType === "mark") {
    return {
      type: "mark",
      cell: Number(target.dataset.cell)
    };
  }

  if (actionType === "press-cell") {
    return {
      type: "press-cell",
      cell: Number(target.dataset.cell),
      nowMs: Date.now()
    };
  }

  if (actionType === "toggle-flag") {
    return {
      type: "toggle-flag",
      cell: Number(target.dataset.cell),
      nowMs: Date.now()
    };
  }

  if (actionType === "flip-card") {
    return {
      type: "flip-card",
      card: Number(target.dataset.card),
      nowMs: Date.now()
    };
  }

  if (actionType === "set-interaction-mode") {
    return {
      type: "set-interaction-mode",
      mode: String(target.dataset.mode || "")
    };
  }

  if (actionType === "move-direction") {
    return {
      type: "move",
      direction: String(target.dataset.direction || ""),
      nowMs: Date.now()
    };
  }

  if (actionType === "undo-move") {
    return {
      type: "undo",
      nowMs: Date.now()
    };
  }

  if (actionType === "restart-level") {
    return {
      type: "restart-level",
      nowMs: Date.now()
    };
  }

  if (actionType === "next-level") {
    return {
      type: "next-level",
      nowMs: Date.now()
    };
  }

  if (actionType === "restart-campaign") {
    return {
      type: "restart-campaign",
      nowMs: Date.now()
    };
  }

  if (actionType === "drop") {
    return {
      type: "drop",
      column: Number(target.dataset.column)
    };
  }

  if (actionType === "roll-die") {
    return {
      type: "roll-die"
    };
  }

  if (actionType === "confirm-move") {
    return {
      type: "confirm-move",
      cell: Number(target.dataset.cell)
    };
  }

  if (actionType === "select-destination") {
    return {
      type: "select-destination",
      pieceId: String(target.dataset.pieceId || "")
    };
  }

  if (actionType === "select-piece") {
    return {
      type: "select-piece",
      pieceId: String(target.dataset.pieceId || "")
    };
  }

  if (actionType === "apply-bonus") {
    return {
      type: "apply-bonus",
      pieceId: String(target.dataset.pieceId || "")
    };
  }

  if (actionType === "select-cell") {
    return {
      type: "select-cell",
      row: Number(target.dataset.row),
      col: Number(target.dataset.col)
    };
  }

  if (actionType === "start-run") {
    return {
      type: "start-run"
    };
  }

  if (actionType === "toggle-pause") {
    return {
      type: "toggle-pause"
    };
  }

  if (actionType === "steer-left") {
    return {
      type: "steer-left"
    };
  }

  if (actionType === "steer-right") {
    return {
      type: "steer-right"
    };
  }

  if (actionType === "tick") {
    return {
      type: "tick"
    };
  }

  return null;
}

export function createUI({ appElement, toastElement }) {
  let onAction = null;
  let onField = null;
  let onOverlayClose = null;
  let toastTimer = null;
  let currentVm = null;
  let homeActiveIndex = 0;
  let homeDrawerOpen = false;
  let homeMotionDir = 0;
  let trafficTickFrame = null;
  let trafficLastFrameAt = 0;
  let trafficDispatchInFlight = false;
  let minesTimerId = null;
  let minesTimerInFlight = false;
  let memoryResolveTimerId = null;
  let memoryResolveInFlight = false;
  let sokobanAutoNextTimerId = null;
  let sokobanAutoNextInFlight = false;
  let homeSwipeStartX = null;
  let trafficSwipeState = null;
  let trafficSwipeInFlight = false;
  let gameSwipeState = null;
  let gameSwipeInFlight = false;

  function isCompactTouchViewport() {
    return window.matchMedia("(max-width: 760px)").matches;
  }

  function getHomeCatalog(vm) {
    return Array.isArray(vm?.games) ? vm.games : [];
  }

  function normalizeHomeIndex(vm) {
    const total = getHomeCatalog(vm).length;
    if (total <= 0) {
      homeActiveIndex = 0;
      return 0;
    }
    homeActiveIndex = ((homeActiveIndex % total) + total) % total;
    return homeActiveIndex;
  }

  function setHomeIndex(index, vm = currentVm) {
    if (!vm) {
      return;
    }
    const total = getHomeCatalog(vm).length;
    if (total === 0) {
      return;
    }
    const previous = homeActiveIndex;
    const numeric = Number(index);
    if (!Number.isFinite(numeric)) {
      return;
    }
    homeActiveIndex = ((numeric % total) + total) % total;
    const drift = circularDelta(homeActiveIndex, previous, total);
    homeMotionDir = drift === 0 ? 0 : drift > 0 ? 1 : -1;
    homeDrawerOpen = false;
    render(vm);
  }

  function shiftHomeIndex(step, vm = currentVm) {
    setHomeIndex(homeActiveIndex + Number(step || 0), vm);
  }

  function shiftHomeIndexLinear(step, vm = currentVm) {
    if (!vm) {
      return;
    }
    const total = getHomeCatalog(vm).length;
    if (total <= 0) {
      return;
    }
    const next = Math.max(0, Math.min(total - 1, homeActiveIndex + Number(step || 0)));
    if (next === homeActiveIndex) {
      return;
    }
    const previous = homeActiveIndex;
    homeActiveIndex = next;
    homeMotionDir = homeActiveIndex > previous ? 1 : -1;
    homeDrawerOpen = false;
    render(vm);
  }

  function circularDelta(index, active, total) {
    let delta = index - active;
    if (delta > total / 2) {
      delta -= total;
    } else if (delta < -total / 2) {
      delta += total;
    }
    return delta;
  }

  function renderTopbar({ leftAction, leftLabel, title, subtitle, showRules = false }) {
    return `
      <header class="topbar">
        <div class="topbar-main">
          <button class="btn btn-secondary" data-action="${leftAction}">${escapeHtml(leftLabel)}</button>
          <div class="topbar-copy">
            <h2 class="topbar-title">${escapeHtml(title)}</h2>
            ${subtitle ? `<p class="topbar-sub">${escapeHtml(subtitle)}</p>` : ""}
          </div>
        </div>
        ${showRules ? '<div class="topbar-actions"><button class="btn-icon" data-action="open-rules" aria-label="Abrir reglas">?</button></div>' : ""}
      </header>
    `;
  }

  function renderPlayfulTitle(text) {
    const letters = String(text || "").split("");
    return letters
      .map((letter, index) => {
        const tilt = [-7, -2, 4, -5, 6, -3, 5, -4, 3, -5, 4][index % 11];
        const lift = [0, -6, 2, -4, 1, -3, 0, -5, 1, -2, 0][index % 11];
        const spacer = letter === " " ? " is-space" : "";
        return `<span class="home-title-letter${spacer}" style="--tilt:${tilt}deg;--lift:${lift}px">${letter === " " ? "&nbsp;" : escapeHtml(letter)}</span>`;
      })
      .join("");
  }

  function renderHomeGameGlyph(gameId) {
    const glyphs = {
      tictactoe: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="12" fill="#eef8ff" stroke="#b9dff6" stroke-width="1.5" />
          <path d="M17 12V36M31 12V36M12 17H36M12 31H36" stroke="#c6baa8" stroke-width="2.6" stroke-linecap="round" />
          <path d="M13.5 13.5L19.5 19.5M19.5 13.5L13.5 19.5" stroke="#de6a51" stroke-width="2.8" stroke-linecap="round" />
          <circle cx="24" cy="24" r="4.5" fill="none" stroke="#e6ba3a" stroke-width="2.8" />
          <path d="M28.5 28.5L34.5 34.5M34.5 28.5L28.5 34.5" stroke="#4f9b76" stroke-width="2.8" stroke-linecap="round" />
        </svg>
      `,
      connect4: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <rect x="5" y="7" width="38" height="34" rx="10" fill="#3c8769" stroke="#2c654d" stroke-width="1.5" />
          <g fill="#f7efe2">
            <circle cx="15" cy="17" r="3.4" />
            <circle cx="24" cy="17" r="3.4" />
            <circle cx="33" cy="17" r="3.4" />
            <circle cx="15" cy="25" r="3.4" />
            <circle cx="24" cy="25" r="3.4" />
            <circle cx="33" cy="25" r="3.4" />
            <circle cx="15" cy="33" r="3.4" />
            <circle cx="24" cy="33" r="3.4" />
            <circle cx="33" cy="33" r="3.4" />
          </g>
          <circle cx="15" cy="33" r="3.1" fill="#de6a51" />
          <circle cx="24" cy="25" r="3.1" fill="#e6ba3a" />
          <circle cx="33" cy="17" r="3.1" fill="#4f9b76" />
        </svg>
      `,
      damas: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <rect x="5" y="5" width="38" height="38" rx="10" fill="#f6ecdb" stroke="#d6c4a9" stroke-width="1.5" />
          <g>
            <rect x="10" y="10" width="7" height="7" fill="#8c5b40" />
            <rect x="24" y="10" width="7" height="7" fill="#8c5b40" />
            <rect x="17" y="17" width="7" height="7" fill="#8c5b40" />
            <rect x="31" y="17" width="7" height="7" fill="#8c5b40" />
            <rect x="10" y="24" width="7" height="7" fill="#8c5b40" />
            <rect x="24" y="24" width="7" height="7" fill="#8c5b40" />
            <rect x="17" y="31" width="7" height="7" fill="#8c5b40" />
            <rect x="31" y="31" width="7" height="7" fill="#8c5b40" />
          </g>
          <circle cx="20.5" cy="20.5" r="4.1" fill="#de6a51" stroke="#b14c37" stroke-width="1" />
          <circle cx="27.5" cy="27.5" r="4.1" fill="#f2d76b" stroke="#c9a83f" stroke-width="1" />
        </svg>
      `,
      parchis: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="11" fill="#fbf4e8" stroke="#d9c8af" stroke-width="1.5" />
          <rect x="8" y="8" width="12" height="12" rx="3" fill="#f2d2cd" stroke="#d8a8a2" stroke-width="1" />
          <rect x="28" y="8" width="12" height="12" rx="3" fill="#d8e6fb" stroke="#a9c0e6" stroke-width="1" />
          <rect x="28" y="28" width="12" height="12" rx="3" fill="#f3e8bf" stroke="#d9c88f" stroke-width="1" />
          <rect x="8" y="28" width="12" height="12" rx="3" fill="#d7efde" stroke="#9fc9ae" stroke-width="1" />
          <path d="M24 15L29 20H19L24 15Z" fill="#ffb3b8" stroke="#d9666f" stroke-width="1" />
          <path d="M29 20L24 25V15L29 20Z" fill="#cde2f9" stroke="#9ebfe7" stroke-width="1" />
          <path d="M24 25L19 20H29L24 25Z" fill="#f3e48f" stroke="#d2bc55" stroke-width="1" />
          <path d="M19 20L24 15V25L19 20Z" fill="#cfead8" stroke="#99c4aa" stroke-width="1" />
        </svg>
      `,
      "escaleras-serpientes": `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="11" fill="#fff5de" stroke="#e6cf9d" stroke-width="1.5" />
          <g>
            <rect x="8" y="8" width="8" height="8" fill="#f8d3c6" />
            <rect x="16" y="8" width="8" height="8" fill="#ffffff" />
            <rect x="24" y="8" width="8" height="8" fill="#d8e9f7" />
            <rect x="32" y="8" width="8" height="8" fill="#ffffff" />
            <rect x="8" y="16" width="8" height="8" fill="#ffffff" />
            <rect x="16" y="16" width="8" height="8" fill="#f6e7ae" />
            <rect x="24" y="16" width="8" height="8" fill="#ffffff" />
            <rect x="32" y="16" width="8" height="8" fill="#d8e9f7" />
            <rect x="8" y="24" width="8" height="8" fill="#f8d3c6" />
            <rect x="16" y="24" width="8" height="8" fill="#ffffff" />
            <rect x="24" y="24" width="8" height="8" fill="#dfeec7" />
            <rect x="32" y="24" width="8" height="8" fill="#ffffff" />
            <rect x="8" y="32" width="8" height="8" fill="#ffffff" />
            <rect x="16" y="32" width="8" height="8" fill="#f8d3c6" />
            <rect x="24" y="32" width="8" height="8" fill="#ffffff" />
            <rect x="32" y="32" width="8" height="8" fill="#dfeec7" />
          </g>
          <g stroke="#9f7c64" stroke-width="2.4" stroke-linecap="round">
            <line x1="13" y1="35" x2="22" y2="17" />
            <line x1="18" y1="36" x2="27" y2="18" />
            <line x1="15" y1="31" x2="20" y2="32" />
            <line x1="17" y1="26" x2="22" y2="27" />
            <line x1="20" y1="21" x2="25" y2="22" />
          </g>
          <path d="M31 12Q24 16 27 23T20 36" fill="none" stroke="#8fc6e0" stroke-width="6.6" stroke-linecap="round" />
          <path d="M31 12Q24 16 27 23T20 36" fill="none" stroke="#dbeef6" stroke-width="2.2" stroke-dasharray="4 5" stroke-linecap="round" />
          <g transform="translate(31 12) rotate(160)">
            <ellipse cx="0" cy="0" rx="4.8" ry="3.6" fill="#8fc6e0" />
            <circle cx="1.2" cy="-1" r="0.9" fill="#fff" />
            <circle cx="1.5" cy="-1" r="0.35" fill="#111" />
          </g>
        </svg>
      `,
      trafico: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <rect x="5" y="4" width="38" height="40" rx="11" fill="#f5ebd8" stroke="#dbc5a0" stroke-width="1.5" />
          <rect x="13" y="7" width="22" height="34" rx="8" fill="#39444c" />
          <rect x="10" y="7" width="3" height="34" rx="2" fill="#d8c39d" />
          <rect x="35" y="7" width="3" height="34" rx="2" fill="#d8c39d" />
          <path d="M24 10V38" stroke="#f6efe1" stroke-width="2.2" stroke-dasharray="4 4" opacity="0.88" />
          <rect x="16.5" y="10.5" width="6.8" height="11.5" rx="3" fill="#ff7c4d" />
          <rect x="18.3" y="13" width="3.3" height="3.4" rx="1.1" fill="#e8f5ff" opacity="0.9" />
          <rect x="24.5" y="23.5" width="7.6" height="12.6" rx="3.2" fill="#4f8eff" />
          <rect x="26.6" y="26.3" width="3.4" height="3.7" rx="1.1" fill="#e8f5ff" opacity="0.92" />
          <circle cx="17.5" cy="31.5" r="3.8" fill="#f4c446" stroke="#cd9821" stroke-width="1.4" />
          <circle cx="17.5" cy="31.5" r="1.4" fill="#fff6d7" />
        </svg>
      `,
      buscaminas: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="11" fill="#fbf3e2" stroke="#d9c4a0" stroke-width="1.5" />
          <rect x="9" y="9" width="30" height="30" rx="8" fill="#e6d9bf" stroke="#cab38c" stroke-width="1.1" />
          <g>
            <rect x="12" y="12" width="6" height="6" rx="1.6" fill="#fffefb" stroke="#ccc0a8" />
            <rect x="19" y="12" width="6" height="6" rx="1.6" fill="#fffefb" stroke="#ccc0a8" />
            <rect x="26" y="12" width="6" height="6" rx="1.6" fill="#f1e7d4" stroke="#ccc0a8" />
            <rect x="12" y="19" width="6" height="6" rx="1.6" fill="#fffefb" stroke="#ccc0a8" />
            <rect x="19" y="19" width="6" height="6" rx="1.6" fill="#f1e7d4" stroke="#ccc0a8" />
            <rect x="26" y="19" width="6" height="6" rx="1.6" fill="#fffefb" stroke="#ccc0a8" />
            <rect x="12" y="26" width="6" height="6" rx="1.6" fill="#fffefb" stroke="#ccc0a8" />
            <rect x="19" y="26" width="6" height="6" rx="1.6" fill="#fffefb" stroke="#ccc0a8" />
            <rect x="26" y="26" width="6" height="6" rx="1.6" fill="#fffefb" stroke="#ccc0a8" />
          </g>
          <text x="21.9" y="23.5" text-anchor="middle" font-size="7.8" font-weight="800" fill="#2f69d3">1</text>
          <text x="30" y="30.5" text-anchor="middle" font-size="7.6" font-weight="800" fill="#cc553f">⚑</text>
          <text x="15" y="30.5" text-anchor="middle" font-size="7.1" font-weight="800" fill="#6f5137">✹</text>
        </svg>
      `,
      memory: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="11" fill="#eef4fb" stroke="#cddae7" stroke-width="1.5" />
          <g transform="translate(11 9)">
            <g transform="rotate(-8 9 12)">
              <rect x="0" y="3" width="16" height="22" rx="5" fill="#93bcff" stroke="#7097d8" />
              <path d="M4 12H12M8 8V20" stroke="rgba(255,255,255,0.36)" stroke-width="2.3" stroke-linecap="round" />
            </g>
            <g transform="translate(10)">
              <rect x="0" y="0" width="16" height="22" rx="5" fill="#fffdf9" stroke="#d7d0c5" />
              <text x="8" y="15" text-anchor="middle" font-size="9">🦊</text>
            </g>
            <g transform="translate(18 4) rotate(9 8 11)">
              <rect x="0" y="0" width="16" height="22" rx="5" fill="#fffdf9" stroke="#d7d0c5" />
              <text x="8" y="15" text-anchor="middle" font-size="9">🐻</text>
            </g>
          </g>
        </svg>
      `,
      sokoban: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="sokGlyphFrame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fff9ef" />
              <stop offset="100%" stop-color="#f1e1c5" />
            </linearGradient>
            <linearGradient id="sokGlyphBoard" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f3e4ca" />
              <stop offset="100%" stop-color="#e3ccaa" />
            </linearGradient>
            <linearGradient id="sokGlyphWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#d7ad80" />
              <stop offset="100%" stop-color="#b88453" />
            </linearGradient>
            <linearGradient id="sokGlyphBox" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#efbe76" />
              <stop offset="100%" stop-color="#cf8741" />
            </linearGradient>
            <linearGradient id="sokGlyphPlayer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#87b8ff" />
              <stop offset="100%" stop-color="#4f82ef" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="40" height="40" rx="11" fill="url(#sokGlyphFrame)" stroke="#dcc5a3" stroke-width="1.5" />
          <rect x="9" y="9" width="30" height="30" rx="9" fill="#f8efdf" stroke="#dfc8a6" stroke-width="1" />
          <rect x="12" y="12" width="24" height="24" rx="7" fill="url(#sokGlyphBoard)" stroke="#d1b185" stroke-width="1" />
          <g fill="url(#sokGlyphWall)">
            <rect x="14" y="14" width="6" height="6" rx="2" />
            <rect x="21" y="14" width="6" height="6" rx="2" />
            <rect x="28" y="14" width="6" height="6" rx="2" />
            <rect x="14" y="21" width="6" height="6" rx="2" />
            <rect x="28" y="21" width="6" height="6" rx="2" />
            <rect x="14" y="28" width="6" height="6" rx="2" />
          </g>
          <rect x="21" y="21" width="6" height="6" rx="2" fill="#fffaf1" stroke="#d5c4a5" stroke-width="0.9" />
          <rect x="21" y="28" width="6" height="6" rx="2" fill="#fffaf1" stroke="#d5c4a5" stroke-width="0.9" />
          <circle cx="22.5" cy="24" r="3.3" fill="none" stroke="#63aa70" stroke-width="1.8" />
          <rect x="21.5" y="20.5" width="9" height="9" rx="2.4" fill="url(#sokGlyphBox)" stroke="#aa7038" stroke-width="1" />
          <path d="M21.5 25H30.5M26 20.5V29.5" stroke="rgba(255,255,255,0.34)" stroke-width="0.9" />
          <circle cx="28.8" cy="29.2" r="4.2" fill="url(#sokGlyphPlayer)" stroke="#3a66cb" stroke-width="1.2" />
          <circle cx="27.7" cy="27.6" r="1.1" fill="#eef6ff" />
        </svg>
      `
    };

    return glyphs[gameId] || "";
  }

  function renderHome(vm) {
    const baseGames = Array.isArray(vm.games) ? vm.games : [];
    if (baseGames.length === 0) {
      return `
        <section class="screen home-screen home-library-screen is-catalog">
          <header class="card home-library-header">
            <div class="home-catalog-brand">
              <div class="home-catalog-icon" aria-hidden="true"><span></span><span></span><span></span></div>
              <div class="home-catalog-title-wrap">
                <h1 class="home-catalog-title home-catalog-title-playful" aria-label="Minijuegos">${renderPlayfulTitle("Minijuegos")}</h1>
                <p class="home-catalog-signature">Flia. Olivero Escorcia</p>
              </div>
            </div>
          </header>
          <section class="card home-library-list">
            <p class="home-secondary-text">No hay juegos disponibles por ahora.</p>
          </section>
        </section>
      `;
    }
    const games = getHomeCatalog(vm);
    const activeIndex = normalizeHomeIndex(vm);
    const activeGame = games[activeIndex];
    const motionClass = homeMotionDir > 0 ? "is-motion-next" : homeMotionDir < 0 ? "is-motion-prev" : "";
    homeMotionDir = 0;

    function profileForGame(game) {
      const map = {
        tictactoe: {
          accent: "#56bcff",
          glow: "rgba(86, 188, 255, 0.24)",
          description: "Clasico rapido",
          icon: "XO",
          energy: "Tres marcas y victoria."
        },
        connect4: {
          accent: "#ff9d3d",
          glow: "rgba(255, 157, 61, 0.24)",
          description: "Conecta y gana",
          icon: "4R",
          energy: "Fichas, columnas y remontadas."
        },
        damas: {
          accent: "#ff5d86",
          glow: "rgba(255, 93, 134, 0.22)",
          description: "Captura obligatoria",
          icon: "DM",
          energy: "Tacto fino y cadenas de captura."
        },
        parchis: {
          accent: "#83d44f",
          glow: "rgba(131, 212, 79, 0.22)",
          description: "Clasico de fichas",
          icon: "P",
          energy: "Caos familiar del bueno."
        },
        "escaleras-serpientes": {
          accent: "#79c95a",
          glow: "rgba(121, 201, 90, 0.24)",
          description: "Sube y esquiva",
          icon: "ES",
          energy: "Dados, rebotes y serpientes."
        },
        trafico: {
          accent: "#62a8ff",
          glow: "rgba(98, 168, 255, 0.22)",
          description: "Carriles y reflejos",
          icon: "TR",
          energy: "Coches, monedas y escapadas."
        },
        buscaminas: {
          accent: "#5b93ff",
          glow: "rgba(91, 147, 255, 0.24)",
          description: "Minas y banderas",
          icon: "BM",
          energy: "Pistas cortas y riesgo medido."
        },
        memory: {
          accent: "#74a8ff",
          glow: "rgba(116, 168, 255, 0.24)",
          description: "Memoria visual",
          icon: "PJ",
          energy: "Destapa, recuerda y empareja."
        },
        sokoban: {
          accent: "#e39b57",
          glow: "rgba(227, 155, 87, 0.24)",
          description: "Cajas y objetivos",
          icon: "SK",
          energy: "Empuja, ordena y no te encierres."
        }
      };

      const base = map[game?.id] || {
        accent: "#56bcff",
        glow: "rgba(86, 188, 255, 0.24)",
        description: "Partida familiar",
        icon: "*",
        energy: "Listo para jugar."
      };

      const playersText =
        game && game.minPlayers === game.maxPlayers
          ? `${game.minPlayers} ${game.minPlayers === 1 ? "jugador" : "jugadores"}`
          : `${game?.minPlayers || 2}-${game?.maxPlayers || 4} jugadores`;

      return {
        ...base,
        playersText
      };
    }

    const activeProfile = profileForGame(activeGame);
    const gameCountLabel = `${games.length} juegos`;
    const playerSpreadLabel = games.length > 1 ? "Local y familiar" : activeProfile.playersText;

    return `
      <section class="screen home-screen home-library-screen is-catalog">
        <header class="card home-library-header">
          <div class="home-catalog-brand">
            <div class="home-catalog-icon" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="home-catalog-title-wrap">
              <h1 class="home-catalog-title home-catalog-title-playful" aria-label="Minijuegos">${renderPlayfulTitle("Minijuegos")}</h1>
              <p class="home-catalog-signature">Flia. Olivero Escorcia</p>
            </div>
          </div>
          <div class="home-library-header-note">
            <span class="home-note-pill">${escapeHtml(gameCountLabel)}</span>
            <span class="home-note-pill is-soft">${escapeHtml(playerSpreadLabel)}</span>
          </div>
        </header>

        <section class="home-hero-stage">
          <article class="card home-family-hero ${motionClass}">
            <div class="home-family-art">
              <img class="home-family-art-image" src="./assets/home-hero-family.png" alt="Imagen principal familiar de Minijuegos" />
            </div>
          </article>
        </section>

        <section class="home-games-section" id="home-games-section">
          <div class="home-games-heading">
            <h2 class="home-games-title" aria-label="Minijuegos">${renderPlayfulTitle("Minijuegos")}</h2>
            <p class="home-games-subtitle">Juegos rápidos, familiares y listos para jugar en el mismo dispositivo.</p>
          </div>

          <section class="home-games-grid" aria-label="Catalogo de juegos">
            ${games
              .map((game, index) => {
                const profile = profileForGame(game);
                return `
                  <article class="card home-game-card is-${escapeHtml(game.id)} ${index === activeIndex ? "is-active" : ""}" style="--home-game-accent:${profile.accent};--home-game-glow:${profile.glow}">
                    <button
                      class="home-game-card-hit"
                      data-action="home-select"
                      data-home-index="${index}"
                      aria-label="Seleccionar ${escapeHtml(game.name)}"
                    ></button>
                    <div class="home-game-card-top">
                      <button
                        class="home-game-card-icon-button"
                        data-action="open-game"
                        data-game-id="${game.id}"
                        aria-label="Jugar a ${escapeHtml(game.name)}"
                      >
                        <span class="home-game-card-icon is-${escapeHtml(game.id)}">${escapeHtml(profile.icon)}</span>
                        <span class="home-game-card-glyph is-${escapeHtml(game.id)}" aria-hidden="true">${renderHomeGameGlyph(game.id)}</span>
                      </button>
                      <span class="home-game-card-players">${escapeHtml(profile.playersText)}</span>
                    </div>
                    <div class="home-game-card-media">
                      ${game.renderCardIllustration ? game.renderCardIllustration() : '<div class="game-illustration"></div>'}
                    </div>
                    <div class="home-game-card-copy">
                      <h3 class="home-game-card-title">${escapeHtml(game.name)}</h3>
                      <p class="home-game-card-subtitle">${escapeHtml(profile.description || game.tagline || "Listo para jugar")}</p>
                    </div>
                    <div class="home-game-card-actions">
                      <button class="btn btn-primary" data-action="open-game" data-game-id="${game.id}">Jugar</button>
                    </div>
                  </article>
                `;
              })
              .join("")}
          </section>
        </section>
      </section>
    `;
  }

  function renderConfig(vm) {
    const game = vm.game;
    if (!game) {
      return renderHome(vm);
    }

    const playersRow =
      game.minPlayers === game.maxPlayers
        ? `<p class="info-line">Numero de jugadores fijo: ${game.minPlayers}</p>`
        : `<div class="player-count-row">${Array.from({ length: game.maxPlayers - game.minPlayers + 1 }, (_, i) => game.minPlayers + i)
            .map(
              (count) =>
                `<button class="pill ${vm.config.playerCount === count ? "is-active" : ""}" data-action="select-player-count" data-player-count="${count}">${count} jugadores</button>`
            )
            .join("")}</div>`;

    const namesFields = Array.from({ length: vm.config.playerCount }, (_, index) => {
      const current = vm.config.names[index] || "";
      return `
        <label class="field">
          <span class="field-label">Jugador ${index + 1}</span>
          <input
            class="input"
            type="text"
            maxlength="14"
            value="${escapeHtml(current)}"
            data-field="player-name"
            data-index="${index}"
            placeholder="Jugador ${index + 1}"
          />
        </label>
      `;
    }).join("");

    const namesBlock = game.hidePlayerNames
      ? ""
      : `
          <div class="block">
            <h3 class="block-title">Nombres</h3>
            <div class="fields-grid">${namesFields}</div>
          </div>
        `;

    const gameConfigPanel = game.renderConfigPanel
      ? game.renderConfigPanel({
          options: vm.config.gameOptions || {},
          playerCount: vm.config.playerCount
        })
      : "";

    return `
      <section class="screen">
        ${renderTopbar({
          leftAction: "go-home",
          leftLabel: "Volver",
          title: game.name,
          subtitle: "Configuracion",
          showRules: true
        })}

        <section class="card config-card">
          <div class="block">
            <h3 class="block-title">Modo de juego</h3>
            <p class="info-line">Partida local en este dispositivo.</p>
          </div>

          <div class="block">
            <h3 class="block-title">Numero de jugadores</h3>
            ${playersRow}
          </div>

          ${namesBlock}

          ${gameConfigPanel}

          <p class="form-error">${escapeHtml(vm.config.error || "")}</p>

          <div class="action-row">
            <button class="btn btn-primary" data-action="config-continue">Empezar partida</button>
            <button class="btn btn-secondary" data-action="go-home">Volver al inicio</button>
          </div>
        </section>
      </section>
    `;
  }

  function renderPlayerChips(session, game) {
    const activeSlot = game.getTurnSlot(session.state);
    return session.players
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map(
        (player) => `
          <article class="player-chip ${!game.getResult(session.state) && activeSlot === player.slot ? "is-active" : ""}">
            <span class="player-token" style="background:${player.identity.color}">${escapeHtml(player.identity.icon)}</span>
            <span class="player-name">${escapeHtml(player.name)}</span>
          </article>
        `
      )
      .join("");
  }

  function renderGame(vm) {
    const session = vm.session;
    const game = vm.game;
    if (!session || !game) {
      return renderHome(vm);
    }

    const turnText = game.getTurnMessage({ state: session.state, players: session.players, options: session.options });
    const activeSlot = game.getTurnSlot(session.state);
    const active = session.players.find((player) => player.slot === activeSlot);
    const showTurnMessage = !game.hideGlobalTurnMessage;

    return `
      <section class="screen game-layout game-screen-${escapeHtml(game.id)}">
        ${renderTopbar({
          leftAction: "game-back",
          leftLabel: "Volver",
          title: game.name,
          subtitle: session.modeLabel,
          showRules: true
        })}

        ${
          showTurnMessage
            ? `<p class="turn-message">${
                game.getResult(session.state) || game.useCustomTurnMessage
                  ? escapeHtml(turnText)
                  : `Turno de <span class="turn-player" style="color:${active ? active.identity.color : "#233042"}">${escapeHtml(active ? active.name : "Jugador")}</span>`
              }</p>`
            : ""
        }

        <section class="board-wrap">
          ${game.renderBoard({
            state: session.state,
            players: session.players,
            options: session.options,
            canAct: vm.canAct,
            uiState: vm.uiState
          })}
        </section>

        ${
          game.hideDefaultPlayerChips
            ? ""
            : `
              <section class="player-chip-list">
                ${renderPlayerChips(session, game)}
              </section>
            `
        }

        <section class="actions-bottom">
          <button class="btn btn-secondary" data-action="restart-game">Reiniciar partida</button>
          <button class="btn btn-secondary" data-action="new-game">Nueva partida</button>
          <button class="btn btn-ghost" data-action="go-home">Volver al inicio</button>
        </section>
      </section>
    `;
  }

  function renderRules(vm) {
    const game = vm.game;
    if (!vm.rulesOpen || !game) {
      return "";
    }

    const sections = (game.rules || [])
      .map(
        (rule) => `
          <article class="rule-block">
            <p class="rule-label">${escapeHtml(rule.title)}</p>
            <p class="rule-text">${escapeHtml(rule.text)}</p>
          </article>
        `
      )
      .join("");

    return `
      <section class="overlay" data-overlay="rules">
        <article class="modal" role="dialog" aria-modal="true" aria-label="Reglas" data-modal-root>
          <header class="modal-head">
            <h3 class="modal-title">Reglas</h3>
            <button class="btn-icon" data-action="close-rules" aria-label="Cerrar reglas">X</button>
          </header>
          <div class="rules-grid">${sections}</div>
        </article>
      </section>
    `;
  }

  function renderResult(vm) {
    const session = vm.session;
    const game = vm.game;
    if (!session || !game || !game.getResult(session.state)) {
      return "";
    }

    const data = game.formatResult
      ? game.formatResult({ state: session.state, players: session.players, options: session.options })
      : null;

    if (!data) {
      return "";
    }

    const rankingBlock =
      Array.isArray(data.ranking) && data.ranking.length > 0
        ? `
          <ol class="result-ranking-list">
            ${data.ranking.map((name, index) => `<li>${index + 1}o ${escapeHtml(name)}</li>`).join("")}
          </ol>
        `
        : "";

    return `
      <section class="overlay" data-overlay="result">
        <article class="modal modal-result" role="dialog" aria-modal="true" aria-label="Resultado" data-modal-root>
          <div class="result-icon ${escapeHtml(data.iconClass || "draw")}">${escapeHtml(data.iconText || "=")}</div>
          <h3 class="result-title">${escapeHtml(data.title || "Resultado")}</h3>
          <p class="result-sub">${escapeHtml(data.subtitle || "")}</p>
          ${rankingBlock}

          <div class="action-row">
            <button class="btn btn-primary" data-action="play-again">Jugar otra vez</button>
            <button class="btn btn-secondary" data-action="go-home">Volver al inicio</button>
          </div>
        </article>
      </section>
    `;
  }

  function hasGameResult(vm) {
    return Boolean(vm?.session && vm?.game && vm.game.getResult(vm.session.state));
  }

  function canPatchCurrentGame(nextVm) {
    const previousVm = currentVm;
    if (!previousVm || !nextVm) {
      return false;
    }

    if (previousVm.screen !== "game" || nextVm.screen !== "game") {
      return false;
    }

    if (!previousVm.game || !nextVm.game || previousVm.game.id !== nextVm.game.id) {
      return false;
    }

    if (typeof nextVm.game.patchBoardElement !== "function") {
      return false;
    }

    if (previousVm.rulesOpen !== nextVm.rulesOpen) {
      return false;
    }

    if (hasGameResult(previousVm) || hasGameResult(nextVm)) {
      return false;
    }

    return Boolean(appElement.querySelector(".board-wrap"));
  }

  function render(vm) {
    if (canPatchCurrentGame(vm)) {
      const boardWrap = appElement.querySelector(".board-wrap");
      const patched = boardWrap
        ? vm.game.patchBoardElement(boardWrap, {
            state: vm.session.state,
            players: vm.session.players,
            options: vm.session.options,
            canAct: vm.canAct,
            uiState: vm.uiState
          })
        : false;

      if (patched) {
        currentVm = vm;
        document.body.classList.toggle("is-home-screen", false);
        appElement.classList.toggle("app-shell-home", false);
        syncGameLoops(vm);
        return;
      }
    }

    currentVm = vm;
    if (vm.screen !== "home") {
      homeDrawerOpen = false;
    }
    let html = "";

    if (vm.screen === "home") {
      html = renderHome(vm);
    } else if (vm.screen === "config") {
      html = renderConfig(vm);
    } else if (vm.screen === "game") {
      html = renderGame(vm);
    } else {
      html = renderHome(vm);
    }

    html += renderRules(vm);
    html += renderResult(vm);

    document.body.classList.toggle("is-home-screen", vm.screen === "home");
    appElement.classList.toggle("app-shell-home", vm.screen === "home");
    appElement.innerHTML = html;
    syncGameLoops(vm);
  }

  function shouldRunTrafficLoop(vm = currentVm) {
    return Boolean(
      vm?.screen === "game" &&
      vm?.game?.id === "trafico" &&
      vm?.session?.state?.status === "playing" &&
      typeof onAction === "function"
    );
  }

  function clearTrafficTickLoop() {
    if (trafficTickFrame) {
      window.cancelAnimationFrame(trafficTickFrame);
      trafficTickFrame = null;
    }
    trafficLastFrameAt = 0;
    trafficDispatchInFlight = false;
  }

  function clearTrafficSwipeState() {
    trafficSwipeState = null;
  }

  function clearGameSwipeState() {
    gameSwipeState = null;
  }

  function queueTrafficFrame() {
    if (trafficTickFrame || !shouldRunTrafficLoop()) {
      return;
    }

    trafficTickFrame = window.requestAnimationFrame(async (timestamp) => {
      trafficTickFrame = null;

      if (!shouldRunTrafficLoop()) {
        clearTrafficTickLoop();
        return;
      }

      if (!trafficLastFrameAt) {
        trafficLastFrameAt = timestamp;
      }

      const deltaMs = Math.min(64, Math.max(0, timestamp - trafficLastFrameAt));
      trafficLastFrameAt = timestamp;

      if (trafficDispatchInFlight || deltaMs <= 0) {
        queueTrafficFrame();
        return;
      }

      trafficDispatchInFlight = true;

      try {
        await onAction("game-action", {
          action: {
            type: "tick",
            deltaMs
          }
        });
      } finally {
        trafficDispatchInFlight = false;
        if (shouldRunTrafficLoop()) {
          queueTrafficFrame();
        }
      }
    });
  }

  function syncTrafficTickLoop(vm) {
    if (!shouldRunTrafficLoop(vm)) {
      clearTrafficTickLoop();
      return;
    }

    queueTrafficFrame();
  }

  function shouldRunMinesTimer(vm = currentVm) {
    return Boolean(
      vm?.screen === "game" &&
      vm?.game?.id === "buscaminas" &&
      vm?.session?.state?.status === "playing" &&
      typeof onAction === "function"
    );
  }

  function clearMinesTimerLoop() {
    if (minesTimerId) {
      window.clearInterval(minesTimerId);
      minesTimerId = null;
    }
    minesTimerInFlight = false;
  }

  function syncMinesTimerLoop(vm) {
    if (!shouldRunMinesTimer(vm)) {
      clearMinesTimerLoop();
      return;
    }

    if (minesTimerId) {
      return;
    }

    minesTimerId = window.setInterval(async () => {
      if (!shouldRunMinesTimer()) {
        clearMinesTimerLoop();
        return;
      }

      if (minesTimerInFlight) {
        return;
      }

      minesTimerInFlight = true;

      try {
        await onAction("game-action", {
          action: {
            type: "tick-time",
            nowMs: Date.now()
          }
        });
      } finally {
        minesTimerInFlight = false;
        if (!shouldRunMinesTimer()) {
          clearMinesTimerLoop();
        }
      }
    }, 1000);
  }

  function shouldRunMemoryResolve(vm = currentVm) {
    return Boolean(
      vm?.screen === "game" &&
      vm?.game?.id === "memory" &&
      vm?.session?.state?.status === "resolving" &&
      Number.isFinite(vm?.session?.state?.resolveAtMs) &&
      typeof onAction === "function"
    );
  }

  function shouldRunSokobanAutoNext(vm = currentVm) {
    return Boolean(
      vm?.screen === "game" &&
      vm?.game?.id === "sokoban" &&
      vm?.session?.state?.status === "level-complete" &&
      typeof onAction === "function"
    );
  }

  function clearSokobanAutoNextLoop() {
    if (sokobanAutoNextTimerId) {
      window.clearTimeout(sokobanAutoNextTimerId);
      sokobanAutoNextTimerId = null;
    }
    sokobanAutoNextInFlight = false;
  }

  function syncSokobanAutoNextLoop(vm) {
    if (!shouldRunSokobanAutoNext(vm)) {
      clearSokobanAutoNextLoop();
      return;
    }

    if (sokobanAutoNextTimerId) {
      return;
    }

    sokobanAutoNextTimerId = window.setTimeout(async () => {
      sokobanAutoNextTimerId = null;

      if (!shouldRunSokobanAutoNext()) {
        clearSokobanAutoNextLoop();
        return;
      }

      if (sokobanAutoNextInFlight) {
        syncSokobanAutoNextLoop(currentVm);
        return;
      }

      sokobanAutoNextInFlight = true;

      try {
        await onAction("game-action", {
          action: {
            type: "next-level",
            nowMs: Date.now()
          }
        });
      } finally {
        sokobanAutoNextInFlight = false;
        if (!shouldRunSokobanAutoNext()) {
          clearSokobanAutoNextLoop();
        } else {
          syncSokobanAutoNextLoop(currentVm);
        }
      }
    }, 650);
  }

  function clearMemoryResolveLoop() {
    if (memoryResolveTimerId) {
      window.clearTimeout(memoryResolveTimerId);
      memoryResolveTimerId = null;
    }
    memoryResolveInFlight = false;
  }

  function syncMemoryResolveLoop(vm) {
    if (!shouldRunMemoryResolve(vm)) {
      clearMemoryResolveLoop();
      return;
    }

    if (memoryResolveTimerId) {
      return;
    }

    const resolveAtMs = Number(vm.session.state.resolveAtMs);
    const delayMs = Math.max(0, resolveAtMs - Date.now());

    memoryResolveTimerId = window.setTimeout(async () => {
      memoryResolveTimerId = null;

      if (!shouldRunMemoryResolve()) {
        clearMemoryResolveLoop();
        return;
      }

      if (memoryResolveInFlight) {
        syncMemoryResolveLoop(currentVm);
        return;
      }

      memoryResolveInFlight = true;

      try {
        await onAction("game-action", {
          action: {
            type: "resolve-mismatch",
            nowMs: Date.now()
          }
        });
      } finally {
        memoryResolveInFlight = false;
        if (!shouldRunMemoryResolve()) {
          clearMemoryResolveLoop();
        } else {
          syncMemoryResolveLoop(currentVm);
        }
      }
    }, delayMs);
  }

  function syncGameLoops(vm) {
    syncTrafficTickLoop(vm);
    syncMinesTimerLoop(vm);
    syncMemoryResolveLoop(vm);
    syncSokobanAutoNextLoop(vm);
  }

  function showToast(message, duration = 2200) {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }

    if (!message) {
      toastElement.innerHTML = "";
      return;
    }

    toastElement.innerHTML = `<div class="toast">${escapeHtml(message)}</div>`;
    toastTimer = window.setTimeout(() => {
      toastElement.innerHTML = "";
      toastTimer = null;
    }, duration);
  }

  function bind({ onAction: actionHandler, onField: fieldHandler, onOverlayClose: overlayHandler }) {
    onAction = actionHandler;
    onField = fieldHandler;
    onOverlayClose = overlayHandler;

    document.addEventListener("click", async (event) => {
      const target = event.target.closest("[data-action], [data-overlay]");
      if (!target) {
        return;
      }

      if (target.dataset.overlay) {
        const outside = !event.target.closest("[data-modal-root]");
        if (outside && onOverlayClose) {
          onOverlayClose();
        }
        return;
      }

      if (!onAction) {
        return;
      }

      const action = target.dataset.action;
      if (action === "home-select") {
        setHomeIndex(Number(target.dataset.homeIndex));
        return;
      }

      if (action === "home-prev") {
        shiftHomeIndexLinear(-1);
        return;
      }

      if (action === "home-next") {
        shiftHomeIndexLinear(1);
        return;
      }

      if (action === "toggle-home-drawer") {
        homeDrawerOpen = !homeDrawerOpen;
        if (currentVm) {
          render(currentVm);
        }
        return;
      }

      if (action === "close-home-drawer") {
        homeDrawerOpen = false;
        if (currentVm) {
          render(currentVm);
        }
        return;
      }

      if (action === "open-game") {
        homeDrawerOpen = false;
        await onAction("open-game", { gameId: target.dataset.gameId || "" });
        return;
      }

      if (action === "select-player-count") {
        await onAction("select-player-count", { playerCount: Number(target.dataset.playerCount) });
        return;
      }

      if (action === "set-game-option") {
        if (target instanceof HTMLSelectElement) {
          return;
        }

        await onAction("set-game-option", {
          key: String(target.dataset.option || ""),
          value: target.dataset.value,
          valueType: String(target.dataset.valueType || "string")
        });
        return;
      }

      if (action === "game-action") {
        const payload = normalizeActionPayload(target);
        if (payload) {
          await onAction("game-action", { action: payload });
        }
        return;
      }

      await onAction(action, {});
    });

    document.addEventListener("input", (event) => {
      const target = event.target;
      if (!target || !(target instanceof HTMLElement) || !onField) {
        return;
      }

      const field = target.dataset.field;
      if (!field) {
        return;
      }

      if (field === "player-name") {
        onField("player-name", target.value, { index: Number(target.dataset.index) });
      }
    });

    document.addEventListener("change", async (event) => {
      const target = event.target;
      if (!target || !(target instanceof HTMLElement) || !onAction) {
        return;
      }

      if (target.dataset.action !== "set-game-option") {
        return;
      }

      await onAction("set-game-option", {
        key: String(target.dataset.option || ""),
        value: "value" in target ? target.value : target.dataset.value,
        valueType: String(target.dataset.valueType || "string")
      });
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!target || !(target instanceof HTMLElement)) {
        return;
      }

      if (target.dataset.action !== "home-select") {
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      setHomeIndex(Number(target.dataset.homeIndex));
    });

    document.addEventListener("keydown", async (event) => {
      const interactiveTarget = event.target;
      if (
        interactiveTarget instanceof HTMLElement &&
        (interactiveTarget.tagName === "INPUT" ||
          interactiveTarget.tagName === "TEXTAREA" ||
          interactiveTarget.isContentEditable)
      ) {
        return;
      }

      if (!currentVm || currentVm.screen !== "game" || !onAction) {
        return;
      }

      if (typeof currentVm.game?.getKeyboardAction === "function") {
        const action = currentVm.game.getKeyboardAction({
          event,
          state: currentVm.session?.state || null,
          players: currentVm.session?.players || [],
          options: currentVm.session?.options || {},
          canAct: currentVm.canAct
        });

        if (action) {
          event.preventDefault();
          await onAction("game-action", { action });
          return;
        }
      }

      if (currentVm.game?.id !== "trafico") {
        return;
      }

      const status = currentVm.session?.state?.status;
      let action = null;

      if ((event.key === "ArrowLeft" || event.key.toLowerCase() === "a") && status === "playing") {
        action = { type: "steer-left" };
      } else if ((event.key === "ArrowRight" || event.key.toLowerCase() === "d") && status === "playing") {
        action = { type: "steer-right" };
      } else if ((event.key === " " || event.key === "Enter") && status === "ready") {
        action = { type: "start-run" };
      } else if ((event.key === " " || event.key.toLowerCase() === "p") && (status === "playing" || status === "paused")) {
        action = { type: "toggle-pause" };
      }

      if (!action) {
        return;
      }

      event.preventDefault();
      await onAction("game-action", { action });
    });

    document.addEventListener("contextmenu", async (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-mines-cell]") : null;
      if (
        !target ||
        !currentVm ||
        currentVm.screen !== "game" ||
        currentVm.game?.id !== "buscaminas" ||
        !currentVm.canAct ||
        target.hasAttribute("disabled") ||
        !onAction
      ) {
        return;
      }

      event.preventDefault();
      await onAction("game-action", {
        action: {
          type: "toggle-flag",
          cell: Number(target.dataset.cell),
          nowMs: Date.now()
        }
      });
    });

    document.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) {
        return;
      }

      if (event.target instanceof Element) {
        const homeZone = event.target.closest("[data-home-swipe]");
        if (homeZone && currentVm && currentVm.screen === "home") {
          homeSwipeStartX = touch.clientX;
        }

        const trafficZone = event.target.closest("[data-traffic-road]");
        if (
          trafficZone &&
          currentVm &&
          currentVm.screen === "game" &&
          currentVm.game?.id === "trafico" &&
          currentVm.session?.state?.status === "playing" &&
          onAction
        ) {
          trafficSwipeState = {
            identifier: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY
          };
        }

        const gameSwipeZone = event.target.closest("[data-game-swipe-zone]");
        if (
          gameSwipeZone &&
          currentVm &&
          currentVm.screen === "game" &&
          typeof currentVm.game?.getTouchAction === "function" &&
          onAction &&
          isCompactTouchViewport()
        ) {
          gameSwipeState = {
            identifier: touch.identifier,
            gameId: currentVm.game.id,
            startX: touch.clientX,
            startY: touch.clientY
          };
        }
      }
    });

    document.addEventListener("touchend", (event) => {
      if (homeSwipeStartX !== null && currentVm && currentVm.screen === "home") {
        const touch = event.changedTouches && event.changedTouches[0];
        if (touch) {
          const deltaX = touch.clientX - homeSwipeStartX;
          if (Math.abs(deltaX) >= 44) {
            shiftHomeIndex(deltaX < 0 ? 1 : -1);
          }
        }
      }
      homeSwipeStartX = null;

      if (
        trafficSwipeState &&
        currentVm &&
        currentVm.screen === "game" &&
        currentVm.game?.id === "trafico" &&
        onAction
      ) {
        const changedTouches = Array.from(event.changedTouches || []);
        const touch = changedTouches.find((item) => item.identifier === trafficSwipeState.identifier) || changedTouches[0];
        const startX = trafficSwipeState.startX;
        const startY = trafficSwipeState.startY;
        clearTrafficSwipeState();

        if (!touch) {
          return;
        }

        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        if (Math.abs(deltaX) < 32 || Math.abs(deltaX) <= Math.abs(deltaY) || trafficSwipeInFlight) {
          return;
        }

        trafficSwipeInFlight = true;
        Promise.resolve(
          onAction("game-action", {
            action: {
              type: deltaX < 0 ? "steer-left" : "steer-right"
            }
          })
        ).finally(() => {
          trafficSwipeInFlight = false;
        });
      } else {
        clearTrafficSwipeState();
      }

      if (
        !gameSwipeState ||
        !currentVm ||
        currentVm.screen !== "game" ||
        currentVm.game?.id !== gameSwipeState.gameId ||
        typeof currentVm.game?.getTouchAction !== "function" ||
        !onAction ||
        !isCompactTouchViewport()
      ) {
        clearGameSwipeState();
        return;
      }

      const gameTouches = Array.from(event.changedTouches || []);
      const gameTouch = gameTouches.find((item) => item.identifier === gameSwipeState.identifier) || gameTouches[0];
      if (!gameTouch) {
        clearGameSwipeState();
        return;
      }

      const action = currentVm.game.getTouchAction({
        startX: gameSwipeState.startX,
        startY: gameSwipeState.startY,
        endX: gameTouch.clientX,
        endY: gameTouch.clientY,
        state: currentVm.session?.state || null,
        players: currentVm.session?.players || [],
        options: currentVm.session?.options || {},
        canAct: currentVm.canAct
      });
      clearGameSwipeState();

      if (!action || gameSwipeInFlight) {
        return;
      }

      gameSwipeInFlight = true;
      Promise.resolve(
        onAction("game-action", { action })
      ).finally(() => {
        gameSwipeInFlight = false;
      });
    });

    document.addEventListener("touchcancel", () => {
      homeSwipeStartX = null;
      clearTrafficSwipeState();
      clearGameSwipeState();
    });
  }

  return {
    bind,
    render,
    showToast
  };
}
