<script setup lang="ts">
import { computed } from 'vue';

const { activeChats, currentChat, isSlideoverOpen, fetchMessages, unreadCounts, isLoadingChats } = useChat();
const { t } = useI18n();
useSeoMeta({ title: t('profile.chats.title') });
const { fetchProfile } = useProfile();
const user = useSupabaseUser();

const currentUserId = computed(() => (user.value as any)?.sub);

const formatChatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getProductStatus = (product: any) => {
  if (!product) {
    return {
      label: t('profile.chats.listingDeleted', 'Оголошення видалено'),
      icon: 'i-heroicons-trash',
      colorClass: 'text-neutral-400 dark:text-neutral-500'
    };
  }

  const state = product.listing_state;
  const isExpired = product.expires_at && new Date(product.expires_at).getTime() <= Date.now();

  if (state === 'sold') {
    return {
      label: t('profile.chats.sold', 'Продано'),
      icon: 'i-heroicons-shopping-bag',
      colorClass: 'text-neutral-600 dark:text-neutral-400'
    };
  }

  if (state === 'moderation') {
    return {
      label: 'На модерації',
      icon: 'i-heroicons-clock',
      colorClass: 'text-amber-600 dark:text-amber-400'
    };
  }

  if (state === 'rejected') {
    return {
      label: 'Відхилено',
      icon: 'i-heroicons-shield-exclamation',
      colorClass: 'text-red-600 dark:text-red-400'
    };
  }

  if (state === 'deactivated' || state === 'deleted') {
    return {
      label: t('profile.chats.hidden', 'Приховано'),
      icon: 'i-heroicons-eye-slash',
      colorClass: 'text-neutral-600 dark:text-neutral-400'
    };
  }

  if (isExpired) {
    return {
      label: 'Термін публікації минув',
      icon: 'i-heroicons-clock',
      colorClass: 'text-neutral-500 dark:text-neutral-400'
    };
  }

  return {
    label: 'Активне',
    icon: 'i-heroicons-check-circle',
    colorClass: 'text-emerald-600 dark:text-emerald-400'
  };
};

const sellingChats = computed(() => {
  return activeChats.value.filter(chat => chat.seller_id === currentUserId.value);
});

const buyingChats = computed(() => {
  return activeChats.value.filter(chat => chat.buyer_id === currentUserId.value);
});

const unreadBuyingCount = computed(() => {
  return buyingChats.value.reduce((sum, chat) => sum + (unreadCounts.value[chat.id] || 0), 0);
});

const unreadSellingCount = computed(() => {
  return sellingChats.value.reduce((sum, chat) => sum + (unreadCounts.value[chat.id] || 0), 0);
});

const tabItems = computed(() => [
  { label: t('profile.chats.tabs.buying'), slot: 'buying', icon: 'i-heroicons-shopping-bag' },
  { label: t('profile.chats.tabs.selling'), slot: 'selling', icon: 'i-heroicons-tag' }
]);

const openMyChat = async (chat: any) => {
  currentChat.value = chat;
  await Promise.all([
    fetchMessages(chat.id),
    fetchProfile(chat.buyer_id),
    fetchProfile(chat.seller_id)
  ]);
  isSlideoverOpen.value = true;
};
</script>

<template>
  <div class="relative bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
    <main class="w-full">
      <div class="max-w-5xl mx-auto p-4 pb-28 md:p-8 md:pb-8">
        <h1 class="text-3xl font-bold mb-8">{{ $t('profile.chats.title') }}</h1>

        <div v-if="isLoadingChats" class="flex flex-col items-center justify-center py-16 text-primary-500">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin mb-4" />
          <p class="text-lg font-medium animate-pulse">{{ $t('profile.chats.loading') }}</p>
        </div>

        <div v-else>
          <!-- Контейнер нульової висоти виключно для позиціонування червоних крапок над табами -->
          <div class="relative w-full max-w-sm h-0 z-10 mx-auto">
            <span 
              v-if="unreadBuyingCount > 0"
              class="absolute top-2 left-[45%] flex items-center justify-center w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-gray-900 pointer-events-none"
            ></span>
            <span 
              v-if="unreadSellingCount > 0"
              class="absolute top-2 right-[5%] flex items-center justify-center w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-gray-900 pointer-events-none"
            ></span>
          </div>
          <UTabs 
            :items="tabItems" 
            class="w-full"
            :ui="{ list: 'w-full max-w-sm mx-auto mb-6' }"
          >
            <template #buying>
              <div v-if="buyingChats.length === 0" class="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
                <p class="text-lg">{{ $t('profile.chats.noBuying') }}</p>
              </div>
              <div v-else class="flex flex-col gap-3">
                <div
                  v-for="chat in buyingChats"
                  :key="chat.id"
                  role="button"
                  tabindex="0"
                  class="group bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  @click="openMyChat(chat)"
                  @keydown.enter="openMyChat(chat)"
                >
                  <!-- Верхній блок: Фото + Заголовок + Дата + Шеврон -->
                  <div class="p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4">
                    <!-- Прев'ю фото товару -->
                    <div class="relative w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        v-if="chat.product?.images && chat.product.images.length > 0"
                        :src="chat.product.images[0]"
                        :alt="chat.product?.title || ''"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <UIcon
                        v-else
                        name="i-heroicons-photo"
                        class="w-6 h-6 text-neutral-400 dark:text-neutral-500"
                      />
                      <!-- Бейдж непрочитаних повідомлень -->
                      <span
                        v-if="unreadCounts[chat.id]"
                        class="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white dark:border-neutral-900 shadow-xs"
                      >
                        {{ unreadCounts[chat.id] }}
                      </span>
                    </div>

                    <!-- Інформація: назва та дата оновлення -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p
                          class="text-sm sm:text-base font-semibold truncate transition-colors"
                          :class="[
                            unreadCounts[chat.id]
                              ? 'text-neutral-900 dark:text-white font-bold'
                              : (isListingInactive(chat.product) ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400')
                          ]"
                        >
                          {{ chat.product?.title || $t('profile.chats.listingDeleted') }}
                        </p>
                        <UBadge v-if="unreadCounts[chat.id]" color="error" variant="soft" size="xs">
                          {{ $t('profile.chats.new') }}
                        </UBadge>
                      </div>

                      <div class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                        <span class="truncate">
                          {{ $t('profile.chats.updated') }}: {{ formatChatDate(chat.updated_at) }}
                        </span>
                      </div>
                    </div>

                    <!-- Шеврон праворуч -->
                    <UIcon
                      name="i-heroicons-chevron-right"
                      class="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                    />
                  </div>

                  <!-- Тонкий розділювач -->
                  <div class="border-t border-neutral-100 dark:border-neutral-800"></div>

                  <!-- Нижній блок: Статус товару (як у Figma) -->
                  <div class="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-neutral-50/60 dark:bg-neutral-800/25 flex items-center justify-between text-xs sm:text-[13px]">
                    <span class="text-neutral-400 dark:text-neutral-500 font-normal">
                      Статус товару
                    </span>
                    <div
                      class="flex items-center gap-1.5 font-medium"
                      :class="getProductStatus(chat.product).colorClass"
                    >
                      <UIcon
                        :name="getProductStatus(chat.product).icon"
                        class="w-4 h-4 shrink-0"
                      />
                      <span>{{ getProductStatus(chat.product).label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template #selling>
              <div v-if="sellingChats.length === 0" class="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
                <p class="text-lg">{{ $t('profile.chats.noSelling') }}</p>
              </div>
              <div v-else class="flex flex-col gap-3">
                <div
                  v-for="chat in sellingChats"
                  :key="chat.id"
                  role="button"
                  tabindex="0"
                  class="group bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  @click="openMyChat(chat)"
                  @keydown.enter="openMyChat(chat)"
                >
                  <!-- Верхній блок: Фото + Заголовок + Дата + Шеврон -->
                  <div class="p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4">
                    <!-- Прев'ю фото товару -->
                    <div class="relative w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        v-if="chat.product?.images && chat.product.images.length > 0"
                        :src="chat.product.images[0]"
                        :alt="chat.product?.title || ''"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <UIcon
                        v-else
                        name="i-heroicons-photo"
                        class="w-6 h-6 text-neutral-400 dark:text-neutral-500"
                      />
                      <!-- Бейдж непрочитаних повідомлень -->
                      <span
                        v-if="unreadCounts[chat.id]"
                        class="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white dark:border-neutral-900 shadow-xs"
                      >
                        {{ unreadCounts[chat.id] }}
                      </span>
                    </div>

                    <!-- Інформація: назва та дата оновлення -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p
                          class="text-sm sm:text-base font-semibold truncate transition-colors"
                          :class="[
                            unreadCounts[chat.id]
                              ? 'text-neutral-900 dark:text-white font-bold'
                              : (isListingInactive(chat.product) ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400')
                          ]"
                        >
                          {{ chat.product?.title || $t('profile.chats.listingDeleted') }}
                        </p>
                        <UBadge v-if="unreadCounts[chat.id]" color="error" variant="soft" size="xs">
                          {{ $t('profile.chats.new') }}
                        </UBadge>
                      </div>

                      <div class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                        <span class="truncate">
                          {{ $t('profile.chats.updated') }}: {{ formatChatDate(chat.updated_at) }}
                        </span>
                      </div>
                    </div>

                    <!-- Шеврон праворуч -->
                    <UIcon
                      name="i-heroicons-chevron-right"
                      class="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                    />
                  </div>

                  <!-- Тонкий розділювач -->
                  <div class="border-t border-neutral-100 dark:border-neutral-800"></div>

                  <!-- Нижній блок: Статус товару (як у Figma) -->
                  <div class="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-neutral-50/60 dark:bg-neutral-800/25 flex items-center justify-between text-xs sm:text-[13px]">
                    <span class="text-neutral-400 dark:text-neutral-500 font-normal">
                      Статус товару
                    </span>
                    <div
                      class="flex items-center gap-1.5 font-medium"
                      :class="getProductStatus(chat.product).colorClass"
                    >
                      <UIcon
                        :name="getProductStatus(chat.product).icon"
                        class="w-4 h-4 shrink-0"
                      />
                      <span>{{ getProductStatus(chat.product).label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </UTabs>
        </div>
      </div>
    </main>
  </div>
</template>
