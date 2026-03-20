import { createEngine } from "./engine.js";
import { createUI } from "./ui.js";
import { tresEnRayaGame } from "./games/tres-en-raya.js";
import { cuatroEnRayaGame } from "./games/cuatro-en-raya.js";
import { damasGame } from "./games/damas.js";
import { parchisGame } from "./games/parchis.js";
import { escalerasSerpientesGame } from "./games/escaleras-serpientes.js";
import { traficoGame } from "./games/trafico.js";

const appElement = document.getElementById("app");
const toastElement = document.getElementById("toast-root");

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
engine.boot();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("No se pudo registrar el service worker de Minijuegos.", error);
    });
  });
}
