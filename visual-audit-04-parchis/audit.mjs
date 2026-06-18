import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-04-parchis";

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
  for (const viewport of viewports) {
    await mkdir(`${OUTPUT_DIR}/${viewport.key}`, { recursive: true });
  }
}

function randomValueForDie(value) {
  return (Math.max(1, Math.min(6, value)) - 0.5) / 6;
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
  await page.waitForTimeout(400);
}

async function clickIfAny(page, selector) {
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count < 1) {
    return false;
  }
  const box = await locator.first().boundingBox();
  if (!box) {
    return false;
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  return true;
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
    const stageRect = rectFor(".game-stage-layout");
    const statusRect = rectFor(".game-status-band");
    const topbarRect = rectFor(".topbar");
    const text = (document.body.innerText || "").replace(/\s+/g, " ").trim();
    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      verticalOverflow: document.documentElement.scrollHeight > viewportHeight + 1,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      topbarRect,
      statusRect,
      stageRect,
      shellRect,
      boardRect,
      boardViewportRatio: boardRect ? Number(((boardRect.width * boardRect.height) / (viewportWidth * viewportHeight)).toFixed(3)) : 0,
      visibleFloatingActionsCount: visibleCount(".game-floating-actions"),
      movablePieces: document.querySelectorAll(".parchis-piece.is-movable").length,
      moveTargets: document.querySelectorAll(".parchis-move-target").length,
      safeCells: document.querySelectorAll(".parchis-track-cell.is-safe").length,
      bridgeCells: document.querySelectorAll(".parchis-track-cell.is-bridge").length,
      modeNormalText: text.includes("Modo Normal"),
      modeChaosText: text.includes("Modo Caos"),
      needsFiveText: text.includes("necesitas 5") || text.includes("Necesitas un 5"),
      resultFiveText: text.includes("Resultado: 5 y 2"),
      turnKellyText: text.includes("Turno de Kelly"),
      rulesOpen: Boolean(document.querySelector(".modal-rules")),
      visibleText: text.slice(0, 900)
    };
  });
  bucket.screenshots.push({ name, path, metrics });
  return { path, metrics };
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
  await capture(page, viewport.key, "01-config-default", bucket, { fullPage: true });

  await page.locator("[data-action='select-player-count'][data-player-count='4']").click();
  await page.locator("[data-action='set-game-option'][data-option='mode'][data-value='chaos']").click();
  await page.waitForTimeout(200);
  await capture(page, viewport.key, "02-config-4p-chaos", bucket, { fullPage: true });
  bucket.checks.push({
    name: "config-player-mode-change",
    ok: (await page.locator("[data-action='select-player-count'][data-player-count='4'].is-active").count()) === 1
      && (await page.locator("[data-action='set-game-option'][data-option='mode'][data-value='chaos'].is-active").count()) === 1
  });

  await page.locator("[data-action='set-game-option'][data-option='mode'][data-value='normal']").click();
  await page.locator("[data-action='select-player-count'][data-player-count='2']").click();
  await startGame(page);
  await capture(page, viewport.key, "03-game-initial-normal", bucket);

  await forceDice(page, [5, 2]);
  await clickIfAny(page, "[data-action='game-action'][data-game-action='roll-die']");
  await page.waitForTimeout(550);
  await capture(page, viewport.key, "04-first-roll-five", bucket);
  bucket.checks.push({
    name: "roll-five-opens-targets",
    ok: (await page.locator(".parchis-move-target").count()) > 0
  });

  const illegalBefore = await page.locator("[data-game-status-text]").textContent().catch(() => "");
  await clickIfAny(page, ".parchis-piece[disabled]");
  await page.waitForTimeout(120);
  const illegalAfter = await page.locator("[data-game-status-text]").textContent().catch(() => "");
  bucket.checks.push({ name: "illegal-disabled-piece-does-not-change-status", ok: illegalBefore === illegalAfter });

  const movedByPiece = await clickIfAny(page, ".parchis-piece.is-movable");
  if (!movedByPiece) {
    await clickIfAny(page, ".parchis-move-target button, button.parchis-move-target");
  }
  await page.waitForTimeout(550);
  await capture(page, viewport.key, "05-after-opening-move", bucket);
  bucket.checks.push({
    name: "opening-move-changes-turn-or-state",
    ok: (await page.locator(".parchis-piece.is-last").count()) > 0
      || ((await page.locator("[data-game-status-text]").textContent().catch(() => "")).includes("Kelly"))
  });

  await clickIfAny(page, ".parchis-move-target button, button.parchis-move-target");
  await page.waitForTimeout(450);
  await capture(page, viewport.key, "06-after-turn-resolution", bucket);
  bucket.checks.push({
    name: "turn-resolves-after-remaining-die",
    ok: ((await page.locator("[data-game-status-text]").textContent().catch(() => "")).includes("Kelly"))
      || (await page.locator("[data-action='game-action'][data-game-action='roll-die']:not([disabled])").count()) > 0
  });

  await page.locator("[data-action='open-rules']").click();
  await page.waitForTimeout(200);
  await capture(page, viewport.key, "07-rules-open", bucket);
  bucket.checks.push({ name: "rules-opens", ok: (await page.locator(".modal-rules").count()) === 1 });
  await page.locator("[data-action='close-rules']").click();
  await page.waitForTimeout(150);

  await page.locator("[data-action='restart-game']").click();
  await page.waitForTimeout(300);
  await capture(page, viewport.key, "08-after-restart", bucket);
  bucket.checks.push({
    name: "restart-after-roll",
    ok: ((await page.locator("[data-game-status-text]").textContent().catch(() => "")).includes("Necesitas un 5"))
  });

  await page.locator("[data-action='game-back']").click();
  await page.waitForTimeout(250);
  await capture(page, viewport.key, "09-back-to-config", bucket, { fullPage: true });
  bucket.checks.push({ name: "back-to-config", ok: (await page.locator("[data-action='config-continue']").count()) === 1 });

  await openParchisConfig(page);
  await page.locator("[data-action='set-game-option'][data-option='mode'][data-value='chaos']").click();
  await startGame(page);
  await capture(page, viewport.key, "10-game-initial-chaos", bucket);
  bucket.checks.push({
    name: "chaos-hides-safe-cells",
    ok: (await page.locator(".parchis-track-cell.is-safe").count()) === 0
  });

  await context.close();
  return bucket;
}

function buildComparison(report) {
  const gameShots = report.viewports.flatMap((item) => item.screenshots.filter((shot) => shot.name.includes("game") || shot.name.includes("roll") || shot.name.includes("move") || shot.name.includes("restart")));
  const normalShots = report.viewports.flatMap((item) => item.screenshots.filter((shot) => shot.name === "03-game-initial-normal"));
  const chaosShots = report.viewports.flatMap((item) => item.screenshots.filter((shot) => shot.name === "10-game-initial-chaos"));
  const allChecks = report.viewports.flatMap((item) => item.checks);
  return {
    noConsoleErrors: report.viewports.every((item) => item.consoleMessages.length === 0),
    noHorizontalOverflow: gameShots.every((shot) => !shot.metrics.horizontalOverflow),
    floatingActionsStillRemoved: gameShots.every((shot) => shot.metrics.visibleFloatingActionsCount === 0),
    normalHasSafeCells: normalShots.every((shot) => shot.metrics.safeCells > 0 && shot.metrics.modeNormalText),
    chaosHasNoSafeCells: chaosShots.every((shot) => shot.metrics.safeCells === 0 && shot.metrics.modeChaosText),
    initialRequiresFive: normalShots.every((shot) => shot.metrics.needsFiveText),
    allFunctionalChecksPassed: allChecks.every((check) => check.ok)
  };
}

function buildMarkdown(report) {
  const warnings = report.viewports.flatMap((item) => item.consoleMessages.map((message) => `${item.viewport.key}: ${message.type} ${message.text}`));
  const rows = report.viewports.flatMap((item) =>
    item.screenshots.map((shot) =>
      `| ${item.viewport.key} | ${shot.name} | ${shot.metrics.horizontalOverflow ? "si" : "no"} | ${shot.metrics.scrollHeight} | ${shot.metrics.boardRect ? `${shot.metrics.boardRect.width}x${shot.metrics.boardRect.height}` : "n/a"} | ${shot.metrics.safeCells} | ${shot.metrics.moveTargets} |`
    )
  ).join("\n");
  const checks = report.viewports
    .flatMap((item) => item.checks.map((check) => `| ${item.viewport.key} | ${check.name} | ${check.ok ? "OK" : "FAIL"} |`))
    .join("\n");

  return `# Visual audit 04 - Parchis

## Diagnostico por capas
- Metadatos/config: Parchis sigue registrado en app.js dentro del flujo comun. Se mantiene 2-4 jugadores porque el tablero, casas, salidas y metas estan definidos para 4 colores.
- Estado: el estado ahora guarda modo Normal/Caos y racha de dobles. No se introduce estado externo al motor.
- Reglas: la salida pasa a depender de 5; dobles repiten; tercer doble penaliza; captura da bonus 21 solo en Normal; Caos elimina seguros y bonus.
- Geometria: el tablero sigue siendo 15x15 con recorrido, casas, pasillos y meta existentes. No se fuerza 6 jugadores porque requiere nueva anatomia de tablero.
- Render/DOM: las fichas movibles vuelven a resolver una opcion legal aunque el click venga por pieceId; tambien se muestran modo y apertura.
- CSS/estilos: ajuste local del shell de Parchis para reducir altura y mejorar encaje, sin tocar el shell global.
- Responsive: se valida movil, tablet y escritorio. En movil se ocultan tarjetas secundarias de jugadores/evento para no competir con el tablero.
- Riesgos: las reglas avanzadas de meta/captura se validan por estructura y estados razonables; captura/meta exhaustiva queda para una fase de pruebas dirigida.

## Comparacion contra visual-audit-03
- Sin overflow horizontal: ${report.comparison.noHorizontalOverflow ? "si" : "no"}.
- Acciones flotantes siguen eliminadas: ${report.comparison.floatingActionsStillRemoved ? "si" : "no"}.
- Normal mantiene seguros visibles: ${report.comparison.normalHasSafeCells ? "si" : "no"}.
- Caos elimina seguros visibles: ${report.comparison.chaosHasNoSafeCells ? "si" : "no"}.
- Estado inicial pide 5 para abrir: ${report.comparison.initialRequiresFive ? "si" : "no"}.
- Checks funcionales: ${report.comparison.allFunctionalChecksPassed ? "OK" : "FAIL"}.

## Consola
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- Sin errores ni warnings relevantes de consola."}

## Checks funcionales
| Viewport | Check | Resultado |
|---|---|---|
${checks}

## Metricas de capturas
| Viewport | Captura | Overflow H | Scroll H | Tablero | Seguros | Targets |
|---|---|---:|---:|---|---:|---:|
${rows}

## Reglas cubiertas
- 2-4 jugadores solido.
- Modo Normal y modo Caos.
- Apertura con 5 por dado individual o suma.
- Dados por separado o suma, maximo dos dados.
- Exacto para entrar a meta, ya existente y preservado.
- Dobles repiten turno.
- Tercer doble penaliza.
- Premio de 21 casillas solo en Normal.
- Bloqueo solo en seguros en Normal.
- En Caos no hay seguros.

## Pendiente
- 6 jugadores: requiere redisenar tablero, salidas, casas, pasillos finales, colores y geometria.
- Validacion exhaustiva de captura/meta con estados sinteticos mas profundos.
- Penalizacion familiar especifica por no abrir si se quiere una variante distinta a perder turno sin 5.
`;
}

async function main() {
  await ensureDirs();
  const server = startServer();
  try {
    await waitForServer();
    const browser = await chromium.launch();
    const report = {
      generatedAt: new Date().toISOString(),
      rootUrl: ROOT_URL,
      browser: "playwright chromium",
      viewports: []
    };
    for (const viewport of viewports) {
      report.viewports.push(await auditViewport(browser, viewport));
    }
    await browser.close();
    report.comparison = buildComparison(report);
    await writeFile(`${OUTPUT_DIR}/report.json`, JSON.stringify(report, null, 2));
    await writeFile(`${OUTPUT_DIR}/report.md`, buildMarkdown(report));
  } finally {
    server.kill("SIGINT");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
