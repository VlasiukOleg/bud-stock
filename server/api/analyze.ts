import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORY_DATA } from "~/constants/category/category";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const formData = await readMultipartFormData(event);
  const file = formData?.find((item) => item.name === "image");

  if (!file)
    throw createError({ statusCode: 400, message: "Фото не знайдено" });

  const categoriesList = CATEGORY_DATA.map((cat) => {
    const subs = cat.subcategories.map((s) => `${s.id}: ${s.name}`).join(", ");
    return `${cat.id}: ${cat.name} (${subs})`;
  }).join("\n");

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    const response = await ai.models.generateContent({
      // Використовуємо рекомендовану модель з твого файлу
      model: "gemini-2.5-flash",
      // model: "gemini-3.1-flash-lite",
      contents: [
        {
          inlineData: {
            data: file.data.toString("base64"),
            mimeType: file.type || "image/jpeg",
          },
        },
        {
          text: `Ти — експерт з будівельних матеріалів та ремонту. 
          Завдання:
          1. Визнач точну назву товару (бренд, тип матеріалу, характеристики).
          2. Напиши короткий інформативний опис українською мовою.
          3. Знайди середню ринкову ціну в інтернет-магазинах Києва та України в грн.
          4. Визнач, чи є товар будівельним матеріалом, інструментом або матеріалом для ремонту (чорнові роботи, оздоблення, електрика, сантехніка, плитка, підлога тощо).
          5. Оберіть найбільш підходящий ID категорії або підкатегорії з цього списку:
${categoriesList}
          6. Критерії вибору категорії:
          6.1. ОБОВ'ЯЗКОВО намагайся визначити найбільш точну ПІДКАТЕГОРІЮ (наприклад, для ламінату чи плитки — 'c4-5' або 'c4-1', для штукатурки — 'c1-1', для кабелю — 'c6-1').
          6.2. Якщо товар належить до певної групи, але точну підкатегорію важко обрати, вкажи ID основної категорії (наприклад, 'c4' або 'c1').
          6.3. Якщо товар взагалі не є будівельним або ремонтним, встанови isRelevant: false.
          
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
  } catch (e: any) {
    console.error("Gemini API Error:", e);

    if (e.status === 429) {
      throw createError({
        statusCode: 429,
        message:
          "Ліміт запитів вичерпано. Спробуйте іншу модель або зачекайте.",
      });
    }

    throw createError({
      statusCode: e.status || 500,
      message: "Помилка ШІ: " + (e.message || "Unknown error"),
    });
  }
});
