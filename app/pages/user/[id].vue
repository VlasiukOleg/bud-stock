<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <UContainer class="py-6">
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-heroicons-arrow-left-20-solid"
        class="mb-6"
        @click="router.back()"
      >
        Назад
      </UButton>

      <div v-if="pending" class="flex flex-col items-center justify-center py-32 text-brand-500">
        <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin mb-4" />
        <p class="font-medium animate-pulse">Завантаження...</p>
      </div>

      <div v-else-if="sellerInfo" class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold mb-6">Оголошення користувача {{ sellerInfo.name }} ({{ listings.length }})</h1>
          
          <div v-if="listings.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <CommonProductCard
              v-for="listing in listings"
              :key="listing.id"
              :product="listing"
            />
          </div>
          <UCard v-else class="text-center py-12">
            <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto text-neutral-300 mb-4" />
            <p class="text-neutral-500">У цього користувача поки немає активних оголошень</p>
          </UCard>
        </div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <h3 class="text-xl font-bold mb-2">Користувача не знайдено</h3>
        <UButton to="/catalog" color="primary">До каталогу</UButton>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<any>();
const currentUser = useSupabaseUser();

const userId = route.params.id as string;
const isOwner = computed(() => currentUser.value?.id === userId);

const { data: pageData, pending } = useAsyncData(
  `user-profile-${userId}`,
  async () => {
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    // Get user's listings
    const { data: userListings } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    return {
      profile,
      listings: (userListings || []).map(l => ({
        ...l,
        images: l.images || []
      }))
    };
  }
);

const sellerInfo = computed(() => {
  if (!pageData.value?.profile) return null;
  const p = pageData.value.profile;
  return {
    ...p,
    name: getUserDisplayName(p)
  };
});

const listings = computed(() => pageData.value?.listings || []);

const formattedDate = (dateString?: string) => {
  if (!dateString) return 'давно';
  const d = new Date(dateString);
  return d.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
};

useSeoMeta({
  title: () => sellerInfo.value ? `Оголошення від ${sellerInfo.value.name} | BudStock` : 'Профіль',
});
</script>
