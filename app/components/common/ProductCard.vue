<script setup lang="ts">
import type { Product } from "~/types/index";
import { useStorage, useClipboard } from "@vueuse/core";
import { getDistance } from "geolib";
import { LISTING_DURATION_DAYS, LISTING_RETENTION_DAYS } from "~/constants/listing";

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
  (e: 'renew', id: string | number): void;
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
    const time = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    return `Сьогодні, ${time}`;
  }
  
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
});

const shortAddress = computed(() => {
  return props.product?.location?.address || props.product?.address || '';
});

const isSold = computed(() => props.product.listing_state === 'sold');
const isDeactivated = computed(() => props.product.listing_state === 'deactivated');
const isModeration = computed(() => props.product.listing_state === 'moderation');
const isRejected = computed(() => props.product.listing_state === 'rejected');
const isExpired = computed(() => {
  if (isSold.value || isDeactivated.value || isModeration.value || isRejected.value) return false;
  if (!props.product.expires_at) return false;
  return new Date(props.product.expires_at).getTime() <= Date.now();
});
const isActive = computed(() => {
  return (!props.product.listing_state || props.product.listing_state === 'active') && !isExpired.value;
});

const isInactive = computed(() => isExpired.value || isDeactivated.value || isRejected.value);

const daysRemaining = computed(() => {
  if (!props.product.expires_at) return null;
  const diffMs = new Date(props.product.expires_at).getTime() - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

const daysUntilPermanentDelete = computed(() => {
  if (!isInactive.value && !isSold.value) return null;
  const now = Date.now();
  let baseTime: number;

  if (isExpired.value && props.product.expires_at) {
    // Якщо термін вийшов природно — відлік 45 днів від дати завершення терміну
    baseTime = new Date(props.product.expires_at).getTime();
  } else if (props.product.updated_at) {
    // Якщо приховано/відхилено — відлік 45 днів від дати деактивації
    baseTime = new Date(props.product.updated_at).getTime();
  } else {
    // Якщо щойно деактивовано або немає updated_at — відлік 45 днів від сьогодні
    baseTime = now;
  }

  const deleteTime = baseTime + (LISTING_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const diffMs = deleteTime - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

const { copy } = useClipboard();

const copyLink = async () => {
  try {
    const url = `${window.location.origin}/catalog/${props.product.id}`;
    await copy(url);
    toast.add({ title: 'Посилання скопійовано', color: 'success' });
  } catch (e) {
    toast.add({ title: 'Помилка копіювання', color: 'error' });
  }
};

const statusLabel = computed(() => {
  if (isSold.value) return 'Продано';
  if (isModeration.value) return 'На модерації';
  if (isRejected.value) return 'Відхилено';
  if (isExpired.value) return 'Термін вийшов';
  if (isDeactivated.value) return 'Приховано';
  return 'Активне';
});

const statusIndicatorColor = computed(() => {
  if (isSold.value) return 'bg-purple-500';
  if (isModeration.value) return 'bg-amber-500';
  if (isRejected.value) return 'bg-rose-500';
  if (isExpired.value) return 'bg-rose-400';
  if (isDeactivated.value) return 'bg-gray-400';
  return 'bg-green-500';
});

const actionItems = computed(() => {
  if (isRejected.value) {
    return [
      [
        {
          label: 'Редагувати',
          icon: 'i-heroicons-pencil',
          onSelect: () => emit('edit', props.product.id)
        }
      ]
    ];
  } else if (isExpired.value) {
    return [
      [
        {
          label: `Продовжити на ${LISTING_DURATION_DAYS} днів`,
          icon: 'i-heroicons-arrow-path',
          onSelect: () => emit('renew', props.product.id)
        },
        {
          label: 'Позначити проданим',
          icon: 'i-heroicons-check-circle',
          onSelect: () => emit('updateState', props.product.id, 'sold')
        },
        {
          label: 'Редагувати',
          icon: 'i-heroicons-pencil',
          onSelect: () => emit('edit', props.product.id)
        }
      ]
    ];
  } else if (isActive.value) {
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
    ];
  } else if (isSold.value) {
    return [
      [
        {
          label: 'Активувати',
          icon: 'i-heroicons-play',
          onSelect: () => emit('updateState', props.product.id, 'active')
        }
      ]
    ];
  } else {
    // deactivated
    return [
      [
        {
          label: 'Активувати',
          icon: 'i-heroicons-play',
          onSelect: () => emit('updateState', props.product.id, 'active')
        },
        {
          label: 'Редагувати',
          icon: 'i-heroicons-pencil',
          onSelect: () => emit('edit', props.product.id)
        }
      ]
    ];
  }
});
</script>

<template>
  <div class="relative group flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-neutral-800 h-full">
    <NuxtLink
      :to="`/catalog/${product.id}`"
      :id="`product-${product.id}`"
      class="flex flex-col flex-1"
      :class="{ 'opacity-60 grayscale-30': isSold || isDeactivated || isExpired || isRejected }"
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
        
        <!-- Unified Overlay Badges -->
        <div
          v-if="isSold || isDeactivated || isExpired || isModeration || isRejected"
          class="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-10 p-3 pointer-events-none"
        >
          <!-- 1. Продано -->
          <span
            v-if="isSold"
            class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-lg flex items-center gap-1.5 border border-white/20 bg-neutral-900/90 text-white"
          >
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-400" />
            Продано
          </span>

          <!-- 2. Приховано -->
          <span
            v-else-if="isDeactivated"
            class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-lg flex items-center gap-1.5 border border-white/20 bg-neutral-800/90 text-neutral-200"
          >
            <UIcon name="i-heroicons-eye-slash" class="w-4 h-4 text-neutral-400" />
            Приховано
          </span>

          <!-- 3. Термін вийшов -->
          <span
            v-else-if="isExpired"
            class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-lg flex items-center gap-1.5 border border-white/25 bg-rose-600/90 text-white"
          >
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-white" />
            Термін вийшов
          </span>

          <!-- 4. На модерації -->
          <span
            v-else-if="isModeration"
            class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-lg flex items-center gap-1.5 border border-white/25 bg-amber-600/90 text-white"
          >
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-white" />
            На модерації
          </span>

          <!-- 5. Відхилено -->
          <span
            v-else-if="isRejected"
            class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-lg flex items-center gap-1.5 border border-white/25 bg-red-600/90 text-white"
          >
            <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-white" />
            Відхилено
          </span>
        </div>

        <div v-if="props.showMapButton" class="absolute top-2 right-2 z-10">
          <button
            type="button"
            class="flex flex-col items-center justify-center bg-brand-400 hover:bg-brand-500 text-white rounded-lg px-1.5 py-1 shadow-md transition-all active:scale-95 cursor-pointer"
            title="На мапі"
            aria-label="На мапі"
            @click.prevent="emit('mapClick', product)"
          >
            <UIcon name="i-heroicons-map" class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span class="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5 tracking-tight">На мапі</span>
          </button>
        </div>

        <!-- Quick Edit Button (Profile View, not shown for Sold or Moderation) -->
        <div v-else-if="props.showStatusActions && !isSold && !isModeration" class="absolute top-2 right-2 z-20">
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 dark:bg-neutral-800/95 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-md backdrop-blur-sm border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Редагувати оголошення"
            aria-label="Редагувати оголошення"
            @click.prevent.stop="emit('edit', product.id)"
          >
            <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </button>
        </div>
        <div class="absolute top-2 left-2 z-10 max-w-[calc(100%-48px)]">
          <UBadge
            size="xs"
            :color="product.status?.toLowerCase() === 'новий' ? 'success' : 'warning'"
            variant="solid"
            class="font-semibold shadow-sm text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 truncate"
          >
            {{ product.status?.toLowerCase() === 'новий' ? 'Новий' : 'Відкритий / б/в' }}
          </UBadge>
        </div>
      </div>

      <div class="p-3 sm:p-4 flex flex-col flex-1">
        <h3
          class="font-semibold text-sm sm:text-base line-clamp-2 text-neutral-900 dark:text-white mb-2 h-10 sm:h-12"
        >
          {{ product.title }}
        </h3>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2 mt-1">
          <div class="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            <UIcon name="i-heroicons-cube" class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-neutral-400" />
            <span class="font-medium truncate">{{ product.quantity }} {{ product.unit || 'шт' }}</span>
          </div>
          <div class="flex items-baseline gap-1 text-left sm:text-right">
            <template v-if="product.is_free || product.price === 0">
              <span class="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                Даром
              </span>
            </template>
            <template v-else>
              <span
                class="text-base sm:text-xl font-bold text-green-600 dark:text-green-400 leading-tight"
              >
                {{ formattedPrice }}
              </span>
              <span
                class="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 font-public whitespace-nowrap"
              >
                грн / {{ product.unit || 'шт' }}
              </span>
            </template>
          </div>
        </div>

        <div class="flex items-start gap-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-neutral-400 mt-0.5" />
          <div class="flex flex-col">
            <span class="font-medium leading-snug line-clamp-2">{{ shortAddress }}</span>
            <span v-if="product.is_exact_location === false" class="text-[10px] sm:text-xs text-brand-500 mt-0.5 italic">Товар знаходиться десь у цьому районі</span>
          </div>
        </div>

        <div class="mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <div
            v-if="realDistance !== null"
            class="shrink-0 whitespace-nowrap flex items-center gap-1 font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs"
          >
            <UIcon name="i-heroicons-arrows-right-left" class="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>{{ realDistance }} км</span>
          </div>
          <div v-else></div>
          <span class="shrink-0 ml-auto whitespace-nowrap text-right text-[10px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {{ formattedDate }}
          </span>
        </div>
      </div>
    </NuxtLink>

    <!-- Bottom Action Bar (Profile Only) -->
    <div v-if="showStatusActions" class="p-3 pt-0 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30 flex flex-col gap-2">
      <div class="mb-0 mt-3">
        <p class="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Статус оголошення</p>
      </div>

      <!-- Quick Actions for Inactive Listings -->
      <UButton
        v-if="isExpired"
        color="primary"
        icon="i-heroicons-arrow-path"
        block
        size="sm"
        class="font-semibold shadow-sm"
        @click="emit('renew', product.id)"
      >
        Продовжити на {{ LISTING_DURATION_DAYS }} днів
      </UButton>

      <UButton
        v-else-if="isDeactivated"
        color="primary"
        variant="solid"
        icon="i-heroicons-play"
        block
        size="sm"
        class="font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
        @click="emit('updateState', product.id, 'active')"
      >
        Активувати оголошення
      </UButton>

      <UButton
        v-else-if="isRejected"
        color="warning"
        variant="soft"
        icon="i-heroicons-pencil-square"
        block
        size="sm"
        class="font-semibold shadow-sm"
        @click="emit('edit', product.id)"
      >
        Виправити та переподати
      </UButton>
      
      <!-- Якщо на модерації — показуємо інформаційний статус без випадайки дій -->
      <div
        v-if="isModeration"
        class="flex items-center justify-between bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 h-9 px-3 rounded-lg text-sm shadow-xs"
      >
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span class="font-medium text-neutral-700 dark:text-neutral-200">{{ statusLabel }}</span>
        </div>
        <UIcon name="i-heroicons-clock" class="w-4 h-4 text-amber-500 shrink-0" />
      </div>

      <!-- Якщо відхилено — показуємо інформаційний статус без зайвої випадайки -->
      <div
        v-else-if="isRejected"
        class="flex items-center justify-between bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 h-9 px-3 rounded-lg text-sm shadow-xs"
      >
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span class="font-medium text-neutral-700 dark:text-neutral-200">{{ statusLabel }}</span>
        </div>
        <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-rose-500 shrink-0" />
      </div>

      <UDropdownMenu v-else :items="actionItems" class="w-full">
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

      <!-- Status Countdown / Notice underneath dropdown -->
      <p v-if="isActive && daysRemaining !== null" class="text-[10px] text-center text-brand-600 dark:text-brand-400 font-medium">
        Активне ще {{ daysRemaining }} дн.
      </p>
      <p v-else-if="isSold && daysUntilPermanentDelete !== null" class="text-[10px] text-center text-neutral-400 dark:text-neutral-500 font-medium">
        В історії ще {{ daysUntilPermanentDelete }} дн.
      </p>
      <p v-else-if="isInactive && daysUntilPermanentDelete !== null" class="text-[10px] text-center text-rose-500 font-medium">
        Буде видалено через {{ daysUntilPermanentDelete }} дн.
      </p>
    </div>
  </div>
</template>
