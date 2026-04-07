<template>
  <div>
    <Header :class="route.path === '/' ? 'block' : 'hidden lg:block'" />
    <UMain>
      <slot />
    </UMain>
    <Footer :class="route.path === '/' ? 'block' : 'hidden lg:block'" />
    <UiMobileMenu v-if="route.path !== '/'" class="lg:hidden"/>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
