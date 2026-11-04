<template>
  <div class="latex-app">
    <!-- TOP HEADER -->
    <header class="latex-header">
      <div class="header-left">
        <a href="/" class="header-btn" title="Torna alla Home del Blog">
          <Home class="icon" />
          <span class="btn-text">Home</span>
        </a>

        <div class="brand">
          <div class="brand-title">
            <span class="latex-logo">L<span class="sub">A</span>T<span class="sub">E</span>X</span>
            <span class="brand-name">Editor Online</span>
          </div>
          <span class="badge-privacy" title="Tutta la compilazione e rendering avvengono sul tuo browser. Nessun dato viene trasmesso a server esterni.">
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
            <span>Formule Celebri & Template</span>
            <ChevronDown class="icon-tiny" :class="{ 'rotate-180': templatesOpen }" />
          </button>

          <!-- Dropdown templates -->
          <div v-if="templatesOpen" class="templates-dropdown">
            <div class="dropdown-header">
              <span>Seleziona un modello matematico pronto</span>
              <button @click="templatesOpen = false" class="close-btn"><X class="icon-tiny" /></button>
            </div>
            <div class="templates-list">
              <button
                v-for="tpl in LATEX_TEMPLATES"
                :key="tpl.id"
                class="template-card"
                @click="loadTemplate(tpl)"
              >
                <div class="template-title-row">
                  <span class="template-name">{{ tpl.title }}</span>
                  <span class="template-category">{{ tpl.category }}</span>
                </div>
                <div class="template-desc">{{ tpl.description }}</div>
                <div class="template-mini-preview" v-html="renderKatexInline(tpl.latex)"></div>
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

    <!-- PALETTE SIMBOLI & STRUMENTI -->
    <section class="palette-container">
      <div class="palette-top">
        <!-- Categorie tab -->
        <nav class="categories-nav" aria-label="Categorie simboli">
          <button
            v-for="cat in LATEX_CATEGORIES"
            :key="cat.id"
            class="category-tab"
            :class="{ 'is-active': activeCategory === cat.id && !searchQuery }"
            @click="selectCategory(cat.id)"
          >
            <component :is="getCategoryIcon(cat.iconName)" class="cat-icon" />
            <span>{{ cat.name }}</span>
          </button>
        </nav>

        <!-- Ricerca rapida simboli -->
        <div class="symbol-search">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cerca simbolo (es. alpha, integrale, matrice)..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
            <X class="icon-tiny" />
          </button>
        </div>
      </div>

      <!-- Griglia simboli con KaTeX renderizzato -->
      <div class="symbols-grid">
        <button
          v-for="(sym, idx) in displayedSymbols"
          :key="sym.latex + idx"
          class="symbol-btn"
          :title="`${sym.name} (${sym.latex})`"
          @click="insertSymbol(sym)"
        >
          <span class="symbol-preview" v-html="renderSymbolButton(sym.display || sym.latex)"></span>
          <span class="symbol-label">{{ sym.name }}</span>
        </button>

        <div v-if="displayedSymbols.length === 0" class="no-symbols">
          Nessun simbolo trovato per "{{ searchQuery }}". Prova con un altro termine.
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
        <span>Codice LaTeX</span>
      </button>
      <button 
        class="mobile-tab-btn" 
        :class="{ 'is-active': mobileTab === 'preview' }"
        @click="mobileTab = 'preview'"
      >
        <Eye class="icon-small" />
        <span>Anteprima Formula</span>
      </button>
    </div>

    <!-- MAIN WORKSPACE: EDITOR & PREVIEW -->
    <main class="workspace-main">
      <!-- PANNELLO EDITOR -->
      <section class="editor-panel" :class="{ 'mobile-hidden': mobileTab !== 'editor' }">
        <div class="panel-header">
          <div class="panel-title-group">
            <Code class="panel-icon text-orange" />
            <span class="panel-title">Codice LaTeX</span>
            <span class="code-stats">{{ charCount }} car · {{ lineCount }} righe</span>
          </div>

          <div class="editor-actions">
            <button class="tool-btn" @click="undo" title="Annulla (Ctrl+Z)">
              <RotateCcw class="icon-small" />
            </button>
            <button class="tool-btn" @click="redo" title="Ripeti (Ctrl+Y)">
              <RotateCw class="icon-small" />
            </button>
            <div class="tool-divider"></div>
            <button class="tool-btn" @click="wrapSelection('\\left(', '\\right)')" title="Racchiudi tra parentesi tonde scalabili">
              ( )
            </button>
            <button class="tool-btn" @click="wrapSelection('\\left[', '\\right]')" title="Racchiudi tra parentesi quadre scalabili">
              [ ]
            </button>
            <button class="tool-btn" @click="wrapSelection('\\left\\{', '\\right\\}')" title="Racchiudi tra parentesi graffe scalabili">
              { }
            </button>
            <button class="tool-btn" @click="wrapSelection('\\frac{', '}{}')" title="Trasforma in frazione">
              a/b
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
            v-model="latexCode"
            class="latex-textarea"
            placeholder="Scrivi qui la tua formula LaTeX o clicca sui simboli in alto..."
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            @input="onCodeInput"
            @keydown="onEditorKeydown"
          ></textarea>
        </div>

        <!-- Banner errore sintassi se KaTeX non riesce a compilare -->
        <div v-if="renderError" class="syntax-error-banner">
          <AlertTriangle class="error-icon" />
          <div class="error-content">
            <div class="error-title">Attenzione: errore di sintassi LaTeX</div>
            <div class="error-msg">{{ renderError }}</div>
          </div>
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

            <!-- Colore formula -->
            <div class="color-picker-group" title="Colore formula">
              <button
                v-for="c in colorOptions"
                :key="c.color"
                class="color-dot"
                :style="{ backgroundColor: c.color }"
                :class="{ 'is-selected': formulaColor === c.color }"
                @click="formulaColor = c.color"
                :title="c.name"
              ></button>
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
          :class="`bg-style-${previewBg}`"
        >
          <div 
            ref="renderedContainerRef"
            class="rendered-math-container"
            :style="{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              color: formulaColor
            }"
          >
            <div 
              v-if="renderedHtml"
              class="katex-output"
              v-html="renderedHtml"
            ></div>
            <div v-else class="preview-empty">
              <Sparkles class="empty-icon" />
              <p>Nessuna formula da visualizzare.</p>
              <span>Seleziona un simbolo in alto o scrivi codice LaTeX a sinistra.</span>
            </div>
          </div>
        </div>

        <!-- BARRA ESPORTAZIONE E CONDIVISIONE -->
        <footer class="export-bar">
          <div class="export-group copy-group">
            <span class="export-label">Copia:</span>
            <button class="export-btn" @click="handleCopyLatex" title="Copia codice sorgente LaTeX">
              <Copy class="icon-tiny" />
              <span>LaTeX</span>
            </button>
            <button class="export-btn" @click="handleCopyMarkdown" title="Copia pronto per Markdown ($$...$$)">
              <Copy class="icon-tiny" />
              <span>Markdown</span>
            </button>
            <button class="export-btn" @click="handleCopyMathML" title="Copia come MathML per Word o Web">
              <Copy class="icon-tiny" />
              <span>MathML</span>
            </button>
          </div>

          <div class="export-group download-group">
            <span class="export-label">Esporta:</span>
            <button class="export-btn highlight-btn" @click="handleExportPNG" title="Scarica immagine ad alta risoluzione PNG">
              <Download class="icon-tiny" />
              <span>PNG (HD)</span>
            </button>
            <button class="export-btn" @click="handleExportSVG" title="Scarica grafica vettoriale SVG">
              <FileDown class="icon-tiny" />
              <span>SVG</span>
            </button>
            <button class="export-btn" @click="handleDownloadTex" title="Scarica documento sorgente .tex">
              <FileDown class="icon-tiny" />
              <span>.tex</span>
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
          <h3>Guida Rapida LaTeX</h3>
          <button class="close-btn" @click="guideOpen = false"><X class="icon" /></button>
        </div>
        <div class="modal-body">
          <div class="guide-section">
            <h4>💡 Come funziona l'Editor</h4>
            <p>
              Questo editor ti consente di comporre, testare ed esportare formule matematiche in standard LaTeX direttamente nel tuo browser.
              Il motore matematico KaTeX elabora il codice in tempo reale sul tuo dispositivo: nessun dato viene inviato a server esterni!
            </p>
          </div>
          <div class="guide-grid">
            <div class="guide-item">
              <span class="guide-code">\frac{numeratore}{denominatore}</span>
              <span class="guide-desc">Frazione semplice</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">\sqrt[n]{x}</span>
              <span class="guide-desc">Radice di indice n</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">\int_{a}^{b} f(x)\,dx</span>
              <span class="guide-desc">Integrale definito da a a b</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">\sum_{i=1}^{n} x_i</span>
              <span class="guide-desc">Sommatoria da i=1 a n</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">\begin{pmatrix} a & b \\ c & d \end{pmatrix}</span>
              <span class="guide-desc">Matrice con parentesi tonde</span>
            </div>
            <div class="guide-item">
              <span class="guide-code">\left( ... \right)</span>
              <span class="guide-desc">Parentesi auto-adattanti all'altezza del contenuto</span>
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
import katex from 'katex';
import {
  Home, Sparkles, ChevronDown, HelpCircle,
  Plus, Activity, Grid, Maximize, Layers, ArrowRight, Type, AlignLeft,
  Search, X, RotateCcw, RotateCw, Trash2, Code, Eye, ZoomIn, ZoomOut,
  Copy, Download, FileDown, Printer, Check, AlertTriangle, ShieldCheck
} from 'lucide-vue-next';

import {
  LATEX_CATEGORIES,
  LATEX_TEMPLATES,
  type LatexSymbol,
  type LatexTemplate
} from './latexData';

import {
  copyToClipboard,
  getMathML,
  downloadTexFile,
  exportToPNG,
  exportToSVG,
  printFormula
} from './latexExporter';

// State
const defaultCode = `x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`;
const latexCode = ref(defaultCode);
const renderedHtml = ref('');
const renderError = ref('');
const activeCategory = ref('basic');
const searchQuery = ref('');
const zoomLevel = ref(1);
const formulaColor = ref('#ff8c00'); // brilliant orange matching blog
const previewBg = ref('slate'); // slate, black, light, transparent
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

// Color options
const colorOptions = [
  { name: 'Arancione (Tema)', color: '#ff8c00' },
  { name: 'Bianco Puro', color: '#ffffff' },
  { name: 'Nero', color: '#000000' },
  { name: 'Celeste', color: '#38bdf8' },
  { name: 'Oro', color: '#fbbf24' },
  { name: 'Verde Smeraldo', color: '#34d399' },
  { name: 'Viola Chiaro', color: '#c084fc' }
];

// Background options
const bgOptions = [
  { id: 'slate', name: 'Scuro Slate', icon: '⬛' },
  { id: 'black', name: 'Nero Profondo', icon: '🖤' },
  { id: 'light', name: 'Chiaro', icon: '⬜' },
  { id: 'transparent', name: 'Trasparente', icon: '🏁' }
];

// Stats
const charCount = computed(() => latexCode.value.length);
const lineCount = computed(() => latexCode.value.split('\n').length);

// Category icon helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Plus': return Plus;
    case 'Sparkles': return Sparkles;
    case 'Activity': return Activity;
    case 'Grid': return Grid;
    case 'Maximize': return Maximize;
    case 'Layers': return Layers;
    case 'ArrowRight': return ArrowRight;
    case 'Type': return Type;
    case 'AlignLeft': return AlignLeft;
    default: return Sparkles;
  }
};

// Filtered symbols based on active category or search query
const displayedSymbols = computed<LatexSymbol[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    const allSyms: LatexSymbol[] = [];
    LATEX_CATEGORIES.forEach(cat => {
      cat.symbols.forEach(s => {
        if (
          s.name.toLowerCase().includes(q) ||
          s.latex.toLowerCase().includes(q) ||
          (s.desc && s.desc.toLowerCase().includes(q))
        ) {
          allSyms.push(s);
        }
      });
    });
    return allSyms;
  }

  const currentCat = LATEX_CATEGORIES.find(c => c.id === activeCategory.value);
  return currentCat ? currentCat.symbols : [];
});

// Cache for symbol buttons rendering
const symbolHtmlCache = new Map<string, string>();
const renderSymbolButton = (latex: string): string => {
  if (symbolHtmlCache.has(latex)) return symbolHtmlCache.get(latex)!;
  try {
    const html = katex.renderToString(latex, {
      displayMode: false,
      throwOnError: false
    });
    symbolHtmlCache.set(latex, html);
    return html;
  } catch {
    return latex;
  }
};

const renderKatexInline = (latex: string): string => {
  try {
    return katex.renderToString(latex, { displayMode: true, throwOnError: false });
  } catch {
    return latex;
  }
};

// Main KaTeX rendering logic
const renderCurrentCode = () => {
  const code = latexCode.value.trim();
  if (!code) {
    renderedHtml.value = '';
    renderError.value = '';
    return;
  }

  try {
    const html = katex.renderToString(code, {
      displayMode: true,
      throwOnError: true
    });
    renderedHtml.value = html;
    renderError.value = '';
  } catch (err: any) {
    renderError.value = err?.message || 'Errore nella formula LaTeX';
    // Fallback: render with throwOnError=false so partial math still shows
    try {
      renderedHtml.value = katex.renderToString(code, {
        displayMode: true,
        throwOnError: false
      });
    } catch {
      renderedHtml.value = '';
    }
  }
};

// History management
const pushHistory = (code: string) => {
  if (isHistoryNav.value) return;
  if (history.value[historyIndex.value] === code) return;

  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push(code);
  if (history.value.length > 50) history.value.shift();
  historyIndex.value = history.value.length - 1;

  // Persist locally
  try {
    localStorage.setItem('astro_latex_draft', code);
  } catch {
    // ignore
  }
};

const undo = () => {
  if (historyIndex.value > 0) {
    isHistoryNav.value = true;
    historyIndex.value--;
    latexCode.value = history.value[historyIndex.value];
    renderCurrentCode();
    setTimeout(() => { isHistoryNav.value = false; }, 50);
  }
};

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    isHistoryNav.value = true;
    historyIndex.value++;
    latexCode.value = history.value[historyIndex.value];
    renderCurrentCode();
    setTimeout(() => { isHistoryNav.value = false; }, 50);
  }
};

const onCodeInput = () => {
  renderCurrentCode();
  pushHistory(latexCode.value);
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
  }
};

// Insert symbol at cursor position
const insertSymbol = (sym: LatexSymbol) => {
  const textarea = editorRef.value;
  const snippet = sym.snippet || sym.latex;

  if (!textarea) {
    latexCode.value += ' ' + snippet;
    onCodeInput();
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const original = latexCode.value;
  const selectedText = original.substring(start, end);

  let insertion = snippet;
  if (selectedText && snippet.includes('{a}')) {
    insertion = snippet.replace('{a}', `{${selectedText}}`);
  } else if (selectedText && snippet.includes('{x}')) {
    insertion = snippet.replace('{x}', `{${selectedText}}`);
  }

  const newText = original.substring(0, start) + insertion + original.substring(end);
  latexCode.value = newText;
  onCodeInput();

  // Reposition cursor
  setTimeout(() => {
    textarea.focus();
    const newPos = start + insertion.length;
    textarea.setSelectionRange(newPos, newPos);
  }, 10);

  showToast(`Simbolo inserito: ${sym.name}`);
};

// Wrap current selection
const wrapSelection = (before: string, after: string) => {
  const textarea = editorRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const original = latexCode.value;
  const selected = original.substring(start, end);

  const replacement = `${before}${selected}${after}`;
  latexCode.value = original.substring(0, start) + replacement + original.substring(end);
  onCodeInput();

  setTimeout(() => {
    textarea.focus();
    if (selected) {
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    } else {
      const pos = start + before.length;
      textarea.setSelectionRange(pos, pos);
    }
  }, 10);
};

const confirmClear = () => {
  if (confirm('Sei sicuro di voler cancellare tutto il codice?')) {
    latexCode.value = '';
    onCodeInput();
    showToast('Editor svuotato');
  }
};

const selectCategory = (id: string) => {
  activeCategory.value = id;
  searchQuery.value = '';
};

const loadTemplate = (tpl: LatexTemplate) => {
  latexCode.value = tpl.latex;
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
const handleCopyLatex = async () => {
  const success = await copyToClipboard(latexCode.value);
  if (success) showToast('Codice LaTeX copiato negli appunti!');
};

const handleCopyMarkdown = async () => {
  const md = `$$\n${latexCode.value}\n$$`;
  const success = await copyToClipboard(md);
  if (success) showToast('Formato Markdown ($$...$$) copiato!');
};

const handleCopyMathML = async () => {
  const mathml = getMathML(latexCode.value);
  if (mathml) {
    const success = await copyToClipboard(mathml);
    if (success) showToast('MathML copiato negli appunti!');
  } else {
    showToast('Impossibile generare MathML per questa formula');
  }
};

// Export actions
const handleExportPNG = async () => {
  const el = (renderedContainerRef.value?.querySelector('.katex-display') ||
    renderedContainerRef.value?.querySelector('.katex') ||
    renderedContainerRef.value) as HTMLElement;
  if (!el) return;

  showToast('Generazione immagine PNG ad alta risoluzione...');
  const success = await exportToPNG(el, {
    backgroundColor: previewBg.value === 'transparent' ? 'transparent' : previewBg.value === 'light' ? '#ffffff' : previewBg.value === 'black' ? '#000000' : '#181825',
    textColor: previewBg.value === 'light' && (formulaColor.value === '#ffffff' || !formulaColor.value) ? '#000000' : formulaColor.value,
    scale: 2.5,
    filename: 'formula_latex.png'
  });

  if (success) {
    showToast('Immagine PNG scaricata con successo!');
  } else {
    // Se la rasterizzazione su canvas è bloccata dall'ambiente browser, scarica SVG vettoriale di fallback
    handleExportSVG();
    showToast('Download PNG non supportato: esportato come SVG ad alta definizione!');
  }
};

const handleExportSVG = () => {
  const el = (renderedContainerRef.value?.querySelector('.katex-display') ||
    renderedContainerRef.value?.querySelector('.katex') ||
    renderedContainerRef.value) as HTMLElement;
  if (!el) return;
  exportToSVG(el, {
    backgroundColor: previewBg.value === 'transparent' ? 'transparent' : previewBg.value === 'light' ? '#ffffff' : previewBg.value === 'black' ? '#000000' : '#181825',
    textColor: previewBg.value === 'light' && (formulaColor.value === '#ffffff' || !formulaColor.value) ? '#000000' : formulaColor.value,
    filename: 'formula_latex.svg'
  });
  showToast('File vettoriale SVG scaricato!');
};

const handleDownloadTex = () => {
  downloadTexFile(latexCode.value, 'documento_formula.tex');
  showToast('File sorgente .tex scaricato!');
};

const handlePrint = () => {
  printFormula(latexCode.value, renderedHtml.value);
};

// Mount & restore
onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).__hideGlobalLoader) {
    (window as any).__hideGlobalLoader();
  }
  try {
    const saved = localStorage.getItem('astro_latex_draft');
    if (saved && saved.trim()) {
      latexCode.value = saved;
      history.value = [saved];
    }
  } catch {
    // ignore
  }
  renderCurrentCode();
});

watch(latexCode, () => {
  renderCurrentCode();
});
</script>

<style scoped>
/* RESET & LAYOUT */
.latex-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f1015;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  user-select: none;
}

/* TOP HEADER */
.latex-header {
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

.latex-logo {
  font-family: "Times New Roman", Times, serif;
  font-weight: bold;
  font-size: 1.3rem;
  letter-spacing: -1px;
  color: #ff8c00;
}

.latex-logo .sub {
  text-transform: uppercase;
  font-size: 0.85em;
  vertical-align: -0.15em;
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

.template-mini-preview {
  font-size: 0.85rem;
  color: #cbd5e1;
  background: #0f1015;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  overflow-x: auto;
}

/* PALETTE SIMBOLI */
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

.symbol-search {
  position: relative;
  width: 18rem;
  max-width: 100%;
}

.symbol-search .search-icon {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.95rem;
  height: 0.95rem;
  color: #64748b;
  pointer-events: none;
}

.symbol-search .search-input {
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

.symbol-search .search-input:focus {
  border-color: #ff8c00;
  background: rgba(255, 255, 255, 0.08);
}

.symbol-search .search-clear {
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}

/* SYMBOLS GRID */
.symbols-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-height: 8.5rem;
  overflow-y: auto;
  padding-right: 0.3rem;
}

.symbol-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 2.8rem;
  max-width: 5rem;
  height: 2.6rem;
  padding: 0.2rem 0.5rem;
  background: #1b1c2a;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 6px;
  cursor: pointer;
  color: #f8fafc;
  transition: all 0.12s ease;
  overflow: hidden;
}

.symbol-btn:hover {
  background: rgba(255, 140, 0, 0.18);
  border-color: rgba(255, 140, 0, 0.45);
  transform: translateY(-1px);
}

.symbol-preview {
  font-size: 1.05rem;
  line-height: 1.2;
  max-width: 100%;
  max-height: 1.6rem;
  overflow: hidden;
}

/* Le formule dentro i pulsanti (es. matrici, sistemi) si restringono se troppo larghe */
.symbol-preview :deep(.katex) {
  font-size: 0.85em;
  max-width: 100%;
}

.symbol-label {
  display: none; /* Accessible title handles it, keep grid compact like Lagrida */
}

.no-symbols {
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

.latex-textarea {
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  background: #0d0e14;
  color: #e2e8f0;
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
  font-size: 1rem;
  line-height: 1.7;
  tab-size: 2;
  user-select: text;
}

.latex-textarea::placeholder {
  color: #475569;
}

/* SYNTAX ERROR */
.syntax-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.12);
  border-top: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 0.8rem;
}

.error-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.error-title {
  font-weight: 600;
  color: #f87171;
}

.error-msg {
  font-family: monospace;
  font-size: 0.76rem;
  opacity: 0.9;
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

.color-picker-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.color-dot {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.color-dot:hover {
  transform: scale(1.2);
}

.color-dot.is-selected {
  outline: 2px solid #ffffff;
  outline-offset: 1px;
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
  display: flex;
  align-items: center;
  justify-content: center;
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

.rendered-math-container {
  display: inline-block;
  max-width: 100%;
  user-select: text;
  transition: transform 0.1s ease;
}

.katex-output {
  font-size: 1.85rem;
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
  .symbol-search {
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
  .latex-header {
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
