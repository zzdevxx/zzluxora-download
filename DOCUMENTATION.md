# DOCUMENTATION: zzluxora-download

## Arsitektur Portal

`zzluxora-download` adalah situs statis murni (HTML5 + CSS + Vanilla JS) tanpa langkah build agar ringan, cepat, dan aman di-mount di bawah sub-path `https://zzdree.my.id/zzluxora/` melalui Cloudflare Worker reverse proxy pada `zzdree-web`, dengan origin GitHub Pages di `https://zzdevxx.github.io/zzluxora-download/`.

### Berkas Utama
- `index.html`: Struktur semantik lengkap (Hero Download, Fitur Inti, Simulator Interaktif Audio-Mood ke DMX512, Peta Ekosistem 4 Repo, Panduan Setup & Hardware, FAQ, Footer & Legal).
- `style.css`: Token desain "The Obsidian Control Deck" selaras dengan `zzluxora/DESIGN.md`, 5-state control contract, layout responsif 320px hingga 1440px+.
- `app.js`:
  - Implementasi persis pipeline `EmotionModel` & `ColorEngine` (`atan2(A, V)` -> HSV -> sRGB -> Physical RGBW `W = min(R,G,B)`).
  - Pemetaan layout kanal DMX nyata dari 5 profil `zz-fixture` (`zzdree-36X`, `Alien-AL36`, `Illumsolid-YSP01`, `Kumastb-STL47`, `Wisdom-54X3`).
  - Integrasi antarmuka simulator dengan kontrak metadata rilis di `release.js`.
- `release.js`: Kontrak resolver metadata rilis dari GitHub Releases API (`/repos/zzdevxx/zzluxora/releases/latest`) dan endpoint checksum Worker (`https://zzdree.my.id/zzluxora/sha256`) dengan fallback snapshot `v10.1` terverifikasi.
- `tests/`: Pengujian unit dan kontrak portal (`tests/portal.test.js`, `tests/release.test.js`) via `node --test tests/*.test.js`.

## Menjalankan Secara Lokal

```powershell
python -m http.server 8081
# Buka http://127.0.0.1:8081/
```

## Sinkronisasi Cloud (3 Remote)

```powershell
python D:\ANDREAS\PERSONAL\agent-memory\tools\sync_cloud.py zzluxora-download
```
