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
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </aside>

      <main class="flex-1 relative z-10">
        <LMap :zoom="zoom" :center="center" :use-global-leaflet="true">
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
            v-for="product in filteredProducts"
            :key="product.id"
            :lat-lng="[product.location.lat!, product.location.lng!]"
            :icon="createPriceIcon(product.price)"
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
                <UButton
                  size="xs"
                  block
                  class="mt-2"
                  :to="`/product/${product.id}`"
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
              >s
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
        <div
          class="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1001] lg:hidden"
        >
          <UButton
            icon="i-heroicons-list-bullet"
            size="md"
            color="primary"
            class="shadow-2xl px-6 py-3 ring-4 ring-white dark:ring-neutral-950"
            @click="isProductsSliderOpen = true"
          >
            Список ({{ filteredProducts.length }})
          </UButton>
        </div>
      </main>

      <USlideover
        v-model:open="isProductsSliderOpen"
        side="bottom"
        :title="`У радіусі ${searchRadius / 1000} км знайдено: ${filteredProducts.length} карток`"
      >
        <template #body>
          <UCarousel
            v-slot="{ item }"
            :items="filteredProducts"
            :ui="{ item: 'basis-1/3' }"
          >
            <div>
              <img
                :src="item.images[0]"
                class="w-full object-cover rounded mb-2"
              />
              <p class="font-bold text-xs truncate">{{ item.title }}</p>
              <p class="text-primary-600 font-bold">{{ item.price }} грн</p>
              <UButton size="xs" block class="mt-2" :to="`/product/${item.id}`"
                >Переглянути</UButton
              >
            </div>
          </UCarousel>
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

import { MOCK_PRODUCTS } from "~/constants/products/products";
const center = ref<PointTuple>([50.4501, 30.5234]);
const zoom = ref(12);
const searchRadius = ref(2000);
const isProductsSliderOpen = ref(false);

const { coords, locatedAt, error, resume, pause } = useGeolocation();

interface LocationItem {
  id: number;
  lat: number;
  lng: number;
  price: string;
  title: string;
}

const locations = ref<LocationItem[]>([
  { id: 1, lat: 50.46, lng: 30.51, price: "850", title: "Ламінат" },
  { id: 2, lat: 50.44, lng: 30.54, price: "1200", title: "Плитка" },
  { id: 3, lat: 50.48, lng: 30.49, price: "450", title: "Фарба" },
]);

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

const userLocation = computed<PointTuple | null>(() => {
  if (coords.value.latitude !== Infinity) {
    return [coords.value.latitude, coords.value.longitude];
  }
  return null;
});

const filteredProducts = computed(() => {
  if (!userLocation.value) return []; // Поки немає локації — список порожній

  return MOCK_PRODUCTS.filter((product) => {
    if (!product.location?.lat || !product.location?.lng) return false;

    return isPointWithinRadius(
      { latitude: userLocation.value![0], longitude: userLocation.value![1] },
      { latitude: product.location.lat, longitude: product.location.lng },
      searchRadius.value,
    );
  });
});

watch(
  coords,
  (newCoords) => {
    if (newCoords.latitude !== Infinity && newCoords.longitude !== Infinity) {
      center.value = [newCoords.latitude, newCoords.longitude];
      zoom.value = 13;
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
