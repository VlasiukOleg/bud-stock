<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { refDebounced } from "@vueuse/core";
import { CATEGORY_DATA } from "~/constants/category/category";
import {
  matchesSmartSearch,
  getCategoryMatchBreakdown,
  type CategoryMatchGroup,
} from "~/utils/smartSearch";

const props = withDefaults(
  defineProps<{
    open: boolean;
    searchQuery?: string;
    searchInDescription?: boolean;
    allProductsInRadius?: any[];
    searchRadiusKm?: number;
    currentCategory?: string;
  }>(),
  {
    searchQuery: "",
    searchInDescription: false,
    allProductsInRadius: () => [],
    searchRadiusKm: 5,
    currentCategory: "",
  }
);

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "update:searchQuery", value: string): void;
  (e: "update:search-query", value: string): void;
  (e: "update:searchInDescription", value: boolean): void;
  (e: "update:search-in-description", value: boolean): void;
  (e: "selectCategory", categoryId: string): void;
  (e: "apply"): void;
}>();

const localQuery = ref(props.searchQuery || "");
const debouncedLocalQuery = refDebounced(localQuery, 250);

const localInDesc = ref(props.searchInDescription || false);
const debouncedLocalInDesc = refDebounced(localInDesc, 150);
const inputRef = ref<any>(null);

// Синхронізація при відкритті
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      localQuery.value = props.searchQuery || "";
      localInDesc.value = props.searchInDescription || false;
      nextTick(() => {
        const inputEl = document.getElementById("mobile-search-input");
        if (inputEl) {
          inputEl.focus();
        }
      });
    }
  }
);

watch(localInDesc, (val) => {
  emit("update:searchInDescription", val);
  emit("update:search-in-description", val);
});

// Швидкі популярні підказки
const popularSuggestions = [
  "Гіпсокартон",
  "Профіль",
  "Штукатурка",
  "Шпаклівка",
  "Плитка",
  "Фарба",
  "Утеплювач",
  "OSB плити",
  "Газоблок",
  "Саморізи",
];

const safeProducts = computed(() => props.allProductsInRadius || []);
const safeRadiusKm = computed(() => Number(props.searchRadiusKm) || 5);

// Товари в радіусі, які відповідають введеному запиту за розумним алгоритмом
const filteredProducts = computed(() => {
  const q = (debouncedLocalQuery.value || "").trim();
  if (!q) return safeProducts.value;
  return safeProducts.value.filter((product) =>
    matchesSmartSearch(product, q, debouncedLocalInDesc.value)
  );
});

// Розбивка знайдених результатів за категоріями
const breakdown = computed(() => {
  const q = (localQuery.value || "").trim();
  if (!q) {
    return {
      totalMatches: safeProducts.value.length,
      categories: [] as CategoryMatchGroup[],
    };
  }
  return getCategoryMatchBreakdown(filteredProducts.value, CATEGORY_DATA);
});

const handleSelectCategory = (catId: string) => {
  const cleanQ = (localQuery.value || "").trim();
  emit("update:searchQuery", cleanQ);
  emit("update:search-query", cleanQ);
  emit("selectCategory", catId);
  emit("update:open", false);
};

const handleApplyAll = () => {
  const cleanQ = (localQuery.value || "").trim();
  emit("update:searchQuery", cleanQ);
  emit("update:search-query", cleanQ);
  emit("apply");
  emit("update:open", false);
};

const handleSelectSuggestion = (word: string) => {
  localQuery.value = word;
};

const clearQuery = () => {
  localQuery.value = "";
  const inputEl = document.getElementById("mobile-search-input");
  if (inputEl) {
    inputEl.focus();
  }
};
</script>

<template>
  <USlideover
    :open="open"
    title="Пошук матеріалів"
    :ui="{
      content: 'w-full sm:max-w-md flex flex-col h-full bg-white dark:bg-neutral-900',
    }"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="w-full flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span class="font-bold text-base text-neutral-900 dark:text-white">Пошук матеріалів</span>
        </div>
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          class="rounded-full"
          @click="emit('update:open', false)"
        />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col h-full space-y-4">
        <!-- Поле пошуку з кнопкою очищення -->
        <div class="relative">
          <UInput
            id="mobile-search-input"
            ref="inputRef"
            v-model="localQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Що шукаєте? (напр. гіпсокартон)"
            size="lg"
            class="w-full"
            :ui="{
              trailing: 'pe-2'
            }"
            @keydown.enter="handleApplyAll"
          >
            <template #trailing v-if="localQuery">
              <UButton
                color="neutral"
                variant="link"
                size="xs"
                icon="i-heroicons-x-mark"
                class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                @click="clearQuery"
              />
            </template>
          </UInput>
        </div>

        <!-- Опція: Шукати також в описі -->
        <div class="flex items-center justify-between px-1 py-0.5">
          <label
            for="search-in-desc-toggle"
            class="text-xs text-neutral-600 dark:text-neutral-300 select-none cursor-pointer flex items-center gap-2"
          >
            <UIcon name="i-lucide-file-text" class="w-4 h-4 text-neutral-400" />
            <span>Шукати також в описі оголошення</span>
          </label>
          <UCheckbox
            id="search-in-desc-toggle"
            v-model="localInDesc"
            color="primary"
          />
        </div>

        <div class="border-t border-neutral-200 dark:border-neutral-800 my-1"></div>

        <!-- Стан 1: Поле порожнє — Показуємо швидкі підказки -->
        <div v-if="!localQuery.trim()" class="space-y-3 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
            <span>Популярні запити</span>
            <span class="text-[11px] font-normal text-neutral-400">Швидкий вибір</span>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="sug in popularSuggestions"
              :key="sug"
              size="sm"
              color="neutral"
              variant="soft"
              class="rounded-full text-xs font-medium hover:border-brand-500 hover:text-brand-600 transition-colors"
              @click="handleSelectSuggestion(sug)"
            >
              {{ sug }}
            </UButton>
          </div>

          <div class="p-3 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-100 dark:border-brand-900/40 text-xs text-neutral-600 dark:text-neutral-300 mt-4 flex gap-2.5">
            <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <span>
              <strong>Розумний пошук:</strong> знаходить навіть з одруківками (наприклад, <em>«гіпокартон»</em>) та підтримує синоніми.
            </span>
          </div>
        </div>

        <!-- Стан 2: Введено запит -->
        <div v-else class="flex-1 overflow-y-auto space-y-3">
          <!-- Якщо результати знайдено в окремих категоріях -->
          <div v-if="breakdown.categories.length > 0" class="space-y-2">
            <div class="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
              Знайдено в категоріях (у радіусі {{ safeRadiusKm }} км):
            </div>

            <div class="space-y-2.5">
              <div
                v-for="group in breakdown.categories"
                :key="group.id"
                class="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-xs"
              >
                <!-- Головна категорія -->
                <div
                  class="flex items-center justify-between p-3 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 cursor-pointer transition-colors"
                  @click="handleSelectCategory(group.id)"
                >
                  <div class="flex items-center gap-2.5">
                    <UIcon :name="group.icon" class="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                    <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {{ group.name }}
                    </span>
                  </div>
                  <UBadge size="xs" color="neutral" variant="subtle">
                    {{ group.count }}
                  </UBadge>
                </div>

                <!-- Підкатегорії зі збігами -->
                <div v-if="group.subcategories.length > 0" class="divide-y divide-neutral-100 dark:divide-neutral-800/60 border-t border-neutral-100 dark:border-neutral-800/60">
                  <div
                    v-for="sub in group.subcategories"
                    :key="sub.id"
                    class="flex items-center justify-between py-2 px-3 pl-8 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 cursor-pointer transition-colors"
                    @click="handleSelectCategory(sub.id)"
                  >
                    <span class="text-xs text-neutral-700 dark:text-neutral-300">
                      {{ sub.name }}
                    </span>
                    <span class="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {{ sub.count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Стан: Нічого не знайдено -->
          <div
            v-else
            class="text-center py-8 px-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 mt-2"
          >
            <UIcon name="i-heroicons-face-frown" class="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
            <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Нічого не знайдено
            </p>
            <p class="text-xs text-neutral-500 leading-relaxed mb-3">
              За запитом «{{ localQuery }}» у радіусі {{ safeRadiusKm }} км немає матеріалів.
            </p>
            <p class="text-[11px] text-neutral-400">
              Спробуйте збільшити радіус пошуку або ввімкнути "Шукати також в описі".
            </p>
          </div>
        </div>

        <!-- Нижня закріплена кнопка дії -->
        <div class="pt-3 border-t border-neutral-200 dark:border-neutral-800 mt-auto">
          <UButton
            block
            size="lg"
            color="primary"
            :disabled="breakdown.totalMatches === 0 && Boolean(localQuery.trim())"
            @click="handleApplyAll"
          >
            <template v-if="localQuery.trim()">
              Показати оголошення ({{ breakdown.totalMatches }})
            </template>
            <template v-else>
              Показати всі матеріали ({{ breakdown.totalMatches }})
            </template>
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>
