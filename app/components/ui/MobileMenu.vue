<template>
  <nav class="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-9999 flex justify-around items-center h-16 lg:hidden pb-safe">
    <NuxtLink 
      to="/" 
      class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-brand-500"
      active-class="text-brand-500"
    >
      <UIcon name="i-heroicons-home" class="w-6 h-6 mb-1" />
      <span class="text-[10px] font-medium">Головна</span>
    </NuxtLink>

    <NuxtLink 
      to="/catalog" 
      class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-brand-500"
      active-class="text-brand-500"
    >
      <UIcon name="i-heroicons-magnifying-glass-circle" class="w-6 h-6 mb-1" />
      <span class="text-[10px] font-medium">Купити</span>
    </NuxtLink>

    <NuxtLink 
      to="/sell" 
      class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-brand-500"
      active-class="text-brand-500"
    >
      <UIcon name="i-heroicons-plus-circle" class="w-6 h-6 mb-1" />
      <span class="text-[10px] font-medium">Продати</span>
    </NuxtLink>

    <NuxtLink 
      to="/profile" 
      class="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-brand-500"
      active-class="text-brand-500"
    >
      <UIcon name="i-heroicons-user" class="w-6 h-6 mb-1" />
      <span class="text-[10px] font-medium">Профіль</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
/* Додаємо підтримку безпечних зон для iPhone (щоб смужка не перекривала меню) */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(64px + env(safe-area-inset-bottom));
}
</style>