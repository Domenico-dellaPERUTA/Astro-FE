<!-- app/components/UI/TopicPage.vue -->
<template>
  <div :class="['topic-page-container', { 'no-scroll': type === 'code' || type === 'chess' }]">
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
              <div class="slide-content">
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
                  class="carousel-audio"
                />
              </div>
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

        <!-- Finestra Dialog Info -->
        <div v-if="isInfoOpen" class="info-dialog-overlay" @click="isInfoOpen = false">
          <div class="info-dialog" @click.stop>
            <button class="close-btn" @click="isInfoOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div class="info-dialog-header">
              <h3>{{ currentSlideInfo.title || 'Informazioni' }}</h3>
            </div>
            <div class="info-dialog-body">
              <p>{{ currentSlideInfo.text }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="image-placeholder">
        <img src="/await.gif" alt="loading">
      </div>
    </div>

    <!-------------------------- 🧩 DICTIONARY ---------------------------------->
    <div v-else-if="type === 'dictionary'" class="dictionary-view">
      <!-- Search Bar -->
      <div class="dictionary-search">
        <div class="search-input-wrapper">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Cerca una parola..." 
            class="search-input"
            @focus="showResults = true"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <!-- Search Results Dropdown -->
        <div v-if="showResults && searchTerm" class="search-results">
          <div 
            v-for="result in filteredResults" 
            :key="result.index"
            class="search-result-item"
            @click="selectDictionaryItem(result.index)"
          >
            <span class="result-word">{{ result.item }}</span>
            <span class="result-desc">{{ result.description }}</span>
          </div>
          <div v-if="filteredResults.length === 0" class="no-results">
            Nessun risultato trovato per "{{ searchTerm }}"
          </div>
        </div>
      </div>

      <!-- Word Content -->
      <div class="dictionary-content">
        <div class="dictionary-card">
          <h3 :style="colorTextDictionary(dictionary?.type ?? '')">{{ dictionary?.item }}</h3>
          <p v-if="dictionary?.fonetic" class="fonetic">{{ dictionary?.fonetic }}</p>
          <h4 class="description"><span>{{ dictionary?.description }}</span></h4>
        
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

          <div class="dictionary-images">
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
          </div>
          <audio :key="dictionary?.item" :src="dictionary?.resolvedAudio || `/${dictionary?.path}${dictionary?.item}.mp3`" autoplay></audio>
        </div>
      </div>
    </div>

    <!-------------------------- ♟️ CHESS -------------------------------------->
    <div v-else-if="type === 'chess'" class="chess-wrapper">
         <ChessBoard :pgn="pgn" />
    </div>

    <!-------------------------- 🧨 CARICAMENTO ---------------------------------->
    <div v-else></div>
  </div>
</template>

<script setup lang="ts">
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide } from 'vue3-carousel'
import { ref, onMounted, watch, computed, nextTick, onBeforeUnmount, onUnmounted } from 'vue'
import { usePageStore } from '../../store/page'
import { useInfoStore } from '../../store/info'
import { useAuthStore } from '../../store/auth'
import ChessBoard from './ChessBoard.vue'


if (typeof window !== 'undefined') {
  // Carichiamo il CSS dinamicamente da CDN se Rollup fa i capricci
  if (!document.getElementById('monaco-style')) {
    const link = document.createElement('link');
    link.id = 'monaco-style';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.53.0/min/vs/editor/editor.main.css';
    document.head.appendChild(link);
  }
  window.MonacoEnvironment = {
    getWorkerUrl: function () {
      const workerScript = `
        self.MonacoEnvironment = { baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.53.0/min/' };
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.53.0/min/vs/base/worker/workerMain.js');
      `;
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      return URL.createObjectURL(blob);
    }
  }
}


const pageStore = usePageStore()
const { topic, type, items, code, pgn, currentIndex, showAvatar, setCarouselRef, navigateToPage, audio, carouselAction, setCarouselAction } = pageStore

watch(carouselAction, async (action) => {
  if (!action || !carouselRef.value) return
  
  if (action === 'next') await carouselRef.value.next()
  else if (action === 'prev') await carouselRef.value.prev()
  else if (action === 'first') await carouselRef.value.slideTo(0)
  else if (action === 'last') await carouselRef.value.slideTo(items.value.length - 1)
  
  // Reset l'azione dopo l'esecuzione
  setCarouselAction(null)
})

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

const { isInfoOpen, getCarouselSlideInfo } = pageStore
const currentSlideInfo = computed(() => getCarouselSlideInfo())

/** 📚 Dictionary interface and computed */
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
    language: typeArg === 'code' ? detectLanguage(code.value || '') : ((dictionary.value?.type === 'html' || dictionary.value?.type === 'css') ? dictionary.value.type : detectLanguage(dictionary.value?.codeDescription || '')),
    theme: 'vs-dark',
    automaticLayout: true,
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

  // 📐 Gestione layout dinamico
  const container = typeArg === 'code' ? monacoCodeContainer.value : dictionaryCodeContainer.value
  if (container && codeEditor) {
    // Un piccolo ritardo aiuta a garantire che il layout sia stabile
    setTimeout(() => {
      if (codeEditor) codeEditor.layout()
    }, 50)
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
  currentIndex.value = newIndex
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
    if (newType === 'carousel') {
      await nextTick()
      if (carouselRef.value) {
        setCarouselRef(carouselRef.value)
      }
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

/** 🔧 Aggiorna editor dizionario al cambio voce */
watch(
  () => dictionary.value,
  async (newDict) => {
    if (type.value === 'dictionary' && codeEditor && newDict) {
      codeEditor.setValue(newDict.codeDescription || '')
      const language = (newDict.type === 'html' || newDict.type === 'css') ? newDict.type : detectLanguage(newDict.codeDescription || '')
      monaco.editor.setModelLanguage(codeEditor.getModel(), language)
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

/** 📚 Dictionary Logic */
const searchTerm = ref('')
const showResults = ref(false)

const filteredResults = computed(() => {
  if (!searchTerm.value) return []
  const query = searchTerm.value.toLowerCase()
  return (items.value as DictionaryItem[])
    .map((item, index) => ({ ...item, index }))
    .filter(item => 
      item.item.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    )
    .slice(0, 10) // Limit to 10 results for performance
})

const selectDictionaryItem = (index: number) => {
  currentIndex.value = index
  searchTerm.value = ''
  showResults.value = false
}

// Close results when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dictionary-search')) {
    showResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
.topic-page-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.topic-page-container.no-scroll {
  overflow: hidden;
}

/* Specific reset for Monaco to avoid interference from global styles */
:deep(.monaco-editor) {
  line-height: normal !important;
}
:deep(.monaco-editor .view-line) {
  line-height: 1.2 !important; /* Force standard Monaco line height */
}
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
  max-width: 80rem; /* Increased for larger images */
  height: auto;
  margin: 1rem auto;
  padding: 1rem;
}

.slide {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.slide-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%; 
}

.carousel-image {
  width: 100%; 
  max-height: 70vh; /* More height while keeping audio visible */
  height: auto;
  display: block;
  border-radius: 1.5rem;
  box-shadow: 0 15px 40px rgba(0,0,0,0.1);
  object-fit: contain;
}

.carousel-audio {
  width: 100%;
  margin-top: 1.2rem;
}

/* 🔵 Loader immagine */
.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25rem;
  width: 100%;
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
.nav-btn.info { 
  right: 0.25rem; 
  top: auto;
  bottom: 0.25rem;
  transform: none;
  background: rgba(59, 130, 246, 0.9);
  color: white;
}
.nav-btn.info:hover {
  background: rgba(37, 99, 235, 1);
  transform: scale(1.1);
}
.nav-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 💠 Info Dialog Styling */
.info-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.info-dialog {
  background: rgba(255, 255, 255, 0.95);
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 1.5rem;
  padding-top: 2.5rem;
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.info-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.info-dialog-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: 2px solid #ffffff;
  border-radius: 50%;
  width: 36px !important;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;
  z-index: 10;
  padding: 0;
}

.close-btn svg {
  width: 16px !important;
  height: 16px !important;
  flex-shrink: 0;
}

.close-btn:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  transform: scale(1.1);
}

.info-dialog-body {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #475569;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Editor del codice con Monaco */
.code-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%; /* Fill parent container */
  background-color: #1e1e1e;
  padding: 0;
  margin: 0;
  min-height: 50vh;
}

.dictionary-code-wrapper {
  display: flex;
  flex-direction: column;
  height: 50vh; /* Fixed relative height for dictionary */
  background-color: #1e1e1e;
  padding: 0;
  margin: 0.5rem 0;
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
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  text-align: left !important; 
}

/* Dictionary View (Dynamic) */
.dictionary-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  background-color: #f1f5f9;
}

.dictionary-search {
  position: sticky;
  top: 0;
  z-index: 100;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 1.2rem;
  height: 1.2rem;
  color: #94a3b8;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.search-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f8fafc;
}

.result-word {
  font-weight: 600;
  color: #1e293b;
}

.result-desc {
  font-size: 0.85rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  padding: 1rem;
  color: #64748b;
  text-align: center;
  font-size: 0.9rem;
}

.dictionary-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.dictionary-card { 
  background-color: white; 
  text-align: center;
  width: 100%;
  max-width: 50rem;
  padding: 1.5rem 2rem;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dictionary-card h3 { 
  font-family: 'Fredericka the Great', cursive;
  font-size: 3rem; 
  margin: 0 0 0.5rem 0; 
  color: #1e293b;
  flex-shrink: 0;
}

.fonetic { 
  text-align: center; 
  font-family: 'Julee', cursive; 
  font-size: 1.4rem; 
  color: #64748b;
  margin-bottom: 1rem;
  font-style: italic;
  flex-shrink: 0;
}

.description span { 
  font-family: 'New Tegomin', serif;
  padding: 0.5rem; 
  font-size: 2rem; 
  color: #334155;
  border-bottom: 2px dashed #e2e8f0;
}

.dictionary-images {
  margin-top: 1rem;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.dictionary-images img { 
  max-height: 100%; 
  max-width: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.dictionary-extra {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: #64748b;
  font-style: italic;
  text-align: center;
  flex-shrink: 0;
}

.dictionary-note {
  margin: 1rem auto 0 auto;
  padding: 1rem;
  background-color: #fffde7;
  border-left: 4px solid #fdd835;
  color: #444;
  width: 100%;
  text-align: left;
  font-style: normal;
  border-radius: 8px;
  line-height: 1.5;
  font-size: 1rem;
  flex-shrink: 0;
  max-height: 100px;
  overflow-y: auto;
}

/* Chess wrapper responsive */
.chess-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
}

/* Mobile responsive for chess */
@media (max-width: 768px) {
  .chess-wrapper {
    padding: 0.25rem;
  }
}

</style>