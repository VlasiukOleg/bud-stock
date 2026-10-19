<template>
  <div class="min-h-screen flex flex-col justify-between">
    <Header />
    <UMain class="min-h-0 flex-1 flex flex-col">
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
