import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const PARSE_PROMPT = `אתה עוזר שמחלץ מתכונים מטקסט.
החזר תמיד JSON תקין בלבד, ללא הסברים נוספים, בפורמט הזה:
{
  "title": "שם המתכון בעברית",
  "servings": 4,
  "ingredients": [
    { "name": "שם המרכיב", "amount": 1, "unit": "כוס", "notes": "" }
  ],
  "steps": ["שלב 1...", "שלב 2..."]
}

כללי המרת יחידות (חובה):
- מיליליטר → כוס (240מ"ל) / כף (15מ"ל) / כפית (5מ"ל)
- גרמים לפי המרכיב:
  קמח: 120 גרם = כוס אחת
  סוכר: 200 גרם = כוס אחת
  אבקת סוכר: 120 גרם = כוס אחת
  קקאו/אבקת אפייה: 85 גרם = כוס אחת
  חמאה/שמנת: 200 גרם = כוס אחת
  שמן: 220 גרם = כוס אחת
  גבינה מגוררת: 100 גרם = כוס אחת
  אגוזים/שקדים קצוצים: 100 גרם = כוס אחת
  עגבניות/ירקות קצוצים: 150 גרם = כוס אחת
  קורנפלור: 100 גרם = כוס אחת
  שיבולת שועל: 90 גרם = כוס אחת
  בשר טחון: 225 גרם = כוס אחת
- בשר/עוף/דגים שלמים: השאר בגרמים (unit: "גרם")
- ירקות שלמים: השאר ביחידות (unit: "יחידה")
- תבלינים כמו מלח/פלפל: כפית/כף
- המרה לכוסות: עגל לחצי כוס הקרוב (0.25, 0.5, 0.75, 1, 1.5, 2 וכו')
- עדיף כפות/כפיות על גרמים לכמויות קטנות של תבלינים ותוספות
- אל תכלול שמן לטיגון, נייר אפייה או ציוד בתור מרכיבים
- תרגם הכל לעברית כולל שם המתכון ושלבי ההכנה
- שלבי ההכנה: כל שלב משפט אחד ברור, בעברית`;

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  return article ? `${article.title}\n\n${article.textContent}` : html.replace(/<[^>]+>/g, ' ');
}

export async function POST(request) {
  try {
    const { url, text } = await request.json();
    let content = text || '';

    if (url) {
      try {
        content = await fetchUrl(url);
      } catch (err) {
        return Response.json({ error: 'לא הצלחתי לגשת לכתובת הזו. נסי להדביק את תוכן המתכון ישירות.' }, { status: 400 });
      }
    }

    if (!content.trim()) {
      return Response.json({ error: 'לא נמצא תוכן' }, { status: 400 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${PARSE_PROMPT}\n\nהמתכון:\n${content.slice(0, 12000)}` }] }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );
    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      throw new Error(`Gemini ${geminiRes.status}: ${errBody}`);
    }
    const geminiData = await geminiRes.json();
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      ?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const recipe = JSON.parse(raw);

    if (!recipe.title || !recipe.ingredients || !recipe.steps) {
      throw new Error('מבנה שגוי');
    }

    return Response.json({ recipe });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Response.json({ error: 'לא הצלחתי לפרסר את המתכון. נסי שוב.' }, { status: 500 });
    }
    return Response.json({ error: err.message || 'שגיאה לא צפויה' }, { status: 500 });
  }
}
