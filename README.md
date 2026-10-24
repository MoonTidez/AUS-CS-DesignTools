# AUS-CS-DesignTools

Design tools for the Department of Career Services, American University of Sharjah.

Everything here runs in the browser. Nothing to install, nothing uploaded, no accounts.

**[Open Grid Raster →](https://YOUR-USERNAME.github.io/AUS-CS-DesignTools/)**

Working somewhere without internet? Download `portable.html` from this repository
and open it from your computer — it is the same tool with the fonts built in.

---

## Grid Raster

Converts an image into the Career Services raster pattern and exports it as vector
or bitmap. Images are processed locally in your browser and never leave your machine.

### Using it

1. Drop, paste, or browse for an image.
2. Choose a raster — **Node** (the plus glyph) or **Grid** (squares).
3. Set the scale, then adjust brightness, contrast, and gamma until the tones read well.
4. Pick colours from the core brand or AUS palettes.
5. Export.

### Which export to use

**SVG** is the deliverable for anything printed or placed in a layout. It opens at
true physical size in Illustrator, InDesign, Figma, and Inkscape, and stays sharp at
any scale.

**PNG** is for screens, slides, and quick shares. Node rasters are drawn with a
0.25 pt hairline; on large grids that hairline falls below a single pixel and the
image softens. The tool tells you when this happens — if you see that warning and
need it crisp, export the SVG instead.

### Getting good results

The raster is driven entirely by brightness, so what you feed it matters more than
any setting. High-contrast images with the background removed work best — see
"Preparing source images" in the brand deck for the two prompts that prepare a photo
for either mode.

Gamma is the control that matters most. It redistributes the midtones without
clipping the shadows or highlights, which is where halftone-style output usually
lives or dies. Reach for it before brightness or contrast.

---

## Pie Generator

`pie-generator.html` builds segmented radial diagrams — rings of pie slices,
some filled with brand colours and the rest left empty — and exports them as
SVG or PNG.

### Using it

1. **Arc** — set how far round the circle the diagram goes (1–360°, with 90/180/270/360
   presets) and rotate where it starts. 0° is twelve o'clock; slices run clockwise.
2. **Centre** — turn on the donut hole and set its size as a share of the radius.
3. **Divisions** — choose the number of rings and slices. Pieces = rings × slices.
4. **Colours** — add brand colours and set how many pieces each one fills. Every
   other piece stays empty. A colour can't take more pieces than are free, and if
   you reduce the rings or slices, the counts scale down to fit. Filled pieces are
   scattered at random; **Shuffle** deals a new layout.
5. **Background** — any palette colour or transparent, filling the whole work
   area. It is a preview aid only, like "Outline empty pieces": exports always
   have a transparent background.
6. **Export** — "Trim to arc" crops the artwork to the drawn arc; "Full circle"
   keeps the whole square. SVG is at true size (200 mm across a full circle).

---

## Maintaining this

There are two builds of the same tool:

| File | For | Fonts |
|---|---|---|
| `index.html` | the published site | loaded from `fonts/` |
| `portable.html` | offline use, downloaded and opened from disk | built into the file |

`portable.html` is deliberately not published — `_config.yml` excludes it, and the
file itself refuses to run if it is ever served over the web. This keeps one
canonical link for everyone.

If you change the tool, change both. Since Build 11, `index.html` takes its shared
code from `lib/` (below) while `portable.html` keeps everything inline, so a change
to anything in `lib/` must be copied into `portable.html` by hand.

### Shared library — `lib/`

Code used by more than one tool lives here, so it is written once:

| File | Holds |
|---|---|
| `lib/brand.css` | fonts, `:root` tokens, masthead and panel layout, slider, toggle, segmented control, colour select, buttons, notices, licence viewer, responsive rules |
| `lib/brand.js` | the Career Services and AUS palettes, luminance and contrast check, control wiring, the colour-select listbox, SVG/PNG download and PNG sizing, the Licences panel |
| `lib/licences.js` | the tool licence and both font licences, shown in every tool's Licences panel |

`index.html` and `pie-generator.html` use it. `video.html` and `event-form.html`
still carry their own copies and can move over when next edited.

**Brand values** — colours, spacing, fonts — live in the `:root` block at the top of
`lib/brand.css`, and the palettes at the top of `lib/brand.js`. Rebranding means
editing those two places.

**Raster behaviour** — cell sizes, stroke widths, and the thresholds that decide when
a glyph fades out — lives in the constants block at the top of the `<script>` section.
Each constant has a comment explaining what it controls.

Two limits exist to keep the browser responsive: source images are capped at 4000 px
on the long edge, and the raster grid at 400 units on the short side. The tool tells
you when it applies the second one.

### Updating the published tool

Upload a new `index.html` over the old one, plus the `lib/` folder if it changed.
GitHub Pages picks it up within a minute.
Remember to upload the matching `portable.html` too.
The header carries a build number so you can confirm which version you are looking at
before reporting a problem.

### Adding another tool later

Add one HTML file at the repository root, link `lib/brand.css`, `lib/licences.js`
and `lib/brand.js`, and list it in this README. Existing links don't change — the
Pie Generator, for example, is served at `…/AUS-CS-DesignTools/pie-generator.html`.

---

## Licence and credits

Copyright © 2026 Ahnaf Abdur Rahman. All rights reserved. The American University
of Sharjah holds a perpetual, irrevocable, royalty-free licence to use and modify
these tools — see [`LICENSE`](LICENSE) for the full terms.

Anything you export from the tools is yours to use without restriction or
attribution.

Two typefaces are embedded under the SIL Open Font License 1.1: Uncut Sans
(© 2022 Kasper Nordkvist) and Geist Mono (© 2023 Vercel, in collaboration with
basement.studio). Full texts are in [`licenses/`](licenses/) and viewable inside
each tool. See [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) for details.
