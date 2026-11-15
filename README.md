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

## Changelog

### 2026-11-15 — SSR del contenuto (underlay statico) + SEO

#### SSR underlay (pre-rendering statico alla build)
Il contenuto delle pagine md / code / html viene ora renderizzato in HTML alla build
e inserito come strato statico (`ssr-underlay`) visibile al primo paint: i crawler
e gli utenti senza JavaScript leggono il contenuto completo, e il LCP migliora.
Quando l'app Vue idrata, lo strato si nasconde (`display: none`) e l'app subentra.

- **`src/utils/renderMarkdown.ts`** (nuovo): pipeline markdown condivisa tra browser
  e build (marked + marked-katex-extension + renderer hljs + `cleanCode` + `escapeHtml`
  + `sanitizePageHtml`). Prima era duplicata in `TopicPage.vue`; ora build e app
  producono HTML identico.
- **`src/utils/katexSanitize.ts`**: import DOMPurify → `isomorphic-dompurify`
  (lo stesso sanitizzatore funziona in Node alla build). Installato il pacchetto.
- **`src/components/UI/TopicPage.vue`**: rimossa la pipeline markdown locale
  (marked/hljs/Renderer/markedKatex, `sanitizeMarkdown`, `cleanCode`); usa
  `renderMarkdown` e `cleanCode` dal modulo condiviso. Invariati `sanitizeKatexHtml`
  e `renderMathInElement` (tipo "steps").
- **`src/pages/topic/[...slug].astro`**: aggiunto `underlay` per tipo pagina —
  `md` → `<div class="md">` + renderMarkdown, `html` → correzione src + wrapper
  `<div class="page">` + DOMPurify default, `code` → `<pre class="ssr-pre"><code>`
  statico (Monaco subentra all'idratazione). Aggiunto `<noscript><nav class="ssr-menu">`
  con l'albero del menu (buildMenuTree) per navigazione senza JS.
- **`src/layouts/Layout.astro`**: `<noscript><style>` che nasconde `#global-page-loader`
  quando JavaScript è disattivato (il loader verrebbe mai rimosso dall'app).
- **`src/styles/page.css`**: stili `.ssr-underlay` (fixed, z-index 99998, sotto il
  loader globale 99999), `.ssr-pre` (monospace, sfondo vs-dark come Monaco),
  `.ssr-menu`; regola di passaggio di consegne `.app-hydrated .ssr-underlay { display: none }`.
- **`src/components/UI/FlexibleLayout.vue`**: in `onMounted` aggiunge la classe
  `app-hydrated` a `document.documentElement` (nasconde l'underlay).

#### SEO
- **`src/layouts/Layout.astro`**: `lang="it"`, meta description/keywords, canonical
  (richiede `site` in config), Open Graph e Twitter Card.
- **`astro.config.mjs`**: `site` da variabile `SITE` (`.env`, gitignored) + `@astrojs/sitemap`.
- **`public/robots.txt`**: sitemap abilitata.
- **`src/pages/topic/[...slug].astro`**: JSON-LD TechArticle + BreadcrumbList,
  description di fallback automatica (testo pulito per i md, titolo + sezione per gli altri).
- **`src/content/topics/*.md`**: `description` (100–160 caratteri) e `keywords`
  (4–8 termini) aggiunte a tutte le 292 pagine; sistemato delimitatore frontmatter
  malformato in `software-sviluppo.md`.
- Nota: Google ignora `meta keywords`; restano utili per motori minori e JSON-LD.

#### Contenuti
- Nuovi corsi: React (10 lezioni), Vue (10), Svelte (10) di tipo `code` + 3 introduzioni
  `md`, con relative clip audio 🔊.
- `matematica-probabilità-teoria.md`: ultime 5 sezioni completate (compatibilità,
  condizionata, probabilità totali, Bayes, eventi indipendenti); fix formule inline
  (`;` dopo `$` di chiusura non è accettato da KaTeX).
- Build: 295 pagine.
