import { GoogleGenAI, Type } from "@google/genai";

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

  const promptText = `Ти — помічник продавця на маркетплейсі будівельних матеріалів BudStock.
Склади грамотний, лаконічний, інформативний опис українською мовою для оголошення за його назвою.

Назва товару: "${title}"

ВИМОГИ ДО ОПИСУ:
1. 2-3 змістовних речення (без зайвої "води", без рекламного пафосу та без вигаданих неіснуючих характеристик чи цифр).
2. Зазнач призначення матеріалу/товару, де та для яких робіт застосовується, його основні практичні властивості.
3. Не згадуй стан товару (новий, залишок тощо), стан упаковки чи причину продажу — лише опис самого матеріалу.
4. Опис має бути готовим до публікації текстом.`;

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
            description: {
              type: Type.STRING,
              description: "Готовий опис товару українською мовою",
            },
          },
          required: ["description"],
        },
      },
    });

    const resultText = response.text;
    const parsed = JSON.parse(resultText || "{}");

    return {
      description: parsed.description || "",
    };
  } catch (error: any) {
    console.error("Error generating description:", error);
    throw createError({
      statusCode: 500,
      message: "Не вдалося згенерувати опис",
    });
  }
});
