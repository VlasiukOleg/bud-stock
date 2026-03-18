<script setup lang="ts">
import { SELLER_STEPS } from "~/constants/sliders/sliders";
import { BUYER_STEPS } from "~/constants/sliders/sliders";
</script>

<template>
  <div
    class="relative overflow-hidden bg-white dark:bg-neutral-950 pt-6 pb-12 lg:py-12"
  >
    <div class="absolute inset-0 bd-grid-pattern" />

    <UContainer class="relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div class="text-center lg:text-left">
          <h1
            class="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white space-y-3 md:space-y-4"
          >
            <span class="block">{{ $t("hero.title.line1") }}</span>
            <span
              class="block text-brand-500 text-3xl sm:text-[40px] xl:text-5xl"
              >{{ $t("hero.title.line2") }}</span
            >
            <span class="block text-3xl sm:text-4xl xl:text-5xl">{{
              $t("hero.title.line3")
            }}</span>
          </h1>

          <p
            class="mx-auto lg:mx-0 mt-8 max-w-2xl text-base md:text-xl text-neutral-600 dark:text-neutral-400"
          >
            {{ $t("hero.description") }}
          </p>

          <div
            class="mt-8 md:mt-10 flex flex-col items-center justify-center lg:justify-start lg:items-start gap-4 sm:flex-row"
          >
            <UButton
              to="/catalog"
              size="xl"
              class="bg-brand-500 hover:bg-brand-600 text-lg"
              icon="i-streamline-ultimate-color:e-commerce-touch-buy"
            >
              {{ $t("hero.buttons.buy") }}
            </UButton>

            <UButton
              to="/sell"
              size="xl"
              color="neutral"
              variant="outline"
              class="text-lg hover:bg-neutral-50 dark:hover:bg-neutral-900"
              icon="i-streamline-emojis:money-bag"
            >
              {{ $t("hero.buttons.sell") }}
            </UButton>
          </div>

          <div class="mt-8 lg:mt-12 text-sm text-neutral-500">
            Вже більше
            <span class="font-medium text-neutral-700 dark:text-neutral-300"
              >10 000+</span
            >
            оголошень по всій Україні
          </div>
        </div>

        <div class="flex flex-col lg:flex-row justify-center gap-4 lg:gap-0">
          <div class="relative lg:mr-4">
            <div
              class="absolute z-10 -top-6 left-2 lg:left-18 font-bold text-blue-500 dark:text-brand-400 text-sm uppercase tracking-wider"
            >
              {{ $t("hero.sliderSeller.label") }}
            </div>
            <div class="hidden lg:block">
              <UCarousel
                v-slot="{ item }"
                loop
                :auto-scroll="{ speed: 0.7 }"
                :items="SELLER_STEPS"
                :ui="{
                  container: 'h-[550px] w-[230px]',
                  item: 'basis-1/2 px-2',
                  viewport: 'bg-blue-100',
                }"
                orientation="vertical"
              >
                <CommonSliderCard :item="item" />
              </UCarousel>
            </div>

            <div class="block lg:hidden">
              <UCarousel
                v-slot="{ item }"
                loop
                :auto-scroll="{ speed: 0.7 }"
                :items="SELLER_STEPS"
                orientation="horizontal"
                :ui="{
                  container: 'h-[180px] w-full',
                  item: 'basis-1/2 sm:basis-1/3 py-2',
                  viewport: 'bg-blue-100',
                }"
              >
                <CommonSliderCard :item="item" />
              </UCarousel>
            </div>
          </div>
          <div class="relative">
            <div
              class="absolute z-10 right-2 -bottom-6 lg:left-18 font-bold text-red-500 dark:text-brand-400 text-sm uppercase tracking-wider"
            >
              {{ $t("hero.sliderBuyer.label") }}
            </div>
            <div class="hidden lg:block">
              <UCarousel
                v-slot="{ item, index }"
                loop
                :auto-scroll="{ speed: 0.7, direction: 'backward' }"
                :items="BUYER_STEPS"
                :ui="{
                  container: 'h-[550px] w-[230px]',
                  item: 'basis-1/2 px-2',
                  viewport: 'bg-red-100',
                }"
                orientation="vertical"
              >
                <CommonSliderCard :item="item" />
              </UCarousel>
            </div>
            <div class="block lg:hidden">
              <UCarousel
                v-slot="{ item }"
                loop
                :auto-scroll="{ speed: 0.7, direction: 'backward' }"
                :items="BUYER_STEPS"
                orientation="horizontal"
                :ui="{
                  container: 'h-[180px] w-full',
                  item: 'basis-1/2 sm:basis-1/3 py-2',
                  viewport: 'bg-red-100',
                }"
              >
                <CommonSliderCard :item="item" />
              </UCarousel>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

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
