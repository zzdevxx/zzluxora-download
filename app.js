(function () {
  'use strict';

  // Exact fixture definitions from zzdevxx/zz-fixture and zzluxora/fixtures/*.zfx
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
    praise:  { valence: 65,  arousal: 72,  rms: 85, master: 100 },
    worship: { valence: -35, arousal: -58, rms: 48, master: 85  },
    bridge:  { valence: 25,  arousal: 88,  rms: 94, master: 100 },
    altar:   { valence: 12,  arousal: -20, rms: 62, master: 90  }
  };

  const state = {
    play: true,
    blackout: false,
    fixtureKey: 'Kumastb-STL47',
    valence: 0.65,
    arousal: 0.72,
    rms: 0.82,
    master: 1.0,
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
    parRig: document.getElementById('par-rig'),
    dmxGrid: document.getElementById('dmx-channels'),
    playBtn: document.getElementById('sim-play-btn'),
    blackoutBtn: document.getElementById('sim-blackout-btn'),
    artnetBadge: document.getElementById('sim-artnet-badge'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    toast: document.getElementById('toast')
  };

  // Mirrors core/color_engine.py: emotion_to_hsv -> hsv_to_rgb -> rgb_to_physical_rgbw
  function computeRgbw(v, a, rms, master) {
    const theta = Math.atan2(a, v);
    let hueDeg = (theta * 180) / Math.PI;
    if (hueDeg < 0) hueDeg += 360;

    const dist = Math.sqrt(v * v + a * a);
    const sat = Math.max(0.2, Math.min(1.0, dist / Math.SQRT2));
    const val = Math.max(0.0, Math.min(1.0, rms * master));

    const c = val * sat;
    const x = c * (1.0 - Math.abs(((hueDeg / 60.0) % 2.0) - 1.0));
    const m = val - c;

    let rp = 0, gp = 0, bp = 0;
    if (hueDeg < 60)       { rp = c; gp = x; bp = 0; }
    else if (hueDeg < 120) { rp = x; gp = c; bp = 0; }
    else if (hueDeg < 180) { rp = 0; gp = c; bp = x; }
    else if (hueDeg < 240) { rp = 0; gp = x; bp = c; }
    else if (hueDeg < 300) { rp = x; gp = 0; bp = c; }
    else                   { rp = c; gp = 0; bp = x; }

    const r = Math.max(0, Math.min(255, Math.round((rp + m) * 255)));
    const g = Math.max(0, Math.min(255, Math.round((gp + m) * 255)));
    const b = Math.max(0, Math.min(255, Math.round((bp + m) * 255)));

    const w = Math.min(r, g, b);
    return {
      hueDeg: Math.round(hueDeg),
      satPct: Math.round(sat * 100),
      valPct: Math.round(val * 100),
      r, g, b,
      rp: r - w,
      gp: g - w,
      bp: b - w,
      w
    };
  }

  function quadrantLabel(v, a) {
    if (Math.abs(v) < 0.08 && Math.abs(a) < 0.08) return 'Center (Neutral)';
    if (v >= 0 && a >= 0) return 'Q1 (Praise / Joyful)';
    if (v < 0 && a >= 0) return 'Q2 (Dynamic / Intense)';
    if (v < 0 && a < 0) return 'Q3 (Deep Worship)';
    return 'Q4 (Calm / Contemplative)';
  }

  function formatSigned(num) {
    return (num >= 0 ? '+' : '') + num.toFixed(2);
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
    const colorMaster = fixture.hasDimmer ? 1.0 : state.master;
    const rgbw = computeRgbw(state.valence, state.arousal, state.rms, colorMaster);
    const visualRgbw = computeRgbw(state.valence, state.arousal, state.rms, state.master);
    const bytes = buildDmxBytes(fixture, rgbw);

    if (el.valValence) el.valValence.textContent = formatSigned(state.valence);
    if (el.valArousal) el.valArousal.textContent = formatSigned(state.arousal);
    if (el.valRms) el.valRms.textContent = `${Math.round(state.rms * 100)}%`;
    if (el.valMaster) el.valMaster.textContent = `${Math.round(state.master * 100)}%`;

    if (el.outQuad) el.outQuad.textContent = quadrantLabel(state.valence, state.arousal);
    if (el.outHsv) el.outHsv.textContent = `${visualRgbw.hueDeg} deg / ${visualRgbw.satPct}% / ${visualRgbw.valPct}%`;
    if (el.outRgbw) el.outRgbw.textContent = `R:${rgbw.rp} G:${rgbw.gp} B:${rgbw.bp} W:${rgbw.w}`;
    if (el.outCoord) el.outCoord.textContent = `(${formatSigned(state.valence)}, ${formatSigned(state.arousal)})`;
    if (el.outChSum) el.outChSum.textContent = `${fixture.channels.length} CHANNELS (${fixture.name})`;

    if (el.cursor) {
      const leftPct = 50 + state.valence * 44;
      const topPct = 50 - state.arousal * 44;
      el.cursor.style.left = `${leftPct}%`;
      el.cursor.style.top = `${topPct}%`;
      el.cursor.style.backgroundColor = `rgb(${visualRgbw.r}, ${visualRgbw.g}, ${visualRgbw.b})`;
    }

    if (el.artnetBadge) {
      el.artnetBadge.classList.remove('is-gated', 'is-blackout');
      if (state.blackout) {
        el.artnetBadge.textContent = 'BLACKOUT ACTIVE (ALL CH 000)';
        el.artnetBadge.classList.add('is-blackout');
      } else if (!state.play) {
        el.artnetBadge.textContent = 'PLAY-GATED (UDP PAUSED)';
        el.artnetBadge.classList.add('is-gated');
      } else {
        el.artnetBadge.textContent = 'ART-NET UDP :6454 STREAMING';
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
      const lenses = el.parRig.querySelectorAll('.par-lens');
      const liveColor = (state.blackout || !state.play)
        ? 'rgb(20, 22, 26)'
        : `rgb(${visualRgbw.r}, ${visualRgbw.g}, ${visualRgbw.b})`;
      lenses.forEach((lens) => {
        lens.style.backgroundColor = liveColor;
      });
    }

    if (el.dmxGrid) {
      el.dmxGrid.innerHTML = '';
      fixture.channels.forEach((role, idx) => {
        const val = bytes[idx] || 0;
        const cell = document.createElement('div');
        cell.className = 'dmx-cell';
        const pct = Math.round((val / 255) * 100);
        cell.innerHTML = `
          <span class="dmx-ch">CH ${idx + 1}</span>
          <span class="dmx-role">${role}</span>
          <span class="dmx-val tabular-num">${String(val).padStart(3, '0')}</span>
          <span class="dmx-bar"><span class="dmx-bar-fill" style="width:${pct}%"></span></span>
        `;
        el.dmxGrid.appendChild(cell);
      });
    }
  }

  function showToast(msg) {
    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.hidden = false;
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 2400);
  }

  function applyPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.blackout = false;
    if (el.valence) { el.valence.value = p.valence; state.valence = p.valence / 100; }
    if (el.arousal) { el.arousal.value = p.arousal; state.arousal = p.arousal / 100; }
    if (el.rms) { el.rms.value = p.rms; state.rms = p.rms / 100; }
    if (el.master) { el.master.value = p.master; state.master = p.master / 100; }
    el.presetBtns.forEach((b) => b.classList.toggle('active', b.dataset.preset === name));
    render();
  }

  function setupEvents() {
    if (el.fixture) {
      el.fixture.addEventListener('change', (e) => {
        state.fixtureKey = e.target.value;
        render();
      });
    }
    const bindSlider = (input, setter) => {
      if (!input) return;
      input.addEventListener('input', (e) => {
        state.blackout = false;
        el.presetBtns.forEach((b) => b.classList.remove('active'));
        setter(parseFloat(e.target.value) / 100);
        render();
      });
    };
    bindSlider(el.valence, (v) => { state.valence = v; });
    bindSlider(el.arousal, (v) => { state.arousal = v; });
    bindSlider(el.rms, (v) => { state.rms = v; });
    bindSlider(el.master, (v) => { state.master = v; });

    el.presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
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

    document.querySelectorAll('.btn-copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.copy;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Disalin: ${text}`);
        }).catch(() => {
          showToast('Gagal menyalin ke clipboard.');
        });
      });
    });

    document.querySelectorAll('.faq-q').forEach((q) => {
      q.addEventListener('click', () => {
        const expanded = q.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-q').forEach((item) => item.setAttribute('aria-expanded', 'false'));
        q.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  // Non-blocking sync with zzluxora release_manifest.json and GitHub latest release
  async function syncReleaseMetadata() {
    const fetchJson = async (url) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      } finally {
        clearTimeout(timer);
      }
    };

    const [manifest, release] = await Promise.all([
      fetchJson('https://raw.githubusercontent.com/zzdevxx/zzluxora/main/release_manifest.json'),
      fetchJson('https://api.github.com/repos/zzdevxx/zzluxora/releases/latest')
    ]);

    const badge = document.getElementById('hero-version-badge');
    const telVer = document.getElementById('telemetry-version');
    const dlTag = document.getElementById('dl-version-tag');
    const dlExeName = document.getElementById('dl-exe-name');
    const dlExeSize = document.getElementById('dl-exe-size');
    const dlDate = document.getElementById('dl-release-date');
    const dlBtn = document.getElementById('dl-installer-btn');
    const guideExe = document.getElementById('guide-exe-name');

    if (manifest && manifest.version) {
      if (badge) badge.textContent = `Rilis Aktif: v${manifest.version} | Art-Net 4 DMX512`;
      if (telVer) telVer.textContent = `v${manifest.version}`;
      if (dlTag && manifest.tag) dlTag.textContent = manifest.tag;
      if (dlExeName && manifest.installer_name) dlExeName.textContent = `Berkas: ${manifest.installer_name}`;
      if (guideExe && manifest.installer_name) guideExe.textContent = manifest.installer_name;
      if (dlExeSize && typeof manifest.installer_size === 'number' && manifest.installer_size > 0) {
        const mb = (manifest.installer_size / 1_000_000).toFixed(1);
        dlExeSize.textContent = `Ukuran: ${mb} MB (Setup)`;
      }
      if (dlDate && manifest.released_at) {
        dlDate.textContent = `Rilis: ${manifest.released_at.slice(0, 10)}`;
      }
      if (dlBtn && typeof manifest.download_url === 'string' && manifest.download_url.startsWith('https://')) {
        dlBtn.href = manifest.download_url;
      }
    }

    if (release && release.tag_name && Array.isArray(release.assets)) {
      const exeAsset = release.assets.find((a) => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.exe'));
      if (exeAsset) {
        if (dlTag) dlTag.textContent = release.tag_name;
        if (dlExeName && exeAsset.name) dlExeName.textContent = `Berkas: ${exeAsset.name}`;
        if (guideExe && exeAsset.name) guideExe.textContent = exeAsset.name;
        if (dlExeSize && typeof exeAsset.size === 'number') {
          dlExeSize.textContent = `Ukuran: ${(exeAsset.size / 1_000_000).toFixed(1)} MB (Setup)`;
        }
        if (dlBtn && exeAsset.browser_download_url) dlBtn.href = exeAsset.browser_download_url;
      }
    }
  }

  function init() {
    setupEvents();
    render();
    syncReleaseMetadata();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
