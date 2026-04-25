<!-- app/components/UI/MenuItem.vue -->
<template>
  <li v-if="item.name">
    <!-- Link per le foglie (con ViewTransitions support) -->
    <a 
      v-if="item.link"
      :href="item.link"
      :class="[
        'menu-item-base',
        'menu-item',
        (item.link === currentPath) ? 'is-active' : ''
      ]" 
      :style="{ 
        paddingLeft: (0.75 + (level??0) * 0.75) + 'rem'
      }"
    >
      <div class="left">
        <span class="name">{{ item.name }}</span>
      </div>
      <div class="arrow">
        <ChevronRight class="icon" />
      </div>
    </a>

    <!-- Div per le cartelle -->
    <div 
      v-else
      :class="[
        'menu-item-base',
        'submenu-item',
        containsPath(item, currentPath || '') ? 'is-active' : ''
      ]" 
      @click.stop="toggle"
      :style="{ 
        paddingLeft: (0.75 + (level??0) * 0.75) + 'rem'
      }"
    >
      <div class="left">
        <FolderOpen v-if="open" class="icon-open" />
        <Folder v-else class="icon" />
        <span :class="open ? 'selected-name' : 'name' ">{{ item.name }}</span>
      </div>
    </div>

    <!-- sotto-menu -->
    <MenuMaster
      v-if="hasChildren && open"
      :menuItems="item.menu || []"
      :level="(level??0) + 1"
      :currentPath="currentPath"
      @select="$emit('select', $event)"
    />
  </li>
</template>


<script setup lang="ts">
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import MenuMaster from './MenuMaster.vue'

interface MenuItem {
  name: string;
  isFolder: boolean;
  menu?: MenuItem[];
  link?: string;
  type?: string;
  index?: number;
}

const props = defineProps<{
  item: MenuItem;
  level?: number;
  currentPath?: string;
}>()

const emit = defineEmits(['select'])

/**
 * Funzione ricorsiva per verificare se questa cartella contiene il path corrente.
 * Usata per espandere automaticamente i rami attivi.
 */
function containsPath(node: MenuItem, path: string): boolean {
  if (node.link && (path === node.link || path.startsWith(node.link + '/'))) return true
  if (node.menu) {
    return node.menu.some(child => containsPath(child, path))
  }
  return false
}

const open = ref(containsPath(props.item, props.currentPath || ''))

const hasChildren = computed(() => {
  return props.item.isFolder === true && props.item.menu && props.item.menu.length > 0
})

const toggle = () => {
  if (hasChildren.value) {
    open.value = !open.value
  }
  emit('select', props.item)
}

// calcola il colore in base al livello
const background = computed(() => {
  // luminosità base 20%, aumenta di 8% per livello
  const lightness = Math.min(20 + (props.level??0) * 8, 90)
  return `hsl(0, 0%, ${lightness}%)`
})
</script>

<style scoped>
li {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Base item style */
.menu-item-base {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.75rem 1rem;
  user-select: none;
  position: relative;
  border-left: 3px solid transparent;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.menu-item {
  font-family: 'New Tegomin', serif;
  color: #94a3b8; /* Slate 400 */
  font-size: 0.95rem;
}

.submenu-item {
  font-family: 'Fredericka the Great', cursive;
  color: #f8fafc; /* Slate 50 */
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

/* Hover effects */
.menu-item-base:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #fff;
}

/* Selected state for leaf items (Green) */
.menu-item.is-active {
  background-color: rgba(207, 255, 4, 0.08);
  color: #cfff04;
  border-left-color: #cfff04;
}
.menu-item.is-active .selected-name {
  color: #cfff04;
}

/* Selected state for folders (Blue) */
.submenu-item.is-active {
  background-color: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  border-left-color: #3b82f6;
}
.submenu-item.is-active .selected-name {
  color: #3b82f6;
}

.selected-name {
  font-weight: bold;
}

/* Iconography */
.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.icon {
  color: #64748b;
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.icon-open {
  color: #3b82f6; /* Brilliant Blue */
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.arrow {
  display: flex;
  align-items: center;
  opacity: 0.5;
}

.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Adaptive logic for sidebar contrast */
:deep(.menu-list) {
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  margin-left: 1.5rem;
}
</style>
