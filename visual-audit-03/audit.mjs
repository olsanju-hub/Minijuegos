import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-03";

const viewports = [
  { key: "mobile", width: 390, height: 844 },
  { key: "tablet", width: 768, height: 1024 },
  { key: "desktop", width: 1440, height: 900 }
];

const targets = [
  { id: "parchis", name: "Parchis", interaction: "roll-die" },
  { id: "damas", name: "Damas" },
  { id: "buscaminas", name: "Buscaminas" },
  { id: "reversi", name: "Reversi" },
  { id: "billar", name: "Billar", interaction: "cue-drag" },
  { id: "futbol-turnos", name: "Futbol", interaction: "piece-drag" },
  { id: "tanques", name: "Tanques", interaction: "fire" },
  { id: "trafico", name: "Tráfico", interaction: "start-run" }
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

function rectToJson(rect) {
  if (!rect) {
    return null;
  }
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
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
    const boardRect = rectFor(".board-wrap");
    const stageRect = rectFor(".game-stage-layout");
    const mainRect = rectFor(".game-stage-main");
    const topbarRect = rectFor(".topbar, .home-topbar");
    const statusRect = rectFor(".game-status-band");
    const gameBoardRect = rectFor(".parchis-shell, .checkers-board, .mines-board, .reversi-board, .billar-shell, .football-shell, .tanks-shell, .traffic-shell");
    const gameBoardArea = gameBoardRect ? gameBoardRect.width * gameBoardRect.height : 0;
    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      verticalOverflow: document.documentElement.scrollHeight > viewportHeight + 1,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      topbarRect,
      statusRect,
      stageRect,
      mainRect,
      boardRect,
      gameBoardRect,
      gameBoardViewportRatio: Number((gameBoardArea / (viewportWidth * viewportHeight)).toFixed(3)),
      floatingActionsCount: document.querySelectorAll(".game-floating-actions").length,
      visibleFloatingActionsCount: visibleCount(".game-floating-actions"),
      topbarRestartCount: document.querySelectorAll(".topbar [data-action='restart-game']").length,
      topbarRulesCount: document.querySelectorAll(".topbar [data-action='open-rules']").length,
      visibleText: (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 800),
      reversiCard: (() => {
        const card = document.querySelector("[data-action='open-game'][data-game-id='reversi']");
        if (!card) {
          return null;
        }
        return {
          text: card.innerText.replace(/\s+/g, " ").trim(),
          svgText: card.querySelector("svg")?.outerHTML.slice(0, 300) || ""
        };
      })()
    };
  });
  bucket.screenshots.push({ name, path, metrics });
  return { path, metrics };
}

async function openConfig(page, gameId) {
  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  await page.locator(`[data-action='open-game'][data-game-id='${gameId}']`).click();
  await page.waitForTimeout(250);
}

async function startGame(page) {
  await page.locator("[data-action='config-continue']").click();
  await page.waitForTimeout(450);
}

async function dragCenter(page, selector, dx, dy) {
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count < 1) {
    return false;
  }
  const box = await locator.nth(0).boundingBox();
  if (!box) {
    return false;
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 6 });
  await page.waitForTimeout(120);
  await page.mouse.up();
  return true;
}

async function clickSelector(page, selector) {
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count < 1) {
    return false;
  }
  const box = await locator.nth(0).boundingBox();
  if (!box) {
    return false;
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  return true;
}

async function interact(page, target) {
  if (target.interaction === "roll-die") {
    return clickSelector(page, "[data-action='game-action'][data-game-action='roll-die']");
  }
  if (target.interaction === "cue-drag") {
    return dragCenter(page, "[data-billar-cue-hit], .billar-cue-ball, .billar-table", -95, 28);
  }
  if (target.interaction === "piece-drag") {
    return dragCenter(page, ".football-piece.is-clickable, .football-piece.is-turn-team, .football-field", -70, 22);
  }
  if (target.interaction === "fire") {
    return clickSelector(page, "[data-tank-fire]");
  }
  if (target.interaction === "start-run") {
    return clickSelector(page, "[data-action='game-action'][data-game-action='start-run']");
  }
  return false;
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

  const bucket = { viewport, screenshots: [], consoleMessages, interactions: [] };

  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  await capture(page, viewport.key, "00-home-full", bucket, { fullPage: true });

  for (const target of targets) {
    await openConfig(page, target.id);
    await startGame(page);
    await capture(page, viewport.key, `game-${target.id}-initial`, bucket);
    if (target.interaction) {
      const didInteract = await interact(page, target);
      bucket.interactions.push({ id: target.id, interaction: target.interaction, didInteract });
      await page.waitForTimeout(500);
      await capture(page, viewport.key, `game-${target.id}-interaction`, bucket);
    }
  }

  await context.close();
  return bucket;
}

function buildComparison(report) {
  const screenshots = report.viewports.flatMap((item) => item.screenshots);
  const gameShots = screenshots.filter((shot) => shot.name.startsWith("game-"));
  const desktopHome = report.viewports
    .find((item) => item.viewport.key === "desktop")
    ?.screenshots.find((shot) => shot.name === "00-home-full");
  const reversiText = desktopHome?.metrics.reversiCard?.text || "";
  const reversiSvg = desktopHome?.metrics.reversiCard?.svgText || "";
  const criticalBoardShots = gameShots.filter((shot) =>
    shot.name.includes("buscaminas") || shot.name.includes("damas")
  );

  return {
    duplicatedFloatingActionsRemoved: gameShots.every((shot) => shot.metrics.visibleFloatingActionsCount === 0),
    topbarGlobalActionsPresent: gameShots.every((shot) => shot.metrics.topbarRestartCount === 1 && shot.metrics.topbarRulesCount === 1),
    noHorizontalOverflow: gameShots.every((shot) => !shot.metrics.horizontalOverflow),
    buscaminasDamasStillVisible: criticalBoardShots.every((shot) => {
      const rect = shot.metrics.gameBoardRect;
      return Boolean(rect && rect.width >= 220 && rect.height >= 220);
    }),
    reversiHomeKept: reversiText.toLowerCase().includes("estrategia") && !reversiText.includes("JUEGO") && !reversiSvg.includes("M17 12V36M31 12V36")
  };
}

function buildMarkdown(report) {
  const rows = report.viewports.flatMap((item) =>
    item.screenshots
      .filter((shot) => shot.name.startsWith("game-"))
      .map((shot) => ({
        viewport: item.viewport.key,
        name: shot.name,
        overflow: shot.metrics.horizontalOverflow ? "sí" : "no",
        floating: shot.metrics.visibleFloatingActionsCount,
        boardRatio: shot.metrics.gameBoardViewportRatio,
        board: shot.metrics.gameBoardRect
          ? `${shot.metrics.gameBoardRect.width}x${shot.metrics.gameBoardRect.height}`
          : "n/a"
      }))
  );
  const table = rows
    .map((row) => `| ${row.viewport} | ${row.name} | ${row.overflow} | ${row.floating} | ${row.boardRatio} | ${row.board} |`)
    .join("\n");
  const warnings = report.viewports.flatMap((item) => item.consoleMessages.map((message) => `${item.viewport.key}: ${message.type} ${message.text}`));

  return `# Visual audit 03 - Shell comun de partida

## Diagnostico
- Capa principal: motor visual/shell en \`ui.js\`.
- Capa secundaria: layout CSS compartido en \`styles.css\`.
- Acciones duplicadas detectadas: \`Reiniciar\` y \`Reglas\` estaban en \`.topbar-actions\` y tambien en \`.game-floating-actions\`.
- Juegos donde competia con UI propia: Tanques, Billar, Futbol, Trafico y Parchis; tambien restaba area a juegos de tablero.
- Clases que gobiernan el layout: \`.topbar\`, \`.topbar-actions\`, \`.game-status-band\`, \`.game-shell-body\`, \`.game-stage-layout\`, \`.game-stage-main\`, \`.board-wrap\`, \`.game-floating-actions\`.
- Parte tocada: render de partida y espaciado comun. Parte no tocada: reglas, turnos, estados internos, engine y estilos embebidos de juegos.

## Comparacion visual-audit-02 vs visual-audit-03
- Acciones flotantes duplicadas eliminadas: ${report.comparison.duplicatedFloatingActionsRemoved ? "si" : "no"}.
- Acciones globales siguen en topbar: ${report.comparison.topbarGlobalActionsPresent ? "si" : "no"}.
- Sin overflow horizontal en capturas de juego: ${report.comparison.noHorizontalOverflow ? "si" : "no"}.
- Buscaminas y Damas mantienen tablero visible: ${report.comparison.buscaminasDamasStillVisible ? "si" : "no"}.
- Reversi conserva tag/glyph propio en home: ${report.comparison.reversiHomeKept ? "si" : "no"}.

## Consola
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- Sin errores ni warnings relevantes de consola."}

## Metricas
| Viewport | Captura | Overflow H | Floating visible | Ratio tablero | Rect tablero |
|---|---|---:|---:|---:|---|
${table}

## Interacciones
${report.viewports
  .flatMap((item) => item.interactions.map((entry) => `- ${item.viewport.key}: ${entry.id} / ${entry.interaction}: ${entry.didInteract ? "ejecutada" : "no disponible"}`))
  .join("\n")}

## Intervencion priorizada
| Prioridad | Que arreglar | Por que | Archivo | Riesgo | Tipo |
|---:|---|---|---|---|---|
| 1 | Mantener acciones globales solo en topbar | Evita duplicacion y libera area de juego | ui.js | Bajo | motor visual |
| 2 | Compactar status/layout comun | Reduce competencia con tablero sin redisenar | styles.css | Bajo-medio | CSS/responsive |
| 3 | Revisar Parchis en FASE 2 | Aun tiene problemas propios de anatomia/reglas | games/parchis.js | Medio-alto | juego |
| 4 | Auditoria fina de shell por juego | Podrian quedar ajustes especificos de densidad | ui.js/styles.css/games/*.js | Medio | responsive |
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
      browserPluginPath: "fallback-playwright-script",
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
