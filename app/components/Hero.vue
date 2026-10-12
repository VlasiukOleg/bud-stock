<script setup lang="ts">
import { computed } from "vue";
import type { DropdownMenuItem } from "@nuxt/ui";
import { SELLER_STEPS } from "~/constants/sliders/sliders";
import { BUYER_STEPS } from "~/constants/sliders/sliders";
import { CATEGORY_DATA } from "~/constants/category/category";

const router = useRouter();

const categoryDropdownItems = computed<DropdownMenuItem[][]>(() => {
  return [
    CATEGORY_DATA.map((category) => ({
      label: category.name,
      icon: category.icon,
      children: [
        [
          {
            label: `Всі в категорії "${category.name}"`,
            icon: "i-lucide-arrow-right",
            onSelect: () => {
              router.push({
                path: APP_ROUTES.CATALOG,
                query: { category: category.id },
              });
            },
          },
        ],
        [
          ...category.subcategories.map((sub) => ({
            label: sub.name,
            onSelect: () => {
              router.push({
                path: APP_ROUTES.CATALOG,
                query: { category: sub.id },
              });
            },
          })),
        ],
      ],
    })),
  ];
});
</script>

<template>
  <section class="pt-6 pb-12 lg:py-12">
    <UContainer>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div class="text-center lg:text-left">
          <h1
            class="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-900 font-public dark:text-white space-y-3 md:space-y-4"
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
              :to="APP_ROUTES.CATALOG"
              size="xl"
              class="bg-brand-500 hover:bg-brand-600 text-lg"
              icon="i-streamline-ultimate-color:e-commerce-touch-buy"
            >
              {{ $t("hero.buttons.buy") }}
            </UButton>

            <UButton
              :to="APP_ROUTES.CREATE_LISTING"
              size="xl"
              color="neutral"
              variant="outline"
              class="text-lg hover:bg-neutral-50 dark:hover:bg-neutral-900"
              icon="i-streamline-emojis:money-bag"
            >
              {{ $t("hero.buttons.sell") }}
            </UButton>
          </div>

          <!-- Блок спеціалізації платформи замість фіктивних цифр -->
          <div
            class="mt-8 lg:mt-10 p-4 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 backdrop-blur-sm shadow-xs max-w-xl mx-auto lg:mx-0 text-left"
          >
            <div class="flex items-start gap-3">
              <div
                class="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 shrink-0 mt-0.5"
              >
                <UIcon name="i-lucide-boxes" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-0.5"
                >
                  Спеціалізація платформи
                </p>
                <p
                  class="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-snug"
                >
                  Залишки будматеріалів: від чорнових робіт до чистового оздоблення (все до меблювання).
                </p>
              </div>
            </div>

            <div
              class="mt-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-700/60 flex flex-wrap items-center justify-between gap-2"
            >
              <span class="text-xs text-neutral-500 dark:text-neutral-400">
                11 категорій для будівництва та ремонту:
              </span>

              <UDropdownMenu
                :items="categoryDropdownItems"
                :ui="{ content: 'w-72 max-h-96 overflow-y-auto' }"
              >
                <UButton
                  color="neutral"
                  variant="soft"
                  size="sm"
                  class="font-medium text-xs rounded-lg cursor-pointer"
                  trailing-icon="i-lucide-chevron-down"
                >
                  Подивитися категорії
                </UButton>
              </UDropdownMenu>
            </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row justify-center gap-4 lg:gap-0">
          <h2
            class="lg:hidden text-center text-3xl sm:text-3xl xl:text-4xl font-bold font-public text-neutral-900 mb-6"
          >
            {{ $t("howItWorks.title") }}
          </h2>
          <div class="relative lg:mr-4">
            <div
              class="absolute z-10 -top-6 left-2 lg:left-18 font-bold text-blue-500 dark:text-brand-400 text-sm uppercase tracking-wider"
            >
              {{ $t("hero.sliderSeller.label") }}
            </div>
            <div class="hidden lg:block">
              <!-- <UCarousel
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
              </UCarousel> -->
              <UMarquee
                pause-on-hover
                :overlay="false"
                orientation="vertical"
                :ui="{
                  root: '[--gap:--spacing(4)] bg-blue-100 py-2 h-[550px]',
                  content: 'px-2',
                }"
              >
                <div v-for="sellerStep in SELLER_STEPS" class="w-57.5 h-60">
                  <CommonSliderCard :item="sellerStep" />
                </div>
              </UMarquee>
            </div>

            <div class="block lg:hidden">
              <!-- <UCarousel
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
              </UCarousel> -->
              <UMarquee
                pause-on-hover
                :overlay="false"
                :ui="{
                  root: '[--gap:--spacing(4)] bg-blue-100 py-2',
                  content: 'w-[auto] py-1',
                }"
              >
                <div
                  v-for="sellerStep in SELLER_STEPS"
                  class="w-45 sm:w-50 md:w-60 h-45"
                >
                  <CommonSliderCard :item="sellerStep" />
                </div>
              </UMarquee>
            </div>
          </div>
          <div class="relative">
            <div
              class="absolute z-10 right-2 -bottom-6 lg:left-18 font-bold text-red-500 dark:text-brand-400 text-sm uppercase tracking-wider"
            >
              {{ $t("hero.sliderBuyer.label") }}
            </div>
            <div class="hidden lg:block">
              <!-- <UCarousel
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
              </UCarousel> -->
              <UMarquee
                pause-on-hover
                :overlay="false"
                orientation="vertical"
                reverse
                :ui="{
                  root: '[--gap:--spacing(4)] bg-red-100 py-2 h-[550px]',
                  content: 'px-2',
                }"
              >
                <div v-for="buyerStep in BUYER_STEPS" class="w-57.5 h-60">
                  <CommonSliderCard :item="buyerStep" />
                </div>
              </UMarquee>
            </div>
            <div class="block lg:hidden">
              <!-- <UCarousel
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
              </UCarousel> -->
              <UMarquee
                pause-on-hover
                reverse
                :overlay="false"
                :ui="{
                  root: '[--gap:--spacing(4)] bg-red-100 py-2',
                  content: 'w-[auto] py-1',
                }"
              >
                <div
                  v-for="buyerStep in BUYER_STEPS"
                  class="w-45 sm:w-50 md:w-60 h-45"
                >
                  <CommonSliderCard :item="buyerStep" />
                </div>
              </UMarquee>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<style scoped></style>
