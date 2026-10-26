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
          
          <template v-for="msg in currentMessages" :key="msg.id">
            <div
              v-if="!msg.content.startsWith('[SYSTEM_STATUS]:')"
              :class="[
                'flex gap-3 max-w-[85%]',
                msg.sender_id === currentUserId ? 'ml-auto flex-row-reverse' : ''
              ]"
            >
              <!-- Аватарка -->
              <CommonUserAvatar
                :src="msg.sender_id === currentUserId ? getUserAvatarUrl(user) : getUserAvatarUrl(chatUserProfiles[msg.sender_id])"
                :name="(msg.sender_id === currentUserId ? user?.user_metadata?.full_name : chatUserProfiles[msg.sender_id]?.full_name)"
                size="sm"
                class="shrink-0"
                :uiClass="{ 'bg-primary-100 dark:bg-primary-900': msg.sender_id === currentUserId, 'bg-gray-100 dark:bg-gray-800': msg.sender_id !== currentUserId }"
              />
              
              <!-- Бульбашка повідомлення -->
              <!-- Бульбашка повідомлення та час -->
              <div class="flex flex-col gap-1 max-w-full">
                <div 
                  :class="[
                    'p-3 rounded-2xl text-sm leading-relaxed',
                    msg.sender_id === currentUserId 
                      ? 'bg-brand-100 dark:bg-brand-950/70 border border-brand-200/80 dark:border-brand-900/60 text-neutral-900 dark:text-neutral-100 rounded-tr-sm shadow-xs' 
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-neutral-900 dark:text-neutral-100 rounded-tl-sm shadow-sm'
                  ]"
                >
                  {{ msg.content }}
                </div>
                <span 
                  :class="[
                    'text-[10px] text-gray-400 px-1',
                    msg.sender_id === currentUserId ? 'text-right' : 'text-left'
                  ]"
                >
                  {{ new Date(msg.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- Поле вводу (Footer) -->
        <template #footer>
          <div v-if="isChatBlocked" class="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
            {{ blockedMessage }}
          </div>
          <form v-else @submit.prevent="onSendMessage" class="flex items-center gap-2">
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
              :disabled="!newMessage.trim() || isSending"
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

const currentUserId = computed(() => (user.value as any)?.sub);

const isProductExpired = computed(() => {
  return isListingExpired(currentChat.value?.product);
});

const isChatBlocked = computed(() => {
  return isListingInactive(currentChat.value?.product);
});

const blockedMessage = computed(() => {
  const state = currentChat.value?.product?.listing_state;
  if (state === 'moderation') return 'Чат заблоковано, оскільки оголошення на модерації';
  if (state === 'rejected') return 'Чат заблоковано, оскільки оголошення відхилено';
  if (state === 'sold') return 'Чат заблоковано, оскільки товар продано';
  if (isProductExpired.value) return 'Чат заблоковано, оскільки термін дії оголошення закінчився';
  return 'Чат заблоковано, оскільки оголошення неактуальне';
});

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
  } else {
    currentChat.value = null;
    currentMessages.value = [];
  }
});

const isSending = ref(false);

const onSendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text || isSending.value) return;

  isSending.value = true;
  try {
    newMessage.value = ''; // Очищаємо поле одразу для кращого UX
    await sendMessage(text);
    scrollToBottom();
  } catch (error) {
    newMessage.value = text; // Повертаємо текст, якщо сталася помилка
    console.error('Failed to send message:', error);
  } finally {
    isSending.value = false;
  }
};
</script>
