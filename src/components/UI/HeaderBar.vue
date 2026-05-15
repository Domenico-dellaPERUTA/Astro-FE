<!-- app/components/UI/HeaderBar.vue -->
<template>
  <header class="header">
    <!------------------------ Barra principale  --------------------------------->
    <div class="header-main">
      <!-- Pulsante menu su telefono -->
      <button 
        v-if="isPhone || isTablet || isHome" 
        @click="$emit('openMenu')" 
        class="btn-icon"
      >
        <template v-if="isOpen">
          <EyeOff class="icon" />
        </template>
        <template v-else>
          <Menu class="icon" />
        </template>
        
      </button>

      <!-- Titolo pagina -->
      <h1 class="title">
        {{ currentTitle }}
      </h1>
      <!-- Pulsante login --> 
<!--
      <button 
        v-if="isHome"
        @click="window.location.assign('/login')" 
        class="btn-icon-user"
      >
        <User2 class="icon-user" />
      </button> 
-->

      <!-- Pulsante home -->
      <button 
        v-if="!isHome"
        @click="navigateToHome()" 
        class="btn-icon"
      >
        <Home class="icon" />
      </button>
    </div>

    <!-------------------------------- Barra secondaria ---------------------------->
    <div v-if="!isHome && !isLogin && !isAdmin" class="header-secondary">
      <div v-if="!isPhone && !isTablet" class="title-topic"> </div>
    

      <div class="info-title">{{ infoTitle }}</div>

      <div class="page-nav">
        <!-- LINKS -->
        <ActionButton
          v-if="type === 'dictionary' && dictionary?.links"
          :items="getLinks('links')"
          :onSelect="onLinkSelect"
          title-list="Collegamenti"
        >
          <template #icon>
            <Link class="icon-small" />
          </template>
        </ActionButton>

        <!-- NOTES -->
        <ActionButton
          v-if="type === 'dictionary' && dictionary.note"
          :items="getLinks('note')"
          :onSelect="onLinkSelect"
          title-list="Note"
        >
          <template #icon>
            <NotebookPen class="icon-small" />
          </template>
        </ActionButton>

        <!-- synonyms -->
        <ActionButton
          v-if="type === 'dictionary' && dictionary.synonyms"
          :items="getLinks('synonyms')"
          :onSelect="onLinkSelect"
          title-list="Sinonimi"
        >
          <template #icon>
            <Scale class="icon-small" />
          </template>
        </ActionButton>

        <!-- OPPOSITES -->
        <ActionButton
          v-if="type === 'dictionary' && dictionary.opposites"
          :items="getLinks('opposites')"
          :onSelect="onLinkSelect"
          title-list="Contrari"
        >
          <template #icon>
            <CircleSlash2 class="icon-small" />
          </template>
        </ActionButton>

        <!-- AUDIO -->
        <ActionButton
          v-if="type == 'code' || type == 'md'"
          :onClick="playAudio ? onRunAudio : onStopAudio"
        >
          <template #icon>
            <component
              :is="currentIcon"
              :class="playAudio ? 'icon-on' : 'icon-off'"
            />
          </template>
        </ActionButton>

        <!-- IMAGES in CODE -->
        <ActionButton
          v-if="type === 'code' "
          :items="getLinks('code')"
          title-list="Immagini"
        >
          <template #icon>
            <Eye class="icon-small" />
          </template>
        </ActionButton>

        <!-- RUOTA SCACCHIERA -->
        <ActionButton
          v-if="type === 'chess'"
          :onClick="toggleFlip"
          title="Ruota Scacchiera"
        >
          <template #icon>
            <RefreshCw class="icon-small" />
          </template>
        </ActionButton>

        <!-- Pulsante Info per carousel -->
        <ActionButton 
          v-if="type === 'carousel' && carouselSlideInfo.hasInfo" 
          customClass="info-btn-blink"
          :onClick="() => isInfoOpen = true"
        >
          <template #icon>
            <Info class="icon-small" />
          </template>
        </ActionButton>

        <ActionButton :disabled="(type !== 'chess' && type !== 'carousel' && type !== 'dictionary') && infoPageNum < 2" :onClick="firstPage">
          <template #icon>
            <ChevronsLeft class="icon-small" />
          </template>
        </ActionButton>
 
        <ActionButton :disabled="(type !== 'chess' && type !== 'carousel' && type !== 'dictionary') && infoPageNum < 2" :onClick="prevPage">
          <template #icon>
            <ChevronLeft class="icon-small" />
          </template>
        </ActionButton>
 
        <span :class="(type !== 'carousel' && type !== 'dictionary') ? 'page-info' : 'page-info-carousel'">
          <template v-if="type === 'chess'">
            Mossa {{ chessCurrentMove }} / {{ chessTotalMoves }}
          </template>
          <template v-else-if="type === 'carousel'">
            Slide {{ currentIndex + 1 }} / {{ items.length }}
          </template>
          <template v-else-if="type === 'dictionary'">
            Pagina {{ currentIndex + 1 }} / {{ items.length }}
          </template>
          <template v-else>
            Pagina {{ infoPageNum }} / {{ infoMaxPageNum }}
          </template>
        </span>
 
        <ActionButton :disabled="(type !== 'chess' && type !== 'carousel' && type !== 'dictionary') && infoPageNum >= infoMaxPageNum" :onClick="nextPage">
          <template #icon>
            <ChevronRight class="icon-small" />
          </template>
        </ActionButton>
 
        <ActionButton :disabled="(type !== 'chess' && type !== 'carousel' && type !== 'dictionary') && infoPageNum >= infoMaxPageNum" :onClick="lastPage">
          <template #icon>
            <ChevronsRight class="icon-small" />
          </template>
        </ActionButton>
      </div>
      <!----------------------------------------------------------------------------->
    </div>
  </header>
</template>

<script setup lang="ts">
import { 
  Menu, Home, Volume2, VolumeOff, Link,CircleSlash2,Scale,NotebookPen,EyeOff, User2,Castle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,Image, Dot,GalleryThumbnails,Eye,
  RefreshCw, Info
} from 'lucide-vue-next'
import { computed, ref, onUnmounted, watch } from 'vue'

import { useInfoStore } from '../../store/info'
import { usePageStore } from '../../store/page'
import ActionButton from './ActionButton.vue'

const pageStore = usePageStore()
const { 
  topic, type, items, currentIndex, pathFile, showAvatar, chessCurrentMove, chessTotalMoves, carouselRef,
  navigateToHome, navigateToPage, navigateToSibling, toggleChessFlip, setChessMove, setCarouselAction,
  isInfoOpen, getCarouselSlideInfo
} = pageStore

const infoStore = useInfoStore()
const { title: infoTitle, page: infoPageNum, maxPage: infoMaxPageNum } = infoStore

const carouselSlideInfo = computed(() => getCarouselSlideInfo())

watch(currentIndex, (newIdx) => {
  if (type.value === 'dictionary') {
    infoStore.page.value = newIdx + 1
    const currentItem = items.value[newIdx]
    if (currentItem?.item) {
      infoStore.title.value = currentItem.item
    }
  }
})

const currentIcon = computed(() => playAudio.value ? Volume2 : VolumeOff)

const isOpenLinks = ref(false)
const isOpenOpposites = ref(false)

const toggleFlip = () => {
  console.log('toggleFlip clicked in HeaderBar')
  toggleChessFlip()
}

const playAudio = ref(true)// true = non sta suonando, mostra icona Volume2
const checkingAudio = ref(false) //
var audio: HTMLAudioElement | null = null // riferimento al player audio

const props = defineProps({
  isPhone: { type: Boolean, default: false },
  isTablet: { type: Boolean, default: false },
  isOpen: {type: Boolean, default: true},
})

const dictionary = computed(() => (items.value[currentIndex.value] || {
  item: '',
  path: '',
}) as DictionaryItem)

const infoCode = computed(() => (items.value[currentIndex.value] || {
  link: [],
}) as CodeItem)


const currentTitle = computed(() => {
  if (!topic.value) return 'HOME'
  
  const menuPath = pageStore.menuPath?.value || ''
  console.log('[HeaderBar] menuPath:', menuPath)
  
  if (menuPath) {
    const parts = menuPath.split('/')
    const lastPart = parts[parts.length - 1].trim()
    console.log('[HeaderBar] Found menuPath:', menuPath, 'lastPart:', lastPart)
    return lastPart
  }
  
  return topic.value
})
const isHome = computed(() => !topic.value || topic.value === 'HOME')
const isLogin = computed(() => !topic.value || topic.value === 'LOGIN' || topic.value === 'Login' || topic.value === 'login')
const isAdmin = computed(() => !topic.value || topic.value === 'Cockpit Admin' || topic.value === 'cockpit admin' || topic.value === 'COCKPIT ADMIN')
const nextPage = () => {
  if (type.value === 'chess') {
    setChessMove('next')
    return
  }
  if (type.value === 'carousel') {
    setCarouselAction('next')
    return
  }
  if (type.value === 'dictionary') {
    if (currentIndex.value < items.value.length - 1) {
      navigateToPage(currentIndex.value + 1)
    }
    return
  }
  if (infoStore.page.value < infoStore.maxPage.value) {
    const nextIndex = infoStore.page.value
    navigateToSibling(nextIndex)
  }
}

const prevPage = () => {
  if (type.value === 'chess') {
    setChessMove('prev')
    return
  }
  if (type.value === 'carousel') {
    setCarouselAction('prev')
    return
  }
  if (type.value === 'dictionary') {
    if (currentIndex.value > 0) {
      navigateToPage(currentIndex.value - 1)
    }
    return
  }
  if (infoStore.page.value > 1) {
    const prevIndex = infoStore.page.value - 2
    navigateToSibling(prevIndex)
  }
}

const firstPage = () => {
  if (type.value === 'chess') {
    setChessMove('start')
    return
  }
  if (type.value === 'carousel') {
    setCarouselAction('first')
    return
  }
  if (type.value === 'dictionary') {
    navigateToPage(0)
    return
  }
  if (infoStore.page.value > 1) {
    navigateToSibling(0)
  }
}

const lastPage = () => {
  if (type.value === 'chess') {
    setChessMove('end')
    return
  }
  if (type.value === 'carousel') {
    setCarouselAction('last')
    return
  }
  if (type.value === 'dictionary') {
    navigateToPage(items.value.length - 1)
    return
  }
  if (infoStore.page.value < infoStore.maxPage.value) {
    const lastIndex = infoStore.maxPage.value - 1
    navigateToSibling(lastIndex)
  }
}

// helper: controlla se il file esiste (HEAD, fallback a GET)
async function fileExists(url:string) {
  if (!url) return false
  try {
    // prova HEAD (più leggera)
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return true

    // se server non supporta HEAD (405/501) o risponde non-ok, fallback a GET
    if (res.status === 405 || res.status === 501 || !res.ok) {
      const resGet = await fetch(url, { method: 'GET' })
      return resGet.ok
    }

    return false
  } catch (err) {
    // fetch può fallire per CORS o rete: ritorna false
    console.warn('fileExists error for', url, err)
    return false
  }
}

// ▶️ Avvia l'audio (robusto)
const onRunAudio = async () => {
  let sPath: string = pathFile.value ?? ''
  if (!sPath) return

  if (!sPath.toLowerCase().endsWith('.mp3')) {
    sPath = '/'+sPath.replace(/\.[^/.]+$/, '.mp3')
  } else {
    sPath = '/'+sPath
  }

  // evita click multipli mentre controlliamo/avviamo
  if (checkingAudio.value) return
  checkingAudio.value = true

  // se c'è già audio in riproduzione lo fermiamo prima di verificare il nuovo
  if (audio instanceof HTMLAudioElement) {
    audio.pause()
    audio.currentTime = 0
    audio = null
  }

  const exists = await fileExists(sPath)
  checkingAudio.value = false

  if (!exists) {
    // fallback UX: log e reset stato (puoi mostrare un toast)
    console.error(`File non trovato: ${sPath}`)
    // ripristina avatar/stato
    showAvatar.value = 'stop'
    playAudio.value = true
    return
  }

  // il file esiste -> crea Audio e riproduci
  try {
    showAvatar.value = 'run'

    audio = new Audio(sPath)

    // gestione degli errori runtime dell'elemento audio
    audio.onerror = (ev) => {
      console.error('Audio error:', ev)
      // reset stato UI
      playAudio.value = true
      showAvatar.value = 'stop'
      // libera risorse
      if (audio) {
        try { audio.pause() } catch(e) {}
        audio = null
      }
    }

    audio.onended = () => {
      playAudio.value = true
      showAvatar.value = 'stop'
      audio = null
    }

    // play
    const p = audio.play()
    // play() può restituire una Promise (browser che richiedono gesture)
    if (p && typeof p.then === 'function') {
      p.catch(err => {
        console.warn('Play rejected (autoplay policy?):', err)
        // ripristina stato se non parte
        playAudio.value = true
        showAvatar.value = 'stop'
      })
    }

    // aggiorna stato (se play() non ha rifiutato)
    playAudio.value = false

  } catch (err) {
    console.error('Errore avvio audio:', err)
    playAudio.value = true
    showAvatar.value = 'stop'
    audio = null
  }
}

// ⏹️ Ferma l'audio
const onStopAudio = () => {
  if (audio) {
    try { audio.pause() } catch (e) { console.warn(e) }
    try { audio.currentTime = 0 } catch (e) { /* ignore */ }
    audio = null
  }
  playAudio.value = true
  showAvatar.value = 'stop'
}

// pulizia quando il componente viene smontato (importa onUnmounted)
onUnmounted(() => {
  if (audio) {
    try { audio.pause() } catch(e) {}
    audio = null
  }
})

interface DictionaryItem {
  item: string;
  path: string;
  links?: string;
  note?: string;
  synonyms?: string;
  opposites?: string;
  [key: string]: string | undefined;
}

interface CodeItem {
  code?: string;
  link: string[];
  name?: string;
  type?: string;
}

interface Link {
  name?: string;
  imge: string;
}

const getLinks = (type:string): Link[] => {
  console.log('getLinks type:', type)
  if(type === 'code'){
    const linksCode = infoCode.value.link || []
    return linksCode.map((item: string) => {
      return { imge: `/${item}` }
    })
  }
  else if(dictionary.value?.[type]){
    if(type == 'note'){
       const notes = dictionary.value.note;
       return notes ? [{name: notes, imge: ''}] : []
    }else{ // liste elementi
      const links = dictionary.value?.[type]?.split(',') ?? [];
      return links.map((item: string) => {
        return {name: item, imge: `/${dictionary.value.path}${item}.jpg` }
      })
    }
  }
  return []
}

const onLinkSelect = (item: Link) => {
  // Chiudi il popover
  isOpenOpposites.value = false
  isOpenLinks.value = false
  
  setTimeout(() => {
    // Se siamo in un dizionario, cerchiamo prima tra le voci del dizionario stesso
    if (type.value === 'dictionary') {
      const itemIndex = items.value.findIndex((i: any) => i.item === item.name)
      if (itemIndex >= 0) {
        navigateToPage(itemIndex)
        return
      }
    }

    // Altrimenti cerchiamo tra i siblings (altri topic)
    const sibling = siblings.value.find((s: any) => s.name === item.name)
    if (sibling?.link) {
      window.location.assign(sibling.link)
    }
  }, 250)
}

</script>




<style scoped>

.title-topic {
    font-size: 1.8rem;
    font-family: Julee, cursive;
    color: #3c90dd;
    height: 2.2rem;
}


/* Header principale */
.header {
  width: 100%;
  background-color: #121212; /* Charcoal black */
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  view-transition-name: main-header;
}

/* Barra principale */
.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  padding: 0 1.5rem;
}

/* Pulsanti icona */
.btn-icon {
  padding: 0.6rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  color: #f8fafc; 
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

/* Titolo */
.title {
  flex: 1;
  text-align: center;
  color: #ff8c00; /* Brilliant Orange */
  font-family: 'Fredericka the Great', cursive;
  font-size: 2.2rem; /* Larger */
  font-weight: normal;
  letter-spacing: 1.5px;
  text-shadow: 0 0 25px rgba(255, 140, 0, 0.4);
}

/* Barra secondaria */
.header-secondary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3rem; /* Slightly taller */
  padding: 0 1.5rem;
  background-color: #1f1f1f;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Icone */
.icon {
  width: 1.6rem;
  height: 1.6rem;
  color: #f8fafc;
}
.icon-small {
  width: 1.3rem;
  height: 1.3rem;
  color: #cbd5e1;
}

.icon-on {
  width: 1.3rem;
  height: 1.3rem;
  color: #cfff04; /* Neon green consistency */
  padding: 0.2rem;
  border-radius: 6px;
  border: 1.5px solid #cfff04;
}
.icon-on:hover {
  background-color: #cfff04;
  color: #121212;
}

.icon-off {
  width: 1.3rem;
  height: 1.3rem;
  color: #fb7185;
  padding: 0.2rem;
  border-radius: 6px;
  border: 1.5px solid #fb7185;
}
.icon-off:hover {
  background-color: #fb7185;
  color: #121212;
}

/* Layout barra secondaria */
.page-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-info {
  font-size: 1rem;
  color: #f8fafc;
  font-weight: bold;
}

.info-title {
  flex: 1;
  text-align: center;
  color: #60a5fa; /* Brilliant Blue */
  text-shadow: 0 0 15px rgba(96, 165, 250, 0.3);
  font-family: 'Fredericka the Great', cursive;
  font-size: 1.7rem;
  font-weight: normal;
}

/* 📱 Responsive Adjustments for Mobile */
@media (max-width: 768px) {
  .title {
    font-size: 1.4rem; /* Scale down main title */
    letter-spacing: 0.5px;
  }
  .info-title {
    font-size: 1.2rem; /* Scale down secondary title */
  }
  .header-main {
    padding: 0 0.5rem;
  }
  .header-secondary {
    flex-direction: column;
    height: auto;
    min-height: 5.5rem;
    padding: 0.8rem 0.5rem;
    gap: 0.6rem;
    justify-content: center;
  }
  .page-nav {
    width: 100%;
    justify-content: center;
    gap: 0.8rem;
  }
}

.page-info-carousel {
  font-size: 1rem;
  color: #f8fafc;
  padding: 0 0.5rem;
}

.btn-icon-user {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  background: rgba(219, 255, 110, 0.1);
  border: 1px solid rgba(219, 255, 110, 0.3);
  cursor: pointer;
  color: #dbff6e;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 2rem;
}
.btn-icon-user:hover {
  background-color: #dbff6e;
  color: #0f172a;
}
.icon-user {
  width: 1.4rem;
  height: 1.4rem;
}

/* Info button blinking blue effect */
.info-btn-blink {
  animation: bluePulse 2s infinite;
}

@keyframes bluePulse {
  0%, 100% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.9), 0 0 30px rgba(59, 130, 246, 0.5);
  }
}
</style>
