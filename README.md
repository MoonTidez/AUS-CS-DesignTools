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

## Maintaining this

There are two builds of the same tool:

| File | For | Fonts |
|---|---|---|
| `index.html` | the published site | loaded from `fonts/` |
| `portable.html` | offline use, downloaded and opened from disk | built into the file |

`portable.html` is deliberately not published — `_config.yml` excludes it, and the
file itself refuses to run if it is ever served over the web. This keeps one
canonical link for everyone.

If you change the tool, change both. They are the same file apart from the two
`@font-face` rules at the top and a short guard script.

**Brand values** — colours, spacing, fonts — live in the `:root` block at the top of
the `<style>` section. Nothing below it hard-codes a colour. Rebranding means editing
that one block.

**Raster behaviour** — cell sizes, stroke widths, and the thresholds that decide when
a glyph fades out — lives in the constants block at the top of the `<script>` section.
Each constant has a comment explaining what it controls.

Two limits exist to keep the browser responsive: source images are capped at 4000 px
on the long edge, and the raster grid at 400 units on the short side. The tool tells
you when it applies the second one.

### Updating the published tool

Upload a new `index.html` over the old one. GitHub Pages picks it up within a minute.
Remember to upload the matching `portable.html` too.
The header carries a build number so you can confirm which version you are looking at
before reporting a problem.

### Adding another tool later

Move `index.html` into a folder named for the tool, and add a new root `index.html`
listing both. Note that this changes the URL of the existing tool, so send the new
link to anyone still using it.

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
