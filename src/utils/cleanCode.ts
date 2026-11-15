/**
 * cleanCode.ts
 *
 * Utilità pure (zero dipendenze) condivise da TopicPage e dalla build.
 * Vivono in un modulo separato dalla pipeline markdown (renderMarkdown.ts)
 * perché quelle (marked + highlight.js, ~1 MB) vengono caricate lazy nel
 * browser solo dove servono (pagine "md"), mentre queste servono subito.
 */

/** 🧹 Pulisce il codice dai tag personalizzati /_ _/ e dai triple backticks */
export function cleanCode(rawCode: string): string {
  if (!rawCode) return ''
  return rawCode
    .replace(/\/_/g, '/*')         // Converte /_ in /*
    .replace(/_\//g, '*/')         // Converte _/ in */
    .replace(/\\\*/g, '*')         // Converte \* in * (trasforma /\* e \*/ in /* e */)
    .replace(/```[a-z]*\n?/gi, '') // Rimuove triple backticks iniziali
    .replace(/```/g, '')           // Rimuove triple backticks finali
    .trim()
}

/** Escape HTML per mostrare codice come testo dentro <pre><code> */
export function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
