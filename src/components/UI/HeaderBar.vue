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
      <button 
        v-if="isHome"
        @click="window.location.assign('/login')" 
        class="btn-icon-user"
      >
        <User2 class="icon-user" />
      </button>

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
      <div v-if="!isPhone && !isTablet" class="title-topic">Lista Argomenti</div>
    

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

        <!-- NAVIGAZIONE -->
        <ActionButton :disabled="type !== 'chess' && (type === 'carousel' || infoPageNum < 2)" :onClick="firstPage">
          <template #icon>
            <ChevronsLeft  v-if="type !== 'carousel'"  class="icon-small" />
            <Image  v-else class="icon-small" />
          </template>
        </ActionButton>

        <ActionButton :disabled="type !== 'chess' && (type === 'carousel' || infoPageNum < 2)" :onClick="prevPage">
          <template #icon>
            <ChevronLeft v-if="type !== 'carousel'"  class="icon-small" />
            <Dot  v-else class="icon-small" />
          </template>
        </ActionButton>

        <span :class="type !== 'carousel' ? 'page-info' : 'page-info-carousel'">
          <template v-if="type === 'chess'">
            Mossa {{ chessCurrentMove }} / {{ chessTotalMoves }}
          </template>
          <template v-else>
            {{ infoPageNum }} / {{ infoMaxPageNum }}
          </template>
        </span>

        <ActionButton :disabled="type !== 'chess' && (type === 'carousel' || infoPageNum >= infoMaxPageNum)"  :onClick="nextPage">
          <template #icon>
            <ChevronRight v-if="type !== 'carousel'" class="icon-small" />
            <Dot v-else class="icon-small" />
          </template>
        </ActionButton>

        <ActionButton :disabled="type !== 'chess' && (type === 'carousel' || infoPageNum >= infoMaxPageNum)"  :onClick="lastPage">
          <template #icon>
            <ChevronsRight v-if="type !== 'carousel'" class="icon-small" />
            <GalleryThumbnails v-else class="icon-small" />
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
  RefreshCw
} from 'lucide-vue-next'
import { computed, ref, onUnmounted } from 'vue'

import { useInfoStore } from '../../store/info'
import { usePageStore } from '../../store/page'
import ActionButton from './ActionButton.vue'

const pageStore = usePageStore()
const { 
  topic, type, items, currentIndex, pathFile, showAvatar, chessCurrentMove, chessTotalMoves,
  navigateToHome, navigateToPage, navigateToSibling, toggleChessFlip, setChessMove
} = pageStore

const infoStore = useInfoStore()
const { title: infoTitle, page: infoPageNum, maxPage: infoMaxPageNum } = infoStore

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
  if (infoStore.page.value > 1) {
    navigateToSibling(0)
  }
}

const lastPage = () => {
  if (type.value === 'chess') {
    setChessMove('end')
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
    const index = items.value.map((r:any) => r.item).indexOf(item.name) ?? 0
    const topicVal = topic.value || 'topic'
    const slug = encodeURIComponent(topicVal)
    window.location.assign(`/topic/${slug}/page/${index}/chapter/0`)
  },250)
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
  background-color: #404040;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* shadow-md */
}

/* Barra principale */
.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.75rem; /* h-[3.75rem] */
  padding: 0 1rem; /* px-4 */
}

/* Pulsanti icona */
.btn-icon {
  padding: 0.5rem;
  border-radius: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #cbd5e1; 
  background-color: #cbd5e1d3;
}
.btn-icon:hover {
  background-color: #cbd5e140; /* hover:bg-gray-300 */
}

/* Titolo */
.title {
  flex: 1;
  text-align: center;
  color: #dbff6e;
  vertical-align: middle;
  font-family: 'Fredericka the Great', cursive;
  font-weight: normal;
}

/* Barra secondaria */
.header-secondary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 2.5rem; /* h-[2.5rem] */
  padding: 0 1rem;
  background-color: #f7fafc; /* bg-gray-100 */
  border-top: 1px solid #e2e8f0; /* border-t */
}

/* Pulsanti piccoli */
.btn-small {
  padding: 0.25rem;
  border-radius: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
}
.btn-small:hover {
  background-color: #e2e8f0; /* hover:bg-gray-200 */
}

/* Icone */
.icon {
  width: 1.5rem; /* w-6 */
  height: 1.5rem; /* h-6 */
  color: #374151; /* text-gray-700 */
}
.icon-small {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  color: #374151;
}

.icon-on {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  color: #659d67;
  padding: 0.25rem;
  border-radius: 0.25rem;
  border-width: 1px;
  border-color: #659d67;
  border-style: solid;
}
.icon-on:hover {
  background-color: #659d67;
  color: #f7fafc;
}

.icon-off {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  color: #ac7272;
  padding: 0.25rem;
  border-radius: 0.25rem;
  border-width: 1px;
  border-color: #ac7272;
  border-style: solid;
}
.icon-off:hover {
  background-color: #ac7272;
  color: #f7fafc;
}

/* Layout barra secondaria */
.left-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 */
}

.page-info {
  font-size: 0.875rem; /* text-sm */
  color: #374151; /* text-gray-700 */
}

.spacer {
  width: 2.5rem; /* w-10 */
}

.info-title {
  flex: 1;
  text-align: center;
  color: #2270be;
  text-shadow: 4px 4px 4px #aaa;
  font-family: 'Fredericka the Great', cursive;
  font-size: 1.5rem;
  font-weight: lighter;
}

.page-info-carousel {
  font-size: 0.875rem; /* text-lg */
  color: #374151; /* text-gray-700 */
}

.btn-icon-user {
  width: 2.6rem;
  height: 2.6rem;
  padding: 0.4rem;
  border-radius: 1.3rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #404040; 
  background-color:#cbd5e140;
  margin-left: 2rem;
}
.btn-icon-user:hover {
  background-color:  #dbff6e; /* hover:bg-gray-300 */
}
.icon-user {
  color: #dbff6e;
}
.icon-user:hover {
  color: #404040;
}


</style>
