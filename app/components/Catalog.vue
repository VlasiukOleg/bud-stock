<template>
  <div
    class="flex flex-col h-[calc(100dvh-var(--ui-header-height))] pb-16 md:pb-0 overflow-hidden relative"
  >
    <header
      class="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-20"
    >
      <div class="w-full flex flex-col md:flex-row gap-4 items-stretch md:items-end justify-start">
        <div class="w-full md:w-auto flex items-center gap-2 shrink-0">
          <!-- Кнопка-тригер єдиної шторки «Пошук та фільтри» -->
          <div class="flex-1 md:flex-initial md:w-72 lg:w-80 min-w-0">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-magnifying-glass"
              class="w-full justify-between text-left h-10 shadow-xs px-3 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-brand-500 transition-colors"
              @click="() => { isSearchFiltersOpen = true }"
            >
              <div class="flex items-center gap-2 min-w-0 truncate">
                <span v-if="searchQuery" class="truncate font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm">
                  «{{ searchQuery }}»
                </span>
                <span v-else class="truncate text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm font-medium">
                  Пошук та фільтри
                </span>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <UBadge
                  v-if="activeFilterCount > 0"
                  size="xs"
                  color="primary"
                  class="rounded-full px-1.5 py-0.5 font-bold"
                >
                  {{ activeFilterCount }}
                </UBadge>
                <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-neutral-400" />
              </div>
            </UButton>
          </div>

          <!-- Dev перемикач: Тестова таблиця mock_listings (5k) vs Жива таблиця listings -->
          <UButton
            size="xs"
            :color="useMockTable ? 'warning' : 'neutral'"
            :variant="useMockTable ? 'solid' : 'outline'"
            icon="i-heroicons-circle-stack"
            class="shrink-0 whitespace-nowrap h-10 text-xs"
            :title="useMockTable ? 'Активна тестова таблиця mock_listings (15 000 товарів). Натисніть для переходу на живу базу.' : 'Активна робоча таблиця listings (оголошення друзів). Натисніть для переходу на тестову базу 15 000 товарів.'"
            @click="() => { useMockTable = !useMockTable }"
          >
            <span class="hidden sm:inline">{{ useMockTable ? 'Тест (15k)' : 'Жива база' }}</span>
            <span class="sm:hidden">{{ useMockTable ? '15k' : 'Live' }}</span>
          </UButton>
        </div>

        <div class="w-full md:w-64 space-y-1">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-neutral-500">{{ $t('catalog.searchRadius') }}</span>
            <UBadge
              size="md"
              class="!bg-brand-100 !text-neutral-800"
              variant="soft"
            >{{ searchRadiusKm }} {{ $t('catalog.km') }}</UBadge>
          </div>
          <USlider
            v-model="searchRadius"
            :min="1000"
            :max="50000"
            :step="1000"
            size="md"
            :ui="{
              range: '!bg-brand-400',
              thumb: '!ring-brand-400 focus-visible:!outline-brand-400/50',
            }"
          />
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <aside
        class="hidden lg:block w-100 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 scroll-smooth"
      >
        <!-- Активний фільтр категорії (десктоп) -->
        <div
          v-if="activeCategoryInfo"
          class="flex items-start gap-2 mb-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 p-2.5 px-3 rounded-xl"
        >
          <UIcon :name="activeCategoryInfo.icon" class="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <span class="text-xs font-semibold text-brand-900 dark:text-brand-100 flex-1 wrap-break-word leading-snug">
            {{ activeCategoryInfo.name }}
          </span>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            class="hover:bg-brand-200/50 dark:hover:bg-brand-900/50 shrink-0 -my-1 -mr-1"
            @click="updateCategoryFilter('')"
          />
        </div>

        <!-- Активний пошуковий запит (десктоп) -->
        <div
          v-if="searchQuery"
          class="flex items-center gap-2 mb-3 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 p-2 px-3 rounded-xl min-w-0"
        >
          <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-brand-600 shrink-0" />
          <span class="text-xs text-neutral-700 dark:text-neutral-300 flex-1 truncate min-w-0">
            Пошук: <strong>«{{ searchQuery }}»</strong>
          </span>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            class="hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 shrink-0 -my-1 -mr-1"
            @click="() => { searchQuery = '' }"
          />
        </div>

        <!-- Стан 1: Визначення геопозиції користувача (USkeleton) -->
        <div v-if="isLocating" class="space-y-4">
          <div class="flex items-center gap-2 px-1 text-xs text-neutral-500 font-medium">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-brand-500 animate-bounce" />
            <span>{{ $t('catalog.locating', 'Визначаємо вашу локацію...') }}</span>
          </div>

          <div
            v-for="i in 3"
            :key="i"
            class="flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 p-3 space-y-3"
          >
            <USkeleton class="aspect-4/3 w-full rounded-lg" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-3/4 rounded" />
              <USkeleton class="h-3 w-1/2 rounded" />
              <div class="flex items-center justify-between pt-2">
                <USkeleton class="h-5 w-20 rounded" />
                <USkeleton class="h-3.5 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>

        <!-- Стан 2: Первинне завантаження коли карток ще немає в списку (USkeleton) -->
        <div v-else-if="isLoadingBackendListings && displayedProducts.length === 0" class="space-y-4">
          <div class="flex items-center gap-2 px-1 text-xs text-neutral-500 font-medium">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-brand-500 animate-spin" />
            <span>{{ $t('catalog.searchingListings', 'Пошук товарів у радіусі...') }}</span>
          </div>

          <div
            v-for="i in 3"
            :key="i"
            class="flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 p-3 space-y-3"
          >
            <USkeleton class="aspect-4/3 w-full rounded-lg" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-3/4 rounded" />
              <USkeleton class="h-3 w-1/2 rounded" />
              <div class="flex items-center justify-between pt-2">
                <USkeleton class="h-5 w-20 rounded" />
                <USkeleton class="h-3.5 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>

        <!-- Стан 3: Товари є (Airbnb-style: зберігаємо попередні картки з soft-opacity під час оновлення) -->
        <div v-else-if="productsInRadius.length > 0" class="relative">
          <div class="flex items-center justify-between font-medium text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            <span>{{ $t('catalog.foundItems', { count: productsInRadius.length }) }}</span>
            <span
              v-if="isLoadingBackendListings"
              class="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-normal animate-pulse"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
              <span>Оновлюємо...</span>
            </span>
          </div>

          <div
            class="grid grid-cols-1 gap-4 transition-opacity duration-200"
            :class="{ 'opacity-50 pointer-events-none select-none': isLoadingBackendListings }"
          >
            <CommonProductCard
              v-for="product in displayedProducts"
              :key="product.id"
              :id="`product-${product.id}`"
              :product="product"
              :show-map-button="true"
              @map-click="handleZoomToProduct"
              :class="[
                'transition-all duration-300 rounded-xl scroll-mt-4',
                selectedProductOnMap === product.id
                  ? 'ring-2 ring-brand-500 shadow-lg'
                  : '',
              ]"
            />
            <UButton
              v-if="hasMoreProducts"
              color="primary"
              variant="soft"
              block
              size="lg"
              class="mt-2"
              :loading="isLoadingMoreCards"
              @click="loadMoreProducts"
            >
              {{ $t('catalog.showMoreItems', { count: Math.min(20, productsInRadius.length - cardListings.length), remaining: productsInRadius.length - cardListings.length }) }}
            </UButton>
          </div>
        </div>
        <div v-else class="text-center py-10 px-2">
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p class="font-medium text-neutral-700 dark:text-neutral-300 mb-1">{{ $t('catalog.noResults') }}</p>
          <p v-if="activeCategoryInfo" class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            У поточному радіусі немає залишків у категорії "{{ activeCategoryInfo.name }}"
          </p>
          <UButton
            v-if="activeCategoryInfo || selectedStatus !== 'all'"
            color="primary"
            variant="soft"
            size="sm"
            @click="resetAllFilters"
          >
            Скинути фільтри
          </UButton>
        </div>
      </aside>

      <main class="flex-1 relative z-10">
        <LMap
          :zoom="zoom"
          :center="center"
          :max-zoom="18"
          :use-global-leaflet="true"
          ref="map"
          @update:zoom="zoom = $event"
          @update:center="center = $event"
          @update:bounds="mapBounds = $event"
          @click="() => { selectedProductOnMap = null }"
          @ready="onMapReady"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LCircle
            v-if="initialUserLocation"
            :lat-lng="initialUserLocation"
            :radius="searchRadius"
            color="#3b82f6"
            :fill-opacity="0.1"
            :weight="2"
            dash-array="5, 10"
          />
          <LMarker
            v-if="initialUserLocation"
            :lat-lng="initialUserLocation"
            draggable
            :z-index-offset="2000"
            @update:latLng="handleDraggableMarker"
          >
            <LIcon
              :icon-size="[25, 25]"
              :icon-anchor="[20, 20]"
              class-name="bg-transparent border-none"
            >
              <div
                class="bg-blue-600 rounded-full size-8 flex items-center justify-center shadow-lg border-2 border-white"
              >
                <UIcon
                  name="i-heroicons-user-solid"
                  class="size-5 text-white"
                />
              </div>
            </LIcon>
            <LPopup>{{ $t('catalog.youAreHere') }}</LPopup>
          </LMarker>
        </LMap>

        <!-- Лоадер над картою тільки при первинному визначенні геопозиції -->
        <MapOverlayLoader
          :show="isLocating"
          :text="$t('catalog.locating')"
        />

        <!-- Плаваючий бейдж на карті (Airbnb-style: карта залишається активною і не блокується блюром) -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 -translate-y-2 scale-95"
        >
          <div
            v-if="isLoadingBackendListings && !isLocating"
            class="absolute top-4 left-1/2 -translate-x-1/2 z-1000 pointer-events-none"
          >
            <div
              class="flex items-center gap-2 px-3.5 py-1.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-full shadow-lg border border-neutral-200/80 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-100"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 text-brand-500 animate-spin" />
              <span>{{ $t('catalog.searchingNearby', 'Шукаємо матеріали поруч...') }}</span>
            </div>
          </div>
        </Transition>

        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="transform -translate-y-10 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-300 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showDragHint && initialUserLocation"
            class="absolute top-20 left-1/2 -translate-x-1/2 z-1001 w-[90%] max-w-85"
          >
            <div
              class="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-3 rounded-2xl shadow-2xl flex items-start gap-3"
            >
              <div
                class="bg-brand-50 dark:bg-brand-900/30 p-2 rounded-xl mt-0.5"
              >
                <UIcon
                  name="i-heroicons-hand-raised"
                  class="w-5 h-5 text-brand-600 dark:text-brand-400 animate-bounce"
                />
              </div>

              <div class="flex-1">
                <p
                  class="text-[13px] leading-tight text-neutral-700 dark:text-neutral-200"
                >
                  {{ $t('catalog.dragHintPrefix') }}
                  <span
                    class="inline-flex items-center justify-center bg-blue-600 rounded-full size-4 align-middle mx-0.5 border border-white shadow-sm"
                  >
                    <UIcon
                      name="i-heroicons-user-solid"
                      class="size-2.5 text-white"
                    />
                  </span>
                  {{ $t('catalog.dragHintSuffix') }}
                </p>
              </div>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                size="xs"
                class="-mr-1 -mt-1 text-neutral-400"
                @click="() => { showDragHint = false }"
              />
            </div>
          </div>
        </Transition>

        <div class="absolute top-4 right-4 z-1000 flex flex-col gap-2">
          <UButton
            icon="i-heroicons-viewfinder-circle"
            square
            class="bg-brand-400 hover:bg-brand-500 shadow-lg"
            @click="handleUserLocationCenter"
          />
          <UPopover
            v-model:open="isGeolocationErrorPopoverOpen"
            :popper="{ placement: 'left' }"
          >
            <UButton
              icon="i-heroicons-map-pin"
              square
              class="bg-brand-400 hover:bg-brand-500 shadow-lg text-white"
              :loading="isLocating && !error"
              @click="handleForceUpdateLocation"
            />

            <template #content>
              <div class="p-3 w-64">
                <div class="flex items-start gap-2 text-error-600 mb-1">
                  <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="size-5 shrink-0"
                  />
                  <p class="font-bold text-sm text-red-500">
                    {{ $t('catalog.accessDenied') }}
                  </p>
                </div>
                <p class="text-xs text-neutral-600 dark:text-neutral-400">
                  {{ $t('catalog.allowLocation') }}
                </p>
                <UButton
                  size="xs"
                  variant="ghost"
                  :label="$t('catalog.gotIt')"
                  block
                  class="mt-2"
                  @click="() => { isGeolocationErrorPopoverOpen = false }"
                />
              </div>
            </template>
          </UPopover>
        </div>

        <div
          class="absolute bottom-5 left-1/2 -translate-x-1/2 z-1001 lg:hidden"
        >
          <UButton
            icon="i-heroicons-list-bullet"
            size="md"
            class="ring-3 ring-white bg-brand-500 dark:ring-neutral-950 hover:bg-brand-600 font-medium"
            :loading="isLocating"
            @click="() => { isProductsSliderOpen = true }"
          >
            {{ isLocating ? $t('catalog.locating', 'Визначаємо локацію...') : $t('catalog.list', { count: productsInRadius.length }) }}
          </UButton>
        </div>
      </main>

      <USlideover
        v-model:open="isProductsSliderOpen"
        side="bottom"
        :title="isLocating ? $t('catalog.locating', 'Визначаємо локацію...') : (isLoadingBackendListings && displayedProducts.length === 0 ? $t('catalog.searchingListings') : $t('catalog.foundItems', { count: productsInRadius.length }))"
        :ui="{
          content: 'h-[75%]',
        }"
      >
        <template #body>
          <!-- Активний фільтр категорії (мобільний) -->
          <div
            v-if="activeCategoryInfo"
            class="flex items-start gap-2 mb-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 p-2 px-3 rounded-xl mx-1"
          >
            <UIcon :name="activeCategoryInfo.icon" class="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <span class="text-xs font-semibold text-brand-900 dark:text-brand-100 flex-1 wrap-break-word leading-snug">
              {{ activeCategoryInfo.name }}
            </span>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              class="hover:bg-brand-200/50 dark:hover:bg-brand-900/50 shrink-0 -my-1 -mr-1"
              @click="updateCategoryFilter('')"
            />
          </div>

          <!-- Активний пошуковий запит (мобільний) -->
          <div
            v-if="searchQuery"
            class="flex items-center gap-2 mb-3 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 p-2 px-3 rounded-xl mx-1 min-w-0"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-brand-600 shrink-0" />
            <span class="text-xs text-neutral-700 dark:text-neutral-300 flex-1 truncate min-w-0">
              Пошук: <strong>«{{ searchQuery }}»</strong>
            </span>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              class="hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 shrink-0 -my-1 -mr-1"
              @click="() => { searchQuery = '' }"
            />
          </div>

          <div
            class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1 overflow-y-auto pb-10 scroll-smooth relative"
          >
            <!-- Стан 1: Геолокація (USkeleton) -->
            <div v-if="isLocating" class="col-span-full py-4 space-y-3">
              <div class="flex items-center gap-2 px-1 text-xs text-neutral-500 font-medium">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-brand-500 animate-bounce" />
                <span>{{ $t('catalog.locating', 'Визначаємо вашу локацію...') }}</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="i in 4" :key="i" class="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <USkeleton class="aspect-4/3 w-full rounded-lg" />
                  <USkeleton class="h-3.5 w-3/4 rounded" />
                  <USkeleton class="h-3 w-1/2 rounded" />
                  <USkeleton class="h-4 w-16 rounded" />
                </div>
              </div>
            </div>

            <!-- Стан 2: Первинне завантаження коли карток ще немає в списку (USkeleton) -->
            <div v-else-if="isLoadingBackendListings && displayedProducts.length === 0" class="col-span-full py-4 space-y-3">
              <div class="flex items-center gap-2 px-1 text-xs text-neutral-500 font-medium">
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-brand-500 animate-spin" />
                <span>{{ $t('catalog.searchingListings', 'Пошук товарів...') }}</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="i in 4" :key="i" class="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <USkeleton class="aspect-4/3 w-full rounded-lg" />
                  <USkeleton class="h-3.5 w-3/4 rounded" />
                  <USkeleton class="h-3 w-1/2 rounded" />
                  <USkeleton class="h-4 w-16 rounded" />
                </div>
              </div>
            </div>

            <!-- Стан 3: Товари є (Airbnb-style: плавне оновлення без видалення карток з екрана) -->
            <template v-else-if="productsInRadius.length > 0">
              <div
                v-if="isLoadingBackendListings"
                class="col-span-full flex items-center justify-center gap-1.5 py-1 text-xs text-brand-600 dark:text-brand-400 font-medium animate-pulse"
              >
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
                <span>Оновлюємо результати...</span>
              </div>

              <CommonProductCard
                v-for="product in displayedProducts"
                :key="product.id"
                :id="`mobile-product-${product.id}`"
                :product="product"
                :show-map-button="true"
                @map-click="handleZoomToProduct"
                :class="[
                  'transition-all duration-300 rounded-xl scroll-mt-2',
                  selectedProductOnMap === product.id
                    ? 'ring-2 ring-brand-500 shadow-lg'
                    : '',
                  isLoadingBackendListings ? 'opacity-50 pointer-events-none select-none' : '',
                ]"
              />
              <div v-if="hasMoreProducts" class="col-span-full mt-2">
                <UButton
                  color="primary"
                  variant="soft"
                  block
                  size="md"
                  :loading="isLoadingMoreCards"
                  @click="loadMoreProducts"
                >
                  {{ $t('catalog.showMoreItems', { count: Math.min(20, productsInRadius.length - cardListings.length), remaining: productsInRadius.length - cardListings.length }) }}
                </UButton>
              </div>
            </template>
            <div v-else class="col-span-full text-center py-10 px-2">
              <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
              <p class="font-medium text-neutral-700 dark:text-neutral-300 mb-1">{{ $t('catalog.noResults') }}</p>
              <p v-if="activeCategoryInfo" class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                У поточному радіусі немає залишків у категорії "{{ activeCategoryInfo.name }}"
              </p>
              <UButton
                v-if="activeCategoryInfo || selectedStatus !== 'all'"
                color="primary"
                variant="soft"
                size="sm"
                @click="resetAllFilters"
              >
                Скинути фільтри
              </UButton>
            </div>
          </div>
        </template>
      </USlideover>

      <CitySelectorModal
        v-model="isCityModalOpen"
        :detected-city="detectedCityName"
        :detected-coords="detectedCityCoords"
        @select="onCitySelect"
        @exact-location="triggerExactLocation"
      />

      <!-- Єдина шторка швидкого розумного пошуку та фільтрів -->
      <SearchFiltersSlideover
        :open="isSearchFiltersOpen"
        :search-query="searchQuery"
        :search-in-description="searchInDescription"
        :all-products-in-radius="rawProductsInRadius"
        :search-radius="searchRadius"
        :search-radius-km="searchRadiusKm"
        :current-category="selectedCategory"
        :current-status="selectedStatus"
        :loading="isLoadingBackendListings"
        :user-coords="initialUserLocation || center"
        :use-mock="useMockTable"
        @update:open="isSearchFiltersOpen = $event"
        @update:search-query="searchQuery = $event"
        @update:search-in-description="searchInDescription = $event"
        @update:search-radius="searchRadius = $event"
        @select-category="updateCategoryFilter"
        @update:status="selectedStatus = $event"
        @reset-all="resetAllFilters"
        @apply="onApplyFilters"
      />
    </div>
  </div>
</template>

<script setup lang="ts">

import L from "leaflet";
import type { PointTuple } from "leaflet";
import { useGeolocation, useStorage, refDebounced } from "@vueuse/core";
import { isPointWithinRadius } from "geolib";
import { ref, computed, watch, nextTick, onMounted } from "vue"; 
import { CATEGORY_DATA } from "~/constants/category/category";
import { matchesSmartSearch, getUkrainianSearchQuery } from "~/utils/smartSearch";
import SearchFiltersSlideover from "~/components/catalog/SearchFiltersSlideover.vue";

import CitySelectorModal from "~/components/common/CitySelectorModal.vue";
import MapOverlayLoader from "~/components/common/MapOverlayLoader.vue";

import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import type { Product } from "~/types";

const route = useRoute();
const router = useRouter();

const isSearchFiltersOpen = ref(false);
const searchQuery = ref<string>((route.query.q as string) || (route.query.search as string) || "");
const searchInDescription = ref(false);
const selectedCategory = ref<string>((route.query.category as string) || "");
const selectedStatus = ref<string>("all");

// Синхронізація вибраної категорії та пошуку з query в URL
watch(
  () => route.query.category,
  (newCat) => {
    selectedCategory.value = (newCat as string) || "";
  }
);

watch(
  () => route.query.q,
  (newQ) => {
    if (typeof newQ === "string") {
      searchQuery.value = newQ;
    }
  }
);

const updateCategoryFilter = (catId: string) => {
  selectedCategory.value = catId;
  router.replace({
    query: {
      ...route.query,
      category: catId || undefined,
    },
  });
};

const resetAllFilters = () => {
  selectedStatus.value = "all";
  searchInDescription.value = false;
  searchQuery.value = "";
  selectedCategory.value = "";
  router.replace({
    query: {
      ...route.query,
      q: undefined,
      category: undefined,
    },
  });
};

const onApplyFilters = () => {
  router.replace({
    query: {
      ...route.query,
      q: searchQuery.value || undefined,
      category: selectedCategory.value || undefined,
    },
  });
  isSearchFiltersOpen.value = false;
};

const activeFilterCount = computed(() => {
  let count = 0;
  if (searchQuery.value.trim()) count++;
  if (selectedCategory.value) count++;
  if (selectedStatus.value !== "all") count++;
  if (searchInDescription.value) count++;
  return count;
});

const activeCategoryInfo = computed(() => {
  if (!selectedCategory.value) return null;
  for (const cat of CATEGORY_DATA) {
    if (cat.id === selectedCategory.value) {
      return { id: cat.id, name: cat.name, icon: cat.icon, isParent: true };
    }
    const sub = cat.subcategories.find((s) => s.id === selectedCategory.value);
    if (sub) {
      return { id: sub.id, name: `${cat.name} › ${sub.name}`, icon: cat.icon, isParent: false };
    }
  }
  return { id: selectedCategory.value, name: selectedCategory.value, icon: "i-lucide-tag", isParent: false };
});

// 1. РОЗДІЛЯЄМО ЛОКАЦІЮ І ЦЕНТР КАРТИ

const center = ref<PointTuple>([50.4501, 30.5234]); // Куди дивиться камера
// const initialUserLocation = ref<PointTuple | null>(null);

const initialUserLocation = useStorage<PointTuple | null>(
  "budstock-user-location",
  null,
  sessionStorage,
  {
    serializer: {
      read: (v: string) => (v ? JSON.parse(v) : null),
      write: (v: any) => JSON.stringify(v),
    },
  },
);
const zoom = ref(12);
const searchRadius = useStorage<number>("search-radius", 5000);
const debouncedRadius = refDebounced(searchRadius, 500);
const searchRadiusKm = computed(() => {
  const r = Number(searchRadius.value);
  return isNaN(r) || r <= 0 ? 5 : Math.round(r / 1000);
});

const isProductsSliderOpen = ref(false);
const map = ref<any>(null);
const mapBounds = ref<any>(null);
const mapClusterGroup = ref<any>(null);
const mapMarkers = ref<any[]>([]);
const selectedProductOnMap = ref<string | number | null>(null);
const isMapReady = ref<boolean>(false);
const showDragHint = ref<boolean>(false);
const isGeolocationErrorPopoverOpen = ref(false);

const isCityModalOpen = ref(false);
const detectedCityName = ref("");
const detectedCityCoords = ref<PointTuple | null>(null);
const isManualLocationRequest = ref(false);

// Якщо користувач закрив модалку без вибору міста, беремо визначені по IP або дефолтні координати
watch(isCityModalOpen, (isOpen) => {
  if (!isOpen && !initialUserLocation.value && !isManualLocationRequest.value) {
    const fallback = detectedCityCoords.value || [...center.value];
    initialUserLocation.value = fallback;
    center.value = fallback;
    if (map.value?.leafletObject) {
      map.value.leafletObject.flyTo(fallback, 12);
    }
  }
});

// Запускаємо запит на геолокацію одразу
const { coords, error, pause, resume } = useGeolocation();

const onCitySelect = (city: { lat: number, lng: number, name: string }) => {
  initialUserLocation.value = [city.lat, city.lng];
  center.value = [city.lat, city.lng];
  showDragHint.value = true;
  if (map.value?.leafletObject) {
    map.value.leafletObject.flyTo([city.lat, city.lng], 12);
  }
};

const triggerExactLocation = () => {
  isCityModalOpen.value = false;
  if (error.value?.message) {
    isGeolocationErrorPopoverOpen.value = true;
  } else {
    isManualLocationRequest.value = true;
    resume(); // Це викличе браузерний запит на геолокацію
  }
};

const { searchListings, getListingById } = useListings();
const useMockTable = useStorage<boolean>("budstock-use-mock-table", true);
const isLoadingBackendListings = ref(false);

const createPriceIcon = (price: number, isSelected: boolean): any => {
  const bgClass = isSelected ? "bg-green-500 scale-110 text-white" : "bg-white";
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="${bgClass} text-neutral-800 px-2 py-1 rounded-md text-xs border border-brand-500 shadow-md">
            ${price} ₴
           </div>`,
    iconSize: [55, 25],
    iconAnchor: [25, 25],
  });
};

const createApproximateIcon = (price: number, isSelected: boolean): any => {
  const borderClass = isSelected ? "border-green-500 scale-110" : "border-brand-500";
  const bgClass = isSelected ? "bg-green-500/20" : "bg-brand-500/20";
  const textClass = isSelected ? "text-green-800" : "text-brand-800";
  
  // Малюємо велике напівпрозоре коло з простою ціною всередині
  return L.divIcon({
    className: "custom-approx-marker",
    html: `
      <div class="w-16 h-16 rounded-full flex items-center justify-center ${bgClass} border-2 ${borderClass} backdrop-blur-[2px] transition-transform shadow-md">
        <span class="${textClass} font-bold text-[11px]">${price} ₴</span>
      </div>
    `,
    iconSize: [64, 64],
    iconAnchor: [32, 32],
  });
};

const refreshClusters = async () => {
  if (!map.value?.leafletObject || !isMapReady.value) return;

  const leafletMap = map.value.leafletObject;

  // Очистка
  leafletMap.eachLayer((layer: any) => {
    if (layer instanceof (L as any).MarkerClusterGroup) {
      leafletMap.removeLayer(layer);
    }
  });

  // Нова група з анімаціями
  const result = await useLMarkerCluster({
    leafletObject: leafletMap,
    markers: clusterMarkersData.value,
    options: {
      maxClusterRadius: 80,
      // ГАРАНТІЯ АНІМАЦІЇ:
      animate: true,
      animateAddingMarkers: true,
      // Відключаємо примусове зникнення кластерів і вмикаємо spiderfy
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: any) => {
        const childMarkers = cluster.getAllChildMarkers();
        const isSelected = childMarkers.some((m: any) => m.options?.id === selectedProductOnMap.value);
        const count = cluster.getChildCount();
        
        if (isSelected) {
          // Якщо кластер містить вибраний товар, робимо його зеленим у стилі оригінального MarkerCluster
          return L.divIcon({
            html: `<div style="background-color: #22c55e; color: white; border-radius: 15px; width: 30px; height: 30px; margin-left: 5px; margin-top: 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                    <span style="line-height: 1; font-weight: bold; font-size: 14px;">${count}</span>
                   </div>`,
            className: 'marker-cluster bg-green-500/50', // напівпрозоре зелене зовнішнє кільце
            iconSize: [40, 40],
          });
        }
        
        // Повертаємо рідний гарний вигляд Leaflet для всіх інших кластерів
        let c = ' marker-cluster-';
        if (count < 10) {
          c += 'small';
        } else if (count < 100) {
          c += 'medium';
        } else {
          c += 'large';
        }
        
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: 'marker-cluster' + c,
          iconSize: [40, 40]
        });
      }
    },
  });

  const { markers } = result as any;

  // Зберігаємо посилання на маркери для подальшого використання
  mapMarkers.value = markers;

  // Знаходимо саму групу кластерів безпосередньо на карті (оскільки useLMarkerCluster міг не повернути її)
  leafletMap.eachLayer((layer: any) => {
    if (layer instanceof (L as any).MarkerClusterGroup) {
      mapClusterGroup.value = layer;
    }
  });

  markers.forEach((marker: any) => {
    marker.on("click", () => {
      const productId = (marker.options as any).id;

      if (productId) {
        handleClickProductMarker(productId);
        
        // Якщо клік був по мапі, маркер перемалюється (щоб стати зеленим)
        // Тому ми чекаємо трохи, і відкриваємо попап вже на новому зеленому маркері
        if ((marker.options as any).isApproximate) {
          setTimeout(() => {
            const newMarker = mapMarkers.value?.find((m: any) => m.options?.id === productId);
            if (newMarker) {
              newMarker.openPopup();
            }
          }, 300);
        }
      } else {
        console.warn("Не вдалося знайти ID для цього маркера", marker);
      }
    });

    if ((marker.options as any).isApproximate) {
      marker.bindPopup("<div class='text-center p-1 text-sm font-medium'>Цей товар знаходиться десь у цьому районі (радіус ~1 км)</div>", {
        closeButton: false,
        offset: [0, -10],
      });
    }
  });
};

// Показуємо скелетон, поки не встановлено локацію (GPS або вибір міста в модалці) АБО якщо йде ручний запит
const isLocating = computed(() => 
  !initialUserLocation.value || isManualLocationRequest.value
);

// 1. Легкі маркери для карти (тільки id, title, price, lat, lng, is_exact, category_id)
const rawProductsInRadius = ref<any[]>([]);

// 2. Повноцінні картки товарів (по 20 штук за раз з фото та описами)
const cardListings = ref<Product[]>([]);
const isLoadingMoreCards = ref(false);

let lastFetchKey = "";

const fetchRadiusProducts = async () => {
  // Не завантажуємо товари завчасно за дефолтними координатами,
  // доки триває пошук реальної геопозиції користувача
  if (isLocating.value) return;

  const userCoords = initialUserLocation.value || center.value;
  if (!userCoords) return;

  // Не повторюємо запит з тими самими параметрами (напр. категорія змінилась одразу, а радіус — через debounce)
  const fetchKey = JSON.stringify([
    userCoords,
    searchRadius.value,
    selectedCategory.value,
    searchQuery.value.trim(),
    selectedStatus.value,
    searchInDescription.value,
    useMockTable.value,
  ]);
  if (fetchKey === lastFetchKey) return;
  lastFetchKey = fetchKey;

  isLoadingBackendListings.value = true;
  try {
    const rawQ = searchQuery.value.trim();
    const cleanQuery = rawQ.length >= 3 ? rawQ : undefined;

    // Паралельно завантажуємо:
    // 1) Точки для карти (легкі поля, без фото та описів, до 1 000 шт. за 1 швидкий запит)
    // 2) Перші 20 повних карток товарів
    const [mapData, cardsData] = await Promise.all([
      searchListings({
        userLat: userCoords[0],
        userLng: userCoords[1],
        radiusMeters: searchRadius.value || 5000,
        categoryId: selectedCategory.value || undefined,
        searchQuery: cleanQuery,
        status: selectedStatus.value,
        searchInDescription: searchInDescription.value,
        useMock: useMockTable.value,
        onlyMapFields: true,
        fetchAll: true,
      }),
      searchListings({
        userLat: userCoords[0],
        userLng: userCoords[1],
        radiusMeters: searchRadius.value || 5000,
        categoryId: selectedCategory.value || undefined,
        searchQuery: cleanQuery,
        status: selectedStatus.value,
        searchInDescription: searchInDescription.value,
        useMock: useMockTable.value,
        onlyMapFields: false,
        limit: 20,
        offset: 0,
        fetchAll: false,
      }),
    ]);

    rawProductsInRadius.value = (mapData as any[]) || [];
    cardListings.value = (cardsData as any[]) || [];
  } catch (err) {
    console.error("Помилка під час завантаження товарів у радіусі:", err);
    lastFetchKey = "";
  } finally {
    isLoadingBackendListings.value = false;
  }
};

const loadMoreProducts = async () => {
  const userCoords = initialUserLocation.value || center.value;
  if (!userCoords || isLoadingMoreCards.value) return;

  isLoadingMoreCards.value = true;
  try {
    const rawQ = searchQuery.value.trim();
    const cleanQuery = rawQ.length >= 3 ? rawQ : undefined;

    const moreData = await searchListings({
      userLat: userCoords[0],
      userLng: userCoords[1],
      radiusMeters: searchRadius.value || 5000,
      categoryId: selectedCategory.value || undefined,
      searchQuery: cleanQuery,
      status: selectedStatus.value,
      searchInDescription: searchInDescription.value,
      useMock: useMockTable.value,
      onlyMapFields: false,
      limit: 20,
      offset: cardListings.value.length,
      fetchAll: false,
    });

    if (moreData && moreData.length > 0) {
      const firstNewId = moreData[0]?.id;
      cardListings.value.push(...(moreData as any[]));

      await nextTick();
      if (firstNewId) {
        const targetId = isProductsSliderOpen.value
          ? `mobile-product-${firstNewId}`
          : `product-${firstNewId}`;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  } catch (err) {
    console.error("Помилка довантаження товарів:", err);
  } finally {
    isLoadingMoreCards.value = false;
  }
};

// Запит у базу ініціюється при зміні геопозиції, радіуса, категорії, пошуку, статусу або бази даних
watch(
  [
    () => initialUserLocation.value,
    () => debouncedRadius.value,
    () => selectedCategory.value,
    () => searchQuery.value,
    () => selectedStatus.value,
    () => searchInDescription.value,
    () => useMockTable.value,
  ],
  () => {
    fetchRadiusProducts();
  },
  { immediate: true, deep: true }
);

// Товари для карти з миттєвою локальною фільтрацією при необхідності
// Товари для карти (всі 13 000 точок вже точно відфільтровані бекендом Supabase)
const productsInRadius = computed(() => {
  return rawProductsInRadius.value;
});

const handleUserLocationCenter = () => {
  if (initialUserLocation.value && map.value?.leafletObject) {
    map.value.leafletObject.flyTo(initialUserLocation.value, 12);
  }
};

const handleForceUpdateLocation = () => {
  isGeolocationErrorPopoverOpen.value = false;
  isCityModalOpen.value = true;
};

const displayedProducts = computed(() => {
  return cardListings.value;
});

const hasMoreProducts = computed(
  () => !isLoadingBackendListings.value && cardListings.value.length < productsInRadius.value.length,
);

const handleZoomToProduct = (product: Product) => {
  selectedProductOnMap.value = product.id;
  
  const lat = product.latitude || product.location?.lat;
  const lng = product.longitude || product.location?.lng;

  if (lat && lng && map.value?.leafletObject) {
    isProductsSliderOpen.value = false;
    
    // Просто плавно летимо до маркера (зум 18 - максимальний)
    // Оскільки ми додали підсвітку кластера (він стане зеленим),
    // користувач сам інтуїтивно натисне на нього, щоб розкрити.
    map.value.leafletObject.flyTo([lat, lng], 18, {
      animate: true,
      duration: 1.5 
    });

    if (product.is_exact_location === false) {
      map.value.leafletObject.once('moveend', () => {
        // Знаходимо маркер з новим підсвіченим станом і автоматично відкриваємо його попап
        const targetMarker = mapMarkers.value?.find((m: any) => m.options?.id === product.id);
        if (targetMarker) {
          targetMarker.openPopup();
        }
      });
    }
  }
};

// Обробка кліку на маркер (Виділення та Скрол)
const handleClickProductMarker = async (productId: string | number) => {
  selectedProductOnMap.value = productId;
  // Якщо цього товару немає серед завантажених карток списку, довантажуємо його
  if (!cardListings.value.some((p) => p.id === productId)) {
    try {
      const fullItem = await getListingById(productId);
      if (fullItem && !cardListings.value.some((p) => p.id === productId)) {
        cardListings.value.unshift(fullItem);
      }
    } catch (e) {
      console.error("Не вдалося завантажити картку вибраного товару:", e);
    }
  }

  await nextTick();

  const isMobile = window.innerWidth < 1024;

  if (isMobile) {
    isProductsSliderOpen.value = true;
    setTimeout(() => {
      const el = document.getElementById(`mobile-product-${productId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  } else {
    const el = document.getElementById(`product-${productId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

const handleDraggableMarker = (newLatLng: any) => {
  initialUserLocation.value = [newLatLng.lat, newLatLng.lng];

  showDragHint.value = false;

  if (map.value?.leafletObject) {
    mapBounds.value = map.value.leafletObject.getBounds();
  }
};

const clusterMarkersData = computed(() => {
  return productsInRadius.value.map((product) => {
    // Перевіряємо чи точна локація (за замовчуванням true, якщо не вказано)
    const isExact = product.is_exact_location !== false;
    const lat = product.latitude || product.location?.lat;
    const lng = product.longitude || product.location?.lng;
    
    return {
      lat,
      lng,
      options: {
        id: product.id,
        isApproximate: !isExact,
        icon: isExact 
          ? createPriceIcon(product.price, product.id === selectedProductOnMap.value)
          : createApproximateIcon(product.price, product.id === selectedProductOnMap.value),
        zIndexOffset: product.id === selectedProductOnMap.value ? 1000 : 0,
      },
    };
  });
});

const onMapReady = async () => {
  isMapReady.value = true;

  // Якщо координати вже прийшли раніше, ніж карта була готова
  if (initialUserLocation.value) {
    map.value?.leafletObject?.flyTo(initialUserLocation.value, 12);
  }

  refreshClusters();
};

watch(
  () => [productsInRadius.value, selectedProductOnMap.value],
  () => {
    refreshClusters();
  },
  { deep: false }, // deep: true тут не потрібен, якщо ми слідкуємо за посиланнями
);

watch(
  coords,
  (newCoords) => {
    if (newCoords.latitude !== Infinity && newCoords.longitude !== Infinity) {
      // Якщо локація вже є в кеші (користувач її пересував) і це НЕ ручний клік по кнопці "Точна локація" - не збиваємо
      if (initialUserLocation.value && !isManualLocationRequest.value) {
        pause();
        return;
      }

      const latLng: PointTuple = [newCoords.latitude, newCoords.longitude];

      initialUserLocation.value = latLng;
      center.value = latLng;
      showDragHint.value = true;
      isManualLocationRequest.value = false;

      if (map.value?.leafletObject) {
        map.value.leafletObject.flyTo(latLng, 12);
      }

      pause();
    }
  },
  { immediate: true }
);

watch(error, async (newError) => {
  if (newError) {
    console.warn("Геолокація недоступна:", newError.message);
    
    if (initialUserLocation.value) {
      if (isManualLocationRequest.value) {
        isGeolocationErrorPopoverOpen.value = true;
        isManualLocationRequest.value = false;
      }
      pause();
      return;
    }

    if (isManualLocationRequest.value) {
      isGeolocationErrorPopoverOpen.value = true;
      isManualLocationRequest.value = false;
      isCityModalOpen.value = true;
      pause();
      return;
    }

    // Якщо ми тут, значить локації ще немає, а користувач заборонив доступ або сталась помилка
    // Пробуємо визначити по IP для підказки в модалці, АЛЕ НЕ встановлюємо initialUserLocation,
    // щоб не робити запит і не підтягувати товари до того, як користувач підтвердить або обере місто
    let fallbackCoords: PointTuple = [...center.value];
    try {
      const config = useRuntimeConfig();
      const res = await fetch(config.public.api.ipapiBaseUrl);
      const data = await res.json();
      if (data.latitude && data.longitude) {
        fallbackCoords = [data.latitude, data.longitude];
        detectedCityName.value = data.city || data.region || "ваше місто";
      }
    } catch (err) {
      console.warn("Не вдалося визначити місто по IP:", err);
    }

    detectedCityCoords.value = fallbackCoords;
    center.value = fallbackCoords;

    if (map.value?.leafletObject) {
      map.value.leafletObject.flyTo(fallbackCoords, 12);
    }
    
    // Показуємо модалку для підтвердження або зміни міста
    isCityModalOpen.value = true;
    
    pause();
  }
}, { immediate: true });
</script>

<style>
/* Стилі для кастомного маркера */
.custom-price-marker {
  background: transparent !important;
  border: none !important;
}

/* Виправляємо баг з відображенням контролів Leaflet у темній темі */
.leaflet-control-zoom a {
  background-color: white !important;
  color: black !important;
}
.dark .leaflet-control-zoom a {
  background-color: #262626 !important;
  color: white !important;
  border-color: #404040 !important;
}
</style>
