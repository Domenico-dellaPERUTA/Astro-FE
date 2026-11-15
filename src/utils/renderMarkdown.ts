/**
 * renderMarkdown.ts
 *
 * Pipeline di rendering condivisa tra il browser (TopicPage.vue) e la build
 * Astro ([...slug].astro): garantire che l'HTML statico pre-idratazione
 * (SSR underlay) sia IDENTICO a quello che l'app Vue genera nel browser.
 *
 * Stessa catena di TopicPage:
 *   marked (+ estensione KaTeX, $...$ e $$...$$)
 *   → renderer personalizzato con highlight.js per i blocchi di codice
 *   → sanitizzazione con config KaTeX (src/utils/katexSanitize.ts)
 */
import { marked, Renderer } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'
import DOMPurify from 'isomorphic-dompurify'
import { sanitizeKatexHtml } from './katexSanitize'
// Funzioni pure senza dipendenze (usate anche da TopicPage senza importare marked+hljs)
export { cleanCode, escapeHtml } from './cleanCode'

// Enable KaTeX math rendering in marked ($...$ for inline, $$...$$ for display)
marked.use(markedKatex({ throwOnError: false }))

// Configure marked with a custom renderer for syntax highlighting
const mdRenderer = new Renderer()
mdRenderer.code = function({ text, lang }: { text: string; lang?: string }) {
  let highlighted: string
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(text, { language: lang }).value
    } catch (__) {
      highlighted = text
    }
  } else {
    // Auto-detect language if not specified
    try {
      highlighted = hljs.highlightAuto(text).value
    } catch (__) {
      highlighted = text
    }
  }
  const langClass = lang ? ` language-${lang}` : ''
  return `<pre class="hljs-pre"><code class="hljs${langClass}">${highlighted}</code></pre>`
}

marked.setOptions({ renderer: mdRenderer })

/**
 * Renderizza markdown → HTML sanitizzato (config KaTeX).
 * In caso di errore di parsing sanifica il sorgente grezzo
 * (stesso comportamento dei rami md di TopicPage).
 */
export function renderMarkdown(md: string): string {
  const src = md || ''
  try {
    const raw = marked(src) as string
    return sanitizeKatexHtml(raw)
  } catch (e) {
    console.error('[renderMarkdown] Markdown parse error:', e)
    return sanitizeKatexHtml(src)
  }
}

/**
 * Sanitizzazione dell'HTML grezzo delle pagine type:"html"
 * (config DOMPurify default, come il ramo html di TopicPage).
 * Funziona sia nel browser sia alla build (isomorphic-dompurify).
 */
export function sanitizePageHtml(html: string): string {
  return DOMPurify.sanitize(html) || ''
}
