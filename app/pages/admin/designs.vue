<script setup lang="ts">
import { ADMIN_EMAILS } from '~/composables/useAdmin';
import { LISTING_DURATION_DAYS } from '~/constants/listing';

definePageMeta({
  middleware: [
    async () => {
      const user = useSupabaseUser();
      const client = useSupabaseClient();

      let email = user.value?.email?.toLowerCase();
      if (!email) {
        const { data } = await client.auth.getUser();
        email = data?.user?.email?.toLowerCase();
      }

      const isAdminUser = !!(email && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email));

      if (!isAdminUser) {
        return navigateTo('/');
      }
    }
  ]
});

useSeoMeta({
  title: 'Лабораторія дизайну: Контраст та межі карток | BudStock',
  description: 'Порівняння варіантів оформлення меж та контрасту карток товарів'
});

const toast = useToast();
const colorMode = useColorMode();
const { isAdmin } = useAdmin();
const activeTab = ref<'hero' | 'borders' | 'dots'>('hero');
const previewLang = ref<'uk' | 'ru'>('uk');

const heroTexts = computed(() => {
  if (previewLang.value === 'ru') {
    return {
      fast: 'БЫСТРО',
      convenient: 'УДОБНО',
      nearby: 'РЯДОМ',
      fastCap: 'Быстро',
      convCap: 'Удобно',
      nearCap: 'Рядом',
      sell: 'ПРОДАВАЙ',
      buy: 'ПОКУПАЙ',
      sellAndBuy: 'ПРОДАВАЙ И ПОКУПАЙ',
      materials: 'СТРОЙМАТЕРИАЛЫ',
      materialsNearby: 'СТРОЙМАТЕРИАЛЫ РЯДОМ',
      leftoversTag: 'Остатки после ремонта',
      warehousesTag: 'Склады и магазины рядом',
      leftoversShort: 'Частные остатки',
      warehousesShort: 'Стройбазы и магазины',
      districtBadge: 'Маркетплейс твоего района',
      buyProfit: 'ПОКУПАЙ ВЫГОДНО.',
      sellFast: 'ПРОДАВАЙ БЫСТРО.',
      sellLeftovers: 'ПРОДАВАЙ ОСТАТКИ.',
      buyMaterials: 'ПОКУПАЙ СТРОЙМАТЕРИАЛЫ.',
      subLine: 'От остатков после ремонта — до строительных баз и магазинов рядом'
    };
  }
  return {
    fast: 'ШВИДКО',
    convenient: 'ЗРУЧНО',
    nearby: 'ПОРУЧ',
    fastCap: 'Швидко',
    convCap: 'Зручно',
    nearCap: 'Поруч',
    sell: 'ПРОДАВАЙ',
    buy: 'КУПУЙ',
    sellAndBuy: 'ПРОДАВАЙ ТА КУПУЙ',
    materials: 'БУДМАТЕРІАЛИ',
    materialsNearby: 'БУДМАТЕРІАЛИ ПОРУЧ',
    leftoversTag: 'Залишки після ремонту',
    warehousesTag: 'Склади та магазини поруч',
    leftoversShort: 'Приватні залишки',
    warehousesShort: 'Будбази та магазини',
    districtBadge: 'Маркетплейс твого району',
    buyProfit: 'КУПУЙ ВИГІДНО.',
    sellFast: 'ПРОДАВАЙ ШВИДКО.',
    sellLeftovers: 'ПРОДАВАЙ ЗАЛИШКИ.',
    buyMaterials: 'КУПУЙ БУДМАТЕРІАЛИ.',
    subLine: 'Від залишків після ремонту — до будівельних баз та магазинів поруч'
  };
});

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

// Зразок товару (як на скріншоті з мобільного)
const sampleProduct = {
  id: 'test-1',
  title: 'Ґрунтовка Artisan №15 Бетоноконтакт 15 кг',
  price: 650,
  unit: 'шт',
  quantity: 2,
  location: { address: 'Інститутська вулиця, 22/7, Липки, Київ' },
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  expires_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
  views: 2,
  phone_views: 2,
  images: [
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop'
  ]
};

const menuActions = [
  [
    {
      label: 'Редагувати оголошення',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => toast.add({ title: 'Натиснуто: Редагувати', color: 'info' })
    },
    {
      label: 'Переглянути в каталозі',
      icon: 'i-heroicons-arrow-top-right-on-square',
      onSelect: () => toast.add({ title: 'Натиснуто: Переглянути', color: 'neutral' })
    },
    {
      label: 'Скопіювати посилання',
      icon: 'i-heroicons-document-duplicate',
      onSelect: () => toast.add({ title: 'Посилання скопійовано', color: 'success' })
    }
  ],
  [
    {
      label: 'Позначити проданим',
      icon: 'i-heroicons-check-circle',
      onSelect: () => toast.add({ title: 'Натиснуто: Позначити проданим', color: 'success' })
    },
    {
      label: 'Деактивувати (приховати)',
      icon: 'i-heroicons-pause',
      onSelect: () => toast.add({ title: 'Натиснуто: Деактивувати', color: 'neutral' })
    }
  ]
];

// 5 Варіантів контрасту та меж карток
const cardBorderVariants = [
  {
    id: 1,
    name: 'М\'яка об\'ємна тінь (Soft Ambient Elevation)',
    tag: '⭐ Рекомендований (Сучасний SaaS)',
    tagColor: 'primary' as const,
    description: 'Виразна м\'яка багатошарова тінь фізично відриває картку від білого тла. Картки не зливаються навіть при мінімальній різниці кольорів фону.',
    cardClass: 'bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-4 shadow-[0_6px_25px_-4px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.06)] dark:shadow-none transition-all flex flex-col justify-between hover:translate-y-[-2px]',
    canvasBg: 'bg-neutral-100/60 dark:bg-neutral-950',
    notes: 'Ідеально для мобільних екранів, чіткі межі без візуального шуму.'
  },
  {
    id: 2,
    name: 'Графічний контрастний контур (Crisp Defined Border)',
    tag: '🎯 Чіткі межі (Linear Style)',
    tagColor: 'neutral' as const,
    description: 'Бордер подвійної товщини (border-2) та насиченіший сірий тон. Контур залишається кришталево чітким на сонці або високій яскравості.',
    cardClass: 'bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700/80 rounded-2xl p-4 shadow-xs hover:border-brand-400 dark:hover:border-brand-600 transition-all flex flex-col justify-between',
    canvasBg: 'bg-neutral-100/60 dark:bg-neutral-950',
    notes: 'Для любителів строгої геометрії та максимального розмежування.'
  },
  {
    id: 3,
    name: 'Фірмова верхня грань (Brand Top Accent Line)',
    tag: '🔥 Фірмовий штрих BudStock',
    tagColor: 'warning' as const,
    description: 'Акуратний м\'який помаранчевий штрих (на тон світліший: brand-400) зверху картки + помірна тінь. Чітко розмежовує картки у вертикальній стрічці.',
    cardClass: 'bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 border-t-[3px] border-t-brand-400 dark:border-t-brand-400 rounded-2xl p-4 shadow-[0_4px_18px_-2px_rgba(0,0,0,0.07)] dark:shadow-none transition-all flex flex-col justify-between',
    canvasBg: 'bg-neutral-100/60 dark:bg-neutral-950',
    notes: 'Створює ефект фірмової картки бренду, візуально розмежовуючи кожен лот.'
  },
  {
    id: 4,
    name: 'Глибший контраст сторінки (Deeper Page Canvas)',
    tag: '📄 Контрастне тло сторінки',
    tagColor: 'neutral' as const,
    description: 'Фон сайту робиться трохи темнішим (bg-neutral-100 / cool gray замість блідого bg-gray-50), а картка залишається білосніжною.',
    cardClass: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between',
    canvasBg: 'bg-neutral-200/70 dark:bg-black',
    notes: 'Класичний підхід Airbnb / Mac OS: білий папір на фактурному столі.'
  },
  {
    id: 5,
    name: 'Багатошарова преміум-плашка (Nested Layered Surface)',
    tag: '💎 Двоколірна картка',
    tagColor: 'neutral' as const,
    description: 'Картка має теплий сірий фон (bg-neutral-50/90), а внутрішній блок фото та кнопки — контрастно білі. Створює відчуття преміум-матеріалу.',
    cardClass: 'bg-neutral-50/90 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between',
    canvasBg: 'bg-neutral-100/60 dark:bg-neutral-950',
    notes: 'М\'який приємний віжуал, який зменшує втому очей при довгому скролі.'
  }
];

// Варіанти кнопок меню три крапки (з попереднього тесту)
const dotsVariants = [
  {
    id: 1,
    name: 'Фірмовий м\'який кружечок',
    tag: '⭐ Активний у проекті',
    tagColor: 'primary' as const,
    description: 'Ніжний фірмовий фон bg-brand-50 з помаранчевими крапками text-brand-600.',
    buttonClass: 'rounded-full w-7 h-7 p-0 flex items-center justify-center shrink-0 -mr-1 -mt-1 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 dark:text-brand-400 cursor-pointer transition-colors shadow-2xs',
    icon: 'i-heroicons-ellipsis-vertical'
  },
  {
    id: 2,
    name: 'Елегантне контурне коло',
    tag: '🌟 Преміум контур',
    tagColor: 'neutral' as const,
    description: 'Світло-сіре коло з тонкою рамкою, помаранчевий ховер.',
    buttonClass: 'rounded-full w-7 h-7 p-0 flex items-center justify-center shrink-0 -mr-1 -mt-1 bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50/50 dark:hover:border-brand-400 dark:hover:text-brand-400 cursor-pointer transition-all shadow-2xs',
    icon: 'i-heroicons-ellipsis-vertical'
  },
  {
    id: 3,
    name: 'Нейтральний софт-кружечок',
    tag: '🔘 Стиль Airbnb / iOS',
    tagColor: 'neutral' as const,
    description: 'Чистий плоский кружечок без рамки.',
    buttonClass: 'rounded-full w-7 h-7 p-0 flex items-center justify-center shrink-0 -mr-1 -mt-1 bg-neutral-100 hover:bg-neutral-200/90 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer transition-colors',
    icon: 'i-heroicons-ellipsis-vertical'
  }
];
</script>

<template>
  <div v-if="isAdmin" class="min-h-screen bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pb-20">
    <!-- Шапка сторінки -->
    <header class="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 sm:px-8">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-brand-500 animate-pulse"></span>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Лабораторія дизайну карток</h1>
          </div>
          <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Тестуй контраст, тіні та межі карток для мобільного та десктопу
          </p>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <UButton
            icon="i-heroicons-sun"
            variant="outline"
            color="neutral"
            size="sm"
            class="rounded-xl"
            @click="toggleTheme"
          >
            {{ colorMode.value === 'dark' ? 'Темна тема 🌙' : 'Світла тема ☀️' }}
          </UButton>
          <UButton
            to="/profile/listings"
            icon="i-heroicons-arrow-left"
            variant="soft"
            color="primary"
            size="sm"
            class="rounded-xl font-semibold"
          >
            До кабінету
          </UButton>
        </div>
      </div>

      <!-- Вкладки вибору теми тесту -->
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'hero' ? 'bg-brand-500 text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'"
            @click="activeTab = 'hero'"
          >
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            <span>🔥 Герой (10 концептів заголовка)</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'borders' ? 'bg-brand-500 text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'"
            @click="activeTab = 'borders'"
          >
            <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4" />
            <span>Межі карток</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'dots' ? 'bg-brand-500 text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'"
            @click="activeTab = 'dots'"
          >
            <UIcon name="i-heroicons-ellipsis-vertical" class="w-4 h-4" />
            <span>Меню «Три крапки»</span>
          </button>
        </div>

        <!-- Перемикач мови прев'ю (УКР / РУС) -->
        <div v-if="activeTab === 'hero'" class="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="previewLang === 'uk' ? 'bg-white dark:bg-neutral-900 text-brand-600 shadow-2xs' : 'text-neutral-500'"
            @click="previewLang = 'uk'"
          >
            🇺🇦 УКР
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="previewLang === 'ru' ? 'bg-white dark:bg-neutral-900 text-brand-600 shadow-2xs' : 'text-neutral-500'"
            @click="previewLang = 'ru'"
          >
            🌐 РУС (тест ширини)
          </button>
        </div>
      </div>
    </header>

    <!-- СЕКЦІЯ 0: 10 КОНЦЕПТІВ ЗАГОЛОВКА HERO -->
    <main v-if="activeTab === 'hero'" class="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
      <div class="mb-6 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900/40 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <span class="font-bold">Як тестувати:</span>
            Можна комбінувати ідеї! Наприклад: «Верхня плашка з Концепту 1 + Заголовок з Концепту 3 + Нижні бейджі складів з Концепту 7». Перемикай мову зверху (УКР/РУС), щоб перевірити довжину слів на мобілці.
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- КОНЦЕПТ 1 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">SaaS Капсула + Міні-чіпи джерел</span>
              </div>
              <UBadge color="primary" variant="subtle" size="sm" class="font-bold text-[10px]">⭐ Фаворит</UBadge>
            </div>

            <!-- Прев'ю заголовка -->
            <div class="py-3 text-center sm:text-left font-raleway">
              <!-- Верхня плашка -->
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                <span>{{ heroTexts.fast }}</span>
                <span class="text-brand-300 dark:text-brand-700">•</span>
                <span>{{ heroTexts.convenient }}</span>
                <span class="text-brand-300 dark:text-brand-700">•</span>
                <span>{{ heroTexts.nearby }}</span>
              </div>

              <!-- Головний заголовок -->
              <div class="space-y-1.5 uppercase font-extrabold tracking-tight">
                <div class="text-2xl sm:text-4xl text-neutral-900 dark:text-white leading-none">
                  {{ heroTexts.sell }} <span class="text-brand-500">•</span> {{ heroTexts.buy }}
                </div>
                <div class="text-3xl sm:text-5xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 bg-clip-text text-transparent leading-none pb-1">
                  {{ heroTexts.materials }}
                </div>
              </div>

              <!-- Непримітні бейджі про залишки та склади -->
              <div class="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 font-public">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold">
                  <UIcon name="i-heroicons-home-modern" class="w-3.5 h-3.5 text-brand-500" />
                  {{ heroTexts.leftoversTag }}
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold">
                  <UIcon name="i-heroicons-building-storefront" class="w-3.5 h-3.5 text-blue-500" />
                  {{ heroTexts.warehousesTag }}
                </span>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Верхній рядок схований в акуратну капсулу і більше не сперечається з головним заголовком. Знизу дві стильні плашки про залишки і склади.
          </p>
        </div>

        <!-- КОНЦЕПТ 2 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Акцентна плашка (Highlight Sticker)</span>
              </div>
              <UBadge color="warning" variant="subtle" size="sm" class="font-bold text-[10px]">🔥 Яскравий</UBadge>
            </div>

            <div class="py-3 text-center sm:text-left font-raleway">
              <!-- Верхній бейдж -->
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[11px] font-extrabold uppercase tracking-widest mb-4">
                <UIcon name="i-heroicons-bolt-solid" class="w-3.5 h-3.5 text-brand-400 dark:text-brand-500" />
                <span>{{ heroTexts.fast }} • {{ heroTexts.convenient }} • {{ heroTexts.nearby }}</span>
              </div>

              <!-- Заголовок із виділеним стікером -->
              <div class="space-y-2 uppercase font-extrabold tracking-tight">
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-2xl sm:text-4xl leading-none">
                  <span class="px-3 py-1 rounded-xl bg-brand-500 text-white shadow-sm -rotate-1 inline-block">
                    {{ heroTexts.sell }}
                  </span>
                  <span class="text-neutral-400 font-light">/</span>
                  <span class="text-neutral-900 dark:text-white">
                    {{ heroTexts.buy }}
                  </span>
                </div>
                <div class="text-2xl sm:text-4xl text-neutral-800 dark:text-neutral-100 leading-none pt-1">
                  {{ heroTexts.materials }}
                </div>
              </div>

              <!-- Тонка елегантна стрічка знизу -->
              <div class="mt-4 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center sm:justify-start gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-public font-medium">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-brand-500 shrink-0" />
                <span>{{ heroTexts.leftoversShort }} + {{ heroTexts.warehousesShort }} на одній мапі</span>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Слово «ПРОДАВАЙ» на соковитій помаранчевій плашці з легким нахилом одразу чіпляє погляд.
          </p>
        </div>

        <!-- КОНЦЕПТ 3 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Дві дії у 2 рядки (Split Action)</span>
              </div>
              <UBadge color="neutral" variant="subtle" size="sm" class="font-bold text-[10px]">💎 Преміум ритм</UBadge>
            </div>

            <div class="py-3 text-center sm:text-left font-raleway">
              <!-- Верхня плашка з двома тегами -->
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <span>⚡ {{ heroTexts.fast }}</span>
                <span>•</span>
                <span>👍 {{ heroTexts.convenient }}</span>
                <span>•</span>
                <span>📍 {{ heroTexts.nearby }}</span>
              </div>

              <!-- Дворядковий слоган -->
              <div class="space-y-1 uppercase font-black tracking-tight">
                <div class="text-2xl sm:text-4xl text-neutral-900 dark:text-white leading-tight">
                  {{ heroTexts.buyProfit }}
                </div>
                <div class="text-2xl sm:text-4xl text-brand-500 leading-tight">
                  {{ heroTexts.sellFast }}
                </div>
              </div>

              <!-- Блок будматеріалів + склади -->
              <div class="mt-3 inline-flex flex-wrap items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-xl bg-brand-500/8 dark:bg-brand-500/15 border border-brand-500/20 font-public">
                <span class="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {{ heroTexts.materials }}:
                </span>
                <span class="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ heroTexts.leftoversShort.toLowerCase() }} та {{ heroTexts.warehousesShort.toLowerCase() }} поруч
                </span>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Замість просто переліку слів — два сильні заклики в окремих рядках, які ніколи не ламаються на мобілці.
          </p>
        </div>

        <!-- КОНЦЕПТ 4 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">4</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Архітектурна лінія зліва (Blueprint)</span>
              </div>
              <UBadge color="neutral" variant="subtle" size="sm" class="font-bold text-[10px]">📐 Строгий стиль</UBadge>
            </div>

            <div class="py-3 font-raleway">
              <div class="border-l-4 border-brand-500 pl-4 sm:pl-5 text-left space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                  {{ heroTexts.fast }} • {{ heroTexts.convenient }} • {{ heroTexts.nearby }}
                </div>

                <div class="text-2xl sm:text-4xl font-extrabold uppercase text-brand-500 leading-none">
                  {{ heroTexts.sell }} • {{ heroTexts.buy }}
                </div>

                <div class="text-2xl sm:text-4xl font-extrabold uppercase text-neutral-900 dark:text-white leading-none">
                  {{ heroTexts.materials }}
                </div>

                <div class="pt-1 flex flex-wrap items-center gap-2 font-public text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  <span class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    {{ heroTexts.leftoversTag }}
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {{ heroTexts.warehousesTag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Ліва помаранчева лінія тримає весь текст як єдиний монолітний блок. Верхній рядок зменшений і розряджений (`tracking-[0.2em]`).
          </p>
        </div>

        <!-- КОНЦЕПТ 5 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">5</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Дві кнопки-плашки дій (Bento Pills)</span>
              </div>
              <UBadge color="primary" variant="subtle" size="sm" class="font-bold text-[10px]">🧱 Інтерактивний вигляд</UBadge>
            </div>

            <div class="py-3 text-center sm:text-left font-raleway">
              <!-- Верхній рядок -->
              <div class="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 flex items-center justify-center sm:justify-start gap-2">
                <span class="h-px w-6 bg-brand-500"></span>
                <span>{{ heroTexts.fast }} • {{ heroTexts.convenient }} • {{ heroTexts.nearby }}</span>
                <span class="h-px w-6 bg-brand-500 sm:hidden"></span>
              </div>

              <!-- ПРОДАВАЙ та КУПУЙ у власних блоках -->
              <div class="inline-grid grid-cols-2 gap-2.5 mb-2.5 w-full sm:w-auto">
                <div class="px-4 py-2 rounded-2xl bg-brand-500 text-white font-extrabold text-lg sm:text-2xl uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-xs">
                  <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5 shrink-0" />
                  <span>{{ heroTexts.sell }}</span>
                </div>
                <div class="px-4 py-2 rounded-2xl bg-neutral-900 dark:bg-neutral-800 text-white font-extrabold text-lg sm:text-2xl uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-xs">
                  <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-brand-400 shrink-0" />
                  <span>{{ heroTexts.buy }}</span>
                </div>
              </div>

              <!-- БУДМАТЕРІАЛИ -->
              <div class="text-2xl sm:text-4xl font-extrabold uppercase text-neutral-900 dark:text-white tracking-tight">
                {{ heroTexts.materialsNearby }}
              </div>

              <!-- Підпис про склади -->
              <div class="mt-2 text-xs text-neutral-500 dark:text-neutral-400 font-public">
                {{ heroTexts.subLine }}
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Слова «ПРОДАВАЙ» і «КУПУЙ» оформлені як два симетричні блоки-плитки в один ряд (50/50 на мобілці).
          </p>
        </div>

        <!-- КОНЦЕПТ 6 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">6</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Фокус на слові «БУДМАТЕРІАЛИ» зверху</span>
              </div>
              <UBadge color="neutral" variant="subtle" size="sm" class="font-bold text-[10px]">🎯 Інверсія ієрархії</UBadge>
            </div>

            <div class="py-3 text-center sm:text-left font-raleway">
              <!-- Дві капсули джерел зверху -->
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-3 font-public">
                <span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-bold">
                  🏠 {{ heroTexts.leftoversShort }}
                </span>
                <span class="text-neutral-300 dark:text-neutral-700 font-bold">+</span>
                <span class="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[11px] font-bold">
                  🏢 {{ heroTexts.warehousesShort }}
                </span>
              </div>

              <!-- Спочатку БУДМАТЕРІАЛИ, потім ПРОДАВАЙ • КУПУЙ -->
              <div class="space-y-1.5 uppercase font-extrabold tracking-tight">
                <div class="text-2xl sm:text-4xl text-neutral-900 dark:text-white leading-none">
                  {{ heroTexts.materials }}
                </div>
                <div class="text-3xl sm:text-5xl text-brand-500 leading-none">
                  {{ heroTexts.sell }} • {{ heroTexts.buy }}
                </div>
              </div>

              <!-- Швидко Зручно Поруч знизу з галочками -->
              <div class="mt-4 flex items-center justify-center sm:justify-start gap-4 text-xs font-bold text-neutral-600 dark:text-neutral-400 font-public">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-check-circle-solid" class="w-4 h-4 text-emerald-500" />
                  {{ heroTexts.fastCap }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-check-circle-solid" class="w-4 h-4 text-emerald-500" />
                  {{ heroTexts.convCap }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-check-circle-solid" class="w-4 h-4 text-emerald-500" />
                  {{ heroTexts.nearCap }}
                </span>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Зверху одразу дві кольорові капсули («Приватні залишки + Будбази»), а «Швидко • Зручно • Поруч» перенесені вниз із зеленими галочками.
          </p>
        </div>

        <!-- КОНЦЕПТ 7 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">7</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Подвійна капсула Stripe-style + Маркер</span>
              </div>
              <UBadge color="primary" variant="subtle" size="sm" class="font-bold text-[10px]">✨ Європейський SaaS</UBadge>
            </div>

            <div class="py-3 text-center sm:text-left font-raleway">
              <!-- Stripe-style badge -->
              <div class="inline-flex items-center gap-2 p-1 pr-3 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-4 font-public">
                <span class="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-extrabold uppercase">
                  2 в 1
                </span>
                <span class="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  {{ heroTexts.leftoversShort }} та {{ heroTexts.warehousesShort.toLowerCase() }}
                </span>
              </div>

              <!-- Заголовок -->
              <div class="space-y-2 uppercase font-extrabold tracking-tight">
                <div class="text-2xl sm:text-4xl text-brand-500 leading-none">
                  {{ heroTexts.sell }} <span class="text-neutral-300 dark:text-neutral-700">•</span> {{ heroTexts.buy }}
                </div>
                <div class="inline-block relative text-2xl sm:text-4xl text-neutral-900 dark:text-white leading-none">
                  <span class="relative z-10">{{ heroTexts.materialsNearby }}</span>
                  <span class="absolute bottom-0.5 left-0 right-0 h-2.5 bg-brand-500/20 dark:bg-brand-500/30 -z-0 rounded-sm"></span>
                </div>
              </div>

              <div class="mt-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                ⚡ {{ heroTexts.fast }} &nbsp;•&nbsp; 👍 {{ heroTexts.convenient }} &nbsp;•&nbsp; 📍 {{ heroTexts.nearby }}
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Стильний бейдж «[2 в 1] Приватні залишки та будбази» одразу пояснює концепцію платформи без жодних зайвих слів.
          </p>
        </div>

        <!-- КОНЦЕПТ 8 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">8</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Дворядковий змістовий (Залишки / Матеріали)</span>
              </div>
              <UBadge color="neutral" variant="subtle" size="sm" class="font-bold text-[10px]">📖 Максимальна ясність</UBadge>
            </div>

            <div class="py-3 text-center sm:text-left font-raleway">
              <!-- Верхня плашка -->
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider mb-3">
                <UIcon name="i-heroicons-map-pin-solid" class="w-3.5 h-3.5 text-brand-500" />
                <span>{{ heroTexts.fast }} • {{ heroTexts.convenient }} • {{ heroTexts.nearby }}</span>
              </div>

              <!-- Чіткий розподіл що продаємо і що купуємо -->
              <div class="space-y-1.5 uppercase font-extrabold tracking-tight">
                <div class="text-xl sm:text-3xl text-brand-500 leading-tight">
                  {{ heroTexts.sellLeftovers }}
                </div>
                <div class="text-xl sm:text-3xl text-neutral-900 dark:text-white leading-tight">
                  {{ heroTexts.buyMaterials }}
                </div>
              </div>

              <!-- Плашка знизу -->
              <div class="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300 font-public">
                <span>🤝 У сусідів після ремонту</span>
                <span class="text-neutral-300 dark:text-neutral-600">|</span>
                <span>🏬 На складах і в магазинах</span>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Розділяє дії по суті: «ПРОДАВАЙ ЗАЛИШКИ. КУПУЙ БУДМАТЕРІАЛИ.» — і відразу розшифровує де саме (у сусідів або на складах).
          </p>
        </div>

        <!-- КОНЦЕПТ 9 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">9</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Три окремі міні-капсули зверху + Рамка</span>
              </div>
              <UBadge color="neutral" variant="subtle" size="sm" class="font-bold text-[10px]">✨ Повітряний</UBadge>
            </div>

            <div class="py-3 text-center sm:text-left font-raleway">
              <!-- Три окремі міні-капсули -->
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-3.5">
                <span class="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-extrabold uppercase tracking-wider">
                  ⚡ {{ heroTexts.fast }}
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-extrabold uppercase tracking-wider">
                  👍 {{ heroTexts.convenient }}
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-[11px] font-extrabold uppercase tracking-wider">
                  📍 {{ heroTexts.nearby }}
                </span>
              </div>

              <!-- Заголовок -->
              <div class="space-y-1.5 uppercase font-extrabold tracking-tight">
                <div class="text-2xl sm:text-4xl text-brand-500 leading-none">
                  {{ heroTexts.sell }} • {{ heroTexts.buy }}
                </div>
                <div class="text-2xl sm:text-4xl text-neutral-900 dark:text-white leading-none">
                  {{ heroTexts.materials }}
                </div>
              </div>

              <!-- Непримітний бейдж внизу -->
              <div class="mt-3.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 font-public flex items-center justify-center sm:justify-start gap-1.5">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-brand-500" />
                <span>Об'єднуємо приватні залишки та будівельні бази міста</span>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Слова «Швидко», «Зручно», «Поруч» рознесені в 3 окремі міні-плашки (де «Поруч» підсвічено фірмовим кольором).
          </p>
        </div>

        <!-- КОНЦЕПТ 10 -->
        <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">10</span>
                <span class="font-bold text-sm text-neutral-900 dark:text-white">Фірмова Картка-Контейнер (Hero Card)</span>
              </div>
              <UBadge color="warning" variant="subtle" size="sm" class="font-bold text-[10px]">🛡️ Монолітний</UBadge>
            </div>

            <!-- Весь заголовок у м'якому градієнтному контейнері -->
            <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-brand-500/8 via-transparent to-neutral-100/80 dark:from-brand-500/15 dark:to-neutral-800/50 border border-brand-500/20 text-center sm:text-left font-raleway">
              <div class="flex items-center justify-center sm:justify-between gap-2 mb-2.5">
                <span class="text-[11px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                  {{ heroTexts.fast }} • {{ heroTexts.convenient }} • {{ heroTexts.nearby }}
                </span>
                <span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 text-[10px] font-bold text-neutral-500 shadow-2xs">
                  📍 На мапі
                </span>
              </div>

              <div class="text-2xl sm:text-4xl font-black uppercase text-neutral-900 dark:text-white leading-none mb-1.5">
                {{ heroTexts.sell }} <span class="inline-block w-2.5 h-2.5 rounded-full bg-brand-500 mx-1.5 align-middle -mt-1"></span> {{ heroTexts.buy }}
              </div>
              <div class="text-2xl sm:text-4xl font-black uppercase bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 bg-clip-text text-transparent leading-none pb-0.5">
                {{ heroTexts.materials }}
              </div>

              <div class="mt-3.5 pt-2.5 border-t border-brand-500/15 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-public">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-check-badge-solid" class="w-4 h-4 text-brand-500" />
                  {{ heroTexts.leftovers }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-check-badge-solid" class="w-4 h-4 text-blue-500" />
                  {{ heroTexts.warehouses }}
                </span>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            💡 Заголовок оформлений у легку брендову рамку з градієнтним фоном і нижнім рядком верифікованих категорій.
          </p>
        </div>
      </div>
    </main>

    <!-- СЕКЦІЯ 1: КОНТРАСТ ТА МЕЖІ КАРТОК (5 ВАРІАНТІВ) -->
    <main v-else-if="activeTab === 'borders'" class="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
      <div class="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span class="font-bold">Порада для мобільного тесту:</span>
          Кожна картка нижче показана на своєму тестовому тлі. Зверни увагу, як чітко зчитуються верхня, нижня та бічні межі блоку.
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="variant in cardBorderVariants"
          :key="variant.id"
          class="flex flex-col rounded-3xl p-4 sm:p-5 border border-neutral-200/80 dark:border-neutral-800"
          :class="variant.canvasBg"
        >
          <!-- Опис варіанту -->
          <div class="mb-3.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {{ variant.id }}
                </span>
                <h2 class="font-bold text-sm sm:text-base text-neutral-900 dark:text-white leading-tight">
                  {{ variant.name }}
                </h2>
              </div>
              <UBadge :color="variant.tagColor" variant="subtle" size="sm" class="shrink-0 font-bold rounded-lg text-[10px]">
                {{ variant.tag }}
              </UBadge>
            </div>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
              {{ variant.description }}
            </p>
          </div>

          <!-- Сама картка товару у цьому варіанті стилю -->
          <div :class="variant.cardClass">
            <!-- 1. Верхній рядок: Фото + Інформація -->
            <div class="flex items-start gap-3.5">
              <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <img
                  :src="sampleProduct.images[0]"
                  :alt="sampleProduct.title"
                  class="w-full h-full object-cover p-1"
                />
              </div>

              <div class="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                <!-- Назва та кружечок меню -->
                <div class="flex items-start justify-between gap-2">
                  <span class="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-2 leading-snug">
                    {{ sampleProduct.title }}
                  </span>

                  <!-- Фірмовий м'який кружечок меню -->
                  <UDropdownMenu :items="menuActions" :content="{ align: 'end' }">
                    <button
                      type="button"
                      class="rounded-full w-7 h-7 p-0 flex items-center justify-center shrink-0 -mr-1 -mt-1 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 dark:text-brand-400 cursor-pointer transition-colors shadow-2xs"
                      aria-label="Меню дій"
                    >
                      <UIcon name="i-heroicons-ellipsis-vertical" class="w-4 h-4" />
                    </button>
                  </UDropdownMenu>
                </div>

                <!-- Ціна та залишок -->
                <div class="flex items-center justify-between gap-2 mt-1">
                  <div class="flex items-baseline gap-1">
                    <span class="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      {{ sampleProduct.price }}
                    </span>
                    <span class="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                      грн / {{ sampleProduct.unit }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">
                    <UIcon name="i-heroicons-cube" class="w-3.5 h-3.5 text-neutral-400" />
                    <span>{{ sampleProduct.quantity }} {{ sampleProduct.unit }}</span>
                  </div>
                </div>

                <!-- Адреса -->
                <div class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                  {{ sampleProduct.location.address }}
                </div>
              </div>
            </div>

            <!-- 2. Панель показників -->
            <div class="bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl py-2 px-3 flex items-center justify-between shadow-xs my-3">
              <div class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-eye" class="w-4 h-4 text-neutral-400" />
                <span class="text-xs font-bold">{{ sampleProduct.views }}</span>
              </div>
              <span class="h-3 w-px bg-neutral-200 dark:bg-neutral-700"></span>
              <div class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-4 h-4 text-neutral-400" />
                <span class="text-xs font-bold">0</span>
              </div>
              <span class="h-3 w-px bg-neutral-200 dark:bg-neutral-700"></span>
              <div class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-neutral-400" />
                <span class="text-xs font-bold">{{ sampleProduct.phone_views }}</span>
              </div>
              <span class="h-3 w-px bg-neutral-200 dark:bg-neutral-700"></span>
              <div class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-heart" class="w-4 h-4 text-neutral-400" />
                <span class="text-xs font-bold">0</span>
              </div>
            </div>

            <!-- 3. Кнопка редагування -->
            <div class="mb-3">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-heroicons-pencil-square"
                block
                size="sm"
                class="font-semibold shadow-xs justify-center rounded-xl py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                @click="() => {toast.add({ title: 'Натиснуто редагувати', color: 'info' })}"
              >
                Редагувати оголошення
              </UButton>
            </div>

            <!-- 4. Нижня смуга: Статус та дедлайн -->
            <div class="flex items-center justify-between pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 py-1">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Активне</span>
              </div>
              <div class="text-right">
                <p class="text-xs text-neutral-600 dark:text-neutral-300 flex items-center justify-end gap-1 font-medium">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-neutral-400" />
                  <span>До 20 листопада</span>
                </p>
                <p class="text-xs font-bold mt-0.5 text-amber-600 dark:text-brand-500">
                  Ще 23 дні
                </p>
              </div>
            </div>
          </div>

          <!-- Примітка до стилю -->
          <div class="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400 italic">
            💡 {{ variant.notes }}
          </div>
        </div>
      </div>
    </main>

    <!-- СЕКЦІЯ 2: ВАРІАНТИ ТРЬОХ КРАПОК -->
    <main v-else class="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="variant in dotsVariants"
          :key="variant.id"
          class="flex flex-col bg-neutral-100/60 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-4 sm:p-5"
        >
          <div class="mb-3 flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {{ variant.id }}
                </span>
                <h2 class="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                  {{ variant.name }}
                </h2>
              </div>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {{ variant.description }}
              </p>
            </div>
            <UBadge :color="variant.tagColor" variant="subtle" size="sm" class="shrink-0 font-bold rounded-lg text-[10px]">
              {{ variant.tag }}
            </UBadge>
          </div>

          <div class="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <span class="font-semibold text-sm">Приклад кнопки у шапці:</span>
            <UDropdownMenu :items="menuActions" :content="{ align: 'end' }">
              <button
                type="button"
                :class="variant.buttonClass"
                :aria-label="`Меню ${variant.name}`"
              >
                <UIcon :name="variant.icon" class="w-4 h-4" />
              </button>
            </UDropdownMenu>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
