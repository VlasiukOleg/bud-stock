<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { ref, computed } from 'vue';

const route = useRoute();
const { t } = useI18n();
const { unreadCount } = useChat();

const user = useSupabaseUser()
const isSlideoverOpen = useState('isSlideoverOpen', () => false)

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('header.sellMaterial'),
    to: APP_ROUTES.CREATE_LISTING,
    icon: "i-heroicons-plus-circle",
    active: route.path.startsWith("/sell"),
  },
  {
    label: t('header.buyMaterial'),
    to: APP_ROUTES.CATALOG,
    icon: "i-heroicons-magnifying-glass-circle",
    active: route.path.startsWith("/catalog"),
  },
]);

const buttonText = computed(() => {
  if (user.value) {
    return t('header.profile')
  }
  return t('header.login')
})

const isProfileRouteActive = computed(() => {
  return route.path.startsWith("/profile")
})

</script>

<template>
  <UHeader
    :toggle="false"
    :ui="{
      root: 'h-12 md:h-(--ui-header-height) sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800',
      container: 'py-0 px-3 md:px-6 lg:px-8 flex items-center justify-between gap-2 h-full',
    }"
  >
    <template #left>
      <CommonLogo />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <CommonLocaleSelect />
      <UColorModeButton />
      
      <UButton
        v-if="user"
        color="neutral"
        variant="ghost"
        icon="i-heroicons-chat-bubble-left-right"
        :to="APP_ROUTES.PROFILE.CHATS"
        aria-label="Мої чати"
        class="hidden lg:flex relative"
      >
        <span 
          v-if="unreadCount > 0"
          class="absolute top-1 right-1 flex items-center justify-center w-3 h-3 bg-red-500 rounded-full border border-white dark:border-gray-900"
        >
        </span>
      </UButton>

      <UButton
        v-if="user"
        color="neutral"
        variant="ghost"
        @click="() => { isSlideoverOpen = true }"
        :aria-label="t('header.profile')"
        class="hidden lg:flex items-center gap-2"
      >
        <CommonUserAvatar
          :uiClass="{ 'ring-2 ring-brand-500': isProfileRouteActive }"
          :src="getUserAvatarUrl(user)"
          :name="user.user_metadata?.full_name"
          :email="user.email"
          size="sm"
        />
        <span class="text-sm font-medium">{{ $t('header.profile') }}</span>
      </UButton>
      <UButton
        v-else
        color="neutral"
        variant="ghost"
        :to="APP_ROUTES.AUTH.LOGIN"
        icon="i-heroicons-arrow-right-end-on-rectangle"
        :label="$t('header.login')"
        class="hidden lg:flex font-medium"
      />
    </template>
  </UHeader>
  
  <ClientOnly>
    <UserSlideover v-model:open="isSlideoverOpen" />
  </ClientOnly>
</template>
