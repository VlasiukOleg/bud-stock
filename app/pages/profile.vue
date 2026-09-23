<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const { getUserListings } = useListings();

const client = useSupabaseClient<any>()
const user = useSupabaseUser()

const handleLogOut = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}

const { data: userListings, pending, error } = useAsyncData(
  'user-listings',
  () => user.value?.sub ? getUserListings(user.value.sub) : Promise.resolve([]),
  { watch: [user] }
);
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">Профіль {{ user?.email }}</h1>
      <UButton
        v-if="user"
        variant="soft"
        icon="i-heroicons-arrow-right-on-rectangle"
        @click="handleLogOut"
      >
        Вийти
      </UButton>
    </div>

    <div>
      <h2 class="text-xl font-semibold mb-4">Мої оголошення</h2>
      
      <div v-if="pending" class="flex justify-center py-10">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-500" />
      </div>
      
      <div v-else-if="error" class="text-red-500 bg-red-50 p-4 rounded-lg">
        Помилка при завантаженні оголошень: {{ error }}
      </div>
      
      <div v-else-if="userListings?.length === 0" class="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
        У вас ще немає жодного оголошення.
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CommonProductCard
           v-for="listing in userListings" 
          :key="listing.id"
          :product="listing" 
        />
      </div>
    </div>
  </div>
</template>