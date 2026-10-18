<template>
  <NuxtLink :to="APP_ROUTES.HOME" class="flex items-center gap-2 group font-public">
    <div
      class="bg-brand-500/10 p-1.5 md:p-2 rounded-lg flex items-center justify-center group-hover:bg-brand-500/20 transition-colors shrink-0"
    >
      <UIcon name="i-mdi:wall" class="w-4 h-4 md:w-5 md:h-5 text-brand-500" />
    </div>

    <div class="flex flex-col justify-center">
      <span
        class="text-black dark:text-white text-lg md:text-2xl font-bold leading-none"
      >
        BudStock
      </span>
      <div
        class="text-[7.5px] md:text-[9px] text-gray-500 leading-none font-medium uppercase tracking-wider mt-0.5 md:mt-1"
      >
        {{ $t("logo.subtitle") }}
      </div>
    </div>
  </NuxtLink>
</template>
