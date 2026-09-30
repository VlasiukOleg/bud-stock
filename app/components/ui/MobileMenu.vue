<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-[99] flex justify-around items-center h-16 lg:hidden pb-safe"
  >
    <CommonMobileMenuLinkItem
      v-for="item in MOBILE_MENU_LIST"
      :key="item.to"
      :to="item.to"
      :icon-name="item.iconName"
      :link-label="item.linkLabel"
      :is-active="isItemActive(item.to)"
      @click.capture="handleItemClick($event, item)"
      class="relative"
    >
      <template #icon v-if="item.to === '/profile' && user">
        <CommonUserAvatar
          :src="user.user_metadata?.avatar_url"
          :name="user.user_metadata?.full_name"
          :email="user.email"
          size="sm"
          class="mb-1 transition-all"
          :uiClass="{ 'ring-2 ring-brand-500': isItemActive(item.to) }"
        />
      </template>
      
      <!-- Бейдж для непрочитаних повідомлень -->
      <template #icon v-else-if="item.iconName === 'i-heroicons-envelope'">
        <div class="relative">
          <UIcon :name="item.iconName" class="w-6 h-6 mb-1" />
          <span 
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 flex items-center justify-center w-3 h-3 bg-red-500 rounded-full border border-white dark:border-gray-900"
          ></span>
        </div>
      </template>
    </CommonMobileMenuLinkItem>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MOBILE_MENU_LIST } from "~/constants/mobileMenu/mobileMenuList";
import type { MobileMenuItem } from "~/types";
import { useRoute } from 'vue-router';
import { useChat } from '~/composables/useChat';

const { unreadCount } = useChat();
const user = useSupabaseUser()
const isSlideoverOpen = useState('isSlideoverOpen', () => false)
const route = useRoute()

const isItemActive = (itemTo: string) => {
  if (itemTo === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(itemTo)
}

const handleItemClick = (e: MouseEvent, item: MobileMenuItem) => {
  if (item.to === '/profile' && user.value) {
    e.preventDefault()
    e.stopPropagation()
    isSlideoverOpen.value = true
  }
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(64px + env(safe-area-inset-bottom));
}
</style>
