<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const client = useSupabaseClient<any>()
const user = useSupabaseUser()

const listings = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const handleLogOut = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}

async function fetchListings() {
  if (!user.value) {
    isLoading.value = false
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const { data, error } = await client
      .from('listings')
      .select('*')
      .eq('user_id', user.value?.sub) 
      .order('created_at', { ascending: false })

    if (error) throw error
    listings.value = data || []
  } catch (error: any) {
    console.error('Помилка завантаження оголошень:', error)
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

// Завантажуємо дані при монтуванні, але також стежимо за user
onMounted(() => {
  if (user.value) {
    fetchListings()
  }
})

watch(user, (newUser) => {
  if (newUser) {
    fetchListings()
  }
})
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
      
      <div v-if="isLoading" class="flex justify-center py-10">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-500" />
      </div>
      
      <div v-else-if="errorMessage" class="text-red-500 bg-red-50 p-4 rounded-lg">
        Помилка при завантаженні оголошень: {{ errorMessage }}
      </div>
      
      <div v-else-if="listings.length === 0" class="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
        У вас ще немає жодного оголошення.
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CommonProductCard
           v-for="listing in listings" 
          :key="listing.id"
          :product="listing" 
        />
      </div>
    </div>
  </div>
</template>