import { GoogleGenAI, Type } from "@google/genai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const formData = await readMultipartFormData(event);
  const file = formData?.find((item) => item.name === "image");

  if (!file)
    throw createError({ statusCode: 400, message: "Фото не знайдено" });

  const categoriesList = `
    c1: Будівельні суміші (c1-1: Штукатурки, c1-2: Шпаклівки, c1-3: Клеї для плитки, c1-4: Стяжки та наливні підлоги, c1-5: Цемент, пісок, щебінь)
    c2: Гіпсокартон та системи (c2-1: Гіпсокартонні листи, c2-2: Профілі, c2-3: Кріплення та аксесуари, c2-4: Маяки та кутники)
    c3: Фарби та лаки (c3-1: Фарби інтер'єрні, c3-2: Фарби фасадні, c3-3: Емалі, c3-4: Грунтовки, c3-5: Лаки та морилки)
    c4: Плитка та керамограніт (c4-1: Керамічна плитка, c4-2: Керамограніт, c4-3: Мозаїка, c4-4: Клінкерна плитка, c4-5: Затирки для швів)
    c5: Інструменти (c5-1: Електроінструмент, c5-2: Ручний інструмент, c5-3: Витратні матеріали, c5-4: Вимірювальний інструмент, c5-5: Спецодяг та захист)
    c6: Пиломатеріали (c6-1: Дошка та брус, c6-2: OSB, ДСП, ДВП, c6-3: Фанера, c6-4: Вагонка)
    c7: Електрика (c7-1: Кабель та провід, c7-2: Розетки та вимикачі, c7-3: Освітлення, c7-4: Автоматика та щитки, c7-5: Монтажні коробки)
    c8: Сантехніка (c8-1: Труби та фітинги, c8-2: Змішувачі, c8-3: Ванни та душові, c8-4: Унітази та біде, c8-5: Сифони та трапи)
    c9: Ізоляція (c9-1: Теплоізоляція, c9-2: Гідроізоляція, c9-3: Звукоізоляція, c9-4: Монтажні піни та герметики)
    c10: Кріплення (c10-1: Саморізи та шурупи, c10-2: Дюбелі та анкери, c10-3: Цвяхи, c10-4: Метрика, c10-5: Перфороване кріплення)
  `;

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    const response = await ai.models.generateContent({
      // Використовуємо рекомендовану модель з твого файлу
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: file.data.toString("base64"),
            mimeType: file.type || "image/jpeg",
          },
        },
        {
          text: `Ти — експерт з будівельних товарів. 
          Завдання:
          1. Визнач назву товару.
          2. Напиши короткий опис.
          3. Знайди середню ціну в інтернет магазинах Києва грн.
          4. Визнач, чи є товар релевантним (будівництво/ремонт) - це все що стосується дому та будівництва, включаючи меблі, оформлення, декор.
          5. Оберіть найбільш підходящий ID категорії з цього списку:
          ${categoriesList}
          6. Критерії вибору категорії:
          6.1. Спробуй визначити найбільш точну ПІДКАТЕГОРІЮ (наприклад, 'c3-1' для інтер'єрної фарби).
          6.2. Якщо товар точно належить до групи, але ти не впевнений щодо підкатегорії, вибери основний ID КАТЕГОРІЇ (наприклад, 'c3').
          6.3. Якщо товар не є будівельним або ремонтним, встанови isRelevant: false.
          
          Якщо товар не підходить жодній категорії, вибери найбільш близьку або залиш порожньою.`,
        },
      ],
      config: {
        // Суворе дотримання формату відповіді
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            price: { type: Type.NUMBER },
            description: { type: Type.STRING },
            isRelevant: {
              type: Type.BOOLEAN,
              description: "Чи є товар будівельним матеріалом або інструментом",
            },
            categoryId: {
              type: Type.STRING,
              description: "ID категорії (наприклад, c1, c2, c3...)",
            },
          },

          required: [
            "title",
            "price",
            "description",
            "isRelevant",
            "categoryId",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw createError({
        statusCode: 500,
        message: "ШІ повернув порожню відповідь",
      });
    }
    return JSON.parse(resultText);
  } catch (e) {
    console.error("Gemini API Error:", e);
    throw createError({ statusCode: 500, message: "Помилка аналізу" });
  }
});
