<!-- app/components/UI/MenuMaster.vue -->
 
<template>
  <ul class="menu-list">
    <MenuItem
      v-for="(item, index) in menuItems"
      :key="index"
      :item="item"
      :level="level"
      :currentPath="currentPath"
      @select="$emit('select', $event)"
    />
  </ul>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import MenuItem from './MenuItem.vue'

defineProps({
  menuItems: {
    type: Array as PropType<Record<string, any>[]>,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  currentPath: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* Lista del menu */
.menu-list {
  padding-left: 0; /* equivalente a pl-4 */
  margin: 0;            /* rimuove eventuali margini di default */
  padding: 0;
}
ul {
  height: 100%;
  overflow: auto;
  margin: 0;
  padding: 0;
}
</style>
