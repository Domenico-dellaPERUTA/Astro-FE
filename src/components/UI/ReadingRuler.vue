<!-- app/components/UI/ReadingRuler.vue -->
<!-- Righello di avanzamento lettura (stile getartcraft.com):
     - scala graduata NERA ogni 5%, solidale con la pagina (scorre col contenuto);
     - marcatore BLU fisso nel viewport: riga orizzontale + % corrente sotto. -->
<template>
  <!-- Scala nera: teletrasportata dentro lo scroller reale così si muove con la pagina -->
  <Teleport v-if="mounted && visible && scaleTarget" :to="scaleTarget">
    <div
      class="rf-scrollscale"
      :style="{ height: scaleH + 'px' }"
      title="Clicca per saltare a una posizione"
      @click="jump"
    >
      <div
        v-for="m in marks"
        :key="m"
        class="rf-row"
        :class="{ major: m % 5 === 0 }"
        :style="{ top: m + '%', transform: m === 0 ? 'none' : m === 100 ? 'translateY(-100%)' : 'translateY(-50%)' }"
      >
        <span v-if="m % 5 === 0" class="rf-label">{{ m }}%</span>
        <i class="rf-tick"></i>
      </div>
    </div>
  </Teleport>

  <!-- Marcatore blu: fisso nel viewport, segue l'avanzamento -->
  <div
    v-if="mounted && visible"
    class="rf-fixed"
    :style="{ left: x + 'px', top: top + 'px' }"
    role="scrollbar"
    aria-orientation="vertical"
    :aria-valuenow="pct"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Avanzamento lettura"
  >
    <div class="rf-marker" :style="{ top: pct + '%' }">
      <i class="rf-line"></i>
      <span class="rf-current">{{ pct }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { usePageStore } from '../../store/page'

const pageStore = usePageStore()
const { route, type } = pageStore

// Tacche: una ogni 1%, principali (con etichetta) ogni 5% — stessa metrica per tutte
const marks = Array.from({ length: 101 }, (_, i) => i)

const mounted = ref(false)
const pct = ref(0)
const visible = ref(false)
const x = ref(0)
const top = ref(0)
const scaleH = ref(0)

// Lo scroller reale varia per pagina: gli articoli scorrono dentro
// `.topic-page-container`, la home dentro `.home-container`, il fallback è `.content`
let frame: HTMLElement | null = null
let active: HTMLElement | null = null
let listened: HTMLElement[] = []
let ro: ResizeObserver | null = null
let ticking = false

// La scala nera vive dentro lo scroller attivo così scorre con la pagina
const scaleTarget = computed(() =>
  type.value === 'home' ? '.home-container' : '.topic-page-container'
)

const pickScroller = (): HTMLElement | null => {
  const cands = [
    document.querySelector<HTMLElement>('.topic-page-container'),
    document.querySelector<HTMLElement>('.home-container'),
    frame
  ]
  for (const el of cands) {
    if (el && el.scrollHeight - el.clientHeight > 4) return el
  }
  return null
}

const update = () => {
  if (!frame) return
  active = pickScroller()
  if (!active) {
    visible.value = false
    return
  }
  visible.value = true
  const max = active.scrollHeight - active.clientHeight
  pct.value = Math.min(100, Math.max(0, Math.round((active.scrollTop / max) * 100)))
  // Altezza esatta del contenuto: la scala copre [0, scrollHeight] senza alterarlo
  scaleH.value = active.scrollHeight
  // Il marcatore fisso parte sotto l'header, allineato alla scala
  const headerH = document.querySelector('.header')?.getBoundingClientRect().height ?? 0
  top.value = Math.round(headerH + 12)
  x.value = Math.round(frame.getBoundingClientRect().right - 82)
}

const onScroll = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    update()
  })
}

const bindScroll = () => {
  listened.forEach(el => el.removeEventListener('scroll', onScroll))
  listened = [
    frame,
    document.querySelector<HTMLElement>('.topic-page-container'),
    document.querySelector<HTMLElement>('.home-container')
  ].filter((el): el is HTMLElement => !!el)
  listened.forEach(el => el.addEventListener('scroll', onScroll, { passive: true }))
}

const refresh = async () => {
  await nextTick()
  bindScroll()
  update()
}

const jump = (e: MouseEvent) => {
  const el = active ?? pickScroller()
  if (!el) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
  el.scrollTo({
    top: ratio * (el.scrollHeight - el.clientHeight),
    behavior: 'smooth'
  })
}

watch([route, type], refresh)

onMounted(async () => {
  frame = document.querySelector('.content')
  mounted.value = true
  await refresh()
  window.addEventListener('resize', update)
  if (frame && 'ResizeObserver' in window) {
    ro = new ResizeObserver(update)
    ro.observe(frame)
  }
})

onBeforeUnmount(() => {
  listened.forEach(el => el.removeEventListener('scroll', onScroll))
  listened = []
  window.removeEventListener('resize', update)
  ro?.disconnect()
  frame = null
  active = null
})
</script>

<style scoped>
/* ---- Scala nera: dentro lo scroller, si muove con la pagina ---- */
.rf-scrollscale {
  position: absolute;
  top: 0;
  right: 10px;
  width: 72px;
  cursor: pointer;
  pointer-events: auto;
}

/* Dorsale nera del righello */
.rf-scrollscale::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 5px;
  width: 2px;
  background: #000;
}

/* Ogni tacca è posizionata in percentuale assoluta: un'unica metrica per tutte */
.rf-row {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.rf-label {
  font-family: monospace;
  font-size: 9px;
  font-weight: 600;
  color: #000;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 3px;
  padding: 0 2px;
  line-height: 1.4;
  white-space: nowrap;
}

.rf-tick {
  width: 9px;
  height: 2px;
  background: #000;
  flex-shrink: 0;
}

/* Tacche minori: stesso passo, solo più corte e grigie */
.rf-row:not(.major) .rf-tick {
  width: 5px;
  height: 1px;
  background: rgba(0, 0, 0, 0.45);
}

/* ---- Marcatore blu: fisso nel viewport ---- */
.rf-fixed {
  position: fixed;
  bottom: 12px;
  z-index: 400;
  width: 72px;
  user-select: none;
  pointer-events: none;
}

.rf-marker {
  position: absolute;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
}

.rf-line {
  display: block;
  height: 3px;
  border-radius: 2px;
  background: #2563eb;
  box-shadow: 0 1px 6px rgba(37, 99, 235, 0.5);
}

.rf-current {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .rf-scrollscale,
  .rf-fixed {
    width: 56px;
  }
  .rf-label {
    font-size: 8px;
  }
  .rf-current {
    font-size: 10px;
  }
}
</style>
