# Grid Raster

An internal tool for the Department of Career Services. It converts an image
into the brand's raster pattern and exports it as vector (SVG) or bitmap (PNG).

Everything runs inside your browser. Images are never uploaded anywhere.

## Using it

Open `index.html` — either the published link, or by double-clicking the file
on your computer. There is nothing to install.

1. Drop, paste, or browse for an image.
2. Pick a raster: **Node** (the plus glyph) or **Grid** (squares).
3. Adjust scale and tone until it reads well.
4. Choose colours from the brand palettes.
5. Export SVG for print and layout, PNG for screen.

### Which export

**SVG** is the real deliverable. It opens at true physical size in Illustrator,
InDesign, Figma, and Inkscape, and stays sharp at any scale.

**PNG** is for screens and quick shares. Node rasters use a 0.25pt hairline, and
at large grid sizes that hairline falls below one pixel — the tool warns you when
it does. If the warning appears and you need it crisp, use the SVG.

## Publishing to GitHub Pages

Only needed once.

1. Create a repository on github.com.
2. Upload `index.html` to it (drag and drop works — no command line needed).
3. Repository **Settings** → **Pages** → set Source to `main` branch, `/root`.
4. Wait a minute. Your link appears at the top of that Pages settings screen.

To update the tool later, upload a new `index.html` over the old one.

Note: a GitHub Pages site is public to anyone with the link. The tool contains
no student data, but the brand fonts are embedded and will be downloadable.
Uncut Sans and Geist Mono are both freely licensed, so this is not a problem.

## Changing things

Brand values live in one place: the `:root` block at the top of the `<style>`
section. Colours, spacing, and fonts are all there. Nothing further down the file
hard-codes a colour.

Raster behaviour is controlled by the constants block near the top of the
`<script>` section — cell sizes, stroke widths, and the thresholds that decide
when a glyph fades out. Each has a comment explaining what it does.

## Notes

- Source images are capped at 4000px on the long edge, and the raster grid at
  400 units on the short side. Both limits exist so the browser stays responsive.
- Fonts are embedded in the file itself, so it works offline and cannot break
  from a missing font path.
- The tool works best on images prepared as described in the brand deck under
  "Preparing source images" — high-contrast, background removed.
