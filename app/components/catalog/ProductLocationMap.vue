<template>
  <UCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold flex items-center gap-2">
        <UIcon
          name="i-heroicons-map-pin-20-solid"
          class="text-brand-500"
        />
        {{ $t('catalog.location') }}
      </h3>
      <UButton
        variant="link"
        color="primary"
        icon="i-heroicons-arrow-top-right-on-square-20-solid"
        @click="() => {isOpenMapDrawer = true}"
      >
        Переглянути на карті
      </UButton>
    </div>

    <USlideover
      v-model:open="isOpenMapDrawer"
      title="Розташування товару"
    >
      <template #body>
        <div class="h-full flex flex-col">
          <div
            class="flex-1 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            <LMap
              :zoom="15"
              :center="[product.location.lat, product.location.lng]"
            >
              <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LMarker
                v-if="product.is_exact_location !== false"
                :lat-lng="[product.location.lat, product.location.lng]"
              />
              <LCircle
                v-else
                :lat-lng="[product.location.lat, product.location.lng]"
                :radius="1000"
                color="#f97316"
                fill-color="#f97316"
                :fill-opacity="0.2"
                :weight="2"
              />
            </LMap>
          </div>

          <div class="p-4 space-y-4">
            <div>
              <p class="text-sm text-neutral-500">Адреса самовивозу:</p>
              <p class="font-bold text-lg">
                {{ product.location.address }}
              </p>
            </div>
            <UButton
              color="primary"
              :to="googleMapsUrl"
              target="_blank"
              icon="i-heroicons-map"
              label="Прокласти маршрут"
            />
          </div>
        </div>
      </template>
    </USlideover>

    <p class="text-sm text-neutral-500 mb-4">
      {{ product.location.address }}
    </p>

    <div
      class="relative group h-64 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
    >
      <LMap
        :zoom="14"
        :center="[product.location.lat, product.location.lng]"
        :use-global-leaflet="true"
        style="height: 100%; width: 100%; z-index: 1"
        :options="{
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
        }"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LMarker
          v-if="product.is_exact_location !== false"
          :lat-lng="[product.location.lat, product.location.lng]"
        >
          <LIcon
            :icon-size="[60, 40]"
            :icon-anchor="[20, 40]"
            class-name="bg-transparent"
          >
            <div
              class="bg-brand-500 text-white p-1 rounded-lg text-xs text-center whitespace-nowrap border-2 border-white shadow-md"
            >
              {{ product.price }} ₴
            </div>
          </LIcon>
        </LMarker>
        
        <LCircle
          v-else
          :lat-lng="[product.location.lat, product.location.lng]"
          :radius="1000"
          color="#f97316"
          fill-color="#f97316"
          :fill-opacity="0.2"
          :weight="2"
        />
      </LMap>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  product: any;
  googleMapsUrl?: string;
}

defineProps<Props>();

const isOpenMapDrawer = ref(false);
</script>
