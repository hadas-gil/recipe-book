'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { id: 'salads', label: 'סלטים', emoji: '🥗' },
  { id: 'starters', label: 'ראשונות', emoji: '🥣' },
  { id: 'mains', label: 'עיקריות', emoji: '🍖' },
  { id: 'desserts', label: 'קינוחים', emoji: '🍰' },
];

export default function AddRecipeForm() {
  const router = useRouter();
  const [mode, setMode] = useState('url'); // 'url' | 'text'
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | preview | saving | error
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  async function handleParse() {
    if (!category) { setError('בחרי קטגוריה קודם'); return; }
    if (mode === 'url' && !url.trim()) { setError('הכניסי כתובת URL'); return; }
    if (mode === 'text' && !text.trim()) { setError('הכניסי את טקסט המתכון'); return; }
    setError('');
    setStatus('loading');
    try {
      const res = await fetch('/api/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'url' ? { url } : { text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.recipe);
      setStatus('preview');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  async function handleSave() {
    setStatus('saving');
    const { error: dbErr } = await supabase.from('recipes').insert({
      title: preview.title,
      category,
      ingredients: preview.ingredients,
      steps: preview.steps,
      servings: preview.servings || 4,
      source_url: mode === 'url' ? url : null,
      is_favorite: false,
    });
    if (dbErr) { setError('שגיאה בשמירה: ' + dbErr.message); setStatus('error'); return; }
    router.push('/');
  }

  if (status === 'preview' && preview) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="card p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{preview.title}</h2>
          <p className="text-sm text-gray-500">{preview.servings} מנות</p>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-gray-800 mb-3">מרכיבים</h3>
          <ul className="space-y-2">
            {preview.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-brand-400 rounded-full flex-shrink-0" />
                <span className="font-medium">{ing.name}</span>
                <span className="text-gray-500 mr-auto">
                  {ing.amount} {ing.unit}
                  {ing.notes ? ` (${ing.notes})` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-gray-800 mb-3">אופן הכנה</h3>
          <ol className="space-y-3">
            {preview.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3 pb-8">
          <button onClick={handleSave} disabled={status === 'saving'} className="btn-primary flex-1">
            {status === 'saving' ? 'שומר...' : '✓ שמור מתכון'}
          </button>
          <button onClick={() => setStatus('idle')} className="btn-secondary">
            ✎ ערוך
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="card p-4">
        <h2 className="font-bold text-gray-800 mb-3">קטגוריה</h2>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all
                ${category === cat.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
            >
              <span className="text-xl">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('url')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
              ${mode === 'url' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500'}`}
          >
            🔗 לינק
          </button>
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
              ${mode === 'text' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500'}`}
          >
            📝 טקסט
          </button>
        </div>

        {mode === 'url' ? (
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="הדביקי כתובת אתר של מתכון..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-brand-400"
            dir="ltr"
          />
        ) : (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="הדביקי כאן את המתכון (מרכיבים + אופן הכנה)..."
            rows={8}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-brand-400 resize-none"
          />
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleParse}
        disabled={status === 'loading'}
        className="btn-primary w-full text-base"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            מעבד מתכון...
          </span>
        ) : '✨ חלצי מתכון'}
      </button>

      <p className="text-xs text-center text-gray-400 pb-4">
        הבינה המלאכותית תחלץ את המרכיבים ושלבי ההכנה אוטומטית
      </p>
    </div>
  );
}
