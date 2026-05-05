<!-- app/components/UI/ActionButton.vue -->
 
<template>
  <div :class="['action-button', 'popover-container', customClass]">
    <!-- Bottone principale -->
    <button
      class="btn-small"
      :disabled="disabled"
      @click.stop="togglePopover"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot name="icon" />
    </button>

    <!-- Contenuto Popover (Dropdown semplificato) -->
    <div 
      v-if="hasPopover && isOpen" 
      :class="hasOnlyImage ? 'right-menu-only-image' : 'right-menu'"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <ul v-if="!disabled">
        <h3>{{ titleList }}</h3>
        <li
          v-for="(item, index) in items"
          :key="index"
          class="right-menu-item"
          @click="select(item)"
        >
          <div class="item-content">
            <img v-if="item.imge" :src="item.imge" :class="hasOnlyImage ? 'link-full-imge' : 'link-imge'" />
            <span v-if="!hasOnlyImage">{{ item.name }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  titleList?: string
  items?: any[]
  onSelect?: (item: any) => void
  onClick?: () => void
  disabled?: boolean
  customClass?: string
}>()

const isOpen = ref(false)
let closeTimer: any = null

const hasPopover = computed(() => props.items && props.items.length > 0)
const hasOnlyImage = computed(() => {
  return props.items?.every(item => item.imge && Object.keys(item).length === 1) ?? false
})

const togglePopover = () => {
  if (props.disabled) return
  if (!hasPopover.value) {
    props.onClick?.()
    return
  }
  isOpen.value = !isOpen.value
}

const handleMouseEnter = () => {
  if (props.disabled || !hasPopover.value) return
  clearTimeout(closeTimer)
  isOpen.value = true
}

const handleMouseLeave = () => {
  closeTimer = setTimeout(() => {
    isOpen.value = false
  }, 300)
}

const select = (item: any) => {
  if (props.disabled) return
  isOpen.value = false
  props.onSelect?.(item)
}
</script>

<style scoped>
h3 {
  margin: 0;
  text-align: center;
  color: #0a6ed1;
}

.action-button {
  display: inline-block;
  position: relative;
}

/* Pulsanti piccoli */
.btn-small {
  padding: 0.25rem;
  border-radius: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}
.btn-small:hover {
  background-color: #e2e8f0;
}
.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f2f2f2;
}

/* Icone */
.icon-small {
  width: 1.25rem;
  height: 1.25rem;
  color: #374151;
}

.popover {
  position: relative;
  z-index: 100000;
}

.right-menu {
  position: absolute;
  left: -6rem;
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  background-color: #fff;
  color: #333;
  font-family: Julee, cursive;
  border: 1px solid #4040403c;
  border-radius: 0.35rem;
  height: 21rem;
  width: 17rem;
  box-shadow: 20px 20px 50px grey;
  overflow-y: auto;
}
.right-menu-only-image {
  position: absolute;
  left: -85rem;
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  background-color: #fff;
  color: #333;
  font-family: Julee, cursive;
  border: 1px solid #4040403c;
  border-radius: 0.35rem;
  height: 42rem;
  width: 60rem;
  box-shadow: 20px 20px 50px grey;
  overflow-y: auto;
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

.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-imge {
  width: 4rem;
  height: auto;
}

.link-full-imge {
  width: 55rem;
  height: auto;
}
</style>
