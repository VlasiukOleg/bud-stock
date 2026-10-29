<script setup lang="ts">
import { useDocumentVisibility } from '@vueuse/core';
import { LISTING_DURATION_DAYS, LISTING_RETENTION_DAYS } from '~/constants/listing';
const nuxtApp = useNuxtApp();
const user = useSupabaseUser();
const { getUserListings, deleteListing, updateListingState, renewListing } = useListings();
const { t } = useI18n();
useSeoMeta({ title: t('profile.listings.title', 'Мої оголошення') });

const editingListing = ref<any | null>(null);

const handleEdit = (id: string | number) => {
  const selectedListing = userListings.value?.find(l => l.id === id);
  if (selectedListing && selectedListing.listing_state !== 'sold' && selectedListing.listing_state !== 'moderation') {
    editingListing.value = selectedListing;
  }
};

const handleSaved = () => {
  editingListing.value = null;
  clearNuxtData(`user-listings-${user.value?.sub}`);
  clearNuxtData('all-listings');
  refresh();
};

const { data: userListings, pending, error, refresh } = useAsyncData(
  `user-listings-${user.value?.sub}`,
  () => user.value?.sub ? getUserListings(user.value.sub) : Promise.resolve([]),
  {
    getCachedData(key) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    }
  }
);

const activeListings = computed(() => {
  if (!userListings.value) return [];
  const now = Date.now();
  return userListings.value.filter(l => {
    const isStateActive = !l.listing_state || l.listing_state === 'active';
    const isNotExpired = !l.expires_at || new Date(l.expires_at).getTime() > now;
    return isStateActive && isNotExpired;
  });
});

const moderationListings = computed(() => {
  if (!userListings.value) return [];
  return userListings.value.filter(l => l.listing_state === 'moderation');
});

const rejectedListings = computed(() => {
  if (!userListings.value) return [];
  const now = Date.now();
  const maxRetentionMs = LISTING_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return userListings.value.filter(l => {
    if (l.listing_state !== 'rejected') return false;

    const baseTime = l.updated_at ? new Date(l.updated_at).getTime() : (l.created_at ? new Date(l.created_at).getTime() : now);
    const diffMs = now - baseTime;
    if (diffMs > maxRetentionMs) return false;

    return true;
  });
});

const inactiveListings = computed(() => {
  if (!userListings.value) return [];
  const now = Date.now();
  const maxRetentionMs = LISTING_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return userListings.value.filter(l => {
    const isStateDeactivated = l.listing_state === 'deactivated';
    const isStateActive = !l.listing_state || l.listing_state === 'active';
    const isExpired = Boolean(l.expires_at && new Date(l.expires_at).getTime() <= now);

    if (!isStateDeactivated && !(isStateActive && isExpired)) {
      return false;
    }

    // Розрахунок терміну 45 днів для видалення
    let baseTime: number;
    if (isExpired && l.expires_at) {
      baseTime = new Date(l.expires_at).getTime();
    } else if (l.updated_at) {
      baseTime = new Date(l.updated_at).getTime();
    } else {
      baseTime = now;
    }

    const diffMs = now - baseTime;
    if (diffMs > maxRetentionMs) return false;

    return true;
  });
});

const soldListings = computed(() => {
  if (!userListings.value) return [];
  const now = Date.now();
  const maxRetentionMs = LISTING_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return userListings.value.filter(l => {
    if (l.listing_state !== 'sold') return false;

    // Автоматично приховуємо з кабінету, якщо продано понад 45 днів тому
    const baseTime = l.updated_at ? new Date(l.updated_at).getTime() : (l.created_at ? new Date(l.created_at).getTime() : now);
    const diffMs = now - baseTime;
    if (diffMs > maxRetentionMs) return false;

    return true;
  });
});

const tabItems = computed(() => [
  { 
    label: t('profile.listings.tabs.active', 'Активні'), 
    count: activeListings.value.length,
    slot: 'active'
  },
  { 
    label: t('profile.listings.tabs.moderation', 'На модерації'), 
    count: moderationListings.value.length,
    slot: 'moderation'
  },
  { 
    label: t('profile.listings.tabs.rejected', 'Відхилені'), 
    count: rejectedListings.value.length,
    slot: 'rejected'
  },
  { 
    label: t('profile.listings.tabs.deactivated', 'Неактивні'), 
    count: inactiveListings.value.length,
    slot: 'deactivated'
  },
  { 
    label: t('profile.listings.tabs.sold', 'Продані'), 
    count: soldListings.value.length,
    slot: 'sold'
  }
]);

const toast = useToast();

const isDeleteModalOpen = ref(false);
const listingToDelete = ref<string | number | null>(null);
const isDeleting = ref(false);
const renewingId = ref<string | number | null>(null);

const handleDelete = (id: string | number) => {
  listingToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const handleRenew = async (id: string | number) => {
  renewingId.value = id;
  try {
    await renewListing(String(id));
    toast.add({
      title: `Оголошення подовжено на ${LISTING_DURATION_DAYS} днів!`,
      color: 'success'
    });
    clearNuxtData(`user-listings-${user.value?.sub}`);
    clearNuxtData('all-listings');
    await refresh();
  } catch (err) {
    toast.add({ title: t('profile.listings.renewError', 'Помилка подовження оголошення'), color: 'error' });
  } finally {
    renewingId.value = null;
  }
};

const handleUpdateState = async (id: string | number, newState: 'active' | 'sold' | 'deactivated') => {
  try {
    const listing = userListings.value?.find(l => l.id === id);
    const hadValidExpiresAt = Boolean(listing?.expires_at && new Date(listing.expires_at).getTime() > Date.now());
    await updateListingState(String(id), newState, listing?.expires_at);

    let activeMsg = `Оголошення активовано та додано в каталог на ${LISTING_DURATION_DAYS} днів!`;
    if (newState === 'active' && hadValidExpiresAt && listing?.expires_at) {
      const remainingDays = Math.ceil((new Date(listing.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      activeMsg = `Оголошення відновлено! Залишилося ${remainingDays} дн. активності.`;
    }

    const messages: Record<string, string> = {
      active: activeMsg,
      deactivated: 'Оголошення приховано (зберігається 45 днів)',
      sold: 'Оголошення позначено як продане'
    };
    toast.add({ title: messages[newState] || t('profile.listings.statusUpdated'), color: 'success' });
    
    // Скидаємо кеш Nuxt
    clearNuxtData(`user-listings-${user.value?.sub}`);
    clearNuxtData('all-listings');
    
    refresh();
  } catch (err) {
    toast.add({ title: t('profile.listings.statusUpdateError'), color: 'error' });
  }
};

const confirmDelete = async () => {
  if (!listingToDelete.value) return;
  isDeleting.value = true;
  try {
    await deleteListing(String(listingToDelete.value));
    toast.add({ title: t('profile.listings.deleteSuccess'), color: 'success' });
    
    // Скидаємо кеш Nuxt, щоб підтягнулись нові дані при перезавантаженні або навігації
    clearNuxtData(`user-listings-${user.value?.sub}`);
    clearNuxtData('all-listings');
    
    refresh();
  } catch (err) {
    toast.add({ title: t('profile.listings.deleteError'), color: 'error' });
  } finally {
    isDeleting.value = false;
    isDeleteModalOpen.value = false;
    listingToDelete.value = null;
  }
};

const visibility = useDocumentVisibility();

watch(visibility, async (current, previous) => {
  console.log('Visibility changed:', current, 'previous:', previous);
  if (current === 'visible') {
    console.log('Refreshing listings...');
    clearNuxtData(`user-listings-${user.value?.sub}`);
    clearNuxtData('all-listings');
    await refresh();
    console.log('Refresh completed');
  }
});
</script>

<template>
  <div class="relative bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
    <!-- Режим редагування -->
    <EditListing
      v-if="editingListing"
      :listing="editingListing"
      @cancel="editingListing = null"
      @saved="handleSaved"
    />
    <main v-else class="w-full">
      <div class="max-w-5xl mx-auto p-4 pb-24 md:p-8 md:pb-8">
        <h1 class="text-3xl font-bold mb-8">{{ $t('profile.listings.pageTitle') }}</h1>

        <div v-if="pending" class="flex justify-center py-10">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-500" />
        </div>
        
        <div v-else-if="error" class="text-red-500 bg-red-50 p-4 rounded-lg">
          {{ $t('profile.listings.loadError') }} {{ error }}
        </div>
        
        <div v-else-if="userListings?.length === 0" class="text-center py-16 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
          <UIcon name="i-heroicons-shopping-bag" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg">{{ $t('profile.listings.noListings') }}</p>
          <UButton :to="APP_ROUTES.CREATE_LISTING" class="mt-4" color="primary" variant="soft">{{ $t('profile.listings.createFirst') }}</UButton>
        </div>
        
        <div v-else>
          <UTabs 
            :items="tabItems" 
            class="w-full"
            :ui="{
              list: 'relative flex p-1.5 group bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs w-full justify-around',
              indicator: '!bg-brand-50 dark:!bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/40 rounded-xl shadow-xs',
              trigger: 'grow flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:py-2.5 md:px-4 rounded-xl text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400 font-semibold transition-all cursor-pointer relative overflow-hidden after:content-[\'\'] data-[state=active]:after:absolute data-[state=active]:after:bottom-0.5 data-[state=active]:after:left-1/2 data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-8 md:data-[state=active]:after:w-12 data-[state=active]:after:h-1 data-[state=active]:after:bg-brand-500 data-[state=active]:after:rounded-full',
              label: 'text-xs md:text-sm font-semibold'
            }"
          >
            <!-- Верхній рядок: бейдж з цифрою (на мобільному) -->
            <template #leading="{ item }">
              <span 
                class="md:hidden min-w-5 h-4.5 px-1.5 text-[11px] font-bold rounded-full flex items-center justify-center leading-none transition-colors"
                :class="[
                  item.count > 0 
                    ? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 group-data-[state=active]:bg-brand-100/90 group-data-[state=active]:text-brand-700 dark:group-data-[state=active]:bg-brand-900/60 dark:group-data-[state=active]:text-brand-300' 
                    : 'bg-neutral-100/80 text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400 group-data-[state=active]:bg-brand-100/60 group-data-[state=active]:text-brand-600'
                ]"
              >
                {{ item.count }}
              </span>
            </template>

            <!-- Назва статусу (на десктопі додаємо кількість у дужках) -->
            <template #default="{ item }">
              <span class="text-xs md:text-sm font-semibold truncate">{{ item.label }}</span>
              <span class="hidden md:inline-block text-xs md:text-sm font-bold opacity-80 ml-1">
                ({{ item.count }})
              </span>
            </template>
            <template #active>
              <div class="mt-6">
                <div v-if="activeListings.length === 0" class="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  {{ $t('profile.listings.noActive') }}
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <ProfileListingCard
                    v-for="listing in activeListings" 
                    :key="listing.id"
                    :product="listing"
                    :is-renewing="renewingId === listing.id"
                    @delete="handleDelete"
                    @updateState="handleUpdateState"
                    @renew="handleRenew"
                    @edit="handleEdit"
                  />
                </div>
              </div>
            </template>

            <template #moderation>
              <div class="mt-6">
                <div v-if="moderationListings.length === 0" class="text-center py-10 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  {{ $t('profile.listings.noModeration', 'Немає оголошень на модерації') }}
                </div>
                <div v-else>
                  <!-- Банер статусу у спокійному стилі Figma -->
                  <div class="mb-6 p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl flex items-center gap-3.5 sm:gap-4 shadow-xs">
                    <div class="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-clock" class="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                    </div>
                    <div>
                      <h3 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug">На модерації</h3>
                      <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">Перевіряємо оголошення. Після схвалення воно стане активним.</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <ProfileListingCard
                      v-for="listing in moderationListings" 
                      :key="listing.id"
                      :product="listing"
                      @delete="handleDelete"
                      @updateState="handleUpdateState"
                      @renew="handleRenew"
                      @edit="handleEdit"
                    />
                  </div>
                </div>
              </div>
            </template>

            <template #rejected>
              <div class="mt-6">
                <div v-if="rejectedListings.length === 0" class="text-center py-10 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  {{ $t('profile.listings.noRejected', 'Немає відхилених оголошень') }}
                </div>
                <div v-else>
                  <!-- Банер статусу у спокійному стилі Figma -->
                  <div class="mb-6 p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl flex items-center gap-3.5 sm:gap-4 shadow-xs">
                    <div class="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-shield-exclamation" class="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                    </div>
                    <div>
                      <h3 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug">Відхилені</h3>
                      <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">Ці оголошення потребують змін перед повторною публікацією.</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <ProfileListingCard
                      v-for="listing in rejectedListings" 
                      :key="listing.id"
                      :product="listing"
                      @delete="handleDelete"
                      @updateState="handleUpdateState"
                      @renew="handleRenew"
                      @edit="handleEdit"
                    />
                  </div>
                </div>
              </div>
            </template>

            <template #deactivated>
              <div class="mt-6">
                <div v-if="inactiveListings.length === 0" class="text-center py-10 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  {{ $t('profile.listings.noDeactivated', 'Немає неактивних оголошень') }}
                </div>
                <div v-else>
                  <!-- Банер статусу у спокійному стилі Figma -->
                  <div class="mb-6 p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl flex items-center gap-3.5 sm:gap-4 shadow-xs">
                    <div class="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-pause" class="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                    </div>
                    <div>
                      <h3 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug">Неактивні</h3>
                      <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">Оголошення приховані від покупців. Їх можна активувати знову.</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <ProfileListingCard
                      v-for="listing in inactiveListings" 
                      :key="listing.id"
                      :product="listing"
                      :is-renewing="renewingId === listing.id"
                      @delete="handleDelete"
                      @updateState="handleUpdateState"
                      @renew="handleRenew"
                      @edit="handleEdit"
                    />
                  </div>
                </div>
              </div>
            </template>

            <template #sold>
              <div class="mt-6">
                <div v-if="soldListings.length === 0" class="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  {{ $t('profile.listings.noSold') }}
                </div>
                <div v-else>
                  <!-- Банер статусу у спокійному стилі Figma -->
                  <div class="mb-6 p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl flex items-center gap-3.5 sm:gap-4 shadow-xs">
                    <div class="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                    </div>
                    <div>
                      <h3 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug">Продані</h3>
                      <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">Ваші завершені продажі зберігаються тут.</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <ProfileListingCard
                    v-for="listing in soldListings" 
                    :key="listing.id"
                    :product="listing"
                    @delete="handleDelete"
                    @updateState="handleUpdateState"
                    @renew="handleRenew"
                    @edit="handleEdit"
                  />
                </div>
              </div>
            </div>
          </template>
          </UTabs>
        </div>
      </div>
    </main>

    <UModal 
      v-model:open="isDeleteModalOpen" 
      :title="$t('profile.listings.deleteConfirmTitle')" 
      :description="$t('profile.listings.deleteConfirmDesc')"
      :ui="{ overlay: 'bg-gray-900/75 dark:bg-gray-900/90 backdrop-blur-sm' }"
    >
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :label="$t('profile.listings.cancel')"
            @click="() =>{ isDeleteModalOpen = false }"
            :disabled="isDeleting"
          />
          <UButton
            color="error"
            variant="solid"
            :label="$t('profile.listings.delete')"
            :loading="isDeleting"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
