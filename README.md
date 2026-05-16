# ספר המתכונים שלי

## הוראות התקנה (עשי פעם אחת)

### שלב 1 – GitHub
1. כנסי לאתר https://github.com ולחצי על **Sign up**
2. בחרי שם משתמש, אימייל וסיסמה
3. לאחר ההרשמה, לחצי על **+** (למעלה) → **New repository**
4. שם ה-repository: `recipe-book`
5. בחרי **Public** ולחצי **Create repository**
6. לחצי על **uploading an existing file**
7. גרגרי את כל התיקייה `recipe-book` לתוך הדפדפן והעלי

### שלב 2 – Supabase (מסד הנתונים)
1. כנסי לאתר https://supabase.com ולחצי על **Start your project**
2. הרשמי עם Google או אימייל
3. לחצי על **New project** – בחרי שם (למשל `recipe-book`) וסיסמה חזקה
4. המתיני כ-2 דקות עד שהפרויקט מוכן
5. לחצי בתפריט הצד על **SQL Editor**
6. פתחי את הקובץ `supabase-schema.sql` מהתיקייה שלך, העתיקי את כולו והדביקי בחלון ה-SQL Editor
7. לחצי **Run**
8. כנסי להגדרות: **Settings → API**
9. העתיקי את **Project URL** ואת **anon public** key – תצטרכי אותם בשלב 4

### שלב 3 – Gemini API (הבינה המלאכותית)
1. כנסי לאתר https://aistudio.google.com
2. לחצי על **Get API key → Create API key**
3. העתיקי את המפתח ושמרי אותו

### שלב 4 – Vercel (הפעלת האתר)
1. כנסי לאתר https://vercel.com ולחצי על **Sign Up with GitHub**
2. לחצי על **Add New Project**
3. בחרי את ה-repository `recipe-book` שיצרת
4. לפני שלוחצים Deploy, לחצי על **Environment Variables** והוסיפי:
   - `NEXT_PUBLIC_SUPABASE_URL` = הURL מ-Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = ה-anon key מ-Supabase
   - `GEMINI_API_KEY` = המפתח מ-Google AI Studio
5. לחצי **Deploy** – תוך 2-3 דקות האתר שלך עולה!
6. Vercel תיתן לך כתובת URL (משהו כמו `recipe-book-xxx.vercel.app`) – זה האתר שלך

### התקנה על הנייד (אופציונלי)
- ב-iPhone: פתחי את האתר ב-Safari → לחצי על כפתור השיתוף → "הוסף למסך הבית"
- ב-Android: Chrome → שלוש נקודות → "הוסף למסך הבית"
