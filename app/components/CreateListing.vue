<template>
  <div class="min-h-screen bg-gray-50 py-8 lg:py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <div class="mb-8 flex items-center justify-center gap-4">
        <div
          class="flex items-center gap-2"
          :class="step === 'upload' ? 'text-primary-600' : 'text-gray-400'"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
            :class="
              step === 'upload' ? 'bg-primary-600 text-white' : 'bg-gray-200'
            "
          >
            1
          </div>
          <span class="hidden sm:inline font-semibold">Фото</span>
        </div>
        <div class="w-12 h-1 bg-gray-200"></div>
        <div
          class="flex items-center gap-2"
          :class="step === 'processing' ? 'text-primary-600' : 'text-gray-400'"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
            :class="
              step === 'processing'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200'
            "
          >
            2
          </div>
          <span class="hidden sm:inline font-semibold">Аналіз</span>
        </div>
        <div class="w-12 h-1 bg-gray-200"></div>
        <div
          class="flex items-center gap-2"
          :class="step === 'validate' ? 'text-primary-600' : 'text-gray-400'"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
            :class="
              step === 'validate' ? 'bg-primary-600 text-white' : 'bg-gray-200'
            "
          >
            3
          </div>
          <span class="hidden sm:inline font-semibold">Деталі</span>
        </div>
      </div>

      <UCard>
        <div v-if="step === 'upload'" class="text-center py-8">
          <h1 class="text-3xl font-bold mb-4">Що будемо продавати?</h1>
          <p class="text-gray-500 mb-8">
            Завантажте головне фото товару для швидкого аналізу ШІ.
          </p>

          <UForm
            :schema="step1Schema"
            :state="step1State"
            @submit="handleInitialUpload"
            class="max-w-md mx-auto"
          >
            <UFormField
              name="initialFile"
              description="JPG, GIF or PNG. 2MB Max."
            >
              <UFileUpload
                v-slot="{ open, removeFile }"
                v-model="step1State.initialFile"
                accept="image/*"
                class="min-h-48"
              />
            </UFormField>

            <UButton
              type="submit"
              size="lg"
              class="mt-8 bg-brand-500 hover:bg-brand-400"
            >
              Проаналізувати фото
            </UButton>
          </UForm>

          <UButton
            color="neutral"
            variant="ghost"
            class="mt-4"
            @click="step = 'validate'"
          >
            Ввести дані без фото
          </UButton>
        </div>

        <div v-if="step === 'processing'" class="text-center py-12">
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
        </div>

        <div v-if="step === 'validate'">
          <h1 class="text-2xl font-bold mb-6">Деталі оголошення</h1>

          <UForm
            :schema="mainFormSchema"
            :state="formData"
            @submit="onFinalSubmit"
            class="space-y-8"
          >
            <!-- Галерея фото -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700"
                >Фотографії ({{ formData.images.length }}/5)</label
              >

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
                      class="bg-red-500"
                    />
                  </div>
                  <UBadge v-if="index === 0" class="absolute -top-2 -left-2"
                    >Головне</UBadge
                  >
                </div>

                <UFileUpload
                  v-if="formData.images.length < 5"
                  v-slot="{ open }"
                  v-model="tempFile"
                  accept="image/*"
                  @update:model-value="handleNewImage"
                >
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
                </UFileUpload>
              </div>
              <p v-if="tempError" class="text-xs text-red-500">
                {{ tempError }}
              </p>
            </div>

            <!-- Основні поля (На всю ширину) -->
            <div class="space-y-6">
              <!-- Назва на всю ширину -->
              <UFormField name="title" label="Назва товару">
                <UInput
                  v-model="formData.title"
                  size="lg"
                  class="w-full"
                  placeholder="Введіть назву товару"
                />
              </UFormField>

              <!-- Ціна (половина ширини на комп'ютерах, щоб не була занадто розтягнута) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormField name="price" label="Ціна">
                  <UInput
                    v-model="formData.price"
                    type="number"
                    size="lg"
                    class="w-full"
                  >
                    <template #trailing>грн</template>
                  </UInput>
                </UFormField>
              </div>

              <!-- Опис на всю ширину -->
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

            <UButton type="submit" color="primary" size="lg" block
              >Опублікувати</UButton
            >
          </UForm>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup";
import type { FormSubmitEvent } from "@nuxt/ui";

// --- CONSTANTS ---
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_DIMENSIONS = { width: 200, height: 200 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };

// --- HELPERS ---
const createObjectUrl = (file: File) => URL.createObjectURL(file);

const validateDimensions = (file: File) => {
  return new Promise<boolean>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve(
          img.width >= MIN_DIMENSIONS.width &&
            img.height >= MIN_DIMENSIONS.height &&
            img.width <= MAX_DIMENSIONS.width &&
            img.height <= MAX_DIMENSIONS.height,
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// --- YUP SCHEMAS ---
const fileSchema = yup
  .mixed<File>()
  .required("Будь ласка, оберіть фото")
  .test(
    "fileSize",
    "Файл занадто великий (макс 2MB)",
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

const step1Schema = yup.object({
  initialFile: fileSchema,
});

const mainFormSchema = yup.object({
  images: yup.array().min(1, "Додайте хоча б одне фото").max(5),
  title: yup.string().required("Введіть назву"),
  price: yup.number().required("Вкажіть ціну").positive(),
  description: yup.string().required("Опис обов'язковий"), // Додано валідацію опису
});

// --- STATE ---
const step = ref<"upload" | "processing" | "validate">("upload");
const step1State = reactive({ initialFile: undefined as File | undefined });
const tempFile = ref<File | undefined>(undefined);
const tempError = ref("");

const formData = reactive({
  images: [] as File[],
  title: "",
  price: undefined as number | undefined,
  description: "", // Додано стейт для опису
});

// --- LOGIC ---
const handleInitialUpload = async (event: FormSubmitEvent<any>) => {
  const file = event.data.initialFile;
  if (!file) return;

  // Використовуємо = [file] замість push, щоб не дублювати головне фото при повторному завантаженні
  formData.images = [file];
  step.value = "processing";

  const body = new FormData();
  body.append("image", file);

  try {
    const response = await $fetch<any>("/api/analyze", {
      method: "POST",
      body,
    });

    console.log("response", response);

    // Підставляємо дані з ШІ у форму
    formData.title = response?.title || "";
    formData.price = response?.price;
    formData.description = response?.description || "";

    step.value = "validate";
  } catch (e) {
    console.error("Аналіз не вдався, введіть дані вручну");
    step.value = "validate";
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
  alert("Опубліковано!");
};
</script>
