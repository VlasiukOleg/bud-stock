<script setup lang="ts">
import { en, uk, ru } from "@nuxt/ui/locale";

const { locale, setLocale } = useI18n();

const supportedLocales = [uk, en, ru];

const onLocaleChange = (value: string) => {
  setLocale(value as "uk" | "en" | "ru");
};
</script>

<template>
  <ULocaleSelect
    :model-value="locale"
    :locales="supportedLocales"
    @update:model-value="onLocaleChange"
    leading
    size="sm"
  />
</template>
