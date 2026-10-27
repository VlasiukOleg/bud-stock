<template>
  <div class="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <UContainer class="flex-1 w-full pt-2 sm:pt-4 pb-22 sm:pb-24 lg:pb-8 flex flex-col">
      <!-- Завантаження (Скелетон сторінки товару) -->
      <CatalogProductDetailsSkeleton v-if="pending" />

      <!-- Повна заглушка для неактивних / проданих оголошень для сторонніх користувачів -->
      <div v-else-if="product && !canViewFullDetails" class="max-w-sm w-full mx-auto my-auto px-2">
        <UCard class="text-center p-4 sm:p-5 shadow-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900">
          <div 
            class="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
            :class="isSold ? 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' : 'bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400'"
          >
            <UIcon :name="isSold ? 'i-heroicons-check-badge' : 'i-heroicons-archive-box-x-mark'" class="w-6 h-6" />
          </div>

          <h2 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-1.5">
            {{ isSold ? 'Товар уже продано' : 'Оголошення більше не актуальне' }}
          </h2>

          <p class="text-neutral-500 dark:text-neutral-400 text-xs max-w-xs mx-auto mb-4 leading-relaxed">
            <template v-if="isSold">
              Це оголошення позначено як продане і більше не доступне для покупки.
            </template>
            <template v-else>
              Продавець призупинив публікацію або завершився термін дії оголошення.
            </template>
          </p>

          <div class="flex flex-col gap-2 w-full max-w-xs mx-auto">
            <UButton
              to="/catalog"
              color="primary"
              size="sm"
              block
              icon="i-heroicons-arrow-left-20-solid"
              class="font-bold rounded-lg justify-center py-2"
            >
              Перейти до каталогу
            </UButton>

            <UButton
              v-if="product.category_id"
              :to="`/catalog?category=${product.category_id}`"
              variant="soft"
              color="neutral"
              size="sm"
              block
              icon="i-heroicons-squares-2x2-20-solid"
              class="font-medium rounded-lg justify-center py-2"
            >
              Інші товари у цій категорії
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Повний перегляд товару (для активних або для автора) -->
      <div v-else-if="product">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-left-20-solid"
          class="mb-3 sm:mb-4 self-start"
          @click="router.back()"
        >
          {{ $t('catalog.backBtn') }}
        </UButton>

        <!-- Банери статусів для автора при неактивному товарі -->
        <div v-if="isInactive" class="mb-6 space-y-3">
          <!-- На модерації -->
          <div v-if="isModeration" class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-clock" class="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h4 class="font-bold text-sm">Оголошення на ручній модерації</h4>
                <p class="text-xs text-amber-700 dark:text-amber-300">Оголошення приховане з публічного пошуку та очікує перевірки адміністратором.</p>
              </div>
            </div>
            <UButton
              v-if="isAdmin"
              to="/admin/moderation"
              color="warning"
              variant="soft"
              size="sm"
              icon="i-heroicons-shield-check"
              class="self-start sm:self-auto shrink-0 font-medium"
            >
              До модерації
            </UButton>
          </div>

          <!-- Відхилено -->
          <div v-else-if="isRejected" class="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-center gap-3 text-red-800 dark:text-red-200">
            <UIcon name="i-heroicons-x-circle" class="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h4 class="font-bold text-sm">Оголошення відхилено</h4>
              <p class="text-xs text-red-700 dark:text-red-300">Фото товару не відповідає правилам або не є будівельним матеріалом.</p>
            </div>
          </div>

          <!-- Деактивовано (Приховано) -->
          <div v-else-if="isDeactivated" class="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
            <UIcon name="i-heroicons-eye-slash" class="w-6 h-6 text-neutral-500 shrink-0" />
            <div>
              <h4 class="font-bold text-sm">Оголошення приховано вами (деактивовано)</h4>
              <p class="text-xs text-neutral-600 dark:text-neutral-400">Товар прихований з пошуку і не відображається іншим користувачам.</p>
            </div>
          </div>

          <!-- Закінчився термін -->
          <div v-else-if="isExpired" class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-3 text-rose-800 dark:text-rose-200">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <h4 class="font-bold text-sm">Термін публікації оголошення завершився</h4>
              <p class="text-xs text-rose-700 dark:text-rose-300">Оголошення знято з пошуку. Ви можете продовжити його в особистому кабінеті.</p>
            </div>
          </div>

          <!-- Продано -->
          <div v-else-if="isSold" class="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
            <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-neutral-500 shrink-0" />
            <div>
              <h4 class="font-bold text-sm">Товар позначено як проданий</h4>
              <p class="text-xs text-neutral-600 dark:text-neutral-400">Оголошення завершене і зберігається в історії проданих товарів протягом 45 днів.</p>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6 min-w-0">
        <div class="lg:col-span-2 space-y-6 min-w-0">
          <UCard class="min-w-0 overflow-hidden">
            <div
              class="aspect-4/3 relative bg-neutral-100 dark:bg-neutral-800"
            >
              <img
                :src="product.images[currentImageIndex]"
                :alt="product.title"
                class="w-full h-full object-contain"
              />
              <div
                v-if="product.images.length > 1"
                class="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs"
              >
                {{ currentImageIndex + 1 }} / {{ product.images.length }}
              </div>
            </div>

            <div
              v-if="product.images.length > 1"
              class="pt-3 sm:pt-4 flex gap-2 overflow-x-auto scrollbar-hide min-w-0 max-w-full"
            >
              <button
                v-for="(image, index) in product.images"
                :key="index"
                @click="currentImageIndex = Number(index)"
                :class="[
                  'shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all',
                  currentImageIndex === Number(index)
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-transparent',
                ]"
              >
                <img :src="image" class="w-full h-full object-cover" />
              </button>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="font-bold text-xl leading-tight">
                {{ product.title }}
              </h2>
            </template>

            <div class="space-y-6">
              <div>
                <h3 class="font-semibold mb-2">{{ $t('catalog.description') }}</h3>
                <p
                  class="text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed"
                >
                  {{ product.description || "Опис відсутній" }}
                </p>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-cube-20-solid"
                    class="w-5 h-5 text-neutral-400"
                  />
                  <div>
                    <div
                      class="text-[11px] uppercase tracking-wider text-neutral-500 font-bold"
                    >
                      {{ $t('catalog.quantity') }}
                    </div>
                    <div class="font-medium">
                      {{ product.quantity }} {{ product.unit }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-5 h-5 flex items-center justify-center">
                    <div
                      class="w-2.5 h-2.5 rounded-full"
                      :class="product.status?.toLowerCase() === 'новий' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'"
                    ></div>
                  </div>
                  <div>
                    <div
                      class="text-[11px] uppercase tracking-wider text-neutral-500 font-bold"
                    >
                      {{ $t('catalog.status') }}
                    </div>
                    <div class="font-medium text-xs sm:text-sm">
                      {{ product.status?.toLowerCase() === 'новий' ? 'Новий / не використовувався' : 'Відкритий, частковий або б/в' }}
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <UIcon
                    name="i-heroicons-hand-raised-20-solid"
                    class="w-5 h-5 text-neutral-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <div
                      class="text-[11px] uppercase tracking-wider text-neutral-500 font-bold mb-1"
                    >
                      Отримання
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5">
                      <!-- Самовивіз -->
                      <UBadge
                        v-if="hasPickup"
                        color="neutral"
                        variant="subtle"
                        size="sm"
                        class="gap-1 font-medium"
                      >
                        <UIcon name="i-heroicons-home-20-solid" class="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                        <span>Самовивіз</span>
                      </UBadge>

                      <!-- Доставка -->
                      <UBadge
                        v-if="hasDelivery"
                        color="primary"
                        variant="subtle"
                        size="sm"
                        class="gap-1 font-medium"
                      >
                        <UIcon name="i-heroicons-truck-20-solid" class="w-3.5 h-3.5" />
                        <span>Доставка</span>
                      </UBadge>

                      <span v-if="!hasPickup && !hasDelivery" class="text-sm font-medium text-neutral-500">
                        {{ product.delivery || 'За домовленістю' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-eye-20-solid"
                    class="w-5 h-5 text-neutral-400"
                  />
                  <div>
                    <div
                      class="text-[11px] uppercase tracking-wider text-neutral-500 font-bold"
                    >
                      {{ $t('catalog.views') }}
                    </div>
                    <div class="font-medium">{{ product.views || 0 }}</div>
                  </div>
                </div>
              </div>

              <!-- Компактні деталі стану / залишку (якщо вказано) -->
              <div
                v-if="product.status_details"
                class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-xs"
              >
                <UIcon
                  name="i-heroicons-archive-box-20-solid"
                  class="w-4 h-4 text-amber-500 shrink-0"
                />
                <p class="text-neutral-700 dark:text-neutral-300">
                  <span class="font-semibold text-neutral-900 dark:text-white">Уточнення залишку:</span>
                  <span class="ml-1">{{ product.status_details }}</span>
                </p>
              </div>

              <!-- Компактні умови доставки -->
              <div
                v-if="deliveryDetailsText"
                class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200/50 dark:border-brand-900/40 text-xs"
              >
                <UIcon
                  name="i-heroicons-truck-20-solid"
                  class="w-4 h-4 text-brand-500 shrink-0"
                />
                <p class="text-neutral-700 dark:text-neutral-300">
                  <span class="font-semibold text-neutral-900 dark:text-white">Умови доставки:</span>
                  <span class="ml-1">{{ deliveryDetailsText }}</span>
                </p>
              </div>
            </div>
          </UCard>

          <!-- Розташування та карта на десктопі (зліва під описом) -->
          <CatalogProductLocationMap
            v-if="isDesktop"
            :product="product"
            :google-maps-url="googleMapsUrl"
          />
        </div>

        <div class="space-y-4 min-w-0">
          <div class="lg:sticky lg:top-20 space-y-4 min-w-0">
            <UCard shadow="md">
              <div v-if="product.is_free || product.price === 0" class="mb-4">
                <UBadge color="success" variant="solid" size="lg" class="text-base font-bold px-3 py-1.5">
                  Віддам даром
                </UBadge>
              </div>
              <div v-else class="mb-4">
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-black text-brand-600 dark:text-brand-400">
                    {{ Number(product.price).toLocaleString('uk-UA') }} ₴
                  </span>
                  <span class="text-sm text-neutral-500 font-medium">
                    за {{ product.unit || 'шт' }}
                  </span>
                </div>

                <!-- Розрахунок загальної ціни якщо кількість > 1 -->
                <div
                  v-if="totalPrice > 0 && Number(product.quantity) > 1"
                  class="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between"
                >
                  <span class="text-xs text-neutral-500 font-medium">
                    За весь залишок ({{ product.quantity }} {{ product.unit || 'шт' }}):
                  </span>
                  <span class="text-base font-bold text-neutral-900 dark:text-white">
                    {{ totalPrice.toLocaleString('uk-UA') }} ₴
                  </span>
                </div>
              </div>

              <UBadge color="neutral" variant="subtle" size="md">
                {{ product.category }}
              </UBadge>
            </UCard>

            <UCard>
              <h3
                class="font-semibold mb-4 text-sm uppercase tracking-widest text-neutral-500"
              >
                {{ $t('catalog.seller') }}
              </h3>
              <div class="flex items-center gap-4 mb-4">
                <CommonUserAvatar
                  :src="product.sellerAvatar"
                  :name="product.sellerName"
                  size="lg"
                  class="bg-brand-500 text-white font-bold"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-bold truncate">{{ product.sellerName }}</div>
                </div>
              </div>
              <UButton
                variant="ghost"
                color="primary"
                block
                label="Всі оголошення автора"
                :to="`/user/${product.user_id}`"
              />
            </UCard>

            <UCard>
              <div class="space-y-3">
                <UButton
                  size="xl"
                  block
                  :color="showPhone ? 'neutral' : 'primary'"
                  :variant="showPhone ? 'outline' : 'solid'"
                  :icon="
                    showPhone
                      ? 'i-heroicons-phone-20-solid'
                      : (canSeePhone ? 'i-heroicons-device-phone-mobile-20-solid' : 'i-heroicons-lock-closed-20-solid')
                  "
                  :loading="isLoadingPhone"
                  @click="togglePhone"
                  :disabled="!canSeePhone"
                >
                  <template v-if="showPhone">{{ sellerPhone }}</template>
                  <template v-else-if="canSeePhone">Показати телефон</template>
                  <template v-else-if="!currentUser">Увійдіть, щоб побачити телефон</template>
                  <template v-else>Телефон приховано продавцем</template>
                </UButton>

                <!-- Підказка для незареєстрованих -->
                <div v-if="!canSeePhone && !currentUser" class="text-[11px] text-center text-neutral-500">
                  <NuxtLink :to="APP_ROUTES.AUTH.LOGIN" class="text-primary-500 hover:underline font-medium">Зареєструйтеся</NuxtLink>
                  , щоб отримати доступ до контактів продавця
                </div>

                <p
                  v-if="showPhone"
                  class="text-[11px] text-center text-neutral-500"
                >
                  Скажіть, що знайшли оголошення на <b>BudStock</b>
                </p>

                <UButton
                  size="xl"
                  block
                  variant="soft"
                  color="neutral"
                  icon="i-heroicons-chat-bubble-left-right-20-solid"
                  label="Написати повідомлення"
                  @click="openChat(product.user_id, product.id, product)"
                  v-if="!isUserOwnerProduct"
                />
              </div>
            </UCard>

            <!-- Розташування та карта на мобілці (внизу перед поскаржитись) -->
            <CatalogProductLocationMap
              v-if="!isDesktop"
              :product="product"
              :google-maps-url="googleMapsUrl"
            />

            <UButton
              v-if="!isUserOwnerProduct"
              variant="ghost"
              icon="i-heroicons-flag-20-solid"
              label="Поскаржитись на оголошення"
              block
              class="text-xs opacity-60 hover:opacity-100 transition-opacity"
              @click="() => {isReportModalOpen = true}"
            />
          </div>
        </div>
      </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <UIcon
          name="i-heroicons-magnifying-glass-20-solid"
          class="size-12 text-neutral-300 mb-4"
        />
        <h3 class="text-xl font-bold">Оголошення не знайдено</h3>
        <p class="text-neutral-500 mb-6">
          Схоже, це оголошення вже неактивне або видалене
        </p>
        <UButton :to="APP_ROUTES.CATALOG" color="primary">Повернутися до каталогу</UButton>
      </div>
    </UContainer>
    
    <ReportModal 
      v-if="isReportModalOpen && product" 
      :listingId="String(product.id)" 
      @close="isReportModalOpen = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { useSessionStorage, useMediaQuery } from '@vueuse/core';

import { CATEGORY_DATA } from '~/constants/category/category';

const nuxtApp = useNuxtApp();
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<any>();

const isDesktop = useMediaQuery('(min-width: 1024px)');
const currentImageIndex = ref(0);
const showPhone = ref(false);
const isReportModalOpen = ref(false);

const currentUser = useSupabaseUser();
const { isAdmin } = useAdmin();
const { openChat } = useChat();
const { fetchProfile } = useProfile();
const { getListingById } = useListings();

const { data: product, pending } = useAsyncData(
  `product-${route.params.id}`, 
  async () => {
    const listingData = await getListingById(route.params.id as string);
    if (!listingData) return null;
    
    // Профіль продавця завжди свіжий: продавець міг змінити видимість телефону, ім'я чи аватар
    // (заодно оновлює кеш, який використовує чат)
    const profileData = await fetchProfile(listingData.user_id, { force: true });
      
    // Налаштування видимості потрібне лише для підказок в UI.
    // Сам номер віддає БД-функція get_seller_phone, яка перевіряє права на сервері.
    const phoneVisibility = profileData?.phone_visibility || 'hidden';

    
    const getCategoryName = (categoryId: string) => {
      if (!categoryId) return "Без категорії";
      for (const cat of CATEGORY_DATA) {
        if (cat.id === categoryId) return cat.name;
        const sub = cat.subcategories?.find((s: any) => s.id === categoryId);
        if (sub) return `${cat.name} / ${sub.name}`;
      }
      return "Без категорії";
    };
    
    return {
      ...listingData,
      images: (listingData.images?.length > 0 ? listingData.images : []) as string[],
      location: { 
        address: listingData.address || "Адреса не вказана", 
        lat: listingData.latitude || 50.45, 
        lng: listingData.longitude || 30.52 
      }, 
      sellerName: getUserDisplayName(profileData),
      sellerAvatar: getUserAvatarUrl(profileData) || null,
      phoneVisibility,
      category: getCategoryName(listingData.category_id)
    };
  }
);

const totalPrice = computed(() => {
  if (!product.value) return 0;
  if (product.value.is_free) return 0;
  const price = Number(product.value.price) || 0;
  const qty = Number(product.value.quantity) || 1;
  return price * qty;
});

const deliveryList = computed<string[]>(() => {
  if (!product.value?.delivery) return [];
  let d = product.value.delivery;
  if (typeof d === 'string') {
    try {
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [d];
    }
  }
  if (Array.isArray(d)) return d;
  return [String(d)];
});

const hasPickup = computed(() => {
  return deliveryList.value.some(item =>
    String(item).toLowerCase().includes('самовивіз') || String(item).toLowerCase().includes('pickup')
  );
});

const hasDelivery = computed(() => {
  return deliveryList.value.some(item =>
    String(item).toLowerCase().includes('доставка') || String(item).toLowerCase().includes('delivery')
  );
});

const deliveryDetailsText = computed(() => {
  return product.value?.delivery_details || product.value?.deliveryDetails || '';
});

const isUserOwnerProduct = computed(() => {
  if (!product.value || !currentUser.value) return false;
  const currentUserId = (currentUser.value as any)?.sub || (currentUser.value as any)?.id;
  return currentUserId === product.value.user_id;
});

const isSold = computed(() => product.value?.listing_state === 'sold');
const isDeactivated = computed(() => product.value?.listing_state === 'deactivated');
const isModeration = computed(() => product.value?.listing_state === 'moderation');
const isRejected = computed(() => product.value?.listing_state === 'rejected');
const isExpired = computed(() => {
  if (!product.value) return false;
  if (isSold.value || isDeactivated.value || isModeration.value || isRejected.value) return false;
  return !!product.value.expires_at && new Date(product.value.expires_at).getTime() <= Date.now();
});

const isInactive = computed(() => {
  return isSold.value || isDeactivated.value || isModeration.value || isRejected.value || isExpired.value;
});

const canViewFullDetails = computed(() => {
  if (!product.value) return false;
  // Якщо оголошення активне — бачать усі
  if (!isInactive.value) return true;
  // Автор оголошення або адміністратор мають повний доступ до деталей
  return isUserOwnerProduct.value || isAdmin.value;
});

// Реактивно обчислюємо видимість телефону, щоб вона миттєво реагувала на вхід/вихід з акаунту
const canSeePhone = computed(() => {
  if (!product.value) return false;
  
  const isLoggedIn = !!currentUser.value;
  const visibility = product.value.phoneVisibility;
  
  return isUserOwnerProduct.value
    || isAdmin.value
    || (!isInactive.value && (visibility === 'everyone' || (visibility === 'registered' && isLoggedIn)));
});

const sellerPhone = ref<string | null>(null);
const isLoadingPhone = ref(false);

// Телефон запитуємо в БД лише на клік (як на OLX).
// Функція get_seller_phone сама перевіряє phone_visibility та auth.uid(),
// тому підробити доступ з фронта неможливо.
const togglePhone = async () => {
  if (!canSeePhone.value || !product.value) return;

  if (showPhone.value) {
    showPhone.value = false;
    return;
  }

  isLoadingPhone.value = true;
  try {
    const { data, error } = await supabase.rpc('get_seller_phone', {
      p_seller_id: product.value.user_id,
    });

    if (!error && data) {
      sellerPhone.value = data;
      showPhone.value = true;
      return;
    }

    // База не віддала номер. Можливо, продавець щойно змінив видимість —
    // підтягуємо актуальне налаштування, щоб кнопка показала правильний стан.
    const freshProfile = await fetchProfile(product.value.user_id, { force: true });
    product.value.phoneVisibility = freshProfile?.phone_visibility || 'hidden';

    // Якщо доступ все ще є — значить номер просто не вказаний
    if (canSeePhone.value) {
      sellerPhone.value = "Не вказано";
      showPhone.value = true;
    }
  } finally {
    isLoadingPhone.value = false;
  }
};

// При вході/виході з акаунту скидаємо показаний номер — права могли змінитися
watch(() => (currentUser.value as any)?.sub, () => {
  showPhone.value = false;
  sellerPhone.value = null;
});

const viewedListings = useSessionStorage<string[]>('viewed_listings', []);

// Використовуємо watch замість onMounted, бо при переходах між сторінками 
// onMounted може спрацювати раніше, ніж завантажиться product
watch(product, async (newProduct) => {
  if (!newProduct) return;
  
  // Правило 1: Свої перегляди та перегляди адміна не рахуємо
  const currentUserId = (currentUser.value as any)?.sub || (currentUser.value as any)?.id;
  if (currentUserId === newProduct.user_id || isAdmin.value) return;

  // Правило 2: Для неактивних оголошень перегляди не рахуємо
  if (isInactive.value) return;

  // Правило 3: Перевіряємо sessionStorage
  const listingId = String(newProduct.id);
  
  if (!viewedListings.value.includes(listingId)) {
    const { incrementViews } = useListings();
    const success = await incrementViews(listingId);
    
    if (success) {
      // Переприсвоюємо масив для 100% гарантії, що useStorage помітить зміну
      viewedListings.value = [...viewedListings.value, listingId];
      
      // Опціонально: збільшуємо візуально для себе одразу
      if (newProduct.views !== undefined) {
        newProduct.views++;
      }
    }
  }
}, { immediate: true });

const googleMapsUrl = computed(() => {
  if (!product.value?.location) return "";

  const { lat, lng } = product.value.location;

  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
});

// SEO Мета-теги
useSeoMeta({
  title: () => {
    if (!product.value) return "Товар не знайдено | BudStock";
    if (!canViewFullDetails.value) {
      return isSold.value ? "Товар уже продано | BudStock" : "Оголошення більше не актуальне | BudStock";
    }
    return `${product.value.title} | BudStock`;
  },
  description: () => {
    if (!product.value || !canViewFullDetails.value) {
      return "Будівельні матеріали поруч на BudStock";
    }
    return product.value.description;
  },
});
</script>
