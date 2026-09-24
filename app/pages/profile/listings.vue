<script setup lang="ts">

const nuxtApp = useNuxtApp();
const user = useSupabaseUser();
const { getUserListings } = useListings();

const { data: userListings, pending, error } = useAsyncData(
  `user-listings-${user.value?.sub}`,
  () => user.value?.sub ? getUserListings(user.value.sub) : Promise.resolve([]),
  {
    getCachedData(key) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    }
  }
);
</script>

<template>
  <div class="relative bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
    <main class="w-full">
      <div class="max-w-5xl mx-auto p-4 md:p-8">
        <h1 class="text-3xl font-bold mb-8">Мої Оголошення</h1>

        <div v-if="pending" class="flex justify-center py-10">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-500" />
        </div>
        
        <div v-else-if="error" class="text-red-500 bg-red-50 p-4 rounded-lg">
          Помилка при завантаженні оголошень: {{ error }}
        </div>
        
        <div v-else-if="userListings?.length === 0" class="text-center py-16 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
          <UIcon name="i-heroicons-shopping-bag" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg">У вас ще немає жодного оголошення.</p>
          <UButton to="/create-listing" class="mt-4" color="primary" variant="soft">Створити перше оголошення</UButton>
        </div>
        
        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <CommonProductCard
            v-for="listing in userListings" 
            :key="listing.id"
            :product="listing" 
          />
        </div>
      </div>
    </main>
  </div>
</template>
