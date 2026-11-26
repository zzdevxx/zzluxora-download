# DESIGN DIRECTION: ZZLUXORA DOWNLOAD PORTAL

> Direction: Obsidian Control Deck, restored from the initial portal and polished for current v10.1 metadata.
> Owner decision: initial web direction wins over the later editorial redesign.
> Dial: ENERGY 2 / RHYTHM 2 / MOTION 1
> Filter: Bahasa Indonesia, tanpa em dash, tanpa emoji, tanpa angka hasil pengukuran yang belum diukur.

---

## 1. Keputusan Desain

- Portal kembali ke identitas Obsidian Control Deck: permukaan grafit biru tua, panel konsol, status LED, telemetry panel, kartu arsitektur, dan console simulator yang padat.
- Tipografi memakai sans biasa, bukan heading condensed besar. Skala hero berada di kisaran 2.2 rem sampai 3.5 rem agar ajakan unduh tetap terlihat di layar desktop dan Android.
- Warna bersifat fungsional: emerald untuk unduh dan PLAY, amber untuk versi, master dimmer, dan segmen aktif, cyan untuk telemetry dan kanal DMX, red untuk blackout.
- Hero memuat status rilis, judul, lead, dua ajakan, dan panel telemetry empat sel. Panel telemetry hanya memakai konstanta teknis yang dapat dibaca dari source code.
- Arsitektur, ekosistem, dan distribusi memakai kartu konsol yang berisi peran, metadata pendukung, dan tautan eksplisit. Tidak ada numbered ruled rows gaya editorial.
- Simulator mempertahankan komposisi compact original: kontrol di kiri, Russell 2D dan rig di kanan, channel strip di bawah.
- Palet Obsidian Control Deck adalah user override eksplisit dari pemilik dan menjadi source of truth tampilan. NeedMCP `ruled-foundry` tetap tercatat sebagai referensi mekanika, bukan penampilan. Arah pemilik menggantikan palet biru, kertas, dan tipografi Archivo dari katalog.
- Tidak ada grid dekoratif seluruh halaman, terminal palsu, blurred glow, gradient ungu-biru, atau glassmorphism bertumpuk.

---

## 2. Token Visual

| Peran | Nilai | Pemakaian |
|---|---|---|
| Canvas | `#101319` | Latar dasar Obsidian |
| Trough | `#14161a` | Header, section alternatif, feed |
| Root | `#1e2024` | Permukaan kartu dan panel |
| Surface | `#242830` | Header panel, status pill, console bar |
| Elevated | `#2d323c` | Hover dan permukaan sekunder |
| Border | `#333844`, `#4a5264` | Garis 1 px dan separator |
| Teks | `#f8fafc`, `#cbd5e1`, `#9aa8bb` | Primer, sekunder, pendukung |
| Emerald | `#16a34a`, `#22c55e` | Aksen non-teks, LED, border kartu |
| Emerald action | `#15803d`, `#166534`, `#14532d` | Latar default, hover, active untuk unduh, PLAY, dan skip-link |
| Amber | `#f59e0b`, `#fcd34d` | Versi, grand master, preset aktif |
| Cyan | `#06b6d4`, `#67e8f9` | Telemetry, kanal DMX, tautan kode |
| Red | `#dc2626`, `#fca5a5` | Blackout |

`.needmcp/state.json` menyimpan penimpa arah desain `obsidian-control-deck`. Mekanika katalog yang dipertahankan hanya garis tajam, target 44 px, lima state interaktif, dan kontras WCAG 2.2 AA.

---

## 3. Tipografi dan Ritme

- Sans: `"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`.
- Mono: `"Cascadia Mono", "JetBrains Mono", Consolas, monospace` untuk data teknis dan kode.
- Hero: `clamp(2.2rem, 3.5vw, 3.5rem)`, berat 800, line-height 1.12, `text-wrap: balance`.
- Section title: `clamp(22px, 2.8vw, 30px)`.
- Body: 14 sampai 15 px, line-height 1.55, panjang baris dibatasi sekitar 60 sampai 65 karakter.
- Angka DMX, ukuran berkas, versi, SHA-256, dan koordinat V-A memakai `tabular-nums` serta `overflow-wrap: anywhere` bila panjang.

---

## 4. Interaksi dan Aksesibilitas

- Setiap tombol, tautan aksi, tab, input, select, dan slider memiliki lima state: default, hover, focus-visible, active, disabled.
- Teks `#f8fafc` pada latar aksi green diukur dengan `contrast-check.py`: `#15803d` 4.79:1, `#166534` 6.81:1, `#14532d` 8.71:1. Tiga nilai ini dipakai berturut-turut untuk default, hover, dan active.
- Tombol danger memakai teks merah muda `#fca5a5` pada `#3b1818` 8.32:1. State hover memakai teks `#f8fafc` pada `#dc2626` 4.62:1 dan state active 7.94:1 pada `#991b1b`. Tinta gelap `#1a0808` pada `#dc2626` hanya 4.02:1 sehingga tidak dipakai.
- Tidak ada `overflow-x: hidden` global. Overflow dibatasi hanya pada panel dan grafik yang memang perlu, seperti `.va-plane`, `.console-shell`, `.telemetry-panel`, dan `.dmx-bar`.
- Status rilis memakai border 1 px biasa, bukan stripe kiri 3 px.
- Fokus keyboard memakai outline cyan 2 px dengan offset 2 px. Fokus pada FAQ memakai offset negatif agar tidak terpotong oleh border item.
- Target interaktif minimal 44 px, termasuk nav-link, tombol menu, preset, copy button, dan tautan footer.
- Menu mobile memakai tombol dengan label terlihat `Menu`, `aria-expanded`, `aria-controls`, close saat tautan diklik, close saat Escape, close saat klik di luar header, dan reset saat viewport kembali ke desktop.
- Tautan navigasi tetap terlihat saat JavaScript tidak berjalan; mode menu aktif hanya setelah listener siap.
- `skip-link` tersedia di awal dokumen.
- Status metadata dan status simulator memakai `role="status"` dan `aria-live="polite"`.
- `prefers-reduced-motion` menonaktifkan transisi dan scroll halus.

---

## 5. Responsivitas

- Desktop, lebih dari 1120 px: nav penuh, hero dua kolom, tiga kolom kartu, console dua kolom, delapan kanal DMX per baris.
- Tablet, 721 sampai 1120 px: nav berubah menjadi menu `Menu`, kartu tiga kolom menjadi dua kolom, kanal DMX empat per baris.
- Tablet kecil, 721 sampai 900 px: hero dan console body menjadi satu kolom, header menyembunyikan tautan ghost.
- Android dan phone, sampai 720 px: satu kolom untuk hero, kartu, dan stage grid; dua kolom untuk rig dan metrics; header menyimpan brand dan tombol Menu.
- Phone sempit, sampai 480 px: aksi hero penuh lebar, preset dua kolom, kanal DMX dua per baris, checksum dan baris metadata menjadi satu kolom.
- Phone sangat sempit, sampai 360 px: metrics satu kolom dan hero turun ke 2.1 rem.
- `body` memakai `min-height: 100svh`, bukan `100vh`, agar tinggi minimum stabil saat chrome browser mobile muncul atau hilang. Ini hanya menetapkan tinggi minimum dokumen, bukan hero layar penuh.
- Tidak ada teks atau kontrol yang terpotong. Panel menu hanya bersifat scrollable bila tinggi menu melebihi tinggi layar yang tersedia.
- Heading panjang dan nama repositori dapat membungkus pada pembesaran teks 200%. Baris salin kode kembali mengikuti tinggi konten ketika tersusun vertikal di HP.

---

## 6. Kontrak Konten dan Metadata

- Rilis publik yang diiklankan adalah `v10.1`, berkas `ZZLUXORA-Setup-10.1.0.exe`, `80544241` byte, SHA-256 `03fdef2953395d1713a3b0c45b6d186b91342693981565dce67ad474611f3508`.
- Portal menyediakan dua tautan eksplisit: halaman GitHub Release dan direct download same-origin.
- Metadata GitHub API tetap divalidasi sebelum dianggap cocok dengan snapshot. Checksum tidak boleh mengklaim verifikasi bila tidak tersedia, tidak valid, atau berasal dari URL di luar daftar izin.
- Status loading, fallback, kegagalan, dan keberhasilan ditampilkan dalam teks yang dapat dibaca pembaca layar.
- Aset statis memakai query version `?v=20261126-console` agar proxy yang masih menyimpan `style.css`, `app.js`, dan `release.js` lama tidak menyajikan tampilan campuran.
- Semua path tetap relatif same-origin (`./`).

---

## 7. Klaim yang Dihapus

- Tidak ada angka `197 test`, angka test lain, atau klaim cold launch di bawah 500 ms.
- Tidak ada angka FPS, latency, atau hasil pengukuran performa pada portal.
- Tidak ada teks `ART-NET STREAMING` atau klaim pengiriman UDP dari simulator browser.
- Versi yang tampil hanya berasal dari asset rilis yang sudah tersedia atau snapshot fallback terverifikasi.

---

## 8. Verifikasi

- `node --check app.js`, `node --check release.js`, dan `node --check` untuk kedua file test.
- `node --test tests/release.test.js` menguji fallback publik, race metadata, allowlist URL, dan checksum.
- `node --test tests/portal.test.js` menguji anchor, tautan legal, larangan klaim usang, kontrak antarmuka, arah desain restorasi, menu mobile, path aset terversion, kontras aksi, dan larangan overflow global.
- `python <skills>/antislop-human/contrast-check.py` dipakai untuk mengukur setiap pasangan warna teks dan latar pada kontrol interaktif.
- Pemeriksaan render 390 px dan 1440 px dilakukan oleh parent sebelum rilis.
