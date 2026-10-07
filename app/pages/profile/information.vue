<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useDocumentVisibility } from '@vueuse/core'
import { vMaska } from 'maska/vue'
import * as yup from 'yup'
import type { FormSubmitEvent } from '@nuxt/ui'

const client = useSupabaseClient<any>()
const user = useSupabaseUser()
const toast = useToast()
const { t } = useI18n()

const profileForm = reactive({
  name: '',
  phone: '',
  avatar_url: '',
  phone_visibility: 'registered' as 'everyone' | 'registered' | 'hidden'
})

const schema = yup.object({
  name: yup.string().required(t('profile.information.nameRequired')).min(2, t('profile.information.nameMin')),
  phone: yup.string()
    .required(t('profile.information.phoneRequired'))
    .test('valid-phone', t('profile.information.phoneInvalid'), (value) => {
      if (!value) return false;
      const digits = value.replace(/\D/g, '');
      return digits.length === 12 && digits.startsWith('380');
    })
})

const isSavingProfile = ref(false)

watch(user, (newUser) => {
  if (newUser && !isSavingProfile.value) {
    profileForm.name = newUser.user_metadata?.full_name || ''
    profileForm.phone = newUser.user_metadata?.phone || ''
    profileForm.avatar_url = newUser.user_metadata?.avatar_url || ''
    profileForm.phone_visibility = newUser.user_metadata?.phone_visibility || 'hidden'
  }
}, { immediate: true })
const avatarFile = ref<File | null>(null)
const localAvatarPreview = ref<string | null>(null)

const isFormChanged = computed(() => {
  if (avatarFile.value !== null) return true;
  
  const currentName = user.value?.user_metadata?.full_name || '';
  const currentPhone = user.value?.user_metadata?.phone || '';
  const currentVisibility = user.value?.user_metadata?.phone_visibility || 'hidden';
  
  const rawFormPhone = profileForm.phone ? profileForm.phone.replace(/\D/g, '') : '';
  const rawCurrentPhone = currentPhone ? currentPhone.replace(/\D/g, '') : '';

  return profileForm.name !== currentName ||
         rawFormPhone !== rawCurrentPhone ||
         profileForm.phone_visibility !== currentVisibility;
})

watch(avatarFile, (newFile) => {
  if (newFile) {
    if (localAvatarPreview.value) {
      URL.revokeObjectURL(localAvatarPreview.value)
    }
    localAvatarPreview.value = URL.createObjectURL(newFile)
  } else {
    localAvatarPreview.value = null
  }
})

const currentAvatarUrl = computed(() => {
  return localAvatarPreview.value || profileForm.avatar_url
})

const phoneVisibilityOptions = computed(() => [
  {
    value: 'everyone',
    label: t('profile.information.phoneVisibilityEveryone'),
    help: t('profile.information.phoneVisibilityEveryoneHelp'),
    icon: 'i-heroicons-globe-alt'
  },
  {
    value: 'registered',
    label: t('profile.information.phoneVisibilityRegistered'),
    help: t('profile.information.phoneVisibilityRegisteredHelp'),
    icon: 'i-heroicons-user-circle'
  },
  {
    value: 'hidden',
    label: t('profile.information.phoneVisibilityHidden'),
    help: t('profile.information.phoneVisibilityHiddenHelp'),
    icon: 'i-heroicons-eye-slash'
  }
])

const saveProfile = async (event?: FormSubmitEvent<any>) => {
  isSavingProfile.value = true
  try {
    let finalAvatarUrl = profileForm.avatar_url

    if (avatarFile.value) {
      const fileExt = avatarFile.value.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const userId = user.value?.id || user.value?.sub || 'unknown'
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await client.storage
        .from('avatars')
        .upload(filePath, avatarFile.value, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = client.storage.from('avatars').getPublicUrl(filePath)
      finalAvatarUrl = data.publicUrl
      profileForm.avatar_url = finalAvatarUrl
    }

    const { data: updateData, error } = await client.auth.updateUser({
      data: { 
        full_name: profileForm.name,
        phone: '+' + profileForm.phone.replace(/\D/g, ''),
        avatar_url: finalAvatarUrl,
        phone_visibility: profileForm.phone_visibility
      }
    })
    
    if (error) throw error

    // Оновлюємо сесію, щоб Nuxt Supabase зберіг нові дані в куки
    await client.auth.refreshSession()

    if (updateData?.user) {
      user.value = updateData.user as any
    }
    
    // Очищаємо файл тільки ПІСЛЯ того, як сесія і юзер повністю оновилися
    avatarFile.value = null
    
    toast.add({
      title: t('profile.information.updateSuccess'),
      color: 'success'
    })
  } catch (err: any) {
    toast.add({
      title: t('profile.information.updateError'),
      description: err.message,
      color: 'error'
    })
  } finally {
    isSavingProfile.value = false
  }
}

const visibility = useDocumentVisibility();

watch(visibility, async (current) => {
  if (current === 'visible') {
    await client.auth.refreshSession();
  }
});
</script>

<template>
  <div class="relative bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
    <main class="w-full">
      <div class="max-w-5xl mx-auto pb-24 p-4 md:p-8 space-y-6">
        <h1 class="text-3xl font-bold mb-8">{{ $t('profile.information.pageTitle') }}</h1>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">{{ $t('profile.information.sectionTitle') }}</h2>
          </template>
          <UForm :schema="schema" :state="profileForm" @submit="saveProfile" class="space-y-4">
            <UFormField name="name" :label="$t('profile.information.nameLabel')">
              <UInput v-model="profileForm.name" :placeholder="$t('profile.information.namePlaceholder')" icon="i-heroicons-user" />
            </UFormField>
            
            <UFormField name="phone" :label="$t('profile.information.phoneLabel')">
              <UInput 
                v-model="profileForm.phone" 
                v-maska="'+380 (##) ###-##-##'"
                placeholder="+380 (99) 123-45-67" 
                icon="i-heroicons-phone" 
              />
              <template #description>
                <div class="mt-2 text-sm text-gray-500">
                  {{ $t('profile.information.phoneHelp') }}
                </div>
              </template>
            </UFormField>

            <UFormField :label="$t('profile.information.phoneVisibilityLabel')" :help="$t('profile.information.phoneVisibilityHelp')">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <label
                  v-for="option in phoneVisibilityOptions"
                  :key="option.value"
                  :class="[
                    'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                    profileForm.phone_visibility === option.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <input
                    type="radio"
                    :value="option.value"
                    v-model="profileForm.phone_visibility"
                    class="sr-only"
                  />
                  <UIcon :name="option.icon" class="w-5 h-5 mt-0.5 shrink-0" :class="profileForm.phone_visibility === option.value ? 'text-primary-500' : 'text-gray-400'" />
                  <div>
                    <div class="font-medium text-sm">{{ option.label }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">{{ option.help }}</div>
                  </div>
                </label>
              </div>
            </UFormField>

            <UFormField :label="$t('profile.information.avatarLabel')">
              <div class="flex items-center gap-4">
                <UAvatar :src="currentAvatarUrl" size="xl" />
                <UFileUpload
                  v-model="avatarFile"
                  accept="image/*"
                  :preview="false"
                >
                  <template #default="{ open }">
                    <UButton 
                      @click="() => open()" 
                      variant="soft" 
                      icon="i-heroicons-camera"
                    >
                      {{ $t('profile.information.selectPhoto') }}
                    </UButton>
                  </template>
                </UFileUpload>
              </div>
            </UFormField>

            <div class="flex justify-end mt-6">
              <UButton 
                type="submit" 
                color="primary" 
                :loading="isSavingProfile"
                :disabled="!isFormChanged"
              >
                {{ $t('profile.information.saveChanges') }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </div>
    </main>
  </div>
</template>
