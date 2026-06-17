<template>
  <UFormField
    :label="label"
    :name="name"
    eagerValidation
    class=""
    :ui="{
      error: 'mt-1 text-xs',
    }"
  >
    <slot />
  </UFormField>
</template>
<script setup lang="ts">
defineProps<{
  label: string;
  name: string;
}>();
</script>
<style></style>
