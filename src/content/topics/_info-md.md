---
title: "Guida: tipo md 📘"
type: "md"
menu: "Guide 📚"
index: 1
audio: true   # pulsante 🔊 in barra → TTS (oppure "/WebPages/…/x.mp3" per un mp3)
visible: false

# ═══════════════════════════════════════════════════════════════════
# TIPO "md": il body è Markdown, trasformato da marked + evidenziato
# ═══════════════════════════════════════════════════════════════════
# Frontmatter comune a TUTTI i tipi:
#   title     (richiesto) titolo nel menu e in barra
#   type      default "html" se omesso
#   menu      percorso cartelle nel menu: "Padre/Figlio 🦀"
#   index     ordinamento dentro la cartella (default 1)
#   visible   default true; false → bozza: nessuna pagina, nemmeno via URL
#   audio     true → pulsante 🔊 con TTS; "/WebPages/…/x.mp3" → pulsante 🔊 mp3
#
# Nel body (esempio vivo qui sotto):
#   Titoli con #, ##, ### …
#   **grassetto**, *corsivo*, `code`, [link](https://…)
#   Elenchi puntati e numerati, annidati
#   Citazioni con >
#   Formule KaTeX: inline $E=mc^2$ e centrate $$\int_0^1 x\,dx$$
#   Blocchi codice con fence e linguaggio (evidenziati)
#   Immagini ![descrizione](/WebPages/…/foto.png) → risolte da src/assets/WebPages
#   Tabelle con |
#   HTML inline ammesso (es. <span style="color:#e53935">…</span>)
# ═══════════════════════════════════════════════════════════════════
---

# Titolo di prova

Paragrafo con **grassetto**, *corsivo*, `inline code` e un [link](https://www.google.com).

## Elenchi

- primo punto
- secondo punto
  1. annidato numerato
  2. altro elemento

## Citazione

> Questo è un blocco citazione.

## Formule KaTeX

Inline: $e^{i\pi} + 1 = 0$ — centrata:

$$\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}$$

## Codice

```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

## Immagine da /WebPages

![moduli Rust](/WebPages/Rust/rust_mod.png)

## Tabella

| type | uso                     |
|------|-------------------------|
| md   | appunti in Markdown     |
| html | pagine HTML libere      |

<span style="color:#e53935"><strong>HTML inline</strong></span> ammesso anche nel body.
