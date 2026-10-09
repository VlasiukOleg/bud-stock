<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { object, string } from 'yup';
import type { FormSubmitEvent } from '@nuxt/ui';

const props = defineProps<{
  listingId: string;
}>();

const emit = defineEmits(['close']);
const toast = useToast();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const isOpen = ref(true);
const isSubmitting = ref(false);

const state = reactive({
  selectedReason: '',
  details: ''
});

const schema = object({
  selectedReason: string().required('Оберіть причину скарги'),
  details: string().when('selectedReason', {
    is: 'other',
    then: (s) => s.required('Будь ласка, опишіть проблему детальніше').min(10, 'Мінімум 10 символів'),
    otherwise: (s) => s.optional()
  })
});

const reasons = [
  { value: 'fraud', title: 'Шахрайство', desc: 'Вимагають передоплату або обманюють', icon: 'i-heroicons-shield-exclamation' },
  { value: 'wrong_price', title: 'Неактуальна ціна або наявність', desc: 'Ціна інша або товар уже проданий', icon: 'i-heroicons-tag' },
  { value: 'wrong_contacts', title: 'Невірні контактні дані', desc: 'Неможливо зв\'язатися з продавцем', icon: 'i-heroicons-phone-x-mark' },
  { value: 'spam', title: 'Заборонений товар або спам', desc: 'Порушення правил або стороння реклама', icon: 'i-heroicons-no-symbol' },
  { value: 'wrong_info', title: 'Некоректні фото або опис', desc: 'Інформація не відповідає товару', icon: 'i-heroicons-photo-solid' },
  { value: 'other', title: 'Інше', desc: 'Розкажіть, що саме не так', icon: 'i-heroicons-chat-bubble-bottom-center-text' }
];

const onSubmit = async (event: FormSubmitEvent<any>) => {
  const currentUserId = (user.value as any)?.sub;
  if (!currentUserId) {
    toast.add({ title: 'Потрібна авторизація', description: 'Щоб залишити скаргу, увійдіть в акаунт', color: 'error' });
    return;
  }

  isSubmitting.value = true;
  
  const { error } = await supabase.from('reports').insert({
    listing_id: props.listingId,
    reporter_id: currentUserId,
    reason: state.selectedReason,
    details: state.details
  });
  
  isSubmitting.value = false;
  
  if (error) {
    toast.add({ title: 'Помилка', description: 'Не вдалося відправити скаргу. Спробуйте пізніше.', color: 'error' });
    console.error(error);
  } else {
    toast.add({ title: 'Скаргу надіслано', description: 'Дякуємо! Ми перевіримо це оголошення.', color: 'success' });
    isOpen.value = false;
  }
};

watch(isOpen, (val) => {
  if (!val) {
    setTimeout(() => emit('close'), 200);
  }
});
</script>

<template>
  <UModal v-model:open="isOpen" title="Поскаржитися на оголошення">
    <template #body>
      <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
        <UFormField label="Що не так з оголошенням?" name="selectedReason" required>
          <URadioGroup
            v-model="state.selectedReason"
            :items="reasons"
            name="report-reason"
            variant="card"
            indicator="end"
            class="w-full mt-2"
            :ui="{ item: 'py-1.5 px-3' }"
          >
            <template #label="{ item }">
              <div class="flex items-center gap-4 w-full py-1">
                <div class="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800">
                  <UIcon :name="item.icon" class="w-5 h-5 text-gray-500" />
                </div>
                <div class="flex flex-col flex-1">
                  <span class="font-medium text-gray-900 dark:text-white">{{ item.title }}</span>
                  <span class="text-xs text-gray-500">{{ item.desc }}</span>
                </div>
              </div>
            </template>
          </URadioGroup>
        </UFormField>

        <UFormField v-if="state.selectedReason === 'other'" name="details" label="Деталі скарги">
          <UTextarea 
            v-model="state.details" 
            placeholder="Додайте деталі, які допоможуть перевірці..."
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-3 w-full pt-4">
          <UButton color="neutral" variant="outline" @click="() => {isOpen = false}" label="Скасувати" />
          <UButton type="submit" color="primary" :loading="isSubmitting" label="Надіслати скаргу" icon="i-heroicons-arrow-right-20-solid" trailing />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
