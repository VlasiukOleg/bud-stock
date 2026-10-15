<script setup lang="ts">
withDefaults(
  defineProps<{
    show: boolean;
    text?: string;
    icon?: string;
  }>(),
  {
    text: "",
    icon: "i-heroicons-arrow-path",
  }
);
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="show"
      class="absolute inset-0 z-2000 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 select-none pointer-events-auto"
    >
      <div
        class="flex flex-col items-center justify-center bg-white/95 dark:bg-neutral-800/95 px-6 py-4 rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-700/80 backdrop-blur-md max-w-xs transition-transform transform"
      >
        <UIcon
          :name="icon"
          class="w-8 h-8 animate-spin text-primary-500 mb-2"
        />
        <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-100 text-center">
          {{ text }}
        </p>
      </div>
    </div>
  </Transition>
</template>
