<template>
  <section class="py-6 lg:py-12">
    <UContainer>
      <div class="flex items-end justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-neutral-900 dark:text-white">
            Останні оголошення
          </h2>
          <p class="mt-2 text-neutral-600 dark:text-neutral-400">
            Актуальні пропозиції матеріалів у вашому місті
          </p>
        </div>
        <UButton
          to="/catalog"
          variant="link"
          color="primary"
          trailing-icon="i-heroicons-arrow-right"
          class="hidden sm:flex"
        >
          Дивитись всі
        </UButton>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
        <CommonProductCard
          v-for="product in MOCK_PRODUCTS"
          :key="product.id"
          :product="product"
        />
      </div>

      <div class="mt-10 text-center sm:hidden">
        <UButton
          to="/catalog"
          block
          size="lg"
          color="neutral"
          variant="outline"
        >
          Дивитись всі оголошення
        </UButton>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { MOCK_PRODUCTS } from '~/constants/products/products';
</script>
