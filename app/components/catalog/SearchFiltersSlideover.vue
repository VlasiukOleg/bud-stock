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
    searchRadius?: number;
    searchRadiusKm?: number;
    currentCategory?: string;
    currentStatus?: string;
    loading?: boolean;
    userCoords?: [number, number];
    useMock?: boolean;
  }>(),
  {
    searchQuery: "",
    searchInDescription: false,
    allProductsInRadius: () => [],
    searchRadius: 5000,
    searchRadiusKm: 5,
    currentCategory: "",
    currentStatus: "all",
    loading: false,
    userCoords: () => [50.4501, 30.5234],
    useMock: true,
  }
);

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "update:searchQuery", value: string): void;
  (e: "update:searchInDescription", value: boolean): void;
  (e: "update:searchRadius", value: number): void;
  (e: "selectCategory", categoryId: string): void;
  (e: "update:status", status: string): void;
  (e: "resetAll"): void;
  (e: "apply"): void;
}>();

// Локальний стан форми всередині шторки
const localQuery = ref(props.searchQuery || "");
const effectiveQuery = ref(props.searchQuery ? props.searchQuery.trim() : "");
let queryDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let searchRequestId = 0;

// При введенні тексту робимо дебаунс 400мс, але при очищенні або скиданні — миттєво обнуляємо без затримки!
watch(localQuery, (newVal) => {
  const trimmed = newVal.trim();
  if (queryDebounceTimer) {
    clearTimeout(queryDebounceTimer);
    queryDebounceTimer = null;
  }
  if (!trimmed) {
    effectiveQuery.value = "";
    return;
  }
  queryDebounceTimer = setTimeout(() => {
    effectiveQuery.value = trimmed;
  }, 400);
});

const localInDesc = ref(props.searchInDescription || false);
const localCategory = ref(props.currentCategory || "");
const localStatus = ref(props.currentStatus || "all");
const localRadius = ref(props.searchRadius || 5000);
const debouncedLocalRadius = refDebounced(localRadius, 400);

const localRadiusKm = computed(() => {
  const r = Number(localRadius.value);
  return isNaN(r) || r <= 0 ? 5 : Math.round(r / 1000);
});

// Синхронізація при відкритті
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      searchRequestId++;
      if (queryDebounceTimer) {
        clearTimeout(queryDebounceTimer);
        queryDebounceTimer = null;
      }
      localQuery.value = props.searchQuery || "";
      effectiveQuery.value = (props.searchQuery || "").trim();
      localInDesc.value = props.searchInDescription || false;
      localCategory.value = props.currentCategory || "";
      localStatus.value = props.currentStatus || "all";
      localRadius.value = props.searchRadius || 5000;
      matchingCount.value = props.allProductsInRadius?.length || 0;
      isCounting.value = false;
      lastSearchQueryKey = "";

      // Якщо вже є активний текстовий запит, завантажуємо розбивку по категоріях для нього
      if (effectiveQuery.value.length >= 3) {
        updateCount();
      } else {
        serverSearchResults.value = [];
      }
    }
  }
);

// Оновлюємо кількість, якщо вона змінилася ззовні, поки шторка відкрита без власних змін
watch(
  () => props.allProductsInRadius,
  (newList) => {
    if (!props.open) {
      matchingCount.value = newList?.length || 0;
    }
  }
);

// Поки шторка відкрита, каталог НЕ оновлюється — робимо лише легкий запит-підрахунок (updateCount).
// Фільтри застосовуються до каталогу одним разом при натисканні «Показати оголошення».

// Товари, знайдені за пошуковим запитом на сервері (з полями id, category_id)
const serverSearchResults = ref<Array<{ id: string | number; category_id: string }>>([]);
let lastSearchQueryKey = "";

// Розбивка знайдених результатів за категоріями (якщо введено пошуковий запит від 3 символів)
const breakdown = computed(() => {
  const q = effectiveQuery.value;
  if (!q || q.length < 3) {
    return {
      totalMatches: 0,
      categories: [] as CategoryMatchGroup[],
    };
  }
  return getCategoryMatchBreakdown(serverSearchResults.value, CATEGORY_DATA);
});

const { countListings, searchListings } = useListings();

const matchingCount = ref<number>(props.allProductsInRadius?.length || 0);
const isCounting = ref<boolean>(false);

const updateCount = async () => {
  if (!props.open) return;
  const thisRequestId = ++searchRequestId;
  isCounting.value = true;
  try {
    const coords = props.userCoords || [50.4501, 30.5234];
    const q = effectiveQuery.value.trim();
    const cleanQ = q.length >= 3 ? q : undefined;

    // ВАРІАНТ 1: Якщо введено пошуковий запит (від 3 символів)
    // Отримуємо легкі дані (тільки id та category_id), щоб сформувати точну розбивку категорій!
    if (cleanQ) {
      const searchKey = `${cleanQ}_${localRadius.value}_${localStatus.value}_${localInDesc.value}_${props.useMock}`;

      // Виконуємо запит до сервера тільки якщо параметри пошуку (текст, радіус, стан) реально змінилися
      if (searchKey !== lastSearchQueryKey || serverSearchResults.value.length === 0) {
        lastSearchQueryKey = searchKey;
        const data = await searchListings({
          userLat: coords[0],
          userLng: coords[1],
          radiusMeters: localRadius.value || 5000,
          categoryId: undefined, // Шукаємо у всіх категоріях для точної розбивки
          searchQuery: cleanQ,
          status: localStatus.value,
          searchInDescription: localInDesc.value,
          useMock: props.useMock ?? true,
          onlyCategoryFields: true, // Запитуємо тільки id, category_id!
          fetchAll: true,
        });

        if (thisRequestId !== searchRequestId || !props.open) return;
        serverSearchResults.value = (data as any[]) || [];
      }

      if (thisRequestId !== searchRequestId || !props.open) return;

      // Якщо паралельно обрана конкретна категорія:
      if (localCategory.value) {
        const filtered = serverSearchResults.value.filter((p) => {
          const cat = p.category_id;
          return cat === localCategory.value || cat.startsWith(`${localCategory.value}-`);
        });
        matchingCount.value = filtered.length;
      } else {
        matchingCount.value = serverSearchResults.value.length;
      }
    } else {
      // ВАРІАНТ 2: Пошук без тексту (тільки вибір категорії, радіус, стан)
      serverSearchResults.value = [];
      lastSearchQueryKey = "";

      const total = await countListings({
        userLat: coords[0],
        userLng: coords[1],
        radiusMeters: localRadius.value || 5000,
        categoryId: localCategory.value || undefined,
        status: localStatus.value,
        searchInDescription: localInDesc.value,
        useMock: props.useMock ?? true,
      });

      if (thisRequestId !== searchRequestId || !props.open) return;
      matchingCount.value = typeof total === "number" ? total : 0;
    }
  } catch (err) {
    console.error("Помилка підрахунку оголошень:", err);
  } finally {
    if (thisRequestId === searchRequestId) {
      isCounting.value = false;
    }
  }
};

// Запит на підрахунок відправляється ТІЛЬКИ коли користувач дійсно змінив параметри фільтрів
watch(
  [
    () => effectiveQuery.value,
    () => localCategory.value,
    () => localStatus.value,
    () => debouncedLocalRadius.value,
    () => localInDesc.value,
    () => props.userCoords,
    () => props.useMock,
  ],
  () => {
    if (!props.open) return;

    // Перевіряємо, чи фільтри відрізняються від поточного стану каталогу
    const isUnchanged =
      effectiveQuery.value.trim() === (props.searchQuery || "").trim() &&
      localInDesc.value === (props.searchInDescription || false) &&
      localCategory.value === (props.currentCategory || "") &&
      localStatus.value === (props.currentStatus || "all") &&
      Number(debouncedLocalRadius.value) === Number(props.searchRadius || 5000);

    if (isUnchanged) {
      // Нічого не змінювали — беремо вже завантажену кількість без запиту до сервера!
      matchingCount.value = props.allProductsInRadius?.length || 0;
      serverSearchResults.value = [];
      lastSearchQueryKey = "";
      return;
    }

    updateCount();
  }
);

const handleSelectCategory = (catId: string) => {
  if (localCategory.value === catId) return;
  localCategory.value = catId;
  // Якщо є пошукові результати за текстом, миттєво перераховуємо кількість для кнопки локально
  if (serverSearchResults.value.length > 0 && effectiveQuery.value.trim().length >= 3) {
    if (catId) {
      const filtered = serverSearchResults.value.filter((p) => {
        const cat = p.category_id;
        return cat === catId || cat.startsWith(`${catId}-`);
      });
      matchingCount.value = filtered.length;
    } else {
      matchingCount.value = serverSearchResults.value.length;
    }
  }
};

const handleSelectStatus = (stVal: string) => {
  localStatus.value = stVal;
};

const clearQuery = () => {
  if (queryDebounceTimer) {
    clearTimeout(queryDebounceTimer);
    queryDebounceTimer = null;
  }
  const wasAlreadyEmpty = !effectiveQuery.value;
  localQuery.value = "";
  effectiveQuery.value = "";
  serverSearchResults.value = [];
  lastSearchQueryKey = "";
  if (wasAlreadyEmpty) {
    updateCount();
  }
  const inputEl = document.getElementById("search-filters-input");
  if (inputEl) {
    inputEl.focus();
  }
};

const hasActiveFilters = computed(() => {
  const hasQuery = localQuery.value.trim().length > 0;
  const hasCategory = !!localCategory.value;
  const hasStatus = localStatus.value !== "all";
  const hasInDesc = localInDesc.value;
  const hasCustomRadius = Number(localRadius.value) !== Number(props.searchRadius || 5000);
  return hasQuery || hasCategory || hasStatus || hasInDesc || hasCustomRadius;
});

const resetAll = () => {
  if (!hasActiveFilters.value) return;

  searchRequestId++;
  if (queryDebounceTimer) {
    clearTimeout(queryDebounceTimer);
    queryDebounceTimer = null;
  }
  localQuery.value = "";
  effectiveQuery.value = "";
  localInDesc.value = false;
  localCategory.value = "";
  localStatus.value = "all";
  localRadius.value = props.searchRadius || 5000;
  serverSearchResults.value = [];
  lastSearchQueryKey = "";
};

const handleApply = () => {
  const cleanQ = (localQuery.value || "").trim();
  const finalQ = cleanQ.length >= 3 ? cleanQ : "";
  emit("update:searchQuery", finalQ);
  emit("update:searchInDescription", localInDesc.value);
  emit("selectCategory", localCategory.value);
  emit("update:status", localStatus.value);
  emit("update:searchRadius", localRadius.value);
  emit("apply");
  emit("update:open", false);
};
</script>

<template>
  <USlideover
    :open="open"
    title="Пошук та фільтри"
    :ui="{
      content: 'w-full sm:max-w-md flex flex-col h-full bg-white dark:bg-neutral-900',
    }"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="w-full flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-brand-500/10 dark:bg-brand-400/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5" />
          </div>
          <div>
            <span class="font-bold text-base text-neutral-900 dark:text-white leading-tight block">
              Пошук та фільтри
            </span>
            <span class="text-xs text-neutral-500 font-normal">
              У радіусі {{ localRadiusKm }} км
            </span>
          </div>
        </div>
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          class="rounded-full"
          @click="() => { emit('update:open', false) }"
        />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col h-full space-y-3 overflow-y-auto overflow-x-hidden pb-4">
        <!-- 1. Категорія матеріалів -->
        <div class="bg-neutral-100 dark:bg-neutral-800/70 rounded-2xl p-3.5 sm:p-4 border border-neutral-200 dark:border-neutral-700/70 space-y-2.5">
          <div class="flex justify-between items-center">
            <label class="block font-medium text-sm text-neutral-800 dark:text-neutral-200">
              Категорія матеріалів
            </label>
            <UButton
              v-if="localCategory"
              size="xs"
              color="neutral"
              variant="link"
              class="text-xs text-brand-600 hover:underline p-0 h-auto"
              @click="handleSelectCategory('')"
            >
              Скинути категорію
            </UButton>
          </div>

          <CommonCategoryPicker
            :model-value="localCategory"
            @update:model-value="handleSelectCategory"
          />
        </div>

        <!-- 2. Поле пошуку з кнопкою очищення -->
        <div class="bg-neutral-100 dark:bg-neutral-800/70 rounded-2xl p-3.5 sm:p-4 border border-neutral-200 dark:border-neutral-700/70 space-y-3">
          <div class="space-y-1.5">
            <label class="block font-medium text-sm text-neutral-800 dark:text-neutral-200">
              Пошук за назвою або описом
            </label>
            <div class="relative">
              <UInput
                id="search-filters-input"
                v-model="localQuery"
                icon="i-heroicons-magnifying-glass"
                placeholder="Що шукаєте? (напр. гіпсокартон)"
                size="lg"
                class="w-full bg-white dark:bg-neutral-900 rounded-lg"
                :ui="{
                  trailing: 'pe-2'
                }"
                @keydown.enter="handleApply"
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
              <p
                v-if="localQuery.trim().length > 0 && localQuery.trim().length < 3"
                class="text-xs text-amber-600 dark:text-amber-400 px-1 pt-1 font-medium"
              >
                Введіть щонайменше 3 символи для пошуку...
              </p>
            </div>
          </div>

          <!-- Опція: Шукати також в описі -->
          <div class="flex items-center justify-between px-1 pt-0.5">
            <label
              for="search-in-desc-toggle-unified"
              class="text-xs text-neutral-600 dark:text-neutral-300 select-none cursor-pointer flex items-center gap-2"
            >
              <UIcon name="i-lucide-file-text" class="w-4 h-4 text-neutral-400" />
              <span>Шукати також в описі оголошення</span>
            </label>
            <UCheckbox
              id="search-in-desc-toggle-unified"
              v-model="localInDesc"
              color="primary"
            />
          </div>

          <!-- Підказки для уточнення категорії при текстовому пошуку -->
          <div v-if="localQuery.trim()" class="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/50">
            <div v-if="breakdown.categories.length > 0" class="space-y-2">
              <div class="flex justify-between items-center px-1">
                <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Уточнити за категорією:
                </span>
                <span class="text-xs text-neutral-400">
                  Разом: {{ breakdown.totalMatches }} шт
                </span>
              </div>

              <div class="space-y-1.5 max-h-48 overflow-y-auto">
                <div
                  v-for="group in breakdown.categories"
                  :key="group.id"
                  class="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-xs"
                >
                  <!-- Головна категорія -->
                  <div
                    class="flex items-center justify-between p-2.5 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 cursor-pointer transition-colors"
                    :class="{ 'ring-2 ring-brand-500 bg-brand-50/70 font-bold': localCategory === group.id }"
                    @click="handleSelectCategory(localCategory === group.id ? '' : group.id)"
                  >
                    <div class="flex items-center gap-2">
                      <UIcon :name="group.icon" class="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                      <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {{ group.name }}
                      </span>
                    </div>
                    <UBadge size="xs" :color="localCategory === group.id ? 'primary' : 'neutral'" variant="subtle">
                      {{ group.count }}
                    </UBadge>
                  </div>

                  <!-- Підкатегорії -->
                  <div v-if="group.subcategories.length > 0" class="divide-y divide-neutral-100 dark:divide-neutral-800/60 border-t border-neutral-100 dark:border-neutral-800/60">
                    <div
                      v-for="sub in group.subcategories"
                      :key="sub.id"
                      class="flex items-center justify-between py-1.5 px-3 pl-8 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 cursor-pointer transition-colors"
                      :class="{ 'bg-brand-100/60 font-bold dark:bg-brand-900/40': localCategory === sub.id }"
                      @click="handleSelectCategory(localCategory === sub.id ? '' : sub.id)"
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

            <div
              v-else-if="isCounting"
              class="text-center py-4 px-3 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 mx-auto text-brand-500 animate-spin mb-1" />
              <p class="text-xs text-neutral-500 font-medium">
                Пошук категорій на сервері...
              </p>
            </div>

            <div
              v-else
              class="text-center py-4 px-3 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800"
            >
              <UIcon name="i-heroicons-face-frown" class="w-7 h-7 mx-auto text-neutral-400 mb-1" />
              <p class="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Нічого не знайдено за запитом «{{ localQuery }}»
              </p>
            </div>
          </div>
        </div>

        <!-- 3. Радіус пошуку -->
        <div class="bg-neutral-100 dark:bg-neutral-800/70 rounded-2xl p-3.5 sm:p-4 border border-neutral-200 dark:border-neutral-700/70 space-y-3">
          <div class="flex justify-between items-center">
            <span class="font-medium text-sm text-neutral-800 dark:text-neutral-200">Радіус пошуку</span>
            <UBadge
              size="md"
              class="!bg-white dark:!bg-neutral-800 !text-neutral-800 dark:!text-neutral-200 font-bold border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs"
              variant="soft"
            >
              {{ localRadiusKm }} км
            </UBadge>
          </div>

          <USlider
            v-model="localRadius"
            :min="1000"
            :max="50000"
            :step="1000"
            size="md"
            :ui="{
              range: '!bg-brand-400',
              thumb: '!ring-brand-400 focus-visible:!outline-brand-400/50',
            }"
          />
        </div>

        <!-- 4. Стан матеріалів -->
        <div class="bg-neutral-100 dark:bg-neutral-800/70 rounded-2xl p-3.5 sm:p-4 border border-neutral-200 dark:border-neutral-700/70 space-y-3">
          <label class="block font-medium text-sm text-neutral-800 dark:text-neutral-200">
            Стан матеріалів
          </label>
          <div class="grid grid-cols-3 gap-2">
            <UButton
              v-for="st in [
                { label: 'Будь-який', value: 'all' },
                { label: 'Новий', value: 'новий' },
                { label: 'Відкритий / б/в', value: 'залишок' }
              ]"
              :key="st.value"
              size="sm"
              class="justify-center font-medium transition-colors"
              :class="localStatus === st.value
                ? '!bg-brand-400 hover:!bg-brand-500 !text-white border-transparent shadow-xs'
                : '!bg-white hover:!bg-neutral-100 !text-neutral-700 dark:!bg-neutral-800 dark:hover:!bg-neutral-700 dark:!text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs'"
              @click="() => { handleSelectStatus(st.value) }"
            >
              {{ st.label }}
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <!-- Фіксований нижній бар дій -->
      <div class="w-full flex items-center gap-3 pt-2">
        <UButton
          color="neutral"
          variant="soft"
          size="lg"
          class="shrink-0"
          :disabled="!hasActiveFilters || isCounting"
          @click="resetAll"
        >
          Скинути
        </UButton>
        <UButton
          block
          size="lg"
          color="primary"
          :loading="loading || isCounting"
          class="flex-1 justify-center shadow-md font-bold"
          @click="handleApply"
        >
          Показати оголошення ({{ matchingCount }})
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
