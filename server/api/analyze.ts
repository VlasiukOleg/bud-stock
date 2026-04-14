import { GoogleGenAI, Type } from "@google/genai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const formData = await readMultipartFormData(event);
  const file = formData?.find((item) => item.name === "image");

  if (!file)
    throw createError({ statusCode: 400, message: "Фото не знайдено" });

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    const response = await ai.models.generateContent({
      // Використовуємо рекомендовану модель з твого файлу
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: file.data.toString("base64"),
            mimeType: file.type || "image/jpeg",
          },
        },
        "Проаналізуй це фото товару. Поверни заголовок, Опис невеличкий, проаналізуй ціни в Інтернет - магазинах на цей товар і дай середню",
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
          },
          required: ["title", "price"],
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
