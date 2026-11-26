# ZZLUXORA Download Portal

Portal unduhan resmi, simulator browser Audio-Mood ke DMX512, dan pusat navigasi ekosistem 4 repositori [ZZLUXORA](https://github.com/zzdevxx/zzluxora).

Tampilan mengikuti arah Obsidian Control Deck yang dipulihkan sesuai keputusan pemilik: sans biasa, emerald untuk unduh dan PLAY, amber untuk versi dan master, cyan untuk telemetry, serta red untuk blackout. Keputusan pemilik atas palet lama ini berlaku sebagai user override dan mengalahkan tampilan katalog NeedMCP `ruled-foundry`, yang dipakai hanya sebagai referensi mekanika. Detail ada di [DESIGN.md](./DESIGN.md).

- Portal utama: [https://zzdree.my.id/zzluxora/](https://zzdree.my.id/zzluxora/)
- Origin GitHub Pages: [https://zzdevxx.github.io/zzluxora-download/](https://zzdevxx.github.io/zzluxora-download/)
- Hub portofolio: [https://zzdree.my.id/](https://zzdree.my.id/)

## Ekosistem Terhubung

| Komponen | Repositori | Peran |
|---|---|---|
| Software Konsol | [`zzdevxx/zzluxora`](https://github.com/zzdevxx/zzluxora) | Konsol desktop PySide6 + NumPy STFT/MIR, Art-Net 4 UDP :6454, rilis publik v10.1 |
| Hardware Node | [`zzdevxx/esp32-artnet-dmx`](https://github.com/zzdevxx/esp32-artnet-dmx) | Firmware ESP32 v5.2.0 + MAX485 + LCD 16x2 I2C |
| Profil Fixture | [`zzdevxx/zz-fixture`](https://github.com/zzdevxx/zz-fixture) | 5 profil fixture `.qxf` QLC+ v4.14.4 (`zzdree-36X`, `Alien-AL36`, `Illumsolid-YSP01`, `Kumastb-STL47`, `Wisdom-54X3`) |
| Naskah & Riset | [`zzdevxx/zzluxora-thesis`](https://github.com/zzdevxx/zzluxora-thesis) | Skripsi S1 Teknik Komputer FT UNNES, pemodelan matematis & uji panggung |

## Menjalankan Lokal

```powershell
python -m http.server 8081
# Buka http://127.0.0.1:8081/
```

## Lisensi

Apache License 2.0 (C) 2026 Andreas Restuawanta Christwara ([@zzdevxx](https://github.com/zzdevxx)).
