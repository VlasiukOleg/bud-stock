<template>
  <USlideover v-model:open="isSlideoverOpen" prevent-close>
    <template #content>
      <UCard
        class="flex flex-col flex-1 h-full overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 ring-0"
        :ui="{ 
          root: 'flex-1 h-full flex flex-col overflow-hidden',
          header: 'shrink-0',
          body: 'flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900', 
          footer: 'shrink-0 p-4 bg-white dark:bg-gray-900'
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Чат
              <span v-if="currentChat?.product" class="text-sm font-normal text-gray-500 ml-2">
                (Товар: {{ currentChat.product.title }})
              </span>
            </h3>
            <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="() => {isSlideoverOpen = false}" />
          </div>
        </template>

        <!-- Повідомлення (Body) -->
        <div ref="messagesContainer" class="flex flex-col gap-4 h-full">
          <div v-if="currentMessages.length === 0" class="text-center text-gray-500 m-auto">
            Немає повідомлень. Напишіть першим!
          </div>
          
          <div
            v-for="msg in currentMessages"
            :key="msg.id"
            :class="[
              'flex gap-3 max-w-[85%]',
              msg.sender_id === currentUserId ? 'ml-auto flex-row-reverse' : ''
            ]"
          >
            <!-- Аватарка -->
            <CommonUserAvatar
              :src="msg.sender_id === currentUserId ? user?.user_metadata?.avatar_url : chatUserProfiles[msg.sender_id]?.avatar_url"
              :name="(msg.sender_id === currentUserId ? user?.user_metadata?.full_name : chatUserProfiles[msg.sender_id]?.full_name)"
              size="sm"
              class="shrink-0"
              :uiClass="{ 'bg-primary-100 dark:bg-primary-900': msg.sender_id === currentUserId, 'bg-gray-100 dark:bg-gray-800': msg.sender_id !== currentUserId }"
            />
            
            <!-- Бульбашка повідомлення -->
            <div 
              :class="[
                'p-3 rounded-2xl text-sm',
                msg.sender_id === currentUserId 
                  ? 'bg-primary-500 text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'
              ]"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Поле вводу (Footer) -->
        <template #footer>
          <form @submit.prevent="onSendMessage" class="flex items-center gap-2">
            <UInput
              v-model="newMessage"
              placeholder="Напишіть повідомлення..."
              class="flex-1"
              size="lg"
              :ui="{ root: 'flex-1', base: 'rounded-full' }"
            />
            <UButton 
              type="submit" 
              color="primary" 
              icon="i-heroicons-paper-airplane" 
              size="lg"
              class="rounded-full w-10 h-10 flex items-center justify-center shrink-0"
              :disabled="!newMessage.trim()"
            />
          </form>
        </template>
      </UCard>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat';
import { computed, ref, watch, nextTick } from 'vue';

const { isSlideoverOpen, currentMessages, currentChat, sendMessage, chatUserProfiles } = useChat();
const user = useSupabaseUser();
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const currentUserId = computed(() => user.value?.id || (user.value as any)?.sub);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    // Батьківський елемент UCard body відповідає за скрол (overflow-y-auto)
    const parent = messagesContainer.value.parentElement;
    if (parent) {
      parent.scrollTop = parent.scrollHeight;
    }
  }
};

watch(currentMessages, () => {
  if (isSlideoverOpen.value) {
    scrollToBottom();
  }
}, { deep: true });

watch(isSlideoverOpen, (isOpen) => {
  if (isOpen) {
    scrollToBottom();
  }
});

const onSendMessage = async () => {
  if (newMessage.value.trim()) {
    await sendMessage(newMessage.value);
    newMessage.value = ''; // Очищаємо поле
    scrollToBottom();
  }
};
</script>
