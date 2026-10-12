<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import * as yup from 'yup'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const authMode = ref<'login' | 'signup' | 'forgotPassword'>('login')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const schema = computed(() => {
  if (authMode.value === 'forgotPassword') {
    return yup.object({
      email: yup
        .string()
        .trim()
        .required('Введіть email')
        .email('Введіть коректну email-адресу (наприклад, user@gmail.com)'),
    })
  }

  return yup.object({
    email: yup
      .string()
      .trim()
      .required('Введіть email')
      .email('Введіть коректну email-адресу (наприклад, user@gmail.com)'),
    password: yup
      .string()
      .required('Введіть пароль')
      .min(8, 'Пароль повинен містити щонайменше 8 символів'),
  })
})

// Якщо користувач вже авторизований, перенаправляємо на головну
watchEffect(() => {
  if (user.value) {
    navigateTo(APP_ROUTES.HOME)
  }
})

const fields = computed<AuthFormField[]>(() => {
  if (authMode.value === 'forgotPassword') {
    return [
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'ваш@email.com',
        required: true,
      },
    ]
  }
  return [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'ваш@email.com',
      required: true,
    },
    {
      name: 'password',
      type: 'password',
      label: 'Пароль',
      placeholder: '••••••••',
      required: true,
    },
  ]
})

const handleAuth = async (payload: FormSubmitEvent<any>) => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const { email, password } = payload.data

  try {
    if (authMode.value === 'signup') {
      // Реєстрація
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`,
        },
      })
      if (error) throw error

      // Перевірка на вже існуючого користувача
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('Користувач з такою поштою вже зареєстрований')
      }

      successMessage.value =
        'Реєстрація успішна! Будь ласка, перевірте свою пошту для підтвердження (якщо вимагається), або увійдіть.'
      authMode.value = 'login'
    } else if (authMode.value === 'login') {
      // Вхід
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      navigateTo(APP_ROUTES.HOME)
    } else if (authMode.value === 'forgotPassword') {
      // Скидання пароля
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      successMessage.value = 'Інструкції з відновлення пароля надіслано на вашу пошту.'
      authMode.value = 'login'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Сталася помилка під час авторизації.'
  } finally {
    isLoading.value = false
  }
}

const loginWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    })
    if (error) throw error
  } catch (error: any) {
    errorMessage.value = error.message || 'Помилка при вході через Google.'
  }
}

const providers = computed(() => {
  if (authMode.value === 'forgotPassword') return []
  return [
    {
      label: 'Google',
      icon: 'i-simple-icons-google',
      color: 'neutral' as const,
      variant: 'subtle' as const,
      onClick: loginWithGoogle,
    },
  ]
})

const setMode = (mode: 'login' | 'signup' | 'forgotPassword') => {
  authMode.value = mode
  errorMessage.value = ''
  successMessage.value = ''
}
</script>

<template>
  <div class="h-[calc(100vh-var(--ui-header-height))] flex items-center justify-center bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
    <UPageCard class="w-full max-w-md bg-white dark:bg-neutral-800">
      <UAuthForm
        :fields="fields"
        :schema="schema"
        novalidate
        :providers="providers"
        :title="authMode === 'signup' ? 'Створіть акаунт' : authMode === 'forgotPassword' ? 'Відновлення пароля' : 'З поверненням!'"
        icon="i-lucide-lock"
        :submit="{
          label: authMode === 'signup' ? 'Зареєструватися' : authMode === 'forgotPassword' ? 'Відправити лист' : 'Увійти',
          loading: isLoading,
        }"
        @submit="handleAuth"
      >
        <template #description>
          <div v-if="authMode === 'forgotPassword'">
            <span class="text-sm text-neutral-500">Згадали пароль? </span>
            <UButton
              variant="link"
              class="text-primary font-medium p-0"
              @click="setMode('login')"
            >
              Увійти
            </UButton>
          </div>
          <div v-else>
            <span class="text-sm text-neutral-500">
              {{ authMode === 'signup' ? 'Вже маєте акаунт? ' : 'Немає акаунту? ' }}
            </span>
            <UButton
              variant="link"
              class="text-primary font-medium p-0"
              @click="setMode(authMode === 'signup' ? 'login' : 'signup')"
            >
              {{ authMode === 'signup' ? 'Увійти' : 'Зареєструватися' }}
            </UButton>
          </div>
        </template>

        <template #footer v-if="authMode === 'login'">
          <div class="text-center mt-4">
            <UButton
              variant="link"
              class="text-sm text-neutral-500 hover:text-primary transition-colors p-0"
              @click="setMode('forgotPassword')"
            >
              Забули пароль?
            </UButton>
          </div>
        </template>

        <template #validation>
          <UAlert
            v-if="errorMessage"
            color="error"
            icon="i-lucide-alert-circle"
            variant="soft"
            :title="errorMessage"
          />
          <UAlert
            v-if="successMessage"
            color="success"
            icon="i-lucide-check-circle"
            variant="soft"
            :title="successMessage"
          />
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>