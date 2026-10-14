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

      <!-- Ricerca testuale su tutte le voci del menu -->
      <div ref="searchBox" class="search-box">
        <Search class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Cerca argomenti…"
          autocomplete="off"
          spellcheck="false"
          role="combobox"
          aria-label="Cerca nel menu"
          :aria-expanded="searchOpen && searchResults.length > 0"
          aria-controls="menu-search-listbox"
          :aria-activedescendant="activeIdx >= 0 ? `menu-search-opt-${activeIdx}` : undefined"
          @focus="openSearch"
          @keydown="onSearchKeydown"
        />
        <button v-if="searchQuery" class="search-clear" @click="clearSearch" aria-label="Cancella ricerca">
          <X class="search-clear-icon" />
        </button>

        <div v-if="searchOpen && searchQuery.trim()" class="search-results">
          <ul v-if="searchResults.length > 0" id="menu-search-listbox" role="listbox" class="search-list">
            <li
              v-for="(r, i) in searchResults"
              :id="`menu-search-opt-${i}`"
              :key="r.link + i"
              role="option"
              :aria-selected="i === activeIdx"
              :class="['search-item', { 'is-active': i === activeIdx }]"
              @click="goSearch(r.link)"
              @mouseenter="activeIdx = i"
            >
              <span class="search-item-main">
                <span class="search-item-name">{{ r.name }}</span>
                <span v-if="r.path" class="search-item-path">{{ r.path }}</span>
              </span>
              <span v-if="r.type" class="search-item-type" :title="r.type">{{ typeEmoji(r.type) }}</span>
            </li>
          </ul>
          <p v-else class="search-empty">Nessun risultato per “{{ searchQuery.trim() }}”</p>
        </div>
      </div>
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

        <!-- AUDIO: visibile solo se frontmatter `audio` presente (true o percorso file) -->
        <ActionButton
          v-if="(type == 'code' || type == 'md' || type == 'html') && hasAudio"
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
          v-if="(type === 'carousel' || type === 'video') && carouselSlideInfo.hasInfo" 
          customClass="info-btn-blink"
          :onClick="() => isInfoOpen = true"
        >
          <template #icon>
            <Info class="icon-small" />
          </template>
        </ActionButton>

        <!-- Pulsante Schermo Intero per video -->
        <ActionButton 
          v-if="type === 'video'" 
          :onClick="toggleVideoFullscreen"
          :title="isVideoFullscreen ? 'Esci da schermo intero' : 'Schermo intero'"
        >
          <template #icon>
            <component :is="isVideoFullscreen ? Shrink : Expand" class="icon-small" />
          </template>
        </ActionButton>

        <ActionButton :disabled="(type !== 'chess' && type !== 'carousel' && type !== 'video' && type !== 'dictionary') && infoPageNum < 2" :onClick="firstPage">
          <template #icon>
            <ChevronsLeft class="icon-small" />
          </template>
        </ActionButton>
 
        <ActionButton :disabled="(type !== 'chess' && type !== 'carousel' && type !== 'video' && type !== 'dictionary') && infoPageNum < 2" :onClick="prevPage">
          <template #icon>
            <ChevronLeft class="icon-small" />
          </template>
        </ActionButton>
 
        <span :class="(type !== 'carousel' && type !== 'video' && type !== 'dictionary') ? 'page-info' : 'page-info-carousel'">
          <template v-if="type === 'chess'">
            Mossa {{ chessCurrentMove }} / {{ chessTotalMoves }}
          </template>
          <template v-else-if="type === 'carousel'">
            Slide {{ currentIndex + 1 }} / {{ items.length }}
          </template>
          <template v-else-if="type === 'video'">
            Video {{ currentIndex + 1 }} / {{ items.length }}
          </template>
          <template v-else-if="type === 'dictionary'">
            Pagina {{ currentIndex + 1 }} / {{ items.length }}
          </template>
          <template v-else>
            Pagina {{ infoPageNum }} / {{ infoMaxPageNum }}
          </template>
        </span>
 
        <ActionButton :disabled="(type !== 'chess' && type !== 'carousel' && type !== 'video' && type !== 'dictionary') && infoPageNum >= infoMaxPageNum" :onClick="nextPage">
          <template #icon>
            <ChevronRight class="icon-small" />
          </template>
        </ActionButton>
 
        <ActionButton :disabled="(type !== 'chess' && type !== 'carousel' && type !== 'video' && type !== 'dictionary') && infoPageNum >= infoMaxPageNum" :onClick="lastPage">
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
  RefreshCw, Info, Expand, Shrink, Search, X
} from 'lucide-vue-next'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

import { useInfoStore } from '../../store/info'
import { usePageStore } from '../../store/page'
import { useMenuStore } from '../../store/menu'
import ActionButton from './ActionButton.vue'

const pageStore = usePageStore()
const { 
  topic, type, items, currentIndex, pathFile, showAvatar, chessCurrentMove, chessTotalMoves, carouselRef,
  navigateToHome, navigateToPage, navigateToSibling, toggleChessFlip, setChessMove, setCarouselAction,
  isInfoOpen, getCarouselSlideInfo, code, isVideoFullscreen, toggleVideoFullscreen, audio: storeAudio, route
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

// 🔊 Mostra il pulsante audio solo se il frontmatter `audio` è presente:
// - `audio: true` → abilitato (usa file se risolvibile, altrimenti TTS)
// - `audio: "/path/file.mp3"` → abilitato (retrocompatibilità)
// - assente / false / "" → nascosto
const hasAudio = computed(() => {
  const v = storeAudio.value
  return v === true || (typeof v === 'string' && v.length > 0)
})

// Reset stato audio al cambio pagina (evita icona residua / audio in riproduzione)
watch([type, topic, storeAudio], () => {
  onStopAudio()
})

const isOpenLinks = ref(false)
const isOpenOpposites = ref(false)

// 🔍 Ricerca testuale su tutte le voci del menu (combo-box con suggerimenti)
const { treeMenu } = useMenuStore()

interface SearchEntry {
  name: string
  link: string
  type?: string
  path: string
}

const searchQuery = ref('')
const searchOpen = ref(false)
const activeIdx = ref(-1)
const searchBox = ref<HTMLElement | null>(null)

// Appiattisce l'albero in lista di voci navigabili, con breadcrumb di sezione
const flatMenu = computed<SearchEntry[]>(() => {
  const out: SearchEntry[] = []
  const walk = (nodes: any[], trail: string[]) => {
    for (const n of nodes || []) {
      if (n.isFolder) {
        if (n.link) out.push({ name: n.name, link: n.link, type: n.type, path: trail.join(' / ') })
        walk(n.menu || [], [...trail, n.name])
      } else if (n.link) {
        out.push({ name: n.name, link: n.link, type: n.type, path: trail.join(' / ') })
      }
    }
  }
  walk(treeMenu.value || [], [])
  return out
})

const searchResults = computed<SearchEntry[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return flatMenu.value
    .filter(e => e.name.toLowerCase().includes(q) || e.path.toLowerCase().includes(q))
    .slice(0, 10)
})

const openSearch = () => {
  if (searchQuery.value.trim()) searchOpen.value = true
}

const closeSearch = () => {
  searchOpen.value = false
  activeIdx.value = -1
}

const clearSearch = () => {
  searchQuery.value = ''
  closeSearch()
}

// Emoji per tipo di contenuto (più chiara della sigla per l'utente finale)
const typeEmoji = (t?: string): string => {
  switch ((t || '').toLowerCase()) {
    case 'code': return '💻'
    case 'md': return '📝'
    case 'html': return '🌐'
    case 'carousel': return '🎞️'
    case 'video': return '🎬'
    case 'dictionary': return '📖'
    case 'chess': return '♟️'
    case 'home': return '🏠'
    default: return '📄'
  }
}

const goSearch = (link: string) => {  closeSearch()
  searchQuery.value = ''
  if (!link) return
  if (typeof window !== 'undefined' && (window as any).__showGlobalLoader) {
    (window as any).__showGlobalLoader()
  }
  window.location.assign(link)
}

const onSearchKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const len = searchResults.value.length
    if (!len) return
    searchOpen.value = true
    activeIdx.value = e.key === 'ArrowDown'
      ? (activeIdx.value + 1) % len
      : (activeIdx.value - 1 + len) % len
  } else if (e.key === 'Enter') {
    const target = activeIdx.value >= 0 ? searchResults.value[activeIdx.value] : searchResults.value[0]
    if (target) goSearch(target.link)
  } else if (e.key === 'Escape') {
    closeSearch()
    ;(e.target as HTMLInputElement)?.blur()
  }
}

watch(searchQuery, () => {
  activeIdx.value = -1
  searchOpen.value = searchQuery.value.trim().length > 0
})

// Chiude i suggerimenti al cambio pagina e al click fuori dal campo
watch(route, () => {
  searchQuery.value = ''
  closeSearch()
})

const onDocumentClick = (e: MouseEvent) => {
  const el = searchBox.value
  if (el && !el.contains(e.target as Node)) closeSearch()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

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
  if (type.value === 'video') {
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
  if (type.value === 'video') {
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
  if (type.value === 'video') {
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
  if (type.value === 'video') {
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
  let exists = false;

  // evita click multipli mentre controlliamo/avviamo
  if (checkingAudio.value) return
  checkingAudio.value = true

  // se c'è già audio in riproduzione lo fermiamo prima di verificare il nuovo o usare TTS
  if (audio instanceof HTMLAudioElement) {
    audio.pause()
    audio.currentTime = 0
    audio = null
  }

  if (sPath) {
    if (!sPath.toLowerCase().endsWith('.mp3')) {
      sPath = '/'+sPath.replace(/\.[^/.]+$/, '.mp3')
    } else {
      sPath = '/'+sPath
    }

    exists = await fileExists(sPath)
  }
  
  checkingAudio.value = false

  if (!exists) {
    // Non avviamo la voce sintetica per il codice, a meno che sia esplicitamente abilitata con `audio: true`
    if (type.value === 'code' && storeAudio.value !== true) {
      console.warn(`Nessun audio trovato per il codice. Voce sintetica disabilitata.`);
      showAvatar.value = 'stop'
      playAudio.value = true
      return
    }

    console.warn(`Audio non trovato: ${sPath || 'percorso vuoto'}. Avvio sintesi vocale...`)
    
    // Preparazione del testo
    const textToRead = code.value || topic.value || "Testo non disponibile";
    let plainText = textToRead;
    if (type.value === 'html' || type.value === 'md') {
       const tempDiv = document.createElement('div');
       tempDiv.innerHTML = textToRead; 
       plainText = tempDiv.textContent || tempDiv.innerText || "";
       plainText = plainText.replace(/[#*`_~=\[\]]/g, ''); // Rimuovi markdown residuo
    }

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.lang = 'it-IT'; 
        
        // --- Forzare voce femminile ---
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const itVoices = voices.filter(v => v.lang.startsWith('it'));
            const femaleVoice = itVoices.find(v => 
                v.name.includes('Emma') || 
                v.name.includes('Federica') || 
                v.name.includes('Elsa') || 
                v.name.includes('Carla') || 
                v.name.includes('Bianca') || 
                v.name.includes('Alice') || 
                v.name.includes('Paola') || 
                v.name.includes('Luciana') || 
                v.name.includes('Martina') || 
                v.name.includes('Google italiano') // Su Chrome Android/PC è spesso femminile di default
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            } else if (itVoices.length > 0) {
                utterance.voice = itVoices[0]; // fallback a una voce italiana qualsiasi
            }
        }
        
        utterance.onstart = () => {
            showAvatar.value = 'run'
            playAudio.value = false
        };
        
        utterance.onend = () => {
            showAvatar.value = 'stop'
            playAudio.value = true
        };
        
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            showAvatar.value = 'stop'
            playAudio.value = true
        };

        window.speechSynthesis.speak(utterance);
    } else {
        console.error("Speech synthesis non supportata dal browser");
        showAvatar.value = 'stop'
        playAudio.value = true
    }
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
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  playAudio.value = true
  showAvatar.value = 'stop'
}

// pulizia quando il componente viene smontato (importa onUnmounted)
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  if (audio) {
    try { audio.pause() } catch(e) {}
    audio = null
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
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
      if (typeof window !== 'undefined' && (window as any).__showGlobalLoader) {
        (window as any).__showGlobalLoader()
      }
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
  position: relative; /* crea contesto di stacking: la tendina di ricerca resta sopra il contenuto */
  z-index: 500; /* sopra .content (10), sotto il drawer del menu (1000) */
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
  min-width: 0;
  text-align: center;
  color: #ff8c00; /* Brilliant Orange */
  font-family: 'Fredericka the Great', cursive;
  font-size: 2.2rem; /* Larger */
  font-weight: normal;
  letter-spacing: 1.5px;
  text-shadow: 0 0 25px rgba(255, 140, 0, 0.4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 🔍 Ricerca testuale nel menu (combo-box) */
.search-box {
  position: relative;
  width: 17rem;
  flex-shrink: 1;
  min-width: 0;
  margin: 0 0.75rem;
}
.search-icon {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.05rem;
  height: 1.05rem;
  color: #64748b;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.2rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  font-family: 'Julee', cursive;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.search-input::placeholder {
  color: #64748b;
}
.search-input:focus {
  border-color: rgba(255, 140, 0, 0.6);
  background: rgba(255, 255, 255, 0.09);
}
.search-clear {
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.2rem;
  cursor: pointer;
  border-radius: 6px;
}
.search-clear:hover {
  background: rgba(255, 255, 255, 0.12);
}
.search-clear-icon {
  width: 0.95rem;
  height: 0.95rem;
  color: #94a3b8;
}
.search-results {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 21rem;
  max-width: calc(100vw - 2rem);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  z-index: 500;
}
.search-list {
  list-style: none;
  margin: 0;
  padding: 0.4rem;
  max-height: 22rem;
  overflow-y: auto;
}
.search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
}
.search-item.is-active {
  background: #f1f5f9;
}
.search-item-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.search-item-name {
  font-family: 'Julee', cursive;
  font-size: 0.95rem;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-item-path {
  font-family: monospace;
  font-size: 0.68rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-item-type {
  flex-shrink: 0;
  font-size: 1.15rem;
  line-height: 1;
  cursor: help;
}
.search-empty {
  margin: 0;
  padding: 0.9rem 1rem;
  font-family: 'Julee', cursive;
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
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
  .search-box {
    width: auto;
    flex: 1;
    margin: 0 0.4rem;
  }
  .search-results {
    left: 0;
    right: 0;
    width: auto;
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
