// Shared theme logic for SciCrypt website (demo pages + marketing pages).
// Toggles body class `theme-light` and persists to localStorage.
// Also swaps inline color/background/border/etc. to dark, theme-aware
// equivalents in light mode (preserving hue for semantic accents).

(function () {
  // Color-value patterns
  var NAMED = {
    white: [255, 255, 255], whitesmoke: [245, 245, 245], snow: [255, 250, 250],
    ivory: [255, 255, 240], floralwhite: [255, 250, 240], seashell: [255, 245, 238],
    lavenderblush: [255, 240, 245], oldlace: [253, 245, 230], linen: [250, 240, 230],
    lightyellow: [255, 255, 224], lightgoldenrodyellow: [250, 250, 210]
  };
  var HEX3_RE = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
  var HEX6_RE = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
  var RGB_RE = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

  function normalizeHex(c) {
    return '#' + c.r.toString(16).padStart(2, '0') +
                  c.g.toString(16).padStart(2, '0') +
                  c.b.toString(16).padStart(2, '0');
  }

  function parseColor(val) {
    if (!val) return null;
    val = val.trim().toLowerCase();
    if (NAMED[val]) {
      var n = NAMED[val];
      return { r: n[0], g: n[1], b: n[2], a: 1, source: val, raw: val };
    }
    var h3 = val.match(HEX3_RE);
    if (h3) {
      var rgb3 = { r: parseInt(h3[1] + h3[1], 16), g: parseInt(h3[2] + h3[2], 16), b: parseInt(h3[3] + h3[3], 16) };
      return { r: rgb3.r, g: rgb3.g, b: rgb3.b, a: 1, source: normalizeHex(rgb3), raw: val };
    }
    var h6 = val.match(HEX6_RE);
    if (h6) {
      var rgb6 = { r: parseInt(h6[1], 16), g: parseInt(h6[2], 16), b: parseInt(h6[3], 16) };
      return { r: rgb6.r, g: rgb6.g, b: rgb6.b, a: 1, source: normalizeHex(rgb6), raw: val };
    }
    var rgb = val.match(RGB_RE);
    if (rgb) {
      return {
        r: parseInt(rgb[1]), g: parseInt(rgb[2]), b: parseInt(rgb[3]),
        a: rgb[4] !== undefined ? parseFloat(rgb[4]) : 1,
        source: null, raw: val
      };
    }
    return null;
  }

  // Dark-theme accent palette → light-mode equivalents.
  // Keys are normalized 6-digit lowercase hex (e.g. "#93c5fd").
  // Values are the dark, saturated light-mode counterparts used elsewhere
  // in the light-theme CSS (e.g. "#2563eb" for primary blue).
  var COLOR_MAP = {
    '#93c5fd': '#2563eb',  // sky blue → primary blue
    '#34d399': '#059669',  // emerald → green-600
    '#6ee7b7': '#047857',  // emerald-300 → green-700
    '#fbbf24': '#b45309',  // amber → amber-700
    '#fcd34d': '#b45309',  // amber-300 → amber-700
    '#fde68a': '#b45309',  // yellow-200 → amber-700
    '#f87171': '#b91c1c',  // red-400 → red-700
    '#fca5a5': '#b91c1c',  // red-300 → red-700
    '#fecaca': '#b91c1c',  // red-200 → red-700
    '#fb923c': '#c2410c',  // orange-400 → orange-700
    '#a78bfa': '#7c3aed',  // violet-400 → violet-600
    '#c4b5fd': '#7c3aed',  // violet-300 → violet-600
    '#cbd5e1': '#374151',  // slate-300 → gray-700
    '#d1d5db': '#4b5563',  // gray-300 → gray-600
    '#e2e8f0': '#4b5563'   // slate-200 → gray-600
  };

  // Theme-aware remap for a single color value.
  // Returns the new value string, or null if no change is needed.
  function remapColor(val) {
    var c = parseColor(val);
    if (!c) return null;

    // Pure white / near-white → dark body text
    if (c.r >= 240 && c.g >= 240 && c.b >= 240 && c.a > 0) {
      if (c.a < 1) return 'rgba(0,0,0,' + c.a + ')';
      return '#1f2937';
    }

    // Look up in the dark-theme accent map (works for any channel combination).
    var key = c.source || normalizeHex(c);
    var mapped = COLOR_MAP[key];
    if (!mapped) return null;

    // Preserve alpha for rgba inputs.
    if (c.a < 1) {
      var m = mapped.match(HEX6_RE);
      if (m) {
        return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + c.a + ')';
      }
    }
    return mapped;
  }

  // Returns a new declaration value with any remappable color tokens
  // substituted. Returns null if no token in the value is remappable.
  function remapDeclaration(val) {
    if (!val) return null;
    var changed = false;
    var newVal = val.replace(/(#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|[a-z]+)/gi, function (tok) {
      // Skip obvious non-color tokens (lengths, keywords, urls, etc.)
      if (/^(url|inherit|initial|unset|transparent|none|currentcolor)$/i.test(tok)) return tok;
      // Skip named colors that aren't in NAMED (e.g. "solid", "1px")
      if (!/^#/.test(tok) && !/^rgba?\(/i.test(tok) && !NAMED[tok.toLowerCase()]) return tok;
      var replacement = remapColor(tok);
      if (replacement) { changed = true; return replacement; }
      return tok;
    });
    return changed ? newVal : null;
  }

  // Properties whose full value is a single color
  var SIMPLE_PROPS = ['color', 'fill', 'stroke', 'background-color', 'border-color',
                      'border-top-color', 'border-right-color', 'border-bottom-color',
                      'border-left-color', 'outline-color', 'text-decoration-color',
                      '-webkit-text-fill-color', 'caret-color', 'column-rule-color'];

  // Shorthand properties that may contain a color token among other tokens
  var SHORTHAND_PROPS = ['background', 'border', 'border-top', 'border-right',
                         'border-bottom', 'border-left', 'outline', 'text-decoration'];

  function attrNameForProp(prop) {
    return 'data-orig-' + prop.replace(/[^-a-z0-9]/g, '').replace(/^-+/, '').replace(/-/g, '_');
  }

  function swapInlineColors(toLight) {
    document.querySelectorAll('[style]').forEach(function (el) {
      SIMPLE_PROPS.forEach(function (prop) {
        var origAttr = attrNameForProp(prop);
        if (toLight) {
          if (el.hasAttribute(origAttr)) return; // already swapped
          var val = el.style.getPropertyValue(prop);
          if (!val) return;
          var newVal = remapColor(val);
          if (newVal) {
            el.setAttribute(origAttr, val);
            el.style.setProperty(prop, newVal, 'important');
          }
        } else {
          var orig = el.getAttribute(origAttr);
          if (orig !== null) {
            el.style.setProperty(prop, orig);
            el.removeAttribute(origAttr);
          }
        }
      });

      SHORTHAND_PROPS.forEach(function (prop) {
        var origAttr = attrNameForProp(prop);
        if (toLight) {
          if (el.hasAttribute(origAttr)) return;
          var val = el.style.getPropertyValue(prop);
          if (!val) return;
          var newVal = remapDeclaration(val);
          if (newVal) {
            el.setAttribute(origAttr, val);
            el.style.setProperty(prop, newVal, 'important');
          }
        } else {
          var orig = el.getAttribute(origAttr);
          if (orig !== null) {
            el.style.setProperty(prop, orig);
            el.removeAttribute(origAttr);
          }
        }
      });
    });
  }

  function applyTheme(t) {
    t = t || 'dark';
    var toLight = t === 'light';
    document.body.classList.toggle('theme-light', toLight);
    document.documentElement.classList.toggle('theme-light', toLight);
    if (toLight) {
      swapInlineColors(true);
    } else {
      swapInlineColors(false);
    }
  }

  function toggleTheme() {
    var cur = localStorage.getItem('theme') || 'dark';
    var next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
    updateButtons(next);
  }

  function initTheme() {
    var saved = localStorage.getItem('theme') || 'dark';
    applyTheme(saved);
    updateButtons(saved);
  }

  function updateButtons(t) {
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      var icon = btn.querySelector('i');
      if (t === 'light') {
        if (icon) { icon.className = icon.className.replace(/fa-moon/, 'fa-sun'); }
        btn.title = 'Switch to dark mode';
      } else {
        if (icon) { icon.className = icon.className.replace(/fa-sun/, 'fa-moon'); }
        btn.title = 'Switch to light mode';
      }
    });
  }

  // Re-scan newly-added elements (e.g. dynamically inserted HTML) for inline colors.
  // Idempotent: skips elements whose data-orig-* attribute is already set.
  function refreshInlineColors() {
    if (document.body.classList.contains('theme-light') ||
        document.documentElement.classList.contains('theme-light')) {
      swapInlineColors(true);
    }
  }

  window.scicryptTheme = {
    apply: applyTheme,
    toggle: toggleTheme,
    init: initTheme,
    updateButtons: updateButtons,
    refresh: refreshInlineColors
  };
})();
