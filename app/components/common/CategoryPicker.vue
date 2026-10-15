<script setup lang="ts">
import { ref, computed, watch, resolveComponent } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { CATEGORY_DATA } from "~/constants/category/category";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    allowAll?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    variant?: "outline" | "soft" | "subtle" | "ghost";
    triggerClass?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "Обрати категорію",
    allowAll: true,
    size: "lg",
    variant: "outline",
    triggerClass: "",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "select", value: string): void;
}>();

const isOpen = ref(false);
const expandedId = ref<string | null>(null);

// На мобільних — шторка знизу, на десктопі — модалка по центру
const isDesktop = useMediaQuery("(min-width: 640px)");
const UModalComp = resolveComponent("UModal");
const UDrawerComp = resolveComponent("UDrawer");
const overlayComponent = computed(() => (isDesktop.value ? UModalComp : UDrawerComp));

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
};

// При відкритті розгортаємо гілку з вибраною категорією
watch(isOpen, (open) => {
  if (open) {
    expandedId.value = props.modelValue ? findParentId(props.modelValue) : null;
  }
});
</script>

<template>
  <div class="w-full">
    <!-- Кнопка-тригер -->
    <UButton
      block
      color="neutral"
      :variant="variant"
      :size="size"
      :class="['justify-between text-left font-normal w-full', triggerClass]"
      @click="isOpen = true"
    >
      <span class="flex items-center gap-2 min-w-0">
        <UIcon
          :name="selectedInfo?.icon || 'i-lucide-layout-grid'"
          class="w-4 h-4 shrink-0"
          :class="selectedInfo ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-500'"
        />
        <span
          class="truncate"
          :class="selectedInfo ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'"
        >
          {{ selectedInfo?.name || placeholder }}
        </span>
      </span>
      <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-neutral-400 shrink-0" />
    </UButton>

    <!-- Вміст вибору (спільний для модалки та шторки) -->
    <component
      :is="overlayComponent"
      v-model:open="isOpen"
      title="Категорія матеріалів"
      description="Оберіть категорію або підкатегорію"
      :ui="isDesktop ? { content: 'sm:max-w-md' } : { content: 'max-h-[85vh]' }"
    >
      <template #body>
        <div
          class="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900"
        >
          <!-- Всі категорії -->
          <button
            v-if="allowAll"
            type="button"
            class="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-b border-neutral-100 dark:border-neutral-800/60"
            :class="{ 'bg-brand-50/70 dark:bg-brand-950/30 font-semibold text-brand-700 dark:text-brand-300': !modelValue }"
            @click="choose('')"
          >
            <span class="flex items-center gap-2 text-sm">
              <UIcon name="i-lucide-grid" class="w-4 h-4 text-neutral-500 shrink-0" />
              Всі категорії
            </span>
            <UIcon v-if="!modelValue" name="i-lucide-check" class="w-4 h-4 text-brand-600" />
          </button>

          <div class="max-h-[55vh] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <div v-for="cat in CATEGORY_DATA" :key="cat.id">
              <!-- Головна категорія -->
              <button
                type="button"
                class="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                :class="{
                  'bg-brand-50/50 dark:bg-brand-950/20 font-semibold':
                    modelValue === cat.id || cat.subcategories?.some((s) => s.id === modelValue),
                }"
                @click="toggle(cat.id)"
              >
                <span class="flex items-center gap-2 min-w-0">
                  <UIcon :name="cat.icon" class="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span class="text-sm text-neutral-800 dark:text-neutral-200 truncate">{{ cat.name }}</span>
                </span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-90': isExpanded(cat.id) }"
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
