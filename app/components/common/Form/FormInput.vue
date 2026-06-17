<template>
  <UInput v-model="model" class="text-5xl" color="brand" />
</template>
<script setup lang="ts">
const model = defineModel<string | number>();
</script>
<style></style>
