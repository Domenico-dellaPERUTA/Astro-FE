<template>
  <div class="md-app">
    <!-- TOP HEADER -->
    <header class="md-header">
      <div class="header-left">
        <a href="/" class="header-btn" title="Torna alla Home del Blog">
          <Home class="icon" />
          <span class="btn-text">Home</span>
        </a>

        <div class="brand">
          <div class="brand-title">
            <span class="md-logo">MD<span class="down">↓</span></span>
            <span class="brand-name">Editor Online</span>
          </div>
          <span class="badge-privacy" title="Tutta la trasformazione Markdown e rendering avvengono sul tuo browser. Nessun dato viene trasmesso a server esterni.">
            <ShieldCheck class="badge-icon" /> 100% Client-Side • Privacy Sicura
          </span>
        </div>
      </div>

      <div class="header-right">
        <!-- Template selector -->
        <div class="template-selector-wrapper">
          <button 
            class="header-btn template-btn" 
            @click="templatesOpen = !templatesOpen"
            :class="{ 'is-active': templatesOpen }"
          >
            <Sparkles class="icon text-orange" />
            <span>Modelli & Documenti Pronti</span>
            <ChevronDown class="icon-tiny" :class="{ 'rotate-180': templatesOpen }" />
          </button>

          <!-- Dropdown templates -->
          <div v-if="templatesOpen" class="templates-dropdown">
            <div class="dropdown-header">
              <span>Seleziona un documento pronto da modificare</span>
              <button @click="templatesOpen = false" class="close-btn"><X class="icon-tiny" /></button>
            </div>
            <div class="templates-list">
              <button
                v-for="tpl in MD_TEMPLATES"
                :key="tpl.id"
                class="template-card"
                @click="loadTemplate(tpl)"
              >
                <div class="template-title-row">
                  <span class="template-name">{{ tpl.title }}</span>
                  <span class="template-category">{{ tpl.category }}</span>
                </div>
                <div class="template-desc">{{ tpl.description }}</div>
                <div class="template-mini-preview">
                  <span v-for="(line, i) in tpl.markdown.split('\n').slice(0, 3)" :key="i" class="mini-line">{{ line }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Guida rapida dialog toggle -->
        <button class="header-btn" @click="guideOpen = !guideOpen" title="Guida & Scorciatoie">
          <HelpCircle class="icon" />
        </button>
      </div>
    </header>

    <!-- PALETTE SNIPPET & STRUMENTI -->
    <section class="palette-container">
      <div class="palette-top">
        <!-- Categorie tab -->
        <nav class="categories-nav" aria-label="Categorie snippet Markdown">
          <button
            v-for="cat in MD_CATEGORIES"
            :key="cat.id"
            class="category-tab"
            :class="{ 'is-active': activeCategory === cat.id && !searchQuery }"
            @click="selectCategory(cat.id)"
          >
            <component :is="getCategoryIcon(cat.iconName)" class="cat-icon" />
            <span>{{ cat.name }}</span>
          </button>
        </nav>

        <!-- Ricerca rapida snippet -->
        <div class="snippet-search">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cerca snippet (es. grassetto, tabella, matrice)..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
            <X class="icon-tiny" />
          </button>
        </div>
      </div>

      <!-- Griglia snippet -->
      <div class="snippets-grid">
        <button
          v-for="(snip, idx) in displayedSnippets"
          :key="snip.id + idx"
          class="snippet-btn"
          :title="`${snip.desc}`"
          @click="insertSnippet(snip)"
        >
          <span class="snippet-label">{{ snip.name }}</span>
        </button>

        <div v-if="displayedSnippets.length === 0" class="no-snippets">
          Nessuno snippet trovato per "{{ searchQuery }}". Prova con un altro termine.
        </div>
      </div>
    </section>

    <!-- MOBILE VIEW SWITCHER (solo su schermi piccoli) -->
    <div class="mobile-tabs">
      <button 
        class="mobile-tab-btn" 
        :class="{ 'is-active': mobileTab === 'editor' }"
        @click="mobileTab = 'editor'"
      >
        <Code class="icon-small" />
        <span>Sorgente Markdown</span>
      </button>
      <button 
        class="mobile-tab-btn" 
        :class="{ 'is-active': mobileTab === 'preview' }"
        @click="mobileTab = 'preview'"
      >
        <Eye class="icon-small" />
        <span>Anteprima Live</span>
      </button>
    </div>

    <!-- MAIN WORKSPACE: EDITOR & PREVIEW -->
    <main class="workspace-main">
      <!-- PANNELLO EDITOR -->
      <section class="editor-panel" :class="{ 'mobile-hidden': mobileTab !== 'editor' }">
        <div class="panel-header">
          <div class="panel-title-group">
            <Code class="panel-icon text-orange" />
            <span class="panel-title">Sorgente Markdown</span>
            <span class="code-stats">{{ charCount }} car · {{ wordCount }} parole · {{ lineCount }} righe</span>
          </div>

          <div class="editor-actions">
            <button class="tool-btn" @click="undo" title="Annulla (Ctrl+Z)">
              <RotateCcw class="icon-small" />
            </button>
            <button class="tool-btn" @click="redo" title="Ripeti (Ctrl+Y)">
              <RotateCw class="icon-small" />
            </button>
            <div class="tool-divider"></div>
            <button class="tool-btn text-red" @click="confirmClear" title="Cancella tutto">
              <Trash2 class="icon-small" />
            </button>
          </div>
        </div>

        <div class="editor-textarea-wrapper">
          <textarea
            ref="editorRef"
            v-model="mdSource"
            class="md-textarea"
            placeholder="Scrivi qui il tuo Markdown o usa gli snippet in alto..."
            spellcheck="true"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            @input="onCodeInput"
            @keydown="onEditorKeydown"
          ></textarea>
        </div>
      </section>

      <!-- PANNELLO ANTEPRIMA LIVE -->
      <section class="preview-panel" :class="{ 'mobile-hidden': mobileTab !== 'preview' }">
        <div class="panel-header">
          <div class="panel-title-group">
            <Eye class="panel-icon text-cyan" />
            <span class="panel-title">Anteprima Live</span>
            <span class="live-badge"><span class="dot"></span> Real-time</span>
          </div>

          <div class="preview-controls">
            <!-- Zoom controls -->
            <div class="zoom-group">
              <button class="tool-btn" @click="changeZoom(-0.15)" title="Riduci zoom">
                <ZoomOut class="icon-small" />
              </button>
              <span class="zoom-text" @click="zoomLevel = 1" title="Clicca per ripristinare 100%">
                {{ Math.round(zoomLevel * 100) }}%
              </span>
              <button class="tool-btn" @click="changeZoom(0.15)" title="Aumenta zoom">
                <ZoomIn class="icon-small" />
              </button>
            </div>

            <div class="tool-divider"></div>

            <!-- Background mode -->
            <div class="bg-selector" title="Sfondo anteprima">
              <button
                v-for="bg in bgOptions"
                :key="bg.id"
                class="bg-btn"
                :class="{ 'is-selected': previewBg === bg.id }"
                @click="previewBg = bg.id"
                :title="bg.name"
              >
                {{ bg.icon }}
              </button>
            </div>
          </div>
        </div>

        <!-- Rendered Display Area -->
        <div 
          class="preview-display-wrapper" 
          :class="[`bg-style-${previewBg}`, { 'content-dark': previewBg !== 'light' }]"
        >
          <div 
            ref="renderedContainerRef"
            class="rendered-md-container"
            :style="{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center'
            }"
          >
            <div 
              v-if="renderedHtml"
              class="md md-preview"
              v-html="renderedHtml"
            ></div>
            <div v-else class="preview-empty">
              <Sparkles class="empty-icon" />
              <p>Nessun contenuto da visualizzare.</p>
              <span>Scrivi Markdown a sinistra o inserisci uno snippet in alto.</span>
            </div>
          </div>
        </div>

        <!-- BARRA ESPORTAZIONE E CONDIVISIONE -->
        <footer class="export-bar">
          <div class="export-group copy-group">
            <span class="export-label">Copia:</span>
            <button class="export-btn" @click="handleCopyMarkdown" title="Copia sorgente Markdown">
              <Copy class="icon-tiny" />
              <span>Markdown</span>
            </button>
            <button class="export-btn" @click="handleCopyHtml" title="Copia HTML già renderizzato (pronto per il web)">
              <Copy class="icon-tiny" />
              <span>HTML</span>
            </button>
          </div>

          <div class="export-group download-group">
            <span class="export-label">Esporta:</span>
            <button class="export-btn highlight-btn" @click="handleDownloadMd" title="Scarica documento sorgente .md">
              <FileDown class="icon-tiny" />
              <span>.md</span>
            </button>
            <button class="export-btn" @click="handleDownloadHtml" title="Scarica documento HTML autonomo con stili e KaTeX">
              <FileDown class="icon-tiny" />
              <span>.html</span>
            </button>
            <button class="export-btn" @click="handlePrint" title="Stampa o salva in PDF">
              <Printer class="icon-tiny" />
              <span>PDF / Stampa</span>
            </button>
          </div>
        </footer>
      </section>
    </main>

    <!-- MODALE GUIDA RAPIDA -->
    <div v-if="guideOpen" class="modal-backdrop" @click="guideOpen = false">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>Guida Rapida Markdown</h3>
          <button class="close-btn" @click="guideOpen = false"><X class="icon" /></button>
        </div>
        <div class="modal-body">
          <div class="guide-section">
            <h4>💡 Come funziona l'Editor</h4>
            <p>
              Questo editor ti consente di comporre, testare ed esportare documenti Markdown direttamente nel tuo browser.
              Il motore è lo stesso delle pagine del sito (Markdown + KaTeX + evidenziazione codice): l'anteprima mostra
              esattamente come il documento apparirà pubblicato. Nessun dato viene inviato a server esterni!
            </p>
          </div>
          <div class="guide-grid">
            <div class="guide-item">
              <span class="guide-code"># / ## / ###</span>
              <span class="guide-desc">Titoli di primo, secondo e terzo livello</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">**grassetto** · *corsivo* · ~~barrato~~</span>
              <span class="guide-desc">Enfasi sul testo (o usa i pulsanti con la selezione attiva)</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">- voce · 1. voce · - [ ] attività</span>
              <span class="guide-desc">Elenchi puntati, numerati e di attività con spunta</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">[testo](https://esempio.com)</span>
              <span class="guide-desc">Collegamento ipertestuale</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">![descrizione](immagine.png)</span>
              <span class="guide-desc">Inserimento immagine</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">| A | B | — separatori con ---</span>
              <span class="guide-desc">Tabelle con intestazione</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">> Citazione</span>
              <span class="guide-desc">Blocco citazione</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">```js ... ```</span>
              <span class="guide-desc">Blocco di codice con evidenziazione sintattica</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">$x^2$ · $$\\int f(x)\\,dx$$</span>
              <span class="guide-desc">Formule matematiche LaTeX (KaTeX) in linea o a blocco</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATIONS -->
    <Transition name="toast">
      <div v-if="toastMessage" class="toast-notification">
        <Check class="toast-icon text-green" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  Home, Sparkles, ChevronDown, HelpCircle,
  Type, AlignLeft, List, Image, Sigma,
  Search, X, RotateCcw, RotateCw, Trash2, Code, Eye, ZoomIn, ZoomOut,
  Copy, FileDown, Printer, Check, ShieldCheck
} from 'lucide-vue-next';

import {
  MD_CATEGORIES,
  MD_TEMPLATES,
  type MdSnippet,
  type MdTemplate
} from './markdownData';

import {
  renderMarkdown,
  copyToClipboard,
  downloadMarkdownFile,
  downloadHtmlFile,
  printMarkdown
} from './markdownExporter';

// State
const defaultCode = `# Benvenuto nell'Editor Markdown

Trasforma note e appunti in documenti curati: l'**anteprima live** mostra subito il risultato,
incluse le formule matematiche come $E = mc^2$.

## Formattazione rapida

- *Corsivo*, **grassetto** e \`codice in linea\`
- [x] Anteprima in tempo reale
- [ ] Il tuo primo documento... da scrivere!

> Un editor completamente client-side: il testo non lascia mai il tuo browser.

## Tabelle e codice

| Strumento | Uso |
|-----------|-----|
| Snippet   | inserimento rapido dei blocchi |
| Template  | documenti pronti da modificare |

\`\`\`js
console.log('Ciao dal Markdown!');
\`\`\`

## Matematica

$$
\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}
$$

Buon lavoro! Usa i pulsanti in alto per scrivere più velocemente: seleziona un testo e
premi un pulsante per racchiuderlo in grassetto, corsivo, codice o citazione.`;

const mdSource = ref(defaultCode);
const renderedHtml = ref('');
const activeCategory = ref('testo');
const searchQuery = ref('');
const zoomLevel = ref(1);
const previewBg = ref('light'); // slate, black, light, transparent
const templatesOpen = ref(false);
const guideOpen = ref(false);
const mobileTab = ref<'editor' | 'preview'>('editor');
const toastMessage = ref('');

// Elements
const editorRef = ref<HTMLTextAreaElement | null>(null);
const renderedContainerRef = ref<HTMLElement | null>(null);

// History for Undo/Redo
const history = ref<string[]>([defaultCode]);
const historyIndex = ref(0);
const isHistoryNav = ref(false);

// Background options
const bgOptions = [
  { id: 'slate', name: 'Scuro Slate', icon: '⬛' },
  { id: 'black', name: 'Nero Profondo', icon: '🖤' },
  { id: 'light', name: 'Chiaro', icon: '⬜' },
  { id: 'transparent', name: 'Trasparente', icon: '🏁' }
];

// Stats
const charCount = computed(() => mdSource.value.length);
const wordCount = computed(() => mdSource.value.trim().split(/\s+/).filter(Boolean).length);
const lineCount = computed(() => mdSource.value.split('\n').length);

// Category icon helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Type': return Type;
    case 'AlignLeft': return AlignLeft;
    case 'List': return List;
    case 'Image': return Image;
    case 'Sigma': return Sigma;
    default: return Sparkles;
  }
};

// Filtered snippets based on active category or search query
const displayedSnippets = computed<MdSnippet[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    const all: MdSnippet[] = [];
    MD_CATEGORIES.forEach(cat => {
      cat.snippets.forEach(s => {
        if (
          s.name.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q)
        ) {
          all.push(s);
        }
      });
    });
    return all;
  }

  const currentCat = MD_CATEGORIES.find(c => c.id === activeCategory.value);
  return currentCat ? currentCat.snippets : [];
});

// Main markdown rendering logic
const renderCurrentCode = () => {
  const code = mdSource.value;
  if (!code.trim()) {
    renderedHtml.value = '';
    return;
  }
  renderedHtml.value = renderMarkdown(code);
};

// History management
const pushHistory = (code: string) => {
  if (isHistoryNav.value) return;
  if (history.value[historyIndex.value] === code) return;

  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push(code);
  if (history.value.length > 100) history.value.shift();
  historyIndex.value = history.value.length - 1;

  // Persist locally
  try {
    localStorage.setItem('astro_markdown_draft', code);
  } catch {
    // ignore
  }
};

const undo = () => {
  if (historyIndex.value > 0) {
    isHistoryNav.value = true;
    historyIndex.value--;
    mdSource.value = history.value[historyIndex.value];
    setTimeout(() => { isHistoryNav.value = false; }, 50);
  }
};

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    isHistoryNav.value = true;
    historyIndex.value++;
    mdSource.value = history.value[historyIndex.value];
    setTimeout(() => { isHistoryNav.value = false; }, 50);
  }
};

const onCodeInput = () => {
  pushHistory(mdSource.value);
};

// Keyboard shortcuts inside editor
const onEditorKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault();
    redo();
  } else if (e.key === 'Tab') {
    // Tab in editor markdown: indentazione (due spazi) come prefisso comunemente richiesto dagli elenchi
    e.preventDefault();
    const ta = e.target as HTMLTextAreaElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const src = mdSource.value;
    mdSource.value = src.substring(0, start) + '  ' + src.substring(end);
    setTimeout(() => {
      ta.focus();
      const pos = start + 2;
      ta.setSelectionRange(pos, pos);
    }, 10);
  }
};

// Insert snippet at cursor position (wrapping selection where meaningful)
const insertSnippet = (snip: MdSnippet) => {
  const textarea = editorRef.value;
  const src = mdSource.value;

  if (!textarea) {
    mdSource.value += (snip.text !== undefined ? '\n\n' + snip.text : snip.before + snip.placeholder + snip.after);
    onCodeInput();
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = src.substring(start, end);

  let newText: string;
  let caretStart: number;
  let caretEnd: number;

  if (snip.text !== undefined) {
    // Blocco completo: sempre su righe proprie e separato dal resto del documento
    const segBefore = src.slice(0, start);
    const segAfter = src.slice(end);
    let padBefore = '';
    if (segBefore.length && !/\n\s*$/.test(segBefore)) padBefore = '\n\n';
    else if (segBefore.length && /(^|[^+\n])\n$/.test(segBefore)) padBefore = '\n';
    const padAfter = (/\n\s*$/.test(segAfter) || segAfter === '') ? '' : '\n';

    newText = segBefore + padBefore + snip.text + padAfter + segAfter;
    caretStart = caretEnd = start + padBefore.length + snip.text.length;
  } else if (snip.lineStart) {
    const lineStart = src.lastIndexOf('\n', start - 1) + 1;
    const content = selected || snip.placeholder;
    newText = src.slice(0, lineStart) + snip.before + content + snip.after + src.slice(end);
    if (selected) {
      caretStart = caretEnd = lineStart + snip.before.length + content.length;
    } else {
      caretStart = lineStart + snip.before.length;
      caretEnd = caretStart + snip.placeholder.length;
    }
  } else {
    const content = selected || snip.placeholder;
    newText = src.slice(0, start) + snip.before + content + snip.after + src.slice(end);
    if (selected) {
      caretStart = caretEnd = start + snip.before.length + content.length;
    } else {
      caretStart = start + snip.before.length;
      caretEnd = caretStart + snip.placeholder.length;
    }
  }

  mdSource.value = newText;
  onCodeInput();

  // Riposiziona cursore / seleziona il placeholder fittizio
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(caretStart, caretEnd);
  }, 10);

  showToast(`Snippet inserito: ${snip.name}`);
};

const confirmClear = () => {
  if (confirm('Sei sicuro di voler cancellare tutto il testo?')) {
    mdSource.value = '';
    onCodeInput();
    showToast('Editor svuotato');
  }
};

const selectCategory = (id: string) => {
  activeCategory.value = id;
  searchQuery.value = '';
};

const loadTemplate = (tpl: MdTemplate) => {
  mdSource.value = tpl.markdown;
  onCodeInput();
  templatesOpen.value = false;
  showToast(`Caricato template: ${tpl.title}`);
};

const changeZoom = (delta: number) => {
  zoomLevel.value = Math.min(Math.max(0.4, zoomLevel.value + delta), 2.5);
};

// Toast system
let toastTimer: any = null;
const showToast = (msg: string) => {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 2400);
};

// Copy actions
const handleCopyMarkdown = async () => {
  const success = await copyToClipboard(mdSource.value);
  if (success) showToast('Sorgente Markdown copiato negli appunti!');
};

const handleCopyHtml = async () => {
  const success = await copyToClipboard(renderedHtml.value);
  if (success) showToast('HTML renderizzato copiato negli appunti!');
};

// Export actions
const handleDownloadMd = () => {
  downloadMarkdownFile(mdSource.value, 'documento_markdown.md');
  showToast('File .md scaricato!');
};

const handleDownloadHtml = () => {
  downloadHtmlFile(mdSource.value, renderedHtml.value, 'documento_markdown.html');
  showToast('File HTML autonomo scaricato!');
};

const handlePrint = () => {
  printMarkdown(mdSource.value, renderedHtml.value);
  showToast('Finestra di stampa avviata...');
};

// Mount & restore
onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).__hideGlobalLoader) {
    (window as any).__hideGlobalLoader();
  }
  try {
    const saved = localStorage.getItem('astro_markdown_draft');
    if (saved && saved.trim()) {
      mdSource.value = saved;
      history.value = [saved];
    }
  } catch {
    // ignore
  }
  renderCurrentCode();
});

watch(mdSource, () => {
  renderCurrentCode();
});
</script>

<style scoped>
/* RESET & LAYOUT */
.md-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f1015;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  user-select: none;
}

/* TOP HEADER */
.md-header {
  height: 3.8rem;
  background: #14151f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  font-size: 0.88rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 140, 0, 0.4);
  color: #ff8c00;
}

.brand {
  display: flex;
  flex-direction: column;
}

.brand-title {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.md-logo {
  font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: -1px;
  color: #ff8c00;
}

.md-logo .down {
  font-weight: 400;
  font-size: 1.05em;
  vertical-align: -0.1em;
  color: #38bdf8;
}

.brand-name {
  font-family: 'Fredericka the Great', cursive, sans-serif;
  font-size: 1.25rem;
  color: #f8fafc;
}

.badge-privacy {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  width: fit-content;
}

.badge-icon {
  width: 0.85rem;
  height: 0.85rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

/* TEMPLATE DROPDOWN */
.template-selector-wrapper {
  position: relative;
}

.template-btn {
  font-weight: 500;
}

.templates-dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  width: 26rem;
  max-width: 90vw;
  max-height: 70vh;
  background: #181926;
  border: 1px solid rgba(255, 140, 0, 0.3);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-header {
  padding: 0.8rem 1rem;
  background: #131420;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.82rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.templates-list {
  padding: 0.6rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.template-card {
  text-align: left;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  color: #f1f5f9;
  transition: all 0.15s ease;
}

.template-card:hover {
  background: rgba(255, 140, 0, 0.1);
  border-color: rgba(255, 140, 0, 0.4);
}

.template-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.template-name {
  font-weight: 600;
  font-size: 0.92rem;
  color: #ff8c00;
}

.template-category {
  font-size: 0.7rem;
  color: #64748b;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.template-desc {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-bottom: 0.4rem;
}

/* Mini-anteprima dei template (prime righe del sorgente) */
.template-mini-preview {
  font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 0.72rem;
  color: #cbd5e1;
  background: #0f1015;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.template-mini-preview .mini-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* PALETTE SNIPPET */
.palette-container {
  background: #141522;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.6rem 1.25rem 0.8rem;
}

.palette-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}

.categories-nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.category-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  font-size: 0.82rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.category-tab:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.05);
}

.category-tab.is-active {
  color: #ff8c00;
  background: rgba(255, 140, 0, 0.12);
  border-color: rgba(255, 140, 0, 0.3);
  font-weight: 500;
}

.cat-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.snippet-search {
  position: relative;
  width: 18rem;
  max-width: 100%;
}

.snippet-search .search-icon {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.95rem;
  height: 0.95rem;
  color: #64748b;
  pointer-events: none;
}

.snippet-search .search-input {
  width: 100%;
  padding: 0.4rem 2rem 0.4rem 2rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  font-size: 0.82rem;
  outline: none;
  transition: all 0.15s ease;
}

.snippet-search .search-input:focus {
  border-color: #ff8c00;
  background: rgba(255, 255, 255, 0.08);
}

.snippet-search .search-clear {
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}

/* SNIPPETS GRID */
.snippets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-height: 8.5rem;
  overflow-y: auto;
  padding-right: 0.3rem;
}

.snippet-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.6rem;
  height: 2.1rem;
  background: #1b1c2a;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 6px;
  cursor: pointer;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 0.82rem;
  white-space: nowrap;
  transition: all 0.12s ease;
}

.snippet-btn:hover {
  background: rgba(255, 140, 0, 0.18);
  border-color: rgba(255, 140, 0, 0.45);
  color: #ff8c00;
  transform: translateY(-1px);
}

.no-snippets {
  font-size: 0.85rem;
  color: #64748b;
  padding: 1rem 0;
  width: 100%;
  text-align: center;
}

/* MOBILE VIEW SWITCHER */
.mobile-tabs {
  display: none;
  background: #141520;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.4rem;
  gap: 0.5rem;
}

.mobile-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
}

.mobile-tab-btn.is-active {
  background: rgba(255, 140, 0, 0.15);
  border-color: #ff8c00;
  color: #ff8c00;
  font-weight: 600;
}

/* MAIN WORKSPACE */
.workspace-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
  overflow: hidden;
}

/* PANEL COMMON */
.editor-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #0f1017;
}

.editor-panel {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-header {
  height: 3rem;
  background: #151624;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-icon {
  width: 1.1rem;
  height: 1.1rem;
}

.panel-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #e2e8f0;
}

.code-stats {
  font-size: 0.75rem;
  color: #64748b;
  margin-left: 0.3rem;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  margin-left: 0.3rem;
}

.live-badge .dot {
  width: 6px;
  height: 6px;
  background-color: #38bdf8;
  border-radius: 50%;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.editor-actions,
.preview-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  height: 1.8rem;
  padding: 0 0.35rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #94a3b8;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.12s ease;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
}

.tool-divider {
  width: 1px;
  height: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 0.2rem;
}

/* EDITOR TEXTAREA */
.editor-textarea-wrapper {
  flex: 1;
  position: relative;
  display: flex;
}

.md-textarea {
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  background: #0d0e14;
  color: #e2e8f0;
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
  font-size: 0.98rem;
  line-height: 1.7;
  tab-size: 2;
  user-select: text;
}

.md-textarea::placeholder {
  color: #475569;
}

/* PREVIEW CONTROLS */
.zoom-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.zoom-text {
  font-size: 0.78rem;
  color: #94a3b8;
  cursor: pointer;
  min-width: 2.8rem;
  text-align: center;
}

.bg-selector {
  display: flex;
  gap: 0.2rem;
}

.bg-btn {
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.15rem;
  border-radius: 4px;
}

.bg-btn.is-selected {
  border-color: #ff8c00;
  background: rgba(255, 140, 0, 0.2);
}

/* PREVIEW DISPLAY WRAPPER */
.preview-display-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
  padding: 2rem;
  transition: background 0.2s ease;
}

.bg-style-slate {
  background-color: #12131d;
}

.bg-style-black {
  background-color: #000000;
}

.bg-style-light {
  background-color: #f8fafc;
}

.bg-style-transparent {
  background-color: #181926;
  background-image: 
    linear-gradient(45deg, #1f2030 25%, transparent 25%),
    linear-gradient(-45deg, #1f2030 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1f2030 75%),
    linear-gradient(-45deg, transparent 75%, #1f2030 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.rendered-md-container {
  max-width: 100%;
  user-select: text;
  transition: transform 0.1s ease;
}

/* Il contenuto usa lo stile .md del sito (md.css); qui si adatta all'ambiente editor */
.md-preview {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0;
  width: 100%;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Variante su sfondi scuri: adatta i colori ereditati da md.css */
.content-dark .md-preview {
  color: #f1f5f9;
}

.content-dark .md-preview :deep(h1),
.content-dark .md-preview :deep(h2),
.content-dark .md-preview :deep(h3),
.content-dark .md-preview :deep(h4) {
  color: #f8fafc;
}

.content-dark .md-preview :deep(h1) {
  border-bottom-color: rgba(255, 255, 255, 0.18);
}

.content-dark .md-preview :deep(strong) {
  color: #ffffff;
}

.content-dark .md-preview :deep(a) {
  color: #7dd3fc;
}

.content-dark .md-preview :deep(blockquote) {
  background: rgba(59, 130, 246, 0.12);
  color: #bfdbfe;
  border-left-color: #60a5fa;
}

.content-dark .md-preview :deep(hr) {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.content-dark .md-preview :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fbbf24;
  border-color: rgba(255, 255, 255, 0.15);
}

.content-dark .md-preview :deep(th),
.content-dark .md-preview :deep(td) {
  border-color: rgba(255, 255, 255, 0.2);
}

.content-dark .md-preview :deep(th) {
  background-color: rgba(255, 255, 255, 0.08);
}

.preview-empty {
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  width: 2.2rem;
  height: 2.2rem;
  color: #475569;
}

.preview-empty p {
  margin: 0;
  font-weight: 500;
  font-size: 1.05rem;
  color: #94a3b8;
}

.preview-empty span {
  font-size: 0.85rem;
}

/* EXPORT BAR */
.export-bar {
  background: #141522;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.export-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.export-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-right: 0.2rem;
}

.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.65rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.export-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ff8c00;
  border-color: rgba(255, 140, 0, 0.4);
}

.export-btn.highlight-btn {
  background: rgba(255, 140, 0, 0.15);
  border-color: rgba(255, 140, 0, 0.5);
  color: #ff8c00;
  font-weight: 600;
}

.export-btn.highlight-btn:hover {
  background: rgba(255, 140, 0, 0.28);
}

/* MODAL */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  width: 42rem;
  max-width: 100%;
  max-height: 85vh;
  background: #181926;
  border: 1px solid rgba(255, 140, 0, 0.3);
  border-radius: 12px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1rem 1.25rem;
  background: #131420;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #ff8c00;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem;
}

.close-btn:hover {
  color: #ffffff;
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  font-size: 0.88rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.guide-section {
  margin-bottom: 1.25rem;
}

.guide-section h4 {
  margin: 0 0 0.5rem;
  color: #f8fafc;
  font-size: 1rem;
}

.guide-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.guide-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
}

.guide-code {
  font-family: monospace;
  color: #ff8c00;
  font-size: 0.85rem;
}

.guide-desc {
  font-size: 0.78rem;
  color: #94a3b8;
}

/* TOAST */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1e1e2e;
  border: 1px solid #10b981;
  color: #f1f5f9;
  padding: 0.75rem 1.2rem;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  font-weight: 500;
  z-index: 999999;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

/* UTILITIES */
.icon { width: 1.15rem; height: 1.15rem; }
.icon-small { width: 1rem; height: 1rem; }
.icon-tiny { width: 0.85rem; height: 0.85rem; }
.text-orange { color: #ff8c00; }
.text-cyan { color: #38bdf8; }
.text-green { color: #10b981; }
.text-red { color: #ef4444; }
.rotate-180 { transform: rotate(180deg); }

/* RESPONSIVE BREAKPOINTS */
@media (max-width: 900px) {
  .palette-top {
    flex-direction: column;
    align-items: stretch;
  }
  .snippet-search {
    width: 100%;
  }
  .mobile-tabs {
    display: flex;
  }
  .workspace-main {
    grid-template-columns: 1fr;
  }
  .editor-panel.mobile-hidden,
  .preview-panel.mobile-hidden {
    display: none;
  }
  .export-bar {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .md-header {
    height: auto;
    padding: 0.6rem 0.8rem;
    flex-wrap: wrap;
  }
  .btn-text {
    display: none;
  }
  .brand-name {
    font-size: 1rem;
  }
  .badge-privacy {
    display: none;
  }
  .export-group {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
