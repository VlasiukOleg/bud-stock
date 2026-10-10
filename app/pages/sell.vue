<script setup lang="ts">
const { t } = useI18n();
useSeoMeta({
  title: t('createListing.step1.title', 'Створити оголошення')
});
</script>

<template>
  <CreateListing />
</template>
