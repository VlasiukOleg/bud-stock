<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getSupabaseAuthErrorMessage } from "~/utils/supabaseErrors";
import { APP_ROUTES } from "~/utils/routes";

const { t } = useI18n();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const route = useRoute();

const newPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const isCheckingSession = ref(true);
const isSessionValid = ref(false);

const passwordError = computed(() => {
  if (!newPassword.value) return '';
  if (newPassword.value.length < 8) {
    return 'Мінімум 8 символів';
  }
  return '';
});

// Слухаємо подію відновлення пароля та перевіряємо наявність сесії
onMounted(async () => {
  const code = route.query.code as string;
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // Ігноруємо якщо код вже обміняно
    }
  }

  // Перевірка наявності активної сесії
  const { data: { session } } = await supabase.auth.getSession();
  if (session || user.value) {
    isSessionValid.value = true;
    isCheckingSession.value = false;
  } else {
    // Невелика затримка на випадок асинхронного відновлення сесії
    setTimeout(async () => {
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      isSessionValid.value = Boolean(retrySession || user.value);
      isCheckingSession.value = false;
    }, 600);
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" || session) {
      isSessionValid.value = true;
      isCheckingSession.value = false;
    }
  });
});

const updateUserPassword = async () => {
  if (!newPassword.value) return;

  if (newPassword.value.length < 8) {
    errorMessage.value = t('auth.errors.weak_password', 'Пароль занадто простий. Він повинен містити щонайменше 8 символів.');
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  });

  if (error) {
    errorMessage.value = getSupabaseAuthErrorMessage(error, t);
  } else {
    successMessage.value = 'Пароль успішно оновлено! Перенаправлення...';
    setTimeout(() => {
      router.push(APP_ROUTES.HOME);
    }, 2000);
  }
  isLoading.value = false;
};
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--ui-header-height))] flex-1 flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12">
    <UPageCard class="w-full max-w-md bg-white dark:bg-neutral-800">
      <!-- Стан завантаження перевірки посилання -->
      <div v-if="isCheckingSession" class="text-center py-8 flex flex-col items-center gap-3">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
        <p class="text-sm text-neutral-500">Перевірка посилання відновлення...</p>
      </div>

      <!-- Якщо посилання недійсне / прямий захід без сесії -->
      <div v-else-if="!isSessionValid" class="text-center py-4 space-y-4">
        <UIcon name="i-lucide-shield-alert" class="w-12 h-12 text-warning mx-auto" />
        <h2 class="text-xl font-bold text-neutral-900 dark:text-white">Посилання недійсне або застаріло</h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          Для безпечної зміни пароля перейдіть за лінком із листа на вашій пошті або надішліть новий запит.
        </p>
        <UButton
          :to="APP_ROUTES.AUTH.LOGIN"
          color="primary"
          block
          size="lg"
          class="justify-center"
        >
          Запросити новий лист
        </UButton>
      </div>

      <!-- Форма оновлення пароля -->
      <div v-else>
        <div class="mb-6 text-center">
          <UIcon name="i-lucide-key" class="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Оновлення пароля</h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Введіть новий надійний пароль (мінімум 8 символів)
          </p>
        </div>

        <form @submit.prevent="updateUserPassword" class="space-y-4">
          <UFormField
            label="Новий пароль"
            :error="passwordError"
            help="Мінімум 8 символів"
          >
            <UInput
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="8"
              placeholder="••••••••"
              icon="i-lucide-lock"
              :ui="{ trailing: 'pe-1' }"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="showPassword ? 'Приховати пароль' : 'Показати пароль'"
                  @click="() => { showPassword = !showPassword }"
                />
              </template>
            </UInput>
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
          />
          <UAlert
            v-if="successMessage"
            color="success"
            variant="soft"
            icon="i-lucide-check-circle"
            :title="successMessage"
          />

          <UButton
            type="submit"
            block
            color="primary"
            size="lg"
            class="justify-center"
            :loading="isLoading"
            :disabled="newPassword.length < 8"
          >
            Оновити пароль
          </UButton>
        </form>
      </div>
    </UPageCard>
  </div>
</template>

<style scoped>
::-ms-reveal {
  display: none;
}
</style>
