<script setup lang="ts">
import type { Product } from "~/types/index";

const props = defineProps<{
  product: Product;
}>();

const distance = Math.floor(Math.random() * 5) + 1;

const formattedPrice = computed(() => {
  return new Intl.NumberFormat("uk-UA").format(props.product.price);
});
</script>

<template>
  <NuxtLink
    to="/"
    class="group block bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-neutral-800"
  >
    <div
      class="aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative"
    >
      <img
        :src="product.images[0]"
        :alt="product.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute top-2 right-2">
        <UButton
          icon="i-heroicons-map"
          variant="solid"
          size="xs"
          class="shadow-md bg-brand-400 hover:bg-brand-500"
          @click.prevent=""
          >Переглянути на мапі</UButton
        >
      </div>
      <div class="absolute top-2 left-2">
        <UBadge size="sm" color="primary">
          {{ product.status }}
        </UBadge>
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3
          class="font-semibold text-sm sm:text-base line-clamp-2 text-neutral-900 dark:text-white h-12"
        >
          {{ product.title }}
        </h3>
      </div>

      <div class="flex items-baseline gap-1 mb-3">
        <span
          class="text-sm sm:text-xl font-bold text-green-600 dark:text-green-400"
        >
          {{ formattedPrice }}
        </span>
        <span
          class="text-sm font-medium text-green-600 dark:text-green-400 font-public"
          >грн</span
        >
      </div>

      <div
        class="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 mb-3"
      >
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-cube" class="w-4 h-4 text-neutral-400" />
          <span>{{ product.quantity }} {{ product.unit }}</span>
        </div>
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-neutral-400" />
          <span class="truncate"
            >{{ distance }} км •
            {{ product.location.address.split(",")[0] }}</span
          >
        </div>
      </div>

      <div
        class="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <UAvatar :alt="product.sellerName" size="xs" />
          <span
            class="text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >{{ product.sellerName }}</span
          >
        </div>
        <div class="flex items-center gap-1 text-xs">
          <UIcon
            name="i-heroicons-star-solid"
            class="w-3 h-3 text-yellow-400"
          />
          <span class="text-neutral-600 dark:text-neutral-400 font-bold">{{
            product.sellerRating
          }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
