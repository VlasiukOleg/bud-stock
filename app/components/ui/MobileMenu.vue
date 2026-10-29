<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-[99] grid grid-cols-5 items-center h-16 lg:hidden pb-safe"
  >
    <CommonMobileMenuLinkItem
      v-for="item in MOBILE_MENU_LIST"
      :key="item.to"
      :to="getItemTo(item)"
      :icon-name="getItemIcon(item)"
      :link-label="getItemLabel(item)"
      :is-active="isItemActive(item.to)"
      @click.capture="handleItemClick($event, item)"
      class="relative"
    >
      <template #icon v-if="item.to === APP_ROUTES.PROFILE.ROOT && user">
        <CommonUserAvatar
          :src="getUserAvatarUrl(user)"
          :name="user.user_metadata?.full_name"
          :email="user.email"
          size="sm"
          class="mb-1 transition-all"
          :uiClass="{ 'ring-2 ring-brand-500': isItemActive(item.to) }"
        />
      </template>
      
      <!-- Бейдж для непрочитаних повідомлень -->
      <template #icon v-else-if="item.to === APP_ROUTES.PROFILE.CHATS">
        <div class="relative flex items-center justify-center w-6 h-6 mb-1">
          <UIcon :name="item.iconName" class="w-6 h-6" />
          <span 
            v-if="user && unreadCount > 0"
            class="absolute -top-0.5 -right-0.5 flex items-center justify-center w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-gray-900"
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
import { APP_ROUTES } from '~/utils/routes';

const { unreadCount } = useChat();
const user = useSupabaseUser()
const isSlideoverOpen = useState('isSlideoverOpen', () => false)
const route = useRoute()

const getItemLabel = (item: MobileMenuItem) => {
  if (item.to === APP_ROUTES.PROFILE.ROOT && !user.value) {
    return 'mobileMenu.list.login'
  }
  return item.linkLabel
}

const getItemTo = (item: MobileMenuItem) => {
  if (item.to === APP_ROUTES.PROFILE.ROOT && !user.value) {
    return APP_ROUTES.AUTH.LOGIN
  }
  return item.to
}

const getItemIcon = (item: MobileMenuItem) => {
  if (item.to === APP_ROUTES.PROFILE.ROOT && !user.value) {
    return 'i-heroicons-arrow-right-end-on-rectangle'
  }
  return item.iconName
}

const isItemActive = (itemTo: string) => {
  if (itemTo === APP_ROUTES.HOME) {
    return route.path === APP_ROUTES.HOME
  }
  if (itemTo === APP_ROUTES.PROFILE.ROOT) {
    if (!user.value) {
      return route.path.startsWith(APP_ROUTES.AUTH.LOGIN)
    }
    return route.path.startsWith(APP_ROUTES.PROFILE.ROOT) && !route.path.startsWith(APP_ROUTES.PROFILE.CHATS)
  }
  return route.path.startsWith(itemTo)
}

const handleItemClick = (e: MouseEvent, item: MobileMenuItem) => {
  if (item.to === APP_ROUTES.PROFILE.ROOT) {
    if (user.value) {
      e.preventDefault()
      e.stopPropagation()
      isSlideoverOpen.value = true
    } else {
      e.preventDefault()
      e.stopPropagation()
      navigateTo(APP_ROUTES.AUTH.LOGIN)
    }
  } else if (item.to === APP_ROUTES.PROFILE.CHATS && !user.value) {
    e.preventDefault()
    e.stopPropagation()
    navigateTo(APP_ROUTES.AUTH.LOGIN)
  }
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(64px + env(safe-area-inset-bottom));
}
</style>
