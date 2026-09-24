<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { vMaska } from 'maska/vue'
import * as yup from 'yup'
import type { FormSubmitEvent } from '@nuxt/ui'

const client = useSupabaseClient<any>()
const user = useSupabaseUser()
const toast = useToast()

const profileForm = reactive({
  name: '',
  phone: '',
  avatar_url: '',
  is_phone_public: false
})

const schema = yup.object({
  name: yup.string().required("Введіть ім'я").min(2, "Ім'я має містити щонайменше 2 символи"),
  phone: yup.string()
    .required("Введіть телефон")
    .test('valid-phone', 'Введіть повний номер', (value) => {
      if (!value) return false;
      const digits = value.replace(/\D/g, '');
      return digits.length === 12 && digits.startsWith('380');
    })
})

watch(user, (newUser) => {
  if (newUser) {
    profileForm.name = newUser.user_metadata?.full_name || ''
    profileForm.phone = newUser.user_metadata?.phone || ''
    profileForm.avatar_url = newUser.user_metadata?.avatar_url || ''
    profileForm.is_phone_public = newUser.user_metadata?.is_phone_public ?? false
  }
}, { immediate: true })

const isSavingProfile = ref(false)
const avatarFile = ref<File | null>(null)
const localAvatarPreview = ref<string | null>(null)

const isFormChanged = computed(() => {
  if (avatarFile.value !== null) return true;
  
  const currentName = user.value?.user_metadata?.full_name || '';
  const currentPhone = user.value?.user_metadata?.phone || '';
  const currentIsPhonePublic = user.value?.user_metadata?.is_phone_public ?? false;
  
  const rawFormPhone = profileForm.phone ? profileForm.phone.replace(/\D/g, '') : '';
  const rawCurrentPhone = currentPhone ? currentPhone.replace(/\D/g, '') : '';

  return profileForm.name !== currentName ||
         rawFormPhone !== rawCurrentPhone ||
         profileForm.is_phone_public !== currentIsPhonePublic;
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
        is_phone_public: profileForm.is_phone_public
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
      title: 'Профіль оновлено',
      color: 'success'
    })
  } catch (err: any) {
    toast.add({
      title: 'Помилка оновлення',
      description: err.message,
      color: 'error'
    })
  } finally {
    isSavingProfile.value = false
  }
}
</script>

<template>
  <div class="relative bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
    <main class="w-full">
      <div class="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <h1 class="text-3xl font-bold mb-8">Мій Профіль</h1>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Особисті дані</h2>
          </template>
          <UForm :schema="schema" :state="profileForm" @submit="saveProfile" class="space-y-4">
            <UFormField name="name" label="Ім'я">
              <UInput v-model="profileForm.name" placeholder="Введіть ваше ім'я" icon="i-heroicons-user" />
            </UFormField>
            
            <UFormField name="phone" label="Телефон">
              <UInput 
                v-model="profileForm.phone" 
                v-maska="'+380 (##) ###-##-##'"
                placeholder="+380 (99) 123-45-67" 
                icon="i-heroicons-phone" 
              />
              <template #description>
                <div class="mt-2 text-sm text-gray-500">
                  Для створення оголошень необхідно вказати телефон.
                </div>
              </template>
            </UFormField>

            <UFormField>
              <UCheckbox
                v-model="profileForm.is_phone_public"
                label="Показувати мій телефон в оголошеннях"
                help="Ваш телефон не будуть бачити інші користувачі, якщо ви вимкнете це налаштування (зв'язок буде тільки через повідомлення)."
              />
            </UFormField>

            <UFormField label="Аватарка">
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
                      Вибрати фото
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
                Зберегти зміни
              </UButton>
            </div>
          </UForm>
        </UCard>
      </div>
    </main>
  </div>
</template>
