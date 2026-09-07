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
| Open | Dim room. Monitor wake starting — cool-white **IHDIOT** on the glass. Niches dark. |
| Scroll A · half | **Talky** niche only |
| Scroll A · full | Talky + **YouTube** (L→R) |
| Scroll B · half | **Discord** joins |
| Scroll B · full | Discord + **Coach** — all four lit |
| Scroll C | Tiny photo translate. Door words dock to a **top rail**, then the pin releases into the sections. |

Niche spotlights are **CSS** (`radial-gradient` cones, `mix-blend-mode`, `--lit` scrubbed by ScrollTrigger). No light PNGs, no fill/progress bars, no chapter montage objects.

## Room / type / doors

- **Only room photo:** `assets/moodboard/FIXED1-v2-badge-neon.png`. Old FIXED1 stays in moodboard as unused archive.
- One hero mark on the monitor glass: `assets/moodboard/H-WHITE-type-lock.svg` — cool-white **IHDIOT**. H has a detached left stem; the crossbar joins the right stem. D stem off the bowl. T bar off the stem. Never `idiot`, never `.gg`, never two marks.
- Niche cones are clipped with `overflow: hidden` on the inset boxes. No plates, no mark-cover, no poster overlay, no chair neon hide.
- Magenta neon is baked into the still. No CSS rope on the chair or climbing the monitor.
- Door labels are tracked type + glow only (no underline). Talky / YouTube / Discord / Coach stay real `<a>`s.
- Talky → https://ihdiot.github.io/talky-releases/
- YouTube → `#youtube`
- Discord → `#discord` (invite stub)
- Coach → `#garage-coach`

Brand: IHDIOT
