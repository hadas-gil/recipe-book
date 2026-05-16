'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Header from '../../../components/Header';
import { useWakeLock } from '../../../hooks/useWakeLock';

function scaleAmount(amount, ratio) {
  const scaled = amount * ratio;
  const fractions = [0.125, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4];
  const closest = fractions.reduce((a, b) => Math.abs(b - scaled) < Math.abs(a - scaled) ? b : a);
  if (Math.abs(closest - scaled) < 0.15) {
    const map = { 0.125: '⅛', 0.25: '¼', 0.33: '⅓', 0.5: '½', 0.67: '⅔', 0.75: '¾' };
    return map[closest] || (Number.isInteger(closest) ? closest : closest.toFixed(1));
  }
  return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
}

const SERVING_OPTIONS = [
  { label: '¼', value: 0.25 },
  { label: '½', value: 0.5 },
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
  { label: '3×', value: 3 },
];

export default function RecipePage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [multiplier, setMultiplier] = useState(1);
  const [wakeLockOn, setWakeLockOn] = useState(false);
  const [doneSteps, setDoneSteps] = useState(new Set());

  useWakeLock(wakeLockOn);

  const load = useCallback(async () => {
    const { data } = await supabase.from('recipes').select('*').eq('id', id).single();
    setRecipe(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function toggleFavorite() {
    await supabase.from('recipes').update({ is_favorite: !recipe.is_favorite }).eq('id', recipe.id);
    setRecipe(r => ({ ...r, is_favorite: !r.is_favorite }));
  }

  async function deleteRecipe() {
    if (!confirm(`למחוק את "${recipe.title}"?`)) return;
    await supabase.from('recipes').delete().eq('id', recipe.id);
    router.push('/');
  }

  function toggleStep(i) {
    setDoneSteps(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!recipe) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">מתכון לא נמצא</p>
    </div>
  );

  const ratio = multiplier;

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-5 pb-24 space-y-5">

        {/* כותרת */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900 leading-tight flex-1">{recipe.title}</h1>
            <div className="flex gap-1">
              <button onClick={toggleFavorite} className="p-2 rounded-xl active:scale-90 transition-all text-xl">
                {recipe.is_favorite ? '⭐' : '☆'}
              </button>
              <button onClick={deleteRecipe} className="p-2 rounded-xl active:scale-90 transition-all text-xl">
                🗑
              </button>
            </div>
          </div>
          {recipe.source_url && (
            <a href={recipe.source_url} target="_blank" rel="noreferrer"
              className="text-xs text-brand-500 mt-2 block truncate">
              🔗 מקור
            </a>
          )}
        </div>

        {/* שינוי כמויות */}
        <div className="card p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            כמות: {recipe.servings > 0 ? Math.round(recipe.servings * ratio) : '—'} מנות
          </p>
          <div className="flex gap-2">
            {SERVING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setMultiplier(opt.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all
                  ${multiplier === opt.value ? 'bg-brand-500 text-white shadow' : 'bg-gray-100 text-gray-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* מרכיבים */}
        <div className="card p-4">
          <h2 className="font-bold text-gray-800 text-base mb-3">מרכיבים</h2>
          <ul className="space-y-2.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 bg-brand-400 rounded-full flex-shrink-0" />
                <span className="flex-1 font-medium text-gray-800">{ing.name}</span>
                <span className="text-gray-500 font-medium text-left" dir="ltr">
                  {scaleAmount(ing.amount, ratio)} {ing.unit}
                </span>
                {ing.notes ? <span className="text-xs text-gray-400">({ing.notes})</span> : null}
              </li>
            ))}
          </ul>
        </div>

        {/* שלבי הכנה */}
        <div className="card p-4">
          <h2 className="font-bold text-gray-800 text-base mb-3">אופן הכנה</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li
                key={i}
                onClick={() => toggleStep(i)}
                className={`flex gap-3 text-sm cursor-pointer transition-opacity ${doneSteps.has(i) ? 'opacity-40' : ''}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                  ${doneSteps.has(i) ? 'bg-green-400 text-white' : 'bg-brand-500 text-white'}`}>
                  {doneSteps.has(i) ? '✓' : i + 1}
                </span>
                <span className={`text-gray-700 leading-relaxed pt-0.5 ${doneSteps.has(i) ? 'line-through' : ''}`}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* כפתור מסך דולק */}
        <button
          onClick={() => setWakeLockOn(w => !w)}
          className={`w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
            ${wakeLockOn ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : 'bg-gray-100 text-gray-600'}`}
        >
          {wakeLockOn ? '☀️ מסך דולק – לחצי לכיבוי' : '🌙 לחצי כדי שהמסך לא יכבה בזמן בישול'}
        </button>

      </main>
    </>
  );
}
