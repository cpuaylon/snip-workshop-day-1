# Snip CLI

A zero-dependency Node CLI for the Snip URL shortener backend. CommonJS, uses
global `fetch` (Node 18+).

## Usage

```bash
./snip add https://example.com/a/long/path   # prints the shortUrl
./snip ls                                    # aligned code/hits/url table
./snip open <code>                           # opens the target in your browser
./snip                                       # usage text
```

On Windows use `snip.cmd` (cmd.exe) or `snip.ps1` (PowerShell) instead of `./snip`.

## Configuration

| Variable    | Default                 | Purpose               |
| ----------- | ------------------------ | ---------------------- |
| `SNIP_API`  | `http://localhost:3000` | Backend base URL        |

## Install

Put this folder on your `PATH`, or run `npm link` to expose the `snip` bin
entry globally (see `package.json`).

Errors (bad input, unknown code, unreachable backend) print to stderr and the
process exits with code `1`.
