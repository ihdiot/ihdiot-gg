# ihdiot.gg

IHDIOT lifestyle hub — reviews + gaming lifestyle. Talky, YouTube, Discord, Garage Coach.

Static site: semantic HTML/CSS + GSAP ScrollTrigger (vendored, no build step). No framework, no WebGL.
GitHub Pages / domain / deploy are intentionally **off** for now — this is a local preview.

## Open the preview

Option A — just open the file:

```
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Option B — serve it (avoids any `file://` quirks with the YouTube embeds):

```
python3 -m http.server 8080
# then visit http://localhost:8080/
```

Then scroll. The hero is pinned for ~3.6 screens:

| Beat | What happens |
| --- | --- |
| S1 enter | The N2b room, `ihdiot` wordmark glowing on the wall, storyboard top nav |
| S2 depth | Plates start to dolly at their own rates; `reviews + gaming lifestyle` surfaces |
| S3 doors | Wordmark docks higher, top nav hands off to four soft-pill doors: Talky · YouTube · Discord · Coach |
| S4 settle | Motion eases out and holds; the doors sit under the wordmark |

`prefers-reduced-motion: reduce` (or no JS) gives the static S4 stack — no pin, no parallax, doors still work.

## The room: one photo, five plates

`assets/moodboard/N2b-LOCKED.png` is the master (1536×1024). `assets/plates/` holds five registered
alpha plates derived from it — same canvas, same origin — each moving at its own scroll rate:

| Plate | Rate | Contents |
| --- | --- | --- |
| `wall.jpg` | 0.20 | back wall + framed print; everything else inpainted |
| `neon.png` | 0.35 | the pink rope as *light only* (composited with `mix-blend-mode: screen`) |
| `desk.png` | 0.55 | desk, legs, monitor + wall glow, chair, lamp, cans, phone |
| `mid.png` | 0.70 | plant + pot (left), shelf column with candle (right) |
| `fg.png` | 0.90 | blurred near desk lip, bokeh cans/glass, headphones |

The wordmark, nav and doors are DOM elements layered above the plates — nothing is baked into the images.

### Regenerating the plates

```
pip install pillow numpy
python3 tools/make_plates.py            # reads assets/moodboard/N2b-LOCKED.png
python3 tools/make_plates.py --check    # also writes /tmp/plates-registered-check.jpg
```

The cut-outs are geometric trimaps refined with luminance thresholds; holes left behind by nearer plates
(and the baked storyboard UI) are filled with a push-pull pyramid so every plate can move on its own.
Coordinates live in `build_masks()` — if the master changes, that is the only place to touch.

**Note on the master:** the copy in `assets/moodboard/` is the S1 render of the same room from the earlier
storyboards (the N2b attachment did not land on the build machine). N2b is that frame plus the subtitle line,
which is DOM text here anyway, so the plates are identical either way. Drop the real `N2b-LOCKED.png` over it
and re-run the script if you want the exact file in the repo.

## Doors / links

- Talky → https://ihdiot.github.io/talky-releases/
- YouTube → `#youtube` (four recent cuts)
- Discord → `#discord` (invite placeholder — see the TODO in `index.html`)
- Coach → `#garage-coach` (waitlist stub)

Brand: IHDIOT. The hero wordmark is lowercase `ihdiot`; `.gg` never appears in the hero.
