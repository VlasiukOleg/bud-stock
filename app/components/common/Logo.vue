<template>
  <NuxtLink to="/" class="flex items-center gap-2 group">
    <div
      class="bg-[#f54a00]/10 p-2 rounded-lg flex items-center justify-center group-hover:bg-[#f54a00]/20 transition-colors"
    >
      <UIcon name="i-mdi:wall" class="w-5 h-5 text-[#f54a00]" />
    </div>

    <div class="flex flex-col justify-center">
      <span class="text-black dark:text-white text-2xl font-bold leading-none">
        Bud<span class="text-[#f54a00]">Stock</span>
      </span>
      <div
        class="text-[9px] text-gray-500 leading-none font-medium uppercase tracking-wider mt-1"
      >
        {{ $t("logo.subtitle") }}
      </div>
    </div>
  </NuxtLink>
</template>
