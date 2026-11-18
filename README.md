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

### 2026-11-18 — 🌍 Mappa 3D della Terra nell'header

Nuova icona mappamondo nella barra superiore (nascosta solo in modalità phone)
che apre un globo interattivo a schermo intero, renderizzato con `three.js`
(già presente tra le dipendenze).

- **Texture**: Cross-blended Hypsometric Tints di Natural Earth (pubblico
  dominio): rilievo ombreggiato con colori altimetrici/climatici (pianure
  umide verdi, aree aride brune). Fiumi e laghi del dataset 1:50m Natural
  Earth sono stati rasterizzati nella texture (il raster HYP non li include),
  con i laghi sopra i fiumi. Convertita in WebP in `public/globe/` —
  8192×4096 per lo zoom ravvicinato (~1,7 MB) e 1024×512 per l'apertura
  immediata (~39 KB), caricata in modo progressivo. L'acqua è un tint piatto,
  senza batimetria. Aggiunto il MIME `image/webp` in `public/.htaccess`.
- **Interazione**: trascinamento col mouse per ruotare il globo attorno
  all'asse inclinato di 23,44° (con inerzia), rotella per lo zoom, doppio
  click o `0` per ripristinare la vista; frecce direzionali e pulsanti
  nord/sud/est/ovest, zoom +/-. Zoom massimo esteso fino a distanza 1,25;
  l'inclinazione verticale arriva fino a ±90°, così da poter guardare
  direttamente il polo nord e il polo sud. Supporto tastiera (`Esc`, frecce,
  `+`/`-`, `0`), focus trap e ripristino del focus alla chiusura.
- **Asse regolabile**: slider `Asse` nei controlli (−90°…+90°, iniziale
  23,44°) per inclinare l'asse terrestre; in alternativa `Shift` +
  trascinamento orizzontale sul globo. Il reset (`0`, doppio click o pulsante)
  riporta l'inclinazione a 23,44°. Lo slider è incluso nel focus trap e, quando
  è focalizzato, le frecce ne regolano il valore invece di ruotare il globo.
- **Scena**: graticola di meridiani e paralleli ogni 10° (linee ogni 30° più
  marcate), atmosfera con shader, campo stellato, asse e anello meridiano,
  rotazione automatica dopo 4,5 s di inattività (disattivata con
  `prefers-reduced-motion`), stati di caricamento/errore con "Riprova".
- **Bundle**: `EarthGlobe.vue` caricato con `defineAsyncComponent` e
  precaricato su hover/focus dell'icona, così three.js resta fuori dal
  bundle iniziale. La mappa si chiude al cambio di rotta.

### 2026-11-17 — 🅰 Menu Angular: revisione completa contro Angular v22

Rilettura dei 15 documenti `angular-*.md` del menu (todo "Progetto semplice"
escluso, vedi nota) confrontati con angular.dev (v22.2.6 attuale): correzione
di refusi ed errori fattuali + sezioni "Nelle versioni recenti" su standalone,
control flow e signal.

- **Errori corretti**: la direttiva è `NgModel` (era "ngModule"), titolo
  "Reactive form" (era "React form"), pipe `date` (era "data") con formati
  `'short'/'medium'/'shortTime'/'yyyy'` ed esempio number corretto (10.09654 →
  "010.10"), `@NgModule` e "app.module.ts" (erano "@ngModule" e
  "app-module.js") in Routing, link ciclo di vita →
  `angular.dev/guide/components/lifecycle` (angular.io era morto), immagine
  rotta `direttida_nuovo_input.png` → `direttiva_nuovo_input.png`, link Angular
  Material → `material.angular.dev`, esempio `<ng-template *ngIf>` sbagliato
  (ora mostra il ramo `else` con `#nomeBlocco`), immagini duplicate in
  Routing/Direttive, refusi vari ("cartella di srv" → `src`, "node_module",
  "il tools", "buit-in", "una una", "datti", "ver visualizzare",
  "React form", "gerarchica", "onRicevidati"...).
- **Aggiornamenti v17-v22**: sezioni "Nelle versioni recenti" in 13 pagine —
  componenti standalone di default (v19) e file senza suffisso `.component`
  (v20: `app.ts/app.html/app.css/app.config.ts`), control flow `@if/@else/@for`
  (v17), `input()/output()/model()/viewChild()` al posto dei decoratori,
  `provideRouter` + guard funzionali `CanActivateFn`, `provideHttpClient` +
  interceptor funzionali `HttpInterceptorFn` (+ `httpResource`), `inject()` e
  opzione `host` al posto di `@HostListener`, Signal Forms (v21) con
  `form()`/`[formField]`/schema, Angular Aria (v21), zoneless + Vitest;
  Introduzione aggiornata su `ng new` (Routing incluso di default, domanda
  SSR, Node.js 22+).
- **Fatti verificati su angular.dev**: `/installation`, `/cli/new`,
  `/cli/generate/component`, guide `/guide/forms`, `/essentials/signal-forms`,
  `/guide/components`, eventi v21/v22.
- **Nota**: `angular-progetto-semplice.md` (tipo "steps" con clip TTS
  sincronizzate ai testi) lasciato com'è — aggiornarlo richiederebbe
  rigenerare le narrazioni.
- **Contenuti gitignored**: modifiche solo in `src/content/topics/*.md`
  (nessun commit dei contenuti).

### 2026-11-16 — ♟️ Le linee principali delle aperture: 24 nuove pagine

Una pagina per linea principale (PGN commentato mossa per mossa + clip TTS
condivise): 7 Aperte (due cavalli, pianissimo, russa, berlinese, Marshall,
scambio, scozzese), 10 Semi-Aperte (drago, sveshnikov, scandinava, pirc,
winawer, tarrasch, francese di scambio, avanzamento, panov, karpov), 6 Chiuse
(est-indiana Mar del Plata, nimzo Rubinstein, grunfeld di scambio, slava,
gambetto di donna accettato, olandese Leningrado) e 1 di Fianco (inglese
simmetrica).

- **Contenuti**: `src/content/topics/apertura-*.md` — stesso schema
  `type: "chess"` + PGN commentato delle trappole; testi TTS-safe (niente
  doppi apici, niente pattern cifra+punto, "scambia/cattura" al posto di
  "cambio").
- **Condivisione clip**: le chiavi coincidenti con le 25 pagine esistenti
  riusano il testo CANON di `manifest.json` (swap automatico, vince il CANON);
  le 315 chiavi nuove sono generate con la pipeline kokoro → 682 clip totali
  in `src/assets/WebPages/Chess`.
- **Validazione**: ogni PGN verificato mossa per mossa con chess.js
  (arrocco vietato se il Cavallo g8 non si è mai mosso, inchiodature,
  case occupate); il manifest rigenerato segnala 0 conflitti.

### 2026-11-16 — ♟️ Commento per mossa nelle pagine scacchi

Ogni mossa delle pagine `type: "chess"` può ora avere un commento che ne spiega
scopo, piano o errore (es. `f6? {Errore grave: indebolisce la diagonale h5-e8…}`).

#### Come funziona
- **Testi**: commenti PGN standard `{…}` inline nel campo `pgn` del frontmatter
  (formato scacchistico universale, nessun campo nuovo). chess.js 1.4 li
  interpreta nativamente e li mappa sulla posizione esatta dopo la mossa.
- **UI**: navigando con le frecce, sotto la scacchiera appare la legenda con la
  mossa (`9. Bxb7`) e il suo commento; a posizione iniziale e pagine senza
  commenti resta tutto pulito. I glifi `!`/`?`/`??` sulla scacchiera sono stati
  ripristinati dopo l'introduzione dei commenti (la regex che li estrae ora
  ignora il contenuto delle graffe).
- **Audio 🔊** (libreria condivisa): navigando su una mossa viene riprodotta in
  auto-play la clip di `src/assets/WebPages/Chess/<chiave>.mp3`, dove la chiave
  è la sequenza SAN della partita fino a quella mossa senza glifi, unita da `_`
  (es. `e4_e5_Nf3_f6.mp3`). Le partite che condividono l'apertura riusano le
  stesse clip: una sola registrazione per "1. e4" vale per tutte le pagine.
  La build risolve gli URL hashate di Vite tramite la mappa `chessAudio` nel
  pageData (bridge in `[...slug].astro`): clip assente → silenzio, zero
  richieste. Dopo ogni aggiunta/rimozione di clip serve `npm run build`.
- **Pipeline TTS**: `node scripts/chess-audio.mjs` scandisce tutte le pagine
  chess, valida i PGN e scrive `src/assets/WebPages/Chess/manifest.json`
  (chiave → testo da narrare) per il generatore di clip; segnala i conflitti
  (stessa sequenza con testi diversi nelle varie pagine).

#### File
- **`src/components/UI/ChessBoard.vue`**: estrazione commenti (`getComments()`,
  mappati sul FEN `after`), hardening di `italianToEnglish` (non tocca più il
  contenuto dei commenti `{…}`: "La Torre" resterebbe corrotto dalla
  conversione notazione italiana), sync su store (commento, etichetta, chiave).
- **`src/components/UI/TopicPage.vue`**: legenda sotto la scacchiera, auto-play
  clip con cache delle mancanti, `stopStepAudio()` all'unmount (fix: l'audio
  steps/chess continuava a suonare uscendo dalla pagina).
- **`src/store/page.ts`**: `chessComment`, `chessMoveLabel`, `chessAudioKey`,
  `chessAudio` (mappa chiave → URL della clip, popolata dal pageData).
- **`scripts/chess-audio.mjs`** (nuovo) e **`trappola-damiano.md`**: tutti e 19
  i commenti scritti e verificati mossa per mossa con chess.js (incluso il
  matto finale: `Kg7` è bloccato dal proprio pedone, `Kxf5` vietato per il
  pedone e4).
- **Testi di tutte le 25 pagine ♟️**: ogni mossa di ogni partita (237+ mosse)
  ha ora un commento che spiega scopo, piano o errore — scritti dopo
  verifica col motore (mattoni confermati, valutazioni materiali, sicurezza
  delle caselle). Le 27 chiavi condivise tra partite diverse usano testi
  byte-identici: il manifest segna 367 clip uniche e nessun conflitto.
  Convenzione TTS-friendly dei testi: niente virgolette doppie, niente
  pattern cifra+punto (romperebbe la regex del parser PGN), una o due frasi
  brevi per clip.
- **Clip generate 🔊**: le 367 clip sono prodotte con kokoro (voce if_sara,
  `genera_clip.py` del progetto kokoro-tts) dal file `testi-chess.md`
  (derivato dal manifest): sintesi frase per frase con 0,42 s di silenzio tra
  le frasi, MP3 128 kbps in `src/assets/WebPages/Chess/`. Dopo ogni
  rigenerazione di clip serve `npm run build` (gli URL hashate cambiano).

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

### 2026-11-15 — Ottimizzazioni bundle e UI

#### Caricamento lazy della pipeline markdown e KaTeX
Monaco era già caricato on-demand (solo pagine `code`/`dictionary`); il collo
rimasto era `marked` + `highlight.js` (~1 MB) e **KaTeX** (~260 KB) che viaggiavano
in ogni pagina dentro i chunk condivisi.

- **`src/utils/cleanCode.ts`** (nuovo): `cleanCode`/`escapeHtml` pure, senza dipendenze,
  importabili subito anche dove la pipeline completa va caricata lazy.
- **`src/components/UI/TopicPage.vue`**: `renderMarkdown` (marked+KaTeX+hljs) e
  `renderMathInElement` (auto-render KaTeX) ora via `import()` dinamico — solo le
  pagine `md` scaricano la pipeline markdown, solo le `steps` l'auto-render.
- Risultato: le pagine non-md/non-code (chess, carousel, video…) avviano l'app con
  ~904 KB di JS invece di ~2.150 KB (−58%, minificato non compresso).

#### Pulsanti disabilitati
- **`src/components/UI/ActionButton.vue`**: i pulsanti disabilitati non hanno più
  lo sfondo grigio chiaro (`#f2f2f2`): sfondo trasparente come i normali.
- **`src/components/UI/HeaderBar.vue`**: l'icona dei disabilitati è grigio molto
  scuro (`#475569`), quasi invisibile: lo stato si intende senza rumore visivo.

#### Pagine utilitarie noindex
- **`src/layouts/Layout.astro`**: nuovo prop `noindex` → `<meta name="robots"
  content="noindex, nofollow">`.
- **`latex-editor` / `markdown-editor`**: `noindex` in head ed escluse dalla
  sitemap (filtro in `astro.config.mjs`): 293 URL nella sitemap (prima 295).
- Non disallow su robots.txt: il noindex deve poter essere letto dal crawler.

#### Font self-hosted
- JetBrains Mono (400–700, woff2 latin + latin-ext) in `public/fonts/` con
  `@font-face` in `global.css`: eliminato il link a `fonts.googleapis.com`
  (zero richieste a CDN esterni per i font, un round-trip in meno a pagina).
- Gli altri font del tema erano già self-hosted in `public/fonts/`.
