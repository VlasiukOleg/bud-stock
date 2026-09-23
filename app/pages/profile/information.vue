<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'

const client = useSupabaseClient<any>()
const user = useSupabaseUser()
const toast = useToast()

const profileForm = reactive({
  name: '',
  phone: '',
  avatar_url: ''
})

watch(user, (newUser) => {
  if (newUser) {
    profileForm.name = newUser.user_metadata?.full_name || ''
    profileForm.phone = newUser.user_metadata?.phone || ''
    profileForm.avatar_url = newUser.user_metadata?.avatar_url || ''
  }
}, { immediate: true })

const isSavingProfile = ref(false)
const avatarFile = ref<File | null>(null)
const localAvatarPreview = ref<string | null>(null)

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

const saveProfile = async () => {
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
        phone: profileForm.phone,
        avatar_url: finalAvatarUrl
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
          <form @submit.prevent="saveProfile" class="space-y-4">
            <UFormField label="Ім'я">
              <UInput v-model="profileForm.name" placeholder="Введіть ваше ім'я" icon="i-heroicons-user" />
            </UFormField>
            
            <UFormField label="Телефон">
              <UInput v-model="profileForm.phone" placeholder="+380991234567" icon="i-heroicons-phone" />
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
              <UButton type="submit" color="primary" :loading="isSavingProfile">
                Зберегти зміни
              </UButton>
            </div>
          </form>
        </UCard>
      </div>
    </main>
  </div>
</template>
