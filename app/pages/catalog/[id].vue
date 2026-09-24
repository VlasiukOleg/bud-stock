<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <UContainer class="py-6">
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-heroicons-arrow-left-20-solid"
        class="mb-4"
        @click="router.back()"
      >
        Назад
      </UButton>

      <div v-if="pending" class="flex flex-col items-center justify-center py-32 text-brand-500">
        <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin mb-4" />
        <p class="font-medium animate-pulse">Завантаження деталей...</p>
      </div>

      <div v-else-if="product" class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <UCard>
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
              class="p-4 flex gap-2 overflow-x-auto scrollbar-hide"
            >
              <button
                v-for="(image, index) in product.images"
                :key="index"
                @click="currentImageIndex = Number(index)"
                :class="[
                  'shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
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
                <h3 class="font-semibold mb-2">Опис</h3>
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
                      Кількість
                    </div>
                    <div class="font-medium">
                      {{ product.quantity }} {{ product.unit }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-5 h-5 flex items-center justify-center">
                    <div
                      class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    ></div>
                  </div>
                  <div>
                    <div
                      class="text-[11px] uppercase tracking-wider text-neutral-500 font-bold"
                    >
                      Стан
                    </div>
                    <div class="font-medium capitalize">
                      {{ product.status }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-truck-20-solid"
                    class="w-5 h-5 text-neutral-400"
                  />
                  <div>
                    <div
                      class="text-[11px] uppercase tracking-wider text-neutral-500 font-bold"
                    >
                      Доставка
                    </div>
                    <div class="font-medium">{{ product.delivery }}</div>
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
                      Перегляди
                    </div>
                    <div class="font-medium">{{ product.views }}</div>
                  </div>
                </div>
              </div>

              <UAlert
                v-if="product.deliveryDetails"
                icon="i-heroicons-information-circle-20-solid"
                color="primary"
                variant="soft"
                :title="'Умови доставки'"
                :description="product.deliveryDetails"
              />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold flex items-center gap-2">
                <UIcon
                  name="i-heroicons-map-pin-20-solid"
                  class="text-brand-500"
                />
                Розташування
              </h3>
              <UButton
                variant="link"
                color="primary"
                icon="i-heroicons-arrow-top-right-on-square-20-solid"
                @click="() => { isOpenMapDrawer = true }"
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
                    class="flex-1 rounded-xl overflow-hidden border border-neutral-200"
                  >
                    <LMap
                      :zoom="15"
                      :center="[product.location.lat, product.location.lng]"
                    >
                      <LTileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LMarker
                        :lat-lng="[product.location.lat, product.location.lng]"
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
                  :lat-lng="[product.location.lat, product.location.lng]"
                >
                  <LIcon
                    :icon-size="[60, 40]"
                    :icon-anchor="[20, 40]"
                    class-name="bg-transparent"
                  >
                    <div
                      class="bg-brand-500 text-white p-1 rounded-lg text-xs text-center whitespace-nowrap border-2 border-white"
                    >
                      {{ product.price }} ₴
                    </div>
                  </LIcon>
                </LMarker>
              </LMap>
            </div>
          </UCard>
        </div>

        <div class="space-y-4">
          <div class="sticky top-6 space-y-4">
            <UCard shadow="md">
              <div class="mb-4">
                <div
                  class="text-3xl font-black text-brand-600 dark:text-brand-400"
                >
                  {{ product.price }} ₴
                </div>
                <div class="text-sm text-neutral-500">
                  за {{ product.unit }}
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
                Продавець
              </h3>
              <div class="flex items-center gap-4 mb-4">
                <UAvatar
                  :src="product.sellerAvatar"
                  :alt="product.sellerName"
                  size="lg"
                  class="bg-brand-500 text-white font-bold"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-bold truncate">{{ product.sellerName }}</div>
                  <div class="flex items-center gap-1 mt-0.5">
                    <UIcon
                      name="i-heroicons-star-20-solid"
                      class="w-4 h-4 text-yellow-400"
                    />
                    <span class="text-sm font-bold">{{
                      product.sellerRating
                    }}</span>
                    <span class="text-xs text-neutral-500">({{ product.sellerReviewsCount }} відгуків)</span>
                  </div>
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
                      : 'i-heroicons-device-phone-mobile-20-solid'
                  "
                  @click="() => { if(product.canSeePhone) showPhone = !showPhone }"
                  :disabled="!product.canSeePhone"
                >
                  {{ !product.canSeePhone ? "Телефон приховано" : (showPhone ? product.sellerPhone : "Показати телефон") }}
                </UButton>

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
                />
              </div>
            </UCard>

            <UButton
              variant="ghost"
              icon="i-heroicons-flag-20-solid"
              label="Поскаржитись на оголошення"
              block
              class="text-xs opacity-60 hover:opacity-100 transition-opacity"
            />
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
        <UButton to="/catalog" color="primary">Повернутися до каталогу</UButton>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { CATEGORY_DATA } from '~/constants/category/category';

const nuxtApp = useNuxtApp();
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<any>();

const currentImageIndex = ref(0);
const showPhone = ref(false);
const isOpenMapDrawer = ref(false);

const currentUser = useSupabaseUser();

const { data: product, pending } = useAsyncData(
  `product-${route.params.id}`, 
  async () => {
    const { data: listingData, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', route.params.id)
      .single();
      
    if (error || !listingData) return null;
    
    // Отримуємо профіль продавця через нашу нову View
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', listingData.user_id)
      .single();
      
    const isOwner = currentUser.value?.id === listingData.user_id;
    const canSeePhone = profileData?.is_phone_public || isOwner;
    
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
      sellerAvatar: profileData?.avatar_url || null,
      sellerPhone: canSeePhone ? (profileData?.phone || "Не вказано") : "Приховано",
      canSeePhone,
      sellerRating: 5.0,
      sellerReviewsCount: 0,
      category: getCategoryName(listingData.category_id)
    };
  },
  {
    getCachedData(key) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    }
  }
);

const googleMapsUrl = computed(() => {
  if (!product.value?.location) return "";

  const { lat, lng } = product.value.location;

  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
});

// SEO Мета-теги
useSeoMeta({
  title: () =>
    product.value ? `${product.value.title} | BudStock` : "Товар не знайдено",
  description: () => product.value?.description,
});
</script>
