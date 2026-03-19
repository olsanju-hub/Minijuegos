const STORAGE_KEYS = {
  names: "minijuegos:last-names"
};

const DEFAULT_NAMES = ["GuiYo", "Kelly", "Guille", "Ale", "Paz", "Noa"];

const PLAYER_IDENTITIES = [
  { color: "#E76F51", shape: "circulo", icon: "○" },
  { color: "#F2C94C", shape: "triangulo", icon: "△" },
  { color: "#4A90E2", shape: "cuadrado", icon: "□" },
  { color: "#39B980", shape: "estrella", icon: "★" },
  { color: "#8E63CC", shape: "rombo", icon: "◇" },
  { color: "#F2994A", shape: "hexagono", icon: "⬢" }
];

const MAX_NAME_LENGTH = 14;

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function identityBySlot(slot) {
  return PLAYER_IDENTITIES[slot % PLAYER_IDENTITIES.length];
}

function loadNames() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.names);
    if (!raw) {
      return [...DEFAULT_NAMES];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_NAMES];
    }

    const merged = [...DEFAULT_NAMES];
    for (let i = 0; i < Math.min(DEFAULT_NAMES.length, parsed.length); i += 1) {
      const candidate = String(parsed[i] || "").trim().slice(0, MAX_NAME_LENGTH);
      if (candidate) {
        merged[i] = candidate;
      }
    }
    return merged;
  } catch (error) {
    return [...DEFAULT_NAMES];
  }
}

function saveNames(names) {
  const normalized = [...DEFAULT_NAMES];
  for (let i = 0; i < DEFAULT_NAMES.length; i += 1) {
    const candidate = String(names[i] || "").trim().slice(0, MAX_NAME_LENGTH);
    normalized[i] = candidate || DEFAULT_NAMES[i];
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.names, JSON.stringify(normalized));
  } catch (error) {
    // Ignora errores de almacenamiento local.
  }
}

export function createEngine({ ui }) {
  const games = new Map();

  const state = {
    screen: "home",
    selectedGameId: null,
    config: {
      playerCount: 2,
      names: loadNames(),
      gameOptions: {},
      error: ""
    },
    rulesOpen: false,
    ui: {
      invalidColumn: null,
      invalidTimer: null,
      lastDrop: null
    },
    session: null
  };

  function getGame(gameId = state.selectedGameId) {
    return gameId ? games.get(gameId) || null : null;
  }

  function activeGames() {
    return [...games.values()].filter((game) => game.enabled !== false);
  }

  function safeText(value) {
    return String(value || "").slice(0, MAX_NAME_LENGTH).trim();
  }

  function showToast(message) {
    ui.showToast(String(message || ""));
  }

  function clearInvalidColumnLater() {
    if (state.ui.invalidTimer) {
      window.clearTimeout(state.ui.invalidTimer);
    }
    state.ui.invalidTimer = window.setTimeout(() => {
      state.ui.invalidColumn = null;
      state.ui.invalidTimer = null;
      render();
    }, 260);
  }


  function validateNames(playerCount) {
    const names = [];
    for (let i = 0; i < playerCount; i += 1) {
      names.push(safeText(state.config.names[i]));
    }

    if (names.some((name) => !name)) {
      return { ok: false, error: "Todos los nombres deben estar completos." };
    }

    if (new Set(names).size !== names.length) {
      return { ok: false, error: "No puede haber nombres duplicados exactos." };
    }

    return { ok: true, names };
  }

  function buildPlayersFromNames(names) {
    return names.map((name, slot) => {
      const identity = identityBySlot(slot);
      return {
        id: uid("player"),
        slot,
        name,
        identity
      };
    });
  }

  function setScreen(screen) {
    state.screen = screen;
    render();
  }

  function resetSessionToHome() {
    state.session = null;
    state.rulesOpen = false;
    state.ui.invalidColumn = null;
    state.ui.lastDrop = null;
    setScreen("home");
  }

  function startLocalSession() {
    const game = getGame();
    if (!game) {
      return;
    }

    const validation = validateNames(state.config.playerCount);
    if (!validation.ok) {
      state.config.error = validation.error;
      render();
      return;
    }

    state.config.error = "";
    saveNames(state.config.names);

    const players = buildPlayersFromNames(validation.names);
    const options = game.normalizeOptions ? game.normalizeOptions(state.config.gameOptions, state.config.playerCount) : {};

    state.session = {
      gameId: game.id,
      modeLabel: "Mismo dispositivo",
      players,
      options,
      expectedPlayers: players.length,
      state: game.createInitialState({
        playerCount: players.length,
        options,
        players
      })
    };

    state.ui.lastDrop = null;
    state.ui.invalidColumn = null;
    state.rulesOpen = false;
    setScreen("game");
  }

  function canActInSession() {
    if (!state.session) {
      return false;
    }

    const game = getGame(state.session.gameId);
    if (!game) {
      return false;
    }

    const result = game.getResult(state.session.state);
    if (result) {
      return false;
    }

    return true;
  }

  function notifyInvalid(reason, action) {
    if (reason === "column_full") {
      const column = Number(action && action.column);
      if (Number.isInteger(column)) {
        state.ui.invalidColumn = column;
        clearInvalidColumnLater();
      }
      showToast("Esa columna esta llena.");
      render();
      return;
    }

    const map = {
      occupied: "Esa casilla ya esta ocupada.",
      turn: "No es tu turno.",
      finished: "La partida ya ha terminado.",
      invalid: "Movimiento no valido.",
      not_implemented: "Este juego aun no esta disponible."
    };
    showToast(map[reason] || "Movimiento no valido.");
  }

  function runLocalGameAction(action) {
    if (!state.session) {
      return;
    }

    const game = getGame(state.session.gameId);
    if (!game) {
      return;
    }

    const currentState = state.session.state;
    const actorSlot = game.getTurnSlot(currentState);
    const result = game.applyAction({
      state: currentState,
      action,
      actorSlot,
      players: state.session.players,
      options: state.session.options
    });

    if (!result.ok) {
      notifyInvalid(result.reason, action);
      return;
    }

    const now = Date.now();

    if (state.session.gameId === "connect4" && result.state.lastMove) {
      state.ui.lastDrop = {
        at: now,
        row: result.state.lastMove.row,
        col: result.state.lastMove.col
      };
    }
    state.session.state = result.state;
    render();
  }

  function handlePrimaryContinue() {
    if (!getGame()) {
      return;
    }
    startLocalSession();
  }

  function resetForNewGame() {
    state.session = null;
    state.rulesOpen = false;
    state.ui.lastDrop = null;
    state.ui.invalidColumn = null;
    setScreen("config");
  }

  function buildViewModel() {
    const game = getGame(state.session ? state.session.gameId : state.selectedGameId);
    const session = state.session;
    const canAct = canActInSession();

    return {
      screen: state.screen,
      rulesOpen: state.rulesOpen,
      config: state.config,
      session,
      game,
      canAct,
      games: activeGames(),
      uiState: state.ui
    };
  }

  function render() {
    ui.render(buildViewModel());
  }

  async function dispatch(action, payload = {}) {
    switch (action) {
      case "open-game": {
        const game = getGame(payload.gameId);
        if (!game) {
          return;
        }
        state.selectedGameId = game.id;
        state.config.playerCount = clamp(state.config.playerCount, game.minPlayers, game.maxPlayers);
        const initialOptions = game.getDefaultOptions ? game.getDefaultOptions() : {};
        state.config.gameOptions = game.normalizeOptions ? game.normalizeOptions(initialOptions, state.config.playerCount) : initialOptions;
        state.config.error = "";
        state.rulesOpen = false;
        setScreen("config");
        return;
      }

      case "go-home":
        resetSessionToHome();
        return;

      case "back-config":
        setScreen("config");
        return;

      case "game-back":
        setScreen("config");
        return;

      case "select-player-count": {
        const game = getGame();
        if (!game) {
          return;
        }
        state.config.playerCount = clamp(Number(payload.playerCount), game.minPlayers, game.maxPlayers);
        if (game.normalizeOptions) {
          state.config.gameOptions = game.normalizeOptions(state.config.gameOptions || {}, state.config.playerCount);
        }
        state.config.error = "";
        render();
        return;
      }

      case "set-game-option": {
        const game = getGame();
        if (!game) {
          return;
        }

        const key = String(payload.key || "").trim();
        if (!key) {
          return;
        }

        let value = payload.value;
        const type = String(payload.valueType || "string");
        if (type === "number") {
          value = Number(value);
        } else if (type === "boolean") {
          value = value === true || value === "true";
        }

        const nextOptions = {
          ...(state.config.gameOptions || {}),
          [key]: value
        };

        state.config.gameOptions = game.normalizeOptions ? game.normalizeOptions(nextOptions, state.config.playerCount) : nextOptions;
        state.config.error = "";
        render();
        return;
      }

      case "config-continue":
        handlePrimaryContinue();
        return;

      case "open-rules":
        state.rulesOpen = true;
        render();
        return;

      case "close-rules":
        state.rulesOpen = false;
        render();
        return;

      case "game-action": {
        const actionPayload = payload.action || null;
        if (!actionPayload || !state.session) {
          return;
        }

        runLocalGameAction(actionPayload);
        return;
      }

      case "restart-game":
      case "play-again":
        if (!state.session) {
          return;
        }
        const game = getGame(state.session.gameId);
        if (!game) {
          return;
        }
        state.session.state = game.createInitialState({
          playerCount: state.session.players.length,
          options: state.session.options,
          players: state.session.players
        });
        state.ui.lastDrop = null;
        state.ui.invalidColumn = null;
        render();
        return;

      case "new-game":
        resetForNewGame();
        return;

      default:
        return;
    }
  }

  function updateField(field, value, meta = {}) {
    if (field === "player-name") {
      const index = Number(meta.index);
      if (!Number.isInteger(index) || index < 0 || index >= DEFAULT_NAMES.length) {
        return;
      }
      state.config.names[index] = String(value || "").slice(0, MAX_NAME_LENGTH);
      state.config.error = "";
    }
  }

  function registerGame(game) {
    games.set(game.id, game);
  }

  function boot() {
    ui.bind({
      onAction: dispatch,
      onField: updateField,
      onOverlayClose: () => {
        state.rulesOpen = false;
        render();
      }
    });

    render();
  }

  return {
    registerGame,
    boot,
    getState() {
      return state;
    },
    getGames() {
      return [...games.values()];
    }
  };
}
