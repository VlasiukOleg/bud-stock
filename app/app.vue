<script setup lang="ts">
// Імпортуємо ВСІ локалі Nuxt UI, щоб вони автоматично підставлялися
import * as locales from "@nuxt/ui/locale";

const { locale, setLocale } = useI18n();

// Якщо користувач раніше особисто обрав мову в перемикачі, застосовуємо її
const savedLocale = useCookie<string | null>('user_selected_locale', { default: () => null });
if (savedLocale.value && ['uk', 'en', 'ru'].includes(savedLocale.value) && savedLocale.value !== locale.value) {
  setLocale(savedLocale.value as any);
}

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
