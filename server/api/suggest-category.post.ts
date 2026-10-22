import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORY_DATA } from "~/constants/category/category";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const title = body?.title?.trim();

  if (!title) {
    throw createError({ statusCode: 400, message: "Назва товару обов'язкова" });
  }

  if (!config.geminiApiKey) {
    throw createError({ statusCode: 500, message: "Gemini API key is missing" });
  }

  const categoriesList = CATEGORY_DATA.map((cat) => {
    const subs = cat.subcategories.map((s) => `${s.id}: ${s.name}`).join(", ");
    return `${cat.id}: ${cat.name} (${subs})`;
  }).join("\n");

  const promptText = `Ти — експерт з класифікації будівельних матеріалів, ремонту та інструментів платформи BudStock.

Ось повний перелік категорій та підкатегорій:
${categoriesList}

Назва товару: "${title}"

ЗАВДАННЯ:
1. Обери найбільш точний ID підкатегорії (наприклад 'c1-1', 'c4-5', 'c5-6', 'c1-3' тощо).
2. Якщо точну підкатегорію важко визначити, але зрозуміла головна група, вкажи ID основної категорії (наприклад 'c1', 'c4').
3. Якщо товар абсолютно не стосується будівельної тематики або не підходить до жодної категорії, встанови categoryId: "other".`;

  try {
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [{ text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            categoryId: {
              type: Type.STRING,
              description: "Точний ID категорії чи підкатегорії зі списку (або other)",
            },
          },
          required: ["categoryId"],
        },
      },
    });

    const resultText = response.text;
    const parsed = JSON.parse(resultText || "{}");
    const categoryId = (parsed.categoryId === "null" || parsed.categoryId === "None" || !parsed.categoryId || parsed.categoryId === "other" || parsed.categoryId === "other-unknown") ? "other" : parsed.categoryId;

    return {
      categoryId,
    };
  } catch (error: any) {
    console.error("Error suggesting category:", error);
    throw createError({
      statusCode: 500,
      message: "Не вдалося підібрати категорію",
    });
  }
});
