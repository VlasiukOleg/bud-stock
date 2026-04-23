<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Продати матеріал",
    to: "/sell",
    icon: "i-streamline-emojis:money-bag",
    active: route.path.startsWith("/sell"),
  },
  {
    label: "Купити матеріал",
    to: "/catalog",
    icon: "i-streamline-ultimate-color:e-commerce-touch-buy",
    active: route.path.startsWith("/catalog"),
  },
]);
</script>

<template>
  <UHeader>
    <template #left>
      <CommonLogo />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <CommonLocaleSelect />
      <UColorModeButton />
      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nuxt/ui"
          target="_blank"
          icon="i-icon-park-solid:people"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
