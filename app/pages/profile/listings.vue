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

const inactiveListings = computed(() => {
  if (!userListings.value) return [];
  const now = Date.now();
  const maxRetentionMs = LISTING_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return userListings.value.filter(l => {
    const isStateDeactivated = l.listing_state === 'deactivated';
    const isStateRejected = l.listing_state === 'rejected';
    const isStateActive = !l.listing_state || l.listing_state === 'active';
    const isExpired = Boolean(l.expires_at && new Date(l.expires_at).getTime() <= now);

    if (!isStateDeactivated && !isStateRejected && !(isStateActive && isExpired)) {
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
    label: `${t('profile.listings.tabs.active', 'Активні')} (${activeListings.value.length})`, 
    slot: 'active', 
    icon: 'i-heroicons-check-circle' 
  },
  { 
    label: `${t('profile.listings.tabs.moderation', 'На модерації')} (${moderationListings.value.length})`, 
    slot: 'moderation', 
    icon: 'i-heroicons-clock' 
  },
  { 
    label: `${t('profile.listings.tabs.deactivated', 'Неактивні')} (${inactiveListings.value.length})`, 
    slot: 'deactivated', 
    icon: 'i-heroicons-pause-circle' 
  },
  { 
    label: `${t('profile.listings.tabs.sold', 'Продані')} (${soldListings.value.length})`, 
    slot: 'sold', 
    icon: 'i-heroicons-banknotes' 
  }
]);

const toast = useToast();

const isDeleteModalOpen = ref(false);
const listingToDelete = ref<string | number | null>(null);
const isDeleting = ref(false);

const handleDelete = (id: string | number) => {
  listingToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const handleRenew = async (id: string | number) => {
  try {
    await renewListing(String(id));
    toast.add({
      title: `Оголошення подовжено на ${LISTING_DURATION_DAYS} днів!`,
      color: 'success'
    });
    clearNuxtData(`user-listings-${user.value?.sub}`);
    clearNuxtData('all-listings');
    refresh();
  } catch (err) {
    toast.add({ title: t('profile.listings.renewError', 'Помилка подовження оголошення'), color: 'error' });
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
              list: 'justify-around w-full',
              trigger: 'grow flex-col gap-1 py-1',
              label: 'text-[10px]/3'
            }"
          >
            <template #active>
              <div class="mt-6">
                <div v-if="activeListings.length === 0" class="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  {{ $t('profile.listings.noActive') }}
                </div>
                <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <CommonProductCard
                    v-for="listing in activeListings" 
                    :key="listing.id"
                    :product="listing"
                    :show-delete-button="true"
                    :show-status-actions="true"
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
                  <div class="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                    <UIcon name="i-heroicons-clock" class="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Оголошення перевіряються модератором через незрозуміле фото або сумнів ШІ. Після схвалення вони одразу стануть активними у каталозі.</span>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    <CommonProductCard
                      v-for="listing in moderationListings" 
                      :key="listing.id"
                      :product="listing"
                      :show-delete-button="true"
                      :show-status-actions="true"
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
                  <div class="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                    <UIcon name="i-heroicons-information-circle" class="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Неактивні оголошення зберігаються {{ LISTING_RETENTION_DAYS }} днів (після завершення терміну, приховання або відхилення), після чого автоматично видаляються назавжди.</span>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    <CommonProductCard
                      v-for="listing in inactiveListings" 
                      :key="listing.id"
                      :product="listing"
                      :show-delete-button="true"
                      :show-status-actions="true"
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
                  <div class="mb-4 p-3 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-lg flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                    <UIcon name="i-heroicons-banknotes" class="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Продані оголошення зберігаються в історії {{ LISTING_RETENTION_DAYS }} днів, після чого автоматично очищаються.</span>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <CommonProductCard
                    v-for="listing in soldListings" 
                    :key="listing.id"
                    :product="listing"
                    :show-delete-button="true"
                    :show-status-actions="true"
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
