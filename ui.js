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
  let homeCatalogVisible = false;

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
    const homeViewClass = homeCatalogVisible ? "is-catalog" : "is-cover";
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
          ? `${game.minPlayers} jugadores`
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
      <section class="screen home-screen home-library-screen ${homeViewClass}">
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
            <button
              class="home-family-art-hit"
              data-action="home-enter-catalog"
              aria-label="Entrar al catalogo de juegos"
              aria-controls="home-games-section"
            ></button>
            <div class="home-family-art">
              <img class="home-family-art-image" src="./assets/home-hero-family.png" alt="Imagen principal familiar de Minijuegos" />
            </div>
          </article>
        </section>

        <section class="home-games-section" id="home-games-section" data-home-catalog>
          <div class="home-games-heading">
            <h2 class="home-games-title" aria-label="Minijuegos">${renderPlayfulTitle("Minijuegos")}</h2>
            <p class="home-games-subtitle">Juegos rápidos, familiares y listos para jugar en el mismo dispositivo.</p>
            <div class="home-games-cta-row">
              <button class="btn btn-primary home-games-enter" data-action="home-enter-catalog">Entrar</button>
            </div>
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
                      <span class="home-game-card-icon is-${escapeHtml(game.id)}">${escapeHtml(profile.icon)}</span>
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

          <div class="block">
            <h3 class="block-title">Nombres</h3>
            <div class="fields-grid">${namesFields}</div>
          </div>

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

  function render(vm) {
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
      if (action === "home-enter-catalog") {
        homeCatalogVisible = true;
        const homeScreen = appElement.querySelector(".home-library-screen");
        const catalogSection = appElement.querySelector("[data-home-catalog]");
        if (homeScreen) {
          homeScreen.classList.remove("is-cover");
          homeScreen.classList.add("is-catalog");
        } else if (currentVm) {
          render(currentVm);
        }
        window.requestAnimationFrame(() => {
          if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
        return;
      }

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

    let swipeStartX = null;
    document.addEventListener("touchstart", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const zone = event.target.closest("[data-home-swipe]");
      if (!zone || !currentVm || currentVm.screen !== "home") {
        return;
      }
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) {
        return;
      }
      swipeStartX = touch.clientX;
    });

    document.addEventListener("touchend", (event) => {
      if (swipeStartX === null || !currentVm || currentVm.screen !== "home") {
        swipeStartX = null;
        return;
      }
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) {
        swipeStartX = null;
        return;
      }
      const deltaX = touch.clientX - swipeStartX;
      swipeStartX = null;

      if (Math.abs(deltaX) < 44) {
        return;
      }
      shiftHomeIndex(deltaX < 0 ? 1 : -1);
    });
  }

  return {
    bind,
    render,
    showToast
  };
}
