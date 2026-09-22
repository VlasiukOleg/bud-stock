<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const user = useSupabaseUser()

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

const buttonLink = computed(() => {
  if (user.value) {
    return '/profile'
  }
  return '/login'
})

const buttonText = computed(() => {
  if (user.value) {
    return 'Профіль'
  }
  return 'Вхід'
})
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
      <UTooltip :text="buttonText">
        <UButton
          color="neutral"
          variant="ghost"
          :to="buttonLink"
          icon="i-icon-park-solid:people"
          aria-label="Вхід"
        />
      </UTooltip>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
