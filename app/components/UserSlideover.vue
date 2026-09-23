<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const client = useSupabaseClient<any>()
const user = useSupabaseUser()

const handleLogOut = async () => {
  await client.auth.signOut()
  isOpen.value = false
  navigateTo('/login')
}

const route = useRoute()

watch(() => route.path, () => {
  isOpen.value = false
})

const menuItems = computed(() => [
  {
    label: 'Мої дані',
    icon: 'i-heroicons-user',
    to: '/profile/information'
  },
  {
    label: 'Мої оголошення',
    icon: 'i-heroicons-shopping-bag',
    to: '/profile/listings'
  },
  {
    label: 'Мої покупки',
    icon: 'i-heroicons-shopping-cart',
    to: '/profile/purchases'
  }
])

const avatarUrl = computed(() => user.value?.user_metadata?.avatar_url)
const userName = computed(() => user.value?.user_metadata?.full_name || 'Користувач')
const userEmail = computed(() => user.value?.email)

const router = useRouter()

const handleNavigation = async (path: string) => {
  isOpen.value = false
  try {
    await router.push(path)
  } catch (err) {
    console.error('Navigation error:', err)
  }
}
</script>

<template>
  <USlideover v-model:open="isOpen" side="left" title="Меню користувача" description="Навігація по профілю">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3 overflow-hidden">
          <UAvatar :src="avatarUrl" :alt="userName" size="md" />
          <div class="flex flex-col truncate text-left">
            <span class="font-semibold text-sm truncate">{{ userName }}</span>
            <span class="text-xs text-gray-500 truncate">{{ userEmail }}</span>
          </div>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1"
          @click="() => {isOpen = false}"
        />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-2 h-full">
        <UButton
          v-for="item in menuItems"
          :key="item.label"
          variant="ghost"
          color="neutral"
          :icon="item.icon"
          :to="item.to"
          class="w-full justify-start text-base py-2.5"
          :class="route.path === item.to ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''"
          @click="() => {isOpen = false}"
        >
          {{ item.label }}
        </UButton>
      </div>
    </template>

    <template #footer>
      <UButton
        variant="ghost"
        color="error"
        icon="i-heroicons-arrow-right-on-rectangle"
        class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-base py-2.5"
        @click="handleLogOut"
      >
        Вийти
      </UButton>
    </template>
  </USlideover>
</template>
