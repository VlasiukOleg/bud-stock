<template>
  <USelectMenu
    :model-value="locale"
    :items="supportedLocales"
    value-key="code"
    label-key="code"
    size="sm"
    variant="ghost"
    :avatar="currentAvatar"
    class="w-auto"
    @update:model-value="onLocaleChange"
  >
  </USelectMenu>
</template>

<script setup lang="ts">
import { en, uk, ru } from "@nuxt/ui/locale";

const { locale, setLocale } = useI18n();

const flagUrls: Record<string, string> = {
  uk: "https://flagcdn.com/w80/ua.png",
  en: "https://flagcdn.com/w80/gb.png",
  ru: "https://api.iconify.design/heroicons:globe-alt-20-solid.svg?color=%23888888",
};

const supportedLocales = [
  { ...uk, avatar: { src: flagUrls.uk } },
  { ...en, avatar: { src: flagUrls.en } },
  { ...ru, avatar: { src: flagUrls.ru } },
];

const onLocaleChange = (value: string) => {
  setLocale(value as "uk" | "en" | "ru");
};

// 4. Поточний аватар для вибраної мови (на кнопці)
const currentAvatar = computed(() => ({
  src: flagUrls[locale.value],
  loading: "lazy" as const,
}));
</script>
