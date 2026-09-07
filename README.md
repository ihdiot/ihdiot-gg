# IHDIOT

Lifestyle hub — Talky, YouTube, Discord, Garage Coach.

Static HTML/CSS + vendored GSAP ScrollTrigger. No framework, no WebGL, no build step.
**GitHub Pages / custom domain stay off.** Local preview only.

## Preview

```
python3 -m http.server 8080
# http://localhost:8080/
```

`prefers-reduced-motion: reduce` (or missing JS/GSAP) shows fully lit niches plus a usable top rail. No pin.

QA seeks: `?beat=open|a-mid|a-end|b-end|c-dock`

## Scroll map (~200vh pin, not a long scrub)

Hero is pinned for **+=100%** (~200vh total, inside the 180–220vh cap). Lights start on the first pixels of scroll.

| Beat | What you should see |
| --- | --- |
| Open | Dim room. One cool-white **IHDIOT**. Niches dark. |
| Scroll A · half | **Talky** niche only |
| Scroll A · full | Talky + **YouTube** (L→R) |
| Scroll B · half | **Discord** joins |
| Scroll B · full | Discord + **Coach** — all four lit |
| Scroll C | Tiny photo translate. Door words dock to a **top rail**, then the pin releases into the sections. |

Niche spotlights are **CSS** (`radial-gradient` cones, `mix-blend-mode`, `--lit` scrubbed by ScrollTrigger). No light PNGs, no fill/progress bars, no chapter montage objects.

## Room / type / doors

- **Only room photo:** `assets/moodboard/FIXED1-words-in-niches-lit.png` (the locked master). Not a regenerated desk.
- Baked niche words are covered; DOM `<a>` labels own Talky / YouTube / Discord / Coach.
- One hero mark: literal `assets/moodboard/H-WHITE-type-lock.svg` — wide **IHDIOT**, solid-bar H, broken D (stem off the bowl), stadium O, floating T bar. Cool white. Never `idiot`, never `.gg` in the hero, never two marks.
- Tiny magenta CSS rope on the chair back.
- Talky → https://ihdiot.github.io/talky-releases/
- YouTube → `#youtube`
- Discord → `#discord` (invite stub)
- Coach → `#garage-coach`

Brand: IHDIOT
