<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-9999 flex justify-around items-center h-16 lg:hidden pb-safe"
  >
    <CommonMobileMenuLinkItem
      v-for="item in MOBILE_MENU_LIST"
      :to="item.to"
      :icon-name="item.iconName"
      :link-label="item.linkLabel"
    />
  </nav>
</template>

<script setup lang="ts">
import { MOBILE_MENU_LIST } from "~/constants/mobileMenu/mobileMenuList";
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(64px + env(safe-area-inset-bottom));
}
</style>
