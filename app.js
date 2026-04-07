import { applyAppearanceRefresh } from "./appearance-refresh.js";
import { createEngine } from "./engine.js";
import { createUI } from "./ui.js";
import { tresEnRayaGame } from "./games/tres-en-raya.js";
import { cuatroEnRayaGame } from "./games/cuatro-en-raya.js";
import { damasGame } from "./games/damas.js";
import { parchisGame } from "./games/parchis.js";
import { escalerasSerpientesGame } from "./games/escaleras-serpientes.js";
import { traficoGame } from "./games/trafico.js";
import { buscaminasGame } from "./games/buscaminas.js";
import { sokobanGame } from "./games/sokoban.js";
import { parejasGame } from "./games/parejas.js";
import { billarGame } from "./games/billar.js";
import { futbolTurnosGame } from "./games/futbol-turnos.js";
import { tanquesGame } from "./games/tanques.js";

const appElement = document.getElementById("app");
const toastElement = document.getElementById("toast-root");

applyAppearanceRefresh();

const ui = createUI({
  appElement,
  toastElement
});

const engine = createEngine({ ui });

engine.registerGame(tresEnRayaGame);
engine.registerGame(cuatroEnRayaGame);
engine.registerGame(damasGame);
engine.registerGame(parchisGame);
engine.registerGame(escalerasSerpientesGame);
engine.registerGame(traficoGame);
engine.registerGame(buscaminasGame);
engine.registerGame(sokobanGame);
engine.registerGame(parejasGame);
engine.registerGame(billarGame);
engine.registerGame(futbolTurnosGame);
engine.registerGame(tanquesGame);
engine.boot();

if ("serviceWorker" in navigator) {
  const SERVICE_WORKER_URL = "./sw.js";
  const SERVICE_WORKER_ACTIVATED = "minijuegos:sw-activated";
  const SERVICE_WORKER_RELOAD_KEY = "minijuegos:sw-reload-version";
  const hadControllerOnBoot = Boolean(navigator.serviceWorker.controller);
  let registrationRef = null;
  let hasReloadedForUpdate = false;

  function reloadForUpdatedWorker(version) {
    if (!hadControllerOnBoot || hasReloadedForUpdate) {
      return;
    }

    const normalizedVersion = String(version || "").trim();
    if (!normalizedVersion) {
      return;
    }

    if (window.sessionStorage.getItem(SERVICE_WORKER_RELOAD_KEY) === normalizedVersion) {
      return;
    }

    hasReloadedForUpdate = true;
    window.sessionStorage.setItem(SERVICE_WORKER_RELOAD_KEY, normalizedVersion);
    window.location.reload();
  }

  function updateServiceWorkerRegistration() {
    if (!registrationRef) {
      return;
    }

    registrationRef.update().catch((error) => {
      console.warn("No se pudo comprobar la actualizacion del service worker de Minijuegos.", error);
    });
  }

  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.type !== SERVICE_WORKER_ACTIVATED) {
      return;
    }

    reloadForUpdatedWorker(data.version);
  });

  window.addEventListener("load", async () => {
    try {
      registrationRef = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
      updateServiceWorkerRegistration();

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          updateServiceWorkerRegistration();
        }
      });
    } catch (error) {
      console.warn("No se pudo registrar el service worker de Minijuegos.", error);
    }
  });
}
