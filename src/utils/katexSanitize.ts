import DOMPurify from 'dompurify'

/**
 * Sanitizzazione dell'HTML generato da KaTeX.
 *
 * Necessaria per CVE-2026-103923 (GHSA-238p-pmpm-9mq7, KaTeX < 0.18.2):
 * in presenza di prototype pollution (Object.prototype.trust definito altrove),
 * KaTeX può renderizzare \href{javascript:...} e \includegraphics esterni.
 * Ilsanitizer elimina URL javascript:, gestori di eventi inline e framing.
 *
 * La config preserva l'HTML MathML di KaTeX (tag/attributi MathML, style inline
 * e aria-hidden) usato anche dal rendering delle formule nei topic md.
 */
const KATEX_MATHML_TAGS = ['math', 'maction', 'maligngroup', 'malignmark', 'menclose', 'merror',
  'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mlongdiv', 'mmultiscripts',
  'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mscarries',
  'mscarry', 'msgroup', 'mstack', 'msline', 'mspace', 'msqrt', 'msrow', 'mstyle',
  'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder',
  'munderover', 'semantics', 'annotation', 'annotation-xml']

const KATEX_MATHML_ATTRS = ['mathvariant', 'encoding', 'xmlns', 'overflow', 'lspace', 'rspace',
  'accent', 'accentunder', 'bevelled', 'close', 'columnspan', 'denomalign',
  'depth', 'dir', 'display', 'displaystyle', 'fence', 'frame', 'largeop',
  'length', 'linethickness', 'lquote', 'mathsize', 'minsize', 'maxsize',
  'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowspan',
  'rquote', 'scriptlevel', 'separator', 'separators', 'stretchy', 'symmetric',
  'voffset', 'aria-hidden', 'style']

export function sanitizeKatexHtml(html: string, opts: { /** Blocca anche i tag img (per input utente arbitrario, es. \includegraphics) */ forbidImages?: boolean; /** Blocca ogni tag elencato (es. form/input per preview di markup arbitrario) */ forbidTags?: string[] } = {}): string {
  // FORBID_TAGS è un'unica lista: unire i tag vietati da tutte le opzioni
  const forbid = new Set<string>()
  if (opts.forbidImages) forbid.add('img')
  if (opts.forbidTags?.length) opts.forbidTags.forEach(t => forbid.add(t))
  return DOMPurify.sanitize(html, {
    ADD_TAGS: KATEX_MATHML_TAGS,
    ADD_ATTR: KATEX_MATHML_ATTRS,
    ...(forbid.size ? { FORBID_TAGS: [...forbid] } : {}),
  })
}
