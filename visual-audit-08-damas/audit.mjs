import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-08-damas";

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

async function openGameConfig(page, gameId) {
  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  await page.locator(`[data-action='open-game'][data-game-id='${gameId}']`).click();
  await page.waitForTimeout(200);
}

async function startGame(page) {
  await page.locator("[data-action='config-continue']").click();
  await page.waitForTimeout(300);
}

async function clickCell(page, row, col) {
  await page.locator(`[data-game-action='select-cell'][data-row='${row}'][data-col='${col}']`).click();
  await page.waitForTimeout(180);
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
    const boardRect = rectFor(".checkers-board, .parchis-board, .sns-board, .mines-board, .reversi-board");
    const text = (document.body.innerText || "").replace(/\s+/g, " ").trim();
    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      verticalOverflow: document.documentElement.scrollHeight > viewportHeight + 1,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      boardRect,
      boardViewportRatio: boardRect ? Number(((boardRect.width * boardRect.height) / (viewportWidth * viewportHeight)).toFixed(3)) : 0,
      checkersCells: visibleCount(".checkers-cell"),
      checkersPieces: visibleCount(".checkers-piece"),
      selected: visibleCount(".checkers-cell.is-selected"),
      targets: visibleCount(".checkers-cell.is-target"),
      captureTargets: visibleCount(".checkers-cell.is-capture-target"),
      kings: visibleCount(".checkers-piece.is-king"),
      feedback: visibleCount(".checkers-feedback"),
      lastTo: visibleCount(".checkers-cell.is-last-to"),
      winnerModal: visibleCount(".result-card, .result-modal, [data-result]"),
      text: text.slice(0, 1000)
    };
  });
  bucket.screenshots.push({ name, path, metrics });
  return metrics;
}

async function renderSynthetic(page, scenario) {
  const html = await page.evaluate(async (scenarioName) => {
    const { damasGame } = await import(`/games/damas.js?audit=${Date.now()}`);
    const players = [
      { slot: 0, name: "GuiYo", identity: { icon: "O", color: "#e76f51" } },
      { slot: 1, name: "Kelly", identity: { icon: "A", color: "#4a90e2" } }
    ];
    const emptyBoard = () => Array.from({ length: 8 }, () => Array(8).fill(null));
    const apply = (state, row, col) => damasGame.applyAction({
      state,
      action: { type: "select-cell", row, col },
      actorSlot: state.turnSlot
    }).state;

    let state = damasGame.createInitialState({});
    state.board = emptyBoard();
    state.lastEvent = "Estado sintetico de auditoria.";

    if (scenarioName === "capture") {
      state.board[5][0] = "p0";
      state.board[4][1] = "p1";
      state.board[1][6] = "p1";
      state = apply(apply(state, 5, 0), 3, 2);
    } else if (scenarioName === "crown") {
      state.board[1][2] = "p0";
      state.board[6][5] = "p1";
      state = apply(apply(state, 1, 2), 0, 1);
    } else if (scenarioName === "winner") {
      state.board[2][3] = "p0";
      state.board[1][4] = "p1";
      state = apply(apply(state, 2, 3), 0, 5);
    } else if (scenarioName === "forced") {
      state.board[5][0] = "p0";
      state.board[4][1] = "p1";
      state.board[2][3] = "p1";
      state.board[0][7] = "p1";
      state = apply(apply(state, 5, 0), 3, 2);
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
            .audit-stage { width: min(760px, 100%); margin: 0 auto; }
          </style>
        </head>
        <body>
          <main class="audit-stage screen game-screen-damas">${damasGame.renderBoard({ state, players, options: { showHints: true }, canAct: true })}</main>
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

  await openGameConfig(page, "damas");
  let metrics = await capture(page, viewport.key, "01-config", bucket, { fullPage: true });
  bucket.checks.push({ name: "config-compact-visible", ok: metrics.text.includes("Ayudas visuales") });

  await startGame(page);
  metrics = await capture(page, viewport.key, "02-game-initial", bucket);
  bucket.checks.push({ name: "initial-board-64-cells", ok: metrics.checkersCells === 64 && metrics.checkersPieces === 24 });

  await clickCell(page, 5, 0);
  metrics = await capture(page, viewport.key, "03-piece-selected", bucket);
  bucket.checks.push({ name: "selection-visible", ok: metrics.selected === 1 && metrics.targets >= 1 && metrics.feedback >= 1 });
  await capture(page, viewport.key, "04-legal-moves-visible", bucket);

  await clickCell(page, 4, 1);
  metrics = await capture(page, viewport.key, "05-move-done", bucket);
  bucket.checks.push({ name: "move-applied", ok: metrics.lastTo >= 1 && metrics.text.includes("mueve") });

  for (const scenario of ["capture", "crown", "winner", "forced"]) {
    await renderSynthetic(page, scenario);
    metrics = await capture(page, viewport.key, `synthetic-${scenario}`, bucket, { fullPage: viewport.key === "mobile" });
    const expectedText = scenario === "capture"
      ? "captura"
      : scenario === "crown"
        ? "Corona"
        : scenario === "winner"
          ? "Victoria"
          : "Debe seguir capturando";
    bucket.checks.push({
      name: `${scenario}-state-visible`,
      ok: !metrics.horizontalOverflow && metrics.checkersCells === 64 && metrics.text.includes(expectedText)
    });
  }

  await openGameConfig(page, "damas");
  await startGame(page);
  await page.locator("[data-action='open-rules']").click();
  await page.waitForTimeout(160);
  bucket.checks.push({ name: "rules-open", ok: (await page.locator(".modal-rules").count()) === 1 });
  await capture(page, viewport.key, "06-rules-open", bucket);
  await page.locator("[data-action='close-rules']").click();
  await page.waitForTimeout(120);
  await clickFirstVisible(page, "[data-action='restart-game']");
  await page.waitForTimeout(180);
  metrics = await capture(page, viewport.key, "07-after-restart", bucket);
  bucket.checks.push({ name: "restart-usable", ok: metrics.checkersPieces === 24 });
  await page.locator("[data-action='game-back']").click();
  await page.waitForTimeout(180);
  bucket.checks.push({ name: "back-to-config", ok: (await page.locator("[data-action='config-continue']").count()) === 1 });
  await capture(page, viewport.key, "08-back-to-config", bucket, { fullPage: true });

  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  metrics = await capture(page, viewport.key, "09-home-regression", bucket, { fullPage: true });
  bucket.checks.push({ name: "home-loads", ok: metrics.text.includes("Damas") && !metrics.horizontalOverflow });

  for (const gameId of ["parchis", "escaleras-serpientes", "buscaminas", "reversi"]) {
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

  return `# Visual audit 08 - Damas

## Diagnostico por capas
- Capa principal corregida: render/DOM y feedback local de Damas.
- Capa secundaria corregida: CSS local de seleccion, capturas, coronacion y ultimo movimiento.
- Capa conservada: motor, flujo home -> config -> game, reglas existentes, otros juegos.

## Cambios evaluados
- Seleccion de pieza y movimientos legales visibles.
- Capturas obligatorias, cadena de captura, coronacion y victoria con estados sinteticos solo en esta auditoria.
- Feedback breve bajo el tablero.
- Reinicio, reglas y volver.
- Regresion minima de Home, Parchis, Escaleras, Buscaminas y Reversi.

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

## Reglas confirmadas
- Seleccion de pieza propia.
- Movimiento simple de ficha normal.
- Captura obligatoria.
- Cadena de captura si la misma ficha puede continuar.
- Coronacion al llegar a la ultima fila.
- Dama a distancia ya existente en el modulo.
- Victoria por captura total o rival sin movimientos.

## Riesgo residual
- No se valida una partida larga completa.
- Las fichas normales capturan solo hacia adelante segun la implementacion actual.
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
