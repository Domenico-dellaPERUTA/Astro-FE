<!-- app/components/UI/TopicPage.vue -->
<template>
  <!-------------------------------- 🧩 HTML ------------------------------------------->
  <div v-if="type === 'html'" v-html="renderedHtml"></div>

  <!------------------------------- 🧩 CODE ------------------------------------------>
  <div v-else-if="type === 'code'" class="code-wrapper">
      <div ref="monacoCodeContainer" class="monaco-code-container"></div>
  </div>

  <!------------------------------- 🧩 MD (Markdown) -------------------------------->
  <div v-else-if="type === 'md'" class="md" v-html="renderedMarkdown"></div>

  <!------------------------------- 🧩 CAROUSEL ---------------------------------------->
  <div v-else-if="type === 'carousel'" class="carousel-container relative">
    <div v-if="!initialLoading">
      <Carousel
        ref="carouselRef"
        :items-to-show="1"
        :wrap-around="true"
        :transition="70"
        class="rounded-2xl overflow-hidden"
        @slide-start="onSlideChange"
      >
        <Slide v-for="(item, index) in items" :key="index">
          <div class="slide">
            <!-- Mostra immagine se già scaricata -->
            <img
              v-if="carouselImages[item.image || item]"
              :src="item.image || item"
              alt="immagine carousel"
              class="carousel-image"
            />
            <div v-else class="image-placeholder">
              <img src="/await.gif" alt="loading">
            </div>

            <!-- Audio associato -->
            <audio
              v-if="carouselImages[item.image || item]"
              :id="`audio_${index}`"
              :src="item.audio || audioSrc(item)"
              @play="runAvatar()"
              @ended="stopAvatar()"
              @pause="pauseAvatar()"
              controls
            />
          </div>
        </Slide>
      </Carousel>

      <!-- Pulsante sinistro -->
      <button class="nav-btn left" @click="prevSlide">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Pulsante destro -->
      <button class="nav-btn right" @click="nextSlide">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    <div v-else class="image-placeholder">
      <img src="/await.gif" alt="loading">
    </div>
  </div>

  <!-------------------------- 🧩 DICTIONARY ---------------------------------->
  <div v-else-if="type === 'dictionary'" class="dictionary">
    <h3 :style="colorTextDictionary(dictionary?.type ?? '')">{{ dictionary?.item }}</h3>
    <p v-if="dictionary?.fonetic">{{ dictionary?.fonetic }}</p>
    <h4><span>{{ dictionary?.description }}</span></h4>
   
    <div v-if="dictionary?.codeDescription && dictionary?.type === 'html'" v-html="dictionary?.codeDescription" class="dictionary-code" />
    <div v-if="dictionary?.codeDescription" class="dictionary-code-wrapper">
        <div ref="dictionaryCodeContainer" class="dictionary-code-container"></div>
    </div>

    <div v-if="dictionary?.synonyms" class="dictionary-extra">
      <strong>Sinonimi:</strong> {{ dictionary.synonyms }}
    </div>
    <div v-if="dictionary?.opposites" class="dictionary-extra">
      <strong>Opposti:</strong> {{ dictionary.opposites }}
    </div>
    <div v-if="dictionary?.note" class="dictionary-note">
      {{ dictionary.note }}
    </div>

    <img 
      :src="dictionary?.resolvedImageJpg || `/${dictionary?.path}${dictionary?.item}.jpg`" 
      @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
      class="img-centrata" 
    />
    <img 
      :src="dictionary?.resolvedImagePng || `/${dictionary?.path}${dictionary?.item}.png`" 
      @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
      class="img-centrata" 
    />
    <audio :key="dictionary?.item" :src="dictionary?.resolvedAudio || `/${dictionary?.path}${dictionary?.item}.mp3`" autoplay></audio>
    
  </div>

  <!-------------------------- ♟️ CHESS -------------------------------------->
  <div v-else-if="type === 'chess'" class="chess-wrapper">
       <ChessBoard :pgn="pgn" />
  </div>

  <!-------------------------- 🧨 CARICAMENTO ---------------------------------->
  <div v-else></div>
</template>

<script setup lang="ts">
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide } from 'vue3-carousel'
import { ref, onMounted, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import { usePageStore } from '../../store/page'
import { useInfoStore } from '../../store/info'
import { useAuthStore } from '../../store/auth'
import ChessBoard from './ChessBoard.vue'

const pageStore = usePageStore()
const { topic, type, items, code, pgn, currentIndex, showAvatar, setCarouselRef, navigateToPage, audio } = pageStore

const infoStore = useInfoStore()
const { page: infoPageNum, maxPage: infoMaxPageNum } = infoStore

const auth = useAuthStore()

const renderedHtml = ref('')
const renderedMarkdown = ref('')
const markdownContainer = ref<HTMLElement | null>(null)

// Import marked for Markdown rendering
import { marked } from 'marked'



// Monaco Editor per il codice
const monacoCodeContainer = ref<HTMLElement | null>(null)
const dictionaryCodeContainer = ref<HTMLElement | null>(null)
const codeAudioRef = ref<HTMLAudioElement | null>(null)
let codeEditor: any = null
let monaco: any = null

const carouselRef = ref<any>(null)
const carouselImages = ref<Record<string, string>>({})
const initialLoading = ref<boolean>(false)
const loadingImages = ref<Set<string>>(new Set())

/** 🧹 Pulisce il codice dai tag personalizzati /_ _/ e dai triple backticks */
const cleanCode = (rawCode: string): string => {
  if (!rawCode) return ''
  return rawCode
    .replace(/\/_/g, '/*')         // Converte /_ in /*
    .replace(/_\//g, '*/')         // Converte _/ in */
    .replace(/\\\*/g, '*')         // Converte \* in * (trasforma /\* e \*/ in /* e */)
    .replace(/```[a-z]*\n?/gi, '') // Rimuove triple backticks iniziali
    .replace(/```/g, '')           // Rimuove triple backticks finali
    .trim()
}

/** 🔧 Inizializza Monaco Editor per il codice */
const initializeCodeEditor = async (typeArg: string) => {
  if (typeof window === 'undefined') return
  if (!monaco) monaco = await import('monaco-editor')
  await nextTick()
  
  if (typeArg === 'code' && !monacoCodeContainer.value) return
  if (typeArg === 'dictionary' && !dictionaryCodeContainer.value) return
  
  // Distruggi editor precedente se esiste
  if (codeEditor) {
    codeEditor.dispose()
    codeEditor = null
  }
  
  // Crea nuovo editor
  const editorOptions = {
    value: typeArg === 'code' ? cleanCode(code.value) : (dictionary.value?.codeDescription || ''),
    language: typeArg === 'code' ? detectLanguage(code.value || '') : (dictionary.value?.type || detectLanguage(dictionary.value?.codeDescription || '')),
    theme: 'vs-dark',
    automaticLayout: false, // Gestito manualmente per maggior controllo
    fontSize: 16,
    readOnly: true,
    minimap: { enabled: true },
    wordWrap: 'on' as const,
    folding: true,
    lineNumbers: 'on' as const,
    matchBrackets: 'always' as const,
    scrollBeyondLastLine: false,
    tabSize: 2
  }

  codeEditor = typeArg === 'code' ? 
    monaco.editor.create(monacoCodeContainer.value!, editorOptions) : 
    monaco.editor.create(dictionaryCodeContainer.value!, editorOptions)

  // 📐 Gestione layout dinamico (fix per transizioni e ridimensionamento)
  const container = typeArg === 'code' ? monacoCodeContainer.value : dictionaryCodeContainer.value
  if (container) {
    // Un piccolo ritardo aiuta a garantire che il layout sia stabile dopo la transizione
    setTimeout(() => {
      if (codeEditor) codeEditor.layout()
    }, 100)

    const ro = new ResizeObserver(() => {
      if (codeEditor) codeEditor.layout()
    })
    ro.observe(container)
  }
}

/** 🔍 Rileva il linguaggio dal codice */
const detectLanguage = (code: string): string => {
  // Rileva il linguaggio in base a pattern comuni
  if (code.includes('function') || code.includes('const') || code.includes('let') || code.includes('=>')) {
    return 'javascript'
  }
  if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
    return 'python'
  }
  if (code.includes('public class') || code.includes('private ') || code.includes('void main')) {
    return 'java'
  }
  if (code.includes('#include') || code.includes('std::') || code.includes('cout')) {
    return 'cpp'
  }
  if (code.includes('<?php')) {
    return 'php'
  }
  if (code.includes('<html') || code.includes('<!DOCTYPE')) {
    return 'html'
  }
  if (code.includes('{') && code.includes('}') && code.includes(':')) {
    return 'json'
  }
  return 'javascript' // Default
}

/** 🔧 Percorso immagine normalizzato */
function normalizedSrc(input: any) {
  const path = typeof input === 'object' ? input.image : input
  if (!path) return ''
  if (path.startsWith('/_astro') || path.startsWith('http')) return path
  const clean = path.startsWith('/') ? path.slice(1) : path
  return `/${clean}`
}

/** 🔊 Percorso audio corrispondente */
function audioSrc(input: any) {
  if (typeof input === 'object' && input.audio) return input.audio
  const path = typeof input === 'object' ? input.originalPath || input.image : input
  if (!path) return ''
  const clean = decodeURIComponent(String(path)).replace('.jpg', '.mp3').replace('.png', '.mp3')
  return `/${clean.startsWith('/') ? clean.slice(1) : clean}`
}

/** 🔄 Gestione immagini statica */
async function fetchImageIfNeeded(item: any) {
  const path = typeof item === 'object' ? item.image : item
  if (!path || carouselImages.value[path]) return
  carouselImages.value[path] = path
}

/** 📥 Precarica immagini adiacenti all'indice corrente */
async function preloadAdjacentImages(currentIndexArg: number) {
  const itemsList = items.value
  if (!Array.isArray(itemsList) || itemsList.length === 0) return

  // Carica immagine corrente
  const currentItem = itemsList[currentIndexArg]
  if (currentItem) await fetchImageIfNeeded(currentItem)

  // Precarica immagine successiva
  const nextIndex = (currentIndexArg + 1) % itemsList.length
  const nextItem = itemsList[nextIndex]
  if (nextItem) fetchImageIfNeeded(nextItem)

  // Precarica immagine precedente
  const prevIndex = (currentIndexArg - 1 + itemsList.length) % itemsList.length
  const prevItem = itemsList[prevIndex]
  if (prevItem) fetchImageIfNeeded(prevItem)
}

/** 🎯 Evento cambio slide dal carousel */
async function onSlideChange(data: any) {
  const newIndex = data?.currentSlideIndex ?? 0
  await preloadAdjacentImages(newIndex)
}

/** 🔧 Carica solo la prima immagine al cambio items */
watch(
  () => items.value,
  async (newItems) => {
    if (Array.isArray(newItems) && newItems.length > 0 && type.value === 'carousel') {
      // Reset cache immagini
      carouselImages.value = {}
      loadingImages.value.clear()
      
      // Carica solo la prima immagine
      initialLoading.value = true
      const currentIdx = currentIndex.value || 0
      await preloadAdjacentImages(currentIdx)
      initialLoading.value = false
    }
  },
  { immediate: true }
)

/** 🔧 Setup carosello */
onMounted(() => {
  if (type.value === 'carousel' && carouselRef.value) {
    setCarouselRef(carouselRef.value)
  }
})

/** 🔧 HTML rendering */
watch(
  () => code.value,
  async (newCode) => {
    if (type.value === 'html') {
      // 🔧 Correggi i percorsi delle immagini: src="WebPages/..." → src="/WebPages/..."
      let correctedCode = newCode || ''
      correctedCode = correctedCode.replace(/src=(["'])(?!\/|https?:\/\/)([^"']*)\1/g, 'src=$1/$2')
      
      renderedHtml.value = ''
      await nextTick()
      renderedHtml.value = `<div class="page">${correctedCode}</div>` || ''
    } else if (type.value === 'code' && codeEditor) {
      // Aggiorna il contenuto dell'editor con codice pulito
      const cleaned = cleanCode(newCode || '')
      codeEditor.setValue(cleaned)
      const language = detectLanguage(cleaned)
      monaco.editor.setModelLanguage(codeEditor.getModel(), language)
    } else if (type.value === 'md') {
      // Convert markdown to HTML using marked
      try {
        renderedMarkdown.value = `<div class="md" > ${ marked(newCode || '') as string }</div>`
      } catch (e) {
        console.error('[TopicPage] Markdown parse error:', e)
        renderedMarkdown.value = newCode || ''
      }
    }
  },
  { immediate: true }
)

/** 🔧 Tipo di pagina */
watch(
  () => type.value,
  async (newType) => {
    if (newType === 'carousel' && carouselRef.value) {
      setCarouselRef(carouselRef.value)
    } else if (newType === 'code' || newType === 'dictionary') {
      await nextTick()
      if (!codeEditor) await initializeCodeEditor(newType)
    } else if (newType === 'md') {
      // Convert markdown to HTML
      await nextTick()
      try {
        renderedMarkdown.value = `<div class="md" > ${ marked(code.value || '') as string }</div>`
      } catch (e) {
        console.error('[TopicPage] Markdown parse error:', e)
        renderedMarkdown.value = code.value || ''
      }
    }
  }
)

/** ⬅️➡️ Navigazione carosello con preload */
const prevSlide = async () => {
  if (!carouselRef.value) {
    console.warn('[TopicPage] carouselRef is not available')
    return
  }
  try {
    await carouselRef.value.prev()
  } catch (e) {
    console.error('[TopicPage] Error in prevSlide:', e)
  }
}

const nextSlide = async () => {
  if (!carouselRef.value) {
    console.warn('[TopicPage] carouselRef is not available')
    return
  }
  try {
    await carouselRef.value.next()
  } catch (e) {
    console.error('[TopicPage] Error in nextSlide:', e)
  }
}

/** 🔊 Eventi audio/avatar */
const runAvatar = () => (showAvatar.value = 'run')
const stopAvatar = () => (showAvatar.value = 'stop')
const pauseAvatar = () => (showAvatar.value = 'stop')

/** 📚 Dictionary */
interface DictionaryItem {
  type: string
  item: string
  fonetic?: string
  description: string
  path?: string
  codeDescription?: string
  links?: string
  synonyms?: string
  opposites?: string
  note?: string
  resolvedImageJpg?: string
  resolvedImagePng?: string
  resolvedAudio?: string
}
const dictionary = computed<DictionaryItem | undefined>(() => items.value[currentIndex.value] as DictionaryItem)
const colorTextDictionary = (sType: string): string => {
  if (!sType) return ''
  let sColor1 = "#ffffff", sColor2 = "#ffffff", sColor3 = "#ffffff"
  if (sType.startsWith('n')) sColor3 = sColor2 = sColor1 = "#0000ff"
  else if (sType.startsWith('v.past')) sColor3 = sColor2 = sColor1 = "#2e8b57"
  else if (sType.startsWith('v')) sColor3 = sColor2 = sColor1 = "#7cfc00"
  else if (sType.startsWith('adj')) sColor3 = sColor2 = sColor1 = "#ff0000"
  else if (sType.startsWith('adv')) sColor3 = sColor2 = sColor1 = "#ffff00"
  else if (sType.startsWith('prep')) sColor3 = sColor2 = sColor1 = "#800080"
  else if (sType.startsWith('pron')) sColor3 = "#000080"
  else if (sType.startsWith('conj')) { sColor3 = sColor2 = "#58FAF4"; sColor1 = "#61380B" }
  else if (sType.startsWith('art')) sColor3 = "#000000"
  else if (sType.startsWith('html')) sColor3 = sColor2 = sColor1 = "#e34c26"
  return `color: ${sColor3};`
}

/** 🧹 Cleanup */
onBeforeUnmount(() => {
  if (codeEditor) {
    codeEditor.dispose()
    codeEditor = null
  }
})

/** 🚀 Inizializza editor quando il componente è montato */
watch(
  () => [type.value, monacoCodeContainer.value, dictionaryCodeContainer.value],
  async ([newTypeArg]) => {
    if (newTypeArg === 'code' && monacoCodeContainer.value && !codeEditor) {
      await initializeCodeEditor(newTypeArg)
    }else if ( newTypeArg === 'dictionary' && dictionaryCodeContainer.value && !codeEditor) {
      await initializeCodeEditor(newTypeArg)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.dictionary-code{
  text-align: left; 
  font-family: 'Courier New'; 
  font-size: 1.2rem; 
  background-color:#d4d4d4;  
  color:  #1e1e1e;
  padding: 1rem; 
  border-radius: 0.5rem; 
  margin: 1rem auto; 
  width: 90%; 
  min-height: 9rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.carousel-container {
  position: relative;
  width: 100%;
  max-width: 65rem;
  height: auto;
  margin: 3rem auto;
  padding: 1rem;
}

.slide {
  width: 95%;
  height: auto;
  display: block;
  margin: auto;
  padding: 1rem;
}

.carousel-image {
  width: 85%;
  height: auto;
  display: block;
  margin: auto;
  border-radius: 1.5rem;
  box-shadow: 0 15px 40px rgba(0,0,0,0.1);
}

audio {
  width: 100%;
  margin: 1.5rem 0;
}

/* 🔵 Loader immagine */
.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25rem;
  background-color: #f8fafc;
  border-radius: 1.5rem;
}

.image-placeholder img {
  max-width: 150px;
  height: auto;
}

/* Frecce carosello */
.nav-btn {
  position: absolute;
  z-index: 10;
  top: 50%;
  width: 55px;
  height: 55px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.nav-btn.left { left: 0.25rem; }
.nav-btn.right { right: 0.25rem; }
.nav-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* Editor del codice con Monaco */
.code-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 105px); /* Adjusted for layout balance */
  background-color: #1e1e1e;
  padding: 0; /* Monaco requires 0 padding on container */
  margin: 0;
}

.dictionary-code-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(55vh - 101px);
  background-color: #1e1e1e;
  padding: 0;
  margin: 1.5rem 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.monaco-code-container {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.dictionary-code-container {
  flex: 2;
  width: 100%;
  height: 50vh !important;
  min-height: 0;
  text-align: left !important; 
}

/* Dictionary */
.dictionary { 
  background-color: white; 
  text-align: center;
  max-width: 60rem;
  margin: 4rem auto;
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 10px 50px rgba(0,0,0,0.05);
}

.dictionary h3 { 
  font-family: 'Fredericka the Great', cursive;
  font-size: 3.5rem; 
  margin: 0 0 1rem 0; 
  color: #1e293b;
  text-shadow: none;
}

.dictionary p { 
  text-align: center; 
  font-family: 'Julee', cursive; 
  font-size: 1.4rem; 
  color: #64748b;
  margin-bottom: 2.5rem;
  font-style: italic;
}

.dictionary h4 span { 
  font-family: 'New Tegomin', serif;
  padding: 0.5rem; 
  font-size: 1.8rem; 
  color: #334155;
  border-bottom: 2px dashed #e2e8f0;
}

.dictionary img { 
  height: auto; 
  width: 85%;
  margin: 2rem auto;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.dictionary-extra {
  margin: 1rem 0;
  font-size: 1.1rem;
  color: #777;
  font-style: italic;
  text-align: center;
}

.dictionary-note {
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: #fffde7;
  border-left: 6px solid #fdd835;
  color: #444;
  width: 95%;
  text-align: left;
  font-style: normal;
  border-radius: 8px;
  line-height: 1.6;
}

</style>