# DESIGN DIRECTION: ZZLUXORA DOWNLOAD PORTAL

> Direction: Web companion untuk konsol desktop ZZLUXORA ("The Obsidian Control Deck").
> Dial: ENERGY 2 / RHYTHM 2 / MOTION 1
> Refinements: Permukaan obsidian matte bertingkat, garis tepi 1px tegas, aksen fungsional 10% (Emerald untuk Live/Download, Amber untuk Master/Highlight, Cyan untuk DMX Telemetry, Crimson untuk Blackout), tipografi monospace `tabular-nums`, nol blur berlebihan atau gradien neon generik.
> Filter: antislop (Strict compliance: zero em dash, zero emoji chrome, WCAG 2.2 AA contrast)

---

## 1. Product Identity & Narrative

- **Product**: ZZLUXORA (Audio-Reactive Stage Lighting Console & Ecosystem)
- **Target Audience**: Lighting Director (LD), operator FOH gereja/konser, teknisi mikrokontroler ESP32/DMX512, dan penguji akademik Teknik Komputer FT UNNES.
- **Voice & Tone**: Lugas, teknis, berwibawa seperti dokumentasi konsol industri (`grandMA3` / `QLC+`). Angka selalu terukur dan disertai sumber nyata.
- **Visual Style**: Matte Obsidian Control Deck (`#101319` / `#14161a` / `#1e2024` / `#242830`) dengan warna hub aksen terukur dan tombol netral abu-abu kecuali aksi primer bermakna (`Unduh Installer` Emerald `#16a34a`, `BLACKOUT` Crimson `#dc2626`).

---

## 2. Color & Surface Tokens (Parity with `zzluxora/DESIGN.md`)

- **Base Canvas**: `#101319` (`surface_obsidian`) dan `#14161a` (`surface_trough`)
- **Cards & Panels**: `#1e2024` (`bg_root`) dan `#242830` (`bg_surface`), elevated `#2d323c`
- **Borders**: `1px solid #333844` (`border_subtle`) dan `#4a5264` (`border_strong`)
- **Typography**: `#ffffff` (`text_primary`), `#cbd5e1` (`text_secondary`), `#94a3b8` (`text_muted`)
- **10% Functional Accents**:
  - **Emerald Green**: `#16a34a` / `#22c55e` (Unduh Installer, status Live Art-Net, tombol aktivasi)
  - **Amber Gold**: `#f59e0b` (Master Dimmer, penanda versi & kuadran Praise)
  - **Telemetry Cyan**: `#06b6d4` / `#22d3ee` (DMX channel selection, koordinat V-A, badge fokus)
  - **Crimson Red**: `#dc2626` / `#ef4444` (Tombol BLACKOUT di simulator)

---

## 3. Anti-Slop & Accessibility Contract

- **Zero Em Dash**: Bebas 100% dari karakter em dash.
- **Zero Glow Orbs / Purple-Blue Slop**: Tidak ada radial blur ungu/biru dekoratif; hanya cahaya lampu PAR simulasi pada stage preview yang benar-benar merepresentasikan nilai RGBW live.
- **5-State Interactive Contract**: `default`, `hover`, `focus-visible` (`2px solid #06b6d4`), `active`, `disabled`.
- **Tabular Numerals**: Semua nilai byte DMX (`000` - `255`), RPM/BPM, koordinat `(V, A)`, persentase, ukuran berkas, dan jumlah test wajib memakai `font-variant-numeric: tabular-nums`.
