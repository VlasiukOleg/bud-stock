<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { object, string } from 'yup'
import type { InferType } from 'yup'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const toast = useToast()

const sign = ref<'in' | 'up'>('in')

const toggleSign = () => {
  sign.value = sign.value === 'up' ? 'in' : 'up'
}

watchEffect(() => {
  if (user.value) {
    return navigateTo(APP_ROUTES.HOME)
  }
})

const { t } = useI18n()

const schema = computed(() => object({
  email: string().email(t('validation.invalid_email')).required(t('validation.required')),
  password: string()
    .min(8, t('validation.min_password'))
    .required(t('validation.required'))
}))

const rawSchema = object({
  email: string().email().required(),
  password: string().min(8).required()
})

type Schema = InferType<typeof rawSchema>

const fields = computed<AuthFormField[]>(() => [{
  name: 'email',
  type: 'text' as const,
  label: t('auth.email'),
  placeholder: t('auth.email'),
  required: true,
}, {
  name: 'password',
  label: t('auth.password'),
  type: 'password' as const,
  placeholder: t('auth.password'),
}])

const providers = computed(() => [{
  label: t('auth.githubBtn', 'GitHub'),
  icon: 'i-simple-icons-github',
  onClick: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'https://supabase-demo-gamma.vercel.app/confirm',
      },
    })
    if (error) displayError(error)
  },
}]);

const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) displayError(error)
}

const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) displayError(error)
  else {
    toast.add({
      title: 'Sign up successful',
      icon: 'i-lucide-check-circle',
      color: 'success',
    })
    await signIn(email, password)
  }
}

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const email = payload.data.email
  const password = payload.data.password

  if (sign.value === 'in') await signIn(email, password)
  else await signUp(email, password)
}

const displayError = (error: {message: string}) => {
  toast.add({
    title: 'Error',
    description: error.message,
    icon: 'i-lucide-alert-circle',
    color: 'error',
  })
}
</script>

<template>
  <UContainer class="h-[calc(100vh-var(--ui-header-height))] flex items-center justify-center px-4">
    <UPageCard class="max-w-sm w-full">
      <UAuthForm
        :title="sign === 'in' ? $t('auth.signIn') : $t('auth.signUp')"
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        :schema="schema"
        :submit-button="{ label: sign === 'in' ? $t('auth.signIn') : $t('auth.signUp') }"
        @submit="onSubmit"
      >
        <template
          #description
        >
          {{ sign === 'up' ? $t('auth.hasAccount') : $t('auth.noAccount') }}
          <UButton
            variant="link"
            class="p-0"
            @click="toggleSign"
          >
            {{ sign === 'in' ? $t('auth.signUp') : $t('auth.signIn') }}
          </UButton>
        </template>
      </UAuthForm>
    </UPageCard>
  </UContainer>
</template>