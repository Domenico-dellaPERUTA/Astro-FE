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

// Chess state
const chessCurrentMove = ref(0)
const chessTotalMoves = ref(0)
const chessFlipped = ref(false)

const setPageData = (data: any) => {
    type.value = data.type || 'home'
    topic.value = data.topic || ''
    code.value = data.code || ''
    items.value = data.items || []
    pgn.value = data.pgn || ''
    route.value = data.route || ''
    currentIndex.value = data.currentIndex || 0
    siblings.value = data.siblings || []
    menuPath.value = data.menuPath || ''
    
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

const setChessMove = (action: string) => {
    // Gestito dal componente ChessBoard
    console.log('setChessMove:', action)
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
        chessCurrentMove,
        chessTotalMoves,
        chessFlipped,
        setPageData,
        navigateToPage,
        navigateToHome,
        navigateToSibling,
        setCarouselRef,
        toggleChessFlip,
        setChessMove
    }
}
