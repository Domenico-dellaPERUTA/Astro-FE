import { ref } from 'vue'

const loading = ref(false)
const error = ref(null)
const page = ref(0)
const maxPage = ref(0)
const title = ref('')

const setPage = (t: string, p: number, max: number) => {
    title.value = t
    page.value = p
    maxPage.value = max
}

export const useInfoStore = () => {
    return {
        loading,
        error,
        page,
        maxPage,
        title,
        setPage
    }
}
