<template>
  <div class="min-h-screen bg-gray-50 pt-8 pb-16 lg:py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <UCard>
        <!-- Stepper -->
        <UStepper
          :model-value="activeStep"
          :items="stepperItems"
          class="w-full mb-8 text-brand-500"
          color="neutral"
        />

        <!-- Step 1: Upload -->
        <template v-if="activeStep === 0">
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-4">{{ $t('createListing.step1.title') }}</h1>
            <p class="text-gray-700 mb-1">
              {{ $t('createListing.step1.subtitle') }}
            </p>
            <p class="text-gray-500 mb-8 text-sm">
              {{ $t('createListing.step1.hint') }}
            </p>

            <UForm
              :schema="step1Schema"
              :state="step1State"
              @submit="handleInitialUpload"
              class="max-w-md mx-auto"
            >
              <UFormField
                name="initialFile"
                :description="$t('createListing.step1.fileDesc')"
              >
                <UFileUpload
                  v-model="step1State.initialFile"
                  accept="image/*"
                  class="min-h-48"
                  color="warning"
                  highlight
                />
              </UFormField>

              <UButton
                type="submit"
                size="lg"
                block
                class="mt-8 bg-brand-500 hover:bg-brand-400 font-bold"
                :loading="isLoading"
              >
                {{ $t('createListing.step1.analyzeBtn') }}
              </UButton>
            </UForm>

            <UButton
              color="neutral"
              variant="ghost"
              class="mt-4"
              @click="skipToManual"
            >
              {{ $t('createListing.step1.skipBtn') }}
            </UButton>
          </div>
        </template>

        <!-- Step 2: Processing -->
        <template v-else-if="activeStep === 1">
          <div class="text-center py-12">
            <div class="flex justify-center mb-8 relative">
              <img
                v-if="step1State.initialFile"
                :src="createObjectUrl(step1State.initialFile)"
                class="w-48 h-48 object-cover rounded-2xl shadow-md opacity-50"
              />
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-16 h-16 text-primary-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <h2 class="text-2xl font-bold mb-2">
              {{ $t('createListing.step2.title') }}
            </h2>
            <p class="text-gray-500">{{ $t('createListing.step2.subtitle') }}</p>
          </div>
        </template>

        <!-- Step 3: Validate & Details -->
        <template v-else-if="activeStep === 2">
          <div>
            <h1 class="text-2xl font-bold mb-6">{{ $t('createListing.step3.title') }}</h1>
            <UAlert
              v-if="shouldShowProductRelevantBanner"
              color="warning"
              :title="$t('createListing.step3.bannerTitle')"
              :description="$t('createListing.step3.bannerDesc')"
              :ui="{ description: 'text-xs' }"
              class="mb-6"
            />
            <!-- <ListingForm /> -->

            <UForm
              :schema="mainFormSchema"
              :state="formData"
              :validate-on="['input', 'blur', 'change']"
              :validate-on-model-update="true"
              @submit="onFinalSubmit"
              class="space-y-8"
            >
              <!-- Галерея фото -->
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">
                  {{ $t('createListing.step3.photosLabel', { current: formData.images.length, max: 5 }) }}
                </label>

                <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div
                    v-for="(file, index) in formData.images"
                    :key="index"
                    class="relative aspect-square group"
                  >
                    <img
                      :src="createObjectUrl(file)"
                      class="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <div
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2"
                    >
                      <UButton
                        size="xs"
                        icon="i-heroicons-trash"
                        @click="removeImage(index)"
                        class="bg-red-500 hover:bg-red-600 text-white"
                      />
                    </div>
                    <UBadge
                      v-if="index === 0"
                      class="absolute -top-2 -left-2"
                      color="primary"
                      >{{ $t('createListing.step3.mainPhotoBadge') }}</UBadge
                    >
                  </div>

                  <UFileUpload
                    v-if="formData.images.length < 5"
                    v-model="tempFile"
                    accept="image/*"
                    @update:model-value="handleNewImage"
                  >
                    <template #default="{ open }">
                      <button
                        type="button"
                        class="aspect-square w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                        @click="open()"
                      >
                        <UIcon
                          name="i-heroicons-plus"
                          class="w-8 h-8 text-gray-400"
                        />
                        <span class="text-xs text-gray-500 mt-1">{{ $t('createListing.step3.addPhotoBtn') }}</span>
                      </button>
                    </template>
                  </UFileUpload>
                </div>
                <p v-if="tempError" class="text-xs text-red-500">
                  {{ tempError }}
                </p>
              </div>

              <!-- Основна інформація -->
              <div class="space-y-6">
                <!-- Назва -->
                <UFormField name="title" :label="$t('createListing.step3.titleLabel')">
                  <UInput
                    v-model="formData.title"
                    size="lg"
                    class="w-full"
                    :placeholder="$t('createListing.step3.titlePlaceholder')"
                  />
                </UFormField>

                <!-- Категорія -->
                <UFormField name="categoryId" :label="$t('createListing.step3.categoryLabel')">
                  <UDropdownMenu
                    :items="categoryDropdownItems"
                    :ui="{ content: 'w-72 max-h-96 overflow-y-auto' }"
                    class="w-full"
                  >
                    <UButton
                      block
                      color="neutral"
                      variant="outline"
                      size="lg"
                      class="justify-between text-left font-normal bg-white w-full"
                    >
                      <span
                        v-if="selectedCategoryLabel"
                        class="truncate text-gray-900 font-medium"
                      >
                        {{ selectedCategoryLabel }}
                      </span>
                      <span v-else class="text-gray-400"
                        >{{ $t('createListing.step3.categoryPlaceholder') }}</span
                      >
                      <UIcon
                        name="i-lucide-chevron-down"
                        class="w-5 h-5 text-gray-400"
                      />
                    </UButton>
                  </UDropdownMenu>
                </UFormField>

                <!-- СТАН (Нове) -->
                <UFormField name="status" :label="$t('createListing.step3.statusLabel')">
                  <div class="flex gap-4">
                    <UButton
                      v-for="status in productStatuses"
                      :key="status.value"
                      :color="
                        formData.status === status.value ? 'primary' : 'neutral'
                      "
                      :variant="
                        formData.status === status.value ? 'solid' : 'outline'
                      "
                      class="flex-1 justify-center"
                      size="lg"
                      @click="setProductStatus(status.value)"
                    >
                      {{ status.label }}
                    </UButton>
                  </div>
                </UFormField>

                <!-- Кількість та Одиниця (Нове) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UFormField name="quantity" :label="$t('createListing.step3.quantityLabel')">
                    <UInput
                      v-model="formData.quantity"
                      size="lg"
                      placeholder="10"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField name="unit" :label="$t('createListing.step3.unitLabel')">
                    <USelect
                      v-model="formData.unit"
                      :items="productUnits"
                      size="lg"
                      :placeholder="$t('createListing.step3.unitPlaceholder')"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <!-- Віддам даром (Нове) -->
                <div class="flex items-center mt-6 mb-2">
                  <UCheckbox
                    v-model="formData.isFree"
                    name="isFree"
                    :label="$t('createListing.step3.freeLabel')"
                    color="primary"
                  />
                </div>

                <!-- Ціна (ховаємо, якщо Віддам даром) -->
                <div v-if="!formData.isFree" class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <UFormField name="price" :label="$t('createListing.step3.priceLabel')">
                    <UInput
                      v-model="formData.price"
                      type="number"
                      size="lg"
                      placeholder="180"
                      class="w-full"
                    >
                      <template #trailing>{{ $t('createListing.step3.currency') }}</template>
                    </UInput>
                  </UFormField>

                  <!-- Відображення загальної ціни -->
                  <div class="flex flex-col justify-center text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">{{ $t('createListing.step3.totalPriceLabel') }}</span>
                    <span class="text-xl font-bold text-gray-900">
                      {{ totalPrice > 0 ? totalPrice + ' ' + $t('createListing.step3.currency') : '—' }}
                    </span>
                  </div>
                </div>

                <!-- Локація (Нове) -->
                <UFormField name="address" :label="$t('createListing.step3.locationLabel')">
                  <UInput
                    v-model="formData.address"
                    size="lg"
                    class="w-full"
                    :placeholder="$t('createListing.step3.locationPlaceholder')"
                    readonly
                  />
                  <template #description>
                    {{ $t('createListing.step3.locationDesc') }}
                  </template>
                </UFormField>

                <div class="flex flex-col sm:flex-row gap-3 -mt-2">
                  <UButton
                    color="neutral"
                    variant="outline"
                    icon="i-heroicons-map-pin"
                    @click="useMyLocation"
                    :loading="isGettingLocation"
                  >
                    {{ $t('createListing.step3.myLocationBtn') }}
                  </UButton>
                  <UButton
                    color="primary"
                    variant="soft"
                    icon="i-heroicons-map"
                    @click="openMapModal"
                  >
                    {{ $t('createListing.step3.mapLocationBtn') }}
                  </UButton>
                </div>
                <div v-if="formData.latitude && formData.longitude" class="text-xs text-green-600 flex items-center gap-1 font-medium -mt-2">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
                  {{ $t('createListing.step3.coordinatesSet') }} ({{ formData.latitude.toFixed(4) }}, {{ formData.longitude.toFixed(4) }})
                </div>

                <!-- Спосіб отримання (Нове) -->
                <UFormField name="delivery" :label="$t('createListing.step3.deliveryLabel')">
                  <UCheckboxGroup
                    v-model="formData.delivery"
                    :items="deliveryOptions"
                    class="mt-2"
                  />
                </UFormField>

                <!-- Умови доставки (З'являється, якщо обрано "Доставка") -->
                <UFormField
                  v-if="formData.delivery.includes('Доставка')"
                  name="deliveryDetails"
                  :label="$t('createListing.step3.deliveryDetailsLabel')"
                >
                  <UInput
                    v-model="formData.deliveryDetails"
                    size="lg"
                    class="w-full"
                    :placeholder="$t('createListing.step3.deliveryDetailsPlaceholder')"
                  />
                </UFormField>

                <!-- Опис -->
                <UFormField name="description" :label="$t('createListing.step3.descriptionLabel')">
                  <UTextarea
                    v-model="formData.description"
                    autoresize
                    :rows="4"
                    size="lg"
                    class="w-full"
                    :placeholder="$t('createListing.step3.descriptionPlaceholder')"
                  />
                </UFormField>
              </div>

              <!-- Кнопки керування -->
              <div
                class="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-gray-200"
              >
                <UButton
                  type="button"
                  color="neutral"
                  variant="soft"
                  size="lg"
                  class="w-full sm:w-1/3 justify-center"
                  @click="resetForm"
                >
                  {{ $t('createListing.step3.cancelBtn') }}
                </UButton>

                <UButton
                  type="submit"
                  color="primary"
                  size="lg"
                  class="w-full sm:w-2/3 justify-center font-bold"
                  :disabled="!isFormValid"
                >
                  {{ $t('createListing.step3.publishBtn') }}
                </UButton>
              </div>
            </UForm>
          </div>
        </template>
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
            <LMap
              ref="modalMap"
              :zoom="12"
              :center="mapCenter"
              :use-global-leaflet="true"
              @click="onMapClick"
            >
              <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                layer-type="base"
                name="OpenStreetMap"
              />
              <!-- Замість LMarker використовуємо LCircle для вибору зони, якщо вимкнено точну адресу -->
              <LMarker v-if="markerPosition && formData.isExactLocation" :lat-lng="markerPosition" />
              <LCircle 
                v-if="markerPosition && !formData.isExactLocation" 
                :lat-lng="markerPosition" 
                :radius="1000" 
                color="#f97316"
                fill-color="#f97316"
                :fill-opacity="0.2"
                :weight="2"
              />
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
import * as yup from "yup";
import type { DropdownMenuItem, FormSubmitEvent, StepperItem } from "@nuxt/ui";
import type { PointTuple } from "leaflet";

import { CATEGORY_DATA } from "~/constants/category/category";
import ListingForm from "./ui/ListingForm.vue";

const toast = useToast();
const supabase = useSupabaseClient<any>();
const user = useSupabaseUser();
const { t } = useI18n();
const shouldShowProductRelevantBanner = ref(false);
const isLoading = ref(false);

// --- ДОВІДНИКИ ДЛЯ НОВИХ ПОЛІВ ---
const productStatuses = computed(() => [
  { value: "новий", label: t('createListing.constants.statusNew') },
  { value: "залишок", label: t('createListing.constants.statusRemnant') },
]);

const productUnits = [
  { label: "шт", value: "шт" },
  { label: "м²", value: "м²" },
  { label: "м³", value: "м³" },
  { label: "м.п.", value: "м.п." },
  { label: "кг", value: "кг" },
  { label: "мішок", value: "мішок" },
];

const deliveryOptions = computed(() => [
  { label: t('createListing.constants.pickup'), value: "Самовивіз" },
  { label: t('createListing.constants.delivery'), value: "Доставка" }
]);

// --- СТРУКТУРА ДЛЯ UDropdownMenu ---
const categoryDropdownItems = computed<DropdownMenuItem[][]>(() => {
  return [
    CATEGORY_DATA.map((category) => ({
      label: category.name,
      icon: category.icon,
      children: [
        [
          {
            label: t('createListing.constants.allIn', { category: category.name }),
            icon: "i-lucide-check-circle",
            onSelect: () => {
              formData.categoryId = category.id;
            },
          },
        ],
        [
          ...category.subcategories.map((sub) => ({
            label: sub.name,
            onSelect: () => {
              formData.categoryId = sub.id;
            },
          })),
        ],
      ],
    })),
  ];
});

// --- STEPPER CONFIG ---
const stepperItems = computed<StepperItem[]>(() => [
  { slot: "upload", title: t('createListing.stepper.photo'), icon: "i-heroicons-camera", disabled: true },
  {
    slot: "processing",
    title: t('createListing.stepper.analysis'),
    icon: "i-heroicons-sparkles",
    disabled: true,
  },
  {
    slot: "validate",
    title: t('createListing.stepper.details'),
    icon: "i-heroicons-document-text",
    disabled: true,
  },
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// --- STATE ---
const activeStep = ref(0);
const step1State = reactive({ initialFile: undefined as File | undefined });
const tempFile = ref<File | undefined>(undefined);
const tempError = ref("");

// Оновлений State з новими полями
const formData = reactive({
  images: [] as File[],
  title: "",
  categoryId: "",
  status: "новий", // За замовчуванням
  quantity: undefined as number | undefined,
  unit: "",
  price: undefined as number | undefined,
  isFree: false,
  address: "",
  isExactLocation: true,
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  delivery: [] as string[],
  deliveryDetails: "",
  description: "",
});

const setProductStatus = (status: string) => {
  formData.status = status;
};

// Обчислюємо красивий шлях для відображення в інпуті форми
const selectedCategoryLabel = computed(() => {
  if (!formData.categoryId) return "";
  for (const cat of CATEGORY_DATA) {
    if (cat.id === formData.categoryId) return cat.name;
    const sub = cat.subcategories.find((s) => s.id === formData.categoryId);
    if (sub) return `${cat.name} > ${sub.name}`;
  }
  return "";
});

const isFormValid = computed(() => {
  try {
    // isValidSync повертає true, якщо дані відповідають схемі, і false, якщо ні
    return mainFormSchema.isValidSync(formData);
  } catch (error) {
    return false;
  }
});

const totalPrice = computed(() => {
  if (formData.quantity && formData.price && !formData.isFree) {
    return formData.quantity * formData.price;
  }
  return 0;
});

// --- ФОРМА ТА ФАЙЛИ ---
const createObjectUrl = (file: File) => URL.createObjectURL(file);

const resetForm = () => {
  step1State.initialFile = undefined;
  formData.images = [];
  formData.title = "";
  formData.price = undefined;
  formData.isFree = false;
  formData.description = "";
  formData.categoryId = "";
  formData.status = "новий";
  formData.quantity = undefined;
  formData.unit = "";
  formData.address = "";
  formData.isExactLocation = true;
  formData.latitude = undefined;
  formData.longitude = undefined;
  formData.delivery = [];
  formData.deliveryDetails = "";
  shouldShowProductRelevantBanner.value = false;
  activeStep.value = 0;
};

const skipToManual = () => {
  resetForm();
  activeStep.value = 2;
};

const handleInitialUpload = async (event: FormSubmitEvent<any>) => {
  const file = event.data.initialFile;
  if (!file) return;

  isLoading.value = true;
  formData.images = [file];
  activeStep.value = 1;

  const body = new FormData();
  body.append("image", file);

  try {
    const response = await $fetch<any>("/api/analyze", {
      method: "POST",
      body,
    });

    if (!response?.isRelevant) {
      shouldShowProductRelevantBanner.value = true;
    }

    formData.title = response?.title || "";
    formData.price = response?.price;
    formData.isFree = false;
    formData.description = response?.description || "";
    if (response?.categoryId) formData.categoryId = response.categoryId;

    // Скидаємо нові поля при новому аналізі
    formData.status = "новий";
    formData.quantity = undefined;
    formData.unit = "";
    formData.address = "";
    formData.delivery = [];

    activeStep.value = 2;
  } catch (e) {
    activeStep.value = 2;
    toast.add({
      title: t('createListing.toasts.analyzeErrorTitle'),
      description: t('createListing.toasts.analyzeErrorDesc'),
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const handleNewImage = async (file: File | null | undefined) => {
  if (!file) return;
  tempError.value = "";
  try {
    await fileSchema.validate(file);
    formData.images.push(file);
    tempFile.value = undefined;
  } catch (e: any) {
    tempError.value = e.message;
    tempFile.value = undefined;
  }
};

const removeImage = (index: number) => {
  formData.images.splice(index, 1);
};

const onFinalSubmit = async (event: FormSubmitEvent<any>) => {
  if (!user.value) {
    toast.add({
      title: "Помилка",
      description: t('createListing.toasts.authError'),
      color: "error",
    });
    return;
  }

  isLoading.value = true;
  try {
    const uploadedImageUrls: string[] = [];

    // Завантажуємо фотографії
    for (const file of formData.images) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const userId = user.value?.id || user.value?.sub || 'unknown';
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('listing_images')
        .upload(filePath, file);

      if (error) throw error;

      // Отримуємо публічний URL
      const { data: { publicUrl } } = supabase.storage
        .from('listing_images')
        .getPublicUrl(filePath);

      uploadedImageUrls.push(publicUrl);
    }

    // Зберігаємо в базу даних
    const { error: dbError } = await supabase
      .from('listings')
      .insert({
        user_id: user.value?.sub,
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
        images: uploadedImageUrls,
      });

    if (dbError) throw dbError;

    toast.add({
      title: t('createListing.toasts.createSuccessTitle'),
      description: t('createListing.toasts.createSuccessDesc'),
      color: "success",
    });
    
    // Очищаємо кеш сторінки "Мої оголошення", щоб при переході завантажились нові дані
    clearNuxtData(`user-listings-${user.value?.sub}`);
    
    // Перенаправляємо на сторінку "Мої оголошення" (профіль)
    navigateTo('/profile/listings');

  } catch (error: any) {
    console.error("Error creating listing:", error);
    toast.add({
      title: t('createListing.toasts.createErrorTitle'),
      description: error.message || t('createListing.toasts.createErrorDesc'),
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

// --- ВАЛІДАЦІЯ YUP ---
const validateDimensions = (file: File) => {
  return new Promise<boolean>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve(
          img.width >= 200 &&
            img.height >= 200 &&
            img.width <= 4096 &&
            img.height <= 4096,
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const fileSchema = yup
  .mixed<File>()
  .required(t('createListing.validation.addPhoto'))
  .test(
    "fileSize",
    t('createListing.validation.fileTooLarge'),
    (val) => !val || val.size <= MAX_FILE_SIZE,
  )
  .test(
    "fileType",
    t('createListing.validation.wrongType'),
    (val) => !val || ACCEPTED_IMAGE_TYPES.includes(val.type),
  )
  .test("dimensions", t('createListing.validation.wrongDimensions'), async (val) => {
    if (!val || !ACCEPTED_IMAGE_TYPES.includes(val.type)) return true;
    return await validateDimensions(val);
  });

const step1Schema = yup.object({ initialFile: fileSchema });

// Оновлена схема для всіх нових полів
const mainFormSchema = yup.object({
  images: yup.array().min(1, t('createListing.validation.minPhotos')).max(5),
  title: yup
    .string()
    .min(10, t('createListing.validation.minTitle'))
    .required(t('createListing.validation.reqTitle')),
  categoryId: yup.string().required(t('createListing.validation.reqCategory')),
  status: yup.string().required(t('createListing.validation.reqStatus')),
  quantity: yup
    .number()
    .typeError(t('createListing.validation.reqQuantityNum'))
    .positive(t('createListing.validation.reqQuantityPos'))
    .required(t('createListing.validation.reqQuantity')),
  unit: yup.string().required(t('createListing.validation.reqUnit')),
  isFree: yup.boolean(),
  price: yup
    .number()
    .when("isFree", {
      is: true,
      then: (schema) => schema.optional().nullable(),
      otherwise: (schema) =>
        schema
          .typeError(t('createListing.validation.reqPriceNum'))
          .positive(t('createListing.validation.reqPricePos'))
          .required(t('createListing.validation.reqPrice')),
    }),
  address: yup.string().required(t('createListing.validation.reqAddress')),
  latitude: yup.number().required(t('createListing.validation.reqLat')),
  longitude: yup.number().required(t('createListing.validation.reqLat')),
  delivery: yup.array().min(1, t('createListing.validation.reqDelivery')),
  // Динамічна валідація: вимагати деталі, тільки якщо обрано "Доставка"
  deliveryDetails: yup.string().when("delivery", {
    is: (delivery: string[]) => delivery && delivery.includes("Доставка"),
    then: (schema) => schema.required(t('createListing.validation.reqDeliveryDetails')),
    otherwise: (schema) => schema.optional(),
  }),
  description: yup.string().required(t('createListing.validation.reqDesc')),
});

// Додаємо змінні для карти
const isMapModalOpen = ref(false);
const mapCenter = ref<PointTuple>([50.4501, 30.5234]);
const markerPosition = ref<PointTuple | null>(null);
const isGettingLocation = ref(false);

const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
  try {
    // Звертаємося до НАШОГО власного API замість напряму до стороннього сервісу
    const data = await $fetch<{ address: string | null }>('/api/geocode', {
      query: { lat, lng, exact: formData.isExactLocation }
    });
    
    if (data && data.address) {
      formData.address = data.address;
    }
  } catch (error) {
    console.error("Помилка отримання адреси:", error);
  }
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
        
        // Отримуємо адресу за координатами
        await fetchAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        isGettingLocation.value = false;
        toast.add({ title: t('createListing.toasts.locationError'), description: err.message, color: 'error' });
      }
    );
  } else {
    toast.add({ title: 'Помилка', description: t('createListing.toasts.noGeoSupport'), color: 'error' });
  }
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

const onMapClick = (event: any) => {
  console.log(event.latlng);
  const { lat, lng } = event.latlng;
  markerPosition.value = [lat, lng];
};

const confirmMapLocation = async () => {
  if (markerPosition.value) {
    formData.latitude = markerPosition.value[0];
    formData.longitude = markerPosition.value[1];
    isMapModalOpen.value = false;
    toast.add({ title: t('createListing.toasts.mapLocationSuccess'), color: 'success' });
    
    // Отримуємо адресу за координатами
    await fetchAddressFromCoordinates(markerPosition.value[0], markerPosition.value[1]);
  }
};

</script>
