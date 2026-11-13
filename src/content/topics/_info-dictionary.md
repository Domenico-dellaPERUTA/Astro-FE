---
title: "Guida: tipo dictionary 📖"
type: "dictionary"
menu: "Guide 📚"
index: 6
visible: false

# ═══════════════════════════════════════════════════════════════════
# TIPO "dictionary": schede Lessico/Concetti con barra di ricerca
# ═══════════════════════════════════════════════════════════════════
# Frontmatter `dictionary`: lista di schede
#
#   item             parola/termine (richiesto)
#   description      definizione breve (richiesta)
#   type             categoria → colore del titolo nella scheda
#   fonetic          trascrizione fonetica (facoltativa)
#   path             sottocartella di /WebPages per gli asset:
#                    immagini <item>.jpg/.png e audio <item>.mp3
#                    (riprodotti automaticamente all'apertura)
#   synonyms         sinonimi (facoltativo)
#   opposites        opposti (facoltativo)
#   note             nota libera (facoltativa)
#   codeView         anteprima HTML (facoltativa)
#   codeDescription  snippet mostrato nell'editor Monaco
#
# La ricerca filtra su item + description. Il body è ignorato.
# ═══════════════════════════════════════════════════════════════════

dictionary:
  - item: "I'll"
    description: "Contrazione di I will / I shall: futuro o intenzione."
    type: "inglese"
    fonetic: "/aɪl/"
    path: "Inglese/"
    note: "L'immagine e l'audio vengono presi da /WebPages/Inglese/I'll.*"

  - item: "Cargo"
    description: "Build system e package manager di Rust."
    type: "rust"
    synonyms: "build tool, package manager"
    note: "Comandi tipici: new, build, run, test."
    codeDescription: |
      cargo new progetto   # crea progetto + Cargo.toml
      cargo run            # compila e esegue
      cargo test           # esegue i test
---
