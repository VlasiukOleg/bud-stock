<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items: NavigationMenuItem[] = [
  {
    label: "Політика конфіденційності",
    to: "/",
    target: "_blank",
  },
];
</script>

<template>
  <UFooter
    :ui="{
      root: 'border-t border-gray-200 dark:border-gray-500 bg-beige dark:bg-gray-900',
      bottom: 'sm: py-4',
    }"
  >
    <template #left>
      <p class="text-muted text-sm">
        Copyright © {{ new Date().getFullYear() }}
      </p>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UButton
        icon="i-simple-icons-discord"
        color="neutral"
        variant="ghost"
        to="https://go.nuxt.com/discord"
        target="_blank"
        aria-label="Discord"
      />
      <UButton
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
        to="https://go.nuxt.com/x"
        target="_blank"
        aria-label="X"
      />
      <UButton
        icon="i-simple-icons-facebook"
        color="neutral"
        variant="ghost"
        to="https://github.com/nuxt/nuxt"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>
