export default defineEventHandler(async (event) => {
  // 1. Отримуємо параметри запиту (lat, lng) з URL
  const query = getQuery(event);
  const lat = query.lat;
  const lng = query.lng;

  if (!lat || !lng) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Latitude and Longitude are required',
    });
  }

  try {
    // 2. Робимо запит до Nominatim
    // ВАЖЛИВО: Nominatim блокує серверні запити без заголовка User-Agent, тому ми додаємо його
    const data: any = await $fetch(`https://nominatim.openstreetmap.org/reverse`, {
      headers: {
        'User-Agent': 'BudStock App / 1.0 (test-task)'
      },
      query: {
        format: 'jsonv2',
        lat,
        lon: lng,
        'accept-language': 'uk'
      }
    });

    if (data && data.address) {
      // 3. Форматуємо адресу
      const isExact = query.exact !== 'false';
      
      const parts = isExact 
        ? [
            data.address.road,
            data.address.house_number,
            data.address.city_district || data.address.suburb,
            data.address.city || data.address.town || data.address.village
          ].filter(Boolean)
        : [
            data.address.city_district || data.address.suburb,
            data.address.city || data.address.town || data.address.village
          ].filter(Boolean);
      
      // Повертаємо готовий рядок
      return { address: parts.join(', ') };
    }

    return { address: null };
  } catch (error) {
    console.error("Помилка геокодування:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch address from coordinates',
    });
  }
});
