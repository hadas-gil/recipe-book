'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const isHome = pathname === '/';

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-3">
        {isHome ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-brand-600">🍳 ספר המתכונים שלי</h1>
              <Link href="/add"
                className="bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all">
                + הוסף מתכון
              </Link>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="חפשי מתכון..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:border-brand-400"
              />
              {query && (
                <button type="submit" className="bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                  חפשי
                </button>
              )}
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-500 p-1 -mr-1">
              <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-800 truncate">
              {pathname === '/add' ? 'הוספת מתכון' : pathname.startsWith('/search') ? 'תוצאות חיפוש' : 'מתכון'}
            </h1>
          </div>
        )}
      </div>
    </header>
  );
}
