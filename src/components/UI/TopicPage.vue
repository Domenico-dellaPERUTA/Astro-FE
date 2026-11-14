<!-- app/components/UI/TopicPage.vue -->
<template>
  <div :class="['topic-page-container', { 'no-scroll': type === 'code' || type === 'chess' || type === 'steps' }]">
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
          @slide-end="onSlideEnd"
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
                  @play="runAvatar"
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

    <!------------------------------- 🧩 VIDEO CAROUSEL ---------------------------------------->
    <div v-else-if="type === 'video'" class="carousel-container video-carousel-container relative">
      <Carousel
        ref="carouselRef"
        :items-to-show="1"
        :wrap-around="true"
        :transition="70"
        class="rounded-2xl overflow-hidden"
        @slide-start="onVideoSlideChange"
        @slide-end="onVideoSlideEnd"
      >
        <Slide v-for="(item, index) in items" :key="index">
          <div class="slide">
            <div class="slide-content">
              <div class="video-frame-wrapper">
                <button
                  class="video-fullscreen-btn"
                  :title="isVideoFullscreen ? 'Esci da schermo intero' : 'Schermo intero'"
                  @click="toggleVideoFullscreen"
                >
                  <svg v-if="!isVideoFullscreen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                </button>
                <iframe
                  v-if="(index === currentIndex || Math.abs(index - currentIndex) <= 1) && toEmbedUrl(typeof item === 'object' ? item.url : item)"
                  :src="toEmbedUrl(typeof item === 'object' ? item.url : item)"
                  class="video-frame"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowfullscreen
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                  referrerpolicy="strict-origin-when-cross-origin"
                ></iframe>
                <div v-else class="image-placeholder">
                  <img src="/await.gif" alt="loading">
                </div>
              </div>
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
        
          <!-- Visual Preview (codeView) -->
          <div v-if="dictionary?.codeView" class="dictionary-preview">
            <div v-html="sanitizedCodeView" class="preview-scale-wrapper"></div>
          </div>
          
          <!-- Legacy HTML rendering for codeDescription (backward compatibility) -->
          <div v-else-if="dictionary?.codeDescription && dictionary?.type === 'html'" v-html="sanitizedCodeDescription" class="dictionary-code" />

          <!-- Monaco Editor for Code Snippet (codeDescription) -->
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

         <!-- Pulsanti di navigazione rotondi laterali (stile carousel) -->
         <button
           class="nav-btn left"
           :disabled="chessCurrentMove <= 0"
           aria-label="Mossa precedente"
           @click="setChessMove('prev')"
         >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor" class="w-6 h-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
           </svg>
         </button>
         <button
           class="nav-btn right"
           :disabled="chessCurrentMove >= chessTotalMoves"
           aria-label="Mossa successiva"
           @click="setChessMove('next')"
         >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor" class="w-6 h-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
           </svg>
         </button>
    </div>

    <!-------------------------- 🧩 STEPS (presentazione a slide) ------------->
    <div v-else-if="type === 'steps'" class="steps-wrapper">
      <!-- Palco: una "vista" fissa pari all'area disponibile, senza scroll.
           Il body HTML viene montato qui: ogni figlio diretto è una SLIDE,
           i suoi elementi con data-step appaiono a passi successivi -->
      <div
        ref="stepsStage"
        class="steps-stage"
        v-html="renderedSteps"
        @click="onStageClick"
      ></div>

      <!-- Pulsanti di navigazione rotondi laterali (stile carousel/chess) -->
      <button
        class="nav-btn left"
        :disabled="stepsSlide <= 1 && stepsStep <= 1"
        aria-label="Slide precedente"
        @click="stepsPrev"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        class="nav-btn right"
        :disabled="stepsSlide >= stepsSlideTotal && stepsStep >= stepsStepTotal"
        aria-label="Slide successiva"
        @click="stepsNext"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Indicatori: dots per slide + passo di comparsa corrente -->
      <div class="steps-indicators">
        <div class="steps-dots">
          <span
            v-for="n in stepsSlideTotal"
            :key="n"
            :class="['steps-dot', { on: n === stepsSlide, past: n < stepsSlide }]"
          ></span>
        </div>
        <div v-if="stepsStepTotal > 1" class="steps-step-info">
          passo {{ stepsStep }} / {{ stepsStepTotal }}
        </div>
      </div>
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
import ChessBoard from './ChessBoard.vue'
import DOMPurify from 'dompurify'
import { sanitizeKatexHtml } from '../../utils/katexSanitize'
// DOMPurify config that preserves KaTeX-generated HTML
// (config condivisa in src/utils/katexSanitize.ts)
function sanitizeMarkdown(html: string): string {
  return sanitizeKatexHtml(html)
}


// Monaco 0.53: i worker sono moduli ESM, il vecchio trucco blob+importScripts non funziona più.
// Il CSS arriva già dal bundle npm (il link CDN non serve più: cdnjs non ospita la 0.53).
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

if (typeof window !== 'undefined') {
  (self as any).MonacoEnvironment = {
    getWorker: () => new EditorWorker()
  }
}


const pageStore = usePageStore()
const { topic, type, items, code, pgn, currentIndex, showAvatar, avatarReady, setCarouselRef, navigateToPage, audio, carouselAction, setCarouselAction, isVideoFullscreen, toggleVideoFullscreen, setChessMove, chessCurrentMove, chessTotalMoves, stepsSlide, stepsSlideTotal, stepsStep, stepsStepTotal, stepsAction, setStepsAction, autoplay, stepsData } = pageStore

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

const renderedHtml = ref('')
const renderedMarkdown = ref('')
const markdownContainer = ref<HTMLElement | null>(null)

// Import marked for Markdown rendering + syntax highlighting
import { marked, Renderer } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'

// Enable KaTeX math rendering in marked ($...$ for inline, $$...$$ for display)
marked.use(markedKatex({ throwOnError: false }))

// KaTeX auto-render per il tipo "steps": converte $...$ e \(...\) nell'HTML del body
import renderMathInElement from 'katex/contrib/auto-render'

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
  codeView?: string
  links?: string
  synonyms?: string
  opposites?: string
  note?: string
  resolvedImageJpg?: string
  resolvedImagePng?: string
  resolvedAudio?: string
}
const dictionary = computed<DictionaryItem | undefined>(() => items.value[currentIndex.value] as DictionaryItem)

const sanitizedCodeView = computed(() => {
  return dictionary.value?.codeView ? DOMPurify.sanitize(dictionary.value.codeView) : ''
})

const sanitizedCodeDescription = computed(() => {
  return dictionary.value?.codeDescription ? DOMPurify.sanitize(dictionary.value.codeDescription) : ''
})

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
  else if (sType.startsWith('css')) sColor3 = sColor2 = sColor1 = "#3498db"
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

/** 🎬 Converte e valida URL video in formato embed sicuro */
function toEmbedUrl(url: string): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()

  // YouTube standard: https://www.youtube.com/watch?v=VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const ytShort = trimmed.match(/youtube\.com\/shorts\/([\w-]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`

  // Vimeo: https://vimeo.com/VIDEO_ID
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  // Permetti solo URL embed già validi con protocollo HTTPS sicuro su domini consentiti
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'https:') {
      if (
        parsed.hostname === 'www.youtube.com' ||
        parsed.hostname === 'youtube.com' ||
        parsed.hostname === 'player.vimeo.com'
      ) {
        return parsed.href
      }
    }
  } catch (_) {
    return ''
  }

  return ''
}

/**
 * 🎯 Sync indice slide con lo store.
 * ATTENZIONE (vue3-carousel 0.17): in `slide-start` il campo `currentSlideIndex`
 * è la slide di PARTENZA, non quella di destinazione — la destinazione è
 * `slidingToIndex`. In `slide-end` invece `currentSlideIndex` è quella finale.
 */
const clampSlideIndex = (idx: number): number => {
  const len = items.value?.length || 0
  if (!len) return 0
  return Math.min(Math.max(idx, 0), len - 1)
}

function onVideoSlideChange(data: any) {
  currentIndex.value = clampSlideIndex(data?.slidingToIndex ?? data?.currentSlideIndex ?? 0)
}

function onVideoSlideEnd(data: any) {
  currentIndex.value = clampSlideIndex(data?.currentSlideIndex ?? data?.slidingToIndex ?? 0)
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
  if (!path || carouselImages.value[path] || loadingImages.value.has(path)) return

  loadingImages.value.add(path)
  
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      carouselImages.value[path] = path
      loadingImages.value.delete(path)
      resolve(true)
    }
    img.onerror = () => {
      carouselImages.value[path] = path
      loadingImages.value.delete(path)
      resolve(false)
    }
    img.src = path
  })
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
  const newIndex = clampSlideIndex(data?.slidingToIndex ?? data?.currentSlideIndex ?? 0)
  currentIndex.value = newIndex
  await preloadAdjacentImages(newIndex)
}

function onSlideEnd(data: any) {
  const newIndex = clampSlideIndex(data?.currentSlideIndex ?? data?.slidingToIndex ?? 0)
  currentIndex.value = newIndex
  preloadAdjacentImages(newIndex)
}

/** 🔧 Carica solo la prima immagine al cambio items */
watch(
  () => items.value,
  async (newItems) => {
    if (Array.isArray(newItems) && newItems.length > 0 && (type.value === 'carousel' || type.value === 'video')) {
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
  if ((type.value === 'carousel' || type.value === 'video') && carouselRef.value) {
    setCarouselRef(carouselRef.value)
  }
})

/** ============================================================
 * 🪜 STEPS — presentazione a slide stile PowerPoint
 * ============================================================
 * Il body è HTML: ogni figlio diretto è una SLIDE (section/div):
 *
 *   <section class="slide" data-audio="/WebPages/.../slide-1.mp3">
 *     <h1 data-step="1">Titolo</h1>              appare al passo 1
 *     <p data-step="2" data-fx="slide-up">…</p>  appare al passo 2
 *     <img data-step="3" data-out="4" …>         esce al passo 4
 *   </section>
 *
 *   data-step  passo di apparizione (se nessun elemento lo ha,
 *              i figli diretti della slide diventano passi progressivi)
 *   data-out   passo di sparizione (uscita animata)
 *   data-fx    fade | slide-left | slide-right | slide-up | slide-down
 *              | zoom | zoom-out | pop | flip | blur
 *   data-audio mp3 riprodotto quando il blocco entra in scena
 *              (sulla slide: quando si entra nella slide)
 *   classi helper slide: .slide-center (contenuto centrato in verticale),
 *                        .slide-center-both (centrato anche in orizzontale)
 *
 * Frontmatter:
 *   audio: true     → TTS del testo del blocco a ogni passo
 *   audio: "/x.mp3" → pulsante header con la spiegazione completa
 *   autoplay: true  → quando l'audio del passo termina, avanza
 *
 * Authoring: in alternativa al body HTML, le slide possono essere
 * definite in YAML nel frontmatter (chiave `slides:`) → slidesToHtml().
 *
 * Le slide riempono tutta la vista disponibile (nessuno scroll) e si
 * succedono con transizione direzionale.
 */

const stepsStage = ref<HTMLElement | null>(null)
const renderedSteps = ref('')

interface StepBlock { el: HTMLElement; step: number; out: number | null; fx: string }
interface StepSlide { el: HTMLElement; blocks: StepBlock[]; maxStep: number; audio?: string }

let stepSlides: StepSlide[] = []

/** 🧩 Identifica slide e blocchi a comparsa e calcola i totali */
function collectStepSlides(stage: HTMLElement) {
  stepSlides = []

  // Ogni figlio diretto dello stage è una slide.
  // Fallback: senza contenitori, l'intero body è una slide unica.
  const slideEls = (Array.from(stage.children) as HTMLElement[])
    .filter(el => el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE')
  const targets = slideEls.length > 0 ? slideEls : [stage]

  for (const slideEl of targets) {
    if (slideEl !== stage) slideEl.classList.add('step-slide')

    const blocks: StepBlock[] = []
    let maxStep = 0

    // Blocchi a comparsa: elementi con data-step; se la slide non ne ha
    // nessuno, i figli diretti diventano passi progressivi (1, 2, 3…)
    const tagged = Array.from(slideEl.querySelectorAll('[data-step]')) as HTMLElement[]
    const blockEls = tagged.length > 0
      ? tagged
      : (Array.from(slideEl.children) as HTMLElement[])

    let autoStep = 0
    for (const el of blockEls) {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue

      const rawStep = parseInt(el.dataset.step || '', 10)
      if (tagged.length > 0 && !Number.isFinite(rawStep)) continue // sempre visibile

      let step = rawStep
      if (!Number.isFinite(step) || step < 1) {
        autoStep++
        step = autoStep
      }
      el.classList.add('step-item', `fx-${el.dataset.fx || 'fade'}`)

      let out: number | null = parseInt(el.dataset.out || '', 10)
      if (!Number.isFinite(out)) out = null
      else if (out <= step) out = step + 1 // uscita immediata: visibile un solo passo
      if (out !== null && out > maxStep) maxStep = out
      if (step > maxStep) maxStep = step

      blocks.push({ el, step, out, fx: el.dataset.fx || 'fade' })
    }

    stepSlides.push({
      el: slideEl,
      blocks,
      maxStep: Math.max(maxStep, 1),
      audio: slideEl.dataset.audio || undefined,
    })
  }
}

/** ⏳ Uscite di blocco in corso: annullabili se il blocco torna visibile */
const pendingExit = new WeakMap<HTMLElement, () => void>()

/** 👁 Applica la visibilità (con animazione) di un singolo blocco */
function setBlockVisible(el: HTMLElement, visible: boolean) {
  if (visible) {
    pendingExit.get(el)?.()
    pendingExit.delete(el)
    if (el.classList.contains('step-visible')) return
    el.classList.add('step-visible')
    // riavvia l'animazione d'ingresso anche se la classe torna nello stesso frame
    el.style.animation = 'none'
    void el.offsetHeight
    el.style.animation = ''
    return
  }
  if (!el.classList.contains('step-visible') || el.classList.contains('step-exit')) return

  // uscita animata: display none solo quando l'animazione è finita
  el.classList.add('step-exit')
  let done = false
  const cleanup = () => {
    if (done) return
    done = true
    el.removeEventListener('animationend', onEnd)
    pendingExit.delete(el)
    el.classList.remove('step-visible', 'step-exit')
  }
  const onEnd = (e: AnimationEvent) => {
    if (e.target !== el) return
    cleanup()
  }
  el.addEventListener('animationend', onEnd)
  const timer = setTimeout(cleanup, 700) // rete di sicurezza
  pendingExit.set(el, () => {
    done = true
    clearTimeout(timer)
    el.removeEventListener('animationend', onEnd)
    el.classList.remove('step-exit')
  })
}

/** 👁 Visibilità di tutti i blocchi di una slide per il passo corrente */
function applyBlockVisibility(slide: StepSlide, step: number) {
  for (const b of slide.blocks) {
    const visible = b.step <= step && (b.out === null || step < b.out)
    setBlockVisible(b.el, visible)
  }
}

/** 🎬 Transizione tra slide, direzionale (stile PowerPoint "Push") */
function showSlide(index: number, dir: 'forward' | 'back') {
  stepSlides.forEach((s, i) => {
    const el = s.el
    const clearAnim = () => el.classList.remove('slide-enter-left', 'slide-enter-right')
    if (i === index) {
      // entra: da destra se si avanza, da sinistra se si torna indietro
      const from = dir === 'forward' ? 'slide-enter-right' : 'slide-enter-left'
      el.classList.remove('slide-exit-left', 'slide-exit-right')
      const restart = el.classList.contains('slide-active')
      el.classList.remove('slide-enter-left', 'slide-enter-right')
      if (restart) void el.offsetHeight
      el.classList.add('slide-active', from)
      const onEnd = (e: AnimationEvent) => {
        if (e.target !== el) return
        el.removeEventListener('animationend', onEnd)
        clearTimeout(t)
        clearAnim()
      }
      el.addEventListener('animationend', onEnd)
      const t = setTimeout(clearAnim, 650)
    } else if (el.classList.contains('slide-active')) {
      // esce: verso sinistra se si avanza, verso destra se si torna
      const to = dir === 'forward' ? 'slide-exit-left' : 'slide-exit-right'
      el.classList.remove('slide-enter-left', 'slide-enter-right', 'slide-exit-left', 'slide-exit-right')
      el.classList.add(to)
      const finish = () => {
        el.removeEventListener('animationend', onEnd)
        clearTimeout(t)
        el.classList.remove('slide-active', 'slide-exit-left', 'slide-exit-right')
      }
      const onEnd = (e: AnimationEvent) => {
        if (e.target !== el) return
        finish()
      }
      el.addEventListener('animationend', onEnd)
      const t = setTimeout(finish, 650)
    }
  })
}

/** 🚚 Passa a una slide (indice 0-based) con transizione direzionale */
function goToSlide(index: number, dir: 'forward' | 'back') {
  if (index < 0 || index >= stepSlides.length) return
  if (index === stepsSlide.value - 1) return
  stopStepAudio()
  showSlide(index, dir)
  stepsSlide.value = index + 1
  stepsStep.value = 1
}

/** ⬅️➡️ Navigazione: la freccia consuma prima i passi, poi le slide */
function stepsNext() {
  if (type.value !== 'steps' || !stepSlides.length) return
  const slide = stepSlides[stepsSlide.value - 1]
  if (stepsStep.value < slide.maxStep) {
    stepsStep.value++
  } else if (stepsSlide.value < stepSlides.length) {
    goToSlide(stepsSlide.value, 'forward')
  }
}
function stepsPrev() {
  if (type.value !== 'steps' || !stepSlides.length) return
  if (stepsStep.value > 1) {
    stepsStep.value--
  } else if (stepsSlide.value > 1) {
    goToSlide(stepsSlide.value - 2, 'back')
    stepsStep.value = stepSlides[stepsSlide.value - 1].maxStep
  }
}
function stepsFirst() {
  if (type.value !== 'steps' || !stepSlides.length) return
  if (stepsSlide.value === 1) { stepsStep.value = 1; return }
  goToSlide(0, 'back')
}
function stepsLast() {
  if (type.value !== 'steps' || !stepSlides.length) return
  const last = stepSlides.length - 1
  if (stepsSlide.value - 1 === last) { stepsStep.value = stepSlides[last].maxStep; return }
  goToSlide(last, 'forward')
  stepsStep.value = stepSlides[last].maxStep
}

// Comandi di navigazione step inviati da HeaderBar (frecce della barra)
watch(stepsAction, (action) => {
  if (!action || type.value !== 'steps') return
  if (action === 'next') stepsNext()
  else if (action === 'prev') stepsPrev()
  else if (action === 'first') stepsFirst()
  else if (action === 'last') stepsLast()
  // Reset l'azione dopo l'esecuzione
  setStepsAction(null)
})

/** 🔊 Audio dello step: mp3 (data-audio) oppure sintesi vocale (audio: true) */
let stepAudioEl: HTMLAudioElement | null = null
let stepTtsToken = 0

function stopStepAudio() {
  stepTtsToken++
  if (stepAudioEl) {
    try { stepAudioEl.pause() } catch (_) { /* ignore */ }
    stepAudioEl = null
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel()
  showAvatar.value = 'stop'
}

/** 🎞 Frontmatter autoplay: quando l'audio del passo termina, avanza automaticamente */
function maybeAutoAdvance() {
  if (!autoplay.value) return
  stepsNext()
}

function playStepMp3(src: string) {
  stopStepAudio()
  try {
    showAvatar.value = 'run'
    const el = new Audio(src)
    stepAudioEl = el
    el.onended = () => {
      if (stepAudioEl !== el) return
      stepAudioEl = null
      showAvatar.value = 'stop'
      maybeAutoAdvance()
    }
    el.onerror = () => {
      if (stepAudioEl !== el) return
      stepAudioEl = null
      showAvatar.value = 'stop'
    }
    const p = el.play()
    if (p && typeof p.catch === 'function') {
      p.catch(() => { showAvatar.value = 'stop' })
    }
  } catch (_) {
    showAvatar.value = 'stop'
  }
}

function playStepTts(text: string) {
  stopStepAudio()
  if (!text || !window.speechSynthesis) return
  // Senza voci disponibili il TTS terminerebbe all'istante (e con autoplay
  // scarterebbe tutti gli step): meglio non partire affatto
  if (window.speechSynthesis.getVoices().length === 0) return
  const myToken = ++stepTtsToken

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'it-IT'
  // Voce femminile italiana (stessa lista usata in HeaderBar)
  const voices = window.speechSynthesis.getVoices()
  const itVoices = voices.filter(v => v.lang.startsWith('it'))
  const female = itVoices.find(v =>
    /Emma|Federica|Elsa|Carla|Bianca|Alice|Paola|Luciana|Martina|Google italiano/i.test(v.name)
  )
  if (female) utterance.voice = female
  else if (itVoices.length > 0) utterance.voice = itVoices[0]

  utterance.onstart = () => { showAvatar.value = 'run' }
  utterance.onend = () => {
    if (myToken !== stepTtsToken) return
    showAvatar.value = 'stop'
    maybeAutoAdvance()
  }
  utterance.onerror = () => {
    if (myToken !== stepTtsToken) return
    showAvatar.value = 'stop'
  }
  window.speechSynthesis.speak(utterance)
}

/** 📖 Testo leggibile di un blocco (senza il MathML duplicato di KaTeX) */
function blockText(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.katex-mathml').forEach(n => n.remove())
  // Non leggere i blocchi non ancora comparsi (es. overlay del canvas)
  // e non leggere il codice: solo prosa
  clone.querySelectorAll('.step-item:not(.step-visible)').forEach(n => n.remove())
  clone.querySelectorAll('pre, code').forEach(n => n.remove())
  return (clone.textContent || '').replace(/\s+/g, ' ').trim()
}

/** 🔁 Applica visibilità dei blocchi e audio dello stato corrente */
function refreshSteps(silent = false) {
  const slide = stepSlides[stepsSlide.value - 1]
  if (!slide) return
  stepsSlideTotal.value = stepSlides.length
  stepsStepTotal.value = slide.maxStep
  applyBlockVisibility(slide, stepsStep.value)

  if (silent) return

  // 🔊 Priorità audio: blocco entrato con questo passo → slide → TTS
  const entered = slide.blocks.filter(b => b.step === stepsStep.value)
  const audioBlock = entered.find(b => b.el.dataset.audio)
  if (audioBlock) {
    playStepMp3(audioBlock.el.dataset.audio as string)
    return
  }
  if (slide.audio) {
    playStepMp3(slide.audio)
    return
  }
  if (audio.value === true) {
    let text = ''
    if (entered.length) {
      // i blocchi che entrano in questo passo
      text = entered.map(b => blockText(b.el)).filter(Boolean).join(' ')
    } else if (slide.blocks.length === 0) {
      // slide statica: leggo tutto il testo
      text = blockText(slide.el)
    } else {
      // passo "vuoto": leggo solo gli elementi statici della slide
      const animated = new Set(slide.blocks.map(b => b.el))
      text = Array.from(slide.el.children)
        .filter(el => !animated.has(el as HTMLElement))
        .map(el => blockText(el as HTMLElement))
        .filter(Boolean).join(' ')
    }
    playStepTts(text)
    return
  }
  stopStepAudio()
}

/** 🎬 Cambio slide o passo: aggiorna visibilità dei blocchi + audio del passo */
watch([stepsSlide, stepsStep], () => {
  if (type.value !== 'steps' || !stepSlides.length) return
  refreshSteps()
})

/** 🖱 Click sul palco = avanza (tranne su link e controlli) */
function onStageClick(event: MouseEvent) {
  if (type.value !== 'steps') return
  const target = event.target as HTMLElement
  if (target.closest && target.closest('a, button, audio, video, input, [data-no-advance]')) return
  stepsNext()
}

/** ⌨️ Frecce / PageUp-Down / Home-End / Spazio (stile PowerPoint) */
function onStepsKeydown(event: KeyboardEvent) {
  if (type.value !== 'steps') return
  const target = event.target as HTMLElement
  if (target && target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) return
  switch (event.key) {
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
      event.preventDefault()
      stepsNext()
      break
    case 'ArrowLeft':
    case 'PageUp':
      event.preventDefault()
      stepsPrev()
      break
    case 'Home':
      event.preventDefault()
      stepsFirst()
      break
    case 'End':
      event.preventDefault()
      stepsLast()
      break
  }
}

/** 🏗 Slide YAML (frontmatter) → HTML della presentazione.
 *  Genera lo stesso markup del formato body, così tutta la pipeline
 *  a valle (sanifica → KaTeX → raccolta blocchi) resta invariata.
 *  Numerazione: il `title` della slide è il passo 1, i passi seguenti
 *  proseguono in ordine (2, 3, …). Nei blocchi html: gli elementi
 *  interni possono usare data-step/data-out con questi stessi numeri. */
function slidesToHtml(slides: any[]): string {
  return slides.map((slide) => {
    const classes = ['slide']
    if (slide.center) classes.push('slide-center')
    if (slide.centerBoth) classes.push('slide-center-both')
    const slideAttrs = [`class="${classes.join(' ')}"`]
    if (slide.audio) slideAttrs.push(`data-audio="${slide.audio}"`)
    if (slide.background) slideAttrs.push(`style="background:${slide.background}"`)

    const blocks: string[] = []
    let n = 0
    if (slide.title) {
      n++
      blocks.push(`<h2 data-step="${n}">${slide.title}</h2>`)
    }
    for (const step of slide.steps || []) {
      n++
      const attrs = [`data-step="${n}"`, `data-fx="${step.fx || 'fade'}"`]
      if (step.out) attrs.push(`data-out="${step.out}"`)
      if (step.audio) attrs.push(`data-audio="${step.audio}"`)
      if (step.center) attrs.push('class="step-center"')

      if (step.html != null && step.html !== '') {
        // Blocco HTML libero (grafica complessa: SVG, .step-canvas, overlay…)
        blocks.push(`<div ${attrs.join(' ')}>${step.html}</div>`)
      } else {
        const tag = step.tag || 'p'
        const inner = `<${tag} ${attrs.join(' ')}>${step.text || ''}</${tag}>`
        blocks.push(tag === 'li' ? `<ul>${inner}</ul>` : inner)
      }
    }
    return `<section ${slideAttrs.join(' ')}>${blocks.join('\n')}</section>`
  }).join('\n')
}

/** 🖌 Rendering del palco: sanifica, renderizza KaTeX, raccoglie slide e blocchi.
 *  Fonte: slide YAML dal frontmatter se presenti, altrimenti il body HTML. */
watch(
  () => [type.value, code.value, stepsData.value],
  async ([t]) => {
    if (t !== 'steps') return
    stopStepAudio()
    stepSlides = []

    // Correggi percorsi src relativi (come per il tipo html)
    let correctedCode = ''
    if (stepsData.value.length > 0) {
      correctedCode = slidesToHtml(stepsData.value)
    } else {
      correctedCode = code.value || ''
      correctedCode = correctedCode.replace(/src=(["'])(?!\/|https?:\/\/)([^"']*)\1/g, 'src=$1/$2')
    }

    renderedSteps.value = ''
    await nextTick()
    renderedSteps.value = sanitizeKatexHtml(correctedCode) || ''
    await nextTick()

    const stage = stepsStage.value
    if (!stage) return

    // 1. Formule KaTeX nell'HTML: $...$, \(...\), $$...$$, \[...\]
    try {
      renderMathInElement(stage, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
      })
      // 2. Risanitizza dopo l'auto-render (stessa policy del tipo md)
      stage.innerHTML = sanitizeKatexHtml(stage.innerHTML) || ''
    } catch (e) {
      console.error('[TopicPage] Steps KaTeX render error:', e)
    }

    // 3. Raccogli slide e blocchi, mostra la prima, applica lo stato iniziale
    collectStepSlides(stage)
    stepsSlide.value = 1
    stepsStep.value = 1
    stepSlides.forEach(s => s.el.classList.remove('slide-active'))
    stepSlides[0]?.el.classList.add('slide-active')
    refreshSteps(true)
  },
  { immediate: true }
)

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
      renderedHtml.value = DOMPurify.sanitize(`<div class="page">${correctedCode}</div>`) || ''
    } else if (type.value === 'code' && codeEditor) {
      // Aggiorna il contenuto dell'editor con codice pulito
      const cleaned = cleanCode(newCode || '')
      codeEditor.setValue(cleaned)
      const language = detectLanguage(cleaned)
      monaco.editor.setModelLanguage(codeEditor.getModel(), language)
    } else if (type.value === 'md') {
      // Convert markdown to HTML using marked e sanitizza con DOMPurify
      try {
        const raw = marked(newCode || '') as string
        renderedMarkdown.value = sanitizeMarkdown(raw)
      } catch (e) {
        console.error('[TopicPage] Markdown parse error:', e)
        renderedMarkdown.value = sanitizeMarkdown(newCode || '')
      }
    }
  },
  { immediate: true }
)

/** 🔧 Tipo di pagina */
watch(
  () => type.value,
  async (newType) => {
    if (newType === 'carousel' || newType === 'video') {
      await nextTick()
      if (carouselRef.value) {
        setCarouselRef(carouselRef.value)
      }
    } else if (newType === 'code' || newType === 'dictionary') {
      await nextTick()
      if (!codeEditor) await initializeCodeEditor(newType)
    } else if (newType === 'md') {
      // Convert markdown to HTML e sanitizza con DOMPurify
      await nextTick()
      try {
        const raw = marked(code.value || '') as string
        renderedMarkdown.value = sanitizeMarkdown(raw)
      } catch (e) {
        console.error('[TopicPage] Markdown parse error:', e)
        renderedMarkdown.value = sanitizeMarkdown(code.value || '')
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
const runAvatar = (event: Event) => {
  showAvatar.value = 'run'  // avvia sempre il download del modello
  // Se il modello 3D è ancora in download su desktop, blocca l'audio
  if (!avatarReady.value && window.innerWidth >= 1501) {
    (event.target as HTMLAudioElement).pause()
  }
}
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

const updateFullscreenStatus = () => {
  isVideoFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('fullscreenchange', updateFullscreenStatus)
  document.addEventListener('webkitfullscreenchange', updateFullscreenStatus)
  // Navigazione tastiera per il tipo "steps"
  document.addEventListener('keydown', onStepsKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('fullscreenchange', updateFullscreenStatus)
  document.removeEventListener('webkitfullscreenchange', updateFullscreenStatus)
  document.removeEventListener('keydown', onStepsKeydown)
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
  position: relative; /* riferimento per il righello di lettura assoluto */
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
  padding: 0.3rem 0.5rem; 
  font-size: 1.2rem; 
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

.dictionary-preview {
  margin: 1rem auto;
  padding: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 180px;
  flex-shrink: 0;
  overflow: hidden;
}

.preview-scale-wrapper {
  transform: scale(2);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Chess wrapper responsive */
.chess-wrapper {
  position: relative; /* riferimento per i pulsanti di navigazione laterali */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
}

.chess-wrapper .nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.chess-wrapper .nav-btn:disabled:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Mobile responsive for chess */
@media (max-width: 768px) {
  .chess-wrapper {
    padding: 0.25rem;
  }
}

.video-frame-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  background-color: #000;
}

.video-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 1rem;
}

.video-fullscreen-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 20;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 0.45rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.video-fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.95);
  opacity: 1;
  transform: scale(1.1);
}

/* 📺 Modalità a tutto schermo per il carosello video */
:fullscreen.video-carousel-container,
:-webkit-full-screen.video-carousel-container {
  max-width: 100vw !important;
  width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #000 !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

:fullscreen .slide,
:-webkit-full-screen .slide {
  height: 100vh !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:fullscreen .slide-content,
:-webkit-full-screen .slide-content {
  width: 100% !important;
  height: 100% !important;
  max-width: 100vw !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:fullscreen .video-frame-wrapper,
:-webkit-full-screen .video-frame-wrapper {
  width: 100vw;
  height: 100vh;
  padding-bottom: 0;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

:fullscreen .video-frame,
:-webkit-full-screen .video-frame {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
}

:fullscreen .nav-btn,
:-webkit-full-screen .nav-btn {
  z-index: 50;
  background: rgba(255, 255, 255, 0.7);
}
</style>