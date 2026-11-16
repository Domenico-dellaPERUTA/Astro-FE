#!/usr/bin/env node
/**
 * chess-audio.mjs — Manifest delle clip audio condivise per le pagine ♟️ chess
 *
 * Le clip audio che spiegano le mosse sono una LIBRERIA CONDIVISA: partite
 * diverse che condividono l'apertura riusano le stesse clip. La chiave di una
 * clip è la sequenza SAN delle mosse fino a quella spiegata, senza glifi
 * (+ # ! ?), uniti da "_":  e4_e5_Nf3_f6  →  /audio/chess/e4_e5_Nf3_f6.mp3
 *
 * Questo script:
 *   1. scandisce src/content/topics/*.md con type: "chess"
 *   2. per ogni partita estrae i commenti PGN {...} con chess.js
 *   3. calcola la chiave condivisa di ogni mossa commentata
 *   4. scrive public/audio/chess/manifest.json (chiave → testo da narrare)
 *      pronto come lista di lavoro per la pipeline TTS (genera_clip.py)
 *   5. segnala i CONFLITTI: stessa sequenza di mosse con testi diversi
 *      (la prima pagina vince; conviene uniformare il testo nel PGN)
 *
 * Uso:  node scripts/chess-audio.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { Chess } from 'chess.js'

const TOPICS_DIR = new URL('../src/content/topics/', import.meta.url)
const OUT_DIR = new URL('../public/audio/chess/', import.meta.url)

/** Estrae un campo dal frontmatter: valore inline, o blocco folded >- (pgn) */
function readField(raw, field) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  if (!m) return null
  const lines = m[1].split(/\r?\n/)
  const start = lines.findIndex(l => new RegExp(`^${field}:\\s*(.*)$`).test(l))
  if (start < 0) return null
  const first = new RegExp(`^${field}:\\s*(.*)$`).exec(lines[start])[1].trim()
  if (first && !['>', '>-', '|', '|-'].includes(first)) {
    return first.replace(/^["']|["']$/g, '')
  }
  // Blocco scalare: righe rientrate successive, i ritorni a capo diventano spazi
  const rest = []
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\S/.test(lines[i])) break // nuova chiave top-level
    rest.push(lines[i].trim())
  }
  return rest.join(' ')
}

/** Italian notation → SAN  (solo fuori dai commenti {…}) */
function italianToEnglish(pgn) {
  if (!pgn || /[NBQK]/.test(pgn)) return pgn || ''
  const map = { T: 'R', C: 'N', A: 'B', D: 'Q', R: 'K' }
  return pgn.split(/(\{[^}]*\})/g)
    .map(part => part.startsWith('{')
      ? part
      : part.replace(/[TCADR]/g, m => map[m]))
    .join('')
}

const entries = readdirSync(TOPICS_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'))
const library = new Map()   // key → { text, page, moves }
const conflicts = []
const parseErrors = []

for (const file of entries) {
  const raw = readFileSync(join(TOPICS_DIR.pathname, file), 'utf8')
  if (readField(raw, 'type') !== 'chess') continue
  const pgn = readField(raw, 'pgn')
  if (!pgn) continue

  let chess
  try {
    chess = new Chess()
    chess.loadPgn(italianToEnglish(pgn))
  } catch (e) {
    parseErrors.push(`${file}: ${e.message}`)
    continue
  }

  const history = chess.history({ verbose: true })
  const comments = new Map(chess.getComments().map(k => [k.fen, k.comment]))
  let key = ''

  history.forEach((move, i) => {
    key = (key ? key + '_' : '') + move.san.replace(/[+#!?]/g, '')
    const comment = comments.get(move.after)
    if (!comment) return

    const existing = library.get(key)
    if (existing && existing.text !== comment) {
      conflicts.push(`"${key}": "${existing.text}" (${existing.page}) ≠ "${comment}" (${file})`)
      return
    }
    library.set(key, { text: comment, page: file, moves: i + 1 })
  })
}

const manifest = Object.fromEntries(
  [...library.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, v]) => [key, v.text])
)

mkdirSync(OUT_DIR.pathname, { recursive: true })
writeFileSync(join(OUT_DIR.pathname, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

console.log(`♟️  ${library.size} clip mappate → public/audio/chess/manifest.json`)
if (conflicts.length) {
  console.log(`\n⚠️  ${conflicts.length} conflitti (stessa sequenza, testi diversi):`)
  for (const c of conflicts) console.log('   - ' + c)
}
if (parseErrors.length) {
  console.log(`\n❌ PGN non validi:`)
  for (const e of parseErrors) console.log('   - ' + e)
  process.exitCode = 1
}
if (!conflicts.length && !parseErrors.length) console.log('   nessun conflitto, tutti i PGN validi ✓')
