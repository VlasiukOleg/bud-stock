<script setup lang="ts">
import type { Product } from '~/types/index';
import { LISTING_DURATION_DAYS } from '~/constants/listing';
import { ADMIN_EMAILS } from '~/composables/useAdmin';

definePageMeta({
  middleware: [
    async () => {
      const user = useSupabaseUser();
      const client = useSupabaseClient();

      let email = user.value?.email?.toLowerCase();
      if (!email) {
        const { data } = await client.auth.getUser();
        email = data?.user?.email?.toLowerCase();
      }

      const isAdminUser = !!(email && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email));

      if (!isAdminUser) {
        return navigateTo('/');
      }
    }
  ]
});

const { getModerationListings, moderateListing } = useListings();
const { isAdmin } = useAdmin();
const toast = useToast();

useSeoMeta({
  title: 'Модерація оголошень | BudStock',
  description: 'Панель модерації оголошень, що очікують на перевірку'
});

const listings = ref<Product[]>([]);
const pending = ref(true);
const processingId = ref<string | number | null>(null);

const fetchListings = async () => {
  pending.value = true;
  try {
    const data = await getModerationListings();
    listings.value = data as Product[];
  } catch (err: any) {
    toast.add({
      title: 'Помилка завантаження',
      description: err.message || 'Не вдалося завантажити оголошення на модерацію',
      color: 'error'
    });
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  if (isAdmin.value) {
    fetchListings();
  }
});

const handleModerate = async (id: string | number, action: 'approve' | 'reject') => {
  processingId.value = id;
  try {
    await moderateListing(String(id), action);
    listings.value = listings.value.filter(item => item.id !== id);
    
    if (action === 'approve') {
      toast.add({
        title: 'Оголошення схвалено!',
        description: `Оголошення активовано та додано в каталог на ${LISTING_DURATION_DAYS} днів`,
        color: 'success'
      });
    } else {
      toast.add({
        title: 'Оголошення відхилено',
        description: 'Статус змінено на "Відхилено"',
        color: 'neutral'
      });
    }
    
    clearNuxtData('all-listings');
  } catch (err: any) {
    toast.add({
      title: 'Помилка модерації',
      description: err.message || 'Не вдалося оновити статус оголошення',
      color: 'error'
    });
  } finally {
    processingId.value = null;
  }
};
</script>

<template>
  <div v-if="isAdmin" class="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-500">
              <UIcon name="i-heroicons-shield-check" class="w-6 h-6" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">Панель модерації</h1>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Перевірка оголошень із сумнівними фото або змістом</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <UBadge
            color="warning"
            variant="subtle"
            size="lg"
            class="font-semibold"
          >
            Очікують: {{ listings.length }}
          </UBadge>
          <UButton
            variant="soft"
            color="neutral"
            icon="i-heroicons-arrow-path"
            :loading="pending"
            @click="fetchListings"
          >
            Оновити
          </UButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-24 text-neutral-400">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin mb-3 text-brand-500" />
        <p class="font-medium">Завантаження черги модерації...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="listings.length === 0"
        class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 text-center shadow-sm"
      >
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-check-badge" class="w-10 h-10" />
        </div>
        <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">Усі оголошення перевірено!</h3>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
          Наразі немає оголошень, які потребують ручної модерації. Коли користувач додасть товар, у якому засумнівається ШІ, він з'явиться тут.
        </p>
        <UButton
          to="/profile/listings"
          color="primary"
          variant="soft"
          icon="i-heroicons-arrow-left"
        >
          Повернутися до моїх оголошень
        </UButton>
      </div>

      <!-- Moderation Queue Cards -->
      <div v-else class="space-y-6">
        <div
          v-for="listing in listings"
          :key="listing.id"
          class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col md:flex-row gap-6 p-5 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
        >
          <!-- Image Section -->
          <div class="w-full md:w-64 shrink-0">
            <div class="aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative group border border-neutral-200 dark:border-neutral-800">
              <img
                v-if="listing.images && listing.images.length > 0"
                :src="listing.images[0]"
                :alt="listing.title"
                class="w-full h-full object-contain"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-neutral-400">
                <UIcon name="i-heroicons-photo" class="w-12 h-12" />
              </div>

              <div class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md">
                {{ listing.images?.length || 0 }} фото
              </div>
            </div>
            
            <!-- Thumbnails if multiple images -->
            <div v-if="listing.images && listing.images.length > 1" class="grid grid-cols-4 gap-1.5 mt-2">
              <a
                v-for="(img, idx) in listing.images"
                :key="idx"
                :href="img"
                target="_blank"
                title="Відкрити оригінал фото"
                class="aspect-square rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:opacity-80 transition-opacity"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </a>
            </div>
            
            <a
              v-if="listing.images && listing.images.length === 1"
              :href="listing.images[0]"
              target="_blank"
              class="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center gap-1 mt-2"
            >
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3.5 h-3.5" />
              Відкрити оригінал фото
            </a>
          </div>

          <!-- Content Section -->
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <!-- Warning Banner -->
              <div class="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Позначка модерації:</strong> перевірте всі фото та опис на відповідність будівельним матеріалам та правилам платформи.</span>
              </div>

              <div class="flex flex-wrap items-center gap-2 mb-2">
                <UBadge
                  v-if="listing.category_id === 'other' || listing.category_id === 'other-unknown'"
                  size="xs"
                  color="error"
                  variant="subtle"
                >
                  Категорія не визначена
                </UBadge>
                <UBadge
                  size="xs"
                  :color="listing.status?.toLowerCase() === 'новий' ? 'success' : 'warning'"
                  variant="solid"
                >
                  {{ listing.status?.toLowerCase() === 'новий' ? 'Новий' : 'Відкритий / б/в' }}
                </UBadge>
                <span class="text-xs text-neutral-400">
                  Створено: {{ listing.created_at ? new Date(listing.created_at).toLocaleString('uk-UA') : 'Нещодавно' }}
                </span>
              </div>

              <h2 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">
                {{ listing.title }}
              </h2>

              <p v-if="listing.description" class="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4">
                {{ listing.description }}
              </p>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                <div class="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <span class="text-neutral-400 block mb-0.5">Ціна:</span>
                  <span class="font-bold text-neutral-900 dark:text-white text-sm">
                    {{ listing.price ? `${listing.price} грн / ${listing.unit || 'шт'}` : 'Безкоштовно' }}
                  </span>
                </div>
                <div class="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <span class="text-neutral-400 block mb-0.5">Кількість:</span>
                  <span class="font-bold text-neutral-900 dark:text-white text-sm">
                    {{ listing.quantity }} {{ listing.unit || 'шт' }}
                  </span>
                </div>
                <div class="col-span-2 sm:col-span-1 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <span class="text-neutral-400 block mb-0.5">Адреса:</span>
                  <span class="font-medium text-neutral-800 dark:text-neutral-200 truncate block">
                    {{ listing.address || 'Не вказана' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <UButton
                :to="`/catalog/${listing.id}`"
                target="_blank"
                variant="ghost"
                color="neutral"
                size="sm"
                icon="i-heroicons-arrow-top-right-on-square"
              >
                Повний перегляд
              </UButton>

              <div class="flex items-center gap-3 ml-auto">
                <UButton
                  color="error"
                  variant="soft"
                  icon="i-heroicons-x-mark"
                  :loading="processingId === listing.id"
                  @click="handleModerate(listing.id, 'reject')"
                >
                  Відхилити
                </UButton>
                <UButton
                  color="success"
                  variant="solid"
                  icon="i-heroicons-check"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  :loading="processingId === listing.id"
                  @click="handleModerate(listing.id, 'approve')"
                >
                  Схвалити та опублікувати
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="min-h-screen bg-neutral-50 dark:bg-neutral-950" />
</template>
