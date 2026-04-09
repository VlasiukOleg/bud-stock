<template>
  <NuxtLink
    :to="to"
    class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-brand-500"
    active-class="text-brand-500!"
  >
    <UIcon :name="iconName" class="w-6 h-6 mb-1" />
    <span class="text-[10px] font-medium">{{ $t(linkLabel) }}</span>
  </NuxtLink>
</template>
<script setup lang="ts">
defineProps<{
  to: string;
  iconName: string;
  linkLabel: string;
}>();
</script>
<style></style>
