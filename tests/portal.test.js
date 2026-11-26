'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

const html = read('index.html');
const app = read('app.js');
const css = read('style.css');

const contrastRatio = (foreground, background) => {
  const linear = (hex) => [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = (hex) => {
    const [red, green, blue] = linear(hex);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

test('all original anchors and legal links remain', () => {
  for (const id of ['hero', 'features', 'simulator', 'ecosystem', 'download', 'setup', 'faq']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const href of ['https://zzdree.my.id/privacy', 'https://zzdree.my.id/terms', 'https://zzdree.my.id/data-deletion']) {
    assert.ok(html.includes(href));
  }
});

test('unmeasured and stale claims are absent', () => {
  const source = `${html}\n${app}`;
  for (const claim of ['<500ms', 'below 500 ms', '197 Test', '197 test', 'v10.0', 'ART-NET UDP :6454 STREAMING']) {
    assert.ok(!source.includes(claim), `must not contain: ${claim}`);
  }
  assert.ok(!source.includes('—'));
});

test('release UI has explicit release page, direct download, and accessible status', () => {
  for (const id of ['dl-installer-btn', 'dl-installer-direct', 'dl-status', 'dl-source', 'dl-sha256']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.ok(app.includes('createReleaseController'));
  assert.ok(!app.includes('./release_manifest.json'));
});

test('simulator copy states browser simulation and copy has a manual fallback', () => {
  assert.ok(app.includes('SIMULASI BROWSER / TANPA UDP'));
  assert.ok(html.includes('id="copy-fallback"'));
  assert.ok(app.includes('copyWithFallback'));
});

test('restored Obsidian deck uses sans headings, reduced motion, and visible focus', () => {
  assert.match(css, /--font-sans:\s*"Segoe UI"/);
  assert.doesNotMatch(css, /Barlow Condensed/i);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /tabular-nums/);
  assert.match(css, /--green:\s*#16a34a/i);
  assert.match(css, /--amber:\s*#f59e0b/i);
  assert.match(css, /--cyan:\s*#06b6d4/i);
  assert.match(css, /--red:\s*#dc2626/i);
});

test('mobile navigation is labelled, keyboard operable, and reflows at tablet and phone widths', () => {
  assert.match(html, /id="nav-toggle"/);
  assert.match(html, /aria-controls="site-nav"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /class="nav-toggle-label">Menu<\/span>/);
  assert.ok(app.includes("event.key !== 'Escape'"));
  assert.ok(app.includes('setOpen(false)'));
  assert.ok(app.includes("header.dataset.navReady = 'true'"));
  assert.match(css, /\.site-header\[data-nav-ready\] \.site-nav \{\s*display: none/);
  assert.match(css, /@media \(max-width: 1120px\)/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /min-height: 44px/);
});

test('static assets use same-origin versioned paths for cache-sensitive proxies', () => {
  assert.match(html, /href="\.\/style\.css\?v=20261126-console"/);
  assert.match(html, /src="\.\/release\.js\?v=20261126-console"/);
  assert.match(html, /src="\.\/app\.js\?v=20261126-console"/);
});

test('action surfaces pass AA contrast and overflow is not globally hidden', () => {
  assert.doesNotMatch(css, /overflow-x:\s*hidden/);
  assert.match(css, /min-height:\s*100svh/);
  assert.doesNotMatch(css, /min-height:\s*100vh/);
  assert.match(css, /\.btn-primary,\s*\.btn-success\s*\{[\s\S]*?background-color:\s*var\(--green-strong\)/);
  assert.match(css, /\.btn-primary:hover,\s*\.btn-success:hover\s*\{[\s\S]*?background-color:\s*var\(--green-hover\)/);
  assert.match(css, /\.btn-primary:active,\s*\.btn-success:active\s*\{[\s\S]*?background-color:\s*var\(--green-deep\)/);
  assert.match(css, /\.skip-link\s*\{[\s\S]*?background-color:\s*var\(--green-strong\)/);
  assert.match(css, /\.skip-link:hover\s*\{[\s\S]*?background-color:\s*var\(--green-hover\)/);
  assert.match(css, /\.skip-link:active\s*\{[\s\S]*?background-color:\s*var\(--green-deep\)/);
  assert.match(css, /\.btn-danger:hover,\s*\.btn-danger\.is-active\s*\{[\s\S]*?color:\s*var\(--text-primary\)/);
  assert.match(css, /\.release-status\s*\{[\s\S]*?border:\s*1px solid var\(--green-strong\)/);

  const pairs = [
    ['primary and success default', '#f8fafc', '#15803d'],
    ['primary and success hover', '#f8fafc', '#166534'],
    ['primary and success active', '#f8fafc', '#14532d'],
    ['skip link default', '#f8fafc', '#15803d'],
    ['skip link hover', '#f8fafc', '#166534'],
    ['skip link active', '#f8fafc', '#14532d'],
    ['danger default', '#fca5a5', '#3b1818'],
    ['danger hover and active', '#f8fafc', '#dc2626'],
    ['danger pressed', '#f8fafc', '#991b1b'],
    ['preset active and step number', '#07080a', '#f59e0b'],
  ];
  for (const [label, foreground, background] of pairs) {
    assert.ok(contrastRatio(foreground, background) >= 4.5, `${label} must pass 4.5:1`);
  }
});
