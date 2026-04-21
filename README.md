# Appunti & Note

Sito web personale per annotare, organizzare e condividere ciò che impari.

## Tech Stack
- Astro + Vue.js
- TailwindCSS
- Monaco Editor (syntax highlighting)
- chess.js (scacchi)
- Nanostores (state management)

## Funzionalità

### Tipi di contenuto supportati
- **html** - Pagine con testo, immagini e link
- **code** - Codice sorgente con syntax highlighting (Monaco Editor)
- **carousel** - Gallerie di immagini con audio
- **dictionary** - Dizionari con trascrizione fonetica
- **chess** - Scacchiere interattive
- **home** - Pagina home personalizzata

### Organizzazione contenuti
- Menu gerarchico a cartelle (struttura nidificata)
- Ordinamento personalizzato degli elementi
- Layout responsivo (desktop/tablet/phone)

## Struttura
```
src/
├── content/topics/    # Contenuti (file .md)
├── assets/WebPages/  # Immagini, video, audio
├── components/       # Componenti Vue
├── store/            # State management (nanostores)
└── utils/            # Utility (buildMenuTree)
```

### Media
Immagini, video e audio vanno inseriti in `src/assets/WebPages/`. I riferimenti nei file markdown sono relativi a questa cartella (es. `/WebPages/immagini/foto.png`).

## Aggiungere nuovi appunti
Creare un file `.md` in `src/content/topics/` con frontmatter:
```yaml
---
title: "Titolo"
type: "html"        # html|code|carousel|dictionary|chess
menu: "Categoria/Sottocategoria"
index: 1
---
```

## Comandi
```bash
npm install
npm run dev      # Server sviluppo (localhost:4321)
npm run build    # Build produzione
npm run preview  # Preview build
```
