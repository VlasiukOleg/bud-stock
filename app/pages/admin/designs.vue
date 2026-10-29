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
const activeTab = ref<'borders' | 'dots'>('borders');

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
      <div class="max-w-7xl mx-auto flex gap-2 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
          :class="activeTab === 'borders' ? 'bg-brand-500 text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'"
          @click="activeTab = 'borders'"
        >
          <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4" />
          <span>1. Межі та контраст карток (5 варіантів)</span>
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
          :class="activeTab === 'dots' ? 'bg-brand-500 text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'"
          @click="activeTab = 'dots'"
        >
          <UIcon name="i-heroicons-ellipsis-vertical" class="w-4 h-4" />
          <span>2. Меню «Три крапки»</span>
        </button>
      </div>
    </header>

    <!-- СЕКЦІЯ 1: КОНТРАСТ ТА МЕЖІ КАРТОК (5 ВАРІАНТІВ) -->
    <main v-if="activeTab === 'borders'" class="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
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
                @click="toast.add({ title: 'Натиснуто редагувати', color: 'info' })"
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
