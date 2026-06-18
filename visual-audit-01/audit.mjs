import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-01";

const viewports = [
  { key: "mobile", width: 390, height: 844 },
  { key: "tablet", width: 768, height: 1024 },
  { key: "desktop", width: 1440, height: 900 }
];

const games = [
  { id: "tictactoe", name: "3 en raya", interaction: "mark" },
  { id: "connect4", name: "4 en raya", interaction: "drop" },
  { id: "damas", name: "Damas", interaction: "select-cell" },
  { id: "parchis", name: "Parchis", interaction: "roll-die" },
  { id: "escaleras-serpientes", name: "Escaleras y serpientes", interaction: "roll-die" },
  { id: "trafico", name: "Trafico", interaction: "start-run" },
  { id: "buscaminas", name: "Buscaminas", interaction: "press-cell" },
  { id: "sokoban", name: "Sokoban", interaction: "move-direction" },
  { id: "memory", name: "Parejas", interaction: "flip-card" },
  { id: "billar", name: "Billar", interaction: "drag-billiards" },
  { id: "futbol-turnos", name: "Futbol por turnos", interaction: "drag-football" },
  { id: "tanques", name: "Tanques", interaction: "tank-aim" },
  { id: "reversi", name: "Reversi", interaction: "select-cell" }
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
      // Retry while the local server starts.
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
  await mkdir(`${OUTPUT_DIR}/mobile`, { recursive: true });
  await mkdir(`${OUTPUT_DIR}/tablet`, { recursive: true });
  await mkdir(`${OUTPUT_DIR}/desktop`, { recursive: true });
}

async function capture(page, viewportKey, name, bucket) {
  const path = `${OUTPUT_DIR}/${viewportKey}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
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
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const boardRect = rectFor(".board-wrap");
    const topbarRect = rectFor(".topbar, .home-topbar");
    const statusRect = rectFor(".game-status-band");
    return {
      title: document.title,
      url: location.href,
      viewport: { width: viewportWidth, height: viewportHeight },
      bodyClasses: document.body.className,
      appClasses: document.querySelector("#app")?.className || "",
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      verticalOverflow: document.documentElement.scrollHeight > viewportHeight + 1,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      topbarRect,
      statusRect,
      boardRect,
      boardViewportRatio: boardRect ? Number(((boardRect.width * boardRect.height) / (viewportWidth * viewportHeight)).toFixed(3)) : null,
      visibleText: (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 600),
      styleTagCount: document.querySelectorAll("style").length
    };
  });
  bucket.screenshots.push({ name, path, metrics });
  return { path, metrics };
}

async function clickFirst(page, selector) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) {
    return false;
  }
  await locator.click({ timeout: 2000 });
  return true;
}

async function dragLocator(page, selector, dx, dy) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) {
    return false;
  }
  const box = await locator.boundingBox();
  if (!box) {
    return false;
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
  return true;
}

async function interact(page, game) {
  await page.waitForTimeout(200);
  if (game.interaction === "drag-billiards") {
    return dragLocator(page, "[data-billiards-cue-hit], .billiards-cue-hit, svg", -80, 20);
  }
  if (game.interaction === "drag-football") {
    return dragLocator(page, "[data-football-piece], svg", 70, 15);
  }
  if (game.interaction === "tank-aim") {
    const fired = await clickFirst(page, "[data-tank-action='fire'], .tanks-fire-button, button:has-text('Disparar')");
    if (fired) {
      return true;
    }
    return dragLocator(page, "[data-tank-player-id], svg", 50, -30);
  }
  if (game.interaction === "move-direction") {
    await page.keyboard.press("ArrowRight");
    return true;
  }
  if (game.id === "damas") {
    return clickFirst(page, "[data-game-action='select-cell']:not(:disabled)");
  }
  if (game.id === "reversi") {
    return clickFirst(page, ".reversi-cell.is-valid, [data-game-action='select-cell']:not(:disabled)");
  }
  if (game.id === "buscaminas") {
    const board = page.locator(".mines-grid, .mines-board, [data-mines-board]").first();
    const box = await board.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      return true;
    }
    return clickFirst(page, "[data-game-action='press-cell']:not(:disabled)");
  }
  return clickFirst(page, `[data-game-action='${game.interaction}']:not(:disabled)`);
}

async function openConfig(page, game) {
  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  const card = page.locator(`[data-action='open-game'][data-game-id='${game.id}']`);
  if ((await card.count()) !== 1) {
    throw new Error(`Cannot find catalog card for ${game.id}`);
  }
  await card.click();
  await page.waitForTimeout(350);
}

async function startGame(page) {
  const start = page.locator("[data-action='config-continue']");
  if ((await start.count()) !== 1) {
    throw new Error("Cannot find config continue button");
  }
  await start.click();
  await page.waitForTimeout(500);
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

  const bucket = {
    viewport,
    screenshots: [],
    games: [],
    consoleMessages
  };

  await page.goto(ROOT_URL, { waitUntil: "networkidle" });
  await capture(page, viewport.key, "00-home", bucket);

  for (const game of games) {
    const gameResult = { id: game.id, name: game.name, interaction: game.interaction, ok: true, errors: [] };
    try {
      await openConfig(page, game);
      await capture(page, viewport.key, `config-${game.id}`, bucket);
      await startGame(page);
      await capture(page, viewport.key, `game-${game.id}-initial`, bucket);
      const didInteract = await interact(page, game);
      gameResult.didInteract = didInteract;
      await page.waitForTimeout(["trafico", "tanques", "billar", "futbol-turnos"].includes(game.id) ? 900 : 450);
      await capture(page, viewport.key, `game-${game.id}-interaction`, bucket);
    } catch (error) {
      gameResult.ok = false;
      gameResult.errors.push(error.message);
    }
    bucket.games.push(gameResult);
  }

  await context.close();
  return bucket;
}

function deriveFindings(report) {
  const findings = [];
  for (const viewport of report.viewports) {
    for (const shot of viewport.screenshots) {
      const m = shot.metrics;
      if (m.horizontalOverflow) {
        findings.push({ severity: 3, viewport: viewport.viewport.key, screenshot: shot.name, issue: "overflow horizontal" });
      }
      if (shot.name.startsWith("game-") && shot.name.endsWith("-initial") && m.boardViewportRatio !== null && m.boardViewportRatio < 0.22) {
        findings.push({ severity: 2, viewport: viewport.viewport.key, screenshot: shot.name, issue: "tablero/area principal poco dominante" });
      }
      if (shot.name.startsWith("game-") && m.topbarRect && m.topbarRect.height > m.viewport.height * 0.16) {
        findings.push({ severity: 2, viewport: viewport.viewport.key, screenshot: shot.name, issue: "topbar consume demasiado alto" });
      }
    }
  }
  return findings;
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
    report.findings = deriveFindings(report);
    await writeFile(`${OUTPUT_DIR}/raw-report.json`, JSON.stringify(report, null, 2));
  } finally {
    server.kill("SIGINT");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
