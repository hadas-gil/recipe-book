'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Header from '../../components/Header';
import RecipeCard from '../../components/RecipeCard';
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    supabase
      .from('recipes')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setResults(data || []);
        setLoading(false);
      });
  }, [query, tick]);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <p className="text-sm text-gray-500 mb-4">
        {results.length > 0 ? `נמצאו ${results.length} תוצאות עבור "${query}"` : `לא נמצאו תוצאות עבור "${query}"`}
      </p>
      <div className="space-y-3">
        {results.map(r => (
          <RecipeCard key={r.id} recipe={r} onUpdate={() => setTick(t => t + 1)} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense>
          <SearchResults />
        </Suspense>
      </main>
    </>
  );
}
