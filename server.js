// Snip — a tiny URL shortener. Single-file Bun server, zero npm dependencies.

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL =
  process.env.BASE_URL ??
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${PORT}`);
const PUBLIC_DIR = process.env.PUBLIC_DIR;

const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** links: code -> { code, url, hits, createdAt } */
const links = new Map();

function randomCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += BASE62[Math.floor(Math.random() * BASE62.length)];
  }
  return code;
}

function uniqueCode() {
  let code = randomCode();
  while (links.has(code)) code = randomCode();
  return code;
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function toResponseShape(link) {
  return {
    code: link.code,
    url: link.url,
    shortUrl: `${BASE_URL}/${link.code}`,
    hits: link.hits,
    createdAt: link.createdAt,
  };
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...(init.headers ?? {}) },
  });
}

async function serveStatic(pathname) {
  if (!PUBLIC_DIR) return null;
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = Bun.file(`${PUBLIC_DIR}/${relative}`);
  if (await file.exists()) {
    return new Response(file, { headers: { ...CORS_HEADERS } });
  }
  return null;
}

async function handleCreateLink(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = body?.url;
  if (typeof url !== "string" || !isHttpUrl(url)) {
    return json({ error: "url must be a valid http(s) URL" }, { status: 400 });
  }

  const link = { code: uniqueCode(), url, hits: 0, createdAt: new Date().toISOString() };
  links.set(link.code, link);
  return json(toResponseShape(link), { status: 201 });
}

function handleListLinks() {
  const all = [...links.values()].map(toResponseShape);
  return json(all);
}

function handleRedirect(code) {
  const link = links.get(code);
  if (!link) return json({ error: "Not Found" }, { status: 404 });
  link.hits += 1;
  return new Response(null, {
    status: 302,
    headers: { Location: link.url, ...CORS_HEADERS },
  });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method === "POST" && pathname === "/api/links") {
      return handleCreateLink(req);
    }

    if (req.method === "GET" && pathname === "/api/links") {
      return handleListLinks();
    }

    if (req.method === "GET" && pathname !== "/" && !pathname.startsWith("/api/")) {
      // An existing static file wins over a same-named short code.
      const staticResponse = await serveStatic(pathname);
      if (staticResponse) return staticResponse;
      return handleRedirect(pathname.slice(1));
    }

    if (req.method === "GET") {
      const staticResponse = await serveStatic(pathname);
      if (staticResponse) return staticResponse;
    }

    return json({ error: "Not Found" }, { status: 404 });
  },
});

console.log(`Snip is running at ${BASE_URL}`);
