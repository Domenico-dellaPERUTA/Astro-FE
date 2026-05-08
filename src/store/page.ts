import { ref } from 'vue'
import { useInfoStore } from './info'

const type = ref('home')
const topic = ref('')
const items = ref<any[]>([])
const code = ref('')
const pgn = ref('')
const route = ref('')
const currentIndex = ref(0)
const loading = ref(false)
const error = ref(null)

// Siblings: topic con lo stesso percorso menu
const siblings = ref<any[]>([])
const menuPath = ref('')

// Parametri extra usati dai componenti
const showAvatar = ref('stop')
const pathFile = ref('')
const carouselRef = ref<any>(null)
const audio = ref('')
const isInfoOpen = ref(false)

// Chess state
const chessCurrentMove = ref(0)
const chessTotalMoves = ref(0)
const chessFlipped = ref(false)
const chessMove = ref<string | null>(null)
const carouselAction = ref<string | null>(null)

const setPageData = (data: any) => {
    // Reset pathFile prima di tutto per evitare valori residui
    pathFile.value = ''
    
    type.value = data.type || 'home'
    topic.value = data.topic || ''
    code.value = data.code || ''
    items.value = data.items || []
    pgn.value = data.pgn || ''
    route.value = data.route || ''
    currentIndex.value = data.currentIndex || 0
    siblings.value = data.siblings || []
    menuPath.value = data.menuPath || ''
    audio.value = data.audio || ''
    
    // Per il tipo code e md, imposta pathFile al valore di audio se presente
    // Rimuovi il "/" iniziale se presente, perché HeaderBar lo aggiungerà
    if ((data.type === 'code' || data.type === 'md') && data.audio) {
        pathFile.value = data.audio.startsWith('/') ? data.audio.slice(1) : data.audio
    }
    
    // Sincronizza Info Store
    const info = useInfoStore()
    // La paginazione mostra la posizione tra i siblings
    const siblingCount = siblings.value.length || 1
    const currentSiblingIdx = siblings.value.findIndex(
      (s: any) => s.link === data.route
    )
    info.setPage(topic.value, currentSiblingIdx >= 0 ? currentSiblingIdx + 1 : 1, siblingCount)
}

const navigateToPage = (index: number, updateUrl = false) => {
    currentIndex.value = index
    const info = useInfoStore()
    info.page.value = index + 1
    
    if (updateUrl) {
       console.log('Navigate to page:', index)
    }
}

const navigateToHome = () => {
    window.location.assign('/')
}

const navigateToSibling = (index: number) => {
    const sibling = siblings.value[index]
    if (sibling?.link) {
        window.location.assign(sibling.link)
    }
}

const setCarouselRef = (refVal: any) => {
    carouselRef.value = refVal
}

const toggleChessFlip = () => {
    chessFlipped.value = !chessFlipped.value
}

const setChessMove = (action: string | null) => {
    chessMove.value = action
}

const setCarouselAction = (action: string | null) => {
    carouselAction.value = action
}

const getCarouselSlideInfo = () => {
    const item = items.value[currentIndex.value]
    if (item && typeof item === 'object') {
        return {
            title: item.title,
            text: item.text,
            hasInfo: !!(item.title || item.text)
        }
    }
    return { hasInfo: false }
}

export const usePageStore = () => {
    return {
        type,
        topic,
        items,
        code,
        pgn,
        currentIndex,
        loading,
        error,
        showAvatar,
        pathFile,
        carouselRef,
        siblings,
        menuPath,
        route,
        audio,
        chessCurrentMove,
        chessTotalMoves,
        chessFlipped,
        chessMove,
        isInfoOpen,
        getCarouselSlideInfo,
        setPageData,
        navigateToPage,
        navigateToHome,
        navigateToSibling,
        setCarouselRef,
        toggleChessFlip,
        setChessMove,
        carouselAction,
        setCarouselAction
    }
}
