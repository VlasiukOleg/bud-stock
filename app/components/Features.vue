<template>
  <section class="py-6 lg:py-12 border-t border-brand-500 dark:border-gray-500">
    <h2
      class="text-center text-3xl sm:text-3xl xl:text-4xl font-bold font-public text-neutral-900 mb-6 dark:text-white"
    >
      {{ $t("features.title") }}
    </h2>
    <UContainer>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <CommonFeatureCard
          v-for="item in FEATURE_LIST"
          :key="item.id"
          :feature="item"
        />
      </div>
    </UContainer>
  </section>
</template>
<script setup lang="ts">
import { FEATURE_LIST } from "~/constants/features/features";
</script>
<style></style>
