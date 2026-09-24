#!/usr/bin/env node
// Zero-dependency CLI for the Snip URL shortener. CommonJS, uses global fetch (Node 18+).

const BASE_URL = process.env.SNIP_API || "http://localhost:3000";

function usage() {
  return `Usage: snip <command> [args]

Commands:
  add <url>    Create a short link for <url>
  ls           List all links
  open <code>  Open the link for <code> in your browser
  help         Show this help
`;
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function requestJson(url, options) {
  const res = await fetch(url, options);
  const body = await safeJson(res);
  if (!res.ok) {
    throw new Error(body?.error || `Request failed with status ${res.status}`);
  }
  return body;
}

async function add(args) {
  const url = args[0];
  if (!url) throw new Error("Usage: snip add <url>");

  const body = await requestJson(`${BASE_URL}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  console.log(body.shortUrl);
}

function printTable(links) {
  const codeWidth = Math.max(4, ...links.map((l) => l.code.length));
  const hitsWidth = Math.max(4, ...links.map((l) => String(l.hits).length));
  console.log(`${"CODE".padEnd(codeWidth)}  ${"HITS".padStart(hitsWidth)}  URL`);
  for (const link of links) {
    console.log(`${link.code.padEnd(codeWidth)}  ${String(link.hits).padStart(hitsWidth)}  ${link.url}`);
  }
}

async function ls() {
  const links = await requestJson(`${BASE_URL}/api/links`);
  if (!Array.isArray(links) || links.length === 0) {
    console.log("No links yet.");
    return;
  }
  printTable(links);
}

function openInBrowser(target) {
  const { spawn } = require("node:child_process");
  const platform = process.platform;
  const [command, args] =
    platform === "win32"
      ? ["cmd", ["/c", "start", "", target]]
      : platform === "darwin"
        ? ["open", [target]]
        : ["xdg-open", [target]];
  spawn(command, args, { stdio: "ignore", detached: true }).unref();
}

async function open(args) {
  const code = args[0];
  if (!code) throw new Error("Usage: snip open <code>");

  const res = await fetch(`${BASE_URL}/${code}`, { redirect: "manual" });
  const location = res.headers.get("location");
  if (!location) throw new Error(`Unknown code: ${code}`);

  openInBrowser(location);
  console.log(location);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "-h" || command === "--help") {
    console.log(usage());
    return;
  }

  switch (command) {
    case "add":
      return add(args);
    case "ls":
      return ls();
    case "open":
      return open(args);
    default:
      process.stderr.write(`Unknown command: ${command}\n\n${usage()}`);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  process.stderr.write(`${err.message || err}\n`);
  process.exitCode = 1;
});
