<script setup lang="ts">
import type { Product } from "~/types/index";
import { useStorage } from "@vueuse/core";
import { getDistance } from "geolib";

const props = withDefaults(defineProps<{
  product: Product;
  showMapButton?: boolean;
  showDeleteButton?: boolean;
  showStatusActions?: boolean;
}>(), {
  showMapButton: false,
  showDeleteButton: false,
  showStatusActions: false,
});

const emit = defineEmits<{
  (e: 'delete', id: string | number): void;
  (e: 'mapClick', product: Product): void;
  (e: 'updateState', id: string | number, newState: 'active' | 'sold' | 'deactivated'): void;
  (e: 'edit', id: string | number): void;
}>();

const toast = useToast();

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

const isSold = computed(() => props.product.listing_state === 'sold');
const isDeactivated = computed(() => props.product.listing_state === 'deactivated');

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/catalog/${props.product.id}`);
    toast.add({ title: 'Посилання скопійовано', color: 'success' });
  } catch (e) {
    toast.add({ title: 'Помилка копіювання', color: 'error' });
  }
};

const statusLabel = computed(() => {
  if (isSold.value) return 'Продано';
  if (isDeactivated.value) return 'Приховано';
  return 'Активне';
});

const statusIndicatorColor = computed(() => {
  if (isSold.value) return 'bg-purple-500';
  if (isDeactivated.value) return 'bg-gray-400';
  return 'bg-green-500';
});

const actionItems = computed(() => {
  if (!props.product.listing_state || props.product.listing_state === 'active') {
    return [
      [
        {
          label: 'Позначити проданим',
          icon: 'i-heroicons-check-circle',
          onSelect: () => emit('updateState', props.product.id, 'sold')
        },
        {
          label: 'Деактивувати',
          icon: 'i-heroicons-pause',
          onSelect: () => emit('updateState', props.product.id, 'deactivated')
        },
        {
          label: 'Редагувати',
          icon: 'i-heroicons-pencil',
          onSelect: () => emit('edit', props.product.id)
        }
      ],
      [
        {
          label: 'Скопіювати посилання',
          icon: 'i-heroicons-document-duplicate',
          onSelect: () => copyLink()
        }
      ]
    ]
  } else if (isSold.value) {
    return [
      [
        {
          label: 'Активувати',
          icon: 'i-heroicons-play',
          onSelect: () => emit('updateState', props.product.id, 'active')
        },
        {
          label: 'Деактивувати',
          icon: 'i-heroicons-pause',
          onSelect: () => emit('updateState', props.product.id, 'deactivated')
        }
      ],
      [
        {
          label: 'Редагувати',
          icon: 'i-heroicons-pencil',
          onSelect: () => emit('edit', props.product.id)
        }
      ],
      [
        {
          label: 'Видалити',
          icon: 'i-heroicons-trash',
          color: 'error',
          onSelect: () => emit('delete', props.product.id)
        }
      ]
    ]
  } else {
    // deactivated
    return [
      [
        {
          label: 'Активувати',
          icon: 'i-heroicons-play',
          onSelect: () => emit('updateState', props.product.id, 'active')
        }
      ],
      [
        {
          label: 'Редагувати',
          icon: 'i-heroicons-pencil',
          onSelect: () => emit('edit', props.product.id)
        }
      ],
      [
        {
          label: 'Видалити',
          icon: 'i-heroicons-trash',
          color: 'error',
          onSelect: () => emit('delete', props.product.id)
        }
      ]
    ]
  }
});
</script>

<template>
  <div class="relative group flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-neutral-800 h-full">
    <NuxtLink
      :to="`/catalog/${product.id}`"
      :id="`product-${product.id}`"
      class="flex flex-col flex-1"
      :class="{ 'opacity-60 grayscale-[30%]': isSold || isDeactivated }"
    >
      <div
        class="aspect-4/3 overflow-hidden bg-transparent relative"
      >
        <img
          v-if="product.images && product.images.length > 0"
          :src="product.images[0]"
          :alt="product.title"
          class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <UIcon v-else name="i-heroicons-photo" class="w-16 h-16 text-neutral-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        
        <div v-if="isSold" class="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
          <span class="text-white font-bold text-xl sm:text-2xl uppercase tracking-wider bg-black/60 px-4 py-2 rounded-lg rotate-[-12deg] border-2 border-white/50">Продано</span>
        </div>
        <div v-else-if="isDeactivated" class="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
          <span class="text-white font-bold text-lg sm:text-xl uppercase tracking-wider bg-black/60 px-4 py-2 rounded-lg border-2 border-white/50">Приховано</span>
        </div>

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
        <div class="absolute top-2 left-2 z-10">
          <UBadge size="sm" :color="product.status?.toLowerCase() === 'новий' ? 'warning' : 'primary'">
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

    <!-- Bottom Action Bar (Profile Only) -->
    <div v-if="showStatusActions" class="p-3 pt-0 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30 flex flex-col gap-2">
      <p class="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-0 mt-3">Статус оголошення</p>
      
      <UDropdownMenu :items="actionItems" class="w-full">
        <UButton
          color="neutral"
          variant="soft"
          block
          class="justify-between bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 h-9 rounded-lg"
        >
          <template #leading>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" :class="statusIndicatorColor"></span>
              <span class="font-medium text-neutral-700 dark:text-neutral-200">{{ statusLabel }}</span>
            </div>
          </template>
          <template #trailing>
            <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-neutral-400" />
          </template>
        </UButton>
      </UDropdownMenu>
    </div>
  </div>
</template>
