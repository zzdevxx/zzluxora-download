# Product Requirements Document (PRD): ZZLUXORA Download Portal

**Project**: zzluxora-download
**Version**: 10.0.0
**Status**: Approved
**Created**: 2026-11-26
**Last Updated**: 2026-11-26
**Canonical URL**: `https://zzdree.my.id/zzluxora/` (origin GitHub Pages: `https://zzdevxx.github.io/zzluxora-download/`)

---

## 1. Executive Summary
`zzluxora-download` adalah portal unduhan resmi, simulator browser Russell 2D HSV-RGBW/DMX512, serta pusat navigasi ekosistem 4 repositori ZZLUXORA (`zzluxora`, `esp32-artnet-dmx`, `zz-fixture`, dan `zzluxora-thesis`). Portal ini memberi akses satu halaman bagi operator panggung, teknisi gereja, dan penguji skripsi untuk mengunduh installer Windows (`ZZLUXORA-Setup-10.0.0.exe`), mengeksplorasi model komputasi audio-ke-DMX secara langsung di browser, dan menelusuri komponen hardware serta profil fixture.

## 2. Problem Statement
**Problem**: Sebelumnya `zzluxora-v10` tidak memiliki portal distribusi web publik maupun installer siap pakai seperti `banklycs-download`, sehingga calon pengguna hanya melihat repositori kode Python mentah dan tidak langsung melihat keterhubungan antara konsol desktop, firmware node ESP32 (`v5.2.0`), profil fixture `.qxf` (`zz-fixture`), dan naskah skripsi.
**Target Users**: Lighting Director (LD), operator FOH ibadah/konser, teknisi hardware DMX/Art-Net, dosen penguji/pembaca skripsi FT UNNES.
**Current Pain Points**:
- Tidak ada satu halaman publik untuk mengunduh installer `.exe` per-user tanpa setup Python.
- Keterkaitan 4 repositori ekosistem ZZLUXORA tersebar di masing-masing README.
- Belum ada demo interaktif di browser yang memperlihatkan pemetaan `(Valence, Arousal) -> HSV -> RGBW -> DMX512` untuk tiap profil `zz-fixture`.

## 3. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Distribusi Installer Windows 11 | Unduhan langsung dari GitHub Releases (`zzdevxx/zzluxora`) + `release_manifest.json` | 1 klik dari Hero & Download Hub, fallback metadata selalu tampil saat offline/rate-limit |
| Simulasi Akurat di Browser | Formula JS identik dengan `core/emotion_model.py` dan `core/color_engine.py` | 5 preset/kontrol manual + 5 profil `zz-fixture` real channel layout |
| Keterhubungan 4 Repo + Hub | Tautan terverifikasi HTTP 200 | Link langsung ke `zzluxora`, `esp32-artnet-dmx`, `zz-fixture`, `zzluxora-thesis`, dan `zzdree.my.id` |
| Kepatuhan Antislop & A11Y | Kontras WCAG 2.2 AA, 0 horizontal overflow, 0 em dash | 0 error di 1440/1024/768/390/320 px |

## 4. Feature Requirements
### MVP Features (v10.0)
- **Live Release Metadata Sync**: Membaca `release_manifest.json` dari `zzdevxx/zzluxora` dan GitHub API `/releases/latest` secara non-blocking dengan fallback statis terverifikasi (`v10.0`, `10.0.0`, ukuran aktual installer).
- **Interactive Stage Console Simulator (The Obsidian Control Deck)**:
  - Input kontrol Russell 2D Plane (`Valence` [-1..1], `Arousal` [-1..1], `RMS Energy` [0..1], `Master Dimmer` [0..1], serta quick-preset segmen Praise / Worship / Neutral / Strobe / Blackout).
  - Visualisasi langsung 4-unit PAR LED stage rig (`zzdree 36X` 3CH RGB, `Alien AL36` 8CH RGB, `Kumastb STL47` 8CH RGBW, `Illumsolid YSP01` 8CH RGBW, `Wisdom 54X3` 8CH RGB) lengkap dengan tabel kanal DMX512 byte-per-byte (`tabular-nums`).
- **Ekosistem 4 Repo Terhubung**: Peta peran, spesifikasi teknis terukur (197 unit test, 43.07 FPS nominal DMX / 23220 us, 5 profil `.qxf`, 7 file firmware byte-identik SHA-256 `817c30a3...`), dan tautan cepat ke 4 repo.
- **Panduan Instalasi & Setup Art-Net**: 3 langkah instalasi Windows (`ZZLUXORA-Setup-10.0.0.exe`, per-user tanpa UAC) dan alur koneksi ke node `esp32-artnet-dmx` (`ARTNET-DMX` AP / `zzlight.local` / UDP `6454`).
- **Legal & Privacy Trio**: Portal murni statis tanpa akun/cookie pelacak/pengumpulan data; footer & halaman hukum terhubung langsung ke `/privacy`, `/terms`, dan `/data-deletion` di hub `zzdree.my.id` (mematuhi UU PDP No. 27/2022 & GDPR Art. 17).

## 5. Data & Manifest Contract (JSON, Zero Database)
Portal tidak menggunakan database backend. Sinkronisasi rilis mengikuti skema `release_manifest.json` di `zzdevxx/zzluxora`:

```json
{
  "app": "ZZLUXORA",
  "version": "10.0.0",
  "tag": "v10.0",
  "installer_name": "ZZLUXORA-Setup-10.0.0.exe",
  "installer_size": 0,
  "installer_sha256": "<sha256>",
  "download_url": "https://github.com/zzdevxx/zzluxora/releases/download/v10.0/ZZLUXORA-Setup-10.0.0.exe",
  "released_at": "2026-11-26T00:00:00Z"
}
```

## 6. Non-Functional Requirements
- **Performance**: Zero framework bloat (HTML5 + CSS + Vanilla JS), ukuran aset halaman < 100 KB, semua path relatif (`./`) agar aman di-mount di `https://zzdree.my.id/zzluxora/`.
- **Compliance & Privacy**: Tidak menyimpan PII; preferensi simulator opsional hanya di `localStorage` browser pengguna. Tautan eksplisit ke `https://zzdree.my.id/privacy`, `https://zzdree.my.id/terms`, dan `https://zzdree.my.id/data-deletion`.
- **Anti-Slop**: Zero em dash, zero emoji di heading/chrome UI, 5-state interactive contract, `tabular-nums`, tanpa efek glow/gradien ungu-biru AI generik.
