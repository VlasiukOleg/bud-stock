<script setup lang="ts">
import { watch } from 'vue';
import { COST_PER_LISTING } from '~/constants/balance';

const { balance, isFetching, fetchBalance, addBalanceLocally } = useBalance();
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const toast = useToast();

const isReplenishing = ref(false);

watch(() => user.value?.sub, (newId) => {
  if (newId) {
    fetchBalance(); // This uses cache if already fetched
  }
}, { immediate: true });

const handleReplenish = async () => {
  isReplenishing.value = true;
  try {
    const { error } = await supabase.rpc('replenish_balance');
    if (error) throw error;
    
    // Оновлюємо кеш локально, щоб не робити зайвий запит
    addBalanceLocally(500);
    
    toast.add({ title: 'Успішно', description: 'Ваш баланс поповнено!', color: 'success' });
  } catch (err: any) {
    toast.add({ title: 'Помилка', description: err.message || 'Не вдалося поповнити баланс', color: 'error' });
  } finally {
    isReplenishing.value = false;
  }
};
</script>

<template>
  <div class="relative bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
    <main class="w-full">
      <div class="max-w-5xl mx-auto p-4 md:p-8">
        <h1 class="text-3xl font-bold mb-8">{{ $t('balance.title') }}</h1>

        <UCard class="mb-8">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <!-- Баланс -->
            <div class="flex flex-col items-center md:items-start gap-2">
              <div class="flex items-center gap-2">
                <span class="text-gray-500 font-medium">{{ $t('balance.currentBalance') }}</span>
                
                <UPopover mode="hover">
                  <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-gray-400 cursor-help" />
                  <template #content>
                    <div class="p-4 w-72 text-sm text-gray-600 dark:text-gray-300">
                      <p class="font-bold mb-1 text-gray-900 dark:text-white">Що таке Стоки?</p>
                      <p>
                        <strong>Стоки</strong> — це внутрішня віртуальна валюта платформи, призначена виключно для зручності взаємодії з сервісом (публікація оголошень тощо). 
                      </p>
                      <p class="mt-2 text-xs italic">
                        Увага: Стоки не є реальними грошима, електронними грошима чи платіжним засобом згідно з чинним законодавством України. Їх неможливо вивести, обміняти на реальні кошти або передати іншим користувачам.
                      </p>
                    </div>
                  </template>
                </UPopover>

              </div>
              
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-banknotes" class="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <span v-if="isFetching" class="text-4xl font-bold text-gray-300 animate-pulse">---</span>
                <span v-else class="text-4xl font-bold text-gray-900 dark:text-white">{{ balance ?? 0 }}</span>
                <span class="text-2xl text-gray-500 mt-1">{{ $t('balance.stocks') }}</span>
              </div>
            </div>

            <!-- Кнопка поповнення -->
            <div class="flex flex-col items-center gap-2">
              <UButton 
                size="lg" 
                color="primary" 
                icon="i-heroicons-plus-circle"
                :loading="isReplenishing"
                :disabled="isFetching || (balance ?? 0) > 100"
                @click="handleReplenish"
              >
                {{ $t('balance.getFreeStocks') }}
              </UButton>
              <span class="text-xs text-gray-500 text-center max-w-[200px]">
                {{ $t('balance.replenishNote') }}
              </span>
            </div>

          </div>
        </UCard>
        
        <div class="prose dark:prose-invert text-sm text-gray-500 max-w-none">
          <h3>{{ $t('balance.howItWorks') }}</h3>
          <ul>
            <li>{{ $t('balance.rules.publishCost', { cost: COST_PER_LISTING }) }}</li>
            <li>{{ $t('balance.rules.welcomeBonus', { bonus: 1000 }) }}</li>
            <li>{{ $t('balance.rules.replenishInfo') }}</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>
