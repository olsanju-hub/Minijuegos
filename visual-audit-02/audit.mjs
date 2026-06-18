import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-02";

const viewports = [
  { key: "mobile", width: 390, height: 844 },
  { key: "tablet", width: 768, height: 1024 },
  { key: "desktop", width: 1440, height: 900 }
];

const targets = [
  { id: "reversi", name: "Reversi", shots: ["config", "game-initial"] },
  { id: "buscaminas", name: "Buscaminas", shots: ["game-initial", "interaction"] },
  { id: "damas", name: "Damas", shots: ["game-initial", "interaction"] }
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
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const boardRect = rectFor(".board-wrap");
    const gameBoardRect = rectFor(".mines-board, .checkers-board, .reversi-board");
    const topbarRect = rectFor(".topbar, .home-topbar");
    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      verticalOverflow: document.documentElement.scrollHeight > viewportHeight + 1,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      topbarRect,
      boardRect,
      gameBoardRect,
      visibleText: (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 700),
      reversiCard: (() => {
        const card = document.querySelector("[data-action='open-game'][data-game-id='reversi']");
        if (!card) {
          return null;
        }
        return {
          text: card.innerText.replace(/\s+/g, " ").trim(),
          svgText: card.querySelector("svg")?.outerHTML.slice(0, 260) || ""
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
  await page.waitForTimeout(350);
}

async function startGame(page) {
  await page.locator("[data-action='config-continue']").click();
  await page.waitForTimeout(500);
}

async function clickBoardCenter(page, selector) {
  const locator = page.locator(selector).first();
  const box = await locator.boundingBox();
  if (!box) {
    return false;
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  return true;
}

async function interact(page, gameId) {
  if (gameId === "buscaminas") {
    return clickBoardCenter(page, ".mines-board");
  }
  if (gameId === "damas") {
    const preferredCells = [
      ".checkers-cell[data-row='5'][data-col='0']",
      ".checkers-cell[data-row='5'][data-col='2']",
      ".checkers-cell[data-row='5'][data-col='4']",
      ".checkers-cell[data-row='5'][data-col='6']"
    ];
    for (const selector of preferredCells) {
      const cell = page.locator(selector);
      if ((await cell.count()) === 0) {
        continue;
      }
      const box = await cell.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        return true;
      }
    }
    return false;
  }
  if (gameId === "reversi") {
    const hint = page.locator(".reversi-cell.is-suggested:not([disabled])").first();
    if ((await hint.count()) > 0) {
      await hint.click();
      return true;
    }
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
    if (target.id === "reversi") {
      await capture(page, viewport.key, "config-reversi", bucket);
    }
    await startGame(page);
    await capture(page, viewport.key, `game-${target.id}-initial`, bucket);
    if (target.shots.includes("interaction")) {
      const didInteract = await interact(page, target.id);
      bucket.interactions.push({ id: target.id, didInteract });
      await page.waitForTimeout(450);
      await capture(page, viewport.key, `game-${target.id}-interaction`, bucket);
    }
  }

  await context.close();
  return bucket;
}

function compareWithAudit01(report) {
  const comparison = {
    reversiHomeFixed: false,
    buscaminasBoardsVisible: true,
    damasTabletHorizontalOverflowFixed: true
  };

  const desktopHome = report.viewports.find((item) => item.viewport.key === "desktop")?.screenshots.find((shot) => shot.name === "00-home-full");
  const reversiText = desktopHome?.metrics.reversiCard?.text || "";
  const reversiSvg = desktopHome?.metrics.reversiCard?.svgText || "";
  comparison.reversiHomeFixed = reversiText.toLowerCase().includes("estrategia") && !reversiText.includes("JUEGO") && !reversiSvg.includes("M17 12V36M31 12V36");

  for (const viewport of report.viewports) {
    for (const shot of viewport.screenshots) {
      if (!shot.name.startsWith("game-buscaminas")) {
        continue;
      }
      const rect = shot.metrics.gameBoardRect;
      if (!rect || rect.width < 220 || rect.height < 220 || shot.metrics.horizontalOverflow) {
        comparison.buscaminasBoardsVisible = false;
      }
    }
  }

  const tabletDamas = report.viewports.find((item) => item.viewport.key === "tablet")?.screenshots.filter((shot) => shot.name.startsWith("game-damas"));
  comparison.damasTabletHorizontalOverflowFixed = Boolean(tabletDamas?.length) && tabletDamas.every((shot) => !shot.metrics.horizontalOverflow);

  return comparison;
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
    report.comparison = compareWithAudit01(report);
    await writeFile(`${OUTPUT_DIR}/report.json`, JSON.stringify(report, null, 2));
  } finally {
    server.kill("SIGINT");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
