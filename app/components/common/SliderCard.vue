<template>
  <div
    class="relative h-full w-full p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-center items-center text-center gap-2 group hover:border-brand-500 transition-all duration-300"
  >
    <div class="absolute top-3 left-3 flex items-center gap-1.5">
      <span
        class="text-[10px] font-black text-brand-500/30 uppercase tracking-widest group-hover:text-brand-500 transition-colors"
        >Крок</span
      >
      <span
        class="text-lg font-black leading-none text-neutral-200 dark:text-neutral-700 group-hover:text-brand-500/50 transition-colors"
      >
        {{ item.id }}
      </span>
    </div>

    <UIcon
      :name="item.icon"
      class="w-10 h-10 text-brand-500 mb-2 transition-transform group-hover:scale-110"
    />
    <div
      class="font-bold text-sm lg:text-base text-neutral-900 dark:text-white"
    >
      {{ $t(item.title) }}
    </div>
    <div
      class="text-xs text-neutral-500 dark:text-neutral-400 leading-tight line-clamp-2"
    >
      {{ $t(item.desc) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SliderItem } from "~/types/index";

defineProps<{
  item: SliderItem;
}>();
</script>

<style></style>
