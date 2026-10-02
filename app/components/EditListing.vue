<template>
  <div class="min-h-screen bg-gray-50 pt-8 pb-16 lg:py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <UCard>
        <div class="mb-8">
          <h1 class="text-2xl font-bold">{{ $t('editListing.title') }}</h1>
          <p class="text-gray-500 text-sm mt-1">{{ $t('editListing.subtitle') }}</p>
        </div>

        <UForm
          :schema="mainFormSchema"
          :state="formData"
          :validate-on="['input', 'blur', 'change']"
          :validate-on-model-update="true"
          @submit="onSubmit"
          class="space-y-8"
        >
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">
              {{ $t('createListing.step3.photosLabel', { current: totalImageCount, max: 5 }) }}
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div v-for="(url, index) in formData.existingImageUrls" :key="`existing-${index}`" class="relative aspect-square group">
                <img :src="url" class="w-full h-full object-cover rounded-lg border border-gray-200" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <UButton size="xs" icon="i-heroicons-trash" @click="removeExistingImage(index)" class="bg-red-500 hover:bg-red-600 text-white" />
                </div>
                <UBadge v-if="index === 0 && formData.newImages.length === 0" class="absolute -top-2 -left-2" color="primary">
                  {{ $t('createListing.step3.mainPhotoBadge') }}
                </UBadge>
              </div>
              <div v-for="(file, index) in formData.newImages" :key="`new-${index}`" class="relative aspect-square group">
                <img :src="createObjectUrl(file)" class="w-full h-full object-cover rounded-lg border-2 border-dashed border-primary-400" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <UButton size="xs" icon="i-heroicons-trash" @click="removeNewImage(index)" class="bg-red-500 hover:bg-red-600 text-white" />
                </div>
                <UBadge v-if="index === 0 && formData.existingImageUrls.length === 0" class="absolute -top-2 -left-2" color="primary">
                  {{ $t('createListing.step3.mainPhotoBadge') }}
                </UBadge>
              </div>
              <UFileUpload v-if="totalImageCount < 5" v-model="tempFile" accept="image/*" @update:model-value="handleNewImage">
                <template #default="{ open }">
                  <button type="button" class="aspect-square w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all" @click="open()">
                    <UIcon name="i-heroicons-plus" class="w-8 h-8 text-gray-400" />
                    <span class="text-xs text-gray-500 mt-1">{{ $t('createListing.step3.addPhotoBtn') }}</span>
                  </button>
                </template>
              </UFileUpload>
            </div>
            <p v-if="tempError" class="text-xs text-red-500">{{ tempError }}</p>
          </div>

          <div class="space-y-6">
            <UFormField name="title" :label="$t('createListing.step3.titleLabel')">
              <UInput v-model="formData.title" size="lg" class="w-full" :placeholder="$t('createListing.step3.titlePlaceholder')" />
            </UFormField>
            <UFormField name="categoryId" :label="$t('createListing.step3.categoryLabel')">
              <UDropdownMenu :items="categoryDropdownItems" :ui="{ content: 'w-72 max-h-96 overflow-y-auto' }" class="w-full">
                <UButton block color="neutral" variant="outline" size="lg" class="justify-between text-left font-normal bg-white w-full">
                  <span v-if="selectedCategoryLabel" class="truncate text-gray-900 font-medium">{{ selectedCategoryLabel }}</span>
                  <span v-else class="text-gray-400">{{ $t('createListing.step3.categoryPlaceholder') }}</span>
                  <UIcon name="i-lucide-chevron-down" class="w-5 h-5 text-gray-400" />
                </UButton>
              </UDropdownMenu>
            </UFormField>
            <UFormField name="status" :label="$t('createListing.step3.statusLabel')">
              <div class="flex gap-4">
                <UButton v-for="st in productStatuses" :key="st.value" :color="formData.status === st.value ? 'primary' : 'neutral'" :variant="formData.status === st.value ? 'solid' : 'outline'" class="flex-1 justify-center" size="lg" type="button" @click="() => { formData.status = st.value }">{{ st.label }}</UButton>
              </div>
            </UFormField>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField name="quantity" :label="$t('createListing.step3.quantityLabel')">
                <UInput v-model="formData.quantity" size="lg" placeholder="10" class="w-full" />
              </UFormField>
              <UFormField name="unit" :label="$t('createListing.step3.unitLabel')">
                <USelect v-model="formData.unit" :items="productUnits" size="lg" :placeholder="$t('createListing.step3.unitPlaceholder')" class="w-full" />
              </UFormField>
            </div>
            <div class="flex items-center mt-6 mb-2">
              <UCheckbox v-model="formData.isFree" name="isFree" :label="$t('createListing.step3.freeLabel')" color="primary" />
            </div>
            <div v-if="!formData.isFree" class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <UFormField name="price" :label="$t('createListing.step3.priceLabel')">
                <UInput v-model="formData.price" type="number" size="lg" placeholder="180" class="w-full">
                  <template #trailing>{{ $t('createListing.step3.currency') }}</template>
                </UInput>
              </UFormField>
              <div class="flex flex-col justify-center text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">{{ $t('createListing.step3.totalPriceLabel') }}</span>
                <span class="text-xl font-bold text-gray-900">{{ totalPrice > 0 ? totalPrice + ' ' + $t('createListing.step3.currency') : '—' }}</span>
              </div>
            </div>
            <UFormField name="address" :label="$t('createListing.step3.locationLabel')">
              <UInput v-model="formData.address" size="lg" class="w-full" :placeholder="$t('createListing.step3.locationPlaceholder')" readonly />
              <template #description>{{ $t('createListing.step3.locationDesc') }}</template>
            </UFormField>
            <div class="flex flex-col sm:flex-row gap-3 -mt-2">
              <UButton color="neutral" variant="outline" icon="i-heroicons-map-pin" type="button" @click="useMyLocation" :loading="isGettingLocation">{{ $t('createListing.step3.myLocationBtn') }}</UButton>
              <UButton color="primary" variant="soft" icon="i-heroicons-map" type="button" @click="openMapModal">{{ $t('createListing.step3.mapLocationBtn') }}</UButton>
            </div>
            <div v-if="formData.latitude && formData.longitude" class="text-xs text-green-600 flex items-center gap-1 font-medium -mt-2">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
              {{ $t('createListing.step3.coordinatesSet') }} ({{ formData.latitude.toFixed(4) }}, {{ formData.longitude.toFixed(4) }})
            </div>
            <UFormField name="delivery" :label="$t('createListing.step3.deliveryLabel')">
              <UCheckboxGroup v-model="formData.delivery" :items="deliveryOptions" class="mt-2" />
            </UFormField>
            <UFormField v-if="formData.delivery.includes('Доставка')" name="deliveryDetails" :label="$t('createListing.step3.deliveryDetailsLabel')">
              <UInput v-model="formData.deliveryDetails" size="lg" class="w-full" :placeholder="$t('createListing.step3.deliveryDetailsPlaceholder')" />
            </UFormField>
            <UFormField name="description" :label="$t('createListing.step3.descriptionLabel')">
              <UTextarea v-model="formData.description" autoresize :rows="4" size="lg" class="w-full" :placeholder="$t('createListing.step3.descriptionPlaceholder')" />
            </UFormField>
          </div>

          <div class="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <UButton type="button" color="neutral" variant="soft" size="lg" class="w-full sm:w-1/3 justify-center" @click="emit('cancel')">
              {{ $t('createListing.step3.cancelBtn') }}
            </UButton>
            <UButton type="submit" color="primary" size="lg" class="w-full sm:w-2/3 justify-center font-bold" :loading="isLoading" :disabled="!isFormValid">
              {{ $t('editListing.saveBtn') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>

    <ClientOnly>
      <UModal v-model:open="isMapModalOpen" :title="$t('createListing.mapModal.title')" :description="$t('createListing.mapModal.desc')">
        <template #body>
          <div class="flex items-center justify-between mb-4 bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700">
            <div class="flex flex-col pr-4">
              <span class="font-medium text-sm text-neutral-900 dark:text-white">{{ $t('createListing.mapModal.exactAddressTitle') }}</span>
              <span class="text-xs text-neutral-500">{{ $t('createListing.mapModal.exactAddressDesc') }}</span>
            </div>
            <UCheckbox v-model="formData.isExactLocation" color="primary" />
          </div>
          <div class="h-96 w-full rounded-lg overflow-hidden relative">
            <LMap ref="modalMap" :zoom="12" :center="mapCenter" :use-global-leaflet="true" @click="onMapClick">
              <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&amp;copy; OpenStreetMap contributors" layer-type="base" name="OpenStreetMap" />
              <LMarker v-if="markerPosition && formData.isExactLocation" :lat-lng="markerPosition" />
              <LCircle v-if="markerPosition && !formData.isExactLocation" :lat-lng="markerPosition" :radius="1000" color="#f97316" fill-color="#f97316" :fill-opacity="0.2" :weight="2" />
            </LMap>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="neutral" variant="ghost" @click="() => { isMapModalOpen = false }">{{ $t('createListing.mapModal.cancelBtn') }}</UButton>
            <UButton color="primary" @click="confirmMapLocation" :disabled="!markerPosition">{{ $t('createListing.mapModal.confirmBtn') }}</UButton>
          </div>
        </template>
      </UModal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import type { DropdownMenuItem } from '@nuxt/ui';
import type { PointTuple } from 'leaflet';
import type { Product } from '~/types/index';
import { CATEGORY_DATA } from '~/constants/category/category';

const props = defineProps<{
  listing: Product & { category_id?: string; is_free?: boolean; delivery_details?: string };
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'saved'): void;
}>();

const toast = useToast();
const supabase = useSupabaseClient<any>();
const user = useSupabaseUser();
const { t } = useI18n();
const { updateListing } = useListings();

const isLoading = ref(false);
const tempFile = ref<File | undefined>(undefined);
const tempError = ref('');

const productStatuses = computed(() => [
  { value: 'новий', label: t('createListing.constants.statusNew') },
  { value: 'залишок', label: t('createListing.constants.statusRemnant') },
]);

const productUnits = [
  { label: 'шт', value: 'шт' },
  { label: 'м²', value: 'м²' },
  { label: 'м³', value: 'м³' },
  { label: 'м.п.', value: 'м.п.' },
  { label: 'кг', value: 'кг' },
  { label: 'мішок', value: 'мішок' },
];

const deliveryOptions = computed(() => [
  { label: t('createListing.constants.pickup'), value: 'Самовивіз' },
  { label: t('createListing.constants.delivery'), value: 'Доставка' },
]);

const categoryDropdownItems = computed<DropdownMenuItem[][]>(() => {
  return [
    CATEGORY_DATA.map((category) => ({
      label: category.name,
      icon: category.icon,
      children: [
        [{ label: t('createListing.constants.allIn', { category: category.name }), icon: 'i-lucide-check-circle', onSelect: () => { formData.categoryId = category.id; } }],
        [...category.subcategories.map((sub) => ({ label: sub.name, onSelect: () => { formData.categoryId = sub.id; } }))],
      ],
    })),
  ];
});

const formData = reactive({
  existingImageUrls: [...(props.listing.images || [])] as string[],
  newImages: [] as File[],
  title: props.listing.title || '',
  categoryId: (props.listing as any).category_id || '',
  status: props.listing.status || 'новий',
  quantity: props.listing.quantity as number | undefined,
  unit: props.listing.unit || '',
  price: props.listing.price as number | undefined,
  isFree: (props.listing as any).is_free || false,
  address: props.listing.address || '',
  isExactLocation: props.listing.is_exact_location !== false,
  latitude: props.listing.latitude as number | undefined,
  longitude: props.listing.longitude as number | undefined,
  delivery: (props.listing.delivery as string[] | undefined) || [],
  deliveryDetails: (props.listing as any).delivery_details || '',
  description: props.listing.description || '',
});

const totalImageCount = computed(() => formData.existingImageUrls.length + formData.newImages.length);

const selectedCategoryLabel = computed(() => {
  if (!formData.categoryId) return '';
  for (const cat of CATEGORY_DATA) {
    if (cat.id === formData.categoryId) return cat.name;
    const sub = cat.subcategories.find((s) => s.id === formData.categoryId);
    if (sub) return cat.name + ' > ' + sub.name;
  }
  return '';
});

const totalPrice = computed(() => {
  if (formData.quantity && formData.price && !formData.isFree) return formData.quantity * formData.price;
  return 0;
});

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const mainFormSchema = yup.object({
  title: yup.string().min(10, t('createListing.validation.minTitle')).required(t('createListing.validation.reqTitle')),
  categoryId: yup.string().required(t('createListing.validation.reqCategory')),
  status: yup.string().required(t('createListing.validation.reqStatus')),
  quantity: yup.number().typeError(t('createListing.validation.reqQuantityNum')).positive(t('createListing.validation.reqQuantityPos')).required(t('createListing.validation.reqQuantity')),
  unit: yup.string().required(t('createListing.validation.reqUnit')),
  isFree: yup.boolean(),
  price: yup.number().when('isFree', {
    is: true,
    then: (schema) => schema.optional().nullable(),
    otherwise: (schema) => schema.typeError(t('createListing.validation.reqPriceNum')).positive(t('createListing.validation.reqPricePos')).required(t('createListing.validation.reqPrice')),
  }),
  address: yup.string().required(t('createListing.validation.reqAddress')),
  latitude: yup.number().required(t('createListing.validation.reqLat')),
  longitude: yup.number().required(t('createListing.validation.reqLat')),
  delivery: yup.array().min(1, t('createListing.validation.reqDelivery')),
  deliveryDetails: yup.string().when('delivery', {
    is: (d: string[]) => d && d.includes('Доставка'),
    then: (schema) => schema.required(t('createListing.validation.reqDeliveryDetails')),
    otherwise: (schema) => schema.optional(),
  }),
  description: yup.string().required(t('createListing.validation.reqDesc')),
});

const isFormValid = computed(() => {
  try { return mainFormSchema.isValidSync(formData) && totalImageCount.value > 0; }
  catch { return false; }
});

const createObjectUrl = (file: File) => URL.createObjectURL(file);
const removeExistingImage = (index: number) => { formData.existingImageUrls.splice(index, 1); };
const removeNewImage = (index: number) => { formData.newImages.splice(index, 1); };

const fileSchema = yup.mixed<File>().required()
  .test('fileSize', t('createListing.validation.fileTooLarge'), (val) => !val || val.size <= MAX_FILE_SIZE)
  .test('fileType', t('createListing.validation.wrongType'), (val) => !val || ACCEPTED_IMAGE_TYPES.includes(val.type));

const handleNewImage = async (file: File | null | undefined) => {
  if (!file) return;
  tempError.value = '';
  try { await fileSchema.validate(file); formData.newImages.push(file); tempFile.value = undefined; }
  catch (e: any) { tempError.value = e.message; tempFile.value = undefined; }
};

const onSubmit = async () => {
  if (!user.value) return;
  if (totalImageCount.value === 0) { toast.add({ title: t('createListing.validation.minPhotos'), color: 'error' }); return; }
  isLoading.value = true;
  try {
    const uploadedNewUrls: string[] = [];
    for (const file of formData.newImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = Math.random().toString(36).substring(2, 15) + '.' + fileExt;
      const userId = (user.value as any)?.id || (user.value as any)?.sub || 'unknown';
      const filePath = userId + '/' + fileName;
      const { error } = await supabase.storage.from('listing_images').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('listing_images').getPublicUrl(filePath);
      uploadedNewUrls.push(publicUrl);
    }
    const finalImages = [...formData.existingImageUrls, ...uploadedNewUrls];
    await updateListing(String(props.listing.id), {
      title: formData.title,
      category_id: formData.categoryId,
      status: formData.status,
      quantity: formData.quantity,
      unit: formData.unit,
      price: formData.isFree ? null : formData.price,
      is_free: formData.isFree,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      is_exact_location: formData.isExactLocation,
      delivery: formData.delivery,
      delivery_details: formData.deliveryDetails,
      description: formData.description,
      images: finalImages,
    });
    toast.add({ title: t('editListing.saveSuccess'), color: 'success' });
    emit('saved');
  } catch (error: any) {
    console.error('Error updating listing:', error);
    toast.add({ title: t('editListing.saveError'), description: error.message, color: 'error' });
  } finally {
    isLoading.value = false;
  }
};

const isMapModalOpen = ref(false);
const mapCenter = ref<PointTuple>([50.4501, 30.5234]);
const markerPosition = ref<PointTuple | null>(null);
const isGettingLocation = ref(false);

const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
  try {
    const data = await $fetch<{ address: string | null }>('/api/geocode', { query: { lat, lng, exact: formData.isExactLocation } });
    if (data?.address) formData.address = data.address;
  } catch (error) { console.error('Address error:', error); }
};

const useMyLocation = () => {
  if (navigator.geolocation) {
    isGettingLocation.value = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        formData.latitude = position.coords.latitude;
        formData.longitude = position.coords.longitude;
        isGettingLocation.value = false;
        toast.add({ title: t('createListing.toasts.locationSuccess'), color: 'success' });
        await fetchAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
      },
      (err) => { isGettingLocation.value = false; toast.add({ title: t('createListing.toasts.locationError'), description: err.message, color: 'error' }); }
    );
  } else { toast.add({ title: 'Помилка', description: t('createListing.toasts.noGeoSupport'), color: 'error' }); }
};

const openMapModal = () => {
  isMapModalOpen.value = true;
  if (formData.latitude && formData.longitude) {
    mapCenter.value = [formData.latitude, formData.longitude];
    markerPosition.value = [formData.latitude, formData.longitude];
  } else {
    mapCenter.value = [50.4501, 30.5234];
    markerPosition.value = null;
  }
};

const onMapClick = (event: any) => { const { lat, lng } = event.latlng; markerPosition.value = [lat, lng]; };

const confirmMapLocation = async () => {
  if (markerPosition.value) {
    formData.latitude = markerPosition.value[0];
    formData.longitude = markerPosition.value[1];
    isMapModalOpen.value = false;
    toast.add({ title: t('createListing.toasts.mapLocationSuccess'), color: 'success' });
    await fetchAddressFromCoordinates(markerPosition.value[0], markerPosition.value[1]);
  }
};
</script>