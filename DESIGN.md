# DESIGN DIRECTION: ZZLUXORA DOWNLOAD PORTAL

> Direction: Obsidian Control Deck untuk portal unduhan ZZLUXORA, diturunkan dari rujukan visual yang diberikan pemilik.
> Dial: ENERGY 2 / RHYTHM 2 / MOTION 1
> Rujukan: `D:\ANDREAS\.playwright-mcp\openhop-reference.png`
> Filter: antislop, Bahasa Indonesia, tanpa em dash, tanpa emoji, tanpa angka hasil pengukuran yang belum diukur.

---

## 1. Keputusan Desain Turunan Rujukan

- Permukaan utama memakai grafit gelap, bukan latar kream dari usulan sebelumnya.
- Heading memakai keluarga condensed tebal (`Barlow Condensed` dengan fallback sistem), berwarna putih kehangatan kertas.
- Aksi primer dan penanda rilis memakai amber. Hijau, merah, dan cyan hanya dipakai sebagai warna fungsional simulator, bukan dekorasi.
- Hero bersifat left aligned: judul dan ajakan di kiri, diagram Russell 2D serta telemetri HSV/RGBW yang benar-benar bergerak di kanan.
- Strip data ringkas berada langsung di bawah hero untuk memuat fakta teknis yang dapat diverifikasi dari source code.
- Tidak ada grid dekoratif seluruh halaman, terminal palsu, blurred glow, atau kartu kaca bertumpuk.
- Struktur laman, anchor, simulator, alur unduh, empat tautan ekosistem, dan tautan legal dipertahankan.

## 2. Token Visual

| Peran | Nilai | Pemakaian |
|---|---|---|
| Canvas | `#080909` | Latar dasar dan area gelap |
| Panel | `#0f1112`, `#1a1d1e`, `#222627` | Permukaan bertingkat |
| Border | `#2c3132`, `#454d4e` | Garis 1 px dan separator |
| Teks | `#f4f0e6`, `#d5d1c7`, `#aaa79f` | Primer, sekunder, pendukung |
| Amber | `#ffc43d` | Aksi primer, fokus, angka penting |
| Fungsional | `#55d98a`, `#ff7a7a`, `#73e0f0` | Simulator play, blackout, kanal DMX |

NeedMCP state di portal mencatat `ruled-foundry` sebagai sumber mechanics komponen. Mekanika itu dipakai sebatas garis tajam, target 44 px, lima state, dan kontras. Warna default NeedMCP biru atau kertas tidak dipakai karena bertentangan dengan arahan pemilik.

---

## 3. Tipografi dan Ritme

- Heading: `Barlow Condensed`, `Roboto Condensed`, `Arial Narrow`, lalu sans-serif sistem.
- Body: `Inter`, `Segoe UI`, lalu sans-serif sistem.
- Data: monospace dengan `font-variant-numeric: tabular-nums`.
- Skala ritme: eyebrow kecil, heading besar padat, paragraf 15-17 px, label teknis 10-12 px.
- Angka DMX, persentase, ukuran berkas, koordinat V-A, dan SHA-256 memakai tabular numerals.

---

## 4. Interaksi dan Aksesibilitas

- Setiap tombol, tautan aksi, tab, input, select, dan slider memiliki lima state: default, hover, focus-visible, active, disabled.
- Fokus keyboard memakai outline amber 2 px dengan offset 3 px.
- Target interaktif minimal 44 px.
- `skip-link` tersedia di awal dokumen.
- Teks status metadata memakai `role="status"` dan `aria-live="polite"`.
- `prefers-reduced-motion` menonaktifkan transisi dan scroll halus.

---

## 5. Kontrak Konten dan Metadata

- Rilis publik yang diiklankan adalah `v10.1`, berkas `ZZLUXORA-Setup-10.1.0.exe`, `80544241` byte, SHA-256 `03fdef2953395d1713a3b0c45b6d186b91342693981565dce67ad474611f3508`.
- Snapshot fallback mengikuti asset v10.1 yang sudah dipublikasikan. Metadata GitHub API tetap divalidasi sebelum dianggap cocok.
- Portal menyediakan dua tautan eksplisit: halaman GitHub Release dan direct download same-origin.
- Metadata loading, kegagalan, dan fallback ditampilkan dalam teks yang dapat dibaca pembaca layar.
- URL aset divalidasi terhadap owner dan repo `zzdevxx/zzluxora`, tag tepat, nama berkas tepat, dan digest SHA-256 yang sah.
- Jika checksum tidak tersedia, tidak cocok, atau URL aset di luar daftar izin, portal tidak boleh mengklaim verifikasi.

---

## 6. Klaim yang Dihapus

- Tidak ada angka `197 test` atau rincian jumlah tes pada portal.
- Tidak ada klaim cold launch di bawah 500 ms.
- Tidak ada teks `ART-NET STREAMING` pada simulator browser.
- Versi yang tampil hanya berasal dari asset rilis yang sudah tersedia atau snapshot fallback terverifikasi.

---

## 7. Verifikasi

- `node --test tests/release.test.js` menguji fallback publik, race metadata, allowlist URL, dan checksum.
- `node --test tests/portal.test.js` menguji anchor, tautan legal, larangan klaim usang, dan kontrak antarmuka.
- Pemeriksaan render penuh dilakukan oleh pemilik setelah perubahan portal selesai.
