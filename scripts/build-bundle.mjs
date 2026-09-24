#!/usr/bin/env node
// Rebuilds the generated `bundle/` submodule from the backend/frontend/cli
// submodules and bumps the superproject pointers. Zero dependencies, safe to
// re-run: commits are skipped when nothing changed, pushes only happen with
// --push (and `git push` is itself a no-op when there is nothing new).

import { execSync } from "node:child_process";
import { existsSync, rmSync, cpSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUSH = process.argv.includes("--push");

function run(command, cwd = ROOT) {
  const label = relative(ROOT, cwd) || ".";
  console.log(`\n$ (${label}) ${command}`);
  execSync(command, { cwd, stdio: "inherit" });
}

/** True if `git add` staged anything different from HEAD in this repo. */
function hasStagedChanges(cwd) {
  try {
    execSync("git diff --cached --quiet", { cwd, stdio: "ignore" });
    return false;
  } catch {
    return true;
  }
}

/** Stages `addTarget`, commits only if that produced a real diff. Returns whether it committed. */
function commitIfChanged(cwd, addTarget, message) {
  run(`git add ${addTarget}`, cwd);
  const label = relative(ROOT, cwd) || ".";
  if (!hasStagedChanges(cwd)) {
    console.log(`(${label}) nothing to commit.`);
    return false;
  }
  run(`git commit -m "${message}"`, cwd);
  return true;
}

function assembleBundle(bundleDir, frontendDir) {
  cpSync(join(ROOT, "backend", "server.js"), join(bundleDir, "server.js"));
  cpSync(join(ROOT, "cli", "cli.js"), join(bundleDir, "cli.js"));

  const publicDir = join(bundleDir, "public");
  rmSync(publicDir, { recursive: true, force: true });
  cpSync(join(frontendDir, "dist", "snip-frontend", "browser"), publicDir, { recursive: true });

  // Bun auto-loads .env; PUBLIC_DIR switches server.js into also-serve-the-UI mode.
  writeFileSync(join(bundleDir, ".env"), "PUBLIC_DIR=./public\n");

  writeFileSync(
    join(bundleDir, "package.json"),
    // No "type" field: cli.js must keep running as CommonJS under plain node.
    JSON.stringify({ name: "snip-bundle", private: true, scripts: { start: "bun server.js" } }, null, 2) + "\n",
  );

  writeFileSync(
    join(bundleDir, "Dockerfile"),
    ["FROM oven/bun:1-alpine", "COPY . .", "ENV PORT=3000", "EXPOSE 3000", "CMD bun server.js", ""].join("\n"),
  );

  writeFileSync(join(bundleDir, ".dockerignore"), [".git", "node_modules", "*.log", ""].join("\n"));

  writeFileSync(
    join(bundleDir, "railway.json"),
    JSON.stringify(
      { $schema: "https://railway.app/railway.schema.json", build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" } },
      null,
      2,
    ) + "\n",
  );
}

function main() {
  console.log("== Updating backend/frontend/cli submodules to their branch tips ==");
  run("git submodule update --init --remote backend frontend cli");

  console.log("== Building frontend ==");
  const frontendDir = join(ROOT, "frontend");
  run("npm install", frontendDir);
  run("npx ng build", frontendDir);

  const builtIndex = join(frontendDir, "dist", "snip-frontend", "browser", "index.html");
  if (!existsSync(builtIndex)) {
    console.error(`Build failed: expected ${builtIndex} to exist.`);
    process.exit(1);
  }

  console.log("== Assembling bundle/ ==");
  const bundleDir = join(ROOT, "bundle");
  assembleBundle(bundleDir, frontendDir);

  console.log("== Committing bundle/ ==");
  commitIfChanged(bundleDir, "-A", "chore: rebuild bundle");
  if (PUSH) run("git push origin HEAD:bundle", bundleDir);

  console.log("== Bumping submodule pointers on main ==");
  commitIfChanged(ROOT, "backend frontend cli bundle", "chore: bump submodule pointers");
  if (PUSH) run("git push origin main", ROOT);
}

main();
