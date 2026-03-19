import type { FeatureItem } from "~/types/index";

export const FEATURE_LIST: FeatureItem[] = [
  {
    id: 1,
    icon: "i-heroicons-bell-alert",
    colorClass: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    title: "features.smartAlert.title",
    desc: "features.smartAlert.desc",
  },
  {
    id: 2,
    icon: "i-heroicons-shield-check",
    colorClass: "bg-green-100 dark:bg-green-900/30 text-green-600",
    title: "features.secure.title",
    desc: "features.secure.desc",
  },
  {
    id: 3,
    icon: "i-heroicons-bolt",
    colorClass: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
    title: "features.fast.title",
    desc: "features.fast.desc",
  },
  {
    id: 4,
    icon: "i-heroicons-banknotes",
    colorClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    title: "features.eco.title",
    desc: "features.eco.desc",
  },
];
