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
        class="hidden lg:block w-100 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800"
      >
        <div class="grid grid-cols-1 gap-4">
          <CommonProductCard
            v-for="product in productsInRadius"
            :key="product.id"
            :product="product"
            @click="handleZoomToProduct(product)"
          />
        </div>
      </aside>

      <main class="flex-1 relative z-10">
        <LMap
          :zoom="zoom"
          :center="center"
          :use-global-leaflet="true"
          ref="map"
          @update:zoom="zoom = $event"
          @update:bounds="mapBounds = $event"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LCircle
            v-if="userLocation"
            :lat-lng="userLocation"
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
              zoom > 13 ? createPriceIcon(product.price) : createSimpleDotIcon()
            "
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

          <LMarker v-if="userLocation" :lat-lng="userLocation">
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
            class="absolute inset-0 z-2000 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-8 h-8 animate-spin text-primary-500 mb-2"
            />
            <p class="text-sm font-medium">Шукаємо вас на карті...</p>
          </div>
        </Transition>
        <div class="absolute top-4 right-4 z-1000 flex flex-col gap-2">
          <UButton
            icon="i-heroicons-map-pin"
            square
            class="shadow-lg"
            @click="handleUserLocationCenter"
          />
        </div>
        <div
          class="absolute bottom-8 left-1/2 -translate-x-1/2 z-1001 lg:hidden"
        >
          <UButton
            icon="i-heroicons-list-bullet"
            size="md"
            color="primary"
            class="shadow-2xl px-6 py-3 ring-4 ring-white dark:ring-neutral-950"
            @click="isProductsSliderOpen = true"
          >
            Список ({{ productsInRadius.length }})
          </UButton>
        </div>
      </main>

      <USlideover
        v-model:open="isProductsSliderOpen"
        side="bottom"
        :title="`Знайдено: ${productsInRadius.length}`"
        :ui="{
          content: 'h-[75%]',
        }"
      >
        <template #body>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1 overflow-y-auto pb-10"
          >
            <div
              v-for="item in productsInRadius"
              :key="item.id"
              class="flex flex-col bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm"
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

                <UButton size="xs" block class="mt-2" variant="soft" to="#">
                  Дивитись
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

import type { Product } from "~/types";

import { MOCK_PRODUCTS } from "~/constants/products/products";

const center = ref<PointTuple>([50.4501, 30.5234]);
const zoom = ref(12);
const searchRadius = ref(2000);
const isProductsSliderOpen = ref(false);
const isInitialCenterSet = ref(false);
const map = ref<any>(null);
const mapBounds = ref<any>(null);

const { coords, locatedAt, error, resume, pause } = useGeolocation();

const createPriceIcon = (price: number): any => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="bg-brand-500 text-white px-2 py-1 rounded-lg font-bold shadow-md text-xs border border-white">
            ${price} ₴
           </div>`,
    iconSize: [50, 25],
    iconAnchor: [25, 25],
  });
};

const createSimpleDotIcon = () => {
  return L.divIcon({
    className: "simple-dot",
    html: `<div class="w-2 h-2 bg-brand-600 rounded-full"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const userLocation = computed<PointTuple | null>(() => {
  if (coords.value.latitude !== Infinity) {
    return [coords.value.latitude, coords.value.longitude];
  }
  return null;
});

const isLocating = computed(
  () => coords.value.latitude === Infinity && !error.value,
);

const productsInRadius = computed(() => {
  if (!userLocation.value) return [];

  return MOCK_PRODUCTS.filter((product) => {
    if (!product.location?.lat || !product.location?.lng) return false;

    // Тут можна додати ще фільтрацію за назвою (product.title), якщо є пошуковий запит
    return isPointWithinRadius(
      { latitude: userLocation.value![0], longitude: userLocation.value![1] },
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

const handleUserLocationCenter = () => {
  if (userLocation.value && map.value?.leafletObject) {
    map.value.leafletObject.flyTo(userLocation.value, 12);

    center.value = [...userLocation.value];
    zoom.value = 12;
  }
};

const handleZoomToProduct = (product: Product) => {
  if (
    product.location?.lat &&
    product.location?.lng &&
    map.value?.leafletObject
  ) {
    map.value.leafletObject.flyTo(
      [product.location.lat, product.location.lng],
      12,
    );
    zoom.value = 12;
  }
};

watch(
  coords,
  (newCoords) => {
    if (newCoords.latitude !== Infinity && newCoords.longitude !== Infinity) {
      if (!isInitialCenterSet.value) {
        const lat = newCoords.latitude;
        const lng = newCoords.longitude;
        center.value = [lat, lng];

        if (map.value?.leafletObject) {
          map.value.leafletObject.flyTo([lat, lng], 12, {
            duration: 1.5,
          });
          isInitialCenterSet.value = true;
        }
      }
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
.leaflet-container {
  background: #171717 !important; /* neutral-900 */
}
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
