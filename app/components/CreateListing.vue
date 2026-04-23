<template>
  <div class="min-h-screen bg-gray-50 pt-8 pb-16 lg:py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <UCard>
        <!-- Stepper: Візуальний контроль (тільки читання) -->
        <UStepper
          v-model="activeStep"
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
              (по фото ми заповнемо ціну, заголовок, опис та підберемо
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
              :ui="{
                description: 'text-xs',
              }"
              class="mb-4"
            />

            <UForm
              :schema="mainFormSchema"
              :state="formData"
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
                        class="bg-red-500 hover:bg-red-600"
                      />
                    </div>
                    <UBadge v-if="index === 0" class="absolute -top-2 -left-2"
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

              <!-- Основні поля -->
              <div class="space-y-6">
                <UFormField name="title" label="Назва товару">
                  <UInput
                    v-model="formData.title"
                    size="lg"
                    class="w-full"
                    placeholder="Введіть назву товару"
                  />
                </UFormField>

                <!-- ПОЛЕ КАТЕГОРІЇ З ВИКЛИКОМ DROPDOWN MENU -->
                <UFormField name="categoryId" label="Категорія товару">
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

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UFormField name="price" label="Ціна">
                    <UInput v-model="formData.price" size="lg" class="w-full">
                      <template #trailing>грн</template>
                    </UInput>
                  </UFormField>
                </div>

                <UFormField name="description" label="Опис товару">
                  <UTextarea
                    v-model="formData.description"
                    autoresize
                    :rows="5"
                    size="lg"
                    class="w-full"
                    placeholder="Детальний опис товару..."
                  />
                </UFormField>
              </div>

              <!-- Кнопки керування -->
              <div class="flex flex-col-reverse sm:flex-row gap-4 pt-4">
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

const shouldShowProductRelevantBanner = ref(false);

// --- СТРУКТУРА ДЛЯ UDropdownMenu (Масив масивів) ---
const categoryDropdownItems = computed<DropdownMenuItem[][]>(() => {
  return [
    CATEGORY_DATA.map((category) => ({
      label: category.name,
      icon: category.icon,
      children: [
        [
          // Секція 1 у вкладеному меню: Вибір основної категорії
          {
            label: `Всі товари в "${category.name}"`,
            icon: "i-lucide-check-circle",
            onSelect: () => {
              formData.categoryId = category.id;
            },
          },
        ],
        [
          // Секція 2 у вкладеному меню: Список підкатегорій
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
  {
    slot: "upload",
    title: "Фото",
    description: "Завантаження",
    icon: "i-heroicons-camera",
    disabled: true,
  },
  {
    slot: "processing",
    title: "Аналіз",
    description: "Обробка ШІ",
    icon: "i-heroicons-sparkles",
    disabled: true,
  },
  {
    slot: "validate",
    title: "Деталі",
    description: "Опис та публікація",
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

const formData = reactive({
  images: [] as File[],
  title: "",
  categoryId: "",
  price: undefined as number | undefined,
  description: "",
});

const toast = useToast();

// Обчислюємо красивий шлях для відображення в інпуті форми
const selectedCategoryLabel = computed(() => {
  if (!formData.categoryId) return "";

  for (const cat of CATEGORY_DATA) {
    if (cat.id === formData.categoryId) return cat.name;

    const sub = cat.subcategories.find((s) => s.id === formData.categoryId);
    if (sub) return `${cat.name} > ${sub.name}`;
  }
  return "Категорія обрана";
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

  formData.title = "";
  formData.price = undefined;
  formData.description = "";
  formData.categoryId = "";

  formData.images = [file];
  activeStep.value = 1;

  const body = new FormData();
  body.append("image", file);

  try {
    const response = await $fetch<any>("/api/analyze", {
      method: "POST",
      body,
    });

    console.log(response);

    if (!response?.isRelevant) {
      console.log("Ваш товар не підходить для платформи");
      shouldShowProductRelevantBanner.value = true;
      activeStep.value = 2;
      return;
    }

    formData.title = response?.title || "";
    formData.price = response?.price;
    formData.description = response?.description || "";
    if (response?.categoryId) formData.categoryId = response.categoryId;

    activeStep.value = 2;
  } catch (e) {
    console.error("Аналіз не вдався", e);
    activeStep.value = 2;

    toast.add({
      title: "Помилка! Аналіз не вдався",
      description: "Спробуйте пізніше чи заповніть поля вручну",
      color: "error",
    });
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
  console.log("Final Data:", event.data);
};

// --- ВАЛІДАЦІЯ ---
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

const mainFormSchema = yup.object({
  images: yup.array().min(1, "Додайте хоча б одне фото").max(5),
  title: yup
    .string()
    .min(10, "Мінімальна кількість символів 10")
    .required("Введіть назву"),
  categoryId: yup.string().required("Оберіть категорію"),
  price: yup
    .number()
    .positive("Ціна повина бути більше нуля")
    .required("Вкажіть ціну"),
  description: yup.string().required("Опис обов'язковий"),
});
</script>
