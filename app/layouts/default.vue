<template>
  <div>
    <Header />
    <UMain>
      <slot />
    </UMain>
    <Footer :class="route.path === '/' ? 'block' : 'hidden lg:block'" />
    <UiMobileMenu class="lg:hidden"/>
    <ChatSlideover />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
