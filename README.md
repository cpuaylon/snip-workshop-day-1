# Snip

A tiny URL shortener. Single-file Bun server, zero npm dependencies, links
stored in an in-memory `Map` (state resets on restart).

## Run it

Requires [Bun](https://bun.sh).

```bash
bun run server.js
# or
npm start
```

Server listens on `PORT` (default `3000`).

## API

| Method | Path          | Purpose                                              |
| ------ | ------------- | ----------------------------------------------------- |
| POST   | `/api/links`  | Create a short link from `{ "url": "https://…" }`     |
| GET    | `/api/links`  | List all links                                        |
| GET    | `/:code`      | Redirect (302) to the original URL, incrementing hits |

A link has the shape:

```json
{
  "code": "aZ3xQ9",
  "url": "https://example.com",
  "shortUrl": "http://localhost:3000/aZ3xQ9",
  "hits": 0,
  "createdAt": "2026-09-24T12:00:00.000Z"
}
```

`POST /api/links` responds `400` for invalid JSON or a non-`http(s)` URL.
`GET /:code` responds `404` for an unknown code.

CORS is open (`*`) and `OPTIONS` preflight requests are handled, so a browser
app on another origin can call this API directly.

## Environment variables

| Variable      | Default                                     | Purpose                                    |
| ------------- | -------------------------------------------- | ------------------------------------------- |
| `PORT`        | `3000`                                       | Port to listen on                          |
| `BASE_URL`    | `https://$RAILWAY_PUBLIC_DOMAIN` or localhost | Origin used to build `shortUrl` values      |
| `PUBLIC_DIR`  | _(unset)_                                    | If set, also serve static files from here (`/` → `index.html`; an existing file wins over a same-named short code) |
