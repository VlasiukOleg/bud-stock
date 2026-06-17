<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
    :validate-on="['input', 'blur', 'change']"
    ref="formRef"
  >
    <CommonFormField label="Email" name="email">
      <CommonFormInput v-model="state.email" placeholder="Test"/>
    </CommonFormField>

    <UFormField name="categoryId" label="Категорія товару" eagerValidation>
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
          <span v-else class="text-gray-400">Оберіть категорію</span>
          <UIcon name="i-lucide-chevron-down" class="w-5 h-5 text-gray-400" />
        </UButton>
      </UDropdownMenu>
    </UFormField>

    <UFormField label="Password" name="password" eagerValidation>
      <UInput v-model="state.password" type="password" />
    </UFormField>

    <UFormField name="title" label="Назва товару" eagerValidation>
      <UInput
        v-model="state.title"
        size="lg"
        class="w-full"
        placeholder="Наприклад: Гіпсокартон Knauf 2500x1200x12.5мм"
      />
    </UFormField>
    <UFormField name="status">
      <URadioGroup v-model="state.status" :items="items" />
    </UFormField>

    <UButton type="submit"> Submit </UButton>
  </UForm>
</template>

<script setup lang="ts">
import { object, string } from "yup";
import type { InferType } from "yup";
import type { DropdownMenuItem, FormSubmitEvent } from "@nuxt/ui";

import { CATEGORY_DATA } from "~/constants/category/category";

const schema = object({
  title: string()
    .min(10, "Мінімальна кількість символів 10")
    .required("Required"),
  categoryId: string().required("Оберіть категорію"),
  status: string().required("Required"),
  email: string().email("Invalid email").required("Required"),
  password: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  title: "",
  categoryId: "",
  status: "Новий",
  email: undefined,
  password: undefined,
});

const formRef = useTemplateRef("formRef");

const toast = useToast();

const items = ref(["Новий", "Залишок"]);

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
              state.categoryId = category.id;
              formRef.value?.clear("categoryId");
            },
          },
        ],
        [
          ...category.subcategories.map((sub) => ({
            label: sub.name,
            onSelect: () => {
              state.categoryId = sub.id;
              formRef.value?.clear("categoryId");
            },
          })),
        ],
      ],
    })),
  ];
});

const selectedCategoryLabel = computed(() => {
  if (!state.categoryId) return "";
  for (const cat of CATEGORY_DATA) {
    if (cat.id === state.categoryId) return cat.name;
    const sub = cat.subcategories.find((s) => s.id === state.categoryId);
    if (sub) return `${cat.name} > ${sub.name}`;
  }
  return "";
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: "Success",
    description: "The form has been submitted.",
    color: "success",
  });
  console.log(event.data);
}
</script>
