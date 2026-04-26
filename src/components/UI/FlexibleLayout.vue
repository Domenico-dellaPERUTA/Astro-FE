<!-- app/components/UI/FlexibleLayout.vue -->
<template>
  <div ref="container" class="container">
    <!-- Overlay di caricamento -->
    <div v-if="isLoading" class="loading-overlay">
       <img src="/await.gif" alt="Caricamento..." class="loading-gif" />
    </div>

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
        :class="['sidebar-left', showMenu ? 'is-open' : '']"
      >
        <MenuMaster :menuItems="treeMenu" :currentPath="route" @select="onSelectMenu" />
      </aside>

      <!-- Contenuto centrale -->
      <div :class="['content', { 'no-scroll': type === 'code' || type === 'chess' }]">
        <HomePage v-if="type === 'home'" />
        <TopicPage v-else />
      </div>

      <!-- Sidebar destra -->
      <aside
        v-if="siblings?.length >= 1"
        class="sidebar-right"
      >
        <MenuPage />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import { usePageStore } from '../../store/page'
import { useMenuStore } from '../../store/menu'
import MenuPage from './MenuPage.vue'
import HeaderBar from './HeaderBar.vue'
import MenuMaster from './MenuMaster.vue'
import TopicPage from './TopicPage.vue'
import HomePage from './HomePage.vue'

const props = defineProps({
  initialPageData: { type: Object, default: () => null },
  initialMenuData: { type: Array, default: () => null }
})

const pageStore = usePageStore()
const { type, topic, items, siblings, route, setPageData } = pageStore
const { treeMenu } = useMenuStore()

// Watch for prop changes to update the store (crucial for transition:persist)
watch(() => props.initialPageData, (newData) => {
  if (newData) setPageData(newData)
}, { immediate: true })

watch(() => props.initialMenuData, (newMenu) => {
  if (newMenu) treeMenu.value = newMenu as any[]
}, { immediate: true })

const showMenu = ref(true)
const isLoading = ref(true)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

const isPhone = ref(false)
const isTablet = ref(false)

onMounted(() => {
  // Rimuovi il caricamento dopo un piccolo ritardo per fluidità
  setTimeout(() => {
    isLoading.value = false
  }, 400)

  const checkLayout = () => {
    isPhone.value = window.innerWidth <= 768
    isTablet.value = window.innerWidth > 768 && window.innerWidth <= 1024

    // Su desktop (>1024) il menu è aperto di default, su tablet/phone è chiuso
    if (type.value !== 'home') {
      showMenu.value = window.innerWidth > 1024
    } else {
      showMenu.value = false
    }
  }
  checkLayout()
  window.addEventListener('resize', checkLayout)
})

function onSelectMenu(item: any): void {
  if (item.link && window.innerWidth <= 1024) {
    showMenu.value = false
  }
}
</script>

<style scoped>
/* 🔴 OVERRIDE: Disabilita Tailwind container utility */
.container {
  width: 100% !important;
  max-width: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Container principale */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

/* Layout principale */
.main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  width: 100%;
}

/* Sidebar sinistra */
.sidebar-left {
  background-color: #121212 !important; /* Force solid carbon */
  overflow-y: auto;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  width: 20rem; 
  z-index: 10; /* Lower than content */
  box-shadow: 4px 0 10px rgba(0,0,0,0.5);
  view-transition-name: sidebar-left;
}

/* Contenuto */
.content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background-color: #f8fafc; /* Solid light mode background */
  position: relative;
  z-index: 10;
  view-transition-name: main-content;
  display: flex;
  flex-direction: column;
}

.content.no-scroll {
  overflow: hidden;
}

/* 🌀 Caricamento */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(18, 18, 18, 0.1); /* Highly transparent charcoal */
  backdrop-filter: blur(4px); /* Subtler blur */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-gif {
  width: 250px; /* Larger image */
  height: 250px;
  object-fit: contain;
}

/* Sidebar destra */
.sidebar-right {
  background-color: #121212; /* Match primary theme */
  color: #ffffff;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  overflow-y: auto;
  flex-shrink: 0;
  width: 18rem;
  z-index: 10;
  display: none; /* Hidden by default */
}

/* 📱 MOBILE / TABLET (Drive Mode) */
@media (max-width: 1024px) {
  .sidebar-left {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    transform: translateX(-100%);
    box-shadow: 10px 0 30px rgba(0,0,0,0.5);
    z-index: 100; /* Must be high */
  }
  
  /* Quando il menu è aperto su mobile tramite classe o state */
  .sidebar-left.is-open {
    transform: translateX(0);
  }
}

/* 💻 DESKTOP */
@media (min-width: 1025px) {
  .sidebar-left {
    width: 20rem;
    transform: none !important;
    z-index: 10;
  }
}

/* 🖥️ DESKTOP / WIDE SCREENS */
@media (min-width: 1501px) {
  .sidebar-right {
    display: block;
    width: 18rem;
  }
}

/* 🖥️ LARGE DESKTOP */
@media (min-width: 1801px) {
  .sidebar-left {
    width: 24rem;
  }
  .sidebar-right {
    width: 22rem;
  }
}
</style>
