# Snip design system

Visual language borrowed from lovable.dev's look and feel (dark, minimal,
warm-glow hero, pill-shaped centerpiece input). No borrowed logo, name, or copy.
Paste this file into any future styling prompt as the source of truth.

## Color tokens

| Token              | Value                                             | Use                              |
| ------------------ | -------------------------------------------------- | --------------------------------- |
| `--bg`              | `#0a0a0c`                                          | Page background (near-black)      |
| `--surface`         | `#151417`                                          | Cards, table, inputs               |
| `--surface-raised`  | `#1c1b1f`                                          | Hover / raised surface             |
| `--border`          | `rgba(255, 255, 255, 0.08)`                        | Subtle borders on cards/inputs     |
| `--border-strong`   | `rgba(255, 255, 255, 0.16)`                        | Focus / hover borders              |
| `--text`            | `#f5f4f2`                                          | Primary text                       |
| `--muted`           | `#9a97a0`                                          | Subline, secondary text            |
| `--accent-coral`    | `#ff6b6b`                                          | Gradient stop 1                    |
| `--accent-pink`     | `#f6528c`                                          | Gradient stop 2                    |
| `--accent-orange`   | `#ff9a5a`                                          | Gradient stop 3                    |
| `--accent-gradient` | `linear-gradient(135deg, var(--accent-coral), var(--accent-pink) 55%, var(--accent-orange))` | Primary buttons, glow, links |
| `--success`         | `#3ddc84`                                          | Success notice text                |
| `--error`           | `#ff6b6b`                                          | Error notice text                  |

## Type

- Font stack: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Scale: hero `2.75rem/1.1`, section/table heading `1rem/1.4` (muted, uppercase,
  letter-spacing `0.04em`), body `1rem/1.5`, small `0.875rem/1.4`.
- Weight: hero `700`, body `400`–`500`, muted subline `400`.

## Spacing & radii

- Spacing scale (rem): `0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4`.
- Radii: pill input/buttons `999px`, cards `20px`, small controls `12px`.
- Page max width `680px`, generous vertical rhythm (`4rem`+ around hero).

## Borders, shadow, glow

- Card border: `1px solid var(--border)`.
- Card shadow: `0 1px 0 rgba(255,255,255,0.03) inset, 0 20px 40px rgba(0,0,0,0.35)`.
- Hero glow: large blurred radial gradient using the accent colors, positioned
  behind the hero content, `filter: blur(80px)`, low opacity (`0.35`–`0.5`).
- Focus ring: `0 0 0 3px rgba(246, 82, 140, 0.35)`.

## Element mapping

| Snip element        | System role                                                              |
| -------------------- | -------------------------------------------------------------------------- |
| Page header ("Snip" + subline) | Hero: centered, bold headline over muted subline, sits on the gradient glow |
| URL form              | Chat-style centerpiece: large pill-rounded input with the primary action (gradient pill button) attached to its trailing edge |
| Success notice        | Small rounded pill/card below the form, `--success` text on `--surface`     |
| Error notice          | Same shape, `--error` text on `--surface`                                   |
| Links table           | A single generously-rounded card (`--surface`, `--border`, shadow) containing the table, muted uppercase column headers |
