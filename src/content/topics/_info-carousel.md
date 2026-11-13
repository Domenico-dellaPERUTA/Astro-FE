---
title: "Guida: tipo carousel 🖼️"
type: "carousel"
menu: "Guide 📚"
index: 4
visible: false

# ═══════════════════════════════════════════════════════════════════
# TIPO "carousel": slide di immagini con audio opzionale
# ═══════════════════════════════════════════════════════════════════
# Frontmatter `images`: ogni voce può essere
#
#   - "/WebPages/…/foto.png"                    stringa semplice
#   - image + title + text                      oggetto completo
#
#   title/text → mostrati nel dialog ℹ della barra superiore
#
# AUDIO automatico: se accanto all'immagine esiste un mp3 con lo
# STESSO nome (foto.png → foto.mp3), sotto l'immagine compare il
# player ⏵ (es. Inglese/a.jpg → Inglese/a.mp3).
#
# Il body del file è ignorato: tutto vive nel frontmatter.
# Navigazione: frecce laterali ← →, swipe, o chevron della barra.
# ═══════════════════════════════════════════════════════════════════

images:
  - image: "/WebPages/Rust/cargo-new.png"
    title: "cargo new"
    text: "Crea un nuovo progetto Rust: package Cargo.toml + src/main.rs."
  - image: "/WebPages/Rust/cargo-build.png"
    title: "cargo build"
    text: "Compila il progetto nella cartella target/."
  - "/WebPages/Rust/rust_mod.png"
---
