# Scroll room — layer and transition notes

The hub is one sticky viewport over a long track (~440vh). Scroll progress `0 → 1` crossfades four photographic plates and moves five depth layers at different speeds.

## Layers (front to back)

1. **Foreground** — blurred desk lip + headphone cans. Travels the farthest (`translateY` up to ~120px, slight scale-up) so the room feels entered.
2. **Typography** — floating IHDIOT, ghost nav, subtitle, racing tick, late soft-pill. Interpolated on its own path; not painted into the plates.
3. **Desk / chair** — same plates as the wall, masked to the lower scene so the workstation shears ahead of the plaster.
4. **Neon** — extra pink rope SVG, `mix-blend-mode: screen`, slow horizontal drift plus a stronger vertical shift than the wall.
5. **Back wall** — full plates, slowest rise and the smallest scale.

Film grain and a soft vignette sit above everything. They do not parallax.

## Frame map

| Progress | Frame | What happens |
| --- | --- | --- |
| 0.00–0.18 | **S1** | Hero: wide-tracked glowing IHDIOT, top ghost nav (Talky / YouTube / Discord / Coach). Monitor dark. |
| 0.14–0.40 | **S2** | Subtitle `REVIEWS + GAMING LIFESTYLE` fades in. Tiny `RACING` tick under a hairline. Type stays centered (sticky mid). |
| 0.42–0.66 | **S3** | Wordmark docks top-left and scales down. Ghost nav holds the top rail. S3 plate brings the lit monitor. Subtitle / racing leave. |
| 0.70–1.00 | **S4** | Type recenters smaller. Ghost nav yields to one dark soft-pill (`Talky — YouTube — Discord — Coach`, serif). Labels lift one-at-a-time. |

Reduced motion skips the track and sits on the S4 rest pose.

## Doors

Talky and YouTube open in new tabs. Coach opens `/coach/`. Discord is a same-page `#discord` note until an invite exists.
