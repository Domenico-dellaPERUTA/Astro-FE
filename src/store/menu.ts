import { ref } from 'vue'

const treeMenu = ref([
    { name: 'Home', link: '/' },
    { name: 'Esempio', link: '#' }
])
const loading = ref(false)
const error = ref(null)

export const useMenuStore = () => {
    return {
        treeMenu,
        loading,
        error
    }
}
