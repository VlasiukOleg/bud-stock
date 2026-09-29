const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', '..', 'i18n', 'locales');
const locales = ['uk.json', 'en.json', 'ru.json'];

const newTranslations = {
  citySelector: {
    title: {
      uk: "Оберіть ваше місто",
      en: "Choose your city",
      ru: "Выберите ваш город"
    },
    searchPlaceholder: {
      uk: "Пошук населеного пункту...",
      en: "Search for a settlement...",
      ru: "Поиск населенного пункта..."
    },
    notFound: {
      uk: "Нічого не знайдено",
      en: "Nothing found",
      ru: "Ничего не найдено"
    },
    yourCity: {
      uk: "Ваше місто {city}?",
      en: "Is your city {city}?",
      ru: "Ваш город {city}?"
    },
    yesCorrect: {
      uk: "Так, вірно",
      en: "Yes, correct",
      ru: "Да, верно"
    },
    popularCities: {
      uk: "Популярні міста",
      en: "Popular cities",
      ru: "Популярные города"
    },
    or: {
      uk: "або",
      en: "or",
      ru: "или"
    },
    exactLocation: {
      uk: "Визначити точне місцезнаходження",
      en: "Determine exact location",
      ru: "Определить точное местоположение"
    },
    errorSearching: {
      uk: "Помилка пошуку міст",
      en: "Error searching cities",
      ru: "Ошибка поиска городов"
    },
    cities: {
      kyiv: { uk: "Київ", en: "Kyiv", ru: "Киев" },
      lviv: { uk: "Львів", en: "Lviv", ru: "Львов" },
      odesa: { uk: "Одеса", en: "Odesa", ru: "Одесса" },
      dnipro: { uk: "Дніпро", en: "Dnipro", ru: "Днепр" },
      kharkiv: { uk: "Харків", en: "Kharkiv", ru: "Харьков" }
    }
  }
};

locales.forEach(locale => {
  const filePath = path.join(localesDir, locale);
  const lang = locale.replace('.json', '');
  
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.citySelector) {
      data.citySelector = {};
    }
    
    Object.keys(newTranslations.citySelector).forEach(key => {
      if (key === 'cities') {
        data.citySelector.cities = {};
        Object.keys(newTranslations.citySelector.cities).forEach(cityKey => {
          data.citySelector.cities[cityKey] = newTranslations.citySelector.cities[cityKey][lang];
        });
      } else {
        data.citySelector[key] = newTranslations.citySelector[key][lang];
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale}`);
  }
});
