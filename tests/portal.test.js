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

test('reference direction uses condensed headings, reduced motion, and visible focus', () => {
  assert.match(css, /Barlow Condensed/i);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /tabular-nums/);
});
