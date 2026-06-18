import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-07-escaleras";

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

async function openGameConfig(page, gameId) {
  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  await page.locator(`[data-action='open-game'][data-game-id='${gameId}']`).click();
  await page.waitForTimeout(200);
}

async function startGame(page) {
  await page.locator("[data-action='config-continue']").click();
  await page.waitForTimeout(300);
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
    const boardRect = rectFor(".sns-board, .board, .checkers-board, .mines-board, .reversi-board, .parchis-board");
    const text = (document.body.innerText || "").replace(/\s+/g, " ").trim();
    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      verticalOverflow: document.documentElement.scrollHeight > viewportHeight + 1,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      boardRect,
      boardViewportRatio: boardRect ? Number(((boardRect.width * boardRect.height) / (viewportWidth * viewportHeight)).toFixed(3)) : 0,
      snsCells: visibleCount(".sns-cell"),
      snsPieces: visibleCount(".sns-piece"),
      snsTargets: visibleCount(".sns-cell-target"),
      snsMotion: visibleCount(".sns-motion-token"),
      snsLadders: visibleCount(".sns-ladder"),
      snsSnakes: visibleCount(".sns-snake"),
      startLabel: text.includes("Inicio"),
      goalLabel: text.includes("Meta"),
      diceText: text.includes("Resultado") || text.includes("Toca la casilla"),
      text: text.slice(0, 1000)
    };
  });
  bucket.screenshots.push({ name, path, metrics });
  return metrics;
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

async function renderSynthetic(page, scenario) {
  const html = await page.evaluate(async (scenarioName) => {
    const { escalerasSerpientesGame } = await import(`/games/escaleras-serpientes.js?audit=${Date.now()}`);
    const players = [
      { slot: 0, name: "GuiYo", identity: { icon: "O", color: "#e76f51" } },
      { slot: 1, name: "Kelly", identity: { icon: "A", color: "#f2c94c" } },
      { slot: 2, name: "Guille", identity: { icon: "S", color: "#4a90e2" } },
      { slot: 3, name: "Ale", identity: { icon: "V", color: "#39b980" } }
    ];
    const state = escalerasSerpientesGame.createInitialState({ playerCount: 4 });
    const setPiece = (slot, position) => {
      const piece = state.pieces.find((item) => item.playerSlot === slot);
      if (piece) {
        piece.position = position;
      }
    };
    const setMove = ({ from, rolledTo, final, roll, jumpType = null, pathCells, winner = false }) => {
      setPiece(0, final);
      state.turnSlot = winner ? 0 : 1;
      state.diceValue = roll;
      state.diceToken = 5;
      state.showRollAnimation = false;
      state.lastMove = {
        playerSlot: 0,
        from,
        rolledTo,
        final,
        roll,
        jumpType,
        jumpFrom: jumpType ? rolledTo : null,
        jumpTo: jumpType ? final : null,
        pathCells,
        bounced: false,
        extraTurn: false
      };
      state.lastEvent = winner
        ? "GuiYo llega exacto a la casilla 100 y gana."
        : jumpType === "ladder"
          ? `GuiYo saca ${roll}. Avanza hasta la casilla ${rolledTo}. Sube por la escalera hasta la casilla ${final}.`
          : jumpType === "snake"
            ? `GuiYo saca ${roll}. Avanza hasta la casilla ${rolledTo}. Baja por la serpiente hasta la casilla ${final}.`
            : `GuiYo saca ${roll}. Avanza hasta la casilla ${final}.`;
      state.winnerSlot = winner ? 0 : null;
    };

    if (scenarioName === "ladder") {
      setMove({ from: 0, rolledTo: 3, final: 39, roll: 3, jumpType: "ladder", pathCells: [1, 2, 3, 39] });
    } else if (scenarioName === "snake") {
      setMove({ from: 30, rolledTo: 36, final: 4, roll: 6, jumpType: "snake", pathCells: [30, 31, 32, 33, 34, 35, 36, 4] });
    } else if (scenarioName === "winner") {
      setMove({ from: 97, rolledTo: 100, final: 100, roll: 3, pathCells: [97, 98, 99, 100], winner: true });
    }
    setPiece(1, 4);
    setPiece(2, 4);
    setPiece(3, 4);

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
          <main class="audit-stage">${escalerasSerpientesGame.renderBoard({ state, players, canAct: true })}</main>
        </body>
      </html>
    `;
  }, scenario);
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(450);
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

  await openGameConfig(page, "escaleras-serpientes");
  await capture(page, viewport.key, "01-config", bucket, { fullPage: true });
  await page.locator("[data-action='select-player-count'][data-player-count='4']").click();
  await page.waitForTimeout(120);
  bucket.checks.push({
    name: "config-player-count-4",
    ok: (await page.locator("[data-action='select-player-count'][data-player-count='4'].is-active").count()) === 1
  });

  await startGame(page);
  let metrics = await capture(page, viewport.key, "02-game-initial", bucket);
  bucket.checks.push({ name: "initial-board-100-cells", ok: metrics.snsCells === 100 });
  bucket.checks.push({ name: "initial-has-snakes-ladders", ok: metrics.snsLadders >= 6 && metrics.snsSnakes >= 5 });

  await forceDice(page, [3]);
  await clickFirstVisible(page, "[data-action='game-action'][data-game-action='roll-die']");
  await page.waitForTimeout(650);
  metrics = await capture(page, viewport.key, "03-roll-die-target", bucket);
  bucket.checks.push({ name: "roll-creates-target", ok: metrics.snsTargets >= 1 && metrics.text.includes("Toca la casilla 3") });
  await clickFirstVisible(page, ".sns-cell-target");
  await page.waitForTimeout(750);
  metrics = await capture(page, viewport.key, "04-after-move", bucket);
  bucket.checks.push({ name: "move-renders-motion", ok: metrics.snsMotion >= 1 && metrics.text.includes("escalera") });

  for (const scenario of ["ladder", "snake", "winner"]) {
    await renderSynthetic(page, scenario);
    metrics = await capture(page, viewport.key, `synthetic-${scenario}`, bucket, { fullPage: viewport.key === "mobile" });
    bucket.checks.push({
      name: `${scenario}-state-visible`,
      ok: !metrics.horizontalOverflow && metrics.snsCells === 100 && metrics.snsMotion >= 1
    });
  }

  await openGameConfig(page, "escaleras-serpientes");
  await startGame(page);
  await page.locator("[data-action='open-rules']").click();
  await page.waitForTimeout(160);
  bucket.checks.push({ name: "rules-open", ok: (await page.locator(".modal-rules").count()) === 1 });
  await capture(page, viewport.key, "05-rules-open", bucket);
  await page.locator("[data-action='close-rules']").click();
  await page.waitForTimeout(120);
  await clickFirstVisible(page, "[data-action='restart-game']");
  await page.waitForTimeout(180);
  bucket.checks.push({ name: "restart-usable", ok: (await page.locator("[data-game-action='roll-die']:not([disabled])").count()) >= 1 });
  await capture(page, viewport.key, "06-after-restart", bucket);
  await page.locator("[data-action='game-back']").click();
  await page.waitForTimeout(180);
  bucket.checks.push({ name: "back-to-config", ok: (await page.locator("[data-action='config-continue']").count()) === 1 });

  for (const gameId of ["parchis", "damas", "buscaminas", "reversi"]) {
    await openGameConfig(page, gameId);
    await startGame(page);
    metrics = await capture(page, viewport.key, `regression-${gameId}-initial`, bucket);
    bucket.checks.push({
      name: `regression-${gameId}-no-horizontal-overflow`,
      ok: !metrics.horizontalOverflow && Boolean(metrics.boardRect)
    });
  }

  await context.close();
  return bucket;
}

function buildMarkdown(report) {
  const viewportRows = report.viewports.map((bucket) => {
    const horizontal = bucket.screenshots.filter((shot) => shot.metrics.horizontalOverflow).map((shot) => shot.name);
    const failedChecks = bucket.checks.filter((check) => !check.ok).map((check) => check.name);
    return `| ${bucket.viewport.key} | ${bucket.screenshots.length} | ${horizontal.length ? horizontal.join(", ") : "No"} | ${failedChecks.length ? failedChecks.join(", ") : "No"} |`;
  }).join("\n");
  const consoleRows = report.consoleMessages.map((message) => `- ${message.viewport}: ${message.type}: ${message.text}`).join("\n");

  return `# Visual audit 07 - Escaleras y Serpientes

## Diagnostico por capas
- Capa principal corregida: render/movimiento local de Escaleras y Serpientes.
- Capa secundaria corregida: geometria visual y CSS local del tablero.
- Capa conservada: motor, flujo home -> config -> game, reglas existentes, otros juegos.

## Cambios evaluados
- Tablero con inicio/meta y casillas especiales mas reconocibles.
- Ruta del ultimo movimiento marcada y token animado breve sobre el tablero.
- Escalera, serpiente y victoria verificadas con estados sinteticos solo en esta auditoria.
- Apilamiento de fichas en una misma casilla sin tapado completo.
- Reinicio, reglas, volver y cambio de jugadores desde config.
- Regresion minima de home indirecta y partidas iniciales de Parchis, Damas, Buscaminas y Reversi.

## Resumen
- Capturas: ${report.summary.screenshots}
- Checks OK: ${report.summary.passedChecks}/${report.summary.totalChecks}
- Consola: ${report.summary.consoleMessages === 0 ? "sin errores/warnings relevantes" : `${report.summary.consoleMessages} mensajes`}

## Tabla por viewport
| Viewport | Capturas | Overflow horizontal | Checks fallidos |
|---|---:|---|---|
${viewportRows}

## Consola
${consoleRows || "- Sin errores ni warnings relevantes de consola."}

## Riesgo residual
- No se valida una partida larga completa.
- La animacion de movimiento es una capa visual tras confirmar movimiento; la logica de turno no espera a que termine.
- Los estados avanzados usan helpers sinteticos en audit.mjs, no en produccion.
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
        screenshots: buckets.reduce((total, bucket) => total + bucket.screenshots.length, 0),
        totalChecks: checks.length,
        passedChecks: checks.filter((check) => check.ok).length,
        failedChecks: checks.filter((check) => !check.ok).length,
        consoleMessages: consoleMessages.length
      }
    };

    await writeFile(`${OUTPUT_DIR}/report.json`, JSON.stringify(report, null, 2));
    await writeFile(`${OUTPUT_DIR}/report.md`, buildMarkdown(report));

    if (report.summary.failedChecks > 0 || report.summary.consoleMessages > 0) {
      process.exitCode = 1;
    }
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
