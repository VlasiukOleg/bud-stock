<template>
  <div class="relative bg-white dark:bg-neutral-950">
    <div class="absolute inset-0 bd-grid-pattern" />
    <div class="relative z-10">
      <Hero />
      <Features />
      <LatestProductList />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.bd-grid-pattern {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(var(--grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
  background-size: 40px 40px;
  --grid-color: var(--color-grid-light);
  opacity: 0.5;
}

.dark .bd-grid-pattern {
  --grid-color: var(--color-grid-dark);
  opacity: 1;
}
</style>
