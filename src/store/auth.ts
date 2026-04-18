import { ref } from 'vue'

const apiToken = ref(null)
const user = ref(null)

export const useAuthStore = () => {
    return {
        apiToken,
        user,
        isLoggedIn: ref(false)
    }
}
