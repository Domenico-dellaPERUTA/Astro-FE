// app/components/MarkdownEditor/markdownExporter.ts
// Motore di rendering ed esportazione per l'Editor Markdown Online.
// Stesso motore delle pagine topic (marked + KaTeX + highlight.js) così che
// l'anteprima rispecchi fedelmente come il documento verrà mostrato nel sito.

import { marked, Renderer } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'

import { sanitizeKatexHtml } from '../../utils/katexSanitize'

// Controlli di form meglio non mostrarli: DOMPurify di default li consente (inerti),
// ma in un'anteprima di documento Markdown non hanno senso e sporcano solo la visualizzazione
const EDITOR_FORBID_TAGS = ['form', 'input', 'button', 'select', 'option', 'optgroup', 'textarea', 'keygen', 'datalist']

// Utilità generiche già collaudate dall'Editor LaTeX (clipboard + download file)
import { copyToClipboard, downloadFile } from '../LatexEditor/latexExporter'

export { copyToClipboard }

// ─────────────────────────────────────────────────────────────
// Configurazione marked: math $...$ / $$...$$ + sintassi evidenziata
// ─────────────────────────────────────────────────────────────

marked.use(markedKatex({ throwOnError: false }))

const mdRenderer = new Renderer()
mdRenderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  let highlighted: string
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(text, { language: lang }).value
    } catch {
      highlighted = text
    }
  } else {
    try {
      highlighted = hljs.highlightAuto(text).value
    } catch {
      highlighted = text
    }
  }
  const langClass = lang ? ` language-${lang}` : ''
  return `<pre class="hljs-pre"><code class="hljs${langClass}">${highlighted}</code></pre>`
}

marked.setOptions({ renderer: mdRenderer })

/** Renderizza Markdown in HTML sicuro (sanitizzato come nelle pagine del sito, + divieto controlli di form). */
export function renderMarkdown(markdown: string): string {
  try {
    const raw = marked(markdown || '') as string
    return sanitizeKatexHtml(raw, { forbidTags: EDITOR_FORBID_TAGS })
  } catch (err) {
    console.error('Markdown render error:', err)
    return '<p><em>Errore nel rendering del Markdown.</em></p>'
  }
}

// ─────────────────────────────────────────────────────────────
// Documento HTML autonomo (download / stampa)
// ─────────────────────────────────────────────────────────────

const MD_DOC_CSS = `
  body { font-family: Georgia, 'Times New Roman', serif; color: #222; background: #fff;
         max-width: 56rem; margin: 0 auto; padding: 3rem 2rem; line-height: 1.7; font-size: 1.05rem; }
  h1, h2, h3, h4 { font-family: Georgia, 'Times New Roman', serif; line-height: 1.25; }
  h1 { font-size: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: .4rem; }
  h2 { font-size: 1.5rem; border-left: 4px solid #3b82f6; padding-left: .8rem; margin-top: 2rem; }
  h3 { font-size: 1.2rem; margin-top: 1.6rem; }
  pre.hljs-pre, pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem 1.25rem; border-radius: 10px;
         overflow-x: auto; font-family: 'JetBrains Mono', Consolas, Menlo, monospace; font-size: .85rem; line-height: 1.6; }
  code { font-family: 'JetBrains Mono', Consolas, Menlo, monospace; background: #e8eaed; color: #d2386c;
         padding: .12rem .4rem; border-radius: 4px; font-size: .85em; }
  pre code { background: transparent; color: inherit; padding: 0; border: none; font-size: inherit; }
  blockquote { border-left: 4px solid #4299e1; background: #ebf8ff; color: #2c5282;
         margin: 1rem 0; padding: .7rem 1rem; border-radius: 0 4px 4px 0; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
  th, td { border: 1px solid #e2e8f0; padding: .45rem .6rem; text-align: left; }
  th { background: #edf2f7; }
  img { max-width: 100%; height: auto; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.6rem 0; }
  a { color: #0366d6; }
  .doc-footer { margin-top: 3rem; padding-top: 1rem; border-top: 2px solid #ff8c00;
         font-family: system-ui, sans-serif; font-size: .78rem; color: #64748b; }
  input[type="checkbox"] { vertical-align: middle; margin-right: .35rem; }
`

/**
 * SRI dei fogli di stile caricati da CDN nel documento autonomo: se il contenuto
 * di jsDelivr fosse compromesso, il browser rifiuta il download degli asset.
 * Hash calcolati sui byte esatti degli URL fissati in versione.
 */
const CDN_CSS_INTEGRITY = {
  katex: 'sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib',
  hljs: 'sha384-wH75j6z1lH97ZOpMOInqhgKzFkAInZPPSPlZpYKYTOqsaizPvhQZmAtLcPKXpLyH'
}

function buildHtmlDocument(markdownSource: string, renderedHtml: string): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Documento Markdown</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" crossorigin="anonymous" integrity="${CDN_CSS_INTEGRITY.katex}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/github-dark.min.css" crossorigin="anonymous" integrity="${CDN_CSS_INTEGRITY.hljs}">
  <style>${MD_DOC_CSS}</style>
</head>
<body>
  ${renderedHtml}
  <div class="doc-footer">Generato dall'Editor Markdown Online · ${dateStr}</div>
</body>
</html>`
}

/** Scarica il sorgente Markdown come file .md */
export function downloadMarkdownFile(markdown: string, filename: string = 'documento.md') {
  downloadFile(markdown, filename, 'text/markdown;charset=utf-8')
}

/** Scarica un documento HTML autonomo (stile + KaTeX via CDN) */
export function downloadHtmlFile(markdownSource: string, renderedHtml: string, filename: string = 'documento.html') {
  downloadFile(buildHtmlDocument(markdownSource, renderedHtml), filename, 'text/html;charset=utf-8')
}

/** Stampa / salva in PDF il documento renderizzato */
export function printMarkdown(markdownSource: string, renderedHtml: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=900')
  if (!printWindow) return

  printWindow.document.write(buildHtmlDocument(markdownSource, renderedHtml))
  printWindow.document.close()

  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    // Lascia la finestra aperta per consentire la scelta della destinazione
  }
}
