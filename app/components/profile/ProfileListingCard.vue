<script setup lang="ts">
import type { Product } from '~/types/index';
import { LISTING_DURATION_DAYS, LISTING_RETENTION_DAYS } from '~/constants/listing';
import { useClipboard } from '@vueuse/core';

const props = withDefaults(defineProps<{
  product: Product;
  isRenewing?: boolean;
}>(), {
  isRenewing: false
});

const emit = defineEmits<{
  (e: 'delete', id: string | number): void;
  (e: 'updateState', id: string | number, newState: 'active' | 'sold' | 'deactivated'): void;
  (e: 'renew', id: string | number): void;
  (e: 'edit', id: string | number): void;
}>();

const toast = useToast();
const router = useRouter();
const { copy } = useClipboard();

// Форматування ціни
const formattedPrice = computed(() => {
  return new Intl.NumberFormat('uk-UA').format(props.product.price);
});

// Дата створення: "22 жовт."
const formattedDate = computed(() => {
  if (!props.product.created_at) return '';
  const date = new Date(props.product.created_at);
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
});

// Термін закінчення: "17 листопада"
const expiresFormatted = computed(() => {
  if (!props.product.expires_at) return '';
  const date = new Date(props.product.expires_at);
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
});

const shortAddress = computed(() => {
  return props.product?.location?.address || props.product?.address || '';
});

// Статуси
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

// Залишок днів активності
const daysRemaining = computed(() => {
  if (!props.product.expires_at) return null;
  const diffMs = new Date(props.product.expires_at).getTime() - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

// Раннє продовження (<= 5 днів до завершення для активних товарів)
const isExpiringSoon = computed(() => {
  return isActive.value && daysRemaining.value !== null && daysRemaining.value <= 5;
});

const expiringSoonText = computed(() => {
  if (daysRemaining.value === null) return '';
  const expiresDate = props.product.expires_at ? new Date(props.product.expires_at) : null;
  const isToday = expiresDate && expiresDate.toDateString() === new Date().toDateString();
  if (isToday || daysRemaining.value === 0) {
    return 'Термін спливає сьогодні!';
  }
  return `Термін спливає через ${daysRemaining.value} ${daysText(daysRemaining.value)}`;
});


// Скільки днів до остаточного видалення (45 днів)
const daysUntilPermanentDelete = computed(() => {
  if (!isInactive.value && !isSold.value) return null;
  const now = Date.now();
  let baseTime: number;

  if (isExpired.value && props.product.expires_at) {
    baseTime = new Date(props.product.expires_at).getTime();
  } else if (props.product.updated_at) {
    baseTime = new Date(props.product.updated_at).getTime();
  } else {
    baseTime = now;
  }

  const deleteTime = baseTime + (LISTING_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const diffMs = deleteTime - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

const daysText = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дні';
  return 'днів';
};

// Чати для цього товару
const { activeChats } = useChat();
const chatsCount = computed(() => {
  if (!activeChats.value) return 0;
  return activeChats.value.filter(c => String(c.product_id || c.product?.id) === String(props.product.id)).length;
});

// Копіювання посилання
const copyLink = async () => {
  try {
    const url = `${window.location.origin}/catalog/${props.product.id}`;
    await copy(url);
    toast.add({ title: 'Посилання скопійовано', color: 'success' });
  } catch (e) {
    toast.add({ title: 'Помилка копіювання', color: 'error' });
  }
};

// Дії в правому кутку (трикрапка)
const menuActions = computed(() => {
  const items: any[] = [
    [
      {
        label: 'Переглянути в каталозі',
        icon: 'i-heroicons-arrow-top-right-on-square',
        onSelect: () => router.push(`/catalog/${props.product.id}`)
      },
      {
        label: 'Скопіювати посилання',
        icon: 'i-heroicons-document-duplicate',
        onSelect: () => copyLink()
      }
    ]
  ];

  if (isActive.value) {
    items[0].unshift({
      label: 'Редагувати оголошення',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => emit('edit', props.product.id)
    });
    if (isExpiringSoon.value) {
      items[0].push({
        label: `Продовжити на ${LISTING_DURATION_DAYS} днів`,
        icon: 'i-heroicons-arrow-path',
        onSelect: () => emit('renew', props.product.id)
      });
    }
    items.push([
      {
        label: 'Позначити проданим',
        icon: 'i-heroicons-check-circle',
        onSelect: () => emit('updateState', props.product.id, 'sold')
      },
      {
        label: 'Деактивувати (приховати)',
        icon: 'i-heroicons-pause',
        onSelect: () => emit('updateState', props.product.id, 'deactivated')
      }
    ]);
  } else if (isDeactivated.value || isSold.value) {
    items.push([
      {
        label: 'Активувати',
        icon: 'i-heroicons-play',
        onSelect: () => emit('updateState', props.product.id, 'active')
      }
    ]);
  }

  return items;
});

// Опції зміни статусу з випадайки внизу
const activeStatusDropdown = computed(() => [
  [
    {
      label: 'Позначити проданим',
      icon: 'i-heroicons-check-circle',
      onSelect: () => emit('updateState', props.product.id, 'sold')
    },
    {
      label: 'Деактивувати (приховати)',
      icon: 'i-heroicons-pause',
      onSelect: () => emit('updateState', props.product.id, 'deactivated')
    }
  ]
]);

const deactivatedStatusDropdown = computed(() => [
  [
    {
      label: 'Активувати оголошення',
      icon: 'i-heroicons-play',
      onSelect: () => emit('updateState', props.product.id, 'active')
    }
  ]
]);
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 border-t-[3px] border-t-brand-400 dark:border-t-brand-400 rounded-2xl p-4 shadow-[0_4px_18px_-2px_rgba(0,0,0,0.07)] dark:shadow-none hover:shadow-md transition-all flex flex-col justify-between">
    <!-- 1. Верхній рядок: Фото + Основна інформація -->
    <div class="flex items-start gap-3.5">
      <!-- Квадратне фото товару -->
      <NuxtLink
        :to="`/catalog/${product.id}`"
        class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group"
      >
        <img
          v-if="product.images && product.images.length > 0"
          :src="product.images[0]"
          :alt="product.title"
          class="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
        />
        <UIcon v-else name="i-heroicons-photo" class="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
      </NuxtLink>

      <!-- Текстова інформація справа від фото -->
      <div class="flex-1 min-w-0 flex flex-col justify-between self-stretch">
        <!-- Назва та трикрапка дій -->
        <div class="flex items-start justify-between gap-1">
          <NuxtLink
            :to="`/catalog/${product.id}`"
            class="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-2 leading-snug hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {{ product.title }}
          </NuxtLink>

          <!-- Меню додаткових дій (Фірмовий м'який кружечок) -->
          <UDropdownMenu :items="menuActions" :content="{ align: 'end' }">
            <button
              type="button"
              class="rounded-full w-7 h-7 p-0 flex items-center justify-center shrink-0 -mr-1 -mt-1 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 dark:text-brand-400 cursor-pointer transition-colors shadow-2xs"
              aria-label="Меню оголошення"
              title="Додаткові дії"
            >
              <UIcon name="i-heroicons-ellipsis-vertical" class="w-4 h-4" />
            </button>
          </UDropdownMenu>
        </div>

        <!-- Ціна та кількість -->
        <div class="flex items-center justify-between gap-2 mt-1">
          <div class="flex items-baseline gap-1">
            <span class="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {{ formattedPrice }}
            </span>
            <span class="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              грн / {{ product.unit || 'шт' }}
            </span>
          </div>
          <div v-if="product.quantity" class="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">
            <UIcon name="i-heroicons-cube" class="w-3.5 h-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
            <span>{{ product.quantity }} {{ product.unit || 'шт' }}</span>
          </div>
        </div>

        <!-- Адреса та дата -->
        <div class="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 gap-2">
          <span class="truncate">
            {{ shortAddress || 'Київ' }}
          </span>
          <span class="shrink-0 text-[10px] text-neutral-400 whitespace-nowrap">
            {{ formattedDate }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Панель показників (Метрики: Перегляди, Чати, Телефон, Обране) -->
    <div class="bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl py-2.5 px-3 sm:px-4 flex items-center justify-between shadow-xs my-3">
      <!-- 1. Перегляди -->
      <div class="flex items-center gap-1.5" title="Кількість переглядів оголошення">
        <UIcon name="i-heroicons-eye" class="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
        <span class="text-xs sm:text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100">{{ product.views || 0 }}</span>
      </div>

      <span class="h-3.5 w-px bg-neutral-200 dark:bg-neutral-700"></span>

      <!-- 2. Чати -->
      <NuxtLink
        to="/profile/chats"
        class="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer group"
        title="Повідомлення по цьому товару"
      >
        <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:scale-110 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-all shrink-0" />
        <span class="text-xs sm:text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100">{{ chatsCount }}</span>
      </NuxtLink>

      <span class="h-3.5 w-px bg-neutral-200 dark:bg-neutral-700"></span>

      <!-- 3. Дзвінки / Контакти -->
      <div class="flex items-center gap-1.5" title="Кількість переглядів номера телефону">
        <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
        <span class="text-xs sm:text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100">{{ product.phone_views || 0 }}</span>
      </div>

      <span class="h-3.5 w-px bg-neutral-200 dark:bg-neutral-700"></span>

      <!-- 4. В обраному -->
      <div class="flex items-center gap-1.5" title="Додано в обране">
        <UIcon name="i-heroicons-heart" class="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
        <span class="text-xs sm:text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100">{{ (product as any).favorites_count || 0 }}</span>
      </div>
    </div>

    <!-- 3. Головна кнопка дії -->
    <div class="mb-3">
      <!-- Відхилені -->
      <UButton
        v-if="isRejected"
        color="neutral"
        variant="outline"
        icon="i-heroicons-pencil-square"
        block
        size="sm"
        class="font-semibold shadow-xs justify-center rounded-xl py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
        @click="emit('edit', product.id)"
      >
        Виправити та переподати
      </UButton>

      <!-- Закінчився термін -->
      <UButton
        v-else-if="isExpired"
        color="neutral"
        variant="outline"
        icon="i-heroicons-arrow-path"
        :loading="isRenewing"
        block
        size="sm"
        class="font-semibold shadow-xs justify-center rounded-xl py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
        @click="emit('renew', product.id)"
      >
        Продовжити на {{ LISTING_DURATION_DAYS }} днів
      </UButton>

      <!-- Продано -->
      <UButton
        v-else-if="isSold"
        color="neutral"
        variant="outline"
        icon="i-heroicons-arrow-path"
        block
        size="sm"
        class="font-semibold shadow-xs justify-center rounded-xl py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
        @click="emit('updateState', product.id, 'active')"
      >
        Повернути у продаж (Активувати)
      </UButton>

      <!-- На модерації (інформативна нейтральна плашка) -->
      <div
        v-else-if="isModeration"
        class="py-2 px-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-2"
      >
        <UIcon name="i-heroicons-clock" class="w-4 h-4 text-neutral-400 dark:text-neutral-500 animate-spin" />
        <span class="font-medium">Очікує перевірки модератором</span>
      </div>

      <!-- Активні з раннім продовженням (<= 5 днів до закінчення) -->
      <div v-else-if="isExpiringSoon" class="flex items-center gap-2">
        <UButton
          color="warning"
          variant="solid"
          icon="i-heroicons-arrow-path"
          :loading="isRenewing"
          size="sm"
          class="flex-1 font-semibold shadow-xs justify-center rounded-xl py-2 cursor-pointer"
          @click="emit('renew', product.id)"
        >
          Продовжити на {{ LISTING_DURATION_DAYS }} днів
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-heroicons-pencil-square"
          size="sm"
          class="shrink-0 font-semibold shadow-xs justify-center rounded-xl py-2 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
          title="Редагувати оголошення"
          aria-label="Редагувати оголошення"
          @click="emit('edit', product.id)"
        />
      </div>

      <!-- Звичайні активні або деактивовані: Кнопка "Редагувати оголошення" -->
      <UButton
        v-else
        color="neutral"
        variant="outline"
        icon="i-heroicons-pencil-square"
        block
        size="sm"
        class="font-semibold shadow-xs justify-center rounded-xl py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
        @click="emit('edit', product.id)"
      >
        Редагувати оголошення
      </UButton>
    </div>

    <!-- 4. Нижня смуга: Статус ліворуч та Термін розміщення праворуч -->
    <div class="flex items-center justify-between pt-2.5 border-t border-neutral-100 dark:border-neutral-800 min-h-10.5">
      <!-- Ліворуч: Статус товару -->
      <div class="flex items-center">
        <!-- Активне (з дропдауном дій) -->
        <template v-if="isActive">
          <UDropdownMenu :items="activeStatusDropdown" :content="{ align: 'start' }">
            <button
              type="button"
              class="flex items-center gap-2 text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer group py-1"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span>Активне</span>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors" />
            </button>
          </UDropdownMenu>
        </template>

        <!-- На модерації -->
        <template v-else-if="isModeration">
          <div class="flex items-center gap-2 text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 py-1">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span>На перевірці</span>
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-amber-500" />
          </div>
        </template>

        <!-- Відхилено -->
        <template v-else-if="isRejected">
          <div class="flex items-center gap-2 text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 py-1">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span>Відхилено</span>
            <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-rose-500" />
          </div>
        </template>

        <!-- Продано -->
        <template v-else-if="isSold">
          <div class="flex items-center gap-2 text-sm sm:text-base font-bold text-purple-600 dark:text-purple-400 py-1">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
            <span>Продано</span>
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-purple-500" />
          </div>
        </template>

        <!-- Приховано (деактивовано) -->
        <template v-else-if="isDeactivated">
          <UDropdownMenu :items="deactivatedStatusDropdown" :content="{ align: 'start' }">
            <button
              type="button"
              class="flex items-center gap-2 text-sm sm:text-base font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer group py-1"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0"></span>
              <span>Приховано</span>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
            </button>
          </UDropdownMenu>
        </template>

        <!-- Термін вийшов -->
        <template v-else-if="isExpired">
          <div class="flex items-center gap-2 text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 py-1">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span>Термін вийшов</span>
          </div>
        </template>
      </div>

      <!-- Праворуч: Дата та лічильник днів -->
      <div class="text-right">
        <!-- Якщо активне: До 17 листопада + Ще 25 днів / Термін спливає -->
        <template v-if="isActive">
          <p v-if="expiresFormatted" class="text-xs text-neutral-600 dark:text-neutral-300 flex items-center justify-end gap-1 font-medium">
            <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-neutral-400" />
            <span>До {{ expiresFormatted }}</span>
          </p>
          <p
            v-if="daysRemaining !== null"
            class="text-xs font-bold mt-0.5 flex items-center justify-end gap-1"
            :class="isExpiringSoon ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-brand-500'"
          >
            <UIcon v-if="isExpiringSoon" name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>{{ isExpiringSoon ? expiringSoonText : `Ще ${daysRemaining} ${daysText(daysRemaining)}` }}</span>
          </p>
        </template>

        <!-- Якщо неактивне/продане/відхилене: Відлік до видалення з бази (45 днів) -->
        <template v-else-if="daysUntilPermanentDelete !== null">
          <p class="text-xs font-bold text-rose-500">
            Видалення через {{ daysUntilPermanentDelete }} дн.
          </p>
          <p class="text-[10px] text-neutral-400 mt-0.5">Зберігається 45 днів</p>
        </template>
      </div>
    </div>
  </div>
</template>
