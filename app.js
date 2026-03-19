import { createEngine } from "./engine.js";
import { createUI } from "./ui.js";
import { tresEnRayaGame } from "./games/tres-en-raya.js";
import { cuatroEnRayaGame } from "./games/cuatro-en-raya.js";
import { damasGame } from "./games/damas.js";
import { parchisGame } from "./games/parchis.js";

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
engine.boot();
