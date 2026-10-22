import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORY_DATA } from "~/constants/category/category";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  let title = "";
  let description = "";
  let categoryId = "";
  let imageUrls: string[] = [];
  const inlineParts: Array<{ inlineData: { data: string; mimeType: string } }> = [];

  const contentType = getHeader(event, "content-type") || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const multipart = await readMultipartFormData(event);
      if (multipart) {
        for (const item of multipart) {
          if (item.name === "title") {
            title = item.data.toString("utf8");
          } else if (item.name === "description") {
            description = item.data.toString("utf8");
          } else if (item.name === "categoryId") {
            categoryId = item.data.toString("utf8");
          } else if (item.name === "images" || item.name === "image" || item.type?.startsWith("image/")) {
            inlineParts.push({
              inlineData: {
                data: item.data.toString("base64"),
                mimeType: item.type || "image/jpeg",
              },
            });
          }
        }
      }
    } else {
      const body = await readBody(event);
      title = body?.title || "";
      description = body?.description || "";
      categoryId = body?.categoryId || "";
      imageUrls = Array.isArray(body?.imageUrls) ? body.imageUrls : [];

      // Завантажуємо зображення за URL для передачі в Gemini
      for (const url of imageUrls.slice(0, 5)) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const mime = res.headers.get("content-type") || "image/jpeg";
            inlineParts.push({
              inlineData: {
                data: Buffer.from(arrayBuffer).toString("base64"),
                mimeType: mime,
              },
            });
          }
        } catch (fetchErr) {
          console.warn("Помилка завантаження фото для модерації:", url, fetchErr);
        }
      }
    }
  } catch (parseError) {
    console.warn("Помилка парсингу запиту модерації:", parseError);
  }

  // Якщо обрано службову категорію "Не знайшов будівельну категорію" — обов'язкова ручна модерація
  if (categoryId === 'other' || categoryId === 'other-unknown') {
    return {
      isApproved: false,
      requiresManualReview: true,
      reason: "Категорію не визначено (надіслано на ручну модерацію)",
    };
  }

  // Fail-safe: якщо API ключ не налаштований або сервіс недоступний — відправляємо на ручну модерацію
  if (!config.geminiApiKey) {
    console.warn("Gemini API key is missing. Moderation routed to manual review.");
    return {
      isApproved: false,
      requiresManualReview: true,
      reason: "Сервіс автоматичної модерації не налаштовано",
    };
  }

  const categoriesList = CATEGORY_DATA.map((cat) => {
    const subs = cat.subcategories.map((s) => `${s.id}: ${s.name}`).join(", ");
    return `${cat.id}: ${cat.name} (${subs})`;
  }).join("\n");

  const promptText = `Ти — суворий автоматичний модератор платформи BudStock (локальний маркетплейс будівельних матеріалів, інструментів та залишків ремонту).

Ось повний перелік дозволених категорій платформи BudStock:
${categoriesList}

Дані оголошення для перевірки:
- Назва: "${title}"
- Опис: "${description}"
- Обраний ID категорії: "${categoryId || "не вказано"}"

ТВОЄ ЗАВДАННЯ:
Проаналізуй подані фотографії (ВСІ надані зображення) разом із назвою та описом.

ПРАВИЛА МОДЕРАЦІЇ:
1. Відповідність тематиці платформи:
   Товар ПОВИНЕН бути будівельним матеріалом, оздоблювальним матеріалом, інструментом (ручним чи електро), сантехнікою, електрикою, кріпленням, спецодягом або залишком після ремонту, що підпадає під будь-яку з наведених вище категорій BudStock.
   УВАГА: Не будь надмірно прискіпливим, якщо обрано загальну або близьку суміжну будівельну категорію (наприклад, суміші замість шпаклівки). Головне правило — сам товар на фото та в тексті МАЄ БУТИ будівельним або ремонтним!
   Якщо ж товар або будь-яке з фото є непрофільним (одяг/взуття, побутові речі, телефони, ноутбуки, їжа, напої, косметика, тварини, автомобілі, меблі не для ремонту) — ОБОВ'ЯЗКОВО встанови isApproved: false та вкажи коротку причину (наприклад: "Не відповідає будівельним категоріям: побутовий товар").

2. Безпека контенту (Safety):
   Категорично ЗАБОРОНЕНО:
   - Зброя, ножі, вибухівка, боєприпаси.
   - Наркотичні чи психотропні речовини.
   - Оголеність, еротика, порнографія.
   - Нецензурна лексика, образи, розпалювання ворожнечі.
   - Шахрайські схеми, підозрілі посилання, відвертий спам або безглуздий набір символів.
   Якщо хоча б на ОДНОМУ з наданих фото або в тексті є заборонений або небезпечний контент — ОБОВ'ЯЗКОВО встанови isApproved: false та вкажи причину.

3. Невідповідність між фото та описом:
   Якщо фото і текст абсолютно суперечать одне одному (наприклад, фото цегли, а текст продає косметику чи знайомства) — встанови isApproved: false.

4. Реальні фотографії товару (заборона скріншотів та документів):
   Фотографії оголошення обов'язково повинні містити реальний фізичний товар, будівельний матеріал чи його упаковку.
   Якщо на ВСІХ наданих фото зображено виключно скріншоти екрану (сайтів, інтернет-магазинів, месенджерів), паперові чи електронні документи (чеки, накладні, рахунки, квитанції, таблиці) або графіку з текстом замість реальних фото самого матеріалу/інструменту — ОБОВ'ЯЗКОВО встанови isApproved: false та вкажи причину: "Оголошення не містить реального фото товару (завантажено скріншоти або документи)".

Якщо всі фото та текст безпечні й відповідають будівельній тематиці BudStock та містять реальний товар:
Встанови isApproved: true та reason: null.`;

  try {
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

    const contents: any[] = [...inlineParts, { text: promptText }];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            isApproved: {
              type: Type.BOOLEAN,
              description: "Чи схвалено оголошення для автоматичної публікації в каталог",
            },
            reason: {
              type: Type.STRING,
              description: "Коротка зрозуміла причина українською мовою, якщо isApproved: false",
            },
          },
          required: ["isApproved"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(resultText);
    const rawReason = parsed.reason;
    const cleanReason = (!rawReason || rawReason === "null" || rawReason === "None") ? null : rawReason;

    return {
      isApproved: Boolean(parsed.isApproved),
      reason: cleanReason,
      requiresManualReview: !parsed.isApproved,
    };
  } catch (error: any) {
    console.warn("AI Moderation error / timeout / quota exceeded. Routing to manual review:", error?.message || error);
    // НАДІЙНИЙ FAIL-SAFE: не кидаємо 500 і не блокуємо користувача, а відправляємо на ручну модерацію
    return {
      isApproved: false,
      requiresManualReview: true,
      reason: "Потрібна перевірка модератором (автоматична перевірка тимчасово недоступна)",
    };
  }
});
