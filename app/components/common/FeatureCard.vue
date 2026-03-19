<script setup lang="ts">
import type { FeatureItem } from "~/types/index";

defineProps<{
  feature: FeatureItem;
}>();
</script>

<template>
  <div
    class="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-6 text-center hover:shadow-md transition-all border border-neutral-300 hover:border-neutral-500 dark:hover:border-neutral-800 group"
  >
    <div
      :class="feature.colorClass"
      class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-transform group-hover:scale-110"
    >
      <UIcon :name="feature.icon" class="w-8 h-8" />
    </div>
    <h4 class="font-bold text-gray-900 dark:text-white mb-2">
      {{ $t(feature.title) }}
    </h4>
    <p class="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
      {{ $t(feature.desc) }}
    </p>
  </div>
</template>
