import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-09-project";

const VIEWPORTS = [
  { key: "mobile", width: 390, height: 844, isMobile: true },
  { key: "tablet", width: 768, height: 1024, isMobile: false },
  { key: "desktop", width: 1440, height: 900, isMobile: false }
];

const BOARD_SELECTOR = [
  ".ttt-board",
  ".connect4-shell",
  ".checkers-board",
  ".parchis-board",
  ".sns-board",
  ".traffic-road-frame",
  ".mines-board",
  ".sokoban-board",
  ".memory-board",
  ".billar-orientation-note",
  "[data-billar-root]",
  ".billar-table",
  "[data-football-field]",
  ".football-field",
  ".football-pitch",
  "[data-tanks-svg]",
  ".tank-battlefield",
  ".tanks-battlefield",
  ".tanks-field",
  ".tank-stage",
  ".reversi-board"
].join(", ");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(ROOT_URL);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait for the local server.
    }
    await wait(200);
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
  for (const viewport of VIEWPORTS) {
    await mkdir(`${OUTPUT_DIR}/${viewport.key}`, { recursive: true });
  }
}

async function clickFirstUsable(page, selector) {
  const locator = page.locator(selector);
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);
    const box = await item.boundingBox();
    if (!box || box.width <= 0 || box.height <= 0) {
      continue;
    }
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    return true;
  }
  return false;
}

async function collectMetrics(page) {
  return page.evaluate((boardSelector) => {
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
    const clippedTitles = Array.from(document.querySelectorAll(".game-card-name")).filter((node) => {
      const style = window.getComputedStyle(node);
      const uglyEllipsis = style.whiteSpace === "nowrap" && style.textOverflow === "ellipsis";
      const hiddenClip = style.overflow !== "visible" && (
        node.scrollHeight > node.clientHeight + 2 ||
        node.scrollWidth > node.clientWidth + 2
      );
      const nowrapClip = style.whiteSpace === "nowrap" && node.scrollWidth > node.clientWidth + 2;
      return uglyEllipsis || hiddenClip || nowrapClip;
    }).map((node) => node.textContent.trim());
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const boardRect = rectFor(boardSelector);
    const stageRect = rectFor(".game-stage-main");
    const text = (document.body.innerText || "").replace(/\s+/g, " ").trim();
    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      verticalOverflow: document.documentElement.scrollHeight > viewportHeight + 1,
      excessiveScroll: document.documentElement.scrollHeight > viewportHeight * 1.85,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      boardRect,
      stageRect,
      boardViewportRatio: boardRect ? Number(((boardRect.width * boardRect.height) / (viewportWidth * viewportHeight)).toFixed(3)) : 0,
      visibleCards: visibleCount(".game-card-v2"),
      perspectiveBands: visibleCount(".home-perspective-band"),
      themedBands: visibleCount(".home-perspective-band[class*='theme-']"),
      homeBandSides: visibleCount(".home-band-side"),
      homeWhiteBackground: window.getComputedStyle(document.body).backgroundColor === "rgb(255, 255, 255)",
      clippedTitles,
      topbarButtons: visibleCount(".topbar [data-action='game-back'], .topbar [data-action='restart-game'], .topbar [data-action='open-rules']"),
      resultModal: visibleCount(".modal-result"),
      rulesModal: visibleCount(".modal-rules"),
      billiardsOrientationNote: visibleCount(".billar-orientation-note"),
      textSample: text.slice(0, 900)
    };
  }, BOARD_SELECTOR);
}

async function capture(page, viewportKey, name, bucket, options = {}) {
  const path = `${OUTPUT_DIR}/${viewportKey}/${name}.png`;
  await page.screenshot({ path, fullPage: Boolean(options.fullPage) });
  const metrics = await collectMetrics(page);
  bucket.screenshots.push({ name, path, metrics });
  return metrics;
}

async function openHome(page) {
  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  await page.waitForSelector(".game-card-v2", { timeout: 5000 });
}

async function openGameConfig(page, gameId) {
  await openHome(page);
  await page.locator(`[data-action='open-game'][data-game-id='${gameId}']`).click();
  await page.waitForSelector("[data-action='config-continue']", { timeout: 5000 });
  await page.waitForTimeout(80);
}

async function startGame(page) {
  await page.locator("[data-action='config-continue']").click();
  await page.waitForSelector(".game-layout", { timeout: 5000 });
  await page.waitForFunction(() => document.body.classList.contains("is-game-screen"), null, { timeout: 5000 });
  await page.waitForTimeout(180);
}

async function getGameIds(page) {
  await openHome(page);
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-action='open-game'][data-game-id]"))
      .map((node) => node.dataset.gameId)
      .filter(Boolean)
  );
}

async function smokeInteraction(page, gameId) {
  if (gameId === "sokoban") {
    const clicked = await clickFirstUsable(page, "[data-game-action='move-direction']");
    if (clicked) {
      return true;
    }
    const board = await page.locator(".sokoban-board").first().boundingBox();
    if (!board) {
      return false;
    }
    const y = board.y + board.height / 2;
    await page.mouse.move(board.x + board.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(board.x + board.width * 0.3, y, { steps: 6 });
    await page.mouse.up();
    return true;
  }

  const selectorsByGame = {
    tictactoe: "[data-game-action='mark']",
    connect4: "[data-game-action='drop']",
    damas: "[data-game-action='select-cell']",
    parchis: "[data-game-action='roll-die']",
    "escaleras-serpientes": "[data-game-action='roll-die']",
    trafico: "[data-game-action='start-run']",
    buscaminas: "[data-game-action='press-cell']",
    memory: "[data-game-action='flip-card']",
    billar: "[data-billar-table]",
    "futbol-turnos": ".football-piece.is-clickable",
    tanques: "[data-tank-action='fire'], [data-game-action='fire']",
    reversi: "[data-game-action='select-cell']"
  };
  const selector = selectorsByGame[gameId];
  if (!selector) {
    return false;
  }
  return clickFirstUsable(page, selector);
}

async function auditViewport(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile
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

  const bucket = { viewport, screenshots: [], consoleMessages, checks: [], games: [] };
  const gameIds = await getGameIds(page);
  let metrics = await capture(page, viewport.key, "00-home", bucket, { fullPage: true });
  bucket.checks.push({ name: "home-13-games", ok: metrics.visibleCards === 13 });
  bucket.checks.push({ name: "home-13-perspective-bands", ok: metrics.perspectiveBands === 13 });
  bucket.checks.push({ name: "home-13-themed-bands", ok: metrics.themedBands === 13 });
  bucket.checks.push({ name: "home-13-side-faces", ok: metrics.homeBandSides === 13 });
  bucket.checks.push({ name: "home-white-background", ok: metrics.homeWhiteBackground });
  bucket.checks.push({ name: "home-no-horizontal-overflow", ok: !metrics.horizontalOverflow });
  bucket.checks.push({ name: "home-no-ugly-title-clipping", ok: metrics.clippedTitles.length === 0, details: metrics.clippedTitles.join(", ") });

  for (const gameId of gameIds) {
    console.log(`[${viewport.key}] ${gameId}`);
    await openGameConfig(page, gameId);
    const configMetrics = await capture(page, viewport.key, `config-${gameId}`, bucket, { fullPage: true });
    const configOk = !configMetrics.horizontalOverflow && configMetrics.textSample.includes("Iniciar partida");
    bucket.checks.push({ name: `${gameId}-config-flow`, ok: configOk });

    await startGame(page);
    const gameMetrics = await capture(page, viewport.key, `game-${gameId}`, bucket);
    const billiardsPortraitFallback = gameId === "billar" && gameMetrics.billiardsOrientationNote >= 1 && viewport.key !== "desktop";
    const boardVisible = Boolean(gameMetrics.boardRect && gameMetrics.boardRect.width >= 120 && gameMetrics.boardRect.height >= 120) || billiardsPortraitFallback;
    const chromeAvailable = gameMetrics.topbarButtons >= 3;
    bucket.checks.push({ name: `${gameId}-game-no-horizontal-overflow`, ok: !gameMetrics.horizontalOverflow });
    bucket.checks.push({ name: `${gameId}-board-visible`, ok: boardVisible, details: JSON.stringify(gameMetrics.boardRect) });
    bucket.checks.push({ name: `${gameId}-global-actions-visible`, ok: chromeAvailable });

    const interacted = await smokeInteraction(page, gameId);
    await page.waitForTimeout(160);
    const afterMetrics = await capture(page, viewport.key, `game-${gameId}-after-action`, bucket);
    bucket.checks.push({ name: `${gameId}-smoke-action-attempted`, ok: interacted || ["billar", "tanques"].includes(gameId) });
    bucket.checks.push({ name: `${gameId}-after-action-no-horizontal-overflow`, ok: !afterMetrics.horizontalOverflow });

    await page.locator("[data-action='open-rules']").click();
    await page.waitForTimeout(100);
    const rulesOpen = (await page.locator(".modal-rules").count()) === 1;
    bucket.checks.push({ name: `${gameId}-rules-open`, ok: rulesOpen });
    if (rulesOpen) {
      await page.locator("[data-action='close-rules']").click();
      await page.waitForTimeout(70);
    }

    await page.locator("[data-action='game-back']").click();
    await page.waitForSelector("[data-action='config-continue']", { timeout: 5000 });
    bucket.checks.push({ name: `${gameId}-back-to-config`, ok: true });

    bucket.games.push({
      gameId,
      config: configMetrics,
      initial: gameMetrics,
      afterAction: afterMetrics,
      interacted
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

  const gameRows = report.viewports.flatMap((bucket) =>
    bucket.games.map((item) => {
      const rect = item.initial.boardRect;
      const board = rect ? `${rect.width}x${rect.height}` : "n/a";
      return `| ${bucket.viewport.key} | ${item.gameId} | ${item.initial.horizontalOverflow ? "si" : "no"} | ${item.initial.excessiveScroll ? "si" : "no"} | ${board} | ${item.interacted ? "si" : "no"} |`;
    })
  ).join("\n");

  const consoleRows = report.consoleMessages.map((message) => `- ${message.viewport}: ${message.type}: ${message.text}`).join("\n");

  const failedDetails = report.failedChecks.map((check) =>
    `- ${check.viewport}: ${check.name}${check.details ? ` (${check.details})` : ""}`
  ).join("\n");

  return `# Visual audit 09 - Project

## Diagnostico por capas
- Capa principal evaluada: home, shell comun y validacion visual reproducible.
- Capa secundaria evaluada: layout/responsive compartido en movil 390x844, tablet 768x1024 y desktop 1440x900.
- Capa conservada: motor, flujo home -> config -> game y reglas internas de juegos.

## Resumen
- Juegos detectados: ${report.summary.gameCount}
- Capturas: ${report.summary.screenshots}
- Checks OK: ${report.summary.passedChecks}/${report.summary.totalChecks}
- Consola: ${report.summary.consoleMessages === 0 ? "sin errores/warnings relevantes" : `${report.summary.consoleMessages} mensajes`}

## Tabla por viewport
| Viewport | Capturas | Overflow horizontal | Checks fallidos |
|---|---:|---|---|
${viewportRows}

## Tabla por juego
| Viewport | Juego | Overflow H inicial | Scroll excesivo | Tablero | Interaccion smoke |
|---|---|---|---|---|---|
${gameRows}

## Consola
${consoleRows || "- Sin errores ni warnings relevantes de consola."}

## Checks fallidos
${failedDetails || "- Ninguno."}

## Riesgo residual
- La auditoria smoke no simula partidas largas completas.
- Billar, Futbol, Tanques y Trafico se prueban sin validar precision avanzada de gestos.
- La medicion de tablero exige area visible minima, no juicio estetico humano.
`;
}

async function main() {
  await ensureDirs();
  const server = startServer();
  try {
    await waitForServer();
    const browser = await chromium.launch();
    const buckets = [];
    for (const viewport of VIEWPORTS) {
      buckets.push(await auditViewport(browser, viewport));
    }
    await browser.close();

    const consoleMessages = buckets.flatMap((bucket) =>
      bucket.consoleMessages.map((message) => ({ viewport: bucket.viewport.key, ...message }))
    );
    const checks = buckets.flatMap((bucket) =>
      bucket.checks.map((check) => ({ viewport: bucket.viewport.key, ...check }))
    );
    const report = {
      generatedAt: new Date().toISOString(),
      rootUrl: ROOT_URL,
      browser: "playwright chromium",
      viewports: buckets,
      consoleMessages,
      failedChecks: checks.filter((check) => !check.ok),
      summary: {
        gameCount: buckets[0]?.games.length || 0,
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
