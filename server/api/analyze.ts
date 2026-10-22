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
      // Модель з розширеним лімітом (500 RPD на Free Tier)
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          inlineData: {
            data: file.data.toString("base64"),
            mimeType: file.type || "image/jpeg",
          },
        },
        {
          text: `Ти — експерт з оцінки та модерації фото будівельних матеріалів та інструментів на платформі BudStock.
          
          КРИТИЧНО ВАЖЛИВА ВИМОГА ДО ФОТО:
          Надане зображення ПОВИННО бути реальною фотографією фізичного товару, будівельного матеріалу (мішок суміші, плитка, дошки, кабель, інструмент, сантехніка тощо) або його оригінальної упаковки/коробки.
          
          КАТЕГОРИЧНО ЗАБОРОНЕНО приймати як фото товару:
          - Скріншоти екрана (телефону, комп'ютера, сайтів інтернет-магазинів, мобільних додатків, чатів, соцмереж).
          - Будь-які документи: паперові або електронні чеки, рахунки, квитанції, накладні, прайс-листи, таблиці, списки.
          - Картинки, де є лише текст, логотип чи схема, але немає реального фізичного об'єкта.
          
          ЯКЩО ЗОБРАЖЕННЯ Є СКРІНШОТОМ, ЧЕКОМ, НАКЛАДНОЮ ЧИ ДОКУМЕНТОМ:
          - ОБОВ'ЯЗКОВО встанови isRealProductPhoto: false
          - ОБОВ'ЯЗКОВО встанови isDocumentOrScreenshot: true
          - ОБОВ'ЯЗКОВО встанови isRelevant: false
          - У полі rejectionReason напиши: "Завантажене зображення є скріншотом або документом. Будь ласка, завантажте реальне фото товару або його упаковки."
          
          ЯКЩО ЦЕ ДІЙСНО РЕАЛЬНЕ ФОТО ТОВАРУ:
          1. Встанови isRealProductPhoto: true, isDocumentOrScreenshot: false.
          2. Визнач, чи є товар будівельним матеріалом, інструментом або матеріалом для ремонту (чорнові роботи, оздоблення, електрика, сантехніка, плитка, підлога тощо). Якщо ні — встанови isRelevant: false, rejectionReason: "Товар не є будівельним матеріалом чи інструментом". Якщо так — isRelevant: true, rejectionReason: null.
          3. Визнач точну назву товару (бренд, тип матеріалу, характеристики).
          4. Напиши короткий інформативний опис українською мовою.
          5. Знайди середню ринкову ціну в інтернет-магазинах України в грн (число).
          6. Оберіть найбільш підходящий ID категорії або підкатегорії з цього списку:
${categoriesList}
             Критерії вибору категорії:
             - ОБОВ'ЯЗКОВО намагайся визначити найбільш точну ПІДКАТЕГОРІЮ (наприклад, для стяжки чи штукатурки — 'c1-1' або 'c1-3', для плитки — 'c4-1', для кабелю — 'c6-1').
             - Якщо точну підкатегорію важко обрати, вкажи ID основної категорії.
             - Якщо товар НЕ є будівельним матеріалом чи інструментом, або його неможливо віднести до жодної з наведених категорій — ОБОВ'ЯЗКОВО встанови categoryId: "other".`,
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
            isRealProductPhoto: {
              type: Type.BOOLEAN,
              description: "Чи зображено реальний фізичний товар або його упаковку (false для скріншотів, чеків, документів)",
            },
            isDocumentOrScreenshot: {
              type: Type.BOOLEAN,
              description: "Чи є фото скріншотом, чеком, накладною, рахунком чи документом",
            },
            rejectionReason: {
              type: Type.STRING,
              description: "Причина невідповідності (якщо є)",
            },
            categoryId: {
              type: Type.STRING,
              description: "ID категорії (наприклад, c1, c2, c3... або other)",
            },
          },

          required: [
            "title",
            "price",
            "description",
            "isRelevant",
            "isRealProductPhoto",
            "isDocumentOrScreenshot",
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
    const parsed = JSON.parse(resultText);
    if (!parsed.isRelevant || parsed.categoryId === "other" || parsed.categoryId === "other-unknown" || !parsed.categoryId) {
      parsed.categoryId = "other";
    }
    return parsed;
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
