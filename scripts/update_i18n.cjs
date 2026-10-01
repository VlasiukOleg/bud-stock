const fs = require('fs');

const addKeys = (filePath, lang) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(content);

  // Profile listings
  if (!data.profile.listings.tabs) {
    data.profile.listings.tabs = {
      active: lang === 'uk' ? 'Активні' : lang === 'ru' ? 'Активные' : 'Active',
      sold: lang === 'uk' ? 'Продані' : lang === 'ru' ? 'Проданные' : 'Sold',
      deactivated: lang === 'uk' ? 'Приховані' : lang === 'ru' ? 'Скрытые' : 'Hidden'
    };
    data.profile.listings.statusUpdated = lang === 'uk' ? 'Статус успішно оновлено' : lang === 'ru' ? 'Статус успешно обновлен' : 'Status successfully updated';
    data.profile.listings.statusUpdateError = lang === 'uk' ? 'Помилка оновлення статусу' : lang === 'ru' ? 'Ошибка обновления статуса' : 'Error updating status';
    data.profile.listings.noActive = lang === 'uk' ? 'Немає активних оголошень' : lang === 'ru' ? 'Нет активных объявлений' : 'No active listings';
    data.profile.listings.noSold = lang === 'uk' ? 'Ще немає проданих товарів' : lang === 'ru' ? 'Еще нет проданных товаров' : 'No sold items yet';
    data.profile.listings.noDeactivated = lang === 'uk' ? 'Немає прихованих оголошень' : lang === 'ru' ? 'Нет скрытых объявлений' : 'No hidden listings';
  }

  // Profile chats
  if (!data.profile.chats) {
    data.profile.chats = {
      tabs: {
        buying: lang === 'uk' ? 'Я купую' : lang === 'ru' ? 'Я покупаю' : 'I am buying',
        selling: lang === 'uk' ? 'Я продаю' : lang === 'ru' ? 'Я продаю' : 'I am selling'
      },
      title: lang === 'uk' ? 'Мої чати' : lang === 'ru' ? 'Мои чаты' : 'My chats',
      loading: lang === 'uk' ? 'Завантаження чатів...' : lang === 'ru' ? 'Загрузка чатов...' : 'Loading chats...',
      noBuying: lang === 'uk' ? 'У вас ще немає чатів, де ви купуєте' : lang === 'ru' ? 'У вас еще нет чатов, где вы покупаете' : 'You have no buying chats yet',
      noSelling: lang === 'uk' ? 'У вас ще немає чатів, де ви продаєте' : lang === 'ru' ? 'У вас еще нет чатов, где вы продаете' : 'You have no selling chats yet',
      listingDeleted: lang === 'uk' ? 'Оголошення видалено' : lang === 'ru' ? 'Объявление удалено' : 'Listing deleted',
      new: lang === 'uk' ? 'Нове' : lang === 'ru' ? 'Новое' : 'New',
      sold: lang === 'uk' ? 'Продано' : lang === 'ru' ? 'Продано' : 'Sold',
      hidden: lang === 'uk' ? 'Приховано' : lang === 'ru' ? 'Скрыто' : 'Hidden',
      updated: lang === 'uk' ? 'Оновлено' : lang === 'ru' ? 'Обновлено' : 'Updated'
    };
  }

  // Chat errors
  if (!data.chat) {
    data.chat = {
      errors: {
        notLoggedIn: lang === 'uk' ? 'Необхідно увійти в систему' : lang === 'ru' ? 'Необходимо войти в систему' : 'You must log in',
        unavailableTitle: lang === 'uk' ? 'Недоступно' : lang === 'ru' ? 'Недоступно' : 'Unavailable',
        listingUnavailable: lang === 'uk' ? 'Цей товар вже продано або знято з публікації.' : lang === 'ru' ? 'Этот товар уже продан или снят с публикации.' : 'This listing is already sold or unpublished.',
        createFailed: lang === 'uk' ? 'Не вдалося створити чат в БД' : lang === 'ru' ? 'Не удалось создать чат в БД' : 'Failed to create chat in DB',
        sendFailed: lang === 'uk' ? 'Помилка відправки' : lang === 'ru' ? 'Ошибка отправки' : 'Send error',
        error: lang === 'uk' ? 'Помилка' : lang === 'ru' ? 'Ошибка' : 'Error'
      }
    };
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
};

addKeys('c:/GoItFullStack74/TestTask/bud-stock/i18n/locales/uk.json', 'uk');
addKeys('c:/GoItFullStack74/TestTask/bud-stock/i18n/locales/ru.json', 'ru');
addKeys('c:/GoItFullStack74/TestTask/bud-stock/i18n/locales/en.json', 'en');
