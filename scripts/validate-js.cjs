"use strict";

const { spawnSync } = require("node:child_process");
const { mkdtempSync, rmSync, writeFileSync } = require("node:fs");
const { readdirSync, readFileSync } = require("node:fs");
const { dirname, extname, join, relative, resolve } = require("node:path");
const { tmpdir } = require("node:os");

const ROOT_DIR = join(__dirname, "..");
const MODULE_JS = [
  "app.js",
  "compact-mobile.js",
  "engine.js",
  "ui.js",
  "sw.js",
  ...readdirSync(join(ROOT_DIR, "games"))
    .filter((file) => file.endsWith(".js"))
    .sort()
    .map((file) => `games/${file}`)
];
const COMMON_JS = ["server.js", "scripts/validate-js.cjs"];
const AUDIT_MJS = readdirSync(ROOT_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("visual-audit-"))
  .map((entry) => `./${entry.name}/audit.mjs`)
  .filter((file) => {
    try {
      readFileSync(join(ROOT_DIR, file));
      return true;
    } catch {
      return false;
    }
  })
  .sort();

function resolveRelativeImport(fromFile, specifier) {
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return null;
  }
  const base = specifier.startsWith("/")
    ? join(ROOT_DIR, specifier)
    : resolve(dirname(fromFile), specifier);
  return extname(base) ? base : `${base}.js`;
}

function checkRelativeImports(filePath) {
  const source = readFileSync(filePath, "utf8");
  const importPattern = /\bimport\s+(?:[^"'()]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  const failures = [];
  let match = importPattern.exec(source);
  while (match) {
    const specifier = match[1] || match[2] || "";
    const resolved = resolveRelativeImport(filePath, specifier);
    if (resolved) {
      try {
        readFileSync(resolved);
      } catch {
        failures.push(specifier);
      }
    }
    match = importPattern.exec(source);
  }
  return failures;
}

function checkFile(filePath, mode) {
  if (mode === "commonjs") {
    return spawnSync(process.execPath, ["--check", filePath], {
      cwd: ROOT_DIR,
      encoding: "utf8"
    });
  }

  const tempDir = mkdtempSync(join(tmpdir(), "minijuegos-validate-"));
  const tempFile = join(tempDir, "module.mjs");
  try {
    writeFileSync(tempFile, readFileSync(filePath, "utf8"));
    return spawnSync(process.execPath, ["--check", tempFile], {
      cwd: ROOT_DIR,
      encoding: "utf8"
    });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function printFailure(label, result) {
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  console.error(`\n[FAIL] ${label}`);
  if (output) {
    console.error(output);
  }
}

let failed = 0;

for (const file of COMMON_JS) {
  const absPath = join(ROOT_DIR, file);
  const result = checkFile(absPath, "commonjs");
  if (result.status !== 0) {
    failed += 1;
    printFailure(file, result);
  }
}

for (const file of MODULE_JS) {
  const absPath = join(ROOT_DIR, file);
  const result = checkFile(absPath, "module");
  if (result.status !== 0) {
    failed += 1;
    printFailure(`${relative(ROOT_DIR, absPath)} as ES module`, result);
  }
  const missingImports = checkRelativeImports(absPath);
  if (missingImports.length > 0) {
    failed += 1;
    console.error(`\n[FAIL] ${file} imports inexistentes: ${missingImports.join(", ")}`);
  }
}

for (const file of AUDIT_MJS) {
  const absPath = join(ROOT_DIR, file);
  const result = checkFile(absPath, "module");
  if (result.status !== 0) {
    failed += 1;
    printFailure(`${relative(ROOT_DIR, absPath)} as ES module`, result);
  }
}

if (failed > 0) {
  console.error(`\nValidacion JS fallida: ${failed} archivo(s) con errores.`);
  process.exit(1);
}

console.log(`Validacion JS OK: ${COMMON_JS.length} CommonJS + ${MODULE_JS.length} modulos ES + ${AUDIT_MJS.length} auditorias.`);
