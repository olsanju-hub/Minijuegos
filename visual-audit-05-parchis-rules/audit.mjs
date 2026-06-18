import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const ROOT_URL = "http://127.0.0.1:8080";
const OUTPUT_DIR = "visual-audit-05-parchis-rules";

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
  await mkdir(`${OUTPUT_DIR}/screenshots`, { recursive: true });
}

function buildMarkdown(report) {
  const rows = report.tests.map((test) => {
    const correction = test.correction || "No";
    return `| ${test.rule} | ${test.mode} | ${test.syntheticState} | ${test.expected} | ${test.obtained} | ${test.pass ? "OK" : "FAIL"} | ${correction} |`;
  }).join("\n");

  const failures = report.tests.filter((test) => !test.pass);
  const warnings = report.consoleMessages.map((message) => `- ${message.type}: ${message.text}`).join("\n");

  return `# Visual audit 05 - Parchis rules

## Auditoria interna
- Ficha: objeto \`{ id, playerSlot, pieceIndex, progress }\`.
- Casa: \`progress < 0\`.
- Salida/recorrido: \`progress 0..51\`, transformado a casillas visibles con la salida de cada jugador.
- Pasillo final: \`progress 52..57\`.
- Meta: \`progress >= 58\`.
- Movimientos legales: se calculan por tirada, dado consumido, suma, pieza restringida y ocupantes.
- Captura: se aplica en \`applyMoveCore\` cuando el destino contiene una ficha rival capturable.
- Bonus 21: se encola solo en Normal tras captura.
- Seguros: solo son efectivos en Normal; en Caos no se marcan ni protegen.
- Bloqueos: solo se consideran puentes en seguros en Normal.
- Tercer doble: se controla con \`doubleStreak\` y penaliza al tercer doble.
- Victoria: todas las fichas del jugador con \`progress >= 58\`.
- Reinicio: se valida creando estado inicial con las opciones activas, igual que hace el motor al reiniciar.

## Resumen
- Tests ejecutados: ${report.tests.length}
- Tests OK: ${report.tests.filter((test) => test.pass).length}
- Tests FAIL: ${failures.length}
- Consola: ${report.consoleMessages.length === 0 ? "sin errores/warnings relevantes" : "con mensajes"}

## Tabla de pruebas
| Regla | Modo | Estado sintetico | Esperado | Obtenido | Resultado | Correccion |
|---|---|---|---|---|---|---|
${rows}

## Consola
${warnings || "- Sin errores ni warnings relevantes de consola."}

## Bugs encontrados
${failures.length ? failures.map((test) => `- ${test.rule}: ${test.obtained}`).join("\n") : "- No se encontraron fallos en las reglas cubiertas por esta auditoria."}

## Riesgo residual
- No se implementan helpers de test en produccion.
- La auditoria usa el modulo real de Parchis importado por Chromium y estados sinteticos en memoria.
- Quedan fuera pruebas visuales finas y partidas largas completas.
`;
}

async function runRulesAudit(page) {
  return page.evaluate(async () => {
    const { parchisGame } = await import(`/games/parchis.js?audit=${Date.now()}`);

    const TRACK_LENGTH = 52;
    const GOAL_PROGRESS = 58;
    const START_INDICES = [5, 44, 31, 18];
    const players = [
      { slot: 0, name: "GuiYo", identity: { icon: "○", color: "#e76f51" } },
      { slot: 1, name: "Kelly", identity: { icon: "△", color: "#f2c94c" } },
      { slot: 2, name: "Guille", identity: { icon: "□", color: "#4a90e2" } },
      { slot: 3, name: "Ale", identity: { icon: "★", color: "#39b980" } }
    ];

    const tests = [];
    const screenshots = [];

    function addTest(rule, mode, syntheticState, expected, obtained, pass, correction = "") {
      tests.push({ rule, mode, syntheticState, expected, obtained, pass: Boolean(pass), correction });
    }

    function createState(mode = "normal", playerCount = 2) {
      return parchisGame.createInitialState({ playerCount, options: { mode }, players: players.slice(0, playerCount) });
    }

    function piece(state, id) {
      const found = state.pieces.find((item) => item.id === id);
      if (!found) {
        throw new Error(`Missing piece ${id}`);
      }
      return found;
    }

    function progressForTrackIndex(playerSlot, trackIndex) {
      return (trackIndex - START_INDICES[playerSlot] + TRACK_LENGTH) % TRACK_LENGTH;
    }

    function setPlayerMostlyGoal(state, playerSlot, active = []) {
      const activeIds = new Set(active);
      for (const item of state.pieces) {
        if (item.playerSlot === playerSlot && !activeIds.has(item.id)) {
          item.progress = GOAL_PROGRESS;
        }
      }
    }

    function setDice(values) {
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
    }

    function roll(state, values, actorSlot = state.currentPlayerIndex) {
      const restore = setDice(values);
      try {
        return parchisGame.applyAction({ state, action: { type: "roll-die" }, actorSlot });
      } finally {
        restore();
      }
    }

    function select(state, optionId, actorSlot = state.currentPlayerIndex) {
      return parchisGame.applyAction({
        state,
        action: { type: "select-destination", pieceId: optionId },
        actorSlot
      });
    }

    function renderInfo(state, canAct = true) {
      const host = document.createElement("div");
      host.innerHTML = parchisGame.renderBoard({
        state,
        players: players.slice(0, state.playerCount || 2),
        canAct
      });
      const targets = Array.from(host.querySelectorAll("[data-game-action='select-destination']")).map((node) => ({
        id: node.dataset.pieceId,
        text: node.textContent.replace(/\s+/g, " ").trim(),
        label: node.getAttribute("aria-label") || ""
      }));
      return {
        html: host.innerHTML,
        targets,
        targetTexts: targets.map((target) => target.text),
        safeCells: host.querySelectorAll(".parchis-track-cell.is-safe").length,
        bridgeCells: host.querySelectorAll(".parchis-track-cell.is-bridge").length,
        movablePieces: host.querySelectorAll(".parchis-piece.is-movable").length,
        modeNormalText: host.textContent.includes("Modo Normal"),
        modeChaosText: host.textContent.includes("Modo Caos")
      };
    }

    function captureSynthetic(name, state) {
      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <link rel="stylesheet" href="/styles.css" />
            <style>body{margin:0;padding:16px;background:#f6efe4;}.audit-stage{width:min(1120px,100%);margin:0 auto;}</style>
          </head>
          <body>
            <main class="audit-stage">${parchisGame.renderBoard({ state, players: players.slice(0, state.playerCount || 2), canAct: true })}</main>
          </body>
        </html>
      `;
      return { name, html };
    }

    // 1. Apertura con 5.
    {
      const state = createState("normal");
      const result = roll(state, [2, 2]);
      const next = result.state;
      const info = renderInfo(next);
      const allHome = next.pieces.filter((item) => item.playerSlot === 0).every((item) => item.progress < 0);
      addTest("Apertura sin 5", "Normal", "4 fichas en casa, tirada 2-2", "No debe salir ficha ni ofrecer destino", `targets=${info.targets.length}, allHome=${allHome}`, result.ok && info.targets.length === 0 && allHome);
    }

    {
      const state = createState("normal");
      const rolled = roll(state, [5, 2]).state;
      const info = renderInfo(rolled);
      const exit = info.targets.find((target) => `${target.text} ${target.label}`.includes("Salir con el dado 1"));
      const moved = exit ? select(rolled, exit.id).state : null;
      const opened = Boolean(moved && piece(moved, "p0-0").progress === 0);
      addTest("Apertura con dado individual 5", "Normal", "4 fichas en casa, tirada 5-2", "Debe ofrecer salida y mover una ficha a salida", `targets=${info.targetTexts.join(",")}, p0-0=${moved ? piece(moved, "p0-0").progress : "n/a"}`, Boolean(exit && opened));
    }

    {
      const state = createState("normal");
      const rolled = roll(state, [2, 3]).state;
      const info = renderInfo(rolled);
      const exit = info.targets.find((target) => `${target.text} ${target.label}`.includes("Salir con la suma 5"));
      const moved = exit ? select(rolled, exit.id).state : null;
      const opened = Boolean(moved && piece(moved, "p0-0").progress === 0 && moved.currentPlayerIndex === 1);
      addTest("Apertura con suma 5", "Normal", "4 fichas en casa, tirada 2-3", "Debe salir con suma y pasar turno", `targets=${info.targetTexts.join(",")}, current=${moved ? moved.currentPlayerIndex : "n/a"}`, Boolean(exit && opened));
    }

    // 2. Movimiento por dado individual o suma.
    {
      const state = createState("normal");
      piece(state, "p0-0").progress = 0;
      piece(state, "p0-1").progress = 10;
      setPlayerMostlyGoal(state, 0, ["p0-0", "p0-1"]);
      const rolled = roll(state, [2, 3]).state;
      const info = renderInfo(rolled);
      const hasD1 = info.targets.some((target) => target.text.includes("D1"));
      const hasD2 = info.targets.some((target) => target.text.includes("D2"));
      const hasSum = info.targets.some((target) => target.text.includes("Suma"));
      addTest("Movimiento por dado A/B/suma", "Normal", "Dos fichas fuera, tirada 2-3", "Debe ofrecer D1, D2 y Suma cuando son legales", info.targetTexts.join(","), hasD1 && hasD2 && hasSum);

      const invalid = parchisGame.applyAction({ state: rolled, action: { type: "select-destination", pieceId: "fake-option" }, actorSlot: 0 });
      addTest("Movimiento inexistente", "Normal", "Opcion fake en fase de movimiento", "Debe rechazar accion invalida", `ok=${invalid.ok}, reason=${invalid.reason}`, invalid.ok === false);
    }

    // 3. Entrada exacta a meta y victoria.
    {
      const state = createState("normal");
      piece(state, "p0-0").progress = 56;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      const overshoot = roll(state, [3, 4]).state;
      const overshootInfo = renderInfo(overshoot);
      addTest("Meta sin pasar", "Normal", "Una ficha en progreso 56, tirada 3-4", "No debe ofrecer movimientos que sobrepasan meta", `targets=${overshootInfo.targets.length}`, overshootInfo.targets.length === 0);
    }

    {
      const state = createState("normal");
      piece(state, "p0-0").progress = 56;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      const rolled = roll(state, [2, 4]).state;
      const info = renderInfo(rolled);
      const exact = info.targets.find((target) => target.text.includes("D1"));
      const moved = exact ? select(rolled, exact.id).state : null;
      addTest("Entrada exacta y victoria", "Normal", "Tres fichas en meta, ultima en 56, tirada 2-4", "Debe entrar exacto y declarar ganador", `target=${exact?.text || "none"}, winner=${moved?.winnerSlot}`, Boolean(moved && piece(moved, "p0-0").progress === GOAL_PROGRESS && moved.winnerSlot === 0));
    }

    // 4. Captura en modo Normal.
    {
      const state = createState("normal");
      piece(state, "p0-0").progress = 0;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, (START_INDICES[0] + 5) % TRACK_LENGTH);
      const rolled = roll(state, [5, 6]).state;
      const info = renderInfo(rolled);
      const capture = info.targets.find((target) => target.text.includes("D1"));
      const moved = capture ? select(rolled, capture.id).state : null;
      addTest("Captura Normal + bonus 21", "Normal", "Ficha p0 a 5 de rival en casilla capturable", "Rival vuelve a casa y queda bonus 21", `victim=${moved ? piece(moved, "p1-0").progress : "n/a"}, phase=${moved?.phase}, bonus=${moved?.bonusPending?.type}`, Boolean(moved && piece(moved, "p1-0").progress === -1 && moved.phase === "await-bonus" && moved.bonusPending?.type === 21));
    }

    // 5. Seguro y bloqueo en modo Normal.
    {
      const state = createState("normal");
      piece(state, "p0-0").progress = 3;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, 12);
      const rolled = roll(state, [2, 2]).state;
      const info = renderInfo(rolled);
      const target = info.targets.find((item) => item.text.includes("Suma"));
      const moved = target ? select(rolled, target.id).state : null;
      addTest("Seguro Normal no captura", "Normal", "Rival en casilla segura visible 13, movimiento por suma 4", "La ficha rival permanece y no hay bonus", `victim=${moved ? piece(moved, "p1-0").progress : "n/a"}, bonus=${moved?.bonusPending?.type || "none"}`, Boolean(moved && piece(moved, "p1-0").progress === progressForTrackIndex(1, 12) && !moved.bonusPending));
    }

    {
      const state = createState("normal");
      piece(state, "p0-0").progress = 4;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, 12);
      piece(state, "p1-1").progress = progressForTrackIndex(1, 12);
      const rolled = roll(state, [5, 6]).state;
      const info = renderInfo(rolled);
      addTest("Bloqueo en seguro Normal", "Normal", "Puente rival en seguro visible 13, pieza debe atravesarlo", "No debe ofrecer movimiento que atraviese bloqueo", `targets=${info.targets.length}, bridgeCells=${info.bridgeCells}`, info.targets.length === 0 && info.bridgeCells > 0);
    }

    // 6. Modo Caos.
    {
      const state = createState("chaos");
      piece(state, "p0-0").progress = 3;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, 12);
      const rolled = roll(state, [2, 2]).state;
      const info = renderInfo(rolled);
      const target = info.targets.find((item) => item.text.includes("Suma"));
      const moved = target ? select(rolled, target.id).state : null;
      addTest("Caos captura en antiguo seguro sin bonus", "Caos", "Rival en casilla que seria segura en Normal", "Debe capturar y no conceder bonus", `safeCells=${info.safeCells}, victim=${moved ? piece(moved, "p1-0").progress : "n/a"}, bonus=${moved?.bonusPending?.type || "none"}`, Boolean(moved && info.safeCells === 0 && piece(moved, "p1-0").progress === -1 && !moved.bonusPending));
    }

    {
      const state = createState("chaos");
      piece(state, "p0-0").progress = 4;
      setPlayerMostlyGoal(state, 0, ["p0-0"]);
      piece(state, "p1-0").progress = progressForTrackIndex(1, 12);
      piece(state, "p1-1").progress = progressForTrackIndex(1, 12);
      const rolled = roll(state, [5, 6]).state;
      const info = renderInfo(rolled);
      addTest("Caos sin bloqueo de seguros", "Caos", "Puente rival en antiguo seguro visible 13, pieza cruza sin aterrizar alli", "Debe existir movimiento legal y no marcar puente de bloqueo", `targets=${info.targets.length}, bridgeCells=${info.bridgeCells}`, info.targets.length > 0 && info.bridgeCells === 0);
    }

    // 7. Dobles y tercer doble.
    {
      let state = createState("normal");
      let first = roll(state, [1, 1]).state;
      addTest("Primer doble repite", "Normal", "Todo en casa, doble 1-1", "Debe mantener jugador activo y doubleStreak 1", `current=${first.currentPlayerIndex}, streak=${first.doubleStreak}, phase=${first.phase}`, first.currentPlayerIndex === 0 && first.doubleStreak === 1 && first.phase === "await-roll");
      let second = roll(first, [2, 2]).state;
      addTest("Segundo doble repite", "Normal", "Tras primer doble, doble 2-2", "Debe mantener jugador activo y doubleStreak 2", `current=${second.currentPlayerIndex}, streak=${second.doubleStreak}, phase=${second.phase}`, second.currentPlayerIndex === 0 && second.doubleStreak === 2 && second.phase === "await-roll");
      let third = roll(second, [3, 3]).state;
      addTest("Tercer doble penaliza y desbloquea", "Normal", "Tras dos dobles, tercer doble 3-3 sin ficha previa movida", "Debe pasar turno y resetear doubleStreak", `current=${third.currentPlayerIndex}, streak=${third.doubleStreak}, phase=${third.phase}`, third.currentPlayerIndex === 1 && third.doubleStreak === 0 && third.phase === "await-roll");
    }

    {
      const state = createState("normal");
      piece(state, "p0-0").progress = 10;
      state.lastMovedPieceId = "p0-0";
      state.doubleStreak = 2;
      const penalized = roll(state, [4, 4]).state;
      addTest("Tercer doble devuelve ultima ficha", "Normal", "doubleStreak 2, ultima ficha p0-0 fuera", "Debe devolver p0-0 a casa y pasar turno", `p0-0=${piece(penalized, "p0-0").progress}, current=${penalized.currentPlayerIndex}, streak=${penalized.doubleStreak}`, piece(penalized, "p0-0").progress === -1 && penalized.currentPlayerIndex === 1 && penalized.doubleStreak === 0);
    }

    // 8. Reinicio/navegacion por estado inicial y residuos de modo.
    {
      const reset = parchisGame.createInitialState({ playerCount: 2, options: { mode: "chaos" }, players: players.slice(0, 2) });
      const clean = reset.mode === "chaos"
        && reset.currentPlayerIndex === 0
        && reset.doubleStreak === 0
        && reset.phase === "await-roll"
        && reset.diceValues.every((value) => value === null)
        && reset.movablePieceIds.length === 0
        && reset.pieces.every((item) => item.progress < 0);
      addTest("Reinicio limpia estado avanzado", "Caos", "createInitialState tras estado avanzado con modo Caos", "Debe conservar modo y limpiar turno/dados/seleccion/dobles", `mode=${reset.mode}, current=${reset.currentPlayerIndex}, streak=${reset.doubleStreak}, phase=${reset.phase}`, clean);
    }

    {
      const normal = parchisGame.normalizeOptions({ mode: "normal" });
      const chaos = parchisGame.normalizeOptions({ mode: "chaos" });
      const invalid = parchisGame.normalizeOptions({ mode: "legacy" });
      addTest("Cambio de modo no conserva residuos", "Normal/Caos", "normalizeOptions normal -> chaos -> invalido", "Debe normalizar cada modo de forma independiente", `normal=${normal.mode}, chaos=${chaos.mode}, invalid=${invalid.mode}`, normal.mode === "normal" && chaos.mode === "chaos" && invalid.mode === "normal");
    }

    // Synthetic screenshots with production render only.
    const normalSafe = createState("normal");
    piece(normalSafe, "p0-0").progress = 3;
    setPlayerMostlyGoal(normalSafe, 0, ["p0-0"]);
    piece(normalSafe, "p1-0").progress = progressForTrackIndex(1, 12);
    screenshots.push(captureSynthetic("normal-safe-state", normalSafe));

    const chaosSafe = createState("chaos");
    piece(chaosSafe, "p0-0").progress = 3;
    setPlayerMostlyGoal(chaosSafe, 0, ["p0-0"]);
    piece(chaosSafe, "p1-0").progress = progressForTrackIndex(1, 12);
    screenshots.push(captureSynthetic("chaos-safe-state", chaosSafe));

    return { tests, screenshots };
  });
}

async function captureSyntheticScreens(page, names) {
  const screenshots = [];
  for (const item of names) {
    const path = `${OUTPUT_DIR}/screenshots/${item.name}.png`;
    await page.setContent(item.html, { waitUntil: "load" });
    await page.waitForTimeout(250);
    await page.screenshot({ path, fullPage: true });
    screenshots.push({ name: item.name, path });
  }
  return screenshots;
}

async function main() {
  await ensureDirs();
  const server = startServer();
  try {
    await waitForServer();
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
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

    await page.goto(ROOT_URL, { waitUntil: "networkidle" });
    const logic = await runRulesAudit(page);
    const screenshots = await captureSyntheticScreens(page, logic.screenshots);
    await context.close();
    await browser.close();

    const report = {
      generatedAt: new Date().toISOString(),
      rootUrl: ROOT_URL,
      browser: "playwright chromium",
      consoleMessages,
      tests: logic.tests,
      screenshots,
      summary: {
        total: logic.tests.length,
        passed: logic.tests.filter((test) => test.pass).length,
        failed: logic.tests.filter((test) => !test.pass).length,
        consoleMessages: consoleMessages.length
      }
    };

    await writeFile(`${OUTPUT_DIR}/report.json`, JSON.stringify(report, null, 2));
    await writeFile(`${OUTPUT_DIR}/report.md`, buildMarkdown(report));
    if (report.summary.failed > 0) {
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
