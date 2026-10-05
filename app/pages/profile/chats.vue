<script setup lang="ts">
import { computed } from 'vue';

const { activeChats, currentChat, isSlideoverOpen, fetchMessages, unreadCounts, isLoadingChats } = useChat();
const { t } = useI18n();
const { fetchProfile } = useProfile();
const user = useSupabaseUser();

const currentUserId = computed(() => user.value?.id || (user.value as any)?.sub);

const sellingChats = computed(() => {
  return activeChats.value.filter(chat => chat.seller_id === currentUserId.value);
});

const buyingChats = computed(() => {
  return activeChats.value.filter(chat => chat.buyer_id === currentUserId.value);
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
      <div class="max-w-5xl mx-auto p-4 md:p-8">
        <h1 class="text-3xl font-bold mb-8">{{ $t('profile.chats.title') }}</h1>

        <div v-if="isLoadingChats" class="flex flex-col items-center justify-center py-16 text-primary-500">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin mb-4" />
          <p class="text-lg font-medium animate-pulse">{{ $t('profile.chats.loading') }}</p>
        </div>

        <div v-else>
          <UTabs 
            :items="tabItems" 
            class="w-full"
            :ui="{ list: 'w-full max-w-sm mb-6' }"
          >
            <template #buying>
              <div v-if="buyingChats.length === 0" class="text-center py-16 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p class="text-lg">{{ $t('profile.chats.noBuying') }}</p>
              </div>
              <div v-else class="flex flex-col gap-4">
                <UCard
                  v-for="chat in buyingChats"
                  :key="chat.id"
                  class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  @click="openMyChat(chat)"
                >
                  <div class="flex items-center gap-4">
                    <div class="relative w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                      <span 
                        v-if="unreadCounts[chat.id]"
                        class="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[9px] md:text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-900"
                      >
                        {{ unreadCounts[chat.id] }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-base md:text-lg font-semibold truncate" :class="[unreadCounts[chat.id] ? 'text-gray-900 dark:text-white font-bold' : (chat.product?.listing_state === 'sold' || chat.product?.listing_state === 'deactivated' || chat.product?.listing_state === 'deleted' ? 'text-gray-500' : 'text-gray-900 dark:text-white')]">
                          {{ chat.product?.title || $t('profile.chats.listingDeleted') }}
                        </p>
                        <UBadge v-if="unreadCounts[chat.id]" color="error" variant="soft" size="xs">{{ $t('profile.chats.new') }}</UBadge>
                      </div>
                      <div class="flex items-center gap-2 mt-0.5">
                        <UBadge v-if="chat.product?.listing_state === 'sold'" color="success" variant="soft" size="xs">{{ $t('profile.chats.sold') }}</UBadge>
                        <UBadge v-else-if="chat.product?.listing_state === 'deactivated' || chat.product?.listing_state === 'deleted'" color="neutral" variant="soft" size="xs">{{ $t('profile.chats.hidden') }}</UBadge>
                        <p class="text-xs md:text-sm text-gray-500 truncate" :class="{'text-gray-900 dark:text-gray-300 font-medium': unreadCounts[chat.id]}">
                          {{ $t('profile.chats.updated') }}: {{ new Date(chat.updated_at).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                        </p>
                      </div>
                    </div>
                    <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
                  </div>
                </UCard>
              </div>
            </template>

            <template #selling>
              <div v-if="sellingChats.length === 0" class="text-center py-16 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p class="text-lg">{{ $t('profile.chats.noSelling') }}</p>
              </div>
              <div v-else class="flex flex-col gap-4">
                <UCard
                  v-for="chat in sellingChats"
                  :key="chat.id"
                  class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  @click="openMyChat(chat)"
                >
                  <div class="flex items-center gap-4">
                    <div class="relative w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                      <span 
                        v-if="unreadCounts[chat.id]"
                        class="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[9px] md:text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-900"
                      >
                        {{ unreadCounts[chat.id] }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-base md:text-lg font-semibold truncate" :class="[unreadCounts[chat.id] ? 'text-gray-900 dark:text-white font-bold' : (chat.product?.listing_state === 'sold' || chat.product?.listing_state === 'deactivated' || chat.product?.listing_state === 'deleted' ? 'text-gray-500' : 'text-gray-900 dark:text-white')]">
                          {{ chat.product?.title || $t('profile.chats.listingDeleted') }}
                        </p>
                        <UBadge v-if="unreadCounts[chat.id]" color="error" variant="soft" size="xs">{{ $t('profile.chats.new') }}</UBadge>
                      </div>
                      <div class="flex items-center gap-2 mt-0.5">
                        <UBadge v-if="chat.product?.listing_state === 'sold'" color="success" variant="soft" size="xs">{{ $t('profile.chats.sold') }}</UBadge>
                        <UBadge v-else-if="chat.product?.listing_state === 'deactivated' || chat.product?.listing_state === 'deleted'" color="neutral" variant="soft" size="xs">{{ $t('profile.chats.hidden') }}</UBadge>
                        <p class="text-xs md:text-sm text-gray-500 truncate" :class="{'text-gray-900 dark:text-gray-300 font-medium': unreadCounts[chat.id]}">
                          {{ $t('profile.chats.updated') }}: {{ new Date(chat.updated_at).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                        </p>
                      </div>
                    </div>
                    <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
                  </div>
                </UCard>
              </div>
            </template>
          </UTabs>
        </div>
      </div>
    </main>
  </div>
</template>
