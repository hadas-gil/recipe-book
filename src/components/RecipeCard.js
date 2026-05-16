'use client';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

const CATEGORY_LABELS = {
  salads: 'סלט',
  starters: 'ראשונה',
  mains: 'עיקרית',
  desserts: 'קינוח',
};

export default function RecipeCard({ recipe, onUpdate }) {
  const [loading, setLoading] = useState(false);

  async function toggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    await supabase
      .from('recipes')
      .update({ is_favorite: !recipe.is_favorite })
      .eq('id', recipe.id);
    onUpdate?.();
    setLoading(false);
  }

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`למחוק את "${recipe.title}"?`)) return;
    await supabase.from('recipes').delete().eq('id', recipe.id);
    onUpdate?.();
  }

  return (
    <Link href={`/recipe/${recipe.id}`} className="card block p-4 active:scale-[0.98] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[recipe.category] || recipe.category}
            </span>
            {recipe.is_favorite && <span className="text-sm">⭐</span>}
          </div>
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
            {recipe.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {recipe.servings} מנות · {recipe.ingredients?.length || 0} מרכיבים
          </p>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-gray-50 active:scale-90 transition-all"
            aria-label={recipe.is_favorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            {recipe.is_favorite ? '⭐' : '☆'}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl hover:bg-red-50 active:scale-90 transition-all text-gray-300 hover:text-red-400"
            aria-label="מחק מתכון"
          >
            🗑
          </button>
        </div>
      </div>
    </Link>
  );
}
