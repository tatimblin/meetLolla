# meet Lolla

A 2017 school project: a shuffle player for the Lollapalooza 2017 lineup (Grant Park, Chicago,
August 3-6, 2017). Tap the red arrow to hear a 30-second preview of a random artist; the hands
along the bottom are the audio visualizer. Built June 2017, originally a Jekyll site at
meetlolla.com; now packaged as an embeddable ES module.

## Embed

```js
const assetBase = "https://tatimblin.github.io/meetLolla/";
const { mount } = await import(`${assetBase}dist/index.js`);
const handle = mount(el, { assetBase });   // el: a full-size box; meet Lolla fills and scrolls inside it
// later
handle.destroy();                          // idempotent; removes DOM, listeners, audio, AudioContext
```

- `assetBase` is the repo root as published, ending in `/`. Media is loaded from it as-is:
  `src/audio/<slug>.mp3`, `src/img/...`, `assets/fonts/...`. Nothing is hard-coded to a host.
- All DOM and CSS live under one `.meet-lolla` root inside `el` (the `<style>` is inside the root
  and goes away on `destroy()`). Keyframes and ids are `ml-` prefixed; nothing is fixed to the
  viewport, so it survives client-side navigations that mount/destroy repeatedly.
- Nothing loads or plays until the first tap (`preload="none"`; the AudioContext is created on
  that tap). Honours `prefers-reduced-motion`.

## Develop

```sh
bun install
bun run dev      # http://localhost:4471/ - index.html mounts it full-viewport; rebuilds per request
bun test         # every artist's audio file exists, no duplicates, valid dates/links
bun run build    # dist/index.js: one minified ESM file with the CSS and SVGs inlined
```

Source: `src/js/index.js` (mount), `src/js/artists.js` (lineup data), `src/css/meet-lolla.css`,
`src/svg/*.svg` (svgo runs at build time). The build is reproducible: same sources and
`bun.lock`, same bytes.

## Release

GitHub Pages publishes the repo as tagged (`.github/workflows/pages.yml`, on every `v*` tag):
`index.html` (a standalone full-page copy), `dist/`, `src/` and `assets/` at
https://tatimblin.github.io/meetLolla/. `dist/index.js` is committed so the tag carries it.
(jsDelivr is not an option: the repo is over its 50 MB package limit and it intermittently 403s.)

1. Bump `version` in `package.json`.
2. `bun run build` and commit `dist/` with the bump.
3. `git tag -a vX.Y.Z -m "vX.Y.Z"` and `git push origin vX.Y.Z` (deploys Pages).
4. `gh release create vX.Y.Z --generate-notes`.

Never move or re-use a tag; fix forward with a new version. To redeploy an older tag, run the
workflow by hand with its `ref`.

## Fonts

The 2017 site used Adobe Fonts (Prater Serif, Ubuntu Condensed) through a domain-locked Typekit
kit. The embed self-hosts free stand-ins from Google Fonts, latin subset, in `assets/fonts/`:

- **Patua One** (LatinoType, SIL Open Font License 1.1, `assets/fonts/PatuaOne-OFL.txt`) for
  Prater Serif.
- **Ubuntu Condensed** (Dalton Maag, Ubuntu Font Licence 1.0, `assets/fonts/UbuntuCondensed-UFL.txt`).

The song previews in `src/audio/` belong to their artists and labels and are included for this
educational project only.
