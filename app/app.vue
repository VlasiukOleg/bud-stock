<script setup lang="ts">
// Імпортуємо ВСІ локалі Nuxt UI, щоб вони автоматично підставлялися
import * as locales from "@nuxt/ui/locale";

const { locale } = useI18n();

// Вибираємо потрібний об'єкт локалі для Nuxt UI залежно від вибраної мови
const currentUiLocale = computed(
  () => locales[locale.value as keyof typeof locales],
);

const toaster = {
  position: "top-right",
} as const;
</script>

<template>
  <UApp :locale="currentUiLocale" :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
