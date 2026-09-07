#!/usr/bin/env python3
"""Derive the five registered parallax plates from the locked N2b master.

    python3 tools/make_plates.py [assets/moodboard/N2b-LOCKED.png]

Outputs (all 1536x1024, same origin as the master) into assets/plates/:

    wall.jpg   opaque back wall + framed print. Every other plate's region
               (and the baked wordmark / nav / storyboard label) is inpainted.
    neon.png   the pink rope as *light only* (master minus inpainted wall),
               meant to be composited with mix-blend-mode: screen.
    desk.png   desk surface, legs, monitor + its wall glow, chair, lamp,
               cans, phone.
    mid.png    plant + pot (left) and the shelf column (right).
    fg.png     blurred near desk lip, the bokeh cans/glass and headphones.

The cutouts are geometric trimaps refined with luminance thresholds. Holes
left behind by nearer plates are filled with a push-pull pyramid so every
plate can move on its own without exposing the object it used to cover.

Requires Pillow and numpy only.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1536, 1024
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "plates"


# --------------------------------------------------------------------------- utils
def load_master(path: Path) -> np.ndarray:
    im = Image.open(path).convert("RGB")
    if im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    return np.asarray(im).astype(np.float32)


def to_pil_mask(arr: np.ndarray) -> Image.Image:
    return Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), "L")


def from_pil_mask(im: Image.Image) -> np.ndarray:
    return np.asarray(im).astype(np.float32) / 255.0


def blur(arr: np.ndarray, radius: float) -> np.ndarray:
    if radius <= 0:
        return arr
    return from_pil_mask(to_pil_mask(arr).filter(ImageFilter.GaussianBlur(radius)))


def poly(points, feather: float = 0.0) -> np.ndarray:
    im = Image.new("L", (W, H), 0)
    ImageDraw.Draw(im).polygon([tuple(p) for p in points], fill=255)
    m = from_pil_mask(im)
    return blur(m, feather) if feather else m


def rect(x0, y0, x1, y1, feather: float = 0.0, radius: int = 0) -> np.ndarray:
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)
    if radius:
        d.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=255)
    else:
        d.rectangle([x0, y0, x1, y1], fill=255)
    m = from_pil_mask(im)
    return blur(m, feather) if feather else m


def smoothstep(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def union(*masks: np.ndarray) -> np.ndarray:
    out = np.zeros((H, W), np.float32)
    for m in masks:
        out = 1 - (1 - out) * (1 - m)
    return out


def dilate(mask: np.ndarray, px: int) -> np.ndarray:
    im = to_pil_mask(mask).filter(ImageFilter.MaxFilter(px * 2 + 1))
    return from_pil_mask(im)


def luminance(img: np.ndarray) -> np.ndarray:
    return img[..., 0] * 0.299 + img[..., 1] * 0.587 + img[..., 2] * 0.114


def band_y(y0: float, y1: float, feather: float) -> np.ndarray:
    ys = np.arange(H, dtype=np.float32)[:, None]
    m = smoothstep(ys, y0 - feather, y0) * (1 - smoothstep(ys, y1, y1 + feather))
    return np.repeat(m, W, axis=1)


# ------------------------------------------------------------------ inpainting
def _down(a: np.ndarray) -> np.ndarray:
    h, w = a.shape[:2]
    if h % 2:
        a = np.concatenate([a, a[-1:]], axis=0)
    if w % 2:
        a = np.concatenate([a, a[:, -1:]], axis=1)
    return 0.25 * (a[0::2, 0::2] + a[1::2, 0::2] + a[0::2, 1::2] + a[1::2, 1::2])


def _up(a: np.ndarray, shape) -> np.ndarray:
    h, w = shape
    if a.ndim == 3:
        chans = [
            np.asarray(Image.fromarray(a[..., c]).resize((w, h), Image.BILINEAR))
            for c in range(a.shape[2])
        ]
        return np.stack(chans, axis=-1).astype(np.float32)
    return np.asarray(Image.fromarray(a).resize((w, h), Image.BILINEAR)).astype(np.float32)


def pyramid_fill(img: np.ndarray, known: np.ndarray) -> np.ndarray:
    """Push-pull fill: unknown pixels take a smooth average of surrounding known ones."""
    levels = []
    c = img * known[..., None]
    w = known.copy()
    while min(c.shape[:2]) > 4:
        levels.append((c, w))
        c, w = _down(c), _down(w)
    filled = c / np.maximum(w, 1e-6)[..., None]
    for c, w in reversed(levels):
        up = _up(filled, c.shape[:2])
        wc = np.clip(w, 0, 1)[..., None]
        local = c / np.maximum(w, 1e-6)[..., None]
        filled = wc * local + (1 - wc) * up
    return filled


def inpaint(img: np.ndarray, hole: np.ndarray, grain: float = 3.0, seed: int = 7) -> np.ndarray:
    known = 1 - np.clip(hole, 0, 1)
    fill = pyramid_fill(img, known)
    # soften the fill a touch so hard hole outlines don't print through
    fill_im = Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))
    fill = np.asarray(fill_im).astype(np.float32)
    if grain:
        rng = np.random.default_rng(seed)
        fill = fill + rng.normal(0, grain, fill.shape).astype(np.float32) * hole[..., None]
    out = img * known[..., None] + fill * hole[..., None]
    return np.clip(out, 0, 255)


def save_rgba(rgb: np.ndarray, alpha: np.ndarray, path: Path) -> None:
    a = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    rgb8 = np.clip(rgb, 0, 255).astype(np.uint8)
    # black-out fully transparent pixels so the PNG compresses well
    rgb8 = (rgb8 * (a > 0)[..., None]).astype(np.uint8)
    Image.fromarray(np.dstack([rgb8, a]), "RGBA").save(path, optimize=True)


# ------------------------------------------------------------------ masks
def build_masks(img: np.ndarray) -> dict[str, np.ndarray]:
    L = luminance(img)
    pink = img[..., 0] - img[..., 1]

    # -- foreground: blurred desk lip + bokeh objects + headphones
    fg = union(
        band_y(780, H, 24),
        rect(20, 728, 140, 820, feather=14),                    # tall blurry cup, far left
        rect(95, 750, 262, 840, feather=12),                    # blurry can, left
        rect(1392, 770, 1526, 900, feather=14, radius=30),      # glass, right
        poly([(1198, 645), (1206, 585), (1236, 542), (1278, 524), (1322, 534), (1352, 568),
              (1368, 618), (1368, 705), (1352, 748), (1304, 762), (1250, 762), (1210, 742),
              (1194, 704)], feather=9),                          # headphones
        rect(1268, 740, 1306, 800, feather=8),                  # headphone stand pole
    )

    # -- mid: plant + pot (left) and the shelf column (right)
    # Left of the framed print the wall is as black as the leaves, so a plain hull is
    # safe there. Only the one leaf that crosses the frame is traced by hand, and the
    # leaves below the frame (brighter wall behind them) get a luminance cut.
    plant_hull = poly([(0, 232), (26, 236), (62, 260), (100, 298), (100, 578), (0, 578)])
    leaf_over_frame = poly([(98, 358), (140, 344), (180, 350), (186, 358), (160, 372),
                            (130, 386), (98, 396)], feather=1.0)
    lower_hull = poly([(98, 394), (150, 400), (215, 420), (215, 450), (205, 480),
                       (200, 520), (160, 560), (98, 578)])
    lower_leaves = lower_hull * smoothstep(L, 16, 7)
    leaves = union(plant_hull, leaf_over_frame, blur(lower_leaves, 0.8))
    pot = rect(0, 568, 150, 706) * smoothstep(L, 30, 12)
    pot = np.maximum(pot, rect(0, 590, 125, 700, feather=2))
    shelf = rect(1228, 0, W, 800, feather=2)
    shelf_edge = np.clip((np.arange(W, dtype=np.float32)[None, :] - 1210) / 60, 0, 1)
    shelf = shelf * np.repeat(shelf_edge, H, axis=0)
    mid = union(blur(leaves, 0.6), blur(pot, 1.0), shelf)

    # -- desk: block (surface, legs, under-desk), monitor + glow, chair, lamp, cans, phone
    desk_block = poly([(135, 676), (1240, 676), (1240, 802), (0, 802), (0, 706), (135, 706)], feather=2.5)
    monitor_loose = rect(586, 468, 946, 668)
    monitor = np.maximum(monitor_loose * smoothstep(L, 30, 14), rect(600, 484, 930, 650))
    monitor = blur(monitor, 0.8)
    stand = rect(742, 648, 792, 684, feather=2)
    glow = union(rect(556, 420, 974, 500, feather=24),           # backlight halo on the wall
                 rect(584, 456, 946, 488, feather=3))            # bright strip along the bezel
    chair_loose = poly([(648, 540), (720, 532), (810, 528), (905, 538), (966, 566), (972, 650),
                        (962, 740), (975, 800), (975, 830), (645, 830), (645, 800), (665, 730),
                        (652, 650)])
    chair_tight = poly([(696, 566), (805, 552), (905, 566), (940, 604), (944, 700), (930, 748),
                        (700, 748), (672, 700), (674, 604)])
    chair = np.maximum(chair_loose * smoothstep(L, 30, 15), chair_tight)
    chair = blur(chair, 0.8)
    lamp_loose = rect(458, 546, 544, 700)
    lamp_tight = union(rect(494, 556, 522, 600), rect(503, 596, 513, 678), rect(474, 676, 532, 694))
    lamp = blur(np.maximum(lamp_loose * smoothstep(L, 32, 16), lamp_tight), 0.7)
    can_l = rect(270, 611, 354, 700, feather=1.2, radius=10)
    can_r = rect(1002, 639, 1058, 702, feather=1.2, radius=6)
    phone = rect(1076, 696, 1146, 718, feather=1.5, radius=4)
    desk = union(desk_block, monitor, stand, glow, chair, lamp, can_l, can_r, phone)

    # -- neon band (light is extracted later; this is just where the wall must be inpainted)
    neon_band = band_y(536, 704, 26) * np.repeat(
        smoothstep(np.arange(W, dtype=np.float32)[None, :], 90, 130)
        * (1 - smoothstep(np.arange(W, dtype=np.float32)[None, :], 1230, 1270)), H, axis=0)
    neon_hole = neon_band * smoothstep(pink, 8, 22)
    neon_hole = np.maximum(neon_hole, neon_band * smoothstep(L, 40, 70))
    neon_hole = dilate(neon_hole, 6)
    neon_hole = blur(neon_hole, 3)

    # -- baked UI on the wall: storyboard label, nav, wordmark + its halo
    ui = union(
        rect(16, 14, 150, 76, feather=8),
        rect(496, 54, 1056, 108, feather=10),
        rect(312, 284, 1228, 458, feather=18),
    )

    return {"fg": fg, "mid": mid, "desk": desk, "neon_band": neon_band, "neon_hole": neon_hole, "ui": ui}


# ------------------------------------------------------------------ main
def solid(mask: np.ndarray, grow: int = 4) -> np.ndarray:
    """Anything a plate touches at all becomes a full hole on the plate behind it."""
    return blur(dilate(smoothstep(mask, 0.02, 0.12), grow), 2)


def main(master_path: Path, check_path: Path | None = None) -> None:
    raw = load_master(master_path)
    m = build_masks(raw)
    OUT.mkdir(parents=True, exist_ok=True)

    # Strip the baked wordmark / nav / label first so no plate carries UI pixels.
    img = inpaint(raw, m["ui"], grain=3.0, seed=11)

    # Wall: inpaint everything that lives on another plate.
    wall_hole = union(solid(m["fg"]), solid(m["mid"]), solid(m["desk"]), solid(m["neon_hole"], 2))
    wall = inpaint(img, wall_hole, grain=3.0, seed=1)
    Image.fromarray(wall.astype(np.uint8)).save(OUT / "wall.jpg", quality=92, subsampling=0)

    # Neon: light only (master minus the inpainted wall), not on any nearer plate.
    occluders = dilate(union(m["desk"], m["mid"], m["fg"]), 2)
    light = np.clip(img - wall, 0, 255) * (m["neon_band"] * (1 - occluders))[..., None]
    light = blur_rgb(light, 1.2)
    neon_alpha = blur(smoothstep(light.max(axis=-1), 3.0, 14.0), 2.0)
    save_rgba(light, neon_alpha, OUT / "neon.png")

    # Desk: anything the fg covers is filled so the lip can slide away cleanly.
    desk_rgb = inpaint(img, solid(m["fg"], 2), grain=2.0, seed=2)
    save_rgba(desk_rgb, m["desk"], OUT / "desk.png")

    # Mid: same treatment (headphones + lip overlap the shelf and pot).
    mid_rgb = inpaint(img, solid(m["fg"], 2), grain=2.0, seed=3)
    save_rgba(mid_rgb, m["mid"], OUT / "mid.png")

    # Foreground is the nearest plate; nothing covers it.
    save_rgba(img, m["fg"], OUT / "fg.png")

    if check_path:
        # Registered stack should reproduce the master minus the baked UI.
        comp = wall.copy()
        comp = 255 - (255 - comp) * (255 - light * neon_alpha[..., None]) / 255  # screen
        for rgb, a in ((desk_rgb, m["desk"]), (mid_rgb, m["mid"]), (img, m["fg"])):
            comp = comp * (1 - a[..., None]) + rgb * a[..., None]
        Image.fromarray(np.clip(comp, 0, 255).astype(np.uint8)).save(check_path, quality=88)

    for name in ("wall.jpg", "neon.png", "desk.png", "mid.png", "fg.png"):
        print(f"{name:10s} {(OUT / name).stat().st_size / 1024:8.0f} KB")


def blur_rgb(rgb: np.ndarray, radius: float) -> np.ndarray:
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(im).astype(np.float32)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    src = Path(args[0]) if args else ROOT / "assets" / "moodboard" / "N2b-LOCKED.png"
    if not src.exists():
        sys.exit(f"master not found: {src}")
    check = Path("/tmp/plates-registered-check.jpg") if "--check" in sys.argv else None
    main(src, check)
