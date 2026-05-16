<!-- app/components/UI/MenuPage.vue -->
<template>
  <!-- Avatar 3D: sempre montato su desktop (scarica il modello una sola volta) -->
  <div v-if="isDesktop" v-show="showAvatar === 'run'" class="avatar-area">
    <!-- Loading indicator durante il download -->
    <div v-if="showAvatar === 'run' && !avatarReady" class="avatar-loading">
      <img src="/await.gif" alt="Caricamento avatar..." />
      <p class="avatar-loading-label">Caricamento avatar...</p>
    </div>
    <!-- Canvas 3D: montato ma nascosto mentre il modello arriva -->
    <AvatarParlante
      :is-speaking="showAvatar === 'run'"
      :style="showAvatar === 'run' && !avatarReady ? 'visibility:hidden;height:0;overflow:hidden' : ''"
      class="avatar-3d"
    />
  </div>

  <ul class="right-menu">
    <li
      v-for="(sibling, index) in siblingsList"
      :key="index"
      class="right-menu-item"
      @click="selectSibling(index)"
    >
      <div :class="isCurrent(sibling, index) ? 'item-content bookmark-icon' : 'item-content'">
        <span>{{ sibling.name }}</span>

        <!-- Mostra segnalibro solo per il sibling corrente -->
        <Bookmark
          v-if="isCurrent(sibling)"
          class="bookmark-icon"
          :size="18"
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { usePageStore } from '../../store/page'
import { Bookmark } from 'lucide-vue-next'
import AvatarParlante from './AvatarParlante.vue'

interface Sibling {
  name: string;
  link: string;
  type: string;
  index: number;
}

const pageStore = usePageStore()
const { siblings, topic, type, items, showAvatar, avatarReady, navigateToSibling, navigateToPage, currentIndex } = pageStore

// --- Desktop detection (sidebar destra visibile solo >=1501px) ---
const isDesktop = ref(false)
let resizeHandler: () => void
onMounted(() => {
  resizeHandler = () => { isDesktop.value = window.innerWidth >= 1501 }
  resizeHandler()
  window.addEventListener('resize', resizeHandler)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
})

const siblingsList = computed<any[]>(() => {
  if (type.value === 'dictionary') {
    return items.value.map((item, index) => ({
      name: item.item,
      link: '#', // Non serve un link reale per il dizionario dinamico
      type: 'dictionary',
      index
    }))
  }
  return (siblings.value || [])
})

function isCurrent(sibling: any, index: number): boolean {
  if (type.value === 'dictionary') {
    return index === currentIndex.value
  }
  return sibling.name === topic.value
}

function selectSibling(index: number) {
  if (type.value === 'dictionary') {
    navigateToPage(index)
  } else {
    navigateToSibling(index)
  }
}
</script>

<style scoped>

.avatar-area {
  width: 100%;
}

.avatar-3d {
  width: 100%;
  margin: 0 auto 0.5rem auto;
  display: block;
}

.avatar-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
}

.avatar-loading img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.avatar-loading-label {
  font-size: 0.7rem;
  color: #888;
  font-family: sans-serif;
  text-align: center;
}

.right-menu {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  background-color: #fff;
  color: #333;
  height: calc(100% - 0.25rem);
  overflow-y: auto;
  font-family: Julee, cursive;
}

.right-menu-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.right-menu-item:hover {
  background-color: #f7f7f7;
  color: #ffae00;
}

/* Layout orizzontale testo + icona */
.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Colore segnalibro (puoi personalizzarlo) */
.bookmark-icon {
  color: #007bff;
}
</style>
