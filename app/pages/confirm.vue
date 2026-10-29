<script setup lang="ts">
import { APP_ROUTES } from '~/utils/routes'

const user = useSupabaseUser()
const route = useRoute()
const redirectInfo = useSupabaseCookieRedirect()

watch(user, () => {
  if (user.value) {
    const target = (route.query.redirect as string) || redirectInfo.pluck()
    if (target && target !== '/') return navigateTo(target, { replace: true })

    // Якщо новий користувач або не заповнено ім'я — на заповнення профілю
    const isNew = route.query.new_user === 'true' || !user.value.user_metadata?.full_name
    return navigateTo(isNew ? APP_ROUTES.PROFILE.INFORMATION : APP_ROUTES.HOME, { replace: true })
  }
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    if (!user.value) navigateTo(APP_ROUTES.AUTH.LOGIN, { replace: true })
  }, 3000)
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-xl shadow-sm text-center flex flex-col items-center gap-4">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      <p class="text-gray-600">Перевірка авторизації...</p>
    </div>
  </div>
</template>
