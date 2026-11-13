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
const avatarReady = ref(true)   // false mentre il modello 3D è in download
const pathFile = ref('')
const carouselRef = ref<any>(null)
const audio = ref<string | boolean>('')
const isInfoOpen = ref(false)

// Chess state
const chessCurrentMove = ref(0)
const chessTotalMoves = ref(0)
const chessFlipped = ref(false)
const chessMove = ref<string | null>(null)
const carouselAction = ref<string | null>(null)
const isVideoFullscreen = ref(false)

// Steps state (presentazione a slide stile PowerPoint)
const stepsSlide = ref(1)        // slide corrente (1-based)
const stepsSlideTotal = ref(1)   // numero totale di slide
const stepsStep = ref(1)         // passo di comparsa corrente nella slide
const stepsStepTotal = ref(1)    // passi di comparsa nella slide corrente
const stepsAction = ref<string | null>(null)  // comandi da HeaderBar: next/prev/first/last
const autoplay = ref(false)      // avanza automaticamente quando finisce l'audio dello step
const stepsData = ref<any[]>([]) // slide YAML dal frontmatter (chiave "slides")

const setStepsAction = (action: string | null) => {
    stepsAction.value = action
}

const toggleVideoFullscreen = () => {
    const container = document.querySelector('.video-carousel-container') || document.querySelector('.carousel-container')
    if (!document.fullscreenElement) {
        if (container?.requestFullscreen) {
            container.requestFullscreen().catch(() => {})
        } else if ((container as any)?.webkitRequestFullscreen) {
            (container as any).webkitRequestFullscreen()
        } else if ((container as any)?.msRequestFullscreen) {
            (container as any).msRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {})
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen()
        }
    }
}

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
    audio.value = data.audio ?? ''
    autoplay.value = data.autoplay === true
    stepsData.value = data.slides || []

    // Per i tipi code, md, html e steps, imposta pathFile solo se audio è un percorso file (stringa)
    // Se audio === true il pulsante viene mostrato e verrà usata la sintesi vocale (TTS) come fallback
    // Rimuovi il "/" iniziale se presente, perché HeaderBar lo aggiungerà
    if ((data.type === 'code' || data.type === 'md' || data.type === 'html' || data.type === 'steps') && typeof data.audio === 'string' && data.audio) {
        pathFile.value = data.audio.startsWith('/') ? data.audio.slice(1) : data.audio
    }

    // Reset stato steps al cambio pagina (evita contatori residui)
    stepsSlide.value = 1
    stepsSlideTotal.value = 1
    stepsStep.value = 1
    stepsStepTotal.value = 1
    stepsAction.value = null
    
    // Sincronizza Info Store
    const info = useInfoStore()
    if (data.type === 'dictionary') {
        // Per i dizionari, la paginazione riflette gli item interni
        const currentItem = (data.items || [])[data.currentIndex || 0]
        const displayTitle = currentItem?.item || data.topic || ''
        info.setPage(displayTitle, (data.currentIndex || 0) + 1, (data.items || []).length || 1)
    } else {
        // La paginazione standard mostra la posizione tra i siblings (altri topic)
        const siblingCount = siblings.value.length || 1
        const currentSiblingIdx = siblings.value.findIndex(
          (s: any) => s.link === data.route
        )
        info.setPage(topic.value, currentSiblingIdx >= 0 ? currentSiblingIdx + 1 : 1, siblingCount)
    }
}

const navigateToPage = (index: number) => {
    currentIndex.value = index
    const infoStore = useInfoStore()
    
    if (type.value === 'dictionary') {
        infoStore.page.value = index + 1
        const currentItem = items.value[index]
        if (currentItem?.item) {
            infoStore.title.value = currentItem.item
        }
    } else {
        infoStore.page.value = index + 1
    }
}

const navigateToHome = () => {
    if (typeof window !== 'undefined' && (window as any).__showGlobalLoader) {
        (window as any).__showGlobalLoader()
    }
    window.location.assign('/')
}

const navigateToSibling = (index: number) => {
    const sibling = siblings.value[index]
    if (sibling?.link) {
        if (typeof window !== 'undefined' && (window as any).__showGlobalLoader) {
            (window as any).__showGlobalLoader()
        }
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
        avatarReady,
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
        stepsSlide,
        stepsSlideTotal,
        stepsStep,
        stepsStepTotal,
        stepsAction,
        setStepsAction,
        autoplay,
        stepsData,
        getCarouselSlideInfo,
        setPageData,
        navigateToPage,
        navigateToHome,
        navigateToSibling,
        setCarouselRef,
        toggleChessFlip,
        setChessMove,
        carouselAction,
        setCarouselAction,
        isVideoFullscreen,
        toggleVideoFullscreen
    }
}
