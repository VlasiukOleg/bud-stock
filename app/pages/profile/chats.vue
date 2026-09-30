<script setup lang="ts">
const { activeChats, currentChat, isSlideoverOpen, fetchMessages, unreadCounts, isLoadingChats } = useChat();
const { fetchProfile } = useProfile();

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
        <h1 class="text-3xl font-bold mb-8">Мої повідомлення</h1>

        <div v-if="isLoadingChats" class="flex flex-col items-center justify-center py-16 text-primary-500">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin mb-4" />
          <p class="text-lg font-medium animate-pulse">Завантаження чатів...</p>
        </div>

        <div v-else-if="activeChats.length === 0" class="text-center py-16 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg">У вас ще немає активних чатів</p>
        </div>
        
        <div v-else class="flex flex-col gap-4">
          <UCard
            v-for="chat in activeChats"
            :key="chat.id"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="openMyChat(chat)"
          >
            <div class="flex items-center gap-4">
              <div class="relative w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-6 h-6 text-primary-600" />
                <span 
                  v-if="unreadCounts[chat.id]"
                  class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-900"
                >
                  {{ unreadCounts[chat.id] }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-lg font-semibold truncate text-gray-900 dark:text-white" :class="{'font-bold': unreadCounts[chat.id]}">
                    {{ chat.product?.title || 'Оголошення видалено' }}
                  </p>
                  <UBadge v-if="unreadCounts[chat.id]" color="red" variant="soft" size="xs">Нове</UBadge>
                </div>
                <p class="text-sm text-gray-500 truncate" :class="{'text-gray-900 dark:text-gray-300 font-medium': unreadCounts[chat.id]}">
                  Чат щодо товару (Оновлено: {{ new Date(chat.updated_at).toLocaleString() }})
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
            </div>
          </UCard>
        </div>
      </div>
    </main>
  </div>
</template>
