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
      @click.capture="handleItemClick($event, item)"
    >
      <template #icon v-if="item.to === '/profile' && user">
        <UAvatar
          :src="user.user_metadata?.avatar_url"
          :text="!user.user_metadata?.avatar_url ? userInitials : undefined"
          :alt="userInitials"
          size="sm"
          class="mb-1"
        />
      </template>
    </CommonMobileMenuLinkItem>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MOBILE_MENU_LIST } from "~/constants/mobileMenu/mobileMenuList";
import type { MobileMenuItem } from "~/types";

const user = useSupabaseUser()
const isSlideoverOpen = useState('isSlideoverOpen', () => false)

const userInitials = computed(() => {
  if (!user.value) return '';
  const name = user.value.user_metadata?.full_name;
  if (name) return name.substring(0, 2).toUpperCase();
  const email = user.value.email;
  if (email) return email.substring(0, 2).toUpperCase();
  return 'U';
})

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
