<template>
  <div
    class="relative h-full w-full p-3.5 sm:p-5 lg:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-center items-center text-center gap-1.5 sm:gap-2 group hover:border-brand-500 transition-all duration-300 select-none"
  >
    <div class="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-1.5">
      <span
        class="text-[9px] sm:text-[10px] font-black text-brand-500/30 uppercase tracking-widest group-hover:text-brand-500 transition-colors"
        >Крок</span
      >
      <span
        class="text-base sm:text-lg font-black leading-none text-neutral-200 dark:text-neutral-700 group-hover:text-brand-500/50 transition-colors"
      >
        {{ item.id }}
      </span>
    </div>

    <UIcon
      :name="item.icon"
      class="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-brand-500 mb-1 sm:mb-2 transition-transform group-hover:scale-110 shrink-0"
    />
    <div
      class="font-bold text-xs sm:text-sm lg:text-base text-neutral-900 dark:text-white leading-snug"
    >
      {{ $t(item.title) }}
    </div>
    <div
      class="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 leading-snug line-clamp-3 sm:line-clamp-2"
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
