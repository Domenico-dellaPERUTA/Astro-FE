<!-- app/components/UI/MenuPage.vue -->
<template>
  <img 
    v-if="showAvatar == 'run'"
    class="avatar" 
    src="/avatar.gif"
    alt="avatar animato"
  />

  <ul class="right-menu">
    <li
      v-for="(sibling, index) in siblingsList"
      :key="index"
      class="right-menu-item"
      @click="selectSibling(index)"
    >
      <div :class="isCurrent(sibling) ? 'item-content bookmark-icon' : 'item-content'">
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
import { computed } from 'vue'
import { usePageStore } from '../../store/page'
import { Bookmark } from 'lucide-vue-next'

interface Sibling {
  name: string;
  link: string;
  type: string;
  index: number;
}

const pageStore = usePageStore()
const { siblings, topic, showAvatar, navigateToSibling } = pageStore

const siblingsList = computed<Sibling[]>(() => 
  (siblings.value || []) as Sibling[]
)

function isCurrent(sibling: Sibling): boolean {
  return sibling.name === topic.value
}

function selectSibling(index: number) {
  const sibling = siblingsList.value[index]
  if (!sibling) return
  navigateToSibling(index)
}
</script>

<style scoped>

.avatar{
  height: auto;
  width: 100%;
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
