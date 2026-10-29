<script setup lang="ts">
import { SELLER_STEPS } from "~/constants/sliders/sliders";
import { BUYER_STEPS } from "~/constants/sliders/sliders";

const router = useRouter();

// Вибір категорії на головній одразу веде в каталог з відповідним фільтром
const goToCategory = (categoryId: string) => {
  router.push({
    path: APP_ROUTES.CATALOG,
    query: categoryId ? { category: categoryId } : {},
  });
};
</script>

<template>
  <section class="pt-6 pb-12 lg:py-12">
    <UContainer>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div class="text-center lg:text-left">
          <h1
            class="text-2xl sm:text-4xl md:text-3xl xl:text-4xl font-extrabold tracking-tight text-neutral-700 font-raleway dark:text-white space-y-3 sm:space-y-3 md:space-y-4 uppercase"
          >
            <span class="block">
              <span class="whitespace-nowrap">{{ $t("hero.title.fast") }}</span>
              <span class="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 xl:w-2.5 xl:h-2.5 rounded-full bg-neutral-700 mx-1.5 sm:mx-2.5 align-middle -mt-0.5"></span>
              <span class="whitespace-nowrap">{{ $t("hero.title.convenient") }}</span>
              <span class="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 xl:w-2.5 xl:h-2.5 rounded-full bg-neutral-700 mx-1.5 sm:mx-2.5 align-middle -mt-0.5"></span>
              <span class="whitespace-nowrap">{{ $t("hero.title.nearby") }}</span>
            </span>
            <span class="block text-brand-500 text-3xl sm:text-5xl md:text-4xl xl:text-5xl">{{ $t("hero.title.line2") }}</span>
            <span class="block">{{ $t("hero.title.line3") }}</span>
          </h1>

          <p
            class="mx-auto lg:mx-0 mt-6 sm:mt-8 max-w-2xl text-base md:text-xl text-neutral-600 dark:text-neutral-400"
          >
            {{ $t("hero.description") }}
          </p>

          <!-- Блок спеціалізації платформи замість фіктивних цифр -->
          <div
            class="mt-6 md:mt-8 p-4 sm:p-4.5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/70 shadow-xs max-w-xl mx-auto lg:mx-0 text-left"
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
                  {{ $t("hero.specialization.title") }}
                </p>
                <p
                  class="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-snug"
                >
                  {{ $t("hero.specialization.description") }}
                </p>
              </div>
            </div>

            <div
              class="mt-3.5 pt-3 border-t border-neutral-200/80 dark:border-neutral-700/70"
            >
              <CommonCategoryPicker
                size="md"
                variant="outline"
                :placeholder="$t('hero.specialization.chooseCategory')"
                trigger-class="!bg-white dark:!bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-brand-400 dark:hover:border-brand-500 shadow-xs hover:shadow-sm !font-semibold !text-neutral-900 dark:!text-white py-2.5 px-3.5 rounded-xl transition-all cursor-pointer"
                icon-class="!text-brand-500 dark:!text-brand-400 !w-4.5 !h-4.5"
                text-class="!font-semibold !text-neutral-900 dark:!text-white text-sm"
                chevron-class="!text-brand-500 dark:!text-brand-400"
                @select="goToCategory"
              />
            </div>
          </div>

          <div
            class="mt-5 sm:mt-6 md:mt-8 flex flex-col items-center justify-center lg:justify-start lg:items-start gap-2.5 sm:gap-3.5 sm:flex-row"
          >
            <UButton
              :to="APP_ROUTES.CATALOG"
              size="lg"
              class="bg-brand-500 hover:bg-brand-600 text-sm sm:text-base py-2 sm:py-2.5 px-4.5 sm:px-5 font-bold rounded-xl shadow-sm transition-all"
              icon="i-heroicons-magnifying-glass-circle"
            >
              {{ $t("hero.buttons.buy") }}
            </UButton>

            <UButton
              :to="APP_ROUTES.CREATE_LISTING"
              size="lg"
              color="neutral"
              variant="outline"
              class="text-sm sm:text-base py-2 sm:py-2.5 px-4.5 sm:px-5 font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded-xl shadow-xs transition-all"
              icon="i-heroicons-plus-circle"
            >
              {{ $t("hero.buttons.sell") }}
            </UButton>
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
