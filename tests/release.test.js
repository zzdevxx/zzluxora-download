'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const contract = require('../release.js');

const project = contract.PROJECTS.zzluxora;
const fallback = project.fallback;
const apiRelease = {
  tag_name: fallback.tag,
  assets: [{
    name: fallback.asset,
    size: fallback.size,
    browser_download_url: `https://github.com/${project.repo}/releases/download/${fallback.tag}/${fallback.asset}`
  }]
};

test('published fallback snapshot is internally coherent', () => {
  const urls = contract.buildUrls('zzluxora', fallback.tag, fallback.asset);
  assert.equal(fallback.sha256.length, 64);
  assert.match(fallback.sha256, /^[a-f0-9]{64}$/);
  assert.equal(urls.releasePage, `https://github.com/${project.repo}/releases/tag/${fallback.tag}`);
  assert.equal(urls.direct, `https://zzdree.my.id/zzluxora/download/${fallback.asset}?tag=${fallback.tag}`);
  assert.ok(fallback.size > 0);
});

test('published v10.1 snapshot remains the fallback when metadata is unavailable', () => {
  const result = contract.resolveRelease('zzluxora', null, null);
  assert.equal(result.release.tag, 'v10.1');
  assert.equal(result.release.asset, 'ZZLUXORA-Setup-10.1.0.exe');
  assert.equal(result.release.sha256, '03fdef2953395d1713a3b0c45b6d186b91342693981565dce67ad474611f3508');
  assert.equal(result.source, 'fallback');
  assert.equal(result.verified, true);
});

test('API and checksum endpoint produce a verified snapshot only when all fields match', () => {
  const result = contract.resolveRelease('zzluxora', apiRelease, {
    tag: fallback.tag,
    name: fallback.asset,
    sha256: fallback.sha256
  });
  assert.equal(result.status, 'ready');
  assert.equal(result.verified, true);
  assert.equal(result.release.direct, `https://zzdree.my.id/zzluxora/download/${fallback.asset}?tag=${fallback.tag}`);
});

test('a different tag with an old checksum does not claim verification', () => {
  const newerRelease = {
    tag_name: 'v10.2',
    assets: [{
      name: 'ZZLUXORA-Setup-10.2.0.exe',
      size: 80544241,
      browser_download_url: 'https://github.com/zzdevxx/zzluxora/releases/download/v10.2/ZZLUXORA-Setup-10.2.0.exe'
    }]
  };
  const result = contract.resolveRelease('zzluxora', newerRelease, { sha256: '0'.repeat(64) });
  assert.equal(result.verified, false);
  assert.match(result.message, /belum cocok/i);
});

test('invalid checksum syntax and foreign asset URLs fall back', () => {
  const invalidDigest = contract.resolveRelease('zzluxora', apiRelease, { sha256: 'abc' });
  assert.equal(invalidDigest.source, 'fallback');

  const foreign = contract.resolveRelease('zzluxora', {
    tag_name: fallback.tag,
    assets: [{
      name: fallback.asset,
      size: fallback.size,
      browser_download_url: 'https://example.test/malware.exe'
    }]
  }, { sha256: fallback.sha256 });
  assert.equal(foreign.source, 'fallback');
  assert.match(foreign.message, /daftar izin/i);
});

test('stale metadata response cannot overwrite a newer load', async () => {
  const deferred = {};
  const pendingApi = new Promise((resolve) => { deferred.resolveApi = resolve; });
  const calls = [];
  const controller = contract.createReleaseController('zzluxora', {
    fetchJson(url) {
      calls.push(url);
      if (calls.length === 1) return pendingApi;
      return Promise.reject(new Error('offline'));
    },
    apply() {}
  });

  const first = controller.load();
  const second = controller.load();
  const secondResult = await second;
  assert.equal(secondResult.source, 'fallback');
  deferred.resolveApi(apiRelease);
  const firstResult = await first;
  assert.equal(firstResult.stale, true);
  assert.equal(calls.length, 2);
});
