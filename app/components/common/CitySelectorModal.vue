<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { refDebounced } from '@vueuse/core';

const props = defineProps<{
  modelValue: boolean;
  detectedCity?: string;
}>();

const emit = defineEmits(['update:modelValue', 'select', 'exact-location']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const searchQuery = ref('');
const debouncedSearch = refDebounced(searchQuery, 500);
const searchResults = ref<any[]>([]);
const isSearching = ref(false);

const { t } = useI18n();

const popularCities = computed(() => [
  { name: t('citySelector.cities.kyiv'), lat: 50.4501, lon: 30.5234 },
  { name: t('citySelector.cities.lviv'), lat: 49.8419, lon: 24.0315 },
  { name: t('citySelector.cities.odesa'), lat: 46.4825, lon: 30.7233 },
  { name: t('citySelector.cities.dnipro'), lat: 48.4647, lon: 35.0461 },
  { name: t('citySelector.cities.kharkiv'), lat: 49.9935, lon: 36.2304 },
]);

watch(debouncedSearch, async (query) => {
  if (!query || query.length < 2) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const config = useRuntimeConfig();
    const data = await $fetch<any[]>(`${config.public.api.nominatimBaseUrl}/search`, {
      query: {
        city: query,
        country: 'Ukraine',
        format: 'json',
        'accept-language': 'uk'
      }
    });
    
    searchResults.value = data.filter((item: any) => 
      ['city', 'town', 'village', 'administrative'].includes(item.type) || item.class === 'place'
    );
  } catch (error) {
    console.error(t('citySelector.errorSearching'), error);
  } finally {
    isSearching.value = false;
  }
});

const selectCity = (lat: number, lon: number, name: string) => {
  emit('select', { lat: Number(lat), lng: Number(lon), name });
  isOpen.value = false;
};

const handleExactLocation = () => {
  emit('exact-location');
};
</script>

<template>
  <UModal v-model:open="isOpen" :title="$t('citySelector.title')">
    <template #body>
      <div class="space-y-6">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          :placeholder="$t('citySelector.searchPlaceholder')"
          size="lg"
          class="w-full"
          :loading="isSearching"
          autofocus
        />

        <!-- Результати пошуку -->
        <div v-if="searchQuery && searchResults.length > 0" class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          <button
            v-for="city in searchResults"
            :key="city.place_id"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex flex-col"
            @click="selectCity(city.lat, city.lon, city.name)"
          >
            <span class="font-medium text-gray-900">{{ city.name }}</span>
            <span class="text-xs text-gray-500 truncate">{{ city.display_name }}</span>
          </button>
        </div>
        <div v-else-if="searchQuery && !isSearching && searchResults.length === 0" class="text-center py-4 text-gray-500 text-sm">
          {{ $t('citySelector.notFound') }}
        </div>

        <!-- Популярні міста -->
        <div v-if="!searchQuery">
          <div v-if="detectedCity" class="mb-4 p-3 bg-brand-50 border border-brand-100 rounded-lg">
            <p class="text-sm text-brand-800 mb-2">
              {{ $t('citySelector.yourCity', { city: detectedCity }) }}
            </p>
            <div class="flex gap-2">
              <UButton size="sm" color="primary" @click="() => {isOpen = false}">{{ $t('citySelector.yesCorrect') }}</UButton>
            </div>
          </div>

          <h3 class="text-sm font-medium text-gray-500 mb-3">{{ $t('citySelector.popularCities') }}</h3>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="city in popularCities"
              :key="city.name"
              variant="soft"
              color="neutral"
              size="sm"
              @click="selectCity(city.lat, city.lon, city.name)"
            >
              {{ city.name }}
            </UButton>
          </div>
        </div>

        <UDivider :label="$t('citySelector.or')" />

        <UButton
          block
          variant="outline"
          color="primary"
          icon="i-heroicons-map-pin"
          size="lg"
          @click="handleExactLocation"
        >
          {{ $t('citySelector.exactLocation') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
