# IHDIOT

Lifestyle hub scroll — reviews + gaming lifestyle.

The hero wordmark is **IHDIOT** only. Never `.gg` in that type.

## Run locally

From the repo root:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

A static server matters so `/coach/` resolves. Opening `index.html` as a file will break that route.

```bash
npx --yes serve -l 4173
```

also works if you prefer Node.

## Deploy

GitHub Pages and the ihdiot.gg domain stay **off** until Brett says go. The site is static and ready for a later root (or `/docs`) Pages publish. Do not enable Pages in this pass.

## Destinations

- Talky → https://ihdiot.github.io/talky-releases/
- YouTube → https://www.youtube.com/@ihdiot
- Discord → `#discord` placeholder (invite not in the repo)
- Coach → `/coach/` stub

## Reference

Storyboard frames live in `assets/moodboard/` (`s1-hero`, `s2-mid`, `s3-sticky`, `s4-doors`).
