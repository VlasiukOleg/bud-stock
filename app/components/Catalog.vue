<script setup lang="ts">
import L from "leaflet";
import type { PointTuple } from "leaflet";
import { useGeolocation } from "@vueuse/core";

import { MOCK_PRODUCTS } from "~/constants/products/products";
// Тимчасові координати Києва для центру карти
const center = ref<PointTuple>([50.4501, 30.5234]);
const zoom = ref(12);

const { coords, locatedAt, error, resume, pause } = useGeolocation();

interface LocationItem {
  id: number;
  lat: number;
  lng: number;
  price: string;
  title: string;
}

watchEffect(() => console.log(coords.value));

const locations = ref<LocationItem[]>([
  { id: 1, lat: 50.46, lng: 30.51, price: "850", title: "Ламінат" },
  { id: 2, lat: 50.44, lng: 30.54, price: "1200", title: "Плитка" },
  { id: 3, lat: 50.48, lng: 30.49, price: "450", title: "Фарба" },
]);

// Повертаємо тип any або DivIcon, щоб уникнути конфлікту з IconOptions
const createPriceIcon = (price: string): any => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="bg-brand-500 text-white px-2 py-1 rounded-lg font-bold shadow-md text-xs border border-white">
            ${price} ₴
           </div>`,
    iconSize: [50, 25],
    iconAnchor: [25, 25],
  });
};
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
    <div
      class="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-20"
    >
      <div class="flex gap-4">
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
    </div>

    <div class="flex flex-1 overflow-hidden">
      <aside
        class="hidden lg:block w-112.5 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800"
      >
        <div class="grid grid-cols-1 gap-4">
          <CommonProductCard
            v-for="product in MOCK_PRODUCTS"
            :key="product.id"
            :product="product"
          />
        </div>
      </aside>

      <main class="flex-1 relative z-10">
        <LMap
          ref="map"
          :zoom="zoom"
          :center="center"
          :use-global-leaflet="true"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            layer-type="base"
            name="OpenStreetMap"
          />

          <LMarker
            v-for="loc in locations"
            :key="loc.id"
            :lat-lng="[loc.lat, loc.lng]"
            :icon="createPriceIcon(loc.price)"
          >
            <LPopup>
              <div class="p-1">
                <p class="font-bold text-sm">{{ loc.title }}</p>
                <p class="text-green-600 font-bold">${loc.price} грн</p>
                <UButton size="xs" class="mt-2" block :to="`/product/${loc.id}`"
                  >Перейти</UButton
                >
              </div>
            </LPopup>
          </LMarker>
          <LMarker :lat-lng="[coords?.latitude, coords?.longitude]" />
        </LMap>
      </main>
      <button v-on:click="resume">Hello</button>
    </div>
  </div>
</template>

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
