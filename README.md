# IHDIOT — MC freeform layered hub

Lifestyle hub for sim racing (iRacing / MX5 / Cross Car), FPS War Dogs, Talky, and Garage Coach.

This branch is **Master Control’s own scroll room** — not a clone of the FIXED1 niches lane, and not the N2b photo-plate room. One wordmark. No `.gg` in the hero. Pages / domain stay **off**.

## Preview locally

From the repo root (do not enable GitHub Pages):

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`. `file://` also works; GSAP is vendored under `js/vendor/`.

`prefers-reduced-motion: reduce` (or missing JS) shows a static docked room: mark in the corner, four doors lit as a top rail, sections below. Everything is usable.

## Scroll map

One pinned `100svh` stage. Track is `+=560%` (~6.6 screens). Timeline units `0–100`. Layers are CSS plates (wall / desk / chair / neon / objects / fg) with real `perspective` + `translateZ`. Foreground type moves faster; the wall is slowest. No photo crossfade.

| Units | Beat | What you see |
| --- | --- | --- |
| 0–10 | **Enter** | Black. Only the H-WHITE IHDIOT mark, mid-layer, breathing (scale + bloom). Almost no UI. |
| 10–24 | **Unseal** | Chair and desk fade in first. Wall / garage env follows slower. Foreground lip last. |
| 18–30 | **Neon ignite** | Magenta rope traces the chair back, then the desk edge. Stream-LED, not wall wash. |
| 30–42 | **Chapter 01** | Cross Car mesh draws in. One line: `THE LINE MOVES.` Mark ghosts back. |
| 42–54 | **Chapter 02** | War Dogs helmet draws in. `NO LOADOUT LEFT BEHIND.` |
| 54–66 | **Chapter 03** | Talky mic draws in. `SAY IT ONCE.` |
| 66–70 | **Pedestals** | Four trophy light bars sit on the floor plane, still dark. Mark returns. |
| 70–86 | **Trophy lights** | Left → right: Talky to half, then YouTube (Talky completes); Discord to half, then Coach (Discord completes). |
| 86–96 | **Dock** | Bars flatten into a top rail. Mark shrinks to the corner. |
| 96–100 | **Hold / release** | Unpin into Talky / YouTube / Discord / Coach sections. A matching site bar takes over. |

## Doors

- Talky → https://ihdiot.github.io/talky-releases/ (new tab)
- YouTube → `#youtube` (four embeds) and `@ihdiot`
- Discord → `#discord` stub (invite TODO in the markup)
- Coach → `coach/` stub + waitlist on `#garage-coach`

## Type DNA

Custom SVG wordmark: wide-spaced IHDIOT with a split H crossbar, D stem broken from the bowl, T cap detached from the stem, square-rounded O. One mark. Never `idiot`. Never `.gg` next to the hero.

## Stack

Static HTML / CSS. GSAP 3.13 + ScrollTrigger vendored. No framework, no WebGL, no Three. No Pages enable on this PR.
