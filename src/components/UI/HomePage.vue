<template>
  <div ref="container" class="home-container" :class="{ 'intro-open': introVisible }">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    <svg ref="edges" class="edges" aria-hidden="true"></svg>
    <div ref="layer" class="nodes-layer"></div>

    <Transition name="intro">
      <div v-if="introVisible" class="intro" @click="dismissIntro">
        <div class="intro-inner">
          <h1 class="intro-title">
            <span
              v-for="(w, i) in titleWords"
              :key="i"
              class="tw"
              :class="{ hl: w.hl }"
              :style="{ animationDelay: (0.15 + i * 0.14) + 's' }"
              >{{ w.t }}</span
            >
          </h1>
          <p class="intro-sub"><span class="typed">{{ typed }}</span><i class="caret"></i></p>
          <p class="firma"><span class="firma-by">by</span> Domenico della Peruta</p>
        </div>
        <div class="intro-skip">tocca per continuare</div>
      </div>
    </Transition>

    <Transition name="hint">
      <div v-if="hintVisible" class="graph-hint">
        tocca un nodo per aprirlo · tocca <b>✦</b> al centro per resettare
      </div>
    </Transition>

    <div class="footer-links">
      <a
        target="_blank"
        rel="noopener noreferrer nofollow"
        class="footer-link iubenda-privacy-policy"
        href="https://www.iubenda.com/privacy-policy/63164304"
        >Privacy Policy</a
      >
      <span class="separator">|</span>
      <a
        rel="noreferrer nofollow"
        class="footer-link iubenda-advertising-preferences-link"
        href="javascript:void(0)"
        >Personalizza tracciamento</a
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMenuStore } from '../../store/menu'

const { treeMenu } = useMenuStore()

const container = ref(null)
const bgCanvas = ref(null)
const edges = ref(null)
const layer = ref(null)

const introVisible = ref(true)
const hintVisible = ref(false)
const typed = ref('')

const titleWords = [
  { t: 'Benvenuto' },
  { t: 'nei' },
  { t: 'miei' },
  { t: 'Appunti', hl: true }
]

const phrases = [
  '240 appunti, 7 mondi da esplorare.',
  'programmazione · scacchi · intelligenza artificiale.',
  'un grafo vivo al posto del solito menu.'
]

const TYPE_ICON = {
  code: '💻',
  md: '📝',
  html: '🌐',
  carousel: '🎞️',
  video: '🎬',
  dictionary: '📖',
  chess: '♟️'
}

let typeTimer = null
let autoTimer = null
let hintTimer = null
let dismissed = false

function startTypewriter() {
  let pi = 0
  let ci = 0
  let deleting = false
  const step = () => {
    const p = phrases[pi]
    if (!deleting) {
      ci++
      typed.value = p.slice(0, ci)
      if (ci >= p.length) {
        deleting = true
        typeTimer = setTimeout(step, 1500)
        return
      }
      typeTimer = setTimeout(step, 52)
    } else {
      ci--
      typed.value = p.slice(0, ci)
      if (ci <= 0) {
        deleting = false
        pi = (pi + 1) % phrases.length
        typeTimer = setTimeout(step, 350)
        return
      }
      typeTimer = setTimeout(step, 22)
    }
  }
  typeTimer = setTimeout(step, 700)
}

function dismissIntro() {
  if (dismissed) return
  dismissed = true
  if (typeTimer) clearTimeout(typeTimer)
  if (autoTimer) clearTimeout(autoTimer)
  introVisible.value = false
  hintVisible.value = true
  hintTimer = setTimeout(() => {
    hintVisible.value = false
  }, 8000)
}

const EMOJI_RE = /(?:[\u{1F1E6}-\u{1F1FF}]{2}|[\p{Extended_Pictographic}\u{2600}-\u{27BF}\u{FE0F}]+)/u

function emojiOf(name) {
  const m = String(name || '').match(EMOJI_RE)
  return m ? m[0] : ''
}

function initialOf(name) {
  const s = String(name || '').replace(/[^\p{L}\p{N}]+/gu, '')
  return (s.charAt(0) || '?').toUpperCase()
}

const NS = 'http://www.w3.org/2000/svg'
const PAD = 16
const PROX_LIMIT = 180
const PROX_POOL = 150

const nodes = new Map()
const mounted = new Map()
let active = []
let rootIds = []
let W = 0
let H = 0
let cx = 0
let cy = 0
let rx = 0
let ry = 0
let mouse = { x: -9999, y: -9999, in: false }
let treeLines = new Map()
let proxPool = []
let proxIdx = 0
let treeG = null
let proxG = null
let raf = 0
let ro = null
let ambient = []
let ambientApi = null
let onResize = null

function maxKids() {
  return W < 700 ? 6 : 9
}

function radiusFor(kind, depth) {
  const s = W < 700 ? 0.84 : 1
  if (kind === 'hub') return 40 * s
  if (kind === 'folder') return (depth === 0 ? 37 : 27) * s
  if (kind === 'more') return 21 * s
  return 20 * s
}

function makeNode(p) {
  const n = Object.assign(
    {
      id: '',
      label: '',
      kind: 'leaf',
      link: null,
      type: null,
      depth: 0,
      parentId: null,
      childrenIds: [],
      expanded: false,
      batch: 0,
      r: 20,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      hx: 0,
      hy: 0,
      phase: Math.random() * Math.PI * 2,
      spawned: false
    },
    p
  )
  n.r = radiusFor(n.kind, n.depth)
  nodes.set(n.id, n)
  return n
}

function buildSource(items, depth, parentId) {
  const ids = []
  if (!Array.isArray(items)) return ids
  for (const it of items) {
    if (!it || !it.name) continue
    const id = (parentId ? parentId + '/' : '') + it.name
    const isFolder = it.isFolder === true && Array.isArray(it.menu)
    const n = makeNode({
      id,
      label: it.name,
      kind: isFolder ? 'folder' : 'leaf',
      link: it.link || null,
      type: it.type || null,
      depth,
      parentId
    })
    if (isFolder) {
      n.childrenIds = buildSource(it.menu, depth + 1, id)
      if (!n.childrenIds.length && it.link) n.kind = 'leaf'
    }
    ids.push(id)
  }
  return ids
}

function ensureMore(parent, rest) {
  const id = parent.id + '##more'
  let m = nodes.get(id)
  if (!m) {
    m = makeNode({
      id,
      label: '+',
      kind: 'more',
      depth: parent.depth + 1,
      parentId: parent.id
    })
    m.x = parent.x
    m.y = parent.y
    m.spawned = true
  }
  m.rest = rest
  return m
}

function visibleChildrenIds(n) {
  if (n.kind !== 'folder' || !n.expanded) return []
  const all = n.childrenIds
  if (!all.length) return []
  const max = maxKids()
  const cap = Math.max(0, Math.ceil(all.length / max) - 1)
  if (n.batch > cap) n.batch = cap
  const start = n.batch * max
  const slice = all.slice(start, start + max)
  const ids = slice.slice()
  const rest = all.length - start - slice.length
  if (rest > 0) {
    ensureMore(n, rest)
    ids.push(n.id + '##more')
  }
  return ids
}

function computeVisibleIds() {
  const out = ['hub']
  const walk = (id) => {
    out.push(id)
    const n = nodes.get(id)
    if (n.kind === 'folder' && n.expanded) {
      for (const cid of visibleChildrenIds(n)) walk(cid)
    }
  }
  for (const id of rootIds) walk(id)
  return out
}

function glyphFor(n) {
  if (n.kind === 'hub') return '✦'
  if (n.kind === 'more') return '+'
  if (n.kind === 'folder') return emojiOf(n.label) || initialOf(n.label)
  return TYPE_ICON[n.type] || initialOf(n.label)
}

function createEl(n) {
  const isLink = n.kind === 'leaf' && !!n.link
  const el = document.createElement(isLink ? 'a' : 'button')
  el.setAttribute('aria-label', n.kind === 'more' ? 'mostra altri ' + n.rest + ' elementi' : n.label)
  if (isLink) {
    el.setAttribute('href', n.link)
  } else {
    el.setAttribute('type', 'button')
    if (n.kind === 'folder') el.setAttribute('aria-expanded', 'false')
  }
  el.className = 'gn gn-' + n.kind + ' gn-d' + n.depth
  el.style.setProperty('--r', n.r + 'px')

  const disc = document.createElement('span')
  disc.className = 'gn-disc'
  const glyph = document.createElement('span')
  glyph.className = 'gn-glyph'
  glyph.textContent = glyphFor(n)
  disc.appendChild(glyph)

  const label = document.createElement('span')
  label.className = 'gn-label'
  label.textContent = n.kind === 'more' ? '+' + n.rest : n.label
  label.title = n.kind === 'more' ? '+' + n.rest + ' altri' : n.label

  el.append(disc, label)
  if (!isLink) {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      onNodeClick(n)
    })
  }
  return el
}

function syncStructure() {
  const ids = computeVisibleIds()
  const set = new Set(ids)

  for (const [id, el] of Array.from(mounted)) {
    if (!set.has(id)) {
      el.remove()
      mounted.delete(id)
    }
  }

  let added = 0
  const fresh = []
  for (const id of ids) {
    if (mounted.has(id)) continue
    const n = nodes.get(id)
    const parent = n.parentId ? nodes.get(n.parentId) : null
    if (!n.spawned) {
      n.x = parent ? parent.x : cx
      n.y = parent ? parent.y : cy
      n.vx = 0
      n.vy = 0
      n.spawned = true
    }
    if (parent) {
      const a = Math.random() * Math.PI * 2
      n.vx += Math.cos(a) * 2.6
      n.vy += Math.sin(a) * 2.6
    }
    const el = createEl(n)
    layer.value.appendChild(el)
    mounted.set(id, el)
    el.style.setProperty('--d', Math.min(added * 0.05, 0.7) + 's')
    fresh.push(n)
    added++
  }

  active = []
  for (const id of ids) active.push(nodes.get(id))

  if (fresh.length) makeRoom(fresh)

  for (const [id, el] of mounted) {
    const n = nodes.get(id)
    const open = n.kind === 'folder' && n.expanded
    el.classList.toggle('is-open', open)
    if (el.tagName === 'BUTTON') el.setAttribute('aria-expanded', open ? 'true' : 'false')
  }

  syncTreeLines()
  updateFocus()
}

let focusOn = false

function updateFocus() {
  const expanded = []
  for (const n of nodes.values()) {
    if (n.kind === 'folder' && n.expanded) expanded.push(n)
  }
  focusOn = expanded.length > 0

  if (!focusOn) {
    for (const [id, el] of mounted) el.classList.remove('is-dim')
    return
  }

  const keep = new Set(['hub'])
  const mark = (n) => {
    keep.add(n.id)
    let p = n.parentId ? nodes.get(n.parentId) : null
    while (p) {
      keep.add(p.id)
      p = p.parentId ? nodes.get(p.parentId) : null
    }
    if (n.kind === 'folder' && n.expanded) {
      for (const cid of visibleChildrenIds(n)) {
        const c = nodes.get(cid)
        if (c) mark(c)
      }
    }
  }
  for (const n of expanded) mark(n)

  for (const [id, el] of mounted) el.classList.toggle('is-dim', !keep.has(id))
}

function makeRoom(fresh) {
  const REACH = 340
  for (const n of fresh) {
    for (const m of active) {
      if (m === n) continue
      const dx = m.x - n.x
      const dy = m.y - n.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > REACH || d < 0.001) continue
      const f = (1 - d / REACH) * 7.5
      m.vx += (dx / d) * f
      m.vy += (dy / d) * f
    }
  }
}

function onNodeClick(n) {
  if (n.kind === 'more') {
    const parent = nodes.get(n.parentId)
    if (parent) {
      parent.batch++
      syncStructure()
    }
    return
  }
  if (n.kind === 'hub') {
    resetAll()
    return
  }
  if (n.kind === 'folder') {
    n.expanded = !n.expanded
    n.batch = 0
    syncStructure()
  }
}

function resetAll() {
  for (const n of nodes.values()) {
    if (n.kind === 'folder') {
      n.expanded = false
      n.batch = 0
    }
  }
  syncStructure()
}

function syncTreeLines() {
  if (!treeG) return
  const want = new Set()
  for (const n of active) {
    if (!n.parentId || !mounted.has(n.parentId)) continue
    const key = n.parentId + '|' + n.id
    want.add(key)
    if (!treeLines.has(key)) {
      const l = document.createElementNS(NS, 'line')
      l.setAttribute('class', 'te ' + (n.depth <= 0 ? 'te-main' : 'te-sub'))
      treeG.appendChild(l)
      treeLines.set(key, l)
    }
  }
  for (const [key, l] of Array.from(treeLines)) {
    if (!want.has(key)) {
      l.remove()
      treeLines.delete(key)
    }
  }
}

function measure() {
  const rect = container.value.getBoundingClientRect()
  W = Math.max(320, rect.width)
  H = Math.max(320, rect.height)
  cx = W / 2
  cy = H / 2
  rx = Math.min(W * 0.4, W < 700 ? W * 0.4 : 540)
  ry = Math.min(H * 0.36, W < 700 ? H * 0.4 : 330)

  for (const n of nodes.values()) {
    n.r = radiusFor(n.kind, n.depth)
    const el = mounted.get(n.id)
    if (el) el.style.setProperty('--r', n.r + 'px')
  }
}

function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v
}

function ringRadius(kids) {
  let maxR = 0
  for (const k of kids) if (k.r > maxR) maxR = k.r
  const gap = W < 700 ? 50 : 74
  const need = (kids.length * (2 * maxR + gap)) / (Math.PI * 2)
  const min = 64 + maxR * 2
  let R = Math.max(120, need, min)
  R = Math.min(R, Math.max(70, W / 2 - PAD - 10), Math.max(70, (H - 120) / 2 - PAD))
  return R
}

function computeHomes(t) {
  const B = H - 120
  const hub = nodes.get('hub')
  if (hub) {
    hub.hx = cx + Math.sin(t * 0.5) * 7
    hub.hy = clamp(cy + Math.cos(t * 0.43) * 7, hub.r + PAD, B - hub.r - PAD)
  }

  const n0 = rootIds.length || 1
  for (let i = 0; i < rootIds.length; i++) {
    const n = nodes.get(rootIds[i])
    if (!n) continue
    const a = -Math.PI / 2 + (i / n0) * Math.PI * 2
    n.hx = cx + Math.cos(a) * rx + Math.sin(t * 0.55 + n.phase) * 8
    n.hy = cy + Math.sin(a) * ry + Math.cos(t * 0.48 + n.phase) * 8
  }

  for (const n of active) {
    if (n.kind !== 'folder' || !n.expanded) continue
    const kids = []
    for (const cid of visibleChildrenIds(n)) {
      const k = nodes.get(cid)
      if (k) kids.push(k)
    }
    if (!kids.length) continue

    const R = ringRadius(kids)
    const rcx = clamp(n.x, R + PAD, W - R - PAD)
    const rcy = clamp(n.y, R + PAD, B - R - PAD)
    const base = Math.atan2(n.y - cy, n.x - cx)
    const step = (Math.PI * 2) / kids.length

    for (let i = 0; i < kids.length; i++) {
      const k = kids[i]
      const a = base + step * (i + 0.5) + Math.sin(t * 0.3 + k.phase) * 0.05
      k.hx = rcx + Math.cos(a) * R + Math.sin(t * 0.7 + k.phase) * 5
      k.hy = rcy + Math.sin(a) * R + Math.cos(t * 0.62 + k.phase) * 5
    }
  }

  for (const n of active) {
    n.hx = clamp(n.hx, n.r + PAD, W - n.r - PAD)
    n.hy = clamp(n.hy, n.r + PAD, B - n.r - PAD)
  }
}

function physics() {
  for (const n of active) {
    n.vx += (n.hx - n.x) * 0.045
    n.vy += (n.hy - n.y) * 0.045
  }

  const FAR = 190
  for (let i = 0; i < active.length; i++) {
    const a = active[i]
    for (let j = i + 1; j < active.length; j++) {
      const b = active[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001
      const ux = dx / d
      const uy = dy / d
      const minD = a.r + b.r + 58
      if (d < minD) {
        const f = (1 - d / minD) * 3.1
        a.vx -= ux * f
        a.vy -= uy * f
        b.vx += ux * f
        b.vy += uy * f
      } else if (d < FAR) {
        const g = (1 - (d - minD) / (FAR - minD)) * 0.55
        a.vx -= ux * g
        a.vy -= uy * g
        b.vx += ux * g
        b.vy += uy * g
      }
    }
  }

  if (mouse.in) {
    for (const n of active) {
      const dx = mouse.x - n.x
      const dy = mouse.y - n.y
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001
      const ux = dx / d
      const uy = dy / d
      const reach = 240
      if (d < reach) {
        const f = (1 - d / reach) * 2.4
        n.vx += ux * f
        n.vy += uy * f
      }
      const keep = n.r + 48
      if (d < keep) {
        const g = (1 - d / keep) * 3.2
        n.vx -= ux * g
        n.vy -= uy * g
      }
    }
  }

  const bottom = H - 120
  for (const n of active) {
    n.vx *= 0.82
    n.vy *= 0.82
    n.x += n.vx
    n.y += n.vy

    if (n.x < n.r + PAD) { n.x = n.r + PAD; n.vx = Math.abs(n.vx) * 0.4 }
    if (n.x > W - n.r - PAD) { n.x = W - n.r - PAD; n.vx = -Math.abs(n.vx) * 0.4 }
    if (n.y < n.r + PAD) { n.y = n.r + PAD; n.vy = Math.abs(n.vy) * 0.4 }
    if (n.y > bottom - n.r - PAD) { n.y = bottom - n.r - PAD; n.vy = -Math.abs(n.vy) * 0.4 }
  }
}

function placeDom() {
  for (const n of active) {
    const el = mounted.get(n.id)
    if (!el) continue
    el.style.transform = 'translate3d(' + (n.x - 48) + 'px,' + (n.y - n.r) + 'px,0)'
  }
}

function useProxLine(x1, y1, x2, y2, stroke, alpha, width) {
  const l = proxPool[proxIdx]
  if (!l) return
  proxIdx++
  l.setAttribute('x1', x1.toFixed(1))
  l.setAttribute('y1', y1.toFixed(1))
  l.setAttribute('x2', x2.toFixed(1))
  l.setAttribute('y2', y2.toFixed(1))
  l.style.stroke = stroke
  l.style.opacity = alpha
  l.style.strokeWidth = width
  l.style.visibility = 'visible'
}

function drawEdges() {
  for (const [key, l] of treeLines) {
    const parts = key.split('|')
    const na = nodes.get(parts[0])
    const nb = nodes.get(parts[1])
    if (!na || !nb) continue
    l.setAttribute('x1', na.x.toFixed(1))
    l.setAttribute('y1', na.y.toFixed(1))
    l.setAttribute('x2', nb.x.toFixed(1))
    l.setAttribute('y2', nb.y.toFixed(1))
  }

  proxIdx = 0
  for (let i = 0; i < active.length && proxIdx < proxPool.length; i++) {
    const a = active[i]
    for (let j = i + 1; j < active.length && proxIdx < proxPool.length; j++) {
      const b = active[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const d2 = dx * dx + dy * dy
      if (d2 > PROX_LIMIT * PROX_LIMIT) continue
      const d = Math.sqrt(d2)
      const al = ((1 - d / PROX_LIMIT) * (focusOn ? 0.14 : 0.3)).toFixed(3)
      useProxLine(a.x, a.y, b.x, b.y, 'rgba(150,150,150,1)', al, '0.8')
    }
  }

  if (mouse.in) {
    for (const n of active) {
      if (proxIdx >= proxPool.length) break
      const dx = n.x - mouse.x
      const dy = n.y - mouse.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > 190) continue
      const al = ((1 - d / 190) * 0.45).toFixed(3)
      useProxLine(mouse.x, mouse.y, n.x, n.y, 'rgba(207,255,4,1)', al, '0.9')
    }
  }

  for (let i = proxIdx; i < proxPool.length; i++) proxPool[i].style.visibility = 'hidden'
}

function initAmbient() {
  const el = bgCanvas.value
  const ctx = el.getContext('2d')
  const count = W < 700 ? 16 : 26
  const R = 2
  const limit = 240
  const rnd = (a, b) => Math.random() * (b - a) + a

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    el.width = Math.round(W * dpr)
    el.height = Math.round(H * dpr)
    el.style.width = W + 'px'
    el.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const spawn = () => {
    const side = Math.floor(Math.random() * 4)
    const sp = () => rnd(0.15, 0.9)
    if (side === 0) return { x: rnd(0, W), y: -R, vx: rnd(-1, 1), vy: sp() }
    if (side === 1) return { x: W + R, y: rnd(0, H), vx: -sp(), vy: rnd(-1, 1) }
    if (side === 2) return { x: rnd(0, W), y: H + R, vx: rnd(-1, 1), vy: -sp() }
    return { x: -R, y: rnd(0, H), vx: sp(), vy: rnd(-1, 1) }
  }

  ambient = []
  for (let i = 0; i < count; i++) {
    const p = spawn()
    p.x = rnd(0, W)
    p.y = rnd(0, H)
    p.r = R
    p.phase = rnd(0, 10)
    ambient.push(p)
  }

  return {
    resize,
    step() {
      ctx.clearRect(0, 0, W, H)
      for (const p of ambient) {
        p.x += p.vx
        p.y += p.vy
        p.phase += 0.03
        const a = Math.abs(Math.cos(p.phase)) * 0.85 + 0.1
        ctx.fillStyle = 'rgba(207,255,4,' + a.toFixed(3) + ')'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) {
          const np = spawn()
          p.x = np.x
          p.y = np.y
          p.vx = np.vx
          p.vy = np.vy
          p.phase = rnd(0, 10)
        }
      }

      for (let i = 0; i < ambient.length; i++) {
        for (let j = i + 1; j < ambient.length; j++) {
          const dx = ambient[i].x - ambient[j].x
          const dy = ambient[i].y - ambient[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > limit) continue
          ctx.strokeStyle = 'rgba(150,150,150,' + ((1 - d / limit) * 0.42).toFixed(3) + ')'
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(ambient[i].x, ambient[i].y)
          ctx.lineTo(ambient[j].x, ambient[j].y)
          ctx.stroke()
        }
      }

      if (mouse.in) {
        for (const p of ambient) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > limit) continue
          ctx.strokeStyle = 'rgba(207,255,4,' + ((1 - d / limit) * 0.3).toFixed(3) + ')'
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(mouse.x, mouse.y)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        }
      }
    }
  }
}

function onPointerMove(e) {
  const rect = container.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
  mouse.in = true
}

function onPointerLeave() {
  mouse.in = false
}

function onKey(e) {
  if (!introVisible.value) return
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') dismissIntro()
}

function onWheelOrTouch() {
  if (introVisible.value) dismissIntro()
}

onMounted(() => {
  startTypewriter()
  autoTimer = setTimeout(dismissIntro, 5400)

  nodes.clear()
  mounted.clear()
  treeLines.clear()

  const hub = makeNode({ id: 'hub', label: 'Appunti', kind: 'hub', depth: -1 })
  hub.spawned = true
  rootIds = buildSource(treeMenu.value, 0, null)

  treeG = document.createElementNS(NS, 'g')
  treeG.setAttribute('class', 'tree-edges')
  proxG = document.createElementNS(NS, 'g')
  proxG.setAttribute('class', 'prox-edges')
  edges.value.appendChild(treeG)
  edges.value.appendChild(proxG)

  proxPool = []
  for (let i = 0; i < PROX_POOL; i++) {
    const l = document.createElementNS(NS, 'line')
    l.setAttribute('class', 'pe')
    l.style.visibility = 'hidden'
    proxG.appendChild(l)
    proxPool.push(l)
  }

  measure()
  hub.x = cx
  hub.y = cy
  ambientApi = initAmbient()
  syncStructure()

  container.value.addEventListener('pointermove', onPointerMove, { passive: true })
  container.value.addEventListener('pointerleave', onPointerLeave, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('wheel', onWheelOrTouch, { passive: true })
  window.addEventListener('touchstart', onWheelOrTouch, { passive: true })

  onResize = () => {
    measure()
    if (ambientApi) ambientApi.resize()
    syncStructure()
  }
  window.addEventListener('resize', onResize)
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(onResize)
    ro.observe(container.value)
  }

  let last = 0
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    if (now - last < 15) return
    last = now
    const t = now * 0.001
    computeHomes(t)
    physics()
    placeDom()
    drawEdges()
    if (ambientApi) ambientApi.step()
  }
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  if (typeTimer) clearTimeout(typeTimer)
  if (autoTimer) clearTimeout(autoTimer)
  if (hintTimer) clearTimeout(hintTimer)
  if (ro) ro.disconnect()
  if (onResize) window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('wheel', onWheelOrTouch)
  window.removeEventListener('touchstart', onWheelOrTouch)
  if (container.value) {
    container.value.removeEventListener('pointermove', onPointerMove)
    container.value.removeEventListener('pointerleave', onPointerLeave)
  }
  for (const el of mounted.values()) el.remove()
  mounted.clear()
})
</script>

<style scoped>
.home-container {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  background-color: #1a1a1a;
  background-image:
    radial-gradient(1100px 520px at 50% -8%, rgba(207, 255, 4, 0.07), transparent 62%),
    radial-gradient(900px 520px at 88% 112%, rgba(59, 130, 246, 0.09), transparent 60%),
    radial-gradient(700px 420px at 5% 95%, rgba(207, 255, 4, 0.05), transparent 60%);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.bg-canvas { position: absolute; inset: 0; z-index: 1; pointer-events: none; }

.edges {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
  overflow: visible;
}

.edges :deep(.te) { stroke-linecap: round; }
.edges :deep(.te-main) { stroke: rgba(207, 255, 4, 0.45); stroke-width: 1.2; }
.edges :deep(.te-sub) { stroke: rgba(140, 170, 220, 0.38); stroke-width: 1; }
.edges :deep(.pe) { stroke: rgba(150, 150, 150, 1); stroke-width: 0.8; }

.nodes-layer { position: absolute; inset: 0; z-index: 10; pointer-events: none; }
</style>

<style>

.gn {
  position: absolute;
  top: 0;
  left: 0;
  width: 96px;
  height: calc(var(--r) * 2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
  pointer-events: auto;
  will-change: transform;
}

.gn-disc {
  position: relative;
  width: calc(var(--r) * 2);
  height: calc(var(--r) * 2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(255, 255, 255, 0.26);
  background: radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.03) 55%, rgba(0, 0, 0, 0.42));
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45), inset 0 0 18px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s ease, box-shadow 0.3s ease;
  animation: gnPop 0.55s cubic-bezier(0.2, 1.35, 0.4, 1) backwards;
  animation-delay: var(--d, 0s);
}

.gn-glyph {
  font-size: calc(var(--r) * 0.82);
  line-height: 1;
  color: rgba(255, 255, 255, 0.82);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.55));
  transition: color 0.3s ease;
}

.gn-label {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  max-width: 124px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Julee', cursive;
  font-size: 0.72rem;
  letter-spacing: 0.3px;
  color: rgba(255, 255, 255, 0.62);
  text-shadow: 0 2px 7px rgba(0, 0, 0, 0.9);
  pointer-events: none;
  opacity: 0.9;
  transition: color 0.25s ease, opacity 0.25s ease;
}

.gn-hub { z-index: 9; }
.gn-d0 { z-index: 8; }
.gn-folder { z-index: 7; }
.gn-more { z-index: 7; }
.gn-leaf { z-index: 6; }

.gn-hub .gn-disc {
  background: radial-gradient(circle at 32% 26%, #f2ff9e, #cfff04 48%, #8ab800 100%);
  border-color: rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 42px rgba(207, 255, 4, 0.4), 0 10px 26px rgba(0, 0, 0, 0.5);
}
.gn-hub .gn-glyph { color: #17220b; font-size: calc(var(--r) * 0.95); }
.gn-hub .gn-label { color: #cfff04; }

.gn-d0 .gn-disc {
  border-color: rgba(207, 255, 4, 0.6);
  box-shadow: 0 0 26px rgba(207, 255, 4, 0.16), 0 10px 26px rgba(0, 0, 0, 0.45);
}
.gn-d0 .gn-glyph { color: #e9ff95; }
.gn-d0 .gn-label { color: rgba(233, 255, 149, 0.85); font-size: 0.82rem; }

.gn-folder .gn-disc { border-color: rgba(59, 130, 246, 0.6); }
.gn-folder .gn-glyph { color: #cfe2ff; }
.gn-folder .gn-label { color: rgba(214, 228, 255, 0.78); }

.gn-folder.gn-d0 .gn-disc {
  border-color: rgba(207, 255, 4, 0.6);
  box-shadow: 0 0 26px rgba(207, 255, 4, 0.16), 0 10px 26px rgba(0, 0, 0, 0.45);
}
.gn-folder.gn-d0 .gn-glyph { color: #e9ff95; }
.gn-folder.gn-d0 .gn-label { color: rgba(233, 255, 149, 0.85); font-size: 0.82rem; }

.gn-leaf .gn-disc { border-color: rgba(255, 255, 255, 0.2); }
.gn-leaf .gn-label { font-size: 0.64rem; color: rgba(255, 255, 255, 0.5); max-width: 104px; }

.gn-more .gn-disc {
  border-style: dashed;
  border-color: rgba(207, 255, 4, 0.65);
  background: rgba(207, 255, 4, 0.07);
}
.gn-more .gn-glyph { color: #cfff04; font-size: calc(var(--r) * 1.05); font-weight: 600; }
.gn-more .gn-label { color: rgba(207, 255, 4, 0.8); }

.gn:hover .gn-disc,
.gn:focus-visible .gn-disc { transform: scale(1.12); border-color: #cfff04; }
.gn:hover .gn-label,
.gn:focus-visible .gn-label { color: #cfff04; opacity: 1; }
.gn:focus-visible { outline: none; }
.gn:focus-visible .gn-disc {
  box-shadow: 0 0 0 3px #1a1a1a, 0 0 0 5px #cfff04, 0 0 30px rgba(207, 255, 4, 0.4);
}

.gn.is-open .gn-disc {
  transform: scale(1.2);
  border-color: #cfff04;
  box-shadow:
    0 0 0 6px rgba(207, 255, 4, 0.1),
    0 0 36px rgba(207, 255, 4, 0.42),
    0 10px 26px rgba(0, 0, 0, 0.5);
}
.gn.is-open .gn-label { color: #cfff04; opacity: 1; }
.gn.is-open .gn-glyph { color: #cfff04; }
.gn-hub.is-open .gn-glyph { color: #17220b; }

.gn {
  transition: opacity 0.45s ease, filter 0.45s ease;
}
.gn.is-dim { opacity: 0.3; filter: saturate(0.35); }

@keyframes gnPop {
  0% { opacity: 0; transform: scale(0.2) rotate(-20deg); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

.intro-open .gn { pointer-events: none; }
</style>

<style scoped>
.intro {
  position: absolute;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.4rem;
  text-align: center;
  padding: 2rem;
  cursor: pointer;
  background:
    radial-gradient(120% 100% at 50% 45%, rgba(26, 26, 26, 0.82), rgba(17, 17, 17, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.intro-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
}

.intro-title {
  font-family: 'Fredericka the Great', cursive;
  font-size: clamp(2.1rem, 7vw, 4.6rem);
  line-height: 1.05;
  margin: 0;
  color: #fff;
  letter-spacing: -1px;
  text-shadow: 0 12px 44px rgba(0, 0, 0, 0.6), 0 0 26px rgba(207, 255, 4, 0.12);
}

.tw {
  display: inline-block;
  opacity: 1;
  margin-right: 0.3em;
  animation: wordIn 0.75s cubic-bezier(0.2, 0.9, 0.3, 1) backwards;
}
.tw.hl {
  color: #cfff04;
  margin-left: 0.2em;
  transform: rotate(-2deg);
  animation-name: wordInHl;
}

@keyframes wordInHl {
  0% { opacity: 0; transform: translateY(28px) scale(0.9) rotate(-2deg); filter: blur(7px); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(-2deg); filter: blur(0); }
}

@keyframes wordIn {
  0% { opacity: 0; transform: translateY(28px) scale(0.9); filter: blur(7px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.intro-sub {
  margin: 0;
  min-height: 1.7em;
  font-family: 'Julee', cursive;
  font-size: clamp(1rem, 3vw, 1.6rem);
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.5px;
  animation: fadeUp 0.7s ease-out 0.9s backwards;
}

.caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 3px;
  background: #cfff04;
  vertical-align: -0.12em;
  animation: blink 0.9s steps(1) infinite;
}

@keyframes blink { 50% { opacity: 0; } }

.intro-skip {
  position: absolute;
  bottom: 7.5rem;
  font-family: 'Julee', cursive;
  font-size: 0.85rem;
  letter-spacing: 2px;
  text-transform: lowercase;
  color: rgba(255, 255, 255, 0.32);
  animation: fadeUp 0.7s ease-out 1.6s backwards, pulseHint 2.4s ease-in-out 2.3s infinite;
}

@keyframes pulseHint { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }

.intro-enter-active { transition: opacity 0.6s ease; }
.intro-leave-active { transition: opacity 0.7s ease, filter 0.7s ease, transform 0.7s ease; }
.intro-enter-from { opacity: 0; }
.intro-leave-to { opacity: 0; filter: blur(16px); transform: scale(1.05); }

.graph-hint {
  position: absolute;
  left: 1.2rem;
  bottom: 1.2rem;
  z-index: 30;
  font-family: 'Julee', cursive;
  font-size: 0.82rem;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.5rem 0.95rem;
  border-radius: 99px;
  pointer-events: none;
}
.graph-hint b { color: #cfff04; font-weight: normal; }

.hint-enter-active { transition: opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s; }
.hint-leave-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.hint-enter-from { opacity: 0; transform: translateY(14px); }
.hint-leave-to { opacity: 0; transform: translateY(14px); }

@font-face {
  font-family: 'Allura';
  src: url('/fonts/Allura-latin-ext.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Allura';
  src: url('/fonts/Allura-latin.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.firma {
  font-family: 'Allura', cursive;
  font-size: clamp(1.8rem, 5vw, 3.2rem);
  color: rgba(207, 255, 4, 0.75);
  margin: 0.4rem 0 0;
  letter-spacing: 2px;
  position: relative;
  display: inline-block;
  text-shadow: 0 0 30px rgba(207, 255, 4, 0.25);
  transform: rotate(-3deg);
  animation: firmaGlow 6s ease-in-out infinite;
}
.firma-by { color: rgba(180, 180, 180, 0.5); font-size: 0.8em; text-shadow: none; }
.firma::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 10%;
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(207, 255, 4, 0.5), transparent);
  transform-origin: center;
}
@keyframes firmaGlow { 0%, 100% { filter: drop-shadow(0 0 6px rgba(207, 255, 4, 0.15)); } 50% { filter: drop-shadow(0 0 18px rgba(207, 255, 4, 0.45)); } }

.footer-links {
  position: absolute;
  bottom: 2.2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 20;
  padding: 0.7rem 1.8rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  animation: footerIn 1s ease-out 0.6s backwards;
}

@keyframes footerIn {
  from { opacity: 0; transform: translate(-50%, 30px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.footer-link {
  color: rgba(255, 255, 255, 0.35);
  font-family: 'Julee', cursive;
  font-size: 0.95rem;
  text-decoration: none;
  letter-spacing: 0.5px;
}
.footer-link:hover { color: #cfff04; text-shadow: 0 0 15px rgba(207, 255, 4, 0.4); transform: translateY(-1px); }
.separator { color: rgba(255, 255, 255, 0.12); font-size: 0.8rem; }

@media (max-width: 900px) {
  .intro-skip { bottom: 6.5rem; }
}

@media (max-width: 600px) {
  .gn-label { max-width: 96px; font-size: 0.66rem; }
  .gn-d0 .gn-label { font-size: 0.72rem; }
  .gn-leaf .gn-label { font-size: 0.62rem; max-width: 92px; }
  .graph-hint { display: none; }
  .footer-links { bottom: 1rem; gap: 0.6rem; padding: 0.6rem 1.2rem; }
  .footer-link { font-size: 0.85rem; }
  .intro { gap: 1rem; padding: 1.2rem; }
  .intro-skip { bottom: 5rem; font-size: 0.78rem; }
}
</style>
