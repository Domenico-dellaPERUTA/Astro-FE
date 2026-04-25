<!-- app/components/UI/MenuItem.vue -->
<template>
  <li v-if="item.name">
    <div 
      :class="hasChildren ? 'submenu-item' : 'menu-item' " 
      @click.stop="toggle"
      :style="{ 
        paddingLeft: (0.5 + (level??0) * 0.25) + 'rem', 
        backgroundColor: hasChildren ? background : '#f7fafc' 
      }"
    >
      <!-- sinistra: cartella + nome -->
      <div class="left">
        <template v-if="item.isFolder">
          <FolderOpen v-if="open" class="icon-open" />
          <Folder v-else class="icon" />
        </template>
        <span :class="open ? 'selected-name' : 'name' ">{{ item.name }}</span>
      </div>

      <!-- destra: freccia -->
      <div v-if="!item.isFolder" class="arrow">
        <ChevronRight class="icon-open" />
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

.menu-item {
  display: flex;
  align-items: center;
  font-family: 'New Tegomin';
  justify-content: space-between;
  cursor: pointer;
  padding: 0.25rem;
  border-style:solid;
  border-width:0.25px;
  border-color: rgba(89, 183, 255, 0.721);
  transition: background-color 0.2s;
  color: rgba(89, 183, 255, 1);
  font-size: 1rem;
  font-weight: lighter;
  height: 2rem;
}

.menu-item:hover, .submenu-item:hover{
  display: flex;
  border-color: rgba(255, 205, 89, 0.721);
  color: rgba(255, 205, 89, 1);

}

.submenu-item {
  display: flex;
  align-items: center;
  font-family: 'Fredericka the Great';
  justify-content: space-between;
  cursor: pointer;
  padding: 0.25rem;
  border-style:solid;
  border-width:0.25px;
  border-color: rgba(255, 255, 255, 0.721);
  transition: background-color 0.2s;
  color: rgba(255, 255, 255, 0.721);
  font-size: 1.25rem;
  font-weight: lighter;
  height: 2rem;
}

.menu-item:hover {
  background-color: #4b5563; /* grigio hover */
}

.left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  color: rgba(255, 255, 255, 0.721);
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}
.icon-open {
  color: rgba(89, 183, 255, 0.721);
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.name {
  white-space: nowrap;
}
.selected-name {
  white-space: nowrap;
  font-weight: bold;
  color: rgba(89, 183, 255, 1);
}
</style>
