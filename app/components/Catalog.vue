<template>
  <div class="flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
    <header
      class="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-20"
    >
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1 w-full flex gap-2">
          <UInput
            icon="i-heroicons-magnifying-glass"
            placeholder="Шукати матеріали..."
            class="w-full max-w-sm"
          />
          <UButton
            color="neutral"
            variant="soft"
            icon="i-heroicons-adjustments-horizontal"
            >Фільтри</UButton
          >
        </div>

        <div class="w-full md:w-64 space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium text-neutral-500"
              >Радіус пошуку</span
            >
            <UBadge size="xs" color="primary" variant="soft"
              >{{ searchRadius / 1000 }} км</UBadge
            >
          </div>
          <USlider
            v-model="searchRadius"
            :min="1000"
            :max="50000"
            :step="1000"
            color="primary"
            size="sm"
          />
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <aside
        class="hidden lg:block w-100 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 scroll-smooth"
      >
        <div class="grid grid-cols-1 gap-4" v-if="productsInRadius.length > 0">
          <div>{{ `Знайдено: ${productsInRadius.length} позицій` }}</div>
          <CommonProductCard
            v-for="product in productsInRadius"
            :key="product.id"
            :id="`product-${product.id}`"
            :product="product"
            :class="[
              'transition-all duration-300 rounded-xl',
              selectedProductOnMap === product.id ? 'ring-2 ring-brand-500 shadow-lg' : ''
            ]"
            @click="handleZoomToProduct(product)"
          />
        </div>
        <div v-else>
          Не знайдено жодного матеріалу. Спробуйте збільшити радіус пошуку.
        </div>
      </aside>

      <main class="flex-1 relative z-10">
        <LMap
          :zoom="zoom"
          :center="center"
          :use-global-leaflet="true"
          ref="map"
          @update:zoom="zoom = $event"
          @update:center="center = $event"
          @update:bounds="mapBounds = $event"
          @click="selectedProductOnMap = null"
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
            v-for="product in productsOnScreen"
            :key="product.id"
            :lat-lng="[product.location.lat!, product.location.lng!]"
            :icon="
              zoom > 13
                ? createPriceIcon(
                    product.price,
                    selectedProductOnMap === product.id,
                  )
                : createSimpleDotIcon(selectedProductOnMap === product.id)
            "
            :z-index-offset="selectedProductOnMap === product.id ? 1000 : 0"
            @click="handleClickProductMarker(product.id)"
          >
            <LPopup>
              <div class="w-40">
                <img
                  :src="product.images[0]"
                  class="w-full h-20 object-cover rounded mb-2"
                />
                <p class="font-bold text-xs truncate">{{ product.title }}</p>
                <p class="text-primary-600 font-bold">
                  {{ product.price }} грн
                </p>
                <UButton size="xs" block class="mt-2" to="#"
                  >Переглянути</UButton
                >
              </div>
            </LPopup>
          </LMarker>

          <LMarker v-if="initialUserLocation" :lat-lng="initialUserLocation">
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
            <LPopup>Ви тут</LPopup>
          </LMarker>
        </LMap>

        <Transition name="fade">
          <div
            v-if="isLocating"
            class="absolute inset-0 z-[2000] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-8 h-8 animate-spin text-primary-500 mb-2"
            />
            <p class="text-sm font-medium">Шукаємо вас на карті...</p>
          </div>
        </Transition>

        <div class="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <UButton
            icon="i-heroicons-map-pin"
            square
            class="bg-brand-400 hover:bg-brand-500 shadow-lg"
            @click="handleUserLocationCenter"
          />
        </div>

        <div
          class="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1001] lg:hidden"
        >
          <UButton
            icon="i-heroicons-list-bullet"
            size="md"
            class="ring-3 ring-white bg-brand-500 dark:ring-neutral-950 hover:bg-brand-600"
            @click="isProductsSliderOpen = true"
          >
            Список ({{ productsInRadius.length }})
          </UButton>
        </div>
      </main>

      <USlideover
        v-model:open="isProductsSliderOpen"
        side="bottom"
        :title="`Знайдено: ${productsInRadius.length} позицій`"
        :ui="{
          content: 'h-[75%]',
        }"
      >
        <template #body>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1 overflow-y-auto pb-10 scroll-smooth"
            
          >
            <div
              v-for="item in productsInRadius"
              :key="item.id"
              :id="`mobile-product-${item.id}`"
              :class="[
                'flex flex-col rounded-xl border overflow-hidden shadow-sm transition-all duration-300',
                selectedProductOnMap === item.id 
                  ? 'border-brand-500 ring-2 ring-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
              ]"
            >
              <div class="aspect-square w-full relative">
                <img
                  :src="item.images[0]"
                  class="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div class="p-2 flex flex-col flex-1 justify-between">
                <div>
                  <p
                    class="font-bold text-[13px] leading-tight line-clamp-2 mb-1"
                  >
                    {{ item.title }}
                  </p>
                  <p class="text-primary-600 font-bold text-sm">
                    {{ item.price }} ₴
                  </p>
                </div>

                <UButton
                  size="xs"
                  block
                  class="mt-2"
                  variant="soft"
                  @click="handleZoomToProduct(item)"
                >
                  Показати на мапі
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </USlideover>
    </div>
  </div>
</template>

<script setup lang="ts">
import L from "leaflet";
import type { PointTuple } from "leaflet";
import { useGeolocation } from "@vueuse/core";
import { isPointWithinRadius } from "geolib";
import { ref, computed, watch, nextTick } from "vue"; // Не забудь імпорти, якщо використовуєш auto-imports, то ок

import type { Product } from "~/types";
import { MOCK_PRODUCTS } from "~/constants/products/products";

// 1. РОЗДІЛЯЄМО ЛОКАЦІЮ І ЦЕНТР КАРТИ
const initialUserLocation = ref<PointTuple | null>(null); // Де стоїть юзер
const center = ref<PointTuple>([50.4501, 30.5234]);       // Куди дивиться камера
const zoom = ref(12);
const searchRadius = ref(2000);

const isProductsSliderOpen = ref(false);
const map = ref<any>(null);
const mapBounds = ref<any>(null);
const selectedProductOnMap = ref<string | number | null>(null);

const { coords, error, pause } = useGeolocation();

const createPriceIcon = (price: number, isSelected: boolean): any => {
  const bgClass = isSelected ? "bg-green-500 scale-110" : "bg-brand-500";
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="${bgClass} text-white px-2 py-1 rounded-lg text-xs">
            ${price} ₴
           </div>`,
    iconSize: [50, 25],
    iconAnchor: [25, 25],
  });
};

const createSimpleDotIcon = (isSelected: boolean) => {
  const bgClass = isSelected ? "bg-orange-600 scale-150 ring-2 ring-white" : "bg-brand-600";
  return L.divIcon({
    className: "simple-dot",
    html: `<div class="w-2 h-2 ${bgClass} rounded-full shadow-md transition-all duration-300"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

// Показуємо лоадер, поки не отримаємо координати АБО помилку
const isLocating = computed(() => !initialUserLocation.value && !error.value);

const productsInRadius = computed(() => {
  if (!initialUserLocation.value) return [];

  return MOCK_PRODUCTS.filter((product) => {
    if (!product.location?.lat || !product.location?.lng) return false;

    // Відраховуємо радіус від статичної точки користувача
    return isPointWithinRadius(
      { latitude: initialUserLocation.value![0], longitude: initialUserLocation.value![1] },
      { latitude: product.location.lat, longitude: product.location.lng },
      searchRadius.value,
    );
  });
});

const productsOnScreen = computed(() => {
  if (!mapBounds.value) return productsInRadius.value;

  const sw = mapBounds.value._southWest;
  const ne = mapBounds.value._northEast;

  return productsInRadius.value.filter((product) => {
    const lat = product.location!.lat;
    const lng = product.location!.lng;
    return lat >= sw.lat && lat <= ne.lat && lng >= sw.lng && lng <= ne.lng;
  });
});

// Кнопка центрування тепер завжди повертає до зафіксованої точки
const handleUserLocationCenter = () => {
  if (initialUserLocation.value && map.value?.leafletObject) {
    map.value.leafletObject.flyTo(initialUserLocation.value, 13);
  }
};

const handleZoomToProduct = (product: Product) => {
  selectedProductOnMap.value = product.id;
  if (product.location?.lat && product.location?.lng && map.value?.leafletObject) {
    isProductsSliderOpen.value = false;
    map.value.leafletObject.flyTo([product.location.lat, product.location.lng], 14);
  }
};

// Обробка кліку на маркер (Виділення та Скрол)
const handleClickProductMarker = async (productId: string | number) => {
  selectedProductOnMap.value = productId;
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

// ОДНОРАЗОВИЙ ВОТЧЕР ГЕОЛОКАЦІЇ
const unwatch = watch(
  coords,
  (newCoords) => {
    if (newCoords.latitude !== Infinity && newCoords.longitude !== Infinity) {
      const latLng: PointTuple = [newCoords.latitude, newCoords.longitude];
      
      // Фіксуємо точку
      initialUserLocation.value = latLng;
      // Ставимо початковий центр
      center.value = latLng;

      if (map.value?.leafletObject) {
         map.value.leafletObject.flyTo(latLng, 13, { duration: 1.5 });
      }

      // Вимикаємо подальше прослуховування GPS, щоб економити ресурси
      pause();
      unwatch(); 
    }
  },
  { immediate: true },
);
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
