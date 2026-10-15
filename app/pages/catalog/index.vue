<script setup lang="ts">
definePageMeta({
  ssr: false,
});
</script>

<template>
  <ClientOnly>
    <Catalog />
  </ClientOnly>
</template>

