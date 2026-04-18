<!-- app/components/UI/FlexibleLayout.vue -->
<template>
  <div ref="container" class="container">
    <!-- Header -->
    <HeaderBar
      :isPhone="isPhone"
      :isTablet="isTablet"
      :isOpen="showMenu"
      @openMenu="toggleMenu"
    />

    <!-- Main layout -->
    <div ref="main" class="main">
      <!-- Sidebar sinistra -->
      <aside
        v-if="showMenu"
        :class="['sidebar-left', isPhone ? 'sidebar-device' : '']"
      >
        <MenuMaster :menuItems="treeMenu" :currentPath="route" @select="onSelectMenu" />
      </aside>

      <!-- Contenuto centrale -->
      <div class="content">
        <HomePage v-if="type === 'home'" />
        <TopicPage v-else />
      </div>

      <!-- Sidebar destra -->
      <aside
        v-if="siblings?.length >= 1 && !isPhone && !isTablet"
        class="sidebar-right"
      >
        <MenuPage />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import { useInfoStore } from '../../store/info'
import { usePageStore } from '../../store/page'
import { useMenuStore } from '../../store/menu'
import MenuPage from './MenuPage.vue'
import HeaderBar from './HeaderBar.vue'
import MenuMaster from './MenuMaster.vue'
import TopicPage from './TopicPage.vue'
import HomePage from './HomePage.vue'

const props = defineProps({
  initialPageData: {
    type: Object,
    default: () => null
  },
  initialMenuData: {
    type: Array,
    default: () => null
  }
})

const pageStore = usePageStore()
const { type, topic, items, siblings, route, setPageData } = pageStore
const { treeMenu } = useMenuStore()

if (props.initialPageData) {
  setPageData(props.initialPageData)
}
if (props.initialMenuData) {
  treeMenu.value = props.initialMenuData
}

const isLogin = computed(() => topic.value === 'LOGIN' || topic.value === 'Login' || topic.value === 'login')
const isAdmin = computed(() => topic.value === 'Cockpit Admin' || topic.value === 'cockpit admin' || topic.value === 'COCKPIT ADMIN')
const isHome = computed(() => type.value === 'home')

const container = ref<HTMLElement | null>(null)
const main = ref<HTMLElement | null>(null)

// --- ✅ Stato del layout osservato semanticamente (non con pixel) ---
const layoutMode = ref<'phone' | 'tablet' | 'desktop'>('desktop')

// --- Compatibilità con codice esistente ---
const isPhone = computed(() => layoutMode.value === 'phone')
const isTablet = computed(() => layoutMode.value === 'tablet')
const isDesktop = computed(() => layoutMode.value === 'desktop')

// --- Gestione menu laterale ---
const showMenu = ref(true)
function toggleMenu() {
  showMenu.value = !showMenu.value
}


// --- Observer per determinare il layout semanticamente ---
onMounted(() => {
  const el = main.value
  if (!el) return

  const observer = new ResizeObserver(([entry]) => {
    const style = getComputedStyle(el)
    const flexDirection = style.flexDirection

    // 🔍 logica "semantica" (non basata su numeri)
    if (flexDirection === 'column') {
      layoutMode.value = 'phone'
    } else {
      // Se c'è abbastanza spazio → desktop (anche con un solo file)
      const hasRightSidebar = siblings.value?.length >= 1
      layoutMode.value = hasRightSidebar ? 'desktop' : 'tablet'
    }
  })
  observer.observe(el)
  onBeforeUnmount(() => observer.disconnect())
})

// --- Aggiorna visibilità menu quando cambia layout ---
// sincronizza showMenu in base al layout (più affidabile)
// sincronizza showMenu in base al layout e al tipo di pagina
watch([layoutMode, type], ([mode, newType]) => {
  if (newType === 'home') {
    showMenu.value = false
    return
  }

  if (mode === 'desktop' || mode === 'tablet') {
    showMenu.value = true
  } else {
    // phone
    showMenu.value = false
  }
}, { immediate: true })


/**
 * Gestisce la selezione di un item dal menu ad albero.
 * I nodi foglia hanno una proprietà 'link' che porta alla pagina del topic.
 * I nodi cartella vengono gestiti internamente dal MenuItem (toggle apri/chiudi).
 */
function onSelectMenu(item: any): void {
  if (item.link) {
    // Nodo foglia: naviga alla pagina del topic
    if (isPhone.value) {
      showMenu.value = false
    }
    window.location.assign(item.link)
  }
  // Per i nodi cartella, l'apertura/chiusura è gestita da MenuItem.vue
}
</script>

<style scoped>
/* Container principale */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  container-type: inline-size;
}

/* Layout principale */
.main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* Sidebar sinistra */
.sidebar-left {
  background-color: #404040;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.sidebar-device {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 70%;
  z-index: 20;
  height: auto;
}

/* Contenuto */
.content {
  flex: 1;
  overflow-y: auto;
}

/* Sidebar destra */
.sidebar-right {
  background-color: #ffffff;
  border-left: 1px solid #ddd;
  overflow-y: auto;
}

/* 🔮 Layout adattivo senza breakpoint numerici */
@container (max-width: 45rem) {
  .main {
    flex-direction: column;
  }

  .sidebar-left {
    width: 100%;
    height: auto;
  }

  .sidebar-right {
    display: none;
  }
}

@container (min-width: 45rem) and (max-width: 85rem) {
  .main {
    flex-direction: row;
  }

  .sidebar-left {
    width: 20rem;
  }

  .sidebar-right {
    display: none;
  }
}

@container (min-width: 85rem) {
  .main {
    flex-direction: row;
  }

  .sidebar-left {
    width: 25rem;
  }

  .sidebar-right {
    width: 20rem;
  }
}
</style>
