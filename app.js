(function () {
  'use strict';

  const FIXTURES = {
    'zzdree-36X': {
      name: 'zzdree-36X',
      hasWhite: false,
      hasDimmer: false,
      channels: ['RED', 'GRN', 'BLU']
    },
    'Kumastb-STL47': {
      name: 'Kumastb-STL47',
      hasWhite: true,
      hasDimmer: true,
      channels: ['DIM', 'RED', 'GRN', 'BLU', 'WHT', 'STR', 'PRG', 'SPD']
    },
    'Illumsolid-YSP01': {
      name: 'Illumsolid-YSP01',
      hasWhite: true,
      hasDimmer: true,
      channels: ['DIM', 'RED', 'GRN', 'BLU', 'WHT', 'PRG', 'EMP', 'EMP']
    },
    'Alien-AL36': {
      name: 'Alien-AL36',
      hasWhite: false,
      hasDimmer: true,
      channels: ['DIM', 'RED', 'GRN', 'BLU', 'EMP', 'PRG', 'SPD', 'EMP']
    },
    'Wisdom-54X3': {
      name: 'Wisdom-54X3',
      hasWhite: false,
      hasDimmer: true,
      channels: ['DIM', 'STR', 'FX', 'SPD', 'RED', 'GRN', 'BLU', 'EMP']
    }
  };

  const PRESETS = {
    praise: { valence: 65, arousal: 72, rms: 85, master: 100 },
    worship: { valence: -35, arousal: -58, rms: 48, master: 85 },
    bridge: { valence: 25, arousal: 88, rms: 94, master: 100 },
    altar: { valence: 12, arousal: -20, rms: 62, master: 90 }
  };

  const state = {
    play: true,
    blackout: false,
    fixtureKey: 'Kumastb-STL47',
    valence: 0.65,
    arousal: 0.72,
    rms: 0.82,
    master: 1,
    toastTimer: null
  };

  const el = {
    fixture: document.getElementById('sim-fixture'),
    valence: document.getElementById('sim-valence'),
    arousal: document.getElementById('sim-arousal'),
    rms: document.getElementById('sim-rms'),
    master: document.getElementById('sim-master'),
    valValence: document.getElementById('val-valence'),
    valArousal: document.getElementById('val-arousal'),
    valRms: document.getElementById('val-rms'),
    valMaster: document.getElementById('val-master'),
    outQuad: document.getElementById('out-quadrant'),
    outHsv: document.getElementById('out-hsv'),
    outRgbw: document.getElementById('out-rgbw'),
    outCoord: document.getElementById('out-va-coord'),
    outChSum: document.getElementById('out-channel-summary'),
    cursor: document.getElementById('va-cursor'),
    heroCursor: document.getElementById('hero-va-cursor'),
    heroVa: document.getElementById('hero-va'),
    heroSwatch: document.getElementById('hero-swatch'),
    heroHsv: document.getElementById('hero-hsv'),
    heroRgbw: document.getElementById('hero-rgbw'),
    heroMode: document.getElementById('hero-mode'),
    parRig: document.getElementById('par-rig'),
    dmxGrid: document.getElementById('dmx-channels'),
    playBtn: document.getElementById('sim-play-btn'),
    blackoutBtn: document.getElementById('sim-blackout-btn'),
    artnetBadge: document.getElementById('sim-artnet-badge'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    toast: document.getElementById('toast'),
    copyFallback: document.getElementById('copy-fallback')
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function computeRgbw(v, a, rms, master) {
    const emotionV = clamp(v, -1, 1);
    const emotionA = clamp(a, -1, 1);
    const theta = Math.atan2(emotionA, emotionV);
    const hueDeg = ((theta * 180) / Math.PI + 360) % 360;
    const dist = Math.sqrt(emotionV * emotionV + emotionA * emotionA);
    const sat = clamp(dist / Math.SQRT2, 0.2, 1);
    const val = clamp(clamp(rms, 0, 1) * clamp(master, 0, 1), 0, 1);

    const c = val * sat;
    const x = c * (1 - Math.abs(((hueDeg / 60) % 2) - 1));
    const m = val - c;
    let rp = 0;
    let gp = 0;
    let bp = 0;

    if (hueDeg < 60) {
      rp = c;
      gp = x;
    } else if (hueDeg < 120) {
      rp = x;
      gp = c;
    } else if (hueDeg < 180) {
      gp = c;
      bp = x;
    } else if (hueDeg < 240) {
      gp = x;
      bp = c;
    } else if (hueDeg < 300) {
      rp = x;
      bp = c;
    } else {
      rp = c;
      bp = x;
    }

    const r = clamp(Math.round((rp + m) * 255), 0, 255);
    const g = clamp(Math.round((gp + m) * 255), 0, 255);
    const b = clamp(Math.round((bp + m) * 255), 0, 255);
    const w = Math.min(r, g, b);

    return {
      hueDeg: Math.round(hueDeg),
      satPct: Math.round(sat * 100),
      valPct: Math.round(val * 100),
      r,
      g,
      b,
      rp: r - w,
      gp: g - w,
      bp: b - w,
      w
    };
  }

  function quadrantLabel(v, a) {
    if (Math.abs(v) < 0.08 && Math.abs(a) < 0.08) return 'Titik netral';
    if (v >= 0 && a >= 0) return 'Q1 (Praise / Sukacita)';
    if (v < 0 && a >= 0) return 'Q2 (Dinamis / Tegang)';
    if (v < 0 && a < 0) return 'Q3 (Worship mendalam)';
    return 'Q4 (Tenang / Reflektif)';
  }

  function formatSigned(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
  }

  function formatBytes(value) {
    return `${new Intl.NumberFormat('id-ID').format(value)} byte`;
  }

  function buildDmxBytes(fixture, rgbw) {
    if (state.blackout || !state.play) {
      return fixture.channels.map(() => 0);
    }
    const dimmerByte = Math.round(state.master * 255);
    return fixture.channels.map((role) => {
      if (role === 'DIM') return dimmerByte;
      if (role === 'RED') return fixture.hasWhite ? rgbw.rp : rgbw.r;
      if (role === 'GRN') return fixture.hasWhite ? rgbw.gp : rgbw.g;
      if (role === 'BLU') return fixture.hasWhite ? rgbw.bp : rgbw.b;
      if (role === 'WHT') return fixture.hasWhite ? rgbw.w : 0;
      return 0;
    });
  }

  function render() {
    const fixture = FIXTURES[state.fixtureKey] || FIXTURES['Kumastb-STL47'];
    const colorMaster = fixture.hasDimmer ? 1 : state.master;
    const rgbw = computeRgbw(state.valence, state.arousal, state.rms, colorMaster);
    const visualRgbw = computeRgbw(state.valence, state.arousal, state.rms, state.master);
    const bytes = buildDmxBytes(fixture, rgbw);
    const isLive = state.play && !state.blackout;
    const visualColor = isLive ? `rgb(${visualRgbw.r}, ${visualRgbw.g}, ${visualRgbw.b})` : 'rgb(28, 30, 31)';

    if (el.valValence) el.valValence.textContent = formatSigned(state.valence);
    if (el.valArousal) el.valArousal.textContent = formatSigned(state.arousal);
    if (el.valRms) el.valRms.textContent = `${Math.round(state.rms * 100)}%`;
    if (el.valMaster) el.valMaster.textContent = `${Math.round(state.master * 100)}%`;

    if (el.outQuad) el.outQuad.textContent = quadrantLabel(state.valence, state.arousal);
    if (el.outHsv) el.outHsv.textContent = `${visualRgbw.hueDeg} deg / ${visualRgbw.satPct}% / ${visualRgbw.valPct}%`;
    if (el.outRgbw) el.outRgbw.textContent = `R:${rgbw.rp} G:${rgbw.gp} B:${rgbw.bp} W:${rgbw.w}`;
    if (el.outCoord) el.outCoord.textContent = `(${formatSigned(state.valence)}, ${formatSigned(state.arousal)})`;
    if (el.outChSum) el.outChSum.textContent = `${fixture.channels.length} KANAL / ${fixture.name}`;

    [el.cursor, el.heroCursor].forEach((cursor) => {
      if (!cursor) return;
      cursor.style.left = `${50 + state.valence * 44}%`;
      cursor.style.top = `${50 - state.arousal * 44}%`;
      cursor.style.backgroundColor = visualColor;
    });

    if (el.heroVa) el.heroVa.textContent = `V ${formatSigned(state.valence)} / A ${formatSigned(state.arousal)}`;
    if (el.heroHsv) el.heroHsv.textContent = `${visualRgbw.hueDeg} deg / ${visualRgbw.satPct}% / ${visualRgbw.valPct}%`;
    if (el.heroRgbw) el.heroRgbw.textContent = `R:${rgbw.rp} G:${rgbw.gp} B:${rgbw.bp} W:${rgbw.w}`;
    if (el.heroSwatch) el.heroSwatch.style.backgroundColor = visualColor;
    if (el.heroMode) el.heroMode.textContent = state.blackout ? 'BLACKOUT SIMULASI' : state.play ? 'SIMULASI AKTIF' : 'SIMULASI DIJEDA';

    if (el.artnetBadge) {
      el.artnetBadge.classList.remove('is-gated', 'is-blackout');
      if (state.blackout) {
        el.artnetBadge.textContent = 'BLACKOUT SIMULASI / TANPA UDP';
        el.artnetBadge.classList.add('is-blackout');
      } else if (!state.play) {
        el.artnetBadge.textContent = 'SIMULASI DIJEDA / TANPA UDP';
        el.artnetBadge.classList.add('is-gated');
      } else {
        el.artnetBadge.textContent = 'SIMULASI BROWSER / TANPA UDP';
      }
    }

    if (el.playBtn) {
      el.playBtn.textContent = state.play ? 'PLAY: ON' : 'PLAY: PAUSED';
      el.playBtn.setAttribute('aria-pressed', String(state.play));
    }

    if (el.blackoutBtn) {
      el.blackoutBtn.classList.toggle('is-active', state.blackout);
      el.blackoutBtn.setAttribute('aria-pressed', String(state.blackout));
    }

    if (el.parRig) {
      el.parRig.querySelectorAll('.par-lens').forEach((lens) => {
        lens.style.backgroundColor = visualColor;
      });
    }

    if (el.dmxGrid) {
      el.dmxGrid.replaceChildren();
      fixture.channels.forEach((role, index) => {
        const value = bytes[index] || 0;
        const cell = document.createElement('div');
        cell.className = 'dmx-cell';
        const percent = Math.round((value / 255) * 100);
        cell.innerHTML = `
          <span class="dmx-ch mono tabular-num">CH ${index + 1}</span>
          <span class="dmx-role mono">${role}</span>
          <span class="dmx-val mono tabular-num">${String(value).padStart(3, '0')}</span>
          <span class="dmx-bar" aria-hidden="true"><span class="dmx-bar-fill" style="width:${percent}%"></span></span>
        `;
        el.dmxGrid.appendChild(cell);
      });
    }
  }

  function showToast(message) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.hidden = false;
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 2600);
  }

  function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    state.blackout = false;
    if (el.valence) {
      el.valence.value = preset.valence;
      state.valence = preset.valence / 100;
    }
    if (el.arousal) {
      el.arousal.value = preset.arousal;
      state.arousal = preset.arousal / 100;
    }
    if (el.rms) {
      el.rms.value = preset.rms;
      state.rms = preset.rms / 100;
    }
    if (el.master) {
      el.master.value = preset.master;
      state.master = preset.master / 100;
    }
    el.presetBtns.forEach((button) => {
      const active = button.dataset.preset === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render();
  }

  async function copyWithFallback(text) {
    let clipboardFailed = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        clipboardFailed = true;
      }
    } else {
      clipboardFailed = true;
    }

    if (!el.copyFallback || !clipboardFailed) {
      showToast('Clipboard tidak tersedia. Pilih teks secara manual untuk disalin.');
      return false;
    }

    el.copyFallback.hidden = false;
    el.copyFallback.value = text;
    el.copyFallback.focus();
    el.copyFallback.select();
    showToast('Clipboard tidak tersedia. Teks dipilih di kotak cadangan, salin manual dengan Ctrl+C.');
    return false;
  }

  function setupEvents() {
    if (el.fixture) {
      el.fixture.addEventListener('change', (event) => {
        state.fixtureKey = event.target.value;
        render();
      });
    }

    const bindSlider = (input, setter) => {
      if (!input) return;
      input.addEventListener('input', (event) => {
        state.blackout = false;
        el.presetBtns.forEach((button) => {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        });
        setter(parseFloat(event.target.value) / 100);
        render();
      });
    };

    bindSlider(el.valence, (value) => { state.valence = value; });
    bindSlider(el.arousal, (value) => { state.arousal = value; });
    bindSlider(el.rms, (value) => { state.rms = value; });
    bindSlider(el.master, (value) => { state.master = value; });

    el.presetBtns.forEach((button) => {
      button.addEventListener('click', () => applyPreset(button.dataset.preset));
    });

    if (el.playBtn) {
      el.playBtn.addEventListener('click', () => {
        state.play = !state.play;
        render();
      });
    }

    if (el.blackoutBtn) {
      el.blackoutBtn.addEventListener('click', () => {
        state.blackout = !state.blackout;
        render();
      });
    }

    document.querySelectorAll('.btn-copy').forEach((button) => {
      button.addEventListener('click', async () => {
        const text = button.dataset.copy;
        if (!text) return;
        const copied = await copyWithFallback(text);
        if (copied) showToast(`Disalin: ${text}`);
      });
    });

    document.querySelectorAll('.faq-q').forEach((question) => {
      question.addEventListener('click', () => {
        const expanded = question.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-q').forEach((item) => item.setAttribute('aria-expanded', 'false'));
        question.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  function applyRelease(result) {
    const release = result.release;
    const status = document.getElementById('dl-status');
    const source = document.getElementById('dl-source');

    if (status) status.textContent = result.message;
    if (source && !release) {
      source.textContent = 'Sumber: menunggu metadata';
      return;
    }
    if (!release) return;

    const sourceLabel = result.status === 'loading'
      ? 'Sumber: menunggu metadata'
      : result.source === 'fallback'
        ? 'Sumber: snapshot rilis publik terverifikasi'
        : result.verified
          ? 'Sumber: GitHub API dan portal, checksum cocok'
          : 'Sumber: GitHub API, checksum belum cocok dengan snapshot';

    if (source) source.textContent = sourceLabel;

    const badge = document.getElementById('hero-version-badge');
    const telemetry = document.getElementById('telemetry-version');
    const tag = document.getElementById('dl-version-tag');
    const asset = document.getElementById('dl-exe-name');
    const size = document.getElementById('dl-exe-size');
    const releaseDate = document.getElementById('dl-release-date');
    const sha = document.getElementById('dl-sha256');
    const releaseLink = document.getElementById('dl-installer-btn');
    const directLink = document.getElementById('dl-installer-direct');
    const guide = document.getElementById('guide-exe-name');

    if (badge) badge.textContent = `Rilis publik: ${release.tag} | Art-Net 4 DMX512`;
    if (telemetry) telemetry.textContent = `v${release.version}`;
    if (tag) tag.textContent = release.tag;
    if (asset) asset.textContent = release.asset;
    if (size) size.textContent = formatBytes(release.size);
    if (releaseDate) releaseDate.textContent = `${release.tag} / ${release.version}`;
    if (sha) sha.textContent = release.sha256;
    if (releaseLink) releaseLink.href = release.githubRelease;
    if (directLink) directLink.href = release.direct;
    if (guide) guide.textContent = release.asset;
  }

  async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function initRelease() {
    const contract = window.ReleaseContract;
    if (!contract) {
      applyRelease({
        status: 'fallback',
        source: 'fallback',
        verified: false,
        message: 'Kontrak metadata tidak dimuat. Nilai statis pada halaman tetap ditampilkan.'
      });
      return;
    }
    contract.createReleaseController('zzluxora', {
      fetchJson,
      apply: applyRelease
    }).load();
  }

  function init() {
    setupEvents();
    render();
    initRelease();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
