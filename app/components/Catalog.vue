<template>
  <div
    class="flex flex-col h-[100dvh] pb-[64px] md:h-[calc(100vh-64px)] md:pb-0 overflow-hidden relative"
  >
    <header
      class="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-20"
    >
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1 w-full flex gap-2">
          <UInput
            v-model="searchQuery"
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
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-neutral-500">Радіус пошуку</span>
            <UBadge
              size="md"
              class="bg-brand-100 text-neutral-800"
              variant="soft"
              >{{ searchRadius / 1000 }} км</UBadge
            >
          </div>
          <USlider
            v-model="searchRadius"
            :min="1000"
            :max="50000"
            :step="1000"
            size="md"
            :ui="{
              range: 'bg-brand-400',
              thumb: 'ring-brand-400 focus-visible:outline-brand-400/50',
            }"
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
            v-for="product in displayedProducts"
            :key="product.id"
            :id="`product-${product.id}`"
            :product="product"
            :class="[
              'transition-all duration-300 rounded-xl',
              selectedProductOnMap === product.id
                ? 'ring-2 ring-brand-500 shadow-lg'
                : '',
            ]"
            @click="handleZoomToProduct(product)"
          />
          <UButton
            v-if="hasMoreProducts"
            color="primary"
            variant="soft"
            block
            size="lg"
            class="mt-2"
            @click="loadMoreProducts"
          >
            Показати ще 20 (Залишилось:
            {{ productsInRadius.length - displayLimit }})
          </UButton>
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
            class="absolute top-20 left-1/2 -translate-x-1/2 z-[1001] w-[90%] max-w-[340px]"
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
                  Ви можете перетягувати маркер
                  <span
                    class="inline-flex items-center justify-center bg-blue-600 rounded-full size-4 align-middle mx-0.5 border border-white shadow-sm"
                  >
                    <UIcon
                      name="i-heroicons-user-solid"
                      class="size-2.5 text-white"
                    />
                  </span>
                  у будь-яке місце, щоб змінити точку пошуку матеріалів.
                </p>
              </div>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                size="xs"
                class="-mr-1 -mt-1 text-neutral-400"
                @click="showDragHint = false"
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
                    Доступ заборонено
                  </p>
                </div>
                <p class="text-xs text-neutral-600 dark:text-neutral-400">
                  Будь ласка, дозвольте доступ до вашої геопозиції у
                  налаштуваннях браузера.
                </p>
                <UButton
                  size="xs"
                  variant="ghost"
                  label="Зрозумів"
                  block
                  class="mt-2"
                  @click="isGeolocationErrorPopoverOpen = false"
                />
              </div>
            </template>
          </UPopover>
        </div>

        <div
          class="absolute bottom-6 left-1/2 -translate-x-1/2 z-1001 lg:hidden"
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
              v-for="item in displayedProducts"
              :key="item.id"
              :id="`mobile-product-${item.id}`"
              :class="[
                'flex flex-col rounded-xl border overflow-hidden shadow-sm transition-all duration-300',
                selectedProductOnMap === item.id
                  ? 'border-brand-500 ring-2 ring-brand-500 bg-brand-50 dark:bg-brand-900/20'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
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
          <div v-if="hasMoreProducts" class="col-span-full mt-2">
            <UButton
              color="primary"
              variant="soft"
              block
              size="md"
              @click="loadMoreProducts"
            >
              Показати ще ({{ productsInRadius.length - displayLimit }})
            </UButton>
          </div>
        </template>
      </USlideover>
    </div>
  </div>
</template>

<script setup lang="ts">
import L from "leaflet";
import type { PointTuple } from "leaflet";
import { useGeolocation, useStorage } from "@vueuse/core";
import { isPointWithinRadius } from "geolib";
import { ref, computed, watch, nextTick } from "vue"; // Не забудь імпорти, якщо використовуєш auto-imports, то ок

import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import type { Product } from "~/types";
import { MOCK_PRODUCTS } from "~/constants/products/products";

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
const searchRadius = ref(5000);

const isProductsSliderOpen = ref(false);
const map = ref<any>(null);
const mapBounds = ref<any>(null);
const selectedProductOnMap = ref<string | number | null>(null);
const isMapReady = ref<boolean>(false);
const showDragHint = ref<boolean>(false);
const displayLimit = ref(20);
const searchQuery = ref("");
const isGeolocationErrorPopoverOpen = ref(false);

const { coords, error, pause, resume } = useGeolocation();

const createPriceIcon = (price: number, isSelected: boolean): any => {
  const bgClass = isSelected ? "bg-green-500 scale-110 text-white" : "bg-white";
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="${bgClass} text-neutral-800 px-2 py-1 rounded-md text-xs border border-brand-500">
            ${price} ₴
           </div>`,
    iconSize: [55, 25],
    iconAnchor: [25, 25],
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
  const { markers } = await useLMarkerCluster({
    leafletObject: leafletMap,
    markers: clusterMarkersData.value,
    options: {
      maxClusterRadius: 80,
      // ГАРАНТІЯ АНІМАЦІЇ:
      animate: true,
      animateAddingMarkers: true,
      // Коли зум > 13, кластери зникають, з'являються ціни:
      disableClusteringAtZoom: 14,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
    },
  });

  markers.forEach((marker) => {
    marker.on("click", () => {
      const productId = (marker.options as any).id;

      if (productId) {
        handleClickProductMarker(productId);
      } else {
        console.warn("Не вдалося знайти ID для цього маркера", marker);
      }
    });
  });
};

// Показуємо лоадер, поки не отримаємо координати АБО помилку
const isLocating = computed(() => !initialUserLocation.value && !error.value);

const productsInRadius = computed(() => {
  if (!initialUserLocation.value) return [];

  return MOCK_PRODUCTS.filter((product) => {
    if (!product.location?.lat || !product.location?.lng) return false;

    // 1. Фільтр по радіусу
    const isWithin = isPointWithinRadius(
      {
        latitude: initialUserLocation.value![0],
        longitude: initialUserLocation.value![1],
      },
      { latitude: product.location.lat, longitude: product.location.lng },
      searchRadius.value,
    );

    if (!isWithin) return false;

    // 2. Фільтр по назві (searchQuery)
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      return product.title.toLowerCase().includes(query);
      // Можна додати ще пошук по опису: || product.description.toLowerCase().includes(query)
    }

    return true;
  });
});

const handleUserLocationCenter = () => {
  if (initialUserLocation.value && map.value?.leafletObject) {
    map.value.leafletObject.flyTo(initialUserLocation.value, 12);
  }
};

const handleForceUpdateLocation = () => {
  console.log("errorhandleForceUpdateLocation", error.value?.message);
  isGeolocationErrorPopoverOpen.value = false;

  if (error.value?.message) {
    isGeolocationErrorPopoverOpen.value = true;
    return;
  }

  initialUserLocation.value = null;
  resume();
};

const displayedProducts = computed(() => {
  const all = productsInRadius.value;
  const limit = displayLimit.value;

  const visible = [...all.slice(0, limit)];

  // 2. Розумний трюк: якщо є вибраний товар на карті, і його зараз немає у видимому списку
  if (selectedProductOnMap.value) {
    const isVisible = visible.some((p) => p.id === selectedProductOnMap.value);

    if (!isVisible) {
      const selected = all.find((p) => p.id === selectedProductOnMap.value);
      if (selected) {
        visible.push(selected); // Додаємо його просто в кінець списку!
      }
    }
  }

  return visible;
});

const hasMoreProducts = computed(
  () => productsInRadius.value.length > displayLimit.value,
);

const loadMoreProducts = () => {
  displayLimit.value += 20;
};

const handleZoomToProduct = (product: Product) => {
  selectedProductOnMap.value = product.id;
  if (
    product.location?.lat &&
    product.location?.lng &&
    map.value?.leafletObject
  ) {
    isProductsSliderOpen.value = false;
    map.value.leafletObject.flyTo(
      [product.location.lat, product.location.lng],
      14,
    );
  }
};

// Обробка кліку на маркер (Виділення та Скрол)
const handleClickProductMarker = async (productId: string | number) => {
  selectedProductOnMap.value = productId;

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
  return productsInRadius.value.map((product) => ({
    lat: product.location.lat,
    lng: product.location.lng,
    options: {
      id: product.id,
      icon: createPriceIcon(
        product.price,
        selectedProductOnMap.value === product.id,
      ),
    },
  }));
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
  () => productsInRadius.value,
  () => {
    displayLimit.value = 20;
  },
);

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
    console.log("initialUserLocation", initialUserLocation.value);
    if (initialUserLocation.value) {
      return;
    }
    if (newCoords.latitude !== Infinity && newCoords.longitude !== Infinity) {
      const latLng: PointTuple = [newCoords.latitude, newCoords.longitude];

      initialUserLocation.value = latLng;

      center.value = latLng;

      showDragHint.value = true;

      if (map.value?.leafletObject) {
        map.value.leafletObject.flyTo(latLng, 12);
      }

      pause();
    }
  },
  // { immediate: true },
);

watch(error, (newError) => {
  if (newError) {
    console.log("newError", newError);
    console.warn("Геолокація недоступна:", newError.message);

    if (initialUserLocation.value) {
      return;
    }

    console.log("center", center.value);

    initialUserLocation.value = [...center.value];

    showDragHint.value = true;

    if (map.value?.leafletObject) {
      map.value.leafletObject.flyTo(initialUserLocation.value, 12);
    }
    pause();
  }
});
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
