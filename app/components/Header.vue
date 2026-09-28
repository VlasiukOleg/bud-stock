<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { ref, computed } from 'vue';

const route = useRoute();
const { t } = useI18n();

const user = useSupabaseUser()
const isSlideoverOpen = useState('isSlideoverOpen', () => false)

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('header.sellMaterial'),
    to: "/sell",
    icon: "i-streamline-emojis:money-bag",
    active: route.path.startsWith("/sell"),
  },
  {
    label: t('header.buyMaterial'),
    to: "/catalog",
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

const userInitials = computed(() => {
  if (!user.value) return '';
  const name = user.value.user_metadata?.full_name;
  if (name) return name.substring(0, 2).toUpperCase();
  const email = user.value.email;
  if (email) return email.substring(0, 2).toUpperCase();
  return 'U';
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
          @click="() => {isSlideoverOpen = true}"
          :aria-label="t('header.profile')"
        >
          <UAvatar :class="{ 'ring-2 ring-brand-500': isProfileRouteActive }" :src="user.user_metadata?.avatar_url" :text="!user.user_metadata?.avatar_url ? userInitials : undefined" :alt="userInitials" size="sm" />
        </UButton>
        <UButton
          v-else
          color="neutral"
          variant="ghost"
          to="/login"
          icon="i-icon-park-solid:people"
          :aria-label="t('header.login')"
        />
    </template>
  </UHeader>
  
  <ClientOnly>
    <UserSlideover v-model:open="isSlideoverOpen" />
  </ClientOnly>
</template>
