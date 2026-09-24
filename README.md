# Snip

A tiny URL shortener built as **one backend, two clients**: a shared HTTP API,
consumed by both a web frontend and a CLI. Each layer lives on its own branch
of this same repository and is mounted here as a git submodule, so this `main`
branch is the aggregator that ties them together.

## API contract

Backend base URL defaults to `http://localhost:3000` (`SNIP_API` env var for
the CLI, `BASE_URL`/`PORT` env vars for the server itself).

| Method | Path            | Request body           | Response                                          |
| ------ | --------------- | ----------------------- | --------------------------------------------------- |
| POST   | `/api/links`    | `{ "url": "https://…" }` | `201 { code, url, shortUrl, hits, createdAt }`, or `400 { error }` for invalid JSON / non-http(s) URL |
| GET    | `/api/links`    | —                        | `200` array of link objects                          |
| GET    | `/:code`        | —                        | `302` redirect to the original URL (increments `hits`), or `404` if unknown |

## Branch-per-layer + submodule layout

| Branch     | Contains                                   | Mounted here as |
| ---------- | -------------------------------------------- | ----------------- |
| `backend`  | Zero-dependency Bun server (`server.js`)     | `backend/`        |
| `frontend` | Angular 19 web app (`snip-frontend`)         | `frontend/`       |
| `cli`      | Zero-dependency Node CLI (`cli.js`)          | `cli/`            |
| `bundle`   | **Generated** deployable release (see below) | `bundle/`         |
| `main`     | This aggregator — `.gitmodules` + this README | —                |

Each submodule folder is a full clone of this repository, checked out to its
own branch, so it can be developed and pushed independently.

## The `bundle` branch (generated, do not hand-edit)

`bundle` is a release artifact assembled by [`scripts/build-bundle.mjs`](scripts/build-bundle.mjs):
it updates the `backend`/`frontend`/`cli` submodules, builds the Angular app,
and copies `server.js` + `cli.js` + the built UI into a single deployable
folder (`.env` with `PUBLIC_DIR=./public` puts the Bun server into
also-serve-the-UI mode), alongside a `package.json`, `Dockerfile`,
`.dockerignore`, and `railway.json`. Never edit files inside `bundle/` by
hand — rerun the script instead.

```bash
node scripts/build-bundle.mjs          # assemble + commit locally
node scripts/build-bundle.mjs --push   # also push bundle and main
```

The script is safe to re-run: it skips commits when nothing changed, and
`--push` is a no-op when there is nothing new to push.

## Clone

Plain clones leave submodule folders empty. Always clone with:

```bash
git clone --recurse-submodules <REPO_URL>
```

(or, after a plain clone: `git submodule update --init --recursive`).

## Run everything

```bash
# Backend (requires Bun)
cd backend && bun run server.js        # http://localhost:3000

# Frontend (requires Node)
cd frontend && npm install && npx ng serve

# CLI (requires Node 18+)
cd cli && ./snip ls                    # snip.cmd / snip.ps1 on Windows
```

## Update workflow

Submodules track a branch, but a submodule pointer in `main` is a pinned
commit — updating one is a two-step commit:

1. **Inside the submodule folder:** make your change, commit, and push it to
   that branch as usual.

   ```bash
   cd backend
   git add -A && git commit -m "..." && git push
   ```

2. **In the superproject (`main`):** pull the new commit into the pointer,
   stage it, and commit the bump.

   ```bash
   git submodule update --remote backend
   git add backend
   git commit -m "chore: bump backend submodule"
   git push
   ```
