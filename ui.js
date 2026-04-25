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
  let viewportRefreshFrame = null;
  let homeActiveIndex = 0;
  let homeDrawerOpen = false;
  let homeMotionDir = 0;
  let footballTickFrame = null;
  let footballLastFrameAt = 0;
  let footballDispatchInFlight = false;
  let billiardsTickFrame = null;
  let billiardsLastFrameAt = 0;
  let billiardsDispatchInFlight = false;
  let tankTickTimerId = null;
  let tankLastTickAt = 0;
  let tankDispatchInFlight = false;
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

  function renderTopbar({
    leftAction,
    leftLabel,
    title,
    subtitle,
    showRules = false,
    showFullscreen = false,
    fullscreenActive = false,
    extraActions = []
  }) {
    const actionButtons = [
      ...extraActions.map((action) => {
        const className = escapeHtml(action.className || "btn-icon btn-icon-text");
        const label = escapeHtml(action.label || "");
        const ariaLabel = escapeHtml(action.ariaLabel || action.label || "");
        const actionName = escapeHtml(action.action || "");
        if (!actionName || !label) {
          return "";
        }
        return `<button class="${className}" data-action="${actionName}" aria-label="${ariaLabel}">${label}</button>`;
      }),
      showRules ? '<button class="btn-icon" data-action="open-rules" aria-label="Abrir reglas">?</button>' : "",
      showFullscreen
        ? `<button class="btn-icon btn-icon-text" data-action="toggle-fullscreen" aria-label="${fullscreenActive ? "Salir de pantalla completa" : "Entrar en pantalla completa"}">${fullscreenActive ? "Salir" : "Full"}</button>`
        : ""
    ]
      .filter(Boolean)
      .join("");

    return `
      <header class="topbar">
        <div class="topbar-main">
          <button class="btn btn-secondary" data-action="${leftAction}">${escapeHtml(leftLabel)}</button>
          <div class="topbar-copy">
            <h2 class="topbar-title">${escapeHtml(title)}</h2>
            ${subtitle ? `<p class="topbar-sub">${escapeHtml(subtitle)}</p>` : ""}
          </div>
        </div>
        ${actionButtons ? `<div class="topbar-actions">${actionButtons}</div>` : ""}
      </header>
    `;
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
          <circle cx="22" cy="22" r="1.4" fill="#2f69d3" />
          <circle cx="22" cy="18.8" r="1.05" fill="#2f69d3" />
          <path d="M29.4 25.5V32.5" stroke="#8d6447" stroke-width="1.5" stroke-linecap="round" />
          <path d="M29.4 25.8L34 27.7L29.4 29.7Z" fill="#de6a51" stroke="#b95039" stroke-width="0.7" stroke-linejoin="round" />
          <circle cx="15" cy="29.7" r="1.9" fill="#6f5137" />
          <g stroke="#6f5137" stroke-width="1.15" stroke-linecap="round">
            <line x1="15" y1="25.7" x2="15" y2="27.2" />
            <line x1="15" y1="32.2" x2="15" y2="33.7" />
            <line x1="10.9" y1="29.7" x2="12.4" y2="29.7" />
            <line x1="17.6" y1="29.7" x2="19.1" y2="29.7" />
            <line x1="12" y1="26.7" x2="13.1" y2="27.8" />
            <line x1="16.9" y1="31.6" x2="18" y2="32.7" />
            <line x1="12" y1="32.7" x2="13.1" y2="31.6" />
            <line x1="16.9" y1="27.8" x2="18" y2="26.7" />
          </g>
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
              <circle cx="8" cy="10" r="4.1" fill="#f0c568" stroke="#c89a34" stroke-width="0.9" />
              <circle cx="8" cy="10" r="1.35" fill="#fff5d4" />
              <path d="M8 14.7L11.9 18.6L8 22.5L4.1 18.6Z" fill="#e68166" stroke="#bc5d43" stroke-width="0.9" />
            </g>
            <g transform="translate(18 4) rotate(9 8 11)">
              <rect x="0" y="0" width="16" height="22" rx="5" fill="#fffdf9" stroke="#d7d0c5" />
              <path d="M8 6.6L10 10.6L14.4 11.2L11.2 14.2L12 18.5L8 16.4L4 18.5L4.8 14.2L1.6 11.2L6 10.6Z" fill="#78a6ec" stroke="#4e79bf" stroke-width="0.9" stroke-linejoin="round" />
              <rect x="4.4" y="18" width="7.2" height="2.5" rx="1.2" fill="#78b38a" stroke="#4b8761" stroke-width="0.9" />
            </g>
          </g>
        </svg>
      `,
      billar: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="billarGlyphWood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fff6e8" />
              <stop offset="100%" stop-color="#ecd8b3" />
            </linearGradient>
            <linearGradient id="billarGlyphFelt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#76aa8c" />
              <stop offset="100%" stop-color="#3a654f" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="40" height="40" rx="11" fill="url(#billarGlyphWood)" stroke="#dcc4a1" stroke-width="1.5" />
          <rect x="8.5" y="11" width="31" height="26" rx="8.8" fill="#966c40" stroke="#6d4d2a" stroke-width="1.1" />
          <rect x="12" y="14.2" width="24" height="19.6" rx="5.8" fill="url(#billarGlyphFelt)" stroke="#dce9dd" stroke-width="0.9" />
          <g fill="#2a211a">
            <circle cx="12" cy="14.2" r="3"></circle>
            <circle cx="24" cy="14.2" r="2.6"></circle>
            <circle cx="36" cy="14.2" r="3"></circle>
            <circle cx="12" cy="33.8" r="3"></circle>
            <circle cx="24" cy="33.8" r="2.6"></circle>
            <circle cx="36" cy="33.8" r="3"></circle>
          </g>
          <path d="M17 24H23.3" stroke="rgba(255,255,255,0.74)" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="15.4" cy="24" r="3.4" fill="#fffaf1" stroke="#d8c6a2" stroke-width="1" />
          <circle cx="28.2" cy="24" r="3.4" fill="#e68166" stroke="#bc5d43" stroke-width="1" />
          <circle cx="31.9" cy="20.2" r="3.4" fill="#78a6ec" stroke="#4e79bf" stroke-width="1" />
          <circle cx="31.9" cy="27.8" r="3.4" fill="#f0c568" stroke="#c29435" stroke-width="1" />
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
              <stop offset="0%" stop-color="#f6ead4" />
              <stop offset="100%" stop-color="#e5cfab" />
            </linearGradient>
            <linearGradient id="sokGlyphWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#dcb58a" />
              <stop offset="100%" stop-color="#bd8956" />
            </linearGradient>
            <linearGradient id="sokGlyphBox" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#efbf78" />
              <stop offset="100%" stop-color="#cf8741" />
            </linearGradient>
            <linearGradient id="sokGlyphPlayer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#87b8ff" />
              <stop offset="100%" stop-color="#4f82ef" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="40" height="40" rx="11" fill="url(#sokGlyphFrame)" stroke="#dcc5a3" stroke-width="1.5" />
          <rect x="8.5" y="8.5" width="31" height="31" rx="9.5" fill="#f8efdf" stroke="#dfc8a6" stroke-width="1" />
          <rect x="11.5" y="11.5" width="25" height="25" rx="7.5" fill="url(#sokGlyphBoard)" stroke="#d1b185" stroke-width="1" />
          <g fill="url(#sokGlyphWall)">
            <rect x="14" y="14" width="5.2" height="5.2" rx="1.7" />
            <rect x="20.4" y="14" width="5.2" height="5.2" rx="1.7" />
            <rect x="26.8" y="14" width="5.2" height="5.2" rx="1.7" />
            <rect x="14" y="20.4" width="5.2" height="5.2" rx="1.7" />
            <rect x="26.8" y="20.4" width="5.2" height="5.2" rx="1.7" />
            <rect x="14" y="26.8" width="5.2" height="5.2" rx="1.7" />
            <rect x="20.4" y="26.8" width="5.2" height="5.2" rx="1.7" />
            <rect x="26.8" y="26.8" width="5.2" height="5.2" rx="1.7" />
          </g>
          <rect x="20.4" y="20.4" width="5.2" height="5.2" rx="1.7" fill="#fffaf1" stroke="#d5c4a5" stroke-width="0.8" />
          <circle cx="18.6" cy="23" r="2.65" fill="none" stroke="#63aa70" stroke-width="1.65" />
          <rect x="20.25" y="19.45" width="7.5" height="7.5" rx="2.05" fill="url(#sokGlyphBox)" stroke="#aa7038" stroke-width="1" />
          <path d="M20.25 23.2H27.75M24 19.45V26.95" stroke="rgba(255,255,255,0.34)" stroke-width="0.8" />
          <circle cx="29.35" cy="23" r="3.6" fill="url(#sokGlyphPlayer)" stroke="#3a66cb" stroke-width="1.15" />
          <circle cx="28.2" cy="21.65" r="0.98" fill="#eef6ff" />
        </svg>
      `,
      "futbol-turnos": `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="ftGlyphFrame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fff8ec" />
              <stop offset="100%" stop-color="#f1debc" />
            </linearGradient>
            <linearGradient id="ftGlyphPitch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#dff2de" />
              <stop offset="100%" stop-color="#9fc8a0" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="40" height="40" rx="11" fill="url(#ftGlyphFrame)" stroke="#dcc4a1" stroke-width="1.5" />
          <rect x="8" y="9" width="32" height="30" rx="9" fill="url(#ftGlyphPitch)" stroke="#8cb08e" stroke-width="1.1" />
          <path d="M24 9V39M8 24H40M18 24a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="none" stroke="rgba(250,251,246,0.92)" stroke-width="1.6" />
          <rect x="5" y="17" width="4" height="14" rx="2.4" fill="#f6f0e3" stroke="#d6c3a4" stroke-width="0.8" />
          <rect x="39" y="17" width="4" height="14" rx="2.4" fill="#f6f0e3" stroke="#d6c3a4" stroke-width="0.8" />
          <circle cx="17" cy="18" r="4.2" fill="#e6775d" stroke="#bf5a43" stroke-width="1.3" />
          <circle cx="15.7" cy="16.4" r="1.1" fill="#fff4ef" />
          <circle cx="31" cy="30" r="4.2" fill="#4f84ea" stroke="#355fb9" stroke-width="1.3" />
          <circle cx="29.7" cy="28.4" r="1.1" fill="#eef4ff" />
          <circle cx="24" cy="24" r="2.6" fill="#fffaf1" stroke="#d4c19d" stroke-width="1.1" />
        </svg>
      `,
      tanques: `
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="tankGlyphSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#edf7ff" />
              <stop offset="100%" stop-color="#eef2e6" />
            </linearGradient>
            <linearGradient id="tankGlyphGround" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#dfc88f" />
              <stop offset="100%" stop-color="#bc945c" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="40" height="40" rx="11" fill="#fff7ea" stroke="#dcc4a1" stroke-width="1.5" />
          <rect x="8" y="8.5" width="32" height="31" rx="9.5" fill="url(#tankGlyphSky)" stroke="#dccfb7" stroke-width="1" />
          <circle cx="15" cy="15" r="4.4" fill="rgba(248,232,180,0.86)" />
          <path d="M8 39V28.5C13.2 25.6 18 25.7 22.2 28.4C26.9 31.4 31.2 31.4 35.8 28.2C37.3 27.2 38.6 26.7 40 26.5V39Z" fill="url(#tankGlyphGround)" stroke="#a98753" stroke-width="1.15" />
          <path d="M22 25.5Q24.7 18.7 29.4 16.2" fill="none" stroke="rgba(84,111,96,0.92)" stroke-width="1.9" stroke-dasharray="3.4 3.8" stroke-linecap="round" />
          <circle cx="29.4" cy="16.2" r="1.9" fill="#fff9ef" stroke="#cab48b" stroke-width="0.85" />
          <g transform="translate(15.8 28.8)">
            <ellipse cx="0" cy="5.8" rx="7.8" ry="2.6" fill="rgba(45,41,37,0.12)" />
            <rect x="-6.6" y="1.2" width="13.2" height="4.8" rx="2.2" fill="#685b48" />
            <rect x="-5.3" y="-4.4" width="10.6" height="5.8" rx="2.6" fill="#de7559" stroke="#b3543d" stroke-width="0.95" />
            <line x1="0.8" y1="-4.8" x2="8.6" y2="-8.2" stroke="#6e675e" stroke-width="2.8" stroke-linecap="round" />
            <circle cx="0" cy="-4.8" r="3.2" fill="#de7559" stroke="#b3543d" stroke-width="0.95" />
          </g>
          <g transform="translate(32.2 29.2)">
            <ellipse cx="0" cy="5.8" rx="7.8" ry="2.6" fill="rgba(45,41,37,0.12)" />
            <rect x="-6.6" y="1.2" width="13.2" height="4.8" rx="2.2" fill="#685b48" />
            <rect x="-5.3" y="-4.4" width="10.6" height="5.8" rx="2.6" fill="#5a87e8" stroke="#375eb8" stroke-width="0.95" />
            <line x1="-0.8" y1="-4.8" x2="-8.6" y2="-7.8" stroke="#6e675e" stroke-width="2.8" stroke-linecap="round" />
            <circle cx="0" cy="-4.8" r="3.2" fill="#5a87e8" stroke="#375eb8" stroke-width="0.95" />
          </g>
        </svg>
      `
    };

    return glyphs[gameId] || glyphs.tictactoe;
  }

  function renderHome(vm) {
    const baseGames = Array.isArray(vm.games) ? vm.games : [];
    if (baseGames.length === 0) {
      return `
        <div class="home-v2">
          <div class="home-v2-inner" style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
            <p style="color:var(--text-sub);font-size:1rem;">No hay juegos disponibles por ahora.</p>
          </div>
        </div>
      `;
    }
    const games = getHomeCatalog(vm);

    /* Perfil semántico por juego: tag + clase CSS de color */
    function profileForGame(game) {
      const map = {
        tictactoe:             { tag: "Lógica",     cls: "tag-logica"     },
        connect4:              { tag: "Estrategia", cls: "tag-estrategia" },
        damas:                 { tag: "Tablero",    cls: "tag-tablero"    },
        parchis:               { tag: "Familiar",   cls: "tag-familiar"   },
        "escaleras-serpientes":{ tag: "Suerte",     cls: "tag-suerte"     },
        trafico:               { tag: "Puzzle",     cls: "tag-puzzle"     },
        buscaminas:            { tag: "Lógica",     cls: "tag-logica"     },
        memory:                { tag: "Memoria",    cls: "tag-memoria"    },
        billar:                { tag: "Habilidad",  cls: "tag-habilidad"  },
        sokoban:               { tag: "Desafío",    cls: "tag-desafio"    },
        "futbol-turnos":       { tag: "Deportes",   cls: "tag-deportes"   },
        tanques:               { tag: "Acción",     cls: "tag-accion"     }
      };
      return map[game?.id] || { tag: "Juego", cls: "tag-default" };
    }

    const cardsHtml = games.map((game) => {
      const profile = profileForGame(game);
      const players = game.minPlayers === game.maxPlayers
        ? `${game.minPlayers} jug.`
        : `${game.minPlayers}–${game.maxPlayers} jug.`;
      return `
        <button
          class="game-card-v2"
          data-action="open-game"
          data-game-id="${game.id}"
          aria-label="Jugar a ${escapeHtml(game.name)}"
        >
          <div class="game-card-icon">
            <div class="game-card-icon-svg">
              ${renderHomeGameGlyph(game.id)}
            </div>
          </div>
          <div class="game-card-body">
            <h3 class="game-card-name">${escapeHtml(game.name)}</h3>
            <div class="game-card-meta">
              <span class="game-card-tag ${profile.cls}">${profile.tag}</span>
              <span class="game-card-players">${players}</span>
            </div>
          </div>
        </button>
      `;
    }).join("");

    return `
      <!-- Topbar HOME V2 -->
      <header class="home-topbar" role="banner">
        <div class="home-topbar-brand">
          <div class="home-topbar-icon">
            <img src="./assets/icono.png" alt="Minijuegos" />
          </div>
          <h1 class="home-topbar-name">Minijuegos</h1>
        </div>
        <div class="home-topbar-actions">
          <button class="home-topbar-btn" aria-label="Información" data-action="open-rules-home">
            <span class="material-symbols-outlined" style="font-size:20px;">help_outline</span>
          </button>
        </div>
      </header>

      <!-- Contenedor principal HOME V2 -->
      <div class="home-v2">
        <div class="home-v2-inner">

          <!-- HERO -->
          <section class="home-hero" aria-label="Bienvenida">
            <img
              class="home-hero-img"
              src="./assets/home-hero-family.png"
              alt="Familia jugando juntos"
              loading="eager"
              fetchpriority="high"
            />
            <div class="home-hero-overlay" aria-hidden="true"></div>
            <div class="home-hero-body">
              <div class="home-hero-tag">
                <span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:'FILL' 1;">stars</span>
                Colección local
              </div>
              <h2 class="home-hero-title">Juegos para<br>toda la familia</h2>
              <p class="home-hero-sub">Clásicos de siempre, listos para jugar sin conexión.</p>
            </div>
          </section>

          <!-- CATÁLOGO -->
          <section class="home-catalog" aria-label="Catálogo de juegos">
            <div class="home-catalog-header">
              <h2 class="home-catalog-title">Catálogo</h2>
              <span class="home-catalog-count">${games.length} juegos</span>
            </div>
            <div class="home-catalog-grid" role="list">
              ${cardsHtml}
            </div>
          </section>

        </div>
      </div>

      <!-- Bottom nav móvil HOME V2 -->
      <nav class="home-bottom-nav" aria-label="Navegación principal">
        <a class="home-bottom-nav-item is-active" href="#" aria-current="page">
          <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">home</span>
          <span>Inicio</span>
        </a>
        <a class="home-bottom-nav-item" href="#" aria-label="Historial de partidas">
          <span class="material-symbols-outlined">history</span>
          <span>Historial</span>
        </a>
      </nav>
    `;
  }

  function renderConfig(vm) {
    const game = vm.game;
    if (!game) {
      return renderHome(vm);
    }

    const maxPlayers = game.maxPlayers || 4;
    const minPlayers = game.minPlayers || 1;
    const isFixedPlayers = minPlayers === maxPlayers;

    const playersRow = isFixedPlayers
      ? `
        <div class="flex items-center justify-between">
          <label class="font-label-caps text-xs text-outline uppercase font-bold tracking-widest">Jugadores</label>
          <span class="font-body-md text-primary font-semibold">${minPlayers} Jugadores (Fijo)</span>
        </div>
      `
      : `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="font-label-caps text-xs text-outline uppercase font-bold tracking-widest">Jugadores</label>
            <span class="font-body-md text-primary font-semibold">Multijugador Local</span>
          </div>
          <div class="grid grid-cols-${Math.min(3, maxPlayers - minPlayers + 1)} gap-4">
            ${Array.from({ length: maxPlayers - minPlayers + 1 }, (_, i) => minPlayers + i).map(count => {
              const isActive = vm.config.playerCount === count;
              return `
                <button 
                  class="font-bold py-4 rounded-xl border flex flex-col items-center gap-1 transition-all active:scale-95 ${isActive ? 'bg-primary-container text-on-primary-container border-primary/20 shadow-sm' : 'bg-surface-container text-on-surface-variant border-outline-variant/50 hover:bg-surface-container-high'}"
                  data-action="select-player-count" 
                  data-player-count="${count}"
                >
                  <span class="material-symbols-outlined">${count === 1 ? 'person' : count === 2 ? 'group' : 'groups'}</span>
                  ${count} Jug.
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;

    const namesFields = Array.from({ length: vm.config.playerCount }, (_, index) => {
      const current = vm.config.names[index] || "";
      return `
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-outline uppercase tracking-wider">Jugador ${index + 1}</label>
          <input
            class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-body-md text-on-surface shadow-sm"
            type="text"
            maxlength="14"
            value="${escapeHtml(current)}"
            data-field="player-name"
            data-index="${index}"
            placeholder="Nombre..."
          />
        </div>
      `;
    }).join("");

    const namesBlock = game.hidePlayerNames
      ? ""
      : `
        <div class="space-y-4 pt-6 mt-6 border-t border-outline-variant/20">
          <label class="font-label-caps text-xs text-outline uppercase font-bold tracking-widest">Nombres</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${namesFields}
          </div>
        </div>
      `;

    return `
      <!-- TopAppBar -->
      <header class="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16">
        <div class="flex items-center gap-4">
          <button class="material-symbols-outlined text-slate-500 hover:bg-slate-50 transition-colors rounded-full p-2 active:scale-95 duration-200" data-action="go-home">arrow_back</button>
          <span class="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">Configurar</span>
        </div>
      </header>

      <main class="pt-24 pb-12 px-6 flex flex-col items-center min-h-screen">
        <div class="max-w-md w-full">
          <!-- Hero Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center p-4 bg-primary-container rounded-2xl mb-4 shadow-inner">
              <div class="scale-150 text-on-primary-container">${renderHomeGameGlyph(game.id)}</div>
            </div>
            <h1 class="text-3xl font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">${escapeHtml(game.name)}</h1>
            <p class="text-on-surface-variant font-body-md">${escapeHtml(game.tagline || "Partida local")}</p>
          </div>

          <!-- Configuration Container -->
          <div class="bg-white border border-outline-variant/30 rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] p-6 md:p-8 space-y-6">
            ${playersRow}
            ${namesBlock}

            <!-- Action Button -->
            <div class="pt-6 mt-6 border-t border-outline-variant/20">
              <button class="w-full bg-primary hover:bg-primary/90 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3" data-action="config-continue">
                Iniciar Partida
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_circle</span>
              </button>
            </div>
          </div>
        </div>
      </main>
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

  function getViewportRenderState() {
    const viewport = window.visualViewport;
    const width = Math.round(viewport?.width || window.innerWidth || document.documentElement.clientWidth || 0);
    const height = Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight || 0);
    const isPortraitHandheld = window.matchMedia("(max-width: 1180px) and (max-height: 1366px) and (orientation: portrait)").matches;

    return {
      width,
      height,
      isCompactLandscape: isCompactLandscapeViewport(),
      isCompactTouch: isCompactTouchViewport(),
      isPortraitHandheld
    };
  }

  function buildBoardUiState(vm) {
    return {
      ...(vm?.uiState || {}),
      viewport: getViewportRenderState()
    };
  }

  function buildGameTopbarSubtitle(vm) {
    const session = vm?.session;
    const game = vm?.game;
    if (!session || !game) {
      return "";
    }

    const turnText = game.getTurnMessage({ state: session.state, players: session.players, options: session.options });
    const activeSlot = game.getTurnSlot(session.state);
    const active = session.players.find((player) => player.slot === activeSlot);
    const showTurnMessage = !game.hideGlobalTurnMessage;
    const result = game.getResult(session.state);

    return typeof game.getShellSubtitle === "function"
      ? game.getShellSubtitle({
          state: session.state,
          players: session.players,
          options: session.options
        })
      : game.useLandscapeMobileShell
        ? ""
        : showTurnMessage
          ? result
            ? result.type === "win" ? "Partida terminada" : "Resultado listo"
            : game.useCustomTurnMessage
              ? turnText
              : active
                ? `Turno de ${active.name}`
                : turnText
          : "";
  }

  function syncPatchedGameChrome(vm) {
    const titleNode = appElement.querySelector(".topbar-title");
    if (titleNode && vm?.game?.name) {
      titleNode.textContent = vm.game.name;
    }

    const copyNode = appElement.querySelector(".topbar-copy");
    if (!copyNode) {
      return;
    }

    const subtitle = buildGameTopbarSubtitle(vm);
    const subtitleNode = copyNode.querySelector(".topbar-sub");

    if (!subtitle) {
      subtitleNode?.remove();
      return;
    }

    if (subtitleNode) {
      subtitleNode.textContent = subtitle;
      return;
    }

    copyNode.insertAdjacentHTML("beforeend", `<p class="topbar-sub">${escapeHtml(subtitle)}</p>`);
  }

  function renderGame(vm) {
    const session = vm.session;
    const game = vm.game;
    if (!session || !game) {
      return renderHome(vm);
    }

    const boardUiState = buildBoardUiState(vm);
    const topbarSubtitle = buildGameTopbarSubtitle(vm);

    return `
      <!-- Top App Bar -->
      <header class="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-6 h-16">
        <div class="flex items-center gap-2 md:gap-4">
          <button class="material-symbols-outlined text-slate-600 hover:bg-white transition-all rounded-full p-2 active:scale-95 duration-200 shadow-sm border border-transparent hover:border-slate-200" data-action="game-back">arrow_back</button>
          
          <div class="w-9 h-9 md:w-10 md:h-10 drop-shadow-md">
            ${renderHomeGameGlyph(game.id)}
          </div>
          
          <span class="text-lg md:text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight truncate max-w-[120px] md:max-w-none">${escapeHtml(game.name)}</span>
        </div>
        
        <!-- Turn Indicator -->
        ${topbarSubtitle ? `
        <div class="flex items-center bg-white/80 shadow-sm px-3 py-1.5 rounded-full border border-slate-200/60 max-w-[150px] md:max-w-none backdrop-blur-md">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span class="font-bold text-[10px] md:text-xs uppercase tracking-wider text-slate-700 truncate">${escapeHtml(topbarSubtitle)}</span>
          </div>
        </div>
        ` : ''}

        <div class="flex items-center gap-1 md:gap-2">
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all active:scale-95" data-action="restart-game" aria-label="Reiniciar">
            <span class="material-symbols-outlined text-xl md:text-2xl">refresh</span>
          </button>
          <button class="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all active:scale-95" data-action="open-rules" aria-label="Reglas">
            <span class="material-symbols-outlined text-xl md:text-2xl">help_outline</span>
          </button>
        </div>
      </header>

      <!-- Main Game Area (Theater Mode) -->
      <main class="relative h-[calc(100dvh-64px)] mt-16 w-full flex flex-col items-center justify-center p-0 md:p-6 bg-surface-container-lowest overflow-hidden">
        <div class="relative w-full max-w-[1200px] h-full max-h-[800px] flex items-center justify-center overflow-visible">
          <section class="board-wrap z-10 w-full h-full flex items-center justify-center">
            ${game.renderBoard({
              state: session.state,
              players: session.players,
              options: session.options,
              canAct: vm.canAct,
              uiState: boardUiState
            })}
          </section>
        </div>
      </main>
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
          <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 mb-4">
            <h4 class="font-bold text-primary mb-2">${escapeHtml(rule.title)}</h4>
            <p class="text-on-surface-variant text-sm">${escapeHtml(rule.text)}</p>
          </div>
        `
      )
      .join("");

    return `
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-overlay="rules">
        <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-[scale-in_0.2s_ease-out]">
          <header class="flex items-center justify-between p-6 border-b border-outline-variant/30 bg-surface-container-lowest">
            <h3 class="text-xl font-bold text-on-surface font-['Plus_Jakarta_Sans']">Reglas del Juego</h3>
            <button class="material-symbols-outlined text-outline hover:bg-surface-container-high rounded-full p-2 transition-colors active:scale-95" data-action="close-rules">close</button>
          </header>
          <div class="p-6 max-h-[60vh] overflow-y-auto">
            ${sections}
          </div>
        </div>
      </div>
    `;
  }

  function renderResult(vm) {
    const session = vm.session;
    const game = vm.game;

    if (!session || !game || !session.state.gameOver) {
      return "";
    }

    const isDraw = Boolean(session.state.isDraw);
    const winners = session.state.winners || [];
    const winnerNames = winners.map((idx) => session.players[idx].name).join(" y ");

    let title, subtitle;

    if (isDraw) {
      title = "Empate";
      subtitle = "No hay ganador claro esta vez.";
    } else {
      title = `¡${escapeHtml(winnerNames)} gana!`;
      subtitle = "Excelente partida.";
    }

    return `
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-overlay="result">
        <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center animate-[scale-in_0.3s_ease-out]">
          <div class="w-20 h-20 mx-auto bg-primary-container text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
            <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1;">${isDraw ? 'handshake' : 'emoji_events'}</span>
          </div>
          <h2 class="text-3xl font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">${title}</h2>
          <p class="text-on-surface-variant font-body-md mb-8">${subtitle}</p>
          
          <div class="flex flex-col gap-3">
            <button class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all" data-action="play-again">
              Jugar de nuevo
            </button>
            <button class="w-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold py-4 rounded-xl active:scale-95 transition-all" data-action="new-game">
              Salir al catalogo
            </button>
          </div>
        </div>
      </div>
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

    if (nextVm.forceFullGameRender) {
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

  function buildBoardBindingContext(vm) {
    return {
      state: vm.session?.state || null,
      players: vm.session?.players || [],
      options: vm.session?.options || {},
      canAct: vm.canAct,
      uiState: vm.uiState,
      dispatchGameAction(action) {
        if (typeof onAction !== "function") {
          return Promise.resolve();
        }
        return onAction("game-action", { action });
      }
    };
  }

  function syncBoardBinding(vm = currentVm) {
    if (!vm || vm.screen !== "game" || typeof vm.game?.bindBoardElement !== "function") {
      return;
    }

    const boardWrap = appElement.querySelector(".board-wrap");
    if (!boardWrap) {
      return;
    }

    vm.game.bindBoardElement(boardWrap, buildBoardBindingContext(vm));
  }

  function render(vm) {
    const previousScreen = currentVm?.screen || null;

    if (canPatchCurrentGame(vm)) {
      const boardWrap = appElement.querySelector(".board-wrap");
      const patched = boardWrap
        ? vm.game.patchBoardElement(boardWrap, {
            state: vm.session.state,
            players: vm.session.players,
            options: vm.session.options,
            canAct: vm.canAct,
            uiState: buildBoardUiState(vm)
          })
        : false;

      if (patched) {
        currentVm = vm;
        document.body.classList.toggle("is-home-screen", false);
        document.body.classList.toggle("is-game-screen", true);
        appElement.classList.toggle("app-shell-home", false);
        appElement.classList.toggle("app-shell-game", true);
        syncPatchedGameChrome(vm);
        syncLandscapeShellState(vm);
        syncGameLoops(vm);
        syncBoardBinding(vm);
        return;
      }
    }

    currentVm = vm;
    if (vm.screen !== "home") {
      homeDrawerOpen = false;
    }
    let html;

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
    document.body.classList.toggle("is-game-screen", vm.screen === "game");
    appElement.classList.toggle("app-shell-home", vm.screen === "home");
    appElement.classList.toggle("app-shell-game", vm.screen === "game");
    appElement.innerHTML = html;
    syncLandscapeShellState(vm);
    if (previousScreen !== vm.screen) {
      window.scrollTo(0, 0);
    }
    syncGameLoops(vm);
    syncBoardBinding(vm);
  }

  function shouldRunFootballLoop(vm = currentVm) {
    return Boolean(
      vm?.screen === "game" &&
      vm?.game?.id === "futbol-turnos" &&
      (vm?.session?.state?.phase === "resolving" || vm?.session?.state?.phase === "goal") &&
      typeof onAction === "function"
    );
  }

  function clearFootballTickLoop() {
    if (footballTickFrame) {
      window.cancelAnimationFrame(footballTickFrame);
      footballTickFrame = null;
    }
    footballLastFrameAt = 0;
    footballDispatchInFlight = false;
  }

  function queueFootballFrame() {
    if (footballTickFrame || !shouldRunFootballLoop()) {
      return;
    }

    footballTickFrame = window.requestAnimationFrame(async (timestamp) => {
      footballTickFrame = null;

      if (!shouldRunFootballLoop()) {
        clearFootballTickLoop();
        return;
      }

      if (!footballLastFrameAt) {
        footballLastFrameAt = timestamp;
      }

      const deltaMs = Math.min(64, Math.max(0, timestamp - footballLastFrameAt));
      footballLastFrameAt = timestamp;

      if (footballDispatchInFlight || deltaMs <= 0) {
        queueFootballFrame();
        return;
      }

      footballDispatchInFlight = true;

      try {
        await onAction("game-action", {
          action: {
            type: "tick",
            deltaMs,
            nowMs: Date.now()
          }
        });
      } finally {
        footballDispatchInFlight = false;
        if (shouldRunFootballLoop()) {
          queueFootballFrame();
        }
      }
    });
  }

  function syncFootballTickLoop(vm) {
    if (!shouldRunFootballLoop(vm)) {
      clearFootballTickLoop();
      return;
    }

    queueFootballFrame();
  }

  function shouldRunBilliardsLoop(vm = currentVm) {
    return Boolean(
      vm?.screen === "game" &&
      vm?.game?.id === "billar" &&
      vm?.session?.state?.phase === "rolling" &&
      typeof onAction === "function"
    );
  }

  function clearBilliardsTickLoop() {
    if (billiardsTickFrame) {
      window.cancelAnimationFrame(billiardsTickFrame);
      billiardsTickFrame = null;
    }
    billiardsLastFrameAt = 0;
    billiardsDispatchInFlight = false;
  }

  function queueBilliardsFrame() {
    if (billiardsTickFrame || !shouldRunBilliardsLoop()) {
      return;
    }

    billiardsTickFrame = window.requestAnimationFrame(async (timestamp) => {
      billiardsTickFrame = null;

      if (!shouldRunBilliardsLoop()) {
        clearBilliardsTickLoop();
        return;
      }

      if (!billiardsLastFrameAt) {
        billiardsLastFrameAt = timestamp;
      }

      const deltaMs = Math.min(64, Math.max(0, timestamp - billiardsLastFrameAt));
      billiardsLastFrameAt = timestamp;

      if (billiardsDispatchInFlight || deltaMs <= 0) {
        queueBilliardsFrame();
        return;
      }

      billiardsDispatchInFlight = true;

      try {
        await onAction("game-action", {
          action: {
            type: "tick",
            deltaMs,
            nowMs: Date.now()
          }
        });
      } finally {
        billiardsDispatchInFlight = false;
        if (shouldRunBilliardsLoop()) {
          queueBilliardsFrame();
        }
      }
    });
  }

  function syncBilliardsTickLoop(vm) {
    if (!shouldRunBilliardsLoop(vm)) {
      clearBilliardsTickLoop();
      return;
    }

    queueBilliardsFrame();
  }

  function shouldRunTankLoop(vm = currentVm) {
    const phase = vm?.session?.state?.phase;
    return Boolean(
      vm?.screen === "game" &&
      vm?.game?.id === "tanques" &&
      (phase === "TURN_START" || phase === "SIMULATION" || phase === "DAMAGE_EVALUATION" || phase === "END_TURN") &&
      typeof onAction === "function"
    );
  }

  function clearTankTickLoop() {
    if (tankTickTimerId) {
      window.clearTimeout(tankTickTimerId);
      tankTickTimerId = null;
    }
    tankLastTickAt = 0;
    tankDispatchInFlight = false;
  }

  function queueTankFrame() {
    if (tankTickTimerId || !shouldRunTankLoop()) {
      return;
    }

    tankTickTimerId = window.setTimeout(async () => {
      tankTickTimerId = null;

      if (!shouldRunTankLoop()) {
        clearTankTickLoop();
        return;
      }

      const now = performance.now();
      if (!tankLastTickAt) {
        tankLastTickAt = now - 16;
      }

      const deltaMs = Math.min(160, Math.max(0, now - tankLastTickAt));
      tankLastTickAt = now;

      if (tankDispatchInFlight || deltaMs <= 0) {
        queueTankFrame();
        return;
      }

      tankDispatchInFlight = true;

      try {
        await onAction("game-action", {
          action: {
            type: "tick",
            deltaMs,
            nowMs: Date.now()
          }
        });
      } finally {
        tankDispatchInFlight = false;
        if (shouldRunTankLoop()) {
          queueTankFrame();
        }
      }
    }, 16);
  }

  function syncTankTickLoop(vm) {
    if (!shouldRunTankLoop(vm)) {
      clearTankTickLoop();
      return;
    }

    queueTankFrame();
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
    syncFootballTickLoop(vm);
    syncBilliardsTickLoop(vm);
    syncTankTickLoop(vm);
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

  function isCompactLandscapeViewport() {
    return window.matchMedia("(orientation: landscape) and (max-width: 1180px) and (max-height: 900px)").matches;
  }

  function syncViewportVars() {
    const viewport = window.visualViewport;
    const width = Math.round(viewport?.width || window.innerWidth || document.documentElement.clientWidth || 0);
    const height = Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight || 0);
    document.documentElement.style.setProperty("--app-dvw", `${width}px`);
    document.documentElement.style.setProperty("--app-dvh", `${height}px`);
  }

  function currentGameUsesLandscapeShell(vm = currentVm) {
    return Boolean(vm?.screen === "game" && vm?.game?.useLandscapeMobileShell);
  }

  function canUseFullscreen() {
    return Boolean(
      document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        appElement.requestFullscreen ||
        appElement.webkitRequestFullscreen
    );
  }

  function isGameFullscreen() {
    return document.fullscreenElement === appElement || document.webkitFullscreenElement === appElement;
  }

  async function requestAppFullscreen() {
    if (typeof appElement.requestFullscreen === "function") {
      try {
        await appElement.requestFullscreen();
        return true;
      } catch {
        return false;
      }
    }

    if (typeof appElement.webkitRequestFullscreen === "function") {
      try {
        appElement.webkitRequestFullscreen();
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  async function exitAppFullscreen() {
    if (document.fullscreenElement && typeof document.exitFullscreen === "function") {
      await document.exitFullscreen().catch(() => {});
      return;
    }

    if (document.webkitFullscreenElement && typeof document.webkitExitFullscreen === "function") {
      document.webkitExitFullscreen();
    }
  }

  async function toggleGameFullscreen() {
    if (!canUseFullscreen()) {
      showToast("Pantalla completa no disponible en este navegador.");
      return;
    }

    if (isGameFullscreen()) {
      await exitAppFullscreen();
      return;
    }

    const entered = await requestAppFullscreen();
    if (!entered) {
      showToast("Tu navegador solo permite pantalla completa tras un gesto compatible.");
    }
  }

  async function maybeEnterGameFullscreenFromGesture() {
    if (!currentVm?.game?.allowFullscreen || !isCompactLandscapeViewport() || isGameFullscreen() || !canUseFullscreen()) {
      return;
    }

    const entered = await requestAppFullscreen();
    if (!entered) {
      showToast("Si tu navegador lo bloquea, puedes entrar con el boton Full.", 2600);
    }
  }

  function syncLandscapeShellState(vm = currentVm) {
    syncViewportVars();

    const active = currentGameUsesLandscapeShell(vm);
    const compactLandscape = active && isCompactLandscapeViewport();
    const fullscreen = active && isGameFullscreen();

    document.body.classList.toggle("game-landscape-shell-active", active);
    document.body.classList.toggle("game-landscape-mobile-active", compactLandscape);
    document.body.classList.toggle("game-fullscreen-active", fullscreen);
    appElement.classList.toggle("app-shell-game-landscape", active);
    appElement.classList.toggle("app-shell-game-landscape-mobile", compactLandscape);

    if (!active && isGameFullscreen()) {
      exitAppFullscreen().catch(() => {});
    }
  }

  function scheduleViewportRefresh(vm = currentVm) {
    if (viewportRefreshFrame) {
      window.cancelAnimationFrame(viewportRefreshFrame);
    }

    viewportRefreshFrame = window.requestAnimationFrame(() => {
      viewportRefreshFrame = null;
      const nextVm = vm || currentVm;
      syncLandscapeShellState(nextVm);

      if (nextVm?.screen === "game" && nextVm?.game?.useLandscapeMobileShell) {
        render({ ...nextVm, forceFullGameRender: true });
      }
    });
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

      if (action === "toggle-fullscreen") {
        await toggleGameFullscreen();
        return;
      }

      if (action === "select-player-count") {
        await onAction("select-player-count", { playerCount: Number(target.dataset.playerCount) });
        return;
      }

      if (action === "config-continue") {
        await maybeEnterGameFullscreenFromGesture();
        await onAction("config-continue", {});
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

    syncViewportVars();
    window.addEventListener("resize", () => scheduleViewportRefresh(currentVm));
    window.addEventListener("orientationchange", () => scheduleViewportRefresh(currentVm));
    document.addEventListener("fullscreenchange", () => scheduleViewportRefresh(currentVm));
    document.addEventListener("webkitfullscreenchange", () => scheduleViewportRefresh(currentVm));
    window.visualViewport?.addEventListener("resize", () => scheduleViewportRefresh(currentVm));
  }

  return {
    bind,
    render,
    showToast
  };
}
