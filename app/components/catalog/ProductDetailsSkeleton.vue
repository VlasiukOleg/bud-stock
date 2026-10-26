<template>
  <div class="w-full space-y-4 sm:space-y-6">
    <!-- Кнопка назад -->
    <USkeleton class="h-8 w-24 rounded-lg" />

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Ліва колонка (Фото + Опис + Карта) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Галерея фото -->
        <UCard>
          <USkeleton class="aspect-4/3 w-full rounded-xl" />
          <div class="p-4 flex gap-2 overflow-x-hidden">
            <USkeleton v-for="i in 4" :key="i" class="shrink-0 w-20 h-20 rounded-lg" />
          </div>
        </UCard>

        <!-- Опис та характеристики -->
        <UCard>
          <div class="space-y-4">
            <USkeleton class="h-7 w-3/4 rounded-lg" />
            <div class="space-y-2 pt-2">
              <USkeleton class="h-4 w-full rounded" />
              <USkeleton class="h-4 w-5/6 rounded" />
              <USkeleton class="h-4 w-2/3 rounded" />
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div v-for="i in 4" :key="i" class="space-y-1.5">
                <USkeleton class="h-3 w-16 rounded" />
                <USkeleton class="h-4 w-24 rounded" />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Локація на десктопі -->
        <UCard class="hidden lg:block">
          <div class="space-y-3">
            <USkeleton class="h-5 w-40 rounded" />
            <USkeleton class="h-48 w-full rounded-xl" />
          </div>
        </UCard>
      </div>

      <!-- Права колонка (Ціна + Продавець + Кнопки) -->
      <div class="space-y-4">
        <!-- Картка ціни -->
        <UCard shadow="md">
          <div class="space-y-3">
            <USkeleton class="h-9 w-36 rounded-lg" />
            <USkeleton class="h-5 w-24 rounded-md" />
          </div>
        </UCard>

        <!-- Картка продавця -->
        <UCard>
          <USkeleton class="h-3 w-20 rounded mb-4" />
          <div class="flex items-center gap-3 mb-2">
            <USkeleton class="w-12 h-12 rounded-full shrink-0" />
            <div class="space-y-1.5 flex-1">
              <USkeleton class="h-4 w-32 rounded" />
              <USkeleton class="h-3 w-20 rounded" />
            </div>
          </div>
        </UCard>

        <!-- Картка кнопок дій -->
        <UCard>
          <div class="space-y-3">
            <USkeleton class="h-11 w-full rounded-xl" />
            <USkeleton class="h-11 w-full rounded-xl" />
          </div>
        </UCard>

        <!-- Локація на мобілці -->
        <UCard class="lg:hidden">
          <div class="space-y-3">
            <USkeleton class="h-5 w-36 rounded" />
            <USkeleton class="h-44 w-full rounded-xl" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
