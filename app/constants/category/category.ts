import type { CategoryItem } from "~/types";

export const CATEGORY_DATA: CategoryItem[] = [
  {
    id: "c1",
    name: "Будівельні суміші",
    icon: "i-lucide-box",
    subcategories: [
      { id: "c1-1", name: "Штукатурки" },
      { id: "c1-2", name: "Шпаклівки" },
      { id: "c1-3", name: "Клеї для плитки" },
      { id: "c1-4", name: "Стяжки та наливні підлоги" },
      { id: "c1-5", name: "Цемент, пісок, щебінь" },
    ],
  },
  {
    id: "c2",
    name: "Гіпсокартон та системи",
    icon: "i-lucide-layers",
    subcategories: [
      { id: "c2-1", name: "Гіпсокартонні листи" },
      { id: "c2-2", name: "Профілі для гіпсокартону" },
      { id: "c2-3", name: "Кріплення та аксесуари" },
      { id: "c2-4", name: "Маяки та кутники" },
    ],
  },
  {
    id: "c3",
    name: "Фарби та лаки",
    icon: "i-lucide-paintbrush",
    subcategories: [
      { id: "c3-1", name: "Фарби інтер'єрні" },
      { id: "c3-2", name: "Фарби фасадні" },
      { id: "c3-3", name: "Емалі" },
      { id: "c3-4", name: "Грунтовки" },
      { id: "c3-5", name: "Лаки та морилки" },
    ],
  },
  {
    id: "c4",
    name: "Плитка та керамограніт",
    icon: "i-lucide-brick-wall",
    subcategories: [
      { id: "c4-1", name: "Керамічна плитка" },
      { id: "c4-2", name: "Керамограніт" },
      { id: "c4-3", name: "Мозаїка" },
      { id: "c4-4", name: "Клінкерна плитка" },
      { id: "c4-5", name: "Затирки для швів" },
    ],
  },
  {
    id: "c5",
    name: "Інструменти",
    icon: "i-lucide-wrench",
    subcategories: [
      { id: "c5-1", name: "Електроінструмент" },
      { id: "c5-2", name: "Ручний інструмент" },
      { id: "c5-3", name: "Витратні матеріали" },
      { id: "c5-4", name: "Вимірювальний інструмент" },
      { id: "c5-5", name: "Спецодяг та захист" },
    ],
  },
  {
    id: "c6",
    name: "Пиломатеріали",
    icon: "i-lucide-tree-pine",
    subcategories: [
      { id: "c6-1", name: "Дошка та брус" },
      { id: "c6-2", name: "OSB, ДСП, ДВП" },
      { id: "c6-3", name: "Фанера" },
      { id: "c6-4", name: "Вагонка" },
    ],
  },
  {
    id: "c7",
    name: "Електрика",
    icon: "i-lucide-zap",
    subcategories: [
      { id: "c7-1", name: "Кабель та провід" },
      { id: "c7-2", name: "Розетки та вимикачі" },
      { id: "c7-3", name: "Освітлення" },
      { id: "c7-4", name: "Автоматика та щитки" },
      { id: "c7-5", name: "Монтажні коробки" },
    ],
  },
  {
    id: "c8",
    name: "Сантехніка",
    icon: "i-lucide-droplet",
    subcategories: [
      { id: "c8-1", name: "Труби та фітинги" },
      { id: "c8-2", name: "Змішувачі" },
      { id: "c8-3", name: "Ванни та душові" },
      { id: "c8-4", name: "Унітази та біде" },
      { id: "c8-5", name: "Сифони та трапи" },
    ],
  },
  {
    id: "c9",
    name: "Ізоляція",
    icon: "i-lucide-wind",
    subcategories: [
      { id: "c9-1", name: "Теплоізоляція" },
      { id: "c9-2", name: "Гідроізоляція" },
      { id: "c9-3", name: "Звукоізоляція" },
      { id: "c9-4", name: "Монтажні піни та герметики" },
    ],
  },
  {
    id: "c10",
    name: "Кріплення",
    icon: "i-lucide-hammer",
    subcategories: [
      { id: "c10-1", name: "Саморізи та шурупи" },
      { id: "c10-2", name: "Дюбелі та анкери" },
      { id: "c10-3", name: "Цвяхи" },
      { id: "c10-4", name: "Метрика (болти, гайки)" },
      { id: "c10-5", name: "Перфороване кріплення" },
    ],
  },
];