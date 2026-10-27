<script setup lang="ts">
import { ref, computed, watch, resolveComponent } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { CATEGORY_DATA, OTHER_CATEGORY_ID } from "~/constants/category/category";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    allowAll?: boolean;
    clearable?: boolean;
    showUnclassified?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    variant?: "outline" | "soft" | "subtle" | "ghost";
    triggerClass?: string;
    iconClass?: string;
    textClass?: string;
    chevronClass?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    placeholder: "Обрати категорію",
    allowAll: true,
    clearable: false,
    showUnclassified: false,
    size: "lg",
    variant: "outline",
    triggerClass: "",
    iconClass: "",
    textClass: "",
    chevronClass: "",
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "select", value: string): void;
}>();

const { emitFormChange, emitFormBlur, color, id: formFieldId } = useFormField(props);

const isOpen = ref(false);
const expandedId = ref<string | null>(null);

// На мобільних — шторка знизу, на десктопі — модалка по центру
const isDesktop = useMediaQuery("(min-width: 640px)");
const UModalComp = resolveComponent("UModal");
const UDrawerComp = resolveComponent("UDrawer");
const overlayComponent = computed(() => (isDesktop.value ? UModalComp : UDrawerComp));

const displayedCategories = computed(() => {
  if (props.showUnclassified || !props.allowAll) {
    return CATEGORY_DATA;
  }
  return CATEGORY_DATA.filter((c) => c.id !== OTHER_CATEGORY_ID);
});

const findParentId = (id: string) =>
  CATEGORY_DATA.find((c) => c.id === id || c.subcategories?.some((s) => s.id === id))?.id ?? null;

const selectedInfo = computed(() => {
  if (!props.modelValue) return null;
  for (const cat of CATEGORY_DATA) {
    if (cat.id === props.modelValue) return { name: cat.name, icon: cat.icon };
    const sub = cat.subcategories?.find((s) => s.id === props.modelValue);
    if (sub) return { name: `${cat.name} › ${sub.name}`, icon: cat.icon };
  }
  return null;
});

const isExpanded = (id: string) => expandedId.value === id;

const toggle = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const choose = (id: string) => {
  emit("update:modelValue", id);
  emit("select", id);
  isOpen.value = false;
  emitFormChange();
  emitFormBlur();
};

// При відкритті розгортаємо гілку з вибраною категорією
watch(isOpen, (open) => {
  if (open) {
    expandedId.value = props.modelValue ? findParentId(props.modelValue) : null;
  } else {
    emitFormBlur();
  }
});
</script>

<template>
  <div class="w-full">
    <!-- Кнопка-тригер -->
    <UButton
      :id="formFieldId"
      block
      :disabled="disabled"
      :color="color === 'error' && !disabled ? 'error' : 'neutral'"
      :variant="variant"
      :size="size"
      :class="[
        'justify-between text-left font-normal w-full',
        triggerClass,
        disabled ? 'opacity-70 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 pointer-events-none' : '',
        color === 'error' && !disabled ? 'ring-2 ring-error-500 dark:ring-error-400' : ''
      ]"
      @click="!disabled && (isOpen = true)"
    >
      <span class="flex items-center gap-2 min-w-0">
        <UIcon
          :name="selectedInfo?.icon || 'i-lucide-layout-grid'"
          class="w-4 h-4 shrink-0"
          :class="[
            selectedInfo
              ? (disabled ? 'text-neutral-500' : 'text-brand-600 dark:text-brand-400')
              : (iconClass || 'text-neutral-500')
          ]"
        />
        <span
          class="truncate"
          :class="[
            selectedInfo
              ? (disabled ? 'font-medium text-neutral-600 dark:text-neutral-300' : 'font-medium text-neutral-900 dark:text-white')
              : (textClass || 'text-neutral-600 dark:text-neutral-300')
          ]"
        >
          {{ selectedInfo?.name || placeholder }}
        </span>
      </span>
      <UIcon v-if="disabled" name="i-lucide-lock" class="w-4 h-4 text-neutral-400 shrink-0" />
      <UIcon
        v-else
        name="i-lucide-chevron-down"
        class="w-4 h-4 shrink-0 transition-transform duration-200"
        :class="[chevronClass || 'text-neutral-400', { 'rotate-180': isOpen }]"
      />
    </UButton>

    <!-- Вміст вибору (спільний для модалки та шторки) -->
    <component
      :is="overlayComponent"
      v-model:open="isOpen"
      title="Категорія матеріалів"
      description="Оберіть категорію або підкатегорію"
      :ui="isDesktop ? {
        content: 'sm:max-w-md',
        body: 'p-4 sm:p-6 overflow-hidden flex flex-col',
        overlay: '!bg-gray-900/75 dark:!bg-gray-900/90 !backdrop-blur-sm',
      } : {
        content: 'mt-0 max-h-[88vh]',
        container: 'overflow-hidden p-4 gap-3',
        body: 'overflow-hidden',
        overlay: '!bg-gray-900/75 dark:!bg-gray-900/90 !backdrop-blur-sm',
      }"
    >
      <template #body>
        <div
          class="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 flex flex-col"
          :class="isDesktop ? 'h-[60vh] max-h-[60vh]' : 'h-[63vh] max-h-[63vh]'"
        >
          <!-- Всі категорії -->
          <button
            v-if="allowAll"
            type="button"
            class="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-b border-neutral-100 dark:border-neutral-800/60 shrink-0"
            :class="{ 'bg-brand-50/70 dark:bg-brand-950/30 font-semibold text-brand-700 dark:text-brand-300': !modelValue }"
            @click="choose('')"
          >
            <span class="flex items-center gap-2 text-sm">
              <UIcon name="i-lucide-grid" class="w-4 h-4 text-neutral-500 shrink-0" />
              Всі категорії
            </span>
            <UIcon v-if="!modelValue" name="i-lucide-check" class="w-4 h-4 text-brand-600" />
          </button>

          <div
            class="flex-1 min-h-0 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 overscroll-contain"
          >
            <div v-for="cat in displayedCategories" :key="cat.id">
              <!-- Головна категорія -->
              <button
                type="button"
                class="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                :class="{
                  'bg-brand-50/50 dark:bg-brand-950/20 font-semibold':
                    modelValue === cat.id || cat.subcategories?.some((s) => s.id === modelValue),
                }"
                @click="cat.id === OTHER_CATEGORY_ID ? choose(cat.id) : toggle(cat.id)"
              >
                <span class="flex items-center gap-2 min-w-0">
                  <UIcon :name="cat.icon" class="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span class="text-sm text-neutral-800 dark:text-neutral-200 truncate">{{ cat.name }}</span>
                </span>
                <UIcon
                  v-if="cat.id !== OTHER_CATEGORY_ID"
                  name="i-lucide-chevron-right"
                  class="w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-90': isExpanded(cat.id) }"
                />
                <UIcon
                  v-else-if="modelValue === cat.id"
                  name="i-lucide-check"
                  class="w-4 h-4 text-brand-600 shrink-0"
                />
              </button>

              <!-- Підкатегорії -->
              <div
                v-if="isExpanded(cat.id)"
                class="bg-neutral-50/60 dark:bg-neutral-950/40 divide-y divide-neutral-100 dark:divide-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800/60"
              >
                <button
                  type="button"
                  class="w-full flex items-center justify-between py-2.5 px-3 pl-9 text-left text-sm hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-colors"
                  :class="{ 'bg-brand-100/60 dark:bg-brand-900/40 font-bold text-brand-700 dark:text-brand-300': modelValue === cat.id }"
                  @click="choose(cat.id)"
                >
                  <span>Всі в «{{ cat.name }}»</span>
                  <UIcon v-if="modelValue === cat.id" name="i-lucide-check" class="w-4 h-4 text-brand-600 shrink-0" />
                </button>
                <button
                  v-for="sub in cat.subcategories"
                  :key="sub.id"
                  type="button"
                  class="w-full flex items-center justify-between py-2.5 px-3 pl-9 text-left text-sm hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-colors"
                  :class="{ 'bg-brand-100/60 dark:bg-brand-900/40 font-bold text-brand-700 dark:text-brand-300': modelValue === sub.id }"
                  @click="choose(sub.id)"
                >
                  <span class="text-neutral-700 dark:text-neutral-300">{{ sub.name }}</span>
                  <UIcon v-if="modelValue === sub.id" name="i-lucide-check" class="w-3.5 h-3.5 text-brand-600 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </component>
  </div>
</template>
