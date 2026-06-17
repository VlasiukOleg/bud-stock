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
            <h1 class="text-3xl font-bold mb-4">Що будемо продавати?</h1>
            <p class="text-gray-700 mb-1">
              Завантажте головне фото товару для швидкого аналізу та створення
              оголошення.
            </p>
            <p class="text-gray-500 mb-8 text-sm">
              (по фото ми заповнимо ціну, заголовок, опис та підберемо
              категорію, Вам залишиться тільки натиснути Опублікувати).
            </p>

            <UForm
              :schema="step1Schema"
              :state="step1State"
              @submit="handleInitialUpload"
              class="max-w-md mx-auto"
            >
              <UFormField
                name="initialFile"
                description="JPG, GIF or PNG. 20MB Max."
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
                Проаналізувати фото
              </UButton>
            </UForm>

            <UButton
              color="neutral"
              variant="ghost"
              class="mt-4"
              @click="skipToManual"
            >
              Перейти до створення оголошення
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
              ШІ розпізнає товар та шукає ціни...
            </h2>
            <p class="text-gray-500">Це може зайняти кілька секунд</p>
          </div>
        </template>

        <!-- Step 3: Validate & Details -->
        <template v-else-if="activeStep === 2">
          <div>
            <h1 class="text-2xl font-bold mb-6">Деталі оголошення</h1>
            <UAlert
              v-if="shouldShowProductRelevantBanner"
              color="warning"
              title="Ваш товар не підходить для платформи."
              description="Якщо ми помилились, Ви можете додати цей товар, але він пройде ручну модерацію. Це може зайняти деякий час."
              :ui="{ description: 'text-xs' }"
              class="mb-6"
            />
            <ListingForm />

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
                  Фотографії ({{ formData.images.length }}/5)
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
                      >Головне</UBadge
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
                        <span class="text-xs text-gray-500 mt-1">Додати</span>
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
                <UFormField name="title" label="Назва товару *">
                  <UInput
                    v-model="formData.title"
                    size="lg"
                    class="w-full"
                    placeholder="Наприклад: Гіпсокартон Knauf 2500x1200x12.5мм"
                  />
                </UFormField>

                <!-- Категорія -->
                <UFormField name="categoryId" label="Категорія товару *">
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
                        >Оберіть категорію</span
                      >
                      <UIcon
                        name="i-lucide-chevron-down"
                        class="w-5 h-5 text-gray-400"
                      />
                    </UButton>
                  </UDropdownMenu>
                </UFormField>

                <!-- СТАН (Нове) -->
                <UFormField name="status" label="Стан *">
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
                      @click="formData.status = status.value"
                    >
                      {{ status.label }}
                    </UButton>
                  </div>
                </UFormField>

                <!-- Кількість та Одиниця (Нове) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UFormField name="quantity" label="Кількість *">
                    <UInput
                      v-model="formData.quantity"
                      size="lg"
                      placeholder="10"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField name="unit" label="Одиниця *">
                    <USelect
                      v-model="formData.unit"
                      :items="productUnits"
                      size="lg"
                      placeholder="Оберіть"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <!-- Ціна -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UFormField name="price" label="Ціна за одиницю *">
                    <UInput
                      v-model="formData.price"
                      type="number"
                      size="lg"
                      placeholder="180"
                      class="w-full"
                    >
                      <template #trailing>грн</template>
                    </UInput>
                  </UFormField>
                </div>

                <!-- Локація (Нове) -->
                <UFormField name="address" label="Локація *">
                  <UInput
                    v-model="formData.address"
                    size="lg"
                    class="w-full"
                    placeholder="вул. Хрещатик, 22, Київ"
                  />
                  <template #description>
                    Вкажіть адресу або найближчий орієнтир
                  </template>
                </UFormField>

                <!-- Спосіб отримання (Нове) -->
                <UFormField name="delivery" label="Спосіб отримання *">
                  <div class="space-y-3 mt-2">
                    <UCheckbox
                      v-model="formData.delivery"
                      value="Самовивіз"
                      label="Самовивіз"
                    />
                    <UCheckbox
                      v-model="formData.delivery"
                      value="Доставка"
                      label="Доставка продавцем"
                    />
                  </div>
                </UFormField>

                <!-- Умови доставки (З'являється, якщо обрано "Доставка") -->
                <UFormField
                  v-if="formData.delivery.includes('Доставка')"
                  name="deliveryDetails"
                  label="Умови доставки *"
                >
                  <UInput
                    v-model="formData.deliveryDetails"
                    size="lg"
                    class="w-full"
                    placeholder="Наприклад: Доставка по Києву - 200 грн"
                  />
                </UFormField>

                <!-- Опис -->
                <UFormField name="description" label="Коментар / Опис *">
                  <UTextarea
                    v-model="formData.description"
                    autoresize
                    :rows="4"
                    size="lg"
                    class="w-full"
                    placeholder="Додаткова інформація про товар..."
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
                  Скасувати
                </UButton>

                <UButton
                  type="submit"
                  color="primary"
                  size="lg"
                  class="w-full sm:w-2/3 justify-center font-bold"
                  :disabled="!isFormValid"
                >
                  Опублікувати
                </UButton>
              </div>
            </UForm>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup";
import type { DropdownMenuItem, FormSubmitEvent, StepperItem } from "@nuxt/ui";

import { CATEGORY_DATA } from "~/constants/category/category";
import ListingForm from "./ui/ListingForm.vue";

const toast = useToast();
const shouldShowProductRelevantBanner = ref(false);
const isLoading = ref(false);

// --- ДОВІДНИКИ ДЛЯ НОВИХ ПОЛІВ ---
const productStatuses = [
  { value: "новий", label: "Новий" },
  { value: "залишок", label: "Залишок" },
];

const productUnits = [
  { label: "шт", value: "шт" },
  { label: "м²", value: "м²" },
  { label: "м³", value: "м³" },
  { label: "м.п.", value: "м.п." },
  { label: "кг", value: "кг" },
  { label: "мішок", value: "мішок" },
];

// --- СТРУКТУРА ДЛЯ UDropdownMenu ---
const categoryDropdownItems = computed<DropdownMenuItem[][]>(() => {
  return [
    CATEGORY_DATA.map((category) => ({
      label: category.name,
      icon: category.icon,
      children: [
        [
          {
            label: `Всі товари в "${category.name}"`,
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
const stepperItems: StepperItem[] = [
  { slot: "upload", title: "Фото", icon: "i-heroicons-camera", disabled: true },
  {
    slot: "processing",
    title: "Аналіз",
    icon: "i-heroicons-sparkles",
    disabled: true,
  },
  {
    slot: "validate",
    title: "Деталі",
    icon: "i-heroicons-document-text",
    disabled: true,
  },
];

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
  address: "",
  delivery: [] as string[],
  deliveryDetails: "",
  description: "",
});

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

// --- ФОРМА ТА ФАЙЛИ ---
const createObjectUrl = (file: File) => URL.createObjectURL(file);

const resetForm = () => {
  step1State.initialFile = undefined;
  formData.images = [];
  formData.title = "";
  formData.price = undefined;
  formData.description = "";
  formData.categoryId = "";
  formData.status = "новий";
  formData.quantity = undefined;
  formData.unit = "";
  formData.address = "";
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
      title: "Помилка! Аналіз не вдався",
      description: "Спробуйте пізніше чи заповніть поля вручну",
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

const onFinalSubmit = (event: FormSubmitEvent<any>) => {
  console.log("Final Data to DB:", event.data);
  toast.add({
    title: "Успішно!",
    description: "Ваше оголошення створено.",
    color: "success",
  });
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
  .required("Будь ласка, оберіть фото")
  .test(
    "fileSize",
    "Файл занадто великий (макс 20MB)",
    (val) => !val || val.size <= MAX_FILE_SIZE,
  )
  .test(
    "fileType",
    "Тільки JPEG, PNG або WEBP",
    (val) => !val || ACCEPTED_IMAGE_TYPES.includes(val.type),
  )
  .test("dimensions", "Неправильний розмір картинки", async (val) => {
    if (!val || !ACCEPTED_IMAGE_TYPES.includes(val.type)) return true;
    return await validateDimensions(val);
  });

const step1Schema = yup.object({ initialFile: fileSchema });

// Оновлена схема для всіх нових полів
const mainFormSchema = yup.object({
  images: yup.array().min(1, "Додайте хоча б одне фото").max(5),
  title: yup
    .string()
    .min(10, "Мінімальна кількість символів 10")
    .required("Введіть назву"),
  categoryId: yup.string().required("Оберіть категорію"),
  status: yup.string().required("Оберіть стан товару"),
  quantity: yup
    .number()
    .typeError("Введіть число")
    .positive("Кількість повинна бути більше нуля")
    .required("Вкажіть кількість"),
  unit: yup.string().required("Оберіть одиницю виміру"),
  price: yup
    .number()
    .typeError("Введіть число")
    .positive("Ціна повинна бути більше нуля")
    .required("Вкажіть ціну"),
  address: yup.string().required("Вкажіть локацію"),
  delivery: yup.array().min(1, "Оберіть хоча б один спосіб отримання"),
  // Динамічна валідація: вимагати деталі, тільки якщо обрано "Доставка"
  deliveryDetails: yup.string().when("delivery", {
    is: (delivery: string[]) => delivery && delivery.includes("Доставка"),
    then: (schema) => schema.required("Вкажіть умови доставки"),
    otherwise: (schema) => schema.optional(),
  }),
  description: yup.string().required("Опис обов'язковий"),
});
</script>
