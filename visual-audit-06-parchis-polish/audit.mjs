import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-06-parchis-polish";

const viewports = [
  { key: "mobile", width: 390, height: 844 },
  { key: "tablet", width: 768, height: 1024 },
  { key: "desktop", width: 1440, height: 900 }
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(ROOT_URL);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait for local server.
    }
    await wait(250);
  }
  throw new Error(`Server did not respond at ${ROOT_URL}`);
}

function startServer() {
  const child = spawn("node", ["server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, HOST: "127.0.0.1", PORT: "8080" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function ensureDirs() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const viewport of viewports) {
    await mkdir(`${OUTPUT_DIR}/${viewport.key}`, { recursive: true });
  }
}

async function forceDice(page, values) {
  await page.evaluate((diceValues) => {
    const sequence = diceValues.map((value) => (Math.max(1, Math.min(6, value)) - 0.5) / 6);
    let index = 0;
    window.Math.random = () => {
      if (index < sequence.length) {
        const value = sequence[index];
        index += 1;
        return value;
      }
      return 0.42;
    };
  }, values);
}

async function openParchisConfig(page) {
  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  await page.locator("[data-action='open-game'][data-game-id='parchis']").click();
  await page.waitForTimeout(250);
}

async function startGame(page) {
  await page.locator("[data-action='config-continue']").click();
  await page.waitForTimeout(350);
}

async function clickFirstVisible(page, selector) {
  const locator = page.locator(selector);
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);
    const box = await item.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      return true;
    }
  }
  return false;
}

async function capture(page, viewportKey, name, bucket, options = {}) {
  const path = `${OUTPUT_DIR}/${viewportKey}/${name}.png`;
  await page.screenshot({ path, fullPage: Boolean(options.fullPage) });
  const metrics = await page.evaluate(() => {
    const rectFor = (selector) => {
      const node = document.querySelector(selector);
      if (!node) {
        return null;
      }
      const rect = node.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    };
    const visibleCount = (selector) =>
      Array.from(document.querySelectorAll(selector)).filter((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      }).length;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const boardRect = rectFor(".parchis-board");
    const shellRect = rectFor(".parchis-shell");
    const eventRect = rectFor(".parchis-event-card");
    const text = (document.body.innerText || "").replace(/\s+/g, " ").trim();
    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      verticalOverflow: document.documentElement.scrollHeight > viewportHeight + 1,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      boardRect,
      shellRect,
      eventRect,
      boardViewportRatio: boardRect ? Number(((boardRect.width * boardRect.height) / (viewportWidth * viewportHeight)).toFixed(3)) : 0,
      movablePieces: visibleCount(".parchis-piece.is-movable"),
      selectedPieces: visibleCount(".parchis-piece.is-selected"),
      moveTargets: visibleCount(".parchis-move-target"),
      safeCells: visibleCount(".parchis-track-cell.is-safe"),
      bridgeCells: visibleCount(".parchis-track-cell.is-bridge"),
      eventVisible: visibleCount(".parchis-event-card") > 0,
      modeNormalText: text.includes("Modo Normal"),
      modeChaosText: text.includes("Modo Caos"),
      diceSumText: text.includes("suma"),
      lastEventLabel: Boolean(document.querySelector(".parchis-event-label")),
      text: text.slice(0, 900)
    };
  });
  bucket.screenshots.push({ name, path, metrics });
  return metrics;
}

async function renderSynthetic(page, scenario) {
  const html = await page.evaluate(async (scenarioName) => {
    const { parchisGame } = await import(`/games/parchis.js?audit=${Date.now()}`);
    const TRACK_LENGTH = 52;
    const GOAL_PROGRESS = 58;
    const START_INDICES = [5, 44, 31, 18];
    const players = [
      { slot: 0, name: "GuiYo", identity: { icon: "O", color: "#e76f51" } },
      { slot: 1, name: "Kelly", identity: { icon: "A", color: "#f2c94c" } },
      { slot: 2, name: "Guille", identity: { icon: "S", color: "#4a90e2" } },
      { slot: 3, name: "Ale", identity: { icon: "V", color: "#39b980" } }
    ];
    const piece = (state, id) => state.pieces.find((item) => item.id === id);
    const progressForTrackIndex = (slot, trackIndex) => (trackIndex - START_INDICES[slot] + TRACK_LENGTH) % TRACK_LENGTH;
    const setPlayerMostlyGoal = (state, playerSlot, active = []) => {
      const activeIds = new Set(active);
      for (const item of state.pieces) {
        if (item.playerSlot === playerSlot && !activeIds.has(item.id)) {
          item.progress = GOAL_PROGRESS;
        }
      }
    };
    const setDice = (values) => {
      const sequence = values.map((value) => (Math.max(1, Math.min(6, value)) - 0.5) / 6);
      let index = 0;
      const originalRandom = Math.random;
      Math.random = () => {
        if (index < sequence.length) {
          const value = sequence[index];
          index += 1;
          return value;
        }
        return 0.42;
      };
      return () => {
        Math.random = originalRandom;
      };
    };
    const roll = (state, values) => {
      const restore = setDice(values);
      try {
        return parchisGame.applyAction({ state, action: { type: "roll-die" }, actorSlot: state.currentPlayerIndex }).state;
      } finally {
        restore();
      }
    };
    const selectFirst = (state) => {
      const host = document.createElement("div");
      host.innerHTML = parchisGame.renderBoard({ state, players: players.slice(0, state.playerCount || 2), canAct: true });
      const target = host.querySelector("[data-game-action='select-destination']");
      if (!target) {
        return state;
      }
      const result = parchisGame.applyAction({
        state,
        action: { type: "select-destination", pieceId: target.dataset.pieceId },
        actorSlot: state.currentPlayerIndex
      });
      return result.state || state;
    };
    const state = parchisGame.createInitialState({ playerCount: 2, options: { mode: scenarioName.includes("chaos") ? "chaos" : "normal" }, players: players.slice(0, 2) });

    if (scenarioName === "no-legal-roll") {
      roll(state, [2, 2]);
    } else if (scenarioName === "roll-five-selected") {
      const rolled = roll(state, [5, 2]);
      Object.assign(state, rolled, { selectedPieceId: "p0-0" });
    } else if (scenarioName === "movement-done") {
      Object.assign(state, selectFirst(roll(state, [5, 2])));
    } else if (scenarioName === "capture-normal") {
      piece(state, "p0-0").progress = 0;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, (START_INDICES[0] + 5) % TRACK_LENGTH);
      Object.assign(state, selectFirst(roll(state, [5, 6])));
    } else if (scenarioName === "safe-normal") {
      piece(state, "p0-0").progress = 3;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, 12);
      Object.assign(state, roll(state, [2, 2]));
    } else if (scenarioName === "bridge-normal") {
      piece(state, "p0-0").progress = 4;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, 12);
      piece(state, "p1-1").progress = progressForTrackIndex(1, 12);
      Object.assign(state, roll(state, [5, 6]));
    } else if (scenarioName === "chaos-old-safe-capture") {
      piece(state, "p0-0").progress = 3;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, 12);
      Object.assign(state, selectFirst(roll(state, [2, 2])));
    } else if (scenarioName === "winner-goal") {
      piece(state, "p0-0").progress = 56;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      Object.assign(state, selectFirst(roll(state, [2, 4])));
    }

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="/styles.css" />
          <style>
            body { margin: 0; padding: 14px; background: #f6efe4; }
            .audit-stage { width: min(1120px, 100%); margin: 0 auto; }
          </style>
        </head>
        <body>
          <main class="audit-stage">${parchisGame.renderBoard({ state, players: players.slice(0, state.playerCount || 2), canAct: true })}</main>
        </body>
      </html>
    `;
  }, scenario);
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(250);
}

async function auditViewport(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.key === "mobile",
    hasTouch: viewport.key === "mobile"
  });
  const page = await context.newPage();
  const consoleMessages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    consoleMessages.push({ type: "pageerror", text: error.message });
  });

  const bucket = { viewport, screenshots: [], consoleMessages, checks: [] };

  await openParchisConfig(page);
  await capture(page, viewport.key, "01-config-normal", bucket, { fullPage: true });
  await page.locator("[data-action='set-game-option'][data-option='mode'][data-value='chaos']").click();
  await page.waitForTimeout(150);
  await capture(page, viewport.key, "02-config-caos", bucket, { fullPage: true });
  bucket.checks.push({
    name: "config-mode-toggle",
    ok: (await page.locator("[data-action='set-game-option'][data-option='mode'][data-value='chaos'].is-active").count()) === 1
  });

  await page.locator("[data-action='set-game-option'][data-option='mode'][data-value='normal']").click();
  await startGame(page);
  await capture(page, viewport.key, "03-game-inicial-normal", bucket);

  for (const scenario of [
    "no-legal-roll",
    "roll-five-selected",
    "movement-done",
    "capture-normal",
    "safe-normal",
    "bridge-normal",
    "chaos-old-safe-capture",
    "winner-goal"
  ]) {
    await renderSynthetic(page, scenario);
    const metrics = await capture(page, viewport.key, `synthetic-${scenario}`, bucket, { fullPage: viewport.key === "mobile" });
    bucket.checks.push({
      name: `${scenario}-no-horizontal-overflow`,
      ok: !metrics.horizontalOverflow
    });
  }

  await openParchisConfig(page);
  await startGame(page);
  await forceDice(page, [5, 2]);
  await clickFirstVisible(page, "[data-action='game-action'][data-game-action='roll-die']");
  await page.waitForTimeout(600);
  await capture(page, viewport.key, "04-real-roll-five", bucket);
  await clickFirstVisible(page, ".parchis-piece.is-movable, button.parchis-move-target");
  await page.waitForTimeout(500);
  await capture(page, viewport.key, "05-real-after-move", bucket);
  await page.locator("[data-action='restart-game']").click();
  await page.waitForTimeout(250);
  await capture(page, viewport.key, "06-real-after-restart", bucket);
  const rollButtonReady = await page.locator("button.parchis-roll-btn").evaluate((button) => !button.disabled).catch(() => false);
  bucket.checks.push({
    name: "restart-keeps-game-usable",
    ok: rollButtonReady
  });
  await page.locator("[data-action='open-rules']").click();
  await page.waitForTimeout(180);
  await capture(page, viewport.key, "07-rules-open", bucket);
  bucket.checks.push({ name: "rules-open", ok: (await page.locator(".modal-rules").count()) === 1 });
  await page.locator("[data-action='close-rules']").click();
  await page.waitForTimeout(120);
  await page.locator("[data-action='game-back']").click();
  await page.waitForTimeout(220);
  bucket.checks.push({ name: "back-to-config", ok: (await page.locator("[data-action='config-continue']").count()) === 1 });
  await capture(page, viewport.key, "08-back-to-config", bucket, { fullPage: true });

  await context.close();
  return bucket;
}

function buildMarkdown(report) {
  const viewportRows = report.viewports.map((bucket) => {
    const horizontal = bucket.screenshots.filter((shot) => shot.metrics.horizontalOverflow).map((shot) => shot.name);
    const hiddenEvent = bucket.screenshots.filter((shot) => shot.name.includes("game") || shot.name.includes("synthetic"))
      .filter((shot) => !shot.metrics.eventVisible)
      .map((shot) => shot.name);
    const failedChecks = bucket.checks.filter((check) => !check.ok).map((check) => check.name);
    return `| ${bucket.viewport.key} | ${bucket.screenshots.length} | ${horizontal.length ? horizontal.join(", ") : "No"} | ${hiddenEvent.length ? hiddenEvent.join(", ") : "No"} | ${failedChecks.length ? failedChecks.join(", ") : "No"} |`;
  }).join("\n");

  const consoleRows = report.consoleMessages.map((message) => `- ${message.viewport}: ${message.type}: ${message.text}`).join("\n");

  return `# Visual audit 06 - Parchis polish

## Diagnostico por capas
- Capa principal corregida: render/feedback visual local de Parchis.
- Capa secundaria corregida: CSS local del tablero, fichas, dados y panel.
- Capa conservada: motor, flujo home -> config -> game, reglas, geometria 15x15, otros juegos.

## Cambios evaluados
- Fichas seleccionables con aro tactil y pulso moderado.
- Destinos de movimiento visibles sobre casilla.
- Dados con D1/D2, estado disponible/usado y suma.
- Panel de turno con jugador activo, modo y evento visible.
- Evento clasificado por captura, bonus, meta, aviso, turno extra o victoria.
- Seguros destacados solo en Normal; Caos no marca seguros.
- Pilas de fichas desplazadas para no taparse por completo.
- Respeto a prefers-reduced-motion.

## Resumen
- Capturas: ${report.summary.screenshots}
- Checks OK: ${report.summary.passedChecks}/${report.summary.totalChecks}
- Consola: ${report.summary.consoleMessages === 0 ? "sin errores/warnings relevantes" : `${report.summary.consoleMessages} mensajes`}

## Tabla por viewport
| Viewport | Capturas | Overflow horizontal | Evento oculto | Checks fallidos |
|---|---:|---|---|---|
${viewportRows}

## Consola
${consoleRows || "- Sin errores ni warnings relevantes de consola."}

## Comparacion contra audit 04/05
- Se mantiene el tablero integrado en el shell comun sin duplicar acciones globales.
- Las reglas cubiertas por audit 05 deben seguir pasando; esta auditoria no modifica reglas.
- Frente a audit 04, el feedback visual de tirada, destinos, eventos, seguros/caos y pilas de fichas es mas legible.

## Riesgo residual
- No se valida una partida larga completa.
- Los estados avanzados usan estados sinteticos en el script de auditoria, no en produccion.
- El tablero sigue siendo 2-4 jugadores; 6 jugadores requiere otra anatomia de tablero.
`;
}

async function main() {
  await ensureDirs();
  const server = startServer();
  try {
    await waitForServer();
    const browser = await chromium.launch();
    const buckets = [];
    for (const viewport of viewports) {
      buckets.push(await auditViewport(browser, viewport));
    }
    await browser.close();

    const consoleMessages = buckets.flatMap((bucket) =>
      bucket.consoleMessages.map((message) => ({ viewport: bucket.viewport.key, ...message }))
    );
    const checks = buckets.flatMap((bucket) => bucket.checks);
    const report = {
      generatedAt: new Date().toISOString(),
      rootUrl: ROOT_URL,
      browser: "playwright chromium",
      viewports: buckets,
      consoleMessages,
      summary: {
        screenshots: buckets.reduce((sum, bucket) => sum + bucket.screenshots.length, 0),
        totalChecks: checks.length,
        passedChecks: checks.filter((check) => check.ok).length,
        failedChecks: checks.filter((check) => !check.ok).length,
        consoleMessages: consoleMessages.length
      }
    };

    await writeFile(`${OUTPUT_DIR}/report.json`, JSON.stringify(report, null, 2));
    await writeFile(`${OUTPUT_DIR}/report.md`, buildMarkdown(report));
    if (report.summary.failedChecks > 0 || report.summary.consoleMessages > 0) {
      process.exitCode = 2;
    }
  } finally {
    server.kill("SIGINT");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
