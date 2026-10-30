<template>
  <NuxtLink :to="APP_ROUTES.HOME" class="flex items-center gap-2 font-public">
    <img
      src="/logo.png"
      alt="BudStock Logo"
      class="w-8 h-8 md:w-10 md:h-10 object-contain shrink-0"
    />

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
