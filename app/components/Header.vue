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
    icon: "i-streamline-emojis:money-bag",
    active: route.path.startsWith("/sell"),
  },
  {
    label: t('header.buyMaterial'),
    to: APP_ROUTES.CATALOG,
    icon: "i-streamline-ultimate-color:e-commerce-touch-buy",
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
  <UHeader :toggle="false">
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
        icon="i-heroicons-envelope"
        :to="APP_ROUTES.PROFILE.CHATS"
        aria-label="Мої повідомлення"
        class="flex relative"
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
          @click="() => {isSlideoverOpen = true}"
          :aria-label="t('header.profile')"
          class="hidden lg:flex"
        >
          <CommonUserAvatar
            :uiClass="{ 'ring-2 ring-brand-500': isProfileRouteActive }"
            :src="user.user_metadata?.avatar_url"
            :name="user.user_metadata?.full_name"
            :email="user.email"
            size="sm"
          />
        </UButton>
        <UButton
          v-else
          color="neutral"
          variant="ghost"
          :to="APP_ROUTES.AUTH.LOGIN"
          icon="i-icon-park-solid:people"
          :aria-label="t('header.login')"
        />
    </template>
  </UHeader>
  
  <ClientOnly>
    <UserSlideover v-model:open="isSlideoverOpen" />
  </ClientOnly>
</template>
