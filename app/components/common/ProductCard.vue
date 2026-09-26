<script setup lang="ts">
import type { Product } from "~/types/index";
import { useStorage } from "@vueuse/core";
import { getDistance } from "geolib";

const props = withDefaults(defineProps<{
  product: Product;
  showMapButton?: boolean;
  showDeleteButton?: boolean;
}>(), {
  showMapButton: false,
  showDeleteButton: false,
});

const emit = defineEmits<{
  (e: 'delete', id: string | number): void;
  (e: 'mapClick', product: Product): void;
}>();

const userLocation = useStorage<[number, number] | null>(
  "budstock-user-location",
  null,
  typeof sessionStorage !== 'undefined' ? sessionStorage : undefined,
  {
    serializer: {
      read: (v: string) => (v ? JSON.parse(v) : null),
      write: (v: any) => JSON.stringify(v),
    },
  }
);

const realDistance = computed(() => {
  if (!userLocation.value || !props.product.latitude || !props.product.longitude) return null;
  
  const distMeters = getDistance(
    { latitude: userLocation.value[0], longitude: userLocation.value[1] },
    { latitude: props.product.latitude, longitude: props.product.longitude }
  );
  
  const distKm = distMeters / 1000;
  if (distKm < 10) return distKm.toFixed(1).replace('.0', '');
  return Math.round(distKm);
});

const formattedPrice = computed(() => {
  return new Intl.NumberFormat("uk-UA").format(props.product.price);
});

const formattedDate = computed(() => {
  if (!props.product.created_at) return '';
  const date = new Date(props.product.created_at);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return `Сьогодні о ${date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
});

const shortAddress = computed(() => {
  return props.product?.location?.address || props.product?.address || '';
});
</script>

<template>
  <NuxtLink
    :to="`/catalog/${product.id}`"
    :id="`product-${product.id}`"
    class="group flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-neutral-800"
  >
    <div
      class="aspect-4/3 overflow-hidden bg-transparent relative"
    >
      <img
        :src="product.images[0]"
        :alt="product.title"
        class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
      />
      <div v-if="props.showMapButton" class="absolute top-2 right-2 z-10">
        <UButton
          icon="i-heroicons-map"
          variant="solid"
          size="xs"
          class="shadow-md bg-brand-400 hover:bg-brand-500"
          @click.prevent="emit('mapClick', product)"
          >На мапі</UButton
        >
      </div>
      <div v-if="props.showDeleteButton" class="absolute top-2 right-2 z-10">
        <UButton
          icon="i-heroicons-trash"
          variant="solid"
          color="error"
          size="sm"
          :ui="{ base: 'rounded-full' }"
          class="cursor-pointer"
          @click.prevent="emit('delete', product.id)"
        />
      </div>
      <div class="absolute top-2 left-2 z-10">
        <UBadge size="sm" color="primary">
          {{ product.status }}
        </UBadge>
      </div>
    </div>

    <div class="p-3 sm:p-4 flex flex-col flex-1">
      <h3
        class="font-semibold text-sm sm:text-base line-clamp-2 text-neutral-900 dark:text-white mb-2 h-10 sm:h-12"
      >
        {{ product.title }}
      </h3>

      <div class="flex flex-wrap items-end justify-between gap-2 mb-2 mt-1">
        <div class="flex items-center gap-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          <UIcon name="i-heroicons-cube" class="w-4 h-4 shrink-0 text-neutral-400" />
          <span class="font-medium truncate max-w-[80px] sm:max-w-[100px]">{{ product.quantity }} {{ product.unit }}</span>
        </div>
        <div class="flex items-baseline gap-1 text-right">
          <span
            class="text-base sm:text-xl font-bold text-green-600 dark:text-green-400"
          >
            {{ formattedPrice }}
          </span>
          <span
            class="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 font-public"
            >грн</span
          >
        </div>
      </div>

      <div class="flex items-start gap-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3">
        <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-neutral-400 mt-0.5" />
        <div class="flex flex-col">
          <span class="font-medium leading-snug line-clamp-2">{{ shortAddress }}</span>
          <span v-if="product.is_exact_location === false" class="text-[10px] sm:text-xs text-brand-500 mt-0.5 italic">Товар знаходиться десь у цьому районі</span>
        </div>
      </div>

      <div class="mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <div v-if="realDistance !== null" class="flex items-center gap-1 font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded-md">
          <UIcon name="i-heroicons-arrows-right-left" class="w-3.5 h-3.5 shrink-0" />
          <span>{{ realDistance }} км</span>
        </div>
        <div v-else></div>
        <span class="shrink-0 ml-auto">{{ formattedDate }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
