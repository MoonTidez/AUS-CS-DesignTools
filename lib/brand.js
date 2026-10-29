/* ============================================================================
   lib/brand.js — shared code for Career Services tools.
   Classic script (not a module) so it also loads when a page is opened from
   disk. Everything hangs off one global, window.CS.

   Sections: palette · colour · controls · colour select · export · licences
   Pure sections (palette, colour, png plan) touch no DOM.
   Load lib/licences.js before this file if the tool shows the Licences panel.
   ========================================================================= */
(function (CS) {

/* ============================================================================
   palette — pure. Deck order: Career Services first, then AUS.
   ========================================================================= */
CS.CORE = [
  { name:'Anchor Blue',     hex:'#307FE2' },
  { name:'Link Pink',       hex:'#EB6FBD' },
  { name:'Open Mint',       hex:'#47D7AC' },
  { name:'Signal Yellow',   hex:'#E3E935' },
  { name:'Bright Orange',   hex:'#EE5340' },
  { name:'Framework Gray',  hex:'#B2B4B2' },
  { name:'Light Concrete',  hex:'#D9D9D6' },
  { name:'Core Black',      hex:'#1E2021' },
  { name:'White',           hex:'#FFFFFF' }
];
CS.AUS = [
  { name:'AUS Corporate Red', hex:'#983222' },
  { name:'CAAD Accent',       hex:'#9DABE2' },
  { name:'CAS Accent',        hex:'#988642' },
  { name:'CEN Accent',        hex:'#DF7A00' },
  { name:'SBA Accent',        hex:'#8BA69C' },
  { name:'AUS Gray',          hex:'#4D4F53' },
  { name:'AUS Black',         hex:'#000000' }
];
CS.NO_FILL = [{ name:'Transparent', hex:null }];
CS.ALL_COLOURS = CS.CORE.concat(CS.AUS);

/* Custom hex colours, added by the user from any colour select. Remembered per
   browser (shared by every tool on this site) as a convenience only. */
const CUSTOM_KEY = 'cs.customColours';
CS.CUSTOM = [];

const customListeners = new Set();
function saveCustom() {
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(CS.CUSTOM.map(c => c.hex))); } catch (e) {}
  customListeners.forEach(fn => fn());
}
CS.onCustomChange = fn => { customListeners.add(fn); return () => customListeners.delete(fn); };

/* Pure. '#abc', 'abc', '#AABBCC' → '#AABBCC'; anything else → null. */
CS.normaliseHex = s => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, ch => ch + ch) : m[1];
  return '#' + h.toUpperCase();
};

try {
  const saved = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  if (Array.isArray(saved)) saved.forEach(h => {
    const hex = CS.normaliseHex(String(h));
    if (hex && !CS.ALL_COLOURS.some(c => c.hex === hex) && !CS.CUSTOM.some(c => c.hex === hex))
      CS.CUSTOM.push({ name: hex, hex });
  });
} catch (e) { /* storage blocked: start empty */ }
/* Every pickable foreground: palette first, then custom. */
CS.allColours = () => CS.ALL_COLOURS.concat(CS.CUSTOM);
CS.colourByHex = hex => CS.allColours().find(c => c.hex === hex);

/* Returns the colour entry, reusing the palette entry if the hex matches one. */
CS.addCustomColour = input => {
  const hex = CS.normaliseHex(input);
  if (!hex) return null;
  const known = CS.colourByHex(hex);
  if (known) return known;
  const c = { name: hex, hex };
  CS.CUSTOM.push(c);
  saveCustom();
  return c;
};
CS.removeCustomColour = hex => {
  const i = CS.CUSTOM.findIndex(c => c.hex === hex);
  if (i < 0) return;
  CS.CUSTOM.splice(i, 1);
  saveCustom();
};

/* Foregrounds never offer transparent; backgrounds get it in its own group. */
CS.paletteGroups = kind => {
  const g = [['Career Services', CS.CORE], ['AUS', CS.AUS]];
  if (CS.CUSTOM.length) g.push(['Custom', CS.CUSTOM]);
  if (kind === 'bg') g.push(['No fill', CS.NO_FILL]);
  return g;
};

/* ============================================================================
   colour — pure
   ========================================================================= */
CS.CONTRAST_MIN = 0.18;

const SRGB_TO_LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  SRGB_TO_LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
CS.SRGB_TO_LIN = SRGB_TO_LIN;
CS.linToSrgb = v => v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;

/* Rec. 709 luminance on linearised sRGB. */
CS.relLum = hex => {
  const n = parseInt(hex.slice(1), 16);
  const f = i => SRGB_TO_LIN[(n >> i) & 255];
  return 0.2126 * f(16) + 0.7152 * f(8) + 0.0722 * f(0);
};
/* Value distance in linear light — enough to tell "will this vanish?". */
CS.paletteContrast = (inkHex, paperHex) => {
  if (!paperHex) return 1;                     // transparent: always legible
  return Math.abs(CS.relLum(inkHex) - CS.relLum(paperHex));
};

/* ============================================================================
   controls — slider fill, segmented, toggle
   ========================================================================= */
CS.$ = id => document.getElementById(id);

CS.fillTrack = input => {
  const min = +input.min, max = +input.max, v = +input.value;
  const pct = max === min ? 0 : (v - min) / (max - min) * 100;
  input.parentElement.style.setProperty('--fill', pct + '%');
};
/* Wire every .slider under root (default: the page) to keep its fill in step. */
CS.initSliders = (root = document) => {
  root.querySelectorAll('.slider input[type=range]').forEach(i => {
    if (i.dataset.csFill) { CS.fillTrack(i); return; }
    i.dataset.csFill = '1';
    CS.fillTrack(i);
    i.addEventListener('input', () => CS.fillTrack(i));
  });
};

CS.segment = (id, onPick) => {
  const el = CS.$(id);
  el.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    [...el.children].forEach(c => c.setAttribute('aria-pressed', String(c === b)));
    onPick(b.dataset.v);
  };
};

CS.toggle = (id, onChange) => {
  CS.$(id).onclick = e => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(on));
    onChange(on);
  };
};

/* ============================================================================
   colour select — custom listbox with swatches, expands in flow
   opts: { groups (array, or function returning one), labelId,
           onPick(name, hex), isDisabled?(hex), allowCustom? (default true) }
   With allowCustom, a hex field at the foot of the list adds custom colours.
   ========================================================================= */
CS.swatchEl = hex => {
  const sw = document.createElement('span');
  sw.className = 'sw' + (hex === null ? ' transparent' : '');
  if (hex !== null) sw.style.background = hex;
  return sw;
};

CS.colourSelect = (root, opts) => {
  root.innerHTML = '';
  const groupsNow = () => typeof opts.groups === 'function' ? opts.groups() : opts.groups;
  const allowCustom = opts.allowCustom !== false;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (opts.labelId) trigger.setAttribute('aria-labelledby', opts.labelId);
  const tSw = CS.swatchEl('#000');
  const tVal = document.createElement('span');
  tVal.className = 'select-value';
  const caret = document.createElement('span');
  caret.className = 'select-caret';
  caret.textContent = '▼';
  trigger.append(tSw, tVal, caret);

  const list = document.createElement('div');
  list.className = 'select-list';
  list.hidden = true;
  const body = document.createElement('div');
  body.setAttribute('role', 'listbox');
  list.appendChild(body);

  let options = [];
  let selectedHex;
  function renderOptions() {
    body.innerHTML = '';
    options = [];
    groupsNow().forEach(([groupName, colours]) => {
      const g = document.createElement('div');
      g.className = 'select-group';
      g.textContent = groupName;
      body.appendChild(g);
      const removable = allowCustom && colours === CS.CUSTOM;
      colours.forEach(c => {
        const o = document.createElement('button');
        o.type = 'button';
        o.className = 'select-option';
        o.setAttribute('role', 'option');
        o.dataset.hex = c.hex === null ? '' : c.hex;
        o.dataset.name = c.name;
        const label = document.createElement('span');
        label.textContent = c.name;
        o.append(CS.swatchEl(c.hex), label);
        o.onclick = () => {
          if (o.disabled) return;
          opts.onPick(c.name, c.hex); close(); trigger.focus();
        };
        options.push(o);
        if (!removable) { body.appendChild(o); return; }
        const row = document.createElement('div');
        row.className = 'select-custom';
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'select-remove';
        rm.textContent = '✕';
        rm.setAttribute('aria-label', `Remove ${c.name}`);
        rm.onclick = () => CS.removeCustomColour(c.hex);
        row.append(o, rm);
        body.appendChild(row);
      });
    });
    markSelected();
  }

  /* --- custom hex field --- */
  const hexInput = document.createElement('input');
  const hexSw = CS.swatchEl(null);
  const hexErr = document.createElement('div');
  if (allowCustom) {
    const add = document.createElement('div');
    add.className = 'select-add';
    hexInput.type = 'text';
    hexInput.className = 'select-hex';
    hexInput.placeholder = '#RRGGBB';
    hexInput.maxLength = 7;
    hexInput.spellcheck = false;
    hexInput.autocomplete = 'off';
    hexInput.setAttribute('aria-label', 'Custom hex colour');
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'select-addbtn';
    addBtn.textContent = 'Add';
    hexErr.className = 'select-hexerr';
    hexErr.hidden = true;
    add.append(hexSw, hexInput, addBtn, hexErr);
    list.appendChild(add);

    hexInput.oninput = () => {
      const hex = CS.normaliseHex(hexInput.value);
      hexSw.className = 'sw' + (hex ? '' : ' transparent');
      hexSw.style.background = hex || '';
      hexInput.removeAttribute('aria-invalid');
      hexErr.hidden = true;
    };
    addBtn.onclick = () => addCustom();
  }
  function addCustom() {
    const c = CS.addCustomColour(hexInput.value);
    if (!c) {
      hexInput.setAttribute('aria-invalid', 'true');
      hexErr.hidden = false;
      hexErr.textContent = 'Use a hex code like #307FE2 or #3AF.';
      hexInput.focus();
      return;
    }
    if (opts.isDisabled && c.hex !== selectedHex && opts.isDisabled(c.hex)) {
      hexErr.hidden = false;
      hexErr.textContent = `${c.name} is already in use.`;
      return;
    }
    hexInput.value = '';
    hexInput.oninput();
    opts.onPick(c.name, c.hex); close(); trigger.focus();
  }

  root.append(trigger, list);
  renderOptions();
  const offCustom = CS.onCustomChange(renderOptions);

  const usable = () => options.filter(o => !o.disabled);
  let cursor = null;
  function open() {
    refresh();
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    cursor = options.find(o => o.getAttribute('aria-selected') === 'true') || usable()[0];
    highlight();
  }
  function close() {
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    options.forEach(o => o.classList.remove('active'));
    hexErr.hidden = true;
  }
  function highlight() {
    options.forEach(o => o.classList.toggle('active', o === cursor));
    if (cursor) cursor.scrollIntoView({ block: 'nearest' });
  }
  function move(step) {
    const u = usable(); if (!u.length) return;
    const i = u.indexOf(cursor);
    cursor = u[(i + step + u.length) % u.length];
    highlight();
  }
  function refresh() {
    if (!opts.isDisabled) return;
    options.forEach(o => {
      const selected = o.getAttribute('aria-selected') === 'true';
      o.disabled = !selected && opts.isDisabled(o.dataset.hex || null);
    });
  }
  function markSelected() {
    options.forEach(o => o.setAttribute('aria-selected', String((o.dataset.hex || null) === selectedHex)));
    refresh();
  }

  trigger.onclick = () => list.hidden ? open() : close();
  trigger.onkeydown = e => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      if (list.hidden) { e.preventDefault(); open(); }
    }
  };
  root.addEventListener('keydown', e => {
    if (list.hidden) return;
    if (e.target === hexInput) {          // let the field take its own typing
      if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus(); }
      return;
    }
    const u = usable();
    if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); cursor = u[0]; highlight(); }
    else if (e.key === 'End') { e.preventDefault(); cursor = u[u.length - 1]; highlight(); }
    else if (e.key === 'Enter' || e.key === ' ') {
      if (e.target.classList.contains('select-remove')) return;
      e.preventDefault(); if (cursor) cursor.click();
    }
  });
  // A removed custom option is detached before this runs; that's not "outside".
  const outside = e => { if (e.target.isConnected && !root.contains(e.target)) close(); };
  document.addEventListener('click', outside);

  return {
    sync(hex, name) {
      selectedHex = hex;
      tVal.textContent = name;
      tSw.className = 'sw' + (hex === null ? ' transparent' : '');
      tSw.style.background = hex === null ? '' : hex;
      markSelected();
    },
    destroy() { offCustom(); document.removeEventListener('click', outside); root.innerHTML = ''; }
  };
};

/* ============================================================================
   export — file download and PNG sizing
   ========================================================================= */
CS.download = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
CS.downloadSVG = (svg, filename) =>
  CS.download(new Blob([svg], { type: 'image/svg+xml' }), filename);
CS.downloadCanvas = (canvas, filename) =>
  canvas.toBlob(b => CS.download(b, filename), 'image/png');

CS.PNG_MAX_PX  = 8192;
CS.PNG_DPI     = { screen: 150, print: 300 };
CS.PNG_SOFT_PX = 1.5;              // thinnest feature below this reads soft

/* Pure. Artwork size in mm + intent → pixel size and scale (px per mm).
   featureMM is the thinnest ink feature; pass 0 to skip the softness check. */
CS.pngPlan = (wmm, hmm, intent, featureMM = 0) => {
  let scale = intent === 'max'
    ? CS.PNG_MAX_PX / Math.max(wmm, hmm)
    : CS.PNG_DPI[intent] / 25.4;
  let w = Math.round(wmm * scale), h = Math.round(hmm * scale);
  let clamped = false;
  if (Math.max(w, h) > CS.PNG_MAX_PX) {
    const f = CS.PNG_MAX_PX / Math.max(w, h);
    w = Math.max(1, Math.round(w * f)); h = Math.max(1, Math.round(h * f));
    scale = w / wmm; clamped = true;
  }
  w = Math.max(1, w); h = Math.max(1, h);
  const featurePx = featureMM * scale;
  return { w, h, scale, wmm, hmm, dpi: scale * 25.4, featurePx, clamped,
           soft: featureMM > 0 && featurePx < CS.PNG_SOFT_PX };
};

/* ============================================================================
   licences — injects the fixed Licences button and its tabbed panel.
   ========================================================================= */
CS.initLicences = tool => {
  const LICENCES = CS.licenceTexts(tool);
  const wrap = document.createElement('div');
  wrap.innerHTML =
    '<button class="lic-link" id="licOpen">Licences</button>' +
    '<div class="lic-overlay" id="licOverlay" hidden role="dialog" aria-modal="true" aria-labelledby="licTitle">' +
      '<div class="lic-panel">' +
        '<div class="lic-head"><span id="licTitle">Licences</span><span class="spacer"></span>' +
          '<button class="lic-close" id="licClose" aria-label="Close">&#10005;</button></div>' +
        '<div class="lic-tabs" id="licTabs" role="tablist"></div>' +
        '<div class="lic-body" id="licBody" tabindex="0"></div>' +
      '</div>' +
    '</div>';
  document.body.append(...wrap.children);

  const $ = CS.$;
  const tabs = $('licTabs'), body = $('licBody'), overlay = $('licOverlay');
  const names = Object.keys(LICENCES);
  let active = names[0], lastFocus = null;

  names.forEach(n => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = n; b.setAttribute('role','tab');
    b.onclick = () => show(n);
    tabs.appendChild(b);
  });
  function show(n) {
    active = n;
    [...tabs.children].forEach(c => c.setAttribute('aria-selected', String(c.textContent === n)));
    body.textContent = LICENCES[n];
    body.scrollTop = 0;
  }
  function open() {
    // Fall back to the trigger: a programmatic click leaves focus on <body>.
    const a = document.activeElement;
    lastFocus = (a && a !== document.body) ? a : $('licOpen');
    overlay.hidden = false;
    show(active);
    $('licClose').focus();
  }
  function close() {
    overlay.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  $('licOpen').onclick = open;
  $('licClose').onclick = close;
  overlay.onclick = e => { if (e.target === overlay) close(); };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });
  show(active);
};

/* ============================================================================
   tools — one list drives the home page and the masthead switcher.
   ========================================================================= */
CS.TOOLS = [
  { href:'raster.html',        name:'Grid Raster',   kind:'Image',
    blurb:'Turn a still image into the Node or Grid raster pattern.' },
  { href:'video.html',         name:'Video Raster',  kind:'Video', note:'Test build',
    blurb:'Run the same raster over a video clip and export an MP4.' },
  { href:'pie-generator.html', name:'Pie Generator', kind:'Diagram',
    blurb:'Build segmented radial diagrams from rings, slices and brand colours.' }
];

/* Masthead: "Career Services" links home, and a row of tool tabs sits before
   the build stamp. current is this page's href ('' on the home page). */
CS.toolNav = current => {
  const head = document.querySelector('.masthead');
  if (!head) return;
  const first = head.firstElementChild;
  if (first && first.tagName === 'SPAN') {
    const home = document.createElement('a');
    home.href = './'; home.className = 'home'; home.textContent = first.textContent;
    first.replaceWith(home);
  }
  const nav = document.createElement('nav');
  nav.className = 'toolnav';
  nav.setAttribute('aria-label', 'Tools');
  CS.TOOLS.forEach(t => {
    const a = document.createElement('a');
    a.href = t.href; a.textContent = t.name;
    if (t.href === current) a.setAttribute('aria-current', 'page');
    nav.appendChild(a);
  });
  head.insertBefore(nav, CS.$('buildStamp'));
};

/* Opened from disk? Chrome blocks @font-face over file:// (opaque origin), so
   the brand fonts would silently fall back. Say so, with a tool-specific hint. */
CS.fileProtocolNotice = hint => {
  if (location.protocol !== 'file:') return;
  const n = document.createElement('div');
  n.className = 'notice';
  n.style.cssText = 'position:fixed;left:var(--space-4);bottom:var(--space-3);z-index:20;max-width:min(44ch,calc(100vw - 190px))';
  n.textContent = 'Opened from disk — the brand fonts may not load in this browser. ' + hint;
  document.body.appendChild(n);
};

})(window.CS = window.CS || {});
