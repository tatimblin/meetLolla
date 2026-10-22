# Crowd hands

The crowd's hands and arm tiles. `mount()` loads these by URL (`${assetBase}src/svg/poster/hands/…`)
as CSS backgrounds; they are not bundled or run through svgo. Who stands where, how big, and the
wrist measurements for each file are in `src/js/crowd.js`; the CSS is `.ml-hand` in
`src/css/meet-lolla.css` (the element is the arm, its `::before` the hand).

Every hand is a 300x300 viewBox with the wrist on the bottom edge.

- **Human hands** (`hand1`-`hand7`) are `src/img/hand1-7.svg` redrawn at the poster's line weight
  (4.2 units). Their arms are a flat skin colour sampled at the wrist, with the same 4.2-unit
  outline drawn down the sides by CSS. `hand1-band`, `hand3-band` and `hand6-band` are copies with
  a festival wristband (yellow band, white tag, ribbon tails; hand6 has two).
- **Monster hands** are traced from the official 2017 poster art (the Thursday graphic and the
  4-day admat): pixels colour-classified, each colour region traced with potrace, and redrawn by
  hand where another hand covers the monster. Colours are sampled from the poster.

| file | what (source) | arm tile |
|---|---|---|
| hand-monster-claw.svg | green scaly peace sign: black talons, yellow throat between the fingers, fanged mouth, yellow belly (Thursday graphic, left) | `arm-claw.svg` |
| hand-monster-rock.svg | pink furry rock sign: white nails, fur check-marks, black mouth with white teeth, yellow/white wristband with ribbons (Thursday graphic, centre) | `arm-rock.svg` |
| hand-monster-peace.svg | purple furry peace sign: white nails, fur check-marks, toothy mouth, yellow/white wristband (admat, right) | `arm-peace.svg` |
| hand-monster-eye.svg | the admat's other monster, a green scaly rock sign with talons and a fanged mouth (the name is historical) | `arm-claw.svg` |

## Monster wrists and arm tiles

- Every monster wrist is 102 units wide (x 99 to 201, centred) and runs straight off the bottom
  of the frame with no closing stroke, so nothing is clipped and the outline comes from the tile.
- The `arm-*.svg` tiles are 52x52 with `preserveAspectRatio="none"`, drawn with
  `url(arm-*.svg) 0 0 / 100% auto repeat-y` so the arm stretches with its height. They match the
  wrist: the 4.6-unit side outline in the hand is 2.35 units in the tile once stretched to 102
  units; pink and purple continue the fur check-marks, and the green tile continues the yellow
  belly (x 131.7 to 179 in the hand, 16.67 to 40.78 in the tile) between 3.2-unit ink lines.
- The tops of the drawings sit at about y=36 (claw), 19 (rock), 10 (peace) and 36 (eye), so at
  the same size the claw and eye read about 8% shorter.
