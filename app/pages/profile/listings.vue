<script setup lang="ts">
const nuxtApp = useNuxtApp();
const user = useSupabaseUser();
const { getUserListings, deleteListing } = useListings();
const { t } = useI18n();

const { data: userListings, pending, error, refresh } = useAsyncData(
  `user-listings-${user.value?.sub}`,
  () => user.value?.sub ? getUserListings(user.value.sub) : Promise.resolve([]),
  {
    getCachedData(key) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    }
  }
);

const toast = useToast();

const isDeleteModalOpen = ref(false);
const listingToDelete = ref<string | number | null>(null);
const isDeleting = ref(false);

const handleDelete = (id: string | number) => {
  listingToDelete.value = id;
  isDeleteModalOpen.value = true;
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
</script>

<template>
  <div class="relative bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
    <main class="w-full">
      <div class="max-w-5xl mx-auto p-4 md:p-8">
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
        
        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <CommonProductCard
            v-for="listing in userListings" 
            :key="listing.id"
            :product="listing"
            :show-delete-button="true"
            @delete="handleDelete"
          />
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
