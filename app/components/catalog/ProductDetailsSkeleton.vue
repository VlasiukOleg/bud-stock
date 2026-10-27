<template>
  <div class="w-full max-w-full space-y-4 sm:space-y-6 min-w-0">
    <!-- Кнопка назад -->
    <USkeleton class="h-8 w-24 rounded-lg" />

    <div class="grid lg:grid-cols-3 gap-6 min-w-0">
      <!-- Ліва колонка (Фото + Опис + Карта) -->
      <div class="lg:col-span-2 space-y-6 min-w-0">
        <!-- Галерея фото -->
        <UCard class="min-w-0 overflow-hidden">
          <USkeleton class="aspect-4/3 w-full rounded-xl" />
          <div class="pt-3 sm:pt-4 flex gap-2 overflow-x-auto scrollbar-hide min-w-0 max-w-full">
            <USkeleton v-for="i in 4" :key="i" class="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg" />
          </div>
        </UCard>

        <!-- Опис та характеристики -->
        <UCard class="min-w-0">
          <div class="space-y-4 min-w-0">
            <USkeleton class="h-7 w-3/4 rounded-lg" />
            <div class="space-y-2 pt-2">
              <USkeleton class="h-4 w-full rounded" />
              <USkeleton class="h-4 w-5/6 rounded" />
              <USkeleton class="h-4 w-2/3 rounded" />
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 min-w-0">
              <div v-for="i in 4" :key="i" class="space-y-1.5 min-w-0">
                <USkeleton class="h-3 w-16 rounded" />
                <USkeleton class="h-4 w-24 max-w-full rounded" />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Локація на десктопі -->
        <UCard class="hidden lg:block min-w-0">
          <div class="space-y-3 min-w-0">
            <USkeleton class="h-5 w-40 rounded" />
            <USkeleton class="h-48 w-full rounded-xl" />
          </div>
        </UCard>
      </div>

      <!-- Права колонка (Ціна + Продавець + Кнопки) -->
      <div class="space-y-4 min-w-0">
        <!-- Картка ціни -->
        <UCard shadow="md" class="min-w-0">
          <div class="space-y-3 min-w-0">
            <USkeleton class="h-9 w-36 rounded-lg" />
            <USkeleton class="h-5 w-24 rounded-md" />
          </div>
        </UCard>

        <!-- Картка продавця -->
        <UCard class="min-w-0">
          <USkeleton class="h-3 w-20 rounded mb-4" />
          <div class="flex items-center gap-3 mb-2 min-w-0">
            <USkeleton class="w-12 h-12 rounded-full shrink-0" />
            <div class="space-y-1.5 flex-1 min-w-0">
              <USkeleton class="h-4 w-32 max-w-full rounded" />
              <USkeleton class="h-3 w-20 rounded" />
            </div>
          </div>
        </UCard>

        <!-- Картка кнопок дій -->
        <UCard class="min-w-0">
          <div class="space-y-3 min-w-0">
            <USkeleton class="h-11 w-full rounded-xl" />
            <USkeleton class="h-11 w-full rounded-xl" />
          </div>
        </UCard>

        <!-- Локація на мобілці -->
        <UCard class="lg:hidden min-w-0">
          <div class="space-y-3 min-w-0">
            <USkeleton class="h-5 w-36 max-w-full rounded" />
            <USkeleton class="h-44 w-full rounded-xl" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
