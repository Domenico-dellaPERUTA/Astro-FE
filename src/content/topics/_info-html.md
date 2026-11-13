---
title: "Guida: tipo html 🧩"
type: "html"
menu: "Guide 📚"
index: 2
visible: false

# ═══════════════════════════════════════════════════════════════════
# TIPO "html": il body è HTML libero, avvolto in <div class="page">
# ═══════════════════════════════════════════════════════════════════
# Il body è sanificato con DOMPurify:
#   ✓ tag, classi, stili inline, immagini, liste, tabelle, SVG…
#   ✗ <script> e <style> vengono rimossi
#
# Percorsi asset:
#   src="/WebPages/…/foto.png" → risolto su src/assets/WebPages
#   src="WebPages/…" (senza barra) viene corretto automaticamente
#
# Formule KaTeX: NON supportate in questo tipo (usa "md" o "steps").
#
# Frontmatter audio:
#   audio: true       → pulsante 🔊 in barra con TTS
#   audio: "/x.mp3"   → pulsante 🔊 con l'mp3 indicato
# ═══════════════════════════════════════════════════════════════════
---

<h1>Esempio HTML</h1>
<p>Paragrafo con <strong>grassetto</strong>, <em>corsivo</em> e
<span style="color:#e53935"><strong>colore inline</strong></span>.</p>

<h2>Immagine da /WebPages</h2>
<img src="/WebPages/Rust/rust_mod2.png" alt="moduli Rust" style="max-width:70%">

<h2>Struttura</h2>
<ul>
  <li>Tag e attributi qualsiasi</li>
  <li>Stili inline ammessi</li>
</ul>

<h2>Blocco in evidenza</h2>
<blockquote>Il body viene avvolto in <code>&lt;div class="page"&gt;</code>,
che applica la tipografia standard del sito.</blockquote>
