# ihdiot.gg

IHDIOT lifestyle hub — Talky, YouTube, Discord, Garage Coach.

Static HTML/CSS + GSAP ScrollTrigger (vendored under `js/vendor/`). No framework, no WebGL, no build step.
GitHub Pages / domain / deploy stay **off**. This is a local preview.

## Open the preview

Option A — just open the file (works offline; YouTube embeds need a network):

```
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Option B — serve it:

```
python3 -m http.server 8080
# then visit http://localhost:8080/
```

`prefers-reduced-motion: reduce` (or missing JS/GSAP) shows the fully lit niches plus the top rail. No pin.

## Scroll map (~220vh total, not 360%+)

The hero is pinned for **+=120%** (~220vh total, not 360%+). Lights start on the first pixels of scroll — no long dead stretch.

| Beat | Track | What happens |
| --- | --- | --- |
| Open | 0 | Room is mostly dim. Empty niches. One IHDIOT cutout wordmark, quiet. |
| Scroll A · mid | first half of A | **Talky** niche lights. Stop here and only Talky is on. |
| Scroll A · end | second half of A | **YouTube** joins. Talky stays lit. |
| Scroll B · mid | first half of B | **Discord** lights. |
| Scroll B · end | second half of B | **Coach** lights. All four niches on. |
| Scroll C | last stretch | Restrained wall / neon / desk / mid / fg depth shift. The four door words dock to a **top rail**, then the pin releases into the sections below. |

This is a new motion map. It does **not** extend the rejected N2b five-plate `+=360%` scrub.

## Brand / doors

- One gamertag in the hero: DOM/SVG **IHDIOT** cutout lettering. Never `.gg` in the hero. Never two marks stacked mid-screen.
- Niche labels are real `<a>` doors (not baked into the photo):
  - Talky → https://ihdiot.github.io/talky-releases/
  - YouTube → `#youtube`
  - Discord → `#discord` (invite stub)
  - Coach → `#garage-coach`
- `assets/moodboard/FIXED1-words-in-niches-lit.png` is the master look.
- `assets/plates/room.jpg` is the clean plate (empty niches, no baked words / no baked mark). CSS beams + DOM type own the labels.

Brand: IHDIOT
