'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import CategoryGrid from '../components/CategoryGrid';
import RecipeCard from '../components/RecipeCard';
import Link from 'next/link';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [counts, setCounts] = useState({});

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    const all = data || [];
    setRecipes(all);
    const c = {};
    all.forEach(r => { c[r.category] = (c[r.category] || 0) + 1; });
    c.favorites = all.filter(r => r.is_favorite).length;
    setCounts(c);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = recipes.filter(r => {
    if (category === 'all') return true;
    if (category === 'favorites') return r.is_favorite;
    return r.category === category;
  });

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        <CategoryGrid active={category} onChange={setCategory} counts={counts} />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-5xl">🍽️</p>
            <p className="text-gray-500 font-medium">
              {recipes.length === 0 ? 'ספר המתכונים שלך ריק עדיין' : 'אין מתכונים בקטגוריה זו'}
            </p>
            {recipes.length === 0 && (
              <Link href="/add" className="btn-primary inline-block mt-2">
                + הוסיפי את המתכון הראשון
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {filtered.map(r => (
              <RecipeCard key={r.id} recipe={r} onUpdate={load} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
